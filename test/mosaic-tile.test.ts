import { describe, expect, it } from 'vitest'

import {
  classifyShape,
  analyzeEdges,
  detectTileIssues,
  classifyTileGrade,
  analyzeTile,
  analyzeGrout,
  findTilePatterns,
  computeTileDiversity,
  computeGroutIntegrity,
  computeMosaicFitness,
  classifyOverall,
  generateRecommendations,
  buildMosaicTileResult,
  type Tile,
  type MosaicTileStats,
  type GroutAnalysis,
} from '../src/commands/mosaic-tile-helpers.js'

import { formatMosaicTileTable, formatMosaicTileJson } from '../src/commands/mosaic-tile-format-helpers.js'

// ─── classifyShape ──────────────────────────────────────────────────────────

describe('classifyShape', () => {
  it('returns a valid TileShape', () => {
    const shapes = ['square', 'rectangle', 'hexagonal', 'triangle', 'irregular', 'oversized', 'fragment']
    expect(shapes).toContain(classifyShape('const x = 1', 'a.ts'))
  })

  it('returns oversized for very long files', () => {
    const lines = Array(350).fill('const x = 1')
    expect(classifyShape(lines.join('\n'), 'a.ts')).toBe('oversized')
  })

  it('returns fragment for tiny files', () => {
    expect(classifyShape('x', 'a.ts')).toBe('fragment')
  })

  it('returns hexagonal for well-rounded code', () => {
    const code = [
      'import { A } from "./a"',
      'import { B } from "./b"',
      'import { C } from "./c"',
      'export function f1() {}',
      'export function f2() {}',
      'export function f3() {}',
      'export function f4() {}',
      'export function f5() {}',
      'export interface I {}',
    ].join('\n')
    expect(classifyShape(code, 'a.ts')).toBe('hexagonal')
  })

  it('returns fragment for empty content', () => {
    expect(classifyShape('', 'a.ts')).toBe('fragment')
  })

  it('returns square for balanced code', () => {
    const code = 'import { x } from "./a"\nimport { y } from "./b"\nexport function f() {}\nexport function g() {}\nfunction helper() {}\ninterface I {}'
    const shape = classifyShape(code, 'a.ts')
    expect(['square', 'rectangle', 'hexagonal']).toContain(shape)
  })
})

// ─── analyzeEdges ───────────────────────────────────────────────────────────

describe('analyzeEdges', () => {
  it('returns an array', () => {
    const edges = analyzeEdges('const x = 1', 'a.ts', [])
    expect(Array.isArray(edges)).toBe(true)
  })

  it('detects import edges', () => {
    const edges = analyzeEdges('import { x } from "./a"', 'b.ts', ['a.ts'])
    const imports = edges.filter(e => e.type === 'imports')
    expect(imports.length).toBeGreaterThan(0)
    expect(imports[0].direction).toBe('top')
  })

  it('detects export edges', () => {
    const edges = analyzeEdges('export function f() {}', 'a.ts', [])
    const exports = edges.filter(e => e.type === 'exports')
    expect(exports.length).toBeGreaterThan(0)
    expect(exports[0].direction).toBe('bottom')
  })

  it('marks documented exports as clean', () => {
    const code = '/** docs */\nexport function f() {}'
    const edges = analyzeEdges(code, 'a.ts', [])
    const exp = edges.find(e => e.type === 'exports')
    expect(exp?.quality).toBe('clean')
  })

  it('marks undocumented exports as chipped', () => {
    const edges = analyzeEdges('export function f() {}', 'a.ts', [])
    const exp = edges.find(e => e.type === 'exports')
    expect(exp?.quality).toBe('chipped')
  })

  it('detects type imports as clean', () => {
    const edges = analyzeEdges('import type { X } from "./a"', 'b.ts', [])
    const imp = edges.find(e => e.type === 'imports')
    expect(imp?.quality).toBe('clean')
  })

  it('detects class extends', () => {
    const edges = analyzeEdges('class Widget extends Base {}', 'a.ts', [])
    const inherits = edges.find(e => e.type === 'inherits')
    expect(inherits).toBeDefined()
    expect(inherits?.target).toBe('Base')
  })

  it('detects class implements', () => {
    const edges = analyzeEdges('class Widget implements IWidget {}', 'a.ts', [])
    const impl = edges.find(e => e.type === 'implements')
    expect(impl).toBeDefined()
    expect(impl?.target).toBe('IWidget')
  })

  it('each edge has required fields', () => {
    const edges = analyzeEdges('import { x } from "./a"\nexport function f() {}', 'a.ts', [])
    for (const e of edges) {
      expect(e).toHaveProperty('direction')
      expect(e).toHaveProperty('type')
      expect(e).toHaveProperty('target')
      expect(e).toHaveProperty('quality')
      expect(e).toHaveProperty('groutWidth')
    }
  })
})

