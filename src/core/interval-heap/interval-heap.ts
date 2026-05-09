import type { IntervalHeapOptions } from './types.js'

interface IntervalNode<T> {
  min: T
  max: T | null
}

export class IntervalHeap<T> {
  private nodes: Array<IntervalNode<T>> = []
  private cmp: (a: T, b: T) => number

  constructor(options?: IntervalHeapOptions<T>) {
    this.cmp =
      options?.comparator ??
      ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
    if (options?.initialValues) {
      for (const v of options.initialValues) {
        this.insert(v)
      }
    }
  }

  private fixNode(i: number): void {
    const node = this.nodes[i]
    if (node && node.max !== null && this.cmp(node.max, node.min) < 0) {
      const tmp = node.min
      node.min = node.max
      node.max = tmp
    }
  }

  private effMax(i: number): T {
    const node = this.nodes[i]!
    return node.max !== null ? node.max : node.min
  }

  private elementCount(): number {
    let c = 0
    for (const node of this.nodes) {
      c++
      if (node.max !== null) c++
    }
    return c
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const pi = (idx - 1) >> 1
      const node = this.nodes[idx]!
      const parent = this.nodes[pi]!
      let swapped = false

      if (this.cmp(node.min, parent.min) < 0) {
        const tmp = node.min
        node.min = parent.min
        parent.min = tmp
        this.fixNode(idx)
        this.fixNode(pi)
        swapped = true
      }

      const nMax = this.effMax(idx)
      const pMax = this.effMax(pi)

      if (this.cmp(nMax, pMax) > 0) {
        if (node.max !== null && parent.max !== null) {
          const tmp = node.max
          node.max = parent.max
          parent.max = tmp
        } else if (node.max === null && parent.max !== null) {
          const tmp = node.min
          node.min = parent.max
          parent.max = tmp
        } else if (node.max !== null && parent.max === null) {
          const tmp = node.max
          node.max = parent.min
          parent.min = tmp
        }
        this.fixNode(idx)
        this.fixNode(pi)
        swapped = true
      }

      if (!swapped) break
      idx = pi
    }
  }

  private popLastElement(): T {
    const last = this.nodes[this.nodes.length - 1]!
    if (last.max !== null) {
      const val = last.max
      last.max = null
      return val
    }
    this.nodes.pop()
    return last.min
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
      if (l < len && this.cmp(this.nodes[l]!.min, this.nodes[s]!.min) < 0) s = l
      if (r < len && this.cmp(this.nodes[r]!.min, this.nodes[s]!.min) < 0) s = r
      if (s === idx) break
      const node = this.nodes[idx]!
      const child = this.nodes[s]!
      const tmp = node.min
      node.min = child.min
      child.min = tmp
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
      if (l < len && this.cmp(this.effMax(l), this.effMax(lg)) > 0) lg = l
      if (r < len && this.cmp(this.effMax(r), this.effMax(lg)) > 0) lg = r
      if (lg === idx) break

      const node = this.nodes[idx]!
      const child = this.nodes[lg]!

      if (node.max !== null && child.max !== null) {
        const tmp = node.max
        node.max = child.max
        child.max = tmp
      } else if (node.max !== null && child.max === null) {
        const tmp = node.max
        node.max = child.min
        child.min = tmp
      } else if (node.max === null && child.max !== null) {
        const tmp = node.min
        node.min = child.max
        child.max = tmp
      }

      this.fixNode(idx)
      this.fixNode(lg)
      idx = lg
    }
  }

  insert(value: T): void {
    const len = this.nodes.length
    if (len > 0) {
      const last = this.nodes[len - 1]!
      if (last.max === null) {
        if (this.cmp(value, last.min) < 0) {
          last.max = last.min
          last.min = value
        } else {
          last.max = value
        }
        this.bubbleUp(len - 1)
        return
      }
    }
    this.nodes.push({ min: value, max: null })
    this.bubbleUp(this.nodes.length - 1)
  }

  getMin(): T | undefined {
    if (this.nodes.length === 0) return undefined
    return this.nodes[0]!.min
  }

  getMax(): T | undefined {
    if (this.nodes.length === 0) return undefined
    return this.nodes[0]!.max ?? this.nodes[0]!.min
  }

  extractMin(): T | undefined {
    if (this.nodes.length === 0) return undefined
    const result = this.nodes[0]!.min
    if (this.elementCount() === 1) {
      this.nodes = []
      return result
    }
    const replacement = this.popLastElement()
    this.nodes[0]!.min = replacement
    this.fixNode(0)
    this.trickleDown(0)
    return result
  }

  extractMax(): T | undefined {
    if (this.nodes.length === 0) return undefined
    const first = this.nodes[0]!
    if (first.max === null) {
      return this.extractMin()
    }
    const result = first.max
    if (this.elementCount() === 2) {
      first.max = null
      return result
    }
    const replacement = this.popLastElement()
    first.max = replacement
    this.fixNode(0)
    this.trickleDown(0)
    return result
  }

  peekMin(): T | undefined {
    return this.getMin()
  }

  peekMax(): T | undefined {
    return this.getMax()
  }

  size(): number {
    return this.elementCount()
  }

  isEmpty(): boolean {
    return this.nodes.length === 0
  }

  clear(): void {
    this.nodes = []
  }

  contains(value: T): boolean {
    for (const node of this.nodes) {
      if (this.cmp(node.min, value) === 0) return true
      if (node.max !== null && this.cmp(node.max, value) === 0) return true
    }
    return false
  }

  remove(value: T): boolean {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]!
      if (this.cmp(node.min, value) === 0) {
        if (this.elementCount() === 1) {
          this.nodes = []
          return true
        }
        if (i === this.nodes.length - 1 && node.max === null) {
          this.nodes.pop()
          return true
        }
        const replacement = this.popLastElement()
        if (i >= this.nodes.length) return true
        this.nodes[i]!.min = replacement
        this.fixNode(i)
        this.bubbleUp(i)
        this.trickleDown(i)
        return true
      }
      if (node.max !== null && this.cmp(node.max, value) === 0) {
        if (this.elementCount() === 2 && i === 0) {
          node.max = null
          return true
        }
        if (i === this.nodes.length - 1) {
          node.max = null
          return true
        }
        const replacement = this.popLastElement()
        if (i >= this.nodes.length) return true
        this.nodes[i]!.max = replacement
        this.fixNode(i)
        this.bubbleUp(i)
        this.trickleDown(i)
        return true
      }
    }
    return false
  }

  update(oldValue: T, newValue: T): boolean {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]!
      if (this.cmp(node.min, oldValue) === 0) {
        node.min = newValue
        this.fixNode(i)
        this.bubbleUp(i)
        this.trickleDown(i)
        return true
      }
      if (node.max !== null && this.cmp(node.max, oldValue) === 0) {
        node.max = newValue
        this.fixNode(i)
        this.bubbleUp(i)
        this.trickleDown(i)
        return true
      }
    }
    return false
  }

  toArray(): T[] {
    const result: T[] = []
    for (const node of this.nodes) {
      result.push(node.min)
      if (node.max !== null) result.push(node.max)
    }
    return result
  }

  merge(other: IntervalHeap<T>): IntervalHeap<T> {
    const combined = this.toArray()
    combined.push(...other.toArray())
    return new IntervalHeap<T>({
      initialValues: combined,
      comparator: this.cmp,
    })
  }

  clone(): IntervalHeap<T> {
    return new IntervalHeap<T>({
      initialValues: this.toArray(),
      comparator: this.cmp,
    })
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (const node of this.nodes) {
      callback(node.min, idx++)
      if (node.max !== null) callback(node.max, idx++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const node of this.nodes) {
      yield node.min
      if (node.max !== null) yield node.max
    }
  }
}

export type { IntervalHeapOptions } from './types.js'
