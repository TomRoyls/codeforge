import { noUnnecessaryTypeArgumentsRule } from '../../../../src/rules/patterns/no-unnecessary-type-arguments.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNewExpression(
  calleeName: string,
  typeParams: string[],
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    typeArguments: {
      type: 'TypeParameterInstantiation',
      params: typeParams.map((t) => ({ type: 'GenericTypeAnnotation', id: { name: t } })),
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createCallExpression(
  calleeName: string,
  typeParams: string[],
  args: unknown[] = [],
  isMember = false,
  objectName?: string,
  line = 1,
  column = 0,
): unknown {
  const callee = isMember
    ? {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: objectName ?? '' },
        property: { type: 'Identifier', name: calleeName },
      }
    : { type: 'Identifier', name: calleeName }

  return {
    type: 'CallExpression',
    callee,
    typeArguments: {
      type: 'TypeParameterInstantiation',
      params: typeParams.map((t) => ({ type: 'GenericTypeAnnotation', id: { name: t } })),
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-unnecessary-type-arguments rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.fixable).toBeUndefined()
    })

    test('should mention type arguments in description', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.description.toLowerCase()).toContain(
        'type argument',
      )
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url containing rule name', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.url).toContain(
        'no-unnecessary-type-arguments',
      )
    })

    test('should have a valid docs url string', () => {
      expect(typeof noUnnecessaryTypeArgumentsRule.meta.docs?.url).toBe('string')
    })

    test('should have description as non-empty string', () => {
      expect(typeof noUnnecessaryTypeArgumentsRule.meta.docs?.description).toBe('string')
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have severity as one of valid values', () => {
      expect(['off', 'warn', 'error']).toContain(noUnnecessaryTypeArgumentsRule.meta.severity)
    })

    test('should have type as one of valid values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(
        noUnnecessaryTypeArgumentsRule.meta.type,
      )
    })

    test('should not be deprecated', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.schema).toEqual([])
    })
  })

  describe('rule exports', () => {
    test('should export the rule as default', () => {
      const defaultExport = noUnnecessaryTypeArgumentsRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })

    test('should have create as a function', () => {
      expect(typeof noUnnecessaryTypeArgumentsRule.create).toBe('function')
    })

    test('should return a visitor from create', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })

    test('visitor should have NewExpression handler', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('visitor should have CallExpression handler', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting unnecessary type arguments in new expressions', () => {
    test('should report new Array<string>() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('should report new Array<number>() with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(
        createNewExpression('Array', ['number'], [{ type: 'Literal', value: 1 }]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('inferred')
    })

    test('should report new Map<string, number>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', ['string', 'number']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('map')
    })

    test('should report new Set<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('set')
    })

    test('should report new Promise<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise')
    })

    test('should report new WeakMap<object, string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakMap', ['object', 'string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('weakmap')
    })

    test('should report new WeakSet<object>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakSet', ['object']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('weakset')
    })

    test('should not report new expressions without type arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createNewExpression('Array', [])
      delete (node as Record<string, unknown>).typeArguments
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unknown constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('CustomClass', ['string']))

      expect(reports.length).toBe(0)
    })

    test('should report new ReadonlyArray<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('ReadonlyArray', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('readonlyarray')
    })

    test('should report new ReadonlyMap<string, number>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('ReadonlyMap', ['string', 'number']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('readonlymap')
    })

    test('should report new ReadonlySet<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('ReadonlySet', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('readonlyset')
    })

    test('should report new Record<string, unknown>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Record', ['string', 'unknown']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('record')
    })

    test('should report new Partial<{ foo: string }>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Partial', ['FooType']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('partial')
    })

    test('should report new Required<{ foo: string }>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Required', ['FooType']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('required')
    })

    test('should report new Pick<{ foo: string }, "foo">()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Pick', ['FooType', 'FooKey']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('pick')
    })

    test('should report new Omit<{ foo: string }, "foo">()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Omit', ['FooType', 'FooKey']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('omit')
    })

    test('should report new Exclude<string, number>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Exclude', ['string', 'number']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('exclude')
    })

    test('should report new Extract<string, number>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Extract', ['string', 'number']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('extract')
    })

    test('should report new NonNullable<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('NonNullable', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('nonnullable')
    })

    test('should report new ReturnType<() => string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('ReturnType', ['FuncType']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('returntype')
    })

    test('should report new Parameters<() => string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Parameters', ['FuncType']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('parameters')
    })

    test('should report new InstanceType<typeof Foo>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('InstanceType', ['FooConstructor']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('instancetype')
    })

    test('should report new Map without arguments with inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', ['string', 'number'], []))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('inferred')
    })

    test('should report new Map with arguments with inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(
        createNewExpression('Map', ['string', 'number'], [{ type: 'ArrayExpression' }]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('should report new Set without arguments with inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['string'], []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from usage')
    })

    test('should report new Set with arguments with inferred from constructor message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['number'], [{ type: 'ArrayExpression' }]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('should report new WeakMap without arguments with inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakMap', ['object', 'string'], []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from usage')
    })

    test('should report new WeakMap with arguments with constructor inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(
        createNewExpression('WeakMap', ['object', 'string'], [{ type: 'ArrayExpression' }]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('should report new WeakSet without arguments with inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakSet', ['object'], []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from usage')
    })

    test('should report new WeakSet with arguments with constructor inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(
        createNewExpression('WeakSet', ['object'], [{ type: 'ArrayExpression' }]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('should report new Promise with executor inferred message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', ['void']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('executor function')
    })

    test('should report new Array with any[] hint message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string'], []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any[]')
    })

    test('should use potentially inferred message for utility types', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Record', ['string', 'number']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for Partial', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Partial', ['T']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for Required', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Required', ['T']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for Pick', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Pick', ['T', 'K']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for Omit', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Omit', ['T', 'K']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for Exclude', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Exclude', ['T', 'U']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for Extract', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Extract', ['T', 'U']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for NonNullable', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('NonNullable', ['T']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for ReturnType', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('ReturnType', ['F']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for Parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Parameters', ['F']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('should use potentially inferred message for InstanceType', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('InstanceType', ['C']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('potentially be inferred')
    })
  })

  describe('detecting unnecessary type arguments in call expressions', () => {
    test('should report Promise.resolve<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.resolve')
    })

    test('should report Promise.all<string[]>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('all', ['string[]'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.all')
    })

    test('should report Array.from<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('from', ['string'], [], true, 'Array'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('array.from')
    })

    test('should not report call expressions without type arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('resolve', [], [], true, 'Promise')
      delete (node as Record<string, unknown>).typeArguments
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unknown function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('customMethod', ['string'], [], true, 'Custom'))

      expect(reports.length).toBe(0)
    })

    test('should report Promise.reject<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('reject', ['string'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.reject')
    })

    test('should report Promise.allSettled<Promise<string>>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(
        createCallExpression('allSettled', ['Promise<string>'], [], true, 'Promise'),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.allsettled')
    })

    test('should report Promise.race<Promise<string>>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('race', ['Promise<string>'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.race')
    })

    test('should report Promise.any<Promise<string>>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('any', ['Promise<string>'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.any')
    })

    test('should report Array.of<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('of', ['string'], [], true, 'Array'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('array.of')
    })

    test('should report Object.keys<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('keys', ['string'], [], true, 'Object'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('object.keys')
    })

    test('should report Object.values<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('values', ['string'], [], true, 'Object'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('object.values')
    })

    test('should report Object.entries<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('entries', ['string'], [], true, 'Object'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('object.entries')
    })

    test('should report Object.assign<string>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('assign', ['string'], [], true, 'Object'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('object.assign')
    })

    test('should report inferrable constructor called as function with type args', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('Array', ['string'], [], false)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Array')
    })

    test('should report Map called as function with type args', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('Map', ['string', 'number'], [], false)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Set called as function with type args', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('Set', ['string'], [], false)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Promise called as function with type args', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('Promise', ['string'], [], false)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ReadonlyArray called as function with type args', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('ReadonlyArray', ['string'], [], false)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report unknown standalone function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('myFunction', ['string'], [], false)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unknown member function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('custom', ['string'], [], true, 'MyLib'))

      expect(reports.length).toBe(0)
    })

    test('should include inferred from arguments in message for Promise.resolve', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from arguments')
    })

    test('should include inferred from arguments in message for Object.keys', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('keys', ['string'], [], true, 'Object'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inferred from arguments')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in NewExpression', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createNewExpression('Array', ['string'])
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createNewExpression('Array', ['string'], [], 10, 5)
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        typeArguments: { params: [{ type: 'GenericTypeAnnotation' }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty type arguments params', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        typeArguments: { params: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle boolean node in NewExpression', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
    })

    test('should handle number node in CallExpression', () => {
      const { context } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle empty object node in NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node in CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'Literal',
        callee: { type: 'Identifier', name: 'Array' },
        typeArguments: { params: [{ type: 'GenericTypeAnnotation' }] },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        typeArguments: { params: [{ type: 'GenericTypeAnnotation' }] },
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        typeArguments: { params: [{ type: 'GenericTypeAnnotation' }] },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with string callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 'Array',
        typeArguments: { params: [{ type: 'GenericTypeAnnotation' }] },
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        typeArguments: { params: [{ type: 'GenericTypeAnnotation' }] },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with typeParameters instead of typeArguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        typeParameters: {
          type: 'TypeParameterInstantiation',
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with both typeParameters and typeArguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        typeParameters: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'number' } }],
        },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        arguments: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with member callee but missing object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: '' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with member callee but missing property name', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: '' },
        },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with member callee but null object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'resolve' },
        },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with member callee but null property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: null,
        },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc containing null start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: null, end: null },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing string line', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        loc: { start: { line: 'one', column: 'zero' }, end: { line: 'one', column: 'zero' } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', ['string', 'number'], [], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['number'], [], 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string'], [], 3, 5))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location for CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(
        createCallExpression('resolve', ['string'], [], true, 'Promise', 7, 12),
      )

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple invocations', () => {
    test('should report for each NewExpression call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))
      visitor.NewExpression(createNewExpression('Map', ['string', 'number']))
      visitor.NewExpression(createNewExpression('Set', ['number']))

      expect(reports.length).toBe(3)
    })

    test('should report for each CallExpression call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))
      visitor.CallExpression(createCallExpression('all', ['string[]'], [], true, 'Promise'))
      visitor.CallExpression(createCallExpression('from', ['number'], [], true, 'Array'))

      expect(reports.length).toBe(3)
    })

    test('should report for mixed NewExpression and CallExpression calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))
      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))
      visitor.NewExpression(createNewExpression('Map', ['string', 'number']))
      visitor.CallExpression(createCallExpression('keys', ['string'], [], true, 'Object'))

      expect(reports.length).toBe(4)
    })

    test('should only report when conditions match in mixed calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))
      visitor.NewExpression(createNewExpression('CustomClass', ['string']))
      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))
      visitor.CallExpression(createCallExpression('unknown', ['string'], [], true, 'Foo'))

      expect(reports.length).toBe(2)
    })

    test('should handle many sequential NewExpression calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const constructors = ['Array', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise']
      for (const name of constructors) {
        visitor.NewExpression(createNewExpression(name, ['string']))
      }

      expect(reports.length).toBe(6)
    })

    test('should handle many sequential CallExpression calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const methods = [
        ['resolve', 'Promise'],
        ['reject', 'Promise'],
        ['all', 'Promise'],
        ['allSettled', 'Promise'],
        ['race', 'Promise'],
        ['any', 'Promise'],
      ] as const
      for (const [method, obj] of methods) {
        visitor.CallExpression(createCallExpression(method, ['string'], [], true, obj))
      }

      expect(reports.length).toBe(6)
    })

    test('should not accumulate reports across different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'new Array<string>()' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'new Array<string>()' })

      const visitor1 = noUnnecessaryTypeArgumentsRule.create(ctx1)
      const visitor2 = noUnnecessaryTypeArgumentsRule.create(ctx2)

      visitor1.NewExpression(createNewExpression('Array', ['string']))
      visitor2.NewExpression(createNewExpression('Set', ['number']))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
      expect(reports1[0].message).not.toBe(reports2[0].message)
    })
  })

  describe('message content verification', () => {
    test('Array with no args message mentions any[]', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string'], []))

      expect(reports[0].message).toContain('any[]')
    })

    test('Array with args message mentions inferred from constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string'], [{ type: 'Literal' }]))

      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('Map with no args message mentions usage', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', ['string', 'number'], []))

      expect(reports[0].message).toContain('inferred from usage')
    })

    test('Map with args message mentions constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', ['string', 'number'], [{ type: 'Literal' }]))

      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('Set with no args message mentions usage', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['string'], []))

      expect(reports[0].message).toContain('inferred from usage')
    })

    test('Set with args message mentions constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['string'], [{ type: 'Literal' }]))

      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('WeakMap with no args message mentions usage', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakMap', ['object', 'string'], []))

      expect(reports[0].message).toContain('inferred from usage')
    })

    test('WeakMap with args message mentions constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(
        createNewExpression('WeakMap', ['object', 'string'], [{ type: 'Literal' }]),
      )

      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('WeakSet with no args message mentions usage', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakSet', ['object'], []))

      expect(reports[0].message).toContain('inferred from usage')
    })

    test('WeakSet with args message mentions constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakSet', ['object'], [{ type: 'Literal' }]))

      expect(reports[0].message).toContain('inferred from constructor arguments')
    })

    test('Promise message mentions executor function', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', ['string']))

      expect(reports[0].message).toContain('executor function')
    })

    test('Promise.resolve call message mentions name', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))

      expect(reports[0].message).toContain('Promise.resolve')
    })

    test('Array.from call message mentions name', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('from', ['string'], [], true, 'Array'))

      expect(reports[0].message).toContain('Array.from')
    })

    test('utility type message mentions potentially inferred', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Record', ['string', 'number']))

      expect(reports[0].message).toContain('potentially be inferred')
    })

    test('all messages start with Unnecessary type argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))
      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))
      visitor.NewExpression(createNewExpression('Record', ['string', 'number']))

      for (const report of reports) {
        expect(report.message).toContain('Unnecessary type argument')
      }
    })
  })

  describe('all inferrable constructors', () => {
    const constructors = [
      'Array',
      'Map',
      'Set',
      'WeakMap',
      'WeakSet',
      'Promise',
      'ReadonlyArray',
      'ReadonlyMap',
      'ReadonlySet',
      'Record',
      'Partial',
      'Required',
      'Pick',
      'Omit',
      'Exclude',
      'Extract',
      'NonNullable',
      'ReturnType',
      'Parameters',
      'InstanceType',
    ]

    for (const name of constructors) {
      test(`should report new ${name}<T>()`, () => {
        const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
        const visitor = noUnnecessaryTypeArgumentsRule.create(context)

        visitor.NewExpression(createNewExpression(name, ['T']))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('Unnecessary type argument')
      })

      test(`should report ${name}() call expression with type args`, () => {
        const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
        const visitor = noUnnecessaryTypeArgumentsRule.create(context)

        const node = createCallExpression(name, ['T'], [], false)
        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
      })
    }
  })

  describe('all inferrable functions', () => {
    const functions = [
      { method: 'resolve', object: 'Promise', name: 'Promise.resolve' },
      { method: 'reject', object: 'Promise', name: 'Promise.reject' },
      { method: 'all', object: 'Promise', name: 'Promise.all' },
      { method: 'allSettled', object: 'Promise', name: 'Promise.allSettled' },
      { method: 'race', object: 'Promise', name: 'Promise.race' },
      { method: 'any', object: 'Promise', name: 'Promise.any' },
      { method: 'from', object: 'Array', name: 'Array.from' },
      { method: 'of', object: 'Array', name: 'Array.of' },
      { method: 'keys', object: 'Object', name: 'Object.keys' },
      { method: 'values', object: 'Object', name: 'Object.values' },
      { method: 'entries', object: 'Object', name: 'Object.entries' },
      { method: 'assign', object: 'Object', name: 'Object.assign' },
    ]

    for (const fn of functions) {
      test(`should report ${fn.name}<T>()`, () => {
        const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
        const visitor = noUnnecessaryTypeArgumentsRule.create(context)

        visitor.CallExpression(createCallExpression(fn.method, ['T'], [], true, fn.object))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(fn.name)
      })
    }

    test('should report all Promise static methods at once', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const promiseMethods = ['resolve', 'reject', 'all', 'allSettled', 'race', 'any']
      for (const method of promiseMethods) {
        visitor.CallExpression(createCallExpression(method, ['T'], [], true, 'Promise'))
      }

      expect(reports.length).toBe(6)
    })

    test('should report all Array static methods at once', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('from', ['T'], [], true, 'Array'))
      visitor.CallExpression(createCallExpression('of', ['T'], [], true, 'Array'))

      expect(reports.length).toBe(2)
    })

    test('should report all Object static methods at once', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const objectMethods = ['keys', 'values', 'entries', 'assign']
      for (const method of objectMethods) {
        visitor.CallExpression(createCallExpression(method, ['T'], [], true, 'Object'))
      }

      expect(reports.length).toBe(4)
    })
  })

  describe('negative cases - should not report', () => {
    test('should not report for Foo constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Foo', ['string']))

      expect(reports.length).toBe(0)
    })

    test('should not report for MyClass constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('MyClass', ['T', 'U']))

      expect(reports.length).toBe(0)
    })

    test('should not report for Foo.bar call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('bar', ['string'], [], true, 'Foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report for myFunction call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('myFunction', ['string'], [], false))

      expect(reports.length).toBe(0)
    })

    test('should not report for process.exit call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('exit', ['number'], [], true, 'process'))

      expect(reports.length).toBe(0)
    })

    test('should not report for console.log call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('log', ['string'], [], true, 'console'))

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression without typeArguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression without typeArguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeArguments params is empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        typeArguments: { params: [] },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve for non-member callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('resolve', ['string'], [], false)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for React.createElement call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('createElement', ['Props'], [], true, 'React'))

      expect(reports.length).toBe(0)
    })

    test('should not report for lodash.map call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('map', ['T'], [], true, '_'))

      expect(reports.length).toBe(0)
    })

    test('should not report for Array custom method call', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('customMethod', ['T'], [], true, 'Array'))

      expect(reports.length).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()', filePath: '/project/src/utils.ts' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = new Map<K, V>()', filePath: '/src/file.ts' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', ['K', 'V']))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source content', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['string']))

      expect(reports.length).toBe(1)
    })

    test('should work with options in context', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true }], source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))

      expect(reports.length).toBe(1)
    })

    test('should work with empty options in context', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))

      expect(reports.length).toBe(1)
    })
  })

  describe('CallExpression with non-member callee types', () => {
    test('should handle CallExpression with FunctionExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: {} },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with ArrowFunctionExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'ArrowFunctionExpression', params: [], body: {} },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with CallExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('NewExpression with non-Identifier callee', () => {
    test('should handle NewExpression with MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ns' },
          property: { type: 'Identifier', name: 'MyClass' },
        },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with FunctionExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: {} },
        typeArguments: {
          params: [{ type: 'GenericTypeAnnotation', id: { name: 'string' } }],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('Array special cases', () => {
    test('should report new Array<boolean>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['boolean']))

      expect(reports.length).toBe(1)
    })

    test('should report new Array<any>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['any']))

      expect(reports.length).toBe(1)
    })

    test('should report new Array<void>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['void']))

      expect(reports.length).toBe(1)
    })

    test('should report new Array<unknown>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['unknown']))

      expect(reports.length).toBe(1)
    })

    test('should report new Array<never>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['never']))

      expect(reports.length).toBe(1)
    })

    test('should report new Array<object>()', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Array<string>()' })
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['object']))

      expect(reports.length).toBe(1)
    })
  })
})
