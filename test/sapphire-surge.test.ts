import { describe, expect, it } from 'vitest'

import {
  type AccumulatingMeasure,
  type CaptainGrade,
  type CleansingMeasure,
  type DivingMeasure,
  type EnduringMeasure,
  type OceanCondition,
  type OceanType,
  type PulsingMeasure,
  type SapphireOcean as SapphireOceanType,
  type SapphireTideResult,
  type SapphireWave,
  type WaveCondition,
  analyzeSapphireWave,
  analyzeSapphireOcean,
  buildSapphireTideResult,
  classifyCaptainGrade,
  classifyOceanCondition,
  classifyOceanType,
  classifyWaveCondition,
  generateRecommendations,
  measureAccumulating,
  measureCleansing,
  measureDiving,
  measureEnduring,
  measurePulsing,
} from '../src/commands/sapphire-surge-helpers.js'

import {
  colorOceanCondition,
  colorScore,
  formatOceansTable,
  formatOceanTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatWavesTable,
  formatWaveTable,
} from '../src/commands/sapphire-surge-format-helpers.js'

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

const poorContent = 'var x = eval("1")'

const moderateContent = [
  'import { X } from "y"',
  'export class App {',
  '  name: string',
  '  run() { return 1 }',
  '}',
].join('\n')

