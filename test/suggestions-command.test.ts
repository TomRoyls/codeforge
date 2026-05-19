import { describe, expect, it } from 'vitest'

import Suggestions from '../src/commands/suggestions.js'
import {
  analyzeFile,
  buildSuggestionsResult,
  ruleAnyType,
  ruleConsoleLog,
  ruleDeepNesting,
  ruleEmptyCatch,
  ruleEvalUsage,
  ruleHardcodedStrings,
  ruleLargeFile,
  ruleLongFunction,
  ruleMagicNumbers,
  ruleTodoComments,
  ruleTsIgnore,
  type Suggestion,
} from '../src/commands/suggestions-helpers.js'
import { formatSuggestionsJson, formatSuggestionsTable } from '../src/commands/suggestions-format-helpers.js'

// ─── Test helpers ───────────────────────────────────────

function makeSuggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    rule: 'console-log',
    category: 'quality',
    severity: 'medium',
    title: 'Console statement (log) detected',
    description: 'Use of console.log found.',
    filePath: 'test.ts',
    line: 1,
    suggestion: 'Remove or replace with proper logging library',
    ...overrides,
  }
}

// ─── Command metadata ───────────────────────────────────

describe('Suggestions command - static metadata', () => {
  it('has a description', () => {
    expect(Suggestions.description).toBe(
      'Analyze codebase and generate actionable improvement suggestions',
    )
  })

  it('has examples array', () => {
    expect(Array.isArray(Suggestions.examples)).toBe(true)
    expect(Suggestions.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Suggestions.args.path).toBeDefined()
    expect(Suggestions.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Suggestions.args.path.default).toBe('.')
  })
})

// ─── Command flags ──────────────────────────────────────

