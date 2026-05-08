import { describe, it, expect, beforeEach } from 'vitest'
import { ScopeResolver, DEFAULT_SCOPE_CONFIG } from '../../src/core/scope-resolver/scope-resolver.js'
import type {
  Scope,
  Binding,
  ScopeType,
  BindingKind,
  ResolutionResult,
  ScopeNode,
} from '../../src/core/scope-resolver/scope-resolver.js'

describe('ScopeResolver', () => {
  let resolver: ScopeResolver

  beforeEach(() => {
    resolver = new ScopeResolver()
  })

  describe('constructor and config', () => {
    it('creates resolver with default config', () => {
      const r = new ScopeResolver()
      expect(r).toBeDefined()
      const stats = r.getStatistics()
      expect(stats.totalScopes).toBe(0)
      expect(stats.totalBindings).toBe(0)
    })

    it('merges custom config with defaults', () => {
      const r = new ScopeResolver({ allowRedeclare: true })
      r.pushScope('root', 'global')
      const b1 = r.declare('x', 'let')
      const b2 = r.declare('x', 'const')
      expect(b2.kind).toBe('const')
      expect(b2).not.toBe(b1)
    })

    it('respects maxScopeDepth config', () => {
      const r = new ScopeResolver({ maxScopeDepth: 3 })
      r.pushScope('a', 'global')
      r.pushScope('b', 'function')
      r.pushScope('c', 'block')
      expect(() => r.pushScope('d', 'block')).toThrow(
        'Maximum scope depth of 3 exceeded',
      )
    })

    it('allowRedeclare defaults to false', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      expect(() => resolver.declare('x', 'let')).toThrow()
    })
  })

  describe('pushScope', () => {
    it('creates and returns a new scope', () => {
      const scope = resolver.pushScope('global', 'global')
      expect(scope).toBeDefined()
      expect(scope.name).toBe('global')
      expect(scope.type).toBe('global')
    })

    it('initializes scope with empty bindings', () => {
      const scope = resolver.pushScope('mod', 'module')
      expect(scope.bindings).toBeInstanceOf(Map)
      expect(scope.bindings.size).toBe(0)
    })

    it('initializes scope with empty children', () => {
      const scope = resolver.pushScope('root', 'global')
      expect(scope.children).toEqual([])
    })

    it('sets parent for child scopes', () => {
      const parent = resolver.pushScope('root', 'global')
      const child = resolver.pushScope('fn', 'function')
      expect(child.parent).toBe(parent)
    })

    it('adds child to parent children array', () => {
      const parent = resolver.pushScope('root', 'global')
      const child = resolver.pushScope('fn', 'function')
      expect(parent.children).toContain(child)
    })

    it('root scope has no parent', () => {
      const scope = resolver.pushScope('root', 'module')
      expect(scope.parent).toBeUndefined()
    })

    it('updates currentScope after push', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      expect(resolver.currentScope()?.name).toBe('b')
    })

    it('tracks all created scopes', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.pushScope('c', 'block')
      const stats = resolver.getStatistics()
      expect(stats.totalScopes).toBe(3)
    })
  })

  describe('popScope', () => {
    it('removes and returns the current scope', () => {
      const scope = resolver.pushScope('root', 'global')
      const popped = resolver.popScope()
      expect(popped).toBe(scope)
    })

    it('returns undefined when stack is empty', () => {
      expect(resolver.popScope()).toBeUndefined()
    })

    it('restores previous scope as current', () => {
      resolver.pushScope('root', 'global')
      resolver.pushScope('fn', 'function')
      resolver.popScope()
      expect(resolver.currentScope()?.name).toBe('root')
    })

    it('pops correct scope after multiple pushes', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.pushScope('c', 'block')
      const popped = resolver.popScope()
      expect(popped?.name).toBe('c')
      expect(resolver.currentScope()?.name).toBe('b')
    })

    it('does not remove from allScopes tracking', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.popScope()
      const stats = resolver.getStatistics()
      expect(stats.totalScopes).toBe(2)
    })
  })

  describe('currentScope', () => {
    it('returns undefined when no scopes pushed', () => {
      expect(resolver.currentScope()).toBeUndefined()
    })

    it('returns the most recently pushed scope', () => {
      resolver.pushScope('first', 'global')
      resolver.pushScope('second', 'function')
      expect(resolver.currentScope()?.name).toBe('second')
    })

    it('returns parent after popping child', () => {
      resolver.pushScope('parent', 'global')
      resolver.pushScope('child', 'block')
      resolver.popScope()
      expect(resolver.currentScope()?.name).toBe('parent')
    })
  })

  describe('declare', () => {
    beforeEach(() => {
      resolver.pushScope('root', 'global')
    })

    it('declares a var binding', () => {
      const b = resolver.declare('x', 'var')
      expect(b.name).toBe('x')
      expect(b.kind).toBe('var')
    })

    it('declares a let binding', () => {
      const b = resolver.declare('y', 'let')
      expect(b.kind).toBe('let')
    })

    it('declares a const binding', () => {
      const b = resolver.declare('z', 'const')
      expect(b.kind).toBe('const')
    })

    it('declares a function binding', () => {
      const b = resolver.declare('fn', 'function')
      expect(b.kind).toBe('function')
    })

    it('declares a class binding', () => {
      const b = resolver.declare('Cls', 'class')
      expect(b.kind).toBe('class')
    })

    it('declares a param binding', () => {
      const b = resolver.declare('p', 'param')
      expect(b.kind).toBe('param')
    })

    it('defaults initialized to false', () => {
      const b = resolver.declare('x', 'let')
      expect(b.initialized).toBe(false)
    })

    it('sets initialized when specified', () => {
      const b = resolver.declare('x', 'let', true)
      expect(b.initialized).toBe(true)
    })

    it('returns the binding object', () => {
      const b = resolver.declare('test', 'let')
      expect(b).toBeDefined()
      expect(b.name).toBe('test')
    })

    it('adds binding to scope bindings map', () => {
      const scope = resolver.currentScope()!
      resolver.declare('myVar', 'let')
      expect(scope.bindings.has('myVar')).toBe(true)
    })

    it('sets binding scope reference', () => {
      const scope = resolver.currentScope()!
      const b = resolver.declare('ref', 'const')
      expect(b.scope).toBe(scope)
    })

    it('throws on redeclaration by default', () => {
      resolver.declare('dup', 'let')
      expect(() => resolver.declare('dup', 'let')).toThrow(
        "Variable 'dup' is already declared",
      )
    })

    it('throws on redeclaration with different kind', () => {
      resolver.declare('dup', 'let')
      expect(() => resolver.declare('dup', 'const')).toThrow()
    })

    it('allows redeclaration when config allows', () => {
      const r = new ScopeResolver({ allowRedeclare: true })
      r.pushScope('root', 'global')
      r.declare('x', 'let')
      const b = r.declare('x', 'const')
      expect(b.kind).toBe('const')
    })

    it('redeclared binding replaces old one in scope', () => {
      const r = new ScopeResolver({ allowRedeclare: true })
      r.pushScope('root', 'global')
      r.declare('x', 'let')
      r.declare('x', 'const')
      const scope = r.currentScope()!
      expect(scope.bindings.get('x')?.kind).toBe('const')
    })

    it('throws when no current scope', () => {
      const empty = new ScopeResolver()
      expect(() => empty.declare('x', 'let')).toThrow('No current scope')
    })
  })

  describe('resolve', () => {
    it('finds binding in current scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      const result = resolver.resolve('x')
      expect(result.found).toBe(true)
      expect(result.binding?.name).toBe('x')
    })

    it('finds binding in parent scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      const result = resolver.resolve('x')
      expect(result.found).toBe(true)
      expect(result.scope?.name).toBe('root')
    })

    it('finds binding in grandparent scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('deep', 'const')
      resolver.pushScope('mid', 'function')
      resolver.pushScope('leaf', 'block')
      const result = resolver.resolve('deep')
      expect(result.found).toBe(true)
      expect(result.scope?.name).toBe('root')
    })

    it('returns distance 0 for current scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      const result = resolver.resolve('x')
      expect(result.distance).toBe(0)
    })

    it('returns distance 1 for parent scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      const result = resolver.resolve('x')
      expect(result.distance).toBe(1)
    })

    it('returns distance 2 for grandparent scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'const')
      resolver.pushScope('mid', 'function')
      resolver.pushScope('leaf', 'block')
      const result = resolver.resolve('x')
      expect(result.distance).toBe(2)
    })

    it('returns not found for undeclared variable', () => {
      resolver.pushScope('root', 'global')
      const result = resolver.resolve('unknown')
      expect(result.found).toBe(false)
      expect(result.binding).toBeUndefined()
      expect(result.scope).toBeUndefined()
      expect(result.distance).toBeUndefined()
    })

    it('prefers inner binding when shadowing', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      resolver.declare('x', 'const')
      const result = resolver.resolve('x')
      expect(result.found).toBe(true)
      expect(result.binding?.kind).toBe('const')
      expect(result.scope?.name).toBe('child')
      expect(result.distance).toBe(0)
    })

    it('returns binding and scope in result', () => {
      resolver.pushScope('root', 'global')
      const b = resolver.declare('val', 'let', true)
      const result = resolver.resolve('val')
      expect(result.binding).toBe(b)
      expect(result.scope?.name).toBe('root')
    })

    it('returns not found when no scopes exist', () => {
      const result = resolver.resolve('x')
      expect(result.found).toBe(false)
    })
  })

  describe('getScope', () => {
    it('finds scope by name', () => {
      const scope = resolver.pushScope('myScope', 'function')
      const found = resolver.getScope('myScope')
      expect(found).toBe(scope)
    })

    it('returns undefined for unknown name', () => {
      resolver.pushScope('root', 'global')
      expect(resolver.getScope('nonexistent')).toBeUndefined()
    })

    it('finds scope from top of stack first', () => {
      resolver.pushScope('dup', 'global')
      const second = resolver.pushScope('dup', 'function')
      const found = resolver.getScope('dup')
      expect(found).toBe(second)
    })

    it('finds parent scope by name', () => {
      resolver.pushScope('parent', 'global')
      resolver.pushScope('child', 'function')
      const found = resolver.getScope('parent')
      expect(found?.name).toBe('parent')
    })
  })

  describe('getBinding', () => {
    it('gets binding from current scope', () => {
      resolver.pushScope('root', 'global')
      const b = resolver.declare('x', 'let')
      expect(resolver.getBinding('x')).toBe(b)
    })

    it('gets binding from specified scope', () => {
      const scope = resolver.pushScope('root', 'global')
      const b = resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      expect(resolver.getBinding('x', scope)).toBe(b)
    })

    it('returns undefined when not found', () => {
      resolver.pushScope('root', 'global')
      expect(resolver.getBinding('missing')).toBeUndefined()
    })

    it('returns undefined when no current scope', () => {
      expect(resolver.getBinding('x')).toBeUndefined()
    })

    it('only searches specified scope not chain', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      const childScope = resolver.pushScope('child', 'function')
      expect(resolver.getBinding('x', childScope)).toBeUndefined()
    })
  })

  describe('findShadowing', () => {
    it('returns empty for no shadowing', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      expect(resolver.findShadowing('x')).toEqual([])
    })

    it('finds one shadowed binding', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      resolver.declare('x', 'const')
      const shadows = resolver.findShadowing('x')
      expect(shadows).toHaveLength(1)
      expect(shadows[0]!.kind).toBe('let')
    })

    it('finds multiple shadowed bindings', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'var')
      resolver.pushScope('mid', 'function')
      resolver.declare('x', 'let')
      resolver.pushScope('leaf', 'block')
      resolver.declare('x', 'const')
      const shadows = resolver.findShadowing('x')
      expect(shadows).toHaveLength(2)
      expect(shadows[0]!.kind).toBe('let')
      expect(shadows[1]!.kind).toBe('var')
    })

    it('returns empty for undeclared name', () => {
      resolver.pushScope('root', 'global')
      expect(resolver.findShadowing('nonexistent')).toEqual([])
    })

    it('returns empty when name only in outer scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      expect(resolver.findShadowing('x')).toEqual([])
    })
  })

  describe('getScopeChain', () => {
    it('returns empty array when no scopes', () => {
      expect(resolver.getScopeChain()).toEqual([])
    })

    it('returns single scope', () => {
      resolver.pushScope('root', 'global')
      const chain = resolver.getScopeChain()
      expect(chain).toHaveLength(1)
      expect(chain[0]!.name).toBe('root')
    })

    it('returns full chain from outermost to current', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.pushScope('c', 'block')
      const chain = resolver.getScopeChain()
      expect(chain).toHaveLength(3)
      expect(chain[0]!.name).toBe('a')
      expect(chain[1]!.name).toBe('b')
      expect(chain[2]!.name).toBe('c')
    })

    it('returns copy not reference', () => {
      resolver.pushScope('root', 'global')
      const chain1 = resolver.getScopeChain()
      const chain2 = resolver.getScopeChain()
      expect(chain1).not.toBe(chain2)
      expect(chain1).toEqual(chain2)
    })
  })

  describe('getBindings', () => {
    it('gets bindings from current scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.declare('y', 'const')
      const bindings = resolver.getBindings()
      expect(bindings.size).toBe(2)
      expect(bindings.has('x')).toBe(true)
      expect(bindings.has('y')).toBe(true)
    })

    it('gets bindings from specified scope', () => {
      const scope = resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      const bindings = resolver.getBindings(scope)
      expect(bindings.size).toBe(1)
    })

    it('returns empty map when no scope', () => {
      const bindings = resolver.getBindings()
      expect(bindings.size).toBe(0)
    })

    it('returns copy not reference', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      const b1 = resolver.getBindings()
      const b2 = resolver.getBindings()
      expect(b1).not.toBe(b2)
      expect(b1.size).toBe(b2.size)
    })
  })

  describe('getAllBindings', () => {
    it('returns empty for no scopes', () => {
      expect(resolver.getAllBindings()).toEqual([])
    })

    it('returns bindings from all scopes', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      resolver.declare('y', 'const')
      const all = resolver.getAllBindings()
      expect(all).toHaveLength(2)
    })

    it('includes bindings from nested scopes', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('a', 'var')
      resolver.pushScope('fn', 'function')
      resolver.declare('b', 'param')
      resolver.declare('c', 'let')
      resolver.pushScope('block', 'block')
      resolver.declare('d', 'const')
      const all = resolver.getAllBindings()
      expect(all).toHaveLength(4)
      const names = all.map((b) => b.name)
      expect(names).toContain('a')
      expect(names).toContain('b')
      expect(names).toContain('c')
      expect(names).toContain('d')
    })
  })

  describe('getStatistics', () => {
    it('returns zeros for empty resolver', () => {
      const stats = resolver.getStatistics()
      expect(stats.totalScopes).toBe(0)
      expect(stats.totalBindings).toBe(0)
      expect(stats.initializedBindings).toBe(0)
      expect(stats.uninitializedBindings).toBe(0)
      expect(stats.currentDepth).toBe(0)
    })

    it('counts total scopes correctly', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.pushScope('c', 'block')
      expect(resolver.getStatistics().totalScopes).toBe(3)
    })

    it('counts total bindings correctly', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.declare('y', 'const')
      resolver.declare('z', 'var')
      expect(resolver.getStatistics().totalBindings).toBe(3)
    })

    it('counts initialized bindings', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('a', 'let', true)
      resolver.declare('b', 'const', true)
      resolver.declare('c', 'let', false)
      expect(resolver.getStatistics().initializedBindings).toBe(2)
    })

    it('counts uninitialized bindings', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('a', 'let', true)
      resolver.declare('b', 'const', false)
      resolver.declare('c', 'var', false)
      expect(resolver.getStatistics().uninitializedBindings).toBe(2)
    })

    it('reports current depth', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.pushScope('c', 'block')
      expect(resolver.getStatistics().currentDepth).toBe(3)
    })

    it('reports scope type breakdown', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.pushScope('c', 'function')
      resolver.pushScope('d', 'block')
      const stats = resolver.getStatistics()
      expect(stats.scopeTypes['global']).toBe(1)
      expect(stats.scopeTypes['function']).toBe(2)
      expect(stats.scopeTypes['block']).toBe(1)
    })

    it('updates depth after pop', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.popScope()
      expect(resolver.getStatistics().currentDepth).toBe(1)
    })
  })

  describe('clear', () => {
    it('removes all scopes', () => {
      resolver.pushScope('a', 'global')
      resolver.pushScope('b', 'function')
      resolver.clear()
      expect(resolver.currentScope()).toBeUndefined()
      expect(resolver.getScopeChain()).toEqual([])
    })

    it('resets statistics', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.clear()
      const stats = resolver.getStatistics()
      expect(stats.totalScopes).toBe(0)
      expect(stats.totalBindings).toBe(0)
    })

    it('allows reuse after clear', () => {
      resolver.pushScope('old', 'global')
      resolver.declare('x', 'let')
      resolver.clear()
      resolver.pushScope('new', 'module')
      resolver.declare('y', 'const')
      expect(resolver.currentScope()?.name).toBe('new')
      expect(resolver.resolve('y').found).toBe(true)
      expect(resolver.resolve('x').found).toBe(false)
    })

    it('handles clear on empty resolver', () => {
      resolver.clear()
      expect(resolver.currentScope()).toBeUndefined()
    })

    it('clears all bindings from scopes', () => {
      const scope = resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.declare('y', 'const')
      resolver.clear()
      expect(scope.bindings.size).toBe(0)
    })

    it('clears parent references from scopes', () => {
      resolver.pushScope('root', 'global')
      const child = resolver.pushScope('child', 'function')
      resolver.clear()
      expect(child.parent).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles deep nesting 10 levels', () => {
      resolver.pushScope('l0', 'global')
      for (let i = 1; i <= 10; i++) {
        resolver.pushScope(`l${i}`, i % 2 === 0 ? 'function' : 'block')
      }
      resolver.declare('deep', 'let')
      const result = resolver.resolve('deep')
      expect(result.found).toBe(true)
      expect(result.distance).toBe(0)
      expect(resolver.getStatistics().currentDepth).toBe(11)
    })

    it('handles many bindings in single scope', () => {
      resolver.pushScope('root', 'global')
      for (let i = 0; i < 50; i++) {
        resolver.declare(`var${i}`, 'let')
      }
      expect(resolver.getBindings().size).toBe(50)
      expect(resolver.getStatistics().totalBindings).toBe(50)
    })

    it('same name in sibling scopes does not shadow', () => {
      resolver.pushScope('root', 'global')
      resolver.pushScope('sib1', 'function')
      resolver.declare('x', 'let')
      resolver.popScope()
      resolver.pushScope('sib2', 'function')
      resolver.declare('x', 'const')
      expect(resolver.findShadowing('x')).toEqual([])
    })

    it('resolves correctly after pop', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      resolver.declare('x', 'const')
      resolver.popScope()
      const result = resolver.resolve('x')
      expect(result.found).toBe(true)
      expect(result.binding?.kind).toBe('let')
    })

    it('push after pop all works', () => {
      resolver.pushScope('first', 'global')
      resolver.popScope()
      const scope = resolver.pushScope('second', 'module')
      expect(scope.parent).toBeUndefined()
      expect(resolver.currentScope()?.name).toBe('second')
    })

    it('empty scope with no bindings resolves to not found', () => {
      resolver.pushScope('empty', 'global')
      expect(resolver.resolve('anything').found).toBe(false)
    })

    it('resolve with mixed binding kinds in chain', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('a', 'var', true)
      resolver.pushScope('fn', 'function')
      resolver.declare('b', 'param', true)
      resolver.declare('c', 'let')
      resolver.pushScope('block', 'block')
      resolver.declare('d', 'const', true)
      expect(resolver.resolve('a').found).toBe(true)
      expect(resolver.resolve('b').found).toBe(true)
      expect(resolver.resolve('c').found).toBe(true)
      expect(resolver.resolve('d').found).toBe(true)
    })
  })

  describe('scope types', () => {
    it('global scope type', () => {
      const scope = resolver.pushScope('g', 'global')
      expect(scope.type).toBe('global')
    })

    it('module scope type', () => {
      const scope = resolver.pushScope('m', 'module')
      expect(scope.type).toBe('module')
    })

    it('function scope type', () => {
      const scope = resolver.pushScope('f', 'function')
      expect(scope.type).toBe('function')
    })

    it('block scope type', () => {
      const scope = resolver.pushScope('b', 'block')
      expect(scope.type).toBe('block')
    })

    it('loop scope type', () => {
      const scope = resolver.pushScope('l', 'loop')
      expect(scope.type).toBe('loop')
    })

    it('all scope types in statistics', () => {
      resolver.pushScope('g', 'global')
      resolver.pushScope('m', 'module')
      resolver.pushScope('f', 'function')
      resolver.pushScope('b', 'block')
      resolver.pushScope('l', 'loop')
      const stats = resolver.getStatistics()
      expect(Object.keys(stats.scopeTypes)).toHaveLength(5)
    })
  })

  describe('binding kinds', () => {
    beforeEach(() => {
      resolver.pushScope('root', 'global')
    })

    it('var kind', () => {
      const b = resolver.declare('v', 'var')
      expect(b.kind).toBe('var')
    })

    it('let kind', () => {
      const b = resolver.declare('l', 'let')
      expect(b.kind).toBe('let')
    })

    it('const kind', () => {
      const b = resolver.declare('c', 'const')
      expect(b.kind).toBe('const')
    })

    it('function kind', () => {
      const b = resolver.declare('fn', 'function')
      expect(b.kind).toBe('function')
    })

    it('class kind', () => {
      const b = resolver.declare('Cls', 'class')
      expect(b.kind).toBe('class')
    })

    it('param kind', () => {
      const b = resolver.declare('p', 'param')
      expect(b.kind).toBe('param')
    })
  })

  describe('ScopeNode type', () => {
    it('creates ScopeNode with required fields', () => {
      const node: ScopeNode = { type: 'FunctionDeclaration', scopeType: 'function' }
      expect(node.type).toBe('FunctionDeclaration')
      expect(node.scopeType).toBe('function')
    })

    it('creates ScopeNode with optional name', () => {
      const node: ScopeNode = {
        type: 'FunctionDeclaration',
        name: 'myFunc',
        scopeType: 'function',
      }
      expect(node.name).toBe('myFunc')
    })
  })

  describe('DEFAULT_SCOPE_CONFIG', () => {
    it('has allowRedeclare false', () => {
      expect(DEFAULT_SCOPE_CONFIG.allowRedeclare).toBe(false)
    })

    it('has maxScopeDepth 100', () => {
      expect(DEFAULT_SCOPE_CONFIG.maxScopeDepth).toBe(100)
    })

    it('has trackInitialized true', () => {
      expect(DEFAULT_SCOPE_CONFIG.trackInitialized).toBe(true)
    })
  })

  describe('resolution distance', () => {
    it('distance 0 for same scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      expect(resolver.resolve('x').distance).toBe(0)
    })

    it('distance 1 for parent scope', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('child', 'function')
      expect(resolver.resolve('x').distance).toBe(1)
    })

    it('distance 2 for grandparent', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'const')
      resolver.pushScope('mid', 'function')
      resolver.pushScope('leaf', 'block')
      expect(resolver.resolve('x').distance).toBe(2)
    })

    it('distance increases through empty scopes', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('target', 'let')
      resolver.pushScope('e1', 'block')
      resolver.pushScope('e2', 'block')
      resolver.pushScope('e3', 'block')
      expect(resolver.resolve('target').distance).toBe(3)
    })
  })

  describe('complex scenarios', () => {
    it('simulates a function with local and outer vars', () => {
      resolver.pushScope('module', 'module')
      resolver.declare('globalVar', 'let', true)
      resolver.declare('helper', 'function', true)
      resolver.pushScope('mainFn', 'function')
      resolver.declare('param1', 'param', true)
      resolver.declare('localVar', 'const', true)
      expect(resolver.resolve('globalVar').found).toBe(true)
      expect(resolver.resolve('helper').found).toBe(true)
      expect(resolver.resolve('param1').found).toBe(true)
      expect(resolver.resolve('localVar').found).toBe(true)
      expect(resolver.resolve('undeclared').found).toBe(false)
    })

    it('simulates nested functions with shadowing', () => {
      resolver.pushScope('module', 'module')
      resolver.declare('count', 'let', true)
      resolver.pushScope('outer', 'function')
      resolver.declare('count', 'let', true)
      resolver.pushScope('inner', 'function')
      resolver.declare('count', 'const', true)
      const shadows = resolver.findShadowing('count')
      expect(shadows).toHaveLength(2)
      expect(resolver.resolve('count').distance).toBe(0)
      expect(resolver.resolve('count').binding?.kind).toBe('const')
    })

    it('handles loop scope with iterator binding', () => {
      resolver.pushScope('module', 'module')
      resolver.pushScope('forLoop', 'loop')
      resolver.declare('i', 'let', true)
      resolver.declare('item', 'const', true)
      expect(resolver.resolve('i').found).toBe(true)
      expect(resolver.resolve('item').found).toBe(true)
      expect(resolver.getStatistics().scopeTypes['loop']).toBe(1)
    })

    it('clear and rebuild from scratch', () => {
      resolver.pushScope('old1', 'global')
      resolver.declare('oldVar', 'let')
      resolver.pushScope('old2', 'function')
      resolver.declare('oldParam', 'param')
      resolver.clear()
      resolver.pushScope('newRoot', 'module')
      resolver.declare('newVar', 'const', true)
      const stats = resolver.getStatistics()
      expect(stats.totalScopes).toBe(1)
      expect(stats.totalBindings).toBe(1)
      expect(stats.initializedBindings).toBe(1)
    })

    it('getAllBindings after pop still includes all', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('a', 'let')
      resolver.pushScope('child', 'function')
      resolver.declare('b', 'const')
      resolver.popScope()
      const all = resolver.getAllBindings()
      expect(all).toHaveLength(2)
      const names = all.map((b) => b.name)
      expect(names).toContain('a')
      expect(names).toContain('b')
    })

    it('getStatistics after multiple pushes and pops', () => {
      resolver.pushScope('root', 'global')
      resolver.declare('x', 'let')
      resolver.pushScope('fn1', 'function')
      resolver.declare('y', 'const')
      resolver.popScope()
      resolver.pushScope('fn2', 'function')
      resolver.declare('z', 'let', true)
      const stats = resolver.getStatistics()
      expect(stats.totalScopes).toBe(3)
      expect(stats.totalBindings).toBe(3)
      expect(stats.currentDepth).toBe(2)
    })
  })

  describe('re-exported types', () => {
    it('can import Scope type and use it', () => {
      const r = new ScopeResolver()
      r.pushScope('test', 'global')
      const scope: Scope = r.currentScope()!
      expect(scope.name).toBe('test')
    })

    it('can import Binding type and use it', () => {
      const r = new ScopeResolver()
      r.pushScope('test', 'global')
      const binding: Binding = r.declare('x', 'let')
      expect(binding.name).toBe('x')
    })

    it('can import ResolutionResult type and use it', () => {
      const r = new ScopeResolver()
      r.pushScope('test', 'global')
      r.declare('x', 'let')
      const result: ResolutionResult = r.resolve('x')
      expect(result.found).toBe(true)
    })
  })
})
