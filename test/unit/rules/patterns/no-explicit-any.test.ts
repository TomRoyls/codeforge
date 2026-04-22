import { describe, test, expect, vi } from 'vitest'
import { noExplicitAnyRule } from '../../../../src/rules/patterns/no-explicit-any.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createAnyKeywordNode(line = 1, column = 0): unknown {
  return {
    type: 'TSAnyKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 3 },
    },
  }
}

function createAnyKeywordNodeWithRange(
  line = 1,
  column = 0,
  rangeStart = 0,
  rangeEnd = 3,
): unknown {
  return {
    type: 'TSAnyKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 3 },
    },
    range: [rangeStart, rangeEnd] as [number, number],
  }
}

function createArrayTypeWithAny(line = 1, column = 0): unknown {
  return {
    type: 'TSArrayType',
    elementType: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createArrayTypeWithAnyAndRange(
  line = 1,
  column = 0,
  rangeStart = 0,
  rangeEnd = 5,
): unknown {
  return {
    type: 'TSArrayType',
    elementType: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
    range: [rangeStart, rangeEnd] as [number, number],
  }
}

function createAsExpressionWithAny(line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    typeAnnotation: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createTypeAssertionWithAny(line = 1, column = 0): unknown {
  return {
    type: 'TSTypeAssertion',
    typeAnnotation: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createStringTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSStringKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

function createNumberTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSNumberKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

function createBooleanTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSBooleanKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 7 },
    },
  }
}

function createVoidTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSVoidKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 4 },
    },
  }
}

function createNeverTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSNeverKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createNullTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSNullKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 4 },
    },
  }
}

function createUndefinedTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'TSUndefinedKeyword',
    loc: {
      start: { line, column },
      end: { line, column: column + 9 },
    },
  }
}

function createArrayTypeWithString(line = 1, column = 0): unknown {
  return {
    type: 'TSArrayType',
    elementType: {
      type: 'TSStringKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 9 },
    },
  }
}

function createArrayTypeWithNumber(line = 1, column = 0): unknown {
  return {
    type: 'TSArrayType',
    elementType: {
      type: 'TSNumberKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 9 },
    },
  }
}

function createAsExpressionWithString(line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    typeAnnotation: {
      type: 'TSStringKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 13 },
    },
  }
}

function createAsExpressionWithNumber(line = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    typeAnnotation: {
      type: 'TSNumberKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 13 },
    },
  }
}

function createTypeAssertionWithString(line = 1, column = 0): unknown {
  return {
    type: 'TSTypeAssertion',
    typeAnnotation: {
      type: 'TSStringKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 13 },
    },
  }
}

function createTypeAssertionWithNumber(line = 1, column = 0): unknown {
  return {
    type: 'TSTypeAssertion',
    typeAnnotation: {
      type: 'TSNumberKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 13 },
    },
  }
}

