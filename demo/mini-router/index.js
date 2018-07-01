/**
 * 数据劫持
 * 思路: 
 * 1. 实现发布者:
 *    发布者在对象遍历的过程中，添加一层getter-setter。getter中收集依赖的订阅者，setter中触发订阅者
 * 2. 实现订阅者:
 *    订阅者需要传入: 上下文对象，键名，回调
 *    订阅者初始化时，触发getter，使发布者完成依赖收集
 *    暴露update接口，使发布者能响应该订阅者。update接口中调用回调
 * 3. 实现依赖集合:
 *    暴露add接口，收集依赖
 *    暴露notify接口，触发依赖
 *    target属性用于传递 watcher
 */

import observer from './observer'
import { Watcher } from './watcher'

const data = {
  foo: `bar`,
  data: {
    again: `bar`
  }
}

const render = function() {
  console.log('>>>>>>>>render now')
}

observer(data)
const w = new Watcher(data, 'foo', render.bind(global))

data.foo = 1