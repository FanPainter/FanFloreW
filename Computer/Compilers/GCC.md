# GCC与头文件

​		**gcc 与头文件相关的参数**

- `-I`：指定头文件路径（相对路径或绝对路径，建议相对路径）
- `-i`：指定头文件名字（一般不使用，而是直接放在`.c` 文件中通过`#include<xxx.h>` 添加）

​		**gcc头文件的搜索路径**

1. 头文件的搜索会从`-I`指定的目录开始；
2. 然后搜索gcc的环境变量 C_INCLUDE_PATH，CPLUS_INCLUDE_PATH，finOBJC_INCLUDE_PATH 设置的目录；
3. 再搜索系统目录 /usr/include 和 /usr/local/include（centos7中该目录下是空的）；
4. 最后搜索gcc的一系列自带目录（如/usr/include/c++/4.8.5）。

# GCC与库文件

​		**GCC与库文件相关的参数**

- `-L`：指定连接的动态库或者静态库路径（相对路径或绝对路径，建议相对路径）
- `-l`：指定需要链接的库的名字（链接 libc.a : -lc；链接动态库：libc.so : -lc）。 
  - `-l`后面可以直接添加库名省去“lib”和“.so”或“.a”。 
  - `-l`链接的到底是动态库还是静态库：如果链接路径下同时有 .so 和 .a 那优先链接 .so 。

​		**如果路径下同时有静态库和动态库如何链接静态库**

- 使用显示链接：`gcc -l:lib***.a` （将静态库的名字显示写出来）
- 在 gcc 编译的时候 加入参数 `-static -lXXX`，则可以添加路径下面的静态库。

​		**ldd命令**

​		可以通过 ldd 命令查看生成的目标文件链接的库，使用方法：`ldd <二进制可执行文件>`。除非指定链接后生成的二进制文件名，否则默认为`.out·文件就是扩展名为out的文件，它本身不代表任何信息。在Linux中判断文件是否是可执行文件，首先要看文件的属性是否是可执行的，它没有一个默认的扩展名表示此文件为可执行文件。为了方便，Linux中可执行文件一般都是没有扩展名的。

​		**库文件编译的搜索路径**

1. gcc会先搜索`-L`指定的目录；
2. 再搜索gcc的环境变量LIBRARY_PATH；
3. 再搜索系统目录：/lib和/lib64、/usr/lib 和/usr/lib64、/usr/local/lib和/usr/local/lib64，这是当初compile gcc时写在程序内的。（静态库和动态库的搜索）

​		**运行时动态库的搜索路径，动态库的搜索路径搜索的先后顺序是**

1. 编译目标代码时指定的动态库搜索路径；
2. 环境变量LD_LIBRARY_PATH指定的动态库搜索路径；
3. 配置文件/etc/ld.so.conf中指定的动态库搜索路径；
4. 默认的动态库搜索路径/lib；/lib64
5. 默认的动态库搜索路径/usr/lib 。 /usr/lib64。当然，如果是64位系统，还包括 /lib64 和 /usr/lib64。

​		**静态库的搜索路径**

1. ld会去找GCC命令行中的参数-L的目录中是否有该静态库；
2. 再去找GCC的环境变量LIBRARY_PATH
3. 再找内定目录/lib /lib64、/usr/lib /usr/lib64、/usr/local/lib /usr/local/lib64是否有该链接库，这是当初compile gcc的时候确定的。

# C++头文件的当前目录下的匹配搜索

![img](https://i-blog.csdnimg.cn/blog_migrate/66ee5f7bc18c87148ec33d06e203ce2e.png)

1. Main.c 中需要引用头文件 func1.h：处于同一文件夹下：#include“func1.h”直接引用
2. Main.c 中需要引用头文件func2.h：fun2.h处于main的平行子文件夹下
   #include “func2\func2.h”（文件夹func2后再引用）
3. Main.c 中需要引用头文件func3.h：func3.h处于main的上级文件夹下
   #include “…\func3.h”（…后再引用）
4. Main.c 中需要引用头文件func4.h：func4.h处于main的上级文件夹的下一级文件夹下 #include “…\func4\func4.h”（…和func4后再用）

​		C和C++中include 搜索路径的一般形式：对于include 搜索的路径：C中可以通过 #include <stdio.h> 和 #include “stdio.h” ，区别是：在UNIX系统中,尖括号告诉编译器在一个或者多个标准系统目录中找到文件 /usr/include /usr/local/include；即系统头文件所在的目录。看看这些文件夹下是否有该头文件；如果没有，也不会检索当前文件所在路径，并将报错。使用双引号“”“”,编译器先到当前目录查找头文件或文件名中指定的其他目录，如果没找到在到标准系统目录查找。即，首先搜索本地目录，但是具体哪个目录依赖于编译器。有些编译器搜索源代码所在目录，有些则搜索当前目录，还有些搜索工程文件所在目录。当出现此类问题时，我们最好注意自己所用的编译器是如何操作的。同时，include也可以采用相对路径。比如，a.c需要/usr/local/include/leap/leap.h，而/usr/local/include是系统的默认搜索路径，所以在a.c中可以用相对路径包含， #include<leap/leap.h>。



























