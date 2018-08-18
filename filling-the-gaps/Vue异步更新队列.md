# Vue异步更新队列

## 背景
什么是异步更新队列，它的意义是什么？
先看这么一个组件
```js
import Vue from 'vue'
const foo = new Vue({
  data() {
    return {
      test: 0,
    }
  },
  created() {
    this.$watch('test', (val) => {
      console.log('>>>>>test change', val)
    })		
    this.test = 1
    this.test = 2
    this.test = 3
  }		
})
```
你的第一印象可能是```$watch```的回调函数会执行三次，其实不是的，只会执行一次。
但这种设计是非常合理的。假设我们进行同步更新，换句话说，即连续更改三次```test```，会更新三次。那么在数据频繁的场景下，频繁触发模块以及其他各种多个watcher的更新，将会带来*非常严重*的性能问题。采用异步更新的思路，加之Vue使用了虚拟dom的技术，把多次更新合并到一次更新能带来很大的性能提升。

## 原理-事件循环
异步更新队列涉及两部分源码，一个是scheduler，用于管理watcher的队列，一个next-tick，用于将清空队列的操作安排在事件循环适当的时机。
在这之前需要先了解*事件循环*这个概念。单线程实现异步的原理就在于事件循环。js的所谓异步，只是一个任务队列。浏览器端跟node端的事件循环模型是有很大区别的。在这里只谈浏览器下的事件循环，详细可以点击[这里](https://juejin.im/post/5aa5dcabf265da239c7afe1e)了解他们的区别。

### 概念
浏览器端的事件循环包括三个概念:
1. 执行栈
2. 宏任务队列: 包括script、setTimeout、setInterval、UI rendering、I/O
3. 微任务队列: 包括promise、Object.observe、MutationObserver
抽象来说，可以认为一个事件循环包括了*函数执行栈*，栈后跟随着一个宏任务队列，而其中每个宏任务元素后跟随着一个微任务队列。

### 执行流程
流程简单来说就是：
1. 执行同步代码，清空执行栈;
2. 清空微任务队列;
3. 从宏任务队列取出一个宏任务;
4. 清空微任务队列;
5. 重复3和4，知道宏任务队列与其后跟随的微任务队列都被清空。

### 伪代码
可以使用以下伪代码去理解
```js
同步代码()
微任务队列全部任务()
while (true) {
  宏任务队列.shift()
  微任务队列全部任务()
}
```

## nextTick

### 概述
我们的最终目的是将多次更新合并至一次更新。
如何保证我们这一次更新，可以收集到这一轮循环的所有更新了。即例子组件中的三条触发更新的语句
```js
// ...
  this.test = 1
  this.test = 2
  this.test = 3
//...
```
其实理解了事件循环就知道，只要把*执行时机安排在宏任务或微任务队列中*就好了。
但是为了尽快地执行更新，Vue会优先将更新时机安排在*微任务队列*中，假如不兼容在安排在宏任务队列中。即使是降级至宏任务中，也会分setImmediate、share worker、setTimeout三个方案。（为了性能考虑得相当相当周全……）

### 解析代码
1. 主体逻辑
主要逻辑为：1.将回调加入至一个队列中；2.pending为是否执行中的标记，若为true则回调会在下一次nextTick中执行，若为false则开启异步更新（微任务或宏任务）
而异步更新的逻辑为*优先采用微任务*，尽可能早地清空任务队列。若环境不支持promise，则降级为宏任务的方案。
[next-tick决策树](http://o8swwgh2r.bkt.clouddn.com/wwwww.png)

2. next-tick入口
```js
let callbacks = []
// ...
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 推入队列
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 是否正在执行队列
  if (!pending) {
    pending = true
    // 是否强制采用宏任务方案
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      // 优先采用微任务方案
      microTimerFunc()
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

3. 判断方案--是否支持微任务方案
```js
// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  // 使用promise实现微任务方案
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
} else {
  // 降级至宏任务
  microTimerFunc = macroTimerFunc
}
```

4. 判断方案--宏任务最优方案
按性能优劣排优先级：setImmediate、MessageChannel、setTimeout
```js
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

5. 清空队列
```js
function flushCallbacks () {
  // 重置执行状态
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

## scheduler
了解了执行时机后，我们再来看看，依赖是怎么被触发的。结合时机跟触发的方法，就能构成异步更新队列的完整的印象了。

### 依赖-watcher
Vue的数据响应系统还是比较复杂的，具体实现在此不细说。我将其抽象成两部分，类比于广播-订阅模式。
- 数据添加上访问器属性后（getter/setter），可以理解为事件广播者。
- 依赖（也称为观察者、watcher）可以理解为事件的订阅者。
在Vue中，依赖是由```Watch```构造函数实例化出来的各个watcher。其中关于触发依赖的接口有两个需要了解，一个是```update```，一个是```run```。
```js
export default class Watch {
  // ...
  update () {
    /* istanbul ignore else */
    if (this.computed) {
      // A computed property watcher has two modes: lazy and activated.
      // It initializes as lazy by default, and only becomes activated when
      // it is depended on by at least one subscriber, which is typically
      // another computed property or a component's render function.
      if (this.dep.subs.length === 0) {
        // In lazy mode, we don't want to perform computations until necessary,
        // so we simply mark the watcher as dirty. The actual computation is
        // performed just-in-time in this.evaluate() when the computed property
        // is accessed.
        this.dirty = true
      } else {
        // In activated mode, we want to proactively perform the computation
        // but only notify our subscribers when the value has indeed changed.
        this.getAndInvoke(() => {
          this.dep.notify()
        })
      }
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)// HERE !!!!!!
    }
  }
  // ...
  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
      this.getAndInvoke(this.cb)
    }
  }
  // ...
}
```
依赖在被触发时会调用update方法，而正在触发依赖内逻辑的接口是run。update方法在这里只是将watcher加入schedueler任务队列中。
在watcher被触发的过程中，最重要的一句语句是执行queueWatcher。
接下来我们看一下这个函数到底做了什么事情。

### queueWatcher
后面会涉及到watcher的id这个属性，所以先谈一下。
每个watcher实例化的时候都会带上自己的id，具体实现方式是Watch类引用_uid变量，每次实例化的时候给_uid加一并赋值到其id属性上。所以先实例化者，id必然比后实例化者要小。

```js
// 缓存已经加入队列的watcher，避免冗余
let has = {}
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    // 若未正在清空队列，则将watcher推入队列中
    if (!flushing) {
      queue.push(watcher)
    } else {
      // TODO: 正在清空队列时，有watcher被触发则会被插入在正在清空的队列的某个位置。而这部分代码与执行watcher队列的顺序逻辑有关，暂且不讲。
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // 是否已经将清空队列的方法置于nextTick回调中
    // waiting为设置回调的标记，flushing为正在调用flushSchedulerQueue，清空队列的标记
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
```

### 清空队列-flushSchedulerQueue
队列在清空之前会进行排序。由于之前所讲的，watcher具有自己的uid，而且uid根据创建时间递增。因此按id升序排列可以实现两种场景：父组件先更新而子组件在后、自定义watcher先更新而渲染watcher后更新。
在读watcher源码时笔者以为uid也不过是个索引而已，想不到在清空队列时还起到控制执行watcher顺序的功能，也是挺巧妙。

#### 如何清空队列
```js
function flushSchedulerQueue () {
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.

  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    // 执行watcher
    watcher.run()
    // ...省略不必要的代码
  }

    // ...省略不必要的代码

  // 重置scheduler
  resetSchedulerState()

  // ...省略不必要的代码
}
```

#### 重置状态
```js
function resetSchedulerState () {
  index = queue.length = 0
  has = {}
  // ...省略不必要的代码
  waiting = flushing = false
}

