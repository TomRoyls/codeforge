import { describe, test, expect } from 'vitest'
import { mergeConfigs, mergeEnvConfig } from '../../../src/config/merger'
import { DEFAULT_CONFIG } from '../../../src/config/types'
import type { CodeForgeConfig } from '../../../src/config/types'

// ============================================================================
// EXISTING TESTS (preserved exactly)
// ============================================================================

describe('mergeConfigs', () => {
  test('uses defaults when both empty', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(result.rules).toEqual({})
  })

  test('CLI flags override file config', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: ['lib/**/*.js'],
      ignore: ['dist/**'],
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual(['lib/**/*.js'])
    expect(result.ignore).toEqual(['dist/**'])
  })

  test('CLI rules override file rules', () => {
    const fileConfig: CodeForgeConfig = {
      rules: {
        'max-complexity': 'error',
        'no-eval': 'warning',
      },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      rules: {
        'max-complexity': 'info',
      },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules).toEqual({
      'max-complexity': 'info',
      'no-eval': 'warning',
    })
  })

  test('uses file config when CLI not provided', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      rules: {
        'max-complexity': 'error',
      },
    }
    const result = mergeConfigs(fileConfig, {})
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**'])
    expect(result.rules).toEqual({ 'max-complexity': 'error' })
  })

  test('properly merges nested rules objects', () => {
    const fileConfig: CodeForgeConfig = {
      rules: {
        'max-complexity': ['error', { max: 10 }],
        'max-lines': ['warning', { max: 500 }],
        'no-eval': 'error',
      },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      rules: {
        'max-complexity': ['warning', { max: 20 }],
        'prefer-const': 'error',
      },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules).toEqual({
      'max-complexity': ['warning', { max: 20 }],
      'max-lines': ['warning', { max: 500 }],
      'no-eval': 'error',
      'prefer-const': 'error',
    })
  })

  test('CLI empty array overrides file config', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: [],
      ignore: [],
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual([])
    expect(result.ignore).toEqual([])
  })

  test('CLI undefined falls back to file config', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: undefined,
      ignore: undefined,
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**'])
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - files field
// ============================================================================

describe('mergeConfigs - files field', () => {
  test('returns default files when fileConfig has no files and no CLI flags', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
  })

  test('returns default files when fileConfig.files is undefined', () => {
    const result = mergeConfigs({ files: undefined }, {})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
  })

  test('uses file config files when CLI flags omitted', () => {
    const result = mergeConfigs({ files: ['**/*.ts'] }, {})
    expect(result.files).toEqual(['**/*.ts'])
  })

  test('CLI files with single pattern overrides file config', () => {
    const result = mergeConfigs({ files: ['src/**/*.ts'] }, { files: ['lib/**/*.js'] })
    expect(result.files).toEqual(['lib/**/*.js'])
  })

  test('CLI files with multiple patterns overrides file config', () => {
    const result = mergeConfigs(
      { files: ['src/**/*.ts'] },
      { files: ['lib/**/*.js', 'app/**/*.ts', 'utils/**/*.tsx'] },
    )
    expect(result.files).toEqual(['lib/**/*.js', 'app/**/*.ts', 'utils/**/*.tsx'])
  })

  test('CLI empty array takes precedence over file config array', () => {
    const result = mergeConfigs({ files: ['src/**/*.ts', 'lib/**/*.js'] }, { files: [] })
    expect(result.files).toEqual([])
  })

  test('CLI empty array takes precedence over default config', () => {
    const result = mergeConfigs({}, { files: [] })
    expect(result.files).toEqual([])
  })

  test('CLI undefined falls through to file config with value', () => {
    const result = mergeConfigs({ files: ['custom/**'] }, { files: undefined })
    expect(result.files).toEqual(['custom/**'])
  })

  test('CLI undefined falls through to file config without value then default', () => {
    const result = mergeConfigs({}, { files: undefined })
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
  })

  test('file config with globstar pattern is preserved when CLI has no files', () => {
    const result = mergeConfigs({ files: ['**/*.spec.ts'] }, {})
    expect(result.files).toEqual(['**/*.spec.ts'])
  })

  test('file config with negation pattern is preserved when CLI has no files', () => {
    const result = mergeConfigs({ files: ['**/*.ts', '!**/*.d.ts'] }, {})
    expect(result.files).toEqual(['**/*.ts', '!**/*.d.ts'])
  })

  test('CLI files completely replace file config files (no concatenation)', () => {
    const result = mergeConfigs({ files: ['src/**/*.ts'] }, { files: ['test/**/*.test.ts'] })
    expect(result.files).not.toContain('src/**/*.ts')
    expect(result.files).toEqual(['test/**/*.test.ts'])
  })

  test('file config with single extension pattern', () => {
    const result = mergeConfigs({ files: ['**/*.tsx'] }, {})
    expect(result.files).toEqual(['**/*.tsx'])
  })

  test('CLI files with many extensions replaces everything', () => {
    const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs']
    const result = mergeConfigs({ files: ['src/**/*.ts'] }, { files: patterns })
    expect(result.files).toEqual(patterns)
    expect(result.files).toHaveLength(6)
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - ignore field
// ============================================================================

describe('mergeConfigs - ignore field', () => {
  test('returns default ignore when fileConfig has no ignore and no CLI flags', () => {
    const result = mergeConfigs({}, {})
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  test('returns default ignore when fileConfig.ignore is undefined', () => {
    const result = mergeConfigs({ ignore: undefined }, {})
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  test('uses file config ignore when CLI flags omitted', () => {
    const result = mergeConfigs({ ignore: ['vendor/**'] }, {})
    expect(result.ignore).toEqual(['vendor/**'])
  })

  test('CLI ignore overrides file config ignore', () => {
    const result = mergeConfigs({ ignore: ['node_modules/**'] }, { ignore: ['build/**'] })
    expect(result.ignore).toEqual(['build/**'])
  })

  test('CLI ignore with multiple patterns overrides file config', () => {
    const result = mergeConfigs(
      { ignore: ['node_modules/**'] },
      { ignore: ['dist/**', 'coverage/**', '.git/**'] },
    )
    expect(result.ignore).toEqual(['dist/**', 'coverage/**', '.git/**'])
  })

  test('CLI empty ignore array overrides file config', () => {
    const result = mergeConfigs({ ignore: ['node_modules/**', 'dist/**'] }, { ignore: [] })
    expect(result.ignore).toEqual([])
  })

  test('CLI empty ignore array overrides defaults', () => {
    const result = mergeConfigs({}, { ignore: [] })
    expect(result.ignore).toEqual([])
  })

  test('CLI undefined ignore falls through to file config', () => {
    const result = mergeConfigs({ ignore: ['custom/**'] }, { ignore: undefined })
    expect(result.ignore).toEqual(['custom/**'])
  })

  test('CLI undefined ignore falls through to defaults when file config empty', () => {
    const result = mergeConfigs({}, { ignore: undefined })
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  test('file config with negation ignore pattern', () => {
    const result = mergeConfigs({ ignore: ['**/*.spec.ts', '!src/**/*.spec.ts'] }, {})
    expect(result.ignore).toEqual(['**/*.spec.ts', '!src/**/*.spec.ts'])
  })

  test('CLI ignore completely replaces file config ignore (no merge)', () => {
    const result = mergeConfigs({ ignore: ['a/**', 'b/**'] }, { ignore: ['c/**'] })
    expect(result.ignore).not.toContain('a/**')
    expect(result.ignore).not.toContain('b/**')
    expect(result.ignore).toEqual(['c/**'])
  })

  test('file config ignore with many patterns preserved', () => {
    const patterns = ['node_modules/**', 'dist/**', 'build/**', '.cache/**', 'coverage/**']
    const result = mergeConfigs({ ignore: patterns }, {})
    expect(result.ignore).toEqual(patterns)
    expect(result.ignore).toHaveLength(5)
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - rules field
// ============================================================================

describe('mergeConfigs - rules field', () => {
  test('returns empty rules when neither config has rules', () => {
    const result = mergeConfigs({}, {})
    expect(result.rules).toEqual({})
  })

  test('returns empty rules when file config has no rules and CLI has no rules', () => {
    const result = mergeConfigs({ files: ['**/*.ts'] }, { files: ['**/*.js'] })
    expect(result.rules).toEqual({})
  })

  test('preserves file config rules when CLI has no rules', () => {
    const result = mergeConfigs({ rules: { 'no-eval': 'error' } }, {})
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('preserves file config rules when CLI has rules undefined', () => {
    const result = mergeConfigs({ rules: { 'no-eval': 'error' } }, { rules: undefined })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('adds CLI-only rules on top of file config rules', () => {
    const result = mergeConfigs(
      { rules: { 'no-eval': 'error' } },
      { rules: { 'prefer-const': 'warning' } },
    )
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'prefer-const': 'warning',
    })
  })

  test('CLI rule severity overrides same rule from file config', () => {
    const result = mergeConfigs(
      { rules: { 'max-params': 'error' } },
      { rules: { 'max-params': 'warning' } },
    )
    expect(result.rules).toEqual({ 'max-params': 'warning' })
  })

  test('CLI rule with options overrides file config rule without options', () => {
    const result = mergeConfigs(
      { rules: { 'max-lines': 'error' } },
      { rules: { 'max-lines': ['warning', { max: 300 }] } },
    )
    expect(result.rules).toEqual({ 'max-lines': ['warning', { max: 300 }] })
  })

  test('CLI rule without options overrides file config rule with options', () => {
    const result = mergeConfigs(
      { rules: { 'max-lines': ['error', { max: 500 }] } },
      { rules: { 'max-lines': 'warning' } },
    )
    expect(result.rules).toEqual({ 'max-lines': 'warning' })
  })

  test('CLI rule with options overrides file config rule with different options', () => {
    const result = mergeConfigs(
      { rules: { 'max-complexity': ['error', { max: 10 }] } },
      { rules: { 'max-complexity': ['warning', { max: 20 }] } },
    )
    expect(result.rules).toEqual({ 'max-complexity': ['warning', { max: 20 }] })
  })

  test('merges many rules from both sources', () => {
    const result = mergeConfigs(
      {
        rules: {
          'no-eval': 'error',
          'no-console': 'warning',
          'prefer-const': 'error',
        },
      },
      {
        rules: {
          'max-params': 'error',
          'no-magic-numbers': 'warning',
        },
      },
    )
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'no-console': 'warning',
      'prefer-const': 'error',
      'max-params': 'error',
      'no-magic-numbers': 'warning',
    })
    expect(Object.keys(result.rules)).toHaveLength(5)
  })

  test('file config rules with all three severity levels', () => {
    const result = mergeConfigs({ rules: { rule1: 'error', rule2: 'warning', rule3: 'info' } }, {})
    expect(result.rules).toEqual({ rule1: 'error', rule2: 'warning', rule3: 'info' })
  })

  test('CLI rules with all three severity levels override file config', () => {
    const result = mergeConfigs(
      { rules: { rule1: 'info', rule2: 'info', rule3: 'info' } },
      { rules: { rule1: 'error', rule2: 'warning', rule3: 'info' } },
    )
    expect(result.rules).toEqual({ rule1: 'error', rule2: 'warning', rule3: 'info' })
  })

  test('rule with array value is not mutated', () => {
    const cliRules = { 'max-complexity': ['error', { max: 5 }] as const }
    const result = mergeConfigs({}, { rules: cliRules })
    expect(result.rules['max-complexity']).toEqual(['error', { max: 5 }])
  })

  test('handles single rule with special characters in name', () => {
    const result = mergeConfigs(
      { rules: { 'no-unused-vars': 'error' } },
      { rules: { '@typescript-eslint/no-explicit-any': 'warning' } },
    )
    expect(result.rules).toEqual({
      'no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warning',
    })
  })

  test('empty CLI rules object does not affect file rules', () => {
    const result = mergeConfigs({ rules: { 'no-eval': 'error' } }, { rules: {} })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('empty file rules with CLI rules returns CLI rules', () => {
    const result = mergeConfigs({ rules: {} }, { rules: { 'no-eval': 'error' } })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - priority chain (CLI > file > default)
// ============================================================================

describe('mergeConfigs - priority chain CLI > file > default', () => {
  test('files: CLI > file > default', () => {
    const result = mergeConfigs({ files: ['file/**/*.ts'] }, { files: ['cli/**/*.js'] })
    expect(result.files).toEqual(['cli/**/*.js'])
  })

  test('files: file > default when CLI absent', () => {
    const result = mergeConfigs({ files: ['file/**/*.ts'] }, {})
    expect(result.files).toEqual(['file/**/*.ts'])
  })

  test('files: default when both absent', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
  })

  test('ignore: CLI > file > default', () => {
    const result = mergeConfigs({ ignore: ['file-ignore/**'] }, { ignore: ['cli-ignore/**'] })
    expect(result.ignore).toEqual(['cli-ignore/**'])
  })

  test('ignore: file > default when CLI absent', () => {
    const result = mergeConfigs({ ignore: ['file-ignore/**'] }, {})
    expect(result.ignore).toEqual(['file-ignore/**'])
  })

  test('ignore: default when both absent', () => {
    const result = mergeConfigs({}, {})
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  test('priority applies independently per field - files from CLI, ignore from file', () => {
    const result = mergeConfigs(
      { files: ['file-pattern/**'], ignore: ['file-ignore/**'] },
      { files: ['cli-pattern/**'] },
    )
    expect(result.files).toEqual(['cli-pattern/**'])
    expect(result.ignore).toEqual(['file-ignore/**'])
  })

  test('priority applies independently per field - files from file, ignore from CLI', () => {
    const result = mergeConfigs(
      { files: ['file-pattern/**'], ignore: ['file-ignore/**'] },
      { ignore: ['cli-ignore/**'] },
    )
    expect(result.files).toEqual(['file-pattern/**'])
    expect(result.ignore).toEqual(['cli-ignore/**'])
  })

  test('priority applies independently per field - files from CLI, ignore from default', () => {
    const result = mergeConfigs({}, { files: ['cli-pattern/**'] })
    expect(result.files).toEqual(['cli-pattern/**'])
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  test('priority applies independently per field - files from default, ignore from CLI', () => {
    const result = mergeConfigs({}, { ignore: ['cli-ignore/**'] })
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(['cli-ignore/**'])
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - return type structure
// ============================================================================

describe('mergeConfigs - return type structure', () => {
  test('result always has files property', () => {
    const result = mergeConfigs({}, {})
    expect(result).toHaveProperty('files')
    expect(Array.isArray(result.files)).toBe(true)
  })

  test('result always has ignore property', () => {
    const result = mergeConfigs({}, {})
    expect(result).toHaveProperty('ignore')
    expect(Array.isArray(result.ignore)).toBe(true)
  })

  test('result always has rules property', () => {
    const result = mergeConfigs({}, {})
    expect(result).toHaveProperty('rules')
    expect(typeof result.rules).toBe('object')
  })

  test('result has exactly files, ignore, rules keys', () => {
    const result = mergeConfigs({}, {})
    expect(Object.keys(result)).toEqual(['files', 'ignore', 'rules'])
  })

  test('result is a new object (not reference to inputs)', () => {
    const fileConfig: CodeForgeConfig = { files: ['a'] }
    const cliFlags: Partial<CodeForgeConfig> = { files: ['b'] }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result).not.toBe(fileConfig)
    expect(result).not.toBe(cliFlags)
  })

  test('result rules is a new object (not reference to input rules)', () => {
    const fileRules = { 'no-eval': 'error' }
    const result = mergeConfigs({ rules: fileRules }, {})
    expect(result.rules).not.toBe(fileRules)
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - rules spread behavior
// ============================================================================

describe('mergeConfigs - rules spread order', () => {
  test('file rules are spread first, then CLI rules', () => {
    const result = mergeConfigs(
      { rules: { 'rule-a': 'error' } },
      { rules: { 'rule-b': 'warning' } },
    )
    const keys = Object.keys(result.rules)
    expect(keys).toEqual(['rule-a', 'rule-b'])
  })

  test('CLI rule overwrites same key from file config', () => {
    const result = mergeConfigs({ rules: { shared: 'error' } }, { rules: { shared: 'info' } })
    expect(result.rules.shared).toBe('info')
    expect(Object.keys(result.rules)).toHaveLength(1)
  })

  test('many overlapping rules - CLI always wins for shared keys', () => {
    const result = mergeConfigs(
      {
        rules: {
          alpha: 'error',
          beta: 'error',
          gamma: 'error',
        },
      },
      {
        rules: {
          alpha: 'warning',
          beta: 'info',
          delta: 'error',
        },
      },
    )
    expect(result.rules).toEqual({
      alpha: 'warning',
      beta: 'info',
      gamma: 'error',
      delta: 'error',
    })
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - default parameter
// ============================================================================

describe('mergeConfigs - default CLI parameter', () => {
  test('works with only file config argument', () => {
    const result = mergeConfigs({ files: ['src/**'] })
    expect(result.files).toEqual(['src/**'])
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(result.rules).toEqual({})
  })

  test('works with empty file config and no CLI argument', () => {
    const result = mergeConfigs({})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  test('file config with rules and no CLI argument', () => {
    const result = mergeConfigs({ rules: { 'no-eval': 'error' } })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - rule severity values
// ============================================================================

describe('mergeConfigs - rule severity values', () => {
  test('rule severity error is preserved', () => {
    const result = mergeConfigs({ rules: { test: 'error' } }, {})
    expect(result.rules.test).toBe('error')
  })

  test('rule severity warning is preserved', () => {
    const result = mergeConfigs({ rules: { test: 'warning' } }, {})
    expect(result.rules.test).toBe('warning')
  })

  test('rule severity info is preserved', () => {
    const result = mergeConfigs({ rules: { test: 'info' } }, {})
    expect(result.rules.test).toBe('info')
  })

  test('CLI can change severity from error to warning', () => {
    const result = mergeConfigs({ rules: { test: 'error' } }, { rules: { test: 'warning' } })
    expect(result.rules.test).toBe('warning')
  })

  test('CLI can change severity from warning to error', () => {
    const result = mergeConfigs({ rules: { test: 'warning' } }, { rules: { test: 'error' } })
    expect(result.rules.test).toBe('error')
  })

  test('CLI can change severity from info to error', () => {
    const result = mergeConfigs({ rules: { test: 'info' } }, { rules: { test: 'error' } })
    expect(result.rules.test).toBe('error')
  })

  test('CLI can change severity from error to info', () => {
    const result = mergeConfigs({ rules: { test: 'error' } }, { rules: { test: 'info' } })
    expect(result.rules.test).toBe('info')
  })

  test('CLI can change severity from info to warning', () => {
    const result = mergeConfigs({ rules: { test: 'info' } }, { rules: { test: 'warning' } })
    expect(result.rules.test).toBe('warning')
  })

  test('CLI can change severity from warning to info', () => {
    const result = mergeConfigs({ rules: { test: 'warning' } }, { rules: { test: 'info' } })
    expect(result.rules.test).toBe('info')
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - rule with options arrays
// ============================================================================

describe('mergeConfigs - rules with options arrays', () => {
  test('rule with error and max option', () => {
    const result = mergeConfigs({ rules: { 'max-params': ['error', { max: 4 }] } }, {})
    expect(result.rules['max-params']).toEqual(['error', { max: 4 }])
  })

  test('rule with warning and max option', () => {
    const result = mergeConfigs({ rules: { 'max-lines': ['warning', { max: 300 }] } }, {})
    expect(result.rules['max-lines']).toEqual(['warning', { max: 300 }])
  })

  test('rule with info and max option', () => {
    const result = mergeConfigs({ rules: { 'max-depth': ['info', { max: 4 }] } }, {})
    expect(result.rules['max-depth']).toEqual(['info', { max: 4 }])
  })

  test('CLI overrides rule options from file config', () => {
    const result = mergeConfigs(
      { rules: { 'max-params': ['error', { max: 3 }] } },
      { rules: { 'max-params': ['warning', { max: 5 }] } },
    )
    expect(result.rules['max-params']).toEqual(['warning', { max: 5 }])
  })

  test('CLI string severity overrides file rule with options', () => {
    const result = mergeConfigs(
      { rules: { 'max-lines': ['error', { max: 500 }] } },
      { rules: { 'max-lines': 'warning' } },
    )
    expect(result.rules['max-lines']).toBe('warning')
  })

  test('CLI rule with options overrides file string severity', () => {
    const result = mergeConfigs(
      { rules: { 'max-lines': 'error' } },
      { rules: { 'max-lines': ['warning', { max: 200 }] } },
    )
    expect(result.rules['max-lines']).toEqual(['warning', { max: 200 }])
  })

  test('rule with empty options object', () => {
    const result = mergeConfigs({ rules: { test: ['error', {}] } }, {})
    expect(result.rules.test).toEqual(['error', {}])
  })

  test('rule with multiple options', () => {
    const result = mergeConfigs(
      { rules: { test: ['error', { max: 10, min: 1, allowWhitespace: true }] } },
      {},
    )
    expect(result.rules.test).toEqual(['error', { max: 10, min: 1, allowWhitespace: true }])
  })

  test('mixed rules: some string, some array from file config', () => {
    const result = mergeConfigs(
      {
        rules: {
          'no-eval': 'error',
          'max-params': ['warning', { max: 4 }],
          'prefer-const': 'info',
          'max-lines': ['error', { max: 300 }],
        },
      },
      {},
    )
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['max-params']).toEqual(['warning', { max: 4 }])
    expect(result.rules['prefer-const']).toBe('info')
    expect(result.rules['max-lines']).toEqual(['error', { max: 300 }])
  })

  test('mixed rules: some string, some array from both sources', () => {
    const result = mergeConfigs(
      {
        rules: {
          'no-eval': 'error',
          'max-params': ['warning', { max: 4 }],
        },
      },
      {
        rules: {
          'prefer-const': 'info',
          'max-lines': ['error', { max: 300 }],
        },
      },
    )
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['max-params']).toEqual(['warning', { max: 4 }])
    expect(result.rules['prefer-const']).toBe('info')
    expect(result.rules['max-lines']).toEqual(['error', { max: 300 }])
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - complete config scenarios
// ============================================================================

describe('mergeConfigs - complete config scenarios', () => {
  test('full config from file, no CLI', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
      rules: {
        'no-eval': 'error',
        'max-params': ['warning', { max: 4 }],
        'prefer-const': 'error',
      },
    }
    const result = mergeConfigs(fileConfig, {})
    expect(result.files).toEqual(['src/**/*.ts', 'src/**/*.tsx'])
    expect(result.ignore).toEqual(['node_modules/**', 'dist/**', '**/*.d.ts'])
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'max-params': ['warning', { max: 4 }],
      'prefer-const': 'error',
    })
  })

  test('full config from CLI overrides everything', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      rules: { 'no-eval': 'error' },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: ['test/**/*.spec.ts'],
      ignore: ['fixtures/**'],
      rules: { 'no-console': 'warning' },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual(['test/**/*.spec.ts'])
    expect(result.ignore).toEqual(['fixtures/**'])
    expect(result.rules).toEqual({ 'no-eval': 'error', 'no-console': 'warning' })
  })

  test('partial CLI override - only files changed', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeConfigs(fileConfig, { files: ['lib/**/*.js'] })
    expect(result.files).toEqual(['lib/**/*.js'])
    expect(result.ignore).toEqual(['dist/**'])
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('partial CLI override - only ignore changed', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeConfigs(fileConfig, { ignore: ['coverage/**'] })
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['coverage/**'])
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('partial CLI override - only rules changed', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeConfigs(fileConfig, { rules: { 'no-console': 'warning' } })
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['dist/**'])
    expect(result.rules).toEqual({ 'no-eval': 'error', 'no-console': 'warning' })
  })

  test('realistic CLI analysis scenario', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      rules: {
        'no-eval': 'error',
        'no-console': 'warning',
        'prefer-const': 'error',
        'max-params': ['warning', { max: 4 }],
      },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: ['src/**/*.ts'],
      ignore: ['src/**/*.test.ts'],
      rules: {
        'no-console': 'error',
      },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['src/**/*.test.ts'])
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['no-console']).toBe('error')
    expect(result.rules['prefer-const']).toBe('error')
    expect(result.rules['max-params']).toEqual(['warning', { max: 4 }])
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - nullish coalescing behavior
// ============================================================================

describe('mergeConfigs - nullish coalescing with arrays', () => {
  test('CLI empty array is truthy and overrides', () => {
    const result = mergeConfigs({ files: ['src/**'] }, { files: [] })
    expect(result.files).toEqual([])
  })

  test('CLI undefined falls back to file config', () => {
    const result = mergeConfigs({ files: ['src/**'] }, { files: undefined })
    expect(result.files).toEqual(['src/**'])
  })

  test('file config empty array is used when CLI undefined', () => {
    const result = mergeConfigs({ files: [] }, { files: undefined })
    expect(result.files).toEqual([])
  })

  test('file config empty array falls through to default when CLI also empty', () => {
    const result = mergeConfigs({ files: [] }, {})
    expect(result.files).toEqual([])
  })

  test('both empty arrays result in empty array', () => {
    const result = mergeConfigs({ files: [], ignore: [] }, { files: [], ignore: [] })
    expect(result.files).toEqual([])
    expect(result.ignore).toEqual([])
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig
// ============================================================================

describe('mergeEnvConfig', () => {
  test('returns file config when env config is empty', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeEnvConfig(fileConfig, {})
    expect(result).toEqual(fileConfig)
  })

  test('returns file config when env config uses default parameter', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
    }
    const result = mergeEnvConfig(fileConfig)
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['dist/**'])
  })

  test('env config files override file config', () => {
    const result = mergeEnvConfig({ files: ['src/**/*.ts'] }, { files: ['test/**/*.spec.ts'] })
    expect(result.files).toEqual(['test/**/*.spec.ts'])
  })

  test('env config ignore overrides file config', () => {
    const result = mergeEnvConfig({ ignore: ['node_modules/**'] }, { ignore: ['coverage/**'] })
    expect(result.ignore).toEqual(['coverage/**'])
  })

  test('env config rules override file config rules for same key', () => {
    const result = mergeEnvConfig(
      { rules: { 'no-eval': 'error' } },
      { rules: { 'no-eval': 'warning' } },
    )
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('env config rules add to file config rules', () => {
    const result = mergeEnvConfig(
      { rules: { 'no-eval': 'error' } },
      { rules: { 'prefer-const': 'warning' } },
    )
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'prefer-const': 'warning',
    })
  })

  test('env config with undefined files falls back to file config', () => {
    const result = mergeEnvConfig({ files: ['src/**/*.ts'] }, { files: undefined })
    expect(result.files).toEqual(['src/**/*.ts'])
  })

  test('env config with undefined ignore falls back to file config', () => {
    const result = mergeEnvConfig({ ignore: ['node_modules/**'] }, { ignore: undefined })
    expect(result.ignore).toEqual(['node_modules/**'])
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - no defaults behavior
// ============================================================================

describe('mergeEnvConfig - no defaults behavior', () => {
  test('does not apply DEFAULT_CONFIG for files when both are empty', () => {
    const result = mergeEnvConfig({}, {})
    expect(result.files).toBeUndefined()
  })

  test('does not apply DEFAULT_CONFIG for ignore when both are empty', () => {
    const result = mergeEnvConfig({}, {})
    expect(result.ignore).toBeUndefined()
  })

  test('does not apply DEFAULT_CONFIG for files when file has no files', () => {
    const result = mergeEnvConfig({ ignore: ['a'] }, {})
    expect(result.files).toBeUndefined()
  })

  test('does not apply DEFAULT_CONFIG for ignore when file has no ignore', () => {
    const result = mergeEnvConfig({ files: ['a'] }, {})
    expect(result.ignore).toBeUndefined()
  })

  test('empty file config with env config uses env values', () => {
    const result = mergeEnvConfig({}, { files: ['env/**'], ignore: ['env-ignore/**'] })
    expect(result.files).toEqual(['env/**'])
    expect(result.ignore).toEqual(['env-ignore/**'])
  })

  test('env config empty array for files does override (does not fall back)', () => {
    const result = mergeEnvConfig({ files: ['src/**/*.ts'] }, { files: [] })
    expect(result.files).toEqual([])
  })

  test('env config empty array for ignore does override', () => {
    const result = mergeEnvConfig({ ignore: ['dist/**'] }, { ignore: [] })
    expect(result.ignore).toEqual([])
  })

  test('file config undefined files with env undefined files yields undefined', () => {
    const result = mergeEnvConfig({ files: undefined }, { files: undefined })
    expect(result.files).toBeUndefined()
  })

  test('file config undefined ignore with env undefined ignore yields undefined', () => {
    const result = mergeEnvConfig({ ignore: undefined }, { ignore: undefined })
    expect(result.ignore).toBeUndefined()
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - files field
// ============================================================================

describe('mergeEnvConfig - files field', () => {
  test('env files override file files', () => {
    const result = mergeEnvConfig({ files: ['a'] }, { files: ['b'] })
    expect(result.files).toEqual(['b'])
  })

  test('env undefined files preserves file files', () => {
    const result = mergeEnvConfig({ files: ['a'] }, { files: undefined })
    expect(result.files).toEqual(['a'])
  })

  test('env empty array files overrides file files', () => {
    const result = mergeEnvConfig({ files: ['a', 'b'] }, { files: [] })
    expect(result.files).toEqual([])
  })

  test('env files with multiple patterns override', () => {
    const result = mergeEnvConfig({ files: ['src/**'] }, { files: ['a/**', 'b/**', 'c/**'] })
    expect(result.files).toEqual(['a/**', 'b/**', 'c/**'])
  })

  test('file files with glob patterns preserved when env absent', () => {
    const result = mergeEnvConfig({ files: ['**/*.ts', '!**/*.d.ts'] }, {})
    expect(result.files).toEqual(['**/*.ts', '!**/*.d.ts'])
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - ignore field
// ============================================================================

describe('mergeEnvConfig - ignore field', () => {
  test('env ignore overrides file ignore', () => {
    const result = mergeEnvConfig({ ignore: ['a'] }, { ignore: ['b'] })
    expect(result.ignore).toEqual(['b'])
  })

  test('env undefined ignore preserves file ignore', () => {
    const result = mergeEnvConfig({ ignore: ['a'] }, { ignore: undefined })
    expect(result.ignore).toEqual(['a'])
  })

  test('env empty array ignore overrides file ignore', () => {
    const result = mergeEnvConfig({ ignore: ['a', 'b'] }, { ignore: [] })
    expect(result.ignore).toEqual([])
  })

  test('env ignore with multiple patterns overrides', () => {
    const result = mergeEnvConfig({ ignore: ['src/**'] }, { ignore: ['x/**', 'y/**', 'z/**'] })
    expect(result.ignore).toEqual(['x/**', 'y/**', 'z/**'])
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - rules field
// ============================================================================

describe('mergeEnvConfig - rules field', () => {
  test('empty rules from both sources', () => {
    const result = mergeEnvConfig({}, {})
    expect(result.rules).toEqual({})
  })

  test('file rules only preserved', () => {
    const result = mergeEnvConfig({ rules: { 'no-eval': 'error' } }, {})
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('env rules only added', () => {
    const result = mergeEnvConfig({}, { rules: { 'no-eval': 'error' } })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('env rules override file rules for same key', () => {
    const result = mergeEnvConfig({ rules: { rule: 'error' } }, { rules: { rule: 'warning' } })
    expect(result.rules.rule).toBe('warning')
  })

  test('env rules with options override file rules', () => {
    const result = mergeEnvConfig(
      { rules: { 'max-params': ['error', { max: 3 }] } },
      { rules: { 'max-params': ['warning', { max: 5 }] } },
    )
    expect(result.rules['max-params']).toEqual(['warning', { max: 5 }])
  })

  test('env rules merge with file rules (different keys)', () => {
    const result = mergeEnvConfig(
      { rules: { alpha: 'error', beta: 'warning' } },
      { rules: { gamma: 'info' } },
    )
    expect(result.rules).toEqual({
      alpha: 'error',
      beta: 'warning',
      gamma: 'info',
    })
  })

  test('empty env rules does not clear file rules', () => {
    const result = mergeEnvConfig({ rules: { 'no-eval': 'error' } }, { rules: {} })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('env rules undefined preserves file rules', () => {
    const result = mergeEnvConfig({ rules: { 'no-eval': 'error' } }, { rules: undefined })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  test('rules spread order: file first, env second', () => {
    const result = mergeEnvConfig({ rules: { a: 'error' } }, { rules: { b: 'warning' } })
    expect(Object.keys(result.rules)).toEqual(['a', 'b'])
  })

  test('mixed string and array rules from both sources', () => {
    const result = mergeEnvConfig(
      {
        rules: {
          'no-eval': 'error',
          'max-params': ['warning', { max: 3 }],
        },
      },
      {
        rules: {
          'no-console': 'info',
          'max-lines': ['error', { max: 500 }],
        },
      },
    )
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'max-params': ['warning', { max: 3 }],
      'no-console': 'info',
      'max-lines': ['error', { max: 500 }],
    })
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - return type and structure
// ============================================================================

describe('mergeEnvConfig - return type and structure', () => {
  test('result has files, ignore, rules keys', () => {
    const result = mergeEnvConfig({}, {})
    expect(Object.keys(result)).toEqual(['files', 'ignore', 'rules'])
  })

  test('result is not reference to file config', () => {
    const fileConfig: CodeForgeConfig = { files: ['a'] }
    const result = mergeEnvConfig(fileConfig, {})
    expect(result).not.toBe(fileConfig)
  })

  test('result is not reference to env config', () => {
    const envConfig: Partial<CodeForgeConfig> = { files: ['a'] }
    const result = mergeEnvConfig({}, envConfig)
    expect(result).not.toBe(envConfig)
  })

  test('result rules is not reference to file rules', () => {
    const fileRules = { test: 'error' }
    const result = mergeEnvConfig({ rules: fileRules }, {})
    expect(result.rules).not.toBe(fileRules)
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - complete scenarios
// ============================================================================

describe('mergeEnvConfig - complete scenarios', () => {
  test('full file config with partial env override', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**', 'dist/**'],
      rules: {
        'no-eval': 'error',
        'no-console': 'warning',
        'prefer-const': 'error',
      },
    }
    const result = mergeEnvConfig(fileConfig, {
      rules: { 'no-console': 'error' },
    })
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**', 'dist/**'])
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['no-console']).toBe('error')
    expect(result.rules['prefer-const']).toBe('error')
  })

  test('CI environment overrides production config', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts', 'test/**/*.ts'],
      ignore: ['node_modules/**'],
      rules: { 'no-eval': 'warning' },
    }
    const envConfig: Partial<CodeForgeConfig> = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**', 'dist/**'],
      rules: { 'no-eval': 'error', 'no-console': 'error' },
    }
    const result = mergeEnvConfig(fileConfig, envConfig)
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**', 'dist/**'])
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['no-console']).toBe('error')
  })

  test('empty file config with full env config', () => {
    const envConfig: Partial<CodeForgeConfig> = {
      files: ['**/*.ts'],
      ignore: ['dist/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeEnvConfig({}, envConfig)
    expect(result.files).toEqual(['**/*.ts'])
    expect(result.ignore).toEqual(['dist/**'])
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs vs mergeEnvConfig differences
// ============================================================================

describe('mergeConfigs vs mergeEnvConfig differences', () => {
  test('mergeConfigs applies defaults, mergeEnvConfig does not', () => {
    const fileConfig: CodeForgeConfig = {}
    const withDefaults = mergeConfigs(fileConfig, {})
    const withoutDefaults = mergeEnvConfig(fileConfig, {})
    expect(withDefaults.files).toEqual(DEFAULT_CONFIG.files)
    expect(withDefaults.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(withoutDefaults.files).toBeUndefined()
    expect(withoutDefaults.ignore).toBeUndefined()
  })

  test('mergeConfigs falls back to default when file empty, mergeEnvConfig does not', () => {
    const mc = mergeConfigs({}, {})
    const me = mergeEnvConfig({}, {})
    expect(mc.files).toBeDefined()
    expect(mc.ignore).toBeDefined()
    expect(me.files).toBeUndefined()
    expect(me.ignore).toBeUndefined()
  })

  test('both functions spread rules the same way', () => {
    const fileConfig: CodeForgeConfig = { rules: { a: 'error' } }
    const extra = { rules: { b: 'warning' } }
    const mc = mergeConfigs(fileConfig, extra)
    const me = mergeEnvConfig(fileConfig, extra)
    expect(mc.rules).toEqual(me.rules)
  })

  test('both functions give CLI/env priority for files', () => {
    const fileConfig: CodeForgeConfig = { files: ['file/**'] }
    const overrides = { files: ['override/**'] }
    expect(mergeConfigs(fileConfig, overrides).files).toEqual(['override/**'])
    expect(mergeEnvConfig(fileConfig, overrides).files).toEqual(['override/**'])
  })

  test('both functions give CLI/env priority for ignore', () => {
    const fileConfig: CodeForgeConfig = { ignore: ['file/**'] }
    const overrides = { ignore: ['override/**'] }
    expect(mergeConfigs(fileConfig, overrides).ignore).toEqual(['override/**'])
    expect(mergeEnvConfig(fileConfig, overrides).ignore).toEqual(['override/**'])
  })

  test('both handle empty arrays the same for files', () => {
    const fileConfig: CodeForgeConfig = { files: ['src/**'] }
    expect(mergeConfigs(fileConfig, { files: [] }).files).toEqual([])
    expect(mergeEnvConfig(fileConfig, { files: [] }).files).toEqual([])
  })

  test('both handle empty arrays the same for ignore', () => {
    const fileConfig: CodeForgeConfig = { ignore: ['dist/**'] }
    expect(mergeConfigs(fileConfig, { ignore: [] }).ignore).toEqual([])
    expect(mergeEnvConfig(fileConfig, { ignore: [] }).ignore).toEqual([])
  })
})

// ============================================================================
// NEW TESTS: edge cases - immutability
// ============================================================================

describe('edge cases - immutability', () => {
  test('merging does not mutate file config files', () => {
    const fileConfig: CodeForgeConfig = { files: ['original/**'] }
    mergeConfigs(fileConfig, { files: ['modified/**'] })
    expect(fileConfig.files).toEqual(['original/**'])
  })

  test('merging does not mutate file config ignore', () => {
    const fileConfig: CodeForgeConfig = { ignore: ['original/**'] }
    mergeConfigs(fileConfig, { ignore: ['modified/**'] })
    expect(fileConfig.ignore).toEqual(['original/**'])
  })

  test('merging does not mutate file config rules', () => {
    const fileConfig: CodeForgeConfig = { rules: { test: 'error' } }
    mergeConfigs(fileConfig, { rules: { test: 'warning' } })
    expect(fileConfig.rules!.test).toBe('error')
  })

  test('merging does not mutate CLI rules', () => {
    const cliFlags: Partial<CodeForgeConfig> = { rules: { test: 'warning' } }
    mergeConfigs({}, cliFlags)
    expect(cliFlags.rules!.test).toBe('warning')
  })

  test('mergeEnvConfig does not mutate file config', () => {
    const fileConfig: CodeForgeConfig = { files: ['original/**'], rules: { test: 'error' } }
    mergeEnvConfig(fileConfig, { files: ['changed/**'], rules: { test: 'info' } })
    expect(fileConfig.files).toEqual(['original/**'])
    expect(fileConfig.rules!.test).toBe('error')
  })

  test('mergeEnvConfig does not mutate env config', () => {
    const envConfig: Partial<CodeForgeConfig> = { files: ['env/**'] }
    mergeEnvConfig({ files: ['file/**'] }, envConfig)
    expect(envConfig.files).toEqual(['env/**'])
  })

  test('multiple merges are independent', () => {
    const base: CodeForgeConfig = { files: ['base/**'] }
    const result1 = mergeConfigs(base, { files: ['first/**'] })
    const result2 = mergeConfigs(base, { files: ['second/**'] })
    expect(result1.files).toEqual(['first/**'])
    expect(result2.files).toEqual(['second/**'])
    expect(base.files).toEqual(['base/**'])
  })
})

// ============================================================================
// NEW TESTS: edge cases - large configs
// ============================================================================

describe('edge cases - large configs', () => {
  test('handles large number of rules', () => {
    const rules: Record<string, string> = {}
    for (let i = 0; i < 50; i++) {
      rules[`rule-${i}`] = i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info'
    }
    const result = mergeConfigs({ rules }, {})
    expect(Object.keys(result.rules)).toHaveLength(50)
    expect(result.rules['rule-0']).toBe('error')
    expect(result.rules['rule-1']).toBe('warning')
    expect(result.rules['rule-2']).toBe('info')
  })

  test('handles large number of file patterns', () => {
    const patterns = Array.from({ length: 30 }, (_, i) => `dir${i}/**/*.ts`)
    const result = mergeConfigs({ files: patterns }, {})
    expect(result.files).toHaveLength(30)
    expect(result.files).toEqual(patterns)
  })

  test('handles large number of ignore patterns', () => {
    const patterns = Array.from({ length: 25 }, (_, i) => `ignore${i}/**`)
    const result = mergeConfigs({ ignore: patterns }, {})
    expect(result.ignore).toHaveLength(25)
    expect(result.ignore).toEqual(patterns)
  })

  test('handles large number of rules from both sources', () => {
    const fileRules: Record<string, string> = {}
    const cliRules: Record<string, string> = {}
    for (let i = 0; i < 25; i++) {
      fileRules[`file-rule-${i}`] = 'error'
      cliRules[`cli-rule-${i}`] = 'warning'
    }
    const result = mergeConfigs({ rules: fileRules }, { rules: cliRules })
    expect(Object.keys(result.rules)).toHaveLength(50)
  })

  test('handles overlapping large rules - CLI wins', () => {
    const fileRules: Record<string, string> = {}
    const cliRules: Record<string, string> = {}
    for (let i = 0; i < 30; i++) {
      fileRules[`rule-${i}`] = 'error'
      cliRules[`rule-${i}`] = 'warning'
    }
    const result = mergeConfigs({ rules: fileRules }, { rules: cliRules })
    expect(Object.keys(result.rules)).toHaveLength(30)
    for (const key of Object.keys(result.rules)) {
      expect(result.rules[key]).toBe('warning')
    }
  })
})

// ============================================================================
// NEW TESTS: edge cases - special patterns
// ============================================================================

describe('edge cases - special glob patterns', () => {
  test('files with double-star glob', () => {
    const result = mergeConfigs({ files: ['**/*.ts'] }, {})
    expect(result.files).toEqual(['**/*.ts'])
  })

  test('files with negation pattern', () => {
    const result = mergeConfigs({ files: ['**/*.ts', '!**/*.d.ts'] }, {})
    expect(result.files).toEqual(['**/*.ts', '!**/*.d.ts'])
  })

  test('ignore with double-star glob', () => {
    const result = mergeConfigs({ ignore: ['**/test/**'] }, {})
    expect(result.ignore).toEqual(['**/test/**'])
  })

  test('files with path containing dots', () => {
    const result = mergeConfigs({ files: ['src/**/*.spec.ts'] }, {})
    expect(result.files).toEqual(['src/**/*.spec.ts'])
  })

  test('files with bracket expressions', () => {
    const result = mergeConfigs({ files: ['**/*.[jt]s'] }, {})
    expect(result.files).toEqual(['**/*.[jt]s'])
  })

  test('files with extglob patterns', () => {
    const result = mergeConfigs({ files: ['**/*.?(spec|test).ts'] }, {})
    expect(result.files).toEqual(['**/*.?(spec|test).ts'])
  })

  test('multiple negation patterns in files', () => {
    const result = mergeConfigs({ files: ['**/*.ts', '!**/*.d.ts', '!**/*.spec.ts'] }, {})
    expect(result.files).toEqual(['**/*.ts', '!**/*.d.ts', '!**/*.spec.ts'])
  })
})

// ============================================================================
// NEW TESTS: edge cases - rules with various option shapes
// ============================================================================

describe('edge cases - rules with various option shapes', () => {
  test('rule with zero max option', () => {
    const result = mergeConfigs({ rules: { test: ['error', { max: 0 }] } }, {})
    expect(result.rules.test).toEqual(['error', { max: 0 }])
  })

  test('rule with large max option', () => {
    const result = mergeConfigs({ rules: { test: ['error', { max: 10000 }] } }, {})
    expect(result.rules.test).toEqual(['error', { max: 10000 }])
  })

  test('rule with negative max option', () => {
    const result = mergeConfigs({ rules: { test: ['error', { max: -1 }] } }, {})
    expect(result.rules.test).toEqual(['error', { max: -1 }])
  })

  test('rule with string option value', () => {
    const result = mergeConfigs({ rules: { test: ['error', { message: 'Custom message' }] } }, {})
    expect(result.rules.test).toEqual(['error', { message: 'Custom message' }])
  })

  test('rule with boolean option value', () => {
    const result = mergeConfigs({ rules: { test: ['error', { allowSingleLine: true }] } }, {})
    expect(result.rules.test).toEqual(['error', { allowSingleLine: true }])
  })

  test('rule with nested object option', () => {
    const result = mergeConfigs({ rules: { test: ['error', { options: { nested: true } }] } }, {})
    expect(result.rules.test).toEqual(['error', { options: { nested: true } }])
  })

  test('rule with array option value', () => {
    const result = mergeConfigs({ rules: { test: ['error', { allowed: ['a', 'b', 'c'] }] } }, {})
    expect(result.rules.test).toEqual(['error', { allowed: ['a', 'b', 'c'] }])
  })

  test('rule with null option value', () => {
    const result = mergeConfigs({ rules: { test: ['error', { value: null }] } }, {})
    expect(result.rules.test).toEqual(['error', { value: null }])
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - CLI only configs
// ============================================================================

describe('mergeConfigs - CLI-only configs', () => {
  test('only CLI files provided, everything else defaults', () => {
    const result = mergeConfigs({}, { files: ['cli-only/**'] })
    expect(result.files).toEqual(['cli-only/**'])
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(result.rules).toEqual({})
  })

  test('only CLI ignore provided, everything else defaults', () => {
    const result = mergeConfigs({}, { ignore: ['cli-ignore/**'] })
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(['cli-ignore/**'])
    expect(result.rules).toEqual({})
  })

  test('only CLI rules provided, everything else defaults', () => {
    const result = mergeConfigs({}, { rules: { 'cli-rule': 'error' } })
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(result.rules).toEqual({ 'cli-rule': 'error' })
  })

  test('CLI files and rules, ignore defaults', () => {
    const result = mergeConfigs({}, { files: ['cli-files/**'], rules: { 'cli-rule': 'warning' } })
    expect(result.files).toEqual(['cli-files/**'])
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(result.rules).toEqual({ 'cli-rule': 'warning' })
  })

  test('CLI ignore and rules, files defaults', () => {
    const result = mergeConfigs({}, { ignore: ['cli-ignore/**'], rules: { 'cli-rule': 'info' } })
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(['cli-ignore/**'])
    expect(result.rules).toEqual({ 'cli-rule': 'info' })
  })

  test('CLI files and ignore, rules default', () => {
    const result = mergeConfigs({}, { files: ['cli-files/**'], ignore: ['cli-ignore/**'] })
    expect(result.files).toEqual(['cli-files/**'])
    expect(result.ignore).toEqual(['cli-ignore/**'])
    expect(result.rules).toEqual({})
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - env-only configs
// ============================================================================

describe('mergeEnvConfig - env-only configs', () => {
  test('only env files provided', () => {
    const result = mergeEnvConfig({}, { files: ['env-only/**'] })
    expect(result.files).toEqual(['env-only/**'])
    expect(result.ignore).toBeUndefined()
    expect(result.rules).toEqual({})
  })

  test('only env ignore provided', () => {
    const result = mergeEnvConfig({}, { ignore: ['env-ignore/**'] })
    expect(result.files).toBeUndefined()
    expect(result.ignore).toEqual(['env-ignore/**'])
    expect(result.rules).toEqual({})
  })

  test('only env rules provided', () => {
    const result = mergeEnvConfig({}, { rules: { 'env-rule': 'error' } })
    expect(result.files).toBeUndefined()
    expect(result.ignore).toBeUndefined()
    expect(result.rules).toEqual({ 'env-rule': 'error' })
  })

  test('env files and rules, no ignore', () => {
    const result = mergeEnvConfig({}, { files: ['env/**'], rules: { 'env-rule': 'warning' } })
    expect(result.files).toEqual(['env/**'])
    expect(result.ignore).toBeUndefined()
    expect(result.rules).toEqual({ 'env-rule': 'warning' })
  })

  test('env ignore and rules, no files', () => {
    const result = mergeEnvConfig({}, { ignore: ['env-ignore/**'], rules: { 'env-rule': 'info' } })
    expect(result.files).toBeUndefined()
    expect(result.ignore).toEqual(['env-ignore/**'])
    expect(result.rules).toEqual({ 'env-rule': 'info' })
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - idempotency
// ============================================================================

describe('mergeConfigs - idempotency', () => {
  test('merging same config twice produces same result', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
      rules: { 'no-eval': 'error' },
    }
    const result1 = mergeConfigs(fileConfig, {})
    const result2 = mergeConfigs(fileConfig, {})
    expect(result1).toEqual(result2)
  })

  test('merging with same CLI flags twice produces same result', () => {
    const cliFlags: Partial<CodeForgeConfig> = {
      files: ['cli/**'],
      rules: { 'test-rule': 'warning' },
    }
    const result1 = mergeConfigs({}, cliFlags)
    const result2 = mergeConfigs({}, cliFlags)
    expect(result1).toEqual(result2)
  })

  test('chained merges produce consistent results', () => {
    const step1 = mergeConfigs({ files: ['a'] }, { files: ['b'] })
    const step2 = mergeConfigs({ files: ['a'] }, { files: ['b'] })
    expect(step1).toEqual(step2)
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - idempotency
// ============================================================================

describe('mergeEnvConfig - idempotency', () => {
  test('merging same config twice produces same result', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      rules: { 'no-eval': 'error' },
    }
    const result1 = mergeEnvConfig(fileConfig, {})
    const result2 = mergeEnvConfig(fileConfig, {})
    expect(result1).toEqual(result2)
  })

  test('merging with same env config twice produces same result', () => {
    const envConfig: Partial<CodeForgeConfig> = { files: ['env/**'] }
    const result1 = mergeEnvConfig({}, envConfig)
    const result2 = mergeEnvConfig({}, envConfig)
    expect(result1).toEqual(result2)
  })
})

// ============================================================================
// NEW TESTS: mergeConfigs - DEFAULT_CONFIG constant values
// ============================================================================

describe('mergeConfigs - DEFAULT_CONFIG usage', () => {
  test('default files includes TypeScript extensions', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toContain('**/*.ts')
    expect(result.files).toContain('**/*.tsx')
  })

  test('default files includes JavaScript extensions', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toContain('**/*.js')
    expect(result.files).toContain('**/*.jsx')
  })

  test('default ignore includes node_modules', () => {
    const result = mergeConfigs({}, {})
    expect(result.ignore).toContain('node_modules/**')
  })

  test('default ignore includes dist', () => {
    const result = mergeConfigs({}, {})
    expect(result.ignore).toContain('dist/**')
  })

  test('default ignore includes coverage', () => {
    const result = mergeConfigs({}, {})
    expect(result.ignore).toContain('coverage/**')
  })

  test('default files has exactly 4 patterns', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toHaveLength(4)
  })

  test('default ignore has exactly 3 patterns', () => {
    const result = mergeConfigs({}, {})
    expect(result.ignore).toHaveLength(3)
  })
})

// ============================================================================
// NEW TESTS: mergeEnvConfig - priority chain (env > file, no default)
// ============================================================================

describe('mergeEnvConfig - priority chain env > file', () => {
  test('env files wins over file files', () => {
    const result = mergeEnvConfig({ files: ['file/**'] }, { files: ['env/**'] })
    expect(result.files).toEqual(['env/**'])
  })

  test('env ignore wins over file ignore', () => {
    const result = mergeEnvConfig({ ignore: ['file/**'] }, { ignore: ['env/**'] })
    expect(result.ignore).toEqual(['env/**'])
  })

  test('env rules wins over file rules for same key', () => {
    const result = mergeEnvConfig({ rules: { rule: 'error' } }, { rules: { rule: 'warning' } })
    expect(result.rules.rule).toBe('warning')
  })

  test('file values used when env values undefined', () => {
    const result = mergeEnvConfig(
      { files: ['file/**'], ignore: ['file-ignore/**'] },
      { files: undefined, ignore: undefined },
    )
    expect(result.files).toEqual(['file/**'])
    expect(result.ignore).toEqual(['file-ignore/**'])
  })

  test('each field resolved independently', () => {
    const result = mergeEnvConfig(
      { files: ['file-files/**'], ignore: ['file-ignore/**'], rules: { a: 'error' } },
      { files: ['env-files/**'] },
    )
    expect(result.files).toEqual(['env-files/**'])
    expect(result.ignore).toEqual(['file-ignore/**'])
    expect(result.rules).toEqual({ a: 'error' })
  })

  test('env partially overrides file config', () => {
    const result = mergeEnvConfig(
      { files: ['a'], ignore: ['b'], rules: { x: 'error' } },
      { rules: { y: 'warning' } },
    )
    expect(result.files).toEqual(['a'])
    expect(result.ignore).toEqual(['b'])
    expect(result.rules).toEqual({ x: 'error', y: 'warning' })
  })
})