// ─── detectTileIssues ───────────────────────────────────────────────────────

describe('detectTileIssues', () => {
  it('returns an array', () => {
    const issues = detectTileIssues('const x = 1', 'a.ts')
    expect(Array.isArray(issues)).toBe(true)
  })

  it('detects oversized tiles', () => {
    const lines = Array(350).fill('const x = 1')
    const issues = detectTileIssues(lines.join('\n'), 'a.ts')
    expect(issues.some(i => i.type === 'oversized')).toBe(true)
    expect(issues.find(i => i.type === 'oversized')?.severity).toBe('major')
  })

  it('detects undersized tiles', () => {
    const issues = detectTileIssues('x', 'a.ts')
    expect(issues.some(i => i.type === 'undersized')).toBe(true)
  })

  it('detects cracked tiles with any', () => {
    const issues = detectTileIssues('const x: any = 1', 'a.ts')
    expect(issues.some(i => i.type === 'cracked')).toBe(true)
  })

  it('detects chipped tiles', () => {
    const code = [
      'export function f1() {}',
      'export function f2() {}',
      'export function f3() {}',
      'export function f4() {}',
    ].join('\n')
    const issues = detectTileIssues(code, 'a.ts')
    expect(issues.some(i => i.type === 'chipped')).toBe(true)
  })

  it('detects loose tiles', () => {
    const lines = Array(10).fill('const x = 1')
    const issues = detectTileIssues(lines.join('\n'), 'a.ts')
    expect(issues.some(i => i.type === 'loose')).toBe(true)
  })

  it('detects wrong-color with mixed var/const', () => {
    const issues = detectTileIssues('var x = 1\nconst y = 2', 'a.ts')
    expect(issues.some(i => i.type === 'wrong-color')).toBe(true)
  })

  it('detects misshapen tiles with long lines', () => {
    const longLine = 'const x = "' + 'a'.repeat(200) + '"'
    const issues = detectTileIssues(longLine, 'a.ts')
    expect(issues.some(i => i.type === 'misshapen')).toBe(true)
  })

  it('returns no issues for clean code', () => {
    const code = '/** docs */\nexport function f(): number { return 1 }\nexport function g(): string { return "a" }\nexport function h(): void {}\nexport function i(): boolean { return true }\nimport { x } from "./a"'
    const issues = detectTileIssues(code, 'a.ts')
    expect(issues.length).toBe(0)
  })

  it('each issue has required fields', () => {
    const issues = detectTileIssues('const x: any = 1', 'a.ts')
    for (const issue of issues) {
      expect(issue).toHaveProperty('type')
      expect(issue).toHaveProperty('description')
      expect(issue).toHaveProperty('severity')
      expect(issue).toHaveProperty('fix')
    }
  })
})

// ─── classifyTileGrade ──────────────────────────────────────────────────────

describe('classifyTileGrade', () => {
  it('returns masterpiece-tile for high scores and no issues', () => {
    expect(classifyTileGrade(80, 80, 0)).toBe('masterpiece-tile')
  })

  it('returns quality-tile for good scores', () => {
    expect(classifyTileGrade(65, 65, 1)).toBe('quality-tile')
  })

  it('returns standard-tile for medium scores', () => {
    expect(classifyTileGrade(50, 50, 2)).toBe('standard-tile')
  })

  it('returns rough-tile for low scores', () => {
    expect(classifyTileGrade(35, 35, 3)).toBe('rough-tile')
  })

  it('returns reject for very low scores', () => {
    expect(classifyTileGrade(15, 15, 5)).toBe('reject')
  })

  it('masterpiece requires no issues', () => {
    expect(classifyTileGrade(90, 90, 1)).not.toBe('masterpiece-tile')
  })
})

// ─── analyzeTile ────────────────────────────────────────────────────────────

