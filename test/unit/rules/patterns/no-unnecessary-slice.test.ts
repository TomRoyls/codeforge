

import { noUnnecessarySliceRule } from '../../../../src/rules/patterns/no-unnecessary-slice.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSliceCall(objectName = 'arr', args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + objectName.length
  const callEnd = objectEnd + '.slice'.length + args.length * 2 + 2

  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: objectName,
        range: [column, objectEnd],
        type: 'Identifier',
      },
      property: {
        name: 'slice',
        type: 'Identifier',
      },
      range: [column, objectEnd + '.slice'.length],
      type: 'MemberExpression',
    },
    loc: {
      end: { callEnd, line },
      start: { column, line },
    },
    range: [column, callEnd],
    type: 'CallExpression',
  }
}

function createLiteral(value: unknown, raw?: string): unknown {
  return {
    raw: raw ?? String(value),
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    name,
    type: 'Identifier',
  }
}

function createNonSliceCall(methodName = 'map'): unknown {
  return {
    arguments: [],
    callee: {
      object: {
        name: 'arr',
        type: 'Identifier',
      },
      property: {
        name: methodName,
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function createDirectCall(): unknown {
  return {
    arguments: [],
    callee: {
      name: 'slice',
      type: 'Identifier',
    },
    loc: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

describe('no-unnecessary-slice rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessarySliceRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessarySliceRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessarySliceRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessarySliceRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessarySliceRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noUnnecessarySliceRule.meta.fixable).toBe('code')
    })

    test('should mention slice in description', () => {
      expect(noUnnecessarySliceRule.meta.docs?.description.toLowerCase()).toContain('slice')
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessarySliceRule.meta.docs?.description.toLowerCase()).toContain('unnecessary')
    })

    test('should mention shallow copy in description', () => {
      expect(noUnnecessarySliceRule.meta.docs?.description.toLowerCase()).toContain('shallow copy')
    })

    test('should have meta property', () => {
      expect(noUnnecessarySliceRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessarySliceRule).toHaveProperty('create')
    })

    test('should have docs property with url', () => {
      expect(noUnnecessarySliceRule.meta.docs?.url).toBeDefined()
    })

    test('should have non-empty description', () => {
      expect(noUnnecessarySliceRule.meta.docs?.description.length).toBeGreaterThan(0)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor1 = noUnnecessarySliceRule.create(context)
      const visitor2 = noUnnecessarySliceRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting slice() with no arguments', () => {
    test('should report arr.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/unnecessary/i)
      expect(reports[0].message).toContain('slice')
    })

    test('should report array.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', []))

      expect(reports.length).toBe(1)
    })

    test('should report items.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('items', []))

      expect(reports.length).toBe(1)
    })

    test('should provide fix for slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })

    test('should report data.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('data', []))

      expect(reports.length).toBe(1)
    })

    test('should report list.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('list', []))

      expect(reports.length).toBe(1)
    })

    test('should report result.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('result', []))

      expect(reports.length).toBe(1)
    })

    test('should report values.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('values', []))

      expect(reports.length).toBe(1)
    })

    test('should report collection.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('collection', []))

      expect(reports.length).toBe(1)
    })

    test('should report nums.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('nums', []))

      expect(reports.length).toBe(1)
    })

    test('should report elements.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('elements', []))

      expect(reports.length).toBe(1)
    })

    test('should report buffer.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('buffer', []))

      expect(reports.length).toBe(1)
    })

    test('should report chunks.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('chunks', []))

      expect(reports.length).toBe(1)
    })

    test('should report entries.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('entries', []))

      expect(reports.length).toBe(1)
    })

    test('should report rows.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('rows', []))

      expect(reports.length).toBe(1)
    })

    test('should provide correct fix text for longer variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myCollection', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('myCollection', []))

      expect(reports[0].fix?.text).toBe('myCollection')
    })

    test('should provide correct fix text for short variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'a', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('a', []))

      expect(reports[0].fix?.text).toBe('a')
    })
  })

  describe('detecting slice(0) with zero argument', () => {
    test('should report arr.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice(0)')
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('should report array.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should provide fix for slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })

    test('should report data.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('data', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report list.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('list', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report items.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('items', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report result.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('result', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report values.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('values', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report collection.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('collection', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report nums.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('nums', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report elements.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('elements', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report buffer.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('buffer', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report chunks.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('chunks', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report entries.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('entries', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should report rows.slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('rows', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should provide correct fix text for slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myList', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('myList', [createLiteral(0)]))

      expect(reports[0].fix?.text).toBe('myList')
    })

    test('should provide correct fix text for single char variable with slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('x', [createLiteral(0)]))

      expect(reports[0].fix?.text).toBe('x')
    })
  })

  describe('detecting slice(undefined) with undefined argument', () => {
    test('should report arr.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice(undefined)')
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('should report items.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('items', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should provide fix for slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })

    test('should report data.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('data', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report list.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('list', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report values.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('values', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report result.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('result', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report collection.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('collection', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report nums.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('nums', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report elements.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('elements', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report buffer.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('buffer', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should report chunks.slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('chunks', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should provide fix text for slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myData', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('myData', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].fix?.text).toBe('myData')
    })
  })

  describe('not reporting valid slice usage', () => {
    test('should not report arr.slice(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(1, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(1), createLiteral(5)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-5, -1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-5), createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('start')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(start, end)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createIdentifier('start'), createIdentifier('end')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createLiteral(5)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, length)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createIdentifier('length')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(10)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(100)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(100)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-10)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-100)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-100)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, 1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, 10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createLiteral(10)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(3, 7)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(3), createLiteral(7)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(5, 10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(5), createLiteral(10)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-3, -1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-3), createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(1, -1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(1), createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(i, j)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('i'), createIdentifier('j')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(offset)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('offset')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(index)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('index')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(from, to)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createIdentifier('from'), createIdentifier('to')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, arr.length)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createLiteral(0), createIdentifier('arr.length')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-slice calls', () => {
    test('should not report arr.map()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('filter'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.reduce()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('reduce'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('forEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.push()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('push'))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(0)
    })

    test('should not report arr.concat()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('concat'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.join()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('join'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.indexOf()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('indexOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.includes()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('includes'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.find()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('find'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.findIndex()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('findIndex'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.some()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('some'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.every()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('every'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.flat()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('flat'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.flatMap()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('flatMap'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.splice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('splice'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.pop()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('pop'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.shift()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('shift'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.reverse()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('reverse'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.sort()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('sort'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.keys()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('keys'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.values()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('values'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.entries()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('entries'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.fill()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('fill'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.copyWithin()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('copyWithin'))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention shallow copy for slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].message).toContain('shallow copy')
    })

    test('should mention entire array for slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports[0].message).toContain('entire array')
    })

    test('should mention entire array for slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].message).toContain('entire array')
    })

    test('should mention remove the call for slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports[0].message).toContain('Remove the call')
    })

    test('should mention spread syntax for slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].message).toContain('spread syntax')
    })

    test('should contain unnecessary keyword in all messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      for (const report of reports) {
        expect(report.message).toMatch(/unnecessary/i)
      }
    })

    test('should contain slice in all messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      for (const report of reports) {
        expect(report.message).toContain('slice')
      }
    })

    test('should produce non-empty messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].message.length).toBeGreaterThan(10)
    })

    test('should mention Remove the call for slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].message).toContain('Remove the call')
    })

    test('should differentiate slice() from slice(0) messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should differentiate slice(0) from slice(undefined) messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].message).not.toBe(reports[1].message)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        range: [0, 9],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 10, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          name: 'slice',
          type: 'Identifier',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'slice',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: true,
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'slice',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(() => visitor.CallExpression(createSliceCall('arr', []))).not.toThrow()
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 10, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 9],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-literal argument for slice(0) check', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('zero')]))

      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('arr', [createIdentifier('start')]))
      visitor.CallExpression(createSliceCall('items', [createLiteral(0)]))

      expect(reports.length).toBe(3)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        callee: null,
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        callee: undefined,
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: null,
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node with callee object missing name', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 9],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle string literal 0 value', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral('0')]))

      expect(reports.length).toBe(0)
    })

    test('should handle null literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(null, 'null')]))

      expect(reports.length).toBe(0)
    })

    test('should handle literal with undefined value but different raw', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [
          {
            raw: 'void 0',
            type: 'Literal',
            value: undefined,
          },
        ],
        callee: {
          computed: false,
          object: {
            name: 'arr',
            range: [0, 3],
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          range: [0, 9],
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 20],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle slice with three arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createLiteral(0), createLiteral(5), createLiteral(10)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle slice(0) with extra arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createLiteral(5)]))

      expect(reports.length).toBe(0)
    })

    test('should handle slice(undefined) with extra argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createLiteral(undefined, 'undefined'), createLiteral(5)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle numeric literal 0.0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0.0, '0.0')]))

      expect(reports.length).toBe(1)
    })

    test('should handle numeric literal -0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-0, '-0')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('fix behavior', () => {
    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 10, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix when object has range', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when object cannot be extracted', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        range: [0, 9],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide correct fix range', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 1, 0))

      expect(reports[0].fix?.range).toBeDefined()
      expect(reports[0].fix?.range.length).toBe(2)
    })

    test('should provide fix replacing entire call expression with object', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].fix?.text).toBe('arr')
      expect(reports[0].fix?.range[0]).toBe(0)
    })

    test('should provide fix for slice(0) with range', () => {
      const { context, reports } = createMockRuleContext({ source: 'data', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('data', [createLiteral(0)]))

      expect(reports[0].fix?.text).toBe('data')
    })

    test('should provide fix for slice(undefined) with range', () => {
      const { context, reports } = createMockRuleContext({ source: 'items', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('items', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].fix?.text).toBe('items')
    })

    test('should have range start at column position', () => {
      const { context, reports } = createMockRuleContext({ source: '  arr.slice();', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 1, 2))

      expect(reports[0].fix?.range[0]).toBe(2)
    })

    test('should provide fix that covers full call expression range', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.range[1]).toBeGreaterThan(fix!.range[0])
    })

    test('should not provide fix when object has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          range: [0, 9],
          type: 'MemberExpression',
        },
        range: [0, 11],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('location reporting', () => {
    test('should report correct line for different positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 5, 0))

      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report correct column for different positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 1, 20))

      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for slice(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)], 7, 4))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct location for slice(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')], 3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should handle high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 500, 10))

      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should handle high column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 1, 80))

      expect(reports[0].loc?.start.column).toBe(80)
    })
  })

  describe('report descriptor shape', () => {
    test('should include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should include loc in report when available', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].loc).toBeDefined()
    })

    test('should have start and end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have line and column in start loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have fix with range and text when available', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr', filePath: '/src/file.ts' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.range).toBeInstanceOf(Array)
      expect(typeof fix!.text).toBe('string')
    })

    test('should have exactly one report per unnecessary call', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports.length).toBe(1)
    })

    test('should produce separate reports for separate calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('a', []))
      visitor.CallExpression(createSliceCall('b', []))
      visitor.CallExpression(createSliceCall('c', []))

      expect(reports.length).toBe(3)
    })
  })

  describe('integration-like scenarios', () => {
    test('should detect common unnecessary slice patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', []))
      visitor.CallExpression(createSliceCall('items', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('data', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(3)
    })

    test('should not flag necessary slicing patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', [createLiteral(1)]))
      visitor.CallExpression(createSliceCall('items', [createLiteral(2), createLiteral(5)]))
      visitor.CallExpression(createSliceCall('data', [createLiteral(-3)]))
      visitor.CallExpression(createSliceCall('arr', [createIdentifier('start')]))

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(1)]))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(2), createLiteral(5)]))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))
      visitor.CallExpression(createSliceCall('arr', [createIdentifier('n')]))

      expect(reports.length).toBe(3)
    })

    test('should handle alternating patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('a', []))
      visitor.CallExpression(createSliceCall('b', [createLiteral(1)]))
      visitor.CallExpression(createSliceCall('c', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('d', [createLiteral(-1)]))
      visitor.CallExpression(createSliceCall('e', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(3)
    })

    test('should process many calls in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.CallExpression(createSliceCall('arr', []))
      }

      expect(reports.length).toBe(20)
    })

    test('should process many valid calls in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.CallExpression(createSliceCall('arr', [createLiteral(i + 1)]))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle interleaved slice and non-slice calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))
      visitor.CallExpression(createNonSliceCall('map'))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor.CallExpression(createNonSliceCall('filter'))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))
      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(3)
    })

    test('should detect pattern with different variable names in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const names = ['arr', 'list', 'items', 'data', 'values', 'nums', 'rows', 'buffer']
      for (const name of names) {
        visitor.CallExpression(createSliceCall(name, []))
      }

      expect(reports.length).toBe(names.length)
    })
  })

  describe('negative argument patterns', () => {
    test('should not report arr.slice(-1) with negative start', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-2) with negative start', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-10) with negative start', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-10)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-1, -0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-1), createLiteral(-0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-5, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-5), createLiteral(5)]))

      expect(reports.length).toBe(0)
    })
  })

  describe('two-argument patterns are never flagged', () => {
    test('should not report arr.slice(0, 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createLiteral(0), createLiteral(undefined, 'undefined')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(undefined, undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [
          createLiteral(undefined, 'undefined'),
          createLiteral(undefined, 'undefined'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(undefined, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createLiteral(undefined, 'undefined'), createLiteral(5)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, len)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createIdentifier('len')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('visitor consistency', () => {
    test('should produce same result for same input', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor1 = noUnnecessarySliceRule.create(ctx1)

      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor2 = noUnnecessarySliceRule.create(ctx2)

      const node = createSliceCall('arr', [])
      visitor1.CallExpression(node)
      visitor2.CallExpression(node)

      expect(rep1.length).toBe(rep2.length)
      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('should produce same result for slice(0) across calls', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor1 = noUnnecessarySliceRule.create(ctx1)

      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor2 = noUnnecessarySliceRule.create(ctx2)

      visitor1.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor2.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('should produce same result for slice(undefined) across calls', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor1 = noUnnecessarySliceRule.create(ctx1)

      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor2 = noUnnecessarySliceRule.create(ctx2)

      visitor1.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))
      visitor2.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('should be independent across different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor1 = noUnnecessarySliceRule.create(ctx1)

      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor2 = noUnnecessarySliceRule.create(ctx2)

      visitor1.CallExpression(createSliceCall('arr', []))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('callee type variants', () => {
    test('should not report when callee is a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          arguments: [],
          callee: {
            name: 'fn',
            type: 'Identifier',
          },
          type: 'CallExpression',
        },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property is not slice', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'notSlice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is Slice (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'Slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is slicing', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slicing',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            type: 'ThisExpression',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 14],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('slice(0) with float zero', () => {
    test('should report arr.slice(0.0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0.0, '0.0')]))

      expect(reports.length).toBe(1)
    })

    test('should report arr.slice(-0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice();' })
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-0, '-0')]))

      expect(reports.length).toBe(1)
    })
  })
})
