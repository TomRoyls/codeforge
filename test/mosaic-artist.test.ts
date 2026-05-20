import { describe, expect, it } from 'vitest'

import {
  analyzeEdges,
  assignColor,
  buildCodePalette,
  buildMosaicArtistResult,
  buildSections,
  buildTile,
  classifyOverallGrade,
  classifySectionQuality,
  computeBeauty,
  computeFitScore,
  computeGroutQuality,
  computeSectionHarmony,
  computeTessellation,
  computeTileShape,
  computeArtisticMerit,
  countOverlaps,
  detectSectionPattern,
  extractTiles,
  generateRecommendations,
  getDominantColor,
  type MosaicStats,
  type MosaicTile,
  type TileEdge,
} from '../src/commands/mosaic-artist-helpers.js'

import {
  formatBeautyBar,
  formatEdgeReport,
  formatFitBar,
  formatGradeLabel,
  formatMosaicArtistJson,
  formatMosaicArtistTable,
  formatMosaicGrid,
  formatMosaicRecommendations,
  formatMosaicStats,
  formatPalette,
  formatSectionGallery,
  formatSectionQuality,
  formatShapeSymbol,
  formatTileBadge,
  formatTileInventory,
} from '../src/commands/mosaic-artist-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `const x = 1
const y = 2
`

const FUNCTION_CONTENT = `function add(a: number, b: number): number {
  return a + b
}

function subtract(a: number, b: number): number {
  return a - b
}
`

const CLASS_CONTENT = `import { Config } from './config'
import { Logger } from './logger'

class Engine {
  private config: Config
  private logger: Logger

  constructor(config: Config) {
    this.config = config
    this.logger = new Logger()
  }

  start(): void {
    this.logger.log('starting')
  }

  stop(): void {
    this.logger.log('stopping')
  }
}

export { Engine }
`

const INTERFACE_CONTENT = `interface User {
  id: number
  name: string
  email: string
}

type UserResponse = User | null

export interface UserRepository {
  findById(id: number): Promise<UserResponse>
}
`

const ENUM_CONTENT = `enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}
`

const ASYNC_CONTENT = `async function fetchData(url: string): Promise<void> {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}
`

const IMPORT_HEAVY_CONTENT = `import { a } from './a'
import { b } from './b'
import { c } from './c'
import { d } from './d'
import { e } from './e'
import { f } from './f'

