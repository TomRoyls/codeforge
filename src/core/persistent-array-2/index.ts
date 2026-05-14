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
}
