import type { WaveletQueueOptions } from './types.js'
import { increment } from '../../utils/map-helpers.js'

export class WaveletQueue<T extends string | number = number> {
  private buffer: (T | undefined)[]
  private head: number
  private tail: number
  private _size: number
  private _capacity: number
  private readonly rebuildThreshold: number
  private dirty: number
  private freqMap: Map<T, number>
  private alphabetMap: Map<T, number>
  private reverseAlphabet: (T | undefined)[]
  private alphabetCount: number
  private snapshot: T[]
  private bitLevels: { bits: Uint8Array; zeroCount: number }[]
  private bitWidth: number

  constructor(options?: WaveletQueueOptions<T>) {
    this._capacity = 1024
    this.buffer = new Array(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
    this.rebuildThreshold = options?.rebuildThreshold ?? 16
    this.dirty = 0
    this.freqMap = new Map()
    this.alphabetMap = new Map()
    this.reverseAlphabet = []
    this.alphabetCount = 0
    this.snapshot = []
    this.bitLevels = []
    this.bitWidth = 0

    if (options?.alphabet) {
      for (let i = 0; i < options.alphabet.length; i++) {
        this.alphabetMap.set(options.alphabet[i]!, i)
        this.reverseAlphabet[i] = options.alphabet[i]
      }
      this.alphabetCount = options.alphabet.length
    }
  }

  enqueue(item: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this._capacity
    this._size++
    this.dirty++
    increment(this.freqMap, item)
    if (!this.alphabetMap.has(item)) {
      const idx = this.alphabetCount
      this.alphabetMap.set(item, idx)
      if (idx < this.reverseAlphabet.length) {
        this.reverseAlphabet[idx] = item
      } else {
        this.reverseAlphabet.push(item)
      }
      this.alphabetCount++
    }
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined
    const item = this.buffer[this.head]!
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    this.dirty++
    const freq = this.freqMap.get(item) ?? 0
    if (freq <= 1) {
      this.freqMap.delete(item)
    } else {
      this.freqMap.set(item, freq - 1)
    }
    return item
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  front(): T | undefined {
    return this.peek()
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.buffer = new Array(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
    this.dirty = 0
    this.freqMap.clear()
    this.snapshot = []
    this.bitLevels = []
    this.bitWidth = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity]
      if (val !== undefined) result.push(val)
    }
    return result
  }

  rank(item: T): number {
    return this.freqMap.get(item) ?? 0
  }

  rankRange(item: T, from: number, to: number): number {
    if (from < 0) from = 0
    if (to > this._size) to = this._size
    if (from >= to) return 0
    if (!this.alphabetMap.has(item)) return 0
    this.ensureIndex()
    const code = this.alphabetMap.get(item)!
    return this.wmRank(code, to) - this.wmRank(code, from)
  }

  select(item: T, k: number): number {
    if (k < 0 || this._size === 0) return -1
    if (!this.alphabetMap.has(item)) return -1
    this.ensureIndex()
    const code = this.alphabetMap.get(item)!
    return this.wmSelect(code, k)
  }

  contains(item: T): boolean {
    return this.freqMap.has(item)
  }

  frequency(item: T): number {
    return this.freqMap.get(item) ?? 0
  }

  get frequencies(): Map<T, number> {
    return new Map(this.freqMap)
  }

  private ensureIndex(): void {
    if (this.dirty < this.rebuildThreshold && this.bitLevels.length > 0) return
    if (this._size === 0) {
      this.bitLevels = []
      this.bitWidth = 0
      this.snapshot = []
      this.dirty = 0
      return
    }
    this.snapshot = this.toArray()
    this.buildWavelet()
    this.dirty = 0
  }

  private buildWavelet(): void {
    const n = this.snapshot.length
    if (n === 0) {
      this.bitLevels = []
      this.bitWidth = 0
      return
    }

    const codes = new Uint32Array(n)
    for (let i = 0; i < n; i++) {
      codes[i] = this.alphabetMap.get(this.snapshot[i]!) ?? 0
    }

    this.bitWidth = this.alphabetCount <= 1 ? 0 : Math.ceil(Math.log2(this.alphabetCount))
    if (this.alphabetCount === 1) this.bitWidth = 0
    if (this.bitWidth === 0) {
      this.bitLevels = []
      return
    }

    let current = new Uint32Array(codes)
    this.bitLevels = []

    for (let level = 0; level < this.bitWidth; level++) {
      const bitPos = this.bitWidth - 1 - level
      const bits = new Uint8Array(n)
      const zeros: number[] = []
      const ones: number[] = []

      for (let i = 0; i < n; i++) {
        const val = current[i]!
        const bit = (val >>> bitPos) & 1
        bits[i] = bit
        if (bit === 0) {
          zeros.push(val)
        } else {
          ones.push(val)
        }
      }

      this.bitLevels.push({ bits, zeroCount: zeros.length })
      current = new Uint32Array(zeros.length + ones.length)
      current.set(zeros)
      current.set(ones, zeros.length)
    }
  }

  private count0(bits: Uint8Array, end: number): number {
    let c = 0
    const limit = Math.min(end, bits.length)
    for (let i = 0; i < limit; i++) {
      if (bits[i] === 0) c++
    }
    return c
  }

  private wmRank(code: number, end: number): number {
    if (end <= 0) return 0
    if (this.bitWidth === 0) return end
    const n = this.snapshot.length
    if (end > n) end = n

    let s = 0
    let e = end

    for (let level = 0; level < this.bitWidth; level++) {
      const bit = (code >>> (this.bitWidth - 1 - level)) & 1
      const lv = this.bitLevels[level]!
      const zc = lv.zeroCount

      if (bit === 0) {
        e = this.count0(lv.bits, e)
        s = this.count0(lv.bits, s)
      } else {
        const zerosBeforeE = this.count0(lv.bits, e)
        const zerosBeforeS = this.count0(lv.bits, s)
        s = zc + (s - zerosBeforeS)
        e = zc + (e - zerosBeforeE)
      }
    }

    return e - s
  }

  private wmSelect(code: number, k: number): number {
    if (this.bitWidth === 0) {
      return k < this.snapshot.length ? k : -1
    }

    let s = 0
    let e = this.snapshot.length

    for (let level = 0; level < this.bitWidth; level++) {
      const bit = (code >>> (this.bitWidth - 1 - level)) & 1
      const lv = this.bitLevels[level]!
      const zc = lv.zeroCount

      if (bit === 0) {
        e = this.count0(lv.bits, e)
        s = this.count0(lv.bits, s)
      } else {
        const zerosBeforeE = this.count0(lv.bits, e)
        const zerosBeforeS = this.count0(lv.bits, s)
        s = zc + (s - zerosBeforeS)
        e = zc + (e - zerosBeforeE)
      }
    }

    if (k >= e - s) return -1

    let pos = s + k

    for (let level = this.bitWidth - 1; level >= 0; level--) {
      const lv = this.bitLevels[level]!
      const zc = lv.zeroCount

      if (pos < zc) {
        let count = 0
        let found = -1
        for (let i = 0; i < lv.bits.length; i++) {
          if (lv.bits[i] === 0) {
            if (count === pos) { found = i; break }
            count++
          }
        }
        if (found === -1) return -1
        pos = found
      } else {
        const target = pos - zc
        let count = 0
        let found = -1
        for (let i = 0; i < lv.bits.length; i++) {
          if (lv.bits[i] === 1) {
            if (count === target) { found = i; break }
            count++
          }
        }
        if (found === -1) return -1
        pos = found
      }
    }

    return pos
  }

  private grow(): void {
    const newCap = this._capacity * 2
    const newBuf = new Array<T | undefined>(newCap)
    for (let i = 0; i < this._size; i++) {
      newBuf[i] = this.buffer[(this.head + i) % this._capacity]
    }
    this.buffer = newBuf
    this.head = 0
    this.tail = this._size
    this._capacity = newCap
  }
}
