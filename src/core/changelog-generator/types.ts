export type ChangeCategory = 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'

export interface ChangeEntry {
  category: ChangeCategory
  description: string
  scope?: string
  breaking: boolean
  issue?: string
  commit?: string
}

export interface VersionEntry {
  version: string
  date: string
  changes: ChangeEntry[]
}

export interface ChangelogOptions {
  title: string
  includeDate: boolean
  groupByCategory: boolean
  categoryOrder: ChangeCategory[]
}

export type ChangelogFormat = 'markdown' | 'json' | 'text'

export const DEFAULT_CHANGELOG_OPTIONS: ChangelogOptions = {
  title: 'Changelog',
  includeDate: true,
  groupByCategory: true,
  categoryOrder: ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security'],
}
