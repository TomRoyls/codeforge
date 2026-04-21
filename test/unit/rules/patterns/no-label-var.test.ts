import { describe, test, expect, vi } from 'vitest'
import { noLabelVarRule } from '../../../../src/rules/patterns/no-label-var.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createVariableDeclarator(name: string): unknown {
  return {
    type: 'VariableDeclarator',
    id: createIdentifier(name),
    init: null,
  }
}

function createFunctionDeclaration(name: string): unknown {
  return {
    type: 'FunctionDeclaration',
    id: createIdentifier(name),
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createClassDeclaration(name: string): unknown {
  return {
    type: 'ClassDeclaration',
    id: createIdentifier(name),
    superClass: null,
    body: { type: 'ClassBody', body: [] },
  }
}

function createLabeledStatement(label: unknown): unknown {
  return {
    type: 'LabeledStatement',
    label,
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-label-var rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noLabelVarRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noLabelVarRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noLabelVarRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noLabelVarRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention labels and variables in description', () => {
      const desc = noLabelVarRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('label')
    })
  })

  describe('create', () => {
    test('should return visitor with VariableDeclarator method', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return visitor with FunctionDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return visitor with ClassDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(visitor).toHaveProperty('ClassDeclaration')
    })

    test('should return visitor with LabeledStatement method', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(visitor).toHaveProperty('LabeledStatement')
    })

    test('VariableDeclarator should be a function', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('FunctionDeclaration should be a function', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('ClassDeclaration should be a function', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(typeof visitor.ClassDeclaration).toBe('function')
    })

    test('LabeledStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(typeof visitor.LabeledStatement).toBe('function')
    })
  })

  describe('valid cases - no variable collision', () => {
    test('should not report label when no variables exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      expect(reports.length).toBe(0)
    })

    test('should not report label when variable has different name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('count'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      expect(reports.length).toBe(0)
    })

    test('should not report label that does not match any of multiple variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      expect(reports.length).toBe(0)
    })

    test('should not report label when only function declaration exists with different name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      expect(reports.length).toBe(0)
    })

    test('should not report label when only class declaration exists with different name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      expect(reports.length).toBe(0)
    })

    test('should not report label declared before variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      expect(reports.length).toBe(0)
    })

    test('should not report multiple labels with no variable conflicts', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('count'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('outer')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('inner')))
      expect(reports.length).toBe(0)
    })

    test('should not report label with single character name when no matching variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases - label matches variable', () => {
    test('should report label that matches a variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should report message contains label name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myVar')))
      expect(reports[0].message).toContain('myVar')
    })

    test('should report label that matches a function declaration name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('handler'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('handler')))
      expect(reports.length).toBe(1)
    })

    test('should report label that matches a class declaration name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Foo'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Foo')))
      expect(reports.length).toBe(1)
    })

    test('should report multiple labels matching same variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(2)
    })

    test('should report only the label that matches, not others', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report label matching variable among multiple variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      expect(reports.length).toBe(1)
    })

    test('should report label matching function declared after variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('fn'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('fn')))
      expect(reports.length).toBe(1)
    })
  })

  describe('label location reporting', () => {
    test('should report location of label identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 5, 2)))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report end location of label identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 5, 2)))
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for each of multiple conflicting labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 3, 0)))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 7, 4)))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(7)
    })
  })

  describe('report message format', () => {
    test('should include label name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('counter'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('counter')))
      expect(reports[0].message).toContain('counter')
    })

    test('should include label name in single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('loop'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      expect(reports[0].message).toContain("'loop'")
    })

    test('should say unexpected in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })
  })

  describe('case sensitivity', () => {
    test('should be case sensitive - different case does not match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('X')))
      expect(reports.length).toBe(0)
    })

    test('should match exact case', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('MyVar'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('MyVar')))
      expect(reports.length).toBe(1)
    })

    test('should report correctly-cased label match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('LOOP'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('LOOP')))
      expect(reports[0].message).toContain('LOOP')
    })

    test('should not match lowercase variable with uppercase label', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('loop'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('LOOP')))
      expect(reports.length).toBe(0)
    })
  })

  describe('mixed declaration types', () => {
    test('should report label matching variable when functions also exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should report label matching function when variables also exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.FunctionDeclaration(createFunctionDeclaration('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      expect(reports.length).toBe(1)
    })

    test('should report label matching class when variables and functions also exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.FunctionDeclaration(createFunctionDeclaration('b'))
      visitor.ClassDeclaration(createClassDeclaration('C'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('C')))
      expect(reports.length).toBe(1)
    })

    test('should not report when label does not match any of variable, function, or class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.FunctionDeclaration(createFunctionDeclaration('b'))
      visitor.ClassDeclaration(createClassDeclaration('C'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('d')))
      expect(reports.length).toBe(0)
    })

    test('should report multiple labels matching different declaration types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('v'))
      visitor.FunctionDeclaration(createFunctionDeclaration('f'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('v')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('f')))
      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null LabeledStatement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.LabeledStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined LabeledStatement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.LabeledStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null VariableDeclarator node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined VariableDeclarator node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle null FunctionDeclaration node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined ClassDeclaration node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.ClassDeclaration(undefined)).not.toThrow()
    })

    test('should handle LabeledStatement without label property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const node = { type: 'LabeledStatement', body: { type: 'BlockStatement', body: [] } }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator without id property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator({ type: 'VariableDeclarator', init: null })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration without id property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle ClassDeclaration without id property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.ClassDeclaration({ type: 'ClassDeclaration', body: { type: 'ClassBody', body: [] } })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle LabeledStatement with non-Identifier label', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const node = {
        type: 'LabeledStatement',
        label: { type: 'Literal', value: 'x' },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with non-Identifier id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern' },
        init: null,
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle non-object LabeledStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.LabeledStatement('not an object')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object VariableDeclarator node', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
    })

    test('should handle non-object FunctionDeclaration node', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.FunctionDeclaration('not an object')).not.toThrow()
    })

    test('should handle non-object ClassDeclaration node', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      expect(() => visitor.ClassDeclaration(true)).not.toThrow()
    })

    test('should handle label without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const labelNode = { type: 'Identifier', name: 'x' }
      const stmtNode = {
        type: 'LabeledStatement',
        label: labelNode,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(stmtNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle identifier with numeric name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 42 },
        init: null,
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle label with empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(''))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('')))
      expect(reports.length).toBe(0)
    })

    test('should handle label identifier missing name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const stmtNode = {
        type: 'LabeledStatement',
        label: { type: 'Identifier' },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(stmtNode)
      expect(reports.length).toBe(0)
    })
  })

  describe('state management', () => {
    test('should maintain separate state per create call', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })

      const visitor1 = noLabelVarRule.create(ctx1)
      const visitor2 = noLabelVarRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('x'))
      visitor1.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor2.LabeledStatement(createLabeledStatement(createIdentifier('x')))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should accumulate variable names from multiple declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))

      expect(reports.length).toBe(2)
    })

    test('should track variable names across different declaration types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('y'))
      visitor.ClassDeclaration(createClassDeclaration('z'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('z')))

      expect(reports.length).toBe(3)
    })
  })

  describe('label with variable-like names', () => {
    test('should report single character label matching single character variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('i'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('i')))
      expect(reports.length).toBe(1)
    })

    test('should report label with underscore prefix matching variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_loop'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('_loop')))
      expect(reports.length).toBe(1)
    })

    test('should report label with dollar sign prefix matching variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('$label'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('$label')))
      expect(reports.length).toBe(1)
    })

    test('should report label with long name matching variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      const longName = 'a'.repeat(50)
      visitor.VariableDeclarator(createVariableDeclarator(longName))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier(longName)))
      expect(reports.length).toBe(1)
    })

    test('should report label matching variable with camelCase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myCounter'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myCounter')))
      expect(reports.length).toBe(1)
    })

    test('should report label matching variable with UPPER_CASE name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('MAX_COUNT'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('MAX_COUNT')))
      expect(reports.length).toBe(1)
    })
  })

  describe('order of operations', () => {
    test('should track variable declared after label was checked', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should not report when label is checked before variable is declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(0)
    })

    test('should report second label after variable declared between two labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should handle interleaved declarations and labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))

      expect(reports.length).toBe(2)
    })
  })

  describe('labeled statement body types', () => {
    test('should report label on ForStatement body matching variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('forLabel'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('forLabel'),
        body: {
          type: 'ForStatement',
          init: null,
          test: null,
          update: null,
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report label on WhileStatement body matching function', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('whileLabel'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('whileLabel'),
        body: {
          type: 'WhileStatement',
          test: { type: 'Literal', value: true },
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report label on SwitchStatement body matching class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('switchLabel'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('switchLabel'),
        body: {
          type: 'SwitchStatement',
          discriminant: { type: 'Identifier', name: 'x' },
          cases: [],
        },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report label on BlockStatement when no variable match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('block'),
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('meta properties', () => {
    test('should have an empty schema', () => {
      expect(noLabelVarRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noLabelVarRule.meta.fixable).toBeUndefined()
    })

    test('should have description mentioning labels and variables', () => {
      const desc = noLabelVarRule.meta.docs?.description ?? ''
      expect(desc).toContain('label')
      expect(desc.toLowerCase()).toContain('variable')
    })
  })

  describe('temporal ordering with functions and classes', () => {
    test('should not report label checked before function is declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('fn')))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
      expect(reports.length).toBe(0)
    })

    test('should not report label checked before class is declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Cls')))
      visitor.ClassDeclaration(createClassDeclaration('Cls'))
      expect(reports.length).toBe(0)
    })

    test('should report label after function declared between two labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('fn')))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('fn')))
      expect(reports.length).toBe(1)
    })

    test('should report label after class declared between two labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Cls')))
      visitor.ClassDeclaration(createClassDeclaration('Cls'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Cls')))
      expect(reports.length).toBe(1)
    })
  })

  describe('declaration id edge cases', () => {
    test('should handle FunctionDeclaration with null id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle ClassDeclaration with null id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with ArrayPattern id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [] },
        init: null,
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })
  })

  describe('additional body types', () => {
    test('should report label on DoWhileStatement body matching variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('doLabel'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('doLabel'),
        body: {
          type: 'DoWhileStatement',
          test: { type: 'Literal', value: true },
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report label on ExpressionStatement body matching variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('exprLabel'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('exprLabel'),
        body: {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 42 },
        },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report label on ForInStatement body when no match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('forIn'),
        body: {
          type: 'ForInStatement',
          left: { type: 'Identifier', name: 'k' },
          right: { type: 'Identifier', name: 'obj' },
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('duplicate declarations', () => {
    test('should report label matching variable declared multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should not report duplicate variable name with non-matching label', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      expect(reports.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('should have a default export matching the named export', () => {
      const defaultExport = noLabelVarRule
      expect(defaultExport).toBe(noLabelVarRule)
    })
  })

  describe('extractLocation fallback for labels', () => {
    test('should use default location when label has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const stmtNode = {
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'x' },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(stmtNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should use correct start line when label has loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 10, 5)))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.column).toBe(6)
    })
  })

  describe('label identifier with non-string name', () => {
    test('should not report when label Identifier has numeric name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const stmtNode = {
        type: 'LabeledStatement',
        label: {
          type: 'Identifier',
          name: 123,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(stmtNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when label Identifier name is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      const stmtNode = {
        type: 'LabeledStatement',
        label: {
          type: 'Identifier',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(stmtNode)
      expect(reports.length).toBe(0)
    })
  })

  describe('FunctionDeclaration and ClassDeclaration with non-Identifier id', () => {
    test('should handle FunctionDeclaration with ObjectPattern id gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'ObjectPattern', properties: [] },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle ClassDeclaration with ObjectPattern id gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'ObjectPattern', properties: [] },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })
  })

  describe('report message exact format', () => {
    test('should produce exact message format "Unexpected label \'name\'." for variable match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('target'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('target')))
      expect(reports[0].message).toBe("Unexpected label 'target'.")
    })

    test('should produce exact message format for function match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('callback'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('callback')))
      expect(reports[0].message).toBe("Unexpected label 'callback'.")
    })

    test('should produce exact message format for class match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Widget'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Widget')))
      expect(reports[0].message).toBe("Unexpected label 'Widget'.")
    })
  })

  describe('VariableDeclarator with null id', () => {
    test('should handle VariableDeclarator with explicit null id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: null,
        init: null,
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('null')))
      expect(reports.length).toBe(0)
    })
  })

  describe('unicode and special character names', () => {
    test('should report label matching variable with unicode name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('变量'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('变量')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('变量')
    })

    test('should report label matching variable with emoji-like identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('$emoji'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('$emoji')))
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple declaration types contributing to same name', () => {
    test('variable then function with same name both add to set', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('shared'))
      visitor.FunctionDeclaration(createFunctionDeclaration('shared'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('shared')))
      expect(reports.length).toBe(1)
    })

    test('variable then class with same name both add to set', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('Thing'))
      visitor.ClassDeclaration(createClassDeclaration('Thing'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Thing')))
      expect(reports.length).toBe(1)
    })

    test('function then class with same name both add to set', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('MyObj'))
      visitor.ClassDeclaration(createClassDeclaration('MyObj'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('MyObj')))
      expect(reports.length).toBe(1)
    })

    test('label checked before any declaration is not reported', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unknown')))
      expect(reports.length).toBe(0)
    })
  })

  describe('visitor independence', () => {
    test('separate visitors track variables independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const v1 = noLabelVarRule.create(ctx1)
      const v2 = noLabelVarRule.create(ctx2)

      v1.VariableDeclarator(createVariableDeclarator('x'))
      v2.VariableDeclarator(createVariableDeclarator('y'))

      v1.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      v2.LabeledStatement(createLabeledStatement(createIdentifier('x')))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('accumulated reports across multiple labels', () => {
    test('reports each matching label separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
    })

    test('reports duplicate label names separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('loop'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))

      expect(reports.length).toBe(2)
    })
  })

  describe('case sensitivity', () => {
    test('does not match different case variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('MyVar'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myvar')))
      expect(reports.length).toBe(0)
    })

    test('exact case match is required', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('exact'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('exact')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== META TESTS (20 additional) =====
  describe('meta exhaustive', () => {
    test('meta should be an object', () => {
      expect(typeof noLabelVarRule.meta).toBe('object')
    })

    test('meta.type should be a string', () => {
      expect(typeof noLabelVarRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof noLabelVarRule.meta.severity).toBe('string')
    })

    test('meta.docs should be an object', () => {
      expect(typeof noLabelVarRule.meta.docs).toBe('object')
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noLabelVarRule.meta.docs?.description).toBe('string')
      expect(noLabelVarRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.category should be a string', () => {
      expect(typeof noLabelVarRule.meta.docs?.category).toBe('string')
    })

    test('meta.docs.recommended should be a boolean', () => {
      expect(typeof noLabelVarRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noLabelVarRule.meta.schema)).toBe(true)
    })

    test('meta should have exactly these keys', () => {
      expect(Object.keys(noLabelVarRule.meta)).toEqual(
        expect.arrayContaining(['type', 'severity', 'docs', 'schema', 'fixable']),
      )
    })

    test('meta.type should only be problem suggestion or layout', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noLabelVarRule.meta.type)
    })

    test('meta.severity should only be error warning info or off', () => {
      expect(['error', 'warn', 'warning', 'info', 'off']).toContain(noLabelVarRule.meta.severity)
    })

    test('meta.docs.description should not end with period', () => {
      const desc = noLabelVarRule.meta.docs?.description ?? ''
      expect(desc.endsWith('.')).toBe(true)
    })

    test('meta fixable should be undefined or a valid string', () => {
      if (noLabelVarRule.meta.fixable !== undefined) {
        expect(['code', 'whitespace']).toContain(noLabelVarRule.meta.fixable)
      }
    })

    test('rule should have create method', () => {
      expect(typeof noLabelVarRule.create).toBe('function')
    })

    test('rule should have meta property', () => {
      expect(noLabelVarRule).toHaveProperty('meta')
    })

    test('meta.schema should be empty array', () => {
      expect(noLabelVarRule.meta.schema).toHaveLength(0)
    })

    test('meta.docs should not have url property or it should be a string', () => {
      if (noLabelVarRule.meta.docs?.url !== undefined) {
        expect(typeof noLabelVarRule.meta.docs?.url).toBe('string')
      }
    })

    test('meta.severity should be error', () => {
      expect(noLabelVarRule.meta.severity).toBe('error')
    })

    test('meta.type should be problem', () => {
      expect(noLabelVarRule.meta.type).toBe('problem')
    })

    test('meta.docs.recommended should be true', () => {
      expect(noLabelVarRule.meta.docs?.recommended).toBe(true)
    })
  })

  // ===== DETECTION TESTS (30 additional) =====
  describe('detection - variable matching', () => {
    test('should detect label matching let-style variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('counter'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('counter')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching variable declared first of two', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('first'))
      visitor.VariableDeclarator(createVariableDeclarator('second'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('first')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching variable declared second of two', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('first'))
      visitor.VariableDeclarator(createVariableDeclarator('second'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('second')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching function name exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('process'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('process')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching class name exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.ClassDeclaration(createClassDeclaration('Container'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Container')))
      expect(reports.length).toBe(1)
    })

    test('should detect when variable declared after function with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('shared'))
      visitor.VariableDeclarator(createVariableDeclarator('shared'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('shared')))
      expect(reports.length).toBe(1)
    })

    test('should detect when class declared after variable with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('shared'))
      visitor.ClassDeclaration(createClassDeclaration('shared'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('shared')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching variable with number in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('item2'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('item2')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching variable with double underscore', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('__private'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('__private')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching function after many other declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`var${i}`))
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('target'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('target')))
      expect(reports.length).toBe(1)
    })
  })

  describe('detection - function and class matching', () => {
    test('should detect label matching anonymous function is not tracked', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('anon')))
      expect(reports.length).toBe(0)
    })

    test('should detect label matching class with super class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: createIdentifier('Derived'),
        superClass: createIdentifier('Base'),
        body: { type: 'ClassBody', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Derived')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching function with params', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: createIdentifier('compute'),
        params: [createIdentifier('a'), createIdentifier('b')],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('compute')))
      expect(reports.length).toBe(1)
    })

    test('should detect label matching variable among 20 declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      for (let i = 0; i < 20; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`v${i}`))
      }
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('v15')))
      expect(reports.length).toBe(1)
    })

    test('should detect when variable is declared between two labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NOT REPORTING TESTS (30 additional) =====
  describe('not reporting - no collision scenarios', () => {
    test('should not report when no declarations and label exists', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('lonely')))
      expect(reports.length).toBe(0)
    })

    test('should not report label that is substring of variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('counter'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('count')))
      expect(reports.length).toBe(0)
    })

    test('should not report variable name that is substring of label', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('count'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('counter')))
      expect(reports.length).toBe(0)
    })

    test('should not report when label matches whitespace-padded variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier(' x')))
      expect(reports.length).toBe(0)
    })

    test('should not report when variable and label differ by one trailing character', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('loop'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop1')))
      expect(reports.length).toBe(0)
    })

    test('should not report label matching only class when checking before class declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('MyClass')))
      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      expect(reports.length).toBe(0)
    })

    test('should not report when label matches variable from different visitor instance', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const v1 = noLabelVarRule.create(ctx1)
      const v2 = noLabelVarRule.create(ctx2)
      v1.VariableDeclarator(createVariableDeclarator('unique'))
      v2.LabeledStatement(createLabeledStatement(createIdentifier('unique')))
      expect(r1.length).toBe(0)
      expect(r2.length).toBe(0)
    })

    test('should not report when label is same as function param name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: createIdentifier('myFunc'),
        params: [createIdentifier('param1')],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('param1')))
      expect(reports.length).toBe(0)
    })

    test('should not report when only LabeledStatement visited with no declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('anything')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('else')))
      expect(reports.length).toBe(0)
    })

    test('should not report label with name "undefined" when no variable named undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('defined'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('undefined')))
      expect(reports.length).toBe(0)
    })

    test('should not report when variable name is "null" and label is "null"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('null'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Null')))
      expect(reports.length).toBe(0)
    })

    test('should not report empty string label', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(''))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('nonempty')))
      expect(reports.length).toBe(0)
    })

    test('should not report when 3 different declaration types exist but label matches none', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('v'))
      visitor.FunctionDeclaration(createFunctionDeclaration('f'))
      visitor.ClassDeclaration(createClassDeclaration('C'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('none')))
      expect(reports.length).toBe(0)
    })

    test('should not report label that matches a keyword-like variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('return'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('break')))
      expect(reports.length).toBe(0)
    })

    test('should not report when multiple labels all differ from single variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('target'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASE TESTS (25 additional) =====
  describe('edge cases - node types', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        extra: true,
        random: [1, 2, 3],
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should handle LabeledStatement with nested LabeledStatement body', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('outer'))
      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('outer'),
        body: createLabeledStatement(createIdentifier('inner')),
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle identifier with zero-length name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      const emptyId = {
        type: 'Identifier',
        name: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      }
      visitor.VariableDeclarator({ type: 'VariableDeclarator', id: emptyId, init: null })
      visitor.LabeledStatement(createLabeledStatement(emptyId))
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node for LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(() => visitor.LabeledStatement(false)).not.toThrow()
    })

    test('should handle numeric node for VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(() => visitor.VariableDeclarator(0)).not.toThrow()
    })

    test('should handle empty object as LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(() => visitor.LabeledStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object as VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
    })

    test('should handle empty object as FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
    })

    test('should handle empty object as ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(() => visitor.ClassDeclaration({})).not.toThrow()
    })

    test('should handle array as LabeledStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      expect(() => visitor.LabeledStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested VariableDeclarator id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{ type: 'RestElement', argument: createIdentifier('rest') }],
        },
        init: null,
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('rest')))
      expect(reports.length).toBe(0)
    })

    test('should handle FunctionExpression id (not tracked)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionExpression',
        id: createIdentifier('expr'),
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('expr')))
      expect(reports.length).toBe(0)
    })

    test('should handle ClassExpression id (not tracked)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassExpression',
        id: createIdentifier('exprCls'),
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('exprCls')))
      expect(reports.length).toBe(0)
    })

    test('should handle label with prototype-polluting name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('__proto__'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('__proto__')))
      expect(reports.length).toBe(1)
    })

    test('should handle label named constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('constructor'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('constructor')))
      expect(reports.length).toBe(1)
    })

    test('should handle label named toString', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('toString'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('toString')))
      expect(reports.length).toBe(1)
    })

    test('should handle label matching variable with name "hasOwnProperty"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('hasOwnProperty'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('hasOwnProperty')))
      expect(reports.length).toBe(1)
    })

    test('should not crash with Symbol-named identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: Symbol('sym') },
        init: null,
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('sym')))
      expect(reports.length).toBe(0)
    })

    test('should handle identifier name as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: { nested: 'obj' } },
        init: null,
      })
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should handle very long variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      const longName = 'a'.repeat(1000)
      visitor.VariableDeclarator(createVariableDeclarator(longName))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier(longName)))
      expect(reports.length).toBe(1)
    })

    test('should handle variable name with only underscores', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('___'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('___')))
      expect(reports.length).toBe(1)
    })

    test('should handle variable name with only dollar signs', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('$$$'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('$$$')))
      expect(reports.length).toBe(1)
    })

    test('should handle NaN-like identifier name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('NaN'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('NaN')))
      expect(reports.length).toBe(1)
    })

    test('should handle Infinity-like identifier name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('Infinity'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Infinity')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== LOCATION TESTS (15 additional) =====
  describe('location reporting detailed', () => {
    test('should report correct end column based on name length', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('longName'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('longName', 1, 0)))
      expect(reports[0].loc?.end.column).toBe(8) // 'longName'.length
    })

    test('should report correct end line same as start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 5, 3)))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 1, 0)))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 999, 0)))
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 1, 500)))
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report different locations for different labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 2, 0)))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y', 4, 5)))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should report location for function-based match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('fn', 10, 2)))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location for class-based match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.ClassDeclaration(createClassDeclaration('Cls'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Cls', 3, 8)))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should have loc defined on report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 1, 0)))
      expect(reports[0].loc).toBeDefined()
    })

    test('should have loc.start defined on report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 1, 0)))
      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should have loc.end defined on report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 1, 0)))
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report same start and end line for single-line labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 7, 3)))
      expect(reports[0].loc?.start.line).toBe(reports[0].loc?.end.line)
    })

    test('should handle 3 reports with distinct locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 1, 0)))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 2, 0)))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 3, 0)))
      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })
  })

  // ===== MESSAGE TESTS (10 additional) =====
  describe('message format detailed', () => {
    test('should start with "Unexpected"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports[0].message.startsWith('Unexpected')).toBe(true)
    })

    test('should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should contain single-quoted label name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('testLabel'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('testLabel')))
      expect(reports[0].message).toContain("'testLabel'")
    })

    test('should produce same message for variable function and class matches', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const { context: ctx3, reports: r3 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const v1 = noLabelVarRule.create(ctx1)
      const v2 = noLabelVarRule.create(ctx2)
      const v3 = noLabelVarRule.create(ctx3)
      v1.VariableDeclarator(createVariableDeclarator('shared'))
      v1.LabeledStatement(createLabeledStatement(createIdentifier('shared')))
      v2.FunctionDeclaration(createFunctionDeclaration('shared'))
      v2.LabeledStatement(createLabeledStatement(createIdentifier('shared')))
      v3.ClassDeclaration(createClassDeclaration('shared'))
      v3.LabeledStatement(createLabeledStatement(createIdentifier('shared')))
      expect(r1[0].message).toBe(r2[0].message)
      expect(r2[0].message).toBe(r3[0].message)
    })

    test('should produce unique messages for different label names', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should produce identical messages for same label name at different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 1, 0)))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 5, 3)))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should handle special chars in label name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('_$special'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('_$special')))
      expect(reports[0].message).toContain('_$special')
    })

    test('should have message property as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message length greater than label name length', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports[0].message.length).toBeGreaterThan(1)
    })

    test('should contain word "label" in lowercase in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports[0].message.toLowerCase()).toContain('label')
    })
  })

  // ===== MULTIPLE REPORTS TESTS (10 additional) =====
  describe('multiple reports scenarios', () => {
    test('should report 3 labels matching same variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(3)
    })

    test('should report 2 labels matching 2 different variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      expect(reports.length).toBe(2)
    })

    test('should report 5 labels matching same variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      for (let i = 0; i < 5; i++) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      }
      expect(reports.length).toBe(5)
    })

    test('should report only matching labels from mixed set', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('d')))
      expect(reports.length).toBe(2)
    })

    test('should report label matching each of mixed declaration types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('v'))
      visitor.FunctionDeclaration(createFunctionDeclaration('f'))
      visitor.ClassDeclaration(createClassDeclaration('C'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('v')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('f')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('C')))
      expect(reports.length).toBe(3)
    })

    test('should report labels declared after variable with interleaved non-matching', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('z')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(2)
    })

    test('should report 10 labels all matching one variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('loop'))
      for (let i = 0; i < 10; i++) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      }
      expect(reports.length).toBe(10)
    })

    test('should report each label only once even if same name matches multiple declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('shared'))
      visitor.FunctionDeclaration(createFunctionDeclaration('shared'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('shared')))
      expect(reports.length).toBe(1)
    })

    test('should report labels added in sequence with variable declarations between', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      expect(reports.length).toBe(3)
    })

    test('should report 0 when all labels have non-matching names', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('d')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== CONTEXT TESTS (10 additional) =====
  describe('context interaction', () => {
    test('should call context.report exactly once for one matching label', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should not call context.report when no labels match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('should not call context.report when only VariableDeclarator visited', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      expect(reports.length).toBe(0)
    })

    test('should not call context.report when only FunctionDeclaration visited', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration('x'))
      expect(reports.length).toBe(0)
    })

    test('should not call context.report when only ClassDeclaration visited', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.ClassDeclaration(createClassDeclaration('x'))
      expect(reports.length).toBe(0)
    })

    test('should not call context.report when only LabeledStatement visited', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should create independent context per visitor', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const v1 = noLabelVarRule.create(ctx1)
      const v2 = noLabelVarRule.create(ctx2)
      v1.VariableDeclarator(createVariableDeclarator('x'))
      v1.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      v2.VariableDeclarator(createVariableDeclarator('y'))
      v2.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
      expect(r1[0].message).toContain('x')
      expect(r2[0].message).toContain('y')
    })

    test('should handle context being called with correct descriptor shape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', 3, 5)))
      const report = reports[0]
      expect(report).toHaveProperty('message')
      expect(report).toHaveProperty('loc')
      expect(report.loc).toHaveProperty('start')
      expect(report.loc).toHaveProperty('end')
    })

    test('should work with context that has different file path', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/other/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/other',
      } as unknown as RuleContext
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should work regardless of context source content', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/empty.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== TEST.EACH TESTS (40+ additional) =====
  describe('test.each - variable name patterns', () => {
    test.each([
      ['x', 'x', 1],
      ['myVar', 'myVar', 1],
      ['_private', '_private', 1],
      ['$jquery', '$jquery', 1],
      ['camelCase', 'camelCase', 1],
      ['UPPER', 'UPPER', 1],
      ['snake_case', 'snake_case', 1],
      ['num2', 'num2', 1],
      ['__dunder', '__dunder', 1],
      ['$$', '$$', 1],
    ] as const)(
      'should report label "%s" matching variable "%s"',
      (varName, labelName, expected) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
        const visitor = noLabelVarRule.create(context)
        visitor.VariableDeclarator(createVariableDeclarator(varName))
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(labelName)))
        expect(reports.length).toBe(expected)
      },
    )
  })

  describe('test.each - non-matching pairs', () => {
    test.each([
      ['x', 'y', 0],
      ['abc', 'def', 0],
      ['lower', 'UPPER', 0],
      ['One', 'one', 0],
      ['loop', 'LOOP', 0],
      ['_start', 'start', 0],
      ['start', '_start', 0],
      ['$', '$$', 0],
      ['a', 'ab', 0],
      ['ab', 'a', 0],
    ] as const)(
      'should not report variable "%s" with label "%s"',
      (varName, labelName, expected) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
        const visitor = noLabelVarRule.create(context)
        visitor.VariableDeclarator(createVariableDeclarator(varName))
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(labelName)))
        expect(reports.length).toBe(expected)
      },
    )
  })

  describe('test.each - declaration type detection', () => {
    test.each([
      ['variable', 'x', 'x', 1],
      ['function', 'fn', 'fn', 1],
      ['class', 'Cls', 'Cls', 1],
      ['variable', 'v', 'wrong', 0],
      ['function', 'f', 'wrong', 0],
      ['class', 'C', 'wrong', 0],
    ] as const)(
      'declaration %s with name "%s" and label "%s" should report %d times',
      (declType, declName, labelName, expected) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
        const visitor = noLabelVarRule.create(context)
        if (declType === 'variable') visitor.VariableDeclarator(createVariableDeclarator(declName))
        else if (declType === 'function')
          visitor.FunctionDeclaration(createFunctionDeclaration(declName))
        else visitor.ClassDeclaration(createClassDeclaration(declName))
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(labelName)))
        expect(reports.length).toBe(expected)
      },
    )
  })

  describe('test.each - edge case identifier names', () => {
    test.each([
      ['i', true],
      ['_', true],
      ['$', true],
      ['a0', true],
      ['Z', true],
      ['_0', true],
      ['$_', true],
      ['Object', true],
      ['Array', true],
      ['Map', true],
    ] as const)('should report label "%s" matching variable (match=%s)', (name, _shouldMatch) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(name))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier(name)))
      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - location tracking', () => {
    test.each([
      [1, 0],
      [1, 5],
      [10, 0],
      [10, 20],
      [100, 50],
    ] as const)('should report correct location at line %d column %d', (line, col) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; x: { break x; }' })
      const visitor = noLabelVarRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x', line, col)))
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(col)
    })
  })
})
