export type RuleConfig = string | [string, Record<string, unknown>?]

export interface RuleProfile {
  name: string
  description: string
  version: string
  rules: Record<string, RuleConfig>
  extends?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ProfileValidationResult {
  valid: boolean
  errors: string[]
}

const now = new Date().toISOString()

function makeBuiltIn(
  name: string,
  description: string,
  rules: Record<string, RuleConfig>,
): RuleProfile {
  return {
    name,
    description,
    version: '1.0.0',
    rules,
    createdBy: 'codeforge',
    createdAt: now,
    updatedAt: now,
  }
}

export const BUILTIN_PROFILES: RuleProfile[] = [
  makeBuiltIn('strict', 'Strict profile: all rules enabled, security and complexity as errors', {
    'no-eval': 'error',
    'no-unsafe-html': 'error',
    'no-hardcoded-credentials': 'error',
    'no-sql-injection': 'error',
    'max-complexity': ['error', { max: 10 }],
    'max-depth': ['error', { max: 4 }],
    'max-params': ['error', { max: 4 }],
    'no-console': 'warning',
    'no-debugger': 'error',
    'eq-eq-eq': 'error',
    'no-explicit-any': 'error',
    curly: 'error',
    'no-empty': 'error',
    'prefer-const': 'warning',
    'no-unused-var': 'warning',
  }),
  makeBuiltIn('moderate', 'Moderate profile: security as errors, complexity as warnings', {
    'no-eval': 'error',
    'no-unsafe-html': 'error',
    'no-hardcoded-credentials': 'error',
    'max-complexity': ['warning', { max: 15 }],
    'max-depth': ['warning', { max: 5 }],
    'max-params': ['warning', { max: 5 }],
    'no-console': 'info',
    'no-debugger': 'warning',
    'eq-eq-eq': 'warning',
    'no-explicit-any': 'warning',
  }),
  makeBuiltIn('lenient', 'Lenient profile: only critical security rules', {
    'no-eval': 'warning',
    'no-hardcoded-credentials': 'warning',
    'no-debugger': 'warning',
  }),
]
