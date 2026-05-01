import { describe, expect, test, vi } from 'vitest'
import { preferResolvesRejectsRule } from '../../../../src/rules/testing/prefer-resolves-rejects.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = 'expect(promise).then(async (val) => { expect(await val).toBe(1); });',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  }
  return { context: context as unknown as RuleContext, reports }
}

function createExpectThenWithAwait(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: 1 }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

function createExpectCatchWithAwait(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'catch' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'err' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'err' } }],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: 'error' }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

function createResolvesNode(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'promise' }],
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 1 }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRejectsNode(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'promise' }],
          },
          property: { type: 'Identifier', name: 'rejects' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toThrow' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRegularExpectNode(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'value' }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 1 }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createNonExpectThenNode(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fetchData' },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: 1 }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createExpectThenWithMemberExprArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'val' },
                  property: { type: 'Identifier', name: 'data' },
                }],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: 1 }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

function createExpectThenEmptyCallback(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: { type: 'BlockStatement', body: [] },
    }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createExpectThenNoExpectInCallback(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'consoleLog' },
            arguments: [{ type: 'Identifier', name: 'val' }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createPromiseResolveThen(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createExpectThenWithNestedExpectAwait(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'IfStatement',
          test: { type: 'Identifier', name: 'condition' },
          consequent: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                  },
                  property: { type: 'Identifier', name: 'toBe' },
                },
                arguments: [{ type: 'Literal', value: 1 }],
              },
            }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 70 } },
  }
}

function createExpectThenWithResolvesInside(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Identifier', name: 'val' }],
                  },
                  property: { type: 'Identifier', name: 'resolves' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: 1 }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

function createExpectThenWithNumberArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Literal', value: 42 }],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: 42 }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

function createExpectThenWithBooleanArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'promise' }],
      },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'val' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Literal', value: true }],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: true }],
          },
        }],
      },
    }],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

