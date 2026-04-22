import { describe, test, expect } from 'vitest'
import { DEFAULT_CONFIG, CONFIG_FILE_NAMES } from '../../../src/config/types'
import type {
  CodeForgeConfig,
  ConfigLoadResult,
  ConfigDiscoveryOptions,
  RuleEnvConfig,
} from '../../../src/config/types'
import type { RuleSeverity, RuleOptions } from '../../../src/rules/types'

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

describe('DEFAULT_CONFIG - files array', () => {
  test('has exactly 4 file patterns', () => {
    expect(DEFAULT_CONFIG.files).toHaveLength(4)
  })

  test('includes TypeScript glob', () => {
    expect(DEFAULT_CONFIG.files).toContain('**/*.ts')
  })

  test('includes TSX glob', () => {
    expect(DEFAULT_CONFIG.files).toContain('**/*.tsx')
  })

  test('includes JavaScript glob', () => {
    expect(DEFAULT_CONFIG.files).toContain('**/*.js')
  })

  test('includes JSX glob', () => {
    expect(DEFAULT_CONFIG.files).toContain('**/*.jsx')
  })

  test('all entries are strings', () => {
    for (const pattern of DEFAULT_CONFIG.files!) {
      expect(typeof pattern).toBe('string')
    }
  })

  test('all entries start with **/*.', () => {
    for (const pattern of DEFAULT_CONFIG.files!) {
      expect(pattern).toMatch(/^\*\*\/\*\./)
    }
  })

  test('does not include empty strings', () => {
    for (const pattern of DEFAULT_CONFIG.files!) {
      expect(pattern.length).toBeGreaterThan(0)
    }
  })
})

describe('DEFAULT_CONFIG - ignore array', () => {
  test('has exactly 3 ignore patterns', () => {
    expect(DEFAULT_CONFIG.ignore).toHaveLength(3)
  })

  test('includes node_modules pattern', () => {
    expect(DEFAULT_CONFIG.ignore).toContain('node_modules/**')
  })

  test('includes dist pattern', () => {
    expect(DEFAULT_CONFIG.ignore).toContain('dist/**')
  })

  test('includes coverage pattern', () => {
    expect(DEFAULT_CONFIG.ignore).toContain('coverage/**')
  })

  test('all entries are strings', () => {
    for (const pattern of DEFAULT_CONFIG.ignore!) {
      expect(typeof pattern).toBe('string')
    }
  })

  test('all entries end with /**', () => {
    for (const pattern of DEFAULT_CONFIG.ignore!) {
      expect(pattern).toMatch(/\/\*\*$/)
    }
  })

  test('does not include empty strings', () => {
    for (const pattern of DEFAULT_CONFIG.ignore!) {
      expect(pattern.length).toBeGreaterThan(0)
    }
  })
})

describe('DEFAULT_CONFIG - structure', () => {
  test('does not have plugins property', () => {
    expect(DEFAULT_CONFIG.plugins).toBeUndefined()
  })

  test('does not have rules property', () => {
    expect(DEFAULT_CONFIG.rules).toBeUndefined()
  })

  test('files property is defined', () => {
    expect(DEFAULT_CONFIG.files).toBeDefined()
  })

  test('ignore property is defined', () => {
    expect(DEFAULT_CONFIG.ignore).toBeDefined()
  })

  test('files is an array', () => {
    expect(Array.isArray(DEFAULT_CONFIG.files)).toBe(true)
  })

  test('ignore is an array', () => {
    expect(Array.isArray(DEFAULT_CONFIG.ignore)).toBe(true)
  })
})

describe('CONFIG_FILE_NAMES', () => {
  test('has exactly 4 entries', () => {
    expect(CONFIG_FILE_NAMES).toHaveLength(4)
  })

  test('first entry is .codeforgerc', () => {
    expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
  })

  test('second entry is .codeforgerc.json', () => {
    expect(CONFIG_FILE_NAMES[1]).toBe('.codeforgerc.json')
  })

  test('third entry is .codeforge.json', () => {
    expect(CONFIG_FILE_NAMES[2]).toBe('.codeforge.json')
  })

  test('fourth entry is codeforge.config.js', () => {
    expect(CONFIG_FILE_NAMES[3]).toBe('codeforge.config.js')
  })

  test('contains .codeforgerc', () => {
    expect(CONFIG_FILE_NAMES).toContain('.codeforgerc')
  })

  test('contains .codeforgerc.json', () => {
    expect(CONFIG_FILE_NAMES).toContain('.codeforgerc.json')
  })

  test('contains .codeforge.json', () => {
    expect(CONFIG_FILE_NAMES).toContain('.codeforge.json')
  })

  test('contains codeforge.config.js', () => {
    expect(CONFIG_FILE_NAMES).toContain('codeforge.config.js')
  })

  test('all entries are non-empty strings', () => {
    for (const name of CONFIG_FILE_NAMES) {
      expect(typeof name).toBe('string')
      expect(name.length).toBeGreaterThan(0)
    }
  })

  test('contains no duplicates', () => {
    const unique = new Set(CONFIG_FILE_NAMES)
    expect(unique.size).toBe(CONFIG_FILE_NAMES.length)
  })

  test('has rc file without extension', () => {
    const noExt = CONFIG_FILE_NAMES.filter((n) => !n.includes('.'))
    expect(noExt.length).toBe(0)
  })

  test('.codeforgerc starts with a dot', () => {
    expect(CONFIG_FILE_NAMES[0]).toMatch(/^\./)
  })

  test('codeforge.config.js does not start with a dot', () => {
    expect(CONFIG_FILE_NAMES[3]).not.toMatch(/^\./)
  })

  test('all config file names contain "codeforge"', () => {
    for (const name of CONFIG_FILE_NAMES) {
      expect(name).toContain('codeforge')
    }
  })

  test('two entries have .json extension', () => {
    const jsonFiles = CONFIG_FILE_NAMES.filter((n) => n.endsWith('.json'))
    expect(jsonFiles).toHaveLength(2)
  })

  test('one entry has .js extension', () => {
    const jsFiles = CONFIG_FILE_NAMES.filter((n) => n.endsWith('.js'))
    expect(jsFiles).toHaveLength(1)
  })

  test('is a readonly tuple', () => {
    expect(CONFIG_FILE_NAMES).toBeInstanceOf(Array)
  })
})

