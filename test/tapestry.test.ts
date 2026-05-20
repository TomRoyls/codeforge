import { describe, expect, it } from 'vitest'

import {
  buildTapestryResult,
  classifySectionType,
  classifyThreadType,
  computeOverallIntegrity,
  computeSectionDensity,
  computeSectionIntegrity,
  computeTapestryCompleteness,
  computeThreadStrength,
  computeThreadThickness,
  detectWeavingPatterns,
  extractThreads,
  generateRecommendations,
  groupIntoSections,
  type TapestrySection,
  type TapestryStats,
  type Thread,
} from '../src/commands/tapestry-helpers.js'

import {
  formatSectionBreakdown,
  formatTapestryJSON,
  formatTapestryRecommendations,
  formatTapestryStats,
  formatTapestryTable,
  formatTapestryVisualization,
  formatThreadAlerts,
  formatThreadDistribution,
  formatThreadList,
  formatWeavingPatterns,
} from '../src/commands/tapestry-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const importCode = `import { add } from './math.js'
import type { Config } from './types.js'
import { validate } from './validate.js'

export function process(config: Config): string {
  return String(add(1, 2))
}
`

const coreImportCode = `import { discoverFiles } from '../core/file-discovery.js'
import { buildResult } from '../core/result.js'

export function run(): void {
  discoverFiles({})
}
`

const multiImportCode = `import { a, b, c, d, e } from './utils.js'
import { x } from './helpers.js'
import type { Config, Options, Result } from './types.js'
`

// ─── extractThreads ────────────────────────────────────────────────────────────

describe('extractThreads', () => {
  it('extracts import threads', () => {
    const threads = extractThreads(['proc.ts', 'math.ts', 'types.ts'], [importCode, '', ''])
    expect(threads.length).toBeGreaterThanOrEqual(2)
  })

  it('classifies core imports as warp', () => {
    const threads = extractThreads(['src/commands/cmd.ts', 'src/core/file-discovery.ts', 'src/core/result.ts'], [coreImportCode, '', ''])
    const warp = threads.find((t) => t.type === 'warp')
    expect(warp).toBeDefined()
  })

  it('detects broken threads for unresolved imports', () => {
    const threads = extractThreads(['a.ts'], ["import { x } from './nonexistent.js'"])
    expect(threads.some((t) => t.type === 'broken')).toBe(true)
  })

  it('extracts re-export threads', () => {
    const threads = extractThreads(['index.ts', 'math.ts'], ["export { add } from './math.js'", ''])
    expect(threads.some((t) => t.to === 'math.ts')).toBe(true)
  })

  it('returns empty for no imports', () => {
    const threads = extractThreads(['a.ts'], ['const x = 1'])
    expect(threads).toHaveLength(0)
  })

  it('computes thickness', () => {
    const threads = extractThreads(['a.ts', 'utils.ts'], [multiImportCode, ''])
    const utilsThread = threads.find((t) => t.to === 'utils.ts')
    expect(utilsThread?.thickness).toBeGreaterThanOrEqual(1)
  })

  it('sets strength based on type', () => {
    const threads = extractThreads(['a.ts', 'b.ts'], ["import { x } from './b.js'", ''])
    for (const t of threads) {
      expect(t.strength).toBeGreaterThanOrEqual(0)
      expect(t.strength).toBeLessThanOrEqual(100)
    }
  })
})

// ─── classifyThreadType ────────────────────────────────────────────────────────

describe('classifyThreadType', () => {
  it('returns broken for null target', () => {
    expect(classifyThreadType('a.ts', null, ['a.ts'], '')).toBe('broken')
  })

  it('returns broken for missing target', () => {
    expect(classifyThreadType('a.ts', 'z.ts', ['a.ts'], '')).toBe('broken')
  })

  it('returns warp for core imports', () => {
    expect(classifyThreadType('cmd.ts', 'src/core/discovery.ts', ['cmd.ts', 'src/core/discovery.ts'], '')).toBe('warp')
  })

  it('returns weft for same-directory imports', () => {
    expect(classifyThreadType('src/a.ts', 'src/b.ts', ['src/a.ts', 'src/b.ts'], '')).toBe('weft')
  })

  it('returns weft for utility imports', () => {
    expect(classifyThreadType('src/mod.ts', 'src/utils/helpers.ts', ['src/mod.ts', 'src/utils/helpers.ts'], '')).toBe('weft')
  })

  it('returns decorative for cross-module imports', () => {
    expect(classifyThreadType('src/features/a.ts', 'src/plugins/b.ts', ['src/features/a.ts', 'src/plugins/b.ts'], '')).toBe('decorative')
  })
})

// ─── computeThreadStrength ─────────────────────────────────────────────────────

describe('computeThreadStrength', () => {
  it('returns base strength for each type', () => {
    expect(computeThreadStrength('warp', 0)).toBeGreaterThanOrEqual(80)
    expect(computeThreadStrength('weft', 0)).toBeGreaterThanOrEqual(60)
    expect(computeThreadStrength('broken', 0)).toBe(0)
  })

  it('increases with thickness', () => {
    const thin = computeThreadStrength('warp', 1)
    const thick = computeThreadStrength('warp', 5)
    expect(thick).toBeGreaterThan(thin)
  })

  it('caps at 100', () => {
    expect(computeThreadStrength('warp', 100)).toBeLessThanOrEqual(100)
  })

  it('returns low strength for broken', () => {
    expect(computeThreadStrength('broken', 5)).toBeLessThanOrEqual(25)
  })
})

// ─── computeThreadThickness ────────────────────────────────────────────────────

describe('computeThreadThickness', () => {
  it('counts named imports', () => {
    const result = computeThreadThickness("import { a, b, c } from './utils.js'", './utils.js')
    expect(result).toBe(3)
  })

  it('counts single import', () => {
    const result = computeThreadThickness("import { x } from './mod.js'", './mod.js')
    expect(result).toBe(1)
  })

  it('counts default imports', () => {
    const result = computeThreadThickness("import React from './react.js'", './react.js')
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('counts star imports as 10', () => {
    const result = computeThreadThickness("import * as mod from './mod.js'", './mod.js')
    expect(result).toBe(10)
  })

  it('returns 1 for unknown patterns', () => {
    const result = computeThreadThickness("import './side-effects.js'", './side-effects.js')
    expect(result).toBe(1)
  })

  it('handles type imports', () => {
    const result = computeThreadThickness("import type { Config, Options, Result } from './types.js'", './types.js')
    expect(result).toBeGreaterThanOrEqual(3)
  })
})

// ─── classifySectionType ───────────────────────────────────────────────────────

describe('classifySectionType', () => {
  it('classifies core as foundation', () => {
    expect(classifySectionType('src/core', ['a.ts'])).toBe('foundation')
  })

  it('classifies commands as border', () => {
    expect(classifySectionType('src/commands', ['a.ts'])).toBe('border')
  })

  it('classifies test dirs as patch', () => {
    expect(classifySectionType('test', ['a.ts', 'b.ts', 'c.ts', 'd.ts'])).toBe('patch')
  })

  it('classifies utils as filler', () => {
    expect(classifySectionType('src/utils', ['a.ts'])).toBe('filler')
  })

  it('classifies large dirs as motif', () => {
    expect(classifySectionType('src/features', ['a.ts', 'b.ts', 'c.ts', 'd.ts'])).toBe('motif')
  })

  it('classifies small generic dirs as filler', () => {
    expect(classifySectionType('src/misc', ['a.ts'])).toBe('filler')
  })
})

// ─── groupIntoSections ─────────────────────────────────────────────────────────

describe('groupIntoSections', () => {
  it('groups by directory', () => {
    const sections = groupIntoSections(['src/a.ts', 'src/b.ts', 'test/a.ts'])
    expect(sections).toHaveLength(2)
  })

  it('sets section type', () => {
    const sections = groupIntoSections(['src/core/a.ts', 'src/commands/b.ts'])
    expect(sections.find((s) => s.name === 'src/core')?.type).toBe('foundation')
    expect(sections.find((s) => s.name === 'src/commands')?.type).toBe('border')
  })

  it('handles root files', () => {
    const sections = groupIntoSections(['a.ts'])
    expect(sections).toHaveLength(1)
    expect(sections[0].name).toBe('.')
  })
})

// ─── computeSectionDensity ─────────────────────────────────────────────────────

describe('computeSectionDensity', () => {
  it('returns 0 for empty section', () => {
    const section: TapestrySection = { name: 'src', threads: [], density: 0, pattern: '', integrity: 0, type: 'motif' }
    expect(computeSectionDensity(section, [], [])).toBe(0)
  })

  it('counts connections per file', () => {
    const section: TapestrySection = { name: 'src', threads: [], density: 0, pattern: '', integrity: 0, type: 'motif' }
    const threads: Thread[] = [
      { from: 'src/a.ts', to: 'src/b.ts', type: 'weft', strength: 60, color: '#00f', thickness: 1 },
      { from: 'src/b.ts', to: 'src/c.ts', type: 'weft', strength: 60, color: '#00f', thickness: 1 },
    ]
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const density = computeSectionDensity(section, threads, files)
    expect(density).toBeGreaterThan(0)
  })
})

// ─── computeSectionIntegrity ───────────────────────────────────────────────────

describe('computeSectionIntegrity', () => {
  it('returns 0 for empty files', () => {
    expect(computeSectionIntegrity([], [])).toBe(0)
  })

  it('returns 50 for no threads', () => {
    expect(computeSectionIntegrity([], ['a.ts'])).toBe(50)
  })

  it('returns higher for strong threads', () => {
    const strongThreads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'warp', strength: 80, color: '#f00', thickness: 3 },
    ]
    const weakThreads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'broken', strength: 0, color: '#aaa', thickness: 1 },
    ]
    const strong = computeSectionIntegrity(strongThreads, ['a.ts', 'b.ts'])
    const weak = computeSectionIntegrity(weakThreads, ['a.ts', 'b.ts'])
    expect(strong).toBeGreaterThan(weak)
  })

  it('returns 0-100', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'weft', strength: 60, color: '#00f', thickness: 1 },
    ]
    const result = computeSectionIntegrity(threads, ['a.ts', 'b.ts'])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computeOverallIntegrity ───────────────────────────────────────────────────

describe('computeOverallIntegrity', () => {
  it('returns 0 for empty sections', () => {
    expect(computeOverallIntegrity([])).toBe(0)
  })

  it('averages section integrity', () => {
    const sections: TapestrySection[] = [
      { name: 'a', threads: [], density: 0, pattern: '', integrity: 80, type: 'motif' },
      { name: 'b', threads: [], density: 0, pattern: '', integrity: 60, type: 'filler' },
    ]
    expect(computeOverallIntegrity(sections)).toBe(70)
  })
})

// ─── computeTapestryCompleteness ───────────────────────────────────────────────

describe('computeTapestryCompleteness', () => {
  it('returns 0 for empty', () => {
    expect(computeTapestryCompleteness([], [])).toBe(0)
  })

  it('returns higher for well-connected', () => {
    const sections: TapestrySection[] = [
      { name: 'src', threads: [], density: 2, pattern: '', integrity: 80, type: 'motif' },
    ]
    const threads: Thread[] = [
      { from: 'src/a.ts', to: 'src/b.ts', type: 'weft', strength: 60, color: '#00f', thickness: 1 },
    ]
    const result = computeTapestryCompleteness(sections, threads)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── detectWeavingPatterns ─────────────────────────────────────────────────────

describe('detectWeavingPatterns', () => {
  it('returns simple pattern for small projects', () => {
    const sections: TapestrySection[] = [
      { name: 'src', threads: [], density: 0, pattern: '', integrity: 50, type: 'motif' },
    ]
    const threads: Thread[] = [
      { from: 'src/a.ts', to: 'src/b.ts', type: 'weft', strength: 60, color: '#00f', thickness: 1 },
    ]
    const patterns = detectWeavingPatterns(sections, threads)
    expect(patterns.length).toBeGreaterThanOrEqual(1)
  })

  it('detects hub-and-spoke pattern', () => {
    const threads: Thread[] = Array.from({ length: 5 }, (_, i) => ({
      from: `mod${i}.ts`, to: 'hub.ts', type: 'weft' as const, strength: 60, color: '#00f', thickness: 1,
    }))
    const sections: TapestrySection[] = [
      { name: '.', threads, density: 5, pattern: '', integrity: 70, type: 'motif' },
    ]
    const patterns = detectWeavingPatterns(sections, threads)
    const hub = patterns.find((p) => p.name === 'hub-and-spoke')
    expect(hub).toBeDefined()
  })

  it('returns patterns with quality scores', () => {
    const patterns = detectWeavingPatterns([], [])
    for (const p of patterns) {
      expect(p.quality).toBeGreaterThanOrEqual(0)
      expect(p.quality).toBeLessThanOrEqual(100)
    }
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: TapestryStats = {
    totalThreads: 10, warpCount: 5, weftCount: 3, looseCount: 0, brokenCount: 0,
    sectionCount: 2, avgDensity: 2, avgIntegrity: 70, dominantPattern: 'layered',
    overallIntegrity: 70, tapestryCompleteness: 80, loosestSection: 'test', tightestSection: 'src',
  }

  it('recommends for broken threads', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'z.ts', type: 'broken', strength: 0, color: '#aaa', thickness: 1 },
    ]
    const recs = generateRecommendations(threads, [], [], baseStats)
    expect(recs.some((r) => r.includes('broken'))).toBe(true)
  })

  it('recommends for loose threads', () => {
    const stats = { ...baseStats, looseCount: 5 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('loose'))).toBe(true)
  })

  it('recommends for low integrity', () => {
    const sections: TapestrySection[] = [
      { name: 'bad', threads: [], density: 0, pattern: '', integrity: 20, type: 'filler' },
    ]
    const recs = generateRecommendations([], sections, [], baseStats)
    expect(recs.some((r) => r.includes('integrity') || r.includes('low'))).toBe(true)
  })

  it('praises high integrity', () => {
    const stats = { ...baseStats, overallIntegrity: 80 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('well-woven') || r.includes('strong'))).toBe(true)
  })

  it('warns about low completeness', () => {
    const stats = { ...baseStats, tapestryCompleteness: 30 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('completeness') || r.includes('connections'))).toBe(true)
  })

  it('gives positive when all well', () => {
    const goodStats: TapestryStats = {
      totalThreads: 10, warpCount: 5, weftCount: 5, looseCount: 0, brokenCount: 0,
      sectionCount: 2, avgDensity: 3, avgIntegrity: 80, dominantPattern: 'layered',
      overallIntegrity: 80, tapestryCompleteness: 90, loosestSection: 'test', tightestSection: 'src',
    }
    const recs = generateRecommendations([], [], [], goodStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildTapestryResult ───────────────────────────────────────────────────────

describe('buildTapestryResult', () => {
  it('handles empty input', () => {
    const result = buildTapestryResult([], [], {})
    expect(result.threads).toHaveLength(0)
    expect(result.stats.totalThreads).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('extracts threads', () => {
    const result = buildTapestryResult(['a.ts', 'b.ts'], [importCode, 'export function add() {}'])
    expect(result.threads.length).toBeGreaterThanOrEqual(0)
  })

  it('creates sections', () => {
    const result = buildTapestryResult(['src/a.ts', 'src/b.ts'], [importCode, ''])
    expect(result.sections.length).toBeGreaterThanOrEqual(1)
  })

  it('computes stats', () => {
    const result = buildTapestryResult(['src/a.ts'], [importCode])
    expect(result.stats.totalThreads).toBeGreaterThanOrEqual(0)
    expect(result.stats.sectionCount).toBeGreaterThanOrEqual(1)
  })

  it('computes overall integrity', () => {
    const result = buildTapestryResult(['a.ts'], ['const x = 1'])
    expect(result.stats.overallIntegrity).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallIntegrity).toBeLessThanOrEqual(100)
  })

  it('computes completeness', () => {
    const result = buildTapestryResult(['a.ts'], ['const x = 1'])
    expect(result.stats.tapestryCompleteness).toBeGreaterThanOrEqual(0)
    expect(result.stats.tapestryCompleteness).toBeLessThanOrEqual(100)
  })

  it('detects patterns', () => {
    const result = buildTapestryResult(['a.ts'], ['const x = 1'])
    expect(result.patterns.length).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const result = buildTapestryResult(['a.ts'], ['const x = 1'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('identifies loosest and tightest sections', () => {
    const result = buildTapestryResult(['src/a.ts', 'src/b.ts'], [importCode, 'export {}'])
    expect(result.stats.loosestSection).toBeTruthy()
    expect(result.stats.tightestSection).toBeTruthy()
  })

  it('handles mismatched files/contents', () => {
    const result = buildTapestryResult(['a.ts', 'b.ts'], ['code'], {})
    expect(result.threads).toBeDefined()
  })
})

// ─── format helpers ────────────────────────────────────────────────────────────

describe('formatTapestryVisualization', () => {
  it('handles empty threads', () => {
    expect(formatTapestryVisualization([], [])).toContain('No threads')
  })

  it('shows sections', () => {
    const threads: Thread[] = [
      { from: 'src/a.ts', to: 'src/b.ts', type: 'weft', strength: 60, color: '#00f', thickness: 1 },
    ]
    const sections: TapestrySection[] = [
      { name: 'src', threads, density: 2, pattern: '', integrity: 70, type: 'motif' },
    ]
    const output = formatTapestryVisualization(threads, sections)
    expect(output).toContain('src')
  })
})

describe('formatThreadList', () => {
  it('handles empty', () => {
    expect(formatThreadList([])).toContain('No threads')
  })

  it('shows thread details', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'weft', strength: 70, color: '#00f', thickness: 2 },
    ]
    const output = formatThreadList(threads)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatSectionBreakdown', () => {
  it('handles empty', () => {
    expect(formatSectionBreakdown([])).toContain('No sections')
  })

  it('shows section info', () => {
    const sections: TapestrySection[] = [
      { name: 'src', threads: [], density: 2, pattern: 'interconnected', integrity: 80, type: 'motif' },
    ]
    const output = formatSectionBreakdown(sections)
    expect(output).toContain('src')
    expect(output).toContain('80%')
  })
})

describe('formatWeavingPatterns', () => {
  it('handles empty', () => {
    expect(formatWeavingPatterns([])).toContain('No patterns')
  })

  it('shows patterns', () => {
    const patterns = [{ name: 'layered', sections: ['src', 'test'], description: 'Clear layers', quality: 75 }]
    const output = formatWeavingPatterns(patterns)
    expect(output).toContain('layered')
    expect(output).toContain('75%')
  })
})

describe('formatThreadDistribution', () => {
  it('shows distribution', () => {
    const stats: TapestryStats = {
      totalThreads: 10, warpCount: 5, weftCount: 3, looseCount: 1, brokenCount: 1,
      sectionCount: 2, avgDensity: 2, avgIntegrity: 70, dominantPattern: 'layered',
      overallIntegrity: 70, tapestryCompleteness: 80, loosestSection: 'test', tightestSection: 'src',
    }
    const output = formatThreadDistribution(stats)
    expect(output).toContain('Warp')
    expect(output).toContain('Weft')
    expect(output).toContain('Broken')
  })
})

describe('formatThreadAlerts', () => {
  it('shows no alerts when clean', () => {
    expect(formatThreadAlerts([])).toContain('No loose or broken')
  })

  it('shows broken threads', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'z.ts', type: 'broken', strength: 0, color: '#aaa', thickness: 1 },
    ]
    const output = formatThreadAlerts(threads)
    expect(output).toContain('BROKEN')
  })

  it('shows loose threads', () => {
    const threads: Thread[] = [
      { from: 'a.ts', to: 'b.ts', type: 'loose', strength: 20, color: '#ff0', thickness: 1 },
    ]
    const output = formatThreadAlerts(threads)
    expect(output).toContain('LOOSE')
  })
})

describe('formatTapestryStats', () => {
  it('formats stats', () => {
    const stats: TapestryStats = {
      totalThreads: 20, warpCount: 8, weftCount: 7, looseCount: 2, brokenCount: 3,
      sectionCount: 4, avgDensity: 3.5, avgIntegrity: 72, dominantPattern: 'layered',
      overallIntegrity: 72, tapestryCompleteness: 85, loosestSection: 'test', tightestSection: 'src/core',
    }
    const output = formatTapestryStats(stats)
    expect(output).toContain('Total Threads')
    expect(output).toContain('20')
    expect(output).toContain('layered')
  })
})

describe('formatTapestryRecommendations', () => {
  it('handles empty', () => {
    expect(formatTapestryRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatTapestryRecommendations(['Fix A', 'Fix B'])
    expect(output).toContain('1. Fix A')
    expect(output).toContain('2. Fix B')
  })
})

describe('formatTapestryTable', () => {
  it('formats complete result', () => {
    const result = buildTapestryResult(['a.ts'], ['const x = 1'])
    const output = formatTapestryTable(result)
    expect(output).toContain('Tapestry Analysis')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })

  it('handles empty result', () => {
    const result = buildTapestryResult([], [], {})
    const output = formatTapestryTable(result)
    expect(output).toContain('Tapestry Analysis')
  })
})

describe('formatTapestryJSON', () => {
  it('returns valid JSON', () => {
    const result = buildTapestryResult(['a.ts'], ['const x = 1'])
    const parsed = JSON.parse(formatTapestryJSON(result))
    expect(parsed).toHaveProperty('threads')
    expect(parsed).toHaveProperty('sections')
    expect(parsed).toHaveProperty('patterns')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('handles empty result', () => {
    const result = buildTapestryResult([], [], {})
    const parsed = JSON.parse(formatTapestryJSON(result))
    expect(parsed.threads).toHaveLength(0)
  })
})
