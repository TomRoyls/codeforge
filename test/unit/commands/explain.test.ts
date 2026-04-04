import { describe, test, expect, vi, beforeEach } from 'vitest'
import Explain from '../../../src/commands/explain.js'
import { allRules, getRuleCategory } from '../../../src/rules/index.js'

describe('Explain Command', () => {
  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Explain.description).toBe('Explain a specific rule in detail')
    })

    test('has examples defined', () => {
      expect(Explain.examples).toBeDefined()
      expect(Explain.examples.length).toBeGreaterThan(0)
    })

    test('example command format is correct', () => {
      expect(Explain.examples[0].command).toContain('<%= config.bin %>')
      expect(Explain.examples[0].command).toContain('<%= command.id %>')
    })

    test('has args defined', () => {
      expect(Explain.args).toBeDefined()
      expect(Explain.args['rule-id']).toBeDefined()
      expect(Explain.args['rule-id'].required).toBe(true)
      expect(Explain.args['rule-id'].description).toBe('The ID of the rule to explain')
    })

    test('example descriptions are meaningful', () => {
      for (const example of Explain.examples) {
        expect(example.description).toBeDefined()
        expect(typeof example.description).toBe('string')
        expect(example.description.length).toBeGreaterThan(0)
      }
    })
  })

  describe('run integration - error handling', () => {
    test('errors for non-existent rule', async () => {
      const command = new Explain([], {} as never)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'non-existent-rule-xyz' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('error message includes available rules command', async () => {
      const command = new Explain([], {} as never)
      let errorMessage = ''

      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        errorMessage = msg as string
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'unknown-rule' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      try {
        await command.run()
      } catch {
        // Expected error
      }

      expect(errorMessage).toContain('rules')
      expect(errorMessage).toContain('not found')
    })

    test('requires rule-id argument', async () => {
      const command = new Explain([], {} as never)

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': undefined },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow()
    })
  })

  describe('run integration - valid rules', () => {
    test('explains no-eval rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-eval')
      expect(output).toContain('security')
    })

    test('explains prefer-const rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('prefer-const')
      expect(output).toContain('[patterns]')
    })

    test('explains no-unused-vars rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-unused-vars' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-unused-vars')
    })

    test('explains max-params rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-params')
      expect(output).toContain('complexity')
    })

    test('explains no-console-log rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-console-log' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-console-log')
      expect(output).toContain('[patterns]')
    })

    test('explains no-duplicate-imports rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-duplicate-imports' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-duplicate-imports')
    })
  })

  describe('output sections', () => {
    test('displays header with rule ID and category', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-eval')
      expect(output).toContain('[security]')
    })

    test('displays description section', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Description')
    })

    test('displays severity section', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Severity')
    })

    test('displays auto-fixable status', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Auto-fixable')
    })

    test('displays recommended status', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Recommended')
    })

    test('displays examples section when available', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Examples')
      expect(output).toContain('Bad')
      expect(output).toContain('Good')
    })

    test('displays best practices section', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Best Practices')
    })

    test('displays related rules section when available', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-console-log' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Related Rules')
    })
  })

  describe('different categories', () => {
    test('explains complexity rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'max-complexity' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-complexity')
      expect(output).toContain('[complexity]')
    })

    test('explains security rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-eval')
      expect(output).toContain('[security]')
    })

    test('explains patterns rule', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('prefer-const')
      expect(output).toContain('[patterns]')
    })
  })

  describe('allRules integration', () => {
    test('gets rule for existing rule', () => {
      const rule = allRules['max-params']
      expect(rule).toBeDefined()
      expect(rule.meta).toBeDefined()
      expect(rule.create).toBeDefined()
    })

    test('returns undefined for non-existent rule', () => {
      const rule = allRules['non-existent-rule-xyz']
      expect(rule).toBeUndefined()
    })

    test('rule has required properties', () => {
      const rule = allRules['max-params']
      expect(rule).toHaveProperty('meta')
      expect(rule).toHaveProperty('create')
      expect(rule.meta).toHaveProperty('name')
    })

    test('rule meta has description', () => {
      const rule = allRules['max-params']
      expect(rule.meta.description).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
    })

    test('rule meta may have severity', () => {
      const rule = allRules['max-params']
      // severity is optional on meta
      const hasSeverity = rule.meta.severity !== undefined
      if (hasSeverity) {
        expect(typeof rule.meta.severity).toBe('string')
      }
    })
  })

  describe('getRuleCategory integration', () => {
    test('returns correct category for max-params', () => {
      const category = getRuleCategory('max-params')
      expect(category).toBe('complexity')
    })

    test('returns correct category for no-eval', () => {
      const category = getRuleCategory('no-eval')
      expect(category).toBe('security')
    })

    test('returns correct category for prefer-const', () => {
      const category = getRuleCategory('prefer-const')
      expect(category).toBe('patterns')
    })

    test('returns correct category for no-console-log', () => {
      const category = getRuleCategory('no-console-log')
      expect(category).toBe('patterns')
    })

    test('returns complexity as default for unknown rule', () => {
      const category = getRuleCategory('unknown-xyz-rule')
      expect(category).toBe('complexity')
    })

    test('returns valid category for all known rule categories', () => {
      const complexityCategory = getRuleCategory('max-complexity')
      const securityCategory = getRuleCategory('no-eval')
      const patternsCategory = getRuleCategory('prefer-const')

      expect([
        'complexity',
        'security',
        'patterns',
        'dependencies',
        'performance',
        'correctness',
      ]).toContain(complexityCategory)
      expect([
        'complexity',
        'security',
        'patterns',
        'dependencies',
        'performance',
        'correctness',
      ]).toContain(securityCategory)
      expect([
        'complexity',
        'security',
        'patterns',
        'dependencies',
        'performance',
        'correctness',
      ]).toContain(patternsCategory)
    })
  })

  describe('example content validation', () => {
    test('examples contain bad and good code patterns', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')

      // Check for bad/good indicators
      expect(output).toContain('❌')
      expect(output).toContain('✅')
    })

    test('examples have descriptions', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-duplicate-imports' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('import')
    })
  })

  describe('best practices validation', () => {
    test('best practices contain actionable advice', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('•')
    })

    test('best practices are listed', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Best Practices')
    })
  })

  describe('edge cases', () => {
    test('handles rule with minimal metadata', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-params')
    })

    test('displays all sections even if some are empty', async () => {
      const command = new Explain([], {} as never)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Severity')
      expect(output).toContain('Auto-fixable')
      expect(output).toContain('Recommended')
    })
  })
})
