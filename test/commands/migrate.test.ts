import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Migrate from '../../src/commands/migrate.js'

// ─── Top-level mocks ───

const {
  mockAccess,
  mockWriteFile,
  mockDetectESLint,
  mockReadESLint,
  mockMigrateESLint,
  mockDetectTSLint,
  mockReadTSLint,
  mockMigrateTSLint,
  mockDetectBiome,
  mockReadBiome,
  mockMigrateBiome,
  mockBuildConfig,
  mockFormatDryRun,
  mockFormatSummary,
  mockFormatNextSteps,
} = vi.hoisted(() => ({
  mockAccess: vi.fn(),
  mockWriteFile: vi.fn(),
  mockDetectESLint: vi.fn(),
  mockMigrateESLint: vi.fn(),
  mockReadESLint: vi.fn(),
  mockDetectTSLint: vi.fn(),
  mockMigrateTSLint: vi.fn(),
  mockReadTSLint: vi.fn(),
  mockDetectBiome: vi.fn(),
  mockMigrateBiome: vi.fn(),
  mockReadBiome: vi.fn(),
  mockBuildConfig: vi.fn(),
  mockFormatDryRun: vi.fn(),
  mockFormatNextSteps: vi.fn(),
  mockFormatSummary: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  access: mockAccess,
  readFile: vi.fn(),
  writeFile: mockWriteFile,
}))

vi.mock('../../src/core/migrators/eslint.js', () => ({
  detectESLintConfig: mockDetectESLint,
  migrateESLintConfig: mockMigrateESLint,
  readESLintConfig: mockReadESLint,
}))

vi.mock('../../src/core/migrators/tslint.js', () => ({
  detectTSLintConfig: mockDetectTSLint,
  migrateTSLintConfig: mockMigrateTSLint,
  readTSLintConfig: mockReadTSLint,
}))

vi.mock('../../src/core/migrators/biome.js', () => ({
  detectBiomeConfig: mockDetectBiome,
  migrateBiomeConfig: mockMigrateBiome,
  readBiomeConfig: mockReadBiome,
}))

vi.mock('../../src/utils/constants.js', () => ({
  MAX_UNMAPPED_RULES_TO_SHOW: 10,
}))

vi.mock('../../src/commands/migrate-helpers.js', () => ({
  buildCodeForgeConfig: mockBuildConfig,
  formatDryRunOutput: mockFormatDryRun,
  formatMigrationSummary: mockFormatSummary,
  formatNextSteps: mockFormatNextSteps,
}))

const defaultMigrationResult = { rules: {}, source: 'eslint' as const, unmapped: [] }
const defaultConfig = { files: ['**/*.ts'], ignore: [], rules: {} }

function resetMocks() {
  mockAccess.mockReset().mockRejectedValue(new Error('not found'))
  mockWriteFile.mockReset().mockResolvedValue(undefined)
  mockDetectESLint.mockReset().mockResolvedValue(null)
  mockReadESLint.mockReset().mockResolvedValue(null)
  mockMigrateESLint.mockReset().mockReturnValue({ ...defaultMigrationResult })
  mockDetectTSLint.mockReset().mockResolvedValue(null)
  mockReadTSLint.mockReset().mockResolvedValue(null)
  mockMigrateTSLint.mockReset().mockReturnValue({ ...defaultMigrationResult, source: 'tslint' })
  mockDetectBiome.mockReset().mockResolvedValue(null)
  mockReadBiome.mockReset().mockResolvedValue(null)
  mockMigrateBiome.mockReset().mockReturnValue({ ...defaultMigrationResult, source: 'biome' })
  mockBuildConfig.mockReset().mockReturnValue({ ...defaultConfig })
  mockFormatDryRun.mockReset()
  mockFormatSummary.mockReset()
  mockFormatNextSteps.mockReset()
}

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface MigratePrivate {
  log: (...args: unknown[]) => void
  migrateFromBiome: (
    cwd: string,
    flags: { dryRun: boolean; force: boolean; output: string },
  ) => Promise<void>
  migrateFromESLint: (
    cwd: string,
    flags: { dryRun: boolean; force: boolean; output: string },
  ) => Promise<void>
  migrateFromTSLint: (
    cwd: string,
    flags: { dryRun: boolean; force: boolean; output: string },
  ) => Promise<void>
}

function createMigrateInstance(): { command: Migrate; logs: string[]; p: MigratePrivate } {
  const logs: string[] = []
  const command = new Migrate([], {} as never)
  const p = command as unknown as MigratePrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, logs, p }
}

function makeFlags(overrides: Partial<{ dryRun: boolean; force: boolean; output: string }> = {}) {
  return {
    dryRun: false,
    force: false,
    output: '.codeforgerc.json',
    ...overrides,
  }
}

// ─── Static properties ───

