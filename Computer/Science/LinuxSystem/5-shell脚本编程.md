# 构建基本脚本

## 使用多个命令

​		shell 脚本的关键在于输入多个命令并处理每个命令的结果，甚至需要将一个命令的结果传给另一个命令。shell 可以将多个命令串起来，一次执行完成。如果要两个命令一起运行，可以把它们放在同一行中，彼此间用分号隔开。

```bash
date ; who
```

使用这种办法就能将任意多个命令串连在一起使用了，只要不超过最大命令行字符数 255 就行。 

​		这种技术对于小型脚本尚可，但它有一个很大的缺陷：每次运行之前，都必须在命令提示符下输入整个命令。可以将这些命令组合成一个简单的文本文件，这样就不需要在命令行中手动输入了。在需要运行这些命令时，只用运行这个文本文件就行了。

## 创建 shell 脚本文件

​		要将 shell 命令放到文本文件中，首先需要用文本编辑器来创建一个文件，然后将命令输入到文件中。在创建 shell 脚本文件时，必须在文件的第一行指定要使用的 shell。其格式为

```bash
#!/bin/bash
```

在通常的 shell 脚本中，井号（#）用作注释行。shell 并不会处理 shell 脚本中的注释行。**然而，shell脚本文件的第一行是个例外，# 后面的惊叹号会告诉 shell 用哪个 shell 来运行脚本。** 

​		在指定了 shell 之后，就可以在文件的每一行中输入命令，然后加一个回车符。注释可用 # 添加。

```shell
#!/bin/bash 
# This script displays the date and who's logged on 
date 
who 
```

可以根据需要，使用分号将两个命令放在一行上，但在 shell 脚本中，可以在独立的行中书写命令。shell 会按根据命令在文件中出现的顺序进行处理。 

​		shell 不会解释以 # 开头的行（除了以 #! 开头的第一行）。

​		在运行新脚本前，还要做其他一些事。第一个障碍是让 bash shell 能找到脚本文件。shell 会通过 PATH 环境变量来查找命令。快速查看一下 PATH 环境变量就可以弄清问题所在。

​		PATH 环境变量被设置成只在一组目录中查找命令。要让 shell 找到脚本，只需采取以下两种作法之一： 

- 将 shell 脚本文件所处的目录添加到 PATH 环境变量中； 
- 在提示符中用绝对或相对文件路径来引用 shell 脚本文件。 

有些 Linux 发行版将 $HOME/bin 目录添加进了 PATH 环境变量。它在每个用户的 HOME 目录下提供了一个存放文件的地方，shell 可以在那里查找要执行的命令。 

​		我们将用第二种方式将脚本文件的确切位置告诉 shell。记住，为了引用当前目录下的文件，可以在 shell 中使用单点操作符。

```bash
$ ./test1 
bash: ./test1: Permission denied 
$ 
```

在创建脚本时，umask 的值决定了新文件的默认权限设置。由于 umask 变量在 Ubuntu 中被设成了 022，所以系统创建的文件只有文件属主和属组才有读/写权限。

​		下一步是通过 chmod 命令赋予文件属主执行文件的权限。

``` bash
$ chmod u+x test1 
$ ./test1 
Mon Feb 21 15:38:19 EST 2014 
Christine tty2         2014-02-21 15:26 
Samantha tty3         2014-02-21 15:26 
Timothy  tty1         2014-02-21 15:26 
user     tty7         2014-02-19 14:03 (:0) 
user     pts/0        2014-02-21 15:21 (:0.0) $ 
```

## 显示消息

​		大多数 shell 命令都会产生自己的输出，这些输出会显示在脚本所运行的控制台显示器上。很多时候，可能想要添加自己的文本消息来告诉脚本用户脚本正在做什么。可以通过 echo 命令来实现这一点。如果在 echo 命令后面加上了一个字符串，该命令就能显示出这个文本字符串。 

```bash
$ echo This is a test 
This is a test 
$ 
```

默认情况下，不需要使用引号将要显示的文本字符串划定出来。但有时在字符串中出现引号的话就比较麻烦了。 

```bash
$ echo Let's see if this'll work 
Lets see if thisll work 
$ 
```

​		**echo 命令可用单引号或双引号来划定文本字符串**。如果在字符串中用到了它们，需要在文本中使用其中一种引号，而用另外一种来将字符串划定起来。 

```bash
$ echo "This is a test to see if you're paying attention" 
This is a test to see if you're paying attention 
$ echo 'Rich says "scripting is easy".' 
Rich says "scripting is easy". 
$ 
```

所有的引号都可以正常输出了

​		可以将 echo 语句添加到shell脚本中任何需要显示额外信息的地方。 

```bash
#!/bin/bash 
# This script displays the date and who's logged on 
echo  The time and date are: 
date 
echo "Let's see who's logged into the system:" 
who
```

当运行这个脚本时，它会产生如下输出

```bash
$ ./test1 
The time and date are: 
Mon Feb 21 15:41:13 EST 2014 
Let's see who's logged into the system: 
Christine tty2         2014-02-21 15:26 
Samantha tty3         2014-02-21 15:26 
Timothy  tty1         2014-02-21 15:26 
user     tty7         2014-02-19 14:03 (:0) 
user     pts/0        2014-02-21 15:21 (:0.0) 
$ 
```

​		但如果想把文本字符串和命令输出显示在同一行中，该怎么办呢？可以用 echo 语句的 -n 参数。只要将第一个 echo 语句改成这样就行

```bash
#!/bin/bash 
# This script displays the date and who's logged on 
echo -n "The time and date are: "
date 
echo "Let's see who's logged into the system:" 
who
```

需要在字符串的两侧使用引号，保证要显示的字符串尾部有一个空格。命令输出将会在紧接着字符串结束的地方出现。现在的输出会是这样

```bash
$ ./test1 
The time and date are: Mon Feb 21 15:42:23 EST 2014 
Let's see who's logged into the system: 
Christine tty2         2014-02-21 15:26 
Samantha tty3         2014-02-21 15:26 
Timothy  tty1         2014-02-21 15:26 
user     tty7         2014-02-19 14:03 (:0) 
user     pts/0        2014-02-21 15:21 (:0.0) 
$ 
```

​		echo 命令是 shell 脚本中与用户交互的重要工具。在很多地方都能用到它，尤其是需要显示脚本中变量的值的时候。

## 使用变量

​		运行 shell 脚本中的单个命令自然有用，但这有其自身的限制。通常会需要在 shell 命令使用其他数据来处理信息。这可以通过变量来实现。变量允许临时性地将信息存储在 shell 脚本中，以便和脚本中的其他命令一起使用

### 环境变量

​		shell 维护着一组环境变量，用来记录特定的系统信息。比如系统的名称、登录到系统上的用户名、用户的系统 ID（也称为 UID）、用户的默认主目录以及 shell 查找程序的搜索路径。可以用 set 命令来显示一份完整的当前环境变量列表。 

```bash
$ set 
BASH=/bin/bash 
[...] 
HOME=/home/Samantha 
HOSTNAME=localhost.localdomain 
HOSTTYPE=i386 
IFS=$' \t\n' 
IMSETTINGS_INTEGRATE_DESKTOP=yes 
IMSETTINGS_MODULE=none 
LANG=en_US.utf8 
LESSOPEN='|/usr/bin/lesspipe.sh %s' 
LINES=24 
LOGNAME=Samantha 
[...] 
```

​		在脚本中，可以在环境变量名称之前加上美元符（$）来使用这些环境变量。

```bash
#!/bin/bash 
# display user information from the system. 
echo "User info for userid: $USER" 
echo UID: $UID 
echo HOME: $HOME 
```

`$USER`、`$UID` 和 `$HOME` 环境变量用来显示已登录用户的有关信息。

​		第一个字符串中可以将 $USER 系统变量放置到双引号中，而 shell 依然能够知道我们的意图。但采用这种方法也有一个问题。

```bash
$ echo "The cost of the item is $15" 
The cost of the item is 5 
```

显然这不是想要的。只要脚本在引号中出现美元符，它就会以为在引用一个变量。在这个例子中，脚本会尝试显示变量 $1（但并未定义），再显示数字 5。要显示美元符，必须在它前面放置一个反斜线。 

```bash
$ echo "The cost of the item is \$15" 
The cost of the item is $15 
```

反斜线允许 shell 脚本将美元符解读为实际的美元符，而不是变量。

​		可能还见过通过 ${variable} 形式引用的变量。变量名两侧额外的花括号通常用来帮助识别美元符后的变量名。 

### 用户变量

​		除了环境变量，shell 脚本还允许在脚本中定义和使用自己的变量。定义变量允许临时存储数据并在整个脚本中使用，从而使 shell 脚本看起来更像一个真正的计算机程序。 

​		**用户变量可以是任何由字母、数字或下划线组成的文本字符串，长度不超过 20 个。用户变量区分大小写**。

​		使用等号将值赋给用户变量。**在变量、等号和值之间不能出现空格**（另一个困扰初学者的用法）。这里有一些给用户变量赋值的例子。

```
var1=10 
var2=-57 
var3=testing 
var4="still more testing"
```

shell 脚本会自动决定变量值的数据类型。在脚本的整个生命周期里，shell 脚本中定义的变量会一直保持着它们的值，但在 shell 脚本结束时会被删除掉。 

​		与系统变量类似，用户变量可通过美元符引用。

```bash
#!/bin/bash 
# testing variables 
days=10 
guest="Katie" 
echo "$guest checked in $days days ago" 
days=5 
guest="Jessica" 
echo "$guest checked in $days days ago" 
```

​		变量每次被引用时，都会输出当前赋给它的值。重要的是要记住，**引用一个变量值时需要使用美元符，而引用变量来对其进行赋值时则不要使用美元符**。

```bash
#!/bin/bash 
# assigning a variable value to another variable 
 
value1=10 
value2=$value1 
echo The resulting value is $value2 
```

在赋值语句中使用 value1 变量的值时，仍然必须用美元符。这段代码产生如下输出。 

```bash
$ chmod u+x test4 
$ ./test4 
The resulting value is 10 
$ 
```

要是忘了用美元符，使得 value2 的赋值行变成了这样

```
value2=value1 
```

那你会得到如下输出

```bash
$ ./test4 
The resulting value is value1 
$ 
```

没有美元符，shell 会将变量名解释成普通的文本字符串，通常这并不是你想要的结果。 

### 命令替换

​		shell 脚本中最有用的特性之一就是可以从命令输出中提取信息，并将其赋给变量。把输出赋给变量之后，就可以随意在脚本中使用了。这个特性在处理脚本数据时尤为方便。有两种方法可以将命令输出赋给变量

- 反引号字符（`） 
- $() 格式 

​		命令替换允许将 shell 命令的输出赋给变量。尽管这看起来并不那么重要，但它却是脚本编程中的一个主要组成部分。 

​		要么用一对反引号把整个命令行命令围起来

```bash
testing=`date` 
```

要么使用 $() 格式

```bash
testing=$(date) 
```

shell 会运行命令替换符号中的命令，并将其输出赋给变量 testing。注意，**赋值等号和命令替换字符之间没有空格**。 

```bash
#!/bin/bash 
testing=$(date) 
echo "The date and time are: " $testing 
```

​		下面这个例子很常见，它在脚本中通过命令替换获得当前日期并用它来生成唯一文件名。 

```bash
#!/bin/bash 
# copy the /usr/bin directory listing to a log file 
today=$(date +%y%m%d) 
ls /usr/bin -al > log.$today 
```

today 变量是被赋予格式化后的 date 命令的输出。这是提取日期信息来生成日志文件名常用的一种技术。+%y%m%d 格式告诉 date 命令将日期显示为两位数的年月日的组合。 

​		**命令替换会创建一个子 shell 来运行对应的命令。子 shell（subshell）是由运行该脚本的 shell 所创建出来的一个独立的子 shell（child shell）。正因如此，由该子 shell 所执行命令是无法使用脚本中所创建的变量的**。 

​		在命令行提示符下使用路径 ./ 运行命令的话，也会创建出子 shell；要是运行命令的时候不加入路径，就不会创建子 shell。如果使用的是内建的 shell 命令，并不会涉及子 shell。在命令行提示符下运行脚本时一定要留心。

## 重定向输入和输出

​		有些时候想要保存某个命令的输出而不仅仅只是让它显示在显示器上。bash shell 提供了几个操作符，可以将命令的输出重定向到另一个位置（比如文件）。重定向可以用于输入，也可以用于输出，可以将文件重定向到命令输入

### 输出重定向

​		最基本的重定向将命令的输出发送到一个文件中。bash shell 用大于号（>）来完成这项功能。如果输出文件已经存在了，重定向操作符会用新的文件数据覆盖已有文件。 

​		有时，可能并不想覆盖文件原有内容，而是想要将命令的输出追加到已有文件中，比如正在创建一个记录系统上某个操作的日志文件。在这种情况下，可以用双大于号（>>）来追加数据。

### 输入重定向

​		输入重定向和输出重定向正好相反。输入重定向将文件的内容重定向到命令，而非将命令的输出重定向到文件。 输入重定向符号是小于号（<）

​		wc 命令可以对对数据中的文本进行计数。默认情况下，它会输出 3 个值

- 文本的行数 
- 文本的词数 
- 文本的字节数 

通过将文本文件重定向到 wc 命令，立刻就可以得到文件中的行、词和字节的计数。

​		还有另外一种输入重定向的方法，称为内联输入重定向（inline input redirection）。这种方法无需使用文件进行重定向，只需要在命令行中指定用于输入重定向的数据就可以了。乍看一眼，这可能有点奇怪，但有些应用会用到这种方式

​		**内联输入重定向符号是远小于号（<<）。除了这个符号，必须指定一个文本标记来划分输入数据的开始和结尾。任何字符串都可作为文本标记，但在数据的开始和结尾文本标记必须一致**。

```
command << marker 
data 
marker 
```

在命令行上使用内联输入重定向时，shell 会用 PS2 环境变量中定义的次提示符来提示输入数据。下面是它的使用情况

```
$ wc << EOF 
> test string 1 
> test string 2 
> test string 3 
> EOF 
      3       9      42 
