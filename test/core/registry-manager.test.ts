import { describe, it, expect } from 'vitest'
import { ModuleRegistry } from '../../src/core/registry-manager/module-registry.js'
import { RegistryManager } from '../../src/core/registry-manager/registry-manager.js'
import type { ModuleManifest, RegistryEntry, ResolveResult, RegistryConfig } from '../../src/core/registry-manager/types.js'
import { DEFAULT_REGISTRY_CONFIG } from '../../src/core/registry-manager/types.js'

function createManifest(overrides: Partial<ModuleManifest> = {}): ModuleManifest {
  return {
    id: 'test-module',
    name: 'Test Module',
    version: '1.0.0',
    description: 'A test module',
    dependencies: [],
    exports: ['default'],
    author: 'Test Author',
    license: 'MIT',
    main: './index.js',
    ...overrides,
  }
}

describe('ModuleRegistry', () => {
  describe('register', () => {
    it('should register a valid module', () => {
      const registry = new ModuleRegistry()
      const manifest = createManifest()
      const entry = registry.register(manifest)
      expect(entry.manifest.id).toBe('test-module')
      expect(entry.state).toBe('registered')
      expect(entry.registeredAt).toBeInstanceOf(Date)
    })

    it('should throw on duplicate id', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      expect(() => registry.register(createManifest())).toThrow('already registered')
    })

    it('should throw on invalid version format', () => {
      const registry = new ModuleRegistry()
      expect(() => registry.register(createManifest({ version: 'not-semver' }))).toThrow('Invalid version')
    })

    it('should accept valid semver with prerelease', () => {
      const registry = new ModuleRegistry()
      const entry = registry.register(createManifest({ version: '1.0.0-alpha.1' }))
      expect(entry.manifest.version).toBe('1.0.0-alpha.1')
    })

    it('should accept valid semver with build metadata', () => {
      const registry = new ModuleRegistry()
      const entry = registry.register(createManifest({ version: '1.0.0+build.123' }))
      expect(entry.manifest.version).toBe('1.0.0+build.123')
    })

    it('should reject version with extra characters', () => {
      const registry = new ModuleRegistry()
      expect(() => registry.register(createManifest({ version: 'v1.0.0' }))).toThrow('Invalid version')
    })

    it('should reject incomplete version', () => {
      const registry = new ModuleRegistry()
      expect(() => registry.register(createManifest({ version: '1.0' }))).toThrow('Invalid version')
    })
  })

  describe('unregister', () => {
    it('should remove an existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      expect(registry.unregister('test-module')).toBe(true)
      expect(registry.has('test-module')).toBe(false)
    })

    it('should return false for non-existent module', () => {
      const registry = new ModuleRegistry()
      expect(registry.unregister('non-existent')).toBe(false)
    })
  })

  describe('get', () => {
    it('should return entry for existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      const entry = registry.get('test-module')
      expect(entry).toBeDefined()
      expect(entry?.manifest.id).toBe('test-module')
    })

    it('should return undefined for non-existent module', () => {
      const registry = new ModuleRegistry()
      expect(registry.get('non-existent')).toBeUndefined()
    })

    it('should return a copy of the entry', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      const entry1 = registry.get('test-module')
      const entry2 = registry.get('test-module')
      expect(entry1).not.toBe(entry2)
      expect(entry1?.manifest.id).toBe(entry2?.manifest.id)
    })
  })

  describe('has', () => {
    it('should return true for existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      expect(registry.has('test-module')).toBe(true)
    })

    it('should return false for non-existent module', () => {
      const registry = new ModuleRegistry()
      expect(registry.has('non-existent')).toBe(false)
    })
  })

  describe('list', () => {
    it('should return empty array when no modules registered', () => {
      const registry = new ModuleRegistry()
      expect(registry.list()).toEqual([])
    })

    it('should return all registered modules', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest({ id: 'mod-a' }))
      registry.register(createManifest({ id: 'mod-b' }))
      const list = registry.list()
      expect(list).toHaveLength(2)
      const ids = list.map((e) => e.manifest.id)
      expect(ids).toContain('mod-a')
      expect(ids).toContain('mod-b')
    })
  })

  describe('listByState', () => {
    it('should filter entries by state', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest({ id: 'mod-a' }))
      registry.register(createManifest({ id: 'mod-b' }))
      registry.updateState('mod-a', 'resolved')
      const registered = registry.listByState('registered')
      const resolved = registry.listByState('resolved')
      expect(registered).toHaveLength(1)
      expect(resolved).toHaveLength(1)
      expect(registered[0]?.manifest.id).toBe('mod-b')
      expect(resolved[0]?.manifest.id).toBe('mod-a')
    })

    it('should return empty for state with no entries', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      expect(registry.listByState('error')).toEqual([])
    })
  })

  describe('updateState', () => {
    it('should update state of existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      registry.updateState('test-module', 'loaded')
      const entry = registry.get('test-module')
      expect(entry?.state).toBe('loaded')
    })

    it('should set error message', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest())
      registry.updateState('test-module', 'error', 'Something failed')
      const entry = registry.get('test-module')
      expect(entry?.state).toBe('error')
      expect(entry?.error).toBe('Something failed')
    })

    it('should not crash for non-existent module', () => {
      const registry = new ModuleRegistry()
      expect(() => registry.updateState('non-existent', 'loaded')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest({ id: 'a' }))
      registry.register(createManifest({ id: 'b' }))
      registry.clear()
      expect(registry.size).toBe(0)
      expect(registry.list()).toEqual([])
    })
  })

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      const registry = new ModuleRegistry()
      expect(registry.size).toBe(0)
    })

    it('should return count of registered modules', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest({ id: 'a' }))
      registry.register(createManifest({ id: 'b' }))
      expect(registry.size).toBe(2)
    })

    it('should decrease after unregister', () => {
      const registry = new ModuleRegistry()
      registry.register(createManifest({ id: 'a' }))
      registry.register(createManifest({ id: 'b' }))
      registry.unregister('a')
      expect(registry.size).toBe(1)
    })
  })
})

