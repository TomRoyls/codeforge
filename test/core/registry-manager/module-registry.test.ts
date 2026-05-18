import { describe, expect, it } from 'vitest'
import { ModuleRegistry } from '../../../src/core/registry-manager/module-registry.js'
import type { ModuleManifest } from '../../../src/core/registry-manager/types.js'

// ─── Helpers ───

function makeManifest(overrides: Partial<ModuleManifest> = {}): ModuleManifest {
  return {
    id: 'test-module',
    name: 'Test Module',
    version: '1.0.0',
    description: 'A test module',
    dependencies: [],
    exports: ['main'],
    author: 'test',
    license: 'MIT',
    main: 'index.js',
    ...overrides,
  }
}

// ─── Constructor ───

describe('ModuleRegistry', () => {
  it('starts empty', () => {
    const registry = new ModuleRegistry()
    expect(registry.size).toBe(0)
    expect(registry.list()).toEqual([])
  })

  // ─── register ───

  describe('register', () => {
    it('registers a valid module', () => {
      const registry = new ModuleRegistry()
      const entry = registry.register(makeManifest())
      expect(entry.manifest.id).toBe('test-module')
      expect(entry.state).toBe('registered')
      expect(entry.registeredAt).toBeInstanceOf(Date)
      expect(entry.error).toBeUndefined()
    })

    it('throws on duplicate id', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      expect(() => registry.register(makeManifest())).toThrow('already registered')
    })

    it('throws on invalid semver', () => {
      const registry = new ModuleRegistry()
      expect(() => registry.register(makeManifest({ version: 'not-semver' }))).toThrow('Invalid version')
    })

    it('accepts prerelease semver', () => {
      const registry = new ModuleRegistry()
      const entry = registry.register(makeManifest({ version: '1.0.0-beta.1' }))
      expect(entry.manifest.version).toBe('1.0.0-beta.1')
    })

    it('accepts build metadata semver', () => {
      const registry = new ModuleRegistry()
      const entry = registry.register(makeManifest({ version: '1.0.0+build.123' }))
      expect(entry.manifest.version).toBe('1.0.0+build.123')
    })

    it('increments size', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest({ id: 'a' }))
      registry.register(makeManifest({ id: 'b' }))
      expect(registry.size).toBe(2)
    })
  })

  // ─── unregister ───

  describe('unregister', () => {
    it('removes an existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      expect(registry.unregister('test-module')).toBe(true)
      expect(registry.size).toBe(0)
    })

    it('returns false for missing module', () => {
      const registry = new ModuleRegistry()
      expect(registry.unregister('nonexistent')).toBe(false)
    })
  })

  // ─── get ───

  describe('get', () => {
    it('returns entry for existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      const entry = registry.get('test-module')
      expect(entry).toBeDefined()
      expect(entry!.manifest.id).toBe('test-module')
    })

    it('returns undefined for missing module', () => {
      const registry = new ModuleRegistry()
      expect(registry.get('nonexistent')).toBeUndefined()
    })

    it('returns a copy', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      const entry1 = registry.get('test-module')
      const entry2 = registry.get('test-module')
      expect(entry1).toEqual(entry2)
      expect(entry1).not.toBe(entry2)
    })
  })

  // ─── has ───

  describe('has', () => {
    it('returns true for existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      expect(registry.has('test-module')).toBe(true)
    })

    it('returns false for missing module', () => {
      const registry = new ModuleRegistry()
      expect(registry.has('nonexistent')).toBe(false)
    })
  })

  // ─── list ───

  describe('list', () => {
    it('returns all entries', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest({ id: 'a' }))
      registry.register(makeManifest({ id: 'b' }))
      expect(registry.list()).toHaveLength(2)
    })

    it('returns copies', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      const list = registry.list()
      const list2 = registry.list()
      expect(list[0]).not.toBe(list2[0])
    })
  })

  // ─── listByState ───

  describe('listByState', () => {
    it('filters by state', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest({ id: 'a' }))
      registry.register(makeManifest({ id: 'b' }))
      registry.updateState('a', 'loaded')
      const loaded = registry.listByState('loaded')
      expect(loaded).toHaveLength(1)
      expect(loaded[0]!.manifest.id).toBe('a')
    })

    it('returns empty for no matches', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      expect(registry.listByState('error')).toEqual([])
    })
  })

  // ─── updateState ───

  describe('updateState', () => {
    it('updates state of existing module', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      registry.updateState('test-module', 'loaded')
      expect(registry.get('test-module')!.state).toBe('loaded')
    })

    it('sets error message', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest())
      registry.updateState('test-module', 'error', 'something broke')
      const entry = registry.get('test-module')!
      expect(entry.state).toBe('error')
      expect(entry.error).toBe('something broke')
    })

    it('does nothing for missing module', () => {
      const registry = new ModuleRegistry()
      expect(() => registry.updateState('nonexistent', 'loaded')).not.toThrow()
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('removes all entries', () => {
      const registry = new ModuleRegistry()
      registry.register(makeManifest({ id: 'a' }))
      registry.register(makeManifest({ id: 'b' }))
      registry.clear()
      expect(registry.size).toBe(0)
      expect(registry.list()).toEqual([])
    })
  })
})
