import { describe, expect, test } from 'vitest'

import { DependencyResolver } from '../../../src/plugins/dependency-resolver.js'
import type { PluginManifest } from '../../../src/plugins/version-types.js'

const makePlugin = (overrides: Partial<PluginManifest> & { name: string }): PluginManifest => ({
  version: '1.0.0',
  codeforgeVersion: '^1.0.0',
  description: `Plugin ${overrides.name}`,
  main: 'index.js',
  dependencies: {},
  ...overrides,
})

describe('DependencyResolver — basics', () => {
  test('addPlugin and hasPlugin', () => {
    const resolver = new DependencyResolver()
    const plugin = makePlugin({ name: 'a' })
    resolver.addPlugin(plugin)
    expect(resolver.hasPlugin('a')).toBe(true)
    expect(resolver.hasPlugin('b')).toBe(false)
  })

  test('removePlugin', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a' }))
    expect(resolver.hasPlugin('a')).toBe(true)
    resolver.removePlugin('a')
    expect(resolver.hasPlugin('a')).toBe(false)
  })

  test('getPlugin returns manifest', () => {
    const resolver = new DependencyResolver()
    const plugin = makePlugin({ name: 'a' })
    resolver.addPlugin(plugin)
    expect(resolver.getPlugin('a')).toBe(plugin)
  })

  test('getPlugin returns undefined for non-existent', () => {
    const resolver = new DependencyResolver()
    expect(resolver.getPlugin('nope')).toBeUndefined()
  })

  test('getAllPlugins returns all registered', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a' }))
    resolver.addPlugin(makePlugin({ name: 'b' }))
    expect(resolver.getAllPlugins()).toHaveLength(2)
  })
})

describe('DependencyResolver — resolve', () => {
  test('single plugin with no deps', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a' }))
    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(true)
    expect(result.resolved.has('a')).toBe(true)
    expect(result.conflicts).toHaveLength(0)
    expect(result.missing).toHaveLength(0)
  })

  test('linear chain A → B → C', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { b: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { c: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'c' }))

    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(true)
    expect(result.resolved.has('a')).toBe(true)
    expect(result.resolved.has('b')).toBe(true)
    expect(result.resolved.has('c')).toBe(true)
  })

  test('diamond A → B, A → C, B → D, C → D', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(
      makePlugin({ name: 'a', dependencies: { b: '^1.0.0', c: '^1.0.0' } }),
    )
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { d: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'c', dependencies: { d: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'd' }))

    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(4)
    expect(result.resolved.has('d')).toBe(true)
  })

  test('detects missing dependency', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { missing: '^1.0.0' } }))

    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(false)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0]!.plugin).toBe('missing')
    expect(result.missing[0]!.requiredBy).toBe('a')
  })

  test('detects missing root plugin', () => {
    const resolver = new DependencyResolver()
    const result = resolver.resolve(['nonexistent'])
    expect(result.valid).toBe(false)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0]!.plugin).toBe('nonexistent')
  })

  test('empty root list returns empty result', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a' }))
    const result = resolver.resolve([])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(0)
    expect(result.conflicts).toHaveLength(0)
    expect(result.missing).toHaveLength(0)
  })

  test('multiple roots sharing dependencies', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { shared: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { shared: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'shared' }))

    const result = resolver.resolve(['a', 'b'])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(3)
  })

  test('handles circular dependency gracefully', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { b: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { a: '^1.0.0' } }))

    const result = resolver.resolve(['a'])
    expect(result.resolved.has('a')).toBe(true)
    expect(result.resolved.has('b')).toBe(true)
  })
})

describe('DependencyResolver — getDependencyOrder', () => {
  test('no deps returns single element', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a' }))
    const order = resolver.getDependencyOrder('a')
    expect(order).toEqual(['a'])
  })

  test('linear chain returns valid topological order', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { b: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { c: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'c' }))

    const order = resolver.getDependencyOrder('a')
    expect(order).toEqual(['c', 'b', 'a'])
  })

  test('diamond returns valid order', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(
      makePlugin({ name: 'a', dependencies: { b: '^1.0.0', c: '^1.0.0' } }),
    )
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { d: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'c', dependencies: { d: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'd' }))

    const order = resolver.getDependencyOrder('a')
    expect(order.indexOf('d')).toBeLessThan(order.indexOf('b'))
    expect(order.indexOf('d')).toBeLessThan(order.indexOf('c'))
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('a'))
  })

  test('non-existent plugin returns single element', () => {
    const resolver = new DependencyResolver()
    const order = resolver.getDependencyOrder('nonexistent')
    expect(order).toEqual(['nonexistent'])
  })
})

describe('DependencyResolver — detectConflicts', () => {
  test('no conflicts when all constraints compatible', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { shared: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { shared: '>=1.0.0 <2.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'shared', version: '1.5.0' }))

    const conflicts = resolver.detectConflicts()
    expect(conflicts).toHaveLength(0)
  })

  test('detects version conflict', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { shared: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { shared: '^2.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'shared', version: '1.5.0' }))

    const conflicts = resolver.detectConflicts()
    expect(conflicts.length).toBeGreaterThan(0)
    expect(conflicts[0]!.plugin).toBe('shared')
  })

  test('no conflicts when no dependencies', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a' }))
    resolver.addPlugin(makePlugin({ name: 'b' }))

    const conflicts = resolver.detectConflicts()
    expect(conflicts).toHaveLength(0)
  })

  test('no conflict for wildcard constraints', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { shared: '*' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { shared: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'shared', version: '1.0.0' }))

    const conflicts = resolver.detectConflicts()
    expect(conflicts).toHaveLength(0)
  })
})

describe('DependencyResolver — resolve with conflicts', () => {
  test('version conflict between two dependents', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { dep: '^1.0.0' } }))
    resolver.addPlugin(
      makePlugin({ name: 'b', version: '1.0.0', dependencies: { dep: '>=2.0.0' } }),
    )
    resolver.addPlugin(makePlugin({ name: 'dep', version: '1.0.0' }))

    const result = resolver.resolve(['a', 'b'])
    expect(result.conflicts.length).toBeGreaterThan(0)
  })

  test('resolve returns valid when all deps met', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { b: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b' }))
    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(2)
  })

  test('resolve with peerDependencies does not affect resolution', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(
      makePlugin({ name: 'a', peerDependencies: { peer: '^1.0.0' }, dependencies: {} }),
    )
    resolver.addPlugin(makePlugin({ name: 'peer' }))
    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(1)
  })

  test('resolve handles transitive missing dependency', () => {
    const resolver = new DependencyResolver()
    resolver.addPlugin(makePlugin({ name: 'a', dependencies: { b: '^1.0.0' } }))
    resolver.addPlugin(makePlugin({ name: 'b', dependencies: { c: '^1.0.0' } }))

    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(false)
    expect(result.missing.length).toBeGreaterThanOrEqual(1)
  })
})
