原文链接：http://blog.csdn.net/qq_21949217/article/details/46004433

[hostapd源代码分析（二）：hostapd的工作机制 - Rosanne - 博客园](https://www.cnblogs.com/happygirl-zjj/p/5995776.html)

![](https://images2015.cnblogs.com/blog/686769/201610/686769-20161025103439546-1407686048.png)

hostapd通过一个叫做“event_loop”的核心模块来处理来自各个模块的事件。但其实hostapd从头到尾都是单一线程。（这也体现了多线程并不是银弹）

其实，hostapd是通过socket来接受其他模块发来的消息的，并通过select()或者poll()系统调用来轮询各个socket的描述符，一旦发现众多socket描述符中有可用的描述符时，便调用相应的回调函数来处理相关事件。（关于select()或者poll()的用法，请各位读者参考《Advanced Programming in the UNIX Environment》和《UNIX network programming》等书籍中的相关介绍，本文不做赘述）

​		看几个关于event loop的数据结构。打开src/utils/eloop.c

```c
//eloop_sock表示一个注册的socket  
struct eloop_sock {  
    int sock; //socket的描述符  
    void *eloop_data; //回调函数的第一个参数  
    void *user_data; //回调函数的第二个参数  
    eloop_sock_handler handler; //当事件发生时调用的回调函数入口  
    ....  
};  
  
//eloop_sock_table表示已经注册的socket列表  
struct eloop_sock_table {  
    int count; //已注册的socket个数  
    struct eloop_sock *table; //具体的socket注册信息（描述符，回调函数参数，回调函数入口等）  
    ....  
};  
  
//eloop_data表示所有的socket事件  
struct eloop_data {  
        int max_sock; //所有socket描述符中的最大值  
        int count; /* sum of all table counts */  
        struct eloop_sock_table readers; //socket“读事件”列表  
        struct eloop_sock_table writers; //socket“写事件”列表  
        struct eloop_sock_table exceptions;//socket“意外事件”列表  
        ....  
};
```

再看几个关于event loop的函数

```c
int eloop_register_sock(int sock, eloop_event_type type,  
            eloop_sock_handler handler,  
            void *eloop_data, void *user_data)  
{  
    struct eloop_sock_table *table;  
  
    assert(sock >= 0);  
    table = eloop_get_sock_table(type);  
    return eloop_sock_table_add_sock(table, sock, handler,  
                     eloop_data, user_data);  
}  
  
  
void eloop_unregister_sock(int sock, eloop_event_type type)  
{  
    struct eloop_sock_table *table;  
  
    table = eloop_get_sock_table(type);  
    eloop_sock_table_remove_sock(table, sock);  
}  
  
int eloop_register_read_sock(int sock, eloop_sock_handler handler,  
                 void *eloop_data, void *user_data)  
{  
    return eloop_register_sock(sock, EVENT_TYPE_READ, handler,  
                   eloop_data, user_data);  
}  
  
  
void eloop_unregister_read_sock(int sock)  
{  
    eloop_unregister_sock(sock, EVENT_TYPE_READ);  
}
```

这个函数是把socket描述符和期相对应的回调函数注册到socket描述符表中去。这个函数会调用eloop_register_sock函数，并设置EVENT_TYPE_READ标志，表示这个socket主要用于“读”（也即“接收”）。同理，eloop_unregister_read_sock和eloop_unregister_sock是用来把某个socket描述符从表中删除（一般在hostapd退出的时候调用）。接下来再看eloop是如何执行的，找到eloop_run()函数

```c
void eloop_run(void)
{

    fd_set *rfds, *wfds, *efds; //读、写、意外文件描述符集合
    struct timeval _tv;
    int res;
    struct os_reltime tv, now;

    rfds = os_malloc(sizeof(*rfds));
    wfds = os_malloc(sizeof(*wfds));
    efds = os_malloc(sizeof(*efds));
    if (rfds == NULL || wfds == NULL || efds == NULL)
        goto out;

    while (!eloop.terminate &&
           (!dl_list_empty(&eloop.timeout) || eloop.readers.count > 0 ||
        eloop.writers.count > 0 || eloop.exceptions.count > 0)) {
        struct eloop_timeout *timeout;
        timeout = dl_list_first(&eloop.timeout, struct eloop_timeout,
                    list);
        if (timeout) {
            os_get_reltime(&now);
            if (os_reltime_before(&now, &timeout->time))
                os_reltime_sub(&timeout->time, &now, &tv);
            else
                tv.sec = tv.usec = 0;

            _tv.tv_sec = tv.sec;
            _tv.tv_usec = tv.usec;
        }
                //通过FD_SET宏设置“读”、“写”、“意外”的文件描述符集合
        eloop_sock_table_set_fds(&eloop.readers, rfds);
        eloop_sock_table_set_fds(&eloop.writers, wfds);
        eloop_sock_table_set_fds(&eloop.exceptions, efds);
                //通过select()检查各个文件描述符的状态
        res = select(eloop.max_sock + 1, rfds, wfds, efds,
                 timeout ? &_tv : NULL);

        if (res < 0 && errno != EINTR && errno != 0) {
            wpa_printf(MSG_ERROR, "eloop: %s: %s", <span style="font-family: Arial, Helvetica, sans-serif;">"select"</span>, strerror(errno));
            goto out;
        }

        eloop_process_pending_signals();

        /* check if some registered timeouts have occurred */
                //检查是否有超时发生
        timeout = dl_list_first(&eloop.timeout, struct eloop_timeout,
                    list);
        if (timeout) { //如果有超时发生，执行相应的回调函数处理超时事件
            os_get_reltime(&now);
            if (!os_reltime_before(&now, &timeout->time)) {
                void *eloop_data = timeout->eloop_data;
                void *user_data = timeout->user_data;
                eloop_timeout_handler handler =
                    timeout->handler;
                eloop_remove_timeout(timeout);
                handler(eloop_data, user_data);
            }

        }

        if (res <= 0)
            continue;

                //处理各个socket的事件
        eloop_sock_table_dispatch(&eloop.readers, rfds);
        eloop_sock_table_dispatch(&eloop.writers, wfds);
        eloop_sock_table_dispatch(&eloop.exceptions, efds);
    }

    eloop.terminate = 0;
out:
    os_free(rfds);
    os_free(wfds);
    os_free(efds);
    return;
}
```

hostapd实际上是通过select()机制来轮询检查各个socket的状态，一旦发现某个socket描述符可读、可写、或者是意外的话，就会通过eloop_sock_table_dispach函数来调用相应的回调函数去处理相关事件。其实，源代码中还有用poll()机制的实现，他们的原理都差不多，各位有兴趣的读者可以自行查阅。对了，上面的代码提到了eloop_sock_table_dispatch函数来处理各个socket事件，那么它是怎么实现的呢？我们看一下下面的代码

```c
static void eloop_sock_table_dispatch(struct eloop_sock_table *table,  
                      fd_set *fds)  
{  
    int i;  
  
    if (table == NULL || table->table == NULL)  
        return;  
  
    table->changed = 0;  
    for (i = 0; i < table->count; i++) { //检查socket表中每个描述符是否可用（读、写、意外）  
        if (FD_ISSET(table->table[i].sock, fds)) {  
                        //当某个socket描述符处于可用状态时，调用相应的回调函数来处理  
            table->table[i].handler(table->table[i].sock,  
                        table->table[i].eloop_data,  
                        table->table[i].user_data);  
            if (table->changed)  
                break;  
        }  
    }  
}
```

怎么样？看到了熟悉的FD_ISSET宏了吧？

 　在eloop_run()中，不光处理了各个socket描述符的事件，还有信号（比如按下Ctrl+C），超时（timeout）等事件的处理。这里不再赘述。到此，读者应该理解了hostapd的event loop工作机制了吧？了解了event loop的工作机制以后，我们就可以对hostapd的功能进行扩展了。比如我做的关于OpenFlow AP项目，我把hostapd和控制器（controller）之间交换数据的socket描述符和对应的回调函数加入到socket描述符表中去，hostapd就可以接收来自控制器的指令，并处理OpenFlow协议了。