export interface SemVer {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  buildMetadata: string[]
  raw: string
}

export type VersionBump = 'major' | 'minor' | 'patch' | 'prerelease' | 'none'

export interface ConventionalCommit {
  type: string
  scope?: string
  description: string
  breaking: boolean
  body?: string
  footers: Record<string, string>
}

export interface CommitGroup {
  type: string
  title: string
  commits: ConventionalCommit[]
}

export interface ReleaseNote {
  version: string
  date: string
  title: string
  sections: CommitGroup[]
  breakingChanges: string[]
  summary: string
}

export interface ChangelogConfig {
  title: string
  types: { type: string; section: string; hidden?: boolean }[]
  renderOrder: string[]
}

export interface VersionConfig {
  prereleasePrefix: string
  tagPrefix: string
  bumpMap: Record<string, VersionBump>
}

export const DEFAULT_VERSION_CONFIG: VersionConfig = {
  prereleasePrefix: 'rc',
  tagPrefix: 'v',
  bumpMap: {
    feat: 'minor',
    fix: 'patch',
    perf: 'patch',
    refactor: 'patch',
    docs: 'none',
    test: 'none',
    chore: 'none',
    breaking: 'major',
  },
}

export const DEFAULT_CHANGELOG_CONFIG: ChangelogConfig = {
  title: 'Changelog',
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'chore', section: 'Chores', hidden: true },
  ],
  renderOrder: ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'chore'],
}
