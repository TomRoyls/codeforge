import { describe, it, expect, beforeEach } from 'vitest'
import { SchemaValidator } from '../../src/core/schema-validator/schema-validator.js'
import type {
  SchemaDefinition,
  SchemaProperty,
  ValidationError,
  ValidatorConfig,
} from '../../src/core/schema-validator/schema-validator.js'
import { DEFAULT_VALIDATOR_CONFIG } from '../../src/core/schema-validator/schema-validator.js'

const simpleSchema: SchemaDefinition = {
  name: 'simple',
  type: 'object',
  properties: {
    name: { type: 'string' },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    debug: { type: 'boolean', default: false },
    port: { type: 'number', minimum: 1, maximum: 65535 },
    tags: { type: 'array', items: { type: 'string' } },
    logLevel: { type: 'string', enum: ['debug', 'info', 'warn', 'error'] },
    enabled: { type: 'boolean' },
    count: { type: 'number' },
    label: { type: 'string', minLength: 1, maxLength: 50 },
  },
  required: ['name'],
}

const nestedSchema: SchemaDefinition = {
  name: 'nested',
  type: 'object',
  properties: {
    server: {
      type: 'object',
      properties: {
        host: { type: 'string', default: 'localhost' },
        port: { type: 'number', default: 3000, minimum: 1, maximum: 65535 },
        ssl: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: false },
            cert: { type: 'string' },
            key: { type: 'string' },
          },
          required: ['cert'],
        },
      },
      required: ['host'],
    },
    database: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        pool: { type: 'number', default: 5, minimum: 1 },
      },
    },
  },
  required: ['server'],
}

const strictSchema: SchemaDefinition = {
  name: 'strict',
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: [],
  additionalProperties: false,
}

