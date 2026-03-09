import { describe, test, expect } from 'vitest'
import { DEFAULT_CONFIG, CONFIG_FILE_NAMES } from '../../../src/config/types'
import type {
  CodeForgeConfig,
  ConfigLoadResult,
  ConfigDiscoveryOptions,
} from '../../../src/config/types'

describe('Config Types', () => {
  test('CodeForgeConfig allows rules config', () => {
    const config: CodeForgeConfig = {
      rules: {
        'max-complexity': 'error',
        'no-await-in-loop': ['warning', {}],
      },
    }
    expect(config.rules).toBeDefined()
  })

  test('CodeForgeConfig allows files and ignore patterns', () => {
    const config: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['**/test/**'],
    }
    expect(config.files).toHaveLength(1)
    expect(config.ignore).toHaveLength(1)
  })

  test('DEFAULT_CONFIG has sensible defaults', () => {
    expect(DEFAULT_CONFIG.files).toContain('**/*.ts')
    expect(DEFAULT_CONFIG.ignore).toContain('node_modules/**')
  })

  test('CONFIG_FILE_NAMES contains expected file names', () => {
    expect(CONFIG_FILE_NAMES).toContain('.codeforgerc')
    expect(CONFIG_FILE_NAMES).toContain('.codeforgerc.json')
    expect(CONFIG_FILE_NAMES).toContain('.codeforge.json')
    expect(CONFIG_FILE_NAMES).toContain('codeforge.config.js')
  })

  test('CodeForgeConfig can be empty', () => {
    const config: CodeForgeConfig = {}
    expect(config).toEqual({})
  })

  test('CodeForgeConfig rules can have options', () => {
    const config: CodeForgeConfig = {
      rules: {
        'max-complexity': ['error', { max: 10 }],
      },
    }
    expect(config.rules?.['max-complexity']).toEqual(['error', { max: 10 }])
  })

  test('ConfigLoadResult structure', () => {
    const result: ConfigLoadResult = {
      config: { files: ['**/*.ts'] },
      filePath: '/path/to/config.json',
    }
    expect(result.config).toBeDefined()
    expect(result.filePath).toBe('/path/to/config.json')
  })

  test('ConfigLoadResult with null filePath', () => {
    const result: ConfigLoadResult = {
      config: DEFAULT_CONFIG,
      filePath: null,
    }
    expect(result.filePath).toBeNull()
  })

  test('ConfigDiscoveryOptions structure', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/project/root',
      stopAt: '/home/user',
    }
    expect(options.cwd).toBe('/project/root')
    expect(options.stopAt).toBe('/home/user')
  })

  test('ConfigDiscoveryOptions requires only cwd', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/project/root',
    }
    expect(options.cwd).toBe('/project/root')
    expect(options.stopAt).toBeUndefined()
  })
})
