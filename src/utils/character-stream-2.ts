export class CharacterStream2 {
  private data: string
  private pos = 0
  private marks: number[] = []

  constructor(data: string) {
    this.data = data
  }

  peek(offset = 0): string {
    const idx = this.pos + offset
    if (idx >= this.data.length) return ''
    return this.data[idx]
  }

  next(): string {
    if (this.pos >= this.data.length) return ''
    return this.data[this.pos++]
  }

  advance(n: number): string {
    const start = this.pos
    this.pos = Math.min(this.pos + n, this.data.length)
    return this.data.slice(start, this.pos)
  }

  hasNext(): boolean {
    return this.pos < this.data.length
  }

  getPosition(): number {
    return this.pos
  }

  setPosition(pos: number): void {
    this.pos = Math.max(0, Math.min(pos, this.data.length))
  }

  remaining(): number {
    return this.data.length - this.pos
  }

  length(): number {
    return this.data.length
  }

  isAt(char: string): boolean {
    return this.peek() === char
  }

  isAtDigit(): boolean {
    const c = this.peek()
    return c >= '0' && c <= '9'
  }

  isAtAlpha(): boolean {
    const c = this.peek()
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
  }

  isAtWhitespace(): boolean {
    const c = this.peek()
    return c === ' ' || c === '\t' || c === '\n' || c === '\r'
  }

  skipWhitespace(): number {
    let count = 0
    while (this.hasNext() && this.isAtWhitespace()) {
      this.next()
      count++
    }
    return count
  }

  readUntil(chars: string): string {
    let result = ''
    while (this.hasNext() && !chars.includes(this.peek())) {
      result += this.next()
    }
    return result
  }

  readWhile(predicate: (c: string) => boolean): string {
    let result = ''
    while (this.hasNext() && predicate(this.peek())) {
      result += this.next()
    }
    return result
  }

  markStart(): void {
    this.marks.push(this.pos)
  }

  markReset(): string {
    const mark = this.marks.pop()
    if (mark === undefined) return ''
    const result = this.data.slice(mark, this.pos)
    this.pos = mark
    return result
  }

  markCommit(): string {
    const mark = this.marks.pop()
    if (mark === undefined) return ''
    return this.data.slice(mark, this.pos)
  }

  reset(): void {
    this.pos = 0
    this.marks = []
  }

  getData(): string {
    return this.data
  }

  slice(start: number, end?: number): string {
    return this.data.slice(start, end)
  }

  toArray(): string[] { return this.data.split('') }
  toString(): string { return this.data.slice(this.pos) }
  toJSON(): Record<string, unknown> { return { pos: this.pos, length: this.data.length } }
  clone(): CharacterStream2 {
    const cs = new CharacterStream2(this.data)
    cs.pos = this.pos
    cs.marks = [...this.marks]
    return cs
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CharacterStream2)) return false
    return this.data === other.data && this.pos === other.pos
  }
  clear(): void { this.data = ''; this.pos = 0; this.marks = [] }
}