$ 
```

次提示符会持续提示，以获取更多的输入数据，直到输入了作为文本标记的那个字符串。wc 命令会对内联输入重定向提供的数据进行行、词和字节计数。

## 管道

​		有时需要将一个命令的输出作为另一个命令的输入。这可以用重定向来实现，只是有些笨拙。

```
$ rpm -qa > rpm.list  
$ sort < rpm.list  
abrt-1.1.14-1.fc14.i686  
abrt-addon-ccpp-1.1.14-1.fc14.i686  
abrt-addon-kerneloops-1.1.14-1.fc14.i686  
abrt-addon-python-1.1.14-1.fc14.i686  
abrt-desktop-1.1.14-1.fc14.i686  
abrt-gui-1.1.14-1.fc14.i686  
abrt-libs-1.1.14-1.fc14.i686  
abrt-plugin-bugzilla-1.1.14-1.fc14.i686  
abrt-plugin-logger-1.1.14-1.fc14.i686  
abrt-plugin-runapp-1.1.14-1.fc14.i686  
acl-2.2.49-8.fc14.i686  
 
[...] 
```

rpm 命令通过 Red Hat 包管理系统（RPM）对系统（比如上例中的 Fedora 系统）上安装的软件包进行管理。配合 -qa 选项使用时，它会生成已安装包的列表，但这个列表并不会遵循某种特定的顺序。如果你在查找某个或某组特定的包，想在 rpm 命令的输出中找到就比较困难了。 

​		通过标准输出重定向，rpm 命令的输出被重定向到了文件 rpm.list。命令完成后，rpm.list 保存着系统中所有已安装的软件包列表。接下来，输入重定向将 rpm.list 文件的内容发送给 sort 命令，该命令按字母顺序对软件包名称进行排序。

​		这种方法的确管用，但仍然是一种比较繁琐的信息生成方式。**用不着将命令输出重定向到文件中，可以将其直接重定向到另一个命令。这个过程叫作管道连接（piping）**。 

​		和命令替换所用的反引号（`）一样，管道符号在 shell 编程之外也很少用到。该符号由两个竖线构成，一个在另一个上面。然而管道符号的印刷体通常看起来更像是单个竖线（|）。在美式键盘上，它通常和反斜线（\）位于同一个键。管道被放在命令之间，将一个命令的输出重定向到另一个命令中： 

```
command1 | command2 
```

​		**不要以为由管道串起的两个命令会依次执行。Linux 系统实际上会同时运行这两个命令，在系统内部将它们连接起来。在第一个命令产生输出的同时，输出会被立即送给第二个命令。数据传输不会用到任何中间文件或缓冲区。** 

​		现在，可以利用管道将 rpm 命令的输出送入 sort 命令来产生结果。 

```
$ rpm -qa | sort 
abrt-1.1.14-1.fc14.i686  
abrt-addon-ccpp-1.1.14-1.fc14.i686  
abrt-addon-kerneloops-1.1.14-1.fc14.i686  
abrt-addon-python-1.1.14-1.fc14.i686  
abrt-desktop-1.1.14-1.fc14.i686  
abrt-gui-1.1.14-1.fc14.i686  
abrt-libs-1.1.14-1.fc14.i686  
abrt-plugin-bugzilla-1.1.14-1.fc14.i686  
abrt-plugin-logger-1.1.14-1.fc14.i686  
abrt-plugin-runapp-1.1.14-1.fc14.i686  
acl-2.2.49-8.fc14.i686  
 
[...] 
```

除非眼神特别好，否则可能根本来不及看清楚命令的输出。由于管道操作是实时运行的，所以只要 rpm 命令一输出数据，sort 命令就会立即对其进行排序。等到 rpm 命令输出完数据，sort 命令就已经将数据排好序并显示了在显示器上。 

​		可以在一条命令中使用任意多条管道。可以持续地将命令的输出通过管道传给其他命令来细化操作。 

​		在这个例子中，sort 命令的输出会一闪而过，所以可以用一条文本分页命令（例如 less 或  more）来强行将输出按屏显示

```
$ rpm -qa | sort | more 
```

这行命令序列会先执行 rpm 命令，将它的输出通过管道传给 sort 命令，然后再将 sort 的输出通过管道传给 more 命令来显示，在显示完一屏信息后停下来。这样就可以在继续处理前停下来阅读显示器上显示的信息

​		如果想要更别致点，也可以搭配使用重定向和管道来将输出保存到文件中。

```
$ rpm -qa | sort > rpm.list  
$ more rpm.list  
abrt-1.1.14-1.fc14.i686  
abrt-addon-ccpp-1.1.14-1.fc14.i686  
abrt-addon-kerneloops-1.1.14-1.fc14.i686  
abrt-addon-python-1.1.14-1.fc14.i686  
abrt-desktop-1.1.14-1.fc14.i686  
abrt-gui-1.1.14-1.fc14.i686  
abrt-libs-1.1.14-1.fc14.i686  
abrt-plugin-bugzilla-1.1.14-1.fc14.i686  
abrt-plugin-logger-1.1.14-1.fc14.i686  
abrt-plugin-runapp-1.1.14-1.fc14.i686  
acl-2.2.49-8.fc14.i686  
[...] 
```

不出所料，rpm.list 文件中的数据现在已经排好序了。 

​		**到目前为止，管道最流行的用法之一是将命令产生的大量输出通过管道传送给 more 命令。这对 ls 命令来说尤为常见**

## 执行数学运算

​		另一个对任何编程语言都很重要的特性是操作数字的能力。遗憾的是，对 shell 脚本来说，这个处理过程会比较麻烦。在 shell 脚本中有两种途径来进行数学运算。 

### expr 命令

​		最开始，Bourne shell 提供了一个特别的命令用来处理数学表达式。expr 命令允许在命令行上处理数学表达式，但是特别笨拙。 

```bash
$ expr 1 + 5 
6
```

​		expr 命令能够识别少数的数学和字符串操作符，见下表

​		**表：expr 命令操作符**

| 操作符                   | 描述                                                         |
| ------------------------ | ------------------------------------------------------------ |
| ARG1 \| ARG2             | 如果 ARG1 既不是 null 也不是零值，返回 ARG1；否则返回 ARG2   |
| ARG1 & ARG2              | 如果没有参数是 null 或零值，返回 ARG1；否则返回 0            |
| ARG1 < ARG2              | 如果 ARG1 小于 ARG2，返回 1；否则返回 0                      |
| ARG1 <= ARG2             | 如果 ARG1 小于或等于 ARG2，返回 1；否则返回 0                |
| ARG1 = ARG2              | 如果 ARG1 等于 ARG2，返回 1；否则返回 0                      |
| ARG1 != ARG2             | 如果 ARG1 不等于 ARG2，返回 1；否则返回 0                    |
| ARG1 >= ARG2             | 如果 ARG1 大于或等于 ARG2，返回 1；否则返回 0                |
| ARG1 > ARG2              | 如果 ARG1 大于 ARG2，返回 1；否则返回 0                      |
| ARG1 + ARG2              | 返回 ARG1 和 ARG2 的算术运算和                               |
| ARG1 - ARG2              | 返回 ARG1 和 ARG2 的算术运算差                               |
| ARG1 * ARG2              | 返回 ARG1 和 ARG2 的算术乘积                                 |
| ARG1 / ARG2              | 返回 ARG1 被 ARG2 除的算术商                                 |
| ARG1 % ARG2              | 返回 ARG1 被 ARG2 除的算术余数                               |
| STRING : REGEXP          | 如果 REGEXP 匹配到了 STRING 中的某个模式，返回该模式匹配     |
| match STRING REGEXP      | 如果 REGEXP 匹配到了 STRING 中的某个模式，返回该模式匹配     |
| substr STRING POS LENGTH | 返回起始位置为 POS（从 1 开始计数）、长度为 LENGTH 个字符的子字符串 |
| index STRING CHARS       | 返回在 STRING 中找到 CHARS 字符串的位置；否则，返回 0        |
| length STRING            | 返回字符串 STRING 的数值长度                                 |
| + TOKEN                  | 将 TOKEN 解释成字符串，即使是个关键字                        |
| (EXPRESSION)             | 返回 EXPRESSION 的值                                         |

​		尽管标准操作符在 expr 命令中工作得很好，但在脚本或命令行上使用它们时仍有问题出现。许多 expr 命令操作符在 shell 中另有含义（比如星号）。当它们出现在在 expr 命令中时，会得到一些诡异的结果。

```bash
$ expr 5 * 2 
expr: syntax error 
$
```

**要解决这个问题，对于那些容易被 shell 错误解释的字符，在它们传入 expr 命令之前，需要使用 shell 的转义字符（反斜线）将其标出来**。

```bash
$ expr 5 \* 2 
10 
$
```

​		现在，麻烦才刚刚开始！在shell 脚本中使用 expr 命令也同样复杂

```bash
 #!/bin/bash 
# An example of using the expr command 
var1=10 
var2=20 
var3=$(expr $var2 / $var1) 
echo The result is $var3 
```

要将一个数学算式的结果赋给一个变量，需要使用命令替换来获取 expr 命令的输出。幸好 bash shell 有一个针对处理数学运算符的改进

### 使用方括号

​		bash shell 为了保持跟 Bourne shell 的兼容而包含了 expr 命令，但它同样也提供了一种更简单的方法来执行数学表达式。在 bash 中，在将一个数学运算结果赋给某个变量时，**可以用美元符和方括号（$[ operation ]）将数学表达式围起来**。 

```bash
$ var1=$[1 + 5] 
$ echo $var1 
6 
$ var2=$[$var1 * 2] 
$ echo $var2 
12 
$ 
```

用方括号执行 shell 数学运算比用 expr 命令方便很多。这种技术也适用于 shell 脚本

```bash
#!/bin/bash 
var1=100 
var2=50 
var3=45 
var4=$[$var1 * ($var2 - $var3)] 
echo The final result is $var4 
```

​		同样，注意在使用方括号来计算公式时，不用担心 shell 会误解乘号或其他符号。shell 知道它不是通配符，因为它在方括号内。 

​		在 bash shell 脚本中进行算术运算会有一个主要的限制

```bash
$ cat test8 
#!/bin/bash 
var1=100 
var2=45 
var3=$[$var1 / $var2] 
echo The final result is $var3 
$
```

现在，运行一下，看看会发生什么

```bash
$ chmod u+x test8 
$ ./test8 
The final result is 2 
$
```

​		bash shell数学运算符只支持整数运算。若要进行任何实际的数学计算，这是一个巨大的限制。

​		z shell（zsh）提供了完整的浮点数算术操作。如果需要在shell脚本中进行浮点数运算，可以考虑看看z shell

### 浮点解决方案

​		有几种解决方案能够克服bash中数学运算的整数限制。最常见的方案是用内建的bash计算器，叫作bc。 

#### bc 的基本用法

​		bash计算器实际上是一种编程语言，它允许在命令行中输入浮点表达式，然后解释并计算该表达式，最后返回结果。bash计算器能够识别

- 数字（整数和浮点数） 
- 变量（简单变量和数组） 
- 注释（以#或C语言中的/* */开始的行） 
- 表达式 
- 编程语句（例如if-then语句） 
- 函数 

​		可以在shell提示符下通过bc命令访问bash计算器

```bash
$ bc 
bc 1.06.95 
Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006 Free Software Foundation, Inc. 
This is free software with ABSOLUTELY NO WARRANTY. 
For details type 'warranty'. 
12 * 5.4 
64.8 
3.156 * (3 + 5) 
25.248 
quit 
$ 
```

这个例子一开始输入了表达式12 * 5.4。bash计算器返回了计算结果。随后每个输入到计算器的表达式都会被求值并显示出结果。要退出bash计算器，你必须输入quit。 

​		浮点运算是由内建变量scale控制的。必须将这个值设置为你希望在计算结果中保留的小数位数，否则无法得到期望的结果。 

```bash
$ bc -q 
3.44 / 5 
0 
scale=4 
3.44 / 5 
.6880 
quit 
$ 
```

scale变量的默认值是0。在scale值被设置前，bash计算器的计算结果不包含小数位。在将其值设置成4后，bash计算器显示的结果包含四位小数。-q命令行选项可以不显示bash计算器冗长的欢迎信息。 

​		除了普通数字，bash计算器还能支持变量

```bash
$ bc -q 
var1=10 
var1 * 4 
40 
var2 = var1 / 5 
print var2 
2 
quit 
$ 
```

变量一旦被定义，你就可以在整个bash计算器会话中使用该变量了。print语句允许你打印变量和数字。 

#### 在脚本中使用 bc

​		现在你可能想问bash计算器是如何在shell脚本中帮助处理浮点运算的。还记得命令替换吗？是的，可以用命令替换运行bc命令，并将输出赋给一个变量。基本格式如下

```bash
variable=$(echo "options; expression" | bc) 
```

​		第一部分options允许你设置变量。如果你需要不止一个变量，可以用分号将其分开。expression参数定义了通过bc执行的数学表达式。这里有个在脚本中这么做的例子。 

```bash
$ cat test9 
#!/bin/bash 
var1=$(echo "scale=4; 3.44 / 5" | bc) 
echo The answer is $var1 
$ 
```

这个例子将scale变量设置成了四位小数，并在expression部分指定了特定的运算。运行这个脚本会产生如下输出。 

```bash
$ chmod u+x test9 
$ ./test9 
The answer is .6880 
$ 
```

现在你不会再只能用数字作为表达式值了。也可以用shell脚本中定义好的变量。 

```bash
$ cat test10 
#!/bin/bash 
var1=100 
var2=45 
var3=$(echo "scale=4; $var1 / $var2" | bc) 
echo The answer for this is $var3 
$ 
```

脚本定义了两个变量，它们都可以用在expression部分，然后发送给bc命令。别忘了用美元符表示的是变量的值而不是变量自身。这个脚本的输出如下。 

```bash
$ ./test10 
The answer for this is 2.2222 
$
```

当然，一旦变量被赋值，那个变量也可以用于其他运算

```bash
$ cat test11 
#!/bin/bash 
var1=20 
var2=3.14159 
var3=$(echo "scale=4; $var1 * $var1" | bc) 
var4=$(echo "scale=4; $var3 * $var2" | bc) 
echo The final result is $var4 
$ 
```

