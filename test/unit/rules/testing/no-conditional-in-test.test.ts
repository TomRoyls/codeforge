import { describe, expect, test, vi } from 'vitest'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { noConditionalInTestRule } from '../../../../src/rules/testing/no-conditional-in-test.js'
import noConditionalInTestDefault from '../../../../src/rules/testing/no-conditional-in-test.js'

interface ReportDescriptor {
  loc?: unknown
  message: string
  node: unknown
}

function createMockContext(options: Record<string, unknown> = {}): {
  context: RuleContext
  reports: ReportDescriptor[]
} {
  const reports: ReportDescriptor[] = []
  return {
    context: {
      config: { options: [options] },
      getAST: () => null,
      getComments: () => [],
      getFilePath: () => '/src/file.test.ts',
      getSource: () => '',
      getTokens: () => [],
      logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
      },
      report: (descriptor: ReportDescriptor) => {
        reports.push(descriptor)
      },
      workspaceRoot: '/src',
    } as unknown as RuleContext,
    reports,
  }
}

function createItCall(line = 1, column = 0): unknown {
  return {
    arguments: [
      { type: 'Literal', value: 'test name' },
      { body: { body: [], type: 'BlockStatement' }, type: 'ArrowFunctionExpression' },
    ],
    callee: { name: 'it', type: 'Identifier' },
    loc: { end: { column: column + 20, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createTestCall(line = 1, column = 0): unknown {
  return {
    arguments: [
      { type: 'Literal', value: 'test name' },
      { body: { body: [], type: 'BlockStatement' }, type: 'ArrowFunctionExpression' },
    ],
    callee: { name: 'test', type: 'Identifier' },
    loc: { end: { column: column + 20, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createItMemberCall(method: string, line = 1, column = 0): unknown {
  return {
    arguments: [
      { type: 'Literal', value: 'test name' },
      { body: { body: [], type: 'BlockStatement' }, type: 'ArrowFunctionExpression' },
    ],
    callee: {
      object: { name: 'it', type: 'Identifier' },
      property: { name: method, type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + 25, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createTestMemberCall(method: string, line = 1, column = 0): unknown {
  return {
    arguments: [
      { type: 'Literal', value: 'test name' },
      { body: { body: [], type: 'BlockStatement' }, type: 'ArrowFunctionExpression' },
    ],
    callee: {
      object: { name: 'test', type: 'Identifier' },
      property: { name: method, type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: { end: { column: column + 25, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createIfStatement(line = 1, column = 0): unknown {
  return {
    alternate: null,
    consequent: { body: [], type: 'BlockStatement' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    test: { name: 'condition', type: 'Identifier' },
    type: 'IfStatement',
  }
}

function createSwitchStatement(line = 1, column = 0): unknown {
  return {
    cases: [],
    discriminant: { name: 'value', type: 'Identifier' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    type: 'SwitchStatement',
  }
}

function createConditionalExpression(line = 1, column = 0): unknown {
  return {
    alternate: { name: 'b', type: 'Identifier' },
    consequent: { name: 'a', type: 'Identifier' },
    loc: { end: { column: column + 15, line }, start: { column, line } },
    test: { name: 'condition', type: 'Identifier' },
    type: 'ConditionalExpression',
  }
}

function createForStatement(line = 1, column = 0): unknown {
  return {
    body: { body: [], type: 'BlockStatement' },
    init: null,
    loc: { end: { column: column + 10, line }, start: { column, line } },
    test: null,
    type: 'ForStatement',
    update: null,
  }
}

function createForInStatement(line = 1, column = 0): unknown {
  return {
    body: { body: [], type: 'BlockStatement' },
    left: { name: 'key', type: 'Identifier' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    right: { name: 'obj', type: 'Identifier' },
    type: 'ForInStatement',
  }
}

function createForOfStatement(line = 1, column = 0): unknown {
  return {
    body: { body: [], type: 'BlockStatement' },
    left: { name: 'item', type: 'Identifier' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    right: { name: 'arr', type: 'Identifier' },
    type: 'ForOfStatement',
  }
}

function createWhileStatement(line = 1, column = 0): unknown {
  return {
    body: { body: [], type: 'BlockStatement' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    test: { name: 'condition', type: 'Identifier' },
    type: 'WhileStatement',
  }
}

function createDoWhileStatement(line = 1, column = 0): unknown {
  return {
    body: { body: [], type: 'BlockStatement' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    test: { name: 'condition', type: 'Identifier' },
    type: 'DoWhileStatement',
  }
}

function createCatchClause(line = 1, column = 0): unknown {
  return {
    body: { body: [], type: 'BlockStatement' },
    loc: { end: { column: column + 10, line }, start: { column, line } },
    param: { name: 'error', type: 'Identifier' },
    type: 'CatchClause',
  }
}

function createDescribeCall(line = 1, column = 0): unknown {
  return {
    arguments: [
      { type: 'Literal', value: 'suite' },
      { body: { body: [], type: 'BlockStatement' }, type: 'ArrowFunctionExpression' },
    ],
    callee: { name: 'describe', type: 'Identifier' },
    loc: { end: { column: column + 30, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

function createBeforeEachCall(line = 1, column = 0): unknown {
  return {
    arguments: [
      { body: { body: [], type: 'BlockStatement' }, type: 'ArrowFunctionExpression' },
    ],
    callee: { name: 'beforeEach', type: 'Identifier' },
    loc: { end: { column: column + 25, line }, start: { column, line } },
    type: 'CallExpression',
  }
}

// ============================================================================
// META TESTS
// ============================================================================

describe('no-conditional-in-test meta', () => {
  test('has correct type', () => {
    expect(noConditionalInTestRule.meta.type).toBe('suggestion')
  })

  test('has correct severity', () => {
    expect(noConditionalInTestRule.meta.severity).toBe('warn')
  })

  test('is recommended', () => {
    expect(noConditionalInTestRule.meta.docs?.recommended).toBe(true)
  })

  test('has testing category', () => {
    expect(noConditionalInTestRule.meta.docs?.category).toBe('testing')
  })

  test('has schema', () => {
    expect(noConditionalInTestRule.meta.schema).toBeDefined()
    expect(Array.isArray(noConditionalInTestRule.meta.schema)).toBe(true)
  })

  test('has description', () => {
    expect(noConditionalInTestRule.meta.docs?.description).toBe(
      'Disallow conditional statements inside test bodies',
    )
  })

  test('has url', () => {
    expect(noConditionalInTestRule.meta.docs?.url).toBe(
      'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-conditional-in-test',
    )
  })
})

// ============================================================================
// CREATE TESTS
// ============================================================================

describe('no-conditional-in-test create', () => {
  test('returns visitor with required methods', () => {
    const { context } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    expect(visitor).toBeDefined()
    expect(typeof visitor.IfStatement).toBe('function')
    expect(typeof visitor.SwitchStatement).toBe('function')
    expect(typeof visitor.ConditionalExpression).toBe('function')
    expect(typeof visitor.CallExpression).toBe('function')
    expect(typeof visitor['CallExpression:exit']).toBe('function')
  })

  test('returns visitor with loop and catch methods', () => {
    const { context } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    expect(typeof visitor.ForStatement).toBe('function')
    expect(typeof visitor.WhileStatement).toBe('function')
    expect(typeof visitor.CatchClause).toBe('function')
  })
})

// ============================================================================
// VALID: NO CONDITIONALS
// ============================================================================

describe('no-conditional-in-test valid: no conditionals', () => {
  test('does not report when test has no conditionals', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('does not report when test has only expect calls', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    const expectCall = {
      arguments: [{ name: 'x', type: 'Identifier' }],
      callee: { name: 'expect', type: 'Identifier' },
      type: 'CallExpression',
    }
    visitor.CallExpression!(expectCall)
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('does not report if statement in describe block', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const describe = createDescribeCall()
    visitor.CallExpression!(describe)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(describe)
    expect(reports).toHaveLength(0)
  })

  test('does not report if statement at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    visitor.IfStatement!(createIfStatement())
    expect(reports).toHaveLength(0)
  })

  test('does not report it.only with no conditionals', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itOnly = createItMemberCall('only')
    visitor.CallExpression!(itOnly)
    visitor['CallExpression:exit']!(itOnly)
    expect(reports).toHaveLength(0)
  })
})

// ============================================================================
// INVALID: IF STATEMENT
// ============================================================================

describe('no-conditional-in-test invalid: if statement', () => {
  test('reports if statement inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'it' test")
  })

  test('reports if statement inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'test' test")
  })

  test('reports if statement inside it.skip()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itSkip = createItMemberCall('skip')
    visitor.CallExpression!(itSkip)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itSkip)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'it' test")
  })
})

// ============================================================================
// INVALID: SWITCH STATEMENT
// ============================================================================

describe('no-conditional-in-test invalid: switch', () => {
  test('reports switch statement inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected switch statement inside 'it' test")
  })

  test('reports switch statement inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected switch statement inside 'test' test")
  })
})

// ============================================================================
// INVALID: TERNARY
// ============================================================================

describe('no-conditional-in-test invalid: ternary', () => {
  test('reports ConditionalExpression inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected ternary expression inside 'it' test")
  })

  test('reports ConditionalExpression inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected ternary expression inside 'test' test")
  })
})

// ============================================================================
// INVALID: LOOPS
// ============================================================================

describe('no-conditional-in-test invalid: loops', () => {
  test('reports for loop inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForStatement!(createForStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected for loop inside 'it' test")
  })

  test('reports for-in loop inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForInStatement!(createForInStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected for-in loop inside 'it' test")
  })

  test('reports for-of loop inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForOfStatement!(createForOfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected for-of loop inside 'it' test")
  })

  test('reports while loop inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.WhileStatement!(createWhileStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected while loop inside 'it' test")
  })

  test('reports do-while loop inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.DoWhileStatement!(createDoWhileStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected do-while loop inside 'it' test")
  })
})

// ============================================================================
// INVALID: TRY/CATCH
// ============================================================================

describe('no-conditional-in-test invalid: try/catch', () => {
  test('reports CatchClause inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected catch clause inside 'it' test")
  })

  test('reports CatchClause inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected catch clause inside 'test' test")
  })
})

// ============================================================================
// VALID: OUTSIDE TEST
// ============================================================================

describe('no-conditional-in-test valid: outside test', () => {
  test('does not report if statement in describe block', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const describe = createDescribeCall()
    visitor.CallExpression!(describe)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(describe)
    expect(reports).toHaveLength(0)
  })

  test('does not report if statement at top level (no test)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    visitor.IfStatement!(createIfStatement())
    expect(reports).toHaveLength(0)
  })

  test('does not report if in beforeEach hook', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const beforeEach = createBeforeEachCall()
    visitor.CallExpression!(beforeEach)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(beforeEach)
    expect(reports).toHaveLength(0)
  })

  test('does not report switch in describe block', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const describe = createDescribeCall()
    visitor.CallExpression!(describe)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(describe)
    expect(reports).toHaveLength(0)
  })
})

// ============================================================================
// OPTIONS: checkLoopStatements false
// ============================================================================

describe('no-conditional-in-test options: checkLoopStatements false', () => {
  test('does not report for loop when checkLoopStatements is false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForStatement!(createForStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('does not report while loop when checkLoopStatements is false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.WhileStatement!(createWhileStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('still reports if statement when checkLoopStatements is false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
  })
})

// ============================================================================
// OPTIONS: checkTryCatch false
// ============================================================================

describe('no-conditional-in-test options: checkTryCatch false', () => {
  test('does not report CatchClause when checkTryCatch is false', () => {
    const { context, reports } = createMockContext({ checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('still reports if statement when checkTryCatch is false', () => {
    const { context, reports } = createMockContext({ checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
  })

  test('still reports switch when checkTryCatch is false', () => {
    const { context, reports } = createMockContext({ checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
  })
})

// ============================================================================
// MEMBER EXPRESSION TESTS
// ============================================================================

describe('no-conditional-in-test member expression tests', () => {
  test('reports if statement inside it.only()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itOnly = createItMemberCall('only')
    visitor.CallExpression!(itOnly)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itOnly)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'it' test")
  })

  test('reports if statement inside test.skip()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testSkip = createTestMemberCall('skip')
    visitor.CallExpression!(testSkip)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(testSkip)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'test' test")
  })

  test('reports if statement inside it.each()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itEach = createItMemberCall('each')
    visitor.CallExpression!(itEach)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itEach)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'it' test")
  })
})

// ============================================================================
// EDGE CASES
// ============================================================================

describe('no-conditional-in-test edge cases', () => {
  test('handles null node in IfStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(null)
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
  })

  test('handles undefined node in IfStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(undefined)
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
  })

  test('handles empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    visitor.IfStatement!({})
    expect(reports).toHaveLength(0)
  })

  test('does not report if in non-test function', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const fnCall = {
      arguments: [{ type: 'Literal', value: 'args' }],
      callee: { name: 'myFunction', type: 'Identifier' },
      type: 'CallExpression',
    }
    visitor.CallExpression!(fnCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(fnCall)
    expect(reports).toHaveLength(0)
  })

  test('handles nested test functions correctly', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const outerIt = createItCall()
    const innerIt = createTestCall()
    visitor.CallExpression!(outerIt)
    visitor.CallExpression!(innerIt)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(innerIt)
    visitor['CallExpression:exit']!(outerIt)
    expect(reports).toHaveLength(1)
  })

  test('does not report conditional expression in helper function', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    const helperCall = {
      arguments: [{ type: 'Literal', value: 'args' }],
      callee: { name: 'helper', type: 'Identifier' },
      type: 'CallExpression',
    }
    visitor.CallExpression!(helperCall)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(helperCall)
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
  })
})

// ============================================================================
// LOCATION REPORTING
// ============================================================================

describe('no-conditional-in-test location reporting', () => {
  test('reports correct start location', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement(5, 10))
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toEqual({
      end: { column: 20, line: 5 },
      start: { column: 10, line: 5 },
    })
  })

  test('reports correct end location for switch', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.SwitchStatement!(createSwitchStatement(3, 5))
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toEqual({
      end: { column: 15, line: 3 },
      start: { column: 5, line: 3 },
    })
  })
})

// ============================================================================
// REPORT MESSAGE CONTENT
// ============================================================================

describe('no-conditional-in-test report message content', () => {
  test('message includes test function name for it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports[0].message).toContain("'it'")
  })

  test('message includes test function name for test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports[0].message).toContain("'test'")
  })
})

// ============================================================================
// MULTIPLE VIOLATIONS
// ============================================================================

describe('no-conditional-in-test multiple violations', () => {
  test('reports multiple conditionals in same test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement())
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(2)
  })

  test('reports conditionals in separate tests independently', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall1 = createItCall(1)
    const itCall2 = createItCall(10)
    visitor.CallExpression!(itCall1)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall1)
    visitor.CallExpression!(itCall2)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(itCall2)
    expect(reports).toHaveLength(2)
  })
})

