# 基本语法规则

任何语言的核心所描述的都是这门语言在最基本的层面上如何工作，涉及语法、操作符、数据类型以及内置功能，在此基础之上才可以构建复杂的解决方案。ECMA-262 以一个名为 ECMAScript 的伪语言的形式，定义了 JavaScript 的所有这些方面。 

ECMA-262 第 5 版（ES5）定义的 ECMAScript，是目前为止实现得最为广泛（即受浏览器支持最好）的一个版本。第 6 版（ES6）在浏览器中的实现（即受支持）程度次之。到 2017 年底，大多数主流浏览器几乎或全部实现了这一版的规范。

ECMAScript 的语法很大程度上借鉴了 C 语言和其他类 C 语言，如 Java 和 Perl。
## 概念与规则
ECMAScript 中一切都区分大小写。无论是变量、函数名还是操作符，都区分大小写。换句话说，变量 test 和变量 Test 是两个不同的变量。类似地，typeof 不能作为函数名，因为它是一个关键字。但 Typeof是一个完全有效的函数名。 

**标识符**：所谓标识符，就是变量、函数、属性或函数参数的名称。标识符可以由一或多个下列字符组成
- 第一个字符必须是一个字母、下划线（`_`）或美元符号（`$`）； 
- 剩下的其他字符可以是字母、下划线、美元符号或数字。
	
标识符中的字母可以是扩展 ASCII（Extended ASCII）中的字母，也可以是 Unicode 的字母字符，但不推荐使用

按照惯例，ECMAScript 标识符使用驼峰大小写形式，即第一个单词的首字母小写，后面每个单词的首字母大写。虽然这种写法并不是强制性的，但因为这种形式跟 ECMAScript 内置函数和对象的命名方式一致，所以算是最佳实践。

关键字、保留字、true、false和 null不能作为标识符

**注释**：ECMAScript 采用 C 语言风格的注释，包括单行注释和块注释。单行注释以两个斜杠字符开头；块注释以一个斜杠和一个星号（`/*`）开头，以它们的反向组合（`*/`）结尾

**严格模式**：ECMAScript 5 增加了严格模式（strict mode）的概念。严格模式是一种不同的 JavaScript 解析和执行模型，ECMAScript 3 的一些不规范写法在这种模式下会被处理，对于不安全的活动将抛出错误。要对整个脚本启用严格模式，在脚本开头加上这一行
```javascript
"use strict"; 
```
虽然看起来像个没有赋值给任何变量的字符串，但它其实是一个预处理指令。任何支持的 JavaScript 引擎看到它都会切换到严格模式。选择这种语法形式的目的是不破坏 ECMAScript 3 语法。 
也可以单独指定一个函数在严格模式下执行，只要把这个预处理指令放到函数体开头即可

严格模式会影响 JavaScript 执行的很多方面，因此本书在用到它时会明确指出来。所有现代浏览器都支持严格模式。 

**语句**：ECMAScript 中的语句以分号结尾。省略分号意味着由解析器确定语句在哪里结尾

即使语句末尾的分号不是必需的，也应该加上。记着加分号有助于防止省略造成的问题，比如可以避免输入内容不完整。此外，加分号也便于开发者通过删除空行来压缩代码（如果没有结尾的分号，只删除空行，则会导致语法错误）。加分号也有助于在某些情况下提升性能，因为解析器会尝试在合适的位置补上分号以纠正语法错误。 

多条语句可以合并到一个 C 语言风格的代码块中。代码块由一个左花括号（{）标识开始，一个右花括号（}）标识结束

if 之类的控制语句只在执行多条语句时要求必须有代码块。不过，最佳实践是始终在控制语句中使用代码块，即使要执行的只有一条语句

在控制语句中使用代码块可以让内容更清晰，在需要修改代码时也可以减少出错的可能性。

## 关键字与保留字

ECMA-262 描述了一组保留的关键字，这些关键字有特殊用途，比如表示控制语句的开始和结束，或者执行特定的操作。按照规定，保留的关键字不能用作标识符或属性名。ECMA-262 第 6 版规定的所有关键字如下
```
break       do          in            typeof 
case        else        instanceof    var 
catch       export      new           void 
class       extends     return        while 
const       finally     super         with 
continue    for         switch        yield 
debugger    function    this 
default     if          throw 
delete      import      try
```

规范中也描述了一组未来的保留字，同样不能用作标识符或属性名。虽然保留字在语言中没有特定用途，但它们是保留给将来做关键字用的。以下是 ECMA-262 第 6 版为将来保留的所有词汇。
```
始终保留: 
enum  
 
 
严格模式下保留: 
implements  package     public 
interface   protected   static 
let         private 
 
 
模块代码中保留: 
await 
```
这些词汇不能用作标识符，但现在还可以用作对象的属性名。一般来说，最好还是不要使用关键字和保留字作为标识符和属性名，以确保兼容过去和未来的 ECMAScript 版本。 

# 变量与数据类型
## 变量
ECMAScript 变量是松散类型的，意思是变量可以用于保存任何类型的数据。每个变量只不过是一个用于保存任意值的命名占位符。有 3 个关键字可以声明变量：var、const 和 let。其中，var 在 ECMAScript 的所有版本中都可以使用，而 const 和 let只能在 ECMAScript 6 及更晚的版本中使用。 
### var
要定义变量，可以使用 var 操作符，后跟变量名。不初始化的情况下，变量会保存一个特殊值 undefined。ECMAScript 实现变量初始化，因此可以同时定义变量并设置它的值
```js
var message1; // 定义变量
var message2 = "hi"; // 同时定义变量并设置值
```
随后，不仅可以改变保存的值，也可以改变值的类型，虽然不推荐改变变量保存值的类型
#### var 声明作用域
使用 var 操作符定义的变量会成为包含它的函数的局部变量。比如，使用 var 在一个函数内部定义一个变量，就意味着该变量将在函数退出时被销毁。然而，在函数内定义变量时省略 var操作符，可以创建一个全局变量

虽然可以通过省略 var操作符定义全局变量，但不推荐这么做。在局部作用域中定义的全局变量很难维护，也会造成困惑。这是因为不能一下子断定省略 var是不是有意而为之。在严格模式下，如果像这样给未声明的变量赋值，则会导致抛出 ReferenceError。

如果需要定义多个变量，可以在一条语句中用逗号分隔每个变量（及可选的初始化）。在严格模式下，不能定义名为 eval和 arguments的变量，否则会导致语法错误。 
#### var 声明提升
使用 var 关键字声明的变量会自动提升到函数作用域顶部
```js
function foo() {  
  console.log(age); 
  var age = 26; 
} 
foo();  // undefined 
```

