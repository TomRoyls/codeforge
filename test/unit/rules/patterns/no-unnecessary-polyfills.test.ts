import { describe, test, expect } from 'vitest'
import { noUnnecessaryPolyfillsRule } from '../../../../src/rules/patterns/no-unnecessary-polyfills.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createImportDeclaration(source: string, line = 1, column = 0): unknown {
  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: source },
    specifiers: [],
    loc: {
      start: { line, column },
      end: { line, column: column + source.length + 15 },
    },
  }
}

function createRequireCall(source: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [{ type: 'Literal', value: source }],
    loc: {
      start: { line, column },
      end: { line, column: column + source.length + 15 },
    },
  }
}

function runRuleForImport(source: string): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
  if (visitor.ImportDeclaration) {
    visitor.ImportDeclaration(createImportDeclaration(source))
  }
  return reports
}

function runRuleForRequire(source: string): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
  if (visitor.CallExpression) {
    visitor.CallExpression(createRequireCall(source))
  }
  return reports
}

describe('no-unnecessary-polyfills', () => {
  test('has correct category', () => {
    expect(noUnnecessaryPolyfillsRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noUnnecessaryPolyfillsRule.meta.docs?.description).toBeDefined()
  })

  test('is not recommended', () => {
    expect(noUnnecessaryPolyfillsRule.meta.docs?.recommended).toBe(false)
  })

  test('has suggestion type', () => {
    expect(noUnnecessaryPolyfillsRule.meta.type).toBe('suggestion')
  })

  test('has warn severity', () => {
    expect(noUnnecessaryPolyfillsRule.meta.severity).toBe('warn')
  })

  describe('import declarations', () => {
    test('flags core-js import', () => {
      const reports = runRuleForImport('core-js')
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('core-js')
    })

    test('flags @babel/polyfill import', () => {
      const reports = runRuleForImport('@babel/polyfill')
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('@babel/polyfill')
    })

    test('flags regenerator-runtime import', () => {
      const reports = runRuleForImport('regenerator-runtime')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/stable import', () => {
      const reports = runRuleForImport('core-js/stable')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js-pure import', () => {
      const reports = runRuleForImport('core-js-pure')
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag lodash import', () => {
      const reports = runRuleForImport('lodash')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag react import', () => {
      const reports = runRuleForImport('react')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag local import', () => {
      const reports = runRuleForImport('./utils')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @types/node import', () => {
      const reports = runRuleForImport('@types/node')
      expect(reports).toHaveLength(0)
    })

    test('legacy polyfill message mentions modern engines', () => {
      const reports = runRuleForImport('core-js')
      expect(reports[0].message).toContain('Modern JavaScript engines')
    })
  })

  describe('require calls', () => {
    test('flags core-js require', () => {
      const reports = runRuleForRequire('core-js')
      expect(reports).toHaveLength(1)
    })

    test('flags @babel/polyfill require', () => {
      const reports = runRuleForRequire('@babel/polyfill')
      expect(reports).toHaveLength(1)
    })

    test('flags regenerator-runtime require', () => {
      const reports = runRuleForRequire('regenerator-runtime')
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag lodash require', () => {
      const reports = runRuleForRequire('lodash')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag non-require call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.CallExpression) {
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'import' },
          arguments: [{ type: 'Literal', value: 'core-js' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    test('does NOT flag null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration(null)
      }
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag undefined node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration(undefined)
      }
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag node without source', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          specifiers: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag import with non-string source', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 42 },
          specifiers: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag require with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.CallExpression) {
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'require' },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag non-Declaration type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration({
          type: 'VariableDeclaration',
          source: { type: 'Literal', value: 'core-js' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })

    test('reports correct location', () => {
      const reports = runRuleForImport('core-js')
      expect(reports[0].loc).toBeDefined()
    })

    test('flags core-js/features import', () => {
      const reports = runRuleForImport('core-js/features')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/proposals import', () => {
      const reports = runRuleForImport('core-js/proposals')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/shim import', () => {
      const reports = runRuleForImport('core-js/shim')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/web import', () => {
      const reports = runRuleForImport('core-js/web')
      expect(reports).toHaveLength(1)
    })

    test('flags @babel/runtime/regenerator import', () => {
      const reports = runRuleForImport('@babel/runtime/regenerator')
      expect(reports).toHaveLength(1)
    })

    test('flags polyfill-library import', () => {
      const reports = runRuleForImport('polyfill-library')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js-compat import', () => {
      const reports = runRuleForImport('core-js-compat')
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag core-js-toolkit import', () => {
      const reports = runRuleForImport('core-js-toolkit')
      expect(reports).toHaveLength(0)
    })
  })

  describe('visitor structure', () => {
    test('has ImportDeclaration visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })

    test('has CallExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })
})
