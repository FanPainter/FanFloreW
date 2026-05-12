# 介绍
## 术语
- hi：CPU 开销中硬终端消耗的部分
- si：CPU 开销中软中断消耗的部分
- skb：struck sk_buff 对象的简称。该对象是 Linux 网络模块中的核心结构体，各个层用到的数据包都是存在这个结构体里的。
- NAPI：Linux 2.5 后内核引入的一种高效网卡数据处理技术，先用中断唤醒内核接收数据，后续采用 poll 轮询从网卡设备获取数据，通过减少中断次数来提高处理网卡数据的效率。
- MSI/MSIx：Message Signal Interrupt，是一种触发 CPU 中断的方式

# 数据是如何从网卡到协议栈的
![[TCP-IP网络分层模型.png]]

TCP/IP 分层模型中，整个协议栈被分为了物理层、链路层、网络层、传输层和应用层。应用层对应的是常见的 Nginx、FTP 等各种应用，也包括写的服务端程序。Linux 内核以及网卡驱动主要是实现链路层、网络层和传输层这三层上的功能，内核为更上面的应用层提供 socket 接口来支持用户进程访问。

在Linux的源码中，网络设备驱动对应的逻辑位于 driver/net/ethernet，其中 Intel 系列网卡的驱动在 driver/net/etheret/intel 目录下，协议栈模块代码位于 kernel和 net 目录下。

**内核和网络设备驱动是通过中断的方式来处理的**：当设备上有数据到达时，会给 CPU 的相关引脚触发一个电压变化，以通知 CPU 来处理数据。对于网络模块来说，由于处理过程比较复杂和耗时，如果在中断函数中完成所有的处理，将会导致中断处理函数（优先级过高）过度占用CPU，使得 CPU 无法响应其他设备，例如鼠标和键盘的消息。因此 Linux 中断处理函数是分上半部和下半部的。上半部只进行最简单的工作，快速处理然后释放 CPU，接着 CPU 就可以允许其他中断进来。将剩下的绝大部分的工作都放到下半部，可以慢慢、从容处理。2.4 以后的 Linux 内核版本采用的下半部实现方式是软中断，由 ksoftirqd 内核线程全权处理。硬中断是通过给 CPU 物理引脚施加电压变化实现的，而软中断是通过给内存中的一个变量赋予二进制值以标记有软中断发生。

大概了解了网卡驱动、硬中断、软中断和 ksoftirqd 线程之后，在这几个概念的基础上给出一个内核收包的路径示意图，如下图

![[内核收包路径.png]]

当网卡收到数据以后，以 DMA 的方式把网卡收到的帧写到内存里，再向 CPU 发起一个中断，以通知 CPU 有数据到达。当 CPU 收到中断请求后，会去调用网络设备驱动注册的中断处理函数。网卡的中断处理函数并不做过多工作，发出软中断请求，然后尽快释放 CPU 资源。ksoftirqd 内核线程检测到有软中断请求到达，调用 poll 开始轮询收包，收到后交由各级协议栈处理。对于 TCP 包来说，会被放到用户 socket 的接收队列中。
## Linux 启动
Linux 驱动、内核协议栈等模块在能够接收网卡数据包之前，要做很多的准备工作才行。比如要提前创建好 ksoftirqd 内核线程，要注册好各个协议对应的处理函数，网卡设备子系统要提前初始化好，网卡要启动好。只有这些都准备好后，才能真正开始接收数据包
**创建ksoftirqd内核线程**：Linux 的软中断都是在专门的内核线程（ksoftirqd）中进行的，因此有必要看一下这些线程是怎么初始化的，这样才能在后面更准确地了解收包过程。该线程数量不是 1 个，而是 N 个，其中 N 等于你的机器的核数。

系统初始化的时候在 kernel/smpboot.c 中调用了 smpboot_register_percpu_thread，该函数进一步会执行到 spawn_ksoftirqd（位于 kernel/softirq.c）来创建出 softirqd 线程，如下图
![[创建ksoftirqd.png]]

```c
// kernel/softirq,c
static struct smp_hotplug_thread softirq_threads = {
	.store			= &ksoftirqd,
	.thread_should_run	= ksoftirqd_should_run,
	.thread_fn		= run_ksoftirqd,
	.thread_comm		= "ksoftirqd/%u",
};
```

```c
static __init int spawn_ksoftirqd(void)
{
	cpuhp_setup_state_nocalls(CPUHP_SOFTIRQ_DEAD, "softirq:dead", NULL,
				  takeover_tasklets);
	BUG_ON(smpboot_register_percpu_thread(&softirq_threads));
#ifdef CONFIG_IRQ_FORCED_THREADING
	if (force_irqthreads())
		BUG_ON(smpboot_register_percpu_thread(&timer_thread));
#endif
	return 0;
}
early_initcall(spawn_ksoftirqd);
```
当 ksoftirqd 被创建出来以后，它就会进入自己的线程循环函数 ksoftirqd_should_run 和run_ksoftirqd 了。接下来判断有没有软中断需要处理。这里需要注意的一点是，软中断不仅有网络软中断，还有其他类型。Linux 内核在 interrupt.h 中定义了所有的软中断类型
```c
enum
{
	HI_SOFTIRQ=0,
	TIMER_SOFTIRQ,
	NET_TX_SOFTIRQ,
	NET_RX_SOFTIRQ,
	BLOCK_SOFTIRQ,
	IRQ_POLL_SOFTIRQ,
	TASKLET_SOFTIRQ,
	SCHED_SOFTIRQ,
	HRTIMER_SOFTIRQ,
	RCU_SOFTIRQ,    /* Preferable RCU should always be the last softirq */

	NR_SOFTIRQS
};
```

