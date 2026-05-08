export type PropertyType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null'

export interface ValidationRule {
  type: string
  constraint?: string
  value?: unknown
  message?: string
}

export interface SchemaProperty {
  type: PropertyType | PropertyType[]
  description?: string
  required?: string[]
  default?: unknown
  enum?: unknown[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  properties?: Record<string, SchemaProperty>
  items?: SchemaProperty
  additionalProperties?: boolean
  customValidator?: string
}

export interface SchemaDefinition {
  name: string
  description?: string
  type: 'object'
  properties: Record<string, SchemaProperty>
  required?: string[]
  additionalProperties?: boolean
}

export interface ValidationError {
  path: string
  message: string
  severity: 'error' | 'warning' | 'info'
  value?: unknown
  suggestion?: string
  rule?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  errorCount: number
  warningCount: number
}

export interface ValidatorConfig {
  strict: boolean
  allowAdditionalProperties: boolean
  stopOnError: boolean
  maxErrors: number
  coerceTypes: boolean
}

export const DEFAULT_VALIDATOR_CONFIG: ValidatorConfig = {
  strict: false,
  allowAdditionalProperties: true,
  stopOnError: false,
  maxErrors: 100,
  coerceTypes: false,
}
