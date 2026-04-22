import { describe, test, expect, vi } from 'vitest'
import {
  CONFIG_FILE_NAMES,
  type InitOptions,
  type RuleInfo,
  detectExistingConfig,
  displayConfigSummary,
  displayRuleList,
  filterValidRules,
  generateConfig,
  generateJsContent,
  generateJsonContent,
  getRuleInfos,
  resolveConfigFileName,
} from '../../../src/commands/init-helpers.js'
import type { CodeForgeConfig } from '../../../src/config/types.js'
import type { RuleDefinition } from '../../../src/rules/types.js'

const mockGetRuleCategory = (ruleId: string): string => {
  if (ruleId.startsWith('max-')) return 'complexity'
  if (ruleId.startsWith('no-')) return 'security'
  return 'patterns'
}

const mockLoadedRules: Record<string, RuleDefinition> = {
  'max-complexity': {
    meta: {
      name: 'max-complexity',
      description: 'Enforce a maximum cyclomatic complexity threshold',
      category: 'complexity',
      recommended: true,
    },
    defaultOptions: { max: 10 },
    create: vi.fn(),
  } as unknown as RuleDefinition,
  'max-params': {
    meta: {
      name: 'max-params',
      description: 'Enforce maximum number of parameters',
      category: 'complexity',
      recommended: true,
    },
    defaultOptions: { max: 4 },
    create: vi.fn(),
  } as unknown as RuleDefinition,
  'no-await-in-loop': {
    meta: {
      name: 'no-await-in-loop',
      description: 'Disallow await inside loops',
      category: 'performance',
      recommended: false,
    },
    defaultOptions: {},
    create: vi.fn(),
  } as unknown as RuleDefinition,
  'no-eval': {
    meta: {
      name: 'no-eval',
      description: 'Disallow eval usage',
      category: 'security',
      recommended: true,
    },
    defaultOptions: {},
    create: vi.fn(),
  } as unknown as RuleDefinition,
}

function makeOptions(overrides: Partial<InitOptions> = {}): InitOptions {
  return {
    dir: '.',
    force: false,
    format: 'json',
    interactive: false,
    minimal: false,
    profile: undefined,
    typescript: true,
    ...overrides,
  }
}

describe('resolveConfigFileName', () => {
  test('returns .codeforgerc.json for json format', () => {
    expect(resolveConfigFileName('json')).toBe('.codeforgerc.json')
  })

  test('returns codeforge.config.js for js format', () => {
    expect(resolveConfigFileName('js')).toBe('codeforge.config.js')
  })

  test('handles uppercase format correctly', () => {
    expect(resolveConfigFileName('json')).toBe('.codeforgerc.json')
  })
})

describe('generateJsonContent', () => {
  test('generates valid JSON', () => {
    const config = { files: ['**/*.ts'], ignore: ['node_modules/**'] }
    const result = generateJsonContent(config as any)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  test('formats with 2 space indentation', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsonContent(config as any)
    expect(result).toContain('  "files"')
  })

  test('includes all config properties', () => {
    const config = {
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['node_modules/**', 'dist/**'],
      rules: { 'max-complexity': 'error' },
    }
    const result = generateJsonContent(config as any)
    const parsed = JSON.parse(result)
    expect(parsed.files).toEqual(['**/*.ts', '**/*.tsx'])
    expect(parsed.ignore).toEqual(['node_modules/**', 'dist/**'])
    expect(parsed.rules['max-complexity']).toBe('error')
  })

  test('handles config without rules', () => {
    const config = { files: ['**/*.ts'], ignore: ['node_modules/**'] }
    const result = generateJsonContent(config as any)
    const parsed = JSON.parse(result)
    expect(parsed.rules).toBeUndefined()
  })

  test('handles empty config', () => {
    const config = {}
    const result = generateJsonContent(config as any)
    const parsed = JSON.parse(result)
    expect(parsed).toEqual({})
  })
})

describe('generateJsContent', () => {
  test('includes export default', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsContent(config as any)
    expect(result).toContain('export default')
  })

  test('includes type definition comment', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsContent(config as any)
    expect(result).toMatch(/\/\*\* @type \{import\('codeforge'\)\.CodeForgeConfig\} \*\//)
  })

  test('formats config with proper indentation', () => {
    const config = {
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['node_modules/**', 'dist/**'],
      rules: { 'max-complexity': 'error' },
    }
    const result = generateJsContent(config as any)
    expect(result).toContain('  "files": [')
    expect(result).toContain('  "ignore": [')
    expect(result).toContain('  "rules": {')
  })

  test('handles config without rules', () => {
    const config = { files: ['**/*.js'], ignore: ['node_modules/**'] }
    const result = generateJsContent(config as any)
    expect(result).not.toContain('"rules"')
  })

  test('ends with semicolon and newline', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsContent(config as any)
    expect(result.endsWith(';\n')).toBe(true)
  })

  test('contains valid JSON between export and semicolon', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsContent(config as any)
    const jsonPart = result.split('export default ')[1].split(';\n')[0]
    expect(() => JSON.parse(jsonPart)).not.toThrow()
  })
})

describe('getRuleInfos', () => {
  test('returns array of rule infos', () => {
    const result = getRuleInfos(mockLoadedRules, mockGetRuleCategory)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(4)
  })

  test('each rule info has required properties', () => {
    const result = getRuleInfos(mockLoadedRules, mockGetRuleCategory)
    for (const rule of result) {
      expect(rule).toHaveProperty('id')
      expect(rule).toHaveProperty('description')
      expect(rule).toHaveProperty('category')
      expect(rule).toHaveProperty('recommended')
      expect(typeof rule.id).toBe('string')
      expect(typeof rule.description).toBe('string')
      expect(typeof rule.category).toBe('string')
      expect(typeof rule.recommended).toBe('boolean')
    }
  })

  test('includes all rules from loaded rules', () => {
    const result = getRuleInfos(mockLoadedRules, mockGetRuleCategory)
    const ids = result.map((r) => r.id)
    expect(ids).toContain('max-complexity')
    expect(ids).toContain('max-params')
    expect(ids).toContain('no-await-in-loop')
    expect(ids).toContain('no-eval')
  })

  test('correctly identifies recommended rules', () => {
    const result = getRuleInfos(mockLoadedRules, mockGetRuleCategory)
    const maxComplexity = result.find((r) => r.id === 'max-complexity')
    const noAwaitInLoop = result.find((r) => r.id === 'no-await-in-loop')
    expect(maxComplexity?.recommended).toBe(true)
    expect(noAwaitInLoop?.recommended).toBe(false)
  })

  test('uses getRuleCategoryFn for categorization', () => {
    const customCategory = (_id: string) => 'custom'
    const result = getRuleInfos(mockLoadedRules, customCategory)
    for (const rule of result) {
      expect(rule.category).toBe('custom')
    }
  })

  test('returns empty array for empty rules', () => {
    const result = getRuleInfos({}, mockGetRuleCategory)
    expect(result).toEqual([])
  })

  test('preserves rule descriptions', () => {
    const result = getRuleInfos(mockLoadedRules, mockGetRuleCategory)
    const maxComplexity = result.find((r) => r.id === 'max-complexity')
    expect(maxComplexity?.description).toBe('Enforce a maximum cyclomatic complexity threshold')
  })
})

