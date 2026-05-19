import { describe, expect, it } from 'vitest'

import Pattern from '../src/commands/pattern.js'
import {
  analyzeFile,
  buildPatternResult,
  detectAsyncWithoutAwait,
  detectCallbackHell,
  detectDefaultExport,
  detectFactory,
  detectGodFile,
  detectMagicString,
  detectObserver,
  detectOptionalChaining,
  detectPromiseChain,
  detectSingleton,
  type DetectedPattern,
  type PatternCategory,
  type PatternResult,
  type PatternSummary,
} from '../src/commands/pattern-helpers.js'
import { formatPatternCsv, formatPatternJson, formatPatternTable } from '../src/commands/pattern-format-helpers.js'

// ─── Test helpers ────────────────────────────────────────

function makeDetectedPattern(overrides: Partial<DetectedPattern> = {}): DetectedPattern {
  return {
    category: 'design',
    confidence: 0.8,
    description: 'Test pattern',
    filePath: 'test.ts',
    line: 1,
    name: 'Singleton',
    snippet: 'static instance',
    ...overrides,
  }
}

function makePatternResult(overrides: Partial<PatternResult> = {}): PatternResult {
  return {
    antiPatterns: 0,
    byCategory: [
      { category: 'design', count: 1 },
      { category: 'anti', count: 0 },
      { category: 'idiom', count: 0 },
    ],
    designPatterns: 1,
    idioms: 0,
    patterns: [makeDetectedPattern()],
    summary: [],
    totalPatterns: 1,
    ...overrides,
  }
}

// ─── Command metadata ───────────────────────────────────

describe('Pattern command - static metadata', () => {
  it('has a description', () => {
    expect(Pattern.description).toBe('Detect design patterns and anti-patterns in code')
  })

  it('has examples array', () => {
    expect(Array.isArray(Pattern.examples)).toBe(true)
    expect(Pattern.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Pattern.args.path).toBeDefined()
    expect(Pattern.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Pattern.args.path.default).toBe('.')
  })
})

// ─── Command flags ──────────────────────────────────────

describe('Pattern command - flags', () => {
  it('has format flag with options', () => {
    expect(Pattern.flags.format.options).toContain('json')
    expect(Pattern.flags.format.options).toContain('table')
    expect(Pattern.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Pattern.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Pattern.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Pattern.flags.ignore).toBeDefined()
    expect(Pattern.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag with default', () => {
    expect(Pattern.flags.ext).toBeDefined()
    expect(Pattern.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has type flag with options', () => {
    expect(Pattern.flags.type.options).toContain('all')
    expect(Pattern.flags.type.options).toContain('anti')
    expect(Pattern.flags.type.options).toContain('design')
    expect(Pattern.flags.type.options).toContain('idiom')
  })

  it('defaults type to all', () => {
    expect(Pattern.flags.type.default).toBe('all')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Pattern.flags.verbose.default).toBe(false)
  })
})

// ─── Command class structure ────────────────────────────

describe('Pattern command - class structure', () => {
  it('exports a default class', () => {
    expect(Pattern).toBeDefined()
    expect(typeof Pattern).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Pattern.prototype.run).toBe('function')
  })
})

// ─── detectSingleton ────────────────────────────────────