之所以不会报错，是因为 ECMAScript 运行时把它看成等价于如下代码
```js
function foo() { 
  var age; 
  console.log(age); 
  age = 26; 
} 
foo();  // undefined 
```
这就是所谓的“提升”（hoist），也就是把所有变量声明都拉到函数作用域的顶部。此外，反复多次使用 var 声明同一个变量也没有问题
```js
function foo() { 
  var age = 16; 
  var age = 26; 
  var age = 36; 
  console.log(age); 
} 
foo();  // 36 
```
### let

let 跟 var 的作用差不多，但有着非常重要的区别。最明显的区别是，let 声明的范围是块作用域，而 var声明的范围是函数作用域。 
```js
if (true) { 
  var name = 'Matt'; 
  console.log(name); // Matt 
} 
console.log(name);   // Matt

if (true) { 
  let age = 26; 
  console.log(age);   // 26 
} 
console.log(age); // ReferenceError: age 没有定义 
```
在这里，age 变量之所以不能在 if 块外部被引用，是因为它的作用域仅限于该块内部。块作用域是函数作用域的子集，因此适用于 var 的作用域限制同样也适用于 let。 

let 也不允许同一个块作用域中出现冗余声明。这样会导致报错。当然，JavaScript 引擎会记录用于变量声明的标识符及其所在的块作用域，因此嵌套使用相同的标识符不会报错，而这是因为同一个块中没有重复声明

对声明冗余报错不会因混用 let 和 var 而受影响。这两个关键字声明的并不是不同类型的变量，它们只是指出变量在相关作用域如何存在
#### 暂时性死区
let 与 var 的另一个重要的区别，就是 let 声明的变量不会在作用域中被提升。 在解析代码时，JavaScript 引擎也会注意出现在块后面的 let 声明，只不过在此之前不能以任何方式来引用未声明的变量。在 let 声明之前的执行瞬间被称为“暂时性死区”（temporal dead zone），在此阶段引用任何后面才声明的变量都会抛出 ReferenceError。 
#### 全局声明

与 var 关键字不同，使用 let 在全局作用域中声明的变量不会成为 window 对象的属性（var 声明的变量则会）。 
下面的代码请在浏览器中执行
```js
var name = 'Matt'; 
window.name; // 'Matt' 
 
let age = 26; 
window.age;  // undefined 
```
不过，let 声明仍然是在全局作用域中发生的，相应变量会在页面的生命周期内存续。因此，为了避免 SyntaxError，必须确保页面不会重复声明同一个变量。 
#### 条件声明
在使用 var 声明变量时，由于声明会被提升，JavaScript 引擎会自动将多余的声明在作用域顶部合并为一个声明。因为 let 的作用域是块，所以不可能检查前面是否已经使用 let 声明过同名变量，同时也就不可能在没有声明的情况下声明它。 
```html
<script>  
  var name = 'Nicholas'; 
  let age = 26; 
</script> 
 
<script> 
  // 假设脚本不确定页面中是否已经声明了同名变量 
  // 那它可以假设还没有声明过 
 
  var name = 'Matt'; 
  // 这里没问题，因为可以被作为一个提升声明来处理 
  // 不需要检查之前是否声明过同名变量 
 
  let age = 36; 
 // 如果 age之前声明过，这里会报错 
</script> 
```
使用 try/catch 语句或 typeof 操作符也不能解决，因为条件块中 let声明的作用域仅限于该块。
```html
<script> 
  let name = 'Nicholas'; 
  let age = 36; 
</script> 
 
<script> 
  // 假设脚本不确定页面中是否已经声明了同名变量 
  // 那它可以假设还没有声明过 
 
  if (typeof name === 'undefined') { 
    let name; 
  } 
 // name 被限制在 if {} 块的作用域内 
  // 因此这个赋值形同全局赋值 
  name = 'Matt'; 
 
  try { 
 console.log(age); // 如果 age没有声明过，则会报错 
  } 
  catch(error) { 
    let age; 
} 
 // age 被限制在 catch {}块的作用域内 
  // 因此这个赋值形同全局赋值 
  age = 26; 
</script> 
```
为此，对于 let 这个新的 ES6 声明关键字，不能依赖条件声明模式。不能使用 let 进行条件式声明是件好事，因为条件声明是一种反模式，它让程序变得更难理解。如果你发现自己在使用这个模式，那一定有更好的替代方式。 
#### for 循环中的 let 声明

在 let 出现之前，for循环定义的迭代变量会渗透到循环体外部
```js
for (var i = 0; i < 5; ++i) { 
  // 循环逻辑  
} 
console.log(i); // 5
```
改成使用 let 之后，这个问题就消失了，因为迭代变量的作用域仅限于 for 循环块内部
```js
for (let i = 0; i < 5; ++i) { 
  // 循环逻辑 
} 
console.log(i); // ReferenceError: i 没有定义 
```
在使用 var 的时候，最常见的问题就是对迭代变量的奇特声明和修改
```js
for (var i = 0; i < 5; ++i) { 
    setTimeout(() => console.log(i), 0) 
} 
// 你可能以为会输出 0、1、2、3、4 
// 实际上会输出 5、5、5、5、5 
```
之所以会这样，是因为在退出循环时，迭代变量保存的是导致循环退出的值：5。在之后执行超时逻辑时，所有的 i都是同一个变量，因而输出的都是同一个最终值。 

而在使用 let 声明迭代变量时，JavaScript 引擎在后台会为每个迭代循环声明一个新的迭代变量。每个 setTimeout引用的都是不同的变量实例，所以 console.log输出的是我们期望的值，也就是循环执行过程中每个迭代变量的值。 
```js
for (let i = 0; i < 5; ++i) { 
    setTimeout(() => console.log(i), 0) 
} 
// 会输出 0、1、2、3、4
```
这种每次迭代声明一个独立变量实例的行为适用于所有风格的 for循环，包括 for-in和 for-of 循环。 
### const声明
const 的行为与 let 基本相同，唯一一个重要的区别是用它声明变量时必须同时初始化变量，且尝试修改 const声明的变量会导致运行时错误。 
```js
const age = 26; 
age = 36; // TypeError: 给常量赋值

// const 也不允许重复声明 
const name = 'Matt'; 
const name = 'Nicholas'; // SyntaxError 
 
// const 声明的作用域也是块 
const name = 'Matt'; 
if (true) {  
  const name = 'Nicholas'; 
} 
console.log(name); // Matt 
```