describe('Suggestions command - flags', () => {
  it('has format flag with options', () => {
    expect(Suggestions.flags.format.options).toContain('json')
    expect(Suggestions.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Suggestions.flags.format.default).toBe('table')
  })

  it('has category flag with options', () => {
    expect(Suggestions.flags.category.options).toContain('all')
    expect(Suggestions.flags.category.options).toContain('quality')
    expect(Suggestions.flags.category.options).toContain('security')
    expect(Suggestions.flags.category.options).toContain('maintenance')
    expect(Suggestions.flags.category.options).toContain('style')
  })

  it('defaults category to all', () => {
    expect(Suggestions.flags.category.default).toBe('all')
  })

  it('has severity flag with options', () => {
    expect(Suggestions.flags.severity.options).toContain('all')
    expect(Suggestions.flags.severity.options).toContain('high')
    expect(Suggestions.flags.severity.options).toContain('medium')
    expect(Suggestions.flags.severity.options).toContain('low')
  })

  it('defaults severity to all', () => {
    expect(Suggestions.flags.severity.default).toBe('all')
  })

  it('has ext flag defaulting to .ts,.tsx,.js,.jsx', () => {
    expect(Suggestions.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has ignore flag as multiple', () => {
    expect(Suggestions.flags.ignore.multiple).toBe(true)
  })

  it('has output flag', () => {
    expect(Suggestions.flags.output).toBeDefined()
  })

  it('has verbose flag', () => {
    expect(Suggestions.flags.verbose).toBeDefined()
  })
})

// ─── ruleConsoleLog ─────────────────────────────────────

describe('ruleConsoleLog', () => {
  it('detects console.log', () => {
    const results = ruleConsoleLog('console.log("hello")', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('console-log')
    expect(results[0].category).toBe('quality')
    expect(results[0].severity).toBe('medium')
    expect(results[0].line).toBe(1)
  })

  it('detects console.warn', () => {
    const results = ruleConsoleLog('console.warn("warning")', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].title).toContain('warn')
  })

  it('detects console.error', () => {
    const results = ruleConsoleLog('console.error("error")', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].title).toContain('error')
  })

  it('detects console.debug', () => {
    const results = ruleConsoleLog('console.debug("debug")', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].title).toContain('debug')
  })

  it('returns empty for clean code', () => {
    const results = ruleConsoleLog('const x = 1', 'test.ts')
    expect(results.length).toBe(0)
  })

  it('detects multiple console calls', () => {
    const content = 'console.log("a")\nconsole.log("b")'
    const results = ruleConsoleLog(content, 'test.ts')
    expect(results.length).toBe(2)
    expect(results[1].line).toBe(2)
  })

  it('does not detect console.info', () => {
    const results = ruleConsoleLog('console.info("info")', 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleAnyType ────────────────────────────────────────

describe('ruleAnyType', () => {
  it('detects : any type annotation', () => {
    const results = ruleAnyType('const x: any = 1', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('missing-types')
    expect(results[0].severity).toBe('high')
  })

  it('detects as any cast', () => {
    const results = ruleAnyType('const x = y as any', 'test.ts')
    expect(results.length).toBe(1)
  })

  it('detects <any> cast', () => {
    const results = ruleAnyType('const x = <any>y', 'test.ts')
    expect(results.length).toBe(1)
  })

  it('returns empty for clean code', () => {
    const results = ruleAnyType('const x: string = "hello"', 'test.ts')
    expect(results.length).toBe(0)
  })

  it('skips comments with any', () => {
    const results = ruleAnyType('// const x: any = 1', 'test.ts')
    expect(results.length).toBe(0)
  })

  it('skips block comments with any', () => {
    const results = ruleAnyType('/* const x: any = 1 */', 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleTsIgnore ───────────────────────────────────────

describe('ruleTsIgnore', () => {
  it('detects @ts-ignore', () => {
    const results = ruleTsIgnore('// @ts-ignore', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('ts-ignore')
    expect(results[0].severity).toBe('high')
  })

  it('detects @ts-expect-error', () => {
    const results = ruleTsIgnore('// @ts-expect-error', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].title).toContain('ts-expect-error')
  })

  it('returns empty for clean code', () => {
    const results = ruleTsIgnore('const x = 1', 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleLargeFile ──────────────────────────────────────

describe('ruleLargeFile', () => {
  it('detects files over 300 lines', () => {
    const lines = Array.from({ length: 350 }, () => 'line')
    const content = lines.join('\n')
    const results = ruleLargeFile(content, 'big.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('large-file')
    expect(results[0].category).toBe('maintenance')
    expect(results[0].title).toContain('350')
  })

  it('returns empty for small files', () => {
    const lines = Array.from({ length: 100 }, () => 'line')
    const content = lines.join('\n')
    const results = ruleLargeFile(content, 'small.ts')
    expect(results.length).toBe(0)
  })

  it('returns empty for exactly 300 lines', () => {
    const lines = Array.from({ length: 300 }, () => 'line')
    const content = lines.join('\n')
    const results = ruleLargeFile(content, 'exact.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleLongFunction ───────────────────────────────────

describe('ruleLongFunction', () => {
  it('detects long functions', () => {
    const lines = ['function longFn() {']
    for (let i = 0; i < 55; i++) {
      lines.push(`  const x${i} = ${i}`)
    }
    lines.push('}')
    const content = lines.join('\n')
    const results = ruleLongFunction(content, 'test.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].rule).toBe('long-function')
    expect(results[0].category).toBe('maintenance')
  })

  it('returns empty for short functions', () => {
    const content = 'function short() {\n  return 1\n}'
    const results = ruleLongFunction(content, 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleDeepNesting ────────────────────────────────────

describe('ruleDeepNesting', () => {
  it('detects deeply nested code', () => {
    const content = [
      'function deep() {',
      '  if (a) {',
      '    if (b) {',
      '      if (c) {',
      '        if (d) {',
      '          if (e) {',
      '            const x = 1',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ].join('\n')
    const results = ruleDeepNesting(content, 'test.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].rule).toBe('deep-nesting')
    expect(results[0].suggestion).toContain('early returns')
  })

  it('returns empty for flat code', () => {
    const content = 'const x = 1\nconst y = 2'
    const results = ruleDeepNesting(content, 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleMagicNumbers ───────────────────────────────────

describe('ruleMagicNumbers', () => {
  it('detects magic numbers', () => {
    const results = ruleMagicNumbers('const x = 42', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('magic-number')
    expect(results[0].category).toBe('style')
    expect(results[0].severity).toBe('low')
    expect(results[0].title).toContain('42')
  })

  it('ignores common numbers (0, 1, -1, 2, 10, 100, 1000)', () => {
    const content =
      'const a = 0\nconst b = 1\nconst c = -1\nconst d = 2\nconst e = 10\nconst f = 100\nconst g = 1000'
    const results = ruleMagicNumbers(content, 'test.ts')
    expect(results.length).toBe(0)
  })

  it('returns empty for clean code', () => {
    const results = ruleMagicNumbers('const x = "hello"', 'test.ts')
    expect(results.length).toBe(0)
  })

  it('skips import lines', () => {
    const results = ruleMagicNumbers('import { x } from "./mod"', 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleEmptyCatch ─────────────────────────────────────

describe('ruleEmptyCatch', () => {
  it('detects inline empty catch', () => {
    const results = ruleEmptyCatch('try { x() } catch (e) { }', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('empty-catch')
    expect(results[0].severity).toBe('high')
  })

  it('detects empty catch without variable', () => {
    const results = ruleEmptyCatch('try { x() } catch { }', 'test.ts')
    expect(results.length).toBe(1)
  })

  it('detects multi-line empty catch', () => {
    const content = 'try {\n  x()\n} catch (e) {\n\n}'
    const results = ruleEmptyCatch(content, 'test.ts')
    expect(results.length).toBe(1)
  })

  it('returns empty for non-empty catch', () => {
    const content = 'try {\n  x()\n} catch (e) {\n  log(e)\n}'
    const results = ruleEmptyCatch(content, 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleTodoComments ───────────────────────────────────

describe('ruleTodoComments', () => {
  it('detects TODO without issue reference', () => {
    const results = ruleTodoComments('// TODO: fix this', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('todo-no-issue')
    expect(results[0].severity).toBe('low')
  })

  it('detects FIXME without issue reference', () => {
    const results = ruleTodoComments('// FIXME: broken', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].title).toContain('FIXME')
  })

  it('does not flag TODO with issue reference', () => {
    const results = ruleTodoComments('// TODO: fix this #123', 'test.ts')
    expect(results.length).toBe(0)
  })

  it('does not flag FIXME with issue reference', () => {
    const results = ruleTodoComments('// FIXME: broken #456', 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── ruleEvalUsage ──────────────────────────────────────

describe('ruleEvalUsage', () => {
  it('detects eval()', () => {
    const results = ruleEvalUsage('eval("x = 2")', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('eval-usage')
    expect(results[0].category).toBe('security')
    expect(results[0].severity).toBe('high')
  })

  it('detects new Function()', () => {
    const results = ruleEvalUsage('new Function("x", "return x + 1")', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].title).toContain('new Function')
  })

  it('returns empty for clean code', () => {
    const results = ruleEvalUsage('const x = 1', 'test.ts')
    expect(results.length).toBe(0)
  })

  it('detects both eval and new Function on separate lines', () => {
    const content = 'eval("1")\nnew Function("x", "return x")'
    const results = ruleEvalUsage(content, 'test.ts')
    expect(results.length).toBe(2)
  })
})

// ─── ruleHardcodedStrings ───────────────────────────────

describe('ruleHardcodedStrings', () => {
  it('detects variable with api_key in name', () => {
    const results = ruleHardcodedStrings('const API_KEY = "abc123"', 'test.ts')
    expect(results.length).toBe(1)
    expect(results[0].rule).toBe('hardcoded-secret')
    expect(results[0].category).toBe('security')
    expect(results[0].severity).toBe('high')
  })

  it('detects variable with password in name', () => {
    const results = ruleHardcodedStrings('const password = "secret123"', 'test.ts')
    expect(results.length).toBe(1)
  })

  it('detects variable with token in name', () => {
    const results = ruleHardcodedStrings('const token = "tok_abc"', 'test.ts')
    expect(results.length).toBe(1)
  })

  it('returns empty for clean code', () => {
    const results = ruleHardcodedStrings('const name = "hello"', 'test.ts')
    expect(results.length).toBe(0)
  })

  it('skips import lines', () => {
    const results = ruleHardcodedStrings('import { token } from "./mod"', 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── analyzeFile ────────────────────────────────────────

describe('analyzeFile', () => {
  it('runs all rules and returns combined suggestions', () => {
    const content = 'console.log("hello")\nconst x: any = 1\neval("test")'
    const results = analyzeFile(content, 'test.ts')
    expect(results.length).toBeGreaterThanOrEqual(3)
    const rules = results.map((r) => r.rule)
    expect(rules).toContain('console-log')
    expect(rules).toContain('missing-types')
    expect(rules).toContain('eval-usage')
  })

  it('returns empty for clean code', () => {
    const content = 'const name: string = "hello"'
    const results = analyzeFile(content, 'test.ts')
    expect(results.length).toBe(0)
  })
})

// ─── buildSuggestionsResult ──────────────────────────────

describe('buildSuggestionsResult', () => {
  const suggestions: Suggestion[] = [
    makeSuggestion({ category: 'quality', severity: 'high', rule: 'ts-ignore', line: 5 }),
    makeSuggestion({ category: 'security', severity: 'high', rule: 'eval-usage', line: 3 }),
    makeSuggestion({ category: 'style', severity: 'low', rule: 'magic-number', line: 1 }),
    makeSuggestion({ category: 'maintenance', severity: 'medium', rule: 'todo-no-issue', line: 2 }),
  ]

  it('returns all suggestions without filters', () => {
    const result = buildSuggestionsResult(suggestions)
    expect(result.totalFound).toBe(4)
    expect(result.suggestions.length).toBe(4)
  })

  it('filters by category', () => {
    const result = buildSuggestionsResult(suggestions, { category: 'security' })
    expect(result.totalFound).toBe(1)
    expect(result.suggestions[0].category).toBe('security')
  })

  it('filters by severity', () => {
    const result = buildSuggestionsResult(suggestions, { severity: 'high' })
    expect(result.totalFound).toBe(2)
    for (const s of result.suggestions) {
      expect(s.severity).toBe('high')
    }
  })

  it('sorts by severity (high first) then line number', () => {
    const result = buildSuggestionsResult(suggestions)
    expect(result.suggestions[0].severity).toBe('high')
    expect(result.suggestions[0].line).toBeLessThan(result.suggestions[1].line)
  })

  it('computes byCategory breakdown', () => {
    const result = buildSuggestionsResult(suggestions)
    expect(result.byCategory.length).toBe(4)
    const categories = result.byCategory.map((c) => c.category)
    expect(categories).toContain('quality')
    expect(categories).toContain('security')
    expect(categories).toContain('style')
    expect(categories).toContain('maintenance')
  })

  it('computes bySeverity breakdown', () => {
    const result = buildSuggestionsResult(suggestions)
    expect(result.bySeverity.length).toBe(3)
    expect(result.bySeverity[0].severity).toBe('high')
  })

  it('computes topRules breakdown', () => {
    const dupes: Suggestion[] = [
      makeSuggestion({ rule: 'console-log' }),
      makeSuggestion({ rule: 'console-log' }),
      makeSuggestion({ rule: 'eval-usage' }),
    ]
    const result = buildSuggestionsResult(dupes)
    expect(result.topRules[0].rule).toBe('console-log')
    expect(result.topRules[0].count).toBe(2)
  })

  it('handles empty suggestions', () => {
    const result = buildSuggestionsResult([])
    expect(result.totalFound).toBe(0)
    expect(result.suggestions.length).toBe(0)
    expect(result.byCategory.length).toBe(0)
  })

  it('category "all" returns everything', () => {
    const result = buildSuggestionsResult(suggestions, { category: 'all' })
    expect(result.totalFound).toBe(4)
  })

  it('severity "all" returns everything', () => {
    const result = buildSuggestionsResult(suggestions, { severity: 'all' })
    expect(result.totalFound).toBe(4)
  })
})

// ─── formatSuggestionsTable ──────────────────────────────

describe('formatSuggestionsTable', () => {
  it('includes summary header', () => {
    const suggestions = [makeSuggestion()]
    const result = buildSuggestionsResult(suggestions)
    const output = formatSuggestionsTable(result, false)
    expect(output).toContain('Suggestions Report')
    expect(output).toContain('Total suggestions')
  })

  it('shows no-suggestions message when empty', () => {
    const result = buildSuggestionsResult([])
    const output = formatSuggestionsTable(result, false)
    expect(output).toContain('No suggestions found')
  })

  it('shows verbose details when verbose is true', () => {
    const suggestions = [makeSuggestion()]
    const result = buildSuggestionsResult(suggestions)
    const output = formatSuggestionsTable(result, true)
    expect(output).toContain('Description:')
    expect(output).toContain('Suggestion:')
  })

  it('does not show verbose details when verbose is false', () => {
    const suggestions = [makeSuggestion()]
    const result = buildSuggestionsResult(suggestions)
    const output = formatSuggestionsTable(result, false)
    expect(output).not.toContain('Description:')
  })

  it('includes table header columns', () => {
    const suggestions = [makeSuggestion()]
    const result = buildSuggestionsResult(suggestions)
    const output = formatSuggestionsTable(result, false)
    expect(output).toContain('Severity')
    expect(output).toContain('Category')
    expect(output).toContain('Rule')
    expect(output).toContain('File')
    expect(output).toContain('Line')
  })
})

// ─── formatSuggestionsJson ──────────────────────────────

describe('formatSuggestionsJson', () => {
  it('returns valid JSON', () => {
    const suggestions = [makeSuggestion()]
    const result = buildSuggestionsResult(suggestions)
    const output = formatSuggestionsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalFound).toBe(1)
    expect(parsed.suggestions.length).toBe(1)
  })

  it('includes all breakdown fields', () => {
    const suggestions = [makeSuggestion()]
    const result = buildSuggestionsResult(suggestions)
    const output = formatSuggestionsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('byCategory')
    expect(parsed).toHaveProperty('bySeverity')
    expect(parsed).toHaveProperty('topRules')
  })
})

// ─── Clean code produces no suggestions ─────────────────

describe('clean code produces no suggestions', () => {
  it('returns empty for completely clean TypeScript code', () => {
    const content = [
      'interface User {',
      '  name: string',
      '  age: number',
      '}',
      '',
      'function greet(user: User): string {',
      '  return `Hello, ${user.name}!`',
      '}',
      '',
      'export { User, greet }',
    ].join('\n')
    const results = analyzeFile(content, 'clean.ts')
    expect(results.length).toBe(0)
  })
})
