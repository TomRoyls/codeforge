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

      await (cmd as unknown as { updateDependencies: () => Promise<void> }).updateDependencies()

      expect(mockLog).toHaveBeenCalledWith(
        expect.stringContaining('Could not update'),
        'npm update failed',
      )
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

      await (
        cmd as unknown as { fixSecurityVulnerabilities: () => Promise<void> }
      ).fixSecurityVulnerabilities()

      expect(mockLog).toHaveBeenCalledWith(
        expect.stringContaining('Could not fix'),
        'npm audit fix failed',
      )
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
  })
})
