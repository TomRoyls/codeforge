import { describe, it, expect } from 'vitest'

import { getProfileConfig, getProfileMeta, PROFILE_DESCRIPTIONS, type SeverityProfile } from '../src/profiles/index.js'

// ─── Helper ────────────────────────────────────────────
function makeRules(count: number): Record<string, string> {
  const rules: Record<string, string> = {}
  for (let i = 0; i < count; i++) {
    rules[`rule-${i}`] = 'off'
  }
  return rules
}

const sampleRules: Record<string, string> = {
  'no-eval': 'off',
  'no-unsafe-argument': 'off',
  'no-deprecated-api': 'off',
  'no-empty-function': 'off',
  'no-throw-literal': 'off',
  'no-constant-binary-expression': 'off',
  'prefer-const': 'off',
  'max-params': 'off',
}

const securityRule = (id: string) => id === 'no-eval' || id === 'no-unsafe-argument' || id === 'no-deprecated-api' || id === 'no-unsafe-call'
const correctnessRule = (id: string) => id === 'no-empty-function' || id === 'no-throw-literal' || id === 'no-constant-binary-expression'
const getCategory = (id: string): string => {
  if (securityRule(id)) return 'security'
  if (correctnessRule(id)) return 'correctness'
  return 'patterns'
}
const isRecommended = (id: string): boolean => id === 'prefer-const' || id === 'no-eval'

// ─── PROFILE_DESCRIPTIONS ───────────────────────────────
describe('PROFILE_DESCRIPTIONS', () => {
  it('has entries for lenient, moderate, strict', () => {
    expect(PROFILE_DESCRIPTIONS.lenient).toBeDefined()
    expect(PROFILE_DESCRIPTIONS.moderate).toBeDefined()
    expect(PROFILE_DESCRIPTIONS.strict).toBeDefined()
  })

  it('descriptions are non-empty strings', () => {
    for (const desc of Object.values(PROFILE_DESCRIPTIONS)) {
      expect(typeof desc).toBe('string')
      expect(desc.length).toBeGreaterThan(0)
    }
  })
})

// ─── getProfileConfig - lenient ─────────────────────────
describe('getProfileConfig - lenient', () => {
  it('sets critical security rules to error', () => {
    const config = getProfileConfig('lenient', sampleRules, getCategory, isRecommended)
    expect(config['no-eval']).toBe('error')
    expect(config['no-unsafe-argument']).toBe('error')
    expect(config['no-deprecated-api']).toBe('error')
  })

  it('sets critical correctness rules to error', () => {
    const config = getProfileConfig('lenient', sampleRules, getCategory, isRecommended)
    expect(config['no-empty-function']).toBe('error')
    expect(config['no-throw-literal']).toBe('error')
    expect(config['no-constant-binary-expression']).toBe('error')
  })

  it('sets recommended rules to warning', () => {
    const config = getProfileConfig('lenient', sampleRules, getCategory, isRecommended)
    expect(config['prefer-const']).toBe('warning')
  })

  it('sets non-recommended, non-critical rules to info', () => {
    const config = getProfileConfig('lenient', sampleRules, getCategory, isRecommended)
    expect(config['max-params']).toBe('info')
  })

  it('returns empty config for empty rules', () => {
    const config = getProfileConfig('lenient', {}, getCategory, isRecommended)
    expect(Object.keys(config)).toHaveLength(0)
  })
})

// ─── getProfileConfig - moderate ────────────────────────
describe('getProfileConfig - moderate', () => {
  it('sets security category to error', () => {
    const config = getProfileConfig('moderate', sampleRules, getCategory, isRecommended)
    expect(config['no-eval']).toBe('error')
    expect(config['no-unsafe-argument']).toBe('error')
    expect(config['no-deprecated-api']).toBe('error')
  })

  it('sets correctness category to error', () => {
    const config = getProfileConfig('moderate', sampleRules, getCategory, isRecommended)
    expect(config['no-empty-function']).toBe('error')
    expect(config['no-throw-literal']).toBe('error')
  })

  it('sets recommended rules to error', () => {
    const config = getProfileConfig('moderate', sampleRules, getCategory, isRecommended)
    expect(config['prefer-const']).toBe('error')
  })

  it('sets non-recommended non-critical rules to warning', () => {
    const config = getProfileConfig('moderate', sampleRules, getCategory, isRecommended)
    expect(config['max-params']).toBe('warning')
  })
})

// ─── getProfileConfig - strict ──────────────────────────
describe('getProfileConfig - strict', () => {
  it('sets all rules to error', () => {
    const config = getProfileConfig('strict', sampleRules, getCategory, isRecommended)
    for (const severity of Object.values(config)) {
      expect(severity).toBe('error')
    }
  })

  it('covers all rules in config', () => {
    const config = getProfileConfig('strict', sampleRules, getCategory, isRecommended)
    expect(Object.keys(config)).toHaveLength(Object.keys(sampleRules).length)
  })
})

// ─── getProfileMeta ─────────────────────────────────────
describe('getProfileMeta', () => {
  it('counts errors and warnings correctly', () => {
    const config = getProfileConfig('lenient', sampleRules, getCategory, isRecommended)
    const meta = getProfileMeta('lenient', config)
    expect(meta.errorCount).toBeGreaterThan(0)
    expect(meta.warningCount).toBeGreaterThan(0)
    expect(meta.errorCount + meta.warningCount).toBeLessThanOrEqual(Object.keys(config).length)
  })

  it('returns correct name with capitalized profile', () => {
    const config = getProfileConfig('lenient', sampleRules, getCategory, isRecommended)
    const meta = getProfileMeta('lenient', config)
    expect(meta.name).toBe('Lenient')
  })

  it('returns correct name for moderate', () => {
    const config = getProfileConfig('moderate', sampleRules, getCategory, isRecommended)
    const meta = getProfileMeta('moderate', config)
    expect(meta.name).toBe('Moderate')
  })

  it('returns correct name for strict', () => {
    const config = getProfileConfig('strict', sampleRules, getCategory, isRecommended)
    const meta = getProfileMeta('strict', config)
    expect(meta.name).toBe('Strict')
  })

  it('returns a non-empty description', () => {
    const config = getProfileConfig('lenient', sampleRules, getCategory, isRecommended)
    const meta = getProfileMeta('lenient', config)
    expect(meta.description.length).toBeGreaterThan(0)
  })

  it('strict profile reports all as errors', () => {
    const config = getProfileConfig('strict', sampleRules, getCategory, isRecommended)
    const meta = getProfileMeta('strict', config)
    expect(meta.errorCount).toBe(Object.keys(sampleRules).length)
    expect(meta.warningCount).toBe(0)
  })

  it('handles empty config', () => {
    const meta = getProfileMeta('lenient', {})
    expect(meta.errorCount).toBe(0)
    expect(meta.warningCount).toBe(0)
  })
})

// ─── getProfileConfig - array severity values ───────────
describe('getProfileConfig with many rules', () => {
  it('handles large rule sets', () => {
    const rules = makeRules(100)
    const config = getProfileConfig('strict', rules, () => 'patterns', () => false)
    expect(Object.keys(config)).toHaveLength(100)
    for (const severity of Object.values(config)) {
      expect(severity).toBe('error')
    }
  })
})