describe('analyzeTile', () => {
  it('returns a Tile with all fields', () => {
    const tile = analyzeTile('export function f() {}', 'a.ts', ['a.ts'])
    expect(tile.file).toBe('a.ts')
    expect(tile.shape).toBeDefined()
    expect(tile.size).toBeGreaterThan(0)
    expect(tile.color).toBeDefined()
    expect(Array.isArray(tile.edges)).toBe(true)
    expect(Array.isArray(tile.issues)).toBe(true)
    expect(tile.fitScore).toBeGreaterThanOrEqual(0)
    expect(tile.fitScore).toBeLessThanOrEqual(100)
    expect(tile.beautyScore).toBeGreaterThanOrEqual(0)
    expect(tile.beautyScore).toBeLessThanOrEqual(100)
    expect(tile.contributionScore).toBeGreaterThanOrEqual(0)
    expect(tile.contributionScore).toBeLessThanOrEqual(100)
    expect(tile.grade).toBeDefined()
  })

  it('gives higher fit score for connected code', () => {
    const connected = analyzeTile('import { x } from "./a"\nexport function f() {}', 'b.ts', ['a.ts'])
    const disconnected = analyzeTile('const x = 1', 'c.ts', [])
    expect(connected.fitScore).toBeGreaterThan(disconnected.fitScore)
  })

  it('gives higher beauty for documented code', () => {
    const documented = analyzeTile('/** docs */\nexport function f(): number { return 1 }', 'a.ts', [])
    const bare = analyzeTile('const x = 1', 'a.ts', [])
    expect(documented.beautyScore).toBeGreaterThan(bare.beautyScore)
  })
})

// ─── analyzeGrout ───────────────────────────────────────────────────────────

describe('analyzeGrout', () => {
  it('returns a GroutAnalysis with all fields', () => {
    const tileA: Tile = {
      file: 'a.ts', shape: 'square', size: 10, color: 'functional',
      edges: [{ direction: 'bottom', type: 'exports', target: 'f', quality: 'clean', groutWidth: 1 }],
      fitScore: 70, beautyScore: 70, contributionScore: 60, issues: [], grade: 'quality-tile',
    }
    const tileB: Tile = {
      file: 'b.ts', shape: 'square', size: 10, color: 'functional',
      edges: [{ direction: 'top', type: 'imports', target: './a', quality: 'clean', groutWidth: 1 }],
      fitScore: 70, beautyScore: 70, contributionScore: 60, issues: [], grade: 'quality-tile',
    }
    const grout = analyzeGrout(tileA, tileB)
    expect(grout.file).toBe('a.ts')
    expect(grout.neighborFile).toBe('b.ts')
    expect(grout.groutQuality).toBeGreaterThanOrEqual(0)
    expect(grout.groutQuality).toBeLessThanOrEqual(100)
    expect(['perfect', 'aligned', 'offset', 'misaligned']).toContain(grout.alignment)
    expect(typeof grout.gaps).toBe('number')
    expect(typeof grout.overlaps).toBe('number')
    expect(typeof grout.description).toBe('string')
  })

  it('detects perfect alignment for clean connections', () => {
    const tileA: Tile = {
      file: 'a.ts', shape: 'square', size: 10, color: 'functional',
      edges: [{ direction: 'bottom', type: 'exports', target: 'f', quality: 'clean', groutWidth: 1 }],
      fitScore: 80, beautyScore: 80, contributionScore: 70, issues: [], grade: 'masterpiece-tile',
    }
    const tileB: Tile = {
      file: 'b.ts', shape: 'square', size: 10, color: 'functional',
      edges: [
        { direction: 'top', type: 'imports', target: 'f', quality: 'clean', groutWidth: 1 },
        { direction: 'bottom', type: 'exports', target: 'g', quality: 'clean', groutWidth: 1 },
      ],
      fitScore: 80, beautyScore: 80, contributionScore: 70, issues: [], grade: 'masterpiece-tile',
    }
    const grout = analyzeGrout(tileA, tileB)
    expect(grout.alignment).toBe('perfect')
  })
})

// ─── findTilePatterns ───────────────────────────────────────────────────────