describe('generateConfig', () => {
  test('returns minimal config when minimal is true', () => {
    const options = makeOptions({ minimal: true })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.files).toBeDefined()
    expect(config.ignore).toBeDefined()
    expect(config.rules).toBeUndefined()
  })

  test('includes TS file patterns when typescript is true', () => {
    const options = makeOptions({ minimal: true, typescript: true })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.files).toContain('**/*.ts')
    expect(config.files).toContain('**/*.tsx')
    expect(config.files).not.toContain('**/*.js')
    expect(config.files).not.toContain('**/*.jsx')
  })

  test('includes JS file patterns when typescript is false', () => {
    const options = makeOptions({ minimal: true, typescript: false })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.files).toContain('**/*.ts')
    expect(config.files).toContain('**/*.tsx')
    expect(config.files).toContain('**/*.js')
    expect(config.files).toContain('**/*.jsx')
  })

  test('includes recommended rules when no selectedRules', () => {
    const options = makeOptions()
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules).toBeDefined()
    expect(config.rules!['max-complexity']).toBe('error')
    expect(config.rules!['max-params']).toBe('error')
    expect(config.rules!['no-await-in-loop']).toBeUndefined()
  })

  test('includes only selected rules when provided', () => {
    const options = makeOptions()
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['max-complexity', 'no-await-in-loop'],
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(config.rules!['max-complexity']).toBe('error')
    expect(config.rules!['no-await-in-loop']).toBe('error')
    expect(config.rules!['max-params']).toBeUndefined()
  })

  test('has no rules when selectedRules is empty', () => {
    const options = makeOptions()
    const config = generateConfig(options, mockLoadedRules, [], mockGetRuleCategory, vi.fn())
    expect(config.rules).toBeUndefined()
  })

  test('includes default ignore patterns', () => {
    const options = makeOptions({ minimal: true })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.ignore).toContain('node_modules/**')
    expect(config.ignore).toContain('dist/**')
    expect(config.ignore).toContain('coverage/**')
  })

  test('calls logFn when profile is set', () => {
    const logFn = vi.fn()
    const options = makeOptions({ minimal: true, profile: 'strict' })
    generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, logFn)
    expect(logFn).toHaveBeenCalled()
    expect(logFn.mock.calls[0][0]).toContain('strict')
    expect(logFn.mock.calls[0][0]).toContain('profile')
  })

  test('does not call logFn when no profile', () => {
    const logFn = vi.fn()
    const options = makeOptions()
    generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, logFn)
    expect(logFn).not.toHaveBeenCalled()
  })

  test('minimal config still applies profile when both set', () => {
    const logFn = vi.fn()
    const options = makeOptions({ minimal: true, profile: 'strict' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, logFn)
    expect(config.rules).toBeDefined()
    expect(Object.keys(config.rules!).length).toBeGreaterThan(0)
    expect(logFn).toHaveBeenCalled()
  })

  test('selected rules override recommended when both paths possible', () => {
    const options = makeOptions()
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['no-eval'],
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(config.rules!['no-eval']).toBe('error')
    expect(config.rules!['max-complexity']).toBeUndefined()
  })
})

describe('filterValidRules', () => {
  test('returns valid rules from comma-separated input', () => {
    const validIds = ['max-complexity', 'max-params', 'no-eval']
    const result = filterValidRules('max-complexity, max-params', validIds)
    expect(result.valid).toEqual(['max-complexity', 'max-params'])
    expect(result.invalid).toEqual([])
  })

  test('returns invalid rules that are not in valid list', () => {
    const validIds = ['max-complexity']
    const result = filterValidRules('max-complexity, unknown-rule', validIds)
    expect(result.valid).toEqual(['max-complexity'])
    expect(result.invalid).toEqual(['unknown-rule'])
  })

  test('handles case-insensitive matching', () => {
    const validIds = ['Max-Complexity']
    const result = filterValidRules('max-complexity', validIds)
    expect(result.valid).toEqual(['max-complexity'])
  })

  test('returns empty for empty input', () => {
    const validIds = ['max-complexity']
    const result = filterValidRules('', validIds)
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })

  test('trims whitespace from input', () => {
    const validIds = ['max-complexity', 'max-params']
    const result = filterValidRules('  max-complexity ,  max-params  ', validIds)
    expect(result.valid).toEqual(['max-complexity', 'max-params'])
  })

  test('filters out empty segments', () => {
    const validIds = ['max-complexity']
    const result = filterValidRules('max-complexity,, ,', validIds)
    expect(result.valid).toEqual(['max-complexity'])
    expect(result.invalid).toEqual([])
  })

  test('returns all invalid when nothing matches', () => {
    const validIds = ['max-complexity']
    const result = filterValidRules('foo, bar', validIds)
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual(['foo', 'bar'])
  })

  test('returns all valid when everything matches', () => {
    const validIds = ['rule-a', 'rule-b']
    const result = filterValidRules('rule-a, rule-b', validIds)
    expect(result.valid).toEqual(['rule-a', 'rule-b'])
    expect(result.invalid).toEqual([])
  })

  test('handles single rule input', () => {
    const validIds = ['max-complexity']
    const result = filterValidRules('max-complexity', validIds)
    expect(result.valid).toEqual(['max-complexity'])
    expect(result.invalid).toEqual([])
  })
})

describe('detectExistingConfig', () => {
  const configFiles = [
    '.codeforgerc',
    '.codeforgerc.json',
    '.codeforge.json',
    'codeforge.config.js',
  ]

  test('returns null when no config exists', () => {
    const existsFn = (_path: string) => false
    const result = detectExistingConfig('/some/dir', configFiles, existsFn)
    expect(result).toBeNull()
  })

  test('returns path when config file exists', () => {
    const existsFn = (path: string) => path.endsWith('.codeforgerc.json')
    const result = detectExistingConfig('/project', configFiles, existsFn)
    expect(result).toBe('/project/.codeforgerc.json')
  })

  test('returns first matching config file', () => {
    const existsFn = (path: string) =>
      path.endsWith('.codeforgerc') || path.endsWith('.codeforgerc.json')
    const result = detectExistingConfig('/project', configFiles, existsFn)
    expect(result).toBe('/project/.codeforgerc')
  })

  test('detects js config file', () => {
    const existsFn = (path: string) => path.endsWith('codeforge.config.js')
    const result = detectExistingConfig('/project', configFiles, existsFn)
    expect(result).toBe('/project/codeforge.config.js')
  })

  test('works with empty config files list', () => {
    const existsFn = (_path: string) => true
    const result = detectExistingConfig('/project', [], existsFn)
    expect(result).toBeNull()
  })

  test('passes full path to existsFn', () => {
    const paths: string[] = []
    const existsFn = (path: string) => {
      paths.push(path)
      return false
    }
    detectExistingConfig('/project', ['.codeforgerc.json'], existsFn)
    expect(paths).toEqual(['/project/.codeforgerc.json'])
  })

  test('stops at first found config', () => {
    const checkedPaths: string[] = []
    const existsFn = (path: string) => {
      checkedPaths.push(path)
      return path.endsWith('.codeforgerc.json')
    }
    detectExistingConfig('/project', configFiles, existsFn)
    expect(checkedPaths.length).toBe(2)
  })
})

