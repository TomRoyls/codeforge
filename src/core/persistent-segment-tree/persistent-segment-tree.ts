import type { PSTNode, PersistentSegmentTreeOptions } from './types.js'

export class PersistentSegmentTree<T> {
  private _size: number
  private operation: (a: T, b: T) => T
  private _identity: T
  private versions: (PSTNode<T> | null)[] = []

  constructor(options: PersistentSegmentTreeOptions<T>) {
    this._size = options.size
    this.operation = options.operation
    this._identity = options.identity
    if (this._size <= 0) {
      this.versions.push(null)
      return
    }
    if (options.initialValues !== undefined && options.initialValues.length > 0) {
      const root = this.build(0, this._size - 1, options.initialValues)
      this.versions.push(root)
    } else {
      const root = this.buildIdentity(0, this._size - 1)
      this.versions.push(root)
    }
  }

  private build(start: number, end: number, values: T[]): PSTNode<T> {
    if (start === end) {
      const v = values[start]
      return { value: v !== undefined ? v : this._identity, left: null, right: null }
    }
    const mid = Math.floor((start + end) / 2)
    const left = this.build(start, mid, values)
    const right = this.build(mid + 1, end, values)
    return { value: this.operation(left.value, right.value), left, right }
  }

  private buildIdentity(start: number, end: number): PSTNode<T> {
    if (start === end) {
      return { value: this._identity, left: null, right: null }
    }
    const mid = Math.floor((start + end) / 2)
    const left = this.buildIdentity(start, mid)
    const right = this.buildIdentity(mid + 1, end)
    return { value: this.operation(left.value, right.value), left, right }
  }

  private getVersionRoot(version: number): PSTNode<T> | null {
    const root = this.versions[version]
    return root !== undefined ? root : null
  }

  update(version: number, index: number, value: T): number {
    if (version < 0 || version >= this.versions.length) {
      throw new RangeError(`Version ${version} out of bounds [0, ${this.versions.length - 1}]`)
    }
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
    const root = this.getVersionRoot(version)
    const newRoot = this.updateRec(root, 0, this._size - 1, index, value)
    this.versions.push(newRoot)
    return this.versions.length - 1
  }

  private updateRec(
    node: PSTNode<T> | null,
    start: number,
    end: number,
    index: number,
    value: T,
  ): PSTNode<T> {
    if (start === end) {
      return { value, left: null, right: null }
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      const newLeft = this.updateRec(
        node !== null && node.left !== null ? node.left : null,
        start,
        mid,
        index,
        value,
      )
      const right = node !== null && node.right !== null ? node.right : null
      const rightVal = right !== null ? right.value : this._identity
      return { value: this.operation(newLeft.value, rightVal), left: newLeft, right }
    }
    const left = node !== null && node.left !== null ? node.left : null
    const newRight = this.updateRec(
      node !== null && node.right !== null ? node.right : null,
      mid + 1,
      end,
      index,
      value,
    )
    const leftVal = left !== null ? left.value : this._identity
    return { value: this.operation(leftVal, newRight.value), left, right: newRight }
  }

  query(version: number, start: number, end: number): T {
    if (version < 0 || version >= this.versions.length) {
      throw new RangeError(`Version ${version} out of bounds [0, ${this.versions.length - 1}]`)
    }
    if (this._size === 0) return this._identity
    if (start < 0 || end >= this._size || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}] for size ${this._size}`)
    }
    const root = this.getVersionRoot(version)
    if (root === null) return this._identity
    return this.queryRec(root, 0, this._size - 1, start, end)
  }

  private queryRec(
    node: PSTNode<T>,
    nodeStart: number,
    nodeEnd: number,
    queryStart: number,
    queryEnd: number,
  ): T {
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return node.value
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    if (queryEnd <= mid) {
      if (node.left === null) return this._identity
      return this.queryRec(node.left, nodeStart, mid, queryStart, queryEnd)
    }
    if (queryStart > mid) {
      if (node.right === null) return this._identity
      return this.queryRec(node.right, mid + 1, nodeEnd, queryStart, queryEnd)
    }
    const leftVal = node.left !== null
      ? this.queryRec(node.left, nodeStart, mid, queryStart, queryEnd)
      : this._identity
    const rightVal = node.right !== null
      ? this.queryRec(node.right, mid + 1, nodeEnd, queryStart, queryEnd)
      : this._identity
    return this.operation(leftVal, rightVal)
  }

  pointQuery(version: number, index: number): T {
    if (version < 0 || version >= this.versions.length) {
      throw new RangeError(`Version ${version} out of bounds [0, ${this.versions.length - 1}]`)
    }
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
    const root = this.getVersionRoot(version)
    if (root === null) return this._identity
    return this.pointQueryRec(root, 0, this._size - 1, index)
  }

  private pointQueryRec(node: PSTNode<T>, start: number, end: number, index: number): T {
    if (start === end) {
      return node.value
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      if (node.left === null) return this._identity
      return this.pointQueryRec(node.left, start, mid, index)
    }
    if (node.right === null) return this._identity
    return this.pointQueryRec(node.right, mid + 1, end, index)
  }

  getVersion(version: number): PSTNode<T> | null {
    if (version < 0 || version >= this.versions.length) {
      throw new RangeError(`Version ${version} out of bounds [0, ${this.versions.length - 1}]`)
    }
    return this.getVersionRoot(version)
  }

  versionCount(): number {
    return this.versions.length
  }

  size(): number {
    return this._size
  }

  cloneVersion(version: number): number {
    if (version < 0 || version >= this.versions.length) {
      throw new RangeError(`Version ${version} out of bounds [0, ${this.versions.length - 1}]`)
    }
    this.versions.push(this.getVersionRoot(version))
    return this.versions.length - 1
  }

  toArray(version: number): T[] {
    if (version < 0 || version >= this.versions.length) {
      throw new RangeError(`Version ${version} out of bounds [0, ${this.versions.length - 1}]`)
    }
    if (this._size === 0) return []
    const result: T[] = []
    const root = this.getVersionRoot(version)
    if (root === null) {
      for (let i = 0; i < this._size; i++) {
        result.push(this._identity)
      }
      return result
    }
    this.toArrayRec(root, 0, this._size - 1, result)
    return result
  }

  private toArrayRec(node: PSTNode<T>, start: number, end: number, result: T[]): void {
    if (start === end) {
      result.push(node.value)
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (node.left !== null) {
      this.toArrayRec(node.left, start, mid, result)
    } else {
      for (let i = start; i <= mid; i++) {
        result.push(this._identity)
      }
    }
    if (node.right !== null) {
      this.toArrayRec(node.right, mid + 1, end, result)
    } else {
      for (let i = mid + 1; i <= end; i++) {
        result.push(this._identity)
      }
    }
  }

  rollback(version: number): void {
    if (version < 0 || version >= this.versions.length) {
      throw new RangeError(`Version ${version} out of bounds [0, ${this.versions.length - 1}]`)
    }
    this.versions = this.versions.slice(0, version + 1)
  }
}

export type { PSTNode, PersistentSegmentTreeOptions } from './types.js'
