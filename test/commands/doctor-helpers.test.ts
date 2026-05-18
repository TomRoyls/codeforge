import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fileExists,
  checkNodeVersion,
  checkMemory,
  checkConfigExists,
  checkConfigValid,
  checkRulesValid,
  checkFilePatterns,
  checkFileCount,
  checkTsConfig,
  checkPackageJson,
  checkTypeScript,
  type DoctorResult,
} from '../../src/commands/doctor-helpers.js'

vi.mock('node:fs/promises', () => ({
  stat: vi.fn(),
  readFile: vi.fn(),
}))

vi.mock('node:os', () => ({
  totalmem: vi.fn(),
}))

vi.mock('node:path', () => ({
  basename: (p: string) => p.split('/').pop() ?? '',
  join: (...args: string[]) => args.join('/'),
  relative: (from: string, to: string) => {
    if (to.startsWith(from)) return to.slice(from.length + 1)
    return to
  },
}))

vi.mock('../../src/config/discovery.js', () => ({
  discoverConfig: vi.fn(),
}))

vi.mock('../../src/config/parser.js', () => ({
  parseConfigFile: vi.fn(),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    getRuleIds: vi.fn(),
    loadAllRules: vi.fn(),
  },
}))

vi.mock('../../src/utils/string-similarity.js', () => ({
  findClosestMatches: vi.fn(),
}))

import * as fs from 'node:fs/promises'
import * as os from 'node:os'

import { discoverConfig } from '../../src/config/discovery.js'
import { parseConfigFile } from '../../src/config/parser.js'
import { discoverFiles } from '../../src/core/file-discovery.js'
import { lazyRuleLoader } from '../../src/rules/lazy-loader.js'
import { findClosestMatches } from '../../src/utils/string-similarity.js'

function makeResult(): DoctorResult {
  return { checks: [], errors: 0, passed: true, warnings: 0 }
}

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── fileExists ───

describe('fileExists', () => {
  it('returns true for existing file', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Awaited<ReturnType<typeof fs.stat>>)
    expect(await fileExists('/some/file.ts')).toBe(true)
  })

  it('returns false for directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as Awaited<ReturnType<typeof fs.stat>>)
    expect(await fileExists('/some/dir')).toBe(false)
  })

  it('returns false when stat throws', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    expect(await fileExists('/missing')).toBe(false)
  })
})

// ─── checkNodeVersion ───

describe('checkNodeVersion', () => {
  it('reports ok for Node >= 20', async () => {
    const originalVersion = process.version
    Object.defineProperty(process, 'version', { value: 'v22.1.0', configurable: true })
    const result = makeResult()
    await checkNodeVersion(result)
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('v22.1.0')
    Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
  })

  it('reports error for Node < 20', async () => {
    const originalVersion = process.version
    Object.defineProperty(process, 'version', { value: 'v18.0.0', configurable: true })
    const result = makeResult()
    await checkNodeVersion(result)
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('error')
    expect(result.checks[0]!.details).toContain('upgrade')
    Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
  })
})

// ─── checkMemory ───

describe('checkMemory', () => {
  it('reports ok when memory >= 512MB', async () => {
    vi.mocked(os.totalmem).mockReturnValue(8 * 1024 * 1024 * 1024) // 8GB
    const result = makeResult()
    await checkMemory(result)
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('8')
  })

  it('reports warning when memory < 512MB', async () => {
    vi.mocked(os.totalmem).mockReturnValue(256 * 1024 * 1024) // 256MB
    const result = makeResult()
    await checkMemory(result)
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
    expect(result.checks[0]!.message).toContain('low')
  })
})

// ─── checkConfigExists ───

describe('checkConfigExists', () => {
  it('reports ok when config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    const result = makeResult()
    await checkConfigExists(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('Config file found')
  })

  it('reports warning when no config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const result = makeResult()
    await checkConfigExists(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
    expect(result.checks[0]!.message).toContain('No config file found')
  })

  it('includes expected config names in details when missing', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const result = makeResult()
    await checkConfigExists(result, '/project')
    expect(result.checks[0]!.details).toContain('.codeforgerc')
  })
})

// ─── checkConfigValid ───

describe('checkConfigValid', () => {
  it('reports ok for valid config', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({})
    const result = makeResult()
    await checkConfigValid(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
  })

  it('skips check when no config file exists', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const result = makeResult()
    await checkConfigValid(result, '/project')
    expect(result.checks).toHaveLength(0)
  })

  it('reports error for invalid config', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(new Error('Bad JSON'))
    const result = makeResult()
    await checkConfigValid(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('error')
    expect(result.checks[0]!.details).toContain('Bad JSON')
  })
})

// ─── checkRulesValid ───

