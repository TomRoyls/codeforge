export class SkipListSet {
  private maxLevel: number
  private level = 1
  private head: { value: number | null; forward: Array<{ value: number | null; forward: any[] } | null> }

  constructor(maxLevel = 16) {
    this.maxLevel = maxLevel
    this.head = { value: null, forward: new Array(maxLevel).fill(null) }
  }

  private randomLevel(): number {
    let lvl = 1
    while (Math.random() < 0.5 && lvl < this.maxLevel) lvl++
    return lvl
  }

  add(value: number): void {
    const update: any[] = new Array(this.maxLevel).fill(null)
    let current = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i]!.value! < value) {
        current = current.forward[i]!
      }
      update[i] = current
    }
    current = current.forward[0]!
    if (current !== null && current.value === value) return
    const newLevel = this.randomLevel()
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) update[i] = this.head
      this.level = newLevel
    }
    const newNode = { value, forward: new Array(newLevel).fill(null) }
    for (let i = 0; i < newLevel; i++) {
      newNode.forward[i] = update[i]!.forward[i]
      update[i]!.forward[i] = newNode
    }
  }

  has(value: number): boolean {
    let current = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i]!.value! < value) {
        current = current.forward[i]!
      }
    }
    current = current.forward[0]!
    return current !== null && current.value === value
  }

  get isEmpty(): boolean { return this.head.forward[0] === null }

  toArray(): number[] {
    const result: number[] = []
    let current = this.head.forward[0]
    while (current !== null) {
      result.push(current.value!)
      current = current.forward[0]
    }
    return result
  }

  toString(): string { return JSON.stringify({ level: this.level, maxLevel: this.maxLevel }) }
  toJSON(): Record<string, number> { return { level: this.level, maxLevel: this.maxLevel } }

  clear(): void {
    this.head = { value: null, forward: new Array(this.maxLevel).fill(null) }
    this.level = 1
  }

  clone(): SkipListSet { return new SkipListSet(this.maxLevel) }

  equals(other: unknown): boolean {
    if (!(other instanceof SkipListSet)) return false
    return this.maxLevel === other.maxLevel
  }
}
