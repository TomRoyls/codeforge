import type { LindyEffectOptions, LindyItem } from "./types.js"

export class LindyEffect {
  private halfLife: number
  private now: () => number
  private store: Map<string, LindyItem> = new Map()

  constructor(options?: LindyEffectOptions) {
    this.halfLife = options?.halfLife ?? 1
    this.now = options?.now ?? (() => Date.now())
  }

  add(key: string): void {
    const t = this.now()
    this.store.set(key, { addedAt: t, observations: 1, lastSeen: t })
  }

  observe(key: string): void {
    const item = this.store.get(key)
    if (!item) return
    item.observations++
    item.lastSeen = this.now()
  }

  remove(key: string): boolean {
    return this.store.delete(key)
  }

  has(key: string): boolean {
    return this.store.has(key)
  }

  age(key: string): number {
    const item = this.store.get(key)
    if (!item) return 0
    return Math.max(0, this.now() - item.addedAt)
  }

  lindyScore(key: string): number {
    const item = this.store.get(key)
    if (!item) return 0
    const currentAge = Math.max(1, this.now() - item.addedAt)
    return Math.min(1, (item.observations * this.halfLife) / currentAge)
  }

  expectedLifetime(key: string): number {
    const item = this.store.get(key)
    if (!item) return 0
    return this.now() - item.addedAt
  }

  survivalProbability(key: string, futureMs: number): number {
    const item = this.store.get(key)
    if (!item) return 0
    const currentAge = Math.max(1, this.now() - item.addedAt)
    return currentAge / (currentAge + futureMs)
  }

  rank(): string[] {
    const keys = [...this.store.keys()]
    keys.sort((a, b) => this.lindyScore(b) - this.lindyScore(a))
    return keys
  }

  topK(k: number): Array<{ key: string; score: number }> {
    const ranked = this.rank()
    const top = ranked.slice(0, Math.max(0, k))
    return top.map((key) => ({ key, score: this.lindyScore(key) }))
  }

  get size(): number {
    return this.store.size
  }

  get items(): string[] {
    return [...this.store.keys()]
  }

  getItem(key: string): LindyItem | undefined {
    return this.store.get(key)
  }

  reset(): void {
    this.store.clear()
  }

  bulkObserve(keys: string[]): void {
    const t = this.now()
    for (const key of keys) {
      const item = this.store.get(key)
      if (item) {
        item.observations++
        item.lastSeen = t
      }
    }
  }

  decay(key: string, factor: number): void {
    const item = this.store.get(key)
    if (!item) return
    item.observations = Math.max(1, Math.floor(item.observations * factor))
  }
}
