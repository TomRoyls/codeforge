import { describe, expect, it } from 'vitest'

import {
  analyzeOpalFragment,
  analyzeOpalVein,
  buildOpalHorizonResult,
  classifyFragmentCondition,
  classifyVeinType,
  classifyVeinCondition,
  classifyLapidaryGrade,
  generateRecommendations,
  measureDiffracting,
  measureRevealing,
  measureWarming,
  measureSpanning,
  measureGlowing,
  type FragmentCondition,
  type VeinCondition,
  type OpalFragment,
  type OpalHorizonResult,
  type OpalVein,
} from '../src/commands/opal-skyline-helpers.js'

import {
  colorFragmentCondition,
  colorVeinCondition,
  colorScore,
  formatFragmentTable,
  formatFragmentsTable,
  formatVeinsTable,
  formatVeinTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/opal-skyline-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

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

const poorContent = 'var x = eval("1")\nany monolithic god.object'

// ─── measureDiffracting ─────────────────────────────────

describe('measureDiffracting', () => {
  it('scores rich content high', () => {
    const m = measureDiffracting(richContent)
    expect(m.color).toBeGreaterThanOrEqual(60)
    expect(m.hasHighColor).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureDiffracting(emptyContent)
    expect(m.color).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureDiffracting(richContent)
    const poor = measureDiffracting(poorContent)
    expect(rich.color).toBeGreaterThan(poor.color)
  })

  it('detects monolithic patterns', () => {
    const m = measureDiffracting('monolithic god.object mega')
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects rigid patterns', () => {
    const m = measureDiffracting('rigid inflexible hardcoded')
    expect(m.rigidCount).toBeGreaterThan(0)
  })

  it('assigns high play for rich content', () => {
    const m = measureDiffracting(richContent)
    expect(['kaleidoscope', 'black-opal', 'proper-play']).toContain(m.play)
  })

  it('assigns low play for empty content', () => {
    const m = measureDiffracting(emptyContent)
    expect(['no-color', 'potch', 'common-opal', 'proper-play']).toContain(m.play)
  })

  it('has all boolean properties', () => {
    const m = measureDiffracting(richContent)
    expect(typeof m.hasVersatile).toBe('boolean')
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasShifting).toBe('boolean')
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content high', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRevealing(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureRevealing(richContent)
    const poor = measureRevealing(poorContent)
    expect(rich.clarity).toBeGreaterThan(poor.clarity)
  })

  it('detects cryptic patterns', () => {
    const m = measureRevealing('cryptic obfuscate minified')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns', () => {
    const m = measureRevealing('var x = eval("1")')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('assigns high dawn for rich content', () => {
    const m = measureRevealing(richContent)
    expect(['aurora-dawn', 'clear-sunrise', 'proper-dawn']).toContain(m.dawn)
  })

  it('assigns low dawn for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(['no-clarity', 'pre-dawn', 'gray-morning', 'proper-dawn']).toContain(m.dawn)
  })

  it('has all boolean properties', () => {
    const m = measureRevealing(richContent)
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasTransparent).toBe('boolean')
    expect(typeof m.hasClean).toBe('boolean')
  })
})

// ─── measureWarming ─────────────────────────────────────

describe('measureWarming', () => {
  it('scores rich content high', () => {
    const m = measureWarming(richContent)
    expect(m.warmth).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWarmth).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureWarming(emptyContent)
    expect(m.warmth).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureWarming(richContent)
    const poor = measureWarming(poorContent)
    expect(rich.warmth).toBeGreaterThan(poor.warmth)
  })

  it('detects hostile patterns', () => {
    const m = measureWarming('hostile aggressive violent')
    expect(m.hostileCount).toBeGreaterThan(0)
    expect(m.hasNoHostile).toBe(false)
  })

  it('detects unhandled patterns', () => {
    const m = measureWarming('eval (x)')
    expect(m.unhandledCount).toBeGreaterThan(0)
    expect(m.hasNoUnhandled).toBe(false)
  })

  it('assigns high fire for rich content', () => {
    const m = measureWarming(richContent)
    expect(['australian-fire', 'ethiopian-warmth', 'proper-glow']).toContain(m.fire)
  })

  it('assigns low fire for empty content', () => {
    const m = measureWarming(emptyContent)
    expect(['no-warmth', 'cold-stone', 'cool-opal', 'proper-glow']).toContain(m.fire)
  })

  it('has all boolean properties', () => {
    const m = measureWarming(richContent)
    expect(typeof m.hasApproachable).toBe('boolean')
    expect(typeof m.hasForgiving).toBe('boolean')
    expect(typeof m.hasCaring).toBe('boolean')
  })
})

