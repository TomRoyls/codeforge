import { describe, expect, it } from 'vitest'

import type { RuleEnvConfig } from '../../../src/config/types.js'
import { allRules, getRuleCategory } from '../../../src/rules/index.js'
import type { RuleSeverity } from '../../../src/rules/types.js'

import {
  getProfileConfig,
  getProfileMeta,
  PROFILE_DESCRIPTIONS,
  type SeverityProfile,
} from '../../../src/profiles/index.js'

const mockRules: Record<string, string> = {
  'no-eval': 'dummy',
  'no-unsafe-regex': 'dummy',
  'no-unsafe-call': 'dummy',
  'no-empty-catch': 'dummy',
  'no-throw-literal': 'dummy',
  'max-params': 'dummy',
  'prefer-const': 'dummy',
  'no-console': 'dummy',
  curly: 'dummy',
}

function mockGetCategory(id: string): string {
  const securityRules = new Set(['no-eval', 'no-unsafe-regex', 'no-unsafe-call'])
  const correctnessRules = new Set(['no-empty-catch', 'no-throw-literal'])
  if (securityRules.has(id)) return 'security'
  if (correctnessRules.has(id)) return 'correctness'
  return 'patterns'
}

function mockIsRecommended(id: string): boolean {
  return ['no-eval', 'no-empty-catch', 'prefer-const', 'curly'].includes(id)
}

