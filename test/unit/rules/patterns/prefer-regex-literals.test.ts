import { describe, test, expect, vi } from 'vitest'
import { preferRegexLiteralsRule } from '../../../../src/rules/patterns/prefer-regex-literals.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new RegExp("abc");',
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

function createNewExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
  }
}

function createTemplateElement(value: string): unknown {
  return {
    type: 'TemplateElement',
    value: { raw: value, cooked: value },
  }
}

function createBinaryExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
  }
}

function createObjectExpression(properties: unknown[]): unknown {
  return {
    type: 'ObjectExpression',
    properties,
  }
}

function createArrayExpression(elements: unknown[]): unknown {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
  }
}

function createArrowFunctionExpression(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: createLiteral(''),
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

function createLogicalExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    left,
    operator,
    right,
  }
}

function createTaggedTemplateExpression(tag: unknown, quasi: unknown): unknown {
  return {
    type: 'TaggedTemplateExpression',
    tag,
    quasi,
  }
}

function createFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createUpdateExpression(operator: string, argument: unknown, prefix: boolean): unknown {
  return {
    type: 'UpdateExpression',
    operator,
    argument,
    prefix,
  }
}

function createAssignmentExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    left,
    operator,
    right,
  }
}

function createSequenceExpression(expressions: unknown[]): unknown {
  return {
    type: 'SequenceExpression',
    expressions,
  }
}

function createAwaitExpression(argument: unknown): unknown {
  return {
    type: 'AwaitExpression',
    argument,
  }
}

function createNewExpressionExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
  }
}

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createYieldExpression(argument: unknown): unknown {
  return {
    type: 'YieldExpression',
    argument,
    delegate: false,
  }
}

