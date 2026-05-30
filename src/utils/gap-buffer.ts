export class GapBuffer<T> {
  private buffer: (T | undefined)[]
  private gapStart: number
  private gapEnd: number
  private _size: number

  constructor(initialCapacity: number = 32) {
    this.buffer = new Array(initialCapacity).fill(undefined)
    this.gapStart = 0
    this.gapEnd = initialCapacity
    this._size = 0
  }

  insert(item: T): void {
    if (this.gapStart === this.gapEnd) {
      this.grow()
    }
    this.buffer[this.gapStart] = item
    this.gapStart++
    this._size++
  }

  insertAt(index: number, item: T): void {
    this.moveGapTo(index)
    if (this.gapStart === this.gapEnd) {
      this.grow()
    }
    this.buffer[this.gapStart] = item
    this.gapStart++
    this._size++
  }

  delete(): T | undefined {
    if (this.gapStart === 0) return undefined
    this.gapStart--
    const item = this.buffer[this.gapStart]
    this.buffer[this.gapStart] = undefined
    this._size--
    return item
  }

  deleteAt(index: number): T | undefined {
    this.moveGapTo(index + 1)
    return this.delete()
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    if (index < this.gapStart) {
      return this.buffer[index]
    }
    return this.buffer[index + (this.gapEnd - this.gapStart)]
  }

  set(index: number, item: T): boolean {
    if (index < 0 || index >= this._size) return false
    if (index < this.gapStart) {
      this.buffer[index] = item
    } else {
      this.buffer[index + (this.gapEnd - this.gapStart)] = item
    }
    return true
  }

  cursor(): number {
    return this.gapStart
  }

  moveCursor(position: number): void {
    const clamped = Math.max(0, Math.min(position, this._size))
    this.moveGapTo(clamped)
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.gapStart; i++) {
      result.push(this.buffer[i]!)
    }
    for (let i = this.gapEnd; i < this.buffer.length; i++) {
      if (this.buffer[i] !== undefined) {
        result.push(this.buffer[i]!)
      }
    }
    return result
  }

  get length(): number {
    return this._size
  }

  get capacity(): number {
    return this.buffer.length
  }

  get gapSize(): number {
    return this.gapEnd - this.gapStart
  }

  private moveGapTo(position: number): void {
    if (position === this.gapStart) return
    if (position < this.gapStart) {
      const count = this.gapStart - position
      for (let i = 0; i < count; i++) {
        this.gapStart--
        this.gapEnd--
        this.buffer[this.gapEnd] = this.buffer[this.gapStart]
        this.buffer[this.gapStart] = undefined
      }
    } else {
      const count = position - this.gapStart
      for (let i = 0; i < count; i++) {
        this.buffer[this.gapStart] = this.buffer[this.gapEnd]
        this.buffer[this.gapEnd] = undefined
        this.gapStart++
        this.gapEnd++
      }
    }
  }

  private grow(): void {
    const oldBuffer = this.buffer
    const newCapacity = oldBuffer.length * 2
    const afterGap = oldBuffer.length - this.gapEnd
    this.buffer = new Array(newCapacity).fill(undefined)
    for (let i = 0; i < this.gapStart; i++) {
      this.buffer[i] = oldBuffer[i]
    }
    const newGapEnd = newCapacity - afterGap
    for (let i = this.gapEnd; i < oldBuffer.length; i++) {
      this.buffer[newGapEnd + (i - this.gapEnd)] = oldBuffer[i]
    }
    this.gapEnd = newGapEnd
  }
}