describe('checkRulesValid', () => {
  it('reports ok when all rules are known', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'no-eval': 'error' } })
    vi.mocked(lazyRuleLoader.getRuleIds).mockReturnValue(['no-eval', 'prefer-const'])
    const result = makeResult()
    await checkRulesValid(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
  })

  it('reports error for unknown rules with suggestions', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'no-evalx': 'error' } })
    vi.mocked(lazyRuleLoader.getRuleIds).mockReturnValue(['no-eval', 'prefer-const'])
    vi.mocked(findClosestMatches).mockReturnValue([{ candidate: 'no-eval', score: 0.9 }])
    const result = makeResult()
    await checkRulesValid(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('error')
    expect(result.checks[0]!.message).toContain('no-evalx')
    expect(result.checks[0]!.details).toContain('no-eval')
  })

  it('reports error without suggestions when no close matches', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'zzzzz': 'error' } })
    vi.mocked(lazyRuleLoader.getRuleIds).mockReturnValue(['no-eval', 'prefer-const'])
    vi.mocked(findClosestMatches).mockReturnValue([])
    const result = makeResult()
    await checkRulesValid(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('error')
    expect(result.checks[0]!.details).toContain('Valid rules')
  })

  it('skips when no config file', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const result = makeResult()
    await checkRulesValid(result, '/project')
    expect(result.checks).toHaveLength(0)
  })

  it('handles config with no rules property', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(lazyRuleLoader.getRuleIds).mockReturnValue(['no-eval'])
    const result = makeResult()
    await checkRulesValid(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
  })
})

// ─── checkFilePatterns ───

describe('checkFilePatterns', () => {
  it('reports ok for valid patterns', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts', 'src/**/*.js'] })
    const result = makeResult()
    await checkFilePatterns(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
  })

  it('reports warning for empty patterns', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: [] })
    const result = makeResult()
    await checkFilePatterns(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
  })

  it('reports error for invalid patterns (empty strings)', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts', '  ', ''] })
    const result = makeResult()
    await checkFilePatterns(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('error')
    expect(result.checks[0]!.message).toContain('Invalid file patterns')
  })

  it('skips when no config file', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const result = makeResult()
    await checkFilePatterns(result, '/project')
    expect(result.checks).toHaveLength(0)
  })
})

// ─── checkFileCount ───

describe('checkFileCount', () => {
  it('reports ok for reasonable file count', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(discoverFiles).mockResolvedValue([
      { path: 'a.ts', absolutePath: '/project/a.ts' },
      { path: 'b.ts', absolutePath: '/project/b.ts' },
    ])
    const result = makeResult()
    await checkFileCount(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('2')
  })

  it('reports warning for large codebase', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({})
    const manyFiles = Array.from({ length: 1001 }, (_, i) => ({
      path: `file${i}.ts`,
      absolutePath: `/project/file${i}.ts`,
    }))
    vi.mocked(discoverFiles).mockResolvedValue(manyFiles)
    const result = makeResult()
    await checkFileCount(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
    expect(result.checks[0]!.message).toContain('Large codebase')
  })

  it('uses defaults when no config exists', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    vi.mocked(discoverFiles).mockResolvedValue([])
    const result = makeResult()
    await checkFileCount(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('0')
  })

  it('reports warning on discovery error', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    vi.mocked(discoverFiles).mockRejectedValue(new Error('disk error'))
    const result = makeResult()
    await checkFileCount(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
    expect(result.checks[0]!.message).toContain('Could not count files')
  })
})

// ─── checkTsConfig ───

describe('checkTsConfig', () => {
  it('reports ok when tsconfig.json exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Awaited<ReturnType<typeof fs.stat>>)
    const result = makeResult()
    await checkTsConfig(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('tsconfig.json')
  })

  it('reports warning when tsconfig missing but TS files exist', async () => {
    // First call (tsconfig stat) fails, second call (discoverFiles) succeeds
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue([
      { path: 'index.ts', absolutePath: '/project/index.ts' },
    ])
    const result = makeResult()
    await checkTsConfig(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
    expect(result.checks[0]!.message).toContain('not found')
  })

  it('reports nothing when tsconfig missing and no TS files', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue([])
    const result = makeResult()
    await checkTsConfig(result, '/project')
    expect(result.checks).toHaveLength(0)
  })
})

// ─── checkPackageJson ───

describe('checkPackageJson', () => {
  it('reports ok when package.json exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Awaited<ReturnType<typeof fs.stat>>)
    const result = makeResult()
    await checkPackageJson(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('package.json')
  })

  it('reports warning when package.json missing', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const result = makeResult()
    await checkPackageJson(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
    expect(result.checks[0]!.details).toContain('Node.js')
  })
})

// ─── checkTypeScript ───

describe('checkTypeScript', () => {
  it('reports ok with TypeScript version when installed', async () => {
    // tsconfig stat succeeds
    const statCalls: Array<{ isFile: () => boolean }> = []
    vi.mocked(fs.stat).mockImplementation(async (path: string) => {
      const calls: Record<string, { isFile: () => boolean }> = {
        '/project/tsconfig.json': { isFile: () => true },
      }
      const entry = calls[path as string]
      statCalls.push(entry ?? { isFile: () => false })
      if (!entry) throw new Error('ENOENT')
      return entry as Awaited<ReturnType<typeof fs.stat>>
    })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ version: '5.4.0' }))
    const result = makeResult()
    await checkTypeScript(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('ok')
    expect(result.checks[0]!.message).toContain('5.4.0')
  })

  it('reports warning when tsconfig exists but TS not installed', async () => {
    vi.mocked(fs.stat).mockImplementation(async (path: string) => {
      if ((path as string).includes('tsconfig.json')) {
        return { isFile: () => true } as Awaited<ReturnType<typeof fs.stat>>
      }
      throw new Error('ENOENT')
    })
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    const result = makeResult()
    await checkTypeScript(result, '/project')
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.status).toBe('warning')
    expect(result.checks[0]!.message).toContain('not installed')
  })

  it('reports nothing when no tsconfig', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const result = makeResult()
    await checkTypeScript(result, '/project')
    expect(result.checks).toHaveLength(0)
  })
})
