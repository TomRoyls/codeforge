import { describe, it, expect } from 'vitest'
import {
  detectExistingConfig,
  displayConfigSummary,
  filterValidRules,
  generateConfig,
  generateJsContent,
  generateJsonContent,
  getRuleInfos,
  resolveConfigFileName,
  type RuleInfo,
  type InitOptions,
} from '../src/commands/init-helpers.js'
import type { RuleDefinition } from '../src/rules/types.js'

const fakeGetRuleCategory = (id: string) => {
  if (id.startsWith('sec-')) return 'security'
  if (id.startsWith('perf-')) return 'performance'
  return 'patterns'
}

function makeRuleDef(overrides: Partial<RuleDefinition['meta']> = {}): RuleDefinition {
  return {
    meta: {
      description: 'test rule',
      recommended: true,
      severity: 'error',
      ...overrides,
    },
    create: () => ({}),
  } as unknown as RuleDefinition
}

const baseOptions: InitOptions = {
  dir: '.',
  force: false,
  format: 'json',
  interactive: false,
  minimal: false,
  profile: undefined,
  typescript: true,
}

// ─── resolveConfigFileName ───────────────────────────
describe('resolveConfigFileName', () => {
  it('returns .codeforgerc.json for json format', () => {
    expect(resolveConfigFileName('json')).toBe('.codeforgerc.json')
  })

  it('returns codeforge.config.js for js format', () => {
    expect(resolveConfigFileName('js')).toBe('codeforge.config.js')
  })
})

// ─── generateJsonContent ─────────────────────────────
describe('generateJsonContent', () => {
  it('produces valid JSON', () => {
    const config = { files: ['**/*.ts'], ignore: [], rules: {} } as any
    const result = generateJsonContent(config)

    expect(JSON.parse(result)).toEqual(config)
  })

  it('pretty-prints with 2-space indent', () => {
    const config = { files: ['**/*.ts'] } as any
    const result = generateJsonContent(config)

    expect(result).toContain('  "files"')
  })
})

// ─── generateJsContent ───────────────────────────────
describe('generateJsContent', () => {
  it('includes JSDoc type annotation', () => {
    const config = { files: ['**/*.ts'] } as any
    const result = generateJsContent(config)

    expect(result).toContain("import('codeforge').CodeForgeConfig")
    expect(result).toContain('export default')
  })

  it('ends with a newline', () => {
    const config = { files: ['**/*.ts'] } as any
    const result = generateJsContent(config)

    expect(result.endsWith('\n')).toBe(true)
  })
})

// ─── getRuleInfos ────────────────────────────────────
describe('getRuleInfos', () => {
  it('maps rule definitions to RuleInfo objects', () => {
    const rules = {
      'no-eval': makeRuleDef({ description: 'no eval', recommended: true }),
      'prefer-const': makeRuleDef({ description: 'prefer const', recommended: false }),
    }

    const infos = getRuleInfos(rules, fakeGetRuleCategory)

    expect(infos).toHaveLength(2)
    expect(infos[0]).toEqual({
      category: 'patterns',
      description: 'no eval',
      id: 'no-eval',
      recommended: true,
    })
    expect(infos[1]!.id).toBe('prefer-const')
    expect(infos[1]!.recommended).toBe(false)
  })

  it('returns empty array for empty rules', () => {
    const infos = getRuleInfos({}, fakeGetRuleCategory)
    expect(infos).toEqual([])
  })
})

