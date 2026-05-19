import { describe, expect, it } from 'vitest'

import Performance from '../src/commands/performance.js'
import {
  buildPerfResult,
  computePerfStats,
  getPerfRules,
  scanFile,
  type PerfFinding,
  type PerfResult,
  type PerfRule,
  type PerfStats,
} from '../src/commands/performance-helpers.js'
import {
  formatPerfCategory,
  formatPerfJson,
  formatPerfSeverity,
  formatPerfTable,
} from '../src/commands/performance-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makePerfFinding(overrides: Partial<PerfFinding> = {}): PerfFinding {
  return {
    category: 'io',
    context: 'const x = readFileSync("f")',
    file: 'test.ts',
    line: 1,
    match: 'readFileSync("f")',
    rule: 'PERF001',
    severity: 'high',
    suggestion: "Use async fs.promises or fs/promises instead",
    title: 'Synchronous file read',
    ...overrides,
  }
}

function makePerfStats(overrides: Partial<PerfStats> = {}): PerfStats {
  return {
    byCategory: { io: 1 },
    byFile: { 'test.ts': 1 },
    high: 1,
    low: 0,
    medium: 0,
    total: 1,
    ...overrides,
  }
}

function makePerfResult(overrides: Partial<PerfResult> = {}): PerfResult {
  return {
    files: ['test.ts'],
    findings: [makePerfFinding()],
    stats: makePerfStats(),
    ...overrides,
  }
}

// ─── Command metadata ────────────────────────────────────

describe('Performance command - static metadata', () => {
  it('has a description', () => {
    expect(Performance.description).toBe('Scan code for performance anti-patterns')
  })

  it('has examples array', () => {
    expect(Array.isArray(Performance.examples)).toBe(true)
    expect(Performance.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Performance.args.path).toBeDefined()
    expect(Performance.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Performance.args.path.default).toBe('.')
  })
})

describe('Performance command - flags', () => {
  it('has format flag with options', () => {
    expect(Performance.flags.format.options).toContain('json')
    expect(Performance.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Performance.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Performance.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Performance.flags.ignore).toBeDefined()
    expect(Performance.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Performance.flags.ext).toBeDefined()
  })

  it('defaults ext to .ts,.tsx,.js,.jsx', () => {
    expect(Performance.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has severity flag with options', () => {
    expect(Performance.flags.severity.options).toContain('high')
    expect(Performance.flags.severity.options).toContain('medium')
    expect(Performance.flags.severity.options).toContain('low')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Performance.flags.verbose.default).toBe(false)
  })
})

describe('Performance command - class structure', () => {
  it('exports a default class', () => {
    expect(Performance).toBeDefined()
    expect(typeof Performance).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Performance.prototype.run).toBe('function')
  })
})

// ─── getPerfRules ────────────────────────────────────────

describe('getPerfRules', () => {
  it('returns an array of rules', () => {
    const rules = getPerfRules()
    expect(Array.isArray(rules)).toBe(true)
    expect(rules.length).toBeGreaterThan(0)
  })

  it('each rule has required fields', () => {
    const rules = getPerfRules()
    for (const rule of rules) {
      expect(rule.id).toBeTruthy()
      expect(rule.title).toBeTruthy()
      expect(rule.pattern).toBeInstanceOf(RegExp)
      expect(['high', 'medium', 'low']).toContain(rule.severity)
      expect(['io', 'memory', 'cpu', 'network', 'bundle', 'async']).toContain(rule.category)
      expect(rule.suggestion).toBeTruthy()
    }
  })

  it('includes PERF001', () => {
    const rules = getPerfRules()
    expect(rules.some((r) => r.id === 'PERF001')).toBe(true)
  })

  it('includes PERF014', () => {
    const rules = getPerfRules()
    expect(rules.some((r) => r.id === 'PERF014')).toBe(true)
  })
})

// ─── PERF001 - Synchronous file read ─────────────────────

describe('PERF001 - Synchronous file read', () => {
  const rules = getPerfRules()
  const rule = rules.find((r) => r.id === 'PERF001')!

  it('matches readFileSync', () => {
    expect(rule.pattern.test('const x = readFileSync("f")')).toBe(true)
  })

  it('matches writeFileSync', () => {
    expect(rule.pattern.test('writeFileSync("f", data)')).toBe(true)
  })

  it('matches existsSync', () => {
    expect(rule.pattern.test('if (existsSync(p)) {}')).toBe(true)
  })

  it('matches statSync', () => {
    expect(rule.pattern.test('const s = statSync(p)')).toBe(true)
  })

  it('does not match async readFile', () => {
    expect(rule.pattern.test('await readFile("f")')).toBe(false)
  })
})