const 声明的限制只适用于它指向的变量的引用。换句话说，如果 const变量引用的是一个对象，那么修改这个对象内部的属性并不违反 const的限制。 

JavaScript 引擎会为 for 循环中的 let 声明分别创建独立的变量实例，虽然 const 变量跟 let 变量很相似，但是不能用 const来声明迭代变量（因为迭代变量会自增）

不过，如果你只想用 const 声明一个不会被修改的 for 循环变量，那也是可以的。也就是说，每次迭代只是创建一个新变量。这对 for-of和 for-in 循环特别有意义
```js
let i = 0;  
for (const j = 7; i < 5; ++i) { 
  console.log(j); 
} 
// 7, 7, 7, 7, 7 
 
for (const key in {a: 1, b: 2}) { 
  console.log(key); 
} 
// a, b 
 
for (const value of [1,2,3,4,5]) { 
  console.log(value); 
} 
// 1, 2, 3, 4, 5 
```
### 声明风格及最佳实践
ECMAScript 6 增加 let和 const从客观上为这门语言更精确地声明作用域和语义提供了更好的支持。行为怪异的 var所造成的各种问题，已经让 JavaScript 社区为之苦恼了很多年。随着这两个新关键字的出现，新的有助于提升代码质量的最佳实践也逐渐显现。 
- **不使用 var**：限制自己只使用 let 和 const 有助于提升代码质量，因为变量有了明确的作用域、声明位置，以及不变的值。 
- **const优先，let 次之**：使用 const 声明可以让浏览器运行时强制保持变量不变，也可以让静态代码分析工具提前发现不合法的赋值操作。因此，很多开发者认为应该优先使用 const 来声明变量，只在提前知道未来会有修改时，再使用 let。这样可以让开发者更有信心地推断某些变量的值永远不会变，同时也能迅速发现因意外赋值导致的非预期行为。

## 数据类型

ECMAScript 有 6 种简单数据类型（也称为原始类型）：Undefined、Null、Boolean、Number、String 和 Symbol。Symbol（符号）是 ECMAScript 6 新增的。还有一种复杂数据类型叫 Object（对象）。Object 是一种无序名值对的集合。因为在 ECMAScript 中不能定义自己的数据类型，所有值都可以用上述 7 种数据类型之一来表示。只有 7 种数据类型似乎不足以表示全部数据。但 ECMAScript 的数据类型很灵活，一种数据类型可以当作多种数据类型来使用。 
### typeof 操作符
因为 ECMAScript 的类型系统是松散的，所以需要一种手段来确定任意变量的数据类型。typeof 操作符就是为此而生的。对一个值使用 typeof 操作符会返回下列字符串之一
- "undefined" 表示值未定义； 
- "boolean" 表示值为布尔值； 
- "string" 表示值为字符串； 
- "number" 表示值为数值； 
- "object" 表示值为对象（而不是函数）或 null； 
- "function" 表示值为函数； 
- "symbol" 表示值为符号。
typeof 是一个操作符而不是函数，所以不需要参数（但可以使用参数）。 

注意 typeof在某些情况下返回的结果可能会让人费解，但技术上讲还是正确的。比如，调用 typeof null 返回的是"object"。这是因为特殊值 null 被认为是一个对空对象的引用。 

严格来讲，函数在 ECMAScript 中被认为是对象，并不代表一种数据类型。可是，函数也有自己特殊的属性。为此，就有必要通过 typeof操作符来区分函数和其他对象。
### Undefined类型
Undefined 类型只有一个值，就是特殊值 undefined。当使用 var 或 let 声明了变量但没有初始化时，就相当于给变量赋予了 undefined 值
```js
let message; 
console.log(message == undefined); // true
```
默认情况下，任何未经初始化的变量都会取得 undefined值。 

一般来说，永远不用显式地给某个变量设置 undefined 值。字面值 undefined 主要用于比较，而且在 ECMA-262 第 3 版之前是不存在的。增加这个特殊值的目的就是为了正式明确空对象指针（null）和未初始化变量的区别。

包含 undefined值的变量跟未定义变量是有区别的
```js
let message; // 这个变量被声明了，只是值为 undefined 
 
// 确保没有声明过这个变量 
// let age 
 
console.log(message); // "undefined" 
console.log(age);     // 报错 
```
对未声明的变量，只能执行一个有用的操作，就是对它调用 typeof。（对未声明的变量调用 delete 也不会报错，但这个操作没什么用，实际上在严格模式下会抛出错误。） 
```js
console.log(typeof l)
```
在对未初始化的变量调用 typeof时，返回的结果是"undefined"，但对未声明的变量调用它时，返回的结果还是"undefined"。逻辑上讲这是对的，因为虽然严格来讲这两个变量存在根本性差异，但它们都无法执行实际操作。 

即使未初始化的变量会被自动赋予 undefined 值，但仍然建议在声明变量的同时进行初始化。这样，当 typeof 返回"undefined"时，你就会知道那是因为给定的变量尚未声明，而不是声明了但未初始化

undefined 是一个假值。因此，如果需要，可以用更简洁的方式检测它。不过要记住，也有很多其他可能的值同样是假值。所以一定要明确自己想检测的就是 undefined 这个字面值，而不仅仅是假值。 
### Null 类型

Null 类型同样只有一个值，即特殊值 null。逻辑上讲，null 值表示一个空对象指针，这也是给 typeof 传一个 null 会返回"object"的原因

在定义将来要保存对象值的变量时，建议使用 null来初始化，不要使用其他值。这样，只要检查这个变量的值是不是 null 就可以知道这个变量是否在后来被重新赋予了一个对象的引用

undefined 值是由 null 值派生而来的，因此 ECMA-262 将它们定义为表面上相等
```js
console.log(null == undefined);  // true 
```
用等于操作符（`==`）比较 null 和 undefined 始终返回 true。但要注意，这个操作符会为了比较而转换它的操作数

即使 null 和 undefined 有关系，它们的用途也是完全不一样的。如前所述，永远不必显式地将变量值设置为 undefined。但 null 不是这样的。任何时候，只要变量要保存对象，而当时又没有那个对象可保存，就要用 null 来填充该变量。这样就可以保持 null 是空对象指针的语义，并进一步将其与 undefined区分开来。 

