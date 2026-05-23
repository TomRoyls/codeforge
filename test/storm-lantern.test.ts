import { describe, it, expect } from 'vitest'
import {
  measureIlluminating,
  measureResisting,
  measureOptimizing,
  measureClarifying,
  measureReaching,
  classifyLanternCondition,
  classifyStationType,
  classifyKeeperGrade,
  classifyStationCondition,
  analyzeLanternLight,
  analyzeLanternStation,
  buildStormLanternResult,
  generateRecommendations,
} from '../src/commands/storm-lantern-helpers.js'
import {
  colorScore,
  colorGrade,
  formatLightTable,
  formatLightsTable,
  formatStationTable,
  formatStationsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/storm-lantern-format-helpers.js'

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

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns 0 for empty content', () => {
    const m = measureIlluminating('')
    expect(m.strength).toBe(0)
    expect(m.grade).toBe('dark')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.strength).toBe(8)
    expect(m.grade).toBe('dark')
    expect(m.hasDocumented).toBe(false)
    expect(m.hasNoUndocumented).toBe(true)
    expect(m.hasNoObscure).toBe(true)
    expect(m.undocumentedCount).toBe(0)
    expect(m.obscureCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureIlluminating(richContent)
    expect(m.strength).toBe(100)
    expect(m.grade).toBe('lighthouse-beam')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasIlluminating).toBe(true)
    expect(m.hasExplained).toBe(true)
    expect(m.hasRevealing).toBe(true)
    expect(m.hasEnlightening).toBe(true)
  })

  it('detects undocumented var usage', () => {
    const m = measureIlluminating('var x = 1')
    expect(m.undocumentedCount).toBe(1)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects obscure any usage', () => {
    const m = measureIlluminating('const x: any = 1')
    expect(m.obscureCount).toBe(1)
    expect(m.hasNoObscure).toBe(false)
  })

  it('detects cryptic eval usage', () => {
    const m = measureIlluminating('eval("1")')
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects hidden debugger usage', () => {
    const m = measureIlluminating('debugger')
    expect(m.hasNoHidden).toBe(false)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns 0 for empty content', () => {
    const m = measureResisting('')
    expect(m.resistance).toBe(0)
    expect(m.wind).toBe('extinguished')
    expect(m.hasHighResistance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureResisting(minimalContent)
    expect(m.resistance).toBe(0)
    expect(m.wind).toBe('extinguished')
    expect(m.hasResilient).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.vulnerableCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBe(100)
    expect(m.wind).toBe('hurricane-proof')
    expect(m.hasHighResistance).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasSturdy).toBe(true)
    expect(m.hasHardened).toBe(true)
    expect(m.hasProtected).toBe(true)
    expect(m.hasGuarded).toBe(true)
    expect(m.hasSafe).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureResisting('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects vulnerable any usage', () => {
    const m = measureResisting('const x: any = 1')
    expect(m.vulnerableCount).toBe(1)
    expect(m.hasNoVulnerable).toBe(false)
  })

  it('detects exposed eval usage', () => {
    const m = measureResisting('eval("1")')
    expect(m.hasNoExposed).toBe(false)
  })

  it('detects unguarded debugger usage', () => {
    const m = measureResisting('debugger')
    expect(m.hasNoUnguarded).toBe(false)
  })
})

// ─── measureOptimizing ─────────────────────────────────────────────

