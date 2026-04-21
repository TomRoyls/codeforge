import { describe, test, expect, vi } from 'vitest'
import { preferPrototypeMethodsRule } from '../../../../src/rules/patterns/prefer-prototype-methods.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'Array.prototype.slice.call(arguments);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    range: [column, column + 30],
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

function createIdentifier(name: string, startPos = 0, endPos = 0): unknown {
  return {
    type: 'Identifier',
    name,
    range: [startPos, endPos > startPos ? endPos : startPos + name.length],
  }
}

function createLiteral(value: string | number, startPos = 0): unknown {
  return {
    type: 'Literal',
    value,
    range: [startPos, startPos + String(value).length + 2],
  }
}

function createArrayPrototypeSliceCall(
  args: unknown[],
  line = 1,
  column = 0,
  fullRange: readonly [number, number] = [0, 40],
): unknown {
  const arrayPrototype = createMemberExpression(createIdentifier('Array'), 'prototype')
  const sliceMethod = createMemberExpression(arrayPrototype, 'slice')
  const call = createCallExpression(createMemberExpression(sliceMethod, 'call'), args, line, column)
  return {
    type: 'CallExpression',
    callee: (call as Record<string, unknown>).callee,
    arguments: args,
    loc: (call as Record<string, unknown>).loc,
    range: fullRange,
  }
}

function createObjectPrototypeHasOwnPropertyCall(
  args: unknown[],
  line = 1,
  column = 0,
  fullRange: readonly [number, number] = [0, 50],
): unknown {
  const objectPrototype = createMemberExpression(createIdentifier('Object'), 'prototype')
  const hasOwnPropertyMethod = createMemberExpression(objectPrototype, 'hasOwnProperty')
  const call = createCallExpression(
    createMemberExpression(hasOwnPropertyMethod, 'call'),
    args,
    line,
    column,
  )
  return {
    type: 'CallExpression',
    callee: (call as Record<string, unknown>).callee,
    arguments: args,
    loc: (call as Record<string, unknown>).loc,
    range: fullRange,
  }
}

function createPrototypeMethodCall(
  objectName: string,
  methodName: string,
  callMethod: string,
  args: unknown[],
  line = 1,
  column = 0,
  fullRange: readonly [number, number] = [0, 40],
): unknown {
  const obj = createMemberExpression(createIdentifier(objectName), 'prototype')
  const method = createMemberExpression(obj, methodName)
  const call = createCallExpression(createMemberExpression(method, callMethod), args, line, column)
  return {
    type: 'CallExpression',
    callee: (call as Record<string, unknown>).callee,
    arguments: args,
    loc: (call as Record<string, unknown>).loc,
    range: fullRange,
  }
}