null 是一个假值。因此，如果需要，可以用更简洁的方式检测它。不过要记住，也有很多其他可能的值同样是假值。所以一定要明确自己想检测的就是 null 这个字面值，而不仅仅是假值。
### Boolean 类型
Boolean（布尔值）类型是 ECMAScript 中使用最频繁的类型之一，有两个字面值：true和 false。这两个布尔值不同于数值，因此 true 不等于 1，false不等于 0

虽然布尔值只有两个，但所有其他 ECMAScript 类型的值都有相应布尔值的等价形式。要将一个其他类型的值转换为布尔值，可以调用特定的 Boolean()转型函数

Boolean()转型函数可以在任意类型的数据上调用，而且始终返回一个布尔值。什么值能转换为 true 或 false的规则取决于数据类型和实际的值。下表总结了不同类型与布尔值之间的转换规则。 
**表：不同类型与布尔值之间的转换规则**

| 数据类型      | 转换为 true    | 转换为 false |
| --------- | ----------- | --------- |
| Boolean   | true        | false     |
| String    | 非空字符串       | 空字符串      |
| Number    | 非零数值（包括无穷值） | 0、NaN     |
| Object    | 任意对象        | null      |
| Undefined | N/A（不存在）    | undefined |
理解以上转换非常重要，因为像 if 等流控制语句会自动执行其他类型值到布尔值的转换
### Number 类型
Number 类型使用 IEEE 754 格式表示整数和浮点值（在某些语言中也叫双精度值）。不同的数值类型相应地也有不同的数值字面量格式。

最基本的数值字面量格式是十进制整数，整数也可以用八进制（以 8 为基数）或十六进制（以 16 为基数）字面量表示。对于八进制字面量，第一个数字必须是零（0），然后是相应的八进制数字（数值 0~7）。如果字面量中包含的数字超出了应有的范围，就会忽略前缀的零，后面的数字序列会被当成十进制数

八进制字面量在严格模式下是无效的，会导致 JavaScript 引擎抛出语法错误。ECMAScript 2015 或 ES6 中的八进制值通过前缀 0o 来表示；严格模式下，前缀 0 会被视为语法错误，如果要表示八进制值，应该使用前缀 0o。

要创建十六进制字面量，必须让真正的数值前缀 0x（区分大小写），然后是十六进制数字（0~9 以及 A~F）。十六进制数字中的字母大小写均可。

使用八进制和十六进制格式创建的数值在所有数学操作中都被视为十进制数值。由于 JavaScript 保存数值的方式，实际中可能存在正零（+0）和负零（0）。正零和负零在所有情况下都被认为是等同的
#### 浮点值
要定义浮点值，数值中必须包含小数点，而且小数点后面必须至少有一个数字。虽然小数点前面不是必须有整数，但推荐加上。

因为存储浮点值使用的内存空间是存储整数值的两倍，所以 ECMAScript 总是想方设法把值转换为整数。在小数点后面没有数字的情况下，数值就会变成整数。类似地，如果数值本身就是整数，只是小数点后面跟着 0（如 1.0），那它也会被转换为整数

对于非常大或非常小的数值，浮点值可以用科学记数法来表示。科学记数法用于表示一个应该乘以 10 的给定次幂的数值。ECMAScript 中科学记数法的格式要求是一个数值（整数或浮点数）后跟一个大写或小写的字母 e，再加上一个要乘的 10 的多少次幂。

科学记数法也可以用于表示非常小的数值，例如 0.000 000 000 000 000 03。这个数值用科学记数法可以表示为 3e17。默认情况下，ECMAScript 会将小数点后至少包含 6 个零的浮点值转换为科学记数法（例如，0.000 000 3 会被转换为 3e-7）。

浮点值的精确度最高可达 17 位小数，但在算术计算中远不如整数精确。例如，0.1 加 0.2 得到的不是 0.3，而是 0.300 000 000 000 000 04。由于这种微小的舍入错误，导致很难测试特定的浮点值。
```js
if (a + b == 0.3) {      // 别这么干！   
  console.log("You got 0.3."); 
} 
```
之所以存在这种舍入错误，是因为使用了 IEEE 754 数值，这种错误并非 ECMAScript 所独有。其他使用相同格式的语言也有这个问题。
#### 值的范围
由于内存的限制，ECMAScript 并不支持表示这个世界上的所有数值。ECMAScript 可以表示的最小数值保存在 Number.MIN_VALUE 中，这个值在多数浏览器中是 5e-324；可以表示的最大数值保存在 Number.MAX_VALUE 中，这个值在多数浏览器中是 1.797 693 134 862 315 7e+308。如果某个计算得到的数值结果超出了 JavaScript 可以表示的范围，那么这个数值会被自动转换为一个特殊的 Infinity（无穷）值。任何无法表示的负数以-Infinity（负无穷大）表示，任何无法表示的正数以 Infinity（正无穷大）表示。 

如果计算返回正 Infinity 或负 Infinity，则该值将不能再进一步用于任何计算。这是因为 Infinity 没有可用于计算的数值表示形式。要确定一个值是不是有限大（即介于 JavaScript 能表示的最小值和最大值之间），可以使用 isFinite()函数
```js
let result = Number.MAX_VALUE + Number.MAX_VALUE; 
console.log(isFinite(result));  // false 
```
虽然超出有限数值范围的计算并不多见，但总归还是有可能的。因此在计算非常大或非常小的数值时，有必要监测一下计算结果是否超出范围。 

使用 Number.NEGATIVE_INFINITY 和 Number.POSITIVE_INFINITY 也可以获取正、负 Infinity。没错，这两个属性包含的值分别就是-Infinity和 Infinity。
#### NaN
有一个特殊的数值叫 NaN，意思是“不是数值”（Not a Number），用于表示本来要返回数值的操作失败了（而不是抛出错误）。比如，用 0 除任意数值在其他语言中通常都会导致错误，从而中止代码执行。但在 ECMAScript 中，0、+0 或0 相除会返回 NaN

如果分子是非 0 值，分母是有符号 0 或无符号 0，则会返回 Infinity 或-Infinity

NaN 有几个独特的属性。首先，任何涉及 NaN的操作始终返回 NaN（如 NaN/10），在连续多步计算时这可能是个问题。其次，NaN 不等于包括 NaN在内的任何值。

为此，ECMAScript 提供了 isNaN()函数。该函数接收一个参数，可以是任意数据类型，然后判断这个参数是否“不是数值”。把一个值传给 isNaN()后，该函数会尝试把它转换为数值。某些非数值的值可以直接转换成数值，如字符串"10"或布尔值。任何不能转换为数值的值都会导致这个函数返回 true。
```js
console.log(isNaN(NaN));     // true 
console.log(isNaN(10)); // false，10 是数值 
console.log(isNaN("10")); // false，可以转换为数值 10 
console.log(isNaN("blue"));  // true，不可以转换为数值 
console.log(isNaN(true)); // false，可以转换为数值 1
```

