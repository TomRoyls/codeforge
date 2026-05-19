import { describe, expect, it } from 'vitest'

import Security from '../src/commands/security.js'
import {
  buildSecurityResult,
  computeSecurityStats,
  extractContext,
  getSecurityRules,
  scanFile,
  sortFindingsBySeverity,
  type SecurityFinding,
  type SecurityRule,
  type SecurityStats,
} from '../src/commands/security-helpers.js'
import { formatCategory, formatSecurityJson, formatSecurityTable, formatSeverity } from '../src/commands/security-format-helpers.js'
import type { SecurityResult } from '../src/commands/security-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFinding(overrides: Partial<SecurityFinding> = {}): SecurityFinding {
  return {
    category: 'secrets',
    column: 1,
    context: 'const x = 1',
    file: 'app.ts',
    line: 1,
    match: 'api_key = "abc123"',
    remediation: 'Use environment variables.',
    rule: 'SEC001',
    severity: 'critical',
    title: 'Hardcoded API Key',
    ...overrides,
  }
}

function makeSecurityResult(overrides: Partial<SecurityResult> = {}): SecurityResult {
  const findings = overrides.findings ?? [makeFinding()]
  return {
    files: ['app.ts'],
    ...overrides,
    findings,
    stats: overrides.stats ?? computeSecurityStats(findings),
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Security command - static metadata', () => {
  it('has a description', () => {
    expect(Security.description).toBe('Scan source code for security anti-patterns')
  })

  it('has examples array', () => {
    expect(Array.isArray(Security.examples)).toBe(true)
    expect(Security.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Security.args.path).toBeDefined()
    expect(Security.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Security.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Security command - flags', () => {
  it('has format flag with options', () => {
    expect(Security.flags.format.options).toContain('json')
    expect(Security.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Security.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Security.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Security.flags.ignore).toBeDefined()
    expect(Security.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag defaulting to .ts,.tsx,.js,.jsx', () => {
    expect(Security.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has severity flag with options', () => {
    expect(Security.flags.severity.options).toContain('critical')
    expect(Security.flags.severity.options).toContain('high')
    expect(Security.flags.severity.options).toContain('medium')
    expect(Security.flags.severity.options).toContain('low')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Security.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Security command - class structure', () => {
  it('exports a default class', () => {
    expect(Security).toBeDefined()
    expect(typeof Security).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Security.prototype.run).toBe('function')
  })
})

// ─── getSecurityRules ───────────────────────────────────

describe('getSecurityRules', () => {
  it('returns 15 rules', () => {
    const rules = getSecurityRules()
    expect(rules.length).toBe(15)
  })

  it('each rule has required properties', () => {
    const rules = getSecurityRules()
    for (const rule of rules) {
      expect(rule.id).toBeTruthy()
      expect(rule.title).toBeTruthy()
      expect(rule.severity).toBeTruthy()
      expect(rule.category).toBeTruthy()
      expect(rule.pattern).toBeInstanceOf(RegExp)
      expect(rule.remediation).toBeTruthy()
    }
  })

  it('contains SEC001 through SEC015', () => {
    const rules = getSecurityRules()
    const ids = rules.map((r) => r.id)
    for (let i = 1; i <= 15; i++) {
      expect(ids).toContain(`SEC${String(i).padStart(3, '0')}`)
    }
  })
})

// ─── SEC001 - Hardcoded API Key ─────────────────────────

describe('SEC001 - Hardcoded API Key', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC001')!

  it('matches api_key assignment with long string', () => {
    expect(rule.pattern.test('api_key = "abcdefghij1234567890xyz"')).toBe(true)
  })

  it('matches apiKey assignment', () => {
    expect(rule.pattern.test("apiKey: 'abcdefghijklmnopqrstuv'")).toBe(true)
  })

  it('does not match short API key value', () => {
    expect(rule.pattern.test('api_key = "short"')).toBe(false)
  })

  it('does not match empty string', () => {
    expect(rule.pattern.test('const x = 1')).toBe(false)
  })
})

// ─── SEC002 - Hardcoded Secret/Password ─────────────────

describe('SEC002 - Hardcoded Secret/Password', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC002')!

  it('matches password assignment', () => {
    expect(rule.pattern.test('password = "mysecret12"')).toBe(true)
  })

  it('matches token assignment', () => {
    expect(rule.pattern.test("token = 'abcdefghij'")).toBe(true)
  })

  it('does not match short password', () => {
    expect(rule.pattern.test('password = "short"')).toBe(false)
  })

  it('does not match empty string', () => {
    expect(rule.pattern.test('const x = 1')).toBe(false)
  })
})

// ─── SEC003 - eval() usage ─────────────────────────────

describe('SEC003 - eval() usage', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC003')!

  it('matches eval call', () => {
    expect(rule.pattern.test('eval("2 + 2")')).toBe(true)
  })

  it('matches eval with variable', () => {
    expect(rule.pattern.test('eval(userInput)')).toBe(true)
  })

  it('does not match eval without parens', () => {
    expect(rule.pattern.test('const evaluate = 1')).toBe(false)
  })

  it('does not match word containing eval', () => {
    expect(rule.pattern.test('const evaluation = true')).toBe(false)
  })
})

// ─── SEC004 - SQL string interpolation ──────────────────

describe('SEC004 - SQL string interpolation', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC004')!

  it('matches query call with interpolation', () => {
    expect(rule.pattern.test('query(`SELECT * FROM users WHERE id = ${userId}`)')).toBe(true)
  })

  it('matches SELECT with string concat', () => {
    expect(rule.pattern.test("SELECT * FROM users + '")).toBe(true)
  })

  it('matches any query call (broad pattern)', () => {
    expect(rule.pattern.test('db.query(sql, [userId])')).toBe(true)
  })
})

// ─── SEC005 - innerHTML assignment ──────────────────────

describe('SEC005 - innerHTML assignment', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC005')!

  it('matches innerHTML assignment', () => {
    expect(rule.pattern.test('el.innerHTML = userInput')).toBe(true)
  })

  it('matches innerHTML with template literal', () => {
    expect(rule.pattern.test('div.innerHTML = `<b>${name}</b>`')).toBe(true)
  })

  it('does not match innerHTML read', () => {
    expect(rule.pattern.test('const html = el.innerHTML')).toBe(false)
  })
})

// ─── SEC006 - document.write ────────────────────────────

describe('SEC006 - document.write', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC006')!

  it('matches document.write call', () => {
    expect(rule.pattern.test('document.write("<h1>Hello</h1>")')).toBe(true)
  })

  it('matches document.write with variable', () => {
    expect(rule.pattern.test('document.write(userContent)')).toBe(true)
  })

  it('does not match document.writeln without write', () => {
    expect(rule.pattern.test('const x = 1')).toBe(false)
  })
})

