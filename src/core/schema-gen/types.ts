export type TypeKind =
  | 'primitive'
  | 'array'
  | 'object'
  | 'union'
  | 'intersection'
  | 'enum'
  | 'literal'
  | 'tuple'
  | 'record'
  | 'ref'

export interface TypeInfo {
  name: string
  kind: TypeKind
  properties?: Map<string, PropertySchema>
  items?: TypeInfo
  types?: TypeInfo[]
  enumValues?: (string | number | boolean)[]
  nullable: boolean
  optional: boolean
  description?: string
  defaultValue?: unknown
  literalValue?: string | number | boolean | null
  keyType?: TypeInfo
  valueType?: TypeInfo
}

export interface PropertySchema {
  name: string
  type: TypeInfo
  required: boolean
  description?: string
  defaultValue?: unknown
}

export interface JSONSchema {
  $schema?: string
  $ref?: string
  type?: string
  properties?: Record<string, JSONSchema>
  items?: JSONSchema | JSONSchema[]
  required?: string[]
  enum?: (string | number | boolean)[]
  anyOf?: JSONSchema[]
  allOf?: JSONSchema[]
  oneOf?: JSONSchema[]
  additionalProperties?: boolean | JSONSchema
  description?: string
  default?: unknown
  title?: string
  definitions?: Record<string, JSONSchema>
  $defs?: Record<string, JSONSchema>
  const?: unknown
  minItems?: number
  maxItems?: number
  prefixItems?: JSONSchema[]
  propertyNames?: JSONSchema
}

export interface SchemaGenConfig {
  includeDescriptions: boolean
  includeDefaults: boolean
  strictRequired: boolean
  rootName?: string
  schemaVersion: 'draft-07' | 'draft-2020-12'
}

export const DEFAULT_SCHEMA_GEN_CONFIG: SchemaGenConfig = {
  includeDescriptions: true,
  includeDefaults: true,
  strictRequired: true,
  schemaVersion: 'draft-07',
}
