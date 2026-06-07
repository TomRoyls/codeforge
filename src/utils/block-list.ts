export class BlockList<T> {
  private blocks: T[][] = []
  private blockSize: number
  private count = 0

  constructor(blockSize: number = 64) {
    this.blockSize = blockSize
  }

  get size(): number {
    return this.count
  }

  get isEmpty(): boolean {
    return this.count === 0
  }

  pushBack(value: T): void {
    if (this.blocks.length === 0 || this.blocks[this.blocks.length - 1]!.length >= this.blockSize) {
      this.blocks.push([])
    }
    this.blocks[this.blocks.length - 1]!.push(value)
    this.count++
  }

  pushFront(value: T): void {
    if (this.blocks.length === 0 || this.blocks[0]!.length >= this.blockSize) {
      this.blocks.unshift([value])
    } else {
      this.blocks[0]!.unshift(value)
    }
    this.count++
  }

  popBack(): T | undefined {
    if (this.count === 0) return undefined
    const last = this.blocks[this.blocks.length - 1]!
    const value = last.pop()!
    this.count--
    if (last.length === 0) this.blocks.pop()
    return value
  }

  popFront(): T | undefined {
    if (this.count === 0) return undefined
    const first = this.blocks[0]!
    const value = first.shift()!
    this.count--
    if (first.length === 0) this.blocks.shift()
    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) return undefined
    let remaining = index
    for (const block of this.blocks) {
      if (remaining < block.length) return block[remaining]
      remaining -= block.length
    }
    return undefined
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this.count) return false
    let remaining = index
    for (const block of this.blocks) {
      if (remaining < block.length) {
        block[remaining] = value
        return true
      }
      remaining -= block.length
    }
    return false
  }

  toArray(): T[] {
    const result: T[] = []
    for (const block of this.blocks) result.push(...block)
    return result
  }

  static from<T>(items: T[], blockSize: number = 64): BlockList<T> {
    const bl = new BlockList<T>(blockSize)
    for (const item of items) bl.pushBack(item)
    return bl
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const block of this.blocks) yield* block
  }

  toString(): string {
    return `[${this.toArray().map(v => String(v)).join(', ')}]`
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): this {
    return BlockList.from(this.toArray(), this.blockSize) as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BlockList)) return false
    if (this.count !== other.count) return false
    if (this.blockSize !== other.blockSize) return false
    const a = this.toArray()
    const b = other.toArray()
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false
    }
    return true
  }
}
