import type { TypeInfo, JSONSchema, SchemaGenConfig } from './types.js'

const PRIMITIVE_TYPE_MAP: Record<string, string | undefined> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  null: 'null',
  undefined: 'null',
  bigint: 'integer',
  any: undefined,
  unknown: undefined,
  void: 'null',
  never: undefined,
  symbol: 'string',
  object: 'object',
}

export class SchemaBuilder {
  buildSchema(typeInfo: TypeInfo, config: SchemaGenConfig): JSONSchema {
    let schema: JSONSchema
    switch (typeInfo.kind) {
      case 'primitive':
        schema = this.buildPrimitiveSchema(typeInfo)
        break
      case 'array':
        schema = this.buildArraySchema(typeInfo, config)
        break
      case 'object':
        schema = this.buildObjectSchema(typeInfo, config)
        break
      case 'union':
        schema = this.buildUnionSchema(typeInfo, config)
        break
      case 'intersection':
        schema = this.buildIntersectionSchema(typeInfo, config)
        break
      case 'enum':
        schema = this.buildEnumSchema(typeInfo)
        break
      case 'literal':
        schema = this.buildLiteralSchema(typeInfo)
        break
      case 'tuple':
        schema = this.buildTupleSchema(typeInfo, config)
        break
      case 'record':
        schema = this.buildRecordSchema(
          typeInfo.keyType ?? { name: 'string', kind: 'primitive', nullable: false, optional: false },
          typeInfo.valueType ?? { name: 'unknown', kind: 'primitive', nullable: false, optional: false },
          config,
        )
        break
      case 'ref':
        schema = this.buildRefSchema(typeInfo)
        break
      default:
        schema = {}
    }
    if (typeInfo.nullable) {
      schema = this.wrapNullable(schema)
    }
    if (config.includeDescriptions && typeInfo.description) {
      schema.description = typeInfo.description
    }
    if (config.includeDefaults && typeInfo.defaultValue !== undefined) {
      schema.default = typeInfo.defaultValue
    }
    return schema
  }

  buildPrimitiveSchema(type: TypeInfo): JSONSchema {
    const jsonType = PRIMITIVE_TYPE_MAP[type.name]
    if (jsonType === undefined) return {}
    const schema: JSONSchema = {}
    if (type.name === 'null') {
      schema.type = 'null'
    } else {
      schema.type = jsonType
    }
    return schema
  }

  buildArraySchema(type: TypeInfo, config: SchemaGenConfig): JSONSchema {
    const schema: JSONSchema = {
      type: 'array',
    }
    if (type.items) {
      schema.items = this.buildSchema(type.items, config)
    }
    return schema
  }

  buildObjectSchema(type: TypeInfo, config: SchemaGenConfig): JSONSchema {
    const schema: JSONSchema = {
      type: 'object',
    }
    if (type.properties && type.properties.size > 0) {
      const properties: Record<string, JSONSchema> = {}
      const required: string[] = []
      for (const [name, prop] of type.properties) {
        properties[name] = this.buildSchema(prop.type, config)
        if (config.includeDescriptions && prop.description) {
          properties[name]!.description = prop.description
        }
        if (config.includeDefaults && prop.defaultValue !== undefined) {
          properties[name]!.default = prop.defaultValue
        }
        if (prop.required) {
          required.push(name)
        }
      }
      schema.properties = properties
      if (required.length > 0) {
        schema.required = required
      } else if (config.strictRequired) {
        schema.required = []
      }
    }
    return schema
  }

  buildUnionSchema(type: TypeInfo, config: SchemaGenConfig): JSONSchema {
    if (!type.types || type.types.length === 0) return {}
    if (type.types.length === 1) {
      return this.buildSchema(type.types[0]!, config)
    }
    const allLiterals = type.types.every((t) => t.kind === 'literal')
    if (allLiterals) {
      const values: (string | number | boolean)[] = []
      for (const t of type.types) {
        if (t.literalValue !== undefined && t.literalValue !== null) {
          values.push(t.literalValue)
        }
      }
      return { enum: values }
    }
    const schemas = type.types.map((t) => this.buildSchema(t, config))
    return { anyOf: schemas }
  }

  buildIntersectionSchema(type: TypeInfo, config: SchemaGenConfig): JSONSchema {
    if (!type.types || type.types.length === 0) return {}
    if (type.types.length === 1) {
      return this.buildSchema(type.types[0]!, config)
    }
    const schemas = type.types.map((t) => this.buildSchema(t, config))
    return { allOf: schemas }
  }

  buildEnumSchema(type: TypeInfo): JSONSchema {
    if (!type.enumValues || type.enumValues.length === 0) return {}
    return { enum: type.enumValues }
  }

  buildLiteralSchema(type: TypeInfo): JSONSchema {
    if (type.literalValue === undefined || type.literalValue === null) {
      return { type: 'null' }
    }
    if (typeof type.literalValue === 'string') {
      return { type: 'string', const: type.literalValue }
    }
    if (typeof type.literalValue === 'number') {
      return { type: 'number', const: type.literalValue }
    }
    if (typeof type.literalValue === 'boolean') {
      return { type: 'boolean', const: type.literalValue }
    }
    return {}
  }

  buildTupleSchema(type: TypeInfo, config: SchemaGenConfig): JSONSchema {
    const schema: JSONSchema = {
      type: 'array',
    }
    if (type.types && type.types.length > 0) {
      schema.prefixItems = type.types.map((t) => this.buildSchema(t, config))
      schema.minItems = type.types.length
      schema.maxItems = type.types.length
    }
    return schema
  }

  buildRecordSchema(keyType: TypeInfo, valueType: TypeInfo, config: SchemaGenConfig): JSONSchema {
    const valueSchema = this.buildSchema(valueType, config)
    const schema: JSONSchema = {
      type: 'object',
      additionalProperties: valueSchema,
    }
    if (keyType.name === 'string') {
      schema.propertyNames = { type: 'string' }
    }
    return schema
  }

  buildRefSchema(type: TypeInfo): JSONSchema {
    return { $ref: `#/definitions/${type.name}` }
  }

  private wrapNullable(schema: JSONSchema): JSONSchema {
    if (schema.type === 'null') return schema
    if (schema.anyOf) {
      return { anyOf: [...schema.anyOf, { type: 'null' }] }
    }
    if (schema.$ref) {
      return { anyOf: [schema, { type: 'null' }] }
    }
    return { anyOf: [schema, { type: 'null' }] }
  }
}
