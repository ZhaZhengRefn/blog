# Event Loop

```js
function sleep(time) {
  let startTime = new Date()
  while (new Date() - startTime < time) {}
  console.log('1s over')
}
setTimeout(() => {
  console.log('setTimeout - 1')
  setTimeout(() => {
      console.log('setTimeout - 1 - 1')
      sleep(1000)
  })
  new Promise(resolve => resolve()).then(() => {
      console.log('setTimeout - 1 - then')
      new Promise(resolve => resolve()).then(() => {
          console.log('setTimeout - 1 - then - then')
      })
  })
  sleep(1000)
})

setTimeout(() => {
  console.log('setTimeout - 2')
  setTimeout(() => {
      console.log('setTimeout - 2 - 1')
      sleep(1000)
  })
  new Promise(resolve => resolve()).then(() => {
      console.log('setTimeout - 2 - then')
      new Promise(resolve => resolve()).then(() => {
          console.log('setTimeout - 2 - then - then')
      })
  })
  sleep(1000)
})

/**
 * ! 浏览器端
 * 伪代码：
 * while (true) {
 *  宏任务队列.shift()
 *  微任务队列全部任务()
 * }
 * setTimeout - 1//? 一个task
 * 1s over
 * setTimeout - 1 - then
 * setTimeout - 1 - then - then

 * setTimeout - 2//? 一个task
 * 1s over
 * setTimeout - 2 - then
 * setTimeout - 2 - then - then

 * setTimeout - 1 - 1//? 一个task
 * 1s over
 * setTimeout - 2 - 1//? 一个task
 * 1s over
 */

/**
 * ! node端
 * 伪代码：
 * while (true) {
 *  loop.forEach((阶段) => {
 *    阶段所有任务()
 *    nextTick全部任务()
 *    microTask全部任务()
 *  })
 *  loop = loop.next()
 * }
 * 
 * setTimeout - 1
 * 1s over
 * setTimeout - 2
 * 1s over
 * ? 单个阶段所有任务end
 * setTimeout - 1 - then
 * setTimeout - 2 - then
 * setTimeout - 1 - then - then
 * setTimeout - 2 - then - then
 * ? 单个阶段microTask
 * setTimeout - 1 - 1
 * 1s over
 * setTimeout - 2 - 2
 * 1s over
 */
```

[浏览器与node端不同的事件循环](https://juejin.im/post/5aa5dcabf265da239c7afe1e)