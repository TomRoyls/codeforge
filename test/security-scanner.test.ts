import { describe, it, expect } from 'vitest'
import { SecurityScanner, PatternMatcher, DEFAULT_SCAN_CONFIG } from '../src/core/security-scanner/index.js'
import type { SecurityRule } from '../src/core/security-scanner/index.js'

// ─── PatternMatcher ───
describe('PatternMatcher', () => {
  it('detects eval usage', () => {
    const pm = new PatternMatcher(PatternMatcher.getDefaultRules())
    const findings = pm.match('const x = eval("1+1")', 'test.js')
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0]!.ruleId).toBe('SEC001')
  })

  it('detects innerHTML assignment', () => {
    const pm = new PatternMatcher(PatternMatcher.getDefaultRules())
    const findings = pm.match('el.innerHTML = userinput', 'test.js')
    expect(findings.some((f) => f.ruleId === 'SEC002')).toBe(true)
  })

  it('detects hardcoded secrets', () => {
    const pm = new PatternMatcher(PatternMatcher.getDefaultRules())
    const findings = pm.match('const password = "supersecret123"', 'test.js')
    expect(findings.some((f) => f.ruleId === 'SEC005')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const pm = new PatternMatcher(PatternMatcher.getDefaultRules())
    const findings = pm.match('const x = 1 + 2', 'test.js')
    expect(findings.length).toBe(0)
  })

  it('getDefaultRules returns 10 rules', () => {
    const rules = PatternMatcher.getDefaultRules()
    expect(rules.length).toBe(10)
  })

  it('addRule and removeRule work', () => {
    const pm = new PatternMatcher([])
    const rule: SecurityRule = {
      id: 'TEST001',
      name: 'test',
      description: 'test rule',
      severity: 'low',
      patterns: [{ regex: 'TODO', message: 'todo found' }],
    }
    pm.addRule(rule)
    expect(pm.getRules().length).toBe(1)
    expect(pm.getRule('TEST001')).toBeDefined()
    pm.removeRule('TEST001')
    expect(pm.getRules().length).toBe(0)
  })

  it('getRule returns undefined for unknown', () => {
    const pm = new PatternMatcher([])
    expect(pm.getRule('NOPE')).toBeUndefined()
  })
})

// ─── SecurityScanner ───
describe('SecurityScanner', () => {
  it('scans files', () => {
    const scanner = new SecurityScanner()
    const files = new Map<string, string>()
    files.set('a.js', 'eval("test")')
    files.set('b.js', 'const x = 1')
    const result = scanner.scanFiles(files)
    expect(result.fileCount).toBe(2)
    expect(result.findings.length).toBeGreaterThan(0)
  })

  it('scanContent scans single file', () => {
    const scanner = new SecurityScanner()
    const findings = scanner.scanContent('eval("test")', 'test.js')
    expect(findings.length).toBeGreaterThan(0)
  })

  it('respects severity threshold', () => {
    const scanner = new SecurityScanner({ severityThreshold: 'critical' })
    const findings = scanner.scanContent('el.innerHTML = x', 'test.js')
    expect(findings.every((f) => f.severity === 'critical')).toBe(true)
  })

  it('addRule adds custom rule', () => {
    const scanner = new SecurityScanner()
    scanner.addRule({
      id: 'CUSTOM',
      name: 'custom',
      description: 'custom rule',
      severity: 'low',
      patterns: [{ regex: 'CUSTOM_PATTERN', message: 'found' }],
    })
    const result = scanner.scanContent('CUSTOM_PATTERN', 'test.js')
    expect(result.some((f) => f.ruleId === 'CUSTOM')).toBe(true)
  })

  it('getConfig returns config', () => {
    const scanner = new SecurityScanner()
    const config = scanner.getConfig()
    expect(config.maxFindings).toBe(DEFAULT_SCAN_CONFIG.maxFindings)
  })

  it('getDefaultRules returns rules', () => {
    const scanner = new SecurityScanner()
    expect(scanner.getDefaultRules().length).toBe(10)
  })

  it('respects maxFindings', () => {
    const scanner = new SecurityScanner({ maxFindings: 1 })
    const files = new Map<string, string>()
    files.set('a.js', 'eval("a")')
    files.set('b.js', 'eval("b")')
    const result = scanner.scanFiles(files)
    expect(result.findings.length).toBeLessThanOrEqual(1)
  })
})

// ─── DEFAULT_SCAN_CONFIG ───
describe('DEFAULT_SCAN_CONFIG', () => {
  it('has expected defaults', () => {
    expect(DEFAULT_SCAN_CONFIG.maxFindings).toBe(500)
    expect(DEFAULT_SCAN_CONFIG.severityThreshold).toBe('low')
    expect(DEFAULT_SCAN_CONFIG.customRules).toEqual([])
  })
})
