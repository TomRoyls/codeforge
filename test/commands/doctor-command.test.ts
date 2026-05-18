import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/commands/doctor-helpers.js', () => ({
  checkConfigExists: vi.fn(),
  checkConfigValid: vi.fn(),
  checkFileCount: vi.fn(),
  checkFilePatterns: vi.fn(),
  checkMemory: vi.fn(),
  checkNodeVersion: vi.fn(),
  checkPackageJson: vi.fn(),
  checkRulesValid: vi.fn(),
  checkTsConfig: vi.fn(),
  checkTypeScript: vi.fn(),
  colorMessage: vi.fn((_status: string, message: string) => message),
  displayResults: vi.fn((_results: unknown, _verbose: boolean) => [
    '✓ Node.js version: v20.0.0',
    '✓ All checks passed',
  ]),
  fileExists: vi.fn().mockResolvedValue(true),
  getStatusSymbol: vi.fn((status: string) => {
    if (status === 'ok') return '✓'
    if (status === 'error') return '✗'
    return '⚠'
  }),
}))

import Doctor from '../../src/commands/doctor.js'

import {
  checkConfigExists,
  checkConfigValid,
  checkFileCount,
  checkFilePatterns,
  checkMemory,
  checkNodeVersion,
  checkPackageJson,
  checkRulesValid,
  checkTsConfig,
  checkTypeScript,
  colorMessage,
  displayResults,
  fileExists as helperFileExists,
  getStatusSymbol as helperGetStatusSymbol,
} from '../../src/commands/doctor-helpers.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createDoctorCommand(overrides: Record<string, unknown> = {}): { command: Doctor; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Doctor.prototype) as Doctor
  Object.assign(command, {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    error: vi.fn(),
    exit: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return { command, logs }
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Static properties ───

describe('Doctor command static properties', () => {
  it('has correct description', () => {
    expect(Doctor.description).toBe('Diagnose configuration and environment issues')
  })

  it('defines json flag with char j and default false', () => {
    const jsonFlag = Doctor.flags!.json as Record<string, unknown>
    expect(jsonFlag).toBeDefined()
    expect(jsonFlag.char).toBe('j')
    expect(jsonFlag.default).toBe(false)
  })

  it('defines verbose flag with char v and default false', () => {
    const verboseFlag = Doctor.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })

  it('defines at least 2 examples', () => {
    expect(Doctor.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Doctor.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── run() - normal mode (no flags) ───

describe('Doctor run() - normal mode', () => {
  it('logs header when not in json mode', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: false, verbose: false } })

    await command.run()

    const header = logs.map(stripAnsi).join('\n')
    expect(header).toContain('CodeForge Doctor')
  })

  it('calls all check functions in order', async () => {
    const { command } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: false, verbose: false } })

    await command.run()

    expect(checkNodeVersion).toHaveBeenCalled()
    expect(checkMemory).toHaveBeenCalled()
    expect(checkTypeScript).toHaveBeenCalled()
    expect(checkConfigExists).toHaveBeenCalled()
    expect(checkConfigValid).toHaveBeenCalled()
    expect(checkRulesValid).toHaveBeenCalled()
    expect(checkFilePatterns).toHaveBeenCalled()
    expect(checkFileCount).toHaveBeenCalled()
    expect(checkTsConfig).toHaveBeenCalled()
    expect(checkPackageJson).toHaveBeenCalled()
  })

  it('calls displayResults and logs each line', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: false, verbose: false } })
    displayResults.mockReturnValue(['line1', 'line2', 'line3'])

    await command.run()

    expect(displayResults).toHaveBeenCalledWith(expect.anything(), false)
    expect(logs).toContain('line1')
    expect(logs).toContain('line2')
    expect(logs).toContain('line3')
  })

  it('does not exit when all checks pass', async () => {
    const { command } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: false, verbose: false } })

    await command.run()

    expect(command.exit).not.toHaveBeenCalled()
  })

  it('exits with code 1 when checks have errors', async () => {
    const { command } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: false, verbose: false } })
    checkNodeVersion.mockImplementation((results: { checks: Array<{ status: string; message: string }> }) => {
      results.checks.push({ message: 'Node too old', status: 'error' })
    })

    await command.run()

    expect(command.exit).toHaveBeenCalledWith(1)
  })
})

