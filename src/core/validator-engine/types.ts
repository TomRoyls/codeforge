export interface ValidationRule {
  name: string
  check: (value: unknown) => boolean
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationError {
  rule: string
  path: string
  message: string
  value: unknown
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  properties?: Record<string, SchemaProperty>
  items?: SchemaProperty
  enum?: unknown[]
  custom?: ValidationRule
}

export interface ValidationSchema {
  properties: Record<string, SchemaProperty>
  additionalProperties: boolean
}

export interface ValidatorConfig {
  strictMode: boolean
  stopOnError: boolean
  maxErrors: number
}
