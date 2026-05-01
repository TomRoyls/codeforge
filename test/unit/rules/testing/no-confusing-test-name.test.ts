import { describe, test, expect, vi } from 'vitest'
import { noConfusingTestNameRule } from '../../../../src/rules/testing/no-confusing-test-name.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "const it = 'test';",
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getSource: () => source,
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    settings: {},
    ruleId: 'no-confusing-test-name',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createVariableDeclarator(
  name: string,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init: { type: 'Literal', value: 'test' },
    loc: loc ?? { start: { line: 1, column: 6 }, end: { line: 1, column: 20 } },
  }
}

function createFunctionDeclaration(
  name: string,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

describe('no-confusing-test-name', () => {
  const rule = noConfusingTestNameRule

  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('shadow')
    expect(rule.meta.severity).toBe('warn')
    expect(rule.meta.type).toBe('suggestion')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports shadowing variable declarations
  test('reports const it = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('it'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('it')
  })

  test('reports const test = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('test'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('test')
  })

  test('reports const describe = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('describe'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('describe')
  })

  test('reports const expect = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('expect'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('expect')
  })

  test('reports const beforeEach = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('beforeEach'))
    expect(reports.length).toBe(1)
  })

  test('reports const afterEach = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('afterEach'))
    expect(reports.length).toBe(1)
  })

  test('reports const beforeAll = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('beforeAll'))
    expect(reports.length).toBe(1)
  })

  test('reports const afterAll = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('afterAll'))
    expect(reports.length).toBe(1)
  })

  test('reports const jest = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('jest'))
    expect(reports.length).toBe(1)
  })

  test('reports const vi = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('vi'))
    expect(reports.length).toBe(1)
  })

  test('reports const xdescribe = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('xdescribe'))
    expect(reports.length).toBe(1)
  })

  test('reports const fdescribe = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('fdescribe'))
    expect(reports.length).toBe(1)
  })

  test('reports const xtest = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('xtest'))
    expect(reports.length).toBe(1)
  })

  test('reports const xit = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('xit'))
    expect(reports.length).toBe(1)
  })

  test('reports const fit = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('fit'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Reports shadowing function declarations
  test('reports function it()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('it'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('it')
  })

  test('reports function test()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('test'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('test')
  })

  test('reports function describe()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('describe'))
    expect(reports.length).toBe(1)
  })

  test('reports function expect()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('expect'))
    expect(reports.length).toBe(1)
  })

  test('reports function beforeEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('beforeEach'))
    expect(reports.length).toBe(1)
  })

  test('reports function afterEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('afterEach'))
    expect(reports.length).toBe(1)
  })

  test('reports function beforeAll()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('beforeAll'))
    expect(reports.length).toBe(1)
  })

  test('reports function afterAll()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('afterAll'))
    expect(reports.length).toBe(1)
  })

  test('reports function jest()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('jest'))
    expect(reports.length).toBe(1)
  })

  test('reports function vi()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('vi'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does NOT report non-shadowing names
  test('does not report const item = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('item'))
    expect(reports.length).toBe(0)
  })

  test('does not report const data = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('data'))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result'))
    expect(reports.length).toBe(0)
  })

  test('does not report function processData()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('processData'))
    expect(reports.length).toBe(0)
  })

  test('does not report function helper()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('helper'))
    expect(reports.length).toBe(0)
  })

  // SECTION: Edge cases
  test('handles null node for VariableDeclarator', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(null)
    expect(reports.length).toBe(0)
  })

  test('handles null node for FunctionDeclaration', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(null)
    expect(reports.length).toBe(0)
  })

  test('handles undefined node for VariableDeclarator', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(undefined)
    expect(reports.length).toBe(0)
  })

  test('handles undefined node for FunctionDeclaration', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(undefined)
    expect(reports.length).toBe(0)
  })

  test('handles node without type', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({ id: { type: 'Identifier', name: 'it' } })
    expect(reports.length).toBe(1)
  })

  test('handles VariableDeclarator without id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({ type: 'VariableDeclarator' })
    expect(reports.length).toBe(0)
  })

  test('handles FunctionDeclaration without id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!({ type: 'FunctionDeclaration' })
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator with non-Identifier id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ObjectPattern', properties: [] },
    })
    expect(reports.length).toBe(0)
  })

  test('handles FunctionDeclaration with non-Identifier id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!({
      type: 'FunctionDeclaration',
      id: { type: 'Literal', value: 'test' },
    })
    expect(reports.length).toBe(0)
  })

  test('handles empty object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({})
    expect(reports.length).toBe(0)
  })

  // SECTION: Location reporting
  test('includes location in VariableDeclarator report', () => {
    const loc = { start: { line: 5, column: 6 }, end: { line: 5, column: 20 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('it', loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  test('includes location in FunctionDeclaration report', () => {
    const loc = { start: { line: 10, column: 0 }, end: { line: 10, column: 30 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('test', loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  // SECTION: File path variations
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('it'))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('describe'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor handlers
  test('visitor has VariableDeclarator handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.VariableDeclarator).toBe('function')
  })

  test('visitor has FunctionDeclaration handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.FunctionDeclaration).toBe('function')
  })

  test('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('it'))
    visitor.VariableDeclarator!(createVariableDeclarator('describe'))
    visitor.FunctionDeclaration!(createFunctionDeclaration('expect'))
    expect(reports.length).toBe(3)
  })

  test('reports const context = value does not trigger (not a test global)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('context'))
    expect(reports.length).toBe(0)
  })

  test('reports const suite = value does not trigger', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('suite'))
    expect(reports.length).toBe(0)
  })

  test('does not report VariableDeclarator with null id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: null,
    })
    expect(reports.length).toBe(0)
  })

  test('does not report FunctionDeclaration with null id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!({
      type: 'FunctionDeclaration',
      id: null,
    })
    expect(reports.length).toBe(0)
  })

  test('reports VariableDeclarator with name "expect" even without init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'expect' },
    })
    expect(reports.length).toBe(1)
  })

  test('does not report VariableDeclarator with name containing test global as substring', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('iterator'))
    expect(reports.length).toBe(0)
  })

  test('does not report VariableDeclarator with name "testing"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('testing'))
    expect(reports.length).toBe(0)
  })

  test('does not report VariableDeclarator with name "description"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('description'))
    expect(reports.length).toBe(0)
  })

  test('does not report VariableDeclarator with name "expected"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('expected'))
    expect(reports.length).toBe(0)
  })

  test('does not report VariableDeclarator with name "items"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('items'))
    expect(reports.length).toBe(0)
  })

  test('does not report function getData()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('getData'))
    expect(reports.length).toBe(0)
  })

  test('does not report function setup()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('setup'))
    expect(reports.length).toBe(0)
  })

  test('does not report function cleanup()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('cleanup'))
    expect(reports.length).toBe(0)
  })

  test('does not report const value = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('value'))
    expect(reports.length).toBe(0)
  })

  test('does not report const fn = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('fn'))
    expect(reports.length).toBe(0)
  })

  test('does not report const callback = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('callback'))
    expect(reports.length).toBe(0)
  })

  test('does not report const config = value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('config'))
    expect(reports.length).toBe(0)
  })

  test('does not report function validate()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('validate'))
    expect(reports.length).toBe(0)
  })

  test('does not report function transform()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('transform'))
    expect(reports.length).toBe(0)
  })

  test('reports mixed valid and invalid names', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('data'))
    visitor.VariableDeclarator!(createVariableDeclarator('it'))
    visitor.VariableDeclarator!(createVariableDeclarator('result'))
    visitor.VariableDeclarator!(createVariableDeclarator('describe'))
    expect(reports.length).toBe(2)
  })

  test('reports function it() and function test() separately', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('it'))
    visitor.FunctionDeclaration!(createFunctionDeclaration('test'))
    expect(reports.length).toBe(2)
    expect(reports[0].message).toContain('it')
    expect(reports[1].message).toContain('test')
  })

  test('does not report function item()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('item'))
    expect(reports.length).toBe(0)
  })

  test('does not report function describeItem()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('describeItem'))
    expect(reports.length).toBe(0)
  })

  test('does not report function testHelper()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('testHelper'))
    expect(reports.length).toBe(0)
  })

  test('reports VariableDeclarator "it" in .tsx file', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('it'))
    expect(reports.length).toBe(1)
  })

  test('reports VariableDeclarator "expect" in nested test file', () => {
    const { context, reports } = createMockContext({}, '/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('expect'))
    expect(reports.length).toBe(1)
  })

  test('reports FunctionDeclaration "beforeEach" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('beforeEach'))
    expect(reports[0].message).toContain('beforeEach')
    expect(reports[0].message).toContain('shadows')
  })

  test('reports FunctionDeclaration "afterEach" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('afterEach'))
    expect(reports[0].message).toContain('afterEach')
  })

  test('reports FunctionDeclaration "jest" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('jest'))
    expect(reports[0].message).toContain('jest')
  })

  test('reports FunctionDeclaration "vi" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('vi'))
    expect(reports[0].message).toContain('vi')
  })

  test('reports VariableDeclarator "xit" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('xit'))
    expect(reports[0].message).toContain('xit')
  })

  test('reports VariableDeclarator "fit" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('fit'))
    expect(reports[0].message).toContain('fit')
  })

  test('reports VariableDeclarator "xdescribe" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('xdescribe'))
    expect(reports[0].message).toContain('xdescribe')
  })

  test('reports VariableDeclarator "fdescribe" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('fdescribe'))
    expect(reports[0].message).toContain('fdescribe')
  })

  test('reports VariableDeclarator "xtest" with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('xtest'))
    expect(reports[0].message).toContain('xtest')
  })

  test('handles VariableDeclarator with number node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(42 as any)
    expect(reports.length).toBe(0)
  })

  test('handles FunctionDeclaration with string node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!('function test() {}' as any)
    expect(reports.length).toBe(0)
  })

  test('reports VariableDeclarator "describe" location correctly', () => {
    const loc = { start: { line: 3, column: 6 }, end: { line: 3, column: 25 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('describe', loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports FunctionDeclaration "describe" location correctly', () => {
    const loc = { start: { line: 7, column: 0 }, end: { line: 7, column: 35 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('describe', loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('handles VariableDeclarator with destructured id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ArrayPattern', elements: [] },
    })
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator with object pattern id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ObjectPattern', properties: [] },
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Case sensitivity — only exact matches trigger
  test('does not report VariableDeclarator with name "It" (uppercase)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('It'))
    expect(reports.length).toBe(0)
  })

  test('does not report VariableDeclarator with name "TEST" (uppercase)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('TEST'))
    expect(reports.length).toBe(0)
  })

  test('does not report FunctionDeclaration with name "Describe" (capitalized)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('Describe'))
    expect(reports.length).toBe(0)
  })

  // SECTION: Visitor isolation
  test('separate visitors have separate report accumulators', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.VariableDeclarator!(createVariableDeclarator('it'))
    visitor2.VariableDeclarator!(createVariableDeclarator('data'))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  // SECTION: FunctionDeclaration skip/focus globals
  test('reports FunctionDeclaration "xdescribe"', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.FunctionDeclaration!(createFunctionDeclaration('xdescribe'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('xdescribe')
  })
})
