export class XorLinkedListNode<T> {
  constructor(
    public value: T,
    public prev: number = -1,
    public next: number = -1,
  ) {}
}

export class XorLinkedList<T> {
  private nodes: XorLinkedListNode<T>[] = []
  private headIdx: number = -1
  private tailIdx: number = -1

  get size(): number {
    return this.nodes.length
  }

  get isEmpty(): boolean {
    return this.nodes.length === 0
  }

  pushFront(value: T): void {
    const idx = this.nodes.length
    this.nodes.push(new XorLinkedListNode(value, -1, this.headIdx))
    if (this.headIdx >= 0) {
      this.nodes[this.headIdx]!.prev = idx
    }
    this.headIdx = idx
    if (this.tailIdx < 0) this.tailIdx = idx
  }

  pushBack(value: T): void {
    const idx = this.nodes.length
    this.nodes.push(new XorLinkedListNode(value, this.tailIdx, -1))
    if (this.tailIdx >= 0) {
      this.nodes[this.tailIdx]!.next = idx
    }
    this.tailIdx = idx
    if (this.headIdx < 0) this.headIdx = idx
  }

  toArray(): T[] {
    const result: T[] = []
    let cur = this.headIdx
    while (cur >= 0) {
      result.push(this.nodes[cur]!.value)
      cur = this.nodes[cur]!.next
    }
    return result
  }

  toArrayReverse(): T[] {
    const result: T[] = []
    let cur = this.tailIdx
    while (cur >= 0) {
      result.push(this.nodes[cur]!.value)
      cur = this.nodes[cur]!.prev
    }
    return result
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.nodes.length) return undefined
    let cur = this.headIdx
    for (let i = 0; i < index; i++) {
      cur = this.nodes[cur]!.next
    }
    return this.nodes[cur]!.value
  }
}
