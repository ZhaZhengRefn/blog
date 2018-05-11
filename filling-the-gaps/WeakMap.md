# WeakMap

## 设计用途
WeakMap的键所引用的对象均为弱引用，一旦对象的其他引用被清除，那么WeakMap里的键名对象就会自动消失。有助于防止内存泄露。

## 特性
1. WeakMap只接受对象作为键名（不接受Null）。
```js
const map = new WeakMap()
map.set(1, 2)//TypeError
map.set(null, 2)//TypeError
```
2. 键名所指向的对象，不计入辣鸡回收机制。注意：特性只针对键名，不针对键值。

## 背景与应用场景
有时候想在对象上存放某些数据，这时候会形成对数据引用。若不手动删除引用，垃圾回收机制就不会释放其占用的内存。
常见如DOM操作：
```js
let input = document.querySelector('#input')
let text = document.querySelector('#text')

const listMap = [
    [input, 'this is an input.'],
    [text, 'this is an textarea.'],
]
//...删除引用后
input = null
text = null
//...还需要删除存放数据的对象对其的引用
listMap[0] = null
listMap[1] = null
```
假如使用了WeakMap来存储数据，则可以省略```listMap[0] = null```一步。只要其他地方的引用已解除，那么可以确保WeakMap的键名对象也已经自动消失。
**因此使用WeakMap来存储数据，可以有效防止内存泄露。**

## 语法
WeakMap只有四种方法可用：```get()```、```set()```、```has()```、```delete()```

## 示例
如果引用指向的值占用特别多的内存，可以通过node中的```process.memoryUsage()```看出是否回收了键名对象。
```sh
$   node --expose-gc
```

```js
// 手动gc，排除干扰因素。
> global.gc()

// 查看内存，heapUsed大致为5M
> process.memoryUsage()
{ rss: 22454272,
  heapTotal: 8208384,
  heapUsed: 4981176,
  external: 8666 }

> let wm = new WeakMap()

//新建一个占用特别多内存的对象
> let key = new Array(5*1024*1024)

> wm.set(key, 1)

// 此时内存飙升，大致为47M
> global.gc()

> process.memoryUsage()
{ rss: 65388544,
  heapTotal: 50163712,
  heapUsed: 46933576,
  external: 8637 }

> key = null

> global.gc()

// 显然，key被成功回收了，内存仅占用了5M
> process.memoryUsage()
{ rss: 23580672,
  heapTotal: 8208384,
  heapUsed: 5131920,
  external: 8712 }
```