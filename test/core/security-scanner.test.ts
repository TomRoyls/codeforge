import { describe, it, expect, beforeEach } from 'vitest'
import { PatternMatcher } from '../../src/core/security-scanner/pattern-matcher.js'
import { SecurityScanner } from '../../src/core/security-scanner/security-scanner.js'
import type { SecurityRule, ScanConfig } from '../../src/core/security-scanner/types.js'
import { DEFAULT_SCAN_CONFIG } from '../../src/core/security-scanner/types.js'

function makeRule(overrides: Partial<SecurityRule> = {}): SecurityRule {
  return {
    id: 'TEST-001',
    name: 'test-rule',
    description: 'A test security rule',
    severity: 'medium',
    patterns: [
      {
        regex: 'TODO_PATTERN',
        message: 'Test pattern matched',
      },
    ],
    ...overrides,
  }
}

describe('PatternMatcher', () => {
  let matcher: PatternMatcher

  beforeEach(() => {
    matcher = new PatternMatcher()
  })

  describe('addRule', () => {
    it('adds a rule to the matcher', () => {
      const rule = makeRule()
      matcher.addRule(rule)
      expect(matcher.getRule('TEST-001')).toBe(rule)
    })

    it('overwrites an existing rule with the same id', () => {
      const rule1 = makeRule({ name: 'first' })
      const rule2 = makeRule({ name: 'second' })
      matcher.addRule(rule1)
      matcher.addRule(rule2)
      expect(matcher.getRule('TEST-001')?.name).toBe('second')
    })
  })

  describe('removeRule', () => {
    it('removes an existing rule', () => {
      const rule = makeRule()
      matcher.addRule(rule)
      const result = matcher.removeRule('TEST-001')
      expect(result).toBe(true)
      expect(matcher.getRule('TEST-001')).toBeUndefined()
    })

    it('returns false for non-existent rule', () => {
      const result = matcher.removeRule('NON-EXISTENT')
      expect(result).toBe(false)
    })
  })

  describe('getRules', () => {
    it('returns empty array when no rules', () => {
      expect(matcher.getRules()).toEqual([])
    })

    it('returns all added rules', () => {
      const rule1 = makeRule({ id: 'R1' })
      const rule2 = makeRule({ id: 'R2' })
      matcher.addRule(rule1)
      matcher.addRule(rule2)
      expect(matcher.getRules()).toHaveLength(2)
    })
  })

  describe('getRule', () => {
    it('returns undefined for non-existent rule', () => {
      expect(matcher.getRule('NON-EXISTENT')).toBeUndefined()
    })

    it('returns the rule by id', () => {
      const rule = makeRule()
      matcher.addRule(rule)
      expect(matcher.getRule('TEST-001')).toBe(rule)
    })
  })

  describe('match', () => {
    it('returns empty array when no rules', () => {
      const findings = matcher.match('some content', 'test.ts')
      expect(findings).toEqual([])
    })

    it('returns findings for single rule match', () => {
      const rule = makeRule({
        patterns: [{ regex: 'eval\\s*\\(', message: 'eval found' }],
      })
      matcher.addRule(rule)
      const findings = matcher.match('eval("test")', 'test.js')
      expect(findings.length).toBeGreaterThan(0)
      expect(findings[0]!.ruleId).toBe('TEST-001')
    })

    it('returns findings from multiple rules', () => {
      const rule1 = makeRule({
        id: 'R1',
        patterns: [{ regex: 'eval\\s*\\(', message: 'eval found' }],
      })
      const rule2 = makeRule({
        id: 'R2',
        patterns: [{ regex: 'innerHTML\\s*=', message: 'innerHTML found' }],
      })
      matcher.addRule(rule1)
      matcher.addRule(rule2)
      const content = 'eval("test"); el.innerHTML = "<b>hi</b>"'
      const findings = matcher.match(content, 'test.js')
      expect(findings.length).toBeGreaterThanOrEqual(2)
    })

    it('finds multiple matches from same pattern', () => {
      const rule = makeRule({
        patterns: [{ regex: 'eval\\s*\\(', message: 'eval found' }],
      })
      matcher.addRule(rule)
      const content = 'eval("a"); eval("b");'
      const findings = matcher.match(content, 'test.js')
      expect(findings).toHaveLength(2)
    })

    it('returns empty for content with no matches', () => {
      const rule = makeRule({
        patterns: [{ regex: 'eval\\s*\\(', message: 'eval found' }],
      })
      matcher.addRule(rule)
      const findings = matcher.match('const x = 1', 'test.js')
      expect(findings).toEqual([])
    })
  })

  describe('matchWithRule', () => {
    it('runs a single rule against content', () => {
      const rule = makeRule({
        patterns: [{ regex: 'eval\\s*\\(', message: 'eval found' }],
      })
      const findings = matcher.matchWithRule(rule, 'eval("test")', 'test.js')
      expect(findings).toHaveLength(1)
      expect(findings[0]!.message).toBe('eval found')
    })

    it('includes fix when pattern has one', () => {
      const rule = makeRule({
        patterns: [{
          regex: 'eval\\s*\\(',
          message: 'eval found',
          fix: { description: 'Use JSON.parse', replacement: 'JSON.parse()' },
        }],
      })
      const findings = matcher.matchWithRule(rule, 'eval("test")', 'test.js')
      expect(findings[0]!.fix).toBeDefined()
      expect(findings[0]!.fix?.description).toBe('Use JSON.parse')
    })

    it('does not include fix when pattern has none', () => {
      const rule = makeRule({
        patterns: [{ regex: 'eval\\s*\\(', message: 'eval found' }],
      })
      const findings = matcher.matchWithRule(rule, 'eval("test")', 'test.js')
      expect(findings[0]!.fix).toBeUndefined()
    })

    it('generates correct line and column numbers', () => {
      const rule = makeRule({
        patterns: [{ regex: 'eval\\s*\\(', message: 'eval found' }],
      })
      const content = 'line1\neval("test")\nline3'
      const findings = matcher.matchWithRule(rule, content, 'test.js')
      expect(findings[0]!.line).toBe(2)
      expect(findings[0]!.column).toBe(1)
    })
  })

  describe('getDefaultRules', () => {
    it('returns 10 default rules', () => {
      const rules = PatternMatcher.getDefaultRules()
      expect(rules).toHaveLength(10)
    })

    it('includes eval-usage rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const evalRule = rules.find((r) => r.id === 'SEC001')
      expect(evalRule).toBeDefined()
      expect(evalRule!.name).toBe('eval-usage')
      expect(evalRule!.severity).toBe('critical')
    })

    it('includes inner-html rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC002')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('inner-html')
      expect(rule!.severity).toBe('high')
    })

    it('includes document-write rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC003')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('document-write')
      expect(rule!.severity).toBe('high')
    })

    it('includes sql-injection rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC004')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('sql-injection')
      expect(rule!.severity).toBe('critical')
    })

    it('includes hardcoded-secrets rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC005')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('hardcoded-secrets')
      expect(rule!.severity).toBe('high')
    })

    it('includes dangerous-react-html rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC006')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('dangerous-react-html')
      expect(rule!.severity).toBe('high')
    })

    it('includes url-redirect rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC007')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('url-redirect')
      expect(rule!.severity).toBe('medium')
    })

    it('includes prototype-pollution rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC008')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('prototype-pollution')
      expect(rule!.severity).toBe('high')
    })

    it('includes shell-injection rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC009')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('shell-injection')
      expect(rule!.severity).toBe('critical')
    })

    it('includes regex-dos rule', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC010')
      expect(rule).toBeDefined()
      expect(rule!.name).toBe('regex-dos')
      expect(rule!.severity).toBe('medium')
    })
  })
})