describe('prefer-resolves-rejects', () => {
  test('meta.type is suggestion', () => {
    expect(preferResolvesRejectsRule.meta.type).toBe('suggestion')
  })

  test('meta.severity is warn', () => {
    expect(preferResolvesRejectsRule.meta.severity).toBe('warn')
  })

  test('meta.docs.category is testing', () => {
    expect(preferResolvesRejectsRule.meta.docs.category).toBe('testing')
  })

  test('meta.docs.recommended is false', () => {
    expect(preferResolvesRejectsRule.meta.docs.recommended).toBe(false)
  })

  test('meta.schema is empty array', () => {
    expect(preferResolvesRejectsRule.meta.schema).toEqual([])
  })

  test('meta.docs.url is defined', () => {
    expect(preferResolvesRejectsRule.meta.docs.url).toBe('https://codeforge.dev/docs/rules/prefer-resolves-rejects')
  })

  test('meta.docs.description is defined', () => {
    expect(preferResolvesRejectsRule.meta.docs.description).toContain('resolves')
  })

  test('meta.docs.description mentions rejects', () => {
    expect(preferResolvesRejectsRule.meta.docs.description).toContain('rejects')
  })

  test('create() returns visitor with CallExpression method', () => {
    const { context } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  test('reports expect(promise).then() with await inside callback', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithAwait())
    expect(reports).toHaveLength(1)
  })

  test('reports expect(promise).catch() with await inside callback', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectCatchWithAwait())
    expect(reports).toHaveLength(1)
  })

  test('does NOT report expect().resolves.toBe() (uses resolves)', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createResolvesNode())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report expect().rejects.toThrow() (uses rejects)', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createRejectsNode())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report regular expect() without .then()/.catch()', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createRegularExpectNode())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report non-expect .then() chain', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createNonExpectThenNode())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report expect().then() with empty callback', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenEmptyCallback())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report expect(promise).then() without expect in callback', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenNoExpectInCallback())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report Promise.resolve().then() (not expect)', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createPromiseResolveThen())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report expect(true).toBe(true) (no .then/.catch)', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createRegularExpectNode())
    expect(reports).toHaveLength(0)
  })

  test('reports nested expect with await in .then()', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithNestedExpectAwait())
    expect(reports).toHaveLength(1)
  })

  test('does NOT report expect with resolves inside .then()', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithResolvesInside())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report expect with number argument inside .then()', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithNumberArg())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report expect with boolean argument inside .then()', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithBooleanArg())
    expect(reports).toHaveLength(0)
  })

  test('handles null node gracefully', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(null)
    expect(reports).toHaveLength(0)
  })

  test('handles undefined node gracefully', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(undefined)
    expect(reports).toHaveLength(0)
  })

  test('handles empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({})
    expect(reports).toHaveLength(0)
  })

  test('handles node without arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('handles node with non-object callback', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: ['string-callback'],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('handles node with null callee', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: null,
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('reports with correct message text', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithAwait())
    expect(reports[0].message).toBe('Use `expect().resolves` or `expect().rejects` instead of manually awaiting promises in assertions.')
  })

  test('does NOT report .then() on non-expect call', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createNonExpectThenNode())
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .catch() on non-expect call', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchData' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'catch' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'err' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'err' } }],
                },
                property: { type: 'Identifier', name: 'toBeDefined' },
              },
              arguments: [],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with MemberExpression argument inside expect', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithMemberExprArg())
    expect(reports).toHaveLength(1)
  })

  test('does NOT report when callback is null', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [null],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when callback is undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [undefined],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report node without callee property', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({ type: 'CallExpression' })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when callee is not MemberExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expect' },
      arguments: [],
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when property is not then or catch', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when object of MemberExpression is not CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when expect-like callee has wrong name', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'assert' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    })
    expect(reports).toHaveLength(0)
  })

  test('reports expect.then with deeply nested await expect', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'condition' },
            consequent: {
              type: 'BlockStatement',
              body: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: {
                    type: 'MemberExpression',
                    object: {
                      type: 'CallExpression',
                      callee: { type: 'Identifier', name: 'expect' },
                      arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                    },
                    property: { type: 'Identifier', name: 'toBe' },
                  },
                  arguments: [{ type: 'Literal', value: 1 }],
                },
              }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('reports multiple await expects inside single .then() callback', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }, {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: true }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(2)
  })

  test('does NOT report .then() callback with expect of string literal', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'Literal', value: 'hello' }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 'hello' }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .catch() callback with expect without await', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'catch' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'err' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'Identifier', name: 'err' }],
                },
                property: { type: 'Identifier', name: 'toBeDefined' },
              },
              arguments: [],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with expect(await) using toEqual matcher', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toEqual' },
              },
              arguments: [{ type: 'Literal', value: 42 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('reports .catch() with expect(await) using toBe matcher', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'catch' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'err' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'err' } }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 'error' }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('reports .then() with function expression callback (not arrow)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report .then() with identifier argument to expect', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'Identifier', name: 'someVar' }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() when expect has rejects inside callback', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: {
                    type: 'MemberExpression',
                    object: {
                      type: 'CallExpression',
                      callee: { type: 'Identifier', name: 'expect' },
                      arguments: [{ type: 'Identifier', name: 'val' }],
                    },
                    property: { type: 'Identifier', name: 'rejects' },
                  },
                  arguments: [],
                },
                property: { type: 'Identifier', name: 'toThrow' },
              },
              arguments: [],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report node with non-Identifier callee in expect call', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Literal', value: 42 },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [],
    })
    expect(reports).toHaveLength(0)
  })

  test('reports with location information from node', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithAwait(5, 10))
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc?.start.line).toBe(5)
  })

  test('handles node with arguments as empty array', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() on regular function call', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'someFunc' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .catch() on regular function call', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'someFunc' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'catch' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with expect using .not.toBe with await', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithNestedExpectAwait())
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('resolves')
  })

  test('does NOT report node with computed property', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: true,
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Literal', value: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when node type is not CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'Identifier',
      name: 'foo',
    })
    expect(reports).toHaveLength(0)
  })

  test('reports .then() callback with expect having MemberExpression as arg', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenWithMemberExprArg())
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('resolves')
  })

  test('does NOT report expect(promise).finally() with await inside', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'finally' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with arrow function returning expect(await) directly', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
            },
            property: { type: 'Identifier', name: 'toBe' },
          },
          arguments: [{ type: 'Literal', value: 1 }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report .then() with callback that has no body', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'noop' },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with try-catch containing await expect', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'TryStatement',
            block: {
              type: 'BlockStatement',
              body: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: {
                    type: 'MemberExpression',
                    object: {
                      type: 'CallExpression',
                      callee: { type: 'Identifier', name: 'expect' },
                      arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                    },
                    property: { type: 'Identifier', name: 'toBe' },
                  },
                  arguments: [{ type: 'Literal', value: 1 }],
                },
              }],
            },
            handler: null,
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('handles node with missing property on MemberExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
      },
      arguments: [],
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() on chained expect().toBe().then()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'value' }],
            },
            property: { type: 'Identifier', name: 'toBe' },
          },
          arguments: [{ type: 'Literal', value: 1 }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('reports .catch() with nested MemberExpression as expect argument', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'catch' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'err' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'err' },
                    property: { type: 'Identifier', name: 'message' },
                  }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 'error' }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report .then() with callback containing only console.log', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectThenNoExpectInCallback())
    expect(reports).toHaveLength(0)
  })

  test('reports correct message for .catch() violation', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(createExpectCatchWithAwait())
    expect(reports[0].message).toBe('Use `expect().resolves` or `expect().rejects` instead of manually awaiting promises in assertions.')
  })

  test('does NOT report when callee object callee is not Identifier', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    })
    expect(reports).toHaveLength(0)
  })

  test('handles node without loc property', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    const node = createExpectThenWithAwait()
    const nodeWithoutLoc = { ...node }
    delete (nodeWithoutLoc as Record<string, unknown>).loc
    visitor.CallExpression(nodeWithoutLoc)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report expect().resolves.toEqual()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'resolves' },
          },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toEqual' },
      },
      arguments: [{ type: 'Literal', value: 42 }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report expect().rejects.toBeDefined()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'rejects' },
          },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toBeDefined' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with expect(await) using toBe', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: true }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('reports .catch() with expect(await) using toEqual', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'catch' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'err' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'err' } }],
                },
                property: { type: 'Identifier', name: 'toEqual' },
              },
              arguments: [{ type: 'Literal', value: false }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report when inner expect has no arguments', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() with expect containing CallExpression arg', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'getValue' },
                    arguments: [],
                  }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() with expect containing null literal', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'Literal', value: null }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: null }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() with expect containing undefined literal', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'Identifier', name: 'undefined' }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Identifier', name: 'undefined' }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with expect(await) using toStrictEqual', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toStrictEqual' },
              },
              arguments: [{ type: 'Literal', value: 42 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('reports .then() with expect(await) using toHaveProperty', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
                },
                property: { type: 'Identifier', name: 'toHaveProperty' },
              },
              arguments: [{ type: 'Literal', value: 'key' }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report .then() with only variable assignment', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'VariableDeclaration',
            declarations: [{
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'result' },
              init: { type: 'Identifier', name: 'val' },
            }],
            kind: 'const',
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when node has wrong type string', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({ type: 'UnknownType' })
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with expect(await chained method)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'val' },
                    property: { type: 'Identifier', name: 'data' },
                  }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report .then() with return statement only', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'Identifier', name: 'val' },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('handles node with numeric callback argument', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [42],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when property name is undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier' },
      },
      arguments: [],
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report when callee object is missing', () => {
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [],
    })
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() with expect containing array literal', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'ArrayExpression', elements: [] }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'ArrayExpression', elements: [] }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() with expect containing object expression', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{ type: 'ObjectExpression', properties: [] }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'ObjectExpression', properties: [] }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('reports .then() with expect(MemberExpression.val).toBe()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'promise' }],
        },
        property: { type: 'Identifier', name: 'then' },
      },
      arguments: [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'expect' },
                  arguments: [{
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'val' },
                    property: { type: 'Identifier', name: 'foo' },
                  }],
                },
                property: { type: 'Identifier', name: 'toBe' },
              },
              arguments: [{ type: 'Literal', value: 'bar' }],
            },
          }],
        },
      }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT report .then() with expect().resolves.toHaveLength()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'resolves' },
          },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toHaveLength' },
      },
      arguments: [{ type: 'Literal', value: 3 }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT report .then() with expect().rejects.toContain()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'promise' }],
            },
            property: { type: 'Identifier', name: 'rejects' },
          },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toContain' },
      },
      arguments: [{ type: 'Literal', value: 'error' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    visitor.CallExpression(node)
    expect(reports).toHaveLength(0)
  })

  test('meta.docs.description mentions .then()', () => {
    expect(preferResolvesRejectsRule.meta.docs.description).toContain('.then()')
  })

  test('meta.docs.description mentions .catch()', () => {
    expect(preferResolvesRejectsRule.meta.docs.description).toContain('.catch()')
  })

  test('rule has default export', () => {
    expect(preferResolvesRejectsRule).toBeDefined()
  })

  test('create() method returns object', () => {
    const { context } = createMockContext()
    const visitor = preferResolvesRejectsRule.create(context)
    expect(typeof visitor).toBe('object')
  })
})
