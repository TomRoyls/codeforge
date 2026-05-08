import { describe, it, expect } from 'vitest'
import { TypeParser } from '../../src/core/schema-gen/type-parser.js'
import { SchemaBuilder } from '../../src/core/schema-gen/schema-builder.js'
import { SchemaGenerator } from '../../src/core/schema-gen/schema-generator.js'
import type { TypeInfo, JSONSchema, SchemaGenConfig } from '../../src/core/schema-gen/types.js'
import { DEFAULT_SCHEMA_GEN_CONFIG } from '../../src/core/schema-gen/types.js'

const defaultConfig: SchemaGenConfig = { ...DEFAULT_SCHEMA_GEN_CONFIG }

describe('TypeParser', () => {
  const parser = new TypeParser()

  describe('parseType', () => {
    it('should parse string primitive', () => {
      const result = parser.parseType('string')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('string')
      expect(result.nullable).toBe(false)
    })

    it('should parse number primitive', () => {
      const result = parser.parseType('number')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('number')
    })

    it('should parse boolean primitive', () => {
      const result = parser.parseType('boolean')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('boolean')
    })

    it('should parse null primitive', () => {
      const result = parser.parseType('null')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('null')
    })

    it('should parse any type', () => {
      const result = parser.parseType('any')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('any')
    })

    it('should parse unknown type', () => {
      const result = parser.parseType('unknown')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('unknown')
    })

    it('should parse void type', () => {
      const result = parser.parseType('void')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('void')
    })

    it('should parse never type', () => {
      const result = parser.parseType('never')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('never')
    })

    it('should parse bigint type', () => {
      const result = parser.parseType('bigint')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('bigint')
    })

    it('should parse undefined primitive', () => {
      const result = parser.parseType('undefined')
      expect(result.kind).toBe('primitive')
      expect(result.name).toBe('undefined')
    })

    it('should parse array type with shorthand syntax', () => {
      const result = parser.parseType('string[]')
      expect(result.kind).toBe('array')
      expect(result.items?.name).toBe('string')
    })

    it('should parse nested array type', () => {
      const result = parser.parseType('number[][]')
      expect(result.kind).toBe('array')
      expect(result.items?.kind).toBe('array')
      expect(result.items?.items?.name).toBe('number')
    })

    it('should parse Array<T> generic syntax', () => {
      const result = parser.parseType('Array<string>')
      expect(result.kind).toBe('array')
      expect(result.items?.name).toBe('string')
    })

    it('should parse Array<T> with complex type', () => {
      const result = parser.parseType('Array<{ name: string }>')
      expect(result.kind).toBe('array')
      expect(result.items?.kind).toBe('object')
    })

    it('should parse object type literal', () => {
      const result = parser.parseType('{ name: string; age: number }')
      expect(result.kind).toBe('object')
      expect(result.properties?.has('name')).toBe(true)
      expect(result.properties?.has('age')).toBe(true)
    })

    it('should parse empty object type', () => {
      const result = parser.parseType('{}')
      expect(result.kind).toBe('object')
      expect(result.properties?.size).toBe(0)
    })

    it('should parse object with optional property', () => {
      const result = parser.parseType('{ name: string; age?: number }')
      const ageProp = result.properties?.get('age')
      expect(ageProp?.required).toBe(false)
      expect(ageProp?.type.optional).toBe(false)
    })

    it('should parse object with readonly property', () => {
      const result = parser.parseType('{ readonly name: string }')
      expect(result.properties?.has('name')).toBe(true)
    })

    it('should parse union type', () => {
      const result = parser.parseType('string | number')
      expect(result.kind).toBe('union')
      expect(result.types?.length).toBe(2)
    })

    it('should parse nullable union', () => {
      const result = parser.parseType('string | null')
      expect(result.nullable).toBe(true)
    })

    it('should parse intersection type', () => {
      const result = parser.parseType('{ name: string } & { age: number }')
      expect(result.kind).toBe('intersection')
      expect(result.types?.length).toBe(2)
    })

    it('should parse tuple type', () => {
      const result = parser.parseType('[string, number]')
      expect(result.kind).toBe('tuple')
      expect(result.types?.length).toBe(2)
    })

    it('should parse Record type', () => {
      const result = parser.parseType('Record<string, number>')
      expect(result.kind).toBe('record')
      expect(result.keyType?.name).toBe('string')
      expect(result.valueType?.name).toBe('number')
    })

    it('should parse reference type', () => {
      const result = parser.parseType('MyCustomType')
      expect(result.kind).toBe('ref')
      expect(result.name).toBe('MyCustomType')
    })

    it('should parse string literal type', () => {
      const result = parser.parseType("'hello'")
      expect(result.kind).toBe('literal')
      expect(result.literalValue).toBe('hello')
    })

    it('should parse numeric literal type', () => {
      const result = parser.parseType('42')
      expect(result.kind).toBe('literal')
      expect(result.literalValue).toBe(42)
    })

    it('should parse boolean literal types', () => {
      const t = parser.parseType('true')
      expect(t.kind).toBe('literal')
      expect(t.literalValue).toBe(true)
      const f = parser.parseType('false')
      expect(f.kind).toBe('literal')
      expect(f.literalValue).toBe(false)
    })

    it('should handle whitespace trimming', () => {
      const result = parser.parseType('  string  ')
      expect(result.name).toBe('string')
    })
  })

  describe('parsePrimitive', () => {
    it('should return TypeInfo for primitives', () => {
      const result = parser.parsePrimitive('string')
      expect(result).not.toBeNull()
      expect(result!.kind).toBe('primitive')
    })

    it('should return null for non-primitives', () => {
      const result = parser.parsePrimitive('MyType')
      expect(result).toBeNull()
    })

    it('should return null for arrays', () => {
      const result = parser.parsePrimitive('string[]')
      expect(result).toBeNull()
    })
  })

  describe('parseArray', () => {
    it('should parse shorthand array syntax', () => {
      const result = parser.parseArray('number[]')
      expect(result).not.toBeNull()
      expect(result!.kind).toBe('array')
      expect(result!.items?.name).toBe('number')
    })

    it('should parse generic array syntax', () => {
      const result = parser.parseArray('Array<boolean>')
      expect(result).not.toBeNull()
      expect(result!.items?.name).toBe('boolean')
    })

    it('should return null for non-arrays', () => {
      const result = parser.parseArray('string')
      expect(result).toBeNull()
    })

    it('should return null for empty brackets', () => {
      const result = parser.parseArray('[]')
      expect(result).toBeNull()
    })
  })

  describe('parseObject', () => {
    it('should parse properties from object literal', () => {
      const result = parser.parseObject('{ name: string; age: number }')
      expect(result.size).toBe(2)
      expect(result.get('name')?.type.name).toBe('string')
      expect(result.get('age')?.type.name).toBe('number')
    })

    it('should return empty map for empty object', () => {
      const result = parser.parseObject('{}')
      expect(result.size).toBe(0)
    })

    it('should parse object with complex property types', () => {
      const result = parser.parseObject('{ items: string[] }')
      expect(result.get('items')?.type.kind).toBe('array')
    })
  })

  describe('parseUnion', () => {
    it('should create union TypeInfo from string array', () => {
      const result = parser.parseUnion(['string', 'number'])
      expect(result.kind).toBe('union')
      expect(result.types?.length).toBe(2)
    })

    it('should mark nullable when null is included', () => {
      const result = parser.parseUnion(['string', 'null'])
      expect(result.nullable).toBe(true)
    })
  })

  describe('parseEnum', () => {
    it('should parse string enum values', () => {
      const result = parser.parseEnum(["'active'", "'inactive'", "'pending'"])
      expect(result.kind).toBe('enum')
      expect(result.enumValues).toEqual(['active', 'inactive', 'pending'])
    })

    it('should parse mixed enum values', () => {
      const result = parser.parseEnum(["'active'", '42', 'true'])
      expect(result.enumValues).toEqual(['active', 42, true])
    })
  })

  describe('parseTuple', () => {
    it('should parse tuple from type strings', () => {
      const result = parser.parseTuple(['string', 'number', 'boolean'])
      expect(result.kind).toBe('tuple')
      expect(result.types?.length).toBe(3)
    })
  })

  describe('isPrimitive', () => {
    it('should return true for primitives', () => {
      expect(parser.isPrimitive('string')).toBe(true)
      expect(parser.isPrimitive('number')).toBe(true)
      expect(parser.isPrimitive('boolean')).toBe(true)
      expect(parser.isPrimitive('null')).toBe(true)
      expect(parser.isPrimitive('undefined')).toBe(true)
      expect(parser.isPrimitive('any')).toBe(true)
      expect(parser.isPrimitive('unknown')).toBe(true)
      expect(parser.isPrimitive('void')).toBe(true)
      expect(parser.isPrimitive('never')).toBe(true)
      expect(parser.isPrimitive('bigint')).toBe(true)
      expect(parser.isPrimitive('symbol')).toBe(true)
      expect(parser.isPrimitive('object')).toBe(true)
    })

    it('should return false for non-primitives', () => {
      expect(parser.isPrimitive('MyType')).toBe(false)
      expect(parser.isPrimitive('string[]')).toBe(false)
      expect(parser.isPrimitive('Array<string>')).toBe(false)
    })
  })

  describe('isNullable', () => {
    it('should return true for nullable types', () => {
      expect(parser.isNullable('string | null')).toBe(true)
      expect(parser.isNullable('number | undefined')).toBe(true)
    })

    it('should return false for non-nullable types', () => {
      expect(parser.isNullable('string')).toBe(false)
      expect(parser.isNullable('string | number')).toBe(false)
    })
  })
})

