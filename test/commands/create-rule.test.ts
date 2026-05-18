import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}))

vi.mock('../../src/commands/create-rule-helpers.js', () => ({
  buildDefaultDescription: vi.fn((name: string) => `Description for ${name} rule`),
  buildRuleContent: vi.fn(() => '// rule content'),
  buildTestContent: vi.fn(() => '// test content'),
  isValidCategory: vi.fn(() => true),
  isValidRuleName: vi.fn(() => true),
  VALID_CATEGORIES: ['complexity', 'dependencies', 'performance', 'security', 'patterns', 'correctness', 'testing', 'best-practices'],
  VALID_SEVERITIES: ['error', 'warning', 'info'],
}))

import * as fs from 'node:fs'

import CreateRule from '../../src/commands/create-rule.js'

import {
  buildDefaultDescription,
  buildRuleContent,
  buildTestContent,
  isValidCategory,
  isValidRuleName,
} from '../../src/commands/create-rule-helpers.js'

const strip = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

const throwingError = vi.fn((msg: string) => { throw new Error(msg) })

function createMockCommand(overrides: Record<string, unknown> = {}): CreateRule {
  const cmd = Object.create(CreateRule.prototype) as CreateRule
  Object.assign(cmd, {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return cmd
}

const defaultArgs = { name: 'my-rule' }
const defaultFlags = {
  category: 'security',
  description: undefined,
  fixable: false,
  force: false,
  output: undefined,
  severity: 'warning',
  typescript: false,
}

function getLogText(cmd: CreateRule): string {
  return vi.mocked(cmd.log).mock.calls
    .map((c) => c.map((a) => strip(String(a))).join(' '))
    .join('\n')
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Command metadata ───

describe('CreateRule command metadata', () => {
  it('has a description', () => {
    expect(CreateRule.description).toBeTruthy()
  })

  it('defines args with name as required string', () => {
    expect(CreateRule.args).toBeDefined()
    expect(CreateRule.args.name).toBeDefined()
    expect(CreateRule.args.name.required).toBe(true)
  })

  it('defines category flag as required', () => {
    expect(CreateRule.flags.category).toBeDefined()
    expect(CreateRule.flags.category.required).toBe(true)
  })

  it('defines severity flag', () => {
    expect(CreateRule.flags.severity).toBeDefined()
  })

  it('defines fixable boolean flag', () => {
    expect(CreateRule.flags.fixable).toBeDefined()
  })

  it('defines force boolean flag', () => {
    expect(CreateRule.flags.force).toBeDefined()
  })

  it('defines output string flag', () => {
    expect(CreateRule.flags.output).toBeDefined()
  })

  it('defines typescript boolean flag', () => {
    expect(CreateRule.flags.typescript).toBeDefined()
  })

  it('provides usage examples', () => {
    expect(CreateRule.examples).toBeDefined()
    expect(CreateRule.examples.length).toBeGreaterThan(0)
  })
})

// ─── run() - successful creation ───

describe('run() - successful creation', () => {
  it('writes rule and test files', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
  })

  it('calls buildRuleContent with correct options', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, category: 'patterns', severity: 'error', fixable: true, typescript: true },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith({
      category: 'patterns',
      description: 'Description for my-rule rule',
      fixable: true,
      ruleName: 'my-rule',
      severity: 'error',
      typescript: true,
    })
  })

  it('calls buildTestContent with correct options', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: { name: 'no-eval' },
      flags: { ...defaultFlags, category: 'security' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildTestContent).toHaveBeenCalledWith('no-eval', 'security')
  })

  it('uses custom description when provided', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, description: 'Disallow eval usage' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Disallow eval usage' }),
    )
    expect(buildDefaultDescription).not.toHaveBeenCalled()
  })

  it('falls back to buildDefaultDescription when no description flag', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildDefaultDescription).toHaveBeenCalledWith('my-rule')
  })

  it('creates directories when they do not exist', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fs.mkdirSync).toHaveBeenCalledTimes(2)
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true })
  })

  it('skips mkdir when directories already exist', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(fs.mkdirSync).not.toHaveBeenCalled()
  })

  it('uses default output directory based on category', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const ruleWriteCall = vi.mocked(fs.writeFileSync).mock.calls[0]!
    expect(ruleWriteCall[0]).toContain('security')
    expect(ruleWriteCall[0]).toContain('my-rule.ts')
  })

  it('uses custom output directory when provided', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, output: '/custom/rules' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const ruleWriteCall = vi.mocked(fs.writeFileSync).mock.calls[0]!
    expect(ruleWriteCall[0]).toContain('/custom/rules')
  })

  it('logs success messages', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const text = getLogText(cmd)
    expect(text).toContain('Creating CodeForge rule')
    expect(text).toContain('Rule created successfully')
  })

  it('logs next steps after creation', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const text = getLogText(cmd)
    expect(text).toContain('Next steps')
    expect(text).toContain('Implement the visitor')
  })

  it('logs file paths in output', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const text = getLogText(cmd)
    expect(text).toContain('src/rules/security/my-rule.ts')
    expect(text).toContain('test/unit/rules/security/my-rule.test.ts')
  })
})

// ─── run() - rule name validation ───