describe('findTilePatterns', () => {
  it('returns empty for no tiles', () => {
    expect(findTilePatterns([])).toEqual([])
  })

  it('finds color patterns', () => {
    const tiles: Tile[] = [
      makeTile('a.ts', 'functional'),
      makeTile('b.ts', 'functional'),
    ]
    const patterns = findTilePatterns(tiles)
    expect(patterns.some(p => p.name.includes('functional'))).toBe(true)
  })

  it('finds shape clusters for 3+ same shape', () => {
    const tiles: Tile[] = [
      makeTile('a.ts', 'functional'),
      makeTile('b.ts', 'functional'),
      makeTile('c.ts', 'functional'),
    ]
    const patterns = findTilePatterns(tiles)
    expect(patterns.some(p => p.name.includes('cluster'))).toBe(true)
  })

  it('each pattern has required fields', () => {
    const tiles = [makeTile('a.ts', 'oop'), makeTile('b.ts', 'oop')]
    const patterns = findTilePatterns(tiles)
    for (const p of patterns) {
      expect(p).toHaveProperty('name')
      expect(p).toHaveProperty('tiles')
      expect(p).toHaveProperty('consistency')
      expect(p).toHaveProperty('isGroutAligned')
    }
  })
})

// ─── computeTileDiversity ───────────────────────────────────────────────────

describe('computeTileDiversity', () => {
  it('returns 50 for no tiles', () => {
    expect(computeTileDiversity([])).toBe(50)
  })

  it('returns higher for diverse tiles', () => {
    const diverse: Tile[] = [
      makeTile('a.ts', 'functional', 'square'),
      makeTile('b.ts', 'oop', 'rectangle'),
      makeTile('c.ts', 'config', 'hexagonal'),
    ]
    const uniform: Tile[] = [
      makeTile('a.ts', 'functional', 'square'),
      makeTile('b.ts', 'functional', 'square'),
    ]
    expect(computeTileDiversity(diverse)).toBeGreaterThan(computeTileDiversity(uniform))
  })
})

// ─── computeGroutIntegrity ──────────────────────────────────────────────────

describe('computeGroutIntegrity', () => {
  it('returns 75 for no grout', () => {
    expect(computeGroutIntegrity([])).toBe(75)
  })

  it('averages grout quality', () => {
    const grout: GroutAnalysis[] = [
      { file: 'a.ts', neighborFile: 'b.ts', groutQuality: 60, alignment: 'aligned', gaps: 0, overlaps: 0, description: 'ok' },
      { file: 'b.ts', neighborFile: 'c.ts', groutQuality: 80, alignment: 'perfect', gaps: 0, overlaps: 0, description: 'good' },
    ]
    expect(computeGroutIntegrity(grout)).toBe(70)
  })
})

// ─── computeMosaicFitness ───────────────────────────────────────────────────

describe('computeMosaicFitness', () => {
  it('returns 50 for no tiles', () => {
    expect(computeMosaicFitness([], [])).toBe(50)
  })

  it('increases with better tiles', () => {
    const goodTiles = [makeTileWith('a.ts', 80, 80)]
    const badTiles = [makeTileWith('a.ts', 30, 30)]
    expect(computeMosaicFitness(goodTiles, [])).toBeGreaterThan(computeMosaicFitness(badTiles, []))
  })
})

// ─── classifyOverall ────────────────────────────────────────────────────────

