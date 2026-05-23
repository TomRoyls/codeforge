import { describe, it, expect } from 'vitest'
import {
  measureHardening,
  measureClarifying,
  measureCutting,
  measureDispersing,
  measureWeighing,
  classifyDiamondCondition,
  classifyMineType,
  classifyGemologistGrade,
  classifyMineCondition,
  analyzeDiamondGem,
  analyzeDiamondMine,
  buildDiamondCoreResult,
  generateRecommendations,
} from '../src/commands/diamond-core-helpers.js'
import {
  colorScore,
  colorGrade,
  formatGemTable,
  formatGemsTable,
  formatMineTable,
  formatMinesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/diamond-core-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureHardening ──────────────────────────────────────────────

describe('measureHardening', () => {
  it('returns 0 for empty content', () => {
    const m = measureHardening('')
    expect(m.hardness).toBe(0)
    expect(m.grade).toBe('talc-grade')
    expect(m.hasHighHardness).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureHardening(minimalContent)
    expect(m.hardness).toBe(0)
    expect(m.grade).toBe('talc-grade')
    expect(m.hasRobust).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.brittleCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureHardening(richContent)
    expect(m.hardness).toBe(100)
    expect(m.grade).toBe('flawless-hardness')
    expect(m.hasHighHardness).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasHard).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureHardening('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects brittle any usage', () => {
    const m = measureHardening('const x: any = 1')
    expect(m.brittleCount).toBe(1)
    expect(m.hasNoBrittle).toBe(false)
  })

  it('detects breakable eval usage', () => {
    const m = measureHardening('eval("1")')
    expect(m.hasNoBreakable).toBe(false)
  })

  it('detects weak debugger usage', () => {
    const m = measureHardening('debugger')
    expect(m.hasNoWeak).toBe(false)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying('')
    expect(m.clarity).toBe(0)
    expect(m.grade2).toBe('i2')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(8)
    expect(m.grade2).toBe('i2')
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoInclusion).toBe(true)
    expect(m.hasNoFlaw).toBe(true)
    expect(m.inclusionCount).toBe(0)
    expect(m.flawCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
    expect(m.grade2).toBe('flawless')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasPristine).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasLucid).toBe(true)
  })

  it('detects inclusion var usage', () => {
    const m = measureClarifying('var x = 1')
    expect(m.inclusionCount).toBe(1)
    expect(m.hasNoInclusion).toBe(false)
  })

  it('detects flaw any usage', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.flawCount).toBe(1)
    expect(m.hasNoFlaw).toBe(false)
  })

  it('detects blemish eval usage', () => {
    const m = measureClarifying('eval("1")')
    expect(m.hasNoBlemish).toBe(false)
  })

  it('detects cloudy debugger usage', () => {
    const m = measureClarifying('debugger')
    expect(m.hasNoCloudy).toBe(false)
  })
})

// ─── measureCutting ────────────────────────────────────────────────

describe('measureCutting', () => {
  it('returns 0 for empty content', () => {
    const m = measureCutting('')
    expect(m.precision).toBe(0)
    expect(m.cut).toBe('poor-cut')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCutting(minimalContent)
    expect(m.precision).toBe(8)
    expect(m.cut).toBe('poor-cut')
    expect(m.hasRefined).toBe(false)
    expect(m.roughCount).toBe(0)
    expect(m.dullCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCutting(richContent)
    expect(m.precision).toBe(100)
    expect(m.cut).toBe('ideal-cut')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasMasterful).toBe(true)
  })

  it('detects rough var usage', () => {
    const m = measureCutting('var x = 1')
    expect(m.roughCount).toBe(1)
    expect(m.hasNoRough).toBe(false)
  })

  it('detects dull any usage', () => {
    const m = measureCutting('const x: any = 1')
    expect(m.dullCount).toBe(1)
    expect(m.hasNoDull).toBe(false)
  })

  it('detects sloppy eval usage', () => {
    const m = measureCutting('eval("1")')
    expect(m.hasNoSloppy).toBe(false)
  })

  it('detects clunky debugger usage', () => {
    const m = measureCutting('debugger')
    expect(m.hasNoClunky).toBe(false)
  })
})

// ─── measureDispersing ─────────────────────────────────────────────

