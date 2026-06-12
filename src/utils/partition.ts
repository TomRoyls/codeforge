export class Partition<T> {
  private groups: T[][] = []

  constructor(items: T[], partitionFn: (item: T) => number) {
    const map = new Map<number, T[]>()
    for (const item of items) {
      const key = partitionFn(item)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    this.groups = Array.from(map.values())
  }

  get count(): number {
    return this.groups.length
  }

  get sizes(): number[] {
    return this.groups.map((g) => g.length)
  }

  get largest(): T[] {
    return this.groups.reduce((a, b) => (a.length >= b.length ? a : b), [])
  }

  get smallest(): T[] {
    if (this.groups.length === 0) return []
    return this.groups.reduce((a, b) => (a.length <= b.length ? a : b))
  }

  at(index: number): T[] {
    return [...(this.groups[index] ?? [])]
  }

  forEach(callback: (group: T[], index: number) => void): void {
    this.groups.forEach(callback)
  }

  flat(): T[] {
    return this.groups.flat()
  }

  toArray(): T[][] {
    return this.groups.map((g) => [...g])
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): T[][] {
    return this.toArray()
  }

  clone(): Partition<T> {
    const copy = Object.create(Partition.prototype) as Partition<T>
    copy.groups = this.groups.map((g) => [...g])
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Partition)) return false
    if (this.count !== other.count) return false
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i]!.length !== other.groups[i]!.length) return false
    }
    return true
  }
}
