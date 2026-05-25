import { describe, it, expect } from 'vitest'
import {
  measureForging,
  measureCommanding,
  measureRefining,
  measureFlexing,
  measureEnduring,
  classifyIronCondition,
  classifyThroneType,
  classifyMonarchGrade,
  classifyThroneCondition,
  analyzeIronJewel,
  analyzeIronThrone,
  buildIronCrownResult,
  generateRecommendations,
} from '../src/commands/iron-crown-helpers.js'
import {
  colorScore,
  colorCondition,
  formatJewelTable,
  formatJewelsTable,
  formatThroneTable,
  formatThronesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/iron-crown-format-helpers.js'

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

// ─── measureForging ─────────────────────────────────────────────────

describe('measureForging', () => {
  it('returns 0 for empty content', () => {
    const m = measureForging('')
    expect(m.strength).toBe(0)
    expect(m.iron).toBe('no-strength')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureForging(minimalContent)
    expect(m.strength).toBe(0)
    expect(m.iron).toBe('no-strength')
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoMonolithic).toBe(true)
    expect(m.chaoticCount).toBe(0)
    expect(m.monolithicCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureForging(richContent)
    expect(m.strength).toBe(100)
    expect(m.iron).toBe('unbreakable-steel')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasScalable).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasStrong).toBe(true)
    expect(m.hasPowerful).toBe(true)
  })

  it('detects chaotic var usage', () => {
    const m = measureForging('var x = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic any usage', () => {
    const m = measureForging('const x: any = 1')
    expect(m.monolithicCount).toBe(1)
    expect(m.hasNoMonolithic).toBe(false)
  })
})

// ─── measureCommanding ──────────────────────────────────────────────

describe('measureCommanding', () => {
  it('returns 0 for empty content', () => {
    const m = measureCommanding('')
    expect(m.authority).toBe(0)
    expect(m.command).toBe('no-authority')
    expect(m.hasHighAuthority).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCommanding(minimalContent)
    expect(m.authority).toBe(0)
    expect(m.command).toBe('no-authority')
    expect(m.hasExported).toBe(false)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasNoUndocumented).toBe(true)
    expect(m.hiddenCount).toBe(0)
    expect(m.undocumentedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCommanding(richContent)
    expect(m.authority).toBe(100)
    expect(m.command).toBe('absolute-monarch')
    expect(m.hasHighAuthority).toBe(true)
    expect(m.hasExported).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasClearAPI).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasDecisive).toBe(true)
    expect(m.hasTyped).toBe(true)
    expect(m.hasNamed).toBe(true)
    expect(m.hasVisible).toBe(true)
  })

  it('detects hidden eval usage', () => {
    const m = measureCommanding('eval("1")')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects undocumented any usage', () => {
    const m = measureCommanding('const x: any = 1')
    expect(m.undocumentedCount).toBe(1)
    expect(m.hasNoUndocumented).toBe(false)
  })
})

// ─── measureRefining ────────────────────────────────────────────────

describe('measureRefining', () => {
  it('returns 0 for empty content', () => {
    const m = measureRefining('')
    expect(m.precision).toBe(0)
    expect(m.jewel).toBe('no-jewel')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureRefining(minimalContent)
    expect(m.precision).toBe(0)
    expect(m.jewel).toBe('no-jewel')
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasNoBuggy).toBe(true)
    expect(m.unsafeCount).toBe(0)
    expect(m.buggyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureRefining(richContent)
    expect(m.precision).toBe(100)
    expect(m.jewel).toBe('flawless-diamond')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasValidated).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasRefined).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureRefining('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects buggy var usage', () => {
    const m = measureRefining('var x = 1')
    expect(m.buggyCount).toBe(1)
    expect(m.hasNoBuggy).toBe(false)
  })
})

// ─── measureFlexing ─────────────────────────────────────────────────

