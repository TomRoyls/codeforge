import type { TemporalNode, TemporalBSTOptions, TemporalEntry } from './types.js'
import { defaultComparator } from '../bst-map/types.js'

export class TemporalBST<K, V> {
  private root: TemporalNode<K, V> | null = null
  private _keyCount: number = 0
  private _historicalCount: number = 0
  private compare: (a: K, b: K) => number

  constructor(options?: TemporalBSTOptions<K, V>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: K, b: K) => number)
    if (options?.entries) {
      for (const [key, value, timestamp] of options.entries) {
        this.insert(key, value, timestamp)
      }
    }
  }

  insert(key: K, value: V, timestamp: number): void {
    this.root = this.insertNode(this.root, key, value, timestamp)
  }

  private insertNode(
    node: TemporalNode<K, V> | null,
    key: K,
    value: V,
    timestamp: number,
  ): TemporalNode<K, V> {
    if (node === null) {
      const timeline = new Map<number, V>()
      timeline.set(timestamp, value)
      this._keyCount++
      this._historicalCount++
      return { key, timeline, left: null, right: null }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value, timestamp)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value, timestamp)
    } else {
      if (!node.timeline.has(timestamp)) {
        this._historicalCount++
      }
      node.timeline.set(timestamp, value)
    }
    return node
  }

  private findNode(key: K): TemporalNode<K, V> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp === 0) return current
      current = cmp < 0 ? current.left : current.right
    }
    return null
  }

  private findLatestTimestamp(timeline: Map<number, V>): number | null {
    let maxTs: number | null = null
    for (const ts of timeline.keys()) {
      if (maxTs === null || ts > maxTs) {
        maxTs = ts
      }
    }
    return maxTs
  }

  private findTimestampAtOrBefore(timeline: Map<number, V>, timestamp: number): number | null {
    let bestTs: number | null = null
    for (const ts of timeline.keys()) {
      if (ts <= timestamp && (bestTs === null || ts > bestTs)) {
        bestTs = ts
      }
    }
    return bestTs
  }

  get(key: K, timestamp?: number): V | undefined {
    const node = this.findNode(key)
    if (node === null) return undefined
    if (timestamp !== undefined) {
      return node.timeline.get(timestamp)
    }
    const maxTs = this.findLatestTimestamp(node.timeline)
    return maxTs !== null ? node.timeline.get(maxTs) : undefined
  }

  getAt(key: K, timestamp: number): V | undefined {
    const node = this.findNode(key)
    if (node === null) return undefined
    const bestTs = this.findTimestampAtOrBefore(node.timeline, timestamp)
    return bestTs !== null ? node.timeline.get(bestTs) : undefined
  }

  getHistory(key: K): TemporalEntry<V>[] {
    const node = this.findNode(key)
    if (node === null) return []
    const entries: TemporalEntry<V>[] = []
    for (const [timestamp, value] of node.timeline) {
      entries.push({ timestamp, value })
    }
    entries.sort((a, b) => a.timestamp - b.timestamp)
    return entries
  }

  remove(key: K): boolean {
    if (!this.has(key)) return false
    const node = this.findNode(key)
    if (node !== null) {
      this._historicalCount -= node.timeline.size
    }
    this._keyCount--
    this.root = this.deleteNode(this.root, key)
    return true
  }

  private deleteNode(node: TemporalNode<K, V> | null, key: K): TemporalNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
      return node
    }
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    const successor = this.findMinNode(node.right)
    node.key = successor.key
    node.timeline = successor.timeline
    node.right = this.deleteNode(node.right, successor.key)
    return node
  }

  has(key: K): boolean {
    return this.findNode(key) !== null
  }

  size(): number {
    return this._keyCount
  }

  isEmpty(): boolean {
    return this._keyCount === 0
  }

  clear(): void {
    this.root = null
    this._keyCount = 0
    this._historicalCount = 0
  }

  keys(): K[] {
    const result: K[] = []
    this.collectKeys(this.root, result)
    return result
  }

  private collectKeys(node: TemporalNode<K, V> | null, result: K[]): void {
    if (node === null) return
    this.collectKeys(node.left, result)
    result.push(node.key)
    this.collectKeys(node.right, result)
  }

  minKey(): K | undefined {
    if (this.root === null) return undefined
    return this.findMinNode(this.root).key
  }

  maxKey(): K | undefined {
    if (this.root === null) return undefined
    return this.findMaxNode(this.root).key
  }

  private findMinNode(node: TemporalNode<K, V>): TemporalNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMaxNode(node: TemporalNode<K, V>): TemporalNode<K, V> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  rangeQuery(lowKey: K, highKey: K): { key: K; value: V }[] {
    const result: { key: K; value: V }[] = []
    this.collectRange(this.root, lowKey, highKey, result)
    return result
  }

  private collectRange(
    node: TemporalNode<K, V> | null,
    lowKey: K,
    highKey: K,
    result: { key: K; value: V }[],
  ): void {
    if (node === null) return
    const cmpLow = this.compare(node.key, lowKey)
    const cmpHigh = this.compare(node.key, highKey)
    if (cmpLow > 0) {
      this.collectRange(node.left, lowKey, highKey, result)
    }
    if (cmpLow >= 0 && cmpHigh <= 0) {
      const ts = this.findLatestTimestamp(node.timeline)
      if (ts !== null) {
        result.push({ key: node.key, value: node.timeline.get(ts)! })
      }
    }
    if (cmpHigh < 0) {
      this.collectRange(node.right, lowKey, highKey, result)
    }
  }

  getAtTime(timestamp: number): { key: K; value: V }[] {
    const result: { key: K; value: V }[] = []
    this.collectAtTime(this.root, timestamp, result)
    return result
  }

  private collectAtTime(
    node: TemporalNode<K, V> | null,
    timestamp: number,
    result: { key: K; value: V }[],
  ): void {
    if (node === null) return
    this.collectAtTime(node.left, timestamp, result)
    const ts = this.findTimestampAtOrBefore(node.timeline, timestamp)
    if (ts !== null) {
      result.push({ key: node.key, value: node.timeline.get(ts)! })
    }
    this.collectAtTime(node.right, timestamp, result)
  }

  currentSize(): number {
    return this._keyCount
  }

  historicalSize(): number {
    return this._historicalCount
  }
}

export type { TemporalNode, TemporalBSTOptions, TemporalEntry } from './types.js'