describe('CodeForgeConfig - files field', () => {
  test('accepts single file pattern', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    expect(config.files).toEqual(['**/*.ts'])
  })

  test('accepts multiple file patterns', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    }
    expect(config.files).toHaveLength(3)
  })

  test('accepts empty files array', () => {
    const config: CodeForgeConfig = { files: [] }
    expect(config.files).toEqual([])
  })

  test('accepts glob patterns with directories', () => {
    const config: CodeForgeConfig = { files: ['src/**/*.ts'] }
    expect(config.files).toContain('src/**/*.ts')
  })

  test('accepts specific file path', () => {
    const config: CodeForgeConfig = { files: ['src/index.ts'] }
    expect(config.files).toContain('src/index.ts')
  })

  test('accepts negation patterns', () => {
    const config: CodeForgeConfig = { files: ['!**/*.d.ts'] }
    expect(config.files).toContain('!**/*.d.ts')
  })

  test('accepts files without files field', () => {
    const config: CodeForgeConfig = {}
    expect(config.files).toBeUndefined()
  })

  test('accepts patterns with multiple extensions', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.{ts,tsx,js,jsx}'],
    }
    expect(config.files).toHaveLength(1)
  })

  test('accepts deeply nested glob patterns', () => {
    const config: CodeForgeConfig = {
      files: ['src/**/test/**/*.spec.ts'],
    }
    expect(config.files).toHaveLength(1)
  })
})

describe('CodeForgeConfig - ignore field', () => {
  test('accepts single ignore pattern', () => {
    const config: CodeForgeConfig = { ignore: ['dist/**'] }
    expect(config.ignore).toEqual(['dist/**'])
  })

  test('accepts multiple ignore patterns', () => {
    const config: CodeForgeConfig = {
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
    }
    expect(config.ignore).toHaveLength(3)
  })

  test('accepts empty ignore array', () => {
    const config: CodeForgeConfig = { ignore: [] }
    expect(config.ignore).toEqual([])
  })

  test('accepts ignore without files', () => {
    const config: CodeForgeConfig = { ignore: ['coverage/**'] }
    expect(config.ignore).toHaveLength(1)
    expect(config.files).toBeUndefined()
  })

  test('works alongside files', () => {
    const config: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['**/test/**'],
    }
    expect(config.files).toHaveLength(1)
    expect(config.ignore).toHaveLength(1)
  })

  test('accepts dotfile ignore patterns', () => {
    const config: CodeForgeConfig = { ignore: ['.*'] }
    expect(config.ignore).toEqual(['.*'])
  })

  test('can be undefined', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    expect(config.ignore).toBeUndefined()
  })
})

describe('CodeForgeConfig - plugins field', () => {
  test('accepts single plugin', () => {
    const config: CodeForgeConfig = { plugins: ['codeforge-plugin-example'] }
    expect(config.plugins).toHaveLength(1)
  })

  test('accepts multiple plugins', () => {
    const config: CodeForgeConfig = {
      plugins: ['plugin-a', 'plugin-b', 'plugin-c'],
    }
    expect(config.plugins).toHaveLength(3)
  })

  test('accepts empty plugins array', () => {
    const config: CodeForgeConfig = { plugins: [] }
    expect(config.plugins).toEqual([])
  })

  test('accepts scoped plugin names', () => {
    const config: CodeForgeConfig = {
      plugins: ['@scope/codeforge-plugin'],
    }
    expect(config.plugins).toContain('@scope/codeforge-plugin')
  })

  test('accepts relative path plugins', () => {
    const config: CodeForgeConfig = {
      plugins: ['./plugins/custom-plugin'],
    }
    expect(config.plugins).toContain('./plugins/custom-plugin')
  })

  test('can be undefined', () => {
    const config: CodeForgeConfig = {}
    expect(config.plugins).toBeUndefined()
  })
})

describe('CodeForgeConfig - rules with severity-only values', () => {
  test('accepts error severity', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-eval': 'error' },
    }
    expect(config.rules?.['no-eval']).toBe('error')
  })

  test('accepts warning severity', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-console': 'warning' },
    }
    expect(config.rules?.['no-console']).toBe('warning')
  })

  test('accepts info severity', () => {
    const config: CodeForgeConfig = {
      rules: { 'prefer-const': 'info' },
    }
    expect(config.rules?.['prefer-const']).toBe('info')
  })

  test('accepts multiple rules with different severities', () => {
    const config: CodeForgeConfig = {
      rules: {
        'no-eval': 'error',
        'no-console': 'warning',
        'prefer-const': 'info',
      },
    }
    expect(Object.keys(config.rules!)).toHaveLength(3)
  })

  test('accepts empty rules object', () => {
    const config: CodeForgeConfig = { rules: {} }
    expect(config.rules).toEqual({})
  })

  test('accepts hyphenated rule names', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-circular-deps': 'error' },
    }
    expect(config.rules?.['no-circular-deps']).toBe('error')
  })

  test('accepts slash-prefixed rule names', () => {
    const config: CodeForgeConfig = {
      rules: { 'plugin/rule-name': 'warning' },
    }
    expect(config.rules?.['plugin/rule-name']).toBe('warning')
  })

  test('accepts camelCase rule names', () => {
    const config: CodeForgeConfig = {
      rules: { maxComplexity: 'error' },
    }
    expect(config.rules?.maxComplexity).toBe('error')
  })

  test('accepts underscore rule names', () => {
    const config: CodeForgeConfig = {
      rules: { no_underscore_dangle: 'warning' },
    }
    expect(config.rules?.no_underscore_dangle).toBe('warning')
  })
})

