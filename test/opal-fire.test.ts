import { describe, it, expect } from 'vitest'
import {
  measureColoring,
  measureBlazing,
  measureResisting,
  measureBalancing,
  measureCutting,
  classifyOpalCondition,
  classifyMineType,
  classifyLapidaryGrade,
  classifyFieldCondition,
  analyzeOpalFire,
  analyzeOpalMine,
  buildOpalFireResult,
  generateRecommendations,
} from '../src/commands/opal-fire-helpers.js'
import {
  colorScore,
  colorGrade,
  formatFireTable,
  formatFiresTable,
  formatMineTable,
  formatMinesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/opal-fire-format-helpers.js'

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

// ─── measureColoring ───────────────────────────────────────────────

describe('measureColoring', () => {
  it('returns 0 for empty content', () => {
    const m = measureColoring('')
    expect(m.play).toBe(0)
    expect(m.grade).toBe('no-color')
    expect(m.hasHighPlay).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureColoring(minimalContent)
    expect(m.play).toBe(8)
    expect(m.grade).toBe('no-color')
    expect(m.hasVaried).toBe(false)
    expect(m.hasNoMonotone).toBe(true)
    expect(m.hasNoDrab).toBe(true)
    expect(m.monotoneCount).toBe(0)
    expect(m.drabCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureColoring(richContent)
    expect(m.play).toBe(100)
    expect(m.grade).toBe('rainbow-fire')
    expect(m.hasHighPlay).toBe(true)
    expect(m.hasVaried).toBe(true)
    expect(m.hasDiverse).toBe(true)
    expect(m.hasExpressive).toBe(true)
    expect(m.hasVibrant).toBe(true)
    expect(m.hasRich).toBe(true)
    expect(m.hasColorful).toBe(true)
  })

  it('detects monotone var usage', () => {
    const m = measureColoring('var x = 1')
    expect(m.monotoneCount).toBe(1)
    expect(m.hasNoMonotone).toBe(false)
  })

  it('detects drab any usage', () => {
    const m = measureColoring('const x: any = 1')
    expect(m.drabCount).toBe(1)
    expect(m.hasNoDrab).toBe(false)
  })

  it('detects flat eval usage', () => {
    const m = measureColoring('eval("1")')
    expect(m.hasNoFlat).toBe(false)
  })

  it('detects bland debugger usage', () => {
    const m = measureColoring('debugger')
    expect(m.hasNoBland).toBe(false)
  })
})

// ─── measureBlazing ────────────────────────────────────────────────

describe('measureBlazing', () => {
  it('returns 0 for empty content', () => {
    const m = measureBlazing('')
    expect(m.brilliance).toBe(0)
    expect(m.fire).toBe('dead-opal')
    expect(m.hasHighBrilliance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureBlazing(minimalContent)
    expect(m.brilliance).toBe(8)
    expect(m.fire).toBe('dead-opal')
    expect(m.hasVivid).toBe(false)
    expect(m.weakCount).toBe(0)
    expect(m.faintCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureBlazing(richContent)
    expect(m.brilliance).toBe(100)
    expect(m.fire).toBe('white-fire')
    expect(m.hasHighBrilliance).toBe(true)
    expect(m.hasVivid).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasNoWeak).toBe(true)
    expect(m.hasStriking).toBe(true)
    expect(m.hasNoFaint).toBe(true)
    expect(m.hasPowerful).toBe(true)
    expect(m.hasNoWeakEffect).toBe(true)
    expect(m.hasBrilliant).toBe(true)
    expect(m.hasNoDim).toBe(true)
    expect(m.hasDazzling).toBe(true)
  })

  it('detects weak var usage', () => {
    const m = measureBlazing('var x = 1')
    expect(m.weakCount).toBe(1)
  })

  it('detects faint any usage', () => {
    const m = measureBlazing('const x: any = 1')
    expect(m.faintCount).toBe(1)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns 0 for empty content', () => {
    const m = measureResisting('')
    expect(m.resistance).toBe(0)
    expect(m.crack).toBe('shattered')
    expect(m.hasHighResistance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureResisting(minimalContent)
    expect(m.resistance).toBe(0)
    expect(m.crack).toBe('shattered')
    expect(m.hasDurable).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoCrumbly).toBe(true)
    expect(m.fragileCount).toBe(0)
    expect(m.brittleCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBe(100)
    expect(m.crack).toBe('flawless-opal')
    expect(m.hasHighResistance).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasIntact).toBe(true)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoCrumbly).toBe(true)
    expect(m.hasNoBroken).toBe(true)
    expect(m.hasSound).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureResisting('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects brittle any usage', () => {
    const m = measureResisting('const x: any = 1')
    expect(m.brittleCount).toBe(1)
    expect(m.hasNoBrittle).toBe(false)
  })

  it('detects eval as broken', () => {
    const m = measureResisting('eval("1")')
    expect(m.hasNoBroken).toBe(false)
  })

  it('detects debugger as unsound', () => {
    const m = measureResisting('debugger')
    expect(m.hasSound).toBe(false)
  })
})

// ─── measureBalancing ──────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns 0 for empty content', () => {
    const m = measureBalancing('')
    expect(m.balance).toBe(0)
    expect(m.hydration).toBe('desiccated')
    expect(m.hasHighBalance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureBalancing(minimalContent)
    expect(m.balance).toBe(0)
    expect(m.hydration).toBe('desiccated')
    expect(m.hasBalanced).toBe(false)
    expect(m.overweightCount).toBe(0)
    expect(m.bloatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureBalancing(richContent)
    expect(m.balance).toBe(100)
    expect(m.hydration).toBe('perfectly-hydrated')
    expect(m.hasHighBalance).toBe(true)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasProportioned).toBe(true)
    expect(m.hasNoOverweight).toBe(true)
    expect(m.hasLean).toBe(true)
    expect(m.hasNoBloated).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasNoClashing).toBe(true)
    expect(m.hasMeasured).toBe(true)
    expect(m.hasNoExcessive).toBe(true)
    expect(m.hasModerate).toBe(true)
  })

  it('detects overweight var usage', () => {
    const m = measureBalancing('var x = 1')
    expect(m.overweightCount).toBe(1)
  })

  it('detects bloated any usage', () => {
    const m = measureBalancing('const x: any = 1')
    expect(m.bloatedCount).toBe(1)
  })
})