describe('SchemaBuilder', () => {
  const builder = new SchemaBuilder()

  describe('buildPrimitiveSchema', () => {
    it('should build schema for string', () => {
      const typeInfo: TypeInfo = { name: 'string', kind: 'primitive', nullable: false, optional: false }
      const schema = builder.buildPrimitiveSchema(typeInfo)
      expect(schema.type).toBe('string')
    })

    it('should build schema for number', () => {
      const typeInfo: TypeInfo = { name: 'number', kind: 'primitive', nullable: false, optional: false }
      const schema = builder.buildPrimitiveSchema(typeInfo)
      expect(schema.type).toBe('number')
    })

    it('should build schema for boolean', () => {
      const typeInfo: TypeInfo = { name: 'boolean', kind: 'primitive', nullable: false, optional: false }
      const schema = builder.buildPrimitiveSchema(typeInfo)
      expect(schema.type).toBe('boolean')
    })

    it('should build schema for null', () => {
      const typeInfo: TypeInfo = { name: 'null', kind: 'primitive', nullable: false, optional: false }
      const schema = builder.buildPrimitiveSchema(typeInfo)
      expect(schema.type).toBe('null')
    })

    it('should return empty for any', () => {
      const typeInfo: TypeInfo = { name: 'any', kind: 'primitive', nullable: false, optional: false }
      const schema = builder.buildPrimitiveSchema(typeInfo)
      expect(schema.type).toBeUndefined()
    })
  })

  describe('buildArraySchema', () => {
    it('should build array schema with items', () => {
      const typeInfo: TypeInfo = {
        name: 'string[]',
        kind: 'array',
        items: { name: 'string', kind: 'primitive', nullable: false, optional: false },
        nullable: false,
        optional: false,
      }
      const schema = builder.buildArraySchema(typeInfo, defaultConfig)
      expect(schema.type).toBe('array')
      expect(schema.items?.type).toBe('string')
    })

    it('should build array schema without items', () => {
      const typeInfo: TypeInfo = { name: 'unknown[]', kind: 'array', nullable: false, optional: false }
      const schema = builder.buildArraySchema(typeInfo, defaultConfig)
      expect(schema.type).toBe('array')
      expect(schema.items).toBeUndefined()
    })
  })

  describe('buildObjectSchema', () => {
    it('should build object schema with properties', () => {
      const properties = new Map<string, { name: string; type: TypeInfo; required: boolean }>()
      properties.set('name', {
        name: 'name',
        type: { name: 'string', kind: 'primitive', nullable: false, optional: false },
        required: true,
      })
      properties.set('age', {
        name: 'age',
        type: { name: 'number', kind: 'primitive', nullable: false, optional: false },
        required: true,
      })
      const typeInfo: TypeInfo = {
        name: 'object',
        kind: 'object',
        properties,
        nullable: false,
        optional: false,
      }
      const schema = builder.buildObjectSchema(typeInfo, defaultConfig)
      expect(schema.type).toBe('object')
      expect(schema.properties?.name.type).toBe('string')
      expect(schema.properties?.age.type).toBe('number')
      expect(schema.required).toEqual(['name', 'age'])
    })

    it('should build empty object schema', () => {
      const typeInfo: TypeInfo = {
        name: 'object',
        kind: 'object',
        properties: new Map(),
        nullable: false,
        optional: false,
      }
      const schema = builder.buildObjectSchema(typeInfo, defaultConfig)
      expect(schema.type).toBe('object')
      expect(schema.properties).toBeUndefined()
    })

    it('should respect strictRequired config', () => {
      const properties = new Map<string, { name: string; type: TypeInfo; required: boolean }>()
      properties.set('opt', {
        name: 'opt',
        type: { name: 'string', kind: 'primitive', nullable: false, optional: false },
        required: false,
      })
      const typeInfo: TypeInfo = {
        name: 'object',
        kind: 'object',
        properties,
        nullable: false,
        optional: false,
      }
      const schema = builder.buildObjectSchema(typeInfo, { ...defaultConfig, strictRequired: true })
      expect(schema.required).toEqual([])
    })
  })

  describe('buildUnionSchema', () => {
    it('should build anyOf for union types', () => {
      const typeInfo: TypeInfo = {
        name: 'string | number',
        kind: 'union',
        types: [
          { name: 'string', kind: 'primitive', nullable: false, optional: false },
          { name: 'number', kind: 'primitive', nullable: false, optional: false },
        ],
        nullable: false,
        optional: false,
      }
      const schema = builder.buildUnionSchema(typeInfo, defaultConfig)
      expect(schema.anyOf).toBeDefined()
      expect(schema.anyOf!.length).toBe(2)
    })

    it('should build enum for all-literal union', () => {
      const typeInfo: TypeInfo = {
        name: "'a' | 'b'",
        kind: 'union',
        types: [
          { name: "'a'", kind: 'literal', nullable: false, optional: false, literalValue: 'a' },
          { name: "'b'", kind: 'literal', nullable: false, optional: false, literalValue: 'b' },
        ],
        nullable: false,
        optional: false,
      }
      const schema = builder.buildUnionSchema(typeInfo, defaultConfig)
      expect(schema.enum).toEqual(['a', 'b'])
    })

    it('should return single schema for single type union', () => {
      const typeInfo: TypeInfo = {
        name: 'string',
        kind: 'union',
        types: [{ name: 'string', kind: 'primitive', nullable: false, optional: false }],
        nullable: false,
        optional: false,
      }
      const schema = builder.buildUnionSchema(typeInfo, defaultConfig)
      expect(schema.type).toBe('string')
    })
  })

  describe('buildEnumSchema', () => {
    it('should build enum schema', () => {
      const typeInfo: TypeInfo = {
        name: 'Status',
        kind: 'enum',
        enumValues: ['active', 'inactive'],
        nullable: false,
        optional: false,
      }
      const schema = builder.buildEnumSchema(typeInfo)
      expect(schema.enum).toEqual(['active', 'inactive'])
    })

    it('should return empty for empty enum', () => {
      const typeInfo: TypeInfo = {
        name: 'Empty',
        kind: 'enum',
        enumValues: [],
        nullable: false,
        optional: false,
      }
      const schema = builder.buildEnumSchema(typeInfo)
      expect(Object.keys(schema)).toHaveLength(0)
    })
  })

  describe('buildTupleSchema', () => {
    it('should build tuple schema with prefixItems', () => {
      const typeInfo: TypeInfo = {
        name: '[string, number]',
        kind: 'tuple',
        types: [
          { name: 'string', kind: 'primitive', nullable: false, optional: false },
          { name: 'number', kind: 'primitive', nullable: false, optional: false },
        ],
        nullable: false,
        optional: false,
      }
      const schema = builder.buildTupleSchema(typeInfo, defaultConfig)
      expect(schema.type).toBe('array')
      expect(schema.prefixItems?.length).toBe(2)
      expect(schema.minItems).toBe(2)
      expect(schema.maxItems).toBe(2)
    })

    it('should handle empty tuple', () => {
      const typeInfo: TypeInfo = {
        name: '[]',
        kind: 'tuple',
        types: [],
        nullable: false,
        optional: false,
      }
      const schema = builder.buildTupleSchema(typeInfo, defaultConfig)
      expect(schema.type).toBe('array')
      expect(schema.prefixItems).toBeUndefined()
    })
  })

  describe('buildRecordSchema', () => {
    it('should build record schema with additionalProperties', () => {
      const keyType: TypeInfo = { name: 'string', kind: 'primitive', nullable: false, optional: false }
      const valueType: TypeInfo = { name: 'number', kind: 'primitive', nullable: false, optional: false }
      const schema = builder.buildRecordSchema(keyType, valueType, defaultConfig)
      expect(schema.type).toBe('object')
      expect(schema.additionalProperties).toEqual({ type: 'number' })
      expect(schema.propertyNames).toEqual({ type: 'string' })
    })
  })

  describe('buildSchema with nullable', () => {
    it('should wrap nullable types with anyOf', () => {
      const typeInfo: TypeInfo = {
        name: 'string',
        kind: 'primitive',
        nullable: true,
        optional: false,
      }
      const schema = builder.buildSchema(typeInfo, defaultConfig)
      expect(schema.anyOf).toBeDefined()
      expect(schema.anyOf!.length).toBe(2)
    })
  })
})

