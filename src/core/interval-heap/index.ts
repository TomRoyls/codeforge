import type { Comparator, IntervalHeapOptions, IntervalNode } from './types.js'

const defaultComparator: Comparator<unknown> = (a, b): number => {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

export class IntervalHeap<T> {
  private _nodes: IntervalNode<T>[] = []
  private readonly _comparator: Comparator<T>

  constructor(options?: IntervalHeapOptions<T>) {
    this._comparator = (options?.comparator ?? defaultComparator) as Comparator<T>
    if (options?.initialValues) {
      for (const val of options.initialValues) {
        this.insert(val)
      }
    }
  }

  private _fixNode(i: number): void {
    const node = this._nodes[i]!
    if (node.max !== null && this._comparator(node.max, node.min) < 0) {
      const tmp = node.min
      node.min = node.max
      node.max = tmp
    }
  }

  private _effMax(i: number): T {
    const node = this._nodes[i]!
    return node.max !== null ? node.max : node.min
  }

  private _elementCount(): number {
    let count = 0
    for (const node of this._nodes) {
      count++
      if (node.max !== null) count++
    }
    return count
  }

  private _bubbleUp(idx: number): void {
    while (idx > 0) {
      const pi = (idx - 1) >> 1
      const node = this._nodes[idx]!
      const parent = this._nodes[pi]!
      let swapped = false

      if (this._comparator(node.min, parent.min) < 0) {
        const tmp = node.min
        node.min = parent.min
        parent.min = tmp
        this._fixNode(idx)
        this._fixNode(pi)
        swapped = true
      }

      const nMax = this._effMax(idx)
      const pMax = this._effMax(pi)

      if (this._comparator(nMax, pMax) > 0) {
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
        this._fixNode(idx)
        this._fixNode(pi)
        swapped = true
      }

      if (!swapped) break
      idx = pi
    }
  }

  private _popLastElement(): T {
    const last = this._nodes[this._nodes.length - 1]!
    if (last.max !== null) {
      const val = last.max
      last.max = null
      return val
    }
    this._nodes.pop()
    return last.min
  }

  private _trickleDownMin(idx: number): void {
    const len = this._nodes.length
    while (idx < len) {
      let smallest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < len && this._comparator(this._nodes[left]!.min, this._nodes[smallest]!.min) < 0) {
        smallest = left
      }
      if (right < len && this._comparator(this._nodes[right]!.min, this._nodes[smallest]!.min) < 0) {
        smallest = right
      }
      if (smallest === idx) break
      const node = this._nodes[idx]!
      const child = this._nodes[smallest]!
      const tmp = node.min
      node.min = child.min
      child.min = tmp
      this._fixNode(idx)
      this._fixNode(smallest)
      idx = smallest
    }
  }

  private _trickleDownMax(idx: number): void {
    const len = this._nodes.length
    while (idx < len) {
      let largest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < len && this._comparator(this._effMax(left), this._effMax(largest)) > 0) {
        largest = left
      }
      if (right < len && this._comparator(this._effMax(right), this._effMax(largest)) > 0) {
        largest = right
      }
      if (largest === idx) break

      const node = this._nodes[idx]!
      const child = this._nodes[largest]!

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

      this._fixNode(idx)
      this._fixNode(largest)
      idx = largest
    }
  }

  private _trickleDown(idx: number): void {
    this._trickleDownMin(idx)
    this._trickleDownMax(idx)
  }

  insert(value: T): void {
    const len = this._nodes.length
    if (len > 0) {
      const last = this._nodes[len - 1]!
      if (last.max === null) {
        if (this._comparator(value, last.min) < 0) {
          last.max = last.min
          last.min = value
        } else {
          last.max = value
        }
        this._bubbleUp(len - 1)
        return
      }
    }
    this._nodes.push({ min: value, max: null })
    this._bubbleUp(this._nodes.length - 1)
  }

  getMin(): T {
    if (this._nodes.length === 0) {
      throw new Error('getMin called on empty heap')
    }
    return this._nodes[0]!.min
  }

  getMax(): T {
    if (this._nodes.length === 0) {
      throw new Error('getMax called on empty heap')
    }
    return this._effMax(0)
  }

  deleteMin(): T {
    if (this._nodes.length === 0) {
      throw new Error('deleteMin called on empty heap')
    }
    const result = this._nodes[0]!.min
    if (this._elementCount() === 1) {
      this._nodes = []
      return result
    }
    const replacement = this._popLastElement()
    this._nodes[0]!.min = replacement
    this._fixNode(0)
    this._trickleDown(0)
    return result
  }

  deleteMax(): T {
    if (this._nodes.length === 0) {
      throw new Error('deleteMax called on empty heap')
    }
    const first = this._nodes[0]!
    if (first.max === null) {
      return this.deleteMin()
    }
    const result = first.max
    if (this._elementCount() === 2) {
      first.max = null
      return result
    }
    const replacement = this._popLastElement()
    first.max = replacement
    this._fixNode(0)
    this._trickleDown(0)
    return result
  }

  replaceMin(value: T): T {
    if (this._nodes.length === 0) {
      throw new Error('replaceMin called on empty heap')
    }
    const old = this._nodes[0]!.min
    this._nodes[0]!.min = value
    this._fixNode(0)
    this._trickleDown(0)
    return old
  }

  replaceMax(value: T): T {
    if (this._nodes.length === 0) {
      throw new Error('replaceMax called on empty heap')
    }
    const first = this._nodes[0]!
    if (first.max === null) {
      const old = first.min
      first.min = value
      this._fixNode(0)
      this._trickleDown(0)
      return old
    }
    const old = first.max
    first.max = value
    this._fixNode(0)
    this._trickleDown(0)
    return old
  }

  get size(): number {
    return this._elementCount()
  }

  get isEmpty(): boolean {
    return this._nodes.length === 0
  }

  clear(): void {
    this._nodes = []
  }

  toArray(): T[] {
    const result: T[] = []
    for (const node of this._nodes) {
      result.push(node.min)
      if (node.max !== null) result.push(node.max)
    }
    result.sort(this._comparator)
    return result
  }

  contains(value: T): boolean {
    for (const node of this._nodes) {
      if (this._comparator(node.min, value) === 0) return true
      if (node.max !== null && this._comparator(node.max, value) === 0) return true
    }
    return false
  }

  merge(other: IntervalHeap<T>): void {
    if (other === this) return
    const source = other.toArray()
    for (const item of source) {
      this.insert(item)
    }
    other.clear()
  }

  *[Symbol.iterator](): Iterator<T> {
    const sorted = this.toArray()
    for (const item of sorted) {
      yield item
    }
  }
}

export type { Comparator, IntervalHeapOptions, IntervalNode } from './types.js'
