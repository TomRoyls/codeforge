export class BitBuffer {
  private buffer: number[]
  private bitPosition = 0

  constructor(initialSize = 256) {
    this.buffer = new Array(Math.ceil(initialSize / 8)).fill(0)
  }

  writeBit(value: 0 | 1): void {
    this.ensureCapacity(this.bitPosition + 1)
    const byteIndex = Math.floor(this.bitPosition / 8)
    const bitIndex = 7 - (this.bitPosition % 8)
    if (value) {
      this.buffer[byteIndex]! |= (1 << bitIndex)
    } else {
      this.buffer[byteIndex]! &= ~(1 << bitIndex)
    }
    this.bitPosition++
  }

  readBit(position: number): 0 | 1 {
    const byteIndex = Math.floor(position / 8)
    const bitIndex = 7 - (position % 8)
    if (byteIndex >= this.buffer.length) return 0
    return ((this.buffer[byteIndex]! >> bitIndex) & 1) as 0 | 1
  }

  writeBits(value: number, count: number): void {
    for (let i = count - 1; i >= 0; i--) {
      this.writeBit(((value >> i) & 1) as 0 | 1)
    }
  }

  readBits(position: number, count: number): number {
    let result = 0
    for (let i = 0; i < count; i++) {
      result = (result << 1) | this.readBit(position + i)
    }
    return result
  }

  get length(): number {
    return this.bitPosition
  }

  get byteLength(): number {
    return Math.ceil(this.bitPosition / 8)
  }

  get capacity(): number {
    return this.buffer.length * 8
  }

  seek(position: number): void {
    if (position < 0) throw new RangeError('position must be >= 0')
    this.bitPosition = position
  }

  toBuffer(): number[] {
    return [...this.buffer.slice(0, this.byteLength)]
  }

  static fromBuffer(data: number[]): BitBuffer {
    const bb = new BitBuffer(data.length * 8)
    bb.buffer = [...data]
    bb.bitPosition = data.length * 8
    return bb
  }

  clear(): void {
    this.buffer.fill(0)
    this.bitPosition = 0
  }

  toString(): string {
    let s = ''
    for (let i = 0; i < this.bitPosition; i++) {
      s += this.readBit(i)
    }
    return s
  }

  toJSON(): { buffer: number[]; bitLength: number } {
    return { buffer: this.toBuffer(), bitLength: this.bitPosition }
  }

  clone(): BitBuffer {
    const copy = new BitBuffer(this.capacity)
    copy.buffer = [...this.buffer]
    copy.bitPosition = this.bitPosition
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BitBuffer)) return false
    if (this.bitPosition !== other.bitPosition) return false
    for (let i = 0; i < this.bitPosition; i++) {
      if (this.readBit(i) !== other.readBit(i)) return false
    }
    return true
  }

  private ensureCapacity(bits: number): void {
    const needed = Math.ceil(bits / 8)
    while (this.buffer.length < needed) {
      this.buffer.push(0)
    }
  }
}
