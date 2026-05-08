import { describe, it, expect } from 'vitest'
import { ScopeAnalyzer } from '../../src/core/scope-analyzer/scope-analyzer.js'
import type {
  ScopeNode,
  Binding,
  ScopeKind,
  SourceLocation,
} from '../../src/core/scope-analyzer/types.js'

function loc(line: number, column: number): SourceLocation {
  return { line, column }
}

function range(
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number,
): { start: SourceLocation; end: SourceLocation } {
  return { start: loc(startLine, startCol), end: loc(endLine, endCol) }
}

function makeBinding(
  name: string,
  kind: BindingKind['kind'],
  line = 0,
  col = 0,
): Binding {
  return {
    name,
    kind: kind as Binding['kind'],
    declaredAt: loc(line, col),
    references: [],
    isUsed: false,
  }
}

describe('ScopeAnalyzer', () => {
  const analyzer = new ScopeAnalyzer()

  describe('analyze - simple program', () => {
    it('analyzes an empty program', () => {
      const ast = { type: 'Program', body: [], loc: range(0, 0, 1, 0) }
      const result = analyzer.analyze(ast)
      expect(result.scopes).toHaveLength(1)
      expect(result.scopes[0]!.kind).toBe('module')
      expect(result.allBindings).toHaveLength(0)
    })

    it('analyzes a program with a variable declaration', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [
              {
                id: { name: 'x', loc: { start: loc(1, 4), end: loc(1, 5) } },
              },
            ],
            loc: range(1, 0, 1, 10),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.allBindings).toHaveLength(1)
      expect(result.allBindings[0]!.name).toBe('x')
      expect(result.allBindings[0]!.kind).toBe('let')
    })

    it('analyzes a program with const declaration', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                id: { name: 'PI', loc: { start: loc(1, 6), end: loc(1, 8) } },
              },
            ],
            loc: range(1, 0, 1, 15),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.allBindings).toHaveLength(1)
      expect(result.allBindings[0]!.kind).toBe('const')
    })

    it('analyzes a program with var declaration', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'var',
            declarations: [
              {
                id: { name: 'legacy', loc: { start: loc(1, 4), end: loc(1, 10) } },
              },
            ],
            loc: range(1, 0, 1, 20),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.allBindings).toHaveLength(1)
      expect(result.allBindings[0]!.kind).toBe('var')
    })

    it('analyzes multiple variable declarations', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [
              { id: { name: 'a' } },
              { id: { name: 'b' } },
            ],
          },
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [{ id: { name: 'c' } }],
          },
        ],
        loc: range(0, 0, 3, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.allBindings).toHaveLength(3)
      const names = result.allBindings.map((b) => b.name)
      expect(names).toContain('a')
      expect(names).toContain('b')
      expect(names).toContain('c')
    })
  })

  describe('analyze - function scope', () => {
    it('creates a function scope for FunctionDeclaration', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'foo', loc: { start: loc(1, 9), end: loc(1, 12) } },
            params: [],
            body: { type: 'BlockStatement', body: [], loc: range(1, 15, 1, 17) },
            loc: range(1, 0, 1, 17),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.scopes.length).toBeGreaterThanOrEqual(2)
      const functionScopes = result.scopes.filter((s) => s.kind === 'function')
      expect(functionScopes).toHaveLength(1)
    })

    it('adds function parameters as bindings', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'add' },
            params: [{ name: 'a', loc: { start: loc(1, 13), end: loc(1, 14) } }, { name: 'b', loc: { start: loc(1, 16), end: loc(1, 17) } }],
            body: {
              type: 'BlockStatement',
              body: [
                { type: 'Identifier', name: 'a', loc: { start: loc(2, 11), end: loc(2, 12) } },
                { type: 'Identifier', name: 'b', loc: { start: loc(2, 15), end: loc(2, 16) } },
              ],
              loc: range(1, 20, 3, 1),
            },
            loc: range(1, 0, 3, 1),
          },
        ],
        loc: range(0, 0, 4, 0),
      }
      const result = analyzer.analyze(ast)
      const paramBindings = result.allBindings.filter((b) => b.kind === 'parameter')
      expect(paramBindings).toHaveLength(2)
      const paramNames = paramBindings.map((b) => b.name)
      expect(paramNames).toContain('a')
      expect(paramNames).toContain('b')
    })

    it('registers function name in parent scope', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'myFunc', loc: { start: loc(1, 9), end: loc(1, 15) } },
            params: [],
            body: { type: 'BlockStatement', body: [], loc: range(1, 18, 1, 20) },
            loc: range(1, 0, 1, 20),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const funcBinding = result.allBindings.find((b) => b.name === 'myFunc')
      expect(funcBinding).toBeDefined()
      expect(funcBinding!.kind).toBe('function')
      expect(funcBinding!.isUsed).toBe(true)
    })

    it('handles ArrowFunctionExpression', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                id: { name: 'fn' },
                init: {
                  type: 'ArrowFunctionExpression',
                  params: [{ name: 'x', loc: { start: loc(1, 14), end: loc(1, 15) } }],
                  body: { type: 'BlockStatement', body: [], loc: range(1, 20, 1, 22) },
                  loc: range(1, 10, 1, 22),
                },
              },
            ],
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const funcScopes = result.scopes.filter((s) => s.kind === 'function')
      expect(funcScopes).toHaveLength(1)
      const xBinding = result.allBindings.find((b) => b.name === 'x')
      expect(xBinding).toBeDefined()
      expect(xBinding!.kind).toBe('parameter')
    })
  })

  describe('analyze - block scope', () => {
    it('creates a block scope for BlockStatement', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'BlockStatement',
            body: [],
            loc: range(1, 0, 1, 2),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const blockScopes = result.scopes.filter((s) => s.kind === 'block')
      expect(blockScopes).toHaveLength(1)
    })

    it('adds let binding inside block scope', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'BlockStatement',
            body: [
              {
                type: 'VariableDeclaration',
                kind: 'let',
                declarations: [{ id: { name: 'blockVar' } }],
              },
            ],
            loc: range(1, 0, 3, 1),
          },
        ],
        loc: range(0, 0, 4, 0),
      }
      const result = analyzer.analyze(ast)
      const blockVar = result.allBindings.find((b) => b.name === 'blockVar')
      expect(blockVar).toBeDefined()
      expect(blockVar!.kind).toBe('let')
    })
  })

  describe('analyze - class scope', () => {
    it('creates a class scope for ClassDeclaration', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'ClassDeclaration',
            id: { name: 'Foo', loc: { start: loc(1, 6), end: loc(1, 9) } },
            body: { type: 'ClassBody', body: [], loc: range(1, 10, 1, 12) },
            loc: range(1, 0, 1, 12),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const classScopes = result.scopes.filter((s) => s.kind === 'class')
      expect(classScopes).toHaveLength(1)
      const classBinding = result.allBindings.find((b) => b.name === 'Foo')
      expect(classBinding).toBeDefined()
      expect(classBinding!.kind).toBe('class')
    })
  })

  describe('analyze - nested scopes', () => {
    it('handles nested functions', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'outer' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'FunctionDeclaration',
                  id: { name: 'inner' },
                  params: [],
                  body: {
                    type: 'BlockStatement',
                    body: [],
                    loc: range(3, 4, 3, 6),
                  },
                  loc: range(2, 2, 3, 6),
                },
              ],
              loc: range(1, 15, 4, 1),
            },
            loc: range(1, 0, 4, 1),
          },
        ],
        loc: range(0, 0, 5, 0),
      }
      const result = analyzer.analyze(ast)
      const functionScopes = result.scopes.filter((s) => s.kind === 'function')
      expect(functionScopes).toHaveLength(2)
    })

    it('handles deeply nested scopes', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'a' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'FunctionDeclaration',
                  id: { name: 'b' },
                  params: [],
                  body: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'BlockStatement',
                        body: [],
                        loc: range(4, 4, 4, 6),
                      },
                    ],
                    loc: range(3, 2, 5, 2),
                  },
                  loc: range(2, 2, 5, 2),
                },
              ],
              loc: range(1, 12, 6, 1),
            },
            loc: range(1, 0, 6, 1),
          },
        ],
        loc: range(0, 0, 7, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.scopes.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('analyze - identifier references', () => {
    it('marks binding as used when referenced', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [{ id: { name: 'x', loc: { start: loc(1, 4), end: loc(1, 5) } } }],
          },
          { type: 'Identifier', name: 'x', loc: { start: loc(2, 0), end: loc(2, 1) } },
        ],
        loc: range(0, 0, 3, 0),
      }
      const result = analyzer.analyze(ast)
      const xBinding = result.allBindings.find((b) => b.name === 'x')
      expect(xBinding!.isUsed).toBe(true)
      expect(xBinding!.references).toHaveLength(1)
    })

    it('tracks multiple references', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [{ id: { name: 'y' } }],
          },
          { type: 'Identifier', name: 'y', loc: { start: loc(2, 0), end: loc(2, 1) } },
          { type: 'Identifier', name: 'y', loc: { start: loc(3, 0), end: loc(3, 1) } },
        ],
        loc: range(0, 0, 4, 0),
      }
      const result = analyzer.analyze(ast)
      const yBinding = result.allBindings.find((b) => b.name === 'y')
      expect(yBinding!.references).toHaveLength(2)
    })
  })

  describe('analyze - loop and catch scopes', () => {
    it('creates loop scope for ForStatement', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'ForStatement',
            init: {
              type: 'VariableDeclaration',
              kind: 'let',
              declarations: [{ id: { name: 'i' } }],
            },
            test: { type: 'Identifier', name: 'i' },
            update: { type: 'Identifier', name: 'i' },
            body: { type: 'BlockStatement', body: [], loc: range(1, 20, 1, 22) },
            loc: range(1, 0, 1, 22),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const loopScopes = result.scopes.filter((s) => s.kind === 'loop')
      expect(loopScopes).toHaveLength(1)
    })

    it('creates catch scope for CatchClause', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'TryStatement',
            block: { type: 'BlockStatement', body: [], loc: range(1, 4, 1, 6) },
            handler: {
              type: 'CatchClause',
              param: { name: 'err', loc: { start: loc(2, 10), end: loc(2, 13) } },
              body: {
                type: 'BlockStatement',
                body: [],
                loc: range(2, 15, 2, 17),
              },
              loc: range(2, 4, 2, 17),
            },
            loc: range(1, 0, 2, 17),
          },
        ],
        loc: range(0, 0, 3, 0),
      }
      const result = analyzer.analyze(ast)
      const catchScopes = result.scopes.filter((s) => s.kind === 'catch')
      expect(catchScopes).toHaveLength(1)
      const errBinding = result.allBindings.find((b) => b.name === 'err')
      expect(errBinding).toBeDefined()
      expect(errBinding!.kind).toBe('parameter')
    })
  })

  describe('addBinding', () => {
    it('adds a binding to a scope', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const binding = makeBinding('test', 'let')
      analyzer.addBinding(scope, binding)
      expect(scope.bindings.get('test')).toBe(binding)
    })

    it('overwrites existing binding with same name', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const first = makeBinding('x', 'let')
      const second = makeBinding('x', 'const')
      analyzer.addBinding(scope, first)
      analyzer.addBinding(scope, second)
      expect(scope.bindings.get('x')).toBe(second)
    })

    it('adds multiple different bindings', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      analyzer.addBinding(scope, makeBinding('a', 'let'))
      analyzer.addBinding(scope, makeBinding('b', 'const'))
      analyzer.addBinding(scope, makeBinding('c', 'var'))
      expect(scope.bindings.size).toBe(3)
    })
  })

  describe('findBinding', () => {
    it('finds binding in current scope', () => {
      const parent: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const child: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent,
        range: range(1, 0, 1, 10),
      }
      const binding = makeBinding('x', 'let')
      child.bindings.set('x', binding)
      const found = analyzer.findBinding('x', child)
      expect(found).toBe(binding)
    })

    it('finds binding in parent scope', () => {
      const parent: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const child: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent,
        range: range(1, 0, 1, 10),
      }
      const binding = makeBinding('y', 'const')
      parent.bindings.set('y', binding)
      const found = analyzer.findBinding('y', child)
      expect(found).toBe(binding)
    })

    it('finds binding in grandparent scope', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const mid: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(1, 0, 1, 10),
      }
      const leaf: ScopeNode = {
        kind: 'block',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: mid,
        range: range(2, 0, 2, 5),
      }
      const binding = makeBinding('z', 'var')
      root.bindings.set('z', binding)
      const found = analyzer.findBinding('z', leaf)
      expect(found).toBe(binding)
    })

    it('returns undefined when binding not found', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const found = analyzer.findBinding('nonexistent', scope)
      expect(found).toBeUndefined()
    })

    it('returns undefined for empty scope chain', () => {
      const scope: ScopeNode = {
        kind: 'global',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      expect(analyzer.findBinding('missing', scope)).toBeUndefined()
    })
  })

  describe('resolveReference', () => {
    it('resolves reference to binding in same scope', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const binding = makeBinding('ref', 'let')
      scope.bindings.set('ref', binding)
      const resolved = analyzer.resolveReference('ref', scope)
      expect(resolved).toBe(binding)
    })

    it('resolves reference to binding in parent scope', () => {
      const parent: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const child: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent,
        range: range(1, 0, 1, 10),
      }
      const binding = makeBinding('outer', 'const')
      parent.bindings.set('outer', binding)
      const resolved = analyzer.resolveReference('outer', child)
      expect(resolved).toBe(binding)
    })

    it('returns undefined for unresolved reference', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      expect(analyzer.resolveReference('nothing', scope)).toBeUndefined()
    })
  })

  describe('getUnusedBindings', () => {
    it('returns unused bindings', () => {
      const used = makeBinding('used', 'let')
      used.isUsed = true
      const unused = makeBinding('unused', 'let')
      const result = analyzer.getUnusedBindingsFromList([used, unused])
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('unused')
    })

    it('returns empty when all bindings are used', () => {
      const a = makeBinding('a', 'let')
      a.isUsed = true
      const b = makeBinding('b', 'const')
      b.isUsed = true
      expect(analyzer.getUnusedBindingsFromList([a, b])).toHaveLength(0)
    })

    it('returns all when none are used', () => {
      const bindings = [makeBinding('a', 'let'), makeBinding('b', 'const'), makeBinding('c', 'var')]
      expect(analyzer.getUnusedBindingsFromList(bindings)).toHaveLength(3)
    })

    it('handles empty list', () => {
      expect(analyzer.getUnusedBindingsFromList([])).toHaveLength(0)
    })
  })

  describe('detectShadows', () => {
    it('detects simple variable shadowing', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      root.bindings.set('x', makeBinding('x', 'let'))

      const child: ScopeNode = {
        kind: 'block',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(2, 0, 5, 1),
      }
      child.bindings.set('x', makeBinding('x', 'const'))
      root.children.push(child)

      const shadows = analyzer.detectShadows(root)
      expect(shadows).toHaveLength(1)
      expect(shadows[0]!.name).toBe('x')
      expect(shadows[0]!.outerKind).toBe('let')
      expect(shadows[0]!.innerKind).toBe('const')
    })

    it('detects var shadowing let', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      root.bindings.set('val', makeBinding('val', 'let'))

      const child: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(2, 0, 5, 1),
      }
      child.bindings.set('val', makeBinding('val', 'var'))
      root.children.push(child)

      const shadows = analyzer.detectShadows(root)
      expect(shadows).toHaveLength(1)
      expect(shadows[0]!.outerKind).toBe('let')
      expect(shadows[0]!.innerKind).toBe('var')
    })

    it('detects let shadowing var', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      root.bindings.set('temp', makeBinding('temp', 'var'))

      const child: ScopeNode = {
        kind: 'block',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(2, 0, 5, 1),
      }
      child.bindings.set('temp', makeBinding('temp', 'let'))
      root.children.push(child)

      const shadows = analyzer.detectShadows(root)
      expect(shadows).toHaveLength(1)
      expect(shadows[0]!.outerKind).toBe('var')
      expect(shadows[0]!.innerKind).toBe('let')
    })

    it('detects nested function params shadowing outer vars', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      root.bindings.set('count', makeBinding('count', 'let'))

      const funcScope: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(2, 0, 5, 1),
      }
      funcScope.bindings.set('count', makeBinding('count', 'parameter'))
      root.children.push(funcScope)

      const shadows = analyzer.detectShadows(root)
      expect(shadows).toHaveLength(1)
      expect(shadows[0]!.name).toBe('count')
      expect(shadows[0]!.outerKind).toBe('let')
      expect(shadows[0]!.innerKind).toBe('parameter')
      expect(shadows[0]!.outerScope).toBe('module')
      expect(shadows[0]!.innerScope).toBe('function')
    })

    it('returns empty for no shadowing', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      root.bindings.set('a', makeBinding('a', 'let'))

      const child: ScopeNode = {
        kind: 'block',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(2, 0, 5, 1),
      }
      child.bindings.set('b', makeBinding('b', 'const'))
      root.children.push(child)

      expect(analyzer.detectShadows(root)).toHaveLength(0)
    })

    it('detects multiple levels of shadowing', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      root.bindings.set('x', makeBinding('x', 'var'))

      const mid: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(1, 0, 8, 1),
      }
      mid.bindings.set('x', makeBinding('x', 'let'))
      root.children.push(mid)

      const leaf: ScopeNode = {
        kind: 'block',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: mid,
        range: range(3, 0, 6, 1),
      }
      leaf.bindings.set('x', makeBinding('x', 'const'))
      mid.children.push(leaf)

      const shadows = analyzer.detectShadows(root)
      expect(shadows.length).toBeGreaterThanOrEqual(2)
      const xShadows = shadows.filter((s) => s.name === 'x')
      expect(xShadows.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('getStatistics', () => {
    it('computes statistics from analysis result', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [
              { id: { name: 'used', loc: { start: loc(1, 4), end: loc(1, 8) } } },
              { id: { name: 'unused', loc: { start: loc(2, 4), end: loc(2, 10) } } },
            ],
          },
          { type: 'Identifier', name: 'used', loc: { start: loc(3, 0), end: loc(3, 4) } },
        ],
        loc: range(0, 0, 4, 0),
      }
      const result = analyzer.analyze(ast)
      const stats = analyzer.getStatistics(result)
      expect(stats.totalScopes).toBe(1)
      expect(stats.totalBindings).toBe(2)
      expect(stats.usedBindings).toBe(1)
      expect(stats.unusedBindings).toBe(1)
      expect(stats.scopeDepth).toBe(0)
    })

    it('computes scope depth with nested scopes', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'BlockStatement',
                  body: [],
                  loc: range(3, 2, 3, 4),
                },
              ],
              loc: range(1, 12, 4, 1),
            },
            loc: range(1, 0, 4, 1),
          },
        ],
        loc: range(0, 0, 5, 0),
      }
      const result = analyzer.analyze(ast)
      const stats = analyzer.getStatistics(result)
      expect(stats.scopeDepth).toBeGreaterThanOrEqual(2)
    })

    it('counts shadowed bindings in statistics', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [{ id: { name: 'x' } }],
          },
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'VariableDeclaration',
                  kind: 'let',
                  declarations: [{ id: { name: 'x' } }],
                },
              ],
              loc: range(2, 2, 4, 3),
            },
            loc: range(2, 0, 4, 3),
          },
        ],
        loc: range(0, 0, 5, 0),
      }
      const result = analyzer.analyze(ast)
      const stats = analyzer.getStatistics(result)
      expect(stats.shadowedBindings).toBeGreaterThanOrEqual(1)
    })

    it('handles empty program statistics', () => {
      const result = analyzer.analyze({ type: 'Program', body: [], loc: range(0, 0, 1, 0) })
      const stats = analyzer.getStatistics(result)
      expect(stats.totalScopes).toBe(1)
      expect(stats.totalBindings).toBe(0)
      expect(stats.usedBindings).toBe(0)
      expect(stats.unusedBindings).toBe(0)
      expect(stats.shadowedBindings).toBe(0)
      expect(stats.scopeDepth).toBe(0)
    })

    it('computes used/unused ratio correctly', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [
              { id: { name: 'a' } },
              { id: { name: 'b' } },
              { id: { name: 'c' } },
            ],
          },
          { type: 'Identifier', name: 'a', loc: { start: loc(2, 0), end: loc(2, 1) } },
          { type: 'Identifier', name: 'c', loc: { start: loc(3, 0), end: loc(3, 1) } },
        ],
        loc: range(0, 0, 4, 0),
      }
      const result = analyzer.analyze(ast)
      const stats = analyzer.getStatistics(result)
      expect(stats.totalBindings).toBe(3)
      expect(stats.usedBindings).toBe(2)
      expect(stats.unusedBindings).toBe(1)
    })
  })

  describe('findScopeAt', () => {
    it('finds the module scope for top-level location', () => {
      const ast = {
        type: 'Program',
        body: [],
        loc: range(0, 0, 10, 0),
      }
      const result = analyzer.analyze(ast)
      const found = analyzer.findScopeAt(loc(5, 0), result.scopes)
      expect(found).toBeDefined()
      expect(found!.kind).toBe('module')
    })

    it('finds innermost scope for nested location', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [],
              loc: range(2, 0, 5, 1),
            },
            loc: range(1, 0, 5, 1),
          },
        ],
        loc: range(0, 0, 6, 0),
      }
      const result = analyzer.analyze(ast)
      const found = analyzer.findScopeAt(loc(3, 0), result.scopes)
      expect(found).toBeDefined()
      expect(found!.kind).toBe('function')
    })

    it('returns undefined when location is outside all scopes', () => {
      const ast = {
        type: 'Program',
        body: [],
        loc: range(1, 0, 5, 0),
      }
      const result = analyzer.analyze(ast)
      const found = analyzer.findScopeAt(loc(0, 0), result.scopes)
      expect(found).toBeUndefined()
    })

    it('finds correct scope among siblings', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'BlockStatement',
            body: [],
            loc: range(1, 0, 3, 1),
          },
          {
            type: 'BlockStatement',
            body: [],
            loc: range(4, 0, 6, 1),
          },
        ],
        loc: range(0, 0, 7, 0),
      }
      const result = analyzer.analyze(ast)
      const found = analyzer.findScopeAt(loc(5, 0), result.scopes)
      expect(found).toBeDefined()
      expect(found!.kind).toBe('block')
    })
  })

  describe('getScopeChain', () => {
    it('returns single scope for root', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const chain = analyzer.getScopeChain(scope)
      expect(chain).toHaveLength(1)
      expect(chain[0]).toBe(scope)
    })

    it('returns chain from root to leaf', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const mid: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(1, 0, 1, 10),
      }
      const leaf: ScopeNode = {
        kind: 'block',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: mid,
        range: range(2, 0, 2, 5),
      }
      const chain = analyzer.getScopeChain(leaf)
      expect(chain).toHaveLength(3)
      expect(chain[0]).toBe(root)
      expect(chain[1]).toBe(mid)
      expect(chain[2]).toBe(leaf)
    })
  })

  describe('parent-child relationships', () => {
    it('maintains parent references', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [],
              loc: range(1, 12, 1, 14),
            },
            loc: range(1, 0, 1, 14),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const funcScope = result.scopes.find((s) => s.kind === 'function')
      expect(funcScope).toBeDefined()
      expect(funcScope!.parent).toBeDefined()
      expect(funcScope!.parent!.kind).toBe('module')
    })

    it('maintains children references', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'BlockStatement',
            body: [],
            loc: range(1, 0, 1, 2),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const moduleScope = result.scopes.find((s) => s.kind === 'module')
      expect(moduleScope).toBeDefined()
      expect(moduleScope!.children.length).toBeGreaterThanOrEqual(1)
    })

    it('root scope has null parent', () => {
      const ast = { type: 'Program', body: [], loc: range(0, 0, 1, 0) }
      const result = analyzer.analyze(ast)
      const rootScope = result.scopes[0]
      expect(rootScope!.parent).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('handles empty AST', () => {
      const result = analyzer.analyze({ type: 'Program', body: [], loc: range(0, 0, 0, 0) })
      expect(result.scopes).toHaveLength(1)
      expect(result.allBindings).toHaveLength(0)
      expect(result.unusedBindings).toHaveLength(0)
      expect(result.shadowedBindings).toHaveLength(0)
    })

    it('handles no bindings', () => {
      const ast = {
        type: 'Program',
        body: [
          { type: 'BlockStatement', body: [], loc: range(1, 0, 1, 2) },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.allBindings).toHaveLength(0)
      expect(result.unusedBindings).toHaveLength(0)
    })

    it('handles same name in different scopes without shadowing', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn1' },
            params: [{ name: 'x', loc: { start: loc(1, 13), end: loc(1, 14) } }],
            body: {
              type: 'BlockStatement',
              body: [],
              loc: range(1, 16, 1, 18),
            },
            loc: range(1, 0, 1, 18),
          },
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn2' },
            params: [{ name: 'x', loc: { start: loc(2, 13), end: loc(2, 14) } }],
            body: {
              type: 'BlockStatement',
              body: [],
              loc: range(2, 16, 2, 18),
            },
            loc: range(2, 0, 2, 18),
          },
        ],
        loc: range(0, 0, 3, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.shadowedBindings).toHaveLength(0)
    })

    it('handles global scope only', () => {
      const result = analyzer.analyze({ type: 'Program', body: [], loc: range(0, 0, 1, 0) })
      expect(result.scopes).toHaveLength(1)
      expect(result.scopes[0]!.kind).toBe('module')
    })

    it('handles WhileStatement', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'WhileStatement',
            test: { type: 'Identifier', name: 'cond' },
            body: { type: 'BlockStatement', body: [], loc: range(1, 15, 1, 17) },
            loc: range(1, 0, 1, 17),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const loopScopes = result.scopes.filter((s) => s.kind === 'loop')
      expect(loopScopes).toHaveLength(1)
    })

    it('handles DoWhileStatement', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'DoWhileStatement',
            test: { type: 'Identifier', name: 'cond' },
            body: { type: 'BlockStatement', body: [], loc: range(1, 3, 1, 5) },
            loc: range(1, 0, 1, 20),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const loopScopes = result.scopes.filter((s) => s.kind === 'loop')
      expect(loopScopes).toHaveLength(1)
    })

    it('handles ForInStatement', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'ForInStatement',
            left: { type: 'Identifier', name: 'key' },
            right: { type: 'Identifier', name: 'obj' },
            body: { type: 'BlockStatement', body: [], loc: range(1, 18, 1, 20) },
            loc: range(1, 0, 1, 20),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.scopes.filter((s) => s.kind === 'loop')).toHaveLength(1)
    })

    it('handles ForOfStatement', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'ForOfStatement',
            left: { type: 'Identifier', name: 'item' },
            right: { type: 'Identifier', name: 'arr' },
            body: { type: 'BlockStatement', body: [], loc: range(1, 19, 1, 21) },
            loc: range(1, 0, 1, 21),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.scopes.filter((s) => s.kind === 'loop')).toHaveLength(1)
    })

    it('handles FunctionExpression', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                id: { name: 'fn' },
                init: {
                  type: 'FunctionExpression',
                  id: { name: 'namedFn' },
                  params: [],
                  body: { type: 'BlockStatement', body: [], loc: range(1, 25, 1, 27) },
                  loc: range(1, 10, 1, 27),
                },
              },
            ],
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.scopes.filter((s) => s.kind === 'function')).toHaveLength(1)
    })

    it('handles ClassExpression', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                id: { name: 'MyClass' },
                init: {
                  type: 'ClassExpression',
                  id: { name: 'InternalName' },
                  body: { type: 'ClassBody', body: [], loc: range(1, 30, 1, 32) },
                  loc: range(1, 10, 1, 32),
                },
              },
            ],
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.scopes.filter((s) => s.kind === 'class')).toHaveLength(1)
    })

    it('handles ImportDeclaration', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'ImportDeclaration',
            source: { type: 'StringLiteral', value: 'fs' },
            specifiers: [
              { type: 'ImportDefaultSpecifier', local: { name: 'fs', loc: { start: loc(1, 9), end: loc(1, 11) } } },
            ],
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const importBinding = result.allBindings.find((b) => b.name === 'fs')
      expect(importBinding).toBeDefined()
      expect(importBinding!.kind).toBe('import')
    })

    it('handles TryStatement with handler', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'TryStatement',
            block: {
              type: 'BlockStatement',
              body: [],
              loc: range(1, 4, 1, 6),
            },
            handler: {
              type: 'CatchClause',
              param: { name: 'e' },
              body: {
                type: 'BlockStatement',
                body: [],
                loc: range(2, 10, 2, 12),
              },
              loc: range(2, 4, 2, 12),
            },
            loc: range(1, 0, 2, 12),
          },
        ],
        loc: range(0, 0, 3, 0),
      }
      const result = analyzer.analyze(ast)
      const catchScopes = result.scopes.filter((s) => s.kind === 'catch')
      expect(catchScopes).toHaveLength(1)
    })

    it('handles node without loc gracefully', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [{ id: { name: 'x' } }],
          },
        ],
      }
      const result = analyzer.analyze(ast)
      expect(result.allBindings).toHaveLength(1)
      expect(result.allBindings[0]!.declaredAt).toEqual({ line: 0, column: 0 })
    })
  })

  describe('getShadowedBindings from result', () => {
    it('returns shadowed bindings from analysis result', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [{ id: { name: 'x' } }],
          },
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'VariableDeclaration',
                  kind: 'const',
                  declarations: [{ id: { name: 'x' } }],
                },
              ],
              loc: range(3, 2, 5, 3),
            },
            loc: range(2, 0, 5, 3),
          },
        ],
        loc: range(0, 0, 6, 0),
      }
      const result = analyzer.analyze(ast)
      const shadows = analyzer.getShadowedBindings(result)
      expect(shadows.length).toBeGreaterThanOrEqual(1)
      const xShadow = shadows.find((s) => s.name === 'x')
      expect(xShadow).toBeDefined()
      expect(xShadow!.outerKind).toBe('let')
      expect(xShadow!.innerKind).toBe('const')
    })
  })

  describe('analyze - complex nesting with references', () => {
    it('tracks references across scope boundaries', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [{ id: { name: 'outer', loc: { start: loc(1, 6), end: loc(1, 11) } } }],
          },
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                { type: 'Identifier', name: 'outer', loc: { start: loc(3, 4), end: loc(3, 9) } },
              ],
              loc: range(2, 12, 4, 1),
            },
            loc: range(2, 0, 4, 1),
          },
        ],
        loc: range(0, 0, 5, 0),
      }
      const result = analyzer.analyze(ast)
      const outerBinding = result.allBindings.find((b) => b.name === 'outer')
      expect(outerBinding).toBeDefined()
      expect(outerBinding!.isUsed).toBe(true)
      expect(outerBinding!.references).toHaveLength(1)
    })

    it('complex nested program analysis', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [{ id: { name: 'a' } }],
          },
          {
            type: 'FunctionDeclaration',
            id: { name: 'foo' },
            params: [{ name: 'b' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'VariableDeclaration',
                  kind: 'let',
                  declarations: [{ id: { name: 'c' } }],
                },
                { type: 'Identifier', name: 'a' },
                { type: 'Identifier', name: 'b' },
                { type: 'Identifier', name: 'c' },
              ],
              loc: range(2, 2, 6, 3),
            },
            loc: range(2, 0, 6, 3),
          },
        ],
        loc: range(0, 0, 7, 0),
      }
      const result = analyzer.analyze(ast)
      expect(result.allBindings.length).toBeGreaterThanOrEqual(4)
      const stats = analyzer.getStatistics(result)
      expect(stats.usedBindings).toBeGreaterThanOrEqual(3)
    })
  })

  describe('additional coverage tests', () => {
    it('findScopeAt prefers deeper scope over shallower', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'BlockStatement',
                  body: [],
                  loc: range(3, 2, 4, 3),
                },
              ],
              loc: range(2, 0, 5, 1),
            },
            loc: range(1, 0, 5, 1),
          },
        ],
        loc: range(0, 0, 6, 0),
      }
      const result = analyzer.analyze(ast)
      const found = analyzer.findScopeAt(loc(3, 5), result.scopes)
      expect(found).toBeDefined()
      const depth = result.scopes.map((s) => {
        let d = 0
        let c: ScopeNode | null = s
        while (c.parent !== null) { d++; c = c.parent }
        return d
      })
      const maxDepth = Math.max(...depth)
      const foundDepth = (() => {
        let d = 0
        let c: ScopeNode | null = found!
        while (c.parent !== null) { d++; c = c.parent }
        return d
      })()
      expect(foundDepth).toBe(maxDepth)
    })

    it('getScopeChain for module root is length 1', () => {
      const result = analyzer.analyze({ type: 'Program', body: [], loc: range(0, 0, 1, 0) })
      const root = result.scopes[0]!
      expect(analyzer.getScopeChain(root)).toHaveLength(1)
    })

    it('detectShadows with no children returns empty', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      scope.bindings.set('x', makeBinding('x', 'let'))
      expect(analyzer.detectShadows(scope)).toHaveLength(0)
    })

    it('analyze detects unused function parameter', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'fn' },
            params: [{ name: 'unusedParam', loc: { start: loc(1, 12), end: loc(1, 24) } }],
            body: {
              type: 'BlockStatement',
              body: [],
              loc: range(1, 26, 1, 28),
            },
            loc: range(1, 0, 1, 28),
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const param = result.allBindings.find((b) => b.name === 'unusedParam')
      expect(param).toBeDefined()
      expect(param!.isUsed).toBe(false)
      expect(result.unusedBindings).toContain(param)
    })

    it('analyze marks referenced parameter as used', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'add' },
            params: [{ name: 'x' }, { name: 'y' }],
            body: {
              type: 'BlockStatement',
              body: [
                { type: 'Identifier', name: 'x' },
                { type: 'Identifier', name: 'y' },
              ],
              loc: range(1, 15, 3, 1),
            },
            loc: range(1, 0, 3, 1),
          },
        ],
        loc: range(0, 0, 4, 0),
      }
      const result = analyzer.analyze(ast)
      const xParam = result.allBindings.find((b) => b.name === 'x' && b.kind === 'parameter')
      const yParam = result.allBindings.find((b) => b.name === 'y' && b.kind === 'parameter')
      expect(xParam!.isUsed).toBe(true)
      expect(yParam!.isUsed).toBe(true)
    })

    it('addBinding then findBinding retrieves it', () => {
      const scope: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 1, 0),
      }
      const b = makeBinding('test', 'const', 5, 10)
      analyzer.addBinding(scope, b)
      const found = analyzer.findBinding('test', scope)
      expect(found).toBe(b)
      expect(found!.declaredAt).toEqual({ line: 5, column: 10 })
    })

    it('getStatistics with nested scopes calculates max depth', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'outer' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'FunctionDeclaration',
                  id: { name: 'middle' },
                  params: [],
                  body: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'FunctionDeclaration',
                        id: { name: 'inner' },
                        params: [],
                        body: {
                          type: 'BlockStatement',
                          body: [],
                          loc: range(5, 4, 6, 5),
                        },
                        loc: range(4, 2, 6, 5),
                      },
                    ],
                    loc: range(3, 2, 7, 1),
                  },
                  loc: range(2, 2, 7, 1),
                },
              ],
              loc: range(1, 14, 8, 1),
            },
            loc: range(1, 0, 8, 1),
          },
        ],
        loc: range(0, 0, 9, 0),
      }
      const result = analyzer.analyze(ast)
      const stats = analyzer.getStatistics(result)
      expect(stats.scopeDepth).toBeGreaterThanOrEqual(3)
      expect(stats.totalScopes).toBeGreaterThanOrEqual(4)
    })

    it('findScopeAt returns undefined for empty scopes array', () => {
      expect(analyzer.findScopeAt(loc(0, 0), [])).toBeUndefined()
    })

    it('resolveReference walks scope chain correctly', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      const binding = makeBinding('chainVar', 'const')
      root.bindings.set('chainVar', binding)

      const mid: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(2, 0, 5, 1),
      }
      const leaf: ScopeNode = {
        kind: 'block',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: mid,
        range: range(3, 0, 4, 1),
      }
      expect(analyzer.resolveReference('chainVar', leaf)).toBe(binding)
      expect(analyzer.resolveReference('chainVar', mid)).toBe(binding)
      expect(analyzer.resolveReference('chainVar', root)).toBe(binding)
    })

    it('handles CatchClause without param', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'TryStatement',
            block: { type: 'BlockStatement', body: [], loc: range(1, 4, 1, 6) },
            handler: {
              type: 'CatchClause',
              body: {
                type: 'BlockStatement',
                body: [],
                loc: range(2, 4, 2, 6),
              },
              loc: range(2, 0, 2, 6),
            },
            loc: range(1, 0, 2, 6),
          },
        ],
        loc: range(0, 0, 3, 0),
      }
      const result = analyzer.analyze(ast)
      const catchScopes = result.scopes.filter((s) => s.kind === 'catch')
      expect(catchScopes).toHaveLength(1)
      expect(catchScopes[0]!.bindings.size).toBe(0)
    })

    it('analyzes import with multiple specifiers', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'ImportDeclaration',
            source: { type: 'StringLiteral', value: 'path' },
            specifiers: [
              { type: 'ImportDefaultSpecifier', local: { name: 'path', loc: { start: loc(1, 9), end: loc(1, 13) } } },
              { type: 'ImportSpecifier', local: { name: 'join', loc: { start: loc(1, 16), end: loc(1, 20) } } },
            ],
          },
        ],
        loc: range(0, 0, 2, 0),
      }
      const result = analyzer.analyze(ast)
      const importBindings = result.allBindings.filter((b) => b.kind === 'import')
      expect(importBindings).toHaveLength(2)
      const names = importBindings.map((b) => b.name)
      expect(names).toContain('path')
      expect(names).toContain('join')
    })

    it('detectShadows does not duplicate entries', () => {
      const root: ScopeNode = {
        kind: 'module',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: null,
        range: range(0, 0, 10, 0),
      }
      root.bindings.set('dup', makeBinding('dup', 'let'))

      const child: ScopeNode = {
        kind: 'function',
        bindings: new Map<string, Binding>(),
        children: [],
        parent: root,
        range: range(2, 0, 5, 1),
      }
      child.bindings.set('dup', makeBinding('dup', 'var'))
      root.children.push(child)

      const shadows = analyzer.detectShadows(root)
      const dupShadows = shadows.filter((s) => s.name === 'dup')
      expect(dupShadows).toHaveLength(1)
    })

    it('getUnusedBindingsFromList returns only unused', () => {
      const a = makeBinding('a', 'let')
      a.isUsed = true
      const b = makeBinding('b', 'const')
      const c = makeBinding('c', 'var')
      c.isUsed = true
      const d = makeBinding('d', 'parameter')
      const result = analyzer.getUnusedBindingsFromList([a, b, c, d])
      expect(result).toHaveLength(2)
      expect(result.map((b) => b.name)).toEqual(['b', 'd'])
    })
  })
})