这个方法适用于较短的运算，但有时你会涉及更多的数字。如果需要进行大量运算，在一个命令行中列出多个表达式就会有点麻烦。 

​		有一个方法可以解决这个问题。bc命令能识别输入重定向，允许你将一个文件重定向到bc命令来处理。但这同样会叫人头疼，因为你还得将表达式存放到文件中。 

​		最好的办法是使用内联输入重定向，它允许你直接在命令行中重定向数据。在shell脚本中，你可以将输出赋给一个变量。 

```bash
variable=$(bc << EOF 
options 
statements 
expressions 
EOF 
) 
```

EOF文本字符串标识了内联重定向数据的起止。记住，仍然需要命令替换符号将bc命令的输出赋给变量。 

​		现在可以将所有bash计算器涉及的部分都放到同一个脚本文件的不同行。下面是在脚本中使用这种技术的例子。 

```bash
$ cat test12 
#!/bin/bash 
 
var1=10.46 
var2=43.67 
var3=33.2 
var4=71 
 
var5=$(bc << EOF 
scale = 4 
a1 = ( $var1 * $var2) 
b1 = ($var3 * $var4) 
a1 + b1 
EOF 
) 
 
echo The final answer for this mess is $var5 
$ 
```

将选项和表达式放在脚本的不同行中可以让处理过程变得更清晰，提高易读性。EOF字符串标识了重定向给bc命令的数据的起止。当然，必须用命令替换符号标识出用来给变量赋值的命令。

​		你还会注意到，在这个例子中，你可以在bash计算器中赋值给变量。这一点很重要：在bash计算器中创建的变量只在bash计算器中有效，不能在shell脚本中使用。 

## 退出脚本

​		迄今为止所有的示例脚本中，我们都是突然停下来的。运行完最后一条命令时，脚本就结束了。其实还有另外一种更优雅的方法可以为脚本划上一个句号。 

​		shell中运行的每个命令都使用退出状态码（exit status）告诉shell它已经运行完毕。退出状态码是一个0～255的整数值，在命令结束运行时由命令传给shell。可以捕获这个值并在脚本中使用。

### 查看退出状态码

​		Linux提供了一个专门的变量`$?`来保存上个已执行命令的退出状态码。对于需要进行检查的命令，必须在其运行完毕后立刻查看或使用$?变量。它的值会变成由shell所执行的最后一条命令的退出状态码。 

```bash
$ date 
Sat Jan 15 10:01:30 EDT 2014 
$ echo $? 
0 
$ 
```

按照惯例，一个成功结束的命令的退出状态码是0。如果一个命令结束时有错误，退出状态码就是一个正数值

```bash
$ asdfg 
-bash: asdfg: command not found 
$ echo $? 
127 
$ 
```

​		无效命令会返回一个退出状态码127。Linux错误退出状态码没有什么标准可循，但有一些可用的参考，如下表所示。

​		**表：Linux退出状态码**

| 状态码 | 描述                       |
| ------ | -------------------------- |
| 0      | 命令成功结束               |
| 1      | 一般性未知错误             |
| 2      | 不适合的shell命令          |
| 126    | 命令不可执行               |
| 127    | 没找到命令                 |
| 128    | 无效的退出参数             |
| 128+x  | 与Linux信号x相关的严重错误 |
| 130    | 通过Ctrl+C终止的命令       |
| 255    | 正常范围之外的退出状态码   |

退出状态码126表明用户没有执行命令的正确权限。 

```bash
$ ./myprog.c 
-bash: ./myprog.c: Permission denied 
$ echo $? 
126 
$ 
```

另一个会碰到的常见错误是给某个命令提供了无效参数

```bash
$ date %t 
date: invalid date '%t' 
$ echo $? 
1 
$
```

这会产生一般性的退出状态码1，表明在命令中发生了未知错误。 

### exit 命令

​		默认情况下，shell脚本会以脚本中的最后一个命令的退出状态码退出

```bash
$ ./test6 
The result is 2 
$ echo $? 
0 
$ 
```

​		你可以改变这种默认行为，返回自己的退出状态码。exit命令允许你在脚本结束时指定一个退出状态码。 

```bash
$ cat test13 
#!/bin/bash 
# testing the exit status 
var1=10 
var2=30 
var3=$[$var1 + $var2] 
echo The answer is $var3 
exit 5 
$ 
```

当查看脚本的退出码时，你会得到作为参数传给exit命令的值

```bash
$ chmod u+x test13 
$ ./test13 
The answer is 40 
$ echo $? 
5 
$ 
```

​		也可以在exit命令的参数中使用变量

```bash
$ cat test14 
#!/bin/bash 
# testing the exit status 
var1=10 
var2=30 
var3=$[$var1 + $var2] 
exit $var3 
$ 
```

当你运行这个命令时，它会产生如下退出状态

```bash
$ chmod u+x test14 
$ ./test14 
$ echo $? 
40 
$ 
```

​		你要注意这个功能，因为退出状态码最大只能是255。看下面例子中会怎样

```bash
$ cat test14b 
#!/bin/bash 
# testing the exit status 
var1=10 
var2=30 
var3=$[$var1 * $var2] 
echo The value is $var3 
exit $var3 
$ 
```

现在运行它的话，会得到如下输出

```bash
$ ./test14b
The value is 300 
$ echo $? 
44 
$
```

退出状态码被缩减到了0～255的区间。shell通过模运算得到这个结果。一个值的模就是被除后的余数。最终的结果是指定的数值除以256后得到的余数。在这个例子中，指定的值是300（返回值），余数是44，因此这个余数就成了最后的状态退出码。 

# 使用结构化命令

​		结构化命令允许你改变程序执行的顺序。在bash shell中有不少结构化命令

## 使用 if-then 语句

​		最基本的结构化命令就是if-then语句。if-then语句有如下格式。

```
if command 
then 
    commands 
fi
```

bash shell的if语句会运行if后面的那个命令。如果该命令的退出状态码是0（该命令成功运行），位于then部分的命令就会被执行。如果该命令的退出状态码是其他值，then 部分的命令就不会被执行，bash shell会继续执行脚本中的下一个命令。fi语句用来表示if-then 语句到此结束。 

```bash
$ cat test1.sh 
#!/bin/bash 
# testing the if statement 
if pwd 
then 
    echo "It worked" 
fi 
$ 
```

shell执行了if行中的pwd命令。由于退出状态码是0，它就又执行了then部分的echo语句。 

```bash
$ cat test2.sh 
#!/bin/bash 
# testing a bad command 
if IamNotaCommand 
then 
   echo "It worked" 
fi 
echo "We are outside the if statement" 
$ 
$ ./test2.sh 
./test2.sh: line 3: IamNotaCommand: command not found 
We are outside the if statement 
$ 
```

例子中，我们在if语句行故意放了一个不能工作的命令。由于这是个错误的命令，所以它会产生一个非零的退出状态码，且bash shell会跳过then部分的echo语句。还要注意，运行if语句中的那个错误命令所生成的错误消息依然会显示在脚本的输出中。有时你可能不想看到错误信息。

​		你可能在有些脚本中看到过if-then语句的另一种形式

```bash
if command; then 
 commands 
fi 
```

通过把分号放在待求值的命令尾部，就可以将then语句放在同一行上了，这样看起来更像其他编程语言中的if-then语句。 

​		在then部分，你可以使用不止一条命令。可以像在脚本中的其他地方一样在这里列出多条命令。bash shell会将这些命令当成一个块，如果if语句行的命令的退出状态值为0，所有的命令都会被执行；如果if语句行的命令的退出状态不为0，所有的命令都会被跳过。 

```bash
$ cat test3.sh 
#!/bin/bash 
# testing multiple commands in the then section 
# 
testuser=Christine 
# 
if grep $testuser /etc/passwd 
then 
   echo "This is my first command" 
   echo "This is my second command" 
   echo "I can even put in other commands besides echo:" 
   ls -a /home/$testuser/.b* 
fi 
$
```

if语句行使用grep命令在/etc/passwd文件中查找某个用户名当前是否在系统上使用。如果有用户使用了那个登录名，脚本会显示一些文本信息并列出该用户HOME目录的bash文件。 但是，如果将testuser变量设置成一个系统上不存在的用户，则什么都不会显示

## if-then-else 语句

​		在if-then语句中，不管命令是否成功执行，你都只有一种选择。如果命令返回一个非零退出状态码，bash shell会继续执行脚本中的下一条命令。在这种情况下，如果能够执行另一组命令就好了。这正是if-then-else语句的作用。 

​		if-then-else语句在语句中提供了另外一组命令

```
if command 
then 
   commands 
else 
   commands 
fi
```

当if语句中的命令返回退出状态码0时，then部分中的命令会被执行，这跟普通的if-then 语句一样。当if语句中的命令返回非零退出状态码时，bash shell会执行else部分中的命令。 

```bash
$ cp test3.sh test4.sh 
$ 
$ nano test4.sh 
$ 
$ cat test4.sh 
#!/bin/bash 
# testing the else section 
# 
testuser=NoSuchUser 
# 
if grep $testuser /etc/passwd 
then 
   echo "The bash files for user $testuser are:" 
   ls -a /home/$testuser/.b* 
   echo 
else 
   echo "The user $testuser does not exist on this system." 
   echo 
fi 
$ 
$ ./test4.sh 
The user NoSuchUser does not exist on this system. 
 
$ 
```

## 嵌套 if

​		有时你需要检查脚本代码中的多种条件。对此，可以使用嵌套的if-then语句。 

​		要检查/etc/passwd文件中是否存在某个用户名以及该用户的目录是否尚在，可以使用嵌套的 if-then语句。嵌套的if-then语句位于主if-then-else语句的else代码块中。 

```bash
$ ls -d /home/NoSuchUser/ 
/home/NoSuchUser/ 
$ 
$ cat test5.sh 
#!/bin/bash 
# Testing nested ifs 
# 
testuser=NoSuchUser 
# 
if grep $testuser /etc/passwd 
then 
   echo "The user $testuser exists on this system." 
else 
   echo "The user $testuser does not exist on this system." 
   if ls -d /home/$testuser/ 
   then 
      echo "However, $testuser has a directory." 
   fi 
fi 
$ 
$ ./test5.sh 
The user NoSuchUser does not exist on this system. 
/home/NoSuchUser/ 
However, NoSuchUser has a directory. 
$ 
```

这个脚本准确无误地发现，尽管登录名已经从/etc/passwd中删除了，但是该用户的目录仍然存在。在脚本中使用这种嵌套if-then语句的问题在于代码不易阅读，很难理清逻辑流程。

​		可以使用else部分的另一种形式：elif。这样就不用再书写多个if-then语句了。elif使用另一个if-then语句延续else部分。 

```bash
if command1 
then 
   commands 
elif command2 
then 
    more commands 
fi
```

elif语句行提供了另一个要测试的命令，这类似于原始的if语句行。如果elif后命令的退出状态码是0，则bash会执行第二个then语句部分的命令。使用这种嵌套方法，代码更清晰，逻辑更易懂。 

```bash
$ cat test5.sh 
#!/bin/bash 
# Testing nested ifs - use elif 
# 
testuser=NoSuchUser 
# 
if grep $testuser /etc/passwd 
then 
   echo "The user $testuser exists on this system." 
# 
elif ls -d /home/$testuser 
then 
   echo "The user $testuser does not exist on this system." 
   echo "However, $testuser has a directory." 
# 
fi 
$ 
$ ./test5.sh 
/home/NoSuchUser 
The user NoSuchUser does not exist on this system. 
However, NoSuchUser has a directory. 
$ 
```

甚至可以更进一步，让脚本检查拥有目录的不存在用户以及没有拥有目录的不存在用户。这可以通过在嵌套elif中加入一个else语句来实现。 

```bash
$ cat test5.sh 
#!/bin/bash 
# Testing nested ifs - use elif & else 
# 
testuser=NoSuchUser 
# 
if grep $testuser /etc/passwd 
then 
   echo "The user $testuser exists on this system." 
# 
elif ls -d /home/$testuser 
then 
   echo "The user $testuser does not exist on this system." 
   echo "However, $testuser has a directory." 
# 
else 
   echo "The user $testuser does not exist on this system." 
   echo "And, $testuser does not have a directory." 
fi 
$ 
$ ./test5.sh 
/home/NoSuchUser 
The user NoSuchUser does not exist on this system. 
However, NoSuchUser has a directory. 
$ 
$ sudo rmdir /home/NoSuchUser 
[sudo] password for Christine: 
$ 
$ ./test5.sh 
ls: cannot access /home/NoSuchUser: No such file or directory 
The user NoSuchUser does not exist on this system. 
And, NoSuchUser does not have a directory. 
$ 
```

在/home/NoSuchUser目录被删除之前，这个测试脚本执行的是elif语句，返回零值的退出状态。因此elif的then代码块中的语句得以执行。删除了/home/NoSuchUser目录之后，elif语句返回的是非零值的退出状态。这使得elif块中的else代码块得以执行

​		在elif语句中，紧跟其后的else语句属于elif代码块。它们并不属于之前的if-then代码块。 

​		可以继续将多个elif语句串起来，形成一个大的if-then-elif嵌套组合

```
if command1 
then 
    command set 1 
elif command2 
then 
   command set 2 
elif command3 
then 
   command set 3 
elif command4 
then 
   command set 4 
fi 
```

每块命令都会根据命令是否会返回退出状态码0来执行。记住，bash shell会依次执行if语句，只有第一个返回退出状态码0的语句中的then部分会被执行

​		尽管使用了elif语句的代码看起来更清晰，但是脚本的逻辑仍然会让人犯晕。在后面，会看到如何使用case命令代替if-then语句的大量嵌套。 

## test 命令

​		你可能想问，if-then语句是否能测试命令退出状态码之外的条件。答案是不能。但在bash shell中有个好用的工具可以帮你通过if-then语句测试其他条件。