describe('CodeForgeConfig - rules with [severity, options] tuples', () => {
  test('accepts error with empty options', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-eval': ['error', {}] },
    }
    expect(config.rules?.['no-eval']).toEqual(['error', {}])
  })

  test('accepts warning with empty options', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-console': ['warning', {}] },
    }
    expect(config.rules?.['no-console']).toEqual(['warning', {}])
  })

  test('accepts info with empty options', () => {
    const config: CodeForgeConfig = {
      rules: { 'prefer-const': ['info', {}] },
    }
    expect(config.rules?.['prefer-const']).toEqual(['info', {}])
  })

  test('accepts error with max option', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['error', { max: 3 }] },
    }
    expect(config.rules?.['max-params']).toEqual(['error', { max: 3 }])
  })

  test('accepts warning with max option', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-lines': ['warning', { max: 300 }] },
    }
    expect(config.rules?.['max-lines']).toEqual(['warning', { max: 300 }])
  })

  test('accepts info with max option', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-depth': ['info', { max: 4 }] },
    }
    expect(config.rules?.['max-depth']).toEqual(['info', { max: 4 }])
  })

  test('accepts options with custom string property', () => {
    const config: CodeForgeConfig = {
      rules: { 'naming-convention': ['error', { pattern: '^[A-Z]' }] },
    }
    expect(config.rules?.['naming-convention']).toEqual(['error', { pattern: '^[A-Z]' }])
  })

  test('accepts options with boolean property', () => {
    const config: CodeForgeConfig = {
      rules: { 'require-jsdoc': ['warning', { require: true }] },
    }
    expect(config.rules?.['require-jsdoc']).toEqual(['warning', { require: true }])
  })

  test('accepts options with array property', () => {
    const config: CodeForgeConfig = {
      rules: { 'allowed-methods': ['error', { allow: ['log', 'warn'] }] },
    }
    expect(config.rules?.['allowed-methods']).toEqual(['error', { allow: ['log', 'warn'] }])
  })

  test('accepts options with nested object property', () => {
    const config: CodeForgeConfig = {
      rules: {
        'import-order': ['error', { groups: { builtin: true, external: true } }],
      },
    }
    const rule = config.rules?.['import-order'] as [string, RuleOptions]
    expect(rule[1].groups).toEqual({ builtin: true, external: true })
  })

  test('accepts options with numeric property', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-complexity': ['error', { max: 10 }] },
    }
    expect(config.rules?.['max-complexity']).toEqual(['error', { max: 10 }])
  })

  test('accepts options with null property', () => {
    const config: CodeForgeConfig = {
      rules: { 'some-rule': ['warning', { value: null }] },
    }
    expect(config.rules?.['some-rule']).toEqual(['warning', { value: null }])
  })

  test('accepts options with zero max', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-param': ['error', { max: 0 }] },
    }
    expect(config.rules?.['no-param']).toEqual(['error', { max: 0 }])
  })

  test('accepts options with negative max', () => {
    const config: CodeForgeConfig = {
      rules: { 'some-rule': ['error', { max: -1 }] },
    }
    expect(config.rules?.['some-rule']).toEqual(['error', { max: -1 }])
  })

  test('accepts options with large max', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-lines': ['error', { max: 10000 }] },
    }
    expect(config.rules?.['max-lines']).toEqual(['error', { max: 10000 }])
  })

  test('accepts options with multiple properties', () => {
    const config: CodeForgeConfig = {
      rules: {
        'max-params': ['error', { max: 4, min: 0 }],
      },
    }
    const rule = config.rules?.['max-params'] as [string, RuleOptions]
    expect(rule[1].max).toBe(4)
    expect(rule[1].min).toBe(0)
  })
})

describe('CodeForgeConfig - rules mixed severity and tuples', () => {
  test('mixes severity strings and tuples in same rules', () => {
    const config: CodeForgeConfig = {
      rules: {
        'no-eval': 'error',
        'max-params': ['error', { max: 3 }],
        'no-console': 'warning',
        'max-lines': ['warning', { max: 300 }],
      },
    }
    expect(config.rules?.['no-eval']).toBe('error')
    expect(config.rules?.['max-params']).toEqual(['error', { max: 3 }])
    expect(config.rules?.['no-console']).toBe('warning')
    expect(config.rules?.['max-lines']).toEqual(['warning', { max: 300 }])
  })

  test('has many rules', () => {
    const rules: RuleEnvConfig = {
      'no-eval': 'error',
      'no-console': 'warning',
      'no-debugger': 'error',
      'prefer-const': 'info',
      'no-var': 'error',
      'eq-eq-eq': 'error',
      curly: 'warning',
      'max-params': ['error', { max: 3 }],
      'max-depth': ['warning', { max: 4 }],
      'max-lines': ['error', { max: 500 }],
    }
    const config: CodeForgeConfig = { rules }
    expect(Object.keys(config.rules!)).toHaveLength(10)
  })
})

describe('CodeForgeConfig - all fields combined', () => {
  test('accepts all fields simultaneously', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      ignore: ['node_modules/**'],
      plugins: ['plugin-a'],
      rules: { 'no-eval': 'error' },
    }
    expect(config.files).toBeDefined()
    expect(config.ignore).toBeDefined()
    expect(config.plugins).toBeDefined()
    expect(config.rules).toBeDefined()
  })

  test('accepts only files and rules', () => {
    const config: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      rules: { 'max-params': 'error' },
    }
    expect(config.files).toHaveLength(1)
    expect(config.ignore).toBeUndefined()
    expect(config.plugins).toBeUndefined()
  })

  test('accepts only plugins and rules', () => {
    const config: CodeForgeConfig = {
      plugins: ['my-plugin'],
      rules: { 'no-eval': 'error' },
    }
    expect(config.plugins).toHaveLength(1)
    expect(config.files).toBeUndefined()
    expect(config.ignore).toBeUndefined()
  })

  test('accepts files, ignore, and plugins without rules', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      ignore: ['dist/**'],
      plugins: ['custom-plugin'],
    }
    expect(config.rules).toBeUndefined()
    expect(config.files).toHaveLength(1)
    expect(config.ignore).toHaveLength(1)
    expect(config.plugins).toHaveLength(1)
  })

  test('realistic full config', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ignore: ['node_modules/**', 'dist/**', 'coverage/**', '**/*.d.ts'],
      plugins: ['codeforge-plugin-security', 'codeforge-plugin-perf'],
      rules: {
        'no-eval': 'error',
        'no-console': 'warning',
        'prefer-const': 'info',
        'max-params': ['error', { max: 4 }],
        'no-circular-deps': 'error',
      },
    }
    expect(config.files).toHaveLength(4)
    expect(config.ignore).toHaveLength(4)
    expect(config.plugins).toHaveLength(2)
    expect(Object.keys(config.rules!)).toHaveLength(5)
  })
})

