# C 语言的 GCC 扩展
GNU 编译器（GCC）提供了很多 C 语言扩展，有些扩展对系统编程人员是非常有帮助的。以下要提及的一些 C 语言的主要扩展，使得编程人员可以给编译器提供其代码期望使用方式和行为相关的额外信息。编译器会使用该信息生成更高效的机器代码。其他扩展填补了 C 编程语言的一些空白，尤其是在底层。

GCC 提供了一些扩展，在最新的 C 标准 ISO C11 中提供了这些扩展。有些扩展函数和 C11 提供的实现方式类似，但其他扩展实现方式差别很大。新代码应该使用 C11 标准提供的这些功能。在这里只是探讨 GCC 特有的一些扩展。
## GNU C
GCC 提供的 C 语言风格也称为 GNU C。在 20 世纪 90 年代，GNU C 填补了 C 语言的一些空白，提供如复杂变量、零长度数组、内联函数和命名的初始化器（named intializer）等功能。但是，大约十年之后，C 语言得到全面升级，通过 ISO C99 和 ISO C11 标准后，GNU C 扩展变得不是那么重要。尽管如此，GNU C 还是继续提供很多有用的功能，很多 Linux 编程人员依然使用 GNU C 的子集，往往只是一两个扩展，代码可以和 C99 或 C11 兼容。

GCC 特有的代码库的一个重要实例是 Linux 内核，它是严格通过 GNU C 实现的。但是，最近英特尔做了一些工程上的努力，支持 Intel C 编译器（ICC）理解内核所使用的 GNU C 扩展。因此，现在这些扩展很多都变得不再是 GCC 所特有的了。
## 内联函数
编译器会把“内联（inline）”函数的全部代码拷贝到调用函数的地方。对于普通函数而言，函数是保存在调用函数的外面，每次调用时就跳到保存的位置;而内联函数是直接运行函数内容。通过这种方式，可以节省函数调用的开销，可以在调用方处进行优化，因为编译器可以对调用方和被调用方统一优化。如果调用方传递的函数参数是个常数时，这一点就特别有用。但是，一般来说，把一个函数拷贝到每个代码块中对于代码大小可能会有非常大的影响。因此，只有当函数很小、很简单且使用的地方不是特别多时，才考虑实现成内联函数。

GCC 已经支持 inline 关键字很多年了，inline 关键字可以告诉编译器把给定函数关联起来。C99 正式定义了该关键字
```c
static inline int foo(void) {/* ... */}
```
但是，从技术角度看，该关键字只是提示一告诉编译器要对给定函数进行内联。GCC 进一步提供了扩展，告诉编译器对指定的函数“总是（always）”执行内联操作
```c
static inline __attribute__((always_inline)) int foo (void) {/* ... */}
```

内联函数最明显的替代是预处理器宏。GCC 中的内联函数性能和宏一样，同时可以做类型检查。举个例子，下面这个宏定义
```c
#define max(a, b)({a>b?a:b;})
```
可以通过相应的内联函数来实现
```c
static inline max(int a, int b)
{
    if(a > b)
        return a;
    return b;
}
```
编程人员往往会过多使用内联函数。在现代计算机体系架构上，尤其是 x86，函数调用的成本非常非常低。只有最有价值的函数才值得考虑使用内联函数。
## 避免内联
GCC 在最激进（aggressive）的优化模式下，GCC 会自动选择看起来适于优化的函数，并执行优化。这是个好主意，但是某些情况下，编程人员会发现 GCC 自动内联导致函数执行行为不对。其中一个例子是使用 `__builtin_return_address`。为避免 GCC 自动内联，使用关键字 noinline
```c
__attribute__((noinline)) int foo(void){/* ... */}
```
## 纯函数
“纯”函数是指不会带来其他影响，其返回值只受函数参数或 nonvolatile 全局变量影响。任何参数或全局访问都只支持“只读”模式。循环优化和消除子表达式的场景可以使用纯函数。纯函数是通过关键字 pure 来标识的
```c
__attribute__((pure)) int foo(int val){/* ... */}
```
一个常见的示例是 strlen()。只要输入相同，对于多次调用，该函数的返回值都是样的。因此可以从循环中抽取出来，只调用一次。举个例子，对于下面的代码
```c
// character by character, print each letter in 'p' in uppercase
for(i=0;i<strlen(p);i++)
    printf("%c", toupper(p[i]));
```
如果编译器不知道 strlen() 是纯函数，它就会在每次循环迭代时都调用该函数。

