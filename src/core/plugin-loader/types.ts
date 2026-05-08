export interface PluginConfigEntry {
  type: 'string' | 'number' | 'boolean' | 'select'
  default: unknown
  required: boolean
  options: string[]
}

export interface PluginManifest {
  name: string
  version: string
  description: string
  main: string
  dependencies: string[]
  config: Record<string, PluginConfigEntry>
}

export type PluginState = 'loaded' | 'initialized' | 'active' | 'error' | 'disabled'

export interface PluginInstance {
  manifest: PluginManifest
  config: Record<string, unknown>
  state: PluginState
  error?: string
}

export type PluginHook = 'beforeAnalyze' | 'afterAnalyze' | 'beforeFix' | 'afterFix' | 'onError' | 'onConfig'

export type PluginHookFn = (context: Record<string, unknown>) => Record<string, unknown> | void

export interface LoadResult {
  plugin: PluginInstance
  warnings: string[]
}