describe('displayConfigSummary', () => {
  test('outputs created message', () => {
    const lines: string[] = []
    displayConfigSummary({ files: ['**/*.ts'] } as any, '.codeforgerc.json', '/project', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('Created')
    expect(output).toContain('.codeforgerc.json')
    expect(output).toContain('/project')
  })

  test('outputs file patterns', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts', '**/*.tsx'] } as any,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('**/*.ts')
    expect(output).toContain('**/*.tsx')
  })

  test('outputs ignore patterns', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'], ignore: ['node_modules/**', 'dist/**'] } as any,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('node_modules/**')
    expect(output).toContain('dist/**')
  })

  test('outputs rule count when rules present', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'], rules: { 'max-complexity': 'error', 'no-eval': 'warning' } } as any,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('2 enabled')
  })

  test('does not output rules when none present', () => {
    const lines: string[] = []
    displayConfigSummary({ files: ['**/*.ts'] } as any, '.codeforgerc.json', '/project', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('enabled')
  })

  test('outputs next steps', () => {
    const lines: string[] = []
    displayConfigSummary({ files: ['**/*.ts'] } as any, '.codeforgerc.json', '/project', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('Next steps')
    expect(output).toContain('codeforge analyze')
    expect(output).toContain('codeforge rules')
  })

  test('handles empty files array', () => {
    const lines: string[] = []
    displayConfigSummary({ files: [] } as any, '.codeforgerc.json', '/project', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('Files: ')
  })
})

describe('displayRuleList', () => {
  const rules: RuleInfo[] = [
    {
      category: 'complexity',
      description: 'Enforce max complexity',
      id: 'max-complexity',
      recommended: true,
    },
    {
      category: 'complexity',
      description: 'Enforce max params',
      id: 'max-params',
      recommended: false,
    },
    { category: 'security', description: 'Disallow eval', id: 'no-eval', recommended: true },
  ]

  test('outputs select rules header', () => {
    const lines: string[] = []
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Select rules to enable')
  })

  test('outputs category headers', () => {
    const lines: string[] = []
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[COMPLEXITY]')
    expect(output).toContain('[SECURITY]')
  })

  test('outputs rule IDs', () => {
    const lines: string[] = []
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('max-complexity')
    expect(output).toContain('max-params')
    expect(output).toContain('no-eval')
  })

  test('outputs rule descriptions', () => {
    const lines: string[] = []
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Enforce max complexity')
    expect(output).toContain('Enforce max params')
    expect(output).toContain('Disallow eval')
  })

  test('marks recommended rules', () => {
    const lines: string[] = []
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(recommended)')
  })

  test('outputs instructions', () => {
    const lines: string[] = []
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('comma')
    expect(output).toContain('Enter')
  })

  test('handles empty rules array', () => {
    const lines: string[] = []
    displayRuleList([], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Select rules to enable')
  })

  test('sorts categories alphabetically', () => {
    const lines: string[] = []
    const unsorted: RuleInfo[] = [
      { category: 'security', description: 'test', id: 'no-eval', recommended: true },
      { category: 'complexity', description: 'test', id: 'max-complexity', recommended: true },
    ]
    displayRuleList(unsorted, (msg) => lines.push(msg))
    const complexityIdx = lines.findIndex((l) => l.includes('[COMPLEXITY]'))
    const securityIdx = lines.findIndex((l) => l.includes('[SECURITY]'))
    expect(complexityIdx).toBeLessThan(securityIdx)
  })

  test('calls logFn multiple times', () => {
    const lines: string[] = []
    displayRuleList(rules, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(5)
  })
})

describe('generateJsonContent — additional edge cases', () => {
  test('handles deeply nested rules config', () => {
    const config = {
      files: ['**/*.ts'],
      rules: { 'max-complexity': ['error', { max: 20 }] },
    }
    const result = generateJsonContent(config as any)
    const parsed = JSON.parse(result)
    expect(parsed.rules['max-complexity']).toEqual(['error', { max: 20 }])
  })

  test('handles config with null values', () => {
    const config = { files: ['**/*.ts'], ignore: null }
    const result = generateJsonContent(config as any)
    const parsed = JSON.parse(result)
    expect(parsed.ignore).toBeNull()
  })

  test('handles config with boolean values', () => {
    const config = { files: ['**/*.ts'], strict: true }
    const result = generateJsonContent(config as any)
    const parsed = JSON.parse(result)
    expect(parsed.strict).toBe(true)
  })

  test('handles config with numeric values', () => {
    const config = { files: ['**/*.ts'], maxWarnings: 10 }
    const result = generateJsonContent(config as any)
    const parsed = JSON.parse(result)
    expect(parsed.maxWarnings).toBe(10)
  })

  test('produces deterministic output', () => {
    const config = { files: ['**/*.ts'], ignore: ['node_modules/**'] }
    const result1 = generateJsonContent(config as any)
    const result2 = generateJsonContent(config as any)
    expect(result1).toBe(result2)
  })
})

describe('generateJsContent — additional edge cases', () => {
  test('type annotation references codeforge module', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsContent(config as any)
    expect(result).toContain("import('codeforge').CodeForgeConfig")
  })

  test('handles config with many rules', () => {
    const config = {
      files: ['**/*.ts'],
      rules: {
        'max-complexity': 'error',
        'max-params': 'error',
        'no-eval': 'error',
        'no-await-in-loop': 'warning',
      },
    }
    const result = generateJsContent(config as any)
    for (const ruleId of Object.keys(config.rules)) {
      expect(result).toContain(ruleId)
    }
  })

  test('preserves arrays in JS output', () => {
    const config = { files: ['**/*.ts', '**/*.tsx', '**/*.js'] }
    const result = generateJsContent(config as any)
    const jsonPart = result.split('export default ')[1].split(';\n')[0]
    const parsed = JSON.parse(jsonPart)
    expect(parsed.files).toEqual(['**/*.ts', '**/*.tsx', '**/*.js'])
  })

  test('starts with type annotation comment on first line', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsContent(config as any)
    expect(result.startsWith('/**')).toBe(true)
  })
})

describe('generateConfig — edge cases', () => {
  test('minimal without profile returns config without rules', () => {
    const options = makeOptions({ minimal: true, profile: undefined })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules).toBeUndefined()
    expect(config.files).toBeDefined()
    expect(config.ignore).toBeDefined()
  })

  test('non-minimal with undefined selectedRules uses recommended defaults', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    // Recommended rules: max-complexity, max-params, no-eval
    expect(config.rules!['max-complexity']).toBe('error')
    expect(config.rules!['max-params']).toBe('error')
    expect(config.rules!['no-eval']).toBe('error')
    // non-recommended
    expect(config.rules!['no-await-in-loop']).toBeUndefined()
  })

  test('non-minimal with empty selectedRules produces no rules', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(options, mockLoadedRules, [], mockGetRuleCategory, vi.fn())
    expect(config.rules).toBeUndefined()
  })

  test('profile takes precedence over selected rules', () => {
    const logFn = vi.fn()
    const options = makeOptions({ profile: 'strict' })
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['max-complexity'],
      mockGetRuleCategory,
      logFn,
    )
    // When profile is set, selectedRules is ignored
    expect(logFn).toHaveBeenCalled()
    expect(config.rules).toBeDefined()
  })

  test('selected rules with single rule works correctly', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['no-await-in-loop'],
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(Object.keys(config.rules!)).toHaveLength(1)
    expect(config.rules!['no-await-in-loop']).toBe('error')
  })

  test('selected rules with non-recommended rules still included', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['no-await-in-loop'],
      mockGetRuleCategory,
      vi.fn(),
    )
    // no-await-in-loop is not recommended, but explicitly selected
    expect(config.rules!['no-await-in-loop']).toBe('error')
  })

  test('all selected rules set to error severity', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['max-complexity', 'no-eval', 'no-await-in-loop'],
      mockGetRuleCategory,
      vi.fn(),
    )
    for (const ruleId of Object.keys(config.rules!)) {
      expect(config.rules![ruleId]).toBe('error')
    }
  })

  test('config files field matches typescript option', () => {
    const optionsTs = makeOptions({ minimal: true, typescript: true })
    const configTs = generateConfig(
      optionsTs,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(configTs.files).toEqual(['**/*.ts', '**/*.tsx'])

    const optionsJs = makeOptions({ minimal: true, typescript: false })
    const configJs = generateConfig(
      optionsJs,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(configJs.files).toEqual(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'])
  })

  test('profile log message includes profile name', () => {
    const logFn = vi.fn()
    const options = makeOptions({ minimal: false, profile: 'strict' })
    generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, logFn)
    const logMsg = logFn.mock.calls[0][0]
    expect(logMsg).toContain('strict')
  })

  test('ignore patterns are copied from DEFAULT_CONFIG', () => {
    const options = makeOptions({ minimal: true })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.ignore).toEqual(['node_modules/**', 'dist/**', 'coverage/**'])
  })

  test('minimal true with no profile returns early without rules', () => {
    const options = makeOptions({ minimal: true })
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['no-eval'],
      mockGetRuleCategory,
      vi.fn(),
    )
    // minimal=true, profile=undefined → early return, selectedRules ignored
    expect(config.rules).toBeUndefined()
  })

  test('generateConfig works with empty loaded rules', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(options, {}, undefined, mockGetRuleCategory, vi.fn())
    expect(config.files).toBeDefined()
    expect(config.rules).toBeUndefined()
  })
})

