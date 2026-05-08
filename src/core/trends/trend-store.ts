import * as fs from 'node:fs'
import * as path from 'node:path'
import type { TrendConfig, TrendSnapshot } from './types.js'

export class TrendStore {
  private config: TrendConfig

  constructor(config: TrendConfig) {
    this.config = config
  }

  saveSnapshot(snapshot: TrendSnapshot): void {
    const dir = this.config.storagePath
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const filePath = path.join(dir, `snapshot-${snapshot.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8')
  }

  loadSnapshots(): TrendSnapshot[] {
    const dir = this.config.storagePath
    if (!fs.existsSync(dir)) {
      return []
    }

    const files = fs.readdirSync(dir)
    const snapshots: TrendSnapshot[] = []

    for (const file of files) {
      if (file.startsWith('snapshot-') && file.endsWith('.json')) {
        const filePath = path.join(dir, file)
        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          const parsed = JSON.parse(content) as TrendSnapshot
          if (this.isValidSnapshot(parsed)) {
            snapshots.push(parsed)
          }
        } catch {
          // skip invalid files
        }
      }
    }

    snapshots.sort((a, b) => a.timestamp - b.timestamp)
    return snapshots
  }

  getLatestSnapshot(): TrendSnapshot | null {
    const snapshots = this.loadSnapshots()
    if (snapshots.length === 0) return null
    return snapshots[snapshots.length - 1]!
  }

  getSnapshotRange(from: number, to: number): TrendSnapshot[] {
    const snapshots = this.loadSnapshots()
    return snapshots.filter(s => s.timestamp >= from && s.timestamp <= to)
  }

  getSnapshotByCommit(commitHash: string): TrendSnapshot | null {
    const snapshots = this.loadSnapshots()
    return snapshots.find(s => s.commitHash === commitHash) ?? null
  }

  pruneSnapshots(maxCount: number): number {
    const snapshots = this.loadSnapshots()
    if (snapshots.length <= maxCount) return 0

    const toRemove = snapshots.length - maxCount
    const removed = snapshots.slice(0, toRemove)

    for (const snapshot of removed) {
      const filePath = path.join(this.config.storagePath, `snapshot-${snapshot.id}.json`)
      try {
        fs.unlinkSync(filePath)
      } catch {
        // skip files that can't be removed
      }
    }

    return toRemove
  }

  exportToJSON(snapshots: TrendSnapshot[]): string {
    return JSON.stringify(snapshots, null, 2)
  }

  importFromJSON(json: string): TrendSnapshot[] {
    const parsed = JSON.parse(json)

    if (!Array.isArray(parsed)) {
      throw new Error('Invalid JSON: expected an array of snapshots')
    }

    const snapshots: TrendSnapshot[] = []
    for (const item of parsed) {
      if (this.isValidSnapshot(item)) {
        snapshots.push(item as TrendSnapshot)
      } else {
        throw new Error('Invalid snapshot format in JSON')
      }
    }

    snapshots.sort((a, b) => a.timestamp - b.timestamp)
    return snapshots
  }

  private isValidSnapshot(obj: unknown): obj is TrendSnapshot {
    if (typeof obj !== 'object' || obj === null) return false
    const record = obj as Record<string, unknown>
    return (
      typeof record.id === 'string' &&
      typeof record.timestamp === 'number' &&
      Array.isArray(record.metrics) &&
      typeof record.summary === 'object' &&
      record.summary !== null
    )
  }
}
