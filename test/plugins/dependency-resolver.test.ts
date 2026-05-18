import { describe, it, expect } from 'vitest'
import { DependencyResolver } from '../../src/plugins/dependency-resolver.js'
import type { PluginManifest } from '../../src/plugins/version-types.js'

function makeManifest(overrides: Partial<PluginManifest> & Pick<PluginManifest, 'name'>): PluginManifest {
  return {
    version: '1.0.0',
    codeforgeVersion: '^1.0.0',
    description: `Plugin ${overrides.name}`,
    main: `dist/plugins/${overrides.name}/index.js`,
    dependencies: {},
    ...overrides,
  }
}

// ─── addPlugin / hasPlugin / getPlugin ───

describe('addPlugin / hasPlugin / getPlugin', () => {
  it('adds a plugin and confirms it exists via hasPlugin', () => {
    const resolver = new DependencyResolver()
    const manifest = makeManifest({ name: 'alpha' })
    resolver.addPlugin(manifest)
    expect(resolver.hasPlugin('alpha')).toBe(true)
  })

  it('returns false from hasPlugin for a plugin that was never added', () => {
    const resolver = new DependencyResolver()
    expect(resolver.hasPlugin('missing')).toBe(false)
  })

  it('retrieves an added plugin via getPlugin', () => {
    const resolver = new DependencyResolver()
    const manifest = makeManifest({ name: 'beta' })
    resolver.addPlugin(manifest)
    expect(resolver.getPlugin('beta')).toBe(manifest)
  })

  it('returns undefined from getPlugin for a non-existent plugin', () => {
    const resolver = new DependencyResolver()
    expect(resolver.getPlugin('nope')).toBeUndefined()
  })

  it('overwrites a plugin when adding one with the same name', () => {
    const resolver = new DependencyResolver()
    const v1 = makeManifest({ name: 'gamma', version: '1.0.0' })
    const v2 = makeManifest({ name: 'gamma', version: '2.0.0' })
    resolver.addPlugin(v1)
    resolver.addPlugin(v2)
    expect(resolver.getPlugin('gamma')).toBe(v2)
  })
})

// ─── removePlugin ───

describe('removePlugin', () => {
  it('removes a previously added plugin', () => {
    const resolver = new DependencyResolver()
    const manifest = makeManifest({ name: 'delta' })
    resolver.addPlugin(manifest)
    expect(resolver.hasPlugin('delta')).toBe(true)
    resolver.removePlugin('delta')
    expect(resolver.hasPlugin('delta')).toBe(false)
    expect(resolver.getPlugin('delta')).toBeUndefined()
  })

  it('does nothing when removing a plugin that does not exist', () => {
    const resolver = new DependencyResolver()
    resolver.removePlugin('ghost')
    expect(resolver.hasPlugin('ghost')).toBe(false)
  })

  it('removes one plugin while leaving others intact', () => {
    const resolver = new DependencyResolver()
    const a = makeManifest({ name: 'a' })
    const b = makeManifest({ name: 'b' })
    resolver.addPlugin(a)
    resolver.addPlugin(b)
    resolver.removePlugin('a')
    expect(resolver.hasPlugin('a')).toBe(false)
    expect(resolver.hasPlugin('b')).toBe(true)
  })
})

// ─── getAllPlugins ───

describe('getAllPlugins', () => {
  it('returns an empty array when no plugins are added', () => {
    const resolver = new DependencyResolver()
    expect(resolver.getAllPlugins()).toEqual([])
  })

  it('returns all added plugins', () => {
    const resolver = new DependencyResolver()
    const a = makeManifest({ name: 'p1' })
    const b = makeManifest({ name: 'p2' })
    const c = makeManifest({ name: 'p3' })
    resolver.addPlugin(a)
    resolver.addPlugin(b)
    resolver.addPlugin(c)
    const all = resolver.getAllPlugins()
    expect(all).toHaveLength(3)
    expect(all).toContainEqual(a)
    expect(all).toContainEqual(b)
    expect(all).toContainEqual(c)
  })
})

// ─── resolve ───

