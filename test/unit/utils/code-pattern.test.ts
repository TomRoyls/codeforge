import { describe, expect, it } from 'vitest'

import {
  createCustomRule,
  findPatterns,
  getBuiltinRules,
} from '../../../src/utils/code-pattern.js'

describe('code-pattern', () => {
  describe('findPatterns', () => {
    it('finds TODO comments', () => {
      const code = '// TODO: fix this\nconst x = 1\n// FIXME: broken'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'todo-comment')!,
      ])
      expect(matches).toHaveLength(2)
      expect(matches[0]!.pattern).toBe('todo-comment')
      expect(matches[0]!.line).toBe(1)
      expect(matches[1]!.line).toBe(3)
    })

    it('finds HACK comments', () => {
      const code = '// HACK: temporary workaround'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'todo-comment')!,
      ])
      expect(matches).toHaveLength(1)
      expect(matches[0]!.match).toBe('HACK')
    })

    it('finds XXX comments', () => {
      const code = '// XXX: danger zone'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'todo-comment')!,
      ])
      expect(matches).toHaveLength(1)
      expect(matches[0]!.match).toBe('XXX')
    })

    it('finds console.log statements', () => {
      const code = 'console.log("hello")\nconsole.error("bad")\nconsole.debug("trace")'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'console-log')!,
      ])
      expect(matches).toHaveLength(3)
    })

    it('finds console.warn and console.info', () => {
      const code = 'console.warn("warning!")\nconsole.info("info")'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'console-log')!,
      ])
      expect(matches).toHaveLength(2)
    })

    it('finds debugger statements', () => {
      const code = 'function foo() {\n  debugger\n}'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'debugger-statement')!,
      ])
      expect(matches).toHaveLength(1)
      expect(matches[0]!.line).toBe(2)
    })

    it('finds hardcoded ports', () => {
      const code = 'fetch("http://localhost:3000/api")\nconst url = "http://127.0.0.1:8080/health"'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'hardcoded-port')!,
      ])
      expect(matches).toHaveLength(2)
    })

    it('finds hardcoded secrets', () => {
      const code = 'const password = "supersecret123"\nconst token = "abc123token456"'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'hardcoded-secret')!,
      ])
      expect(matches).toHaveLength(2)
    })

    it('does not match short secrets', () => {
      const code = 'const password = "short"'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'hardcoded-secret')!,
      ])
      expect(matches).toHaveLength(0)
    })

    it('reports correct column positions', () => {
      const code = '  console.log("hi")'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'console-log')!,
      ])
      expect(matches).toHaveLength(1)
      expect(matches[0]!.column).toBe(3)
    })

    it('finds multiple patterns on same line', () => {
      const code = 'console.log(TODO)'
      const matches = findPatterns(code, [
        getBuiltinRules().find((r) => r.id === 'console-log')!,
        getBuiltinRules().find((r) => r.id === 'todo-comment')!,
      ])
      expect(matches).toHaveLength(2)
    })

    it('returns empty for clean code', () => {
      const code = 'const x = 1\nconst y = 2\nreturn x + y'
      const matches = findPatterns(code)
      expect(matches).toHaveLength(0)
    })

    it('handles empty content', () => {
      const matches = findPatterns('')
      expect(matches).toHaveLength(0)
    })

    it('handles multiline content with mixed patterns', () => {
      const code = [
        '// TODO: refactor this',
        'const x = 1',
        'console.log(x)',
        'debugger',
        '// normal comment',
        'fetch("http://localhost:5432")',
      ].join('\n')
      const matches = findPatterns(code)
      expect(matches.length).toBeGreaterThanOrEqual(4)
    })

    it('works with custom rules', () => {
      const rule = createCustomRule(
        'no-eval',
        /\beval\s*\(/g,
        'eval is dangerous',
        'error',
      )
      const code = 'eval("1+1")\nconst x = eval(input)'
      const matches = findPatterns(code, [rule])
      expect(matches).toHaveLength(2)
      expect(matches[0]!.pattern).toBe('no-eval')
    })

    it('works with custom regex patterns', () => {
      const rule = createCustomRule(
        'no-var',
        /\bvar\s+/g,
        'Use let or const instead of var',
        'warning',
      )
      const code = 'var x = 1\nconst y = 2\nvar z = 3'
      const matches = findPatterns(code, [rule])
      expect(matches).toHaveLength(2)
    })
  })

  describe('getBuiltinRules', () => {
    it('returns all builtin rules', () => {
      const rules = getBuiltinRules()
      expect(rules.length).toBeGreaterThanOrEqual(5)
      const ids = rules.map((r) => r.id)
      expect(ids).toContain('todo-comment')
      expect(ids).toContain('console-log')
      expect(ids).toContain('debugger-statement')
      expect(ids).toContain('hardcoded-port')
      expect(ids).toContain('hardcoded-secret')
    })

    it('returns a copy (not mutable)', () => {
      const rules1 = getBuiltinRules()
      const rules2 = getBuiltinRules()
      expect(rules1).not.toBe(rules2)
    })

    it('each rule has required fields', () => {
      const rules = getBuiltinRules()
      for (const rule of rules) {
        expect(rule.id).toBeTruthy()
        expect(rule.pattern).toBeInstanceOf(RegExp)
        expect(rule.message).toBeTruthy()
        expect(['error', 'warning', 'info']).toContain(rule.severity)
      }
    })
  })

  describe('createCustomRule', () => {
    it('creates a rule with default severity', () => {
      const rule = createCustomRule('test', /test/g, 'test message')
      expect(rule.id).toBe('test')
      expect(rule.severity).toBe('warning')
    })

    it('creates a rule with specified severity', () => {
      const rule = createCustomRule('test', /test/g, 'test message', 'error')
      expect(rule.severity).toBe('error')
    })

    it('preserves the regex pattern', () => {
      const rule = createCustomRule('test', /abc/gi, 'test')
      expect(rule.pattern.source).toBe('abc')
      expect(rule.pattern.flags).toBe('gi')
    })
  })
})
