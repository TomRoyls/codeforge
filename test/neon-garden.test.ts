import { describe, it, expect } from 'vitest'
import {
  measureShining,
  measurePulsing,
  measureRadiating,
  measureDiversifying,
  measureGrounding,
  classifyNeonCondition,
  classifyBedType,
  classifyBedCondition,
  classifyGardenerGrade,
  analyzeNeonBloom,
  analyzeNeonBed,
  generateRecommendations,
  buildNeonGardenResult,
} from '../src/commands/neon-garden-helpers.js'
import {
  colorScore,
  colorGrade,
  formatBloomTable,
  formatBloomsTable,
  formatBedTable,
  formatBedsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/neon-garden-format-helpers.js'
import type { NeonBloom, NeonBed, NeonGardenResult } from '../src/commands/neon-garden-helpers.js'

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

function makeBloom(overrides: Partial<NeonBloom> = {}): NeonBloom {
  const base: NeonBloom = {
    file: 'test.ts',
    luminosityQuality: 80,
    structureVibrancy: 80,
    glowConsistency: 80,
    bloomDiversity: 80,
    rootBrightness: 80,
    shining: {
      luminosity: 80, light: 'bright-glow', hasHighLuminosity: true,
      hasReadable: true, hasSelfDocumenting: true, hasNoCryptic: true,
      hasClear: true, hasNoObfuscated: true, hasTransparent: true,
      hasNoHidden: true, hasVisible: true, hasNoInvisible: true,
      hasUnderstandable: true, hasNoArcane: true, hasLuminous: true,
      hasIlluminated: true, crypticCount: 0, obfuscatedCount: 0,
    },
    pulsing: {
      vibrancy: 80, pulse: 'vibrant-structure', hasHighVibrancy: true,
      hasWellStructured: true, hasNoChaotic: true, hasOrganized: true,
      hasNoHaphazard: true, hasModular: true, hasNoMonolithic: true,
      hasActive: true, hasNoStagnant: true, hasFresh: true,
      hasNoStale: true, hasDynamic: true, hasNoStatic: true,
      hasAlive: true, chaoticCount: 0, stagnantCount: 0,
    },
    radiating: {
      consistency: 80, glow: 'consistent-light', hasHighConsistency: true,
      hasUniform: true, hasNoMixed: true, hasReliable: true,
      hasNoFlaky: true, hasConsistent: true, hasNoErratic: true,
      hasTested: true, hasNoUntested: true, hasTypeSafe: true,
      hasNoUnsafe: true, hasPolished: true, hasNoRough: true,
      hasComplete: true, untestedCount: 0, unsafeCount: 0,
    },
    diversifying: {
      diversity: 80, garden: 'varied-garden', hasHighDiversity: true,
      hasVaried: true, hasNoMonotone: true, hasExpressive: true,
      hasNoFormulaic: true, hasTypeHandling: true, hasNoSinglePath: true,
      hasFlexible: true, hasNoRigid: true, hasGeneric: true,
      hasNoHardcoded: true, hasAdaptive: true, hasNoStatic: true,
      hasColorful: true, singlePathCount: 0, hardcodedCount: 0,
    },
    grounding: {
      brightness: 80, root: 'glowing-foundation', hasHighBrightness: true,
      hasDocumented: true, hasNoUndocumented: true, hasWellArchitected: true,
      hasNoAdHoc: true, hasPrincipled: true, hasNoHacky: true,
      hasMature: true, hasNoNaive: true, hasProven: true,
      hasNoExperimental: true, hasEstablished: true, hasPatterned: true,
      hasNoReinvented: true, undocumentedCount: 0, adHocCount: 0,
    },
    condition: 'luminous-garden',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<NeonGardenResult['stats']> = {}): NeonGardenResult['stats'] {
  return {
    totalFiles: 1, totalBeds: 1,
    avgLuminosityQuality: 80, avgStructureVibrancy: 80, avgGlowConsistency: 80,
    avgBloomDiversity: 80, avgRootBrightness: 80,
    neonMasterpieceCount: 0, luminousGardenCount: 1, properGlowCount: 0,
    dimBedCount: 0, darkPatchCount: 0, barrenSoilCount: 0,
    hasHighLuminosityCount: 1, hasHighVibrancyCount: 1, hasHighConsistencyCount: 1,
    hasHighDiversityCount: 1, hasHighBrightnessCount: 1,
    overallBrilliance: 80, gardenerGrade: 'light-gardener',
    bestBloom: 'test.ts', brightest: 'test.ts', mostVibrant: 'test.ts',
    mostConsistent: 'test.ts', bestRooted: 'test.ts',
    ...overrides,
  }
}

// ─── measureShining ────────────────────────────────────────────────

describe('measureShining', () => {
  it('returns a valid ShiningMeasure', () => {
    const m = measureShining(RichContent)
    expect(m).toHaveProperty('luminosity')
    expect(m).toHaveProperty('light')
    expect(m).toHaveProperty('crypticCount')
    expect(m).toHaveProperty('obfuscatedCount')
  })

  it('scores rich content higher than minimal', () => {
    expect(measureShining(RichContent).luminosity).toBeGreaterThan(measureShining(MinimalContent).luminosity)
  })

  it('penalizes toxic content', () => {
    expect(measureShining(ToxicContent).luminosity).toBeLessThan(20)
  })

  it('scores empty as 0', () => {
    expect(measureShining(EmptyContent).luminosity).toBe(0)
  })

  it('detects eval and any as cryptic', () => {
    const m = measureShining('var x: any = eval("1")')
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
  })

  it('detects var and debugger as obfuscated', () => {
    const m = measureShining('var x = 1\ndebugger')
    expect(m.obfuscatedCount).toBeGreaterThanOrEqual(2)
  })

  it('detects export + no any as transparent', () => {
    expect(measureShining('export function Foo(): Void {}').hasTransparent).toBe(true)
  })
})

// ─── measurePulsing ────────────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns a valid PulsingMeasure', () => {
    const m = measurePulsing(RichContent)
    expect(m).toHaveProperty('vibrancy')
    expect(m).toHaveProperty('pulse')
    expect(m).toHaveProperty('chaoticCount')
    expect(m).toHaveProperty('stagnantCount')
  })

  it('penalizes var and eval as chaotic', () => {
    const m = measurePulsing('var x = eval("1")')
    expect(m.chaoticCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes debugger and any as stagnant', () => {
    const m = measurePulsing('debugger\nconst x: any = 1')
    expect(m.stagnantCount).toBeGreaterThanOrEqual(2)
  })

  it('detects async or await as active', () => {
    expect(measurePulsing('async function go() { await fetch("/") }').hasActive).toBe(true)
  })

  it('detects interface + export as well structured', () => {
    expect(measurePulsing('export interface Foo { x: Number }').hasWellStructured).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measurePulsing(EmptyContent).vibrancy).toBe(0)
  })
})