describe('resolve', () => {
  it('resolves a single plugin with no dependencies', () => {
    const resolver = new DependencyResolver()
    const manifest = makeManifest({ name: 'solo' })
    resolver.addPlugin(manifest)
    const result = resolver.resolve(['solo'])
    expect(result.valid).toBe(true)
    expect(result.resolved.has('solo')).toBe(true)
    expect(result.resolved.get('solo')).toBe(manifest)
    expect(result.conflicts).toHaveLength(0)
    expect(result.missing).toHaveLength(0)
  })

  it('resolves transitive dependencies', () => {
    const resolver = new DependencyResolver()
    const leaf = makeManifest({ name: 'leaf' })
    const mid = makeManifest({
      name: 'mid',
      dependencies: { leaf: '^1.0.0' },
    })
    const root = makeManifest({
      name: 'root',
      dependencies: { mid: '^1.0.0' },
    })
    resolver.addPlugin(root)
    resolver.addPlugin(mid)
    resolver.addPlugin(leaf)

    const result = resolver.resolve(['root'])
    expect(result.valid).toBe(true)
    expect(result.resolved.has('root')).toBe(true)
    expect(result.resolved.has('mid')).toBe(true)
    expect(result.resolved.has('leaf')).toBe(true)
    expect(result.conflicts).toHaveLength(0)
    expect(result.missing).toHaveLength(0)
  })

  it('reports missing dependencies', () => {
    const resolver = new DependencyResolver()
    const root = makeManifest({
      name: 'root',
      dependencies: { absent: '^1.0.0' },
    })
    resolver.addPlugin(root)

    const result = resolver.resolve(['root'])
    expect(result.valid).toBe(false)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0]).toEqual({
      plugin: 'absent',
      requiredBy: 'root',
      constraint: '^1.0.0',
    })
  })

  it('reports a missing root plugin', () => {
    const resolver = new DependencyResolver()
    const result = resolver.resolve(['nonexistent'])
    expect(result.valid).toBe(false)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0]).toEqual({
      plugin: 'nonexistent',
      requiredBy: '<root>',
      constraint: '*',
    })
    expect(result.resolved.size).toBe(0)
  })

  it('handles circular dependencies without infinite loop', () => {
    const resolver = new DependencyResolver()
    const a = makeManifest({
      name: 'a',
      dependencies: { b: '^1.0.0' },
    })
    const b = makeManifest({
      name: 'b',
      dependencies: { a: '^1.0.0' },
    })
    resolver.addPlugin(a)
    resolver.addPlugin(b)

    const result = resolver.resolve(['a'])
    expect(result.resolved.has('a')).toBe(true)
    expect(result.resolved.has('b')).toBe(true)
    expect(result.valid).toBe(true)
  })

  it('handles a three-node circular dependency', () => {
    const resolver = new DependencyResolver()
    const a = makeManifest({ name: 'a', dependencies: { b: '*' } })
    const b = makeManifest({ name: 'b', dependencies: { c: '*' } })
    const c = makeManifest({ name: 'c', dependencies: { a: '*' } })
    resolver.addPlugin(a)
    resolver.addPlugin(b)
    resolver.addPlugin(c)

    const result = resolver.resolve(['a'])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(3)
  })

  it('reports version conflicts when constraints are incompatible', () => {
    const resolver = new DependencyResolver()
    // shared dep at 1.0.0
    const shared = makeManifest({ name: 'shared', version: '1.0.0' })
    // consumer-a requires shared ^1.0.0 (satisfied)
    const consumerA = makeManifest({
      name: 'consumer-a',
      dependencies: { shared: '^1.0.0' },
    })
    // consumer-b requires shared ^2.0.0 (NOT satisfied by 1.0.0)
    const consumerB = makeManifest({
      name: 'consumer-b',
      dependencies: { shared: '^2.0.0' },
    })
    resolver.addPlugin(shared)
    resolver.addPlugin(consumerA)
    resolver.addPlugin(consumerB)

    const result = resolver.resolve(['consumer-a', 'consumer-b'])
    expect(result.valid).toBe(false)
    expect(result.conflicts.length).toBeGreaterThanOrEqual(1)
    const conflict = result.conflicts.find((c) => c.plugin === 'shared')
    expect(conflict).toBeDefined()
  })

  it('resolves multiple root plugins at once', () => {
    const resolver = new DependencyResolver()
    const p1 = makeManifest({ name: 'p1' })
    const p2 = makeManifest({ name: 'p2' })
    resolver.addPlugin(p1)
    resolver.addPlugin(p2)

    const result = resolver.resolve(['p1', 'p2'])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(2)
  })

  it('populates both missing and conflicts when applicable', () => {
    const resolver = new DependencyResolver()
    const shared = makeManifest({ name: 'shared', version: '1.0.0' })
    const root = makeManifest({
      name: 'root',
      dependencies: { shared: '^2.0.0', absent: '^1.0.0' },
    })
    resolver.addPlugin(shared)
    resolver.addPlugin(root)

    const result = resolver.resolve(['root'])
    expect(result.valid).toBe(false)
    expect(result.missing.length).toBeGreaterThanOrEqual(1)
  })

  it('resolves an empty root list with no errors', () => {
    const resolver = new DependencyResolver()
    const result = resolver.resolve([])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(0)
  })

  it('resolves a diamond dependency graph correctly', () => {
    const resolver = new DependencyResolver()
    const leaf = makeManifest({ name: 'leaf', version: '1.0.0' })
    const left = makeManifest({ name: 'left', dependencies: { leaf: '^1.0.0' } })
    const right = makeManifest({ name: 'right', dependencies: { leaf: '^1.0.0' } })
    const top = makeManifest({ name: 'top', dependencies: { left: '*', right: '*' } })
    resolver.addPlugin(top)
    resolver.addPlugin(left)
    resolver.addPlugin(right)
    resolver.addPlugin(leaf)

    const result = resolver.resolve(['top'])
    expect(result.valid).toBe(true)
    expect(result.resolved.size).toBe(4)
    expect(result.conflicts).toHaveLength(0)
  })
})