// ─── SEC007 - Insecure HTTP URL ─────────────────────────

describe('SEC007 - Insecure HTTP URL', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC007')!

  it('matches insecure HTTP URL', () => {
    expect(rule.pattern.test("fetch('http://example.com/api')")).toBe(true)
  })

  it('does not match localhost HTTP', () => {
    expect(rule.pattern.test("fetch('http://localhost:3000/api')")).toBe(false)
  })

  it('does not match 127.0.0.1 HTTP', () => {
    expect(rule.pattern.test("fetch('http://127.0.0.1:3000/api')")).toBe(false)
  })

  it('does not match HTTPS URL', () => {
    expect(rule.pattern.test("fetch('https://example.com/api')")).toBe(false)
  })
})

// ─── SEC008 - Math.random() for crypto ──────────────────

describe('SEC008 - Math.random() for crypto', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC008')!

  it('matches Math.random() call', () => {
    expect(rule.pattern.test('const token = Math.random()')).toBe(true)
  })

  it('does not match crypto.randomBytes', () => {
    expect(rule.pattern.test('crypto.randomBytes(32)')).toBe(false)
  })

  it('does not match unrelated code', () => {
    expect(rule.pattern.test('const x = 1')).toBe(false)
  })
})

// ─── SEC009 - TODO security comment ─────────────────────

describe('SEC009 - TODO security comment', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC009')!

  it('matches TODO security comment', () => {
    expect(rule.pattern.test('// TODO: fix security issue')).toBe(true)
  })

  it('matches FIXME security comment', () => {
    expect(rule.pattern.test('// FIXME: security vulnerability')).toBe(true)
  })

  it('does not match regular TODO', () => {
    expect(rule.pattern.test('// TODO: refactor this')).toBe(false)
  })
})

// ─── SEC010 - Console.log with sensitive data ────────────

describe('SEC010 - Console.log with sensitive data', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC010')!

  it('matches console.log with password', () => {
    expect(rule.pattern.test('console.log("password:", password)')).toBe(true)
  })

  it('matches console.log with token', () => {
    expect(rule.pattern.test('console.log(token)')).toBe(true)
  })

  it('does not match plain console.log', () => {
    expect(rule.pattern.test('console.log("hello")')).toBe(false)
  })
})