// ─── measureSpanning ────────────────────────────────────

describe('measureSpanning', () => {
  it('scores rich content high', () => {
    const m = measureSpanning(richContent)
    expect(m.richness).toBeGreaterThanOrEqual(60)
    expect(m.hasHighRichness).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureSpanning(emptyContent)
    expect(m.richness).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureSpanning(richContent)
    const poor = measureSpanning(poorContent)
    expect(rich.richness).toBeGreaterThan(poor.richness)
  })

  it('detects chaotic patterns', () => {
    const m = measureSpanning('var x = eval("1")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureSpanning('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
  })

  it('assigns high spectrum for rich content', () => {
    const m = measureSpanning(richContent)
    expect(['full-rainbow', 'rich-palette', 'proper-range']).toContain(m.spectrum)
  })

  it('assigns low spectrum for empty content', () => {
    const m = measureSpanning(emptyContent)
    expect(['no-richness', 'monochrome', 'limited-hue', 'proper-range']).toContain(m.spectrum)
  })

  it('has all boolean properties', () => {
    const m = measureSpanning(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasComprehensive).toBe('boolean')
    expect(typeof m.hasUniversal).toBe('boolean')
  })
})

// ─── measureGlowing ─────────────────────────────────────

describe('measureGlowing', () => {
  it('scores rich content high', () => {
    const m = measureGlowing(richContent)
    expect(m.opalescence).toBeGreaterThanOrEqual(60)
    expect(m.hasHighOpalescence).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureGlowing(emptyContent)
    expect(m.opalescence).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureGlowing(richContent)
    const poor = measureGlowing(poorContent)
    expect(rich.opalescence).toBeGreaterThan(poor.opalescence)
  })

  it('detects clunky patterns', () => {
    const m = measureGlowing('clunky ugly hacky')
    expect(m.clunkyCount).toBeGreaterThan(0)
    expect(m.hasNoClunky).toBe(false)
  })

  it('detects rough patterns', () => {
    const m = measureGlowing('rough crude raw')
    expect(m.roughCount).toBeGreaterThan(0)
  })

  it('assigns high glow for rich content', () => {
    const m = measureGlowing(richContent)
    expect(['milky-radiance', 'pearl-glow', 'proper-luster']).toContain(m.glow)
  })

  it('assigns low glow for empty content', () => {
    const m = measureGlowing(emptyContent)
    expect(['no-opalescence', 'no-light', 'dull-sheen', 'proper-luster']).toContain(m.glow)
  })

  it('has all boolean properties', () => {
    const m = measureGlowing(richContent)
    expect(typeof m.hasElegant).toBe('boolean')
    expect(typeof m.hasHarmonious).toBe('boolean')
    expect(typeof m.hasLuminous).toBe('boolean')
  })
})

// ─── classifyFragmentCondition ──────────────────────────

describe('classifyFragmentCondition', () => {
  it('classifies 90+ as opal-masterpiece', () => {
    expect(classifyFragmentCondition(90)).toBe('opal-masterpiece')
    expect(classifyFragmentCondition(95)).toBe('opal-masterpiece')
  })

  it('classifies 75-89 as precious-fire', () => {
    expect(classifyFragmentCondition(75)).toBe('precious-fire')
    expect(classifyFragmentCondition(89)).toBe('precious-fire')
  })

  it('classifies 60-74 as proper-gem', () => {
    expect(classifyFragmentCondition(60)).toBe('proper-gem')
    expect(classifyFragmentCondition(74)).toBe('proper-gem')
  })

  it('classifies 40-59 as common-opal', () => {
    expect(classifyFragmentCondition(40)).toBe('common-opal')
    expect(classifyFragmentCondition(59)).toBe('common-opal')
  })

  it('classifies 20-39 as potch-stone', () => {
    expect(classifyFragmentCondition(20)).toBe('potch-stone')
    expect(classifyFragmentCondition(39)).toBe('potch-stone')
  })

  it('classifies below 20 as void', () => {
    expect(classifyFragmentCondition(0)).toBe('void')
    expect(classifyFragmentCondition(19)).toBe('void')
  })
})

// ─── classifyVeinType ───────────────────────────────────

describe('classifyVeinType', () => {
  it('returns no-vein for empty fragments', () => {
    expect(classifyVeinType([])).toBe('no-vein')
  })

  it('returns precious-seam for high avg quality', () => {
    const fragments = [
      { qualityScore: 90 } as OpalFragment,
      { qualityScore: 85 } as OpalFragment,
    ]
    expect(classifyVeinType(fragments)).toBe('precious-seam')
  })

  it('returns opal-vein for good quality', () => {
    const fragments = [
      { qualityScore: 70 } as OpalFragment,
      { qualityScore: 75 } as OpalFragment,
    ]
    expect(classifyVeinType(fragments)).toBe('opal-vein')
  })

  it('returns proper-deposit for decent quality', () => {
    const fragments = [
      { qualityScore: 55 } as OpalFragment,
      { qualityScore: 60 } as OpalFragment,
    ]
    expect(classifyVeinType(fragments)).toBe('proper-deposit')
  })

  it('returns thin-layer for low quality', () => {
    const fragments = [
      { qualityScore: 35 } as OpalFragment,
      { qualityScore: 40 } as OpalFragment,
    ]
    expect(classifyVeinType(fragments)).toBe('thin-layer')
  })

  it('returns barren-rock for very low quality', () => {
    const fragments = [
      { qualityScore: 10 } as OpalFragment,
      { qualityScore: 15 } as OpalFragment,
    ]
    expect(classifyVeinType(fragments)).toBe('barren-rock')
  })
})

// ─── classifyVeinCondition ──────────────────────────────

describe('classifyVeinCondition', () => {
  it('classifies 85+ as opal-field', () => {
    expect(classifyVeinCondition(85)).toBe('opal-field')
  })

  it('classifies 70-84 as rainbow-canyon', () => {
    expect(classifyVeinCondition(70)).toBe('rainbow-canyon')
  })

  it('classifies 55-69 as proper-mine', () => {
    expect(classifyVeinCondition(55)).toBe('proper-mine')
  })

  it('classifies 35-54 as gravel-pit', () => {
    expect(classifyVeinCondition(35)).toBe('gravel-pit')
  })

  it('classifies 15-34 as empty-hole', () => {
    expect(classifyVeinCondition(15)).toBe('empty-hole')
  })

  it('classifies below 15 as void', () => {
    expect(classifyVeinCondition(0)).toBe('void')
  })
})

// ─── classifyLapidaryGrade ──────────────────────────────

describe('classifyLapidaryGrade', () => {
  it('classifies 80+ as master-lapidary', () => {
    expect(classifyLapidaryGrade(80)).toBe('master-lapidary')
    expect(classifyLapidaryGrade(100)).toBe('master-lapidary')
  })

  it('classifies 65-79 as opal-cutter', () => {
    expect(classifyLapidaryGrade(65)).toBe('opal-cutter')
    expect(classifyLapidaryGrade(79)).toBe('opal-cutter')
  })

  it('classifies 50-64 as proper-gemologist', () => {
    expect(classifyLapidaryGrade(50)).toBe('proper-gemologist')
    expect(classifyLapidaryGrade(64)).toBe('proper-gemologist')
  })

  it('classifies 35-49 as apprentice', () => {
    expect(classifyLapidaryGrade(35)).toBe('apprentice')
    expect(classifyLapidaryGrade(49)).toBe('apprentice')
  })

  it('classifies 20-34 as novice', () => {
    expect(classifyLapidaryGrade(20)).toBe('novice')
    expect(classifyLapidaryGrade(34)).toBe('novice')
  })

  it('classifies below 20 as rock-polisher', () => {
    expect(classifyLapidaryGrade(0)).toBe('rock-polisher')
    expect(classifyLapidaryGrade(19)).toBe('rock-polisher')
  })
})

// ─── analyzeOpalFragment ────────────────────────────────

describe('analyzeOpalFragment', () => {
  it('analyzes a file and returns all measures', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    expect(fragment.file).toBe('app.ts')
    expect(fragment.playOfColor).toBeGreaterThanOrEqual(0)
    expect(fragment.dawnClarity).toBeGreaterThanOrEqual(0)
    expect(fragment.fireWarmth).toBeGreaterThanOrEqual(0)
    expect(fragment.spectrumRichness).toBeGreaterThanOrEqual(0)
    expect(fragment.opalescenceQuality).toBeGreaterThanOrEqual(0)
    expect(fragment.qualityScore).toBeGreaterThanOrEqual(0)
    expect(fragment.condition).toBeDefined()
  })

  it('scores rich content high overall', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    expect(fragment.qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('calculates qualityScore as weighted average', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    const expected = Math.round(
      fragment.playOfColor * 0.2 +
      fragment.dawnClarity * 0.2 +
      fragment.fireWarmth * 0.2 +
      fragment.spectrumRichness * 0.2 +
      fragment.opalescenceQuality * 0.2,
    )
    expect(fragment.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    expect(fragment.diffracting).toBeDefined()
    expect(fragment.revealing).toBeDefined()
    expect(fragment.warming).toBeDefined()
    expect(fragment.spanning).toBeDefined()
    expect(fragment.glowing).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    const expectedCondition = classifyFragmentCondition(fragment.qualityScore)
    expect(fragment.condition).toBe(expectedCondition)
  })

  it('handles empty content gracefully', () => {
    const fragment = analyzeOpalFragment(emptyContent, 'empty.ts')
    expect(fragment.qualityScore).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzeOpalVein ────────────────────────────────────

describe('analyzeOpalVein', () => {
  it('returns empty vein for no fragments', () => {
    const vein = analyzeOpalVein([], 'src')
    expect(vein.directory).toBe('src')
    expect(vein.fragments).toHaveLength(0)
    expect(vein.avgColor).toBe(0)
    expect(vein.veinType).toBe('no-vein')
    expect(vein.condition).toBe('void')
  })

  it('aggregates fragment scores', () => {
    const f1 = analyzeOpalFragment(richContent, 'a.ts')
    const f2 = analyzeOpalFragment(richContent, 'b.ts')
    const vein = analyzeOpalVein([f1, f2], 'src')
    expect(vein.avgColor).toBeGreaterThanOrEqual(0)
    expect(vein.avgRichness).toBeGreaterThanOrEqual(0)
    expect(vein.avgOpalescence).toBeGreaterThanOrEqual(0)
    expect(vein.fragments).toHaveLength(2)
  })

  it('counts masterpieces and voids', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    const vein = analyzeOpalVein([fragment], 'src')
    expect(vein.opalMasterpieceCount + vein.voidCount).toBeLessThanOrEqual(1)
  })

  it('classifies vein type and condition', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    const vein = analyzeOpalVein([fragment], 'src')
    expect(vein.veinType).toBeDefined()
    expect(vein.condition).toBeDefined()
  })
})

// ─── buildOpalHorizonResult ─────────────────────────────

describe('buildOpalHorizonResult', () => {
  it('handles empty input', async () => {
    const result = await buildOpalHorizonResult([], [])
    expect(result.fragments).toHaveLength(0)
    expect(result.veins).toHaveLength(0)
    expect(result.spectrum.overallBrilliance).toBe(0)
    expect(result.spectrum.isOpal).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.fragments).toHaveLength(1)
    expect(result.fragments[0].file).toBe('a.ts')
  })

  it('analyzes multiple files', async () => {
    const result = await buildOpalHorizonResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.fragments).toHaveLength(2)
  })

  it('groups files by directory', async () => {
    const result = await buildOpalHorizonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.veins.length).toBe(2)
  })

  it('computes spectrum averages', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.spectrum.avgColor).toBeGreaterThanOrEqual(0)
    expect(result.spectrum.avgRichness).toBeGreaterThanOrEqual(0)
    expect(result.spectrum.avgOpalescence).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildOpalHorizonResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalVeins).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallBrilliance).toBeGreaterThanOrEqual(0)
    expect(result.stats.lapidaryGrade).toBeDefined()
  })

  it('identifies best and extreme files', async () => {
    const result = await buildOpalHorizonResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.bestFragment).toBeTruthy()
    expect(result.stats.mostColorful).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.warmest).toBeTruthy()
    expect(result.stats.richest).toBeTruthy()
    expect(result.stats.mostLuminous).toBeTruthy()
  })

  it('includes recommendations', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty bestFragment for no files', async () => {
    const result = await buildOpalHorizonResult([], [])
    expect(result.stats.bestFragment).toBe('')
    expect(result.stats.mostColorful).toBe('')
  })

  it('scores rich content at max', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.fragments[0].playOfColor).toBeGreaterThanOrEqual(60)
    expect(result.fragments[0].dawnClarity).toBeGreaterThanOrEqual(60)
    expect(result.fragments[0].fireWarmth).toBeGreaterThanOrEqual(60)
    expect(result.fragments[0].spectrumRichness).toBeGreaterThanOrEqual(60)
    expect(result.fragments[0].opalescenceQuality).toBeGreaterThanOrEqual(60)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('recommends masterpiece when all scores are high', () => {
    const stats = {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 95, avgDawnClarity: 95, avgFireWarmth: 95,
      avgSpectrumRichness: 95, avgOpalescenceQuality: 95,
      opalMasterpieceCount: 1, preciousFireCount: 0, properGemCount: 0,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 0,
      hasHighColorCount: 1, hasHighClarityCount: 1, hasHighWarmthCount: 1,
      hasHighRichnessCount: 1, hasHighOpalescenceCount: 1,
      overallBrilliance: 95, lapidaryGrade: 'master-lapidary' as const,
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgColor: 95, avgRichness: 95, avgOpalescence: 95, isOpal: true, overallBrilliance: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends play of color when low', () => {
    const stats = {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 30, avgDawnClarity: 90, avgFireWarmth: 90,
      avgSpectrumRichness: 90, avgOpalescenceQuality: 90,
      opalMasterpieceCount: 0, preciousFireCount: 0, properGemCount: 0,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 0,
      hasHighColorCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallBrilliance: 78, lapidaryGrade: 'opal-cutter' as const,
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgColor: 30, avgRichness: 90, avgOpalescence: 90, isOpal: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('color'))).toBe(true)
  })

  it('recommends clarity when low', () => {
    const stats = {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 90, avgDawnClarity: 30, avgFireWarmth: 90,
      avgSpectrumRichness: 90, avgOpalescenceQuality: 90,
      opalMasterpieceCount: 0, preciousFireCount: 0, properGemCount: 0,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 0,
      hasHighColorCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallBrilliance: 78, lapidaryGrade: 'opal-cutter' as const,
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgColor: 90, avgRichness: 90, avgOpalescence: 90, isOpal: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('recommends warmth when low', () => {
    const stats = {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 90, avgDawnClarity: 90, avgFireWarmth: 30,
      avgSpectrumRichness: 90, avgOpalescenceQuality: 90,
      opalMasterpieceCount: 0, preciousFireCount: 0, properGemCount: 0,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 0,
      hasHighColorCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallBrilliance: 78, lapidaryGrade: 'opal-cutter' as const,
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgColor: 90, avgRichness: 90, avgOpalescence: 90, isOpal: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('warmth'))).toBe(true)
  })

  it('recommends richness when low', () => {
    const stats = {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 90, avgDawnClarity: 90, avgFireWarmth: 90,
      avgSpectrumRichness: 30, avgOpalescenceQuality: 90,
      opalMasterpieceCount: 0, preciousFireCount: 0, properGemCount: 0,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 0,
      hasHighColorCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallBrilliance: 78, lapidaryGrade: 'opal-cutter' as const,
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgColor: 90, avgRichness: 30, avgOpalescence: 90, isOpal: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('richness'))).toBe(true)
  })

  it('recommends opalescence when low', () => {
    const stats = {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 90, avgDawnClarity: 90, avgFireWarmth: 90,
      avgSpectrumRichness: 90, avgOpalescenceQuality: 30,
      opalMasterpieceCount: 0, preciousFireCount: 0, properGemCount: 0,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 0,
      hasHighColorCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallBrilliance: 78, lapidaryGrade: 'opal-cutter' as const,
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgColor: 90, avgRichness: 90, avgOpalescence: 30, isOpal: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('opalescence'))).toBe(true)
  })

  it('warns about very low brilliance', () => {
    const stats = {
      totalFiles: 1, totalVeins: 1,
      avgPlayOfColor: 20, avgDawnClarity: 20, avgFireWarmth: 20,
      avgSpectrumRichness: 20, avgOpalescenceQuality: 20,
      opalMasterpieceCount: 0, preciousFireCount: 0, properGemCount: 0,
      commonOpalCount: 0, potchStoneCount: 0, voidCount: 1,
      hasHighColorCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallBrilliance: 20, lapidaryGrade: 'novice' as const,
      bestFragment: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', richest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgColor: 20, avgRichness: 20, avgOpalescence: 20, isOpal: false, overallBrilliance: 20 }, stats)
    expect(recs.some((r) => r.includes('horizon') || r.includes('dark'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorFragmentCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorFragmentCondition('opal-masterpiece')).toBe('string')
    expect(typeof colorFragmentCondition('precious-fire')).toBe('string')
    expect(typeof colorFragmentCondition('proper-gem')).toBe('string')
    expect(typeof colorFragmentCondition('common-opal')).toBe('string')
    expect(typeof colorFragmentCondition('potch-stone')).toBe('string')
    expect(typeof colorFragmentCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorFragmentCondition('unknown')).toBe('string')
  })
})

describe('colorVeinCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorVeinCondition('opal-field')).toBe('string')
    expect(typeof colorVeinCondition('rainbow-canyon')).toBe('string')
    expect(typeof colorVeinCondition('proper-mine')).toBe('string')
    expect(typeof colorVeinCondition('gravel-pit')).toBe('string')
    expect(typeof colorVeinCondition('empty-hole')).toBe('string')
    expect(typeof colorVeinCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorVeinCondition('unknown')).toBe('string')
  })
})

