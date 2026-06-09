export class CartesianProduct2<T> {
  private sets: T[][]

  constructor(sets: T[][]) {
    this.sets = sets
  }

  at(index: number): T[] | undefined {
    if (index < 0 || index >= this.size()) {
      return undefined
    }
    const result: T[] = []
    let remaining = index
    const n = this.sets.length

    for (let i = 0; i < n; i++) {
      const setSize = this.sets[i]!.length
      const pos = remaining % setSize
      result.push(this.sets[i]![pos]!)
      remaining = Math.floor(remaining / setSize)
    }

    return result
  }

  indexOf(element: T[]): number {
    if (element.length !== this.sets.length) {
      return -1
    }

    let index = 0
    let multiplier = 1

    for (let i = 0; i < this.sets.length; i++) {
      const pos = this.sets[i]!.indexOf(element[i]!)
      if (pos === -1) {
        return -1
      }
      index += pos * multiplier
      multiplier *= this.sets[i]!.length
    }

    return index
  }

  size(): number {
    if (this.sets.length === 0) {
      return 0
    }
    let result = 1
    for (let i = 0; i < this.sets.length; i++) {
      result *= this.sets[i]!.length
      if (result === 0) {
        return 0
      }
    }
    return result
  }

  has(element: T[]): boolean {
    return this.indexOf(element) !== -1
  }

  dimensions(): number {
    return this.sets.length
  }

  toArray(): T[][] {
    const result: T[][] = []
    const size = this.size()

    for (let i = 0; i < size; i++) {
      result.push(this.at(i)!)
    }

    return result
  }

  forEach(callback: (element: T[], index: number) => void): void {
    const size = this.size()

    for (let i = 0; i < size; i++) {
      callback(this.at(i)!, i)
    }
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

  isEmpty(): boolean {
    return this.size() === 0
  }

  toString(): string {
    return `${CartesianProduct2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'CartesianProduct2', items: this.toArray() }
  }
}
