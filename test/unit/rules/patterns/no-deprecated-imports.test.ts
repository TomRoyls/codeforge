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

  describe('fully deprecated modules - exhaustive', () => {
    test('flags core-js with default import', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'default', name: 'coreJs' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('deprecated module')
    })

    test('flags @babel/polyfill with named import', () => {
      const reports = runRule(createImportDeclaration('@babel/polyfill', [{ type: 'named', name: 'polyfill' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags @babel/polyfill with namespace import', () => {
      const reports = runRule(createImportDeclaration('@babel/polyfill', [{ type: 'namespace', name: 'polyfill' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags request with named import', () => {
      const reports = runRule(createImportDeclaration('request', [{ type: 'named', name: 'get' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags request with namespace import', () => {
      const reports = runRule(createImportDeclaration('request', [{ type: 'namespace', name: 'req' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags rx with named import', () => {
      const reports = runRule(createImportDeclaration('rx', [{ type: 'named', name: 'Observable' }]))
      expect(reports).toHaveLength(1)
    })

    test('flags rx with namespace import', () => {
      const reports = runRule(createImportDeclaration('rx', [{ type: 'namespace', name: 'RxLib' }]))
      expect(reports).toHaveLength(1)
    })

    test('reports once for core-js with multiple specifiers', () => {
      const reports = runRule(createImportDeclaration('core-js', [
        { type: 'default', name: 'core' },
        { type: 'named', name: 'set' },
      ]))
      expect(reports).toHaveLength(1)
    })

    test('wildcard message contains source for @babel/polyfill', () => {
      const reports = runRule(createImportDeclaration('@babel/polyfill', [{ type: 'default', name: 'p' }]))
      expect(reports[0].message).toContain("'@babel/polyfill'")
    })

    test('wildcard message contains source for rx', () => {
      const reports = runRule(createImportDeclaration('rx', [{ type: 'default', name: 'r' }]))
      expect(reports[0].message).toContain("'rx'")
    })
  })

  describe('all deprecated exports', () => {
    test('flags querystring escape', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'escape' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'escape'")
    })

    test('flags querystring unescape', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'unescape' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'unescape'")
    })

    test('flags mkdirp manual', () => {
      const reports = runRule(createImportDeclaration('mkdirp', [{ type: 'named', name: 'manual' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'manual'")
    })

    test('flags colors disableColors', () => {
      const reports = runRule(createImportDeclaration('colors', [{ type: 'named', name: 'disableColors' }]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'disableColors'")
    })

    test('flags all 4 querystring deprecated exports at once', () => {
      const reports = runRule(createImportDeclaration('querystring', [
        { type: 'named', name: 'escape' },
        { type: 'named', name: 'parse' },
        { type: 'named', name: 'stringify' },
        { type: 'named', name: 'unescape' },
      ]))
      expect(reports).toHaveLength(4)
    })
  })

  describe('default imports from selectively deprecated modules', () => {
    test('does NOT flag default import from querystring', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'default', name: 'qs' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag default import from colors', () => {
      const reports = runRule(createImportDeclaration('colors', [{ type: 'default', name: 'c' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag default import from mkdirp', () => {
      const reports = runRule(createImportDeclaration('mkdirp', [{ type: 'default', name: 'm' }]))
      expect(reports).toHaveLength(0)
    })
  })

  describe('namespace imports from selectively deprecated modules - extended', () => {
    test('does NOT flag namespace import from mkdirp', () => {
      const reports = runRule(createImportDeclaration('mkdirp', [{ type: 'namespace', name: 'mk' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag namespace import from colors', () => {
      const reports = runRule(createImportDeclaration('colors', [{ type: 'namespace', name: 'col' }]))
      expect(reports).toHaveLength(0)
    })
  })

  describe('side-effect imports', () => {
    test('does NOT flag side-effect import of colors', () => {
      const reports = runRule(createImportDeclaration('colors', []))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag side-effect import of querystring', () => {
      const reports = runRule(createImportDeclaration('querystring', []))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag side-effect import of request', () => {
      const reports = runRule(createImportDeclaration('request', []))
      expect(reports).toHaveLength(0)
    })
  })

  describe('non-deprecated modules - extended', () => {
    test('does NOT flag fs import', () => {
      const reports = runRule(createImportDeclaration('fs', [{ type: 'named', name: 'readFile' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag path import', () => {
      const reports = runRule(createImportDeclaration('path', [{ type: 'named', name: 'join' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @babel/core import', () => {
      const reports = runRule(createImportDeclaration('@babel/core', [{ type: 'default', name: 'babel' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @babel/parser import', () => {
      const reports = runRule(createImportDeclaration('@babel/parser', [{ type: 'named', name: 'parse' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag rxjs import', () => {
      const reports = runRule(createImportDeclaration('rxjs', [{ type: 'named', name: 'Observable' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag request-promise import', () => {
      const reports = runRule(createImportDeclaration('request-promise', [{ type: 'default', name: 'rp' }]))
      expect(reports).toHaveLength(0)
    })
  })

  describe('subpath imports', () => {
    test('does NOT flag core-js/stable import', () => {
      const reports = runRule(createImportDeclaration('core-js/stable', [{ type: 'named', name: 'set' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag core-js/stable default import', () => {
      const reports = runRule(createImportDeclaration('core-js/stable', [{ type: 'default', name: 'core' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag @babel/polyfill/lib import', () => {
      const reports = runRule(createImportDeclaration('@babel/polyfill/lib', [{ type: 'named', name: 'index' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag colors/safe subpath import', () => {
      const reports = runRule(createImportDeclaration('colors/safe', [{ type: 'named', name: 'green' }]))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag mkdirp/dist subpath import', () => {
      const reports = runRule(createImportDeclaration('mkdirp/dist', [{ type: 'named', name: 'mkdirp' }]))
      expect(reports).toHaveLength(0)
    })
  })

  describe('message content verification', () => {
    test('querystring escape message contains export and source', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'escape' }]))
      expect(reports[0].message).toContain("'escape'")
      expect(reports[0].message).toContain("'querystring'")
    })

    test('querystring unescape message contains export and source', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'unescape' }]))
      expect(reports[0].message).toContain("'unescape'")
      expect(reports[0].message).toContain("'querystring'")
    })

    test('mkdirp manual message contains export and source', () => {
      const reports = runRule(createImportDeclaration('mkdirp', [{ type: 'named', name: 'manual' }]))
      expect(reports[0].message).toContain("'manual'")
      expect(reports[0].message).toContain("'mkdirp'")
    })

    test('colors disableColors message contains export and source', () => {
      const reports = runRule(createImportDeclaration('colors', [{ type: 'named', name: 'disableColors' }]))
      expect(reports[0].message).toContain("'disableColors'")
      expect(reports[0].message).toContain("'colors'")
    })

    test('specific export message mentions recommended alternative', () => {
      const reports = runRule(createImportDeclaration('querystring', [{ type: 'named', name: 'parse' }]))
      expect(reports[0].message).toContain('recommended alternative')
    })

    test('wildcard message mentions recommended alternatives', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'named', name: 'set' }]))
      expect(reports[0].message).toContain('recommended alternatives')
    })
  })

  describe('mixed imports', () => {
    test('flags only deprecated from mixed colors imports', () => {
      const reports = runRule(createImportDeclaration('colors', [
        { type: 'named', name: 'disableColors' },
        { type: 'named', name: 'red' },
      ]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'disableColors'")
    })

    test('flags only deprecated from mixed mkdirp imports', () => {
      const reports = runRule(createImportDeclaration('mkdirp', [
        { type: 'named', name: 'manual' },
        { type: 'named', name: 'mkdirpSync' },
      ]))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'manual'")
    })

    test('reports correct count for mixed querystring imports', () => {
      const reports = runRule(createImportDeclaration('querystring', [
        { type: 'named', name: 'escape' },
        { type: 'named', name: 'parse' },
        { type: 'named', name: 'validExport' },
      ]))
      expect(reports).toHaveLength(2)
    })

    test('mixed single deprecated and valid from colors', () => {
      const reports = runRule(createImportDeclaration('colors', [
        { type: 'named', name: 'setTheme' },
        { type: 'named', name: 'blue' },
        { type: 'named', name: 'yellow' },
      ]))
      expect(reports).toHaveLength(1)
    })
  })

  describe('aliased imports', () => {
    test('flags aliased deprecated import from querystring', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'querystring' },
        specifiers: [{
          type: 'ImportSpecifier',
          imported: { type: 'Identifier', name: 'parse' },
          local: { type: 'Identifier', name: 'qsParse' },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'parse'")
    })

    test('does NOT flag aliased non-deprecated import from colors', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'colors' },
        specifiers: [{
          type: 'ImportSpecifier',
          imported: { type: 'Identifier', name: 'green' },
          local: { type: 'Identifier', name: 'g' },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('flags aliased deprecated import from mkdirp', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'mkdirp' },
        specifiers: [{
          type: 'ImportSpecifier',
          imported: { type: 'Identifier', name: 'sync' },
          local: { type: 'Identifier', name: 'syncMkdir' },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'sync'")
    })
  })

  describe('edge cases - extended', () => {
    test('does NOT flag node without source property', () => {
      const node = {
        type: 'ImportDeclaration',
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag node with null source value', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: null },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag node with undefined specifiers', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'core-js' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('handles node with non-array specifiers', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'core-js' },
        specifiers: 'invalid',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('reports location with start line', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'named', name: 'set' }], 7, 0))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('reports location with start column', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'named', name: 'set' }], 1, 15))
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('non-ImportDeclaration nodes', () => {
    test('does NOT flag dynamic import', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: 'core-js' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag require call', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'core-js' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag re-export from deprecated module', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        source: { type: 'Literal', value: 'core-js' },
        specifiers: [{ type: 'ExportSpecifier', exported: { type: 'Identifier', name: 'set' }, local: { type: 'Identifier', name: 'set' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag export all from deprecated module', () => {
      const node = {
        type: 'ExportAllDeclaration',
        source: { type: 'Literal', value: 'core-js' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('import type', () => {
    test('flags import type from core-js', () => {
      const node = {
        type: 'ImportDeclaration',
        importKind: 'type',
        source: { type: 'Literal', value: 'core-js' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: 'CoreJs' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('deprecated module')
    })

    test('flags import type from request', () => {
      const node = {
        type: 'ImportDeclaration',
        importKind: 'type',
        source: { type: 'Literal', value: 'request' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: 'Request' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })

    test('flags import type named from querystring', () => {
      const node = {
        type: 'ImportDeclaration',
        importKind: 'type',
        source: { type: 'Literal', value: 'querystring' },
        specifiers: [{ type: 'ImportSpecifier', imported: { type: 'Identifier', name: 'parse' }, local: { type: 'Identifier', name: 'parse' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("'parse'")
    })
  })

  describe('additional coverage', () => {
    test('does NOT flag empty string source import', () => {
      const reports = runRule(createImportDeclaration('', [{ type: 'default', name: 'x' }]))
      expect(reports).toHaveLength(0)
    })

    test('flags all 3 deprecated colors exports at once', () => {
      const reports = runRule(createImportDeclaration('colors', [
        { type: 'named', name: 'disableColors' },
        { type: 'named', name: 'enableColors' },
        { type: 'named', name: 'setTheme' },
      ]))
      expect(reports).toHaveLength(3)
    })

    test('does NOT flag import from @types/node', () => {
      const reports = runRule(createImportDeclaration('@types/node', [{ type: 'named', name: 'Buffer' }]))
      expect(reports).toHaveLength(0)
    })

    test('wildcard core-js message format is exact', () => {
      const reports = runRule(createImportDeclaration('core-js', [{ type: 'named', name: 'set' }]))
      expect(reports[0].message).toBe(
        "Unexpected import from deprecated module 'core-js'. This package is deprecated. Refer to its documentation for recommended alternatives."
      )
    })
  })
})
