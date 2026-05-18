const TOMBSTONE: unique symbol = Symbol('TOMBSTONE')

type Slot<K, V> = { key: K; value: V } | typeof TOMBSTONE | null

export class HashMap<K, V> {
  private table: Slot<K, V>[]
  private _size: number = 0
  private tombstoneCount: number = 0
  private readonly _loadFactor: number

  constructor(initialCapacity: number = 16, loadFactor: number = 0.75) {
    this.table = new Array<Slot<K, V>>(initialCapacity).fill(null)
    this._loadFactor = loadFactor
  }

  private hash(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0
    }
    return h >>> 0
  }

  private probeIndex(key: K): number {
    return this.hash(key) % this.table.length
  }

  private findSlot(key: K): { index: number; found: boolean } {
    let idx = this.probeIndex(key)
    let firstTombstone = -1
    const len = this.table.length

    for (let i = 0; i < len; i++) {
      const j = (idx + i) % len
      const slot = this.table[j]

      if (slot === TOMBSTONE) {
        if (firstTombstone === -1) firstTombstone = j
      } else if (slot === null) {
        return { index: firstTombstone !== -1 ? firstTombstone : j, found: false }
      } else if (String(slot.key) === String(key)) {
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
      const slot = this.table[j]

      if (slot === TOMBSTONE) {
        if (firstTombstone === -1) firstTombstone = j
      } else if (slot === null) {
        const target = firstTombstone !== -1 ? firstTombstone : j
        this.table[target] = { key, value }
        this._size++
        return
      } else if (String(slot.key) === String(key)) {
        slot.value = value
        return
      }
    }
  }

  get(key: K): V | undefined {
    const { index, found } = this.findSlot(key)
    if (!found || index === -1) return undefined
    const slot = this.table[index]
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
