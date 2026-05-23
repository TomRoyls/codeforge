import { describe, it, expect } from 'vitest'
import {
  measureSmelting,
  measureTempering,
  measureEnduring,
  measureHammering,
  measureChaining,
  classifyIronCondition,
  classifyHallType,
  classifyBlacksmithGrade,
  classifyHallCondition,
  analyzeForgedIron,
  analyzeForgeHall,
  buildIronForgeIIResult,
  generateRecommendations,
} from '../src/commands/iron-forge-ii-helpers.js'
import {
  colorScore,
  colorGrade,
  formatIronTable,
  formatIronsTable,
  formatHallTable,
  formatHallsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/iron-forge-ii-format-helpers.js'

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

// ─── measureSmelting ───────────────────────────────────────────────

describe('measureSmelting', () => {
  it('returns 0 for empty content', () => {
    const m = measureSmelting('')
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('raw-iron')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureSmelting(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.grade).toBe('raw-iron')
    expect(m.hasRefined).toBe(false)
    expect(m.hasNoImpure).toBe(true)
    expect(m.hasNoContaminated).toBe(true)
    expect(m.impureCount).toBe(0)
    expect(m.contaminatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureSmelting(richContent)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('pure-steel')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasExtracted).toBe(true)
    expect(m.hasConcentrated).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasHighGrade).toBe(true)
  })

  it('detects impure var usage', () => {
    const m = measureSmelting('var x = 1')
    expect(m.impureCount).toBe(1)
    expect(m.hasNoImpure).toBe(false)
  })

  it('detects contaminated any usage', () => {
    const m = measureSmelting('const x: any = 1')
    expect(m.contaminatedCount).toBe(1)
    expect(m.hasNoContaminated).toBe(false)
  })

  it('detects eval as wasteful', () => {
    const m = measureSmelting('eval("1")')
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects debugger as diluted', () => {
    const m = measureSmelting('debugger')
    expect(m.hasNoDiluted).toBe(false)
  })
})

// ─── measureTempering ──────────────────────────────────────────────

