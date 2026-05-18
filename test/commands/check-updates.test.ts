import { beforeEach, describe, expect, it, vi } from 'vitest'

import CheckUpdates from '../../src/commands/check-updates.js'
import type { AuditMetadata, OutdatedPackage } from '../../src/commands/check-updates-helpers.js'

// ─── Top-level mocks ───

const { mockExec } = vi.hoisted(() => ({
  mockExec: vi.fn(),
}))

vi.mock('node:child_process', () => ({
  exec: mockExec,
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface CheckUpdatesPrivate {
  fixSecurityVulnerabilities: () => Promise<void>
  getOutdatedPackages: () => Promise<OutdatedPackage[]>
  getSecurityAudit: () => Promise<AuditMetadata>
  log: (...args: unknown[]) => void
  run: () => Promise<void>
  runHumanReadable: (includeSecurity: boolean) => Promise<void>
  runJson: (includeSecurity: boolean) => Promise<void>
  updateDependencies: () => Promise<void>
}

function createInstance(): { command: CheckUpdates; p: CheckUpdatesPrivate; logs: string[] } {
  const logs: string[] = []
  const command = new CheckUpdates([], {} as never)
  const p = command as unknown as CheckUpdatesPrivate
  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }
  return { command, p, logs }
}

const EMPTY_AUDIT: AuditMetadata = {
  vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
}

const SAMPLE_AUDIT: AuditMetadata = {
  vulnerabilities: { critical: 1, high: 2, info: 0, low: 3, moderate: 1, total: 7 },
}

const SAMPLE_OUTDATED: Record<
  string,
  { current: string; dependent: string; latest: string; wanted: string }
> = {
  chalk: { current: '4.0.0', dependent: 'my-project', latest: '5.3.0', wanted: '4.1.0' },
  lodash: { current: '4.17.0', dependent: 'my-project', latest: '4.17.21', wanted: '4.17.21' },
}

function auditJson(meta: AuditMetadata): string {
  return JSON.stringify({ metadata: { vulnerabilities: meta.vulnerabilities } })
}

/**
 * Configure mock exec to respond based on command substring matching.
 * The callback uses object form `{ stdout, stderr }` so `promisify` resolves
 * correctly even though `exec` is a vi.fn() without Node's custom promisify symbol.
 */
function mockExecResponses(
  responses: Array<{ cmd: string; error?: Error; stdout?: string }>,
): void {
  mockExec.mockImplementation(
    (
      cmd: string,
      callback: (err: Error | null, result?: { stderr: string; stdout: string }) => void,
    ) => {
      for (const r of responses) {
        if (cmd.includes(r.cmd)) {
          if (r.error) {
            callback(r.error)
          } else {
            callback(null, { stderr: '', stdout: r.stdout ?? '' })
          }
          return
        }
      }
      callback(null, { stderr: '', stdout: '' })
    },
  )
}

// ─── Static properties ───

describe('CheckUpdates static properties', () => {
  it('has correct description', () => {
    expect(CheckUpdates.description).toBe(
      'Check for outdated dependencies and security vulnerabilities',
    )
  })

  it('has examples defined', () => {
    expect(CheckUpdates.examples).toBeDefined()
    expect(CheckUpdates.examples!.length).toBeGreaterThan(0)
  })

  it('defines fixSecurity flag with char f defaulting to false', () => {
    const flag = CheckUpdates.flags!.fixSecurity as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('f')
    expect(flag.default).toBe(false)
  })

  it('defines json flag', () => {
    const flag = CheckUpdates.flags!.json as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.description).toBeTruthy()
  })

  it('defines security flag with allowNo and char s defaulting to true', () => {
    const flag = CheckUpdates.flags!.security as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('s')
    expect(flag.default).toBe(true)
    expect(flag.allowNo).toBe(true)
  })

  it('defines update flag with char u defaulting to false', () => {
    const flag = CheckUpdates.flags!.update as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('u')
    expect(flag.default).toBe(false)
  })

  it('defines at least 3 examples', () => {
    expect(CheckUpdates.examples!.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── updateDependencies ───

describe('updateDependencies', () => {
  let inst: ReturnType<typeof createInstance>

  beforeEach(() => {
    inst = createInstance()
    mockExec.mockReset()
  })

  it('logs success message on successful update', async () => {
    mockExecResponses([{ cmd: 'npm update', stdout: '' }])
    await inst.p.updateDependencies()
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Updating outdated dependencies')
    expect(output).toContain('Dependencies updated')
  })

  it('logs stdout from npm update when present', async () => {
    mockExecResponses([{ cmd: 'npm update', stdout: 'updated 3 packages' }])
    await inst.p.updateDependencies()
    expect(inst.logs.some((l) => l.includes('updated 3 packages'))).toBe(true)
  })

  it('throws SystemError when npm update fails', async () => {
    mockExecResponses([{ cmd: 'npm update', error: new Error('network failure') }])
    await expect(inst.p.updateDependencies()).rejects.toThrow('Failed to update dependencies')
  })
})

// ─── fixSecurityVulnerabilities ───

describe('fixSecurityVulnerabilities', () => {
  let inst: ReturnType<typeof createInstance>

  beforeEach(() => {
    inst = createInstance()
    mockExec.mockReset()
  })

  it('logs fixing message and success on fix', async () => {
    mockExecResponses([{ cmd: 'npm audit fix', stdout: '' }])
    await inst.p.fixSecurityVulnerabilities()
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Fixing security vulnerabilities')
    expect(output).toContain('Security vulnerabilities fixed')
  })

  it('logs stdout from npm audit fix when present', async () => {
    mockExecResponses([{ cmd: 'npm audit fix', stdout: 'fixed 2 vulnerabilities' }])
    await inst.p.fixSecurityVulnerabilities()
    expect(inst.logs.some((l) => l.includes('fixed 2 vulnerabilities'))).toBe(true)
  })

  it('throws SystemError when npm audit fix fails', async () => {
    mockExecResponses([{ cmd: 'npm audit fix', error: new Error('audit fix failed') }])
    await expect(inst.p.fixSecurityVulnerabilities()).rejects.toThrow(
      'Failed to fix security vulnerabilities',
    )
  })
})

// ─── getOutdatedPackages ───

describe('getOutdatedPackages', () => {
  let inst: ReturnType<typeof createInstance>

  beforeEach(() => {
    inst = createInstance()
    mockExec.mockReset()
  })

  it('returns parsed packages from npm output', async () => {
    mockExecResponses([{ cmd: 'npm outdated', stdout: JSON.stringify(SAMPLE_OUTDATED) }])
    const result = await inst.p.getOutdatedPackages()
    expect(result).toHaveLength(2)
    const names = result.map((p) => p.name)
    expect(names).toContain('lodash')
    expect(names).toContain('chalk')
    const lodash = result.find((p) => p.name === 'lodash')!
    expect(lodash.current).toBe('4.17.0')
    expect(lodash.latest).toBe('4.17.21')
  })

  it('returns empty array for empty stdout', async () => {
    mockExecResponses([{ cmd: 'npm outdated', stdout: '' }])
    const result = await inst.p.getOutdatedPackages()
    expect(result).toEqual([])
  })

  it('throws SystemError when npm outdated fails', async () => {
    mockExecResponses([{ cmd: 'npm outdated', error: new Error('npm crashed') }])
    await expect(inst.p.getOutdatedPackages()).rejects.toThrow(
      'Failed to check for outdated packages',
    )
  })
})

// ─── getSecurityAudit ───

describe('getSecurityAudit', () => {
  let inst: ReturnType<typeof createInstance>

  beforeEach(() => {
    inst = createInstance()
    mockExec.mockReset()
  })

  it('returns parsed audit metadata', async () => {
    mockExecResponses([{ cmd: 'npm audit --json', stdout: auditJson(SAMPLE_AUDIT) }])
    const result = await inst.p.getSecurityAudit()
    expect(result.vulnerabilities.total).toBe(7)
    expect(result.vulnerabilities.critical).toBe(1)
  })

  it('re-throws CLIError from parseAuditOutput without wrapping', async () => {
    // parseAuditOutput throws CLIError when metadata.vulnerabilities is missing
    mockExecResponses([{ cmd: 'npm audit --json', stdout: JSON.stringify({ foo: 'bar' }) }])
    await expect(inst.p.getSecurityAudit()).rejects.toThrow('Invalid audit response format')
  })

  it('wraps generic exec error in SystemError', async () => {
    mockExecResponses([{ cmd: 'npm audit --json', error: new Error('network timeout') }])
    await expect(inst.p.getSecurityAudit()).rejects.toThrow('Failed to run security audit')
  })
})

// ─── runHumanReadable ───

describe('runHumanReadable', () => {
  let inst: ReturnType<typeof createInstance>

  beforeEach(() => {
    inst = createInstance()
    mockExec.mockReset()
  })

  it('shows outdated header and up-to-date message when none outdated', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', stdout: auditJson(EMPTY_AUDIT) },
    ])
    await inst.p.runHumanReadable(true)
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Checking for outdated dependencies')
    expect(output).toContain('All dependencies are up to date')
  })

  it('shows outdated packages with name, current and latest version', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', stdout: JSON.stringify(SAMPLE_OUTDATED) },
      { cmd: 'npm audit --json', stdout: auditJson(EMPTY_AUDIT) },
    ])
    await inst.p.runHumanReadable(true)
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Found 2 outdated dependencies')
    expect(output).toContain('lodash')
    expect(output).toContain('4.17.0')
    expect(output).toContain('4.17.21')
    expect(output).toContain('npm update')
  })

  it('includes security check when includeSecurity is true', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', stdout: auditJson(SAMPLE_AUDIT) },
    ])
    await inst.p.runHumanReadable(true)
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Checking for security vulnerabilities')
    expect(output).toContain('Found 7 security vulnerabilities')
  })

  it('shows severity levels in security summary', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', stdout: auditJson(SAMPLE_AUDIT) },
    ])
    await inst.p.runHumanReadable(true)
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Critical: 1')
    expect(output).toContain('High: 2')
    expect(output).toContain('Moderate: 1')
    expect(output).toContain('Low: 3')
  })

  it('skips security check when includeSecurity is false', async () => {
    mockExecResponses([{ cmd: 'npm outdated', stdout: '' }])
    await inst.p.runHumanReadable(false)
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).not.toContain('Checking for security vulnerabilities')
  })

  it('handles SystemError from outdated check gracefully', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', error: new Error('npm crashed') },
      { cmd: 'npm audit --json', stdout: auditJson(EMPTY_AUDIT) },
    ])
    await inst.p.runHumanReadable(true)
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Could not check for outdated dependencies')
    expect(output).toContain('npm crashed')
  })

  it('handles SystemError from security audit gracefully', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', error: new Error('audit crashed') },
    ])
    await inst.p.runHumanReadable(true)
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Could not check for security vulnerabilities')
    expect(output).toContain('audit crashed')
  })
})

