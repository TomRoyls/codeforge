import { describe, it, expect } from 'vitest'
import {
  measureForging,
  measureEnduring,
  measureReflecting,
  measureCutting,
  measureKnowing,
  classifyObsidianCondition,
  classifyChamberType,
  classifyChamberCondition,
  classifyTempleGrade,
  analyzeObsidianShard,
  analyzeObsidianChamber,
  generateRecommendations,
  buildObsidianTempleResult,
} from '../src/commands/obsidian-temple-helpers.js'
import {
  colorScore,
  colorGrade,
  formatShardTable,
  formatShardsTable,
  formatChamberTable,
  formatChambersTable,
  formatStatsTable,
  formatTempleTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/obsidian-temple-format-helpers.js'
import type { ObsidianShard, ObsidianChamber, ObsidianTempleResult } from '../src/commands/obsidian-temple-helpers.js'

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

function makeShard(overrides: Partial<ObsidianShard> = {}): ObsidianShard {
  const base: ObsidianShard = {
    file: 'test.ts',
    volcanicClarity: 80,
    darkResilience: 80,
    mirrorDepth: 80,
    bladePrecision: 80,
    shadowWisdom: 80,
    forging: {
      clarity: 80, glass: 'clear-obsidian', hasHighClarity: true,
      hasReadable: true, hasSelfDocumenting: true, hasNoCryptic: true,
      hasClear: true, hasNoObfuscated: true, hasTransparent: true,
      hasNoHidden: true, hasUnderstandable: true, hasNoArcane: true,
      hasVisible: true, hasNoInvisible: true, hasDirect: true,
      hasNoCircuits: true, hasLuminous: true, hasNoOpaque: true,
      crypticCount: 0, obfuscatedCount: 0,
    },
    enduring: {
      resilience: 80, darkness: 'shadow-walker', hasHighResilience: true,
      hasErrorHandled: true, hasNoBareCrash: true, hasTested: true,
      hasNoUntested: true, hasDefensive: true, hasNoNaive: true,
      hasTypeSafe: true, hasNoUnsafe: true, hasGraceful: true,
      hasNoHarshFail: true, hasRecoverable: true, hasNoFatal: true,
      hasRobust: true, hasNoFragile: true, hasFearless: true,
      hasNoPanicked: true, bareCrashCount: 0, untestedCount: 0,
    },
    reflecting: {
      depth: 80, mirror: 'honest-glass', hasHighDepth: true,
      hasSelfAware: true, hasNoBlind: true, hasDocumented: true,
      hasNoUndocumented: true, hasHonest: true, hasNoDeceptive: true,
      hasConsistent: true, hasNoContradictory: true, hasPrincipled: true,
      hasNoAdHoc: true, hasClean: true, hasNoDirty: true,
      hasPure: true, hasNoContaminated: true, hasTransparent: true,
      hasNoOpaque: true, blindCount: 0, contradictoryCount: 0,
    },
    cutting: {
      precision: 80, edge: 'razor-edge', hasHighPrecision: true,
      hasAccurate: true, hasNoWrong: true, hasExact: true,
      hasNoApproximate: true, hasCorrect: true, hasNoBuggy: true,
      hasTypeSafe: true, hasNoCasting: true, hasValidated: true,
      hasNoAssumed: true, hasConsistent: true, hasNoErratic: true,
      hasDeterministic: true, hasNoRandom: true, hasPrecise: true,
      hasNoVague: true, wrongCount: 0, buggyCount: 0,
    },
    knowing: {
      wisdom: 80, shadow: 'deep-shadow', hasHighWisdom: true,
      hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true,
      hasNoAdHoc: true, hasPatterned: true, hasNoReinvented: true,
      hasProven: true, hasNoExperimental: true, hasMature: true,
      hasNoNaive: true, hasDeep: true, hasNoShallow: true,
      hasInsightful: true, hasNoObvious: true, hasStrategic: true,
      hasNoTactical: true, hackedCount: 0, adHocCount: 0,
    },
    condition: 'dark-sanctuary',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<ObsidianTempleResult['stats']> = {}): ObsidianTempleResult['stats'] {
  return {
    totalFiles: 1, totalChambers: 1,
    avgVolcanicClarity: 80, avgDarkResilience: 80, avgMirrorDepth: 80,
    avgBladePrecision: 80, avgShadowWisdom: 80,
    obsidianMasterpieceCount: 0, darkSanctuaryCount: 1, properTempleCount: 0,
    crumblingStoneCount: 0, shatteredGlassCount: 0, voidCount: 0,
    hasHighClarityCount: 1, hasHighResilienceCount: 1, hasHighDepthCount: 1,
    hasHighPrecisionCount: 1, hasHighWisdomCount: 1,
    overallSharpness: 80, templeGrade: 'dark-artisan',
    bestShard: 'test.ts', clearest: 'test.ts', mostResilient: 'test.ts',
    deepest: 'test.ts', sharpest: 'test.ts', wisest: 'test.ts',
    ...overrides,
  }
}

// ─── measureForging ───────────────────────────────────────────────

describe('measureForging', () => {
  it('returns a valid ForgingMeasure', () => {
    const m = measureForging(RichContent)
    expect(m).toHaveProperty('clarity')
    expect(m).toHaveProperty('glass')
    expect(m).toHaveProperty('crypticCount')
    expect(m).toHaveProperty('obfuscatedCount')
  })

  it('scores rich content higher than minimal', () => {
    expect(measureForging(RichContent).clarity).toBeGreaterThan(measureForging(MinimalContent).clarity)
  })

  it('penalizes toxic content', () => {
    expect(measureForging(ToxicContent).clarity).toBeLessThan(20)
  })

  it('scores empty as 0', () => {
    expect(measureForging(EmptyContent).clarity).toBe(0)
  })

  it('detects var as cryptic', () => {
    expect(measureForging('var x = 1').crypticCount).toBeGreaterThanOrEqual(1)
  })

  it('detects export + returnType as transparent', () => {
    expect(measureForging('export function foo(): Void {}').hasTransparent).toBe(true)
  })

  it('detects pipeline + arrow as direct', () => {
    expect(measureForging('const x = items.map(i => i.val)').hasDirect).toBe(true)
  })

  it('detects doc + export + returnType as luminous', () => {
    expect(measureForging('/** docs */ export function foo(): Void {}').hasLuminous).toBe(true)
  })
})

// ─── measureEnduring ──────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns a valid EnduringMeasure', () => {
    const m = measureEnduring(RichContent)
    expect(m).toHaveProperty('resilience')
    expect(m).toHaveProperty('darkness')
    expect(m).toHaveProperty('bareCrashCount')
    expect(m).toHaveProperty('untestedCount')
  })

  it('penalizes eval as bare crash', () => {
    expect(measureEnduring('eval("x")').bareCrashCount).toBeGreaterThanOrEqual(1)
  })

  it('detects try-catch as error handled', () => {
    expect(measureEnduring('try { } catch { }').hasErrorHandled).toBe(true)
  })

  it('detects try-catch + throw as graceful', () => {
    expect(measureEnduring('try { throw new Error() } catch { }').hasGraceful).toBe(true)
  })

  it('detects debugger as panicked', () => {
    expect(measureEnduring('debugger').hasNoPanicked).toBe(false)
  })

  it('penalizes var as untested', () => {
    expect(measureEnduring('var x = 1').untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('scores empty as 0', () => {
    expect(measureEnduring(EmptyContent).resilience).toBe(0)
  })
})

// ─── measureReflecting ────────────────────────────────────────────

describe('measureReflecting', () => {
  it('returns a valid ReflectingMeasure', () => {
    const m = measureReflecting(RichContent)
    expect(m).toHaveProperty('depth')
    expect(m).toHaveProperty('mirror')
    expect(m).toHaveProperty('blindCount')
    expect(m).toHaveProperty('contradictoryCount')
  })

  it('penalizes ts-ignore as blind', () => {
    expect(measureReflecting('// @ts-ignore').blindCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes var as contradictory', () => {
    expect(measureReflecting('var x = 1').contradictoryCount).toBeGreaterThanOrEqual(1)
  })

  it('detects doc + returnType as self-aware', () => {
    expect(measureReflecting('/** docs */ export function foo(): Void {}').hasSelfAware).toBe(true)
  })

  it('detects interface + abstract as principled', () => {
    expect(measureReflecting('abstract class Foo implements IBar {}').hasPrincipled).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureReflecting(EmptyContent).depth).toBe(0)
  })
})

// ─── measureCutting ───────────────────────────────────────────────

describe('measureCutting', () => {
  it('returns a valid CuttingMeasure', () => {
    const m = measureCutting(RichContent)
    expect(m).toHaveProperty('precision')
    expect(m).toHaveProperty('edge')
    expect(m).toHaveProperty('wrongCount')
    expect(m).toHaveProperty('buggyCount')
  })

  it('penalizes eval as wrong', () => {
    expect(measureCutting('eval("x")').wrongCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes var as buggy', () => {
    expect(measureCutting('var x = 1').buggyCount).toBeGreaterThanOrEqual(1)
  })

  it('detects strict equality as exact', () => {
    expect(measureCutting('if (x === 1): Void {}').hasExact).toBe(true)
  })

  it('detects try + throw as validated', () => {
    expect(measureCutting('try { throw new Error() } catch { }').hasValidated).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureCutting(EmptyContent).precision).toBe(0)
  })
})

// ─── measureKnowing ───────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure', () => {
    const m = measureKnowing(RichContent)
    expect(m).toHaveProperty('wisdom')
    expect(m).toHaveProperty('shadow')
    expect(m).toHaveProperty('hackedCount')
    expect(m).toHaveProperty('adHocCount')
  })

  it('penalizes as any as hacked', () => {
    expect(measureKnowing('const x = value as any').hackedCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval + any as ad-hoc', () => {
    expect(measureKnowing('const x: any = eval("1")').adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('detects abstract + extends as strategic', () => {
    expect(measureKnowing('abstract class Foo extends Bar {}').hasStrategic).toBe(true)
  })

  it('detects generics + returnType as deep', () => {
    expect(measureKnowing('function foo<T>(): Type { return x }').hasDeep).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureKnowing(EmptyContent).wisdom).toBe(0)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyObsidianCondition', () => {
  it('classifies 90+ as obsidian-masterpiece', () => { expect(classifyObsidianCondition(90)).toBe('obsidian-masterpiece') })
  it('classifies 75-89 as dark-sanctuary', () => { expect(classifyObsidianCondition(75)).toBe('dark-sanctuary') })
  it('classifies 60-74 as proper-temple', () => { expect(classifyObsidianCondition(60)).toBe('proper-temple') })
  it('classifies 40-59 as crumbling-stone', () => { expect(classifyObsidianCondition(40)).toBe('crumbling-stone') })
  it('classifies 20-39 as shattered-glass', () => { expect(classifyObsidianCondition(20)).toBe('shattered-glass') })
  it('classifies 0-19 as void', () => { expect(classifyObsidianCondition(0)).toBe('void') })
})

describe('classifyChamberType', () => {
  it('returns no-chamber for empty', () => { expect(classifyChamberType([])).toBe('no-chamber') })
  it('returns grand-temple for high avg', () => {
    const ss = [makeShard({ qualityScore: 90 }), makeShard({ qualityScore: 90 })]
    expect(classifyChamberType(ss)).toBe('grand-temple')
  })
  it('returns no-chamber for very low', () => {
    const ss = [makeShard({ qualityScore: 5 }), makeShard({ qualityScore: 5 })]
    expect(classifyChamberType(ss)).toBe('no-chamber')
  })
})

describe('classifyChamberCondition', () => {
  it('classifies 85+ as volcanic-cathedral', () => { expect(classifyChamberCondition(85)).toBe('volcanic-cathedral') })
  it('classifies 70-84 as dark-sanctuary', () => { expect(classifyChamberCondition(70)).toBe('dark-sanctuary') })
  it('classifies 55-69 as proper-temple', () => { expect(classifyChamberCondition(55)).toBe('proper-temple') })
  it('classifies 35-54 as crumbling-ruin', () => { expect(classifyChamberCondition(35)).toBe('crumbling-ruin') })
  it('classifies 15-34 as shattered-vestibule', () => { expect(classifyChamberCondition(15)).toBe('shattered-vestibule') })
  it('classifies 0-14 as void', () => { expect(classifyChamberCondition(0)).toBe('void') })
})

describe('classifyTempleGrade', () => {
  it('classifies 85+ as obsidian-master', () => { expect(classifyTempleGrade(85)).toBe('obsidian-master') })
  it('classifies 70-84 as dark-artisan', () => { expect(classifyTempleGrade(70)).toBe('dark-artisan') })
  it('classifies 55-69 as stone-worker', () => { expect(classifyTempleGrade(55)).toBe('stone-worker') })
  it('classifies 40-54 as apprentice', () => { expect(classifyTempleGrade(40)).toBe('apprentice') })
  it('classifies 20-39 as novice', () => { expect(classifyTempleGrade(20)).toBe('novice') })
  it('classifies 0-19 as clueless', () => { expect(classifyTempleGrade(0)).toBe('clueless') })
})

// ─── analyzeObsidianShard ─────────────────────────────────────────

describe('analyzeObsidianShard', () => {
  it('returns a full ObsidianShard', () => {
    const s = analyzeObsidianShard(RichContent, 'rich.ts')
    expect(s.file).toBe('rich.ts')
    expect(s.volcanicClarity).toBeGreaterThan(0)
    expect(s.qualityScore).toBeGreaterThan(0)
    expect(s.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average', () => {
    const s = analyzeObsidianShard(RichContent, 'test.ts')
    const expected = Math.round(
      s.volcanicClarity * 0.2 + s.darkResilience * 0.2 +
      s.mirrorDepth * 0.2 + s.bladePrecision * 0.2 + s.shadowWisdom * 0.2,
    )
    expect(s.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    expect(analyzeObsidianShard(EmptyContent, 'empty.ts').condition).toBe('void')
  })

  it('handles toxic content gracefully', () => {
    expect(analyzeObsidianShard(ToxicContent, 'bad.ts').qualityScore).toBeLessThan(30)
  })
})

// ─── analyzeObsidianChamber ───────────────────────────────────────

describe('analyzeObsidianChamber', () => {
  it('returns empty chamber for no shards', () => {
    const c = analyzeObsidianChamber([], 'empty-dir')
    expect(c.shards).toHaveLength(0)
    expect(c.chamberType).toBe('no-chamber')
    expect(c.condition).toBe('void')
  })

  it('aggregates shard data correctly', () => {
    const ss = [
      makeShard({ volcanicClarity: 80, bladePrecision: 70, shadowWisdom: 60 }),
      makeShard({ volcanicClarity: 60, bladePrecision: 50, shadowWisdom: 40 }),
    ]
    const c = analyzeObsidianChamber(ss, 'src')
    expect(c.avgClarity).toBe(70)
    expect(c.avgPrecision).toBe(60)
    expect(c.avgWisdom).toBe(50)
  })

  it('counts obsidian and void', () => {
    const ss = [
      makeShard({ condition: 'obsidian-masterpiece' }),
      makeShard({ condition: 'void' }),
    ]
    const c = analyzeObsidianChamber(ss, 'src')
    expect(c.obsidianMasterpieceCount).toBe(1)
    expect(c.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high sharpness with no void', () => {
    const stats = makeStats({ overallSharpness: 90, voidCount: 0 })
    const temple = { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isObsidian: true, overallSharpness: 90 }
    const recs = generateRecommendations([makeShard()], [], temple, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends forging when clarity low', () => {
    const stats = makeStats({ avgVolcanicClarity: 40, overallSharpness: 40 })
    const temple = { avgClarity: 40, avgPrecision: 80, avgWisdom: 80, isObsidian: false, overallSharpness: 40 }
    const recs = generateRecommendations([], [], temple, stats)
    expect(recs.some(r => r.includes('volcanic') || r.includes('clarity'))).toBe(true)
  })

  it('recommends resilience when dark low', () => {
    const stats = makeStats({ avgDarkResilience: 30, overallSharpness: 30 })
    const temple = { avgClarity: 80, avgPrecision: 80, avgWisdom: 80, isObsidian: false, overallSharpness: 30 }
    const recs = generateRecommendations([], [], temple, stats)
    expect(recs.some(r => r.includes('resilience') || r.includes('error'))).toBe(true)
  })

  it('recommends depth when mirror low', () => {
    const stats = makeStats({ avgMirrorDepth: 30, overallSharpness: 30 })
    const temple = { avgClarity: 80, avgPrecision: 80, avgWisdom: 80, isObsidian: false, overallSharpness: 30 }
    const recs = generateRecommendations([], [], temple, stats)
    expect(recs.some(r => r.includes('mirror') || r.includes('reflect'))).toBe(true)
  })

  it('recommends precision when blade low', () => {
    const stats = makeStats({ avgBladePrecision: 30, overallSharpness: 30 })
    const temple = { avgClarity: 80, avgPrecision: 30, avgWisdom: 80, isObsidian: false, overallSharpness: 30 }
    const recs = generateRecommendations([], [], temple, stats)
    expect(recs.some(r => r.includes('precision') || r.includes('sharpen'))).toBe(true)
  })

  it('recommends wisdom when shadow low', () => {
    const stats = makeStats({ avgShadowWisdom: 30, overallSharpness: 30 })
    const temple = { avgClarity: 80, avgPrecision: 80, avgWisdom: 30, isObsidian: false, overallSharpness: 30 }
    const recs = generateRecommendations([], [], temple, stats)
    expect(recs.some(r => r.includes('wisdom') || r.includes('shadow'))).toBe(true)
  })

  it('mentions shattered files', () => {
    const ss = [makeShard({ condition: 'void', file: 'bad.ts' })]
    const stats = makeStats({ voidCount: 1, overallSharpness: 30 })
    const temple = { avgClarity: 40, avgPrecision: 40, avgWisdom: 40, isObsidian: false, overallSharpness: 30 }
    const recs = generateRecommendations(ss, [], temple, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many shattered as count', () => {
    const ss = Array.from({ length: 5 }, (_, i) => makeShard({ condition: 'void', file: `bad${i}.ts` }))
    const stats = makeStats({ voidCount: 5, overallSharpness: 10 })
    const temple = { avgClarity: 10, avgPrecision: 10, avgWisdom: 10, isObsidian: false, overallSharpness: 10 }
    const recs = generateRecommendations(ss, [], temple, stats)
    expect(recs.some(r => r.includes('5'))).toBe(true)
  })

  it('mentions dark chambers', () => {
    const ch: ObsidianChamber = {
      directory: 'src', shards: [], avgClarity: 30, avgPrecision: 30, avgWisdom: 30,
      obsidianMasterpieceCount: 0, voidCount: 0, chamberType: 'dark-corner', condition: 'crumbling-ruin',
    }
    const stats = makeStats({ overallSharpness: 50 })
    const temple = { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isObsidian: false, overallSharpness: 50 }
    const recs = generateRecommendations([], [ch], temple, stats)
    expect(recs.some(r => r.includes('chamber'))).toBe(true)
  })

  it('returns steady message when all good', () => {
    const stats = makeStats({ overallSharpness: 80, voidCount: 0, avgVolcanicClarity: 80, avgDarkResilience: 80, avgMirrorDepth: 80, avgBladePrecision: 80, avgShadowWisdom: 80 })
    const temple = { avgClarity: 80, avgPrecision: 80, avgWisdom: 80, isObsidian: true, overallSharpness: 80 }
    const recs = generateRecommendations([], [], temple, stats)
    expect(recs.some(r => r.includes('temple') || r.includes('obsidian'))).toBe(true)
  })
})

// ─── buildObsidianTempleResult ─────────────────────────────────────

describe('buildObsidianTempleResult', () => {
  it('returns a complete result', async () => {
    const result = await buildObsidianTempleResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.shards).toHaveLength(2)
    expect(result.chambers.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.temple.overallSharpness).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildObsidianTempleResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSharpness).toBe(0)
  })

  it('computes overallSharpness as avg of 5 measures', async () => {
    const result = await buildObsidianTempleResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgVolcanicClarity + result.stats.avgDarkResilience +
        result.stats.avgMirrorDepth + result.stats.avgBladePrecision +
        result.stats.avgShadowWisdom) / 5,
    )
    expect(result.stats.overallSharpness).toBe(expected)
  })

  it('finds best shard correctly', async () => {
    const result = await buildObsidianTempleResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestShard).toBe('good.ts')
  })

  it('groups files into chambers by directory', async () => {
    const result = await buildObsidianTempleResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.chambers.length).toBe(2)
  })

  it('sets isObsidian when sharpness >= 80', async () => {
    const result = await buildObsidianTempleResult(['a.ts'], [RichContent])
    if (result.temple.overallSharpness >= 80) {
      expect(result.temple.isObsidian).toBe(true)
    }
  })

  it('assigns temple grade correctly', async () => {
    const result = await buildObsidianTempleResult([], [])
    expect(result.stats.templeGrade).toBe('clueless')
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
  it('returns string for obsidian-masterpiece', () => { expect(typeof colorGrade('obsidian-masterpiece')).toBe('string') })
  it('returns string for void', () => { expect(typeof colorGrade('void')).toBe('string') })
})

describe('formatShardTable', () => {
  it('formats a shard', () => {
    const out = formatShardTable(makeShard())
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
  })
})

describe('formatShardsTable', () => {
  it('returns message for empty', () => { expect(formatShardsTable([])).toContain('No obsidian') })
  it('formats multiple shards', () => {
    const out = formatShardsTable([makeShard(), makeShard({ file: 'other.ts' })])
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatChamberTable', () => {
  it('formats a chamber', () => {
    const ch: ObsidianChamber = {
      directory: 'src', shards: [makeShard()], avgClarity: 80, avgPrecision: 70, avgWisdom: 60,
      obsidianMasterpieceCount: 1, voidCount: 0, chamberType: 'obsidian-hall', condition: 'dark-sanctuary',
    }
    const out = formatChamberTable(ch)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatChambersTable', () => {
  it('returns message for empty', () => { expect(formatChambersTable([])).toContain('No obsidian') })
})

describe('formatStatsTable', () => {
  it('formats stats', () => {
    const out = formatStatsTable(makeStats())
    expect(out).toContain('Obsidian Temple Statistics')
    expect(out).toContain('Total Files')
  })
})

describe('formatTempleTable', () => {
  it('formats temple', () => {
    const temple = { avgClarity: 80, avgPrecision: 70, avgWisdom: 60, isObsidian: true, overallSharpness: 70 }
    const out = formatTempleTable(temple)
    expect(out).toContain('Temple Overview')
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
    const result = await buildObsidianTempleResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Obsidian Temple Analysis')
    expect(out).toContain('Obsidian Shards')
    expect(out).toContain('Obsidian Chambers')
    expect(out).toContain('Temple Overview')
    expect(out).toContain('Obsidian Temple Statistics')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildObsidianTempleResult(['a.ts'], [RichContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.temple).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })
})