function makeWave(
  file: string,
  depth: number,
  rhythm: number,
  purity: number,
  wisdom: number,
  resilience: number,
): SapphireWave {
  const qualityScore = Math.round(depth * 0.2 + rhythm * 0.2 + purity * 0.2 + wisdom * 0.2 + resilience * 0.2)
  return {
    file,
    gemDepth: depth,
    tidalRhythm: rhythm,
    wavePurity: purity,
    oceanWisdom: wisdom,
    tideResilience: resilience,
    diving: { depth, gem: 'abyssal-sapphire', hasHighDepth: depth >= 60, hasWellArchitected: true, hasNoHacked: true, hasDeep: true, hasNoShallow: true, hasProven: true, hasPrincipled: true, hasComprehensive: true, hasLayered: true, hasNuanced: true, hasProfound: true, hasRich: true, hasMature: true, hasInsightful: true, hasStrategic: true, hasThorough: true, hackedCount: 0, shallowCount: 0 } as DivingMeasure,
    pulsing: { rhythm, tide: 'perfect-tide', hasHighRhythm: rhythm >= 60, hasConsistent: true, hasNoErratic: true, hasPredictable: true, hasTested: true, hasNoUntested: true, hasReliable: true, hasUniform: true, hasStable: true, hasDependable: true, hasRhythmic: true, hasHarmonious: true, hasMeasured: true, hasCalibrated: true, hasDisciplined: true, hasPrecise: true, erraticCount: 0, untestedCount: 0 } as PulsingMeasure,
    cleansing: { purity, wave: 'crystal-clear', hasHighPurity: purity >= 60, hasTypeSafe: true, hasNoUnsafe: true, hasAccurate: true, hasNoApproximate: true, hasClean: true, hasHonest: true, hasFaithful: true, hasExact: true, hasPrecise: true, hasRefined: true, hasPolished: true, hasNoiseFree: true, hasUndistorted: true, hasPure: true, hasDistilled: true, hasCrystalline: true, unsafeCount: 0, approximateCount: 0 } as CleansingMeasure,
    accumulating: { wisdom, ocean: 'ancient-sea', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasEvolved: true, hasAdaptive: true, hasEnduring: true, hasConnected: true, hasHolistic: true, hasPatterned: true, hasExperienced: true, hasLearned: true, hasReflective: true, hasVisionary: true, hasMature: true, hasWise: true, hasAccumulated: true, hasTimeless: true, naiveCount: 0, rigidCount: 0 } as AccumulatingMeasure,
    enduring: { resilience, shore: 'granite-cliff', hasHighResilience: resilience >= 60, hasErrorHandled: true, hasNoUnhandled: true, hasDefensive: true, hasRobust: true, hasStable: true, hasHardened: true, hasReinforced: true, hasImpervious: true, hasUnyielding: true, hasPersistent: true, hasEnduring: true, hasRelentless: true, hasPatient: true, hasResolute: true, hasSteadfast: true, unhandledCount: 0, vulnerableCount: 0 } as EnduringMeasure,
    condition: classifyWaveCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<SapphireTideResult['stats']> = {}): SapphireTideResult['stats'] {
  return {
    totalFiles: 1,
    totalOceans: 1,
    avgGemDepth: 80,
    avgTidalRhythm: 80,
    avgWavePurity: 80,
    avgOceanWisdom: 80,
    avgTideResilience: 80,
    sapphireMasterpieceCount: 0,
    oceanPerfectionCount: 1,
    properTideCount: 0,
    murkyCurrentCount: 0,
    stagnantPoolCount: 0,
    voidCount: 0,
    hasHighDepthCount: 1,
    hasHighRhythmCount: 1,
    hasHighPurityCount: 1,
    hasHighWisdomCount: 1,
    hasHighResilienceCount: 1,
    overallDepth: 80,
    captainGrade: 'sea-captain' as CaptainGrade,
    bestWave: 'app.ts',
    deepest: 'app.ts',
    mostRhythmic: 'app.ts',
    purest: 'app.ts',
    wisest: 'app.ts',
    mostResilient: 'app.ts',
    ...overrides,
  }
}

// ─── measureDiving ───────────────────────────────────────

describe('measureDiving', () => {
  it('scores rich content at max', () => {
    const result = measureDiving(richContent)
    expect(result.depth).toBe(100)
    expect(result.hasHighDepth).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureDiving(emptyContent).depth).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureDiving('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureDiving('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
    expect(result.hasNoShallow).toBe(false)
  })

  it('detects well-architected', () => { expect(measureDiving('class Foo {}').hasWellArchitected).toBe(true) })
  it('detects deep types', () => { expect(measureDiving('const x: string').hasDeep).toBe(true) })
  it('detects proven try/catch', () => { expect(measureDiving('try { x } catch { y }').hasProven).toBe(true) })
  it('penalizes any keyword', () => { expect(measureDiving('const x: any').hasPrincipled).toBe(false) })
  it('detects comprehensive docs', () => { expect(measureDiving('/** doc */').hasComprehensive).toBe(true) })
  it('detects layered import/export', () => { expect(measureDiving('export {}').hasLayered).toBe(true) })
})

// ─── measurePulsing ──────────────────────────────────────

describe('measurePulsing', () => {
  it('scores rich content at max', () => {
    const result = measurePulsing(richContent)
    expect(result.rhythm).toBe(100)
    expect(result.hasHighRhythm).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measurePulsing(emptyContent).rhythm).toBeLessThan(50)
  })

  it('detects erratic patterns', () => {
    const result = measurePulsing('erratic unpredictable random flaky code')
    expect(result.erraticCount).toBeGreaterThan(0)
    expect(result.hasNoErratic).toBe(false)
  })

  it('detects untested eval/Function', () => {
    const result = measurePulsing('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects consistent types', () => { expect(measurePulsing('const x: string').hasConsistent).toBe(true) })
  it('detects tested try/catch', () => { expect(measurePulsing('try { x } catch { y }').hasTested).toBe(true) })
  it('penalizes any keyword', () => { expect(measurePulsing('const x: any').hasReliable).toBe(false) })
  it('detects stable class/interface', () => { expect(measurePulsing('class Foo {}').hasStable).toBe(true) })
  it('detects disciplined (no var/eval)', () => { expect(measurePulsing('const x = 1').hasDisciplined).toBe(true) })
  it('penalizes var/eval', () => { expect(measurePulsing('var x = eval("1")').hasDisciplined).toBe(false) })
})

// ─── measureCleansing ────────────────────────────────────

describe('measureCleansing', () => {
  it('scores rich content at max', () => {
    const result = measureCleansing(richContent)
    expect(result.purity).toBe(100)
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureCleansing(emptyContent).purity).toBeLessThan(55)
  })

  it('detects unsafe patterns', () => {
    const result = measureCleansing('const x: any = 1')
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const result = measureCleansing('approximate rough guess hack')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects type-safe annotations', () => { expect(measureCleansing('const x: string').hasTypeSafe).toBe(true) })
  it('penalizes any keyword', () => { expect(measureCleansing('const x: any').hasAccurate).toBe(false) })
  it('detects honest code (no hack)', () => { expect(measureCleansing('const x = 1').hasHonest).toBe(true) })
  it('detects noise-free (no var/eval)', () => { expect(measureCleansing('const x = 1').hasNoiseFree).toBe(true) })
  it('detects crystalline (no cryptic)', () => { expect(measureCleansing('const x = 1').hasCrystalline).toBe(true) })
  it('penalizes cryptic', () => { expect(measureCleansing('cryptic obfuscated').hasCrystalline).toBe(false) })
})

// ─── measureAccumulating ─────────────────────────────────

describe('measureAccumulating', () => {
  it('scores rich content at max', () => {
    const result = measureAccumulating(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureAccumulating(emptyContent).wisdom).toBeLessThan(50)
  })

  it('detects naive patterns', () => {
    const result = measureAccumulating('naive simple basic code')
    expect(result.naiveCount).toBeGreaterThan(0)
  })

  it('detects rigid patterns', () => {
    const result = measureAccumulating('rigid inflexible brittle code')
    expect(result.rigidCount).toBeGreaterThan(0)
  })

  it('detects well-architected', () => { expect(measureAccumulating('class Foo {}').hasWellArchitected).toBe(true) })
  it('detects evolved async/await', () => { expect(measureAccumulating('async function f() { await g() }').hasEvolved).toBe(true) })
  it('detects holistic try/catch', () => { expect(measureAccumulating('try { x } catch { y }').hasHolistic).toBe(true) })
  it('penalizes any keyword', () => { expect(measureAccumulating('const x: any').hasWise).toBe(false) })
  it('detects timeless throw/return', () => { expect(measureAccumulating('throw new Error()').hasTimeless).toBe(true) })
  it('detects reflective (no hack)', () => { expect(measureAccumulating('const x = 1').hasReflective).toBe(true) })
})

// ─── measureEnduring ─────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content at max', () => {
    const result = measureEnduring(richContent)
    expect(result.resilience).toBe(100)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureEnduring(emptyContent).resilience).toBeLessThan(50)
  })

  it('detects unhandled patterns', () => {
    const result = measureEnduring('unhandled unchecked bare code')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects vulnerable patterns', () => {
    const result = measureEnduring('vulnerable fragile weak code')
    expect(result.vulnerableCount).toBeGreaterThan(0)
  })

  it('detects error handling', () => { expect(measureEnduring('try { x } catch { y }').hasErrorHandled).toBe(true) })
  it('detects defensive types', () => { expect(measureEnduring('const x: string').hasDefensive).toBe(true) })
  it('penalizes any keyword', () => { expect(measureEnduring('const x: any').hasRobust).toBe(false) })
  it('detects stable const/readonly', () => { expect(measureEnduring('const x = 1').hasStable).toBe(true) })
  it('detects persistent import/export', () => { expect(measureEnduring('export {}').hasPersistent).toBe(true) })
  it('penalizes var/eval', () => { expect(measureEnduring('var x = eval("1")').hasImpervious).toBe(false) })
  it('penalizes hack/workaround', () => { expect(measureEnduring('hack workaround code').hasUnyielding).toBe(false) })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('returns sapphire-masterpiece for 90+', () => { expect(classifyWaveCondition(95)).toBe('sapphire-masterpiece') })
  it('returns ocean-perfection for 75-89', () => { expect(classifyWaveCondition(80)).toBe('ocean-perfection') })
  it('returns proper-tide for 60-74', () => { expect(classifyWaveCondition(65)).toBe('proper-tide') })
  it('returns murky-current for 40-59', () => { expect(classifyWaveCondition(50)).toBe('murky-current') })
  it('returns stagnant-pool for 20-39', () => { expect(classifyWaveCondition(30)).toBe('stagnant-pool') })
  it('returns void below 20', () => { expect(classifyWaveCondition(10)).toBe('void') })
})