**网络子系统初始化**：在网络子系统的初始化过程中，会为每个CPU初始化softnet_data，也会为RX_SOFTIRQ和TX SOFTIRQ注册处理函数，流程如下图
![[网络子系统初始化.png]]Linux内核通过调用subsys_initcall来初始化各个子系统，在源代码目录里可以用grep命令搜索出许多对这个函数的调用。这里要说的是网络子系统的初始化，会执行net_dev_init函数。
```c
// net/core/dev.c
/*
 *       This is called single threaded during boot, so no need
 *       to take the rtnl semaphore.
 */
static int __init net_dev_init(void)
{
	int i, rc = -ENOMEM;

	BUG_ON(!dev_boot_phase);

	net_dev_struct_check();

	if (dev_proc_init())
		goto out;

	if (netdev_kobject_init())
		goto out;

	for (i = 0; i < PTYPE_HASH_SIZE; i++)
		INIT_LIST_HEAD(&ptype_base[i]);

	if (register_pernet_subsys(&netdev_net_ops))
		goto out;

	/*
	 *	Initialise the packet receive queues.
	 */

	flush_backlogs_fallback = flush_backlogs_alloc();
	if (!flush_backlogs_fallback)
		goto out;

	for_each_possible_cpu(i) {
		struct softnet_data *sd = &per_cpu(softnet_data, i);

		skb_queue_head_init(&sd->input_pkt_queue);
		skb_queue_head_init(&sd->process_queue);
#ifdef CONFIG_XFRM_OFFLOAD
		skb_queue_head_init(&sd->xfrm_backlog);
#endif
		INIT_LIST_HEAD(&sd->poll_list);
		sd->output_queue_tailp = &sd->output_queue;
#ifdef CONFIG_RPS
		INIT_CSD(&sd->csd, rps_trigger_softirq, sd);
		sd->cpu = i;
#endif
		INIT_CSD(&sd->defer_csd, trigger_rx_softirq, sd);

		gro_init(&sd->backlog.gro);
		sd->backlog.poll = process_backlog;
		sd->backlog.weight = weight_p;
		INIT_LIST_HEAD(&sd->backlog.poll_list);

		if (net_page_pool_create(i))
			goto out;
	}
	net_hotdata.skb_defer_nodes =
		 __alloc_percpu(sizeof(struct skb_defer_node) * nr_node_ids,
				__alignof__(struct skb_defer_node));
	if (!net_hotdata.skb_defer_nodes)
		goto out;
	if (use_backlog_threads())
		smpboot_register_percpu_thread(&backlog_threads);

	dev_boot_phase = 0;

	/* The loopback device is special if any other network devices
	 * is present in a network namespace the loopback device must
	 * be present. Since we now dynamically allocate and free the
	 * loopback device ensure this invariant is maintained by
	 * keeping the loopback device as the first device on the
	 * list of network devices.  Ensuring the loopback devices
	 * is the first device that appears and the last network device
	 * that disappears.
	 */
	if (register_pernet_device(&loopback_net_ops))
		goto out;

	if (register_pernet_device(&default_device_ops))
		goto out;

	open_softirq(NET_TX_SOFTIRQ, net_tx_action);
	open_softirq(NET_RX_SOFTIRQ, net_rx_action);

	rc = cpuhp_setup_state_nocalls(CPUHP_NET_DEV_DEAD, "net/dev:dead",
				       NULL, dev_cpu_dead);
	WARN_ON(rc < 0);
	rc = 0;

	/* avoid static key IPIs to isolated CPUs */
	if (housekeeping_enabled(HK_TYPE_MISC))
		net_enable_timestamp();
out:
	if (rc < 0) {
		for_each_possible_cpu(i) {
			struct page_pool *pp_ptr;

			pp_ptr = per_cpu(system_page_pool.pool, i);
			if (!pp_ptr)
				continue;

			xdp_unreg_page_pool(pp_ptr);
			page_pool_destroy(pp_ptr);
			per_cpu(system_page_pool.pool, i) = NULL;
		}
	}

	return rc;
}

subsys_initcall(net_dev_init);
```
在这个函数里，会为每个CPU都申请一个softnet_data数据结构，这个数据结构里的poll_list用于等待驱动程序将其poll函数注册进来，稍后网卡驱动程序初始化的时候可以看到这一过程。

另外，open_softirq为每一种软中断都注册一个处理函数。NET_TX_SOFTIRQ的处理函数为net_tx_action，NET_RX_SOFTIRQ的处理函数为net_rx_action。继续跟踪open_softirq后发现这个注册的方式是记录在softirq_vec变量里的。后面ksoftirqd线程收到软中断的时候，也会使用这个变量来找到每一种软中断对应的处理函数。
```c
// kernel/softirq.c
void open_softirq(int nr, void (*action)(void))
{
	softirq_vec[nr].action = action;
}
```