describe('RegistryManager', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const rm = new RegistryManager()
      const config = rm.getConfig()
      expect(config.validateOnRegister).toBe(DEFAULT_REGISTRY_CONFIG.validateOnRegister)
      expect(config.strictSemver).toBe(DEFAULT_REGISTRY_CONFIG.strictSemver)
      expect(config.maxModules).toBe(DEFAULT_REGISTRY_CONFIG.maxModules)
    })

    it('should accept partial config', () => {
      const rm = new RegistryManager({ strictSemver: true })
      const config = rm.getConfig()
      expect(config.strictSemver).toBe(true)
      expect(config.validateOnRegister).toBe(DEFAULT_REGISTRY_CONFIG.validateOnRegister)
    })

    it('should accept full config', () => {
      const rm = new RegistryManager({
        validateOnRegister: false,
        strictSemver: true,
        maxModules: 500,
      })
      const config = rm.getConfig()
      expect(config.validateOnRegister).toBe(false)
      expect(config.strictSemver).toBe(true)
      expect(config.maxModules).toBe(500)
    })
  })

  describe('register', () => {
    it('should register a valid module with validation enabled', () => {
      const rm = new RegistryManager({ validateOnRegister: true })
      const entry = rm.register(createManifest())
      expect(entry.manifest.id).toBe('test-module')
      expect(entry.state).toBe('registered')
    })

    it('should skip validation when validateOnRegister is false', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      const entry = rm.register(createManifest({ id: '' }))
      expect(entry).toBeDefined()
    })

    it('should throw on validation failure', () => {
      const rm = new RegistryManager({ validateOnRegister: true })
      expect(() => rm.register(createManifest({ id: '' }))).toThrow('Validation failed')
    })

    it('should throw when maxModules is exceeded', () => {
      const rm = new RegistryManager({ maxModules: 2, validateOnRegister: false })
      rm.register(createManifest({ id: 'a' }))
      rm.register(createManifest({ id: 'b' }))
      expect(() => rm.register(createManifest({ id: 'c' }))).toThrow('Maximum module limit')
    })
  })

  describe('unregister', () => {
    it('should delegate to registry', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest())
      expect(rm.unregister('test-module')).toBe(true)
      expect(rm.get('test-module')).toBeUndefined()
    })

    it('should return false for non-existent module', () => {
      const rm = new RegistryManager()
      expect(rm.unregister('non-existent')).toBe(false)
    })
  })

  describe('resolve', () => {
    it('should resolve a single module with no dependencies', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a' }))
      const result = rm.resolve('a')
      expect(result.resolved).toBe(true)
      expect(result.missingDeps).toEqual([])
      expect(result.resolvedOrder).toEqual(['a'])
    })

    it('should resolve module with dependencies', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      const result = rm.resolve('b')
      expect(result.resolved).toBe(true)
      expect(result.resolvedOrder).toEqual(['a', 'b'])
    })

    it('should detect circular dependencies', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: ['b'] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      const result = rm.resolve('a')
      expect(result.resolved).toBe(false)
    })

    it('should detect missing dependencies', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: ['missing'] }))
      const result = rm.resolve('a')
      expect(result.resolved).toBe(false)
      expect(result.missingDeps).toContain('missing')
    })

    it('should return empty result for non-existent module', () => {
      const rm = new RegistryManager()
      const result = rm.resolve('non-existent')
      expect(result.resolved).toBe(false)
      expect(result.missingDeps).toEqual([])
      expect(result.resolvedOrder).toEqual([])
    })

    it('should resolve deep dependency chain', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      rm.register(createManifest({ id: 'c', dependencies: ['b'] }))
      rm.register(createManifest({ id: 'd', dependencies: ['c'] }))
      const result = rm.resolve('d')
      expect(result.resolved).toBe(true)
      expect(result.resolvedOrder).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should resolve diamond dependency', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      rm.register(createManifest({ id: 'c', dependencies: ['a'] }))
      rm.register(createManifest({ id: 'd', dependencies: ['b', 'c'] }))
      const result = rm.resolve('d')
      expect(result.resolved).toBe(true)
      expect(result.resolvedOrder).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should detect circular deps in longer chain', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: ['c'] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      rm.register(createManifest({ id: 'c', dependencies: ['b'] }))
      const result = rm.resolve('a')
      expect(result.resolved).toBe(false)
    })

    it('should update module state to resolved', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a' }))
      rm.resolve('a')
      const entry = rm.get('a')
      expect(entry?.state).toBe('resolved')
    })
  })

  describe('resolveAll', () => {
    it('should resolve all modules', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      const results = rm.resolveAll()
      expect(results.size).toBe(2)
      expect(results.get('a')?.resolved).toBe(true)
      expect(results.get('b')?.resolved).toBe(true)
    })

    it('should return empty map for empty registry', () => {
      const rm = new RegistryManager()
      const results = rm.resolveAll()
      expect(results.size).toBe(0)
    })

    it('should report unresolved modules', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: ['missing'] }))
      const results = rm.resolveAll()
      expect(results.get('a')?.resolved).toBe(false)
      expect(results.get('a')?.missingDeps).toContain('missing')
    })
  })

  describe('getDependencyGraph', () => {
    it('should return empty map for empty registry', () => {
      const rm = new RegistryManager()
      expect(rm.getDependencyGraph().size).toBe(0)
    })

    it('should return dependency graph', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: ['b', 'c'] }))
      rm.register(createManifest({ id: 'b', dependencies: [] }))
      rm.register(createManifest({ id: 'c', dependencies: [] }))
      const graph = rm.getDependencyGraph()
      expect(graph.get('a')).toEqual(['b', 'c'])
      expect(graph.get('b')).toEqual([])
      expect(graph.get('c')).toEqual([])
    })
  })

  describe('getDependents', () => {
    it('should return modules that depend on given id', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      rm.register(createManifest({ id: 'c', dependencies: ['a'] }))
      rm.register(createManifest({ id: 'd', dependencies: ['b'] }))
      const dependents = rm.getDependents('a')
      expect(dependents).toContain('b')
      expect(dependents).toContain('c')
      expect(dependents).not.toContain('d')
    })

    it('should return empty for module with no dependents', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      expect(rm.getDependents('a')).toEqual([])
    })

    it('should return empty for non-existent module', () => {
      const rm = new RegistryManager()
      expect(rm.getDependents('non-existent')).toEqual([])
    })
  })

  describe('validate', () => {
    it('should return empty errors for valid manifest', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest())
      expect(errors).toEqual([])
    })

    it('should detect missing id', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ id: '' }))
      expect(errors).toContain('Module id is required')
    })

    it('should detect invalid id format', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ id: '123invalid' }))
      expect(errors.some((e) => e.includes('must start with a letter'))).toBe(true)
    })

    it('should accept valid id with underscore', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ id: 'my_module' }))
      expect(errors).toEqual([])
    })

    it('should accept valid id with hyphen', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ id: 'my-module' }))
      expect(errors).toEqual([])
    })

    it('should reject id starting with number', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ id: '1module' }))
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should detect missing name', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ name: '' }))
      expect(errors).toContain('Module name is required')
    })

    it('should detect missing version', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ version: '' }))
      expect(errors.some((e) => e.includes('version'))).toBe(true)
    })

    it('should detect invalid version format', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ version: 'abc' }))
      expect(errors.some((e) => e.includes('semver'))).toBe(true)
    })

    it('should detect missing description', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ description: '' }))
      expect(errors).toContain('Module description is required')
    })

    it('should detect missing author', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ author: '' }))
      expect(errors).toContain('Module author is required')
    })

    it('should detect missing license', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ license: '' }))
      expect(errors).toContain('Module license is required')
    })

    it('should detect missing main', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ main: '' }))
      expect(errors).toContain('Module main entry point is required')
    })

    it('should detect multiple errors', () => {
      const rm = new RegistryManager()
      const errors = rm.validate(createManifest({ id: '', name: '' }))
      expect(errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('strict semver mode', () => {
    it('should accept valid strict semver', () => {
      const rm = new RegistryManager({ strictSemver: true })
      const errors = rm.validate(createManifest({ version: '1.0.0' }))
      expect(errors).toEqual([])
    })

    it('should accept strict semver with prerelease', () => {
      const rm = new RegistryManager({ strictSemver: true })
      const errors = rm.validate(createManifest({ version: '1.0.0-alpha.1' }))
      expect(errors).toEqual([])
    })

    it('should reject leading zeros in strict mode', () => {
      const rm = new RegistryManager({ strictSemver: true })
      const errors = rm.validate(createManifest({ version: '01.0.0' }))
      expect(errors.some((e) => e.includes('semver'))).toBe(true)
    })
  })

  describe('getConfig', () => {
    it('should return current config', () => {
      const rm = new RegistryManager({ maxModules: 50 })
      const config = rm.getConfig()
      expect(config.maxModules).toBe(50)
    })

    it('should return a copy of config', () => {
      const rm = new RegistryManager()
      const config = rm.getConfig()
      config.maxModules = 9999
      expect(rm.getConfig().maxModules).toBe(DEFAULT_REGISTRY_CONFIG.maxModules)
    })
  })

  describe('list and listByState delegation', () => {
    it('should delegate list', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a' }))
      rm.register(createManifest({ id: 'b' }))
      expect(rm.list()).toHaveLength(2)
    })

    it('should delegate listByState', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a' }))
      rm.register(createManifest({ id: 'b' }))
      rm.resolve('a')
      expect(rm.listByState('resolved')).toHaveLength(1)
      expect(rm.listByState('registered')).toHaveLength(1)
    })
  })

  describe('unregister cascade', () => {
    it('should break dependency chain after unregister', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      rm.unregister('a')
      const result = rm.resolve('b')
      expect(result.resolved).toBe(false)
      expect(result.missingDeps).toContain('a')
    })
  })

  describe('get', () => {
    it('should return undefined for non-existent module', () => {
      const rm = new RegistryManager()
      expect(rm.get('non-existent')).toBeUndefined()
    })
  })

  describe('resolve with self-dependency', () => {
    it('should detect self-referencing circular dep', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: ['a'] }))
      const result = rm.resolve('a')
      expect(result.resolved).toBe(false)
    })
  })

  describe('resolve with multiple missing deps', () => {
    it('should report all missing dependencies', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: ['missing1', 'missing2'] }))
      const result = rm.resolve('a')
      expect(result.resolved).toBe(false)
      expect(result.missingDeps).toContain('missing1')
      expect(result.missingDeps).toContain('missing2')
    })
  })

  describe('getDependencyGraph after unregister', () => {
    it('should not include unregistered modules', () => {
      const rm = new RegistryManager({ validateOnRegister: false })
      rm.register(createManifest({ id: 'a', dependencies: [] }))
      rm.register(createManifest({ id: 'b', dependencies: ['a'] }))
      rm.unregister('a')
      const graph = rm.getDependencyGraph()
      expect(graph.has('a')).toBe(false)
      expect(graph.get('b')).toEqual(['a'])
    })
  })
})