// ─── run() - json mode ───

describe('Doctor run() - json mode', () => {
  it('outputs JSON string when json flag is true', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: true, verbose: false } })

    await command.run()

    const jsonOutput = logs.join('')
    const parsed = JSON.parse(jsonOutput) as { checks: unknown[]; errors: number; passed: boolean; warnings: number }
    expect(parsed).toHaveProperty('checks')
    expect(parsed).toHaveProperty('errors')
    expect(parsed).toHaveProperty('passed')
    expect(parsed).toHaveProperty('warnings')
  })

  it('does not log header in json mode', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: true, verbose: false } })

    await command.run()

    const plain = logs.map(stripAnsi).join('')
    expect(plain).not.toContain('CodeForge Doctor - Diagnosing')
  })

  it('reports passed true when no errors', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: true, verbose: false } })
    checkNodeVersion.mockImplementation((results: { checks: Array<{ message: string; status: string }> }) => {
      results.checks.push({ message: 'Node.js version: v20.0.0', status: 'ok' })
    })

    await command.run()

    const parsed = JSON.parse(logs.join('')) as { passed: boolean }
    expect(parsed.passed).toBe(true)
  })

  it('reports passed false when errors exist', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: true, verbose: false } })
    checkNodeVersion.mockImplementation((results: { checks: Array<{ status: string; message: string }> }) => {
      results.checks.push({ message: 'Node too old', status: 'error' })
    })

    await command.run()

    const parsed = JSON.parse(logs.join('')) as { passed: boolean; errors: number }
    expect(parsed.passed).toBe(false)
    expect(parsed.errors).toBe(1)
  })
})

// ─── run() - verbose mode ───

describe('Doctor run() - verbose mode', () => {
  it('passes verbose flag to displayResults', async () => {
    const { command } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: false, verbose: true } })

    await command.run()

    expect(displayResults).toHaveBeenCalledWith(expect.anything(), true)
  })

  it('calls fileExists, getStatusSymbol, colorMessage in verbose mode', async () => {
    const { command } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: false, verbose: true } })

    await command.run()

    expect(helperFileExists).toHaveBeenCalled()
    expect(helperGetStatusSymbol).toHaveBeenCalledWith('ok')
    expect(colorMessage).toHaveBeenCalledWith('ok', '')
  })
})

// ─── Private method delegation ───

describe('Doctor private method delegation', () => {
  it('colorMessage delegates to helper', () => {
    const { command } = createDoctorCommand()
    const result = command.colorMessage('ok', 'test message')
    expect(colorMessage).toHaveBeenCalledWith('ok', 'test message')
    expect(result).toBe('test message')
  })

  it('getStatusSymbol delegates to helper', () => {
    const { command } = createDoctorCommand()
    const result = command.getStatusSymbol('error')
    expect(helperGetStatusSymbol).toHaveBeenCalledWith('error')
    expect(result).toBe('✗')
  })

  it('fileExists delegates to helper', async () => {
    const { command } = createDoctorCommand()
    const result = await command.fileExists('/some/path')
    expect(helperFileExists).toHaveBeenCalledWith('/some/path')
    expect(result).toBe(true)
  })
})

// ─── Warning counting ───

describe('Doctor warning counting', () => {
  it('counts warnings in results', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: true, verbose: false } })
    checkMemory.mockImplementation((results: { checks: Array<{ status: string; message: string }> }) => {
      results.checks.push({ message: 'Low memory', status: 'warning' })
    })

    await command.run()

    const parsed = JSON.parse(logs.join('')) as { warnings: number }
    expect(parsed.warnings).toBe(1)
  })

  it('counts both errors and warnings independently', async () => {
    const { command, logs } = createDoctorCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { json: true, verbose: false } })
    checkNodeVersion.mockImplementation((results: { checks: Array<{ status: string; message: string }> }) => {
      results.checks.push({ message: 'Old Node', status: 'error' })
    })
    checkMemory.mockImplementation((results: { checks: Array<{ status: string; message: string }> }) => {
      results.checks.push({ message: 'Low memory', status: 'warning' })
    })

    await command.run()

    const parsed = JSON.parse(logs.join('')) as { errors: number; warnings: number }
    expect(parsed.errors).toBe(1)
    expect(parsed.warnings).toBe(1)
  })
})