describe('measureOptimizing', () => {
  it('returns 0 for empty content', () => {
    const m = measureOptimizing('')
    expect(m.efficiency).toBe(0)
    expect(m.fuel).toBe('empty-tank')
    expect(m.hasHighEfficiency).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureOptimizing(minimalContent)
    expect(m.efficiency).toBe(8)
    expect(m.fuel).toBe('empty-tank')
    expect(m.hasEfficient).toBe(false)
    expect(m.wastefulCount).toBe(0)
    expect(m.bloatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureOptimizing(richContent)
    expect(m.efficiency).toBe(100)
    expect(m.fuel).toBe('perpetual-flame')
    expect(m.hasHighEfficiency).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasOptimized).toBe(true)
    expect(m.hasLean).toBe(true)
    expect(m.hasEconomical).toBe(true)
    expect(m.hasMinimal).toBe(true)
    expect(m.hasStreamlined).toBe(true)
  })

  it('detects wasteful var usage', () => {
    const m = measureOptimizing('var x = 1')
    expect(m.wastefulCount).toBe(1)
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects bloated any usage', () => {
    const m = measureOptimizing('const x: any = 1')
    expect(m.bloatedCount).toBe(1)
    expect(m.hasNoBloated).toBe(false)
  })

  it('detects excessive eval usage', () => {
    const m = measureOptimizing('eval("1")')
    expect(m.hasNoExcessive).toBe(false)
  })

  it('detects redundant debugger usage', () => {
    const m = measureOptimizing('debugger')
    expect(m.hasNoRedundant).toBe(false)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying('')
    expect(m.clarity).toBe(0)
    expect(m.glass).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(8)
    expect(m.glass).toBe('opaque')
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.hasNoClouded).toBe(true)
    expect(m.opaqueCount).toBe(0)
    expect(m.cloudedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
    expect(m.glass).toBe('crystal-clear')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasOpen).toBe(true)
    expect(m.hasUnobscured).toBe(true)
    expect(m.hasLucid).toBe(true)
  })

  it('detects opaque var usage', () => {
    const m = measureClarifying('var x = 1')
    expect(m.opaqueCount).toBe(1)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects clouded any usage', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.cloudedCount).toBe(1)
    expect(m.hasNoClouded).toBe(false)
  })

  it('detects misty eval usage', () => {
    const m = measureClarifying('eval("1")')
    expect(m.hasNoMisty).toBe(false)
  })

  it('detects blurred debugger usage', () => {
    const m = measureClarifying('debugger')
    expect(m.hasNoBlurred).toBe(false)
  })
})

// ─── measureReaching ───────────────────────────────────────────────

describe('measureReaching', () => {
  it('returns 0 for empty content', () => {
    const m = measureReaching('')
    expect(m.range).toBe(0)
    expect(m.beacon).toBe('no-signal')
    expect(m.hasHighRange).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureReaching(minimalContent)
    expect(m.range).toBe(0)
    expect(m.beacon).toBe('no-signal')
    expect(m.hasImpactful).toBe(false)
    expect(m.narrowCount).toBe(0)
    expect(m.trivialCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureReaching(richContent)
    expect(m.range).toBe(100)
    expect(m.beacon).toBe('lighthouse-range')
    expect(m.hasHighRange).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasBroadReach).toBe(true)
    expect(m.hasSignificant).toBe(true)
    expect(m.hasFarReaching).toBe(true)
    expect(m.hasSubstantial).toBe(true)
    expect(m.hasMeaningful).toBe(true)
  })

  it('detects narrow var usage', () => {
    const m = measureReaching('var x = 1')
    expect(m.narrowCount).toBe(1)
    expect(m.hasNoNarrow).toBe(false)
  })

  it('detects trivial any usage', () => {
    const m = measureReaching('const x: any = 1')
    expect(m.trivialCount).toBe(1)
    expect(m.hasNoTrivial).toBe(false)
  })

  it('detects limited eval usage', () => {
    const m = measureReaching('eval("1")')
    expect(m.hasNoLimited).toBe(false)
  })

  it('detects marginal debugger usage', () => {
    const m = measureReaching('debugger')
    expect(m.hasNoMarginal).toBe(false)
  })
})

// ─── classifyLanternCondition ──────────────────────────────────────

describe('classifyLanternCondition', () => {
  it('classifies eternal-flame for 85+', () => {
    expect(classifyLanternCondition(85)).toBe('eternal-flame')
    expect(classifyLanternCondition(100)).toBe('eternal-flame')
  })

  it('classifies bright-lantern for 70-84', () => {
    expect(classifyLanternCondition(70)).toBe('bright-lantern')
    expect(classifyLanternCondition(84)).toBe('bright-lantern')
  })

  it('classifies proper-light for 55-69', () => {
    expect(classifyLanternCondition(55)).toBe('proper-light')
    expect(classifyLanternCondition(69)).toBe('proper-light')
  })

  it('classifies dying-ember for 40-54', () => {
    expect(classifyLanternCondition(40)).toBe('dying-ember')
    expect(classifyLanternCondition(54)).toBe('dying-ember')
  })

  it('classifies smoking-wick for 25-39', () => {
    expect(classifyLanternCondition(25)).toBe('smoking-wick')
    expect(classifyLanternCondition(39)).toBe('smoking-wick')
  })

  it('classifies darkness for 0-24', () => {
    expect(classifyLanternCondition(0)).toBe('darkness')
    expect(classifyLanternCondition(24)).toBe('darkness')
  })
})

// ─── classifyStationType ───────────────────────────────────────────