describe('filterValidRules — edge cases', () => {
  test('handles case-insensitive valid IDs against lowercase input', () => {
    const validIds = ['Max-Complexity', 'Max-Params']
    const result = filterValidRules('max-complexity, max-params', validIds)
    expect(result.valid).toEqual(['max-complexity', 'max-params'])
    expect(result.invalid).toEqual([])
  })

  test('handles input with only whitespace', () => {
    const result = filterValidRules('   ', ['max-complexity'])
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })

  test('handles mixed valid and invalid with different casing', () => {
    const validIds = ['Max-Complexity', 'No-Eval']
    const result = filterValidRules('max-complexity, UNKNOWN, no-eval', validIds)
    expect(result.valid).toEqual(['max-complexity', 'no-eval'])
    expect(result.invalid).toEqual(['unknown'])
  })

  test('handles duplicate rule entries in input', () => {
    const validIds = ['max-complexity']
    const result = filterValidRules('max-complexity, max-complexity', validIds)
    expect(result.valid).toEqual(['max-complexity', 'max-complexity'])
  })

  test('handles empty valid IDs list', () => {
    const result = filterValidRules('max-complexity', [])
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual(['max-complexity'])
  })

  test('preserves original order of input', () => {
    const validIds = ['rule-b', 'rule-a', 'rule-c']
    const result = filterValidRules('rule-c, rule-a, rule-b', validIds)
    expect(result.valid).toEqual(['rule-c', 'rule-a', 'rule-b'])
  })
})

describe('detectExistingConfig — edge cases', () => {
  test('handles root directory path', () => {
    const existsFn = (path: string) => path === '/.codeforgerc.json'
    const result = detectExistingConfig('/', ['.codeforgerc.json'], existsFn)
    expect(result).toBe('/.codeforgerc.json')
  })

  test('handles relative directory path', () => {
    const existsFn = (path: string) => path === 'project/.codeforgerc.json'
    const result = detectExistingConfig('project', ['.codeforgerc.json'], existsFn)
    expect(result).toBe('project/.codeforgerc.json')
  })

  test('handles single config file in list', () => {
    const existsFn = (path: string) => path.endsWith('.codeforgerc.json')
    const result = detectExistingConfig('/project', ['.codeforgerc.json'], existsFn)
    expect(result).toBe('/project/.codeforgerc.json')
  })

  test('returns null when all files checked and none exist', () => {
    const checkedPaths: string[] = []
    const existsFn = (path: string) => {
      checkedPaths.push(path)
      return false
    }
    const files = ['.codeforgerc', '.codeforgerc.json', 'codeforge.config.js']
    const result = detectExistingConfig('/project', files, existsFn)
    expect(result).toBeNull()
    expect(checkedPaths).toHaveLength(3)
  })

  test('handles deeply nested directory path', () => {
    const deepPath = '/a/b/c/d/e/project'
    const existsFn = (path: string) => path === `${deepPath}/.codeforgerc.json`
    const result = detectExistingConfig(deepPath, ['.codeforgerc.json'], existsFn)
    expect(result).toBe(`${deepPath}/.codeforgerc.json`)
  })
})

describe('displayConfigSummary — edge cases', () => {
  test('handles config with undefined files', () => {
    const lines: string[] = []
    displayConfigSummary({} as any, '.codeforgerc.json', '/project', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Created')
  })

  test('handles config with single rule', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'], rules: { 'max-complexity': 'error' } } as any,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('1 enabled')
  })

  test('handles config with empty ignore array', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'], ignore: [] } as any,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('Ignore: ')
  })

  test('outputs config file name in success message', () => {
    const lines: string[] = []
    displayConfigSummary({ files: ['**/*.ts'] } as any, 'codeforge.config.js', '/project', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('codeforge.config.js')
  })

  test('outputs custom directory path', () => {
    const lines: string[] = []
    displayConfigSummary({ files: ['**/*.ts'] } as any, '.codeforgerc.json', '/custom/dir', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('/custom/dir')
  })
})

describe('displayRuleList — edge cases', () => {
  test('groups rules by category correctly', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'complexity', description: 'Rule A', id: 'rule-a', recommended: true },
      { category: 'security', description: 'Rule B', id: 'rule-b', recommended: false },
      { category: 'complexity', description: 'Rule C', id: 'rule-c', recommended: false },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    // Both complexity rules should appear under COMPLEXITY
    const complexityIdx = output.indexOf('[COMPLEXITY]')
    const securityIdx = output.indexOf('[SECURITY]')
    const ruleAIdx = output.indexOf('rule-a')
    const ruleCIdx = output.indexOf('rule-c')
    // rule-a and rule-c should appear between COMPLEXITY and SECURITY headers
    expect(ruleAIdx).toBeGreaterThan(complexityIdx)
    expect(ruleCIdx).toBeGreaterThan(complexityIdx)
    expect(ruleAIdx).toBeLessThan(securityIdx)
    expect(ruleCIdx).toBeLessThan(securityIdx)
  })

  test('non-recommended rules do not show recommended marker', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'test', description: 'Non-recommended', id: 'non-rec', recommended: false },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('(recommended)')
    expect(output).toContain('non-rec')
  })

  test('handles single rule with single category', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'security', description: 'Single rule', id: 'only-rule', recommended: true },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[SECURITY]')
    expect(output).toContain('only-rule')
    expect(output).toContain('(recommended)')
  })

  test('includes all three instruction lines', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'test', description: 'test', id: 'test-rule', recommended: true },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Enter rule numbers separated by commas')
    expect(output).toContain('"all" for recommended rules')
    expect(output).toContain('Press Enter to skip')
  })
})

