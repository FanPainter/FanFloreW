# shell

​		要想理解 shell，得先理解一些 CLI。shell 不单单是一种 CLI。它是一个时刻都在运行的复杂交互式程序。输入命令并利用 shell 来运行脚本会出现一些既有趣又令人困惑的问题。搞清楚 shell 进程以及它与系统之间的关系能够帮助你解决这些难题，或是完全避开它们。 

## shell 的类型

​		系统启动什么样的 shell 程序取决于个人的用户 ID 配置。在 /etc/passwd 文件中，在用户 ID 记录的第 7 个字段中列出了默认的 shell 程序。只要用户登录到某个虚拟控制台终端或是在 GUI 中启动终端仿真器，默认的 shell 程序就会开始运行。

​		bash shell 程序位于 /bin 目录内。从长列表中可以看出 /bin/bash（bash shell）是一个可执行程序

```bash
sue@DESKTOP-6HVVRHQ:~/WorkSpace/CDemos$ ls -lF /bin/bash 
-rwxr-xr-x 1 root root 1446024 Mar 31  2024 /bin/bash*
```

> ​		CentOS 发行版中还有其他一些 shell 程序。其中包括 tcsh，它源自最初的 C shell
>
> ```bash
> ls -lF /bin/tcsh
> ```
>
> 另外还包括 ash shell 的 Debian 版
>
> ```bash
> ls -lF /bin/dash
> ```
>
> 最后，C shell 的软链接指向的是 tcsh shell
>
> ```bash
> ls -lF /bin/csh
> ```
>

​		这些 shell 程序各自都可以被设置成用户的默认 shell。不过由于 bash shell 的广为流行，很少有人使用其他的 shell 作为默认 shell。 

​		**默认的交互 shell 会在用户登录某个虚拟控制台终端或在 GUI 中运行终端仿真器时启动**。不过还有另外一个默认 shell 是 /bin/sh，它作为默认的系统 shell，用于那些需要在启动时使用的系统 shell 脚本。 

​		经常会看到某些发行版使用软链接将默认的系统 shell 设置成 bash shell

```bash
ls -l /bin/sh
```

​		但要注意的是在有些发行版上，默认的系统 shell 和默认的交互 shell 并不相同，例如在 Ubuntu发行版中。用户默认的交互shell 是 /bin/bash，也就是 bash shell。但是作为默认系统 shell 的 /bin/sh 被设置为 dash shell。 

​		对 bash shell 脚本来说，这两种不同的 shell（默认的交互 shell 和默认的系统 shell）会造成问题。一定要阅读有关 bash shell脚本首行的语法要求，以避免这些麻烦。 

​		并不是必须一直使用默认的交互 shell。可以使用发行版中所有可用的 shell，只需要输入对应的文件名就行了。例如，可以直接输入命令 /bin/dash 来启动 dash shell。 

```bash
/bin/dash 
```

除启动了 dash shell 程序之外，看起来似乎什么都没有发生。提示符 $ 是 dash shell 的 CLI 提示符。可以输入 exit 来退出 dash shell。 

```bash
exit
```

这一次好像还是什么都没有发生，但是 dash shell 程序已经退出了。在下一节中探究登录 shell 程序与新启动的 shell 程序之间的关系。 

## shell 的父子关系

​		**用于登录某个虚拟控制器终端或在 GUI 中运行终端仿真器时所启动的默认的交互 shell，是一个父shell**。在 CLI 提示符后输入 /bin/bash 命令或其他等效的 bash 命令时，会创建一个新的 shell 程序。这个 shell 程序被称为子 shell（child shell）。子 shell 也拥有 CLI 提示符，同样会等待命令输入。

​		当输入 bash、生成子 shell 的时候，看不到任何相关的信息，因此需要另一条命令理清这一切。讲过的 ps 命令能够派上用场，在生成子 shell 的前后配合选项 -f 来使用。

​		**进程就是正在运行的程序**。bash shell 是一个程序，当它运行的时候，就成为了一个进程。一个运行着的 shell 就是某种进程而已。因此，在说到运行一个 bash shell 的时候，经常会看到 “shell” 和“进程”这两个词交换使用。 

​		输入命令 bash 之后，一个子 shell 就出现了。第二个 ps -f 是在子 shell 中执行的。可以从显示结果中看到有两个 bash shell 程序在运行。第一个 bash shell 程序，也就是父 shell 进程。第二个 bash shell 程序，即子 shell 进程。

​		**在生成子 shell 进程时，只有部分父进程的环境被复制到子 shell 环境中。这会对包括变量在内的一些东西造成影响**。子 shell（child shell，也叫 sub shell）可以从父 shell 中创建，也可以从另一个子 shell 中创建。

​		ps -forest 可以展示子 shell 间的嵌套结构。ps -f 命令也能够表现子 shell 的嵌套关系，因为它能够通过 PPID 列显示出谁是谁的父进程。 

​		bash shell 程序可使用命令行参数修改 shell 启动方式。下表列举了 bash 中可用的命令行参数。

​		**表：bash 命令行参数**

| 参数      | 描述                                         |
| --------- | -------------------------------------------- |
| -c string | 从 string 中读取命令并进行处理               |
| -i        | 启动一个能够接收用户输入的交互 shell         |
| -l        | 以登录 shell 的形式启动                      |
| -r        | 启动一个受限 shell，用户会被限制在默认目录中 |
| -s        | 从标准输入中读取命令                         |

可以输入 man bash 获得关于 bash 命令的更多帮助信息，了解更多的命令行参数。bash --help 命令也会提供一些额外的协助。 

​		可以利用 exit 命令有条不紊地退出子 shell。 exit 命令不仅能退出子 shell，还能用来登出当前的虚拟控制台终端或终端仿真器软件。只需要在父 shell 中输入 exit，就能够从容退出 CLI 了。 

​		运行 shell 脚本也能够创建出子 shell。就算是不使用b ash shell 命令或是运行 shell 脚本，也可以生成子 shell。一种方法就是使用进程列表。 

### 进程列表

​		可以在一行中指定要依次运行的一系列命令。这可以通过命令列表来实现，只需要在命令之间加入分号即可。

```bash
pwd ; ls ; cd /etc ; pwd ; cd ; pwd ; ls 
```

例子中，所有的命令依次执行，不存在任何问题。不过这并不是进程列表。**命令列表要想成为进程列表，这些命令必须包含在括号里**。 

```bash
(pwd ; ls ; cd /etc ; pwd ; cd ; pwd ; ls) 
```

**尽管多出来的括号看起来没有什么太大的不同，但起到的效果确是非同寻常。括号的加入使命令列表变成了进程列表，生成了一个子shell来执行对应的命令**。 

​		进程列表是一种命令分组（command grouping）。另一种命令分组是将命令放入花括号中，并在命令列表尾部加上分号。语法为{ command; }。**使用花括号进行命令分组并不会像进程列表那样创建出子 shell**。 

​		要想知道是否生成了子 shell，得借助一个使用了环境变量的命令。这个命令就是 echo $BASH_SUBSHELL。如果该命令返回 0，就表明没有子 shell。如果返回 1 或者其他更大的数字，就表明存在子 shell。 

​		下面的例子中使用了一个命令列表，列表尾部是 echo $BASH_SUBSHELL。

```bash
pwd ; ls ; cd /etc ; pwd ; cd ; pwd ; ls ; echo $BASH_SUBSHELL 
```

在命令输出的最后，显示的是数字 0。这就表明这些命令不是在子 shell 中运行的。

​		要是使用进程列表的话，结果就不一样了。在列表最后加入 echo $BASH_SUBSHELL。 

```bash
(pwd ; ls ; cd /etc ; pwd ; cd ; pwd ; ls ; echo $BASH_SUBSHELL)
```

这次在命令输入的最后显示出了数字 1。这表明的确创建了子 shell，并用于执行这些命令。 

​		**所以说，命令列表就是使用括号包围起来的一组命令，它能够创建出子 shell 来执行这些命令。甚至可以在命令列表中嵌套括号来创建子 shell 的子 shell**。 

```bash
( pwd ; (echo $BASH_SUBSHELL))
```

在第一个进程列表中，数字 1 表明了一个子 shell，这个结果和预期的一样。但是在第二个进程列表中，在命令 echo $BASH_SUBSHELL 外面又多出了一对括号。这对括号在子 shell 中产生了另一个子 shell 来执行命令。因此数字 2 表明的就是这个子 shell。 

​		在 shell 脚本中，经常使用子 shell 进行多进程处理。但是采用子 shell 的成本不菲，会明显拖慢处理速度。在交互式的 CLI shell 会话中，子 shell 同样存在问题。**它并非真正的多进程处理，因为终端控制着子 shell 的 I/O**。 

### 别出心裁的子 shell 用法

​		在交互式的 shell CLI 中，还有很多更富有成效的子 shell 用法。进程列表、协程和管道都利用了子 shell。它们都可以有效地在交互式 shell 中使用。 

​		在交互式 shell 中，一个高效的子 shell 用法就是使用后台模式。讨论如何将后台模式与子 shell  搭配使用之前，得先搞明白什么是后台模式。 

#### 探索后台模式

​		在后台模式中运行命令可以在处理命令的同时让出 CLI，以供他用。演示后台模式的一个经典命令就是 sleep。 sleep 命令接受一个参数，该参数是希望进程等待（睡眠）的秒数。这个命令在脚本中常用于引入一段时间的暂停。命令 sleep 10 会将会话暂停 10 秒钟，然后返回 shell CLI 提示符。 

```bash
sleep 10 
```

要想将命令置入后台模式，可以在命令末尾加上字符 &。把 sleep 命令置入后台模式可以利用 ps 命令来小窥一番

```bash
sleep 3000& 
```

sleep 命令会在后台（&）睡眠 3000 秒（50分钟）。当它被置入后台，在 shell CLI 提示符返回之前，会出现两条信息。第一条信息是显示在方括号中的后台作业（background job）号。第二条是后台作业的进程ID。 

​		除了 ps 命令，也可以使用 jobs 命令来显示后台作业信息。jobs 命令可以显示出当前运行在后台模式中的所有用户的进程（作业）。 

```bash
jobs
```

jobs 命令在方括号中显示出作业号。还显示了作业的当前状态（running）以及对应的命令。 

​		利用 jobs 命令的 -l（字母 L 的小写形式）选项，还能够看到更多的相关信息。除了默认信息之外，-l 选项还能够显示出命令的 PID。一旦后台作业完成，就会显示出结束状态。

​		后台作业的结束状态可未必会一直等待到合适的时候才现身。当作业结束状态突然出现在屏幕上的时候，可别吃惊。 后台模式非常方便，它可以在 CLI 中创建出有实用价值的子 shell。 

#### 将进程列表置入后台

​		之前说过，进程列表是运行在子 shell 中的一条或多条命令。使用包含了 sleep 命令的进程列
表，并显示出变量 BASH_SUBSHELL，结果和期望的一样。 

```bash
(sleep 2 ; echo $BASH_SUBSHELL ; sleep 2) 
```

在上面的例子中，有一个 2 秒钟的暂停，显示出的数字 1 表明只有一个子 shell，在返回提示符之前又经历了另一个 2 秒钟的暂停。没什么大事。 

​		将相同的进程列表置入后台模式会在命令输出上表现出些许不同。 

```bash
(sleep 2 ; echo $BASH_SUBSHELL ; sleep 2)& 
```

把进程列表置入后台会产生一个作业号和进程 ID，然后返回到提示符。不过奇怪的是表明单一级子 shell 的数字 1 显示在了提示符的旁边！不要不知所措，只需要按一下回车键，就会得到另一个提示符。 

​		**在 CLI 中运用子 shell 的创造性方法之一就是将进程列表置入后台模式。既可以在子 shell 中进行繁重的处理工作，同时也不会让子 shell 的 I/O 受制于终端。** 

​		当然了，sleep 和 echo 命令的进程列表只是作为一个示例而已。使用 tar 创建备份文件是有效利用后台进程列表的一个更实用的例子。 

```bash
(tar -cf Rich.tar /home/rich ; tar -cf My.tar /home/christine)& 
```

将进程列表置入后台模式并不是子 shell 在 CLI 中仅有的创造性用法。协程就是另一种方法。 

#### 协程

​		协程可以同时做两件事。它在后台生成一个子 shell，并在这个子 shell 中执行命令。 要进行协程处理，得使用 coproc 命令，还有要在子 shell 中执行的命令。 

```bash
coproc sleep 10 
```

除了会创建子 shell 之外，协程基本上就是将命令置入后台模式。当输入 coproc 命令及其参数之后，会发现启用了一个后台作业。屏幕上会显示出后台作业号以及进程 ID。

​		jobs 命令能够显示出协程的处理状态。在上面的例子中可以看到在子 shell 中执行的后台命令是coproc COPROC sleep 10。COPROC 是 coproc 命令给进程起的名字。可以使用命令的扩展语法自己设置这个名字。 

```bash
coproc My_Job { sleep 10; } 
```

通过使用扩展语法，协程的名字被设置成 My_Job。这里要注意的是，**扩展语法写起来有点麻烦。必须确保在第一个花括号和命令名之间有一个空格。还必须保证命令以分号结尾。另外，分号和闭花括号之间也得有一个空格**。 

​		协程能够让你尽情发挥想象力，发送或接收来自子 shell 中进程的信息。只有在拥有多个协程的时候才需要对协程进行命名，因为你得和它们进行通信。否则的话，让 coproc 命令将其设置成默认的名字 COPROC 就行了。 

​		可以将协程与进程列表结合起来产生嵌套的子 shell。只需要输入进程列表，然后把命令 coproc 放在前面就行了。 

```bash
coproc ( sleep 10; sleep 2 ) 
```

记住，**生成子 shell 的成本不低，而且速度还慢。创建嵌套子 shell 更是火上浇油**！ 

​		在命令行中使用子 shell 能够获得灵活性和便利。要想获得这些优势，重要的是理解子 shell 的行为方式。对于命令也是如此。在下一节中，将研究内建命令与外部命令之间的行为差异。

## 理解 shell 的内建命令

​		搞明白 shell 的内建命令和非内建（外部）命令非常重要。内建命令和非内建命令的操作方式大不相同。 

### 外部命令

​		外部命令，有时候也被称为文件系统命令，是存在于 bash shell 之外的程序。它们并不是 shell  程序的一部分。外部命令程序通常位于 /bin、/usr/bin、/sbin 或 /usr/sbin 中。 

​		ps 就是一个外部命令。可以使用 which 和 type 命令找到它

```bash
which ps
```

```bash
type -a ps 
```

```bash
ls -l /bin/ps 
```

**当外部命令执行时，会创建出一个子进程。这种操作被称为衍生（forking）**。外部命令 ps 很方便显示出它的父进程以及自己所对应的衍生子进程。 

``` bash
ps -f 
```

作为外部命令，ps 命令执行时会创建出一个子进程。

​		当进程必须执行衍生操作时，它需要花费时间和精力来设置新子进程的环境。所以说，**外部命令多少还是有代价的**。

​		就算衍生出子进程或是创建了子 shell，仍然可以通过发送信号与其沟通，这一点无论是在命令行还是在脚本编写中都是极其有用的。发送信号（signaling）使得进程间可以通过信号进行通信。

### 内建命令

​		**内建命令和外部命令的区别在于前者不需要使用子进程来执行**。它们已经和 shell 编译成了一体，作为 shell 工具的组成部分存在。不需要借助外部程序文件来运行。 

​		**cd 和 exit 命令都内建于 bash shell。可以利用 type 命令来了解某个命令是否是内建的**

```bash
$ type cd 
cd is a shell builtin 
$ 
$ type exit 
exit is a shell builtin 
```

因为既不需要通过衍生出子进程来执行，也不需要打开程序文件，**内建命令的执行速度要更快，效率也更高**。附录 A 给出了 GNU bash shell 的内建命令列表。

