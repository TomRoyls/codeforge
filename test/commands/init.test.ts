import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('node:readline', () => ({
  default: {
    createInterface: vi.fn(),
  },
}))

vi.mock('../../src/config/discovery.js', () => ({}))
vi.mock('../../src/config/parser.js', () => ({}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    getRuleIds: vi.fn().mockReturnValue([]),
    loadAllRules: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn().mockReturnValue('patterns'),
}))

vi.mock('../../src/profiles/index.js', () => ({
  getProfileConfig: vi.fn().mockReturnValue({}),
  PROFILE_DESCRIPTIONS: { lenient: 'L', moderate: 'M', strict: 'S' },
}))

vi.mock('../../src/utils/string-similarity.js', () => ({
  findClosestMatches: vi.fn().mockReturnValue([]),
}))

vi.mock('../../src/commands/init-helpers.js', () => ({
  detectExistingConfig: vi.fn().mockReturnValue(null),
  displayConfigSummary: vi.fn(),
  filterValidRules: vi.fn().mockReturnValue({ valid: [], invalid: [] }),
  generateConfig: vi.fn().mockReturnValue({ files: ['**/*.ts'], ignore: ['node_modules/**'] }),
  generateJsContent: vi.fn().mockReturnValue('export default {}'),
  generateJsonContent: vi.fn().mockReturnValue('{}'),
  getRuleInfos: vi.fn().mockReturnValue([]),
  resolveConfigFileName: vi.fn().mockReturnValue('.codeforgerc.json'),
}))

vi.mock('../../src/commands/init-wizard-helpers.js', () => ({
  formatProfileOptions: vi.fn().mockReturnValue([]),
  getProfileOptionsFromConfigs: vi.fn().mockReturnValue([]),
}))

import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'

import Init from '../../src/commands/init.js'

import { detectExistingConfig, displayConfigSummary, generateConfig, generateJsContent, generateJsonContent, resolveConfigFileName } from '../../src/commands/init-helpers.js'

function createMockCommand(overrides: Record<string, unknown> = {}): Init {
  const cmd = Object.create(Init.prototype) as Init
  Object.assign(cmd, {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return cmd
}

const defaultFlags = {
  dir: '.',
  force: false,
  format: 'json',
  interactive: false,
  minimal: false,
  profile: undefined,
  typescript: true,
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Command defaults and metadata ───

describe('Init command metadata', () => {
  it('has a description', () => {
    expect(Init.description).toBeTruthy()
  })

  it('defines flags with correct options', () => {
    expect(Init.flags).toBeDefined()
    expect(Init.flags.format).toBeDefined()
    expect(Init.flags.format.options).toEqual(['json', 'js'])
  })
})

// ─── run() - minimal mode ───

describe('run() in minimal mode', () => {
  it('creates JSON config file when no existing config', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(resolveConfigFileName).mockReturnValue('.codeforgerc.json')
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'], ignore: ['node_modules/**'] })
    vi.mocked(generateJsonContent).mockReturnValue('{\n  "files": ["**/*.ts"]\n}')

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalled()
    expect(displayConfigSummary).toHaveBeenCalled()
  })

  it('creates JS config file when format is js', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, format: 'js', minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(resolveConfigFileName).mockReturnValue('codeforge.config.js')
    vi.mocked(generateJsContent).mockReturnValue('export default {}')

    await cmd.run()

    expect(generateJsContent).toHaveBeenCalled()
    expect(fsPromises.writeFile).toHaveBeenCalled()
  })
})

// ─── run() - existing config handling ───

describe('run() with existing config', () => {
  it('skips creation when config exists and user declines overwrite', async () => {
    const cmd = createMockCommand({
      confirmOverwrite: vi.fn().mockResolvedValue(false),
    })
    vi.mocked(cmd.parse).mockResolvedValue({ flags: defaultFlags })
    vi.mocked(detectExistingConfig).mockReturnValue('/project/.codeforgerc.json')

    await cmd.run()

    expect(fsPromises.writeFile).not.toHaveBeenCalled()
    expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('not created'))
  })

  it('overwrites when force flag is set', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, force: true, minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue('/project/.codeforgerc.json')
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalled()
  })
})

// ─── run() - custom directory ───

describe('run() with custom dir', () => {
  it('resolves custom directory path', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, dir: './my-project', minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')

    await cmd.run()

    const writePath = vi.mocked(fsPromises.writeFile).mock.calls[0]![0] as string
    expect(writePath).toContain('my-project')
  })
})

// ─── run() - error handling ───

describe('run() error handling', () => {
  it('calls this.error when writeFile fails', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')
    vi.mocked(fsPromises.writeFile).mockRejectedValue(new Error('permission denied'))

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('permission denied'))
  })
})

// ─── detectExistingConfig delegation ───

describe('detectExistingConfig delegation', () => {
  it('delegates to helper with correct args', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, force: true, minimal: true } })
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')

    await cmd.run()

    expect(detectExistingConfig).toHaveBeenCalled()
  })
})

// ─── generateConfig delegation ───

describe('generateConfig delegation', () => {
  it('passes options to generateConfig helper', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')

    await cmd.run()

    expect(generateConfig).toHaveBeenCalledWith(
      expect.objectContaining({ minimal: true }),
      expect.anything(),
      undefined,
      expect.any(Function),
      expect.any(Function),
    )
  })

  it('passes profile option when provided', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, profile: 'strict', minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')

    await cmd.run()

    expect(generateConfig).toHaveBeenCalledWith(
      expect.objectContaining({ profile: 'strict' }),
      expect.anything(),
      undefined,
      expect.any(Function),
      expect.any(Function),
    )
  })
})

// ─── mkdir called for nested directories ───

describe('run() creates parent directories', () => {
  it('calls mkdir with recursive before writing', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')

    await cmd.run()

    expect(fsPromises.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true })
  })
})

// ─── displayConfigSummary called ───

describe('displayConfigSummary integration', () => {
  it('calls displayConfigSummary after writing', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { ...defaultFlags, minimal: true } })
    vi.mocked(detectExistingConfig).mockReturnValue(null)
    vi.mocked(generateConfig).mockReturnValue({ files: ['**/*.ts'], ignore: ['dist/**'] })
    vi.mocked(generateJsonContent).mockReturnValue('{}')

    await cmd.run()

    expect(displayConfigSummary).toHaveBeenCalledWith(
      expect.objectContaining({ files: ['**/*.ts'] }),
      expect.any(String),
      expect.any(String),
      expect.any(Function),
    )
  })
})
