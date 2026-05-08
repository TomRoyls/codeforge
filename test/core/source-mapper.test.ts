import { describe, it, expect, beforeEach } from 'vitest'
import { SourceMapper } from '../../src/core/source-mapper/source-mapper.js'
import type { SourceMapData, SourceMapping } from '../../src/core/source-mapper/types.js'

function createMapping(
  genLine: number, genCol: number,
  srcFile: string, srcLine: number, srcCol: number,
  name?: string,
): SourceMapping {
  return {
    generated: { line: genLine, column: genCol },
    original: { line: srcLine, column: srcCol, file: srcFile },
    ...(name !== undefined ? { name } : {}),
  }
}

function createSourceMapData(mappings: SourceMapping[], sources?: string[], names?: string[]): SourceMapData {
  const srcs = sources ?? [...new Set(mappings.map((m) => m.original.file))]
  const nms = names ?? [...new Set(mappings.filter((m) => m.name !== undefined).map((m) => m.name!))]
  return {
    version: 3,
    sourceFile: 'bundle.js.map',
    generatedFile: 'bundle.js',
    mappings,
    sources: srcs,
    names: nms,
  }
}

describe('SourceMapper', () => {
  let mapper: SourceMapper

  beforeEach(() => {
    mapper = new SourceMapper()
  })

  describe('load / unload', () => {
    it('should load source map data', () => {
      const data = createSourceMapData([createMapping(1, 0, 'a.ts', 10, 0)])
      mapper.load(data)
      expect(mapper.isLoaded()).toBe(true)
    })

    it('should report not loaded before load', () => {
      expect(mapper.isLoaded()).toBe(false)
    })

    it('should reset clears all data', () => {
      const data = createSourceMapData([createMapping(1, 0, 'a.ts', 10, 0)])
      mapper.load(data)
      mapper.reset()
      expect(mapper.isLoaded()).toBe(false)
      expect(mapper.getAllMappings()).toEqual([])
    })

    it('should load clear previous data', () => {
      const data1 = createSourceMapData([createMapping(1, 0, 'a.ts', 10, 0)])
      mapper.load(data1)
      const data2 = createSourceMapData([createMapping(2, 0, 'b.ts', 20, 0)])
      mapper.load(data2)
      expect(mapper.getAllMappings()).toHaveLength(1)
      expect(mapper.getAllMappings()[0]!.original.file).toBe('b.ts')
    })

    it('should handle loading empty source map', () => {
      const data = createSourceMapData([])
      mapper.load(data)
      expect(mapper.isLoaded()).toBe(true)
      expect(mapper.getAllMappings()).toEqual([])
    })

    it('should handle reset when nothing loaded', () => {
      mapper.reset()
      expect(mapper.isLoaded()).toBe(false)
    })
  })

  describe('originalPositionFor', () => {
    it('should find exact match', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      const pos = mapper.originalPositionFor(5, 10)
      expect(pos).toBeDefined()
      expect(pos!.line).toBe(20)
      expect(pos!.column).toBe(30)
      expect(pos!.file).toBe('a.ts')
    })

    it('should find nearest match when no exact match', () => {
      mapper.load(createSourceMapData([
        createMapping(5, 0, 'a.ts', 10, 0),
        createMapping(5, 5, 'a.ts', 10, 5),
        createMapping(5, 10, 'a.ts', 10, 10),
      ]))
      const pos = mapper.originalPositionFor(5, 7)
      expect(pos).toBeDefined()
      expect(pos!.line).toBe(10)
      expect(pos!.column).toBe(5)
    })

    it('should return undefined for no match', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      const pos = mapper.originalPositionFor(99, 0)
      expect(pos).toBeUndefined()
    })

    it('should return undefined when not loaded', () => {
      const pos = mapper.originalPositionFor(1, 0)
      expect(pos).toBeUndefined()
    })

    it('should not match different line in nearest match', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      const pos = mapper.originalPositionFor(3, 10)
      expect(pos).toBeUndefined()
    })

    it('should return copy of location', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      const pos = mapper.originalPositionFor(1, 0)
      expect(pos).not.toBe(mapper.getAllMappings()[0]!.original)
    })
  })

  describe('generatedPositionFor', () => {
    it('should find generated position for original', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      const pos = mapper.generatedPositionFor('a.ts', 20, 30)
      expect(pos).toBeDefined()
      expect(pos!.line).toBe(5)
      expect(pos!.column).toBe(10)
    })

    it('should return undefined for non-existent original position', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      const pos = mapper.generatedPositionFor('a.ts', 99, 99)
      expect(pos).toBeUndefined()
    })

    it('should return undefined when not loaded', () => {
      const pos = mapper.generatedPositionFor('a.ts', 1, 0)
      expect(pos).toBeUndefined()
    })

    it('should return copy of location', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      const pos = mapper.generatedPositionFor('a.ts', 1, 0)
      expect(pos).not.toBe(mapper.getAllMappings()[0]!.generated)
    })
  })

  describe('addMapping', () => {
    it('should add mapping manually', () => {
      const mapping = createMapping(3, 5, 'c.ts', 15, 25)
      mapper.addMapping(mapping)
      expect(mapper.hasMapping(3, 5)).toBe(true)
    })

    it('should create lookup entries for added mapping', () => {
      const mapping = createMapping(3, 5, 'c.ts', 15, 25, 'myFunc')
      mapper.addMapping(mapping)
      const pos = mapper.originalPositionFor(3, 5)
      expect(pos).toBeDefined()
      expect(pos!.file).toBe('c.ts')
      const genPos = mapper.generatedPositionFor('c.ts', 15, 25)
      expect(genPos).toBeDefined()
      expect(genPos!.line).toBe(3)
    })

    it('should handle adding multiple mappings to same source location', () => {
      mapper.addMapping(createMapping(1, 0, 'a.ts', 1, 0))
      mapper.addMapping(createMapping(2, 0, 'a.ts', 1, 0))
      const genPos = mapper.generatedPositionFor('a.ts', 1, 0)
      expect(genPos).toBeDefined()
    })
  })

  describe('removeMapping', () => {
    it('should remove existing mapping', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      const result = mapper.removeMapping(5, 10)
      expect(result).toBe(true)
      expect(mapper.hasMapping(5, 10)).toBe(false)
    })

    it('should return false for non-existent mapping', () => {
      const result = mapper.removeMapping(99, 99)
      expect(result).toBe(false)
    })

    it('should delete entries from sourceToGenerated', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      mapper.removeMapping(5, 10)
      const genPos = mapper.generatedPositionFor('a.ts', 20, 30)
      expect(genPos).toBeUndefined()
    })

    it('should handle removing one of multiple mappings to same source', () => {
      mapper.addMapping(createMapping(1, 0, 'a.ts', 1, 0))
      mapper.addMapping(createMapping(2, 0, 'a.ts', 1, 0))
      mapper.removeMapping(1, 0)
      expect(mapper.hasMapping(1, 0)).toBe(false)
      expect(mapper.hasMapping(2, 0)).toBe(true)
    })
  })

  describe('hasMapping', () => {
    it('should return true for existing mapping', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      expect(mapper.hasMapping(5, 10)).toBe(true)
    })

    it('should return false for non-existent mapping', () => {
      mapper.load(createSourceMapData([createMapping(5, 10, 'a.ts', 20, 30)]))
      expect(mapper.hasMapping(99, 99)).toBe(false)
    })

    it('should return false when not loaded', () => {
      expect(mapper.hasMapping(1, 0)).toBe(false)
    })
  })

  describe('getAllMappings', () => {
    it('should return all mappings', () => {
      const m1 = createMapping(1, 0, 'a.ts', 1, 0)
      const m2 = createMapping(2, 0, 'b.ts', 2, 0)
      mapper.load(createSourceMapData([m1, m2]))
      const all = mapper.getAllMappings()
      expect(all).toHaveLength(2)
    })

    it('should return empty array when not loaded', () => {
      expect(mapper.getAllMappings()).toEqual([])
    })
  })

  describe('getMappingsForLine', () => {
    it('should return mappings for specific line', () => {
      mapper.load(createSourceMapData([
        createMapping(5, 0, 'a.ts', 10, 0),
        createMapping(5, 5, 'b.ts', 20, 0),
        createMapping(6, 0, 'c.ts', 30, 0),
      ]))
      const lineMappings = mapper.getMappingsForLine(5)
      expect(lineMappings).toHaveLength(2)
    })

    it('should return empty array for line with no mappings', () => {
      mapper.load(createSourceMapData([createMapping(5, 0, 'a.ts', 10, 0)]))
      expect(mapper.getMappingsForLine(99)).toEqual([])
    })

    it('should return empty when not loaded', () => {
      expect(mapper.getMappingsForLine(1)).toEqual([])
    })
  })

  describe('getMappingsForFile', () => {
    it('should return mappings for specific file', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 1, 0),
        createMapping(2, 0, 'b.ts', 2, 0),
        createMapping(3, 0, 'a.ts', 3, 0),
      ]))
      const fileMappings = mapper.getMappingsForFile('a.ts')
      expect(fileMappings).toHaveLength(2)
    })

    it('should return empty for file with no mappings', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      expect(mapper.getMappingsForFile('z.ts')).toEqual([])
    })

    it('should return empty when not loaded', () => {
      expect(mapper.getMappingsForFile('a.ts')).toEqual([])
    })
  })

  describe('getSources', () => {
    it('should return source files from loaded map', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'a.ts', 1, 0), createMapping(2, 0, 'b.ts', 2, 0)],
        ['a.ts', 'b.ts'],
      ))
      const sources = mapper.getSources()
      expect(sources).toEqual(['a.ts', 'b.ts'])
    })

    it('should return empty when not loaded', () => {
      expect(mapper.getSources()).toEqual([])
    })
  })

  describe('getNames', () => {
    it('should return names from loaded map', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'a.ts', 1, 0, 'fn1')],
        ['a.ts'],
        ['fn1'],
      ))
      const names = mapper.getNames()
      expect(names).toEqual(['fn1'])
    })

    it('should return empty when not loaded', () => {
      expect(mapper.getNames()).toEqual([])
    })
  })

  describe('getMappingDensity', () => {
    it('should calculate density for single line', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 1, 0),
        createMapping(1, 5, 'a.ts', 1, 5),
        createMapping(1, 10, 'a.ts', 1, 10),
      ]))
      const density = mapper.getMappingDensity()
      expect(density.totalMappings).toBe(3)
      expect(density.linesWithMappings).toBe(1)
      expect(density.avgMappingsPerLine).toBe(3)
    })

    it('should calculate density for multiple lines', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 1, 0),
        createMapping(1, 5, 'a.ts', 1, 5),
        createMapping(2, 0, 'a.ts', 2, 0),
      ]))
      const density = mapper.getMappingDensity()
      expect(density.totalMappings).toBe(3)
      expect(density.linesWithMappings).toBe(2)
      expect(density.avgMappingsPerLine).toBe(1.5)
    })

    it('should return zeros when not loaded', () => {
      const density = mapper.getMappingDensity()
      expect(density.totalMappings).toBe(0)
      expect(density.linesWithMappings).toBe(0)
      expect(density.avgMappingsPerLine).toBe(0)
    })

    it('should handle single mapping', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      const density = mapper.getMappingDensity()
      expect(density.totalMappings).toBe(1)
      expect(density.linesWithMappings).toBe(1)
      expect(density.avgMappingsPerLine).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'a.ts', 1, 0, 'fn1'), createMapping(2, 0, 'b.ts', 2, 0, 'fn2')],
        ['a.ts', 'b.ts'],
        ['fn1', 'fn2'],
      ))
      const stats = mapper.getStatistics()
      expect(stats.totalMappings).toBe(2)
      expect(stats.sources).toBe(2)
      expect(stats.names).toBe(2)
      expect(stats.generatedLines).toBe(2)
    })

    it('should count unique generated lines', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 1, 0),
        createMapping(1, 5, 'a.ts', 1, 5),
        createMapping(1, 10, 'a.ts', 1, 10),
      ]))
      const stats = mapper.getStatistics()
      expect(stats.generatedLines).toBe(1)
    })

    it('should return zeros when not loaded', () => {
      const stats = mapper.getStatistics()
      expect(stats.totalMappings).toBe(0)
      expect(stats.sources).toBe(0)
      expect(stats.names).toBe(0)
      expect(stats.generatedLines).toBe(0)
    })
  })

  describe('validate', () => {
    it('should return empty for valid map', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'a.ts', 1, 0, 'fn1')],
        ['a.ts'],
        ['fn1'],
      ))
      expect(mapper.validate()).toEqual([])
    })

    it('should warn on missing sources', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'missing.ts', 1, 0)],
        ['a.ts'],
        [],
      ))
      const warnings = mapper.validate()
      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings.some((w) => w.includes('not in sources list'))).toBe(true)
    })

    it('should warn on missing names', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'a.ts', 1, 0, 'missingName')],
        ['a.ts'],
        [],
      ))
      const warnings = mapper.validate()
      expect(warnings.some((w) => w.includes('not in names list'))).toBe(true)
    })

    it('should warn when no data loaded', () => {
      const warnings = mapper.validate()
      expect(warnings).toContain('No source map data loaded')
    })

    it('should warn on negative source line', () => {
      const mapping: SourceMapping = {
        generated: { line: 1, column: 0 },
        original: { line: -1, column: 0, file: 'a.ts' },
      }
      mapper.load(createSourceMapData([mapping], ['a.ts'], []))
      const warnings = mapper.validate()
      expect(warnings.some((w) => w.includes('negative source line'))).toBe(true)
    })

    it('should warn on negative generated column', () => {
      const mapping: SourceMapping = {
        generated: { line: 1, column: -5 },
        original: { line: 1, column: 0, file: 'a.ts' },
      }
      mapper.load(createSourceMapData([mapping], ['a.ts'], []))
      const warnings = mapper.validate()
      expect(warnings.some((w) => w.includes('negative generated column'))).toBe(true)
    })
  })

  describe('getSourceContent', () => {
    it('should return null (placeholder)', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      expect(mapper.getSourceContent('a.ts')).toBeNull()
    })

    it('should return null when not loaded', () => {
      expect(mapper.getSourceContent('a.ts')).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle empty map', () => {
      mapper.load(createSourceMapData([]))
      expect(mapper.isLoaded()).toBe(true)
      expect(mapper.getAllMappings()).toEqual([])
      expect(mapper.getStatistics().totalMappings).toBe(0)
    })

    it('should handle single mapping', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      expect(mapper.getAllMappings()).toHaveLength(1)
      expect(mapper.hasMapping(1, 0)).toBe(true)
      expect(mapper.originalPositionFor(1, 0)).toBeDefined()
    })

    it('should handle multiple mappings per line', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 1, 0),
        createMapping(1, 5, 'a.ts', 2, 0),
        createMapping(1, 10, 'a.ts', 3, 0),
      ]))
      const lineMappings = mapper.getMappingsForLine(1)
      expect(lineMappings).toHaveLength(3)
    })

    it('should handle no mappings for requested line', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      expect(mapper.getMappingsForLine(99)).toEqual([])
    })

    it('should handle mappings from multiple source files', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 1, 0),
        createMapping(2, 0, 'b.ts', 2, 0),
        createMapping(3, 0, 'c.ts', 3, 0),
      ]))
      expect(mapper.getMappingsForFile('a.ts')).toHaveLength(1)
      expect(mapper.getMappingsForFile('b.ts')).toHaveLength(1)
      expect(mapper.getMappingsForFile('c.ts')).toHaveLength(1)
    })

    it('should handle addMapping without load', () => {
      mapper.addMapping(createMapping(1, 0, 'a.ts', 1, 0))
      expect(mapper.hasMapping(1, 0)).toBe(true)
      expect(mapper.originalPositionFor(1, 0)).toBeDefined()
    })

    it('should handle nearest match with zero column', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 10, 0),
      ]))
      const pos = mapper.originalPositionFor(1, 5)
      expect(pos).toBeDefined()
      expect(pos!.line).toBe(10)
    })

    it('should handle mapping with name', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'a.ts', 1, 0, 'myFunc')],
        ['a.ts'],
        ['myFunc'],
      ))
      const all = mapper.getAllMappings()
      expect(all[0]!.name).toBe('myFunc')
    })

    it('should handle mapping without name', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      const all = mapper.getAllMappings()
      expect(all[0]!.name).toBeUndefined()
    })

    it('should handle large number of mappings', () => {
      const mappings: SourceMapping[] = []
      for (let i = 0; i < 100; i++) {
        mappings.push(createMapping(i + 1, 0, 'a.ts', i + 1, 0))
      }
      mapper.load(createSourceMapData(mappings))
      expect(mapper.getAllMappings()).toHaveLength(100)
      expect(mapper.getStatistics().totalMappings).toBe(100)
    })

    it('should handle same generated position overwritten by addMapping', () => {
      mapper.addMapping(createMapping(1, 0, 'a.ts', 1, 0))
      mapper.addMapping(createMapping(1, 0, 'b.ts', 2, 0))
      expect(mapper.getAllMappings()).toHaveLength(1)
      expect(mapper.originalPositionFor(1, 0)!.file).toBe('b.ts')
    })
  })

  describe('manual operations', () => {
    it('should add and then remove mapping', () => {
      mapper.addMapping(createMapping(5, 5, 'a.ts', 10, 10))
      expect(mapper.hasMapping(5, 5)).toBe(true)
      mapper.removeMapping(5, 5)
      expect(mapper.hasMapping(5, 5)).toBe(false)
    })

    it('should support add after load', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)]))
      mapper.addMapping(createMapping(2, 0, 'b.ts', 2, 0))
      expect(mapper.getAllMappings()).toHaveLength(2)
    })

    it('should support remove after add', () => {
      mapper.addMapping(createMapping(3, 0, 'c.ts', 3, 0))
      mapper.removeMapping(3, 0)
      expect(mapper.getAllMappings()).toHaveLength(0)
    })

    it('should keep other mappings when removing one', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'a.ts', 1, 0),
        createMapping(2, 0, 'b.ts', 2, 0),
      ]))
      mapper.removeMapping(1, 0)
      expect(mapper.hasMapping(1, 0)).toBe(false)
      expect(mapper.hasMapping(2, 0)).toBe(true)
    })

    it('should add multiple mappings and query them', () => {
      mapper.addMapping(createMapping(1, 0, 'a.ts', 1, 0))
      mapper.addMapping(createMapping(2, 0, 'a.ts', 2, 0))
      mapper.addMapping(createMapping(3, 0, 'b.ts', 3, 0))
      expect(mapper.getMappingsForFile('a.ts')).toHaveLength(2)
      expect(mapper.getMappingsForFile('b.ts')).toHaveLength(1)
      expect(mapper.getMappingDensity().totalMappings).toBe(3)
    })
  })

  describe('additional edge cases', () => {
    it('should handle column zero correctly', () => {
      mapper.load(createSourceMapData([createMapping(1, 0, 'a.ts', 5, 0)]))
      const pos = mapper.originalPositionFor(1, 0)
      expect(pos).toBeDefined()
      expect(pos!.column).toBe(0)
    })

    it('should handle negative source column in validate', () => {
      const mapping: SourceMapping = {
        generated: { line: 1, column: 0 },
        original: { line: 1, column: -3, file: 'a.ts' },
      }
      mapper.load(createSourceMapData([mapping], ['a.ts'], []))
      const warnings = mapper.validate()
      expect(warnings.some((w) => w.includes('negative source column'))).toBe(true)
    })

    it('should handle negative generated line in validate', () => {
      const mapping: SourceMapping = {
        generated: { line: -1, column: 0 },
        original: { line: 1, column: 0, file: 'a.ts' },
      }
      mapper.load(createSourceMapData([mapping], ['a.ts'], []))
      const warnings = mapper.validate()
      expect(warnings.some((w) => w.includes('negative generated line'))).toBe(true)
    })

    it('should return multiple warnings for multiple issues', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'missing1.ts', 1, 0), createMapping(2, 0, 'missing2.ts', 2, 0)],
        ['a.ts'],
        [],
      ))
      const warnings = mapper.validate()
      expect(warnings.length).toBeGreaterThanOrEqual(2)
    })

    it('should allow re-load after reset', () => {
      const data1 = createSourceMapData([createMapping(1, 0, 'a.ts', 1, 0)])
      mapper.load(data1)
      mapper.reset()
      expect(mapper.isLoaded()).toBe(false)
      const data2 = createSourceMapData([createMapping(2, 0, 'b.ts', 2, 0)])
      mapper.load(data2)
      expect(mapper.isLoaded()).toBe(true)
      expect(mapper.originalPositionFor(2, 0)!.file).toBe('b.ts')
    })

    it('should handle generatedPositionFor with multiple results returning first', () => {
      mapper.addMapping(createMapping(1, 0, 'a.ts', 1, 0))
      mapper.addMapping(createMapping(2, 5, 'a.ts', 1, 0))
      const pos = mapper.generatedPositionFor('a.ts', 1, 0)
      expect(pos).toBeDefined()
      expect(pos!.line).toBe(1)
    })

    it('should validate empty mappings as valid', () => {
      mapper.load(createSourceMapData([], [], []))
      expect(mapper.validate()).toEqual([])
    })

    it('should handle nearest match preferring exact column', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 2, 'a.ts', 10, 2),
        createMapping(1, 5, 'a.ts', 10, 5),
        createMapping(1, 8, 'a.ts', 10, 8),
      ]))
      const pos = mapper.originalPositionFor(1, 5)
      expect(pos).toBeDefined()
      expect(pos!.column).toBe(5)
    })

    it('should handle originalPositionFor returning correct file', () => {
      mapper.load(createSourceMapData([
        createMapping(1, 0, 'x.ts', 5, 3),
        createMapping(2, 0, 'y.ts', 7, 1),
      ]))
      const pos1 = mapper.originalPositionFor(1, 0)
      expect(pos1!.file).toBe('x.ts')
      const pos2 = mapper.originalPositionFor(2, 0)
      expect(pos2!.file).toBe('y.ts')
    })

    it('should return all sources from getSources preserving order', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'z.ts', 1, 0)],
        ['alpha.ts', 'beta.ts', 'gamma.ts'],
      ))
      expect(mapper.getSources()).toEqual(['alpha.ts', 'beta.ts', 'gamma.ts'])
    })

    it('should return all names from getNames preserving order', () => {
      mapper.load(createSourceMapData(
        [createMapping(1, 0, 'a.ts', 1, 0)],
        ['a.ts'],
        ['fnA', 'fnB', 'fnC'],
      ))
      expect(mapper.getNames()).toEqual(['fnA', 'fnB', 'fnC'])
    })

    it('should handle addMapping then query by line', () => {
      mapper.addMapping(createMapping(10, 0, 'a.ts', 1, 0))
      mapper.addMapping(createMapping(10, 5, 'b.ts', 2, 0))
      mapper.addMapping(createMapping(10, 10, 'c.ts', 3, 0))
      const lineMappings = mapper.getMappingsForLine(10)
      expect(lineMappings).toHaveLength(3)
    })
  })
})
