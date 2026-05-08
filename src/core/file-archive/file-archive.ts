import { createHash } from 'node:crypto'
import { randomUUID } from 'node:crypto'
import { ArchiveStore } from './archive-store.js'
import type {
  ArchivedFile,
  ArchiveSnapshot,
  ArchiveDiff,
  ArchiveConfig,
  RestoreOptions,
  RestoreResult,
} from './types.js'
import { DEFAULT_ARCHIVE_CONFIG } from './types.js'

export class FileArchive {
  private config: ArchiveConfig
  private store: ArchiveStore
  private snapshots = new Map<string, ArchiveSnapshot>()

  constructor(config?: Partial<ArchiveConfig>) {
    this.config = { ...DEFAULT_ARCHIVE_CONFIG, ...config }
    this.store = new ArchiveStore()
  }

  private computeHash(content: string): string {
    return createHash(this.config.hashAlgorithm).update(content).digest('hex')
  }

  archive(path: string, content: string, metadata?: Record<string, unknown>): ArchivedFile {
    const existing = this.store.getLatest(path)
    const version = existing ? existing.version + 1 : 1
    const hash = this.computeHash(content)

    if (existing && existing.hash === hash) {
      return existing
    }

    const file: ArchivedFile = {
      id: randomUUID(),
      path,
      content,
      version,
      hash,
      archivedAt: Date.now(),
      metadata: metadata ?? {},
      tags: [],
      size: Buffer.byteLength(content, 'utf8'),
    }

    this.store.add(file)
    this.enforceMaxVersions(path)

    return file
  }

  private enforceMaxVersions(path: string): void {
    const versions = this.store.getVersions(path)
    while (versions.length > this.config.maxVersions) {
      const oldest = versions.shift()
      if (oldest !== undefined) {
        this.store.remove(path, oldest)
      }
    }
  }

  archiveMany(files: { path: string; content: string; metadata?: Record<string, unknown> }[]): ArchivedFile[] {
    return files.map((f) => this.archive(f.path, f.content, f.metadata))
  }

  restore(path: string, options?: Partial<RestoreOptions>): RestoreResult {
    const dryRun = options?.dryRun ?? false
    const targetVersion = options?.version
    const file = this.store.get(path, targetVersion)

    if (!file) {
      return {
        path,
        restored: false,
        version: targetVersion ?? 0,
        error: targetVersion !== undefined
          ? `Version ${targetVersion} not found for path: ${path}`
          : `No archived file found for path: ${path}`,
      }
    }

    if (dryRun) {
      return { path, restored: false, version: file.version }
    }

    return { path, restored: true, version: file.version }
  }

  restoreMany(paths: string[], options?: Partial<RestoreOptions>): RestoreResult[] {
    return paths.map((p) => this.restore(p, options))
  }

  getHistory(path: string): ArchivedFile[] {
    return this.store.getAll(path)
  }

  getDiff(path: string, fromVersion: number, toVersion: number): ArchiveDiff {
    const fromFile = this.store.get(path, fromVersion)
    const toFile = this.store.get(path, toVersion)

    if (!fromFile && !toFile) {
      return {
        path,
        type: 'unchanged',
        oldVersion: fromVersion,
        newVersion: toVersion,
      }
    }

    if (!fromFile) {
      return {
        path,
        type: 'added',
        newHash: toFile!.hash,
        newVersion: toFile!.version,
      }
    }

    if (!toFile) {
      return {
        path,
        type: 'removed',
        oldHash: fromFile.hash,
        oldVersion: fromFile.version,
      }
    }

    if (fromFile.hash === toFile.hash) {
      return {
        path,
        type: 'unchanged',
        oldHash: fromFile.hash,
        newHash: toFile.hash,
        oldVersion: fromFile.version,
        newVersion: toFile.version,
      }
    }

    return {
      path,
      type: 'modified',
      oldHash: fromFile.hash,
      newHash: toFile.hash,
      oldVersion: fromFile.version,
      newVersion: toFile.version,
    }
  }

  diffSnapshots(snapshot1: ArchiveSnapshot, snapshot2: ArchiveSnapshot): ArchiveDiff[] {
    const diffs: ArchiveDiff[] = []
    const allPaths = new Set<string>()

    for (const path of snapshot1.files.keys()) {
      allPaths.add(path)
    }
    for (const path of snapshot2.files.keys()) {
      allPaths.add(path)
    }

    for (const path of allPaths) {
      const file1 = snapshot1.files.get(path)
      const file2 = snapshot2.files.get(path)

      if (!file1 && file2) {
        diffs.push({
          path,
          type: 'added',
          newHash: file2.hash,
          newVersion: file2.version,
        })
      } else if (file1 && !file2) {
        diffs.push({
          path,
          type: 'removed',
          oldHash: file1.hash,
          oldVersion: file1.version,
        })
      } else if (file1 && file2) {
        if (file1.hash === file2.hash) {
          diffs.push({
            path,
            type: 'unchanged',
            oldHash: file1.hash,
            newHash: file2.hash,
            oldVersion: file1.version,
            newVersion: file2.version,
          })
        } else {
          diffs.push({
            path,
            type: 'modified',
            oldHash: file1.hash,
            newHash: file2.hash,
            oldVersion: file1.version,
            newVersion: file2.version,
          })
        }
      }
    }

    return diffs
  }

  createSnapshot(name: string, tag?: string, description?: string): ArchiveSnapshot {
    const files = new Map<string, ArchivedFile>()
    const snapshot: ArchiveSnapshot = {
      id: randomUUID(),
      name,
      files,
      createdAt: Date.now(),
      description,
      tag,
    }

    for (const path of this.store.paths()) {
      const file = this.store.getLatest(path)
      if (file) {
        files.set(file.path, { ...file })
      }
    }

    this.snapshots.set(snapshot.id, snapshot)
    return snapshot
  }

  restoreSnapshot(snapshotId: string): RestoreResult[] {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) {
      return [{ path: '', restored: false, version: 0, error: `Snapshot not found: ${snapshotId}` }]
    }

    const results: RestoreResult[] = []
    for (const [path, file] of snapshot.files) {
      results.push({ path, restored: true, version: file.version })
    }
    return results
  }

  delete(path: string): boolean {
    return this.store.remove(path)
  }

  getConfig(): ArchiveConfig {
    return { ...this.config }
  }

  getStats(): { totalFiles: number; totalVersions: number; totalSize: number } {
    let totalFiles = 0
    let totalVersions = 0
    let totalSize = 0

    for (const path of this.store.paths()) {
      const all = this.store.getAll(path)
      totalVersions += all.length
      for (const file of all) {
        totalSize += file.size
      }
    }

    totalFiles = this.store.paths().length

    return { totalFiles, totalVersions, totalSize }
  }
}