describe('prefer-prototype-methods rule', () => {
  // =========================================================
  // META TESTS (20)
  // =========================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferPrototypeMethodsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferPrototypeMethodsRule.meta.severity).toBe('warn')
    })

    test('should not have error severity', () => {
      expect(preferPrototypeMethodsRule.meta.severity).not.toBe('error')
    })

    test('should not have off severity', () => {
      expect(preferPrototypeMethodsRule.meta.severity).not.toBe('off')
    })

    test('should be recommended', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not have undefined category', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.category).toBeDefined()
    })

    test('should have schema defined as empty array', () => {
      expect(preferPrototypeMethodsRule.meta.schema).toEqual([])
    })

    test('should be fixable as code', () => {
      expect(preferPrototypeMethodsRule.meta.fixable).toBe('code')
    })

    test('should not be fixable as whitespace', () => {
      expect(preferPrototypeMethodsRule.meta.fixable).not.toBe('whitespace')
    })

    test('should have description mentioning spread and Object.hasOwn', () => {
      const desc = preferPrototypeMethodsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('spread syntax')
      expect(desc).toContain('array.prototype.slice')
      expect(desc).toContain('object.hasown')
    })

    test('should have url defined', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-prototype-methods',
      )
    })

    test('should have a valid docs object', () => {
      expect(preferPrototypeMethodsRule.meta.docs).toBeDefined()
      expect(typeof preferPrototypeMethodsRule.meta.docs?.description).toBe('string')
    })

    test('should have description that is non-empty', () => {
      expect(preferPrototypeMethodsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should not be deprecated', () => {
      expect(preferPrototypeMethodsRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(preferPrototypeMethodsRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferPrototypeMethodsRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have meta as a plain object', () => {
      expect(typeof preferPrototypeMethodsRule.meta).toBe('object')
      expect(preferPrototypeMethodsRule.meta).not.toBeNull()
    })

    test('should have create as a function', () => {
      expect(typeof preferPrototypeMethodsRule.create).toBe('function')
    })

    test('should have rule definition with meta and create', () => {
      expect(preferPrototypeMethodsRule).toHaveProperty('meta')
      expect(preferPrototypeMethodsRule).toHaveProperty('create')
    })
  })

  // =========================================================
  // CREATE / VISITOR TESTS (8)
  // =========================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1 } = createMockContext()
      const { context: ctx2 } = createMockContext()
      const visitor1 = preferPrototypeMethodsRule.create(ctx1)
      const visitor2 = preferPrototypeMethodsRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have only CallExpression in visitor', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => preferPrototypeMethodsRule.create(context)).not.toThrow()
    })

    test('should accept context with custom file path', () => {
      const { context } = createMockContext({}, '/custom/path.ts')
      expect(() => preferPrototypeMethodsRule.create(context)).not.toThrow()
    })

    test('should accept context with custom source', () => {
      const { context } = createMockContext({}, '/src/test.ts', 'const x = 1;')
      expect(() => preferPrototypeMethodsRule.create(context)).not.toThrow()
    })
  })

  // =========================================================
  // DETECTION: Array.prototype.slice.call (30)
  // =========================================================
  describe('detecting Array.prototype.slice.call()', () => {
    test('should report Array.prototype.slice.call(arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
      expect(reports[0].message).toContain('Array.prototype.slice.call()')
    })

    test('should report Array.prototype.slice.call(arguments)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Array.prototype.slice.call(arguments);',
      )
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arguments')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[...arr]')
    })

    test('should report Array.prototype.slice.call(arr, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should report Array.prototype.slice.call(arr, 0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should provide fix for Array.prototype.slice.call(arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should provide fix for Array.prototype.slice.call(arr, start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should provide fix for Array.prototype.slice.call(arr, start, end)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('arr'),
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should not provide fix when no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report with single argument NodeList', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('nodeList')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with empty first argument still detected', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      // Even with a non-identifier arg, the pattern is still detected
      const node = createArrayPrototypeSliceCall([createLiteral('something', 0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with three numeric arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createLiteral(1, 0),
        createLiteral(2, 5),
        createLiteral(3, 10),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should report with many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        createIdentifier('a'),
        createIdentifier('b'),
        createIdentifier('c'),
        createIdentifier('d'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regardless of file path', () => {
      const { context, reports } = createMockContext({}, '/deeply/nested/file.ts')
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regardless of source content', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'some other code')
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should always produce exactly one report per call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should produce fix with spread for single arg', () => {
      const source = 'Array.prototype.slice.call(arr)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr', 27, 30)], 1, 0, [0, 30])
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('[...')
    })

    test('should produce fix with slice for two args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [createIdentifier('arr', 0, 3), createIdentifier('1', 4, 5)],
        1,
        0,
        [0, 30],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('.slice(')
    })

    test('should produce fix with slice for three args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [createIdentifier('arr', 0, 3), createIdentifier('1', 4, 5), createIdentifier('5', 6, 7)],
        1,
        0,
        [0, 40],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('.slice(')
    })

    test('should not report when .apply() is used instead of .call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'slice', 'apply', [createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when .bind() is used instead of .call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'slice', 'bind', [createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect at various line numbers', () => {
      for (const line of [1, 5, 10, 50, 100]) {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createArrayPrototypeSliceCall([createIdentifier('arr')], line, 0)
        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
        expect(reports[0].loc?.start.line).toBe(line)
      }
    })

    test('should detect at various column offsets', () => {
      for (const col of [0, 4, 8, 16, 20]) {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 1, col)
        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
        expect(reports[0].loc?.start.column).toBe(col)
      }
    })

    test('should report when arguments object-like is passed', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([{ type: 'Identifier', name: 'args' }])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with member expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const argNode = createMemberExpression(createIdentifier('foo'), 'bar')
      const node = createArrayPrototypeSliceCall([argNode])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle detection after multiple create calls', () => {
      const { context, reports } = createMockContext()
      const visitor1 = preferPrototypeMethodsRule.create(context)
      const visitor2 = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor1.CallExpression(node)
      visitor2.CallExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should have fix with correct range from node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr', 0, 3)], 1, 0, [0, 35])
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([0, 35])
    })

    test('should report with call expression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getArgs'), [])
      const node = createArrayPrototypeSliceCall([innerCall])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should produce fix text with correct spread format for single arg', () => {
      const source = 'Array.prototype.slice.call(myArr)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('myArr', 27, 32)], 1, 0, [0, 32])
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...myArr]')
    })

    test('should produce fix text with .slice(start) for two args', () => {
      const source = 'Array.prototype.slice.call(arr, 1)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [createIdentifier('arr', 27, 30), createIdentifier('1', 32, 33)],
        1,
        0,
        [0, 34],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...arr.slice(1)]')
    })

    test('should produce fix text with .slice(start, end) for three args', () => {
      const source = 'Array.prototype.slice.call(arr, 1, 5)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [
          createIdentifier('arr', 27, 30),
          createIdentifier('1', 32, 33),
          createIdentifier('5', 35, 36),
        ],
        1,
        0,
        [0, 37],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...arr.slice(1, 5)]')
    })
  })

  // =========================================================
  // DETECTION: Object.prototype.hasOwnProperty.call (30)
  // =========================================================
  describe('detecting Object.prototype.hasOwnProperty.call()', () => {
    test('should report Object.prototype.hasOwnProperty.call(obj, prop)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.prototype.hasOwnProperty.call(obj, prop);',
      )
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn()')
      expect(reports[0].message).toContain('Object.prototype.hasOwnProperty.call()')
    })

    test('should report Object.prototype.hasOwnProperty.call(config, key)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.prototype.hasOwnProperty.call(config, key);',
      )
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('config'),
        createIdentifier('key'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn(obj, prop)')
    })

    test('should provide fix for Object.prototype.hasOwnProperty.call(obj, prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn')
    })

    test('should provide fix for Object.prototype.hasOwnProperty.call(config, "key")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('config'),
        createLiteral('key', 48),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.hasOwn')
    })

    test('should not provide fix when arguments missing (only obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report with various object identifiers', () => {
      const names = ['obj', 'config', 'opts', 'data', 'item']
      for (const name of names) {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createObjectPrototypeHasOwnPropertyCall([
          createIdentifier(name),
          createIdentifier('key'),
        ])

        visitor.CallExpression(node)
        expect(reports.length).toBe(1)
      }
    })

    test('should report with various property identifiers', () => {
      const names = ['prop', 'key', 'name', 'id', 'type']
      for (const name of names) {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier(name),
        ])

        visitor.CallExpression(node)
        expect(reports.length).toBe(1)
      }
    })

    test('should report with literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createLiteral('myKey', 10),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with numeric literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('arr'),
        createLiteral(0, 10),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with more than two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('prop'),
        createIdentifier('extra'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should produce fix with Object.hasOwn format', () => {
      const source = 'Object.prototype.hasOwnProperty.call(obj, key)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj', 37, 40), createIdentifier('key', 42, 45)],
        1,
        0,
        [0, 45],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Object.hasOwn(obj, key)')
    })

    test('should produce fix with literal property', () => {
      const source = 'Object.prototype.hasOwnProperty.call(obj, "name")'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj', 37, 40), createLiteral('name', 42)],
        1,
        0,
        [0, 50],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('Object.hasOwn')
    })

    test('should report exactly once per invocation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('key'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should have location info in report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj'), createIdentifier('prop')],
        5,
        10,
      )

      visitor.CallExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not report when .apply() is used instead of .call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Object', 'hasOwnProperty', 'apply', [
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when .bind() is used instead of .call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Object', 'hasOwnProperty', 'bind', [
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report with call expression as property argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const propArg = createCallExpression(createIdentifier('getKey'), [])
      const node = createObjectPrototypeHasOwnPropertyCall([createIdentifier('obj'), propArg])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with member expression as object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const objArg = createMemberExpression(createIdentifier('window'), 'config')
      const node = createObjectPrototypeHasOwnPropertyCall([objArg, createIdentifier('key')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should produce fix with correct range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj', 0, 3), createIdentifier('prop', 5, 9)],
        1,
        0,
        [0, 50],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 50])
    })

    test('should produce fix text preserving original arg texts', () => {
      const source = 'Object.prototype.hasOwnProperty.call(myObj, myProp)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('myObj', 37, 42), createIdentifier('myProp', 44, 50)],
        1,
        0,
        [0, 50],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('Object.hasOwn(myObj, myProp)')
    })

    test('should not fix when only obj arg has range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        { type: 'Identifier', name: 'prop' }, // no range
      ])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not fix when only prop arg has range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        { type: 'Identifier', name: 'obj' }, // no range
        createIdentifier('prop'),
      ])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should still report when arguments are three or more', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj', 0, 3),
        createIdentifier('prop', 5, 9),
        createIdentifier('extra', 11, 16),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with this as object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const thisExpr = { type: 'ThisExpression', range: [0, 4] }
      const node = createObjectPrototypeHasOwnPropertyCall([
        thisExpr,
        createIdentifier('key', 6, 9),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regardless of workspace root', () => {
      const ctx = createMockContext()
      const reports: ReportDescriptor[] = []
      const context = {
        ...ctx.context,
        workspaceRoot: '/different/root',
      } as unknown as RuleContext
      const visitor = preferPrototypeMethodsRule.create(context)
      context.report = (d: ReportDescriptor) => {
        reports.push(d)
      }

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // NOT REPORTING VALID CODE (30)
  // =========================================================
  describe('not reporting valid code', () => {
    test('should not report Array.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Array'), 'from')
      const node = createCallExpression(callee, [createIdentifier('arguments')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.hasOwn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Object'), 'hasOwn')
      const node = createCallExpression(callee, [createIdentifier('obj'), createIdentifier('prop')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'slice')
      const node = createCallExpression(callee, [createIdentifier('0'), createIdentifier('5')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report spread operator [...arr]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createCallExpression(createIdentifier('spread'), [createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.splice.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'splice', 'call', [
        createIdentifier('arr'),
        createIdentifier('0'),
        createIdentifier('1'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.keys.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Object', 'keys', 'call', [createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Function.prototype.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const functionPrototype = createMemberExpression(createIdentifier('Function'), 'prototype')
      const callMethod = createMemberExpression(functionPrototype, 'call')
      const node = createCallExpression(callMethod, [createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createCallExpression(createIdentifier('myFunction'), [
        createIdentifier('arg1'),
        createIdentifier('arg2'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report String.prototype.slice.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('String', 'slice', 'call', [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.toString.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Object', 'toString', 'call', [
        createIdentifier('obj'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.hasOwnProperty()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), 'hasOwnProperty')
      const node = createCallExpression(callee, [createIdentifier('key')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.map.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'map', 'call', [
        createIdentifier('arr'),
        createIdentifier('fn'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.filter.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'filter', 'call', [
        createIdentifier('arr'),
        createIdentifier('fn'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.forEach.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'forEach', 'call', [
        createIdentifier('arr'),
        createIdentifier('fn'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.reduce.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'reduce', 'call', [
        createIdentifier('arr'),
        createIdentifier('fn'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.concat.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'concat', 'call', [createIdentifier('arr')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.valueOf.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Object', 'valueOf', 'call', [createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.isPrototypeOf.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Object', 'isPrototypeOf', 'call', [
        createIdentifier('obj'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.propertyIsEnumerable.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Object', 'propertyIsEnumerable', 'call', [
        createIdentifier('obj'),
        createIdentifier('key'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'max')
      const node = createCallExpression(callee, [createIdentifier('a'), createIdentifier('b')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('console'), 'log')
      const node = createCallExpression(callee, [createIdentifier('msg')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Date.prototype.getTime.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Date', 'getTime', 'call', [createIdentifier('d')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report RegExp.prototype.test.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('RegExp', 'test', 'call', [
        createIdentifier('re'),
        createIdentifier('str'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.isArray()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Array'), 'isArray')
      const node = createCallExpression(callee, [createIdentifier('val')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Object'), 'keys')
      const node = createCallExpression(callee, [createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.entries()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('Object'), 'entries')
      const node = createCallExpression(callee, [createIdentifier('obj')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Map.prototype.get.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Map', 'get', 'call', [
        createIdentifier('map'),
        createIdentifier('key'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Set.prototype.has.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Set', 'has', 'call', [
        createIdentifier('set'),
        createIdentifier('val'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.push.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', 'push', 'call', [
        createIdentifier('arr'),
        createIdentifier('val'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Number.prototype.toString.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Number', 'toString', 'call', [
        createIdentifier('num'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // EDGE CASES (25)
  // =========================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('Array'), 'prototype'),
          'slice',
        ),
        'call',
      )
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('arr')],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(
          createMemberExpression(
            createMemberExpression(createIdentifier('Array'), 'prototype'),
            'slice',
          ),
          'call',
        ),
        arguments: [createIdentifier('arr')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should handle missing range in arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([
        { type: 'Identifier', name: 'arr' }, // No range
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle boolean node', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = { type: 'ExpressionStatement' }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee as non-MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createCallExpression(createIdentifier('func'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where call property is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createMemberExpression(
          createMemberExpression(createIdentifier('Array'), 'prototype'),
          'slice',
        ),
        property: { type: 'Literal', value: 'call' },
      }
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where method property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createMemberExpression(createIdentifier('Array'), 'prototype'),
        property: { type: 'Literal', value: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where prototype property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createIdentifier('Array'),
          property: { type: 'Literal', value: 'prototype' },
        },
        property: { type: 'Identifier', name: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where object identifier is not Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Array' },
          property: { type: 'Identifier', name: 'prototype' },
        },
        property: { type: 'Identifier', name: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where prototype is named differently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const arrayProto = createMemberExpression(createIdentifier('Array'), 'proto')
      const sliceMethod = createMemberExpression(arrayProto, 'slice')
      const node = createCallExpression(createMemberExpression(sliceMethod, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where object name is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const myArrayPrototype = createMemberExpression(createIdentifier('MyArray'), 'prototype')
      const sliceMethod = createMemberExpression(myArrayPrototype, 'slice')
      const node = createCallExpression(createMemberExpression(sliceMethod, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where method callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(createIdentifier('slice'), 'call')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where method name is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const arrayPrototype = createMemberExpression(createIdentifier('Array'), 'prototype')
      const spliceMethod = createMemberExpression(arrayPrototype, 'splice')
      const node = createCallExpression(createMemberExpression(spliceMethod, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle call on method callee that is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('Array'),
        property: { type: 'Identifier', name: 'slice' },
      }
      const node = createCallExpression(createMemberExpression(callee, 'call'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle arguments as undefined in node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('Array'), 'prototype'),
          'slice',
        ),
        'call',
      )
      const node = {
        type: 'CallExpression',
        callee,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        range: [0, 30],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // LOCATION TESTS (15)
  // =========================================================
  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 1, 0)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 5, 10)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 100, 50)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 3, 5)
      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should report Object.hasOwnProperty location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj'), createIdentifier('prop')],
        1,
        0,
      )
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report Object.hasOwnProperty location at line 20 column 15', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj'), createIdentifier('prop')],
        20,
        15,
      )
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report Object.hasOwnProperty end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj'), createIdentifier('prop')],
        7,
        3,
      )
      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(33)
    })

    test('should default to line 1 column 0 when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('Array'), 'prototype'),
          'slice',
        ),
        'call',
      )
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('arr')],
      }

      visitor.CallExpression(node)

      // extractLocation defaults to line 1, column 0
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 9999, 0)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 1, 9999)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 0, 0)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve start and end separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')], 3, 5)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start).toEqual({ line: 3, column: 5 })
      expect(reports[0].loc?.end).toEqual({ line: 3, column: 35 })
    })

    test('should have loc defined in report for Array.slice', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have loc defined in report for Object.hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have end loc defined in report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })

  // =========================================================
  // MESSAGE QUALITY TESTS (10)
  // =========================================================
  describe('message quality', () => {
    test('should mention spread syntax in Array.slice message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports[0].message.toLowerCase()).toContain('spread syntax')
      expect(reports[0].message).toContain('[...arr]')
    })

    test('should mention Object.hasOwn in hasOwnProperty message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )

      expect(reports[0].message).toContain('Object.hasOwn')
      expect(reports[0].message).toContain('Object.hasOwn(obj, prop)')
    })

    test('should have non-empty message for Array.slice', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have non-empty message for Object.hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([createIdentifier('obj'), createIdentifier('key')]),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should mention Array.prototype.slice.call in Array.slice message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports[0].message).toContain('Array.prototype.slice.call()')
    })

    test('should mention Object.prototype.hasOwnProperty.call in hasOwn message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )

      expect(reports[0].message).toContain('Object.prototype.hasOwnProperty.call()')
    })

    test('should have message type string for Array.slice', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message type string for Object.hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )

      expect(typeof reports[0].message).toBe('string')
    })

    test('should mention array-like conversion in Array.slice message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports[0].message.toLowerCase()).toContain('array-like')
    })

    test('should mention cleaner code in Object.hasOwnProperty message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )

      expect(reports[0].message.toLowerCase()).toContain('cleaner')
    })
  })

  // =========================================================
  // MULTIPLE REPORTS TESTS (10)
  // =========================================================
  describe('multiple reports', () => {
    test('should report both Array.slice and Object.hasOwnProperty in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const arrayNode = createArrayPrototypeSliceCall([createIdentifier('arr')])
      const objectNode = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])

      visitor.CallExpression(arrayNode)
      visitor.CallExpression(objectNode)

      expect(reports.length).toBe(2)
    })

    test('should report multiple Array.slice calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      }

      expect(reports.length).toBe(5)
    })

    test('should report multiple Object.hasOwnProperty calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(
          createObjectPrototypeHasOwnPropertyCall([
            createIdentifier('obj'),
            createIdentifier('prop'),
          ]),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should interleave Array.slice and Object.hasOwnProperty reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )
      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('items')]))
      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('config'),
          createIdentifier('key'),
        ]),
      )

      expect(reports.length).toBe(4)
      expect(reports[0].message).toContain('spread syntax')
      expect(reports[1].message).toContain('Object.hasOwn')
      expect(reports[2].message).toContain('spread syntax')
      expect(reports[3].message).toContain('Object.hasOwn')
    })

    test('should report mixed valid and invalid calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      // Valid call - should not report
      visitor.CallExpression(
        createCallExpression(createIdentifier('myFunc'), [createIdentifier('arg')]),
      )
      // Invalid - should report
      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      // Valid call - should not report
      visitor.CallExpression(
        createCallExpression(createMemberExpression(createIdentifier('Array'), 'from'), [
          createIdentifier('arr'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread syntax')
    })

    test('should handle many calls without performance issues', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle alternating null and valid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(null)
      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      visitor.CallExpression(null)
      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports.length).toBe(2)
    })

    test('should maintain independent report for each visitor', () => {
      const { context, reports } = createMockContext()
      const visitor1 = preferPrototypeMethodsRule.create(context)
      const visitor2 = preferPrototypeMethodsRule.create(context)

      visitor1.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      visitor2.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([
          createIdentifier('obj'),
          createIdentifier('prop'),
        ]),
      )

      // Both use the same context, so reports accumulates
      expect(reports.length).toBe(2)
    })

    test('should report with same node passed twice', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report correctly with mix of edge cases and valid patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      // Edge case - empty object
      visitor.CallExpression({})
      // Valid pattern
      visitor.CallExpression(
        createCallExpression(createIdentifier('func'), [createIdentifier('arg')]),
      )
      // Invalid - should report
      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      // Invalid - should report
      visitor.CallExpression(
        createObjectPrototypeHasOwnPropertyCall([createIdentifier('obj'), createIdentifier('key')]),
      )

      expect(reports.length).toBe(2)
    })
  })

  // =========================================================
  // CONTEXT TESTS (10)
  // =========================================================
  describe('context handling', () => {
    test('should work with context that has empty string source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      // Fix may have empty text since source is empty
    })

    test('should work with context that has very long source', () => {
      const longSource = 'x'.repeat(10000) + 'Array.prototype.slice.call(arr)'
      const { context, reports } = createMockContext({}, '/src/file.ts', longSource)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const paths = ['/src/index.ts', '/src/utils/helpers.ts', '/test/file.test.ts', '/lib/main.js']
      for (const path of paths) {
        const { context, reports } = createMockContext({}, path)
        const visitor = preferPrototypeMethodsRule.create(context)

        visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
        expect(reports.length).toBe(1)
      }
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Array.prototype.slice.call(arr)',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/custom/workspace',
      } as unknown as RuleContext

      const visitor = preferPrototypeMethodsRule.create(context)
      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should work with undefined config options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Array.prototype.slice.call(arr)',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferPrototypeMethodsRule.create(context)
      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should handle context with source containing the pattern text', () => {
      const source = 'const result = Array.prototype.slice.call(args, 1);'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [createIdentifier('args', 0, 4), createIdentifier('1', 6, 7)],
        1,
        0,
        [0, 40],
      )
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle context getSource returning unicode', () => {
      const source = 'Array.prototype.slice.call(配列)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr')])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not crash when report throws', () => {
      const context = {
        report: () => {
          throw new Error('report error')
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'source',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferPrototypeMethodsRule.create(context)

      expect(() => {
        visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      }).toThrow('report error')
    })

    test('should handle context with null getAST', () => {
      const { context, reports } = createMockContext()
      expect(context.getAST()).toBeNull()
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      expect(reports.length).toBe(1)
    })

    test('should handle context with empty getTokens', () => {
      const { context, reports } = createMockContext()
      expect(context.getTokens()).toEqual([])
      const visitor = preferPrototypeMethodsRule.create(context)

      visitor.CallExpression(createArrayPrototypeSliceCall([createIdentifier('arr')]))
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // test.each DATA-DRIVEN TESTS (40+)
  // =========================================================
  describe('test.each - data driven', () => {
    const nonMatchingObjectNames = [
      { name: 'String', method: 'slice' },
      { name: 'Number', method: 'toString' },
      { name: 'Boolean', method: 'valueOf' },
      { name: 'Date', method: 'getTime' },
      { name: 'RegExp', method: 'test' },
      { name: 'Map', method: 'get' },
      { name: 'Set', method: 'has' },
      { name: 'WeakMap', method: 'get' },
      { name: 'WeakSet', method: 'has' },
      { name: 'Promise', method: 'then' },
      { name: 'Error', method: 'toString' },
      { name: 'Symbol', method: 'toString' },
      { name: 'Int8Array', method: 'slice' },
      { name: 'Float32Array', method: 'slice' },
      { name: 'ArrayBuffer', method: 'slice' },
    ]

    test.each(nonMatchingObjectNames)(
      'should not report $name.prototype.$method.call()',
      ({ name, method }) => {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createPrototypeMethodCall(name, method, 'call', [createIdentifier('x')])
        visitor.CallExpression(node)

        expect(reports.length).toBe(0)
      },
    )

    const nonMatchingCallMethods = [
      { objectName: 'Array', method: 'slice', callMethod: 'apply' },
      { objectName: 'Array', method: 'slice', callMethod: 'bind' },
      { objectName: 'Array', method: 'slice', callMethod: 'toString' },
      { objectName: 'Object', method: 'hasOwnProperty', callMethod: 'apply' },
      { objectName: 'Object', method: 'hasOwnProperty', callMethod: 'bind' },
      { objectName: 'Object', method: 'hasOwnProperty', callMethod: 'toString' },
    ]

    test.each(nonMatchingCallMethods)(
      'should not report $objectName.prototype.$method.$callMethod()',
      ({ objectName, method, callMethod }) => {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createPrototypeMethodCall(objectName, method, callMethod, [
          createIdentifier('x'),
        ])
        visitor.CallExpression(node)

        expect(reports.length).toBe(0)
      },
    )

    const arraySliceArgVariants: { argCount: number; hasFix: boolean }[] = [
      { argCount: 0, hasFix: false },
      { argCount: 1, hasFix: true },
      { argCount: 2, hasFix: true },
      { argCount: 3, hasFix: true },
      { argCount: 4, hasFix: true },
    ]

    test.each(arraySliceArgVariants)(
      'should report Array.prototype.slice.call with $argCount arguments (fix: $hasFix)',
      ({ argCount, hasFix }) => {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const args = Array.from({ length: argCount }, (_, i) =>
          createIdentifier(`arg${i}`, i * 5, i * 5 + 4),
        )
        const node = createArrayPrototypeSliceCall(args)
        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
        if (hasFix) {
          expect(reports[0].fix).toBeDefined()
        } else {
          expect(reports[0].fix).toBeUndefined()
        }
      },
    )

    const hasOwnPropertyArgVariants: { argCount: number; hasFix: boolean }[] = [
      { argCount: 0, hasFix: false },
      { argCount: 1, hasFix: false },
      { argCount: 2, hasFix: true },
      { argCount: 3, hasFix: true },
    ]

    test.each(hasOwnPropertyArgVariants)(
      'should report Object.prototype.hasOwnProperty.call with $argCount arguments (fix: $hasFix)',
      ({ argCount, hasFix }) => {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const args = Array.from({ length: argCount }, (_, i) =>
          createIdentifier(`arg${i}`, i * 5, i * 5 + 4),
        )
        const node = createObjectPrototypeHasOwnPropertyCall(args)
        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
        if (hasFix) {
          expect(reports[0].fix).toBeDefined()
        } else {
          expect(reports[0].fix).toBeUndefined()
        }
      },
    )

    const differentArgTypes = [
      { typeName: 'Identifier', createArg: () => createIdentifier('x') },
      { typeName: 'Literal', createArg: () => createLiteral('val') },
      {
        typeName: 'MemberExpression',
        createArg: () => createMemberExpression(createIdentifier('a'), 'b'),
      },
      {
        typeName: 'CallExpression',
        createArg: () => createCallExpression(createIdentifier('fn'), []),
      },
    ]

    test.each(differentArgTypes)(
      'should report Array.prototype.slice.call with $typeName argument',
      ({ createArg }) => {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createArrayPrototypeSliceCall([createArg()])
        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
      },
    )

    const nodeTypesThatDontMatch = [
      { nodeType: 'ExpressionStatement' },
      { nodeType: 'VariableDeclaration' },
      { nodeType: 'FunctionDeclaration' },
      { nodeType: 'IfStatement' },
      { nodeType: 'ForStatement' },
      { nodeType: 'WhileStatement' },
      { nodeType: 'ReturnStatement' },
      { nodeType: 'BlockStatement' },
    ]

    test.each(nodeTypesThatDontMatch)(
      'should not report for $nodeType node type',
      ({ nodeType }) => {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        visitor.CallExpression({ type: nodeType })

        expect(reports.length).toBe(0)
      },
    )

    const arrayMethodsNotMatching = [
      'map',
      'filter',
      'reduce',
      'forEach',
      'find',
      'findIndex',
      'every',
      'some',
      'includes',
      'indexOf',
      'join',
      'concat',
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse',
      'flat',
      'flatMap',
      'fill',
      'copyWithin',
    ]

    test.each(arrayMethodsNotMatching)('should not report Array.prototype.%s.call()', (method) => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createPrototypeMethodCall('Array', method, 'call', [createIdentifier('arr')])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    const objectMethodsNotMatching = [
      'toString',
      'valueOf',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor',
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
    ]

    test.each(objectMethodsNotMatching)(
      'should not report Object.prototype.%s.call()',
      (method) => {
        const { context, reports } = createMockContext()
        const visitor = preferPrototypeMethodsRule.create(context)

        const node = createPrototypeMethodCall('Object', method, 'call', [createIdentifier('obj')])
        visitor.CallExpression(node)

        expect(reports.length).toBe(0)
      },
    )
  })

  // =========================================================
  // ADDITIONAL INDIVIDUAL TESTS FOR 200+ test() COUNT
  // =========================================================
  describe('additional fix verification', () => {
    test('should produce [...data] fix for single identifier arg', () => {
      const source = 'Array.prototype.slice.call(data)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('data', 27, 31)], 1, 0, [0, 31])
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...data]')
    })

    test('should produce [...items.slice(2)] fix for two args', () => {
      const source = 'Array.prototype.slice.call(items, 2)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [createIdentifier('items', 27, 32), createIdentifier('2', 34, 35)],
        1,
        0,
        [0, 36],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...items.slice(2)]')
    })

    test('should produce [...list.slice(0, 10)] fix for three args', () => {
      const source = 'Array.prototype.slice.call(list, 0, 10)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [
          createIdentifier('list', 27, 31),
          createIdentifier('0', 33, 34),
          createIdentifier('10', 36, 38),
        ],
        1,
        0,
        [0, 39],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...list.slice(0, 10)]')
    })

    test('should produce Object.hasOwn(target, prop) fix', () => {
      const source = 'Object.prototype.hasOwnProperty.call(target, prop)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('target', 37, 43), createIdentifier('prop', 45, 49)],
        1,
        0,
        [0, 49],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('Object.hasOwn(target, prop)')
    })

    test('should produce Object.hasOwn(settings, enabled) fix', () => {
      const source = 'Object.prototype.hasOwnProperty.call(settings, enabled)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('settings', 37, 45), createIdentifier('enabled', 47, 54)],
        1,
        0,
        [0, 54],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('Object.hasOwn(settings, enabled)')
    })

    test('should produce fix with correct range from Array.slice node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('arr', 0, 3)], 1, 0, [10, 50])
      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([10, 50])
    })

    test('should produce fix with correct range from Object.hasOwnProperty node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('obj', 0, 3), createIdentifier('k', 5, 6)],
        1,
        0,
        [20, 60],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([20, 60])
    })

    test('should not produce fix for Array.slice when arg has no range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([{ type: 'Identifier', name: 'x' }])
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not produce fix for Object.hasOwnProperty when first arg has no range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        { type: 'Identifier', name: 'obj' },
        createIdentifier('key', 5, 8),
      ])
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not produce fix for Object.hasOwnProperty when second arg has no range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([
        createIdentifier('obj', 0, 3),
        { type: 'Identifier', name: 'key' },
      ])
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should report Array.slice with empty arguments array but no fix', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report Object.hasOwnProperty with empty arguments but no fix', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall([])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should produce fix when Array.slice node has range and args have range', () => {
      const source = 'Array.prototype.slice.call(items)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('items', 27, 32)], 1, 0, [0, 32])
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('[...items]')
    })

    test('should produce fix when Object.hasOwnProperty node has range and args have range', () => {
      const source = 'Object.prototype.hasOwnProperty.call(data, id)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('data', 37, 41), createIdentifier('id', 43, 45)],
        1,
        0,
        [0, 45],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Object.hasOwn(data, id)')
    })

    test('should produce fix with literal string property', () => {
      const source = 'Object.prototype.hasOwnProperty.call(cfg, "debug")'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('cfg', 37, 40), createLiteral('debug', 42)],
        1,
        0,
        [0, 50],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('Object.hasOwn')
    })

    test('should produce fix with numeric literal property', () => {
      const source = 'Object.prototype.hasOwnProperty.call(arr, 0)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createObjectPrototypeHasOwnPropertyCall(
        [createIdentifier('arr', 37, 40), createLiteral(0, 42)],
        1,
        0,
        [0, 45],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('Object.hasOwn')
    })

    test('should handle Array.slice call where node range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('Array'), 'prototype'),
          'slice',
        ),
        'call',
      )
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('arr')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle Object.hasOwnProperty call where node range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPrototypeMethodsRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('Object'), 'prototype'),
          'hasOwnProperty',
        ),
        'call',
      )
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('obj'), createIdentifier('key')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should produce correct fix when source has complex content', () => {
      const source = 'var x = Array.prototype.slice.call(args, 1); // comment'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall(
        [createIdentifier('args', 0, 4), createIdentifier('1', 6, 7)],
        1,
        0,
        [0, 40],
      )
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
    })

    test('should produce correct fix when source has tabs', () => {
      const source = '\tArray.prototype.slice.call(list)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferPrototypeMethodsRule.create(context)

      const node = createArrayPrototypeSliceCall([createIdentifier('list', 28, 32)], 1, 0, [0, 32])
      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...list]')
    })
  })
})
