class RopeNode {
  left: RopeNode | null
  right: RopeNode | null
  value: string
  weight: number

  constructor(value: string) {
    this.left = null
    this.right = null
    this.value = value
    this.weight = value.length
  }
}

export class Rope {
  private root: RopeNode | null
  private _length: number

  constructor(value?: string) {
    if (value !== undefined && value.length > 0) {
      this.root = new RopeNode(value)
    } else {
      this.root = null
    }
    this._length = value?.length ?? 0
  }

  get length(): number {
    return this._length
  }

  private nodeLength(node: RopeNode | null): number {
    if (node === null) return 0
    return node.weight
  }

  private isLeaf(node: RopeNode): boolean {
    return node.left === null && node.right === null
  }


  private splitNode(node: RopeNode | null, index: number): [RopeNode | null, RopeNode | null] {
    if (node === null) return [null, null]

    if (this.isLeaf(node)) {
      if (index <= 0) return [null, node]
      if (index >= node.value.length) return [node, null]
      return [
        new RopeNode(node.value.slice(0, index)),
        new RopeNode(node.value.slice(index))
      ]
    }

    const leftLength = this.nodeLength(node.left!)

    if (index <= leftLength) {
      const [leftLeft, leftRight] = this.splitNode(node.left!, index)
      const newNode = new RopeNode("")
      newNode.left = leftRight
      newNode.right = node.right
      newNode.weight = this.nodeLength(leftRight!) + this.nodeLength(node.right!)
      return [leftLeft, newNode]
    } else {
      const [rightLeft, rightRight] = this.splitNode(node.right!, index - leftLength)
      const newNode = new RopeNode("")
      newNode.left = node.left
      newNode.right = rightLeft
      newNode.weight = this.nodeLength(node.left!) + this.nodeLength(rightLeft!)
      return [newNode, rightRight]
    }
  }

  private concatenate(left: RopeNode | null, right: RopeNode | null): RopeNode | null {
    if (left === null) return right
    if (right === null) return left

    const newNode = new RopeNode("")
    newNode.left = left
    newNode.right = right
    newNode.weight = left.weight + this.nodeLength(right)
    return newNode
  }

  insert(index: number, value: string): void {
    if (value.length === 0) return
    if (index < 0) index = 0
    if (index > this._length) index = this._length

    const newNode = new RopeNode(value)
    const [left, right] = this.splitNode(this.root, index)
    this.root = this.concatenate(this.concatenate(left, newNode), right)
    this._length += value.length
  }

  delete(start: number, end: number): string {
    if (start < 0) start = 0
    if (end > this._length) end = this._length
    if (start >= end) return ""

    const [left, middleAndRight] = this.splitNode(this.root, start)
    const [middle, right] = this.splitNode(middleAndRight, end - start)

    const deleted = this.toStringHelper(middle!)
    this.root = this.concatenate(left, right)
    this._length -= end - start

    return deleted
  }

  private toStringHelper(node: RopeNode | null): string {
    if (node === null) return ""
    if (this.isLeaf(node)) return node.value
    return this.toStringHelper(node.left) + this.toStringHelper(node.right)
  }

  toString(): string {
    return this.toStringHelper(this.root)
  }

  charAt(index: number): string {
    if (index < 0 || index >= this._length) return ""
    return this.charAtHelper(this.root, index)
  }

  private charAtHelper(node: RopeNode | null, index: number): string {
    if (node === null) return ""
    if (this.isLeaf(node)) return node.value[index]!

    const leftLength = this.nodeLength(node.left!)
    if (index < leftLength) {
      return this.charAtHelper(node.left!, index)
    } else {
      return this.charAtHelper(node.right!, index - leftLength)
    }
  }

  substring(start: number, end: number): string {
    if (start < 0) start = 0
    if (end > this._length) end = this._length
    if (start >= end) return ""

    const [_, middleAndRight] = this.splitNode(this.root, start)
    const [middle, __] = this.splitNode(middleAndRight, end - start)
    return this.toStringHelper(middle!)
  }

  indexOf(search: string, fromIndex?: number): number {
    const str = this.toString()
    const start = fromIndex ?? 0
    if (start < 0) return str.indexOf(search)
    return str.indexOf(search, start)
  }

  concat(other: Rope): Rope {
    const result = new Rope()
    result.root = this.concatenate(this.root, other.root)
    result._length = this._length + other._length
    return result
  }

  split(index: number): [Rope, Rope] {
    if (index < 0) index = 0
    if (index > this._length) index = this._length

    const [left, right] = this.splitNode(this.root, index)

    const leftRope = new Rope()
    leftRope.root = left
    leftRope._length = index

    const rightRope = new Rope()
    rightRope.root = right
    rightRope._length = this._length - index

    return [leftRope, rightRope]
  }

  private calculateDepth(node: RopeNode | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.calculateDepth(node.left), this.calculateDepth(node.right))
  }

  getDepth(): number {
    return this.calculateDepth(this.root)
  }

  private flatten(node: RopeNode | null): string[] {
    if (node === null) return []
    if (this.isLeaf(node)) return [node.value]
    return [...this.flatten(node.left), ...this.flatten(node.right)]
  }

  private buildBalanced(strings: string[], start: number, end: number): RopeNode | null {
    if (start >= end) return null
    if (start === end - 1) return new RopeNode(strings[start]!)

    const mid = Math.floor((start + end) / 2)
    const node = new RopeNode("")
    node.left = this.buildBalanced(strings, start, mid)
    node.right = this.buildBalanced(strings, mid, end)
    node.weight = this.calculateWeight(node)

    return node
  }

  private calculateWeight(node: RopeNode | null): number {
    if (node === null) return 0
    if (this.isLeaf(node)) return node.weight
    return this.nodeLength(node.left) + this.nodeLength(node.right)
  }

  rebalance(): void {
    if (this.root === null) return

    const strings = this.flatten(this.root)
    const filtered = strings.filter((s) => s.length > 0)
    this.root = this.buildBalanced(filtered, 0, filtered.length)
  }

  getTimeComplexity(): string {
    return "O(log n) for insert/delete/concat, O(n) for toString/indexOf"
  }
}
