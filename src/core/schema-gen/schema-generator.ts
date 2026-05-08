import type { JSONSchema, SchemaGenConfig, TypeInfo } from './types.js'
import { DEFAULT_SCHEMA_GEN_CONFIG } from './types.js'
import { TypeParser } from './type-parser.js'
import { SchemaBuilder } from './schema-builder.js'

export class SchemaGenerator {
  private parser: TypeParser
  private builder: SchemaBuilder

  constructor() {
    this.parser = new TypeParser()
    this.builder = new SchemaBuilder()
  }

  generateFromSource(
    source: string,
    typeName: string,
    config?: Partial<SchemaGenConfig>,
  ): JSONSchema {
    const mergedConfig = this.mergeConfig(config)
    const typeInfo = this.extractTypeInfo(source, typeName)
    if (!typeInfo) {
      return this.buildRootSchema({}, typeName, mergedConfig)
    }
    const schema = this.builder.buildSchema(typeInfo, mergedConfig)
    return this.buildRootSchema(schema, typeName, mergedConfig)
  }

  generateAll(source: string, config?: Partial<SchemaGenConfig>): Map<string, JSONSchema> {
    const mergedConfig = this.mergeConfig(config)
    const types = this.extractAllTypes(source)
    const results = new Map<string, JSONSchema>()
    for (const [name, typeInfo] of types) {
      const schema = this.builder.buildSchema(typeInfo, mergedConfig)
      results.set(name, this.buildRootSchema(schema, name, mergedConfig))
    }
    return results
  }

  toJSON(schema: JSONSchema, pretty?: boolean): string {
    if (pretty) {
      return JSON.stringify(schema, null, 2)
    }
    return JSON.stringify(schema)
  }

  validateSchema(schema: JSONSchema): string[] {
    const errors: string[] = []
    if (schema.anyOf && schema.oneOf) {
      errors.push('Schema cannot have both anyOf and oneOf')
    }
    if (schema.type === 'array' && !schema.items && !schema.prefixItems) {
      errors.push('Array schema should have items or prefixItems defined')
    }
    if (schema.type === 'object' && schema.properties) {
      if (schema.required) {
        for (const req of schema.required) {
          if (!(req in schema.properties)) {
            errors.push(`Required property "${req}" not found in properties`)
          }
        }
      }
    }
    if (schema.enum) {
      for (let i = 0; i < schema.enum.length; i++) {
        for (let j = i + 1; j < schema.enum.length; j++) {
          if (schema.enum[i] === schema.enum[j]) {
            errors.push(`Duplicate enum value: ${String(schema.enum[i])}`)
          }
        }
      }
    }
    if (schema.allOf) {
      for (const sub of schema.allOf) {
        if (sub.type && schema.type && sub.type !== schema.type) {
          errors.push('allOf entry has conflicting type with parent')
        }
      }
    }
    if (schema.minItems !== undefined && schema.maxItems !== undefined) {
      if (schema.minItems > schema.maxItems) {
        errors.push('minItems cannot be greater than maxItems')
      }
    }
    return errors
  }

  mergeSchemas(base: JSONSchema, override: JSONSchema): JSONSchema {
    const merged: Record<string, unknown> = { ...base }
    for (const [key, overrideVal] of Object.entries(override)) {
      if (overrideVal === undefined) continue
      const baseVal = merged[key]
      if (
        baseVal !== undefined &&
        typeof baseVal === 'object' &&
        !Array.isArray(baseVal) &&
        typeof overrideVal === 'object' &&
        !Array.isArray(overrideVal)
      ) {
        if (key === 'properties') {
          merged[key] = {
            ...(baseVal as Record<string, JSONSchema>),
            ...(overrideVal as Record<string, JSONSchema>),
          }
        } else {
          merged[key] = { ...baseVal, ...overrideVal }
        }
      } else if (Array.isArray(baseVal) && Array.isArray(overrideVal)) {
        if (key === 'required') {
          const combined = [...(baseVal as string[]), ...(overrideVal as string[])]
          merged[key] = [...new Set(combined)]
        } else {
          merged[key] = overrideVal
        }
      } else {
        merged[key] = overrideVal
      }
    }
    return merged as JSONSchema
  }

  getSchemaType(schema: JSONSchema): string {
    if (schema.type) return schema.type
    if (schema.$ref) return 'ref'
    if (schema.enum) return 'enum'
    if (schema.anyOf) return 'union'
    if (schema.allOf) return 'intersection'
    if (schema.oneOf) return 'oneOf'
    if (schema.const !== undefined) return 'literal'
    return 'unknown'
  }

  private mergeConfig(config?: Partial<SchemaGenConfig>): SchemaGenConfig {
    if (!config) return { ...DEFAULT_SCHEMA_GEN_CONFIG }
    return { ...DEFAULT_SCHEMA_GEN_CONFIG, ...config }
  }

  private buildRootSchema(
    inner: JSONSchema,
    typeName: string,
    config: SchemaGenConfig,
  ): JSONSchema {
    const schemaVersion =
      config.schemaVersion === 'draft-2020-12'
        ? 'https://json-schema.org/draft/2020-12/schema'
        : 'http://json-schema.org/draft-07/schema#'
    return {
      $schema: schemaVersion,
      title: typeName,
      ...inner,
    }
  }

  private extractTypeInfo(source: string, typeName: string): TypeInfo | null {
    const allTypes = this.extractAllTypes(source)
    return allTypes.get(typeName) ?? null
  }

  private extractAllTypes(source: string): Map<string, TypeInfo> {
    const types = new Map<string, TypeInfo>()
    const typeAliasRegex = /export\s+type\s+(\w+)\s*=\s*([^;]+);?/g
    let match: RegExpExecArray | null
    while ((match = typeAliasRegex.exec(source)) !== null) {
      const name = match[1]!
      const typeStr = match[2]!.trim()
      const typeInfo = this.parser.parseType(typeStr)
      types.set(name, typeInfo)
    }
    const interfaceRegex = /export\s+interface\s+(\w+)\s*(?:extends\s+[\w,\s]+)?\s*\{/g
    while ((match = interfaceRegex.exec(source)) !== null) {
      const name = match[1]!
      const startIdx = match.index + match[0].length
      const body = this.extractBraceContent(source, startIdx)
      const properties = this.parser.parseObject(`{${body}}`)
      types.set(name, {
        name,
        kind: 'object',
        properties,
        nullable: false,
        optional: false,
      })
    }
    const enumRegex = /export\s+enum\s+(\w+)\s*\{([^}]*)\}/g
    while ((match = enumRegex.exec(source)) !== null) {
      const name = match[1]!
      const body = match[2]!.trim()
      const values = body
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
      const typeInfo = this.parser.parseEnum(values)
      types.set(name, typeInfo)
    }
    return types
  }

  private extractBraceContent(source: string, startIdx: number): string {
    let depth = 1
    let i = startIdx
    while (i < source.length && depth > 0) {
      const ch = source[i]!
      if (ch === '{') depth++
      else if (ch === '}') depth--
      i++
    }
    return source.slice(startIdx, i - 1)
  }
}
