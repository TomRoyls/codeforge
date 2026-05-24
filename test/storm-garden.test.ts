import { describe, it, expect } from 'vitest'
import {
  measureWeathering,
  measureGrowing,
  measureAdapting,
  measureHolding,
  measureRecovering,
  classifyBloomCondition,
  classifyPlotType,
  classifyPlotCondition,
  classifyGardenerGrade,
  analyzeStormBloom,
  analyzeStormPlot,
  buildStormGardenResult,
  generateRecommendations,
} from '../src/commands/storm-garden-helpers.js'
import {
  colorScore,
  colorGrade,
  formatBloomTable,
  formatBloomsTable,
  formatPlotTable,
  formatPlotsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/storm-garden-format-helpers.js'
import type {
  StormBloom,
  StormGardenStats,
  StormGardenResult,
  GardenSummary,
} from '../src/commands/storm-garden-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const emptyContent = ''

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  readonly role: UserRole
  nickname?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'
export type Maybe<T> = T | null

/**
 * Create a new user with validation
 */
export async function createUser(input: string): Promise<UserConfig> {
  const config: Config = JSON.parse(input)
  if (config.name === undefined || config.name === null) {
    throw new Error('Name required')
  }
  try {
    const result = await validateConfig(config)
    return result ?? defaultValue()
  } catch (error) {
    return handleDefault(config)
  }
}

export function handleDefault(config: Config): UserConfig {
  return config ?? { name: 'default', age: 0, role: 'user' }
}

export function defaultValue(): UserConfig {
  return { name: 'default', age: 0, role: 'user' }
}

enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

switch (status) {
  case Status.Active:
    break
  case Status.Inactive:
    break
  default:
    break
}

const filtered = users.filter(u => u.age > 18).map(u => u.name)
const total = users.reduce((sum, u) => sum + u.age, 0)
`

const poorContent = `var x = 1; var y = 2; any; eval("test"); debugger;`

// ─── measureWeathering ────────────────────────────────────────────

describe('measureWeathering', () => {
  it('returns 0 resilience for empty content', () => {
    const m = measureWeathering(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.grade).toBe('washed-away')
    expect(m.hasHighResilience).toBe(false)
  })

  it('returns low resilience for minimal content', () => {
    const m = measureWeathering(minimalContent)
    expect(m.resilience).toBeGreaterThan(0)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasNoTrusting).toBe(true)
  })

  it('detects error handling in rich content', () => {
    const m = measureWeathering(richContent)
    expect(m.hasErrorHandling).toBe(true)
    expect(m.hasExceptionRecovery).toBe(true)
    expect(m.hasDefensiveCode).toBe(true)
  })

  it('detects bare crashes in poor content', () => {
    const m = measureWeathering(poorContent)
    expect(m.bareCrashCount).toBeGreaterThan(0)
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.trustingCount).toBeGreaterThan(0)
    expect(m.hasNoTrusting).toBe(false)
  })

  it('detects boundary guards in rich content', () => {
    const m = measureWeathering(richContent)
    expect(m.hasBoundaryGuards).toBe(true)
    expect(m.hasFaultTolerant).toBe(true)
    expect(m.hasInputValidation).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureWeathering(richContent).grade).not.toBe('washed-away')
    expect(measureWeathering(emptyContent).grade).toBe('washed-away')
  })
})

// ─── measureGrowing ───────────────────────────────────────────────

describe('measureGrowing', () => {
  it('returns 0 vitality for empty content', () => {
    const m = measureGrowing(emptyContent)
    expect(m.vitality).toBe(0)
    expect(m.growth).toBe('no-growth')
    expect(m.hasHighVitality).toBe(false)
  })

  it('detects extensible patterns in rich content', () => {
    const m = measureGrowing(richContent)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasScalable).toBe(true)
    expect(m.hasRefactorable).toBe(true)
  })

  it('detects evolving patterns in rich content', () => {
    const m = measureGrowing(richContent)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasSustainable).toBe(true)
  })

  it('detects rigid code in poor content', () => {
    const m = measureGrowing(poorContent)
    expect(m.rigidCount).toBeGreaterThan(0)
    expect(m.hasNoRigid).toBe(false)
    expect(m.entangledCount).toBeGreaterThan(0)
    expect(m.hasNoEntangled).toBe(false)
  })

  it('classifies growth correctly', () => {
    expect(measureGrowing(emptyContent).growth).toBe('no-growth')
    expect(measureGrowing(richContent).growth).not.toBe('no-growth')
  })

  it('detects adaptable patterns', () => {
    const m = measureGrowing(richContent)
    expect(m.hasAdaptable).toBe(true)
  })
})

// ─── measureAdapting ──────────────────────────────────────────────

describe('measureAdapting', () => {
  it('returns 0 adaptation for empty content', () => {
    const m = measureAdapting(emptyContent)
    expect(m.adaptation).toBe(0)
    expect(m.storm).toBe('uprooted')
    expect(m.hasHighAdaptation).toBe(false)
  })

  it('detects configurable patterns in rich content', () => {
    const m = measureAdapting(richContent)
    expect(m.hasConfigurable).toBe(true)
    expect(m.hasParameterized).toBe(true)
  })

  it('detects dynamic patterns in rich content', () => {
    const m = measureAdapting(richContent)
    expect(m.hasDynamic).toBe(true)
    expect(m.hasPluggable).toBe(true)
  })

  it('detects responsive patterns in rich content', () => {
    const m = measureAdapting(richContent)
    expect(m.hasResponsive).toBe(true)
    expect(m.hasFlexible).toBe(true)
  })

  it('detects hardcoded values in poor content', () => {
    const m = measureAdapting(poorContent)
    expect(m.hardcodedCount).toBeGreaterThan(0)
    expect(m.hasNoHardcoded).toBe(false)
    expect(m.fixedCount).toBeGreaterThan(0)
    expect(m.hasNoFixed).toBe(false)
  })

  it('classifies storm correctly', () => {
    expect(measureAdapting(emptyContent).storm).toBe('uprooted')
    expect(measureAdapting(richContent).storm).not.toBe('uprooted')
  })
})

// ─── measureHolding ───────────────────────────────────────────────

describe('measureHolding', () => {
  it('returns 0 tenacity for empty content', () => {
    const m = measureHolding(emptyContent)
    expect(m.tenacity).toBe(0)
    expect(m.root).toBe('no-roots')
    expect(m.hasHighTenacity).toBe(false)
  })

  it('detects tested patterns in rich content', () => {
    const m = measureHolding(richContent)
    expect(m.hasTested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
  })

  it('detects well structured patterns in rich content', () => {
    const m = measureHolding(richContent)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasSolidBase).toBe(true)
    expect(m.hasVerified).toBe(true)
  })

  it('detects untested code in poor content', () => {
    const m = measureHolding(poorContent)
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
    expect(m.unsafeCount).toBeGreaterThan(0)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('classifies root correctly', () => {
    expect(measureHolding(emptyContent).root).toBe('no-roots')
    expect(measureHolding(richContent).root).not.toBe('no-roots')
  })

  it('detects unsafe code', () => {
    const m = measureHolding(poorContent)
    expect(m.hasNoUnverified).toBe(false)
  })
})

// ─── measureRecovering ────────────────────────────────────────────

describe('measureRecovering', () => {
  it('returns 0 recovery for empty content', () => {
    const m = measureRecovering(emptyContent)
    expect(m.recovery).toBe(0)
    expect(m.bloom).toBe('no-recovery')
    expect(m.hasHighRecovery).toBe(false)
  })

  it('detects retry logic in rich content', () => {
    const m = measureRecovering(richContent)
    expect(m.hasRetryLogic).toBe(true)
    expect(m.hasFallbackPaths).toBe(true)
  })

  it('detects self healing in rich content', () => {
    const m = measureRecovering(richContent)
    expect(m.hasSelfHealing).toBe(true)
    expect(m.hasGracefulDegradation).toBe(true)
  })

  it('detects rollback patterns in rich content', () => {
    const m = measureRecovering(richContent)
    expect(m.hasRollback).toBe(true)
    expect(m.hasResilient).toBe(true)
  })

  it('detects single fail points in poor content', () => {
    const m = measureRecovering(poorContent)
    expect(m.singleFailCount).toBeGreaterThan(0)
    expect(m.hasNoSingleFail).toBe(false)
    expect(m.degradedCount).toBeGreaterThan(0)
    expect(m.hasNoDegraded).toBe(false)
  })

  it('classifies bloom correctly', () => {
    expect(measureRecovering(emptyContent).bloom).toBe('no-recovery')
    expect(measureRecovering(richContent).bloom).not.toBe('no-recovery')
  })
})

// ─── classifyBloomCondition ───────────────────────────────────────

describe('classifyBloomCondition', () => {
  it('classifies evergreen-paradise', () => {
    expect(classifyBloomCondition(90)).toBe('evergreen-paradise')
    expect(classifyBloomCondition(85)).toBe('evergreen-paradise')
  })

  it('classifies blooming-garden', () => {
    expect(classifyBloomCondition(75)).toBe('blooming-garden')
    expect(classifyBloomCondition(70)).toBe('blooming-garden')
  })

  it('classifies proper-garden', () => {
    expect(classifyBloomCondition(60)).toBe('proper-garden')
    expect(classifyBloomCondition(55)).toBe('proper-garden')
  })

  it('classifies struggling-patch', () => {
    expect(classifyBloomCondition(45)).toBe('struggling-patch')
    expect(classifyBloomCondition(40)).toBe('struggling-patch')
  })

  it('classifies withered-bed', () => {
    expect(classifyBloomCondition(30)).toBe('withered-bed')
    expect(classifyBloomCondition(25)).toBe('withered-bed')
  })

  it('classifies barren-earth', () => {
    expect(classifyBloomCondition(15)).toBe('barren-earth')
    expect(classifyBloomCondition(0)).toBe('barren-earth')
  })
})

// ─── classifyPlotType ─────────────────────────────────────────────

describe('classifyPlotType', () => {
  it('returns no-plot for empty blooms', () => {
    expect(classifyPlotType([])).toBe('no-plot')
  })

  it('returns botanical-garden for high quality blooms', () => {
    const blooms: StormBloom[] = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`, weatheringResilience: 90, growthVitality: 90,
      stormAdaptation: 90, rootTenacity: 90, bloomRecovery: 90,
      weathering: {} as any, growing: {} as any, adapting: {} as any,
      holding: {} as any, recovering: {} as any,
      condition: 'evergreen-paradise', qualityScore: 90,
    }))
    expect(classifyPlotType(blooms)).toBe('botanical-garden')
  })

  it('returns no-plot for low quality blooms', () => {
    const blooms: StormBloom[] = Array.from({ length: 3 }, (_, i) => ({
      file: `f${i}.ts`, weatheringResilience: 5, growthVitality: 5,
      stormAdaptation: 5, rootTenacity: 5, bloomRecovery: 5,
      weathering: {} as any, growing: {} as any, adapting: {} as any,
      holding: {} as any, recovering: {} as any,
      condition: 'barren-earth', qualityScore: 5,
    }))
    expect(classifyPlotType(blooms)).toBe('no-plot')
  })
})