// ============================================================================
// INDEPENDENT VISITORS
// ============================================================================

describe('no-conditional-in-test independent visitors', () => {
  test('separate creates work independently', () => {
    const ctx1 = createMockContext()
    const ctx2 = createMockContext()
    const visitor1 = noConditionalInTestRule.create(ctx1.context)
    const visitor2 = noConditionalInTestRule.create(ctx2.context)
    const itCall = createItCall()
    visitor1.CallExpression!(itCall)
    visitor1.IfStatement!(createIfStatement())
    visitor1['CallExpression:exit']!(itCall)
    visitor2.IfStatement!(createIfStatement())
    expect(ctx1.reports).toHaveLength(1)
    expect(ctx2.reports).toHaveLength(0)
  })
})

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

describe('no-conditional-in-test default export', () => {
  test('default export matches named export', () => {
    expect(noConditionalInTestDefault).toBe(noConditionalInTestRule)
  })
})

// ============================================================================
// ADDITIONAL: IF/ELSE
// ============================================================================

describe('no-conditional-in-test if/else', () => {
  test('reports if statement with else block inside it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    const ifWithElse = {
      ...createIfStatement(),
      alternate: { body: [], type: 'BlockStatement' },
    }
    visitor.IfStatement!(ifWithElse)
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'it' test")
  })
})

