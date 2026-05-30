export class WorkStealingDeque<T> {
  private tasks: (T | undefined)[]
  private _size: number = 0
  private head: number = 0
  private tail: number = 0

  constructor(capacity: number = 1024) {
    this.tasks = new Array(capacity).fill(undefined)
  }

  pushBottom(item: T): void {
    this.growIfNeeded()
    this.tasks[this.tail % this.tasks.length] = item
    this.tail++
    this._size++
  }

  popBottom(): T | undefined {
    if (this._size === 0) return undefined
    this.tail--
    this._size--
    const item = this.tasks[this.tail % this.tasks.length]
    this.tasks[this.tail % this.tasks.length] = undefined
    return item
  }

  steal(): T | undefined {
    if (this._size === 0) return undefined
    const item = this.tasks[this.head % this.tasks.length]
    this.tasks[this.head % this.tasks.length] = undefined
    this.head++
    this._size--
    return item
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = this.head; i < this.tail; i++) {
      const item = this.tasks[i % this.tasks.length]
      if (item !== undefined) result.push(item)
    }
    return result
  }

  private growIfNeeded(): void {
    if (this._size >= this.tasks.length) {
      const newTasks = new Array(this.tasks.length * 2).fill(undefined)
      for (let i = this.head; i < this.tail; i++) {
        newTasks[i - this.head] = this.tasks[i % this.tasks.length]
      }
      this.tasks = newTasks
      this.tail -= this.head
      this.head = 0
    }
  }
}