​		**要注意，有些命令有多种实现**。例如 echo 和 pwd 既有内建命令也有外部命令。两种实现略有不同。要查看命令的不同实现，使用 type 命令的 -a 选项。

```bash
$ type -a echo 
echo is a shell builtin 
echo is /bin/echo 
$ 
$ which echo 
/bin/echo 
$ 
$ type -a pwd 
pwd is a shell builtin 
pwd is /bin/pwd 
$ 
$ which pwd 
/bin/pwd 
$ 
```

命令 type -a 显示出了每个命令的两种实现。注意，**which 命令只显示出了外部命令文件**。 

​		**对于有多种实现的命令，如果想要使用其外部命令实现，直接指明对应的文件就可以了。例如，要使用外部命令 pwd，可以输入 /bin/pwd**。 

#### 使用 history 命令

​		一个有用的内建命令是 history 命令。bash shell 会跟踪用过的命令。可以唤回这些命令并重新使用。要查看最近用过的命令列表，可以输入不带选项的 history 命令。 通常历史记录中会保存最近的 1000 条命令。

​		可以设置保存在 bash 历史记录中的命令数。要想实现这一点，需要修改名为 HISTSIZE 的环境变量。可以唤回并重用历史列表中最近的命令。这样能够节省时间和击键量。输入!!，然后按回车键就能够唤出刚刚用过的那条命令来使用。 当输入 !! 时，bash 首先会显示出从 shell 的历史记录中唤回的命令。然后执行该命令。

​		命令历史记录被保存在隐藏文件 .bash_history 中，它位于用户的主目录中。这里要注意的是， **bash 命令的历史记录是先存放在内存中，当 shell 退出时才被写入到历史文件中**。 

​		可以在退出 shell 会话之前强制将命令历史记录写入 .bash_history 文件。要实现强制写入，需要使用 history 命令的 -a 选项。此时 history 命令和 .bash_history 文件的输入是一样的，除了最近的那条 history 命令，因为它是在history -a 命令之后出现的。 

​		如果打开了多个终端会话，仍然可以使用 history -a 命令在打开的会话中向 .bash_history 文件中添加记录。**但是对于其他打开的终端会话，历史记录并不会自动更新。这是因为 .bash_history 文件只有在打开首个终端会话时才会被读取**。要想强制重新读取 .bash_history 文件，更新终端会话的历史记录，可以使用 history -n 命令。 

​		**可以唤回历史列表中任意一条命令。只需输入惊叹号和命令在历史列表中的编号即可**。 

​		使用 bash shell 命令历史记录能够大大地节省时间。利用内建的 history 命令能够做到的事情远不止这里所描述的。可以通过输入 man history 来查看 history 命令的 bash 手册页面。 

#### 命令别名

​		alias 命令是另一个 shell 的内建命令。命令别名允许为常用的命令（及其参数）创建另一个名称，从而将输入量减少到最低。 

​		Linux 发行版很有可能已经设置好了一些常用命令的别名。要查看当前可用的别名，使用 alias 命令以及选项 -p。

```bash
sue@DESKTOP-6HVVRHQ:~/WorkSpace$ alias -p
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
alias grep='grep --color=auto'
alias l='ls -CF'
alias la='ls -A'
alias ll='ls -alF'
alias ls='ls --color=auto'
```

在该 Ubuntu Linux 发行版中，有一个别名取代了标准命令 ls。它自动加入了 --color 选项，表明终端支持彩色模式的列表。 

​		可以使用 alias 命令创建属于自己的别名。 

```bash
alias li='ls -li'
```

在定义好别名之后，随时都可以在 shell 中使用它，就算在 shell 脚本中也没问题。**要注意，因为命令别名属于内部命令，一个别名仅在它所被定义的 shell 进程中才有效**。 

​		不过好在有办法能够让别名在不同的子 shell 中都奏效 

# Linux 环境变量

​		Linux 环境变量能提升 Linux shell 体验。很多程序和脚本都通过环境变量来获取系统信息、存储临时数据和配置信息。在 Linux 系统上有很多地方可以设置环境变量，了解去哪里设置相应的环境变量很重要。

## 什么是环境变量

​		bash shell 用一个叫作环境变量（environment variable）的特性来存储有关 shell 会话和工作环境的信息（这也是它们被称作环境变量的原因）。这项特性允许你在内存中存储数据，以便程序或 shell 中运行的脚本能够轻松访问到它们。这也是存储持久数据的一种简便方法。 

​		在 bash shell 中，环境变量分为两类

- **全局变量** 
- **局部变量**

​		尽管 bash shell 使用一致的专有环境变量，但不同的 Linux 发行版经常会添加其自有的环境变量，可以查看你的 Linux 发行版上的文档。 

### 全局环境变量

​		**全局环境变量对于 shell 会话和所有生成的子 shell 都是可见的。局部变量则只对创建它们的  shell 可见**。这让全局环境变量对那些所创建的子 shell 需要获取父 shell 信息的程序来说非常有用。 

​		Linux 系统在开始 bash 会话时就设置了一些全局环境变量。系统环境变量基本上都是使用全大写字母，以区别于普通用户的环境变量。 

​		要查看全局变量，可以使用 env 或 printenv 命令。 

```bash
printenv
```

​		系统为 bash shell 设置的全局环境变量数目众多，不得不在展示的时候进行删减。其中有很多是在登录过程中设置的，另外，**登录方式也会影响到所设置的环境变量**。 

​		要显示个别环境变量的值，可以使用 printenv 命令，但是不要用 env 命令。也可以使用 echo 显示变量的值。在这种情况下引用某个环境变量的时候，必须在变量前面加上一个美元符（$）。 

​		在 echo 命令中，在变量名前加上 $ 可不仅仅是要显示变量当前的值。它能够让变量作为命令行参数。

​		全局环境变量可用于进程的所有子 shell。 

```bash
$ bash 
$ 
$ ps -f 
UID        PID  PPID  C STIME TTY          TIME CMD 
501       2017  2016  0 16:00 pts/0    00:00:00 -bash 
501       2082  2017  0 16:08 pts/0    00:00:00 bash 
501       2095  2082  0 16:08 pts/0    00:00:00 ps -f 
$ 
$ echo $HOME 
/home/Christine 
$ 
$ exit 
exit 
$ 
```

例子中，用 bash 命令生成一个子 shell 后，显示了 HOME 环境变量的当前值，这个值和父 shell 中的一模一样

### 局部环境变量

​		**局部环境变量只能在定义它们的进程中可见**。尽管它们是局部的，但是和全局环境变量一样重要。事实上，Linux 系统也默认定义了标准的局部环境变量。不过也可以定义自己的局部变量，这些变量被称为用户定义局部变量。 

​		查看局部环境变量的列表有点复杂。遗憾的是，在 Linux 系统并没有一个只显示局部环境变量的命令。**set 命令会显示为某个特定进程设置的所有环境变量，包括局部变量、全局变量以及用户定义变量**。 

​		所有通过 printenv 命令能看到的全局环境变量都出现在了 set 命令的输出中。但在set命令的输出中还有其他一些环境变量，即局部环境变量和用户定义变量。 

​		命令 env、printenv 和 set 之间的差异很细微。set 命令会显示出全局变量、局部变量以及用户定义变量。它还会按照字母顺序对结果进行排序。env 和 printenv 命令同 set 命令的区别在于**前两个命令不会对变量排序，也不会输出局部变量和用户定义变量**。在这种情况下，env 和 printenv 的输出是重复的。不过 env 命令有一个 printenv 没有的功能，这使得它要更有用一些。 

## 设置用户定义变量

​		可以在 bash shell 中直接设置自己的变量。

### 设置局部用户定义变量

​		一旦启动了 bash shell（或者执行一个 shell 脚本），就能创建在这个 shell 进程内可见的局部变 
量了。可以通过等号给环境变量赋值，值可以是数值或字符串。 

```bash
$ echo $my_variable 
 
$ my_variable=Hello 
$ 
$ echo $my_variable 
Hello 
```

**如果要给变量赋一个含有空格的字符串值，必须用单引号来界定字符串的首和尾**。

​		**所有的环境变量名均使用大写字母，这是 bash shell 的标准惯例**。如果自己创建的局部变量或是 shell 脚本，请使用小写字母。变量名区分大小写。**在涉及用户定义的局部变量时坚持使用小写字母，这能够避免重新定义系统环境变量可能带来的灾难**。 

​		**变量名、等号和值之间没有空格，这一点非常重要。如果在赋值表达式中加上了空格，bash  shell 就会把值当成一个单独的命令**

​		设置了局部环境变量后，就能在 shell 进程的任何地方使用它了。但是，如果生成了另外一个 
 shell，它在子 shell 中就不可用。

```bash
$ my_variable="Hello World" 
$ 
$ bash 
$ 
$ echo $my_variable 
 
$ exit 
exit 
$ 
$ echo $my_variable 
Hello World 
$ 
```

在这个例子中生成了一个子 shell。在子 shell 中无法使用用户定义变量 my_variable。通过命令echo $my_variable 所返回的空行就能够证明这一点。当退出子 shell 并回到原来的shell时，这个局部环境变量依然可用。 

​		类似地，如果在子进程中设置了一个局部变量，那么一旦退出了子进程，那个局部环境变量就不可用。

```bash
$ echo $my_child_variable 
 
$ bash 
$ 
$ my_child_variable="Hello Little World" 
$ 
$ echo $my_child_variable 
Hello Little World 
$ 
$ exit 
exit 
$ 
$ echo $my_child_variable 
 
$ 
```

回到父 shell 时，子 shell 中设置的局部变量就不存在了。可以通过将局部的用户定义变量变成全局变量来改变这种情况。 

### 设置全局环境变量

​		在设定全局环境变量的进程所创建的子进程中，该变量都是可见的。**创建全局环境变量的方法是先创建一个局部环境变量，然后再把它导出到全局环境中**。这个过程通过 export 命令来完成，变量名前面不需要加 $

```bash
$ my_variable="I am Global now" 
$ 
$ export my_variable 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ bash 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ exit 
exit 
$ 
$ echo $my_variable 
I am Global now 
$ 
```

​		**修改子 shell 中全局环境变量并不会影响到父 shell 中该变量的值**

```bash
$ my_variable="I am Global now" 
$ export my_variable 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ bash 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ my_variable="Null" 
$ 
$ echo $my_variable 
Null 
$ 
$ exit 
exit 
$ 
$ echo $my_variable 
I am Global now 
$ 
```

在定义并导出变量 my_variable 后，bash 命令启动了一个子 shell。在这个子 shell 中能够正确显示出全局环境变量 my_variable 的值。子 shell 随后改变了这个变量的值。但是这种改变仅在子 shell 中有效，并不会被反映到父 shell 中。 

​		**子 shell 甚至无法使用 export 命令改变父 shell 中全局环境变量的值**。

```bash
$ my_variable="I am Global now" 
$ export my_variable 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ bash 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ my_variable="Null" 
$ 
$ export my_variable 
$ 
$ echo $my_variable 
Null 
$ 
$ exit 
exit 
$ 
$ echo $my_variable 
I am Global now 
$ 
```

## 删除环境变量

​		以用 unset 命令完成这个操作。**在 unset 命令中引用环境变量时，记住不要使用 $**。 

```bash
$ echo $my_variable 
I am Global now 
$ 
$ unset my_variable 
$ 
$ echo $my_variable 
 
$ 
```

​		在涉及环境变量名时，什么时候该使用 `$`，什么时候不该使用 `$`，实在让人摸不着头脑。记住一点就行了：**如果要用到变量，使用 `$`；如果要操作变量，不使用 `$`。这条规则的一个例外就是使用 printenv 显示某个变量的值**。 

​		在处理全局环境变量时，事情就有点棘手了。**如果是在子进程中删除了一个全局环境变量，这只对子进程有效。该全局环境变量在父进程中依然可用**。 

```bash
$ my_variable="I am Global now" 
$ 
$ export my_variable 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ bash 
$ 
$ echo $my_variable 
I am Global now 
$ 
$ unset my_variable 
$ 
$ echo $my_variable 
 
$ exit 
exit 
$ 
$ echo $my_variable 
I am Global now 
$ 
```

和修改变量一样，在子 shell 中删除全局变量后，无法将效果反映到父 shell 中。 

## 默认的 shell 环境变量

​		默认情况下，bash shell 会用一些特定的环境变量来定义系统环境。这些变量在 Linux 系统上都已经设置好了，只管放心使用。bash shell 源自当初的 Unix Bourne shell，因此也保留了 Unix 
Bourne shell 里定义的那些环境变量。 

​		下表列出了 bash shell 提供的与 Unix Bourne shell 兼容的环境变量。 

​		**表：bash shell 支持的 Bourne 变量**

| 变量     | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| CDPATH   | 冒号分隔的目录列表，作为 cd 命令的搜索路径                   |
| HOME     | 当前用户的主目录                                             |
| IFS      | shell 用来将文本字符串分割成字段的一系列字符                 |
| MAIL     | 当前用户收件箱的文件名（bash shell 会检查这个文件，看看有没有新邮件） |
| MAILPATH | MAILPATH 冒号分隔的当前用户收件箱的文件名列表（bash shell 会检查列表中的每个文件，看看有没有新邮件） |
| OPTARG   | getopts 命令处理的最后一个选项参数值                         |
| OPTIND   | getopts 命令处理的最后一个选项参数的索引号                   |
| PATH     | shell 查找命令的目录列表，由冒号分隔                         |
| PS1      | PS1 shell 命令行界面的主提示符                               |
| PS2      | shell 命令行界面的次提示符                                   |

​		除了默认的 Bourne 的环境变量，bash shell 还提供一些自有的变量，如下表所示。 

​		**表：bash shell 环境变量**

