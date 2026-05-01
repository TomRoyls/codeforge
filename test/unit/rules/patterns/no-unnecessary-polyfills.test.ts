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

  describe('all polyfill sources via import', () => {
    const polyfillSources = [
      '@babel/polyfill',
      '@babel/runtime/regenerator',
      'core-js',
      'core-js-compat',
      'core-js-pure',
      'core-js/features',
      'core-js/proposals',
      'core-js/shim',
      'core-js/stable',
      'core-js/web',
      'polyfill-library',
      'regenerator-runtime',
    ]

    test('flags all POLYFILL_SOURCES via import', () => {
      for (const source of polyfillSources) {
        const reports = runRuleForImport(source)
        expect(reports, `Expected flag for import '${source}'`).toHaveLength(1)
      }
    })
  })

  describe('all polyfill sources via require', () => {
    test('flags core-js/stable require', () => {
      const reports = runRuleForRequire('core-js/stable')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js-pure require', () => {
      const reports = runRuleForRequire('core-js-pure')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/features require', () => {
      const reports = runRuleForRequire('core-js/features')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/proposals require', () => {
      const reports = runRuleForRequire('core-js/proposals')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/shim require', () => {
      const reports = runRuleForRequire('core-js/shim')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/web require', () => {
      const reports = runRuleForRequire('core-js/web')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js-compat require', () => {
      const reports = runRuleForRequire('core-js-compat')
      expect(reports).toHaveLength(1)
    })

    test('flags @babel/runtime/regenerator require', () => {
      const reports = runRuleForRequire('@babel/runtime/regenerator')
      expect(reports).toHaveLength(1)
    })

    test('flags polyfill-library require', () => {
      const reports = runRuleForRequire('polyfill-library')
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag axios require', () => {
      const reports = runRuleForRequire('axios')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag path require', () => {
      const reports = runRuleForRequire('path')
      expect(reports).toHaveLength(0)
    })
  })

  describe('legacy polyfill messages', () => {
    test('core-js import uses legacy message', () => {
      const reports = runRuleForImport('core-js')
      expect(reports[0].message).toContain('Unexpected polyfill import')
      expect(reports[0].message).toContain('Modern JavaScript engines')
    })

    test('@babel/polyfill import uses legacy message', () => {
      const reports = runRuleForImport('@babel/polyfill')
      expect(reports[0].message).toContain('Unexpected polyfill import')
    })

    test('core-js/stable import uses legacy message', () => {
      const reports = runRuleForImport('core-js/stable')
      expect(reports[0].message).toContain('Unexpected polyfill import')
      expect(reports[0].message).toContain('Modern JavaScript engines')
    })

    test('core-js/features import uses legacy message', () => {
      const reports = runRuleForImport('core-js/features')
      expect(reports[0].message).toContain('Unexpected polyfill import')
    })

    test('core-js/proposals import uses legacy message', () => {
      const reports = runRuleForImport('core-js/proposals')
      expect(reports[0].message).toContain('Unexpected polyfill import')
    })

    test('core-js require uses legacy message', () => {
      const reports = runRuleForRequire('core-js')
      expect(reports[0].message).toContain('Unexpected polyfill import')
      expect(reports[0].message).toContain('Modern JavaScript engines')
    })
  })

  describe('non-legacy polyfill messages', () => {
    test('regenerator-runtime import uses non-legacy message', () => {
      const reports = runRuleForImport('regenerator-runtime')
      expect(reports[0].message).toContain('Unnecessary polyfill')
      expect(reports[0].message).toContain('native APIs')
    })

    test('core-js-pure import uses non-legacy message', () => {
      const reports = runRuleForImport('core-js-pure')
      expect(reports[0].message).toContain('Unnecessary polyfill')
      expect(reports[0].message).toContain('native APIs')
    })

    test('core-js-compat import uses non-legacy message', () => {
      const reports = runRuleForImport('core-js-compat')
      expect(reports[0].message).toContain('Unnecessary polyfill')
    })

    test('polyfill-library import uses non-legacy message', () => {
      const reports = runRuleForImport('polyfill-library')
      expect(reports[0].message).toContain('Unnecessary polyfill')
    })

    test('@babel/runtime/regenerator import uses non-legacy message', () => {
      const reports = runRuleForImport('@babel/runtime/regenerator')
      expect(reports[0].message).toContain('Unnecessary polyfill')
    })

    test('regenerator-runtime require uses non-legacy message', () => {
      const reports = runRuleForRequire('regenerator-runtime')
      expect(reports[0].message).toContain('Unnecessary polyfill')
      expect(reports[0].message).toContain('native APIs')
    })

    test('core-js-pure require uses non-legacy message', () => {
      const reports = runRuleForRequire('core-js-pure')
      expect(reports[0].message).toContain('Unnecessary polyfill')
    })

    test('polyfill-library require uses non-legacy message', () => {
      const reports = runRuleForRequire('polyfill-library')
      expect(reports[0].message).toContain('Unnecessary polyfill')
    })
  })

  describe('core-js subpath imports', () => {
    test('flags core-js/stable/array import', () => {
      const reports = runRuleForImport('core-js/stable/array')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/stable/promise import', () => {
      const reports = runRuleForImport('core-js/stable/promise')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/features/array import', () => {
      const reports = runRuleForImport('core-js/features/array')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/features/string import', () => {
      const reports = runRuleForImport('core-js/features/string')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/proposals/set-methods import', () => {
      const reports = runRuleForImport('core-js/proposals/set-methods')
      expect(reports).toHaveLength(1)
    })

    test('flags core-js/web/url import', () => {
      const reports = runRuleForImport('core-js/web/url')
      expect(reports).toHaveLength(1)
    })

    test('core-js subpath uses legacy message', () => {
      const reports = runRuleForImport('core-js/stable/array')
      expect(reports[0].message).toContain('Unexpected polyfill import')
    })

    test('does NOT flag core-js-toolkit/stable import', () => {
      const reports = runRuleForImport('core-js-toolkit/stable')
      expect(reports).toHaveLength(0)
    })
  })

  describe('non-polyfill imports should NOT report', () => {
    test('does NOT flag @angular/core import', () => {
      const reports = runRuleForImport('@angular/core')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @nestjs/common import', () => {
      const reports = runRuleForImport('@nestjs/common')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @babel/preset-env import', () => {
      const reports = runRuleForImport('@babel/preset-env')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @babel/core import', () => {
      const reports = runRuleForImport('@babel/core')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @babel/runtime/helpers import', () => {
      const reports = runRuleForImport('@babel/runtime/helpers')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag express import', () => {
      const reports = runRuleForImport('express')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @types/react import', () => {
      const reports = runRuleForImport('@types/react')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag ../utils import', () => {
      const reports = runRuleForImport('../utils')
      expect(reports).toHaveLength(0)
    })
  })

  describe('TSImportEqualsDeclaration', () => {
    function createTSImportEqualsDeclaration(source: string): unknown {
      return {
        type: 'TSImportEqualsDeclaration',
        source: { type: 'Literal', value: source },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: source.length + 15 },
        },
      }
    }

    function runRuleForTSImportEquals(source: string): ReportDescriptor[] {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration(createTSImportEqualsDeclaration(source))
      }
      return reports
    }

    test('flags core-js via TS import equals', () => {
      const reports = runRuleForTSImportEquals('core-js')
      expect(reports).toHaveLength(1)
    })

    test('flags @babel/polyfill via TS import equals', () => {
      const reports = runRuleForTSImportEquals('@babel/polyfill')
      expect(reports).toHaveLength(1)
    })

    test('flags regenerator-runtime via TS import equals', () => {
      const reports = runRuleForTSImportEquals('regenerator-runtime')
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag lodash via TS import equals', () => {
      const reports = runRuleForTSImportEquals('lodash')
      expect(reports).toHaveLength(0)
    })
  })

  describe('call expression edge cases', () => {
    test('does NOT flag require with non-identifier callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.CallExpression) {
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'mod' }, property: { type: 'Identifier', name: 'require' } },
          arguments: [{ type: 'Literal', value: 'core-js' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag require with non-string argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.CallExpression) {
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'require' },
          arguments: [{ type: 'Identifier', name: 'moduleName' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag define call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.CallExpression) {
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'define' },
          arguments: [{ type: 'Literal', value: 'core-js' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        })
      }
      expect(reports).toHaveLength(0)
    })
  })

  describe('message content verification', () => {
    test('legacy message includes source name', () => {
      const reports = runRuleForImport('core-js')
      expect(reports[0].message).toContain("'core-js'")
    })

    test('non-legacy message includes source name', () => {
      const reports = runRuleForImport('regenerator-runtime')
      expect(reports[0].message).toContain("'regenerator-runtime'")
    })

    test('legacy message includes build tool suggestion', () => {
      const reports = runRuleForImport('core-js')
      expect(reports[0].message).toContain('build tool')
    })

    test('non-legacy message includes bundler suggestion', () => {
      const reports = runRuleForImport('regenerator-runtime')
      expect(reports[0].message).toContain('bundler')
    })

    test('@babel/polyfill legacy message mentions modern engines', () => {
      const reports = runRuleForImport('@babel/polyfill')
      expect(reports[0].message).toContain('Modern JavaScript engines')
    })
  })

  describe('multiple calls produce independent reports', () => {
    test('importing same polyfill twice reports twice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration(createImportDeclaration('core-js'))
        visitor.ImportDeclaration(createImportDeclaration('core-js'))
      }
      expect(reports).toHaveLength(2)
    })

    test('importing polyfill then non-polyfill reports once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration(createImportDeclaration('core-js'))
        visitor.ImportDeclaration(createImportDeclaration('lodash'))
      }
      expect(reports).toHaveLength(1)
    })

    test('requiring polyfill then non-polyfill reports once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.CallExpression) {
        visitor.CallExpression(createRequireCall('core-js'))
        visitor.CallExpression(createRequireCall('lodash'))
      }
      expect(reports).toHaveLength(1)
    })

    test('mixed import and require both report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryPolyfillsRule.create(context as RuleContext)
      if (visitor.ImportDeclaration) {
        visitor.ImportDeclaration(createImportDeclaration('core-js'))
      }
      if (visitor.CallExpression) {
        visitor.CallExpression(createRequireCall('regenerator-runtime'))
      }
      expect(reports).toHaveLength(2)
    })
  })
})
