# 使用队列管理以适应小程序请求并发不能超过五个的情况

```js
const requestQueue = {
    // 最大并发请求数量
    MAX_REQUEST: 5,
    // 参数包集
    map: {},
    // 请求队列
    queue: [],
    // 并发请求集
    running: [],
    // 推入队列
    push (params) {
        params._t = Date.now()
        // 防止请求索引重名
        while ( this.queue.indexOf(params._t) > -1 || this.running.indexOf(params._t) > -1 ){
            params._t += Math.random() * 10 >> 0
        }
        // 存入参数包集，推入队列
        this.map[params._t] = params
        this.queue.push(params._t)
    },
    // 发起下一个请求
    next () {
            if ( this.queue.length === 0 ) return
        
        if ( this.running.length + 1 < this.MAX_REQUEST ){
            const cur = this.queue.shift()
            const curParams = this.map[cur]

            // 劫持complete回调
            let oldComplete = cur.complete
            cur.complete = (...args) => {

                this.running.splice( this.running.indexOf(cur), 1 )
                delete this.map[cur]

                oldComplete && oldComplete.apply(this, args)
                this.next()
            }

            this.running.push(cur)

            return wx.request(curParams)
        }
    },
    // 启动队列
    request (params = {}) {

        params = (typeof(params) === 'string') ? { url: params } : params

        this.push(params)
        return this.next()
    }
}
```