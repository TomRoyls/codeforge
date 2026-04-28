import { describe, test, expect } from 'vitest'
import { noDeprecatedImportsRule } from '../../../../src/rules/patterns/no-deprecated-imports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createImportDeclaration(source: string, importedNames: Array<{ type: string; name: string }> = [], line = 1, column = 0): unknown {
  const specifiers = importedNames.map(({ type, name }) => {
    if (type === 'default') {
      return { type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name } }
    }
    if (type === 'namespace') {
      return { type: 'ImportNamespaceSpecifier', local: { type: 'Identifier', name } }
    }
    return { type: 'ImportSpecifier', imported: { type: 'Identifier', name }, local: { type: 'Identifier', name } }
  })

  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: source },
    specifiers,
    loc: {
      start: { line, column },
      end: { line, column: column + source.length + 20 },
    },
  }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noDeprecatedImportsRule.create(context as RuleContext)
  if (visitor.ImportDeclaration) {
    visitor.ImportDeclaration(node)
  }
  return reports
}

describe('no-deprecated-imports', () => {
  test('has correct category', () => {
    expect(noDeprecatedImportsRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noDeprecatedImportsRule.meta.docs?.description).toBeDefined()
  })

  test('is not recommended', () => {
    expect(noDeprecatedImportsRule.meta.docs?.recommended).toBe(false)
  })

  test('has suggestion type', () => {
    expect(noDeprecatedImportsRule.meta.type).toBe('suggestion')
  })

  test('has warn severity', () => {
    expect(noDeprecatedImportsRule.meta.severity).toBe('warn')
  })

  describe('fully deprecated modules', () => {
    test('flags core-js import', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'named', name: 'set' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('deprecated module')
    })

    test('flags @babel/polyfill import', () => {
      const reports = runRule(createImportDeclaration('@babel/polyfill', [{ type: 'default', name: 'polyfill' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags request import', () => {
      const reports = runRule(createImportDeclaration('request', [{ type: 'default', name: 'request' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags rx import', () => {
      const reports = runRule(createImportDeclaration('rx', [{ type: 'default', name: 'Rx' }]))
      expect(reports).toHaveLength(1)
    })
  })

  describe('selectively deprecated exports', () => {
    test('flags deprecated named export from querystring', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'parse' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'parse'")
    })

    test('flags deprecated stringify from querystring', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'stringify' }]))
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag non-deprecated export from querystring', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'someOtherExport' }]))
      expect(reports).toHaveLength(0)
    })

    test('flags only deprecated exports, not all', () => {
      const reports = runRule(createImportDeclaration('querystring', [
        { type: 'named', name: 'parse' },
        { type: 'named', name: 'validExport' },
      ]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'parse'")
    })

    test('flags multiple deprecated exports', () => {
      const reports = runRule(createImportDeclaration('querystring', [
        { type: 'named', name: 'parse' },
        { type: 'named', name: 'stringify' },
      ]))
      expect(reports).toHaveLength(2)
    })
  })

  describe('namespace imports from selectively deprecated modules', () => {
    test('does NOT flag namespace import from selectively deprecated module', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'namespace', name: 'qs' }]))
      expect(reports).toHaveLength(0)
    })

    test('flags namespace import from fully deprecated module', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'namespace', name: 'coreJs' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('deprecated module')
    })
  })

  describe('non-deprecated modules', () => {
    test('does NOT flag lodash import', () => {
      const reports = runRule(createImportDeclaration('lodash', [{ type: 'default', name: '_' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag react import', () => {
      const reports = runRule(createImportDeclaration('react', [{ type: 'default', name: 'React' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag local import', () => {
      const reports = runRule(createImportDeclaration('./utils', [{ type: 'named', name: 'helper' }]))
      expect(reports).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    test('does NOT flag null node', () => {
      const reports = runRule(null)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag undefined node', () => {
      const reports = runRule(undefined)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag node with non-string source', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 42 },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag node with empty specifiers', () => {
      const reports = runRule(createImportDeclaration('core-js', []))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag non-ImportDeclaration', () => {
      const node = {
        type: 'VariableDeclaration',
        source: { type: 'Literal', value: 'core-js' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('reports correct location', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'named', name: 'set' }], 5, 10))
      expect(reports[0].loc).toBeDefined()
    })

    test('flags mkdirp deprecated exports', () => {
      const reports = runRule(createImportDeclaration('mkdirp', [{ type: 'named', name: 'sync' }]))
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag mkdirp non-deprecated default import', () => {
      const reports = runRule(createImportDeclaration('mkdirp', [{ type: 'default', name: 'mkdirp' }]))
      expect(reports).toHaveLength(0)
    })

    test('flags colors deprecated setTheme', () => {
      const reports = runRule(createImportDeclaration('colors', [{ type: 'named', name: 'setTheme' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags colors deprecated enableColors', () => {
      const reports = runRule(createImportDeclaration('colors', [{ type: 'named', name: 'enableColors' }]))
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag colors safe export', () => {
      const reports = runRule(createImportDeclaration('colors', [{ type: 'named', name: 'green' }]))
      expect(reports).toHaveLength(0)
    })
  })

  describe('visitor', () => {
    test('has ImportDeclaration visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noDeprecatedImportsRule.create(context as RuleContext)
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })
  })
})
