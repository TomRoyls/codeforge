export interface ValidationIssue {
  path: string
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestion?: string
  value?: unknown
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  warnings: number
  errors: number
}

export interface ConfigSchema {
  type: string
  properties: Record<string, SchemaProperty>
  required?: string[]
  additionalProperties?: boolean
}

export interface SchemaProperty {
  type: string
  description?: string
  default?: unknown
  enum?: unknown[]
  minimum?: number
  maximum?: number
  pattern?: string
  properties?: Record<string, SchemaProperty>
  items?: SchemaProperty
  required?: string[]
}

export interface MergeStrategy {
  arrays: 'replace' | 'merge' | 'append'
  objects: 'deep' | 'shallow' | 'replace'
  scalars: 'override' | 'keep-existing'
}

export interface MergeConflict {
  path: string
  baseValue: unknown
  overrideValue: unknown
  resolvedValue: unknown
  strategy: string
}

export interface MergeResult {
  config: Record<string, unknown>
  conflicts: MergeConflict[]
  applied: string[]
}

export const DEFAULT_MERGE_STRATEGY: MergeStrategy = {
  arrays: 'replace',
  objects: 'deep',
  scalars: 'override',
}
