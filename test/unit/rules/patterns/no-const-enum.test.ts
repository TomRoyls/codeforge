import { describe, test, expect } from 'vitest'
import { noConstEnumRule } from '../../../../src/rules/patterns/no-const-enum.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createConstEnum(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSEnumDeclaration',
    id: { type: 'Identifier', name },
    modifiers: [{ type: 'TSConstKeyword' }],
    members: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createRegularEnum(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSEnumDeclaration',
    id: { type: 'Identifier', name },
    members: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createEnumWithOtherModifiers(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSEnumDeclaration',
    id: { type: 'Identifier', name },
    modifiers: [{ type: 'TSExportKeyword' }],
    members: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createConstExportEnum(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSEnumDeclaration',
    id: { type: 'Identifier', name },
    modifiers: [{ type: 'TSExportKeyword' }, { type: 'TSConstKeyword' }],
    members: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noConstEnumRule.create(context as RuleContext)
  if (visitor.TSEnumDeclaration) {
    visitor.TSEnumDeclaration(node)
  }
  return reports
}

describe('no-const-enum', () => {
  test('has correct category', () => {
    expect(noConstEnumRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noConstEnumRule.meta.docs?.description).toBeDefined()
  })

  test('is recommended', () => {
    expect(noConstEnumRule.meta.docs?.recommended).toBe(true)
  })

  test('has suggestion type', () => {
    expect(noConstEnumRule.meta.type).toBe('suggestion')
  })

  test('has warn severity', () => {
    expect(noConstEnumRule.meta.severity).toBe('warn')
  })

  test('flags const enum', () => {
    const reports = runRule(createConstEnum('Direction'))
    expect(reports).toHaveLength(1)
  })

  test('includes enum name in message', () => {
    const reports = runRule(createConstEnum('Color'))
    expect(reports[0].message).toContain("'Color'")
  })

  test('includes explanation in message', () => {
    const reports = runRule(createConstEnum('Status'))
    expect(reports[0].message).toContain('cross-file')
  })

  test('does NOT flag regular enum', () => {
    const reports = runRule(createRegularEnum('Direction'))
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag enum with export modifier only', () => {
    const reports = runRule(createEnumWithOtherModifiers('Status'))
    expect(reports).toHaveLength(0)
  })

  test('flags const export enum', () => {
    const reports = runRule(createConstExportEnum('Mode'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Mode'")
  })

  test('reports location', () => {
    const reports = runRule(createConstEnum('Direction', 5, 10))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
  })

  test('does NOT flag null node', () => {
    const reports = runRule(null)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag undefined node', () => {
    const reports = runRule(undefined)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag string node', () => {
    const reports = runRule('not a node')
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag number node', () => {
    const reports = runRule(42)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag node without modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag node with empty modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag non-TSEnumDeclaration nodes', () => {
    const node = {
      type: 'TSInterfaceDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [{ type: 'TSConstKeyword' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag node with string modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: 'not-array',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('handles enum without id', () => {
    const node = {
      type: 'TSEnumDeclaration',
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'enum'")
  })

  test('handles enum with non-object id', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: 'not-an-object',
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'enum'")
  })

  test('flags multiple const enums independently', () => {
    const reports1 = runRule(createConstEnum('A'))
    const reports2 = runRule(createConstEnum('B'))
    expect(reports1).toHaveLength(1)
    expect(reports2).toHaveLength(1)
    expect(reports1[0].message).toContain("'A'")
    expect(reports2[0].message).toContain("'B'")
  })

  test('visitor has TSEnumDeclaration method', () => {
    const { context } = createMockRuleContext()
    const visitor = noConstEnumRule.create(context as RuleContext)
    expect(typeof visitor.TSEnumDeclaration).toBe('function')
  })

  test('does NOT flag node with only declare modifier', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [{ type: 'TSDeclareKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags const enum with members', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Status' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'Active' } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'Inactive' } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Status'")
  })

  test('handles enum with null modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: null,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('handles enum with undefined modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: undefined,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does not flag modifier that is not TSConstKeyword', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [{ type: 'TSAbstractKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags when const keyword is mixed with other modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Flags' },
      modifiers: [{ type: 'TSDeclareKeyword' }, { type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })
})
