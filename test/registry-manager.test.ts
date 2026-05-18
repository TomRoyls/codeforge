import { describe, it, expect } from 'vitest'
import { ModuleRegistry } from '../src/core/registry-manager/module-registry.js'
import { RegistryManager } from '../src/core/registry-manager/registry-manager.js'
import type { ModuleManifest } from '../src/core/registry-manager/types.js'

function validManifest(overrides: Partial<ModuleManifest> = {}): ModuleManifest {
  return {
    id: 'test-module',
    name: 'Test Module',
    version: '1.0.0',
    description: 'A test module',
    dependencies: [],
    exports: ['default'],
    author: 'test',
    license: 'MIT',
    main: 'index.js',
    ...overrides,
  }
}

// ─── ModuleRegistry ───

describe('ModuleRegistry: registration and CRUD', () => {
  it('register adds a module and returns entry', () => {
    const reg = new ModuleRegistry()
    const entry = reg.register(validManifest())
    expect(entry.manifest.id).toBe('test-module')
    expect(entry.state).toBe('registered')
    expect(entry.registeredAt).toBeInstanceOf(Date)
  })

  it('register throws on duplicate id', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest())
    expect(() => reg.register(validManifest())).toThrow("already registered")
  })

  it('register throws on invalid version format', () => {
    const reg = new ModuleRegistry()
    expect(() => reg.register(validManifest({ version: 'abc' }))).toThrow('Invalid version format')
  })

  it('register accepts valid semver formats', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest({ id: 'a', version: '1.0.0' }))
    reg.register(validManifest({ id: 'b', version: '1.0.0-beta.1' }))
    reg.register(validManifest({ id: 'c', version: '2.3.4+build.56' }))
    expect(reg.size).toBe(3)
  })

  it('unregister removes a module and returns true', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest())
    expect(reg.unregister('test-module')).toBe(true)
    expect(reg.has('test-module')).toBe(false)
  })

  it('unregister returns false for non-existent module', () => {
    const reg = new ModuleRegistry()
    expect(reg.unregister('nope')).toBe(false)
  })

  it('get returns entry for existing module', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest())
    const entry = reg.get('test-module')
    expect(entry).toBeDefined()
    expect(entry!.manifest.name).toBe('Test Module')
  })

  it('get returns undefined for non-existent module', () => {
    const reg = new ModuleRegistry()
    expect(reg.get('nope')).toBeUndefined()
  })

  it('has returns correct boolean', () => {
    const reg = new ModuleRegistry()
    expect(reg.has('x')).toBe(false)
    reg.register(validManifest({ id: 'x' }))
    expect(reg.has('x')).toBe(true)
  })

  it('list returns all entries', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest({ id: 'a' }))
    reg.register(validManifest({ id: 'b' }))
    expect(reg.list()).toHaveLength(2)
  })

  it('listByState filters by state', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest({ id: 'a' }))
    reg.register(validManifest({ id: 'b' }))
    reg.updateState('a', 'resolved')
    expect(reg.listByState('resolved')).toHaveLength(1)
    expect(reg.listByState('registered')).toHaveLength(1)
  })

  it('updateState changes the state of a module', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest())
    reg.updateState('test-module', 'loaded')
    expect(reg.get('test-module')!.state).toBe('loaded')
  })

  it('updateState sets error when provided', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest())
    reg.updateState('test-module', 'error', 'something broke')
    const entry = reg.get('test-module')!
    expect(entry.state).toBe('error')
    expect(entry.error).toBe('something broke')
  })

  it('clear removes all entries', () => {
    const reg = new ModuleRegistry()
    reg.register(validManifest({ id: 'a' }))
    reg.register(validManifest({ id: 'b' }))
    reg.clear()
    expect(reg.size).toBe(0)
  })

  it('size returns the number of entries', () => {
    const reg = new ModuleRegistry()
    expect(reg.size).toBe(0)
    reg.register(validManifest())
    expect(reg.size).toBe(1)
  })
})

// ─── RegistryManager ───

describe('RegistryManager: validation and registration', () => {
  it('register validates manifest when validateOnRegister is true', () => {
    const mgr = new RegistryManager({ validateOnRegister: true })
    expect(() => mgr.register({ ...validManifest(), id: '' })).toThrow('Validation failed')
  })

  it('register skips validation when validateOnRegister is false', () => {
    const mgr = new RegistryManager({ validateOnRegister: false })
    expect(() => mgr.register(validManifest())).not.toThrow()
  })

  it('register enforces maxModules limit', () => {
    const mgr = new RegistryManager({ maxModules: 1 })
    mgr.register(validManifest({ id: 'a' }))
    expect(() => mgr.register(validManifest({ id: 'b' }))).toThrow('Maximum module limit')
  })

  it('unregister delegates to inner registry', () => {
    const mgr = new RegistryManager()
    mgr.register(validManifest())
    expect(mgr.unregister('test-module')).toBe(true)
    expect(mgr.get('test-module')).toBeUndefined()
  })
})

// ─── RegistryManager: Dependency Resolution ───