|变 量 |描 述|
|---|---|
|BASH|当前 shell 实例的全路径名 |
|BASH_ALIASES| 含有当前已设置别名的关联数组|
|BASH_ARGC|含有传入子函数或 shell 脚本的参数总数的数组变量|
|BASH_ARCV|含有传入子函数或 shell 脚本的参数的数组变量|
|BASH_CMDS|关联数组，包含 shell 执行过的命令的所在位置|
|BASH_COMMAND|shell 正在执行的命令或马上就执行的命令 |
|BASH_ENV|设置了的话，每个 bash 脚本会在运行前先尝试运行该变量定义的启动文件|
|BASH_EXECUTION_STRING|使用 bash -c 选项传递过来的命令|
|BASH_LINENO| 含有当前执行的 shell 函数的源代码行号的数组变量 |
|BASH_REMATCH|只读数组，在使用正则表达式的比较运算符 =~ 进行肯定匹配（positive match）时，包含了匹配到的模式和子模式 |
|BASH_SOURCE| 含有当前正在执行的 shell 函数所在源文件名的数组变量 |
|BASH_SUBSHEL| 当前子 shell 环境的嵌套级别（初始值是 0） |
|BASH_VERSINFO|含有当前运行的 bash shell 的主版本号和次版本号的数组变量|
|BASH_VERSION|当前运行的 bash shell 的版本号|
|BASH_XTRACEFD|若设置成了有效的文件描述符（0、1、2），则 'set -x' 调试选项生成的跟踪输出可被重定向。通常用来将跟踪输出到一个文件中 |
|BASHOPTS| 当前启用的 bash shell 选项的列表 |
|BASHPID|当前 bash 进程的 PID|
|COLUMNS|当前 bash shell 实例所用终端的宽度|
|COMP_CWORD|COMP_WORDS 变量的索引值，后者含有当前光标的位置 |
|COMP_LINE| 当前命令行 |
|COMP_POINT| 当前光标位置相对于当前命令起始的索引|
|COMP_KEY| 用来调用 shell 函数补全功能的最后一个键 |
|COMP_TYPE| 一个整数值，表示所尝试的补全类型，用以完成 shell 函数补全 |
|COMP_WORDBREAKS |Readline 库中用于单词补全的词分隔字符 |
|COMP_WORDS| 含有当前命令行所有单词的数组变量|
|COMPREPLY |含有由 shell 函数生成的可能填充代码的数组变量 |
|COPROC |占用未命名的协进程的 I/O 文件描述符的数组变量|
|DIRSTACK|含有目录栈当前内容的数组变量 |
|EMACS| 设置为 't' 时，表明 emacs shell 缓冲区正在工作，而行编辑功能被禁止 |
|ENV| 如果设置了该环境变量，在 bash shell 脚本运行之前会先执行已定义的启动文件（仅用于当 bash shell 以 POSIX 模式被调用时） |
|EUID| 当前用户的有效用户 ID（数字形式） |
|FCEDIT| 供 fc 命令使用的默认编辑器 |
|FIGNORE| 在进行文件名补全时可以忽略后缀名列表，由冒号分隔|
|FUNCNAME|当前执行的 shell 函数的名称|
|FUNCNEST|当设置成非零值时，表示所允许的最大函数嵌套级数（一旦超出，当前命令即被终止） |
|GLOBIGNORE| 冒号分隔的模式列表，定义了在进行文件名扩展时可以忽略的一组文件名|
|GROUPS |含有当前用户属组列表的数组变量 |
|histchars| 控制历史记录扩展，最多可有 3 个字符 |
|HISTCMD| 当前命令在历史记录中的编号 |
|HISTCONTROL| 控制哪些命令留在历史记录列表中 |
|HISTFILE| 保存 shell 历史记录列表的文件名（默认是 .bash_history） |
|HISTFILESIZE| 最多在历史文件中存多少行 |
|HISTTIMEFORMAT | 如果设置了且非空，就用作格式化字符串，以显示 bash 历史中每条命令的时间戳 |
|HISTIGNORE| 由冒号分隔的模式列表，用来决定历史文件中哪些命令会被忽略|
|HISTSIZE |最多在历史文件中存多少条命令 |
|HOSTFILE |shell 在补全主机名时读取的文件名称|
|HOSTNAME |当前主机的名称|
|HOSTTYPE |当前运行 bash shell 的机器|
|IGNOREEOF |shell 在退出前必须收到连续的 EOF 字符的数量（如果这个值不存在，默认是 1） |
|INPUTRC| Readline 初始化文件名（默认是 .inputrc） |
|LANG| shell 的语言环境类别 |
|LC_ALL |定义了一个语言环境类别，能够覆盖 LANG 变量|
|LC_COLLATE |设置对字符串排序时用的排序规则 |
|LC_CTYPE| 决定如何解释出现在文件名扩展和模式匹配中的字符 |
|LC_MESSAGES| 在解释前面带有 $ 的双引号字符串时，该环境变量决定了所采用的语言环境设置 |
|LC_NUMERIC| 决定着格式化数字时采用的语言环境设置 |
|LINENO |当前执行的脚本的行号|
|LINES| 定义了终端上可见的行数|
|MACHTYPE| 用 “CPU-公司-系统”（CPU-company-system）格式定义的系统类型 |
|MAPFILE| 一个数组变量，当 mapfile 命令未指定数组变量作为参数时，它存储了 mapfile 所读入的文本 |
|MAILCHECK| shell 查看新邮件的频率（以秒为单位，默认值是 60） |
|OLDPWD |shell 之前的工作目录 |
|OPTERR |设置为 1 时，bash shell 会显示 getopts 命令产生的错误|
|OSTYPE| 定义了 shell 所在的操作系统 |
|PIPESTATUS|含有前台进程的退出状态列表的数组变量 |
|POSIXLY_CORRECT |设置了的话，bash 会以 POSIX 模式启动|
|PPID| bash shell 父进程的 PID |
|PROMPT_COMMAND |设置了的话，在命令行主提示符显示之前会执行这条命令|
|PROMPT_DIRTRIM |用来定义当启用了 \w 或 \W 提示符字符串转义时显示的尾部目录名的数量。被删除的目录名会用一组英文句点替换|
|PS3| select 命令的提示符 |
|PS4 |如果使用了 bash 的 -x 选项，在命令行之前显示的提示信息 |
|PWD| 当前工作目录|
|RANDOM |返回一个 0～32767 的随机数（对其的赋值可作为随机数生成器的种子）|
|READLINE_LINE| 当使用 bind –x 命令时，存储 Readline 缓冲区的内容 |
|READLINE_POINT| 当使用 bind –x 命令时，表示 Readline 缓冲区内容插入点的当前位置 |
|REPLY| read 命令的默认变量 |
|SECONDS| 自从 shell 启动到现在的秒数（对其赋值将会重置计数器） |
|SHELL| bash shell 的全路径名 |
|SHELLOPTS| 已启用 bash shell 选项列表，列表项之间以冒号分隔 |
|SHLVL |shell 的层级；每次启动一个新 bash shell，该值增加 1|
|TIMEFORMAT |指定了 shell 的时间显示格式|
|TMOUT |select 和 read 命令在没输入的情况下等待多久（以秒为单位）。默认值为 0，表示无限长 |
|TMPDIR |目录名，保存 bash shell 创建的临时文件 |
|UID |当前用户的真实用户 ID（数字形式） |

不是所有的默认环境变量都会在运行 set 命令时列出。尽管这些都是默认环境变量，但并不是每一个都必须有一个值。 

## 设置 PATH 环境变量

​		**当在 shell 命令行界面中输入一个外部命令时，shell 必须搜索系统来找到对应的程序。PATH 环境变量定义了用于进行命令和程序查找的目录。PATH 中的目录使用冒号分隔**。 

​		如果命令或者程序的位置没有包括在 PATH 变量中，那么如果不使用绝对路径的话，shell 是没
法找到的。如果 shell 找不到指定的命令或程序，它会产生一个错误信息

​		应用程序放置可执行文件的目录常常不在 PATH 环境变量所包含的目录中。解决的办法是保证 PATH 环境变量包含了所有存放应用程序的目录。 

​		可以把新的搜索目录添加到现有的 PATH 环境变量中，无需从头定义。PATH 中各个目录之间是用冒号分隔的。只需引用原来的 PATH 值，然后再给这个字符串添加新目录就行了。

​		如果希望子 shell 也能找到程序的位置，一定要记得把修改后的 PATH 环境变量导出。程序员通常的办法是将单点符也加入 PATH 环境变量。该单点符代表当前目录

​		对 PATH 变量的修改只能持续到退出或重启系统。这种效果并不能一直持续。

## 定位系统环境变量

​		环境变量在 Linux 系统中的用途很多。接下来的问题是怎样让环境变量的作用持久化。

​		在登入 Linux 系统启动一个 bash shell 时，默认情况下 bash 会在几个文件中查找命令。这些文件叫作启动文件或环境文件。bash 检查的启动文件取决于启动 bash shell 的方式。启动 bash shell 有 3 种方式

- 登录时作为默认登录 shell 
- 作为非登录 shell 的交互式 shell
- 作为运行脚本的非交互 shell

### 登录 shell

​		当登录 Linux 系统时，bash shell 会作为登录 shell 启动。登录 shell 会从 5 个不同的启动文件里读取命令

- **/etc/profile** 
- **$HOME/.bash_profile** 
- **$HOME/.bashrc** 
- **$HOME/.bash_login** 
- **$HOME/.profile** 

/etc/profile 文件是系统上默认的 bash shell 的主启动文件。系统上的每个用户登录时都会执行这个启动文件。 

​		**要留意的是有些 Linux 发行版使用了可拆卸式认证模块（ Pluggable Authentication Modules ，PAM）。在这种情况下，PAM 文件会在 bash shell 启动之前处理，这些文件中可能会包含环境变量。PAM 文件包括 /etc/environment 文件和 $HOME/.pam_environment 文件**。PAM 更多的相关信息可以在 http://linux-pam.org 中找到。

​		另外 4 个启动文件是针对用户的，可根据个人需求定制。

####  /etc/profile 文件

​		/etc/profile 文件是 bash shell 默认的的主启动文件。只要登录了 Linux 系统，bash 就会执行  /etc/profile 启动文件中的命令。不同的 Linux 发行版在这个文件里放了不同的命令。每个发行版的  /etc/profile 文件都有不同的设置和命令。

```
# /etc/profile: system-wide .profile file for the Bourne shell (sh(1))
# and Bourne compatible shells (bash(1), ksh(1), ash(1), ...).

if [ "${PS1-}" ]; then
  if [ "${BASH-}" ] && [ "$BASH" != "/bin/sh" ]; then
    # The file bash.bashrc already sets the default PS1.
    # PS1='\h:\w\$ '
    if [ -f /etc/bash.bashrc ]; then
      . /etc/bash.bashrc
    fi
  else
    if [ "$(id -u)" -eq 0 ]; then
      PS1='# '
    else
      PS1='$ '
    fi
  fi
fi

if [ -d /etc/profile.d ]; then
  for i in /etc/profile.d/*.sh; do
    if [ -r $i ]; then
      . $i
    fi
  done
  unset i
fi
```

上面所显示的 Ubuntu 发行版的 /etc/profile 文件中，涉及了一个叫作 /etc/bash.bashrc 的文件。这个文件包含了系统环境变量。 但是，在 CentOS 发行版的 /etc/profile 文件中，并没有出现这个文件。另外要注意的是，该发行版的/ etc/profile 文件还在内部导出了一些系统环境变量。 

​		**/etc/profile 文件都用到了同一个特性：for语句**。**它用来迭代 /etc/profile.d 目录下的所有文**件。这为 Linux 系统提供了一个放置特定应用程序启动文件的地方，当用户登录时，shell 会执行这些文件。

​		有些文件与系统中的特定应用有关。大部分应用都会创建两个启动文件：一个供 bash shell 使用（使用 .sh 扩展名），一个供 c shell 使用（使用 .csh 扩展名）。 

​		lang.csh 和 lang.sh 文件会尝试去判定系统上所采用的默认语言字符集，然后设置对应的 LANG  环境变量。 

### $HOME 目录下的启动文件

​		**剩下的启动文件都起着同一个作用：提供一个用户专属的启动文件来定义该用户所用到的环境变量。大多数 Linux 发行版只用这四个启动文件中的一到两个**

- **$HOME/.bash_profile** 
- **$HOME/.bashrc** 
- **$HOME/.bash_login** 
- **$HOME/.profile**

这四个文件都以点号开头，这说明它们是隐藏文件。它们位于用户的 HOME 目录下，所以每个用户都可以编辑这些文件并添加自己的环境变量，这些环境变量会在每次启动 bash shell 会话时生效。 

​		Linux 发行版在环境文件方面存在的差异非常大。本节中所列出的 `$HOME` 下的那些文件并非每个用户都有。例如有些用户可能只有一个 $HOME/.bash_profile 文件。这很正常。

​		**shell 会按照按照下列顺序，运行第一个被找到的文件，余下的则被忽略**

```
$HOME/.bash_profile 
$HOME/.bash_login 
$HOME/.profile 
```

注意，**这个列表中并没有 $HOME/.bashrc 文件。这是因为该文件通常通过其他文件运行的**。 

​		$HOME 表示的是某个用户的主目录。它和波浪号（~）的作用一样。 

​		.bash_profile 启动文件会先去检查 HOME 目录中是不是还有一个叫 .bashrc 的启动文件。如果有的话，会先执行启动文件里面的命令。

### 交互式 shell 进程

​		如果 bash shell 不是登录系统时启动的（比如是在命令行提示符下敲入 bash 时启动），那么启动的 shell 叫作交互式 shell。交互式 shell 不会像登录 shell 一样运行，但它依然提供了命令行提示符来输入命令。 

​		**如果 bash 是作为交互式 shell 启动的，它就不会访问 /etc/profile文件，只会检查用户 HOME 目录中的 .bashrc 文件**。 

​		.bashrc 文件有两个作用：一是查看 /etc 目录下通用的 bashrc 文件，二是为用户提供一个定制自己的命令别名和私有脚本函数的地方。 

### 非交互式 shell

​		最后一种 shell 是非交互式 shell。系统执行 shell 脚本时用的就是这种 shell。不同的地方在于它没有命令行提示符。但是当在系统上运行脚本时，也许希望能够运行一些特定启动的命令。 

​		脚本能以不同的方式执行。只有其中的某一些方式能够启动子 shell。

​		为了处理这种情况，bash shell 提供了 BASH_ENV 环境变量。当 shell 启动一个非交互式 shell 进程时，它会检查这个环境变量来查看要执行的启动文件。如果有指定的文件，shell 会执行该文件里的命令，这通常包括 shell 脚本变量设置。 

​		在本书所用的 CentOS Linux 发行版中，这个环境变量在默认情况下并未设置。如果变量未设置，printenv 命令只会返回CLI提示符

```bash
printenv BASH_ENV
```

在本书所用的 Ubuntu 发行版中，变量 BASH_ENV 也没有被设置。记住，如果变量未设置，echo 命令会显示一个空行，然后返回 CLI 提示符

​		那如果 BASH_ENV 变量没有设置，shell 脚本到哪里去获得它们的环境变量呢？别忘了有些 shell脚本是通过启动一个子 shell 来执行的。子 shell 可以继承父 shell 导出过的变量。 