// ─── runJson ───

describe('runJson', () => {
  let inst: ReturnType<typeof createInstance>

  beforeEach(() => {
    inst = createInstance()
    mockExec.mockReset()
  })

  it('outputs valid JSON with outdated and security data', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', stdout: JSON.stringify(SAMPLE_OUTDATED) },
      { cmd: 'npm audit --json', stdout: auditJson(SAMPLE_AUDIT) },
    ])
    await inst.p.runJson(true)
    expect(inst.logs.length).toBe(1)
    const parsed = JSON.parse(inst.logs[0])
    expect(parsed.outdated).toHaveLength(2)
    expect(parsed.security.total).toBe(7)
    expect(parsed.error).toBeNull()
  })

  it('omits security when includeSecurity is false', async () => {
    mockExecResponses([{ cmd: 'npm outdated', stdout: '' }])
    await inst.p.runJson(false)
    const parsed = JSON.parse(inst.logs[0])
    expect(parsed.security).toBeNull()
    expect(parsed.error).toBeNull()
  })

  it('captures outdated error in JSON output', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', error: new Error('npm crashed') },
      { cmd: 'npm audit --json', stdout: auditJson(EMPTY_AUDIT) },
    ])
    await inst.p.runJson(true)
    const parsed = JSON.parse(inst.logs[0])
    expect(parsed.error).toContain('Failed to check outdated packages')
  })

  it('captures security error in JSON output', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', error: new Error('audit failed') },
    ])
    await inst.p.runJson(true)
    const parsed = JSON.parse(inst.logs[0])
    expect(parsed.error).toContain('Failed to check security')
  })

  it('combines both errors when outdated and security both fail', async () => {
    mockExecResponses([
      { cmd: 'npm outdated', error: new Error('outdated fail') },
      { cmd: 'npm audit --json', error: new Error('audit fail') },
    ])
    await inst.p.runJson(true)
    const parsed = JSON.parse(inst.logs[0])
    expect(parsed.error).toContain('Failed to check outdated packages')
    expect(parsed.error).toContain('Failed to check security')
  })

  it('produces pretty-printed JSON with 2-space indent', async () => {
    mockExecResponses([{ cmd: 'npm outdated', stdout: '' }])
    await inst.p.runJson(false)
    expect(inst.logs[0]).toContain('  ')
    expect(inst.logs[0]).toContain('\n')
  })
})