describe('RegistryManager: dependency resolution', () => {
  it('resolve returns resolved:true for module with no deps', () => {
    const mgr = new RegistryManager()
    mgr.register(validManifest({ id: 'a' }))
    const result = mgr.resolve('a')
    expect(result.resolved).toBe(true)
    expect(result.resolvedOrder).toEqual(['a'])
    expect(result.missingDeps).toEqual([])
  })

  it('resolve returns resolved:false for unknown module', () => {
    const mgr = new RegistryManager()
    const result = mgr.resolve('nope')
    expect(result.resolved).toBe(false)
    expect(result.missingDeps).toEqual([])
  })

  it('resolve detects missing dependencies', () => {
    const mgr = new RegistryManager()
    mgr.register(validManifest({ id: 'a', dependencies: ['missing-dep'] }))
    const result = mgr.resolve('a')
    expect(result.resolved).toBe(false)
    expect(result.missingDeps).toEqual(['missing-dep'])
  })

  it('resolve handles dependency chains', () => {
    const mgr = new RegistryManager()
    mgr.register(validManifest({ id: 'c', dependencies: [] }))
    mgr.register(validManifest({ id: 'b', dependencies: ['c'] }))
    mgr.register(validManifest({ id: 'a', dependencies: ['b'] }))
    const result = mgr.resolve('a')
    expect(result.resolved).toBe(true)
    expect(result.resolvedOrder).toEqual(['c', 'b', 'a'])
  })

  it('resolveAll resolves all registered modules', () => {
    const mgr = new RegistryManager()
    mgr.register(validManifest({ id: 'a', dependencies: [] }))
    mgr.register(validManifest({ id: 'b', dependencies: ['a'] }))
    const results = mgr.resolveAll()
    expect(results.get('a')!.resolved).toBe(true)
    expect(results.get('b')!.resolved).toBe(true)
  })
})

// ─── RegistryManager: Dependency Graph ───

describe('RegistryManager: dependency graph', () => {
  it('getDependencyGraph returns correct graph', () => {
    const mgr = new RegistryManager()
    mgr.register(validManifest({ id: 'a', dependencies: ['b'] }))
    mgr.register(validManifest({ id: 'b', dependencies: [] }))
    const graph = mgr.getDependencyGraph()
    expect(graph.get('a')).toEqual(['b'])
    expect(graph.get('b')).toEqual([])
  })

  it('getDependents returns modules that depend on given id', () => {
    const mgr = new RegistryManager()
    mgr.register(validManifest({ id: 'a', dependencies: ['c'] }))
    mgr.register(validManifest({ id: 'b', dependencies: ['c'] }))
    mgr.register(validManifest({ id: 'c', dependencies: [] }))
    expect(mgr.getDependents('c')).toEqual(['a', 'b'])
    expect(mgr.getDependents('a')).toEqual([])
  })
})

// ─── RegistryManager: Validation ───

describe('RegistryManager: validation details', () => {
  it('validate catches empty id', () => {
    const mgr = new RegistryManager()
    const errors = mgr.validate(validManifest({ id: '' }))
    expect(errors).toContain('Module id is required')
  })

  it('validate catches invalid id format', () => {
    const mgr = new RegistryManager()
    const errors = mgr.validate(validManifest({ id: '123abc' }))
    expect(errors.some(e => e.includes('must start with a letter'))).toBe(true)
  })

  it('validate catches missing name', () => {
    const mgr = new RegistryManager()
    const errors = mgr.validate(validManifest({ name: '' }))
    expect(errors).toContain('Module name is required')
  })

  it('validate catches invalid version with strictSemver', () => {
    const mgr = new RegistryManager({ strictSemver: true })
    const errors = mgr.validate(validManifest({ version: '01.0.0' }))
    expect(errors.some(e => e.includes('strict semver'))).toBe(true)
  })

  it('validate catches missing description, author, license, main', () => {
    const mgr = new RegistryManager()
    const m = { ...validManifest(), description: '', author: '', license: '', main: '' }
    const errors = mgr.validate(m)
    expect(errors).toContain('Module description is required')
    expect(errors).toContain('Module author is required')
    expect(errors).toContain('Module license is required')
    expect(errors).toContain('Module main entry point is required')
  })

  it('validate catches non-array dependencies and exports', () => {
    const mgr = new RegistryManager()
    const m = { ...validManifest(), dependencies: 'not-array' as unknown as string[], exports: 'not-array' as unknown as string[] }
    const errors = mgr.validate(m)
    expect(errors).toContain('Module dependencies must be an array')
    expect(errors).toContain('Module exports must be an array')
  })

  it('validate returns empty array for valid manifest', () => {
    const mgr = new RegistryManager()
    expect(mgr.validate(validManifest())).toEqual([])
  })

  it('getConfig returns current config', () => {
    const mgr = new RegistryManager({ maxModules: 50 })
    expect(mgr.getConfig().maxModules).toBe(50)
  })

  it('list and listByState delegate correctly', () => {
    const mgr = new RegistryManager({ validateOnRegister: false })
    mgr.register(validManifest({ id: 'a' }))
    mgr.register(validManifest({ id: 'b' }))
    expect(mgr.list()).toHaveLength(2)
    expect(mgr.listByState('registered')).toHaveLength(2)
  })
})
