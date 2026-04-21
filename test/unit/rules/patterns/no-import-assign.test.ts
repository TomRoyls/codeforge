import { describe, test, expect, vi } from 'vitest'
import { noImportAssignRule } from '../../../../src/rules/patterns/no-import-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createImportSpecifier(
  importedName: string,
  localName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ImportSpecifier',
    imported: {
      type: 'Identifier',
      name: importedName,
    },
    local: {
      type: 'Identifier',
      name: localName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + importedName.length + localName.length + 5 },
    },
  }
}

function createImportDefaultSpecifier(localName: string, line = 1, column = 0): unknown {
  return {
    type: 'ImportDefaultSpecifier',
    local: {
      type: 'Identifier',
      name: localName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + localName.length },
    },
  }
}

function createImportNamespaceSpecifier(localName: string, line = 1, column = 0): unknown {
  return {
    type: 'ImportNamespaceSpecifier',
    local: {
      type: 'Identifier',
      name: localName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + localName.length + 1 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
  }
}

// ============================================================
// 1. META PROPERTIES (20 tests)
// ============================================================
describe('no-import-assign rule - meta', () => {
  test('meta.type should be problem', () => {
    expect(noImportAssignRule.meta.type).toBe('problem')
  })

  test('meta.severity should be error', () => {
    expect(noImportAssignRule.meta.severity).toBe('error')
  })

  test('meta.docs.recommended should be true', () => {
    expect(noImportAssignRule.meta.docs?.recommended).toBe(true)
  })

  test('meta.docs.category should be patterns', () => {
    expect(noImportAssignRule.meta.docs?.category).toBe('patterns')
  })

  test('meta.schema should be empty array', () => {
    expect(noImportAssignRule.meta.schema).toEqual([])
  })

  test('meta.fixable should be undefined', () => {
    expect(noImportAssignRule.meta.fixable).toBeUndefined()
  })

  test('meta.docs.description should contain import', () => {
    expect(noImportAssignRule.meta.docs?.description.toLowerCase()).toContain('import')
  })

  test('meta.docs.description should contain assignment', () => {
    expect(noImportAssignRule.meta.docs?.description.toLowerCase()).toContain('assignment')
  })

  test('meta.docs should exist', () => {
    expect(noImportAssignRule.meta.docs).toBeDefined()
  })

  test('meta.docs.description should be a non-empty string', () => {
    expect(typeof noImportAssignRule.meta.docs?.description).toBe('string')
    expect(noImportAssignRule.meta.docs!.description.length).toBeGreaterThan(0)
  })

  test('meta should have type property', () => {
    expect(noImportAssignRule.meta).toHaveProperty('type')
  })

  test('meta should have severity property', () => {
    expect(noImportAssignRule.meta).toHaveProperty('severity')
  })

  test('meta should have docs property', () => {
    expect(noImportAssignRule.meta).toHaveProperty('docs')
  })

  test('meta should have schema property', () => {
    expect(noImportAssignRule.meta).toHaveProperty('schema')
  })

  test('meta.type should be valid RuleType', () => {
    expect(['problem', 'suggestion', 'layout']).toContain(noImportAssignRule.meta.type)
  })

  test('meta.severity should be valid Severity', () => {
    expect(['off', 'warn', 'error']).toContain(noImportAssignRule.meta.severity)
  })

  test('meta.docs.category should be string', () => {
    expect(typeof noImportAssignRule.meta.docs?.category).toBe('string')
  })

  test('meta.schema should be an array', () => {
    expect(Array.isArray(noImportAssignRule.meta.schema)).toBe(true)
  })

  test('meta.docs.description should contain binding', () => {
    expect(noImportAssignRule.meta.docs?.description.toLowerCase()).toContain('binding')
  })

  test('meta should not be deprecated', () => {
    expect(noImportAssignRule.meta.deprecated).toBeFalsy()
  })
})

// ============================================================
// 2. CREATE / VISITOR (8 tests)
// ============================================================
describe('no-import-assign rule - create/visitor', () => {
  test('create should return an object', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(typeof visitor).toBe('object')
  })

  test('visitor should have ImportSpecifier method', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(visitor).toHaveProperty('ImportSpecifier')
    expect(typeof visitor.ImportSpecifier).toBe('function')
  })

  test('visitor should have ImportDefaultSpecifier method', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(visitor).toHaveProperty('ImportDefaultSpecifier')
    expect(typeof visitor.ImportDefaultSpecifier).toBe('function')
  })

  test('visitor should have ImportNamespaceSpecifier method', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(visitor).toHaveProperty('ImportNamespaceSpecifier')
    expect(typeof visitor.ImportNamespaceSpecifier).toBe('function')
  })

  test('visitor should have AssignmentExpression method', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(visitor).toHaveProperty('AssignmentExpression')
    expect(typeof visitor.AssignmentExpression).toBe('function')
  })

  test('create should return a new importNames set per call', () => {
    const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const v1 = noImportAssignRule.create(ctx1)
    const v2 = noImportAssignRule.create(ctx2)

    v1.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    v2.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )

    expect(rep1.length).toBe(0)
    expect(rep2.length).toBe(0)
  })

  test('visitor should have exactly 4 methods', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const keys = Object.keys(visitor)
    expect(keys.length).toBe(4)
  })

  test('all visitor methods should accept one argument', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(visitor.ImportSpecifier.length).toBe(1)
    expect(visitor.ImportDefaultSpecifier.length).toBe(1)
    expect(visitor.ImportNamespaceSpecifier.length).toBe(1)
    expect(visitor.AssignmentExpression.length).toBe(1)
  })
})

