export interface FeatureFlag {
  key: string
  enabled: boolean
  description: string
  rolloutPercentage: number
  targetUsers: string[]
  killSwitch: boolean
  variant?: string
  variants: string[]
}

export interface FeatureFlagConfig {
  defaultEnabled: boolean
  strictMode: boolean
}

export interface UserContext {
  userId: string
  attributes: Record<string, string>
}

export const DEFAULT_FEATURE_FLAG_CONFIG: FeatureFlagConfig = {
  defaultEnabled: false,
  strictMode: false,
}