**协议栈注册**：内核实现了网络层的IP协议，也实现了传输层的TCP协议和UDP协议。这些协议对应的实现函数分别是ip_rcv()、tcp_v4_rcv()和udp_rcv()。和平时写代码的方式不一样的是，内核是通过注册的方式来实现的。Linux内核中的fs_initcall和subsys_initcall类似，也是初始化模块的入口。fs_initcall调用inet_init后开始网络协议栈注册，通过inet_init，将这些函数注册到inet_protos和ptype_base数据结构中，如下图
![[协议栈注册.png]]
```c
// net/ipv4/af_inet.c
static struct packet_type ip_packet_type __read_mostly = {
	.type = cpu_to_be16(ETH_P_IP),
	.func = ip_rcv,
	.list_func = ip_list_rcv,
};

net_hotdata.udp_protocol = (struct net_protocol) {
		.handler =	udp_rcv,
		.err_handler =	udp_err,
		.no_policy =	1,
	};
	if (inet_add_protocol(&net_hotdata.udp_protocol, IPPROTO_UDP) < 0)
		pr_crit("%s: Cannot add UDP protocol\n", __func__);

	net_hotdata.tcp_protocol = (struct net_protocol) {
		.handler	=	tcp_v4_rcv,
		.err_handler	=	tcp_v4_err,
		.no_policy	=	1,
		.icmp_strict_tag_validation = 1,
	};
	
	static int __init inet_init(void)
{
	struct inet_protosw *q;
	struct list_head *r;
	int rc;

	sock_skb_cb_check_size(sizeof(struct inet_skb_parm));

	raw_hashinfo_init(&raw_v4_hashinfo);

	rc = proto_register(&tcp_prot, 1);
	if (rc)
		goto out;

	rc = proto_register(&udp_prot, 1);
	if (rc)
		goto out_unregister_tcp_proto;

	rc = proto_register(&raw_prot, 1);
	if (rc)
		goto out_unregister_udp_proto;

	rc = proto_register(&ping_prot, 1);
	if (rc)
		goto out_unregister_raw_proto;

	/*
	 *	Tell SOCKET that we are alive...
	 */

	(void)sock_register(&inet_family_ops);

#ifdef CONFIG_SYSCTL
	ip_static_sysctl_init();
#endif

	/*
	 *	Add all the base protocols.
	 */

	if (inet_add_protocol(&icmp_protocol, IPPROTO_ICMP) < 0)
		pr_crit("%s: Cannot add ICMP protocol\n", __func__);

	net_hotdata.udp_protocol = (struct net_protocol) {
		.handler =	udp_rcv,
		.err_handler =	udp_err,
		.no_policy =	1,
	};
	if (inet_add_protocol(&net_hotdata.udp_protocol, IPPROTO_UDP) < 0)
		pr_crit("%s: Cannot add UDP protocol\n", __func__);

	net_hotdata.tcp_protocol = (struct net_protocol) {
		.handler	=	tcp_v4_rcv,
		.err_handler	=	tcp_v4_err,
		.no_policy	=	1,
		.icmp_strict_tag_validation = 1,
	};
	if (inet_add_protocol(&net_hotdata.tcp_protocol, IPPROTO_TCP) < 0)
		pr_crit("%s: Cannot add TCP protocol\n", __func__);
#ifdef CONFIG_IP_MULTICAST
	if (inet_add_protocol(&igmp_protocol, IPPROTO_IGMP) < 0)
		pr_crit("%s: Cannot add IGMP protocol\n", __func__);
#endif

	/* Register the socket-side information for inet_create. */
	for (r = &inetsw[0]; r < &inetsw[SOCK_MAX]; ++r)
		INIT_LIST_HEAD(r);

	for (q = inetsw_array; q < &inetsw_array[INETSW_ARRAY_LEN]; ++q)
		inet_register_protosw(q);

	/*
	 *	Set the ARP module up
	 */

	arp_init();

	/*
	 *	Set the IP module up
	 */

	ip_init();

	/* Initialise per-cpu ipv4 mibs */
	if (init_ipv4_mibs())
		panic("%s: Cannot init ipv4 mibs\n", __func__);

	/* Setup TCP slab cache for open requests. */
	tcp_init();

	/* Setup UDP memory threshold */
	udp_init();

	raw_init();

	ping_init();

	/*
	 *	Set the ICMP layer up
	 */

	if (icmp_init() < 0)
		panic("Failed to create the ICMP control socket.\n");

	/*
	 *	Initialise the multicast router
	 */
#if defined(CONFIG_IP_MROUTE)
	if (ip_mr_init())
		pr_crit("%s: Cannot init ipv4 mroute\n", __func__);
#endif

	if (init_inet_pernet_ops())
		pr_crit("%s: Cannot init ipv4 inet pernet ops\n", __func__);

	ipv4_proc_init();

	ipfrag_init();

	dev_add_pack(&ip_packet_type);

	ip_tunnel_core_init();

	rc = 0;
out:
	return rc;
out_unregister_raw_proto:
	proto_unregister(&raw_prot);
out_unregister_udp_proto:
	proto_unregister(&udp_prot);
out_unregister_tcp_proto:
	proto_unregister(&tcp_prot);
	goto out;
}
```
从上面的代码中可以看到，udp_protocol结构体中的 handler 是 udp_rcv，tcp_protocol 结构体中的 handler 是 tcp_v4_rcv，它们通过 inet_add_protocol 函数被初始化进来。

```c
// net/ipv4/protocol.c
int inet_add_protocol(const struct net_protocol *prot, unsigned char protocol)
{
	return !cmpxchg((const struct net_protocol **)&inet_protos[protocol],
			NULL, prot) ? 0 : -1;
}
EXPORT_SYMBOL(inet_add_protocol);
```
inet_add_protocol函数将TCP和UDP对应的处理函数都注册到inet_protos数组中了。再看“dev_add_pack(&ip_packet_type);”这一行，ip_packet_type结构体中的type是协议名，func是ip_rcv函数，它们在dev_add_pack中会被注册到ptype_base哈希表中。