```

#### 插入队列
假如在队列执行的过程中需要插入watcher怎么办？
现在我们回过头来看看这部分的代码
```js
  // 若未正在清空队列，则将watcher推入队列中
  if (!flushing) {
    queue.push(watcher)
  } else {
    // TODO: 正在清空队列时，有watcher被触发则会被插入在正在清空的队列的某个位置。
    // if already flushing, splice the watcher based on its id
    // if already past its id, it will be run next immediately.
    let i = queue.length - 1
    while (i > index && queue[i].id > watcher.id) {
      i--
    }
    queue.splice(i + 1, 0, watcher)
  }
```

```js
while (i > index && queue[i].id > watcher.id) {
  i--
}
queue.splice(i + 1, 0, watcher)
```
这部分逻辑有点绕，我们换个形式去思考。
当```i <= index```或者```queue[i].id <= watcher.id```时，在当前索引下插入watcher。

首先看第一个条件：
index为scheduler模块中的一个全局变量，其值即当前队列清空的元素的索引。假如循环至index仍然没有找到符合条件的watcher，则会将此watcher插入到未执行的队列顶部，让他立刻执行。
然后看第二个条件：
我们了解到，执行队列会按id升序来执行，因此从队列的末尾一直寻找，寻找到待插入watch的id大于等于当前元素的id，那就是符合我们的排序规则的，因此可以插入。

## 总结
总的来说，异步更新队列就是将所有被触发的watcher推入一个以id为升序排列的执行队列中，再将执行队列放置于当前事件循环的微任务或宏任务中执行。
在很多面经中都了解过事件循环，但是要说实现场景真的不多。实践出真知，读完这部分代码之后才敢说理解了事件循环。