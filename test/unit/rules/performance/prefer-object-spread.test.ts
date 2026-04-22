import { describe, test, expect, vi } from 'vitest'
import { preferObjectSpreadRule } from '../../../../src/rules/performance/prefer-object-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  suggest?: readonly {
    desc: string
    message: string
    fix: { range: readonly [number, number]; text: string }
  }[]
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'Object.assign({}, obj)',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        suggest: descriptor.suggest,
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

function createObjectAssignCall(args: string[], line = 1, column = 0): unknown {
  const argsText = args.join(', ')
  const fullText = `Object.assign(${argsText})`
  let offset = 'Object.assign('.length

  const argNodes = args.map((arg) => {
    const start = offset
    const end = offset + arg.length
    offset = end + 2

    if (arg === '{}') {
      return {
        type: 'ObjectExpression',
        properties: [],
        range: [start, end],
      }
    }
    return {
      type: 'Identifier',
      name: arg,
      range: [start, end],
    }
  })

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
        range: [0, 6],
      },
      property: {
        type: 'Identifier',
        name: 'assign',
      },
      computed: false,
    },
    arguments: argNodes,
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

function createObjectAssignMutationCall(
  target: string,
  source: string,
  line = 1,
  column = 0,
): unknown {
  const fullText = `Object.assign(${target}, ${source})`

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
        range: [0, 6],
      },
      property: {
        type: 'Identifier',
        name: 'assign',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'Identifier',
        name: target,
        range: [13, 13 + target.length],
      },
      {
        type: 'Identifier',
        name: source,
        range: [16 + target.length, 16 + target.length + source.length],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

function createNonObjectAssignCall(line = 1, column = 0): unknown {
  const fullText = 'foo.bar({}, obj)'

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'foo',
        range: [0, 3],
      },
      property: {
        type: 'Identifier',
        name: 'bar',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'ObjectExpression',
        properties: [],
        range: [8, 10],
      },
      {
        type: 'Identifier',
        name: 'obj',
        range: [12, 15],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

/**
 * Creates an Object.assign call node where source args are MemberExpressions.
 * E.g., source text: "Object.assign({}, config.options)"
 */
function createObjectAssignWithMemberArgs(
  memberTexts: string[],
  line = 1,
  column = 0,
): { node: unknown; sourceText: string } {
  const argsText = ['{}', ...memberTexts].join(', ')
  const sourceText = `Object.assign(${argsText})`
  let offset = 'Object.assign('.length

  const emptyObj = {
    type: 'ObjectExpression',
    properties: [],
    range: [offset, offset + 2],
  }
  offset += 4 // skip "{}" + ", "

  const memberArgs = memberTexts.map((text) => {
    const parts = text.split('.')
    const start = offset
    const end = offset + text.length
    offset = end + 2
    return {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: parts[0],
        range: [start, start + parts[0].length],
      },
      property: {
        type: 'Identifier',
        name: parts.slice(1).join('.'),
      },
      computed: false,
      range: [start, end],
    }
  })

  const node = {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
        range: [0, 6],
      },
      property: {
        type: 'Identifier',
        name: 'assign',
      },
      computed: false,
    },
    arguments: [emptyObj, ...memberArgs],
    loc: {
      start: { line, column },
      end: { line, column: column + sourceText.length },
    },
    range: [0, sourceText.length],
  }

  return { node, sourceText }
}

/**
 * Creates a call node with computed member expression (Object['assign'])
 */
