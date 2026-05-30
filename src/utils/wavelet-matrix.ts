export class WaveletMatrix {
  private readonly levels: { bits: Uint8Array; zeros: number }[]
  private readonly _length: number
  private readonly _maxValue: number
  private readonly bitWidth: number

  constructor(data: number[]) {
    this._length = data.length
    if (this._length === 0) {
      this._maxValue = 0
      this.bitWidth = 0
      this.levels = []
      return
    }
    this._maxValue = data.reduce((a, b) => Math.max(a, b), 0)
    this.bitWidth = this._maxValue === 0 ? 1 : Math.floor(Math.log2(this._maxValue)) + 1
    this.levels = []
    let current = data.slice()
    for (let level = 0; level < this.bitWidth; level++) {
      const bitPos = this.bitWidth - 1 - level
      const bits = new Uint8Array(this._length)
      const zeros: number[] = []
      const ones: number[] = []
      for (let i = 0; i < this._length; i++) {
        const bit = (current[i]! >>> bitPos) & 1
        bits[i] = bit
        if (bit === 0) zeros.push(current[i]!)
        else ones.push(current[i]!)
      }
      this.levels.push({ bits, zeros: zeros.length })
      current = [...zeros, ...ones]
    }
  }

  access(index: number): number {
    if (index < 0 || index >= this._length) return -1
    let pos = index
    let value = 0
    for (let level = 0; level < this.bitWidth; level++) {
      const { bits, zeros } = this.levels[level]!
      const bit = bits[pos]!
      value = (value << 1) | bit
      if (bit === 0) {
        pos = this.rank0(level, pos) - 1
      } else {
        pos = zeros + this.rank1(level, pos) - 1
      }
    }
    return value
  }

  rank(value: number, index: number): number {
    if (value < 0 || index < 0 || index >= this._length) return 0
    if (value > this._maxValue) return 0
    let lo = 0
    let hi = index + 1
    for (let level = 0; level < this.bitWidth; level++) {
      const bitPos = this.bitWidth - 1 - level
      const bit = (value >>> bitPos) & 1
      const { zeros } = this.levels[level]!
      if (bit === 0) {
        hi = this.rank0(level, hi - 1)
        lo = this.rank0(level, lo - 1)
      } else {
        hi = zeros + this.rank1(level, hi - 1)
        lo = zeros + this.rank1(level, lo - 1)
      }
    }
    return hi - lo
  }

  quantile(k: number, left: number, right: number): number {
    if (k < 0 || left < 0 || right >= this._length || left > right) return -1
    if (k > right - left) return -1
    let lo = left
    let hi = right + 1
    let value = 0
    for (let level = 0; level < this.bitWidth; level++) {
      const { bits, zeros } = this.levels[level]!
      const countZeros = this._rankBits(bits, 0, lo, hi)
      value <<= 1
      if (k < countZeros) {
        lo = this.rank0(level, lo - 1)
        hi = this.rank0(level, hi - 1)
      } else {
        k -= countZeros
        value |= 1
        lo = zeros + this.rank1(level, lo - 1)
        hi = zeros + this.rank1(level, hi - 1)
      }
    }
    return value
  }

  rangeCount(value: number, left: number, right: number): number {
    return this.rank(value, right) - (left > 0 ? this.rank(value, left - 1) : 0)
  }

  get length(): number {
    return this._length
  }

  get maxValue(): number {
    return this._maxValue
  }

  private rank0(level: number, index: number): number {
    if (index < 0) return 0
    const { bits } = this.levels[level]!
    let count = 0
    for (let i = 0; i <= index && i < bits.length; i++) {
      if (bits[i] === 0) count++
    }
    return count
  }

  private rank1(level: number, index: number): number {
    if (index < 0) return 0
    const { bits } = this.levels[level]!
    let count = 0
    for (let i = 0; i <= index && i < bits.length; i++) {
      if (bits[i] === 1) count++
    }
    return count
  }

  private _rankBits(bits: Uint8Array, target: number, lo: number, hi: number): number {
    let count = 0
    for (let i = lo; i < hi && i < bits.length; i++) {
      if (bits[i] === target) count++
    }
    return count
  }
}
