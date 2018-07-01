import {
  setTarget,
  clearTarget,
} from './dep'

export class Watcher {
  constructor(vm, expression, callbacks) {
    this.vm = vm
    this.expression = expression
    this.callbacks = Array.isArray(callbacks) ? callbacks : [callbacks]
    this.value = this.getVal()
  }

  getVal() {
    setTarget(this)
    let val = this.vm
    this.expression.split('.').forEach(key => val = val[key])
    clearTarget()
    return val
  }

  update() {
    this.callbacks.forEach(cb => {
      typeof cb === 'function' && cb()
    })
  }
}