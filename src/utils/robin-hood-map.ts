export class RobinHopMap<K, V> {
  private keys: (K | undefined)[]
  private values: (V | undefined)[]
  private hashes: Int32Array
  private occupied: Uint8Array
  private _size: number = 0
  private _capacity: number
  private static readonly EMPTY = 0
  private static readonly DELETED = 2
  private static readonly OCCUPIED = 1
  private static readonly LOAD_FACTOR = 0.7

  constructor(initialCapacity: number = 16) {
    this._capacity = nextPowerOf2(initialCapacity)
    this.keys = new Array(this._capacity).fill(undefined)
    this.values = new Array(this._capacity).fill(undefined)
    this.hashes = new Int32Array(this._capacity).fill(0)
    this.occupied = new Uint8Array(this._capacity).fill(RobinHopMap.EMPTY)
  }

  get(key: K): V | undefined {
    const index = this.findIndex(key)
    if (index === -1) return undefined
    return this.values[index] as V
  }

  set(key: K, value: V): void {
    if (this._size >= this._capacity * RobinHopMap.LOAD_FACTOR) {
      this.resize()
    }

    const hash = this.hashKey(key)
    let pos = this.desiredIndex(hash)
    let currentKey = key
    let currentValue = value
    let currentHash = hash

    for (let i = 0; i < this._capacity; i++) {
      const idx = (pos + i) & (this._capacity - 1)

      if (this.occupied[idx] === RobinHopMap.EMPTY || this.occupied[idx] === RobinHopMap.DELETED) {
        this.keys[idx] = currentKey
        this.values[idx] = currentValue
        this.hashes[idx] = currentHash
        this.occupied[idx] = RobinHopMap.OCCUPIED
        this._size++
        return
      }

      if (this.occupied[idx] === RobinHopMap.OCCUPIED && this.keysEqual(this.keys[idx] as K, currentKey)) {
        this.values[idx] = currentValue
        return
      }

      const existingPSL = this.probeSequenceLength(idx, this.hashes[idx]!)
      const currentPSL = i

      if (currentPSL > existingPSL) {
        const tmpKey = this.keys[idx]!
        const tmpVal = this.values[idx]!
        const tmpHash = this.hashes[idx]!

        this.keys[idx] = currentKey
        this.values[idx] = currentValue
        this.hashes[idx] = currentHash
        this.occupied[idx] = RobinHopMap.OCCUPIED

        currentKey = tmpKey
        currentValue = tmpVal
        currentHash = tmpHash

        pos = this.desiredIndex(currentHash)
        for (let j = 0; j <= i; j++) {
          const nidx = (pos + j) & (this._capacity - 1)
          if (this.occupied[nidx] !== RobinHopMap.OCCUPIED || this.keysEqual(this.keys[nidx] as K, currentKey)) {
            pos = pos
            break
          }
        }
      }
    }
  }

  delete(key: K): boolean {
    const index = this.findIndex(key)
    if (index === -1) return false
    this.keys[index] = undefined
    this.values[index] = undefined
    this.hashes[index] = 0
    this.occupied[index] = RobinHopMap.DELETED
    this._size--
    return true
  }

  has(key: K): boolean {
    return this.findIndex(key) !== -1
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  clear(): void {
    this.keys.fill(undefined)
    this.values.fill(undefined)
    this.hashes.fill(0)
    this.occupied.fill(RobinHopMap.EMPTY)
    this._size = 0
  }

  *entries(): Generator<[K, V]> {
    for (let i = 0; i < this._capacity; i++) {
      if (this.occupied[i] === RobinHopMap.OCCUPIED) {
        yield [this.keys[i] as K, this.values[i] as V]
      }
    }
  }

  *keysIterator(): Generator<K> {
    for (let i = 0; i < this._capacity; i++) {
      if (this.occupied[i] === RobinHopMap.OCCUPIED) {
        yield this.keys[i] as K
      }
    }
  }

  *valuesIterator(): Generator<V> {
    for (let i = 0; i < this._capacity; i++) {
      if (this.occupied[i] === RobinHopMap.OCCUPIED) {
        yield this.values[i] as V
      }
    }
  }

  maxPSL(): number {
    let max = 0
    for (let i = 0; i < this._capacity; i++) {
      if (this.occupied[i] === RobinHopMap.OCCUPIED) {
        const psl = this.probeSequenceLength(i, this.hashes[i]!)
        if (psl > max) max = psl
      }
    }
    return max
  }

  private findIndex(key: K): number {
    const hash = this.hashKey(key)
    let pos = this.desiredIndex(hash)
    for (let i = 0; i < this._capacity; i++) {
      const idx = (pos + i) & (this._capacity - 1)
      if (this.occupied[idx] === RobinHopMap.EMPTY) return -1
      if (this.occupied[idx] === RobinHopMap.OCCUPIED &&
          this.hashes[idx] === hash &&
          this.keysEqual(this.keys[idx] as K, key)) {
        return idx
      }
    }
    return -1
  }

  private desiredIndex(hash: number): number {
    return hash & (this._capacity - 1)
  }

  private probeSequenceLength(index: number, hash: number): number {
    return (index - this.desiredIndex(hash) + this._capacity) & (this._capacity - 1)
  }

  private hashKey(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0
    }
    return h >>> 0
  }

  private keysEqual(a: K, b: K): boolean {
    return a === b || (Number.isNaN(a as number) && Number.isNaN(b as number))
  }

  private resize(): void {
    const oldKeys = this.keys
    const oldValues = this.values
    const oldHashes = this.hashes
    const oldOccupied = this.occupied
    const oldCapacity = this._capacity

    this._capacity = oldCapacity * 2
    this.keys = new Array(this._capacity).fill(undefined)
    this.values = new Array(this._capacity).fill(undefined)
    this.hashes = new Int32Array(this._capacity).fill(0)
    this.occupied = new Uint8Array(this._capacity).fill(RobinHopMap.EMPTY)
    this._size = 0

    for (let i = 0; i < oldCapacity; i++) {
      if (oldOccupied[i] === RobinHopMap.OCCUPIED) {
        this.set(oldKeys[i] as K, oldValues[i] as V)
      }
    }
  }
}

function nextPowerOf2(n: number): number {
  if (n <= 0) return 1
  n--
  n |= n >> 1
  n |= n >> 2
  n |= n >> 4
  n |= n >> 8
  n |= n >> 16
  return n + 1
}