describe('profiles', () => {
  describe('PROFILE_DESCRIPTIONS', () => {
    it('should have descriptions for all profiles', () => {
      expect(PROFILE_DESCRIPTIONS.strict).toBeTruthy()
      expect(PROFILE_DESCRIPTIONS.moderate).toBeTruthy()
      expect(PROFILE_DESCRIPTIONS.lenient).toBeTruthy()
    })

    it('should have exactly 3 keys: lenient, moderate, strict', () => {
      const keys = Object.keys(PROFILE_DESCRIPTIONS)
      expect(keys).toHaveLength(3)
      expect(keys).toContain('lenient')
      expect(keys).toContain('moderate')
      expect(keys).toContain('strict')
    })

    it('should have exact lenient description string', () => {
      expect(PROFILE_DESCRIPTIONS.lenient).toBe(
        'Only critical security and correctness errors. Low noise.',
      )
    })

    it('should have exact moderate description string', () => {
      expect(PROFILE_DESCRIPTIONS.moderate).toBe(
        'Recommended rules + security/correctness as errors. Balanced.',
      )
    })

    it('should have exact strict description string', () => {
      expect(PROFILE_DESCRIPTIONS.strict).toBe('All rules as errors. Maximum enforcement.')
    })

    it('should have all descriptions as non-empty strings', () => {
      for (const desc of Object.values(PROFILE_DESCRIPTIONS)) {
        expect(typeof desc).toBe('string')
        expect(desc.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getProfileConfig', () => {
    describe('strict strategy', () => {
      it('should return all rules as error for strict profile', () => {
        const config = getProfileConfig('strict', mockRules, mockGetCategory, mockIsRecommended)
        const entries = Object.entries(config)
        expect(entries.length).toBe(9)
        for (const [, sev] of entries) {
          const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
          expect(severity).toBe('error')
        }
      })

      it('should return empty config for empty rules', () => {
        const config = getProfileConfig('strict', {}, mockGetCategory, mockIsRecommended)
        expect(Object.keys(config)).toHaveLength(0)
      })

      it('should assign error to a single rule', () => {
        const config = getProfileConfig(
          'strict',
          { 'my-rule': 'val' },
          () => 'patterns',
          () => false,
        )
        expect(config['my-rule']).toBe('error')
      })

      it('should assign error to all categories equally in strict', () => {
        const rules: Record<string, string> = {
          a: 'v',
          b: 'v',
          c: 'v',
          d: 'v',
        }
        const cats: Record<string, string> = {
          a: 'security',
          b: 'correctness',
          c: 'testing',
          d: 'patterns',
        }
        const config = getProfileConfig(
          'strict',
          rules,
          (id) => cats[id] ?? 'patterns',
          () => false,
        )
        expect(config.a).toBe('error')
        expect(config.b).toBe('error')
        expect(config.c).toBe('error')
        expect(config.d).toBe('error')
      })
    })

    describe('lenient strategy', () => {
      it('should have critical security rules as error in lenient profile', () => {
        const config = getProfileConfig('lenient', mockRules, mockGetCategory, mockIsRecommended)
        expect(config['no-eval']).toBe('error')
        expect(config['no-unsafe-call']).toBe('error')
      })

      it('should have recommended rules as warning in lenient profile', () => {
        const config = getProfileConfig('lenient', mockRules, mockGetCategory, mockIsRecommended)
        expect(config['prefer-const']).toBe('warning')
        expect(config['curly']).toBe('warning')
      })

      it('should have non-recommended non-critical rules as info in lenient profile', () => {
        const config = getProfileConfig('lenient', mockRules, mockGetCategory, mockIsRecommended)
        expect(config['max-params']).toBe('info')
        expect(config['no-console']).toBe('info')
      })

      it('should set security rule with no-unsafe- prefix to error', () => {
        const rules: Record<string, string> = { 'no-unsafe-xyz': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'security',
          () => false,
        )
        expect(config['no-unsafe-xyz']).toBe('error')
      })

      it('should set no-eval security rule to error', () => {
        const rules: Record<string, string> = { 'no-eval': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'security',
          () => false,
        )
        expect(config['no-eval']).toBe('error')
      })

      it('should set no-deprecated-api security rule to error', () => {
        const rules: Record<string, string> = { 'no-deprecated-api': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'security',
          () => false,
        )
        expect(config['no-deprecated-api']).toBe('error')
      })

      it('should set security rule NOT matching critical pattern to warning when recommended', () => {
        const rules: Record<string, string> = { 'no-dynamic-delete': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'security',
          (id) => id === 'no-dynamic-delete',
        )
        expect(config['no-dynamic-delete']).toBe('warning')
      })

      it('should set security rule NOT matching critical pattern to info when not recommended', () => {
        const rules: Record<string, string> = { 'no-dynamic-delete': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'security',
          () => false,
        )
        expect(config['no-dynamic-delete']).toBe('info')
      })

      it('should set correctness rule with no-empty prefix to error', () => {
        const rules: Record<string, string> = { 'no-empty-catch': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'correctness',
          () => false,
        )
        expect(config['no-empty-catch']).toBe('error')
      })

      it('should set no-throw-literal correctness rule to error', () => {
        const rules: Record<string, string> = { 'no-throw-literal': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'correctness',
          () => false,
        )
        expect(config['no-throw-literal']).toBe('error')
      })

      it('should set no-constant-binary-expression correctness rule to error', () => {
        const rules: Record<string, string> = { 'no-constant-binary-expression': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'correctness',
          () => false,
        )
        expect(config['no-constant-binary-expression']).toBe('error')
      })

      it('should set correctness rule NOT matching critical pattern to warning when recommended', () => {
        const rules: Record<string, string> = { 'no-useless-catch': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'correctness',
          (id) => id === 'no-useless-catch',
        )
        expect(config['no-useless-catch']).toBe('warning')
      })

      it('should set correctness rule NOT matching critical pattern to info when not recommended', () => {
        const rules: Record<string, string> = { 'no-useless-catch': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'correctness',
          () => false,
        )
        expect(config['no-useless-catch']).toBe('info')
      })

      it('should set recommended non-security non-correctness rule to warning', () => {
        const rules: Record<string, string> = { 'my-pattern-rule': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'patterns',
          (id) => id === 'my-pattern-rule',
        )
        expect(config['my-pattern-rule']).toBe('warning')
      })

      it('should set non-recommended non-critical rule to info', () => {
        const rules: Record<string, string> = { 'my-pattern-rule': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'patterns',
          () => false,
        )
        expect(config['my-pattern-rule']).toBe('info')
      })

      it('should set testing category rule to warning when recommended', () => {
        const rules: Record<string, string> = { 'my-test-rule': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'testing',
          (id) => id === 'my-test-rule',
        )
        expect(config['my-test-rule']).toBe('warning')
      })

      it('should set testing category rule to info when not recommended', () => {
        const rules: Record<string, string> = { 'my-test-rule': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => 'testing',
          () => false,
        )
        expect(config['my-test-rule']).toBe('info')
      })

      it('should produce all three severity levels with mixed rules', () => {
        const config = getProfileConfig('lenient', mockRules, mockGetCategory, mockIsRecommended)
        const severities = new Set<string>()
        for (const [, sev] of Object.entries(config)) {
          const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
          severities.add(severity)
        }
        expect(severities.has('error')).toBe(true)
        expect(severities.has('warning')).toBe(true)
        expect(severities.has('info')).toBe(true)
      })
    })

    describe('moderate strategy', () => {
      it('should have security and correctness as error in moderate profile', () => {
        const config = getProfileConfig('moderate', mockRules, mockGetCategory, mockIsRecommended)
        expect(config['no-eval']).toBe('error')
        expect(config['no-unsafe-call']).toBe('error')
        expect(config['no-empty-catch']).toBe('error')
        expect(config['no-throw-literal']).toBe('error')
      })

      it('should have non-recommended non-security rules as warning in moderate profile', () => {
        const config = getProfileConfig('moderate', mockRules, mockGetCategory, mockIsRecommended)
        expect(config['max-params']).toBe('warning')
        expect(config['no-console']).toBe('warning')
      })

      it('should have recommended rules as error in moderate profile', () => {
        const config = getProfileConfig('moderate', mockRules, mockGetCategory, mockIsRecommended)
        expect(config['prefer-const']).toBe('error')
        expect(config['curly']).toBe('error')
      })

      it('should set testing category rules to error', () => {
        const rules: Record<string, string> = { 'my-test-rule': 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => 'testing',
          () => false,
        )
        expect(config['my-test-rule']).toBe('error')
      })

      it('should set non-recommended non-security non-correctness non-testing rule to warning', () => {
        const rules: Record<string, string> = { 'my-pattern-rule': 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => 'patterns',
          () => false,
        )
        expect(config['my-pattern-rule']).toBe('warning')
      })

      it('should set recommended patterns rule to error', () => {
        const rules: Record<string, string> = { 'my-pattern-rule': 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => 'patterns',
          (id) => id === 'my-pattern-rule',
        )
        expect(config['my-pattern-rule']).toBe('error')
      })

      it('should set security rule to error regardless of recommended status', () => {
        const rules: Record<string, string> = { 'no-eval': 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => 'security',
          () => false,
        )
        expect(config['no-eval']).toBe('error')
      })

      it('should set correctness rule to error regardless of recommended status', () => {
        const rules: Record<string, string> = { 'no-empty-catch': 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => 'correctness',
          () => false,
        )
        expect(config['no-empty-catch']).toBe('error')
      })

      it('should set performance non-recommended rule to warning', () => {
        const rules: Record<string, string> = { 'my-perf-rule': 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => 'performance',
          () => false,
        )
        expect(config['my-perf-rule']).toBe('warning')
      })

      it('should set performance recommended rule to error', () => {
        const rules: Record<string, string> = { 'my-perf-rule': 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => 'performance',
          (id) => id === 'my-perf-rule',
        )
        expect(config['my-perf-rule']).toBe('error')
      })

      it('should produce only error and warning severities', () => {
        const config = getProfileConfig('moderate', mockRules, mockGetCategory, mockIsRecommended)
        const severities = new Set<string>()
        for (const [, sev] of Object.entries(config)) {
          const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
          severities.add(severity)
        }
        expect(severities.has('error')).toBe(true)
        expect(severities.has('warning')).toBe(true)
        expect(severities.has('info')).toBe(false)
      })
    })
  })

  describe('getProfileMeta', () => {
    it('should count errors and warnings correctly', () => {
      const config: RuleEnvConfig = {
        rule1: 'error',
        rule2: 'warning',
        rule3: 'error',
        rule4: 'info',
      }
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(2)
      expect(meta.warningCount).toBe(1)
    })

    it('should include profile name and description', () => {
      const meta = getProfileMeta('moderate', {})
      expect(meta.name).toBe('Moderate')
      expect(meta.description).toBeTruthy()
    })

    it('should handle empty config', () => {
      const meta = getProfileMeta('lenient', {})
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(0)
    })

    it('should handle Array severity values counting first element', () => {
      const config: RuleEnvConfig = {
        rule1: ['error', 'option1'] as unknown as RuleSeverity,
        rule2: ['warning', 'option2'] as unknown as RuleSeverity,
        rule3: 'error',
      }
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(2)
      expect(meta.warningCount).toBe(1)
    })

    it('should handle Array severity with error as first element', () => {
      const config: RuleEnvConfig = {
        rule1: ['error', 'someOption'] as unknown as RuleSeverity,
      }
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(1)
      expect(meta.warningCount).toBe(0)
    })

    it('should handle Array severity with warning as first element', () => {
      const config: RuleEnvConfig = {
        rule1: ['warning', 'someOption'] as unknown as RuleSeverity,
      }
      const meta = getProfileMeta('moderate', config)
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(1)
    })

    it('should handle config with only info severities', () => {
      const config: RuleEnvConfig = {
        rule1: 'info',
        rule2: 'info',
        rule3: 'info',
      }
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(0)
    })

    it('should handle mixed info and error severities', () => {
      const config: RuleEnvConfig = {
        rule1: 'info',
        rule2: 'error',
        rule3: 'info',
      }
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(1)
      expect(meta.warningCount).toBe(0)
    })

    it('should capitalize lenient profile name', () => {
      const meta = getProfileMeta('lenient', {})
      expect(meta.name).toBe('Lenient')
    })

    it('should capitalize moderate profile name', () => {
      const meta = getProfileMeta('moderate', {})
      expect(meta.name).toBe('Moderate')
    })

    it('should capitalize strict profile name', () => {
      const meta = getProfileMeta('strict', {})
      expect(meta.name).toBe('Strict')
    })

    it('should return correct description for lenient profile', () => {
      const meta = getProfileMeta('lenient', {})
      expect(meta.description).toBe(
        'Only critical errors enforced. Everything else as warnings or info.',
      )
    })

    it('should return correct description for moderate profile', () => {
      const meta = getProfileMeta('moderate', {})
      expect(meta.description).toBe(
        'Security, correctness, and recommended rules as errors. Others as warnings.',
      )
    })

    it('should return correct description for strict profile', () => {
      const meta = getProfileMeta('strict', {})
      expect(meta.description).toBe('All rules enforced as errors. Maximum safety.')
    })

    it('should return all 4 properties in ProfileMeta', () => {
      const meta = getProfileMeta('strict', { r: 'error' })
      expect(meta).toHaveProperty('description')
      expect(meta).toHaveProperty('errorCount')
      expect(meta).toHaveProperty('name')
      expect(meta).toHaveProperty('warningCount')
    })

    it('should count all rules as errors when all are error', () => {
      const config: RuleEnvConfig = {
        a: 'error',
        b: 'error',
        c: 'error',
        d: 'error',
        e: 'error',
      }
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(5)
      expect(meta.warningCount).toBe(0)
    })

    it('should count all rules as warnings when all are warning', () => {
      const config: RuleEnvConfig = {
        a: 'warning',
        b: 'warning',
        c: 'warning',
      }
      const meta = getProfileMeta('moderate', config)
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(3)
    })
  })

  describe('integration with real rules', () => {
    it('should generate valid config for strict profile with all real rules', () => {
      const config = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const ruleCount = Object.keys(config).length
      expect(ruleCount).toBeGreaterThan(0)
      for (const [, sev] of Object.entries(config)) {
        const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
        expect(severity).toBe('error')
      }
    })

    it('should generate valid config for moderate profile with all real rules', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const severities = new Set<string>()
      for (const [, sev] of Object.entries(config)) {
        const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
        severities.add(severity)
      }
      expect(severities.has('error')).toBe(true)
      expect(severities.has('warning')).toBe(true)
    })

    it('should generate valid config for lenient profile with all real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const severities = new Set<string>()
      for (const [, sev] of Object.entries(config)) {
        const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
        severities.add(severity)
      }
      expect(severities.has('error')).toBe(true)
      expect(severities.has('warning')).toBe(true)
      expect(severities.has('info')).toBe(true)
    })

    it('should assign no-eval to error in lenient profile with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-eval']).toBe('error')
    })

    it('should assign no-deprecated-api to error in lenient profile with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-deprecated-api']).toBe('error')
    })

    it('should assign no-throw-literal to error in lenient profile with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-throw-literal']).toBe('error')
    })

    it('should assign no-constant-binary-expression to error in lenient profile with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-constant-binary-expression']).toBe('error')
    })

    it('should assign no-empty-catch to error in lenient profile with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-empty-catch']).toBe('error')
    })

    it('should assign no-skipped-tests to error in moderate profile (testing category)', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-skipped-tests']).toBe('error')
    })

    it('should assign no-focused-tests to error in moderate profile (testing category)', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-focused-tests']).toBe('error')
    })

    it('should assign security rules to error in moderate profile', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-eval']).toBe('error')
      expect(config['no-unsafe-return']).toBe('error')
      expect(config['no-unsafe-call']).toBe('error')
    })

    it('should assign correctness rules to error in moderate profile', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['no-throw-literal']).toBe('error')
      expect(config['no-empty-catch']).toBe('error')
    })

    it('should assign max-params to error in strict profile', () => {
      const config = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(config['max-params']).toBe('error')
    })

    it('should produce config with same rule count as input rules for strict', () => {
      const config = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(Object.keys(config).length).toBe(Object.keys(allRules).length)
    })

    it('should produce config with same rule count as input rules for moderate', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(Object.keys(config).length).toBe(Object.keys(allRules).length)
    })

    it('should produce config with same rule count as input rules for lenient', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      expect(Object.keys(config).length).toBe(Object.keys(allRules).length)
    })

    it('should produce consistent meta counts for strict config', () => {
      const config = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(Object.keys(allRules).length)
      expect(meta.warningCount).toBe(0)
    })

    it('should produce valid meta for moderate config with real rules', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const meta = getProfileMeta('moderate', config)
      expect(meta.errorCount).toBeGreaterThan(0)
      expect(meta.errorCount + meta.warningCount).toBe(Object.keys(allRules).length)
    })

    it('should produce valid meta for lenient config with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const meta = getProfileMeta('lenient', config)
      const total = meta.errorCount + meta.warningCount
      expect(total).toBeLessThanOrEqual(Object.keys(allRules).length)
      expect(meta.errorCount).toBeGreaterThan(0)
    })

    it('should have more errors in strict than moderate than lenient', () => {
      const strictConfig = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const moderateConfig = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const lenientConfig = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const strictMeta = getProfileMeta('strict', strictConfig)
      const moderateMeta = getProfileMeta('moderate', moderateConfig)
      const lenientMeta = getProfileMeta('lenient', lenientConfig)
      expect(strictMeta.errorCount).toBeGreaterThan(moderateMeta.errorCount)
      expect(moderateMeta.errorCount).toBeGreaterThan(lenientMeta.errorCount)
    })
  })

  describe('edge cases', () => {
    it('should handle single rule with all profiles', () => {
      const rules: Record<string, string> = { 'single-rule': 'v' }
      const lenientConfig = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      const moderateConfig = getProfileConfig(
        'moderate',
        rules,
        () => 'patterns',
        () => false,
      )
      const strictConfig = getProfileConfig(
        'strict',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(lenientConfig['single-rule']).toBe('info')
      expect(moderateConfig['single-rule']).toBe('warning')
      expect(strictConfig['single-rule']).toBe('error')
    })

    it('should handle category function returning unknown category', () => {
      const rules: Record<string, string> = { 'unknown-cat-rule': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'unknown',
        () => false,
      )
      expect(config['unknown-cat-rule']).toBe('info')
    })

    it('should handle isRecommended always true', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => true,
      )
      expect(config.a).toBe('warning')
      expect(config.b).toBe('warning')
    })

    it('should handle isRecommended always false', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(config.a).toBe('info')
      expect(config.b).toBe('info')
    })

    it('should handle all rules in security category with moderate profile', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v', c: 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'security',
        () => false,
      )
      expect(config.a).toBe('error')
      expect(config.b).toBe('error')
      expect(config.c).toBe('error')
    })

    it('should handle all rules in testing category with moderate profile', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'testing',
        () => false,
      )
      expect(config.a).toBe('error')
      expect(config.b).toBe('error')
    })

    it('should handle all rules in correctness category with moderate profile', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config.a).toBe('error')
      expect(config.b).toBe('error')
    })

    it('should handle large number of rules', () => {
      const rules: Record<string, string> = {}
      for (let i = 0; i < 100; i++) {
        rules[`rule-${i}`] = 'v'
      }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(Object.keys(config).length).toBe(100)
    })

    it('should produce deterministic results for same inputs', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v', c: 'v' }
      const config1 = getProfileConfig(
        'moderate',
        rules,
        () => 'security',
        () => false,
      )
      const config2 = getProfileConfig(
        'moderate',
        rules,
        () => 'security',
        () => false,
      )
      expect(config1).toEqual(config2)
    })

    it('should handle no-unsafe-regex as security error in lenient profile', () => {
      const rules: Record<string, string> = { 'no-unsafe-regex': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => false,
      )
      expect(config['no-unsafe-regex']).toBe('error')
    })

    it('should handle no-empty-function as correctness with no-empty prefix in lenient', () => {
      const rules: Record<string, string> = { 'no-empty-function': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-empty-function']).toBe('error')
    })

    it('should handle no-empty-static-block as correctness with no-empty prefix in lenient', () => {
      const rules: Record<string, string> = { 'no-empty-static-block': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-empty-static-block']).toBe('error')
    })

    it('should handle dependencies category in moderate profile', () => {
      const rules: Record<string, string> = { 'no-circular-deps': 'v' }
      const configNonRec = getProfileConfig(
        'moderate',
        rules,
        () => 'dependencies',
        () => false,
      )
      expect(configNonRec['no-circular-deps']).toBe('warning')

      const configRec = getProfileConfig(
        'moderate',
        rules,
        () => 'dependencies',
        () => true,
      )
      expect(configRec['no-circular-deps']).toBe('error')
    })

    it('should handle dependencies category in lenient profile', () => {
      const rules: Record<string, string> = { 'no-circular-deps': 'v' }
      const configNonRec = getProfileConfig(
        'lenient',
        rules,
        () => 'dependencies',
        () => false,
      )
      expect(configNonRec['no-circular-deps']).toBe('info')

      const configRec = getProfileConfig(
        'lenient',
        rules,
        () => 'dependencies',
        () => true,
      )
      expect(configRec['no-circular-deps']).toBe('warning')
    })

    it('should handle performance category in lenient profile', () => {
      const rules: Record<string, string> = { 'no-await-in-loop': 'v' }
      const configNonRec = getProfileConfig(
        'lenient',
        rules,
        () => 'performance',
        () => false,
      )
      expect(configNonRec['no-await-in-loop']).toBe('info')

      const configRec = getProfileConfig(
        'lenient',
        rules,
        () => 'performance',
        () => true,
      )
      expect(configRec['no-await-in-loop']).toBe('warning')
    })

    it('should return ProfileMeta with correct types', () => {
      const meta = getProfileMeta('strict', { a: 'error' })
      expect(typeof meta.name).toBe('string')
      expect(typeof meta.description).toBe('string')
      expect(typeof meta.errorCount).toBe('number')
      expect(typeof meta.warningCount).toBe('number')
    })

    it('should not count info severity in errorCount or warningCount', () => {
      const config: RuleEnvConfig = {
        a: 'info',
        b: 'info',
        c: 'error',
        d: 'warning',
      }
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(1)
      expect(meta.warningCount).toBe(1)
    })

    it('should correctly count mixed error, warning, and info severities', () => {
      const config: RuleEnvConfig = {
        a: 'error',
        b: 'warning',
        c: 'info',
        d: 'error',
        e: 'warning',
        f: 'info',
      }
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(2)
      expect(meta.warningCount).toBe(2)
    })

    it('should return empty config for lenient profile with no rules', () => {
      const config = getProfileConfig('lenient', {}, mockGetCategory, mockIsRecommended)
      expect(Object.keys(config)).toHaveLength(0)
    })

    it('should return empty config for moderate profile with no rules', () => {
      const config = getProfileConfig('moderate', {}, mockGetCategory, mockIsRecommended)
      expect(Object.keys(config)).toHaveLength(0)
    })

    it('should not elevate no-unsafe- prefix to error when category is not security in lenient', () => {
      const rules: Record<string, string> = { 'no-unsafe-myprefix': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(config['no-unsafe-myprefix']).toBe('info')
    })

    it('should not elevate no-unsafe- prefix to error when category is not security in lenient but recommended', () => {
      const rules: Record<string, string> = { 'no-unsafe-myprefix': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => true,
      )
      expect(config['no-unsafe-myprefix']).toBe('warning')
    })

    it('should not elevate no-empty prefix to error when category is not correctness in lenient', () => {
      const rules: Record<string, string> = { 'no-empty-pattern': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(config['no-empty-pattern']).toBe('info')
    })

    it('should set strict to error regardless of category or recommended status', () => {
      const rules: Record<string, string> = { 'some-rule': 'v' }
      const configRecommended = getProfileConfig(
        'strict',
        rules,
        () => 'patterns',
        () => true,
      )
      const configNotRecommended = getProfileConfig(
        'strict',
        rules,
        () => 'security',
        () => false,
      )
      expect(configRecommended['some-rule']).toBe('error')
      expect(configNotRecommended['some-rule']).toBe('error')
    })

    it('should handle getProfileMeta with Array severity containing info', () => {
      const config: RuleEnvConfig = {
        rule1: ['info', 'option'] as unknown as RuleSeverity,
        rule2: 'error',
      }
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(1)
      expect(meta.warningCount).toBe(0)
    })
  })

  describe('strict profile category coverage', () => {
    it('should set security rules to error in strict regardless of recommended', () => {
      const rules: Record<string, string> = { 'no-eval': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'security',
        () => false,
      )
      expect(config['no-eval']).toBe('error')
    })

    it('should set correctness rules to error in strict regardless of recommended', () => {
      const rules: Record<string, string> = { 'no-empty-catch': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-empty-catch']).toBe('error')
    })

    it('should set performance rules to error in strict', () => {
      const rules: Record<string, string> = { 'no-await-in-loop': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'performance',
        () => false,
      )
      expect(config['no-await-in-loop']).toBe('error')
    })

    it('should set dependencies rules to error in strict', () => {
      const rules: Record<string, string> = { 'no-circular-deps': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'dependencies',
        () => false,
      )
      expect(config['no-circular-deps']).toBe('error')
    })

    it('should set testing rules to error in strict', () => {
      const rules: Record<string, string> = { 'no-skipped-tests': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'testing',
        () => false,
      )
      expect(config['no-skipped-tests']).toBe('error')
    })
  })

  describe('lenient profile critical rule boundary', () => {
    it('should not treat no-eval as critical when category is not security', () => {
      const rules: Record<string, string> = { 'no-eval': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(config['no-eval']).toBe('info')
    })

    it('should not treat no-deprecated-api as critical when category is not security', () => {
      const rules: Record<string, string> = { 'no-deprecated-api': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(config['no-deprecated-api']).toBe('info')
    })

    it('should treat no-throw-literal as critical only in correctness category', () => {
      const rules: Record<string, string> = { 'no-throw-literal': 'v' }
      const configPatterns = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(configPatterns['no-throw-literal']).toBe('info')

      const configCorrectness = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(configCorrectness['no-throw-literal']).toBe('error')
    })

    it('should treat no-constant-binary-expression as critical only in correctness category', () => {
      const rules: Record<string, string> = { 'no-constant-binary-expression': 'v' }
      const configSecurity = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => false,
      )
      expect(configSecurity['no-constant-binary-expression']).toBe('info')

      const configCorrectness = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(configCorrectness['no-constant-binary-expression']).toBe('error')
    })

    it('should treat security critical rules as error even when recommended is true', () => {
      const rules: Record<string, string> = { 'no-eval': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => true,
      )
      expect(config['no-eval']).toBe('error')
    })

    it('should treat correctness critical rules as error even when recommended is true', () => {
      const rules: Record<string, string> = { 'no-empty-catch': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => true,
      )
      expect(config['no-empty-catch']).toBe('error')
    })
  })

  describe('moderate profile comprehensive coverage', () => {
    it('should set recommended dependencies rule to error', () => {
      const rules: Record<string, string> = { 'no-circular-deps': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'dependencies',
        () => true,
      )
      expect(config['no-circular-deps']).toBe('error')
    })

    it('should set non-recommended dependencies rule to warning', () => {
      const rules: Record<string, string> = { 'no-circular-deps': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'dependencies',
        () => false,
      )
      expect(config['no-circular-deps']).toBe('warning')
    })

    it('should set recommended performance rule to error', () => {
      const rules: Record<string, string> = { 'perf-rule': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'performance',
        () => true,
      )
      expect(config['perf-rule']).toBe('error')
    })

    it('should set non-recommended performance rule to warning', () => {
      const rules: Record<string, string> = { 'perf-rule': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'performance',
        () => false,
      )
      expect(config['perf-rule']).toBe('warning')
    })

    it('should set testing rules to error even when not recommended', () => {
      const rules: Record<string, string> = { 'test-rule': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'testing',
        () => false,
      )
      expect(config['test-rule']).toBe('error')
    })

    it('should set all category types to at least warning in moderate', () => {
      const categories = [
        'security',
        'correctness',
        'testing',
        'patterns',
        'performance',
        'dependencies',
        'unknown',
      ]
      for (const cat of categories) {
        const rules: Record<string, string> = { rule: 'v' }
        const config = getProfileConfig(
          'moderate',
          rules,
          () => cat,
          () => false,
        )
        const sev = config['rule']
        expect(['error', 'warning']).toContain(sev)
      }
    })
  })

  describe('getProfileMeta comprehensive', () => {
    it('should correctly count errors and warnings with 50 rules', () => {
      const config: RuleEnvConfig = {}
      for (let i = 0; i < 30; i++) config[`err-${i}`] = 'error'
      for (let i = 0; i < 20; i++) config[`warn-${i}`] = 'warning'
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(30)
      expect(meta.warningCount).toBe(20)
    })

    it('should handle single rule with error severity', () => {
      const meta = getProfileMeta('strict', { rule: 'error' })
      expect(meta.errorCount).toBe(1)
      expect(meta.warningCount).toBe(0)
    })

    it('should handle single rule with warning severity', () => {
      const meta = getProfileMeta('moderate', { rule: 'warning' })
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(1)
    })

    it('should handle single rule with info severity', () => {
      const meta = getProfileMeta('lenient', { rule: 'info' })
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(0)
    })

    it('should return distinct descriptions for each profile', () => {
      const metaLenient = getProfileMeta('lenient', {})
      const metaModerate = getProfileMeta('moderate', {})
      const metaStrict = getProfileMeta('strict', {})
      const descriptions = new Set([
        metaLenient.description,
        metaModerate.description,
        metaStrict.description,
      ])
      expect(descriptions.size).toBe(3)
    })

    it('should return distinct names for each profile', () => {
      const metaLenient = getProfileMeta('lenient', {})
      const metaModerate = getProfileMeta('moderate', {})
      const metaStrict = getProfileMeta('strict', {})
      expect(metaLenient.name).toBe('Lenient')
      expect(metaModerate.name).toBe('Moderate')
      expect(metaStrict.name).toBe('Strict')
    })
  })

  describe('config output keys match input rules', () => {
    it('should produce config with same keys for lenient with mixed rules', () => {
      const rules: Record<string, string> = {
        'no-eval': 'v',
        'prefer-const': 'v',
        'max-params': 'v',
        curly: 'v',
        'no-console': 'v',
      }
      const config = getProfileConfig('lenient', rules, mockGetCategory, mockIsRecommended)
      expect(Object.keys(config).sort()).toEqual(Object.keys(rules).sort())
    })

    it('should produce config with same keys for moderate with mixed rules', () => {
      const rules: Record<string, string> = {
        'no-eval': 'v',
        'prefer-const': 'v',
        'max-params': 'v',
        curly: 'v',
        'no-console': 'v',
      }
      const config = getProfileConfig('moderate', rules, mockGetCategory, mockIsRecommended)
      expect(Object.keys(config).sort()).toEqual(Object.keys(rules).sort())
    })

    it('should produce config with same keys for strict with mixed rules', () => {
      const rules: Record<string, string> = {
        'no-eval': 'v',
        'prefer-const': 'v',
        'max-params': 'v',
        curly: 'v',
        'no-console': 'v',
      }
      const config = getProfileConfig('strict', rules, mockGetCategory, mockIsRecommended)
      expect(Object.keys(config).sort()).toEqual(Object.keys(rules).sort())
    })

    it('should not add extra keys beyond input rules', () => {
      const rules: Record<string, string> = { a: 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(Object.keys(config)).toEqual(['a'])
    })

    it('should not remove any keys from input rules', () => {
      const rules: Record<string, string> = {
        a: 'v',
        b: 'v',
        c: 'v',
        d: 'v',
        e: 'v',
      }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'patterns',
        () => false,
      )
      for (const key of Object.keys(rules)) {
        expect(config).toHaveProperty(key)
      }
    })
  })

  describe('severity monotonicity across profiles', () => {
    const severityRank: Record<string, number> = { info: 0, warning: 1, error: 2 }

    it('should have strict severity >= moderate severity for each rule', () => {
      const rules: Record<string, string> = {
        a: 'v',
        b: 'v',
        c: 'v',
        d: 'v',
      }
      const cats: Record<string, string> = {
        a: 'security',
        b: 'correctness',
        c: 'patterns',
        d: 'performance',
      }
      const recs: Record<string, boolean> = { a: false, b: false, c: true, d: false }
      const strictConfig = getProfileConfig(
        'strict',
        rules,
        (id) => cats[id] ?? 'patterns',
        (id) => recs[id] ?? false,
      )
      const moderateConfig = getProfileConfig(
        'moderate',
        rules,
        (id) => cats[id] ?? 'patterns',
        (id) => recs[id] ?? false,
      )
      for (const key of Object.keys(rules)) {
        expect(severityRank[strictConfig[key]]).toBeGreaterThanOrEqual(
          severityRank[moderateConfig[key]],
        )
      }
    })

    it('should have moderate severity >= lenient severity for each rule', () => {
      const rules: Record<string, string> = {
        a: 'v',
        b: 'v',
        c: 'v',
        d: 'v',
      }
      const cats: Record<string, string> = {
        a: 'security',
        b: 'correctness',
        c: 'patterns',
        d: 'testing',
      }
      const recs: Record<string, boolean> = { a: true, b: false, c: true, d: false }
      const moderateConfig = getProfileConfig(
        'moderate',
        rules,
        (id) => cats[id] ?? 'patterns',
        (id) => recs[id] ?? false,
      )
      const lenientConfig = getProfileConfig(
        'lenient',
        rules,
        (id) => cats[id] ?? 'patterns',
        (id) => recs[id] ?? false,
      )
      for (const key of Object.keys(rules)) {
        expect(severityRank[moderateConfig[key]]).toBeGreaterThanOrEqual(
          severityRank[lenientConfig[key]],
        )
      }
    })

    it('should have strict severity >= lenient severity for each rule', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v', c: 'v' }
      const cats: Record<string, string> = {
        a: 'security',
        b: 'patterns',
        c: 'dependencies',
      }
      const strictConfig = getProfileConfig(
        'strict',
        rules,
        (id) => cats[id] ?? 'patterns',
        () => false,
      )
      const lenientConfig = getProfileConfig(
        'lenient',
        rules,
        (id) => cats[id] ?? 'patterns',
        () => false,
      )
      for (const key of Object.keys(rules)) {
        expect(severityRank[strictConfig[key]]).toBeGreaterThanOrEqual(
          severityRank[lenientConfig[key]],
        )
      }
    })

    it('should maintain monotonicity across all 7 categories', () => {
      const categories = [
        'security',
        'correctness',
        'testing',
        'patterns',
        'performance',
        'dependencies',
        'complexity',
      ]
      for (const cat of categories) {
        const rules: Record<string, string> = { rule: 'v' }
        const strict = getProfileConfig(
          'strict',
          rules,
          () => cat,
          () => false,
        )
        const moderate = getProfileConfig(
          'moderate',
          rules,
          () => cat,
          () => false,
        )
        const lenient = getProfileConfig(
          'lenient',
          rules,
          () => cat,
          () => false,
        )
        expect(severityRank[strict['rule']]).toBeGreaterThanOrEqual(severityRank[moderate['rule']])
        expect(severityRank[moderate['rule']]).toBeGreaterThanOrEqual(severityRank[lenient['rule']])
      }
    })
  })

  describe('lenient profile additional edge cases', () => {
    it('should set security rule no-unsafe-assignment to error', () => {
      const rules: Record<string, string> = { 'no-unsafe-assignment': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => false,
      )
      expect(config['no-unsafe-assignment']).toBe('error')
    })

    it('should set security rule no-unsafe-return to error', () => {
      const rules: Record<string, string> = { 'no-unsafe-return': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => false,
      )
      expect(config['no-unsafe-return']).toBe('error')
    })

    it('should set security rule no-unsafe-call to error', () => {
      const rules: Record<string, string> = { 'no-unsafe-call': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => false,
      )
      expect(config['no-unsafe-call']).toBe('error')
    })

    it('should not set no-throw prefix to error in correctness', () => {
      const rules: Record<string, string> = { 'no-throw-non-error': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-throw-non-error']).toBe('info')
    })

    it('should not set no-constant prefix to error in correctness if not exact match', () => {
      const rules: Record<string, string> = { 'no-constant-ternary': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-constant-ternary']).toBe('info')
    })

    it('should set no-empty-object-destructuring to error in correctness (no-empty prefix)', () => {
      const rules: Record<string, string> = { 'no-empty-object-destructuring': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-empty-object-destructuring']).toBe('error')
    })

    it('should handle rule with no-unsafe- prefix exactly', () => {
      const rules: Record<string, string> = { 'no-unsafe-': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => false,
      )
      expect(config['no-unsafe-']).toBe('error')
    })

    it('should handle rule starting with no-empty exactly', () => {
      const rules: Record<string, string> = { 'no-empty': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-empty']).toBe('error')
    })

    it('should set style category rule to info when not recommended', () => {
      const rules: Record<string, string> = { 'indent-style': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'style',
        () => false,
      )
      expect(config['indent-style']).toBe('info')
    })

    it('should set style category rule to warning when recommended', () => {
      const rules: Record<string, string> = { 'indent-style': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'style',
        () => true,
      )
      expect(config['indent-style']).toBe('warning')
    })

    it('should set complexity category rule to info when not recommended', () => {
      const rules: Record<string, string> = { 'complex-method': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'complexity',
        () => false,
      )
      expect(config['complex-method']).toBe('info')
    })

    it('should set complexity category rule to warning when recommended', () => {
      const rules: Record<string, string> = { 'complex-method': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'complexity',
        () => true,
      )
      expect(config['complex-method']).toBe('warning')
    })

    it('should treat security critical rules as error even when not recommended', () => {
      const rules: Record<string, string> = { 'no-unsafe-x': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'security',
        () => false,
      )
      expect(config['no-unsafe-x']).toBe('error')
    })

    it('should treat correctness critical rules as error even when not recommended', () => {
      const rules: Record<string, string> = { 'no-empty-x': 'v' }
      const config = getProfileConfig(
        'lenient',
        rules,
        () => 'correctness',
        () => false,
      )
      expect(config['no-empty-x']).toBe('error')
    })
  })

  describe('moderate profile additional edge cases', () => {
    it('should set style category non-recommended to warning', () => {
      const rules: Record<string, string> = { 'indent-style': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'style',
        () => false,
      )
      expect(config['indent-style']).toBe('warning')
    })

    it('should set style category recommended to error', () => {
      const rules: Record<string, string> = { 'indent-style': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'style',
        () => true,
      )
      expect(config['indent-style']).toBe('error')
    })

    it('should set complexity category non-recommended to warning', () => {
      const rules: Record<string, string> = { 'complex-method': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'complexity',
        () => false,
      )
      expect(config['complex-method']).toBe('warning')
    })

    it('should set complexity category recommended to error', () => {
      const rules: Record<string, string> = { 'complex-method': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'complexity',
        () => true,
      )
      expect(config['complex-method']).toBe('error')
    })

    it('should set unknown category non-recommended to warning', () => {
      const rules: Record<string, string> = { 'my-rule': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'unknown-category',
        () => false,
      )
      expect(config['my-rule']).toBe('warning')
    })

    it('should set unknown category recommended to error', () => {
      const rules: Record<string, string> = { 'my-rule': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'unknown-category',
        () => true,
      )
      expect(config['my-rule']).toBe('error')
    })

    it('should set recommended security rule to error', () => {
      const rules: Record<string, string> = { 'no-eval': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'security',
        () => true,
      )
      expect(config['no-eval']).toBe('error')
    })

    it('should set recommended correctness rule to error', () => {
      const rules: Record<string, string> = { 'no-empty-catch': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'correctness',
        () => true,
      )
      expect(config['no-empty-catch']).toBe('error')
    })

    it('should set recommended testing rule to error', () => {
      const rules: Record<string, string> = { 'no-skipped-tests': 'v' }
      const config = getProfileConfig(
        'moderate',
        rules,
        () => 'testing',
        () => true,
      )
      expect(config['no-skipped-tests']).toBe('error')
    })

    it('should produce no info severity in moderate profile', () => {
      const categories = [
        'security',
        'correctness',
        'testing',
        'patterns',
        'performance',
        'dependencies',
        'complexity',
        'style',
        'unknown',
      ]
      for (const cat of categories) {
        for (const rec of [true, false]) {
          const rules: Record<string, string> = { rule: 'v' }
          const config = getProfileConfig(
            'moderate',
            rules,
            () => cat,
            () => rec,
          )
          expect(['error', 'warning']).toContain(config['rule'])
        }
      }
    })
  })

  describe('strict profile additional edge cases', () => {
    it('should set complexity rule to error in strict', () => {
      const rules: Record<string, string> = { 'complex-method': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'complexity',
        () => false,
      )
      expect(config['complex-method']).toBe('error')
    })

    it('should set style rule to error in strict', () => {
      const rules: Record<string, string> = { 'indent-style': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'style',
        () => false,
      )
      expect(config['indent-style']).toBe('error')
    })

    it('should set unknown category rule to error in strict', () => {
      const rules: Record<string, string> = { 'my-rule': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'unknown',
        () => false,
      )
      expect(config['my-rule']).toBe('error')
    })

    it('should set recommended rule to error in strict', () => {
      const rules: Record<string, string> = { 'my-rule': 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'patterns',
        () => true,
      )
      expect(config['my-rule']).toBe('error')
    })

    it('should handle two rules with different categories', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v' }
      const config = getProfileConfig(
        'strict',
        rules,
        (id) => (id === 'a' ? 'security' : 'patterns'),
        () => false,
      )
      expect(config.a).toBe('error')
      expect(config.b).toBe('error')
    })

    it('should handle rule with empty string value', () => {
      const rules: Record<string, string> = { 'my-rule': '' }
      const config = getProfileConfig(
        'strict',
        rules,
        () => 'patterns',
        () => false,
      )
      expect(config['my-rule']).toBe('error')
    })
  })

  describe('getProfileMeta additional edge cases', () => {
    it('should handle config with 100 error rules', () => {
      const config: RuleEnvConfig = {}
      for (let i = 0; i < 100; i++) config[`rule-${i}`] = 'error'
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(100)
      expect(meta.warningCount).toBe(0)
    })

    it('should handle config with 100 warning rules', () => {
      const config: RuleEnvConfig = {}
      for (let i = 0; i < 100; i++) config[`rule-${i}`] = 'warning'
      const meta = getProfileMeta('moderate', config)
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(100)
    })

    it('should handle config with 100 info rules', () => {
      const config: RuleEnvConfig = {}
      for (let i = 0; i < 100; i++) config[`rule-${i}`] = 'info'
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(0)
    })

    it('should handle alternating error and warning severities', () => {
      const config: RuleEnvConfig = {}
      for (let i = 0; i < 20; i++) {
        config[`rule-${i}`] = i % 2 === 0 ? 'error' : 'warning'
      }
      const meta = getProfileMeta('moderate', config)
      expect(meta.errorCount).toBe(10)
      expect(meta.warningCount).toBe(10)
    })

    it('should handle alternating error and info severities', () => {
      const config: RuleEnvConfig = {}
      for (let i = 0; i < 20; i++) {
        config[`rule-${i}`] = i % 2 === 0 ? 'error' : 'info'
      }
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(10)
      expect(meta.warningCount).toBe(0)
    })

    it('should handle alternating warning and info severities', () => {
      const config: RuleEnvConfig = {}
      for (let i = 0; i < 20; i++) {
        config[`rule-${i}`] = i % 2 === 0 ? 'warning' : 'info'
      }
      const meta = getProfileMeta('lenient', config)
      expect(meta.errorCount).toBe(0)
      expect(meta.warningCount).toBe(10)
    })

    it('should handle Array severity with warning first and multiple options', () => {
      const config: RuleEnvConfig = {
        rule1: ['warning', 'opt1', 'opt2'] as unknown as RuleSeverity,
        rule2: ['error', 'opt3'] as unknown as RuleSeverity,
      }
      const meta = getProfileMeta('moderate', config)
      expect(meta.errorCount).toBe(1)
      expect(meta.warningCount).toBe(1)
    })

    it('should return description matching PROFILE_DESCRIPTIONS for lenient', () => {
      const meta = getProfileMeta('lenient', {})
      expect(meta.description).toBe(
        'Only critical errors enforced. Everything else as warnings or info.',
      )
    })

    it('should return description matching PROFILE_DESCRIPTIONS for moderate', () => {
      const meta = getProfileMeta('moderate', {})
      expect(meta.description).toBe(
        'Security, correctness, and recommended rules as errors. Others as warnings.',
      )
    })

    it('should return description matching PROFILE_DESCRIPTIONS for strict', () => {
      const meta = getProfileMeta('strict', {})
      expect(meta.description).toBe('All rules enforced as errors. Maximum safety.')
    })

    it('should have errorCount as integer for valid config', () => {
      const config: RuleEnvConfig = {
        a: 'error',
        b: 'warning',
        c: 'info',
        d: 'error',
        e: 'warning',
      }
      const meta = getProfileMeta('lenient', config)
      expect(Number.isInteger(meta.errorCount)).toBe(true)
      expect(Number.isInteger(meta.warningCount)).toBe(true)
    })
  })

  describe('real rules additional checks', () => {
    it('should assign no-unsafe-return to error in lenient profile with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      if ('no-unsafe-return' in config) {
        expect(config['no-unsafe-return']).toBe('error')
      }
    })

    it('should assign no-unsafe-assignment to warning in lenient profile (complexity category, recommended)', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      if ('no-unsafe-assignment' in config) {
        expect(config['no-unsafe-assignment']).toBe('warning')
      }
    })

    it('should have testing rules as info or warning in lenient profile with real rules', () => {
      const config = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      for (const [ruleId, sev] of Object.entries(config)) {
        if (getRuleCategory(ruleId) === 'testing') {
          const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
          expect(['info', 'warning']).toContain(severity)
        }
      }
    })

    it('should assign prefer-const to error in moderate profile with real rules', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      if ('prefer-const' in config) {
        expect(config['prefer-const']).toBe('error')
      }
    })

    it('should assign curly to error in moderate profile with real rules', () => {
      const config = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      if ('curly' in config) {
        expect(config['curly']).toBe('error')
      }
    })

    it('should have strict config with no warnings or info for all real rules', () => {
      const config = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      for (const [, sev] of Object.entries(config)) {
        const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
        expect(severity).toBe('error')
      }
    })

    it('should have errorCount match allRules count for strict meta', () => {
      const config = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const meta = getProfileMeta('strict', config)
      expect(meta.errorCount).toBe(Object.keys(allRules).length)
      expect(meta.warningCount).toBe(0)
    })

    it('should have lenient errorCount less than moderate errorCount', () => {
      const lenientConfig = getProfileConfig(
        'lenient',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const moderateConfig = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const lenientMeta = getProfileMeta('lenient', lenientConfig)
      const moderateMeta = getProfileMeta('moderate', moderateConfig)
      expect(lenientMeta.errorCount).toBeLessThan(moderateMeta.errorCount)
    })

    it('should have moderate errorCount less than strict errorCount', () => {
      const moderateConfig = getProfileConfig(
        'moderate',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const strictConfig = getProfileConfig(
        'strict',
        allRules,
        getRuleCategory,
        (id) => allRules[id]?.meta.recommended ?? false,
      )
      const moderateMeta = getProfileMeta('moderate', moderateConfig)
      const strictMeta = getProfileMeta('strict', strictConfig)
      expect(moderateMeta.errorCount).toBeLessThan(strictMeta.errorCount)
    })
  })

  describe('determinism and consistency', () => {
    it('should produce identical lenient config on repeated calls', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v', c: 'v' }
      const config1 = getProfileConfig('lenient', rules, mockGetCategory, mockIsRecommended)
      const config2 = getProfileConfig('lenient', rules, mockGetCategory, mockIsRecommended)
      expect(config1).toEqual(config2)
    })

    it('should produce identical moderate config on repeated calls', () => {
      const rules: Record<string, string> = { a: 'v', b: 'v', c: 'v' }
      const config1 = getProfileConfig('moderate', rules, mockGetCategory, mockIsRecommended)
      const config2 = getProfileConfig('moderate', rules, mockGetCategory, mockIsRecommended)
      expect(config1).toEqual(config2)
    })

    it('should not share state between calls', () => {
      const rules1: Record<string, string> = { a: 'v' }
      const rules2: Record<string, string> = { b: 'v' }
      const config1 = getProfileConfig(
        'strict',
        rules1,
        () => 'patterns',
        () => false,
      )
      const config2 = getProfileConfig(
        'strict',
        rules2,
        () => 'patterns',
        () => false,
      )
      expect(config1).not.toHaveProperty('b')
      expect(config2).not.toHaveProperty('a')
    })

    it('should produce same meta for same config regardless of profile', () => {
      const config: RuleEnvConfig = { a: 'error', b: 'warning' }
      const meta1 = getProfileMeta('lenient', config)
      const meta2 = getProfileMeta('moderate', config)
      const meta3 = getProfileMeta('strict', config)
      expect(meta1.errorCount).toBe(meta2.errorCount)
      expect(meta2.errorCount).toBe(meta3.errorCount)
      expect(meta1.warningCount).toBe(meta2.warningCount)
      expect(meta2.warningCount).toBe(meta3.warningCount)
    })
  })

  describe('PROFILE_DESCRIPTIONS immutability checks', () => {
    it('should have descriptions that are unique across profiles', () => {
      const descs = [
        PROFILE_DESCRIPTIONS.lenient,
        PROFILE_DESCRIPTIONS.moderate,
        PROFILE_DESCRIPTIONS.strict,
      ]
      expect(new Set(descs).size).toBe(3)
    })

    it('should have descriptions without trailing whitespace', () => {
      for (const desc of Object.values(PROFILE_DESCRIPTIONS)) {
        expect(desc).toBe(desc.trim())
      }
    })

    it('should have descriptions ending with period', () => {
      for (const desc of Object.values(PROFILE_DESCRIPTIONS)) {
        expect(desc.endsWith('.')).toBe(true)
      }
    })

    it('should have descriptions longer than 10 characters', () => {
      for (const desc of Object.values(PROFILE_DESCRIPTIONS)) {
        expect(desc.length).toBeGreaterThan(10)
      }
    })

    it('should have exactly the expected property names', () => {
      const keys = Object.keys(PROFILE_DESCRIPTIONS)
      expect(keys).toContain('strict')
      expect(keys).toContain('moderate')
      expect(keys).toContain('lenient')
    })
  })

  describe('getProfileMeta name capitalization', () => {
    it('should capitalize first letter and lowercase rest for lenient', () => {
      const meta = getProfileMeta('lenient', {})
      expect(meta.name[0]).toBe('L')
      expect(meta.name.slice(1)).toBe('enient')
    })

    it('should capitalize first letter and lowercase rest for moderate', () => {
      const meta = getProfileMeta('moderate', {})
      expect(meta.name[0]).toBe('M')
      expect(meta.name.slice(1)).toBe('oderate')
    })

    it('should capitalize first letter and lowercase rest for strict', () => {
      const meta = getProfileMeta('strict', {})
      expect(meta.name[0]).toBe('S')
      expect(meta.name.slice(1)).toBe('trict')
    })

    it('should return name with only first letter capitalized', () => {
      const meta = getProfileMeta('strict', {})
      expect(meta.name).toBe(meta.name.charAt(0).toUpperCase() + meta.name.slice(1))
    })
  })

  describe('all severity values are valid', () => {
    it('should only produce error, warning, or info for lenient profile', () => {
      const config = getProfileConfig('lenient', mockRules, mockGetCategory, mockIsRecommended)
      for (const [, sev] of Object.entries(config)) {
        const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
        expect(['error', 'warning', 'info']).toContain(severity)
      }
    })

    it('should only produce error or warning for moderate profile', () => {
      const config = getProfileConfig('moderate', mockRules, mockGetCategory, mockIsRecommended)
      for (const [, sev] of Object.entries(config)) {
        const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
        expect(['error', 'warning']).toContain(severity)
      }
    })

    it('should only produce error for strict profile', () => {
      const config = getProfileConfig('strict', mockRules, mockGetCategory, mockIsRecommended)
      for (const [, sev] of Object.entries(config)) {
        const severity: RuleSeverity = Array.isArray(sev) ? sev[0] : sev
        expect(severity).toBe('error')
      }
    })
  })

  describe('cross-category lenient behavior', () => {
    it('should handle all categories correctly in lenient when all recommended', () => {
      const categories = [
        'security',
        'correctness',
        'testing',
        'patterns',
        'performance',
        'dependencies',
        'complexity',
        'style',
      ]
      for (const cat of categories) {
        const rules: Record<string, string> = { rule: 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => cat,
          () => true,
        )
        expect(['error', 'warning']).toContain(config['rule'])
      }
    })

    it('should handle all categories correctly in lenient when none recommended', () => {
      const categories = [
        'security',
        'correctness',
        'testing',
        'patterns',
        'performance',
        'dependencies',
        'complexity',
        'style',
      ]
      for (const cat of categories) {
        const rules: Record<string, string> = { 'generic-rule': 'v' }
        const config = getProfileConfig(
          'lenient',
          rules,
          () => cat,
          () => false,
        )
        expect(['error', 'info']).toContain(config['generic-rule'])
      }
    })
  })
})