describe('classifyOceanType', () => {
  it('returns no-ocean for empty', () => { expect(classifyOceanType([])).toBe('no-ocean') })
  it('returns deep-abyss for high', () => { expect(classifyOceanType([makeWave('a.ts', 90, 90, 90, 90, 90)])).toBe('deep-abyss') })
  it('returns continental-shelf for medium-high', () => { expect(classifyOceanType([makeWave('a.ts', 75, 75, 75, 75, 75)])).toBe('continental-shelf') })
  it('returns proper-sea for medium', () => { expect(classifyOceanType([makeWave('a.ts', 60, 60, 60, 60, 60)])).toBe('proper-sea') })
  it('returns coastal-water for low', () => { expect(classifyOceanType([makeWave('a.ts', 40, 40, 40, 40, 40)])).toBe('coastal-water') })
  it('returns puddle for very low', () => { expect(classifyOceanType([makeWave('a.ts', 20, 20, 20, 20, 20)])).toBe('puddle') })
})

describe('classifyOceanCondition', () => {
  it('returns sapphire-palace for 85+', () => { expect(classifyOceanCondition(90)).toBe('sapphire-palace') })
  it('returns ocean-floor for 70-84', () => { expect(classifyOceanCondition(75)).toBe('ocean-floor') })
  it('returns proper-depths for 55-69', () => { expect(classifyOceanCondition(60)).toBe('proper-depths') })
  it('returns shallow-reef for 35-54', () => { expect(classifyOceanCondition(40)).toBe('shallow-reef') })
  it('returns dry-dock for 15-34', () => { expect(classifyOceanCondition(20)).toBe('dry-dock') })
  it('returns void below 15', () => { expect(classifyOceanCondition(5)).toBe('void') })
})

