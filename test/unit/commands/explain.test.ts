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

    test('has args defined', () => {
      expect(Explain.args).toBeDefined()
      expect(Explain.args['rule-id']).toBeDefined()
      expect(Explain.args['rule-id'].required).toBe(true)
    })
  })

  describe('run integration', () => {
    test('errors for non-existent rule', async () => {
      const command = new Explain([], {} as any)
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

    test('shows rule info for no-eval', async () => {
      const command = new Explain([], {} as any)
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

    test('shows rule info for prefer-const', async () => {
      const command = new Explain([], {} as any)
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
    })

    test('shows rule info for no-unused-vars', async () => {
      const command = new Explain([], {} as any)
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

    test('shows rule info for max-params', async () => {
      const command = new Explain([], {} as any)
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

    test('displays description section', async () => {
      const command = new Explain([], {} as any)
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
      expect(output).toContain('Description')
    })

    test('displays best practices section', async () => {
      const command = new Explain([], {} as any)
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

    test('displays related rules section', async () => {
      const command = new Explain([], {} as any)
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

    test('displays auto-fixable status', async () => {
      const command = new Explain([], {} as any)
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
  })

  describe('allRules integration', () => {
    test('gets rule for existing rule', () => {
      const rule = allRules['max-params']
      expect(rule).toBeDefined()
      expect(rule.meta).toBeDefined()
    })

    test('returns undefined for non-existent rule', () => {
      const rule = allRules['non-existent-rule-xyz']
      expect(rule).toBeUndefined()
    })
  })

  describe('getRuleCategory integration', () => {
    test('returns correct category for max-params', () => {
      const category = getRuleCategory('max-params')
      expect(category).toBe('complexity')
    })

    test('returns correct category for no-console-log', () => {
      const category = getRuleCategory('no-console-log')
      expect(category).toBe('patterns')
    })
  })
})