```c
// net/core/dev.c
void dev_add_pack(struct packet_type *pt)
{
	struct list_head *head = ptype_head(pt);

	if (WARN_ON_ONCE(!head))
		return;

	spin_lock(&ptype_lock);
	list_add_rcu(&pt->list, head);
	spin_unlock(&ptype_lock);
}
EXPORT_SYMBOL(dev_add_pack);


// ...

static inline struct list_head *ptype_head(const struct packet_type *pt)
{
	if (pt->type == htons(ETH_P_ALL)) {
		if (!pt->af_packet_net && !pt->dev)
			return NULL;

		return pt->dev ? &pt->dev->ptype_all :
				 &pt->af_packet_net->ptype_all;
	}

	if (pt->dev)
		return &pt->dev->ptype_specific;

	return pt->af_packet_net ? &pt->af_packet_net->ptype_specific :
				 &ptype_base[ntohs(pt->type) & PTYPE_HASH_MASK];
}

```
这里需要记住inet_protos记录着UDP、TCP的处理函数地址，ptype_base存储着ip_rcv()函数的处理地址。后面将讲到软中断中会通过ptype_base找到ip_rcv函数地址，进而将IP包正确地送到ip_rcv()中执行。在ip_rcv中将会通过inet_protos找到TCP或者UDP的处理函数，再把包转发给udp_rcv()或tcp_v4_rcv(函数。建议好好读一读inet_init这个函数的代码。

扩展一下，如果看一下ip_rcv和udp_rcv等函数的代码，能看到很多协议的处理过程。例如，ip_rcv中会处理iptable netfilter过滤，udp_rcv中会判断socket接收队列是否满了，对应的相关内核参数是net.core.rmem_max和net.core.rmem_default.

**网卡驱动初始化**：驱动程序)会使用module init向内核注册一个初始化函数，当驱动程序被加载时，内核会调用这个函数。比如igb网卡驱动程序的代码位于drivers/net/ethemnet/intel/igb/igb_main.c中。
```c
// drivers/net/ethernet/intel/igb/igb_main.c
static struct pci_driver igb_driver = {
	.name     = igb_driver_name,
	.id_table = igb_pci_tbl,
	.probe    = igb_probe,
	.remove   = igb_remove,
	.driver.pm = pm_ptr(&igb_pm_ops),
	.shutdown = igb_shutdown,
	.sriov_configure = igb_pci_sriov_configure,
	.err_handler = &igb_err_handler
};

// ...

/**
 *  igb_init_module - Driver Registration Routine
 *
 *  igb_init_module is the first routine called when the driver is
 *  loaded. All it does is register with the PCI subsystem.
 **/
static int __init igb_init_module(void)
{
	int ret;

	pr_info("%s\n", igb_driver_string);
	pr_info("%s\n", igb_copyright);

#ifdef CONFIG_IGB_DCA
	dca_register_notify(&dca_notifier);
#endif
	ret = pci_register_driver(&igb_driver);
#ifdef CONFIG_IGB_DCA
	if (ret)
		dca_unregister_notify(&dca_notifier);
#endif
	return ret;
}
```
驱动的pci_register_driver调用完成后，Linux内核就知道了该驱动的相关信息，比如igb网卡驱动的igb_driver_name和igb_probe函数地址，等等。当网卡设备被识别以后，内核会调用其驱动的probe方法(igb_driver的probe方法是igb_probe)。驱动的probe方法执行的目的就是让设备处于ready状态。对于igb网卡，其igb_probe位于drivers/net/ethernet/intel/igb/igb_main.c下。函数igb_probe主要执行的操作如下图
![[网卡驱动初始化.png]]可以看到在第5步中，网卡驱动实现了ethtool所需要的接口，也在这里完成函数地址的注册。当ethtool发起一个系统调用之后，内核会找到对应操作的回调函数。对于igb网卡来说，其实现函数都在drivers/net/ethernet/intelVigb/igb_ethtool.c下。你这次能彻底理解ethtool的工作原理了吧?这个命令之所以能查看网卡收发包统计、能修改网卡自适应模式、能调整RX队列的数量和大小，是因为ethtool命令最终调用到了网卡驱动的相应方法，而不是ethtool本身有这个超能力。

第6步注册igb_netdev_ops用的是igb_netdev_ops变量，其中包含igb_open等函数，该函数在网卡启动的时候会被调用。
```c
// drivers/net/ethernet/intel/igb/igb_main.c
static const struct net_device_ops igb_netdev_ops = {
	.ndo_open		= igb_open,
	.ndo_stop		= igb_close,
	.ndo_start_xmit		= igb_xmit_frame,
	.ndo_get_stats64	= igb_get_stats64,
	.ndo_set_rx_mode	= igb_set_rx_mode,
	.ndo_set_mac_address	= igb_set_mac,
	.ndo_change_mtu		= igb_change_mtu,
	.ndo_eth_ioctl		= igb_ioctl,
	.ndo_tx_timeout		= igb_tx_timeout,
	.ndo_validate_addr	= eth_validate_addr,
	.ndo_vlan_rx_add_vid	= igb_vlan_rx_add_vid,
	.ndo_vlan_rx_kill_vid	= igb_vlan_rx_kill_vid,
	.ndo_set_vf_mac		= igb_ndo_set_vf_mac,
	.ndo_set_vf_vlan	= igb_ndo_set_vf_vlan,
	.ndo_set_vf_rate	= igb_ndo_set_vf_bw,
	.ndo_set_vf_spoofchk	= igb_ndo_set_vf_spoofchk,
	.ndo_set_vf_trust	= igb_ndo_set_vf_trust,
	.ndo_get_vf_config	= igb_ndo_get_vf_config,
	.ndo_fix_features	= igb_fix_features,
	.ndo_set_features	= igb_set_features,
	.ndo_fdb_add		= igb_ndo_fdb_add,
	.ndo_features_check	= igb_features_check,
	.ndo_setup_tc		= igb_setup_tc,
	.ndo_bpf		= igb_xdp,
	.ndo_xdp_xmit		= igb_xdp_xmit,
	.ndo_xsk_wakeup         = igb_xsk_wakeup,
	.ndo_hwtstamp_get	= igb_ptp_hwtstamp_get,
	.ndo_hwtstamp_set	= igb_ptp_hwtstamp_set,
};
```