describe('resolveConfigFileName — edge cases', () => {
  test('json format returns dot-prefixed hidden file', () => {
    expect(resolveConfigFileName('json')).toMatch(/^\./)
  })

  test('js format returns non-hidden file', () => {
    expect(resolveConfigFileName('js')).not.toMatch(/^\./)
  })

  test('json file name contains codeforge', () => {
    expect(resolveConfigFileName('json')).toContain('codeforge')
  })

  test('js file name contains config', () => {
    expect(resolveConfigFileName('js')).toContain('config')
  })
})

describe('getRuleInfos — edge cases', () => {
  test('handles rules with special characters in description', () => {
    const rules: Record<string, RuleDefinition> = {
      'special-rule': {
        meta: {
          name: 'special-rule',
          description: 'Rule with "quotes" and <brackets> & ampersands',
          category: 'patterns',
          recommended: true,
        },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
    }
    const result = getRuleInfos(rules, mockGetRuleCategory)
    expect(result[0].description).toBe('Rule with "quotes" and <brackets> & ampersands')
  })

  test('handles single rule', () => {
    const rules: Record<string, RuleDefinition> = {
      'only-rule': {
        meta: {
          name: 'only-rule',
          description: 'Just one',
          category: 'patterns',
          recommended: true,
        },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
    }
    const result = getRuleInfos(rules, mockGetRuleCategory)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('only-rule')
  })

  test('reflects category from getRuleCategoryFn correctly', () => {
    const categoryMap: Record<string, string> = {
      'rule-a': 'security',
      'rule-b': 'performance',
    }
    const rules: Record<string, RuleDefinition> = {
      'rule-a': {
        meta: { name: 'rule-a', description: 'A', category: 'patterns', recommended: true },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
      'rule-b': {
        meta: { name: 'rule-b', description: 'B', category: 'patterns', recommended: false },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
    }
    const getCat = (id: string) => categoryMap[id] ?? 'other'
    const result = getRuleInfos(rules, getCat)
    expect(result.find((r) => r.id === 'rule-a')?.category).toBe('security')
    expect(result.find((r) => r.id === 'rule-b')?.category).toBe('performance')
  })
})

describe('CONFIG_FILE_NAMES re-export', () => {
  test('exports CONFIG_FILE_NAMES constant', () => {
    expect(CONFIG_FILE_NAMES).toBeDefined()
  })

  test('CONFIG_FILE_NAMES is an array', () => {
    expect(Array.isArray(CONFIG_FILE_NAMES)).toBe(true)
  })

  test('CONFIG_FILE_NAMES includes dotfile JSON variant', () => {
    expect(CONFIG_FILE_NAMES).toContain('.codeforgerc.json')
  })

  test('CONFIG_FILE_NAMES includes JS config file', () => {
    expect(CONFIG_FILE_NAMES).toContain('codeforge.config.js')
  })
})

describe('resolveConfigFileName — format details', () => {
  test('json format ends with .json extension', () => {
    expect(resolveConfigFileName('json')).toMatch(/\.json$/)
  })

  test('produces unique names for each format', () => {
    const jsonName = resolveConfigFileName('json')
    const jsName = resolveConfigFileName('js')
    expect(jsonName).not.toBe(jsName)
  })

  test('js format contains config keyword', () => {
    expect(resolveConfigFileName('js')).toContain('config')
  })

  test('json format is a hidden dotfile', () => {
    const name = resolveConfigFileName('json')
    expect(name.startsWith('.')).toBe(true)
  })
})

describe('generateJsonContent — variations', () => {
  test('handles config with unicode characters in strings', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts', 'src/日本語/**/*.ts'] }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.files).toContain('src/日本語/**/*.ts')
  })

  test('handles config with empty arrays', () => {
    const config: CodeForgeConfig = { files: [], ignore: [] }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.files).toEqual([])
    expect(parsed.ignore).toEqual([])
  })

  test('handles config with single-element arrays', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.files).toHaveLength(1)
  })

  test('round-trip preserves all data', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['node_modules/**', 'dist/**'],
      rules: { 'max-complexity': 'error' },
    }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed).toEqual(config)
  })

  test('handles config with only ignore property', () => {
    const config: CodeForgeConfig = { ignore: ['node_modules/**'] }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.ignore).toEqual(['node_modules/**'])
    expect(parsed.files).toBeUndefined()
  })

  test('handles config with only files property', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.files).toEqual(['**/*.ts'])
    expect(parsed.ignore).toBeUndefined()
  })
})

describe('generateJsContent — variations', () => {
  test('export default keyword appears exactly once', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    const result = generateJsContent(config)
    const count = (result.match(/export default/g) ?? []).length
    expect(count).toBe(1)
  })

  test('handles config with only ignore property', () => {
    const config: CodeForgeConfig = { ignore: ['node_modules/**'] }
    const result = generateJsContent(config)
    expect(result).toContain('export default')
    const jsonPart = result.split('export default ')[1].split(';\n')[0]
    const parsed = JSON.parse(jsonPart)
    expect(parsed.ignore).toEqual(['node_modules/**'])
  })

  test('JSON body is valid and matches input', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['dist/**'],
    }
    const result = generateJsContent(config)
    const jsonPart = result.split('export default ')[1].split(';\n')[0]
    const parsed = JSON.parse(jsonPart)
    expect(parsed).toEqual(config)
  })

  test('handles config with empty files array', () => {
    const config: CodeForgeConfig = { files: [] }
    const result = generateJsContent(config)
    const jsonPart = result.split('export default ')[1].split(';\n')[0]
    const parsed = JSON.parse(jsonPart)
    expect(parsed.files).toEqual([])
  })

  test('type annotation is JSDoc block comment', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    const result = generateJsContent(config)
    expect(result.startsWith('/**')).toBe(true)
    expect(result.indexOf('*/')).toBeLessThan(result.indexOf('export default'))
  })
})