// ============================================================================
// ADDITIONAL: MEMBER EXPRESSION VARIANTS
// ============================================================================

describe('no-conditional-in-test member expression variants', () => {
  test('reports switch inside test.each()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testEach = createTestMemberCall('each')
    visitor.CallExpression!(testEach)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(testEach)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected switch statement inside 'test' test")
  })

  test('reports ConditionalExpression inside it.only()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itOnly = createItMemberCall('only')
    visitor.CallExpression!(itOnly)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(itOnly)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected ternary expression inside 'it' test")
  })

  test('reports while loop inside test.skip()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testSkip = createTestMemberCall('skip')
    visitor.CallExpression!(testSkip)
    visitor.WhileStatement!(createWhileStatement())
    visitor['CallExpression:exit']!(testSkip)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected while loop inside 'test' test")
  })

  test('reports while loop inside it.only()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itOnly = createItMemberCall('only')
    visitor.CallExpression!(itOnly)
    visitor.WhileStatement!(createWhileStatement())
    visitor['CallExpression:exit']!(itOnly)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected while loop inside 'it' test")
  })

  test('reports CatchClause inside it.only()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itOnly = createItMemberCall('only')
    visitor.CallExpression!(itOnly)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(itOnly)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected catch clause inside 'it' test")
  })

  test('reports ternary inside test.each()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testEach = createTestMemberCall('each')
    visitor.CallExpression!(testEach)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(testEach)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected ternary expression inside 'test' test")
  })
})