describe('measureDispersing', () => {
  it('returns 0 for empty content', () => {
    const m = measureDispersing('')
    expect(m.fire).toBe(0)
    expect(m.dispersion).toBe('dead-light')
    expect(m.hasHighFire).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureDispersing(minimalContent)
    expect(m.fire).toBe(0)
    expect(m.dispersion).toBe('dead-light')
    expect(m.hasBrilliant).toBe(false)
    expect(m.dullCount).toBe(0)
    expect(m.flatCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureDispersing(richContent)
    expect(m.fire).toBe(100)
    expect(m.dispersion).toBe('hearts-arrows')
    expect(m.hasHighFire).toBe(true)
    expect(m.hasBrilliant).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasVivid).toBe(true)
    expect(m.hasDazzling).toBe(true)
    expect(m.hasSparkling).toBe(true)
    expect(m.hasRadiant).toBe(true)
  })

  it('detects dull var usage', () => {
    const m = measureDispersing('var x = 1')
    expect(m.dullCount).toBe(1)
    expect(m.hasNoDull).toBe(false)
  })

  it('detects flat any usage', () => {
    const m = measureDispersing('const x: any = 1')
    expect(m.flatCount).toBe(1)
    expect(m.hasNoFlat).toBe(false)
  })

  it('detects lifeless eval usage', () => {
    const m = measureDispersing('eval("1")')
    expect(m.hasNoLifeless).toBe(false)
  })

  it('detects dark debugger usage', () => {
    const m = measureDispersing('debugger')
    expect(m.hasNoDark).toBe(false)
  })
})

// ─── measureWeighing ───────────────────────────────────────────────

describe('measureWeighing', () => {
  it('returns 0 for empty content', () => {
    const m = measureWeighing('')
    expect(m.density).toBe(0)
    expect(m.carat).toBe('weightless')
    expect(m.hasHighDensity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureWeighing(minimalContent)
    expect(m.density).toBe(10)
    expect(m.carat).toBe('weightless')
    expect(m.hasSubstantial).toBe(false)
    expect(m.sparseCount).toBe(0)
    expect(m.thinCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureWeighing(richContent)
    expect(m.density).toBe(100)
    expect(m.carat).toBe('heavy-carat')
    expect(m.hasHighDensity).toBe(true)
    expect(m.hasSubstantial).toBe(true)
    expect(m.hasDense).toBe(true)
    expect(m.hasMeaty).toBe(true)
    expect(m.hasRich).toBe(true)
    expect(m.hasFull).toBe(true)
    expect(m.hasHeavy).toBe(true)
  })

  it('detects sparse var usage', () => {
    const m = measureWeighing('var x = 1')
    expect(m.sparseCount).toBe(1)
    expect(m.hasNoSparse).toBe(false)
  })

  it('detects thin any usage', () => {
    const m = measureWeighing('const x: any = 1')
    expect(m.thinCount).toBe(1)
    expect(m.hasNoThin).toBe(false)
  })

  it('detects barren eval usage', () => {
    const m = measureWeighing('eval("1")')
    expect(m.hasNoBarren).toBe(false)
  })

  it('detects empty debugger usage', () => {
    const m = measureWeighing('debugger')
    expect(m.hasNoEmpty).toBe(false)
  })
})

// ─── classifyDiamondCondition ──────────────────────────────────────

describe('classifyDiamondCondition', () => {
  it('classifies hope-diamond for 85+', () => {
    expect(classifyDiamondCondition(85)).toBe('hope-diamond')
    expect(classifyDiamondCondition(100)).toBe('hope-diamond')
  })

  it('classifies koh-i-noor for 70-84', () => {
    expect(classifyDiamondCondition(70)).toBe('koh-i-noor')
    expect(classifyDiamondCondition(84)).toBe('koh-i-noor')
  })

  it('classifies proper-diamond for 55-69', () => {
    expect(classifyDiamondCondition(55)).toBe('proper-diamond')
    expect(classifyDiamondCondition(69)).toBe('proper-diamond')
  })

  it('classifies industrial-diamond for 40-54', () => {
    expect(classifyDiamondCondition(40)).toBe('industrial-diamond')
    expect(classifyDiamondCondition(54)).toBe('industrial-diamond')
  })

  it('classifies rough-crystal for 25-39', () => {
    expect(classifyDiamondCondition(25)).toBe('rough-crystal')
    expect(classifyDiamondCondition(39)).toBe('rough-crystal')
  })

  it('classifies graphite for 0-24', () => {
    expect(classifyDiamondCondition(0)).toBe('graphite')
    expect(classifyDiamondCondition(24)).toBe('graphite')
  })
})

// ─── classifyMineType ──────────────────────────────────────────────

describe('classifyMineType', () => {
  it('returns no-mine for empty gems', () => {
    expect(classifyMineType([])).toBe('no-mine')
  })

  it('classifies kimberley-pipe for high avg + high hope ratio', () => {
    const gems = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeDiamondGem(richContent, `f${i}.ts`),
    }))
    expect(classifyMineType(gems)).toBe('kimberley-pipe')
  })

  it('classifies no-mine for low scores', () => {
    const gems = [analyzeDiamondGem('', 'a.ts')]
    expect(classifyMineType(gems)).toBe('no-mine')
  })

  it('classifies alluvial-deposit for mid-high scores', () => {
    const gems = Array.from({ length: 3 }, () => ({
      ...analyzeDiamondGem(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'koh-i-noor' as const,
    }))
    expect(classifyMineType(gems)).toBe('alluvial-deposit')
  })

  it('classifies surface-find for very low scores', () => {
    const gems = Array.from({ length: 3 }, () => ({
      ...analyzeDiamondGem(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'graphite' as const,
    }))
    expect(classifyMineType(gems)).toBe('surface-find')
  })
})

// ─── classifyGemologistGrade ───────────────────────────────────────

describe('classifyGemologistGrade', () => {
  it('classifies master-gemologist for 80+', () => {
    expect(classifyGemologistGrade(80)).toBe('master-gemologist')
    expect(classifyGemologistGrade(100)).toBe('master-gemologist')
  })

  it('classifies expert-lapidary for 65-79', () => {
    expect(classifyGemologistGrade(65)).toBe('expert-lapidary')
    expect(classifyGemologistGrade(79)).toBe('expert-lapidary')
  })

  it('classifies skilled-cutter for 50-64', () => {
    expect(classifyGemologistGrade(50)).toBe('skilled-cutter')
    expect(classifyGemologistGrade(64)).toBe('skilled-cutter')
  })

  it('classifies appraiser for 35-49', () => {
    expect(classifyGemologistGrade(35)).toBe('appraiser')
    expect(classifyGemologistGrade(49)).toBe('appraiser')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyGemologistGrade(20)).toBe('novice')
    expect(classifyGemologistGrade(34)).toBe('novice')
  })

  it('classifies coal-miner for 0-19', () => {
    expect(classifyGemologistGrade(0)).toBe('coal-miner')
    expect(classifyGemologistGrade(19)).toBe('coal-miner')
  })
})

