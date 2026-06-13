type SchemaType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'

interface SchemaField {
  type: SchemaType | SchemaType[]
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  items?: SchemaDefinition
  properties?: Record<string, SchemaField>
}

type SchemaDefinition = Record<string, SchemaField>

export class SchemaChecker2 {
  private schema: SchemaDefinition

  constructor(schema: SchemaDefinition) {
    this.schema = schema
  }

  check(data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    this.checkObject(data, this.schema, '', errors)
    return { valid: errors.length === 0, errors }
  }

  private checkObject(data: unknown, schema: SchemaDefinition, path: string, errors: string[]): void {
    if (typeof data !== 'object' || data === null) {
      errors.push(`${path || 'root'}: expected object`)
      return
    }
    const obj = data as Record<string, unknown>
    for (const [key, field] of Object.entries(schema)) {
      const fieldPath = path ? `${path}.${key}` : key
      const value = obj[key]
      if (value === undefined) {
        if (field.required) errors.push(`${fieldPath}: is required`)
        continue
      }
      this.checkField(value, field, fieldPath, errors)
    }
  }

  private checkField(value: unknown, field: SchemaField, path: string, errors: string[]): void {
    const types = Array.isArray(field.type) ? field.type : [field.type]
    const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value
    if (!types.includes(actualType as SchemaType)) {
      errors.push(`${path}: expected ${types.join('|')}, got ${actualType}`)
      return
    }
    if (field.min !== undefined && typeof value === 'number' && value < field.min) {
      errors.push(`${path}: must be >= ${field.min}`)
    }
    if (field.max !== undefined && typeof value === 'number' && value > field.max) {
      errors.push(`${path}: must be <= ${field.max}`)
    }
    if (field.pattern !== undefined && typeof value === 'string' && !field.pattern.test(value)) {
      errors.push(`${path}: invalid format`)
    }
    if (actualType === 'array' && field.items && field.items.properties) {
      const arr = value as unknown[]
      for (let i = 0; i < arr.length; i++) {
        this.checkObject(arr[i], field.items.properties!, `${path}[${i}]`, errors)
      }
    }
    if (actualType === 'object' && field.properties) {
      this.checkObject(value, field.properties, path, errors)
    }
  }

  get fieldCount(): number { return Object.keys(this.schema).length }

  toArray(): string[] { return Object.keys(this.schema) }
  toString(): string { return JSON.stringify({ fields: this.fieldCount }) }
  toJSON(): Record<string, number> { return { fields: this.fieldCount } }
  clone(): SchemaChecker2 { return new SchemaChecker2({ ...this.schema }) }
  equals(other: unknown): boolean { return other instanceof SchemaChecker2 }
}
