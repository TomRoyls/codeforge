import type { FeatureFlag, FeatureFlagConfig, UserContext } from './types.js'
import { DEFAULT_FEATURE_FLAG_CONFIG } from './types.js'
import { FlagEvaluator } from './flag-evaluator.js'

export class FeatureFlags {
  private flags: Map<string, FeatureFlag> = new Map()
  private evaluator: FlagEvaluator = new FlagEvaluator()
  private config: FeatureFlagConfig

  constructor(config: Partial<FeatureFlagConfig> = {}) {
    this.config = { ...DEFAULT_FEATURE_FLAG_CONFIG, ...config }
  }

  registerFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, {
      key: flag.key,
      enabled: flag.enabled,
      description: flag.description,
      rolloutPercentage: flag.rolloutPercentage,
      targetUsers: [...flag.targetUsers],
      killSwitch: flag.killSwitch,
      variant: flag.variant,
      variants: [...flag.variants],
    })
  }

  registerFlags(flags: FeatureFlag[]): void {
    for (const flag of flags) {
      this.registerFlag(flag)
    }
  }

  unregisterFlag(key: string): void {
    this.flags.delete(key)
  }

  isEnabled(key: string, context?: UserContext): boolean {
    const flag = this.flags.get(key)
    if (!flag) {
      if (this.config.strictMode) {
        throw new Error(`Unknown feature flag: ${key}`)
      }
      return this.config.defaultEnabled
    }
    return this.evaluator.evaluate(flag, context)
  }

  getVariant(key: string, context?: UserContext): string | undefined {
    const flag = this.flags.get(key)
    if (!flag) {
      if (this.config.strictMode) {
        throw new Error(`Unknown feature flag: ${key}`)
      }
      return undefined
    }
    return this.evaluator.selectVariant(flag, context)
  }

  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key)
  }

  getAllFlags(): FeatureFlag[] {
    return [...this.flags.values()]
  }

  enable(key: string): void {
    const flag = this.flags.get(key)
    if (flag) {
      flag.enabled = true
    }
  }

  disable(key: string): void {
    const flag = this.flags.get(key)
    if (flag) {
      flag.enabled = false
    }
  }

  setKillSwitch(key: string, active: boolean): void {
    const flag = this.flags.get(key)
    if (flag) {
      flag.killSwitch = active
    }
  }

  setRollout(key: string, percentage: number): void {
    const flag = this.flags.get(key)
    if (flag) {
      flag.rolloutPercentage = percentage
    }
  }

  getConfig(): FeatureFlagConfig {
    return { ...this.config }
  }
}
