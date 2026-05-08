export type EnvName = 'development' | 'staging' | 'production' | 'test' | string

export interface EnvConfig {
  name: EnvName
  variables: Record<string, string>
  inherits?: EnvName
  locked: boolean
  createdAt: number
  updatedAt: number
}

export interface EnvVariable {
  key: string
  value: string
  source: string
  isSecret: boolean
  isRequired: boolean
  defaultValue?: string
  description?: string
}

export interface EnvDiff {
  key: string
  oldValue: string | undefined
  newValue: string | undefined
  type: 'added' | 'removed' | 'changed'
}

export interface EnvValidationResult {
  valid: boolean
  missing: string[]
  extra: string[]
  conflicts: string[]
}