describe('run() - rule name validation', () => {
  it('calls error when rule name is invalid', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidRuleName).mockReturnValueOnce(false)

    await expect(cmd.run()).rejects.toThrow()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('lowercase'),
    )
  })

  it('does not write files when rule name is invalid', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidRuleName).mockReturnValueOnce(false)

    await expect(cmd.run()).rejects.toThrow()

    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })
})

// ─── run() - category validation ───

describe('run() - category validation', () => {
  it('calls error when category is invalid', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, category: 'invalid' },
    })
    vi.mocked(isValidCategory).mockReturnValueOnce(false)

    await expect(cmd.run()).rejects.toThrow()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid category'),
    )
  })

  it('includes valid categories list in error message', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, category: 'bogus' },
    })
    vi.mocked(isValidCategory).mockReturnValueOnce(false)

    await expect(cmd.run()).rejects.toThrow()

    const errorMsg = vi.mocked(cmd.error).mock.calls[0]![0] as string
    expect(errorMsg).toContain('complexity')
    expect(errorMsg).toContain('security')
  })
})

// ─── run() - severity validation ───

describe('run() - severity validation', () => {
  it('calls error when severity is invalid', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, severity: 'critical' },
    })

    await expect(cmd.run()).rejects.toThrow()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid severity'),
    )
  })
})

// ─── run() - existing file handling ───

describe('run() - existing file handling', () => {
  it('calls error when rule file exists without --force', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await expect(cmd.run()).rejects.toThrow()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('already exists'),
    )
  })

  it('includes file path in already-exists error', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await expect(cmd.run()).rejects.toThrow()

    const errorMsg = vi.mocked(cmd.error).mock.calls[0]![0] as string
    expect(errorMsg).toContain('my-rule.ts')
  })

  it('suggests --force in error message', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await expect(cmd.run()).rejects.toThrow()

    const errorMsg = vi.mocked(cmd.error).mock.calls[0]![0] as string
    expect(errorMsg).toContain('--force')
  })

  it('overwrites existing files when --force is set', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, force: true },
    })
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)

    await cmd.run()

    expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
  })
})

// ─── run() - write error handling ───

describe('run() - write error handling', () => {
  it('calls error when writeFileSync throws', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
      throw new Error('disk full')
    })

    await expect(cmd.run()).rejects.toThrow()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('disk full'),
    )
  })

  it('handles non-Error thrown values', async () => {
    const cmd = createMockCommand({ error: throwingError })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
      throw 'string error'
    })

    await expect(cmd.run()).rejects.toThrow()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('string error'),
    )
  })
})

// ─── run() - test file path construction ───

describe('run() - test file path construction', () => {
  it('places test file in test/unit/rules/<category>/', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: { name: 'max-depth' },
      flags: { ...defaultFlags, category: 'complexity' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const testWriteCall = vi.mocked(fs.writeFileSync).mock.calls[1]!
    expect(testWriteCall[0]).toContain('test/unit/rules/complexity')
    expect(testWriteCall[0]).toContain('max-depth.test.ts')
  })
})

// ─── run() - severity defaults ───

describe('run() - severity defaults', () => {
  it('defaults severity to warning', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warning' }),
    )
  })

  it('uses provided severity level', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, severity: 'error' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    )
  })
})

// ─── run() - fixable flag ───

describe('run() - fixable flag', () => {
  it('passes fixable=false by default', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith(
      expect.objectContaining({ fixable: false }),
    )
  })

  it('passes fixable=true when flag is set', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, fixable: true },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith(
      expect.objectContaining({ fixable: true }),
    )
  })
})

// ─── run() - typescript flag ───

describe('run() - typescript flag', () => {
  it('passes typescript=false by default', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith(
      expect.objectContaining({ typescript: false }),
    )
  })

  it('passes typescript=true when flag is set', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, typescript: true },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildRuleContent).toHaveBeenCalledWith(
      expect.objectContaining({ typescript: true }),
    )
  })
})

// ─── run() - content written to files ───

describe('run() - content written to files', () => {
  it('writes buildRuleContent output to rule file', async () => {
    vi.mocked(buildRuleContent).mockReturnValue('export const myRule = {}')
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const ruleWriteCall = vi.mocked(fs.writeFileSync).mock.calls[0]!
    expect(ruleWriteCall[1]).toBe('export const myRule = {}')
  })

  it('writes buildTestContent output to test file', async () => {
    vi.mocked(buildTestContent).mockReturnValue("import { describe } from 'vitest'")
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const testWriteCall = vi.mocked(fs.writeFileSync).mock.calls[1]!
    expect(testWriteCall[1]).toBe("import { describe } from 'vitest'")
  })
})

// ─── run() - next steps output ───

describe('run() - next steps output', () => {
  it('includes vitest run command with category and rule name', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: { name: 'no-eval' },
      flags: { ...defaultFlags, category: 'security' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const text = getLogText(cmd)
    expect(text).toContain('vitest run')
    expect(text).toContain('test/unit/rules/security/no-eval.test.ts')
  })

  it('includes register hint for index.ts', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const text = getLogText(cmd)
    expect(text).toContain('index.ts')
  })
})
