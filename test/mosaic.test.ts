import { describe, expect, it } from 'vitest'

import {
  buildMosaicResult,
  classifySectionCondition,
  classifyTileColor,
  computeBrightness,
  computeComposition,
  computePatternDiversity,
  computeSectionCoherence,
  computeSectionCompleteness,
  computeTileCondition,
  computePosition,
  findEdges,
  findMissingTiles,
  generateRecommendations,
  groupIntoSections,
  type MosaicSection,
  type MosaicStats,
  type Tile,
} from '../src/commands/mosaic-helpers.js'

import {
  formatMosaicGrid,
  formatMosaicJSON,
  formatMosaicRecommendations,
  formatMosaicStats,
  formatMosaicTable,
  formatPaletteChart,
  formatSectionBreakdown,
  formatTileList,
  formatMissingTiles,
} from '../src/commands/mosaic-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const goodCode = `/**
 * Add two numbers together.
 * @example add(1, 2)
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Subtract b from a.
 */
export function subtract(a: number, b: number): number {
  return a - b
}
`

const badCode = `var x=1;var y=2;var z=3;if(x){if(y){if(z){for(let i=0;i<100;i++){while(true){}}}}}`

const importCode = `import { add } from './math.js'
import type { Config } from './types.js'

export function process(config: Config): string {
  return format(add(1, 2))
}
`

const typeCode = `export interface User {
  name: string
  age: number
}

export type Result<T> = {
  data: T
  error: string | null
}