describe('Migrate command static properties', () => {
  it('has correct description', () => {
    expect(Migrate.description).toBe('Migrate from another linter to CodeForge')
  })

  it('has examples defined', () => {
    expect(Migrate.examples).toBeDefined()
    expect(Migrate.examples!.length).toBeGreaterThan(0)
  })

  it('defines at least 2 examples', () => {
    expect(Migrate.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description', () => {
    for (const example of Migrate.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
    }
  })

  it('has dryRun flag with char d defaulting to false', () => {
    const dryRunFlag = Migrate.flags!.dryRun as Record<string, unknown>
    expect(dryRunFlag).toBeDefined()
    expect(dryRunFlag.char).toBe('d')
    expect(dryRunFlag.default).toBe(false)
  })

  it('has force flag with char f defaulting to false', () => {
    const forceFlag = Migrate.flags!.force as Record<string, unknown>
    expect(forceFlag).toBeDefined()
    expect(forceFlag.char).toBe('f')
    expect(forceFlag.default).toBe(false)
  })

  it('has from flag with char F and required true', () => {
    const fromFlag = Migrate.flags!.from as Record<string, unknown>
    expect(fromFlag).toBeDefined()
    expect(fromFlag.char).toBe('F')
    expect(fromFlag.required).toBe(true)
  })

  it('from flag has eslint, tslint, biome options', () => {
    const fromFlag = Migrate.flags!.from as Record<string, unknown>
    expect(fromFlag.options).toEqual(['eslint', 'tslint', 'biome'])
  })

  it('has output flag with char o defaulting to .codeforgerc.json', () => {
    const outputFlag = Migrate.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
    expect(outputFlag.default).toBe('.codeforgerc.json')
  })
})

// ─── ESLint migration ───

describe('migrateFromESLint', () => {
  let instance: ReturnType<typeof createMigrateInstance>

  beforeEach(() => {
    resetMocks()
    instance = createMigrateInstance()
  })

  it('errors when no ESLint config found', async () => {
    mockDetectESLint.mockResolvedValue(null)

    await expect(
      instance.p.migrateFromESLint('/project', makeFlags()),
    ).rejects.toThrow('No ESLint configuration found.')
  })

  it('logs detection message', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Detecting ESLint configuration')
  })

  it('logs found config path', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('/project/.eslintrc.json')
  })

  it('errors when config cannot be parsed', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.js')
    mockReadESLint.mockResolvedValue(null)

    await expect(
      instance.p.migrateFromESLint('/project', makeFlags()),
    ).rejects.toThrow('Could not parse ESLint configuration')
  })

  it('calls migrateESLintConfig with parsed config', async () => {
    const parsedConfig = { rules: { 'no-eval': 2 } }
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue(parsedConfig)
    mockMigrateESLint.mockReturnValue({
      rules: { 'no-eval': 'error' },
      source: 'eslint',
      unmapped: [],
    })

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    expect(mockMigrateESLint).toHaveBeenCalledWith(parsedConfig)
  })

  it('calls buildCodeForgeConfig with migrated rules', async () => {
    const migratedRules = { 'no-eval': 'error', 'max-params': 'warning' }
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockMigrateESLint.mockReturnValue({
      rules: migratedRules,
      source: 'eslint',
      unmapped: [],
    })
    mockBuildConfig.mockReturnValue({ files: [], ignore: [], rules: migratedRules })

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    expect(mockBuildConfig).toHaveBeenCalledWith(migratedRules)
  })

  it('calls formatMigrationSummary with result and max unmapped', async () => {
    const result = { rules: {}, source: 'eslint' as const, unmapped: ['unknown-rule'] }
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockMigrateESLint.mockReturnValue(result)

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    expect(mockFormatSummary).toHaveBeenCalledWith(
      result,
      10,
      expect.any(Function),
    )
  })

  it('writes config file when not dry-run and force is true', async () => {
    const config = { files: ['**/*.ts'], ignore: [], rules: { 'no-eval': 'error' } }
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockMigrateESLint.mockReturnValue({
      rules: { 'no-eval': 'error' },
      source: 'eslint',
      unmapped: [],
    })
    mockBuildConfig.mockReturnValue(config)

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    expect(mockWriteFile).toHaveBeenCalledWith(
      '/project/.codeforgerc.json',
      JSON.stringify(config, null, 2),
      'utf8',
    )
  })

  it('uses custom output path when specified', async () => {
    const config = { files: [], ignore: [], rules: {} }
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockBuildConfig.mockReturnValue(config)

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true, output: 'custom.json' }))

    expect(mockWriteFile).toHaveBeenCalledWith(
      '/project/custom.json',
      expect.any(String),
      'utf8',
    )
  })

  it('continues when config file does not exist and force is false', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockAccess.mockRejectedValue(new Error('ENOENT'))

    await instance.p.migrateFromESLint('/project', makeFlags({ force: false }))

    expect(mockWriteFile).toHaveBeenCalled()
  })

  it('does not write file in dry-run mode', async () => {
    const config = { files: [], ignore: [], rules: { 'no-eval': 'error' } }
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockBuildConfig.mockReturnValue(config)

    await instance.p.migrateFromESLint('/project', makeFlags({ dryRun: true }))

    expect(mockWriteFile).not.toHaveBeenCalled()
    expect(mockFormatDryRun).toHaveBeenCalledWith(config, expect.any(Function))
  })

  it('calls formatNextSteps after writing file', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    expect(mockFormatNextSteps).toHaveBeenCalledWith(expect.any(Function))
  })

  it('errors when writeFile fails', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockWriteFile.mockRejectedValue(new Error('Permission denied'))

    await expect(
      instance.p.migrateFromESLint('/project', makeFlags({ force: true })),
    ).rejects.toThrow('Failed to write migrated config')
  })

  it('handles non-Error writeFile rejection', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })
    mockWriteFile.mockRejectedValue('disk full')

    await expect(
      instance.p.migrateFromESLint('/project', makeFlags({ force: true })),
    ).rejects.toThrow('disk full')
  })

  it('logs "Created" message after successful write', async () => {
    mockDetectESLint.mockResolvedValue('/project/.eslintrc.json')
    mockReadESLint.mockResolvedValue({ rules: {} })

    await instance.p.migrateFromESLint('/project', makeFlags({ force: true }))

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Created .codeforgerc.json')
  })
})

