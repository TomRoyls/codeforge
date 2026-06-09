export class SegmentTreeMap2 {
  private tree: Float64Array
  private lazy: Float64Array
  private readonly _size: number

  constructor(size: number) {
    this._size = size
    this.tree = new Float64Array(size * 4)
    this.lazy = new Float64Array(size * 4)
  }

  set(index: number, value: number): void {
    if (index < 0 || index >= this._size) return
    this._set(0, 0, this._size - 1, index, value)
  }

  private _set(node: number, nodeLeft: number, nodeRight: number, index: number, value: number): void {
    this._push(node, nodeLeft, nodeRight)

    if (nodeLeft === nodeRight) {
      this.tree[node]! = value
      return
    }

    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    if (index <= mid) {
      this._set(node * 2 + 1, nodeLeft, mid, index, value)
    } else {
      this._set(node * 2 + 2, mid + 1, nodeRight, index, value)
    }

    this.tree[node]! = this.tree[node * 2 + 1]! + this.tree[node * 2 + 2]!
  }

  get(index: number): number {
    if (index < 0 || index >= this._size) return 0
    return this._get(0, 0, this._size - 1, index)
  }

  private _get(node: number, nodeLeft: number, nodeRight: number, index: number): number {
    this._push(node, nodeLeft, nodeRight)

    if (nodeLeft === nodeRight) {
      return this.tree[node]!
    }

    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    if (index <= mid) {
      return this._get(node * 2 + 1, nodeLeft, mid, index)
    } else {
      return this._get(node * 2 + 2, mid + 1, nodeRight, index)
    }
  }

  queryRange(left: number, right: number): number {
    if (left < 0 || right >= this._size || left > right) return 0
    return this._queryRange(0, 0, this._size - 1, left, right)
  }

  private _queryRange(node: number, nodeLeft: number, nodeRight: number, left: number, right: number): number {
    this._push(node, nodeLeft, nodeRight)

    if (left > nodeRight || right < nodeLeft) {
      return 0
    }

    if (left <= nodeLeft && nodeRight <= right) {
      return this.tree[node]!
    }

    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    const leftSum = this._queryRange(node * 2 + 1, nodeLeft, mid, left, right)
    const rightSum = this._queryRange(node * 2 + 2, mid + 1, nodeRight, left, right)

    return leftSum + rightSum
  }

  updateRange(left: number, right: number, delta: number): void {
    if (left < 0 || right >= this._size || left > right) return
    this._updateRange(0, 0, this._size - 1, left, right, delta)
  }

  private _updateRange(node: number, nodeLeft: number, nodeRight: number, left: number, right: number, delta: number): void {
    if (left > nodeRight || right < nodeLeft) {
      return
    }

    if (left <= nodeLeft && nodeRight <= right) {
      this.lazy[node] = this.lazy[node]! + delta
      this.tree[node]! = this.tree[node]! + delta * (nodeRight - nodeLeft + 1)
      return
    }

    this._push(node, nodeLeft, nodeRight)

    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    this._updateRange(node * 2 + 1, nodeLeft, mid, left, right, delta)
    this._updateRange(node * 2 + 2, mid + 1, nodeRight, left, right, delta)

    this.tree[node]! = this.tree[node * 2 + 1]! + this.tree[node * 2 + 2]!
  }

  private _push(node: number, nodeLeft: number, nodeRight: number): void {
    if (this.lazy[node] === 0 || nodeLeft === nodeRight) return

    const leftChild = node * 2 + 1
    const rightChild = node * 2 + 2
    const mid = Math.floor((nodeLeft + nodeRight) / 2)

    this.lazy[leftChild] = this.lazy[leftChild]! + this.lazy[node]!
    this.lazy[rightChild] = this.lazy[rightChild]! + this.lazy[node]!

    this.tree[leftChild]! = this.tree[leftChild]! + this.lazy[node]! * (mid - nodeLeft + 1)
    this.tree[rightChild]! = this.tree[rightChild]! + this.lazy[node]! * (nodeRight - mid - 1 + 1)

    this.lazy[node] = 0
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.get(i))
    }
    return result
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
}
