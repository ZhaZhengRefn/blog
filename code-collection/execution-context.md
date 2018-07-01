# 一道执行上下文的题目

## 比较下面两段代码，试述两段代码的不同之处
```js
// A--------------------------
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();

// B---------------------------
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

## 区别
区别在于*执行栈的变化*

A: contextStack = [globalContext] ---> contextStack = [checkscopeContext, globalContext] ---> contextStack = [fContext, checkscopeContext, globalContext] ---> contextStack = [checkscopeContext, globalContext] ---> contextStack = [globalContext]

B: contextStack = [globalContext] ---> contextStack = [checkscopeContext, globalContext] ---> contextStack = [fContext, globalContext] ---> contextStack = [globalContext]