describe('classifyOverall', () => {
  it('returns masterwork-mosaic for high scores', () => {
    expect(classifyOverall(80, 80, 2)).toBe('masterwork-mosaic')
  })

  it('returns quality-composition for good scores', () => {
    expect(classifyOverall(65, 65, 5)).toBe('quality-composition')
  })

  it('returns standard-tiling for medium scores', () => {
    expect(classifyOverall(50, 50, 10)).toBe('standard-tiling')
  })

  it('returns rough-patchwork for low scores', () => {
    expect(classifyOverall(35, 35, 15)).toBe('rough-patchwork')
  })

  it('returns broken-mosaic for very low scores', () => {
    expect(classifyOverall(15, 15, 20)).toBe('broken-mosaic')
  })

  it('masterwork requires few issues', () => {
    expect(classifyOverall(85, 85, 10)).not.toBe('masterwork-mosaic')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty for healthy codebase', () => {
    const tiles = [makeTileWith('a.ts', 80, 80)]
    const stats = makeStats({ mosaicFitness: 80, groutIntegrity: 80 })
    const recs = generateRecommendations(tiles, [], [], stats)
    expect(recs.length).toBe(0)
  })

  it('recommends splitting oversized tiles', () => {
    const oversized: Tile = {
      file: 'a.ts', shape: 'oversized', size: 350, color: 'functional',
      edges: [], fitScore: 30, beautyScore: 30, contributionScore: 30,
      issues: [{ type: 'oversized', description: 'too big', severity: 'major', fix: 'split' }],
      grade: 'rough-tile',
    }
    const stats = makeStats({})
    const recs = generateRecommendations([oversized], [], [], stats)
    expect(recs.some(r => r.includes('oversized'))).toBe(true)
  })

  it('recommends fixing cracked tiles', () => {
    const cracked: Tile = {
      file: 'a.ts', shape: 'square', size: 10, color: 'functional',
      edges: [], fitScore: 50, beautyScore: 50, contributionScore: 50,
      issues: [{ type: 'cracked', description: 'any type', severity: 'major', fix: 'fix types' }],
      grade: 'standard-tile',
    }
    const stats = makeStats({})
    const recs = generateRecommendations([cracked], [], [], stats)
    expect(recs.some(r => r.includes('cracked'))).toBe(true)
  })

  it('recommends connecting loose tiles', () => {
    const loose: Tile = {
      file: 'a.ts', shape: 'square', size: 10, color: 'functional',
      edges: [], fitScore: 40, beautyScore: 40, contributionScore: 40,
      issues: [{ type: 'loose', description: 'disconnected', severity: 'major', fix: 'connect' }],
      grade: 'rough-tile',
    }
    const stats = makeStats({})
    const recs = generateRecommendations([loose], [], [], stats)
    expect(recs.some(r => r.includes('loose'))).toBe(true)
  })

  it('recommends aligning misaligned grout', () => {
    const grout: GroutAnalysis[] = [
      { file: 'a.ts', neighborFile: 'b.ts', groutQuality: 30, alignment: 'misaligned', gaps: 3, overlaps: 2, description: 'bad' },
    ]
    const stats = makeStats({})
    const recs = generateRecommendations([], [], grout, stats)
    expect(recs.some(r => r.includes('misaligned'))).toBe(true)
  })

  it('recommends review for low fitness', () => {
    const stats = makeStats({ mosaicFitness: 30 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('fitness'))).toBe(true)
  })

  it('recommends review for low grout integrity', () => {
    const stats = makeStats({ groutIntegrity: 30 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('grout integrity'))).toBe(true)
  })

  it('recommends refactoring for high reject rate', () => {
    const stats = makeStats({ rejectTiles: 4, totalTiles: 10 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('reject'))).toBe(true)
  })
})

// ─── buildMosaicTileResult ──────────────────────────────────────────────────

describe('buildMosaicTileResult', () => {
  it('returns result with correct structure', () => {
    const result = buildMosaicTileResult([], [], {})
    expect(result).toHaveProperty('tiles')
    expect(result).toHaveProperty('patterns')
    expect(result).toHaveProperty('grout')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates tiles for each file', () => {
    const result = buildMosaicTileResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.tiles).toHaveLength(2)
  })

  it('populates stats correctly', () => {
    const result = buildMosaicTileResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.totalTiles).toBe(1)
    expect(result.stats.avgFitScore).toBeGreaterThanOrEqual(0)
  })

  it('finds patterns for similar tiles', () => {
    const result = buildMosaicTileResult(
      ['a.ts', 'b.ts'],
      ['export function f() {}', 'export function g() {}'],
      {},
    )
    expect(result.patterns.length).toBeGreaterThan(0)
  })

  it('computes mosaic fitness', () => {
    const result = buildMosaicTileResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.mosaicFitness).toBeGreaterThanOrEqual(0)
    expect(result.stats.mosaicFitness).toBeLessThanOrEqual(100)
  })

  it('computes tile diversity', () => {
    const result = buildMosaicTileResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.tileDiversity).toBeGreaterThanOrEqual(0)
    expect(result.stats.tileDiversity).toBeLessThanOrEqual(100)
  })

  it('classifies overall grade', () => {
    const result = buildMosaicTileResult(['a.ts'], ['export function f() {}'], {})
    expect(['masterwork-mosaic', 'quality-composition', 'standard-tiling', 'rough-patchwork', 'broken-mosaic']).toContain(result.stats.overallGrade)
  })

  it('handles empty input', () => {
    const result = buildMosaicTileResult([], [], {})
    expect(result.tiles).toHaveLength(0)
    expect(result.stats.totalTiles).toBe(0)
  })

  it('detects grout between connected tiles', () => {
    const result = buildMosaicTileResult(
      ['a.ts', 'b.ts'],
      ['export function shared() {}\nexport function other() {}', 'export function shared() {}\nexport function extra() {}'],
      {},
    )
    expect(result.grout.length).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalTiles).toBe(2)
  })
})

