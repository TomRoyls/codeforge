import { describe, test, expect, vi } from 'vitest'
import { noUnsafeHtmlRule } from '../../../../src/rules/security/no-unsafe-html.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'el.innerHTML = "<b>test</b>";',
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

function createAssignment(
  leftProp: string,
  rightValue: unknown,
  rightType: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'el' },
      property: { type: 'Identifier', name: leftProp },
    },
    right: rightType === 'Literal' ? { type: 'Literal', value: rightValue } : rightValue,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createCallExpression(
  objectName: string,
  methodName: string,
  args: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

function createTemplateLiteral(raw: string, line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [
      {
        type: 'TemplateElement',
        value: { raw, cooked: raw },
      },
    ],
    expressions: [],
    loc: {
      start: { line, column },
      end: { line, column: column + raw.length + 3 },
    },
  }
}

function createCallWithIdentifierCallee(name: string, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createCallWithMemberCallee(
  objectName: string,
  methodName: string,
  args: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

describe('no-unsafe-html rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noUnsafeHtmlRule.meta.type).toBe('problem')
    })

    test('should have warning severity', () => {
      expect(noUnsafeHtmlRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnsafeHtmlRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noUnsafeHtmlRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noUnsafeHtmlRule.meta.schema).toBeDefined()
    })

    test('should mention XSS in description', () => {
      expect(noUnsafeHtmlRule.meta.docs?.description).toContain('XSS')
    })

    test('should have correct URL', () => {
      expect(noUnsafeHtmlRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unsafe-html',
      )
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnsafeHtmlRule.meta.schema)).toBe(true)
    })

    test('should have schema with safeMethods property', () => {
      const schema = noUnsafeHtmlRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('safeMethods')
    })

    test('should have fixable as undefined', () => {
      expect(noUnsafeHtmlRule.meta.fixable).toBeUndefined()
    })

    test('should have schema object type', () => {
      const schema = noUnsafeHtmlRule.meta.schema as Array<Record<string, unknown>>
      expect((schema[0] as Record<string, unknown>).type).toBe('object')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return functions for each visitor method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      expect(typeof visitor.AssignmentExpression).toBe('function')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noUnsafeHtmlRule.create(context)
      const visitor2 = noUnsafeHtmlRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('innerHTML assignment detection', () => {
    test('should report innerHTML assignment with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('innerHTML', '<b>test</b>', 'Literal'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('innerHTML')
      expect(reports[0].message).toContain('XSS')
    })

    test('should report innerHTML assignment with HTML-containing string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('innerHTML', '<div>hello</div>', 'Literal'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('innerHTML')
    })

    test('should report innerHTML assignment with dynamic identifier value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('innerHTML')
      expect(reports[0].message).toContain('dynamic')
    })

    test('should report innerHTML with template literal containing HTML', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const templateNode = createTemplateLiteral('<span>hello</span>')
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: templateNode,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('innerHTML')
    })

    test('should report innerHTML with plain string (no HTML tags)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('innerHTML', 'plain text', 'Literal'))

      expect(reports.length).toBe(1)
    })
  })

  describe('outerHTML assignment detection', () => {
    test('should report outerHTML assignment with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('outerHTML', '<div>test</div>', 'Literal'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('outerHTML')
      expect(reports[0].message).toContain('XSS')
    })

    test('should report outerHTML with dynamic value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'outerHTML' },
        },
        right: { type: 'Identifier', name: 'someVar' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('outerHTML')
    })
  })

  describe('textContent and innerText (safe)', () => {
    test('should not report textContent assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('textContent', '<b>test</b>', 'Literal'))

      expect(reports.length).toBe(0)
    })

    test('should not report innerText assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('innerText', '<b>test</b>', 'Literal'))

      expect(reports.length).toBe(0)
    })

    test('should not report textContent with dynamic value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'textContent' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('DOMPurify.sanitize() (safe)', () => {
    test('should not report innerHTML assigned DOMPurify.sanitize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const dompurifyCall = createCallWithMemberCallee('DOMPurify', 'sanitize', [
        createIdentifier('userInput'),
      ])

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: dompurifyCall,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('number and boolean values (safe)', () => {
    test('should not report innerHTML assigned a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('innerHTML', 42, 'Literal'))

      expect(reports.length).toBe(0)
    })

    test('should not report innerHTML assigned a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('innerHTML', true, 'Literal'))

      expect(reports.length).toBe(0)
    })

    test('should not report outerHTML assigned a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('outerHTML', 0, 'Literal'))

      expect(reports.length).toBe(0)
    })

    test('should not report outerHTML assigned false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('outerHTML', false, 'Literal'))

      expect(reports.length).toBe(0)
    })
  })

  describe('document.write() detection', () => {
    test('should report document.write() with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('document', 'write', [createLiteral('<b>hello</b>')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('document.write')
      expect(reports[0].message).toContain('XSS')
    })

    test('should report document.write() with dynamic argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('document', 'write', [createIdentifier('userInput')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('document.write')
    })

    test('should not report document.write() with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('document', 'write', [createLiteral(42)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report document.write() with DOMPurify.sanitize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const sanitizeCall = createCallWithMemberCallee('DOMPurify', 'sanitize', [
        createIdentifier('input'),
      ])

      visitor.CallExpression(
        createCallExpression('document', 'write', [sanitizeCall]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report document.write() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('document', 'write', []),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('insertAdjacentHTML() detection', () => {
    test('should report insertAdjacentHTML() with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'insertAdjacentHTML', [
          createLiteral('beforeend'),
          createLiteral('<b>hello</b>'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('insertAdjacentHTML')
      expect(reports[0].message).toContain('XSS')
    })

    test('should report insertAdjacentHTML() with dynamic html argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'insertAdjacentHTML', [
          createLiteral('afterbegin'),
          createIdentifier('userInput'),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report insertAdjacentHTML() with number html argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'insertAdjacentHTML', [
          createLiteral('beforeend'),
          createLiteral(42),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report insertAdjacentHTML() with DOMPurify.sanitize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const sanitizeCall = createCallWithMemberCallee('DOMPurify', 'sanitize', [
        createIdentifier('input'),
      ])

      visitor.CallExpression(
        createCallExpression('el', 'insertAdjacentHTML', [
          createLiteral('beforeend'),
          sanitizeCall,
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report insertAdjacentHTML() with only one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'insertAdjacentHTML', [createLiteral('beforeend')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('jQuery-style .html() detection', () => {
    test('should report .html() with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('$element', 'html', [createLiteral('<b>test</b>')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.html()')
      expect(reports[0].message).toContain('XSS')
    })

    test('should report .html() with dynamic argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'html', [createIdentifier('userInput')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report .html() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'html', []),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report .html() with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'html', [createLiteral(42)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report .html() with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'html', [createLiteral(true)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report .html() with DOMPurify.sanitize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const sanitizeCall = createCallWithMemberCallee('DOMPurify', 'sanitize', [
        createIdentifier('input'),
      ])

      visitor.CallExpression(
        createCallExpression('el', 'html', [sanitizeCall]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('safe methods option', () => {
    test('should respect custom safeMethods option', () => {
      const { context, reports } = createMockContext({ safeMethods: ['mySanitize'] })
      const visitor = noUnsafeHtmlRule.create(context)

      const safeCall = createCallWithMemberCallee('sanitizer', 'mySanitize', [
        createIdentifier('input'),
      ])

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: safeCall,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should still include default safe methods when custom ones are added', () => {
      const { context, reports } = createMockContext({ safeMethods: ['myCustom'] })
      const visitor = noUnsafeHtmlRule.create(context)

      const escapeCall = createCallWithIdentifierCallee('escape', [createIdentifier('input')])

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: escapeCall,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should recognize identifier-safe-method calls for .html()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const escapeCall = createCallWithIdentifierCallee('escape', [createIdentifier('input')])

      visitor.CallExpression(
        createCallExpression('el', 'html', [escapeCall]),
      )

      expect(reports.length).toBe(0)
    })

    test('should recognize member-safe-method calls for .html()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const sanitizeCall = createCallWithMemberCallee('utils', 'sanitize', [
        createIdentifier('input'),
      ])

      visitor.CallExpression(
        createCallExpression('el', 'html', [sanitizeCall]),
      )

      expect(reports.length).toBe(0)
    })

    test('should recognize encode as safe method for document.write()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const encodeCall = createCallWithIdentifierCallee('encode', [createIdentifier('input')])

      visitor.CallExpression(
        createCallExpression('document', 'write', [encodeCall]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Literal', value: '<b>test</b>' },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without arguments in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'write' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-= assignment operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Literal', value: '<b>test</b>' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle assignment to non-MemberExpression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: '<b>test</b>' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-matching CallExpression (e.g., console.log)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('console', 'log', [createLiteral('hello')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [createLiteral('<b>test</b>')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should correctly extract location from reported nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.AssignmentExpression(createAssignment('innerHTML', '<b>test</b>', 'Literal', 5, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle assignment with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Literal', value: '<b>test</b>' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with null right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('combined safe method checks', () => {
    test('should not report innerHTML with .sanitize() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const sanitizeCall = createCallWithMemberCallee('lib', 'sanitize', [
        createIdentifier('input'),
      ])

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: sanitizeCall,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report innerHTML with .escape() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const escapeCall = createCallWithMemberCallee('lib', 'escape', [
        createIdentifier('input'),
      ])

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: escapeCall,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report innerHTML with .encode() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const encodeCall = createCallWithMemberCallee('lib', 'encode', [
        createIdentifier('input'),
      ])

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: encodeCall,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report innerHTML with sanitize() identifier call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      const sanitizeCall = createCallWithIdentifierCallee('sanitize', [
        createIdentifier('input'),
      ])

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: sanitizeCall,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('insertAdjacentHTML with safe values', () => {
    test('should not report insertAdjacentHTML with number second argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'insertAdjacentHTML', [
          createLiteral('beforeend'),
          createLiteral(42),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report insertAdjacentHTML with boolean second argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('el', 'insertAdjacentHTML', [
          createLiteral('beforeend'),
          createLiteral(true),
        ]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('document.write with safe values', () => {
    test('should not report document.write with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeHtmlRule.create(context)

      visitor.CallExpression(
        createCallExpression('document', 'write', [createLiteral(true)]),
      )

      expect(reports.length).toBe(0)
    })
  })
})
