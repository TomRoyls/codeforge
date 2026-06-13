export class Rope2 {
  private left: Rope2 | null = null
  private right: Rope2 | null = null
  private data: string = ''
  private _length: number = 0
  private readonly maxLeafSize: number

  constructor(data: string = '', maxLeafSize = 8) {
    this.maxLeafSize = maxLeafSize
    if (data.length <= maxLeafSize) {
      this.data = data
      this._length = data.length
    } else {
      const mid = Math.floor(data.length / 2)
      this.left = new Rope2(data.slice(0, mid), maxLeafSize)
      this.right = new Rope2(data.slice(mid), maxLeafSize)
      this._length = data.length
    }
  }

  isLeaf(): boolean {
    return this.left === null && this.right === null
  }

  length(): number {
    return this._length
  }

  toString(): string {
    if (this.isLeaf()) return this.data
    return (this.left?.toString() ?? '') + (this.right?.toString() ?? '')
  }

  charAt(index: number): string {
    if (index < 0 || index >= this._length) return ''
    if (this.isLeaf()) return this.data[index] ?? ''

    const leftLen = this.left?._length ?? 0
    if (index < leftLen) {
      return this.left!.charAt(index)
    }
    return this.right!.charAt(index - leftLen)
  }

  concat(other: Rope2): Rope2 {
    const result = new Rope2('', this.maxLeafSize)
    result.left = this
    result.right = other
    result._length = this._length + other._length
    return result
  }

  split(index: number): [Rope2, Rope2] {
    if (this.isLeaf()) {
      return [
        new Rope2(this.data.slice(0, index), this.maxLeafSize),
        new Rope2(this.data.slice(index), this.maxLeafSize),
      ]
    }

    const leftLen = this.left?._length ?? 0
    if (index === leftLen) {
      return [this.left!, this.right!]
    }

    if (index < leftLen) {
      const [l, r] = this.left!.split(index)
      return [l, r.concat(this.right!)]
    }

    const [l, r] = this.right!.split(index - leftLen)
    return [this.left!.concat(l), r]
  }

  insert(index: number, text: string): Rope2 {
    const insertRope = new Rope2(text, this.maxLeafSize)
    const [left, right] = this.split(index)
    return left.concat(insertRope).concat(right)
  }

  delete(start: number, end: number): Rope2 {
    const [left, _] = this.split(start)
    const [__, right] = this.split(end)
    return left.concat(right)
  }

  substring(start: number, end?: number): string {
    const e = end ?? this._length
    let result = ''
    for (let i = start; i < e && i < this._length; i++) {
      result += this.charAt(i)
    }
    return result
  }

  indexOf(str: string, fromIndex = 0): number {
    const full = this.toString()
    return full.indexOf(str, fromIndex)
  }

  depth(): number {
    if (this.isLeaf()) return 0
    return 1 + Math.max(this.left?.depth() ?? 0, this.right?.depth() ?? 0)
  }

  leafCount(): number {
    if (this.isLeaf()) return 1
    return (this.left?.leafCount() ?? 0) + (this.right?.leafCount() ?? 0)
  }

  toArray(): string[] {
    return this.toString().split('')
  }
  toJSON(): Record<string, unknown> {
    return { length: this._length, depth: this.depth(), leaves: this.leafCount() }
  }
  clone(): Rope2 {
    return new Rope2(this.toString(), this.maxLeafSize)
  }
  equals(other: unknown): boolean {
    if (!(other instanceof Rope2)) return false
    return this.toString() === other.toString()
  }
  clear(): void {
    this.left = null
    this.right = null
    this.data = ''
    this._length = 0
  }
}
