import { describe, it, expect } from 'vitest'
import {
  measureSurging,
  measureRecovering,
  measureConcentrating,
  measurePrecisioning,
  measureRemembering,
  classifyWaveCondition,
  classifyShoreType,
  classifyShoreCondition,
  classifyNavigatorGrade,
  analyzeCrimsonWave,
  analyzeTideShore,
  buildCrimsonTideResult,
  generateRecommendations,
} from '../src/commands/crimson-tide-helpers.js'
import {
  colorScore,
  colorGrade,
  formatWaveTable,
  formatWavesTable,
  formatShoreTable,
  formatShoresTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/crimson-tide-format-helpers.js'
import type { CrimsonWave, CrimsonTideStats, CrimsonSea } from '../src/commands/crimson-tide-helpers.js'

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

class Validator {
  private data: unknown
  constructor(input: unknown) {
    this.data = input
  }
}

switch (status) {
  case Status.Active:
    users.map(u => u.name)
    users.filter(u => u.age > 18).forEach(u => console.log(u))
    break
  default:
    break
}
`

// ─── measureSurging ────────────────────────────────────────────────

describe('measureSurging', () => {
  it('returns no-surge for empty content', () => {
    const m = measureSurging(emptyContent)
    expect(m.power).toBe(0)
    expect(m.grade).toBe('no-surge')
    expect(m.hasHighPower).toBe(false)
    expect(m.sluggishCount).toBe(0)
    expect(m.unoptimizedCount).toBe(0)
  })

  it('returns tidal-wave for rich content', () => {
    const m = measureSurging(richContent)
    expect(m.power).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('tidal-wave')
    expect(m.hasHighPower).toBe(true)
    expect(m.hasPerformant).toBe(true)
    expect(m.hasPowerful).toBe(true)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.hasOptimized).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasPeakCapable).toBe(true)
    expect(m.hasStrong).toBe(true)
  })

  it('counts sluggish patterns (var)', () => {
    const m = measureSurging('var x = 1; var y = 2;')
    expect(m.sluggishCount).toBe(2)
    expect(m.hasNoSluggish).toBe(false)
  })

  it('counts unoptimized patterns (any)', () => {
    const m = measureSurging('const x: any = 1;')
    expect(m.unoptimizedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUnoptimized).toBe(false)
  })

  it('detects eval as hasNoWasteful violation', () => {
    const m = measureSurging("eval('x')")
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects debugger as hasNoBottlenecked violation', () => {
    const m = measureSurging('debugger')
    expect(m.hasNoBottlenecked).toBe(false)
  })

  it('returns higher power for moderate content', () => {
    const m = measureSurging(moderateContent)
    expect(m.power).toBeGreaterThan(0)
  })
})

// ─── measureRecovering ─────────────────────────────────────────────

describe('measureRecovering', () => {
  it('returns no-recovery for empty content', () => {
    const m = measureRecovering(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.ebb).toBe('no-recovery')
    expect(m.hasHighResilience).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.hardCrashCount).toBe(0)
  })

  it('returns perpetual-return for rich content', () => {
    const m = measureRecovering(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(85)
    expect(m.ebb).toBe('perpetual-return')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorRecovery).toBe(true)
    expect(m.hasRetryLogic).toBe(true)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasGracefulDegradation).toBe(true)
    expect(m.hasFallbackPaths).toBe(true)
    expect(m.hasSelfHealing).toBe(true)
    expect(m.hasResilient).toBe(true)
  })

  it('counts bare crash patterns (var)', () => {
    const m = measureRecovering('var x = 1; var y = 2;')
    expect(m.bareCrashCount).toBe(2)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('counts hard crash patterns (any)', () => {
    const m = measureRecovering('const x: any = 1;')
    expect(m.hardCrashCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoHardCrash).toBe(false)
  })

  it('detects eval as hasNoDeadEnd violation', () => {
    const m = measureRecovering("eval('x')")
    expect(m.hasNoDeadEnd).toBe(false)
  })

  it('detects debugger as hasNoDegradedState violation', () => {
    const m = measureRecovering('debugger')
    expect(m.hasNoDegradedState).toBe(false)
  })
})

// ─── measureConcentrating ──────────────────────────────────────────

describe('measureConcentrating', () => {
  it('returns no-depth for empty content', () => {
    const m = measureConcentrating(emptyContent)
    expect(m.intensity).toBe(0)
    expect(m.depth).toBe('no-depth')
    expect(m.hasHighIntensity).toBe(false)
    expect(m.fillerCount).toBe(0)
    expect(m.scatteredCount).toBe(0)
  })

  it('returns concentrated-essence for rich content', () => {
    const m = measureConcentrating(richContent)
    expect(m.intensity).toBeGreaterThanOrEqual(85)
    expect(m.depth).toBe('concentrated-essence')
    expect(m.hasHighIntensity).toBe(true)
    expect(m.hasHighValue).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasNoFiller).toBe(true)
    expect(m.hasConcentrated).toBe(true)
    expect(m.hasFocused).toBe(true)
    expect(m.hasValuable).toBe(true)
    expect(m.hasDense).toBe(true)
  })

  it('counts filler patterns (var)', () => {
    const m = measureConcentrating('var x = 1; var y = 2;')
    expect(m.fillerCount).toBe(2)
    expect(m.hasNoFiller).toBe(false)
  })

  it('counts scattered patterns (any)', () => {
    const m = measureConcentrating('const x: any = 1;')
    expect(m.scatteredCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoScattered).toBe(false)
  })

  it('detects eval as hasNoDistracted violation', () => {
    const m = measureConcentrating("eval('x')")
    expect(m.hasNoDistracted).toBe(false)
  })

  it('detects debugger as hasNoBoilerplate violation', () => {
    const m = measureConcentrating('debugger')
    expect(m.hasNoBoilerplate).toBe(false)
  })
})

// ─── measurePrecisioning ───────────────────────────────────────────

describe('measurePrecisioning', () => {
  it('returns no-precision for empty content', () => {
    const m = measurePrecisioning(emptyContent)
    expect(m.precision).toBe(0)
    expect(m.wave).toBe('no-precision')
    expect(m.hasHighPrecision).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.vagueCount).toBe(0)
  })

  it('returns surgical-strike for rich content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(85)
    expect(m.wave).toBe('surgical-strike')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasDefined).toBe(true)
  })

  it('counts approximate patterns (var)', () => {
    const m = measurePrecisioning('var x = 1; var y = 2;')
    expect(m.approximateCount).toBe(2)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('counts vague patterns (any)', () => {
    const m = measurePrecisioning('const x: any = 1;')
    expect(m.vagueCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoVague).toBe(false)
  })

  it('detects eval as hasNoAlmostRight violation', () => {
    const m = measurePrecisioning("eval('x')")
    expect(m.hasNoAlmostRight).toBe(false)
  })

  it('detects debugger as hasNoSloppy violation', () => {
    const m = measurePrecisioning('debugger')
    expect(m.hasNoSloppy).toBe(false)
  })
})

// ─── measureRemembering ────────────────────────────────────────────

describe('measureRemembering', () => {
  it('returns no-memory for empty content', () => {
    const m = measureRemembering(emptyContent)
    expect(m.memory).toBe(0)
    expect(m.ocean).toBe('no-memory')
    expect(m.hasHighMemory).toBe(false)
    expect(m.mutableCount).toBe(0)
    expect(m.leakedCount).toBe(0)
  })

  it('returns elephant-memory for rich content', () => {
    const m = measureRemembering(richContent)
    expect(m.memory).toBeGreaterThanOrEqual(85)
    expect(m.ocean).toBe('elephant-memory')
    expect(m.hasHighMemory).toBe(true)
    expect(m.hasStateManaged).toBe(true)
    expect(m.hasImmutable).toBe(true)
    expect(m.hasNoMutable).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('counts mutable patterns (var)', () => {
    const m = measureRemembering('var x = 1; var y = 2;')
    expect(m.mutableCount).toBe(2)
    expect(m.hasNoMutable).toBe(false)
  })

  it('counts leaked patterns (any)', () => {
    const m = measureRemembering('const x: any = 1;')
    expect(m.leakedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoInconsistent).toBe(false)
  })

  it('detects eval as hasNoLeaked violation', () => {
    const m = measureRemembering("eval('x')")
    expect(m.hasNoLeaked).toBe(false)
  })

  it('detects debugger as hasNoLost violation', () => {
    const m = measureRemembering('debugger')
    expect(m.hasNoLost).toBe(false)
  })
})

// ─── classifyWaveCondition ─────────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('classifies tidal-masterpiece for 85+', () => {
    expect(classifyWaveCondition(90)).toBe('tidal-masterpiece')
    expect(classifyWaveCondition(85)).toBe('tidal-masterpiece')
  })

  it('classifies crimson-surge for 70-84', () => {
    expect(classifyWaveCondition(70)).toBe('crimson-surge')
    expect(classifyWaveCondition(84)).toBe('crimson-surge')
  })

  it('classifies proper-tide for 55-69', () => {
    expect(classifyWaveCondition(55)).toBe('proper-tide')
  })

  it('classifies gentle-current for 40-54', () => {
    expect(classifyWaveCondition(40)).toBe('gentle-current')
  })

  it('classifies stagnant-water for 25-39', () => {
    expect(classifyWaveCondition(25)).toBe('stagnant-water')
  })

  it('classifies dry-channel below 25', () => {
    expect(classifyWaveCondition(0)).toBe('dry-channel')
    expect(classifyWaveCondition(24)).toBe('dry-channel')
  })
})

// ─── classifyShoreType ─────────────────────────────────────────────

describe('classifyShoreType', () => {
  it('returns no-shore for empty waves', () => {
    expect(classifyShoreType([])).toBe('no-shore')
  })

  it('returns crimson-coast for high avg with masterpiece ratio', () => {
    const waves = [
      { qualityScore: 90, condition: 'tidal-masterpiece' as const },
      { qualityScore: 85, condition: 'tidal-masterpiece' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, surgePower: 0, ebbResilience: 0, depthIntensity: 0, wavePrecision: 0, oceanMemory: 0, surging: {} as any, recovering: {} as any, concentrating: {} as any, precisioning: {} as any, remembering: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyShoreType(waves)).toBe('crimson-coast')
  })

  it('returns proper-shore for moderate avg', () => {
    const waves = [
      { qualityScore: 60, condition: 'proper-tide' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, surgePower: 0, ebbResilience: 0, depthIntensity: 0, wavePrecision: 0, oceanMemory: 0, surging: {} as any, recovering: {} as any, concentrating: {} as any, precisioning: {} as any, remembering: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyShoreType(waves)).toBe('proper-shore')
  })

  it('returns no-shore for very low avg', () => {
    const waves = [
      { qualityScore: 10, condition: 'dry-channel' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, surgePower: 0, ebbResilience: 0, depthIntensity: 0, wavePrecision: 0, oceanMemory: 0, surging: {} as any, recovering: {} as any, concentrating: {} as any, precisioning: {} as any, remembering: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyShoreType(waves)).toBe('no-shore')
  })
})

// ─── classifyShoreCondition ────────────────────────────────────────

describe('classifyShoreCondition', () => {
  it('returns powerful-coast for 75+', () => {
    expect(classifyShoreCondition(75)).toBe('powerful-coast')
    expect(classifyShoreCondition(90)).toBe('powerful-coast')
  })

  it('returns resilient-shore for 60-74', () => {
    expect(classifyShoreCondition(60)).toBe('resilient-shore')
  })

  it('returns decent-tide for 45-59', () => {
    expect(classifyShoreCondition(45)).toBe('decent-tide')
  })

  it('returns calm-bay for 30-44', () => {
    expect(classifyShoreCondition(30)).toBe('calm-bay')
  })

  it('returns dried-up for 15-29', () => {
    expect(classifyShoreCondition(15)).toBe('dried-up')
  })

  it('returns void below 15', () => {
    expect(classifyShoreCondition(0)).toBe('void')
  })
})

// ─── classifyNavigatorGrade ────────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('returns tide-master for 80+', () => {
    expect(classifyNavigatorGrade(80)).toBe('tide-master')
    expect(classifyNavigatorGrade(100)).toBe('tide-master')
  })

  it('returns sea-captain for 65-79', () => {
    expect(classifyNavigatorGrade(65)).toBe('sea-captain')
  })

  it('returns skilled-sailor for 50-64', () => {
    expect(classifyNavigatorGrade(50)).toBe('skilled-sailor')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyNavigatorGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyNavigatorGrade(20)).toBe('novice')
  })

  it('returns landlubber below 20', () => {
    expect(classifyNavigatorGrade(0)).toBe('landlubber')
    expect(classifyNavigatorGrade(19)).toBe('landlubber')
  })
})

// ─── analyzeCrimsonWave ────────────────────────────────────────────

describe('analyzeCrimsonWave', () => {
  it('analyzes rich content correctly', () => {
    const wave = analyzeCrimsonWave(richContent, 'rich.ts')
    expect(wave.file).toBe('rich.ts')
    expect(wave.surgePower).toBeGreaterThanOrEqual(85)
    expect(wave.ebbResilience).toBeGreaterThanOrEqual(85)
    expect(wave.depthIntensity).toBeGreaterThanOrEqual(85)
    expect(wave.wavePrecision).toBeGreaterThanOrEqual(85)
    expect(wave.oceanMemory).toBeGreaterThanOrEqual(85)
    expect(wave.qualityScore).toBeGreaterThanOrEqual(85)
    expect(wave.condition).toBe('tidal-masterpiece')
  })

  it('analyzes empty content as dry-channel', () => {
    const wave = analyzeCrimsonWave(emptyContent, 'empty.ts')
    expect(wave.file).toBe('empty.ts')
    expect(wave.surgePower).toBe(0)
    expect(wave.qualityScore).toBe(0)
    expect(wave.condition).toBe('dry-channel')
  })

  it('computes qualityScore as weighted average', () => {
    const wave = analyzeCrimsonWave(moderateContent, 'mod.ts')
    const expected = Math.round(
      wave.surgePower * 0.2 +
      wave.ebbResilience * 0.2 +
      wave.depthIntensity * 0.2 +
      wave.wavePrecision * 0.2 +
      wave.oceanMemory * 0.2,
    )
    expect(wave.qualityScore).toBe(expected)
  })
})

// ─── analyzeTideShore ──────────────────────────────────────────────

describe('analyzeTideShore', () => {
  it('returns empty shore for no waves', () => {
    const shore = analyzeTideShore([], 'src')
    expect(shore.directory).toBe('src')
    expect(shore.waves).toHaveLength(0)
    expect(shore.avgPower).toBe(0)
    expect(shore.shoreType).toBe('no-shore')
    expect(shore.condition).toBe('void')
  })

  it('analyzes shore with single wave', () => {
    const wave = analyzeCrimsonWave(richContent, 'src/rich.ts')
    const shore = analyzeTideShore([wave], 'src')
    expect(shore.waves).toHaveLength(1)
    expect(shore.avgPower).toBe(wave.surgePower)
    expect(shore.avgResilience).toBe(wave.ebbResilience)
  })

  it('counts tidal masterpieces and dry channels', () => {
    const rich = analyzeCrimsonWave(richContent, 'rich.ts')
    const empty = analyzeCrimsonWave(emptyContent, 'empty.ts')
    const shore = analyzeTideShore([rich, empty], 'src')
    expect(shore.tidalMasterpieceCount).toBe(1)
    expect(shore.dryChannelCount).toBe(1)
  })
})

// ─── buildCrimsonTideResult ────────────────────────────────────────

describe('buildCrimsonTideResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildCrimsonTideResult([], [])
    expect(result.waves).toHaveLength(0)
    expect(result.shores).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSurge).toBe(0)
    expect(result.sea.isCrimson).toBe(false)
  })

  it('analyzes single rich file', async () => {
    const result = await buildCrimsonTideResult(['rich.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.waves[0].condition).toBe('tidal-masterpiece')
    expect(result.stats.tidalMasterpieceCount).toBe(1)
    expect(result.sea.isCrimson).toBe(true)
    expect(result.stats.overallSurge).toBeGreaterThan(0)
    expect(result.stats.navigatorGrade).toBeDefined()
    expect(result.stats.bestWave).toBe('rich.ts')
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildCrimsonTideResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.waves).toHaveLength(2)
    expect(result.shores).toHaveLength(2)
    expect(result.stats.totalShores).toBe(2)
  })

  it('populates all best fields', async () => {
    const result = await buildCrimsonTideResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestWave).toBe('a.ts')
    expect(result.stats.mostPowerful).toBe('a.ts')
    expect(result.stats.mostResilient).toBe('a.ts')
    expect(result.stats.mostIntense).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
  })

  it('counts hasHigh flags correctly', async () => {
    const result = await buildCrimsonTideResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighPowerCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
    expect(result.stats.hasHighIntensityCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighMemoryCount).toBe(1)
  })

  it('computes sea correctly', async () => {
    const result = await buildCrimsonTideResult(['rich.ts'], [richContent])
    expect(result.sea.avgPower).toBeGreaterThan(0)
    expect(result.sea.avgResilience).toBeGreaterThan(0)
    expect(result.sea.avgPrecision).toBeGreaterThan(0)
    expect(result.sea.isCrimson).toBe(true)
    expect(result.sea.overallSurge).toBeGreaterThan(0)
  })

  it('returns recommendations', async () => {
    const result = await buildCrimsonTideResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message when all scores high', () => {
    const stats: CrimsonTideStats = {
      totalFiles: 1, totalShores: 1,
      avgSurgePower: 90, avgEbbResilience: 90, avgDepthIntensity: 90,
      avgWavePrecision: 90, avgOceanMemory: 90,
      tidalMasterpieceCount: 1, crimsonSurgeCount: 0, properTideCount: 0,
      gentleCurrentCount: 0, stagnantWaterCount: 0, dryChannelCount: 0,
      hasHighPowerCount: 1, hasHighResilienceCount: 1, hasHighIntensityCount: 1,
      hasHighPrecisionCount: 1, hasHighMemoryCount: 1,
      overallSurge: 90, navigatorGrade: 'tide-master',
      bestWave: 'a.ts', mostPowerful: 'a.ts', mostResilient: 'a.ts',
      mostIntense: 'a.ts', mostPrecise: 'a.ts',
    }
    const sea: CrimsonSea = { avgPower: 90, avgResilience: 90, avgPrecision: 90, isCrimson: true, overallSurge: 90 }
    const recs = generateRecommendations([], [], sea, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('tidal perfection')
  })

  it('recommends improving surge when low', () => {
    const stats: CrimsonTideStats = {
      totalFiles: 1, totalShores: 1,
      avgSurgePower: 30, avgEbbResilience: 90, avgDepthIntensity: 90,
      avgWavePrecision: 90, avgOceanMemory: 90,
      tidalMasterpieceCount: 0, crimsonSurgeCount: 0, properTideCount: 0,
      gentleCurrentCount: 0, stagnantWaterCount: 0, dryChannelCount: 0,
      hasHighPowerCount: 0, hasHighResilienceCount: 1, hasHighIntensityCount: 1,
      hasHighPrecisionCount: 1, hasHighMemoryCount: 1,
      overallSurge: 60, navigatorGrade: 'skilled-sailor',
      bestWave: 'a.ts', mostPowerful: 'a.ts', mostResilient: 'a.ts',
      mostIntense: 'a.ts', mostPrecise: 'a.ts',
    }
    const sea: CrimsonSea = { avgPower: 30, avgResilience: 90, avgPrecision: 90, isCrimson: false, overallSurge: 60 }
    const recs = generateRecommendations([], [], sea, stats)
    expect(recs.some(r => r.includes('surge power'))).toBe(true)
  })

  it('recommends for dry channels', () => {
    const stats: CrimsonTideStats = {
      totalFiles: 1, totalShores: 1,
      avgSurgePower: 90, avgEbbResilience: 90, avgDepthIntensity: 90,
      avgWavePrecision: 90, avgOceanMemory: 90,
      tidalMasterpieceCount: 0, crimsonSurgeCount: 0, properTideCount: 0,
      gentleCurrentCount: 0, stagnantWaterCount: 0, dryChannelCount: 2,
      hasHighPowerCount: 1, hasHighResilienceCount: 1, hasHighIntensityCount: 1,
      hasHighPrecisionCount: 1, hasHighMemoryCount: 1,
      overallSurge: 80, navigatorGrade: 'tide-master',
      bestWave: 'a.ts', mostPowerful: 'a.ts', mostResilient: 'a.ts',
      mostIntense: 'a.ts', mostPrecise: 'a.ts',
    }
    const sea: CrimsonSea = { avgPower: 90, avgResilience: 90, avgPrecision: 90, isCrimson: true, overallSurge: 90 }
    const recs = generateRecommendations([], [], sea, stats)
    expect(recs.some(r => r.includes('dry channel'))).toBe(true)
  })

  it('recommends for low overall surge', () => {
    const stats: CrimsonTideStats = {
      totalFiles: 1, totalShores: 1,
      avgSurgePower: 30, avgEbbResilience: 30, avgDepthIntensity: 30,
      avgWavePrecision: 30, avgOceanMemory: 30,
      tidalMasterpieceCount: 0, crimsonSurgeCount: 0, properTideCount: 0,
      gentleCurrentCount: 0, stagnantWaterCount: 0, dryChannelCount: 0,
      hasHighPowerCount: 0, hasHighResilienceCount: 0, hasHighIntensityCount: 0,
      hasHighPrecisionCount: 0, hasHighMemoryCount: 0,
      overallSurge: 30, navigatorGrade: 'apprentice',
      bestWave: '', mostPowerful: '', mostResilient: '',
      mostIntense: '', mostPrecise: '',
    }
    const sea: CrimsonSea = { avgPower: 30, avgResilience: 30, avgPrecision: 30, isCrimson: false, overallSurge: 30 }
    const recs = generateRecommendations([], [], sea, stats)
    expect(recs.some(r => r.includes('surge'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for various scores', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(60)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for known grades', () => {
    expect(typeof colorGrade('tidal-masterpiece')).toBe('string')
    expect(typeof colorGrade('dry-channel')).toBe('string')
    expect(typeof colorGrade('crimson-coast')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatWaveTable', () => {
  it('formats a single wave', () => {
    const wave = analyzeCrimsonWave(richContent, 'test.ts')
    const result = formatWaveTable(wave)
    expect(result).toContain('test.ts')
    expect(result).toContain('Surge Power')
    expect(result).toContain('Score')
  })
})

describe('formatWavesTable', () => {
  it('returns no waves message for empty', () => {
    expect(formatWavesTable([])).toContain('No crimson waves')
  })

  it('formats multiple waves', () => {
    const wave = analyzeCrimsonWave(richContent, 'a.ts')
    const result = formatWavesTable([wave])
    expect(result).toContain('Crimson Tide Analysis')
  })
})

describe('formatShoreTable', () => {
  it('formats shore with wave', () => {
    const wave = analyzeCrimsonWave(richContent, 'a.ts')
    const shore = analyzeTideShore([wave], 'src')
    const result = formatShoreTable(shore)
    expect(result).toContain('Shore')
    expect(result).toContain('src')
  })
})

describe('formatShoresTable', () => {
  it('returns no shores message for empty', () => {
    expect(formatShoresTable([])).toContain('No tide shores')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCrimsonTideResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Crimson Tide Statistics')
    expect(output).toContain('Overall Surge')
    expect(output).toContain('Navigator Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Boost surge', 'Strengthen ebb'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Boost surge')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildCrimsonTideResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Crimson Tide Analysis')
    expect(output).toContain('Tide Shores')
    expect(output).toContain('Crimson Tide Statistics')
    expect(output).toContain('Sea')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildCrimsonTideResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.sea).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only var and any', () => {
    const m = measureSurging('var x: any = 1;')
    expect(m.sluggishCount).toBeGreaterThanOrEqual(1)
    expect(m.unoptimizedCount).toBeGreaterThanOrEqual(1)
  })

  it('minimal content has low scores', () => {
    const wave = analyzeCrimsonWave(minimalContent, 'min.ts')
    expect(wave.surgePower).toBeLessThan(50)
    expect(wave.ebbResilience).toBeLessThan(50)
    expect(wave.depthIntensity).toBeLessThan(50)
    expect(wave.wavePrecision).toBeLessThan(50)
    expect(wave.oceanMemory).toBeLessThan(50)
  })

  it('result with all dry channels has correct sea', async () => {
    const result = await buildCrimsonTideResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.sea.isCrimson).toBe(false)
    expect(result.stats.dryChannelCount).toBe(2)
    expect(result.stats.tidalMasterpieceCount).toBe(0)
  })
})
