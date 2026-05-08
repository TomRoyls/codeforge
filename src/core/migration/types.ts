export interface VersionMigration {
  fromVersion: string
  toVersion: string
  description: string
  breaking: boolean
  migrate: (config: Record<string, unknown>) => MigrationResult
}

export interface MigrationResult {
  success: boolean
  config: Record<string, unknown>
  changes: MigrationChange[]
  warnings: string[]
  errors: string[]
}

export interface MigrationChange {
  path: string
  oldValue: unknown
  newValue: unknown
  type: 'added' | 'removed' | 'renamed' | 'modified' | 'deprecated'
  description: string
}

export interface MigrationPlan {
  fromVersion: string
  toVersion: string
  steps: VersionMigration[]
  totalChanges: number
  breakingChanges: number
  estimatedRisk: 'low' | 'medium' | 'high'
}

export interface MigrationPreview {
  plan: MigrationPlan
  changes: MigrationChange[]
  warnings: string[]
  canAutoMigrate: boolean
}