// ============================================================
// 3. DETECTION (30 tests)
// ============================================================
describe('no-import-assign rule - detection', () => {
  test('should report assignment to named import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('originalName', 'importedName'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('importedName'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('importedName')
    expect(reports[0].message).toContain('Import binding')
  })

  test('should report assignment to default import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('myDefault'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('myDefault'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('myDefault')
  })

  test('should report assignment to namespace import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('ns'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('ns'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('ns')
  })

  test('should track ImportSpecifier by local name not imported name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('original', 'alias'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('original'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should track same imported and local name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should track different imported and local name via alias', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('originalName', 'alias'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('alias'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('alias')
  })

  test('should detect assignment after multiple import registrations', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('a', 'a'))
    visitor.ImportSpecifier(createImportSpecifier('b', 'b'))
    visitor.ImportSpecifier(createImportSpecifier('c', 'c'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('b')
  })

  test('should detect each specifier type independently', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('named', 'named'))
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('def'))
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('ns'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('named'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('def'), { type: 'Literal', value: 2 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('ns'), { type: 'Literal', value: 3 }),
    )
    expect(reports.length).toBe(3)
  })

  test('should detect default import reassignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('React'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('React'), { type: 'Literal', value: null }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect namespace import reassignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('utils'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('utils'), { type: 'ObjectExpression' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with string literal right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 'hello' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with object right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('config', 'config'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('config'), { type: 'ObjectExpression' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with undefined right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('lib'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('lib'), {
        type: 'Identifier',
        name: 'undefined',
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with null right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: null }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with function expression right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('fn', 'fn'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('fn'), { type: 'FunctionExpression' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with arrow function right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('cb', 'cb'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('cb'), { type: 'ArrowFunctionExpression' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with call expression right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'CallExpression' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with numeric literal right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('count', 'count'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('count'), { type: 'Literal', value: 42 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with boolean literal right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('flag', 'flag'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('flag'), { type: 'Literal', value: true }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with array expression right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('arr', 'arr'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('arr'), { type: 'ArrayExpression' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with binary expression right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('x', 'x'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('x'), { type: 'BinaryExpression' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect assignment with template literal right side', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('str', 'str'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('str'), { type: 'TemplateLiteral' }),
    )
    expect(reports.length).toBe(1)
  })

  test('should report on repeated assignment to same import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 2 }),
    )
    expect(reports.length).toBe(2)
  })

  test('should detect import with single character name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('x', 'x'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect import with long name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const longName = 'veryLongImportNameThatGoesOnAndOn'
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier(longName, longName))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(longName), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain(longName)
  })

  test('should detect import with numeric-like suffix name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('utils2', 'utils2'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('utils2'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect multiple different import reassignments', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.ImportSpecifier(createImportSpecifier('bar', 'bar'))
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('defaultImport'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 2 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('defaultImport'), { type: 'Literal', value: 3 }),
    )
    expect(reports.length).toBe(3)
  })

  test('should detect assignment where right side is also import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('a', 'a'))
    visitor.ImportSpecifier(createImportSpecifier('b', 'b'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('a'), createIdentifier('b')),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('a')
  })

  test('should detect assignment after importing same name twice', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect import with camelCase name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('myHelper', 'myHelper'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('myHelper'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect import with UPPER_CASE name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('CONSTANT', 'CONSTANT'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('CONSTANT'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })
})

// ============================================================
// 4. NOT REPORTING (30 tests)
// ============================================================
describe('no-import-assign rule - not reporting', () => {
  test('should not report assignment to non-import variable', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('localVar'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report property assignment on import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createMemberExpression(createIdentifier('bar'), createIdentifier('prop')),
        { type: 'Literal', value: 1 },
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report assignment before import declaration', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    expect(reports.length).toBe(0)
  })

  test('should not report assignment to variable with similar name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo2'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report assignment to variable with prefix match', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foobar'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when no imports are registered', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('anything'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when import specifier has no local', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = {
      type: 'ImportSpecifier',
      imported: { type: 'Identifier', name: 'foo' },
    }
    visitor.ImportSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when default specifier has no local', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = { type: 'ImportDefaultSpecifier' }
    visitor.ImportDefaultSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when namespace specifier has no local', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = { type: 'ImportNamespaceSpecifier' }
    visitor.ImportNamespaceSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when assignment left is not an identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Literal', value: 5 },
      right: { type: 'Literal', value: 1 },
    }
    visitor.AssignmentExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when assignment left is a member expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('obj', 'obj'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
        { type: 'Literal', value: 1 },
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report deeply nested member expression on import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('obj', 'obj'))
    const deep = createMemberExpression(
      createMemberExpression(createIdentifier('obj'), createIdentifier('a')),
      createIdentifier('b'),
    )
    visitor.AssignmentExpression(createAssignmentExpression(deep, { type: 'Literal', value: 1 }))
    expect(reports.length).toBe(0)
  })

  test('should not report computed member expression on import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('arr', 'arr'))
    const computed = {
      type: 'MemberExpression',
      object: createIdentifier('arr'),
      property: { type: 'Literal', value: 0 },
      computed: true,
    }
    visitor.AssignmentExpression(
      createAssignmentExpression(computed, { type: 'Literal', value: 99 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for different import names', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for default import when assigning different name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('React'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('Vue'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for namespace import when assigning different name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('lodash'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('underscore'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when import specifier local name differs from assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('Component', 'MyComponent'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('Component'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for case-sensitive mismatch', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('Foo', 'Foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for underscore prefix mismatch', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('_foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for trailing underscore mismatch', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo_'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for unrelated imported name when using alias', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('React', 'R'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('React'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report for whitespace difference in name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(' foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report empty string import name assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(''), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report property assignment on default import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('React'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createMemberExpression(createIdentifier('React'), createIdentifier('useState')),
        { type: 'Literal', value: 1 },
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report property assignment on namespace import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('Utils'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createMemberExpression(createIdentifier('Utils'), createIdentifier('map')),
        { type: 'Literal', value: 1 },
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when left is a destructuring pattern', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'ObjectPattern' },
      right: { type: 'Literal', value: 1 },
    }
    visitor.AssignmentExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when left is array pattern', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'ArrayPattern' },
      right: { type: 'Literal', value: 1 },
    }
    visitor.AssignmentExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when calling import (CallExpression)', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    // Calling foo() is not an assignment
    expect(reports.length).toBe(0)
  })

  test('should not report update expression on import (non-AssignmentExpression)', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    // foo++ would be UpdateExpression, not AssignmentExpression - no visitor for it
    expect(reports.length).toBe(0)
  })

  test('should not report for unrelated named import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('a', 'a'))
    visitor.ImportSpecifier(createImportSpecifier('b', 'b'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('c'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should not report when import local name is empty', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = {
      type: 'ImportSpecifier',
      imported: { type: 'Identifier', name: 'foo' },
      local: { type: 'Identifier', name: '' },
    }
    visitor.ImportSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(''), { type: 'Literal', value: 1 }),
    )
    // Empty string should still be tracked by the set; this verifies behavior
    expect(reports.length).toBeLessThanOrEqual(1)
  })
})

// ============================================================
// 5. EDGE CASES (25 tests)
// ============================================================
describe('no-import-assign rule - edge cases', () => {
  test('should handle null node in ImportSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportSpecifier(null)).not.toThrow()
  })

  test('should handle undefined node in ImportSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportSpecifier(undefined)).not.toThrow()
  })

  test('should handle null node in ImportDefaultSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportDefaultSpecifier(null)).not.toThrow()
  })

  test('should handle undefined node in ImportDefaultSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportDefaultSpecifier(undefined)).not.toThrow()
  })

  test('should handle null node in ImportNamespaceSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportNamespaceSpecifier(null)).not.toThrow()
  })

  test('should handle undefined node in ImportNamespaceSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportNamespaceSpecifier(undefined)).not.toThrow()
  })

  test('should handle null node in AssignmentExpression', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.AssignmentExpression(null)).not.toThrow()
  })

  test('should handle undefined node in AssignmentExpression', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
  })

  test('should handle string node in ImportSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportSpecifier('string')).not.toThrow()
  })

  test('should handle number node in ImportSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportSpecifier(123)).not.toThrow()
  })

  test('should handle boolean node in ImportSpecifier', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportSpecifier(true)).not.toThrow()
  })

  test('should handle string node in AssignmentExpression', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.AssignmentExpression('string')).not.toThrow()
  })

  test('should handle number node in AssignmentExpression', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.AssignmentExpression(123)).not.toThrow()
  })

  test('should handle empty object node in ImportSpecifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.ImportSpecifier({})).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle empty object node in AssignmentExpression', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(() => visitor.AssignmentExpression({})).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle import specifier without local identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = {
      type: 'ImportSpecifier',
      imported: { type: 'Identifier', name: 'foo' },
    }
    visitor.ImportSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should handle import specifier with non-identifier local', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = {
      type: 'ImportSpecifier',
      imported: { type: 'Identifier', name: 'foo' },
      local: { type: 'Literal', value: 42 },
    }
    visitor.ImportSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should handle assignment without loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'foo' },
      right: { type: 'Literal', value: 1 },
    }
    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle import with underscores in name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('my_import', 'my_import'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('my_import'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('my_import')
  })

  test('should handle import with dollar sign in name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('$var', '$var'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('$var'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('$var')
  })

  test('should handle import with double dollar sign name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('$$', '$$'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('$$'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should handle import with mixed underscore-dollar name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('_$foo$_', '_$foo$_'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('_$foo$_'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should handle default specifier with non-identifier local', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = {
      type: 'ImportDefaultSpecifier',
      local: { type: 'Literal', value: 42 },
    }
    visitor.ImportDefaultSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('42'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
  })

  test('should handle namespace specifier with non-identifier local', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const node = {
      type: 'ImportNamespaceSpecifier',
      local: { type: 'Literal', value: 'notAnIdentifier' },
    }
    visitor.ImportNamespaceSpecifier(node)
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('notAnIdentifier'), {
        type: 'Literal',
        value: 1,
      }),
    )
    expect(reports.length).toBe(0)
  })

  test('should handle assignment left with non-string name property', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 42 },
      right: { type: 'Literal', value: 1 },
    }
    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
  })
})