// ─── classifyPlotCondition ────────────────────────────────────────

describe('classifyPlotCondition', () => {
  it('classifies lush-paradise', () => {
    expect(classifyPlotCondition(80)).toBe('lush-paradise')
  })

  it('classifies thriving-garden', () => {
    expect(classifyPlotCondition(65)).toBe('thriving-garden')
  })

  it('classifies decent-plot', () => {
    expect(classifyPlotCondition(50)).toBe('decent-plot')
  })

  it('classifies struggling-bed', () => {
    expect(classifyPlotCondition(35)).toBe('struggling-bed')
  })

  it('classifies barren-ground', () => {
    expect(classifyPlotCondition(20)).toBe('barren-ground')
  })

  it('classifies void', () => {
    expect(classifyPlotCondition(5)).toBe('void')
  })
})

// ─── classifyGardenerGrade ────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('classifies master-horticulturist', () => {
    expect(classifyGardenerGrade(85)).toBe('master-horticulturist')
    expect(classifyGardenerGrade(80)).toBe('master-horticulturist')
  })

  it('classifies expert-gardener', () => {
    expect(classifyGardenerGrade(70)).toBe('expert-gardener')
    expect(classifyGardenerGrade(65)).toBe('expert-gardener')
  })

  it('classifies skilled-cultivator', () => {
    expect(classifyGardenerGrade(55)).toBe('skilled-cultivator')
    expect(classifyGardenerGrade(50)).toBe('skilled-cultivator')
  })

  it('classifies apprentice', () => {
    expect(classifyGardenerGrade(40)).toBe('apprentice')
    expect(classifyGardenerGrade(35)).toBe('apprentice')
  })

  it('classifies novice', () => {
    expect(classifyGardenerGrade(25)).toBe('novice')
    expect(classifyGardenerGrade(20)).toBe('novice')
  })

  it('classifies black-thumb', () => {
    expect(classifyGardenerGrade(10)).toBe('black-thumb')
    expect(classifyGardenerGrade(0)).toBe('black-thumb')
  })
})