// ─── measureCutting ────────────────────────────────────────────────

describe('measureCutting', () => {
  it('returns 0 for empty content', () => {
    const m = measureCutting('')
    expect(m.quality).toBe(0)
    expect(m.cut).toBe('uncut')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCutting(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.cut).toBe('uncut')
    expect(m.hasPrecise).toBe(false)
    expect(m.sloppyCount).toBe(0)
    expect(m.roughCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCutting(richContent)
    expect(m.quality).toBe(100)
    expect(m.cut).toBe('master-cut')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasNoSloppy).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasNoDull).toBe(true)
    expect(m.hasNoRaw).toBe(true)
    expect(m.hasElegant).toBe(true)
  })

  it('detects sloppy var usage', () => {
    const m = measureCutting('var x = 1')
    expect(m.sloppyCount).toBe(1)
  })

  it('detects rough any usage', () => {
    const m = measureCutting('const x: any = 1')
    expect(m.roughCount).toBe(1)
  })

  it('detects eval as raw', () => {
    const m = measureCutting('eval("1")')
    expect(m.hasNoRaw).toBe(false)
  })
})

// ─── classifyOpalCondition ────────────────────────────────────────

describe('classifyOpalCondition', () => {
  it('classifies black-opal for 85+', () => {
    expect(classifyOpalCondition(85)).toBe('black-opal')
    expect(classifyOpalCondition(100)).toBe('black-opal')
  })

  it('classifies boulder-opal for 70-84', () => {
    expect(classifyOpalCondition(70)).toBe('boulder-opal')
    expect(classifyOpalCondition(84)).toBe('boulder-opal')
  })

  it('classifies white-opal for 55-69', () => {
    expect(classifyOpalCondition(55)).toBe('white-opal')
    expect(classifyOpalCondition(69)).toBe('white-opal')
  })

  it('classifies common-opal for 40-54', () => {
    expect(classifyOpalCondition(40)).toBe('common-opal')
    expect(classifyOpalCondition(54)).toBe('common-opal')
  })

  it('classifies cracked-opal for 25-39', () => {
    expect(classifyOpalCondition(25)).toBe('cracked-opal')
    expect(classifyOpalCondition(39)).toBe('cracked-opal')
  })

  it('classifies opal-dust for 0-24', () => {
    expect(classifyOpalCondition(0)).toBe('opal-dust')
    expect(classifyOpalCondition(24)).toBe('opal-dust')
  })
})

// ─── classifyMineType ─────────────────────────────────────────────

