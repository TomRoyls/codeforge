export type SchemaType2 = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null'

export interface SchemaProp2 {
  type: SchemaType2 | SchemaType2[]
  required?: boolean
  min?: number
  max?: number
  minLen?: number
  maxLen?: number
  pattern?: RegExp
  enum?: unknown[]
  items?: SchemaDef2
  properties?: Record<string, SchemaProp2>
}

export interface SchemaDef2 {
  type: SchemaType2
  properties?: Record<string, SchemaProp2>
  items?: SchemaDef2
  required?: string[]
  additionalProperties?: boolean
}

export interface SchemaValidationResult2 {
  valid: boolean
  errors: string[]
}

export class SchemaValidator2 {
  private strict: boolean

  constructor(strict = false) {
    this.strict = strict
  }

  validate(data: unknown, schema: SchemaDef2): SchemaValidationResult2 {
    const errors: string[] = []
    this.validateValue(data, schema, '', errors)
    return { valid: errors.length === 0, errors }
  }

  private validateValue(value: unknown, schema: SchemaDef2 | SchemaProp2, path: string, errors: string[]): void {
    const expectedType = schema.type
    const actualType = this.getType(value)

    if (!this.checkType(actualType, expectedType)) {
      errors.push(`${path || 'root'}: expected ${expectedType}, got ${actualType}`)
      return
    }

    if (schema.pattern && typeof value === 'string') {
      if (!schema.pattern.test(value)) {
        errors.push(`${path}: does not match pattern`)
      }
    }

    if (schema.min !== undefined && typeof value === 'number' && value < schema.min) {
      errors.push(`${path}: must be at least ${schema.min}`)
    }

    if (schema.max !== undefined && typeof value === 'number' && value > schema.max) {
      errors.push(`${path}: must be at most ${schema.max}`)
    }

    if (schema.minLen !== undefined && typeof value === 'string' && value.length < schema.minLen) {
      errors.push(`${path}: must be at least ${schema.minLen} characters`)
    }

    if (schema.maxLen !== undefined && typeof value === 'string' && value.length > schema.maxLen) {
      errors.push(`${path}: must be at most ${schema.maxLen} characters`)
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${path}: must be one of [${schema.enum.join(', ')}]`)
    }

    if (actualType === 'object' && schema.properties && typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      const required = schema.required ?? []

      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const hasKey = key in obj
        if (!hasKey) {
          if (propSchema.required || required.includes(key)) {
            errors.push(`${path}.${key}: is required`)
          }
          continue
        }
        this.validateValue(obj[key], propSchema, path ? `${path}.${key}` : key, errors)
      }

      if (this.strict && schema.additionalProperties === false) {
        const allowedKeys = new Set(Object.keys(schema.properties))
        for (const key of Object.keys(obj)) {
          if (!allowedKeys.has(key)) {
            errors.push(`${path}.${key}: additional property not allowed`)
          }
        }
      }
    }

    if (actualType === 'array' && schema.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        this.validateValue(value[i], schema.items, `${path}[${i}]`, errors)
      }
    }
  }

  private getType(value: unknown): SchemaType2 {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value as SchemaType2
  }

  private checkType(actual: SchemaType2, expected: SchemaType2 | SchemaType2[]): boolean {
    if (Array.isArray(expected)) return expected.includes(actual)
    return actual === expected
  }

  setStrict(strict: boolean): this {
    this.strict = strict
    return this
  }

  isStrict(): boolean { return this.strict }

  toArray(): boolean[] { return [this.strict] }
  toString(): string { return JSON.stringify({ strict: this.strict }) }
  toJSON(): Record<string, unknown> { return { strict: this.strict } }
  clone(): SchemaValidator2 {
    return new SchemaValidator2(this.strict)
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SchemaValidator2)) return false
    return this.strict === other.strict
  }
  clear(): void { this.strict = false }
}
