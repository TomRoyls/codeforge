import { MinHash } from './min-hash.js'

export interface SimilarityResult<T> {
  item: T
  similarity: number
}

export class SimilarityIndex<T> {
  private entries: Map<string, { item: T; signature: number[] }> = new Map()
  private readonly numHashes: number
  private readonly seed: number
  private counter: number = 0

  constructor(numHashes: number = 128, seed: number = 0) {
    this.numHashes = numHashes
    this.seed = seed
  }

  add(id: string, item: T, features: string[]): void {
    const mh = new MinHash(this.numHashes, this.seed)
    for (const feature of features) {
      mh.add(feature)
    }
    this.entries.set(id, { item, signature: mh.signature })
  }

  query(features: string[], threshold: number = 0.5): SimilarityResult<T>[] {
    const mh = new MinHash(this.numHashes, this.seed)
    for (const feature of features) {
      mh.add(feature)
    }
    const querySig = mh.signature

    const results: SimilarityResult<T>[] = []
    for (const [, entry] of this.entries) {
      const sim = this.estimateSimilarity(querySig, entry.signature)
      if (sim >= threshold) {
        results.push({ item: entry.item, similarity: sim })
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity)
  }

  findSimilar(id: string, threshold: number = 0.5): SimilarityResult<T>[] {
    const entry = this.entries.get(id)
    if (!entry) return []

    const results: SimilarityResult<T>[] = []
    for (const [otherId, other] of this.entries) {
      if (otherId === id) continue
      const sim = this.estimateSimilarity(entry.signature, other.signature)
      if (sim >= threshold) {
        results.push({ item: other.item, similarity: sim })
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity)
  }

  contains(id: string): boolean {
    return this.entries.has(id)
  }

  get size(): number {
    return this.entries.size
  }

  clear(): void {
    this.entries.clear()
    this.counter = 0
  }

  remove(id: string): boolean {
    return this.entries.delete(id)
  }

  addAutoKey(item: T, features: string[]): string {
    const id = `_auto_${this.counter++}`
    this.add(id, item, features)
    return id
  }

  private estimateSimilarity(a: number[], b: number[]): number {
    let equal = 0
    for (let i = 0; i < this.numHashes; i++) {
      if (a[i] === b[i]) equal++
    }
    return equal / this.numHashes
  }
}
