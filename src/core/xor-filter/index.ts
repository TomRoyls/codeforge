import type { HashFunction, XorFilterOptions, SerializedXorFilter } from './types.js'

function defaultHash(element: string, seed: number): number {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < element.length; i++) {
    const ch = element.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
}

export class XorFilter {
  private fingerprints: Uint8Array
  private _size: number
  private _segmentSize: number
  private _seed: number
  private _hashFunction: HashFunction
  private _elements: string[]

  constructor(elements: string[], options?: XorFilterOptions) {
    const unique = [...new Set(elements)]
    this._size = unique.length
    this._seed = options?.seed ?? 0
    this._hashFunction = options?.hashFunction ?? defaultHash
    this._elements = [...unique]

    if (this._size === 0) {
      this._segmentSize = 1
      this.fingerprints = new Uint8Array(3)
      return
    }

    const totalSize = Math.ceil(this._size * 1.23) + 32
    this._segmentSize = Math.ceil(totalSize / 3)
    const arrayLength = this._segmentSize * 3

    let fpArray: Uint8Array | null = null
    let currentSeed = this._seed

    for (let attempt = 0; attempt < 100; attempt++) {
      const result = this.tryBuild(unique, arrayLength, currentSeed)
      if (result !== null) {
        fpArray = result
        this._seed = currentSeed
        break
      }
      currentSeed++
    }

    this.fingerprints = fpArray!
  }

  private tryBuild(
    elements: string[],
    arrayLength: number,
    seed: number
  ): Uint8Array | null {
    const n = elements.length
    const segSize = this._segmentSize

    const h0Arr = new Int32Array(n)
    const h1Arr = new Int32Array(n)
    const h2Arr = new Int32Array(n)
    const fpArr = new Uint8Array(n)

    for (let i = 0; i < n; i++) {
      const el = elements[i]!
      h0Arr[i] = (this._hashFunction(el, seed) >>> 0) % segSize
      h1Arr[i] = ((this._hashFunction(el, seed + 0x9e3779b9) >>> 0) % segSize) + segSize
      h2Arr[i] = ((this._hashFunction(el, seed + 0x517cc1b7) >>> 0) % segSize) + 2 * segSize
      fpArr[i] = this._hashFunction(el, seed + 0xdeadbeef) & 0xFF
    }

    const reverseIndex = Array.from({ length: arrayLength }, (): Set<number> => new Set())
    const counts = new Uint32Array(arrayLength)

    for (let i = 0; i < n; i++) {
      reverseIndex[h0Arr[i]!]!.add(i)
      reverseIndex[h1Arr[i]!]!.add(i)
      reverseIndex[h2Arr[i]!]!.add(i)
      counts[h0Arr[i]!]!++
      counts[h1Arr[i]!]!++
      counts[h2Arr[i]!]!++
    }

    const stack: [number, number][] = []
    const queue: number[] = []
    const removed = new Uint8Array(n)

    for (let i = 0; i < arrayLength; i++) {
      if (counts[i] === 1) {
        queue.push(i)
      }
    }

    while (queue.length > 0) {
      const pos = queue.pop()!
      if (counts[pos]! !== 1) continue

      let keyIdx = -1
      const posKeys = reverseIndex[pos]!
      for (const idx of posKeys) {
        if (!removed[idx]!) {
          keyIdx = idx
          break
        }
      }

      if (keyIdx === -1) continue

      removed[keyIdx] = 1
      stack.push([keyIdx, pos])

      const positions = [h0Arr[keyIdx]!, h1Arr[keyIdx]!, h2Arr[keyIdx]!]
      for (const p of positions) {
        counts[p] = counts[p]! - 1
        if (counts[p]! === 1) {
          queue.push(p)
        }
      }
    }

    if (stack.length !== n) return null

    const fps = new Uint8Array(arrayLength)
    for (let i = stack.length - 1; i >= 0; i--) {
      const entry = stack[i]!
      const keyIdx = entry[0]!
      const lonelyPos = entry[1]!
      const p0 = h0Arr[keyIdx]!
      const p1 = h1Arr[keyIdx]!
      const p2 = h2Arr[keyIdx]!

      let otherA = p0
      let otherB = p1
      if (lonelyPos === p0) {
        otherA = p1
        otherB = p2
      } else if (lonelyPos === p1) {
        otherA = p0
        otherB = p2
      }

      fps[lonelyPos] = fpArr[keyIdx]! ^ fps[otherA]! ^ fps[otherB]!
    }

    return fps
  }

  private getPositions(element: string): [number, number, number, number] {
    const seed = this._seed
    const segSize = this._segmentSize
    const h0 = (this._hashFunction(element, seed) >>> 0) % segSize
    const h1 = ((this._hashFunction(element, seed + 0x9e3779b9) >>> 0) % segSize) + segSize
    const h2 = ((this._hashFunction(element, seed + 0x517cc1b7) >>> 0) % segSize) + 2 * segSize
    const fp = this._hashFunction(element, seed + 0xdeadbeef) & 0xFF
    return [h0, h1, h2, fp]
  }

  has(element: string): boolean {
    return this.mightContain(element)
  }

  mightContain(element: string): boolean {
    if (this._size === 0) return false
    const [h0, h1, h2, fp] = this.getPositions(element)
    return fp === (this.fingerprints[h0]! ^ this.fingerprints[h1]! ^ this.fingerprints[h2]!)
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  get capacity(): number {
    return this._size
  }

  get fingerprintCount(): number {
    return this.fingerprints.length
  }

  get falsePositiveRate(): number {
    return 1 / 256
  }

  clone(): XorFilter {
    const cloned = Object.create(XorFilter.prototype) as XorFilter
    cloned.fingerprints = new Uint8Array(this.fingerprints)
    cloned._size = this._size
    cloned._segmentSize = this._segmentSize
    cloned._seed = this._seed
    cloned._hashFunction = this._hashFunction
    cloned._elements = [...this._elements]
    return cloned
  }

  serialize(): SerializedXorFilter {
    const fpArr: number[] = []
    for (let i = 0; i < this.fingerprints.length; i++) {
      fpArr.push(this.fingerprints[i]!)
    }
    return {
      size: this._size,
      segmentSize: this._segmentSize,
      fingerprintCount: this.fingerprints.length,
      seed: this._seed,
      fingerprints: fpArr,
      elements: [...this._elements],
    }
  }

  static deserialize(
    data: SerializedXorFilter,
    hashFunction?: HashFunction
  ): XorFilter {
    const filter = Object.create(XorFilter.prototype) as XorFilter
    filter._size = data.size
    filter._segmentSize = data.segmentSize
    filter._seed = data.seed
    filter._hashFunction = hashFunction ?? defaultHash
    filter._elements = [...data.elements]
    filter.fingerprints = new Uint8Array(data.fingerprints.length)
    for (let i = 0; i < data.fingerprints.length; i++) {
      filter.fingerprints[i] = data.fingerprints[i]!
    }
    return filter
  }

  static from(elements: string[], options?: XorFilterOptions): XorFilter {
    return new XorFilter(elements, options)
  }

  equals(other: XorFilter): boolean {
    if (this._segmentSize !== other._segmentSize) return false
    if (this._seed !== other._seed) return false
    if (this.fingerprints.length !== other.fingerprints.length) return false
    for (let i = 0; i < this.fingerprints.length; i++) {
      if (this.fingerprints[i] !== other.fingerprints[i]) return false
    }
    return true
  }

  toString(): string {
    return `XorFilter({ size: ${this.size} })`
  }
}
