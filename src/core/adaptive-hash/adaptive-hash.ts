import type { AdaptiveHashOptions, AdaptiveHashStatistics, Strategy } from './types.js'
import { DEFAULT_ADAPTIVE_HASH_OPTIONS } from './types.js'

interface ArrayEntry<K, V> {
  key: K
  value: V
}

interface ProbingSlot<K, V> {
  key: K | undefined
  value: V | undefined
  occupied: boolean
  deleted: boolean
}

interface ChainNode<K, V> {
  key: K
  value: V
  next: ChainNode<K, V> | null
}

export class AdaptiveHash<K, V> {
  private options: AdaptiveHashOptions
  private strategy: Strategy = 'array'
  private _size = 0

  private arrayEntries: ArrayEntry<K, V>[] = []

  private probingTable: ProbingSlot<K, V>[] = []
  private probingCapacity = 0

  private chainedBuckets: (ChainNode<K, V> | null)[] = []
  private chainedCapacity = 0

  private stats: AdaptiveHashStatistics = {
    inserts: 0,
    deletes: 0,
    lookups: 0,
    strategySwitches: 0,
    currentStrategy: 'array',
    probes: 0,
  }

  constructor(options?: Partial<AdaptiveHashOptions>) {
    this.options = { ...DEFAULT_ADAPTIVE_HASH_OPTIONS, ...options }
  }

  set(key: K, value: V): void {
    switch (this.strategy) {
      case 'array':
        this.setArray(key, value)
        break
      case 'probing':
        this.setProbing(key, value)
        break
      case 'chained':
        this.setChained(key, value)
        break
    }
    this.maybeUpgrade()
  }

  get(key: K): V | undefined {
    this.stats.lookups++
    switch (this.strategy) {
      case 'array':
        return this.getArray(key)
      case 'probing':
        return this.getProbing(key)
      case 'chained':
        return this.getChained(key)
    }
  }

  delete(key: K): boolean {
    this.stats.deletes++
    switch (this.strategy) {
      case 'array':
        return this.deleteArray(key)
      case 'probing':
        return this.deleteProbing(key)
      case 'chained':
        return this.deleteChained(key)
    }
  }