describe('classifyStationType', () => {
  it('returns no-light for empty lights', () => {
    expect(classifyStationType([])).toBe('no-light')
  })

  it('classifies lighthouse for high avg + high eternal ratio', () => {
    const lights = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeLanternLight(richContent, `f${i}.ts`),
    }))
    expect(classifyStationType(lights)).toBe('lighthouse')
  })

  it('classifies no-light for low scores', () => {
    const lights = [analyzeLanternLight('', 'a.ts')]
    expect(classifyStationType(lights)).toBe('no-light')
  })

  it('classifies watchtower for mid-high scores', () => {
    const lights = Array.from({ length: 3 }, () => ({
      ...analyzeLanternLight(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'bright-lantern' as const,
    }))
    expect(classifyStationType(lights)).toBe('watchtower')
  })

  it('classifies match-stick for very low scores', () => {
    const lights = Array.from({ length: 3 }, () => ({
      ...analyzeLanternLight(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'darkness' as const,
    }))
    expect(classifyStationType(lights)).toBe('match-stick')
  })
})

// ─── classifyKeeperGrade ───────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('classifies lighthouse-keeper for 80+', () => {
    expect(classifyKeeperGrade(80)).toBe('lighthouse-keeper')
    expect(classifyKeeperGrade(100)).toBe('lighthouse-keeper')
  })

  it('classifies lamp-lighter for 65-79', () => {
    expect(classifyKeeperGrade(65)).toBe('lamp-lighter')
    expect(classifyKeeperGrade(79)).toBe('lamp-lighter')
  })

  it('classifies watchman for 50-64', () => {
    expect(classifyKeeperGrade(50)).toBe('watchman')
    expect(classifyKeeperGrade(64)).toBe('watchman')
  })

  it('classifies candle-maker for 35-49', () => {
    expect(classifyKeeperGrade(35)).toBe('candle-maker')
    expect(classifyKeeperGrade(49)).toBe('candle-maker')
  })

  it('classifies match-girl for 20-34', () => {
    expect(classifyKeeperGrade(20)).toBe('match-girl')
    expect(classifyKeeperGrade(34)).toBe('match-girl')
  })

  it('classifies dark-dweller for 0-19', () => {
    expect(classifyKeeperGrade(0)).toBe('dark-dweller')
    expect(classifyKeeperGrade(19)).toBe('dark-dweller')
  })
})

// ─── classifyStationCondition ──────────────────────────────────────

describe('classifyStationCondition', () => {
  it('classifies blazing-station for 75+', () => {
    expect(classifyStationCondition(75)).toBe('blazing-station')
  })

  it('classifies well-lit for 60-74', () => {
    expect(classifyStationCondition(60)).toBe('well-lit')
  })

  it('classifies decent-light for 45-59', () => {
    expect(classifyStationCondition(45)).toBe('decent-light')
  })

  it('classifies dim-corner for 30-44', () => {
    expect(classifyStationCondition(30)).toBe('dim-corner')
  })

  it('classifies dark-alley for 15-29', () => {
    expect(classifyStationCondition(15)).toBe('dark-alley')
  })

  it('classifies blackout for 0-14', () => {
    expect(classifyStationCondition(0)).toBe('blackout')
  })
})

// ─── analyzeLanternLight ───────────────────────────────────────────

describe('analyzeLanternLight', () => {
  it('analyzes minimal content', () => {
    const light = analyzeLanternLight(minimalContent, 'minimal.ts')
    expect(light.file).toBe('minimal.ts')
    expect(light.illuminationStrength).toBe(8)
    expect(light.windResistance).toBe(0)
    expect(light.fuelEfficiency).toBe(8)
    expect(light.glassClarity).toBe(8)
    expect(light.beaconRange).toBe(0)
    expect(light.qualityScore).toBe(5)
    expect(light.condition).toBe('darkness')
    expect(light.illuminating.grade).toBe('dark')
    expect(light.resisting.wind).toBe('extinguished')
    expect(light.optimizing.fuel).toBe('empty-tank')
    expect(light.clarifying.glass).toBe('opaque')
    expect(light.reaching.beacon).toBe('no-signal')
  })

  it('analyzes rich content', () => {
    const light = analyzeLanternLight(richContent, 'rich.ts')
    expect(light.file).toBe('rich.ts')
    expect(light.illuminationStrength).toBe(100)
    expect(light.windResistance).toBe(100)
    expect(light.fuelEfficiency).toBe(100)
    expect(light.glassClarity).toBe(100)
    expect(light.beaconRange).toBe(100)
    expect(light.qualityScore).toBe(100)
    expect(light.condition).toBe('eternal-flame')
    expect(light.illuminating.grade).toBe('lighthouse-beam')
    expect(light.resisting.wind).toBe('hurricane-proof')
    expect(light.optimizing.fuel).toBe('perpetual-flame')
    expect(light.clarifying.glass).toBe('crystal-clear')
    expect(light.reaching.beacon).toBe('lighthouse-range')
  })

  it('computes qualityScore as weighted average', () => {
    const light = analyzeLanternLight('export const x = 1', 'mid.ts')
    const expected = Math.round(
      light.illuminationStrength * 0.2 +
      light.windResistance * 0.2 +
      light.fuelEfficiency * 0.2 +
      light.glassClarity * 0.2 +
      light.beaconRange * 0.2,
    )
    expect(light.qualityScore).toBe(expected)
  })
})