​		举例来说，如果父 shell 是登录 shell，在 /etc/profile、/etc/profile.d/*.sh 和 $HOME/.bashrc 文件中设置并导出了变量，用于执行脚本的子 shell 就能够继承这些变量。 

​		要记住，由父 shell 设置但并未导出的变量都是局部变量。子 shell 无法继承局部变量。

​		对于那些不启动子 shell 的脚本，变量已经存在于当前 shell 中了。所以就算没有设置 BASH_ENV，也可以使用当前 shell 的局部变量和全局变量。 

### 环境变量持久化

​		现在已经了解了各种 shell 进程以及对应的环境文件，找出永久性环境变量就容易多了。也可以利用这些文件创建自己的永久性全局变量或局部变量。 

​		对全局环境变量来说（Linux 系统中所有用户都需要使用的变量），可能更倾向于将新的或修改过的变量设置放在 /etc/profile 文件中，但这可不是什么好主意。如果升级了所用的发行版，这个文件也会跟着更新，那所有定制过的变量设置可就都没有了。 

​		最好是在 /etc/profile.d 目录中创建一个以 .sh 结尾的文件。把所有新的或修改过的全局环境变量设置放在这个文件中。 

​		在大多数发行版中，存储个人用户永久性 bash shell 变量的地方是 `$HOME/.bashrc` 文件。这一 
点适用于所有类型的 shell 进程。但如果设置了 BASH_ENV 变量，那么记住，除非它指向的是  `$HOME/.bashrc`，否则应该将非交互式 shell 的用户变量放在别的地方。 

​		图形化界面组成部分（如 GUI 客户端）的环境变量可能需要在另外一些配置文件中设置，这和设置 bash shell 环境变量的地方不一样。 

​		alias 命令设置就是不能持久的。可以把自己的 alias 设置放在 $HOME/.bashrc 启动文件中，使其效果永久化。 

## 数组变量

​		环境变量有一个很酷的特性就是，它们可作为数组使用。数组是能够存储多个值的变量。这些值可以单独引用，也可以作为整个数组来引用。 

​		**要给某个环境变量设置多个值，可以把值放在括号里，值与值之间用空格分隔**。 

```bash
mytest=(one two three four five) 
```

没什么特别的地方。如果你想把数组像普通的环境变量那样显示，你会失望的。 

```bash
$ echo $mytest 
one 
$ 
```

只有数组的第一个值显示出来了。要引用一个单独的数组元素，就必须用代表它在数组中位置的数值索引值。索引值要用方括号括起来。 

```bash
$ echo ${mytest[2]} 
three 
$ 
```

环境变量数组的索引值都是从零开始。这通常会带来一些困惑。 

​		要显示整个数组变量，可用星号作为通配符放在索引值的位置

```bash
$ echo ${mytest[*]} 
one two three four five 
$ 
```

也可以改变某个索引值位置的值

```bash
$ mytest[2]=seven 
$ 
$ echo ${mytest[*]} 
one two seven four five 
$ 
```

​		甚至能用 unset 命令删除数组中的某个值，但是要小心，这可能会有点复杂。看下面的例子。

```bash
$ unset mytest[2] 
$ 
$ echo ${mytest[*]} 
one two four five 
$ 
$ echo ${mytest[2]} 
 
$ echo ${mytest[3]} 
four 
$ 
```

这个例子用 unset 命令删除在索引值为 2 的位置上的值。显示整个数组时，看起来像是索引里面已经没这个索引了。但当专门显示索引值为 2 的位置上的值时，就能看到这个位置是空的。

​		最后，可以在 unset 命令后跟上数组名来删除整个数组。 

```bash
$ unset mytest 
$ 
$ echo ${mytest[*]} 
 
$ 
```

​		有时数组变量会让事情很麻烦，所以在 shell 脚本编程时并不常用。对其他 shell 而言，数组变量的可移植性并不好，如果需要在不同的 shell 环境下从事大量的脚本编写工作，这会带来很多不便。有些 bash 系统环境变量使用了数组（比如 BASH_VERSINFO），但总体上不会太频繁用到。

# Linux 文件权限

​		Linux 沿用了 Unix 文件权限的办法，即允许用户和组根据每个文件和目录的安全性设置来访问文件。

## Linux 的安全性

​		**Linux 安全系统的核心是用户账户**。每个能进入 Linux 系统的用户都会被分配唯一的用户账户。用户对系统中各种对象的访问权限取决于他们登录系统时用的账户。

​		用户权限是通过创建用户时分配的用户 ID（User ID，通常缩写为 UID）来跟踪的。UID 是数值，每个用户都有唯一的 UID，但在登录系统时用的不是 UID，而是登录名。登录名是用户用来登录系统的最长八字符的字符串（字符可以是数字或字母），同时会关联一个对应的密码。

​		**Linux 系统使用特定的文件和工具来跟踪和管理系统上的用户账户**。讨论文件权限之前，先来看一下 Linux 是怎样处理用户账户的。

### /etc/passwd 文件

​		Linux 系统使用一个专门的文件来将用户的登录名匹配到对应的 UID 值。这个文件就是 /etc/passwd 文件，它包含了一些与用户有关的信息。

​		**root 用户账户是 Linux 系统的管理员，固定分配给它的 UID 是 0**。Linux 系统会为各种各样的功能创建不同的用户账户，而这些账户并不是真的用户。这些账户叫作系统账户，是系统上运行的各种服务进程访问资源用的特殊账户。**所有运行在后台的服务都需要用一个系统用户账户登录到 Linux 系统上**。 

​		在安全成为一个大问题之前，这些服务经常会用 root 账户登录。遗憾的是，如果有非授权的用户攻陷了这些服务中的一个，他立刻就能作为 root 用户进入系统。为了防止发生这种情况，现在运行在 Linux 服务器后台的几乎所有的服务都是用自己的账户登录。这样的话，即使有人攻入了某个服务，也无法访问整个系统。 

​		**Linux 为系统账户预留了 500 以下的 UID 值。有些服务甚至要用特定的 UID 才能正常工作**。为普通用户创建账户时，大多数 Linux 系统会从 500 开始，将第一个可用 UID 分配给这个账户（并非所有的 Linux 发行版都是这样）。 

​		可能已经注意到 /etc/passwd 文件中还有很多用户登录名和 UID 之外的信息。/etc/passwd 文件的字段包含了如下信息

- **登录用户名** 
- **用户密码**
-  **用户账户的 UID（数字形式）** 
- **用户账户的组 ID（GID）（数字形式）** 
- **用户账户的文本描述（称为备注字段）** 
- **用户 HOME 目录的位置** 
- **用户的默认 shell** 

​		/etc/passwd 文件中的密码字段都被设置成了 x，这并不是说所有的用户账户都用相同的密码。在早期的 Linux 上，/etc/passwd 文件里有加密后的用户密码。但鉴于很多程序都需要访问 /etc/passwd 文件获取用户信息，这就成了一个安全隐患。随着用来破解加密密码的工具的不断演进，用心不良的人开始忙于破解存储在 /etc/passwd 文件中的密码。Linux 开发人员需要重新考虑这个策略。 

​		**现在，绝大多数 Linux 系统都将用户密码保存在另一个单独的文件中（叫作 shadow 文件，位置在 /etc/shadow）。只有特定的程序（比如登录程序）才能访问这个文件**。 

​		/etc/passwd 是一个标准的文本文件。可以用任何文本编辑器在 /etc/password 文件里直接手动进行用户管理（比如添加、修改或删除用户账户）。但这样做极其危险。如果 /etc/passwd 文件出现损坏，系统就无法读取它的内容了，这样会导致用户无法正常登录（即便是 root 用户）。用标准的  Linux 用户管理工具去执行这些用户管理功能就会安全许多。 

### /etc/shadow 文件

​		/etc/shadow 文件对 Linux 系统密码管理提供了更多的控制。**只有 root 用户才能访问 /etc/shadow 文件，这让它比起 /etc/passwd 安全许多**

​		/etc/shadow 文件为系统上的每个用户账户都保存了一条记录。记录就像下面这样

```
rich:$1$.FfcK0ns$f1UgiyHQ25wrB/hykCn020:11627:0:99999:7::: 
```

在 /etc/shadow 文件的每条记录中都有 9 个字段

- **与 /etc/passwd 文件中的登录名字段对应的登录名** 
- **加密后的密码**
- **自上次修改密码后过去的天数密码（自 1970 年 1 月 1 日开始计算）** 
- **多少天后才能更改密码** 
- **多少天后必须更改密码** 
- **密码过期前提前多少天提醒用户更改密码** 
- **密码过期后多少天禁用用户账户** 
- **用户账户被禁用的日期（用自 1970 年 1 月 1 日到当天的天数表示）** 
- **预留字段给将来使用** 

使用 shadow 密码系统后，Linux 系统可以更好地控制用户密码。它可以控制用户多久更改一次密码，以及什么时候禁用该用户账户，如果密码未更新的话。 

### 添加新用户

​		用来向 Linux 系统添加新用户的主要工具是 useradd。这个命令简单快捷，可以一次性创建新用户账户及设置用户 HOME 目录结构。useradd 命令使用系统的默认值以及命令行参数来设置用户账户。系统默认值被设置在 /etc/default/useradd 文件中。可以使用加入了 -D 选项的 useradd 命令查看所用 Linux 系统中的这些默认值。

```bash
/usr/sbin/useradd -D 
```

​		一些 Linux 发行版会把 Linux 用户和组工具放在 /usr/sbin 目录下，这个目录可能不在 PATH 环境变量里。如果是这样的话，可以将这个目录添加进 PATH 环境变量，或者用绝对文件路径名来使用这些工具。 

​		在创建新用户时，如果不在命令行中指定具体的值，useradd 命令就会使用 -D 选项所显示的那些默认值。这个例子列出的默认值如下

- **新用户会被添加到 GID 为 100 的公共组；** 
- **新用户的 HOME 目录将会位于 /home/loginname；** 
- **新用户账户密码在过期后不会被禁用；** 
- **新用户账户未被设置过期日期；** 
- **新用户账户将 bash shell 作为默认 shell；** 
- **系统会将 /etc/skel 目录下的内容复制到用户的 HOME 目录下；** 
- **系统为该用户账户在 mail 目录下创建一个用于接收邮件的文件。** 

​		倒数第二个值很有意思。useradd 命令允许管理员创建一份默认的 HOME 目录配置，然后把它作为创建新用户 HOME 目录的模板。这样就能自动在每个新用户的 HOME 目录里放置默认的系统文件。在 Ubuntu Linux 系统上，/etc/skel 目录有下列文件

```bash
sue@DESKTOP-6HVVRHQ:~/WorkSpace/CDemos$ ls -al /etc/skel/
total 20
drwxr-xr-x  2 root root 4096 Jan  7  2025 .
drwxr-xr-x 93 root root 4096 Jul 19 14:42 ..
-rw-r--r--  1 root root  220 Mar 31  2024 .bash_logout
-rw-r--r--  1 root root 3771 Mar 31  2024 .bashrc
-rw-r--r--  1 root root  807 Mar 31  2024 .profile
```

它们是 bash shell 环境的标准启动文件。**系统会自动将这些默认文件复制到创建的每个用户的 HOME 目录**。 

​		可以用默认系统参数创建一个新用户账户，然后检查一下新用户的 HOME 目录。 

```bash
useradd -m test
```

```bash
ls -al /home/test 
```

​		默认情况下，useradd 命令不会创建 HOME 目录，**但是 -m 命令行选项会使其创建 HOME 目录**。此例中，useradd 命令创建了新HOME目录，并将 /etc/skel 目录中的文件复制了过来。

​		要想在创建用户时改变默认值或默认行为，可以使用命令行参数。下表列出了这些参数。 

​		**表：useradd 命令行参数**

| 参数             | 描述                                                         |
| ---------------- | ------------------------------------------------------------ |
| -c comment       | 给新用户添加备注                                             |
| -d home_dir      | 为主目录指定一个名字（如果不想用登录名作为主目录名的话）     |
| -e expire_date   | 用 YYYY-MM-DD 格式指定一个账户过期的日期                     |
| -f inactive_days | 指定这个账户密码过期后多少天这个账户被禁用；0 表示密码一过期就立即禁用，1 表示禁用这个功能 |
| -g initial_group | 指定用户登录组的 GID 或组名                                  |
| -G group ...     | 指定用户除登录组之外所属的一个或多个附加组                   |
| -k               | 必须和 -m 一起使用，将 /etc/skel 目录的内容复制到用户的 HOME 目录 |
| -m               | 创建用户的 HOME 目录                                         |
| -M               | 不创建用户的 HOME 目录（当默认设置里要求创建时才使用这个选项） |
| -n               | 创建一个与用户登录名同名的新组                               |
| -r               | 创建系统账户                                                 |
| -p passwd        | 为用户账户指定默认密码                                       |
| -s shell         | 指定默认的登录 shell                                         |
| -u uid           | 为账户指定唯一的 UID                                         |

​		在创建新用户账户时使用命令行参数可以更改系统指定的默认值。但如果总需要修改某个值的话，最好还是修改一下系统的默认值。 

​		可以在 -D 选项后跟上一个指定的值来修改系统默认的新用户设置。这些参数如下表所示。

​		**图：useradd 更改默认值的参数**

| 参数               | 描述                                         |
| ------------------ | -------------------------------------------- |
| -b default_home    | 更改默认的创建用户 HOME 目录的位置           |
| -e expiration_date | 更改默认的新账户的过期日期                   |
| -f inactive        | 更改默认的新用户从密码过期到账户被禁用的天数 |
| -g group           | 更改默认的组名称或 GID                       |
| -s shell           | 更改默认的登录 shell                         |

更改默认值非常简单

```bash
# useradd -D -s /bin/tsch 
# useradd -D 
GROUP=100 
HOME=/home 
INACTIVE=-1 
EXPIRE= 
SHELL=/bin/tsch 
SKEL=/etc/skel 
CREATE_MAIL_SPOOL=yes 
# 
```

现在，useradd 命令会将 tsch shell 作为所有新建用户的默认登录 shell。 

### 删除用户

​		如果想从系统中删除用户，userdel 可以满足这个需求。默认情况下，userdel 命令会只删除 /etc/passwd 文件中的用户信息，而不会删除系统中属于该账户的任何文件。 如果加上 -r 参数，userdel 会删除用户的 HOME 目录以及邮件目录。然而，系统上仍可能存有已删除用户的其他文件。这在有些环境中会造成问题。 

​		下面是用 userdel 命令删除已有用户账户的一个例子

```bash
# /usr/sbin/userdel -r test 
# ls -al /home/test 
ls: cannot access /home/test: No such file or directory 
# 
```

加了 -r 参数后，用户先前的那个 /home/test 目录已经不存在了。 

​		**在有大量用户的环境中使用 -r 参数时要特别小心。你永远不知道用户是否在其 HOME 目录下存放了其他用户或其他程序要使用的重要文件。记住，在删除用户的 HOME 目录之前一定要检查清楚**！

### 修改用户

​		Linux 提供了一些不同的工具来修改已有用户账户的信息。下表列出了这些工具。 

​		**表：用户账户修改工具**

| 命令     | 描述                                                     |
| -------- | -------------------------------------------------------- |
| usermod  | 修改用户账户的字段，还可以指定主要组以及附加组的所属关系 |
| passwd   | 修改已有用户的密码                                       |
| chpasswd | 从文件中读取登录名密码对，并更新密码                     |
| chage    | 修改密码的过期日期                                       |
| cgfn     | 修改用户账户的备注信息                                   |
| cfsh     | 修改用户账户的默认登录 shell                             |

每种工具都提供了特定的功能来修改用户账户信息。

#### usermod

​		usermod 命令是用户账户修改工具中最强大的一个。它能用来修改 /etc/passwd 文件中的大部分字段，只需用与想修改的字段对应的命令行参数就可以了。参数大部分跟 useradd 命令的参数一样（比如，-c 修改备注字段，-e 修改过期日期，-g 修改默认的登录组）。除此之外，还有另外一些可能派上用场的选项。 

- -l 修改用户账户的登录名。 
- -L 锁定账户，使用户无法登录。 
- -p 修改账户的密码。 
- -U 解除锁定，使用户能够登录

**-L 选项尤其实用。它可以将账户锁定，使用户无法登录，同时无需删除账户和用户的数据。要让账户恢复正常，只要用 -U 选项就行了**。 

#### passwd 和 chpasswd

​		改变用户密码的一个简便方法就是用 passwd 命令

```bash
# passwd test 
Changing password for user test. 
New UNIX password: 
Retype new UNIX password: 
passwd: all authentication tokens updated successfully. 
# 
```

如果只用 passwd 命令，它会改你自己的密码。系统上的任何用户都能改自己的密码，但只有 root 用户才有权限改别人的密码。 

​		**-e 选项能强制用户下次登录时修改密码**。可以先给用户设置一个简单的密码，之后再强制在下次登录时改成他们能记住的更复杂的密码。 

​		如果需要为系统中的大量用户修改密码，chpasswd 命令可以事半功倍。chpasswd 命令能从标准输入自动读取登录名和密码对（由冒号分割）列表，给密码加密，然后为用户账户设置。也可以用重定向命令来将含有 userid:passwd 对的文件重定向给该命令

```bash
# chpasswd < users.txt 
# 
```

#### chsh、chfn 和 chage

​		chsh、chfn 和 chage 工具专门用来修改特定的账户信息。**chsh 命令用来快速修改默认的用户登录 shell。使用时必须用 shell 的全路径名作为参数，不能只用 shell 名**。

```bash
#  chsh -s /bin/csh test 
Changing shell for test. 
Shell changed. 
# 
```

​		chfn 命令提供了在 /etc/passwd 文件的备注字段中存储信息的标准方法。chfn 命令会将用于  Unix 的 finger 命令的信息存进备注字段，而不是简单地存入一些随机文本（比如名字或昵称之类的），或是将备注字段留空。finger 命令可以非常方便地查看 Linux 系统上的用户信息。 

```bash
# finger rich 
Login: rich                             Name: Rich Blum 
Directory: /home/rich                   Shell: /bin/bash 
On since Thu Sep 20 18:03 (EDT) on pts/0 from 192.168.1.2 
No mail. 
No Plan. 
# 
```

出于安全性考虑，很多 Linux 系统管理员会在系统上禁用 finger 命令，不少 Linux 发行版甚至都没有默认安装该命令。 

​		如果在使用 chfn 命令时没有参数，它会向你询问要将哪些适合的内容加进备注字段。 

```bash
# chfn test 
Changing finger information for test. 
Name []: Ima Test 
Office []: Director of Technology 
Office Phone []: (123)555-1234 
Home Phone []: (123)555-9876 
 
Finger information changed. 
# finger test 
Login: test                             Name: Ima Test 
Directory: /home/test                   Shell: /bin/csh 
Office: Director of Technology          Office Phone: (123)555-1234 
Home Phone: (123)555-9876 
Never logged in. 
No mail. 
No Plan. 
# 
```

​		查看 /etc/passwd 文件中的记录，会看到下面这样的结果。

```bash
# grep test /etc/passwd 
test:x:504:504:Ima Test,Director of Technology,(123)555- 
1234,(123)555-9876:/home/test:/bin/csh 
# 
```

所有的指纹信息现在都存在 /etc/passwd 文件中了。 

​		最后，chage 命令用来帮助管理用户账户的有效期。你需要对每个值设置多个参数，如下表所示。 

​		**表：chage 命令参数**

| 参数 | 描述                               |
| ---- | ---------------------------------- |
| -d   | 设置上次修改密码到现在的天数       |
| -E   | 设置密码过期的日期                 |
| -I   | 设置密码过期到锁定账户的天数       |
| -m   | 设置修改密码之间最少要多少天       |
| -W   | 设置密码过期前多久开始出现提醒信息 |

​		chage 命令的日期值可以用下面两种方式中的任意一种

- YYYY-MM-DD 格式的日期 
- 代表从 1970 年 1 月 1 日起到该日期天数的数值 

​		chage 命令中有个好用的功能是设置账户的过期日期。有了它，就能创建在特定日期自动过期的临时用户，再也不需要记住删除用户了。过期的账户跟锁定的账户很相似：账户仍然存在，但用户无法用它登录。

## 使用 Linux 组

​		用户账户在控制单个用户安全性方面很好用，但涉及在共享资源的一组用户时就捉襟见肘了。为了解决这个问题，Linux 系统采用了另外一个安全概念——组（group）。**组权限允许多个用户对系统中的对象（比如文件、目录或设备等）共享一组共用的权限**。

​		Linux 发行版在处理默认组的成员关系时略有差异。有些 Linux 发行版会创建一个组，把所有用户都当作这个组的成员。遇到这种情况要特别小心，因为文件很有可能对其他用户也是可读的。有些发行版会为每个用户创建单独的一个组，这样可以更安全一些。

> ​		例如，Ubuntu 就会为每个用户创建一个单独的与用户账户同名的组。在添加用户前后可用 grep 命令或 tail 命令查看 /etc/group 文件的内容比较（grep USERNAME /etc/group 或 tail /etc/group）。 

​		每个组都有唯一的 GID——跟 UID 类似，在系统上这是个唯一的数值。除了 GID，每个组还有唯一的组名。Linux 系统上有一些组工具可以创建和管理你自己的组。

### /etc/group 文件

​		与用户账户类似，组信息也保存在系统的一个文件中。/etc/group 文件包含系统上用到的每个组的信息。下面是一些来自 Linux 系统上 /etc/group 文件中的典型例子。

```
root:x:0:root 
bin:x:1:root,bin,daemon 
daemon:x:2:root,bin,daemon 
sys:x:3:root,bin,adm 
adm:x:4:root,adm,daemon 
rich:x:500: 
mama:x:501: 
katie:x:502: 
jessica:x:503: 
mysql:x:27: 
test:x:504: 
```

和 UID 一样，GID 在分配时也采用了特定的格式。系统账户用的组通常会分配低于 500 的 GID 值，而用户组的 GID 则会从 500 开始分配。/etc/group 文件有 4 个字段

- 组名 
- 组密码 
- GID 
- 属于该组的用户列表 

组密码允许非组内成员通过它临时成为该组成员。这个功能并不很普遍，但确实存在。 

​		千万不能通过直接修改 /etc/group 文件来添加用户到一个组，要用 usermod 命令。在添加用户到不同的组之前，首先得创建组。 

​		用户账户列表某种意义上有些误导人。你会发现，在列表中，**有些组并没有列出用户。这并不是说这些组没有成员**。**当一个用户在 /etc/passwd 文件中指定某个组作为默认组时，用户账户不会作为该组成员再出现在 /etc/group 文件中**。多年以来，被这个问题难倒的系统管理员可不是一两个呢。 

### 创建新组

​		groupadd 命令可在系统上创建新组。 

```bash
# /usr/sbin/groupadd shared 
# tail /etc/group 
haldaemon:x:68: 
xfs:x:43: 
gdm:x:42: 
rich:x:500: 
mama:x:501: 
katie:x:502: 
jessica:x:503: 
mysql:x:27: 
test:x:504: 
shared:x:505: 
# 
```

在创建新组时，默认没有用户被分配到该组。groupadd 命令没有提供将用户添加到组中的选项，但可以用 usermod 命令来弥补这一点。 

```bash
# /usr/sbin/usermod -G shared rich  
# /usr/sbin/usermod -G shared test 
# tail /etc/group 
haldaemon:x:68: 
xfs:x:43: 
gdm:x:42: 
rich:x:500: 
mama:x:501: 
katie:x:502: 
jessica:x:503: 
mysql:x:27: 
test:x:504: 
shared:x:505:rich, test 
# 
```

shared 组现在有两个成员：test 和 rich。usermod 命令的 -G 选项会把这个新组添加到该用户账户的组列表里。 

​		如果更改了已登录系统账户所属的用户组，该用户必须登出系统后再登录，组关系的更改才能生效。为用户账户分配组时要格外小心。如果加了 -g 选项，指定的组名会替换掉该账户的默认组。-G 选项则将该组添加到用户的属组的列表里，不会影响默认组。 

### 修改组

​		在 /etc/group 文件中可以看到，需要修改的组信息并不多。groupmod 命令可以修改已有组的 GID（加 -g 选项）或组名（加 -n 选项）。 

```bash
# /usr/sbin/groupmod -n sharing shared  
# tail /etc/group 
haldaemon:x:68:
xfs:x:43: 
gdm:x:42: 
rich:x:500: 
mama:x:501: 
katie:x:502: 
jessica:x:503: 
mysql:x:27: 
test:x:504: 
sharing:x:505:test,rich 
# 
```

**修改组名时，GID 和组成员不会变，只有组名改变。由于所有的安全权限都是基于 GID 的，可以随意改变组名而不会影响文件的安全性。**

## 理解文件权限

### 使用文件权限符

​		ls 命令可以用来查看 Linux 系统上的文件、目录和设备的权限。

```bash
$ ls –l  
total 68 
-rw-rw-r-- 1 rich rich   50 2010-09-13 07:49 file1.gz 
-rw-rw-r-- 1 rich rich   23 2010-09-13 07:50 file2 
-rw-rw-r-- 1 rich rich   48 2010-09-13 07:56 file3 
-rw-rw-r-- 1 rich rich   34 2010-09-13 08:59 file4 
-rwxrwxr-x 1 rich rich 4882 2010-09-18 13:58 myprog 
-rw-rw-r-- 1 rich rich  237 2010-09-18 13:58 myprog.c 
drwxrwxr-x 2 rich rich 4096 2010-09-03 15:12 test1 
drwxrwxr-x 2 rich rich 4096 2010-09-03 15:12 test2 
$
```

输出结果的第一个字段就是描述文件和目录权限的编码。这个字段的第一个字符代表了对象的类型

- `-` 代表文件 
- d 代表目录 
- l 代表链接 
- c 代表字符型设备 
- b 代表块设备 
- n 代表网络设备 

​		之后有 3 组三字符的编码。每一组定义了 3 种访问权限： 

- r 代表对象是可读的 
- w 代表对象是可写的 

- x 代表对象是可执行的 

​		若没有某种权限，在该权限位会出现单破折线。这3组权限分别对应对象的 3 个安全级别： 

- 对象的属主 
- 对象的属组 
- 系统其他用户 

​		**图：Linux 文件权限**

![Linux 文件权限](imgs\Linux 文件权限.png)

讨论这个问题的最简单的办法就是找个例子，然后逐个分析文件权限

```
-rwxrwxr-x 1 rich rich 4882 2010-09-18 13:58 myprog 
```

文件 myprog 有下面 3 组权限

- rwx：文件的属主（设为登录名 rich）。 
- rwx：文件的属组（设为组名 rich）。 
- r-x：系统上其他人。

​		这些权限说明登录名为 rich 的用户可以读取、写入以及执行这个文件（可以看作有全部权限）。类似地，rich 组的成员也可以读取、写入和执行这个文件。然而不属于 rich 组的其他用户只能读取和执行这个文件：w 被单破折线取代了，说明这个安全级别没有写入权限。 

### 默认文件权限

​		你可能会问这些文件权限从何而来，答案是 umask。umask s命令用来设置所创建文件和目录的默认权限。 

```bash
$ touch newfile 
$ ls -al newfile 
-rw-r--r--    1 rich     rich            0 Sep 20 19:16 newfile 
$ 
```

touch 命令用分配给我的用户账户的默认权限创建了这个文件。umask 命令可以显示和设置这个默认权限。

```bash
$ umask 
0022 
$ 
```

​		**umask 命令设置没那么简单明了，想弄明白其工作原理就更混乱了。第一位代表了一项特别的安全特性，叫作粘着位（sticky bit）**。后面的 3 位表示文件或目录对应的 umask 八进制值。要理解umask 是怎么工作的，得先理解八进制模式的安全性设置。 

​		八进制模式的安全性设置先获取这 3 个 rwx 权限的值，然后将其转换成 3 位二进制值，用一个八进制值来表示。在这个二进制表示中，每个位置代表一个二进制位。因此，如果读权限是唯一置位的权限，权限值就是 r--，转换成二进制值就是 100，代表的八进制值是 4。下表列出了可能会遇到的组合。 

​		**表：Linux 文件权限码**

| 权限 | 二进制值 | 八进制值 | 描述             |
| ---- | -------- | -------- | ---------------- |
| ---  | 000      | 0        | 没有任何权限     |
| --x  | 001      | 1        | 只有执行权限     |
| -w-  | 010      | 2        | 只有写入权限     |
| -wx  | 011      | 3        | 有写入和执行权限 |
| r--  | 100      | 4        | 只有读取权限     |
| r-x  | 101      | 5        | 有读取和执行权限 |
| rw-  | 110      | 6        | 有读取和写入权限 |
| rwx  | 111      | 7        | 有全部权限       |

八进制模式先取得权限的八进制值，然后再把这三组安全级别（属主、属组和其他用户）的八进制值顺序列出。因此，八进制模式的值 664 代表属主和属组成员都有读取和写入的权限，而其他用户都只有读取权限。 

​		了解八进制模式权限是怎么工作的之后，umask 值反而更叫人困惑了。我的 Linux 系统上默认的八进制的 umask 值是0022，而我所创建的文件的八进制权限却是644，这是如何得来的呢？ 

​		**umask值只是个掩码。它会屏蔽掉不想授予该安全级别的权限。要把umask值从对象的全权限值中减掉**。对文件来说，全权限的值是666（所有用户都有读和写的权限）；而对目录来说，则是777（所有用户都有读、写、执行权限）。 

​		所以在上例中，文件一开始的权限是 666，减去umask值 022 之后，剩下的文件权限就成了644。

​		在大多数 Linux 发行版中，umask 值通常会设置在 /etc/profile 启动文件中，不过有一些是设置在 /etc/login.defs 文件中的（如 Ubuntu）。**可以用 umask 命令为默认 umask 设置指定一个新值。**

```bash
$ umask 026 
$ touch newfile2 
$ ls -l newfile2 
-rw-r-----    1 rich     rich            0 Sep 20 19:46 newfile2 
$ 
```

在把 umask 值设成 026 后，默认的文件权限变成了 640，因此新文件现在对组成员来说是只读的，而系统里的其他成员则没有任何权限。 

​		umask 值同样会作用在创建目录上。 

```bash
$ mkdir newdir 
$ ls -l 
drwxr-x--x    2 rich     rich         4096 Sep 20 20:11 newdir/ 
$ 
```

由于目录的默认权限是 777，umask 作用后生成的目录权限不同于生成的文件权限。umask 值 026 会从 777 中减去，留下来 751 作为目录权限设置。 

## 改变安全性设置

​		如果已经创建了一个目录或文件，需要改变它的安全性设置，在 Linux 系统上有一些工具能够完成这项任务。

### 改变权限

​		chmod 命令用来改变文件和目录的安全性设置。该命令的格式如下

```bash
chmod options mode file 
```

mode 参数可以使用八进制模式或符号模式进行安全性设置。八进制模式设置非常直观，直接用期望赋予文件的标准 3 位八进制权限码即可。

```bash
$ chmod 760 newfile 
$ ls -l newfile 
-rwxrw----    1 rich     rich            0 Sep 20 19:16 newfile 
$ 
```

八进制文件权限会自动应用到指定的文件上。符号模式的权限就没这么简单了。 

​		与通常用到的 3 组三字符权限字符不同，chmod 命令采用了另一种方法。下面是在符号模式下指定权限的格式。

```
[ugoa…][[+-=][rwxXstugo…] 
```

第一组字符定义了权限作用的对象

- u 代表用户 
- g 代表组 
- o 代表其他 
- a 代表上述所有 

下一步，后面跟着的符号表示你是想在现有权限基础上增加权限（+），还是在现有权限基础上移除权限（-），或是将权限设置成后面的值（=）。 

​		最后，第三个符号代表作用到设置上的权限。你会发现，这个值要比通常的 rwx 多。额外的设置有以下几项。 

- **X**：如果对象是目录或者它已有执行权限，赋予执行权限。
-  **s**：运行时重新设置 UID 或 GID。 
- **t**：保留文件或目录。 
- **u**：将权限设置为跟属主一样。 
- **g**：将权限设置为跟属组一样。 
- **o**：将权限设置为跟其他用户一样。 

​		像这样使用这些权限

```bash
$ chmod o+r newfile 
 $ ls -lF newfile 
 -rwxrw-r--    1 rich     rich            0 Sep 20 19:16 newfile* 
$ 
```

不管其他用户在这一安全级别之前都有什么权限，o+r 都给这一级别添加读取权限。 

```bash
$ chmod u-x newfile 
$ ls -lF newfile 
-rw-rw-r--    1 rich     rich            0 Sep 20 19:16 newfile 
$ 
```

u-x 移除了属主已有的执行权限。注意 ls 命令的 -F 选项，它能够在具有执行权限的文件名后加一个星号。

​		options 为 chmod 命令提供了另外一些功能。-R 选项可以让权限的改变递归地作用到文件和子目录。可以使用通配符指定多个文件，然后利用一条命令将权限更改应用到这些文件上。 

### 改变所属关系

​		有时需要改变文件的属主。Linux 提供了两个命令来实现这个功能：chown 命令用来改变文件的属主，chgrp 命令用来改变文件的默认属组。 

​		chown 命令的格式如下

```bash
chown options owner[.group] file 
```

可用登录名或 UID 来指定文件的新属主

```bash
# chown dan newfile 
 # ls -l newfile 
 -rw-rw-r--    1 dan      rich            0 Sep 20 19:16 newfile 
# 
```

​		chown 命令也支持同时改变文件的属主和属组。 

```bash
# chown dan.shared newfile 
# ls -l newfile 
-rw-rw-r--    1 dan      shared             0 Sep 20 19:16 newfile 
# 
```

如果不嫌麻烦，可以只改变一个目录的默认属组。 

```bash
# chown .rich newfile 
# ls -l newfile 
-rw-rw-r--    1 dan      rich            0 Sep 20 19:16 newfile 
# 
```

最后，如果 Linux 系统采用和用户登录名匹配的组名，可以只用一个条目就改变二者。

```bash
# chown test. newfile 
# ls -l newfile 
-rw-rw-r--    1 test    test             0 Sep 20 19:16 newfile 
# 
```

chown 命令采用一些不同的选项参数。-R 选项配合通配符可以递归地改变子目录和文件的所属关系。-h 选项可以改变该文件的所有符号链接文件的所属关系。 

​		只有 root 用户能够改变文件的属主。任何属主都可以改变文件的属组，但前提是属主必须是原属组和目标属组的成员。

​		chgrp 命令可以更改文件或目录的默认属组。

```bash
$ chgrp shared newfile 
$ ls -l newfile 
-rw-rw-r--    1 rich     shared          0 Sep 20 19:16 newfile 
$ 
```

用户账户必须是这个文件的属主，除了能够更换属组之外，还得是新组的成员。现在 shared 组的任意一个成员都可以写这个文件了。这是 Linux 系统共享文件的一个途径。然而，在系统中给一组用户共享文件也会变得很复杂。

## 共享文件

​		**Linux 系统上共享文件的方法是创建组**。但在一个完整的共享文件的环境中，事情会复杂得多。 

​		创建新文件时，Linux 会用默认的 UID 和 GID 给文件分配权限。想让其他人也能访问文件，要么改变其他用户所在安全组的访问权限，要么就给文件分配一个包含其他用户的新默认属组。 

​		如果想在大范围环境中创建文档并将文档与人共享，这会很烦琐。幸好有一种简单的方法可以解决这个问题。 

​		**Linux 还为每个文件和目录存储了 3 个额外的信息位**

- **设置用户 ID（SUID）**：当文件被用户使用时，程序会以文件属主的权限运行。 
- **设置组 ID（SGID）**：对文件来说，程序会以文件属组的权限运行；对目录来说，目录中创建的新文件会以目录的默认属组作为默认属组。 
- **粘着位**：进程结束后文件还驻留（粘着）在内存中。 

​		SGID 位对文件共享非常重要。启用 SGID 位后，可以强制在一个共享目录下创建的新文件都属于该目录的属组，这个组也就成为了每个用户的属组。 

​		SGID 可通过 chmod 命令设置。它会加到标准 3 位八进制值之前（组成 4 位八进制值），或者在符号模式下用符号 s。 

​		如果用八进制模式，需要知道这些位的位置，如下表所示

​		**表：chmod SUID、SGID 和粘着位的八进制值**

| 二进制值 | 八进制值 | 描述                    |
| -------- | -------- | ----------------------- |
| 000      | 0        | 所有位都清零            |
| 001      | 1        | 粘着位置位              |
| 010      | 2        | SGID 位置位             |
| 011      | 3        | SGID 位和粘着位都置位   |
| 100      | 4        | SUID 位置位             |
| 101      | 5        | SUID 位和粘着位都置位   |
| 110      | 6        | SUID 位和 SGID 位都置位 |
| 111      | 7        | 所有位都置位            |

​		**因此，要创建一个共享目录，使目录里的新文件都能沿用目录的属组，只需将该目录的 SGID 位置位**。 

```bash
$ mkdir testdir 
$ ls -l 
drwxrwxr-x    2 rich     rich         4096 Sep 20 23:12 testdir/ 
$ chgrp shared testdir 
$ chmod g+s testdir 
$ ls -l 
drwxrwsr-x    2 rich     shared       4096 Sep 20 23:12 testdir/ 
$ umask 002 
$ cd testdir 
$ touch testfile 
$ ls -l 
total 0 
-rw-rw-r--    1 rich     shared          0 Sep 20 23:13 testfile 
$ 
```

首先，用 mkdir 命令来创建希望共享的目录。然后通过 chgrp 命令将目录的默认属组改为包含所有需要共享文件的用户的组（你必须是该组的成员）。最后，将目录的 SGID 位置位，以保证目录中新建文件都用 shared 作为默认属组。 

​		为了让这个环境能正常工作，所有组成员都需把他们的 umask 值设置成文件对属组成员可写。在前面的例子中，umask 改成了 002，所以文件对属组是可写的。 

​		做完了这些，组成员就能到共享目录下创建新文件了。跟期望的一样，新文件会沿用目录的属组，而不是用户的默认属组。现在 shared 组的所有用户都能访问这个文件了。 

# 管理文件系统

​		使用Linux系统时，需要作出的决策之一就是为存储设备选用什么文件系统。大多数Linux发行版在安装时会非常贴心地提供默认的文件系统，大多数入门级用户想都不想就用了默认的那个

​		使用默认文件系统未必就不好，但了解一下可用的选择有时也会有所帮助。

## 探索 Linux 文件系统

​		Linux 的文件系统为在硬盘中存储的 0 和 1 和应用中使用的文件与目录之间搭建起了一座桥梁。Linux 支持多种类型的文件系统管理文件和目录。每种文件系统都在存储设备上实现了虚拟目录结构，仅特性略有不同。

### 基本的 Linux 文件系统

​		Linux 最初采用的是一种简单的文件系统，它模仿了 Unix 文件系统的功能。

#### ext 文件系统

​		Linux 操作系统中引入的最早的文件系统叫作扩展文件系统（extended filesystem，简记为 ext）。它为 Linux 提供了一个基本的类 Unix 文件系统：使用虚拟目录来操作硬件设备，在物理设备上按定长的块来存储数据。 

​		**ext 文件系统采用名为索引节点的系统来存放虚拟目录中所存储文件的信息。索引节点系统在每个物理设备中创建一个单独的表（称为索引节点表）来存储这些文件的信息。存储在虚拟目录中的每一个文件在索引节点表中都有一个条目。ext 文件系统名称中的 extended 部分来自其跟踪的每个文件的额外数据**，包括

- **文件名** 
- **文件大小** 
- **文件的属主** 
- **文件的属组** 
- **文件的访问权限** 
- **指向存有文件数据的每个硬盘块的指针** 

Linux 通过唯一的数值（称作索引节点号）来引用索引节点表中的每个索引节点，这个值是创建文件时由文件系统分配的。文件系统通过索引节点号而不是文件全名及路径来标识文件。 

#### ext2 文件系统

​		最早的 ext 文件系统有不少限制，比如文件大小不得超过 2 GB。在 Linux 出现后不久，ext 文件系统就升级到了第二代扩展文件系统，叫作 ext2。

​		ext2 文件系统是 ext 文件系统基本功能的一个扩展，但保持了同样的结构。**ext2 文件系统扩展了索引节点表的格式来保存系统上每个文件的更多信息**。 

​		ext2 的索引节点表为文件添加了创建时间值、修改时间值和最后访问时间值来帮助系统管理员追踪文件的访问情况。ext2 文件系统还将允许的最大文件大小增加到了 2 TB（在 ext2 的后期版本中增加到了 32 TB），以容纳数据库服务器中常见的大文件。 

​		除了扩展索引节点表外，ext2 文件系统还改变了文件在数据块中存储的方式。**ext 文件系统常见的问题是在文件写入到物理设备时，存储数据用的块很容易分散在整个设备中（称作碎片化，**
**fragmentation）**。数据块的碎片化会降低文件系统的性能，因为需要更长的时间在存储设备中查找特定文件的所有块。

​		保存文件时，**ext2 文件系统通过按组分配磁盘块来减轻碎片化**。通过将数据块分组，文件系统在读取文件时不需要为了数据块查找整个物理设备。

​		多年来，ext 文件系统一直都是 Linux 发行版采用的默认文件系统。但它也有一些限制。索引节点表虽然支持文件系统保存有关文件的更多信息，但会对系统造成致命的问题。文件系统每次存储或更新文件，它都要用新信息来更新索引节点表。问题在于这种操作并非总是一气呵成的。 

​		如果计算机系统在存储文件和更新索引节点表之间发生了什么，这二者的内容就不同步了。ext2 文件系统由于容易在系统崩溃或断电时损坏而臭名昭著。即使文件数据正常保存到了物理设备上，如果索引节点表记录没完成更新的话，ext2 文件系统甚至都不知道那个文件存在！ 

​		很快开发人员就开始尝试开发不同的 Linux 文件系统了。 

### 日志文件系统

​		日志文件系统为 Linux 系统增加了一层安全性。**它不再使用之前先将数据直接写入存储设备再更新索引节点表的做法，而是先将文件的更改写入到临时文件（称作日志，journal）中。在数据成功写到存储设备和索引节点表之后，再删除对应的日志条目**。 

​		如果系统在数据被写入存储设备之前崩溃或断电了，日志文件系统下次会读取日志文件并处理上次留下的未写入的数据。

​		Linux 中有 3 种广泛使用的日志方法，每种的保护等级都不相同，如下表所示

​		**表：文件系统日志方法**

| 方法     | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| 数据模式 | 索引节点和文件都会被写入日志；丢失数据风险低，但性能差       |
| 有序模式 | 只有索引节点数据会被写入日志，但只有数据成功写入后才删除；在性能和安全性之间取得了良好的折中 |
| 回写模式 | 只有索引节点数据会被写入日志，但不控制文件数据何时写入；丢失数据风险高，但仍比不用日志好 |

数据模式日志方法是目前为止最安全的数据保护方法，但同时也是最慢的。所有写到存储设备上的数据都必须写两次：第一次写入日志，第二次写入真正的存储设备。这样会导致性能很差，尤其是对要做大量数据写入的系统而言。 

#### ext3 文件系统

​		2001 年，ext3 文件系统被引入 Linux 内核中，直到最近都是几乎所有 Linux 发行版默认的文件系统。**它采用和 ext2 文件系统相同的索引节点表结构，但给每个存储设备增加了一个日志文件，以将准备写入存储设备的数据先记入日志**。 

​		默认情况下，ext3 文件系统用有序模式的日志功能——只将索引节点信息写入日志文件，直到数据块都被成功写入存储设备才删除。可以在创建文件系统时用简单的一个命令行选项将 ext3 文件系统的日志方法改成数据模式或回写模式。 

​		虽然 ext3 文件系统为 Linux 文件系统添加了基本的日志功能，但它仍然缺少一些功能。例如 **ext3 文件系统无法恢复误删的文件**，它没有任何内建的数据压缩功能（虽然有个需单独安装的补丁支持这个功能），**ext3 文件系统也不支持加密文件**。鉴于这些原因，Linux 项目的开发人员选择再接再厉，继续改进 ext3 文件系统。

#### ext4 文件系统

​		扩展 ext3 文件系统功能的结果是 ext4 文件系统。ext4 文件系统在 2008 年受到 Linux 内核官方支持，现在已是大多数流行的 Linux 发行版采用的默认文件系统，比如 Ubuntu。

​		**除了支持数据压缩和加密，ext4 文件系统还支持一个称作区段（extent）的特性。区段在存储设备上按块分配空间，但在索引节点表中只保存起始块的位置。由于无需列出所有用来存储文中数据的数据块，它可以在索引节点表中节省一些空间**。 

​		ext4 还引入了块预分配技术（block preallocation）。如果想在存储设备上给一个知道要变大的文件预留空间，ext4 文件系统可以为文件分配所有需要用到的块，而不仅仅是那些现在已经用到的块。ext4 文件系统用 0 填满预留的数据块，不会将它们分配给其他文件。

#### Reiser 文件系统

​		2001 年，Hans Reiser 为 Linux 创建了第一个称为 ReiserFS 的日志文件系统。**ReiserFS 文件系统只支持回写日志模式**——只把索引节点表数据写到日志文件。ReiserFS 文件系统也因此成为 Linux 上最快的日志文件系统之一。 

​		有两个有意思的特性被引入了 ReiserFS 文件系统：一个是可以在线调整已有文件系统的大小；另一个是被称作尾部压缩（tailpacking）的技术，该技术能将一个文件的数据填进另一个文件的数据块中的空白空间。如果必须为已有文件系统扩容来容纳更多的数据，在线调整文件系统大小功能非常好用。 

#### JFS 文件系统

​		作为可能依然在用的最老的日志文件系统之一，JFS（Journaled File System，日志化文件系统）是 IBM 在 1990 年为其 Unix 衍生版 AIX 开发的。然而直到第 2 版，它才被移植到 Linux 环境中。

> ​		官方称 JFS 文件系统的第 2 版为 JFS2，但大多数 Linux 系统提到它时都只用 JFS。
>
> ​		此处“日志化文件系统”是指 Journaled File System 这一 Journal File System 概念的具体实现。为防止混淆，后文中都将用 JFS 缩写代替。  

​		JFS 文件系统采用的是有序日志方法，即只在日志中保存索引节点表数据，直到真正的文件数据被写进存储设备时才删除它。这个方法在 ReiserFS 的速度和数据模式日志方法的完整性之间的采取的一种折中。 

​		JFS 文件系统采用基于区段的文件分配，即为每个写入存储设备的文件分配一组块。这样可以减少存储设备上的碎片。

​		除了用在 IBM Linux 上外，JFS文件系统并没有流行起来，但有可能在同 Linux 打交道的日子中碰到它。 

#### XFS 文件系统

​		XFS 日志文件系统是另一种最初用于商业 Unix 系统而如今走进 Linux 世界的文件系统。美国硅图公司（SGI）最初在 1994 年为其商业化的 IRIX Unix 系统开发了 XFS。2002 年，它被发布到了适用于 Linux 环境的版本。 

​		XFS 文件系统采用回写模式的日志，在提供了高性能的同时也引入了一定的风险，因为实际数据并未存进日志文件。XFS 文件系统还允许在线调整文件系统的大小，这点类似于 ReiserFS 文件系统，除了 XFS 文件系统只能扩大不能缩小。 

### 写时复制文件系统

​		采用了日志式技术，就必须在安全性和性能之间做出选择。尽管数据模式日志提供了最高的安全性，但是会对性能带来影响，因为索引节点和数据都需要被日志化。如果是回写模式日志，性能倒是可以接受，但安全性就会受到损害。 

​		就文件系统而言，日志式的另一种选择是一种叫作写时复制（copy-on-write，COW）的技术。COW 利用快照兼顾了安全性和性能。如果要修改数据，会使用克隆或可写快照。**修改过的数据并不会直接覆盖当前数据，而是被放入文件系统中的另一个位置上。即便是数据修改已经完成，之前的旧数据也不会被重写。** 

​		COW 文件系统已日渐流行，接下来会简要概览其中最流行的两种（Btrf 和 ZFS）。 

#### ZFS 文件系统

​		COW 文件系统 ZFS 是由 Sun 公司于 2005 年研发的，用于 OpenSolaris 操作系统，从 2008 年起开始向 Linux 移植，最终在 2012 年投入 Linux 产品的使用。

​		ZFS 是一个稳定的文件系统，与 Resier4、Btrfs 和 ext4 势均力敌。它最大的弱项就是没有使用 GPL 许可。自 2013 年发起的 OpenZFS 项目有可能改变这种局面。但是，在获得 GPL 许可之前，ZFS 有可能终无法成为 Linux 默认的文件系统。 

#### Btrf 文件系统

​		Btrfs 文件系统是 COW 的新人，也被称为 B 树文件系统。它是由 Oracle 公司于 2007 年开始研发的。Btrfs 在 Reiser4 的诸多特性的基础上改进了可靠性。另一些开发人员最终也加入了开发过程，帮助 Btrfs 快速成为了最流行的文件系统。究其原因，则要归于它的稳定性、易用性以及能够动态调整已挂载文件系统的大小。OpenSUSE Linux 发行版最近将 Btrfs 作为其默认文件系统。除此之外，该文件系统也出现在了其他 Linux 发行版中（如 RHEL），不过并不是作为默认文件系统。

## 操作文件系统

​		Linux 提供了一些不同的工具，可以利用它们轻松地在命令行中进行文件系统操作。可使用键盘随心所欲地创建新的文件系统或者修改已有的文件系统

### 创建分区

​		一开始，必须在存储设备上创建分区来容纳文件系统。分区可以是整个硬盘，也可以是部分硬盘，以容纳虚拟目录的一部分。 

​		fdisk 工具用来帮助管理安装在系统上的任何存储设备上的分区。它是个交互式程序，允许输入命令来逐步完成硬盘分区操作。

​		要启动 fdisk 命令，必须指定要分区的存储设备的设备名，另外还得有超级用户权限。如果在没有对应权限的情况下使用该命令，会得到类似于下面这种错误提示。 

```bash
$ fdisk /dev/sdb 
 
Unable to open /dev/sdb 
$ 
```

​		有时候，创建新磁盘分区最麻烦的事情就是找出安装在 Linux 系统中的物理磁盘。Linux 采用了一种标准格式来为硬盘分配设备名称，但是得熟悉这种格式。对于老式的 IDE 驱动器，Linux 使用的是 /dev/hdx。其中 x 表示一个字母，具体是什么要根据驱动器的检测顺序（第一个驱动器是 a，第二个驱动器是 b，以此类推）。对于较新的 SATA 驱动器和 SCSI 驱动器，Linux 使用 /dev/sdx。其中的 x 具体是什么也要根据驱动器的检测顺序（和之前一样，第一个驱动器是 a，第二个驱动器是 b，以此类推）。在格式化分区之前，最好再检查一下是否正确指定了驱动器。

​		如果拥有超级用户权限并指定了正确的驱动器，那就可以进入 fdisk 工具的操作界面了。下面展示了该命令在 CentOS 发行版中的使用情景。 

```bash
$ sudo fdisk /dev/sdb 
[sudo] password for Christine: 
Device contains neither a valid DOS partition table,  
nor Sun, SGI or OSF disklabel 
Building a new DOS disklabel with disk identifier 0xd3f759b5. 
Changes will remain in memory only  
until you decide to write them. 
After that, of course, the previous content won't be recoverable. 
 
Warning: invalid flag 0x0000 of partition table 4 will  
be corrected by w(rite) 
 
[...] 
Command (m for help): 
```

> ​		如果这是第一次给该存储设备分区，fdisk 会警告你设备上没有分区表。 

​		fdisk 交互式命令提示符使用单字母命令来告诉 fdisk 做什么。下表显示了 fdisk 命令提示符下的可用命令。

​		**表：fdisk 命令**

| 命令 | 描述                               |
| ---- | ---------------------------------- |
| a    | 设置活动分区标志                   |
| b    | 编辑 BSD Unix 系统用的磁盘标签     |
| c    | 设置 DOS 兼容标志                  |
| d    | 删除分区                           |
| l    | 显示可用的分区类型                 |
| m    | 显示命令选项                       |
| n    | 添加一个新分区                     |
| o    | 创建 DOS 分区表                    |
| p    | 显示当前分区表                     |
| q    | 退出，不保存更改                   |
| s    | 为 Sun Unix 系统创建一个新磁盘标签 |
| t    | 修改分区的系统 ID                  |
| u    | 改变使用的存储单位                 |
| v    | 验证分区表                         |
| w    | 将分区表写入磁盘                   |
| x    | 高级功能                           |

尽管看上去很恐怖，但实际上在日常工作中用到的只有几个基本命令。 

​		对于初学者，可以用 p 命令将一个存储设备的详细信息显示出来。

```
Command (m for help): p 
 
Disk /dev/sdb: 5368 MB, 5368709120 bytes 
255 heads, 63 sectors/track, 652 cylinders 
Units = cylinders of 16065 * 512 = 8225280 bytes 
Sector size (logical/physical): 512 bytes / 512 bytes 
I/O size (minimum/optimal): 512 bytes / 512 bytes 
Disk identifier: 0x11747e88 
 
   Device Boot      Start         End      Blocks   Id  System 
 
Command (m for help): 
```

输出显示这个存储设备有 5368 MB（5 GB）的空间。存储设备明细后的列表说明这个设备上是否已有分区。这个例子中的输出中没有显示任何分区，所以设备还未分区。 

​		下一步，可以使用 n 命令在该存储设备上创建新的分区。

```
Command (m for help): n 
Command action 
   e   extended 
   p   primary partition (1-4) 
p 
Partition number (1-4): 1 
First cylinder (1-652, default 1): 1 
Last cylinder, +cylinders or +size{K,M,G} (1-652, default 652): +2G 
 
Command (m for help):  
```

分区可以按主分区（primary partition）或扩展分区（extended partition）创建。主分区可以被文件系统直接格式化，而扩展分区则只能容纳其他主分区。扩展分区出现的原因是每个存储设备上只能有 4 个分区。可以通过创建多个扩展分区，然后在扩展分区内创建主分区进行扩展。上例中创建了一个主分区，在存储设备上给它分配了分区号 1，然后给它分配了 2 GB 的存储设备空间。可以再次使用 p 命令查看结果。 

> ​		此处说法有误。扩展分区内容纳的应该是“逻辑分区”（logical partition）。可参考 https://en.wikipedia.org/wiki/Extended_boot_record及https://technet.microsoft.com/en-us/library/cc976786.aspx。 
>
> ​		此处正确的说法应是：“可以通过创建一个扩展分区，然后在扩展分区内创建逻辑分区进行扩展。” 

```
Command (m for help): p 
 
Disk /dev/sdb: 5368 MB, 5368709120 bytes 
255 heads, 63 sectors/track, 652 cylinders 
Units = cylinders of 16065 * 512 = 8225280 bytes 
Sector size (logical/physical): 512 bytes / 512 bytes 
I/O size (minimum/optimal): 512 bytes / 512 bytes 
Disk identifier: 0x029aa6af 
 
   Device Boot      Start         End      Blocks   Id  System 
/dev/sdb1               1         262     2104483+  83  Linux 
 
Command (m for help): 
```

从输出中现在可以看到，该存储设备上有了一个分区（叫作 /dev/sdb1）。Id 列定义了 Linux 怎么对待该分区。fdisk 允许创建多种分区类型。使用 l 命令列出可用的不同类型。默认类型是 83，该类型定义了一个 Linux 文件系统。如果想为其他文件系统创建一个分区（比如 Windows 的 NTFS 分区），只要选择一个不同的分区类型即可。 

​		可以重复上面的过程，将存储设备上剩下的空间分配给另一个 Linux 分区。创建了想要的分区之后，用 w 命令将更改保存到存储设备上。 

```
Command (m for help): w 
The partition table has been altered! 
 
Calling ioctl() to re-read partition table. 
Syncing disks. 
$ 
```

存储设备的分区信息被写入分区表中，Linux 系统通过 ioctl() 调用来获知新分区的出现。设置好分区之后，可以使用 Linux 文件系统对其进行格式化。 

​		有些发行版和较旧的发行版在生成新分区之后并不会自动提醒 Linux 系统。如果是这样的话，要么使用 partprob 或 hdparm 命令（参考相应的手册页），要么重启系统，让系统读取更新过的分区表。 

### 创建文件系统

​		**在将数据存储到分区之前，必须用某种文件系统对其进行格式化，这样 Linux 才能使用它**。每种文件系统类型都用自己的命令行程序来格式化分区。下表列出了本章中讨论的不同文件系统所对应的工具。

​		**表：创建文件系统的命令行程序**

| 工具       | 用途                       |
| ---------- | -------------------------- |
| mkefs      | 创建一个 ext 文件系统      |
| mke2fs     | 创建一个 ext2 文件系统     |
| mkfs.ext3  | 创建一个 ext3 文件系统     |
| mkfs.ext4  | 创建一个 ext4 文件系统     |
| mkreiserfs | 创建一个 ReiserFS 文件系统 |
| jfs_mkfs   | 创建一个 JFS 文件系统      |
| mkfs.xfs   | 创建一个 XFS 文件系统      |
| mkfs.zfs   | 创建一个 ZFS 文件系统      |
| mkfs.btrfs | 创建一个 Btrfs 文件系统    |

并非所有文件系统工具都已经默认安装了。要想知道某个文件系统工具是否可用，可以使用 type 命令。 

```bash
$ type mkfs.ext4 
mkfs.ext4 is /sbin/mkfs.ext4 
$ 
$ type mkfs.btrfs 
-bash: type: mkfs.btrfs: not found 
$ 
```

据上面这个取自 Ubuntu 系统的例子显示，mkfs.ext4 工具是可用的。而 Btrfs 工具则不可用。

​		每个文件系统命令都有很多命令行选项，允许定制如何在分区上创建文件系统。要查看所有可用的命令行选项，可用 man 命令来显示该文件系统命令的手册页面。所有的文件系统命令都允许通过不带选项的简单命令来创建一个默认的文件系统。

```bash
$ sudo mkfs.ext4 /dev/sdb1 
[sudo] password for Christine: 
mke2fs 1.41.12 (17-May-2010) 
Filesystem label= 
OS type: Linux 
Block size=4096 (log=2) 
Fragment size=4096 (log=2) 
Stride=0 blocks, Stripe width=0 blocks 
131648 inodes, 526120 blocks 
26306 blocks (5.00%) reserved for the super user 
First data block=0 
Maximum filesystem blocks=541065216 
17 block groups 
32768 blocks per group, 32768 fragments per group 
7744 inodes per group 
Superblock backups stored on blocks: 
        32768, 98304, 163840, 229376, 294912 
 
Writing inode tables: done 
Creating journal (16384 blocks): done 
Writing superblocks and filesystem accounting information: done 
 
This filesystem will be automatically checked every 23 mounts or 
180 days, whichever comes first. Use tune2fs -c or -i to override. 
$ 
```

这个新的文件系统采用 ext4 文件系统类型，这是 Linux 上的日志文件系统。注意，创建过程中有一步是创建新的日志。 

​		为分区创建了文件系统之后，下一步是将它挂载到虚拟目录下的某个挂载点，这样就可以将数据存储在新文件系统中了。可以将新文件系统挂载到虚拟目录中需要额外空间的任何位置。

```bash
$ ls /mnt 
$ 
$ sudo mkdir /mnt/my_partition 
$ 
$ ls -al /mnt/my_partition/ 
$ 
$ ls -dF /mnt/my_partition 
/mnt/my_partition/ 
$ 
$ sudo  mount -t ext4  /dev/sdb1  /mnt/my_partition 
$ 
$ ls -al /mnt/my_partition/ 
total 24 
drwxr-xr-x. 3 root root  4096 Jun 11 09:53 . 
drwxr-xr-x. 3 root root  4096 Jun 11 09:58 .. 
drwx------. 2 root root 16384 Jun 11 09:53 lost+found 
$ 
```

​		mkdir 命令在虚拟目录中创建了挂载点，mount 命令将新的硬盘分区添加到挂载点。mount 命令的 -t 选项指明了要挂载的文件系统类型（ext4）。现在可以在新分区中保存新文件和目录了！ 

​		这种挂载文件系统的方法只能临时挂载文件系统。当重启 Linux 系统时，文件系统并不会自动挂载。**要强制 Linux 在启动时自动挂载新的文件系统，可以将其添加到 /etc/fstab 文件**。

### 文件系统的检查与修复

​		就算是现代文件系统，碰上突然断电或者某个不规矩的程序在访问文件时锁定了系统，也会出现错误。幸而有一些命令行工具可以将文件系统恢复正常。 

​		每个文件系统都有各自可以和文件系统交互的恢复命令。这可能会让局面变得不太舒服，随着 Linux 环境中可用的文件系统变多，也不得不去掌握大量对应的命令。好在有个通用的前端程序，可以决定存储设备上的文件系统并根据要恢复的文件系统调用适合的文件系统恢复命令。

​		fsck 命令能够检查和修复大部分类型的 Linux 文件系统，包括 ext、ext2、ext3、ext4、ReiserFS、JFS 和 XFS。该命令的格式是

```
fsck options filesystem 
```

​		可以在命令行上列出多个要检查的文件系统。文件系统可以通过设备名、在虚拟目录中的挂载点以及分配给文件系统的唯一 UUID 值来引用。 

​		尽管日志式文件系统的用户需要用到 fsck 命令，但是 COW 文件系统的用户是否也得使用该命令还存在争议。实际上，ZFS 文件系统甚至都没有提供 fsck 工具的接口。

​		fsck 命令使用 /etc/fstab 文件来自动决定正常挂载到系统上的存储设备的文件系统。如果存储设备尚未挂载（比如刚刚在新的存储设备上创建了个文件系统），需要用 -t 命令行选项来指定文件系统类型。下表列出了其他可用的命令行选项。 

​		**表：fsck 的命令行选项**

| 选项 | 描述                                                         |
| ---- | ------------------------------------------------------------ |
| -a   | 如果检测到错误，自动修复文件系统                             |
| -A   | 检查 /etc/fstab 文件中列出的所有文件系统                     |
| -C   | 给支持进度条功能的文件系统显示一个进度条（只有 ext2 和 ext3） |
| -N   | 不进行检查，只显示哪些检查会执行                             |
| -r   | 出现错误时提示                                               |
| -R   | 使用 -A 选项时跳过根文件系统                                 |
| -s   | 检查多个文件系统时，依次进行检查                             |
| -t   | 指定要检查的文件系统类型                                     |
| -T   | 启动时不显示头部信息                                         |
| -V   | 在检查时产生详细输出                                         |
| -y   | 检测到错误时自动修复文件系统                                 |

有些命令行选项是重复的。这是为多个命令实现通用的前端带来的部分问题。有些文件系统修复命令有一些额外的可用选项。如果要做更高级的错误检查，就需要查看这个文件系统修复工具的手册页面来确定是不是有该文件系统专用的扩展选项。 

​		只能在未挂载的文件系统上运行 fsck 命令。对大多数文件系统来说，只需卸载文件系统来进行检查，检查完成之后重新挂载就好了。但因为根文件系统含有所有核心的 Linux 命令和日志文件，所以无法在处于运行状态的系统上卸载它。这正是亲手体验 Linux LiveCD 的好时机！只需用 LiveCD 启动系统即可，然后在根文件系统上运行 fsck 命令。 

## 逻辑卷管理

​		如果用标准分区在硬盘上创建了文件系统，为已有文件系统添加额外的空间多少是一种痛苦的体验。只能在同一个物理硬盘的可用空间范围内调整分区大小。如果硬盘上没有地方了，就必须弄一个更大的硬盘，然后手动将已有的文件系统移动到新的硬盘上。 

​		这时候可以通过将另外一个硬盘上的分区加入已有文件系统，动态地添加存储空间。Linux 逻辑卷管理器（logical volume manager，LVM）软件包正好可以用来做这个。它可以在无需重建整个文件系统的情况下，轻松地管理磁盘空间。 

### 逻辑卷管理布局

​		逻辑卷管理的核心在于如何处理安装在系统上的硬盘分区。在逻辑卷管理的世界里，硬盘称作物理卷（physical volume，PV）。每个物理卷都会映射到硬盘上特定的物理分区。

​		多个物理卷集中在一起可以形成一个卷组（volume group，VG）。逻辑卷管理系统将卷组视为一个物理硬盘，但事实上卷组可能是由分布在多个物理硬盘上的多个物理分区组成的。卷组提供了一个创建逻辑分区的平台，而这些逻辑分区则包含了文件系统。 

​		整个结构中的最后一层是逻辑卷（logical volume，LV）。逻辑卷为 Linux 提供了创建文件系统的分区环境，作用类似于 Linux 中的物理硬盘分区。Linux 系统将逻辑卷视为物理分区。 

​		可以使用任意一种标准 Linux 文件系统来格式化逻辑卷，然后再将它加入 Linux 虚拟目录中的某个挂载点。 

​		下图显示了典型 Linux 逻辑卷管理环境的基本布局。 

​		**图：逻辑卷管理环境**

![逻辑卷管理环境](imgs\逻辑卷管理环境.png)

图中的卷组横跨了三个不同的物理硬盘，覆盖了五个独立的物理分区。在卷组内部有两个独立的逻辑卷。Linux 系统将每个逻辑卷视为一个物理分区。每个逻辑卷可以被格式化成 ext4 文件系统，然后挂载到虚拟目录中某个特定位置。

​		第三个物理硬盘有一个未使用的分区。通过逻辑卷管理，随后可以轻松地将这个未使用分区分配到已有卷组：要么用它创建一个新的逻辑卷，要么在需要更多空间时用它来扩展已有的逻辑卷。

​		如果给系统添加了一块硬盘，逻辑卷管理系统允许你将它添加到已有卷组，为某个已有的卷组创建更多空间，或是创建一个可用来挂载的新逻辑卷。这种扩展文件系统的方法要好用得多

### Linux 中的 LVM

​		Linux LVM 是由 Heinz Mauelshagen 开发的，于 1998 年发布到了 Linux 社区。它允许在 Linux  上用简单的命令行命令管理一个完整的逻辑卷管理环境。 

​		Linux LVM 有两个可用的版本。

-  **LVM1**：最初的 LVM 包于 1998 年发布，只能用于 Linux 内核 2.4 版本。它仅提供了基本的逻辑卷管理功能。 
- **LVM2**：LVM 的更新版本，可用于 Linux 内核 2.6 版本。它在标准的 LVM1 功能外提供了额外的功能。

大部分采用 2.6 或更高内核版本的现代 Linux 发行版都提供对 LVM2 的支持。

​		除了标准的逻辑卷管理功能外，LVM2 还提供了另外一些好用的功能。

- **快照**：最初的 Linux LVM允许在逻辑卷在线的状态下将其复制到另一个设备。这个功能叫作快照。在备份由于高可靠性需求而无法锁定的重要数据时，快照功能非常给力。传统的备份方法在将文件复制到备份媒体上时通常要将文件锁定。快照允许在复制的同时，保证运行关键任务的 Web 服务器或数据库服务器继续工作。遗憾的是，LVM1 只允许创建只读快照。一旦创建了快照，就不能再写入东西了。 

  LVM2 允许创建在线逻辑卷的可读写快照。有了可读写的快照，就可以删除原先的逻辑卷，然后将快照作为替代挂载上。这个功能对快速故障转移或涉及修改数据的程序试验（如果失败，需要恢复修改过的数据）非常有用。 

- **条带化**：LVM2 提供的另一个引人注目的功能是条带化（striping）。有了条带化，可跨多个物理硬盘创建逻辑卷。当 Linux LVM 将文件写入逻辑卷时，文件中的数据块会被分散到多个硬盘上。每个后继数据块会被写到下一个硬盘上。 

  条带化有助于提高硬盘的性能，因为 Linux 可以将一个文件的多个数据块同时写入多个硬盘，而无需等待单个硬盘移动读写磁头到多个不同位置。这个改进同样适用于读取顺序访问的文件，因为 LVM 可同时从多个硬盘读取数据。 

  LVM 条带化不同于 RAID 条带化。LVM 条带化不提供用来创建容错环境的校验信息。事实上， LVM 条带化会增加文件因硬盘故障而丢失的概率。单个硬盘故障可能会造成多个逻辑卷无法访问。 

- **镜像**：通过 LVM 安装文件系统并不意味着文件系统就不会再出问题。和物理分区一样，LVM 逻辑卷也容易受到断电和磁盘故障的影响。一旦文件系统损坏，就有可能再也无法恢复。

  LVM 快照功能提供了一些安慰，可以随时创建逻辑卷的备份副本，但对有些环境来说可能还不够。对于涉及大量数据变动的系统，比如数据库服务器，自上次快照之后可能要存储成百上千条记录。 

  这个问题的一个解决办法就是 LVM 镜像。镜像是一个实时更新的逻辑卷的完整副本。当创建镜像逻辑卷时，LVM 会将原始逻辑卷同步到镜像副本中。根据原始逻辑卷的大小，这可能需要一些时间才能完成。 

  一旦原始同步完成，LVM 会为文件系统的每次写操作执行两次写入——一次写入到主逻辑卷，一次写入到镜像副本。可以想到，这个过程会降低系统的写入性能。就算原始逻辑卷因为某些原因损坏了，手头也已经有了一个完整的最新副本！ 

### 使用 Linux LVM

​		Linux LVM 包只提供了命令行程序来创建和管理逻辑卷管理系统中所有组件。有些 Linux 发行版则包含了命令行命令对应的图形化前端，但为了完全控制 LVM 环境，最好习惯直接使用这些命令。 

#### 定义物理卷

​		创建过程的第一步就是将硬盘上的物理分区转换成 Linux LVM 使用的物理卷区段。fdisk 命令可以帮忙。在创建了基本的Linux分区之后，需要通过t命令改变分区类型

```bash
[...] 
Command (m for help): t 
Selected partition 1 
Hex code (type L to list codes): 8e 
Changed system type of partition 1 to 8e (Linux LVM) 
 
Command (m for help): p 
 
Disk /dev/sdb: 5368 MB, 5368709120 bytes 
255 heads, 63 sectors/track, 652 cylinders 
Units = cylinders of 16065 * 512 = 8225280 bytes 
Sector size (logical/physical): 512 bytes / 512 bytes 
I/O size (minimum/optimal): 512 bytes / 512 bytes 
Disk identifier: 0xa8661341 
 
   Device Boot      Start         End      Blocks   Id  System 
/dev/sdb1               1         262     2104483+  8e  Linux LVM 
 
Command (m for help): w 
The partition table has been altered! 
 
Calling ioctl() to re-read partition table. 
Syncing disks. 
$  
```

​		分区类型 8e 表示这个分区将会被用作 Linux LVM 系统的一部分，而不是一个直接的文件系统（就像在前面看到的 83 类型的分区）。 

​		如果下一步中的 pvcreate 命令不能正常工作，很可能是因为 LVM2 软件包没有默认安装。可以使用软件包名 lvm2

​		下一步是用分区来创建实际的物理卷。这可以通过 pvcreate 命令来完成。pvcreate 定义了用于物理卷的物理分区。它只是简单地将分区标记成 Linux LVM 系统中的分区而已。 

```bash
$ sudo pvcreate /dev/sdb1 
  dev_is_mpath: failed to get device for 8:17 
  Physical volume "/dev/sdb1" successfully created 
$ 
```

别被吓人的消息 dev_is_mpath: failed to get device for 8:17 或类似的消息唬住了。只要看到了 successfully created 就没问题。pvcreate 命令会检查分区是否为多路（multi-path，mpath）设备。如果不是的话，就会发出上面那段消息。

​		如果想查看创建进度的话，可以使用 pvdisplay 命令来显示已创建的物理卷列表。 

```bash
$ sudo pvdisplay /dev/sdb1 
  "/dev/sdb1" is a new physical volume of "2.01 GiB" 
  --- NEW Physical volume --- 
  PV Name               /dev/sdb1 
  VG Name 
  PV Size               2.01 GiB 
  Allocatable           NO 
  PE Size               0 
  Total PE              0 
  Free PE               0 
  Allocated PE          0 
  PV UUID               0FIuq2-LBod-IOWt-8VeN-tglm-Q2ik-rGU2w7 
 
$ 
```

pvdisplay 命令显示出 /dev/sdb1 现在已经被标记为物理卷。注意，输出中的 VG Name 内容为空，因为物理卷还不属于某个卷组。

#### 创建卷组

​		下一步是从物理卷中创建一个或多个卷组。究竟要为系统创建多少卷组并没有既定的规则，可以将所有的可用物理卷加到一个卷组，也可以结合不同的物理卷创建多个卷组。 

​		要从命令行创建卷组，需要使用 vgcreate 命令。vgcreate 命令需要一些命令行参数来定义卷组名以及用来创建卷组的物理卷名。 

```bash
$ sudo vgcreate Vol1 /dev/sdb1 
  Volume group "Vol1" successfully created 
$ 
```

输出结果平淡无奇。如果想看看新创建的卷组的细节，可用 vgdisplay 命令。 

```bash
$ sudo vgdisplay Vol1 
  --- Volume group --- 
  VG Name               Vol1 
  System ID 
  Format                lvm2 
  Metadata Areas        1 
  Metadata Sequence No  1 
  VG Access             read/write 
  VG Status             resizable 
  MAX LV                0 
  Cur LV                0 
  Open LV               0 
  Max PV                0 
  Cur PV                1 
  Act PV                1 
  VG Size               2.00 GiB 
  PE Size               4.00 MiB 
  Total PE              513 
  Alloc PE / Size       0 / 0 
  Free  PE / Size       513 / 2.00 GiB 
  VG UUID               oe4I7e-5RA9-G9ti-ANoI-QKLz-qkX4-58Wj6e 
```

这个例子使用 /dev/sdb1 分区上创建的物理卷，创建了一个名为 Vol1 的卷组。创建一个或多个卷组后，就可以创建逻辑卷了。 

#### 创建逻辑卷

​		Linux 系统使用逻辑卷来模拟物理分区，并在其中保存文件系统。Linux 系统会像处理物理分区一样处理逻辑卷，允许定义逻辑卷中的文件系统，然后将文件系统挂载到虚拟目录上。 

​		要创建逻辑卷，使用 lvcreate 命令。虽然通常不需要在其他 Linux LVM 命令中使用命令行选项，但 lvcreate 命令要求至少输入一些选项。下表显示了可用的命令行选项。 

​		**表：lvcreate 的选项**

| 选项 | 长选项名     | 描述                                                       |
| ---- | ------------ | ---------------------------------------------------------- |
| -c   | --chunksize  | 指定快照逻辑卷的单位大小                                   |
| -C   | --contiguous | 设置或重置连续分配策略                                     |
| -i   | --stripes    | 指定条带数                                                 |
| -I   | --stripesize | 指定每个条带的大小                                         |
| -l   | --extents    | 指定分配给新逻辑卷的逻辑区段数，或者要用的逻辑区段的百分比 |
| -L   | --size       | 指定分配给新逻辑卷的硬盘大小                               |
|      | --minor      | 指定设备的次设备号                                         |
| -m   | --mirrors    | 创建逻辑卷镜像                                             |
| -M   | --persistent | 让次设备号一直有效                                         |
| -n   | --name       | 指定新逻辑卷的名称                                         |
| -p   | --permission | 为逻辑卷设置读/写权限                                      |
| -r   | --readahead  | 设置预读扇区数                                             |
| -R   | --regionsize | 指定将镜像分成多大的区                                     |
| -S   | snapshot     | 创建快照逻辑卷                                             |
| -Z   | --zero       | 将新逻辑卷的前1 KB数据设置为零                             |

大多数情况下用到的只是少数几个选项

```bash
$ sudo lvcreate -l 100%FREE -n lvtest Vol1 
  Logical volume "lvtest" created 
$
```

如果想查看创建的逻辑卷的详细情况，可用 lvdisplay 命令。 

```
$ sudo lvdisplay Vol1 
  --- Logical volume --- 
  LV Path                /dev/Vol1/lvtest 
  LV Name                lvtest 
  VG Name                Vol1 
  LV UUID                4W2369-pLXy-jWmb-lIFN-SMNX-xZnN-3KN208 
  LV Write Access        read/write 
  LV Creation host, time ... -0400 
  LV Status              available 
  # open                 0 
  LV Size                2.00 GiB 
  Current LE             513 
  Segments               1 
  Allocation             inherit 
  Read ahead sectors     auto 
  - currently set to     256 
  Block device           253:2 
 
$ 
```

现在可以看到刚刚创建的逻辑卷了！注意，卷组名（Vol1）用来标识创建新逻辑卷时要使用的卷组。 

​		-l 选项定义了要为逻辑卷指定多少可用的卷组空间。注意，可以按照卷组空闲空间的百分比来指定这个值。本例中为新逻辑卷使用了所有的空闲空间。 

​		可以用 -l 选项来按可用空间的百分比来指定这个大小，或者用 -L 选项以字节、千字节（KB）、兆字节（MB）或吉字节（GB）为单位来指定实际的大小。-n 选项允许你为逻辑卷指定一个名称（在本例中称作 lvtest）。 

#### 创建文件系统

​		运行完 lvcreate 命令之后，逻辑卷就已经产生了，但它还没有文件系统。必须使用相应的命令行程序来创建所需要的文件系统。 

```
$ sudo mkfs.ext4 /dev/Vol1/lvtest 
mke2fs 1.41.12 (17-May-2010) 
Filesystem label= 
OS type: Linux 
Block size=4096 (log=2) 
Fragment size=4096 (log=2) 
Stride=0 blocks, Stripe width=0 blocks 
131376 inodes, 525312 blocks 
26265 blocks (5.00%) reserved for the super user 
First data block=0 
Maximum filesystem blocks=541065216 
17 block groups 
32768 blocks per group, 32768 fragments per group 
7728 inodes per group 
Superblock backups stored on blocks: 
        32768, 98304, 163840, 229376, 294912 
 
Writing inode tables: done 
Creating journal (16384 blocks): done 
Writing superblocks and filesystem accounting information: done 
 
This filesystem will be automatically checked every 28 mounts or 
180 days, whichever comes first.Use tune2fs -c or -i to override. 
$ 
```

​		在创建了新的文件系统之后，可以用标准 Linux mount 命令将这个卷挂载到虚拟目录中，就跟它是物理分区一样。唯一的不同是需要用特殊的路径来标识逻辑卷。 

```bash
$ sudo mount /dev/Vol1/lvtest /mnt/my_partition 
$ 
$ mount 
/dev/mapper/vg_server01-lv_root on / type ext4 (rw) 
[...] 
/dev/mapper/Vol1-lvtest on /mnt/my_partition type ext4 (rw) 
$ 
$ cd /mnt/my_partition 
$ 
$ ls -al 
total 24 
drwxr-xr-x. 3 root root  4096 Jun 12 10:22 . 
drwxr-xr-x. 3 root root  4096 Jun 11 09:58 .. 
drwx------. 2 root root 16384 Jun 12 10:22 lost+found 
$ 
```

注意，mkfs.ext4 和 mount 命令中用到的路径都有点奇怪。路径中使用了卷组名和逻辑卷名，而不是物理分区路径。文件系统被挂载之后，就可以访问虚拟目录中的这块新区域了。 

#### 修改 LVM

​		Linux LVM 的好处在于能够动态修改文件系统，因此最好有工具能实现这些操作。在 Linux 有一些工具允许修改现有的逻辑卷管理配置。 

​		如果无法通过一个很炫的图形化界面来管理 Linux LVM 环境，也不是什么都干不了。已经看到了一些 Linux LVM 命令行程序的实际用法。还有一些其他的命令可以用来管理 LVM 的设置。下表列出了在 Linux LVM 包中的常见命令。 

​		**表：Linux LVM命令**

| 命令     | 功能               |
| -------- | ------------------ |
| vgchange | 激活和禁用卷组     |
| vgremove | 删除卷组           |
| vgextend | 将物理卷加到卷组中 |
| vgreduce | 从卷组中删除物理卷 |
| lvextend | 增加逻辑卷的大小   |
| lvreduce | 减小逻辑卷的大小   |

通过使用这些命令行程序，就能完全控制你的 Linux LVM 环境。

​		在手动增加或减小逻辑卷的大小时，要特别小心。逻辑卷中的文件系统需要手动修整来处理大小上的改变。大多数文件系统都包含了能够重新格式化文件系统的命令行程序，比如用于 ext2、ext3 和 ext4 文件系统的 resize2fs 程序。 