虽然不常见，但 isNaN()可以用于测试对象。此时，首先会调用对象的 valueOf() 方法，然后再确定返回的值是否可以转换为数值。如果不能，再调用 toString()方法，并测试其返回值。这通常是 ECMAScript 内置函数和操作符的工作方式
#### 数值转换
有 3 个函数可以将非数值转换为数值：Number()、parseInt()和 parseFloat()。Number()是转型函数，可用于任何数据类型。后两个函数主要用于将字符串转换为数值。对于同样的参数，这 3 个函数执行的操作也不同。 
#### Number() 函数
Number()函数基于如下规则执行转换
- 布尔值，true转换为 1，false转换为 0。 
- 数值，直接返回。 
- null，返回 0。 
- undefined，返回 NaN。 
- 字符串，应用以下规则。 
	- 如果字符串包含数值字符，包括数值字符前面带加、减号的情况，则转换为一个十进制数值。
	```js
	console.log(Number("1"));
	console.log(Number("123"));
	console.log(Number("011"));
	```
	- 如果字符串包含有效的浮点值格式如"1.1"，则会转换为相应的浮点值（同样，忽略前面的零）。
	- 如果字符串包含有效的十六进制格式如"0xf"，则会转换为与该十六进制值对应的十进制整数值。 
	- 如果是空字符串（不包含字符），则返回 0。
	- 如果字符串包含除上述情况之外的其他字符，则返回 NaN。 
- 对象，调用 valueOf()方法，并按照上述规则转换返回的值。如果转换结果是 NaN，则调用
toString()方法，再按照转换字符串的规则转换。 

```js
console.log(Number("Hello world!"));  // NaN 
console.log(Number(""));              // 0 
console.log(Number("000011"));        // 11 
console.log(Number(true));            // 1 
```

一元加操作符与 Number()函数遵循相同的转换规则。 
#### parseInt() 函数
考虑到用 Number()函数转换字符串时相对复杂且有点反常规，通常在需要得到整数时可以优先使用 parseInt()函数。parseInt()函数更专注于字符串是否包含数值模式。字符串最前面的空格会被忽略，从第一个非空格字符开始转换。如果第一个字符不是数值字符、加号或减号，parseInt()立即返回 NaN。这意味着空字符串也会返回 NaN（这一点跟 Number()不一样，它返回 0）。如果第一个字符是数值字符、加号或减号，则继续依次检测每个字符，直到字符串末尾，或碰到非数值字符。

假设字符串中的第一个字符是数值字符，parseInt()函数也能识别不同的整数格式（十进制、八进制、十六进制）。换句话说，如果字符串以"0x"开头，就会被解释为十六进制整数。如果字符串以"0"开头，且紧跟着数值字符，在非严格模式下会被某些实现解释为八进制整数。 
```js
console.log(parseInt("1234blue"));  // 1234
console.log(parseInt(""));            // NaN
console.log(parseInt("0xA"));       // 10，解释为十六进制整数 
console.log(parseInt("22.5"));     // 22 
console.log(parseInt("70"));        // 70，解释为十进制值 
console.log(parseInt("0xf"));       // 15，解释为十六进制整数 
```

不同的数值格式很容易混淆，因此 parseInt()也接收第二个参数，用于指定底数（进制数）。如果知道要解析的值是十六进制，那么可以传入 16 作为第二个参数，以便正确解析。事实上，如果提供了十六进制参数，那么字符串前面的"0x"可以省掉。通过第二个参数，可以极大扩展转换后获得的结果类型。因为不传底数参数相当于让 parseInt()自己决定如何解析，所以为避免解析出错，建议始终传给它第二个参数。 多数情况下解析的应该都是十进制数，此时第二个参数就要传入 10。 
#### parseFloat() 函数
parseFloat()函数的工作方式跟 parseInt()函数类似，都是从位置 0 开始检测每个字符。同样，它也是解析到字符串末尾或者解析到一个无效的浮点数值字符为止。这意味着第一次出现的小数点是有效的，但第二次出现的小数点就无效了，此时字符串的剩余字符都会被忽略。

parseFloat()函数的另一个不同之处在于，它始终忽略字符串开头的零。这个函数能识别前面讨论的所有浮点格式，以及十进制格式（开头的零始终被忽略）。十六进制数值始终会返回 0。因为parseFloat()只解析十进制值，因此不能指定底数。最后，如果字符串表示整数（没有小数点或者小数点后面只有一个零），则 parseFloat() 返回整数。
```js
console.log(parseFloat("1234blue"));  // 1234，按整数解析 
console.log(parseFloat("0xA"));  // 0
console.log(parseFloat("22.5"));  // 22.5
console.log(parseFloat("22.34.5"));  // 22.34
console.log(parseFloat("0908.5"));  // 908.5
console.log(parseFloat("3.125e7"));  // 31250000
```

### String 类型
String（字符串）数据类型表示零或多个 16 位 Unicode 字符序列。字符串可以使用双引号（"）、单引号（'）或反引号（\`）标示
```js
console.log("John");
console.log('Jacob');
console.log(`Jingleheimerschmidt`);
```
跟某些语言中使用不同的引号会改变对字符串的解释方式不同，ECMAScript 语法中表示字符串的引号没有区别。不过要注意的是，以某种引号作为字符串开头，必须仍然以该种引号作为字符串结尾。
#### 字符字面量
字符串数据类型包含一些字符字面量，用于表示非打印字符或有其他用途的字符

**表：转义字符**