​		test命令提供了在if-then语句中测试不同条件的途径。如果test命令中列出的条件成立，test命令就会退出并返回退出状态码0。这样if-then语句就与其他编程语言中的if-then语句以类似的方式工作了。如果条件不成立，test命令就会退出并返回非零的退出状态码，这使得 if-then语句不会再被执行。 

​		test命令的格式非常简单

```
test condition 
```

condition是test命令要测试的一系列参数和值。当用在if-then语句中时，test命令看起来是这样的

```
if test condition 
then 
   commands 
fi 
```

​		如果不写test命令的condition部分，它会以非零的退出状态码退出，并执行else语句块

```bash
$ cat test6.sh 
#!/bin/bash 
# Testing the test command 
# 
if test 
then 
   echo "No expression returns a True" 
else 
   echo "No expression returns a False" 
fi 
$ 
$ ./test6.sh 
No expression returns a False 
$
```

​		当你加入一个条件时，test命令会测试该条件。例如，可以使用test命令确定变量中是否有内容。这只需要一个简单的条件表达式。 

```bash
当你加入一个条件时，test命令会测试该条件。例如，可以使用test命令确定变量中是否 
有内容。这只需要一个简单的条件表达式。 $ cat test6.sh 
#!/bin/bash 
# Testing the test command 
# 
my_variable="Full" 
# 
if test $my_variable 
then 
   echo "The $my_variable expression returns a True" 
# 
else 
   echo "The $my_variable expression returns a False" 
fi 
$ 
$ ./test6.sh 
The Full expression returns a True 
$ 
```

​		变量my_variable中包含有内容（Full），因此当test命令测试条件时，返回的退出状态为0。这使得then语句块中的语句得以执行。

​		如果该变量中没有包含内容，就会出现相反的情况。

```bash
$ cat test6.sh 
#!/bin/bash 
# Testing the test command 
# 
my_variable="" 
# 
if test $my_variable 
then 
   echo "The $my_variable expression returns a True" 
# 
else 
   echo "The $my_variable expression returns a False" 
fi 
$ 
$ ./test6.sh 
The  expression returns a False 
$ 
```

​		bash shell提供了另一种条件测试方法，无需在if-then语句中声明test命令

```
if [ condition ] 
then 
   commands 
fi
```

**方括号定义了测试条件。注意，第一个方括号之后和第二个方括号之前必须加上一个空格，否则就会报错。** 

​		test命令可以判断三类条件

- 数值比较 
- 字符串比较 
- 文件比较 

### 数值比较

​		使用test命令最常见的情形是对两个数值进行比较。下表列出了测试两个值时可用的条件参数。 

​		**表：test命令的数值比较功能**

| 比较      | 描述                   |
| --------- | ---------------------- |
| n1 -eq n2 | 检查n1是否与n2相等     |
| n1 -ge n2 | 检查n1是否大于或等于n2 |
| n1 -gt n2 | 检查n1是否大于n2       |
| n1 -le n2 | 检查n1是否小于或等于n2 |
| n1 -lt n2 | 检查n1是否小于n2       |
| n1 -ne n2 | 检查n1是否不等于n2     |

​		数值条件测试可以用在数字和变量上。这里有个例子

```bash
$ cat numeric_test.sh 
#!/bin/bash 
# Using numeric test evaluations 
#
value1=10 
value2=11 
# 
if [ $value1 -gt 5 ] 
then 
    echo "The test value $value1 is greater than 5" 
fi 
# 
if [ $value1 -eq $value2 ] 
then 
    echo "The values are equal" 
else 
    echo "The values are different" 
fi 
# 
$ 
```

​		但是涉及浮点值时，数值条件测试会有一个限制

```bash
$ cat floating_point_test.sh 
#!/bin/bash 
# Using floating point numbers in test evaluations 
# 
value1=5.555 
# 
echo "The test value is $value1" 
# 
if [ $value1 -gt 5 ] 
then 
    echo "The test value $value1 is greater than 5" 
fi 
# 
$ ./floating_point_test.sh 
The test value is 5.555 
./floating_point_test.sh: line 8:  
[: 5.555: integer expression expected 
$ 
```

此例，变量value1中存储的是浮点值。接着，脚本对这个值进行了测试。显然这里出错了。记住，bash shell只能处理整数。如果你只是要通过echo语句来显示这个结果，那没问题。但是，在基于数字的函数中就不行了，例如我们的数值测试条件。最后一行就说明我们不能在test命令中使用浮点值。 

### 字符串比较

​		条件测试还允许比较字符串值。比较字符串比较烦琐，你马上就会看到。下表列出了可用的字符串比较功能。 

​		**表：字符串比较测试**

| 比较         | 描述                   |
| ------------ | ---------------------- |
| str1 = str2  | 检查str1是否和str2相同 |
| str1 != str2 | 检查str1是否和str2不同 |
| str1 < str2  | 检查str1是否比str2小   |
| str1 > str2  | 检查str1是否比str2大   |
| -n str1      | 检查str1的长度是否非0  |
| -z str1      | 检查str1的长度是否为0  |

#### 字符串相等性

​		字符串的相等和不等条件不言自明，很容易看出两个字符串值是否相同。

```bash
$ cat test7.sh 
#!/bin/bash 
# testing string equality 
testuser=rich 
# 
if [ $USER = $testuser ] 
then 
   echo "Welcome $testuser" 
fi 
$  
$ ./test7.sh 
Welcome rich 
$ 
```

字符串不等条件也可以判断两个字符串是否有相同的值

```bash
$ cat test8.sh 
#!/bin/bash 
# testing string equality 
testuser=baduser 
# 
if [ $USER != $testuser ] 
then 
   echo "This is not $testuser" 
else 
   echo "Welcome $testuser" 
fi 
$  
$ ./test8.sh 
This is not baduser 
$ 
```

记住，在比较字符串的相等性时，比较测试会将所有的标点和大小写情况都考虑在内。 

#### 字符串顺序

​		要测试一个字符串是否比另一个字符串大就是麻烦的开始。当要开始使用测试条件的大于或
小于功能时，就会出现两个经常困扰shell程序员的问题

- 大于号和小于号必须转义，否则shell会把它们当作重定向符号，把字符串值当作文件名；
- 大于和小于顺序和sort命令所采用的不同。 

​		在编写脚本时，第一条可能会导致一个不易察觉的严重问题。下面的例子展示了shell脚本编程初学者时常碰到的问题。 

```bash
$ cat badtest.sh 
#!/bin/bash 
# mis-using string comparisons 
# 
val1=baseball 
val2=hockey 
# 
if [ $val1 > $val2 ] 
then 
   echo "$val1 is greater than $val2" 
else 
   echo "$val1 is less than $val2" 
fi 
$  
$ ./badtest.sh 
baseball is greater than hockey 
$ ls -l hockey 
-rw-r--r--    1 rich     rich            0 Sep 30 19:08 hockey 
$ 
```

这个脚本中只用了大于号，没有出现错误，但结果是错的。脚本把大于号解释成了输出重定向。因此，它创建了一个名为hockey的文件。由于重定向的顺利完成，test命令返回了退出状态码0，if语句便以为所有命令都成功结束了。 

​		要解决这个问题，就需要正确转义大于号

```bash
$ cat test9.sh 
#!/bin/bash 
# mis-using string comparisons 
# 
val1=baseball 
val2=hockey 
# 
if [ $val1 \> $val2 ]
then 
  echo "$val1 is greater than $val2" 
else 
   echo "$val1 is less than $val2" 
fi 
$  
$ ./test9.sh 
baseball is less than hockey 
$ 
```

现在的答案已经符合预期的了

​		第二个问题更细微，除非你经常处理大小写字母，否则几乎遇不到。sort命令处理大写字母的方法刚好跟test命令相反。让我们在脚本中测试一下这个特性。

```bash
$ cat test9b.sh 
#!/bin/bash 
# testing string sort order 
val1=Testing 
val2=testing 
# 
if [ $val1 \> $val2 ] 
then 
   echo "$val1 is greater than $val2" 
else 
   echo "$val1 is less than $val2" 
fi 
$  
$ ./test9b.sh 
Testing is less than testing 
$  
$ sort testfile 
testing 
Testing 
$ 
```

在比较测试中，大写字母被认为是小于小写字母的。但sort命令恰好相反。当你将同样的字符串放进文件中并用sort命令排序时，小写字母会先出现。这是由各个命令使用的排序技术不同造成的。 

​		比较测试中使用的是标准的ASCII顺序，根据每个字符的ASCII数值来决定排序结果。sort 命令使用的是系统的本地化语言设置中定义的排序顺序。对于英语，本地化设置指定了在排序顺序中小写字母出现在大写字母前。 

​		test命令和测试表达式使用标准的数学比较符号来表示字符串比较，而用文本代码来表示数值比较。这个细微的特性被很多程序员理解反了。如果你对数值使用了数学运算符号，shell会将它们当成字符串值，可能无法得到正确的结果。

#### 字符串大小

​		-n和-z可以检查一个变量是否含有数据。

```bash
$ cat test10.sh 
#!/bin/bash 
# testing string length 
val1=testing 
val2='' 
# 
if [ -n $val1 ] 
then 
   echo "The string '$val1' is not empty" 
else 
   echo "The string '$val1' is empty" 
fi 
# 
if [ -z $val2 ] 
then 
   echo "The string '$val2' is empty" 
else 
   echo "The string '$val2' is not empty" 
fi 
# 
if [ -z $val3 ] 
then 
   echo "The string '$val3' is empty" 
else 
   echo "The string '$val3' is not empty" 
fi 
$  
$ ./test10.sh 
The string 'testing' is not empty 
The string '' is empty 
The string '' is empty 
$ 
```

判断val3变量是否长度为0。这个变量并未在shell脚本中定义过，所以它的字符串长度仍然为0，尽管它未被定义过。 

​		空的和未初始化的变量会对shell脚本测试造成灾难性的影响。如果不是很确定一个变量的内容，最好在将其用于数值或字符串比较之前先通过-n或-z来测试一下变量是否含有值。

### 文件比较

​		最后一类比较测试很有可能是shell编程中最为强大、也是用得最多的比较形式。它允许你测 试Linux文件系统上文件和目录的状态。下表列出了这些比较。 

​		**表：test 命令的文件比较功能**

| 比较            | 描述                                     |
| --------------- | ---------------------------------------- |
| -d file         | 检查file是否存在并是一个目录             |
| -e file         | 检查file是否存在                         |
| -f file         | 检查file是否存在并是一个文件             |
| -r file         | 检查file是否存在并可读                   |
| -s file         | 检查file是否存在并非空                   |
| -w file         | -w file 检查file是否存在并可写           |
| -x file         | 检查file是否存在并可执行                 |
| -o file         | 检查file是否存在并属当前用户所有         |
| -G file         | 检查file是否存在并且默认组与当前用户相同 |
| file1 -nt file2 | 检查file1是否比file2新                   |
| file1 -ot file2 | 检查file1是否比file2旧                   |

这些测试条件使你能够在shell脚本中检查文件系统中的文件。它们经常出现在需要进行文件访问的脚本中。

#### 检查目录

​		-d测试会检查指定的目录是否存在于系统中。如果你打算将文件写入目录或是准备切换到某个目录中，先进行测试总是件好事情。  

```bash
$ cat test11.sh 
#!/bin/bash 
# Look before you leap 
# 
jump_directory=/home/arthur 
# 
if [ -d $jump_directory ] 
then 
   echo "The $jump_directory directory exists" 
   cd $jump_directory 
   ls 
else 
   echo "The $jump_directory directory does not exist" 
fi 
#
$ 
$ ./test11.sh 
The /home/arthur directory does not exist 
$
```

示例代码中使用了-d测试条件来检查jump_directory变量中的目录是否存在：若存在，就使用cd命令切换到该目录并列出目录中的内容；若不存在，脚本就输出一条警告信息，然后退出。

#### 检查对象是否存在

​		-e比较允许你的脚本代码在使用文件或目录前先检查它们是否存在。 

```bash
$ cat test12.sh 
#!/bin/bash 
# Check if either a directory or file exists 
# 
location=$HOME 
file_name="sentinel" 
# 
if [ -e $location ] 
then  #Directory does exist 
   echo "OK on the $location directory." 
   echo "Now checking on the file, $file_name." 
   # 
   if [ -e $location/$file_name ] 
   then #File does exist 
       echo "OK on the filename" 
       echo "Updating Current Date..." 
       date >> $location/$file_name 
   # 
   else #File does not exist 
       echo "File does not exist" 
       echo "Nothing to update" 
   fi 
# 
else   #Directory does not exist 
   echo "The $location directory does not exist." 
   echo "Nothing to update" 
fi 
# 
$ 
$ ./test12.sh 
OK on the /home/Christine directory. 
Now checking on the file, sentinel. 
File does not exist 
Nothing to update 
$ 
$ touch sentinel 
$ 
$ ./test12.sh 
OK on the /home/Christine directory. 
Now checking on the file, sentinel. 
OK on the filename 
Updating Current Date... 
$ 
```

第一次检查用-e比较来判断用户是否有`$HOME`目录。如果有，接下来的-e比较会检查 sentinel文件是否存在于$HOME目录中。如果不存在，shell脚本就会提示该文件不存在，不需要进行更新。

​		为确保更新操作能够正常进行，我们创建了sentinel文件，然后重新运行这个shell脚本。这一次在进行条件测试时，$HOME和sentinel文件都存在，因此当前日期和时间就被追加到了文件中。

#### 检查文件

​		-e比较可用于文件和目录。要确定指定对象为文件，必须用-f比较。 

```bash
$ cat test13.sh 
#!/bin/bash 
# Check if either a directory or file exists 
# 
item_name=$HOME 
echo 
echo "The item being checked: $item_name" 
echo 
# 
if [ -e $item_name ] 
then  #Item does exist 
   echo "The item, $item_name, does exist." 
   echo "But is it a file?" 
   echo 
   # 
   if [ -f $item_name ] 
   then #Item is a file 
       echo "Yes, $item_name is a file." 
   # 
   else #Item is not a file 
       echo "No, $item_name is not a file." 
   fi 
# 
else   #Item does not exist 
   echo "The item, $item_name, does not exist." 
   echo "Nothing to update" 
fi 
# 
$ ./test13.sh 
 
The item being checked: /home/Christine 
 
The item, /home/Christine, does exist. 
But is it a file? 
 
No, /home/Christine is not a file. 
$ 
```

