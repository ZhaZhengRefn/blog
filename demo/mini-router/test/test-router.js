import Router from '../index.js'

const routes = [
  {
    name: 'foo',
    path: '/foo'
  },
  {
    name: 'bar',
    path: '/bar'
  },
]

new Router({  
  routes
})