// ─── getDependencyOrder ───

describe('getDependencyOrder', () => {
  it('returns just the plugin name when it has no dependencies', () => {
    const resolver = new DependencyResolver()
    const manifest = makeManifest({ name: 'standalone' })
    resolver.addPlugin(manifest)
    const order = resolver.getDependencyOrder('standalone')
    expect(order).toEqual(['standalone'])
  })

  it('returns dependencies before the plugin in topological order', () => {
    const resolver = new DependencyResolver()
    const leaf = makeManifest({ name: 'leaf' })
    const mid = makeManifest({ name: 'mid', dependencies: { leaf: '*' } })
    const root = makeManifest({ name: 'root', dependencies: { mid: '*' } })
    resolver.addPlugin(root)
    resolver.addPlugin(mid)
    resolver.addPlugin(leaf)

    const order = resolver.getDependencyOrder('root')
    const leafIdx = order.indexOf('leaf')
    const midIdx = order.indexOf('mid')
    const rootIdx = order.indexOf('root')

    expect(leafIdx).toBeLessThan(midIdx)
    expect(midIdx).toBeLessThan(rootIdx)
  })

  it('returns just the name for a plugin not in the registry', () => {
    const resolver = new DependencyResolver()
    const order = resolver.getDependencyOrder('unknown')
    expect(order).toEqual(['unknown'])
  })

  it('handles circular references gracefully', () => {
    const resolver = new DependencyResolver()
    const a = makeManifest({ name: 'a', dependencies: { b: '*' } })
    const b = makeManifest({ name: 'b', dependencies: { a: '*' } })
    resolver.addPlugin(a)
    resolver.addPlugin(b)

    const order = resolver.getDependencyOrder('a')
    expect(order).toContain('a')
    expect(order).toContain('b')
    // Should terminate (no infinite loop) and return both
    expect(order.length).toBe(2)
  })

  it('handles diamond-shaped dependency graph', () => {
    const resolver = new DependencyResolver()
    const leaf = makeManifest({ name: 'leaf' })
    const left = makeManifest({ name: 'left', dependencies: { leaf: '*' } })
    const right = makeManifest({ name: 'right', dependencies: { leaf: '*' } })
    const top = makeManifest({ name: 'top', dependencies: { left: '*', right: '*' } })
    resolver.addPlugin(top)
    resolver.addPlugin(left)
    resolver.addPlugin(right)
    resolver.addPlugin(leaf)

    const order = resolver.getDependencyOrder('top')
    // leaf must come before left and right, left/right must come before top
    const leafIdx = order.indexOf('leaf')
    const leftIdx = order.indexOf('left')
    const rightIdx = order.indexOf('right')
    const topIdx = order.indexOf('top')
    expect(leafIdx).toBeLessThan(leftIdx)
    expect(leafIdx).toBeLessThan(rightIdx)
    expect(leftIdx).toBeLessThan(topIdx)
    expect(rightIdx).toBeLessThan(topIdx)
    // leaf should only appear once
    expect(order.filter((n) => n === 'leaf')).toHaveLength(1)
  })
})

