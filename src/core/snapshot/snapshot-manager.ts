import { SnapshotStore } from './snapshot-store.js'
import { SnapshotComparator } from './snapshot-comparator.js'
import type { Snapshot, SnapshotDiff, UpdateResult, SnapshotReport } from './types.js'

export class SnapshotManager {
  private store: SnapshotStore
  private comparator: SnapshotComparator

  constructor(store?: SnapshotStore, comparator?: SnapshotComparator) {
    this.store = store ?? new SnapshotStore()
    this.comparator = comparator ?? new SnapshotComparator()
  }

  assert(name: string, content: string): SnapshotDiff {
    const existing = this.store.load(name)
    if (existing === null) {
      const diff = this.comparator.compare('', content)
      diff.name = name
      diff.id = ''
      return diff
    }
    const diff = this.comparator.compare(content, existing.content)
    diff.name = name
    diff.id = existing.id
    return diff
  }

  update(name: string, content: string): UpdateResult {
    const existing = this.store.load(name)
    const previousHash = existing?.hash ?? null
    const snapshot = this.store.save(name, content)
    const updated = previousHash !== null && previousHash !== snapshot.hash
    return {
      updated,
      previousHash,
      newHash: snapshot.hash,
      created: previousHash === null,
    }
  }

  checkAll(entries: Map<string, string>): SnapshotReport {
    const results: SnapshotDiff[] = []
    let matched = 0
    let mismatched = 0
    let newCount = 0

    const existingNames = new Set(this.store.list().map((s) => s.name))
    const entryNames = new Set(entries.keys())

    for (const [name, content] of entries) {
      const diff = this.assert(name, content)
      results.push(diff)
      if (!existingNames.has(name)) {
        newCount++
      } else if (this.comparator.hasDifferences(diff)) {
        mismatched++
      } else {
        matched++
      }
    }

    const deletedNames = [...existingNames].filter((n) => !entryNames.has(n))

    return {
      totalSnapshots: entries.size,
      matched,
      mismatched,
      new: newCount,
      deleted: deletedNames.length,
      results,
    }
  }

  updateAll(entries: Map<string, string>): UpdateResult[] {
    const results: UpdateResult[] = []
    for (const [name, content] of entries) {
      results.push(this.update(name, content))
    }
    return results
  }

  getSummary(): { total: number; matched: number; new: number } {
    const snapshots = this.store.list()
    return {
      total: snapshots.length,
      matched: snapshots.length,
      new: 0,
    }
  }

  prune(keepNames: string[]): number {
    const keepSet = new Set(keepNames)
    const all = this.store.list()
    let pruned = 0
    for (const snapshot of all) {
      if (!keepSet.has(snapshot.name)) {
        this.store.delete(snapshot.name)
        pruned++
      }
    }
    return pruned
  }

  getOrCreate(name: string, content: string): Snapshot {
    const existing = this.store.load(name)
    if (existing !== null) return existing
    return this.store.save(name, content)
  }
}