// ─── run() flag routing ───

describe('run() flag routing', () => {
  let inst: ReturnType<typeof createInstance>
  let parseStub: ReturnType<typeof vi.fn>

  beforeEach(() => {
    inst = createInstance()
    mockExec.mockReset()
    parseStub = vi.fn()
  })

  function setFlags(flags: Record<string, boolean>): void {
    parseStub.mockResolvedValue({ args: {}, flags })
    ;(inst.command as unknown as { parse: typeof parseStub }).parse = parseStub
  }

  it('calls updateDependencies when update flag is true', async () => {
    setFlags({ fixSecurity: false, json: false, security: true, update: true })
    mockExecResponses([
      { cmd: 'npm update', stdout: '' },
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', stdout: auditJson(EMPTY_AUDIT) },
    ])
    await inst.p.run()
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Updating outdated dependencies')
    expect(output).toContain('Dependencies updated')
  })

  it('calls fixSecurityVulnerabilities when fixSecurity and security flags are true', async () => {
    setFlags({ fixSecurity: true, json: false, security: true, update: false })
    mockExecResponses([
      { cmd: 'npm audit fix', stdout: '' },
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', stdout: auditJson(EMPTY_AUDIT) },
    ])
    await inst.p.run()
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).toContain('Fixing security vulnerabilities')
    expect(output).toContain('Security vulnerabilities fixed')
  })

  it('does not call fixSecurityVulnerabilities when security is false', async () => {
    setFlags({ fixSecurity: true, json: false, security: false, update: false })
    mockExecResponses([{ cmd: 'npm outdated', stdout: '' }])
    await inst.p.run()
    const output = stripAnsi(inst.logs.join('\n'))
    expect(output).not.toContain('Fixing security vulnerabilities')
    expect(output).not.toContain('Security vulnerabilities fixed')
  })

  it('routes to JSON output when json flag is true', async () => {
    setFlags({ fixSecurity: false, json: true, security: true, update: false })
    mockExecResponses([
      { cmd: 'npm outdated', stdout: '' },
      { cmd: 'npm audit --json', stdout: auditJson(EMPTY_AUDIT) },
    ])
    await inst.p.run()
    // JSON output should be parseable as the last log entry
    const lastLog = inst.logs[inst.logs.length - 1]
    const parsed = JSON.parse(lastLog)
    expect(parsed).toHaveProperty('outdated')
    expect(parsed).toHaveProperty('security')
    expect(parsed).toHaveProperty('error')
  })
})

// ─── Example structure ───

describe('CheckUpdates examples structure', () => {
  it('each example has command and description', () => {
    for (const example of CheckUpdates.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})
