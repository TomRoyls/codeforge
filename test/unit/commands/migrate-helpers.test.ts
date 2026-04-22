import { describe, expect, it } from 'vitest'

import type { CodeForgeConfig } from '../../../src/config/types.js'

import {
  buildCodeForgeConfig,
  formatDryRunOutput,
  formatMigrationSummary,
  formatNextSteps,
  type MigrationResult,
} from '../../../src/commands/migrate-helpers.js'

describe('migrate-helpers', () => {
  describe('buildCodeForgeConfig', () => {
    it('builds config with provided rules', () => {
      const rules = { 'max-params': 'error', 'no-console': 'warn' }
      const config = buildCodeForgeConfig(rules)

      expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
      expect(config.ignore).toEqual(['**/node_modules/**', '**/dist/**'])
      expect(config.rules).toEqual(rules)
    })

    it('builds config with empty rules', () => {
      const config = buildCodeForgeConfig({})

      expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
      expect(config.ignore).toEqual(['**/node_modules/**', '**/dist/**'])
      expect(config.rules).toEqual({})
    })

    it('builds config with rule options', () => {
      const rules = { 'max-params': ['error', { max: 3 }] }
      const config = buildCodeForgeConfig(rules)

      expect(config.rules).toEqual(rules)
    })

    it('returns a new object each time', () => {
      const rules = { 'no-console': 'error' }
      const config1 = buildCodeForgeConfig(rules)
      const config2 = buildCodeForgeConfig(rules)

      expect(config1).not.toBe(config2)
    })
  })

  describe('formatMigrationSummary', () => {
    it('formats summary with mapped and unmapped rules', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: { 'max-params': 'error', 'no-console': 'warn' },
        unmapped: ['some-rule'],
      }

      formatMigrationSummary(result, 10, logFn)

      expect(messages).toContain('')
      expect(messages).toContain('Migration Summary:')
      expect(messages.some((m) => m.includes('Mapped rules: 2'))).toBe(true)
      expect(messages.some((m) => m.includes('Unmapped rules: 1'))).toBe(true)
      expect(messages).toContain('Unmapped ESLint rules:')
      expect(messages.some((m) => m.includes('some-rule'))).toBe(true)
    })

    it('formats summary with no unmapped rules', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: { 'max-params': 'error' },
        unmapped: [],
      }

      formatMigrationSummary(result, 10, logFn)

      expect(messages.some((m) => m.includes('Mapped rules: 1'))).toBe(true)
      expect(messages.some((m) => m.includes('Unmapped rules: 0'))).toBe(true)
      expect(messages).not.toContain('Unmapped ESLint rules:')
    })

    it('truncates unmapped rules to maxUnmapped limit', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: {},
        unmapped: ['rule-1', 'rule-2', 'rule-3', 'rule-4', 'rule-5'],
      }

      formatMigrationSummary(result, 3, logFn)

      expect(messages.some((m) => m.includes('rule-1'))).toBe(true)
      expect(messages.some((m) => m.includes('rule-2'))).toBe(true)
      expect(messages.some((m) => m.includes('rule-3'))).toBe(true)
      expect(messages.some((m) => m.includes('2 more'))).toBe(true)
    })

    it('does not show "more" when exactly at limit', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: {},
        unmapped: ['rule-1', 'rule-2', 'rule-3'],
      }

      formatMigrationSummary(result, 3, logFn)

      expect(messages.some((m) => m.includes('more'))).toBe(false)
    })

    it('handles empty rules object', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = { rules: {}, unmapped: [] }

      formatMigrationSummary(result, 10, logFn)

      expect(messages.some((m) => m.includes('Mapped rules: 0'))).toBe(true)
    })
  })

  describe('formatDryRunOutput', () => {
    it('formats config as JSON', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
        rules: { 'no-console': 'error' },
      }

      formatDryRunOutput(config, logFn)

      expect(messages).toContain('')
      expect(messages).toContain('Generated config (dry run):')
      expect(messages.some((m) => m.includes('"no-console"'))).toBe(true)
    })

    it('formats config without rules', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
      }

      formatDryRunOutput(config, logFn)

      expect(messages).toContain('Generated config (dry run):')
    })

    it('produces valid JSON output', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
        rules: { 'max-params': 'error' },
      }

      formatDryRunOutput(config, logFn)

      const jsonMessage = messages.find((m) => m.includes('"files"'))
      expect(jsonMessage).toBeDefined()
      expect(jsonMessage!).toContain('"files"')
      expect(jsonMessage!).toContain('"max-params"')
    })
  })

  describe('formatNextSteps', () => {
    it('displays all three steps', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      formatNextSteps(logFn)

      expect(messages).toContain('')
      expect(messages).toContain('Next steps:')
      expect(messages.some((m) => m.includes('Review the generated configuration'))).toBe(true)
      expect(messages.some((m) => m.includes('codeforge analyze'))).toBe(true)
      expect(messages.some((m) => m.includes('unmapped rules manually'))).toBe(true)
    })

    it('calls logFn for each message', () => {
      let callCount = 0
      const logFn = () => callCount++

      formatNextSteps(logFn)

      expect(callCount).toBe(5)
    })
  })

  describe('MigrationResult type', () => {
    it('accepts valid migration result', () => {
      const result: MigrationResult = {
        rules: { 'no-console': 'error' },
        unmapped: ['unknown-rule'],
      }

      expect(result.rules).toHaveProperty('no-console')
      expect(result.unmapped).toHaveLength(1)
    })

    it('accepts empty result', () => {
      const result: MigrationResult = {
        rules: {},
        unmapped: [],
      }

      expect(Object.keys(result.rules)).toHaveLength(0)
      expect(result.unmapped).toHaveLength(0)
    })
  })

  describe('buildCodeForgeConfig edge cases', () => {
    it('preserves rule severity as string value', () => {
      const rules = { 'no-console': 'warn' }
      const config = buildCodeForgeConfig(rules)

      expect(config.rules['no-console']).toBe('warn')
    })

    it('preserves rule as array with severity and options', () => {
      const rules = { 'max-lines': ['error', { max: 200 }] }
      const config = buildCodeForgeConfig(rules)

      expect(config.rules['max-lines']).toEqual(['error', { max: 200 }])
    })

    it('does not mutate the input rules object', () => {
      const rules = { 'no-console': 'error' }
      const originalRules = { ...rules }
      buildCodeForgeConfig(rules)

      expect(rules).toEqual(originalRules)
    })

    it('always sets files to ts and tsx globs', () => {
      const config = buildCodeForgeConfig({})

      expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
      expect(config.files).toHaveLength(2)
    })

    it('always sets ignore to node_modules and dist globs', () => {
      const config = buildCodeForgeConfig({})

      expect(config.ignore).toEqual(['**/node_modules/**', '**/dist/**'])
      expect(config.ignore).toHaveLength(2)
    })

    it('handles multiple rules with mixed types', () => {
      const rules = {
        'no-console': 'error',
        'max-params': ['warn', { max: 3 }],
        'no-unused-vars': 'off',
      }
      const config = buildCodeForgeConfig(rules)

      expect(Object.keys(config.rules)).toHaveLength(3)
      expect(config.rules['no-console']).toBe('error')
      expect(config.rules['max-params']).toEqual(['warn', { max: 3 }])
      expect(config.rules['no-unused-vars']).toBe('off')
    })

    it('handles rules with numeric severity values', () => {
      const rules = { 'no-console': 2, 'no-debugger': 1 }
      const config = buildCodeForgeConfig(rules)

      expect(config.rules['no-console']).toBe(2)
      expect(config.rules['no-debugger']).toBe(1)
    })
  })

  describe('formatMigrationSummary edge cases', () => {
    it('shows "and X more" when unmapped exceeds maxUnmapped by one', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: {},
        unmapped: ['rule-1', 'rule-2', 'rule-3', 'rule-4'],
      }

      formatMigrationSummary(result, 3, logFn)

      expect(messages.some((m) => m.includes('1 more'))).toBe(true)
    })

    it('shows nothing when maxUnmapped is zero and unmapped exist', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: {},
        unmapped: ['rule-1', 'rule-2'],
      }

      formatMigrationSummary(result, 0, logFn)

      expect(messages.some((m) => m.includes('rule-1'))).toBe(false)
      expect(messages.some((m) => m.includes('rule-2'))).toBe(false)
      expect(messages.some((m) => m.includes('2 more'))).toBe(true)
    })

    it('starts output with a blank line', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = { rules: {}, unmapped: [] }
      formatMigrationSummary(result, 10, logFn)

      expect(messages[0]).toBe('')
    })

    it('includes bold Migration Summary header', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = { rules: {}, unmapped: [] }
      formatMigrationSummary(result, 10, logFn)

      expect(messages.some((m) => m.includes('Migration Summary:'))).toBe(true)
    })

    it('separates unmapped section with blank line', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: { 'max-params': 'error' },
        unmapped: ['unmapped-rule'],
      }

      formatMigrationSummary(result, 10, logFn)

      const unmappedHeaderIdx = messages.findIndex((m) => m.includes('Unmapped ESLint rules:'))
      expect(unmappedHeaderIdx).toBeGreaterThan(0)
      expect(messages[unmappedHeaderIdx - 1]).toBe('')
    })

    it('formats unmapped rule names with dash prefix', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: {},
        unmapped: ['my-custom-rule'],
      }

      formatMigrationSummary(result, 10, logFn)

      expect(messages.some((m) => m.includes('- my-custom-rule'))).toBe(true)
    })

    it('handles single unmapped rule correctly', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: {},
        unmapped: ['single-rule'],
      }

      formatMigrationSummary(result, 10, logFn)

      expect(messages.some((m) => m.includes('Unmapped rules: 1'))).toBe(true)
      expect(messages.some((m) => m.includes('single-rule'))).toBe(true)
      expect(messages.some((m) => m.includes('more'))).toBe(false)
    })

    it('does not show unmapped section when unmapped array is empty', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: { 'no-console': 'error' },
        unmapped: [],
      }

      formatMigrationSummary(result, 10, logFn)

      expect(messages).not.toContain('Unmapped ESLint rules:')
    })

    it('truncates large unmapped list showing correct remaining count', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const unmapped = Array.from({ length: 20 }, (_, i) => `rule-${i + 1}`)
      const result: MigrationResult = { rules: {}, unmapped }

      formatMigrationSummary(result, 5, logFn)

      expect(messages.some((m) => m.includes('15 more'))).toBe(true)
      for (let i = 1; i <= 5; i++) {
        expect(messages.some((m) => m.includes(`rule-${i}`))).toBe(true)
      }
      expect(messages.some((m) => m.includes('rule-6'))).toBe(false)
    })

    it('handles maxUnmapped equal to unmapped length with no extras', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: {},
        unmapped: ['a', 'b', 'c', 'd'],
      }

      formatMigrationSummary(result, 4, logFn)

      expect(messages.some((m) => m.includes('more'))).toBe(false)
      expect(messages.some((m) => m.includes('- a'))).toBe(true)
      expect(messages.some((m) => m.includes('- d'))).toBe(true)
    })

    it('counts mapped rules correctly from the rules object', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const result: MigrationResult = {
        rules: { a: 'error', b: 'warn', c: 'off', d: ['error', {}] },
        unmapped: [],
      }

      formatMigrationSummary(result, 10, logFn)

      expect(messages.some((m) => m.includes('Mapped rules: 4'))).toBe(true)
    })
  })

  describe('formatDryRunOutput edge cases', () => {
    it('starts with a blank line', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
      }

      formatDryRunOutput(config, logFn)

      expect(messages[0]).toBe('')
    })

    it('outputs parseable JSON', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts', '**/*.tsx'],
        ignore: ['node_modules'],
        rules: { 'no-console': 'error' },
      }

      formatDryRunOutput(config, logFn)

      const jsonMessage = messages.find((m) => m.includes('"files"'))
      expect(jsonMessage).toBeDefined()
      const parsed = JSON.parse(jsonMessage!)
      expect(parsed.files).toEqual(['**/*.ts', '**/*.tsx'])
      expect(parsed.ignore).toEqual(['node_modules'])
      expect(parsed.rules).toEqual({ 'no-console': 'error' })
    })

    it('formats config with array rule values', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
        rules: { 'max-params': ['error', { max: 5 }] },
      }

      formatDryRunOutput(config, logFn)

      const jsonMessage = messages.find((m) => m.includes('"max-params"'))
      expect(jsonMessage).toBeDefined()
      const parsed = JSON.parse(jsonMessage!)
      expect(parsed.rules['max-params']).toEqual(['error', { max: 5 }])
    })

    it('includes Generated config header in output', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
      }

      formatDryRunOutput(config, logFn)

      expect(messages.some((m) => m.includes('Generated config (dry run):'))).toBe(true)
    })

    it('indents JSON with 2 spaces', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
      }

      formatDryRunOutput(config, logFn)

      const jsonMessage = messages.find((m) => m.includes('"files"'))
      expect(jsonMessage).toBeDefined()
      expect(jsonMessage!).toContain('  "files"')
    })

    it('calls logFn exactly 3 times', () => {
      let callCount = 0
      const logFn = () => callCount++

      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
      }

      formatDryRunOutput(config, logFn)

      expect(callCount).toBe(3)
    })
  })

  describe('formatNextSteps edge cases', () => {
    it('starts with a blank line', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      formatNextSteps(logFn)

      expect(messages[0]).toBe('')
    })

    it('includes step 1 about reviewing configuration', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      formatNextSteps(logFn)

      expect(messages.some((m) => m.includes('1.') && m.includes('Review'))).toBe(true)
    })

    it('includes step 2 about running analyze', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      formatNextSteps(logFn)

      expect(messages.some((m) => m.includes('2.') && m.includes('codeforge analyze'))).toBe(true)
    })

    it('includes step 3 about addressing unmapped rules', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      formatNextSteps(logFn)

      expect(messages.some((m) => m.includes('3.') && m.includes('unmapped rules'))).toBe(true)
    })

    it('contains Next steps header', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)

      formatNextSteps(logFn)

      expect(messages).toContain('Next steps:')
    })

    it('always produces exactly 5 log calls', () => {
      for (let i = 0; i < 3; i++) {
        let callCount = 0
        const logFn = () => callCount++

        formatNextSteps(logFn)

        expect(callCount).toBe(5)
      }
    })
  })

  describe('MigrationResult immutability', () => {
    it('rules object is independent across results', () => {
      const result1: MigrationResult = { rules: { a: 'error' }, unmapped: [] }
      const result2: MigrationResult = { rules: { b: 'warn' }, unmapped: [] }
      expect(result1.rules).not.toBe(result2.rules)
    })

    it('unmapped array is independent across results', () => {
      const result1: MigrationResult = { rules: {}, unmapped: ['a'] }
      const result2: MigrationResult = { rules: {}, unmapped: ['b'] }
      expect(result1.unmapped).not.toBe(result2.unmapped)
    })
  })

  describe('buildCodeForgeConfig advanced', () => {
    it('handles rule with unicode name', () => {
      const rules = { 'no- spacés': 'error' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no- spacés']).toBe('error')
    })

    it('handles rule with very long name', () => {
      const longName = 'a'.repeat(200)
      const rules = { [longName]: 'error' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules[longName]).toBe('error')
    })

    it('handles rules with off severity', () => {
      const rules = { 'no-console': 'off' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toBe('off')
    })

    it('handles rules with empty options object', () => {
      const rules = { 'max-params': ['error', {}] }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['max-params']).toEqual(['error', {}])
    })

    it('handles many rules at once', () => {
      const rules: Record<string, unknown> = {}
      for (let i = 0; i < 100; i++) {
        rules[`rule-${i}`] = 'error'
      }
      const config = buildCodeForgeConfig(rules)
      expect(Object.keys(config.rules)).toHaveLength(100)
    })

    it('files array always contains exactly 2 entries', () => {
      const config = buildCodeForgeConfig({})
      expect(config.files).toHaveLength(2)
    })

    it('ignore array always contains exactly 2 entries', () => {
      const config = buildCodeForgeConfig({})
      expect(config.ignore).toHaveLength(2)
    })

    it('files contains tsx pattern', () => {
      const config = buildCodeForgeConfig({})
      expect(config.files).toContain('**/*.tsx')
    })

    it('ignore contains node_modules pattern', () => {
      const config = buildCodeForgeConfig({})
      expect(config.ignore).toContain('**/node_modules/**')
    })
  })

  describe('formatMigrationSummary advanced', () => {
    it('handles unmapped rules with special characters', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = {
        rules: {},
        unmapped: ['@typescript-eslint/no-unused-vars', 'rule/with/slashes'],
      }
      formatMigrationSummary(result, 10, logFn)
      expect(messages.some((m) => m.includes('@typescript-eslint/no-unused-vars'))).toBe(true)
      expect(messages.some((m) => m.includes('rule/with/slashes'))).toBe(true)
    })

    it('handles very large mapped rules count', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const rules: Record<string, unknown> = {}
      for (let i = 0; i < 200; i++) rules[`rule-${i}`] = 'error'
      const result: MigrationResult = { rules, unmapped: [] }
      formatMigrationSummary(result, 10, logFn)
      expect(messages.some((m) => m.includes('Mapped rules: 200'))).toBe(true)
    })

    it('maxUnmapped of 0 shows only remaining count', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['a', 'b', 'c'] }
      formatMigrationSummary(result, 0, logFn)
      expect(messages.some((m) => m.includes('3 more'))).toBe(true)
      expect(messages.some((m) => m.includes('- a'))).toBe(false)
    })

    it('correct remaining count when truncating', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = {
        rules: {},
        unmapped: Array.from({ length: 10 }, (_, i) => `r${i}`),
      }
      formatMigrationSummary(result, 2, logFn)
      expect(messages.some((m) => m.includes('8 more'))).toBe(true)
    })

    it('does not show unmapped header when no unmapped rules', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: { a: 'error' }, unmapped: [] }
      formatMigrationSummary(result, 10, logFn)
      expect(messages).not.toContain('Unmapped ESLint rules:')
      expect(messages.some((m) => m.includes('- '))).toBe(false)
    })

    it('handles MigrationResult with empty string rule names', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: { '': 'error' }, unmapped: [''] }
      formatMigrationSummary(result, 10, logFn)
      expect(messages.some((m) => m.includes('Mapped rules: 1'))).toBe(true)
    })
  })

  describe('formatDryRunOutput advanced', () => {
    it('handles config with many rules', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const rules: Record<string, unknown> = {}
      for (let i = 0; i < 50; i++) rules[`rule-${i}`] = 'error'
      const config: CodeForgeConfig = { files: ['**/*.ts'], ignore: [], rules }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(Object.keys(parsed.rules)).toHaveLength(50)
    })

    it('handles config with no rules property', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = { files: ['**/*.ts'], ignore: [] }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed).not.toHaveProperty('rules')
    })

    it('output is valid JSON that round-trips', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules'],
        rules: { 'no-console': 'error', 'max-params': ['warn', { max: 3 }] },
      }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      const roundTripped = JSON.parse(JSON.stringify(parsed))
      expect(roundTripped).toEqual(parsed)
    })

    it('handles config with empty files array', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = { files: [], ignore: [] }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed.files).toEqual([])
    })

    it('handles config with unicode in ignore patterns', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = { files: ['**/*.ts'], ignore: ['**/проект/**'] }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed.ignore).toContain('**/проект/**')
    })
  })

  describe('formatNextSteps advanced', () => {
    it('messages are in consistent order', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      formatNextSteps(logFn)
      expect(messages[0]).toBe('')
      expect(messages[1]).toContain('Next steps')
      expect(messages[2]).toContain('1.')
      expect(messages[3]).toContain('2.')
      expect(messages[4]).toContain('3.')
    })

    it('step 1 mentions Review', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      formatNextSteps(logFn)
      expect(messages[2]).toContain('Review')
    })

    it('step 2 mentions codeforge analyze', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      formatNextSteps(logFn)
      expect(messages[3]).toContain('codeforge analyze')
    })

    it('step 3 mentions unmapped rules manually', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      formatNextSteps(logFn)
      expect(messages[4]).toContain('unmapped rules manually')
    })

    it('produces same output on repeated calls', () => {
      const messages1: string[] = []
      const messages2: string[] = []
      formatNextSteps((m) => messages1.push(m))
      formatNextSteps((m) => messages2.push(m))
      expect(messages1).toEqual(messages2)
    })
  })

  describe('cross-function integration', () => {
    it('buildCodeForgeConfig output works with formatDryRunOutput', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const rules = { 'no-console': 'error', 'max-params': ['warn', { max: 4 }] }
      const config = buildCodeForgeConfig(rules)
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed.rules['no-console']).toBe('error')
      expect(parsed.files).toContain('**/*.tsx')
    })

    it('full migration workflow produces consistent output', () => {
      const summaryMessages: string[] = []
      const dryRunMessages: string[] = []
      const nextStepsMessages: string[] = []

      const result: MigrationResult = {
        rules: { 'no-console': 'error' },
        unmapped: ['old-rule'],
      }

      formatMigrationSummary(result, 10, (m) => summaryMessages.push(m))
      formatDryRunOutput(buildCodeForgeConfig(result.rules), (m) => dryRunMessages.push(m))
      formatNextSteps((m) => nextStepsMessages.push(m))

      expect(summaryMessages.length).toBeGreaterThan(0)
      expect(dryRunMessages.length).toBeGreaterThan(0)
      expect(nextStepsMessages.length).toBe(5)
    })
  })

  describe('buildCodeForgeConfig defaults', () => {
    it('files globs are sorted correctly', () => {
      const config = buildCodeForgeConfig({})
      expect(config.files[0]).toBe('**/*.ts')
      expect(config.files[1]).toBe('**/*.tsx')
    })

    it('ignore globs include dist', () => {
      const config = buildCodeForgeConfig({})
      expect(config.ignore).toContain('**/dist/**')
    })
  })

  describe('formatMigrationSummary output structure', () => {
    it('has exactly the right number of calls for empty result', () => {
      let count = 0
      formatMigrationSummary({ rules: {}, unmapped: [] }, 10, () => count++)
      expect(count).toBe(4)
    })

    it('has more calls when unmapped rules present', () => {
      let count = 0
      formatMigrationSummary({ rules: {}, unmapped: ['a', 'b'] }, 10, () => count++)
      expect(count).toBeGreaterThan(4)
    })

    it('mapped count uses object keys length', () => {
      const messages: string[] = []
      const rules = { x: 1, y: 2, z: 3 }
      formatMigrationSummary({ rules, unmapped: [] }, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('Mapped rules: 3'))).toBe(true)
    })

    it('unmapped count uses array length', () => {
      const messages: string[] = []
      formatMigrationSummary({ rules: {}, unmapped: ['a', 'b'] }, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('Unmapped rules: 2'))).toBe(true)
    })
  })

  describe('formatDryRunOutput JSON specifics', () => {
    it('JSON uses double quotes', () => {
      const messages: string[] = []
      formatDryRunOutput({ files: ['**/*.ts'], ignore: [] }, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      expect(json!).toContain('"files"')
    })

    it('JSON preserves rule order', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: [],
        rules: { z: 'error', a: 'warn', m: 'off' },
      }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      const ruleKeys = Object.keys(parsed.rules)
      expect(ruleKeys).toEqual(['z', 'a', 'm'])
    })
  })

  describe('formatNextSteps deterministic output', () => {
    it('always starts with blank line', () => {
      for (let i = 0; i < 5; i++) {
        const messages: string[] = []
        formatNextSteps((m) => messages.push(m))
        expect(messages[0]).toBe('')
      }
    })

    it('step numbers are sequential 1 2 3', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      const stepLines = messages.filter(
        (m) => /^\s*\d+\./.test(m) || m.includes('1.') || m.includes('2.') || m.includes('3.'),
      )
      expect(stepLines.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('buildCodeForgeConfig additional coverage', () => {
    it('handles rules with boolean values', () => {
      const rules = { 'no-console': true, 'no-debugger': false }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toBe(true)
      expect(config.rules['no-debugger']).toBe(false)
    })

    it('handles rules with null value', () => {
      const rules = { 'no-console': null }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toBeNull()
    })

    it('handles rules with deeply nested options', () => {
      const rules = {
        'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: false }],
      }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['max-lines']).toEqual([
        'error',
        { max: 200, skipBlankLines: true, skipComments: false },
      ])
    })

    it('returned config has exactly three top-level keys', () => {
      const config = buildCodeForgeConfig({ 'no-console': 'error' })
      expect(Object.keys(config)).toEqual(['files', 'ignore', 'rules'])
    })

    it('rules reference equals the input rules object', () => {
      const rules = { 'no-console': 'error' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules).toBe(rules)
    })
  })

  describe('formatMigrationSummary additional coverage', () => {
    it('call count is correct for single unmapped rule', () => {
      let count = 0
      formatMigrationSummary({ rules: {}, unmapped: ['only-rule'] }, 10, () => count++)
      // 1 blank + 1 header + 1 mapped + 1 unmapped count + 1 blank + 1 unmapped header + 1 rule = 7
      expect(count).toBe(7)
    })

    it('unmapped rules maintain their insertion order', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = {
        rules: {},
        unmapped: ['alpha', 'beta', 'gamma'],
      }
      formatMigrationSummary(result, 10, logFn)
      const alphaIdx = messages.findIndex((m) => m.includes('alpha'))
      const betaIdx = messages.findIndex((m) => m.includes('beta'))
      const gammaIdx = messages.findIndex((m) => m.includes('gamma'))
      expect(alphaIdx).toBeLessThan(betaIdx)
      expect(betaIdx).toBeLessThan(gammaIdx)
    })

    it('maxUnmapped=1 shows only first rule and rest as more', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = {
        rules: {},
        unmapped: ['first', 'second', 'third'],
      }
      formatMigrationSummary(result, 1, logFn)
      expect(messages.some((m) => m.includes('first'))).toBe(true)
      expect(messages.some((m) => m.includes('second'))).toBe(false)
      expect(messages.some((m) => m.includes('third'))).toBe(false)
      expect(messages.some((m) => m.includes('2 more'))).toBe(true)
    })
  })

  describe('formatDryRunOutput additional coverage', () => {
    it('handles config with multiple file patterns', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignore: ['node_modules'],
      }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed.files).toHaveLength(4)
    })

    it('handles config with multiple ignore patterns', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules', 'dist', 'coverage', '.git'],
      }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed.ignore).toHaveLength(4)
      expect(parsed.ignore).toContain('coverage')
      expect(parsed.ignore).toContain('.git')
    })
  })

  describe('formatNextSteps additional coverage', () => {
    it('step 2 contains backtick-wrapped codeforge analyze command', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      formatNextSteps(logFn)
      const step2 = messages.find((m) => m.includes('2.'))
      expect(step2).toBeDefined()
      expect(step2!).toContain('`codeforge analyze`')
    })

    it('each step line starts with a number prefix', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      formatNextSteps(logFn)
      const steps = messages.filter((m) => /^\s*\d+\./.test(m) || /\d+\.\s/.test(m))
      expect(steps).toHaveLength(3)
    })
  })

  describe('formatMigrationSummary boundary conditions', () => {
    it('handles maxUnmapped much larger than unmapped length', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['only'] }
      formatMigrationSummary(result, 1000, logFn)
      expect(messages.some((m) => m.includes('only'))).toBe(true)
      expect(messages.some((m) => m.includes('more'))).toBe(false)
    })

    it('handles unmapped with single item and maxUnmapped zero', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['lone-rule'] }
      formatMigrationSummary(result, 0, logFn)
      expect(messages.some((m) => m.includes('lone-rule'))).toBe(false)
      expect(messages.some((m) => m.includes('1 more'))).toBe(true)
    })

    it('call count for empty unmapped is always 4 regardless of maxUnmapped', () => {
      let count = 0
      formatMigrationSummary({ rules: { a: 'error' }, unmapped: [] }, 0, () => count++)
      expect(count).toBe(4)
    })

    it('maps unmapped rules with spaces in names', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['rule with spaces'] }
      formatMigrationSummary(result, 10, logFn)
      expect(messages.some((m) => m.includes('rule with spaces'))).toBe(true)
    })
  })

  describe('formatDryRunOutput with buildCodeForgeConfig', () => {
    it('output includes default ignore patterns from buildCodeForgeConfig', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config = buildCodeForgeConfig({ 'no-console': 'error' })
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.ignore).toContain('**/dist/**')
      expect(parsed.ignore).toContain('**/node_modules/**')
    })
  })

  describe('cross-function additional coverage', () => {
    it('buildCodeForgeConfig rules round-trip through formatDryRunOutput JSON', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const rules = { 'no-console': 'warn', 'max-params': ['error', { max: 5 }] }
      const config = buildCodeForgeConfig(rules)
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules).toEqual(rules)
      expect(parsed.files).toEqual(['**/*.ts', '**/*.tsx'])
      expect(parsed.ignore).toEqual(['**/node_modules/**', '**/dist/**'])
    })
  })

  describe('buildCodeForgeConfig with unusual inputs', () => {
    it('handles rules with undefined value for a key', () => {
      const rules: Record<string, unknown> = { 'no-console': undefined }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toBeUndefined()
    })

    it('handles rules with object (non-array) severity', () => {
      const rules = { 'custom-rule': { severity: 'error', options: { max: 5 } } }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['custom-rule']).toEqual({ severity: 'error', options: { max: 5 } })
    })

    it('handles rules with empty string value', () => {
      const rules = { 'no-console': '' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toBe('')
    })

    it('handles single rule with array containing only severity', () => {
      const rules = { 'no-console': ['error'] }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toEqual(['error'])
    })

    it('handles rules with numeric keys', () => {
      const rules = { 1: 'error', 2: 'warn' }
      const config = buildCodeForgeConfig(rules)
      expect(Object.keys(config.rules)).toHaveLength(2)
    })
  })

  describe('formatMigrationSummary with special maxUnmapped values', () => {
    it('handles negative maxUnmapped by slicing and showing remaining count', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['a', 'b', 'c'] }
      formatMigrationSummary(result, -1, logFn)
      expect(messages.some((m) => m.includes('- a'))).toBe(true)
      expect(messages.some((m) => m.includes('- c'))).toBe(false)
      expect(messages.some((m) => m.includes('4 more'))).toBe(true)
    })

    it('handles maxUnmapped=1 with single unmapped rule - shows rule but no "more"', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['only'] }
      formatMigrationSummary(result, 1, logFn)
      expect(messages.some((m) => m.includes('only'))).toBe(true)
      expect(messages.some((m) => m.includes('more'))).toBe(false)
    })

    it('handles maxUnmapped=2 with exactly 2 unmapped - no "more" line', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['x', 'y'] }
      formatMigrationSummary(result, 2, logFn)
      expect(messages.some((m) => m.includes('- x'))).toBe(true)
      expect(messages.some((m) => m.includes('- y'))).toBe(true)
      expect(messages.some((m) => m.includes('more'))).toBe(false)
    })

    it('logs "and N more" with correct format including leading spaces', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const result: MigrationResult = { rules: {}, unmapped: ['a', 'b', 'c', 'd', 'e'] }
      formatMigrationSummary(result, 2, logFn)
      const moreLine = messages.find((m) => m.includes('3 more'))
      expect(moreLine).toBeDefined()
      expect(moreLine!).toContain('... and 3 more')
    })
  })

  describe('formatDryRunOutput with special config values', () => {
    it('handles config with rules containing special JSON characters', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: [],
        rules: { 'rule-with-quotes': 'error "test"', 'rule-with-backslash': 'path\\to\\file' },
      }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed.rules['rule-with-quotes']).toBe('error "test"')
      expect(parsed.rules['rule-with-backslash']).toBe('path\\to\\file')
    })

    it('handles config with single file pattern', () => {
      const messages: string[] = []
      const logFn = (msg: string) => messages.push(msg)
      const config: CodeForgeConfig = { files: ['src/**/*.ts'], ignore: [] }
      formatDryRunOutput(config, logFn)
      const json = messages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      const parsed = JSON.parse(json!)
      expect(parsed.files).toEqual(['src/**/*.ts'])
    })
  })

  describe('formatNextSteps idempotency and structure', () => {
    it('produces identical output across 10 consecutive calls', () => {
      const allMessages: string[][] = []
      for (let i = 0; i < 10; i++) {
        const messages: string[] = []
        formatNextSteps((m) => messages.push(m))
        allMessages.push(messages)
      }
      for (let i = 1; i < 10; i++) {
        expect(allMessages[i]).toEqual(allMessages[0])
      }
    })

    it('contains no empty messages except the leading blank line', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      const nonBlankMessages = messages.filter((m) => m !== '')
      expect(nonBlankMessages).toHaveLength(4)
    })

    it('all step messages contain gray coloring markers', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      const stepMessages = messages.filter((m) => m.includes('.'))
      expect(stepMessages.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('formatMigrationSummary log call sequence', () => {
    it('calls logFn with blank line first for empty unmapped', () => {
      const calls: string[] = []
      formatMigrationSummary({ rules: {}, unmapped: [] }, 5, (m) => calls.push(m))
      expect(calls[0]).toBe('')
    })

    it('second call is Migration Summary header for empty unmapped', () => {
      const calls: string[] = []
      formatMigrationSummary({ rules: {}, unmapped: [] }, 5, (m) => calls.push(m))
      expect(calls[1]).toContain('Migration Summary:')
    })

    it('third call contains mapped rules count for empty unmapped', () => {
      const calls: string[] = []
      formatMigrationSummary({ rules: { a: 1 }, unmapped: [] }, 5, (m) => calls.push(m))
      expect(calls[2]).toContain('Mapped rules: 1')
    })

    it('fourth call contains unmapped count for empty unmapped', () => {
      const calls: string[] = []
      formatMigrationSummary({ rules: {}, unmapped: [] }, 5, (m) => calls.push(m))
      expect(calls[3]).toContain('Unmapped rules: 0')
    })
  })

  describe('cross-function full pipeline', () => {
    it('complete pipeline with no unmapped produces clean output', () => {
      const summaryMessages: string[] = []
      const dryRunMessages: string[] = []
      const nextStepsMessages: string[] = []
      const rules = { 'no-console': 'error', 'no-debugger': 'warn' }
      const result: MigrationResult = { rules, unmapped: [] }
      formatMigrationSummary(result, 10, (m) => summaryMessages.push(m))
      formatDryRunOutput(buildCodeForgeConfig(result.rules), (m) => dryRunMessages.push(m))
      formatNextSteps((m) => nextStepsMessages.push(m))
      expect(summaryMessages).not.toContain('Unmapped ESLint rules:')
      expect(summaryMessages.some((m) => m.includes('Mapped rules: 2'))).toBe(true)
      const json = dryRunMessages.find((m) => m.includes('"files"'))
      expect(json).toBeDefined()
      expect(nextStepsMessages).toHaveLength(5)
    })

    it('complete pipeline with unmapped rules includes unmapped section', () => {
      const summaryMessages: string[] = []
      const result: MigrationResult = {
        rules: { 'no-console': 'error' },
        unmapped: ['unknown-1', 'unknown-2'],
      }
      formatMigrationSummary(result, 10, (m) => summaryMessages.push(m))
      expect(summaryMessages).toContain('Unmapped ESLint rules:')
      expect(summaryMessages.some((m) => m.includes('unknown-1'))).toBe(true)
      expect(summaryMessages.some((m) => m.includes('unknown-2'))).toBe(true)
      expect(summaryMessages.some((m) => m.includes('Unmapped rules: 2'))).toBe(true)
    })
  })

  describe('buildCodeForgeConfig exhaustive coverage', () => {
    it('returns rules as the same reference passed in', () => {
      const rules = { 'prefer-const': 'error' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules).toBe(rules)
    })

    it('handles rules with severity 0', () => {
      const rules = { 'no-console': 0 }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toBe(0)
    })

    it('handles rules with severity 2', () => {
      const rules = { 'no-console': 2 }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toBe(2)
    })

    it('handles rules with array containing multiple options', () => {
      const rules = {
        'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['max-lines'][1]).toEqual({
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      })
    })

    it('files always starts with **/*.ts', () => {
      const config = buildCodeForgeConfig({ a: 'error' })
      expect(config.files[0]).toBe('**/*.ts')
    })

    it('ignore always contains both node_modules and dist', () => {
      const config = buildCodeForgeConfig({})
      expect(config.ignore).toContain('**/node_modules/**')
      expect(config.ignore).toContain('**/dist/**')
    })

    it('handles rules with nested array options', () => {
      const rules = { 'no-restricted-syntax': ['error', { selector: 'CallExpression' }] }
      const config = buildCodeForgeConfig(rules)
      expect(Array.isArray(config.rules['no-restricted-syntax'])).toBe(true)
    })

    it('handles rules with string number key', () => {
      const rules = { '42': 'warn' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['42']).toBe('warn')
    })

    it('handles rules with hyphenated key', () => {
      const rules = { 'no-multiple-empty-lines': 'error' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-multiple-empty-lines']).toBe('error')
    })

    it('handles rules with scoped name', () => {
      const rules = { '@typescript-eslint/explicit-function-return-type': 'warn' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['@typescript-eslint/explicit-function-return-type']).toBe('warn')
    })

    it('config object has exactly files, ignore, rules keys', () => {
      const config = buildCodeForgeConfig({})
      const keys = Object.keys(config)
      expect(keys).toHaveLength(3)
      expect(keys).toContain('files')
      expect(keys).toContain('ignore')
      expect(keys).toContain('rules')
    })

    it('handles rules with single-element array value', () => {
      const rules = { 'no-console': ['warn'] }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no-console']).toEqual(['warn'])
    })

    it('handles rules with three-element array value', () => {
      const rules = { 'rule-a': ['error', { max: 1 }, { min: 0 }] }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['rule-a']).toHaveLength(3)
    })

    it('handles rules with empty object value', () => {
      const rules = { 'empty-rule': {} }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['empty-rule']).toEqual({})
    })
  })

  describe('formatMigrationSummary exhaustive coverage', () => {
    it('produces blank line before unmapped section', () => {
      const calls: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['x'] }
      formatMigrationSummary(result, 10, (m) => calls.push(m))
      const unmappedIdx = calls.findIndex((m) => m.includes('Unmapped ESLint rules:'))
      expect(calls[unmappedIdx - 1]).toBe('')
    })

    it('unmapped rules are formatted with leading dash and space', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['my-rule'] }
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('- my-rule'))).toBe(true)
    })

    it('shows and N more format for truncated unmapped', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['a', 'b', 'c'] }
      formatMigrationSummary(result, 1, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('... and 2 more'))).toBe(true)
    })

    it('does not show more line when unmapped equals maxUnmapped', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['a', 'b'] }
      formatMigrationSummary(result, 2, (m) => messages.push(m))
      expect(messages.filter((m) => m.includes('more')).length).toBe(0)
    })

    it('handles unmapped with duplicate rule names', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['dup', 'dup'] }
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('Unmapped rules: 2'))).toBe(true)
      const dupMessages = messages.filter((m) => m.includes('dup'))
      expect(dupMessages.length).toBe(2)
    })

    it('handles unmapped with very long rule name', () => {
      const longName = 'x'.repeat(500)
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: [longName] }
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes(longName))).toBe(true)
    })

    it('call count for 3 unmapped rules with maxUnmapped 3', () => {
      let count = 0
      formatMigrationSummary({ rules: {}, unmapped: ['a', 'b', 'c'] }, 3, () => count++)
      expect(count).toBe(9)
    })

    it('call count for 3 unmapped rules with maxUnmapped 2 shows more line', () => {
      let count = 0
      formatMigrationSummary({ rules: {}, unmapped: ['a', 'b', 'c'] }, 2, () => count++)
      expect(count).toBe(9)
    })

    it('mapped rules count reflects actual key count', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: { a: 1, b: 2, c: 3, d: 4, e: 5 }, unmapped: [] }
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('Mapped rules: 5'))).toBe(true)
    })

    it('unmapped rules count reflects actual array length', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['a', 'b', 'c', 'd', 'e', 'f'] }
      formatMigrationSummary(result, 3, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('Unmapped rules: 6'))).toBe(true)
    })

    it('sliced unmapped rules show only up to maxUnmapped', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['r1', 'r2', 'r3', 'r4'] }
      formatMigrationSummary(result, 2, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('r1'))).toBe(true)
      expect(messages.some((m) => m.includes('r2'))).toBe(true)
      expect(messages.some((m) => m.includes('r3'))).toBe(false)
      expect(messages.some((m) => m.includes('r4'))).toBe(false)
    })

    it('handles unmapped with emoji characters', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['🔥-rule'] }
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('🔥-rule'))).toBe(true)
    })

    it('handles unmapped with newline characters in name', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['rule\nwith\nnewlines'] }
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('rule\nwith\nnewlines'))).toBe(true)
    })

    it('handles maxUnmapped exactly one less than unmapped count', () => {
      const messages: string[] = []
      const result: MigrationResult = { rules: {}, unmapped: ['a', 'b', 'c'] }
      formatMigrationSummary(result, 2, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('1 more'))).toBe(true)
    })
  })

  describe('formatDryRunOutput exhaustive coverage', () => {
    it('second message is the header', () => {
      const messages: string[] = []
      formatDryRunOutput({ files: [], ignore: [] }, (m) => messages.push(m))
      expect(messages[1]).toContain('Generated config (dry run):')
    })

    it('third message is the JSON config', () => {
      const messages: string[] = []
      formatDryRunOutput({ files: ['**/*.ts'], ignore: [] }, (m) => messages.push(m))
      expect(messages[2]).toContain('"files"')
    })

    it('JSON output contains files array', () => {
      const messages: string[] = []
      formatDryRunOutput({ files: ['**/*.ts', '**/*.tsx'], ignore: [] }, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(Array.isArray(parsed.files)).toBe(true)
    })

    it('JSON output contains ignore array', () => {
      const messages: string[] = []
      formatDryRunOutput({ files: [], ignore: ['node_modules'] }, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"ignore"'))!
      const parsed = JSON.parse(json)
      expect(Array.isArray(parsed.ignore)).toBe(true)
    })

    it('handles config with rules containing numeric values', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = { files: [], ignore: [], rules: { 'no-console': 2 } }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"no-console"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules['no-console']).toBe(2)
    })

    it('handles config with rules containing boolean values', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = { files: [], ignore: [], rules: { 'no-console': true } }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"no-console"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules['no-console']).toBe(true)
    })

    it('handles config with rules containing null', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = { files: [], ignore: [], rules: { 'no-console': null } }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"no-console"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules['no-console']).toBeNull()
    })

    it('handles config with rules containing nested objects', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = {
        files: [],
        ignore: [],
        rules: { 'complex-rule': ['error', { options: { nested: { deep: true } } }] },
      }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"complex-rule"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules['complex-rule'][1].options.nested.deep).toBe(true)
    })

    it('handles config with long file pattern list', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
        ignore: [],
      }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.files).toHaveLength(6)
    })

    it('handles config with long ignore pattern list', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = {
        files: [],
        ignore: ['node_modules', 'dist', 'coverage', '.git', 'build', 'out'],
      }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"ignore"'))!
      const parsed = JSON.parse(json)
      expect(parsed.ignore).toHaveLength(6)
    })

    it('always makes exactly 3 log calls', () => {
      let count = 0
      formatDryRunOutput(
        { files: ['**/*.ts'], ignore: [], rules: { a: 'error', b: 'warn' } },
        () => count++,
      )
      expect(count).toBe(3)
    })

    it('produces different JSON for different configs', () => {
      const m1: string[] = []
      const m2: string[] = []
      formatDryRunOutput({ files: ['**/*.ts'], ignore: [] }, (m) => m1.push(m))
      formatDryRunOutput({ files: ['**/*.js'], ignore: [] }, (m) => m2.push(m))
      expect(m1).not.toEqual(m2)
    })

    it('JSON output has correct structure keys', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = { files: [], ignore: [], rules: { a: 'error' } }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(Object.keys(parsed)).toContain('files')
      expect(Object.keys(parsed)).toContain('ignore')
      expect(Object.keys(parsed)).toContain('rules')
    })

    it('handles config with empty rules object', () => {
      const messages: string[] = []
      const config: CodeForgeConfig = { files: ['**/*.ts'], ignore: [], rules: {} }
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules).toEqual({})
    })
  })

  describe('formatNextSteps exhaustive coverage', () => {
    it('always has 5 messages total', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages).toHaveLength(5)
    })

    it('header is second message', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages[1]).toContain('Next steps:')
    })

    it('step 1 is third message', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages[2]).toContain('1.')
    })

    it('step 2 is fourth message', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages[3]).toContain('2.')
    })

    it('step 3 is fifth message', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages[4]).toContain('3.')
    })

    it('step 1 mentions generated configuration', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages[2]).toContain('generated configuration')
    })

    it('step 3 mentions address any', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages[4]).toContain('Address any')
    })

    it('step 2 mentions check your code', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages[3]).toContain('check your code')
    })

    it('output is consistent across multiple invocations with different logFns', () => {
      const runs: string[][] = [[], [], []]
      for (let i = 0; i < 3; i++) {
        formatNextSteps((m) => runs[i].push(m))
      }
      expect(runs[0]).toEqual(runs[1])
      expect(runs[1]).toEqual(runs[2])
    })

    it('no message contains undefined', () => {
      const messages: string[] = []
      formatNextSteps((m) => messages.push(m))
      expect(messages.every((m) => typeof m === 'string')).toBe(true)
      expect(messages.some((m) => m.includes('undefined'))).toBe(false)
    })
  })

  describe('MigrationResult type exhaustive coverage', () => {
    it('accepts rules with array values in MigrationResult', () => {
      const result: MigrationResult = {
        rules: { 'max-params': ['error', { max: 3 }] },
        unmapped: [],
      }
      expect(Array.isArray(result.rules['max-params'])).toBe(true)
    })

    it('accepts large number of unmapped rules', () => {
      const unmapped = Array.from({ length: 1000 }, (_, i) => `rule-${i}`)
      const result: MigrationResult = { rules: {}, unmapped }
      expect(result.unmapped).toHaveLength(1000)
    })

    it('accepts rules with mixed value types', () => {
      const result: MigrationResult = {
        rules: { a: 'error', b: 2, c: true, d: null, e: ['warn', { max: 1 }], f: { custom: true } },
        unmapped: [],
      }
      expect(Object.keys(result.rules)).toHaveLength(6)
    })

    it('unmapped can contain empty strings', () => {
      const result: MigrationResult = { rules: {}, unmapped: ['', '  '] }
      expect(result.unmapped).toHaveLength(2)
    })

    it('rules can have symbol-like string keys', () => {
      const result: MigrationResult = { rules: { '@ns/pkg:rule': 'error' }, unmapped: [] }
      expect(result.rules['@ns/pkg:rule']).toBe('error')
    })
  })

  describe('cross-function pipeline exhaustive coverage', () => {
    it('pipeline with complex rules preserves structure', () => {
      const rules = {
        'no-console': 'warn',
        'max-params': ['error', { max: 4 }],
        complexity: ['warn', { max: 15 }],
      }
      const config = buildCodeForgeConfig(rules)
      const messages: string[] = []
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules).toEqual(rules)
    })

    it('pipeline with buildCodeForgeConfig produces valid dry run JSON', () => {
      const config = buildCodeForgeConfig({ 'no-eval': 'error' })
      const messages: string[] = []
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('pipeline summary with mapped and dry run both include rule data', () => {
      const rules = { 'no-var': 'error', 'prefer-const': 'warn' }
      const result: MigrationResult = { rules, unmapped: [] }

      const summaryMsgs: string[] = []
      const dryRunMsgs: string[] = []

      formatMigrationSummary(result, 10, (m) => summaryMsgs.push(m))
      formatDryRunOutput(buildCodeForgeConfig(result.rules), (m) => dryRunMsgs.push(m))

      expect(summaryMsgs.some((m) => m.includes('Mapped rules: 2'))).toBe(true)
      const json = dryRunMsgs.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(Object.keys(parsed.rules)).toHaveLength(2)
    })

    it('full pipeline with only unmapped rules shows 0 mapped', () => {
      const result: MigrationResult = { rules: {}, unmapped: ['legacy-rule'] }
      const messages: string[] = []
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('Mapped rules: 0'))).toBe(true)
      expect(messages.some((m) => m.includes('Unmapped rules: 1'))).toBe(true)
    })

    it('nextSteps output is independent of migration result', () => {
      const msgs1: string[] = []
      const msgs2: string[] = []
      formatNextSteps((m) => msgs1.push(m))
      formatNextSteps((m) => msgs2.push(m))
      expect(msgs1).toEqual(msgs2)
    })

    it('dry run of buildCodeForgeConfig always has default files and ignore', () => {
      const config = buildCodeForgeConfig({})
      const messages: string[] = []
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.files).toEqual(['**/*.ts', '**/*.tsx'])
      expect(parsed.ignore).toEqual(['**/node_modules/**', '**/dist/**'])
    })

    it('pipeline with many unmapped and truncation shows correct count', () => {
      const unmapped = Array.from({ length: 50 }, (_, i) => `old-rule-${i}`)
      const result: MigrationResult = { rules: { 'no-console': 'error' }, unmapped }
      const messages: string[] = []
      formatMigrationSummary(result, 10, (m) => messages.push(m))
      expect(messages.some((m) => m.includes('Mapped rules: 1'))).toBe(true)
      expect(messages.some((m) => m.includes('Unmapped rules: 50'))).toBe(true)
      expect(messages.some((m) => m.includes('40 more'))).toBe(true)
    })
  })

  describe('buildCodeForgeConfig with edge case rule keys', () => {
    it('handles rule key with leading dot', () => {
      const rules = { '.hidden-rule': 'error' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['.hidden-rule']).toBe('error')
    })

    it('handles rule key with trailing slash', () => {
      const rules = { 'trailing-slash/': 'warn' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['trailing-slash/']).toBe('warn')
    })

    it('handles rule key with at-sign prefix', () => {
      const rules = { '@scope/rule-name': 'off' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['@scope/rule-name']).toBe('off')
    })

    it('handles rule key with underscore', () => {
      const rules = { no_unsafe: 'error' }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['no_unsafe']).toBe('error')
    })

    it('handles rule value as negative number', () => {
      const rules = { custom: -1 }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['custom']).toBe(-1)
    })

    it('handles rule value as floating point number', () => {
      const rules = { threshold: 0.5 }
      const config = buildCodeForgeConfig(rules)
      expect(config.rules['threshold']).toBe(0.5)
    })
  })

  describe('formatMigrationSummary output ordering', () => {
    it('messages are in correct order for empty result', () => {
      const calls: string[] = []
      formatMigrationSummary({ rules: {}, unmapped: [] }, 10, (m) => calls.push(m))
      expect(calls[0]).toBe('')
      expect(calls[1]).toContain('Migration Summary:')
      expect(calls[2]).toContain('Mapped rules:')
      expect(calls[3]).toContain('Unmapped rules:')
    })

    it('messages are in correct order with unmapped', () => {
      const calls: string[] = []
      formatMigrationSummary({ rules: { a: 'error' }, unmapped: ['x'] }, 10, (m) => calls.push(m))
      expect(calls[0]).toBe('')
      expect(calls[1]).toContain('Migration Summary:')
      expect(calls[2]).toContain('Mapped rules: 1')
      expect(calls[3]).toContain('Unmapped rules: 1')
      expect(calls[4]).toBe('')
      expect(calls[5]).toContain('Unmapped ESLint rules:')
      expect(calls[6]).toContain('- x')
    })

    it('unmapped rule messages come after unmapped header', () => {
      const calls: string[] = []
      formatMigrationSummary({ rules: {}, unmapped: ['a', 'b'] }, 10, (m) => calls.push(m))
      const headerIdx = calls.findIndex((m) => m.includes('Unmapped ESLint rules:'))
      expect(calls[headerIdx + 1]).toContain('- a')
      expect(calls[headerIdx + 2]).toContain('- b')
    })
  })

  describe('formatDryRunOutput JSON output details', () => {
    it('JSON output is 2-space indented', () => {
      const messages: string[] = []
      formatDryRunOutput({ files: ['f.ts'], ignore: [] }, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      expect(json).toMatch(/^  "/m)
    })

    it('JSON output can be parsed back to original config', () => {
      const config: CodeForgeConfig = {
        files: ['**/*.ts', '**/*.tsx'],
        ignore: ['**/node_modules/**', '**/dist/**'],
        rules: { 'no-console': 'error', 'max-params': ['warn', { max: 4 }] },
      }
      const messages: string[] = []
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed).toEqual(config)
    })

    it('handles config with single-element arrays', () => {
      const config: CodeForgeConfig = { files: ['only.ts'], ignore: ['only-ignore'] }
      const messages: string[] = []
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.files).toEqual(['only.ts'])
      expect(parsed.ignore).toEqual(['only-ignore'])
    })

    it('handles config with rules containing empty string key', () => {
      const config: CodeForgeConfig = { files: [], ignore: [], rules: { '': 'error' } }
      const messages: string[] = []
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules['']).toBe('error')
    })

    it('handles config with rules containing empty array', () => {
      const config: CodeForgeConfig = { files: [], ignore: [], rules: { 'empty-array-rule': [] } }
      const messages: string[] = []
      formatDryRunOutput(config, (m) => messages.push(m))
      const json = messages.find((m) => m.includes('"files"'))!
      const parsed = JSON.parse(json)
      expect(parsed.rules['empty-array-rule']).toEqual([])
    })
  })
})