// ─── TSLint migration ───

describe('migrateFromTSLint', () => {
  let instance: ReturnType<typeof createMigrateInstance>

  beforeEach(() => {
    resetMocks()
    instance = createMigrateInstance()
  })

  it('errors when no TSLint config found', async () => {
    mockDetectTSLint.mockResolvedValue(null)

    await expect(
      instance.p.migrateFromTSLint('/project', makeFlags()),
    ).rejects.toThrow('No TSLint configuration found.')
  })

  it('errors when config cannot be parsed', async () => {
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue(null)

    await expect(
      instance.p.migrateFromTSLint('/project', makeFlags()),
    ).rejects.toThrow('Could not parse TSLint configuration.')
  })

  it('calls migrateTSLintConfig with parsed config', async () => {
    const parsedConfig = { rules: { 'no-eval': true } }
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue(parsedConfig)
    mockMigrateTSLint.mockReturnValue({
      rules: { 'no-eval': 'error' },
      source: 'tslint',
      unmapped: [],
    })
    mockBuildConfig.mockReturnValue({ files: [], ignore: [], rules: { 'no-eval': 'error' } })

    await instance.p.migrateFromTSLint('/project', makeFlags({ force: true }))

    expect(mockMigrateTSLint).toHaveBeenCalledWith(parsedConfig)
  })

  it('writes config file when force is true', async () => {
    const config = { files: [], ignore: [], rules: { 'no-console': 'warning' } }
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue({ rules: {} })
    mockMigrateTSLint.mockReturnValue({
      rules: { 'no-console': 'warning' },
      source: 'tslint',
      unmapped: [],
    })
    mockBuildConfig.mockReturnValue(config)

    await instance.p.migrateFromTSLint('/project', makeFlags({ force: true }))

    expect(mockWriteFile).toHaveBeenCalledWith(
      '/project/.codeforgerc.json',
      JSON.stringify(config, null, 2),
      'utf8',
    )
  })

  it('does not write file in dry-run mode', async () => {
    const config = { files: [], ignore: [], rules: {} }
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue({ rules: {} })
    mockBuildConfig.mockReturnValue(config)

    await instance.p.migrateFromTSLint('/project', makeFlags({ dryRun: true }))

    expect(mockWriteFile).not.toHaveBeenCalled()
    expect(mockFormatDryRun).toHaveBeenCalledWith(config, expect.any(Function))
  })

  it('continues when config file does not exist and force is false', async () => {
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue({ rules: {} })
    mockAccess.mockRejectedValue(new Error('ENOENT'))

    await instance.p.migrateFromTSLint('/project', makeFlags({ force: false }))

    expect(mockWriteFile).toHaveBeenCalled()
  })

  it('logs detection message for TSLint', async () => {
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue({ rules: {} })

    await instance.p.migrateFromTSLint('/project', makeFlags({ force: true }))

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Detecting TSLint configuration')
  })

  it('calls formatNextSteps after successful write', async () => {
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue({ rules: {} })

    await instance.p.migrateFromTSLint('/project', makeFlags({ force: true }))

    expect(mockFormatNextSteps).toHaveBeenCalledWith(expect.any(Function))
  })

  it('errors when writeFile fails with non-Error', async () => {
    mockDetectTSLint.mockResolvedValue('/project/tslint.json')
    mockReadTSLint.mockResolvedValue({ rules: {} })
    mockWriteFile.mockRejectedValue('no space')

    await expect(
      instance.p.migrateFromTSLint('/project', makeFlags({ force: true })),
    ).rejects.toThrow('no space')
  })
})

