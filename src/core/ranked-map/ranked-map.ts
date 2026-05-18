import type { RankedEntry, RankedMapOptions, ScoreComparator, InternalEntry } from './types.js'

export class RankedMap<K, V> {
  private items: InternalEntry<K, V>[] = []
  private keyMap = new Map<K, number>()
  private nextInsertionOrder = 0
  private compareScores: ScoreComparator

  constructor(options?: RankedMapOptions) {
    this.compareScores = options?.compareScores ?? ((a: number, b: number) => b - a)
  }

  set(key: K, value: V, score: number): void {
    const existingIndex = this.keyMap.get(key)
    if (existingIndex !== undefined) {
      const existing = this.items[existingIndex]!
      if (existing.score === score) {
        existing.value = value
        return
      }
      this.items.splice(existingIndex, 1)
      this.rebuildIndex(existingIndex)
    }
    let maxOrder = 0
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i]!.insertionOrder > maxOrder) maxOrder = this.items[i]!.insertionOrder
    }
    const insertionOrder = existingIndex !== undefined
      ? this.items.length > 0 ? maxOrder + 1 : this.nextInsertionOrder++
      : this.nextInsertionOrder++
    const entry: InternalEntry<K, V> = { key, value, score, insertionOrder }
    const pos = this.findInsertPosition(entry)
    this.items.splice(pos, 0, entry)
    this.rebuildIndex(pos)
  }

  private findInsertPosition(entry: InternalEntry<K, V>): number {
    let low = 0
    let high = this.items.length
    while (low < high) {
      const mid = (low + high) >>> 1
      const midEntry = this.items[mid]!
      const cmp = this.compareEntries(midEntry, entry)
      if (cmp < 0) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  private compareEntries(a: InternalEntry<K, V>, b: InternalEntry<K, V>): number {
    const scoreCmp = this.compareScores(a.score, b.score)
    if (scoreCmp !== 0) return scoreCmp
    return a.insertionOrder - b.insertionOrder
  }

  private rebuildIndex(fromIndex: number): void {
    for (let i = fromIndex; i < this.items.length; i++) {
      this.keyMap.set(this.items[i]!.key, i)
    }
  }

  get(key: K): { value: V; score: number } | undefined {
    const index = this.keyMap.get(key)
    if (index === undefined) return undefined
    const entry = this.items[index]!
    return { value: entry.value, score: entry.score }
  }

  has(key: K): boolean {
    return this.keyMap.has(key)
  }

  delete(key: K): boolean {
    const index = this.keyMap.get(key)
    if (index === undefined) return false
    this.keyMap.delete(key)
    this.items.splice(index, 1)
    this.rebuildIndex(index)
    return true
  }

  getByRank(rank: number): RankedEntry<K, V> | undefined {
    if (rank < 1 || rank > this.items.length) return undefined
    const entry = this.items[rank - 1]!
    return { key: entry.key, value: entry.value, score: entry.score }
  }

  getRank(key: K): number {
    const index = this.keyMap.get(key)
    if (index === undefined) return -1
    return index + 1
  }

  updateScore(key: K, newScore: number): boolean {
    const index = this.keyMap.get(key)
    if (index === undefined) return false
    const entry = this.items[index]!
    if (entry.score === newScore) return true
    this.items.splice(index, 1)
    this.rebuildIndex(index)
    entry.score = newScore
    const newPos = this.findInsertPosition(entry)
    this.items.splice(newPos, 0, entry)
    this.rebuildIndex(newPos <= index ? newPos : index)
    return true
  }

  topK(k: number): RankedEntry<K, V>[] {
    const count = Math.min(k, this.items.length)
    const result: RankedEntry<K, V>[] = []
    for (let i = 0; i < count; i++) {
      const entry = this.items[i]!
      result.push({ key: entry.key, value: entry.value, score: entry.score })
    }
    return result
  }

  bottomK(k: number): RankedEntry<K, V>[] {
    const count = Math.min(k, this.items.length)
    const result: RankedEntry<K, V>[] = []
    const start = this.items.length - count
    for (let i = start; i < this.items.length; i++) {
      const entry = this.items[i]!
      result.push({ key: entry.key, value: entry.value, score: entry.score })
    }
    return result
  }

  rangeByRank(fromRank: number, toRank: number): RankedEntry<K, V>[] {
    if (fromRank < 1) fromRank = 1
    if (toRank > this.items.length) toRank = this.items.length
    if (fromRank > toRank) return []
    const result: RankedEntry<K, V>[] = []
    for (let i = fromRank - 1; i < toRank; i++) {
      const entry = this.items[i]!
      result.push({ key: entry.key, value: entry.value, score: entry.score })
    }
    return result
  }

  betweenRanks(fromRank: number, toRank: number): RankedEntry<K, V>[] {
    return this.rangeByRank(fromRank, toRank)
  }

  rangeByScore(minScore: number, maxScore: number): RankedEntry<K, V>[] {
    const descending = this.compareScores(1, 0) < 0
    const result: RankedEntry<K, V>[] = []
    for (const entry of this.items) {
      if (entry.score >= minScore && entry.score <= maxScore) {
        result.push({ key: entry.key, value: entry.value, score: entry.score })
      }
      if (descending && entry.score < minScore) break
      if (!descending && entry.score > maxScore) break
    }
    return result
  }

  get size(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  clear(): void {
    this.items = []
    this.keyMap.clear()
    this.nextInsertionOrder = 0
  }

  keys(): K[] {
    return this.items.map(e => e.key)
  }

  values(): V[] {
    return this.items.map(e => e.value)
  }

  entries(): RankedEntry<K, V>[] {
    return this.items.map(e => ({ key: e.key, value: e.value, score: e.score }))
  }

  [Symbol.iterator](): Iterator<RankedEntry<K, V>> {
    let index = 0
    const allItems = this.items
    return {
      next: () => {
        if (index < allItems.length) {
          const entry = allItems[index]!
          index++
          return {
            value: { key: entry.key, value: entry.value, score: entry.score },
            done: false,
          }
        }
        return { value: undefined, done: true } as IteratorResult<RankedEntry<K, V>>
      },
    }
  }
}

export type { RankedEntry, RankedMapOptions, ScoreComparator } from './types.js'
