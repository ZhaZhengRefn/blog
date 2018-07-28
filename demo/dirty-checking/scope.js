class Scope {
  constructor() {
    this.$$watcher = []
    /**
     * watcher数据结构
     * {
     *  name: name,//变量名
     *  oldVal: '',//旧值
     *  newVal: exp,//返回新值的函数
     *  listener: listener || function() {},//监听回调
     * }
     */
  }

  //添加watcher
  $watch(name, exp, listener = () => {}) {
    const oldVal = exp()
    this.$$watcher.push({
      name,
      oldVal,
      newVal: exp,
      listener
    })
  }

  //脏检查关键之处，遍历watcher，比对旧值与新值。再触发listener
  $digest() {
    let dirty = true
    while (dirty) {
      dirty = false
      this.$$watcher.forEach(cur => {
        const newVal = cur.newVal()
        if (cur.oldVal !== newVal) {
          dirty = true
          cur.oldVal = newVal
          cur.listener(cur.oldVal, newVal)
        }
      })
    }
  }

  $init() {
    const _this = this
    const bindElements = [...document.querySelectorAll("[ng-bind]")]

    //监听所有数据，添加watcher
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const cur = this[key];
        if (key[0] !== '$' && typeof cur !== 'function') {
          this.$watch(key, function (key) {
            return function () {
              return _this[key]
            }
          }(key), function(old, newVal) {
            // 解析所有ng-bind指令
            bindElements.forEach(el => {
              const dataName = el.getAttribute("ng-bind")
              if (dataName === key) {
                if (el.tagName === 'INPUT') {
                  el.value = _this[dataName]
                } else {
                  el.innerHTML = _this[dataName]
                }
              }
            })
          })
        }
      }
    }    

    // 解析所有ng-click指令
    const clickElements = document.querySelectorAll("[ng-click]")
    clickElements.forEach(el => {
      el.onclick = function() {
        const methodName = el.getAttribute('ng-click')
        if (typeof _this[methodName] === 'function') {
          _this[methodName].call(_this)
          _this.$digest()
        }
      }
    })
  }
}

window.Scope = Scope