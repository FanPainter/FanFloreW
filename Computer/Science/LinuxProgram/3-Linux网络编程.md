##网络编程基本原理

##套接字编程

​		结构 struct sockaddr 定义了一种通用的套接字地址，在 linux/socket.h 中定义

```c
struct sockaddr {
    unsigned short sa_family;   /* 地址类型， AF_xxx */
    char sa_data[14];          /* 14 字节的协议地址 */
};
```

sa_family 表示套接字的协议族类型，对应于 TCP/IP 协议该值为 AF_INET；sa_data 存储具体的协议地址。sa_data 之所以被定义成 14 个字节，因为有的协议族使用较长的地址格式。一般在编程中并不对该结构体进行操作，而是使用另一个与它等价的数据结构：sockaddr_in

​		每种协议族都有自己的协议地址格式，TCP/IP 协议族的地址格式为结构体 struct sockaddr_in，在 netinet/in.h 中定义

```c
struct sockaddr_in {
    unsigned short sin_family; /* 地址类型 */
    unsigned short int sin_port; /* 端口号 */
    struct in_addr sin_addr;  /* IP 地址 */
    unsigned char sin_zero[0]; /* 填充字节，一般赋值为 0 */
};
```

sin_family 表示地址类型，对于使用 TCP/IP 协议进行的网络编程，该值只能是 AF_INET。sin_port 是端口号；sin_addr 用来存储 32 位的 IP 地址；sin_zero 为填充字节，一般赋值为 0。

​		struct in_addr 定义为

```c
struct in_addr {
	unsigned long s_addr;
};
```

​		结构体 sockaddr 的长度为 16 字节，结构体 sockaddr_in 的长度也为 16 字节。通常在编写基于 TCP/IP 协议的网络程序时，使用结构体 sockaddr_in 来设置地址，然后通过强制类型转换成 sockaddr 类型。如

```c
struct sockaddr_in sock;
sock.sin_family = AF_INET;
sock.sin_port = htons(80);
sock.addr.s_addr = inet_addr("202,205.3.105");
memset(sock.sin_zero, 0, sizeof(sock.sin_zero));
```

###创建套接字

​		socket 函数用来创建一个套接字，Shell 下输入 man socket 获得函数原型

```c
#include <sys/socket.h>
int socket(int domain, int type, int protocol);
```

domain 用于指定创建套接字所使用的协议族，在 linux/socket.h 中定义，常用的如下

- AF_UNIX：创建只在本机内进行通信的套接字
- AF_INET：使用 IPv4 TCP/IP 协议
- AF_INET6：使用 IPv6 TCP/IP 协议

​		type 指定套接字类型

- SOCK_STREAM：TCP 流套接字
- SOCK_DGRAM：UDP 数据报套接字
- SOCK_RAW：原始套接字

​		protocol 通常设置为 0，表示通过参数 domaiin 指定的协议族和参数 type 指定的套接字类型来确定使用的协议。当创建原始套接字时，系统无法唯一确定协议，此时就需要使用该参数指定所使用的协议。

​		执行成功返回一个新创建的套接字；有错误发生则返回 -1，错误代码存入 errno 中。

###建立连接

​		connect 用来在一个指定的套接字上创建一个连接，Shell 下输入 man connect 获得函数原型

```c
#include <sys/socket.h>
int connect(int sockfd, const struct sockaddr *addr,
                   socklen_t addrlen);
```

sockfd 时一个由函数 socket 创建的套接字。如果该套接字的类型是 SOCK_STREAM，则 connect 函数用于向服务器发出连接请求，服务器的 IP 地址和端口号由参数 serv_addr 指定。如果套接字的类型是 SOCK_DGRAM，则 connect 函数并不建立真正的连接，只是告诉内核与该套接字进行通信的目的地址（由第二个参数指定），只有该目的地址发来的数据才会被该 socket 接收。对于 SOCK_DGRAM 类型的套接字，调用 connect 函数的好处是不必在每次发送和接收数据时都指定目的地址。

​		通常一个面向连接的套接字（如 TCP 套接字）只能调用一次 connect 函数。而对于无连接的套接字（如 UDP 套接字）则可以多次调用 connect 函数以改变与目的地址的绑定。将参数 serv_addr 中的 sa_family 设置为 AF_UNSPEC 可以取消绑定。

​		参数 serv_addr 是一个地址结构。addrlen 为参数 serv_addr 的长度。

```c
struct sockaddr_in serv_addr;
memset(&serv_addr, 0, sizeof(struct sockaddr_in)); 
serv_addr.sin_family = AF_INET;
serv_addr.sin_port = htons(80);
if(inet_aton("172.17.242.131", &server_addr.sin_addr) < 0)
{
    perror("inet_aton");
    exit(1);
}
if(connect(sock_fd, (struct sockaddr *)serv_addr, sizeof(struct sockaddr_in)) < 0)
{
    perror("connect");
    exit(1);
}
```