describe('measureFlexing', () => {
  it('returns 0 for empty content', () => {
    const m = measureFlexing('')
    expect(m.resilience).toBe(0)
    expect(m.circlet).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureFlexing(minimalContent)
    expect(m.resilience).toBe(0)
    expect(m.circlet).toBe('no-resilience')
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureFlexing(richContent)
    expect(m.resilience).toBe(100)
    expect(m.circlet).toBe('adamant-flex')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasForgiving).toBe(true)
    expect(m.hasAdaptive).toBe(true)
  })

  it('detects untested var usage', () => {
    const m = measureFlexing('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects bare crash eval usage', () => {
    const m = measureFlexing('eval("1")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })
})

// ─── measureEnduring ────────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 for empty content', () => {
    const m = measureEnduring('')
    expect(m.endurance).toBe(0)
    expect(m.reign).toBe('no-endurance')
    expect(m.hasHighEndurance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureEnduring(minimalContent)
    expect(m.endurance).toBe(0)
    expect(m.reign).toBe('no-endurance')
    expect(m.hasProven).toBe(false)
    expect(m.hasNoExperimental).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.experimentalCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureEnduring(richContent)
    expect(m.endurance).toBe(100)
    expect(m.reign).toBe('eternal-dynasty')
    expect(m.hasHighEndurance).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasEstablished).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasTimeless).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects experimental var usage', () => {
    const m = measureEnduring('var x = 1')
    expect(m.experimentalCount).toBe(1)
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureEnduring('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })
})

// ─── classifyIronCondition ──────────────────────────────────────────

describe('classifyIronCondition', () => {
  it('classifies imperial-crown for 90+', () => {
    expect(classifyIronCondition(90)).toBe('imperial-crown')
    expect(classifyIronCondition(100)).toBe('imperial-crown')
  })

  it('classifies royal-diadem for 75-89', () => {
    expect(classifyIronCondition(75)).toBe('royal-diadem')
    expect(classifyIronCondition(89)).toBe('royal-diadem')
  })

  it('classifies proper-circlet for 60-74', () => {
    expect(classifyIronCondition(60)).toBe('proper-circlet')
    expect(classifyIronCondition(74)).toBe('proper-circlet')
  })

  it('classifies tarnished-band for 40-59', () => {
    expect(classifyIronCondition(40)).toBe('tarnished-band')
    expect(classifyIronCondition(59)).toBe('tarnished-band')
  })

  it('classifies broken-crown for 20-39', () => {
    expect(classifyIronCondition(20)).toBe('broken-crown')
    expect(classifyIronCondition(39)).toBe('broken-crown')
  })

  it('classifies void for 0-19', () => {
    expect(classifyIronCondition(0)).toBe('void')
    expect(classifyIronCondition(19)).toBe('void')
  })
})

// ─── classifyThroneType ─────────────────────────────────────────────

describe('classifyThroneType', () => {
  it('returns no-throne for empty jewels', () => {
    expect(classifyThroneType([])).toBe('no-throne')
  })

  it('classifies grand-throne for high avg', () => {
    const jewels = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeIronJewel(richContent, `f${i}.ts`),
    }))
    expect(classifyThroneType(jewels)).toBe('grand-throne')
  })

  it('classifies no-throne for low scores', () => {
    const jewels = [analyzeIronJewel('', 'a.ts')]
    expect(classifyThroneType(jewels)).toBe('no-throne')
  })

  it('classifies royal-court for mid-high scores', () => {
    const jewels = Array.from({ length: 3 }, () => ({
      ...analyzeIronJewel(richContent, 'f.ts'),
      qualityScore: 75,
      condition: 'royal-diadem' as const,
    }))
    expect(classifyThroneType(jewels)).toBe('royal-court')
  })

  it('classifies proper-hall for mid scores', () => {
    const jewels = Array.from({ length: 3 }, () => ({
      ...analyzeIronJewel(richContent, 'f.ts'),
      qualityScore: 60,
      condition: 'proper-circlet' as const,
    }))
    expect(classifyThroneType(jewels)).toBe('proper-hall')
  })

  it('classifies small-chamber for low scores', () => {
    const jewels = Array.from({ length: 3 }, () => ({
      ...analyzeIronJewel(richContent, 'f.ts'),
      qualityScore: 36,
      condition: 'tarnished-band' as const,
    }))
    expect(classifyThroneType(jewels)).toBe('small-chamber')
  })

  it('classifies dark-dungeon for very low scores', () => {
    const jewels = Array.from({ length: 3 }, () => ({
      ...analyzeIronJewel(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'void' as const,
    }))
    expect(classifyThroneType(jewels)).toBe('dark-dungeon')
  })
})