describe('prefer-regex-literals rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferRegexLiteralsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferRegexLiteralsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferRegexLiteralsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferRegexLiteralsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferRegexLiteralsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferRegexLiteralsRule.meta.fixable).toBeUndefined()
    })

    test('should mention regex literal in description', () => {
      expect(preferRegexLiteralsRule.meta.docs?.description.toLowerCase()).toContain('literal')
    })

    test('should have docs url', () => {
      expect(preferRegexLiteralsRule.meta.docs?.url).toBeDefined()
    })

    test('should mention RegExp constructor in description', () => {
      expect(preferRegexLiteralsRule.meta.docs?.description).toContain('RegExp')
    })

    test('should mention dynamic in description', () => {
      expect(preferRegexLiteralsRule.meta.docs?.description.toLowerCase()).toContain('dynamic')
    })

    test('should have readable description', () => {
      expect(preferRegexLiteralsRule.meta.docs?.description.length).toBeGreaterThan(20)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should return NewExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('should create independent visitors for each context', () => {
      const { context: ctx1 } = createMockContext()
      const { context: ctx2 } = createMockContext()
      const visitor1 = preferRegexLiteralsRule.create(ctx1)
      const visitor2 = preferRegexLiteralsRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting new RegExp() with string literal pattern', () => {
    test('should report new RegExp("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/')
    })

    test('should report new RegExp("test", "i")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('test'),
        createLiteral('i'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/test/i')
    })

    test('should report new RegExp("pattern", "gi")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('pattern'),
        createLiteral('gi'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/pattern/gi')
    })

    test('should report new RegExp() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp("") with empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral('')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp("x") with single character', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('x')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/x/')
    })

    test('should report new RegExp("hello world") with space', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('hello world')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/hello world/')
    })

    test('should report new RegExp("  ") with only spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('  ')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/  /')
    })

    test('should report new RegExp("\\t") with tab character', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('\t')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('individual regex flags', () => {
    test('should report new RegExp("abc", "g")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), createLiteral('g')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/g')
    })

    test('should report new RegExp("abc", "i")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), createLiteral('i')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/i')
    })

    test('should report new RegExp("abc", "m")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), createLiteral('m')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/m')
    })

    test('should report new RegExp("abc", "s")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), createLiteral('s')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/s')
    })

    test('should report new RegExp("abc", "u")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), createLiteral('u')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/u')
    })

    test('should report new RegExp("abc", "y")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), createLiteral('y')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/y')
    })
  })

  describe('two-flag combinations', () => {
    test('should report new RegExp("ab", "gi")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('gi')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/gi')
    })

    test('should report new RegExp("ab", "gm")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('gm')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/gm')
    })

    test('should report new RegExp("ab", "gs")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('gs')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/gs')
    })

    test('should report new RegExp("ab", "gu")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('gu')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/gu')
    })

    test('should report new RegExp("ab", "im")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('im')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/im')
    })

    test('should report new RegExp("ab", "is")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('is')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/is')
    })

    test('should report new RegExp("ab", "iu")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('iu')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/iu')
    })

    test('should report new RegExp("ab", "iy")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('iy')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/iy')
    })

    test('should report new RegExp("ab", "ms")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('ms')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/ms')
    })

    test('should report new RegExp("ab", "su")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('ab'), createLiteral('su')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/ab/su')
    })
  })

  describe('three-plus flag combinations', () => {
    test('should report new RegExp("x", "gim")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('x'), createLiteral('gim')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/x/gim')
    })

    test('should report new RegExp("x", "giy")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('x'), createLiteral('giy')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/x/giy')
    })

    test('should report new RegExp("x", "gms")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('x'), createLiteral('gms')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/x/gms')
    })

    test('should report new RegExp("x", "imsu")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('x'),
          createLiteral('imsu'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/x/imsu')
    })

    test('should report new RegExp("x", "gimsuy")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('x'),
          createLiteral('gimsuy'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/x/gimsuy')
    })
  })

  describe('patterns with regex special characters', () => {
    test('should report new RegExp(".")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('.')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/./')
    })

    test('should report new RegExp("a*")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('a*')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/a*/')
    })

    test('should report new RegExp("a+")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('a+')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/a+/')
    })

    test('should report new RegExp("a?")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('a?')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/a?/')
    })

    test('should report new RegExp("^abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('^abc')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/^abc/')
    })

    test('should report new RegExp("abc$")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc$')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc$/')
    })

    test('should report new RegExp("a|b")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('a|b')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/a|b/')
    })

    test('should report new RegExp("(abc)")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('(abc)')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/(abc)/')
    })

    test('should report new RegExp("[abc]")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('[abc]')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/[abc]/')
    })

    test('should report new RegExp("a{3}")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('a{3}')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/a{3}/')
    })

    test('should report new RegExp("\\\\d") with backslash-d', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('\\d')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\d')
    })

    test('should report new RegExp("\\\\w+") with backslash-w', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\w+')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\w+')
    })

    test('should report new RegExp("\\\\s+") with backslash-s', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\s+')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\s+')
    })

    test('should report new RegExp("\\\\b") with backslash-b', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('\\b')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\b')
    })

    test('should report new RegExp("[^abc]") with negated character class', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('[^abc]')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/[^abc]/')
    })
  })

  describe('patterns needing escape (forward slash)', () => {
    test('should report new RegExp("a/b") with forward slash', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('a/b')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a/b')
    })

    test('should report new RegExp("http://") with multiple forward slashes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('http://')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('http://')
    })

    test('should report new RegExp("/") with only forward slash', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('/')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/')
    })
  })

  describe('patterns needing escape (backslash sequences)', () => {
    test('should report new RegExp with backslash-n in pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('\\n')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\n')
    })

    test('should report new RegExp with backslash-r in pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('\\r')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\r')
    })

    test('should report new RegExp with both backslash-n and backslash-r', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\n\\r')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\n\\r')
    })
  })

  describe('empty pattern with flags', () => {
    test('should report new RegExp("", "g")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral(''), createLiteral('g')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('//g')
    })

    test('should report new RegExp("", "i")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral(''), createLiteral('i')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp("", "m")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral(''), createLiteral('m')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp("", "gi")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral(''), createLiteral('gi')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp("", "u")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral(''), createLiteral('u')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report empty pattern with special empty message when no flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(?:)')
    })
  })

  describe('template literal patterns', () => {
    test('should not report new RegExp with simple template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const templateLit = createTemplateLiteral([createTemplateElement('abc')], [])

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [templateLit]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with template literal containing expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const templateLit = createTemplateLiteral(
        [createTemplateElement('prefix'), createTemplateElement('suffix')],
        [createIdentifier('var')],
      )

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [templateLit]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with tagged template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const taggedTemplate = createTaggedTemplateExpression(
        createIdentifier('tag'),
        createTemplateLiteral([createTemplateElement('pattern')], []),
      )

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [taggedTemplate]))

      expect(reports.length).toBe(0)
    })

    test('should not report template literal flags with literal pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const flagsTemplate = createTemplateLiteral([createTemplateElement('gi')], [])

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), flagsTemplate]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report both args as template literals', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const patternTemplate = createTemplateLiteral([createTemplateElement('abc')], [])
      const flagsTemplate = createTemplateLiteral([createTemplateElement('gi')], [])

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [patternTemplate, flagsTemplate]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const emptyTemplate = createTemplateLiteral([createTemplateElement('')], [])

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [emptyTemplate]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting dynamic patterns', () => {
    test('should not report new RegExp(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createIdentifier('variable')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp(getPattern())', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const callExpr = createCallExpression(createIdentifier('getPattern'), [])
      const node = createNewExpression(createIdentifier('RegExp'), [callExpr])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp(pattern, flagsVar)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('test'),
        createIdentifier('flagsVar'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp(userInput, "i")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createIdentifier('userInput'),
        createLiteral('i'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with binary expression as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const binaryExpr = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [binaryExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with object expression as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const objExpr = createObjectExpression([])

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [objExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with array expression as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const arrExpr = createArrayExpression([createLiteral('a')])

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [arrExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with conditional expression as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const condExpr = createConditionalExpression(
        createIdentifier('flag'),
        createLiteral('a'),
        createLiteral('b'),
      )

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [condExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with arrow function as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const arrowFn = createArrowFunctionExpression()

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [arrowFn]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with unary expression as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const unaryExpr = createUnaryExpression('!', createIdentifier('x'))

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [unaryExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with logical expression as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const logicalExpr = createLogicalExpression(
        createIdentifier('a'),
        '||',
        createIdentifier('b'),
      )

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [logicalExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with spread element as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const spread = createSpreadElement(createIdentifier('args'))

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [spread]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with function expression as pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const fnExpr = createFunctionExpression()

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [fnExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with update expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const updateExpr = createUpdateExpression('++', createIdentifier('i'), false)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [updateExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with assignment expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const assignExpr = createAssignmentExpression(
        createIdentifier('x'),
        '=',
        createLiteral('test'),
      )

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [assignExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with sequence expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const seqExpr = createSequenceExpression([createLiteral('a'), createLiteral('b')])

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [seqExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with await expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const awaitExpr = createAwaitExpression(createIdentifier('promise'))

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [awaitExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with yield expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const yieldExpr = createYieldExpression(createLiteral('val'))

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [yieldExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp with nested new expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const nestedNew = createNewExpressionExpression(createIdentifier('Pattern'), [])

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [nestedNew]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting other constructors', () => {
    test('should not report new Other()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('Other'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('Array'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('Set'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Map'), []))

      expect(reports.length).toBe(0)
    })

    test('should not report new WeakMap()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('WeakMap'), []))

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Promise'), []))

      expect(reports.length).toBe(0)
    })

    test('should not report new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Error'), []))

      expect(reports.length).toBe(0)
    })

    test('should not report new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Date'), []))

      expect(reports.length).toBe(0)
    })

    test('should not report new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), []))

      expect(reports.length).toBe(0)
    })

    test('should not report new MyRegExp() with custom class', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('MyRegExp'), [createLiteral('abc')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('RegExp'))

      visitor.NewExpression(createNewExpression(memberExpr, [createLiteral('abc')]))

      expect(reports.length).toBe(0)
    })

    test('should not report with deeply nested member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const innerMember = createMemberExpression(
        createIdentifier('window'),
        createIdentifier('RegExp'),
      )
      const outerMember = createMemberExpression(innerMember, createIdentifier('prototype'))

      visitor.NewExpression(createNewExpression(outerMember, [createLiteral('abc')]))

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive - should not report new regexp()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('regexp'), [createLiteral('abc')]))

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive - should not report new REGEXP()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('REGEXP'), [createLiteral('abc')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral('test')], 25, 10)

      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [createLiteral('abc')],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
    })

    test('should handle non-string pattern literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral(123)])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-string flags literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('test'),
        createLiteral(123),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {},
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle boolean pattern literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should handle null pattern literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should handle undefined pattern literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral(undefined)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle boolean flags literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('abc'),
          createLiteral(true),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle callee that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [createLiteral('abc')],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee that is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createLiteral('RegExp'),
        arguments: [createLiteral('abc')],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: 'not-an-array',
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
    })

    test('should handle three arguments to RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('abc'),
          createLiteral('gi'),
          createLiteral('extra'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/gi')
    })

    test('should handle many arguments to RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('abc'),
          createLiteral('gi'),
          createLiteral('extra1'),
          createLiteral('extra2'),
          createLiteral('extra3'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/gi')
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
        range: [0, 20],
        extra: { parenthesized: true },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty string flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), createLiteral('')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/')
    })

    test('should handle single character flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('xyz'), createLiteral('g')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/xyz/g')
    })
  })

  describe('location reporting variations', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')], 1, 0),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')], 500, 0),
      )

      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')], 1, 200),
      )

      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should report both start and end locations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')], 3, 5),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle loc with only start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 10, column: 5 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle negative line number gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: -1, column: 0 },
          end: { line: -1, column: 10 },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })
  })

  describe('complex realistic patterns', () => {
    test('should report email-like pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('[a-zA-Z0-9]+@[a-zA-Z]+\\.[a-zA-Z]+'),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report URL-like pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('https?://[^\\s]+')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report phone-like pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\d{3}-\\d{3}-\\d{4}')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report IP address pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report hex color pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('#[0-9a-fA-F]{6}')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\d{4}-\\d{2}-\\d{2}')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report word boundary pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\bword\\b')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report non-capturing group pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('(?:abc|def)')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report lookahead pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('foo(?=bar)')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report lookbehind pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('(?<=foo)bar')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unicode pattern with u flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('\\p{L}+'),
          createLiteral('u'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('u')
    })

    test('should report named group pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('(?<name>\\w+)')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report complex alternation pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('(red|green|blue)')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report quantifier range pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('a{2,5}')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report character class range pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('[a-z0-9]')]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention regex literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports[0].message).toContain('/abc/')
    })

    test('should include pattern in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('mypattern')]),
      )

      expect(reports[0].message).toContain('mypattern')
    })

    test('should include flags in message when present', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('test'),
          createLiteral('gi'),
        ]),
      )

      expect(reports[0].message).toContain('gi')
    })

    test('should mention new RegExp in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports[0].message).toContain('new RegExp')
    })

    test('should show pattern without flags correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('hello')]),
      )

      expect(reports[0].message).toContain('/hello/')
      expect(reports[0].message).toContain('new RegExp("hello")')
    })

    test('should show pattern with flags correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('hello'),
          createLiteral('gi'),
        ]),
      )

      expect(reports[0].message).toContain('/hello/gi')
      expect(reports[0].message).toContain('new RegExp("hello", "gi")')
    })

    test('should mention (?:) for empty pattern without flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('')]))

      expect(reports[0].message).toContain('(?:)')
    })

    test('should mention empty pattern for no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(?:)')
    })

    test('should include literal suggestion for special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('a*b+c?')]),
      )

      expect(reports[0].message).toContain('/a*b+c?/')
    })

    test('should include literal suggestion for anchors', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('^test$')]),
      )

      expect(reports[0].message).toContain('/^test$/')
    })
  })

  describe('repeated invocations', () => {
    test('should report each invocation separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))
      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('def')]))

      expect(reports.length).toBe(2)
    })

    test('should report three separate invocations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('a')]))
      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('b')]))
      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('c')]))

      expect(reports.length).toBe(3)
    })

    test('should report mixed valid and invalid invocations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))
      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createIdentifier('variable')]),
      )
      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('def')]))

      expect(reports.length).toBe(2)
    })

    test('should not report for non-RegExp invocations between valid ones', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral('abc')]))
      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('def')]))

      expect(reports.length).toBe(2)
    })

    test('should handle many invocations without issues', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.NewExpression(
          createNewExpression(createIdentifier('RegExp'), [createLiteral(`pattern${i}`)]),
        )
      }

      expect(reports.length).toBe(50)
    })
  })

  describe('config variations', () => {
    test('should work with no config options', () => {
      const mockCtx = {
        report: vi.fn(),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'new RegExp("abc")',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferRegexLiteralsRule.create(mockCtx)

      expect(() =>
        visitor.NewExpression(
          createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]),
        ),
      ).not.toThrow()
    })

    test('should work with null config options', () => {
      const mockCtx = {
        report: vi.fn(),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'new RegExp("abc")',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferRegexLiteralsRule.create(mockCtx)

      expect(() =>
        visitor.NewExpression(
          createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]),
        ),
      ).not.toThrow()
    })

    test('should work with undefined config options', () => {
      const mockCtx = {
        report: vi.fn(),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'new RegExp("abc")',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferRegexLiteralsRule.create(mockCtx)

      expect(() =>
        visitor.NewExpression(
          createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]),
        ),
      ).not.toThrow()
    })

    test('should work with custom option properties', () => {
      const { context, reports } = createMockContext({
        customOption: true,
        anotherOption: 'value',
      })
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/to/file.js')
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('pattern with unicode and special chars', () => {
    test('should report pattern with unicode escape sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\u0041')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\u0041')
    })

    test('should report pattern with hex escape sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\x41')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\x41')
    })

    test('should report pattern with escaped special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('\\.\\*\\+\\?')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report pattern with tab escape', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('\\t')]))

      expect(reports.length).toBe(1)
    })

    test('should report pattern with backreference', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('(abc)\\1')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(abc)\\1')
    })
  })

  describe('boundary value patterns', () => {
    test('should report very long pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const longPattern = 'a'.repeat(1000)
      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral(longPattern)]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longPattern)
    })

    test('should report pattern with repeated groups', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('(abc)(def)(ghi)')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report pattern with nested groups', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('((a)(b))')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report pattern with only anchors', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('^$')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/^$/')
    })

    test('should report pattern with only alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('|')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/|/')
    })
  })

  describe('combined pattern and flag scenarios', () => {
    test('should report special char pattern with global flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('\\d+'),
          createLiteral('g'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/\\d+/g')
    })

    test('should report anchor pattern with multiline flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('^test'),
          createLiteral('m'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/^test/m')
    })

    test('should report dot pattern with dotall flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('.'), createLiteral('s')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/./s')
    })

    test('should report complex pattern with all common flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('[\\w\\s]+'),
          createLiteral('gim'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/[\\w\\s]+/gim')
    })

    test('should report forward slash pattern with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('path/to/file'),
          createLiteral('gi'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('path/to/file')
      expect(reports[0].message).toContain('gi')
    })
  })

  describe('node type filtering', () => {
    test('should not process CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not process ExpressionStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createLiteral('test'),
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not process Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createLiteral('abc'))

      expect(reports.length).toBe(0)
    })

    test('should not process empty string type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: '',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('callee edge cases', () => {
    test('should handle callee as undefined identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: undefined },
        arguments: [createLiteral('abc')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee identifier with empty name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier(''), [createLiteral('abc')]))

      expect(reports.length).toBe(0)
    })

    test('should handle callee identifier with RegExp-like name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExpX'), [createLiteral('abc')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle callee identifier with XRegExp name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('XRegExp'), [createLiteral('abc')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('argument edge cases', () => {
    test('should handle first arg as null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should handle regex literal as first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const regexLiteral = {
        type: 'Literal',
        value: /test/,
        regex: { pattern: 'test', flags: '' },
      }

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [regexLiteral]))

      expect(reports.length).toBe(0)
    })

    test('should handle first arg as numeric string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('123')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/123/')
    })

    test('should handle pattern with whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('  leading trailing  ')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle pattern with newlines in string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('line1\nline2')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle pattern with carriage returns in string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('line1\rline2')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle second arg as non-Literal non-identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const objExpr = createObjectExpression([])

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('abc'), objExpr]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), []))

      expect(reports.length).toBe(1)
    })
  })
})
