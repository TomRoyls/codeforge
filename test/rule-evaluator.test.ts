import { describe, it, expect } from 'vitest'
import { RuleEvaluator } from '../src/core/rule-dsl/rule-evaluator.js'
import type { DSLRuleConfig, DSLEvaluationContext, DSLFix } from '../src/core/rule-dsl/types.js'

function makeContext(overrides: Partial<DSLEvaluationContext> = {}): DSLEvaluationContext {
  const content = overrides.content ?? 'const x = 1\nconst y = 2'
  return {
    filePath: 'test.ts',
    content,
    lines: content.split('\n'),
    lineNumber: overrides.lineNumber ?? 0,
    ...overrides,
  }
}

function makeRule(condition: DSLRuleConfig['condition'], overrides: Partial<DSLRuleConfig> = {}): DSLRuleConfig {
  return {
    id: 'test-rule',
    name: 'Test Rule',
    description: '',
    severity: 'error',
    category: 'patterns',
    enabled: true,
    condition,
    message: 'Test violation',
    ...overrides,
  }
}

describe('RuleEvaluator', () => {
  const evaluator = new RuleEvaluator()

  describe('evaluateCondition', () => {
    describe('pattern condition', () => {
      it('matches when pattern is found', () => {
        expect(evaluator.evaluateCondition(
          { type: 'pattern', value: 'const' },
          makeContext(),
        )).toBe(true)
      })

      it('does not match when pattern is absent', () => {
        expect(evaluator.evaluateCondition(
          { type: 'pattern', value: 'let' },
          makeContext({ content: 'const x = 1' }),
        )).toBe(false)
      })
    })

    describe('regex condition', () => {
      it('matches with regex pattern', () => {
        expect(evaluator.evaluateCondition(
          { type: 'regex', pattern: 'const\\s+\\w+' },
          makeContext(),
        )).toBe(true)
      })

      it('respects flags', () => {
        expect(evaluator.evaluateCondition(
          { type: 'regex', pattern: 'CONST', flags: 'i' },
          makeContext(),
        )).toBe(true)
      })

      it('does not match without case-insensitive flag', () => {
        expect(evaluator.evaluateCondition(
          { type: 'regex', pattern: 'CONST' },
          makeContext(),
        )).toBe(false)
      })
    })

    describe('and condition', () => {
      it('matches when all sub-conditions match', () => {
        expect(evaluator.evaluateCondition(
          { type: 'and', conditions: [
            { type: 'pattern', value: 'const' },
            { type: 'pattern', value: 'x' },
          ] },
          makeContext({ content: 'const x = 1' }),
        )).toBe(true)
      })

      it('does not match when any sub-condition fails', () => {
        expect(evaluator.evaluateCondition(
          { type: 'and', conditions: [
            { type: 'pattern', value: 'const' },
            { type: 'pattern', value: 'let' },
          ] },
          makeContext({ content: 'const x = 1' }),
        )).toBe(false)
      })
    })

    describe('or condition', () => {
      it('matches when any sub-condition matches', () => {
        expect(evaluator.evaluateCondition(
          { type: 'or', conditions: [
            { type: 'pattern', value: 'let' },
            { type: 'pattern', value: 'const' },
          ] },
          makeContext({ content: 'const x = 1' }),
        )).toBe(true)
      })

      it('does not match when all sub-conditions fail', () => {
        expect(evaluator.evaluateCondition(
          { type: 'or', conditions: [
            { type: 'pattern', value: 'var' },
            { type: 'pattern', value: 'let' },
          ] },
          makeContext({ content: 'const x = 1' }),
        )).toBe(false)
      })
    })

    describe('not condition', () => {
      it('inverts a matching condition', () => {
        expect(evaluator.evaluateCondition(
          { type: 'not', condition: { type: 'pattern', value: 'use strict' } },
          makeContext({ content: 'const x = 1' }),
        )).toBe(true)
      })

      it('inverts a non-matching condition', () => {
        expect(evaluator.evaluateCondition(
          { type: 'not', condition: { type: 'pattern', value: 'const' } },
          makeContext({ content: 'const x = 1' }),
        )).toBe(false)
      })
    })

    describe('exists condition', () => {
      it('matches when pattern exists', () => {
        expect(evaluator.evaluateCondition(
          { type: 'exists', pattern: 'eval' },
          makeContext({ content: 'eval("code")' }),
        )).toBe(true)
      })

      it('does not match when pattern is absent', () => {
        expect(evaluator.evaluateCondition(
          { type: 'exists', pattern: 'eval' },
          makeContext({ content: 'const x = 1' }),
        )).toBe(false)
      })
    })

    describe('count condition', () => {
      it('matches when count exceeds threshold', () => {
        expect(evaluator.evaluateCondition(
          { type: 'count', pattern: 'const', operator: 'gte', value: 2 },
          makeContext({ content: 'const x = 1\nconst y = 2\nconst z = 3' }),
        )).toBe(true)
      })

      it('does not match when count is below threshold', () => {
        expect(evaluator.evaluateCondition(
          { type: 'count', pattern: 'const', operator: 'gt', value: 5 },
          makeContext({ content: 'const x = 1\nconst y = 2' }),
        )).toBe(false)
      })
    })

    describe('line-length condition', () => {
      it('matches when line exceeds max length', () => {
        const longLine = 'a'.repeat(200)
        expect(evaluator.evaluateCondition(
          { type: 'line-length', operator: 'gt', value: 120 },
          makeContext({ content: longLine, lineNumber: 0 }),
        )).toBe(true)
      })

      it('does not match when line is within limit', () => {
        expect(evaluator.evaluateCondition(
          { type: 'line-length', operator: 'gt', value: 120 },
          makeContext({ content: 'short line', lineNumber: 0 }),
        )).toBe(false)
      })

      it('returns false for out-of-range line number', () => {
        expect(evaluator.evaluateCondition(
          { type: 'line-length', operator: 'gt', value: 0 },
          makeContext({ content: 'short', lineNumber: 100 }),
        )).toBe(false)
      })
    })

    describe('file-size condition', () => {
      it('matches when file exceeds size', () => {
        expect(evaluator.evaluateCondition(
          { type: 'file-size', operator: 'gt', value: 5 },
          makeContext({ content: 'a'.repeat(100) }),
        )).toBe(true)
      })

      it('does not match when file is within size', () => {
        expect(evaluator.evaluateCondition(
          { type: 'file-size', operator: 'gt', value: 10000 },
          makeContext({ content: 'small' }),
        )).toBe(false)
      })
    })

    describe('ast condition', () => {
      it('matches when selector is found', () => {
        expect(evaluator.evaluateCondition(
          { type: 'ast', selector: 'function' },
          makeContext({ content: 'function hello() {}' }),
        )).toBe(true)
      })

      it('respects filter', () => {
        expect(evaluator.evaluateCondition(
          { type: 'ast', selector: 'function', filter: 'async' },
          makeContext({ content: 'async function hello() {}' }),
        )).toBe(true)
      })

      it('fails when filter does not match', () => {
        expect(evaluator.evaluateCondition(
          { type: 'ast', selector: 'function', filter: 'async' },
          makeContext({ content: 'function hello() {}' }),
        )).toBe(false)
      })
    })
  })

  describe('evaluateRule', () => {
    it('finds violations matching a pattern', () => {
      const rule = makeRule({ type: 'pattern', value: 'eval' })
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'const x = eval("1")')
      expect(violations).toHaveLength(1)
      expect(violations[0]!.ruleId).toBe('test-rule')
      expect(violations[0]!.severity).toBe('error')
    })

    it('returns empty for no violations', () => {
      const rule = makeRule({ type: 'pattern', value: 'eval' })
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'const x = 1')
      expect(violations).toHaveLength(0)
    })

    it('finds multiple matches', () => {
      const rule = makeRule({ type: 'regex', pattern: 'console\\.log' })
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'console.log("a")\nconsole.log("b")')
      expect(violations).toHaveLength(2)
    })
  })

  describe('applyFix', () => {
    const match = Object.assign(['eval("code")'] as unknown as RegExpMatchArray, {
      index: 9,
      input: 'const x = eval("code")',
      groups: undefined,
    })

    it('applies replace fix', () => {
      const fix: DSLFix = { type: 'replace', pattern: 'eval', replacement: 'safeEval' }
      const result = evaluator.applyFix(fix, 'const x = eval("code")', match)
      expect(result).toBe('const x = safeEval("code")')
    })

    it('applies prepend fix', () => {
      const fix: DSLFix = { type: 'prepend', pattern: '', replacement: '// @ts-nocheck\n' }
      const result = evaluator.applyFix(fix, 'const x = 1', match)
      expect(result).toBe('// @ts-nocheck\nconst x = 1')
    })

    it('applies append fix', () => {
      const fix: DSLFix = { type: 'append', pattern: '', replacement: '\n// EOF' }
      const result = evaluator.applyFix(fix, 'const x = 1', match)
      expect(result).toBe('const x = 1\n// EOF')
    })

    it('applies delete fix', () => {
      const fix: DSLFix = { type: 'delete', pattern: 'TODO' }
      const result = evaluator.applyFix(fix, 'const x = TODO + 1', match)
      expect(result).toBe('const x =  + 1')
    })
  })

  describe('compareValues', () => {
    it('compares gt', () => {
      expect(evaluator.compareValues(5, 'gt', 3)).toBe(true)
      expect(evaluator.compareValues(3, 'gt', 5)).toBe(false)
    })

    it('compares lt', () => {
      expect(evaluator.compareValues(3, 'lt', 5)).toBe(true)
      expect(evaluator.compareValues(5, 'lt', 3)).toBe(false)
    })

    it('compares eq', () => {
      expect(evaluator.compareValues(5, 'eq', 5)).toBe(true)
      expect(evaluator.compareValues(5, 'eq', 3)).toBe(false)
    })

    it('compares gte', () => {
      expect(evaluator.compareValues(5, 'gte', 5)).toBe(true)
      expect(evaluator.compareValues(3, 'gte', 5)).toBe(false)
    })

    it('compares lte', () => {
      expect(evaluator.compareValues(5, 'lte', 5)).toBe(true)
      expect(evaluator.compareValues(5, 'lte', 3)).toBe(false)
    })
  })
})