// ─── classifyMonarchGrade ───────────────────────────────────────────

describe('classifyMonarchGrade', () => {
  it('classifies emperor for 80+', () => {
    expect(classifyMonarchGrade(80)).toBe('emperor')
    expect(classifyMonarchGrade(100)).toBe('emperor')
  })

  it('classifies king for 65-79', () => {
    expect(classifyMonarchGrade(65)).toBe('king')
    expect(classifyMonarchGrade(79)).toBe('king')
  })

  it('classifies duke for 50-64', () => {
    expect(classifyMonarchGrade(50)).toBe('duke')
    expect(classifyMonarchGrade(64)).toBe('duke')
  })

  it('classifies count for 35-49', () => {
    expect(classifyMonarchGrade(35)).toBe('count')
    expect(classifyMonarchGrade(49)).toBe('count')
  })

  it('classifies knight for 20-34', () => {
    expect(classifyMonarchGrade(20)).toBe('knight')
    expect(classifyMonarchGrade(34)).toBe('knight')
  })

  it('classifies peasant for 0-19', () => {
    expect(classifyMonarchGrade(0)).toBe('peasant')
    expect(classifyMonarchGrade(19)).toBe('peasant')
  })
})

// ─── classifyThroneCondition ────────────────────────────────────────

describe('classifyThroneCondition', () => {
  it('classifies golden-palace for 85+', () => {
    expect(classifyThroneCondition(85)).toBe('golden-palace')
  })

  it('classifies royal-court for 70-84', () => {
    expect(classifyThroneCondition(70)).toBe('royal-court')
  })

  it('classifies proper-hall for 55-69', () => {
    expect(classifyThroneCondition(55)).toBe('proper-hall')
  })

  it('classifies tarnished-room for 35-54', () => {
    expect(classifyThroneCondition(35)).toBe('tarnished-room')
  })

  it('classifies ruined-keep for 15-34', () => {
    expect(classifyThroneCondition(15)).toBe('ruined-keep')
  })

  it('classifies void for 0-14', () => {
    expect(classifyThroneCondition(0)).toBe('void')
  })
})

// ─── analyzeIronJewel ───────────────────────────────────────────────

describe('analyzeIronJewel', () => {
  it('analyzes minimal content', () => {
    const jewel = analyzeIronJewel(minimalContent, 'minimal.ts')
    expect(jewel.file).toBe('minimal.ts')
    expect(jewel.sovereignStrength).toBe(0)
    expect(jewel.crownAuthority).toBe(0)
    expect(jewel.jewelPrecision).toBe(0)
    expect(jewel.circletResilience).toBe(0)
    expect(jewel.reignEndurance).toBe(0)
    expect(jewel.qualityScore).toBe(0)
    expect(jewel.condition).toBe('void')
    expect(jewel.forging.iron).toBe('no-strength')
    expect(jewel.commanding.command).toBe('no-authority')
    expect(jewel.refining.jewel).toBe('no-jewel')
    expect(jewel.flexing.circlet).toBe('no-resilience')
    expect(jewel.enduring.reign).toBe('no-endurance')
  })

  it('analyzes rich content', () => {
    const jewel = analyzeIronJewel(richContent, 'rich.ts')
    expect(jewel.file).toBe('rich.ts')
    expect(jewel.sovereignStrength).toBe(100)
    expect(jewel.crownAuthority).toBe(100)
    expect(jewel.jewelPrecision).toBe(100)
    expect(jewel.circletResilience).toBe(100)
    expect(jewel.reignEndurance).toBe(100)
    expect(jewel.qualityScore).toBe(100)
    expect(jewel.condition).toBe('imperial-crown')
    expect(jewel.forging.iron).toBe('unbreakable-steel')
    expect(jewel.commanding.command).toBe('absolute-monarch')
    expect(jewel.refining.jewel).toBe('flawless-diamond')
    expect(jewel.flexing.circlet).toBe('adamant-flex')
    expect(jewel.enduring.reign).toBe('eternal-dynasty')
  })

  it('computes qualityScore as weighted average', () => {
    const jewel = analyzeIronJewel('export const x = 1', 'mid.ts')
    const expected = Math.round(
      jewel.sovereignStrength * 0.2 +
      jewel.crownAuthority * 0.2 +
      jewel.jewelPrecision * 0.2 +
      jewel.circletResilience * 0.2 +
      jewel.reignEndurance * 0.2,
    )
    expect(jewel.qualityScore).toBe(expected)
  })
})