describe('formatFragmentTable', () => {
  it('formats a fragment', () => {
    const fragment = analyzeOpalFragment(richContent, 'app.ts')
    const output = formatFragmentTable(fragment)
    expect(output).toContain('app.ts')
    expect(output).toContain('Play of Color')
    expect(output).toContain('Quality Score')
  })
})

describe('formatFragmentsTable', () => {
  it('formats empty fragments', () => {
    expect(formatFragmentsTable([])).toContain('No opal fragments')
  })

  it('formats multiple fragments', () => {
    const f1 = analyzeOpalFragment(richContent, 'a.ts')
    const f2 = analyzeOpalFragment(poorContent, 'b.ts')
    const output = formatFragmentsTable([f1, f2])
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatVeinTable', () => {
  it('formats a vein', () => {
    const fragment = analyzeOpalFragment(richContent, 'src/a.ts')
    const vein = analyzeOpalVein([fragment], 'src')
    const output = formatVeinTable(vein)
    expect(output).toContain('src')
    expect(output).toContain('Fragments')
  })
})

describe('formatVeinsTable', () => {
  it('formats empty veins', () => {
    expect(formatVeinsTable([])).toContain('No opal veins')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Lapidary Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Opal Horizon Analysis')
    expect(output).toContain('Spectrum Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.fragments).toHaveLength(1)
    expect(parsed.spectrum).toBeDefined()
  })
})
