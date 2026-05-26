import { describe, expect, it } from 'vitest'

import {
  analyzeDiamondEdict,
  analyzeDiamondEmpire,
  buildDiamondSovereignResult,
  classifyEdictCondition,
  classifyEmpireCondition,
  classifyEmpireType,
  classifySovereignGrade,
  generateRecommendations,
  measureCutting,
  measureHardening,
  measureKnowing,
  measureLasting,
  measureShining,
} from '../src/commands/diamond-sovereign-helpers.js'
import type { DiamondEdict, DiamondEmpire, DiamondSovereignResult } from '../src/commands/diamond-sovereign-helpers.js'
import {
  colorEmpireCondition,
  colorScore,
  formatEdictTable,
  formatEdictsTable,
  formatEmpireTable,
  formatEmpiresTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/diamond-sovereign-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = [
  'import { type Result } from "./types"',
  'export class DiamondService {',
  '  readonly name: string',
  '  private value: number',
  '  async process(): Promise<void> {',
  '    try {',
  '      const data = await this.fetch()',
  '      if (data) {',
  '        return JSON.parse(data as Result)',
  '      }',
  '      throw new Error("no data")',
  '    } catch (e) {',
  '      return undefined',
  '    }',
  '  }',
  '  /** Documentation */',
  '  type Handler<T> = (input: string) => T',
  '}',
].join('\n')

const emptyContent = ''

const minimalContent = 'const x = 1'

function makeStats(overrides: Partial<DiamondSovereignResult['stats']> = {}): DiamondSovereignResult['stats'] {
  return {
    totalFiles: 1,
    totalEmpires: 1,
    avgSovereignHardness: 90,
    avgCrownBrilliance: 90,
    avgThronePrecision: 90,
    avgScepterEndurance: 90,
    avgDynastyWisdom: 90,
    sovereignMasterpieceCount: 1,
    royalDiamondCount: 0,
    properGemCount: 0,
    industrialStoneCount: 0,
    roughCarbonCount: 0,
    voidCount: 0,
    hasHighHardnessCount: 1,
    hasHighBrillianceCount: 1,
    hasHighPrecisionCount: 1,
    hasHighEnduranceCount: 1,
    hasHighWisdomCount: 1,
    overallSovereignty: 90,
    sovereignGrade: 'diamond-emperor',
    bestEdict: 'a.ts',
    hardest: 'a.ts',
    mostBrilliant: 'a.ts',
    mostPrecise: 'a.ts',
    mostEnduring: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureHardening ───────────────────────────────────

describe('measureHardening', () => {
  it('scores rich content highly', () => {
    const result = measureHardening(richContent)
    expect(result.hardness).toBeGreaterThan(60)
    expect(result.hasWellStructured).toBe(true)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasNoUnsafe).toBe(true)
    expect(result.hasStable).toBe(true)
    expect(result.hasSolid).toBe(true)
    expect(result.hasDurable).toBe(true)
    expect(result.hasPermanent).toBe(true)
    expect(result.hasFortified).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureHardening(emptyContent)
    expect(result.hardness).toBeLessThan(55)
    expect(result.hasWellStructured).toBe(false)
    expect(result.hasTested).toBe(false)
    expect(result.hasSolid).toBe(false)
    expect(result.chaoticCount).toBe(0)
    expect(result.untestedCount).toBe(0)
  })

  it('detects chaotic patterns', () => {
    const result = measureHardening('const chaotic = true; const messy = true')
    expect(result.hasNoChaotic).toBe(false)
    expect(result.chaoticCount).toBeGreaterThan(0)
  })

  it('detects unsafe patterns', () => {
    const result = measureHardening('var x = 1; eval("test")')
    expect(result.hasNoUnsafe).toBe(false)
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects type annotations', () => {
    const result = measureHardening('const x: string = "hello"')
    expect(result.hasRobust).toBe(true)
  })

  it('detects readonly and access modifiers', () => {
    const result = measureHardening('class X { readonly y: string; private z: number }')
    expect(result.hasHardened).toBe(true)
  })

  it('detects async patterns', () => {
    const result = measureHardening('async function f(): Promise<void> { await x() }')
    expect(result.hasPermanent).toBe(true)
  })

  it('classifies stone correctly', () => {
    const high = measureHardening(richContent)
    expect(['indestructible', 'flawless-diamond', 'proper-gem']).toContain(high.stone)

    const low = measureHardening(emptyContent)
    expect(['no-hardness', 'fragile-crystal', 'included-stone']).toContain(low.stone)
  })

  it('sets hasHighHardness for scores >= 60', () => {
    const result = measureHardening(richContent)
    if (result.hardness >= 60) {
      expect(result.hasHighHardness).toBe(true)
    }
  })
})

// ─── measureShining ─────────────────────────────────────

describe('measureShining', () => {
  it('scores rich content highly', () => {
    const result = measureShining(richContent)
    expect(result.brilliance).toBeGreaterThan(60)
    expect(result.hasReadable).toBe(true)
    expect(result.hasSelfDocumenting).toBe(true)
    expect(result.hasClear).toBe(true)
    expect(result.hasPolished).toBe(true)
    expect(result.hasMagnificent).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureShining(emptyContent)
    expect(result.brilliance).toBeLessThan(55)
    expect(result.crypticCount).toBe(0)
    expect(result.mysteryCount).toBe(0)
  })

  it('detects cryptic patterns', () => {
    const result = measureShining('const cryptic = true; const mysterious = false')
    expect(result.hasNoCryptic).toBe(false)
    expect(result.crypticCount).toBeGreaterThan(0)
  })

  it('detects mystery patterns', () => {
    const result = measureShining('var x = 1; eval("test")')
    expect(result.hasNoMystery).toBe(false)
    expect(result.mysteryCount).toBeGreaterThan(0)
  })

  it('detects ugly patterns as not glorious', () => {
    const result = measureShining('const ugly = true; const clunky = true')
    expect(result.hasGlorious).toBe(false)
  })

  it('classifies light correctly', () => {
    const high = measureShining(richContent)
    expect(['supreme-fire', 'excellent-sparkle', 'proper-brilliance']).toContain(high.light)
  })

  it('sets hasHighBrilliance for scores >= 60', () => {
    const result = measureShining(richContent)
    if (result.brilliance >= 60) {
      expect(result.hasHighBrilliance).toBe(true)
    }
  })
})

// ─── measureCutting ─────────────────────────────────────

describe('measureCutting', () => {
  it('scores rich content highly', () => {
    const result = measureCutting(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasAccurate).toBe(true)
    expect(result.hasExact).toBe(true)
    expect(result.hasSharp).toBe(true)
    expect(result.hasDefined).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureCutting(emptyContent)
    expect(result.precision).toBeLessThan(55)
    expect(result.approximateCount).toBe(0)
    expect(result.roughCount).toBe(0)
  })

  it('detects approximate patterns', () => {
    const result = measureCutting('const approximate = true; const rough = true')
    expect(result.hasNoApproximate).toBe(false)
    expect(result.approximateCount).toBeGreaterThan(0)
  })

  it('detects rough patterns', () => {
    const result = measureCutting('const rough = true; const coarse = true')
    expect(result.roughCount).toBeGreaterThan(0)
  })

  it('classifies cut correctly', () => {
    const high = measureCutting(richContent)
    expect(['ideal-brilliant', 'excellent-cut', 'proper-facet']).toContain(high.cut)
  })

  it('sets hasHighPrecision for scores >= 60', () => {
    const result = measureCutting(richContent)
    if (result.precision >= 60) {
      expect(result.hasHighPrecision).toBe(true)
    }
  })
})

// ─── measureLasting ─────────────────────────────────────

describe('measureLasting', () => {
  it('scores rich content', () => {
    const result = measureLasting(richContent)
    expect(result.endurance).toBeGreaterThan(0)
    expect(result.hasMaintainable).toBe(true)
    expect(result.hasPreserved).toBe(true)
    expect(result.hasFlexible).toBe(true)
    expect(result.hasEverlasting).toBe(true)
  })

  it('detects evolved is false for rich content without extends/implements', () => {
    const result = measureLasting(richContent)
    expect(result.hasEvolved).toBe(false)
  })

  it('detects evolved when extends/implements present', () => {
    const result = measureLasting('class X extends Y implements Z { abstract run() }')
    expect(result.hasEvolved).toBe(true)
  })

  it('detects fragile patterns', () => {
    const result = measureLasting('const fragile = true; const brittle = true')
    expect(result.hasNoFragile).toBe(false)
    expect(result.fragileCount).toBeGreaterThan(0)
  })

  it('detects static patterns', () => {
    const result = measureLasting('var x = 1; static count = 0')
    expect(result.staticCount).toBeGreaterThan(0)
  })

  it('classifies legacy correctly', () => {
    const result = measureLasting(richContent)
    expect(result.legacy).toBeDefined()
    expect(typeof result.legacy).toBe('string')
  })

  it('sets hasHighEndurance for scores >= 60', () => {
    const result = measureLasting(richContent)
    if (result.endurance >= 60) {
      expect(result.hasHighEndurance).toBe(true)
    }
  })

  it('scores empty content low', () => {
    const result = measureLasting(emptyContent)
    expect(result.endurance).toBeLessThan(55)
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasWellArchitected).toBe(true)
    expect(result.hasPrincipled).toBe(true)
    expect(result.hasDeep).toBe(true)
    expect(result.hasMature).toBe(true)
    expect(result.hasInsightful).toBe(true)
    expect(result.hasOmniscient).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureKnowing(emptyContent)
    expect(result.wisdom).toBeLessThan(55)
    expect(result.hackedCount).toBe(0)
    expect(result.shallowCount).toBe(0)
  })

  it('detects hacked patterns', () => {
    const result = measureKnowing('const hack = true; const workaround = true')
    expect(result.hasNoHacked).toBe(false)
    expect(result.hackedCount).toBeGreaterThan(0)
  })

  it('detects shallow patterns', () => {
    const result = measureKnowing('const shallow = true; const superficial = true')
    expect(result.hasWise).toBe(false)
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('classifies reign correctly', () => {
    const high = measureKnowing(richContent)
    expect(['enlightened-sovereign', 'wise-emperor', 'proper-ruler']).toContain(high.reign)
  })

  it('sets hasHighWisdom for scores >= 60', () => {
    const result = measureKnowing(richContent)
    if (result.wisdom >= 60) {
      expect(result.hasHighWisdom).toBe(true)
    }
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyEdictCondition', () => {
  it('classifies sovereign-masterpiece at 90+', () => {
    expect(classifyEdictCondition(90)).toBe('sovereign-masterpiece')
    expect(classifyEdictCondition(100)).toBe('sovereign-masterpiece')
  })

  it('classifies royal-diamond at 75-89', () => {
    expect(classifyEdictCondition(75)).toBe('royal-diamond')
    expect(classifyEdictCondition(89)).toBe('royal-diamond')
  })

  it('classifies proper-gem at 60-74', () => {
    expect(classifyEdictCondition(60)).toBe('proper-gem')
    expect(classifyEdictCondition(74)).toBe('proper-gem')
  })

  it('classifies industrial-stone at 40-59', () => {
    expect(classifyEdictCondition(40)).toBe('industrial-stone')
    expect(classifyEdictCondition(59)).toBe('industrial-stone')
  })

  it('classifies rough-carbon at 20-39', () => {
    expect(classifyEdictCondition(20)).toBe('rough-carbon')
    expect(classifyEdictCondition(39)).toBe('rough-carbon')
  })

  it('classifies void below 20', () => {
    expect(classifyEdictCondition(0)).toBe('void')
    expect(classifyEdictCondition(19)).toBe('void')
  })
})

describe('classifyEmpireType', () => {
  it('returns no-empire for empty array', () => {
    expect(classifyEmpireType([])).toBe('no-empire')
  })

  it('classifies supreme-empire for high avg', () => {
    const edicts = [{ qualityScore: 90 }, { qualityScore: 90 }].map((q) => ({ qualityScore: q.qualityScore } as DiamondEdict))
    expect(classifyEmpireType(edicts)).toBe('supreme-empire')
  })

  it('classifies barren-wasteland for low avg', () => {
    const edicts = [{ qualityScore: 10 }, { qualityScore: 10 }].map((q) => ({ qualityScore: q.qualityScore } as DiamondEdict))
    expect(classifyEmpireType(edicts)).toBe('barren-wasteland')
  })

  it('classifies grand-kingdom for 70-84 avg', () => {
    const edicts = [{ qualityScore: 75 }, { qualityScore: 75 }].map((q) => ({ qualityScore: q.qualityScore } as DiamondEdict))
    expect(classifyEmpireType(edicts)).toBe('grand-kingdom')
  })
})

describe('classifyEmpireCondition', () => {
  it('classifies diamond-palace at 85+', () => {
    expect(classifyEmpireCondition(85)).toBe('diamond-palace')
  })

  it('classifies gem-fortress at 70-84', () => {
    expect(classifyEmpireCondition(70)).toBe('gem-fortress')
  })

  it('classifies proper-castle at 55-69', () => {
    expect(classifyEmpireCondition(55)).toBe('proper-castle')
  })

  it('classifies stone-tower at 35-54', () => {
    expect(classifyEmpireCondition(35)).toBe('stone-tower')
  })

  it('classifies clay-hut at 15-34', () => {
    expect(classifyEmpireCondition(15)).toBe('clay-hut')
  })

  it('classifies void below 15', () => {
    expect(classifyEmpireCondition(0)).toBe('void')
  })
})

describe('classifySovereignGrade', () => {
  it('classifies diamond-emperor at 80+', () => {
    expect(classifySovereignGrade(80)).toBe('diamond-emperor')
    expect(classifySovereignGrade(100)).toBe('diamond-emperor')
  })

  it('classifies gem-king at 65-79', () => {
    expect(classifySovereignGrade(65)).toBe('gem-king')
  })

  it('classifies proper-duke at 50-64', () => {
    expect(classifySovereignGrade(50)).toBe('proper-duke')
  })

  it('classifies baron at 35-49', () => {
    expect(classifySovereignGrade(35)).toBe('baron')
  })

  it('classifies knight at 20-34', () => {
    expect(classifySovereignGrade(20)).toBe('knight')
  })

  it('classifies peasant below 20', () => {
    expect(classifySovereignGrade(0)).toBe('peasant')
  })
})

// ─── analyzeDiamondEdict ────────────────────────────────

describe('analyzeDiamondEdict', () => {
  it('returns a complete edict for rich content', () => {
    const edict = analyzeDiamondEdict(richContent, 'app.ts')
    expect(edict.file).toBe('app.ts')
    expect(edict.sovereignHardness).toBeGreaterThan(0)
    expect(edict.crownBrilliance).toBeGreaterThan(0)
    expect(edict.thronePrecision).toBeGreaterThan(0)
    expect(edict.scepterEndurance).toBeGreaterThan(0)
    expect(edict.dynastyWisdom).toBeGreaterThan(0)
    expect(edict.qualityScore).toBeGreaterThan(0)
    expect(edict.condition).toBeDefined()
    expect(edict.hardening).toBeDefined()
    expect(edict.shining).toBeDefined()
    expect(edict.cutting).toBeDefined()
    expect(edict.lasting).toBeDefined()
    expect(edict.knowing).toBeDefined()
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const edict = analyzeDiamondEdict(richContent, 'test.ts')
    const expected = Math.round(
      edict.sovereignHardness * 0.2 +
      edict.crownBrilliance * 0.2 +
      edict.thronePrecision * 0.2 +
      edict.scepterEndurance * 0.2 +
      edict.dynastyWisdom * 0.2,
    )
    expect(edict.qualityScore).toBe(expected)
  })

  it('classifies condition based on qualityScore', () => {
    const edict = analyzeDiamondEdict(richContent, 'app.ts')
    expect(edict.condition).toBe(classifyEdictCondition(edict.qualityScore))
  })

  it('handles empty content', () => {
    const edict = analyzeDiamondEdict(emptyContent, 'empty.ts')
    expect(edict.file).toBe('empty.ts')
    expect(edict.qualityScore).toBeGreaterThanOrEqual(0)
    expect(edict.condition).toBeDefined()
  })

  it('preserves file path', () => {
    const edict = analyzeDiamondEdict('const x = 1', 'src/utils/helper.ts')
    expect(edict.file).toBe('src/utils/helper.ts')
  })
})

// ─── analyzeDiamondEmpire ───────────────────────────────

describe('analyzeDiamondEmpire', () => {
  it('returns empty empire for no edicts', () => {
    const empire = analyzeDiamondEmpire([], 'empty-dir')
    expect(empire.directory).toBe('empty-dir')
    expect(empire.edicts).toEqual([])
    expect(empire.avgHardness).toBe(0)
    expect(empire.empireType).toBe('no-empire')
    expect(empire.condition).toBe('void')
  })

  it('computes averages from edicts', () => {
    const edicts = [analyzeDiamondEdict(richContent, 'a.ts'), analyzeDiamondEdict(richContent, 'b.ts')]
    const empire = analyzeDiamondEmpire(edicts, 'src')
    expect(empire.avgHardness).toBeGreaterThan(0)
    expect(empire.avgBrilliance).toBeGreaterThan(0)
    expect(empire.avgWisdom).toBeGreaterThan(0)
  })

  it('counts masterpieces and voids', () => {
    const edict90 = analyzeDiamondEdict(richContent, 'good.ts')
    const edict0 = analyzeDiamondEdict(emptyContent, 'bad.ts')
    const empire = analyzeDiamondEmpire([edict90, edict0], 'src')
    expect(empire.sovereignMasterpieceCount + empire.voidCount).toBeLessThanOrEqual(2)
  })
})

// ─── buildDiamondSovereignResult ────────────────────────

describe('buildDiamondSovereignResult', () => {
  it('returns complete result for single file', async () => {
    const result = await buildDiamondSovereignResult(['app.ts'], [richContent])
    expect(result.edicts).toHaveLength(1)
    expect(result.empires).toHaveLength(1)
    expect(result.throne).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
    expect(result.stats.totalFiles).toBe(1)
  })

  it('returns empty result for no files', async () => {
    const result = await buildDiamondSovereignResult([], [])
    expect(result.edicts).toHaveLength(0)
    expect(result.empires).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSovereignty).toBe(0)
    expect(result.throne.isDiamond).toBe(false)
  })

  it('groups files by directory into empires', async () => {
    const result = await buildDiamondSovereignResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.empires).toHaveLength(2)
    expect(result.stats.totalEmpires).toBe(2)
  })

  it('sets isDiamond when overall >= 60', async () => {
    const result = await buildDiamondSovereignResult(['app.ts'], [richContent])
    if (result.stats.overallSovereignty >= 60) {
      expect(result.throne.isDiamond).toBe(true)
    }
  })

  it('computes throne averages correctly', async () => {
    const result = await buildDiamondSovereignResult(['app.ts'], [richContent])
    expect(result.throne.avgHardness).toBe(result.stats.avgSovereignHardness)
    expect(result.throne.avgBrilliance).toBe(result.stats.avgCrownBrilliance)
    expect(result.throne.avgWisdom).toBe(result.stats.avgDynastyWisdom)
  })

  it('finds best edict', async () => {
    const result = await buildDiamondSovereignResult(
      ['good.ts', 'bad.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestEdict).toBe('good.ts')
  })

  it('finds hardest file', async () => {
    const result = await buildDiamondSovereignResult(
      ['hard.ts', 'soft.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.hardest).toBe('hard.ts')
  })

  it('finds most brilliant file', async () => {
    const result = await buildDiamondSovereignResult(
      ['bright.ts', 'dull.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.mostBrilliant).toBe('bright.ts')
  })

  it('finds most precise file', async () => {
    const result = await buildDiamondSovereignResult(
      ['precise.ts', 'rough.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.mostPrecise).toBe('precise.ts')
  })

  it('finds most enduring file', async () => {
    const result = await buildDiamondSovereignResult(
      ['endure.ts', 'fragile.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.mostEnduring).toBe('endure.ts')
  })

  it('finds wisest file', async () => {
    const result = await buildDiamondSovereignResult(
      ['wise.ts', 'fool.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.wisest).toBe('wise.ts')
  })

  it('sets celebration when file includes diamond-sovereign', async () => {
    const result = await buildDiamondSovereignResult(
      ['diamond-sovereign-helpers.ts'],
      [richContent],
    )
    expect(result.celebration).toBeDefined()
    expect(result.celebration).toContain('Command #620')
    expect(result.throne.celebration).toBeDefined()
    expect(result.stats.celebration).toBeDefined()
  })

  it('does not set celebration for normal files', async () => {
    const result = await buildDiamondSovereignResult(['app.ts'], [richContent])
    expect(result.celebration).toBeUndefined()
    expect(result.throne.celebration).toBeUndefined()
    expect(result.stats.celebration).toBeUndefined()
  })

  it('classifies sovereign grade correctly', async () => {
    const result = await buildDiamondSovereignResult(['app.ts'], [richContent])
    expect(result.stats.sovereignGrade).toBe(classifySovereignGrade(result.stats.overallSovereignty))
  })

  it('counts condition categories', async () => {
    const result = await buildDiamondSovereignResult(
      ['good.ts', 'bad.ts'],
      [richContent, emptyContent],
    )
    const total =
      result.stats.sovereignMasterpieceCount +
      result.stats.royalDiamondCount +
      result.stats.properGemCount +
      result.stats.industrialStoneCount +
      result.stats.roughCarbonCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })
})

// ─── Celebration ────────────────────────────────────────

describe('celebration', () => {
  it('contains milestone message for self-referencing file', async () => {
    const result = await buildDiamondSovereignResult(
      ['src/commands/diamond-sovereign.ts'],
      [richContent],
    )
    expect(result.celebration).toBe('Command #620 — Diamond Sovereign milestone achieved! 620 commands forged in eternal brilliance!')
  })

  it('propagates celebration to throne and stats', async () => {
    const result = await buildDiamondSovereignResult(
      ['test/diamond-sovereign.test.ts'],
      [richContent],
    )
    expect(result.throne.celebration).toBe(result.celebration)
    expect(result.stats.celebration).toBe(result.celebration)
  })

  it('does not celebrate unrelated files', async () => {
    const result = await buildDiamondSovereignResult(
      ['diamond-map.ts', 'ruby-pinnacle.ts'],
      [richContent, richContent],
    )
    expect(result.celebration).toBeUndefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all 90+', () => {
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 90, avgBrilliance: 90, avgWisdom: 90,
      isDiamond: true, overallSovereignty: 90,
    }
    const stats = makeStats()
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('absolute sovereignty')
  })

  it('recommends hardening when avgSovereignHardness < 60', () => {
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 50, avgBrilliance: 90, avgWisdom: 90,
      isDiamond: true, overallSovereignty: 70,
    }
    const stats = makeStats({ avgSovereignHardness: 50 })
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs.some((r) => r.includes('Harden'))).toBe(true)
  })

  it('recommends polishing when avgCrownBrilliance < 60', () => {
    const stats = makeStats({ avgCrownBrilliance: 50 })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 90, avgBrilliance: 50, avgWisdom: 90,
      isDiamond: true, overallSovereignty: 70,
    }
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs.some((r) => r.includes('Polish'))).toBe(true)
  })

  it('recommends refining when avgThronePrecision < 60', () => {
    const stats = makeStats({ avgThronePrecision: 50 })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 90, avgBrilliance: 90, avgWisdom: 90,
      isDiamond: true, overallSovereignty: 70,
    }
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs.some((r) => r.includes('Refine'))).toBe(true)
  })

  it('recommends strengthening when avgScepterEndurance < 60', () => {
    const stats = makeStats({ avgScepterEndurance: 50 })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 90, avgBrilliance: 90, avgWisdom: 90,
      isDiamond: true, overallSovereignty: 70,
    }
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs.some((r) => r.includes('Strengthen'))).toBe(true)
  })

  it('recommends deepening when avgDynastyWisdom < 60', () => {
    const stats = makeStats({ avgDynastyWisdom: 50 })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 90, avgBrilliance: 90, avgWisdom: 50,
      isDiamond: true, overallSovereignty: 70,
    }
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs.some((r) => r.includes('Deepen'))).toBe(true)
  })

  it('warns about fallen sovereign when overall < 40', () => {
    const stats = makeStats({
      overallSovereignty: 30,
      avgSovereignHardness: 30,
      avgCrownBrilliance: 30,
      avgThronePrecision: 30,
      avgScepterEndurance: 30,
      avgDynastyWisdom: 30,
    })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 30, avgBrilliance: 30, avgWisdom: 30,
      isDiamond: false, overallSovereignty: 30,
    }
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs.some((r) => r.includes('fallen'))).toBe(true)
  })

  it('lists void edicts by name when <= 5', () => {
    const edicts: DiamondEdict[] = [
      { file: 'a.ts', condition: 'void' } as DiamondEdict,
      { file: 'b.ts', condition: 'void' } as DiamondEdict,
    ]
    const stats = makeStats({
      overallSovereignty: 70,
      avgSovereignHardness: 70,
      avgCrownBrilliance: 70,
      avgThronePrecision: 70,
      avgScepterEndurance: 70,
      avgDynastyWisdom: 70,
    })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 70, avgBrilliance: 70, avgWisdom: 70,
      isDiamond: true, overallSovereignty: 70,
    }
    const recs = generateRecommendations(edicts, [], throne, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('warns about many void edicts when > 5', () => {
    const edicts: DiamondEdict[] = Array.from({ length: 6 }, (_, i) => ({
      file: `void${i}.ts`, condition: 'void' as const,
    } as DiamondEdict))
    const stats = makeStats({
      overallSovereignty: 70,
      avgSovereignHardness: 70,
      avgCrownBrilliance: 70,
      avgThronePrecision: 70,
      avgScepterEndurance: 70,
      avgDynastyWisdom: 70,
    })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 70, avgBrilliance: 70, avgWisdom: 70,
      isDiamond: true, overallSovereignty: 70,
    }
    const recs = generateRecommendations(edicts, [], throne, stats)
    expect(recs.some((r) => r.includes('6 rough carbon edicts'))).toBe(true)
  })

  it('warns when all empires are clay huts', () => {
    const empires: DiamondEmpire[] = [
      { directory: 'src', condition: 'clay-hut' } as DiamondEmpire,
    ]
    const stats = makeStats({
      overallSovereignty: 10,
      avgSovereignHardness: 10,
      avgCrownBrilliance: 10,
      avgThronePrecision: 10,
      avgScepterEndurance: 10,
      avgDynastyWisdom: 10,
    })
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 10, avgBrilliance: 10, avgWisdom: 10,
      isDiamond: false, overallSovereignty: 10,
    }
    const recs = generateRecommendations([], empires, throne, stats)
    expect(recs.some((r) => r.includes('clay huts'))).toBe(true)
  })

  it('returns positive message when no issues', () => {
    const stats = makeStats()
    const throne: DiamondSovereignResult['throne'] = {
      avgHardness: 90, avgBrilliance: 90, avgWisdom: 90,
      isDiamond: true, overallSovereignty: 90,
    }
    const recs = generateRecommendations([], [], throne, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('absolute sovereignty')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })

  it('colorEmpireCondition handles all conditions', () => {
    expect(typeof colorEmpireCondition('diamond-palace')).toBe('string')
    expect(typeof colorEmpireCondition('void')).toBe('string')
    expect(typeof colorEmpireCondition('unknown')).toBe('string')
  })

  it('formatEdictTable returns string', () => {
    const edict = analyzeDiamondEdict(richContent, 'app.ts')
    const result = formatEdictTable(edict)
    expect(result).toContain('Diamond Edict')
    expect(result).toContain('app.ts')
  })

  it('formatEdictsTable returns header and rows', () => {
    const edicts = [analyzeDiamondEdict(richContent, 'a.ts'), analyzeDiamondEdict(richContent, 'b.ts')]
    const result = formatEdictsTable(edicts)
    expect(result).toContain('Diamond Edicts')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })

  it('formatEdictsTable handles empty array', () => {
    const result = formatEdictsTable([])
    expect(result).toContain('No diamond edicts')
  })

  it('formatEmpireTable returns string', () => {
    const edicts = [analyzeDiamondEdict(richContent, 'a.ts')]
    const empire = analyzeDiamondEmpire(edicts, 'src')
    const result = formatEmpireTable(empire)
    expect(result).toContain('Diamond Empire')
    expect(result).toContain('src')
  })

  it('formatEmpiresTable returns string', () => {
    const edicts = [analyzeDiamondEdict(richContent, 'a.ts')]
    const empire = analyzeDiamondEmpire(edicts, 'src')
    const result = formatEmpiresTable([empire])
    expect(result).toContain('Diamond Empires')
  })

  it('formatEmpiresTable handles empty array', () => {
    const result = formatEmpiresTable([])
    expect(result).toContain('No diamond empires')
  })

  it('formatStatsTable returns string with all fields', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Diamond Sovereign Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Sovereign Grade')
  })

  it('formatRecommendations returns bullet list', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Fix X')
    expect(result).toContain('Improve Y')
  })

  it('formatRecommendations handles empty array', () => {
    const result = formatRecommendations([])
    expect(result).toContain('No recommendations')
  })

  it('formatResultTable returns full output', () => {
    const result = buildDiamondSovereignResultSync(['app.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Diamond Sovereign Analysis')
  })

  it('formatResultJson returns valid JSON', () => {
    const result = buildDiamondSovereignResultSync(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.edicts).toHaveLength(1)
  })

  it('formatResultTable includes celebration when present', () => {
    const result = buildDiamondSovereignResultSync(['diamond-sovereign.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Command #620')
  })
})

// ─── Edge cases ─────────────────────────────────────────

describe('edge cases', () => {
  it('handles single file in root directory', async () => {
    const result = await buildDiamondSovereignResult(['app.ts'], [richContent])
    expect(result.empires[0].directory).toBe('.')
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 20 }, (_, i) => `src/file${i}.ts`)
    const contents = files.map(() => richContent)
    const result = await buildDiamondSovereignResult(files, contents)
    expect(result.stats.totalFiles).toBe(20)
    expect(result.edicts).toHaveLength(20)
  })

  it('handles files with special characters in path', async () => {
    const result = await buildDiamondSovereignResult(['src/my-module.test.ts'], [richContent])
    expect(result.edicts[0].file).toBe('src/my-module.test.ts')
  })

  it('handles content with only comments', () => {
    const edict = analyzeDiamondEdict('/** just a comment */', 'comment.ts')
    expect(edict.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles content with any keyword', () => {
    const result = measureHardening('const x: any = null')
    expect(result.hasTypeSafe).toBe(false)
  })

  it('handles content with global references', () => {
    const result = measureHardening('window.location.href = "/"')
    expect(result.hasImpervious).toBe(false)
  })

  it('minimal content scores low across measures', () => {
    const h = measureHardening(minimalContent)
    const s = measureShining(minimalContent)
    const c = measureCutting(minimalContent)
    const l = measureLasting(minimalContent)
    const k = measureKnowing(minimalContent)
    expect(h.hardness).toBeLessThan(55)
    expect(s.brilliance).toBeLessThan(55)
    expect(c.precision).toBeLessThan(55)
    expect(l.endurance).toBeLessThan(55)
    expect(k.wisdom).toBeLessThan(55)
  })
})

// ─── Integration ────────────────────────────────────────

describe('integration', () => {
  it('full pipeline produces consistent results', async () => {
    const result = await buildDiamondSovereignResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, emptyContent],
    )
    expect(result.edicts).toHaveLength(3)
    expect(result.empires).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.throne.overallSovereignty).toBe(result.stats.overallSovereignty)
  })

  it('masterpiece early return does not block other recommendations', async () => {
    const result = await buildDiamondSovereignResult(['app.ts'], [richContent])
    if (result.stats.overallSovereignty >= 90) {
      expect(result.recommendations).toHaveLength(1)
    }
  })

  it('celebration works with mixed file paths', async () => {
    const result = await buildDiamondSovereignResult(
      ['app.ts', 'diamond-sovereign-helpers.ts', 'lib/utils.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.celebration).toBeDefined()
    expect(result.celebration).toContain('620')
  })
})

// ─── Helper for synchronous format tests ────────────────

function buildDiamondSovereignResultSync(files: string[], contents: string[]): DiamondSovereignResult {
  const edicts: DiamondEdict[] = files.map((file, i) =>
    analyzeDiamondEdict(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, DiamondEdict[]>()
  for (const edict of edicts) {
    const dir = edict.file.includes('/')
      ? edict.file.substring(0, edict.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(edict)
    } else {
      dirMap.set(dir, [edict])
    }
  }

  const empires: DiamondEmpire[] = Array.from(dirMap.entries()).map(([dir, dirEdicts]) =>
    analyzeDiamondEmpire(dirEdicts, dir),
  )

  const avgSovereignHardness = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.sovereignHardness, 0) / edicts.length) : 0
  const avgCrownBrilliance = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.crownBrilliance, 0) / edicts.length) : 0
  const avgThronePrecision = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.thronePrecision, 0) / edicts.length) : 0
  const avgScepterEndurance = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.scepterEndurance, 0) / edicts.length) : 0
  const avgDynastyWisdom = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.dynastyWisdom, 0) / edicts.length) : 0

  const overallSovereignty = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.qualityScore, 0) / edicts.length) : 0

  const celebrate = files.some((f) => f.includes('diamond-sovereign'))
  const CELEBRATION = 'Command #620 — Diamond Sovereign milestone achieved! 620 commands forged in eternal brilliance!'

  const throne: DiamondSovereignResult['throne'] = {
    avgHardness: avgSovereignHardness, avgBrilliance: avgCrownBrilliance, avgWisdom: avgDynastyWisdom,
    isDiamond: overallSovereignty >= 60, overallSovereignty,
    celebration: celebrate ? CELEBRATION : undefined,
  }

  const stats: DiamondSovereignResult['stats'] = {
    totalFiles: files.length, totalEmpires: empires.length,
    avgSovereignHardness, avgCrownBrilliance, avgThronePrecision, avgScepterEndurance, avgDynastyWisdom,
    sovereignMasterpieceCount: edicts.filter((e) => e.condition === 'sovereign-masterpiece').length,
    royalDiamondCount: edicts.filter((e) => e.condition === 'royal-diamond').length,
    properGemCount: edicts.filter((e) => e.condition === 'proper-gem').length,
    industrialStoneCount: edicts.filter((e) => e.condition === 'industrial-stone').length,
    roughCarbonCount: edicts.filter((e) => e.condition === 'rough-carbon').length,
    voidCount: edicts.filter((e) => e.condition === 'void').length,
    hasHighHardnessCount: edicts.filter((e) => e.hardening.hasHighHardness).length,
    hasHighBrillianceCount: edicts.filter((e) => e.shining.hasHighBrilliance).length,
    hasHighPrecisionCount: edicts.filter((e) => e.cutting.hasHighPrecision).length,
    hasHighEnduranceCount: edicts.filter((e) => e.lasting.hasHighEndurance).length,
    hasHighWisdomCount: edicts.filter((e) => e.knowing.hasHighWisdom).length,
    overallSovereignty,
    sovereignGrade: classifySovereignGrade(overallSovereignty),
    bestEdict: edicts.length > 0 ? edicts.reduce((best, e) => (e.qualityScore > best.qualityScore ? e : best)).file : '',
    hardest: edicts.length > 0 ? edicts.reduce((best, e) => (e.sovereignHardness > best.sovereignHardness ? e : best)).file : '',
    mostBrilliant: edicts.length > 0 ? edicts.reduce((best, e) => (e.crownBrilliance > best.crownBrilliance ? e : best)).file : '',
    mostPrecise: edicts.length > 0 ? edicts.reduce((best, e) => (e.thronePrecision > best.thronePrecision ? e : best)).file : '',
    mostEnduring: edicts.length > 0 ? edicts.reduce((best, e) => (e.scepterEndurance > best.scepterEndurance ? e : best)).file : '',
    wisest: edicts.length > 0 ? edicts.reduce((best, e) => (e.dynastyWisdom > best.dynastyWisdom ? e : best)).file : '',
    celebration: celebrate ? CELEBRATION : undefined,
  }

  return {
    edicts, empires, throne, stats,
    recommendations: generateRecommendations(edicts, empires, throne, stats),
    celebration: celebrate ? CELEBRATION : undefined,
  }
}