// ─── analyzeIronThrone ──────────────────────────────────────────────

describe('analyzeIronThrone', () => {
  it('returns empty throne for empty jewels', () => {
    const throne = analyzeIronThrone([], 'empty-dir')
    expect(throne.directory).toBe('empty-dir')
    expect(throne.jewels).toHaveLength(0)
    expect(throne.avgStrength).toBe(0)
    expect(throne.throneType).toBe('no-throne')
    expect(throne.condition).toBe('void')
  })

  it('analyzes throne with rich jewels', () => {
    const jewels = [
      analyzeIronJewel(richContent, 'dir/a.ts'),
      analyzeIronJewel(richContent, 'dir/b.ts'),
    ]
    const throne = analyzeIronThrone(jewels, 'dir')
    expect(throne.avgStrength).toBe(100)
    expect(throne.imperialCrownCount).toBe(2)
    expect(throne.voidCount).toBe(0)
    expect(throne.throneType).toBe('grand-throne')
  })

  it('analyzes throne with mixed jewels', () => {
    const jewels = [
      analyzeIronJewel(richContent, 'dir/a.ts'),
      analyzeIronJewel(minimalContent, 'dir/b.ts'),
    ]
    const throne = analyzeIronThrone(jewels, 'dir')
    expect(throne.imperialCrownCount).toBe(1)
    expect(throne.voidCount).toBe(1)
  })
})

// ─── buildIronCrownResult ───────────────────────────────────────────

