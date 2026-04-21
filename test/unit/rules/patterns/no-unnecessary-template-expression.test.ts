import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryTemplateExpressionRule } from '../../../../src/rules/patterns/no-unnecessary-template-expression.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const s = `hello`;',
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

function createTemplateLiteral(
  quasis: { raw: string; cooked?: string }[],
  expressions: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: quasis.map((q) => ({
      type: 'TemplateElement',
      value: {
        raw: q.raw,
        cooked: q.cooked ?? q.raw,
      },
      tail: true,
    })),
    expressions,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-unnecessary-template-expression rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.schema).toBeDefined()
    })

    test('should be fixable with code', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.fixable).toBe('code')
    })

    test('should mention template literal in description', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.description.toLowerCase()).toContain(
        'template',
      )
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.description.toLowerCase()).toContain(
        'unnecessary',
      )
    })

    test('should have a non-empty description', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description as string', () => {
      expect(typeof noUnnecessaryTemplateExpressionRule.meta.docs?.description).toBe('string')
    })

    test('should have docs object defined', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs).toBeDefined()
    })

    test('should have docs.url defined', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof noUnnecessaryTemplateExpressionRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url containing codeforge', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have schema as empty array', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have type as one of valid rule types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(
        noUnnecessaryTemplateExpressionRule.meta.type,
      )
    })

    test('should have severity as one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noUnnecessaryTemplateExpressionRule.meta.severity)
    })

    test('should have recommended as boolean true', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.recommended).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return visitor as an object', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should have TemplateLiteral as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(typeof visitor.TemplateLiteral).toBe('function')
    })

    test('should return new visitor on each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTemplateExpressionRule.create(context)
      const visitor2 = noUnnecessaryTemplateExpressionRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockContext({}, '/other/path.ts')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })

    test('should accept context with populated options', () => {
      const { context } = createMockContext({ strict: true, level: 5 })
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })
  })

  describe('detecting unnecessary template literals', () => {
    test('should report simple string template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should report empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with only text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'some text here' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '12345' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '   ' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '!@#$%^&*()' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with URL-safe characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'path/to/file' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with dashes and underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'my-variable_name' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with camelCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'myVariableName' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with PascalCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'MyClassName' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with UPPER_CASE', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'CONSTANT_VALUE' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with tab character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '\t' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with single character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'a' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with comma', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'a, b, c' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with semicolon', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'a; b' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with colon', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'key: value' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with parentheses', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '(grouped)' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with brackets', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '[array]' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with curly braces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '{object}' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with angle brackets', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '<tag>' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with equals sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'key=value' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with plus sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '1+1' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with pipe', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'a | b' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with dollar sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '$100' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with at sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'user@email.com' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with hash', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '#heading' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with tilde', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '~/.config' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with backtick-like escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '\\`test\\`' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with unicode content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello world' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with em dash', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'left\u2014right' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with ellipsis character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'loading\u2026' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with zero width space', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '\u200B' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting necessary template literals', () => {
    test('should not report template literal with interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: 'Hello ', cooked: 'Hello ' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('name')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with multi-line content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'line1\nline2' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with newline escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const stringWithNewline = 'line1' + '\n' + 'line2'
      const node = createTemplateLiteral([{ raw: stringWithNewline }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with single quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: "it's" }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with double quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'say "hello"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with both quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'it\'s "quoted"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with carriage return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'line1\rline2' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: ' and ', cooked: ' and ' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('a'), createIdentifier('b')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with CRLF line endings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'line1\r\nline2' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with multiple newlines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'a\nb\nc' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with only a single quote character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: "'" }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with only a double quote character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with leading newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '\ntext' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with trailing newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'text\n' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with carriage return only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '\r' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with expression at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: ' suffix', cooked: ' suffix' },
        ],
        [createIdentifier('prefix')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with expression at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: 'prefix ', cooked: 'prefix ' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('suffix')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with single expression wrapping entire value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('value')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: '', cooked: '' },
        ],
        [{ type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: '', cooked: '' },
        ],
        [
          {
            type: 'MemberExpression',
            object: createIdentifier('obj'),
            property: createIdentifier('prop'),
          },
        ],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with complex expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: 'result: ', cooked: 'result: ' },
          { raw: '', cooked: '' },
        ],
        [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: createIdentifier('a'),
            right: createIdentifier('b'),
          },
        ],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with three expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: '-', cooked: '-' },
          { raw: '-', cooked: '-' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('a'), createIdentifier('b'), createIdentifier('c')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with newline and quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'it\'s\n"quoted"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with escaped single quote via raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: "don't stop" }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with only newline character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '\n' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with mixed quotes - single then double', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '\'hello"world"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with multiple single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: "it's John's book" }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with multiple double quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'say "hello" and "goodbye"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with JSON-like content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '{"key": "value"}' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with apostrophe in contractions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: "can't won't shouldn't" }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with Windows path containing newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'C:\\path\ncontinued' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral('string')).not.toThrow()
      expect(() => visitor.TemplateLiteral(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test', cooked: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }], [], 42, 15)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle tagged template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: createIdentifier('tag'),
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'a' }, tail: false },
          { type: 'TemplateElement', value: { raw: 'b' }, tail: true },
        ],
        expressions: [createIdentifier('x')],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'StringLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: true,
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number type', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(42)).not.toThrow()
    })

    test('should handle node with boolean value', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(true)).not.toThrow()
    })

    test('should handle node as empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: null, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi with non-string raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 123 as unknown as string }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi as non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: ['not-an-object' as unknown],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle expressions as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: null,
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle quasis as empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasis with multiple elements but no expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'a' }, tail: false },
          { type: 'TemplateElement', value: { raw: 'b' }, tail: true },
        ],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {},
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle template literal with undefined tag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: undefined,
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle quasi with undefined raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { cooked: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi with empty string raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle quasis as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: null,
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with tag as null (falsy, should report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: null,
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with tag as empty string (falsy, should report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: '',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with tag as 0 (falsy, should report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: 0,
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with tag as false (falsy, should report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: false,
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle quasi with empty value object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: {}, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle tagged template with function call tag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi with number raw as zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 0 as unknown as string }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where quasis is a string instead of array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: 'not-array',
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }], [], 1, 0)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }], [], 500, 20)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location at large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }], [], 10, 200)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }], [], 3, 5)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 1, column: 'not-a-number' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should default to line 1 when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default to column 0 when start column is non-number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 5, column: undefined as unknown as number },
          end: { line: 5, column: 10 },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc where end line is non-number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 'bad' as unknown as number, column: 5 },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc where end column is non-number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'bad' as unknown as number },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle location at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'x' }], [], 0, 0)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve both start and end from loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 7, column: 12 },
          end: { line: 7, column: 25 },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  describe('message quality', () => {
    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should mention template literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('should include suggestion with the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"hello"')
    })

    test('should suggest using regular string syntax', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"test"')
    })

    test('should include the specific value in suggestion for single word', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'word' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"word"')
    })

    test('should include the specific value in suggestion for empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('""')
    })

    test('should include the specific value for special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '!@#' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"!@#"')
    })

    test('should include the specific value for path-like string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'src/index.ts' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"src/index.ts"')
    })

    test('should include the specific value for whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '   ' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"   "')
    })

    test('should start with Unnecessary template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toMatch(/^Unnecessary template literal/)
    })
  })

  describe('multiple reports', () => {
    test('should report each invocation separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node1 = createTemplateLiteral([{ raw: 'hello' }])
      const node2 = createTemplateLiteral([{ raw: 'world' }])

      visitor.TemplateLiteral(node1)
      visitor.TemplateLiteral(node2)

      expect(reports.length).toBe(2)
    })

    test('should report correct messages for multiple invocations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'first' }]))
      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'second' }]))

      expect(reports[0].message).toContain('"first"')
      expect(reports[1].message).toContain('"second"')
    })

    test('should report correct locations for multiple invocations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'a' }], [], 1, 0))
      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'b' }], [], 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should only report simple templates when mixed with complex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'simple' }]))

      const complexNode = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('x')],
      )
      visitor.TemplateLiteral(complexNode)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"simple"')
    })

    test('should handle many sequential reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.TemplateLiteral(createTemplateLiteral([{ raw: `value${i}` }]))
      }

      expect(reports.length).toBe(10)
    })

    test('should report for alternating simple and complex templates', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'a' }]))
      visitor.TemplateLiteral(
        createTemplateLiteral(
          [
            { raw: '', cooked: '' },
            { raw: '', cooked: '' },
          ],
          [createIdentifier('x')],
        ),
      )
      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'b' }]))
      visitor.TemplateLiteral(
        createTemplateLiteral(
          [
            { raw: '', cooked: '' },
            { raw: '', cooked: '' },
          ],
          [createIdentifier('y')],
        ),
      )
      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'c' }]))

      expect(reports.length).toBe(3)
    })

    test('should handle report followed by null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))
      visitor.TemplateLiteral(null)

      expect(reports.length).toBe(1)
    })

    test('should handle report followed by undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))
      visitor.TemplateLiteral(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle 50 sequential reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.TemplateLiteral(createTemplateLiteral([{ raw: `v${i}` }]))
      }

      expect(reports.length).toBe(50)
    })

    test('should maintain correct messages across many reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'first' }]))
      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'middle' }]))
      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'last' }]))

      expect(reports[0].message).toContain('"first"')
      expect(reports[1].message).toContain('"middle"')
      expect(reports[2].message).toContain('"last"')
    })
  })

  describe('context variations', () => {
    test('should work with default context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/different/path.ts')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = `hello`')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra fields', () => {
      const { context, reports } = createMockContext({ extra: true, nested: { deep: 1 } })
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/workspace/file.ts',
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
        workspaceRoot: '/workspace',
      } as unknown as RuleContext

      const visitor = noUnnecessaryTemplateExpressionRule.create(context)
      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/Component.tsx')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockContext({}, '/src/index.js')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockContext({}, '/a/b/c/d/e/f/file.ts')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })

    test('should work with special characters in file path', () => {
      const { context, reports } = createMockContext({}, '/src/[special]/file.ts')
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([{ raw: 'test' }]))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - strings that should be reported', () => {
    test.each([
      ['hello', 'simple word'],
      ['', 'empty string'],
      ['   ', 'whitespace only'],
      ['12345', 'numeric string'],
      ['!@#$%^&*()', 'special characters'],
      ['path/to/file', 'file path'],
      ['my-variable_name', 'dashed and underscored'],
      ['camelCaseString', 'camelCase'],
      ['PascalCaseString', 'PascalCase'],
      ['UPPER_CASE', 'upper case constant'],
      ['a', 'single character'],
      ['a, b, c', 'comma separated'],
      ['key=value', 'key-value pair'],
      ['(grouped)', 'parenthesized'],
      ['[array]', 'bracketed'],
      ['{object}', 'braced'],
      ['<tag>', 'angle bracketed'],
      ['$100', 'dollar amount'],
      ['user@email.com', 'email address'],
      ['#heading', 'hash prefixed'],
      ['~/.config', 'tilde path'],
      ['key: value', 'colon separated'],
      ['1+1', 'mathematical expression'],
      ['a | b', 'pipe separated'],
      ['\\`test\\`', 'escaped backticks'],
    ])('should report template literal with raw value "%s" (%s)', (rawValue: string) => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: rawValue }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary')
    })
  })

  describe('test.each - strings that should NOT be reported', () => {
    test.each([
      ["it's", 'contains single quote'],
      ['say "hello"', 'contains double quote'],
      ['it\'s "quoted"', 'contains both quotes'],
      ['line1\nline2', 'contains newline'],
      ['line1\rline2', 'contains carriage return'],
      ['\n', 'just newline'],
      ['\r', 'just carriage return'],
      ['line1\r\nline2', 'CRLF line ending'],
      ['a\nb\nc', 'multiple newlines'],
      ["don't stop", 'apostrophe'],
      ['{"key": "value"}', 'JSON with quotes'],
      ["can't won't shouldn't", 'multiple apostrophes'],
      ['say "hello" and "goodbye"', 'multiple double quotes'],
      ["'hello\"world'", 'mixed quotes'],
      ['\ntext', 'leading newline'],
      ['text\n', 'trailing newline'],
      ['it\'s\n"quoted"', 'newline and quotes'],
      ["'", 'single quote only'],
      ['"', 'double quote only'],
    ])('should NOT report template literal with raw value "%s" (%s)', (rawValue: string) => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: rawValue }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - location reporting', () => {
    test.each([
      [1, 0, 'start of file'],
      [5, 10, 'middle of file'],
      [100, 0, 'high line zero column'],
      [1, 50, 'line one high column'],
      [42, 15, 'arbitrary position'],
      [0, 0, 'zero zero position'],
      [999, 999, 'high position'],
      [10, 200, 'large column'],
      [3, 5, 'small position'],
      [50, 0, 'fiftieth line'],
    ] as const)(
      'should report correct location at line %s column %s (%s)',
      (line: number, column: number) => {
        const { context, reports } = createMockContext()
        const visitor = noUnnecessaryTemplateExpressionRule.create(context)

        const node = createTemplateLiteral([{ raw: 'test' }], [], line, column)
        visitor.TemplateLiteral(node)

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('test.each - edge case nodes', () => {
    test.each([
      [null, 'null node'],
      [undefined, 'undefined node'],
      ['string', 'string node'],
      [123, 'number node'],
      [true, 'boolean node'],
      [{}, 'empty object'],
      [[], 'empty array'],
    ])('should handle %s without throwing', (node: unknown) => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
    })
  })

  describe('test.each - tagged template literals should not be reported', () => {
    test.each([
      ['tag', 'identifier tag'],
      ['styled', 'styled-components tag'],
      ['css', 'css tag'],
      ['html', 'html tag'],
      ['sql', 'sql tag'],
      ['gql', 'graphql tag'],
      ['raw', 'raw tag'],
    ])('should not report tagged template with tag "%s" (%s)', (tagName: string) => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: createIdentifier(tagName),
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })
})