describe('SchemaGenerator', () => {
  const generator = new SchemaGenerator()

  describe('generateFromSource', () => {
    it('should generate schema from type alias', () => {
      const source = "export type Status = 'active' | 'inactive';"
      const schema = generator.generateFromSource(source, 'Status')
      expect(schema.title).toBe('Status')
      expect(schema.$schema).toContain('draft-07')
      expect(schema.enum).toEqual(['active', 'inactive'])
    })

    it('should generate schema from interface', () => {
      const source = 'export interface User { name: string; age: number }'
      const schema = generator.generateFromSource(source, 'User')
      expect(schema.title).toBe('User')
      expect(schema.type).toBe('object')
      expect(schema.properties?.name.type).toBe('string')
      expect(schema.properties?.age.type).toBe('number')
    })

    it('should generate schema for complex types', () => {
      const source = 'export type Names = string[];'
      const schema = generator.generateFromSource(source, 'Names')
      expect(schema.type).toBe('array')
      expect(schema.items?.type).toBe('string')
    })

    it('should return empty root schema for unknown type', () => {
      const source = 'export type Foo = string;'
      const schema = generator.generateFromSource(source, 'Bar')
      expect(schema.title).toBe('Bar')
    })

    it('should support draft-2020-12', () => {
      const source = 'export type Name = string;'
      const schema = generator.generateFromSource(source, 'Name', { schemaVersion: 'draft-2020-12' })
      expect(schema.$schema).toContain('2020-12')
    })

    it('should parse enum from source', () => {
      const source = 'export enum Direction { Up, Down, Left, Right }'
      const schema = generator.generateFromSource(source, 'Direction')
      expect(schema.enum).toBeDefined()
      expect(schema.enum!.length).toBe(4)
    })
  })

  describe('generateAll', () => {
    it('should generate schemas for all types in source', () => {
      const source = `
export type Name = string;
export type Age = number;
export interface Person { name: string; age: number }
      `
      const schemas = generator.generateAll(source)
      expect(schemas.size).toBe(3)
      expect(schemas.has('Name')).toBe(true)
      expect(schemas.has('Age')).toBe(true)
      expect(schemas.has('Person')).toBe(true)
    })

    it('should return empty map for empty source', () => {
      const schemas = generator.generateAll('')
      expect(schemas.size).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should serialize schema to JSON string', () => {
      const schema: JSONSchema = { type: 'string' }
      const json = generator.toJSON(schema)
      expect(json).toBe('{"type":"string"}')
    })

    it('should serialize with pretty printing', () => {
      const schema: JSONSchema = { type: 'string' }
      const json = generator.toJSON(schema, true)
      expect(json).toContain('\n')
      expect(json).toContain('  ')
    })
  })

  describe('validateSchema', () => {
    it('should return no errors for valid schema', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      }
      const errors = generator.validateSchema(schema)
      expect(errors).toEqual([])
    })

    it('should detect both anyOf and oneOf', () => {
      const schema: JSONSchema = {
        anyOf: [{ type: 'string' }],
        oneOf: [{ type: 'number' }],
      }
      const errors = generator.validateSchema(schema)
      expect(errors).toContain('Schema cannot have both anyOf and oneOf')
    })

    it('should detect array without items', () => {
      const schema: JSONSchema = { type: 'array' }
      const errors = generator.validateSchema(schema)
      expect(errors.some((e) => e.includes('items'))).toBe(true)
    })

    it('should detect required property not in properties', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name', 'age'],
      }
      const errors = generator.validateSchema(schema)
      expect(errors.some((e) => e.includes('age'))).toBe(true)
    })

    it('should detect duplicate enum values', () => {
      const schema: JSONSchema = { enum: ['a', 'b', 'a'] }
      const errors = generator.validateSchema(schema)
      expect(errors.some((e) => e.includes('Duplicate'))).toBe(true)
    })

    it('should detect minItems > maxItems', () => {
      const schema: JSONSchema = { type: 'array', minItems: 10, maxItems: 5 }
      const errors = generator.validateSchema(schema)
      expect(errors.some((e) => e.includes('minItems'))).toBe(true)
    })
  })

  describe('mergeSchemas', () => {
    it('should merge properties', () => {
      const base: JSONSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      }
      const override: JSONSchema = {
        properties: { age: { type: 'number' } },
      }
      const merged = generator.mergeSchemas(base, override)
      expect(merged.properties?.name).toBeDefined()
      expect(merged.properties?.age).toBeDefined()
    })

    it('should merge required arrays with dedup', () => {
      const base: JSONSchema = { required: ['name'] }
      const override: JSONSchema = { required: ['name', 'age'] }
      const merged = generator.mergeSchemas(base, override)
      expect(merged.required).toEqual(['name', 'age'])
    })

    it('should override scalar values', () => {
      const base: JSONSchema = { type: 'string' }
      const override: JSONSchema = { type: 'number' }
      const merged = generator.mergeSchemas(base, override)
      expect(merged.type).toBe('number')
    })

    it('should override with anyOf/allOf arrays', () => {
      const base: JSONSchema = { anyOf: [{ type: 'string' }] }
      const override: JSONSchema = { anyOf: [{ type: 'number' }] }
      const merged = generator.mergeSchemas(base, override)
      expect(merged.anyOf).toEqual([{ type: 'number' }])
    })
  })

  describe('getSchemaType', () => {
    it('should return type for typed schema', () => {
      expect(generator.getSchemaType({ type: 'string' })).toBe('string')
      expect(generator.getSchemaType({ type: 'number' })).toBe('number')
      expect(generator.getSchemaType({ type: 'object' })).toBe('object')
      expect(generator.getSchemaType({ type: 'array' })).toBe('array')
    })

    it('should return ref for $ref schema', () => {
      expect(generator.getSchemaType({ $ref: '#/definitions/Foo' })).toBe('ref')
    })

    it('should return enum for enum schema', () => {
      expect(generator.getSchemaType({ enum: ['a', 'b'] })).toBe('enum')
    })

    it('should return union for anyOf schema', () => {
      expect(generator.getSchemaType({ anyOf: [{ type: 'string' }] })).toBe('union')
    })

    it('should return intersection for allOf schema', () => {
      expect(generator.getSchemaType({ allOf: [{ type: 'object' }] })).toBe('intersection')
    })

    it('should return literal for const schema', () => {
      expect(generator.getSchemaType({ const: 'hello' })).toBe('literal')
    })

    it('should return unknown for empty schema', () => {
      expect(generator.getSchemaType({})).toBe('unknown')
    })

    it('should return oneOf for oneOf schema', () => {
      expect(generator.getSchemaType({ oneOf: [{ type: 'string' }] })).toBe('oneOf')
    })
  })
})