describe('buildIronCrownResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildIronCrownResult([], [])
    expect(result.jewels).toHaveLength(0)
    expect(result.thrones).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSovereignty).toBe(0)
    expect(result.stats.monarchGrade).toBe('peasant')
    expect(result.kingdom.isImperial).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildIronCrownResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.jewels).toHaveLength(2)
    expect(result.thrones).toHaveLength(1)
    expect(result.stats.avgSovereignStrength).toBe(100)
    expect(result.stats.avgCrownAuthority).toBe(100)
    expect(result.stats.avgJewelPrecision).toBe(100)
    expect(result.stats.avgCircletResilience).toBe(100)
    expect(result.stats.avgReignEndurance).toBe(100)
    expect(result.stats.imperialCrownCount).toBe(2)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.hasHighStrengthCount).toBe(2)
    expect(result.stats.hasHighAuthorityCount).toBe(2)
    expect(result.stats.hasHighPrecisionCount).toBe(2)
    expect(result.stats.hasHighResilienceCount).toBe(2)
    expect(result.stats.hasHighEnduranceCount).toBe(2)
    expect(result.stats.overallSovereignty).toBe(100)
    expect(result.stats.monarchGrade).toBe('emperor')
    expect(result.kingdom.isImperial).toBe(true)
    expect(result.stats.bestJewel).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.mostAuthoritative).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildIronCrownResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.thrones).toHaveLength(2)
    const dirs = result.thrones.map(t => t.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall sovereignty correctly', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    expect(result.kingdom.overallSovereignty).toBe(0)
  })

  it('sets isImperial when overallSovereignty >= 60', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    expect(result.kingdom.isImperial).toBe(true)
  })

  it('sets isImperial false when overallSovereignty < 60', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    expect(result.kingdom.isImperial).toBe(false)
  })

  it('picks best jewel by qualityScore', async () => {
    const result = await buildIronCrownResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestJewel).toBe('high.ts')
    expect(result.stats.strongest).toBe('high.ts')
    expect(result.stats.mostAuthoritative).toBe('high.ts')
    expect(result.stats.mostPrecise).toBe('high.ts')
    expect(result.stats.mostResilient).toBe('high.ts')
    expect(result.stats.mostEnduring).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildIronCrownResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.imperialCrownCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your iron crown is forged to perfection! The sovereign rules with absolute authority and every jewel gleams with precision',
    ])
  })

  it('recommends improving sovereign strength when low', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('sovereign'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving crown authority when low', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('authority'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving jewel precision when low', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('jewel'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving circlet resilience when low', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('circlet'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving reign endurance when low', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('reign'))
    expect(rec).toBeTruthy()
  })

  it('warns about broken crowns', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Reforge'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall sovereignty', async () => {
    const result = await buildIronCrownResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('sovereignty'))
    expect(rec).toBeTruthy()
  })

  it('lists specific broken crowns to reforge', async () => {
    const result = await buildIronCrownResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Reforge these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all thrones are dark-dungeon/no-throne', async () => {
    const result = await buildIronCrownResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('darkness'))
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

describe('colorCondition', () => {
  it('returns a string for imperial-crown', () => {
    expect(typeof colorCondition('imperial-crown')).toBe('string')
  })

  it('returns a string for void', () => {
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('formatJewelTable', () => {
  it('formats a jewel', () => {
    const jewel = analyzeIronJewel(richContent, 'test.ts')
    const output = formatJewelTable(jewel)
    expect(output).toContain('test.ts')
    expect(output).toContain('Sovereign Strength')
    expect(output).toContain('Crown Authority')
    expect(output).toContain('Jewel Precision')
    expect(output).toContain('Circlet Resilience')
    expect(output).toContain('Reign Endurance')
  })
})

describe('formatJewelsTable', () => {
  it('handles empty jewels', () => {
    const output = formatJewelsTable([])
    expect(output).toContain('No iron jewels')
  })

  it('formats multiple jewels', () => {
    const jewels = [
      analyzeIronJewel(richContent, 'a.ts'),
      analyzeIronJewel(minimalContent, 'b.ts'),
    ]
    const output = formatJewelsTable(jewels)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatThroneTable', () => {
  it('formats a throne', () => {
    const jewels = [analyzeIronJewel(richContent, 'dir/a.ts')]
    const throne = analyzeIronThrone(jewels, 'dir')
    const output = formatThroneTable(throne)
    expect(output).toContain('dir')
    expect(output).toContain('Throne')
  })
})

describe('formatThronesTable', () => {
  it('handles empty thrones', () => {
    const output = formatThronesTable([])
    expect(output).toContain('No iron thrones')
  })

  it('formats multiple thrones', () => {
    const jewels = [analyzeIronJewel(richContent, 'src/a.ts')]
    const thrones = [analyzeIronThrone(jewels, 'src')]
    const output = formatThronesTable(thrones)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Iron Crown Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Monarch Grade')
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
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Iron Crown Analysis')
    expect(output).toContain('Iron Jewels')
    expect(output).toContain('Iron Thrones')
    expect(output).toContain('Kingdom Overview')
    expect(output).toContain('Iron Crown Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.jewels).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.kingdom.isImperial).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const jewel = analyzeIronJewel('   \n\t  ', 'blank.ts')
    expect(jewel.sovereignStrength).toBe(0)
    expect(jewel.qualityScore).toBe(0)
    expect(jewel.condition).toBe('void')
  })

  it('handles content with only comments', () => {
    const jewel = analyzeIronJewel('// just a comment\n/* block */', 'comment.ts')
    expect(jewel.sovereignStrength).toBe(0)
    expect(jewel.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildIronCrownResult(['big.ts'], [longContent])
    expect(result.jewels).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildIronCrownResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.imperialCrownCount).toBe(50)
  })

  it('handles single file throne', async () => {
    const result = await buildIronCrownResult(['single.ts'], [richContent])
    expect(result.thrones).toHaveLength(1)
    expect(result.thrones[0]!.jewels).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const jewel = analyzeIronJewel(richContent, 'cap.ts')
    expect(jewel.qualityScore).toBeLessThanOrEqual(100)
    expect(jewel.sovereignStrength).toBeLessThanOrEqual(100)
    expect(jewel.crownAuthority).toBeLessThanOrEqual(100)
    expect(jewel.jewelPrecision).toBeLessThanOrEqual(100)
    expect(jewel.circletResilience).toBeLessThanOrEqual(100)
    expect(jewel.reignEndurance).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildIronCrownResult([], [])
    const r2 = await buildIronCrownResult(['a.ts'], [richContent])
    const r3 = await buildIronCrownResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
