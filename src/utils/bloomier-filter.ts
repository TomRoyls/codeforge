export interface BloomierFilterStats {
  size: number
  capacity: number
  hashCount: number
  falsePositiveRate: number
}

const MAX_CONSTRUCTION_RETRIES = 100

export class BloomierFilter<V extends number = number> {
  private table: Int32Array
  private readonly _capacity: number
  private readonly _hashCount: number
  private readonly _seed: number
  private readonly _size: number
  private readonly _keys: ReadonlySet<string>

  private constructor(
    table: Int32Array,
    capacity: number,
    hashCount: number,
    seed: number,
    size: number,
    keys: ReadonlySet<string>,
  ) {
    this.table = table
    this._capacity = capacity
    this._hashCount = hashCount
    this._seed = seed
    this._size = size
    this._keys = keys
  }

  static create<V extends number = number>(
    entries: Map<string, V>,
    seed: number = 0,
  ): BloomierFilter<V> {
    if (entries.size === 0) {
      return new BloomierFilter<V>(
        new Int32Array(0),
        0,
        0,
        seed,
        0,
        new Set(),
      )
    }

    const n = entries.size
    const k = 3
    const m = Math.max(n + 1, Math.ceil(n * 1.5), k + 1)

    const entryList: Array<[string, number]> = []
    entries.forEach((v, key) => {
      entryList.push([key, v])
    })

    for (let attempt = 0; attempt < MAX_CONSTRUCTION_RETRIES; attempt++) {
      const currentSeed = seed + attempt * 7919
      const result = tryConstruct(entryList, m, k, currentSeed)
      if (result !== null) {
        return new BloomierFilter<V>(
          result,
          m,
          k,
          currentSeed,
          n,
          new Set(entries.keys()),
        )
      }
    }

    throw new Error(
      `BloomierFilter construction failed after ${MAX_CONSTRUCTION_RETRIES} retries`,
    )
  }

  get(key: string): V | undefined {
    if (this._size === 0) return undefined
    const indices = this.getUniqueIndices(key)
    let xorSum = 0
    for (const idx of indices) {
      xorSum ^= this.table[idx]!
    }
    return xorSum as V
  }

  has(key: string): boolean {
    if (this._size === 0) return false
    return this._keys.has(key)
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  get falsePositiveRate(): number {
    if (this._size === 0) return 0
    if (this._hashCount === 0 || this._capacity === 0) return 1
    const prob = 1 - Math.pow(1 - 1 / this._capacity, this._hashCount * this._size)
    return Math.pow(prob, this._hashCount)
  }

  stats(): BloomierFilterStats {
    return {
      size: this._size,
      capacity: this._capacity,
      hashCount: this._hashCount,
      falsePositiveRate: this.falsePositiveRate,
    }
  }

  private hashIndex(key: string, hashIdx: number): number {
    return murmurHash3(key, this._seed + hashIdx * 2654435761) >>> 0
  }

  private getUniqueIndices(key: string): number[] {
    const result: number[] = []
    for (let h = 0; h < this._hashCount; h++) {
      const idx = this.hashIndex(key, h) % this._capacity
      if (!result.includes(idx)) {
        result.push(idx)
      }
    }
    return result
  }
}

function tryConstruct(
  entries: Array<[string, number]>,
  m: number,
  k: number,
  seed: number,
): Int32Array | null {
  const n = entries.length
  const table = new Int32Array(m)

  const hashIndices: number[][] = []
  for (let i = 0; i < n; i++) {
    const unique: number[] = []
    for (let h = 0; h < k; h++) {
      const idx = (murmurHash3(entries[i]![0], seed + h * 2654435761) >>> 0) % m
      if (!unique.includes(idx)) {
        unique.push(idx)
      }
    }
    hashIndices.push(unique)
  }

  const slotToKeys: number[][] = new Array(m)
  for (let j = 0; j < m; j++) {
    slotToKeys[j] = []
  }
  for (let i = 0; i < n; i++) {
    for (const j of hashIndices[i]!) {
      slotToKeys[j]!.push(i)
    }
  }

  const queue: number[] = []
  for (let j = 0; j < m; j++) {
    if (slotToKeys[j]!.length === 1) {
      queue.push(j)
    }
  }

  const peelOrder: Array<{ keyIdx: number; slot: number }> = []
  const keyRemoved = new Uint8Array(n)

  let head = 0
  while (head < queue.length) {
    const slot = queue[head]!
    head++

    if (slotToKeys[slot]!.length !== 1) continue

    const keyIdx = slotToKeys[slot]![0]!
    if (keyRemoved[keyIdx]) continue

    keyRemoved[keyIdx] = 1
    peelOrder.push({ keyIdx, slot })

    for (const j of hashIndices[keyIdx]!) {
      const arr = slotToKeys[j]!
      const pos = arr.indexOf(keyIdx)
      if (pos >= 0) arr.splice(pos, 1)
      if (arr.length === 1) {
        queue.push(j)
      }
    }
  }

  if (peelOrder.length !== n) return null

  for (let i = peelOrder.length - 1; i >= 0; i--) {
    const { keyIdx, slot } = peelOrder[i]!
    let xorSum = entries[keyIdx]![1]
    for (const j of hashIndices[keyIdx]!) {
      if (j === slot) continue
      xorSum ^= table[j]!
    }
    table[slot] = xorSum
  }

  return table
}

function murmurHash3(key: string, seed: number): number {
  let h1 = seed >>> 0
  const len = key.length
  const nblocks = len >> 2

  const C1 = 0xcc9e2d51
  const C2 = 0x1b873593

  for (let i = 0; i < nblocks; i++) {
    let k1 =
      (key.charCodeAt(i * 4) & 0xff) |
      ((key.charCodeAt(i * 4 + 1) & 0xff) << 8) |
      ((key.charCodeAt(i * 4 + 2) & 0xff) << 16) |
      ((key.charCodeAt(i * 4 + 3) & 0xff) << 24)

    k1 = Math.imul(k1, C1)
    k1 = ((k1 << 15) | (k1 >>> 17))
    k1 = Math.imul(k1, C2)

    h1 ^= k1
    h1 = ((h1 << 13) | (h1 >>> 19))
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0
  }

  let k1 = 0
  const tailStart = nblocks * 4
  const remaining = len & 3
  if (remaining >= 3) {
    k1 ^= (key.charCodeAt(tailStart + 2) & 0xff) << 16
  }
  if (remaining >= 2) {
    k1 ^= (key.charCodeAt(tailStart + 1) & 0xff) << 8
  }
  if (remaining >= 1) {
    k1 ^= key.charCodeAt(tailStart) & 0xff
    k1 = Math.imul(k1, C1)
    k1 = ((k1 << 15) | (k1 >>> 17))
    k1 = Math.imul(k1, C2)
    h1 ^= k1
  }

  h1 ^= len
  h1 ^= h1 >>> 16
  h1 = Math.imul(h1, 0x85ebca6b)
  h1 ^= h1 >>> 13
  h1 = Math.imul(h1, 0xc2b2ae35)
  h1 ^= h1 >>> 16

  return h1 >>> 0
}