// ============================================================================
// ADDITIONAL: LOOP VARIANTS WITH test()
// ============================================================================

describe('no-conditional-in-test loop variants with test()', () => {
  test('reports for-in loop inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.ForInStatement!(createForInStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected for-in loop inside 'test' test")
  })

  test('reports for-of loop inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.ForOfStatement!(createForOfStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected for-of loop inside 'test' test")
  })

  test('reports do-while loop inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.DoWhileStatement!(createDoWhileStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected do-while loop inside 'test' test")
  })
})

// ============================================================================
// ADDITIONAL: TERNARY IN NESTED CALL
// ============================================================================

describe('no-conditional-in-test ternary in nested call', () => {
  test('reports ternary inside expect() call within test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    const expectCall = {
      arguments: [{ name: 'x', type: 'Identifier' }],
      callee: { name: 'expect', type: 'Identifier' },
      type: 'CallExpression',
    }
    visitor.CallExpression!(expectCall)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(expectCall)
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected ternary expression inside 'it' test")
  })
})

// ============================================================================
// ADDITIONAL: VALID — NO VIOLATION IN HOOKS/DESCRIBE
// ============================================================================

describe('no-conditional-in-test valid: hooks and describe', () => {
  test('does not report ConditionalExpression inside describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const describe = createDescribeCall()
    visitor.CallExpression!(describe)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(describe)
    expect(reports).toHaveLength(0)
  })

  test('does not report ConditionalExpression inside beforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const beforeEach = createBeforeEachCall()
    visitor.CallExpression!(beforeEach)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(beforeEach)
    expect(reports).toHaveLength(0)
  })

  test('does not report CatchClause inside describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const describe = createDescribeCall()
    visitor.CallExpression!(describe)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(describe)
    expect(reports).toHaveLength(0)
  })

  test('does not report ForStatement inside beforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const beforeEach = createBeforeEachCall()
    visitor.CallExpression!(beforeEach)
    visitor.ForStatement!(createForStatement())
    visitor['CallExpression:exit']!(beforeEach)
    expect(reports).toHaveLength(0)
  })
})

