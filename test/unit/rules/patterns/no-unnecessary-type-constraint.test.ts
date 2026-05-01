import { describe, test, expect } from 'vitest'
import { noUnnecessaryTypeConstraintRule } from '../../../../src/rules/patterns/no-unnecessary-type-constraint.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createTSTypeParameter(
  name: string,
  constraint: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TSTypeParameter',
    name: { type: 'Identifier', name },
    constraint,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createTSAnyKeyword(): unknown {
  return { type: 'TSAnyKeyword' }
}

function createTSObjectKeyword(): unknown {
  return { type: 'TSObjectKeyword' }
}

function createEmptyTSTypeLiteral(): unknown {
  return { type: 'TSTypeLiteral', members: [] }
}

function createNonEmptyTSTypeLiteral(): unknown {
  return { type: 'TSTypeLiteral', members: [{ type: 'TSPropertySignature' }] }
}

function createTSArrayOfAny(): unknown {
  return { type: 'TSArrayType', elementType: { type: 'TSAnyKeyword' } }
}

function createTSArrayOfStrings(): unknown {
  return { type: 'TSArrayType', elementType: { type: 'TSStringKeyword' } }
}

function createRecordStringAny(): unknown {
  return {
    type: 'TSTypeReference',
    typeName: { type: 'Identifier', name: 'Record' },
    typeArguments: {
      type: 'TSTypeParameterInstantiation',
      params: [{ type: 'TSStringKeyword' }, { type: 'TSAnyKeyword' }],
    },
  }
}

function createRecordStringNumber(): unknown {
  return {
    type: 'TSTypeReference',
    typeName: { type: 'Identifier', name: 'Record' },
    typeArguments: {
      type: 'TSTypeParameterInstantiation',
      params: [{ type: 'TSStringKeyword' }, { type: 'TSNumberKeyword' }],
    },
  }
}

function createTSStringKeyword(): unknown {
  return { type: 'TSStringKeyword' }
}

function createTSNumberKeyword(): unknown {
  return { type: 'TSNumberKeyword' }
}

function createCustomTypeReference(typeName: string): unknown {
  return {
    type: 'TSTypeReference',
    typeName: { type: 'Identifier', name: typeName },
  }
}

