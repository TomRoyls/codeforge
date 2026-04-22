import { describe, test, expect, vi } from 'vitest'
import { noUnsafeCallRule } from '../../../../src/rules/security/no-unsafe-call.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function createAsAnyCall(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: varName },
      typeAnnotation: { type: 'TSAnyKeyword' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createMemberCallOnAny(objName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: objName },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createNormalCall(funcName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + funcName.length + 2 } },
  }
}

function createNewExpressionOnAny(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: varName },
      typeAnnotation: { type: 'TSAnyKeyword' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 19 } },
  }
}

function createMemberNewOnAny(objName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: objName },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createCallWithArgs(varName: string, argCount: number, line = 1, column = 0): unknown {
  const args = []
  for (let i = 0; i < argCount; i++) {
    args.push({ type: 'Identifier', name: `arg${i}` })
  }
  return {
    type: 'CallExpression',
    callee: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: varName },
      typeAnnotation: { type: 'TSAnyKeyword' },
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 20 + argCount * 5 } },
  }
}

function createSafeMemberCall(objName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objName },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + objName.length + method.length + 3 },
    },
  }
}

describe('no-unsafe-call rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeCallRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeCallRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeCallRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noUnsafeCallRule.meta.docs?.category).toBe('security')
    })

    test('should mention unsafe and call in description', () => {
      const desc = noUnsafeCallRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('unsafe')
      expect(desc.toLowerCase()).toContain('call')
    })

    test('should have docs object', () => {
      expect(noUnsafeCallRule.meta.docs).toBeDefined()
    })

    test('should have a non-empty description', () => {
      const desc = noUnsafeCallRule.meta.docs?.description ?? ''
      expect(desc.length).toBeGreaterThan(0)
    })

    test('should have schema as empty array', () => {
      expect(noUnsafeCallRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noUnsafeCallRule.meta.fixable).toBeUndefined()
    })

    test('should have type as string', () => {
      expect(typeof noUnsafeCallRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noUnsafeCallRule.meta.severity).toBe('string')
    })

    test('should have category as string', () => {
      expect(typeof noUnsafeCallRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as boolean', () => {
      expect(typeof noUnsafeCallRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should reference any in description', () => {
      const desc = noUnsafeCallRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('any')
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return visitor with NewExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('should return a non-null visitor object', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('detection', () => {
    test('should detect (x as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (obj as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('obj'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (x as any).method()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('x', 'method'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (data as any).fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('data', 'fn'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (x as any)() via NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('x'))
      expect(reports).toHaveLength(1)
    })
  })

  describe('direct any calls', () => {
    test('should detect (x as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (data as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('data'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (response as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('response'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (value as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('value'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (result as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('result'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (payload as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('payload'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (input as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('input'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (config as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('config'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (handler as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('handler'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (callback as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('callback'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (fn as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('fn'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (foo as any)() at line 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('foo', 1))
      expect(reports).toHaveLength(1)
    })

    test('should detect (bar as any)() at line 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('bar', 10))
      expect(reports).toHaveLength(1)
    })

    test('should detect (baz as any)() at line 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('baz', 100))
      expect(reports).toHaveLength(1)
    })

    test('should detect (qux as any)() at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('qux', 1, 0))
      expect(reports).toHaveLength(1)
    })

    test('should detect (item as any)() at column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('item', 5, 20))
      expect(reports).toHaveLength(1)
    })

    test('should detect (tmp as any)() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createCallWithArgs('tmp', 1))
      expect(reports).toHaveLength(1)
    })

    test('should detect (val as any)() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createCallWithArgs('val', 3))
      expect(reports).toHaveLength(1)
    })

    test('should detect (x as any)() with 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createCallWithArgs('x', 0))
      expect(reports).toHaveLength(1)
    })

    test('should detect (ref as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('ref'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (obj as any)() at varied line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('obj', 42, 7))
      expect(reports).toHaveLength(1)
    })

    test('should detect (parsed as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('parsed'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (transformed as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('transformed'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (raw as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('raw'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (buffer as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('buffer'))
      expect(reports).toHaveLength(1)
    })
  })

  describe('member calls on any', () => {
    test('should detect (x as any).method()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('x', 'method'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (data as any).fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('data', 'fn'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (obj as any).toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('obj', 'toString'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (response as any).json()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('response', 'json'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (config as any).get()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('config', 'get'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (value as any).valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('value', 'valueOf'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (result as any).parse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('result', 'parse'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (payload as any).submit()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('payload', 'submit'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (input as any).validate()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('input', 'validate'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (handler as any).handle()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('handler', 'handle'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (callback as any).invoke()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('callback', 'invoke'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (ctx as any).send()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('ctx', 'send'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (foo as any).bar() at line 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('foo', 'bar', 5))
      expect(reports).toHaveLength(1)
    })

    test('should detect (a as any).b() at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('a', 'b', 1, 0))
      expect(reports).toHaveLength(1)
    })

    test('should detect (item as any).run() at line 50 column 30', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('item', 'run', 50, 30))
      expect(reports).toHaveLength(1)
    })

    test('should detect (wrapper as any).unwrap()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('wrapper', 'unwrap'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (service as any).execute()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('service', 'execute'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (api as any).fetch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('api', 'fetch'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (store as any).dispatch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('store', 'dispatch'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (event as any).preventDefault()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('event', 'preventDefault'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (parser as any).transform()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('parser', 'transform'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (client as any).request()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('client', 'request'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (stream as any).pipe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('stream', 'pipe'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (conn as any).query()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('conn', 'query'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (el as any).click()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('el', 'click'))
      expect(reports).toHaveLength(1)
    })
  })

  describe('new expressions on any', () => {
    test('should detect new (x as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('x'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (data as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('data'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (response as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('response'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (value as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('value'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (config as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('config'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (MyClass as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('MyClass'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (x as any)() at line 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('x', 10))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (x as any)() at column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('x', 3, 5))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (x as any).Constructor()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('x', 'Constructor'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (obj as any).Type()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('obj', 'Type'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (mod as any).Factory()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('mod', 'Factory'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (lib as any).Handler() at line 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('lib', 'Handler', 20))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (module as any).Service() at column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('module', 'Service', 5, 10))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (container as any).create()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('container', 'create'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (factory as any).build()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('factory', 'build'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (parser as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('parser'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (builder as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('builder'))
      expect(reports).toHaveLength(1)
    })
  })

  describe('negative cases', () => {
    test('should NOT report regularFunction()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('regularFunction'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT report (x as string)() - non-any cast', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSStringKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(null)
      expect(reports).toHaveLength(0)
    })

    test('should NOT report non-CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'Identifier',
        name: 'x',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })
      expect(reports).toHaveLength(0)
    })
  })

  describe('not flagging - safe calls', () => {
    test('should NOT flag myFunc()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('myFunc'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('console', 'log'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag obj.method()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('obj', 'method'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as string)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSStringKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as number)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSNumberKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as boolean)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSBooleanKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as unknown)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSUnknownKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as never)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as void)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSVoidKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as null)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSNullKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as undefined)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSUndefinedKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag processData()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('processData'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag handleRequest()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('handleRequest'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Math.random()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Math', 'random'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Array.isArray()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Array', 'isArray'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag JSON.parse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('JSON', 'parse'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Promise', 'resolve'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Object.keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Object', 'keys'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new MyTypedClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyTypedClass' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag a typed member call: typedObj.typedMethod()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('typedObj', 'typedMethod'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag document.querySelector()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('document', 'querySelector'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag window.addEventListener()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('window', 'addEventListener'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag fs.readFile()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('fs', 'readFile'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag path.join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('path', 'join'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new (x as string)() - non-any new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSStringKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new (x as number)() - non-any new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSNumberKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag member call where object is typed cast (not any)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'TSAsExpression',
            expression: { type: 'Identifier', name: 'x' },
            typeAnnotation: { type: 'TSStringKeyword' },
          },
          property: { type: 'Identifier', name: 'method' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag IIFE with typed expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('callback'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag setTimeout()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('setTimeout'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag parseInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('parseInt'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('message and location', () => {
    test('message should mention unsafe and any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports[0].message.toLowerCase()).toContain('unsafe')
      expect(reports[0].message.toLowerCase()).toContain('any')
    })

    test('should report location with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x', 5, 10))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc!.start.line).toBe(5)
      expect(reports[0].loc!.start.column).toBe(10)
    })

    test('message should mention type annotations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports[0].message.toLowerCase()).toContain('type')
    })

    test('message should mention call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports[0].message.toLowerCase()).toContain('call')
    })

    test('message should mention casting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports[0].message.toLowerCase()).toContain('cast')
    })

    test('should report correct location for member call on any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('obj', 'fn', 7, 3))
      expect(reports[0].loc!.start.line).toBe(7)
      expect(reports[0].loc!.start.column).toBe(3)
    })

    test('should report correct location for new expression on any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewExpressionOnAny('x', 12, 8))
      expect(reports[0].loc!.start.line).toBe(12)
      expect(reports[0].loc!.start.column).toBe(8)
    })

    test('should report correct location for member new expression on any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createMemberNewOnAny('lib', 'Handler', 15, 4))
      expect(reports[0].loc!.start.line).toBe(15)
      expect(reports[0].loc!.start.column).toBe(4)
    })

    test('message should be consistent across all violation types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      visitor.CallExpression!(createMemberCallOnAny('obj', 'method'))
      visitor.NewExpression!(createNewExpressionOnAny('y'))
      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x', 5, 10))
      expect(reports[0].loc!.end).toBeDefined()
      expect(reports[0].loc!.end.line).toBe(5)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports[0].loc!.start.line).toBe(1)
      expect(reports[0].loc!.start.column).toBe(0)
    })

    test('should have loc defined on every report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('a', 3, 5))
      visitor.CallExpression!(createMemberCallOnAny('b', 'c', 6, 7))
      visitor.NewExpression!(createNewExpressionOnAny('d', 9, 11))
      for (const report of reports) {
        expect(report.loc).toBeDefined()
      }
    })
  })

  describe('multiple violations', () => {
    test('should report each violation independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x', 1))
      visitor.CallExpression!(createAsAnyCall('y', 2))
      visitor.CallExpression!(createAsAnyCall('z', 3))
      expect(reports).toHaveLength(3)
    })

    test('should report 5 violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression!(createAsAnyCall(`v${i}`, i + 1))
      }
      expect(reports).toHaveLength(5)
    })

    test('should report 10 violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.CallExpression!(createAsAnyCall(`v${i}`, i + 1))
      }
      expect(reports).toHaveLength(10)
    })

    test('should report mix of CallExpression and NewExpression violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      visitor.NewExpression!(createNewExpressionOnAny('y'))
      visitor.CallExpression!(createMemberCallOnAny('z', 'method'))
      expect(reports).toHaveLength(3)
    })

    test('should track each violation location separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('a', 1, 0))
      visitor.CallExpression!(createAsAnyCall('b', 2, 5))
      visitor.CallExpression!(createAsAnyCall('c', 3, 10))
      expect(reports[0].loc!.start.line).toBe(1)
      expect(reports[1].loc!.start.line).toBe(2)
      expect(reports[2].loc!.start.line).toBe(3)
    })

    test('should track separate column locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('a', 1, 0))
      visitor.CallExpression!(createAsAnyCall('b', 1, 10))
      visitor.CallExpression!(createAsAnyCall('c', 1, 20))
      expect(reports[0].loc!.start.column).toBe(0)
      expect(reports[1].loc!.start.column).toBe(10)
      expect(reports[2].loc!.start.column).toBe(20)
    })

    test('should not accumulate across different context instances', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const visitor1 = noUnsafeCallRule.create(ctx1)
      const visitor2 = noUnsafeCallRule.create(ctx2)
      visitor1.CallExpression!(createAsAnyCall('x'))
      visitor2.CallExpression!(createAsAnyCall('y'))
      expect(r1).toHaveLength(1)
      expect(r2).toHaveLength(1)
    })

    test('should interleave safe and unsafe calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('unsafe1'))
      visitor.CallExpression!(createNormalCall('safe'))
      visitor.CallExpression!(createAsAnyCall('unsafe2'))
      expect(reports).toHaveLength(2)
    })

    test('should report member and direct calls together', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('a'))
      visitor.CallExpression!(createMemberCallOnAny('b', 'c'))
      expect(reports).toHaveLength(2)
    })

    test('should report new expressions and call expressions together', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('a', 1))
      visitor.NewExpression!(createNewExpressionOnAny('b', 2))
      visitor.CallExpression!(createMemberCallOnAny('c', 'd', 3))
      visitor.NewExpression!(createMemberNewOnAny('e', 'F', 4))
      expect(reports).toHaveLength(4)
    })

    test('should report only unsafe calls, not safe ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('safe1'))
      visitor.CallExpression!(createSafeMemberCall('obj', 'method'))
      visitor.CallExpression!(createAsAnyCall('unsafe'))
      visitor.CallExpression!(createNormalCall('safe2'))
      expect(reports).toHaveLength(1)
    })

    test('should handle 20 mixed calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.CallExpression!(createAsAnyCall(`u${i}`, i + 1))
        visitor.CallExpression!(createNormalCall(`s${i}`, i + 1))
      }
      expect(reports).toHaveLength(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(null)
      expect(reports).toHaveLength(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(undefined)
      expect(reports).toHaveLength(0)
    })

    test('should handle null NewExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(null)
      expect(reports).toHaveLength(0)
    })

    test('should handle undefined NewExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(undefined)
      expect(reports).toHaveLength(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle TSAsExpression without typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle TSAsExpression with null typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: null,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle TSAsExpression with wrong typeAnnotation type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSStringKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle non-TSAsExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle MemberExpression callee with non-any object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'TSAsExpression',
            expression: { type: 'Identifier', name: 'x' },
            typeAnnotation: { type: 'TSStringKeyword' },
          },
          property: { type: 'Identifier', name: 'method' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle MemberExpression callee with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('obj', 'method'))
      expect(reports).toHaveLength(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({})
      expect(reports).toHaveLength(0)
    })

    test('should handle node with primitive callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: 'not-an-object',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle node with numeric callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: 42,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle node with boolean callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: true,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        arguments: [],
      })
      expect(reports).toHaveLength(1)
    })

    test('should handle node with empty loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports).toHaveLength(1)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('should handle MemberExpression with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'method' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle NewExpression with null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(null)
      expect(reports).toHaveLength(0)
    })

    test('should handle NewExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle MemberExpression with Identifier object that is not TSAsExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({})
      expect(reports).toHaveLength(0)
    })
  })

  describe('valid code - extended', () => {
    test('should NOT flag Array.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Array', 'from'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Object.assign()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Object', 'assign'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag String.raw()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('String', 'raw'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Number.parseInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Number', 'parseInt'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Boolean.valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Boolean', 'valueOf'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Symbol.for()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Symbol', 'for'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Date.now()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Date', 'now'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag RegExp.test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('myRegex', 'test'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Map.get()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('myMap', 'get'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Set.has()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('mySet', 'has'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag WeakMap.set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('myWeakMap', 'set'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Promise.all()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Promise', 'all'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Promise.race()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Promise', 'race'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag fetch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('fetch'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag alert()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('alert'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag encodeURI()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('encodeURI'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag decodeURI()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('decodeURI'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag isNaN()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('isNaN'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag isFinite()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('isFinite'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Date' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new ArrayBuffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'ArrayBuffer' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Int32Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Int32Array' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Float64Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Float64Array' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new DataView()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'DataView' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as HTMLElement)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSReference', typeName: 'HTMLElement' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as MyInterface)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: { type: 'TSReference', typeName: 'MyInterface' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag (x as unknown as string)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: {
            type: 'TSAsExpression',
            expression: { type: 'Identifier', name: 'x' },
            typeAnnotation: { type: 'TSUnknownKeyword' },
          },
          typeAnnotation: { type: 'TSStringKeyword' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag computed member access: obj[methodName]()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'methodName' },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag chained safe member calls: a.b.c()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'c' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new URL()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'URL' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new URLSearchParams()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'URLSearchParams' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new FormData()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'FormData' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Headers()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Headers' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Response()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Response' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Request()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Request' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag console.error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('console', 'error'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag console.warn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('console', 'warn'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag process.exit()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('process', 'exit'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag Buffer.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('Buffer', 'from'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag require()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('require'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new Worker()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Worker' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag crypto.getRandomValues()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('crypto', 'getRandomValues'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag new TextEncoder()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'TextEncoder' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should NOT flag AbortSignal.abort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createSafeMemberCall('AbortSignal', 'abort'))
      expect(reports).toHaveLength(0)
    })
  })
})
