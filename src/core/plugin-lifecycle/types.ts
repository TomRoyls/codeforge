export type PluginState = 'installed' | 'enabled' | 'disabled' | 'error' | 'pending'

export interface PluginInfo {
  name: string
  version: string
  description: string
  author: string
  dependencies: Map<string, string>
  entryPoint: string
  homepage?: string
  license: string
  installedAt: number
  updatedAt: number
  state: PluginState
}

export interface PluginDependency {
  name: string
  versionRange: string
  required: boolean
}

export interface VersionConflict {
  pluginA: string
  pluginB: string
  dependency: string
  versionA: string
  versionB: string
}

export interface InstallOptions {
  force: boolean
  peerDeps: boolean
  version?: string
}

export interface InstallResult {
  success: boolean
  plugin?: PluginInfo
  errors: string[]
  warnings: string[]
}

export interface RegistryEntry {
  plugin: PluginInfo
  config: Record<string, unknown>
  enabled: boolean
  loadOrder: number
}

export interface PluginEvent {
  type: 'install' | 'uninstall' | 'enable' | 'disable' | 'update' | 'error'
  pluginName: string
  timestamp: number
  details: string
}
