import { describe, test, expect } from 'vitest'
import { noNamespaceRule } from '../../../../src/rules/patterns/no-namespace.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNamespace(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Identifier', name },
    kind: 'namespace',
    global: false,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createModule(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Literal', value: name },
    kind: 'module',
    global: false,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createGlobalAugmentation(line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Identifier', name: 'global' },
    kind: 'global',
    global: true,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createRegularModule(line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Identifier', name: 'Utils' },
    kind: 'module',
    global: false,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noNamespaceRule.create(context as RuleContext)
  if (visitor.TSModuleDeclaration) {
    visitor.TSModuleDeclaration(node)
  }
  return reports
}

describe('no-namespace', () => {
  test('has correct category', () => {
    expect(noNamespaceRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noNamespaceRule.meta.docs?.description).toBeDefined()
  })

  test('is recommended', () => {
    expect(noNamespaceRule.meta.docs?.recommended).toBe(true)
  })

  test('has suggestion type', () => {
    expect(noNamespaceRule.meta.type).toBe('suggestion')
  })

  test('has warn severity', () => {
    expect(noNamespaceRule.meta.severity).toBe('warn')
  })

  test('flags namespace declaration', () => {
    const reports = runRule(createNamespace('Utils'))
    expect(reports).toHaveLength(1)
  })

  test('includes namespace name in message', () => {
    const reports = runRule(createNamespace('Helpers'))
    expect(reports[0].message).toContain("'Helpers'")
  })

  test('includes ES modules suggestion in message', () => {
    const reports = runRule(createNamespace('App'))
    expect(reports[0].message).toContain('ES modules')
  })

  test('flags external module augmentation', () => {
    const reports = runRule(createModule('express'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('module augmentation')
  })

  test('does NOT flag global augmentation', () => {
    const reports = runRule(createGlobalAugmentation())
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag regular module with identifier', () => {
    const reports = runRule(createRegularModule())
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

  test('does NOT flag non-TSModuleDeclaration nodes', () => {
    const node = {
      type: 'TSInterfaceDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('reports location', () => {
    const reports = runRule(createNamespace('Utils', 5, 10))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
  })

  test('handles namespace without id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'anonymous'")
  })

  test('handles namespace with non-object id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: 'not-an-object',
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags namespace with members', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Config' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [
          { type: 'ExportNamedDeclaration' },
          { type: 'ExportNamedDeclaration' },
        ],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Config'")
  })

  test('flags namespace without body', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Empty' },
      kind: 'namespace',
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag module with non-string literal id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: 42 },
      kind: 'module',
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag module with identifier id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'MyModule' },
      kind: 'module',
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags multiple namespaces independently', () => {
    const reports1 = runRule(createNamespace('A'))
    const reports2 = runRule(createNamespace('B'))
    expect(reports1).toHaveLength(1)
    expect(reports2).toHaveLength(1)
    expect(reports1[0].message).toContain("'A'")
    expect(reports2[0].message).toContain("'B'")
  })

  test('visitor has TSModuleDeclaration method', () => {
    const { context } = createMockRuleContext()
    const visitor = noNamespaceRule.create(context as RuleContext)
    expect(typeof visitor.TSModuleDeclaration).toBe('function')
  })

  test('flags global namespace declarations too', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'globalThis' },
      kind: 'namespace',
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags module with string literal id for augmentation', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: 'jquery' },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does not flag node without kind property', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })
})
