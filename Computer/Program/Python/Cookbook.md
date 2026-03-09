---
language:
  - Python
runversion: 1.31.1
---

# 数据结构和算法
本章节的目的是讨论常见的数据结构和同数据有关的算法。在 collections 模块中也包含了针对各种数据结构的解决方案。
## 解包
### 问题1：将序列分解为单独的变量
任何序列（或可迭代对象）都可以通过一个简单的赋值操作来分解为单独的变量。唯一的要求是变量的总数和结构要与序列相吻合

现有一个包含 N 个元素的元组或序列，现想将其分解为 N 个单独的变量，解决方案如下
```python
p = (4, 5)
x, y = p
print(f"x={x}")
print(f"y={y}")

data = ["ACME", 50, 91.1, (2012, 12, 21)]
name, shares, price, date = data
print(f"name={name}")
print(f"date={date}")

name, shares, price, (year, mon, day) = data
print(f"name={name}")
print(f"year={year}")
print(f"mon={mon}")
print(f"day={day}")
```
如果元素的数量不匹配，将得到一个错误提示
```python
p = (4, 5)
x, y, z = p
```

只要对象恰好是可迭代的，就可以执行解包操作。包括字符串、文件、迭代器以及生成器。做解包操作时，有时候可能想丢弃某些特定的值。Python 并没有提供特殊的语法来实现这一点，但通常可以选一个用不到的变量名，以此作为要丢弃的值的名称（一般用下划线 `_` 充当这个角色）

### 问题2：从任意长度的可迭代对象中分解元素
从问题1 的最后知道，如果解包时左边接收值的元素数量与序列不匹配，就会出现“分解的值过多（too many values to pack）”的异常。这种情况可以用 Python 的通配符来处理
```python
def drop_first_last(grades):
    first, *middle, last = grades
    return sum(middle)/len(middle)

print(drop_first_last([77, 81, 73, 61, 55, 59, 97, 87, 100]))
```

有时可能想分解出某些值然后丢弃它们。解包的时候，不能只是指定一个单独的 `*`，但是可以使用几个常用来表示丢弃值得变量名（通常是 `*_`）。

**tips**：下面例子使用这种解包操作实现递归算法，但是注意递归并不是 Python 的强项，这是因为其内在的递归限制所致。下面的例子在实践中也没有太大的意义，只是一种学术上的好奇
```python
def my_sum(items):
    head, *tail = items
    return head + my_sum(tail) if tail else head

print(my_sum([1, 2, 3, 4, 5, 6, 7, 8, 9]))
```

## 模块中的数据结构
### 问题3：保存最后 N 个元素
希望在迭代或是其它形式的处理过程中对最后几项记录做一个有限的历史记录。这种保存有限的历史记录可算是 collections.deque 的完美应用场景。

下面的例子对一系列文本行做简单的文本匹配操作，当发现有匹配时就输出当前的匹配行以及最后检查过的 N 行文本

```python
from collections import deque

def search(lines, pattern, history=5):
    previous_lines = deque(maxlen=history)
    for line in lines:
        if pattern in line:
            yield line, previous_lines
        previous_lines.append(line)
        
if __name__=='__main__':
   with open('ZenOfPython.txt') as f:
       for line, prevlines in search(f, 'Python', 5):
           for pline in prevlines:
               print(pline, end='')
           print(line, end='')
           print('-'*20)
```

```
The Zen of Python, by Tim Peters
--------------------
```

这个示例涉及到了生成器，deque(maxlen=N) 创建一个固定长度的队列。当有新的记录加入而队列已满时会自动移除最老的记录
```python
from collections import deque

q = deque(maxlen=3)
q.append(1)
q.append(2)
q.append(3)
print(q)

q.append(4)
print(q)

q.append(5)
print(q)
```
尽管可以在列表上手动完成这样的操作，但队列这种解决方案要优雅得多，运行速度也快得多。

如果不指定队列的大小，也就得到了一个无界限得队列，可以在两端执行添加和弹出得操作。这两个操作的复杂度都是 O(1)，而当从列表的头部插入或移除元素时，列表的复杂度是 O(N)

### 问题4：找到最大或最小的 N 个元素
想找到某个集合中的最大或最小的 N 个元素，这正是 heapq 模块中的 nlargest() 和 nsmallest() 函数的用武之处
```python
import heapq

nums = [1, 8, 2, 23, 7, -4, 18, 23, 42, 37, 2]
print(heapq.nlargest(3, nums))
print(heapq.nsmallest(3, nums))
```

这两个函数都可以接收一个参数 key，允许工作在更加复杂的数据结构上
```python
portfolio = [
    {'name': 'IBM', 'shares': 100, 'price': 91.1},
    {'name': 'AAPL', 'shares': 50, 'price': 543.22}, 
    {'name': 'FB', 'shares': 200, 'price': 21.09}, 
    {'name': 'HPQ', 'shares': 35, 'price': 31.75}, 
    {'name': 'YHOO', 'shares': 45, 'price': 16.35}, 
    {'name': 'ACME', 'shares': 75, 'price': 115.65} 
]

cheap = heapq.nsmallest(3, portfolio, key=lambda s: s['price']) 
expensive = heapq.nlargest(3, portfolio, key=lambda s: s['price'])

print(cheap)
print(expensive)
```

