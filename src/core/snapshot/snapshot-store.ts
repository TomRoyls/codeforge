import { createHash } from 'crypto'
import { randomUUID } from 'crypto'
import type { Snapshot } from './types.js'

export class SnapshotStore {
  private snapshots: Map<string, Snapshot> = new Map()

  save(name: string, content: string, metadata: Record<string, unknown> = {}): Snapshot {
    const existing = this.snapshots.get(name)
    const hash = this.getHash(content)
    const snapshot: Snapshot = {
      id: randomUUID(),
      name,
      content,
      hash,
      createdAt: Date.now(),
      metadata,
      tags: (existing?.tags ?? []),
    }
    this.snapshots.set(name, snapshot)
    return snapshot
  }

  load(name: string): Snapshot | null {
    return this.snapshots.get(name) ?? null
  }

  delete(name: string): boolean {
    return this.snapshots.delete(name)
  }

  list(): Snapshot[] {
    return Array.from(this.snapshots.values())
  }

  exists(name: string): boolean {
    return this.snapshots.has(name)
  }

  getHash(content: string): string {
    return createHash('sha256').update(content).digest('hex')
  }

  clear(): void {
    this.snapshots.clear()
  }

  count(): number {
    return this.snapshots.size
  }
}
