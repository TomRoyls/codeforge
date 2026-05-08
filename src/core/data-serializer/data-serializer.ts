import { SchemaVersioner } from './schema-versioner.js'
import type { SchemaVersion, SerializeOptions, DeserializeOptions } from './types.js'
import { DEFAULT_SERIALIZE_OPTIONS, DEFAULT_DESERIALIZE_OPTIONS } from './types.js'

export class DataSerializer {
  private serializeOptions: SerializeOptions
  private deserializeOptions: DeserializeOptions
  private versioner: SchemaVersioner

  constructor(
    serializeOptions?: Partial<SerializeOptions>,
    deserializeOptions?: Partial<DeserializeOptions>,
  ) {
    this.serializeOptions = { ...DEFAULT_SERIALIZE_OPTIONS, ...serializeOptions }
    this.deserializeOptions = { ...DEFAULT_DESERIALIZE_OPTIONS, ...deserializeOptions }
    this.versioner = new SchemaVersioner()
  }

  serialize(data: Record<string, unknown>, schemaName?: string): string {
    let output = { ...data }

    if (schemaName) {
      output = this.versioner.migrate(output, schemaName)

      if (this.serializeOptions.includeVersion) {
        const currentVersion = this.versioner.getCurrentVersion(schemaName)
        output._version = currentVersion
        output._schema = schemaName
      }
    }

    const indent = this.serializeOptions.prettyPrint ? 2 : undefined
    return JSON.stringify(output, undefined, indent)
  }

  deserialize<T>(json: string, schemaName?: string): T {
    const parsed: Record<string, unknown> = JSON.parse(json)

    if (schemaName && typeof parsed._version === 'number') {
      const currentVersion = this.versioner.getCurrentVersion(schemaName)

      if (parsed._version !== currentVersion && this.deserializeOptions.migrateToLatest) {
        const migrated = this.versioner.migrate(parsed, schemaName)
        return migrated as T
      }

      if (this.deserializeOptions.strictVersion && parsed._version !== currentVersion) {
        throw new Error(
          `Version mismatch: data version ${parsed._version}, current version ${currentVersion}`,
        )
      }
    }

    return parsed as T
  }

  registerSchema(name: string, versions: SchemaVersion[]): void {
    this.versioner.registerSchema(name, versions)
  }

  clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data)) as T
  }

  merge(
    base: Record<string, unknown>,
    override: Record<string, unknown>,
  ): Record<string, unknown> {
    return { ...base, ...override }
  }

  diff(
    a: Record<string, unknown>,
    b: Record<string, unknown>,
  ): Record<string, { a: unknown; b: unknown }> {
    const result: Record<string, { a: unknown; b: unknown }> = {}
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])

    for (const key of allKeys) {
      const aHas = Object.prototype.hasOwnProperty.call(a, key)
      const bHas = Object.prototype.hasOwnProperty.call(b, key)

      if (!aHas || !bHas) {
        result[key] = { a: a[key], b: b[key] }
        continue
      }

      if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
        result[key] = { a: a[key], b: b[key] }
      }
    }

    return result
  }

  getOptions(): { serialize: SerializeOptions; deserialize: DeserializeOptions } {
    return {
      serialize: { ...this.serializeOptions },
      deserialize: { ...this.deserializeOptions },
    }
  }
}