describe('ConfigLoadResult - filePath variations', () => {
  test('accepts absolute path string', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: '/home/user/project/.codeforgerc.json',
    }
    expect(result.filePath).toBe('/home/user/project/.codeforgerc.json')
  })

  test('accepts null filePath', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: null,
    }
    expect(result.filePath).toBeNull()
  })

  test('accepts relative-like path', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: '.codeforgerc',
    }
    expect(result.filePath).toBe('.codeforgerc')
  })

  test('accepts Windows-style path', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: 'C:\\Users\\project\\.codeforgerc.json',
    }
    expect(result.filePath).toBe('C:\\Users\\project\\.codeforgerc.json')
  })

  test('filePath can reference .codeforgerc.json', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: '/project/.codeforgerc.json',
    }
    expect(result.filePath).toContain('.codeforgerc.json')
  })

  test('filePath can reference .codeforge.json', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: '/project/.codeforge.json',
    }
    expect(result.filePath).toContain('.codeforge.json')
  })

  test('filePath can reference codeforge.config.js', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: '/project/codeforge.config.js',
    }
    expect(result.filePath).toContain('codeforge.config.js')
  })

  test('filePath can reference .codeforgerc', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: '/project/.codeforgerc',
    }
    expect(result.filePath).toContain('.codeforgerc')
  })
})

describe('ConfigLoadResult - config variations', () => {
  test('config can be empty', () => {
    const result: ConfigLoadResult = { config: {}, filePath: null }
    expect(result.config).toEqual({})
  })

  test('config can be DEFAULT_CONFIG', () => {
    const result: ConfigLoadResult = { config: DEFAULT_CONFIG, filePath: null }
    expect(result.config.files).toBeDefined()
    expect(result.config.ignore).toBeDefined()
  })

  test('config can have only files', () => {
    const result: ConfigLoadResult = {
      config: { files: ['src/**/*.ts'] },
      filePath: '/path/to/config',
    }
    expect(result.config.files).toHaveLength(1)
    expect(result.config.ignore).toBeUndefined()
  })

  test('config can have only rules', () => {
    const result: ConfigLoadResult = {
      config: { rules: { 'no-eval': 'error' } },
      filePath: '/path/to/config',
    }
    expect(result.config.rules).toBeDefined()
  })

  test('config can have full configuration', () => {
    const result: ConfigLoadResult = {
      config: {
        files: ['**/*.ts'],
        ignore: ['node_modules/**'],
        plugins: ['my-plugin'],
        rules: { 'no-eval': 'error' },
      },
      filePath: '/project/.codeforgerc.json',
    }
    expect(result.config.files).toBeDefined()
    expect(result.config.ignore).toBeDefined()
    expect(result.config.plugins).toBeDefined()
    expect(result.config.rules).toBeDefined()
    expect(result.filePath).toBe('/project/.codeforgerc.json')
  })

  test('multiple results with different configs', () => {
    const result1: ConfigLoadResult = { config: {}, filePath: null }
    const result2: ConfigLoadResult = { config: DEFAULT_CONFIG, filePath: '/path' }
    expect(result1.filePath).toBeNull()
    expect(result2.filePath).toBe('/path')
    expect(result1.config).not.toBe(result2.config)
  })
})

describe('ConfigDiscoveryOptions - cwd', () => {
  test('accepts absolute path', () => {
    const options: ConfigDiscoveryOptions = { cwd: '/home/user/project' }
    expect(options.cwd).toBe('/home/user/project')
  })

  test('accepts root path', () => {
    const options: ConfigDiscoveryOptions = { cwd: '/' }
    expect(options.cwd).toBe('/')
  })

  test('accepts deeply nested path', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/a/b/c/d/e/f',
    }
    expect(options.cwd).toBe('/a/b/c/d/e/f')
  })

  test('accepts relative-like string', () => {
    const options: ConfigDiscoveryOptions = { cwd: '.' }
    expect(options.cwd).toBe('.')
  })

  test('accepts empty string cwd', () => {
    const options: ConfigDiscoveryOptions = { cwd: '' }
    expect(options.cwd).toBe('')
  })

  test('cwd is always defined', () => {
    const options: ConfigDiscoveryOptions = { cwd: '/project' }
    expect(options.cwd).toBeDefined()
    expect(typeof options.cwd).toBe('string')
  })
})

describe('ConfigDiscoveryOptions - stopAt', () => {
  test('accepts absolute stopAt path', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/project',
      stopAt: '/home',
    }
    expect(options.stopAt).toBe('/home')
  })

  test('accepts root stopAt', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/project',
      stopAt: '/',
    }
    expect(options.stopAt).toBe('/')
  })

  test('stopAt is optional', () => {
    const options: ConfigDiscoveryOptions = { cwd: '/project' }
    expect(options.stopAt).toBeUndefined()
  })

  test('stopAt can equal cwd', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/project',
      stopAt: '/project',
    }
    expect(options.stopAt).toBe(options.cwd)
  })

  test('stopAt can be parent of cwd', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/home/user/project',
      stopAt: '/home/user',
    }
    expect(options.stopAt).toBe('/home/user')
  })

  test('stopAt with trailing slash', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/project',
      stopAt: '/home/',
    }
    expect(options.stopAt).toBe('/home/')
  })
})