第7步在igb_probe初始化过程中，还调用到了igb_alloc_q_vector。它注册了一个NAPI机制必需的poll函数，对于igb网卡来说，这个函数就是 igb_poll
```c
// drivers/net/ethernet/intel/igb/igb_main.c
/**
 *  igb_alloc_q_vector - Allocate memory for a single interrupt vector
 *  @adapter: board private structure to initialize
 *  @v_count: q_vectors allocated on adapter, used for ring interleaving
 *  @v_idx: index of vector in adapter struct
 *  @txr_count: total number of Tx rings to allocate
 *  @txr_idx: index of first Tx ring to allocate
 *  @rxr_count: total number of Rx rings to allocate
 *  @rxr_idx: index of first Rx ring to allocate
 *
 *  We allocate one q_vector.  If allocation fails we return -ENOMEM.
 **/
static int igb_alloc_q_vector(struct igb_adapter *adapter,
			      int v_count, int v_idx,
			      int txr_count, int txr_idx,
			      int rxr_count, int rxr_idx)
{
	struct igb_q_vector *q_vector;
	struct igb_ring *ring;
	int ring_count;
	size_t size;

	/* igb only supports 1 Tx and/or 1 Rx queue per vector */
	if (txr_count > 1 || rxr_count > 1)
		return -ENOMEM;

	ring_count = txr_count + rxr_count;
	size = kmalloc_size_roundup(struct_size(q_vector, ring, ring_count));

	/* allocate q_vector and rings */
	q_vector = adapter->q_vector[v_idx];
	if (!q_vector) {
		q_vector = kzalloc(size, GFP_KERNEL);
	} else if (size > ksize(q_vector)) {
		struct igb_q_vector *new_q_vector;

		new_q_vector = kzalloc(size, GFP_KERNEL);
		if (new_q_vector)
			kfree_rcu(q_vector, rcu);
		q_vector = new_q_vector;
	} else {
		memset(q_vector, 0, size);
	}
	if (!q_vector)
		return -ENOMEM;

	/* initialize NAPI */
	netif_napi_add_config(adapter->netdev, &q_vector->napi, igb_poll,
			      v_idx);

	/* tie q_vector and adapter together */
	adapter->q_vector[v_idx] = q_vector;
	q_vector->adapter = adapter;

	/* initialize work limits */
	q_vector->tx.work_limit = adapter->tx_work_limit;

	/* initialize ITR configuration */
	q_vector->itr_register = adapter->io_addr + E1000_EITR(0);
	q_vector->itr_val = IGB_START_ITR;

	/* initialize pointer to rings */
	ring = q_vector->ring;

	/* initialize ITR */
	if (rxr_count) {
		/* rx or rx/tx vector */
		if (!adapter->rx_itr_setting || adapter->rx_itr_setting > 3)
			q_vector->itr_val = adapter->rx_itr_setting;
	} else {
		/* tx only vector */
		if (!adapter->tx_itr_setting || adapter->tx_itr_setting > 3)
			q_vector->itr_val = adapter->tx_itr_setting;
	}

	if (txr_count) {
		/* assign generic ring traits */
		ring->dev = &adapter->pdev->dev;
		ring->netdev = adapter->netdev;

		/* configure backlink on ring */
		ring->q_vector = q_vector;

		/* update q_vector Tx values */
		igb_add_ring(ring, &q_vector->tx);

		/* For 82575, context index must be unique per ring. */
		if (adapter->hw.mac.type == e1000_82575)
			set_bit(IGB_RING_FLAG_TX_CTX_IDX, &ring->flags);

		/* apply Tx specific ring traits */
		ring->count = adapter->tx_ring_count;
		ring->queue_index = txr_idx;

		ring->cbs_enable = false;
		ring->idleslope = 0;
		ring->sendslope = 0;
		ring->hicredit = 0;
		ring->locredit = 0;

		u64_stats_init(&ring->tx_syncp);
		u64_stats_init(&ring->tx_syncp2);

		/* assign ring to adapter */
		adapter->tx_ring[txr_idx] = ring;

		/* push pointer to next ring */
		ring++;
	}

	if (rxr_count) {
		/* assign generic ring traits */
		ring->dev = &adapter->pdev->dev;
		ring->netdev = adapter->netdev;

		/* configure backlink on ring */
		ring->q_vector = q_vector;

		/* update q_vector Rx values */
		igb_add_ring(ring, &q_vector->rx);

		/* set flag indicating ring supports SCTP checksum offload */
		if (adapter->hw.mac.type >= e1000_82576)
			set_bit(IGB_RING_FLAG_RX_SCTP_CSUM, &ring->flags);

		/* On i350, i354, i210, and i211, loopback VLAN packets
		 * have the tag byte-swapped.
		 */
		if (adapter->hw.mac.type >= e1000_i350)
			set_bit(IGB_RING_FLAG_RX_LB_VLAN_BSWAP, &ring->flags);

		/* apply Rx specific ring traits */
		ring->count = adapter->rx_ring_count;
		ring->queue_index = rxr_idx;

		u64_stats_init(&ring->rx_syncp);

		/* assign ring to adapter */
		adapter->rx_ring[rxr_idx] = ring;
	}

	return 0;
}

```