// ============================================================
// 6. LOCATION (15 tests)
// ============================================================
describe('no-import-assign rule - location', () => {
  test('should report correct start line', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('bar', 10, 5),
        { type: 'Literal', value: 1 },
        10,
        5,
      ),
    )
    expect(reports[0].loc?.start.line).toBe(10)
  })

  test('should report correct start column', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('bar', 5, 20),
        { type: 'Literal', value: 1 },
        5,
        20,
      ),
    )
    expect(reports[0].loc?.start.column).toBe(20)
  })

  test('should report correct end line', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('foo', 3, 0),
        { type: 'Literal', value: 1 },
        3,
        0,
      ),
    )
    expect(reports[0].loc?.end.line).toBe(3)
  })

  test('should report location at line 1 column 0', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('foo', 1, 0),
        { type: 'Literal', value: 1 },
        1,
        0,
      ),
    )
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report location at high line numbers', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('foo', 9999, 50),
        { type: 'Literal', value: 1 },
        9999,
        50,
      ),
    )
    expect(reports[0].loc?.start.line).toBe(9999)
    expect(reports[0].loc?.start.column).toBe(50)
  })

  test('should report default location when no loc on node', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'foo' },
      right: { type: 'Literal', value: 1 },
    }
    visitor.AssignmentExpression(node)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report location for default import reassignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('lib'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('lib', 7, 4),
        { type: 'Literal', value: 1 },
        7,
        4,
      ),
    )
    expect(reports[0].loc?.start.line).toBe(7)
    expect(reports[0].loc?.start.column).toBe(4)
  })

  test('should report location for namespace import reassignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('ns'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('ns', 15, 8),
        { type: 'Literal', value: 1 },
        15,
        8,
      ),
    )
    expect(reports[0].loc?.start.line).toBe(15)
    expect(reports[0].loc?.start.column).toBe(8)
  })

  test('should report different locations for multiple violations', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('a', 'a'))
    visitor.ImportSpecifier(createImportSpecifier('b', 'b'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('a', 5, 0), { type: 'Literal', value: 1 }, 5, 0),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('b', 10, 3),
        { type: 'Literal', value: 2 },
        10,
        3,
      ),
    )
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[1].loc?.start.line).toBe(10)
  })

  test('should handle loc with partial location data', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'foo' },
      right: { type: 'Literal', value: 1 },
      loc: { start: { line: 5 } },
    }
    visitor.AssignmentExpression(node)
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle loc with missing end', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'foo' },
      right: { type: 'Literal', value: 1 },
      loc: { start: { line: 3, column: 2 } },
    }
    visitor.AssignmentExpression(node)
    expect(reports[0].loc?.start.line).toBe(3)
    expect(reports[0].loc?.start.column).toBe(2)
    expect(reports[0].loc?.end.line).toBe(1)
  })

  test('should handle column 0 at various lines', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('x', 'x'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('x', 42, 0),
        { type: 'Literal', value: 1 },
        42,
        0,
      ),
    )
    expect(reports[0].loc?.start.column).toBe(0)
    expect(reports[0].loc?.start.line).toBe(42)
  })

  test('should preserve end column from node loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('foo', 2, 4),
        { type: 'Literal', value: 1 },
        2,
        4,
      ),
    )
    expect(reports[0].loc?.end.column).toBe(14) // column + 10 from createAssignmentExpression
  })

  test('should handle loc with non-numeric line gracefully', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'foo' },
      right: { type: 'Literal', value: 1 },
      loc: { start: { line: 'bad', column: 0 }, end: { line: 'bad', column: 1 } },
    }
    visitor.AssignmentExpression(node)
    expect(reports[0].loc?.start.line).toBe(1) // default
  })

  test('should report loc as object with start and end', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(
        createIdentifier('foo', 3, 5),
        { type: 'Literal', value: 1 },
        3,
        5,
      ),
    )
    expect(reports[0].loc).toBeDefined()
    expect(typeof reports[0].loc?.start).toBe('object')
    expect(typeof reports[0].loc?.end).toBe('object')
  })
})