describe('measureTempering', () => {
  it('returns 0 for empty content', () => {
    const m = measureTempering('')
    expect(m.balance).toBe(0)
    expect(m.temper).toBe('raw-metal')
    expect(m.hasHighBalance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureTempering(minimalContent)
    expect(m.balance).toBe(8)
    expect(m.temper).toBe('raw-metal')
    expect(m.hasBalanced).toBe(false)
    expect(m.hasNoBrittle).toBe(true)
    expect(m.hasNoRigid).toBe(true)
    expect(m.brittleCount).toBe(0)
    expect(m.rigidCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureTempering(richContent)
    expect(m.balance).toBe(100)
    expect(m.temper).toBe('perfect-temper')
    expect(m.hasHighBalance).toBe(true)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasFlexible).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasProperHardness).toBe(true)
    expect(m.hasYielding).toBe(true)
    expect(m.hasElastic).toBe(true)
  })

  it('detects brittle var usage', () => {
    const m = measureTempering('var x = 1')
    expect(m.brittleCount).toBe(1)
    expect(m.hasNoBrittle).toBe(false)
  })

  it('detects rigid any usage', () => {
    const m = measureTempering('const x: any = 1')
    expect(m.rigidCount).toBe(1)
    expect(m.hasNoRigid).toBe(false)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 for empty content', () => {
    const m = measureEnduring('')
    expect(m.endurance).toBe(0)
    expect(m.anvil).toBe('shattered')
    expect(m.hasHighEndurance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureEnduring(minimalContent)
    expect(m.endurance).toBe(8)
    expect(m.anvil).toBe('shattered')
    expect(m.hasSturdy).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoWeak).toBe(true)
    expect(m.fragileCount).toBe(0)
    expect(m.weakCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureEnduring(richContent)
    expect(m.endurance).toBe(100)
    expect(m.anvil).toBe('titan-anvil')
    expect(m.hasHighEndurance).toBe(true)
    expect(m.hasSturdy).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasLasting).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureEnduring('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects weak any usage', () => {
    const m = measureEnduring('const x: any = 1')
    expect(m.weakCount).toBe(1)
    expect(m.hasNoWeak).toBe(false)
  })
})

// ─── measureHammering ──────────────────────────────────────────────

describe('measureHammering', () => {
  it('returns 0 for empty content', () => {
    const m = measureHammering('')
    expect(m.rhythm).toBe(0)
    expect(m.hammer).toBe('no-rhythm')
    expect(m.hasHighRhythm).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureHammering(minimalContent)
    expect(m.rhythm).toBe(8)
    expect(m.hammer).toBe('no-rhythm')
    expect(m.hasConsistent).toBe(false)
    expect(m.hasNoErratic).toBe(true)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.erraticCount).toBe(0)
    expect(m.chaoticCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureHammering(richContent)
    expect(m.rhythm).toBe(100)
    expect(m.hammer).toBe('master-rhythm')
    expect(m.hasHighRhythm).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasSteady).toBe(true)
    expect(m.hasMeasured).toBe(true)
    expect(m.hasRhythmic).toBe(true)
    expect(m.hasPaced).toBe(true)
    expect(m.hasDeliberate).toBe(true)
  })

  it('detects erratic var usage', () => {
    const m = measureHammering('var x = 1')
    expect(m.erraticCount).toBe(1)
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects chaotic any usage', () => {
    const m = measureHammering('const x: any = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })
})

// ─── measureChaining ───────────────────────────────────────────────

describe('measureChaining', () => {
  it('returns 0 for empty content', () => {
    const m = measureChaining('')
    expect(m.strength).toBe(0)
    expect(m.chain).toBe('broken-chain')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureChaining(minimalContent)
    expect(m.strength).toBe(0)
    expect(m.chain).toBe('broken-chain')
    expect(m.hasConnected).toBe(false)
    expect(m.hasNoBroken).toBe(true)
    expect(m.hasNoLoose).toBe(true)
    expect(m.brokenCount).toBe(0)
    expect(m.looseCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureChaining(richContent)
    expect(m.strength).toBe(100)
    expect(m.chain).toBe('unbreakable-chain')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasConnected).toBe(true)
    expect(m.hasLinked).toBe(true)
    expect(m.hasSecure).toBe(true)
    expect(m.hasBound).toBe(true)
    expect(m.hasCoupled).toBe(true)
    expect(m.hasIntegrated).toBe(true)
  })

  it('detects broken var usage', () => {
    const m = measureChaining('var x = 1')
    expect(m.brokenCount).toBe(1)
    expect(m.hasNoBroken).toBe(false)
  })

  it('detects loose any usage', () => {
    const m = measureChaining('const x: any = 1')
    expect(m.looseCount).toBe(1)
    expect(m.hasNoLoose).toBe(false)
  })
})

// ─── classifyIronCondition ─────────────────────────────────────────

describe('classifyIronCondition', () => {
  it('classifies masterwork-iron for 85+', () => {
    expect(classifyIronCondition(85)).toBe('masterwork-iron')
    expect(classifyIronCondition(100)).toBe('masterwork-iron')
  })

  it('classifies fine-steel for 70-84', () => {
    expect(classifyIronCondition(70)).toBe('fine-steel')
    expect(classifyIronCondition(84)).toBe('fine-steel')
  })

  it('classifies proper-forging for 55-69', () => {
    expect(classifyIronCondition(55)).toBe('proper-forging')
    expect(classifyIronCondition(69)).toBe('proper-forging')
  })

  it('classifies rough-iron for 40-54', () => {
    expect(classifyIronCondition(40)).toBe('rough-iron')
    expect(classifyIronCondition(54)).toBe('rough-iron')
  })

  it('classifies pig-iron for 25-39', () => {
    expect(classifyIronCondition(25)).toBe('pig-iron')
    expect(classifyIronCondition(39)).toBe('pig-iron')
  })

  it('classifies scrap-heap for 0-24', () => {
    expect(classifyIronCondition(0)).toBe('scrap-heap')
    expect(classifyIronCondition(24)).toBe('scrap-heap')
  })
})

// ─── classifyHallType ──────────────────────────────────────────────

describe('classifyHallType', () => {
  it('returns no-forge for empty irons', () => {
    expect(classifyHallType([])).toBe('no-forge')
  })

  it('classifies grand-forge for high avg + high masterwork ratio', () => {
    const irons = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeForgedIron(richContent, `f${i}.ts`),
    }))
    expect(classifyHallType(irons)).toBe('grand-forge')
  })

  it('classifies no-forge for low scores', () => {
    const irons = [analyzeForgedIron('', 'a.ts')]
    expect(classifyHallType(irons)).toBe('no-forge')
  })

  it('classifies proper-foundry for mid-high scores', () => {
    const irons = Array.from({ length: 3 }, () => ({
      ...analyzeForgedIron(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'fine-steel' as const,
    }))
    expect(classifyHallType(irons)).toBe('proper-foundry')
  })

  it('classifies village-forge for mid scores', () => {
    const irons = Array.from({ length: 3 }, () => ({
      ...analyzeForgedIron(richContent, 'f.ts'),
      qualityScore: 50,
      condition: 'proper-forging' as const,
    }))
    expect(classifyHallType(irons)).toBe('village-forge')
  })

  it('classifies cold-hearth for very low scores', () => {
    const irons = Array.from({ length: 3 }, () => ({
      ...analyzeForgedIron(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'scrap-heap' as const,
    }))
    expect(classifyHallType(irons)).toBe('cold-hearth')
  })
})

// ─── classifyBlacksmithGrade ───────────────────────────────────────

describe('classifyBlacksmithGrade', () => {
  it('classifies master-blacksmith for 80+', () => {
    expect(classifyBlacksmithGrade(80)).toBe('master-blacksmith')
    expect(classifyBlacksmithGrade(100)).toBe('master-blacksmith')
  })

  it('classifies expert-forger for 65-79', () => {
    expect(classifyBlacksmithGrade(65)).toBe('expert-forger')
    expect(classifyBlacksmithGrade(79)).toBe('expert-forger')
  })

  it('classifies skilled-smith for 50-64', () => {
    expect(classifyBlacksmithGrade(50)).toBe('skilled-smith')
    expect(classifyBlacksmithGrade(64)).toBe('skilled-smith')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyBlacksmithGrade(35)).toBe('apprentice')
    expect(classifyBlacksmithGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyBlacksmithGrade(20)).toBe('novice')
    expect(classifyBlacksmithGrade(34)).toBe('novice')
  })

  it('classifies burn-victim for 0-19', () => {
    expect(classifyBlacksmithGrade(0)).toBe('burn-victim')
    expect(classifyBlacksmithGrade(19)).toBe('burn-victim')
  })
})

// ─── classifyHallCondition ─────────────────────────────────────────

describe('classifyHallCondition', () => {
  it('classifies white-hot for 75+', () => {
    expect(classifyHallCondition(75)).toBe('white-hot')
  })

  it('classifies red-hot for 60-74', () => {
    expect(classifyHallCondition(60)).toBe('red-hot')
  })

  it('classifies warm-coals for 45-59', () => {
    expect(classifyHallCondition(45)).toBe('warm-coals')
  })

  it('classifies cooling for 30-44', () => {
    expect(classifyHallCondition(30)).toBe('cooling')
  })

  it('classifies cold for 15-29', () => {
    expect(classifyHallCondition(15)).toBe('cold')
  })

  it('classifies extinguished for 0-14', () => {
    expect(classifyHallCondition(0)).toBe('extinguished')
  })
})

// ─── analyzeForgedIron ─────────────────────────────────────────────

describe('analyzeForgedIron', () => {
  it('analyzes minimal content', () => {
    const iron = analyzeForgedIron(minimalContent, 'minimal.ts')
    expect(iron.file).toBe('minimal.ts')
    expect(iron.smeltingQuality).toBe(8)
    expect(iron.temperingBalance).toBe(8)
    expect(iron.anvilEndurance).toBe(8)
    expect(iron.hammerRhythm).toBe(8)
    expect(iron.chainStrength).toBe(0)
    expect(iron.qualityScore).toBe(6)
    expect(iron.condition).toBe('scrap-heap')
    expect(iron.smelting.grade).toBe('raw-iron')
    expect(iron.tempering.temper).toBe('raw-metal')
    expect(iron.enduring.anvil).toBe('shattered')
    expect(iron.hammering.hammer).toBe('no-rhythm')
    expect(iron.chaining.chain).toBe('broken-chain')
  })

  it('analyzes rich content', () => {
    const iron = analyzeForgedIron(richContent, 'rich.ts')
    expect(iron.file).toBe('rich.ts')
    expect(iron.smeltingQuality).toBe(100)
    expect(iron.temperingBalance).toBe(100)
    expect(iron.anvilEndurance).toBe(100)
    expect(iron.hammerRhythm).toBe(100)
    expect(iron.chainStrength).toBe(100)
    expect(iron.qualityScore).toBe(100)
    expect(iron.condition).toBe('masterwork-iron')
    expect(iron.smelting.grade).toBe('pure-steel')
    expect(iron.tempering.temper).toBe('perfect-temper')
    expect(iron.enduring.anvil).toBe('titan-anvil')
    expect(iron.hammering.hammer).toBe('master-rhythm')
    expect(iron.chaining.chain).toBe('unbreakable-chain')
  })

  it('computes qualityScore as weighted average', () => {
    const iron = analyzeForgedIron('export const x = 1', 'mid.ts')
    const expected = Math.round(
      iron.smeltingQuality * 0.2 +
      iron.temperingBalance * 0.2 +
      iron.anvilEndurance * 0.2 +
      iron.hammerRhythm * 0.2 +
      iron.chainStrength * 0.2,
    )
    expect(iron.qualityScore).toBe(expected)
  })
})

// ─── analyzeForgeHall ──────────────────────────────────────────────

describe('analyzeForgeHall', () => {
  it('returns empty hall for empty irons', () => {
    const hall = analyzeForgeHall([], 'empty-dir')
    expect(hall.directory).toBe('empty-dir')
    expect(hall.irons).toHaveLength(0)
    expect(hall.avgSmelting).toBe(0)
    expect(hall.hallType).toBe('no-forge')
    expect(hall.condition).toBe('extinguished')
  })

  it('analyzes hall with rich irons', () => {
    const irons = [
      analyzeForgedIron(richContent, 'dir/a.ts'),
      analyzeForgedIron(richContent, 'dir/b.ts'),
    ]
    const hall = analyzeForgeHall(irons, 'dir')
    expect(hall.avgSmelting).toBe(100)
    expect(hall.masterworkIronCount).toBe(2)
    expect(hall.scrapHeapCount).toBe(0)
    expect(hall.hallType).toBe('grand-forge')
  })

  it('analyzes hall with mixed irons', () => {
    const irons = [
      analyzeForgedIron(richContent, 'dir/a.ts'),
      analyzeForgedIron(minimalContent, 'dir/b.ts'),
    ]
    const hall = analyzeForgeHall(irons, 'dir')
    expect(hall.masterworkIronCount).toBe(1)
    expect(hall.scrapHeapCount).toBe(1)
  })
})

// ─── buildIronForgeIIResult ────────────────────────────────────────

describe('buildIronForgeIIResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildIronForgeIIResult([], [])
    expect(result.irons).toHaveLength(0)
    expect(result.halls).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallStrength).toBe(0)
    expect(result.stats.blacksmithGrade).toBe('burn-victim')
    expect(result.guild.isForging).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildIronForgeIIResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.irons).toHaveLength(2)
    expect(result.halls).toHaveLength(1)
    expect(result.stats.avgSmeltingQuality).toBe(100)
    expect(result.stats.avgTemperingBalance).toBe(100)
    expect(result.stats.avgAnvilEndurance).toBe(100)
    expect(result.stats.avgHammerRhythm).toBe(100)
    expect(result.stats.avgChainStrength).toBe(100)
    expect(result.stats.masterworkIronCount).toBe(2)
    expect(result.stats.scrapHeapCount).toBe(0)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighBalanceCount).toBe(2)
    expect(result.stats.hasHighEnduranceCount).toBe(2)
    expect(result.stats.hasHighRhythmCount).toBe(2)
    expect(result.stats.hasHighStrengthCount).toBe(2)
    expect(result.stats.overallStrength).toBe(100)
    expect(result.stats.blacksmithGrade).toBe('master-blacksmith')
    expect(result.guild.isForging).toBe(true)
    expect(result.stats.bestIron).toBeTruthy()
    expect(result.stats.bestSmelted).toBeTruthy()
    expect(result.stats.bestTempered).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
    expect(result.stats.strongestChain).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildIronForgeIIResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.halls).toHaveLength(2)
    const dirs = result.halls.map(h => h.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall strength correctly', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    expect(result.guild.overallStrength).toBe(Math.round((8 + 8 + 8) / 3))
  })

  it('sets isForging when avgSmelting >= 60', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [richContent])
    expect(result.guild.isForging).toBe(true)
  })

  it('sets isForging false when avgSmelting < 60', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    expect(result.guild.isForging).toBe(false)
  })

  it('picks best iron by qualityScore', async () => {
    const result = await buildIronForgeIIResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestIron).toBe('high.ts')
    expect(result.stats.bestSmelted).toBe('high.ts')
    expect(result.stats.bestTempered).toBe('high.ts')
    expect(result.stats.mostEnduring).toBe('high.ts')
    expect(result.stats.strongestChain).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildIronForgeIIResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.masterworkIronCount).toBe(1)
    expect(result.stats.scrapHeapCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your iron forge produces masterwork! Every ingot is pure steel, every chain unbreakable',
    ])
  })

  it('recommends improving smelting when low', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('smelting'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving tempering when low', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('tempering'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving endurance when low', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('endurance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving rhythm when low', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('rhythm'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving chain strength when low', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('chain'))
    expect(rec).toBeTruthy()
  })

  it('warns about scrap heap files', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('scrap heap'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall strength', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall forge strength'))
    expect(rec).toBeTruthy()
  })

  it('lists specific scrap files to reforge', async () => {
    const result = await buildIronForgeIIResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Reforge these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all halls are cold/no-forge', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('cold or empty'))
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
  it('returns a string for masterwork-iron', () => {
    expect(typeof colorGrade('masterwork-iron')).toBe('string')
  })

  it('returns a string for scrap-heap', () => {
    expect(typeof colorGrade('scrap-heap')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatIronTable', () => {
  it('formats an iron', () => {
    const iron = analyzeForgedIron(richContent, 'test.ts')
    const output = formatIronTable(iron)
    expect(output).toContain('test.ts')
    expect(output).toContain('Smelting Quality')
    expect(output).toContain('Tempering Balance')
    expect(output).toContain('Anvil Endurance')
    expect(output).toContain('Hammer Rhythm')
    expect(output).toContain('Chain Strength')
  })
})

describe('formatIronsTable', () => {
  it('handles empty irons', () => {
    const output = formatIronsTable([])
    expect(output).toContain('No forged irons')
  })

  it('formats multiple irons', () => {
    const irons = [
      analyzeForgedIron(richContent, 'a.ts'),
      analyzeForgedIron(minimalContent, 'b.ts'),
    ]
    const output = formatIronsTable(irons)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatHallTable', () => {
  it('formats a hall', () => {
    const irons = [analyzeForgedIron(richContent, 'dir/a.ts')]
    const hall = analyzeForgeHall(irons, 'dir')
    const output = formatHallTable(hall)
    expect(output).toContain('dir')
    expect(output).toContain('Hall')
  })
})

describe('formatHallsTable', () => {
  it('handles empty halls', () => {
    const output = formatHallsTable([])
    expect(output).toContain('No forge halls')
  })

  it('formats multiple halls', () => {
    const irons = [analyzeForgedIron(richContent, 'src/a.ts')]
    const halls = [analyzeForgeHall(irons, 'src')]
    const output = formatHallsTable(halls)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Iron Forge II Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Blacksmith Grade')
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
    const result = await buildIronForgeIIResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Iron Forge II Analysis')
    expect(output).toContain('Forge Hall Analysis')
    expect(output).toContain('Iron Forge II Statistics')
    expect(output).toContain('Guild')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildIronForgeIIResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.irons).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.guild.isForging).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const iron = analyzeForgedIron('   \n\t  ', 'blank.ts')
    expect(iron.smeltingQuality).toBe(0)
    expect(iron.qualityScore).toBe(0)
    expect(iron.condition).toBe('scrap-heap')
  })

  it('handles content with only comments', () => {
    const iron = analyzeForgedIron('// just a comment\n/* block */', 'comment.ts')
    expect(iron.smeltingQuality).toBe(0)
    expect(iron.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildIronForgeIIResult(['big.ts'], [longContent])
    expect(result.irons).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildIronForgeIIResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.masterworkIronCount).toBe(50)
  })

  it('handles single file hall', async () => {
    const result = await buildIronForgeIIResult(['single.ts'], [richContent])
    expect(result.halls).toHaveLength(1)
    expect(result.halls[0]!.irons).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const iron = analyzeForgedIron(richContent, 'cap.ts')
    expect(iron.qualityScore).toBeLessThanOrEqual(100)
    expect(iron.smeltingQuality).toBeLessThanOrEqual(100)
    expect(iron.temperingBalance).toBeLessThanOrEqual(100)
    expect(iron.anvilEndurance).toBeLessThanOrEqual(100)
    expect(iron.hammerRhythm).toBeLessThanOrEqual(100)
    expect(iron.chainStrength).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildIronForgeIIResult([], [])
    const r2 = await buildIronForgeIIResult(['a.ts'], [richContent])
    const r3 = await buildIronForgeIIResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