**启动网卡**：上面的初始化都完成后，就可以启动网卡了。前面网卡初始化时，曾提到驱动向内核注册了 structure net_device_ops 变量，它包含着网卡启用、发包、设置 MAC 地址等回调函数（函数指针）。当启用一个网卡时（如通过 ifconfig eth0 up），net_device_ops 变量中定义的ndo_open 方法会被调用。这是一个函数指针，对于 igb 网卡来说，该指针指向的是 igb_open 方法。它通常会做下图所示的事情
![[启动网卡的过程.png]]
```c
// drivers/net/ethernet/intel/igb/igb_main.c
/**
 *  __igb_open - Called when a network interface is made active
 *  @netdev: network interface device structure
 *  @resuming: indicates whether we are in a resume call
 *
 *  Returns 0 on success, negative value on failure
 *
 *  The open entry point is called when a network interface is made
 *  active by the system (IFF_UP).  At this point all resources needed
 *  for transmit and receive operations are allocated, the interrupt
 *  handler is registered with the OS, the watchdog timer is started,
 *  and the stack is notified that the interface is ready.
 **/
static int __igb_open(struct net_device *netdev, bool resuming)
{
	struct igb_adapter *adapter = netdev_priv(netdev);
	struct pci_dev *pdev = adapter->pdev;
	struct e1000_hw *hw = &adapter->hw;
	struct napi_struct *napi;
	int err;
	int i;

	/* disallow open during test */
	if (test_bit(__IGB_TESTING, &adapter->state)) {
		WARN_ON(resuming);
		return -EBUSY;
	}

	if (!resuming)
		pm_runtime_get_sync(&pdev->dev);

	netif_carrier_off(netdev);

	/* allocate transmit descriptors */
	err = igb_setup_all_tx_resources(adapter);
	if (err)
		goto err_setup_tx;

	/* allocate receive descriptors */
	err = igb_setup_all_rx_resources(adapter);
	if (err)
		goto err_setup_rx;

	igb_power_up_link(adapter);

	/* before we allocate an interrupt, we must be ready to handle it.
	 * Setting DEBUG_SHIRQ in the kernel makes it fire an interrupt
	 * as soon as we call pci_request_irq, so we have to setup our
	 * clean_rx handler before we do so.
	 */
	igb_configure(adapter);

	err = igb_request_irq(adapter);
	if (err)
		goto err_req_irq;

	/* Notify the stack of the actual queue counts. */
	err = netif_set_real_num_tx_queues(adapter->netdev,
					   adapter->num_tx_queues);
	if (err)
		goto err_set_queues;

	err = netif_set_real_num_rx_queues(adapter->netdev,
					   adapter->num_rx_queues);
	if (err)
		goto err_set_queues;

	/* From here on the code is the same as igb_up() */
	clear_bit(__IGB_DOWN, &adapter->state);

	for (i = 0; i < adapter->num_q_vectors; i++) {
		napi = &adapter->q_vector[i]->napi;
		napi_enable(napi);
		igb_set_queue_napi(adapter, i, napi);
	}

	/* Clear any pending interrupts. */
	rd32(E1000_TSICR);
	rd32(E1000_ICR);

	igb_irq_enable(adapter);

	/* notify VFs that reset has been completed */
	if (adapter->vfs_allocated_count) {
		u32 reg_data = rd32(E1000_CTRL_EXT);

		reg_data |= E1000_CTRL_EXT_PFRSTD;
		wr32(E1000_CTRL_EXT, reg_data);
	}

	netif_tx_start_all_queues(netdev);

	if (!resuming)
		pm_runtime_put(&pdev->dev);

	/* start the watchdog. */
	hw->mac.get_link_status = 1;
	schedule_work(&adapter->watchdog_task);

	return 0;

err_set_queues:
	igb_free_irq(adapter);
err_req_irq:
	igb_release_hw_control(adapter);
	igb_power_down_link(adapter);
	igb_free_all_rx_resources(adapter);
err_setup_rx:
	igb_free_all_tx_resources(adapter);
err_setup_tx:
	igb_reset(adapter);
	if (!resuming)
		pm_runtime_put(&pdev->dev);

	return err;
}
```

以上代码中，`_igb_open`函数调用了igb_setup_all_tx_resources和igb_setup_all_rx_resources。在调用igb_setup_all_rx_resources这一步操作中，分配了RingBuffer，并建立内存和Rx队列的映射关系。（Rx和Tx队列的数量和大小可以通过ethtool进行配置。）
```c
// drivers/net/ethernet/intel/igb/igb_main.c
/**
 *  igb_setup_all_rx_resources - wrapper to allocate Rx resources
 *				 (Descriptors) for all queues
 *  @adapter: board private structure
 *
 *  Return 0 on success, negative on failure
 **/
static int igb_setup_all_rx_resources(struct igb_adapter *adapter)
{
	struct pci_dev *pdev = adapter->pdev;
	int i, err = 0;

	for (i = 0; i < adapter->num_rx_queues; i++) {
		err = igb_setup_rx_resources(adapter->rx_ring[i]);
		if (err) {
			dev_err(&pdev->dev,
				"Allocation for Rx Queue %u failed\n", i);
			for (i--; i >= 0; i--)
				igb_free_rx_resources(adapter->rx_ring[i]);
			break;
		}
	}

	return err;
}
```
在上面的源码中，通过循环创建了若干个接收队列，如下图
![[接收队列.png]]

看看每一个队列是如何创建出来的
```c
// drivers/net/ethernet/intel/1gb/igb_main.c
/**
 *  igb_setup_tx_resources - allocate Tx resources (Descriptors)
 *  @tx_ring: tx descriptor ring (for a specific queue) to setup
 *
 *  Return 0 on success, negative on failure
 **/
int igb_setup_tx_resources(struct igb_ring *tx_ring)
{
	struct device *dev = tx_ring->dev;
	int size;

	size = sizeof(struct igb_tx_buffer) * tx_ring->count;

	tx_ring->tx_buffer_info = vmalloc(size);
	if (!tx_ring->tx_buffer_info)
		goto err;

	/* round up to nearest 4K */
	tx_ring->size = tx_ring->count * sizeof(union e1000_adv_tx_desc);
	tx_ring->size = ALIGN(tx_ring->size, 4096);

	tx_ring->desc = dma_alloc_coherent(dev, tx_ring->size,
					   &tx_ring->dma, GFP_KERNEL);
	if (!tx_ring->desc)
		goto err;

	tx_ring->next_to_use = 0;
	tx_ring->next_to_clean = 0;

	return 0;

err:
	vfree(tx_ring->tx_buffer_info);
	tx_ring->tx_buffer_info = NULL;
	dev_err(dev, "Unable to allocate memory for the Tx descriptor ring\n");
	return -ENOMEM;
}
```
从上述源码可以看到，实际上一个RingBuffer的内部不是仅有一个环形队列数组，而是有两个，如下图
![[接收队列内部.png]]
1. igb_rx_buffer数组:这个数组是内核使用的，通过vzalloc申请的。
2. e1000_adv_rx_desc数组:这个数组是网卡硬件使用的，通过dmaalloc_coherent分配。