###绑定套接字

​		bind 用来将一个套接字和某个端口绑定在一起，Shell 下输入 man 2 bind 可以获取函数原型

```c
#include <sys/socket.h>
int bind(int sockfd, const struct sockaddr *addr,
                socklen_t addrlen);
```

socket 只是创建了一个套接字，这个套接字在哪个端口上工作没有指定。客户机/服务器模型中，服务器端口的 IP 地址和端口号一般是固定的，因此在服务器端的程序在，使用 bind 函数将一个套接字和某个端口绑定在一起。该函数一般只有服务器端的程序调用。

​		addr 制定了 sockfd 将绑定到的本地地址，可以将 addr 的 sin_addr 设置为 INADDR_ANY 而不是某个确定的 IP 地址就可以绑定到任何网络接口。对于只有一个 IP 地址的计算机，INADDR_ANY 对应的就是它的 IP 地址；对于多宿主主机（拥有多块网卡），INADDR_ANY 表示本服务器程序将处理来自所有网络接口上相应端口的连接请求。

```c
struct sockaddr_in serv_addr;
memset(&serv_addr, 0, sizeof(struct sockaddr_in));
serv_addr.sin_family = AF_INET;
serv_addr.sin_port = htons(80);
serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);

if(bind(sock_fd, (struct sockaddr *)&serv_addr, sizeof(struct sockaddr_in)) < 0)
{
    perror("bind");
    exit(1);
}
```

###在套接字上监听

​		函数 listen 把套接字转化为被动监听，Shell 下输入 man listen 可获得该函数原型

```c
#include <sys/socket.h>
int listen(int sockfd, int backlog);
```

函数 socket 创建的套接字是主动套接字，这种套接字可以用来主动请求连接到某个服务器（通过函数 connect）。但是作为服务端的程序，通常在某个端口上监听等待来自客户端的连接请求。在服务器端，一般是先调用函数 socket 创建一个主动套接字，然后调用函数 bind 将该套接字绑定到某个端口上，接着再调用 listen 将该套接字转化为监听套接字，等待来自于客户端的连接请求。

​		一般多个客户端连接到一个服务器，服务器向这些客户端提供某种服务。服务器端设置一个连接队列，记录已建立的连接，参数 backlog 指定了该连接队列的最大长度。如果连接队列已经达到最大，之后的连接请求将被服务器拒绝。

​		执行成功返回 0，当有错误发生时则返回 -1，错误代码存入 errno 中。

​		函数 listen 只是将套接字设置为倾听模式以等待连接请求，并不能接收连接请求，真正接收客户端连接请求的是 accept 函数

```c
#define LISTEN_NUM 12  // 定义连接请求队列长度
...

if(listen(sock_fd, LISTEN_NUM) < 0)
{
    perror("listen");
    exir(1);
}
```

###接受连接

​		函数 accept 用来接受一个连接请求，Shell 下输入 man 2 accept 可获得该函数原型

```c
#include <sys/socket.h>

int accept(int sockfd, struct sockaddr *_Nullable restrict addr,
                  socklen_t *_Nullable restrict addrlen);
```

sockfd 是由函数 socket 创建，经 bind 绑定到本地某端口，然后提供 listen 转化而来的套接字

- addr：用来保存发起连接请求的主机的地址和端口
- addrlen：addr 所指向的结构体的大小

执行成功返回一个新的代表客户端的套接字，出错则返回 -1，错误代码存入 errno 中。

​		只能对面向连接的套接字使用 accept 函数。accept 执行成功时，将创建一个新的套接字，并为这个新的套接字分配一个套接字描述符，并返回这个新的套接字描述符。这个新的套接字描述符与打开文件时返回的文件描述符类似，进程可以利用这个新的套接字描述符与客户端交换数据。sockfd 所指定的套接字继续等待客户端的连接请求。

​		如果参数 sockfd 所指定的套接字被设置为阻塞方式（Linux 下的默认方式），且连接请求队列为空，则 accept() 将被阻塞直到有连接请求到达为止；如果参数 sockfd 所指定的套接字被设置为非阻塞方式，则如果队列为空，accept 将立即返回 -1，errno 被设置为 EAGAIN。

```c
int client_fd;
int client_len;
struct sockaddr_in client_addr;
...
client_len = sizeof(struct sockaddr_in);
client_fd = accept(sock_fd, (struct sockaddr *)&client_addr, &client_len);
if(conn_fd < 0)
{
    perror("accept");
    exit(1);
}
```

###TCP 套接字的数据传输

####发送数据

​		send 函数用来在 TCP 套接字上发送数据，Shell 下输入 man 2 send 可获取函数原型