function createNoConstraintTypeParameter(name: string): unknown {
  return {
    type: 'TSTypeParameter',
    name: { type: 'Identifier', name },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noUnnecessaryTypeConstraintRule.create(context as RuleContext)
  if (visitor.TSTypeParameter) {
    visitor.TSTypeParameter(node)
  }
  return reports
}

describe('no-unnecessary-type-constraint', () => {
  test('has correct rule name in meta', () => {
    expect(noUnnecessaryTypeConstraintRule.meta.docs?.category).toBe('patterns')
  })

  test('has description in meta', () => {
    expect(noUnnecessaryTypeConstraintRule.meta.docs?.description).toBeDefined()
  })

  test('is recommended', () => {
    expect(noUnnecessaryTypeConstraintRule.meta.docs?.recommended).toBe(true)
  })

  test('has suggestion type', () => {
    expect(noUnnecessaryTypeConstraintRule.meta.type).toBe('suggestion')
  })

  test('has warn severity', () => {
    expect(noUnnecessaryTypeConstraintRule.meta.severity).toBe('warn')
  })

  test('flags T extends any', () => {
    const node = createTSTypeParameter('T', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'any'")
    expect(reports[0].message).toContain("'T'")
  })

  test('flags T extends object', () => {
    const node = createTSTypeParameter('T', createTSObjectKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'object'")
  })

  test('flags T extends {}', () => {
    const node = createTSTypeParameter('T', createEmptyTSTypeLiteral())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'{}'")
  })

  test('flags T extends any[]', () => {
    const node = createTSTypeParameter('T', createTSArrayOfAny())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'any[]'")
  })

  test('flags T extends Record<string, any>', () => {
    const node = createTSTypeParameter('T', createRecordStringAny())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Record<string, any>'")
  })

  test('does NOT flag T extends string', () => {
    const node = createTSTypeParameter('T', createTSStringKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends number', () => {
    const node = createTSTypeParameter('T', createTSNumberKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends HTMLElement', () => {
    const node = createTSTypeParameter('T', createCustomTypeReference('HTMLElement'))
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends { name: string }', () => {
    const node = createTSTypeParameter('T', createNonEmptyTSTypeLiteral())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends string[]', () => {
    const node = createTSTypeParameter('T', createTSArrayOfStrings())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends Record<string, number>', () => {
    const node = createTSTypeParameter('T', createRecordStringNumber())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T with no constraint', () => {
    const node = createNoConstraintTypeParameter('T')
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag non-TSTypeParameter nodes', () => {
    const node = { type: 'Identifier', name: 'foo' }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
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

  test('does NOT flag T extends Array<string>', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Array' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSStringKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('uses correct type parameter name in message', () => {
    const node = createTSTypeParameter('K', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports[0].message).toContain("'K'")
  })

  test('uses T as default name when name is missing', () => {
    const node = {
      type: 'TSTypeParameter',
      constraint: { type: 'TSAnyKeyword' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'T'")
  })

  test('message contains explanation', () => {
    const node = createTSTypeParameter('T', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports[0].message).toContain('does not restrict the type')
  })

  test('reports location', () => {
    const node = createTSTypeParameter('T', createTSAnyKeyword(), 5, 10)
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
  })

  test('flags U extends any', () => {
    const node = createTSTypeParameter('U', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'U'")
  })

  test('flags TKey extends object', () => {
    const node = createTSTypeParameter('TKey', createTSObjectKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'TKey'")
  })

  test('does NOT flag T extends boolean', () => {
    const node = createTSTypeParameter('T', { type: 'TSBooleanKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends void', () => {
    const node = createTSTypeParameter('T', { type: 'TSVoidKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends never', () => {
    const node = createTSTypeParameter('T', { type: 'TSNeverKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends unknown', () => {
    const node = createTSTypeParameter('T', { type: 'TSUnknownKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends null', () => {
    const node = createTSTypeParameter('T', { type: 'TSNullKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends undefined', () => {
    const node = createTSTypeParameter('T', { type: 'TSUndefinedKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags T extends any with null constraint', () => {
    const node = {
      type: 'TSTypeParameter',
      name: { type: 'Identifier', name: 'T' },
      constraint: null,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags constraint with boolean constraint', () => {
    const node = {
      type: 'TSTypeParameter',
      name: { type: 'Identifier', name: 'T' },
      constraint: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeLiteral with non-array members', () => {
    const constraint = { type: 'TSTypeLiteral', members: 'not-array' }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeReference with non-Identifier typeName', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'TSQualifiedName' },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeReference without typeArguments', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Record' },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeReference with wrong param count', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Record' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSStringKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeReference with non-string first param', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Record' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSNumberKeyword' }, { type: 'TSAnyKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags T extends Record with TSStringKeyword first param', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Record' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSStringKeyword' }, { type: 'TSAnyKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag T extends Map<string, number>', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Map' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSStringKeyword' }, { type: 'TSNumberKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends Promise<string>', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Promise' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSStringKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends Array<any>', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Array' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSAnyKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('getConstraintText returns object for TSObjectKeyword', () => {
    const node = createTSTypeParameter('T', createTSObjectKeyword())
    const reports = runRule(node)
    expect(reports[0].message).toContain("'object'")
  })

  test('getConstraintText returns {} for empty TSTypeLiteral', () => {
    const node = createTSTypeParameter('T', createEmptyTSTypeLiteral())
    const reports = runRule(node)
    expect(reports[0].message).toContain("'{}'")
  })

  test('getConstraintText returns any[] for TSArrayOfAny', () => {
    const node = createTSTypeParameter('T', createTSArrayOfAny())
    const reports = runRule(node)
    expect(reports[0].message).toContain("'any[]'")
  })

  test('getConstraintText returns unknown for unknown type', () => {
    const node = createTSTypeParameter('T', { type: 'SomethingWeird' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeParameter with constraint of type string', () => {
    const node = {
      type: 'TSTypeParameter',
      name: { type: 'Identifier', name: 'T' },
      constraint: 'not-an-object',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends HTMLElement with nested properties', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: {
        type: 'TSQualifiedName',
        left: { type: 'Identifier', name: 'HTML' },
        right: { type: 'Identifier', name: 'Element' },
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends { x: number; y: number }', () => {
    const constraint = {
      type: 'TSTypeLiteral',
      members: [
        { type: 'TSPropertySignature' },
        { type: 'TSPropertySignature' },
      ],
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags T extends {} with empty members array', () => {
    const constraint = { type: 'TSTypeLiteral', members: [] }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('visitor has TSTypeParameter method', () => {
    const { context } = createMockRuleContext()
    const visitor = noUnnecessaryTypeConstraintRule.create(context as RuleContext)
    expect(typeof visitor.TSTypeParameter).toBe('function')
  })

  test('does NOT flag TSArrayType with non-any element type', () => {
    const constraint = { type: 'TSArrayType', elementType: { type: 'TSNumberKeyword' } }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSArrayType without elementType', () => {
    const constraint = { type: 'TSArrayType' }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag TSTypeReference with non-Record name', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Partial' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSAnyKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('handles node without loc', () => {
    const node = {
      type: 'TSTypeParameter',
      name: { type: 'Identifier', name: 'T' },
      constraint: { type: 'TSAnyKeyword' },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('handles node with undefined constraint', () => {
    const node = {
      type: 'TSTypeParameter',
      name: { type: 'Identifier', name: 'T' },
      constraint: undefined,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags type alias type parameter extends any', () => {
    const node = createTSTypeParameter('T', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('any')
    expect(reports[0].message).toContain('does not restrict the type')
  })

  test('flags generic function type parameter extends object', () => {
    const node = createTSTypeParameter('T', createTSObjectKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('object')
  })

  test('flags generic class type parameter extends {}', () => {
    const node = createTSTypeParameter('T', createEmptyTSTypeLiteral())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('{}')
  })

  test('flags generic interface type parameter extends any[]', () => {
    const node = createTSTypeParameter('T', createTSArrayOfAny())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('any[]')
  })

  test('flags generic type alias type parameter extends Record<string, any>', () => {
    const node = createTSTypeParameter('T', createRecordStringAny())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('Record<string, any>')
  })

  test('does NOT flag type parameter with string constraint in type alias', () => {
    const node = createTSTypeParameter('T', createTSStringKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type parameter with number constraint in function', () => {
    const node = createTSTypeParameter('T', createTSNumberKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type parameter with custom interface constraint', () => {
    const node = createTSTypeParameter('T', createCustomTypeReference('IEntity'))
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type parameter with union type constraint', () => {
    const constraint = {
      type: 'TSUnionType',
      types: [{ type: 'TSStringKeyword' }, { type: 'TSNumberKeyword' }],
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type parameter with intersection type constraint', () => {
    const constraint = {
      type: 'TSIntersectionType',
      types: [{ type: 'TSStringKeyword' }, { type: 'TSObjectKeyword' }],
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags arrow function type parameter extends any', () => {
    const node = createTSTypeParameter('T', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'T'")
    expect(reports[0].message).toContain("'any'")
  })

  test('flags method type parameter extends object', () => {
    const node = createTSTypeParameter('U', createTSObjectKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'U'")
    expect(reports[0].message).toContain("'object'")
  })

  test('does NOT flag Record<string, number> constraint', () => {
    const node = createTSTypeParameter('T', createRecordStringNumber())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag Record<number, any> constraint', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Record' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSNumberKeyword' }, { type: 'TSAnyKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type parameter extends string[]', () => {
    const node = createTSTypeParameter('T', createTSArrayOfStrings())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type parameter extends unknown', () => {
    const node = createTSTypeParameter('T', { type: 'TSUnknownKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('handles multiple type parameters first flagged second not', () => {
    const nodeA = createTSTypeParameter('T', createTSAnyKeyword())
    const reportsA = runRule(nodeA)
    expect(reportsA).toHaveLength(1)

    const nodeB = createTSTypeParameter('U', createTSStringKeyword())
    const reportsB = runRule(nodeB)
    expect(reportsB).toHaveLength(0)
  })

  test('handles multiple type parameters both flagged', () => {
    const nodeA = createTSTypeParameter('T', createTSAnyKeyword())
    const reportsA = runRule(nodeA)
    expect(reportsA).toHaveLength(1)

    const nodeB = createTSTypeParameter('U', createTSObjectKeyword())
    const reportsB = runRule(nodeB)
    expect(reportsB).toHaveLength(1)
  })

  test('flags nested generic type parameter extends any', () => {
    const node = createTSTypeParameter('T', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag nested generic type parameter extends string', () => {
    const node = createTSTypeParameter('T', createTSStringKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags type parameter at different source location line 10', () => {
    const node = createTSTypeParameter('T', createTSAnyKeyword(), 10, 5)
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
  })

  test('flags type parameter at different source location line 100', () => {
    const node = createTSTypeParameter('T', createEmptyTSTypeLiteral(), 100, 0)
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag when constraint is missing entirely', () => {
    const node = createNoConstraintTypeParameter('T')
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag when node is an empty object', () => {
    const reports = runRule({})
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag when constraint property is 0', () => {
    const node = {
      type: 'TSTypeParameter',
      name: { type: 'Identifier', name: 'T' },
      constraint: 0,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag when constraint property is empty string', () => {
    const node = {
      type: 'TSTypeParameter',
      name: { type: 'Identifier', name: 'T' },
      constraint: '',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags V extends any with correct param name', () => {
    const node = createTSTypeParameter('V', createTSAnyKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'V'")
  })

  test('flags TEntity extends object with correct param name', () => {
    const node = createTSTypeParameter('TEntity', createTSObjectKeyword())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'TEntity'")
  })

  test('flags TValue extends {} with correct param name', () => {
    const node = createTSTypeParameter('TValue', createEmptyTSTypeLiteral())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'TValue'")
  })

  test('flags TItem extends any[] with correct param name', () => {
    const node = createTSTypeParameter('TItem', createTSArrayOfAny())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'TItem'")
  })

  test('flags TData extends Record<string, any> with correct param name', () => {
    const node = createTSTypeParameter('TData', createRecordStringAny())
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'TData'")
  })

  test('does NOT flag type parameter with symbol constraint', () => {
    const node = createTSTypeParameter('T', { type: 'TSSymbolKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type parameter with bigint constraint', () => {
    const node = createTSTypeParameter('T', { type: 'TSBigIntKeyword' })
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends ReadonlyArray<string>', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'ReadonlyArray' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSStringKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag T extends Set<string>', () => {
    const constraint = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: 'Set' },
      typeArguments: {
        type: 'TSTypeParameterInstantiation',
        params: [{ type: 'TSStringKeyword' }],
      },
    }
    const node = createTSTypeParameter('T', constraint)
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })
})