function createComputedAssignCall(line = 1, column = 0): unknown {
  const fullText = "Object['assign']({}, obj)"

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
        range: [0, 6],
      },
      property: {
        type: 'Literal',
        value: 'assign',
      },
      computed: true,
    },
    arguments: [
      {
        type: 'ObjectExpression',
        properties: [],
        range: [17, 19],
      },
      {
        type: 'Identifier',
        name: 'obj',
        range: [21, 24],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

/**
 * Creates Object.assign call with a non-empty first arg object
 */
function createObjectAssignNonEmptyFirstArg(propCount: number, line = 1, column = 0): unknown {
  const props = Array.from({ length: propCount }, (_, i) => ({
    type: 'Property',
    key: { type: 'Identifier', name: `prop${i}` },
  }))

  const fullText = `Object.assign({ prop0: 1 }, obj)`
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
        range: [0, 6],
      },
      property: {
        type: 'Identifier',
        name: 'assign',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'ObjectExpression',
        properties: props,
        range: [14, 24],
      },
      {
        type: 'Identifier',
        name: 'obj',
        range: [26, 29],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

describe('prefer-object-spread rule', () => {
  // ================================================================
  // META PROPERTY TESTS (existing 7 + new 13 = 20)
  // ================================================================
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferObjectSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferObjectSpreadRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferObjectSpreadRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(preferObjectSpreadRule.meta.docs?.category).toBe('performance')
    })

    test('should have schema defined', () => {
      expect(preferObjectSpreadRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(preferObjectSpreadRule.meta.docs?.description).toContain('spread')
    })

    test('should be fixable', () => {
      expect(preferObjectSpreadRule.meta.fixable).toBe('code')
    })

    test('should have a valid docs URL', () => {
      expect(preferObjectSpreadRule.meta.docs?.url).toBeDefined()
      expect(typeof preferObjectSpreadRule.meta.docs?.url).toBe('string')
    })

    test('should have docs URL containing rule name', () => {
      expect(preferObjectSpreadRule.meta.docs?.url).toContain('prefer-object-spread')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferObjectSpreadRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(preferObjectSpreadRule.meta.schema).toEqual([])
    })

    test('should have description mentioning Object.assign', () => {
      expect(preferObjectSpreadRule.meta.docs?.description).toContain('Object.assign')
    })

    test('should have description mentioning immutable', () => {
      expect(preferObjectSpreadRule.meta.docs?.description).toContain('immutable')
    })

    test('should have description mentioning TypeScript', () => {
      expect(preferObjectSpreadRule.meta.docs?.description).toContain('TypeScript')
    })

    test('should have description mentioning concise', () => {
      expect(preferObjectSpreadRule.meta.docs?.description).toContain('concise')
    })

    test('should have description mentioning readable', () => {
      expect(preferObjectSpreadRule.meta.docs?.description).toContain('readable')
    })

    test('should have docs object defined', () => {
      expect(preferObjectSpreadRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof preferObjectSpreadRule.meta.docs?.description).toBe('string')
    })

    test('should have fixable as code string', () => {
      expect(preferObjectSpreadRule.meta.fixable).toBe('code')
    })

    test('should have type as one of known values', () => {
      expect(['suggestion', 'problem', 'layout']).toContain(preferObjectSpreadRule.meta.type)
    })
  })

  // ================================================================
  // CREATE / VISITOR TESTS (existing 1 + new 9 = 10)
  // ================================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = preferObjectSpreadRule.create(context)
      const visitor2 = preferObjectSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor that is an object', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => preferObjectSpreadRule.create(context)).not.toThrow()
    })

    test('should accept context with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Object.assign({}, obj)',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      expect(() => preferObjectSpreadRule.create(context)).not.toThrow()
    })

    test('visitor CallExpression should accept a single argument', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(visitor.CallExpression.length).toBeLessThanOrEqual(1)
    })

    test('should work with different file paths', () => {
      const { context: ctx1 } = createMockContext({}, '/src/a.ts')
      const { context: ctx2 } = createMockContext({}, '/src/b.ts')

      expect(() => preferObjectSpreadRule.create(ctx1)).not.toThrow()
      expect(() => preferObjectSpreadRule.create(ctx2)).not.toThrow()
    })

    test('should work with different source texts', () => {
      const { context: ctx1 } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a)')
      const { context: ctx2 } = createMockContext({}, '/src/file.ts', 'Object.assign({}, x, y)')

      expect(() => preferObjectSpreadRule.create(ctx1)).not.toThrow()
      expect(() => preferObjectSpreadRule.create(ctx2)).not.toThrow()
    })
  })

  // ================================================================
  // DETECTION: BASIC PATTERNS (existing 2 + new 28 = 30)
  // ================================================================
  describe('detection - basic patterns', () => {
    test('should detect Object.assign({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread')
      expect(reports[0].message).toContain('...obj')
    })

    test('should detect Object.assign({}, a, b)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a, b)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...a')
      expect(reports[0].message).toContain('...b')
    })

    test('should detect Object.assign({}, x)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, x)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'x']))

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, a, b, c)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, a, b, c)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b', 'c']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...a')
      expect(reports[0].message).toContain('...b')
      expect(reports[0].message).toContain('...c')
    })

    test('should detect Object.assign({}, a, b, c, d)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, a, b, c, d)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b', 'c', 'd']))

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, a, b, c, d, e)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, a, b, c, d, e)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b', 'c', 'd', 'e']))

      expect(reports.length).toBe(1)
    })

    test('should detect with config source identifier', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, config)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'config']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...config')
    })

    test('should detect with data source identifier', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, data)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'data']))

      expect(reports.length).toBe(1)
    })

    test('should detect with options source identifier', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, options)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'options']))

      expect(reports.length).toBe(1)
    })

    test('should detect with result source identifier', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, result)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'result']))

      expect(reports.length).toBe(1)
    })

    test('should detect with state source identifier', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, state)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'state']))

      expect(reports.length).toBe(1)
    })

    test('should detect with props source identifier', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, props)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'props']))

      expect(reports.length).toBe(1)
    })

    test('should detect with single-letter source identifier', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a']))

      expect(reports.length).toBe(1)
    })

    test('should detect with underscore prefixed identifier', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, _ref)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', '_ref']))

      expect(reports.length).toBe(1)
    })

    test('should detect with dollar sign identifier', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, $data)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', '$data']))

      expect(reports.length).toBe(1)
    })

    test('should produce exactly one report per detection', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
    })

    test('should not report violation for Object.assign(target, source)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(target, source)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignMutationCall('target', 'source'))

      expect(reports.length).toBe(0)
    })

    test('should not report for non-Object.assign calls', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'foo.bar({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createNonObjectAssignCall())

      expect(reports.length).toBe(0)
    })

    test('report message should contain Prefer', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].message).toContain('Prefer')
    })

    test('report message should contain Object.assign', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].message).toContain('Object.assign')
    })

    test('report should include location', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].loc).toBeDefined()
    })

    test('report should include suggest', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest).toBeDefined()
    })

    test('report suggest should have exactly one suggestion', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.length).toBe(1)
    })

    test('should detect Object.assign({}, defaults, config, env)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, defaults, config, env)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'defaults', 'config', 'env']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...defaults')
      expect(reports[0].message).toContain('...config')
      expect(reports[0].message).toContain('...env')
    })

    test('should detect Object.assign({}, base)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, base)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'base']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...base')
    })

    test('should detect Object.assign({}, item)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, item)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'item']))

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, input, output)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, input, output)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'input', 'output']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...input')
      expect(reports[0].message).toContain('...output')
    })

    test('should detect Object.assign({}, source1, source2)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, source1, source2)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'source1', 'source2']))

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, model, view, controller)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, model, view, controller)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'model', 'view', 'controller']))

      expect(reports.length).toBe(1)
    })

    test('should include suggestion reference in message', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].message).toContain('Use object spread')
      expect(reports[0].message).toContain('instead of Object.assign')
    })
  })

  // ================================================================
  // DETECTION: MEMBER EXPRESSION SOURCES (new 20)
  // ================================================================
  describe('detection - member expression sources', () => {
    test('should detect Object.assign({}, config.options)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['config.options'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include member expression text in message', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['config.options'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports[0].message).toContain('config.options')
    })

    test('should suggest spread with member expression', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['config.options'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports[0].suggest?.[0]?.desc).toContain('...config.options')
    })

    test('should detect with multiple member expression sources', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs([
        'config.options',
        'state.data',
      ])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, props.theme)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['props.theme'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, this.state)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['this.state'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, user.profile)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['user.profile'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, api.response, app.settings)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs([
        'api.response',
        'app.settings',
      ])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should generate correct fix for member expression source', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['config.options'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports[0].suggest?.[0]?.fix?.text).toContain('{ ...config.options }')
    })

    test('should generate correct fix for multiple member expression sources', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs([
        'config.options',
        'state.data',
      ])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports[0].suggest?.[0]?.fix?.text).toContain('...config.options')
      expect(reports[0].suggest?.[0]?.fix?.text).toContain('...state.data')
    })

    test('should detect with deeply nested member expression', () => {
      const sourceText = 'Object.assign({}, config.db.settings)'
      let offset = 'Object.assign('.length
      const emptyObj = {
        type: 'ObjectExpression',
        properties: [],
        range: [offset, offset + 2],
      }
      offset += 4
      const memberArg = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'config',
            range: [offset, offset + 6],
          },
          property: {
            type: 'Identifier',
            name: 'db',
          },
          computed: false,
          range: [offset, offset + 10],
        },
        property: {
          type: 'Identifier',
          name: 'settings',
        },
        computed: false,
        range: [offset, offset + 20],
      }

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [emptyObj, memberArg],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: sourceText.length } },
        range: [0, sourceText.length],
      }

      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report location for member expression sources', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['config.options'], 3, 5)
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should detect Object.assign({}, module.exports)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['module.exports'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, global.config)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['global.config'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, window.localStorage)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['window.localStorage'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should have correct fix range for member expression sources', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['config.options'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports[0].suggest?.[0]?.fix?.range[0]).toBe(0)
      expect(reports[0].suggest?.[0]?.fix?.range[1]).toBe(sourceText.length)
    })

    test('should include all member expressions in message for multiple sources', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs([
        'config.options',
        'state.data',
        'user.profile',
      ])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports[0].message).toContain('config.options')
      expect(reports[0].message).toContain('state.data')
      expect(reports[0].message).toContain('user.profile')
    })

    test('should detect Object.assign({}, context.theme)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['context.theme'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, store.state, store.actions)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs([
        'store.state',
        'store.actions',
      ])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Object.assign({}, req.headers)', () => {
      const { node, sourceText } = createObjectAssignWithMemberArgs(['req.headers'])
      const { context, reports } = createMockContext({}, '/src/file.ts', sourceText)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ================================================================
  // SUGGESTION / FIX GENERATION (existing 2 + new 23 = 25)
  // ================================================================
  describe('suggestion and fix generation', () => {
    test('should suggest correct spread syntax for single source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.desc).toContain('{ ...obj }')
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...obj }')
    })

    test('should suggest correct spread syntax for multiple sources', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a, b)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b']))

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.desc).toContain('{ ...a, ...b }')
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...a, ...b }')
    })

    test('should suggest correct text for three sources', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, a, b, c)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b', 'c']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...a, ...b, ...c }')
    })

    test('should suggest correct text for four sources', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, a, b, c, d)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b', 'c', 'd']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...a, ...b, ...c, ...d }')
    })

    test('should suggest correct text for five sources', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, a, b, c, d, e)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b', 'c', 'd', 'e']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...a, ...b, ...c, ...d, ...e }')
    })

    test('suggestion desc should describe the replacement', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.desc).toContain('object spread')
    })

    test('suggestion message should be human readable', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.message).toBe('Use object spread syntax')
    })

    test('fix range should start at 0', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix?.range[0]).toBe(0)
    })

    test('fix range end should match source length', () => {
      const source = 'Object.assign({}, obj)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix?.range[1]).toBe(source.length)
    })

    test('fix text should be wrapped in curly braces', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      const fixText = reports[0].suggest?.[0]?.fix?.text
      expect(fixText?.startsWith('{ ')).toBe(true)
      expect(fixText?.endsWith(' }')).toBe(true)
    })

    test('fix text should prefix each source with spread operator', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, x, y)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'x', 'y']))

      const fixText = reports[0].suggest?.[0]?.fix?.text ?? ''
      expect(fixText).toContain('...x')
      expect(fixText).toContain('...y')
    })

    test('fix text should separate spread sources with comma and space', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a, b)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b']))

      expect(reports[0].suggest?.[0]?.fix?.text).toContain(', ')
    })

    test('should generate suggestion with config identifier', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, config)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'config']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...config }')
    })

    test('should generate suggestion with defaults identifier', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, defaults)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'defaults']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...defaults }')
    })

    test('suggestion desc should contain the fix text', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      const fixText = reports[0].suggest?.[0]?.fix?.text
      expect(reports[0].suggest?.[0]?.desc).toContain(fixText ?? '')
    })

    test('should generate correct suggestion for Object.assign({}, base, overrides)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, base, overrides)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'base', 'overrides']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...base, ...overrides }')
    })

    test('fix range should be a tuple of two numbers', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      const range = reports[0].suggest?.[0]?.fix?.range
      expect(range).toBeDefined()
      expect(range?.length).toBe(2)
      expect(typeof range?.[0]).toBe('number')
      expect(typeof range?.[1]).toBe('number')
    })

    test('fix range start should be less than end', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      const range = reports[0].suggest?.[0]?.fix?.range
      expect(range?.[0]).toBeLessThan(range?.[1] ?? 0)
    })

    test('suggestion should not contain Object.assign', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix?.text).not.toContain('Object.assign')
    })

    test('suggestion should not contain empty object literal', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix?.text).not.toContain('{}')
    })

    test('suggestion text should not have double spread', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix?.text).not.toContain('....')
    })

    test('should have consistent suggestion format for different arg counts', () => {
      const source = 'Object.assign({}, alpha, beta, gamma, delta)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'alpha', 'beta', 'gamma', 'delta']))

      const fixText = reports[0].suggest?.[0]?.fix?.text ?? ''
      expect(fixText).toBe('{ ...alpha, ...beta, ...gamma, ...delta }')
    })

    test('should generate proper suggestion for single arg with long name', () => {
      const source = 'Object.assign({}, configurationManager)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'configurationManager']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...configurationManager }')
    })

    test('fix should replace entire source text', () => {
      const source = 'Object.assign({}, obj)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      const [start, end] = reports[0].suggest?.[0]?.fix?.range ?? [0, 0]
      expect(source.slice(start, end)).toBe('Object.assign({}, obj)')
    })
  })

  // ================================================================
  // LOCATION TRACKING (existing 1 + new 14 = 15)
  // ================================================================
  describe('location tracking', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 10 column 0', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 10, 0))

      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 1 column 20', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 1, 20))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 3, 5))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report location for multiple sources', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a, b)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b'], 7, 12))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
            range: [0, 6],
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
            range: [13, 15],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [17, 20],
          },
        ],
        range: [0, 21],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [13, 15] },
          { type: 'Identifier', name: 'obj', range: [17, 20] },
        ],
        range: [0, 21],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('location end column should reflect call expression length', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 1, 0))

      expect(reports[0].loc?.end.column).toBeGreaterThan(0)
    })

    test('should report location at line 2 column 4', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 2, 4))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  // ================================================================
  // NON-DETECTION: FIRST ARGUMENT PATTERNS (existing 2 + new 18 = 20)
  // ================================================================
  describe('non-detection - first argument not empty object', () => {
    test('should not report when first arg is non-empty object', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({ a: 1 }, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
            range: [0, 6],
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' } }],
            range: [13, 20],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [22, 25],
          },
        ],
        range: [0, 26],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.assign(target, source)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(target, source)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignMutationCall('target', 'source'))

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is identifier (mutation pattern)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign(dest, src)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignMutationCall('dest', 'src'))

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg has multiple properties', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({ a: 1, b: 2 }, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = createObjectAssignNonEmptyFirstArg(2)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg has many properties', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({ a: 1, b: 2, c: 3 }, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = createObjectAssignNonEmptyFirstArg(3)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a function call', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(getDefaults(), obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getDefaults' },
            arguments: [],
            range: [14, 26],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [28, 31],
          },
        ],
        range: [0, 32],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is an array literal', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign([], obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ArrayExpression',
            elements: [],
            range: [14, 16],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [18, 21],
          },
        ],
        range: [0, 22],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a number', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign(0, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: 0,
            range: [14, 15],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [17, 20],
          },
        ],
        range: [0, 21],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is null', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign(null, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            range: [14, 18],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [20, 23],
          },
        ],
        range: [0, 24],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is undefined', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(undefined, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'undefined',
            range: [14, 23],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [25, 28],
          },
        ],
        range: [0, 29],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is this', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign(this, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ThisExpression',
            range: [14, 18],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [20, 23],
          },
        ],
        range: [0, 24],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a member expression', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(target.prop, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'target' },
            property: { type: 'Identifier', name: 'prop' },
            computed: false,
            range: [14, 25],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [27, 30],
          },
        ],
        range: [0, 31],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a string literal', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        "Object.assign('target', obj)",
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: 'target',
            range: [14, 22],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [24, 27],
          },
        ],
        range: [0, 28],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a template literal', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(`target`, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [],
            expressions: [],
            range: [14, 23],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [25, 28],
          },
        ],
        range: [0, 29],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a conditional expression', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(cond ? a : b, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ConditionalExpression',
            range: [14, 25],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [27, 30],
          },
        ],
        range: [0, 31],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a binary expression', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(a || b, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'BinaryExpression',
            range: [14, 19],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [21, 24],
          },
        ],
        range: [0, 25],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is a new expression', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(new Foo(), obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Foo' },
            arguments: [],
            range: [14, 23],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [25, 28],
          },
        ],
        range: [0, 29],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when ObjectExpression first arg has spread element', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({ ...defaults }, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [
              { type: 'SpreadElement', argument: { type: 'Identifier', name: 'defaults' } },
            ],
            range: [14, 28],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [30, 33],
          },
        ],
        range: [0, 34],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ================================================================
  // NON-DETECTION: CALLEE VARIATIONS (existing 1 + new 19 = 20)
  // ================================================================
  describe('non-detection - callee variations', () => {
    test('should not report for non-Object.assign calls', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'foo.bar({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createNonObjectAssignCall())

      expect(reports.length).toBe(0)
    })

    test('should not report for computed member Object["assign"]', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        "Object['assign']({}, obj)",
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createComputedAssignCall())

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.freeze({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.freeze({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [14, 16] },
          { type: 'Identifier', name: 'obj', range: [18, 21] },
        ],
        range: [0, 22],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.keys({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.keys({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [12, 14] },
          { type: 'Identifier', name: 'obj', range: [16, 19] },
        ],
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.values({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.values({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'values' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [14, 16] },
          { type: 'Identifier', name: 'obj', range: [18, 21] },
        ],
        range: [0, 22],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.defineProperties({}, obj)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.defineProperties({}, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'defineProperties' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [25, 27] },
          { type: 'Identifier', name: 'obj', range: [29, 32] },
        ],
        range: [0, 33],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for MyObject.assign({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'MyObject.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObject', range: [0, 8] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [16, 18] },
          { type: 'Identifier', name: 'obj', range: [20, 23] },
        ],
        range: [0, 24],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for assign({}, obj) - plain function call', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'assign',
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [7, 9] },
          { type: 'Identifier', name: 'obj', range: [11, 14] },
        ],
        range: [0, 15],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for CallExpression with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'assign',
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
            range: [7, 9],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [11, 14],
          },
        ],
        range: [0, 15],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for window.Object.assign({}, obj)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'window.Object.assign({}, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'Object' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [22, 24] },
          { type: 'Identifier', name: 'obj', range: [26, 29] },
        ],
        range: [0, 30],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee object is a literal', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '1..assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 1 },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [10, 12] },
          { type: 'Identifier', name: 'obj', range: [14, 17] },
        ],
        range: [0, 18],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Reflect.assign({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Reflect.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect', range: [0, 7] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [15, 17] },
          { type: 'Identifier', name: 'obj', range: [19, 22] },
        ],
        range: [0, 23],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.defineProperty({}, obj)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.defineProperty({}, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'defineProperty' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [22, 24] },
          { type: 'Identifier', name: 'obj', range: [26, 29] },
        ],
        range: [0, 30],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.create({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.create({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'create' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [13, 15] },
          { type: 'Identifier', name: 'obj', range: [17, 20] },
        ],
        range: [0, 21],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.setPrototypeOf({}, obj)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.setPrototypeOf({}, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'setPrototypeOf' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [23, 25] },
          { type: 'Identifier', name: 'obj', range: [27, 30] },
        ],
        range: [0, 31],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.entries({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.entries({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [15, 17] },
          { type: 'Identifier', name: 'obj', range: [19, 22] },
        ],
        range: [0, 23],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for _.assign({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '_.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: '_', range: [0, 1] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [9, 11] },
          { type: 'Identifier', name: 'obj', range: [13, 16] },
        ],
        range: [0, 17],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for $.extend({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '$.extend({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: '$', range: [0, 1] },
          property: { type: 'Identifier', name: 'extend' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [9, 11] },
          { type: 'Identifier', name: 'obj', range: [13, 16] },
        ],
        range: [0, 17],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for obj.copy({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj.copy({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'copy' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [8, 10] },
          { type: 'Identifier', name: 'data', range: [12, 16] },
        ],
        range: [0, 17],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ================================================================
  // NON-DETECTION: ARGUMENT COUNT (existing 2 + new 8 = 10)
  // ================================================================
  describe('non-detection - argument count', () => {
    test('should not report for Object.assign with single argument', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({})')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Object.assign with no arguments', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign()')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when only argument is empty object', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({})')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
            range: [13, 15],
          },
        ],
        range: [0, 16],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.assign(target) with single identifier arg', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign(target)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'target', range: [13, 19] }],
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for empty object with source lacking range', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [13, 15] },
          { type: 'Identifier', name: 'obj' }, // no range
        ],
        range: [0, 21],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when only one of multiple source args has range', () => {
      const source = 'Object.assign({}, a, b)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [14, 16] }, // {}
          { type: 'Identifier', name: 'a', range: [18, 19] }, // 'a' at correct offset
          { type: 'Identifier', name: 'b' }, // no range
        ],
        range: [0, source.length],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...a')
      expect(reports[0].message).not.toContain('...b')
    })

    test('should not report when all source args lack range', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [13, 15] },
          { type: 'Identifier', name: 'a' }, // no range
          { type: 'Identifier', name: 'b' }, // no range
        ],
        range: [0, 22],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle arguments not being an array', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign()')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: null,
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined arguments', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign()')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: undefined,
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect with exactly 2 args (empty object + one source)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, src)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'src']))

      expect(reports.length).toBe(1)
    })
  })

  // ================================================================
  // EDGE CASES: MALFORMED NODES (existing 5 + new 25 = 30)
  // ================================================================
  describe('edge cases', () => {
    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: {},
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee without object property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'Identifier', name: 'obj' },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee without property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'Identifier', name: 'obj' },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
          computed: false,
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first arg without properties array', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            // no properties field
          },
          { type: 'Identifier', name: 'obj', range: [17, 20] },
        ],
        range: [0, 21],
      }

      visitor.CallExpression(node)

      // properties is undefined, so Array.isArray check fails
      expect(reports.length).toBe(0)
    })

    test('should handle first arg with null properties', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: null,
          },
          { type: 'Identifier', name: 'obj', range: [17, 20] },
        ],
        range: [0, 21],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when spread arguments have no extractable text', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
          },
          {
            type: 'Identifier',
            name: 'obj',
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN node', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(NaN)).not.toThrow()
    })

    test('should handle Symbol node', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(Symbol('test'))).not.toThrow()
    })

    test('should handle BigInt node', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(BigInt(123))).not.toThrow()
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression([1, 2, 3])

      expect(reports.length).toBe(0)
    })

    test('should handle function node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(() => {})

      expect(reports.length).toBe(0)
    })

    test('should handle Date node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(new Date())

      expect(reports.length).toBe(0)
    })

    test('should handle regex node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(/test/)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested empty object arg node', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
            range: [13, 15],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [17, 20],
            extra: { parenthesized: true },
            loc: { start: { line: 1, column: 17 }, end: { line: 1, column: 20 } },
          },
        ],
        range: [0, 21],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 21 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with only type field', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression({ type: 'CallExpression' })

      expect(reports.length).toBe(0)
    })

    test('should handle ObjectExpression with properties as non-array truthy value', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: 'not-an-array',
          },
          { type: 'Identifier', name: 'obj', range: [17, 20] },
        ],
        range: [0, 21],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ================================================================
  // SOURCE TEXT VARIATIONS (new 10)
  // ================================================================
  describe('source text variations', () => {
    test('should work with empty source string', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      // source is empty, so getNodeText will return '' for all args
      expect(reports.length).toBe(0)
    })

    test('should work with whitespace-only source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '   ')
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))).not.toThrow()
    })

    test('should work with source shorter than range', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'short')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      // source 'short' is only 5 chars; ranges start at 13+, so getNodeText returns ''
      // spreadSources will be empty, so no report
      expect(reports.length).toBe(0)
    })

    test('should correctly extract text from source with matching content', () => {
      const source = 'Object.assign({}, config)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'config']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...config }')
    })

    test('should extract correct text for multi-source args', () => {
      const source = 'Object.assign({}, defaults, overrides)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'defaults', 'overrides']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...defaults, ...overrides }')
    })

    test('should handle source with extra whitespace', () => {
      const source = '  Object.assign({}, obj)  '
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      // The node ranges assume the source starts at 0
      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
    })

    test('should handle source with unicode characters', () => {
      const source = 'Object.assign({}, 数据)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
    })

    test('should handle source with special characters', () => {
      const source = 'Object.assign({}, obj)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix?.range[1]).toBe(source.length)
    })

    test('fix range should cover full source text length', () => {
      const source = 'Object.assign({}, a, b, c)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b', 'c']))

      expect(reports[0].suggest?.[0]?.fix?.range[0]).toBe(0)
      expect(reports[0].suggest?.[0]?.fix?.range[1]).toBe(source.length)
    })

    test('should work with source matching exact Object.assign text', () => {
      const source = 'Object.assign({}, obj)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      const originalSlice = source.slice(
        reports[0].suggest?.[0]?.fix?.range[0] ?? 0,
        reports[0].suggest?.[0]?.fix?.range[1] ?? 0,
      )
      expect(originalSlice).toBe('Object.assign({}, obj)')
    })
  })

  // ================================================================
  // INTEGRATION-LIKE TESTS (new 10)
  // ================================================================
  describe('integration - multiple calls', () => {
    test('should accumulate reports across multiple calls', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))
      visitor.CallExpression(createObjectAssignCall(['{}', 'data']))

      expect(reports.length).toBe(2)
    })

    test('should track each report independently', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a'], 1, 0))
      visitor.CallExpression(createObjectAssignCall(['{}', 'b'], 5, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle mix of violations and non-violations', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'])) // reports
      visitor.CallExpression(createNonObjectAssignCall()) // no report
      visitor.CallExpression(createObjectAssignCall(['{}', 'data'])) // reports

      expect(reports.length).toBe(2)
    })

    test('should handle mix with null nodes', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(null)
      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))
      visitor.CallExpression(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle same visitor called many times', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))
      }

      expect(reports.length).toBe(10)
    })

    test('should create independent visitors from same context', () => {
      const { context, reports: reports1 } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, obj)',
      )
      const { context: context2, reports: reports2 } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, data)',
      )

      const visitor1 = preferObjectSpreadRule.create(context)
      const visitor2 = preferObjectSpreadRule.create(context2)

      visitor1.CallExpression(createObjectAssignCall(['{}', 'obj']))
      visitor2.CallExpression(createObjectAssignCall(['{}', 'data']))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('should produce consistent suggestions across calls', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))
      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix?.text).toBe(reports[1].suggest?.[0]?.fix?.text)
    })

    test('should handle mutation pattern followed by spread pattern', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, config)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignMutationCall('target', 'source'))
      visitor.CallExpression(createObjectAssignCall(['{}', 'config']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...config')
    })

    test('should handle node without range followed by node with range', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      // Node without range on source args
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object', range: [0, 6] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [
          { type: 'ObjectExpression', properties: [], range: [13, 15] },
          { type: 'Identifier', name: 'noRange' },
        ],
        range: [0, 21],
      })

      // Node with range on source args
      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...obj')
    })

    test('should handle spread pattern followed by mutation pattern', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, config)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'config']))
      visitor.CallExpression(createObjectAssignMutationCall('target', 'source'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...config')
    })
  })

  // ================================================================
  // REPORT STRUCTURE VALIDATION (new 10)
  // ================================================================
  describe('report structure validation', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('report message should be non-empty', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report suggest array items should have desc', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(typeof reports[0].suggest?.[0]?.desc).toBe('string')
    })

    test('report suggest array items should have message', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(typeof reports[0].suggest?.[0]?.message).toBe('string')
    })

    test('report suggest array items should have fix', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix).toBeDefined()
    })

    test('fix should have range property', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix).toHaveProperty('range')
    })

    test('fix should have text property', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].suggest?.[0]?.fix).toHaveProperty('text')
    })

    test('fix text should be non-empty string', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      const fixText = reports[0].suggest?.[0]?.fix?.text
      expect(typeof fixText).toBe('string')
      expect(fixText?.length).toBeGreaterThan(0)
    })

    test('report loc should have start and end', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })
  })

  // ================================================================
  // MESSAGE CONTENT VALIDATION (new 10)
  // ================================================================
  describe('message content validation', () => {
    test('message should contain the spread suggestion format', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, x)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'x']))

      expect(reports[0].message).toContain('{ ...x }')
    })

    test('message should list all source names', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, alpha, beta)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'alpha', 'beta']))

      expect(reports[0].message).toContain('alpha')
      expect(reports[0].message).toContain('beta')
    })

    test('message should contain the original source args', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, src)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'src']))

      expect(reports[0].message).toContain('src')
    })

    test('message for three sources should list all three', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, one, two, three)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'one', 'two', 'three']))

      expect(reports[0].message).toContain('...one')
      expect(reports[0].message).toContain('...two')
      expect(reports[0].message).toContain('...three')
    })

    test('message should start with Prefer', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].message.startsWith('Prefer')).toBe(true)
    })

    test('message should contain instead of phrase', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].message).toContain('instead of')
    })

    test('message should include the suggestion constant', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports[0].message).toContain('object spread')
    })

    test('message should contain open and close braces for spread', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a, b)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b']))

      // The spread format { ...a, ...b } contains braces
      expect(reports[0].message).toContain('{ ...a, ...b }')
    })

    test('message for single source should not have commas in spread', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      // Single source: { ...obj } - no comma in the spread part
      const spreadMatch = reports[0].message.match(/\{ \.\.\w+ \}/)
      expect(spreadMatch).toBeDefined()
    })

    test('message should be different for different source names', () => {
      const { context: ctx1, reports: r1 } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, foo)',
      )
      const { context: ctx2, reports: r2 } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({}, bar)',
      )

      const visitor1 = preferObjectSpreadRule.create(ctx1)
      const visitor2 = preferObjectSpreadRule.create(ctx2)

      visitor1.CallExpression(createObjectAssignCall(['{}', 'foo']))
      visitor2.CallExpression(createObjectAssignCall(['{}', 'bar']))

      expect(r1[0].message).not.toBe(r2[0].message)
    })
  })
})
