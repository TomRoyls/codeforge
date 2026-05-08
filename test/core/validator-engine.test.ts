import { describe, it, expect } from 'vitest'
import { RuleValidator } from '../../src/core/validator-engine/rule-validator.js'
import { ValidatorEngine } from '../../src/core/validator-engine/validator-engine.js'
import type { ValidationSchema, ValidationRule } from '../../src/core/validator-engine/types.js'

describe('RuleValidator', () => {
  describe('required', () => {
    it('should pass for non-empty string', () => {
      expect(RuleValidator.required().check('hello')).toBe(true)
    })
    it('should fail for null', () => {
      expect(RuleValidator.required().check(null)).toBe(false)
    })
    it('should fail for undefined', () => {
      expect(RuleValidator.required().check(undefined)).toBe(false)
    })
    it('should fail for empty string', () => {
      expect(RuleValidator.required().check('')).toBe(false)
    })
    it('should pass for number zero', () => {
      expect(RuleValidator.required().check(0)).toBe(true)
    })
    it('should pass for false', () => {
      expect(RuleValidator.required().check(false)).toBe(true)
    })
  })

  describe('string', () => {
    it('should pass for string', () => {
      expect(RuleValidator.string().check('hello')).toBe(true)
    })
    it('should fail for number', () => {
      expect(RuleValidator.string().check(42)).toBe(false)
    })
    it('should fail for boolean', () => {
      expect(RuleValidator.string().check(true)).toBe(false)
    })
  })

  describe('number', () => {
    it('should pass for number', () => {
      expect(RuleValidator.number().check(42)).toBe(true)
    })
    it('should fail for NaN', () => {
      expect(RuleValidator.number().check(NaN)).toBe(false)
    })
    it('should fail for string', () => {
      expect(RuleValidator.number().check('42')).toBe(false)
    })
  })

  describe('boolean', () => {
    it('should pass for true', () => {
      expect(RuleValidator.boolean().check(true)).toBe(true)
    })
    it('should pass for false', () => {
      expect(RuleValidator.boolean().check(false)).toBe(true)
    })
    it('should fail for string', () => {
      expect(RuleValidator.boolean().check('true')).toBe(false)
    })
  })

  describe('minLength', () => {
    it('should pass for string meeting minimum', () => {
      expect(RuleValidator.minLength(3).check('abc')).toBe(true)
    })
    it('should fail for string below minimum', () => {
      expect(RuleValidator.minLength(5).check('ab')).toBe(false)
    })
    it('should pass for array meeting minimum', () => {
      expect(RuleValidator.minLength(2).check([1, 2])).toBe(true)
    })
    it('should fail for array below minimum', () => {
      expect(RuleValidator.minLength(3).check([1])).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('should pass for string within limit', () => {
      expect(RuleValidator.maxLength(5).check('abc')).toBe(true)
    })
    it('should fail for string exceeding limit', () => {
      expect(RuleValidator.maxLength(2).check('abc')).toBe(false)
    })
    it('should pass for array within limit', () => {
      expect(RuleValidator.maxLength(3).check([1, 2])).toBe(true)
    })
  })

  describe('min', () => {
    it('should pass for number above minimum', () => {
      expect(RuleValidator.min(5).check(10)).toBe(true)
    })
    it('should pass for number at minimum', () => {
      expect(RuleValidator.min(5).check(5)).toBe(true)
    })
    it('should fail for number below minimum', () => {
      expect(RuleValidator.min(5).check(3)).toBe(false)
    })
  })

  describe('max', () => {
    it('should pass for number below maximum', () => {
      expect(RuleValidator.max(10).check(5)).toBe(true)
    })
    it('should pass for number at maximum', () => {
      expect(RuleValidator.max(10).check(10)).toBe(true)
    })
    it('should fail for number above maximum', () => {
      expect(RuleValidator.max(5).check(10)).toBe(false)
    })
  })

  describe('pattern', () => {
    it('should pass for matching string', () => {
      expect(RuleValidator.pattern(/^\d+$/).check('123')).toBe(true)
    })
    it('should fail for non-matching string', () => {
      expect(RuleValidator.pattern(/^\d+$/).check('abc')).toBe(false)
    })
    it('should fail for non-string', () => {
      expect(RuleValidator.pattern(/^\d+$/).check(123)).toBe(false)
    })
  })

  describe('enum', () => {
    it('should pass for value in enum', () => {
      expect(RuleValidator.enum(['a', 'b', 'c']).check('b')).toBe(true)
    })
    it('should fail for value not in enum', () => {
      expect(RuleValidator.enum(['a', 'b']).check('c')).toBe(false)
    })
  })

  describe('email', () => {
    it('should pass for valid email', () => {
      expect(RuleValidator.email().check('user@example.com')).toBe(true)
    })
    it('should fail for invalid email', () => {
      expect(RuleValidator.email().check('not-email')).toBe(false)
    })
    it('should fail for non-string', () => {
      expect(RuleValidator.email().check(42)).toBe(false)
    })
  })

  describe('url', () => {
    it('should pass for valid http url', () => {
      expect(RuleValidator.url().check('http://example.com')).toBe(true)
    })
    it('should pass for valid https url', () => {
      expect(RuleValidator.url().check('https://example.com')).toBe(true)
    })
    it('should fail for invalid url', () => {
      expect(RuleValidator.url().check('not-a-url')).toBe(false)
    })
    it('should fail for non-string', () => {
      expect(RuleValidator.url().check(42)).toBe(false)
    })
  })

  describe('createRule', () => {
    it('should create custom rule with error severity', () => {
      const rule = RuleValidator.createRule('custom', (v) => typeof v === 'string', 'Must be string')
      expect(rule.name).toBe('custom')
      expect(rule.severity).toBe('error')
      expect(rule.check('hello')).toBe(true)
      expect(rule.check(42)).toBe(false)
    })
    it('should create custom rule with warning severity', () => {
      const rule = RuleValidator.createRule('warn-rule', () => false, 'Warn', 'warning')
      expect(rule.severity).toBe('warning')
    })
  })
})

describe('ValidatorEngine', () => {
  const engine = new ValidatorEngine()

  describe('validate simple object', () => {
    const simpleSchema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: true },
        age: { type: 'number', required: false },
        active: { type: 'boolean', required: false },
      },
      additionalProperties: false,
    }

    it('should validate a correct simple object', () => {
      const result = engine.validate({ name: 'test', age: 25, active: true }, simpleSchema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail for missing required field', () => {
      const result = engine.validate({ age: 25 }, simpleSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('required')
      expect(result.errors[0]!.path).toBe('name')
    })

    it('should fail for type mismatch', () => {
      const result = engine.validate({ name: 123 }, simpleSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('type')
    })

    it('should validate non-null object only', () => {
      const result = engine.validate(null, simpleSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.message).toContain('non-null object')
    })

    it('should reject array input', () => {
      const result = engine.validate([], simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should pass when optional fields are omitted', () => {
      const result = engine.validate({ name: 'test' }, simpleSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('validate nested object', () => {
    const nestedSchema: ValidationSchema = {
      properties: {
        server: {
          type: 'object',
          required: true,
          properties: {
            host: { type: 'string', required: true },
            port: { type: 'number', required: false },
            ssl: {
              type: 'object',
              required: false,
              properties: {
                enabled: { type: 'boolean', required: false },
                cert: { type: 'string', required: false },
              },
            },
          },
        },
      },
      additionalProperties: false,
    }

    it('should validate correct nested object', () => {
      const result = engine.validate(
        { server: { host: 'localhost', port: 3000, ssl: { enabled: true } } },
        nestedSchema,
      )
      expect(result.valid).toBe(true)
    })

    it('should report missing nested required field', () => {
      const result = engine.validate({ server: { port: 3000 } }, nestedSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.path).toBe('server.host')
    })

    it('should report type error in nested field', () => {
      const result = engine.validate({ server: { host: 123 } }, nestedSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.path).toBe('server.host')
      expect(result.errors[0]!.rule).toBe('type')
    })

    it('should validate deeply nested object', () => {
      const result = engine.validate(
        { server: { host: 'localhost', ssl: { enabled: 'not-bool' } } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.path).toBe('server.ssl.enabled')
    })

    it('should report missing top-level required object', () => {
      const result = engine.validate({}, nestedSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.path).toBe('server')
    })
  })

  describe('validate constraints', () => {
    const constraintSchema: ValidationSchema = {
      properties: {
        username: { type: 'string', required: true, minLength: 3, maxLength: 20 },
        age: { type: 'number', required: false, min: 0, max: 150 },
        email: { type: 'string', required: false, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
        role: { type: 'string', required: false, enum: ['admin', 'user', 'guest'] },
        tags: { type: 'array', required: false, minLength: 1, maxLength: 5, items: { type: 'string', required: true } },
      },
      additionalProperties: false,
    }

    it('should pass for valid constrained data', () => {
      const result = engine.validate(
        { username: 'john', age: 25, email: 'john@test.com', role: 'admin', tags: ['dev'] },
        constraintSchema,
      )
      expect(result.valid).toBe(true)
    })

    it('should fail for string below minLength', () => {
      const result = engine.validate({ username: 'ab' }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('minLength')
    })

    it('should fail for string above maxLength', () => {
      const result = engine.validate({ username: 'a'.repeat(21) }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('maxLength')
    })

    it('should fail for number below min', () => {
      const result = engine.validate({ username: 'test', age: -1 }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('min')
    })

    it('should fail for number above max', () => {
      const result = engine.validate({ username: 'test', age: 200 }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('max')
    })

    it('should fail for pattern mismatch', () => {
      const result = engine.validate({ username: 'test', email: 'not-email' }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('pattern')
    })

    it('should fail for invalid enum value', () => {
      const result = engine.validate({ username: 'test', role: 'superadmin' }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('enum')
    })

    it('should validate array minLength', () => {
      const result = engine.validate({ username: 'test', tags: [] }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('minLength')
    })

    it('should validate array maxLength', () => {
      const result = engine.validate({ username: 'test', tags: ['a', 'b', 'c', 'd', 'e', 'f'] }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.rule).toBe('maxLength')
    })

    it('should validate array items type', () => {
      const result = engine.validate({ username: 'test', tags: [123] }, constraintSchema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.path).toBe('tags[0]')
    })

    it('should pass for valid array items', () => {
      const result = engine.validate({ username: 'test', tags: ['a', 'b'] }, constraintSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateWithRules', () => {
    it('should validate against flat rule array', () => {
      const rules: ValidationRule[] = [
        RuleValidator.string(),
        RuleValidator.minLength(3),
      ]
      const result = engine.validateWithRules('hello', rules)
      expect(result.valid).toBe(true)
    })

    it('should collect errors from failed rules', () => {
      const rules: ValidationRule[] = [
        RuleValidator.string(),
        RuleValidator.minLength(10),
      ]
      const result = engine.validateWithRules('hi', rules)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should separate warnings and errors', () => {
      const rules: ValidationRule[] = [
        RuleValidator.string(),
        RuleValidator.createRule('warn', () => false, 'warning msg', 'warning'),
      ]
      const result = engine.validateWithRules('hello', rules)
      expect(result.valid).toBe(true)
      expect(result.warnings).toHaveLength(1)
    })

    it('should handle empty rules array', () => {
      const result = engine.validateWithRules('anything', [])
      expect(result.valid).toBe(true)
    })
  })

  describe('addRule', () => {
    it('should add a global rule', () => {
      const e = new ValidatorEngine()
      const rule = RuleValidator.createRule('test', (v) => v !== null, 'not null')
      e.addRule(rule)
      expect(e.getConfig().strictMode).toBe(true)
    })
  })

  describe('addSchema / getSchema / validateWithSchema', () => {
    const testSchema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: true },
      },
      additionalProperties: false,
    }

    it('should register and retrieve a schema', () => {
      const e = new ValidatorEngine()
      e.addSchema('user', testSchema)
      expect(e.getSchema('user')).toBe(testSchema)
    })

    it('should return undefined for unknown schema', () => {
      const e = new ValidatorEngine()
      expect(e.getSchema('nonexistent')).toBeUndefined()
    })

    it('should validate using registered schema', () => {
      const e = new ValidatorEngine()
      e.addSchema('user', testSchema)
      const result = e.validateWithSchema('user', { name: 'Alice' })
      expect(result.valid).toBe(true)
    })

    it('should fail for unknown schema name', () => {
      const e = new ValidatorEngine()
      const result = e.validateWithSchema('unknown', { name: 'Alice' })
      expect(result.valid).toBe(false)
      expect(result.errors[0]!.message).toContain('not found')
    })

    it('should overwrite existing schema', () => {
      const e = new ValidatorEngine()
      const schema2: ValidationSchema = {
        properties: { id: { type: 'number', required: true } },
        additionalProperties: false,
      }
      e.addSchema('user', testSchema)
      e.addSchema('user', schema2)
      expect(e.getSchema('user')).toBe(schema2)
    })
  })

  describe('stopOnError', () => {
    it('should stop at first error when stopOnError is true', () => {
      const e = new ValidatorEngine({ stopOnError: true })
      const schema: ValidationSchema = {
        properties: {
          a: { type: 'string', required: true },
          b: { type: 'number', required: true },
          c: { type: 'boolean', required: true },
        },
        additionalProperties: false,
      }
      const result = e.validate({}, schema)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should collect all errors when stopOnError is false', () => {
      const e = new ValidatorEngine({ stopOnError: false })
      const schema: ValidationSchema = {
        properties: {
          a: { type: 'string', required: true },
          b: { type: 'number', required: true },
        },
        additionalProperties: false,
      }
      const result = e.validate({}, schema)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('maxErrors', () => {
    it('should limit errors to maxErrors', () => {
      const e = new ValidatorEngine({ maxErrors: 2 })
      const schema: ValidationSchema = {
        properties: {
          a: { type: 'string', required: true },
          b: { type: 'number', required: true },
          c: { type: 'boolean', required: true },
          d: { type: 'string', required: true },
        },
        additionalProperties: false,
      }
      const result = e.validate({}, schema)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getConfig', () => {
    it('should return default config', () => {
      const e = new ValidatorEngine()
      const config = e.getConfig()
      expect(config.strictMode).toBe(true)
      expect(config.stopOnError).toBe(false)
      expect(config.maxErrors).toBe(100)
    })

    it('should return custom config', () => {
      const e = new ValidatorEngine({ strictMode: false, maxErrors: 50 })
      const config = e.getConfig()
      expect(config.strictMode).toBe(false)
      expect(config.maxErrors).toBe(50)
    })
  })
})

describe('Edge cases', () => {
  it('should handle null values in non-required fields', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: true },
        nickname: { type: 'string', required: false },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ name: 'test', nickname: null }, schema)
    expect(result.valid).toBe(true)
  })

  it('should handle undefined values in non-required fields', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: true },
        nickname: { type: 'string', required: false },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ name: 'test' }, schema)
    expect(result.valid).toBe(true)
  })

  it('should handle null in required fields', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: true },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ name: null }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.rule).toBe('required')
  })

  it('should handle empty objects', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {},
      additionalProperties: false,
    }
    const result = engine.validate({}, schema)
    expect(result.valid).toBe(true)
  })

  it('should handle empty objects with required fields', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: true },
      },
      additionalProperties: false,
    }
    const result = engine.validate({}, schema)
    expect(result.valid).toBe(false)
  })

  it('should reject additional properties', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: false },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ name: 'test', extra: true }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.rule).toBe('additionalProperties')
  })

  it('should allow additional properties when enabled', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        name: { type: 'string', required: false },
      },
      additionalProperties: true,
    }
    const result = engine.validate({ name: 'test', extra: true }, schema)
    expect(result.valid).toBe(true)
  })

  it('should handle deeply nested schemas', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        level1: {
          type: 'object',
          required: true,
          properties: {
            level2: {
              type: 'object',
              required: true,
              properties: {
                level3: {
                  type: 'object',
                  required: true,
                  properties: {
                    value: { type: 'string', required: true },
                  },
                },
              },
            },
          },
        },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ level1: { level2: { level3: { value: 'deep' } } } }, schema)
    expect(result.valid).toBe(true)
  })

  it('should report error in deeply nested schema', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        level1: {
          type: 'object',
          required: true,
          properties: {
            level2: {
              type: 'object',
              required: true,
              properties: {
                value: { type: 'number', required: true },
              },
            },
          },
        },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ level1: { level2: { value: 'wrong' } } }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.path).toBe('level1.level2.value')
  })

  it('should handle arrays with items validation', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        items: {
          type: 'array',
          required: false,
          items: { type: 'number', required: true },
        },
      },
      additionalProperties: true,
    }
    const result = engine.validate({ items: [1, 2, 'three'] }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.path).toBe('items[2]')
  })

  it('should handle custom validation rule in schema', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        code: {
          type: 'string',
          required: false,
          custom: RuleValidator.createRule('uppercase', (v) => typeof v === 'string' && v === v.toUpperCase(), 'Must be uppercase'),
        },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ code: 'ABC' }, schema)
    expect(result.valid).toBe(true)
  })

  it('should fail custom validation rule', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        code: {
          type: 'string',
          required: false,
          custom: RuleValidator.createRule('uppercase', (v) => typeof v === 'string' && v === v.toUpperCase(), 'Must be uppercase'),
        },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ code: 'abc' }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.rule).toBe('uppercase')
  })

  it('should handle NaN as invalid number', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        count: { type: 'number', required: false },
      },
      additionalProperties: false,
    }
    const result = engine.validate({ count: NaN }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.rule).toBe('type')
  })

  it('should validate boolean type correctly', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        active: { type: 'boolean', required: true },
      },
      additionalProperties: false,
    }
    expect(engine.validate({ active: true }, schema).valid).toBe(true)
    expect(engine.validate({ active: false }, schema).valid).toBe(true)
    expect(engine.validate({ active: 'true' }, schema).valid).toBe(false)
  })

  it('should validate array type correctly', () => {
    const engine = new ValidatorEngine()
    const schema: ValidationSchema = {
      properties: {
        items: { type: 'array', required: false, items: { type: 'string', required: true } },
      },
      additionalProperties: false,
    }
    expect(engine.validate({ items: ['a', 'b'] }, schema).valid).toBe(true)
    expect(engine.validate({ items: 'not-array' }, schema).valid).toBe(false)
  })

  it('should handle config immutability', () => {
    const e = new ValidatorEngine()
    const config = e.getConfig()
    config.strictMode = false
    expect(e.getConfig().strictMode).toBe(true)
  })
})