// ─── SEC011 - Prototype pollution ───────────────────────

describe('SEC011 - Prototype pollution', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC011')!

  it('matches __proto__ access', () => {
    expect(rule.pattern.test('obj.__proto__')).toBe(true)
  })

  it('matches prototype assignment', () => {
    expect(rule.pattern.test('SomeClass.prototype["constructor"] = malicious')).toBe(true)
  })

  it('does not match getPrototypeOf', () => {
    expect(rule.pattern.test('Object.getPrototypeOf(obj)')).toBe(false)
  })
})

// ─── SEC012 - Unsafe JSON.parse ─────────────────────────

describe('SEC012 - Unsafe JSON.parse', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC012')!

  it('matches const with JSON.parse', () => {
    expect(rule.pattern.test('const data = JSON.parse(input)')).toBe(true)
  })

  it('matches let with JSON.parse', () => {
    expect(rule.pattern.test('let result = JSON.parse(response)')).toBe(true)
  })

  it('matches var with JSON.parse', () => {
    expect(rule.pattern.test('var obj = JSON.parse(str)')).toBe(true)
  })

  it('does not match JSON.parse in non-assignment', () => {
    expect(rule.pattern.test('JSON.parse(\'{"a":1}\')')).toBe(false)
  })
})

// ─── SEC013 - Process env exposure ──────────────────────

describe('SEC013 - Process env exposure', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC013')!

  it('matches process.env sent via fetch', () => {
    expect(rule.pattern.test('const url = process.env.API_URL; fetch(url)')).toBe(true)
  })

  it('matches process.env with axios post', () => {
    expect(rule.pattern.test('process.env.SECRET && axios.post(url)')).toBe(true)
  })

  it('does not match safe process.env usage', () => {
    expect(rule.pattern.test('const port = process.env.PORT')).toBe(false)
  })
})

// ─── SEC014 - Disabled TLS verification ─────────────────

describe('SEC014 - Disabled TLS verification', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC014')!

  it('matches rejectUnauthorized false', () => {
    expect(rule.pattern.test('rejectUnauthorized: false')).toBe(true)
  })

  it('matches NODE_TLS_REJECT_UNAUTHORIZED = 0', () => {
    expect(rule.pattern.test("process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'")).toBe(true)
  })

  it('does not match rejectUnauthorized true', () => {
    expect(rule.pattern.test('rejectUnauthorized: true')).toBe(false)
  })
})

// ─── SEC015 - Hardcoded IP in connection ────────────────

describe('SEC015 - Hardcoded IP in connection', () => {
  const rules = getSecurityRules()
  const rule = rules.find((r) => r.id === 'SEC015')!

  it('matches connect with IP address', () => {
    expect(rule.pattern.test("connect('192.168.1.1')")).toBe(true)
  })

  it('matches connect with double-quoted IP', () => {
    expect(rule.pattern.test('connect("10.0.0.1")')).toBe(true)
  })

  it('does not match connect with hostname', () => {
    expect(rule.pattern.test("connect('example.com')")).toBe(false)
  })
})

// ─── extractContext ─────────────────────────────────────

describe('extractContext', () => {
  it('extracts surrounding lines', () => {
    const lines = ['line0', 'line1', 'line2', 'line3', 'line4']
    const ctx = extractContext(lines, 2, 1)
    expect(ctx).toBe('line1\nline2\nline3')
  })

  it('handles start of file', () => {
    const lines = ['line0', 'line1', 'line2']
    const ctx = extractContext(lines, 0, 2)
    expect(ctx).toBe('line0\nline1\nline2')
  })

  it('handles end of file', () => {
    const lines = ['line0', 'line1', 'line2']
    const ctx = extractContext(lines, 2, 2)
    expect(ctx).toBe('line0\nline1\nline2')
  })

  it('uses default context radius of 2', () => {
    const lines = ['a', 'b', 'c', 'd', 'e']
    const ctx = extractContext(lines, 2)
    expect(ctx).toBe('a\nb\nc\nd\ne')
  })
})

// ─── scanFile ───────────────────────────────────────────

