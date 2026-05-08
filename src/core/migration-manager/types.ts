export interface Migration {
  id: string
  name: string
  version: number
  description?: string
  up: MigrationStep[]
  down: MigrationStep[]
  checksum: string
  createdAt: number
  author?: string
  tags: string[]
}

export interface MigrationStep {
  type: 'create' | 'alter' | 'drop' | 'insert' | 'update' | 'delete' | 'custom'
  target: string
  params: Record<string, unknown>
}

export interface MigrationRecord {
  migrationId: string
  version: number
  appliedAt: number
  checksum: string
  executionTime: number
  status: 'applied' | 'rolled_back' | 'failed'
}

export interface MigrationPlan {
  pending: Migration[]
  applied: MigrationRecord[]
  currentVersion: number
  targetVersion: number
  direction: 'up' | 'down'
}

export interface MigrationResult {
  migrationId: string
  status: 'success' | 'failed' | 'skipped'
  executionTime: number
  error?: string
  stepsExecuted: number
}

export interface MigrationManagerConfig {
  autoChecksum: boolean
  validateOnLoad: boolean
  stopOnError: boolean
  dryRun: boolean
  maxRetries: number
}

export const DEFAULT_MIGRATION_MANAGER_CONFIG: MigrationManagerConfig = {
  autoChecksum: true,
  validateOnLoad: true,
  stopOnError: true,
  dryRun: false,
  maxRetries: 0,
}