  has(key: K): boolean {
    this.stats.lookups++
    switch (this.strategy) {
      case 'array':
        return this.hasArray(key)
      case 'probing':
        return this.hasProbing(key)
      case 'chained':
        return this.hasChained(key)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._size = 0
    this.arrayEntries = []
    this.probingTable = []
    this.probingCapacity = 0
    this.chainedBuckets = []
    this.chainedCapacity = 0
    this.strategy = 'array'
    this.stats.currentStrategy = 'array'
  }

  keys(): K[] {
    switch (this.strategy) {
      case 'array':
        return this.arrayEntries.map((e) => e.key)
      case 'probing':
        return this.keysProbing()
      case 'chained':
        return this.keysChained()
    }
  }

  values(): V[] {
    switch (this.strategy) {
      case 'array':
        return this.arrayEntries.map((e) => e.value)
      case 'probing':
        return this.valuesProbing()
      case 'chained':
        return this.valuesChained()
    }
  }

  entries(): [K, V][] {
    switch (this.strategy) {
      case 'array':
        return this.arrayEntries.map((e) => [e.key, e.value] as [K, V])
      case 'probing':
        return this.entriesProbing()
      case 'chained':
        return this.entriesChained()
    }
  }

  forEach(callback: (value: V, key: K, map: AdaptiveHash<K, V>) => void): void {
    const all = this.entries()
    for (const [k, v] of all) {
      callback(v, k, this)
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    const all = this.entries()
    for (const entry of all) {
      yield entry
    }
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  getCurrentStrategy(): Strategy {
    return this.strategy
  }

  getStatistics(): AdaptiveHashStatistics {
    return { ...this.stats, currentStrategy: this.strategy }
  }

  private setArray(key: K, value: V): void {
    for (let i = 0; i < this.arrayEntries.length; i++) {
      const entry = this.arrayEntries[i]!
      if (this.keyEquals(entry.key, key)) {
        entry.value = value
        return
      }
    }
    this.arrayEntries.push({ key, value })
    this._size++
    this.stats.inserts++
  }

  private getArray(key: K): V | undefined {
    for (let i = 0; i < this.arrayEntries.length; i++) {
      this.stats.probes++
      const entry = this.arrayEntries[i]!
      if (this.keyEquals(entry.key, key)) {
        return entry.value
      }
    }
    return undefined
  }

  private hasArray(key: K): boolean {
    for (let i = 0; i < this.arrayEntries.length; i++) {
      this.stats.probes++
      if (this.keyEquals(this.arrayEntries[i]!.key, key)) {
        return true
      }
    }
    return false
  }

  private deleteArray(key: K): boolean {
    for (let i = 0; i < this.arrayEntries.length; i++) {
      if (this.keyEquals(this.arrayEntries[i]!.key, key)) {
        this.arrayEntries.splice(i, 1)
        this._size--
        return true
      }
    }
    return false
  }

  private initProbing(capacity: number): void {
    this.probingCapacity = capacity
    this.probingTable = []
    for (let i = 0; i < capacity; i++) {
      this.probingTable.push({ key: undefined, value: undefined, occupied: false, deleted: false })
    }
  }

  private setProbing(key: K, value: V): void {
    if (this.probingLoadFactor() >= this.options.loadFactor) {
      this.resizeProbing()
    }
    const idx = this.probeIndex(key)
    let i = idx
    let firstDeleted = -1
    do {
      const slot = this.probingTable[i]!
      this.stats.probes++
      if (slot.occupied && this.keyEquals(slot.key!, key)) {
        slot.value = value
        return
      }
      if (!slot.occupied && firstDeleted === -1) {
        if (slot.deleted) {
          firstDeleted = i
        } else {
          slot.key = key
          slot.value = value
          slot.occupied = true
          slot.deleted = false
          this._size++
          this.stats.inserts++
          return
        }
      }
      if (firstDeleted !== -1 && !slot.occupied && !slot.deleted) {
        break
      }
      i = (i + 1) % this.probingCapacity
    } while (i !== idx)

    const target = firstDeleted !== -1 ? firstDeleted : idx
    const slot = this.probingTable[target]!
    slot.key = key
    slot.value = value
    slot.occupied = true
    slot.deleted = false
    this._size++
    this.stats.inserts++
  }

  private probingLoadFactor(): number {
    if (this.probingCapacity === 0) return 1
    return this._size / this.probingCapacity
  }

  private resizeProbing(): void {
    const oldTable = this.probingTable
    const oldCapacity = this.probingCapacity
    const newCapacity = this.probingCapacity * 2
    this.initProbing(newCapacity)
    for (let i = 0; i < oldCapacity; i++) {
      const slot = oldTable[i]!
      if (slot.occupied) {
        this.setProbingDirect(slot.key!, slot.value!)
      }
    }
  }

  private getProbing(key: K): V | undefined {
    const idx = this.probeIndex(key)
    let i = idx
    do {
      const slot = this.probingTable[i]!
      this.stats.probes++
      if (slot.occupied && this.keyEquals(slot.key!, key)) {
        return slot.value
      }
      if (!slot.occupied && !slot.deleted) {
        return undefined
      }
      i = (i + 1) % this.probingCapacity
    } while (i !== idx)
    return undefined
  }

  private hasProbing(key: K): boolean {
    const idx = this.probeIndex(key)
    let i = idx
    do {
      const slot = this.probingTable[i]!
      this.stats.probes++
      if (slot.occupied && this.keyEquals(slot.key!, key)) {
        return true
      }
      if (!slot.occupied && !slot.deleted) {
        return false
      }
      i = (i + 1) % this.probingCapacity
    } while (i !== idx)
    return false
  }

  private deleteProbing(key: K): boolean {
    const idx = this.probeIndex(key)
    let i = idx
    do {
      const slot = this.probingTable[i]!
      if (slot.occupied && this.keyEquals(slot.key!, key)) {
        slot.occupied = false
        slot.deleted = true
        slot.key = undefined
        slot.value = undefined
        this._size--
        return true
      }
      if (!slot.occupied && !slot.deleted) {
        return false
      }
      i = (i + 1) % this.probingCapacity
    } while (i !== idx)
    return false
  }

  private keysProbing(): K[] {
    const result: K[] = []
    for (let i = 0; i < this.probingCapacity; i++) {
      const slot = this.probingTable[i]!
      if (slot.occupied) {
        result.push(slot.key!)
      }
    }
    return result
  }

  private valuesProbing(): V[] {
    const result: V[] = []
    for (let i = 0; i < this.probingCapacity; i++) {
      const slot = this.probingTable[i]!
      if (slot.occupied) {
        result.push(slot.value!)
      }
    }
    return result
  }

  private entriesProbing(): [K, V][] {
    const result: [K, V][] = []
    for (let i = 0; i < this.probingCapacity; i++) {
      const slot = this.probingTable[i]!
      if (slot.occupied) {
        result.push([slot.key!, slot.value!])
      }
    }
    return result
  }

  private initChained(capacity: number): void {
    this.chainedCapacity = capacity
    this.chainedBuckets = new Array(capacity).fill(null)
  }

  private getBucket(idx: number): ChainNode<K, V> | null {
    return this.chainedBuckets[idx] ?? null
  }

  private setBucket(idx: number, node: ChainNode<K, V> | null): void {
    this.chainedBuckets[idx] = node
  }

  private setChained(key: K, value: V): void {
    const idx = this.chainIndex(key)
    let node: ChainNode<K, V> | null = this.getBucket(idx)
    while (node !== null) {
      this.stats.probes++
      if (this.keyEquals(node.key, key)) {
        node.value = value
        return
      }
      node = node.next
    }
    const newNode: ChainNode<K, V> = { key, value, next: this.getBucket(idx) }
    this.setBucket(idx, newNode)
    this._size++
    this.stats.inserts++
  }

  private getChained(key: K): V | undefined {
    const idx = this.chainIndex(key)
    let node: ChainNode<K, V> | null = this.getBucket(idx)
    while (node !== null) {
      this.stats.probes++
      if (this.keyEquals(node.key, key)) {
        return node.value
      }
      node = node.next
    }
    return undefined
  }

  private hasChained(key: K): boolean {
    const idx = this.chainIndex(key)
    let node: ChainNode<K, V> | null = this.getBucket(idx)
    while (node !== null) {
      this.stats.probes++
      if (this.keyEquals(node.key, key)) {
        return true
      }
      node = node.next
    }
    return false
  }

  private deleteChained(key: K): boolean {
    const idx = this.chainIndex(key)
    let node: ChainNode<K, V> | null = this.getBucket(idx)
    let prev: ChainNode<K, V> | null = null
    while (node !== null) {
      if (this.keyEquals(node.key, key)) {
        if (prev === null) {
          this.setBucket(idx, node.next)
        } else {
          prev.next = node.next
        }
        this._size--
        return true
      }
      prev = node
      node = node.next
    }
    return false
  }

  private keysChained(): K[] {
    const result: K[] = []
    for (let i = 0; i < this.chainedCapacity; i++) {
      let node: ChainNode<K, V> | null = this.getBucket(i)
      while (node !== null) {
        result.push(node.key)
        node = node.next
      }
    }
    return result
  }

  private valuesChained(): V[] {
    const result: V[] = []
    for (let i = 0; i < this.chainedCapacity; i++) {
      let node: ChainNode<K, V> | null = this.getBucket(i)
      while (node !== null) {
        result.push(node.value)
        node = node.next
      }
    }
    return result
  }

  private entriesChained(): [K, V][] {
    const result: [K, V][] = []
    for (let i = 0; i < this.chainedCapacity; i++) {
      let node: ChainNode<K, V> | null = this.getBucket(i)
      while (node !== null) {
        result.push([node.key, node.value])
        node = node.next
      }
    }
    return result
  }

  private maybeUpgrade(): void {
    if (this.strategy === 'array' && this._size >= this.options.arrayToProbingThreshold) {
      this.switchToProbing()
    } else if (this.strategy === 'probing' && this._size >= this.options.probingToChainedThreshold) {
      this.switchToChained()
    }
  }

  private switchToProbing(): void {
    const capacity = this.nextPowerOf2(this.options.arrayToProbingThreshold * 2)
    this.initProbing(capacity)
    for (const entry of this.arrayEntries) {
      this.setProbingDirect(entry.key, entry.value)
    }
    this.arrayEntries = []
    this.strategy = 'probing'
    this.stats.currentStrategy = 'probing'
    this.stats.strategySwitches++
  }

  private switchToChained(): void {
    const capacity = this.nextPowerOf2(this.options.probingToChainedThreshold * 2)
    this.initChained(capacity)
    for (let i = 0; i < this.probingCapacity; i++) {
      const slot = this.probingTable[i]!
      if (slot.occupied) {
        this.setChainedDirect(slot.key!, slot.value!)
      }
    }
    this.probingTable = []
    this.probingCapacity = 0
    this.strategy = 'chained'
    this.stats.currentStrategy = 'chained'
    this.stats.strategySwitches++
  }

  private setProbingDirect(key: K, value: V): void {
    const idx = this.probeIndex(key)
    let i = idx
    do {
      const slot = this.probingTable[i]!
      if (!slot.occupied) {
        slot.key = key
        slot.value = value
        slot.occupied = true
        slot.deleted = false
        return
      }
      i = (i + 1) % this.probingCapacity
    } while (i !== idx)
  }

  private setChainedDirect(key: K, value: V): void {
    const idx = this.chainIndex(key)
    const newNode: ChainNode<K, V> = { key, value, next: this.getBucket(idx) }
    this.setBucket(idx, newNode)
  }

  private probeIndex(key: K): number {
    const hash = this.hash(key)
    return ((hash % this.probingCapacity) + this.probingCapacity) % this.probingCapacity
  }

  private chainIndex(key: K): number {
    const hash = this.hash(key)
    return ((hash % this.chainedCapacity) + this.chainedCapacity) % this.chainedCapacity
  }

  private hash(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0
    }
    return h
  }

  private keyEquals(a: K, b: K): boolean {
    return a === b
  }

  private nextPowerOf2(n: number): number {
    let p = 1
    while (p < n) p <<= 1
    return p
  }
}
