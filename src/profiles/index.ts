import type { RuleEnvConfig } from '../config/types.js'
import type { RuleSeverity } from '../rules/types.js'

export type SeverityProfile = 'lenient' | 'moderate' | 'strict'

export interface ProfileMeta {
  description: string
  errorCount: number
  name: string
  warningCount: number
}

function buildProfile(
  rules: Record<string, string>,
  getCategory: (id: string) => string,
  isRecommended: (id: string) => boolean,
  strategy: 'lenient' | 'moderate' | 'strict',
): RuleEnvConfig {
  const config: RuleEnvConfig = {}

  for (const ruleId of Object.keys(rules)) {
    const category = getCategory(ruleId)
    const recommended = isRecommended(ruleId)

    switch (strategy) {
      case 'lenient': {
        if (
          category === 'security' &&
          (ruleId.startsWith('no-unsafe-') ||
            ruleId === 'no-eval' ||
            ruleId === 'no-deprecated-api')
        ) {
          config[ruleId] = 'error'
        } else if (
          category === 'correctness' &&
          (ruleId.startsWith('no-empty') ||
            ruleId === 'no-throw-literal' ||
            ruleId === 'no-constant-binary-expression')
        ) {
          config[ruleId] = 'error'
        } else if (recommended) {
          config[ruleId] = 'warning'
        } else {
          config[ruleId] = 'info'
        }

        break
      }

      case 'moderate': {
        if (category === 'security' || category === 'correctness' || category === 'testing') {
          config[ruleId] = 'error'
        } else if (recommended) {
          config[ruleId] = 'error'
        } else {
          config[ruleId] = 'warning'
        }

        break
      }

      case 'strict': {
        config[ruleId] = 'error'
        break
      }
    }
  }

  return config
}

export function getProfileConfig(
  profile: SeverityProfile,
  rules: Record<string, unknown>,
  getCategory: (id: string) => string,
  isRecommended: (id: string) => boolean,
): RuleEnvConfig {
  return buildProfile(rules as Record<string, string>, getCategory, isRecommended, profile)
}

export function getProfileMeta(profile: SeverityProfile, config: RuleEnvConfig): ProfileMeta {
  let errorCount = 0
  let warningCount = 0

  for (const severity of Object.values(config)) {
    const sev: RuleSeverity = Array.isArray(severity) ? severity[0] : severity
    if (sev === 'error') errorCount++
    else if (sev === 'warning') warningCount++
  }

  const descriptions: Record<SeverityProfile, string> = {
    lenient: 'Only critical errors enforced. Everything else as warnings or info.',
    moderate: 'Security, correctness, and recommended rules as errors. Others as warnings.',
    strict: 'All rules enforced as errors. Maximum safety.',
  }

  return {
    description: descriptions[profile],
    errorCount,
    name: profile.charAt(0).toUpperCase() + profile.slice(1),
    warningCount,
  }
}

export const PROFILE_DESCRIPTIONS: Record<SeverityProfile, string> = {
  lenient: 'Only critical security and correctness errors. Low noise.',
  moderate: 'Recommended rules + security/correctness as errors. Balanced.',
  strict: 'All rules as errors. Maximum enforcement.',
}