这一小段脚本进行了大量的检查！它首先使用-e比较测试$HOME是否存在。如果存在，继续用-f来测试它是不是一个文件。如果它不是文件（当然不会是了），就会显示一条消息，表明这不是一个文件。 

​		我们对变量item_name作了一个小小的修改，将目录`$HOME`替换成文件`$HOME/sentinel`， 结果就不一样了。 

```bash
$ nano test13.sh 
$ 
$ cat test13.sh 
#!/bin/bash 
# Check if either a directory or file exists 
# 
item_name=$HOME/sentinel 
[...] 
$ 
$ ./test13.sh 
 
The item being checked: /home/Christine/sentinel 
 
The item, /home/Christine/sentinel, does exist. 
But is it a file? 
 
Yes, /home/Christine/sentinel is a file. 
$ 
```

这里只列出了脚本test13.sh的部分代码，因为只改变了脚本变量item_name的值。当运行这个脚本时，对$HOME/sentinel进行的-f测试所返回的退出状态码为0，then语句得以执行，然后输出消息：Yes, /home/Christine/sentinel is a file。 

#### 检查是否可读

​		在尝试从文件中读取数据之前，最好先测试一下文件是否可读。可以使用-r比较测试。

```bash
$ cat test14.sh 
#!/bin/bash 
# testing if you can read a file 
pwfile=/etc/shadow 
# 
# first, test if the file exists, and is a file 
if [ -f $pwfile ] 
then 
   # now test if you can read it 
   if [ -r $pwfile ] 
   then 
      tail $pwfile 
   else 
      echo "Sorry, I am unable to read the $pwfile file" 
   fi 
else 
   echo "Sorry, the file $file does not exist" 
fi 
$  
$ ./test14.sh 
Sorry, I am unable to read the /etc/shadow file 
$ 
```

/etc/shadow文件含有系统用户加密后的密码，所以它对系统上的普通用户来说是不可读的。-r比较确定该文件不允许进行读取，因此测试失败，bash shell执行了if-then语句的else部分。

#### 检查空文件

​		应该用-s比较来检查文件是否为空，尤其是在不想删除非空文件的时候。要留心的是，当-s比较成功时，说明文件中有数据。

```bash
$ cat test15.sh 
#!/bin/bash 
# Testing if a file is empty 
# 
file_name=$HOME/sentinel 
# 
if [ -f $file_name ] 
then 
   if [ -s $file_name ] 
   then 
      echo "The $file_name file exists and has data in it." 
      echo "Will not remove this file." 
# 
   else 
      echo "The $file_name file exists, but is empty." 
      echo "Deleting empty file..." 
      rm $file_name 
   fi 
else 
   echo "File, $file_name, does not exist." 
fi 
# 
$ ls -l $HOME/sentinel 
-rw-rw-r--. 1 Christine Christine 29 Jun 25 05:32 /home/Christine/sentinel 
$ 
$ ./test15.sh 
The /home/Christine/sentinel file exists and has data in it. 
Will not remove this file. 
$ 
```

-f比较测试首先测试文件是否存在。如果存在，由-s比较来判断该文件是否为空。空文件会被删除。可以从ls –l的输出中看出sentinel并不是空文件，因此脚本并不会删除它。 

#### 检查是否可写

​		-w比较会判断你对文件是否有可写权限。脚本test16.sh只是脚本test13.sh的修改版。现在不单检查item_name是否存在、是否为文件，还会检查该文件是否有写入权限。 

```bash
$ cat test16.sh 
#!/bin/bash 
# Check if a file is writable. 
# 
item_name=$HOME/sentinel 
echo 
echo "The item being checked: $item_name" 
echo 
[...] 
       echo "Yes, $item_name is a file." 
       echo "But is it writable?" 
       echo 
       # 
       if [ -w $item_name ] 
       then #Item is writable 
            echo "Writing current time to $item_name" 
            date +%H%M >> $item_name 
       # 
       else #Item is not writable 
            echo "Unable to write to $item_name" 
       fi 
   # 
   else #Item is not a file 
       echo "No, $item_name is not a file." 
   fi 
[...] 
$ 
$ ls -l sentinel 
-rw-rw-r--. 1 Christine Christine 0 Jun 27 05:38 sentinel 
$ 
$ ./test16.sh 
 
The item being checked: /home/Christine/sentinel 
 
The item, /home/Christine/sentinel, does exist. 
But is it a file? 
 
Yes, /home/Christine/sentinel is a file. 
But is it writable? 
 
Writing current time to /home/Christine/sentinel 
$ 
$ cat sentinel 
0543 
$ 
```

变量item_name被设置成$HOME/sentinel，该文件允许用户进行写入。因此当脚本运行时，-w测试表达式会返回非零退出状态，然后执行then 代码块，将时间戳写入文件sentinel中。 

​		如果使用chmod关闭文件sentinel的用户 写入权限，-w测试表达式会返回非零的退出状态码，时间戳不会被写入文件。 

```bash
$ chmod u-w sentinel 
$ 
$ ls -l sentinel 
-r--rw-r--. 1 Christine Christine 5 Jun 27 05:43 sentinel 
$ 
$ ./test16.sh 
 
The item being checked: /home/Christine/sentinel 
The item, /home/Christine/sentinel, does exist. 
But is it a file? 
 
Yes, /home/Christine/sentinel is a file. 
But is it writable? 
 
Unable to write to /home/Christine/sentinel 
$ 
```

chmod命令可用来为读者再次回授写入权限。这会使得写入测试表达式返回退出状态码0，并允许一次针对文件的写入尝试。 

#### 检查文件是否可以执行

​		-x比较是判断特定文件是否有执行权限的一个简单方法。虽然可能大多数命令用不到它，但如果你要在shell脚本中运行大量脚本，它就能发挥作用。 

```bash
$ cat test17.sh 
#!/bin/bash 
# testing file execution 
# 
if [ -x test16.sh ] 
then 
   echo "You can run the script: " 
   ./test16.sh 
else 
   echo "Sorry, you are unable to execute the script" 
fi 
$  
$ ./test17.sh 
You can run the script: 
[...] 
$  
$ chmod u-x test16.sh 
$  
$ ./test17.sh 
Sorry, you are unable to execute the script 
$ 
```

这段示例shell脚本用-x比较来测试是否有权限执行test16.sh脚本。如果有权限，它会运行这个脚本。在首次成功运行test16.sh脚本后，更改文件的权限。这次，-x比较失败了，因为你已经没有test16.sh脚本的执行权限了。 

#### 检查所属关系

​		-O比较可以测试出你是否是文件的属主。 

```bash
$ cat test18.sh 
#!/bin/bash 
# check file ownership 
# 
if [ -O /etc/passwd ] 
then 
   echo "You are the owner of the /etc/passwd file" 
else 
   echo "Sorry, you are not the owner of the /etc/passwd file" 
fi 
$  
$ ./test18.sh 
Sorry, you are not the owner of the /etc/passwd file 
$ 
```

这段脚本用-O比较来测试运行该脚本的用户是否是/etc/passwd文件的属主。这个脚本是运行在普通用户账户下的，所以测试失败了。 

#### 检查默认属组关系

​		-G比较会检查文件的默认组，如果它匹配了用户的默认组，则测试成功。由于-G比较只会检查默认组而非用户所属的所有组，这会叫人有点困惑。这里有个例子。 

```bash
$ cat test19.sh 
#!/bin/bash 
# check file group test 
# 
if [ -G $HOME/testing ] 
then 
   echo "You are in the same group as the file" 
else 
   echo "The file is not owned by your group" 
fi 
$  
$ ls -l $HOME/testing 
-rw-rw-r-- 1 rich rich 58 2014-07-30 15:51 /home/rich/testing 
$  
$ ./test19.sh 
You are in the same group as the file 
$  
$ chgrp sharing $HOME/testing 
$  
$ ./test19 
The file is not owned by your group 
$ 
```

第一次运行脚本时，$HOME/testing文件属于rich组，所以通过了-G比较。接下来，组被改成了sharing组，用户也是其中的一员。但是，-G比较失败了，因为它只比较默认组，不会去比较其他的组。 

#### 检查文件日期

​		最后一组方法用来对两个文件的创建日期进行比较。这在编写软件安装脚本时非常有用。有时候，你不会愿意安装一个比系统上已有文件还要旧的文件。 

​		-nt比较会判定一个文件是否比另一个文件新。如果文件较新，那意味着它的文件创建日期更近。-ot比较会判定一个文件是否比另一个文件旧。如果文件较旧，意味着它的创建日期更早。 

```bash
$ cat test20.sh 
#!/bin/bash
# testing file dates 
# 
if [ test19.sh -nt test18.sh ] 
then 
   echo "The test19 file is newer than test18" 
else 
   echo "The test18 file is newer than test19" 
fi 
if [ test17.sh -ot test19.sh ] 
then 
  echo "The test17 file is older than the test19 file" 
fi 
$  
$ ./test20.sh 
The test19 file is newer than test18 
The test17 file is older than the test19 file 
$  
$ ls -l test17.sh test18.sh test19.sh 
-rwxrw-r-- 1 rich rich 167 2014-07-30 16:31 test17.sh 
-rwxrw-r-- 1 rich rich 185 2014-07-30 17:46 test18.sh 
-rwxrw-r-- 1 rich rich 167 2014-07-30 17:50 test19.sh 
$ 
```

​		用于比较文件路径是相对你运行该脚本的目录而言的。如果你要检查的文件已经移走，就会 出现问题。另一个问题是，这些比较都不会先检查文件是否存在。试试这个测试。 

```bash
$ cat test21.sh 
#!/bin/bash 
# testing file dates 
# 
if [ badfile1 -nt badfile2 ] 
then 
   echo "The badfile1 file is newer than badfile2" 
else 
   echo "The badfile2 file is newer than badfile1" 
fi 
$  
$ ./test21.sh 
The badfile2 file is newer than badfile1 
$ 
```

这个小例子演示了如果文件不存在，-nt比较会返回一个错误的结果。在你尝试使用-nt或 -ot比较文件之前，必须先确认文件是存在的。 

## 复合条件测试

​		if-then语句允许你使用布尔逻辑来组合测试。有两种布尔运算符可用

- [ condition1 ] && [ condition2 ] 
- [ condition1 ] || [ condition2 ] 

第一种布尔运算使用AND布尔运算符来组合两个条件。要让then部分的命令执行，两个条件都必须满足

​		布尔逻辑是一种能够将可能的返回值简化为TRUE或FALSE的方法。

​		第二种布尔运算使用OR布尔运算符来组合两个条件。如果任意条件为TRUE，then部分的命令就会执行。 

```bash
$ cat test22.sh 
#!/bin/bash 
# testing compound comparisons 
# 
if [ -d $HOME ] && [ -w $HOME/testing ] 
then 
   echo "The file exists and you can write to it" 
else 
   echo "I cannot write to the file" 
fi 
$  
$ ./test22.sh 
I cannot write to the file 
$ 
$ touch $HOME/testing 
$  
$ ./test22.sh 
The file exists and you can write to it 
$ 
```

使用AND布尔运算符时，两个比较都必须满足。第一个比较会检查用户的`$HOME`目录是否存在。第二个比较会检查在用户的`$HOME`目录是否有个叫testing的文件，以及用户是否有该文件的写入权限。如果两个比较中的一个失败了，if语句就会失败，shell就会执行else部分的命令。如果两个比较都通过了，则if语句通过，shell会执行then部分的命令。 

## if-then 的高级特性

​		bash shell提供了两项可在if-then语句中使用的高级特性

- 用于数学表达式的双括号 
- 用于高级字符串处理功能的双方括号 

### 使用双括号

​		双括号命令允许你在比较过程中使用高级数学表达式。test命令只能在比较中使用简单的算术操作。双括号命令提供了更多的数学符号，这些符号对于用过其他编程语言的程序员而言并不陌生。双括号命令的格式如下

```
(( expression )) 
```

​		expression可以是任意的数学赋值或比较表达式。除了test命令使用的标准数学运算符，下表列出了双括号命令中会用到的其他运算符。 

​		**表：双括号命令符号**

| 符号  | 描述     |
| ----- | -------- |
| val++ | 后增     |
| val-- | 后减     |
| ++val | 先增     |
| --val | 先减     |
| !     | 逻辑求反 |
| -     | 位求反   |
| **    | 幂运算   |
| <<    | 左位移   |
| >>    | 右位移   |
| &     | 位布尔和 |
| \|    | 位布尔或 |
| &&    | 逻辑和   |
| \|\|  | 逻辑或   |

​		可以在if语句中用双括号命令，也可以在脚本中的普通命令里使用来赋值。 

```bash
$ cat test23.sh 
#!/bin/bash 
# using double parenthesis 
# 
val1=10 
# 
if (( $val1 ** 2 > 90 )) 
then 
   (( val2 = $val1 ** 2 )) 
   echo "The square of $val1 is $val2" 
fi 
$  
$ ./test23.sh 
The square of 10 is 100 
$ 
```

注意，不需要将双括号中表达式里的大于号转义。这是双括号命令提供的另一个高级特性。

### 使用双方括号

​		双方括号命令提供了针对字符串比较的高级特性。双方括号命令的格式如下

```
[[ expression ]] 
```

双方括号里的expression使用了test命令中采用的标准字符串比较。但它提供了test命令未提供的另一个特性——模式匹配（pattern matching）。 

​		双方括号在bash shell中工作良好。不过要小心，不是所有的shell都支持双方括号。 

​		在模式匹配中，可以定义一个正则表达式来匹配字符串值

```bash
$ cat test24.sh 
#!/bin/bash 
# using pattern matching 
# 
if [[ $USER == r* ]] 
then 
   echo "Hello $USER" 
else 
   echo "Sorry, I do not know you" 
fi 
$  
$ ./test24.sh 
Hello rich 
$ 
```

在上面的脚本中，我们使用了双等号（==）。双等号将右边的字符串（r*）视为一个模式，并应用模式匹配规则。双方括号命令$USER环境变量进行匹配，看它是否以字母r开头。如果是的话，比较通过，shell会执行then部分的命令。 