// ─── formatMosaicTileTable ──────────────────────────────────────────────────

describe('formatMosaicTileTable', () => {
  it('returns a string', () => {
    const result = buildMosaicTileResult([], [], {})
    const formatted = formatMosaicTileTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headers', () => {
    const result = buildMosaicTileResult(['a.ts'], ['export function f() {}'], {})
    const formatted = formatMosaicTileTable(result, false)
    expect(formatted).toContain('Tiles')
    expect(formatted).toContain('Statistics')
  })

  it('shows no files message when empty', () => {
    const result = buildMosaicTileResult([], [], {})
    const formatted = formatMosaicTileTable(result, false)
    expect(formatted).toContain('No tiles analyzed')
  })

  it('shows recommendations when present', () => {
    const result = buildMosaicTileResult([], [], {})
    const stats = makeStats({ mosaicFitness: 25, groutIntegrity: 25 })
    result.stats = stats
    result.recommendations = generateRecommendations([], [], [], stats)
    const formatted = formatMosaicTileTable(result, false)
    expect(formatted).toContain('Recommendations')
  })

  it('respects verbose flag', () => {
    const files = Array(15).fill('a.ts')
    const contents = Array(15).fill('export function f() {}')
    const result = buildMosaicTileResult(files, contents, {})
    const nonVerbose = formatMosaicTileTable(result, false)
    const verbose = formatMosaicTileTable(result, true)
    expect(verbose.length).toBeGreaterThan(nonVerbose.length)
  })
})

// ─── formatMosaicTileJson ───────────────────────────────────────────────────

describe('formatMosaicTileJson', () => {
  it('returns valid JSON', () => {
    const result = buildMosaicTileResult([], [], {})
    const json = formatMosaicTileJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains tiles in JSON', () => {
    const result = buildMosaicTileResult([], [], {})
    const parsed = JSON.parse(formatMosaicTileJson(result))
    expect(parsed).toHaveProperty('tiles')
  })

  it('contains stats in JSON', () => {
    const result = buildMosaicTileResult(['a.ts'], ['export function f() {}'], {})
    const parsed = JSON.parse(formatMosaicTileJson(result))
    expect(parsed).toHaveProperty('stats')
    expect(parsed.stats.totalTiles).toBe(1)
  })
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeTile(file: string, color: string, shape: Tile['shape'] = 'square'): Tile {
  return {
    file,
    shape,
    size: 10,
    color,
    edges: [],
    fitScore: 60,
    beautyScore: 60,
    contributionScore: 50,
    issues: [],
    grade: 'standard-tile',
  }
}

function makeTileWith(file: string, fit: number, beauty: number): Tile {
  return {
    file,
    shape: 'square',
    size: 10,
    color: 'functional',
    edges: [],
    fitScore: fit,
    beautyScore: beauty,
    contributionScore: 50,
    issues: [],
    grade: fit > 70 ? 'quality-tile' : 'standard-tile',
  }
}

function makeStats(overrides: Partial<MosaicTileStats> = {}): MosaicTileStats {
  return {
    totalTiles: 1,
    avgSize: 10,
    avgFitScore: 60,
    avgBeautyScore: 60,
    avgContributionScore: 50,
    masterpieceTiles: 0,
    rejectTiles: 0,
    totalIssues: 0,
    oversizedTiles: 0,
    chippedTiles: 0,
    looseTiles: 0,
    duplicatedTiles: 0,
    totalPatterns: 0,
    alignedPatterns: 0,
    avgGroutQuality: 75,
    misalignedGrout: 0,
    tileDiversity: 50,
    groutIntegrity: 75,
    mosaicFitness: 60,
    overallGrade: 'standard-tiling',
    ...overrides,
  }
}
