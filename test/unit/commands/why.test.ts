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

    test('args ruleId is a string arg', () => {
      expect(Why.args.ruleId.description).toBe('Rule ID to explain')
    })

    test('violation flag has correct description', () => {
      expect(Why.flags.violation.description).toBe('Specific violation message to explain')
    })

    test('examples contain max-params example', () => {
      const commands = Why.examples.map((e: { command: string }) => e.command)
      const hasMaxParams = commands.some((c: string) => c.includes('max-params'))
      expect(hasMaxParams).toBe(true)
    })

    test('examples contain no-console example', () => {
      const commands = Why.examples.map((e: { command: string }) => e.command)
      const hasNoConsole = commands.some((c: string) => c.includes('no-console'))
      expect(hasNoConsole).toBe(true)
    })

    test('has exactly 2 examples', () => {
      expect(Why.examples.length).toBe(2)
    })

    test('all examples have command and description', () => {
      for (const example of Why.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect(example.command).toBeTruthy()
        expect(example.description).toBeTruthy()
      }
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

  describe('run integration - additional rules', () => {
    test('shows rule info for max-complexity', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-complexity' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-complexity')
    })

    test('shows rule info for max-lines-per-function', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-lines-per-function' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('max-lines-per-function')
    })

    test('shows rule info for no-eval', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-eval')
    })

    test('shows rule info for no-await-in-loop', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-await-in-loop' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-await-in-loop')
    })

    test('shows rule info for no-circular-deps', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-circular-deps' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-circular-deps')
    })

    test('shows rule info for no-explicit-any', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-explicit-any' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-explicit-any')
    })

    test('shows rule info for prefer-const', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('prefer-const')
    })

    test('shows rule info for eq-eq-eq', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'eq-eq-eq' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('eq-eq-eq')
    })

    test('shows rule info for no-unused-vars', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-unused-vars' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-unused-vars')
    })

    test('shows rule info for no-console', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('no-console')
    })
  })

  describe('run - output structure', () => {
    test('displays Rule header with rule name', async () => {
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
      expect(output).toContain('Rule:')
    })

    test('displays Category line', async () => {
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
      expect(output).toContain('Category:')
    })

    test('displays Description section when rule has description', async () => {
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
      expect(output).toContain('Description:')
    })

    test('does not show Your specific violation when flag is absent', async () => {
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
      expect(output).not.toContain('Your specific violation')
    })

    test('shows Your specific violation when flag is present', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'some violation text' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Your specific violation')
      expect(output).toContain('some violation text')
    })

    test('displays common violations section for max-depth', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Common violations')
      expect(output).toContain('nested')
    })

    test('displays How to fix section for max-lines', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('How to fix')
      expect(output).toContain('Split into modules')
    })

    test('displays Best practices section for no-console', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Best practices')
      expect(output).toContain('Production-ready logging')
    })

    test('displays explain recommendation with correct bin name', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'my-cli',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('my-cli explain max-params')
    })

    test('error message includes rule ID', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'fake-rule-abc' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('fake-rule-abc')
    })

    test('error message suggests running rules command', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'missing-rule' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow("Run 'codeforge rules'")
    })

    test('error message uses config.bin in suggestion', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'missing-rule' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'custom-bin',
      })

      await expect(command.run()).rejects.toThrow("Run 'custom-bin rules'")
    })

    test('calls log multiple times for full output', async () => {
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
      expect(logSpy.mock.calls.length).toBeGreaterThan(5)
    })

    test('output contains bullet points for violations', async () => {
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
      const bulletCalls = calls.filter((call: any[]) =>
        call.some((arg: string) => typeof arg === 'string' && arg.includes('•')),
      )
      expect(bulletCalls.length).toBeGreaterThan(0)
    })
  })

  describe('run - violation flag edge cases', () => {
    test('shows default suggestion when violation has no matching keywords', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'Something completely unrelated' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Review the rule documentation')
    })

    test('matches violation text with "parameter" keyword (case-sensitive)', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'parameter count is high' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('options object')
    })

    test('matches violation text with "nested" keyword', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-depth' },
        flags: { violation: 'too many nested blocks' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('early')
    })

    test('matches violation text with "depth" keyword', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-depth' },
        flags: { violation: 'depth exceeds limit' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('early')
    })

    test('matches violation text with "long" keyword', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-lines' },
        flags: { violation: 'this file is long' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('distinct responsibilities')
    })

    test('matches violation text with "line" keyword', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-lines' },
        flags: { violation: 'exceeded line count' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('separate functions')
    })

    test('shows both parameter and depth suggestions when violation has both keywords', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'parameter with nested depth issue' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('options object')
      expect(output).toContain('early')
    })

    test('shows all keyword suggestions when violation contains long, line, parameter, nested, depth', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'long line parameter nested depth' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('options object')
      expect(output).toContain('early')
      expect(output).toContain('distinct responsibilities')
    })

    test('parameter suggestion mentions descriptive property names', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'too many parameter values' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('descriptive property names')
    })

    test('parameter suggestion mentions default values or overloading', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'parameter overload issue' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('default values')
    })

    test('nested suggestion mentions helper function', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-depth' },
        flags: { violation: 'nested beyond limit' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('helper function')
    })

    test('long suggestion mentions deduplication', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-lines' },
        flags: { violation: 'file too long for maintainability' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('deduplicated')
    })

    test('violation text is shown in quotes', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params' },
        flags: { violation: 'test violation text' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('"test violation text"')
    })
  })

  describe('run - error handling', () => {
    test('errors for empty-string rule ID', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: '' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('errors for rule ID with special characters', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: '!@#$%^&*()' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('errors for rule ID with spaces', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'not a real rule' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('errors for rule ID with unicode characters', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: '规则-测试' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('errors for rule ID that partially matches existing rule', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-param' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('errors for rule ID with wrong case', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'MAX-PARAMS' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('errors with violation flag for non-existent rule', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'non-existent-rule-abc' },
        flags: { violation: 'some violation' },
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })

    test('error for rule ID with trailing slash', async () => {
      const command = new Why([], {} as any)
      vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
        throw new Error(msg as string)
      })

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'max-params/' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await expect(command.run()).rejects.toThrow('not found')
    })
  })

  describe('showCommonViolations output', () => {
    test('max-depth shows nested if violations', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Nested if statements')
    })

    test('max-depth shows nested loops violations', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Nested loops')
    })

    test('max-depth shows deep callback violations', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('async/await')
    })

    test('max-lines shows file too long violation', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('File is too long')
    })

    test('max-lines shows function too long violation', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Function is too long')
    })

    test('max-lines shows class too long violation', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Class is too long')
    })

    test('max-params shows function parameter violation', async () => {
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
      expect(output).toContain('options object')
    })

    test('max-params shows constructor parameter violation', async () => {
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
      expect(output).toContain('builder pattern')
    })

    test('no-console shows console.log debugging violation', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('console.log')
    })

    test('no-console shows console.error violation', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('console.error')
    })

    test('no-console shows console.warn violation', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('console.warn')
    })

    test('unknown rule shows default violation', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-eval' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Various violations')
    })
  })

  describe('showHowToFix output', () => {
    test('max-depth shows helper functions fix', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Extract to helper functions')
    })

    test('max-depth shows early returns fix', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('early returns')
    })

    test('max-depth shows guard clauses fix', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('guard clauses')
    })

    test('max-depth shows polymorphism fix', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('polymorphism')
    })

    test('max-lines shows split into modules fix', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Split into modules')
    })

    test('max-lines shows composition fix', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('composition')
    })

    test('max-params shows options object fix', async () => {
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
      expect(output).toContain('options object')
    })

    test('max-params shows builder pattern fix', async () => {
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
      expect(output).toContain('builder pattern')
    })

    test('max-params shows partial application fix', async () => {
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
      expect(output).toContain('partial application')
    })

    test('no-console shows logger fix', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('structured logging')
    })

    test('no-console shows throw errors fix', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Throw errors')
    })

    test('no-console shows debugging tools fix', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('debugging tools')
    })

    test('unknown rule shows default fix suggestion', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'prefer-const' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Check the rule documentation')
    })
  })

  describe('showBestPractices output', () => {
    test('max-depth shows flat code practice', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Shallow code')
    })

    test('max-depth shows guard clauses practice', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('guard clauses')
    })

    test('max-depth shows good names practice', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('self-documenting')
    })

    test('max-lines shows one responsibility practice', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('one responsibility')
    })

    test('max-lines shows testability practice', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Testability')
    })

    test('max-lines shows navigation ease practice', async () => {
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

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('Navigation')
    })

    test('max-params shows focused functions practice', async () => {
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
      expect(output).toContain('one thing well')
    })

    test('max-params shows descriptive names practice', async () => {
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
      expect(output).toContain('descriptive names')
    })

    test('max-params shows immutability practice', async () => {
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
      expect(output).toContain('immutability')
    })

    test('no-console shows structured logging practice', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('structured logging')
    })

    test('no-console shows error handling practice', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'no-console' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('error handling')
    })

    test('unknown rule shows general guidelines practice', async () => {
      const command = new Why([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { ruleId: 'eq-eq-eq' },
        flags: {},
      })

      vi.spyOn(command as any, 'config', 'get').mockReturnValue({
        bin: 'codeforge',
      })

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls.map((call: any[]) => call.join(' ')).join('\n')
      expect(output).toContain('general code quality guidelines')
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

    test('gets rule for max-depth', () => {
      const rule = getRule('max-depth')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('max-depth')
    })

    test('gets rule for max-lines', () => {
      const rule = getRule('max-lines')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('max-lines')
    })

    test('gets rule for no-console-log', () => {
      const rule = getRule('no-console-log')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-console-log')
    })

    test('gets rule for max-complexity', () => {
      const rule = getRule('max-complexity')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('max-complexity')
    })

    test('gets rule for no-eval', () => {
      const rule = getRule('no-eval')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-eval')
    })

    test('gets rule for no-explicit-any', () => {
      const rule = getRule('no-explicit-any')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-explicit-any')
    })

    test('gets rule for prefer-const', () => {
      const rule = getRule('prefer-const')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('prefer-const')
    })

    test('gets rule for eq-eq-eq', () => {
      const rule = getRule('eq-eq-eq')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('eq-eq-eq')
    })

    test('gets rule for no-unused-vars', () => {
      const rule = getRule('no-unused-vars')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-unused-vars')
    })

    test('gets rule for no-console', () => {
      const rule = getRule('no-console')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-console')
    })

    test('gets rule for no-circular-deps', () => {
      const rule = getRule('no-circular-deps')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-circular-deps')
    })

    test('gets rule for no-await-in-loop', () => {
      const rule = getRule('no-await-in-loop')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-await-in-loop')
    })

    test('gets rule for no-sync-in-async', () => {
      const rule = getRule('no-sync-in-async')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-sync-in-async')
    })

    test('gets rule for curly', () => {
      const rule = getRule('curly')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('curly')
    })

    test('gets rule for no-shadow', () => {
      const rule = getRule('no-shadow')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-shadow')
    })

    test('gets rule for prefer-nullish-coalescing', () => {
      const rule = getRule('prefer-nullish-coalescing')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('prefer-nullish-coalescing')
    })

    test('gets rule for require-await', () => {
      const rule = getRule('require-await')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('require-await')
    })

    test('gets rule for no-param-reassign', () => {
      const rule = getRule('no-param-reassign')
      expect(rule).toBeDefined()
      expect(rule?.meta.name).toBe('no-param-reassign')
    })

    test('returns undefined for empty string', () => {
      const rule = getRule('')
      expect(rule).toBeUndefined()
    })

    test('returns undefined for whitespace-only string', () => {
      const rule = getRule('   ')
      expect(rule).toBeUndefined()
    })

    test('returns undefined for rule with leading/trailing whitespace', () => {
      const rule = getRule(' max-params ')
      expect(rule).toBeUndefined()
    })

    test('returns undefined for similar but wrong rule name', () => {
      const rule = getRule('max_parameters')
      expect(rule).toBeUndefined()
    })

    test('rule has create method', () => {
      const rule = getRule('max-params')
      expect(rule?.create).toBeDefined()
      expect(typeof rule?.create).toBe('function')
    })

    test('rule has defaultOptions', () => {
      const rule = getRule('max-params')
      expect(rule?.defaultOptions).toBeDefined()
    })

    test('rule meta has description', () => {
      const rule = getRule('max-params')
      expect(rule?.meta.description).toBeDefined()
      expect(typeof rule?.meta.description).toBe('string')
    })

    test('rule meta has category', () => {
      const rule = getRule('max-params')
      expect(rule?.meta.category).toBeDefined()
    })

    test('rule meta has recommended field', () => {
      const rule = getRule('max-params')
      expect(rule?.meta.recommended).toBeDefined()
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

    test('returns complexity for max-depth', () => {
      expect(getRuleCategory('max-depth')).toBe('complexity')
    })

    test('returns complexity for max-lines', () => {
      expect(getRuleCategory('max-lines')).toBe('complexity')
    })

    test('returns complexity for max-complexity', () => {
      expect(getRuleCategory('max-complexity')).toBe('complexity')
    })

    test('returns complexity for max-lines-per-function', () => {
      expect(getRuleCategory('max-lines-per-function')).toBe('complexity')
    })

    test('returns performance for no-await-in-loop', () => {
      expect(getRuleCategory('no-await-in-loop')).toBe('performance')
    })

    test('returns performance for no-sync-in-async', () => {
      expect(getRuleCategory('no-sync-in-async')).toBe('performance')
    })

    test('returns performance for prefer-object-spread', () => {
      expect(getRuleCategory('prefer-object-spread')).toBe('performance')
    })

    test('returns performance for prefer-optional-chain', () => {
      expect(getRuleCategory('prefer-optional-chain')).toBe('performance')
    })

    test('returns dependencies for no-circular-deps', () => {
      expect(getRuleCategory('no-circular-deps')).toBe('dependencies')
    })

    test('returns dependencies for no-unused-exports', () => {
      expect(getRuleCategory('no-unused-exports')).toBe('dependencies')
    })

    test('returns dependencies for consistent-imports', () => {
      expect(getRuleCategory('consistent-imports')).toBe('dependencies')
    })

    test('returns dependencies for no-barrel-imports', () => {
      expect(getRuleCategory('no-barrel-imports')).toBe('dependencies')
    })

    test('returns security for no-deprecated-api', () => {
      expect(getRuleCategory('no-deprecated-api')).toBe('security')
    })

    test('returns security for no-dynamic-delete', () => {
      expect(getRuleCategory('no-dynamic-delete')).toBe('security')
    })

    test('returns security for no-eval', () => {
      expect(getRuleCategory('no-eval')).toBe('security')
    })

    test('returns security for no-unsafe-return', () => {
      expect(getRuleCategory('no-unsafe-return')).toBe('security')
    })

    test('returns security for no-unsafe-type-assertion', () => {
      expect(getRuleCategory('no-unsafe-type-assertion')).toBe('security')
    })

    test('returns patterns for consistent-type-exports', () => {
      expect(getRuleCategory('consistent-type-exports')).toBe('patterns')
    })

    test('returns patterns for eq-eq-eq', () => {
      expect(getRuleCategory('eq-eq-eq')).toBe('patterns')
    })

    test('returns patterns for no-explicit-any', () => {
      expect(getRuleCategory('no-explicit-any')).toBe('patterns')
    })

    test('returns patterns for no-unused-vars', () => {
      expect(getRuleCategory('no-unused-vars')).toBe('patterns')
    })

    test('returns patterns for prefer-const', () => {
      expect(getRuleCategory('prefer-const')).toBe('patterns')
    })

    test('returns patterns for curly', () => {
      expect(getRuleCategory('curly')).toBe('patterns')
    })

    test('returns patterns for no-shadow', () => {
      expect(getRuleCategory('no-shadow')).toBe('patterns')
    })

    test('returns patterns for no-floating-promises', () => {
      expect(getRuleCategory('no-floating-promises')).toBe('patterns')
    })

    test('returns patterns for no-console', () => {
      expect(getRuleCategory('no-console')).toBe('patterns')
    })

    test('returns correctness for no-throw-literal', () => {
      expect(getRuleCategory('no-throw-literal')).toBe('correctness')
    })

    test('returns correctness for no-empty-catch', () => {
      expect(getRuleCategory('no-empty-catch')).toBe('correctness')
    })

    test('returns correctness for no-empty-function', () => {
      expect(getRuleCategory('no-empty-function')).toBe('correctness')
    })

    test('returns security for no-unsafe-regex', () => {
      expect(getRuleCategory('no-unsafe-regex')).toBe('security')
    })

    test('returns testing for no-skipped-tests', () => {
      expect(getRuleCategory('no-skipped-tests')).toBe('testing')
    })

    test('returns testing for no-focused-tests', () => {
      expect(getRuleCategory('no-focused-tests')).toBe('testing')
    })

    test('returns patterns for no-debugger', () => {
      expect(getRuleCategory('no-debugger')).toBe('patterns')
    })

    test('returns patterns for no-alert', () => {
      expect(getRuleCategory('no-alert')).toBe('patterns')
    })

    test('returns patterns for no-delete-var', () => {
      expect(getRuleCategory('no-delete-var')).toBe('patterns')
    })

    test('returns complexity for empty string', () => {
      expect(getRuleCategory('')).toBe('complexity')
    })

    test('returns complexity for whitespace string', () => {
      expect(getRuleCategory('   ')).toBe('complexity')
    })

    test('returns patterns for prefer-nullish-coalescing', () => {
      expect(getRuleCategory('prefer-nullish-coalescing')).toBe('patterns')
    })

    test('returns patterns for require-await', () => {
      expect(getRuleCategory('require-await')).toBe('patterns')
    })

    test('returns patterns for no-param-reassign', () => {
      expect(getRuleCategory('no-param-reassign')).toBe('patterns')
    })

    test('returns patterns for no-nested-ternary', () => {
      expect(getRuleCategory('no-nested-ternary')).toBe('patterns')
    })

    test('returns patterns for no-non-null-assertion', () => {
      expect(getRuleCategory('no-non-null-assertion')).toBe('patterns')
    })

    test('returns patterns for explicit-module-boundary-types', () => {
      expect(getRuleCategory('explicit-module-boundary-types')).toBe('patterns')
    })

    test('returns patterns for prefer-readonly', () => {
      expect(getRuleCategory('prefer-readonly')).toBe('patterns')
    })

    test('returns security for no-unsafe-call', () => {
      expect(getRuleCategory('no-unsafe-call')).toBe('security')
    })

    test('returns security for no-unsafe-member-access', () => {
      expect(getRuleCategory('no-unsafe-member-access')).toBe('security')
    })

    test('returns patterns for no-useless-constructor', () => {
      expect(getRuleCategory('no-useless-constructor')).toBe('patterns')
    })

    test('returns patterns for prefer-promise-reject-errors', () => {
      expect(getRuleCategory('prefer-promise-reject-errors')).toBe('patterns')
    })

    test('returns patterns for no-constant-condition', () => {
      expect(getRuleCategory('no-constant-condition')).toBe('patterns')
    })

    test('returns patterns for no-duplicate-imports', () => {
      expect(getRuleCategory('no-duplicate-imports')).toBe('patterns')
    })

    test('returns patterns for no-else-return', () => {
      expect(getRuleCategory('no-else-return')).toBe('patterns')
    })

    test('returns patterns for no-implicit-coercion', () => {
      expect(getRuleCategory('no-implicit-coercion')).toBe('patterns')
    })

    test('returns patterns for no-implied-eval', () => {
      expect(getRuleCategory('no-implied-eval')).toBe('patterns')
    })

    test('returns patterns for no-string-concat', () => {
      expect(getRuleCategory('no-string-concat')).toBe('patterns')
    })

    test('returns patterns for no-void', () => {
      expect(getRuleCategory('no-void')).toBe('patterns')
    })

    test('returns patterns for prefer-rest-params', () => {
      expect(getRuleCategory('prefer-rest-params')).toBe('patterns')
    })

    test('returns patterns for prefer-spread', () => {
      expect(getRuleCategory('prefer-spread')).toBe('patterns')
    })

    test('returns patterns for restrict-template-expressions', () => {
      expect(getRuleCategory('restrict-template-expressions')).toBe('patterns')
    })

    test('returns patterns for prefer-template', () => {
      expect(getRuleCategory('prefer-template')).toBe('patterns')
    })

    test('returns patterns for no-inferrable-types', () => {
      expect(getRuleCategory('no-inferrable-types')).toBe('patterns')
    })

    test('returns patterns for prefer-number-properties', () => {
      expect(getRuleCategory('prefer-number-properties')).toBe('patterns')
    })
  })
})