// ─── classifyMineCondition ─────────────────────────────────────────

describe('classifyMineCondition', () => {
  it('classifies premium-pipe for 75+', () => {
    expect(classifyMineCondition(75)).toBe('premium-pipe')
  })

  it('classifies rich-seam for 60-74', () => {
    expect(classifyMineCondition(60)).toBe('rich-seam')
  })

  it('classifies decent-yield for 45-59', () => {
    expect(classifyMineCondition(45)).toBe('decent-yield')
  })

  it('classifies low-grade for 30-44', () => {
    expect(classifyMineCondition(30)).toBe('low-grade')
  })

  it('classifies exhausted for 15-29', () => {
    expect(classifyMineCondition(15)).toBe('exhausted')
  })

  it('classifies barren for 0-14', () => {
    expect(classifyMineCondition(0)).toBe('barren')
  })
})

// ─── analyzeDiamondGem ─────────────────────────────────────────────

describe('analyzeDiamondGem', () => {
  it('analyzes minimal content', () => {
    const gem = analyzeDiamondGem(minimalContent, 'minimal.ts')
    expect(gem.file).toBe('minimal.ts')
    expect(gem.hardness).toBe(0)
    expect(gem.clarity).toBe(8)
    expect(gem.cutPrecision).toBe(8)
    expect(gem.fireDispersion).toBe(0)
    expect(gem.caratDensity).toBe(10)
    expect(gem.qualityScore).toBe(5)
    expect(gem.condition).toBe('graphite')
    expect(gem.hardening.grade).toBe('talc-grade')
    expect(gem.clarifying.grade2).toBe('i2')
    expect(gem.cutting.cut).toBe('poor-cut')
    expect(gem.dispersing.dispersion).toBe('dead-light')
    expect(gem.weighing.carat).toBe('weightless')
  })

  it('analyzes rich content', () => {
    const gem = analyzeDiamondGem(richContent, 'rich.ts')
    expect(gem.file).toBe('rich.ts')
    expect(gem.hardness).toBe(100)
    expect(gem.clarity).toBe(100)
    expect(gem.cutPrecision).toBe(100)
    expect(gem.fireDispersion).toBe(100)
    expect(gem.caratDensity).toBe(100)
    expect(gem.qualityScore).toBe(100)
    expect(gem.condition).toBe('hope-diamond')
    expect(gem.hardening.grade).toBe('flawless-hardness')
    expect(gem.clarifying.grade2).toBe('flawless')
    expect(gem.cutting.cut).toBe('ideal-cut')
    expect(gem.dispersing.dispersion).toBe('hearts-arrows')
    expect(gem.weighing.carat).toBe('heavy-carat')
  })

  it('computes qualityScore as weighted average', () => {
    const gem = analyzeDiamondGem('export const x = 1', 'mid.ts')
    const expected = Math.round(
      gem.hardness * 0.2 +
      gem.clarity * 0.2 +
      gem.cutPrecision * 0.2 +
      gem.fireDispersion * 0.2 +
      gem.caratDensity * 0.2,
    )
    expect(gem.qualityScore).toBe(expected)
  })
})

