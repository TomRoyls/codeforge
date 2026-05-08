export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ConfigObject
  | ConfigArray

export interface ConfigObject {
  [key: string]: ConfigValue
}

export interface ConfigArray extends Array<ConfigValue> {}

export interface ConfigSource {
  name: string
  priority: number
  data: ConfigObject
}

export interface NormalizeOptions {
  camelCase: boolean
  envPrefix: string
  defaults: ConfigObject
  aliases: Record<string, string>
  allowUnknown: boolean
  requiredKeys: string[]
}

export interface NormalizedConfig {
  data: ConfigObject
  sources: string[]
  appliedDefaults: string[]
  overridden: Record<string, { from: string; to: string; key: string }>
  warnings: string[]
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  default?: ConfigValue
  enum?: ConfigValue[]
  transform?: (value: ConfigValue) => ConfigValue
}
