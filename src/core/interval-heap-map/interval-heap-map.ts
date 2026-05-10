import type { IntervalHeapMapOptions, IntervalHeapNode } from './types.js'

export class IntervalHeapMap<K, V> {
  private nodes: Array<IntervalHeapNode<K, V>> = []
  private keyMap: Map<K, { nodeIndex: number; isMin: boolean }> = new Map()
  private cmp: (a: K, b: K) => number
  private count: number = 0

  constructor(options?: IntervalHeapMapOptions<K>) {
    this.cmp =
      options?.comparator ??
      ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private fixNode(i: number): void {
    const node = this.nodes[i]!
    if (node.maxKey !== null && this.cmp(node.maxKey, node.minKey) < 0) {
      const tk = node.minKey
      const tv = node.minValue
      node.minKey = node.maxKey
      node.minValue = node.maxValue!
      node.maxKey = tk
      node.maxValue = tv
      this.keyMap.set(node.minKey, { nodeIndex: i, isMin: true })
      this.keyMap.set(node.maxKey!, { nodeIndex: i, isMin: false })
    }
  }

  private effMaxKey(i: number): K {
    const node = this.nodes[i]!
    return node.maxKey !== null ? node.maxKey : node.minKey
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const pi = (idx - 1) >> 1
      const node = this.nodes[idx]!
      const parent = this.nodes[pi]!
      let swapped = false

      if (this.cmp(node.minKey, parent.minKey) < 0) {
        const tk = parent.minKey
        const tv = parent.minValue
        parent.minKey = node.minKey
        parent.minValue = node.minValue
        node.minKey = tk
        node.minValue = tv
        this.keyMap.set(parent.minKey, { nodeIndex: pi, isMin: true })
        this.keyMap.set(node.minKey, { nodeIndex: idx, isMin: true })
        this.fixNode(idx)
        this.fixNode(pi)
        swapped = true
      }

      const nMaxKey = this.effMaxKey(idx)
      const pMaxKey = this.effMaxKey(pi)

      if (this.cmp(nMaxKey, pMaxKey) > 0) {
        const nodeHasMax = node.maxKey !== null
        const parentHasMax = parent.maxKey !== null

        if (nodeHasMax && parentHasMax) {
          const tk = parent.maxKey!
          const tv = parent.maxValue!
          parent.maxKey = node.maxKey
          parent.maxValue = node.maxValue
          node.maxKey = tk
          node.maxValue = tv
          this.keyMap.set(parent.maxKey!, { nodeIndex: pi, isMin: false })
          this.keyMap.set(node.maxKey!, { nodeIndex: idx, isMin: false })
        } else if (!nodeHasMax && parentHasMax) {
          const tk = parent.maxKey!
          const tv = parent.maxValue!
          parent.maxKey = node.minKey
          parent.maxValue = node.minValue
          node.minKey = tk
          node.minValue = tv
          this.keyMap.set(parent.maxKey!, { nodeIndex: pi, isMin: false })
          this.keyMap.set(node.minKey, { nodeIndex: idx, isMin: true })
        } else if (nodeHasMax && !parentHasMax) {
          const tk = parent.minKey
          const tv = parent.minValue
          parent.minKey = node.maxKey!
          parent.minValue = node.maxValue!
          node.maxKey = tk
          node.maxValue = tv
          this.keyMap.set(parent.minKey, { nodeIndex: pi, isMin: true })
          this.keyMap.set(node.maxKey!, { nodeIndex: idx, isMin: false })
        }

        this.fixNode(idx)
        this.fixNode(pi)
        swapped = true
      }

      if (!swapped) break
      idx = pi
    }
  }

  private popLastEntry(): { key: K; value: V } {
    const last = this.nodes[this.nodes.length - 1]!
    if (last.maxKey !== null) {
      const key = last.maxKey
      const value = last.maxValue!
      last.maxKey = null
      last.maxValue = null
      return { key, value }
    }
    const key = last.minKey
    const value = last.minValue
    this.nodes.pop()
    return { key, value }
  }

  private trickleDown(idx: number): void {
    this.trickleDownMin(idx)
    this.trickleDownMax(idx)
  }