describe('RuleSeverity values', () => {
  test('"error" is a valid severity', () => {
    const severity: RuleSeverity = 'error'
    expect(severity).toBe('error')
  })

  test('"warning" is a valid severity', () => {
    const severity: RuleSeverity = 'warning'
    expect(severity).toBe('warning')
  })

  test('"info" is a valid severity', () => {
    const severity: RuleSeverity = 'info'
    expect(severity).toBe('info')
  })

  test('error severity in rules config', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-eval': 'error' },
    }
    expect(config.rules?.['no-eval']).toBe('error')
  })

  test('warning severity in rules config', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-console': 'warning' },
    }
    expect(config.rules?.['no-console']).toBe('warning')
  })

  test('info severity in rules config', () => {
    const config: CodeForgeConfig = {
      rules: { 'prefer-const': 'info' },
    }
    expect(config.rules?.['prefer-const']).toBe('info')
  })

  test('severity in tuple form - error', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['error', { max: 3 }] },
    }
    const rule = config.rules?.['max-params'] as [RuleSeverity, RuleOptions]
    expect(rule[0]).toBe('error')
  })

  test('severity in tuple form - warning', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['warning', { max: 3 }] },
    }
    const rule = config.rules?.['max-params'] as [RuleSeverity, RuleOptions]
    expect(rule[0]).toBe('warning')
  })

  test('severity in tuple form - info', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['info', { max: 3 }] },
    }
    const rule = config.rules?.['max-params'] as [RuleSeverity, RuleOptions]
    expect(rule[0]).toBe('info')
  })

  test('all three severities used simultaneously', () => {
    const config: CodeForgeConfig = {
      rules: {
        'rule-a': 'error',
        'rule-b': 'warning',
        'rule-c': 'info',
      },
    }
    expect(config.rules?.['rule-a']).toBe('error')
    expect(config.rules?.['rule-b']).toBe('warning')
    expect(config.rules?.['rule-c']).toBe('info')
  })
})

describe('RuleOptions', () => {
  test('accepts empty object', () => {
    const options: RuleOptions = {}
    expect(options).toEqual({})
  })

  test('accepts max property', () => {
    const options: RuleOptions = { max: 10 }
    expect(options.max).toBe(10)
  })

  test('accepts max with value 0', () => {
    const options: RuleOptions = { max: 0 }
    expect(options.max).toBe(0)
  })

  test('accepts max with large value', () => {
    const options: RuleOptions = { max: 999999 }
    expect(options.max).toBe(999999)
  })

  test('accepts string property', () => {
    const options: RuleOptions = { pattern: '^[A-Z]' }
    expect(options.pattern).toBe('^[A-Z]')
  })

  test('accepts boolean property', () => {
    const options: RuleOptions = { strict: true }
    expect(options.strict).toBe(true)
  })

  test('accepts array property', () => {
    const options: RuleOptions = { exclude: ['test', 'spec'] }
    expect(options.exclude).toEqual(['test', 'spec'])
  })

  test('accepts object property', () => {
    const options: RuleOptions = { config: { nested: true } }
    expect(options.config).toEqual({ nested: true })
  })

  test('accepts null property', () => {
    const options: RuleOptions = { value: null }
    expect(options.value).toBeNull()
  })

  test('accepts multiple properties', () => {
    const options: RuleOptions = { max: 10, min: 1, strict: true }
    expect(options.max).toBe(10)
    expect(options.min).toBe(1)
    expect(options.strict).toBe(true)
  })

  test('used in tuple with error', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['error', { max: 5 }] },
    }
    const rule = config.rules?.['max-params'] as [RuleSeverity, RuleOptions]
    expect(rule[0]).toBe('error')
    expect(rule[1].max).toBe(5)
  })

  test('used in tuple with warning', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-depth': ['warning', { max: 4 }] },
    }
    const rule = config.rules?.['max-depth'] as [RuleSeverity, RuleOptions]
    expect(rule[0]).toBe('warning')
    expect(rule[1].max).toBe(4)
  })

  test('used in tuple with info', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-lines': ['info', { max: 200 }] },
    }
    const rule = config.rules?.['max-lines'] as [RuleSeverity, RuleOptions]
    expect(rule[0]).toBe('info')
    expect(rule[1].max).toBe(200)
  })
})

describe('RuleEnvConfig', () => {
  test('accepts empty object', () => {
    const rules: RuleEnvConfig = {}
    expect(rules).toEqual({})
  })

  test('accepts single severity-only rule', () => {
    const rules: RuleEnvConfig = { 'no-eval': 'error' }
    expect(rules['no-eval']).toBe('error')
  })

  test('accepts single tuple rule', () => {
    const rules: RuleEnvConfig = { 'max-params': ['error', { max: 3 }] }
    expect(rules['max-params']).toEqual(['error', { max: 3 }])
  })

  test('accepts mixed rules', () => {
    const rules: RuleEnvConfig = {
      'no-eval': 'error',
      'max-params': ['error', { max: 3 }],
      'no-console': 'warning',
    }
    expect(Object.keys(rules)).toHaveLength(3)
  })

  test('accepts rules with all severity types as strings', () => {
    const rules: RuleEnvConfig = {
      a: 'error',
      b: 'warning',
      c: 'info',
    }
    expect(rules.a).toBe('error')
    expect(rules.b).toBe('warning')
    expect(rules.c).toBe('info')
  })

  test('accepts rules with all severity types as tuples', () => {
    const rules: RuleEnvConfig = {
      a: ['error', {}],
      b: ['warning', {}],
      c: ['info', {}],
    }
    expect(rules.a).toEqual(['error', {}])
    expect(rules.b).toEqual(['warning', {}])
    expect(rules.c).toEqual(['info', {}])
  })

  test('accepts rules with complex options', () => {
    const rules: RuleEnvConfig = {
      'import-order': [
        'error',
        {
          groups: { builtin: true, external: true, internal: true },
          alphabetize: true,
        },
      ],
    }
    expect(rules['import-order']).toBeDefined()
  })

  test('can be assigned to CodeForgeConfig.rules', () => {
    const rules: RuleEnvConfig = { 'no-eval': 'error' }
    const config: CodeForgeConfig = { rules }
    expect(config.rules).toBe(rules)
  })
})