## case 命令

​		你会经常发现自己在尝试计算一个变量的值，在一组可能的值中寻找特定值。在这种情形下，你不得不写出很长的if-then-else语句，就像下面这样。 

```bash
$ cat test25.sh 
#!/bin/bash 
# looking for a possible value 
# 
if [ $USER = "rich" ] 
then 
   echo "Welcome $USER" 
   echo "Please enjoy your visit" 
elif [ $USER = "barbara" ] 
then 
   echo "Welcome $USER" 
   echo "Please enjoy your visit" 
elif [ $USER = "testing" ] 
then 
   echo "Special testing account" 
elif [ $USER = "jessica" ] 
then 
   echo "Do not forget to logout when you're done" 
else 
   echo "Sorry, you are not allowed here" 
fi 
$  
$ ./test25.sh 
Welcome rich 
Please enjoy your visit 
$ 
```

elif语句继续if-then检查，为比较变量寻找特定的值。 

​		有了case命令，就不需要再写出所有的elif语句来不停地检查同一个变量的值了。case命令会采用列表格式来检查单个变量的多个值。 

```bash
case variable in 
pattern1 | pattern2) commands1;; 
pattern3) commands2;; 
*) default commands;; 
esac 
```

case命令会将指定的变量与不同模式进行比较。如果变量和模式是匹配的，那么shell会执行为该模式指定的命令。可以通过竖线操作符在一行中分隔出多个模式模式。星号会捕获所有与已知模式不匹配的值。这里有个将if-then-else程序转换成用case命令的例子。 

```bash
$ cat test26.sh 
#!/bin/bash 
# using the case command 
# 
case $USER in 
rich | barbara) 
   echo "Welcome, $USER" 
   echo "Please enjoy your visit";; 
testing) 
  echo "Special testing account";; 
jessica) 
   echo "Do not forget to log off when you're done";; 
*) 
   echo "Sorry, you are not allowed here";; 
esac 
$  
$ ./test26.sh 
Welcome, rich 
Please enjoy your visit 
$
```

case命令提供了一个更清晰的方法来为变量每个可能的值指定不同的选项。 

# 更多的结构化命令

## for 命令

​		bash shell提供了for命令，允许你创建一个遍历一系列值的循环。每次迭代都使用其中一个值来执行已定义好的一组命令。下面是bash shell中for命令的基本格式。

```
for var in list 
do 
    commands 
done
```

在list参数中，你需要提供迭代中要用到的一系列值。可以通过几种不同的方法指定列表中的值

​		在每次迭代中，变量var会包含列表中的当前值。第一次迭代会使用列表中的第一个值，第二次迭代使用第二个值，以此类推，直到列表中的所有值都过一遍。 

​		在do和done语句之间输入的命令可以是一条或多条标准的bash shell命令。在这些命令中，$var变量包含着这次迭代对应的当前列表项中的值。 

​		只要你愿意，也可以将do语句和for语句放在同一行，但必须用分号将其同列表中的值分开：for var in list; do。 

### 读取列表中的值

​		for命令最基本的用法就是遍历for命令自身所定义的一系列值。

```bash
$ cat test1 
#!/bin/bash 
# basic for command 
 
for test in Alabama Alaska Arizona Arkansas California Colorado 
do 
    echo The next state is $test 
done 
$ ./test1 
The next state is Alabama 
The next state is Alaska 
The next state is Arizona 
The next state is Arkansas 
The next state is California 
The next state is Colorado 
$
```

每次for命令遍历值列表，它都会将列表中的下个值赋给`$test`变量。`$test`变量可以像for 命令语句中的其他脚本变量一样使用。在最后一次迭代后，$test变量的值会在shell脚本的剩余部分一直保持有效。它会一直保持最后一次迭代的值（除非你修改了它）。

```bash
$ cat test1b 
#!/bin/bash 
# testing the for variable after the looping 
 
for test in Alabama Alaska Arizona Arkansas California Colorado 
do 
   echo "The next state is $test" 
done 
echo "The last state we visited was $test" 
test=Connecticut 
echo "Wait, now we're visiting $test" 
$ ./test1b 
The next state is Alabama 
The next state is Alaska 
The next state is Arizona 
The next state is Arkansas 
The next state is California 
The next state is Colorado 
The last state we visited was Colorado 
Wait, now we're visiting Connecticut 
$ 
```

$test变量保持了其值，也允许我们修改它的值，并在for命令循环之外跟其他变量一样使用。

### 读取列表中的复杂值

​		事情并不会总像你在for循环中看到的那么简单。有时会遇到难处理的数据。下面是给shell 脚本程序员带来麻烦的典型例子。 

```bash
$ cat badtest1 
#!/bin/bash 
# another example of how not to use the for command 
 
for test in I don't know if this'll work 
do 
    echo "word:$test" 
done 
$ ./badtest1 
word:I 
word:dont know if thisll 
word:work 
$ 
```

真麻烦。shell看到了列表值中的单引号并尝试使用它们来定义一个单独的数据值，这真是把事情搞得一团糟。 

​		有两种办法可解决这个问题

- 使用转义字符（反斜线）来将单引号转义； 
- 使用双引号来定义用到单引号的值。

​		这两种解决方法并没有什么出奇之处，但都能解决这个问题。

```bash
$ cat test2 
#!/bin/bash 
# another example of how not to use the for command 
 
for test in I don\'t know if "this'll" work 
do 
    echo "word:$test" 
done 
$ ./test2 
word:I 
word:don't 
word:know 
word:if 
word:this'll 
word:work 
$ 
```

在第一个有问题的地方添加了反斜线字符来转义don't中的单引号。在第二个有问题的地方将this'll用双引号圈起来。两种方法都能正常辨别出这个值。 

​		你可能遇到的另一个问题是有多个词的值。记住，for循环假定每个值都是用空格分割的。如果有包含空格的数据值，你就陷入麻烦了。 

```bash
$ cat badtest2 
#!/bin/bash 
# another example of how not to use the for command 
 
for test in Nevada New Hampshire New Mexico New York North Carolina 
do 
    echo "Now going to $test" 
done 
$ ./badtest1 
Now going to Nevada 
Now going to New 
Now going to Hampshire 
Now going to New 
Now going to Mexico 
Now going to New 
Now going to York 
Now going to North 
Now going to Carolina 
$ 
```

这不是我们想要的结果。for命令用空格来划分列表中的每个值。如果在单独的数据值中有空格，就必须用双引号将这些值圈起来。 

```bash
$ cat test3 
#!/bin/bash 
# an example of how to properly define values 
 
for test in Nevada "New Hampshire" "New Mexico" "New York" 
do 
    echo "Now going to $test" 
done 
$ ./test3 
Now going to Nevada 
Now going to New Hampshire 
Now going to New Mexico 
Now going to New York 
$ 
```

现在for命令可以正确区分不同值了。另外要注意的是，在某个值两边使用双引号时，shell 并不会将双引号当成值的一部分。 

### 从变量读取列表

​		通常shell脚本遇到的情况是，你将一系列值都集中存储在了一个变量中，然后需要遍历变量中的整个列表。也可以通过for命令完成这个任务。 

```bash
$ cat test4 
#!/bin/bash 
# using a variable to hold the list 
 
list="Alabama Alaska Arizona Arkansas Colorado" 
list=$list" Connecticut" 
for state in $list 
do 
    echo "Have you ever visited $state?" 
done 
$ ./test4 
Have you ever visited Alabama? 
Have you ever visited Alaska? 
Have you ever visited Arizona? 
Have you ever visited Arkansas? 
Have you ever visited Colorado? 
Have you ever visited Connecticut? 
$
```

`$list`变量包含了用于迭代的标准文本值列表。注意，代码还是用了另一个赋值语句向$list 变量包含的已有列表中添加（或者说是拼接）了一个值。这是向变量中存储的已有文本字符串尾部添加文本的一个常用方法。 

### 从命令读取值

​		生成列表中所需值的另外一个途径就是使用命令的输出。可以用命令替换来执行任何能产生输出的命令，然后在for命令中使用该命令的输出。 

```bash
$ cat test5 
#!/bin/bash 
# reading values from a file 
 
file="states" 
 
for state in $(cat $file) 
do 
    echo "Visit beautiful $state" 
done 
$ cat states 
Alabama 
Alaska 
Arizona 
Arkansas 
Colorado 
Connecticut 
Delaware 
Florida 
Georgia 
$ ./test5 
Visit beautiful Alabama 
Visit beautiful Alaska 
Visit beautiful Arizona 
Visit beautiful Arkansas 
Visit beautiful Colorado 
Visit beautiful Connecticut 
Visit beautiful Delaware 
Visit beautiful Florida 
Visit beautiful Georgia 
$
```

这个例子在命令替换中使用了cat命令来输出文件states的内容。你会注意到states文件中每一行有一个州，而不是通过空格分隔的。for命令仍然以每次一行的方式遍历了cat命令的输出，假定每个州都是在单独的一行上。但这并没有解决数据中有空格的问题。如果你列出了一个名字中有空格的州，for命令仍然会将每个单词当作单独的值。这是有原因的，下一节我们将会了解。

​		test5的代码范例将文件名赋给变量，文件名中没有加入路径。这要求文件和脚本位于同一个目录中。如果不是的话，你需要使用全路径名（不管是绝对路径还是相对路径）来引用文件位置。 

### 更改字段分隔符

​		造成这个问题的原因是特殊的环境变量IFS，叫作内部字段分隔符（internal field separator）。IFS环境变量定义了bash shell用作字段分隔符的一系列字符。默认情况下，bash shell会将下列字符当作字段分隔符

- 空格 
- 制表符 
- 换行符 

如果bash shell在数据中看到了这些字符中的任意一个，它就会假定这表明了列表中一个新数据字段的开始。在处理可能含有空格的数据（比如文件名）时，这会非常麻烦，就像你在上一个脚本示例中看到的。 

​		要解决这个问题，可以在shell脚本中临时更改IFS环境变量的值来限制被bash shell当作字段分隔符的字符。例如，如果你想修改IFS的值，使其只能识别换行符，那就必须这么做

```
IFS=$'\n' 
```

​		将这个语句加入到脚本中，告诉bash shell在数据值中忽略空格和制表符。对前一个脚本使用这种方法，将获得如下输出。 

```bash
$ cat test5b 
#!/bin/bash 
# reading values from a file 
 
file="states" 
 
IFS=$'\n' 
for state in $(cat $file) 
do 
    echo "Visit beautiful $state" 
done 
$ ./test5b 
Visit beautiful Alabama 
Visit beautiful Alaska 
Visit beautiful Arizona 
Visit beautiful Arkansas 
Visit beautiful Colorado 
Visit beautiful Connecticut 
Visit beautiful Delaware 
Visit beautiful Florida 
Visit beautiful Georgia 
Visit beautiful New York 
Visit beautiful New Hampshire 
Visit beautiful North Carolina 
$ 
```

现在，shell脚本旧能够使用列表中含有空格的值了。 

​		在处理代码量较大的脚本时，可能在一个地方需要修改IFS的值，然后忽略这次修改，在脚本的其他地方继续沿用IFS的默认值。一个可参考的安全实践是在改变IFS之前保存原来的IFS值，之后再恢复它。 

​		这种技术可以这样实现

```
IFS.OLD=$IFS 
IFS=$'\n' 
<在代码中使用新的IFS值> 
IFS=$IFS.OLD 
```

这就保证了在脚本的后续操作中使用的是IFS的默认值。 

​		还有其他一些IFS环境变量的绝妙用法。假定你要遍历一个文件中用冒号分隔的值（比如在 /etc/passwd文件中）。你要做的就是将IFS的值设为冒号。 

```
IFS=: 
```

如果要指定多个IFS字符，只要将它们在赋值行串起来就行。

```
IFS=$'\n':;" 
```

这个赋值会将换行符、冒号、分号和双引号作为字段分隔符。如何使用IFS字符解析数据没有任何限制。

### 用通配符读取目录

​		最后，可以用for命令来自动遍历目录中的文件。进行此操作时，必须在文件名或路径名中使用通配符。它会强制shell使用文件扩展匹配。文件扩展匹配是生成匹配指定通配符的文件名或路径名的过程。 

​		如果不知道所有的文件名，这个特性在处理目录中的文件时就非常好用。 

```bash
$ cat test6 
#!/bin/bash 
# iterate through all the files in a directory 
 
for file in /home/rich/test/* 
do 
 
    if [ -d "$file" ] 
    then 
       echo "$file is a directory" 
    elif [ -f "$file" ] 
    then 
       echo "$file is a file" 
    fi 
done 
$ ./test6 
/home/rich/test/dir1 is a directory 
/home/rich/test/myprog.c is a file 
/home/rich/test/myprog is a file 
/home/rich/test/myscript is a file 
/home/rich/test/newdir is a directory 
/home/rich/test/newfile is a file 
/home/rich/test/newfile2 is a file 
/home/rich/test/testdir is a directory 
/home/rich/test/testing is a file 
/home/rich/test/testprog is a file 
/home/rich/test/testprog.c is a file 
$ 
```

