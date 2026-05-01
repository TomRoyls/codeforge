import { describe, expect, test, vi } from 'vitest'
import { noInnerHTMLRule } from '../../../../src/rules/security/no-innerhtml.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'el.innerHTML = userInput',
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

  return { context, reports }
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeInnerHTMLAssign(
  objName = 'el',
  propName = 'innerHTML',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: objName },
      property: { type: 'Identifier', name: propName },
    },
    right: { type: 'Identifier', name: 'userInput' },
    loc: makeLoc(line, column, line, column + 25),
  }
}

describe('no-innerhtml rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noInnerHTMLRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noInnerHTMLRule.meta.severity).toBe('error')
    })

    test('should have correct category "security"', () => {
      expect(noInnerHTMLRule.meta.docs?.category).toBe('security')
    })

    test('should be recommended', () => {
      expect(noInnerHTMLRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noInnerHTMLRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning innerHTML and outerHTML', () => {
      const desc = noInnerHTMLRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/innerhtml/)
      expect(desc).toMatch(/outerhtml/)
    })

    test('should have correct docs URL', () => {
      expect(noInnerHTMLRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-innerhtml',
      )
    })

    test('should have empty schema', () => {
      expect(noInnerHTMLRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noInnerHTMLRule).toBeDefined()
      expect(noInnerHTMLRule.meta).toBeDefined()
      expect(noInnerHTMLRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports innerHTML/outerHTML assignment', () => {
    test('reports el.innerHTML = userInput', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports.length).toBe(1)
    })

    test('reports el.outerHTML = userInput', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'outerHTML'))
      expect(reports.length).toBe(1)
    })

    test('message mentions XSS', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports[0].message).toMatch(/XSS/)
    })

    test('message suggests textContent', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports[0].message).toContain('textContent')
    })

    test('message suggests createElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports[0].message).toContain('createElement')
    })

    test('message suggests sanitization', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports[0].message.toLowerCase()).toContain('sanitization')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = makeInnerHTMLAssign()
      visitor.AssignmentExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'innerHTML', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(33)
    })

    test('reports div.innerHTML = htmlString', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('div'))
      expect(reports.length).toBe(1)
    })

    test('reports document.body.innerHTML = data', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'document' },
            property: { type: 'Identifier', name: 'body' },
          },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'data' },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports element.outerHTML = payload', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('element', 'outerHTML'))
      expect(reports.length).toBe(1)
    })

    test('reports container.innerHTML = template', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('container'))
      expect(reports.length).toBe(1)
    })

    test('reports node.innerHTML = response.text()', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'node' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'response' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('outerHTML message mentions outerHTML specifically', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'outerHTML'))
      expect(reports[0].message).toContain('outerHTML')
    })

    test('innerHTML message mentions innerHTML specifically', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'innerHTML'))
      expect(reports[0].message).toContain('innerHTML')
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el1', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('el2', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('el3', 'outerHTML'))
      expect(reports.length).toBe(3)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('a', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('b', 'outerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('c', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('d', 'outerHTML'))
      expect(reports.length).toBe(4)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report el.textContent = userInput', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'textContent' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.createElement()', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'createElement' },
        },
        arguments: [{ type: 'Literal', value: 'div' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report computed member el["innerHTML"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Literal', value: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.innerHTML += userInput — non-= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression left — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'innerHTML' },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property is non-Identifier — StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Literal', value: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report wrong property name — className', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'className' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report wrong property name — style', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'style' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.innerText = userInput', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerText' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.innerHTML -= value — non-= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '-=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      expect(() => visitor.AssignmentExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: null,
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.innerHTML *= value — non-= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '*=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report wrong property — href', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'href' },
        },
        right: { type: 'Identifier', name: 'url' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report wrong property — src', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'src' },
        },
        right: { type: 'Identifier', name: 'url' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report wrong property — value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'value' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report wrong property — id', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'id' },
        },
        right: { type: 'Identifier', name: 'myId' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.outerHTML /= value — non-= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '/=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'outerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.innerHTML %= value — non-= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '%=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression as left without innerHTML/outerHTML', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'textContent' },
        },
        right: { type: 'Identifier', name: 'text' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when left is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: undefined,
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-AssignmentExpression — ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-AssignmentExpression — Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report computed member el[expr] with innerHTML value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'expr' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.innerHTML **= value — non-= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '**=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.outerHTML <<= value — non-= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '<<=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'outerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when left type is not MemberExpression — ArrayPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'ArrayPattern',
          elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        },
        right: { type: 'Identifier', name: 'arr' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noInnerHTMLRule.create(ctx1)
      const visitor2 = noInnerHTMLRule.create(ctx2)

      visitor1.AssignmentExpression(makeInnerHTMLAssign('el', 'innerHTML'))
      visitor2.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'textContent' },
        },
        right: { type: 'Identifier', name: 'text' },
        loc: makeLoc(1, 0, 1, 25),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el1', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('el2', 'outerHTML'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      // reports — innerHTML
      visitor.AssignmentExpression(makeInnerHTMLAssign('el1', 'innerHTML'))
      // does NOT report — textContent
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'textContent' },
        },
        right: { type: 'Identifier', name: 'text' },
        loc: makeLoc(2, 0, 2, 25),
      })
      // reports — outerHTML
      visitor.AssignmentExpression(makeInnerHTMLAssign('el2', 'outerHTML'))
      // does NOT report — not an AssignmentExpression type
      visitor.AssignmentExpression({
        type: 'BinaryExpression',
        loc: makeLoc(3, 0, 3, 10),
      })
      // reports — innerHTML
      visitor.AssignmentExpression(makeInnerHTMLAssign('el3', 'innerHTML'))
      expect(reports.length).toBe(3)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
      }
      visitor.AssignmentExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noInnerHTMLRule.create(context)
      const visitor2 = noInnerHTMLRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'innerHTML', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('chained member access el.div.innerHTML reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'el' },
            property: { type: 'Identifier', name: 'div' },
          },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with missing left property — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with missing operator — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with missing property on left — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with null left — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with undefined left — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: undefined,
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is deeply equal across multiple accesses', () => {
      const meta1 = noInnerHTMLRule.meta
      const meta2 = noInnerHTMLRule.meta
      expect(meta1).toBe(meta2)
    })

    test('all innerHTML violation messages are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('a', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('b', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('c', 'innerHTML'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('innerHTML and outerHTML produce different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'outerHTML'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('both innerHTML and outerHTML are detected in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el1', 'innerHTML'))
      visitor.AssignmentExpression(makeInnerHTMLAssign('el2', 'outerHTML'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('innerHTML')
      expect(reports[1].message).toContain('outerHTML')
    })

    test('does not report el.innerHTML += userInput — compound assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'userInput' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.outerHTML -= value — compound assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '-=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'outerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('message for innerHTML mentions innerHTML property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'innerHTML'))
      expect(reports[0].message).toContain('`innerHTML`')
    })

    test('message for outerHTML mentions outerHTML property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign('el', 'outerHTML'))
      expect(reports[0].message).toContain('`outerHTML`')
    })

    test('reports innerHTML assignment to CallExpression result', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetch' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports outerHTML assignment to Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'outerHTML' },
        },
        right: { type: 'Literal', value: '<div>test</div>' },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message contains "Unexpected use" prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      visitor.AssignmentExpression(makeInnerHTMLAssign())
      expect(reports[0].message).toMatch(/^Unexpected use of/)
    })

    test('rule export has create function that is callable', () => {
      const { context } = createMockContext()
      expect(typeof noInnerHTMLRule.create).toBe('function')
      const visitor = noInnerHTMLRule.create(context)
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('reports this.innerHTML = val — ThisExpression as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report this.innerHTML += val — compound with ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.innerHTML ||= fallback — logical assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '||=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Literal', value: '<span>default</span>' },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report el.outerHTML &&= value — logical assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerHTMLRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '&&=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'el' },
          property: { type: 'Identifier', name: 'outerHTML' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