export type Callback = (data: unknown) => void
`

// ─── classifyTileColor ─────────────────────────────────────────────────────────

describe('classifyTileColor', () => {
  it('classifies test files', () => {
    expect(classifyTileColor('mod.test.ts', '')).toBe('test')
    expect(classifyTileColor('mod.spec.ts', '')).toBe('test')
  })

  it('classifies test directory files', () => {
    expect(classifyTileColor('test/mod.ts', '')).toBe('test')
    expect(classifyTileColor('tests/mod.ts', '')).toBe('test')
    expect(classifyTileColor('__tests__/mod.ts', '')).toBe('test')
  })

  it('classifies config files', () => {
    expect(classifyTileColor('tsconfig.json', '')).toBe('config')
    expect(classifyTileColor('package.yaml', '')).toBe('config')
  })

  it('classifies command files', () => {
    expect(classifyTileColor('src/commands/count.ts', '')).toBe('command')
  })

  it('classifies core files', () => {
    expect(classifyTileColor('src/core/file-discovery.ts', '')).toBe('core')
  })

  it('classifies format helpers', () => {
    expect(classifyTileColor('src/commands/mosaic-format-helpers.ts', '')).toBe('format')
  })

  it('classifies type-heavy files as type', () => {
    expect(classifyTileColor('types.ts', typeCode)).toBe('type')
  })

  it('classifies remaining as utility', () => {
    expect(classifyTileColor('utils.ts', 'const x = 1')).toBe('utility')
  })
})

// ─── computeBrightness ─────────────────────────────────────────────────────────

describe('computeBrightness', () => {
  it('returns 20 for empty content', () => {
    expect(computeBrightness('')).toBe(20)
  })

  it('returns higher for documented code', () => {
    const good = computeBrightness(goodCode)
    const bad = computeBrightness(badCode)
    expect(good).toBeGreaterThan(bad)
  })

  it('penalizes any usage', () => {
    const withAny = computeBrightness('function x(a: any): any { return a }')
    const without = computeBrightness('function x(a: number): number { return a }')
    expect(without).toBeGreaterThan(withAny)
  })

  it('rewards good naming', () => {
    const good = computeBrightness('function calculateTotal(a: number, b: number) { return a + b }')
    const bad = computeBrightness('function f(a, b) { return a + b }')
    expect(good).toBeGreaterThan(bad)
  })

  it('returns 0-100', () => {
    expect(computeBrightness(goodCode)).toBeGreaterThanOrEqual(0)
    expect(computeBrightness(goodCode)).toBeLessThanOrEqual(100)
  })

  it('penalizes high complexity', () => {
    const complex = computeBrightness(badCode)
    expect(complex).toBeLessThan(60)
  })
})

// ─── computeTileCondition ──────────────────────────────────────────────────────

describe('computeTileCondition', () => {
  it('returns pristine for >85', () => {
    expect(computeTileCondition(90)).toBe('pristine')
    expect(computeTileCondition(100)).toBe('pristine')
  })

  it('returns good for 66-85', () => {
    expect(computeTileCondition(70)).toBe('good')
    expect(computeTileCondition(85)).toBe('good')
  })

  it('returns worn for 46-65', () => {
    expect(computeTileCondition(50)).toBe('worn')
    expect(computeTileCondition(65)).toBe('worn')
  })

  it('returns damaged for <=45', () => {
    expect(computeTileCondition(30)).toBe('damaged')
    expect(computeTileCondition(0)).toBe('damaged')
  })
})

// ─── findEdges ─────────────────────────────────────────────────────────────────

describe('findEdges', () => {
  it('detects import edges', () => {
    const edges = findEdges('proc.ts', importCode, ['math.ts', 'types.ts', 'proc.ts'])
    expect(edges.length).toBeGreaterThanOrEqual(1)
    expect(edges.some((e) => e.type === 'import')).toBe(true)
  })

  it('detects type import edges', () => {
    const edges = findEdges('proc.ts', importCode, ['math.ts', 'types.ts', 'proc.ts'])
    expect(edges.some((e) => e.type === 'type')).toBe(true)
  })

  it('detects re-export edges', () => {
    const code = "export { add } from './math.js'"
    const edges = findEdges('index.ts', code, ['math.ts', 'index.ts'])
    expect(edges.some((e) => e.type === 're-export')).toBe(true)
  })

  it('returns empty for no imports', () => {
    const edges = findEdges('mod.ts', 'const x = 1', ['mod.ts'])
    expect(edges).toHaveLength(0)
  })

  it('resolves imports to actual files', () => {
    const code = "import { x } from './utils.js'"
    const edges = findEdges('mod.ts', code, ['utils.ts', 'mod.ts'])
    expect(edges.length).toBe(1)
    expect(edges[0].to).toBe('utils.ts')
  })
})

// ─── computePosition ───────────────────────────────────────────────────────────

describe('computePosition', () => {
  it('computes depth from slashes', () => {
    expect(computePosition('a.ts', ['a.ts'])).toEqual([0, 0])
    expect(computePosition('src/a.ts', ['a.ts', 'src/a.ts'])).toEqual([1, 1])
  })

  it('computes order from sorted list', () => {
    const pos = computePosition('b.ts', ['a.ts', 'b.ts', 'c.ts'])
    expect(pos[1]).toBe(1)
  })
})

// ─── computeSectionCoherence ───────────────────────────────────────────────────

describe('computeSectionCoherence', () => {
  const makeTile = (color: string, brightness: number, condition: string): Tile => ({
    file: 'x.ts', color: color as Tile['color'], brightness, size: 10,
    position: [0, 0], edges: [], condition: condition as Tile['condition'],
  })

  it('returns 0 for empty tiles', () => {
    expect(computeSectionCoherence([])).toBe(0)
  })

  it('returns higher for uniform tiles', () => {
    const uniform = computeSectionCoherence([makeTile('utility', 80, 'good'), makeTile('utility', 80, 'good')])
    const mixed = computeSectionCoherence([makeTile('utility', 80, 'good'), makeTile('test', 30, 'damaged')])
    expect(uniform).toBeGreaterThan(mixed)
  })

  it('returns 0-100', () => {
    const result = computeSectionCoherence([makeTile('utility', 50, 'worn')])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computeSectionCompleteness ────────────────────────────────────────────────

describe('computeSectionCompleteness', () => {
  const makeTile = (color: string): Tile => ({
    file: 'x.ts', color: color as Tile['color'], brightness: 50, size: 10,
    position: [0, 0], edges: [], condition: 'good',
  })

  it('returns 0 for empty tiles', () => {
    expect(computeSectionCompleteness([])).toBe(0)
  })

  it('higher when tests present', () => {
    const withTests = computeSectionCompleteness([makeTile('utility'), makeTile('test')])
    const without = computeSectionCompleteness([makeTile('utility')])
    expect(withTests).toBeGreaterThan(without)
  })

  it('returns 0-100', () => {
    const result = computeSectionCompleteness([makeTile('utility'), makeTile('test')])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── classifySectionCondition ──────────────────────────────────────────────────

describe('classifySectionCondition', () => {
  it('returns masterpiece for high scores', () => {
    expect(classifySectionCondition(90, 90)).toBe('masterpiece')
  })

  it('returns gallery for moderate-high', () => {
    expect(classifySectionCondition(70, 70)).toBe('gallery')
  })

  it('returns workshop for moderate', () => {
    expect(classifySectionCondition(50, 50)).toBe('workshop')
  })

  it('returns construction for low', () => {
    expect(classifySectionCondition(25, 25)).toBe('construction')
  })

  it('returns ruins for very low', () => {
    expect(classifySectionCondition(10, 10)).toBe('ruins')
  })
})

// ─── computeComposition ────────────────────────────────────────────────────────

describe('computeComposition', () => {
  const makeTile = (brightness: number, edges: { from: string; to: string; strength: number; type: 'import' }[]): Tile => ({
    file: 'x.ts', color: 'utility', brightness, size: 10,
    position: [0, 0], edges, condition: brightness > 65 ? 'good' : 'damaged',
  })

  it('returns 0 for empty tiles', () => {
    expect(computeComposition([], [])).toBe(0)
  })

  it('returns higher for bright connected tiles', () => {
    const good = computeComposition(
      [makeTile(80, [{ from: 'a', to: 'b', strength: 3, type: 'import' }])],
      [{ name: 'src', tiles: [], dominantColor: 'utility', coherence: 80, completeness: 80, condition: 'masterpiece' }],
    )
    const bad = computeComposition(
      [makeTile(20, [])],
      [{ name: 'src', tiles: [], dominantColor: 'utility', coherence: 20, completeness: 20, condition: 'ruins' }],
    )
    expect(good).toBeGreaterThan(bad)
  })

  it('returns 0-100', () => {
    const result = computeComposition([makeTile(50, [])], [])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computePatternDiversity ───────────────────────────────────────────────────

describe('computePatternDiversity', () => {
  it('returns 0 for empty palette', () => {
    expect(computePatternDiversity({})).toBe(0)
  })

  it('returns 0 for single type', () => {
    expect(computePatternDiversity({ utility: 10 })).toBe(0)
  })

  it('returns higher for diverse palette', () => {
    const diverse = computePatternDiversity({ utility: 3, test: 3, core: 3, command: 3 })
    const uniform = computePatternDiversity({ utility: 9, test: 1 })
    expect(diverse).toBeGreaterThan(uniform)
  })

  it('returns 0-100', () => {
    const result = computePatternDiversity({ utility: 5, test: 3 })
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('returns 100 for perfectly even distribution', () => {
    expect(computePatternDiversity({ a: 1, b: 1, c: 1 })).toBe(100)
  })
})

// ─── findMissingTiles ──────────────────────────────────────────────────────────

describe('findMissingTiles', () => {
  it('finds missing test files', () => {
    const missing = findMissingTiles(['src/math.ts', 'src/utils.ts'])
    expect(missing.length).toBeGreaterThan(0)
    expect(missing[0].condition).toBe('missing')
    expect(missing[0].color).toBe('test')
  })

  it('does not flag files with tests', () => {
    const missing = findMissingTiles(['math.ts', 'math.test.ts'])
    const testMissing = missing.filter((m) => m.file === 'math.test.ts')
    expect(testMissing).toHaveLength(0)
  })

  it('skips config files', () => {
    const missing = findMissingTiles(['tsconfig.json'])
    expect(missing).toHaveLength(0)
  })

  it('skips test files themselves', () => {
    const missing = findMissingTiles(['mod.test.ts'])
    expect(missing).toHaveLength(0)
  })
})

// ─── groupIntoSections ─────────────────────────────────────────────────────────

describe('groupIntoSections', () => {
  const makeTile = (file: string): Tile => ({
    file, color: 'utility', brightness: 50, size: 10,
    position: [0, 0], edges: [], condition: 'good',
  })

  it('groups by directory', () => {
    const tiles = [makeTile('src/a.ts'), makeTile('src/b.ts'), makeTile('test/a.ts')]
    const sections = groupIntoSections(tiles, ['src/a.ts', 'src/b.ts', 'test/a.ts'])
    expect(sections).toHaveLength(2)
    const srcSection = sections.find((s) => s.name === 'src')
    expect(srcSection?.tiles).toHaveLength(2)
  })

  it('handles root files', () => {
    const tiles = [makeTile('a.ts'), makeTile('b.ts')]
    const sections = groupIntoSections(tiles, ['a.ts', 'b.ts'])
    expect(sections).toHaveLength(1)
    expect(sections[0].name).toBe('.')
  })

  it('sets section properties', () => {
    const tiles = [makeTile('src/a.ts')]
    const sections = groupIntoSections(tiles, ['src/a.ts'])
    expect(sections[0]).toHaveProperty('dominantColor')
    expect(sections[0]).toHaveProperty('coherence')
    expect(sections[0]).toHaveProperty('completeness')
    expect(sections[0]).toHaveProperty('condition')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeTile = (condition: string): Tile => ({
    file: 'x.ts', color: 'utility', brightness: 30, size: 10,
    position: [0, 0], edges: [], condition: condition as Tile['condition'],
  })

  const baseStats: MosaicStats = {
    totalTiles: 5, pristineCount: 2, damagedCount: 1, missingCount: 0,
    avgBrightness: 60, avgCoherence: 60, sectionCount: 1,
    masterpieceSections: 0, ruinsSections: 0, overallComposition: 60,
    dominantPattern: 'utility', patternDiversity: 50,
  }

  it('recommends for damaged tiles', () => {
    const recs = generateRecommendations([makeTile('damaged')], [], baseStats)
    expect(recs.some((r) => r.includes('damaged'))).toBe(true)
  })

  it('recommends for missing tiles', () => {
    const stats = { ...baseStats, missingCount: 3 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('missing'))).toBe(true)
  })

  it('recommends for low coherence', () => {
    const sections: MosaicSection[] = [{
      name: 'src', tiles: [], dominantColor: 'utility',
      coherence: 20, completeness: 50, condition: 'ruins',
    }]
    const recs = generateRecommendations([], sections, baseStats)
    expect(recs.some((r) => r.includes('coherence'))).toBe(true)
  })

  it('recommends for ruins sections', () => {
    const sections: MosaicSection[] = [{
      name: 'src', tiles: [], dominantColor: 'utility',
      coherence: 20, completeness: 20, condition: 'ruins',
    }]
    const recs = generateRecommendations([], sections, baseStats)
    expect(recs.some((r) => r.includes('ruins'))).toBe(true)
  })

  it('praises strong composition', () => {
    const stats = { ...baseStats, overallComposition: 80 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('strong') || r.includes('quality'))).toBe(true)
  })

  it('gives positive when all well', () => {
    const goodStats: MosaicStats = {
      totalTiles: 5, pristineCount: 4, damagedCount: 0, missingCount: 0,
      avgBrightness: 80, avgCoherence: 80, sectionCount: 2,
      masterpieceSections: 2, ruinsSections: 0, overallComposition: 80,
      dominantPattern: 'utility', patternDiversity: 60,
    }
    const recs = generateRecommendations([], [], goodStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildMosaicResult ─────────────────────────────────────────────────────────

describe('buildMosaicResult', () => {
  it('handles empty input', () => {
    const result = buildMosaicResult([], [], {})
    expect(result.tiles).toHaveLength(0)
    expect(result.stats.totalTiles).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('builds tiles for each file', () => {
    const result = buildMosaicResult(['a.ts', 'b.ts'], [goodCode, badCode], {})
    expect(result.tiles.length).toBeGreaterThanOrEqual(2)
  })

  it('computes palette', () => {
    const result = buildMosaicResult(['a.ts', 'a.test.ts'], [goodCode, 'test'], {})
    expect(Object.keys(result.palette).length).toBeGreaterThan(0)
  })

  it('creates sections', () => {
    const result = buildMosaicResult(['src/a.ts', 'src/b.ts', 'test/a.ts'], [goodCode, badCode, 'test'], {})
    expect(result.sections.length).toBeGreaterThanOrEqual(1)
  })

  it('computes stats', () => {
    const result = buildMosaicResult(['a.ts'], [goodCode], {})
    expect(result.stats.totalTiles).toBeGreaterThan(0)
    expect(result.stats.avgBrightness).toBeGreaterThanOrEqual(0)
    expect(result.stats.sectionCount).toBeGreaterThanOrEqual(1)
  })

  it('finds missing tiles', () => {
    const result = buildMosaicResult(['a.ts'], [goodCode], {})
    expect(result.stats.missingCount).toBeGreaterThanOrEqual(0)
  })

  it('computes overall composition', () => {
    const result = buildMosaicResult(['a.ts'], [goodCode], {})
    expect(result.stats.overallComposition).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallComposition).toBeLessThanOrEqual(100)
  })

  it('computes pattern diversity', () => {
    const result = buildMosaicResult(['a.ts', 'a.test.ts'], [goodCode, 'test'], {})
    expect(result.stats.patternDiversity).toBeGreaterThanOrEqual(0)
    expect(result.stats.patternDiversity).toBeLessThanOrEqual(100)
  })

  it('generates recommendations', () => {
    const result = buildMosaicResult(['a.ts'], [goodCode], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles mismatched files/contents', () => {
    const result = buildMosaicResult(['a.ts', 'b.ts'], ['code'], {})
    expect(result.tiles.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── format helpers ────────────────────────────────────────────────────────────

describe('formatMosaicGrid', () => {
  it('handles empty tiles', () => {
    expect(formatMosaicGrid([])).toContain('No tiles')
  })

  it('renders tiles as grid', () => {
    const tiles: Tile[] = [
      { file: 'a.ts', color: 'utility', brightness: 80, size: 10, position: [0, 0], edges: [], condition: 'good' },
      { file: 'b.ts', color: 'test', brightness: 50, size: 5, position: [0, 1], edges: [], condition: 'worn' },
    ]
    expect(formatMosaicGrid(tiles)).toContain('Mosaic Grid')
  })
})

describe('formatTileList', () => {
  it('handles empty tiles', () => {
    expect(formatTileList([])).toContain('No tiles')
  })

  it('shows tile details', () => {
    const tiles: Tile[] = [
      { file: 'a.ts', color: 'utility', brightness: 75, size: 20, position: [0, 0], edges: [], condition: 'good' },
    ]
    const output = formatTileList(tiles)
    expect(output).toContain('a.ts')
    expect(output).toContain('75%')
  })
})

describe('formatSectionBreakdown', () => {
  it('handles empty sections', () => {
    expect(formatSectionBreakdown([])).toContain('No sections')
  })

  it('shows section info', () => {
    const sections: MosaicSection[] = [{
      name: 'src', tiles: [], dominantColor: 'utility',
      coherence: 80, completeness: 70, condition: 'gallery',
    }]
    const output = formatSectionBreakdown(sections)
    expect(output).toContain('src')
    expect(output).toContain('80%')
    expect(output).toContain('gallery')
  })
})

describe('formatPaletteChart', () => {
  it('handles empty palette', () => {
    expect(formatPaletteChart({})).toContain('No palette')
  })

  it('shows palette bars', () => {
    const output = formatPaletteChart({ utility: 5, test: 3 })
    expect(output).toContain('utility')
    expect(output).toContain('test')
  })
})

describe('formatMissingTiles', () => {
  it('shows no missing when none', () => {
    const tiles: Tile[] = [
      { file: 'a.ts', color: 'utility', brightness: 80, size: 10, position: [0, 0], edges: [], condition: 'good' },
    ]
    expect(formatMissingTiles(tiles)).toContain('No missing')
  })

  it('lists missing tiles', () => {
    const tiles: Tile[] = [
      { file: 'x.test.ts', color: 'test', brightness: 0, size: 0, position: [0, 0], edges: [], condition: 'missing' },
    ]
    const output = formatMissingTiles(tiles)
    expect(output).toContain('Missing Tiles')
    expect(output).toContain('x.test.ts')
  })
})

describe('formatMosaicStats', () => {
  it('formats all stats', () => {
    const stats: MosaicStats = {
      totalTiles: 10, pristineCount: 3, damagedCount: 2, missingCount: 1,
      avgBrightness: 65, avgCoherence: 70, sectionCount: 3,
      masterpieceSections: 1, ruinsSections: 0, overallComposition: 75,
      dominantPattern: 'utility', patternDiversity: 55,
    }
    const output = formatMosaicStats(stats)
    expect(output).toContain('Total Tiles')
    expect(output).toContain('10')
    expect(output).toContain('75%')
  })
})

describe('formatMosaicRecommendations', () => {
  it('handles empty', () => {
    expect(formatMosaicRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatMosaicRecommendations(['Fix A', 'Fix B'])
    expect(output).toContain('1. Fix A')
    expect(output).toContain('2. Fix B')
  })
})

describe('formatMosaicTable', () => {
  it('formats complete result', () => {
    const result = buildMosaicResult(['a.ts'], [goodCode], {})
    const output = formatMosaicTable(result)
    expect(output).toContain('Mosaic Analysis')
    expect(output).toContain('Tile Details')
    expect(output).toContain('Recommendations')
  })

  it('handles empty result', () => {
    const result = buildMosaicResult([], [], {})
    const output = formatMosaicTable(result)
    expect(output).toContain('Mosaic Analysis')
  })
})

describe('formatMosaicJSON', () => {
  it('returns valid JSON', () => {
    const result = buildMosaicResult(['a.ts'], [goodCode], {})
    const parsed = JSON.parse(formatMosaicJSON(result))
    expect(parsed).toHaveProperty('tiles')
    expect(parsed).toHaveProperty('sections')
    expect(parsed).toHaveProperty('palette')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('handles empty result', () => {
    const result = buildMosaicResult([], [], {})
    const parsed = JSON.parse(formatMosaicJSON(result))
    expect(parsed.tiles).toHaveLength(0)
  })
})
