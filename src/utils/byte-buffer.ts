export class ByteBuffer {
  private buffer: number[]
  private readPos = 0

  constructor(_initialCapacity = 1024) {
    this.buffer = []
  }

  writeByte(value: number): void {
    this.buffer.push(value & 0xFF)
  }

  writeShort(value: number): void {
    this.buffer.push((value >> 8) & 0xFF)
    this.buffer.push(value & 0xFF)
  }

  writeInt(value: number): void {
    this.buffer.push((value >> 24) & 0xFF)
    this.buffer.push((value >> 16) & 0xFF)
    this.buffer.push((value >> 8) & 0xFF)
    this.buffer.push(value & 0xFF)
  }

  readByte(): number | undefined {
    if (this.readPos >= this.buffer.length) return undefined
    return this.buffer[this.readPos++]! & 0xFF
  }

  readShort(): number | undefined {
    const high = this.readByte()
    const low = this.readByte()
    if (high === undefined || low === undefined) return undefined
    return (high << 8) | low
  }

  readInt(): number | undefined {
    const b3 = this.readByte()
    const b2 = this.readByte()
    const b1 = this.readByte()
    const b0 = this.readByte()
    if (b3 === undefined || b2 === undefined || b1 === undefined || b0 === undefined) return undefined
    return (b3 << 24) | (b2 << 16) | (b1 << 8) | b0
  }

  get length(): number {
    return this.buffer.length
  }

  get remaining(): number {
    return this.buffer.length - this.readPos
  }

  get isEmpty(): boolean {
    return this.remaining === 0
  }

  get position(): number {
    return this.readPos
  }

  reset(): void {
    this.readPos = 0
  }

  clear(): void {
    this.buffer = []
    this.readPos = 0
  }

  toArray(): number[] {
    return [...this.buffer]
  }

  toString(): string {
    return JSON.stringify({ length: this.buffer.length, readPos: this.readPos })
  }

  toJSON(): Record<string, number> {
    return { length: this.buffer.length, readPos: this.readPos, remaining: this.remaining }
  }

  clone(): ByteBuffer {
    const copy = new ByteBuffer(0)
    copy.buffer = [...this.buffer]
    copy.readPos = this.readPos
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ByteBuffer)) return false
    return this.length === other.length
  }
}