// ─── detectConflicts ───

describe('detectConflicts', () => {
  it('returns an empty array when there are no conflicts', () => {
    const resolver = new DependencyResolver()
    const shared = makeManifest({ name: 'shared', version: '1.0.0' })
    const a = makeManifest({ name: 'a', dependencies: { shared: '^1.0.0' } })
    const b = makeManifest({ name: 'b', dependencies: { shared: '^1.0.0' } })
    resolver.addPlugin(shared)
    resolver.addPlugin(a)
    resolver.addPlugin(b)
    expect(resolver.detectConflicts()).toEqual([])
  })

  it('detects conflicting version constraints', () => {
    const resolver = new DependencyResolver()
    const shared = makeManifest({ name: 'shared', version: '1.0.0' })
    const a = makeManifest({ name: 'a', dependencies: { shared: '^1.0.0' } })
    const b = makeManifest({ name: 'b', dependencies: { shared: '^2.0.0' } })
    resolver.addPlugin(shared)
    resolver.addPlugin(a)
    resolver.addPlugin(b)

    const conflicts = resolver.detectConflicts()
    expect(conflicts.length).toBeGreaterThanOrEqual(1)
    const sharedConflict = conflicts.find((c) => c.plugin === 'shared')
    expect(sharedConflict).toBeDefined()
    expect(sharedConflict!.constraint1).toBeDefined()
    expect(sharedConflict!.constraint2).toBeDefined()
  })

  it('returns no conflicts when only a single constraint exists for a dependency', () => {
    const resolver = new DependencyResolver()
    const dep = makeManifest({ name: 'dep', version: '1.5.0' })
    const consumer = makeManifest({ name: 'consumer', dependencies: { dep: '>=1.0.0' } })
    resolver.addPlugin(dep)
    resolver.addPlugin(consumer)

    expect(resolver.detectConflicts()).toEqual([])
  })

  it('returns empty array when no plugins are registered', () => {
    const resolver = new DependencyResolver()
    expect(resolver.detectConflicts()).toEqual([])
  })

  it('returns empty when dependency is missing from the registry', () => {
    const resolver = new DependencyResolver()
    const a = makeManifest({ name: 'a', dependencies: { ghost: '^1.0.0' } })
    resolver.addPlugin(a)
    // "ghost" is not in the registry → no version to check against
    expect(resolver.detectConflicts()).toEqual([])
  })

  it('detects conflict with range constraints', () => {
    const resolver = new DependencyResolver()
    const shared = makeManifest({ name: 'shared', version: '3.0.0' })
    const a = makeManifest({ name: 'a', dependencies: { shared: '>=1.0.0 <2.0.0' } })
    const b = makeManifest({ name: 'b', dependencies: { shared: '^3.0.0' } })
    resolver.addPlugin(shared)
    resolver.addPlugin(a)
    resolver.addPlugin(b)

    const conflicts = resolver.detectConflicts()
    expect(conflicts.length).toBeGreaterThanOrEqual(1)
    const sharedConflict = conflicts.find((c) => c.plugin === 'shared')
    expect(sharedConflict).toBeDefined()
  })

  it('reports no conflict when both constraints are satisfied', () => {
    const resolver = new DependencyResolver()
    const dep = makeManifest({ name: 'dep', version: '1.5.0' })
    const a = makeManifest({ name: 'a', dependencies: { dep: '>=1.0.0' } })
    const b = makeManifest({ name: 'b', dependencies: { dep: '>=1.2.0 <2.0.0' } })
    resolver.addPlugin(dep)
    resolver.addPlugin(a)
    resolver.addPlugin(b)

    expect(resolver.detectConflicts()).toEqual([])
  })
})