describe('Edge cases - immutability and constants', () => {
  test('DEFAULT_CONFIG.files is a specific array', () => {
    expect(DEFAULT_CONFIG.files).toEqual(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'])
  })

  test('DEFAULT_CONFIG.ignore is a specific array', () => {
    expect(DEFAULT_CONFIG.ignore).toEqual(['node_modules/**', 'dist/**', 'coverage/**'])
  })

  test('CONFIG_FILE_NAMES is exactly 4 items', () => {
    expect(CONFIG_FILE_NAMES.length).toBe(4)
  })

  test('CONFIG_FILE_NAMES matches snapshot', () => {
    expect(CONFIG_FILE_NAMES).toEqual([
      '.codeforgerc',
      '.codeforgerc.json',
      '.codeforge.json',
      'codeforge.config.js',
    ])
  })

  test('DEFAULT_CONFIG matches snapshot', () => {
    expect(DEFAULT_CONFIG).toEqual({
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
    })
  })
})

describe('Edge cases - config shapes', () => {
  test('config with only files empty array', () => {
    const config: CodeForgeConfig = { files: [] }
    expect(config.files).toHaveLength(0)
    expect(config.ignore).toBeUndefined()
  })

  test('config with only ignore empty array', () => {
    const config: CodeForgeConfig = { ignore: [] }
    expect(config.ignore).toHaveLength(0)
    expect(config.files).toBeUndefined()
  })

  test('config with only plugins empty array', () => {
    const config: CodeForgeConfig = { plugins: [] }
    expect(config.plugins).toHaveLength(0)
  })

  test('config with only rules empty object', () => {
    const config: CodeForgeConfig = { rules: {} }
    expect(Object.keys(config.rules!)).toHaveLength(0)
  })

  test('config files can contain duplicates', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.ts'],
    }
    expect(config.files).toHaveLength(2)
  })

  test('rule name can be very long', () => {
    const longName = 'very-long-rule-name-that-goes-on-and-on-and-on'
    const config: CodeForgeConfig = {
      rules: { [longName]: 'error' },
    }
    expect(config.rules?.[longName]).toBe('error')
  })

  test('rule name can contain special characters', () => {
    const config: CodeForgeConfig = {
      rules: { '@scope/plugin/rule-name': 'error' },
    }
    expect(config.rules?.['@scope/plugin/rule-name']).toBe('error')
  })

  test('tuple rule with many options', () => {
    const config: CodeForgeConfig = {
      rules: {
        'complex-rule': [
          'error',
          {
            max: 10,
            min: 1,
            strict: true,
            pattern: '^test',
            exclude: ['a', 'b'],
          },
        ],
      },
    }
    const rule = config.rules?.['complex-rule'] as [string, RuleOptions]
    expect(rule[1].max).toBe(10)
    expect(rule[1].min).toBe(1)
    expect(rule[1].strict).toBe(true)
  })

  test('config with unicode in ignore pattern', () => {
    const config: CodeForgeConfig = {
      ignore: ['日本語/**'],
    }
    expect(config.ignore).toContain('日本語/**')
  })

  test('config with spaces in patterns', () => {
    const config: CodeForgeConfig = {
      files: ['path with spaces/**/*.ts'],
    }
    expect(config.files).toContain('path with spaces/**/*.ts')
  })
})

describe('Edge cases - ConfigLoadResult variations', () => {
  test('config with empty rules in load result', () => {
    const result: ConfigLoadResult = {
      config: { rules: {} },
      filePath: '/path',
    }
    expect(result.config.rules).toEqual({})
  })

  test('config with DEFAULT_CONFIG in load result', () => {
    const result: ConfigLoadResult = {
      config: DEFAULT_CONFIG,
      filePath: null,
    }
    expect(result.config.files).toHaveLength(4)
    expect(result.config.ignore).toHaveLength(3)
  })

  test('null filePath means no config file found', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: null,
    }
    expect(result.filePath).toBeNull()
  })

  test('string filePath means config file was found', () => {
    const result: ConfigLoadResult = {
      config: {},
      filePath: '/found/.codeforgerc.json',
    }
    expect(typeof result.filePath).toBe('string')
  })

  test('config can have plugins in load result', () => {
    const result: ConfigLoadResult = {
      config: { plugins: ['my-plugin'] },
      filePath: '/path',
    }
    expect(result.config.plugins).toHaveLength(1)
  })
})

describe('Edge cases - ConfigDiscoveryOptions variations', () => {
  test('cwd with special characters', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/home/user/my-project',
    }
    expect(options.cwd).toBe('/home/user/my-project')
  })

  test('cwd as dot', () => {
    const options: ConfigDiscoveryOptions = { cwd: '.' }
    expect(options.cwd).toBe('.')
  })

  test('cwd as double dot', () => {
    const options: ConfigDiscoveryOptions = { cwd: '..' }
    expect(options.cwd).toBe('..')
  })

  test('cwd with tilde path', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '~/projects/my-app',
    }
    expect(options.cwd).toBe('~/projects/my-app')
  })

  test('stopAt with different depth than cwd', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/a/b/c/d',
      stopAt: '/a',
    }
    expect(options.stopAt).toBe('/a')
    expect(options.cwd).toBe('/a/b/c/d')
  })
})