for命令会遍历/home/rich/test/*输出的结果。该代码用test命令测试了每个条目（使用方括号方法），以查看它是目录（通过-d参数）还是文件（通过-f参数）

​		注意，我们在这个例子的if语句中做了一些不同的处理

```
if [ -d "$file" ] 
```

在Linux中，目录名和文件名中包含空格当然是合法的。要适应这种情况，应该将$file变量用双引号圈起来。如果不这么做，遇到含有空格的目录名或文件名时就会有错误产生。

```
./test6: line 6: [: too many arguments 
./test6: line 9: [: too many arguments 
```

在test命令中，bash shell会将额外的单词当作参数，进而造成错误。 

​		也可以在for命令中列出多个目录通配符，将目录查找和列表合并进同一个for语句。 

```bash
$ cat test7 
#!/bin/bash 
# iterating through multiple directories 
 
for file in /home/rich/.b* /home/rich/badtest 
do 
    if [ -d "$file" ] 
    then 
       echo "$file is a directory" 
    elif [ -f "$file" ] 
    then 
       echo "$file is a file" 
    else 
      echo "$file doesn't exist" 
    fi 
done 
$ ./test7 
/home/rich/.backup.timestamp is a file 
/home/rich/.bash_history is a file 
/home/rich/.bash_logout is a file 
/home/rich/.bash_profile is a file 
/home/rich/.bashrc is a file 
/home/rich/badtest doesn't exist 
$ 
```

for语句首先使用了文件扩展匹配来遍历通配符生成的文件列表，然后它会遍历列表中的下一个文件。可以将任意多的通配符放进列表中。 

​		注意，你可以在数据列表中放入任何东西。即使文件或目录不存在，for语句也会尝试处理列表中的内容。在处理文件或目录时，这可能会是个问题。你无法知道你正在尝试遍历的目录是否存在：在处理之前测试一下文件或目录总是好的。 

## C 语言风格的 for 命令

### C 语言的 for 命令

​		C语言的for命令有一个用来指明变量的特定方法，一个必须保持成立才能继续迭代的条件，以及另一个在每个迭代中改变变量的方法。当指定的条件不成立时，for循环就会停止。条件等式通过标准的数学符号定义。

​		bash shell也支持一种for循环，它看起来跟C语言风格的for循环类似，但有一些细微的不同，其中包括一些让shell脚本程序员困惑的东西。以下是bash中C语言风格的for循环的基本格式。 

```
for (( variable assignment ; condition ; iteration process )) 
```

C语言风格的for循环的格式会让bash shell脚本程序员摸不着头脑，因为它使用了C语言风格的变量引用方式而不是shell风格的变量引用方式。C语言风格的for命令看起来如下。 

```c
for (( a = 1; a < 10; a++ )) 
```

​		注意，有些部分并没有遵循bash shell标准的for命令

- 变量赋值可以有空格； 
- 条件中的变量不以美元符开头； 
- 迭代过程的算式未用expr命令格式。

shell开发人员创建了这种格式以更贴切地模仿C语言风格的for命令。这虽然对C语言程序员来说很好，但也会把专家级的shell程序员弄得一头雾水。在脚本中使用C语言风格的for循环时要小心。

​		以下例子是在bash shell程序中使用C语言风格的for命令

```bash
$ cat test8 
#!/bin/bash 
# testing the C-style for loop 
 
for (( i=1; i <= 10; i++ )) 
do 
    echo "The next number is $i" 
done 
$ ./test8 
The next number is 1 
The next number is 2 
The next number is 3 
The next number is 4 
The next number is 5 
The next number is 6 
The next number is 7 
The next number is 8 
The next number is 9 
The next number is 10 
$
```

for循环通过定义好的变量（本例中是变量i）来迭代执行这些命令。在每次迭代中，$i变量包含了for循环中赋予的值。在每次迭代后，循环的迭代过程会作用在变量上，在本例中，变量增一。

### 使用多个变量

​		C语言风格的for命令也允许为迭代使用多个变量。循环会单独处理每个变量，你可以为每个变量定义不同的迭代过程。尽管可以使用多个变量，但你只能在for循环中定义一种条件。

``` bash
$ cat test9 
#!/bin/bash 
# multiple variables 
 
for (( a=1, b=10; a <= 10; a++, b-- )) 
do 
    echo "$a - $b" 
done 
$ ./test9 
1 - 10 
2 - 9 
3 - 8 
4 - 7 
5 - 6 
6 - 5 
7 - 4 
8 - 3 
9 - 2 
10 - 1 
$ 
```

变量a和b分别用不同的值来初始化并且定义了不同的迭代过程。循环的每次迭代在增加变量 a的同时减小了变量b。 

## while 命令

​		while命令某种意义上是if-then语句和for循环的混杂体。while命令允许定义一个要测试的命令，然后循环执行一组命令，只要定义的测试命令返回的是退出状态码0。它会在每次迭代的一开始测试test命令。在test命令返回非零退出状态码时，while命令会停止执行那组命令。 

### while 的基本格式

​		while命令的格式是

```
while test command 
do 
  other commands 
done
```

while命令中定义的test command和if-then语句中的格式一模一样。可以使用任何普通的bash shell命令，或者用test命令进行条件测试，比如测试变量值。 

​		while命令的关键在于所指定的test command的退出状态码必须随着循环中运行的命令而改变。如果退出状态码不发生变化， while循环就将一直不停地进行下去。 

​		最常见的test command的用法是用方括号来检查循环命令中用到的shell变量的值。 

```bash
$ cat test10 
#!/bin/bash 
# while command test 
 
var1=10
while [ $var1 -gt 0 ] 
do 
    echo $var1 
    var1=$[ $var1 - 1 ] 
done 
$ ./test10 
10 
9 
8 
7 
6 
5 
4 
3 
2 
1 
$ 
```

while命令定义了每次迭代时检查的测试条件

```bash
while [ $var1 -gt 0 ] 
```

只要测试条件成立，while命令就会不停地循环执行定义好的命令。在这些命令中，测试条件中用到的变量必须修改，否则就会陷入无限循环。在本例中，我们用shell算术来将变量值减一

```
var1=$[ $var1 - 1 ] 
```

while循环会在测试条件不再成立时停止。 

### 使用多个测试命令

​		while命令允许你在while语句行定义多个测试命令。只有最后一个测试命令的退出状态码会被用来决定什么时候结束循环。如果你不够小心，可能会导致一些有意思的结果。下面的例子将说明这一点。

```bash
$ cat test11 
#!/bin/bash 
# testing a multicommand while loop 
 
var1=10 
 
while echo $var1 
       [ $var1 -ge 0 ] 
do 
    echo "This is inside the loop" 
    var1=$[ $var1 - 1 ] 
done 
$ ./test11 
10 
This is inside the loop 
9 
This is inside the loop 
8 
This is inside the loop 
7 
This is inside the loop 
6 
This is inside the loop 
5 
This is inside the loop 
4 
This is inside the loop 
3 
This is inside the loop 
2 
This is inside the loop 
1 
This is inside the loop 
0 
This is inside the loop 
-1 
$ 
```

请仔细观察本例中做了什么。while语句中定义了两个测试命令。 

```bash
while echo $var1 
      [ $var1 -ge 0 ] 
```

第一个测试简单地显示了var1变量的当前值。第二个测试用方括号来判断var1变量的值。在循环内部，echo语句会显示一条简单的消息，说明循环被执行了。注意当你运行本例时输出是如何结束的。

```
This is inside the loop 
-1 
$
```

while循环会在var1变量等于0时执行echo语句，然后将var1变量的值减一。接下来再次执行测试命令，用于下一次迭代。echo测试命令被执行并显示了var变量的值（现在小于0了）。直到shell执行test测试命令，whle循环才会停止。 

​		这说明在含有多个命令的while语句中，在每次迭代中所有的测试命令都会被执行，包括测试命令失败的最后一次迭代。要留心这种用法。另一处要留意的是该如何指定多个测试命令。注意，每个测试命令都出现在单独的一行上。 

## until 命令

​		until命令和while命令工作的方式完全相反。until命令要求你指定一个通常返回非零退出状态码的测试命令。只有测试命令的退出状态码不为0，bash shell才会执行循环中列出的命令。一旦测试命令返回了退出状态码0，循环就结束了。 

​		和你想的一样，until命令的格式如下

```
until test commands 
do
	other commands 
done 
```

和while命令类似，你可以在until命令语句中放入多个测试命令。只有最后一个命令的退出状态码决定了bash shell是否执行已定义的other commands。

​		下面是使用until命令的一个例子

```bash
$ cat test12 
#!/bin/bash 
# using the until command 
 
var1=100 
 
until [ $var1 -eq 0 ] 
do 
    echo $var1 
    var1=$[ $var1 - 25 ] 
done 
$ ./test12 
100 
75 
50 
25 
$
```

本例中会测试var1变量来决定until循环何时停止。只要该变量的值等于0，until命令就会停止循环。同while命令一样，在until命令中使用多个测试命令时要注意。 

```bash
$ cat test13 
#!/bin/bash 
# using the until command 
 
var1=100 
 
until echo $var1 
       [ $var1 -eq 0 ] 
do 
    echo Inside the loop: $var1 
    var1=$[ $var1 - 25 ] 
done 
$ ./test13 
100 
Inside the loop: 100 
75 
Inside the loop: 75 
50 
Inside the loop: 50 
25 
Inside the loop: 25 
0 
$ 
```

shell会执行指定的多个测试命令，只有在最后一个命令成立时停止。 

## 嵌套循环

​		循环语句可以在循环内使用任意类型的命令，包括其他循环命令。这种循环叫作嵌套循环（nested loop）。注意，在使用嵌套循环时，你是在迭代中使用迭代，与命令运行的次数是乘积关系。不注意这点的话，有可能会在脚本中造成问题。 

​		这里有个在for循环中嵌套for循环的简单例子

```bash
$ cat test14 
#!/bin/bash 
# nesting for loops 
 
for (( a = 1; a <= 3; a++ )) 
do 
    echo "Starting loop $a:" 
    for (( b = 1; b <= 3; b++ )) 
    do 
       echo "   Inside loop: $b" 
    done 
done 
$ ./test14 
Starting loop 1: 
    Inside loop: 1 
    Inside loop: 2 
    Inside loop: 3 
Starting loop 2: 
    Inside loop: 1 
    Inside loop: 2 
    Inside loop: 3 
Starting loop 3: 
    Inside loop: 1 
    Inside loop: 2 
    Inside loop: 3 
$
```

这个被嵌套的循环（也称为内部循环，inner loop）会在外部循环的每次迭代中遍历一次它所有的值。注意，两个循环的do和done命令没有任何差别。bash shell知道当第一个done命令执行时是指内部循环而非外部循环。 

​		在混用循环命令时也一样，比如在while循环内部放置一个for循环

```bash
$ cat test15 
#!/bin/bash 
# placing a for loop inside a while loop 
 
var1=5 
 
while [ $var1 -ge 0 ] 
do 
    echo "Outer loop: $var1" 
    for (( var2 = 1; $var2 < 3; var2++ )) 
    do 
    	var3=$[ $var1 * $var2 ] 
       echo "  Inner loop: $var1 * $var2 = $var3" 
    done 
    var1=$[ $var1 - 1 ] 
done 
$ ./test15 
Outer loop: 5 
   Inner loop: 5 * 1 = 5 
   Inner loop: 5 * 2 = 10 
Outer loop: 4 
   Inner loop: 4 * 1 = 4 
   Inner loop: 4 * 2 = 8 
Outer loop: 3 
   Inner loop: 3 * 1 = 3 
   Inner loop: 3 * 2 = 6 
Outer loop: 2 
   Inner loop: 2 * 1 = 2 
   Inner loop: 2 * 2 = 4 
Outer loop: 1 
   Inner loop: 1 * 1 = 1 
   Inner loop: 1 * 2 = 2 
Outer loop: 0 
   Inner loop: 0 * 1 = 0 
   Inner loop: 0 * 2 = 0 
$ 
```

同样，shell能够区分开内部for循环和外部while循环各自的do和done命令。 

​		如果真的想挑战脑力，可以混用until和while循环。

```bash
$ cat test16 
#!/bin/bash 
# using until and while loops 
 
var1=3 
 
until [ $var1 -eq 0 ] 
do 
    echo "Outer loop: $var1" 
    var2=1 
    while [ $var2 -lt 5 ] 
    do 
       var3=$(echo "scale=4; $var1 / $var2" | bc) 
       echo "   Inner loop: $var1 / $var2 = $var3" 
       var2=$[ $var2 + 1 ] 
    done 
    var1=$[ $var1 - 1 ] 
done 
$ ./test16 
Outer loop: 3 
    Inner loop: 3 / 1 = 3.0000 
    Inner loop: 3 / 2 = 1.5000 
    Inner loop: 3 / 3 = 1.0000 
    Inner loop: 3 / 4 = .7500 
Outer loop: 2 
	Inner loop: 2 / 1 = 2.0000 
    Inner loop: 2 / 2 = 1.0000 
    Inner loop: 2 / 3 = .6666 
    Inner loop: 2 / 4 = .5000 
Outer loop: 1 
    Inner loop: 1 / 1 = 1.0000 
    Inner loop: 1 / 2 = .5000 
    Inner loop: 1 / 3 = .3333 
    Inner loop: 1 / 4 = .2500 
$ 
```

外部的until循环以值3开始，并继续执行到值等于0。内部while循环以值1开始并一直执行，只要值小于5。每个循环都必须改变在测试条件中用到的值，否则循环就会无止尽进行下去。

## 循环处理文件数据

​		通常必须遍历存储在文件中的数据。这要求结合已经讲过的两种技术

- 使用嵌套循环 
- 修改IFS环境变量 

通过修改IFS环境变量，就能强制for命令将文件中的每行都当成单独的一个条目来处理，即便数据中有空格也是如此。一旦从文件中提取出了单独的行，可能需要再次利用循环来提取行中的数据。

​		典型的例子是处理/etc/passwd文件中的数据。这要求你逐行遍历/etc/passwd文件，并将IFS变量的值改成冒号，这样就能分隔开每行中的各个数据段了。 

```bash
#!/bin/bash 
# changing the IFS value 
 
IFS.OLD=$IFS 
IFS=$'\n' 
for entry in $(cat /etc/passwd) 
do 
    echo "Values in $entry –" 
    IFS=: 
    for value in $entry 
    do 
       echo "   $value" 
    done 
done 
$ 
```

这个脚本使用了两个不同的IFS值来解析数据。第一个IFS值解析出/etc/passwd文件中的单独的行。内部for循环接着将IFS的值修改为冒号，允许你从/etc/passwd的行中解析出单独的值。 

​		在运行这个脚本时，你会得到如下输出。 

```
Values in rich:x:501:501:Rich Blum:/home/rich:/bin/bash - 
   rich 
   x
   501 
    501 
    Rich Blum 
    /home/rich 
    /bin/bash 
 Values in katie:x:502:502:Katie Blum:/home/katie:/bin/bash - 
    katie 
    x 
    506 
    509 
    Katie Blum 
    /home/katie 
    /bin/bash 
```

内部循环会解析出/etc/passwd每行中的各个值。这种方法在处理外部导入电子表格所采用的逗号分隔的数据时也很方便。 

## 控制循环

​		有两个命令能帮我们控制循环内部的情况： 

- break命令 
- continue命令 

每个命令在如何控制循环的执行方面有不同的用法

### break 命令

​		break命令是退出循环的一个简单方法。可以用break命令来退出任意类型的循环，包括while和until循环。 

#### 跳出单个循环

​		在shell执行break命令时，它会尝试跳出当前正在执行的循环。

```bash
$ cat test17 
#!/bin/bash 
# breaking out of a for loop 
 
for var1 in 1 2 3 4 5 6 7 8 9 10 
do 
   if [ $var1 -eq 5 ] 
   then 
      break 
   fi 
   echo "Iteration number: $var1" 
done 
echo "The for loop is completed" 
$ ./test17 
Iteration number: 1 
Iteration number: 2 
Iteration number: 3 
Iteration number: 4 
The for loop is completed 
$ 
```

for循环通常都会遍历列表中指定的所有值。但当满足if-then的条件时，shell会执行break 命令，停止for循环。 

​		这种方法同样适用于while和until循环。

```bash
$ cat test18 
#!/bin/bash 
# breaking out of a while loop 
 
var1=1 
 
while [ $var1 -lt 10 ] 
do 
   if [ $var1 -eq 5 ] 
   then 
      break 
   fi 
   echo "Iteration: $var1" 
   var1=$[ $var1 + 1 ] 
done 
echo "The while loop is completed" 
$ ./test18 
Iteration: 1 
Iteration: 2 
Iteration: 3 
Iteration: 4 
The while loop is completed 
$ 
```

while循环会在if-then的条件满足时执行break命令，终止。 

#### 跳出内部循环

​		在处理多个循环时，break命令会自动终止你所在的最内层的循环。 

```bash
$ cat test19 
#!/bin/bash 
# breaking out of an inner loop 
 
for (( a = 1; a < 4; a++ )) 
do 
   echo "Outer loop: $a" 
   for (( b = 1; b < 100; b++ )) 
   do 
      if [ $b -eq 5 ] 
      then 
         break 
      fi 
      	echo "   Inner loop: $b" 
   done 
done 
$ ./test19 
Outer loop: 1 
   Inner loop: 1 
   Inner loop: 2 
   Inner loop: 3 
   Inner loop: 4 
Outer loop: 2 
   Inner loop: 1 
   Inner loop: 2 
   Inner loop: 3 
   Inner loop: 4 
Outer loop: 3 
   Inner loop: 1 
   Inner loop: 2 
   Inner loop: 3 
   Inner loop: 4 
$ 
```

内部循环里的for语句指明当变量b等于100时停止迭代。但内部循环的if-then语句指明当变量b的值等于5时执行break命令。注意，即使内部循环通过break命令终止了，外部循环依然继续执行。 

#### 跳出外部循环

​		有时你在内部循环，但需要停止外部循环。break命令接受单个命令行参数值： 

```
break n 
```

其中n指定了要跳出的循环层级。默认情况下，n为1，表明跳出的是当前的循环。如果你将n设为2，break命令就会停止下一级的外部循环。 

```bash
$ cat test20 
#!/bin/bash 
# breaking out of an outer loop 
 
for (( a = 1; a < 4; a++ )) 
do 
   echo "Outer loop: $a" 
   for (( b = 1; b < 100; b++ )) 
   do 
      if [ $b -gt 4 ] 
      then 
         break 2 
      fi 
      echo "   Inner loop: $b" 
   done 
done 
$ ./test20 
Outer loop: 1 
   Inner loop: 1 
   Inner loop: 2 
   Inner loop: 3 
   Inner loop: 4 
$ 
```

注意，当shell执行了break命令后，外部循环就停止了。 

### continue 命令

​		continue命令可以提前中止某次循环中的命令，但并不会完全终止整个循环。可以在循环内部设置shell不执行命令的条件。这里有个在for循环中使用continue命令的简单例子。 

```bash
$ cat test21 
#!/bin/bash 
# using the continue command 
 
for (( var1 = 1; var1 < 15; var1++ )) 
do 
   if [ $var1 -gt 5 ] && [ $var1 -lt 10 ] 
   then 
      continue 
   fi 
   echo "Iteration number: $var1" 
done 
$ ./test21 
Iteration number: 1 
Iteration number: 2 
Iteration number: 3 
Iteration number: 4 
Iteration number: 5 
Iteration number: 10 
Iteration number: 11 
Iteration number: 12 
Iteration number: 13 
Iteration number: 14 
$ 
```

当if-then语句的条件被满足时（值大于5且小于10），shell会执行continue命令，跳过此次循环中剩余的命令，但整个循环还会继续。当if-then的条件不再被满足时，一切又回到正轨。

​		也可以在while和until循环中使用continue命令，但要特别小心。记住，当shell执行 continue命令时，它会跳过剩余的命令。如果你在其中某个条件里对测试条件变量进行增值，问题就会出现。 

```bash
$ cat badtest3 
#!/bin/bash 
# improperly using the continue command in a while loop 
 
var1=0 
 
while echo "while iteration: $var1" 
      [ $var1 -lt 15 ] 
do 
   if [ $var1 -gt 5 ] && [ $var1 -lt 10 ] 
   then 
   	  continue 
   fi 
   echo "   Inside iteration number: $var1" 
   var1=$[ $var1 + 1 ] 
done 
$ ./badtest3 | more 
while iteration: 0 
   Inside iteration number: 0 
while iteration: 1 
   Inside iteration number: 1 
while iteration: 2 
   Inside iteration number: 2 
while iteration: 3 
   Inside iteration number: 3 
while iteration: 4 
   Inside iteration number: 4 
while iteration: 5 
   Inside iteration number: 5 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
while iteration: 6 
$ 
```

你得确保将脚本的输出重定向到了more命令，这样才能停止输出。在if-then的条件成立之前，所有一切看起来都很正常，然后shell执行了continue命令。当shell执行continue命令时，它跳过了while循环中余下的命令。不幸的是，被跳过的部分正是$var1计数变量增值的地方，而这个变量又被用于while测试命令中。这意味着这个变量的值不会再变化了，从前面连续的输出显示中你也可以看出来。 

​		和break命令一样，continue命令也允许通过命令行参数指定要继续执行哪一级循环

```
continue n 
```

其中n定义了要继续的循环层级。下面是继续外部for循环的一个例子

```bash
$ cat test22 
#!/bin/bash 
# continuing an outer loop 
 
for (( a = 1; a <= 5; a++ )) 
do 
   echo "Iteration $a:" 
   for (( b = 1; b < 3; b++ )) 
   do 
      if [ $a -gt 2 ] && [ $a -lt 4 ] 
      then 
      	 continue 2 
      fi 
      var3=$[ $a * $b ] 
      echo "   The result of $a * $b is $var3" 
   done 
done 
$ ./test22 
Iteration 1: 
   The result of 1 * 1 is 1 
   The result of 1 * 2 is 2 
Iteration 2: 
   The result of 2 * 1 is 2 
   The result of 2 * 2 is 4 
Iteration 3: 
Iteration 4: 
   The result of 4 * 1 is 4 
   The result of 4 * 2 is 8 
Iteration 5: 
   The result of 5 * 1 is 5 
   The result of 5 * 2 is 10 
$ 
```

其中的if-then语句

```bash
if [ $a -gt 2 ] && [ $a -lt 4 ] 
      then 
         continue 2 
      fi 
```

此处用continue命令来停止处理循环内的命令，但会继续处理外部循环。注意，值为3的那次迭代并没有处理任何内部循环语句，因为尽管continue命令停止了处理过程，但外部循环依然会继续。

## 处理循环的输出

​		最后，在shell脚本中，你可以对循环的输出使用管道或进行重定向。这可以通过在done命令之后添加一个处理命令来实现。 

```bash
for file in /home/rich/* 
 do 
   if [ -d "$file" ] 
   then 
      echo "$file is a directory" 
   elif 
      echo "$file is a file" 
   fi 
done > output.txt 
```

shell会将for命令的结果重定向到文件output.txt中，而不是显示在屏幕上。 

​		考虑下面将for命令的输出重定向到文件的例子。

```bash
$ cat test23 
#!/bin/bash 
# redirecting the for output to a file 
 
for (( a = 1; a < 10; a++ )) 
do 
   echo "The number is $a" 
done > test23.txt 
echo "The command is finished." 
$ ./test23 
The command is finished. 
$ cat test23.txt 
The number is 1 
The number is 2 
The number is 3 
The number is 4 
The number is 5 
The number is 6 
The number is 7 
The number is 8 
The number is 9 
$ 
```

​		shell创建了文件test23.txt并将for命令的输出重定向到这个文件。shell在for命令之后正常显示了echo语句。

​		这种方法同样适用于将循环的结果管接给另一个命令

```bash
$ cat test24 
#!/bin/bash 
# piping a loop to another command 
 
for state in "North Dakota" Connecticut Illinois Alabama Tennessee 
do 
   echo "$state is the next place to go" 
done | sort 
echo "This completes our travels" 
$ ./test24 
Alabama is the next place to go 
Connecticut is the next place to go 
Illinois is the next place to go 
North Dakota is the next place to go 
Tennessee is the next place to go 
This completes our travels 
$ 
```

state值并没有在for命令列表中以特定次序列出。for命令的输出传给了sort命令，该命令会改变for命令输出结果的顺序。运行这个脚本实际上说明了结果已经在脚本内部排好序了。 

## 实例

### 查找可执行文件

​		当你从命令行中运行一个程序的时候，Linux系统会搜索一系列目录来查找对应的文件。这些目录被定义在环境变量PATH中。如果你想找出系统中有哪些可执行文件可供使用，只需要扫描PATH环境变量中所有的目录就行了。如果要徒手查找的话，就得花点时间了。不过我们可以编写一个小小的脚本，轻而易举地搞定这件事。

​		首先是创建一个for循环，对环境变量PATH中的目录进行迭代。处理的时候别忘了设置IFS分隔符。 

```bash
IFS=: 
for folder in $PATH 
do 
```

现在你已经将各个目录存放在了变量$folder中，可以使用另一个for循环来迭代特定目录中的所有文件。 

```bash
for file in $folder/* 
do
```

最后一步是检查各个文件是否具有可执行权限，你可以使用if-then测试功能来实现。 

```bash
if [ -x $file ] 
then 
   echo "   $file" 
fi 
```

好了，搞定了！将这些代码片段组合成脚本就行了。 

```bash
$ cat test25 
#!/bin/bash 
# finding files in the PATH 
 
IFS=: 
for folder in $PATH 
do 
   echo "$folder:" 
   for file in $folder/* 
   do 
      if [ -x $file ] 
      then 
         echo "   $file" 
      fi 
   done 
done 
$ 
```

运行这段代码时，你会得到一个可以在命令行中使用的可执行文件的列表。

```bash
$ ./test25 | more 
/usr/local/bin: 
/usr/bin: 
   /usr/bin/Mail 
   /usr/bin/Thunar 
   /usr/bin/X
   /usr/bin/Xorg 
   /usr/bin/[ 
   /usr/bin/a2p 
   /usr/bin/abiword 
   /usr/bin/ac 
   /usr/bin/activation-client 
   /usr/bin/addr2line 
... 
```

输出显示了在环境变量PATH所包含的所有目录中找到的全部可执行文件，数量真是不少！

### 创建多个用户账户

​		shell脚本的目标是让系统管理员过得更轻松。如果你碰巧工作在一个拥有大量用户的环境中，最烦人的工作之一就是创建新用户账户。好在可以使用while循环来降低工作的难度。 

​		你不用为每个需要创建的新用户账户手动输入useradd命令，而是可以将需要添加的新用户账户放在一个文本文件中，然后创建一个简单的脚本进行处理。这个文本文件的格式如下

```
userid,user name 
```

第一个条目是你为新用户账户所选用的用户ID。第二个条目是用户的全名。两个值之间使用逗号分隔，这样就形成了一种名为逗号分隔值的文件格式（或者是.csv）。这种文件格式在电子表格中极其常见，所以你可以轻松地在电子表格程序中创建用户账户列表，然后将其保存成.csv格式，以备shell脚本读取及处理。 

​		要读取文件中的数据，得用上一点shell脚本编程技巧。我们将IFS分隔符设置成逗号，并将其放入while语句的条件测试部分。然后使用read命令读取文件中的各行。实现代码如下

```
while IFS=’,’ read –r userid name  
```

read命令会自动读取.csv文本文件的下一行内容，所以不需要专门再写一个循环来处理。当read命令返回FALSE时（也就是读取完整个文件时），while命令就会退出。妙极了！ 

​		要想把数据从文件中送入while命令，只需在while命令尾部使用一个重定向符就可以了。 

​		将各部分处理过程写成脚本如下

```bash
$ cat test26 
#!/bin/bash 
# process new user accounts 
 
input="users.csv" 
while IFS=',' read -r userid name 
do 
  echo "adding $userid" 
  useradd -c "$name" -m $userid 
done < "$input" 
$ 
```

$input变量指向数据文件，并且该变量被作为while命令的重定向数据。users.csv文件内容如下。 

```bash
$ cat users.csv 
rich,Richard Blum 
christine,Christine Bresnahan 
barbara,Barbara Blum 
tim,Timothy Bresnahan 
$ 
```

必须作为root用户才能运行这个脚本，因为useradd命令需要root权限。

```bash
# ./test26 
adding rich 
adding christine 
adding barbara 
adding tim 
#  
```

来看一眼/etc/passwd文件，你会发现账户已经创建好了。 

```bash
# tail /etc/passwd 
rich:x:1001:1001:Richard Blum:/home/rich:/bin/bash 
christine:x:1002:1002:Christine Bresnahan:/home/christine:/bin/bash 
barbara:x:1003:1003:Barbara Blum:/home/barbara:/bin/bash 
tim:x:1004:1004:Timothy Bresnahan:/home/tim:/bin/bash 
# 
```

恭喜，你已经在添加用户账户这项任务上给自己省出了大量时间！ 