// ─── analyzeDiamondMine ────────────────────────────────────────────

describe('analyzeDiamondMine', () => {
  it('returns empty mine for empty gems', () => {
    const mine = analyzeDiamondMine([], 'empty-dir')
    expect(mine.directory).toBe('empty-dir')
    expect(mine.gems).toHaveLength(0)
    expect(mine.avgHardness).toBe(0)
    expect(mine.mineType).toBe('no-mine')
    expect(mine.condition).toBe('barren')
  })

  it('analyzes mine with rich gems', () => {
    const gems = [
      analyzeDiamondGem(richContent, 'dir/a.ts'),
      analyzeDiamondGem(richContent, 'dir/b.ts'),
    ]
    const mine = analyzeDiamondMine(gems, 'dir')
    expect(mine.avgHardness).toBe(100)
    expect(mine.hopeDiamondCount).toBe(2)
    expect(mine.graphiteCount).toBe(0)
    expect(mine.mineType).toBe('kimberley-pipe')
  })

  it('analyzes mine with mixed gems', () => {
    const gems = [
      analyzeDiamondGem(richContent, 'dir/a.ts'),
      analyzeDiamondGem(minimalContent, 'dir/b.ts'),
    ]
    const mine = analyzeDiamondMine(gems, 'dir')
    expect(mine.hopeDiamondCount).toBe(1)
    expect(mine.graphiteCount).toBe(1)
  })
})

// ─── buildDiamondCoreResult ────────────────────────────────────────

