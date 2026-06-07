export class LinearProbingHashTable<K, V> {
  private keys: (K | undefined)[]
  private values: (V | undefined)[]
  private occupied: boolean[]
  private _size = 0
  private readonly capacity: number

  constructor(capacity: number = 16) {
    this.capacity = capacity
    this.keys = new Array(capacity)
    this.values = new Array(capacity)
    this.occupied = new Array(capacity).fill(false)
  }

  private hash(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0
    }
    return ((h % this.capacity) + this.capacity) % this.capacity
  }

  set(key: K, value: V): void {
    let idx = this.hash(key)
    let firstDeleted = -1
    for (let i = 0; i < this.capacity; i++) {
      const pos = (idx + i) % this.capacity
      if (!this.occupied[pos]) {
        const insertAt = firstDeleted !== -1 ? firstDeleted : pos
        this.keys[insertAt] = key
        this.values[insertAt] = value
        this.occupied[insertAt] = true
        this._size++
        return
      }
      if (this.keys[pos] === key) {
        this.values[pos] = value
        return
      }
    }
    throw new Error('Hash table is full')
  }

  get(key: K): V | undefined {
    let idx = this.hash(key)
    for (let i = 0; i < this.capacity; i++) {
      const pos = (idx + i) % this.capacity
      if (!this.occupied[pos]) return undefined
      if (this.keys[pos] === key) return this.values[pos]
    }
    return undefined
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    let idx = this.hash(key)
    for (let i = 0; i < this.capacity; i++) {
      const pos = (idx + i) % this.capacity
      if (!this.occupied[pos]) return false
      if (this.keys[pos] === key) {
        this.keys[pos] = undefined
        this.values[pos] = undefined
        this.occupied[pos] = false
        this._size--
        return true
      }
    }
    return false
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  keys_Array(): K[] {
    const result: K[] = []
    for (let i = 0; i < this.capacity; i++) {
      if (this.occupied[i]) result.push(this.keys[i]!)
    }
    return result
  }

  values_Array(): V[] {
    const result: V[] = []
    for (let i = 0; i < this.capacity; i++) {
      if (this.occupied[i]) result.push(this.values[i]!)
    }
    return result
  }

  toString(): string {
    return `LinearProbingHashTable(${this._size}/${this.capacity})`
  }

  toJSON(): unknown {
    const entries: Array<[K, V]> = []
    for (let i = 0; i < this.capacity; i++) {
      if (this.occupied[i]) entries.push([this.keys[i]!, this.values[i]!])
    }
    return entries
  }

  clone(): LinearProbingHashTable<K, V> {
    const copy = new LinearProbingHashTable<K, V>(this.capacity)
    for (let i = 0; i < this.capacity; i++) {
      if (this.occupied[i]) {
        copy.keys[i] = this.keys[i]
        copy.values[i] = this.values[i]
        copy.occupied[i] = true
        copy._size++
      }
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LinearProbingHashTable)) return false
    if (this._size !== other._size) return false
    for (let i = 0; i < this.capacity; i++) {
      if (this.occupied[i]) {
        if (!other.occupied[i]) return false
        if (this.keys[i] !== other.keys[i]) return false
        if (!Object.is(this.values[i], other.values[i])) return false
      }
    }
    return true
  }
}