describe('SecurityScanner', () => {
  let scanner: SecurityScanner

  beforeEach(() => {
    scanner = new SecurityScanner()
  })

  describe('constructor', () => {
    it('uses default config when none provided', () => {
      const config = scanner.getConfig()
      expect(config.includePatterns).toEqual(['**/*.{ts,js,tsx,jsx}'])
      expect(config.excludePatterns).toEqual(['**/node_modules/**'])
      expect(config.maxFindings).toBe(500)
      expect(config.severityThreshold).toBe('low')
      expect(config.customRules).toEqual([])
    })

    it('merges custom config with defaults', () => {
      const customScanner = new SecurityScanner({ maxFindings: 100 })
      const config = customScanner.getConfig()
      expect(config.maxFindings).toBe(100)
      expect(config.severityThreshold).toBe('low')
    })

    it('loads default rules into matcher', () => {
      const rules = scanner.getDefaultRules()
      expect(rules).toHaveLength(10)
    })

    it('adds custom rules from config', () => {
      const customRule = makeRule({ id: 'CUSTOM-001' })
      const customScanner = new SecurityScanner({ customRules: [customRule] })
      const config = customScanner.getConfig()
      expect(config.customRules).toHaveLength(1)
    })
  })

  describe('scanFiles', () => {
    it('returns empty findings for empty file map', () => {
      const result = scanner.scanFiles(new Map())
      expect(result.findings).toEqual([])
      expect(result.fileCount).toBe(0)
    })

    it('scans files and returns findings', () => {
      const files = new Map<string, string>()
      files.set('test.js', 'eval("malicious code")')
      const result = scanner.scanFiles(files)
      expect(result.findings.length).toBeGreaterThan(0)
      expect(result.fileCount).toBe(1)
    })

    it('includes scan duration', () => {
      const files = new Map<string, string>()
      files.set('test.js', 'const x = 1')
      const result = scanner.scanFiles(files)
      expect(result.scanDuration).toBeGreaterThanOrEqual(0)
    })

    it('includes rule count', () => {
      const files = new Map<string, string>()
      files.set('test.js', 'const x = 1')
      const result = scanner.scanFiles(files)
      expect(result.ruleCount).toBe(10)
    })

    it('filters findings by severity threshold', () => {
      const highScanner = new SecurityScanner({ severityThreshold: 'high' })
      const files = new Map<string, string>()
      files.set('test.js', 'eval("test")')
      const result = highScanner.scanFiles(files)
      for (const finding of result.findings) {
        expect(['critical', 'high']).toContain(finding.severity)
      }
    })

    it('caps findings at maxFindings', () => {
      const capScanner = new SecurityScanner({ maxFindings: 2 })
      const files = new Map<string, string>()
      files.set('test.js', 'eval("a"); eval("b"); eval("c"); eval("d"); eval("e")')
      const result = capScanner.scanFiles(files)
      expect(result.findings.length).toBeLessThanOrEqual(2)
    })

    it('scans multiple files', () => {
      const files = new Map<string, string>()
      files.set('a.js', 'eval("test")')
      files.set('b.js', 'el.innerHTML = "<b>hi</b>"')
      const result = scanner.scanFiles(files)
      expect(result.fileCount).toBe(2)
      expect(result.findings.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('scanContent', () => {
    it('returns findings for a single file content', () => {
      const findings = scanner.scanContent('eval("test")', 'test.js')
      expect(findings.length).toBeGreaterThan(0)
    })

    it('returns empty for safe content', () => {
      const findings = scanner.scanContent('const x = 42', 'safe.ts')
      expect(findings).toEqual([])
    })

    it('filters by severity threshold', () => {
      const mediumScanner = new SecurityScanner({ severityThreshold: 'medium' })
      const files = new Map<string, string>()
      files.set('test.js', 'eval("test")')
      const result = mediumScanner.scanFiles(files)
      for (const finding of result.findings) {
        expect(['critical', 'high', 'medium']).toContain(finding.severity)
      }
    })
  })

  describe('addRule', () => {
    it('adds a custom rule to the scanner', () => {
      const rule = makeRule({
        id: 'CUSTOM-ADD',
        patterns: [{ regex: 'CUSTOM_PATTERN', message: 'custom found' }],
      })
      scanner.addRule(rule)
      const findings = scanner.scanContent('CUSTOM_PATTERN here', 'test.js')
      expect(findings.length).toBeGreaterThan(0)
      expect(findings[0]!.ruleId).toBe('CUSTOM-ADD')
    })
  })

  describe('getConfig', () => {
    it('returns the current configuration', () => {
      const config = scanner.getConfig()
      expect(config).toEqual(DEFAULT_SCAN_CONFIG)
    })
  })

  describe('getDefaultRules', () => {
    it('returns the default rules from PatternMatcher', () => {
      const rules = scanner.getDefaultRules()
      expect(rules).toHaveLength(10)
    })
  })
})

describe('Default rules detection', () => {
  let matcher: PatternMatcher

  beforeEach(() => {
    matcher = new PatternMatcher(PatternMatcher.getDefaultRules())
  })

  describe('eval usage detection', () => {
    it('detects eval() usage', () => {
      const findings = matcher.match('eval("userInput")', 'test.js')
      const evalFinding = findings.find((f) => f.ruleId === 'SEC001')
      expect(evalFinding).toBeDefined()
      expect(evalFinding!.severity).toBe('critical')
    })

    it('detects eval with spaces', () => {
      const findings = matcher.match('eval  ("code")', 'test.js')
      const evalFinding = findings.find((f) => f.ruleId === 'SEC001')
      expect(evalFinding).toBeDefined()
    })

    it('does not match eval in string', () => {
      const findings = matcher.match('const str = "eval something"', 'test.js')
      const evalFinding = findings.find((f) => f.ruleId === 'SEC001')
      expect(evalFinding).toBeUndefined()
    })
  })

  describe('innerHTML detection', () => {
    it('detects innerHTML assignment', () => {
      const findings = matcher.match('el.innerHTML = userInput', 'test.js')
      const htmlFinding = findings.find((f) => f.ruleId === 'SEC002')
      expect(htmlFinding).toBeDefined()
      expect(htmlFinding!.severity).toBe('high')
    })

    it('detects innerHTML with spaces', () => {
      const findings = matcher.match('element.innerHTML  =  value', 'test.js')
      const htmlFinding = findings.find((f) => f.ruleId === 'SEC002')
      expect(htmlFinding).toBeDefined()
    })
  })

  describe('document.write detection', () => {
    it('detects document.write() call', () => {
      const findings = matcher.match('document.write(userInput)', 'test.js')
      const docFinding = findings.find((f) => f.ruleId === 'SEC003')
      expect(docFinding).toBeDefined()
      expect(docFinding!.severity).toBe('high')
    })
  })

  describe('SQL injection detection', () => {
    it('detects SQL string concatenation', () => {
      const findings = matcher.match('const q = "SELECT * FROM users WHERE id = " + userId', 'test.js')
      const sqlFinding = findings.find((f) => f.ruleId === 'SEC004')
      expect(sqlFinding).toBeDefined()
      expect(sqlFinding!.severity).toBe('critical')
    })
  })

  describe('hardcoded secrets detection', () => {
    it('detects hardcoded password', () => {
      const findings = matcher.match('const password = "supersecret123"', 'test.js')
      const secretFinding = findings.find((f) => f.ruleId === 'SEC005')
      expect(secretFinding).toBeDefined()
      expect(secretFinding!.severity).toBe('high')
    })

    it('detects api_key assignment', () => {
      const findings = matcher.match('api_key = "sk-1234567890abcdef"', 'test.js')
      const secretFinding = findings.find((f) => f.ruleId === 'SEC005')
      expect(secretFinding).toBeDefined()
    })

    it('detects token assignment', () => {
      const findings = matcher.match('token: "bearer-abc123xyz"', 'test.js')
      const secretFinding = findings.find((f) => f.ruleId === 'SEC005')
      expect(secretFinding).toBeDefined()
    })
  })

  describe('dangerouslySetInnerHTML detection', () => {
    it('detects dangerouslySetInnerHTML usage', () => {
      const findings = matcher.match('<div dangerouslySetInnerHTML={{__html: content}} />', 'test.tsx')
      const reactFinding = findings.find((f) => f.ruleId === 'SEC006')
      expect(reactFinding).toBeDefined()
      expect(reactFinding!.severity).toBe('high')
    })
  })

  describe('prototype pollution detection', () => {
    it('detects __proto__ access', () => {
      const findings = matcher.match('obj.__proto__ = malicious', 'test.js')
      const protoFinding = findings.find((f) => f.ruleId === 'SEC008')
      expect(protoFinding).toBeDefined()
      expect(protoFinding!.severity).toBe('high')
    })

    it('detects constructor prototype access', () => {
      const findings = matcher.match('obj.constructor["prototype"] = {}', 'test.js')
      const protoFinding = findings.find((f) => f.ruleId === 'SEC008')
      expect(protoFinding).toBeDefined()
    })
  })

  describe('shell injection detection', () => {
    it('detects exec with shell:true', () => {
      const findings = matcher.match('exec(cmd, {shell: true})', 'test.js')
      const shellFinding = findings.find((f) => f.ruleId === 'SEC009')
      expect(shellFinding).toBeDefined()
      expect(shellFinding!.severity).toBe('critical')
    })

    it('detects spawn with shell:true', () => {
      const findings = matcher.match('spawn("ls", args, {shell: true})', 'test.js')
      const shellFinding = findings.find((f) => f.ruleId === 'SEC009')
      expect(shellFinding).toBeDefined()
    })

    it('detects execSync with shell:true', () => {
      const findings = matcher.match('execSync(cmd, {shell: true})', 'test.js')
      const shellFinding = findings.find((f) => f.ruleId === 'SEC009')
      expect(shellFinding).toBeDefined()
    })
  })

  describe('severity levels', () => {
    it('eval rule is critical severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const evalRule = rules.find((r) => r.id === 'SEC001')
      expect(evalRule!.severity).toBe('critical')
    })

    it('inner-html rule is high severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC002')
      expect(rule!.severity).toBe('high')
    })

    it('document-write rule is high severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC003')
      expect(rule!.severity).toBe('high')
    })

    it('sql-injection rule is critical severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC004')
      expect(rule!.severity).toBe('critical')
    })

    it('hardcoded-secrets rule is high severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC005')
      expect(rule!.severity).toBe('high')
    })

    it('shell-injection rule is critical severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC009')
      expect(rule!.severity).toBe('critical')
    })

    it('url-redirect rule is medium severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC007')
      expect(rule!.severity).toBe('medium')
    })

    it('regex-dos rule is medium severity', () => {
      const rules = PatternMatcher.getDefaultRules()
      const rule = rules.find((r) => r.id === 'SEC010')
      expect(rule!.severity).toBe('medium')
    })
  })
})