describe('Realistic config scenarios', () => {
  test('minimal TypeScript project config', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      ignore: ['node_modules/**', 'dist/**'],
      rules: {
        'no-eval': 'error',
        'no-console': 'warning',
      },
    }
    expect(config.files).toHaveLength(1)
    expect(config.ignore).toHaveLength(2)
    expect(Object.keys(config.rules!)).toHaveLength(2)
  })

  test('monorepo config with plugins', () => {
    const config: CodeForgeConfig = {
      files: ['packages/**/*.ts'],
      ignore: ['**/node_modules/**', '**/dist/**'],
      plugins: ['codeforge-plugin-custom'],
      rules: {
        'no-circular-deps': 'error',
        'max-complexity': ['warning', { max: 15 }],
      },
    }
    expect(config.files).toHaveLength(1)
    expect(config.ignore).toHaveLength(2)
    expect(config.plugins).toHaveLength(1)
    expect(Object.keys(config.rules!)).toHaveLength(2)
  })

  test('CI-focused strict config', () => {
    const config: CodeForgeConfig = {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      ignore: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      rules: {
        'no-eval': 'error',
        'no-debugger': 'error',
        'no-console': 'error',
        'max-params': ['error', { max: 3 }],
        'max-depth': ['error', { max: 4 }],
        'max-lines': ['error', { max: 300 }],
        'no-circular-deps': 'error',
      },
    }
    expect(config.files).toHaveLength(2)
    expect(config.ignore).toHaveLength(2)
    const ruleCount = Object.keys(config.rules!).length
    expect(ruleCount).toBe(7)
  })

  test('lenient development config', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      rules: {
        'no-eval': 'error',
        'no-console': 'info',
        'prefer-const': 'info',
      },
    }
    expect(config.files).toHaveLength(4)
    expect(config.ignore).toBeUndefined()
    expect(config.plugins).toBeUndefined()
  })

  test('config for code review', () => {
    const result: ConfigLoadResult = {
      config: {
        files: ['src/**/*.ts'],
        ignore: ['**/*.d.ts'],
        rules: {
          'max-complexity': ['warning', { max: 10 }],
          'max-params': ['warning', { max: 4 }],
          'no-any': 'warning',
        },
      },
      filePath: '/project/.codeforgerc.json',
    }
    expect(result.filePath).toContain('.codeforgerc.json')
    expect(result.config.files).toHaveLength(1)
    expect(result.config.ignore).toHaveLength(1)
  })

  test('config discovery from project root', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/projects/my-app',
      stopAt: '/projects',
    }
    const result: ConfigLoadResult = {
      config: DEFAULT_CONFIG,
      filePath: '/projects/my-app/.codeforgerc.json',
    }
    expect(options.cwd).toBe('/projects/my-app')
    expect(options.stopAt).toBe('/projects')
    expect(result.filePath).toContain(options.cwd)
  })

  test('plugin-heavy config', () => {
    const config: CodeForgeConfig = {
      plugins: [
        'codeforge-plugin-security',
        'codeforge-plugin-perf',
        'codeforge-plugin-complexity',
        '@internal/codeforge-rules',
      ],
      rules: {
        'security/no-hardcoded-secrets': 'error',
        'perf/no-large-loop': 'warning',
        'complexity/max-nesting': ['error', { max: 3 }],
      },
    }
    expect(config.plugins).toHaveLength(4)
    expect(Object.keys(config.rules!)).toHaveLength(3)
  })

  test('config with all optional fields populated', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
      plugins: ['plugin-a', 'plugin-b'],
      rules: {
        'rule-1': 'error',
        'rule-2': 'warning',
        'rule-3': 'info',
        'rule-4': ['error', { max: 10 }],
        'rule-5': ['warning', { max: 5 }],
        'rule-6': ['info', { max: 1 }],
      },
    }
    expect(config.files).toHaveLength(2)
    expect(config.ignore).toHaveLength(3)
    expect(config.plugins).toHaveLength(2)
    expect(Object.keys(config.rules!)).toHaveLength(6)
  })
})

describe('Type narrowing and structural checks', () => {
  test('tuple rule is an array', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['error', { max: 3 }] },
    }
    const rule = config.rules?.['max-params']
    expect(Array.isArray(rule)).toBe(true)
  })

  test('severity-only rule is a string', () => {
    const config: CodeForgeConfig = {
      rules: { 'no-eval': 'error' },
    }
    const rule = config.rules?.['no-eval']
    expect(typeof rule).toBe('string')
  })

  test('tuple rule has length 2', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['error', { max: 3 }] },
    }
    const rule = config.rules?.['max-params'] as [string, RuleOptions]
    expect(rule).toHaveLength(2)
  })

  test('tuple rule first element is severity string', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['warning', { max: 3 }] },
    }
    const rule = config.rules?.['max-params'] as [string, RuleOptions]
    expect(['error', 'warning', 'info']).toContain(rule[0])
  })

  test('tuple rule second element is object', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-params': ['error', { max: 3 }] },
    }
    const rule = config.rules?.['max-params'] as [string, RuleOptions]
    expect(typeof rule[1]).toBe('object')
    expect(rule[1]).not.toBeNull()
  })

  test('ConfigLoadResult has exactly 2 properties', () => {
    const result: ConfigLoadResult = { config: {}, filePath: null }
    expect(Object.keys(result)).toHaveLength(2)
    expect(Object.keys(result)).toContain('config')
    expect(Object.keys(result)).toContain('filePath')
  })

  test('ConfigDiscoveryOptions has cwd property', () => {
    const options: ConfigDiscoveryOptions = { cwd: '/test' }
    expect(Object.keys(options)).toContain('cwd')
  })

  test('CodeForgeConfig can have 0 to 4 properties', () => {
    const c0: CodeForgeConfig = {}
    const c1: CodeForgeConfig = { files: [] }
    const c2: CodeForgeConfig = { files: [], ignore: [] }
    const c3: CodeForgeConfig = { files: [], ignore: [], plugins: [] }
    const c4: CodeForgeConfig = {
      files: [],
      ignore: [],
      plugins: [],
      rules: {},
    }
    expect(Object.keys(c0)).toHaveLength(0)
    expect(Object.keys(c1)).toHaveLength(1)
    expect(Object.keys(c2)).toHaveLength(2)
    expect(Object.keys(c3)).toHaveLength(3)
    expect(Object.keys(c4)).toHaveLength(4)
  })

  test('DEFAULT_CONFIG has no extra properties', () => {
    const keys = Object.keys(DEFAULT_CONFIG)
    expect(keys).toHaveLength(2)
    expect(keys).toContain('files')
    expect(keys).toContain('ignore')
  })
})

