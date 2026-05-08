import type {
  ConfigValue,
  ConfigSnapshot,
  ConfigDiffEntry,
  ConfigDiffResult,
  DiffOptions,
  ChangeType,
} from './types.js'
import { ConfigNormalizer } from './config-normalizer.js'

export class ConfigDiffer {
  private options: DiffOptions
  private normalizer: ConfigNormalizer

  constructor(options?: Partial<DiffOptions>) {
    this.normalizer = new ConfigNormalizer()
    this.options = {
      ignorePaths: options?.ignorePaths ?? [],
      includeUnchanged: options?.includeUnchanged ?? false,
      normalizeValues: options?.normalizeValues ?? true,
    }
  }

  diff(before: ConfigSnapshot, after: ConfigSnapshot): ConfigDiffResult {
    return this.diffObjects(before.config, after.config)
  }

  diffObjects(before: Record<string, ConfigValue>, after: Record<string, ConfigValue>): ConfigDiffResult {
    const normalizedBefore = this.options.normalizeValues
      ? (this.normalizer.normalize(before) as Record<string, ConfigValue>)
      : before
    const normalizedAfter = this.options.normalizeValues
      ? (this.normalizer.normalize(after) as Record<string, ConfigValue>)
      : after

    const beforeFlat = this.normalizer.flatten(normalizedBefore)
    const afterFlat = this.normalizer.flatten(normalizedAfter)

    const allKeys = new Set([...Object.keys(beforeFlat), ...Object.keys(afterFlat)])
    const entries: ConfigDiffEntry[] = []
    let added = 0
    let removed = 0
    let modified = 0
    let unchanged = 0

    for (const key of allKeys) {
      const path = this.normalizer.normalizePath(key)

      if (this.normalizer.matchesIgnorePattern(path, this.options.ignorePaths)) {
        continue
      }

      const inBefore = key in beforeFlat
      const inAfter = key in afterFlat

      if (!inBefore && inAfter) {
        entries.push({ path, oldValue: null, newValue: afterFlat[key]!, changeType: 'added' })
        added++
      } else if (inBefore && !inAfter) {
        entries.push({ path, oldValue: beforeFlat[key]!, newValue: null, changeType: 'removed' })
        removed++
      } else {
        const oldVal = beforeFlat[key]!
        const newVal = afterFlat[key]!
        if (this.valuesEqual(oldVal, newVal)) {
          unchanged++
        } else {
          entries.push({ path, oldValue: oldVal, newValue: newVal, changeType: 'modified' })
          modified++
        }
      }
    }

    return {
      entries,
      summary: {
        added,
        removed,
        modified,
        unchanged: this.options.includeUnchanged ? unchanged : 0,
      },
    }
  }

  getChangesByType(result: ConfigDiffResult, type: ChangeType): ConfigDiffEntry[] {
    return result.entries.filter((entry) => entry.changeType === type)
  }

  hasChanges(result: ConfigDiffResult): boolean {
    return result.entries.length > 0
  }

  applyDiff(config: Record<string, ConfigValue>, entries: ConfigDiffEntry[]): Record<string, ConfigValue> {
    for (const entry of entries) {
      if (entry.changeType === 'added' || entry.changeType === 'modified') {
        this.setValueAtPath(config, entry.path, entry.newValue)
      } else if (entry.changeType === 'removed') {
        this.deleteValueAtPath(config, entry.path)
      }
    }
    return config
  }

  revertDiff(config: Record<string, ConfigValue>, entries: ConfigDiffEntry[]): Record<string, ConfigValue> {
    for (const entry of entries) {
      if (entry.changeType === 'added') {
        this.deleteValueAtPath(config, entry.path)
      } else if (entry.changeType === 'removed' || entry.changeType === 'modified') {
        this.setValueAtPath(config, entry.path, entry.oldValue)
      }
    }
    return config
  }

  mergeDiffs(results: ConfigDiffResult[]): ConfigDiffResult {
    const allEntries: ConfigDiffEntry[] = []
    let added = 0
    let removed = 0
    let modified = 0
    let unchanged = 0

    for (const result of results) {
      allEntries.push(...result.entries)
      added += result.summary.added
      removed += result.summary.removed
      modified += result.summary.modified
      unchanged += result.summary.unchanged
    }

    return {
      entries: allEntries,
      summary: { added, removed, modified, unchanged },
    }
  }

  generatePatch(before: Record<string, ConfigValue>, after: Record<string, ConfigValue>): ConfigDiffEntry[] {
    const result = this.diffObjects(before, after)
    return result.entries
  }

  private valuesEqual(a: ConfigValue, b: ConfigValue): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  private setValueAtPath(config: Record<string, ConfigValue>, path: string[], value: ConfigValue): void {
    if (path.length === 0) return
    if (path.length === 1) {
      config[path[0]!] = value
      return
    }
    const head = path[0]!
    const existing = config[head]
    if (typeof existing === 'object' && existing !== null && !Array.isArray(existing)) {
      this.setValueAtPath(existing, path.slice(1), value)
    } else {
      const newObj: Record<string, ConfigValue> = {}
      config[head] = newObj
      this.setValueAtPath(newObj, path.slice(1), value)
    }
  }

  private deleteValueAtPath(config: Record<string, ConfigValue>, path: string[]): void {
    if (path.length === 0) return
    if (path.length === 1) {
      delete config[path[0]!]
      return
    }
    const head = path[0]!
    const existing = config[head]
    if (typeof existing === 'object' && existing !== null && !Array.isArray(existing)) {
      this.deleteValueAtPath(existing, path.slice(1))
    }
  }
}
