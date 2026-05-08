import { describe, it, expect } from 'vitest'
import { SchemaValidator } from '../../src/core/config-validator/schema-validator.js'
import { RuleValidator } from '../../src/core/config-validator/rule-validator.js'
import { ConfigMerger } from '../../src/core/config-validator/config-merger.js'
import type { ConfigSchema, SchemaProperty, MergeStrategy } from '../../src/core/config-validator/types.js'
import { DEFAULT_MERGE_STRATEGY } from '../../src/core/config-validator/types.js'

const simpleSchema: ConfigSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Project name' },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    debug: { type: 'boolean', default: false },
    port: { type: 'number', minimum: 1, maximum: 65535 },
    tags: { type: 'array', items: { type: 'string' } },
    logLevel: { type: 'string', enum: ['debug', 'info', 'warn', 'error'] },
  },
  required: ['name'],
}

const nestedSchema: ConfigSchema = {
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
          },
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

describe('SchemaValidator', () => {
  const validator = new SchemaValidator()

  describe('validate', () => {
    it('should validate a correct config', () => {
      const result = validator.validate(
        { name: 'my-project', version: '1.0.0', debug: true },
        simpleSchema,
      )
      expect(result.valid).toBe(true)
      expect(result.errors).toBe(0)
    })

    it('should fail on missing required field', () => {
      const result = validator.validate({ version: '1.0.0' }, simpleSchema)
      expect(result.valid).toBe(false)
      expect(result.errors).toBe(1)
      expect(result.issues[0]!.message).toContain('Missing required')
      expect(result.issues[0]!.path).toBe('name')
    })

    it('should report wrong type', () => {
      const result = validator.validate(
        { name: 'my-project', port: 'not-a-number' },
        simpleSchema,
      )
      expect(result.valid).toBe(false)
      const portIssue = result.issues.find((i) => i.path === 'port')
      expect(portIssue).toBeDefined()
      expect(portIssue!.message).toContain('Expected type "number"')
    })

    it('should validate enum values', () => {
      const result = validator.validate(
        { name: 'test', logLevel: 'invalid' },
        simpleSchema,
      )
      expect(result.valid).toBe(false)
      const logIssue = result.issues.find((i) => i.path === 'logLevel')
      expect(logIssue!.message).toContain('must be one of')
    })

    it('should validate minimum constraint', () => {
      const result = validator.validate(
        { name: 'test', port: 0 },
        simpleSchema,
      )
      expect(result.valid).toBe(false)
      const portIssue = result.issues.find((i) => i.path === 'port')
      expect(portIssue!.message).toContain('less than minimum')
    })

    it('should validate maximum constraint', () => {
      const result = validator.validate(
        { name: 'test', port: 70000 },
        simpleSchema,
      )
      expect(result.valid).toBe(false)
      const portIssue = result.issues.find((i) => i.path === 'port')
      expect(portIssue!.message).toContain('greater than maximum')
    })

    it('should validate pattern constraint', () => {
      const result = validator.validate(
        { name: 'test', version: 'invalid' },
        simpleSchema,
      )
      expect(result.valid).toBe(false)
      const versionIssue = result.issues.find((i) => i.path === 'version')
      expect(versionIssue!.message).toContain('does not match pattern')
    })

    it('should pass for valid pattern', () => {
      const result = validator.validate(
        { name: 'test', version: '1.2.3' },
        simpleSchema,
      )
      expect(result.valid).toBe(true)
    })

    it('should reject additional properties when not allowed', () => {
      const strictSchema: ConfigSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: [],
        additionalProperties: false,
      }
      const result = validator.validate(
        { name: 'test', extra: true },
        strictSchema,
      )
      expect(result.valid).toBe(false)
      const extraIssue = result.issues.find((i) => i.path === 'extra')
      expect(extraIssue!.message).toContain('Unknown property')
    })

    it('should allow unknown properties with info severity', () => {
      const result = validator.validate(
        { name: 'test', custom: 'value' },
        simpleSchema,
      )
      expect(result.valid).toBe(true)
      const infoIssue = result.issues.find(
        (i) => i.path === 'custom' && i.severity === 'info',
      )
      expect(infoIssue).toBeDefined()
    })

    it('should reject non-object config', () => {
      const result = validator.validate('not an object' as unknown as Record<string, unknown>, simpleSchema)
      expect(result.valid).toBe(false)
      expect(result.errors).toBe(1)
    })

    it('should reject null config', () => {
      const result = validator.validate(null as unknown as Record<string, unknown>, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should reject array config', () => {
      const result = validator.validate([] as unknown as Record<string, unknown>, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should validate nested objects', () => {
      const result = validator.validate(
        { server: { host: 'example.com', port: 8080 } },
        nestedSchema,
      )
      expect(result.valid).toBe(true)
    })

    it('should validate nested objects with errors', () => {
      const result = validator.validate(
        { server: { host: 123, port: 99999 } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should report missing required nested fields', () => {
      const result = validator.validate(
        { server: { port: 3000 } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      const hostIssue = result.issues.find((i) =>
        i.path === 'server.host' && i.message.includes('Missing required'),
      )
      expect(hostIssue).toBeDefined()
    })

    it('should validate deeply nested objects', () => {
      const result = validator.validate(
        { server: { host: 'localhost', ssl: { enabled: 'not-bool' } } },
        nestedSchema,
      )
      expect(result.valid).toBe(false)
      const sslIssue = result.issues.find((i) =>
        i.path === 'server.ssl.enabled',
      )
      expect(sslIssue).toBeDefined()
    })

    it('should validate array items', () => {
      const result = validator.validate(
        { name: 'test', tags: ['valid', 123] },
        simpleSchema,
      )
      expect(result.valid).toBe(false)
      const itemIssue = result.issues.find((i) =>
        i.path === 'tags[1]',
      )
      expect(itemIssue).toBeDefined()
    })

    it('should validate all valid array items', () => {
      const result = validator.validate(
        { name: 'test', tags: ['a', 'b', 'c'] },
        simpleSchema,
      )
      expect(result.valid).toBe(true)
    })

    it('should count warnings and errors correctly', () => {
      const result = validator.validate(
        { port: 'wrong' },
        simpleSchema,
      )
      expect(result.errors).toBeGreaterThan(0)
    })

    it('should handle empty config with required fields', () => {
      const result = validator.validate({}, simpleSchema)
      expect(result.valid).toBe(false)
    })

    it('should handle empty config without required fields', () => {
      const noReqSchema: ConfigSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: [],
      }
      const result = validator.validate({}, noReqSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateProperty', () => {
    it('should return no issues for valid string property', () => {
      const issues = validator.validateProperty('hello', { type: 'string' }, 'test')
      expect(issues).toHaveLength(0)
    })

    it('should return issues for wrong type', () => {
      const issues = validator.validateProperty(42, { type: 'string' }, 'test')
      expect(issues.length).toBeGreaterThan(0)
    })

    it('should return issues for enum mismatch', () => {
      const issues = validator.validateProperty(
        'invalid',
        { type: 'string', enum: ['a', 'b'] },
        'test',
      )
      expect(issues.length).toBeGreaterThan(0)
    })

    it('should pass for valid enum value', () => {
      const issues = validator.validateProperty(
        'a',
        { type: 'string', enum: ['a', 'b'] },
        'test',
      )
      expect(issues).toHaveLength(0)
    })

    it('should return issues for minimum violation', () => {
      const issues = validator.validateProperty(
        0,
        { type: 'number', minimum: 1 },
        'count',
      )
      expect(issues.length).toBeGreaterThan(0)
    })

    it('should return issues for maximum violation', () => {
      const issues = validator.validateProperty(
        100,
        { type: 'number', maximum: 50 },
        'count',
      )
      expect(issues.length).toBeGreaterThan(0)
    })

    it('should return issues for pattern mismatch', () => {
      const issues = validator.validateProperty(
        'abc',
        { type: 'string', pattern: '^\\d+$' },
        'test',
      )
      expect(issues.length).toBeGreaterThan(0)
    })

    it('should pass for pattern match', () => {
      const issues = validator.validateProperty(
        '123',
        { type: 'string', pattern: '^\\d+$' },
        'test',
      )
      expect(issues).toHaveLength(0)
    })

    it('should return no issues for null/undefined with default', () => {
      const issues = validator.validateProperty(undefined, { type: 'string', default: 'hello' }, 'test')
      expect(issues).toHaveLength(0)
    })

    it('should return no issues for null without default', () => {
      const issues = validator.validateProperty(null, { type: 'string' }, 'test')
      expect(issues).toHaveLength(0)
    })

    it('should accept integer as number', () => {
      const issues = validator.validateProperty(42, { type: 'number' }, 'test')
      expect(issues).toHaveLength(0)
    })

    it('should validate array with typed items', () => {
      const issues = validator.validateProperty(
        [1, 2, 'three'],
        { type: 'array', items: { type: 'number' } },
        'arr',
      )
      expect(issues.length).toBeGreaterThan(0)
      expect(issues[0]!.path).toBe('arr[2]')
    })

    it('should include suggestions in issues', () => {
      const issues = validator.validateProperty(
        0,
        { type: 'number', minimum: 1 },
        'port',
      )
      expect(issues[0]!.suggestion).toBeDefined()
    })
  })

  describe('getDefaults', () => {
    it('should extract defaults from schema', () => {
      const defaults = validator.getDefaults(simpleSchema)
      expect(defaults.debug).toBe(false)
    })

    it('should not include properties without defaults', () => {
      const defaults = validator.getDefaults(simpleSchema)
      expect('name' in defaults).toBe(false)
    })

    it('should extract nested defaults', () => {
      const defaults = validator.getDefaults(nestedSchema)
      expect(defaults.server).toEqual({
        host: 'localhost',
        port: 3000,
        ssl: { enabled: false },
      })
    })

    it('should return empty object for schema with no defaults', () => {
      const noDefaultsSchema: ConfigSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: [],
      }
      const defaults = validator.getDefaults(noDefaultsSchema)
      expect(Object.keys(defaults)).toHaveLength(0)
    })
  })

  describe('coerce', () => {
    it('should coerce string to number', () => {
      expect(validator.coerce('42', 'number')).toBe(42)
    })

    it('should coerce string to boolean', () => {
      expect(validator.coerce('true', 'boolean')).toBe(true)
      expect(validator.coerce('false', 'boolean')).toBe(false)
    })

    it('should coerce number to string', () => {
      expect(validator.coerce(42, 'string')).toBe('42')
    })

    it('should coerce string to integer', () => {
      expect(validator.coerce('3.7', 'integer')).toBe(3)
    })

    it('should return original for uncoercable value', () => {
      expect(validator.coerce('not-a-number', 'number')).toBe('not-a-number')
    })

    it('should return null for null input', () => {
      expect(validator.coerce(null, 'string')).toBe(null)
    })

    it('should return undefined for undefined input', () => {
      expect(validator.coerce(undefined, 'string')).toBe(undefined)
    })

    it('should coerce boolean with non-string', () => {
      expect(validator.coerce(1, 'boolean')).toBe(true)
      expect(validator.coerce(0, 'boolean')).toBe(false)
    })

    it('should return original for unknown target type', () => {
      expect(validator.coerce({ foo: 1 }, 'object')).toEqual({ foo: 1 })
    })
  })

  describe('addSchema / getSchema', () => {
    it('should add and retrieve a schema', () => {
      const sv = new SchemaValidator()
      sv.addSchema('test', simpleSchema)
      expect(sv.getSchema('test')).toBe(simpleSchema)
    })

    it('should return null for unknown schema', () => {
      const sv = new SchemaValidator()
      expect(sv.getSchema('nonexistent')).toBe(null)
    })

    it('should overwrite existing schema', () => {
      const sv = new SchemaValidator()
      sv.addSchema('test', simpleSchema)
      sv.addSchema('test', nestedSchema)
      expect(sv.getSchema('test')).toBe(nestedSchema)
    })
  })
})

describe('RuleValidator', () => {
  const ruleValidator = new RuleValidator()

  describe('validateRules', () => {
    it('should validate valid string config rules', () => {
      const result = ruleValidator.validateRules({
        'no-console': 'error',
        'prefer-const': 'warning',
        'no-eval': 'off',
      })
      expect(result.valid).toBe(true)
    })

    it('should warn on unknown rules', () => {
      const result = ruleValidator.validateRules({
        'nonexistent-rule': 'error',
      })
      expect(result.valid).toBe(true)
      expect(result.warnings).toBe(1)
    })

    it('should validate object config', () => {
      const result = ruleValidator.validateRules({
        'max-params': { severity: 'error', max: 5 },
      })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid severity string', () => {
      const result = ruleValidator.validateRules({
        'no-console': 'invalid',
      })
      expect(result.valid).toBe(false)
    })

    it('should validate boolean config', () => {
      const result = ruleValidator.validateRules({
        'no-console': true,
      })
      expect(result.valid).toBe(true)
    })

    it('should validate array config', () => {
      const result = ruleValidator.validateRules({
        'max-params': ['error', { max: 3 }],
      })
      expect(result.valid).toBe(true)
    })

    it('should reject empty array config', () => {
      const result = ruleValidator.validateRules({
        'max-params': [],
      })
      expect(result.valid).toBe(false)
    })

    it('should reject invalid array severity', () => {
      const result = ruleValidator.validateRules({
        'max-params': ['invalid'],
      })
      expect(result.valid).toBe(false)
    })

    it('should validate numeric severity', () => {
      const result = ruleValidator.validateRules({
        'no-console': 2,
        'prefer-const': 1,
        'no-eval': 0,
      })
      expect(result.valid).toBe(true)
    })

    it('should reject out-of-range numeric severity', () => {
      const result = ruleValidator.validateRules({
        'no-console': 5,
      })
      expect(result.valid).toBe(false)
    })

    it('should reject out-of-range numeric severity in array', () => {
      const result = ruleValidator.validateRules({
        'max-params': [5, { max: 3 }],
      })
      expect(result.valid).toBe(false)
    })

    it('should warn on unknown options in array config', () => {
      const result = ruleValidator.validateRules({
        'max-params': ['error', { unknownOption: 5 }],
      })
      expect(result.warnings).toBe(1)
    })

    it('should warn on unknown options in object config', () => {
      const result = ruleValidator.validateRules({
        'no-console': { severity: 'error', unknownOpt: true },
      })
      expect(result.warnings).toBe(1)
    })

    it('should reject invalid enum values in object config', () => {
      const result = ruleValidator.validateRules({
        'no-console': { severity: 'error', allow: 'not-an-array' },
      })
      expect(result.valid).toBe(false)
    })

    it('should reject invalid option value below minimum', () => {
      const result = ruleValidator.validateRules({
        'max-params': { severity: 'error', max: -1 },
      })
      expect(result.valid).toBe(false)
    })

    it('should handle empty rules object', () => {
      const result = ruleValidator.validateRules({})
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })
  })

  describe('validateRule', () => {
    it('should validate a single known rule', () => {
      const issues = ruleValidator.validateRule('no-console', 'error')
      expect(issues).toHaveLength(0)
    })

    it('should warn on unknown rule', () => {
      const issues = ruleValidator.validateRule('fake-rule', 'error')
      expect(issues.length).toBeGreaterThan(0)
      expect(issues[0]!.severity).toBe('warning')
    })

    it('should reject invalid config type', () => {
      const issues = ruleValidator.validateRule('no-console', Symbol('x') as unknown)
      expect(issues.length).toBeGreaterThan(0)
      expect(issues[0]!.severity).toBe('error')
    })
  })

  describe('getKnownRules', () => {
    it('should return all known rule IDs', () => {
      const rules = ruleValidator.getKnownRules()
      expect(rules.length).toBeGreaterThan(0)
      expect(rules).toContain('no-console')
      expect(rules).toContain('prefer-const')
      expect(rules).toContain('no-eval')
      expect(rules).toContain('max-params')
      expect(rules).toContain('max-complexity')
      expect(rules).toContain('no-unused-vars')
      expect(rules).toContain('max-lines')
      expect(rules).toContain('no-circular-deps')
    })

    it('should return sorted rules', () => {
      const rules = ruleValidator.getKnownRules()
      const sorted = [...rules].sort()
      expect(rules).toEqual(sorted)
    })
  })

  describe('isKnownRule', () => {
    it('should return true for known rules', () => {
      expect(ruleValidator.isKnownRule('no-console')).toBe(true)
      expect(ruleValidator.isKnownRule('prefer-const')).toBe(true)
      expect(ruleValidator.isKnownRule('no-eval')).toBe(true)
    })

    it('should return false for unknown rules', () => {
      expect(ruleValidator.isKnownRule('fake-rule')).toBe(false)
      expect(ruleValidator.isKnownRule('')).toBe(false)
    })
  })

  describe('getRuleSchema', () => {
    it('should return schema for known rule', () => {
      const schema = ruleValidator.getRuleSchema('max-params')
      expect(schema).not.toBeNull()
      expect(schema!.type).toBe('object')
      expect(schema!.properties!.max).toBeDefined()
    })

    it('should return null for unknown rule', () => {
      expect(ruleValidator.getRuleSchema('nonexistent')).toBeNull()
    })

    it('should have severity in all rule schemas', () => {
      const rules = ruleValidator.getKnownRules()
      for (const rule of rules) {
        const schema = ruleValidator.getRuleSchema(rule)
        expect(schema!.properties!.severity).toBeDefined()
      }
    })
  })
})

describe('ConfigMerger', () => {
  const merger = new ConfigMerger()

  describe('merge', () => {
    it('should merge flat objects', () => {
      const result = merger.merge(
        { a: 1, b: 2 },
        { b: 3, c: 4 },
      )
      expect(result.config).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should track applied paths', () => {
      const result = merger.merge(
        { a: 1 },
        { b: 2, c: 3 },
      )
      expect(result.applied).toContain('b')
      expect(result.applied).toContain('c')
    })

    it('should deep merge nested objects by default', () => {
      const result = merger.merge(
        { server: { host: 'localhost', port: 3000 } },
        { server: { port: 8080, ssl: true } },
      )
      expect(result.config.server).toEqual({
        host: 'localhost',
        port: 8080,
        ssl: true,
      })
    })

    it('should replace arrays by default', () => {
      const result = merger.merge(
        { tags: ['a', 'b'] },
        { tags: ['c', 'd'] },
      )
      expect(result.config.tags).toEqual(['c', 'd'])
    })

    it('should append arrays with append strategy', () => {
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, arrays: 'append' }
      const result = merger.merge(
        { tags: ['a', 'b'] },
        { tags: ['c', 'd'] },
        strategy,
      )
      expect(result.config.tags).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should merge unique arrays with merge strategy', () => {
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, arrays: 'merge' }
      const result = merger.merge(
        { tags: ['a', 'b'] },
        { tags: ['b', 'c'] },
        strategy,
      )
      expect(result.config.tags).toEqual(['a', 'b', 'c'])
    })

    it('should shallow merge objects with shallow strategy', () => {
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, objects: 'shallow' }
      const result = merger.merge(
        { server: { host: 'localhost', port: 3000, nested: { x: 1 } } },
        { server: { port: 8080 } },
        strategy,
      )
      expect(result.config.server).toEqual({ host: 'localhost', port: 8080, nested: { x: 1 } })
    })

    it('should replace objects with replace strategy', () => {
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, objects: 'replace' }
      const result = merger.merge(
        { server: { host: 'localhost', port: 3000 } },
        { server: { port: 8080 } },
        strategy,
      )
      expect(result.config.server).toEqual({ port: 8080 })
    })

    it('should keep existing scalars with keep-existing strategy', () => {
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, scalars: 'keep-existing' }
      const result = merger.merge(
        { name: 'original' },
        { name: 'override' },
        strategy,
      )
      expect(result.config.name).toBe('original')
    })

    it('should add new keys from override', () => {
      const result = merger.merge(
        { a: 1 },
        { b: 2 },
      )
      expect(result.config.b).toBe(2)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should track conflicts', () => {
      const result = merger.merge(
        { a: 1 },
        { a: 2 },
      )
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]!.baseValue).toBe(1)
      expect(result.conflicts[0]!.overrideValue).toBe(2)
      expect(result.conflicts[0]!.resolvedValue).toBe(2)
    })

    it('should handle empty base', () => {
      const result = merger.merge({}, { a: 1, b: 2 })
      expect(result.config).toEqual({ a: 1, b: 2 })
    })

    it('should handle empty override', () => {
      const result = merger.merge({ a: 1, b: 2 }, {})
      expect(result.config).toEqual({ a: 1, b: 2 })
      expect(result.conflicts).toHaveLength(0)
    })

    it('should handle both empty', () => {
      const result = merger.merge({}, {})
      expect(result.config).toEqual({})
      expect(result.conflicts).toHaveLength(0)
      expect(result.applied).toHaveLength(0)
    })
  })

  describe('mergeDeep', () => {
    it('should deeply merge nested objects', () => {
      const result = merger.mergeDeep(
        { a: { b: { c: 1, d: 2 } } },
        { a: { b: { c: 3, e: 4 } } },
      )
      expect(result.a).toEqual({ b: { c: 3, d: 2, e: 4 } })
    })

    it('should override non-object values', () => {
      const result = merger.mergeDeep(
        { a: 1, b: 'hello' },
        { a: 2, b: 'world' },
      )
      expect(result).toEqual({ a: 2, b: 'world' })
    })

    it('should handle mixed types', () => {
      const result = merger.mergeDeep(
        { a: { x: 1 }, b: [1, 2] },
        { a: { y: 2 }, b: [3, 4] },
      )
      expect(result.a).toEqual({ x: 1, y: 2 })
      expect(result.b).toEqual([3, 4])
    })

    it('should handle null override', () => {
      const result = merger.mergeDeep(
        { a: { x: 1 } },
        { a: null },
      )
      expect(result.a).toBeNull()
    })
  })

  describe('resolveConflicts', () => {
    it('should resolve object conflicts with deep merge', () => {
      const conflicts = [{
        path: 'server',
        baseValue: { host: 'localhost', port: 3000 },
        overrideValue: { port: 8080 },
        resolvedValue: {},
        strategy: 'replace',
      }]
      const resolved = merger.resolveConflicts(conflicts, DEFAULT_MERGE_STRATEGY)
      expect(resolved[0]!.resolvedValue).toEqual({
        host: 'localhost',
        port: 8080,
      })
    })

    it('should resolve array conflicts with append', () => {
      const conflicts = [{
        path: 'tags',
        baseValue: ['a', 'b'],
        overrideValue: ['c'],
        resolvedValue: [],
        strategy: 'replace',
      }]
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, arrays: 'append' }
      const resolved = merger.resolveConflicts(conflicts, strategy)
      expect(resolved[0]!.resolvedValue).toEqual(['a', 'b', 'c'])
    })

    it('should resolve scalar conflicts with keep-existing', () => {
      const conflicts = [{
        path: 'name',
        baseValue: 'original',
        overrideValue: 'new',
        resolvedValue: 'new',
        strategy: 'override',
      }]
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, scalars: 'keep-existing' }
      const resolved = merger.resolveConflicts(conflicts, strategy)
      expect(resolved[0]!.resolvedValue).toBe('original')
    })

    it('should resolve with replace strategy', () => {
      const conflicts = [{
        path: 'server',
        baseValue: { a: 1 },
        overrideValue: { b: 2 },
        resolvedValue: {},
        strategy: 'deep-merge',
      }]
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, objects: 'replace' }
      const resolved = merger.resolveConflicts(conflicts, strategy)
      expect(resolved[0]!.resolvedValue).toEqual({ b: 2 })
    })

    it('should resolve with shallow strategy', () => {
      const conflicts = [{
        path: 'obj',
        baseValue: { a: 1, nested: { x: 1 } },
        overrideValue: { b: 2 },
        resolvedValue: {},
        strategy: 'replace',
      }]
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, objects: 'shallow' }
      const resolved = merger.resolveConflicts(conflicts, strategy)
      expect(resolved[0]!.resolvedValue).toEqual({ a: 1, nested: { x: 1 }, b: 2 })
    })

    it('should resolve merge-unique arrays', () => {
      const conflicts = [{
        path: 'tags',
        baseValue: ['a', 'b'],
        overrideValue: ['b', 'c'],
        resolvedValue: [],
        strategy: 'replace',
      }]
      const strategy: MergeStrategy = { ...DEFAULT_MERGE_STRATEGY, arrays: 'merge' }
      const resolved = merger.resolveConflicts(conflicts, strategy)
      expect(resolved[0]!.resolvedValue).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty conflicts', () => {
      const resolved = merger.resolveConflicts([], DEFAULT_MERGE_STRATEGY)
      expect(resolved).toEqual([])
    })
  })

  describe('getDiff', () => {
    it('should detect added keys', () => {
      const diff = merger.getDiff({ a: 1 }, { a: 1, b: 2 })
      expect(diff.added).toEqual(['b'])
      expect(diff.removed).toEqual([])
      expect(diff.changed).toEqual([])
    })

    it('should detect removed keys', () => {
      const diff = merger.getDiff({ a: 1, b: 2 }, { a: 1 })
      expect(diff.removed).toEqual(['b'])
      expect(diff.added).toEqual([])
    })

    it('should detect changed keys', () => {
      const diff = merger.getDiff({ a: 1, b: 2 }, { a: 1, b: 3 })
      expect(diff.changed).toEqual(['b'])
    })

    it('should detect all three types at once', () => {
      const diff = merger.getDiff(
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 5, d: 4 },
      )
      expect(diff.added).toEqual(['d'])
      expect(diff.removed).toEqual(['c'])
      expect(diff.changed).toEqual(['b'])
    })

    it('should return empty for identical objects', () => {
      const diff = merger.getDiff({ a: 1 }, { a: 1 })
      expect(diff.added).toEqual([])
      expect(diff.removed).toEqual([])
      expect(diff.changed).toEqual([])
    })

    it('should handle empty base', () => {
      const diff = merger.getDiff({}, { a: 1 })
      expect(diff.added).toEqual(['a'])
    })

    it('should handle empty override', () => {
      const diff = merger.getDiff({ a: 1 }, {})
      expect(diff.removed).toEqual(['a'])
    })
  })

  describe('flatten', () => {
    it('should flatten a flat object', () => {
      const result = merger.flatten({ a: 1, b: 'hello' })
      expect(result.get('a')).toBe(1)
      expect(result.get('b')).toBe('hello')
      expect(result.size).toBe(2)
    })

    it('should flatten nested objects', () => {
      const result = merger.flatten({
        server: { host: 'localhost', port: 3000 },
      })
      expect(result.get('server.host')).toBe('localhost')
      expect(result.get('server.port')).toBe(3000)
      expect(result.size).toBe(2)
    })

    it('should flatten deeply nested objects', () => {
      const result = merger.flatten({
        a: { b: { c: { d: 1 } } },
      })
      expect(result.get('a.b.c.d')).toBe(1)
    })

    it('should use custom prefix', () => {
      const result = merger.flatten({ a: 1 }, 'root')
      expect(result.get('root.a')).toBe(1)
    })

    it('should handle arrays as leaf values', () => {
      const result = merger.flatten({ tags: ['a', 'b'] })
      expect(result.get('tags')).toEqual(['a', 'b'])
    })

    it('should handle mixed nesting', () => {
      const result = merger.flatten({
        name: 'test',
        server: { host: 'localhost' },
      })
      expect(result.size).toBe(2)
      expect(result.get('name')).toBe('test')
      expect(result.get('server.host')).toBe('localhost')
    })

    it('should handle empty object', () => {
      const result = merger.flatten({})
      expect(result.size).toBe(0)
    })
  })
})