再接着看中断函数是如何注册的，注册过程见igb_request_irq
```c
// drivers/net/ethernet/intel/1gb/igb_main.c
/**
 *  igb_request_irq - initialize interrupts
 *  @adapter: board private structure to initialize
 *
 *  Attempts to configure interrupts using the best available
 *  capabilities of the hardware and kernel.
 **/
static int igb_request_irq(struct igb_adapter *adapter)
{
	struct net_device *netdev = adapter->netdev;
	struct pci_dev *pdev = adapter->pdev;
	int err = 0;

	if (adapter->flags & IGB_FLAG_HAS_MSIX) {
		err = igb_request_msix(adapter);
		if (!err)
			goto request_done;
		/* fall back to MSI */
		igb_free_all_tx_resources(adapter);
		igb_free_all_rx_resources(adapter);

		igb_clear_interrupt_scheme(adapter);
		err = igb_init_interrupt_scheme(adapter, false);
		if (err)
			goto request_done;

		igb_setup_all_tx_resources(adapter);
		igb_setup_all_rx_resources(adapter);
		igb_configure(adapter);
	}

	igb_assign_vector(adapter->q_vector[0], 0);

	if (adapter->flags & IGB_FLAG_HAS_MSI) {
		err = request_irq(pdev->irq, igb_intr_msi, 0,
				  netdev->name, adapter);
		if (!err)
			goto request_done;

		/* fall back to legacy interrupts */
		igb_reset_interrupt_capability(adapter);
		adapter->flags &= ~IGB_FLAG_HAS_MSI;
	}

	err = request_irq(pdev->irq, igb_intr, IRQF_SHARED,
			  netdev->name, adapter);

	if (err)
		dev_err(&pdev->dev, "Error %d getting interrupt\n",
			err);

request_done:
	return err;
}
```
在上面的代码中跟踪函数调用，调用顺序为__igb_open => igb_request_irq => igb_request_msix。在igb_request_msix中可以看到，对于多队列的网卡，为每一个队列都注册了中断，其对应的中断处理函数是igb_msix_ring（该函数也在drivers/net/ethernet/intel/igb/igb_main.c下）。还可以看到，在msix方式下，每个RX队列有独立的MSI-X中断，从网卡硬件中断的层面就可以设置让收到的包被不同的CPU处理。（可以通过irqbalance，或者修改/proc/irq/IRQ_NUMBER/smp_affinity，从而修改和CPU的绑定行为。）

当做好以上准备工作以后，就可以接收数据包了

### 迎接数据的到来
#### 硬中断处理
当数据帧从网线到达网卡的时候，第一站是网卡的接收队列。网卡在分配给自己的 RingBuffer 中寻找可用的内存位置，找到后 DMA 引擎 会把数据 DMA 到网卡之前关联的内存里，到这个时候 CPU 都是无感的。当 DMA 操作完成后，网卡向 CPU 发起一个硬中断，通知 CPU 有数据到达。硬中断处理过程如下图
![[硬中断处理.png]]
当RingBuffer满的时候，新来的数据包将被丢弃。使用ifconfig命令查看网卡的时候，可以看到里面有个overruns，表示因为环形队列满被丢弃的包数。如果发现有丢包，可能需要通过ethtool命令来加大环形队列的长度。

在前面的“启动网卡”部分，讲到了网卡的硬中断注册的处理函数是igb_msix_ring。
```c
// drivers/net/ethernet/intel/igb/igb_main.c
static irqreturn_t igb_msix_ring(int irq, void *data)
{
	struct igb_q_vector *q_vector = data;

	/* Write the ITR value calculated from the previous interrupt. */
	igb_write_itr(q_vector);

	napi_schedule(&q_vector->napi);

	return IRQ_HANDLED;
}

```
其中的igb_write_itr只记录硬件中断频率(据说是在减少对CPU的中断频率时用到)。顺着napi_schedule调用一路跟踪下去，调用顺序为`napi_schedule => ____napi_schedule`。

```c
// net/core/dev.c
/* Called with irq disabled */
static inline void ____napi_schedule(struct softnet_data *sd,
				     struct napi_struct *napi)
{
	struct task_struct *thread;

	lockdep_assert_irqs_disabled();

	if (test_bit(NAPI_STATE_THREADED, &napi->state)) {
		/* Paired with smp_mb__before_atomic() in
		 * napi_enable()/netif_set_threaded().
		 * Use READ_ONCE() to guarantee a complete
		 * read on napi->thread. Only call
		 * wake_up_process() when it's not NULL.
		 */
		thread = READ_ONCE(napi->thread);
		if (thread) {
			if (use_backlog_threads() && thread == raw_cpu_read(backlog_napi))
				goto use_local_napi;

			set_bit(NAPI_STATE_SCHED_THREADED, &napi->state);
			wake_up_process(thread);
			return;
		}
	}

use_local_napi:
	DEBUG_NET_WARN_ON_ONCE(!list_empty(&napi->poll_list));
	list_add_tail(&napi->poll_list, &sd->poll_list);
	WRITE_ONCE(napi->list_owner, smp_processor_id());
	/* If not called from net_rx_action()
	 * we have to raise NET_RX_SOFTIRQ.
	 */
	if (!sd->in_net_rx_action)
		raise_softirq_irqoff(NET_RX_SOFTIRQ);
}
```
这里可以看到，list_add_tail修改了CPU变量softnet_data里的poll_list，将驱动napi_struct传过来的poll_list添加了进来。softnet_data中的poll_list是一个双向列表，其中的设备都带有输入帧等着被处理。紧接着_raise_softirq_irqoff触发了一个软中断NET_RX_SOFTIRQ，这个所谓的触发过程只是对一个变量进行了一次或运算而已。
```c
// kernel/softirq.c
/*
 * This function must run with irqs disabled!
 */
inline void raise_softirq_irqoff(unsigned int nr)
{
	__raise_softirq_irqoff(nr);

	/*
	 * If we're in an interrupt or softirq, we're done
	 * (this also catches softirq-disabled code). We will
	 * actually run the softirq once we return from
	 * the irq or softirq.
	 *
	 * Otherwise we wake up ksoftirqd to make sure we
	 * schedule the softirq soon.
	 */
	if (!in_interrupt() && should_wake_ksoftirqd())
		wakeup_softirqd();
}

```