有经验的编程人员或编译器，如果认为 strlen() 是纯函数，就会编写/生成如下代码
```c
size_t len;

len = strlen(p);
for(i = 0; i < len; i++)
    printf("%c", toupper(p[i]));
```
但是，更聪明的编程人员会编写如下代码
```c
while(*p)
    printf("%c", toupper(*p++));
```
纯函数不能返回 void 类型，这么做也没有意义，因为返回值是纯函数的“灵魂”非纯函数的一个示例是 random()。
## 常函数（constant functions）
常函数是一种严格的纯函数。常函数不能访问全局变量，参数不能是指针类型。因此，常函数的返回值只和值传递的参数值有关。和纯函数相比，常函数可以做进一步的优化。数学函数，比如 abs()，是一种常函数（假设它们不保存状态，或者为了优化加入一些技巧）。编程人员可以通过关键字 const 来标识函数是常量的
```c
__attribute__((const)) int foo(int val){/* ... */}
```
和纯函数一样，常函数返回 void 类型也是非法且没有任何意义的。
## 没有返回值的函数
如果一个函数没有返回值，可能因为它一直调用 exit() 函数，编程人员可以通过 noreturn 关键字标识函数没有返回值，也告诉编译器函数没有返回值
```c
__attribute__((noreturn)) void foo(int val){/* ... */}
```
此外，编译器知道调用的函数绝对不会有返回值时，还可以做些额外的优化。这类函数只能返回 void，返回其他类型都是没有任何意义的。
## 分配内存的函数
如果函数返回的指针永远都不会“别名指向（alias）”已有内存，几乎是确定的，因为函数已经分配了新的内存，并返回指向它的指针，编程人员可以通过 malloc 关键字来标识该函数，从而编译器可以执行合适的优化

当两个或多个指针变量指向同一个内存地址时，会发生“内存别名（memory alias）"。这会发生在一些琐碎场景，比如一个指针的值被赋值给另一个指针，也可以发生在更复杂、不那么明显的场景中。如果函数返回新分配内存的地址，该地址不应该存在其他指针。
```c
__attribute__((malloc)) void * get_page (void)
{
    int page_size;
    
    page_size = getpagesize();
    if(page_size <= 0)
        return NULL;
    
    return malloc(page_size);
}
```
## 强制调用方检查返回值
这不是一种优化方案，而是编程辅助，waru_nused_result 属性告诉编译器当函数的返回值没有保存或在条件语句中使用时就生成一条告警信息
```c
__attribute__((waru_nused_result)) void foo(void){/* ... */}
```
该功能支持编程人员确保所有的调用方能够检查和处理函数的返回值,该返回值非常重要。包含重要、但经常被忽略的返回值的函数，如 read() 就很适合使用该属性。这些函数不能返回 void。
## 把函数标识为 ”Deprecated（已废弃）“
deprecated 属性要求编译器在函数调用时，在调用方生成一条告警信息
```c
__attribute__((deprecated)) void foo(void){/* ... */}
```
这有助于使编程人员放弃已废弃和过时的接口。
## 把函数标识为已使用
在某些情况下，编译器不可见的一些代码调用了某个特定的函数。给函数添加 used 属性使得编译器可以告诉程序使用该函数，即使该函数看起来似乎从未被引用
```c
static __attribute__((used)) void foo(void){/* ... */}
```
因此，编译器会输出生成的汇编代码，不会显示函数没有被使用的告警信息。当一个静态函数只被手工编写的汇编代码调用时，就可以使用该属性。一般情况下，如果编译器没有发现任何调用，它就会生成一条告警信息，可能会做些优化，删除该函数。
## 把函数或参数标识为未使用的
unused 属性告诉编译器给定函数或函数参数是未使用的，不要发出任何相关的告警信息
```c
int foo (long __attribute__((unused)) value){/* ... */}
```
当通过 -W 或 -Wunused 选项编译，并且希望捕获未使用的函数参数，但在某些情况下有些函数需要匹配预定义的签名（这对于基于事件驱动的 GUI 编程或信号处理器是很常见的），在这种情况下就可以使用 unused 属性。
## 对结构体进行紧凑存储（pack）
packed 属性告诉编译器一个类型或变量应该在内存中进行紧凑存储，使用尽可能少的空间，可能不依赖对齐需求。如果在结构体（struct）或联合体（union）上指定该属性，就需要对所有变量进行紧凑存储。如果只是对某个变量指定该属性，就只会紧凑存储该特定对象。

