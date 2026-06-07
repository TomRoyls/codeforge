import type {
  ValidationIssue,
  ValidationResult,
  ConfigSchema,
  SchemaProperty,
} from './types.js'

const configPatternCache = new Map<string, RegExp>()

export class SchemaValidator {
  private schemas: Map<string, ConfigSchema> = new Map()

  validate(
    config: Record<string, unknown>,
    schema: ConfigSchema,
  ): ValidationResult {
    const issues: ValidationIssue[] = []

    if (schema.type !== 'object') {
      issues.push({
        path: '',
        message: `Expected root type "object" but schema specifies "${schema.type}"`,
        severity: 'error',
      })
      return { valid: issues.length === 0, issues, warnings: 0, errors: issues.length }
    }

    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      issues.push({
        path: '',
        message: 'Config must be a non-null object',
        severity: 'error',
        value: config,
      })
      return { valid: false, issues, warnings: 0, errors: 1 }
    }

    if (schema.required) {
      for (const req of schema.required) {
        if (!(req in config)) {
          issues.push({
            path: req,
            message: `Missing required property "${req}"`,
            severity: 'error',
            suggestion: `Add the "${req}" property to your configuration`,
          })
        }
      }
    }

    for (const [key, value] of Object.entries(config)) {
      const propSchema = schema.properties[key]
      if (propSchema) {
        const propIssues = this.validateProperty(value, propSchema, key)
        issues.push(...propIssues)
      } else if (schema.additionalProperties === false) {
        issues.push({
          path: key,
          message: `Unknown property "${key}"`,
          severity: 'error',
          value,
          suggestion: `Remove "${key}" or add it to the schema`,
        })
      } else if (
        schema.additionalProperties === undefined ||
        schema.additionalProperties === true
      ) {
        issues.push({
          path: key,
          message: `Unknown property "${key}" is allowed but not defined in schema`,
          severity: 'info',
          value,
        })
      }
    }

    let errors = 0
    let warnings = 0
    for (const i of issues) {
      if (i.severity === 'error') errors++
      else if (i.severity === 'warning') warnings++
    }

    return { valid: errors === 0, issues, warnings, errors }
  }

  validateProperty(
    value: unknown,
    property: SchemaProperty,
    path: string,
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    if (value === undefined || value === null) {
      return issues
    }

    const actualType = this.getType(value)
    if (actualType !== property.type) {
      if (actualType === 'integer' && property.type === 'number') {
        // integers are valid numbers
      } else {
        issues.push({
          path,
          message: `Expected type "${property.type}" but got "${actualType}"`,
          severity: 'error',
          value,
          suggestion: `Change the value to type "${property.type}"`,
        })
        return issues
      }
    }

    if (property.enum) {
      if (!property.enum.includes(value)) {
        issues.push({
          path,
          message: `Value must be one of: ${property.enum.map((v) => JSON.stringify(v)).join(', ')}`,
          severity: 'error',
          value,
          suggestion: `Use one of the allowed values: ${property.enum.join(', ')}`,
        })
      }
    }

    if (property.minimum !== undefined && typeof value === 'number') {
      if (value < property.minimum) {
        issues.push({
          path,
          message: `Value ${value} is less than minimum ${property.minimum}`,
          severity: 'error',
          value,
          suggestion: `Use a value of at least ${property.minimum}`,
        })
      }
    }

    if (property.maximum !== undefined && typeof value === 'number') {
      if (value > property.maximum) {
        issues.push({
          path,
          message: `Value ${value} is greater than maximum ${property.maximum}`,
          severity: 'error',
          value,
          suggestion: `Use a value of at most ${property.maximum}`,
        })
      }
    }

    if (property.pattern && typeof value === 'string') {
      let regex = configPatternCache.get(property.pattern)
      if (!regex) {
        regex = new RegExp(property.pattern)
        configPatternCache.set(property.pattern, regex)
      }
      if (!regex.test(value)) {
        issues.push({
          path,
          message: `Value does not match pattern "${property.pattern}"`,
          severity: 'error',
          value,
          suggestion: `Ensure the value matches the pattern "${property.pattern}"`,
        })
      }
    }

    if (property.type === 'object' && property.properties && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>

      if (property.required) {
        for (const req of property.required) {
          if (!(req in obj)) {
            issues.push({
              path: `${path}.${req}`,
              message: `Missing required property "${req}"`,
              severity: 'error',
            })
          }
        }
      }

      for (const [subKey, subValue] of Object.entries(obj)) {
        const subSchema = property.properties[subKey]
        if (subSchema) {
          const subIssues = this.validateProperty(
            subValue,
            subSchema,
            `${path}.${subKey}`,
          )
          issues.push(...subIssues)
        }
      }
    }

    if (property.type === 'array' && property.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemIssues = this.validateProperty(
          value[i],
          property.items,
          `${path}[${i}]`,
        )
        issues.push(...itemIssues)
      }
    }

    return issues
  }

  getDefaults(schema: ConfigSchema): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop.default !== undefined) {
        defaults[key] = prop.default
      } else if (prop.type === 'object' && prop.properties) {
        const nestedDefaults = this.getPropertyDefaults(prop)
        if (Object.keys(nestedDefaults).length > 0) {
          defaults[key] = nestedDefaults
        }
      }
    }

    return defaults
  }

  private getPropertyDefaults(property: SchemaProperty): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    if (property.properties) {
      for (const [key, prop] of Object.entries(property.properties)) {
        if (prop.default !== undefined) {
          defaults[key] = prop.default
        } else if (prop.type === 'object' && prop.properties) {
          const nestedDefaults = this.getPropertyDefaults(prop)
          if (Object.keys(nestedDefaults).length > 0) {
            defaults[key] = nestedDefaults
          }
        }
      }
    }

    return defaults
  }

  coerce(value: unknown, targetType: string): unknown {
    if (value === null || value === undefined) {
      return value
    }

    switch (targetType) {
      case 'string':
        return String(value)
      case 'number': {
        const num = Number(value)
        return isNaN(num) ? value : num
      }
      case 'boolean':
        if (typeof value === 'string') {
          if (value === 'true') return true
          if (value === 'false') return false
        }
        return Boolean(value)
      case 'integer': {
        const int = parseInt(String(value), 10)
        return isNaN(int) ? value : int
      }
      default:
        return value
    }
  }

  addSchema(name: string, schema: ConfigSchema): void {
    this.schemas.set(name, schema)
  }

  getSchema(name: string): ConfigSchema | null {
    return this.schemas.get(name) ?? null
  }

  private getType(value: unknown): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'number' && Number.isInteger(value)) return 'integer'
    return typeof value
  }
}
