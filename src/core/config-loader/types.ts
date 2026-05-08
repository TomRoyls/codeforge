export interface ConfigSource {
  type: 'object' | 'json' | 'env'
  data: Record<string, unknown>
  priority: number
}

export interface ConfigEntry {
  key: string
  value: unknown
  source: string
  overridden: boolean
}

export interface ConfigSnapshot {
  entries: ConfigEntry[]
  timestamp: Date
  version: string
}

export interface LoaderConfig {
  mergeStrategy: 'deep' | 'shallow' | 'replace'
  envPrefix: string
  separators: string[]
}

export const DEFAULT_LOADER_CONFIG: LoaderConfig = {
  mergeStrategy: 'deep',
  envPrefix: '',
  separators: ['_'],
}
