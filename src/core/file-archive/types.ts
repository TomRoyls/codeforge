export interface ArchivedFile {
  id: string
  path: string
  content: string
  version: number
  hash: string
  archivedAt: number
  metadata: Record<string, unknown>
  tags: string[]
  size: number
}

export interface ArchiveSnapshot {
  id: string
  name: string
  files: Map<string, ArchivedFile>
  createdAt: number
  description?: string
  tag?: string
}

export interface ArchiveDiff {
  path: string
  type: 'added' | 'modified' | 'removed' | 'unchanged'
  oldHash?: string
  newHash?: string
  oldVersion?: number
  newVersion?: number
}

export interface ArchiveConfig {
  maxVersions: number
  autoCompress: boolean
  hashAlgorithm: string
}

export interface RestoreOptions {
  version?: number
  paths?: string[]
  overwrite: boolean
  dryRun: boolean
}

export interface RestoreResult {
  path: string
  restored: boolean
  version: number
  error?: string
}

export const DEFAULT_ARCHIVE_CONFIG: ArchiveConfig = {
  maxVersions: 10,
  autoCompress: false,
  hashAlgorithm: 'sha256',
}