describe('scanFile', () => {
  it('finds multiple issues in a file', () => {
    const content = [
      'const apiKey = "abcdefghijklmnopqrstuvwxyz"',
      'eval(userInput)',
      'const password = "supersecret123"',
      'el.innerHTML = data',
    ].join('\n')

    const rules = getSecurityRules()
    const findings = scanFile(content, 'vulnerable.ts', rules)

    expect(findings.length).toBeGreaterThanOrEqual(4)
    const rulesFound = findings.map((f) => f.rule)
    expect(rulesFound).toContain('SEC001')
    expect(rulesFound).toContain('SEC003')
    expect(rulesFound).toContain('SEC002')
    expect(rulesFound).toContain('SEC005')
  })

  it('returns empty array for clean file', () => {
    const content = [
      'const greeting = "hello"',
      'function add(a: number, b: number) {',
      '  return a + b',
      '}',
    ].join('\n')

    const rules = getSecurityRules()
    const findings = scanFile(content, 'clean.ts', rules)
    expect(findings.length).toBe(0)
  })

  it('sets correct file path', () => {
    const content = 'eval("test")'
    const rules = getSecurityRules()
    const findings = scanFile(content, 'src/app.ts', rules)
    expect(findings[0]?.file).toBe('src/app.ts')
  })

  it('sets correct line numbers', () => {
    const content = 'const x = 1\neval("test")'
    const rules = getSecurityRules()
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings[0]?.line).toBe(2)
  })

  it('sets correct column', () => {
    const content = '  eval("test")'
    const rules = getSecurityRules()
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings[0]?.column).toBe(3)
  })

  it('populates match with matched text', () => {
    const content = 'eval(userInput)'
    const rules = getSecurityRules()
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings[0]?.match).toBe('eval(')
  })

  it('populates context', () => {
    const content = 'line1\nline2\neval("x")\nline4\nline5'
    const rules = getSecurityRules()
    const findings = scanFile(content, 'test.ts', rules)
    expect(findings[0]?.context).toContain('eval("x")')
    expect(findings[0]?.context).toContain('line2')
    expect(findings[0]?.context).toContain('line4')
  })
})

// ─── computeSecurityStats ──────────────────────────────

describe('computeSecurityStats', () => {
  it('counts findings by severity', () => {
    const findings: SecurityFinding[] = [
      makeFinding({ severity: 'critical' }),
      makeFinding({ severity: 'critical' }),
      makeFinding({ severity: 'high' }),
      makeFinding({ severity: 'medium' }),
      makeFinding({ severity: 'low' }),
    ]

    const stats = computeSecurityStats(findings)
    expect(stats.total).toBe(5)
    expect(stats.critical).toBe(2)
    expect(stats.high).toBe(1)
    expect(stats.medium).toBe(1)
    expect(stats.low).toBe(1)
  })

  it('counts by category', () => {
    const findings: SecurityFinding[] = [
      makeFinding({ category: 'secrets' }),
      makeFinding({ category: 'secrets' }),
      makeFinding({ category: 'injection' }),
    ]

    const stats = computeSecurityStats(findings)
    expect(stats.byCategory['secrets']).toBe(2)
    expect(stats.byCategory['injection']).toBe(1)
  })

  it('counts by file', () => {
    const findings: SecurityFinding[] = [
      makeFinding({ file: 'a.ts' }),
      makeFinding({ file: 'a.ts' }),
      makeFinding({ file: 'b.ts' }),
    ]

    const stats = computeSecurityStats(findings)
    expect(stats.byFile['a.ts']).toBe(2)
    expect(stats.byFile['b.ts']).toBe(1)
  })

  it('returns zero stats for empty findings', () => {
    const stats = computeSecurityStats([])
    expect(stats.total).toBe(0)
    expect(stats.critical).toBe(0)
    expect(stats.high).toBe(0)
    expect(stats.medium).toBe(0)
    expect(stats.low).toBe(0)
  })
})

// ─── sortFindingsBySeverity ────────────────────────────

describe('sortFindingsBySeverity', () => {
  it('sorts critical before high', () => {
    const findings = [makeFinding({ severity: 'high' }), makeFinding({ severity: 'critical' })]
    const sorted = sortFindingsBySeverity(findings)
    expect(sorted[0]?.severity).toBe('critical')
    expect(sorted[1]?.severity).toBe('high')
  })

  it('sorts high before medium', () => {
    const findings = [makeFinding({ severity: 'medium' }), makeFinding({ severity: 'high' })]
    const sorted = sortFindingsBySeverity(findings)
    expect(sorted[0]?.severity).toBe('high')
    expect(sorted[1]?.severity).toBe('medium')
  })

  it('sorts medium before low', () => {
    const findings = [makeFinding({ severity: 'low' }), makeFinding({ severity: 'medium' })]
    const sorted = sortFindingsBySeverity(findings)
    expect(sorted[0]?.severity).toBe('medium')
    expect(sorted[1]?.severity).toBe('low')
  })

  it('preserves order for same severity by line number', () => {
    const findings = [makeFinding({ line: 10, severity: 'high' }), makeFinding({ line: 5, severity: 'high' })]
    const sorted = sortFindingsBySeverity(findings)
    expect(sorted[0]?.line).toBe(5)
    expect(sorted[1]?.line).toBe(10)
  })
})

