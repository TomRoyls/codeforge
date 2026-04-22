import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CheckUpdates from '../../../src/commands/check-updates.js'

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}))

vi.mock('node:util', () => ({
  promisify: vi.fn(() => {
    const mockFn = vi.fn()
    ;(globalThis as { __mockExecAsync?: typeof mockFn }).__mockExecAsync = mockFn
    return mockFn
  }),
}))

function getMockExecAsync() {
  return (globalThis as { __mockExecAsync?: ReturnType<typeof vi.fn> }).__mockExecAsync!
}

describe('CheckUpdates Command', () => {
  let mockLog: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockLog = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createCommandWithMockedParse(flags: Record<string, unknown>) {
    const command = new CheckUpdates([], {} as never)
    const cmdWithMock = command as unknown as {
      log: ReturnType<typeof vi.fn>
      parse: ReturnType<typeof vi.fn>
    }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: {},
      flags,
    })
    cmdWithMock.log = mockLog
    return command
  }

  describe('command metadata', () => {
    it('has correct description', () => {
      expect(CheckUpdates.description).toContain('outdated dependencies')
    })

    it('has all required flags', () => {
      expect(CheckUpdates.flags).toBeDefined()
      expect(CheckUpdates.flags.json).toBeDefined()
      expect(CheckUpdates.flags.security).toBeDefined()
      expect(CheckUpdates.flags.update).toBeDefined()
      expect(CheckUpdates.flags.fixSecurity).toBeDefined()
    })

    it('has examples defined', () => {
      expect(CheckUpdates.examples).toBeDefined()
      expect(Array.isArray(CheckUpdates.examples)).toBe(true)
      expect(CheckUpdates.examples.length).toBeGreaterThan(0)
    })

    it('description mentions security vulnerabilities', () => {
      expect(CheckUpdates.description).toContain('security vulnerabilities')
    })

    it('has at least 4 examples', () => {
      expect(CheckUpdates.examples.length).toBeGreaterThanOrEqual(4)
    })

    it('json flag has correct description', () => {
      expect(CheckUpdates.flags.json.description).toBe('Output results as JSON')
    })

    it('security flag has correct description', () => {
      expect(CheckUpdates.flags.security.description).toBe('Include security vulnerability checks')
    })

    it('update flag has correct description', () => {
      expect(CheckUpdates.flags.update.description).toBe(
        'Update outdated dependencies to latest versions',
      )
    })

    it('fixSecurity flag has correct description', () => {
      expect(CheckUpdates.flags.fixSecurity.description).toBe(
        'Fix security vulnerabilities automatically',
      )
    })

    it('security flag has allowNo set to true', () => {
      expect(CheckUpdates.flags.security.allowNo).toBe(true)
    })

    it('security flag has char s', () => {
      expect(CheckUpdates.flags.security.char).toBe('s')
    })

    it('update flag has char u', () => {
      expect(CheckUpdates.flags.update.char).toBe('u')
    })

    it('fixSecurity flag has char f', () => {
      expect(CheckUpdates.flags.fixSecurity.char).toBe('f')
    })

    it('security flag defaults to true', () => {
      expect(CheckUpdates.flags.security.default).toBe(true)
    })

    it('update flag defaults to false', () => {
      expect(CheckUpdates.flags.update.default).toBe(false)
    })

    it('fixSecurity flag defaults to false', () => {
      expect(CheckUpdates.flags.fixSecurity.default).toBe(false)
    })

    it('examples include --json example', () => {
      const commands = CheckUpdates.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--json'))).toBe(true)
    })

    it('examples include --no-security example', () => {
      const commands = CheckUpdates.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--no-security'))).toBe(true)
    })

    it('examples include --update example', () => {
      const commands = CheckUpdates.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--update'))).toBe(true)
    })

    it('examples include --fix-security example', () => {
      const commands = CheckUpdates.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--fix-security'))).toBe(true)
    })
  })

  describe('getOutdatedPackages', () => {
    it('returns empty array when npm outdated returns empty', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<unknown[]> }
      ).getOutdatedPackages()

      expect(result).toEqual([])
    })

    it('parses outdated packages correctly', async () => {
      const mockStdout = JSON.stringify({
        lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
        chalk: { current: '4.0.0', dependent: 'root', latest: '5.0.0', wanted: '5.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<{ name: string; current: string; latest: string }[]>
        }
      ).getOutdatedPackages()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('lodash')
      expect(result[0].current).toBe('4.0.0')
      expect(result[0].latest).toBe('4.17.21')
      expect(result[1].name).toBe('chalk')
    })

    it('parses single package correctly', async () => {
      const mockStdout = JSON.stringify({
        express: { current: '4.17.0', dependent: 'my-app', latest: '4.18.2', wanted: '4.18.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<
            { name: string; current: string; latest: string; wanted: string; dependent: string }[]
          >
        }
      ).getOutdatedPackages()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('express')
      expect(result[0].current).toBe('4.17.0')
      expect(result[0].latest).toBe('4.18.2')
      expect(result[0].wanted).toBe('4.18.0')
      expect(result[0].dependent).toBe('my-app')
    })

    it('returns all fields for each package', async () => {
      const mockStdout = JSON.stringify({
        react: { current: '17.0.0', dependent: 'app', latest: '18.2.0', wanted: '18.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<
            { name: string; current: string; dependent: string; latest: string; wanted: string }[]
          >
        }
      ).getOutdatedPackages()

      expect(result).toHaveLength(1)
      const pkg = result[0]
      expect(pkg).toHaveProperty('name', 'react')
      expect(pkg).toHaveProperty('current', '17.0.0')
      expect(pkg).toHaveProperty('dependent', 'app')
      expect(pkg).toHaveProperty('latest', '18.2.0')
      expect(pkg).toHaveProperty('wanted', '18.0.0')
    })

    it('handles whitespace-only stdout as empty', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '   \n  \t  ' })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<unknown[]> }
      ).getOutdatedPackages()

      expect(result).toEqual([])
    })

    it('handles newline-only stdout as empty', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '\n\n\n' })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<unknown[]> }
      ).getOutdatedPackages()

      expect(result).toEqual([])
    })

    it('handles empty JSON object as empty array', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '{}' })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<unknown[]> }
      ).getOutdatedPackages()

      expect(result).toEqual([])
    })

    it('throws SystemError with code E504 on exec failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('command not found'))

      const cmd = new CheckUpdates([], {} as never)
      await expect(
        (cmd as unknown as { getOutdatedPackages: () => Promise<unknown> }).getOutdatedPackages(),
      ).rejects.toThrow('Failed to check for outdated packages')
    })

    it('throws SystemError with E504 code on exec failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('spawn error'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (
          cmd as unknown as { getOutdatedPackages: () => Promise<unknown> }
        ).getOutdatedPackages()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { code: string; message: string }
        expect(sysErr.code).toBe('E504')
      }
    })

    it('error context includes npm outdated command', async () => {
      getMockExecAsync().mockRejectedValue(new Error('spawn error'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (
          cmd as unknown as { getOutdatedPackages: () => Promise<unknown> }
        ).getOutdatedPackages()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.command).toBe('npm outdated')
      }
    })

    it('error preserves original error message in context', async () => {
      getMockExecAsync().mockRejectedValue(new Error('original error msg'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (
          cmd as unknown as { getOutdatedPackages: () => Promise<unknown> }
        ).getOutdatedPackages()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.errorMessage).toBe('original error msg')
      }
    })

    it('handles three or more outdated packages', async () => {
      const mockStdout = JSON.stringify({
        lodash: { current: '1.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
        chalk: { current: '2.0.0', dependent: 'root', latest: '5.0.0', wanted: '5.0.0' },
        express: { current: '3.0.0', dependent: 'root', latest: '4.18.2', wanted: '4.18.0' },
        jest: { current: '27.0.0', dependent: 'root', latest: '29.0.0', wanted: '29.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ name: string }[]> }
      ).getOutdatedPackages()

      expect(result).toHaveLength(4)
    })

    it('handles scoped package names', async () => {
      const mockStdout = JSON.stringify({
        '@types/node': { current: '16.0.0', dependent: 'root', latest: '20.0.0', wanted: '18.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ name: string }[]> }
      ).getOutdatedPackages()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('@types/node')
    })

    it('handles package with same current and wanted version', async () => {
      const mockStdout = JSON.stringify({
        pkg: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<{ current: string; wanted: string }[]>
        }
      ).getOutdatedPackages()

      expect(result[0].current).toBe(result[0].wanted)
    })

    it('preserves dependent field from npm output', async () => {
      const mockStdout = JSON.stringify({
        react: { current: '17.0.0', dependent: 'my-project', latest: '18.2.0', wanted: '18.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ dependent: string }[]> }
      ).getOutdatedPackages()

      expect(result[0].dependent).toBe('my-project')
    })

    it('handles prerelease version strings', async () => {
      const mockStdout = JSON.stringify({
        'next-pkg': {
          current: '1.0.0-alpha.1',
          dependent: 'root',
          latest: '2.0.0-beta.3',
          wanted: '1.0.0-alpha.2',
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<{ current: string; latest: string; wanted: string }[]>
        }
      ).getOutdatedPackages()

      expect(result[0].current).toBe('1.0.0-alpha.1')
      expect(result[0].latest).toBe('2.0.0-beta.3')
    })

    it('calls execAsync with npm outdated --json command', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = new CheckUpdates([], {} as never)
      await (
        cmd as unknown as { getOutdatedPackages: () => Promise<unknown[]> }
      ).getOutdatedPackages()

      expect(getMockExecAsync()).toHaveBeenCalledWith('npm outdated --json || true')
    })

    it('throws SystemError instance on failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (
          cmd as unknown as { getOutdatedPackages: () => Promise<unknown> }
        ).getOutdatedPackages()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).name).toBe('SystemError')
      }
    })
  })

  describe('getSecurityAudit', () => {
    it('returns audit metadata correctly', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 2, info: 0, low: 3, moderate: 4, total: 10 },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getSecurityAudit: () => Promise<{
            vulnerabilities: { total: number; critical: number; high: number }
          }>
        }
      ).getSecurityAudit()

      expect(result.vulnerabilities.total).toBe(10)
      expect(result.vulnerabilities.critical).toBe(1)
      expect(result.vulnerabilities.high).toBe(2)
    })

    it('throws error when response has no metadata', async () => {
      const mockStdout = JSON.stringify({ someOther: 'data' })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      await expect(
        (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit(),
      ).rejects.toThrow('Invalid audit response format')
    })

    it('returns all vulnerability severity fields', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 5, high: 4, info: 1, low: 2, moderate: 3, total: 15 },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getSecurityAudit: () => Promise<{
            vulnerabilities: {
              critical: number
              high: number
              info: number
              low: number
              moderate: number
              total: number
            }
          }>
        }
      ).getSecurityAudit()

      expect(result.vulnerabilities.critical).toBe(5)
      expect(result.vulnerabilities.high).toBe(4)
      expect(result.vulnerabilities.moderate).toBe(3)
      expect(result.vulnerabilities.low).toBe(2)
      expect(result.vulnerabilities.info).toBe(1)
      expect(result.vulnerabilities.total).toBe(15)
    })

    it('throws CLIError with code E004 when no metadata', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({}) })

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const cliErr = error as { code: string }
        expect(cliErr.code).toBe('E004')
      }
    })

    it('CLIError has suggestions when metadata is missing', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({}) })

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const cliErr = error as { suggestions: string[] }
        expect(cliErr.suggestions.length).toBe(3)
      }
    })

    it('CLIError first suggestion mentions Node.js project', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({}) })

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const cliErr = error as { suggestions: string[] }
        expect(cliErr.suggestions[0]).toContain('Node.js project')
      }
    })

    it('CLIError second suggestion mentions npm installed', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({}) })

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const cliErr = error as { suggestions: string[] }
        expect(cliErr.suggestions[1]).toContain('npm')
      }
    })

    it('CLIError third suggestion mentions npm audit manually', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({}) })

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const cliErr = error as { suggestions: string[] }
        expect(cliErr.suggestions[2]).toContain('npm audit')
      }
    })

    it('throws SystemError with code E505 on generic exec failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('network error'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { code: string }
        expect(sysErr.code).toBe('E505')
      }
    })

    it('SystemError context includes command npm audit', async () => {
      getMockExecAsync().mockRejectedValue(new Error('network error'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.command).toBe('npm audit')
      }
    })

    it('SystemError preserves original error message in context', async () => {
      getMockExecAsync().mockRejectedValue(new Error('connection refused'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.errorMessage).toBe('connection refused')
      }
    })

    it('re-throws CLIError without wrapping in SystemError', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({ noMetadata: true }) })

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as Error).name).toBe('CLIError')
      }
    })

    it('handles response with all zero vulnerabilities', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getSecurityAudit: () => Promise<{ vulnerabilities: { total: number } }>
        }
      ).getSecurityAudit()

      expect(result.vulnerabilities.total).toBe(0)
    })

    it('handles large vulnerability counts', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          vulnerabilities: {
            critical: 100,
            high: 200,
            info: 50,
            low: 300,
            moderate: 150,
            total: 800,
          },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getSecurityAudit: () => Promise<{ vulnerabilities: { total: number } }>
        }
      ).getSecurityAudit()

      expect(result.vulnerabilities.total).toBe(800)
    })

    it('calls execAsync with npm audit --json command', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()

      expect(getMockExecAsync()).toHaveBeenCalledWith('npm audit --json')
    })

    it('throws when stdout is not valid JSON', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'not-json' })

      const cmd = new CheckUpdates([], {} as never)
      await expect(
        (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit(),
      ).rejects.toThrow()
    })

    it('throws SystemError instance on generic failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as Error).name).toBe('SystemError')
      }
    })

    it('handles metadata with null vulnerabilities', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({ metadata: {} }) })

      const cmd = new CheckUpdates([], {} as never)
      await expect(
        (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit(),
      ).rejects.toThrow('Invalid audit response format')
    })
  })

  describe('updateDependencies', () => {
    it('logs success message on successful update', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'updated packages' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Dependencies updated'))
    })

    it('logs error message on failed update', async () => {
      getMockExecAsync().mockRejectedValue(new Error('npm update failed'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await expect(
        (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies(),
      ).rejects.toThrow('Failed to update dependencies')
    })

    it('logs updating message at start', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      expect(mockLog).toHaveBeenCalledWith(
        expect.stringContaining('Updating outdated dependencies'),
      )
    })

    it('logs stdout when present', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'added 5 packages' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      expect(mockLog).toHaveBeenCalledWith('added 5 packages')
    })

    it('does not log stdout when empty', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      expect(logCalls).not.toContain('')
    })

    it('success message contains checkmark', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('✓'))
    })

    it('throws SystemError with code E506 on failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as { code: string }).code).toBe('E506')
      }
    })

    it('error context includes command npm update', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as { context: Record<string, unknown> }).context.command).toBe('npm update')
      }
    })

    it('error preserves original error message in context', async () => {
      getMockExecAsync().mockRejectedValue(new Error('specific update error'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as { context: Record<string, unknown> }).context.errorMessage).toBe(
          'specific update error',
        )
      }
    })

    it('calls execAsync with npm update command', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      expect(getMockExecAsync()).toHaveBeenCalledWith('npm update')
    })

    it('throws SystemError instance on failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as Error).name).toBe('SystemError')
      }
    })

    it('handles multiline stdout output', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'line1\nline2\nline3' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      expect(mockLog).toHaveBeenCalledWith('line1\nline2\nline3')
    })

    it('logs success after stdout on successful update', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'output' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      const outputIndex = logCalls.indexOf('output')
      const successIndex = logCalls.findIndex((c: string) => c.includes('Dependencies updated'))
      expect(successIndex).toBeGreaterThan(outputIndex)
    })
  })

  describe('fixSecurityVulnerabilities', () => {
    it('logs success message on successful fix', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'fixed vulnerabilities' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      expect(mockLog).toHaveBeenCalledWith(
        expect.stringContaining('Security vulnerabilities fixed'),
      )
    })

    it('logs error message on failed fix', async () => {
      getMockExecAsync().mockRejectedValue(new Error('npm audit fix failed'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await expect(
        (
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
        ).fixSecurityVulnerabilities(),
      ).rejects.toThrow('Failed to fix security vulnerabilities')
    })

    it('logs fixing message at start', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      expect(mockLog).toHaveBeenCalledWith(
        expect.stringContaining('Fixing security vulnerabilities'),
      )
    })

    it('logs stdout when present', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'fixed 3 vulnerabilities' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      expect(mockLog).toHaveBeenCalledWith('fixed 3 vulnerabilities')
    })

    it('does not log stdout when empty', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      expect(logCalls).not.toContain('')
    })

    it('success message contains checkmark', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('✓'))
    })

    it('throws SystemError with code E503 on failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
        ).fixSecurityVulnerabilities()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as { code: string }).code).toBe('E503')
      }
    })

    it('error context includes command npm audit fix', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
        ).fixSecurityVulnerabilities()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as { context: Record<string, unknown> }).context.command).toBe(
          'npm audit fix',
        )
      }
    })

    it('error preserves original error message in context', async () => {
      getMockExecAsync().mockRejectedValue(new Error('audit fix failed badly'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
        ).fixSecurityVulnerabilities()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as { context: Record<string, unknown> }).context.errorMessage).toBe(
          'audit fix failed badly',
        )
      }
    })

    it('calls execAsync with npm audit fix command', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      expect(getMockExecAsync()).toHaveBeenCalledWith('npm audit fix')
    })

    it('throws SystemError instance on failure', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
        ).fixSecurityVulnerabilities()
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect((error as Error).name).toBe('SystemError')
      }
    })

    it('handles multiline stdout output', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'fixing...\ndone\n' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      expect(mockLog).toHaveBeenCalledWith('fixing...\ndone\n')
    })

    it('logs success after stdout on successful fix', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: 'output' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      const outputIndex = logCalls.indexOf('output')
      const successIndex = logCalls.findIndex((c: string) =>
        c.includes('Security vulnerabilities fixed'),
      )
      expect(successIndex).toBeGreaterThan(outputIndex)
    })
  })

  describe('runJson', () => {
    it('outputs JSON with outdated packages and security info', async () => {
      const mockOutdated = JSON.stringify({
        lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
      })
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 1, moderate: 0, total: 1 },
        },
      })

      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('"outdated"')
      expect(loggedOutput).toContain('"security"')
    })

    it('outputs JSON without security info when security is false', async () => {
      const mockOutdated = JSON.stringify({
        lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
      })

      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('"outdated"')
      expect(loggedOutput).toContain('"security": null')
    })

    it('outputs valid parseable JSON', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(() => JSON.parse(loggedOutput)).not.toThrow()
    })

    it('result has error field set to null on success', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({
          stdout: JSON.stringify({
            metadata: {
              vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
            },
          }),
        })

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toBeNull()
    })

    it('result has outdated as array', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(Array.isArray(parsed.outdated)).toBe(true)
    })

    it('result has security as null when includeSecurity is false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.security).toBeNull()
    })

    it('result has security as object when includeSecurity is true', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({
          stdout: JSON.stringify({
            metadata: {
              vulnerabilities: { critical: 1, high: 2, info: 0, low: 0, moderate: 0, total: 3 },
            },
          }),
        })

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.security).not.toBeNull()
      expect(parsed.security.total).toBe(3)
    })

    it('captures outdated error in error field', async () => {
      getMockExecAsync()
        .mockRejectedValueOnce(new Error('outdated check failed'))
        .mockResolvedValueOnce({
          stdout: JSON.stringify({
            metadata: {
              vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
            },
          }),
        })

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toContain('Failed to check for outdated packages')
    })

    it('captures security error in error field', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockRejectedValueOnce(new Error('audit check failed'))

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toContain('Failed to run security audit')
    })

    it('concatenates both errors with semicolon', async () => {
      getMockExecAsync()
        .mockRejectedValueOnce(new Error('outdated error'))
        .mockRejectedValueOnce(new Error('security error'))

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toContain('Failed to check for outdated packages')
      expect(parsed.error).toContain('Failed to run security audit')
      expect(parsed.error).toContain(';')
    })

    it('outdated is empty array when no packages found', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.outdated).toEqual([])
    })

    it('outdated contains packages when found', async () => {
      const mockOutdated = JSON.stringify({
        react: { current: '17.0.0', dependent: 'root', latest: '18.2.0', wanted: '18.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.outdated).toHaveLength(1)
      expect(parsed.outdated[0].name).toBe('react')
    })

    it('JSON uses 2-space indent', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('  "error"')
    })

    it('handles only outdated error with no security', async () => {
      getMockExecAsync().mockRejectedValueOnce(new Error('only outdated failed'))

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toContain('Failed to check for outdated packages')
    })

    it('handles only security error with no outdated error', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockRejectedValueOnce(new Error('only security failed'))

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toBe('Failed to check security: Failed to run security audit')
    })

    it('preserves all vulnerability counts in security object', async () => {
      const mockOutdated = JSON.stringify({})
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 3, high: 2, info: 1, low: 5, moderate: 4, total: 15 },
        },
      })

      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.security.critical).toBe(3)
      expect(parsed.security.high).toBe(2)
      expect(parsed.security.moderate).toBe(4)
      expect(parsed.security.low).toBe(5)
      expect(parsed.security.info).toBe(1)
      expect(parsed.security.total).toBe(15)
    })

    it('error message for outdated contains wrapped error', async () => {
      getMockExecAsync().mockRejectedValueOnce(new Error('npm outdated crashed'))

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toContain('Failed to check for outdated packages')
    })

    it('sets outdated to empty array even on error', async () => {
      getMockExecAsync().mockRejectedValueOnce(new Error('fail'))

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.outdated).toEqual([])
    })

    it('result JSON has exactly three top-level keys', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      const keys = Object.keys(parsed)
      expect(keys).toHaveLength(3)
      expect(keys).toContain('error')
      expect(keys).toContain('outdated')
      expect(keys).toContain('security')
    })

    it('does not call security audit when includeSecurity is false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      expect(getMockExecAsync()).toHaveBeenCalledTimes(1)
    })

    it('calls security audit when includeSecurity is true', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({
          stdout: JSON.stringify({
            metadata: {
              vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
            },
          }),
        })

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        true,
      )

      expect(getMockExecAsync()).toHaveBeenCalledTimes(2)
    })

    it('logs exactly once for JSON output', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> }).runJson(
        false,
      )

      expect(mockLog).toHaveBeenCalledTimes(1)
    })
  })

  describe('runHumanReadable', () => {
    it('shows "all up to date" when no outdated packages', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('All dependencies are up to date')
    })

    it('shows outdated packages when found', async () => {
      const mockOutdated = JSON.stringify({
        lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Found 1 outdated')
    })

    it('shows "no security vulnerabilities" when audit is clean', async () => {
      const mockOutdated = JSON.stringify({})
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
        },
      })

      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('No security vulnerabilities')
    })

    it('shows vulnerabilities when found', async () => {
      const mockOutdated = JSON.stringify({})
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 2, info: 0, low: 3, moderate: 4, total: 10 },
        },
      })

      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Found 10 security vulnerabilities')
    })

    it('handles error when checking outdated packages', async () => {
      getMockExecAsync().mockRejectedValue(new Error('npm not available'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Could not check for outdated dependencies')
    })

    it('handles error when checking security vulnerabilities', async () => {
      const mockOutdated = JSON.stringify({})
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockRejectedValueOnce(new Error('npm audit failed'))

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Could not check for security vulnerabilities')
    })

    it('logs checking message at start', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      expect(mockLog.mock.calls[0][0]).toContain('Checking for outdated dependencies')
    })

    it('shows green checkmark for up-to-date packages', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('✓')
    })

    it('shows package name in outdated output', async () => {
      const mockOutdated = JSON.stringify({
        mypackage: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '2.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('mypackage')
    })

    it('shows current and latest version in outdated output', async () => {
      const mockOutdated = JSON.stringify({
        pkg: { current: '1.2.3', dependent: 'root', latest: '4.5.6', wanted: '4.5.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('1.2.3')
      expect(loggedOutput).toContain('4.5.6')
    })

    it('shows npm update suggestion when packages are outdated', async () => {
      const mockOutdated = JSON.stringify({
        pkg: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '2.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('npm update')
    })

    it('shows checking security message when security is enabled', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({
          stdout: JSON.stringify({
            metadata: {
              vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
            },
          }),
        })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Checking for security vulnerabilities')
    })

    it('does not show security section when includeSecurity is false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).not.toContain('Checking for security vulnerabilities')
    })

    it('shows Critical severity when count > 0', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Critical')
    })

    it('shows High severity when count > 0', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 2, info: 0, low: 0, moderate: 0, total: 2 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('High')
    })

    it('shows Moderate severity when count > 0', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 3, total: 3 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Moderate')
    })

    it('shows Low severity when count > 0', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 4, moderate: 0, total: 4 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Low')
    })

    it('shows Info severity when count > 0', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 2, low: 0, moderate: 0, total: 2 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Info')
    })

    it('does not show severity with zero count', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      const allOutput = logCalls.join('')
      expect(allOutput).toContain('Critical')
      expect(allOutput).not.toMatch(/\bHigh: \d/)
    })

    it('shows npm audit fix suggestion when vulnerabilities found', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('npm audit fix')
    })

    it('shows multiple outdated packages individually', async () => {
      const mockOutdated = JSON.stringify({
        alpha: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '2.0.0' },
        beta: { current: '3.0.0', dependent: 'root', latest: '4.0.0', wanted: '4.0.0' },
        gamma: { current: '5.0.0', dependent: 'root', latest: '6.0.0', wanted: '6.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Found 3 outdated')
      expect(loggedOutput).toContain('alpha')
      expect(loggedOutput).toContain('beta')
      expect(loggedOutput).toContain('gamma')
    })

    it('shows all severity categories when all > 0', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 2, info: 3, low: 4, moderate: 5, total: 15 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Critical')
      expect(loggedOutput).toContain('High')
      expect(loggedOutput).toContain('Moderate')
      expect(loggedOutput).toContain('Low')
      expect(loggedOutput).toContain('Info')
    })

    it('error message includes cause message for outdated', async () => {
      getMockExecAsync().mockRejectedValue(new Error('specific-npm-error'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('specific-npm-error')
    })

    it('error message includes cause message for security', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockRejectedValueOnce(new Error('audit-error-msg'))

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('audit-error-msg')
    })

    it('shows error output when cause has no message', async () => {
      const errorWithNoMessage = new Error()
      errorWithNoMessage.message = ''
      getMockExecAsync().mockRejectedValue(errorWithNoMessage)
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Could not check for outdated dependencies')
    })

    it('shows outdated before security in log order', async () => {
      const mockOutdated = JSON.stringify({
        pkg: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '2.0.0' },
      })
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      const allOutput = logCalls.join('\n')
      const outdatedPos = allOutput.indexOf('outdated')
      const securityPos = allOutput.indexOf('security vulnerabilities')
      expect(outdatedPos).toBeLessThan(securityPos)
    })

    it('handles empty outdated with vulnerabilities found', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('All dependencies are up to date')
      expect(loggedOutput).toContain('Found 1 security vulnerabilities')
    })

    it('handles outdated found with no vulnerabilities', async () => {
      const mockOutdated = JSON.stringify({
        pkg: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '2.0.0' },
      })
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Found 1 outdated')
      expect(loggedOutput).toContain('No security vulnerabilities')
    })

    it('shows dim error message for outdated SystemError', async () => {
      getMockExecAsync().mockRejectedValue(new Error('some-error'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Could not check for outdated dependencies')
      expect(loggedOutput).toContain('some-error')
    })

    it('shows dim error message for security SystemError', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockRejectedValueOnce(new Error('sec-err'))

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Could not check for security vulnerabilities')
      expect(loggedOutput).toContain('sec-err')
    })

    it('shows Critical severity count correctly', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 5, high: 0, info: 0, low: 0, moderate: 0, total: 5 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Critical')
      expect(loggedOutput).toContain('5')
    })

    it('handles only Info severity > 0', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 7, low: 0, moderate: 0, total: 7 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      const allOutput = logCalls.join('\n')
      expect(allOutput).toContain('Info')
      expect(allOutput).not.toMatch(/\bCritical: \d/)
      expect(allOutput).not.toMatch(/\bHigh: \d/)
    })

    it('shows green checkmark for no vulnerabilities', async () => {
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('✓')
    })
  })

  describe('run', () => {
    it('calls updateDependencies when update flag is true', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: false,
        update: true,
        fixSecurity: false,
      })
      const updateSpy = vi
        .spyOn(cmd as unknown as { updateDependencies: () => Promise<void> }, 'updateDependencies')
        .mockResolvedValue()

      await cmd.run()

      expect(updateSpy).toHaveBeenCalled()
    })

    it('calls fixSecurityVulnerabilities when fixSecurity flag is true and security is true', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: true,
        update: false,
        fixSecurity: true,
      })
      const fixSpy = vi
        .spyOn(
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
          'fixSecurityVulnerabilities',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(fixSpy).toHaveBeenCalled()
    })

    it('does not call fixSecurityVulnerabilities when security is false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: false,
        update: false,
        fixSecurity: true,
      })
      const fixSpy = vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      )

      await cmd.run()

      expect(fixSpy).not.toHaveBeenCalled()
    })

    it('calls runJson when json flag is true', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: false,
        update: false,
        fixSecurity: false,
      })
      const jsonSpy = vi
        .spyOn(
          cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> },
          'runJson',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(jsonSpy).toHaveBeenCalledWith(false)
    })

    it('calls runHumanReadable when json flag is false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: false,
        fixSecurity: false,
      })
      const humanSpy = vi
        .spyOn(
          cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> },
          'runHumanReadable',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(humanSpy).toHaveBeenCalledWith(true)
    })

    it('does not call updateDependencies when update flag is false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: false,
        fixSecurity: false,
      })
      const updateSpy = vi.spyOn(
        cmd as unknown as { updateDependencies: () => Promise<void> },
        'updateDependencies',
      )

      await cmd.run()

      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('does not call fixSecurityVulnerabilities when fixSecurity is false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: false,
        fixSecurity: false,
      })
      const fixSpy = vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      )

      await cmd.run()

      expect(fixSpy).not.toHaveBeenCalled()
    })

    it('passes security=false to runJson', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: false,
        update: false,
        fixSecurity: false,
      })
      const jsonSpy = vi
        .spyOn(
          cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> },
          'runJson',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(jsonSpy).toHaveBeenCalledWith(false)
    })

    it('passes security=true to runJson', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: true,
        update: false,
        fixSecurity: false,
      })
      const jsonSpy = vi
        .spyOn(
          cmd as unknown as { runJson: (includeSecurity: boolean) => Promise<void> },
          'runJson',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(jsonSpy).toHaveBeenCalledWith(true)
    })

    it('passes security=false to runHumanReadable', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: false,
        update: false,
        fixSecurity: false,
      })
      const humanSpy = vi
        .spyOn(
          cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> },
          'runHumanReadable',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(humanSpy).toHaveBeenCalledWith(false)
    })

    it('calls update before fixSecurity', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: true,
        update: true,
        fixSecurity: true,
      })
      const callOrder: string[] = []
      vi.spyOn(
        cmd as unknown as { updateDependencies: () => Promise<void> },
        'updateDependencies',
      ).mockImplementation(async () => {
        callOrder.push('update')
      })
      vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      ).mockImplementation(async () => {
        callOrder.push('fixSecurity')
      })
      vi.spyOn(
        cmd as unknown as { runJson: (s: boolean) => Promise<void> },
        'runJson',
      ).mockImplementation(async () => {
        callOrder.push('runJson')
      })

      await cmd.run()

      expect(callOrder).toEqual(['update', 'fixSecurity', 'runJson'])
    })

    it('calls update before output', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: false,
        update: true,
        fixSecurity: false,
      })
      const callOrder: string[] = []
      vi.spyOn(
        cmd as unknown as { updateDependencies: () => Promise<void> },
        'updateDependencies',
      ).mockImplementation(async () => {
        callOrder.push('update')
      })
      vi.spyOn(
        cmd as unknown as { runJson: (s: boolean) => Promise<void> },
        'runJson',
      ).mockImplementation(async () => {
        callOrder.push('runJson')
      })

      await cmd.run()

      expect(callOrder.indexOf('update')).toBeLessThan(callOrder.indexOf('runJson'))
    })

    it('calls fixSecurity before output', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: false,
        fixSecurity: true,
      })
      const callOrder: string[] = []
      vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      ).mockImplementation(async () => {
        callOrder.push('fixSecurity')
      })
      vi.spyOn(
        cmd as unknown as { runHumanReadable: (s: boolean) => Promise<void> },
        'runHumanReadable',
      ).mockImplementation(async () => {
        callOrder.push('runHumanReadable')
      })

      await cmd.run()

      expect(callOrder.indexOf('fixSecurity')).toBeLessThan(callOrder.indexOf('runHumanReadable'))
    })

    it('with all flags false defaults to human readable with security', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: false,
        fixSecurity: false,
      })
      const humanSpy = vi
        .spyOn(
          cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> },
          'runHumanReadable',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(humanSpy).toHaveBeenCalledWith(true)
    })

    it('with all flags true calls all methods', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: true,
        update: true,
        fixSecurity: true,
      })
      const updateSpy = vi
        .spyOn(cmd as unknown as { updateDependencies: () => Promise<void> }, 'updateDependencies')
        .mockResolvedValue()
      const fixSpy = vi
        .spyOn(
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
          'fixSecurityVulnerabilities',
        )
        .mockResolvedValue()
      const jsonSpy = vi
        .spyOn(cmd as unknown as { runJson: (s: boolean) => Promise<void> }, 'runJson')
        .mockResolvedValue()

      await cmd.run()

      expect(updateSpy).toHaveBeenCalled()
      expect(fixSpy).toHaveBeenCalled()
      expect(jsonSpy).toHaveBeenCalled()
    })

    it('with update only calls update and human readable', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: true,
        fixSecurity: false,
      })
      const updateSpy = vi
        .spyOn(cmd as unknown as { updateDependencies: () => Promise<void> }, 'updateDependencies')
        .mockResolvedValue()
      const fixSpy = vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      )
      const humanSpy = vi
        .spyOn(
          cmd as unknown as { runHumanReadable: (s: boolean) => Promise<void> },
          'runHumanReadable',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(updateSpy).toHaveBeenCalled()
      expect(fixSpy).not.toHaveBeenCalled()
      expect(humanSpy).toHaveBeenCalled()
    })

    it('with fixSecurity only and security true calls fix', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: false,
        fixSecurity: true,
      })
      const updateSpy = vi.spyOn(
        cmd as unknown as { updateDependencies: () => Promise<void> },
        'updateDependencies',
      )
      const fixSpy = vi
        .spyOn(
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
          'fixSecurityVulnerabilities',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(updateSpy).not.toHaveBeenCalled()
      expect(fixSpy).toHaveBeenCalled()
    })

    it('with json only calls runJson with security true', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: true,
        update: false,
        fixSecurity: false,
      })
      const jsonSpy = vi
        .spyOn(cmd as unknown as { runJson: (s: boolean) => Promise<void> }, 'runJson')
        .mockResolvedValue()

      await cmd.run()

      expect(jsonSpy).toHaveBeenCalledWith(true)
    })

    it('with json and security=false calls runJson with false', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: false,
        update: false,
        fixSecurity: false,
      })
      const jsonSpy = vi
        .spyOn(cmd as unknown as { runJson: (s: boolean) => Promise<void> }, 'runJson')
        .mockResolvedValue()

      await cmd.run()

      expect(jsonSpy).toHaveBeenCalledWith(false)
    })

    it('update and fixSecurity both true with security false skips fix', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: false,
        update: true,
        fixSecurity: true,
      })
      const updateSpy = vi
        .spyOn(cmd as unknown as { updateDependencies: () => Promise<void> }, 'updateDependencies')
        .mockResolvedValue()
      const fixSpy = vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      )

      await cmd.run()

      expect(updateSpy).toHaveBeenCalled()
      expect(fixSpy).not.toHaveBeenCalled()
    })

    it('verifies parse is called', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: true,
        update: false,
        fixSecurity: false,
      })
      const humanSpy = vi
        .spyOn(
          cmd as unknown as { runHumanReadable: (s: boolean) => Promise<void> },
          'runHumanReadable',
        )
        .mockResolvedValue()

      await cmd.run()

      const cmdWithMock = cmd as unknown as { parse: ReturnType<typeof vi.fn> }
      expect(cmdWithMock.parse).toHaveBeenCalled()
      expect(humanSpy).toHaveBeenCalled()
    })

    it('update failure propagates error', async () => {
      const updateError = new Error('update failed')
      updateError.name = 'SystemError'

      const cmd = createCommandWithMockedParse({
        json: true,
        security: false,
        update: true,
        fixSecurity: false,
      })
      vi.spyOn(
        cmd as unknown as { updateDependencies: () => Promise<void> },
        'updateDependencies',
      ).mockRejectedValue(updateError)

      await expect(cmd.run()).rejects.toThrow('update failed')
    })

    it('fixSecurity failure propagates error', async () => {
      const fixError = new Error('fix failed')
      fixError.name = 'SystemError'

      const cmd = createCommandWithMockedParse({
        json: true,
        security: true,
        update: false,
        fixSecurity: true,
      })
      vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      ).mockRejectedValue(fixError)

      await expect(cmd.run()).rejects.toThrow('fix failed')
    })

    it('multiple sequential runs use fresh mocks', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd1 = createCommandWithMockedParse({
        json: true,
        security: false,
        update: false,
        fixSecurity: false,
      })
      vi.spyOn(
        cmd1 as unknown as { runJson: (s: boolean) => Promise<void> },
        'runJson',
      ).mockResolvedValue()

      await cmd1.run()

      expect(mockLog).toHaveBeenCalledTimes(0)

      const cmd2 = createCommandWithMockedParse({
        json: true,
        security: false,
        update: false,
        fixSecurity: false,
      })
      vi.spyOn(
        cmd2 as unknown as { runJson: (s: boolean) => Promise<void> },
        'runJson',
      ).mockResolvedValue()

      await cmd2.run()

      expect(mockLog).toHaveBeenCalledTimes(0)
    })

    it('fixSecurity only with security=false does not call fix', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: false,
        update: false,
        fixSecurity: true,
      })
      const fixSpy = vi.spyOn(
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> },
        'fixSecurityVulnerabilities',
      )

      await cmd.run()

      expect(fixSpy).not.toHaveBeenCalled()
    })

    it('update with json true calls update then runJson', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: true,
        security: true,
        update: true,
        fixSecurity: false,
      })
      const callOrder: string[] = []
      vi.spyOn(
        cmd as unknown as { updateDependencies: () => Promise<void> },
        'updateDependencies',
      ).mockImplementation(async () => {
        callOrder.push('update')
      })
      vi.spyOn(
        cmd as unknown as { runJson: (s: boolean) => Promise<void> },
        'runJson',
      ).mockImplementation(async () => {
        callOrder.push('runJson')
      })

      await cmd.run()

      expect(callOrder).toEqual(['update', 'runJson'])
    })
  })

  describe('flag combinations and edge cases', () => {
    it('handles stdout with trailing newlines in outdated', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '\n\n' })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<unknown[]> }
      ).getOutdatedPackages()

      expect(result).toEqual([])
    })

    it('handles stdout with leading whitespace in outdated', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '  \n{}' })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ name: string }[]> }
      ).getOutdatedPackages()

      expect(result).toEqual([])
    })

    it('handles error with empty message in getOutdatedPackages', async () => {
      getMockExecAsync().mockRejectedValue(new Error(''))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (
          cmd as unknown as { getOutdatedPackages: () => Promise<unknown> }
        ).getOutdatedPackages()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.errorMessage).toBe('')
      }
    })

    it('handles error with empty message in getSecurityAudit', async () => {
      getMockExecAsync().mockRejectedValue(new Error(''))

      const cmd = new CheckUpdates([], {} as never)
      try {
        await (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.errorMessage).toBe('')
      }
    })

    it('handles error with empty message in updateDependencies', async () => {
      getMockExecAsync().mockRejectedValue(new Error(''))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.errorMessage).toBe('')
      }
    })

    it('handles error with empty message in fixSecurityVulnerabilities', async () => {
      getMockExecAsync().mockRejectedValue(new Error(''))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      try {
        await (
          cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
        ).fixSecurityVulnerabilities()
        expect.unreachable('Should have thrown')
      } catch (error) {
        const sysErr = error as { context: Record<string, unknown> }
        expect(sysErr.context.errorMessage).toBe('')
      }
    })

    it('handles getSecurityAudit with metadata but no vulnerabilities field', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify({ metadata: {} }) })

      const cmd = new CheckUpdates([], {} as never)
      await expect(
        (cmd as unknown as { getSecurityAudit: () => Promise<unknown> }).getSecurityAudit(),
      ).rejects.toThrow('Invalid audit response format')
    })

    it('handles 0.0.0 version strings in outdated packages', async () => {
      const mockStdout = JSON.stringify({
        pkg: { current: '0.0.0', dependent: 'root', latest: '1.0.0', wanted: '0.0.1' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<{ current: string; latest: string; wanted: string }[]>
        }
      ).getOutdatedPackages()

      expect(result[0].current).toBe('0.0.0')
      expect(result[0].latest).toBe('1.0.0')
    })

    it('handles very long package name in outdated', async () => {
      const longName = '@very-long-org/very-long-package-name-with-many-segments'
      const mockStdout = JSON.stringify({
        [longName]: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '2.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ name: string }[]> }
      ).getOutdatedPackages()

      expect(result[0].name).toBe(longName)
    })

    it('handles error with long message in runJson error field', async () => {
      const longMessage = 'a'.repeat(500)
      getMockExecAsync().mockRejectedValueOnce(new Error(longMessage))

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toContain('Failed to check outdated packages')
      expect(parsed.error.length).toBeGreaterThan(50)
    })

    it('handles runJson with only security failure appending error correctly', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockRejectedValueOnce(new Error('security-only-fail'))

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toBe('Failed to check security: Failed to run security audit')
      expect(parsed.error).not.toContain(';')
    })

    it('handles both failures appending with semicolon in runJson', async () => {
      getMockExecAsync()
        .mockRejectedValueOnce(new Error('first-error'))
        .mockRejectedValueOnce(new Error('second-error'))

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toContain('Failed to check for outdated packages')
      expect(parsed.error).toContain('Failed to run security audit')
      expect(parsed.error).toContain('; Failed to check security')
    })

    it('createCommandWithMockedParse creates command with mocked parse', async () => {
      const cmd = createCommandWithMockedParse({ json: true, security: false })
      const cmdWithMock = cmd as unknown as {
        parse: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
      }

      expect(cmdWithMock.parse).toBeDefined()
      expect(cmdWithMock.log).toBeDefined()
    })

    it('clears mocks between tests', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(false)

      expect(mockLog).toHaveBeenCalledTimes(1)
    })

    it('handles runHumanReadable with empty cause message for security error', async () => {
      const errorWithEmptyMsg = new Error('')
      errorWithEmptyMsg.message = ''
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockRejectedValueOnce(errorWithEmptyMsg)

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Could not check for security vulnerabilities')
    })

    it('handles getOutdatedPackages with many packages', async () => {
      const packages: Record<
        string,
        { current: string; dependent: string; latest: string; wanted: string }
      > = {}
      for (let i = 0; i < 50; i++) {
        packages[`package-${i}`] = {
          current: `${i}.0.0`,
          dependent: 'root',
          latest: `${i + 1}.0.0`,
          wanted: `${i}.1.0`,
        }
      }
      getMockExecAsync().mockResolvedValue({ stdout: JSON.stringify(packages) })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<unknown[]> }
      ).getOutdatedPackages()

      expect(result).toHaveLength(50)
    })

    it('handles runJson with both outdated packages and security data', async () => {
      const mockOutdated = JSON.stringify({
        lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
        chalk: { current: '4.0.0', dependent: 'root', latest: '5.0.0', wanted: '5.0.0' },
      })
      const mockAudit = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 2, high: 1, info: 0, low: 0, moderate: 3, total: 6 },
        },
      })
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: mockOutdated })
        .mockResolvedValueOnce({ stdout: mockAudit })

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.outdated).toHaveLength(2)
      expect(parsed.security.total).toBe(6)
      expect(parsed.error).toBeNull()
    })

    it('handles runHumanReadable with both outdated and vulnerability errors', async () => {
      getMockExecAsync()
        .mockRejectedValueOnce(new Error('outdated-err'))
        .mockRejectedValueOnce(new Error('security-err'))

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('outdated-err')
      expect(loggedOutput).toContain('security-err')
    })

    it('getOutdatedPackages returns name matching the object key', async () => {
      const mockStdout = JSON.stringify({
        'my-custom-lib': { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ name: string }[]> }
      ).getOutdatedPackages()

      expect(result[0].name).toBe('my-custom-lib')
    })

    it('handles runJson with no security and no outdated error', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.error).toBeNull()
      expect(parsed.outdated).toEqual([])
      expect(parsed.security).toBeNull()
    })

    it('handles runHumanReadable that processes outdated then skips security', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      expect(getMockExecAsync()).toHaveBeenCalledTimes(1)
    })

    it('handles runHumanReadable that processes both outdated and security', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({
          stdout: JSON.stringify({
            metadata: {
              vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
            },
          }),
        })

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(true)

      expect(getMockExecAsync()).toHaveBeenCalledTimes(2)
    })

    it('getOutdatedPackages handles package with all same versions', async () => {
      const mockStdout = JSON.stringify({
        pkg: { current: '1.0.0', dependent: 'root', latest: '1.0.0', wanted: '1.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<{ current: string; latest: string; wanted: string }[]>
        }
      ).getOutdatedPackages()

      expect(result[0].current).toBe('1.0.0')
      expect(result[0].latest).toBe('1.0.0')
      expect(result[0].wanted).toBe('1.0.0')
    })

    it('handles updateDependencies with whitespace-only stdout', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '   \n  ' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      const whitespaceCall = logCalls.find((c: string) => c === '   \n  ')
      expect(whitespaceCall).toBeUndefined()
    })

    it('handles fixSecurityVulnerabilities with whitespace-only stdout', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '  \t  ' })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      const logCalls = mockLog.mock.calls.map((call: unknown[]) => call[0] as string)
      const whitespaceCall = logCalls.find((c: string) => c === '  \t  ')
      expect(whitespaceCall).toBeUndefined()
    })

    it('getSecurityAudit handles response with extra fields in metadata', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          dependencies: 10,
          devDependencies: 5,
          optionalDependencies: 2,
          totalDependencies: 17,
          vulnerabilities: { critical: 0, high: 1, info: 0, low: 0, moderate: 0, total: 1 },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getSecurityAudit: () => Promise<{ vulnerabilities: { total: number; high: number } }>
        }
      ).getSecurityAudit()

      expect(result.vulnerabilities.total).toBe(1)
      expect(result.vulnerabilities.high).toBe(1)
    })

    it('getSecurityAudit only returns vulnerabilities from metadata', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 3, high: 2, info: 1, low: 4, moderate: 5, total: 15 },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getSecurityAudit: () => Promise<Record<string, unknown>> }
      ).getSecurityAudit()

      expect(Object.keys(result)).toHaveLength(1)
      expect(result).toHaveProperty('vulnerabilities')
    })

    it('runJson does not throw even when both checks fail', async () => {
      getMockExecAsync()
        .mockRejectedValueOnce(new Error('outdated fail'))
        .mockRejectedValueOnce(new Error('security fail'))

      const cmd = createCommandWithMockedParse({ json: true, security: true })

      await expect(
        (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(true),
      ).resolves.toBeUndefined()
    })

    it('runHumanReadable does not throw on outdated error', async () => {
      getMockExecAsync().mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await expect(
        (cmd as unknown as { runHumanReadable: (s: boolean) => Promise<void> }).runHumanReadable(
          false,
        ),
      ).resolves.toBeUndefined()
    })

    it('runHumanReadable does not throw on security error', async () => {
      getMockExecAsync()
        .mockResolvedValueOnce({ stdout: '{}' })
        .mockRejectedValueOnce(new Error('fail'))

      const cmd = createCommandWithMockedParse({ json: false, security: true })

      await expect(
        (cmd as unknown as { runHumanReadable: (s: boolean) => Promise<void> }).runHumanReadable(
          true,
        ),
      ).resolves.toBeUndefined()
    })

    it('handles getSecurityAudit with only total in vulnerabilities', async () => {
      const mockStdout = JSON.stringify({
        metadata: {
          vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getSecurityAudit: () => Promise<{ vulnerabilities: { total: number } }>
        }
      ).getSecurityAudit()

      expect(result.vulnerabilities).toBeDefined()
      expect(result.vulnerabilities.total).toBe(0)
    })

    it('handles run with fixSecurity true and security false with human readable output', async () => {
      getMockExecAsync().mockResolvedValue({ stdout: '' })

      const cmd = createCommandWithMockedParse({
        json: false,
        security: false,
        update: false,
        fixSecurity: true,
      })
      const humanSpy = vi
        .spyOn(
          cmd as unknown as { runHumanReadable: (s: boolean) => Promise<void> },
          'runHumanReadable',
        )
        .mockResolvedValue()

      await cmd.run()

      expect(humanSpy).toHaveBeenCalledWith(false)
    })

    it('handles getOutdatedPackages with tab characters in stdout', async () => {
      const mockStdout = JSON.stringify({
        pkg: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: `\t${mockStdout}\t` })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ name: string }[]> }
      ).getOutdatedPackages()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('pkg')
    })

    it('handles runHumanReadable showing correct count for multiple outdated packages', async () => {
      const mockOutdated = JSON.stringify({
        'package-a': { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '2.0.0' },
        'package-b': { current: '3.0.0', dependent: 'root', latest: '4.0.0', wanted: '4.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('Found 2 outdated dependencies')
    })

    it('handles runJson with outdated containing multiple packages', async () => {
      const mockOutdated = JSON.stringify({
        'pkg-a': { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' },
        'pkg-b': { current: '3.0.0', dependent: 'root', latest: '4.0.0', wanted: '3.5.0' },
        'pkg-c': { current: '5.0.0', dependent: 'root', latest: '6.0.0', wanted: '5.5.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })

      const cmd = createCommandWithMockedParse({ json: true, security: false })

      await (cmd as unknown as { runJson: (s: boolean) => Promise<void> }).runJson(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      const parsed = JSON.parse(loggedOutput)
      expect(parsed.outdated).toHaveLength(3)
      const names = parsed.outdated.map((p: { name: string }) => p.name)
      expect(names).toContain('pkg-a')
      expect(names).toContain('pkg-b')
      expect(names).toContain('pkg-c')
    })

    it('getOutdatedPackages handles package with hyphenated name', async () => {
      const mockStdout = JSON.stringify({
        'some-cool-package': {
          current: '1.0.0',
          dependent: 'root',
          latest: '2.0.0',
          wanted: '1.5.0',
        },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as { getOutdatedPackages: () => Promise<{ name: string }[]> }
      ).getOutdatedPackages()

      expect(result[0].name).toBe('some-cool-package')
    })

    it('handles runHumanReadable with single outdated package showing arrow format', async () => {
      const mockOutdated = JSON.stringify({
        react: { current: '17.0.0', dependent: 'root', latest: '18.2.0', wanted: '18.0.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockOutdated })
      const cmd = createCommandWithMockedParse({ json: false, security: false })

      await (
        cmd as unknown as { runHumanReadable: (includeSecurity: boolean) => Promise<void> }
      ).runHumanReadable(false)

      const loggedOutput = mockLog.mock.calls.map((call) => call[0]).join('')
      expect(loggedOutput).toContain('→')
    })

    it('getOutdatedPackages preserves latest version from npm output', async () => {
      const mockStdout = JSON.stringify({
        webpack: { current: '4.0.0', dependent: 'root', latest: '5.90.0', wanted: '4.47.0' },
      })
      getMockExecAsync().mockResolvedValue({ stdout: mockStdout })

      const cmd = new CheckUpdates([], {} as never)
      const result = await (
        cmd as unknown as {
          getOutdatedPackages: () => Promise<{ latest: string; wanted: string }[]>
        }
      ).getOutdatedPackages()

      expect(result[0].latest).toBe('5.90.0')
      expect(result[0].wanted).toBe('4.47.0')
    })
  })
})
