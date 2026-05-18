import { describe, it, expect } from 'vitest'
import {
  resolveConfigFileName,
  generateJsonContent,
  generateJsContent,
  getRuleInfos,
  generateConfig,
  filterValidRules,
  detectExistingConfig,
  displayConfigSummary,
  displayRuleList,
} from '../src/commands/init-helpers.js'

import type { InitOptions, RuleInfo } from '../src/commands/init-helpers.js'
import type { CodeForgeConfig } from '../src/config/types.js'

// ─── resolveConfigFileName ─────────────────────────────
describe('resolveConfigFileName', () => {
  it('returns json filename for json format', () => {
    expect(resolveConfigFileName('json')).toBe('.codeforgerc.json')
  })

  it('returns js filename for js format', () => {
    expect(resolveConfigFileName('js')).toBe('codeforge.config.js')
  })
})

// ─── generateJsonContent ──────────────────────────────
describe('generateJsonContent', () => {
  it('generates valid JSON', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'], ignore: ['node_modules/**'] }
    const result = generateJsonContent(config)
    expect(JSON.parse(result)).toEqual(config)
  })

  it('pretty-prints with 2 spaces', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    const result = generateJsonContent(config)
    expect(result).toContain('  "files"')
  })

  it('handles empty config', () => {
    const result = generateJsonContent({})
    expect(JSON.parse(result)).toEqual({})
  })
})

// ─── generateJsContent ────────────────────────────────
describe('generateJsContent', () => {
  it('includes JSDoc type annotation', () => {
    const result = generateJsContent({})
    expect(result).toContain("/** @type {import('codeforge').CodeForgeConfig} */")
  })

  it('includes export default', () => {
    const result = generateJsContent({})
    expect(result).toContain('export default')
  })

  it('includes config as JSON', () => {
    const config: CodeForgeConfig = { files: ['**/*.ts'] }
    const result = generateJsContent(config)
    expect(result).toContain('**/*.ts')
  })

  it('ends with semicolon and newline', () => {
    const result = generateJsContent({})
    expect(result.trimEnd()).toMatch(/;\s*$/)
  })
})

// ─── getRuleInfos ──────────────────────────────────────
describe('getRuleInfos', () => {
  it('maps rule definitions to RuleInfo objects', () => {
    const rules = {
      'no-console': {
        meta: { description: 'No console', recommended: true },
      },
      'no-eval': {
        meta: { description: 'No eval', recommended: false },
      },
    }
    const result = getRuleInfos(
      rules as Record<string, { meta: { description: string; recommended: boolean } }>,
      (id) => (id === 'no-console' ? 'style' : 'security'),
    )
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('no-console')
    expect(result[0]!.category).toBe('style')
    expect(result[0]!.recommended).toBe(true)
    expect(result[1]!.category).toBe('security')
  })

  it('handles empty rules', () => {
    const result = getRuleInfos({}, () => 'test')
    expect(result).toEqual([])
  })
})

// ─── generateConfig ────────────────────────────────────
describe('generateConfig', () => {
  const baseOptions: InitOptions = {
    dir: '.',
    force: false,
    format: 'json',
    interactive: false,
    minimal: false,
    profile: undefined,
    typescript: false,
  }

  it('returns config with js and ts patterns when not typescript', () => {
    const logs: string[] = []
    const config = generateConfig(baseOptions, {}, undefined, () => 'test', (m) => logs.push(m))
    expect(config.files).toContain('**/*.js')
    expect(config.files).toContain('**/*.ts')
  })

  it('returns config with only ts patterns when typescript', () => {
    const opts = { ...baseOptions, typescript: true }
    const config = generateConfig(opts, {}, undefined, () => 'test', () => {})
    expect(config.files).not.toContain('**/*.js')
    expect(config.files).toContain('**/*.ts')
    expect(config.files).toContain('**/*.tsx')
  })

  it('returns minimal config when minimal=true and no profile', () => {
    const opts = { ...baseOptions, minimal: true }
    const config = generateConfig(opts, {}, undefined, () => 'test', () => {})
    expect(config.rules).toBeUndefined()
  })

  it('includes rules when profile is set', () => {
    const opts: InitOptions = { ...baseOptions, profile: 'moderate' }
    const rules = {
      'no-console': { meta: { description: 'No console', recommended: true } },
    }
    const config = generateConfig(
      opts,
      rules as Record<string, { meta: { description: string; recommended: boolean } }>,
      undefined,
      () => 'style',
      () => {},
    )
    expect(config.rules).toBeDefined()
  })

  it('includes recommended rules when no selected rules', () => {
    const rules = {
      'no-console': { meta: { description: 'No console', recommended: true } },
      'no-eval': { meta: { description: 'No eval', recommended: false } },
    }
    const config = generateConfig(baseOptions, rules as never, undefined, () => 'test', () => {})
    expect(Object.keys(config.rules ?? {})).toContain('no-console')
    expect(Object.keys(config.rules ?? {})).not.toContain('no-eval')
  })

  it('uses selected rules when provided', () => {
    const rules = {
      'no-console': { meta: { description: 'No console', recommended: true } },
      'no-eval': { meta: { description: 'No eval', recommended: false } },
    }
    const config = generateConfig(
      baseOptions,
      rules as never,
      ['no-eval'],
      () => 'test',
      () => {},
    )
    expect(Object.keys(config.rules ?? {})).toContain('no-eval')
  })
})

