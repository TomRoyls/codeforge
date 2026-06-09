import type { VersionId, VersionNode } from './types.js'

export class EphemeralArray<T> {
  private readonly baseData: readonly T[]
  private readonly _versions: Map<VersionId, VersionNode<T>>
  private nextVersionId: VersionId
  private currentVersion: VersionId
  private readonly _size: number

  constructor(size?: number, defaultValue?: T)
  constructor(initialData?: T[])
  constructor(sizeOrData?: number | T[], defaultValue?: T) {
    this._versions = new Map()
    this.nextVersionId = 0

    if (Array.isArray(sizeOrData)) {
      this._size = sizeOrData.length
      this.baseData = [...sizeOrData]
    } else if (typeof sizeOrData === 'number') {
      this._size = sizeOrData
      this.baseData = defaultValue !== undefined
        ? Array.from({ length: sizeOrData }, () => defaultValue)
        : new Array<T>(sizeOrData).fill(undefined as T)
    } else {
      this._size = 0
      this.baseData = []
    }

    const rootVersion: VersionNode<T> = {
      id: 0,
      parentId: null,
      deltas: new Map(),
    }
    this._versions.set(0, rootVersion)
    this.nextVersionId = 1
    this.currentVersion = 0
  }

  private collectDeltas(version: VersionId): Map<number, T> {
    const result = new Map<number, T>()
    const chain: VersionNode<T>[] = []
    let vid: VersionId | null = version
    while (vid !== null) {
      const node = this._versions.get(vid)
      if (node === undefined) {
        throw new RangeError(`Version ${version} does not exist`)
      }
      chain.push(node)
      vid = node.parentId
    }
    for (let i = chain.length - 1; i >= 0; i--) {
      const node = chain[i]!
      node.deltas.forEach((val, idx) => {
        result.set(idx, val)
      })
    }
    return result
  }

  private resolveData(version: VersionId): T[] {
    const deltas = this.collectDeltas(version)
    const result = [...this.baseData]
    deltas.forEach((val, idx) => {
      result[idx] = val
    })
    return result
  }

  get(index: number, version?: VersionId): T {
    const ver = version ?? this.currentVersion
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const deltas = this.collectDeltas(ver)
    if (deltas.has(index)) {
      return deltas.get(index) as T
    }
    return this.baseData[index] as T
  }

  set(index: number, value: T): VersionId {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const newId = this.nextVersionId++
    const deltas = new Map<number, T>()
    deltas.set(index, value)
    const newNode: VersionNode<T> = {
      id: newId,
      parentId: this.currentVersion,
      deltas,
    }
    this._versions.set(newId, newNode)
    this.currentVersion = newId
    return newId
  }

  snapshot(): VersionId {
    return this.currentVersion
  }

  getLatestVersion(): VersionId {
    return this.currentVersion
  }

  getVersion(versionId: VersionId): VersionId {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    return versionId
  }

  get size(): number {
    return this._size
  }

  toArray(version?: VersionId): T[] {
    const ver = version ?? this.currentVersion
    return this.resolveData(ver)
  }

  checkout(versionId: VersionId): void {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    this.currentVersion = versionId
  }

  fork(versionId: VersionId): VersionId {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    const newId = this.nextVersionId++
    const emptyDeltas = new Map<number, T>()
    const newNode: VersionNode<T> = {
      id: newId,
      parentId: versionId,
      deltas: emptyDeltas,
    }
    this._versions.set(newId, newNode)
    this.currentVersion = newId
    return newId
  }

  forEach(callback: (value: T, index: number) => void, version?: VersionId): void {
    const ver = version ?? this.currentVersion
    const data = this.resolveData(ver)
    for (let i = 0; i < this._size; i++) {
      callback(data[i] as T, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U, version?: VersionId): U[] {
    const ver = version ?? this.currentVersion
    const data = this.resolveData(ver)
    const result: U[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(callback(data[i] as T, i))
    }
    return result
  }

  get versions(): number {
    return this._versions.size
  }

  parentOf(versionId: VersionId): VersionId | null {
    const node = this._versions.get(versionId)
    if (node === undefined) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    return node.parentId
  }

  hasVersion(versionId: VersionId): boolean {
    return this._versions.has(versionId)
  }

  versionExists(versionId: VersionId): boolean {
    return this._versions.has(versionId)
  }

  equals(versionA: VersionId, versionB: VersionId): boolean {
    const dataA = this.resolveData(versionA)
    const dataB = this.resolveData(versionB)
    if (dataA.length !== dataB.length) return false
    for (let i = 0; i < dataA.length; i++) {
      if (dataA[i] !== dataB[i]) return false
    }
    return true
  }

  diff(versionA: VersionId, versionB: VersionId): Map<number, { a: T; b: T }> {
    const dataA = this.resolveData(versionA)
    const dataB = this.resolveData(versionB)
    const result = new Map<number, { a: T; b: T }>()
    const len = Math.max(dataA.length, dataB.length)
    for (let i = 0; i < len; i++) {
      const valA = dataA[i]
      const valB = dataB[i]
      if (valA !== valB) {
        result.set(i, { a: valA as T, b: valB as T })
      }
    }
    return result
  }

  reset(): void {
    this.currentVersion = 0
  }

  branch(versionId: VersionId, index: number, value: T): VersionId {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const newId = this.nextVersionId++
    const deltas = new Map<number, T>()
    deltas.set(index, value)
    const newNode: VersionNode<T> = {
      id: newId,
      parentId: versionId,
      deltas,
    }
    this._versions.set(newId, newNode)
    return newId
  }

  lineage(versionId: VersionId): VersionId[] {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    const result: VersionId[] = []
    let vid: VersionId | null = versionId
    while (vid !== null) {
      result.push(vid)
      const node = this._versions.get(vid)
      vid = node?.parentId ?? null
    }
    return result
  }

  childrenOf(versionId: VersionId): VersionId[] {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    const result: VersionId[] = []
    this._versions.forEach((node, id) => {
      if (node.parentId === versionId) {
        result.push(id)
      }
    })
    return result
  }

  rootVersion(): VersionId {
    return 0
  }

  isRoot(versionId: VersionId): boolean {
    const node = this._versions.get(versionId)
    if (node === undefined) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    return node.parentId === null
  }

  depthOf(versionId: VersionId): number {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    let depth = 0
    let vid: VersionId | null = versionId
    while (vid !== null) {
      const node = this._versions.get(vid)
      vid = node?.parentId ?? null
      if (vid !== null) depth++
    }
    return depth
  }

  setMany(updates: Array<[number, T]>): VersionId {
    const deltas = new Map<number, T>()
    for (const [index, value] of updates) {
      if (index < 0 || index >= this._size) {
        throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
      }
      deltas.set(index, value)
    }
    const newId = this.nextVersionId++
    const newNode: VersionNode<T> = {
      id: newId,
      parentId: this.currentVersion,
      deltas,
    }
    this._versions.set(newId, newNode)
    this.currentVersion = newId
    return newId
  }

  setAt(versionId: VersionId, index: number, value: T): VersionId {
    if (!this._versions.has(versionId)) {
      throw new RangeError(`Version ${versionId} does not exist`)
    }
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const newId = this.nextVersionId++
    const deltas = new Map<number, T>()
    deltas.set(index, value)
    const newNode: VersionNode<T> = {
      id: newId,
      parentId: versionId,
      deltas,
    }
    this._versions.set(newId, newNode)
    return newId
  }

  toArrayAt(versionId: VersionId): T[] {
    return this.resolveData(versionId)
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${EphemeralArray}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'EphemeralArray', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }
}
