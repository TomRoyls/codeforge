import { describe, expect, it } from 'vitest'

import {
  type CuttingMeasure,
  type EnduringMeasure,
  type KnowingMeasure,
  type ObsidianBlock,
  type ObsidianCondition,
  type ObsidianShrine as ObsidianShrineType,
  type ObsidianTempleResult,
  type PriestGrade,
  type ReflectingMeasure,
  type RevealingMeasure,
  type ShrineCondition,
  type ShrineType,
  analyzeObsidianBlock,
  analyzeObsidianShrine,
  buildObsidianTempleResult,
  classifyObsidianCondition,
  classifyPriestGrade,
  classifyShrineCondition,
  classifyShrineType,
  generateRecommendations,
  measureCutting,
  measureEnduring,
  measureKnowing,
  measureReflecting,
  measureRevealing,
} from '../src/commands/obsidian-shrine-helpers.js'

import {
  colorScore,
  colorShrineCondition,
  formatBlockTable,
  formatBlocksTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatShrineTable,
  formatShrinesTable,
  formatStatsTable,
} from '../src/commands/obsidian-shrine-format-helpers.js'

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

function makeBlock(
  file: string,
  clarity: number,
  resilience: number,
  depth: number,
  precision: number,
  wisdom: number,
): ObsidianBlock {
  const qualityScore = Math.round(clarity * 0.2 + resilience * 0.2 + depth * 0.2 + precision * 0.2 + wisdom * 0.2)
  return {
    file,
    volcanicClarity: clarity,
    darkResilience: resilience,
    mirrorDepth: depth,
    bladePrecision: precision,
    shadowWisdom: wisdom,
    revealing: { clarity, volcanic: 'perfect-mirror', hasHighClarity: clarity >= 60, hasReadable: true, hasNoCryptic: true, hasSelfDocumenting: true, hasNoMystery: true, hasClear: true, hasNoObfuscated: true, hasTransparent: true, hasUnderstandable: true, hasVisible: true, hasDirect: true, hasRevealed: true, hasIlluminated: true, hasOpen: true, hasExpressive: true, hasHonest: true, crypticCount: 0, obfuscatedCount: 0 } as RevealingMeasure,
    enduring: { resilience, shadow: 'volcanic-strength', hasHighResilience: resilience >= 60, hasErrorHandled: true, hasNoUnhandled: true, hasDefensive: true, hasRobust: true, hasTested: true, hasNoUntested: true, hasStable: true, hasHardened: true, hasEnduring: true, hasSolid: true, hasReinforced: true, hasImpervious: true, hasFortified: true, hasUnshakable: true, hasUnyielding: true, unhandledCount: 0, untestedCount: 0 } as EnduringMeasure,
    reflecting: { depth, mirror: 'scrying-mirror', hasHighDepth: depth >= 60, hasWellStructured: true, hasNoChaotic: true, hasSelfAware: true, hasIntrospective: true, hasDocumented: true, hasOrganized: true, hasCoherent: true, hasConsistent: true, hasUnified: true, hasClean: true, hasModular: true, hasMaintainable: true, hasRefactorable: true, hasHarmonious: true, hasSelfContained: true, chaoticCount: 0, undocumentedCount: 0 } as ReflectingMeasure,
    cutting: { precision, blade: 'surgeon-scalpel', hasHighPrecision: precision >= 60, hasTypeSafe: true, hasNoUnsafe: true, hasAccurate: true, hasNoApproximate: true, hasExact: true, hasClean: true, hasPrecise: true, hasCorrect: true, hasFaithful: true, hasSharp: true, hasCrisp: true, hasDefined: true, hasTargeted: true, hasSurgical: true, hasCalibrated: true, unsafeCount: 0, approximateCount: 0 } as CuttingMeasure,
    knowing: { wisdom, shadow: 'shadow-sage', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasProven: true, hasMature: true, hasStrategic: true, hasInsightful: true, hasExperienced: true, hasReflective: true, hasEvolved: true, hasAdaptive: true, hasAware: true, hasKnowledgeable: true, hasAccumulated: true, hackedCount: 0, naiveCount: 0 } as KnowingMeasure,
    condition: classifyObsidianCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<ObsidianTempleResult['stats']> = {}): ObsidianTempleResult['stats'] {
  return {
    totalFiles: 1,
    totalShrines: 1,
    avgVolcanicClarity: 80,
    avgDarkResilience: 80,
    avgMirrorDepth: 80,
    avgBladePrecision: 80,
    avgShadowWisdom: 80,
    obsidianMasterpieceCount: 0,
    volcanicPerfectionCount: 1,
    properBladeCount: 0,
    dullGlassCount: 0,
    shatteredRockCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighResilienceCount: 1,
    hasHighDepthCount: 1,
    hasHighPrecisionCount: 1,
    hasHighWisdomCount: 1,
    overallSharpness: 80,
    priestGrade: 'temple-guardian' as PriestGrade,
    bestBlock: 'app.ts',
    clearest: 'app.ts',
    mostResilient: 'app.ts',
    deepest: 'app.ts',
    sharpest: 'app.ts',
    wisest: 'app.ts',
    ...overrides,
  }
}

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBe(100)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureRevealing(emptyContent)
    expect(result.clarity).toBeLessThan(50)
  })

  it('detects cryptic patterns', () => {
    const result = measureRevealing('cryptic obfuscated minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated var/eval', () => {
    const result = measureRevealing('var x = eval("1")')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects readable class/interface/type', () => {
    expect(measureRevealing('class Foo {}').hasReadable).toBe(true)
  })

  it('detects self-documenting types', () => {
    expect(measureRevealing('const x: string = "ok"').hasSelfDocumenting).toBe(true)
  })

  it('detects clear code (no any)', () => {
    expect(measureRevealing('const x: string = "ok"').hasClear).toBe(true)
  })

  it('penalizes any keyword', () => {
    expect(measureRevealing('const x: any = 1').hasClear).toBe(false)
  })

  it('detects transparent import/export', () => {
    expect(measureRevealing('import { X } from "y"').hasTransparent).toBe(true)
  })

  it('detects revealed documentation', () => {
    expect(measureRevealing('/** doc */').hasRevealed).toBe(true)
  })

  it('penalizes global/window/document', () => {
    expect(measureRevealing('window.document').hasNoMystery).toBe(false)
  })

  it('penalizes hack/workaround/kludge', () => {
    expect(measureRevealing('hack workaround code').hasHonest).toBe(false)
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content highly', () => {
    const result = measureEnduring(richContent)
    expect(result.resilience).toBe(100)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureEnduring(emptyContent)
    expect(result.resilience).toBeLessThan(50)
  })

  it('detects error handling', () => {
    expect(measureEnduring('try { x } catch { y }').hasErrorHandled).toBe(true)
  })

  it('detects unhandled eval/Function', () => {
    const result = measureEnduring('eval("code")')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects defensive types', () => {
    expect(measureEnduring('const x: string = "ok"').hasDefensive).toBe(true)
  })

  it('detects robust (no any)', () => {
    expect(measureEnduring('const x: string').hasRobust).toBe(true)
  })

  it('penalizes any keyword', () => {
    expect(measureEnduring('const x: any').hasRobust).toBe(false)
  })

  it('detects hardened access modifiers', () => {
    expect(measureEnduring('readonly x: string').hasHardened).toBe(true)
  })

  it('detects reinforced import/export', () => {
    expect(measureEnduring('export { X }').hasReinforced).toBe(true)
  })

  it('detects impervious (no global/window)', () => {
    expect(measureEnduring('const x = 1').hasImpervious).toBe(true)
  })

  it('penalizes var/eval', () => {
    expect(measureEnduring('var x = eval("1")').hasUnshakable).toBe(false)
  })
})