// ─── measureRadiating ──────────────────────────────────────────────

describe('measureRadiating', () => {
  it('returns a valid RadiatingMeasure', () => {
    const m = measureRadiating(RichContent)
    expect(m).toHaveProperty('consistency')
    expect(m).toHaveProperty('glow')
    expect(m).toHaveProperty('untestedCount')
    expect(m).toHaveProperty('unsafeCount')
  })

  it('penalizes var as untested', () => {
    expect(measureRadiating('var x = 1').untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and any as unsafe', () => {
    expect(measureRadiating('eval("x")\nconst x: any = 1').unsafeCount).toBeGreaterThanOrEqual(2)
  })

  it('detects try-catch as tested', () => {
    expect(measureRadiating('try { const x = 1 } catch { }').hasTested).toBe(true)
  })

  it('detects returnType + no any as type safe', () => {
    expect(measureRadiating('function foo(): Void {}').hasTypeSafe).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureRadiating(EmptyContent).consistency).toBe(0)
  })
})

// ─── measureDiversifying ───────────────────────────────────────────

describe('measureDiversifying', () => {
  it('returns a valid DiversifyingMeasure', () => {
    const m = measureDiversifying(RichContent)
    expect(m).toHaveProperty('diversity')
    expect(m).toHaveProperty('garden')
    expect(m).toHaveProperty('singlePathCount')
    expect(m).toHaveProperty('hardcodedCount')
  })

  it('penalizes var as single path', () => {
    expect(measureDiversifying('var x = 1').singlePathCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and any as hardcoded', () => {
    expect(measureDiversifying('eval("x")\nconst x: any = 1').hardcodedCount).toBeGreaterThanOrEqual(2)
  })

  it('detects generics as generic', () => {
    expect(measureDiversifying('function foo<T>(x: T): T { return x }').hasGeneric).toBe(true)
  })

  it('detects generics + optional as flexible', () => {
    expect(measureDiversifying('function foo<T>(x?: T): T { return x }').hasFlexible).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureDiversifying(EmptyContent).diversity).toBe(0)
  })
})

// ─── measureGrounding ──────────────────────────────────────────────