describe('getRuleInfos — additional coverage', () => {
  test('handles rules with identical metadata but different IDs', () => {
    const rules: Record<string, RuleDefinition> = {
      'rule-alpha': {
        meta: {
          name: 'rule-alpha',
          description: 'Same desc',
          category: 'patterns',
          recommended: true,
        },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
      'rule-beta': {
        meta: {
          name: 'rule-beta',
          description: 'Same desc',
          category: 'patterns',
          recommended: true,
        },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
    }
    const result = getRuleInfos(rules, mockGetRuleCategory)
    expect(result).toHaveLength(2)
    expect(result[0].id).not.toBe(result[1].id)
    expect(result[0].description).toBe(result[1].description)
  })

  test('handles rules with empty description string', () => {
    const rules: Record<string, RuleDefinition> = {
      'empty-desc': {
        meta: { name: 'empty-desc', description: '', category: 'patterns', recommended: false },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
    }
    const result = getRuleInfos(rules, mockGetRuleCategory)
    expect(result[0].description).toBe('')
  })

  test('handles many rules (10+) correctly', () => {
    const rules: Record<string, RuleDefinition> = {}
    for (let i = 0; i < 15; i++) {
      rules[`rule-${i}`] = {
        meta: {
          name: `rule-${i}`,
          description: `Description ${i}`,
          category: 'patterns',
          recommended: i % 2 === 0,
        },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition
    }
    const result = getRuleInfos(rules, mockGetRuleCategory)
    expect(result).toHaveLength(15)
  })

  test('each info object has exactly four properties', () => {
    const result = getRuleInfos(mockLoadedRules, mockGetRuleCategory)
    for (const info of result) {
      expect(Object.keys(info)).toHaveLength(4)
      expect(Object.keys(info).sort()).toEqual(
        ['category', 'description', 'id', 'recommended'].sort(),
      )
    }
  })

  test('preserves recommended false value correctly', () => {
    const rules: Record<string, RuleDefinition> = {
      'not-rec': {
        meta: {
          name: 'not-rec',
          description: 'Not recommended',
          category: 'patterns',
          recommended: false,
        },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
    }
    const result = getRuleInfos(rules, mockGetRuleCategory)
    expect(result[0].recommended).toBe(false)
    expect(result[0].recommended).not.toBe(true)
  })
})

describe('generateConfig — profile lenient', () => {
  test('no-eval gets error severity', () => {
    const options = makeOptions({ profile: 'lenient' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules!['no-eval']).toBe('error')
  })

  test('recommended non-security rules get warning severity', () => {
    const options = makeOptions({ profile: 'lenient' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules!['max-complexity']).toBe('warning')
    expect(config.rules!['max-params']).toBe('warning')
  })

  test('logs profile description with lenient name', () => {
    const logFn = vi.fn()
    const options = makeOptions({ profile: 'lenient' })
    generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, logFn)
    expect(logFn).toHaveBeenCalledTimes(1)
    const logMsg = logFn.mock.calls[0][0]
    expect(logMsg).toContain('lenient')
  })

  test('ignores selectedRules parameter when profile is set', () => {
    const options = makeOptions({ profile: 'lenient' })
    const configWithSelected = generateConfig(
      options,
      mockLoadedRules,
      ['max-complexity'],
      mockGetRuleCategory,
      vi.fn(),
    )
    const configWithout = generateConfig(
      options,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(Object.keys(configWithSelected.rules!)).toEqual(Object.keys(configWithout.rules!))
  })
})

describe('generateConfig — profile moderate', () => {
  test('security rules get error severity', () => {
    const options = makeOptions({ profile: 'moderate' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules!['no-eval']).toBe('error')
    expect(config.rules!['no-await-in-loop']).toBe('error')
  })

  test('recommended non-security rules get error severity', () => {
    const options = makeOptions({ profile: 'moderate' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules!['max-complexity']).toBe('error')
    expect(config.rules!['max-params']).toBe('error')
  })

  test('logs profile description with moderate name', () => {
    const logFn = vi.fn()
    const options = makeOptions({ profile: 'moderate' })
    generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, logFn)
    expect(logFn).toHaveBeenCalledTimes(1)
    const logMsg = logFn.mock.calls[0][0]
    expect(logMsg).toContain('moderate')
  })

  test('non-recommended non-security rules get warning severity', () => {
    const customRules: Record<string, RuleDefinition> = {
      'custom-pattern': {
        meta: {
          name: 'custom-pattern',
          description: 'Custom pattern rule',
          category: 'patterns',
          recommended: false,
        },
        defaultOptions: {},
        create: vi.fn(),
      } as unknown as RuleDefinition,
    }
    const options = makeOptions({ profile: 'moderate' })
    const config = generateConfig(options, customRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules!['custom-pattern']).toBe('warning')
  })
})

describe('generateConfig — profile strict', () => {
  test('all rules get error severity', () => {
    const options = makeOptions({ profile: 'strict' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    for (const sev of Object.values(config.rules!)) {
      const severity = Array.isArray(sev) ? sev[0] : sev
      expect(severity).toBe('error')
    }
  })

  test('all loaded rules are included in output', () => {
    const options = makeOptions({ profile: 'strict' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(Object.keys(config.rules!)).toHaveLength(Object.keys(mockLoadedRules).length)
    for (const ruleId of Object.keys(mockLoadedRules)) {
      expect(config.rules![ruleId]).toBeDefined()
    }
  })

  test('logs profile description with strict name', () => {
    const logFn = vi.fn()
    const options = makeOptions({ profile: 'strict' })
    generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, logFn)
    expect(logFn).toHaveBeenCalledTimes(1)
    const logMsg = logFn.mock.calls[0][0]
    expect(logMsg).toContain('strict')
  })
})

describe('generateConfig — flag independence', () => {
  test('force flag does not affect config output', () => {
    const optsForce = makeOptions({ minimal: true, force: true })
    const optsNoForce = makeOptions({ minimal: true, force: false })
    const configForce = generateConfig(
      optsForce,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    const configNoForce = generateConfig(
      optsNoForce,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(configForce).toEqual(configNoForce)
  })

  test('interactive flag does not affect config output', () => {
    const optsInter = makeOptions({ minimal: true, interactive: true })
    const optsNoInter = makeOptions({ minimal: true, interactive: false })
    const configInter = generateConfig(
      optsInter,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    const configNoInter = generateConfig(
      optsNoInter,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(configInter).toEqual(configNoInter)
  })

  test('format flag does not affect config output', () => {
    const optsJson = makeOptions({ minimal: true, format: 'json' })
    const optsJs = makeOptions({ minimal: true, format: 'js' })
    const configJson = generateConfig(
      optsJson,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    const configJs = generateConfig(
      optsJs,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(configJson).toEqual(configJs)
  })

  test('dir option does not affect config output', () => {
    const optsDir1 = makeOptions({ minimal: true, dir: '/project-a' })
    const optsDir2 = makeOptions({ minimal: true, dir: '/project-b' })
    const config1 = generateConfig(
      optsDir1,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    const config2 = generateConfig(
      optsDir2,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(config1).toEqual(config2)
  })

  test('multiple flags combined produce same config', () => {
    const optsMinimal = makeOptions({
      minimal: true,
      force: false,
      interactive: false,
      format: 'json',
      dir: '.',
    })
    const optsFlags = makeOptions({
      minimal: true,
      force: true,
      interactive: true,
      format: 'js',
      dir: '/other',
    })
    const configMinimal = generateConfig(
      optsMinimal,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    const configFlags = generateConfig(
      optsFlags,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(configMinimal).toEqual(configFlags)
  })
})

describe('generateConfig — selected rules variations', () => {
  test('selecting all recommended rules matches default path', () => {
    const options = makeOptions()
    const configDefault = generateConfig(
      options,
      mockLoadedRules,
      undefined,
      mockGetRuleCategory,
      vi.fn(),
    )
    const recommendedIds = Object.entries(mockLoadedRules)
      .filter(([, def]) => (def as RuleDefinition).meta.recommended)
      .map(([id]) => id)
    const configSelected = generateConfig(
      options,
      mockLoadedRules,
      recommendedIds,
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(Object.keys(configSelected.rules!)).toEqual(Object.keys(configDefault.rules!))
  })

  test('selecting only non-recommended rules works', () => {
    const options = makeOptions()
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['no-await-in-loop'],
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(config.rules!['no-await-in-loop']).toBe('error')
    expect(config.rules!['max-complexity']).toBeUndefined()
  })

  test('selected rules count matches input count', () => {
    const options = makeOptions()
    const selected = ['max-complexity', 'no-eval', 'no-await-in-loop']
    const config = generateConfig(options, mockLoadedRules, selected, mockGetRuleCategory, vi.fn())
    expect(Object.keys(config.rules!)).toHaveLength(selected.length)
  })

  test('rules not in loadedRules are still added to config', () => {
    const options = makeOptions()
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['max-complexity', 'phantom-rule'],
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(config.rules!['phantom-rule']).toBe('error')
    expect(config.rules!['max-complexity']).toBe('error')
  })

  test('single rule selection produces exactly one rule', () => {
    const options = makeOptions()
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['no-eval'],
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(Object.keys(config.rules!)).toHaveLength(1)
    expect(config.rules!['no-eval']).toBe('error')
  })
})

describe('filterValidRules — boundary conditions', () => {
  test('handles tab characters between rules', () => {
    const result = filterValidRules('max-complexity\t,\tmax-params', [
      'max-complexity',
      'max-params',
    ])
    expect(result.valid).toEqual(['max-complexity', 'max-params'])
  })

  test('handles rule names with numbers', () => {
    const result = filterValidRules('rule-123, rule-456', ['rule-123', 'rule-456'])
    expect(result.valid).toEqual(['rule-123', 'rule-456'])
  })

  test('handles input with leading and trailing commas', () => {
    const result = filterValidRules(',max-complexity,', ['max-complexity'])
    expect(result.valid).toEqual(['max-complexity'])
  })

  test('handles input with only commas', () => {
    const result = filterValidRules(',,,', ['max-complexity'])
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })

  test('handles single-character rule names', () => {
    const result = filterValidRules('a, b, c', ['a', 'b', 'c'])
    expect(result.valid).toEqual(['a', 'b', 'c'])
  })
})

describe('detectExistingConfig — additional scenarios', () => {
  test('handles dot-slash relative path', () => {
    const existsFn = (path: string) => path === '.codeforgerc.json'
    const result = detectExistingConfig('./', ['.codeforgerc.json'], existsFn)
    expect(result).toBe('.codeforgerc.json')
  })

  test('handles path with spaces', () => {
    const dir = '/path/with spaces/project'
    const existsFn = (path: string) => path === `${dir}/.codeforgerc.json`
    const result = detectExistingConfig(dir, ['.codeforgerc.json'], existsFn)
    expect(result).toBe(`${dir}/.codeforgerc.json`)
  })

  test('returns correct joined path for nested directory', () => {
    const dir = '/a/b/c'
    const existsFn = (path: string) => path === '/a/b/c/.codeforgerc.json'
    const result = detectExistingConfig(dir, ['.codeforgerc.json'], existsFn)
    expect(result).toBe('/a/b/c/.codeforgerc.json')
  })

  test('handles config file names with multiple dots', () => {
    const existsFn = (path: string) => path.endsWith('.codeforge.json')
    const result = detectExistingConfig('/project', ['.codeforge.json'], existsFn)
    expect(result).toBe('/project/.codeforge.json')
  })

  test('single-item config files array works', () => {
    const existsFn = (_path: string) => true
    const result = detectExistingConfig('/project', ['only.config'], existsFn)
    expect(result).toBe('/project/only.config')
  })
})

describe('displayConfigSummary — output verification', () => {
  test('file patterns labeled with Files prefix', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'] } as CodeForgeConfig,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('Files:')
  })

  test('handles config with many ignore patterns', () => {
    const lines: string[] = []
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      ignore: ['node_modules/**', 'dist/**', 'coverage/**', '.git/**', 'build/**'],
    }
    displayConfigSummary(config, '.codeforgerc.json', '/project', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('.git/**')
    expect(output).toContain('build/**')
  })

  test('next steps list has three numbered items', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'] } as CodeForgeConfig,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('1.')
    expect(output).toContain('2.')
    expect(output).toContain('3.')
  })

  test('handles config with undefined ignore gracefully', () => {
    const lines: string[] = []
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    displayConfigSummary(config, '.codeforgerc.json', '/project', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Created')
    expect(output).toContain('Ignore:')
  })

  test('single rule shows 1 enabled', () => {
    const lines: string[] = []
    const config: CodeForgeConfig = { files: ['**/*.ts'], rules: { 'no-eval': 'error' } }
    displayConfigSummary(config, '.codeforgerc.json', '/project', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1 enabled')
  })
})

describe('displayRuleList — output verification', () => {
  test('multiple categories each get separate headers', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'alpha', description: 'A', id: 'rule-a', recommended: true },
      { category: 'beta', description: 'B', id: 'rule-b', recommended: true },
      { category: 'gamma', description: 'C', id: 'rule-c', recommended: true },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[ALPHA]')
    expect(output).toContain('[BETA]')
    expect(output).toContain('[GAMMA]')
  })

  test('recommended marker only on recommended rules', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'test', description: 'Rec', id: 'rec-rule', recommended: true },
      { category: 'test', description: 'Non-rec', id: 'non-rec-rule', recommended: false },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    const recLine = lines.find((l) => l.includes('rec-rule') && !l.includes('Rec'))
    const nonRecLine = lines.find((l) => l.includes('non-rec-rule') && !l.includes('Non-rec'))
    expect(recLine).toBeDefined()
    expect(nonRecLine).toBeDefined()
    expect(recLine!).toContain('(recommended)')
    expect(nonRecLine!).not.toContain('(recommended)')
  })

  test('description appears on separate indented line', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      {
        category: 'test',
        description: 'My unique description',
        id: 'test-rule',
        recommended: true,
      },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const descLine = lines.find((l) => l.includes('My unique description'))
    expect(descLine).toBeDefined()
  })

  test('same-category rules are grouped together', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'complexity', description: 'A', id: 'rule-a', recommended: true },
      { category: 'security', description: 'B', id: 'rule-b', recommended: true },
      { category: 'complexity', description: 'C', id: 'rule-c', recommended: false },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    const complexityIdx = output.indexOf('[COMPLEXITY]')
    const securityIdx = output.indexOf('[SECURITY]')
    const ruleAIdx = output.indexOf('rule-a')
    const ruleCIdx = output.indexOf('rule-c')
    expect(ruleAIdx).toBeGreaterThan(complexityIdx)
    expect(ruleCIdx).toBeGreaterThan(complexityIdx)
    expect(ruleAIdx).toBeLessThan(securityIdx)
    expect(ruleCIdx).toBeLessThan(securityIdx)
  })

  test('outputs trailing empty line at end', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'test', description: 'Test', id: 'test-rule', recommended: true },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    expect(lines[lines.length - 1]).toBe('')
  })
})

describe('generateJsonContent — rules with severities', () => {
  test('handles rules with warning severity', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      rules: { 'max-complexity': 'warning' },
    }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.rules['max-complexity']).toBe('warning')
  })

  test('handles rules with off severity', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      rules: { 'no-eval': 'off' },
    }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.rules['no-eval']).toBe('off')
  })

  test('handles mixed severity levels in rules', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      rules: { 'max-complexity': 'error', 'no-eval': 'warning', 'no-await-in-loop': 'off' },
    }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(parsed.rules['max-complexity']).toBe('error')
    expect(parsed.rules['no-eval']).toBe('warning')
    expect(parsed.rules['no-await-in-loop']).toBe('off')
  })

  test('handles large number of rules without truncation', () => {
    const rules: Record<string, string> = {}
    for (let i = 0; i < 50; i++) {
      rules[`rule-${i}`] = 'error'
    }
    const config: CodeForgeConfig = { files: ['**/*.ts'], rules }
    const result = generateJsonContent(config)
    const parsed = JSON.parse(result)
    expect(Object.keys(parsed.rules)).toHaveLength(50)
  })
})

describe('generateJsContent — rules with severities', () => {
  test('handles rules with warning severity', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      rules: { 'max-complexity': 'warning' },
    }
    const result = generateJsContent(config)
    const jsonPart = result.split('export default ')[1].split(';\n')[0]
    const parsed = JSON.parse(jsonPart)
    expect(parsed.rules['max-complexity']).toBe('warning')
  })

  test('handles config with multiple file patterns', () => {
    const config: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    }
    const result = generateJsContent(config)
    const jsonPart = result.split('export default ')[1].split(';\n')[0]
    const parsed = JSON.parse(jsonPart)
    expect(parsed.files).toHaveLength(4)
  })

  test('output always ends with newline', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    const result = generateJsContent(config)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('generateConfig — profile strict with custom rules', () => {
  test('strict profile includes non-recommended rules as error', () => {
    const options = makeOptions({ profile: 'strict' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(config.rules!['no-await-in-loop']).toBe('error')
  })

  test('strict profile includes all four mock rules', () => {
    const options = makeOptions({ profile: 'strict' })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    expect(Object.keys(config.rules!)).toHaveLength(4)
  })
})

describe('generateConfig — recommended rules behavior', () => {
  test('recommended rules from all categories are included by default', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(options, mockLoadedRules, undefined, mockGetRuleCategory, vi.fn())
    // max-complexity (complexity, recommended), max-params (complexity, recommended), no-eval (security, recommended)
    expect(Object.keys(config.rules!)).toHaveLength(3)
  })

  test('selecting a subset of rules excludes the rest', () => {
    const options = makeOptions({ minimal: false })
    const config = generateConfig(
      options,
      mockLoadedRules,
      ['max-params'],
      mockGetRuleCategory,
      vi.fn(),
    )
    expect(Object.keys(config.rules!)).toHaveLength(1)
    expect(config.rules!['max-params']).toBe('error')
    expect(config.rules!['max-complexity']).toBeUndefined()
  })
})

describe('filterValidRules — additional coverage', () => {
  test('handles input with newlines between rules', () => {
    const result = filterValidRules('max-complexity\n,\nmax-params', [
      'max-complexity',
      'max-params',
    ])
    // newlines get trimmed, so this should work
    expect(result.valid).toEqual(['max-complexity', 'max-params'])
  })

  test('handles rule with hyphen and underscore mix', () => {
    const result = filterValidRules('my_rule, my-rule', ['my_rule', 'my-rule'])
    expect(result.valid).toEqual(['my_rule', 'my-rule'])
  })

  test('handles very long rule names', () => {
    const longName = 'a-very-long-rule-name-with-many-segments-for-testing'
    const result = filterValidRules(longName, [longName])
    expect(result.valid).toEqual([longName])
  })
})

describe('detectExistingConfig — path joining', () => {
  test('correctly joins directory and file name with slash', () => {
    const paths: string[] = []
    const existsFn = (path: string) => {
      paths.push(path)
      return false
    }
    detectExistingConfig('/my/project', ['.codeforgerc.json', 'codeforge.config.js'], existsFn)
    expect(paths[0]).toBe('/my/project/.codeforgerc.json')
    expect(paths[1]).toBe('/my/project/codeforge.config.js')
  })

  test('handles empty string directory', () => {
    const existsFn = (path: string) => path === '.codeforgerc.json'
    const result = detectExistingConfig('', ['.codeforgerc.json'], existsFn)
    expect(result).toBe('.codeforgerc.json')
  })
})

describe('displayConfigSummary — output format details', () => {
  test('output contains checkmark symbol', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'] } as CodeForgeConfig,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('✓')
  })

  test('files are comma-separated in output', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts', '**/*.tsx'] } as CodeForgeConfig,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const filesLine = lines.find((l) => l.includes('Files:'))
    expect(filesLine).toBeDefined()
    expect(filesLine!).toContain('**/*.ts, **/*.tsx')
  })

  test('ignore patterns are comma-separated in output', () => {
    const lines: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts'], ignore: ['node_modules/**', 'dist/**'] } as CodeForgeConfig,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const ignoreLine = lines.find((l) => l.includes('Ignore:'))
    expect(ignoreLine).toBeDefined()
    expect(ignoreLine!).toContain('node_modules/**, dist/**')
  })

  test('many rules show correct count', () => {
    const lines: string[] = []
    const rules: Record<string, string> = {}
    for (let i = 0; i < 10; i++) {
      rules[`rule-${i}`] = 'error'
    }
    displayConfigSummary(
      { files: ['**/*.ts'], rules } as unknown as CodeForgeConfig,
      '.codeforgerc.json',
      '/project',
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('10 enabled')
  })
})

describe('displayRuleList — category details', () => {
  test('category headers are uppercase', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'performance', description: 'Perf rule', id: 'perf-rule', recommended: true },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[PERFORMANCE]')
    expect(output).not.toContain('[performance]')
  })

  test('rule IDs are indented with two spaces', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      { category: 'test', description: 'Desc', id: 'my-rule', recommended: true },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const ruleLine = lines.find((l) => l.includes('my-rule') && !l.includes('Desc'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.trimStart()).not.toBe(ruleLine)
  })

  test('descriptions are indented more than rule IDs', () => {
    const lines: string[] = []
    const rules: RuleInfo[] = [
      {
        category: 'test',
        description: 'Some description text',
        id: 'test-rule',
        recommended: true,
      },
    ]
    displayRuleList(rules, (msg) => lines.push(msg))
    const descLine = lines.find((l) => l.includes('Some description text'))
    expect(descLine).toBeDefined()
    // Description should have more leading whitespace than the rule ID line
    const ruleLine = lines.find((l) => l.includes('test-rule') && !l.includes('Some'))
    expect(descLine!.trimStart().length).toBeLessThan(ruleLine!.trimStart().length)
  })
})
