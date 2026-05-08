export interface SchemaVersion {
  version: number
  migrator: (data: Record<string, unknown>) => Record<string, unknown>
}

export interface SerializationSchema {
  name: string
  currentVersion: number
  versions: Map<number, SchemaVersion>
}

export interface SerializeOptions {
  includeVersion: boolean
  prettyPrint: boolean
  compress: boolean
}

export interface DeserializeOptions {
  strictVersion: boolean
  migrateToLatest: boolean
}

export const DEFAULT_SERIALIZE_OPTIONS: SerializeOptions = {
  includeVersion: true,
  prettyPrint: false,
  compress: false,
}

export const DEFAULT_DESERIALIZE_OPTIONS: DeserializeOptions = {
  strictVersion: true,
  migrateToLatest: true,
}