describe('classifyMineType', () => {
  it('returns no-mine for empty fires', () => {
    expect(classifyMineType([])).toBe('no-mine')
  })

  it('classifies lightning-ridge for high avg + high black ratio', () => {
    const fires = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeOpalFire(richContent, `f${i}.ts`),
    }))
    expect(classifyMineType(fires)).toBe('lightning-ridge')
  })

  it('classifies no-mine for low scores', () => {
    const fires = [analyzeOpalFire('', 'a.ts')]
    expect(classifyMineType(fires)).toBe('no-mine')
  })

  it('classifies coober-pedy for mid-high scores', () => {
    const fires = Array.from({ length: 3 }, () => ({
      ...analyzeOpalFire(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'boulder-opal' as const,
    }))
    expect(classifyMineType(fires)).toBe('coober-pedy')
  })

  it('classifies proper-mine for mid scores', () => {
    const fires = Array.from({ length: 3 }, () => ({
      ...analyzeOpalFire(richContent, 'f.ts'),
      qualityScore: 50,
      condition: 'white-opal' as const,
    }))
    expect(classifyMineType(fires)).toBe('proper-mine')
  })

  it('classifies dry-dig for very low scores', () => {
    const fires = Array.from({ length: 3 }, () => ({
      ...analyzeOpalFire(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'opal-dust' as const,
    }))
    expect(classifyMineType(fires)).toBe('dry-dig')
  })
})

// ─── classifyLapidaryGrade ────────────────────────────────────────

describe('classifyLapidaryGrade', () => {
  it('classifies master-lapidary for 80+', () => {
    expect(classifyLapidaryGrade(80)).toBe('master-lapidary')
    expect(classifyLapidaryGrade(100)).toBe('master-lapidary')
  })

  it('classifies expert-gem-cutter for 65-79', () => {
    expect(classifyLapidaryGrade(65)).toBe('expert-gem-cutter')
    expect(classifyLapidaryGrade(79)).toBe('expert-gem-cutter')
  })

  it('classifies skilled-artisan for 50-64', () => {
    expect(classifyLapidaryGrade(50)).toBe('skilled-artisan')
    expect(classifyLapidaryGrade(64)).toBe('skilled-artisan')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyLapidaryGrade(35)).toBe('apprentice')
    expect(classifyLapidaryGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyLapidaryGrade(20)).toBe('novice')
    expect(classifyLapidaryGrade(34)).toBe('novice')
  })

  it('classifies rock-smasher for 0-19', () => {
    expect(classifyLapidaryGrade(0)).toBe('rock-smasher')
    expect(classifyLapidaryGrade(19)).toBe('rock-smasher')
  })
})

// ─── classifyFieldCondition ───────────────────────────────────────

describe('classifyFieldCondition', () => {
  it('classifies gem-quality for 75+', () => {
    expect(classifyFieldCondition(75)).toBe('gem-quality')
  })

  it('classifies good-find for 60-74', () => {
    expect(classifyFieldCondition(60)).toBe('good-find')
  })

  it('classifies decent-yield for 45-59', () => {
    expect(classifyFieldCondition(45)).toBe('decent-yield')
  })

  it('classifies low-grade for 30-44', () => {
    expect(classifyFieldCondition(30)).toBe('low-grade')
  })

  it('classifies mine-tailings for 15-29', () => {
    expect(classifyFieldCondition(15)).toBe('mine-tailings')
  })

  it('classifies empty-shaft for 0-14', () => {
    expect(classifyFieldCondition(0)).toBe('empty-shaft')
  })
})

// ─── analyzeOpalFire ───────────────────────────────────────────────

describe('analyzeOpalFire', () => {
  it('analyzes minimal content', () => {
    const fire = analyzeOpalFire(minimalContent, 'minimal.ts')
    expect(fire.file).toBe('minimal.ts')
    expect(fire.playOfColor).toBe(8)
    expect(fire.fireBrilliance).toBe(8)
    expect(fire.crackResistance).toBe(0)
    expect(fire.hydrationBalance).toBe(0)
    expect(fire.cuttingQuality).toBe(8)
    expect(fire.qualityScore).toBe(5)
    expect(fire.condition).toBe('opal-dust')
    expect(fire.coloring.grade).toBe('no-color')
    expect(fire.blazing.fire).toBe('dead-opal')
    expect(fire.resisting.crack).toBe('shattered')
    expect(fire.balancing.hydration).toBe('desiccated')
    expect(fire.cutting.cut).toBe('uncut')
  })

  it('analyzes rich content', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.file).toBe('rich.ts')
    expect(fire.playOfColor).toBe(100)
    expect(fire.fireBrilliance).toBe(100)
    expect(fire.crackResistance).toBe(100)
    expect(fire.hydrationBalance).toBe(100)
    expect(fire.cuttingQuality).toBe(100)
    expect(fire.qualityScore).toBe(100)
    expect(fire.condition).toBe('black-opal')
    expect(fire.coloring.grade).toBe('rainbow-fire')
    expect(fire.blazing.fire).toBe('white-fire')
    expect(fire.resisting.crack).toBe('flawless-opal')
    expect(fire.balancing.hydration).toBe('perfectly-hydrated')
    expect(fire.cutting.cut).toBe('master-cut')
  })

  it('computes qualityScore as weighted average', () => {
    const fire = analyzeOpalFire('export const x = 1', 'mid.ts')
    const expected = Math.round(
      fire.playOfColor * 0.2 +
      fire.fireBrilliance * 0.2 +
      fire.crackResistance * 0.2 +
      fire.hydrationBalance * 0.2 +
      fire.cuttingQuality * 0.2,
    )
    expect(fire.qualityScore).toBe(expected)
  })
})