describe('buildDiamondCoreResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildDiamondCoreResult([], [])
    expect(result.gems).toHaveLength(0)
    expect(result.mines).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.stats.gemologistGrade).toBe('coal-miner')
    expect(result.vault.isPrecious).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildDiamondCoreResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.gems).toHaveLength(2)
    expect(result.mines).toHaveLength(1)
    expect(result.stats.avgHardness).toBe(100)
    expect(result.stats.avgClarity).toBe(100)
    expect(result.stats.avgCutPrecision).toBe(100)
    expect(result.stats.avgFireDispersion).toBe(100)
    expect(result.stats.avgCaratDensity).toBe(100)
    expect(result.stats.hopeDiamondCount).toBe(2)
    expect(result.stats.graphiteCount).toBe(0)
    expect(result.stats.hasHighHardnessCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighPrecisionCount).toBe(2)
    expect(result.stats.hasHighFireCount).toBe(2)
    expect(result.stats.hasHighDensityCount).toBe(2)
    expect(result.stats.overallBrilliance).toBe(100)
    expect(result.stats.gemologistGrade).toBe('master-gemologist')
    expect(result.vault.isPrecious).toBe(true)
    expect(result.stats.bestGem).toBeTruthy()
    expect(result.stats.hardest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.bestCut).toBeTruthy()
    expect(result.stats.mostBrilliant).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildDiamondCoreResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.mines).toHaveLength(2)
    const dirs = result.mines.map(m => m.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall brilliance correctly', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    expect(result.vault.overallBrilliance).toBe(Math.round((0 + 8 + 0) / 3))
  })

  it('sets isPrecious when avgHardness >= 60', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [richContent])
    expect(result.vault.isPrecious).toBe(true)
  })

  it('sets isPrecious false when avgHardness < 60', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    expect(result.vault.isPrecious).toBe(false)
  })

  it('picks best gem by qualityScore', async () => {
    const result = await buildDiamondCoreResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestGem).toBe('high.ts')
    expect(result.stats.hardest).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.bestCut).toBe('high.ts')
    expect(result.stats.mostBrilliant).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildDiamondCoreResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.hopeDiamondCount).toBe(1)
    expect(result.stats.graphiteCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      '460 commands - a diamond core of code analysis excellence',
    ])
  })

  it('recommends improving hardness when low', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('hardness'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving cut precision when low', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('cut precision'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving fire dispersion when low', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('fire dispersion'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving carat density when low', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('carat density'))
    expect(rec).toBeTruthy()
  })

  it('warns about graphite files', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('graphite'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall brilliance', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall diamond brilliance'))
    expect(rec).toBeTruthy()
  })

  it('lists specific graphite files', async () => {
    const result = await buildDiamondCoreResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Transform'))
    expect(rec).toBeTruthy()
  })

  it('warns when all mines are surface finds/no-mine', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('surface finds or barren'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for hope-diamond', () => {
    expect(typeof colorGrade('hope-diamond')).toBe('string')
  })

  it('returns a string for graphite', () => {
    expect(typeof colorGrade('graphite')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatGemTable', () => {
  it('formats a gem', () => {
    const gem = analyzeDiamondGem(richContent, 'test.ts')
    const output = formatGemTable(gem)
    expect(output).toContain('test.ts')
    expect(output).toContain('Hardness')
    expect(output).toContain('Clarity')
    expect(output).toContain('Cut')
    expect(output).toContain('Fire')
    expect(output).toContain('Carat')
  })
})

describe('formatGemsTable', () => {
  it('handles empty gems', () => {
    const output = formatGemsTable([])
    expect(output).toContain('No diamond gems')
  })

  it('formats multiple gems', () => {
    const gems = [
      analyzeDiamondGem(richContent, 'a.ts'),
      analyzeDiamondGem(minimalContent, 'b.ts'),
    ]
    const output = formatGemsTable(gems)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatMineTable', () => {
  it('formats a mine', () => {
    const gems = [analyzeDiamondGem(richContent, 'dir/a.ts')]
    const mine = analyzeDiamondMine(gems, 'dir')
    const output = formatMineTable(mine)
    expect(output).toContain('dir')
    expect(output).toContain('Mine')
  })
})

describe('formatMinesTable', () => {
  it('handles empty mines', () => {
    const output = formatMinesTable([])
    expect(output).toContain('No diamond mines')
  })

  it('formats multiple mines', () => {
    const gems = [analyzeDiamondGem(richContent, 'src/a.ts')]
    const mines = [analyzeDiamondMine(gems, 'src')]
    const output = formatMinesTable(mines)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Diamond Core Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gemologist Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Diamond Core Analysis')
    expect(output).toContain('Diamond Mine Analysis')
    expect(output).toContain('Diamond Core Statistics')
    expect(output).toContain('Vault')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildDiamondCoreResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.gems).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.vault.isPrecious).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const gem = analyzeDiamondGem('   \n\t  ', 'blank.ts')
    expect(gem.hardness).toBe(0)
    expect(gem.qualityScore).toBe(0)
    expect(gem.condition).toBe('graphite')
  })

  it('handles content with only comments', () => {
    const gem = analyzeDiamondGem('// just a comment\n/* block */', 'comment.ts')
    expect(gem.hardness).toBe(0)
    expect(gem.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildDiamondCoreResult(['big.ts'], [longContent])
    expect(result.gems).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildDiamondCoreResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.hopeDiamondCount).toBe(50)
  })

  it('handles single file mine', async () => {
    const result = await buildDiamondCoreResult(['single.ts'], [richContent])
    expect(result.mines).toHaveLength(1)
    expect(result.mines[0]!.gems).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const gem = analyzeDiamondGem(richContent, 'cap.ts')
    expect(gem.qualityScore).toBeLessThanOrEqual(100)
    expect(gem.hardness).toBeLessThanOrEqual(100)
    expect(gem.clarity).toBeLessThanOrEqual(100)
    expect(gem.cutPrecision).toBeLessThanOrEqual(100)
    expect(gem.fireDispersion).toBeLessThanOrEqual(100)
    expect(gem.caratDensity).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildDiamondCoreResult([], [])
    const r2 = await buildDiamondCoreResult(['a.ts'], [richContent])
    const r3 = await buildDiamondCoreResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })

  it('uses grade2 field for clarifying measure', () => {
    const m = measureClarifying(richContent)
    expect(m.grade2).toBe('flawless')
    expect(m.grade2).not.toBe(m.clarity)
  })

  it('koh-i-noor count tracked separately', async () => {
    const midContent = 'export interface Foo<T> { readonly bar: T }'
    const result = await buildDiamondCoreResult(['mid.ts'], [midContent])
    expect(typeof result.stats.kohINoorCount).toBe('number')
  })
})