// ─── PERF003 - Array.push with spread ────────────────────

describe('PERF003 - Array.push with spread', () => {
  const rules = getPerfRules()
  const rule = rules.find((r) => r.id === 'PERF003')!

  it('matches push with spread', () => {
    expect(rule.pattern.test('arr.push(...items)')).toBe(true)
  })

  it('does not match regular push', () => {
    expect(rule.pattern.test('arr.push(item)')).toBe(false)
  })
})

// ─── PERF004 - JSON.parse in loop ────────────────────────

describe('PERF004 - JSON.parse in loop', () => {
  const rules = getPerfRules()
  const rule = rules.find((r) => r.id === 'PERF004')!

  it('matches JSON.parse in for loop', () => {
    expect(rule.pattern.test('for (const item of items) { JSON.parse(item)')).toBe(true)
  })

  it('matches JSON.parse in forEach', () => {
    expect(rule.pattern.test('.forEach((x) => { JSON.parse(x)')).toBe(true)
  })

  it('does not match standalone JSON.parse', () => {
    expect(rule.pattern.test('const obj = JSON.parse(str)')).toBe(false)
  })
})

// ─── PERF005 - Large library import ──────────────────────

describe('PERF005 - Large library import', () => {
  const rules = getPerfRules()
  const rule = rules.find((r) => r.id === 'PERF005')!

  it('matches wildcard lodash import', () => {
    expect(rule.pattern.test("import * as _ from 'lodash'")).toBe(true)
  })

  it('matches wildcard moment import', () => {
    expect(rule.pattern.test("import * as moment from 'moment'")).toBe(true)
  })

  it('matches wildcard rxjs import', () => {
    expect(rule.pattern.test("import * as rx from 'rxjs'")).toBe(true)
  })

  it('does not match specific import', () => {
    expect(rule.pattern.test("import { debounce } from 'lodash'")).toBe(false)
  })
})

// ─── PERF006 - setInterval without clearInterval ─────────

describe('PERF006 - setInterval without clearInterval', () => {
  const rules = getPerfRules()
  const rule = rules.find((r) => r.id === 'PERF006')!

  it('matches setInterval call', () => {
    expect(rule.pattern.test('const id = setInterval(() => {}, 1000)')).toBe(true)
  })

  it('does not match clearInterval', () => {
    expect(rule.pattern.test('setInterval(() => {}, 1000); clearInterval(id)')).toBe(false)
  })
})

// ─── PERF007 - addEventListener without removeEventListener

describe('PERF007 - addEventListener without removeEventListener', () => {
  const rules = getPerfRules()
  const rule = rules.find((r) => r.id === 'PERF007')!

  it('matches addEventListener call', () => {
    expect(rule.pattern.test("el.addEventListener('click', handler)")).toBe(true)
  })

  it('does not match with removeEventListener', () => {
    expect(rule.pattern.test("el.addEventListener('click', handler); el.removeEventListener('click', handler)")).toBe(false)
  })
})

// ─── PERF014 - console.log in production ─────────────────

describe('PERF014 - console.log in production', () => {
  const rules = getPerfRules()
  const rule = rules.find((r) => r.id === 'PERF014')!

  it('matches console.log', () => {
    expect(rule.pattern.test('console.log("msg")')).toBe(true)
  })

  it('matches console.warn', () => {
    expect(rule.pattern.test('console.warn("msg")')).toBe(true)
  })

  it('matches console.error', () => {
    expect(rule.pattern.test('console.error("msg")')).toBe(true)
  })

  it('matches console.debug', () => {
    expect(rule.pattern.test('console.debug("msg")')).toBe(true)
  })

  it('matches console.info', () => {
    expect(rule.pattern.test('console.info("msg")')).toBe(true)
  })

  it('does not match console.table', () => {
    expect(rule.pattern.test('console.table(data)')).toBe(false)
  })
})

// ─── scanFile ────────────────────────────────────────────