describe('DEFAULT_REGISTRY_CONFIG', () => {
  it('should have default values', () => {
    expect(DEFAULT_REGISTRY_CONFIG.validateOnRegister).toBe(true)
    expect(DEFAULT_REGISTRY_CONFIG.strictSemver).toBe(false)
    expect(DEFAULT_REGISTRY_CONFIG.maxModules).toBe(1000)
  })
})

describe('RegistryEntry', () => {
  it('should have all required fields', () => {
    const registry = new ModuleRegistry()
    registry.register(createManifest())
    const entry: RegistryEntry = registry.get('test-module')!
    expect(entry).toHaveProperty('manifest')
    expect(entry).toHaveProperty('registeredAt')
    expect(entry).toHaveProperty('state')
  })
})

describe('ResolveResult', () => {
  it('should have all required fields', () => {
    const rm = new RegistryManager({ validateOnRegister: false })
    rm.register(createManifest())
    const result: ResolveResult = rm.resolve('test-module')
    expect(result).toHaveProperty('resolved')
    expect(result).toHaveProperty('missingDeps')
    expect(result).toHaveProperty('resolvedOrder')
  })
})

describe('RegistryConfig', () => {
  it('should have all required fields', () => {
    const config: RegistryConfig = { ...DEFAULT_REGISTRY_CONFIG }
    expect(config).toHaveProperty('validateOnRegister')
    expect(config).toHaveProperty('strictSemver')
    expect(config).toHaveProperty('maxModules')
  })
})