// ─── analyzeStormBloom ────────────────────────────────────────────

describe('analyzeStormBloom', () => {
  it('returns a complete bloom object', () => {
    const b = analyzeStormBloom(moderateContent, 'test.ts')
    expect(b.file).toBe('test.ts')
    expect(b.weatheringResilience).toBeGreaterThan(0)
    expect(b.growthVitality).toBeGreaterThan(0)
    expect(b.stormAdaptation).toBeGreaterThanOrEqual(0)
    expect(b.rootTenacity).toBeGreaterThan(0)
    expect(b.bloomRecovery).toBeGreaterThanOrEqual(0)
    expect(b.qualityScore).toBeGreaterThan(0)
    expect(b.condition).toBeDefined()
  })

  it('includes all measure objects', () => {
    const b = analyzeStormBloom(richContent, 'rich.ts')
    expect(b.weathering).toBeDefined()
    expect(b.growing).toBeDefined()
    expect(b.adapting).toBeDefined()
    expect(b.holding).toBeDefined()
    expect(b.recovering).toBeDefined()
  })

  it('handles empty content', () => {
    const b = analyzeStormBloom(emptyContent, 'empty.ts')
    expect(b.qualityScore).toBe(0)
    expect(b.condition).toBe('barren-earth')
  })

  it('computes quality score as average of 5 measures', () => {
    const b = analyzeStormBloom(richContent, 'rich.ts')
    const expected = Math.round(
      b.weatheringResilience * 0.2 +
      b.growthVitality * 0.2 +
      b.stormAdaptation * 0.2 +
      b.rootTenacity * 0.2 +
      b.bloomRecovery * 0.2,
    )
    expect(b.qualityScore).toBe(expected)
  })
})