```c
// include/linux/interrupt.h

#define or_softirq_pending(x)	(__this_cpu_or(local_softirq_pending_ref, (x)))
```
Linux在硬中断里只完成简单必要的工作，剩下的大部分的处理都是转交给软中断的。通过以上代码可以看到，硬中断处理过程真的非常短，只是记录了一个寄存器，修改了一下CPU的poll_list，然后发出一个软中断。就这么简单，硬中断的工作就算是完成了。
#### ksoftirgd内核线程处理软中断

网络包的接收处理过程主要都在ksoftirqd内核线程中完成，软中断都是在这里处理的，流程如下图
![[软中断处理.png]]
前文介绍内核线程初始化的时候，曾介绍了ksoftirqd中两个线程函数ksoftirqd_should_run和run_ksoftirqd。其中ksoftirqd_should_run函数的代码如下
```c
// kernel/softirq.c
static int ksoftirqd_should_run(unsigned int cpu)
{
	return local_softirq_pending();
}
```
此函数和硬中断中调用了同一个函数local_softirq_pending。使用方式的不同之处在于，在硬中断处理中是为了写入标记，这里只是读取。如果硬中断中设置了NET_RX_SOFTIRQ，这里自然能读取到。接下来会真正进入内核线程处理函数run_ksoftirqd进行处理
```c
// kernel/softirq.c
static void run_ksoftirqd(unsigned int cpu)
{
	ksoftirqd_run_begin();
	if (local_softirq_pending()) {
		/*
		 * We can safely run softirq on inline stack, as we are not deep
		 * in the task stack here.
		 */
		handle_softirqs(true);
		ksoftirqd_run_end();
		cond_resched();
		return;
	}
	ksoftirqd_run_end();
}
```
在_do_softirq中，判断根据当前CPU的软中断类型，调用其注册的action方法
```c
// kernel/softirq.c
static void handle_softirqs(bool ksirqd)
{
	unsigned long end = jiffies + MAX_SOFTIRQ_TIME;
	unsigned long old_flags = current->flags;
	int max_restart = MAX_SOFTIRQ_RESTART;
	struct softirq_action *h;
	bool in_hardirq;
	__u32 pending;
	int softirq_bit;

	/*
	 * Mask out PF_MEMALLOC as the current task context is borrowed for the
	 * softirq. A softirq handled, such as network RX, might set PF_MEMALLOC
	 * again if the socket is related to swapping.
	 */
	current->flags &= ~PF_MEMALLOC;

	pending = local_softirq_pending();

	softirq_handle_begin();
	in_hardirq = lockdep_softirq_start();
	account_softirq_enter(current);

restart:
	/* Reset the pending bitmask before enabling irqs */
	set_softirq_pending(0);

	local_irq_enable();

	h = softirq_vec;

	while ((softirq_bit = ffs(pending))) {
		unsigned int vec_nr;
		int prev_count;

		h += softirq_bit - 1;

		vec_nr = h - softirq_vec;
		prev_count = preempt_count();

		kstat_incr_softirqs_this_cpu(vec_nr);

		trace_softirq_entry(vec_nr);
		h->action();
		trace_softirq_exit(vec_nr);
		if (unlikely(prev_count != preempt_count())) {
			pr_err("huh, entered softirq %u %s %p with preempt_count %08x, exited with %08x?\n",
			       vec_nr, softirq_to_name[vec_nr], h->action,
			       prev_count, preempt_count());
			preempt_count_set(prev_count);
		}
		h++;
		pending >>= softirq_bit;
	}

	if (!IS_ENABLED(CONFIG_PREEMPT_RT) && ksirqd)
		rcu_softirq_qs();

	local_irq_disable();

	pending = local_softirq_pending();
	if (pending) {
		if (time_before(jiffies, end) && !need_resched() &&
		    --max_restart)
			goto restart;

		wakeup_softirqd();
	}

	account_softirq_exit(current);
	lockdep_softirq_end(in_hardirq);
	softirq_handle_end();
	current_restore_flags(old_flags, PF_MEMALLOC);
}
```
这里需要注意一个细节，硬中断中的设置软中断标记，和ksoftirqd中的判断是否有软中断到达，都是基于smp_processor_id)的。这意味着只要硬中断在哪个CPU上被响应，那么软中断也是在这个CPU上处理的。所以说，如果你发现Linux软中断的CPU消耗都集中在一个核上，正确的做法应该是调整硬中断的CPU亲和性，将硬中断打散到不同的CPU核上去。看到这里大家也就弄清楚了本章开篇处提到的第二个疑惑。

再来把精力集中到这个核心函数net_rx_action上来。

