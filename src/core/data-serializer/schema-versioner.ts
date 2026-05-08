import type { SchemaVersion, SerializationSchema } from './types.js'

export class SchemaVersioner {
  private schemas: Map<string, SerializationSchema> = new Map()

  registerSchema(name: string, versions: SchemaVersion[]): void {
    if (versions.length === 0) {
      throw new Error(`Schema "${name}" must have at least one version`)
    }

    const versionMap = new Map<number, SchemaVersion>()
    let maxVersion = 0

    for (const v of versions) {
      versionMap.set(v.version, v)
      if (v.version > maxVersion) {
        maxVersion = v.version
      }
    }

    this.schemas.set(name, {
      name,
      currentVersion: maxVersion,
      versions: versionMap,
    })
  }

  getSchema(name: string): SerializationSchema | undefined {
    return this.schemas.get(name)
  }

  migrate(
    data: Record<string, unknown>,
    schemaName: string,
    targetVersion?: number,
  ): Record<string, unknown> {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema "${schemaName}" not found`)
    }

    const dataVersion = typeof data._version === 'number' ? data._version : 1
    const target = targetVersion ?? schema.currentVersion

    if (dataVersion === target) {
      return { ...data }
    }

    if (target > schema.currentVersion) {
      throw new Error(`Target version ${target} exceeds current version ${schema.currentVersion}`)
    }

    let current = { ...data }
    const start = dataVersion + 1
    const end = target

    for (let v = start; v <= end; v++) {
      const schemaVersion = schema.versions.get(v)
      if (!schemaVersion) {
        throw new Error(`Version ${v} not found in schema "${schemaName}"`)
      }
      current = schemaVersion.migrator(current)
      current._version = v
    }

    return current
  }

  getCurrentVersion(schemaName: string): number {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema "${schemaName}" not found`)
    }
    return schema.currentVersion
  }

  getVersions(schemaName: string): number[] {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema "${schemaName}" not found`)
    }
    return Array.from(schema.versions.keys()).sort((a, b) => a - b)
  }

  hasSchema(name: string): boolean {
    return this.schemas.has(name)
  }
}
