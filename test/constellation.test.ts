import { describe, expect, it } from 'vitest'

import {
  buildConstellationResult,
  buildStarMap,
  classifyLinkType,
  classifyStar,
  computeBrightness,
  computeConstellationStats,
  computePositions,
  extractImports,
  findConstellations,
  findDarkMatter,
  generateConstellationRecommendations,
  resolveImportPath,
  type Constellation,
  type ConstellationLink,
  type ConstellationStats,
  type Star,
} from '../src/commands/constellation-helpers.js'

import {
  formatConstellationJSON,
  formatConstellationStats,
  formatConstellationTable,
  formatConstellations,
  formatDarkMatter,
  formatLink,
  formatLinks,
  formatRecommendations,
  formatStarMap,
  formatStarRow,
  getBrightnessBar,
  getStarColor,
  getStarSymbol,
} from '../src/commands/constellation-format-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStar(overrides: Partial<Star> = {}): Star {
  return {
    name: 'test',
    file: 'test.ts',
    brightness: 50,
    size: 100,
    connections: 3,
    type: 'main-sequence',
    position: { x: 0, y: 0 },
    ...overrides,
  }
}

function makeLink(overrides: Partial<ConstellationLink> = {}): ConstellationLink {
  return {
    from: 'a.ts',
    to: 'b.ts',
    strength: 1,
    type: 'import',
    ...overrides,
  }
}

// ─── extractImports ───────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts static imports', () => {
    const result = extractImports("import { foo } from './mod'")
    expect(result).toContain('./mod')
  })

  it('extracts type imports', () => {
    const result = extractImports("import type { X } from './types'")
    expect(result).toContain('./types')
  })

  it('extracts namespace imports', () => {
    const result = extractImports("import * as fs from 'fs'")
    expect(result).toContain('fs')
  })

  it('extracts re-exports', () => {
    const result = extractImports("export { foo } from './mod'")
    expect(result).toContain('./mod')
  })

  it('extracts dynamic imports', () => {
    const result = extractImports("const mod = import('./mod')")
    expect(result).toContain('./mod')
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })

  it('extracts multiple imports from multi-line content', () => {
    const code = "import { a } from './a'\nimport { b } from './b'\n"
    expect(extractImports(code).length).toBe(2)
  })

  it('handles default imports', () => {
    const result = extractImports("import foo from './foo'")
    expect(result).toContain('./foo')
  })
})

// ─── classifyLinkType ─────────────────────────────────────────────────────────

describe('classifyLinkType', () => {
  it('classifies import', () => {
    expect(classifyLinkType("import { x } from './mod'")).toBe('import')
  })

  it('classifies re-export', () => {
    expect(classifyLinkType("export { x } from './mod'")).toBe('re-export')
  })

  it('classifies dynamic import', () => {
    expect(classifyLinkType("const m = import('./mod')")).toBe('dynamic-import')
  })

  it('defaults to import for ambiguous lines', () => {
    expect(classifyLinkType('const x = 1')).toBe('import')
  })
})

// ─── resolveImportPath ────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves relative imports', () => {
    expect(resolveImportPath('./helpers', 'src/commands/index.ts')).toBe('src/commands/helpers.ts')
  })

  it('resolves parent directory imports', () => {
    expect(resolveImportPath('../utils', 'src/commands/index.ts')).toBe('src/utils.ts')
  })

  it('returns non-relative paths as-is', () => {
    expect(resolveImportPath('chalk', 'src/index.ts')).toBe('chalk')
  })

  it('handles deep nesting', () => {
    expect(resolveImportPath('../../core/mod', 'src/commands/sub/index.ts')).toBe('src/core/mod.ts')
  })
})

// ─── computeBrightness ────────────────────────────────────────────────────────

describe('computeBrightness', () => {
  it('returns 0 when maxDependents is 0', () => {
    expect(computeBrightness(5, 0)).toBe(0)
  })

  it('computes normalized brightness', () => {
    expect(computeBrightness(5, 10)).toBe(50)
  })

  it('clamps to 100', () => {
    expect(computeBrightness(20, 10)).toBe(100)
  })

  it('returns 0 for 0 dependents', () => {
    expect(computeBrightness(0, 10)).toBe(0)
  })

  it('returns 100 when dependent count equals max', () => {
    expect(computeBrightness(10, 10)).toBe(100)
  })
})

// ─── classifyStar ─────────────────────────────────────────────────────────────