describe('measureGrounding', () => {
  it('returns a valid GroundingMeasure', () => {
    const m = measureGrounding(RichContent)
    expect(m).toHaveProperty('brightness')
    expect(m).toHaveProperty('root')
    expect(m).toHaveProperty('undocumentedCount')
    expect(m).toHaveProperty('adHocCount')
  })

  it('penalizes var as undocumented', () => {
    expect(measureGrounding('var x = 1').undocumentedCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and any as ad-hoc', () => {
    expect(measureGrounding('const x: any = eval("1")').adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('detects docs as documented', () => {
    expect(measureGrounding('/** docs */').hasDocumented).toBe(true)
  })

  it('detects extends + implements as established', () => {
    expect(measureGrounding('class Foo extends Bar implements Baz {}').hasEstablished).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureGrounding(EmptyContent).brightness).toBe(0)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyNeonCondition', () => {
  it('classifies 90+ as neon-masterpiece', () => {
    expect(classifyNeonCondition(90)).toBe('neon-masterpiece')
    expect(classifyNeonCondition(100)).toBe('neon-masterpiece')
  })
  it('classifies 75-89 as luminous-garden', () => {
    expect(classifyNeonCondition(75)).toBe('luminous-garden')
  })
  it('classifies 60-74 as proper-glow', () => {
    expect(classifyNeonCondition(60)).toBe('proper-glow')
  })
  it('classifies 40-59 as dim-bed', () => {
    expect(classifyNeonCondition(40)).toBe('dim-bed')
  })
  it('classifies 20-39 as dark-patch', () => {
    expect(classifyNeonCondition(20)).toBe('dark-patch')
  })
  it('classifies 0-19 as barren-soil', () => {
    expect(classifyNeonCondition(0)).toBe('barren-soil')
  })
})

describe('classifyBedType', () => {
  it('returns no-bed for empty', () => {
    expect(classifyBedType([])).toBe('no-bed')
  })
  it('returns bioluminescent-paradise for high avg', () => {
    const blooms = [makeBloom({ condition: 'neon-masterpiece', qualityScore: 90 }), makeBloom({ condition: 'neon-masterpiece', qualityScore: 90 })]
    expect(classifyBedType(blooms)).toBe('bioluminescent-paradise')
  })
  it('returns no-bed for very low', () => {
    const blooms = [makeBloom({ condition: 'barren-soil', qualityScore: 5 }), makeBloom({ condition: 'barren-soil', qualityScore: 5 })]
    expect(classifyBedType(blooms)).toBe('no-bed')
  })
})

describe('classifyBedCondition', () => {
  it('classifies 85+ as neon-eden', () => { expect(classifyBedCondition(85)).toBe('neon-eden') })
  it('classifies 70-84 as luminous-paradise', () => { expect(classifyBedCondition(70)).toBe('luminous-paradise') })
  it('classifies 55-69 as proper-garden', () => { expect(classifyBedCondition(55)).toBe('proper-garden') })
  it('classifies 35-54 as dim-yard', () => { expect(classifyBedCondition(35)).toBe('dim-yard') })
  it('classifies 15-34 as dark-patch', () => { expect(classifyBedCondition(15)).toBe('dark-patch') })
  it('classifies 0-14 as void', () => { expect(classifyBedCondition(0)).toBe('void') })
})

describe('classifyGardenerGrade', () => {
  it('classifies 85+ as neon-botanist', () => { expect(classifyGardenerGrade(85)).toBe('neon-botanist') })
  it('classifies 70-84 as light-gardener', () => { expect(classifyGardenerGrade(70)).toBe('light-gardener') })
  it('classifies 55-69 as skilled-cultivator', () => { expect(classifyGardenerGrade(55)).toBe('skilled-cultivator') })
  it('classifies 40-54 as apprentice', () => { expect(classifyGardenerGrade(40)).toBe('apprentice') })
  it('classifies 20-39 as novice', () => { expect(classifyGardenerGrade(20)).toBe('novice') })
  it('classifies 0-19 as mole', () => { expect(classifyGardenerGrade(0)).toBe('mole') })
})

// ─── analyzeNeonBloom ───────────────────────────────────────────────

describe('analyzeNeonBloom', () => {
  it('returns a full NeonBloom', () => {
    const b = analyzeNeonBloom(RichContent, 'rich.ts')
    expect(b.file).toBe('rich.ts')
    expect(b.luminosityQuality).toBeGreaterThan(0)
    expect(b.structureVibrancy).toBeGreaterThanOrEqual(0)
    expect(b.qualityScore).toBeGreaterThan(0)
    expect(b.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average', () => {
    const b = analyzeNeonBloom(RichContent, 'test.ts')
    const expected = Math.round(
      b.luminosityQuality * 0.2 + b.structureVibrancy * 0.2 +
      b.glowConsistency * 0.2 + b.bloomDiversity * 0.2 + b.rootBrightness * 0.2,
    )
    expect(b.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    expect(analyzeNeonBloom(EmptyContent, 'empty.ts').condition).toBe('barren-soil')
  })

  it('handles toxic content gracefully', () => {
    expect(analyzeNeonBloom(ToxicContent, 'bad.ts').qualityScore).toBeLessThan(30)
  })
})

// ─── analyzeNeonBed ────────────────────────────────────────────────

describe('analyzeNeonBed', () => {
  it('returns empty bed for no blooms', () => {
    const b = analyzeNeonBed([], 'empty-dir')
    expect(b.blooms).toHaveLength(0)
    expect(b.bedType).toBe('no-bed')
    expect(b.condition).toBe('void')
  })

  it('aggregates bloom data correctly', () => {
    const blooms = [
      makeBloom({ luminosityQuality: 80, structureVibrancy: 70, rootBrightness: 60 }),
      makeBloom({ luminosityQuality: 60, structureVibrancy: 50, rootBrightness: 40 }),
    ]
    const b = analyzeNeonBed(blooms, 'src')
    expect(b.avgLuminosity).toBe(70)
    expect(b.avgVibrancy).toBe(60)
    expect(b.avgBrightness).toBe(50)
  })

  it('counts masterpieces and barren', () => {
    const blooms = [
      makeBloom({ condition: 'neon-masterpiece' }),
      makeBloom({ condition: 'barren-soil' }),
      makeBloom({ condition: 'luminous-garden' }),
    ]
    const b = analyzeNeonBed(blooms, 'src')
    expect(b.neonMasterpieceCount).toBe(1)
    expect(b.barrenSoilCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high brilliance with no barren', () => {
    const stats = makeStats({ overallBrilliance: 90, barrenSoilCount: 0 })
    const landscape = { avgLuminosity: 90, avgVibrancy: 90, avgBrightness: 90, isNeon: true, overallBrilliance: 90 }
    const recs = generateRecommendations([makeBloom()], [], landscape, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends brightening when luminosity low', () => {
    const stats = makeStats({ avgLuminosityQuality: 40, overallBrilliance: 40 })
    const landscape = { avgLuminosity: 40, avgVibrancy: 80, avgBrightness: 80, isNeon: false, overallBrilliance: 40 }
    const recs = generateRecommendations([], [], landscape, stats)
    expect(recs.some(r => r.includes('Brighten'))).toBe(true)
  })

  it('recommends enlivening when vibrancy low', () => {
    const stats = makeStats({ avgStructureVibrancy: 30, overallBrilliance: 30 })
    const landscape = { avgLuminosity: 80, avgVibrancy: 30, avgBrightness: 80, isNeon: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], landscape, stats)
    expect(recs.some(r => r.includes('Enliven'))).toBe(true)
  })

  it('recommends steadying when consistency low', () => {
    const stats = makeStats({ avgGlowConsistency: 30, overallBrilliance: 30 })
    const landscape = { avgLuminosity: 80, avgVibrancy: 80, avgBrightness: 80, isNeon: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], landscape, stats)
    expect(recs.some(r => r.includes('Steady') || r.includes('glow'))).toBe(true)
  })

  it('recommends diversifying when diversity low', () => {
    const stats = makeStats({ avgBloomDiversity: 30, overallBrilliance: 30 })
    const landscape = { avgLuminosity: 80, avgVibrancy: 80, avgBrightness: 80, isNeon: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], landscape, stats)
    expect(recs.some(r => r.includes('Diversif'))).toBe(true)
  })

  it('recommends illuminating when brightness low', () => {
    const stats = makeStats({ avgRootBrightness: 30, overallBrilliance: 30 })
    const landscape = { avgLuminosity: 80, avgVibrancy: 80, avgBrightness: 30, isNeon: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], landscape, stats)
    expect(recs.some(r => r.includes('Illuminate') || r.includes('roots'))).toBe(true)
  })

  it('mentions barren files when present', () => {
    const blooms = [makeBloom({ condition: 'barren-soil', file: 'bad.ts' })]
    const stats = makeStats({ barrenSoilCount: 1, overallBrilliance: 30 })
    const landscape = { avgLuminosity: 40, avgVibrancy: 40, avgBrightness: 40, isNeon: false, overallBrilliance: 30 }
    const recs = generateRecommendations(blooms, [], landscape, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many barren files as count', () => {
    const blooms = Array.from({ length: 5 }, (_, i) => makeBloom({ condition: 'barren-soil', file: `bad${i}.ts` }))
    const stats = makeStats({ barrenSoilCount: 5, overallBrilliance: 10 })
    const landscape = { avgLuminosity: 10, avgVibrancy: 10, avgBrightness: 10, isNeon: false, overallBrilliance: 10 }
    const recs = generateRecommendations(blooms, [], landscape, stats)
    expect(recs.some(r => r.includes('5 barren'))).toBe(true)
  })

  it('mentions dim/dark beds', () => {
    const bed: NeonBed = {
      directory: 'src', blooms: [], avgLuminosity: 30, avgVibrancy: 30, avgBrightness: 30,
      neonMasterpieceCount: 0, barrenSoilCount: 0, bedType: 'dim-plot', condition: 'dim-yard',
    }
    const stats = makeStats({ overallBrilliance: 50 })
    const landscape = { avgLuminosity: 50, avgVibrancy: 50, avgBrightness: 50, isNeon: false, overallBrilliance: 50 }
    const recs = generateRecommendations([], [bed, bed], landscape, stats)
    expect(recs.some(r => r.includes('bed'))).toBe(true)
  })

  it('returns steady message when all is good', () => {
    const stats = makeStats({ overallBrilliance: 80, barrenSoilCount: 0, avgLuminosityQuality: 80, avgStructureVibrancy: 80, avgGlowConsistency: 80, avgBloomDiversity: 80, avgRootBrightness: 80 })
    const landscape = { avgLuminosity: 80, avgVibrancy: 80, avgBrightness: 80, isNeon: true, overallBrilliance: 80 }
    const recs = generateRecommendations([], [], landscape, stats)
    expect(recs.some(r => r.includes('steady') || r.includes('maintain'))).toBe(true)
  })
})

// ─── buildNeonGardenResult ─────────────────────────────────────────

describe('buildNeonGardenResult', () => {
  it('returns a complete result', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.blooms).toHaveLength(2)
    expect(result.beds.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.landscape.overallBrilliance).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildNeonGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
  })

  it('computes overallBrilliance as avg of luminosity, vibrancy, brightness', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgLuminosityQuality + result.stats.avgStructureVibrancy + result.stats.avgRootBrightness) / 3,
    )
    expect(result.stats.overallBrilliance).toBe(expected)
  })

  it('finds best bloom correctly', async () => {
    const result = await buildNeonGardenResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestBloom).toBe('good.ts')
  })

  it('groups files into beds by directory', async () => {
    const result = await buildNeonGardenResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.beds.length).toBe(2)
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
  it('returns string for masterpiece', () => { expect(typeof colorGrade('neon-masterpiece')).toBe('string') })
  it('returns string for lower grades', () => { expect(typeof colorGrade('barren-soil')).toBe('string') })
})

describe('formatBloomTable', () => {
  it('formats a bloom', () => {
    const out = formatBloomTable(makeBloom())
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
  })
})

describe('formatBloomsTable', () => {
  it('returns message for empty', () => { expect(formatBloomsTable([])).toContain('No neon blooms') })
  it('formats multiple blooms', () => {
    const out = formatBloomsTable([makeBloom(), makeBloom({ file: 'other.ts' })])
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatBedTable', () => {
  it('formats a bed', () => {
    const bed: NeonBed = {
      directory: 'src', blooms: [makeBloom()], avgLuminosity: 80, avgVibrancy: 70, avgBrightness: 60,
      neonMasterpieceCount: 1, barrenSoilCount: 0, bedType: 'glowing-garden', condition: 'luminous-paradise',
    }
    const out = formatBedTable(bed)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatBedsTable', () => {
  it('returns message for empty', () => { expect(formatBedsTable([])).toContain('No neon beds') })
})

describe('formatStatsTable', () => {
  it('formats stats', () => {
    const out = formatStatsTable(makeStats())
    expect(out).toContain('Neon Garden Statistics')
    expect(out).toContain('Total Files')
  })
})

describe('formatRecommendations', () => {
  it('returns no recs for empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recs as bullets', () => {
    const out = formatRecommendations(['Brighten code', 'Add docs'])
    expect(out).toContain('Brighten code')
    expect(out).toContain('Add docs')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Neon Bloom Analysis')
    expect(out).toContain('Neon Beds')
    expect(out).toContain('Neon Garden Statistics')
    expect(out).toContain('Landscape')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [RichContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.blooms).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.landscape).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })
})
