const TOMBSTONE: unique symbol = Symbol('TOMBSTONE')

type Slot<K, V> = { key: K; value: V } | typeof TOMBSTONE | null

export interface HashMapOptions<K> {
  initialCapacity?: number
  loadFactor?: number
  hashFn?: (key: K) => number
  keyEqual?: (a: K, b: K) => boolean
}

function defaultHash<K>(key: K): number {
  if (typeof key === 'number') return key >>> 0
  if (typeof key === 'string') {
    let h = 0
    for (let i = 0; i < key.length; i++) {
      h = ((h << 5) - h + key.charCodeAt(i)) | 0
    }
    return h >>> 0
  }
  const str = String(key)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return h >>> 0
}

function sameValueZero(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b || (a !== a && b !== b)
  }
  return a === b
}

export class HashMap<K, V> {
  private table: Slot<K, V>[]
  private _size: number = 0
  private tombstoneCount: number = 0
  private readonly _loadFactor: number
  private readonly _hash: (key: K) => number
  private readonly _keyEqual: (a: K, b: K) => boolean

  constructor(initialCapacityOrOpts?: number | HashMapOptions<K>, loadFactor?: number) {
    if (typeof initialCapacityOrOpts === 'object' && initialCapacityOrOpts !== null) {
      const opts = initialCapacityOrOpts
      this.table = new Array<Slot<K, V>>(opts.initialCapacity ?? 16).fill(null)
      this._loadFactor = opts.loadFactor ?? 0.75
      this._hash = opts.hashFn ?? defaultHash
      this._keyEqual = opts.keyEqual ?? sameValueZero
    } else {
      this.table = new Array<Slot<K, V>>(initialCapacityOrOpts ?? 16).fill(null)
      this._loadFactor = loadFactor ?? 0.75
      this._hash = defaultHash
      this._keyEqual = sameValueZero
    }
  }

  private probeIndex(key: K): number {
    return this._hash(key) % this.table.length
  }

  private findSlot(key: K): { index: number; found: boolean } {
    let idx = this.probeIndex(key)
    let firstTombstone = -1
    const len = this.table.length

    for (let i = 0; i < len; i++) {
      const j = (idx + i) % len
      const slot = this.table[j]!

      if (slot === TOMBSTONE) {
        if (firstTombstone === -1) firstTombstone = j
      } else if (slot === null) {
        return { index: firstTombstone !== -1 ? firstTombstone : j, found: false }
      } else if (this._keyEqual(slot.key, key)) {
        return { index: j, found: true }
      }
    }

    if (firstTombstone !== -1) {
      return { index: firstTombstone, found: false }
    }

    return { index: -1, found: false }
  }

  private shouldResize(): boolean {
    return (this._size + this.tombstoneCount + 1) / this.table.length >= this._loadFactor
  }

  private resize(): void {
    const oldTable = this.table
    this.table = new Array<Slot<K, V>>(oldTable.length * 2).fill(null)
    this._size = 0
    this.tombstoneCount = 0

    for (const slot of oldTable) {
      if (slot !== null && slot !== TOMBSTONE) {
        this.set(slot.key, slot.value)
      }
    }
  }

  set(key: K, value: V): void {
    if (this.shouldResize()) {
      this.resize()
    }

    let idx = this.probeIndex(key)
    let firstTombstone = -1
    const len = this.table.length

    for (let i = 0; i < len; i++) {
      const j = (idx + i) % len
      const slot = this.table[j]!

      if (slot === TOMBSTONE) {
        if (firstTombstone === -1) firstTombstone = j
      } else if (slot === null) {
        const target = firstTombstone !== -1 ? firstTombstone : j
        this.table[target] = { key, value }
        this._size++
        return
      } else if (this._keyEqual(slot.key, key)) {
        slot.value = value
        return
      }
    }
  }

  get(key: K): V | undefined {
    const { index, found } = this.findSlot(key)
    if (!found || index === -1) return undefined
    const slot = this.table[index]!
    return slot !== null && slot !== TOMBSTONE ? slot.value : undefined
  }

  has(key: K): boolean {
    const { found } = this.findSlot(key)
    return found
  }

  delete(key: K): boolean {
    const { index, found } = this.findSlot(key)
    if (!found || index === -1) return false
    this.table[index] = TOMBSTONE
    this._size--
    this.tombstoneCount++
    return true
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.table = new Array<Slot<K, V>>(this.table.length).fill(null)
    this._size = 0
    this.tombstoneCount = 0
  }

  keys(): K[] {
    const result: K[] = []
    for (const slot of this.table) {
      if (slot !== null && slot !== TOMBSTONE) {
        result.push(slot.key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const slot of this.table) {
      if (slot !== null && slot !== TOMBSTONE) {
        result.push(slot.value)
      }
    }
    return result
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    for (const slot of this.table) {
      if (slot !== null && slot !== TOMBSTONE) {
        result.push([slot.key, slot.value])
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const slot of this.table) {
      if (slot !== null && slot !== TOMBSTONE) {
        callback(slot.value, slot.key)
      }
    }
  }

  get capacity(): number {
    return this.table.length
  }

  get loadFactor(): number {
    return this._size / this.table.length
  }
}
