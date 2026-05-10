import type { ScoreEntry, ScoreBoardOptions, InternalEntry } from './types.js'

export class ScoreBoard {
  private items: InternalEntry[] = []
  private playerMap = new Map<string, number>()
  private nextInsertionOrder = 0
  private descending: boolean

  constructor(options?: ScoreBoardOptions) {
    this.descending = options?.orderBy !== 'asc'
  }

  addPlayer(player: string, score: number): void {
    if (this.playerMap.has(player)) return
    const entry: InternalEntry = { player, score, insertionOrder: this.nextInsertionOrder++ }
    const pos = this.findInsertPosition(entry)
    this.items.splice(pos, 0, entry)
    this.rebuildIndex(pos)
  }

  updateScore(player: string, delta: number): boolean {
    const index = this.playerMap.get(player)
    if (index === undefined) return false
    const entry = this.items[index]!
    const newScore = entry.score + delta
    return this.repositionEntry(index, entry, newScore)
  }

  setScore(player: string, score: number): boolean {
    const index = this.playerMap.get(player)
    if (index === undefined) return false
    const entry = this.items[index]!
    if (entry.score === score) return true
    return this.repositionEntry(index, entry, score)
  }

  private repositionEntry(index: number, entry: InternalEntry, newScore: number): boolean {
    this.items.splice(index, 1)
    this.rebuildIndex(index)
    entry.score = newScore
    const newPos = this.findInsertPosition(entry)
    this.items.splice(newPos, 0, entry)
    this.rebuildIndex(newPos <= index ? newPos : index)
    return true
  }

  getScore(player: string): number | undefined {
    const index = this.playerMap.get(player)
    if (index === undefined) return undefined
    return this.items[index]!.score
  }

  getRank(player: string): number {
    const index = this.playerMap.get(player)
    if (index === undefined) return -1
    return index + 1
  }

  getPlayerAtRank(rank: number): ScoreEntry | undefined {
    if (rank < 1 || rank > this.items.length) return undefined
    const entry = this.items[rank - 1]!
    return { player: entry.player, score: entry.score }
  }

  removePlayer(player: string): boolean {
    const index = this.playerMap.get(player)
    if (index === undefined) return false
    this.playerMap.delete(player)
    this.items.splice(index, 1)
    this.rebuildIndex(index)
    return true
  }

  has(player: string): boolean {
    return this.playerMap.has(player)
  }

  get size(): number {
    return this.items.length
  }

  topK(k: number): ScoreEntry[] {
    const count = Math.min(k, this.items.length)
    const result: ScoreEntry[] = []
    for (let i = 0; i < count; i++) {
      const entry = this.items[i]!
      result.push({ player: entry.player, score: entry.score })
    }
    return result
  }

  bottomK(k: number): ScoreEntry[] {
    const count = Math.min(k, this.items.length)
    const result: ScoreEntry[] = []
    const start = this.items.length - count
    for (let i = start; i < this.items.length; i++) {
      const entry = this.items[i]!
      result.push({ player: entry.player, score: entry.score })
    }
    return result
  }

  getRankRange(from: number, to: number): ScoreEntry[] {
    if (from < 1) from = 1
    if (to > this.items.length) to = this.items.length
    if (from > to) return []
    const result: ScoreEntry[] = []
    for (let i = from - 1; i < to; i++) {
      const entry = this.items[i]!
      result.push({ player: entry.player, score: entry.score })
    }
    return result
  }

  scoresAround(player: string, count: number): ScoreEntry[] {
    const index = this.playerMap.get(player)
    if (index === undefined) return []
    const start = Math.max(0, index - count)
    const end = Math.min(this.items.length, index + count + 1)
    const result: ScoreEntry[] = []
    for (let i = start; i < end; i++) {
      const entry = this.items[i]!
      result.push({ player: entry.player, score: entry.score })
    }
    return result
  }

  reset(): void {
    for (const entry of this.items) {
      entry.score = 0
    }
    this.stableSort()
    this.rebuildIndex(0)
  }

  clear(): void {
    this.items = []
    this.playerMap.clear()
    this.nextInsertionOrder = 0
  }

  leaderboard(): ScoreEntry[] {
    return this.items.map(e => ({ player: e.player, score: e.score }))
  }

  tieCount(player: string): number {
    const index = this.playerMap.get(player)
    if (index === undefined) return 0
    const score = this.items[index]!.score
    let count = 0
    for (const entry of this.items) {
      if (entry.score === score) count++
    }
    return count
  }

  private findInsertPosition(entry: InternalEntry): number {
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

  private compareEntries(a: InternalEntry, b: InternalEntry): number {
    const scoreCmp = this.descending ? b.score - a.score : a.score - b.score
    if (scoreCmp !== 0) return scoreCmp
    return a.insertionOrder - b.insertionOrder
  }

  private rebuildIndex(fromIndex: number): void {
    for (let i = fromIndex; i < this.items.length; i++) {
      this.playerMap.set(this.items[i]!.player, i)
    }
  }

  private stableSort(): void {
    this.items.sort((a, b) => this.compareEntries(a, b))
  }
}

export type { ScoreEntry, ScoreBoardOptions } from './types.js'