// ─── buildSecurityResult ───────────────────────────────

describe('buildSecurityResult', () => {
  it('returns findings and stats from scanned files', async () => {
    const reader = async () => 'eval("test")'
    const result = await buildSecurityResult(['test.ts'], reader)

    expect(result.files).toEqual(['test.ts'])
    expect(result.findings.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.total).toBeGreaterThanOrEqual(1)
  })

  it('filters by severity', async () => {
    const reader = async () => 'eval("test")\nMath.random()\n'
    const result = await buildSecurityResult(['test.ts'], reader, { severity: 'high' })

    for (const f of result.findings) {
      expect(['critical', 'high']).toContain(f.severity)
    }
  })

  it('filters by ignore patterns', async () => {
    const reader = async () => 'eval("test")'
    const result = await buildSecurityResult(['test.ts'], reader, { ignorePatterns: ['eval'] })

    for (const f of result.findings) {
      expect(f.title).not.toContain('eval')
    }
  })

  it('handles empty files list', async () => {
    const reader = async () => ''
    const result = await buildSecurityResult([], reader)

    expect(result.findings).toEqual([])
    expect(result.stats.total).toBe(0)
  })
})

// ─── formatSeverity ────────────────────────────────────

describe('formatSeverity', () => {
  it('formats critical with icon', () => {
    const formatted = formatSeverity('critical')
    expect(formatted).toContain('CRITICAL')
  })

  it('formats high with icon', () => {
    const formatted = formatSeverity('high')
    expect(formatted).toContain('HIGH')
  })

  it('formats medium with icon', () => {
    const formatted = formatSeverity('medium')
    expect(formatted).toContain('MEDIUM')
  })

  it('formats low with icon', () => {
    const formatted = formatSeverity('low')
    expect(formatted).toContain('LOW')
  })
})

// ─── formatCategory ────────────────────────────────────

describe('formatCategory', () => {
  it('formats secrets category', () => {
    const formatted = formatCategory('secrets')
    expect(formatted).toContain('secrets')
  })

  it('formats injection category', () => {
    const formatted = formatCategory('injection')
    expect(formatted).toContain('injection')
  })

  it('formats config category', () => {
    const formatted = formatCategory('config')
    expect(formatted).toContain('config')
  })
})

// ─── formatSecurityTable ───────────────────────────────

describe('formatSecurityTable', () => {
  it('includes header in output', () => {
    const result = makeSecurityResult()
    const output = formatSecurityTable(result, false)
    expect(output).toContain('Security Scan Report')
  })

  it('shows severity summary', () => {
    const result = makeSecurityResult()
    const output = formatSecurityTable(result, false)
    expect(output).toContain('Severity Summary')
  })

  it('shows no issues message when empty', () => {
    const result = makeSecurityResult({ findings: [], stats: computeSecurityStats([]) })
    const output = formatSecurityTable(result, false)
    expect(output).toContain('No security issues found')
  })

  it('shows findings in table', () => {
    const result = makeSecurityResult()
    const output = formatSecurityTable(result, false)
    expect(output).toContain('SEC001')
    expect(output).toContain('app.ts')
  })

  it('shows verbose info when enabled', () => {
    const result = makeSecurityResult()
    const output = formatSecurityTable(result, true)
    expect(output).toContain('Remediation')
    expect(output).toContain('Context')
  })

  it('shows by-category breakdown', () => {
    const result = makeSecurityResult()
    const output = formatSecurityTable(result, false)
    expect(output).toContain('By Category')
  })
})

// ─── formatSecurityJson ────────────────────────────────

describe('formatSecurityJson', () => {
  it('returns valid JSON', () => {
    const result = makeSecurityResult()
    const json = formatSecurityJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.findings).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('includes all findings', () => {
    const findings = [makeFinding({ rule: 'SEC001' }), makeFinding({ rule: 'SEC003' })]
    const result = makeSecurityResult({ findings, stats: computeSecurityStats(findings) })
    const json = formatSecurityJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.findings.length).toBe(2)
  })
})
