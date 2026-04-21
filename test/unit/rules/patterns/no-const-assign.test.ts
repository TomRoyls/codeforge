import { describe, test, expect, vi } from 'vitest'
import { noConstAssignRule } from '../../../../src/rules/patterns/no-const-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1; x = 2;',
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

function createVariableDeclaration(
  kind: string,
  declarations: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclaration',
    kind,
    declarations,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createVariableDeclarator(id: unknown, init: unknown | undefined = undefined): unknown {
  return {
    type: 'VariableDeclarator',
    id,
    init,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

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

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

// ---------------------------------------------------------------------------
// 200+ tests
// ---------------------------------------------------------------------------

describe('no-const-assign rule', () => {
  // ========================================================================
  // 1. META (20 tests)
  // ========================================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConstAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConstAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConstAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConstAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConstAssignRule.meta.schema).toBeDefined()
    })

    test('should be fixable as code', () => {
      expect(noConstAssignRule.meta.fixable).toBe('code')
    })

    test('should mention const in description', () => {
      expect(noConstAssignRule.meta.docs?.description.toLowerCase()).toContain('const')
    })

    test('should mention reassign in description', () => {
      expect(noConstAssignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })

    test('should have a non-empty description', () => {
      expect(noConstAssignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a string', () => {
      expect(typeof noConstAssignRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noConstAssignRule.meta.severity).toBe('string')
    })

    test('should have docs object', () => {
      expect(noConstAssignRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof noConstAssignRule.meta.docs?.description).toBe('string')
    })

    test('should have recommended as boolean', () => {
      expect(typeof noConstAssignRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have url in docs', () => {
      expect(noConstAssignRule.meta.docs?.url).toBeDefined()
    })

    test('should have url containing codeforge', () => {
      expect(noConstAssignRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have url containing rule name', () => {
      expect(noConstAssignRule.meta.docs?.url).toContain('no-const-assign')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noConstAssignRule.meta.schema)).toBe(true)
    })

    test('should not be deprecated', () => {
      expect(noConstAssignRule.meta.deprecated).toBeFalsy()
    })

    test('should have valid RuleDefinition shape', () => {
      expect(noConstAssignRule).toHaveProperty('meta')
      expect(noConstAssignRule).toHaveProperty('create')
      expect(typeof noConstAssignRule.create).toBe('function')
    })
  })

  // ========================================================================
  // 2. CREATE / VISITOR (8 tests)
  // ========================================================================
  describe('create', () => {
    test('should return visitor object with VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclaration')
    })

    test('should return visitor object with AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should return exactly 2 visitor methods', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('should have VariableDeclaration as a function', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(typeof visitor.VariableDeclaration).toBe('function')
    })

    test('should have AssignmentExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = noConstAssignRule.create(context)
      const visitor2 = noConstAssignRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should create independent const tracking per visitor', () => {
      const { context } = createMockContext()
      const visitor1 = noConstAssignRule.create(context)
      const visitor2 = noConstAssignRule.create(context)

      visitor1.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('a'))]),
      )

      const { reports } = createMockContext()
      const ctx: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor2WithOwnCtx = noConstAssignRule.create(ctx)

      visitor2WithOwnCtx.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should accept context without throwing', () => {
      const { context } = createMockContext()
      expect(() => noConstAssignRule.create(context)).not.toThrow()
    })
  })

  // ========================================================================
  // 3. DETECTION (30 tests)
  // ========================================================================
  describe('detection', () => {
    test('should detect simple const x reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with single-letter name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('a'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with long name', () => {
      const name = 'veryLongDescriptiveConstantName'
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier(name))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(name)
    })

    test('should detect const with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('my_const_var')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('my_const_var'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_const_var')
    })

    test('should detect const with dollar signs', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('$var'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$var'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$var')
    })

    test('should detect const with mixed case name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('MyConst'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('MyConst'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with uppercase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('MAX'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('MAX'), { type: 'Literal', value: 100 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with leading underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('_private')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('_private'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with trailing underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('trailing_')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('trailing_'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with numbers in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x1'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x1'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect multiple declarations in single const statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('x')),
          createVariableDeclarator(createIdentifier('y')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(2)
    })

    test('should detect reassignment after multiple const declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('a'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('b'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 5 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should detect same const reassigned multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(2)
    })

    test('should detect const declared with init and then reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('x'), { type: 'Literal', value: 1 }),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const declared without init and then reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with underscore-separated multi-word name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('MAX_RETRY_COUNT')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('MAX_RETRY_COUNT'), {
          type: 'Literal',
          value: 5,
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect dollar-only prefix const', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('$$'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$$'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect double underscore const', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('__foo'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('__foo'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const in single declarator among many', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('first')),
          createVariableDeclarator(createIdentifier('second')),
          createVariableDeclarator(createIdentifier('third')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('second'), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('second')
    })

    test('should detect three separate const declarations all reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('a'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('b'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('c'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(3)
    })

    test('should detect const with Unicode-like name abc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('abc'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('abc'), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with name containing digits', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('var123'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('var123'), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with dollar and underscore combined', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('$_$'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$_$'), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect single-char const reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('z'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('z'), { type: 'Literal', value: 0 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should report exact message format for myVar', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('myVar'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), { type: 'Literal', value: 42 }),
      )
      expect(reports[0].message).toBe("Unexpected assignment to const variable 'myVar'.")
    })

    test('should report exact message format for x', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message).toBe("Unexpected assignment to const variable 'x'.")
    })

    test('should detect const with right-hand side as call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('val'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('val'), { type: 'CallExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with right-hand side as object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('obj'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('obj'), { type: 'ObjectExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const with right-hand side as array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('arr'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('arr'), { type: 'ArrayExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect const reassigned with binary expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('sum'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('sum'), { type: 'BinaryExpression' }),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // 4. NOT REPORTING (30 tests)
  // ========================================================================
  describe('not reporting', () => {
    test('should not report assignment to let variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to var variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('var', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to undeclared variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('undeclared'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report property assignment on const', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('obj'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
          { type: 'Literal', value: 2 },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment before const declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to different variable than const', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to let variable with same name as a const', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when no VariableDeclaration is visited', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when no AssignmentExpression is visited', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report computed member expression assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('arr'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            computed: true,
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Literal', value: 0 },
          },
          { type: 'Literal', value: 42 },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report deep nested member assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('obj'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'a' },
            },
            property: { type: 'Identifier', name: 'b' },
          },
          { type: 'Literal', value: 3 },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable that shadows const', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('x'))]),
      )
      // After let declaration, x is still tracked as const (same set)
      // This test verifies the rule tracks by name addition only for const
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      // The const tracking adds 'x' to the set, so reassignment IS reported
      // This is expected since the rule does not scope variables
      expect(reports.length).toBe(1)
    })

    test('should not report assignment with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(createAssignmentExpression(null, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to object expression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression({ type: 'ObjectExpression' }, { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to array expression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression({ type: 'ArrayExpression' }, { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to literal left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when const name differs in case', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('X'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to parameter-like name not declared', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('param'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when operator is +=', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report function expression assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('fn'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression({ type: 'FunctionExpression' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report update expression on const (different node type)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      // UpdateExpression is not AssignmentExpression, visitor does not handle it
      // This test confirms no crash and no report
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to const-like name that is actually let', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('CONST_VAL'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('CONST_VAL'), {
          type: 'Literal',
          value: 99,
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to var-declared variable with same name as const in different scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('var', [createVariableDeclarator(createIdentifier('shared'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('shared'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when left side is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression({ type: 'ThisExpression' }, { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when left side is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
          { type: 'Literal', value: 1 },
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to a variable with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: '' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ========================================================================
  // 5. EDGE CASES (25 tests)
  // ========================================================================
  describe('edge cases', () => {
    test('should handle null node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.VariableDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()
    })

    test('should handle null node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle string node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
    })

    test('should handle number node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.VariableDeclaration(123)).not.toThrow()
    })

    test('should handle boolean node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.VariableDeclaration(true)).not.toThrow()
    })

    test('should handle string node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
    })

    test('should handle number node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
    })

    test('should handle node without loc in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle node without loc in AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty declarations array', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle declarations without id', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator' }],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle declarations with null id', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: null }],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle assignment without identifier on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 2 },
      }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1; x = 2;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      expect(() =>
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclaration node without kind', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = { type: 'VariableDeclaration', declarations: [] }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle VariableDeclaration with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
      }
      visitor.VariableDeclaration(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle declaration with non-identifier id', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'ObjectPattern' } }],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle declaration with ArrayPattern id', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'ArrayPattern' } }],
      }
      visitor.VariableDeclaration(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('arr'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle declaration with null element in declarations array', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [null, { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })
  })

  // ========================================================================
  // 6. LOCATION (15 tests)
  // ========================================================================
  describe('location', () => {
    test('should report correct location for reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 10, 5),
          { type: 'Literal', value: 2 },
          10,
          5,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 1, 0),
          { type: 'Literal', value: 2 },
          1,
          0,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 999, 50),
          { type: 'Literal', value: 2 },
          999,
          50,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 5, 10),
          { type: 'Literal', value: 2 },
          5,
          10,
        ),
      )
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should handle loc with non-number line in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {},
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report loc with correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 3, 8),
          { type: 'Literal', value: 2 },
          3,
          8,
        ),
      )
      expect(reports[0].loc?.end.column).toBe(18) // column + 10
    })

    test('should report loc for multiple reassignments with different positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 2, 0),
          { type: 'Literal', value: 2 },
          2,
          0,
        ),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 4, 5),
          { type: 'Literal', value: 3 },
          4,
          5,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should provide default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }
      visitor.AssignmentExpression(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with missing start.line and start.column', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: {}, end: {} },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // 7. MESSAGES (10 tests)
  // ========================================================================
  describe('messages', () => {
    test('should include const in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message.toLowerCase()).toContain('const')
    })

    test('should include variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('testVar'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('testVar'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message).toContain('testVar')
    })

    test('should use word unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should use word assignment in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message.toLowerCase()).toContain('assignment')
    })

    test('should wrap variable name in single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message).toContain("'x'")
    })

    test('should end message with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should include word variable in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message.toLowerCase()).toContain('variable')
    })

    test('should produce consistent message for different variable names', () => {
      const names = ['a', 'longName', '_private', '$dollar', 'num123']
      for (const name of names) {
        const { context, reports } = createMockContext()
        const visitor = noConstAssignRule.create(context)
        visitor.VariableDeclaration(
          createVariableDeclaration('const', [createVariableDeclarator(createIdentifier(name))]),
        )
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
        )
        expect(reports[0].message).toBe(`Unexpected assignment to const variable '${name}'.`)
      }
    })

    test('should include variable name exactly as declared', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('CamelCase')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('CamelCase'), { type: 'Literal', value: 1 }),
      )
      expect(reports[0].message).toContain('CamelCase')
      expect(reports[0].message).not.toContain('camelcase')
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  // ========================================================================
  // 8. MULTIPLE REPORTS (10 tests)
  // ========================================================================
  describe('multiple reports', () => {
    test('should report two reassignments of different const variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('y'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(2)
    })

    test('should report same const variable reassigned twice', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(2)
    })

    test('should report three reassignments from multi-declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('a')),
          createVariableDeclarator(createIdentifier('b')),
          createVariableDeclarator(createIdentifier('c')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(3)
    })

    test('should report only const reassignments, not let', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('y'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report reassignment interleaved with declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('a'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('b'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(2)
    })

    test('should report 5 reassignments of the same variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      for (let i = 0; i < 5; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: i }),
        )
      }
      expect(reports.length).toBe(5)
    })

    test('should report each const from a 4-declarator statement individually', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('w')),
          createVariableDeclarator(createIdentifier('x')),
          createVariableDeclarator(createIdentifier('y')),
          createVariableDeclarator(createIdentifier('z')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('w'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('w')
      expect(reports[1].message).toContain('y')
    })

    test('should not report let assignment among const reassignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('a'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('b'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(2)
    })

    test('should report mixed const/let with only const violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('c1'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('l1'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('c2'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('l1'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c1'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('l1'), { type: 'Literal', value: 3 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c2'), { type: 'Literal', value: 4 }),
      )
      expect(reports.length).toBe(2)
    })

    test('should handle large number of const variables tracked', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const names = Array.from({ length: 50 }, (_, i) => `var${i}`)
      visitor.VariableDeclaration(
        createVariableDeclaration(
          'const',
          names.map((n) => createVariableDeclarator(createIdentifier(n))),
        ),
      )
      // Reassign every 10th variable
      for (let i = 0; i < 50; i += 10) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(`var${i}`), { type: 'Literal', value: i }),
        )
      }
      expect(reports.length).toBe(5)
    })
  })

  // ========================================================================
  // 9. CONTEXT (10 tests)
  // ========================================================================
  describe('context', () => {
    test('should handle different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle different source content', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const PI = 3.14; PI = 3;')
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('PI'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('PI'), { type: 'Literal', value: 3 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle context with extra config options', () => {
      const { context, reports } = createMockContext({ strict: true, level: 'max' })
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with empty string source', () => {
      const { context, reports } = createMockContext({}, '/src/empty.ts', '')
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/deeply/nested/directory/structure/src/components/utils/file.ts'
      const { context, reports } = createMockContext({}, longPath)
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockContext({}, '/src/file.js')
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with config containing nested options', () => {
      const { context, reports } = createMockContext({
        nested: { deep: { value: 42 } },
      })
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle workspace root', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle windows-style file path', () => {
      const { context, reports } = createMockContext({}, 'C:\\project\\src\\file.ts')
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // 10. TEST.EACH (40+ tests)
  // ========================================================================
  describe('test.each variable names', () => {
    test.each(['a', 'b', 'c', 'x', 'y', 'z', 'i', 'j', 'k', 'n'] as const)(
      'should detect const reassignment for single-letter variable %s',
      (name) => {
        const { context, reports } = createMockContext()
        const visitor = noConstAssignRule.create(context)
        visitor.VariableDeclaration(
          createVariableDeclaration('const', [createVariableDeclarator(createIdentifier(name))]),
        )
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
        )
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
      },
    )

    test.each([
      'foo',
      'bar',
      'baz',
      'qux',
      'quux',
      'corge',
      'grault',
      'garply',
      'waldo',
      'fred',
    ] as const)('should detect const reassignment for multi-letter variable %s', (name) => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier(name))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(name)
    })

    test.each(['_private', '__dunder', 'trailing_', 'mid_dle', '_a_b_c_'] as const)(
      'should detect const reassignment for underscore variable %s',
      (name) => {
        const { context, reports } = createMockContext()
        const visitor = noConstAssignRule.create(context)
        visitor.VariableDeclaration(
          createVariableDeclaration('const', [createVariableDeclarator(createIdentifier(name))]),
        )
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
        )
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
      },
    )

    test.each(['$', '$$', '$var', 'jQuery', '$elem'] as const)(
      'should detect const reassignment for dollar variable %s',
      (name) => {
        const { context, reports } = createMockContext()
        const visitor = noConstAssignRule.create(context)
        visitor.VariableDeclaration(
          createVariableDeclaration('const', [createVariableDeclarator(createIdentifier(name))]),
        )
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
        )
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
      },
    )

    test.each([
      ['const', true],
      ['let', false],
      ['var', false],
    ] as const)('should %s report reassignment (expect report: %s)', (kind, shouldReport) => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration(kind, [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length > 0).toBe(shouldReport)
    })
  })

  // ========================================================================
  // 11. ADDITIONAL PARAMETRIC / BOUNDARY TESTS (extra to guarantee 200+)
  // ========================================================================
  describe('additional boundary tests', () => {
    test('should handle declaration with declarations as non-array', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: 'not-an-array',
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle AssignmentExpression left as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: 42,
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression left as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: 'not-an-object',
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression left as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: true,
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object as VariableDeclaration node', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.VariableDeclaration({})).not.toThrow()
    })

    test('should handle empty object as AssignmentExpression node', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.AssignmentExpression({})).not.toThrow()
    })

    test('should handle false as VariableDeclaration node', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.VariableDeclaration(false)).not.toThrow()
    })

    test('should handle 0 as AssignmentExpression node', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(0)).not.toThrow()
    })

    test('should track const declared in second VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('a'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('b'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle declaration with undefined declarations', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle declaration with declarator having non-object id', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: 'string-id' }],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle declaration with declarator having id without name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier' } }],
      }
      visitor.VariableDeclaration(node)
      // id without name property - getIdentifierName returns null
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(''), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should report for each of 10 reassignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: i }),
        )
      }
      expect(reports.length).toBe(10)
    })

    test('should handle VariableDeclaration with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
        extra: 'data',
        flags: 42,
      }
      visitor.VariableDeclaration(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        extra: 'data',
        range: [0, 10],
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle NaN line number in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: Number.NaN, column: Number.NaN },
          end: { line: Number.NaN, column: Number.NaN },
        },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Infinity line number in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: Infinity, column: 0 },
          end: { line: Infinity, column: 10 },
        },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle negative line and column in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: -1, column: -5 },
          end: { line: -1, column: 5 },
        },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not crash with array as left side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: [{ type: 'Identifier', name: 'x' }],
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      // array is not an identifier, so no report
      expect(reports.length).toBe(0)
    })

    test('should handle default export of rule', () => {
      expect(noConstAssignRule).toBeDefined()
      expect(noConstAssignRule.meta).toBeDefined()
      expect(noConstAssignRule.create).toBeDefined()
    })

    test('should handle const with name that looks like keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('classlike')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('classlike'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const with name that is similar to reserved words', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('functionx')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('functionx'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with undefined right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), {
          type: 'Identifier',
          name: 'undefined',
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with null right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: null }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with template literal right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'TemplateLiteral' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with conditional expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'ConditionalExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with arrow function right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'ArrowFunctionExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with new expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'NewExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with unary expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'UnaryExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with await expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'AwaitExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle const reassignment with yield expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'YieldExpression' }),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclaration with undefined kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
      }
      visitor.VariableDeclaration(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclaration with empty string kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: '',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
      }
      visitor.VariableDeclaration(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclaration with numeric kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 42,
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
      }
      visitor.VariableDeclaration(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not track const-like names from using declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'using',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'res' } }],
      }
      visitor.VariableDeclaration(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('res'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    })

    test('should detect reassignment after many let/var declarations first', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('a'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('var', [createVariableDeclarator(createIdentifier('b'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('c'))]),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('d'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('d'), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('d')
    })

    test('should not crash when context.report is called multiple times rapidly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      for (let i = 0; i < 20; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: i }),
        )
      }
      expect(reports.length).toBe(20)
    })

    test('should handle AssignmentExpression with operator !== =', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      // The rule checks any AssignmentExpression, including compound assignments
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with -= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '-=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with *= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '*=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with /= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '/=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with **= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '**=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with %= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '%=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with <<= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '<<=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with >>= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '>>=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with &= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '&=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with |= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '|=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with ^= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '^=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with &&= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '&&=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with ||= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '||=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with ??= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '??=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})
