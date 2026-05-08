import { readFile } from 'node:fs/promises'
import type { HashAlgorithm, HashComparison, DeduplicationResult, IntegrityCheck } from './types.js'
import { HashComputer } from './hash-computer.js'
import { HashStore } from './hash-store.js'

export class HashUtil {
  private computer: HashComputer
  private store: HashStore
  private defaultAlgorithm: HashAlgorithm

  constructor(defaultAlgorithm: HashAlgorithm = 'djb2') {
    this.defaultAlgorithm = defaultAlgorithm
    this.computer = new HashComputer()
    this.store = new HashStore(defaultAlgorithm)
  }

  hash(data: string): string {
    return this.computer.compute(data, this.defaultAlgorithm)
  }

  async hashFile(path: string): Promise<string> {
    const content = await readFile(path, 'utf-8')
    return this.computer.computeFileHash(content)
  }

  verify(data: string, expectedHash: string): boolean {
    const actual = this.computer.compute(data, this.defaultAlgorithm)
    return actual === expectedHash
  }

  compare(hash1: string, hash2: string): HashComparison {
    return {
      hash1,
      hash2,
      match: hash1 === hash2,
      algorithm: this.defaultAlgorithm,
    }
  }

  deduplicate(items: Map<string, string>): DeduplicationResult {
    const unique = new Map<string, string>()
    const duplicates = new Map<string, string[]>()
    const hashToKey = new Map<string, string>()
    let savedBytes = 0

    for (const [key, content] of items) {
      const contentHash = this.computer.compute(content, this.defaultAlgorithm)
      const existingKey = hashToKey.get(contentHash)

      if (existingKey !== undefined) {
        const existing = duplicates.get(existingKey)
        if (existing) {
          existing.push(key)
        } else {
          duplicates.set(existingKey, [key])
        }
        savedBytes += content.length
      } else {
        hashToKey.set(contentHash, key)
        unique.set(key, content)
      }
    }

    const totalItems = items.size
    const uniqueCount = unique.size
    const duplicateCount = totalItems - uniqueCount

    return {
      unique,
      duplicates,
      totalItems,
      uniqueCount,
      duplicateCount,
      savedBytes,
    }
  }

  checkIntegrity(
    entries: Map<string, { content: string; expectedHash: string }>,
  ): IntegrityCheck[] {
    const results: IntegrityCheck[] = []

    for (const [key, { content, expectedHash }] of entries) {
      const actualHash = this.computer.compute(content, this.defaultAlgorithm)
      results.push({
        key,
        expectedHash,
        actualHash,
        valid: actualHash === expectedHash,
        algorithm: this.defaultAlgorithm,
      })
    }

    return results
  }

  getAlgorithm(): HashAlgorithm {
    return this.defaultAlgorithm
  }

  setAlgorithm(algorithm: HashAlgorithm): void {
    this.defaultAlgorithm = algorithm
  }

  getStore(): HashStore {
    return this.store
  }
}
