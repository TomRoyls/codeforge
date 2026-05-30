import { describe, it, expect } from 'vitest'
import { DSLParser } from '../src/core/rule-dsl/dsl-parser.js'

describe('DSLParser', () => {
  const parser = new DSLParser()

  describe('parseJSON', () => {
    it('parses a valid rule with pattern condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'no-eval',
          name: 'No eval',
          description: 'Disallows eval',
          severity: 'error',
          category: 'security',
          enabled: true,
          condition: { type: 'pattern', value: 'eval(' },
          message: 'Do not use eval',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
      expect(result.rules).toHaveLength(1)
      expect(result.rules[0]!.id).toBe('no-eval')
      expect(result.rules[0]!.condition.type).toBe('pattern')
    })

    it('parses a rule with regex condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'no-console',
          name: 'No console',
          description: 'No console calls',
          severity: 'warning',
          category: 'style',
          enabled: true,
          condition: { type: 'regex', pattern: 'console\\.log', flags: 'g' },
          message: 'No console.log',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
      expect(result.rules[0]!.condition.type).toBe('regex')
    })

    it('parses a rule with and condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'complex-and',
          name: 'Complex And',
          description: '',
          severity: 'error',
          category: 'patterns',
          enabled: true,
          condition: {
            type: 'and',
            conditions: [
              { type: 'pattern', value: 'function' },
              { type: 'pattern', value: 'return' },
            ],
          },
          message: 'Match',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
      expect(result.rules[0]!.condition.type).toBe('and')
    })

    it('parses a rule with or condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'or-rule',
          name: 'Or Rule',
          description: '',
          severity: 'info',
          category: 'patterns',
          enabled: true,
          condition: {
            type: 'or',
            conditions: [
              { type: 'pattern', value: 'a' },
              { type: 'pattern', value: 'b' },
            ],
          },
          message: 'Match',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
    })

    it('parses a rule with not condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'not-rule',
          name: 'Not Rule',
          description: '',
          severity: 'info',
          category: 'patterns',
          enabled: true,
          condition: { type: 'not', condition: { type: 'pattern', value: 'use strict' } },
          message: 'Match',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
    })

    it('parses a rule with count condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'max-params',
          name: 'Max Params',
          description: '',
          severity: 'warning',
          category: 'complexity',
          enabled: true,
          condition: { type: 'count', pattern: 'param', operator: 'gt', value: 5 },
          message: 'Too many params',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
    })

    it('parses a rule with line-length condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'max-len',
          name: 'Max Line Length',
          description: '',
          severity: 'warning',
          category: 'style',
          enabled: true,
          condition: { type: 'line-length', operator: 'gt', value: 120 },
          message: 'Line too long',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
    })

    it('parses a rule with file-size condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'max-file',
          name: 'Max File Size',
          description: '',
          severity: 'warning',
          category: 'complexity',
          enabled: true,
          condition: { type: 'file-size', operator: 'gt', value: 50000 },
          message: 'File too large',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
    })

    it('parses a rule with exists condition', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'has-license',
          name: 'Has License',
          description: '',
          severity: 'info',
          category: 'patterns',
          enabled: true,
          condition: { type: 'exists', pattern: 'MIT License' },
          message: 'Check license',
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
    })

    it('parses a rule with fix', () => {
      const input = JSON.stringify({
        rules: [{
          id: 'fixable',
          name: 'Fixable Rule',
          description: '',
          severity: 'warning',
          category: 'style',
          enabled: true,
          condition: { type: 'pattern', value: 'var ' },
          message: 'Use let/const',
          fix: { type: 'replace', pattern: 'var ', replacement: 'const ' },
        }],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
      expect(result.rules[0]!.fix?.type).toBe('replace')
    })

    it('parses multiple rules', () => {
      const input = JSON.stringify({
        rules: [
          { id: 'r1', name: 'R1', description: '', severity: 'error', category: 'security', enabled: true, condition: { type: 'pattern', value: 'x' }, message: 'M1' },
          { id: 'r2', name: 'R2', description: '', severity: 'warning', category: 'style', enabled: true, condition: { type: 'pattern', value: 'y' }, message: 'M2' },
        ],
      })
      const result = parser.parseJSON(input)
      expect(result.success).toBe(true)
      expect(result.rules).toHaveLength(2)
    })

    it('fails on invalid JSON', () => {
      const result = parser.parseJSON('{ invalid json }')
      expect(result.success).toBe(false)
      expect(result.errors[0]!.message).toContain('JSON parse error')
    })

    it('fails when root is not an object', () => {
      const result = parser.parseJSON('null')
      expect(result.success).toBe(false)
    })

    it('fails when rules is not an array', () => {
      const result = parser.parseJSON(JSON.stringify({ rules: 'not-array' }))
      expect(result.success).toBe(false)
      expect(result.errors[0]!.message).toContain('rules')
    })

    it('fails on rule without id', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ name: 'X', description: '', condition: { type: 'pattern', value: 'x' }, message: 'M' }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on rule without name', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', description: '', condition: { type: 'pattern', value: 'x' }, message: 'M' }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on rule without condition', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', name: 'X', description: '', message: 'M' }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on rule without message', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', name: 'X', description: '', condition: { type: 'pattern', value: 'x' } }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on invalid severity', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', name: 'X', description: '', severity: 'invalid', category: 'patterns', enabled: true, condition: { type: 'pattern', value: 'x' }, message: 'M' }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on invalid category', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', name: 'X', description: '', severity: 'error', category: 'invalid', enabled: true, condition: { type: 'pattern', value: 'x' }, message: 'M' }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on invalid condition type', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', name: 'X', description: '', condition: { type: 'unknown' }, message: 'M' }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on pattern condition without value', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', name: 'X', description: '', condition: { type: 'pattern' }, message: 'M' }],
      }))
      expect(result.success).toBe(false)
    })

    it('fails on invalid fix type', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [{ id: 'x', name: 'X', description: '', condition: { type: 'pattern', value: 'x' }, message: 'M', fix: { type: 'invalid', pattern: 'x' } }],
      }))
      expect(result.success).toBe(false)
    })

    it('collects errors from multiple invalid rules', () => {
      const result = parser.parseJSON(JSON.stringify({
        rules: [
          { description: 'no id or name' },
          { description: 'also invalid' },
        ],
      }))
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('parseYAML', () => {
    it('fails on empty input', () => {
      const result = parser.parseYAML('')
      expect(result.success).toBe(false)
      expect(result.errors[0]!.message).toContain('Empty')
    })

    it('fails on whitespace-only input', () => {
      const result = parser.parseYAML('   ')
      expect(result.success).toBe(false)
    })
  })

  describe('validateRule', () => {
    it('validates a correct rule', () => {
      const errors = parser.validateRule({
        id: 'test',
        name: 'Test Rule',
        description: '',
        severity: 'error',
        category: 'security',
        enabled: true,
        condition: { type: 'pattern', value: 'eval(' },
        message: 'No eval',
      })
      expect(errors).toHaveLength(0)
    })

    it('rejects empty id', () => {
      const errors = parser.validateRule({ id: '', name: 'X', condition: { type: 'pattern', value: 'x' }, message: 'M' })
      expect(errors.some(e => e.message.includes('id'))).toBe(true)
    })

    it('rejects empty name', () => {
      const errors = parser.validateRule({ id: 'x', name: '', condition: { type: 'pattern', value: 'x' }, message: 'M' })
      expect(errors.some(e => e.message.includes('name'))).toBe(true)
    })

    it('accepts valid fix types', () => {
      for (const fixType of ['replace', 'prepend', 'append', 'delete']) {
        const errors = parser.validateRule({
          id: 'x', name: 'X', condition: { type: 'pattern', value: 'x' }, message: 'M',
          fix: { type: fixType, pattern: 'x' },
        })
        expect(errors.some(e => e.message.includes('fix type'))).toBe(false)
      }
    })
  })

  describe('validateCondition', () => {
    it('rejects missing condition type', () => {
      const errors = parser.validateCondition({} as never)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('validates ast condition requires selector', () => {
      const errors = parser.validateCondition({ type: 'ast' } as never)
      expect(errors.some(e => e.message.includes('selector'))).toBe(true)
    })

    it('validates count condition requires operator and value', () => {
      const errors = parser.validateCondition({ type: 'count', pattern: 'x' } as never)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('validates line-length condition requires operator and value', () => {
      const errors = parser.validateCondition({ type: 'line-length' } as never)
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
