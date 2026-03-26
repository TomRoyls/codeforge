import { describe, test, expect, vi, beforeEach } from 'vitest'
import Why from '../../../src/commands/why.js'
import { getRule, getRuleCategory } from '../../../src/rules/index.js'

describe('Why Command', () => {
  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Why.description).toBe('Explain why a specific rule violation occurs and how to fix it')
    })

    test('has examples defined', () => {
      expect(Why.examples).toBeDefined()
      expect(Why.examples.length).toBeGreaterThan(0)
    })

    test('has args defined', () => {
      expect(Why.args).toBeDefined()
      expect(Why.args.ruleId).toBeDefined()
      expect(Why.args.ruleId.required).toBe(true)
    })

    test('has flags defined', () => {
      expect(Why.flags).toBeDefined()
      expect(Why.flags.violation).toBeDefined()
      expect(Why.flags.violation.char).toBe('v')
    })
  })

  describe('run integration', () => {
    test('errors for non-existent rule', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'non-existent-rule-xyz' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('shows rule info for max-params', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-params')
      expect(output).toContain('complexity')
    })

    test('shows rule info for max-depth', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-depth' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-depth')
    })

    test('shows rule info for max-lines', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-lines' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-lines')
    })

    test('shows rule info for no-console-log', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console-log' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-console-log')
    })

    test('shows violation analysis when --violation flag is set for parameters', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'Function has too many parameters' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('too many parameters')
      expect(output).toContain('Your specific violation')
    })

    test('shows violation analysis for nested violations', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-depth' },
        flags: { violation: 'Code is nested too deep' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('nested')
    })

    test('shows violation analysis for long file violations', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-lines' },
        flags: { violation: 'File is too long' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('long')
    })

    test('shows common violations section', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Common violations')
    })

    test('shows how to fix section', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('How to fix')
    })

    test('shows best practices section', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Best practices')
    })

    test('shows generic content for unknown rule', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'unknown-rule-xyz' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('recommends explain command at end', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('explain')
    })

    test('shows suggestions for parameter-related violations', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'Too many parameters in function' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('options object')
    })

    test('shows suggestions for depth-related violations', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-depth' },
        flags: { violation: 'Too much depth in code' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('early')
    })

    test('shows suggestions for line-related violations', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-lines' },
        flags: { violation: 'File has too many lines' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('modules')
    })
  })

  describe('getRule integration', () => {
    test('gets rule meta for existing rule', () => {
      const rule = getRule('max-params')
      expect(rule).toBeDefined()
      expect(rule?.meta).toBeDefined()
      expect(rule?.meta.name).toBe('max-params')
    })

    test('returns undefined for non-existent rule', () => {
      const rule = getRule('non-existent-rule-xyz')
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

    test('returns complexity as default for unknown rule', () => {
      const category = getRuleCategory('unknown-rule-xyz')
      expect(category).toBe('complexity')
    })
  })
})
