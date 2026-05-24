import { describe, it, expect } from 'vitest'
import {
  measureFlowing,
  measureBalancing,
  measureVitalizing,
  measurePrecisioning,
  measureHarmonizing,
  classifyPointCondition,
  classifyPathType,
  classifyPathCondition,
  classifyHealerGrade,
  analyzeJadePoint,
  analyzeMeridianPath,
  buildJadeMeridianResult,
  generateRecommendations,
} from '../src/commands/jade-meridian-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPointTable,
  formatPointsTable,
  formatPathTable,
  formatPathsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-meridian-format-helpers.js'
import type { JadePoint, JadeMeridianStats, JadeBody, MeridianPath } from '../src/commands/jade-meridian-helpers.js'

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
  email?: string
}

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export type Status = 'active' | 'inactive' | 'pending'

export class UserService<T extends UserConfig> {
  private users: T[] = []

  async addUser(user: T): Promise<void> {
    try {
      this.users.push(user)
    } catch (error) {
      throw new Error('Failed to add user')
    }
  }

  getUser(id: string): T | undefined {
    return this.users.find(u => u.name === id)
  }
}

export const DEFAULT_CONFIG: UserConfig = {
  name: 'default',
  age: 0,
}

export function createConfig(name: string, age: number): UserConfig {
  return { name, age }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
`

// ─── measureFlowing ────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns 0 energy for empty content', () => {
    const m = measureFlowing(emptyContent)
    expect(m.energy).toBe(0)
  })

  it('returns low energy for minimal content', () => {
    const m = measureFlowing(minimalContent)
    expect(m.energy).toBeLessThan(20)
  })

  it('returns moderate energy for moderate content', () => {
    const m = measureFlowing(moderateContent)
    expect(m.energy).toBeGreaterThanOrEqual(40)
    expect(m.energy).toBeLessThan(80)
  })

  it('returns high energy for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.energy).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    const m = measureFlowing(emptyContent)
    expect(m.grade).toBe('no-flow')
  })

  it('has correct grade for minimal content', () => {
    const m = measureFlowing(minimalContent)
    expect(m.grade).toBe('no-flow')
  })

  it('has correct grade for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.grade).toBe('unobstructed-flow')
  })

  it('has correct grade for moderate content', () => {
    const m = measureFlowing(moderateContent)
    expect(m.grade).toBe('proper-flow')
  })

  it('detects efficient flow in rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasEfficientFlow).toBe(true)
  })

  it('detects direct paths in rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasDirectPaths).toBe(true)
  })

  it('does not detect clean pipelines without map/filter/reduce', () => {
    const m = measureFlowing(richContent)
    expect(m.hasCleanPipelines).toBe(false)
  })

  it('has no bottlenecks in clean content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasNoBottlenecks).toBe(true)
    expect(m.bottleneckCount).toBe(0)
  })

  it('detects high energy flag', () => {
    const m = measureFlowing(richContent)
    expect(m.hasHighEnergy).toBe(true)
  })

  it('does not flag high energy for minimal content', () => {
    const m = measureFlowing(minimalContent)
    expect(m.hasHighEnergy).toBe(false)
  })

  it('caps energy at 100', () => {
    const m = measureFlowing(richContent)
    expect(m.energy).toBeLessThanOrEqual(100)
  })
})

// ─── measureBalancing ──────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns 0 balance for empty content', () => {
    const m = measureBalancing(emptyContent)
    expect(m.balance).toBe(0)
  })

  it('returns low balance for minimal content', () => {
    const m = measureBalancing(minimalContent)
    expect(m.balance).toBeLessThan(20)
  })

  it('returns high balance for rich content', () => {
    const m = measureBalancing(richContent)
    expect(m.balance).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    const m = measureBalancing(emptyContent)
    expect(m.meridian).toBe('no-balance')
  })

  it('has correct grade for rich content', () => {
    const m = measureBalancing(richContent)
    expect(m.meridian).toBe('perfect-balance')
  })

  it('detects even distribution in rich content', () => {
    const m = measureBalancing(richContent)
    expect(m.hasEvenDistribution).toBe(true)
  })

  it('detects proportional in rich content', () => {
    const m = measureBalancing(richContent)
    expect(m.hasProportional).toBe(true)
  })

  it('has no god functions in clean content', () => {
    const m = measureBalancing(richContent)
    expect(m.hasNoGodFunctions).toBe(true)
    expect(m.godFunctionCount).toBe(0)
  })

  it('detects high balance flag for rich content', () => {
    const m = measureBalancing(richContent)
    expect(m.hasHighBalance).toBe(true)
  })

  it('caps balance at 100', () => {
    const m = measureBalancing(richContent)
    expect(m.balance).toBeLessThanOrEqual(100)
  })
})

// ─── measureVitalizing ─────────────────────────────────────────────

describe('measureVitalizing', () => {
  it('returns 0 vitality for empty content', () => {
    const m = measureVitalizing(emptyContent)
    expect(m.vitality).toBe(0)
  })

  it('returns low vitality for minimal content', () => {
    const m = measureVitalizing(minimalContent)
    expect(m.vitality).toBeLessThan(20)
  })

  it('returns high vitality for rich content', () => {
    const m = measureVitalizing(richContent)
    expect(m.vitality).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    const m = measureVitalizing(emptyContent)
    expect(m.chi).toBe('no-chi')
  })

  it('has correct grade for rich content', () => {
    const m = measureVitalizing(richContent)
    expect(m.chi).toBe('vital-chi')
  })

  it('detects performant in rich content', () => {
    const m = measureVitalizing(richContent)
    expect(m.hasPerformant).toBe(true)
  })

  it('detects optimized in rich content', () => {
    const m = measureVitalizing(richContent)
    expect(m.hasOptimized).toBe(true)
  })

  it('has no sluggish in clean content', () => {
    const m = measureVitalizing(richContent)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.sluggishCount).toBe(0)
  })

  it('detects high vitality flag for rich content', () => {
    const m = measureVitalizing(richContent)
    expect(m.hasHighVitality).toBe(true)
  })

  it('caps vitality at 100', () => {
    const m = measureVitalizing(richContent)
    expect(m.vitality).toBeLessThanOrEqual(100)
  })
})

// ─── measurePrecisioning ───────────────────────────────────────────

describe('measurePrecisioning', () => {
  it('returns 0 precision for empty content', () => {
    const m = measurePrecisioning(emptyContent)
    expect(m.precision).toBe(0)
  })

  it('returns low precision for minimal content', () => {
    const m = measurePrecisioning(minimalContent)
    expect(m.precision).toBeLessThan(20)
  })

  it('returns high precision for rich content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    const m = measurePrecisioning(emptyContent)
    expect(m.acupoint).toBe('no-precision')
  })

  it('has correct grade for rich content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.acupoint).toBe('master-healer')
  })

  it('detects exact in rich content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.hasExact).toBe(true)
  })

  it('has no approximate in clean content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.approximateCount).toBe(0)
  })

  it('detects high precision flag for rich content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('caps precision at 100', () => {
    const m = measurePrecisioning(richContent)
    expect(m.precision).toBeLessThanOrEqual(100)
  })
})

// ─── measureHarmonizing ────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('returns 0 resonance for empty content', () => {
    const m = measureHarmonizing(emptyContent)
    expect(m.resonance).toBe(0)
  })

  it('returns low resonance for minimal content', () => {
    const m = measureHarmonizing(minimalContent)
    expect(m.resonance).toBeLessThan(20)
  })

  it('returns high resonance for rich content', () => {
    const m = measureHarmonizing(richContent)
    expect(m.resonance).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    const m = measureHarmonizing(emptyContent)
    expect(m.harmonic).toBe('silence')
  })

  it('has correct grade for rich content', () => {
    const m = measureHarmonizing(richContent)
    expect(m.harmonic).toBe('symphony-of-code')
  })

  it('detects consistent in rich content', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasConsistent).toBe(true)
  })

  it('detects uniform in rich content', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasUniform).toBe(true)
  })

  it('has no inconsistent in clean content', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasNoInconsistent).toBe(true)
    expect(m.inconsistentCount).toBe(0)
  })

  it('detects high resonance flag for rich content', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasHighResonance).toBe(true)
  })

  it('caps resonance at 100', () => {
    const m = measureHarmonizing(richContent)
    expect(m.resonance).toBeLessThanOrEqual(100)
  })
})

// ─── Classifications ───────────────────────────────────────────────

describe('classifyPointCondition', () => {
  it('classifies 90 as grandmaster-art', () => {
    expect(classifyPointCondition(90)).toBe('grandmaster-art')
  })

  it('classifies 75 as healing-jade', () => {
    expect(classifyPointCondition(75)).toBe('healing-jade')
  })

  it('classifies 60 as proper-meridian', () => {
    expect(classifyPointCondition(60)).toBe('proper-meridian')
  })

  it('classifies 45 as dull-stone', () => {
    expect(classifyPointCondition(45)).toBe('dull-stone')
  })

  it('classifies 30 as cracked-jade', () => {
    expect(classifyPointCondition(30)).toBe('cracked-jade')
  })

  it('classifies 10 as gravel', () => {
    expect(classifyPointCondition(10)).toBe('gravel')
  })
})

describe('classifyPathCondition', () => {
  it('classifies 80 as flowing-harmony', () => {
    expect(classifyPathCondition(80)).toBe('flowing-harmony')
  })

  it('classifies 65 as balanced-energy', () => {
    expect(classifyPathCondition(65)).toBe('balanced-energy')
  })

  it('classifies 50 as decent-flow', () => {
    expect(classifyPathCondition(50)).toBe('decent-flow')
  })

  it('classifies 35 as stagnant-channel', () => {
    expect(classifyPathCondition(35)).toBe('stagnant-channel')
  })

  it('classifies 20 as blocked', () => {
    expect(classifyPathCondition(20)).toBe('blocked')
  })

  it('classifies 5 as void', () => {
    expect(classifyPathCondition(5)).toBe('void')
  })
})

describe('classifyHealerGrade', () => {
  it('classifies 85 as grandmaster', () => {
    expect(classifyHealerGrade(85)).toBe('grandmaster')
  })

  it('classifies 70 as master-healer', () => {
    expect(classifyHealerGrade(70)).toBe('master-healer')
  })

  it('classifies 55 as skilled-practitioner', () => {
    expect(classifyHealerGrade(55)).toBe('skilled-practitioner')
  })

  it('classifies 40 as apprentice', () => {
    expect(classifyHealerGrade(40)).toBe('apprentice')
  })

  it('classifies 25 as novice', () => {
    expect(classifyHealerGrade(25)).toBe('novice')
  })

  it('classifies 10 as quack', () => {
    expect(classifyHealerGrade(10)).toBe('quack')
  })
})

// ─── analyzeJadePoint ──────────────────────────────────────────────

describe('analyzeJadePoint', () => {
  it('returns correct file path', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.file).toBe('test.ts')
  })

  it('computes quality score for rich content', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.qualityScore).toBeGreaterThanOrEqual(80)
  })

  it('classifies rich content as grandmaster-art', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.condition).toBe('grandmaster-art')
  })

  it('computes correct measures for empty content', () => {
    const point = analyzeJadePoint(emptyContent, 'empty.ts')
    expect(point.energyFlow).toBe(0)
    expect(point.meridianBalance).toBe(0)
    expect(point.chiVitality).toBe(0)
    expect(point.acuPointPrecision).toBe(0)
    expect(point.harmonicResonance).toBe(0)
    expect(point.qualityScore).toBe(0)
    expect(point.condition).toBe('gravel')
  })

  it('computes expected minimal content scores', () => {
    const point = analyzeJadePoint(minimalContent, 'minimal.ts')
    expect(point.energyFlow).toBe(8)
    expect(point.meridianBalance).toBe(6)
    expect(point.chiVitality).toBe(8)
    expect(point.acuPointPrecision).toBe(6)
    expect(point.harmonicResonance).toBe(8)
    expect(point.qualityScore).toBe(7)
    expect(point.condition).toBe('gravel')
  })

  it('computes expected moderate content scores', () => {
    const point = analyzeJadePoint(moderateContent, 'moderate.ts')
    expect(point.energyFlow).toBe(59)
    expect(point.meridianBalance).toBe(52)
    expect(point.chiVitality).toBe(52)
    expect(point.acuPointPrecision).toBe(54)
    expect(point.harmonicResonance).toBe(63)
    expect(point.qualityScore).toBe(56)
    expect(point.condition).toBe('proper-meridian')
  })

  it('computes expected rich content scores', () => {
    const point = analyzeJadePoint(richContent, 'rich.ts')
    expect(point.energyFlow).toBe(91)
    expect(point.meridianBalance).toBe(100)
    expect(point.chiVitality).toBe(93)
    expect(point.acuPointPrecision).toBe(100)
    expect(point.harmonicResonance).toBe(100)
    expect(point.qualityScore).toBe(97)
    expect(point.condition).toBe('grandmaster-art')
  })

  it('includes flowing measure details', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.flowing).toBeDefined()
    expect(point.flowing.hasEfficientFlow).toBe(true)
    expect(point.flowing.hasDirectPaths).toBe(true)
    expect(point.flowing.hasCleanPipelines).toBe(false)
  })

  it('includes balancing measure details', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.balancing).toBeDefined()
    expect(point.balancing.hasEvenDistribution).toBe(true)
    expect(point.balancing.hasProportional).toBe(true)
  })

  it('includes vitalizing measure details', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.vitalizing).toBeDefined()
    expect(point.vitalizing.hasPerformant).toBe(true)
    expect(point.vitalizing.hasOptimized).toBe(true)
  })

  it('includes precisioning measure details', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.precisioning).toBeDefined()
    expect(point.precisioning.hasExact).toBe(true)
    expect(point.precisioning.hasCorrect).toBe(true)
  })

  it('includes harmonizing measure details', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    expect(point.harmonizing).toBeDefined()
    expect(point.harmonizing.hasConsistent).toBe(true)
    expect(point.harmonizing.hasUniform).toBe(true)
  })
})

// ─── analyzeMeridianPath ───────────────────────────────────────────

describe('analyzeMeridianPath', () => {
  it('returns no-path for empty points', () => {
    const mp = analyzeMeridianPath([], 'src')
    expect(mp.pathType).toBe('no-path')
    expect(mp.condition).toBe('void')
    expect(mp.points).toHaveLength(0)
  })

  it('returns correct directory', () => {
    const points = [analyzeJadePoint(richContent, 'src/a.ts')]
    const mp = analyzeMeridianPath(points, 'src')
    expect(mp.directory).toBe('src')
  })

  it('computes averages from points', () => {
    const points = [analyzeJadePoint(richContent, 'src/a.ts')]
    const mp = analyzeMeridianPath(points, 'src')
    expect(mp.avgEnergy).toBe(91)
    expect(mp.avgBalance).toBe(100)
    expect(mp.avgResonance).toBe(100)
  })

  it('counts grandmaster art points', () => {
    const points = [analyzeJadePoint(richContent, 'src/a.ts')]
    const mp = analyzeMeridianPath(points, 'src')
    expect(mp.grandmasterArtCount).toBe(1)
  })

  it('classifies rich content path as master-meridian', () => {
    const points = [analyzeJadePoint(richContent, 'src/a.ts')]
    const mp = analyzeMeridianPath(points, 'src')
    expect(mp.pathType).toBe('master-meridian')
    expect(mp.condition).toBe('flowing-harmony')
  })

  it('averages across multiple points', () => {
    const p1 = analyzeJadePoint(richContent, 'src/a.ts')
    const p2 = analyzeJadePoint(minimalContent, 'src/b.ts')
    const mp = analyzeMeridianPath([p1, p2], 'src')
    expect(mp.avgEnergy).toBe(Math.round((91 + 8) / 2))
  })
})

// ─── classifyPathType ──────────────────────────────────────────────

describe('classifyPathType', () => {
  it('returns no-path for empty array', () => {
    expect(classifyPathType([])).toBe('no-path')
  })

  it('returns master-meridian for all grandmaster-art with high avg', () => {
    const points = [analyzeJadePoint(richContent, 'a.ts'), analyzeJadePoint(richContent, 'b.ts')]
    expect(classifyPathType(points)).toBe('master-meridian')
  })
})

// ─── buildJadeMeridianResult ───────────────────────────────────────

describe('buildJadeMeridianResult', () => {
  it('handles empty input', async () => {
    const result = await buildJadeMeridianResult([], [])
    expect(result.points).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.healerGrade).toBe('quack')
  })

  it('processes single file', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    expect(result.points).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('computes stats for rich content', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    expect(result.stats.avgEnergyFlow).toBe(91)
    expect(result.stats.avgMeridianBalance).toBe(100)
    expect(result.stats.avgChiVitality).toBe(93)
    expect(result.stats.avgAcuPointPrecision).toBe(100)
    expect(result.stats.avgHarmonicResonance).toBe(100)
    expect(result.stats.grandmasterArtCount).toBe(1)
  })

  it('computes body for rich content', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    expect(result.body.avgEnergy).toBe(91)
    expect(result.body.avgBalance).toBe(100)
    expect(result.body.isHarmonious).toBe(true)
    expect(result.body.overallVitality).toBe(97)
  })

  it('identifies best point', async () => {
    const result = await buildJadeMeridianResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestPoint).toBe('good.ts')
  })

  it('identifies most flowing', async () => {
    const result = await buildJadeMeridianResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.mostFlowing).toBe('high.ts')
  })

  it('identifies most balanced', async () => {
    const result = await buildJadeMeridianResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.mostBalanced).toBe('high.ts')
  })

  it('identifies most vital', async () => {
    const result = await buildJadeMeridianResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.mostVital).toBe('high.ts')
  })

  it('identifies most precise', async () => {
    const result = await buildJadeMeridianResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.mostPrecise).toBe('high.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildJadeMeridianResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.paths.length).toBeGreaterThanOrEqual(2)
  })

  it('counts high measure flags', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    expect(result.stats.hasHighEnergyCount).toBe(1)
    expect(result.stats.hasHighBalanceCount).toBe(1)
    expect(result.stats.hasHighVitalityCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighResonanceCount).toBe(1)
  })

  it('classifies healer grade for rich content', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    expect(result.stats.healerGrade).toBe('grandmaster')
  })

  it('computes overall vitality correctly', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    expect(result.stats.overallVitality).toBe(97)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for healthy codebase', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    const mp = analyzeMeridianPath([point], 'src')
    const body: JadeBody = { avgEnergy: 100, avgBalance: 100, avgResonance: 100, isHarmonious: true, overallVitality: 100 }
    const stats: JadeMeridianStats = {
      totalFiles: 1, totalPaths: 1,
      avgEnergyFlow: 100, avgMeridianBalance: 100, avgChiVitality: 100,
      avgAcuPointPrecision: 100, avgHarmonicResonance: 100,
      grandmasterArtCount: 1, healingJadeCount: 0, properMeridianCount: 0,
      dullStoneCount: 0, crackedJadeCount: 0, gravelCount: 0,
      hasHighEnergyCount: 1, hasHighBalanceCount: 1, hasHighVitalityCount: 1,
      hasHighPrecisionCount: 1, hasHighResonanceCount: 1,
      overallVitality: 100, healerGrade: 'grandmaster',
      bestPoint: 'test.ts', mostFlowing: 'test.ts', mostBalanced: 'test.ts',
      mostVital: 'test.ts', mostPrecise: 'test.ts',
    }
    const recs = generateRecommendations([point], [mp], body, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfectly')
  })

  it('recommends improving energy flow when low', () => {
    const point = analyzeJadePoint(minimalContent, 'test.ts')
    const mp = analyzeMeridianPath([point], 'src')
    const body: JadeBody = { avgEnergy: 8, avgBalance: 6, avgResonance: 8, isHarmonious: false, overallVitality: 7 }
    const stats: JadeMeridianStats = {
      totalFiles: 1, totalPaths: 1,
      avgEnergyFlow: 8, avgMeridianBalance: 6, avgChiVitality: 8,
      avgAcuPointPrecision: 6, avgHarmonicResonance: 8,
      grandmasterArtCount: 0, healingJadeCount: 0, properMeridianCount: 0,
      dullStoneCount: 0, crackedJadeCount: 0, gravelCount: 1,
      hasHighEnergyCount: 0, hasHighBalanceCount: 0, hasHighVitalityCount: 0,
      hasHighPrecisionCount: 0, hasHighResonanceCount: 0,
      overallVitality: 7, healerGrade: 'quack',
      bestPoint: 'test.ts', mostFlowing: 'test.ts', mostBalanced: 'test.ts',
      mostVital: 'test.ts', mostPrecise: 'test.ts',
    }
    const recs = generateRecommendations([point], [mp], body, stats)
    expect(recs.length).toBeGreaterThan(1)
    expect(recs.some(r => r.includes('energy flow'))).toBe(true)
  })

  it('warns about gravel files', () => {
    const point = analyzeJadePoint(minimalContent, 'test.ts')
    const mp = analyzeMeridianPath([point], 'src')
    const body: JadeBody = { avgEnergy: 8, avgBalance: 6, avgResonance: 8, isHarmonious: false, overallVitality: 7 }
    const stats: JadeMeridianStats = {
      totalFiles: 1, totalPaths: 1,
      avgEnergyFlow: 8, avgMeridianBalance: 6, avgChiVitality: 8,
      avgAcuPointPrecision: 6, avgHarmonicResonance: 8,
      grandmasterArtCount: 0, healingJadeCount: 0, properMeridianCount: 0,
      dullStoneCount: 0, crackedJadeCount: 0, gravelCount: 1,
      hasHighEnergyCount: 0, hasHighBalanceCount: 0, hasHighVitalityCount: 0,
      hasHighPrecisionCount: 0, hasHighResonanceCount: 0,
      overallVitality: 7, healerGrade: 'quack',
      bestPoint: 'test.ts', mostFlowing: 'test.ts', mostBalanced: 'test.ts',
      mostVital: 'test.ts', mostPrecise: 'test.ts',
    }
    const recs = generateRecommendations([point], [mp], body, stats)
    expect(recs.some(r => r.includes('gravel'))).toBe(true)
  })

  it('lists specific gravel files to rebuild', () => {
    const point = analyzeJadePoint(minimalContent, 'bad.ts')
    const mp = analyzeMeridianPath([point], 'src')
    const body: JadeBody = { avgEnergy: 8, avgBalance: 6, avgResonance: 8, isHarmonious: false, overallVitality: 7 }
    const stats: JadeMeridianStats = {
      totalFiles: 1, totalPaths: 1,
      avgEnergyFlow: 8, avgMeridianBalance: 6, avgChiVitality: 8,
      avgAcuPointPrecision: 6, avgHarmonicResonance: 8,
      grandmasterArtCount: 0, healingJadeCount: 0, properMeridianCount: 0,
      dullStoneCount: 0, crackedJadeCount: 0, gravelCount: 1,
      hasHighEnergyCount: 0, hasHighBalanceCount: 0, hasHighVitalityCount: 0,
      hasHighPrecisionCount: 0, hasHighResonanceCount: 0,
      overallVitality: 7, healerGrade: 'quack',
      bestPoint: 'bad.ts', mostFlowing: 'bad.ts', mostBalanced: 'bad.ts',
      mostVital: 'bad.ts', mostPrecise: 'bad.ts',
    }
    const recs = generateRecommendations([point], [mp], body, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about low overall vitality', () => {
    const point = analyzeJadePoint(minimalContent, 'test.ts')
    const mp = analyzeMeridianPath([point], 'src')
    const body: JadeBody = { avgEnergy: 8, avgBalance: 6, avgResonance: 8, isHarmonious: false, overallVitality: 7 }
    const stats: JadeMeridianStats = {
      totalFiles: 1, totalPaths: 1,
      avgEnergyFlow: 8, avgMeridianBalance: 6, avgChiVitality: 8,
      avgAcuPointPrecision: 6, avgHarmonicResonance: 8,
      grandmasterArtCount: 0, healingJadeCount: 0, properMeridianCount: 0,
      dullStoneCount: 0, crackedJadeCount: 0, gravelCount: 1,
      hasHighEnergyCount: 0, hasHighBalanceCount: 0, hasHighVitalityCount: 0,
      hasHighPrecisionCount: 0, hasHighResonanceCount: 0,
      overallVitality: 7, healerGrade: 'quack',
      bestPoint: 'test.ts', mostFlowing: 'test.ts', mostBalanced: 'test.ts',
      mostVital: 'test.ts', mostPrecise: 'test.ts',
    }
    const recs = generateRecommendations([point], [mp], body, stats)
    expect(recs.some(r => r.includes('vitality'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 0', () => {
    expect(typeof colorScore(0)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('colors grandmaster-art', () => {
    expect(typeof colorGrade('grandmaster-art')).toBe('string')
  })

  it('colors gravel', () => {
    expect(typeof colorGrade('gravel')).toBe('string')
  })

  it('colors unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatPointTable', () => {
  it('formats a jade point', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    const output = formatPointTable(point)
    expect(output).toContain('test.ts')
    expect(output).toContain('Energy Flow')
    expect(output).toContain('Meridian Balance')
    expect(output).toContain('Chi Vitality')
    expect(output).toContain('Acu-Point Precision')
    expect(output).toContain('Harmonic Resonance')
    expect(output).toContain('Score')
  })
})

describe('formatPointsTable', () => {
  it('returns no points message for empty array', () => {
    expect(formatPointsTable([])).toContain('No jade points found')
  })

  it('formats points with header', () => {
    const point = analyzeJadePoint(richContent, 'test.ts')
    const output = formatPointsTable([point])
    expect(output).toContain('Jade Meridian Analysis')
    expect(output).toContain('test.ts')
  })
})

describe('formatPathTable', () => {
  it('formats a meridian path', () => {
    const point = analyzeJadePoint(richContent, 'src/a.ts')
    const mp = analyzeMeridianPath([point], 'src')
    const output = formatPathTable(mp)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Condition')
  })
})

describe('formatPathsTable', () => {
  it('returns no paths message for empty array', () => {
    expect(formatPathsTable([])).toContain('No meridian paths found')
  })

  it('formats paths with header', () => {
    const point = analyzeJadePoint(richContent, 'src/a.ts')
    const mp = analyzeMeridianPath([point], 'src')
    const output = formatPathsTable([mp])
    expect(output).toContain('Meridian Paths')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Jade Meridian Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Healer Grade')
    expect(output).toContain('Best Point')
    expect(output).toContain('Most Flowing')
    expect(output).toContain('Most Balanced')
    expect(output).toContain('Most Vital')
    expect(output).toContain('Most Precise')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations with header', () => {
    const output = formatRecommendations(['Fix foo', 'Improve bar'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix foo')
    expect(output).toContain('Improve bar')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Meridian Analysis')
    expect(output).toContain('Meridian Paths')
    expect(output).toContain('Jade Meridian Statistics')
    expect(output).toContain('Body')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildJadeMeridianResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.points).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