| 字面量    | 含义                                                            |
| ------ | ------------------------------------------------------------- |
| \n     | 换行                                                            |
| \t     | 制表                                                            |
| \b     | 退格                                                            |
| \r     | 回车                                                            |
| \f     | 换页                                                            |
| \\     | 反斜杠                                                           |
| \\'    | 单引号                                                           |
| \\"    | 双引号                                                           |
| \\`    | 反引号                                                           |
| \xnn   | 以十六进制编码 nn表示的字符（其中 n是十六进制数字 0~F），例如\x41等于"A"                  |
| \unnnn | 以十六进制编码 nnnn表示的 Unicode 字符（其中 n是十六进制数字 0~F），例如\u03a3等于希腊字符"Σ" |
这些字符字面量可以出现在字符串中的任意位置，且可以作为单个字符被解释。字符串的长度可以通过其 length属性获取，这个属性返回字符串中 16 位字符的个数。如果字符串中包含双字节字符，那么 length属性返回的值可能不是准确的字符数。
```js
console.log("This is the letter sigma: \u03a3.".length);
```
#### 字符串的特点
ECMAScript 中的字符串是不可变的（immutable），意思是一旦创建，它们的值就不能变了。要修改某个变量中的字符串值，必须先销毁原始的字符串，然后将包含新值的另一个字符串保存到该变量
```js
let lang = "Java"; 
lang = lang + "Script";
```
这里，变量 lang一开始包含字符串"Java"。紧接着，lang被重新定义为包含"Java"和"Script" 的组合，也就是"JavaScript"。整个过程首先会分配一个足够容纳 10 个字符的空间，然后填充上 "Java"和"Script"。最后销毁原始的字符串"Java"和字符串"Script"，因为这两个字符串都没有用了。所有处理都是在后台发生的，而这也是一些早期的浏览器（如 Firefox 1.0 之前的版本和 IE6.0）在拼接字符串时非常慢的原因。这些浏览器在后来的版本中都有针对性地解决了这个问题。 
#### 转换为字符串
有两种方式把一个值转换为字符串。首先是使用几乎所有值都有的 toString()方法。这个方法唯一的用途就是返回当前值的字符串等价物。

toString()方法可见于数值、布尔值、对象和字符串值。（没错，字符串值也有 toString()方法，该方法只是简单地返回自身的一个副本。）null 和 undefined 值没有 toString()方法。 

多数情况下，toString()不接收任何参数。不过，在对数值调用这个方法时，toString()可以接收一个底数参数，即以什么底数来输出数值的字符串表示。默认情况下，toString()返回数值的十进制字符串表示。而通过传入参数，可以得到数值的二进制、八进制、十六进制，或者其他任何有效基数的字符串表示

如果你不确定一个值是不是 null 或 undefined，可以使用 String()转型函数，它始终会返回表示相应类型值的字符串。String()函数遵循如下规则。
- 如果值有 toString()方法，则调用该方法（不传参数）并返回结果。 
- 如果值是 null，返回"null"。 
- 如果值是 undefined，返回"undefined"。 

用加号操作符给一个值加上一个空字符串""也可以将其转换为字符串

#### 模板字面量
ECMAScript 6 新增了使用模板字面量定义字符串的能力。与使用单引号或双引号不同，模板字面量保留换行字符，可以跨行定义字符串
```js
let myMultiLineString = 'first line\nsecond line'; 
let myMultiLineTemplateLiteral = `first line 
second line`; 
 
console.log(myMultiLineString); 
// first line 
// second line" 
 
console.log(myMultiLineTemplateLiteral); 
// first line 
// second line 
 
console.log(myMultiLineString === myMultiLinetemplateLiteral); // true 
```

模板字面量在定义模板时特别有用，比如下面这个 HTML 模板
```js
let pageHTML = `  
<div> 
  <a href="#"> 
    <span>Jake</span> 
  </a> 
</div>`; 
```
由于模板字面量会保持反引号内部的空格，因此在使用时要格外注意。格式正确的模板字符串看起来可能会缩进不当
```js
// 这个模板字面量在换行符之后有 25个空格符 
let myTemplateLiteral = `first line  
                         second line`; 
console.log(myTemplateLiteral.length);  // 49
 
// 这个模板字面量以一个换行符开头 
let secondTemplateLiteral = ` 
first line 
second line`; 
console.log(secondTemplateLiteral[0] === '\n'); // true 
 
// 这个模板字面量没有意料之外的字符 
let thirdTemplateLiteral = `first line 
second line`; 
console.log(thirdTemplateLiteral); 
// first line 
// second line 
```
#### 字符串插值
模板字面量最常用的一个特性是支持字符串插值，也就是可以在一个连续定义中插入一个或多个值。技术上讲，模板字面量不是字符串，而是一种特殊的 JavaScript 句法表达式，只不过求值后得到的是字符串。模板字面量在定义时立即求值并转换为字符串实例，任何插入的变量也会从它们最接近的作用域中取值。 

字符串插值通过在`${}`中使用一个 JavaScript 表达式实现
```js
let value = 5;  
let exponent = 'second'; 
// 以前，字符串插值是这样实现的： 
let interpolatedString = 
  value + ' to the ' + exponent + ' power is ' + (value * value); 
 
// 现在，可以用模板字面量这样实现： 
let interpolatedTemplateLiteral = 
  `${ value } to the ${ exponent } power is ${ value * value }`; 
 
console.log(interpolatedString);           // 5 to the second power is 25 
console.log(interpolatedTemplateLiteral);  // 5 to the second power is 25 
```
所有插入的值都会使用 toString()强制转型为字符串，而且任何 JavaScript 表达式都可以用于插值。嵌套的模板字符串无须转义
```js
console.log(`Hello, ${ `World` }!`);  // Hello, World! 
```
将表达式转换为字符串时会调用 toString()。在插值表达式中可以调用函数和方法。此外，模板也可以插入自己之前的值
```js
function capitalize(word) {  
  return `${ word[0].toUpperCase() }${ word.slice(1) }`; 
} 
console.log(`${ capitalize('hello') }, ${ capitalize('world') }!`); // Hello, World! 

let value = ''; 
function append() { 
  value = `${value}abc` 
  console.log(value); 
} 
append();  // abc 
append();  // abcabc 
append();  // abcabcabc 
```

#### 模板字面量标签函数
模板字面量也支持定义标签函数（tag function），而通过标签函数可以自定义插值行为。标签函数会接收被插值记号分隔后的模板和对每个表达式求值的结果。

标签函数本身是一个常规函数，通过前缀到模板字面量来应用自定义行为，如下例所示。标签函数接收到的参数依次是原始字符串数组和对每个表达式求值的结果。这个函数的返回值是对模板字面量求值得到的字符串。 
```js
let a = 6; 
let b = 9;  
 
function simpleTag(strings, aValExpression, bValExpression, sumExpression) { 
  console.log(strings); 
  console.log(aValExpression); 
  console.log(bValExpression); 
  console.log(sumExpression); 
 
  return 'foobar'; 
} 
 
let untaggedResult = `${ a } + ${ b } = ${ a + b }`; 
let taggedResult = simpleTag`${ a } + ${ b } = ${ a + b }`; 
// ["", " + ", " = ", ""] 
// 6 
// 9 
// 15 
 
