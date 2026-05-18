import type { SemVer, VersionBump, VersionConfig, ConventionalCommit, CommitGroup } from './types.js'
import { DEFAULT_VERSION_CONFIG } from './types.js'
import { SemVerParser } from './semver-parser.js'
import { groupBy } from '../../utils/array-helpers.js'
import { capitalize } from '../../utils/string-helpers.js'

export class VersionManager {
  private config: VersionConfig
  private parser: SemVerParser

  constructor(config?: Partial<VersionConfig>) {
    this.config = { ...DEFAULT_VERSION_CONFIG, ...config }
    this.parser = new SemVerParser()
  }

  determineBump(commits: ConventionalCommit[]): VersionBump {
    if (commits.length === 0) return 'none'

    let hasBreaking = false
    let highestBump: VersionBump = 'none'

    const bumpRank: Record<VersionBump, number> = {
      none: 0,
      patch: 1,
      minor: 2,
      prerelease: 3,
      major: 4,
    }

    for (const commit of commits) {
      if (commit.breaking) {
        hasBreaking = true
      }
      const bump = this.config.bumpMap[commit.type]
      if (bump && bumpRank[bump] > bumpRank[highestBump]) {
        highestBump = bump
      }
    }

    if (hasBreaking) return 'major'
    return highestBump
  }

  computeNextVersion(current: SemVer, commits: ConventionalCommit[]): SemVer {
    const bump = this.determineBump(commits)
    return this.parser.increment(current, bump, this.config.prereleasePrefix)
  }

  parseConventionalCommit(message: string): ConventionalCommit {
    const firstLine = message.split('\n')[0] ?? ''
    const match = firstLine.match(/^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.*)$/)

    if (!match) {
      return {
        type: 'unknown',
        description: firstLine.trim(),
        breaking: false,
        footers: {},
      }
    }

    const type = match[1]!
    const scope = match[2] ?? undefined
    const breakingMarker = match[3] === '!'
    const description = match[4]!.trim()

    const lines = message.split('\n')
    let body: string | undefined
    const footers: Record<string, string> = {}
    let breaking = breakingMarker

    const footerRegex = /^(BREAKING CHANGE|BREAKING-CHANGE|[A-Za-z-]+):\s*(.*)$/
    let bodyLines: string[] = []
    let inFooters = false

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!
      if (!inFooters && line === '') {
        bodyLines.push(line)
        continue
      }
      const footerMatch = line.match(footerRegex)
      if (footerMatch) {
        inFooters = true
        const key = footerMatch[1]!
        const value = footerMatch[2]!.trim()
        if (key === 'BREAKING CHANGE' || key === 'BREAKING-CHANGE') {
          breaking = true
          footers['BREAKING CHANGE'] = value
        } else {
          footers[key] = value
        }
      } else if (inFooters) {
        inFooters = false
        bodyLines.push(line)
      } else {
        bodyLines.push(line)
      }
    }

    if (bodyLines.length > 0) {
      body = bodyLines.join('\n').trim()
      if (body.length === 0) body = undefined
    }

    return {
      type,
      scope,
      description,
      breaking,
      body,
      footers,
    }
  }

  parseCommitMessages(messages: string[]): ConventionalCommit[] {
    return messages.map((msg) => this.parseConventionalCommit(msg))
  }

  getBreakingChanges(commits: ConventionalCommit[]): string[] {
    const changes: string[] = []
    for (const commit of commits) {
      if (commit.breaking) {
        const bcFooter = commit.footers['BREAKING CHANGE'] ?? commit.footers['BREAKING-CHANGE']
        if (bcFooter) {
          changes.push(bcFooter)
        } else {
          changes.push(commit.description)
        }
      }
    }
    return changes
  }

  groupByType(commits: ConventionalCommit[]): CommitGroup[] {
    const groups = groupBy(commits, (c) => c.type)

    const result: CommitGroup[] = []
    for (const [type, typeCommits] of groups) {
      result.push({
        type,
        title: this.getTypeTitle(type),
        commits: typeCommits,
      })
    }

    return result
  }

  private getTypeTitle(type: string): string {
    const titles: Record<string, string> = {
      feat: 'Features',
      fix: 'Bug Fixes',
      perf: 'Performance Improvements',
      refactor: 'Code Refactoring',
      docs: 'Documentation',
      test: 'Tests',
      chore: 'Chores',
    }
    return titles[type] ?? capitalize(type)
  }

  isPrerelease(version: SemVer): boolean {
    return version.prerelease.length > 0
  }

  promotePrerelease(version: SemVer): SemVer {
    const result: SemVer = {
      major: version.major,
      minor: version.minor,
      patch: version.patch,
      prerelease: [],
      buildMetadata: version.buildMetadata,
      raw: '',
    }
    result.raw = this.parser.format(result)
    return result
  }
}