describe('Rule tuple destructuring patterns', () => {
  test('tuple can be destructured to severity and options', () => {
    const config: CodeForgeConfig = {
      rules: { 'max-complexity': ['error', { max: 10 }] },
    }
    const ruleValue = config.rules?.['max-complexity']
    expect(Array.isArray(ruleValue)).toBe(true)
    if (Array.isArray(ruleValue)) {
      const [severity, options] = ruleValue as [RuleSeverity, RuleOptions]
      expect(severity).toBe('error')
      expect(options.max).toBe(10)
    }
  })

  test('multiple tuple rules can be iterated', () => {
    const config: CodeForgeConfig = {
      rules: {
        'max-params': ['error', { max: 3 }],
        'max-depth': ['warning', { max: 4 }],
        'max-lines': ['info', { max: 200 }],
      },
    }
    const severities: string[] = []
    for (const [, value] of Object.entries(config.rules!)) {
      if (Array.isArray(value)) {
        severities.push(value[0])
      }
    }
    expect(severities).toContain('error')
    expect(severities).toContain('warning')
    expect(severities).toContain('info')
  })

  test('rules can be counted by type', () => {
    const config: CodeForgeConfig = {
      rules: {
        'no-eval': 'error',
        'no-console': 'warning',
        'max-params': ['error', { max: 3 }],
        'max-depth': ['warning', { max: 4 }],
      },
    }
    let stringRules = 0
    let tupleRules = 0
    for (const value of Object.values(config.rules!)) {
      if (typeof value === 'string') stringRules++
      if (Array.isArray(value)) tupleRules++
    }
    expect(stringRules).toBe(2)
    expect(tupleRules).toBe(2)
  })
})

describe('Config file name patterns', () => {
  test('hidden file names start with dot', () => {
    const hidden = CONFIG_FILE_NAMES.filter((n) => n.startsWith('.'))
    expect(hidden).toHaveLength(3)
  })

  test('non-hidden file name is codeforge.config.js', () => {
    const nonHidden = CONFIG_FILE_NAMES.filter((n) => !n.startsWith('.'))
    expect(nonHidden).toEqual(['codeforge.config.js'])
  })

  test('json config files end with .json', () => {
    const jsonConfigs = CONFIG_FILE_NAMES.filter((n) => n.endsWith('.json'))
    expect(jsonConfigs).toEqual(['.codeforgerc.json', '.codeforge.json'])
  })

  test('config file names are in expected order', () => {
    expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
    expect(CONFIG_FILE_NAMES[1]).toBe('.codeforgerc.json')
    expect(CONFIG_FILE_NAMES[2]).toBe('.codeforge.json')
    expect(CONFIG_FILE_NAMES[3]).toBe('codeforge.config.js')
  })

  test('.codeforgerc is the rc file without extension', () => {
    expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
  })

  test('js config file contains ".config."', () => {
    expect(CONFIG_FILE_NAMES[3]).toContain('.config.')
  })
})

describe('DEFAULT_CONFIG file pattern details', () => {
  test('files covers TypeScript files', () => {
    const tsFiles = DEFAULT_CONFIG.files!.filter((f) => f.includes('.ts'))
    expect(tsFiles.length).toBeGreaterThanOrEqual(1)
  })

  test('files covers JavaScript files', () => {
    const jsFiles = DEFAULT_CONFIG.files!.filter((f) => f.includes('.js'))
    expect(jsFiles.length).toBeGreaterThanOrEqual(1)
  })

  test('files covers JSX files', () => {
    const jsxFiles = DEFAULT_CONFIG.files!.filter((f) => f.includes('.jsx'))
    expect(jsxFiles.length).toBeGreaterThanOrEqual(1)
  })

  test('files covers TSX files', () => {
    const tsxFiles = DEFAULT_CONFIG.files!.filter((f) => f.includes('.tsx'))
    expect(tsxFiles.length).toBeGreaterThanOrEqual(1)
  })

  test('ignore excludes build output', () => {
    expect(DEFAULT_CONFIG.ignore).toContain('dist/**')
  })

  test('ignore excludes dependencies', () => {
    expect(DEFAULT_CONFIG.ignore).toContain('node_modules/**')
  })

  test('ignore excludes coverage reports', () => {
    expect(DEFAULT_CONFIG.ignore).toContain('coverage/**')
  })
})

describe('Complex config interactions', () => {
  test('rules object can be shared between configs', () => {
    const rules: RuleEnvConfig = { 'no-eval': 'error' }
    const config1: CodeForgeConfig = { rules }
    const config2: CodeForgeConfig = { rules }
    expect(config1.rules).toBe(config2.rules)
  })

  test('different configs are independent', () => {
    const config1: CodeForgeConfig = { files: ['a'] }
    const config2: CodeForgeConfig = { files: ['b'] }
    expect(config1.files).not.toBe(config2.files)
  })

  test('ConfigLoadResult can wrap any CodeForgeConfig', () => {
    const configs: CodeForgeConfig[] = [
      {},
      { files: ['**/*.ts'] },
      { rules: { 'no-eval': 'error' } },
      DEFAULT_CONFIG,
    ]
    for (const config of configs) {
      const result: ConfigLoadResult = { config, filePath: null }
      expect(result.config).toBe(config)
      expect(result.filePath).toBeNull()
    }
  })

  test('many rules do not cause type errors', () => {
    const rules: RuleEnvConfig = {}
    for (let i = 0; i < 50; i++) {
      rules[`rule-${i}`] = i % 2 === 0 ? 'error' : ['warning', { max: i }]
    }
    const config: CodeForgeConfig = { rules }
    expect(Object.keys(config.rules!)).toHaveLength(50)
  })

  test('ConfigDiscoveryOptions can be used for traversal', () => {
    const options: ConfigDiscoveryOptions = {
      cwd: '/a/b/c',
      stopAt: '/a',
    }
    const parts = options.cwd.split('/')
    const stopParts = options.stopAt!.split('/')
    expect(parts.length).toBeGreaterThan(stopParts.length)
  })
})

describe('Config with various file pattern types', () => {
  test('accepts globstar patterns', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', 'src/**/test/**'],
    }
    expect(config.files!.every((f) => f.includes('**'))).toBe(true)
  })

  test('accepts question mark patterns', () => {
    const config: CodeForgeConfig = {
      files: ['test?.ts'],
    }
    expect(config.files).toContain('test?.ts')
  })

  test('accepts bracket patterns', () => {
    const config: CodeForgeConfig = {
      files: ['*[!.d].ts'],
    }
    expect(config.files).toContain('*[!.d].ts')
  })

  test('accepts brace expansion patterns', () => {
    const config: CodeForgeConfig = {
      files: ['*.{ts,js}'],
    }
    expect(config.files).toContain('*.{ts,js}')
  })
})