```c
#include <sys/socket.h>
ssize_t send(int sockfd, const void buf[.len], size_t len, int flags);
```

send 函数只能对处于连接状态的套接字使用。sockfd 为已建立好的套接字描述符，即 accept 函数的返回值。参数 msg 指向存放待发送数据的缓冲区，参数 len 为待发送数据的长度。

​		参数 flags 为控制选项，一般设置为 0 或以下取值

- **MSG_OOB**：在指定的套接字上发送带外数据（out-of-band data），该类型的套接字必须支持带外数据（如 SOCK_STREAM）
- **MSG_DONTROUTE**：通过最直接的路径发送数据，而忽略下层协议的路由设置。

如果要发送的数据太长而不能发送时，将出现错误，errno 设置为 EMSGSIZE；如果要发送的数据长度大于该套接字的缓冲区剩余空间大小时，send() 一般会被阻塞，如果该套接字被设置为非阻塞方式，则此时立即返回 -1 并将 errno 设置为 EAGAIN。

​		执行成功返回实际发送的字节数，出错则返回 -1，错误代码存入 errno 中。执行成功只是说明数据写入套接字的缓冲区中，并不表示数据已经成功地通过网络发送到目的地。

​		套接字为阻塞方式下，函数的常见用法为

```c
#define BUFFERSIZE 1500
char send_buf[BUFFERSIZE];

if(send(conn_fd, send_buf, len, 0) < 0)
{
	perror("send");
	exit(1);
}
```

####接收数据

​		函数 recv 用来在 TCP 套接字上接收数据，Shell 下输入 man recv 可获得该函数的原型

```c
#include <sys/socket.h>
ssize_t recv(int sockfd, void buf[.len], size_t len,
                        int flags);
```

函数 recv 从参数 sockfd 所指定的套接字描述符（必须是面向连接的套接字）上接收数据并保存到参数 buf 所指定的缓冲区，参数 len 为缓冲区长度。

​		参数 flags 为控制选项，一般设置为 0 或取以下数值

- **MSG_OOB**：请求接收带外数据
- **MSG_PEEK**：只查看数据而不读出
- **MSG_WAITALL**：只在接收缓冲区满时才返回

​		如果一个数据包太长以至于缓冲不能完全放下时，剩余部分的数据将可能被丢弃（根据接受数据的套接字类型而定）。如果在指定的套接字上无数据到达时，recv() 将被阻塞，如果该套接字被设置为非阻塞方式，则立即返回 -1 并将 errno 设置为 EAGAIN。函数 recv 接收到数据就返回，并不会等待接收到参数 len 指定长度的数据才返回。

​		执行成功返回接收到的数据字节数，出错则返回 -1，错误代码存入 errno 中。套接字为阻塞方式下该函数常见用法

```c
char recv_buf[BUFFERSIZE];
if(recv(conn_fd, recv_buf, sizeof(recv_buf), 0) < 0)
{
    perror("recv");
    exit(1);
}
```

###UDP 套接字的数据传输

####发送数据

​		函数 sendto 用来在 UDP 套接字上发送数据，Shell 下输入 man sendto 可获取函数原型

```c
#include <sys/socket.h>
ssize_t sendto(int sockfd, const void buf[.len], size_t len, int flags,
                      const struct sockaddr *dest_addr, socklen_t addrlen);
```

sendto 与函数 send 类似，但 sendto 不需要套接字处于连接状态，所以该函数通常用来发送 UDP 数据。同时因为是无连接的套接字，在使用 sendto 时需要指定数据的目的地址。

​		参数 msg 指向带发送数据的缓存区，参数 len 指定了待发送数据的长度，参数 flags 是控制选项，含义与 send() 一致，参数 to 用于指定目的地址，目的地址的长度由 tolen 指定。

​		执行成功返回实际发送数据的字节数，出错则返回 -1，错误代码存入 errno 中

```c
char send_buf[BUFFERSIZE];
struct sockaddr_in dest_addr;

memset(dest_addr, 0, sizeof(struct sockaddr_in));
dest_addr.sin_family = AF_INET;
dest_addr.sin_port = htons(DEST_PORT);
if(inet_aton("172.17.242.131"), &dest_addr.sin_addr) < 0)
{
    perror("inet_aton");
    exit(1);
}


if(sendto(sock_fd, send_buf, len, 0, (struct sockaddr *) &dest_addr, sizeof(struct sockaddr_in)) < 0)
{
    perror("sendto");
    exit(1);
}
```

####接收数据

​		函数 recvfrom 用来在 UDP 套接字上接收数据，Shell 下输入 man recvfrom 可获得函数原型

```c
#include <sys/socket.h>
ssize_t recvfrom(int sockfd, void buf[restrict .len], size_t len,
                        int flags,
                        struct sockaddr *_Nullable restrict src_addr,
                        socklen_t *_Nullable restrict addrlen);
```