describe('detectSingleton', () => {
  it('detects static instance property', () => {
    const code = 'class DB { static instance: DB }'
    const results = detectSingleton(code, 'db.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Singleton')
    expect(results[0]!.category).toBe('design')
    expect(results[0]!.confidence).toBeGreaterThanOrEqual(0.7)
  })

  it('detects static getInstance method', () => {
    const code = 'class DB { static getInstance() {} }'
    const results = detectSingleton(code, 'db.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Singleton')
  })

  it('detects private constructor', () => {
    const code = 'class DB { private constructor() {} }'
    const results = detectSingleton(code, 'db.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Singleton')
  })

  it('returns empty for no singleton', () => {
    const code = 'class Foo { constructor() {} }'
    const results = detectSingleton(code, 'foo.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectFactory ──────────────────────────────────────

describe('detectFactory', () => {
  it('detects create function', () => {
    const code = 'function createUser(name: string) { return { name } }'
    const results = detectFactory(code, 'user.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Factory')
    expect(results[0]!.category).toBe('design')
  })

  it('detects arrow factory', () => {
    const code = 'const createUser: (n: string) => User = (n) => ({ name: n })'
    const results = detectFactory(code, 'user.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('detects Factory class', () => {
    const code = 'class WidgetFactory { build() {} }'
    const results = detectFactory(code, 'widget.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.confidence).toBe(0.6)
  })

  it('returns empty for no factory', () => {
    const code = 'function add(a: number, b: number) { return a + b }'
    const results = detectFactory(code, 'math.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectObserver ─────────────────────────────────────

describe('detectObserver', () => {
  it('detects .on() calls', () => {
    const code = 'emitter.on("data", handler)'
    const results = detectObserver(code, 'events.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Observer')
    expect(results[0]!.category).toBe('design')
  })

  it('detects addEventListener', () => {
    const code = 'document.addEventListener("click", onClick)'
    const results = detectObserver(code, 'ui.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('detects EventEmitter', () => {
    const code = 'import { EventEmitter } from "events"'
    const results = detectObserver(code, 'emitter.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('detects subscribe', () => {
    const code = 'observable.subscribe(observer)'
    const results = detectObserver(code, 'rx.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty for no observer', () => {
    const code = 'const x = 1 + 2'
    const results = detectObserver(code, 'math.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectPromiseChain ─────────────────────────────────

describe('detectPromiseChain', () => {
  it('detects 3+ .then() chains', () => {
    const code = 'fetch(url).then(r => r.json()).then(d => process(d)).then(v => save(v))'
    const results = detectPromiseChain(code, 'api.ts')
    expect(results).toHaveLength(1)
    expect(results[0]!.name).toBe('Promise Chain')
    expect(results[0]!.category).toBe('anti')
    expect(results[0]!.confidence).toBe(0.8)
  })

  it('does not flag 2 .then() calls', () => {
    const code = 'fetch(url).then(r => r.json()).then(d => process(d))'
    const results = detectPromiseChain(code, 'api.ts')
    expect(results).toHaveLength(0)
  })

  it('returns empty for no promises', () => {
    const code = 'const x = 1'
    const results = detectPromiseChain(code, 'const.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectCallbackHell ─────────────────────────────────

describe('detectCallbackHell', () => {
  it('detects deep callback nesting', () => {
    const code = [
      'fs.readFile(f, function(err, d) {',
      '  fs.readFile(d, function(err2, d2) {',
      '    fs.readFile(d2, function(err3, d3) {',
      '      fs.readFile(d3, function(err4, d4) {',
      '      })',
      '    })',
      '  })',
      '})',
    ].join('\n')
    const results = detectCallbackHell(code, 'files.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Callback Hell')
    expect(results[0]!.category).toBe('anti')
  })

  it('returns empty for shallow callbacks', () => {
    const code = 'fs.readFile(f, (err, d) => { console.log(d) })'
    const results = detectCallbackHell(code, 'files.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectGodFile ──────────────────────────────────────

describe('detectGodFile', () => {
  it('detects file with >20 exports', () => {
    const exports = Array.from({ length: 25 }, (_, i) => `export const item${i} = ${i}`).join('\n')
    const results = detectGodFile(exports, 'big.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('God File')
    expect(results[0]!.category).toBe('anti')
  })

  it('detects file with >500 lines', () => {
    const lines = Array.from({ length: 600 }, () => 'const x = 1').join('\n')
    const results = detectGodFile(lines, 'huge.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('God File')
  })

  it('returns empty for small files', () => {
    const code = 'export const x = 1\nexport const y = 2'
    const results = detectGodFile(code, 'small.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectMagicString ──────────────────────────────────

describe('detectMagicString', () => {
  it('detects repeated string literals', () => {
    const code = [
      "const a = 'users'",
      "const b = 'users'",
      "const c = 'users'",
    ].join('\n')
    const results = detectMagicString(code, 'api.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Magic String')
    expect(results[0]!.category).toBe('anti')
    expect(results[0]!.description).toContain('users')
  })

  it('ignores common strings', () => {
    const code = [
      "const a = 'utf-8'",
      "const b = 'utf-8'",
      "const c = 'utf-8'",
    ].join('\n')
    const results = detectMagicString(code, 'config.ts')
    expect(results).toHaveLength(0)
  })

  it('ignores single-char strings', () => {
    const code = [
      "const a = '.'",
      "const b = '.'",
      "const c = '.'",
    ].join('\n')
    const results = detectMagicString(code, 'path.ts')
    expect(results).toHaveLength(0)
  })

  it('returns empty for non-repeated strings', () => {
    const code = "const a = 'hello'\nconst b = 'world'"
    const results = detectMagicString(code, 'misc.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectAsyncWithoutAwait ────────────────────────────

describe('detectAsyncWithoutAwait', () => {
  it('detects async function without await', () => {
    const code = 'async function getData() { return fetch(url) }'
    const results = detectAsyncWithoutAwait(code, 'api.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Async Without Await')
    expect(results[0]!.category).toBe('idiom')
    expect(results[0]!.confidence).toBe(0.8)
  })

  it('detects async arrow without await', () => {
    const code = 'const fn = async () => { return 42 }'
    const results = detectAsyncWithoutAwait(code, 'fn.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('does not flag async function with await', () => {
    const code = 'async function getData() { return await fetch(url) }'
    const results = detectAsyncWithoutAwait(code, 'api.ts')
    expect(results).toHaveLength(0)
  })

  it('returns empty for non-async code', () => {
    const code = 'function getData() { return 42 }'
    const results = detectAsyncWithoutAwait(code, 'fn.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectDefaultExport ────────────────────────────────

describe('detectDefaultExport', () => {
  it('detects export default', () => {
    const code = 'export default class Foo {}'
    const results = detectDefaultExport(code, 'foo.ts')
    expect(results).toHaveLength(1)
    expect(results[0]!.name).toBe('Default Export')
    expect(results[0]!.category).toBe('idiom')
    expect(results[0]!.confidence).toBe(0.5)
  })

  it('does not flag named exports', () => {
    const code = 'export class Foo {}'
    const results = detectDefaultExport(code, 'foo.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── detectOptionalChaining ─────────────────────────────

describe('detectOptionalChaining', () => {
  it('detects optional chaining', () => {
    const code = 'const name = user?.profile?.name'
    const results = detectOptionalChaining(code, 'user.ts')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0]!.name).toBe('Optional Chaining')
    expect(results[0]!.category).toBe('idiom')
    expect(results[0]!.confidence).toBe(0.9)
  })

  it('does not flag ternary operator', () => {
    const code = 'const x = a ? b : c'
    const results = detectOptionalChaining(code, 'logic.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── analyzeFile ────────────────────────────────────────

describe('analyzeFile', () => {
  it('runs all detectors on a file', () => {
    const code = [
      'class DB {',
      '  private constructor() {}',
      '  static instance: DB',
      '  static getInstance() { return DB.instance }',
      '}',
      '',
      'export default DB',
      '',
      'const name = db?.config?.name',
      '',
      'async function noop() { return 1 }',
    ].join('\n')
    const results = analyzeFile(code, 'db.ts')
    const names = results.map((r) => r.name)
    expect(names).toContain('Singleton')
    expect(names).toContain('Default Export')
    expect(names).toContain('Optional Chaining')
    expect(names).toContain('Async Without Await')
  })

  it('returns empty for plain code with no patterns', () => {
    const code = 'const x = 1\nconst y = 2\nconsole.log(x + y)'
    const results = analyzeFile(code, 'simple.ts')
    expect(results).toHaveLength(0)
  })
})

// ─── buildPatternResult ─────────────────────────────────

describe('buildPatternResult', () => {
  it('filters by type', () => {
    const patterns: DetectedPattern[] = [
      makeDetectedPattern({ category: 'design', name: 'Singleton' }),
      makeDetectedPattern({ category: 'anti', name: 'Promise Chain' }),
      makeDetectedPattern({ category: 'idiom', name: 'Default Export' }),
    ]
    const result = buildPatternResult(patterns, 'anti')
    expect(result.patterns).toHaveLength(1)
    expect(result.patterns[0]!.name).toBe('Promise Chain')
  })

  it('returns all when filter is all', () => {
    const patterns: DetectedPattern[] = [
      makeDetectedPattern({ category: 'design', name: 'Singleton' }),
      makeDetectedPattern({ category: 'anti', name: 'Promise Chain' }),
    ]
    const result = buildPatternResult(patterns, 'all')
    expect(result.totalPatterns).toBe(2)
  })

  it('computes byCategory counts', () => {
    const patterns: DetectedPattern[] = [
      makeDetectedPattern({ category: 'design', name: 'Singleton' }),
      makeDetectedPattern({ category: 'design', name: 'Factory' }),
      makeDetectedPattern({ category: 'anti', name: 'Promise Chain' }),
      makeDetectedPattern({ category: 'idiom', name: 'Default Export' }),
    ]
    const result = buildPatternResult(patterns, 'all')
    expect(result.designPatterns).toBe(2)
    expect(result.antiPatterns).toBe(1)
    expect(result.idioms).toBe(1)
  })

  it('computes summary with avgConfidence', () => {
    const patterns: DetectedPattern[] = [
      makeDetectedPattern({ category: 'design', name: 'Singleton', confidence: 0.8, filePath: 'a.ts' }),
      makeDetectedPattern({ category: 'design', name: 'Singleton', confidence: 0.6, filePath: 'b.ts' }),
    ]
    const result = buildPatternResult(patterns, 'all')
    expect(result.summary).toHaveLength(1)
    expect(result.summary[0]!.count).toBe(2)
    expect(result.summary[0]!.avgConfidence).toBeCloseTo(0.7)
    expect(result.summary[0]!.files).toContain('a.ts')
    expect(result.summary[0]!.files).toContain('b.ts')
  })

  it('handles empty patterns', () => {
    const result = buildPatternResult([], 'all')
    expect(result.totalPatterns).toBe(0)
    expect(result.designPatterns).toBe(0)
    expect(result.antiPatterns).toBe(0)
    expect(result.idioms).toBe(0)
    expect(result.summary).toHaveLength(0)
  })
})

// ─── formatPatternTable ─────────────────────────────────

describe('formatPatternTable', () => {
  it('contains summary section', () => {
    const result = makePatternResult()
    const output = formatPatternTable(result, false)
    expect(output).toContain('Pattern Detection Report')
    expect(output).toContain('Design Patterns')
    expect(output).toContain('Anti-Patterns')
    expect(output).toContain('Idioms')
  })

  it('contains table headers', () => {
    const result = makePatternResult()
    const output = formatPatternTable(result, false)
    expect(output).toContain('Pattern')
    expect(output).toContain('Category')
    expect(output).toContain('File')
    expect(output).toContain('Confidence')
  })

  it('shows pattern data rows', () => {
    const result = makePatternResult({
      patterns: [makeDetectedPattern({ name: 'Singleton', category: 'design', filePath: 'db.ts' })],
    })
    const output = formatPatternTable(result, false)
    expect(output).toContain('Singleton')
    expect(output).toContain('db.ts')
  })

  it('shows verbose details when enabled', () => {
    const result = makePatternResult({
      patterns: [makeDetectedPattern({ name: 'Singleton', description: 'Test pattern detected', snippet: 'static instance' })],
    })
    const output = formatPatternTable(result, true)
    expect(output).toContain('Detailed Findings')
    expect(output).toContain('Test pattern detected')
  })

  it('hides verbose details when disabled', () => {
    const result = makePatternResult({
      patterns: [makeDetectedPattern({ name: 'Singleton' })],
    })
    const output = formatPatternTable(result, false)
    expect(output).not.toContain('Detailed Findings')
  })

  it('handles empty patterns', () => {
    const result = makePatternResult({
      patterns: [],
      totalPatterns: 0,
      designPatterns: 0,
      antiPatterns: 0,
      idioms: 0,
    })
    const output = formatPatternTable(result, false)
    expect(output).toContain('Pattern Detection Report')
    expect(output).toContain('Total: 0')
  })
})

// ─── formatPatternCsv ───────────────────────────────────

describe('formatPatternCsv', () => {
  it('produces CSV with headers', () => {
    const result = makePatternResult({ patterns: [] })
    const output = formatPatternCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Pattern,Category,File,Line,Confidence,Description')
  })

  it('includes data rows', () => {
    const result = makePatternResult({
      patterns: [makeDetectedPattern({ name: 'Singleton', category: 'design', filePath: 'db.ts', line: 5, confidence: 0.9, description: 'Singleton detected' })],
    })
    const output = formatPatternCsv(result)
    expect(output).toContain('Singleton')
    expect(output).toContain('design')
    expect(output).toContain('db.ts')
  })

  it('includes summary counts', () => {
    const result = makePatternResult({
      designPatterns: 3,
      antiPatterns: 1,
      idioms: 2,
      totalPatterns: 6,
    })
    const output = formatPatternCsv(result)
    expect(output).toContain('Design Patterns,3')
    expect(output).toContain('Anti-Patterns,1')
    expect(output).toContain('Idioms,2')
    expect(output).toContain('Total,6')
  })

  it('escapes commas in descriptions', () => {
    const result = makePatternResult({
      patterns: [makeDetectedPattern({ description: 'Found in foo, bar and baz' })],
    })
    const output = formatPatternCsv(result)
    expect(output).toContain('"Found in foo, bar and baz"')
  })
})

// ─── formatPatternJson ──────────────────────────────────

describe('formatPatternJson', () => {
  it('produces valid JSON', () => {
    const result = makePatternResult()
    const output = formatPatternJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains patterns array', () => {
    const result = makePatternResult()
    const output = formatPatternJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.patterns).toBeDefined()
    expect(Array.isArray(parsed.patterns)).toBe(true)
  })

  it('contains summary array', () => {
    const result = makePatternResult()
    const output = formatPatternJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.summary).toBeDefined()
    expect(Array.isArray(parsed.summary)).toBe(true)
  })

  it('contains category counts', () => {
    const result = makePatternResult({ designPatterns: 5, antiPatterns: 3, idioms: 1, totalPatterns: 9 })
    const output = formatPatternJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.designPatterns).toBe(5)
    expect(parsed.antiPatterns).toBe(3)
    expect(parsed.idioms).toBe(1)
    expect(parsed.totalPatterns).toBe(9)
  })

  it('preserves pattern data', () => {
    const result = makePatternResult({
      patterns: [makeDetectedPattern({ name: 'Factory', confidence: 0.75, filePath: 'factory.ts' })],
    })
    const output = formatPatternJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.patterns[0].name).toBe('Factory')
    expect(parsed.patterns[0].confidence).toBe(0.75)
    expect(parsed.patterns[0].filePath).toBe('factory.ts')
  })

  it('handles empty results', () => {
    const result = makePatternResult({
      patterns: [],
      totalPatterns: 0,
      designPatterns: 0,
      antiPatterns: 0,
      idioms: 0,
      summary: [],
    })
    const output = formatPatternJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.patterns).toHaveLength(0)
    expect(parsed.totalPatterns).toBe(0)
  })
})