// ─── measureReflecting ──────────────────────────────────

describe('measureReflecting', () => {
  it('scores rich content highly', () => {
    const result = measureReflecting(richContent)
    expect(result.depth).toBe(100)
    expect(result.hasHighDepth).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureReflecting(emptyContent)
    expect(result.depth).toBeLessThan(50)
  })

  it('detects chaotic var/eval', () => {
    const result = measureReflecting('var x = eval("1")')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects self-aware types', () => {
    expect(measureReflecting('const x: string = "ok"').hasSelfAware).toBe(true)
  })

  it('detects documented code', () => {
    expect(measureReflecting('/** doc */').hasDocumented).toBe(true)
  })

  it('detects introspective docs', () => {
    expect(measureReflecting('/** doc */').hasIntrospective).toBe(true)
  })

  it('detects organized import/export', () => {
    expect(measureReflecting('export { X }').hasOrganized).toBe(true)
  })

  it('detects coherent (no any)', () => {
    expect(measureReflecting('const x = 1').hasCoherent).toBe(true)
  })

  it('detects harmonious try/catch/if', () => {
    expect(measureReflecting('try { x } catch { y }').hasHarmonious).toBe(true)
  })

  it('detects self-contained (no global)', () => {
    expect(measureReflecting('const x = 1').hasSelfContained).toBe(true)
  })

  it('penalizes any keyword', () => {
    expect(measureReflecting('const x: any').hasCoherent).toBe(false)
  })
})