函数 recvfrom 与函数 recv 功能类似，只是函数 recv 只能用于面向连接的套接字，而函数 recvfrom 没有此限制，可以用于从无连接的套接字（如 UDP 套接字）上接收数据。

​		参数 buf 指向接收缓冲区，参数 len 指定了缓冲区的大小，参数 flags 是控制选项，含义与 recv 一致。如果参数 from 非空，且该套接字不是面向连接的，则函数 recvfrom 返回时，参数 from 中将保存数据的源地址，参数 fromlen 在调用 recvfrom 前为参数 from 的长度，调用 recvfrom 后将保存 from 的实际大小

​		执行成功返回实际接收到的数据的字节数，出错则返回 -1，错误代码存入 errno 中。套接字为阻塞方式下该函数的常见用法

```c
char recv_buf[BUFFERSIZE];
struct sockaddr_in src_addr;
int src_len;
src_len = sizeof(struct sockaddr_in);
if(recvfrom(sock_fd, recv_buf, sizeof(recv_buf), 0, (struct sockaddr *)&src_addr, &src_len) < 0)
{
    perror("again_recvfrom");
    exit(1);
}
```

###关闭套接字

####函数 close

​		函数 close 用来关闭一个套接字描述符，与关闭文件描述符是类似的，Shell 下输入 man close 获得函数原型

```c
#include <unistd.h>
int close(int fd);
```

参数 fd 为一个套接字描述符，该函数关闭一个套接字。执行成功返回 0，出错则返回 -1，错误代码存入 errno 中。

####函数 shutdown

​		函数 shutdown 也用于关闭一个套接字描述符，Shell 下输入 man 2 shutdown 获得函数原型

```c
#include <sys/socket.h>
int shutdown(int sockfd, int how);
```

函数 shutdown 功能与函数 close 类似，但是 shutdown() 功能更强大，可以对套接字的关闭进行一些更细致的控制，它允许对套接字进行单向关闭或全部禁止。参数 sockfd 为待关闭的套接字描述符，参数 howto 指定了关闭的方式，具体取值如下

- **SHUT_RD**：将连接上的读通道关闭，此后进程将不能再接收任何数据，接收缓冲区中还未被读取的数据也将被丢弃，但仍然可以在该套接字上发送数据
- **SHUT_WR**：将连接上的写通道关闭，此后进程将不能再发送任何数据，发送缓冲区中还未被发送的数据也将被丢弃，但仍然可以在该套接字上接收数据
- **SHUT_RDWR**：读、写通道都将被关闭

执行成功返回 0，出错则返回 -1，错误代码存入 errno 中

###主要系统调用函数

####字节顺序和转换函数

​		Shell 下输入 man byteorder

```c
#include <arpa/inet.h>
uint32_t htonl(uint32_t hostlong);
uint16_t htons(uint16_t hostshort);
uint32_t ntohl(uint32_t netlong);
uint16_t ntohs(uint16_t netshort);
```

####inet 系列函数

​		Shell 下输入 man inet

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

int inet_aton(const char *cp, struct in_addr *inp);
in_addr_t inet_addr(const char *cp);
in_addr_t inet_network(const char *cp);
[[deprecated]] char *inet_ntoa(struct in_addr in);
[[deprecated]] struct in_addr inet_makeaddr(in_addr_t net,
                                                   in_addr_t host);
[[deprecated]] in_addr_t inet_lnaof(struct in_addr in);
[[deprecated]] in_addr_t inet_netof(struct in_addr in);
```

####getsockopt() 和 setsockopt()

​		Shell 下输入 man getsockopt

```c
#include <sys/socket.h>
int getsockopt(int sockfd, int level, int optname,
                      void optval[restrict *.optlen],
                      socklen_t *restrict optlen);
int setsockopt(int sockfd, int level, int optname,
                      const void optval[.optlen],
                      socklen_t optlen);
```

####多路复用 select()

​		Shell 下输入 man select

```c
#include <sys/select.h>

       typedef /* ... */ fd_set;

       int select(int nfds, fd_set *_Nullable restrict readfds,
                  fd_set *_Nullable restrict writefds,
                  fd_set *_Nullable restrict exceptfds,
                  struct timeval *_Nullable restrict timeout);

       void FD_CLR(int fd, fd_set *set);
       int  FD_ISSET(int fd, fd_set *set);
       void FD_SET(int fd, fd_set *set);
       void FD_ZERO(fd_set *set);

       int pselect(int nfds, fd_set *_Nullable restrict readfds,
                  fd_set *_Nullable restrict writefds,
                  fd_set *_Nullable restrict exceptfds,
                  const struct timespec *_Nullable restrict timeout,
                  const sigset_t *_Nullable restrict sigmask);
```