// ─── filterValidRules ──────────────────────────────────
describe('filterValidRules', () => {
  it('splits comma-separated input', () => {
    const result = filterValidRules('no-console,no-eval', ['no-console', 'no-eval'])
    expect(result.valid).toEqual(['no-console', 'no-eval'])
    expect(result.invalid).toEqual([])
  })

  it('filters out invalid rules', () => {
    const result = filterValidRules('no-console,fake-rule', ['no-console'])
    expect(result.valid).toEqual(['no-console'])
    expect(result.invalid).toEqual(['fake-rule'])
  })

  it('is case-insensitive', () => {
    const result = filterValidRules('No-Console', ['no-console'])
    expect(result.valid).toEqual(['no-console'])
  })

  it('trims whitespace', () => {
    const result = filterValidRules(' no-console , no-eval ', ['no-console', 'no-eval'])
    expect(result.valid).toEqual(['no-console', 'no-eval'])
  })

  it('ignores empty segments', () => {
    const result = filterValidRules('no-console,,', ['no-console'])
    expect(result.valid).toEqual(['no-console'])
  })

  it('handles empty input', () => {
    const result = filterValidRules('', ['no-console'])
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })

  it('all invalid when no valid rules', () => {
    const result = filterValidRules('a,b', [])
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual(['a', 'b'])
  })
})

// ─── detectExistingConfig ──────────────────────────────
describe('detectExistingConfig', () => {
  it('returns path when config file exists', () => {
    const result = detectExistingConfig(
      '/project',
      ['.codeforgerc.json', 'codeforge.config.js'],
      (fp) => fp === '/project/.codeforgerc.json',
    )
    expect(result).toBe('/project/.codeforgerc.json')
  })

  it('returns null when no config file exists', () => {
    const result = detectExistingConfig(
      '/project',
      ['.codeforgerc.json', 'codeforge.config.js'],
      () => false,
    )
    expect(result).toBeNull()
  })

  it('checks files in order', () => {
    const calls: string[] = []
    detectExistingConfig(
      '/project',
      ['first', 'second'],
      (fp) => {
        calls.push(fp)
        return false
      },
    )
    expect(calls).toEqual(['/project/first', '/project/second'])
  })

  it('returns first match', () => {
    const result = detectExistingConfig(
      '/project',
      ['a', 'b', 'c'],
      (fp) => fp === '/project/b',
    )
    expect(result).toBe('/project/b')
  })
})

// ─── displayConfigSummary ──────────────────────────────
describe('displayConfigSummary', () => {
  it('logs config file creation', () => {
    const messages: string[] = []
    const config: CodeForgeConfig = {
      files: ['**/*.ts'],
      ignore: ['node_modules/**'],
      rules: { 'no-console': 'error' },
    }
    displayConfigSummary(config, '.codeforgerc.json', '.', (m) => messages.push(m))
    expect(messages.some((m) => m.includes('.codeforgerc.json'))).toBe(true)
    expect(messages.some((m) => m.includes('Created'))).toBe(true)
  })

  it('shows file patterns', () => {
    const messages: string[] = []
    displayConfigSummary(
      { files: ['**/*.ts', '**/*.tsx'] },
      '.codeforgerc.json',
      '.',
      (m) => messages.push(m),
    )
    expect(messages.some((m) => m.includes('**/*.ts'))).toBe(true)
  })

  it('shows rule count', () => {
    const messages: string[] = []
    displayConfigSummary(
      { rules: { 'no-console': 'error', 'no-eval': 'warning' } },
      '.codeforgerc.json',
      '.',
      (m) => messages.push(m),
    )
    expect(messages.some((m) => m.includes('2 enabled'))).toBe(true)
  })

  it('shows next steps', () => {
    const messages: string[] = []
    displayConfigSummary({}, '.codeforgerc.json', '.', (m) => messages.push(m))
    expect(messages.some((m) => m.includes('Next steps'))).toBe(true)
    expect(messages.some((m) => m.includes('codeforge analyze'))).toBe(true)
  })
})

// ─── displayRuleList ───────────────────────────────────
describe('displayRuleList', () => {
  it('displays rule selection header', () => {
    const messages: string[] = []
    displayRuleList([], (m) => messages.push(m))
    expect(messages.some((m) => m.includes('Select rules'))).toBe(true)
  })

  it('groups rules by category', () => {
    const rules: RuleInfo[] = [
      { category: 'security', description: 'test', id: 'no-eval', recommended: true },
      { category: 'style', description: 'test2', id: 'prefer-const', recommended: false },
    ]
    const messages: string[] = []
    displayRuleList(rules, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('SECURITY'))).toBe(true)
    expect(messages.some((m) => m.includes('STYLE'))).toBe(true)
  })

  it('shows recommended tag', () => {
    const rules: RuleInfo[] = [
      { category: 'test', description: 'test rule', id: 'my-rule', recommended: true },
    ]
    const messages: string[] = []
    displayRuleList(rules, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('recommended'))).toBe(true)
  })

  it('shows rule descriptions', () => {
    const rules: RuleInfo[] = [
      { category: 'test', description: 'Prevents use of eval', id: 'no-eval', recommended: false },
    ]
    const messages: string[] = []
    displayRuleList(rules, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('Prevents use of eval'))).toBe(true)
  })
})
