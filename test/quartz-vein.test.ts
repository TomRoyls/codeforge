import { describe, expect, it } from 'vitest'

import {
  type ChannelingMeasure,
  type GeologistGrade,
  type OscillatingMeasure,
  type QuartzCondition,
  type QuartzCrystal,
  type QuartzMeridianResult,
  type QuartzStratum as QuartzStratumType,
  type ResonatingMeasure,
  type StratumCondition,
  type StratumType,
  type SupportingMeasure,
  type TransmittingMeasure,
  analyzeQuartzCrystal,
  analyzeQuartzStratum,
  buildQuartzMeridianResult,
  classifyGeologistGrade,
  classifyQuartzCondition,
  classifyStratumCondition,
  classifyStratumType,
  generateRecommendations,
  measureChanneling,
  measureOscillating,
  measureResonating,
  measureSupporting,
  measureTransmitting,
} from '../src/commands/quartz-vein-helpers.js'

import {
  colorScore,
  colorStratumCondition,
  formatCrystalsTable,
  formatCrystalTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatStrataTable,
  formatStratumTable,
} from '../src/commands/quartz-vein-format-helpers.js'

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

function makeCrystal(
  file: string,
  clarity: number,
  quality: number,
  purity: number,
  strength: number,
  wisdom: number,
): QuartzCrystal {
  const qualityScore = Math.round(clarity * 0.2 + quality * 0.2 + purity * 0.2 + strength * 0.2 + wisdom * 0.2)
  return {
    file,
    crystallineClarity: clarity,
    vibrationQuality: quality,
    resonancePurity: purity,
    structureStrength: strength,
    veinWisdom: wisdom,
    transmitting: { clarity, crystal: 'flawless-prism', hasHighClarity: clarity >= 60, hasReadable: true, hasNoCryptic: true, hasSelfDocumenting: true, hasNoMystery: true, hasClear: true, hasNoObfuscated: true, hasTransparent: true, hasUnderstandable: true, hasVisible: true, hasDirect: true, hasDocumented: true, hasIlluminated: true, hasOpen: true, hasRevealed: true, hasExpressive: true, crypticCount: 0, obfuscatedCount: 0 } as TransmittingMeasure,
    oscillating: { quality, frequency: 'atomic-precision', hasHighQuality: quality >= 60, hasConsistent: true, hasNoErratic: true, hasPredictable: true, hasTested: true, hasNoUntested: true, hasReliable: true, hasUniform: true, hasStable: true, hasPrecise: true, hasMeasured: true, hasRhythmic: true, hasHarmonious: true, hasDependable: true, hasDisciplined: true, hasCalibrated: true, erraticCount: 0, untestedCount: 0 } as OscillatingMeasure,
    resonating: { purity, signal: 'pure-tone', hasHighPurity: purity >= 60, hasTypeSafe: true, hasNoUnsafe: true, hasAccurate: true, hasNoApproximate: true, hasClean: true, hasConsistent: true, hasHonest: true, hasFaithful: true, hasExact: true, hasRefined: true, hasNoiseFree: true, hasUndistorted: true, hasPure: true, hasPolished: true, hasPrecise: true, unsafeCount: 0, approximateCount: 0 } as ResonatingMeasure,
    supporting: { strength, lattice: 'perfect-lattice', hasHighStrength: strength >= 60, hasWellStructured: true, hasNoChaotic: true, hasModular: true, hasNoMonolithic: true, hasOrganized: true, hasRobust: true, hasErrorHandled: true, hasDefensive: true, hasSolid: true, hasEnduring: true, hasEfficient: true, hasDurable: true, hasGrounded: true, hasFoundational: true, hasReinforced: true, chaoticCount: 0, monolithicCount: 0 } as SupportingMeasure,
    channeling: { wisdom, vein: 'mother-lode', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasProven: true, hasDeep: true, hasMature: true, hasPatterned: true, hasStrategic: true, hasInsightful: true, hasConnected: true, hasEvolved: true, hasReflective: true, hasWise: true, hasAccumulated: true, hasExperienced: true, hackedCount: 0, shallowCount: 0 } as ChannelingMeasure,
    condition: classifyQuartzCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<QuartzMeridianResult['stats']> = {}): QuartzMeridianResult['stats'] {
  return {
    totalFiles: 1,
    totalStrata: 1,
    avgCrystallineClarity: 80,
    avgVibrationQuality: 80,
    avgResonancePurity: 80,
    avgStructureStrength: 80,
    avgVeinWisdom: 80,
    quartzMasterpieceCount: 0,
    perfectCrystalCount: 1,
    properMineralCount: 0,
    cloudyStoneCount: 0,
    crackedRockCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighQualityCount: 1,
    hasHighPurityCount: 1,
    hasHighStrengthCount: 1,
    hasHighWisdomCount: 1,
    overallLuminosity: 80,
    geologistGrade: 'crystal-reader' as GeologistGrade,
    bestCrystal: 'app.ts',
    clearest: 'app.ts',
    mostPrecise: 'app.ts',
    purest: 'app.ts',
    strongest: 'app.ts',
    wisest: 'app.ts',
    ...overrides,
  }
}

// ─── measureTransmitting ────────────────────────────────

describe('measureTransmitting', () => {
  it('scores rich content at max', () => {
    const result = measureTransmitting(richContent)
    expect(result.clarity).toBe(100)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureTransmitting(emptyContent).clarity).toBeLessThan(50)
  })

  it('detects cryptic patterns', () => {
    const result = measureTransmitting('cryptic obfuscated minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated var/eval', () => {
    const result = measureTransmitting('var x = eval("1")')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects readable code', () => { expect(measureTransmitting('class Foo {}').hasReadable).toBe(true) })
  it('detects self-documenting types', () => { expect(measureTransmitting('const x: string').hasSelfDocumenting).toBe(true) })
  it('penalizes any keyword', () => { expect(measureTransmitting('const x: any').hasClear).toBe(false) })
  it('detects transparent import/export', () => { expect(measureTransmitting('export {}').hasTransparent).toBe(true) })
  it('detects documented code', () => { expect(measureTransmitting('/** doc */').hasDocumented).toBe(true) })
  it('penalizes hack/workaround', () => { expect(measureTransmitting('hack workaround code').hasExpressive).toBe(false) })
})

// ─── measureOscillating ─────────────────────────────────

describe('measureOscillating', () => {
  it('scores rich content at max', () => {
    const result = measureOscillating(richContent)
    expect(result.quality).toBe(100)
    expect(result.hasHighQuality).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureOscillating(emptyContent).quality).toBeLessThan(50)
  })

  it('detects erratic patterns', () => {
    const result = measureOscillating('erratic unpredictable random flaky code')
    expect(result.erraticCount).toBeGreaterThan(0)
    expect(result.hasNoErratic).toBe(false)
  })

  it('detects untested eval/Function', () => {
    const result = measureOscillating('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects consistent types', () => { expect(measureOscillating('const x: string').hasConsistent).toBe(true) })
  it('detects tested try/catch', () => { expect(measureOscillating('try { x } catch { y }').hasTested).toBe(true) })
  it('penalizes any keyword', () => { expect(measureOscillating('const x: any').hasReliable).toBe(false) })
  it('detects stable class/interface', () => { expect(measureOscillating('class Foo {}').hasStable).toBe(true) })
  it('detects disciplined (no var/eval)', () => { expect(measureOscillating('const x = 1').hasDisciplined).toBe(true) })
  it('penalizes var/eval', () => { expect(measureOscillating('var x = eval("1")').hasDisciplined).toBe(false) })
})

// ─── measureResonating ──────────────────────────────────

describe('measureResonating', () => {
  it('scores rich content at max', () => {
    const result = measureResonating(richContent)
    expect(result.purity).toBe(100)
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureResonating(emptyContent).purity).toBeLessThan(50)
  })

  it('detects unsafe patterns', () => {
    const result = measureResonating('const x: any = 1')
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const result = measureResonating('approximate rough guess hack')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects type-safe annotations', () => { expect(measureResonating('const x: string').hasTypeSafe).toBe(true) })
  it('detects exact class/interface', () => { expect(measureResonating('class Foo {}').hasExact).toBe(true) })
  it('detects honest code (no hack)', () => { expect(measureResonating('const x = 1').hasHonest).toBe(true) })
  it('penalizes any keyword', () => { expect(measureResonating('const x: any').hasAccurate).toBe(false) })
  it('detects noise-free (no var/eval)', () => { expect(measureResonating('const x = 1').hasNoiseFree).toBe(true) })
  it('detects polished async/await', () => { expect(measureResonating('async function f() { await g() }').hasPolished).toBe(true) })
})

// ─── measureSupporting ──────────────────────────────────

describe('measureSupporting', () => {
  it('scores rich content at max', () => {
    const result = measureSupporting(richContent)
    expect(result.strength).toBe(100)
    expect(result.hasHighStrength).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureSupporting(emptyContent).strength).toBeLessThan(50)
  })

  it('detects chaotic patterns', () => {
    const result = measureSupporting('var x = eval("1")')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const result = measureSupporting('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects well-structured class/interface', () => { expect(measureSupporting('class Foo {}').hasWellStructured).toBe(true) })
  it('detects modular import/export', () => { expect(measureSupporting('export {}').hasModular).toBe(true) })
  it('detects error handling', () => { expect(measureSupporting('try { x } catch { y }').hasErrorHandled).toBe(true) })
  it('detects defensive types', () => { expect(measureSupporting('const x: string').hasDefensive).toBe(true) })
  it('penalizes any keyword', () => { expect(measureSupporting('const x: any').hasRobust).toBe(false) })
  it('detects grounded (no global)', () => { expect(measureSupporting('const x = 1').hasGrounded).toBe(true) })
})

// ─── measureChanneling ──────────────────────────────────

describe('measureChanneling', () => {
  it('scores rich content at max', () => {
    const result = measureChanneling(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureChanneling(emptyContent).wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureChanneling('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureChanneling('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects well-architected', () => { expect(measureChanneling('class Foo {}').hasWellArchitected).toBe(true) })
  it('detects proven try/catch', () => { expect(measureChanneling('try { x } catch { y }').hasProven).toBe(true) })
  it('detects deep types', () => { expect(measureChanneling('const x: string').hasDeep).toBe(true) })
  it('detects strategic docs', () => { expect(measureChanneling('/** doc */').hasStrategic).toBe(true) })
  it('penalizes any keyword', () => { expect(measureChanneling('const x: any').hasPrincipled).toBe(false) })
  it('penalizes var/eval', () => { expect(measureChanneling('var x = eval("1")').hasWise).toBe(false) })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyQuartzCondition', () => {
  it('returns quartz-masterpiece for 90+', () => { expect(classifyQuartzCondition(95)).toBe('quartz-masterpiece') })
  it('returns perfect-crystal for 75-89', () => { expect(classifyQuartzCondition(80)).toBe('perfect-crystal') })
  it('returns proper-mineral for 60-74', () => { expect(classifyQuartzCondition(65)).toBe('proper-mineral') })
  it('returns cloudy-stone for 40-59', () => { expect(classifyQuartzCondition(50)).toBe('cloudy-stone') })
  it('returns cracked-rock for 20-39', () => { expect(classifyQuartzCondition(30)).toBe('cracked-rock') })
  it('returns void below 20', () => { expect(classifyQuartzCondition(10)).toBe('void') })
})

describe('classifyStratumType', () => {
  it('returns no-stratum for empty', () => { expect(classifyStratumType([])).toBe('no-stratum') })
  it('returns crystal-cathedral for high', () => { expect(classifyStratumType([makeCrystal('a.ts', 90, 90, 90, 90, 90)])).toBe('crystal-cathedral') })
  it('returns quartz-stratum for medium-high', () => { expect(classifyStratumType([makeCrystal('a.ts', 75, 75, 75, 75, 75)])).toBe('quartz-stratum') })
  it('returns proper-layer for medium', () => { expect(classifyStratumType([makeCrystal('a.ts', 60, 60, 60, 60, 60)])).toBe('proper-layer') })
  it('returns thin-seam for low', () => { expect(classifyStratumType([makeCrystal('a.ts', 40, 40, 40, 40, 40)])).toBe('thin-seam') })
  it('returns barren-rock for very low', () => { expect(classifyStratumType([makeCrystal('a.ts', 20, 20, 20, 20, 20)])).toBe('barren-rock') })
})

describe('classifyStratumCondition', () => {
  it('returns crystal-canyon for 85+', () => { expect(classifyStratumCondition(90)).toBe('crystal-canyon') })
  it('returns quartz-ridge for 70-84', () => { expect(classifyStratumCondition(75)).toBe('quartz-ridge') })
  it('returns proper-formation for 55-69', () => { expect(classifyStratumCondition(60)).toBe('proper-formation') })
  it('returns dull-outcrop for 35-54', () => { expect(classifyStratumCondition(40)).toBe('dull-outcrop') })
  it('returns rubble for 15-34', () => { expect(classifyStratumCondition(20)).toBe('rubble') })
  it('returns void below 15', () => { expect(classifyStratumCondition(5)).toBe('void') })
})

describe('classifyGeologistGrade', () => {
  it('returns master-geologist for 80+', () => { expect(classifyGeologistGrade(85)).toBe('master-geologist') })
  it('returns crystal-reader for 65-79', () => { expect(classifyGeologistGrade(70)).toBe('crystal-reader') })
  it('returns proper-miner for 50-64', () => { expect(classifyGeologistGrade(55)).toBe('proper-miner') })
  it('returns apprentice for 35-49', () => { expect(classifyGeologistGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyGeologistGrade(25)).toBe('novice') })
  it('returns rock-basher below 20', () => { expect(classifyGeologistGrade(10)).toBe('rock-basher') })
})

// ─── analyzeQuartzCrystal ───────────────────────────────

describe('analyzeQuartzCrystal', () => {
  it('returns full QuartzCrystal for rich content', () => {
    const result = analyzeQuartzCrystal(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.crystallineClarity).toBeGreaterThan(0)
    expect(result.vibrationQuality).toBeGreaterThan(0)
    expect(result.resonancePurity).toBeGreaterThan(0)
    expect(result.structureStrength).toBeGreaterThan(0)
    expect(result.veinWisdom).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
  })

  it('scores poor content low', () => {
    expect(analyzeQuartzCrystal(poorContent, 'bad.ts').qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted', () => {
    const result = analyzeQuartzCrystal(richContent, 'test.ts')
    const expected = Math.round(
      result.crystallineClarity * 0.2 + result.vibrationQuality * 0.2 +
      result.resonancePurity * 0.2 + result.structureStrength * 0.2 + result.veinWisdom * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── analyzeQuartzStratum ───────────────────────────────

describe('analyzeQuartzStratum', () => {
  it('returns empty stratum for no crystals', () => {
    const result = analyzeQuartzStratum([], 'src')
    expect(result.directory).toBe('src')
    expect(result.crystals).toHaveLength(0)
    expect(result.stratumType).toBe('no-stratum')
    expect(result.condition).toBe('void')
  })

  it('aggregates crystal scores', () => {
    const crystals = [makeCrystal('a.ts', 80, 80, 80, 80, 80), makeCrystal('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeQuartzStratum(crystals, 'src')
    expect(result.avgClarity).toBe(70)
    expect(result.avgStrength).toBe(70)
    expect(result.avgWisdom).toBe(70)
  })

  it('counts masterpiece and void', () => {
    const masterpiece = makeCrystal('a.ts', 95, 95, 95, 95, 95)
    const voidC = makeCrystal('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeQuartzStratum([masterpiece, voidC], 'src')
    expect(result.quartzMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildQuartzMeridianResult ──────────────────────────

describe('buildQuartzMeridianResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildQuartzMeridianResult(['app.ts'], [richContent])
    expect(result.crystals).toHaveLength(1)
    expect(result.strata).toHaveLength(1)
    expect(result.geology.overallLuminosity).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildQuartzMeridianResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallLuminosity).toBe(0)
    expect(result.geology.isQuartz).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildQuartzMeridianResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.strata.length).toBe(2)
    expect(result.stats.totalStrata).toBe(2)
  })

  it('computes geologist grade', async () => {
    const result = await buildQuartzMeridianResult(['a.ts'], [richContent])
    expect(result.stats.geologistGrade).toBeDefined()
    expect(result.geology.isQuartz).toBe(result.geology.overallLuminosity >= 60)
  })

  it('finds extremes', async () => {
    const result = await buildQuartzMeridianResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestCrystal).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('scores rich content at max', async () => {
    const result = await buildQuartzMeridianResult(['perfect.ts'], [richContent])
    expect(result.crystals[0].crystallineClarity).toBe(100)
    expect(result.crystals[0].vibrationQuality).toBe(100)
    expect(result.crystals[0].resonancePurity).toBe(100)
    expect(result.crystals[0].structureStrength).toBe(100)
    expect(result.crystals[0].veinWisdom).toBe(100)
    expect(result.crystals[0].qualityScore).toBe(100)
  })

  it('handles mixed content', async () => {
    const result = await buildQuartzMeridianResult(['good.ts', 'bad.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.crystals).toHaveLength(2)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', () => {
    const crystals = [makeCrystal('a.ts', 95, 95, 95, 95, 95)]
    const strata: QuartzStratumType[] = []
    const geology = { avgClarity: 95, avgStrength: 95, avgWisdom: 95, isQuartz: true, overallLuminosity: 95 }
    const stats = makeStats({ avgCrystallineClarity: 95, avgVibrationQuality: 95, avgResonancePurity: 95, avgStructureStrength: 95, avgVeinWisdom: 95, overallLuminosity: 95 })
    const recs = generateRecommendations(crystals, strata, geology, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends improving clarity when low', () => {
    const crystals = [makeCrystal('a.ts', 50, 90, 90, 90, 90)]
    const stats = makeStats({ avgCrystallineClarity: 50, avgVibrationQuality: 90, avgResonancePurity: 90, avgStructureStrength: 90, avgVeinWisdom: 90, overallLuminosity: 82 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 50, avgStrength: 90, avgWisdom: 90, isQuartz: true, overallLuminosity: 82 }, stats)
    expect(recs.some((r) => r.includes('crystal clarity'))).toBe(true)
  })

  it('recommends improving vibration when low', () => {
    const crystals = [makeCrystal('a.ts', 90, 50, 90, 90, 90)]
    const stats = makeStats({ avgCrystallineClarity: 90, avgVibrationQuality: 50, avgResonancePurity: 90, avgStructureStrength: 90, avgVeinWisdom: 90, overallLuminosity: 82 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 90, avgStrength: 90, avgWisdom: 90, isQuartz: true, overallLuminosity: 82 }, stats)
    expect(recs.some((r) => r.includes('vibration quality'))).toBe(true)
  })

  it('recommends improving purity when low', () => {
    const crystals = [makeCrystal('a.ts', 90, 90, 50, 90, 90)]
    const stats = makeStats({ avgCrystallineClarity: 90, avgVibrationQuality: 90, avgResonancePurity: 50, avgStructureStrength: 90, avgVeinWisdom: 90, overallLuminosity: 82 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 90, avgStrength: 90, avgWisdom: 90, isQuartz: true, overallLuminosity: 82 }, stats)
    expect(recs.some((r) => r.includes('resonance signal'))).toBe(true)
  })

  it('recommends improving strength when low', () => {
    const crystals = [makeCrystal('a.ts', 90, 90, 90, 50, 90)]
    const stats = makeStats({ avgCrystallineClarity: 90, avgVibrationQuality: 90, avgResonancePurity: 90, avgStructureStrength: 50, avgVeinWisdom: 90, overallLuminosity: 82 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 90, avgStrength: 50, avgWisdom: 90, isQuartz: true, overallLuminosity: 82 }, stats)
    expect(recs.some((r) => r.includes('crystal lattice'))).toBe(true)
  })

  it('recommends improving wisdom when low', () => {
    const crystals = [makeCrystal('a.ts', 90, 90, 90, 90, 50)]
    const stats = makeStats({ avgCrystallineClarity: 90, avgVibrationQuality: 90, avgResonancePurity: 90, avgStructureStrength: 90, avgVeinWisdom: 50, overallLuminosity: 82 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 90, avgStrength: 90, avgWisdom: 50, isQuartz: true, overallLuminosity: 82 }, stats)
    expect(recs.some((r) => r.includes('wisdom veins'))).toBe(true)
  })

  it('warns about dark meridian when overall < 40', () => {
    const crystals = [makeCrystal('a.ts', 30, 30, 30, 30, 30)]
    const stats = makeStats({ avgCrystallineClarity: 30, avgVibrationQuality: 30, avgResonancePurity: 30, avgStructureStrength: 30, avgVeinWisdom: 30, overallLuminosity: 30 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 30, avgStrength: 30, avgWisdom: 30, isQuartz: false, overallLuminosity: 30 }, stats)
    expect(recs.some((r) => r.includes('gone dark'))).toBe(true)
  })

  it('lists void crystals when <= 5', () => {
    const crystals = [makeCrystal('a.ts', 5, 5, 5, 5, 5), makeCrystal('b.ts', 90, 90, 90, 90, 90)]
    const stats = makeStats({ overallLuminosity: 47 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 47, avgStrength: 47, avgWisdom: 47, isQuartz: false, overallLuminosity: 47 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many void crystals', () => {
    const crystals = Array.from({ length: 6 }, (_, i) => makeCrystal(`${i}.ts`, 5, 5, 5, 5, 5))
    const stats = makeStats({ overallLuminosity: 5, voidCount: 6 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 5, avgStrength: 5, avgWisdom: 5, isQuartz: false, overallLuminosity: 5 }, stats)
    expect(recs.some((r) => r.includes('6 cracked crystals'))).toBe(true)
  })

  it('warns about all collapsed strata', () => {
    const crystals = [makeCrystal('a.ts', 5, 5, 5, 5, 5)]
    const strata = [{ directory: 'src', crystals, avgClarity: 5, avgStrength: 5, avgWisdom: 5, quartzMasterpieceCount: 0, voidCount: 1, stratumType: 'barren-rock' as StratumType, condition: 'void' as StratumCondition }]
    const stats = makeStats({ overallLuminosity: 5 })
    const recs = generateRecommendations(crystals, strata, { avgClarity: 5, avgStrength: 5, avgWisdom: 5, isQuartz: false, overallLuminosity: 5 }, stats)
    expect(recs.some((r) => r.includes('All strata have collapsed'))).toBe(true)
  })

  it('returns positive when scores are good', () => {
    const crystals = [makeCrystal('a.ts', 80, 80, 80, 80, 80)]
    const stats = makeStats({ overallLuminosity: 80 })
    const recs = generateRecommendations(crystals, [], { avgClarity: 80, avgStrength: 80, avgWisdom: 80, isQuartz: true, overallLuminosity: 80 }, stats)
    expect(recs.some((r) => r.includes('conducts energy well'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for high score', () => { expect(typeof colorScore(95)).toBe('string') })
  it('returns string for low score', () => { expect(typeof colorScore(5)).toBe('string') })
  it('returns string for mid score', () => { expect(typeof colorScore(50)).toBe('string') })
})

describe('colorStratumCondition', () => {
  it('colors crystal-canyon', () => { expect(typeof colorStratumCondition('crystal-canyon')).toBe('string') })
  it('colors void', () => { expect(typeof colorStratumCondition('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof colorStratumCondition('unknown')).toBe('string') })
})

describe('formatCrystalTable', () => {
  it('formats single crystal', () => {
    const crystal = makeCrystal('app.ts', 80, 80, 80, 80, 80)
    const result = formatCrystalTable(crystal)
    expect(result).toContain('Quartz Crystal: app.ts')
    expect(result).toContain('Crystalline Clarity')
    expect(result).toContain('Quality Score')
  })
})

describe('formatCrystalsTable', () => {
  it('returns no-crystals message for empty', () => { expect(formatCrystalsTable([])).toContain('No quartz crystals') })
  it('formats multiple crystals', () => {
    const crystals = [makeCrystal('a.ts', 80, 80, 80, 80, 80), makeCrystal('b.ts', 60, 60, 60, 60, 60)]
    const result = formatCrystalsTable(crystals)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatStratumTable', () => {
  it('formats single stratum', () => {
    const stratum: QuartzStratumType = { directory: 'src', crystals: [], avgClarity: 80, avgStrength: 80, avgWisdom: 80, quartzMasterpieceCount: 1, voidCount: 0, stratumType: 'crystal-cathedral', condition: 'crystal-canyon' }
    const result = formatStratumTable(stratum)
    expect(result).toContain('Quartz Stratum: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatStrataTable', () => {
  it('returns no-strata for empty', () => { expect(formatStrataTable([])).toContain('No quartz strata') })
  it('formats multiple strata', () => {
    const strata = [
      { directory: 'src', crystals: [], avgClarity: 80, avgStrength: 80, avgWisdom: 80, quartzMasterpieceCount: 0, voidCount: 0, stratumType: 'quartz-stratum' as StratumType, condition: 'quartz-ridge' as StratumCondition },
      { directory: 'lib', crystals: [], avgClarity: 50, avgStrength: 50, avgWisdom: 50, quartzMasterpieceCount: 0, voidCount: 0, stratumType: 'proper-layer' as StratumType, condition: 'proper-formation' as StratumCondition },
    ]
    const result = formatStrataTable(strata)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Quartz Meridian Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Geologist Grade')
    expect(result).toContain('Best Crystal')
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
    const result = await buildQuartzMeridianResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Quartz Meridian Analysis')
    expect(table).toContain('Geological Overview')
    expect(table).toContain('Quartz Meridian Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildQuartzMeridianResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.crystals).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
