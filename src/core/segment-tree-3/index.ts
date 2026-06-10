export class SegmentTree {
  private tree: number[] = []
  private data: number[] = []
  private size: number = 0

  constructor(array: number[]) {
    if (array.length === 0) {
      throw new Error('Cannot create segment tree from empty array')
    }
    this.data = [...array]
    this.size = array.length
    const treeSize = 4 * this.size
    this.tree = new Array<number>(treeSize).fill(0)
    this.build(0, 0, this.size - 1)
  }

  private build(node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = this.data[start]!
      return
    }
    const mid = Math.floor((start + end) / 2)
    const leftChild = 2 * node + 1
    const rightChild = 2 * node + 2
    this.build(leftChild, start, mid)
    this.build(rightChild, mid + 1, end)
    this.tree[node] = this.tree[leftChild]! + this.tree[rightChild]!
  }

  query(start: number, end: number): number {
    if (start < 0 || end >= this.size || start > end) {
      throw new RangeError(`Invalid query range [${start}, ${end}] for size ${this.size}`)
    }
    return this.rangeQuery(start, end)
  }

  rangeQuery(start: number, end: number): number {
    if (start < 0 || end >= this.size || start > end) {
      throw new RangeError(`Invalid query range [${start}, ${end}] for size ${this.size}`)
    }
    return this.queryHelper(0, 0, this.size - 1, start, end)
  }

  private queryHelper(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number): number {
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return this.tree[node]!
    }
    if (nodeEnd < queryStart || queryEnd < nodeStart) {
      return 0
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    const leftChild = 2 * node + 1
    const rightChild = 2 * node + 2
    const leftSum = this.queryHelper(leftChild, nodeStart, mid, queryStart, queryEnd)
    const rightSum = this.queryHelper(rightChild, mid + 1, nodeEnd, queryStart, queryEnd)
    return leftSum + rightSum
  }

  update(index: number, value: number): void {
    if (index < 0 || index >= this.size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.size - 1}]`)
    }
    const diff = value - this.data[index]!
    this.data[index] = value
    this.updateHelper(0, 0, this.size - 1, index, diff)
  }

  private updateHelper(node: number, start: number, end: number, index: number, diff: number): void {
    if (index < start || index > end) {
      return
    }
    this.tree[node]! += diff
    if (start !== end) {
      const mid = Math.floor((start + end) / 2)
      const leftChild = 2 * node + 1
      const rightChild = 2 * node + 2
      this.updateHelper(leftChild, start, mid, index, diff)
      this.updateHelper(rightChild, mid + 1, end, index, diff)
    }
  }

  getSize(): number {
    return this.size
  }

  toArray(): number[] {
    return [...this.data]
  }

  getTreeArray(): number[] {
    return [...this.tree]
  }

  getTimeComplexity(): string {
    return 'Build: O(n), Query: O(log n), Update: O(log n), Space: O(n)'
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

  static from(items: any[]): SegmentTree {
    return new SegmentTree(items)
  }

  clone(): SegmentTree {
    return SegmentTree.from(this.toArray())
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  toString(): string {
    return `SegmentTree()`
  }

  toJSON() {
    return { type: 'SegmentTree', items: this.toArray() }
  }

  clear(): void {
    this.size = 0
    this.data.length = 0
    this.tree.length = 0
  }
}
