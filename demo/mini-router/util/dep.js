export class Dep {
  constructor() {
    this.dependencies = []
  }

  add() {
    this.dependencies.push(Dep.target)
  }

  notify() {
    this.dependencies.forEach(target => {
      target.update()
    })
  }
}

Dep.target = null

export function setTarget(target) {
  Dep.target = target
}

export function clearTarget() {
  Dep.target = null
}