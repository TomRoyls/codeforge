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

  test('flags const enum with single numeric member', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Code' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'OK' }, initializer: { type: 'Literal', value: 200 } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Code'")
  })

  test('flags const enum with string-valued member', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Label' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'Name' }, initializer: { type: 'Literal', value: 'hello' } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with many members', () => {
    const members = Array.from({ length: 10 }, (_, i) => ({
      type: 'TSEnumMember',
      id: { type: 'Identifier', name: `M${i}` },
    }))
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'BigEnum' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members,
      loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with mixed value types', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Mixed' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' }, initializer: { type: 'Literal', value: 1 } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: { type: 'Literal', value: 'two' } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'C' } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum at line 10 column 5', () => {
    const reports = runRule(createConstEnum('Deep', 10, 5))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.start.column).toBe(5)
  })

  test('flags const enum at line 1 column 0', () => {
    const reports = runRule(createConstEnum('Top', 1, 0))
    expect(reports).toHaveLength(1)
  })

  test('flags const enum at line 100 column 50', () => {
    const reports = runRule(createConstEnum('Far', 100, 50))
    expect(reports).toHaveLength(1)
  })

  test('flags export const enum with correct message', () => {
    const reports = runRule(createConstExportEnum('Exported'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Exported'")
  })

  test('flags const enum with export keyword first', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'ExpFirst' },
      modifiers: [{ type: 'TSExportKeyword' }, { type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 32 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with const keyword first', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'ConstFirst' },
      modifiers: [{ type: 'TSConstKeyword' }, { type: 'TSExportKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with declare and export modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'DeclExp' },
      modifiers: [{ type: 'TSDeclareKeyword' }, { type: 'TSExportKeyword' }, { type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag declare-only enum', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Ambient' },
      modifiers: [{ type: 'TSDeclareKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag declare + export enum without const', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'DeclExport' },
      modifiers: [{ type: 'TSDeclareKeyword' }, { type: 'TSExportKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags const enum with underscore-prefixed name', () => {
    const reports = runRule(createConstEnum('_Internal'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'_Internal'")
  })

  test('flags const enum with dollar sign name', () => {
    const reports = runRule(createConstEnum('$Special'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'$Special'")
  })

  test('flags const enum with single character name', () => {
    const reports = runRule(createConstEnum('X'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'X'")
  })

  test('flags const enum with long descriptive name', () => {
    const name = 'VeryLongDescriptiveEnumNameForTesting'
    const reports = runRule(createConstEnum(name))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain(`'${name}'`)
  })

  test('report message contains isolatedModules', () => {
    const reports = runRule(createConstEnum('Check'))
    expect(reports[0].message).toContain('isolatedModules')
  })

  test('report message contains runtime errors', () => {
    const reports = runRule(createConstEnum('Check'))
    expect(reports[0].message).toContain('runtime')
  })

  test('report message starts with Unexpected', () => {
    const reports = runRule(createConstEnum('Msg'))
    expect(reports[0].message).toMatch(/^Unexpected/)
  })

  test('report message contains Unexpected const enum', () => {
    const reports = runRule(createConstEnum('Fmt'))
    expect(reports[0].message).toContain('Unexpected const enum')
  })

  test('report message mentions package boundaries', () => {
    const reports = runRule(createConstEnum('Bnd'))
    expect(reports[0].message).toContain('package boundaries')
  })

  test('flags const enum with members having computed-like initializers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Computed' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' }, initializer: { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag regular enum with members', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Normal' },
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag regular enum with initializers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Init' },
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' }, initializer: { type: 'Literal', value: 1 } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: { type: 'Literal', value: 'x' } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags three const enums independently', () => {
    const r1 = runRule(createConstEnum('One'))
    const r2 = runRule(createConstEnum('Two'))
    const r3 = runRule(createConstEnum('Three'))
    expect(r1).toHaveLength(1)
    expect(r2).toHaveLength(1)
    expect(r3).toHaveLength(1)
    expect(r1[0].message).toContain("'One'")
    expect(r2[0].message).toContain("'Two'")
    expect(r3[0].message).toContain("'Three'")
  })

  test('does NOT flag boolean node', () => {
    const reports = runRule(true)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag array node', () => {
    const reports = runRule([1, 2, 3])
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag plain object without type', () => {
    const reports = runRule({ name: 'no-type' })
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag node with wrong type casing', () => {
    const node = {
      type: 'tsenumdeclaration',
      id: { type: 'Identifier', name: 'Wrong' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag node with modifiers containing non-objects', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: ['TSConstKeyword', 42, null],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('handles node with extra properties', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Extra' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      range: [0, 20],
      extra: true,
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag when modifiers array contains only null entries', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [null, null],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags const enum when TSConstKeyword is last modifier', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'LastMod' },
      modifiers: [{ type: 'TSExportKeyword' }, { type: 'TSDeclareKeyword' }, { type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum when TSConstKeyword is first modifier', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'FirstMod' },
      modifiers: [{ type: 'TSConstKeyword' }, { type: 'TSDeclareKeyword' }, { type: 'TSExportKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum when TSConstKeyword is middle modifier', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'MidMod' },
      modifiers: [{ type: 'TSExportKeyword' }, { type: 'TSConstKeyword' }, { type: 'TSDeclareKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('meta has url', () => {
    expect(noConstEnumRule.meta.docs?.url).toBeDefined()
  })

  test('meta url contains no-const-enum', () => {
    expect(noConstEnumRule.meta.docs?.url).toContain('no-const-enum')
  })

  test('meta fixable is undefined', () => {
    expect(noConstEnumRule.meta.fixable).toBeUndefined()
  })

  test('meta schema is empty array', () => {
    expect(noConstEnumRule.meta.schema).toEqual([])
  })

  test('flags const enum with string enum name containing spaces-like pattern', () => {
    const reports = runRule(createConstEnum('HTTPRequest'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'HTTPRequest'")
  })

  test('flags const enum with PascalCase name', () => {
    const reports = runRule(createConstEnum('MyAwesomeEnum'))
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with SCREAMING_SNAKE_CASE name', () => {
    const reports = runRule(createConstEnum('MY_CONST_ENUM'))
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with camelCase name', () => {
    const reports = runRule(createConstEnum('myConstEnum'))
    expect(reports).toHaveLength(1)
  })

  test('report descriptor has loc property', () => {
    const reports = runRule(createConstEnum('LocTest', 7, 12))
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc?.start.line).toBe(7)
    expect(reports[0].loc?.start.column).toBe(12)
  })

  test('flags const enum with location at column 0', () => {
    const reports = runRule(createConstEnum('Zero', 1, 0))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('flags const enum with multi-line location', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Multi' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.end.line).toBe(4)
  })

  test('does NOT flag when modifier type is slightly wrong', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [{ type: 'ConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag when modifier type is TSConst', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [{ type: 'TSConst' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeAliasDeclaration with const-like modifier', () => {
    const node = {
      type: 'TSTypeAliasDeclaration',
      id: { type: 'Identifier', name: 'MyType' },
      modifiers: [{ type: 'TSConstKeyword' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSModuleDeclaration', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'MyModule' },
      modifiers: [{ type: 'TSConstKeyword' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags const enum with id that has no name property', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'enum'")
  })

  test('flags const enum with numeric id name', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: '123Enum' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'123Enum'")
  })

  test('does NOT flag node with number modifiers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      modifiers: [1, 2, 3],
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags const enum and verifies full message format', () => {
    const reports = runRule(createConstEnum('Full'))
    const msg = reports[0].message
    expect(msg).toBe("Unexpected const enum 'Full'. Const enums have cross-file compatibility issues with isolatedModules and may cause runtime errors when used across package boundaries.")
  })

  test('flags const enum and verifies no fix is provided', () => {
    const reports = runRule(createConstEnum('NoFix'))
    expect(reports[0].fix).toBeUndefined()
  })

  test('does NOT flag empty object', () => {
    const reports = runRule({})
    expect(reports).toHaveLength(0)
  })

  test('flags const enum created with helper at default position', () => {
    const reports = runRule(createConstEnum('Default'))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('does NOT flag regular enum created with helper at any position', () => {
    const reports = runRule(createRegularEnum('AnyPos', 42, 17))
    expect(reports).toHaveLength(0)
  })

  test('flags const export enum created with helper', () => {
    const reports = runRule(createConstExportEnum('Helper'))
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag enum with other modifiers created with helper', () => {
    const reports = runRule(createEnumWithOtherModifiers('Other'))
    expect(reports).toHaveLength(0)
  })

  test('flags const enum with all members having initializers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'AllInit' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'A' }, initializer: { type: 'Literal', value: 0 } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'B' }, initializer: { type: 'Literal', value: 1 } },
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'C' }, initializer: { type: 'Literal', value: 2 } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with members having negative initializers', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Neg' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'Identifier', name: 'Val' }, initializer: { type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 1 } } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum with string member names', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'StrKeys' },
      modifiers: [{ type: 'TSConstKeyword' }],
      members: [
        { type: 'TSEnumMember', id: { type: 'StringLiteral', value: 'key-a' } },
        { type: 'TSEnumMember', id: { type: 'StringLiteral', value: 'key-b' } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags const enum and report descriptor has no severity', () => {
    const reports = runRule(createConstEnum('Sev'))
    expect(reports[0].severity).toBeUndefined()
  })
})