describe('DEFAULT_MERGE_STRATEGY', () => {
  it('should have correct defaults', () => {
    expect(DEFAULT_MERGE_STRATEGY.arrays).toBe('replace')
    expect(DEFAULT_MERGE_STRATEGY.objects).toBe('deep')
    expect(DEFAULT_MERGE_STRATEGY.scalars).toBe('override')
  })
})

describe('Edge cases', () => {
  const validator = new SchemaValidator()
  const ruleValidator = new RuleValidator()
  const merger = new ConfigMerger()

  it('should handle schema with no properties', () => {
    const schema: ConfigSchema = {
      type: 'object',
      properties: {},
      required: [],
    }
    const result = validator.validate({ extra: true }, schema)
    expect(result.valid).toBe(true)
  })

  it('should handle multiple validation errors at once', () => {
    const result = validator.validate(
      { port: 'not-number', debug: 'not-bool', logLevel: 'invalid' },
      simpleSchema,
    )
    expect(result.valid).toBe(false)
    expect(result.errors).toBeGreaterThanOrEqual(3)
  })

  it('should validate rules with valid enum option in object config', () => {
    const result = ruleValidator.validateRules({
      'no-unused-vars': { severity: 'warning', vars: 'local', args: 'none' },
    })
    expect(result.valid).toBe(true)
  })

  it('should reject invalid enum option in object config', () => {
    const result = ruleValidator.validateRules({
      'no-unused-vars': { severity: 'warning', vars: 'invalid-value' },
    })
    expect(result.valid).toBe(false)
  })

  it('should handle merge with boolean values', () => {
    const result = merger.merge(
      { debug: false },
      { debug: true },
    )
    expect(result.config.debug).toBe(true)
  })

  it('should handle merge with null values', () => {
    const result = merger.merge(
      { name: 'test' },
      { name: null },
    )
    expect(result.config.name).toBeNull()
  })

  it('should handle coerce with empty string', () => {
    expect(validator.coerce('', 'number')).toBe(0)
  })

  it('should handle flatten with null values', () => {
    const result = merger.flatten({ name: null })
    expect(result.get('name')).toBeNull()
  })

  it('should handle type mismatch in array config options', () => {
    const result = ruleValidator.validateRules({
      'max-params': ['error', { max: 'not-a-number' }],
    })
    expect(result.valid).toBe(false)
  })

  it('should track conflict strategy correctly', () => {
    const result = merger.merge(
      { x: 1 },
      { x: 2 },
    )
    expect(result.conflicts[0]!.strategy).toBe('override')
  })

  it('should handle multiple required fields missing', () => {
    const multiReqSchema: ConfigSchema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { type: 'string' },
      },
      required: ['a', 'b', 'c'],
    }
    const result = validator.validate({}, multiReqSchema)
    expect(result.errors).toBe(3)
  })
})