// ─── analyzeStormPlot ─────────────────────────────────────────────

describe('analyzeStormPlot', () => {
  it('returns empty plot for no blooms', () => {
    const p = analyzeStormPlot([], 'empty-dir')
    expect(p.directory).toBe('empty-dir')
    expect(p.blooms).toEqual([])
    expect(p.avgResilience).toBe(0)
    expect(p.plotType).toBe('no-plot')
    expect(p.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const b1 = analyzeStormBloom(richContent, 'rich.ts')
    const b2 = analyzeStormBloom(moderateContent, 'mod.ts')
    const p = analyzeStormPlot([b1, b2], 'src')
    expect(p.avgResilience).toBe(Math.round((b1.weatheringResilience + b2.weatheringResilience) / 2))
    expect(p.avgVitality).toBe(Math.round((b1.growthVitality + b2.growthVitality) / 2))
    expect(p.avgRecovery).toBe(Math.round((b1.bloomRecovery + b2.bloomRecovery) / 2))
  })

  it('counts evergreen paradise and barren earth', () => {
    const b1 = analyzeStormBloom(richContent, 'rich.ts')
    const b2 = analyzeStormBloom(emptyContent, 'empty.ts')
    const p = analyzeStormPlot([b1, b2], 'mixed')
    expect(p.evergreenParadiseCount + p.barrenEarthCount).toBeLessThanOrEqual(2)
  })

  it('classifies plot type based on blooms', () => {
    const p = analyzeStormPlot([analyzeStormBloom(richContent, 'r.ts')], 'src')
    expect(p.plotType).not.toBe('no-plot')
  })
})

// ─── buildStormGardenResult ───────────────────────────────────────

describe('buildStormGardenResult', () => {
  it('returns a complete result for multiple files', async () => {
    const result = await buildStormGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.blooms).toHaveLength(2)
    expect(result.plots).toHaveLength(1)
    expect(result.garden).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildStormGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.plots).toHaveLength(0)
    expect(result.garden.overallVerdure).toBe(0)
    expect(result.garden.isThriving).toBe(false)
    expect(result.stats.gardenerGrade).toBe('black-thumb')
  })

  it('computes garden summary correctly', async () => {
    const result = await buildStormGardenResult(
      ['rich.ts', 'mod.ts'],
      [richContent, moderateContent],
    )
    expect(result.garden.avgResilience).toBeGreaterThan(0)
    expect(result.garden.avgVitality).toBeGreaterThan(0)
    expect(result.garden.avgRecovery).toBeGreaterThan(0)
    expect(result.garden.overallVerdure).toBeGreaterThan(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildStormGardenResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalPlots).toBe(1)
    expect(result.stats.bestBloom).toBeDefined()
    expect(result.stats.mostResilient).toBeDefined()
    expect(result.stats.mostVital).toBeDefined()
    expect(result.stats.mostAdaptive).toBeDefined()
    expect(result.stats.bestRecovery).toBeDefined()
  })

  it('groups blooms by directory', async () => {
    const result = await buildStormGardenResult(
      ['src/a.ts', 'test/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.plots).toHaveLength(2)
  })

  it('tracks high count metrics', async () => {
    const result = await buildStormGardenResult(
      ['rich.ts'],
      [richContent],
    )
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighAdaptationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighTenacityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRecoveryCount).toBeGreaterThanOrEqual(0)
  })

  it('tracks condition counts', async () => {
    const result = await buildStormGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.evergreenParadiseCount + result.stats.bloomingGardenCount +
      result.stats.properGardenCount + result.stats.strugglingPatchCount +
      result.stats.witheredBedCount + result.stats.barrenEarthCount).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for high quality', () => {
    const blooms = [analyzeStormBloom(richContent, 'r.ts')]
    const plots = [analyzeStormPlot(blooms, 'src')]
    const garden: GardenSummary = {
      avgResilience: 90, avgVitality: 90, avgRecovery: 90,
      isThriving: true, overallVerdure: 90,
    }
    const stats: Partial<StormGardenStats> = {
      avgWeatheringResilience: 90, avgGrowthVitality: 90, avgStormAdaptation: 90,
      avgRootTenacity: 90, avgBloomRecovery: 90, barrenEarthCount: 0,
      overallVerdure: 90,
    }
    const recs = generateRecommendations(blooms, plots, garden, stats as StormGardenStats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('master horticulturist')
  })

  it('returns low resilience recommendation', () => {
    const stats: Partial<StormGardenStats> = {
      avgWeatheringResilience: 30, avgGrowthVitality: 60, avgStormAdaptation: 60,
      avgRootTenacity: 60, avgBloomRecovery: 60, barrenEarthCount: 0,
      overallVerdure: 60,
    }
    const recs = generateRecommendations([], [], { avgResilience: 30, avgVitality: 60, avgRecovery: 60, isThriving: false, overallVerdure: 60 }, stats as StormGardenStats)
    expect(recs.some(r => r.includes('weathering resilience'))).toBe(true)
  })

  it('returns barren earth recommendation', () => {
    const stats: Partial<StormGardenStats> = {
      avgWeatheringResilience: 70, avgGrowthVitality: 70, avgStormAdaptation: 70,
      avgRootTenacity: 70, avgBloomRecovery: 70, barrenEarthCount: 2,
      overallVerdure: 70,
    }
    const recs = generateRecommendations([], [], { avgResilience: 70, avgVitality: 70, avgRecovery: 70, isThriving: true, overallVerdure: 70 }, stats as StormGardenStats)
    expect(recs.some(r => r.includes('barren earth'))).toBe(true)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('evergreen-paradise')).toBe('string')
    expect(typeof colorGrade('barren-earth')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatBloomTable', () => {
  it('formats a single bloom', () => {
    const b = analyzeStormBloom(richContent, 'test.ts')
    const output = formatBloomTable(b)
    expect(output).toContain('test.ts')
    expect(output).toContain('Weathering Resilience')
    expect(output).toContain('Growth Vitality')
    expect(output).toContain('Score')
  })
})

describe('formatBloomsTable', () => {
  it('formats empty blooms', () => {
    const output = formatBloomsTable([])
    expect(output).toContain('No storm blooms')
  })

  it('formats multiple blooms', () => {
    const blooms = [
      analyzeStormBloom(richContent, 'a.ts'),
      analyzeStormBloom(moderateContent, 'b.ts'),
    ]
    const output = formatBloomsTable(blooms)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatPlotTable', () => {
  it('formats a plot', () => {
    const blooms = [analyzeStormBloom(richContent, 'a.ts')]
    const plot = analyzeStormPlot(blooms, 'src')
    const output = formatPlotTable(plot)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Evergreen Paradise')
  })
})

describe('formatPlotsTable', () => {
  it('formats empty plots', () => {
    const output = formatPlotsTable([])
    expect(output).toContain('No storm plots')
  })

  it('formats multiple plots', () => {
    const p1 = analyzeStormPlot([analyzeStormBloom(richContent, 'a.ts')], 'src')
    const p2 = analyzeStormPlot([analyzeStormBloom(moderateContent, 'b.ts')], 'test')
    const output = formatPlotsTable([p1, p2])
    expect(output).toContain('src')
    expect(output).toContain('test')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildStormGardenResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Verdure')
    expect(output).toContain('Gardener Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Improve resilience', 'Fix growth'])
    expect(output).toContain('Improve resilience')
    expect(output).toContain('Fix growth')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildStormGardenResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Storm Garden Analysis')
    expect(output).toContain('Storm Plots')
    expect(output).toContain('Storm Garden Statistics')
    expect(output).toContain('Garden')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildStormGardenResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blooms).toHaveLength(1)
    expect(parsed.garden).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('handles diverse file set', async () => {
    const result = await buildStormGardenResult(
      ['rich.ts', 'mod.ts', 'empty.ts', 'poor.ts'],
      [richContent, moderateContent, emptyContent, poorContent],
    )
    expect(result.blooms).toHaveLength(4)
    expect(result.stats.totalFiles).toBe(4)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('produces consistent results for same input', async () => {
    const r1 = await buildStormGardenResult(['a.ts'], [richContent])
    const r2 = await buildStormGardenResult(['a.ts'], [richContent])
    expect(r1.stats.overallVerdure).toBe(r2.stats.overallVerdure)
    expect(r1.stats.gardenerGrade).toBe(r2.stats.gardenerGrade)
  })

  it('bloom scores are within 0-100 range', async () => {
    const result = await buildStormGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    for (const b of result.blooms) {
      expect(b.weatheringResilience).toBeGreaterThanOrEqual(0)
      expect(b.weatheringResilience).toBeLessThanOrEqual(100)
      expect(b.growthVitality).toBeGreaterThanOrEqual(0)
      expect(b.growthVitality).toBeLessThanOrEqual(100)
      expect(b.stormAdaptation).toBeGreaterThanOrEqual(0)
      expect(b.stormAdaptation).toBeLessThanOrEqual(100)
      expect(b.rootTenacity).toBeGreaterThanOrEqual(0)
      expect(b.rootTenacity).toBeLessThanOrEqual(100)
      expect(b.bloomRecovery).toBeGreaterThanOrEqual(0)
      expect(b.bloomRecovery).toBeLessThanOrEqual(100)
      expect(b.qualityScore).toBeGreaterThanOrEqual(0)
      expect(b.qualityScore).toBeLessThanOrEqual(100)
    }
  })
})
