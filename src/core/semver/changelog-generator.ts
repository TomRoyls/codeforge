import type { ChangelogConfig, CommitGroup, ConventionalCommit, ReleaseNote } from './types.js'
import { DEFAULT_CHANGELOG_CONFIG } from './types.js'

export class ChangelogGenerator {
  private config: ChangelogConfig

  constructor(config?: Partial<ChangelogConfig>) {
    this.config = { ...DEFAULT_CHANGELOG_CONFIG, ...config }
  }

  generate(releases: ReleaseNote[]): string {
    const lines: string[] = []
    lines.push(`# ${this.config.title}`)
    lines.push('')

    for (const release of releases) {
      lines.push(this.generateRelease(release))
    }

    return lines.join('\n').trim() + '\n'
  }

  generateRelease(note: ReleaseNote): string {
    const lines: string[] = []
    lines.push(`## ${note.title} (${note.date})`)
    lines.push('')

    if (note.summary) {
      lines.push(note.summary)
      lines.push('')
    }

    if (note.breakingChanges.length > 0) {
      lines.push('### BREAKING CHANGES')
      lines.push('')
      for (const change of note.breakingChanges) {
        lines.push(`* ${change}`)
      }
      lines.push('')
    }

    const typeOrder = this.config.renderOrder
    const sectionMap = new Map<string, CommitGroup>()
    for (const section of note.sections) {
      sectionMap.set(section.type, section)
    }

    for (const type of typeOrder) {
      const group = sectionMap.get(type)
      if (!group || group.commits.length === 0) continue
      const configType = this.config.types.find((t) => t.type === type)
      if (configType?.hidden) continue
      lines.push(this.generateSection(group))
    }

    for (const [type, group] of sectionMap) {
      if (!typeOrder.includes(type)) {
        lines.push(this.generateSection(group))
      }
    }

    return lines.join('\n')
  }

  generateSection(group: CommitGroup): string {
    const lines: string[] = []
    lines.push(`### ${group.title}`)
    lines.push('')
    for (const commit of group.commits) {
      lines.push(`* ${this.formatCommit(commit)}`)
    }
    lines.push('')
    return lines.join('\n')
  }

  formatCommit(commit: ConventionalCommit): string {
    let result = ''
    if (commit.scope) {
      result = `**${commit.scope}:** `
    }
    result += commit.description
    if (commit.breaking) {
      result += ' (**BREAKING**)'
    }
    return result
  }

  createReleaseNote(version: string, commits: ConventionalCommit[], date?: string): ReleaseNote {
    const releaseDate = date ?? new Date().toISOString().split('T')[0]!

    const groups = new Map<string, ConventionalCommit[]>()

    for (const commit of commits) {
      const existing = groups.get(commit.type)
      if (existing) {
        existing.push(commit)
      } else {
        groups.set(commit.type, [commit])
      }
    }

    const sections: CommitGroup[] = []
    for (const [type, typeCommits] of groups) {
      const configType = this.config.types.find((t) => t.type === type)
      sections.push({
        type,
        title: configType?.section ?? type.charAt(0).toUpperCase() + type.slice(1),
        commits: typeCommits,
      })
    }

    const breakingChanges: string[] = []
    for (const commit of commits) {
      if (commit.breaking) {
        const bcFooter = commit.footers['BREAKING CHANGE'] ?? commit.footers['BREAKING-CHANGE']
        if (bcFooter) {
          breakingChanges.push(bcFooter)
        } else {
          breakingChanges.push(commit.description)
        }
      }
    }

    const summary = this.generateSummary(commits)

    return {
      version,
      date: releaseDate,
      title: version,
      sections,
      breakingChanges,
      summary,
    }
  }

  generateSummary(commits: ConventionalCommit[]): string {
    if (commits.length === 0) return ''

    const feats = commits.filter((c) => c.type === 'feat').length
    const fixes = commits.filter((c) => c.type === 'fix').length
    const breaking = commits.filter((c) => c.breaking).length
    const total = commits.length

    const parts: string[] = []
    if (feats > 0) parts.push(`${feats} feature${feats > 1 ? 's' : ''}`)
    if (fixes > 0) parts.push(`${fixes} fix${fixes > 1 ? 'es' : ''}`)
    if (breaking > 0) parts.push(`${breaking} breaking change${breaking > 1 ? 's' : ''}`)

    const other = total - feats - fixes
    if (other > 0 && parts.length > 0) {
      parts.push(`${other} other change${other > 1 ? 's' : ''}`)
    }

    if (parts.length === 0) {
      return `${total} commit${total > 1 ? 's' : ''}`
    }

    return parts.join(', ')
  }

  compareVersions(from: ReleaseNote, to: ReleaseNote): string {
    const lines: string[] = []
    lines.push(`## Changes from ${from.version} to ${to.version}`)
    lines.push('')

    const fromTypes = new Set(from.sections.map((s) => s.type))
    const toTypes = new Set(to.sections.map((s) => s.type))

    const newTypes = [...toTypes].filter((t) => !fromTypes.has(t))
    const removedTypes = [...fromTypes].filter((t) => !toTypes.has(t))

    if (newTypes.length > 0) {
      lines.push(`### New sections: ${newTypes.join(', ')}`)
      lines.push('')
    }

    if (removedTypes.length > 0) {
      lines.push(`### Removed sections: ${removedTypes.join(', ')}`)
      lines.push('')
    }

    for (const section of to.sections) {
      lines.push(`### ${section.title}`)
      lines.push('')
      for (const commit of section.commits) {
        lines.push(`* ${this.formatCommit(commit)}`)
      }
      lines.push('')
    }

    return lines.join('\n').trim()
  }
}
