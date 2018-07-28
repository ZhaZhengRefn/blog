# 脏检查简单实现

## 背景
最近复习框架通识。不少文章常说脏检查低效，已经退出了历史舞台。然而小程序框架wepy采用的方案却正是脏检查。脏检查并非绝对的低效，对于单次渲染成本大的情况，脏检查还是有优势。方案没有绝对高低，只有是否适合。特地来练习一下，实现一份简单的脏检查。

## 我对脏检查的理解
脏检查的原理在于定时检查旧值与新值，检测到值被更新后会触发Watcher中注册的Listener。为了应对单次渲染成本大的情况，当检测到值被更改好，我将watcher缓存在readyToSet的集合中，但一轮digest后一次过触发，减少渲染成本。

## 代码
话不多说，上代码
```js
class Scope {
  constructor() {
    /**
     * watcher数据结构
     * {
     *  name: name,//变量名
     *  oldVal: '',//旧值
     *  newVal: exp,//返回新值的函数
     *  listener: listener || function() {},//监听回调
     * }
     */    
    this.$$watcher = []
    //缓存的watcher
    this.$$readyToSet = []
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
          //缓存渲染操作
          this.$$readyToSet.push(cur)
        }
      })
    }
    // 渲染所有bind指令
    this._setAllWatcher()
  }

  _setAllWatcher() {
    // 解析所有ng-bind指令
    const _this = this
    const bindElements = [...document.querySelectorAll("[ng-bind]")]
    this.$$readyToSet.forEach(cur => {
      bindElements.forEach(el => {
        const dataName = el.getAttribute("ng-bind")
        if (dataName === cur.name) {
          if (el.tagName === 'INPUT') {
            el.value = _this[dataName]
          } else {
            el.innerHTML = _this[dataName]
          }
        }
      })
    })

    this.$$readyToSet = []
  }

  $init() {
    const _this = this

    //监听所有数据，添加watcher
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const cur = this[key];
        if (key[0] !== '$' || key[0] !== '_' && typeof cur !== 'function') {
          this.$watch(key, function (key) {
            return function () {
              return _this[key]
            }
          }(key))
        }
      }
    }

    // 解析所有ng-click指令
    const clickElements = document.querySelectorAll("[ng-click]")
    clickElements.forEach(el => {
      el.onclick = function () {
        const methodName = el.getAttribute('ng-click')
        if (typeof _this[methodName] === 'function') {
          _this[methodName].call(_this)
          _this.$digest()
        }
      }
    })
  }
}
```

```html
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>脏检查简单实现</title>
</head>

<body>
  <form action="">
    <input type="text" ng-bind="number">
    <button type="button" ng-click="addNumber">数字+1</button>
  </form>
  <div ng-bind="number"></div>
  <script src="./scope.js"></script>
  <script>
    const $scope = new Scope()

    $scope.number = 0
    $scope.addNumber = function () {
      this.number++
    }
    $scope.$init()

    $scope.number = 1
    $scope.$digest()
  </script>
</body>

</html>
```

详见blog项目中的[demo/dirty-checking](https://github.com/ZhaZhengRefn/blog/tree/master/demo/dirty-checking)