以下使用方式会对结构体中的所有变量进行紧凑存储，尽可能占用最小的空间
```c
struct __attribute__((packed)) foo {...}
```
在这个例子中，如果一个结构体包含一个 char 类型，紧跟着的是一个 int 类型，很可能会发现该整数会遵循内存地址对齐，其地址不会紧接着 char 的地址，中间会隔着三个字节。编译器会通过插入一些未使用的字节来填充，从而使得变量符合内存地址对齐。而对于紧凑存储格式，结构体中不会有未使用的字节填充，这样很可能消耗的内存少，但是不满足计算机体系结构的对齐要求。
## 增加变量的对齐
除了支持变量紧凑存储，GCC 还支持编程人员为给定变量指定最小的对齐方式。这样，GCC 就会对指定的变量按（大于等于）指定值进行对齐，这与体系结构和 ABI 所指定的最小对齐方式相反。举个例子，以下声明表示名为 beard_length 的整数，最小对齐方式是 32 个字节（这和传统的在 32 位机器上按 4 个字节对齐的方式不同）
```c
int beard_length __attribute__((aligned (32))) = 0;
```
只有当硬件需要比体系结构有更高的对齐需求时，或者当手动处理 C 和汇编代码需要指定特殊的对齐值时，强制指定类型对齐值才有意义。使用这种对齐功能的个例子是在处理器缓存中保存经常使用的变量，从而优化缓存行为。Linux 内核就使用了这种技术。

除了指定特定最小的对齐值外，GCC 把给定类型按最小对齐值中的最大值进行分配，这样可以适用于所有的数据类型。举个例子，以下使用方式会告诉 GCC 把 parrot_height 按其使用最大值进行对齐，很可能是按照 double 类型进行对齐
```c
short parrot_height __attribute__((aligned)) = 5;
```
这种解决方案通常是对空间/时间的权衡：以这种方式进行对齐的变量会消耗更多的空间，但是对这些数据进行拷贝（以及其他复杂操作）很可能会更快，因为编译器可以发送处理大量内存的机器指令。

计算机体系结构或系统工具链的方方面面可能会对变量对齐有最大值限制。举个例子，在某些 Linux 体系结构中，链接器无法识别超出一个很小的默认区间的对齐。在这种情况下，通过关键字提供的对齐方式就变成允许的对齐值的最小值。举个例子，假设你希望按照 32 字节进行对齐，但是系统的链接器最多只能按 8 个字节进行对齐，那么变量就会按照 8 字节进行对齐。
## 把全局变量放到寄存器中
GCC 支持编程人员把全局变量放到某个计算机寄存器中，在程序执行期间，变量就会在寄存器中。GCC 称这类变量为“全局寄存器变量”该语法要求编程人员指定计算机寄存器。以下示例会使用 ebx
```c
register int *foo asm("ebx");
```
编程人员必须选择一个变量，在函数中一直可用:也就是说，选中的变量必须也可以用于局部函数，在函数调用时保存和恢复，不是为了体系结构或操作系统 ABI 的特定目标而指定的。如果选中的寄存器不正确，编译器会生成一条告警信息。如果寄存器是正确的，比如这个示例中的 ebx，可以用于 x86 体系结构，编译器自己会停止使用寄存器

如果频繁使用变量，这种优化可以带来极大的性能提升。一个好的示例是使用虚拟机。把变量保存到寄存器的虚拟栈指针中可能会带来一些收益。另一方面，如果体系结构没有足够的寄存器（正如 x86 那样），这种优化方式就没什么意义。

