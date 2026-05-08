import type {
  SchemaDefinition,
  SchemaProperty,
  ValidationRule,
  ValidationError,
  ValidationResult,
  ValidatorConfig,
  PropertyType,
} from './types.js'
import { DEFAULT_VALIDATOR_CONFIG } from './types.js'

export type {
  SchemaDefinition,
  SchemaProperty,
  ValidationRule,
  ValidationError,
  ValidationResult,
  ValidatorConfig,
  PropertyType,
}

export { DEFAULT_VALIDATOR_CONFIG }

type CustomValidatorFn = (value: unknown, property: SchemaProperty, path: string) => ValidationError[]

export class SchemaValidator {
  private schemas: Map<string, SchemaDefinition> = new Map()
  private config: ValidatorConfig
  private lastErrors: ValidationError[] = []
  private customValidators: Map<string, CustomValidatorFn> = new Map()
  private stats = {
    totalValidations: 0,
    totalErrors: 0,
    totalWarnings: 0,
    schemasRegistered: 0,
    customValidatorsRegistered: 0,
  }

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = { ...DEFAULT_VALIDATOR_CONFIG, ...config }
  }

  validate(
    data: Record<string, unknown>,
    schema: SchemaDefinition,
  ): ValidationResult {
    this.stats.totalValidations++
    const errors: ValidationError[] = []

    if (schema.type !== 'object') {
      errors.push({
        path: '',
        message: `Expected root type "object" but schema specifies "${schema.type}"`,
        severity: 'error',
        rule: 'type',
      })
      this.lastErrors = errors
      this.stats.totalErrors += errors.length
      return { valid: false, errors, errorCount: errors.length, warningCount: 0 }
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push({
        path: '',
        message: 'Data must be a non-null object',
        severity: 'error',
        value: data,
        rule: 'type',
      })
      this.lastErrors = errors
      this.stats.totalErrors += errors.length
      return { valid: false, errors, errorCount: errors.length, warningCount: 0 }
    }

    if (schema.required) {
      for (const req of schema.required) {
        if (!(req in data)) {
          errors.push({
            path: req,
            message: `Missing required property "${req}"`,
            severity: 'error',
            suggestion: `Add the "${req}" property`,
            rule: 'required',
          })
          if (this.config.stopOnError) {
            this.lastErrors = errors
            this.stats.totalErrors += errors.length
            return this.buildResult(errors)
          }
        }
      }
    }

    for (const [key, value] of Object.entries(data)) {
      if (errors.length >= this.config.maxErrors) break

      const propSchema = schema.properties[key]
      if (propSchema) {
        const propErrors = this.validateProperty(value, propSchema, key)
        errors.push(...propErrors)
      } else if (schema.additionalProperties === false || (this.config.strict && schema.additionalProperties !== true)) {
        errors.push({
          path: key,
          message: `Unknown property "${key}" is not allowed`,
          severity: 'error',
          value,
          suggestion: `Remove "${key}" or define it in the schema`,
          rule: 'additionalProperties',
        })
      } else if (!this.config.strict) {
        errors.push({
          path: key,
          message: `Unknown property "${key}" is allowed but not defined in schema`,
          severity: 'info',
          value,
        })
      }
    }

    for (const [key, propDef] of Object.entries(schema.properties)) {
      if (errors.length >= this.config.maxErrors) break
      if (propDef.required && !(key in data) && !(schema.required?.includes(key))) {
        errors.push({
          path: key,
          message: `Missing required property "${key}"`,
          severity: 'error',
          suggestion: `Add the "${key}" property`,
          rule: 'required',
        })
      }
    }

    this.lastErrors = errors
    this.stats.totalErrors += errors.filter(e => e.severity === 'error').length
    this.stats.totalWarnings += errors.filter(e => e.severity === 'warning').length
    return this.buildResult(errors)
  }

  validateProperty(
    value: unknown,
    property: SchemaProperty,
    path: string,
  ): ValidationError[] {
    const errors: ValidationError[] = []

    if (value === undefined) {
      if (property.required && property.default === undefined) {
        errors.push({
          path,
          message: `Property "${path}" is required but undefined`,
          severity: 'error',
          rule: 'required',
        })
      }
      return errors
    }

    if (value === null) {
      const allowedTypes = this.getTypes(property.type)
      if (!allowedTypes.includes('null')) {
        errors.push({
          path,
          message: `Expected type "${this.formatType(property.type)}" but got "null"`,
          severity: 'error',
          value,
          suggestion: `Change the value to type "${this.formatType(property.type)}"`,
          rule: 'type',
        })
      }
      return errors
    }

    const actualType = this.getType(value)
    const allowedTypes = this.getTypes(property.type)

    if (!allowedTypes.includes(actualType as PropertyType)) {
      if (!(actualType === 'number' && allowedTypes.includes('number'))) {
        errors.push({
          path,
          message: `Expected type "${this.formatType(property.type)}" but got "${actualType}"`,
          severity: 'error',
          value,
          suggestion: `Change the value to type "${this.formatType(property.type)}"`,
          rule: 'type',
        })
        return errors
      }
    }

    if (property.enum) {
      if (!property.enum.includes(value)) {
        errors.push({
          path,
          message: `Value must be one of: ${property.enum.map(v => JSON.stringify(v)).join(', ')}`,
          severity: 'error',
          value,
          suggestion: `Use one of the allowed values: ${property.enum.map(v => JSON.stringify(v)).join(', ')}`,
          rule: 'enum',
        })
      }
    }

    if (property.minimum !== undefined && typeof value === 'number') {
      if (value < property.minimum) {
        errors.push({
          path,
          message: `Value ${value} is less than minimum ${property.minimum}`,
          severity: 'error',
          value,
          suggestion: `Use a value of at least ${property.minimum}`,
          rule: 'minimum',
        })
      }
    }

    if (property.maximum !== undefined && typeof value === 'number') {
      if (value > property.maximum) {
        errors.push({
          path,
          message: `Value ${value} is greater than maximum ${property.maximum}`,
          severity: 'error',
          value,
          suggestion: `Use a value of at most ${property.maximum}`,
          rule: 'maximum',
        })
      }
    }

    if (typeof value === 'string') {
      if (property.minLength !== undefined && value.length < property.minLength) {
        errors.push({
          path,
          message: `String length ${value.length} is less than minLength ${property.minLength}`,
          severity: 'error',
          value,
          suggestion: `Use a string with at least ${property.minLength} characters`,
          rule: 'minLength',
        })
      }

      if (property.maxLength !== undefined && value.length > property.maxLength) {
        errors.push({
          path,
          message: `String length ${value.length} exceeds maxLength ${property.maxLength}`,
          severity: 'error',
          value,
          suggestion: `Use a string with at most ${property.maxLength} characters`,
          rule: 'maxLength',
        })
      }

      if (property.pattern) {
        const regex = new RegExp(property.pattern)
        if (!regex.test(value)) {
          errors.push({
            path,
            message: `Value does not match pattern "${property.pattern}"`,
            severity: 'error',
            value,
            suggestion: `Ensure the value matches the pattern "${property.pattern}"`,
            rule: 'pattern',
          })
        }
      }
    }

    if (
      property.type === 'object' &&
      property.properties &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      const obj = value as Record<string, unknown>

      if (property.required) {
        for (const req of property.required) {
          if (!(req in obj)) {
            errors.push({
              path: `${path}.${req}`,
              message: `Missing required property "${req}"`,
              severity: 'error',
              suggestion: `Add the "${req}" property`,
              rule: 'required',
            })
          }
        }
      }

      for (const [subKey, subValue] of Object.entries(obj)) {
        const subSchema = property.properties[subKey]
        if (subSchema) {
          const subErrors = this.validateProperty(subValue, subSchema, `${path}.${subKey}`)
          errors.push(...subErrors)
        } else if (property.additionalProperties === false) {
          errors.push({
            path: `${path}.${subKey}`,
            message: `Unknown property "${subKey}" is not allowed`,
            severity: 'error',
            value: subValue,
            rule: 'additionalProperties',
          })
        }
      }
    }

    if (property.type === 'array' && property.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemErrors = this.validateProperty(
          value[i],
          property.items,
          `${path}[${i}]`,
        )
        errors.push(...itemErrors)
      }
    }

    if (property.customValidator) {
      const validatorFn = this.customValidators.get(property.customValidator)
      if (validatorFn) {
        const customErrors = validatorFn(value, property, path)
        errors.push(...customErrors)
      }
    }

    return errors
  }

  addSchema(name: string, schema: SchemaDefinition): void {
    this.schemas.set(name, schema)
    this.stats.schemasRegistered = this.schemas.size
  }

  getSchema(name: string): SchemaDefinition | undefined {
    return this.schemas.get(name)
  }

  removeSchema(name: string): boolean {
    const removed = this.schemas.delete(name)
    this.stats.schemasRegistered = this.schemas.size
    return removed
  }

  getErrors(): ValidationError[] {
    return [...this.lastErrors]
  }

  isValid(data: Record<string, unknown>, schema: SchemaDefinition): boolean {
    const result = this.validate(data, schema)
    return result.valid
  }

  addCustomValidator(name: string, fn: CustomValidatorFn): void {
    this.customValidators.set(name, fn)
    this.stats.customValidatorsRegistered = this.customValidators.size
  }

  getStatistics(): typeof this.stats {
    return { ...this.stats }
  }

  clear(): void {
    this.schemas.clear()
    this.lastErrors = []
    this.customValidators.clear()
    this.stats = {
      totalValidations: 0,
      totalErrors: 0,
      totalWarnings: 0,
      schemasRegistered: 0,
      customValidatorsRegistered: 0,
    }
  }

  private buildResult(errors: ValidationError[]): ValidationResult {
    const errorCount = errors.filter(e => e.severity === 'error').length
    const warningCount = errors.filter(e => e.severity === 'warning').length
    return { valid: errorCount === 0, errors, errorCount, warningCount }
  }

  private getType(value: unknown): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  private getTypes(type: PropertyType | PropertyType[]): PropertyType[] {
    return Array.isArray(type) ? type : [type]
  }

  private formatType(type: PropertyType | PropertyType[]): string {
    return Array.isArray(type) ? type.join(' | ') : type
  }
}