// ─── measureCutting ─────────────────────────────────────

describe('measureCutting', () => {
  it('scores rich content highly', () => {
    const result = measureCutting(richContent)
    expect(result.precision).toBe(100)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureCutting(emptyContent)
    expect(result.precision).toBeLessThan(50)
  })

  it('detects unsafe patterns', () => {
    const result = measureCutting('const x: any = 1')
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const result = measureCutting('approximate rough guess hack code')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects type-safe annotations', () => {
    expect(measureCutting('const x: string = "ok"').hasTypeSafe).toBe(true)
  })

  it('detects exact class/interface/type', () => {
    expect(measureCutting('class Foo {}').hasExact).toBe(true)
  })

  it('detects crisp try/catch/if', () => {
    expect(measureCutting('try { x } catch { y }').hasCrisp).toBe(true)
  })

  it('detects defined documentation', () => {
    expect(measureCutting('/** doc */').hasDefined).toBe(true)
  })

  it('detects surgical (no var/eval)', () => {
    expect(measureCutting('const x = 1').hasSurgical).toBe(true)
  })

  it('penalizes any keyword', () => {
    expect(measureCutting('const x: any').hasAccurate).toBe(false)
  })

  it('penalizes var/eval for surgical', () => {
    expect(measureCutting('var x = eval("1")').hasSurgical).toBe(false)
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureKnowing(emptyContent)
    expect(result.wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureKnowing('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects naive patterns', () => {
    const result = measureKnowing('naive simple trivial code')
    expect(result.naiveCount).toBeGreaterThan(0)
  })

  it('detects well-architected class/interface/type', () => {
    expect(measureKnowing('class Foo {}').hasWellArchitected).toBe(true)
  })

  it('detects deep types', () => {
    expect(measureKnowing('const x: string = "ok"').hasDeep).toBe(true)
  })

  it('detects proven try/catch/if', () => {
    expect(measureKnowing('try { x } catch { y }').hasProven).toBe(true)
  })

  it('detects insightful documentation', () => {
    expect(measureKnowing('/** doc */').hasInsightful).toBe(true)
  })

  it('detects strategic import/export', () => {
    expect(measureKnowing('export { X }').hasStrategic).toBe(true)
  })

  it('penalizes any keyword', () => {
    expect(measureKnowing('const x: any').hasPrincipled).toBe(false)
  })

  it('penalizes var/eval', () => {
    expect(measureKnowing('var x = eval("1")').hasKnowledgeable).toBe(false)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyObsidianCondition', () => {
  it('returns obsidian-masterpiece for 90+', () => { expect(classifyObsidianCondition(95)).toBe('obsidian-masterpiece') })
  it('returns volcanic-perfection for 75-89', () => { expect(classifyObsidianCondition(80)).toBe('volcanic-perfection') })
  it('returns proper-blade for 60-74', () => { expect(classifyObsidianCondition(65)).toBe('proper-blade') })
  it('returns dull-glass for 40-59', () => { expect(classifyObsidianCondition(50)).toBe('dull-glass') })
  it('returns shattered-rock for 20-39', () => { expect(classifyObsidianCondition(30)).toBe('shattered-rock') })
  it('returns void below 20', () => { expect(classifyObsidianCondition(10)).toBe('void') })
})

describe('classifyShrineType', () => {
  it('returns no-shrine for empty blocks', () => { expect(classifyShrineType([])).toBe('no-shrine') })
  it('returns sacred-temple for high avg', () => { expect(classifyShrineType([makeBlock('a.ts', 90, 90, 90, 90, 90)])).toBe('sacred-temple') })
  it('returns volcanic-shrine for medium-high', () => { expect(classifyShrineType([makeBlock('a.ts', 75, 75, 75, 75, 75)])).toBe('volcanic-shrine') })
  it('returns proper-altar for medium', () => { expect(classifyShrineType([makeBlock('a.ts', 60, 60, 60, 60, 60)])).toBe('proper-altar') })
  it('returns stone-table for low', () => { expect(classifyShrineType([makeBlock('a.ts', 40, 40, 40, 40, 40)])).toBe('stone-table') })
  it('returns empty-pedestal for very low', () => { expect(classifyShrineType([makeBlock('a.ts', 20, 20, 20, 20, 20)])).toBe('empty-pedestal') })
})

describe('classifyShrineCondition', () => {
  it('returns obsidian-cathedral for 85+', () => { expect(classifyShrineCondition(90)).toBe('obsidian-cathedral') })
  it('returns dark-sanctuary for 70-84', () => { expect(classifyShrineCondition(75)).toBe('dark-sanctuary') })
  it('returns proper-temple for 55-69', () => { expect(classifyShrineCondition(60)).toBe('proper-temple') })
  it('returns ruined-shrine for 35-54', () => { expect(classifyShrineCondition(40)).toBe('ruined-shrine') })
  it('returns rubble for 15-34', () => { expect(classifyShrineCondition(20)).toBe('rubble') })
  it('returns void below 15', () => { expect(classifyShrineCondition(5)).toBe('void') })
})

describe('classifyPriestGrade', () => {
  it('returns high-priest for 80+', () => { expect(classifyPriestGrade(85)).toBe('high-priest') })
  it('returns temple-guardian for 65-79', () => { expect(classifyPriestGrade(70)).toBe('temple-guardian') })
  it('returns proper-artisan for 50-64', () => { expect(classifyPriestGrade(55)).toBe('proper-artisan') })
  it('returns apprentice for 35-49', () => { expect(classifyPriestGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyPriestGrade(25)).toBe('novice') })
  it('returns stone-breaker below 20', () => { expect(classifyPriestGrade(10)).toBe('stone-breaker') })
})

// ─── analyzeObsidianBlock ───────────────────────────────

describe('analyzeObsidianBlock', () => {
  it('returns a full ObsidianBlock for rich content', () => {
    const result = analyzeObsidianBlock(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.volcanicClarity).toBeGreaterThan(0)
    expect(result.darkResilience).toBeGreaterThan(0)
    expect(result.mirrorDepth).toBeGreaterThan(0)
    expect(result.bladePrecision).toBeGreaterThan(0)
    expect(result.shadowWisdom).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
    expect(result.revealing).toBeDefined()
    expect(result.enduring).toBeDefined()
    expect(result.reflecting).toBeDefined()
    expect(result.cutting).toBeDefined()
    expect(result.knowing).toBeDefined()
  })

  it('scores poor content low', () => {
    const result = analyzeObsidianBlock(poorContent, 'bad.ts')
    expect(result.qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const result = analyzeObsidianBlock(richContent, 'test.ts')
    const expected = Math.round(
      result.volcanicClarity * 0.2 +
      result.darkResilience * 0.2 +
      result.mirrorDepth * 0.2 +
      result.bladePrecision * 0.2 +
      result.shadowWisdom * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── analyzeObsidianShrine ──────────────────────────────

describe('analyzeObsidianShrine', () => {
  it('returns empty shrine for no blocks', () => {
    const result = analyzeObsidianShrine([], 'src')
    expect(result.directory).toBe('src')
    expect(result.blocks).toHaveLength(0)
    expect(result.avgClarity).toBe(0)
    expect(result.shrineType).toBe('no-shrine')
    expect(result.condition).toBe('void')
  })

  it('aggregates block scores', () => {
    const blocks = [makeBlock('a.ts', 80, 80, 80, 80, 80), makeBlock('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeObsidianShrine(blocks, 'src')
    expect(result.avgClarity).toBe(70)
    expect(result.avgPrecision).toBe(70)
    expect(result.avgWisdom).toBe(70)
  })

  it('counts masterpiece and void blocks', () => {
    const masterpiece = makeBlock('a.ts', 95, 95, 95, 95, 95)
    const voidBlock = makeBlock('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeObsidianShrine([masterpiece, voidBlock], 'src')
    expect(result.obsidianMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildObsidianTempleResult ──────────────────────────

describe('buildObsidianTempleResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildObsidianTempleResult(['app.ts'], [richContent])
    expect(result.blocks).toHaveLength(1)
    expect(result.shrines).toHaveLength(1)
    expect(result.volcano.overallSharpness).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildObsidianTempleResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSharpness).toBe(0)
    expect(result.volcano.isObsidian).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildObsidianTempleResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.shrines.length).toBe(2)
    expect(result.stats.totalShrines).toBe(2)
  })

  it('computes priest grade correctly', async () => {
    const result = await buildObsidianTempleResult(['a.ts'], [richContent])
    expect(result.stats.priestGrade).toBeDefined()
    expect(result.volcano.isObsidian).toBe(result.volcano.overallSharpness >= 60)
  })

  it('finds best block and extremes', async () => {
    const result = await buildObsidianTempleResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.stats.bestBlock).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.sharpest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('scores rich content at max', async () => {
    const result = await buildObsidianTempleResult(['perfect.ts'], [richContent])
    expect(result.blocks[0].volcanicClarity).toBe(100)
    expect(result.blocks[0].darkResilience).toBe(100)
    expect(result.blocks[0].mirrorDepth).toBe(100)
    expect(result.blocks[0].bladePrecision).toBe(100)
    expect(result.blocks[0].shadowWisdom).toBe(100)
    expect(result.blocks[0].qualityScore).toBe(100)
  })

  it('handles multiple files with mixed content', async () => {
    const result = await buildObsidianTempleResult(
      ['good.ts', 'bad.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.blocks).toHaveLength(2)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const blocks = [makeBlock('a.ts', 95, 95, 95, 95, 95)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 95, avgPrecision: 95, avgWisdom: 95, isObsidian: true, overallSharpness: 95 }
    const stats = makeStats({
      avgVolcanicClarity: 95, avgDarkResilience: 95, avgMirrorDepth: 95,
      avgBladePrecision: 95, avgShadowWisdom: 95, overallSharpness: 95,
    })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends improving clarity when low', () => {
    const blocks = [makeBlock('a.ts', 50, 90, 90, 90, 90)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 50, avgPrecision: 90, avgWisdom: 90, isObsidian: true, overallSharpness: 82 }
    const stats = makeStats({ avgVolcanicClarity: 50, avgDarkResilience: 90, avgMirrorDepth: 90, avgBladePrecision: 90, avgShadowWisdom: 90, overallSharpness: 82 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('volcanic glass'))).toBe(true)
  })

  it('recommends improving resilience when low', () => {
    const blocks = [makeBlock('a.ts', 90, 50, 90, 90, 90)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isObsidian: true, overallSharpness: 82 }
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkResilience: 50, avgMirrorDepth: 90, avgBladePrecision: 90, avgShadowWisdom: 90, overallSharpness: 82 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('dark resilience'))).toBe(true)
  })

  it('recommends improving depth when low', () => {
    const blocks = [makeBlock('a.ts', 90, 90, 50, 90, 90)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isObsidian: true, overallSharpness: 82 }
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkResilience: 90, avgMirrorDepth: 50, avgBladePrecision: 90, avgShadowWisdom: 90, overallSharpness: 82 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('mirror reflection'))).toBe(true)
  })

  it('recommends improving precision when low', () => {
    const blocks = [makeBlock('a.ts', 90, 90, 90, 50, 90)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 90, avgPrecision: 50, avgWisdom: 90, isObsidian: true, overallSharpness: 82 }
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkResilience: 90, avgMirrorDepth: 90, avgBladePrecision: 50, avgShadowWisdom: 90, overallSharpness: 82 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('obsidian blade'))).toBe(true)
  })

  it('recommends improving wisdom when low', () => {
    const blocks = [makeBlock('a.ts', 90, 90, 90, 90, 50)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 90, avgPrecision: 90, avgWisdom: 50, isObsidian: true, overallSharpness: 82 }
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkResilience: 90, avgMirrorDepth: 90, avgBladePrecision: 90, avgShadowWisdom: 50, overallSharpness: 82 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('shadow wisdom'))).toBe(true)
  })

  it('warns about shattered temple when overall < 40', () => {
    const blocks = [makeBlock('a.ts', 30, 30, 30, 30, 30)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 30, avgPrecision: 30, avgWisdom: 30, isObsidian: false, overallSharpness: 30 }
    const stats = makeStats({ avgVolcanicClarity: 30, avgDarkResilience: 30, avgMirrorDepth: 30, avgBladePrecision: 30, avgShadowWisdom: 30, overallSharpness: 30 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('shattered'))).toBe(true)
  })

  it('lists void blocks when <= 5', () => {
    const blocks = [
      makeBlock('a.ts', 5, 5, 5, 5, 5),
      makeBlock('b.ts', 90, 90, 90, 90, 90),
    ]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 47, avgPrecision: 47, avgWisdom: 47, isObsidian: false, overallSharpness: 47 }
    const stats = makeStats({ overallSharpness: 47 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many void blocks when > 5', () => {
    const blocks = Array.from({ length: 6 }, (_, i) => makeBlock(`${i}.ts`, 5, 5, 5, 5, 5))
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 5, avgPrecision: 5, avgWisdom: 5, isObsidian: false, overallSharpness: 5 }
    const stats = makeStats({ overallSharpness: 5, voidCount: 6 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('6 shattered blocks'))).toBe(true)
  })

  it('warns about all collapsed shrines', () => {
    const blocks = [makeBlock('a.ts', 5, 5, 5, 5, 5)]
    const shrines = [{ directory: 'src', blocks, avgClarity: 5, avgPrecision: 5, avgWisdom: 5, obsidianMasterpieceCount: 0, voidCount: 1, shrineType: 'empty-pedestal' as ShrineType, condition: 'void' as ShrineCondition }]
    const volcano = { avgClarity: 5, avgPrecision: 5, avgWisdom: 5, isObsidian: false, overallSharpness: 5 }
    const stats = makeStats({ overallSharpness: 5 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('All shrine sections have crumbled'))).toBe(true)
  })

  it('returns positive recommendation when scores are good', () => {
    const blocks = [makeBlock('a.ts', 80, 80, 80, 80, 80)]
    const shrines: ObsidianShrineType[] = []
    const volcano = { avgClarity: 80, avgPrecision: 80, avgWisdom: 80, isObsidian: true, overallSharpness: 80 }
    const stats = makeStats({ overallSharpness: 80 })
    const recs = generateRecommendations(blocks, shrines, volcano, stats)
    expect(recs.some((r) => r.includes('stands strong'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for high score', () => { expect(typeof colorScore(95)).toBe('string') })
  it('returns a string for low score', () => { expect(typeof colorScore(5)).toBe('string') })
  it('returns a string for mid score', () => { expect(typeof colorScore(50)).toBe('string') })
})

describe('colorShrineCondition', () => {
  it('colors obsidian-cathedral', () => { expect(typeof colorShrineCondition('obsidian-cathedral')).toBe('string') })
  it('colors void', () => { expect(typeof colorShrineCondition('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof colorShrineCondition('unknown')).toBe('string') })
})

describe('formatBlockTable', () => {
  it('formats a single block', () => {
    const block = makeBlock('app.ts', 80, 80, 80, 80, 80)
    const result = formatBlockTable(block)
    expect(result).toContain('Obsidian Block: app.ts')
    expect(result).toContain('Volcanic Clarity')
    expect(result).toContain('Quality Score')
  })
})

describe('formatBlocksTable', () => {
  it('returns no-blocks message for empty', () => {
    expect(formatBlocksTable([])).toContain('No obsidian blocks')
  })
  it('formats multiple blocks', () => {
    const blocks = [makeBlock('a.ts', 80, 80, 80, 80, 80), makeBlock('b.ts', 60, 60, 60, 60, 60)]
    const result = formatBlocksTable(blocks)
    expect(result).toContain('Obsidian Blocks')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatShrineTable', () => {
  it('formats a single shrine', () => {
    const shrine: ObsidianShrineType = {
      directory: 'src', blocks: [], avgClarity: 80, avgPrecision: 80, avgWisdom: 80,
      obsidianMasterpieceCount: 1, voidCount: 0, shrineType: 'sacred-temple', condition: 'obsidian-cathedral',
    }
    const result = formatShrineTable(shrine)
    expect(result).toContain('Obsidian Shrine: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatShrinesTable', () => {
  it('returns no-shrines message for empty', () => {
    expect(formatShrinesTable([])).toContain('No obsidian shrines')
  })
  it('formats multiple shrines', () => {
    const shrines = [
      { directory: 'src', blocks: [], avgClarity: 80, avgPrecision: 80, avgWisdom: 80, obsidianMasterpieceCount: 0, voidCount: 0, shrineType: 'volcanic-shrine' as ShrineType, condition: 'dark-sanctuary' as ShrineCondition },
      { directory: 'lib', blocks: [], avgClarity: 50, avgPrecision: 50, avgWisdom: 50, obsidianMasterpieceCount: 0, voidCount: 0, shrineType: 'proper-altar' as ShrineType, condition: 'proper-temple' as ShrineCondition },
    ]
    const result = formatShrinesTable(shrines)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats fields', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Obsidian Temple Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Priest Grade')
    expect(result).toContain('Best Block')
  })
})

describe('formatRecommendations', () => {
  it('returns no-recs message for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Fix X')
    expect(result).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats the full result', async () => {
    const result = await buildObsidianTempleResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Obsidian Temple Analysis')
    expect(table).toContain('Volcanic Overview')
    expect(table).toContain('Obsidian Temple Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildObsidianTempleResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