// ─── generateConfig ──────────────────────────────────
describe('generateConfig', () => {
  it('returns minimal config when minimal=true and no profile', () => {
    const logged: string[] = []
    const opts = { ...baseOptions, minimal: true }
    const config = generateConfig(opts, {}, undefined, fakeGetRuleCategory, (m) => logged.push(m))

    expect(config.rules).toBeUndefined()
    expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
  })

  it('includes js/jsx patterns when typescript=false', () => {
    const opts: InitOptions = { ...baseOptions, typescript: false }
    const config = generateConfig(opts, {}, undefined, fakeGetRuleCategory, () => {})

    expect(config.files).toContain('**/*.js')
    expect(config.files).toContain('**/*.jsx')
  })

  it('enables recommended rules when no profile and no selectedRules', () => {
    const rules = {
      'no-eval': makeRuleDef({ recommended: true }),
      'optional-rule': makeRuleDef({ recommended: false }),
    }

    const config = generateConfig(baseOptions, rules, undefined, fakeGetRuleCategory, () => {})

    expect(config.rules!['no-eval']).toBe('error')
    expect(config.rules!['optional-rule']).toBeUndefined()
  })

  it('enables only selected rules when selectedRules provided', () => {
    const rules = {
      'no-eval': makeRuleDef(),
      'prefer-const': makeRuleDef(),
    }

    const config = generateConfig(
      baseOptions,
      rules,
      ['prefer-const'],
      fakeGetRuleCategory,
      () => {},
    )

    expect(config.rules!['prefer-const']).toBe('error')
    expect(config.rules!['no-eval']).toBeUndefined()
  })

  it('enables selected rules as errors even when empty array', () => {
    const rules = { 'no-eval': makeRuleDef() }
    const config = generateConfig(baseOptions, rules, [], fakeGetRuleCategory, () => {})

    expect(config.rules).toBeUndefined()
  })
})

// ─── filterValidRules ────────────────────────────────
describe('filterValidRules', () => {
  it('splits comma-separated input and filters valid rules', () => {
    const result = filterValidRules('no-eval,prefer-const', ['no-eval', 'prefer-const', 'other'])

    expect(result.valid).toEqual(['no-eval', 'prefer-const'])
    expect(result.invalid).toEqual([])
  })

  it('reports invalid rules', () => {
    const result = filterValidRules('no-eval,fake-rule', ['no-eval'])

    expect(result.valid).toEqual(['no-eval'])
    expect(result.invalid).toEqual(['fake-rule'])
  })

  it('handles case-insensitive matching', () => {
    const result = filterValidRules('No-Eval', ['no-eval'])

    expect(result.valid).toEqual(['no-eval'])
  })

  it('trims whitespace from input', () => {
    const result = filterValidRules(' no-eval , prefer-const ', ['no-eval', 'prefer-const'])

    expect(result.valid).toEqual(['no-eval', 'prefer-const'])
  })

  it('returns empty arrays for empty input', () => {
    const result = filterValidRules('', ['no-eval'])

    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })
})

// ─── detectExistingConfig ────────────────────────────
describe('detectExistingConfig', () => {
  it('returns null when no config files exist', () => {
    const result = detectExistingConfig('/project', ['.codeforgerc.json', 'codeforge.config.js'], () => false)

    expect(result).toBeNull()
  })

  it('returns the first existing config file path', () => {
    const result = detectExistingConfig(
      '/project',
      ['.codeforgerc.json', 'codeforge.config.js'],
      (p) => p.includes('.codeforgerc.json'),
    )

    expect(result).toBe('/project/.codeforgerc.json')
  })

  it('returns second config if first does not exist', () => {
    const result = detectExistingConfig(
      '/project',
      ['.codeforgerc.json', 'codeforge.config.js'],
      (p) => p.includes('codeforge.config.js'),
    )

    expect(result).toBe('/project/codeforge.config.js')
  })
})

// ─── displayConfigSummary ────────────────────────────
describe('displayConfigSummary', () => {
  it('logs config details and next steps', () => {
    const logged: string[] = []
    const config = { files: ['**/*.ts'], ignore: ['node_modules'], rules: { a: 'error', b: 'warning' } } as any

    displayConfigSummary(config, '.codeforgerc.json', '/project', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('.codeforgerc.json'))).toBe(true)
    expect(logged.some((l) => l.includes('2 enabled'))).toBe(true)
    expect(logged.some((l) => l.includes('Next steps'))).toBe(true)
  })

  it('does not show rules count when no rules', () => {
    const logged: string[] = []
    const config = { files: ['**/*.ts'], ignore: [] } as any

    displayConfigSummary(config, '.codeforgerc.json', '/project', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('enabled'))).toBe(false)
  })
})
