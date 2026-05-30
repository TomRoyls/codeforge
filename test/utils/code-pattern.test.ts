import { describe, it, expect } from 'vitest'
import { findPatterns, getBuiltinRules, createCustomRule } from '../../src/utils/code-pattern.js'

describe('findPatterns', () => {
  it('should find TODO comments', () => {
    const content = '// TODO: implement this'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('todo-comment')
  })

  it('should find FIXME comments', () => {
    const content = '// FIXME: fix this bug'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('todo-comment')
  })

  it('should find HACK comments', () => {
    const content = '// HACK: quick workaround'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('todo-comment')
  })

  it('should find XXX comments', () => {
    const content = '// XXX: needs review'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('todo-comment')
  })

  it('should find console.log statements', () => {
    const content = 'console.log("debug")'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('console-log')
  })

  it('should find console.error statements', () => {
    const content = 'console.error("error")'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('console-log')
  })

  it('should find debugger statements', () => {
    const content = 'debugger'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('debugger-statement')
  })

  it('should find hardcoded ports', () => {
    const content = 'http://localhost:8080'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('hardcoded-port')
  })

  it('should find hardcoded secrets', () => {
    const content = 'password: "mySecretPassword123"'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.pattern).toBe('hardcoded-secret')
  })

  it('should return empty array for content with no patterns', () => {
    const content = 'const x = 1'
    const matches = findPatterns(content)
    expect(matches).toEqual([])
  })

  it('should track correct line numbers', () => {
    const content = 'console.log("line 1")\nconst x = 1\nconsole.log("line 3")'
    const matches = findPatterns(content)
    expect(matches.length).toBe(2)
    expect(matches[0]!.line).toBe(1)
    expect(matches[1]!.line).toBe(3)
  })

  it('should track correct column numbers', () => {
    const content = '  console.log("test")'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.column).toBe(3)
  })

  it('should return correct match string', () => {
    const content = 'console.log("test")'
    const matches = findPatterns(content)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]!.match).toBe('console.log(')
  })

  it('should handle custom rules', () => {
    const customRule = createCustomRule('custom-pattern', /custom/g, 'Custom pattern found')
    const content = 'This is a custom pattern test'
    const matches = findPatterns(content, [customRule])
    expect(matches.length).toBe(1)
    expect(matches[0]!.pattern).toBe('custom-pattern')
  })

  it('should find multiple matches on same line', () => {
    const content = 'console.log("a") console.log("b")'
    const matches = findPatterns(content)
    expect(matches.length).toBe(2)
  })

  it('should handle multi-line content', () => {
    const content = 'console.log("line 1")\nconsole.log("line 2")\nconsole.log("line 3")'
    const matches = findPatterns(content)
    expect(matches.length).toBe(3)
  })
})

describe('getBuiltinRules', () => {
  it('should return array of builtin rules', () => {
    const rules = getBuiltinRules()
    expect(Array.isArray(rules)).toBe(true)
  })

  it('should contain todo-comment rule', () => {
    const rules = getBuiltinRules()
    const todoRule = rules.find((r) => r.id === 'todo-comment')
    expect(todoRule).toBeDefined()
    expect(todoRule!.severity).toBe('info')
  })

  it('should contain console-log rule', () => {
    const rules = getBuiltinRules()
    const consoleRule = rules.find((r) => r.id === 'console-log')
    expect(consoleRule).toBeDefined()
    expect(consoleRule!.severity).toBe('warning')
  })

  it('should contain debugger-statement rule', () => {
    const rules = getBuiltinRules()
    const debuggerRule = rules.find((r) => r.id === 'debugger-statement')
    expect(debuggerRule).toBeDefined()
    expect(debuggerRule!.severity).toBe('error')
  })

  it('should contain hardcoded-port rule', () => {
    const rules = getBuiltinRules()
    const portRule = rules.find((r) => r.id === 'hardcoded-port')
    expect(portRule).toBeDefined()
    expect(portRule!.severity).toBe('warning')
  })

  it('should contain hardcoded-secret rule', () => {
    const rules = getBuiltinRules()
    const secretRule = rules.find((r) => r.id === 'hardcoded-secret')
    expect(secretRule).toBeDefined()
    expect(secretRule!.severity).toBe('error')
  })
})

describe('createCustomRule', () => {
  it('should create custom rule with all parameters', () => {
    const rule = createCustomRule('test-rule', /test/g, 'Test pattern', 'error')
    expect(rule.id).toBe('test-rule')
    expect(rule.message).toBe('Test pattern')
    expect(rule.severity).toBe('error')
    expect(rule.pattern).toBeInstanceOf(RegExp)
  })

  it('should create custom rule with default severity', () => {
    const rule = createCustomRule('test-rule', /test/g, 'Test pattern')
    expect(rule.severity).toBe('warning')
  })

  it('should create custom rule with info severity', () => {
    const rule = createCustomRule('test-rule', /test/g, 'Test pattern', 'info')
    expect(rule.severity).toBe('info')
  })

  it('should create custom rule with warning severity', () => {
    const rule = createCustomRule('test-rule', /test/g, 'Test pattern', 'warning')
    expect(rule.severity).toBe('warning')
  })

  it('should preserve regex pattern', () => {
    const pattern = /\d{3}-\d{3}-\d{4}/g
    const rule = createCustomRule('phone-rule', pattern, 'Phone number')
    expect(rule.pattern.source).toBe(pattern.source)
  })
})