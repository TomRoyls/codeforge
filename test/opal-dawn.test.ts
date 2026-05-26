import { describe, expect, it } from 'vitest'

import {
  analyzeOpalFragment,
  analyzeOpalVein,
  buildOpalHorizonResult,
  classifyFragmentCondition,
  classifyLapidaryGrade,
  classifyVeinCondition,
  classifyVeinType,
  generateRecommendations,
  measureDiffracting,
  measureRevealing,
  measureWarming,
  measureSpanning,
  measureGlowing,
  type OpalFragment,
  type OpalVein,
  type OpalHorizonResult,
} from '../src/commands/opal-dawn-helpers.js'

import {
  colorScore,
  colorVeinCondition,
  formatFragmentTable,
  formatFragmentsTable,
  formatVeinTable,
  formatVeinsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/opal-dawn-format-helpers.js'

// ─── Test fixtures ──────────────────────────────────────

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

const emptyContent = ''

const poorContent = 'var x = eval("1+2") any global hack'

// ─── measureDiffracting ─────────────────────────────────

describe('measureDiffracting', () => {
  it('scores rich content highly', () => {
    const result = measureDiffracting(richContent)
    expect(result.color).toBeGreaterThan(60)
    expect(result.hasHighColor).toBe(true)
  })

  it('scores empty content poorly', () => {
    const result = measureDiffracting(emptyContent)
    expect(result.color).toBeLessThan(50)
    expect(result.hasHighColor).toBe(false)
  })

  it('detects monolithic content', () => {
    const result = measureDiffracting('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects rigid content', () => {
    const result = measureDiffracting('rigid inflexible brittle stiff code')
    expect(result.rigidCount).toBeGreaterThan(0)
    expect(result.hasShifting).toBe(false)
  })

  it('classifies play for rich content', () => {
    const result = measureDiffracting(richContent)
    expect(['kaleidoscope', 'black-opal', 'proper-play']).toContain(result.play)
  })

  it('has all boolean fields', () => {
    const result = measureDiffracting(richContent)
    expect(typeof result.hasVersatile).toBe('boolean')
    expect(typeof result.hasMultiFaceted).toBe('boolean')
    expect(typeof result.hasAdaptable).toBe('boolean')
    expect(typeof result.hasFlexible).toBe('boolean')
    expect(typeof result.hasModular).toBe('boolean')
    expect(typeof result.hasDiverse).toBe('boolean')
    expect(typeof result.hasRich).toBe('boolean')
    expect(typeof result.hasDynamic).toBe('boolean')
    expect(typeof result.hasMultiDimensional).toBe('boolean')
    expect(typeof result.hasLayered).toBe('boolean')
    expect(typeof result.hasComplex).toBe('boolean')
    expect(typeof result.hasColorful).toBe('boolean')
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores poor content low', () => {
    const result = measureRevealing(poorContent)
    expect(result.clarity).toBeLessThan(50)
  })

  it('detects cryptic content', () => {
    const result = measureRevealing('cryptic mysterious obscure enigmatic code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated content', () => {
    const result = measureRevealing('obfuscated encoded minified scrambled code')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('classifies dawn correctly', () => {
    const result = measureRevealing(richContent)
    expect(['aurora-dawn', 'clear-sunrise', 'proper-dawn']).toContain(result.dawn)
  })

  it('has self-documenting for documented content', () => {
    const result = measureRevealing(richContent)
    expect(result.hasSelfDocumenting).toBe(true)
  })
})

// ─── measureWarming ─────────────────────────────────────

describe('measureWarming', () => {
  it('scores rich content highly', () => {
    const result = measureWarming(richContent)
    expect(result.warmth).toBeGreaterThan(60)
    expect(result.hasHighWarmth).toBe(true)
  })

  it('detects hostile content', () => {
    const result = measureWarming('hostile aggressive violent harsh code')
    expect(result.hostileCount).toBeGreaterThan(0)
    expect(result.hasNoHostile).toBe(false)
  })

  it('detects unhandled content', () => {
    const result = measureWarming('eval("code") Function("x")')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('classifies fire for rich content', () => {
    const result = measureWarming(richContent)
    expect(['australian-fire', 'ethiopian-warmth', 'proper-glow']).toContain(result.fire)
  })

  it('has error handling for try/catch content', () => {
    const result = measureWarming(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })
})

// ─── measureSpanning ────────────────────────────────────

describe('measureSpanning', () => {
  it('scores rich content highly', () => {
    const result = measureSpanning(richContent)
    expect(result.richness).toBeGreaterThan(60)
    expect(result.hasHighRichness).toBe(true)
  })

  it('detects chaotic content', () => {
    const result = measureSpanning('chaotic messy disorganized tangled code')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects untested content', () => {
    const result = measureSpanning('eval("code") Function("x")')
    expect(result.untestedCount).toBeGreaterThan(0)
  })

  it('classifies spectrum for rich content', () => {
    const result = measureSpanning(richContent)
    expect(['full-rainbow', 'rich-palette', 'proper-range']).toContain(result.spectrum)
  })

  it('has all boolean fields', () => {
    const result = measureSpanning(richContent)
    expect(typeof result.hasWellStructured).toBe('boolean')
    expect(typeof result.hasComprehensive).toBe('boolean')
    expect(typeof result.hasThorough).toBe('boolean')
    expect(typeof result.hasComplete).toBe('boolean')
    expect(typeof result.hasDocumented).toBe('boolean')
    expect(typeof result.hasTyped).toBe('boolean')
    expect(typeof result.hasTested).toBe('boolean')
    expect(typeof result.hasExported).toBe('boolean')
    expect(typeof result.hasCovered).toBe('boolean')
    expect(typeof result.hasBroad).toBe('boolean')
    expect(typeof result.hasWide).toBe('boolean')
    expect(typeof result.hasExtensive).toBe('boolean')
    expect(typeof result.hasUniversal).toBe('boolean')
  })
})

// ─── measureGlowing ─────────────────────────────────────

describe('measureGlowing', () => {
  it('scores rich content highly', () => {
    const result = measureGlowing(richContent)
    expect(result.opalescence).toBeGreaterThan(60)
  })

  it('detects clunky content', () => {
    const result = measureGlowing('clunky ugly crude slapped code')
    expect(result.clunkyCount).toBeGreaterThan(0)
    expect(result.hasNoClunky).toBe(false)
  })

  it('detects rough content', () => {
    const result = measureGlowing('rough crude raw unfinished code')
    expect(result.roughCount).toBeGreaterThan(0)
  })

  it('classifies glow for rich content', () => {
    const result = measureGlowing(richContent)
    expect(['milky-radiance', 'pearl-glow', 'proper-luster']).toContain(result.glow)
  })

  it('has all boolean fields', () => {
    const result = measureGlowing(richContent)
    expect(typeof result.hasElegant).toBe('boolean')
    expect(typeof result.hasRefined).toBe('boolean')
    expect(typeof result.hasPolished).toBe('boolean')
    expect(typeof result.hasGraceful).toBe('boolean')
    expect(typeof result.hasSubtle).toBe('boolean')
    expect(typeof result.hasSophisticated).toBe('boolean')
    expect(typeof result.hasHarmonious).toBe('boolean')
    expect(typeof result.hasBalanced).toBe('boolean')
    expect(typeof result.hasAesthetic).toBe('boolean')
    expect(typeof result.hasCrafted).toBe('boolean')
    expect(typeof result.hasDeliberate).toBe('boolean')
    expect(typeof result.hasArtistic).toBe('boolean')
    expect(typeof result.hasBeautiful).toBe('boolean')
    expect(typeof result.hasLuminous).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyFragmentCondition', () => {
  it('returns opal-masterpiece for 90+', () => {
    expect(classifyFragmentCondition(90)).toBe('opal-masterpiece')
    expect(classifyFragmentCondition(100)).toBe('opal-masterpiece')
  })

  it('returns precious-fire for 75-89', () => {
    expect(classifyFragmentCondition(75)).toBe('precious-fire')
  })

  it('returns proper-gem for 60-74', () => {
    expect(classifyFragmentCondition(60)).toBe('proper-gem')
  })

  it('returns common-opal for 40-59', () => {
    expect(classifyFragmentCondition(40)).toBe('common-opal')
  })

  it('returns potch-stone for 20-39', () => {
    expect(classifyFragmentCondition(20)).toBe('potch-stone')
  })

  it('returns void below 20', () => {
    expect(classifyFragmentCondition(0)).toBe('void')
    expect(classifyFragmentCondition(19)).toBe('void')
  })
})

describe('classifyVeinType', () => {
  function makeFragment(score: number): OpalFragment {
    return {
      file: 'test.ts', playOfColor: score, dawnClarity: score, fireWarmth: score,
      spectrumRichness: score, opalescenceQuality: score, qualityScore: score,
      condition: classifyFragmentCondition(score),
      diffracting: {} as OpalFragment['diffracting'],
      revealing: {} as OpalFragment['revealing'],
      warming: {} as OpalFragment['warming'],
      spanning: {} as OpalFragment['spanning'],
      glowing: {} as OpalFragment['glowing'],
    }
  }

  it('returns no-vein for empty fragments', () => {
    expect(classifyVeinType([])).toBe('no-vein')
  })

  it('returns precious-seam for high scores', () => {
    expect(classifyVeinType([makeFragment(90)])).toBe('precious-seam')
  })

  it('returns barren-rock for low scores', () => {
    expect(classifyVeinType([makeFragment(10)])).toBe('barren-rock')
  })
})

describe('classifyVeinCondition', () => {
  it('returns opal-field for 85+', () => { expect(classifyVeinCondition(85)).toBe('opal-field') })
  it('returns rainbow-canyon for 70-84', () => { expect(classifyVeinCondition(70)).toBe('rainbow-canyon') })
  it('returns proper-mine for 55-69', () => { expect(classifyVeinCondition(55)).toBe('proper-mine') })
  it('returns gravel-pit for 35-54', () => { expect(classifyVeinCondition(35)).toBe('gravel-pit') })
  it('returns empty-hole for 15-34', () => { expect(classifyVeinCondition(15)).toBe('empty-hole') })
  it('returns void below 15', () => { expect(classifyVeinCondition(0)).toBe('void') })
})

describe('classifyLapidaryGrade', () => {
  it('returns master-lapidary for 80+', () => { expect(classifyLapidaryGrade(80)).toBe('master-lapidary') })
  it('returns opal-cutter for 65-79', () => { expect(classifyLapidaryGrade(65)).toBe('opal-cutter') })
  it('returns proper-gemologist for 50-64', () => { expect(classifyLapidaryGrade(50)).toBe('proper-gemologist') })
  it('returns apprentice for 35-49', () => { expect(classifyLapidaryGrade(35)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyLapidaryGrade(20)).toBe('novice') })
  it('returns rock-polisher below 20', () => { expect(classifyLapidaryGrade(0)).toBe('rock-polisher') })
})

// ─── analyzeOpalFragment ────────────────────────────────

describe('analyzeOpalFragment', () => {
  it('returns a complete OpalFragment', () => {
    const fragment = analyzeOpalFragment(richContent, 'test.ts')
    expect(fragment.file).toBe('test.ts')
    expect(typeof fragment.playOfColor).toBe('number')
    expect(typeof fragment.dawnClarity).toBe('number')
    expect(typeof fragment.fireWarmth).toBe('number')
    expect(typeof fragment.spectrumRichness).toBe('number')
    expect(typeof fragment.opalescenceQuality).toBe('number')
    expect(typeof fragment.qualityScore).toBe('number')
    expect(fragment.diffracting).toBeDefined()
    expect(fragment.revealing).toBeDefined()
    expect(fragment.warming).toBeDefined()
    expect(fragment.spanning).toBeDefined()
    expect(fragment.glowing).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const fragment = analyzeOpalFragment(richContent, 'test.ts')
    const expected = Math.round(
      fragment.playOfColor * 0.2 +
      fragment.dawnClarity * 0.2 +
      fragment.fireWarmth * 0.2 +
      fragment.spectrumRichness * 0.2 +
      fragment.opalescenceQuality * 0.2,
    )
    expect(fragment.qualityScore).toBe(expected)
  })

  it('scores rich content highly', () => {
    const fragment = analyzeOpalFragment(richContent, 'test.ts')
    expect(fragment.qualityScore).toBeGreaterThan(60)
  })

  it('scores empty content low', () => {
    const fragment = analyzeOpalFragment(emptyContent, 'empty.ts')
    expect(fragment.qualityScore).toBeLessThan(50)
  })
})

// ─── analyzeOpalVein ────────────────────────────────────

describe('analyzeOpalVein', () => {
  it('returns empty vein for no fragments', () => {
    const vein = analyzeOpalVein([], 'src')
    expect(vein.directory).toBe('src')
    expect(vein.fragments).toHaveLength(0)
    expect(vein.veinType).toBe('no-vein')
    expect(vein.condition).toBe('void')
  })

  it('computes averages from fragments', () => {
    const fragment = analyzeOpalFragment(richContent, 'test.ts')
    const vein = analyzeOpalVein([fragment], 'src')
    expect(vein.avgColor).toBe(fragment.playOfColor)
    expect(vein.opalMasterpieceCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildOpalHorizonResult ─────────────────────────────

describe('buildOpalHorizonResult', () => {
  it('returns complete result for empty input', async () => {
    const result = await buildOpalHorizonResult([], [])
    expect(result.fragments).toHaveLength(0)
    expect(result.veins).toHaveLength(0)
    expect(result.spectrum.overallBrilliance).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('returns complete result for single file', async () => {
    const result = await buildOpalHorizonResult(['test.ts'], [richContent])
    expect(result.fragments).toHaveLength(1)
    expect(result.fragments[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.overallBrilliance).toBeGreaterThan(0)
    expect(result.stats.lapidaryGrade).toBeDefined()
  })

  it('returns complete result for multiple files in different dirs', async () => {
    const result = await buildOpalHorizonResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.fragments).toHaveLength(3)
    expect(result.veins).toHaveLength(2)
    expect(result.stats.totalVeins).toBe(2)
  })

  it('computes stats correctly', async () => {
    const result = await buildOpalHorizonResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.bestFragment).toBe('string')
    expect(typeof result.stats.mostColorful).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.warmest).toBe('string')
    expect(typeof result.stats.richest).toBe('string')
    expect(typeof result.stats.mostLuminous).toBe('string')
  })

  it('computes spectrum overview', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(typeof result.spectrum.avgColor).toBe('number')
    expect(typeof result.spectrum.avgRichness).toBe('number')
    expect(typeof result.spectrum.avgOpalescence).toBe('number')
    expect(typeof result.spectrum.isOpal).toBe('boolean')
    expect(typeof result.spectrum.overallBrilliance).toBe('number')
  })

  it('generates recommendations', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(typeof result.recommendations[0]).toBe('string')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  function makeStats(overrides: Partial<OpalHorizonResult['stats']> = {}): OpalHorizonResult['stats'] {
    return {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 50, avgDawnClarity: 50, avgFireWarmth: 50,
      avgSpectrumRichness: 50, avgOpalescenceQuality: 50,
      opalMasterpieceCount: 0, preciousFireCount: 0, properGemCount: 1,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 0,
      hasHighColorCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallSovereignty: 50,
      overallBrilliance: 50,
      lapidaryGrade: 'proper-gemologist',
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
      ...overrides,
    }
  }

  it('returns masterpiece message when all scores >= 90', () => {
    const stats = makeStats({
      avgPlayOfColor: 92, avgDawnClarity: 91, avgFireWarmth: 90,
      avgSpectrumRichness: 93, avgOpalescenceQuality: 90,
    })
    const recs = generateRecommendations([], [], { avgColor: 92, avgRichness: 93, avgOpalescence: 90, isOpal: true, overallBrilliance: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('kaleidoscopic brilliance')
  })

  it('recommends play of color improvement when low', () => {
    const stats = makeStats({ avgPlayOfColor: 40 })
    const recs = generateRecommendations([], [], { avgColor: 40, avgRichness: 50, avgOpalescence: 50, isOpal: false, overallBrilliance: 40 }, stats)
    expect(recs.some((r) => r.includes('play of color'))).toBe(true)
  })

  it('recommends clarity improvement when low', () => {
    const stats = makeStats({ avgDawnClarity: 40 })
    const recs = generateRecommendations([], [], { avgColor: 50, avgRichness: 50, avgOpalescence: 50, isOpal: false, overallBrilliance: 40 }, stats)
    expect(recs.some((r) => r.includes('dawn clarity'))).toBe(true)
  })

  it('recommends warmth improvement when low', () => {
    const stats = makeStats({ avgFireWarmth: 40 })
    const recs = generateRecommendations([], [], { avgColor: 50, avgRichness: 50, avgOpalescence: 50, isOpal: false, overallBrilliance: 40 }, stats)
    expect(recs.some((r) => r.includes('Warm the fire'))).toBe(true)
  })

  it('recommends richness improvement when low', () => {
    const stats = makeStats({ avgSpectrumRichness: 40 })
    const recs = generateRecommendations([], [], { avgColor: 50, avgRichness: 40, avgOpalescence: 50, isOpal: false, overallBrilliance: 40 }, stats)
    expect(recs.some((r) => r.includes('spectrum'))).toBe(true)
  })

  it('recommends opalescence improvement when low', () => {
    const stats = makeStats({ avgOpalescenceQuality: 40 })
    const recs = generateRecommendations([], [], { avgColor: 50, avgRichness: 50, avgOpalescence: 40, isOpal: false, overallBrilliance: 40 }, stats)
    expect(recs.some((r) => r.includes('opalescence'))).toBe(true)
  })

  it('warns about overall low brilliance', () => {
    const stats = makeStats({ overallBrilliance: 30 })
    const recs = generateRecommendations([], [], { avgColor: 30, avgRichness: 30, avgOpalescence: 30, isOpal: false, overallBrilliance: 30 }, stats)
    expect(recs.some((r) => r.includes('faded to potch'))).toBe(true)
  })

  it('lists void fragments', () => {
    const fragment: OpalFragment = {
      file: 'bad.ts', playOfColor: 0, dawnClarity: 0, fireWarmth: 0,
      spectrumRichness: 0, opalescenceQuality: 0, qualityScore: 0,
      condition: 'void',
      diffracting: {} as OpalFragment['diffracting'],
      revealing: {} as OpalFragment['revealing'],
      warming: {} as OpalFragment['warming'],
      spanning: {} as OpalFragment['spanning'],
      glowing: {} as OpalFragment['glowing'],
    }
    const recs = generateRecommendations([fragment], [], { avgColor: 0, avgRichness: 0, avgOpalescence: 0, isOpal: false, overallBrilliance: 0 }, makeStats({ overallBrilliance: 0 }))
    expect(recs.some((r) => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about many void fragments', () => {
    const fragments: OpalFragment[] = Array.from({ length: 6 }, (_, i) => ({
      file: `bad${i}.ts`, playOfColor: 0, dawnClarity: 0, fireWarmth: 0,
      spectrumRichness: 0, opalescenceQuality: 0, qualityScore: 0,
      condition: 'void' as const,
      diffracting: {} as OpalFragment['diffracting'],
      revealing: {} as OpalFragment['revealing'],
      warming: {} as OpalFragment['warming'],
      spanning: {} as OpalFragment['spanning'],
      glowing: {} as OpalFragment['glowing'],
    }))
    const recs = generateRecommendations(fragments, [], { avgColor: 0, avgRichness: 0, avgOpalescence: 0, isOpal: false, overallBrilliance: 0 }, makeStats({ overallBrilliance: 0 }))
    expect(recs.some((r) => r.includes('6 potch stones'))).toBe(true)
  })

  it('warns when all veins are poor', () => {
    const vein: OpalVein = {
      directory: 'src', fragments: [], avgColor: 0, avgRichness: 0, avgOpalescence: 0,
      opalMasterpieceCount: 0, voidCount: 0, veinType: 'barren-rock', condition: 'void',
    }
    const recs = generateRecommendations([], [vein], { avgColor: 0, avgRichness: 0, avgOpalescence: 0, isOpal: false, overallBrilliance: 0 }, makeStats({ overallBrilliance: 0 }))
    expect(recs.some((r) => r.includes('empty holes'))).toBe(true)
  })

  it('gives positive feedback when no issues', () => {
    const stats = makeStats({
      avgPlayOfColor: 70, avgDawnClarity: 70, avgFireWarmth: 70,
      avgSpectrumRichness: 70, avgOpalescenceQuality: 70,
      overallBrilliance: 70,
    })
    const recs = generateRecommendations([], [], { avgColor: 70, avgRichness: 70, avgOpalescence: 70, isOpal: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('spectral brilliance'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(45)).toBe('string')
    expect(typeof colorScore(65)).toBe('string')
    expect(typeof colorScore(80)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorVeinCondition', () => {
  it('returns a string for all conditions', () => {
    expect(typeof colorVeinCondition('opal-field')).toBe('string')
    expect(typeof colorVeinCondition('rainbow-canyon')).toBe('string')
    expect(typeof colorVeinCondition('proper-mine')).toBe('string')
    expect(typeof colorVeinCondition('gravel-pit')).toBe('string')
    expect(typeof colorVeinCondition('empty-hole')).toBe('string')
    expect(typeof colorVeinCondition('void')).toBe('string')
    expect(typeof colorVeinCondition('unknown')).toBe('string')
  })
})

describe('formatFragmentTable', () => {
  it('formats a fragment', () => {
    const fragment = analyzeOpalFragment(richContent, 'test.ts')
    const result = formatFragmentTable(fragment)
    expect(result).toContain('Opal Fragment')
    expect(result).toContain('test.ts')
  })
})

describe('formatFragmentsTable', () => {
  it('handles empty fragments', () => {
    expect(formatFragmentsTable([])).toContain('No opal fragments')
  })

  it('formats multiple fragments', () => {
    const f1 = analyzeOpalFragment(richContent, 'a.ts')
    const f2 = analyzeOpalFragment(richContent, 'b.ts')
    const result = formatFragmentsTable([f1, f2])
    expect(result).toContain('Opal Fragments')
  })
})

describe('formatVeinTable', () => {
  it('formats a vein', () => {
    const fragment = analyzeOpalFragment(richContent, 'test.ts')
    const vein = analyzeOpalVein([fragment], 'src')
    const result = formatVeinTable(vein)
    expect(result).toContain('Opal Vein')
    expect(result).toContain('src')
  })
})

describe('formatVeinsTable', () => {
  it('handles empty veins', () => {
    expect(formatVeinsTable([])).toContain('No opal veins')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Opal Horizon Statistics')
    expect(formatted).toContain('Total Files')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Fix X')
    expect(result).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Opal Horizon Analysis')
    expect(formatted).toContain('Spectrum Overview')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.fragments).toHaveLength(1)
  })
})

// ─── Integration: rich content ──────────────────────────

describe('rich content integration', () => {
  it('all measures score rich content highly', async () => {
    const result = await buildOpalHorizonResult(['test.ts'], [richContent])
    expect(result.fragments[0].playOfColor).toBeGreaterThan(60)
    expect(result.fragments[0].dawnClarity).toBeGreaterThan(60)
    expect(result.fragments[0].fireWarmth).toBeGreaterThan(60)
    expect(result.fragments[0].spectrumRichness).toBeGreaterThan(60)
    expect(result.fragments[0].opalescenceQuality).toBeGreaterThan(60)
    expect(result.stats.overallBrilliance).toBeGreaterThan(60)
  })

  it('diffracting booleans match richContent', () => {
    const result = measureDiffracting(richContent)
    expect(result.hasVersatile).toBe(true)
    expect(result.hasMultiFaceted).toBe(true)
    expect(result.hasAdaptable).toBe(true)
    expect(result.hasFlexible).toBe(true)
    expect(result.hasModular).toBe(true)
    expect(result.hasDynamic).toBe(true)
    expect(result.hasMultiDimensional).toBe(true)
  })

  it('revealing booleans match richContent', () => {
    const result = measureRevealing(richContent)
    expect(result.hasReadable).toBe(true)
    expect(result.hasSelfDocumenting).toBe(true)
    expect(result.hasClear).toBe(true)
    expect(result.hasTransparent).toBe(true)
    expect(result.hasUnderstandable).toBe(true)
    expect(result.hasVisible).toBe(true)
    expect(result.hasIlluminated).toBe(true)
  })

  it('warming booleans match richContent', () => {
    const result = measureWarming(richContent)
    expect(result.hasApproachable).toBe(true)
    expect(result.hasWelcoming).toBe(true)
    expect(result.hasErrorHandled).toBe(true)
    expect(result.hasHuman).toBe(true)
  })

  it('spanning booleans match richContent', () => {
    const result = measureSpanning(richContent)
    expect(result.hasWellStructured).toBe(true)
    expect(result.hasDocumented).toBe(true)
    expect(result.hasTyped).toBe(true)
    expect(result.hasTested).toBe(true)
    expect(result.hasExported).toBe(true)
  })

  it('glowing booleans match richContent', () => {
    const result = measureGlowing(richContent)
    expect(result.hasElegant).toBe(true)
    expect(result.hasPolished).toBe(true)
    expect(result.hasGraceful).toBe(true)
    expect(result.hasSophisticated).toBe(true)
    expect(result.hasCrafted).toBe(true)
    expect(result.hasLuminous).toBe(true)
  })
})