console.log(untaggedResult);   // "6 + 9 = 15" 
console.log(taggedResult);     // "foobar" 
```

因为表达式参数的数量是可变的，所以通常应该使用剩余操作符（rest operator）将它们收集到一个数组中
```js
let a = 6; 
let b = 9; 
 
function simpleTag(strings, ...expressions) { 
  console.log(strings);  
  for(const expression of expressions) { 
    console.log(expression); 
  } 
 
  return 'foobar'; 
} 
let taggedResult = simpleTag`${ a } + ${ b } = ${ a + b }`; 
// ["", " + ", " = ", ""] 
// 6 
// 9 
// 15 
 
console.log(taggedResult);  // "foobar" 
```

对于有 n 个插值的模板字面量，传给标签函数的表达式参数的个数始终是 n，而传给标签函数的第一个参数所包含的字符串个数则始终是 n+1。因此，如果你想把这些字符串和对表达式求值的结果拼接起来作为默认返回的字符串，可以这样做
```js
let a = 6;  
let b = 9; 
 
function zipTag(strings, ...expressions) { 
  return strings[0] + 
         expressions.map((e, i) => `${e}${strings[i + 1]}`) 
                    .join(''); 
} 
 
let untaggedResult =    `${ a } + ${ b } = ${ a + b }`; 
let taggedResult = zipTag`${ a } + ${ b } = ${ a + b }`; 
 
console.log(untaggedResult);  // "6 + 9 = 15" 
console.log(taggedResult);    // "6 + 9 = 15" 
```

#### 原始字符串
使用模板字面量也可以直接获取原始的模板字面量内容（如换行符或 Unicode 字符），而不是被转换后的字符表示。为此，可以使用默认的 String.raw标签函数
```js
// Unicode 示例 
// \u00A9 是版权符号 
console.log(`\u00A9`);            // © 
console.log(String.raw`\u00A9`);  // \u00A9 
 
// 换行符示例 
console.log(`first line\nsecond line`); 
// first line 
// second line 
 
console.log(String.raw`first line\nsecond line`); // "first line\nsecond line" 
 
// 对实际的换行符来说是不行的 
// 它们不会被转换成转义序列的形式 
console.log(`first line 
second line`); 
// first line 
// second line 
 
console.log(String.raw`first line 
second line`); 
// first line 
// second line 
```

另外，也可以通过标签函数的第一个参数，即字符串数组的.raw属性取得每个字符串的原始内容
```js
function printRaw(strings) {  
  console.log('Actual characters:'); 
  for (const string of strings) { 
    console.log(string); 
  } 
 
  console.log('Escaped characters;'); 
  for (const rawString of strings.raw) { 
    console.log(rawString); 
  } 
} 
 
printRaw`\u00A9${ 'and' }\n`; 
// Actual characters: 
// © 
//（换行符） 
// Escaped characters: 
// \u00A9 
// \n 
```
### Symbol 类型
Symbol（符号）是 ECMAScript 6 新增的数据类型。符号是原始值，且符号实例是唯一、不可变的。符号的用途是确保对象属性使用唯一标识符，不会发生属性冲突的危险。 

尽管听起来跟私有属性有点类似，但符号并不是为了提供私有属性的行为才增加的（尤其是因为 Object API 提供了方法，可以更方便地发现符号属性）。相反，符号就是用来创建唯一记号，进而用作非字符串形式的对象属性。 
#### 符号的基本用法
符号需要使用 Symbol()函数初始化。因为符号本身是原始类型，所以 typeof 操作符对符号返回 symbol。 
```js
let sym = Symbol(); 
console.log(typeof sym); // symbol 
```

调用 Symbol()函数时，也可以传入一个字符串参数作为对符号的描述（description），将来可以通过这个字符串来调试代码。但是，这个字符串参数与符号定义或标识完全无关
```js
let genericSymbol = Symbol(); 
let otherGenericSymbol = Symbol(); 
 
let fooSymbol = Symbol('foo'); 
let otherFooSymbol = Symbol('foo'); 
 
console.log(genericSymbol == otherGenericSymbol);  // false 
console.log(fooSymbol == otherFooSymbol);          // false
```
符号没有字面量语法，这也是它们发挥作用的关键。按照规范，只要创建 Symbol() 实例并将其用作对象的新属性，就可以保证它不会覆盖已有的对象属性，无论是符号属性还是字符串属性。
```js
let genericSymbol = Symbol(); 
console.log(genericSymbol);  // Symbol() 
 
let fooSymbol = Symbol('foo'); 
console.log(fooSymbol);      // Symbol(foo); 
```

最重要的是，Symbol()函数不能与 new 关键字一起作为构造函数使用。这样做是为了避免创建符号包装对象，像使用 Boolean、String或 Number那样，它们都支持构造函数且可用于初始化包含原始值的包装对象
```js
let myBoolean = new Boolean(); 
console.log(typeof myBoolean); // "object" 
 
let myString = new String(); 
console.log(typeof myString);  // "object" 
 
let myNumber = new Number(); 
console.log(typeof myNumber);  // "object" 
 
let mySymbol = new Symbol(); // TypeError: Symbol is not a constructor 
```
如果你确实想使用符号包装对象，可以借用 Object()函数
```js
let mySymbol = Symbol(); 
let myWrappedSymbol = Object(mySymbol); 
console.log(typeof myWrappedSymbol);   // "object" 
```
#### 使用全局符号注册表
如果运行时的不同部分需要共享和重用符号实例，那么可以用一个字符串作为键，在全局符号注册表中创建并重用符号。为此，需要使用 Symbol.for()方法
```js
let fooGlobalSymbol = Symbol.for('foo'); 
console.log(typeof fooGlobalSymbol); // symbol 
```
Symbol.for()对每个字符串键都执行幂等操作。第一次使用某个字符串调用时，它会检查全局运行时注册表，发现不存在对应的符号，于是就会生成一个新符号实例并添加到注册表中。后续使用相同字符串的调用同样会检查注册表，发现存在与该字符串对应的符号，然后就会返回该符号实例。
```js
let fooGlobalSymbol = Symbol.for('foo');       // 创建新符号 
let otherFooGlobalSymbol = Symbol.for('foo');  // 重用已有符号 
 
console.log(fooGlobalSymbol === otherFooGlobalSymbol);  // true 
```

即使采用相同的符号描述，在全局注册表中定义的符号跟使用 Symbol()定义的符号也并不等同
```js
let localSymbol = Symbol('foo'); 
let globalSymbol = Symbol.for('foo'); 
 
