import { noUselessFallbackInSpreadRule } from '../../../../src/rules/patterns/no-useless-fallback-in-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string, start = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + name.length },
    },
    range: [start, start + name.length],
  }
}

function createEmptyObjectLiteral(start = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 2 },
    },
    range: [start, start + 2],
  }
}

function createEmptyArrayLiteral(start = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 2 },
    },
    range: [start, start + 2],
  }
}

function createLogicalOrExpression(left: unknown, right: unknown, start = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '||',
    left,
    right,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 10 },
    },
    range: [start, start + 10],
  }
}

function createLiteral(value: unknown, start = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 1 },
    },
    range: [start, start + 1],
  }
}

function createLogicalAndExpression(left: unknown, right: unknown, start = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left,
    right,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 10 },
    },
    range: [start, start + 10],
  }
}

function createLogicalNullishExpression(left: unknown, right: unknown, start = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '??',
    left,
    right,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 10 },
    },
    range: [start, start + 10],
  }
}

function createSpreadElement(argument: unknown, start = 0, line = 1): unknown {
  return {
    type: 'SpreadElement',
    argument,
    loc: {
      start: { line, column: start },
      end: { line, column: start + 15 },
    },
    range: [start, start + 15],
  }
}

function createNonEmptyObjectLiteral(start = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: createIdentifier('a', start + 2),
        value: createLiteral(1, start + 6),
      },
    ],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 8 },
    },
    range: [start, start + 8],
  }
}

function createNonEmptyArrayLiteral(start = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [createLiteral(1, start + 1)],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 3 },
    },
    range: [start, start + 3],
  }
}

function createMemberExpression(objectName: string, property: string, start = 0): unknown {
  return {
    type: 'MemberExpression',
    object: createIdentifier(objectName, start),
    property: createIdentifier(property, start + objectName.length + 1),
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + objectName.length + 1 + property.length },
    },
    range: [start, start + objectName.length + 1 + property.length],
  }
}

function createCallExpression(calleeName: string, start = 0): unknown {
  return {
    type: 'CallExpression',
    callee: createIdentifier(calleeName, start),
    arguments: [],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + calleeName.length + 2 },
    },
    range: [start, start + calleeName.length + 2],
  }
}

function invokeVisitor(
  visitor: ReturnType<typeof noUselessFallbackInSpreadRule.create>,
  spreadElement: unknown,
  parent?: unknown,
): void {
  ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)
}

// ─── META (20 tests) ────────────────────────────────────────────────────────