describe('scanFile', () => {
  const rules = getPerfRules()

  it('detects sync file read', () => {
    const content = 'const x = readFileSync("f")'
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0]!.rule).toBe('PERF001')
  })

  it('detects console.log', () => {
    const content = 'console.log("hello")'
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings.length).toBeGreaterThan(0)
    expect(findings.some((f) => f.rule === 'PERF014')).toBe(true)
  })

  it('detects multiple issues in one file', () => {
    const content = 'const x = readFileSync("f")\nconsole.log(x)'
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty array for clean code', () => {
    const content = 'const x = await readFile("f")\nprocess.stdout.write(x)'
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings).toHaveLength(0)
  })

  it('sets correct file path', () => {
    const content = 'readFileSync("f")'
    const findings = scanFile(content, 'src/app.ts', rules)
    expect(findings[0]!.file).toBe('src/app.ts')
  })

  it('sets correct line number', () => {
    const content = 'const a = 1\nconst b = 2\nreadFileSync("f")'
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings[0]!.line).toBe(3)
  })

  it('includes context around match', () => {
    const content = 'line1\nreadFileSync("f")\nline3'
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings[0]!.context).toContain('line1')
    expect(findings[0]!.context).toContain('line3')
  })

  it('includes suggestion', () => {
    const content = 'readFileSync("f")'
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings[0]!.suggestion).toBeTruthy()
  })
})

// ─── computePerfStats ────────────────────────────────────

describe('computePerfStats', () => {
  it('computes totals from findings', () => {
    const findings: PerfFinding[] = [
      makePerfFinding({ severity: 'high', category: 'io', file: 'a.ts' }),
      makePerfFinding({ severity: 'medium', category: 'cpu', file: 'b.ts' }),
      makePerfFinding({ severity: 'low', category: 'io', file: 'a.ts' }),
    ]
    const stats = computePerfStats(findings)
    expect(stats.total).toBe(3)
    expect(stats.high).toBe(1)
    expect(stats.medium).toBe(1)
    expect(stats.low).toBe(1)
  })

  it('aggregates by category', () => {
    const findings: PerfFinding[] = [
      makePerfFinding({ category: 'io' }),
      makePerfFinding({ category: 'io' }),
      makePerfFinding({ category: 'cpu' }),
    ]
    const stats = computePerfStats(findings)
    expect(stats.byCategory['io']).toBe(2)
    expect(stats.byCategory['cpu']).toBe(1)
  })

  it('aggregates by file', () => {
    const findings: PerfFinding[] = [
      makePerfFinding({ file: 'a.ts' }),
      makePerfFinding({ file: 'a.ts' }),
      makePerfFinding({ file: 'b.ts' }),
    ]
    const stats = computePerfStats(findings)
    expect(stats.byFile['a.ts']).toBe(2)
    expect(stats.byFile['b.ts']).toBe(1)
  })

  it('handles empty findings', () => {
    const stats = computePerfStats([])
    expect(stats.total).toBe(0)
    expect(stats.high).toBe(0)
    expect(stats.medium).toBe(0)
    expect(stats.low).toBe(0)
    expect(Object.keys(stats.byCategory)).toHaveLength(0)
    expect(Object.keys(stats.byFile)).toHaveLength(0)
  })

  it('handles single finding', () => {
    const stats = computePerfStats([makePerfFinding()])
    expect(stats.total).toBe(1)
    expect(stats.high).toBe(1)
  })
})

// ─── buildPerfResult ─────────────────────────────────────

describe('buildPerfResult', () => {
  it('scans files and returns findings', async () => {
    const reader = async (f: string) => {
      if (f === 'a.ts') return 'readFileSync("f")'
      return ''
    }
    const result = await buildPerfResult(['a.ts', 'b.ts'], reader)
    expect(result.findings.length).toBeGreaterThan(0)
    expect(result.files).toEqual(['a.ts', 'b.ts'])
  })

  it('handles unreadable files gracefully', async () => {
    const reader = async () => {
      throw new Error('ENOENT')
    }
    const result = await buildPerfResult(['missing.ts'], reader)
    expect(result.findings).toHaveLength(0)
  })

  it('filters by severity', async () => {
    const reader = async () => 'readFileSync("f")\nconsole.log("x")'
    const result = await buildPerfResult(['a.ts'], reader, { severity: 'high' })
    for (const f of result.findings) {
      expect(f.severity).toBe('high')
    }
  })

  it('returns correct stats', async () => {
    const reader = async () => 'readFileSync("f")'
    const result = await buildPerfResult(['a.ts'], reader)
    expect(result.stats.total).toBeGreaterThan(0)
  })
})

// ─── formatPerfSeverity ──────────────────────────────────

describe('formatPerfSeverity', () => {
  it('returns colored HIGH for high', () => {
    const result = formatPerfSeverity('high')
    expect(result).toContain('HIGH')
  })

  it('returns colored MED for medium', () => {
    const result = formatPerfSeverity('medium')
    expect(result).toContain('MED')
  })

  it('returns colored LOW for low', () => {
    const result = formatPerfSeverity('low')
    expect(result).toContain('LOW')
  })
})

