export interface PluginDefinition {
  name: string
  version: string
  description: string
  dependencies: string[]
  hooks: string[]
  priority?: number
}

export type PluginState = 'loading' | 'loaded' | 'enabled' | 'disabled' | 'error'

export interface PluginContext {
  config: Record<string, unknown>
  logger: {
    info: (message: string) => void
    warn: (message: string) => void
    error: (message: string) => void
  }
  api: Record<string, unknown>
}

export interface PluginLifecycle {
  onLoad?: (context: PluginContext) => void
  onEnable?: (context: PluginContext) => void
  onDisable?: (context: PluginContext) => void
  onDestroy?: (context: PluginContext) => void
}

export interface ManagerConfig {
  autoEnable: boolean
  strictDeps: boolean
  timeout: number
}

export const DEFAULT_MANAGER_CONFIG: ManagerConfig = {
  autoEnable: false,
  strictDeps: true,
  timeout: 5000,
}