  private trickleDownMin(idx: number): void {
    const len = this.nodes.length
    while (idx < len) {
      let s = idx
      const l = 2 * idx + 1
      const r = 2 * idx + 2
      if (l < len && this.cmp(this.nodes[l]!.minKey, this.nodes[s]!.minKey) < 0) s = l
      if (r < len && this.cmp(this.nodes[r]!.minKey, this.nodes[s]!.minKey) < 0) s = r
      if (s === idx) break
      const cur = this.nodes[idx]!
      const child = this.nodes[s]!
      const tk = cur.minKey
      const tv = cur.minValue
      cur.minKey = child.minKey
      cur.minValue = child.minValue
      child.minKey = tk
      child.minValue = tv
      this.keyMap.set(cur.minKey, { nodeIndex: idx, isMin: true })
      this.keyMap.set(child.minKey, { nodeIndex: s, isMin: true })
      this.fixNode(idx)
      this.fixNode(s)
      idx = s
    }
  }

  private trickleDownMax(idx: number): void {
    const len = this.nodes.length
    while (idx < len) {
      let lg = idx
      const l = 2 * idx + 1
      const r = 2 * idx + 2
      if (l < len && this.cmp(this.effMaxKey(l), this.effMaxKey(lg)) > 0) lg = l
      if (r < len && this.cmp(this.effMaxKey(r), this.effMaxKey(lg)) > 0) lg = r
      if (lg === idx) break

      const cur = this.nodes[idx]!
      const child = this.nodes[lg]!
      const curHasMax = cur.maxKey !== null
      const childHasMax = child.maxKey !== null

      if (curHasMax && childHasMax) {
        const tk = cur.maxKey!
        const tv = cur.maxValue!
        cur.maxKey = child.maxKey
        cur.maxValue = child.maxValue
        child.maxKey = tk
        child.maxValue = tv
        this.keyMap.set(cur.maxKey!, { nodeIndex: idx, isMin: false })
        this.keyMap.set(child.maxKey!, { nodeIndex: lg, isMin: false })
      } else if (curHasMax && !childHasMax) {
        const tk = cur.maxKey!
        const tv = cur.maxValue!
        cur.maxKey = child.minKey
        cur.maxValue = child.minValue
        child.minKey = tk
        child.minValue = tv
        this.keyMap.set(cur.maxKey!, { nodeIndex: idx, isMin: false })
        this.keyMap.set(child.minKey, { nodeIndex: lg, isMin: true })
      } else if (!curHasMax && childHasMax) {
        const tk = cur.minKey
        const tv = cur.minValue
        cur.minKey = child.maxKey!
        cur.minValue = child.maxValue!
        child.maxKey = tk
        child.maxValue = tv
        this.keyMap.set(cur.minKey, { nodeIndex: idx, isMin: true })
        this.keyMap.set(child.maxKey!, { nodeIndex: lg, isMin: false })
      }

      this.fixNode(idx)
      this.fixNode(lg)
      idx = lg
    }
  }

  set(key: K, value: V): void {
    const pos = this.keyMap.get(key)
    if (pos) {
      const node = this.nodes[pos.nodeIndex]!
      if (pos.isMin) {
        node.minValue = value
      } else {
        node.maxValue = value
      }
      return
    }

    const len = this.nodes.length
    if (len > 0) {
      const last = this.nodes[len - 1]!
      if (last.maxKey === null) {
        last.maxKey = key
        last.maxValue = value
        this.keyMap.set(key, { nodeIndex: len - 1, isMin: false })
        this.fixNode(len - 1)
        this.bubbleUp(len - 1)
        this.count++
        return
      }
    }

    this.nodes.push({
      minKey: key,
      minValue: value,
      maxKey: null,
      maxValue: null,
    })
    this.keyMap.set(key, { nodeIndex: this.nodes.length - 1, isMin: true })
    this.bubbleUp(this.nodes.length - 1)
    this.count++
  }

  get(key: K): V | undefined {
    const pos = this.keyMap.get(key)
    if (!pos) return undefined
    const node = this.nodes[pos.nodeIndex]!
    return pos.isMin ? node.minValue : node.maxValue!
  }

  has(key: K): boolean {
    return this.keyMap.has(key)
  }

  findMin(): { key: K; value: V } | undefined {
    if (this.nodes.length === 0) return undefined
    const node = this.nodes[0]!
    return { key: node.minKey, value: node.minValue }
  }

