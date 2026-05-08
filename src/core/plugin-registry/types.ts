export interface PluginMetadata {
  name: string
  version: string
  description: string
  author: string
  dependencies: string[]
  tags: string[]
  homepage?: string
  license: string
}

export type PluginState = 'discovered' | 'loaded' | 'initialized' | 'started' | 'stopped' | 'error'

export interface PluginEntry {
  metadata: PluginMetadata
  state: PluginState
  loadedAt?: number
  error?: string
}

export interface RegistryConfig {
  allowConflicts: boolean
  maxPlugins: number
  autoResolve: boolean
}