// ─── Biome migration ───

describe('migrateFromBiome', () => {
  let instance: ReturnType<typeof createMigrateInstance>

  beforeEach(() => {
    resetMocks()
    instance = createMigrateInstance()
  })

  it('errors when no Biome config found', async () => {
    mockDetectBiome.mockResolvedValue(null)

    await expect(
      instance.p.migrateFromBiome('/project', makeFlags()),
    ).rejects.toThrow('No Biome configuration found.')
  })

  it('errors when config cannot be parsed', async () => {
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue(null)

    await expect(
      instance.p.migrateFromBiome('/project', makeFlags()),
    ).rejects.toThrow('Could not parse Biome configuration.')
  })

  it('calls migrateBiomeConfig with parsed config', async () => {
    const parsedConfig = { linter: { rules: { style: { useConst: 'error' } } } }
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue(parsedConfig)
    mockMigrateBiome.mockReturnValue({
      rules: { 'prefer-const': 'error' },
      source: 'biome',
      unmapped: [],
    })
    mockBuildConfig.mockReturnValue({ files: [], ignore: [], rules: { 'prefer-const': 'error' } })

    await instance.p.migrateFromBiome('/project', makeFlags({ force: true }))

    expect(mockMigrateBiome).toHaveBeenCalledWith(parsedConfig)
  })

  it('writes config file when force is true', async () => {
    const config = { files: [], ignore: [], rules: { 'no-eval': 'error' } }
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue({ linter: {} })
    mockMigrateBiome.mockReturnValue({
      rules: { 'no-eval': 'error' },
      source: 'biome',
      unmapped: [],
    })
    mockBuildConfig.mockReturnValue(config)

    await instance.p.migrateFromBiome('/project', makeFlags({ force: true }))

    expect(mockWriteFile).toHaveBeenCalledWith(
      '/project/.codeforgerc.json',
      JSON.stringify(config, null, 2),
      'utf8',
    )
  })

  it('does not write file in dry-run mode', async () => {
    const config = { files: [], ignore: [], rules: {} }
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue({ linter: {} })
    mockBuildConfig.mockReturnValue(config)

    await instance.p.migrateFromBiome('/project', makeFlags({ dryRun: true }))

    expect(mockWriteFile).not.toHaveBeenCalled()
    expect(mockFormatDryRun).toHaveBeenCalledWith(config, expect.any(Function))
  })

  it('continues when config file does not exist and force is false', async () => {
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue({ linter: {} })
    mockAccess.mockRejectedValue(new Error('ENOENT'))

    await instance.p.migrateFromBiome('/project', makeFlags({ force: false }))

    expect(mockWriteFile).toHaveBeenCalled()
  })

  it('logs detection message for Biome', async () => {
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue({ linter: {} })

    await instance.p.migrateFromBiome('/project', makeFlags({ force: true }))

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Detecting Biome configuration')
  })

  it('handles writeFile failure with error message', async () => {
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue({ linter: {} })
    mockWriteFile.mockRejectedValue(new Error('ENOSPC'))

    await expect(
      instance.p.migrateFromBiome('/project', makeFlags({ force: true })),
    ).rejects.toThrow('Failed to write migrated config')
  })

  it('calls formatNextSteps after successful write', async () => {
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue({ linter: {} })

    await instance.p.migrateFromBiome('/project', makeFlags({ force: true }))

    expect(mockFormatNextSteps).toHaveBeenCalledWith(expect.any(Function))
  })

  it('logs created message with custom output path', async () => {
    mockDetectBiome.mockResolvedValue('/project/biome.json')
    mockReadBiome.mockResolvedValue({ linter: {} })

    await instance.p.migrateFromBiome('/project', makeFlags({ force: true, output: 'my-config.json' }))

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Created my-config.json')
  })
})

// ─── Example structures ───

describe('Migrate examples structure', () => {
  it('each example has command containing --from', () => {
    for (const example of Migrate.examples!) {
      expect(example.command).toContain('--from')
    }
  })

  it('has example for eslint migration', () => {
    const hasEslintExample = Migrate.examples!.some(
      (e) => e.command.includes('eslint'),
    )
    expect(hasEslintExample).toBe(true)
  })

  it('has example for dry-run', () => {
    const hasDryRunExample = Migrate.examples!.some(
      (e) => e.command.includes('--dry-run'),
    )
    expect(hasDryRunExample).toBe(true)
  })

  it('example descriptions are non-empty strings', () => {
    for (const example of Migrate.examples!) {
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})
