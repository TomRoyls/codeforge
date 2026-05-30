export class EliasFano {
  private readonly lowerBits: Uint8Array
  private readonly upperBits: Uint8Array
  private readonly lowerMask: number
  private readonly numLower: number
  private readonly universe: number
  private readonly n: number

  constructor(values: number[]) {
    if (values.length === 0) {
      this.n = 0
      this.universe = 0
      this.numLower = 0
      this.lowerMask = 0
      this.lowerBits = new Uint8Array(0)
      this.upperBits = new Uint8Array(0)
      return
    }

    this.n = values.length
    this.universe = values[values.length - 1]!

    if (this.universe === 0) {
      this.numLower = 0
      this.lowerMask = 0
      this.lowerBits = new Uint8Array(0)
      const upperSize = Math.ceil((this.n + 1) / 8)
      this.upperBits = new Uint8Array(upperSize)
      for (let i = 0; i < this.n; i++) {
        this.setBit(this.upperBits, i)
      }
      return
    }

    this.numLower = Math.max(0, Math.floor(Math.log2(Math.max(1, this.universe / this.n))))
    this.lowerMask = (1 << this.numLower) - 1

    const lowerSize = Math.ceil((this.n * this.numLower) / 8)
    this.lowerBits = new Uint8Array(Math.max(1, lowerSize))

    const upperCount = this.n + Math.floor(this.universe / Math.max(1, 1 << this.numLower)) + 1
    const upperSize = Math.ceil(upperCount / 8)
    this.upperBits = new Uint8Array(Math.max(1, upperSize))

    for (let i = 0; i < this.n; i++) {
      const val = values[i]!
      const lower = val & this.lowerMask
      const upper = val >>> this.numLower

      this.writeLower(i, lower)
      this.setBit(this.upperBits, i + upper)
    }
  }

  static fromSorted(values: number[]): EliasFano {
    return new EliasFano(values)
  }

  get(index: number): number {
    if (index < 0 || index >= this.n) throw new RangeError(`Index ${index} out of bounds`)

    if (this.n === 0) throw new RangeError('Empty encoding')

    if (this.universe === 0) return 0

    const lower = this.readLower(index)
    const upper = this.readUpper(index)
    return (upper << this.numLower) | lower
  }

  get length(): number {
    return this.n
  }

  get encodedSize(): number {
    return this.lowerBits.length + this.upperBits.length
  }

  indexOf(value: number): number {
    if (this.n === 0) return -1
    if (value === 0 && this.universe === 0) return 0

    const upper = value >>> this.numLower
    let pos = this.selectUpper(upper)
    if (pos < 0) return -1

    while (pos < this.n) {
      const val = this.get(pos)
      if (val === value) return pos
      if (val > value) return -1
      pos++
    }
    return -1
  }

  nextGEQ(value: number): number {
    if (this.n === 0) return -1
    if (this.universe === 0) return 0

    const upper = value >>> this.numLower
    let pos = this.selectUpper(upper)
    if (pos < 0) pos = this.n - 1

    while (pos < this.n) {
      if (this.get(pos) >= value) return pos
      pos++
    }
    return -1
  }

  forEach(callback: (value: number, index: number) => void): void {
    for (let i = 0; i < this.n; i++) {
      callback(this.get(i), i)
    }
  }

  toArray(): number[] {
    const result: number[] = []
    this.forEach((v) => result.push(v))
    return result
  }

  private readLower(index: number): number {
    if (this.numLower === 0) return 0
    const bitOffset = index * this.numLower
    const byteOffset = bitOffset >>> 3
    const bitShift = bitOffset & 7
    let val = 0
    let bitsRead = 0
    let bytePos = byteOffset
    let shift = bitShift

    while (bitsRead < this.numLower) {
      const available = 8 - shift
      const needed = this.numLower - bitsRead
      const toRead = Math.min(available, needed)
      const mask = ((1 << toRead) - 1)
      const bits = (this.lowerBits[bytePos]! >>> shift) & mask
      val |= bits << bitsRead
      bitsRead += toRead
      shift = 0
      bytePos++
    }
    return val
  }

  private writeLower(index: number, value: number): void {
    if (this.numLower === 0) return
    const bitOffset = index * this.numLower
    const byteOffset = bitOffset >>> 3
    const bitShift = bitOffset & 7
    let bitsWritten = 0
    let bytePos = byteOffset
    let shift = bitShift

    while (bitsWritten < this.numLower) {
      const available = 8 - shift
      const needed = this.numLower - bitsWritten
      const toWrite = Math.min(available, needed)
      const mask = ((1 << toWrite) - 1)
      const bits = (value >>> bitsWritten) & mask
      this.lowerBits[bytePos] = (this.lowerBits[bytePos]! & ~(mask << shift)) | (bits << shift)
      bitsWritten += toWrite
      shift = 0
      bytePos++
    }
  }

  private readUpper(index: number): number {
    let onesSeen = 0
    for (let bit = 0; bit < this.upperBits.length * 8; bit++) {
      if (this.getBit(this.upperBits, bit)) {
        if (onesSeen === index) {
          return bit - index
        }
        onesSeen++
      }
    }
    return 0
  }

  private selectUpper(upper: number): number {
    let pos = 0
    for (let bit = 0; bit < this.upperBits.length * 8; bit++) {
      if (this.getBit(this.upperBits, bit)) {
        const val = bit - pos
        if (val >= upper) return pos
        pos++
      }
    }
    return -1
  }

  private setBit(arr: Uint8Array, bitIndex: number): void {
    const byteIndex = bitIndex >>> 3
    const bitMask = 1 << (bitIndex & 7)
    if (byteIndex < arr.length) {
      arr[byteIndex] = arr[byteIndex]! | bitMask
    }
  }

  private getBit(arr: Uint8Array, bitIndex: number): boolean {
    const byteIndex = bitIndex >>> 3
    const bitMask = 1 << (bitIndex & 7)
    if (byteIndex >= arr.length) return false
    return (arr[byteIndex]! & bitMask) !== 0
  }
}
