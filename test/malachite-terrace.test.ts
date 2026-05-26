import { describe, expect, it } from 'vitest'

import {
  analyzeMalachiteBand,
  analyzeMalachitePillar,
  buildMalachiteTerraceResult,
  classifyArtisanGrade,
  classifyMalachiteCondition,
  classifyPillarCondition,
  classifyPillarType,
  generateRecommendations,
  measureHardening,
  measureKnowing,
  measureLayering,
  measurePatterning,
  measureRevealing,
} from '../src/commands/malachite-terrace-helpers.js'
import type { MalachiteTerraceResult } from '../src/commands/malachite-terrace-helpers.js'
import {
  colorArtisanGrade,
  colorMalachiteCondition,
  colorPillarCondition,
  colorPillarType,
  colorScore,
  formatBandsTable,
  formatBandTable,
  formatPillarsTable,
  formatPillarTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/malachite-terrace-format-helpers.js'

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
const minimalContent = 'const x = 1'

const richPat = measurePatterning(richContent).pattern
const richClr = measureRevealing(richContent).clarity
const richPrec = measureLayering(richContent).precision
const richRes = measureHardening(richContent).resilience
const richWis = measureKnowing(richContent).wisdom

function makeStats(overrides: Partial<MalachiteTerraceResult['stats']> = {}): MalachiteTerraceResult['stats'] {
  return {
    totalFiles: 1,
    totalPillars: 1,
    avgVerdantPattern: 50,
    avgGemClarity: 50,
    avgBandedPrecision: 50,
    avgCopperResilience: 50,
    avgMineralWisdom: 50,
    malachiteMasterpieceCount: 0,
    emeraldBandCount: 0,
    properMalachiteCount: 0,
    greenStoneCount: 0,
    rawMineralCount: 0,
    voidCount: 0,
    hasHighPatternCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallBeauty: 50,
    artisanGrade: 'proper-mason',
    bestBand: 'a.ts',
    mostPatterned: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measurePatterning ──────────────────────────────────

describe('measurePatterning', () => {
  it('scores rich content highly', () => {
    const result = measurePatterning(richContent)
    expect(result.pattern).toBeGreaterThan(60)
    expect(result.hasHighPattern).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measurePatterning(emptyContent).pattern).toBeLessThan(richPat)
  })

  it('detects hasWellStructured (class/interface/type)', () => {
    expect(measurePatterning(richContent).hasWellStructured).toBe(true)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const disorganized = 3; const tangled = 4; const spaghetti = 5'
    const result = measurePatterning(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.spaghettiCount).toBe(1)
    expect(result.hasNoChaotic).toBe(false)
    expect(result.hasNoSpaghetti).toBe(false)
  })

  it('counts spaghetti keywords', () => {
    const content = 'const spaghetti = 1; const entangled = 2; const knotted = 3'
    const result = measurePatterning(content)
    expect(result.spaghettiCount).toBe(3)
    expect(result.hasNoSpaghetti).toBe(false)
  })

  it('detects hasModular (import/export)', () => {
    expect(measurePatterning(richContent).hasModular).toBe(true)
  })

  it('detects hasOrganized (type annotations)', () => {
    expect(measurePatterning(richContent).hasOrganized).toBe(true)
  })

  it('detects hasDiverse (no any)', () => {
    expect(measurePatterning(richContent).hasDiverse).toBe(true)
  })

  it('detects hasVaried (JSDoc)', () => {
    expect(measurePatterning(richContent).hasVaried).toBe(true)
  })

  it('detects hasRich (async/await/Promise)', () => {
    expect(measurePatterning(richContent).hasRich).toBe(true)
  })

  it('detects hasNoMonolithic', () => {
    const content = 'const monolithic = 1; const god.object = 2; const mega = 3'
    const result = measurePatterning(content)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('classifies band correctly for high scores', () => {
    const result = measurePatterning(richContent)
    expect(['bullseye-pattern', 'silky-bands', 'proper-striations']).toContain(result.band)
  })

  it('classifies band correctly for low scores', () => {
    expect(measurePatterning(emptyContent).band).not.toBe('bullseye-pattern')
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRevealing(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureRevealing(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureRevealing(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureRevealing(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureRevealing(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureRevealing(richContent).hasTransparent).toBe(true)
  })

  it('detects hasOpen (JSDoc)', () => {
    expect(measureRevealing(richContent).hasOpen).toBe(true)
  })

  it('classifies gem correctly for high scores', () => {
    const result = measureRevealing(richContent)
    expect(['chatoyant-malachite', 'velvet-surface', 'proper-luster']).toContain(result.gem)
  })

  it('classifies gem correctly for low scores', () => {
    expect(measureRevealing(emptyContent).gem).not.toBe('chatoyant-malachite')
  })
})

// ─── measureLayering ────────────────────────────────────

describe('measureLayering', () => {
  it('scores rich content highly', () => {
    const result = measureLayering(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureLayering(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureLayering(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureLayering(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureLayering(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureLayering(richContent).hasExact).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureLayering(richContent).hasCrisp).toBe(true)
  })

  it('detects hasStructured (try/catch/if)', () => {
    expect(measureLayering(richContent).hasStructured).toBe(true)
  })

  it('detects hasSystematic (function/arrow/return)', () => {
    expect(measureLayering(richContent).hasSystematic).toBe(true)
  })

  it('classifies cut correctly for high scores', () => {
    const result = measureLayering(richContent)
    expect(['cabochon-perfect', 'proper-slab', 'thin-veneer']).toContain(result.cut)
  })

  it('classifies cut correctly for low scores', () => {
    expect(measureLayering(emptyContent).cut).not.toBe('cabochon-perfect')
  })
})

// ─── measureHardening ───────────────────────────────────

describe('measureHardening', () => {
  it('scores rich content highly', () => {
    const result = measureHardening(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureHardening(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureHardening(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureHardening(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureHardening(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureHardening(richContent).hasRobust).toBe(true)
  })

  it('detects hasDurable (no any)', () => {
    expect(measureHardening(richContent).hasDurable).toBe(true)
  })

  it('detects hasFirm (async/await/Promise)', () => {
    expect(measureHardening(richContent).hasFirm).toBe(true)
  })

  it('classifies copper correctly for high scores', () => {
    const result = measureHardening(richContent)
    expect(['pure-carbonate', 'proper-mineral', 'good-hardness']).toContain(result.copper)
  })

  it('classifies copper correctly for low scores', () => {
    expect(measureHardening(emptyContent).copper).not.toBe('pure-carbonate')
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureKnowing(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureKnowing(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureKnowing(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureKnowing(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureKnowing(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureKnowing(richContent).hasInsightful).toBe(true)
  })

  it('detects hasComprehensive (try/catch/if)', () => {
    expect(measureKnowing(richContent).hasComprehensive).toBe(true)
  })

  it('detects hasNatural (no unused/dead/obsolete/deprecated)', () => {
    expect(measureKnowing(richContent).hasNatural).toBe(true)
  })

  it('detects hasAncient (function/arrow/return)', () => {
    expect(measureKnowing(richContent).hasAncient).toBe(true)
  })

  it('classifies depth correctly for high scores', () => {
    const result = measureKnowing(richContent)
    expect(['geological-sage', 'crystal-keeper', 'proper-mineralogist']).toContain(result.depth)
  })

  it('classifies depth correctly for low scores', () => {
    expect(measureKnowing(emptyContent).depth).not.toBe('geological-sage')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyMalachiteCondition', () => {
  it('returns malachite-masterpiece for 90+', () => {
    expect(classifyMalachiteCondition(90)).toBe('malachite-masterpiece')
    expect(classifyMalachiteCondition(95)).toBe('malachite-masterpiece')
  })

  it('returns emerald-band for 75-89', () => {
    expect(classifyMalachiteCondition(75)).toBe('emerald-band')
  })

  it('returns proper-malachite for 60-74', () => {
    expect(classifyMalachiteCondition(60)).toBe('proper-malachite')
  })

  it('returns green-stone for 40-59', () => {
    expect(classifyMalachiteCondition(40)).toBe('green-stone')
  })

  it('returns raw-mineral for 20-39', () => {
    expect(classifyMalachiteCondition(20)).toBe('raw-mineral')
  })

  it('returns void below 20', () => {
    expect(classifyMalachiteCondition(0)).toBe('void')
    expect(classifyMalachiteCondition(10)).toBe('void')
  })
})

describe('classifyPillarType', () => {
  it('returns no-pillar for empty bands', () => {
    expect(classifyPillarType([])).toBe('no-pillar')
  })

  it('returns hermitage-column for avg >= 85', () => {
    const bands = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyPillarType(bands)).toBe('hermitage-column')
  })

  it('returns wooden-stick for low avg', () => {
    const bands = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyPillarType(bands)).toBe('wooden-stick')
  })
})

describe('classifyPillarCondition', () => {
  it('returns malachite-palace for 85+', () => {
    expect(classifyPillarCondition(85)).toBe('malachite-palace')
  })

  it('returns void below 15', () => {
    expect(classifyPillarCondition(5)).toBe('void')
  })
})

describe('classifyArtisanGrade', () => {
  it('returns master-lapidary for 80+', () => {
    expect(classifyArtisanGrade(80)).toBe('master-lapidary')
  })

  it('returns stone-breaker below 20', () => {
    expect(classifyArtisanGrade(5)).toBe('stone-breaker')
  })

  it('returns expert-gem-cutter for 65-79', () => {
    expect(classifyArtisanGrade(65)).toBe('expert-gem-cutter')
  })

  it('returns proper-mason for 50-64', () => {
    expect(classifyArtisanGrade(50)).toBe('proper-mason')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyArtisanGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyArtisanGrade(20)).toBe('novice')
  })
})

// ─── analyzeMalachiteBand ───────────────────────────────

describe('analyzeMalachiteBand', () => {
  it('creates a band with all 5 measures', () => {
    const band = analyzeMalachiteBand(richContent, 'app.ts')
    expect(band.file).toBe('app.ts')
    expect(typeof band.verdantPattern).toBe('number')
    expect(typeof band.gemClarity).toBe('number')
    expect(typeof band.bandedPrecision).toBe('number')
    expect(typeof band.copperResilience).toBe('number')
    expect(typeof band.mineralWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const band = analyzeMalachiteBand(richContent, 'app.ts')
    const expected = Math.round(
      band.verdantPattern * 0.2 +
      band.gemClarity * 0.2 +
      band.bandedPrecision * 0.2 +
      band.copperResilience * 0.2 +
      band.mineralWisdom * 0.2,
    )
    expect(band.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const band = analyzeMalachiteBand(richContent, 'app.ts')
    expect(band.condition).toBe(classifyMalachiteCondition(band.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richBand = analyzeMalachiteBand(richContent, 'rich.ts')
    const emptyBand = analyzeMalachiteBand(emptyContent, 'empty.ts')
    expect(richBand.qualityScore).toBeGreaterThan(emptyBand.qualityScore)
  })

  it('scores rich content higher than minimal', () => {
    const richBand = analyzeMalachiteBand(richContent, 'rich.ts')
    const minBand = analyzeMalachiteBand(minimalContent, 'min.ts')
    expect(richBand.qualityScore).toBeGreaterThan(minBand.qualityScore)
  })
})

// ─── analyzeMalachitePillar ─────────────────────────────

describe('analyzeMalachitePillar', () => {
  it('returns empty pillar for no bands', () => {
    const pillar = analyzeMalachitePillar([], 'src')
    expect(pillar.directory).toBe('src')
    expect(pillar.bands).toEqual([])
    expect(pillar.pillarType).toBe('no-pillar')
    expect(pillar.condition).toBe('void')
  })

  it('computes averages from bands', () => {
    const bands = [analyzeMalachiteBand(richContent, 'a.ts'), analyzeMalachiteBand(richContent, 'b.ts')]
    const pillar = analyzeMalachitePillar(bands, 'src')
    expect(pillar.avgPattern).toBeGreaterThan(0)
    expect(pillar.avgPrecision).toBeGreaterThan(0)
    expect(pillar.avgWisdom).toBeGreaterThan(0)
  })

  it('counts malachite masterpieces', () => {
    const band = analyzeMalachiteBand(richContent, 'a.ts')
    const pillar = analyzeMalachitePillar([band], 'src')
    expect(typeof pillar.malachiteMasterpieceCount).toBe('number')
  })
})

// ─── buildMalachiteTerraceResult ────────────────────────

describe('buildMalachiteTerraceResult', () => {
  it('returns full result structure', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    expect(result.bands).toHaveLength(1)
    expect(result.pillars).toHaveLength(1)
    expect(result.gallery).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into pillars', async () => {
    const result = await buildMalachiteTerraceResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.pillars.length).toBe(2)
  })

  it('computes gallery overview', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    expect(result.gallery.avgPattern).toBeGreaterThan(0)
    expect(result.gallery.isMalachite).toBe(true)
    expect(result.gallery.overallBeauty).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildMalachiteTerraceResult([], [])
    expect(result.bands).toHaveLength(0)
    expect(result.pillars).toHaveLength(0)
    expect(result.gallery.overallBeauty).toBe(0)
    expect(result.gallery.isMalachite).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    const total = result.stats.malachiteMasterpieceCount +
      result.stats.emeraldBandCount +
      result.stats.properMalachiteCount +
      result.stats.greenStoneCount +
      result.stats.rawMineralCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    expect(result.stats.hasHighPatternCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best band and top performers', async () => {
    const result = await buildMalachiteTerraceResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestBand).toBeTruthy()
    expect(result.stats.mostPatterned).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes artisan grade from overall beauty', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    expect(result.stats.artisanGrade).toBe(classifyArtisanGrade(result.stats.overallBeauty))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgVerdantPattern: 90,
      avgGemClarity: 90,
      avgBandedPrecision: 90,
      avgCopperResilience: 90,
      avgMineralWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgPattern: 90, avgPrecision: 90, avgWisdom: 90, isMalachite: true, overallBeauty: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('malachite masterpiece')
  })

  it('recommends verdant pattern when < 60', () => {
    const stats = makeStats({ avgVerdantPattern: 50 })
    const result = generateRecommendations([], [], { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('verdant pattern') || r.includes('bullseye-pattern'))).toBe(true)
  })

  it('recommends gem clarity when < 60', () => {
    const stats = makeStats({ avgGemClarity: 50 })
    const result = generateRecommendations([], [], { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('gem clarity') || r.includes('chatoyant-malachite'))).toBe(true)
  })

  it('recommends banded precision when < 60', () => {
    const stats = makeStats({ avgBandedPrecision: 50 })
    const result = generateRecommendations([], [], { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('banded precision') || r.includes('cabochon-perfect'))).toBe(true)
  })

  it('recommends copper resilience when < 60', () => {
    const stats = makeStats({ avgCopperResilience: 50 })
    const result = generateRecommendations([], [], { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('copper resilience') || r.includes('pure-carbonate'))).toBe(true)
  })

  it('recommends mineral wisdom when < 60', () => {
    const stats = makeStats({ avgMineralWisdom: 50 })
    const result = generateRecommendations([], [], { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('mineral wisdom') || r.includes('geological-sage'))).toBe(true)
  })

  it('warns about crumbled terrace when overallBeauty < 40', () => {
    const stats = makeStats({ overallBeauty: 30 })
    const result = generateRecommendations([], [], { avgPattern: 30, avgPrecision: 30, avgWisdom: 30, isMalachite: false, overallBeauty: 30 }, stats)
    expect(result.some((r) => r.includes('crumbled'))).toBe(true)
  })

  it('lists void bands by name when <= 5', () => {
    const bands = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(bands, [], { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void bands when > 5', () => {
    const bands = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(bands, [], { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('6 raw minerals'))).toBe(true)
  })

  it('warns when all pillars are poor', () => {
    const pillars = [{ condition: 'dirt-yard' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], pillars as Array<{ condition: string }>, { avgPattern: 50, avgPrecision: 50, avgWisdom: 50, isMalachite: false, overallBeauty: 50 }, stats)
    expect(result.some((r) => r.includes('dirt yards'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgVerdantPattern: 70,
      avgGemClarity: 70,
      avgBandedPrecision: 70,
      avgCopperResilience: 70,
      avgMineralWisdom: 70,
      overallBeauty: 70,
    })
    const result = generateRecommendations([], [], { avgPattern: 70, avgPrecision: 70, avgWisdom: 70, isMalachite: true, overallBeauty: 70 }, stats)
    expect(result.some((r) => r.includes('verdant beauty'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorMalachiteCondition', () => {
  it('colors malachite-masterpiece', () => {
    expect(typeof colorMalachiteCondition('malachite-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorMalachiteCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorMalachiteCondition('unknown')).toBe('string')
  })
})

describe('colorPillarType', () => {
  it('colors hermitage-column', () => {
    expect(typeof colorPillarType('hermitage-column')).toBe('string')
  })

  it('colors no-pillar', () => {
    expect(typeof colorPillarType('no-pillar')).toBe('string')
  })
})

describe('colorPillarCondition', () => {
  it('colors malachite-palace', () => {
    expect(typeof colorPillarCondition('malachite-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorPillarCondition('void')).toBe('string')
  })
})

describe('colorArtisanGrade', () => {
  it('colors master-lapidary', () => {
    expect(typeof colorArtisanGrade('master-lapidary')).toBe('string')
  })

  it('colors stone-breaker', () => {
    expect(typeof colorArtisanGrade('stone-breaker')).toBe('string')
  })
})

describe('formatBandTable', () => {
  it('formats a band with all measures', () => {
    const band = analyzeMalachiteBand(richContent, 'app.ts')
    const output = formatBandTable(band)
    expect(output).toContain('Malachite Band: app.ts')
    expect(output).toContain('Verdant Pattern')
    expect(output).toContain('Gem Clarity')
    expect(output).toContain('Banded Precision')
    expect(output).toContain('Copper Resilience')
    expect(output).toContain('Mineral Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatBandsTable', () => {
  it('shows no bands message for empty array', () => {
    expect(formatBandsTable([])).toContain('No malachite bands')
  })

  it('lists bands in output', () => {
    const bands = [analyzeMalachiteBand(richContent, 'a.ts')]
    expect(formatBandsTable(bands)).toContain('a.ts')
  })
})

describe('formatPillarTable', () => {
  it('formats a pillar with all fields', () => {
    const bands = [analyzeMalachiteBand(richContent, 'a.ts')]
    const pillar = analyzeMalachitePillar(bands, 'src')
    const output = formatPillarTable(pillar)
    expect(output).toContain('Malachite Pillar: src')
    expect(output).toContain('Bands')
    expect(output).toContain('Avg Pattern')
  })
})

describe('formatPillarsTable', () => {
  it('shows no pillars message for empty array', () => {
    expect(formatPillarsTable([])).toContain('No malachite pillars')
  })

  it('lists pillars in output', () => {
    const bands = [analyzeMalachiteBand(richContent, 'a.ts')]
    const pillar = analyzeMalachitePillar(bands, 'src')
    expect(formatPillarsTable([pillar])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Malachite Terrace Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Artisan Grade')
    expect(output).toContain('Best Band')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Malachite Terrace Analysis')
    expect(output).toContain('Gallery Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildMalachiteTerraceResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.bands).toHaveLength(1)
    expect(parsed.gallery).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