// ─── analyzeOpalMine ───────────────────────────────────────────────

describe('analyzeOpalMine', () => {
  it('returns empty mine for empty fires', () => {
    const mine = analyzeOpalMine([], 'empty-dir')
    expect(mine.directory).toBe('empty-dir')
    expect(mine.fires).toHaveLength(0)
    expect(mine.avgPlay).toBe(0)
    expect(mine.mineType).toBe('no-mine')
    expect(mine.condition).toBe('empty-shaft')
  })

  it('analyzes mine with rich fires', () => {
    const fires = [
      analyzeOpalFire(richContent, 'dir/a.ts'),
      analyzeOpalFire(richContent, 'dir/b.ts'),
    ]
    const mine = analyzeOpalMine(fires, 'dir')
    expect(mine.avgPlay).toBe(100)
    expect(mine.blackOpalCount).toBe(2)
    expect(mine.opalDustCount).toBe(0)
    expect(mine.mineType).toBe('lightning-ridge')
  })

  it('analyzes mine with mixed fires', () => {
    const fires = [
      analyzeOpalFire(richContent, 'dir/a.ts'),
      analyzeOpalFire(minimalContent, 'dir/b.ts'),
    ]
    const mine = analyzeOpalMine(fires, 'dir')
    expect(mine.blackOpalCount).toBe(1)
    expect(mine.opalDustCount).toBe(1)
  })
})

// ─── buildOpalFireResult ──────────────────────────────────────────