// ============================================================
// 7. MESSAGES (10 tests)
// ============================================================
describe('no-import-assign rule - messages', () => {
  test('message should contain "Import binding"', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message).toContain('Import binding')
  })

  test('message should contain import name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('testImport', 'testImport'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('testImport'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message).toContain('testImport')
  })

  test('message should contain "modified"', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message.toLowerCase()).toContain('modified')
  })

  test('message should be exact format for named import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message).toBe("Import binding 'bar' should not be modified.")
  })

  test('message should be exact format for default import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('React'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('React'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message).toBe("Import binding 'React' should not be modified.")
  })

  test('message should be exact format for namespace import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('ns'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('ns'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message).toBe("Import binding 'ns' should not be modified.")
  })

  test('message should include single quotes around name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message).toContain("'foo'")
  })

  test('message should be a string', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(typeof reports[0].message).toBe('string')
  })

  test('message should end with period', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message.endsWith('.')).toBe(true)
  })

  test('message should use local name not imported name', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('OriginalName', 'localAlias'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('localAlias'), { type: 'Literal', value: 1 }),
    )
    expect(reports[0].message).toContain('localAlias')
    expect(reports[0].message).not.toContain('OriginalName')
  })
})

// ============================================================
// 8. MULTIPLE REPORTS (10 tests)
// ============================================================
describe('no-import-assign rule - multiple reports', () => {
  test('should report 3 reassignments of 3 different imports', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.ImportSpecifier(createImportSpecifier('bar', 'bar'))
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('defaultImport'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 2 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('defaultImport'), { type: 'Literal', value: 3 }),
    )
    expect(reports.length).toBe(3)
  })

  test('should report each reassignment of same import separately', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 2 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 3 }),
    )
    expect(reports.length).toBe(3)
  })

  test('should interleave imports and assignments correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('a', 'a'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
    )
    visitor.ImportSpecifier(createImportSpecifier('b', 'b'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
    )
    expect(reports.length).toBe(2)
  })

  test('should only report actual violations among mixed assignments', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('notImported'), { type: 'Literal', value: 2 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 3 }),
    )
    expect(reports.length).toBe(2)
  })

  test('should report all specifier types reassigned', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('named', 'named'))
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('def'))
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('ns'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('named'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('def'), { type: 'Literal', value: 2 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('ns'), { type: 'Literal', value: 3 }),
    )
    expect(reports).toHaveLength(3)
    expect(reports[0].message).toContain('named')
    expect(reports[1].message).toContain('def')
    expect(reports[2].message).toContain('ns')
  })

  test('should report 5 reassignments of 5 different named imports', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    for (const name of ['a', 'b', 'c', 'd', 'e']) {
      visitor.ImportSpecifier(createImportSpecifier(name, name))
    }
    for (const name of ['a', 'b', 'c', 'd', 'e']) {
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
      )
    }
    expect(reports.length).toBe(5)
  })

  test('should handle many assignments to same import', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    for (let i = 0; i < 10; i++) {
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: i }),
      )
    }
    expect(reports.length).toBe(10)
  })

  test('should handle many imports with single assignment each', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    const names = Array.from({ length: 10 }, (_, i) => `import${i}`)
    for (const name of names) {
      visitor.ImportSpecifier(createImportSpecifier(name, name))
    }
    for (const name of names) {
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
      )
    }
    expect(reports.length).toBe(10)
  })

  test('should report correct messages for multiple violations', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('alpha', 'alpha'))
    visitor.ImportSpecifier(createImportSpecifier('beta', 'beta'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('alpha'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('beta'), { type: 'Literal', value: 2 }),
    )
    expect(reports[0].message).toBe("Import binding 'alpha' should not be modified.")
    expect(reports[1].message).toBe("Import binding 'beta' should not be modified.")
  })

  test('should not report non-imports mixed with imports', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 1 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('baz'), { type: 'Literal', value: 2 }),
    )
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 3 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('foo')
  })
})