如果正在寻找最大或最小的 N 个元素，且同集合中元素的总数相比，N 很小，那么下面的函数可以提供更好的性能。这些函数首先会在底层将数据转化成列表，且元素会以堆的顺序排序
```python
import heapq

nums = [1, 8, 2, 23, 7, -4, 18, 23, 42, 37, 2]
heap = list(nums)
heapq.heapify(heap)
print(heap)
```
堆最重要的特性就是 heap[0] 总是最小的那个元素。此外，接下来的元素可依次通过 heapq.heappop() 方法轻松找到，该方法将第一个元素弹出，然后以第二小的元素取而代之，这个操作的复杂度是 $\mathrm{O}(\log_N)$。

当所要找的元素数量相对较小时，函数 nlargest() 和 nsmallest() 才是最适用的。如果只是简单地想找到最小或最大的元素（N=1 时），那么用 min() 和 max() 会更加快。同样，如果 N 和集合本身的大小差不多大，通常更快的方法是先对集合排序，然后做切片操作（例如，使用 sorted(items)[:N] 或者 sorted(items)[-N:]）。应该要注意的是，nlargest() 和 nsmallest() 的实际实现会根据使用它们的方式而有所不同，可能会相应作出一些优化措施（比如，当 N 的大小同输入大小很接近时，就会采用排序的方法）。

通常在优秀的算法和数据结构相关的书籍里都能找到堆数据结构的实现方法。在 heapq 模块的文档中也讨论了底层实现的细节。

### 问题5：实现优先级队列
下面例子利用 heapq 模块实现一个简单的优先级队列
```python
import heapq

class PriorityQueue:
    def __init__(self):
        self._queue = []
        self._index = 0
        
    def push(self, item, priority):
        heapq.heappush(self._queue, (-priority, self._index, item))
        self._index += 1
        
    def pop(self):
        return heapq.heappop(self._queue)[-1]
        
class Item:
    def __init__(self, name):
        self.name = name
        
    def __repr__(self):
        return 'Item({!r})'.format(self.name)
        
q = PriorityQueue()
q.push(Item('foo'), 1)
q.push(Item('bar'), 5)
q.push(Item('spam'), 4)
q.push(Item('grok'), 1)

print(q.pop())
print(q.pop())
print(q.pop())
print(q.pop())
```
拥有相同优先级的两个元素返回的顺序同插入到队列时的顺序相同。

队列以元组 (-priority, index, item) 的形式组成。把 priority 取负值是为了让队列能够按元素的优先级从高到低的顺序排列。这和正常的堆排列顺序相反，一般情况下堆是按从小到大的顺序排序的。 

变量 index 的作用是为了将具有相同优先级的元素以适当的顺序排列。通过维护一个不断递增的索引，元素将以它们入队列时的顺序来排列。但是，index 在对具有相同优先级的元素间做比较操作时同样扮演了重要的角色。 

Item 实例是没法进行次序比较
```python
class Item:
    def __init__(self, name):
        self.name = name
        
    def __repr__(self):
        return 'Item({!r})'.format(self.name)
        
a = Item('foo')
b = Item('bar')
print(a < b)
```

如果以元组 (priority, item) 的形式来表示元素，那么只要优先级不同，它们就可以进行比较。
```python
class Item:
    def __init__(self, name):
        self.name = name
        
    def __repr__(self):
        return 'Item({!r})'.format(self.name)
        
a = (1, Item('foo'))
b = (5, Item('bar'))
print(a < b)
```

但是，如果两个元组的优先级值相同，做比较操作时还是会像之前那样失败。
```python
class Item:
    def __init__(self, name):
        self.name = name
        
    def __repr__(self):
        return 'Item({!r})'.format(self.name)
        
a = (1, Item('foo'))
b = (1, Item('bar'))
print(a < b)
```

通过引入额外的索引值，以 (prioroty, index, item) 的方式建立元组，就可以完全避免这个问题。因为没有哪两个元组会有相同的 index 值（一旦比较操作的结果可以确定，Python 就不会再去比较剩下的元组元素了）
```python
class Item:
    def __init__(self, name):
        self.name = name
        
    def __repr__(self):
        return 'Item({!r})'.format(self.name)
        
a = (1, 0, Item('foo'))
b = (1, 1, Item('bar'))
print(a < b)
```

如果想将这个队列用于线程间通信，还需要增加适当的锁和信号机制。于堆的理论和实现在 heapq 模块的文档中有着详细的示例和相关讨论

### 问题6：在字典中将键映射到多个值上