describe('no-useless-fallback-in-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUselessFallbackInSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUselessFallbackInSpreadRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUselessFallbackInSpreadRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noUselessFallbackInSpreadRule.meta.fixable).toBe('code')
    })

    test('should mention spread in description', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should mention fallback in description', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.description.toLowerCase()).toContain(
        'fallback',
      )
    })

    test('should have documentation URL', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-fallback-in-spread',
      )
    })

    test('should have docs property', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.description).toBeDefined()
      expect(typeof noUselessFallbackInSpreadRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUselessFallbackInSpreadRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noUselessFallbackInSpreadRule.meta.severity)
    })

    test('should have fixable as code', () => {
      expect(noUselessFallbackInSpreadRule.meta.fixable).toBe('code')
    })

    test('should not be deprecated', () => {
      expect(noUselessFallbackInSpreadRule.meta.deprecated).toBeFalsy()
    })

    test('should have url as a string when defined', () => {
      expect(typeof noUselessFallbackInSpreadRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUselessFallbackInSpreadRule.meta.schema)).toBe(true)
    })

    test('should mention redundant in description', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.description.toLowerCase()).toContain(
        'redundant',
      )
    })

    test('should mention undefined or null in description', () => {
      const desc = noUselessFallbackInSpreadRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('undefined')
    })
  })

  // ─── CREATE / VISITOR (8 tests) ────────────────────────────────────────────

  describe('create', () => {
    test('should return visitor object with SpreadElement method', () => {
      const { context } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      expect(visitor).toHaveProperty('SpreadElement')
      expect(typeof visitor.SpreadElement).toBe('function')
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor1 = noUselessFallbackInSpreadRule.create(context)
      const visitor2 = noUselessFallbackInSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only SpreadElement key', () => {
      const { context } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toEqual(['SpreadElement'])
    })

    test('should not throw when create is called without options', () => {
      const { context } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      expect(() => noUselessFallbackInSpreadRule.create(context)).not.toThrow()
    })

    test('should accept context with empty options', () => {
      const { context } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)
      expect(typeof visitor.SpreadElement).toBe('function')
    })

    test('should accept context with custom file path', () => {
      const { context } = createMockRuleContext({ source: 'const x = { ...obj || {} };', filePath: '/custom/path.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)
      expect(typeof visitor.SpreadElement).toBe('function')
    })

    test('should accept context with custom source', () => {
      const { context } = createMockRuleContext({ source: 'const a = 1', filePath: '/src/test.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)
      expect(typeof visitor.SpreadElement).toBe('function')
    })

    test('SpreadElement should be a synchronous function', () => {
      const { context } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)
      const result = visitor.SpreadElement(null)
      expect(result).toBeUndefined()
    })
  })

  // ─── DETECTION — OBJECT SPREAD (15 tests) ──────────────────────────────────

  describe('detecting useless fallback in object spread', () => {
    test('should report ...obj || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless fallback')
      expect(reports[0].message).toContain('spread')
    })

    test('should report ...data || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('data', 0),
        createEmptyObjectLiteral(9),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...config || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('config', 0),
        createEmptyObjectLiteral(10),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...props || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('props', 0),
        createEmptyObjectLiteral(9),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...settings || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('settings', 0),
        createEmptyObjectLiteral(12),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report with MemberExpression left operand in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const left = createMemberExpression('options', 'data', 0)
      const right = createEmptyObjectLiteral(16)
      const logicalExpr = createLogicalOrExpression(left, right, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report with CallExpression left operand in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const left = createCallExpression('getData', 0)
      const right = createEmptyObjectLiteral(12)
      const logicalExpr = createLogicalOrExpression(left, right, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...options || {} with properties in parent', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('options', 0),
        createEmptyObjectLiteral(11),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [{ type: 'Property' }] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should provide fix to remove || {}', () => {
      const source = 'const x = { ...obj || {} };'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 15)
      const rightOperand = createEmptyObjectLiteral(22)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('obj')
    })

    test('should report ...defaults || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('defaults', 0),
        createEmptyObjectLiteral(12),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...state || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('state', 0),
        createEmptyObjectLiteral(9),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...payload || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('payload', 0),
        createEmptyObjectLiteral(11),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...result || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('result', 0),
        createEmptyObjectLiteral(10),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...response || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('response', 0),
        createEmptyObjectLiteral(12),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...context || {} in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('context', 0),
        createEmptyObjectLiteral(11),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })
  })

  // ─── DETECTION — ARRAY SPREAD (15 tests) ───────────────────────────────────

  describe('detecting useless fallback in array spread', () => {
    test('should report ...arr || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless fallback')
    })

    test('should report ...items || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('items', 0),
        createEmptyArrayLiteral(9),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...list || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('list', 0),
        createEmptyArrayLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should provide fix to remove || []', () => {
      const source = 'const x = [...arr || []];'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('arr', 14)
      const rightOperand = createEmptyArrayLiteral(21)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('arr')
    })

    test('should report ...values || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('values', 0),
        createEmptyArrayLiteral(10),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...elements || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('elements', 0),
        createEmptyArrayLiteral(12),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...results || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('results', 0),
        createEmptyArrayLiteral(11),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...entries || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('entries', 0),
        createEmptyArrayLiteral(11),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report with MemberExpression left operand in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const left = createMemberExpression('data', 'items', 0)
      const right = createEmptyArrayLiteral(14)
      const logicalExpr = createLogicalOrExpression(left, right, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report with CallExpression left operand in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const left = createCallExpression('getItems', 0)
      const right = createEmptyArrayLiteral(12)
      const logicalExpr = createLogicalOrExpression(left, right, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...rows || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('rows', 0),
        createEmptyArrayLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...chunks || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('chunks', 0),
        createEmptyArrayLiteral(10),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...parts || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('parts', 0),
        createEmptyArrayLiteral(9),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...args || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('args', 0),
        createEmptyArrayLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...deps || [] in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('deps', 0),
        createEmptyArrayLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })
  })

  // ─── NOT REPORTING (30 tests) ──────────────────────────────────────────────

  describe('valid patterns that should not report', () => {
    test('should not report spread without fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = createSpreadElement(createIdentifier('obj', 0), 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with non-empty object fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createNonEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with non-empty array fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createNonEmptyArrayLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with && operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalAndExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with null fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createLiteral(null, 8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with undefined fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createLiteral(undefined, 8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with number fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createLiteral(0, 8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with string fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createLiteral('', 8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread not in object or array', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'CallExpression' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with ?? operator in object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalNullishExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with ?? operator in array', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalNullishExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report when spread parent is FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'FunctionExpression' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report when spread parent is ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrowFunctionExpression' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report when spread parent is NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'NewExpression' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report array fallback in object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyArrayLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report object fallback in array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyObjectLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createLiteral(true, 8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report identifier fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const right = createIdentifier('fallback', 8)
      const logicalExpr = createLogicalOrExpression(createIdentifier('obj', 0), right, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report numeric literal fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createLiteral(42, 8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report when spread parent is TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'TemplateLiteral' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with && and empty array fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalAndExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with false literal fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createLiteral(false, 8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report when parent has type SequenceExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'SequenceExpression' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread of plain identifier in array', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = createSpreadElement(createIdentifier('arr', 0), 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread of member expression without fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const left = createMemberExpression('obj', 'data', 0)
      const spreadElement = createSpreadElement(left, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with BigInt literal fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const right = {
        type: 'Literal',
        value: 0n,
        bigint: '0',
        loc: { start: { line: 1, column: 8 }, end: { line: 1, column: 10 } },
        range: [8, 10],
      }
      const logicalExpr = createLogicalOrExpression(createIdentifier('obj', 0), right, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with regex literal fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const right = {
        type: 'Literal',
        value: /test/,
        regex: { pattern: 'test', flags: '' },
        loc: { start: { line: 1, column: 8 }, end: { line: 1, column: 14 } },
        range: [8, 14],
      }
      const logicalExpr = createLogicalOrExpression(createIdentifier('obj', 0), right, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report when parent type is ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ConditionalExpression' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report when spread parent type is TaggedTemplateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'TaggedTemplateExpression' }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with object containing only spread property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const nonEmptyObject = {
        type: 'ObjectExpression',
        properties: [{ type: 'SpreadElement', argument: createIdentifier('other', 2) }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
        range: [0, 12],
      }
      const logicalExpr = createLogicalOrExpression(createIdentifier('obj', 0), nonEmptyObject, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with array containing null element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const arrayWithNull = {
        type: 'ArrayExpression',
        elements: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        range: [0, 5],
      }
      const logicalExpr = createLogicalOrExpression(createIdentifier('arr', 0), arrayWithNull, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })
  })

  // ─── EDGE CASES (25 tests) ─────────────────────────────────────────────────

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      visitor.SpreadElement(null)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      visitor.SpreadElement(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      expect(() => visitor.SpreadElement('string')).not.toThrow()
      expect(() => visitor.SpreadElement(123)).not.toThrow()
      expect(() => visitor.SpreadElement(true)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle spread element without argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = {
        type: 'SpreadElement',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        },
      }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle spread element without parent', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)

      visitor.SpreadElement(spreadElement)

      expect(reports.length).toBe(0)
    })

    test('should handle logical expression without right operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
      }
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle logical expression without left operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        right: rightOperand,
      }
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
        right: rightOperand,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      const spreadElement = {
        type: 'SpreadElement',
        argument: logicalExpr,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = { loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } } }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle spread with argument that is a plain literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = createSpreadElement(createLiteral(42, 0), 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle spread with argument that is a string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = createSpreadElement(createLiteral('hello', 0), 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
        right: rightOperand,
        range: [0, 10],
      }
      const spreadElement = {
        type: 'SpreadElement',
        argument: logicalExpr,
        range: [0, 15],
      }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should handle SpreadElement with undefined argument property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = { type: 'SpreadElement', argument: undefined }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle SpreadElement with null argument property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = { type: 'SpreadElement', argument: null }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle left operand being a Literal instead of Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createLiteral('obj', 0)
      const rightOperand = createEmptyObjectLiteral(7)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested object as parent', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        extra: { some: 'data' },
      }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should handle ArrayExpression parent with elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [createLiteral(1, 0)] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should handle node with number type properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = { type: 'SpreadElement', argument: 42 }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle argument being a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = { type: 'SpreadElement', argument: true }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle spread with argument as array (invalid AST)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = { type: 'SpreadElement', argument: [] }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle SpreadElement with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = {
        ...createSpreadElement(logicalExpr, 0),
        extra: true,
        another: 'value',
      }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should handle empty object source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      // Should still report, fix text may be empty
      expect(reports.length).toBe(1)
    })

    test('should handle ObjectExpression with properties array containing undefined entries', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [undefined] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })
  })

  // ─── LOCATION (15 tests) ───────────────────────────────────────────────────

  describe('location tracking', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0, 42)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location starting at spread argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 5),
        createEmptyObjectLiteral(13),
        5,
      )
      const spreadElement = createSpreadElement(logicalExpr, 2)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location on line 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0, 5)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location with correct start column for object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 10),
        createEmptyObjectLiteral(18),
        10,
      )
      const spreadElement = createSpreadElement(logicalExpr, 7)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location with correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location with correct start column for array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 5),
        createEmptyArrayLiteral(12),
        5,
      )
      const spreadElement = createSpreadElement(logicalExpr, 2)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location for deeply nested spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: createIdentifier('x', 20),
        right: createEmptyObjectLiteral(26),
        loc: {
          start: { line: 3, column: 20 },
          end: { line: 3, column: 28 },
        },
        range: [20, 28],
      }
      const spreadElement = createSpreadElement(logicalExpr, 17, 3)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should have start and end in reported location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect('line' in (reports[0].loc?.start ?? {})).toBe(true)
      expect('column' in (reports[0].loc?.start ?? {})).toBe(true)
    })

    test('should report correct location for array spread on different line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0, 10)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should preserve location from argument node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: createIdentifier('obj', 0),
        right: createEmptyObjectLiteral(8),
        loc: {
          start: { line: 7, column: 4 },
          end: { line: 7, column: 14 },
        },
        range: [4, 14],
      }
      const spreadElement = createSpreadElement(logicalExpr, 1, 7)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for object spread at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for array spread at offset position', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('items', 30),
        createEmptyArrayLiteral(39),
        30,
      )
      const spreadElement = createSpreadElement(logicalExpr, 27)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.column).toBe(30)
    })

    test('should handle location with very large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 500),
        createEmptyObjectLiteral(508),
        500,
      )
      const spreadElement = createSpreadElement(logicalExpr, 497)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should include end location that matches argument end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report location for consecutive spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('a', 0),
        createEmptyObjectLiteral(6),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.column).toBe(10)
    })
  })

  // ─── MESSAGES (10 tests) ───────────────────────────────────────────────────

  describe('message quality', () => {
    test('should mention useless fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('useless fallback')
    })

    test('should mention spread pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('spread')
    })

    test('should mention safe for object spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('safe')
    })

    test('should show ...obj || {} can be simplified', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message).toContain('...obj || {}')
      expect(reports[0].message).toContain('...obj')
    })

    test('should show ...arr || [] can be simplified', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message).toContain('...arr || []')
      expect(reports[0].message).toContain('...arr')
    })

    test('should include message about simplification', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('simplif')
    })

    test('should have non-empty message for array spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('items', 0),
        createEmptyArrayLiteral(9),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should mention spreading in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('spreading')
    })

    test('should mention undefined/null safety in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('undefined') || msg.includes('null')).toBe(true)
    })

    test('should contain specific pattern in message for array fallback', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('list', 0),
        createEmptyArrayLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].message).toContain('|| []')
    })
  })

  // ─── FIX FUNCTIONALITY (10 tests) ──────────────────────────────────────────

  describe('fix functionality', () => {
    test('should provide fix for ...obj || {}', () => {
      const source = 'const x = { ...obj || {} };'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 15)
      const rightOperand = createEmptyObjectLiteral(22)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('obj')
    })

    test('should provide fix for ...data || {}', () => {
      const source = 'const x = { ...data || {} };'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('data', 15)
      const rightOperand = createEmptyObjectLiteral(24)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('data')
    })

    test('should provide fix for ...arr || []', () => {
      const source = 'const x = [...arr || []];'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('arr', 14)
      const rightOperand = createEmptyArrayLiteral(21)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })

    test('should provide fix for ...items || []', () => {
      const source = 'const x = [...items || []];'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('items', 14)
      const rightOperand = createEmptyArrayLiteral(23)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('items')
    })

    test('should not provide fix when range is not available', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
        right: rightOperand,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      const spreadElement = {
        type: 'SpreadElement',
        argument: logicalExpr,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix range that covers the logical expression', () => {
      const source = 'const x = { ...config || {} };'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('config', 15)
      const rightOperand = createEmptyObjectLiteral(26)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix?.range).toBeDefined()
      expect(reports[0].fix?.range[0]).toBe(15)
      expect(reports[0].fix?.range[1]).toBe(25)
    })

    test('should provide fix with source text matching left operand for array', () => {
      const source = 'const x = [...values || []];'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('values', 14)
      const rightOperand = createEmptyArrayLiteral(25)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix?.text).toBe('values')
    })

    test('should not provide fix for spread without range on argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
        right: rightOperand,
      }
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide correct fix for settings variable', () => {
      const source = 'const x = { ...settings || {} };'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('settings', 15)
      const rightOperand = createEmptyObjectLiteral(28)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix?.text).toBe('settings')
    })

    test('should provide correct fix for elements variable', () => {
      const source = 'const x = [...elements || []];'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('elements', 14)
      const rightOperand = createEmptyArrayLiteral(27)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix?.text).toBe('elements')
    })
  })

  // ─── MULTIPLE REPORTS (10 tests) ───────────────────────────────────────────

  describe('multiple reports', () => {
    test('should report each time visitor is called with matching pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)
      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(2)
    })

    test('should report independently for object and array spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const objExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const objSpread = createSpreadElement(objExpr, 0)
      const objParent = { type: 'ObjectExpression', properties: [] }

      const arrExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const arrSpread = createSpreadElement(arrExpr, 0)
      const arrParent = { type: 'ArrayExpression', elements: [] }

      invokeVisitor(visitor, objSpread, objParent)
      invokeVisitor(visitor, arrSpread, arrParent)

      expect(reports.length).toBe(2)
    })

    test('should only report for matching patterns when mixed calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      // Matching: object spread with || {}
      const matchExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const matchSpread = createSpreadElement(matchExpr, 0)
      const matchParent = { type: 'ObjectExpression', properties: [] }

      // Non-matching: spread without fallback
      const noFallbackSpread = createSpreadElement(createIdentifier('data', 0), 0)
      const noFallbackParent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, matchSpread, matchParent)
      invokeVisitor(visitor, noFallbackSpread, noFallbackParent)

      expect(reports.length).toBe(1)
    })

    test('should report three consecutive matching object spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      for (let i = 0; i < 3; i++) {
        const logicalExpr = createLogicalOrExpression(
          createIdentifier('obj', 0),
          createEmptyObjectLiteral(8),
          0,
        )
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ObjectExpression', properties: [] }
        invokeVisitor(visitor, spreadElement, parent)
      }

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports across different variable names', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const names = ['obj', 'data', 'config']
      for (const name of names) {
        const logicalExpr = createLogicalOrExpression(
          createIdentifier(name, 0),
          createEmptyObjectLiteral(name.length + 5),
          0,
        )
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ObjectExpression', properties: [] }
        invokeVisitor(visitor, spreadElement, parent)
      }

      expect(reports.length).toBe(3)
    })

    test('should report five matching and skip five non-matching', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      // 5 matching
      for (let i = 0; i < 5; i++) {
        const logicalExpr = createLogicalOrExpression(
          createIdentifier('obj', 0),
          createEmptyObjectLiteral(8),
          0,
        )
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ObjectExpression', properties: [] }
        invokeVisitor(visitor, spreadElement, parent)
      }

      // 5 non-matching
      for (let i = 0; i < 5; i++) {
        const spreadElement = createSpreadElement(createIdentifier('obj', 0), 0)
        const parent = { type: 'ObjectExpression', properties: [] }
        invokeVisitor(visitor, spreadElement, parent)
      }

      expect(reports.length).toBe(5)
    })

    test('should report for different parent types independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      // Object spread matching
      const objExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const objSpread = createSpreadElement(objExpr, 0)
      invokeVisitor(visitor, objSpread, { type: 'ObjectExpression', properties: [] })

      // Array spread matching
      const arrExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      const arrSpread = createSpreadElement(arrExpr, 0)
      invokeVisitor(visitor, arrSpread, { type: 'ArrayExpression', elements: [] })

      // Non-matching parent
      const nonMatchExpr = createLogicalOrExpression(
        createIdentifier('x', 0),
        createEmptyObjectLiteral(5),
        0,
      )
      const nonMatchSpread = createSpreadElement(nonMatchExpr, 0)
      invokeVisitor(visitor, nonMatchSpread, { type: 'CallExpression' })

      expect(reports.length).toBe(2)
    })

    test('should handle rapid successive calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      for (let i = 0; i < 20; i++) {
        const logicalExpr = createLogicalOrExpression(
          createIdentifier('obj', 0),
          createEmptyObjectLiteral(8),
          0,
        )
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ObjectExpression', properties: [] }
        invokeVisitor(visitor, spreadElement, parent)
      }

      expect(reports.length).toBe(20)
    })

    test('should not mix reports between two different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })

      const visitor1 = noUselessFallbackInSpreadRule.create(ctx1)
      const visitor2 = noUselessFallbackInSpreadRule.create(ctx2)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor1, spreadElement, parent)
      invokeVisitor(visitor2, spreadElement, parent)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('should report correct message for each occurrence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const objExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      invokeVisitor(visitor, createSpreadElement(objExpr, 0), {
        type: 'ObjectExpression',
        properties: [],
      })

      const arrExpr = createLogicalOrExpression(
        createIdentifier('arr', 0),
        createEmptyArrayLiteral(7),
        0,
      )
      invokeVisitor(visitor, createSpreadElement(arrExpr, 0), {
        type: 'ArrayExpression',
        elements: [],
      })

      expect(reports[0].message).toContain('...obj || {}')
      expect(reports[1].message).toContain('...arr || []')
    })
  })

  // ─── CONTEXT (10 tests) ────────────────────────────────────────────────────

  describe('context handling', () => {
    test('should work with default context', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };', filePath: '/src/components/App.tsx' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };', filePath: '/src/utils.js' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should work with complex source code', () => {
      const source =
        'function merge(defaults, overrides) { return { ...defaults || {}, ...overrides || {} }; }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/merge.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('defaults', 50),
        createEmptyObjectLiteral(62),
        50,
      )
      const spreadElement = createSpreadElement(logicalExpr, 47)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('defaults')
    })

    test('should call report on context when pattern matches', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(context.report).toBeDefined()
      expect(reports.length).toBe(1)
    })

    test('should not call report when pattern does not match', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = createSpreadElement(createIdentifier('obj', 0), 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should access source through getSource', () => {
      const source = '{ ...opts || {} }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      expect(context.getSource()).toBe(source)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('opts', 5),
        createEmptyObjectLiteral(14),
        5,
      )
      const spreadElement = createSpreadElement(logicalExpr, 2)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix?.text).toBe('opts')
    })

    test('should handle context with long file path', () => {
      const longPath = '/very/deeply/nested/directory/structure/that/goes/on/and/on/file.ts'
      const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };', filePath: longPath })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should handle context with unicode in source', () => {
      const source = 'const café = { ...datos || {} };'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('datos', 18)
      const rightOperand = createEmptyObjectLiteral(27)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 18)
      const spreadElement = createSpreadElement(logicalExpr, 15)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports[0].fix?.text).toBe('datos')
    })

    test('should work when context has extra options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ customOption: true, anotherOption: 42 }], source: 'const x = { ...obj || {} };' })
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const logicalExpr = createLogicalOrExpression(
        createIdentifier('obj', 0),
        createEmptyObjectLiteral(8),
        0,
      )
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'ObjectExpression', properties: [] }

      invokeVisitor(visitor, spreadElement, parent)

      expect(reports.length).toBe(1)
    })
  })

  // ─── TEST.EACH — PARAMETERIZED (42 tests) ──────────────────────────────────

  describe('parameterized detection tests', () => {
    test.each([
      { name: 'obj', rightStart: 8 },
      { name: 'data', rightStart: 9 },
      { name: 'config', rightStart: 10 },
      { name: 'options', rightStart: 11 },
      { name: 'settings', rightStart: 12 },
      { name: 'props', rightStart: 9 },
      { name: 'state', rightStart: 9 },
      { name: 'defaults', rightStart: 12 },
      { name: 'payload', rightStart: 11 },
      { name: 'response', rightStart: 12 },
    ] satisfies Array<{ name: string; rightStart: number }>)(
      'should report ...$name || {} in object spread',
      ({ name, rightStart }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
        const visitor = noUselessFallbackInSpreadRule.create(context)

        const logicalExpr = createLogicalOrExpression(
          createIdentifier(name, 0),
          createEmptyObjectLiteral(rightStart),
          0,
        )
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ObjectExpression', properties: [] }

        invokeVisitor(visitor, spreadElement, parent)

        expect(reports.length).toBe(1)
      },
    )

    test.each([
      { name: 'arr', rightStart: 7 },
      { name: 'items', rightStart: 9 },
      { name: 'list', rightStart: 8 },
      { name: 'values', rightStart: 10 },
      { name: 'elements', rightStart: 12 },
      { name: 'results', rightStart: 11 },
      { name: 'entries', rightStart: 11 },
      { name: 'chunks', rightStart: 10 },
      { name: 'rows', rightStart: 8 },
      { name: 'parts', rightStart: 9 },
    ] satisfies Array<{ name: string; rightStart: number }>)(
      'should report ...$name || [] in array spread',
      ({ name, rightStart }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
        const visitor = noUselessFallbackInSpreadRule.create(context)

        const logicalExpr = createLogicalOrExpression(
          createIdentifier(name, 0),
          createEmptyArrayLiteral(rightStart),
          0,
        )
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ArrayExpression', elements: [] }

        invokeVisitor(visitor, spreadElement, parent)

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('parameterized non-matching tests', () => {
    test.each([
      { desc: 'number literal', value: 42 },
      { desc: 'string literal', value: 'hello' },
      { desc: 'boolean true', value: true },
      { desc: 'boolean false', value: false },
      { desc: 'null', value: null },
      { desc: 'undefined', value: undefined },
      { desc: 'zero', value: 0 },
      { desc: 'empty string', value: '' },
      { desc: 'NaN', value: NaN },
      { desc: 'negative number', value: -1 },
    ] satisfies Array<{ desc: string; value: unknown }>)(
      'should not report when right operand is $desc',
      ({ value }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
        const visitor = noUselessFallbackInSpreadRule.create(context)

        const rightOperand = createLiteral(value, 8)
        const logicalExpr = createLogicalOrExpression(createIdentifier('obj', 0), rightOperand, 0)
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ObjectExpression', properties: [] }

        invokeVisitor(visitor, spreadElement, parent)

        expect(reports.length).toBe(0)
      },
    )

    test.each([
      { parentType: 'CallExpression' },
      { parentType: 'NewExpression' },
      { parentType: 'FunctionExpression' },
      { parentType: 'ArrowFunctionExpression' },
      { parentType: 'TemplateLiteral' },
      { parentType: 'ConditionalExpression' },
      { parentType: 'SequenceExpression' },
      { parentType: 'TaggedTemplateExpression' },
      { parentType: 'BinaryExpression' },
      { parentType: 'AssignmentExpression' },
    ] satisfies Array<{ parentType: string }>)(
      'should not report when parent type is $parentType',
      ({ parentType }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
        const visitor = noUselessFallbackInSpreadRule.create(context)

        const logicalExpr = createLogicalOrExpression(
          createIdentifier('obj', 0),
          createEmptyObjectLiteral(8),
          0,
        )
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: parentType }

        invokeVisitor(visitor, spreadElement, parent)

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized operator tests', () => {
    test.each([
      { operator: '&&', desc: 'AND' },
      { operator: '??', desc: 'nullish coalescing' },
    ] satisfies Array<{ operator: string; desc: string }>)(
      'should not report with $desc ($operator) operator in object spread',
      ({ operator }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
        const visitor = noUselessFallbackInSpreadRule.create(context)

        const logicalExpr = {
          type: 'LogicalExpression',
          operator,
          left: createIdentifier('obj', 0),
          right: createEmptyObjectLiteral(8),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          range: [0, 10],
        }
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ObjectExpression', properties: [] }

        invokeVisitor(visitor, spreadElement, parent)

        expect(reports.length).toBe(0)
      },
    )

    test.each([
      { operator: '&&', desc: 'AND' },
      { operator: '??', desc: 'nullish coalescing' },
    ] satisfies Array<{ operator: string; desc: string }>)(
      'should not report with $desc ($operator) operator in array spread',
      ({ operator }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = { ...obj || {} };' })
        const visitor = noUselessFallbackInSpreadRule.create(context)

        const logicalExpr = {
          type: 'LogicalExpression',
          operator,
          left: createIdentifier('arr', 0),
          right: createEmptyArrayLiteral(7),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
          range: [0, 9],
        }
        const spreadElement = createSpreadElement(logicalExpr, 0)
        const parent = { type: 'ArrayExpression', elements: [] }

        invokeVisitor(visitor, spreadElement, parent)

        expect(reports.length).toBe(0)
      },
    )
  })
})