  findMax(): { key: K; value: V } | undefined {
    if (this.nodes.length === 0) return undefined
    const node = this.nodes[0]!
    if (node.maxKey !== null) {
      return { key: node.maxKey, value: node.maxValue! }
    }
    return { key: node.minKey, value: node.minValue }
  }

  deleteMin(): { key: K; value: V } | undefined {
    if (this.nodes.length === 0) return undefined
    const first = this.nodes[0]!
    const result: { key: K; value: V } = { key: first.minKey, value: first.minValue }
    if (this.count === 1) {
      this.nodes = []
      this.keyMap.clear()
      this.count = 0
      return result
    }
    const replacement = this.popLastEntry()
    this.keyMap.delete(first.minKey)
    first.minKey = replacement.key
    first.minValue = replacement.value
    this.keyMap.set(replacement.key, { nodeIndex: 0, isMin: true })
    this.fixNode(0)
    this.trickleDown(0)
    this.count--
    return result
  }

  deleteMax(): { key: K; value: V } | undefined {
    if (this.nodes.length === 0) return undefined
    const first = this.nodes[0]!
    if (first.maxKey === null) {
      return this.deleteMin()
    }
    const result: { key: K; value: V } = { key: first.maxKey, value: first.maxValue! }
    if (this.count === 2) {
      first.maxKey = null
      first.maxValue = null
      this.keyMap.delete(result.key)
      this.count--
      return result
    }
    const replacement = this.popLastEntry()
    this.keyMap.delete(result.key)
    first.maxKey = replacement.key
    first.maxValue = replacement.value
    this.keyMap.set(replacement.key, { nodeIndex: 0, isMin: false })
    this.fixNode(0)
    this.trickleDown(0)
    this.count--
    return result
  }

  delete(key: K): boolean {
    const pos = this.keyMap.get(key)
    if (!pos) return false

    const nodeIdx = pos.nodeIndex

    if (this.count === 1) {
      this.nodes = []
      this.keyMap.clear()
      this.count = 0
      return true
    }

    this.keyMap.delete(key)

    if (pos.isMin) {
      const node = this.nodes[nodeIdx]!
      if (nodeIdx === this.nodes.length - 1 && node.maxKey === null) {
        this.nodes.pop()
        this.count--
        return true
      }

      const replacement = this.popLastEntry()
      if (nodeIdx >= this.nodes.length) {
        this.count--
        return true
      }

      const target = this.nodes[nodeIdx]!
      target.minKey = replacement.key
      target.minValue = replacement.value
      this.keyMap.set(replacement.key, { nodeIndex: nodeIdx, isMin: true })
      this.fixNode(nodeIdx)
      this.bubbleUp(nodeIdx)
      this.trickleDown(nodeIdx)
    } else {
      const node = this.nodes[nodeIdx]!
      if (nodeIdx === this.nodes.length - 1) {
        node.maxKey = null
        node.maxValue = null
        this.count--
        return true
      }

      const replacement = this.popLastEntry()
      if (nodeIdx >= this.nodes.length) {
        this.count--
        return true
      }

      const target = this.nodes[nodeIdx]!
      target.maxKey = replacement.key
      target.maxValue = replacement.value
      this.keyMap.set(replacement.key, { nodeIndex: nodeIdx, isMin: false })
      this.fixNode(nodeIdx)
      this.bubbleUp(nodeIdx)
      this.trickleDown(nodeIdx)
    }

    this.count--
    return true
  }

  update(key: K, value: V): boolean {
    const pos = this.keyMap.get(key)
    if (!pos) return false
    const node = this.nodes[pos.nodeIndex]!
    if (pos.isMin) {
      node.minValue = value
    } else {
      node.maxValue = value
    }
    return true
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.nodes = []
    this.keyMap.clear()
    this.count = 0
  }

  *keys(): IterableIterator<K> {
    for (const node of this.nodes) {
      yield node.minKey
      if (node.maxKey !== null) yield node.maxKey
    }
  }

  *values(): IterableIterator<V> {
    for (const node of this.nodes) {
      yield node.minValue
      if (node.maxKey !== null) yield node.maxValue!
    }
  }

  *entries(): IterableIterator<{ key: K; value: V }> {
    for (const node of this.nodes) {
      yield { key: node.minKey, value: node.minValue }
      if (node.maxKey !== null) yield { key: node.maxKey, value: node.maxValue! }
    }
  }
}

export type { IntervalHeapMapOptions, IntervalHeapNode } from './types.js'