function createArrayTypeNode(line = 1, column = 0): unknown {
  return {
    type: 'ArrayType',
    elementType: {
      type: 'TSAnyKeyword',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

describe('no-explicit-any rule', () => {
  // ===== META TESTS (7 existing) =====
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noExplicitAnyRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noExplicitAnyRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noExplicitAnyRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noExplicitAnyRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noExplicitAnyRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noExplicitAnyRule.meta.fixable).toBe('code')
    })

    test('should mention any in description', () => {
      expect(noExplicitAnyRule.meta.docs?.description.toLowerCase()).toContain('any')
    })
  })

  // ===== META EXTENDED TESTS =====
  describe('meta - extended', () => {
    test('should have meta property', () => {
      expect(noExplicitAnyRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noExplicitAnyRule).toHaveProperty('create')
    })

    test('should have meta type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noExplicitAnyRule.meta.type)
    })

    test('should have meta severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noExplicitAnyRule.meta.severity)
    })

    test('should have docs property', () => {
      expect(noExplicitAnyRule.meta.docs).toBeDefined()
    })

    test('should have docs description', () => {
      expect(noExplicitAnyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have non-empty description', () => {
      expect(noExplicitAnyRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention TypeScript in description', () => {
      expect(noExplicitAnyRule.meta.docs?.description.toLowerCase()).toContain('typescript')
    })

    test('should mention type safety in description', () => {
      expect(noExplicitAnyRule.meta.docs?.description.toLowerCase()).toContain('type safety')
    })

    test('should have docs url', () => {
      expect(noExplicitAnyRule.meta.docs?.url).toBeDefined()
    })

    test('should have a valid docs url', () => {
      expect(noExplicitAnyRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('should reference no-explicit-any in docs url', () => {
      expect(noExplicitAnyRule.meta.docs?.url).toContain('no-explicit-any')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noExplicitAnyRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one item', () => {
      const schema = noExplicitAnyRule.meta.schema as unknown[]
      expect(schema.length).toBeGreaterThanOrEqual(1)
    })

    test('should have schema with allowInGenericArrays property', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      const props = first.properties as Record<string, unknown>
      expect(props).toHaveProperty('allowInGenericArrays')
    })

    test('should have schema with allowAsTypeAssertion property', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      const props = first.properties as Record<string, unknown>
      expect(props).toHaveProperty('allowAsTypeAssertion')
    })

    test('should have allowInGenericArrays default false', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      const props = first.properties as Record<string, Record<string, unknown>>
      expect(props.allowInGenericArrays.default).toBe(false)
    })

    test('should have allowAsTypeAssertion default false', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      const props = first.properties as Record<string, Record<string, unknown>>
      expect(props.allowAsTypeAssertion.default).toBe(false)
    })

    test('should have allowInGenericArrays as boolean type in schema', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      const props = first.properties as Record<string, Record<string, unknown>>
      expect(props.allowInGenericArrays.type).toBe('boolean')
    })

    test('should have allowAsTypeAssertion as boolean type in schema', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      const props = first.properties as Record<string, Record<string, unknown>>
      expect(props.allowAsTypeAssertion.type).toBe('boolean')
    })

    test('should have additionalProperties false in schema', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      expect(first.additionalProperties).toBe(false)
    })

    test('should have schema object type', () => {
      const schema = noExplicitAnyRule.meta.schema as Record<string, unknown>[]
      const first = schema[0] as Record<string, unknown>
      expect(first.type).toBe('object')
    })

    test('should be fixable as code', () => {
      expect(noExplicitAnyRule.meta.fixable).toBe('code')
    })

    test('create should be a function', () => {
      expect(typeof noExplicitAnyRule.create).toBe('function')
    })

    test('should not be deprecated', () => {
      expect(noExplicitAnyRule.meta.deprecated).toBeFalsy()
    })
  })

  // ===== CREATE / VISITOR TESTS =====
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(visitor).toHaveProperty('TSAnyKeyword')
      expect(visitor).toHaveProperty('TSArrayType')
      expect(visitor).toHaveProperty('TSAsExpression')
      expect(visitor).toHaveProperty('TSTypeAssertion')
    })

    test('should return TSAnyKeyword as a function', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)
      expect(typeof visitor.TSAnyKeyword).toBe('function')
    })

    test('should return TSArrayType as a function', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)
      expect(typeof visitor.TSArrayType).toBe('function')
    })

    test('should return TSAsExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)
      expect(typeof visitor.TSAsExpression).toBe('function')
    })

    test('should return TSTypeAssertion as a function', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)
      expect(typeof visitor.TSTypeAssertion).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor1 = noExplicitAnyRule.create(context)
      const visitor2 = noExplicitAnyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should return exactly 4 visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(4)
    })

    test('should not return undefined visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)
      expect(visitor.TSAnyKeyword).toBeDefined()
      expect(visitor.TSArrayType).toBeDefined()
      expect(visitor.TSAsExpression).toBeDefined()
      expect(visitor.TSTypeAssertion).toBeDefined()
    })
  })

  // ===== DETECTING ANY USAGE (5 existing) =====
  describe('detecting any usage', () => {
    test('should report TSAnyKeyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should report array with any element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should report as expression with any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should report type assertion with any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should not report non-any types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createStringTypeNode())

      expect(reports.length).toBe(0)
    })
  })

  // ===== DETECTING ANY - EXTENDED =====
  describe('detecting any usage - extended', () => {
    test('should not report number type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createNumberTypeNode())

      expect(reports.length).toBe(0)
    })

    test('should not report boolean type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createBooleanTypeNode())

      expect(reports.length).toBe(0)
    })

    test('should not report void type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createVoidTypeNode())

      expect(reports.length).toBe(0)
    })

    test('should not report never type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createNeverTypeNode())

      expect(reports.length).toBe(0)
    })

    test('should not report null type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createNullTypeNode())

      expect(reports.length).toBe(0)
    })

    test('should not report undefined type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createUndefinedTypeNode())

      expect(reports.length).toBe(0)
    })

    test('should report ArrayType (non-TS) with any element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeNode())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('any')
    })

    test('should not report TSArrayType with string element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithString())

      expect(reports.length).toBe(0)
    })

    test('should not report TSArrayType with number element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithNumber())

      expect(reports.length).toBe(0)
    })

    test('should not report TSAsExpression with string type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithString())

      expect(reports.length).toBe(0)
    })

    test('should not report TSAsExpression with number type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithNumber())

      expect(reports.length).toBe(0)
    })

    test('should not report TSTypeAssertion with string type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithString())

      expect(reports.length).toBe(0)
    })

    test('should not report TSTypeAssertion with number type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithNumber())

      expect(reports.length).toBe(0)
    })

    test('should report exactly one violation for a single any keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should report multiple violations for multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSAnyKeyword(createAnyKeywordNode(5, 10))

      expect(reports.length).toBe(2)
    })

    test('should report violation from each visitor method for any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(4)
    })

    test('should report only once for TSAnyKeyword even if called twice with same node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)
      const node = createAnyKeywordNode()

      visitor.TSAnyKeyword(node)
      visitor.TSAnyKeyword(node)

      expect(reports.length).toBe(2)
    })

    test('should handle multiple any keyword detections across different lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      for (let line = 1; line <= 10; line++) {
        visitor.TSAnyKeyword(createAnyKeywordNode(line, 0))
      }

      expect(reports.length).toBe(10)
    })
  })

  // ===== OPTIONS - allowInGenericArrays (2 existing) =====
  describe('options - allowInGenericArrays', () => {
    test('should allow any in arrays when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports.length).toBe(0)
    })

    test('should still report any keyword even when allowInGenericArrays is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should report any in arrays when option is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: false }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports.length).toBe(1)
    })

    test('should report any in arrays when option is not provided', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports.length).toBe(1)
    })

    test('should not affect TSAsExpression when allowInGenericArrays is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(1)
    })

    test('should not affect TSTypeAssertion when allowInGenericArrays is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(1)
    })

    test('should allow ArrayType (non-TS) when allowInGenericArrays is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeNode())

      expect(reports.length).toBe(0)
    })

    test('should still report non-any array elements when allowInGenericArrays is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: false }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithString())

      expect(reports.length).toBe(0)
    })
  })

  // ===== OPTIONS - allowAsTypeAssertion (3 existing) =====
  describe('options - allowAsTypeAssertion', () => {
    test('should allow type assertion to any when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAsTypeAssertion: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(0)
    })

    test('should allow TSTypeAssertion to any when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAsTypeAssertion: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(0)
    })

    test('should still report any keyword even when allowAsTypeAssertion is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAsTypeAssertion: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should report TSAsExpression when option is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAsTypeAssertion: false }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(1)
    })

    test('should report TSTypeAssertion when option is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAsTypeAssertion: false }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(1)
    })

    test('should not affect TSAnyKeyword when allowAsTypeAssertion is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAsTypeAssertion: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should not affect TSArrayType when allowAsTypeAssertion is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAsTypeAssertion: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports.length).toBe(1)
    })

    test('should report when allowAsTypeAssertion is not provided', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(1)
    })

    test('should report when allowAsTypeAssertion is not provided for TSTypeAssertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(1)
    })
  })

  // ===== COMBINED OPTIONS =====
  describe('options - combined', () => {
    test('should suppress both array and assertion reports when both options are true', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowInGenericArrays: true,
        allowAsTypeAssertion: true,
      }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(0)
    })

    test('should still report any keyword when both options are true', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowInGenericArrays: true,
        allowAsTypeAssertion: true,
      }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should report all violations when both options are false', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowInGenericArrays: false,
        allowAsTypeAssertion: false,
      }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(4)
    })

    test('should allow only arrays when only allowInGenericArrays is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowInGenericArrays: true,
        allowAsTypeAssertion: false,
      }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(1)
    })

    test('should allow only assertions when only allowAsTypeAssertion is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowInGenericArrays: false,
        allowAsTypeAssertion: true,
      }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (11 existing) =====
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword('string')).not.toThrow()
      expect(() => visitor.TSAnyKeyword(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x: any = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(createAnyKeywordNode())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle array type without element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSArrayType',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSArrayType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle as expression without type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAsExpression',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES - EXTENDED =====
  describe('edge cases - extended', () => {
    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(true)).not.toThrow()
    })

    test('should handle numeric node 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null prototype', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = Object.create(null)
      node.type = 'TSAnyKeyword'

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle TSAnyKeyword node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
        extra: { someProp: 'value' },
        parent: { type: 'TSTypeReference' },
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle TSTypeAssertion without type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSTypeAssertion',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSTypeAssertion(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSArrayType with null element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSArrayType',
        elementType: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSArrayType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSAsExpression with null type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeAssertion with null type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSTypeAssertion(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSArrayType with non-any element type object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSArrayType',
        elementType: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSArrayType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSAsExpression with non-any type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeAssertion with non-any type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSTypeAssertion',
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSTypeAssertion(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSAnyKeyword node with loc end only', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: {
          end: { line: 1, column: 3 },
        },
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: 'invalid',
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle TSAnyKeyword node with array type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 3 },
        },
      }

      visitor.TSAnyKeyword(node)
      expect(reports.length).toBe(1)
    })

    test('should handle options as undefined', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x: any = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(createAnyKeywordNode())).not.toThrow()
    })

    test('should handle options with undefined first element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x: any = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [undefined] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExplicitAnyRule.create(context)

      expect(() => visitor.TSAnyKeyword(createAnyKeywordNode())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with range property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = createAnyKeywordNodeWithRange(1, 0, 8, 11)

      visitor.TSAnyKeyword(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should handle TSArrayType with undefined element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSArrayType',
        elementType: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSArrayType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSAsExpression with undefined type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAsExpression',
        typeAnnotation: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSAsExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle TSArrayType node passed to TSAnyKeyword handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createArrayTypeWithAny())

      expect(reports.length).toBe(0)
    })

    test('should handle TSAnyKeyword node passed to TSArrayType handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createAnyKeywordNode())

      expect(reports.length).toBe(0)
    })

    test('should handle unknown option values gracefully', () => {
      const { context, reports } = createMockRuleContext({ options: [{ unknownOption: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should handle NaN in location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: {
          start: { line: NaN, column: NaN },
          end: { line: NaN, column: NaN },
        },
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle negative line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(-1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(99999, 99999))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(0, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle node with Symbol properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const sym = Symbol('test')
      const node = {
        type: 'TSAnyKeyword',
        [sym]: 'value',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      expect(() => visitor.TSAnyKeyword(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  // ===== LOCATION TESTS =====
  describe('location tracking', () => {
    test('should report correct start location for any keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct end location for any keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('should report correct location for array type with any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny(5, 2))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(7)
    })

    test('should report correct location for as expression with any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny(7, 4))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('should report correct location for type assertion with any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny(12, 6))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(16)
    })

    test('should report location spanning multiple lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = {
        type: 'TSAnyKeyword',
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 6, column: 2 },
        },
      }

      visitor.TSAnyKeyword(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(6)
      expect(reports[0].loc?.end.column).toBe(2)
    })

    test('should provide default location for node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const node = { type: 'TSAnyKeyword' }

      visitor.TSAnyKeyword(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle multiple reports at different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(1, 0))
      visitor.TSAnyKeyword(createAnyKeywordNode(5, 10))
      visitor.TSAnyKeyword(createAnyKeywordNode(20, 3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(20)
    })
  })

  // ===== FIX / AUTOFIX TESTS =====
  describe('fix capability', () => {
    test('should provide fix for TSAnyKeyword with range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNodeWithRange(1, 0, 8, 11))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('unknown')
    })

    test('should provide fix with correct range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNodeWithRange(1, 0, 5, 8))

      expect(reports[0].fix?.range).toEqual([5, 8])
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].fix).toBeUndefined()
    })

    test('should suggest unknown as replacement', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNodeWithRange(1, 0, 0, 3))

      expect(reports[0].fix?.text).toBe('unknown')
    })

    test('should not provide fix for array type violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAnyAndRange(1, 0, 0, 5))

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for as expression violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for type assertion violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix with text unknown for any keyword with range at different positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNodeWithRange(1, 0, 100, 200))

      expect(reports[0].fix?.range).toEqual([100, 200])
      expect(reports[0].fix?.text).toBe('unknown')
    })

    test('should handle fix for any keyword with range starting at 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNodeWithRange(1, 0, 0, 3))

      expect(reports[0].fix?.range[0]).toBe(0)
    })
  })

  // ===== MESSAGE QUALITY (3 existing) =====
  describe('message quality', () => {
    test('should mention type safety in any keyword message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].message.toLowerCase()).toContain('type')
    })

    test('should mention array type in array message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('should mention type assertion in assertion message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('assertion')
    })
  })

  // ===== MESSAGE QUALITY - EXTENDED =====
  describe('message quality - extended', () => {
    test('should mention unexpected in any keyword message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should contain the word any in all report messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      for (const report of reports) {
        expect(report.message.toLowerCase()).toContain('any')
      }
    })

    test('should mention specific in any keyword message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].message.toLowerCase()).toContain('specific')
    })

    test('should mention unexpected in array message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should mention unexpected in as expression message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should mention unexpected in type assertion message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should mention bypasses in as expression message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('bypasses')
    })

    test('should mention bypasses in type assertion message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('bypasses')
    })

    test('should mention element in array message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports[0].message.toLowerCase()).toContain('element')
    })

    test('should have non-empty messages for all reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      for (const report of reports) {
        expect(report.message.length).toBeGreaterThan(0)
      }
    })

    test('should have descriptive messages longer than 20 characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].message.length).toBeGreaterThan(20)
    })

    test('should mention assertion in TSTypeAssertion message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('assertion')
    })

    test('should mention type safety in as expression message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('type safety')
    })

    test('should mention type safety in type assertion message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports[0].message.toLowerCase()).toContain('type safety')
    })

    test('should have unique messages for array vs keyword violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSArrayType(createArrayTypeWithAny())

      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should have same message for TSAsExpression and TSTypeAssertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== REPORT DESCRIPTOR SHAPE =====
  describe('report descriptor shape', () => {
    test('should include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0]).toHaveProperty('message')
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc with start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc with end property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have loc.start with line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('should have loc.start with column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have loc.end with line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('should have loc.end with column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should have numeric loc.start.line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have numeric loc.start.column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have string message type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(typeof reports[0].message).toBe('string')
    })
  })

  // ===== ISOLATION TESTS =====
  describe('visitor isolation', () => {
    test('should not share state between different create calls', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'const x: any = 1;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor1 = noExplicitAnyRule.create(ctx1)
      const visitor2 = noExplicitAnyRule.create(ctx2)

      visitor1.TSAnyKeyword(createAnyKeywordNode())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should not share reports between different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'const x: any = 1;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor1 = noExplicitAnyRule.create(ctx1)
      const visitor2 = noExplicitAnyRule.create(ctx2)

      visitor1.TSAnyKeyword(createAnyKeywordNode())
      visitor2.TSAnyKeyword(createAnyKeywordNode())
      visitor2.TSAnyKeyword(createAnyKeywordNode(2, 5))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(2)
    })

    test('should track reports independently per context', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ options: [{ allowInGenericArrays: true }], source: 'const x: any = 1;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ options: [{
        allowInGenericArrays: false,
      }], source: 'const x: any = 1;' })
      const visitor1 = noExplicitAnyRule.create(ctx1)
      const visitor2 = noExplicitAnyRule.create(ctx2)

      visitor1.TSArrayType(createArrayTypeWithAny())
      visitor2.TSArrayType(createArrayTypeWithAny())

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })
  })

  // ===== EXPORTS =====
  describe('exports', () => {
    test('should export noExplicitAnyRule as named export', () => {
      expect(noExplicitAnyRule).toBeDefined()
    })

    test('should export an object with meta and create', () => {
      expect(noExplicitAnyRule.meta).toBeDefined()
      expect(noExplicitAnyRule.create).toBeDefined()
    })

    test('should be a valid rule definition object', () => {
      expect(typeof noExplicitAnyRule).toBe('object')
      expect(noExplicitAnyRule).not.toBeNull()
    })
  })

  // ===== INTEGRATION-LIKE TESTS =====
  describe('integration scenarios', () => {
    test('should detect any in a simulated variable declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const variableNode = {
        type: 'TSAnyKeyword',
        loc: { start: { line: 1, column: 8 }, end: { line: 1, column: 11 } },
        parent: { type: 'VariableDeclarator', id: { name: 'x' } },
      }

      visitor.TSAnyKeyword(variableNode)

      expect(reports.length).toBe(1)
    })

    test('should detect any in a simulated function parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const paramNode = {
        type: 'TSAnyKeyword',
        loc: { start: { line: 1, column: 14 }, end: { line: 1, column: 17 } },
        parent: { type: 'TSTypeAnnotation', parent: { type: 'Identifier', name: 'param' } },
      }

      visitor.TSAnyKeyword(paramNode)

      expect(reports.length).toBe(1)
    })

    test('should detect any in a simulated return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const returnNode = {
        type: 'TSAnyKeyword',
        loc: { start: { line: 1, column: 25 }, end: { line: 1, column: 28 } },
        parent: { type: 'TSTypeAnnotation', parent: { type: 'FunctionDeclaration' } },
      }

      visitor.TSAnyKeyword(returnNode)

      expect(reports.length).toBe(1)
    })

    test('should detect any in a simulated generic type argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const genericNode = {
        type: 'TSAnyKeyword',
        loc: { start: { line: 1, column: 12 }, end: { line: 1, column: 15 } },
        parent: { type: 'TSTypeReference', typeName: 'Array' },
      }

      visitor.TSAnyKeyword(genericNode)

      expect(reports.length).toBe(1)
    })

    test('should handle mixed violations and non-violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSAnyKeyword(createStringTypeNode())
      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSArrayType(createArrayTypeWithString())
      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSAsExpression(createAsExpressionWithString())

      expect(reports.length).toBe(3)
    })

    test('should handle rapid successive calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.TSAnyKeyword(createAnyKeywordNode(i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle different source code strings', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x: any) { return x; }', filePath: '/src/file.ts' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should handle different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;', filePath: '/src/utils/helper.ts' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should handle TSX file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;', filePath: '/src/components/App.tsx' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested type with any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      const nestedNode = {
        type: 'TSAnyKeyword',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
        parent: {
          type: 'TSTypeReference',
          parent: {
            type: 'TSIntersectionType',
            parent: {
              type: 'TSTypeAliasDeclaration',
            },
          },
        },
      }

      visitor.TSAnyKeyword(nestedNode)

      expect(reports.length).toBe(1)
    })

    test('should detect any in class property type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword({
        type: 'TSAnyKeyword',
        loc: { start: { line: 3, column: 12 }, end: { line: 3, column: 15 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should detect any in interface property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword({
        type: 'TSAnyKeyword',
        loc: { start: { line: 2, column: 8 }, end: { line: 2, column: 11 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect any in tuple type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword({
        type: 'TSAnyKeyword',
        loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 4 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect any in union type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should detect any in mapped type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNodeWithRange(1, 0, 20, 23))

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('unknown')
    })

    test('should detect any in conditional type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(4, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle ArrayType with string element that is not any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType({
        type: 'ArrayType',
        elementType: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle ArrayType with any element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType({
        type: 'ArrayType',
        elementType: { type: 'TSAnyKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should allow ArrayType any with allowInGenericArrays true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInGenericArrays: true }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType({
        type: 'ArrayType',
        elementType: { type: 'TSAnyKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle multiple any keywords across all handlers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(1, 0))
      visitor.TSAnyKeyword(createAnyKeywordNode(2, 0))
      visitor.TSAnyKeyword(createAnyKeywordNode(3, 0))
      visitor.TSArrayType(createArrayTypeWithAny(4, 0))
      visitor.TSArrayType(createArrayTypeWithAny(5, 0))
      visitor.TSAsExpression(createAsExpressionWithAny(6, 0))
      visitor.TSTypeAssertion(createTypeAssertionWithAny(7, 0))

      expect(reports.length).toBe(7)
    })

    test('should handle context with empty source string', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/empty.ts' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())

      expect(reports.length).toBe(1)
    })

    test('should handle context with multiline source', () => {
      const { context, reports } = createMockRuleContext({ source: 'const a: any = 1;\nconst b: any = 2;\nconst c: string = "hello";', filePath: '/src/multi.ts' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode(1, 8))
      visitor.TSAnyKeyword(createAnyKeywordNode(2, 8))

      expect(reports.length).toBe(2)
    })

    test('should allow both options simultaneously with no reports for suppression targets', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowInGenericArrays: true,
        allowAsTypeAssertion: true,
      }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSArrayType(createArrayTypeWithAny())
      visitor.TSArrayType(createArrayTypeNode())
      visitor.TSAsExpression(createAsExpressionWithAny())
      visitor.TSTypeAssertion(createTypeAssertionWithAny())

      expect(reports.length).toBe(0)
    })

    test('should still report TSAnyKeyword when both options suppress other handlers', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowInGenericArrays: true,
        allowAsTypeAssertion: true,
      }], source: 'const x: any = 1;' })
      const visitor = noExplicitAnyRule.create(context)

      visitor.TSAnyKeyword(createAnyKeywordNode())
      visitor.TSAnyKeyword(createAnyKeywordNode(2, 5))
      visitor.TSAnyKeyword(createAnyKeywordNode(3, 10))

      expect(reports.length).toBe(3)
    })
  })
})