describe('SchemaValidator', () => {
  let validator: SchemaValidator

  beforeEach(() => {
    validator = new SchemaValidator()
  })

  describe('validate - type validation', () => {
    it('should validate correct string property', () => {
      const result = validator.validate({ name: 'my-project' }, simpleSchema)
      expect(result.valid).toBe(true)
      expect(result.errorCount).toBe(0)
    })

    it('should reject wrong type - string expected number', () => {
      const result = validator.validate({ name: 'test', port: 'not-a-number' }, simpleSchema)
      expect(result.valid).toBe(false)
      const portIssue = result.errors.find(e => e.path === 'port')
      expect(portIssue).toBeDefined()
      expect(portIssue!.message).toContain('Expected type')
    })

    it('should reject wrong type - number expected string', () => {
      const result = validator.validate({ name: 42 }, simpleSchema)
      expect(result.valid).toBe(false)
      const nameIssue = result.errors.find(e => e.path === 'name')
      expect(nameIssue).toBeDefined()
    })

    it('should validate boolean type', () => {
      const result = validator.validate({ name: 'test', debug: true }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should reject wrong type - string expected boolean', () => {
      const result = validator.validate({ name: 'test', enabled: 'yes' }, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should validate array type', () => {
      const result = validator.validate({ name: 'test', tags: ['a', 'b'] }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should reject non-array when array expected', () => {
      const result = validator.validate({ name: 'test', tags: 'not-array' }, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should validate number type', () => {
      const result = validator.validate({ name: 'test', count: 42 }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should reject boolean when number expected', () => {
      const result = validator.validate({ name: 'test', count: true }, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should validate null type explicitly', () => {
      const nullSchema: SchemaDefinition = {
        name: 'null-test',
        type: 'object',
        properties: { value: { type: 'null' } },
        required: [],
      }
      const result = validator.validate({ value: null }, nullSchema)
      expect(result.valid).toBe(true)
    })

    it('should reject non-null when null expected', () => {
      const nullSchema: SchemaDefinition = {
        name: 'null-test',
        type: 'object',
        properties: { value: { type: 'null' } },
        required: [],
      }
      const result = validator.validate({ value: 'string' }, nullSchema)
      expect(result.valid).toBe(false)
    })

    it('should validate union types', () => {
      const unionSchema: SchemaDefinition = {
        name: 'union',
        type: 'object',
        properties: { value: { type: ['string', 'number'] } },
        required: [],
      }
      const strResult = validator.validate({ value: 'hello' }, unionSchema)
      expect(strResult.valid).toBe(true)
      const numResult = validator.validate({ value: 42 }, unionSchema)
      expect(numResult.valid).toBe(true)
    })

    it('should reject value not matching any union type', () => {
      const unionSchema: SchemaDefinition = {
        name: 'union',
        type: 'object',
        properties: { value: { type: ['string', 'number'] } },
        required: [],
      }
      const result = validator.validate({ value: true }, unionSchema)
      expect(result.valid).toBe(false)
    })
  })

  describe('validate - required fields', () => {
    it('should fail on missing required field', () => {
      const result = validator.validate({ version: '1.0.0' }, simpleSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.message).toContain('Missing required')
      expect(result.errors[0]!.path).toBe('name')
    })

    it('should pass when all required fields present', () => {
      const result = validator.validate({ name: 'test' }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should handle multiple required fields', () => {
      const multiReqSchema: SchemaDefinition = {
        name: 'multi-req',
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'string' },
        },
        required: ['a', 'b', 'c'],
      }
      const result = validator.validate({}, multiReqSchema)
      expect(result.valid).toBe(false)
      expect(result.errorCount).toBe(3)
    })

    it('should handle empty config with required fields', () => {
      const result = validator.validate({}, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should handle empty config without required fields', () => {
      const noReqSchema: SchemaDefinition = {
        name: 'no-req',
        type: 'object',
        properties: { name: { type: 'string' } },
        required: [],
      }
      const result = validator.validate({}, noReqSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('validate - min/max constraints', () => {
    it('should reject value below minimum', () => {
      const result = validator.validate({ name: 'test', port: 0 }, simpleSchema)
      expect(result.valid).toBe(false)
      const portIssue = result.errors.find(e => e.path === 'port')
      expect(portIssue!.message).toContain('less than minimum')
    })

    it('should reject value above maximum', () => {
      const result = validator.validate({ name: 'test', port: 70000 }, simpleSchema)
      expect(result.valid).toBe(false)
      const portIssue = result.errors.find(e => e.path === 'port')
      expect(portIssue!.message).toContain('greater than maximum')
    })

    it('should accept value at minimum boundary', () => {
      const result = validator.validate({ name: 'test', port: 1 }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should accept value at maximum boundary', () => {
      const result = validator.validate({ name: 'test', port: 65535 }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should accept value within range', () => {
      const result = validator.validate({ name: 'test', port: 8080 }, simpleSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('validate - string length constraints', () => {
    it('should reject string below minLength', () => {
      const result = validator.validate({ name: 'test', label: '' }, simpleSchema)
      expect(result.valid).toBe(false)
      const labelIssue = result.errors.find(e => e.path === 'label')
      expect(labelIssue!.message).toContain('minLength')
    })

    it('should reject string above maxLength', () => {
      const result = validator.validate({ name: 'test', label: 'a'.repeat(51) }, simpleSchema)
      expect(result.valid).toBe(false)
      const labelIssue = result.errors.find(e => e.path === 'label')
      expect(labelIssue!.message).toContain('maxLength')
    })

    it('should accept string at minLength boundary', () => {
      const result = validator.validate({ name: 'test', label: 'a' }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should accept string at maxLength boundary', () => {
      const result = validator.validate({ name: 'test', label: 'a'.repeat(50) }, simpleSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('validate - pattern matching', () => {
    it('should reject value not matching pattern', () => {
      const result = validator.validate({ name: 'test', version: 'invalid' }, simpleSchema)
      expect(result.valid).toBe(false)
      const versionIssue = result.errors.find(e => e.path === 'version')
      expect(versionIssue!.message).toContain('does not match pattern')
    })

    it('should accept value matching pattern', () => {
      const result = validator.validate({ name: 'test', version: '1.2.3' }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should provide suggestion on pattern failure', () => {
      const result = validator.validate({ name: 'test', version: 'bad' }, simpleSchema)
      const versionIssue = result.errors.find(e => e.path === 'version')
      expect(versionIssue!.suggestion).toBeDefined()
    })
  })

  describe('validate - enum values', () => {
    it('should reject invalid enum value', () => {
      const result = validator.validate({ name: 'test', logLevel: 'invalid' }, simpleSchema)
      expect(result.valid).toBe(false)
      const logIssue = result.errors.find(e => e.path === 'logLevel')
      expect(logIssue!.message).toContain('must be one of')
    })

    it('should accept valid enum value', () => {
      const result = validator.validate({ name: 'test', logLevel: 'debug' }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should list all valid enum values in error', () => {
      const result = validator.validate({ name: 'test', logLevel: 'invalid' }, simpleSchema)
      const logIssue = result.errors.find(e => e.path === 'logLevel')
      expect(logIssue!.message).toContain('"debug"')
      expect(logIssue!.message).toContain('"error"')
    })
  })

  describe('validate - nested objects', () => {
    it('should validate valid nested object', () => {
      const result = validator.validate(
        { server: { host: 'example.com', port: 8080 } },
        nestedSchema,
      )
      expect(result.valid).toBe(true)
    })

    it('should validate nested object with type errors', () => {
      const result = validator.validate(
        { server: { host: 123, port: 99999 } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should report missing required nested fields', () => {
      const result = validator.validate(
        { server: { port: 3000 } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      const hostIssue = result.errors.find(e =>
        e.path === 'server.host' && e.message.includes('Missing required'),
      )
      expect(hostIssue).toBeDefined()
    })

    it('should validate deeply nested objects', () => {
      const result = validator.validate(
        { server: { host: 'localhost', ssl: { enabled: 'not-bool', cert: 'cert.pem' } } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      const sslIssue = result.errors.find(e => e.path === 'server.ssl.enabled')
      expect(sslIssue).toBeDefined()
    })

    it('should validate deeply nested with all valid fields', () => {
      const result = validator.validate(
        { server: { host: 'localhost', ssl: { enabled: true, cert: 'cert.pem' } } },
        nestedSchema,
      )
      expect(result.valid).toBe(true)
    })

    it('should validate missing required in deeply nested', () => {
      const result = validator.validate(
        { server: { host: 'localhost', ssl: { enabled: true } } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      const certIssue = result.errors.find(e =>
        e.path === 'server.ssl.cert',
      )
      expect(certIssue).toBeDefined()
    })

    it('should validate array items in nested objects', () => {
      const arrSchema: SchemaDefinition = {
        name: 'arr-nested',
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'string' } },
        },
        required: [],
      }
      const result = validator.validate({ items: ['a', 123] }, arrSchema)
      expect(result.valid).toBe(false)
      const itemIssue = result.errors.find(e => e.path === 'items[1]')
      expect(itemIssue).toBeDefined()
    })

    it('should validate all valid array items', () => {
      const result = validator.validate({ items: ['a', 'b', 'c'] }, {
        name: 'arr',
        type: 'object',
        properties: { items: { type: 'array', items: { type: 'string' } } },
        required: [],
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('validate - additional properties', () => {
    it('should reject additional properties when not allowed', () => {
      const result = validator.validate({ name: 'test', extra: true }, strictSchema)
      expect(result.valid).toBe(false)
      const extraIssue = result.errors.find(e => e.path === 'extra')
      expect(extraIssue!.message).toContain('not allowed')
    })

    it('should report info for unknown properties when allowed', () => {
      const result = validator.validate({ name: 'test', custom: 'value' }, simpleSchema)
      expect(result.valid).toBe(true)
      const infoIssue = result.errors.find(e => e.path === 'custom' && e.severity === 'info')
      expect(infoIssue).toBeDefined()
    })
  })

  describe('validate - edge cases', () => {
    it('should reject non-object data', () => {
      const result = validator.validate('not an object' as unknown as Record<string, unknown>, simpleSchema)
      expect(result.valid).toBe(false)
      expect(result.errorCount).toBe(1)
    })

    it('should reject null data', () => {
      const result = validator.validate(null as unknown as Record<string, unknown>, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should reject array data', () => {
      const result = validator.validate([] as unknown as Record<string, unknown>, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should handle empty object with no required fields', () => {
      const noReqSchema: SchemaDefinition = {
        name: 'empty',
        type: 'object',
        properties: { name: { type: 'string' } },
        required: [],
      }
      const result = validator.validate({}, noReqSchema)
      expect(result.valid).toBe(true)
    })

    it('should handle schema with no properties', () => {
      const noPropsSchema: SchemaDefinition = {
        name: 'no-props',
        type: 'object',
        properties: {},
        required: [],
      }
      const result = validator.validate({ extra: true }, noPropsSchema)
      expect(result.valid).toBe(true)
    })

    it('should handle multiple errors at once', () => {
      const result = validator.validate(
        { port: 'not-number', enabled: 'not-bool', logLevel: 'invalid' },
        simpleSchema,
      )
      expect(result.valid).toBe(false)
      expect(result.errorCount).toBeGreaterThanOrEqual(3)
    })

    it('should handle undefined property value', () => {
      const result = validator.validate({ name: 'test', port: undefined }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should handle null property value for non-null type', () => {
      const result = validator.validate({ name: 'test', port: null }, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should handle deeply nested missing required', () => {
      const deepSchema: SchemaDefinition = {
        name: 'deep',
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: { type: 'string' },
                },
                required: ['level3'],
              },
            },
            required: ['level2'],
          },
        },
        required: ['level1'],
      }
      const result = validator.validate({ level1: { level2: {} } }, deepSchema)
      expect(result.valid).toBe(false)
      const deepIssue = result.errors.find(e => e.path === 'level1.level2.level3')
      expect(deepIssue).toBeDefined()
    })
  })

  describe('validateProperty', () => {
    it('should return no errors for valid string', () => {
      const errors = validator.validateProperty('hello', { type: 'string' }, 'test')
      expect(errors).toHaveLength(0)
    })

    it('should return errors for wrong type', () => {
      const errors = validator.validateProperty(42, { type: 'string' }, 'test')
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return errors for enum mismatch', () => {
      const errors = validator.validateProperty('invalid', { type: 'string', enum: ['a', 'b'] }, 'test')
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should pass for valid enum value', () => {
      const errors = validator.validateProperty('a', { type: 'string', enum: ['a', 'b'] }, 'test')
      expect(errors).toHaveLength(0)
    })

    it('should return no errors for undefined value', () => {
      const errors = validator.validateProperty(undefined, { type: 'string' }, 'test')
      expect(errors).toHaveLength(0)
    })

    it('should return errors for null on non-null type', () => {
      const errors = validator.validateProperty(null, { type: 'string' }, 'test')
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should pass for null on null type', () => {
      const errors = validator.validateProperty(null, { type: 'null' }, 'test')
      expect(errors).toHaveLength(0)
    })

    it('should validate array items', () => {
      const errors = validator.validateProperty(
        [1, 2, 'three'],
        { type: 'array', items: { type: 'number' } },
        'arr',
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]!.path).toBe('arr[2]')
    })

    it('should include suggestions in errors', () => {
      const errors = validator.validateProperty(0, { type: 'number', minimum: 1 }, 'port')
      expect(errors[0]!.suggestion).toBeDefined()
    })

    it('should include rule in errors', () => {
      const errors = validator.validateProperty(0, { type: 'number', minimum: 1 }, 'port')
      expect(errors[0]!.rule).toBe('minimum')
    })

    it('should report required error for undefined with required flag', () => {
      const errors = validator.validateProperty(undefined, { type: 'string', required: ['test'] } , 'test')
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('addSchema / getSchema / removeSchema', () => {
    it('should add and retrieve a schema', () => {
      validator.addSchema('test', simpleSchema)
      expect(validator.getSchema('test')).toBe(simpleSchema)
    })

    it('should return undefined for unknown schema', () => {
      expect(validator.getSchema('nonexistent')).toBeUndefined()
    })

    it('should overwrite existing schema', () => {
      validator.addSchema('test', simpleSchema)
      validator.addSchema('test', nestedSchema)
      expect(validator.getSchema('test')).toBe(nestedSchema)
    })

    it('should remove a schema', () => {
      validator.addSchema('test', simpleSchema)
      const removed = validator.removeSchema('test')
      expect(removed).toBe(true)
      expect(validator.getSchema('test')).toBeUndefined()
    })

    it('should return false when removing nonexistent schema', () => {
      const removed = validator.removeSchema('nonexistent')
      expect(removed).toBe(false)
    })
  })

  describe('getErrors', () => {
    it('should return errors from last validation', () => {
      validator.validate({ port: 'bad' }, simpleSchema)
      const errors = validator.getErrors()
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return empty array after valid validation', () => {
      validator.validate({ name: 'test' }, simpleSchema)
      const errors = validator.getErrors()
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0)
    })

    it('should return a copy of errors', () => {
      validator.validate({ port: 'bad' }, simpleSchema)
      const errors = validator.getErrors()
      errors.push({ path: 'fake', message: 'fake', severity: 'error' })
      const errors2 = validator.getErrors()
      expect(errors2.length).toBeLessThan(errors.length)
    })
  })

  describe('isValid', () => {
    it('should return true for valid data', () => {
      expect(validator.isValid({ name: 'test' }, simpleSchema)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(validator.isValid({ port: 'bad' }, simpleSchema)).toBe(false)
    })
  })

  describe('addCustomValidator', () => {
    it('should apply custom validator to property', () => {
      validator.addCustomValidator('positiveOnly', (value, _prop, path) => {
        const errors: ValidationError[] = []
        if (typeof value === 'number' && value <= 0) {
          errors.push({
            path,
            message: 'Value must be positive',
            severity: 'error',
            value,
            rule: 'custom',
          })
        }
        return errors
      })

      const customSchema: SchemaDefinition = {
        name: 'custom',
        type: 'object',
        properties: {
          amount: { type: 'number', customValidator: 'positiveOnly' },
        },
        required: [],
      }

      const validResult = validator.validate({ amount: 10 }, customSchema)
      expect(validResult.valid).toBe(true)

      const invalidResult = validator.validate({ amount: -5 }, customSchema)
      expect(invalidResult.valid).toBe(false)
      const customError = invalidResult.errors.find(e => e.message === 'Value must be positive')
      expect(customError).toBeDefined()
    })

    it('should skip missing custom validator gracefully', () => {
      const customSchema: SchemaDefinition = {
        name: 'custom',
        type: 'object',
        properties: {
          value: { type: 'number', customValidator: 'nonexistent' },
        },
        required: [],
      }
      const result = validator.validate({ value: 42 }, customSchema)
      expect(result.valid).toBe(true)
    })

    it('should allow multiple custom validators', () => {
      validator.addCustomValidator('evenOnly', (value, _prop, path) => {
        if (typeof value === 'number' && value % 2 !== 0) {
          return [{ path, message: 'Must be even', severity: 'error' as const, value, rule: 'custom' }]
        }
        return []
      })

      validator.addCustomValidator('maxTen', (value, _prop, path) => {
        if (typeof value === 'number' && value > 10) {
          return [{ path, message: 'Must be at most 10', severity: 'error' as const, value, rule: 'custom' }]
        }
        return []
      })

      const multiSchema: SchemaDefinition = {
        name: 'multi',
        type: 'object',
        properties: {
          even: { type: 'number', customValidator: 'evenOnly' },
          bounded: { type: 'number', customValidator: 'maxTen' },
        },
        required: [],
      }

      const validResult = validator.validate({ even: 4, bounded: 5 }, multiSchema)
      expect(validResult.valid).toBe(true)

      const invalidResult = validator.validate({ even: 3, bounded: 15 }, multiSchema)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errorCount).toBe(2)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = validator.getStatistics()
      expect(stats.totalValidations).toBe(0)
      expect(stats.totalErrors).toBe(0)
      expect(stats.totalWarnings).toBe(0)
      expect(stats.schemasRegistered).toBe(0)
      expect(stats.customValidatorsRegistered).toBe(0)
    })

    it('should track total validations', () => {
      validator.validate({ name: 'test' }, simpleSchema)
      validator.validate({ name: 'test2' }, simpleSchema)
      expect(validator.getStatistics().totalValidations).toBe(2)
    })

    it('should track total errors', () => {
      validator.validate({ port: 'bad' }, simpleSchema)
      expect(validator.getStatistics().totalErrors).toBeGreaterThan(0)
    })

    it('should track schemas registered', () => {
      validator.addSchema('s1', simpleSchema)
      validator.addSchema('s2', nestedSchema)
      expect(validator.getStatistics().schemasRegistered).toBe(2)
    })

    it('should track custom validators registered', () => {
      validator.addCustomValidator('cv1', () => [])
      validator.addCustomValidator('cv2', () => [])
      expect(validator.getStatistics().customValidatorsRegistered).toBe(2)
    })

    it('should update schemas registered on removal', () => {
      validator.addSchema('s1', simpleSchema)
      validator.removeSchema('s1')
      expect(validator.getStatistics().schemasRegistered).toBe(0)
    })

    it('should return a copy of statistics', () => {
      const stats1 = validator.getStatistics()
      validator.validate({ name: 'test' }, simpleSchema)
      const stats2 = validator.getStatistics()
      expect(stats1.totalValidations).toBe(0)
      expect(stats2.totalValidations).toBe(1)
    })
  })

  describe('clear', () => {
    it('should clear all schemas', () => {
      validator.addSchema('s1', simpleSchema)
      validator.addSchema('s2', nestedSchema)
      validator.clear()
      expect(validator.getSchema('s1')).toBeUndefined()
      expect(validator.getSchema('s2')).toBeUndefined()
    })

    it('should clear last errors', () => {
      validator.validate({ port: 'bad' }, simpleSchema)
      validator.clear()
      expect(validator.getErrors()).toHaveLength(0)
    })

    it('should clear custom validators', () => {
      validator.addCustomValidator('cv1', () => [])
      validator.clear()
      expect(validator.getStatistics().customValidatorsRegistered).toBe(0)
    })

    it('should reset statistics', () => {
      validator.validate({ name: 'test' }, simpleSchema)
      validator.addSchema('s1', simpleSchema)
      validator.clear()
      const stats = validator.getStatistics()
      expect(stats.totalValidations).toBe(0)
      expect(stats.totalErrors).toBe(0)
      expect(stats.schemasRegistered).toBe(0)
    })
  })

  describe('config options', () => {
    it('should use default config when none provided', () => {
      const v = new SchemaValidator()
      const result = v.validate({ name: 'test' }, simpleSchema)
      expect(result.valid).toBe(true)
    })

    it('should respect strict mode for additional properties', () => {
      const strictValidator = new SchemaValidator({ strict: true })
      const schema: SchemaDefinition = {
        name: 'strict-test',
        type: 'object',
        properties: { name: { type: 'string' } },
        required: [],
      }
      const result = strictValidator.validate({ name: 'test', extra: true }, schema)
      expect(result.valid).toBe(false)
    })

    it('should respect stopOnError config', () => {
      const stopValidator = new SchemaValidator({ stopOnError: true })
      const multiReqSchema: SchemaDefinition = {
        name: 'stop',
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'string' },
        },
        required: ['a', 'b', 'c'],
      }
      const result = stopValidator.validate({}, multiReqSchema)
      expect(result.errorCount).toBe(1)
    })

    it('should respect maxErrors config', () => {
      const maxErrorsValidator = new SchemaValidator({ maxErrors: 2 })
      const multiSchema: SchemaDefinition = {
        name: 'max-errors',
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'string' },
          d: { type: 'string' },
        },
        required: [],
      }
      const result = maxErrorsValidator.validate(
        { a: 1, b: 2, c: 3, d: 4 },
        multiSchema,
      )
      expect(result.errorCount).toBeLessThanOrEqual(2)
    })
  })

  describe('error reporting', () => {
    it('should include path in error', () => {
      const result = validator.validate({ name: 'test', port: 'bad' }, simpleSchema)
      const portError = result.errors.find(e => e.path === 'port')
      expect(portError!.path).toBe('port')
    })

    it('should include message in error', () => {
      const result = validator.validate({ name: 'test', port: 'bad' }, simpleSchema)
      const portError = result.errors.find(e => e.path === 'port')
      expect(portError!.message).toBeTruthy()
    })

    it('should include severity in error', () => {
      const result = validator.validate({ name: 'test', port: 'bad' }, simpleSchema)
      const portError = result.errors.find(e => e.path === 'port')
      expect(portError!.severity).toBe('error')
    })

    it('should include value in error when available', () => {
      const result = validator.validate({ name: 'test', port: 'bad' }, simpleSchema)
      const portError = result.errors.find(e => e.path === 'port')
      expect(portError!.value).toBe('bad')
    })

    it('should include suggestion in error when available', () => {
      const result = validator.validate({ name: 'test', port: 'bad' }, simpleSchema)
      const portError = result.errors.find(e => e.path === 'port')
      expect(portError!.suggestion).toBeDefined()
    })

    it('should include rule identifier in error', () => {
      const result = validator.validate({ name: 'test', port: 'bad' }, simpleSchema)
      const portError = result.errors.find(e => e.path === 'port')
      expect(portError!.rule).toBeDefined()
    })

    it('should count errors correctly', () => {
      const result = validator.validate({ port: 'bad', name: 42 }, simpleSchema)
      expect(result.errorCount).toBeGreaterThanOrEqual(2)
    })

    it('should count warnings correctly', () => {
      const result = validator.validate({ name: 'test', custom: 'value' }, simpleSchema)
      expect(result.warningCount).toBe(0)
    })
  })

  describe('DEFAULT_VALIDATOR_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_VALIDATOR_CONFIG.strict).toBe(false)
      expect(DEFAULT_VALIDATOR_CONFIG.allowAdditionalProperties).toBe(true)
      expect(DEFAULT_VALIDATOR_CONFIG.stopOnError).toBe(false)
      expect(DEFAULT_VALIDATOR_CONFIG.maxErrors).toBe(100)
      expect(DEFAULT_VALIDATOR_CONFIG.coerceTypes).toBe(false)
    })
  })

  describe('re-exports', () => {
    it('should re-export types', () => {
      const schema: SchemaDefinition = {
        name: 're-export-test',
        type: 'object',
        properties: { value: { type: 'string' } },
        required: [],
      }
      const config: Partial<ValidatorConfig> = { strict: false }
      expect(config.strict).toBe(false)
      expect(schema.type).toBe('object')
    })
  })
})