describe('Default config', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_SCHEMA_GEN_CONFIG.includeDescriptions).toBe(true)
    expect(DEFAULT_SCHEMA_GEN_CONFIG.includeDefaults).toBe(true)
    expect(DEFAULT_SCHEMA_GEN_CONFIG.strictRequired).toBe(true)
    expect(DEFAULT_SCHEMA_GEN_CONFIG.schemaVersion).toBe('draft-07')
  })
})

describe('Integration', () => {
  const generator = new SchemaGenerator()

  it('should generate full schema for complex interface', () => {
    const source = `
export interface Config {
  host: string;
  port: number;
  debug?: boolean;
  tags: string[];
}
    `
    const schema = generator.generateFromSource(source, 'Config')
    expect(schema.title).toBe('Config')
    expect(schema.type).toBe('object')
    expect(schema.properties?.host.type).toBe('string')
    expect(schema.properties?.port.type).toBe('number')
    expect(schema.properties?.debug.type).toBe('boolean')
    expect(schema.properties?.tags.type).toBe('array')
    expect(schema.properties?.tags.items?.type).toBe('string')
    expect(schema.required).toContain('host')
    expect(schema.required).toContain('port')
    expect(schema.required).toContain('tags')
    expect(schema.required).not.toContain('debug')
  })

  it('should generate schema for union type alias', () => {
    const source = "export type Result = 'success' | 'error' | 'pending';"
    const schema = generator.generateFromSource(source, 'Result')
    expect(schema.enum).toEqual(['success', 'error', 'pending'])
  })

  it('should generate schema for Record type alias', () => {
    const source = 'export type StringMap = Record<string, string>;'
    const schema = generator.generateFromSource(source, 'StringMap')
    expect(schema.type).toBe('object')
    expect(schema.additionalProperties).toEqual({ type: 'string' })
  })

  it('should generate schema for nested objects', () => {
    const source = `
export interface Address { street: string; city: string }
export interface User { name: string; address: Address }
    `
    const schemas = generator.generateAll(source)
    const userSchema = schemas.get('User')
    expect(userSchema?.properties?.address).toBeDefined()
  })

  it('should handle intersection types', () => {
    const source = "export type Combined = { name: string } & { age: number };"
    const schema = generator.generateFromSource(source, 'Combined')
    expect(schema.allOf).toBeDefined()
    expect(schema.allOf!.length).toBe(2)
  })

  it('should generate schema for tuple type alias', () => {
    const source = 'export type Pair = [string, number];'
    const schema = generator.generateFromSource(source, 'Pair')
    expect(schema.type).toBe('array')
    expect(schema.prefixItems?.length).toBe(2)
    expect(schema.minItems).toBe(2)
    expect(schema.maxItems).toBe(2)
  })

  it('should handle complex union with null', () => {
    const source = 'export type MaybeString = string | null;'
    const schema = generator.generateFromSource(source, 'MaybeString')
    expect(schema.anyOf).toBeDefined()
  })

  it('should produce valid JSON output', () => {
    const source = 'export type Simple = string;'
    const schema = generator.generateFromSource(source, 'Simple')
    const json = generator.toJSON(schema, true)
    const parsed = JSON.parse(json)
    expect(parsed.title).toBe('Simple')
    expect(parsed.type).toBe('string')
  })

  it('should validate generated schema', () => {
    const source = `
export interface Valid {
  name: string;
  count: number;
}
    `
    const schema = generator.generateFromSource(source, 'Valid')
    const errors = generator.validateSchema(schema)
    expect(errors).toEqual([])
  })

  it('should generate from source with object type containing nested array', () => {
    const source = `
export interface Container {
  items: { id: number; label: string }[];
}
    `
    const schema = generator.generateFromSource(source, 'Container')
    expect(schema.properties?.items.type).toBe('array')
    expect(schema.properties?.items.items?.type).toBe('object')
  })

  it('should handle multiple type aliases', () => {
    const source = `
export type ID = string;
export type Timestamp = number;
export type Metadata = Record<string, string>;
    `
    const schemas = generator.generateAll(source)
    expect(schemas.get('ID')?.type).toBe('string')
    expect(schemas.get('Timestamp')?.type).toBe('number')
    expect(schemas.get('Metadata')?.additionalProperties).toEqual({ type: 'string' })
  })
})
