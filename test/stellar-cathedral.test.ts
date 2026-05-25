import { describe, it, expect } from 'vitest'
import {
  measureAscending,
  measureSanctifying,
  measureRevealing,
  measureCalibrating,
  measureTranscending,
  classifyStellarCondition,
  classifyNaveType,
  classifyNaveCondition,
  classifyArchitectGrade,
  analyzeStellarRadiance,
  analyzeStellarNave,
  generateRecommendations,
  buildStellarCathedralResult,
} from '../src/commands/stellar-cathedral-helpers.js'
import {
  colorScore,
  colorGrade,
  formatRadianceTable,
  formatRadiancesTable,
  formatNaveTable,
  formatNavesTable,
  formatStatsTable,
  formatCosmosTable,
  formatCelebration,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/stellar-cathedral-format-helpers.js'
import type { StellarRadiance, StellarNave, StellarCathedralResult } from '../src/commands/stellar-cathedral-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────

const RichContent = `/**
 * Rich module
 */
export interface Store<T> {
  get(key: string): T
  set(key: string, val: T): Void
}

export class DataStore<T> extends BaseStore implements IStore {
  private items: T[] = []
  abstract process(): Void

  async fetch(): Promise<T> {
    const result = await api.get<T>('/data')
    const mapped = result.items.map(i => i.value).filter(Boolean)
    return result
  }

  try {
    const data = this.parse(raw)
    if (data) {
      return data
    }
  } catch {
    return null
  }
}
`

const MinimalContent = `const x = 1`

const ToxicContent = `var x = eval("1 + 2")
var y = debugger
console.log("debug")
const z: any = null`

const EmptyContent = ``

function makeRadiance(overrides: Partial<StellarRadiance> = {}): StellarRadiance {
  const base: StellarRadiance = {
    file: 'test.ts',
    cosmicArchitecture: 80,
    starSanctity: 80,
    vaultClarity: 80,
    celestialPrecision: 80,
    dawnTranscendence: 80,
    ascending: {
      grandeur: 80, pillar: 'stellar-column', hasHighGrandeur: true,
      hasWellStructured: true, hasNoChaotic: true, hasModular: true,
      hasNoMonolithic: true, hasScalable: true, hasNoBottlenecked: true,
      hasCleanPipelines: true, hasNoTangled: true, hasEfficient: true,
      hasNoWasteful: true, hasOrganized: true, hasNoScattered: true,
      hasArchitectural: true, hasNoAdHoc: true, hasElegant: true,
      hasNoClunky: true, chaoticCount: 0, tangledCount: 0,
    },
    sanctifying: {
      sanctity: 80, star: 'sacred-flame', hasHighSanctity: true,
      hasPure: true, hasNoContaminated: true, hasClean: true,
      hasNoDirty: true, hasTypeSafe: true, hasNoUnsafe: true,
      hasTested: true, hasNoUntested: true, hasDocumented: true,
      hasNoUndocumented: true, hasReliable: true, hasNoFlaky: true,
      hasTrustworthy: true, hasNoDeceptive: true, hasHonest: true,
      hasNoMisleading: true, hasPrincipled: true, contaminatedCount: 0, untestedCount: 0,
    },
    revealing: {
      clarity: 80, vault: 'clear-arch', hasHighClarity: true,
      hasReadable: true, hasNoCryptic: true, hasSelfDocumenting: true,
      hasNoMystery: true, hasClear: true, hasNoObfuscated: true,
      hasTransparent: true, hasNoHidden: true, hasUnderstandable: true,
      hasNoArcane: true, hasVisible: true, hasNoInvisible: true,
      hasObvious: true, hasNoSubtle: true, hasRevealed: true,
      hasNoConcealed: true, hasOpen: true, crypticCount: 0, obfuscatedCount: 0,
    },
    calibrating: {
      precision: 80, measurement: 'quantum-precise', hasHighPrecision: true,
      hasAccurate: true, hasNoWrong: true, hasExact: true,
      hasNoApproximate: true, hasCorrect: true, hasNoBuggy: true,
      hasConsistent: true, hasNoErratic: true, hasTypeSafe: true,
      hasNoCasting: true, hasValidated: true, hasNoAssumed: true,
      hasVerified: true, hasNoUnchecked: true, hasReliable: true,
      hasNoUnpredictable: true, hasDeterministic: true, wrongCount: 0, buggyCount: 0,
    },
    transcending: {
      transcendence: 80, dawn: 'stellar-sunrise', hasHighTranscendence: true,
      hasInnovative: true, hasNoStagnant: true, hasVisionary: true,
      hasNoShortSighted: true, hasExtensible: true, hasNoRigid: true,
      hasFutureProof: true, hasNoBrittle: true, hasAdaptive: true,
      hasNoStatic: true, hasEvolving: true, hasNoFrozen: true,
      hasProgressive: true, hasNoRegressive: true, hasTransformative: true,
      hasNoDestructive: true, hasAscending: true, stagnantCount: 0, rigidCount: 0,
    },
    condition: 'cosmic-temple',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<StellarCathedralResult['stats']> = {}): StellarCathedralResult['stats'] {
  return {
    totalFiles: 1, totalNaves: 1,
    avgCosmicArchitecture: 80, avgStarSanctity: 80, avgVaultClarity: 80,
    avgCelestialPrecision: 80, avgDawnTranscendence: 80,
    stellarMasterpieceCount: 0, cosmicTempleCount: 1, properSanctuaryCount: 0,
    fadingChapelCount: 0, darkRuinCount: 0, voidCount: 0,
    hasHighGrandeurCount: 1, hasHighSanctityCount: 1, hasHighClarityCount: 1,
    hasHighPrecisionCount: 1, hasHighTranscendenceCount: 1,
    overallBrilliance: 80, architectGrade: 'stellar-builder',
    bestRadiance: 'test.ts', mostGrand: 'test.ts', mostSacred: 'test.ts',
    clearest: 'test.ts', mostPrecise: 'test.ts', mostTranscendent: 'test.ts',
    ...overrides,
  }
}

// ─── measureAscending ─────────────────────────────────────────────

describe('measureAscending', () => {
  it('returns a valid AscendingMeasure', () => {
    const m = measureAscending(RichContent)
    expect(m).toHaveProperty('grandeur')
    expect(m).toHaveProperty('pillar')
    expect(m).toHaveProperty('chaoticCount')
    expect(m).toHaveProperty('tangledCount')
  })

  it('scores rich content higher than minimal', () => {
    expect(measureAscending(RichContent).grandeur).toBeGreaterThan(measureAscending(MinimalContent).grandeur)
  })

  it('penalizes toxic content', () => {
    expect(measureAscending(ToxicContent).grandeur).toBeLessThan(20)
  })

  it('scores empty as 0', () => {
    expect(measureAscending(EmptyContent).grandeur).toBe(0)
  })

  it('detects var as chaotic', () => {
    expect(measureAscending('var x = 1').chaoticCount).toBeGreaterThanOrEqual(1)
  })

  it('detects eval as tangled', () => {
    expect(measureAscending('eval("x")').tangledCount).toBeGreaterThanOrEqual(1)
  })

  it('detects generics + extends as scalable', () => {
    expect(measureAscending('interface Foo<T> extends Base {}').hasScalable).toBe(true)
  })

  it('detects interface + class as modular', () => {
    expect(measureAscending('interface Foo {} class Bar implements Foo {}').hasModular).toBe(true)
  })
})

// ─── measureSanctifying ──────────────────────────────────────────

describe('measureSanctifying', () => {
  it('returns a valid SanctifyingMeasure', () => {
    const m = measureSanctifying(RichContent)
    expect(m).toHaveProperty('sanctity')
    expect(m).toHaveProperty('star')
    expect(m).toHaveProperty('contaminatedCount')
    expect(m).toHaveProperty('untestedCount')
  })

  it('penalizes eval as contaminated', () => {
    expect(measureSanctifying('eval("1")').contaminatedCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes debugger as untested', () => {
    expect(measureSanctifying('debugger').untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('detects docs as documented', () => {
    expect(measureSanctifying('/** docs */').hasDocumented).toBe(true)
  })

  it('detects try-catch as tested', () => {
    expect(measureSanctifying('try { } catch { }').hasTested).toBe(true)
  })

  it('detects const + returnType as trustworthy', () => {
    expect(measureSanctifying('const fn = (): Void => {}').hasTrustworthy).toBe(true)
  })

  it('detects ts-ignore as deceptive', () => {
    expect(measureSanctifying('// @ts-ignore').hasNoDeceptive).toBe(false)
  })

  it('scores empty as 0', () => {
    expect(measureSanctifying(EmptyContent).sanctity).toBe(0)
  })
})

// ─── measureRevealing ────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns a valid RevealingMeasure', () => {
    const m = measureRevealing(RichContent)
    expect(m).toHaveProperty('clarity')
    expect(m).toHaveProperty('vault')
    expect(m).toHaveProperty('crypticCount')
    expect(m).toHaveProperty('obfuscatedCount')
  })

  it('penalizes var and any as cryptic', () => {
    const m = measureRevealing('var x: any = 1')
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
  })

  it('detects export + named as self-documenting', () => {
    expect(measureRevealing('export function foo(): Void {}').hasSelfDocumenting).toBe(true)
  })

  it('detects doc + const as readable', () => {
    expect(measureRevealing('/** docs */\nconst x = 1').hasReadable).toBe(true)
  })

  it('detects arrow + const as clear', () => {
    expect(measureRevealing('const fn = (): Void => {}').hasClear).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureRevealing(EmptyContent).clarity).toBe(0)
  })
})

// ─── measureCalibrating ──────────────────────────────────────────

describe('measureCalibrating', () => {
  it('returns a valid CalibratingMeasure', () => {
    const m = measureCalibrating(RichContent)
    expect(m).toHaveProperty('precision')
    expect(m).toHaveProperty('measurement')
    expect(m).toHaveProperty('wrongCount')
    expect(m).toHaveProperty('buggyCount')
  })

  it('penalizes eval as wrong', () => {
    expect(measureCalibrating('eval("x")').wrongCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes var as buggy', () => {
    expect(measureCalibrating('var x = 1').buggyCount).toBeGreaterThanOrEqual(1)
  })

  it('detects strict equality as exact', () => {
    expect(measureCalibrating('if (x === 1): Void {}').hasExact).toBe(true)
  })

  it('detects try + throw as validated', () => {
    expect(measureCalibrating('try { throw new Error() } catch { }').hasValidated).toBe(true)
  })

  it('detects debugger as erratic', () => {
    expect(measureCalibrating('debugger').hasNoErratic).toBe(false)
  })

  it('scores empty as 0', () => {
    expect(measureCalibrating(EmptyContent).precision).toBe(0)
  })
})

// ─── measureTranscending ─────────────────────────────────────────

describe('measureTranscending', () => {
  it('returns a valid TranscendingMeasure', () => {
    const m = measureTranscending(RichContent)
    expect(m).toHaveProperty('transcendence')
    expect(m).toHaveProperty('dawn')
    expect(m).toHaveProperty('stagnantCount')
    expect(m).toHaveProperty('rigidCount')
  })

  it('penalizes eval + any as stagnant', () => {
    expect(measureTranscending('const x: any = eval("1")').stagnantCount).toBeGreaterThanOrEqual(2)
  })

  it('detects abstract + generics as innovative', () => {
    expect(measureTranscending('abstract class Foo<T> {}').hasInnovative).toBe(true)
  })

  it('detects abstract + extends as visionary', () => {
    expect(measureTranscending('abstract class Foo extends Base {}').hasVisionary).toBe(true)
  })

  it('detects promise + async as progressive', () => {
    expect(measureTranscending('async function fetch(): Promise<Void> {}').hasProgressive).toBe(true)
  })

  it('detects abstract + extends + implements as ascending', () => {
    expect(measureTranscending('abstract class Foo extends Base implements IBaz {}').hasAscending).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureTranscending(EmptyContent).transcendence).toBe(0)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyStellarCondition', () => {
  it('classifies 90+ as stellar-masterpiece', () => { expect(classifyStellarCondition(90)).toBe('stellar-masterpiece') })
  it('classifies 75-89 as cosmic-temple', () => { expect(classifyStellarCondition(75)).toBe('cosmic-temple') })
  it('classifies 60-74 as proper-sanctuary', () => { expect(classifyStellarCondition(60)).toBe('proper-sanctuary') })
  it('classifies 40-59 as fading-chapel', () => { expect(classifyStellarCondition(40)).toBe('fading-chapel') })
  it('classifies 20-39 as dark-ruin', () => { expect(classifyStellarCondition(20)).toBe('dark-ruin') })
  it('classifies 0-19 as void', () => { expect(classifyStellarCondition(0)).toBe('void') })
})

describe('classifyNaveType', () => {
  it('returns no-nave for empty', () => { expect(classifyNaveType([])).toBe('no-nave') })
  it('returns cosmic-cathedral for high avg', () => {
    const rs = [makeRadiance({ qualityScore: 90 }), makeRadiance({ qualityScore: 90 })]
    expect(classifyNaveType(rs)).toBe('cosmic-cathedral')
  })
  it('returns no-nave for very low', () => {
    const rs = [makeRadiance({ qualityScore: 5 }), makeRadiance({ qualityScore: 5 })]
    expect(classifyNaveType(rs)).toBe('no-nave')
  })
})

describe('classifyNaveCondition', () => {
  it('classifies 85+ as galactic-basilica', () => { expect(classifyNaveCondition(85)).toBe('galactic-basilica') })
  it('classifies 70-84 as stellar-sanctuary', () => { expect(classifyNaveCondition(70)).toBe('stellar-sanctuary') })
  it('classifies 55-69 as proper-temple', () => { expect(classifyNaveCondition(55)).toBe('proper-temple') })
  it('classifies 35-54 as dim-chapel', () => { expect(classifyNaveCondition(35)).toBe('dim-chapel') })
  it('classifies 15-34 as dark-ruin', () => { expect(classifyNaveCondition(15)).toBe('dark-ruin') })
  it('classifies 0-14 as void', () => { expect(classifyNaveCondition(0)).toBe('void') })
})

describe('classifyArchitectGrade', () => {
  it('classifies 85+ as cosmic-architect', () => { expect(classifyArchitectGrade(85)).toBe('cosmic-architect') })
  it('classifies 70-84 as stellar-builder', () => { expect(classifyArchitectGrade(70)).toBe('stellar-builder') })
  it('classifies 55-69 as temple-artisan', () => { expect(classifyArchitectGrade(55)).toBe('temple-artisan') })
  it('classifies 40-54 as apprentice', () => { expect(classifyArchitectGrade(40)).toBe('apprentice') })
  it('classifies 20-39 as novice', () => { expect(classifyArchitectGrade(20)).toBe('novice') })
  it('classifies 0-19 as void-dweller', () => { expect(classifyArchitectGrade(0)).toBe('void-dweller') })
})

// ─── analyzeStellarRadiance ───────────────────────────────────────

describe('analyzeStellarRadiance', () => {
  it('returns a full StellarRadiance', () => {
    const r = analyzeStellarRadiance(RichContent, 'rich.ts')
    expect(r.file).toBe('rich.ts')
    expect(r.cosmicArchitecture).toBeGreaterThan(0)
    expect(r.qualityScore).toBeGreaterThan(0)
    expect(r.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average', () => {
    const r = analyzeStellarRadiance(RichContent, 'test.ts')
    const expected = Math.round(
      r.cosmicArchitecture * 0.2 + r.starSanctity * 0.2 +
      r.vaultClarity * 0.2 + r.celestialPrecision * 0.2 + r.dawnTranscendence * 0.2,
    )
    expect(r.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    expect(analyzeStellarRadiance(EmptyContent, 'empty.ts').condition).toBe('void')
  })

  it('handles toxic content gracefully', () => {
    expect(analyzeStellarRadiance(ToxicContent, 'bad.ts').qualityScore).toBeLessThan(30)
  })

  it('assigns correct pillar types', () => {
    expect(analyzeStellarRadiance(EmptyContent, 'e.ts').ascending.pillar).toBe('no-architecture')
  })

  it('assigns correct star types', () => {
    expect(analyzeStellarRadiance(EmptyContent, 'e.ts').sanctifying.star).toBe('no-sanctity')
  })
})

// ─── analyzeStellarNave ──────────────────────────────────────────

describe('analyzeStellarNave', () => {
  it('returns empty nave for no radiances', () => {
    const n = analyzeStellarNave([], 'empty-dir')
    expect(n.radiances).toHaveLength(0)
    expect(n.naveType).toBe('no-nave')
    expect(n.condition).toBe('void')
  })

  it('aggregates radiance data correctly', () => {
    const rs = [
      makeRadiance({ cosmicArchitecture: 80, celestialPrecision: 70, dawnTranscendence: 60 }),
      makeRadiance({ cosmicArchitecture: 60, celestialPrecision: 50, dawnTranscendence: 40 }),
    ]
    const n = analyzeStellarNave(rs, 'src')
    expect(n.avgGrandeur).toBe(70)
    expect(n.avgPrecision).toBe(60)
    expect(n.avgTranscendence).toBe(50)
  })

  it('counts stellar and void', () => {
    const rs = [
      makeRadiance({ condition: 'stellar-masterpiece' }),
      makeRadiance({ condition: 'void' }),
      makeRadiance({ condition: 'cosmic-temple' }),
    ]
    const n = analyzeStellarNave(rs, 'src')
    expect(n.stellarMasterpieceCount).toBe(1)
    expect(n.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ─────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high brilliance with no void', () => {
    const stats = makeStats({ overallBrilliance: 90, voidCount: 0 })
    const cosmos = { avgGrandeur: 90, avgPrecision: 90, avgTranscendence: 90, isStellar: true, overallBrilliance: 90 }
    const recs = generateRecommendations([makeRadiance()], [], cosmos, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends architecture when grandeur low', () => {
    const stats = makeStats({ avgCosmicArchitecture: 40, overallBrilliance: 40 })
    const cosmos = { avgGrandeur: 40, avgPrecision: 80, avgTranscendence: 80, isStellar: false, overallBrilliance: 40 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('architecture') || r.includes('grandeur'))).toBe(true)
  })

  it('recommends sanctity when purity low', () => {
    const stats = makeStats({ avgStarSanctity: 30, overallBrilliance: 30 })
    const cosmos = { avgGrandeur: 80, avgPrecision: 80, avgTranscendence: 80, isStellar: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('sanctity') || r.includes('purify'))).toBe(true)
  })

  it('recommends clarity when vault low', () => {
    const stats = makeStats({ avgVaultClarity: 30, overallBrilliance: 30 })
    const cosmos = { avgGrandeur: 80, avgPrecision: 80, avgTranscendence: 80, isStellar: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('clarity') || r.includes('vault'))).toBe(true)
  })

  it('recommends precision when celestial low', () => {
    const stats = makeStats({ avgCelestialPrecision: 30, overallBrilliance: 30 })
    const cosmos = { avgGrandeur: 80, avgPrecision: 30, avgTranscendence: 80, isStellar: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('precision') || r.includes('calibrat'))).toBe(true)
  })

  it('recommends transcendence when dawn low', () => {
    const stats = makeStats({ avgDawnTranscendence: 30, overallBrilliance: 30 })
    const cosmos = { avgGrandeur: 80, avgPrecision: 80, avgTranscendence: 30, isStellar: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('transcend') || r.includes('dawn'))).toBe(true)
  })

  it('mentions void files when present', () => {
    const rs = [makeRadiance({ condition: 'void', file: 'bad.ts' })]
    const stats = makeStats({ voidCount: 1, overallBrilliance: 30 })
    const cosmos = { avgGrandeur: 40, avgPrecision: 40, avgTranscendence: 40, isStellar: false, overallBrilliance: 30 }
    const recs = generateRecommendations(rs, [], cosmos, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many void as count', () => {
    const rs = Array.from({ length: 5 }, (_, i) => makeRadiance({ condition: 'void', file: `bad${i}.ts` }))
    const stats = makeStats({ voidCount: 5, overallBrilliance: 10 })
    const cosmos = { avgGrandeur: 10, avgPrecision: 10, avgTranscendence: 10, isStellar: false, overallBrilliance: 10 }
    const recs = generateRecommendations(rs, [], cosmos, stats)
    expect(recs.some(r => r.includes('darkness') || r.includes('5'))).toBe(true)
  })

  it('mentions dim naves', () => {
    const nave: StellarNave = {
      directory: 'src', radiances: [], avgGrandeur: 30, avgPrecision: 30, avgTranscendence: 30,
      stellarMasterpieceCount: 0, voidCount: 0, naveType: 'dark-crypt', condition: 'dim-chapel',
    }
    const stats = makeStats({ overallBrilliance: 50 })
    const cosmos = { avgGrandeur: 50, avgPrecision: 50, avgTranscendence: 50, isStellar: false, overallBrilliance: 50 }
    const recs = generateRecommendations([], [nave], cosmos, stats)
    expect(recs.some(r => r.includes('nave'))).toBe(true)
  })

  it('returns cosmic discipline message when all good', () => {
    const stats = makeStats({ overallBrilliance: 80, voidCount: 0, avgCosmicArchitecture: 80, avgStarSanctity: 80, avgVaultClarity: 80, avgCelestialPrecision: 80, avgDawnTranscendence: 80 })
    const cosmos = { avgGrandeur: 80, avgPrecision: 80, avgTranscendence: 80, isStellar: true, overallBrilliance: 80 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('stellar') || r.includes('cosmic') || r.includes('brilliance'))).toBe(true)
  })
})

// ─── buildStellarCathedralResult ──────────────────────────────────

describe('buildStellarCathedralResult', () => {
  it('returns a complete result', async () => {
    const result = await buildStellarCathedralResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.radiances).toHaveLength(2)
    expect(result.naves.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.cosmos.overallBrilliance).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildStellarCathedralResult([], [])
    expect(result.radiances).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
  })

  it('computes overallBrilliance as avg of 5 measures', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgCosmicArchitecture + result.stats.avgStarSanctity +
        result.stats.avgVaultClarity + result.stats.avgCelestialPrecision +
        result.stats.avgDawnTranscendence) / 5,
    )
    expect(result.stats.overallBrilliance).toBe(expected)
  })

  it('finds best radiance correctly', async () => {
    const result = await buildStellarCathedralResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestRadiance).toBe('good.ts')
  })

  it('groups files into naves by directory', async () => {
    const result = await buildStellarCathedralResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.naves.length).toBe(2)
  })

  it('includes celebration with milestone 550', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [RichContent])
    expect(result.celebration.milestone).toBe(550)
    expect(result.celebration.name).toBe('Stellar Cathedral')
    expect(result.celebration.message).toContain('550')
  })

  it('sets cosmos isStellar when brilliance >= 80', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [RichContent])
    if (result.cosmos.overallBrilliance >= 80) {
      expect(result.cosmos.isStellar).toBe(true)
    }
  })

  it('assigns architect grade correctly', async () => {
    const result = await buildStellarCathedralResult([], [])
    expect(result.stats.architectGrade).toBe('void-dweller')
  })

  it('tracks mostGrand, mostSacred, clearest correctly', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [RichContent])
    expect(result.stats.mostGrand).toBe('a.ts')
    expect(result.stats.mostSacred).toBe('a.ts')
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.mostTranscendent).toBe('a.ts')
  })

  it('counts condition categories correctly', async () => {
    const result = await buildStellarCathedralResult(['a.ts', 'b.ts'], [RichContent, EmptyContent])
    const total = result.stats.stellarMasterpieceCount + result.stats.cosmicTempleCount +
      result.stats.properSanctuaryCount + result.stats.fadingChapelCount +
      result.stats.darkRuinCount + result.stats.voidCount
    expect(total).toBe(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for stellar-masterpiece', () => { expect(typeof colorGrade('stellar-masterpiece')).toBe('string') })
  it('returns string for void', () => { expect(typeof colorGrade('void')).toBe('string') })
})

describe('formatRadianceTable', () => {
  it('formats a radiance', () => {
    const out = formatRadianceTable(makeRadiance())
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
  })
})

describe('formatRadiancesTable', () => {
  it('returns message for empty', () => { expect(formatRadiancesTable([])).toContain('No stellar') })
  it('formats multiple radiances', () => {
    const out = formatRadiancesTable([makeRadiance(), makeRadiance({ file: 'other.ts' })])
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatNaveTable', () => {
  it('formats a nave', () => {
    const nave: StellarNave = {
      directory: 'src', radiances: [makeRadiance()], avgGrandeur: 80, avgPrecision: 70, avgTranscendence: 60,
      stellarMasterpieceCount: 1, voidCount: 0, naveType: 'stellar-temple', condition: 'stellar-sanctuary',
    }
    const out = formatNaveTable(nave)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatNavesTable', () => {
  it('returns message for empty', () => { expect(formatNavesTable([])).toContain('No stellar') })
})

describe('formatStatsTable', () => {
  it('formats stats', () => {
    const out = formatStatsTable(makeStats())
    expect(out).toContain('Stellar Cathedral Statistics')
    expect(out).toContain('Total Files')
  })
})

describe('formatCosmosTable', () => {
  it('formats cosmos', () => {
    const cosmos = { avgGrandeur: 80, avgPrecision: 70, avgTranscendence: 60, isStellar: true, overallBrilliance: 70 }
    const out = formatCosmosTable(cosmos)
    expect(out).toContain('Cosmos Overview')
  })
})

describe('formatCelebration', () => {
  it('formats celebration', () => {
    const celebration = { milestone: 550, name: 'Stellar Cathedral', message: 'Test message' }
    const out = formatCelebration(celebration)
    expect(out).toContain('550')
    expect(out).toContain('Stellar Cathedral')
  })
})

describe('formatRecommendations', () => {
  it('returns no recs for empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recs as bullets', () => {
    const out = formatRecommendations(['Improve code', 'Add docs'])
    expect(out).toContain('Improve code')
    expect(out).toContain('Add docs')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Stellar Cathedral Analysis')
    expect(out).toContain('Stellar Radiances')
    expect(out).toContain('Stellar Naves')
    expect(out).toContain('Cosmos Overview')
    expect(out).toContain('Stellar Cathedral Statistics')
    expect(out).toContain('Recommendations')
    expect(out).toContain('Milestone #550')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [RichContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.radiances).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.cosmos).toBeTruthy()
    expect(parsed.celebration).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })

  it('includes celebration in JSON', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [RichContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.celebration.milestone).toBe(550)
  })
})
