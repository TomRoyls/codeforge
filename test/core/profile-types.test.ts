import { describe, expect, it } from 'vitest'

import {
  BUILTIN_PROFILES,
  type ProfileValidationResult,
  type RuleConfig,
  type RuleProfile,
} from '../../src/core/profile-types.js'

// ─── BUILTIN_PROFILES ───

describe('BUILTIN_PROFILES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(BUILTIN_PROFILES)).toBe(true)
    expect(BUILTIN_PROFILES.length).toBeGreaterThan(0)
  })

  it('has exactly 3 profiles', () => {
    expect(BUILTIN_PROFILES).toHaveLength(3)
  })

  it('contains strict, moderate, and lenient profiles', () => {
    const names = BUILTIN_PROFILES.map((p) => p.name)
    expect(names).toContain('strict')
    expect(names).toContain('moderate')
    expect(names).toContain('lenient')
  })
})

// ─── Profile Structure ───

describe('BUILTIN_PROFILES profile structure', () => {
  it('every profile has required fields', () => {
    for (const profile of BUILTIN_PROFILES) {
      expect(profile.name).toBeDefined()
      expect(typeof profile.name).toBe('string')
      expect(profile.description).toBeDefined()
      expect(typeof profile.description).toBe('string')
      expect(profile.version).toBeDefined()
      expect(typeof profile.version).toBe('string')
      expect(profile.rules).toBeDefined()
      expect(typeof profile.rules).toBe('object')
      expect(profile.createdBy).toBeDefined()
      expect(typeof profile.createdBy).toBe('string')
      expect(profile.createdAt).toBeDefined()
      expect(typeof profile.createdAt).toBe('string')
      expect(profile.updatedAt).toBeDefined()
      expect(typeof profile.updatedAt).toBe('string')
    }
  })

  it('every profile has createdBy codeforge', () => {
    for (const profile of BUILTIN_PROFILES) {
      expect(profile.createdBy).toBe('codeforge')
    }
  })

  it('every profile has version 1.0.0', () => {
    for (const profile of BUILTIN_PROFILES) {
      expect(profile.version).toBe('1.0.0')
    }
  })

  it('every profile has at least one rule', () => {
    for (const profile of BUILTIN_PROFILES) {
      expect(Object.keys(profile.rules).length).toBeGreaterThan(0)
    }
  })
})

// ─── Strict Profile ───

describe('strict profile', () => {
  const strict = BUILTIN_PROFILES.find((p) => p.name === 'strict')!

  it('exists', () => {
    expect(strict).toBeDefined()
  })

  it('has security rules set to error', () => {
    expect(strict.rules['no-eval']).toBe('error')
    expect(strict.rules['no-unsafe-html']).toBe('error')
    expect(strict.rules['no-hardcoded-credentials']).toBe('error')
  })

  it('has complexity rules with tuple config', () => {
    const maxComplexity = strict.rules['max-complexity']
    expect(Array.isArray(maxComplexity)).toBe(true)
    expect((maxComplexity as [string, Record<string, unknown>])[0]).toBe('error')
    expect((maxComplexity as [string, Record<string, unknown>])[1]?.max).toBe(10)
  })

  it('has more rules than moderate profile', () => {
    const moderate = BUILTIN_PROFILES.find((p) => p.name === 'moderate')!
    expect(Object.keys(strict.rules).length).toBeGreaterThan(Object.keys(moderate.rules).length)
  })
})

// ─── Moderate Profile ───

describe('moderate profile', () => {
  const moderate = BUILTIN_PROFILES.find((p) => p.name === 'moderate')!

  it('has security rules as errors', () => {
    expect(moderate.rules['no-eval']).toBe('error')
    expect(moderate.rules['no-hardcoded-credentials']).toBe('error')
  })

  it('has complexity rules as warnings', () => {
    const maxComplexity = moderate.rules['max-complexity']
    expect(Array.isArray(maxComplexity)).toBe(true)
    expect((maxComplexity as [string, Record<string, unknown>])[0]).toBe('warning')
  })

  it('has more rules than lenient profile', () => {
    const lenient = BUILTIN_PROFILES.find((p) => p.name === 'lenient')!
    expect(Object.keys(moderate.rules).length).toBeGreaterThan(Object.keys(lenient.rules).length)
  })
})

// ─── Lenient Profile ───

describe('lenient profile', () => {
  const lenient = BUILTIN_PROFILES.find((p) => p.name === 'lenient')!

  it('has all rules as warnings', () => {
    for (const [, config] of Object.entries(lenient.rules)) {
      if (typeof config === 'string') {
        expect(config).toBe('warning')
      } else if (Array.isArray(config)) {
        expect(config[0]).toBe('warning')
      }
    }
  })

  it('has only a few rules', () => {
    expect(Object.keys(lenient.rules).length).toBeLessThan(5)
  })
})

// ─── Type Shape Tests ───

describe('Type shapes', () => {
  it('RuleConfig accepts string config', () => {
    const config: RuleConfig = 'error'
    expect(config).toBe('error')
  })

  it('RuleConfig accepts tuple config', () => {
    const config: RuleConfig = ['error', { max: 10 }]
    expect(Array.isArray(config)).toBe(true)
    expect(config[0]).toBe('error')
  })

  it('RuleConfig accepts tuple without options', () => {
    const config: RuleConfig = ['warning']
    expect(Array.isArray(config)).toBe(true)
    expect(config[0]).toBe('warning')
    expect(config[1]).toBeUndefined()
  })

  it('ProfileValidationResult has correct shape', () => {
    const valid: ProfileValidationResult = { valid: true, errors: [] }
    expect(valid.valid).toBe(true)
    expect(valid.errors).toEqual([])

    const invalid: ProfileValidationResult = { valid: false, errors: ['bad rule'] }
    expect(invalid.valid).toBe(false)
    expect(invalid.errors).toHaveLength(1)
  })
})
