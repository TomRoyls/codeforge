import type { ZipperListOptions, ZipperListStats } from './types.js'

export class ZipperList<T = unknown> {
  private _left: T[]
  private _right: T[]

  constructor(options?: ZipperListOptions<T>) {
    const values = options?.initialValues ?? []
    this._left = []
    this._right = [...values]
  }

  static from<T>(items: T[]): ZipperList<T> {
    return new ZipperList<T>({ initialValues: items })
  }

  private _copy(left: T[], right: T[]): ZipperList<T> {
    const z = new ZipperList<T>()
    ;(z as unknown as { _left: T[] })._left = left
    ;(z as unknown as { _right: T[] })._right = right
    return z
  }

  focus(): T | undefined {
    return this._right.length > 0 ? this._right[0] : undefined
  }

  forward(): ZipperList<T> {
    if (this._right.length <= 1) {
      return this._copy([...this._left], [...this._right])
    }
    const newLeft = [this._right[0]!, ...this._left]
    const newRight = this._right.slice(1)
    return this._copy(newLeft, newRight)
  }

  backward(): ZipperList<T> {
    if (this._left.length === 0) {
      return this._copy([...this._left], [...this._right])
    }
    const newRight = [this._left[0]!, ...this._right]
    const newLeft = this._left.slice(1)
    return this._copy(newLeft, newRight)
  }

  insert(value: T): ZipperList<T> {
    const newRight = [value, ...this._right]
    return this._copy([...this._left], newRight)
  }

  delete(): ZipperList<T> {
    if (this._right.length === 0) {
      return this._copy([...this._left], [...this._right])
    }
    const newRight = this._right.slice(1)
    return this._copy([...this._left], newRight)
  }

  replace(value: T): ZipperList<T> {
    if (this._right.length === 0) {
      return this._copy([...this._left], [...this._right])
    }
    const newRight = [value, ...this._right.slice(1)]
    return this._copy([...this._left], newRight)
  }

  get isFirst(): boolean {
    return this._left.length === 0
  }

  get isLast(): boolean {
    return this._right.length <= 1
  }

  toList(): T[] {
    return [...this._left.slice().reverse(), ...this._right]
  }

  getLeft(): T[] {
    return this._left.slice().reverse()
  }

  getRight(): T[] {
    return this._right.slice()
  }

  get length(): number {
    return this._left.length + this._right.length
  }

  get isEmpty(): boolean {
    return this._left.length === 0 && this._right.length === 0
  }

  goForward(n: number): ZipperList<T> {
    let current: ZipperList<T> = this
    for (let i = 0; i < n && !current.isLast; i++) {
      current = current.forward()
    }
    return current
  }

  goBackward(n: number): ZipperList<T> {
    let current: ZipperList<T> = this
    for (let i = 0; i < n && current._left.length > 0; i++) {
      current = current.backward()
    }
    return current
  }

  goToStart(): ZipperList<T> {
    if (this._left.length === 0) {
      return this._copy([...this._left], [...this._right])
    }
    const newRight = [...this._left.slice().reverse(), ...this._right]
    return this._copy([], newRight)
  }

  goToEnd(): ZipperList<T> {
    if (this._right.length <= 1) {
      return this._copy([...this._left], [...this._right])
    }
    const last = this._right[this._right.length - 1]!
    const newLeft = [...this._right.slice(0, -1).reverse(), ...this._left]
    return this._copy(newLeft, [last])
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    const list = this.toList()
    for (let i = 0; i < list.length; i++) {
      if (predicate(list[i]!, i)) {
        return list[i]!
      }
    }
    return undefined
  }

  forEach(callback: (value: T, index: number) => void): void {
    const list = this.toList()
    for (let i = 0; i < list.length; i++) {
      callback(list[i]!, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U): ZipperList<U> {
    const list = this.toList()
    const mapped: U[] = []
    for (let i = 0; i < list.length; i++) {
      mapped.push(callback(list[i]!, i))
    }
    return ZipperList.from(mapped)
  }

  filter(predicate: (value: T, index: number) => boolean): ZipperList<T> {
    const list = this.toList()
    const filtered: T[] = []
    for (let i = 0; i < list.length; i++) {
      if (predicate(list[i]!, i)) {
        filtered.push(list[i]!)
      }
    }
    return ZipperList.from(filtered)
  }

  getStats(): ZipperListStats {
    return {
      length: this.length,
      position: this._left.length,
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const list = this.toList()
    for (const item of list) {
      yield item
    }
  }
}

export type { ZipperListOptions, ZipperListStats } from './types.js'