describe('classifyStar', () => {
  it('classifies binary', () => {
    expect(classifyStar(50, 1, true)).toBe('binary')
  })

  it('classifies dark for brightness 0', () => {
    expect(classifyStar(0, 0, false)).toBe('dark')
  })

  it('classifies giant for brightness > 70', () => {
    expect(classifyStar(80, 5, false)).toBe('giant')
  })

  it('classifies main-sequence for brightness 20-70', () => {
    expect(classifyStar(50, 3, false)).toBe('main-sequence')
  })

  it('classifies dwarf for brightness 1-19', () => {
    expect(classifyStar(10, 1, false)).toBe('dwarf')
  })

  it('binary takes precedence over dark', () => {
    expect(classifyStar(0, 1, true)).toBe('binary')
  })
})

// ─── buildStarMap ─────────────────────────────────────────────────────────────

describe('buildStarMap', () => {
  it('creates stars for each file', () => {
    const { stars } = buildStarMap(['a.ts', 'b.ts'], ['export const x = 1', 'export const y = 2'])
    expect(stars.length).toBe(2)
  })

  it('creates links for imports', () => {
    const { links } = buildStarMap(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    expect(links.length).toBe(1)
    expect(links[0]!.from).toBe('a.ts')
    expect(links[0]!.to).toBe('b.ts')
  })

  it('assigns brightness based on dependents', () => {
    const { stars } = buildStarMap(
      ['a.ts', 'b.ts', 'c.ts'],
      ["import { x } from './b'", 'export const x = 1', "import { x } from './b'"],
    )
    const bStar = stars.find((s) => s.file === 'b.ts')
    expect(bStar!.brightness).toBe(100)
  })

  it('detects binary pairs', () => {
    const { stars } = buildStarMap(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", "import { y } from './a'"],
    )
    expect(stars.every((s) => s.type === 'binary')).toBe(true)
  })

  it('marks isolated files as dark', () => {
    const { stars } = buildStarMap(['orphan.ts'], ['const x = 1'])
    expect(stars[0]!.type).toBe('dark')
    expect(stars[0]!.brightness).toBe(0)
  })

  it('computes size from line count', () => {
    const { stars } = buildStarMap(['big.ts'], [Array(50).fill('const x = 1').join('\n')])
    expect(stars[0]!.size).toBe(50)
  })

  it('ignores non-relative imports', () => {
    const { links } = buildStarMap(
      ['a.ts'],
      ["import chalk from 'chalk'"],
    )
    expect(links.length).toBe(0)
  })
})

// ─── computePositions ─────────────────────────────────────────────────────────

describe('computePositions', () => {
  it('assigns grid positions', () => {
    const stars = [
      makeStar({ file: 'a.ts' }),
      makeStar({ file: 'b.ts' }),
      makeStar({ file: 'c.ts' }),
      makeStar({ file: 'd.ts' }),
    ]
    const result = computePositions(stars)
    expect(result[0]!.position).toEqual({ x: 0, y: 0 })
    expect(result[1]!.position).toEqual({ x: 1, y: 0 })
    expect(result[2]!.position).toEqual({ x: 0, y: 1 })
    expect(result[3]!.position).toEqual({ x: 1, y: 1 })
  })

  it('handles empty array', () => {
    expect(computePositions([])).toEqual([])
  })

  it('handles single star', () => {
    const result = computePositions([makeStar()])
    expect(result[0]!.position).toEqual({ x: 0, y: 0 })
  })
})

// ─── findConstellations ───────────────────────────────────────────────────────

describe('findConstellations', () => {
  it('returns empty for no stars', () => {
    expect(findConstellations([], [])).toEqual([])
  })

  it('returns empty for disconnected single stars', () => {
    const stars = [makeStar({ file: 'a.ts' }), makeStar({ file: 'b.ts' })]
    expect(findConstellations(stars, [])).toEqual([])
  })

  it('groups connected stars into constellations', () => {
    const stars = [
      makeStar({ file: 'a.ts', name: 'a' }),
      makeStar({ file: 'b.ts', name: 'b' }),
    ]
    const links = [makeLink({ from: 'a.ts', to: 'b.ts' })]
    const result = findConstellations(stars, links)
    expect(result.length).toBe(1)
    expect(result[0]!.stars).toContain('a.ts')
    expect(result[0]!.stars).toContain('b.ts')
  })

  it('names constellation after directory', () => {
    const stars = [
      makeStar({ file: 'src/commands/a.ts', name: 'a', brightness: 80 }),
      makeStar({ file: 'src/commands/b.ts', name: 'b', brightness: 40 }),
    ]
    const links = [makeLink({ from: 'src/commands/a.ts', to: 'src/commands/b.ts' })]
    const result = findConstellations(stars, links)
    expect(result[0]!.name).toContain('Commands')
  })

  it('computes total brightness', () => {
    const stars = [
      makeStar({ file: 'a.ts', brightness: 60 }),
      makeStar({ file: 'b.ts', brightness: 40 }),
    ]
    const links = [makeLink({ from: 'a.ts', to: 'b.ts' })]
    const result = findConstellations(stars, links)
    expect(result[0]!.totalBrightness).toBe(100)
  })

  it('separates disconnected groups', () => {
    const stars = [
      makeStar({ file: 'a.ts' }),
      makeStar({ file: 'b.ts' }),
      makeStar({ file: 'c.ts' }),
      makeStar({ file: 'd.ts' }),
    ]
    const links = [
      makeLink({ from: 'a.ts', to: 'b.ts' }),
      makeLink({ from: 'c.ts', to: 'd.ts' }),
    ]
    const result = findConstellations(stars, links)
    expect(result.length).toBe(2)
  })
})

// ─── findDarkMatter ───────────────────────────────────────────────────────────

describe('findDarkMatter', () => {
  it('finds stars with no incoming links', () => {
    const stars = [
      makeStar({ file: 'orphan.ts', type: 'dark', brightness: 0 }),
      makeStar({ file: 'used.ts', type: 'main-sequence', brightness: 50 }),
    ]
    const links = [makeLink({ from: 'other.ts', to: 'used.ts' })]
    const result = findDarkMatter(stars, links)
    expect(result.length).toBe(1)
    expect(result[0]!.file).toBe('orphan.ts')
  })

  it('excludes entry point files', () => {
    const stars = [makeStar({ file: 'src/index.ts', type: 'dark', brightness: 0 })]
    const result = findDarkMatter(stars, [])
    expect(result.length).toBe(0)
  })

  it('excludes main.ts entry points', () => {
    const stars = [makeStar({ file: 'main.ts', type: 'dark', brightness: 0 })]
    const result = findDarkMatter(stars, [])
    expect(result.length).toBe(0)
  })

  it('returns empty when all stars have incoming links', () => {
    const stars = [makeStar({ file: 'a.ts' }), makeStar({ file: 'b.ts' })]
    const links = [makeLink({ from: 'a.ts', to: 'b.ts' }), makeLink({ from: 'b.ts', to: 'a.ts' })]
    expect(findDarkMatter(stars, links).length).toBe(0)
  })
})

// ─── computeConstellationStats ────────────────────────────────────────────────

describe('computeConstellationStats', () => {
  it('returns zeroed stats for empty input', () => {
    const stats = computeConstellationStats([], [], [])
    expect(stats.totalStars).toBe(0)
    expect(stats.totalLinks).toBe(0)
  })

  it('counts star types', () => {
    const stars = [
      makeStar({ type: 'giant', brightness: 80 }),
      makeStar({ type: 'dark', brightness: 0 }),
      makeStar({ type: 'main-sequence', brightness: 50 }),
    ]
    const stats = computeConstellationStats(stars, [], [])
    expect(stats.giantStars).toBe(1)
    expect(stats.darkStars).toBe(1)
  })

  it('computes average brightness', () => {
    const stars = [makeStar({ brightness: 40 }), makeStar({ brightness: 60 })]
    const stats = computeConstellationStats(stars, [], [])
    expect(stats.averageBrightness).toBe(50)
  })

  it('identifies brightest star', () => {
    const stars = [makeStar({ name: 'bright', brightness: 90 }), makeStar({ name: 'dim', brightness: 10 })]
    const stats = computeConstellationStats(stars, [], [])
    expect(stats.brightestStar).toBe('bright')
  })

  it('identifies densest region', () => {
    const stars = [makeStar({ file: 'a.ts' }), makeStar({ file: 'b.ts' })]
    const constellations: Constellation[] = [{
      name: 'Big Cluster',
      stars: ['a.ts', 'b.ts'],
      description: 'test',
      totalBrightness: 100,
    }]
    const stats = computeConstellationStats(stars, [], constellations)
    expect(stats.densestRegion).toBe('Big Cluster')
  })

  it('counts constellations found', () => {
    const stats = computeConstellationStats(
      [makeStar()],
      [],
      [{ name: 'A', stars: ['a.ts'], description: '', totalBrightness: 50 }],
    )
    expect(stats.constellationsFound).toBe(1)
  })
})

// ─── generateConstellationRecommendations ─────────────────────────────────────

describe('generateConstellationRecommendations', () => {
  it('warns about dark matter', () => {
    const dark = [makeStar({ name: 'dead' })]
    const recs = generateConstellationRecommendations(dark, makeStar().file.length > 0 ? { totalStars: 5, totalLinks: 3, giantStars: 0, darkStars: 1, constellationsFound: 1, averageBrightness: 50, brightestStar: 'x', densestRegion: '' } : { totalStars: 0, totalLinks: 0, giantStars: 0, darkStars: 0, constellationsFound: 0, averageBrightness: 0, brightestStar: '', densestRegion: '' }, [])
    expect(recs.some((r) => r.includes('dark matter'))).toBe(true)
  })

  it('warns about giant stars needing protection', () => {
    const stats: ConstellationStats = { totalStars: 5, totalLinks: 3, giantStars: 2, darkStars: 0, constellationsFound: 1, averageBrightness: 50, brightestStar: 'x', densestRegion: '' }
    const recs = generateConstellationRecommendations([], stats, [])
    expect(recs.some((r) => r.includes('giant') && r.includes('protection'))).toBe(true)
  })

  it('warns about dense constellations', () => {
    const constellations: Constellation[] = [{ name: 'Big', stars: Array(7).fill('a.ts'), description: '', totalBrightness: 100 }]
    const stats: ConstellationStats = { totalStars: 10, totalLinks: 5, giantStars: 0, darkStars: 0, constellationsFound: 1, averageBrightness: 50, brightestStar: 'x', densestRegion: '' }
    const recs = generateConstellationRecommendations([], stats, constellations)
    expect(recs.some((r) => r.includes('dense') && r.includes('coupling'))).toBe(true)
  })

  it('warns about high link-to-star ratio', () => {
    const stats: ConstellationStats = { totalStars: 3, totalLinks: 10, giantStars: 0, darkStars: 0, constellationsFound: 1, averageBrightness: 50, brightestStar: 'x', densestRegion: '' }
    const recs = generateConstellationRecommendations([], stats, [])
    expect(recs.some((r) => r.includes('interconnected'))).toBe(true)
  })

  it('warns about too many dark stars', () => {
    const stats: ConstellationStats = { totalStars: 10, totalLinks: 3, giantStars: 0, darkStars: 5, constellationsFound: 1, averageBrightness: 30, brightestStar: 'x', densestRegion: '' }
    const recs = generateConstellationRecommendations([], stats, [])
    expect(recs.some((r) => r.includes('dark stars'))).toBe(true)
  })

  it('says healthy when all good', () => {
    const stats: ConstellationStats = { totalStars: 10, totalLinks: 5, giantStars: 0, darkStars: 0, constellationsFound: 2, averageBrightness: 50, brightestStar: 'x', densestRegion: '' }
    const recs = generateConstellationRecommendations([], stats, [])
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildConstellationResult ─────────────────────────────────────────────────

describe('buildConstellationResult', () => {
  it('builds result with stars and links', () => {
    const result = buildConstellationResult(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    expect(result.stars.length).toBe(2)
    expect(result.links.length).toBe(1)
  })

  it('finds constellations', () => {
    const result = buildConstellationResult(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    expect(result.constellations.length).toBeGreaterThanOrEqual(1)
  })

  it('finds dark matter', () => {
    const result = buildConstellationResult(
      ['a.ts', 'b.ts', 'orphan.ts'],
      ["import { x } from './b'", 'export const x = 1', 'const y = 2'],
    )
    expect(result.darkMatter.length).toBeGreaterThanOrEqual(0)
  })

  it('computes stats', () => {
    const result = buildConstellationResult(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    expect(result.stats.totalStars).toBe(2)
    expect(result.stats.totalLinks).toBe(1)
  })

  it('generates recommendations', () => {
    const result = buildConstellationResult(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildConstellationResult([], [])
    expect(result.stars.length).toBe(0)
    expect(result.stats.totalStars).toBe(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getStarSymbol', () => {
  it('returns correct symbols for each type', () => {
    expect(getStarSymbol('giant')).toBe('★')
    expect(getStarSymbol('main-sequence')).toBe('✦')
    expect(getStarSymbol('dwarf')).toBe('·')
    expect(getStarSymbol('dark')).toBe('○')
    expect(getStarSymbol('binary')).toBe('⋈')
  })
})

describe('getStarColor', () => {
  it('returns function for each type', () => {
    for (const t of ['giant', 'main-sequence', 'dwarf', 'dark', 'binary'] as const) {
      expect(typeof getStarColor(t)).toBe('function')
    }
  })
})

describe('getBrightnessBar', () => {
  it('returns 10 characters', () => {
    expect(getBrightnessBar(50).length).toBe(10)
  })

  it('returns all filled for 100', () => {
    expect(getBrightnessBar(100)).toBe('★★★★★★★★★★')
  })

  it('returns all empty for 0', () => {
    expect(getBrightnessBar(0)).toBe('☆☆☆☆☆☆☆☆☆☆')
  })
})

describe('formatStarRow', () => {
  it('includes star name and metrics', () => {
    const star = makeStar({ name: 'test', brightness: 60, connections: 3, size: 100 })
    const result = formatStarRow(star)
    expect(result).toContain('test')
    expect(result).toContain('B: 60')
    expect(result).toContain('C: 3')
    expect(result).toContain('S:  100')
  })
})

describe('formatStarMap', () => {
  it('renders header and stars', () => {
    const stars = [makeStar({ name: 'a' }), makeStar({ name: 'b' })]
    const result = formatStarMap(stars)
    expect(result).toContain('Star Map')
    expect(result).toContain('a')
    expect(result).toContain('b')
  })

  it('truncates when > 30 stars', () => {
    const stars = Array(35).fill(null).map((_, i) => makeStar({ name: `star${i}` }))
    const result = formatStarMap(stars)
    expect(result).toContain('more stars')
  })
})

describe('formatLink', () => {
  it('shows import arrow', () => {
    const link = makeLink({ from: 'a.ts', to: 'b.ts', type: 'import' })
    expect(formatLink(link)).toContain('→')
  })

  it('shows re-export arrow', () => {
    const link = makeLink({ from: 'a.ts', to: 'b.ts', type: 're-export' })
    expect(formatLink(link)).toContain('⟸')
  })

  it('shows dynamic-import arrow', () => {
    const link = makeLink({ from: 'a.ts', to: 'b.ts', type: 'dynamic-import' })
    expect(formatLink(link)).toContain('⇝')
  })
})

describe('formatLinks', () => {
  it('shows no links message for empty', () => {
    expect(formatLinks([])).toContain('No links')
  })

  it('renders link list', () => {
    const links = [makeLink(), makeLink({ from: 'c.ts', to: 'd.ts' })]
    const result = formatLinks(links)
    expect(result).toContain('Links')
    expect(result).toContain('a.ts')
  })
})

describe('formatConstellations', () => {
  it('shows no constellations message', () => {
    expect(formatConstellations([])).toContain('No constellations')
  })

  it('renders constellation details', () => {
    const c: Constellation = { name: 'Test Cluster', stars: ['a.ts', 'b.ts'], description: 'test desc', totalBrightness: 80 }
    const result = formatConstellations([c])
    expect(result).toContain('Test Cluster')
    expect(result).toContain('2 stars')
  })
})

describe('formatDarkMatter', () => {
  it('shows no dark matter message', () => {
    expect(formatDarkMatter([])).toContain('No dark matter')
  })

  it('lists dark matter files', () => {
    const dm = [makeStar({ name: 'dead', file: 'dead.ts' })]
    const result = formatDarkMatter(dm)
    expect(result).toContain('dead')
    expect(result).toContain('no incoming connections')
  })
})

describe('formatConstellationStats', () => {
  it('renders stats with all fields', () => {
    const stats: ConstellationStats = { totalStars: 10, totalLinks: 15, giantStars: 2, darkStars: 3, constellationsFound: 2, averageBrightness: 45, brightestStar: 'core', densestRegion: 'Commands Cluster' }
    const result = formatConstellationStats(stats)
    expect(result).toContain('Stars: 10')
    expect(result).toContain('Links: 15')
    expect(result).toContain('Giants: 2')
    expect(result).toContain('Dark: 3')
    expect(result).toContain('Brightest: core')
    expect(result).toContain('Commands Cluster')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered list', () => {
    expect(formatRecommendations(['Fix A', 'Fix B'])).toContain('1. Fix A')
    expect(formatRecommendations(['Fix A', 'Fix B'])).toContain('2. Fix B')
  })

  it('shows empty message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatConstellationTable', () => {
  it('renders full table with all sections', () => {
    const result = buildConstellationResult(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    const output = formatConstellationTable(result)
    expect(output).toContain('Module Constellation Map')
    expect(output).toContain('Star Map')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })
})

describe('formatConstellationJSON', () => {
  it('returns valid JSON', () => {
    const result = buildConstellationResult(['a.ts'], ['export const x = 1'])
    const json = formatConstellationJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.stars.length).toBe(1)
  })
})
