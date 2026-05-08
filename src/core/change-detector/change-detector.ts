import type { FileEntry, FileChange, ChangeSummary, ChangeReport, DetectorConfig } from './types.js'
import { DEFAULT_DETECTOR_CONFIG } from './types.js'
import { HashComputer } from './hash-computer.js'

export class ChangeDetector {
  private baseline: Map<string, FileEntry>
  private hasher: HashComputer
  private config: DetectorConfig

  constructor(config?: Partial<DetectorConfig>) {
    this.config = { ...DEFAULT_DETECTOR_CONFIG, ...config }
    this.baseline = new Map()
    this.hasher = new HashComputer(this.config.algorithm)
  }

  setBaseline(entries: Map<string, FileEntry>): void {
    this.baseline = new Map(entries)
  }

  getBaseline(): Map<string, FileEntry> {
    return new Map(this.baseline)
  }

  detectChanges(current: Map<string, string>): ChangeReport {
    const changes: FileChange[] = []
    const processedPaths = new Set<string>()

    for (const [filePath, content] of current) {
      processedPaths.add(filePath)
      const newHash = this.hasher.compute(content)
      const existing = this.baseline.get(filePath)

      if (existing === undefined) {
        changes.push({
          path: filePath,
          changeType: 'added',
          newHash,
          newSize: content.length,
        })
      } else if (existing.hash !== newHash) {
        changes.push({
          path: filePath,
          changeType: 'modified',
          oldHash: existing.hash,
          newHash,
          oldSize: existing.size,
          newSize: content.length,
        })
      } else {
        changes.push({
          path: filePath,
          changeType: 'unchanged',
          oldHash: existing.hash,
          newHash,
          oldSize: existing.size,
          newSize: content.length,
        })
      }
    }

    for (const [filePath, entry] of this.baseline) {
      if (!processedPaths.has(filePath)) {
        changes.push({
          path: filePath,
          changeType: 'removed',
          oldHash: entry.hash,
          oldSize: entry.size,
        })
      }
    }

    const summary = this.buildSummary(changes)

    const filtered = this.config.includeUnchanged
      ? changes
      : changes.filter((c) => c.changeType !== 'unchanged')

    return {
      changes: filtered,
      summary,
    }
  }

  detectChangesFromEntries(current: FileEntry[]): ChangeReport {
    const contentMap = new Map<string, string>()
    const entryMap = new Map<string, FileEntry>()

    for (const entry of current) {
      contentMap.set(entry.path, '')
      entryMap.set(entry.path, entry)
    }

    const changes: FileChange[] = []
    const processedPaths = new Set<string>()

    for (const entry of current) {
      processedPaths.add(entry.path)
      const existing = this.baseline.get(entry.path)

      if (existing === undefined) {
        changes.push({
          path: entry.path,
          changeType: 'added',
          newHash: entry.hash,
          newSize: entry.size,
        })
      } else if (existing.hash !== entry.hash) {
        changes.push({
          path: entry.path,
          changeType: 'modified',
          oldHash: existing.hash,
          newHash: entry.hash,
          oldSize: existing.size,
          newSize: entry.size,
        })
      } else {
        changes.push({
          path: entry.path,
          changeType: 'unchanged',
          oldHash: existing.hash,
          newHash: entry.hash,
          oldSize: existing.size,
          newSize: entry.size,
        })
      }
    }

    for (const [filePath, entry] of this.baseline) {
      if (!processedPaths.has(filePath)) {
        changes.push({
          path: filePath,
          changeType: 'removed',
          oldHash: entry.hash,
          oldSize: entry.size,
        })
      }
    }

    const summary = this.buildSummary(changes)

    const filtered = this.config.includeUnchanged
      ? changes
      : changes.filter((c) => c.changeType !== 'unchanged')

    return {
      changes: filtered,
      summary,
    }
  }

  hasChanged(path: string, content: string): boolean {
    const existing = this.baseline.get(path)
    if (existing === undefined) {
      return true
    }
    const newHash = this.hasher.compute(content)
    return existing.hash !== newHash
  }

  getEntry(path: string): FileEntry | undefined {
    return this.baseline.get(path)
  }

  updateBaseline(path: string, content: string): void {
    const hash = this.hasher.compute(content)
    this.baseline.set(path, {
      path,
      hash,
      size: content.length,
      lastModified: Date.now(),
    })
  }

  removeFromBaseline(path: string): boolean {
    return this.baseline.delete(path)
  }

  getConfig(): DetectorConfig {
    return { ...this.config }
  }

  private buildSummary(changes: FileChange[]): ChangeSummary {
    let added = 0
    let removed = 0
    let modified = 0
    let unchanged = 0

    for (const change of changes) {
      switch (change.changeType) {
        case 'added':
          added++
          break
        case 'removed':
          removed++
          break
        case 'modified':
          modified++
          break
        case 'unchanged':
          unchanged++
          break
      }
    }

    return {
      added,
      removed,
      modified,
      unchanged,
      total: added + removed + modified + unchanged,
    }
  }
}
