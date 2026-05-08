import { DEFAULT_CHANGELOG_OPTIONS } from './types.js'
import type { ChangeCategory, ChangeEntry, ChangelogFormat, ChangelogOptions, VersionEntry } from './types.js'

const CATEGORY_LABELS: Record<ChangeCategory, string> = {
  added: 'Added',
  changed: 'Changed',
  deprecated: 'Deprecated',
  removed: 'Removed',
  fixed: 'Fixed',
  security: 'Security',
}

export class ChangelogGenerator {
  private options: ChangelogOptions
  private versions: VersionEntry[] = []
  private unreleased: ChangeEntry[] = []

  constructor(options?: Partial<ChangelogOptions>) {
    this.options = { ...DEFAULT_CHANGELOG_OPTIONS, ...options }
  }

  addChange(entry: ChangeEntry): void {
    this.unreleased.push({ ...entry })
  }

  addChanges(entries: ChangeEntry[]): void {
    for (const entry of entries) {
      this.addChange(entry)
    }
  }

  release(version: string, date?: string): VersionEntry {
    const entryDate = date ?? new Date().toISOString().slice(0, 10)
    const versionEntry: VersionEntry = {
      version,
      date: entryDate,
      changes: [...this.unreleased],
    }
    this.versions.push(versionEntry)
    this.unreleased = []
    return versionEntry
  }

  getUnreleased(): ChangeEntry[] {
    return [...this.unreleased]
  }

  getVersions(): VersionEntry[] {
    return [...this.versions]
  }

  getVersion(version: string): VersionEntry | undefined {
    return this.versions.find((v) => v.version === version)
  }

  getLatest(): VersionEntry | undefined {
    if (this.versions.length === 0) return undefined
    return this.versions[this.versions.length - 1]
  }

  getChangesByCategory(version: string, category: ChangeCategory): ChangeEntry[] {
    const v = this.getVersion(version)
    if (!v) return []
    return v.changes.filter((c) => c.category === category)
  }

  getChangesByScope(version: string, scope: string): ChangeEntry[] {
    const v = this.getVersion(version)
    if (!v) return []
    return v.changes.filter((c) => c.scope === scope)
  }

  getBreakingChanges(version: string): ChangeEntry[] {
    const v = this.getVersion(version)
    if (!v) return []
    return v.changes.filter((c) => c.breaking)
  }

  generate(format?: ChangelogFormat): string {
    const fmt = format ?? 'markdown'
    switch (fmt) {
      case 'markdown':
        return this.generateMarkdown()
      case 'json':
        return this.generateJSON()
      case 'text':
        return this.generateText()
    }
  }

  generateMarkdown(): string {
    const parts: string[] = []
    parts.push('# ' + this.options.title)
    parts.push('')

    if (this.unreleased.length > 0) {
      parts.push('## Unreleased')
      parts.push('')
      parts.push(this.renderChangesMarkdown(this.unreleased))
    }

    for (const version of this.versions) {
      parts.push(this.generateVersionMarkdown(version))
    }

    return parts.join('\n')
  }

  generateJSON(): string {
    const data = {
      title: this.options.title,
      versions: this.versions,
      unreleased: this.unreleased,
    }
    return JSON.stringify(data, null, 2)
  }

  generateText(): string {
    const parts: string[] = []
    parts.push(this.options.title)
    parts.push('')

    if (this.unreleased.length > 0) {
      parts.push('Unreleased')
      parts.push('')
      for (const change of this.unreleased) {
        const prefix = change.breaking ? '[BREAKING] ' : ''
        const scope = change.scope ? '(' + change.scope + ') ' : ''
        parts.push('- ' + prefix + scope + change.description)
      }
    }

    for (const version of this.versions) {
      const header = this.options.includeDate
        ? version.version + ' (' + version.date + ')'
        : version.version
      parts.push(header)
      parts.push('')
      for (const change of version.changes) {
        const prefix = change.breaking ? '[BREAKING] ' : ''
        const scope = change.scope ? '(' + change.scope + ') ' : ''
        parts.push('- ' + prefix + scope + change.description)
      }
    }

    return parts.join('\n')
  }

  generateVersionMarkdown(version: VersionEntry): string {
    const parts: string[] = []
    const header = this.options.includeDate
      ? version.version + ' (' + version.date + ')'
      : version.version
    parts.push('## ' + header)
    parts.push('')
    parts.push(this.renderChangesMarkdown(version.changes))
    return parts.join('\n')
  }

  getStatistics(): {
    totalVersions: number
    totalChanges: number
    byCategory: Record<ChangeCategory, number>
    breakingChanges: number
  } {
    const byCategory: Record<ChangeCategory, number> = {
      added: 0,
      changed: 0,
      deprecated: 0,
      removed: 0,
      fixed: 0,
      security: 0,
    }
    let totalChanges = 0
    let breakingChanges = 0
    for (const version of this.versions) {
      for (const change of version.changes) {
        totalChanges++
        byCategory[change.category]++
        if (change.breaking) breakingChanges++
      }
    }

    return {
      totalVersions: this.versions.length,
      totalChanges,
      byCategory,
      breakingChanges,
    }
  }

  clear(): void {
    this.versions = []
    this.unreleased = []
  }

  getOptions(): ChangelogOptions {
    return { ...this.options }
  }

  hasUnreleased(): boolean {
    return this.unreleased.length > 0
  }

  merge(other: ChangelogGenerator): void {
    const otherVersions = other.getVersions()
    for (const otherVersion of otherVersions) {
      const existing = this.getVersion(otherVersion.version)
      if (existing) {
        existing.changes.push(...otherVersion.changes.map((c) => ({ ...c })))
      } else {
        this.versions.push({
          ...otherVersion,
          changes: otherVersion.changes.map((c) => ({ ...c })),
        })
      }
    }
    const otherUnreleased = other.getUnreleased()
    this.unreleased.push(...otherUnreleased)
  }

  private renderChangesMarkdown(changes: ChangeEntry[]): string {
    const parts: string[] = []
    if (this.options.groupByCategory) {
      for (const category of this.options.categoryOrder) {
        const categoryChanges = changes.filter((c) => c.category === category)
        if (categoryChanges.length > 0) {
          const label = CATEGORY_LABELS[category]
          parts.push('### ' + label)
          parts.push('')
          for (const change of categoryChanges) {
            parts.push(this.renderChangeEntry(change))
          }
          parts.push('')
        }
      }
    } else {
      for (const change of changes) {
        parts.push(this.renderChangeEntry(change))
      }
    }
    return parts.join('\n')
  }

  private renderChangeEntry(change: ChangeEntry): string {
    const breaking = change.breaking ? '**BREAKING** ' : ''
    const scope = change.scope ? '**' + change.scope + '**: ' : ''
    const suffixes: string[] = []
    if (change.issue) suffixes.push('refs #' + change.issue)
    if (change.commit) suffixes.push(change.commit)
    const suffix = suffixes.length > 0 ? ' (' + suffixes.join(', ') + ')' : ''
    return '- ' + breaking + scope + change.description + suffix
  }
}
