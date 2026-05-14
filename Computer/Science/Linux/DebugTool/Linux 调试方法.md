# 生成 coredump
```shell
# 查看coredump生成路径和文件名形式
cat /proc/sys/kernel/core_pattern
```
它的输出决定了系统如何处理 coredump。一个典型的输出由两部分组成
1. **以 `|` 开头的“管道模式”**：这部分表示 coredump 数据会像流水一样，通过管道（pipe）直接传给后面的程序来处理，而不是直接存成一个普通文件
2. **具体的处理程序**：这通常是一个外部工具。
	1. 在现代的 Linux 系统中，coredump 默认由 `systemd-coredump` 服务管理，文件默认会打包存放在 `/var/lib/systemd/coredump/` 目录下
	2. 而在 WSL 环境下，coredump 的默认行为是由 **`wsl-capture-crash`** 这个工具来处理的，这是 WSL 的一部分，它的具体行为可能和标准的 Linux 发行版不太一样。所以最稳妥的方法，还是通过 **`coredumpctl` 这个命令工具** 来查找和管理你的 coredump
	```bash
	# 列出所有已捕获的coredump
coredumpctl list
# 查看最后一个崩溃的详细信息，这会告诉你文件位置
coredumpctl info
	```

如果想按自己的规则来保存 coredump 文件，可以修改 `core_pattern` 这个系统参数，它告诉内核怎么写 coredump 文件。
1. 临时修改 (测试用，重启后失效)：
	1. **设置文件名和存放目录**：下面的命令会把 coredump 文件保存在 `/var/crash/` 目录下，文件名是 `core-程序名-进程ID-时间戳`。
	```bash
	echo '/var/crash/core-%e-%p-%t' | sudo tee /proc/sys/kernel/core_pattern
	```
	也可以根据自己的喜好来调整文件名格式
	2. **修改 core 文件大小限制**：再检查下系统对 core 文件的大小限制，确保它不为 0。`unlimited` 表示文件大小不限。
	```bash
	# 临时设置，仅对当前终端有效
ulimit -c unlimited
	```
	如果想全局生效，可以修改 `/etc/security/limits.conf` 文件，添加下面两行
	```
	* soft core unlimited
* hard core unlimited
	```
	3. **创建目标目录并赋予权限**：内核不会自动创建目录，所以要提前创建好存放 coredump 的目录，并赋予它 `1777` 的权限（这能确保所有进程都有权写入）。
	```bash
	sudo mkdir -p /var/crash
sudo chmod 1777 /var/crash
	```

**永久修改 (重启后不失效)**
1. **编辑系统配置文件**：打开 `/etc/sysctl.conf` 文件，在末尾添加一行，内容和你之前测试的路径规则一样。
```bash
sudo vi /etc/sysctl.conf
# 添加下面这行
kernel.core_pattern = /var/crash/core-%e-%p-%t
```
1. **让配置立即生效**：运行下面的命令，让你的修改立刻生效
```bash
sudo sysctl -p
```


## WSL 环境下的特殊注意事项
在 WSL 中有一件很特别的事。WSL 是一个轻量级的虚拟环境，为了和 Windows 主机更好地协同工作，它的 `core_pattern` 配置有可能在每次启动时被 WSL 的初始化服务重置，这可能会影响上面“永久修改”的效果。

为了让配置在 WSL 重启后依然有效，可以把修改 core_pattern 的命令加到开机脚本里
1. 打开或创建 WSL 用户的 `.bashrc` 文件（如果你用的是 zsh 等其他 shell，请修改对应的配置文件）。
```bash
vi ~/.bashrc
```
1. 在文件末尾添加一行
```bash
sudo sh -c 'echo "/var/crash/core-%e-%p-%t" > /proc/sys/kernel/core_pattern'
```
1. 保存文件并退出。这样每次开启 WSL 终端时，都会自动重置 coredump 的配置。


### 常见问题排查

修改后如果发现 coredump 没按预期生成，可以按下面的步骤检查一下：

- **检查 `core_pattern` 是否生效**：执行 `cat /proc/sys/kernel/core_pattern`，确认输出是否是 `/var/crash/core-%e-%p-%t`。
- **检查 core 文件大小限制**：执行 `ulimit -c`，如果显示 `0`，说明禁止生成 core dump[](https://www.php.cn/faq/2090205.html)。你需要执行 `ulimit -c unlimited` 解除限制[](https://knowledge.broadcom.com/external/article/288190/redirect-a-core-dump-file-to-a-specified.html)。
- **检查目录权限**：确保你指定的目录（如 `/var/crash`）存在且权限为 `1777`。
- **检查 systemd-coredump 服务**：如果系统使用 systemd，coredump 可能默认被它的服务处理。你可以检查并确保它没有被禁用
```bash
# 检查服务状态
systemctl is-active systemd-coredump
# 如果服务未运行，启动并启用它
sudo systemctl enable --now systemd-coredump
```



WSL环境下，`coredumpctl`找不到文件主要有几个原因：

- **`wsl-capture-crash`接管了数据**：WSL使用 `|/wsl-capture-crash ...` 作为`core_pattern`[](https://forum.openeuler.org/t/topic/18604)。这个路径意味着coredump数据被外部工具接管，完全绕过了`systemd-coredump`服务，自然也就和`coredumpctl`无关了。
    
- **`systemd`服务未运行或未安装**：如果系统没有使用`systemd`作为初始化系统，`systemd-coredump`服务可能压根就没运行，也就不可能生成或管理转储文件。
    
- **`ulimit -c`未永久生效**：虽然当前shell的`ulimit -c unlimited`工作正常，但重启后可能失效，导致系统依然禁止生成core dump[](https://unix.stackexchange.com/revisions/326d0d16-89b7-4fe3-af18-6f1664ea82eb/view-source)。
    
- **`coredump.conf`未配置为“外部存储”**：即便`systemd-coredump`服务在运行，默认配置也可能将转储文件压缩存储在journal中，而不是作为独立文件保存在磁盘上


既然`coredumpctl`找不到，可以绕过它，直接从源头入手。`wsl-capture-crash`是WSL的一部分，它截获了`core_pattern`的数据
1. **手动搜索文件**：在有root权限的WSL实例中执行
```bash
sudo find / -name "core.*" -o -name "*.core" -o -name "*.dmp" -o -name "*.crash" 2>/dev/null
```
重点关注如`/tmp`、`/var/tmp`和WSL特定的`/mnt/wslg/dumps/`等目录[](https://blog.csdn.net/weixin_43998885/article/details/135157631)。搜索结果可能包含`wsl-capture-crash`生成的特定文件。
2. 1. **检查WSL配置**：查看WSL的配置文件（如果存在），可能会揭示`wsl-capture-crash`的行为。具体路径依赖于WSL发行版配置。


相比大海捞针，更推荐主动接管控制权，强制生成一个标准的core dump文件。