// ─── analyzeLanternStation ─────────────────────────────────────────

describe('analyzeLanternStation', () => {
  it('returns empty station for empty lights', () => {
    const station = analyzeLanternStation([], 'empty-dir')
    expect(station.directory).toBe('empty-dir')
    expect(station.lights).toHaveLength(0)
    expect(station.avgIllumination).toBe(0)
    expect(station.stationType).toBe('no-light')
    expect(station.condition).toBe('blackout')
  })

  it('analyzes station with rich lights', () => {
    const lights = [
      analyzeLanternLight(richContent, 'dir/a.ts'),
      analyzeLanternLight(richContent, 'dir/b.ts'),
    ]
    const station = analyzeLanternStation(lights, 'dir')
    expect(station.avgIllumination).toBe(100)
    expect(station.eternalFlameCount).toBe(2)
    expect(station.darknessCount).toBe(0)
    expect(station.stationType).toBe('lighthouse')
  })

  it('analyzes station with mixed lights', () => {
    const lights = [
      analyzeLanternLight(richContent, 'dir/a.ts'),
      analyzeLanternLight(minimalContent, 'dir/b.ts'),
    ]
    const station = analyzeLanternStation(lights, 'dir')
    expect(station.eternalFlameCount).toBe(1)
    expect(station.darknessCount).toBe(1)
  })
})

// ─── buildStormLanternResult ───────────────────────────────────────

