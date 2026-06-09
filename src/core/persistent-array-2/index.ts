export class PersistentArray2<T> {
  constructor(private items: T[] = []) {}

  get(index: number): T | undefined {
    return this.items[index]
  }

  set(index: number, value: T): PersistentArray2<T> {
    const newItems: T[] = []
    for (let i = 0; i < this.items.length; i++) {
      newItems[i] = this.items[i]!
    }
    newItems[index] = value
    return new PersistentArray2(newItems)
  }

  push(value: T): PersistentArray2<T> {
    const newItems: T[] = []
    for (let i = 0; i < this.items.length; i++) {
      newItems[i] = this.items[i]!
    }
    newItems[this.items.length] = value
    return new PersistentArray2(newItems)
  }

  pop(): [T | undefined, PersistentArray2<T>] {
    if (this.items.length === 0) {
      return [undefined, this]
    }
    const newItems: T[] = []
    for (let i = 0; i < this.items.length - 1; i++) {
      newItems[i] = this.items[i]!
    }
    return [this.items[this.items.length - 1]!, new PersistentArray2(newItems)]
  }

  get length(): number {
    return this.items.length
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.items.length; i++) {
      result[i] = this.items[i]!
    }
    return result
  }

  map(fn: (item: T, index: number) => T): PersistentArray2<T> {
    const newItems: T[] = []
    for (let i = 0; i < this.items.length; i++) {
      newItems[i] = fn(this.items[i]!, i)
    }
    return new PersistentArray2(newItems)
  }

  filter(fn: (item: T, index: number) => boolean): PersistentArray2<T> {
    const newItems: T[] = []
    let j = 0
    for (let i = 0; i < this.items.length; i++) {
      if (fn(this.items[i]!, i)) {
        newItems[j] = this.items[i]!
        j++
      }
    }
    return new PersistentArray2(newItems)
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  static from<T>(items: T[]): PersistentArray2<T> {
    return new PersistentArray2<T>(items)
  }

  clone(): PersistentArray2<T> {
    return PersistentArray2.from(this.toArray())
  }

  toString(): string {
    return `PersistentArray2({ size: ${this.items.length} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'PersistentArray2', items: this.toArray() }
  }
}