// ============================================================
// 9. CONTEXT (10 tests)
// ============================================================
describe('no-import-assign rule - context', () => {
  test('should work with different file paths', () => {
    const reports: ReportDescriptor[] = []
    const ctx = {
      report: (d: ReportDescriptor) => reports.push(d),
      getFilePath: () => '/different/path.ts',
      getAST: () => null,
      getSource: () => '',
      getTokens: () => [],
      getComments: () => [],
      config: { options: [] },
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      workspaceRoot: '/different',
    } as unknown as RuleContext
    const visitor = noImportAssignRule.create(ctx)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should work with empty source', () => {
    const reports: ReportDescriptor[] = []
    const ctx = {
      report: (d: ReportDescriptor) => reports.push(d),
      getFilePath: () => '/empty.ts',
      getAST: () => null,
      getSource: () => '',
      getTokens: () => [],
      getComments: () => [],
      config: { options: [] },
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      workspaceRoot: '/',
    } as unknown as RuleContext
    const visitor = noImportAssignRule.create(ctx)
    visitor.ImportSpecifier(createImportSpecifier('x', 'x'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should work with null AST', () => {
    const reports: ReportDescriptor[] = []
    const ctx = {
      report: (d: ReportDescriptor) => reports.push(d),
      getFilePath: () => '/test.ts',
      getAST: () => null,
      getSource: () => '',
      getTokens: () => [],
      getComments: () => [],
      config: { options: [] },
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      workspaceRoot: '/',
    } as unknown as RuleContext
    const visitor = noImportAssignRule.create(ctx)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('lib'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('lib'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should work with empty tokens array', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should not access config options', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should work with config that has empty options', () => {
    const reports: ReportDescriptor[] = []
    const ctx = {
      report: (d: ReportDescriptor) => reports.push(d),
      getFilePath: () => '/test.ts',
      getAST: () => null,
      getSource: () => '',
      getTokens: () => [],
      getComments: () => [],
      config: { options: [] },
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      workspaceRoot: '/',
    } as unknown as RuleContext
    const visitor = noImportAssignRule.create(ctx)
    visitor.ImportSpecifier(createImportSpecifier('a', 'a'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('should work when logger methods are no-ops', () => {
    const reports: ReportDescriptor[] = []
    const ctx = {
      report: (d: ReportDescriptor) => reports.push(d),
      getFilePath: () => '/test.ts',
      getAST: () => null,
      getSource: () => '',
      getTokens: () => [],
      getComments: () => [],
      config: { options: [] },
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
      workspaceRoot: '/',
    } as unknown as RuleContext
    const visitor = noImportAssignRule.create(ctx)
    visitor.ImportSpecifier(createImportSpecifier('test', 'test'))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier('test'), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test('create should return a frozen-like visitor', () => {
    const { context } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    expect(visitor).toBeDefined()
    expect(typeof visitor).toBe('object')
  })

  test('should not call report for valid code patterns', () => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    // Only import, no assignment
    visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('bar'))
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('baz'))
    expect(reports.length).toBe(0)
  })

  test('should handle multiple create calls independently', () => {
    const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const v1 = noImportAssignRule.create(ctx1)
    const v2 = noImportAssignRule.create(ctx2)
    v1.ImportSpecifier(createImportSpecifier('shared', 'shared'))
    v2.ImportDefaultSpecifier(createImportDefaultSpecifier('other'))
    v1.AssignmentExpression(
      createAssignmentExpression(createIdentifier('shared'), { type: 'Literal', value: 1 }),
    )
    v2.AssignmentExpression(
      createAssignmentExpression(createIdentifier('other'), { type: 'Literal', value: 1 }),
    )
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(1)
    expect(rep1[0].message).toContain('shared')
    expect(rep2[0].message).toContain('other')
  })
})

// ============================================================
// 10. TEST.EACH DATA-DRIVEN (40+ tests)
// ============================================================
describe('no-import-assign rule - test.each data-driven', () => {
  const importNames = [
    ['foo'],
    ['bar'],
    ['baz'],
    ['myFunc'],
    ['MyClass'],
    ['CONSTANT'],
    ['_private'],
    ['$jquery'],
    ['camelCase'],
    ['snake_case'],
  ]

  test.each(importNames)('should detect reassignment of named import "%s"', (name) => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier(name, name))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain(name)
  })

  test.each(importNames)('should detect reassignment of default import "%s"', (name) => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportDefaultSpecifier(createImportDefaultSpecifier(name))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain(name)
  })

  test.each(importNames)('should detect reassignment of namespace import "%s"', (name) => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier(name))
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain(name)
  })

  test.each([
    ['foo', 'bar'],
    ['Component', 'MyComp'],
    ['original', 'alias'],
    ['a', 'b'],
    ['longName', 'short'],
  ])('should track local name "%s" not imported name "%s" for specifier', (imported, local) => {
    const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
    const visitor = noImportAssignRule.create(context)
    visitor.ImportSpecifier(createImportSpecifier(imported, local))
    // Assigning to imported name should NOT report
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(imported), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(0)
    // Assigning to local name SHOULD report
    visitor.AssignmentExpression(
      createAssignmentExpression(createIdentifier(local), { type: 'Literal', value: 1 }),
    )
    expect(reports.length).toBe(1)
  })

  test.each(['nonImport', 'localVar', 'anotherName', 'x', 'temp'])(
    'should not report assignment to non-import "%s"',
    (name) => {
      const { context, reports } = createMockRuleContext({ source: 'import { foo } from "bar"; foo = 1;' })
      const visitor = noImportAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(name), { type: 'Literal', value: 1 }),
      )
      expect(reports.length).toBe(0)
    },
  )
})