// ============================================================================
// ADDITIONAL: MULTIPLE CONDITIONALS OF SAME TYPE
// ============================================================================

describe('no-conditional-in-test multiple same-type conditionals', () => {
  test('reports three if statements in one test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement(1, 0))
    visitor.IfStatement!(createIfStatement(2, 0))
    visitor.IfStatement!(createIfStatement(3, 0))
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(3)
  })
})

// ============================================================================
// ADDITIONAL: OPTIONS — checkLoopStatements false for remaining loops
// ============================================================================

describe('no-conditional-in-test options: checkLoopStatements false remaining', () => {
  test('does not report do-while loop when checkLoopStatements is false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.DoWhileStatement!(createDoWhileStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('does not report for-in loop when checkLoopStatements is false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForInStatement!(createForInStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

    test('does not report for-of loop when checkLoopStatements is false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForOfStatement!(createForOfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })
})

  describe('no-conditional-in-test additional coverage', () => {
  test('reports for loop inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.ForStatement!(createForStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected for loop inside 'test' test")
  })

  test('reports while loop inside test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.WhileStatement!(createWhileStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected while loop inside 'test' test")
  })

  test('still reports if statement when both checkLoopStatements and checkTryCatch are false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false, checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("Unexpected if statement inside 'it' test")
  })

  test('reports multiple loop types in same test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForStatement!(createForStatement())
    visitor.WhileStatement!(createWhileStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(2)
  })

  test('correctly resets test tracking after exiting and re-entering tests', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)

    const itCall1 = createItCall(1)
    visitor.CallExpression!(itCall1)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall1)

    const testCall = createTestCall(10)
    visitor.CallExpression!(testCall)
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(testCall)

    expect(reports).toHaveLength(2)
    expect(reports[0].message).toContain("'it' test")
    expect(reports[1].message).toContain("'test' test")
  })
  test('reports switch inside test() function', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testCall = createTestCall()
    visitor.CallExpression!(testCall)
    visitor.SwitchStatement!(createSwitchStatement())
    visitor['CallExpression:exit']!(testCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('test')
  })

  test('reports for-in inside it.only() member call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itOnly = createItMemberCall('only')
    visitor.CallExpression!(itOnly)
    visitor.ForInStatement!(createForInStatement())
    visitor['CallExpression:exit']!(itOnly)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('it')
  })

  test('reports do-while inside test.skip() member call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const testSkip = createTestMemberCall('skip')
    visitor.CallExpression!(testSkip)
    visitor.DoWhileStatement!(createDoWhileStatement())
    visitor['CallExpression:exit']!(testSkip)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('test')
  })

  test('reports conditional expression inside nested test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const outer = createDescribeCall(1, 0)
    const inner = createItCall(2, 2)
    visitor.CallExpression!(outer)
    visitor.CallExpression!(inner)
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(inner)
    visitor['CallExpression:exit']!(outer)
    expect(reports).toHaveLength(1)
  })

  test('does not report conditional expression after exiting test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor['CallExpression:exit']!(itCall)
    visitor.ConditionalExpression!(createConditionalExpression())
    expect(reports).toHaveLength(0)
  })

  test('reports multiple different conditionals in one test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.IfStatement!(createIfStatement())
    visitor.SwitchStatement!(createSwitchStatement())
    visitor.ConditionalExpression!(createConditionalExpression())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(3)
  })

  test('reports catch clause inside it() when checkTryCatch is true (default)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('try/catch')
  })

  test('does not report catch clause when checkTryCatch is false', () => {
    const { context, reports } = createMockContext({ checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('does not report catch clause outside test', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    visitor.CatchClause!(createCatchClause())
    expect(reports).toHaveLength(0)
  })

  test('reports while loop inside it() when checkLoopStatements is true (default)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.WhileStatement!(createWhileStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('while')
  })

  test('reports for loop inside it.concurrent() member call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConditionalInTestRule.create(context)
    const itConcurrent = createItMemberCall('concurrent')
    visitor.CallExpression!(itConcurrent)
    visitor.ForStatement!(createForStatement())
    visitor['CallExpression:exit']!(itConcurrent)
    expect(reports).toHaveLength(1)
  })

  test('does not report for loop when checkLoopStatements is false but still reports if', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForStatement!(createForStatement())
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('if')
  })

  test('does not report catch clause when checkTryCatch is false', () => {
    const { context, reports } = createMockContext({ checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  test('still reports if statement when checkTryCatch is false', () => {
    const { context, reports } = createMockContext({ checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.CatchClause!(createCatchClause())
    visitor.IfStatement!(createIfStatement())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('if')
  })

  test('does not report loops or catch when both options are false', () => {
    const { context, reports } = createMockContext({ checkLoopStatements: false, checkTryCatch: false })
    const visitor = noConditionalInTestRule.create(context)
    const itCall = createItCall()
    visitor.CallExpression!(itCall)
    visitor.ForStatement!(createForStatement())
    visitor.WhileStatement!(createWhileStatement())
    visitor.CatchClause!(createCatchClause())
    visitor['CallExpression:exit']!(itCall)
    expect(reports).toHaveLength(0)
  })

  describe('additional verification', () => {
    test('should have create as a function', () => {
      expect(typeof noConditionalInTestRule.create).toBe('function')
    })
  })
})
