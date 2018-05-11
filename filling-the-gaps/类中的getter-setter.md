# 类中的getter-setter

## 详情
在使用闭包实现类的私有变量时，发现改变原型后会丢失getter

```js
class Obj {
    get yourName(){
        console.log('hhhhhh')
    }
}

class Other {
    get yourName(){
        console.log('aaaaa')
    }
}

const a = new Obj()

a.yourName//不手动设置原型时为hhhhh
```

```js
class Obj {
    get yourName(){
        console.log('hhhhhh')
    }
}

class Other {
    get yourName(){
        console.log('aaaaa')
    }
}

const a = new Obj()
Object.setPrototypeOf(a, null)//将实例的原型设置为null

a.yourName//undefined
```

```js
class Obj {
    get yourName(){
        console.log('hhhhhh')
    }
}

class Other {
    get yourName(){
        console.log('aaaaa')
    }
}

const a = new Obj()
Object.setPrototypeOf(a, Other.prototype)//将原型设置为另一个类

a.yourName//aaaaa
```

```js
class Obj {
    get yourName(){
        console.log('hhhhhh')
    }
}

class Other extends Obj {
    get yourName(){
        console.log('aaaaa')
    }
}

//Other继承Obj类，getter会被屏蔽
const a = new Other()

a.yourName//aaaaa
```

## 总结
类中的getter-setter会写在类的原型上，假如原型被重写，会丢失getter-setter。getter-setter与普通的对象属性有一点相似，即子类的getter会屏蔽父类的getter