console.log(localSymbol === globalSymbol); // false 
```
全局注册表中的符号必须使用字符串键来创建，因此作为参数传给 Symbol.for()的任何值都会被转换为字符串。此外，注册表中使用的键同时也会被用作符号描述。
```js
let emptyGlobalSymbol = Symbol.for(); 
console.log(emptyGlobalSymbol);    // Symbol(undefined) 
```
还可以使用 Symbol.keyFor()来查询全局注册表，这个方法接收符号，返回该全局符号对应的字符串键。如果查询的不是全局符号，则返回 undefined。 
```js
// 创建全局符号 
let s = Symbol.for('foo'); 
console.log(Symbol.keyFor(s));   // foo 
 
// 创建普通符号 
let s2 = Symbol('bar'); 
console.log(Symbol.keyFor(s2));  // undefined 
```

如果传给 Symbol.keyFor()的不是符号，则该方法抛出 TypeError
```js
Symbol.keyFor(123); // TypeError: 123 is not a symbol 
```
#### 使用符号作为属性
凡是可以使用字符串或数值作为属性的地方，都可以使用符号。这就包括了对象字面量属性和Object.defineProperty()/Object.defineProperties()定义的属性。对象字面量只能在计算属性语法中使用符号作为属性。 
```js
let s1 = Symbol('foo'), 
    s2 = Symbol('bar'), 
    s3 = Symbol('baz'), 
    s4 = Symbol('qux'); 
 
let o = { 
  [s1]: 'foo val' 
}; 
// 这样也可以：o[s1] = 'foo val'; 
 
console.log(o); 
// {Symbol(foo): foo val} 
 
Object.defineProperty(o, s2, {value: 'bar val'}); 
 
console.log(o); 
// {Symbol(foo): foo val, Symbol(bar): bar val} 
 
Object.defineProperties(o, { 
  [s3]: {value: 'baz val'}, 
  [s4]: {value: 'qux val'} 
}); 
 
console.log(o); 
// {Symbol(foo): foo val, Symbol(bar): bar val, 
//  Symbol(baz): baz val, Symbol(qux): qux val} 
```

类似于 Object.getOwnPropertyNames()返回对象实例的常规属性数组，Object.getOwnPropertySymbols()返回对象实例的符号属性数组。这两个方法的返回值彼此互斥。Object.getOwnPropertyDescriptors()会返回同时包含常规和符号属性描述符的对象。Reflect.ownKeys()会返回两种类型的键
```js
let s1 = Symbol('foo'), 
    s2 = Symbol('bar');  
 
let o = { 
  [s1]: 'foo val', 
  [s2]: 'bar val', 
  baz: 'baz val', 
  qux: 'qux val' 
}; 
 
console.log(Object.getOwnPropertySymbols(o)); 
// [Symbol(foo), Symbol(bar)] 
 
console.log(Object.getOwnPropertyNames(o)); 
// ["baz", "qux"] 
 
console.log(Object.getOwnPropertyDescriptors(o)); 
// {baz: {...}, qux: {...}, Symbol(foo): {...}, Symbol(bar): {...}} 
 
console.log(Reflect.ownKeys(o)); 
// ["baz", "qux", Symbol(foo), Symbol(bar)] 
```

因为符号属性是对内存中符号的一个引用，所以直接创建并用作属性的符号不会丢失。但是，如果没有显式地保存对这些属性的引用，那么必须遍历对象的所有符号属性才能找到相应的属性键
```js
let o = {  
  [Symbol('foo')]: 'foo val', 
  [Symbol('bar')]: 'bar val' 
}; 
 
console.log(o); 
// {Symbol(foo): "foo val", Symbol(bar): "bar val"} 
 
let barSymbol = Object.getOwnPropertySymbols(o) 
              .find((symbol) => symbol.toString().match(/bar/)); 
 
console.log(barSymbol); 
// Symbol(bar) 
```
#### 常用内置符号
ECMAScript 6 引入了一批常用内置符号（well-known symbol），用于暴露语言内部行为，开发者可以直接访问、重写或模拟这些行为。这些内置符号都以 Symbol 工厂函数字符串属性的形式存在。 

这些内置符号最重要的用途之一是重新定义它们，从而改变原生结构的行为。比如，知道for-of 循环会在相关对象上使用 Symbol.iterator 属性，那么就可以通过在自定义对象上重新定义Symbol.iterator的值，来改变 for-of在迭代该对象时的行为。 

这些内置符号也没有什么特别之处，它们就是全局函数 Symbol的普通字符串属性，指向一个符号的实例。所有内置符号属性都是不可写、不可枚举、不可配置的。 

提到 ECMAScript 规范时，经常会引用符号在规范中的名称，前缀为@@。比如，@@iterator指的就是 Symbol.iterator。 
#### Symbol.asyncIterator
根据 ECMAScript 规范，这个符号作为一个属性表示“一个方法，该方法返回对象默认的 AsyncIterator。由 for-await-of语句使用”。换句话说，这个符号表示实现异步迭代器 API 的函数。

for-await-of循环会利用这个函数执行异步迭代操作。循环时，它们会调用以 Symbol.asyncIterator 为键的函数，并期望这个函数会返回一个实现迭代器 API 的对象。很多时候，返回的对象是实现该 API 的 AsyncGenerator
```js
class Foo {  
  async *[Symbol.asyncIterator]() {} 
} 
 
let f = new Foo(); 
 
console.log(f[Symbol.asyncIterator]()); 
// AsyncGenerator {<suspended>} 
```
技术上，这个由 Symbol.asyncIterator 函数生成的对象应该通过其 next()方法陆续返回 Promise实例。可以通过显式地调用 next()方法返回，也可以隐式地通过异步生成器函数返回
```js
class Emitter {  
  constructor(max) { 
    this.max = max; 
    this.asyncIdx = 0; 
  } 
 
  async *[Symbol.asyncIterator]() { 
    while(this.asyncIdx < this.max) { 
      yield new Promise((resolve) => resolve(this.asyncIdx++)); 
    } 
  } 
} 
 
async function asyncCount() { 
  let emitter = new Emitter(5); 
 
  for await(const x of emitter) { 
    console.log(x); 
  } 
} 
 
asyncCount(); 
// 0 
// 1 
// 2 
// 3 
// 4 
```
Symbol.asyncIterator 是 ES2018 规范定义的，因此只有版本非常新的浏览器支持它。