// ─── formatPerfCategory ──────────────────────────────────

describe('formatPerfCategory', () => {
  it('formats cpu category', () => {
    const result = formatPerfCategory('cpu')
    expect(result.trim()).toContain('cpu')
  })

  it('formats io category', () => {
    const result = formatPerfCategory('io')
    expect(result.trim()).toContain('io')
  })

  it('formats memory category', () => {
    const result = formatPerfCategory('memory')
    expect(result.trim()).toContain('memory')
  })

  it('formats unknown category', () => {
    const result = formatPerfCategory('unknown')
    expect(result.trim()).toContain('unknown')
  })

  it('pads category to consistent width', () => {
    const cpu = formatPerfCategory('cpu')
    const memory = formatPerfCategory('memory')
    // Strip ANSI codes for length comparison
    const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripAnsi(cpu).length).toBe(stripAnsi(memory).length)
  })
})

// ─── formatPerfTable ─────────────────────────────────────

describe('formatPerfTable', () => {
  it('contains report header', () => {
    const result = makePerfResult()
    const output = formatPerfTable(result, false)
    expect(output).toContain('Performance')
  })

  it('contains summary with totals', () => {
    const result = makePerfResult()
    const output = formatPerfTable(result, false)
    expect(output).toContain('Summary')
    expect(output).toContain('Total findings')
  })

  it('contains findings table headers', () => {
    const result = makePerfResult()
    const output = formatPerfTable(result, false)
    expect(output).toContain('Rule')
    expect(output).toContain('Category')
  })

  it('shows no-issues message when clean', () => {
    const result = makePerfResult({
      findings: [],
      stats: { byCategory: {}, byFile: {}, high: 0, low: 0, medium: 0, total: 0 },
    })
    const output = formatPerfTable(result, false)
    expect(output).toContain('No performance anti-patterns')
  })

  it('shows category breakdown', () => {
    const result = makePerfResult()
    const output = formatPerfTable(result, false)
    expect(output).toContain('By Category')
  })

  it('shows details in verbose mode', () => {
    const result = makePerfResult()
    const output = formatPerfTable(result, true)
    expect(output).toContain('Details')
    expect(output).toContain('Suggestion')
    expect(output).toContain('Context')
  })

  it('hides details in non-verbose mode', () => {
    const result = makePerfResult()
    const output = formatPerfTable(result, false)
    expect(output).not.toContain('Details')
  })

  it('handles multiple findings', () => {
    const result = makePerfResult({
      findings: [
        makePerfFinding({ rule: 'PERF001', title: 'Sync file read' }),
        makePerfFinding({ rule: 'PERF014', title: 'Console log', severity: 'low', category: 'io' }),
      ],
      stats: makePerfStats({ total: 2, high: 1, low: 1 }),
    })
    const output = formatPerfTable(result, false)
    expect(output).toContain('PERF001')
    expect(output).toContain('PERF014')
  })
})

// ─── formatPerfJson ──────────────────────────────────────

describe('formatPerfJson', () => {
  it('produces valid JSON', () => {
    const result = makePerfResult()
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains findings array', () => {
    const result = makePerfResult()
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.findings).toBeDefined()
    expect(Array.isArray(parsed.findings)).toBe(true)
  })

  it('contains stats object', () => {
    const result = makePerfResult()
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.total).toBe(1)
  })

  it('contains files array', () => {
    const result = makePerfResult()
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('handles empty findings', () => {
    const result = makePerfResult({
      findings: [],
      stats: { byCategory: {}, byFile: {}, high: 0, low: 0, medium: 0, total: 0 },
    })
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.findings).toHaveLength(0)
    expect(parsed.stats.total).toBe(0)
  })

  it('preserves finding data accurately', () => {
    const result = makePerfResult({
      findings: [makePerfFinding({ rule: 'PERF001', file: 'app.ts', line: 42 })],
    })
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.findings[0].rule).toBe('PERF001')
    expect(parsed.findings[0].file).toBe('app.ts')
    expect(parsed.findings[0].line).toBe(42)
  })

  it('includes byCategory in stats', () => {
    const result = makePerfResult()
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.byCategory).toBeDefined()
  })

  it('includes byFile in stats', () => {
    const result = makePerfResult()
    const output = formatPerfJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.byFile).toBeDefined()
  })
})
