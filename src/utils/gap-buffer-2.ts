export class GapBuffer2 {
  private buffer: string[]
  private gapStart: number
  private gapEnd: number
  private capacity: number

  constructor(initialText = '', capacity = 32) {
    this.capacity = Math.max(capacity, initialText.length + 1)
    this.buffer = new Array(this.capacity).fill('')
    const chars = initialText.split('')
    for (let i = 0; i < chars.length; i++) this.buffer[i] = chars[i]
    this.gapStart = chars.length
    this.gapEnd = this.capacity
  }

  private gapSize(): number { return this.gapEnd - this.gapStart }

  private moveGap(pos: number): void {
    if (pos === this.gapStart) return
    if (pos < this.gapStart) {
      const move = this.gapStart - pos
      for (let i = 0; i < move; i++) {
        this.buffer[this.gapEnd - 1 - i] = this.buffer[this.gapStart - 1 - i]
      }
      this.gapStart -= move
      this.gapEnd -= move
    } else {
      const move = pos - this.gapStart
      for (let i = 0; i < move; i++) {
        this.buffer[this.gapStart + i] = this.buffer[this.gapEnd + i]
      }
      this.gapStart += move
      this.gapEnd += move
    }
  }

  insert(at: number, text: string): void {
    this.moveGap(at)
    for (const char of text) {
      if (this.gapSize() === 0) this.expand()
      this.buffer[this.gapStart] = char
      this.gapStart++
    }
  }

  private expand(): void {
    const beforeGap: string[] = []
    const afterGap: string[] = []
    for (let i = 0; i < this.gapStart; i++) beforeGap.push(this.buffer[i])
    for (let i = this.gapEnd; i < this.capacity; i++) afterGap.push(this.buffer[i])
    this.capacity *= 2
    this.buffer = new Array(this.capacity).fill('')
    let idx = 0
    for (const c of beforeGap) this.buffer[idx++] = c
    this.gapStart = beforeGap.length
    idx = this.capacity - afterGap.length
    for (const c of afterGap) this.buffer[idx++] = c
    this.gapEnd = this.capacity - afterGap.length
  }

  delete(at: number, length: number): void {
    this.moveGap(at)
    this.gapEnd += Math.min(length, this.capacity - this.gapEnd)
  }

  getText(): string {
    let result = ''
    for (let i = 0; i < this.gapStart; i++) result += this.buffer[i]
    for (let i = this.gapEnd; i < this.capacity; i++) result += this.buffer[i]
    return result
  }

  get length(): number { return this.capacity - this.gapSize() }
  get isEmpty(): boolean { return this.length === 0 }

  clear(): void {
    this.gapStart = 0
    this.gapEnd = this.capacity
  }

  toArray(): string[] { return this.getText().split('') }
  toString(): string { return JSON.stringify({ length: this.length, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { length: this.length, capacity: this.capacity } }

  clone(): GapBuffer2 {
    return new GapBuffer2(this.getText(), this.capacity)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof GapBuffer2)) return false
    return this.length === other.length
  }
}