describe('classifyCaptainGrade', () => {
  it('returns admiral-of-the-fleet for 80+', () => { expect(classifyCaptainGrade(85)).toBe('admiral-of-the-fleet') })
  it('returns sea-captain for 65-79', () => { expect(classifyCaptainGrade(70)).toBe('sea-captain') })
  it('returns navigator for 50-64', () => { expect(classifyCaptainGrade(55)).toBe('navigator') })
  it('returns apprentice for 35-49', () => { expect(classifyCaptainGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyCaptainGrade(25)).toBe('novice') })
  it('returns landlubber below 20', () => { expect(classifyCaptainGrade(10)).toBe('landlubber') })
})

// ─── analyzeSapphireWave ────────────────────────────────

describe('analyzeSapphireWave', () => {
  it('returns full SapphireWave for rich content', () => {
    const result = analyzeSapphireWave(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.gemDepth).toBeGreaterThan(0)
    expect(result.tidalRhythm).toBeGreaterThan(0)
    expect(result.wavePurity).toBeGreaterThan(0)
    expect(result.oceanWisdom).toBeGreaterThan(0)
    expect(result.tideResilience).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
  })

  it('scores poor content low', () => {
    expect(analyzeSapphireWave(poorContent, 'bad.ts').qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted', () => {
    const result = analyzeSapphireWave(richContent, 'test.ts')
    const expected = Math.round(
      result.gemDepth * 0.2 + result.tidalRhythm * 0.2 +
      result.wavePurity * 0.2 + result.oceanWisdom * 0.2 + result.tideResilience * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('sets celebration for sapphire-surge files', () => {
    const result = analyzeSapphireWave(richContent, 'sapphire-surge.ts')
    expect(result.celebration).toBe('★ Milestone #610 — Sapphire Tide ★')
  })

  it('sets celebration for sapphire-tide files', () => {
    const result = analyzeSapphireWave(richContent, 'src/sapphire-tide.ts')
    expect(result.celebration).toBe('★ Milestone #610 — Sapphire Tide ★')
  })

  it('sets celebration for ocean-gem files', () => {
    const result = analyzeSapphireWave(richContent, 'ocean-gem.ts')
    expect(result.celebration).toBe('★ Milestone #610 — Sapphire Tide ★')
  })

  it('does not set celebration for regular files', () => {
    const result = analyzeSapphireWave(richContent, 'app.ts')
    expect(result.celebration).toBeUndefined()
  })
})

// ─── analyzeSapphireOcean ───────────────────────────────

describe('analyzeSapphireOcean', () => {
  it('returns empty ocean for no waves', () => {
    const result = analyzeSapphireOcean([], 'src')
    expect(result.directory).toBe('src')
    expect(result.waves).toHaveLength(0)
    expect(result.oceanType).toBe('no-ocean')
    expect(result.condition).toBe('void')
  })

  it('aggregates wave scores', () => {
    const waves = [makeWave('a.ts', 80, 80, 80, 80, 80), makeWave('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeSapphireOcean(waves, 'src')
    expect(result.avgDepth).toBe(70)
    expect(result.avgRhythm).toBe(70)
    expect(result.avgWisdom).toBe(70)
  })

  it('counts masterpiece and void', () => {
    const masterpiece = makeWave('a.ts', 95, 95, 95, 95, 95)
    const voidW = makeWave('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeSapphireOcean([masterpiece, voidW], 'src')
    expect(result.sapphireMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildSapphireTideResult ─────────────────────────────

describe('buildSapphireTideResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildSapphireTideResult(['app.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.oceans).toHaveLength(1)
    expect(result.sea.overallDepth).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildSapphireTideResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
    expect(result.sea.isSapphire).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildSapphireTideResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.oceans.length).toBe(2)
    expect(result.stats.totalOceans).toBe(2)
  })

  it('computes captain grade', async () => {
    const result = await buildSapphireTideResult(['a.ts'], [richContent])
    expect(result.stats.captainGrade).toBeDefined()
    expect(result.sea.isSapphire).toBe(result.sea.overallDepth >= 60)
  })

  it('finds extremes', async () => {
    const result = await buildSapphireTideResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestWave).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.mostRhythmic).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
  })

  it('scores rich content at max', async () => {
    const result = await buildSapphireTideResult(['perfect.ts'], [richContent])
    expect(result.waves[0].gemDepth).toBe(100)
    expect(result.waves[0].tidalRhythm).toBe(100)
    expect(result.waves[0].wavePurity).toBe(100)
    expect(result.waves[0].oceanWisdom).toBe(100)
    expect(result.waves[0].tideResilience).toBe(100)
    expect(result.waves[0].qualityScore).toBe(100)
  })

  it('handles mixed content', async () => {
    const result = await buildSapphireTideResult(['good.ts', 'bad.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.waves).toHaveLength(2)
  })

  it('sets stats celebration when wave has celebration', async () => {
    const result = await buildSapphireTideResult(['sapphire-surge.ts'], [richContent])
    expect(result.waves[0].celebration).toBe('★ Milestone #610 — Sapphire Tide ★')
    expect(result.stats.celebration).toBe('★ Milestone #610 — 610 commands flowing like the eternal tide ★')
  })

  it('does not set celebration for non-milestone files', async () => {
    const result = await buildSapphireTideResult(['app.ts'], [richContent])
    expect(result.stats.celebration).toBeUndefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', () => {
    const waves = [makeWave('a.ts', 95, 95, 95, 95, 95)]
    const oceans: SapphireOceanType[] = []
    const sea = { avgDepth: 95, avgRhythm: 95, avgWisdom: 95, isSapphire: true, overallDepth: 95 }
    const stats = makeStats({ avgGemDepth: 95, avgTidalRhythm: 95, avgWavePurity: 95, avgOceanWisdom: 95, avgTideResilience: 95, overallDepth: 95 })
    const recs = generateRecommendations(waves, oceans, sea, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends deepening when depth low', () => {
    const waves = [makeWave('a.ts', 50, 90, 90, 90, 90)]
    const stats = makeStats({ avgGemDepth: 50, avgTidalRhythm: 90, avgWavePurity: 90, avgOceanWisdom: 90, avgTideResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(waves, [], { avgDepth: 50, avgRhythm: 90, avgWisdom: 90, isSapphire: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('sapphire waters'))).toBe(true)
  })

  it('recommends smoothing rhythm when low', () => {
    const waves = [makeWave('a.ts', 90, 50, 90, 90, 90)]
    const stats = makeStats({ avgGemDepth: 90, avgTidalRhythm: 50, avgWavePurity: 90, avgOceanWisdom: 90, avgTideResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(waves, [], { avgDepth: 90, avgRhythm: 50, avgWisdom: 90, isSapphire: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('tidal rhythm'))).toBe(true)
  })

  it('recommends cleansing purity when low', () => {
    const waves = [makeWave('a.ts', 90, 90, 50, 90, 90)]
    const stats = makeStats({ avgGemDepth: 90, avgTidalRhythm: 90, avgWavePurity: 50, avgOceanWisdom: 90, avgTideResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(waves, [], { avgDepth: 90, avgRhythm: 90, avgWisdom: 90, isSapphire: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('wave purity'))).toBe(true)
  })

  it('recommends cultivating wisdom when low', () => {
    const waves = [makeWave('a.ts', 90, 90, 90, 50, 90)]
    const stats = makeStats({ avgGemDepth: 90, avgTidalRhythm: 90, avgWavePurity: 90, avgOceanWisdom: 50, avgTideResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(waves, [], { avgDepth: 90, avgRhythm: 90, avgWisdom: 50, isSapphire: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('ocean wisdom'))).toBe(true)
  })

  it('recommends fortifying resilience when low', () => {
    const waves = [makeWave('a.ts', 90, 90, 90, 90, 50)]
    const stats = makeStats({ avgGemDepth: 90, avgTidalRhythm: 90, avgWavePurity: 90, avgOceanWisdom: 90, avgTideResilience: 50, overallDepth: 82 })
    const recs = generateRecommendations(waves, [], { avgDepth: 90, avgRhythm: 90, avgWisdom: 90, isSapphire: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('tide resilience'))).toBe(true)
  })

  it('warns about receded tide when overall < 40', () => {
    const waves = [makeWave('a.ts', 30, 30, 30, 30, 30)]
    const stats = makeStats({ avgGemDepth: 30, avgTidalRhythm: 30, avgWavePurity: 30, avgOceanWisdom: 30, avgTideResilience: 30, overallDepth: 30 })
    const recs = generateRecommendations(waves, [], { avgDepth: 30, avgRhythm: 30, avgWisdom: 30, isSapphire: false, overallDepth: 30 }, stats)
    expect(recs.some((r) => r.includes('receded'))).toBe(true)
  })

  it('lists void waves when <= 5', () => {
    const waves = [makeWave('a.ts', 5, 5, 5, 5, 5), makeWave('b.ts', 90, 90, 90, 90, 90)]
    const stats = makeStats({ overallDepth: 47 })
    const recs = generateRecommendations(waves, [], { avgDepth: 47, avgRhythm: 47, avgWisdom: 47, isSapphire: false, overallDepth: 47 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many void waves', () => {
    const waves = Array.from({ length: 6 }, (_, i) => makeWave(`${i}.ts`, 5, 5, 5, 5, 5))
    const stats = makeStats({ overallDepth: 5, voidCount: 6 })
    const recs = generateRecommendations(waves, [], { avgDepth: 5, avgRhythm: 5, avgWisdom: 5, isSapphire: false, overallDepth: 5 }, stats)
    expect(recs.some((r) => r.includes('6 stagnant pools'))).toBe(true)
  })

  it('warns about all dried oceans', () => {
    const waves = [makeWave('a.ts', 5, 5, 5, 5, 5)]
    const oceans = [{ directory: 'src', waves, avgDepth: 5, avgRhythm: 5, avgWisdom: 5, sapphireMasterpieceCount: 0, voidCount: 1, oceanType: 'puddle' as OceanType, condition: 'void' as OceanCondition }]
    const stats = makeStats({ overallDepth: 5 })
    const recs = generateRecommendations(waves, oceans, { avgDepth: 5, avgRhythm: 5, avgWisdom: 5, isSapphire: false, overallDepth: 5 }, stats)
    expect(recs.some((r) => r.includes('dried up'))).toBe(true)
  })

  it('returns positive when scores are good', () => {
    const waves = [makeWave('a.ts', 80, 80, 80, 80, 80)]
    const stats = makeStats({ overallDepth: 80 })
    const recs = generateRecommendations(waves, [], { avgDepth: 80, avgRhythm: 80, avgWisdom: 80, isSapphire: true, overallDepth: 80 }, stats)
    expect(recs.some((r) => r.includes('gem-like power'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for high score', () => { expect(typeof colorScore(95)).toBe('string') })
  it('returns string for low score', () => { expect(typeof colorScore(5)).toBe('string') })
  it('returns string for mid score', () => { expect(typeof colorScore(50)).toBe('string') })
})

describe('colorOceanCondition', () => {
  it('colors sapphire-palace', () => { expect(typeof colorOceanCondition('sapphire-palace')).toBe('string') })
  it('colors void', () => { expect(typeof colorOceanCondition('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof colorOceanCondition('unknown')).toBe('string') })
})

describe('formatWaveTable', () => {
  it('formats single wave', () => {
    const wave = makeWave('app.ts', 80, 80, 80, 80, 80)
    const result = formatWaveTable(wave)
    expect(result).toContain('Sapphire Wave: app.ts')
    expect(result).toContain('Gem Depth')
    expect(result).toContain('Quality Score')
  })

  it('includes celebration when present', () => {
    const wave = makeWave('sapphire-surge.ts', 80, 80, 80, 80, 80)
    wave.celebration = '★ Milestone #610 — Sapphire Tide ★'
    const result = formatWaveTable(wave)
    expect(result).toContain('Milestone #610')
  })
})

describe('formatWavesTable', () => {
  it('returns no-waves message for empty', () => { expect(formatWavesTable([])).toContain('No sapphire waves') })
  it('formats multiple waves', () => {
    const waves = [makeWave('a.ts', 80, 80, 80, 80, 80), makeWave('b.ts', 60, 60, 60, 60, 60)]
    const result = formatWavesTable(waves)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatOceanTable', () => {
  it('formats single ocean', () => {
    const ocean: SapphireOceanType = { directory: 'src', waves: [], avgDepth: 80, avgRhythm: 80, avgWisdom: 80, sapphireMasterpieceCount: 1, voidCount: 0, oceanType: 'deep-abyss', condition: 'sapphire-palace' }
    const result = formatOceanTable(ocean)
    expect(result).toContain('Sapphire Ocean: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatOceansTable', () => {
  it('returns no-oceans for empty', () => { expect(formatOceansTable([])).toContain('No sapphire oceans') })
  it('formats multiple oceans', () => {
    const oceans = [
      { directory: 'src', waves: [], avgDepth: 80, avgRhythm: 80, avgWisdom: 80, sapphireMasterpieceCount: 0, voidCount: 0, oceanType: 'continental-shelf' as OceanType, condition: 'ocean-floor' as OceanCondition },
      { directory: 'lib', waves: [], avgDepth: 50, avgRhythm: 50, avgWisdom: 50, sapphireMasterpieceCount: 0, voidCount: 0, oceanType: 'proper-sea' as OceanType, condition: 'proper-depths' as OceanCondition },
    ]
    const result = formatOceansTable(oceans)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Sapphire Tide Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Captain Grade')
    expect(result).toContain('Best Wave')
  })

  it('includes celebration when present', () => {
    const stats = makeStats({ celebration: '★ Milestone #610 — 610 commands flowing like the eternal tide ★' })
    const result = formatStatsTable(stats)
    expect(result).toContain('Milestone #610')
  })
})

describe('formatRecommendations', () => {
  it('returns no-recs for empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSapphireTideResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Sapphire Tide Analysis')
    expect(table).toContain('Oceanic Overview')
    expect(table).toContain('Sapphire Tide Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildSapphireTideResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
