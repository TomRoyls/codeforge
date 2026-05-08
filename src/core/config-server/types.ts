export interface RemoteConfig {
  id: string
  name: string
  url: string
  rules: Record<string, RemoteRuleConfig>
  profiles: Record<string, RemoteProfile>
  updatedAt: number
  version: string
  checksum: string
}

export interface RemoteRuleConfig {
  severity: 'error' | 'warning' | 'info' | 'off'
  options?: Record<string, unknown>
  enabled: boolean
}

export interface RemoteProfile {
  name: string
  description: string
  rules: Record<string, RemoteRuleConfig>
  extends?: string[]
}

export interface ConfigServerConfig {
  serverUrl: string
  cacheTtl: number
  timeout: number
  retries: number
  fallbackToLocal: boolean
}

export const DEFAULT_CONFIG_SERVER: ConfigServerConfig = {
  serverUrl: 'https://config.codeforge.dev',
  cacheTtl: 300000,
  timeout: 10000,
  retries: 2,
  fallbackToLocal: true,
}

export interface ConfigFetchResult {
  config: RemoteConfig | null
  fromCache: boolean
  error?: string
  duration: number
}

export interface ConfigMergeResult {
  merged: Record<string, RemoteRuleConfig>
  localOverrides: string[]
  remoteAdditions: string[]
  conflicts: ConfigConflict[]
}

export interface ConfigConflict {
  ruleId: string
  localValue: RemoteRuleConfig
  remoteValue: RemoteRuleConfig
  resolvedValue: RemoteRuleConfig
  resolution: 'local' | 'remote' | 'merge'
}
