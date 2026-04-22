import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noDeprecatedApiRule } from '../../../../src/rules/security/no-deprecated-api.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
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

function createDeprecatedCall(functionName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: functionName },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMethodCall(objectName: string, methodName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNewBuffer(args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Buffer' },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberExpression(
  objectName: string,
  propertyName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: objectName },
    property: { type: 'Identifier', name: propertyName },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createSafeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'safeFunction' },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-deprecated-api rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noDeprecatedApiRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noDeprecatedApiRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noDeprecatedApiRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noDeprecatedApiRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noDeprecatedApiRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noDeprecatedApiRule.meta.docs?.description).toContain('deprecated')
    })
  })

  describe('meta expanded', () => {
    test('should have meta type as problem', () => {
      expect(noDeprecatedApiRule.meta.type).toBe('problem')
    })

    test('should have meta severity as warn', () => {
      expect(noDeprecatedApiRule.meta.severity).toBe('warn')
    })

    test('should have docs category as security', () => {
      expect(noDeprecatedApiRule.meta.docs?.category).toBe('security')
    })

    test('should have docs recommended as true', () => {
      expect(noDeprecatedApiRule.meta.docs?.recommended).toBe(true)
    })

    test('should have docs url defined', () => {
      expect(noDeprecatedApiRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url containing no-deprecated-api', () => {
      expect(noDeprecatedApiRule.meta.docs?.url).toContain('no-deprecated-api')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noDeprecatedApiRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one item', () => {
      expect(noDeprecatedApiRule.meta.schema.length).toBeGreaterThanOrEqual(1)
    })

    test('should have schema with additionalApis property', () => {
      const schema = noDeprecatedApiRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('additionalApis')
    })

    test('should have schema with ignoreApis property', () => {
      const schema = noDeprecatedApiRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('ignoreApis')
    })

    test('should have fixable set to code', () => {
      expect(noDeprecatedApiRule.meta.fixable).toBe('code')
    })

    test('should have docs description that mentions deprecated APIs', () => {
      expect(noDeprecatedApiRule.meta.docs?.description).toContain('deprecated')
    })

    test('should have docs description that mentions upgrading', () => {
      expect(noDeprecatedApiRule.meta.docs?.description).toContain('upgrading')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('NewExpression')
      expect(visitor).toHaveProperty('MemberExpression')
    })

    test('should return visitor with CallExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return visitor with NewExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('should return visitor with MemberExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('should create a new visitor per call', () => {
      const { context } = createMockContext()
      const visitor1 = noDeprecatedApiRule.create(context)
      const visitor2 = noDeprecatedApiRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should handle context with empty options', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)
      visitor.CallExpression(createDeprecatedCall('escape'))
      expect(reports.length).toBe(1)
    })
  })

  describe('escape detection', () => {
    test('should report escape() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('escape')
      expect(reports[0].message).toContain('deprecated')
    })

    test('should include reason in escape report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toContain('ECMAScript v3')
    })

    test('should include replacement in escape report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toContain('encodeURIComponent')
    })

    test('should report escape with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(1)
    })

    test('should report escape at specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('unescape detection', () => {
    test('should report unescape() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unescape')
    })

    test('should include reason in unescape report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports[0].message).toContain('ECMAScript v3')
    })

    test('should include replacement in unescape report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports[0].message).toContain('decodeURIComponent')
    })
  })

  describe('getYear detection', () => {
    test('should report date.getYear() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'getYear'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('getYear')
    })

    test('should include getFullYear replacement in getYear report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'getYear'))

      expect(reports[0].message).toContain('getFullYear')
    })

    test('should report getYear on variable named d', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('d', 'getYear'))

      expect(reports.length).toBe(1)
    })

    test('should report getYear on variable named myDate', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('myDate', 'getYear'))

      expect(reports.length).toBe(1)
    })
  })

  describe('setYear detection', () => {
    test('should report date.setYear() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'setYear'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('setYear')
    })

    test('should include setFullYear replacement in setYear report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'setYear'))

      expect(reports[0].message).toContain('setFullYear')
    })
  })

  describe('toGMTString detection', () => {
    test('should report date.toGMTString() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'toGMTString'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toGMTString')
    })

    test('should include toUTCString replacement in toGMTString report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'toGMTString'))

      expect(reports[0].message).toContain('toUTCString')
    })
  })

  describe('compile detection', () => {
    test('should report regex.compile() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('regex', 'compile'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('compile')
    })

    test('should report compile() direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('compile'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('compile')
    })

    test('should include Deprecated reason in compile report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('regex', 'compile'))

      expect(reports[0].message).toContain('Deprecated')
    })
  })

  describe('substr detection', () => {
    test('should report str.substr() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('str', 'substr'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('substr')
    })

    test('should report substr() direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('substr'))

      expect(reports.length).toBe(1)
    })

    test('should include substring replacement in substr report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('str', 'substr'))

      expect(reports[0].message).toContain('substring')
    })

    test('should include slice replacement in substr report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('str', 'substr'))

      expect(reports[0].message).toContain('slice')
    })
  })

  describe('__proto__ detection', () => {
    test('should report __proto__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__proto__')
    })

    test('should include Object.getPrototypeOf replacement in __proto__ report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))

      expect(reports[0].message).toContain('Object.getPrototypeOf')
    })

    test('should report __proto__ on any variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('myObj', '__proto__'))

      expect(reports.length).toBe(1)
    })
  })

  describe('__defineGetter__ detection', () => {
    test('should report __defineGetter__ call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__defineGetter__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineGetter__')
    })

    test('should include Object.defineProperty replacement in __defineGetter__ report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__defineGetter__'))

      expect(reports[0].message).toContain('Object.defineProperty')
    })
  })

  describe('__defineSetter__ detection', () => {
    test('should report __defineSetter__ call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__defineSetter__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineSetter__')
    })

    test('should include Object.defineProperty replacement in __defineSetter__ report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__defineSetter__'))

      expect(reports[0].message).toContain('Object.defineProperty')
    })
  })

  describe('__lookupGetter__ detection', () => {
    test('should report __lookupGetter__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__lookupGetter__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__lookupGetter__')
    })

    test('should include Object.getOwnPropertyDescriptor replacement in __lookupGetter__ report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__lookupGetter__'))

      expect(reports[0].message).toContain('Object.getOwnPropertyDescriptor')
    })
  })

  describe('__lookupSetter__ detection', () => {
    test('should report __lookupSetter__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__lookupSetter__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__lookupSetter__')
    })

    test('should include Object.getOwnPropertyDescriptor replacement in __lookupSetter__ report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__lookupSetter__'))

      expect(reports[0].message).toContain('Object.getOwnPropertyDescriptor')
    })
  })

  describe('new Buffer() detection', () => {
    test('should report new Buffer() expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Buffer')
    })

    test('should report new Buffer(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer([{ type: 'Literal', value: 10 }]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Buffer')
    })

    test('should report new Buffer("str")', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer([{ type: 'Literal', value: 'hello' }]))

      expect(reports.length).toBe(1)
    })

    test('should report new Buffer(arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer([{ type: 'Identifier', name: 'arr' }]))

      expect(reports.length).toBe(1)
    })

    test('should include Buffer.alloc and Buffer.from replacement in Buffer report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer())

      expect(reports[0].message).toContain('Buffer.alloc')
      expect(reports[0].message).toContain('Buffer.from')
    })

    test('should include Buffer.alloc and Buffer.from in reason', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer())

      expect(reports[0].message).toContain('Buffer.alloc')
      expect(reports[0].message).toContain('Buffer.from')
    })

    test('should report new Buffer at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer([], 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('safe APIs not flagged', () => {
    test('should not report safe calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createSafeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report encodeURIComponent()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('encodeURIComponent'))

      expect(reports.length).toBe(0)
    })

    test('should not report decodeURIComponent()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('decodeURIComponent'))

      expect(reports.length).toBe(0)
    })

    test('should not report substring() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('str', 'substring'))

      expect(reports.length).toBe(0)
    })

    test('should not report slice() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('str', 'slice'))

      expect(reports.length).toBe(0)
    })

    test('should not report getFullYear() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'getFullYear'))

      expect(reports.length).toBe(0)
    })

    test('should not report setFullYear() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'setFullYear'))

      expect(reports.length).toBe(0)
    })

    test('should not report toUTCString() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'toUTCString'))

      expect(reports.length).toBe(0)
    })

    test('should not report Buffer.alloc() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('Buffer', 'alloc'))

      expect(reports.length).toBe(0)
    })

    test('should not report Buffer.from() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('Buffer', 'from'))

      expect(reports.length).toBe(0)
    })

    test('should not report Object.defineProperty() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperty' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.getOwnPropertyDescriptor() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getOwnPropertyDescriptor' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.getPrototypeOf() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.setPrototypeOf() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Map() expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Set() expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('console', 'log'))

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('parseInt'))

      expect(reports.length).toBe(0)
    })

    test('should not report parseFloat() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('parseFloat'))

      expect(reports.length).toBe(0)
    })

    test('should not report Object.keys() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('Object', 'keys'))

      expect(reports.length).toBe(0)
    })

    test('should not report Array.isArray() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('Array', 'isArray'))

      expect(reports.length).toBe(0)
    })

    test('should not report fetch() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('fetch'))

      expect(reports.length).toBe(0)
    })
  })

  describe('additionalApis option', () => {
    test('should respect additionalApis option', () => {
      const { context, reports } = createMockContext({
        additionalApis: [
          { name: 'oldFunction', reason: 'Use newFunction instead', replacement: 'newFunction' },
        ],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('oldFunction'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('oldFunction')
    })

    test('should report custom API with reason', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'myOldApi', reason: 'Removed in v3.0', replacement: 'myNewApi' }],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('myOldApi'))

      expect(reports[0].message).toContain('Removed in v3.0')
    })

    test('should report custom API with replacement', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'myOldApi', reason: 'Removed', replacement: 'myNewApi' }],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('myOldApi'))

      expect(reports[0].message).toContain('myNewApi')
    })

    test('should report custom API with since field', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'legacyFn', reason: 'Old', since: 'v2.0' }],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('legacyFn'))

      expect(reports.length).toBe(1)
    })

    test('should still report built-in APIs with additionalApis set', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'oldFunction', reason: 'Use newFunction instead' }],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('escape')
    })

    test('should handle multiple additionalApis', () => {
      const { context, reports } = createMockContext({
        additionalApis: [
          { name: 'oldFn1', reason: 'Use newFn1' },
          { name: 'oldFn2', reason: 'Use newFn2' },
        ],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('oldFn1'))
      visitor.CallExpression(createDeprecatedCall('oldFn2'))

      expect(reports.length).toBe(2)
    })

    test('should not report unconfigured custom API', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'oldFunction', reason: 'Use newFunction instead' }],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('otherOldFunction'))

      expect(reports.length).toBe(0)
    })

    test('should handle additionalApis with member expression calls', () => {
      const { context, reports } = createMockContext({
        additionalApis: [
          { name: 'oldMethod', reason: 'Use newMethod instead', replacement: 'newMethod' },
        ],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('obj', 'oldMethod'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('oldMethod')
    })
  })

  describe('ignoreApis option', () => {
    test('should respect ignoreApis option', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['escape'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(0)
    })

    test('should still report non-ignored APIs', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['escape'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports.length).toBe(1)
    })

    test('should ignore unescape when specified', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['unescape'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports.length).toBe(0)
    })

    test('should ignore Buffer when specified', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['Buffer'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer())

      expect(reports.length).toBe(0)
    })

    test('should ignore multiple APIs', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['escape', 'unescape'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports.length).toBe(0)
    })

    test('should ignore getYear when specified', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['getYear'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'getYear'))

      expect(reports.length).toBe(0)
    })

    test('should ignore __proto__ when specified', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['__proto__'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))

      expect(reports.length).toBe(0)
    })

    test('should ignore compile when specified', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['compile'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('regex', 'compile'))

      expect(reports.length).toBe(0)
    })

    test('should ignore substr when specified', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['substr'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('str', 'substr'))

      expect(reports.length).toBe(0)
    })
  })

  describe('combined options', () => {
    test('should handle additionalApis + ignoreApis together', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'myOldApi', reason: 'Old', replacement: 'myNewApi' }],
        ignoreApis: ['escape'],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('myOldApi'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myOldApi')
    })

    test('should ignore custom API via ignoreApis', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'myOldApi', reason: 'Old', replacement: 'myNewApi' }],
        ignoreApis: ['myOldApi'],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('myOldApi'))

      expect(reports.length).toBe(0)
    })

    test('should still report built-in APIs not in ignoreApis', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'myOldApi', reason: 'Old' }],
        ignoreApis: ['myOldApi'],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unescape')
    })

    test('should handle both additionalApis ignored and built-in ignored', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'customOld', reason: 'Old' }],
        ignoreApis: ['customOld', 'escape'],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('customOld'))
      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unescape')
    })
  })

  describe('options edge cases', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.CallExpression(createDeprecatedCall('escape'))).not.toThrow()
    })

    test('should handle empty ignoreApis array', () => {
      const { context, reports } = createMockContext({ ignoreApis: [] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(1)
    })

    test('should handle empty additionalApis array', () => {
      const { context, reports } = createMockContext({ additionalApis: [] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(1)
    })

    test('should handle ignoreApis with unknown API name', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['nonExistent'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message format', () => {
    test('should suggest replacement in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toContain('encodeURIComponent')
    })

    test('should start message with Deprecated API used', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toMatch(/^Deprecated API used:/)
    })

    test('should include API name in quotes in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toContain("'escape'")
    })

    test('should include is deprecated in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toContain('is deprecated')
    })

    test('should include reason separated by dash', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toContain(' - ')
    })

    test('should include Use instead in replacement message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toContain("Use 'encodeURIComponent' instead.")
    })

    test('should format complete message for escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toBe(
        "Deprecated API used: 'escape' is deprecated - Deprecated in ECMAScript v3. Use 'encodeURIComponent' instead.",
      )
    })

    test('should format complete message for Buffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer())

      expect(reports[0].message).toContain("Deprecated API used: 'Buffer()' is deprecated")
    })
  })

  describe('location reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape', 5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report location for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer([], 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__proto__', 12, 4))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('multiple violations', () => {
    test('should report two different deprecated calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('unescape'))

      expect(reports.length).toBe(2)
    })

    test('should report three different deprecated calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('unescape'))
      visitor.CallExpression(createDeprecatedCall('compile'))

      expect(reports.length).toBe(3)
    })

    test('should report repeated same deprecated call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports.length).toBe(2)
    })

    test('should report mixed CallExpression and NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.NewExpression(createNewBuffer())

      expect(reports.length).toBe(2)
    })

    test('should report mixed CallExpression and MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))

      expect(reports.length).toBe(2)
    })

    test('should report five violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('unescape'))
      visitor.NewExpression(createNewBuffer())
      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))
      visitor.CallExpression(createMethodCall('date', 'getYear'))

      expect(reports.length).toBe(5)
    })

    test('should report six violations with method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('unescape'))
      visitor.CallExpression(createMethodCall('str', 'substr'))
      visitor.NewExpression(createNewBuffer())
      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))
      visitor.CallExpression(createMethodCall('date', 'setYear'))

      expect(reports.length).toBe(6)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle null node gracefully in MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.MemberExpression(null)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'escape' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle NewExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: '__proto__' },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
    })

    test('should handle node with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = { callee: { type: 'Identifier', name: 'escape' }, arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-Identifier callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Literal', value: 42 },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: '__proto__' },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'escape' },
        arguments: [],
        loc: { start: { line: 'abc', column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'escape' },
        arguments: [],
        loc: { start: { line: 1, column: 'abc' }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle undefined node in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle undefined node in MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
    })

    test('should handle node with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with callee name as non-string', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 123 },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with MemberExpression callee but missing object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'getYear' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle nested MemberExpression in callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'getYear' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle MemberExpression with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: null,
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle numeric node in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.NewExpression(42)).not.toThrow()
    })

    test('should handle array node in MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      expect(() => visitor.MemberExpression([])).not.toThrow()
    })

    test('should handle MemberExpression with safe property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', 'length'))

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with callee missing name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with callee missing name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier' },
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('Array.prototype.buffer detection', () => {
    test('should report arr.buffer access via member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'buffer' },
          },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('nested member expressions', () => {
    test('should detect deprecated method via nested object access', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'foo' },
            property: { type: 'Identifier', name: 'bar' },
          },
          property: { type: 'Identifier', name: 'substr' },
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('substr')
    })

    test('should detect getYear via deeply nested access', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'a' },
              property: { type: 'Identifier', name: 'b' },
            },
            property: { type: 'Identifier', name: 'c' },
          },
          property: { type: 'Identifier', name: 'getYear' },
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('getYear')
    })
  })

  describe('all deprecated API direct calls', () => {
    test('should report escape direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      expect(reports.length).toBe(1)
    })

    test('should report unescape direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('unescape'))
      expect(reports.length).toBe(1)
    })

    test('should report substr direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('substr'))
      expect(reports.length).toBe(1)
    })

    test('should report getYear direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('getYear'))
      expect(reports.length).toBe(1)
    })

    test('should report setYear direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('setYear'))
      expect(reports.length).toBe(1)
    })

    test('should report toGMTString direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('toGMTString'))
      expect(reports.length).toBe(1)
    })

    test('should report compile direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('compile'))
      expect(reports.length).toBe(1)
    })

    test('should report __proto__ as direct call (has simple key in map)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('__proto__'))
      expect(reports.length).toBe(1)
    })

    test('should report __defineGetter__ as direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('__defineGetter__'))
      expect(reports.length).toBe(1)
    })

    test('should report __defineSetter__ as direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('__defineSetter__'))
      expect(reports.length).toBe(1)
    })

    test('should report __lookupGetter__ as direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('__lookupGetter__'))
      expect(reports.length).toBe(1)
    })

    test('should report __lookupSetter__ as direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('__lookupSetter__'))
      expect(reports.length).toBe(1)
    })
  })

  describe('all deprecated member expressions', () => {
    test('should report obj.__defineGetter__ as MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__defineGetter__'))
      expect(reports.length).toBe(1)
    })

    test('should report obj.__defineSetter__ as MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__defineSetter__'))
      expect(reports.length).toBe(1)
    })

    test('should report obj.__lookupGetter__ as MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__lookupGetter__'))
      expect(reports.length).toBe(1)
    })

    test('should report obj.__lookupSetter__ as MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__lookupSetter__'))
      expect(reports.length).toBe(1)
    })

    test('should report obj.__proto__ as MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))
      expect(reports.length).toBe(1)
    })
  })

  describe('visitor isolation', () => {
    test('should not share state between different context instances', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noDeprecatedApiRule.create(ctx1)
      const visitor2 = noDeprecatedApiRule.create(ctx2)

      visitor1.CallExpression(createDeprecatedCall('escape'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should track violations independently per visitor', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noDeprecatedApiRule.create(ctx1)
      const visitor2 = noDeprecatedApiRule.create(ctx2)

      visitor1.CallExpression(createDeprecatedCall('escape'))
      visitor2.CallExpression(createDeprecatedCall('unescape'))

      expect(reports1.length).toBe(1)
      expect(reports1[0].message).toContain('escape')
      expect(reports2.length).toBe(1)
      expect(reports2[0].message).toContain('unescape')
    })
  })

  describe('ignoreApis with prototype-qualified keys', () => {
    test('should still report Date.prototype.getYear via simple method name ignore', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['Date.prototype.getYear'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'getYear'))

      expect(reports.length).toBe(1)
    })

    test('should ignore getYear via simple name', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['getYear'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('date', 'getYear'))

      expect(reports.length).toBe(0)
    })

    test('should ignore Object.prototype.__proto__ via full key', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['Object.prototype.__proto__'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', '__proto__'))

      expect(reports.length).toBe(0)
    })

    test('should ignore compile via simple name', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['compile'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('regex', 'compile'))

      expect(reports.length).toBe(0)
    })

    test('should ignore substr via simple name', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['substr'] })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('str', 'substr'))

      expect(reports.length).toBe(0)
    })
  })

  describe('create function re-entrancy', () => {
    test('should handle same deprecated API called via different visitor methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const callNode = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'compile' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const memberNode = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      }

      visitor.CallExpression(callNode)
      visitor.MemberExpression(memberNode)

      expect(reports.length).toBe(2)
    })

    test('should handle same visitor method called multiple times for different APIs', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))
      visitor.CallExpression(createDeprecatedCall('unescape'))
      visitor.CallExpression(createDeprecatedCall('compile'))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('escape')
      expect(reports[1].message).toContain('unescape')
      expect(reports[2].message).toContain('compile')
    })
  })

  describe('message format details', () => {
    test('should not include replacement when API has no replacement', () => {
      const { context, reports } = createMockContext({
        additionalApis: [{ name: 'noReplace', reason: 'Just deprecated' }],
      })
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('noReplace'))

      expect(reports[0].message).not.toContain('Use ')
      expect(reports[0].message).not.toContain('instead.')
    })

    test('should include period at end of message with replacement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createDeprecatedCall('escape'))

      expect(reports[0].message).toMatch(/\instead\.$/)
    })

    test('should not include trailing period when no replacement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.CallExpression(createMethodCall('regex', 'compile'))

      expect(reports[0].message).toMatch(/Deprecated$/)
    })
  })

  describe('NewExpression edge cases', () => {
    test('should handle NewExpression with arguments containing objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(createNewBuffer([{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should handle NewExpression with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      visitor.NewExpression(
        createNewBuffer([
          { type: 'Literal', value: 'hello' },
          { type: 'Literal', value: 'utf8' },
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new ArrayBuffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'ArrayBuffer' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('extractLocation defaults', () => {
    test('should return default location for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'escape' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should return default location for node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'escape' },
        arguments: [],
        loc: null,
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default end location when end is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'escape' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('all safe NewExpressions', () => {
    test('should not report new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Date' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report new WeakMap()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'WeakMap' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report new Int8Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeprecatedApiRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Int8Array' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