describe('Edge cases', () => {
  let matcher: PatternMatcher

  beforeEach(() => {
    matcher = new PatternMatcher(PatternMatcher.getDefaultRules())
  })

  it('handles empty content', () => {
    const findings = matcher.match('', 'test.js')
    expect(findings).toEqual([])
  })

  it('handles multiline patterns', () => {
    const content = 'const a = 1;\neval("code");\nconst b = 2;'
    const findings = matcher.match(content, 'test.js')
    const evalFinding = findings.find((f) => f.ruleId === 'SEC001')
    expect(evalFinding).toBeDefined()
    expect(evalFinding!.line).toBe(2)
  })

  it('handles overlapping patterns', () => {
    const content = 'document.write(x); el.innerHTML = y;'
    const findings = matcher.match(content, 'test.js')
    expect(findings.length).toBeGreaterThanOrEqual(2)
  })

  it('finds patterns with correct line numbers across multi-line content', () => {
    const content = 'line1\nline2\nline3\neval("x")\nline5'
    const findings = matcher.match(content, 'test.js')
    const evalFinding = findings.find((f) => f.ruleId === 'SEC001')
    expect(evalFinding).toBeDefined()
    expect(evalFinding!.line).toBe(4)
  })

  it('handles files with no findings', () => {
    const content = 'const x = 1;\nconst y = 2;\nconsole.log(x + y);'
    const findings = matcher.match(content, 'safe.ts')
    expect(findings).toEqual([])
  })

  it('generates unique finding IDs', () => {
    const content = 'eval("a"); eval("b");'
    const findings = matcher.match(content, 'test.js')
    const evalFindings = findings.filter((f) => f.ruleId === 'SEC001')
    const ids = evalFindings.map((f) => f.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('produces codeSnippet from the matched line', () => {
    const content = '  eval("test")  '
    const findings = matcher.match(content, 'test.js')
    const evalFinding = findings.find((f) => f.ruleId === 'SEC001')
    expect(evalFinding).toBeDefined()
    expect(evalFinding!.codeSnippet).toBe('eval("test")')
  })
})

describe('PatternMatcher constructor', () => {
  it('accepts initial rules', () => {
    const rule = makeRule()
    const m = new PatternMatcher([rule])
    expect(m.getRules()).toHaveLength(1)
  })

  it('accepts empty array', () => {
    const m = new PatternMatcher([])
    expect(m.getRules()).toEqual([])
  })
})

describe('DEFAULT_SCAN_CONFIG', () => {
  it('has correct default includePatterns', () => {
    expect(DEFAULT_SCAN_CONFIG.includePatterns).toEqual(['**/*.{ts,js,tsx,jsx}'])
  })

  it('has correct default excludePatterns', () => {
    expect(DEFAULT_SCAN_CONFIG.excludePatterns).toEqual(['**/node_modules/**'])
  })

  it('has correct default maxFindings', () => {
    expect(DEFAULT_SCAN_CONFIG.maxFindings).toBe(500)
  })

  it('has correct default severityThreshold', () => {
    expect(DEFAULT_SCAN_CONFIG.severityThreshold).toBe('low')
  })

  it('has correct default customRules', () => {
    expect(DEFAULT_SCAN_CONFIG.customRules).toEqual([])
  })
})