describe('buildOpalFireResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildOpalFireResult([], [])
    expect(result.fires).toHaveLength(0)
    expect(result.mines).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFire).toBe(0)
    expect(result.stats.lapidaryGrade).toBe('rock-smasher')
    expect(result.field.isBrilliant).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildOpalFireResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.fires).toHaveLength(2)
    expect(result.mines).toHaveLength(1)
    expect(result.stats.avgPlayOfColor).toBe(100)
    expect(result.stats.avgFireBrilliance).toBe(100)
    expect(result.stats.avgCrackResistance).toBe(100)
    expect(result.stats.avgHydrationBalance).toBe(100)
    expect(result.stats.avgCuttingQuality).toBe(100)
    expect(result.stats.blackOpalCount).toBe(2)
    expect(result.stats.opalDustCount).toBe(0)
    expect(result.stats.hasHighPlayCount).toBe(2)
    expect(result.stats.hasHighBrillianceCount).toBe(2)
    expect(result.stats.hasHighResistanceCount).toBe(2)
    expect(result.stats.hasHighBalanceCount).toBe(2)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.overallFire).toBe(100)
    expect(result.stats.lapidaryGrade).toBe('master-lapidary')
    expect(result.field.isBrilliant).toBe(true)
    expect(result.stats.bestFire).toBeTruthy()
    expect(result.stats.mostColorful).toBeTruthy()
    expect(result.stats.mostBrilliant).toBeTruthy()
    expect(result.stats.mostDurable).toBeTruthy()
    expect(result.stats.bestBalanced).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildOpalFireResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.mines).toHaveLength(2)
    const dirs = result.mines.map(m => m.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall fire correctly', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    expect(result.field.overallFire).toBe(Math.round((8 + 8 + 0) / 3))
  })

  it('sets isBrilliant when avgBrilliance >= 60', async () => {
    const result = await buildOpalFireResult(['a.ts'], [richContent])
    expect(result.field.isBrilliant).toBe(true)
  })

  it('sets isBrilliant false when avgBrilliance < 60', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    expect(result.field.isBrilliant).toBe(false)
  })

  it('picks best fire by qualityScore', async () => {
    const result = await buildOpalFireResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestFire).toBe('high.ts')
    expect(result.stats.mostColorful).toBe('high.ts')
    expect(result.stats.mostBrilliant).toBe('high.ts')
    expect(result.stats.mostDurable).toBe('high.ts')
    expect(result.stats.bestBalanced).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildOpalFireResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.blackOpalCount).toBe(1)
    expect(result.stats.opalDustCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildOpalFireResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your opal field is gem-quality! Every opal displays brilliant play of color',
    ])
  })

  it('recommends improving play of color when low', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('play of color'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving fire brilliance when low', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('brilliance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving crack resistance when low', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('crack resistance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving hydration balance when low', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('hydration'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving cutting quality when low', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('cutting quality'))
    expect(rec).toBeTruthy()
  })

  it('warns about opal dust files', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('opal dust'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall fire', async () => {
    const result = await buildOpalFireResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall opal fire'))
    expect(rec).toBeTruthy()
  })

  it('lists specific dust files to polish', async () => {
    const result = await buildOpalFireResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Polish these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all mines are dry digs/no-mine', async () => {
    const result = await buildOpalFireResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('dry digs or empty'))
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
  it('returns a string for black-opal', () => {
    expect(typeof colorGrade('black-opal')).toBe('string')
  })

  it('returns a string for opal-dust', () => {
    expect(typeof colorGrade('opal-dust')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatFireTable', () => {
  it('formats a fire', () => {
    const fire = analyzeOpalFire(richContent, 'test.ts')
    const output = formatFireTable(fire)
    expect(output).toContain('test.ts')
    expect(output).toContain('Play of Color')
    expect(output).toContain('Fire Brilliance')
    expect(output).toContain('Crack Resistance')
    expect(output).toContain('Hydration Balance')
    expect(output).toContain('Cutting Quality')
  })
})

describe('formatFiresTable', () => {
  it('handles empty fires', () => {
    const output = formatFiresTable([])
    expect(output).toContain('No opal fires')
  })

  it('formats multiple fires', () => {
    const fires = [
      analyzeOpalFire(richContent, 'a.ts'),
      analyzeOpalFire(minimalContent, 'b.ts'),
    ]
    const output = formatFiresTable(fires)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatMineTable', () => {
  it('formats a mine', () => {
    const fires = [analyzeOpalFire(richContent, 'dir/a.ts')]
    const mine = analyzeOpalMine(fires, 'dir')
    const output = formatMineTable(mine)
    expect(output).toContain('dir')
    expect(output).toContain('Mine')
  })
})

describe('formatMinesTable', () => {
  it('handles empty mines', () => {
    const output = formatMinesTable([])
    expect(output).toContain('No opal mines')
  })

  it('formats multiple mines', () => {
    const fires = [analyzeOpalFire(richContent, 'src/a.ts')]
    const mines = [analyzeOpalMine(fires, 'src')]
    const output = formatMinesTable(mines)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildOpalFireResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Opal Fire Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Lapidary Grade')
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
    const result = await buildOpalFireResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Opal Fire Analysis')
    expect(output).toContain('Opal Mine Analysis')
    expect(output).toContain('Opal Fire Statistics')
    expect(output).toContain('Field')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildOpalFireResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.fires).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.field.isBrilliant).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const fire = analyzeOpalFire('   \n\t  ', 'blank.ts')
    expect(fire.playOfColor).toBe(0)
    expect(fire.qualityScore).toBe(0)
    expect(fire.condition).toBe('opal-dust')
  })

  it('handles content with only comments', () => {
    const fire = analyzeOpalFire('// just a comment\n/* block */', 'comment.ts')
    expect(fire.playOfColor).toBe(0)
    expect(fire.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildOpalFireResult(['big.ts'], [longContent])
    expect(result.fires).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildOpalFireResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.blackOpalCount).toBe(50)
  })

  it('handles single file mine', async () => {
    const result = await buildOpalFireResult(['single.ts'], [richContent])
    expect(result.mines).toHaveLength(1)
    expect(result.mines[0]!.fires).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const fire = analyzeOpalFire(richContent, 'cap.ts')
    expect(fire.qualityScore).toBeLessThanOrEqual(100)
    expect(fire.playOfColor).toBeLessThanOrEqual(100)
    expect(fire.fireBrilliance).toBeLessThanOrEqual(100)
    expect(fire.crackResistance).toBeLessThanOrEqual(100)
    expect(fire.hydrationBalance).toBeLessThanOrEqual(100)
    expect(fire.cuttingQuality).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildOpalFireResult([], [])
    const r2 = await buildOpalFireResult(['a.ts'], [richContent])
    const r3 = await buildOpalFireResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