全局寄存器变量不能用于信号处理器中，也不能用于多个执行线程中。它们也没有初始值，因为可执行文件无法为寄存器提供默认内容。全局寄存器变量声明应该在所有函数定义之前。
## 分支标注
GCC 支持编程人员对表达式的期望值进行标注（annotate），举个例子，告诉编译器某个条件语句是真的还是假的。GCC 可以执行块重新排序和其他优化措施，从而优化条件分支的性能。 GCC 对分支标注的语法支持非常糟糕。为了使分支标注看起来更简单，我们使用预处理器宏
```c
#define likely(x) __builtin_expect(!!(x), 1)
#define unlikely(x) __builtin_expect(!!(x), 0)
```
编程人员可以通过把表达式分别封装到 likely() 和 unlikely() 中，标识表达式很可能为真，或不太可能为真。

以下示例把分支标识成不太可能为真（也就是说，很可能为假）
```c
int ret;
ret = close(fd);
if(unlikely(ret))
    perror("close");
```
相反，以下示例把分支标识为很可能为真
```c
const char *home;

home = getenv("HOME");
if(likely(home))
    printf("Your name directory is %s\n", home);
else
    fprintf(stderr, "Environment variable HOME not set!\n");
```
在内联函数中，编程人员往往会过多使用分支标注。一旦开始使用表达式，可能会倾向于标识“所有的”表达式。但是,要注意的是,只有当你知道“前提条件（priori）”而且确定表达式几乎在任何情况下（比如 99%）是真的，才可以把分支标识为很可能或基本不可能。有些错误适用于 unlikely()。要记住的是，错误的预测还远远不如没有预测。
## 获取表达式类型
GCC 提供了 typeof() 关键字，可以获取给定表达式的类型。从语义上看，该关键字的工作方式和 sizeof() 类似。比如，以下表达式返回 x 指向的对象的类型
```c
typeof(*x)
```
可以通过以下表达式声明数组 y 也是这种类型
```c
typeof(*x) y[42];
```
typeof() 的常见使用方式是编写“安全”的宏，可以在任意数值上操作，而且只需要对参数判断一次
```c
#define max(a, b) ({       \
	typeof(a) _a = (a);    \
	typeof(b) _b = (b);    \
	_a > _b ? _a : _b;	   \
})
```
## 获取类型的对齐方式
GCC 提供了关键字 alignof 来获取给定对象的对齐方式。其值是架构和 ABI 特有的。如果当前架构并没有需要的对齐方式，关键字会返回 ABI 推荐的对齐方式。否则关键字会返回最小的对齐值。

其语法和 sizeof() 完全相同
```c
__alignof__(int)
```
其返回值依赖于体系架构，很可能会返回 4，因为 32 位的整数通常是 4 个字节。

**C11 和 C++11 中的 alignof()**：C11 和 C++11 引入了 alignof()，其工作方式和 alignof() 完全相同，但对它进行了标准化。如果编写 C11 或 C++ 11 代码，建议使用  alignof()

该关键字也是作用于左值。也就是说,返回的对齐值是所支持类型的最小对齐方式，而不是某个左值的真正对齐方式。如果通过 aligned 属性改变最小对齐方式，变化是通过 alignof 来表示。举个例子，对于以下结构体
```c
struct ship {
    int year_built;
    char cannons;
    int mast_height;
};
```
和以下代码片段
```c
struct ship my_ship;

printf("%d\n", __alignof__(my_ship.cannons));
```
该代码片段中的 alignof 会返回 1，虽然结构体对齐填充可能会导致字符 cannons 占用 4 个字节。
## 结构体中成员变量的偏移
GCC 提供内置的关键字，可以获取该结构体内的成员变量的偏移。文件 <stddef.h> 中定义的宏 offsetof()，是 ISO C 标准的一部分。绝大多数定义很糟糕，涉及粗俗的指针算式算法，不适用于其他少数情况。GCC 扩展更简单，而且往往更快
```c
#define offsetof(type, member) __builtin_offsetof(type, member);
```
该调用会返回 type 类型的 member 变量的偏移，也就是说，从零开始，从结构体的起始地址到该变量地址之间的字节数。举个例子，对于以下结构体
```c
struct rowboat {
    char *boat_name;
    unsigned int nr_oars;
    short length;
};
```
实际偏移取决于变量大小和体系结构的对齐和填充行为。在 32 位计算机上，如果在结构体rowboat 上调用 offsetof() 函数，变量 boat_name、nr_oars 和 length 会分别返回 0、4 和 8。

