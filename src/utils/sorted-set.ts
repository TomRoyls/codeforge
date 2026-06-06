interface SkipListNode<T> {
  forward: (null | SkipListNode<T>)[]
  value: T
  width: number[]
}

export class SortedSet<T> {
  private _size: number
  private readonly compare: (a: T, b: T) => number
  private head: SkipListNode<T>
  private level: number
  private readonly MAX_LEVEL = 16
  private readonly P = 0.5

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
    this.head = { forward: Array.from({ length: this.MAX_LEVEL }, () => null), value: null as unknown as T, width: Array.from({ length: this.MAX_LEVEL }, () => 0) }
    this.level = 1
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  add(value: T): boolean {
    const update: (null | SkipListNode<T>)[] = Array.from({ length: this.MAX_LEVEL }, () => null)
    const rank: number[] = Array.from({ length: this.MAX_LEVEL }, () => 0)
    let x = this.head

    for (let i = this.level - 1; i >= 0; i--) {
      rank[i] = i === this.level - 1 ? 0 : rank[i + 1]!
      while (x.forward[i] !== null && this.compare(x.forward[i]!.value, value) < 0) {
        rank[i]! += x.width[i]!
        x = x.forward[i]!
      }

      update[i] = x
    }

    if (x.forward[0] !== null && this.compare(x.forward[0]!.value, value) === 0) {
      return false
    }

    const lvl = this.randomLevel()
    if (lvl > this.level) {
      for (let i = this.level; i < lvl; i++) {
        rank[i] = 0
        update[i] = this.head
        update[i]!.width[i] = this._size
      }

      this.level = lvl
    }

    const newNode: SkipListNode<T> = { forward: Array.from({ length: lvl }, () => null), value, width: Array.from({ length: lvl }, () => 0) }
    for (let i = 0; i < lvl; i++) {
      newNode.forward[i] = update[i]!.forward[i]!
      newNode.width[i] = update[i]!.width[i]! - (rank[0]! - rank[i]!)
      update[i]!.forward[i] = newNode
      update[i]!.width[i] = rank[0]! - rank[i]! + 1
    }

    for (let i = lvl; i < this.level; i++) {
      update[i]!.width[i]!++
    }

    this._size++
    return true
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }

    let x = this.head
    let idx = -1
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && idx + x.width[i]! < index) {
        idx += x.width[i]!
        x = x.forward[i]!
      }
    }
    
    if (x.forward[0] === null) {
      return undefined
    }
    x = x.forward[0]!
    return x.value
  }

  clear(): void {
    this.head = { forward: Array.from({ length: this.MAX_LEVEL }, () => null), value: null as unknown as T, width: Array.from({ length: this.MAX_LEVEL }, () => 0) }
    this.level = 1
    this._size = 0
  }

  delete(value: T): boolean {
    const update: (null | SkipListNode<T>)[] = Array.from({ length: this.MAX_LEVEL }, () => null)
    let x = this.head

    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && this.compare(x.forward[i]!.value, value) < 0) {
        x = x.forward[i]!
      }

      update[i] = x
    }

    x = x.forward[0]!
    if (x === null || this.compare(x.value, value) !== 0) {
      return false
    }

    for (let i = 0; i < this.level; i++) {
      if (update[i]!.forward[i] !== x) {
        update[i]!.width[i]!--
      } else {
        update[i]!.width[i]! += x.width[i]! - 1
        update[i]!.forward[i] = x.forward[i]!
      }
    }

    while (this.level > 1 && this.head.forward[this.level - 1] === null) {
      this.level--
    }

    this._size--
    return true
  }

  forEach(callback: (value: T, index: number) => void): void {
    let i = 0
    let x = this.head.forward[0]!
    while (x !== null) {
      callback(x.value, i)
      i++
      x = x.forward[0]!
    }
  }

  has(value: T): boolean {
    let x = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && this.compare(x.forward[i]!.value, value) < 0) {
        x = x.forward[i]!
      }
      if (x.forward[i] !== null && this.compare(x.forward[i]!.value, value) === 0) {
        return true
      }
    }
    return false
  }

  max(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    let x = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null) {
        x = x.forward[i]!
      }
    }
    return x!.value
  }

  min(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const first = this.head.forward[0]
    return first ? first.value : undefined
  }

  rank(value: T): number {
    let rank = 0
    let x = this.head
    let found = false
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null) {
        const next = x.forward[i]!
        const cmp = this.compare(next.value, value)
        if (cmp === 0) {
          found = true
          break
        }
        if (cmp < 0) {
          rank += x.width[i]!
          x = next
        } else {
          break
        }
      }
    }
    if (!found) {
      return rank
    }
    return rank
  }

  range(start: number, end?: number): T[] {
    const actualEnd = end === undefined ? this._size : Math.min(end, this._size)
    if (start >= actualEnd || start < 0) {
      return []
    }

    const result: T[] = []
    let x = this.head
    let idx = -1

    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && idx + x.width[i]! < start) {
        idx += x.width[i]!
        x = x.forward[i]!
      }
    }

    while (x.forward[0] !== null && idx < actualEnd - 1) {
      x = x.forward[0]!
      idx++
      result.push(x.value)
    }

    return result
  }

  toArray(): T[] {
    const result: T[] = []
    let x = this.head.forward[0]!
    while (x !== null) {
      result.push(x.value)
      x = x.forward[0]!
    }
    return result
  }

  contains(value: T): boolean {
    return this.has(value)
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  select(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds for size ${this._size}`)
    }
    return this.at(index)!
  }

  ceiling(value: T): T | undefined {
    let x = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && this.compare(x.forward[i]!.value, value) < 0) {
        x = x.forward[i]!
      }
    }
    const next = x.forward[0]
    return next ? next.value : undefined
  }

  floor(value: T): T | undefined {
    let x = this.head
    let result: T | undefined
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && this.compare(x.forward[i]!.value, value) <= 0) {
        x = x.forward[i]!
      }
    }
    if (x !== this.head) {
      result = x.value
    }
    return result !== null ? result : undefined
  }

  rangeCount(min: T, max: T): number {
    let count = 0
    let x = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && this.compare(x.forward[i]!.value, min) < 0) {
        x = x.forward[i]!
      }
    }
    x = x.forward[0]!
    while (x !== null && this.compare(x.value, max) <= 0) {
      count++
      x = x.forward[0]!
    }
    return count
  }

  rangeToArray(min: T, max: T): T[] {
    const result: T[] = []
    let x = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.forward[i] !== null && this.compare(x.forward[i]!.value, min) < 0) {
        x = x.forward[i]!
      }
    }
    x = x.forward[0]!
    while (x !== null && this.compare(x.value, max) <= 0) {
      result.push(x.value)
      x = x.forward[0]!
    }
    return result
  }

  static fromArray<U>(arr: U[], compare?: (a: U, b: U) => number): SortedSet<U> {
    const set = new SortedSet<U>(compare)
    for (const item of arr) {
      set.add(item)
    }
    return set
  }

  private randomLevel(): number {
    let lvl = 1
    while (Math.random() < this.P && lvl < this.MAX_LEVEL) {
      lvl++
    }
    return lvl
  }

  [Symbol.iterator](): Iterator<T> {
    let x = this.head.forward[0]!
    return {
      next() {
        if (x !== null) {
          const { value } = x
          x = x.forward[0]!
          return { done: false, value }
        }
        return { done: true, value: undefined as unknown as T }
      },
    }
  }
}