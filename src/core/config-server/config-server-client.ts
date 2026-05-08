import type {
  ConfigConflict,
  ConfigFetchResult,
  ConfigMergeResult,
  ConfigServerConfig,
  RemoteConfig,
  RemoteRuleConfig,
} from './types.js'
import { DEFAULT_CONFIG_SERVER } from './types.js'

export class ConfigServerClient {
  private config: ConfigServerConfig
  private cache: Map<string, { config: RemoteConfig; fetchedAt: number }>
  private store: Map<string, RemoteConfig>

  constructor(config?: Partial<ConfigServerConfig>) {
    this.config = { ...DEFAULT_CONFIG_SERVER, ...config }
    this.cache = new Map()
    this.store = new Map()
  }

  fetchConfig(projectId: string): Promise<ConfigFetchResult> {
    const start = performance.now()

    const cached = this.cache.get(projectId)
    if (cached && Date.now() - cached.fetchedAt < this.config.cacheTtl) {
      const duration = performance.now() - start
      return Promise.resolve({
        config: cached.config,
        fromCache: true,
        duration,
      })
    }

    const stored = this.store.get(projectId)
    if (!stored) {
      const duration = performance.now() - start
      if (this.config.fallbackToLocal) {
        return Promise.resolve({
          config: null,
          fromCache: false,
          error: `No config found for project: ${projectId}`,
          duration,
        })
      }
      return Promise.resolve({
        config: null,
        fromCache: false,
        error: `No config found for project: ${projectId}`,
        duration,
      })
    }

    this.cache.set(projectId, { config: stored, fetchedAt: Date.now() })
    const duration = performance.now() - start
    return Promise.resolve({
      config: stored,
      fromCache: false,
      duration,
    })
  }

  storeConfig(projectId: string, config: RemoteConfig): void {
    this.store.set(projectId, config)
  }

  getCached(projectId: string): RemoteConfig | null {
    const entry = this.cache.get(projectId)
    if (!entry) return null
    if (Date.now() - entry.fetchedAt >= this.config.cacheTtl) return null
    return entry.config
  }

  invalidateCache(projectId: string): void {
    this.cache.delete(projectId)
  }

  invalidateAll(): void {
    this.cache.clear()
  }

  mergeConfigs(
    local: Record<string, RemoteRuleConfig>,
    remote: Record<string, RemoteRuleConfig>,
    strategy: 'local-wins' | 'remote-wins' | 'merge' = 'local-wins',
  ): ConfigMergeResult {
    const merged: Record<string, RemoteRuleConfig> = {}
    const localOverrides: string[] = []
    const remoteAdditions: string[] = []
    const conflicts: ConfigConflict[] = []

    const allKeys = new Set<string>([
      ...Object.keys(local),
      ...Object.keys(remote),
    ])

    for (const key of allKeys) {
      const localRule = local[key]
      const remoteRule = remote[key]

      if (localRule && !remoteRule) {
        localOverrides.push(key)
        merged[key] = { ...localRule }
      } else if (!localRule && remoteRule) {
        remoteAdditions.push(key)
        merged[key] = { ...remoteRule }
      } else if (localRule && remoteRule) {
        const hasConflict =
          localRule.severity !== remoteRule.severity ||
          localRule.enabled !== remoteRule.enabled

        if (hasConflict) {
          const resolved = this.resolveConflictInternal(
            localRule,
            remoteRule,
            strategy,
          )
          conflicts.push({
            ruleId: key,
            localValue: { ...localRule },
            remoteValue: { ...remoteRule },
            resolvedValue: resolved,
            resolution: strategy === 'local-wins' ? 'local' : strategy === 'remote-wins' ? 'remote' : 'merge',
          })
          merged[key] = resolved
        } else {
          merged[key] = { ...remoteRule }
          if (localRule.options || remoteRule.options) {
            merged[key] = {
              ...remoteRule,
              options: { ...remoteRule.options, ...localRule.options },
            }
          }
        }
      }
    }

    return { merged, localOverrides, remoteAdditions, conflicts }
  }

  resolveConflict(
    conflict: ConfigConflict,
    resolution: 'local' | 'remote' | 'merge',
  ): RemoteRuleConfig {
    if (resolution === 'local') {
      return { ...conflict.localValue }
    }
    if (resolution === 'remote') {
      return { ...conflict.remoteValue }
    }
    return {
      severity: conflict.localValue.severity,
      enabled: conflict.localValue.enabled,
      options: {
        ...conflict.remoteValue.options,
        ...conflict.localValue.options,
      },
    }
  }

  validateConfig(config: RemoteConfig): string[] {
    const errors: string[] = []

    if (!config.id) {
      errors.push('Missing required field: id')
    }
    if (!config.name) {
      errors.push('Missing required field: name')
    }
    if (!config.url) {
      errors.push('Missing required field: url')
    }
    if (!config.version) {
      errors.push('Missing required field: version')
    }

    if (config.version && !this.isValidSemver(config.version)) {
      errors.push('Invalid version format: must be semver (e.g., 1.0.0)')
    }

    if (typeof config.rules !== 'object' || config.rules === null) {
      errors.push('Rules must be an object')
    } else {
      for (const [ruleId, rule] of Object.entries(config.rules)) {
        if (!rule.severity) {
          errors.push(`Rule "${ruleId}" missing severity`)
        }
        if (typeof rule.enabled !== 'boolean') {
          errors.push(`Rule "${ruleId}" missing or invalid enabled field`)
        }
        if (
          rule.severity &&
          !['error', 'warning', 'info', 'off'].includes(rule.severity)
        ) {
          errors.push(
            `Rule "${ruleId}" has invalid severity: ${rule.severity}`,
          )
        }
      }
    }

    if (config.profiles && typeof config.profiles === 'object') {
      for (const [profileId, profile] of Object.entries(config.profiles)) {
        if (!profile.name) {
          errors.push(`Profile "${profileId}" missing name`)
        }
        if (!profile.description) {
          errors.push(`Profile "${profileId}" missing description`)
        }
        if (typeof profile.rules !== 'object' || profile.rules === null) {
          errors.push(`Profile "${profileId}" has invalid rules`)
        }
      }
    }

    return errors
  }

  getCachedProjectIds(): string[] {
    return [...this.cache.keys()]
  }

  clear(): void {
    this.cache.clear()
    this.store.clear()
  }

  private resolveConflictInternal(
    localRule: RemoteRuleConfig,
    remoteRule: RemoteRuleConfig,
    strategy: 'local-wins' | 'remote-wins' | 'merge',
  ): RemoteRuleConfig {
    if (strategy === 'local-wins') {
      return { ...localRule }
    }
    if (strategy === 'remote-wins') {
      return { ...remoteRule }
    }
    return {
      severity: localRule.severity,
      enabled: localRule.enabled,
      options: { ...remoteRule.options, ...localRule.options },
    }
  }

  private isValidSemver(version: string): boolean {
    return /^\d+\.\d+\.\d+/.test(version)
  }
}