describe('buildStormLanternResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildStormLanternResult([], [])
    expect(result.lights).toHaveLength(0)
    expect(result.stations).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrightness).toBe(0)
    expect(result.stats.keeperGrade).toBe('dark-dweller')
    expect(result.network.isLit).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildStormLanternResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.lights).toHaveLength(2)
    expect(result.stations).toHaveLength(1)
    expect(result.stats.avgIlluminationStrength).toBe(100)
    expect(result.stats.avgWindResistance).toBe(100)
    expect(result.stats.avgFuelEfficiency).toBe(100)
    expect(result.stats.avgGlassClarity).toBe(100)
    expect(result.stats.avgBeaconRange).toBe(100)
    expect(result.stats.eternalFlameCount).toBe(2)
    expect(result.stats.darknessCount).toBe(0)
    expect(result.stats.hasHighStrengthCount).toBe(2)
    expect(result.stats.hasHighResistanceCount).toBe(2)
    expect(result.stats.hasHighEfficiencyCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighRangeCount).toBe(2)
    expect(result.stats.overallBrightness).toBe(100)
    expect(result.stats.keeperGrade).toBe('lighthouse-keeper')
    expect(result.network.isLit).toBe(true)
    expect(result.stats.bestLight).toBeTruthy()
    expect(result.stats.brightest).toBeTruthy()
    expect(result.stats.mostResistant).toBeTruthy()
    expect(result.stats.mostEfficient).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildStormLanternResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.stations).toHaveLength(2)
    const dirs = result.stations.map(s => s.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall brightness correctly', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    expect(result.network.overallBrightness).toBe(Math.round((8 + 0 + 8) / 3))
  })

  it('sets isLit when avgIllumination >= 60', async () => {
    const result = await buildStormLanternResult(['a.ts'], [richContent])
    expect(result.network.isLit).toBe(true)
  })

  it('sets isLit false when avgIllumination < 60', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    expect(result.network.isLit).toBe(false)
  })

  it('picks best light by qualityScore', async () => {
    const result = await buildStormLanternResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestLight).toBe('high.ts')
    expect(result.stats.brightest).toBe('high.ts')
    expect(result.stats.mostResistant).toBe('high.ts')
    expect(result.stats.mostEfficient).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildStormLanternResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.eternalFlameCount).toBe(1)
    expect(result.stats.darknessCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildStormLanternResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your lantern network is blazing bright! Every light guides the way perfectly',
    ])
  })

  it('recommends improving illumination when low', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('illumination strength'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving wind resistance when low', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('wind resistance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving fuel efficiency when low', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('fuel efficiency'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving glass clarity when low', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('glass clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving beacon range when low', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('beacon range'))
    expect(rec).toBeTruthy()
  })

  it('warns about darkness files', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('darkness'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall brightness', async () => {
    const result = await buildStormLanternResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall lantern brightness'))
    expect(rec).toBeTruthy()
  })

  it('lists specific dark files', async () => {
    const result = await buildStormLanternResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Relight'))
    expect(rec).toBeTruthy()
  })

  it('warns when all stations are match sticks/no-light', async () => {
    const result = await buildStormLanternResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('match sticks or dark'))
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
  it('returns a string for eternal-flame', () => {
    expect(typeof colorGrade('eternal-flame')).toBe('string')
  })

  it('returns a string for darkness', () => {
    expect(typeof colorGrade('darkness')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatLightTable', () => {
  it('formats a light', () => {
    const light = analyzeLanternLight(richContent, 'test.ts')
    const output = formatLightTable(light)
    expect(output).toContain('test.ts')
    expect(output).toContain('Illumination')
    expect(output).toContain('Wind Resistance')
    expect(output).toContain('Fuel Efficiency')
    expect(output).toContain('Glass Clarity')
    expect(output).toContain('Beacon Range')
  })
})

describe('formatLightsTable', () => {
  it('handles empty lights', () => {
    const output = formatLightsTable([])
    expect(output).toContain('No lantern lights')
  })

  it('formats multiple lights', () => {
    const lights = [
      analyzeLanternLight(richContent, 'a.ts'),
      analyzeLanternLight(minimalContent, 'b.ts'),
    ]
    const output = formatLightsTable(lights)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatStationTable', () => {
  it('formats a station', () => {
    const lights = [analyzeLanternLight(richContent, 'dir/a.ts')]
    const station = analyzeLanternStation(lights, 'dir')
    const output = formatStationTable(station)
    expect(output).toContain('dir')
    expect(output).toContain('Station')
  })
})

describe('formatStationsTable', () => {
  it('handles empty stations', () => {
    const output = formatStationsTable([])
    expect(output).toContain('No lantern stations')
  })

  it('formats multiple stations', () => {
    const lights = [analyzeLanternLight(richContent, 'src/a.ts')]
    const stations = [analyzeLanternStation(lights, 'src')]
    const output = formatStationsTable(stations)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildStormLanternResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Storm Lantern Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Keeper Grade')
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
    const result = await buildStormLanternResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Storm Lantern Analysis')
    expect(output).toContain('Lantern Station Analysis')
    expect(output).toContain('Storm Lantern Statistics')
    expect(output).toContain('Network')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildStormLanternResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.lights).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.network.isLit).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const light = analyzeLanternLight('   \n\t  ', 'blank.ts')
    expect(light.illuminationStrength).toBe(0)
    expect(light.qualityScore).toBe(0)
    expect(light.condition).toBe('darkness')
  })

  it('handles content with only comments', () => {
    const light = analyzeLanternLight('// just a comment\n/* block */', 'comment.ts')
    expect(light.illuminationStrength).toBe(0)
    expect(light.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildStormLanternResult(['big.ts'], [longContent])
    expect(result.lights).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildStormLanternResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.eternalFlameCount).toBe(50)
  })

  it('handles single file station', async () => {
    const result = await buildStormLanternResult(['single.ts'], [richContent])
    expect(result.stations).toHaveLength(1)
    expect(result.stations[0]!.lights).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const light = analyzeLanternLight(richContent, 'cap.ts')
    expect(light.qualityScore).toBeLessThanOrEqual(100)
    expect(light.illuminationStrength).toBeLessThanOrEqual(100)
    expect(light.windResistance).toBeLessThanOrEqual(100)
    expect(light.fuelEfficiency).toBeLessThanOrEqual(100)
    expect(light.glassClarity).toBeLessThanOrEqual(100)
    expect(light.beaconRange).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildStormLanternResult([], [])
    const r2 = await buildStormLanternResult(['a.ts'], [richContent])
    const r3 = await buildStormLanternResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
