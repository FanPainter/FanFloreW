# 环境搭建
## WSL
确保你已经安装了WSL和一个Linux发行版
```
wsl --install -d Ubuntu
```
在WSL的Ubuntu环境中，更新系统并安装编译OpenWRT所需的工具
```
sudo apt update && sudo apt upgrade  
sudo apt install build-essential libncurses5-dev gawk git subversion libssl-dev gettext zlib1g-dev file python3
```

工作目录中，克隆OpenWRT的源码
```
git clone https://git.openwrt.org/openwrt/openwrt.git
cd openwrt
```
如果你想要特定的版本，可以切换到相应的分支或tag
```
git checkout v22.03.0
```
在开始编译之前，你需要配置OpenWRT。你可以使用OpenWRT自带的配置界面来选择目标平台、包、内核模块等。
更新和安装feeds
```
./scripts/feeds update -a  
./scripts/feeds install -a
```
运行以下命令进入OpenWRT的配置界面
```
make menuconfig
```
- 在这里，你可以选择你的目标平台（Target System）和设备型号（Target Profile）。
- 配置所需的软件包和内核模块。

配置完成后，可以开始编译。根据你的系统资源，编译可能需要一些时间。

```
make -j$(nproc)
```

`-j$(nproc)` 表示使用你系统中可用的所有CPU核心来加速编译过程。

在WSL环境中编译大型项目可能会遇到一些限制，如文件系统性能较慢或内存不足。为了应对这些问题，可以考虑
**增加WSL的内存限制**：可以通过编辑`%userprofile%/.wslconfig`文件来增加WSL的内存和CPU限制。
```
[wsl2]  
memory=8GB # 设置内存上限  
processors=4 # 设置CPU核心数量
```
- **避免使用NTFS**：WSL在NTFS文件系统上的编译性能较差。考虑将源码存放在WSL的文件系统（例如`/home/username`）下。

编译完成后，固件文件会输出在`bin/targets/`目录下。你可以将生成的固件刷入到你的设备中。

根据需要，你可以继续调整配置文件、添加或移除软件包、修改源码，并重新编译。



# Reference
- [使用WSL编译OpenWrt - Ryan's Blog](https://ryanchan.top/archives/compile-openwrt-with-wsl)
- [在wsl下定制并编译openwrt | 个人小站](https://blog.cwiki.cn/2024/11/16/%E5%9C%A8wsl%E4%B8%8B%E5%AE%9A%E5%88%B6%E5%B9%B6%E7%BC%96%E8%AF%91openwrt/)