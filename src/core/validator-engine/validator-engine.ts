import type {
  ValidationRule,
  ValidationError,
  ValidationResult,
  ValidationSchema,
  SchemaProperty,
  ValidatorConfig,
} from './types.js'

const DEFAULT_CONFIG: ValidatorConfig = {
  strictMode: true,
  stopOnError: false,
  maxErrors: 100,
}

export class ValidatorEngine {
  private config: ValidatorConfig
  private globalRules: ValidationRule[] = []
  private schemas: Map<string, ValidationSchema> = new Map()

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  validate(data: unknown, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push({
        rule: 'type',
        path: '',
        message: 'Data must be a non-null object',
        value: data,
      })
      return { valid: false, errors, warnings }
    }

    const obj = data as Record<string, unknown>
    this.validateObject(obj, schema.properties, '', schema.additionalProperties, errors, warnings)

    if (this.config.maxErrors > 0 && errors.length > this.config.maxErrors) {
      errors.length = this.config.maxErrors
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  private validateObject(
    obj: Record<string, unknown>,
    properties: Record<string, SchemaProperty>,
    basePath: string,
    additionalProperties: boolean,
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    for (const [key, propSchema] of Object.entries(properties)) {
      const fullPath = basePath ? `${basePath}.${key}` : key
      const value = obj[key]

      if (value === undefined) {
        if (propSchema.required) {
          this.addError(errors, 'required', fullPath, `Property "${key}" is required`, value)
          if (this.config.stopOnError && errors.length > 0) return
        }
        continue
      }

      if (value === null) {
        if (propSchema.required) {
          this.addError(errors, 'required', fullPath, `Property "${key}" is required`, value)
          if (this.config.stopOnError && errors.length > 0) return
        }
        continue
      }

      this.validateProperty(value, propSchema, fullPath, errors, warnings)
      if (this.config.stopOnError && errors.length > 0) return
    }

    if (!additionalProperties) {
      for (const key of Object.keys(obj)) {
        if (!(key in properties)) {
          const fullPath = basePath ? `${basePath}.${key}` : key
          this.addError(errors, 'additionalProperties', fullPath, `Unknown property "${key}"`, obj[key])
          if (this.config.stopOnError && errors.length > 0) return
        }
      }
    }
  }

  private validateProperty(
    value: unknown,
    schema: SchemaProperty,
    path: string,
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    const typeValid = this.checkType(value, schema.type)
    if (!typeValid) {
      this.addError(errors, 'type', path, `Expected type "${schema.type}" but got "${this.getType(value)}"`, value)
      return
    }

    if (schema.custom) {
      if (!schema.custom.check(value)) {
        const collection = schema.custom.severity === 'warning' ? warnings : errors
        collection.push({
          rule: schema.custom.name,
          path,
          message: schema.custom.message,
          value,
        })
        if (this.config.stopOnError && errors.length > 0) return
      }
    }

    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        this.addError(errors, 'minLength', path, `String length ${value.length} is less than minimum ${schema.minLength}`, value)
        if (this.config.stopOnError) return
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        this.addError(errors, 'maxLength', path, `String length ${value.length} exceeds maximum ${schema.maxLength}`, value)
        if (this.config.stopOnError) return
      }
      if (schema.pattern !== undefined) {
        const regex = new RegExp(schema.pattern)
        if (!regex.test(value)) {
          this.addError(errors, 'pattern', path, `Value does not match pattern "${schema.pattern}"`, value)
          if (this.config.stopOnError) return
        }
      }
    }

    if (schema.type === 'number' && typeof value === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        this.addError(errors, 'min', path, `Value ${value} is less than minimum ${schema.min}`, value)
        if (this.config.stopOnError) return
      }
      if (schema.max !== undefined && value > schema.max) {
        this.addError(errors, 'max', path, `Value ${value} exceeds maximum ${schema.max}`, value)
        if (this.config.stopOnError) return
      }
    }

    if (schema.type === 'array' && Array.isArray(value)) {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        this.addError(errors, 'minLength', path, `Array length ${value.length} is less than minimum ${schema.minLength}`, value)
        if (this.config.stopOnError) return
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        this.addError(errors, 'maxLength', path, `Array length ${value.length} exceeds maximum ${schema.maxLength}`, value)
        if (this.config.stopOnError) return
      }
      if (schema.items) {
        for (let i = 0; i < value.length; i++) {
          const itemPath = `${path}[${i}]`
          const item = value[i]
          if (item === undefined || item === null) {
            if (schema.items.required) {
              this.addError(errors, 'required', itemPath, `Array item at index ${i} is required`, item)
              if (this.config.stopOnError && errors.length > 0) return
            }
            continue
          }
          this.validateProperty(item, schema.items, itemPath, errors, warnings)
          if (this.config.stopOnError && errors.length > 0) return
        }
      }
    }

    if (schema.type === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedProps = schema.properties ?? {}
      const nestedAdditional = !this.config.strictMode
      this.validateObject(value as Record<string, unknown>, nestedProps, path, nestedAdditional, errors, warnings)
    }

    if (schema.enum !== undefined) {
      if (!schema.enum.includes(value)) {
        this.addError(errors, 'enum', path, `Value must be one of: ${schema.enum.map((v) => JSON.stringify(v)).join(', ')}`, value)
        if (this.config.stopOnError) return
      }
    }
  }

  private checkType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !Number.isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'array':
        return Array.isArray(value)
      default:
        return false
    }
  }

  private getType(value: unknown): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  private addError(
    errors: ValidationError[],
    rule: string,
    path: string,
    message: string,
    value: unknown,
  ): void {
    if (this.config.maxErrors > 0 && errors.length >= this.config.maxErrors) return
    errors.push({ rule, path, message, value })
  }

  validateWithRules(data: unknown, rules: ValidationRule[]): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    for (const rule of rules) {
      if (!rule.check(data)) {
        const collection = rule.severity === 'warning' ? warnings : errors
        collection.push({
          rule: rule.name,
          path: '',
          message: rule.message,
          value: data,
        })
        if (this.config.stopOnError && errors.length > 0) break
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  addRule(rule: ValidationRule): void {
    this.globalRules.push(rule)
  }

  addSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema)
  }

  getSchema(name: string): ValidationSchema | undefined {
    return this.schemas.get(name)
  }

  validateWithSchema(name: string, data: unknown): ValidationResult {
    const schema = this.schemas.get(name)
    if (!schema) {
      return {
        valid: false,
        errors: [{ rule: 'schema', path: '', message: `Schema "${name}" not found`, value: undefined }],
        warnings: [],
      }
    }
    return this.validate(data, schema)
  }

  getConfig(): ValidatorConfig {
    return { ...this.config }
  }
}