在 Linux 系统中，offsetof() 宏应该通过 GCC 关键字来定义，而且不需要重新定义。
## 获取函数的返回地址
GCC 提供了一个关键字，可以获取当前函数的返回值，或者当前函数的某个调用
```c
void * __builtin_return_address(unsigned int level)
```
参数 level 指定调用链中的返回值函数。如果 level 值为 0，表示返回当前函数的地址，如果 level 值为 1，表示返回当前函数的调用方地址，如果 level 值为 2，表示该函数调用方的返回地址等等。

如果当前函数是个内联函数，返回的地址是调用函数的地址。如果不想使用这种方式，就使用关键字 noinline，强制编译器不要对函数进行内联。

关键字`__builtin_return_address` 有几个用途。一种是出于调试或信息目的，另一种是展开调用链，实现代码自检、导出代码崩溃信息、调试器等等。

注意，有些体系结构只能返回调用函数的地址。在这种体系结构上，非 0 参数值会生成随机返回值。因此，除了 0 之外的任何值都是不可移植的，只能用于调试目的。
## 条件范围
GCC 支持条件（case）语句表达式标签，可以为单个块指定值的范围。常见的语法如下
```c
case low ... high:
```
举个例子
```c
switch(val) {
    case 1 ... 10:
        /* ... */
        break;
    case 11 ... 20:
        /* ... */
        break;
    default:
        /* ... */
}
```
这个功能对于 ASCII 条件范围也非常有用
```c
case 'A' ... 'Z':
```
注意，在省略号前后都应该有个空格。否则，编译器就会感到困惑，尤其对于整数值。因此，条件语句应该如下
```c
case 4 ... 8:
```
不应该这样
```c
case 4...8:
```
## 空指针和函数指针
在 GCC 中，加减操作是作用于 void 类型和指向函数的指针。一般而言，ISO C 不允许在这些指针上执行算术操作，因为 “void” 大小是没有意义的，而且依赖于指针真正指向哪里。为了支持这种算术操作，GCC 把引用对象作为单个字节。因此，以下代码会对 a 递增 1
```c
a++;    // a is a void pointer
```
当使用这些扩展时，编译选项 -Wpointer-arith 会触发 GCC 生成一条告警信息。
## ”一箭双雕“可移植且代码优美
必须承认的是，attribute 语法不太美观。下面所探讨的一些扩展为了可读性需要通过预处理器宏来实现，但是这些扩展都可以在某种程度上更优雅一些。

预处理器使得这一切变得简单。此外，在相同的操作中，可以通过在非 GCC 编译器（不管是什么）的环境下定义，使得 GCC 扩展可以移植。

为了实现这一点，在头文件中包含下列代码片段，在源文件中包含该头文件
```c
#if __GNUC__ >= 3
#undef inline
#define inline inline __attribute__((always_inline))
#define __noinline __attribute__((noinline))
#define __pure __attribute__((pure))
#define __const __attribute__((const))
#define __noreturn __attribute__((noreturn))
#define __malloc __attribute__((malloc))
#define __must_check __attribute__((warn_unused_result))
#define __deprecated __attribute__((deprecated))
#define __used __attribute__((used))
#define __unused __attribute__((ununsed))
#define __packed __attribute__((packed))
#define __align(x) __attribute__((aligned(x)))
#define __align_max __attribute__((aligned))
#define likely(x) __builtin_expect(!!(x), 1)
#define unlikely(x) __builtin_expect(!!(x), 0)
#else
#define __noinline          // no noinline
#define __pure          // no pure
#define __const          // no const
#define __noreturn          // no noreturn
#define __malloc          // no malloc
#define __must_check          // no warn_unused_result
#define __deprecated          // no deprecated
#define __used          // no used
#define __unused          // no unused
#define __packed          // no packed
#define __align(x)          // no aligned
#define __align_max          // no align_max
#define likely(x)    (x)
#define unlikely(x)   (x)
#endif
```
举个例子，通过以下方式可以标识函数为纯函数，这种方式很简洁
```c
__pure int foo(void){/* ... */}
```
如果使用 GCC，该函数会标识为 pure 属性。如果 GCC 不是编译器，预处理器会把`__pure` 项替换成 no-op。注意，一个定义可以包含多个属性，因而可以很方便地在单个函数中使用多个定义。

更简单，更优雅，而且可移植性更好