function process() {
  return a + b + c
}
`

const EXPORT_HEAVY_CONTENT = `export function a() { return 1 }
export function b() { return 2 }
export function c() { return 3 }
export function d() { return 4 }
export function e() { return 5 }
export function f() { return 6 }
export function g() { return 7 }
`

const MULTI_FILES = ['src/app.ts', 'src/engine.ts', 'test/app.test.ts']
const MULTI_CONTENTS = [CLASS_CONTENT, FUNCTION_CONTENT, "import { Engine } from '../src/app'\ntest('works', () => {})\n"]

// ─── assignColor ───────────────────────────────────────────────────────────────

describe('assignColor', () => {
  it('assigns structured-blue to class', () => {
    expect(assignColor('class', '')).toBe('structured-blue')
  })

  it('assigns abstract-purple to interface', () => {
    expect(assignColor('interface', '')).toBe('abstract-purple')
  })

  it('assigns categorical-green to enum', () => {
    expect(assignColor('enum', '')).toBe('categorical-green')
  })

  it('assigns constant-gold to constant', () => {
    expect(assignColor('constant', '')).toBe('constant-gold')
  })

  it('assigns async-orange for async functions', () => {
    expect(assignColor('function', ASYNC_CONTENT)).toBe('async-orange')
  })

  it('assigns defensive-red for try-catch', () => {
    expect(assignColor('function', 'function fn() { try {} catch(e) {} }')).toBe('defensive-red')
  })

  it('assigns functional-teal for regular functions', () => {
    expect(assignColor('function', 'function fn() { return 1 }')).toBe('functional-teal')
  })

  it('assigns modular-gray for module', () => {
    expect(assignColor('module', '')).toBe('modular-gray')
  })
})

// ─── computeTileShape ──────────────────────────────────────────────────────────

describe('computeTileShape', () => {
  it('returns square for interface', () => {
    expect(computeTileShape('interface', 10, '')).toBe('square')
  })

  it('returns triangular for import-heavy', () => {
    expect(computeTileShape('module', 20, IMPORT_HEAVY_CONTENT)).toBe('triangular')
  })

  it('returns hexagonal for export-heavy', () => {
    expect(computeTileShape('module', 20, EXPORT_HEAVY_CONTENT)).toBe('hexagonal')
  })

  it('returns square for balanced small', () => {
    expect(computeTileShape('function', 10, 'import { x } from "y"\nexport const z = x\n')).toBe('square')
  })

  it('returns rectangle for mixed', () => {
    expect(computeTileShape('function', 30, 'import { x } from "y"\nexport const z = x\nexport const w = x\nexport const v = x\n')).toBe('rectangle')
  })
})

// ─── analyzeEdges ──────────────────────────────────────────────────────────────

describe('analyzeEdges', () => {
  it('detects import edges', () => {
    const edges = analyzeEdges('import { x } from "./y"', 'test')
    expect(edges.some(e => e.direction === 'imports-from')).toBe(true)
  })

  it('detects export edges', () => {
    const edges = analyzeEdges('export function add() {}', 'add')
    expect(edges.some(e => e.direction === 'exports-to')).toBe(true)
  })

  it('detects extends edges', () => {
    const edges = analyzeEdges('class App extends Base {}', 'App')
    expect(edges.some(e => e.direction === 'extends')).toBe(true)
  })

  it('detects implements edges', () => {
    const edges = analyzeEdges('class App implements IApp {}', 'App')
    expect(edges.some(e => e.direction === 'implements')).toBe(true)
  })

  it('marks relative imports as clean', () => {
    const edges = analyzeEdges('import { x } from "./local"', 'test')
    const importEdge = edges.find(e => e.direction === 'imports-from')
    expect(importEdge?.quality).toBe('clean')
  })

  it('marks non-relative imports as rough', () => {
    const edges = analyzeEdges('import { x } from "lodash"', 'test')
    const importEdge = edges.find(e => e.direction === 'imports-from')
    expect(importEdge?.quality).toBe('rough')
  })

  it('returns empty for no edges', () => {
    expect(analyzeEdges('const x = 1', 'x')).toEqual([])
  })
})

// ─── computeFitScore ───────────────────────────────────────────────────────────

describe('computeFitScore', () => {
  it('returns 50 for no edges', () => {
    expect(computeFitScore([])).toBe(50)
  })

  it('increases with clean edges', () => {
    const clean: TileEdge[] = [{ direction: 'imports-from', target: 'a', quality: 'clean', groutWidth: 1 }]
    expect(computeFitScore(clean)).toBeGreaterThan(50)
  })

  it('decreases with broken edges', () => {
    const broken: TileEdge[] = [{ direction: 'calls', target: 'x', quality: 'broken', groutWidth: 1 }]
    const clean: TileEdge[] = [{ direction: 'imports-from', target: 'a', quality: 'clean', groutWidth: 1 }]
    expect(computeFitScore(broken)).toBeLessThan(computeFitScore(clean))
  })

  it('penalizes high grout width', () => {
    const thick: TileEdge[] = [{ direction: 'imports-from', target: 'a', quality: 'clean', groutWidth: 5 }]
    const thin: TileEdge[] = [{ direction: 'imports-from', target: 'a', quality: 'clean', groutWidth: 1 }]
    expect(computeFitScore(thick)).toBeLessThanOrEqual(computeFitScore(thin))
  })
})

// ─── computeBeauty ─────────────────────────────────────────────────────────────

describe('computeBeauty', () => {
  it('rewards small size', () => {
    expect(computeBeauty('function', 10, '')).toBeGreaterThan(computeBeauty('function', 150, ''))
  })

  it('rewards documentation', () => {
    expect(computeBeauty('function', 10, '/** docs */')).toBeGreaterThan(computeBeauty('function', 10, ''))
  })

  it('penalizes console.log spam', () => {
    const spam = Array(5).fill('console.log("x")').join('\n')
    expect(computeBeauty('function', 10, spam)).toBeLessThan(computeBeauty('function', 10, ''))
  })

  it('penalizes TODO/FIXME', () => {
    expect(computeBeauty('function', 10, '// TODO: fix')).toBeLessThan(computeBeauty('function', 10, '// clean'))
  })

  it('stays in 0-100', () => {
    expect(computeBeauty('function', 10, '')).toBeGreaterThanOrEqual(0)
    expect(computeBeauty('function', 10, '')).toBeLessThanOrEqual(100)
  })
})

// ─── extractTiles ──────────────────────────────────────────────────────────────

describe('extractTiles', () => {
  it('returns empty for empty content', () => {
    expect(extractTiles('', 'empty.ts')).toEqual([])
  })

  it('extracts functions', () => {
    const tiles = extractTiles(FUNCTION_CONTENT, 'fn.ts')
    expect(tiles.some(t => t.type === 'function')).toBe(true)
    expect(tiles.some(t => t.name === 'add')).toBe(true)
  })

  it('extracts classes', () => {
    const tiles = extractTiles(CLASS_CONTENT, 'cls.ts')
    expect(tiles.some(t => t.type === 'class')).toBe(true)
    expect(tiles.some(t => t.name === 'Engine')).toBe(true)
  })

  it('extracts interfaces', () => {
    const tiles = extractTiles(INTERFACE_CONTENT, 'iface.ts')
    expect(tiles.some(t => t.type === 'interface')).toBe(true)
  })

  it('extracts types', () => {
    const tiles = extractTiles(INTERFACE_CONTENT, 'types.ts')
    expect(tiles.some(t => t.type === 'type')).toBe(true)
  })

  it('extracts enums', () => {
    const tiles = extractTiles(ENUM_CONTENT, 'enum.ts')
    expect(tiles.some(t => t.type === 'enum')).toBe(true)
  })

  it('creates module tile for plain code', () => {
    const tiles = extractTiles(SIMPLE_CONTENT, 'simple.ts')
    expect(tiles.length).toBeGreaterThan(0)
    expect(tiles.some(t => t.type === 'module')).toBe(true)
  })

  it('assigns size to tiles', () => {
    const tiles = extractTiles(FUNCTION_CONTENT, 'fn.ts')
    for (const t of tiles) {
      expect(t.size).toBeGreaterThan(0)
    }
  })
})

// ─── Section functions ─────────────────────────────────────────────────────────

describe('computeSectionHarmony', () => {
  it('returns 100 for empty', () => {
    expect(computeSectionHarmony([])).toBe(100)
  })

  it('increases with consistent types', () => {
    const uniform: MosaicTile[] = Array.from({ length: 3 }, () => ({
      file: 'a.ts', name: 'fn', type: 'function' as const, size: 10, color: 'functional-teal',
      shape: 'square' as const, fitScore: 80, edges: [], beauty: 80,
    }))
    const varied: MosaicTile[] = [
      { file: 'a.ts', name: 'fn', type: 'function' as const, size: 10, color: 'functional-teal', shape: 'square' as const, fitScore: 80, edges: [], beauty: 80 },
      { file: 'a.ts', name: 'cls', type: 'class' as const, size: 50, color: 'structured-blue', shape: 'rectangle' as const, fitScore: 60, edges: [], beauty: 60 },
      { file: 'a.ts', name: 'iface', type: 'interface' as const, size: 20, color: 'abstract-purple', shape: 'square' as const, fitScore: 90, edges: [], beauty: 90 },
      { file: 'a.ts', name: 'en', type: 'enum' as const, size: 15, color: 'categorical-green', shape: 'square' as const, fitScore: 70, edges: [], beauty: 70 },
      { file: 'a.ts', name: 'fn2', type: 'function' as const, size: 30, color: 'async-orange', shape: 'irregular' as const, fitScore: 50, edges: [], beauty: 50 },
    ]
    expect(computeSectionHarmony(uniform)).toBeGreaterThan(computeSectionHarmony(varied))
  })
})

describe('detectSectionPattern', () => {
  it('returns minimalist for empty', () => {
    expect(detectSectionPattern([])).toBe('minimalist')
  })

  it('returns minimalist for single tile', () => {
    expect(detectSectionPattern([{ type: 'function' as const, size: 10, color: '', shape: 'square' as const, fitScore: 80, edges: [], beauty: 80, file: '', name: '' }])).toBe('minimalist')
  })

  it('returns geometric for uniform tiles', () => {
    const tiles: MosaicTile[] = Array.from({ length: 5 }, () => ({
      file: 'a.ts', name: 'fn', type: 'function' as const, size: 10, color: 'teal',
      shape: 'square' as const, fitScore: 80, edges: [], beauty: 80,
    }))
    expect(detectSectionPattern(tiles)).toBe('geometric')
  })

  it('returns chaotic for varied tiles', () => {
    const types: Array<'function' | 'class' | 'interface' | 'enum' | 'type'> = ['function', 'class', 'interface', 'enum', 'type']
    const tiles: MosaicTile[] = types.map((t, i) => ({
      file: 'a.ts', name: `t${i}`, type: t, size: i * 20 + 5, color: 'teal',
      shape: 'square' as const, fitScore: 50, edges: [], beauty: 50,
    }))
    expect(detectSectionPattern(tiles)).toBe('chaotic')
  })
})

describe('classifySectionQuality', () => {
  it('classifies masterpiece', () => { expect(classifySectionQuality(90)).toBe('masterpiece') })
  it('classifies gallery', () => { expect(classifySectionQuality(75)).toBe('gallery') })
  it('classifies studio', () => { expect(classifySectionQuality(58)).toBe('studio') })
  it('classifies sketch', () => { expect(classifySectionQuality(40)).toBe('sketch') })
  it('classifies doodle', () => { expect(classifySectionQuality(20)).toBe('doodle') })
})

// ─── Code Palette ──────────────────────────────────────────────────────────────

describe('buildCodePalette', () => {
  it('returns defaults for empty', () => {
    const palette = buildCodePalette([])
    expect(palette.primary).toBe('modular-gray')
    expect(palette.harmony).toBe(90)
  })

  it('picks primary from most common color', () => {
    const tiles: MosaicTile[] = [
      { file: 'a.ts', name: 'fn1', type: 'function', size: 10, color: 'functional-teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
      { file: 'a.ts', name: 'fn2', type: 'function', size: 10, color: 'functional-teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
      { file: 'a.ts', name: 'cls', type: 'class', size: 20, color: 'structured-blue', shape: 'rectangle', fitScore: 70, edges: [], beauty: 70 },
    ]
    const palette = buildCodePalette(tiles)
    expect(palette.primary).toBe('functional-teal')
  })
})

// ─── Tessellation & Grout ──────────────────────────────────────────────────────

describe('computeTessellation', () => {
  it('returns 100 for empty', () => {
    expect(computeTessellation([])).toBe(100)
  })

  it('measures shape consistency', () => {
    const uniform: MosaicTile[] = Array.from({ length: 5 }, () => ({
      file: 'a.ts', name: 't', type: 'function' as const, size: 10, color: 'teal',
      shape: 'square' as const, fitScore: 80, edges: [], beauty: 80,
    }))
    expect(computeTessellation(uniform)).toBe(100)
  })
})

describe('computeGroutQuality', () => {
  it('returns 100 for no edges', () => {
    expect(computeGroutQuality([])).toBe(100)
  })

  it('measures clean edge ratio', () => {
    const clean: TileEdge[] = [{ direction: 'imports-from', target: 'a', quality: 'clean', groutWidth: 1 }]
    const rough: TileEdge[] = [{ direction: 'imports-from', target: 'a', quality: 'rough', groutWidth: 1 }]
    expect(computeGroutQuality(clean)).toBeGreaterThan(computeGroutQuality(rough))
  })
})

// ─── Artistic Merit & Grade ────────────────────────────────────────────────────

describe('computeArtisticMerit', () => {
  it('returns 100 for empty', () => {
    expect(computeArtisticMerit([], [])).toBe(100)
  })

  it('combines beauty, fit, and harmony', () => {
    const tiles: MosaicTile[] = [{ file: 'a.ts', name: 'fn', type: 'function', size: 10, color: 'teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 }]
    const sections = [{ name: '.', tiles, harmony: 80, pattern: 'geometric' as const, dominantColor: 'teal', gaps: 0, overlaps: 0, overallQuality: 'gallery' as const }]
    const merit = computeArtisticMerit(tiles, sections)
    expect(merit).toBeGreaterThanOrEqual(0)
    expect(merit).toBeLessThanOrEqual(100)
  })
})

describe('classifyOverallGrade', () => {
  it('classifies masterwork', () => { expect(classifyOverallGrade(90, 85, 88)).toBe('masterwork') })
  it('classifies accomplished', () => { expect(classifyOverallGrade(75, 70, 72)).toBe('accomplished') })
  it('classifies competent', () => { expect(classifyOverallGrade(60, 55, 58)).toBe('competent') })
  it('classifies apprentice', () => { expect(classifyOverallGrade(40, 35, 38)).toBe('apprentice') })
  it('classifies novice', () => { expect(classifyOverallGrade(20, 15, 18)).toBe('novice') })
})

// ─── Overlaps & Dominant Color ─────────────────────────────────────────────────

describe('countOverlaps', () => {
  it('returns 0 for unique names', () => {
    const tiles: MosaicTile[] = [
      { file: 'a.ts', name: 'fn1', type: 'function', size: 10, color: '', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
      { file: 'b.ts', name: 'fn2', type: 'function', size: 10, color: '', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
    ]
    expect(countOverlaps(tiles)).toBe(0)
  })

  it('counts duplicate names', () => {
    const tiles: MosaicTile[] = [
      { file: 'a.ts', name: 'process', type: 'function', size: 10, color: '', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
      { file: 'b.ts', name: 'process', type: 'function', size: 10, color: '', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
    ]
    expect(countOverlaps(tiles)).toBe(1)
  })
})

describe('getDominantColor', () => {
  it('returns default for empty', () => {
    expect(getDominantColor([])).toBe('modular-gray')
  })

  it('returns most common color', () => {
    const tiles: MosaicTile[] = [
      { file: 'a.ts', name: 'a', type: 'function', size: 10, color: 'teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
      { file: 'a.ts', name: 'b', type: 'function', size: 10, color: 'teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
      { file: 'a.ts', name: 'c', type: 'class', size: 20, color: 'blue', shape: 'rectangle', fitScore: 70, edges: [], beauty: 70 },
    ]
    expect(getDominantColor(tiles)).toBe('teal')
  })
})

// ─── buildSections ─────────────────────────────────────────────────────────────

describe('buildSections', () => {
  it('groups by directory', () => {
    const tiles: MosaicTile[] = [
      { file: 'src/a.ts', name: 'fn', type: 'function', size: 10, color: 'teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
      { file: 'src/b.ts', name: 'cls', type: 'class', size: 20, color: 'blue', shape: 'rectangle', fitScore: 70, edges: [], beauty: 70 },
      { file: 'test/c.ts', name: 'test', type: 'function', size: 15, color: 'teal', shape: 'square', fitScore: 75, edges: [], beauty: 75 },
    ]
    const sections = buildSections(tiles)
    expect(sections).toHaveLength(2)
  })

  it('computes section properties', () => {
    const tiles: MosaicTile[] = [
      { file: 'a.ts', name: 'fn', type: 'function', size: 10, color: 'teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
    ]
    const sections = buildSections(tiles)
    expect(sections[0].harmony).toBeGreaterThanOrEqual(0)
    expect(sections[0].pattern).toBeTruthy()
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: MosaicStats = {
    totalTiles: 5, avgTileSize: 15, avgFitScore: 75, avgBeauty: 78,
    cleanEdges: 10, roughEdges: 1, brokenEdges: 0, missingEdges: 0,
    totalGaps: 0, totalOverlaps: 0, harmonyScore: 80, tessellationScore: 70,
    groutQuality: 85, artisticMerit: 78, masterpieceSections: 1, sketchSections: 0,
    dominantPattern: 'geometric', dominantStyle: 'teal', overallGrade: 'accomplished',
  }

  it('recommends cleaning rough edges', () => {
    const tiles: MosaicTile[] = Array.from({ length: 5 }, () => ({
      file: 'a.ts', name: 'fn', type: 'function' as const, size: 10, color: '',
      shape: 'square' as const, fitScore: 80, beauty: 80,
      edges: [{ direction: 'imports-from' as const, target: 'lodash', quality: 'rough' as const, groutWidth: 1 }],
    }))
    const palette = buildCodePalette(tiles)
    const recs = generateRecommendations(tiles, [], baseStats, palette)
    expect(recs.some(r => r.includes('rough'))).toBe(true)
  })

  it('recommends filling gaps', () => {
    const stats = { ...baseStats, totalGaps: 3 }
    const recs = generateRecommendations([], [], stats, buildCodePalette([]))
    expect(recs.some(r => r.includes('gap'))).toBe(true)
  })

  it('recommends consolidating overlaps', () => {
    const stats = { ...baseStats, totalOverlaps: 2 }
    const recs = generateRecommendations([], [], stats, buildCodePalette([]))
    expect(recs.some(r => r.includes('overlap'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const recs = generateRecommendations([], [], baseStats, buildCodePalette([]))
    expect(recs).toEqual([])
  })
})

// ─── buildMosaicArtistResult ───────────────────────────────────────────────────

describe('buildMosaicArtistResult', () => {
  it('handles empty file list', () => {
    const result = buildMosaicArtistResult([], [], {})
    expect(result.tiles).toEqual([])
    expect(result.stats.totalTiles).toBe(0)
  })

  it('analyzes single file', () => {
    const result = buildMosaicArtistResult(['fn.ts'], [FUNCTION_CONTENT], {})
    expect(result.tiles.length).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildMosaicArtistResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.tiles.length).toBeGreaterThan(0)
    expect(result.sections.length).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildMosaicArtistResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.stats.avgBeauty).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFitScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.harmonyScore).toBeGreaterThanOrEqual(0)
  })

  it('builds palette', () => {
    const result = buildMosaicArtistResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.palette.primary).toBeTruthy()
  })

  it('computes overall grade', () => {
    const result = buildMosaicArtistResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(['masterwork', 'accomplished', 'competent', 'apprentice', 'novice']).toContain(result.stats.overallGrade)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatTileBadge returns badge', () => {
    expect(formatTileBadge('function')).toContain('function')
    expect(formatTileBadge('class')).toContain('class')
  })

  it('formatShapeSymbol returns symbol', () => {
    expect(formatShapeSymbol('square')).toBeTruthy()
    expect(formatShapeSymbol('hexagonal')).toBeTruthy()
  })

  it('formatGradeLabel returns label', () => {
    expect(formatGradeLabel('masterwork')).toContain('masterwork')
  })

  it('formatSectionQuality returns label', () => {
    expect(formatSectionQuality('masterpiece')).toContain('masterpiece')
  })

  it('formatBeautyBar returns bar', () => {
    expect(formatBeautyBar(75)).toContain('75')
  })

  it('formatFitBar returns bar', () => {
    expect(formatFitBar(65)).toContain('65')
  })

  it('formatMosaicGrid handles empty', () => {
    expect(formatMosaicGrid([])).toContain('No tiles')
  })

  it('formatMosaicGrid renders grid', () => {
    const tiles: MosaicTile[] = [
      { file: 'a.ts', name: 'fn', type: 'function', size: 10, color: 'teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
    ]
    const grid = formatMosaicGrid(tiles)
    expect(grid).toContain('Mosaic Grid')
  })

  it('formatTileInventory handles empty', () => {
    expect(formatTileInventory([])).toContain('No tiles')
  })

  it('formatTileInventory renders inventory', () => {
    const tiles: MosaicTile[] = [
      { file: 'a.ts', name: 'add', type: 'function', size: 10, color: 'teal', shape: 'square', fitScore: 80, edges: [], beauty: 80 },
    ]
    const inv = formatTileInventory(tiles)
    expect(inv).toContain('add')
  })

  it('formatSectionGallery handles empty', () => {
    expect(formatSectionGallery([])).toContain('No sections')
  })

  it('formatSectionGallery renders sections', () => {
    const sections = [{
      name: 'src', tiles: [], harmony: 80, pattern: 'geometric' as const,
      dominantColor: 'teal', gaps: 0, overlaps: 0, overallQuality: 'gallery' as const,
    }]
    const gallery = formatSectionGallery(sections)
    expect(gallery).toContain('src')
  })

  it('formatEdgeReport handles empty', () => {
    expect(formatEdgeReport([])).toContain('No edges')
  })

  it('formatEdgeReport renders report', () => {
    const edges: TileEdge[] = [
      { direction: 'imports-from', target: 'a', quality: 'clean', groutWidth: 1 },
      { direction: 'imports-from', target: 'b', quality: 'rough', groutWidth: 2 },
    ]
    const report = formatEdgeReport(edges)
    expect(report).toContain('Clean: 1')
    expect(report).toContain('Rough: 1')
  })

  it('formatPalette renders palette', () => {
    const palette = { primary: 'teal', secondary: 'blue', accent: 'red', neutral: 'gray', dark: 'orange', highlight: 'teal', harmony: 80 }
    expect(formatPalette(palette)).toContain('teal')
  })

  it('formatMosaicStats renders stats', () => {
    const stats: MosaicStats = {
      totalTiles: 15, avgTileSize: 20, avgFitScore: 75, avgBeauty: 80,
      cleanEdges: 12, roughEdges: 3, brokenEdges: 1, missingEdges: 0,
      totalGaps: 0, totalOverlaps: 1, harmonyScore: 85, tessellationScore: 70,
      groutQuality: 82, artisticMerit: 78, masterpieceSections: 2, sketchSections: 0,
      dominantPattern: 'geometric', dominantStyle: 'teal', overallGrade: 'accomplished',
    }
    const formatted = formatMosaicStats(stats)
    expect(formatted).toContain('15')
    expect(formatted).toContain('accomplished')
  })

  it('formatMosaicRecommendations returns success for empty', () => {
    expect(formatMosaicRecommendations([])).toContain('masterpiece')
  })

  it('formatMosaicRecommendations renders bullets', () => {
    const recs = formatMosaicRecommendations(['Clean edges', 'Fill gaps'])
    expect(recs).toContain('Clean edges')
  })

  it('formatMosaicArtistJson returns valid JSON', () => {
    const result = buildMosaicArtistResult([], [], {})
    const json = formatMosaicArtistJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatMosaicArtistTable returns output', () => {
    const result = buildMosaicArtistResult(['fn.ts'], [FUNCTION_CONTENT], {})
    const output = formatMosaicArtistTable(result, false)
    expect(output.length).toBeGreaterThan(0)
  })
})
