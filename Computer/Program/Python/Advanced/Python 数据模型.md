# Python 数据模型
Python 解释器调用特殊方法来执行基本对象操作，通常由特殊句法触发。特殊方法的名称前后两端都有双下划线。例如，在 obj[key] 句法背后提供支持的是特殊方法 `__getitem__`。为了求解 my_collection[key]，Python 解释器要调用 `my_collection.__getitem__(key)`。

如果想让对象支持以下基本的语言结构并与其交互，就需要实现特殊方法
- 容器；
- 属性存取；
- 迭代（包括使用 async for 的异步迭代）； 
- 运算符重载；
- 函数和方法调用；
- 字符串表示形式和格式化； 
- 使用 await 的异步编程；
- 对象创建和析构；
- 使用 with 或 async with 语句管理上下文。

特殊方法用行话说叫作魔术方法（magic method）。需要把一个特殊方法（例如 `__getitem__`）说出来时，应该怎么表达呢？一般说“dunder-getitem”，这是跟著名作家和教师 Steve Holden 学的。“dunder”表示“前后双下划线”。因此，特殊方法也叫“双下划线方法”。《Python 语言参考手册》中的第 2 章“词法分析”警告道：“任何时候，若不遵守文档明确说明的方式使用 `__*__` 名称，一切后果自负。”

**示例：一摞 Python 风格的纸牌**
```python
import collections 
 
# 使用 namedtuple 构建只有属性而没有自定义方法的类对象
Card = collections.namedtuple('Card', ['rank', 'suit']) 
class FrenchDeck: 
    ranks = [str(n) for n in range(2, 11)] + list('JQKA') 
    suits = 'spades diamonds clubs hearts'.split() 
 
    def __init__(self): 
        self._cards = [Card(rank, suit) for suit in self.suits 
                                        for rank in self.ranks] 
 
    def __len__(self): 
        return len(self._cards) 
 
    def __getitem__(self, position): 
        return self._cards[position]
        
beer_card = Card('7', 'diamonds')
print(beer_card)

deck = FrenchDeck()
print(len(deck))   # call __len__

print(deck[0])     # call __getitem__

# 随机选一张牌
from random import choice
print(choice(deck))

```
通过特殊方法利用 Python 数据模型，这样做有两个优点
- 类的用户不需要记住标准操作的方法名称
- 可以充分利用 Python 标准库，例如 random.choice 函数，无须重新发明轮子。

由于 `__getitem__` 方法把操作委托给 `self._cards` 的 [] 运算符，一摞牌自动支持切片（slicing）。
```python
print(deck[:3])
```
实现特殊方法 `__getitem__` 之后，这摞纸牌还可以迭代
```python
for card in deck:
    print(card) 
```
迭代往往是隐式的。如果一个容器没有实现 `__contains__` 方法，那么 in 运算符就会做一次顺序扫描。本例就是这样，FrenchDeck 类支持 in 运算符，因为该类可迭代
```python
print(Card('Q', 'hearts') in deck)
```
按照常规，牌面大小按点数（A 最大），以及黑桃（最大）、红心、方块、梅花（最小）的顺序排列。下面按照这个规则定义扑克牌排序函数，梅花 2 返回 0，黑桃 A 返回 51













