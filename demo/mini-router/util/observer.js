import { Dep } from './dep'

class Observer {
  constructor(vm) {
    this.walk(vm)
  }

  walk(vm) {
    Object.keys(vm).forEach(key => {
      if (typeof vm[key] === 'object') {
        this.walk(vm[key])
      }
      defineReactive(vm, key, vm[key])
    })
  }
}

function defineReactive(obj, key, value) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.add()
      }
      return value
    },
    set(newVal) {
      value = newVal
      dep.notify()
    }
  })
}

export default function observer(value) {
  return new Observer(value)
}