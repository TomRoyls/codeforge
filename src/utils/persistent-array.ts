export class PersistentArray<T> {
  private readonly data: T[]
  private readonly changed: Map<number, T>

  private constructor(data: T[], changed: Map<number, T>) {
    this.data = data
    this.changed = changed
  }

  static from<T>(items: T[]): PersistentArray<T> {
    return new PersistentArray([...items], new Map())
  }

  static create<T>(size: number, defaultValue: T): PersistentArray<T> {
    return new PersistentArray(new Array(size).fill(defaultValue), new Map())
  }

  get(index: number): T | undefined {
    if (this.changed.has(index)) return this.changed.get(index)
    return this.data[index]
  }

  set(index: number, value: T): PersistentArray<T> {
    const newChanged = new Map(this.changed)
    newChanged.set(index, value)
    return new PersistentArray(this.data, newChanged)
  }

  get length(): number {
    return this.data.length
  }

  toArray(): T[] {
    const result = [...this.data]
    for (const [k, v] of this.changed) result[k] = v
    return result
  }

  map<U>(fn: (value: T, index: number) => U): PersistentArray<U> {
    return PersistentArray.from(this.toArray().map(fn))
  }

  filter(fn: (value: T, index: number) => boolean): PersistentArray<T> {
    return PersistentArray.from(this.toArray().filter(fn))
  }

  reduce<U>(fn: (acc: U, value: T, index: number) => U, initial: U): U {
    return this.toArray().reduce(fn, initial)
  }

  push(value: T): PersistentArray<T> {
    const arr = this.toArray()
    arr.push(value)
    return PersistentArray.from(arr)
  }
}
