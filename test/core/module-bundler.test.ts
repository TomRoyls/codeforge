import { describe, it, expect } from 'vitest'
import { ModuleBundler } from '../../src/core/module-bundler/module-bundler.js'
import type { BundleModule } from '../../src/core/module-bundler/types.js'

function makeModule(id: string, deps: string[] = [], code: string = `// ${id}`, size?: number): BundleModule {
  return { id, code, dependencies: deps, size: size ?? code.length }
}

describe('ModuleBundler', () => {
  describe('Module management', () => {
    it('should add a module and return true', () => {
      const bundler = new ModuleBundler()
      const result = bundler.addModule(makeModule('a'))
      expect(result).toBe(true)
    })

    it('should return false when adding duplicate module', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      const result = bundler.addModule(makeModule('a'))
      expect(result).toBe(false)
    })

    it('should get a module by id', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      const mod = bundler.getModule('a')
      expect(mod).toBeDefined()
      expect(mod!.id).toBe('a')
    })

    it('should return undefined for non-existent module', () => {
      const bundler = new ModuleBundler()
      expect(bundler.getModule('missing')).toBeUndefined()
    })

    it('should remove a module and return true', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      const result = bundler.removeModule('a')
      expect(result).toBe(true)
      expect(bundler.getModule('a')).toBeUndefined()
    })

    it('should return false when removing non-existent module', () => {
      const bundler = new ModuleBundler()
      expect(bundler.removeModule('missing')).toBe(false)
    })

    it('should get all modules', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      bundler.addModule(makeModule('b'))
      const mods = bundler.getModules()
      expect(mods).toHaveLength(2)
    })

    it('should clear all modules', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      bundler.addModule(makeModule('b'))
      bundler.clear()
      expect(bundler.getModules()).toHaveLength(0)
    })

    it('should remove dangling dependency references when module removed', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      bundler.removeModule('b')
      expect(bundler.getModule('a')!.dependencies).not.toContain('b')
    })
  })

  describe('Bundle', () => {
    it('should produce single chunk output with single entrypoint', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a'] })
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(1)
      expect(output.entrypoints).toEqual(['a'])
    })

    it('should produce output with multiple entrypoints', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a', 'c'] })
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      bundler.addModule(makeModule('c'))
      const output = bundler.bundle()
      expect(output.entrypoints).toEqual(['a', 'c'])
    })

    it('should compute total size from chunks', () => {
      const bundler = new ModuleBundler({ splitting: 'single' })
      bundler.addModule(makeModule('a', [], 'aaaa', 4))
      bundler.addModule(makeModule('b', [], 'bb', 2))
      const output = bundler.bundle()
      expect(output.totalSize).toBe(6)
    })

    it('should include modules map in output', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      const output = bundler.bundle()
      expect(output.modules.size).toBe(1)
      expect(output.modules.has('a')).toBe(true)
    })

    it('should produce correct module ordering in single chunk', () => {
      const bundler = new ModuleBundler({ splitting: 'single', entrypoints: ['a'] })
      bundler.addModule(makeModule('a', ['b', 'c']))
      bundler.addModule(makeModule('b', ['d']))
      bundler.addModule(makeModule('c'))
      bundler.addModule(makeModule('d'))
      const output = bundler.bundle()
      const modules = output.chunks[0]!.modules
      const dIdx = modules.indexOf('d')
      const bIdx = modules.indexOf('b')
      const cIdx = modules.indexOf('c')
      const aIdx = modules.indexOf('a')
      expect(dIdx).toBeLessThan(bIdx)
      expect(bIdx).toBeLessThan(aIdx)
      expect(cIdx).toBeLessThan(aIdx)
    })

    it('should use all modules as entrypoints when none configured', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      bundler.addModule(makeModule('b'))
      const output = bundler.bundle()
      expect(output.entrypoints).toContain('a')
      expect(output.entrypoints).toContain('b')
    })
  })

  describe('Chunk splitting', () => {
    it('should auto split by size limit', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 50, splitting: 'auto' })
      bundler.addModule(makeModule('a', [], 'a'.repeat(30), 30))
      bundler.addModule(makeModule('b', [], 'b'.repeat(30), 30))
      bundler.addModule(makeModule('c', [], 'c'.repeat(30), 30))
      const output = bundler.bundle()
      expect(output.chunks.length).toBeGreaterThanOrEqual(2)
    })

    it('should produce single chunk in single mode', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 10, splitting: 'single' })
      bundler.addModule(makeModule('a', [], 'a'.repeat(30), 30))
      bundler.addModule(makeModule('b', [], 'b'.repeat(30), 30))
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(1)
      expect(output.chunks[0]!.modules).toHaveLength(2)
    })

    it('should produce one chunk per entrypoint in eager mode', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a', 'c'], splitting: 'eager' })
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      bundler.addModule(makeModule('c'))
      const output = bundler.bundle()
      expect(output.chunks.length).toBeGreaterThanOrEqual(2)
    })

    it('should respect minChunkSize', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 50, minChunkSize: 30, splitting: 'auto' })
      bundler.addModule(makeModule('a', [], 'a'.repeat(30), 30))
      bundler.addModule(makeModule('b', [], 'b'.repeat(10), 10))
      bundler.addModule(makeModule('c', [], 'c'.repeat(30), 30))
      const output = bundler.bundle()
      for (const chunk of output.chunks) {
        if (chunk.modules.length > 0) {
          expect(chunk.size).toBeGreaterThanOrEqual(30)
        }
      }
    })

    it('should handle splitting with no modules', () => {
      const bundler = new ModuleBundler({ splitting: 'auto' })
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(0)
    })

    it('should create chunk with correct dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      const chunk = bundler.createChunk(['a'], 'test-chunk')
      expect(chunk.dependencies).toContain('b')
    })

    it('should create chunk with empty dependencies for self-contained modules', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      const chunk = bundler.createChunk(['a', 'b'], 'test-chunk')
      expect(chunk.dependencies).toHaveLength(0)
    })

    it('should handle createChunk with non-existent module', () => {
      const bundler = new ModuleBundler()
      const chunk = bundler.createChunk(['missing'], 'test-chunk')
      expect(chunk.modules).toHaveLength(0)
      expect(chunk.size).toBe(0)
    })
  })

  describe('Resolution', () => {
    it('should compute topological resolution order', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b', ['c']))
      bundler.addModule(makeModule('c'))
      const order = bundler.resolveOrder('a')
      expect(order).toContain('a')
      expect(order).toContain('b')
      expect(order).toContain('c')
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
    })

    it('should handle diamond dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b', 'c']))
      bundler.addModule(makeModule('b', ['d']))
      bundler.addModule(makeModule('c', ['d']))
      bundler.addModule(makeModule('d'))
      const order = bundler.resolveOrder('a')
      expect(order.indexOf('d')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('d')).toBeLessThan(order.indexOf('c'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('a'))
      const dCount = order.filter((x) => x === 'd').length
      expect(dCount).toBe(1)
    })

    it('should handle chain dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b', ['c']))
      bundler.addModule(makeModule('c', ['d']))
      bundler.addModule(makeModule('d'))
      const order = bundler.resolveOrder('a')
      expect(order).toEqual(['d', 'c', 'b', 'a'])
    })

    it('should handle non-existent entrypoint in resolveOrder', () => {
      const bundler = new ModuleBundler()
      const order = bundler.resolveOrder('missing')
      expect(order).toEqual(['missing'])
    })

    it('should handle module with no dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      const order = bundler.resolveOrder('a')
      expect(order).toEqual(['a'])
    })
  })

  describe('Circular detection', () => {
    it('should return empty array when no cycles', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      expect(bundler.detectCircular()).toEqual([])
    })

    it('should detect a simple cycle', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b', ['a']))
      const cycles = bundler.detectCircular()
      expect(cycles.length).toBeGreaterThan(0)
    })

    it('should detect multiple cycles', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b', ['a']))
      bundler.addModule(makeModule('c', ['d']))
      bundler.addModule(makeModule('d', ['c']))
      const cycles = bundler.detectCircular()
      expect(cycles.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect a three-node cycle', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b', ['c']))
      bundler.addModule(makeModule('c', ['a']))
      const cycles = bundler.detectCircular()
      expect(cycles.length).toBeGreaterThan(0)
    })

    it('should return empty for independent modules', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      bundler.addModule(makeModule('b'))
      bundler.addModule(makeModule('c'))
      expect(bundler.detectCircular()).toEqual([])
    })
  })

  describe('Dependencies', () => {
    it('should get direct dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b', 'c']))
      expect(bundler.getDependencies('a')).toEqual(['b', 'c'])
    })

    it('should return empty for module with no dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      expect(bundler.getDependencies('a')).toEqual([])
    })

    it('should return empty for non-existent module dependencies', () => {
      const bundler = new ModuleBundler()
      expect(bundler.getDependencies('missing')).toEqual([])
    })

    it('should get dependents of a module', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['c']))
      bundler.addModule(makeModule('b', ['c']))
      bundler.addModule(makeModule('c'))
      const dependents = bundler.getDependents('c')
      expect(dependents).toContain('a')
      expect(dependents).toContain('b')
    })

    it('should return empty dependents for leaf module', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      expect(bundler.getDependents('a')).toEqual([])
    })

    it('should get transitive dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b', ['c']))
      bundler.addModule(makeModule('c'))
      const transitive = bundler.getTransitiveDependencies('a')
      expect(transitive).toContain('b')
      expect(transitive).toContain('c')
    })

    it('should handle transitive deps with diamond pattern', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b', 'c']))
      bundler.addModule(makeModule('b', ['d']))
      bundler.addModule(makeModule('c', ['d']))
      bundler.addModule(makeModule('d'))
      const transitive = bundler.getTransitiveDependencies('a')
      expect(transitive).toContain('b')
      expect(transitive).toContain('c')
      expect(transitive).toContain('d')
      const dCount = transitive.filter((x) => x === 'd').length
      expect(dCount).toBe(1)
    })

    it('should return empty transitive deps for module with no deps', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      expect(bundler.getTransitiveDependencies('a')).toEqual([])
    })
  })

  describe('Analysis', () => {
    it('should find unused modules', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a'] })
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      bundler.addModule(makeModule('orphan'))
      const unused = bundler.getUnusedModules()
      expect(unused).toContain('orphan')
      expect(unused).not.toContain('a')
      expect(unused).not.toContain('b')
    })

    it('should return empty unused when all reachable', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a'] })
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      expect(bundler.getUnusedModules()).toEqual([])
    })

    it('should get module size', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', [], 'hello world', 11))
      expect(bundler.getModuleSize('a')).toBe(11)
    })

    it('should return 0 for non-existent module size', () => {
      const bundler = new ModuleBundler()
      expect(bundler.getModuleSize('missing')).toBe(0)
    })

    it('should compute statistics', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b'], 'a'.repeat(10), 10))
      bundler.addModule(makeModule('b', [], 'b'.repeat(5), 5))
      const stats = bundler.getStatistics()
      expect(stats.totalModules).toBe(2)
      expect(stats.totalSize).toBe(15)
      expect(stats.maxSize).toBe(10)
      expect(stats.minSize).toBe(5)
      expect(stats.avgSize).toBe(7.5)
      expect(stats.dependencyCount).toBe(1)
    })

    it('should return zero statistics for empty bundler', () => {
      const bundler = new ModuleBundler()
      const stats = bundler.getStatistics()
      expect(stats.totalModules).toBe(0)
      expect(stats.totalSize).toBe(0)
      expect(stats.maxSize).toBe(0)
      expect(stats.minSize).toBe(0)
      expect(stats.avgSize).toBe(0)
      expect(stats.dependencyCount).toBe(0)
    })

    it('should compute correct avgSize', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', [], '', 100))
      bundler.addModule(makeModule('b', [], '', 200))
      bundler.addModule(makeModule('c', [], '', 300))
      expect(bundler.getStatistics().avgSize).toBe(200)
    })
  })

  describe('Validation', () => {
    it('should warn about missing dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['missing']))
      const warnings = bundler.validate()
      const missing = warnings.filter((w) => w.type === 'missing')
      expect(missing.length).toBeGreaterThan(0)
      expect(missing[0]!.module).toBe('a')
    })

    it('should warn about circular dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b', ['a']))
      const warnings = bundler.validate()
      const circular = warnings.filter((w) => w.type === 'circular')
      expect(circular.length).toBeGreaterThan(0)
    })

    it('should warn about oversized modules', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 10 })
      bundler.addModule(makeModule('a', [], 'a'.repeat(50), 50))
      const warnings = bundler.validate()
      const oversized = warnings.filter((w) => w.type === 'oversized')
      expect(oversized.length).toBeGreaterThan(0)
      expect(oversized[0]!.module).toBe('a')
    })

    it('should warn about unused modules', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a'] })
      bundler.addModule(makeModule('a'))
      bundler.addModule(makeModule('orphan'))
      const warnings = bundler.validate()
      const unused = warnings.filter((w) => w.type === 'unused')
      expect(unused.length).toBeGreaterThan(0)
      expect(unused[0]!.module).toBe('orphan')
    })

    it('should return no warnings for valid setup', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 1000, entrypoints: ['a'] })
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      const warnings = bundler.validate()
      expect(warnings).toEqual([])
    })

    it('should return multiple warning types', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 5, entrypoints: ['a'] })
      bundler.addModule(makeModule('a', ['b', 'missing'], 'a'.repeat(10), 10))
      bundler.addModule(makeModule('b', ['a']))
      const warnings = bundler.validate()
      const types = new Set(warnings.map((w) => w.type))
      expect(types.has('missing')).toBe(true)
      expect(types.has('circular')).toBe(true)
      expect(types.has('oversized')).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle no modules', () => {
      const bundler = new ModuleBundler()
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(0)
      expect(output.totalSize).toBe(0)
      expect(output.modules.size).toBe(0)
    })

    it('should handle single module', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(1)
      expect(output.chunks[0]!.modules).toContain('a')
    })

    it('should handle no entrypoints', () => {
      const bundler = new ModuleBundler({ entrypoints: [] })
      bundler.addModule(makeModule('a'))
      bundler.addModule(makeModule('b'))
      const output = bundler.bundle()
      expect(output.entrypoints).toHaveLength(2)
    })

    it('should handle all modules independent', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      bundler.addModule(makeModule('b'))
      bundler.addModule(makeModule('c'))
      expect(bundler.detectCircular()).toEqual([])
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(1)
    })

    it('should preserve module data immutably', () => {
      const bundler = new ModuleBundler()
      const mod = makeModule('a', ['b'])
      bundler.addModule(mod)
      mod.dependencies.push('c')
      expect(bundler.getModule('a')!.dependencies).toEqual(['b'])
    })

    it('should handle removeModule cleaning up references from multiple modules', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['x']))
      bundler.addModule(makeModule('b', ['x']))
      bundler.addModule(makeModule('x'))
      bundler.removeModule('x')
      expect(bundler.getModule('a')!.dependencies).not.toContain('x')
      expect(bundler.getModule('b')!.dependencies).not.toContain('x')
    })

    it('should handle eager splitting with shared dependencies', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a', 'c'], splitting: 'eager' })
      bundler.addModule(makeModule('a', ['shared']))
      bundler.addModule(makeModule('c', ['shared']))
      bundler.addModule(makeModule('shared'))
      const output = bundler.bundle()
      const allModules = output.chunks.flatMap((c) => c.modules)
      const sharedCount = allModules.filter((m) => m === 'shared').length
      expect(sharedCount).toBe(1)
    })

    it('should handle splitting where last chunk is too small', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 100, minChunkSize: 50, splitting: 'auto' })
      bundler.addModule(makeModule('a', [], 'a', 80))
      bundler.addModule(makeModule('b', [], 'b', 10))
      const output = bundler.bundle()
      expect(output.chunks.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle validate with no warnings on clean graph', () => {
      const bundler = new ModuleBundler({ entrypoints: ['main'] })
      bundler.addModule(makeModule('main', ['utils']))
      bundler.addModule(makeModule('utils'))
      expect(bundler.validate()).toEqual([])
    })

    it('should handle empty bundler validate', () => {
      const bundler = new ModuleBundler()
      expect(bundler.validate()).toEqual([])
    })

    it('should handle missing dep warning message format', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('app', ['nonexistent']))
      const warnings = bundler.validate()
      const missing = warnings.find((w) => w.type === 'missing')
      expect(missing).toBeDefined()
      expect(missing!.message).toContain('app')
      expect(missing!.message).toContain('nonexistent')
    })

    it('should detect multiple missing deps', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['x', 'y']))
      const warnings = bundler.validate().filter((w) => w.type === 'missing')
      expect(warnings).toHaveLength(2)
    })

    it('should not flag oversized when within limit', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 100 })
      bundler.addModule(makeModule('a', [], 'a'.repeat(50), 50))
      const warnings = bundler.validate().filter((w) => w.type === 'oversized')
      expect(warnings).toHaveLength(0)
    })
  })

  describe('Constructor and config', () => {
    it('should use default config when none provided', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      const output = bundler.bundle()
      expect(output.entrypoints).toContain('a')
    })

    it('should accept partial config', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 500 })
      bundler.addModule(makeModule('a', [], 'a'.repeat(100), 100))
      bundler.addModule(makeModule('b', [], 'b'.repeat(100), 100))
      bundler.addModule(makeModule('c', [], 'c'.repeat(100), 100))
      bundler.addModule(makeModule('d', [], 'd'.repeat(100), 100))
      bundler.addModule(makeModule('e', [], 'e'.repeat(100), 100))
      bundler.addModule(makeModule('f', [], 'f'.repeat(100), 100))
      const output = bundler.bundle()
      expect(output.chunks.length).toBeGreaterThanOrEqual(1)
    })

    it('should use default chunkSizeLimit of 1000', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', [], 'a'.repeat(999), 999))
      const warnings = bundler.validate().filter((w) => w.type === 'oversized')
      expect(warnings).toHaveLength(0)
    })
  })

  describe('Advanced splitting', () => {
    it('should split into correct number of chunks based on limit', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 100, splitting: 'auto' })
      for (let i = 0; i < 5; i++) {
        bundler.addModule(makeModule(`mod${i}`, [], `code${i}`, 60))
      }
      const output = bundler.bundle()
      expect(output.chunks.length).toBeGreaterThanOrEqual(2)
    })

    it('should assign sequential chunk ids', () => {
      const bundler = new ModuleBundler({ chunkSizeLimit: 50, splitting: 'auto' })
      bundler.addModule(makeModule('a', [], 'a'.repeat(30), 30))
      bundler.addModule(makeModule('b', [], 'b'.repeat(30), 30))
      bundler.addModule(makeModule('c', [], 'c'.repeat(30), 30))
      const output = bundler.bundle()
      for (let i = 0; i < output.chunks.length; i++) {
        expect(output.chunks[i]!.id).toBe(`chunk-${i}`)
      }
    })

    it('should handle eager splitting with remaining modules', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a'], splitting: 'eager' })
      bundler.addModule(makeModule('a', ['b']))
      bundler.addModule(makeModule('b'))
      bundler.addModule(makeModule('orphan'))
      const output = bundler.bundle()
      const allModules = output.chunks.flatMap((c) => c.modules)
      expect(allModules).toContain('orphan')
    })

    it('should handle eager splitting with all modules reachable', () => {
      const bundler = new ModuleBundler({ entrypoints: ['a'], splitting: 'eager' })
      bundler.addModule(makeModule('a', ['b', 'c']))
      bundler.addModule(makeModule('b'))
      bundler.addModule(makeModule('c'))
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(1)
      expect(output.chunks[0]!.modules).toHaveLength(3)
    })

    it('should handle single splitting mode regardless of size', () => {
      const bundler = new ModuleBundler({ splitting: 'single', chunkSizeLimit: 10 })
      bundler.addModule(makeModule('a', [], 'a'.repeat(100), 100))
      bundler.addModule(makeModule('b', [], 'b'.repeat(100), 100))
      bundler.addModule(makeModule('c', [], 'c'.repeat(100), 100))
      const output = bundler.bundle()
      expect(output.chunks).toHaveLength(1)
    })
  })

  describe('Additional dependency tests', () => {
    it('should get dependents for non-existent module', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a'))
      expect(bundler.getDependents('missing')).toEqual([])
    })

    it('should get transitive deps for non-existent module', () => {
      const bundler = new ModuleBundler()
      expect(bundler.getTransitiveDependencies('missing')).toEqual([])
    })

    it('should handle long transitive chain', () => {
      const bundler = new ModuleBundler()
      for (let i = 0; i < 10; i++) {
        bundler.addModule(makeModule(`m${i}`, i < 9 ? [`m${i + 1}`] : []))
      }
      const transitive = bundler.getTransitiveDependencies('m0')
      expect(transitive).toHaveLength(9)
      expect(transitive).toContain('m9')
    })

    it('should detect self-cycle', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['a']))
      const cycles = bundler.detectCircular()
      expect(cycles.length).toBeGreaterThan(0)
    })

    it('should handle resolveOrder with missing dependency', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['missing']))
      const order = bundler.resolveOrder('a')
      expect(order).toContain('a')
      expect(order).toContain('missing')
    })
  })

  describe('Statistics edge cases', () => {
    it('should handle single module statistics', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', [], 'hello', 5))
      const stats = bundler.getStatistics()
      expect(stats.totalModules).toBe(1)
      expect(stats.maxSize).toBe(5)
      expect(stats.minSize).toBe(5)
      expect(stats.avgSize).toBe(5)
      expect(stats.dependencyCount).toBe(0)
    })

    it('should count all dependencies', () => {
      const bundler = new ModuleBundler()
      bundler.addModule(makeModule('a', ['b', 'c']))
      bundler.addModule(makeModule('b', ['d']))
      bundler.addModule(makeModule('c'))
      bundler.addModule(makeModule('d'))
      expect(bundler.getStatistics().dependencyCount).toBe(3)
    })
  })
})
