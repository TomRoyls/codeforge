import type { FeatureFlag, UserContext } from './types.js'

export class FlagEvaluator {
  hashUserId(userId: string, flagKey: string): number {
    const combined = userId + ':' + flagKey
    let hash = 5381
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) + hash + combined.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }

  isInRollout(userId: string, flagKey: string, percentage: number): boolean {
    const hash = this.hashUserId(userId, flagKey)
    return hash % 100 < percentage
  }

  evaluate(flag: FeatureFlag, context?: UserContext): boolean {
    if (flag.killSwitch) return false
    if (!flag.enabled) return false
    if (flag.targetUsers.length > 0) {
      if (!context) return false
      if (!flag.targetUsers.includes(context.userId)) return false
    }
    if (flag.rolloutPercentage < 100) {
      if (!context) return false
      if (!this.isInRollout(context.userId, flag.key, flag.rolloutPercentage)) return false
    }
    return true
  }

  selectVariant(flag: FeatureFlag, context?: UserContext): string | undefined {
    if (flag.variants.length === 0) return flag.variant
    if (!context) return flag.variants[0]!
    const hash = this.hashUserId(context.userId, flag.key)
    return flag.variants[hash % flag.variants.length]!
  }
}
