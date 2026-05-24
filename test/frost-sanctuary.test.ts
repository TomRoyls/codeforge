import { describe, it, expect } from 'vitest'
import {
  measurePreserving,
  measureClarifying,
  measureStabilizing,
  measureEnduring,
  measureBeautifying,
  classifyCrystalCondition,
  classifyHallType,
  classifyHallCondition,
  classifyGuardianGrade,
  analyzeIceCrystal,
  analyzeGlacierHall,
  buildFrostSanctuaryResult,
  generateRecommendations,
} from '../src/commands/frost-sanctuary-helpers.js'
import {
  colorScore,
  colorGrade,
  formatCrystalTable,
  formatCrystalsTable,
  formatHallTable,
  formatHallsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/frost-sanctuary-format-helpers.js'
import type { IceCrystal, FrostSanctuaryStats, FrostArctic, GlacierHall } from '../src/commands/frost-sanctuary-helpers.js'

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

// ─── measurePreserving ─────────────────────────────────────────────

describe('measurePreserving', () => {
  it('returns 0 preservation for empty content', () => {
    const m = measurePreserving(emptyContent)
    expect(m.preservation).toBe(0)
  })

  it('returns low preservation for minimal content', () => {
    const m = measurePreserving(minimalContent)
    expect(m.preservation).toBeLessThan(20)
  })

  it('returns moderate preservation for moderate content', () => {
    const m = measurePreserving(moderateContent)
    expect(m.preservation).toBeGreaterThanOrEqual(40)
    expect(m.preservation).toBeLessThan(80)
  })

  it('returns high preservation for rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.preservation).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measurePreserving(emptyContent)
    expect(m.grade).toBe('no-preservation')
  })

  it('grades correctly for minimal content', () => {
    const m = measurePreserving(minimalContent)
    expect(m.grade).toBe('no-preservation')
  })

  it('detects hasBackwardCompatible for rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.hasBackwardCompatible).toBe(true)
  })

  it('detects hasBackwardCompatible false for minimal', () => {
    const m = measurePreserving(minimalContent)
    expect(m.hasBackwardCompatible).toBe(false)
  })

  it('detects breakingChangesCount for var usage', () => {
    const m = measurePreserving('var x = 1')
    expect(m.breakingChangesCount).toBeGreaterThan(0)
  })

  it('detects hasHighPreservation for rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.hasHighPreservation).toBe(true)
  })

  it('detects hasNoBreakingChanges for clean content', () => {
    const m = measurePreserving(richContent)
    expect(m.hasNoBreakingChanges).toBe(true)
  })

  it('detects hasDeprecationPolicy for rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.hasDeprecationPolicy).toBe(true)
  })

  it('caps preservation at 100', () => {
    const m = measurePreserving(richContent)
    expect(m.preservation).toBeLessThanOrEqual(100)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 clarity for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
  })

  it('returns low clarity for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBeLessThan(20)
  })

  it('returns moderate clarity for moderate content', () => {
    const m = measureClarifying(moderateContent)
    expect(m.clarity).toBeGreaterThanOrEqual(40)
    expect(m.clarity).toBeLessThan(80)
  })

  it('returns high clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.ice).toBe('opaque')
  })

  it('detects hasReadable for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasReadable).toBe(true)
  })

  it('detects hasHighClarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasHighClarity).toBe(true)
  })

  it('detects hasNoObfuscated for clean content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasNoObfuscated).toBe(true)
  })

  it('caps clarity at 100', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureStabilizing ────────────────────────────────────────────

describe('measureStabilizing', () => {
  it('returns 0 stability for empty content', () => {
    const m = measureStabilizing(emptyContent)
    expect(m.stability).toBe(0)
  })

  it('returns low stability for minimal content', () => {
    const m = measureStabilizing(minimalContent)
    expect(m.stability).toBeLessThan(20)
  })

  it('returns moderate stability for moderate content', () => {
    const m = measureStabilizing(moderateContent)
    expect(m.stability).toBeGreaterThanOrEqual(30)
    expect(m.stability).toBeLessThan(80)
  })

  it('returns high stability for rich content', () => {
    const m = measureStabilizing(richContent)
    expect(m.stability).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureStabilizing(emptyContent)
    expect(m.permafrost).toBe('no-stability')
  })

  it('detects hasImmutable for rich content', () => {
    const m = measureStabilizing(richContent)
    expect(m.hasImmutable).toBe(true)
  })

  it('detects hasNoMutable for clean content', () => {
    const m = measureStabilizing(richContent)
    expect(m.hasNoMutable).toBe(true)
  })

  it('detects hasEncapsulated for rich content', () => {
    const m = measureStabilizing(richContent)
    expect(m.hasEncapsulated).toBe(true)
  })

  it('caps stability at 100', () => {
    const m = measureStabilizing(richContent)
    expect(m.stability).toBeLessThanOrEqual(100)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 resilience for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.resilience).toBe(0)
  })

  it('returns low resilience for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBeLessThan(20)
  })

  it('returns moderate resilience for moderate content', () => {
    const m = measureEnduring(moderateContent)
    expect(m.resilience).toBeGreaterThanOrEqual(30)
  })

  it('returns high resilience for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.frost).toBe('no-endurance')
  })

  it('detects hasErrorHandling for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasErrorHandling).toBe(true)
  })

  it('detects hasEdgeCaseCoverage false for rich content (no if)', () => {
    const m = measureEnduring(richContent)
    expect(m.hasEdgeCaseCoverage).toBe(false)
  })

  it('detects hasNoBareCrash for clean content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasNoBareCrash).toBe(true)
  })

  it('caps resilience at 100', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeLessThanOrEqual(100)
  })
})

// ─── measureBeautifying ────────────────────────────────────────────

describe('measureBeautifying', () => {
  it('returns 0 beauty for empty content', () => {
    const m = measureBeautifying(emptyContent)
    expect(m.beauty).toBe(0)
  })

  it('returns low beauty for minimal content', () => {
    const m = measureBeautifying(minimalContent)
    expect(m.beauty).toBeLessThan(20)
  })

  it('returns moderate beauty for moderate content', () => {
    const m = measureBeautifying(moderateContent)
    expect(m.beauty).toBeGreaterThanOrEqual(40)
    expect(m.beauty).toBeLessThan(80)
  })

  it('returns high beauty for rich content', () => {
    const m = measureBeautifying(richContent)
    expect(m.beauty).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureBeautifying(emptyContent)
    expect(m.aurora).toBe('no-aurora')
  })

  it('detects hasElegant for rich content', () => {
    const m = measureBeautifying(richContent)
    expect(m.hasElegant).toBe(true)
  })

  it('detects hasNoUgly for clean content', () => {
    const m = measureBeautifying(richContent)
    expect(m.hasNoUgly).toBe(true)
  })

  it('caps beauty at 100', () => {
    const m = measureBeautifying(richContent)
    expect(m.beauty).toBeLessThanOrEqual(100)
  })
})

// ─── classifyCrystalCondition ──────────────────────────────────────

describe('classifyCrystalCondition', () => {
  it('classifies frost-masterpiece for 85+', () => {
    expect(classifyCrystalCondition(90)).toBe('frost-masterpiece')
  })

  it('classifies ice-cathedral for 70-84', () => {
    expect(classifyCrystalCondition(75)).toBe('ice-cathedral')
  })

  it('classifies proper-glacier for 55-69', () => {
    expect(classifyCrystalCondition(60)).toBe('proper-glacier')
  })

  it('classifies melting-ice for 40-54', () => {
    expect(classifyCrystalCondition(45)).toBe('melting-ice')
  })

  it('classifies slush for 25-39', () => {
    expect(classifyCrystalCondition(30)).toBe('slush')
  })

  it('classifies puddle for <25', () => {
    expect(classifyCrystalCondition(10)).toBe('puddle')
  })

  it('classifies puddle for 0', () => {
    expect(classifyCrystalCondition(0)).toBe('puddle')
  })
})

// ─── classifyGuardianGrade ─────────────────────────────────────────

describe('classifyGuardianGrade', () => {
  it('classifies frost-guardian for 80+', () => {
    expect(classifyGuardianGrade(85)).toBe('frost-guardian')
  })

  it('classifies ice-keeper for 65-79', () => {
    expect(classifyGuardianGrade(70)).toBe('ice-keeper')
  })

  it('classifies skilled-steward for 50-64', () => {
    expect(classifyGuardianGrade(55)).toBe('skilled-steward')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyGuardianGrade(40)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyGuardianGrade(25)).toBe('novice')
  })

  it('classifies thawer for <20', () => {
    expect(classifyGuardianGrade(10)).toBe('thawer')
  })
})

// ─── classifyHallType ──────────────────────────────────────────────

describe('classifyHallType', () => {
  it('returns no-hall for empty crystals', () => {
    expect(classifyHallType([])).toBe('no-hall')
  })

  it('returns ice-cathedral for high quality crystals', () => {
    const crystals: IceCrystal[] = [
      { file: 'a.ts', crystalPreservation: 90, iceClarity: 90, permafrostStability: 90, frostResilience: 90, auroraBeauty: 90, preserving: {} as any, clarifying: {} as any, stabilizing: {} as any, enduring: {} as any, beautifying: {} as any, condition: 'frost-masterpiece', qualityScore: 90 },
      { file: 'b.ts', crystalPreservation: 95, iceClarity: 95, permafrostStability: 95, frostResilience: 95, auroraBeauty: 95, preserving: {} as any, clarifying: {} as any, stabilizing: {} as any, enduring: {} as any, beautifying: {} as any, condition: 'frost-masterpiece', qualityScore: 95 },
    ]
    expect(classifyHallType(crystals)).toBe('ice-cathedral')
  })

  it('returns no-hall for very low quality', () => {
    const crystals: IceCrystal[] = [
      { file: 'a.ts', crystalPreservation: 5, iceClarity: 5, permafrostStability: 5, frostResilience: 5, auroraBeauty: 5, preserving: {} as any, clarifying: {} as any, stabilizing: {} as any, enduring: {} as any, beautifying: {} as any, condition: 'puddle', qualityScore: 5 },
    ]
    expect(classifyHallType(crystals)).toBe('no-hall')
  })
})

// ─── classifyHallCondition ─────────────────────────────────────────

describe('classifyHallCondition', () => {
  it('classifies eternal-sanctuary for 75+', () => {
    expect(classifyHallCondition(80)).toBe('eternal-sanctuary')
  })

  it('classifies void for <15', () => {
    expect(classifyHallCondition(10)).toBe('void')
  })

  it('classifies frost-palace for 60-74', () => {
    expect(classifyHallCondition(65)).toBe('frost-palace')
  })

  it('classifies decent-shelter for 45-59', () => {
    expect(classifyHallCondition(50)).toBe('decent-shelter')
  })

  it('classifies melting-cave for 30-44', () => {
    expect(classifyHallCondition(35)).toBe('melting-cave')
  })

  it('classifies slush-pit for 15-29', () => {
    expect(classifyHallCondition(20)).toBe('slush-pit')
  })
})

// ─── analyzeIceCrystal ─────────────────────────────────────────────

describe('analyzeIceCrystal', () => {
  it('returns correct file path', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    expect(crystal.file).toBe('test.ts')
  })

  it('computes qualityScore as weighted average', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    const expected = Math.round(
      measurePreserving(richContent).preservation * 0.2 +
      measureClarifying(richContent).clarity * 0.2 +
      measureStabilizing(richContent).stability * 0.2 +
      measureEnduring(richContent).resilience * 0.2 +
      measureBeautifying(richContent).beauty * 0.2,
    )
    expect(crystal.qualityScore).toBe(expected)
  })

  it('classifies rich content as frost-masterpiece', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    expect(crystal.condition).toBe('frost-masterpiece')
  })

  it('classifies minimal content as puddle', () => {
    const crystal = analyzeIceCrystal(minimalContent, 'test.ts')
    expect(crystal.condition).toBe('puddle')
  })

  it('classifies empty content as puddle', () => {
    const crystal = analyzeIceCrystal(emptyContent, 'test.ts')
    expect(crystal.condition).toBe('puddle')
  })

  it('stores crystalPreservation from preserving', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    expect(crystal.crystalPreservation).toBe(measurePreserving(richContent).preservation)
  })

  it('stores iceClarity from clarifying', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    expect(crystal.iceClarity).toBe(measureClarifying(richContent).clarity)
  })

  it('stores permafrostStability from stabilizing', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    expect(crystal.permafrostStability).toBe(measureStabilizing(richContent).stability)
  })

  it('stores frostResilience from enduring', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    expect(crystal.frostResilience).toBe(measureEnduring(richContent).resilience)
  })

  it('stores auroraBeauty from beautifying', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    expect(crystal.auroraBeauty).toBe(measureBeautifying(richContent).beauty)
  })
})

// ─── analyzeGlacierHall ────────────────────────────────────────────

describe('analyzeGlacierHall', () => {
  it('returns empty hall for no crystals', () => {
    const hall = analyzeGlacierHall([], '/empty')
    expect(hall.directory).toBe('/empty')
    expect(hall.crystals).toHaveLength(0)
    expect(hall.avgPreservation).toBe(0)
    expect(hall.hallType).toBe('no-hall')
    expect(hall.condition).toBe('void')
  })

  it('computes avgPreservation correctly', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    const hall = analyzeGlacierHall([crystal], '/src')
    expect(hall.avgPreservation).toBe(crystal.crystalPreservation)
  })

  it('counts frostMasterpieceCount', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    const hall = analyzeGlacierHall([crystal], '/src')
    expect(hall.frostMasterpieceCount).toBe(1)
  })

  it('counts puddleCount', () => {
    const crystal = analyzeIceCrystal(minimalContent, 'test.ts')
    const hall = analyzeGlacierHall([crystal], '/src')
    expect(hall.puddleCount).toBe(1)
  })

  it('returns ice-cathedral for frost-masterpiece crystals', () => {
    const c1 = analyzeIceCrystal(richContent, 'a.ts')
    const c2 = analyzeIceCrystal(richContent, 'b.ts')
    const hall = analyzeGlacierHall([c1, c2], '/src')
    expect(hall.hallType).toBe('ice-cathedral')
  })
})

// ─── buildFrostSanctuaryResult ─────────────────────────────────────

describe('buildFrostSanctuaryResult', () => {
  it('returns crystals for each file', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.crystals).toHaveLength(2)
  })

  it('returns halls grouped by directory', async () => {
    const result = await buildFrostSanctuaryResult(
      ['/src/a.ts', '/src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.halls).toHaveLength(1)
    expect(result.halls[0]!.directory).toBe('/src')
  })

  it('returns multiple halls for different directories', async () => {
    const result = await buildFrostSanctuaryResult(
      ['/src/a.ts', '/lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.halls).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalHalls).toBe(1)
  })

  it('computes arctic correctly', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.arctic.isFrozen).toBe(true)
    expect(result.arctic.overallFrost).toBeGreaterThan(0)
  })

  it('computes bestCrystal correctly', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestCrystal).toBe('a.ts')
  })

  it('computes bestPreserved correctly', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestPreserved).toBe('a.ts')
  })

  it('computes clearest correctly', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.clearest).toBe('a.ts')
  })

  it('computes mostStable correctly', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.mostStable).toBe('a.ts')
  })

  it('computes mostBeautiful correctly', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.mostBeautiful).toBe('a.ts')
  })

  it('computes frostMasterpieceCount in stats', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.frostMasterpieceCount).toBe(1)
  })

  it('computes puddleCount in stats', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.stats.puddleCount).toBe(2)
  })

  it('computes hasHighPreservationCount', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.hasHighPreservationCount).toBe(1)
  })

  it('computes guardianGrade for rich content', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.guardianGrade).toBe('frost-guardian')
  })

  it('computes guardianGrade for minimal content', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts'],
      [minimalContent],
    )
    expect(result.stats.guardianGrade).toBe('thawer')
  })

  it('generates recommendations', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('generates positive recommendation for all-rich', async () => {
    const result = await buildFrostSanctuaryResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.recommendations).toContain(
      'The frost sanctuary stands eternal! Every crystal gleams with preservation, clarity, stability, resilience, and beauty',
    )
  })

  it('handles empty file list', async () => {
    const result = await buildFrostSanctuaryResult([], [])
    expect(result.crystals).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFrost).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving crystal preservation when low', () => {
    const stats = {
      avgCrystalPreservation: 30, avgIceClarity: 80, avgPermafrostStability: 80,
      avgFrostResilience: 80, avgAuroraBeauty: 80, puddleCount: 0,
    } as unknown as FrostSanctuaryStats
    const recs = generateRecommendations([], [], {} as FrostArctic, stats)
    expect(recs.some(r => r.includes('crystal preservation'))).toBe(true)
  })

  it('recommends improving ice clarity when low', () => {
    const stats = {
      avgCrystalPreservation: 80, avgIceClarity: 30, avgPermafrostStability: 80,
      avgFrostResilience: 80, avgAuroraBeauty: 80, puddleCount: 0,
    } as unknown as FrostSanctuaryStats
    const recs = generateRecommendations([], [], {} as FrostArctic, stats)
    expect(recs.some(r => r.includes('ice clarity'))).toBe(true)
  })

  it('recommends improving permafrost stability when low', () => {
    const stats = {
      avgCrystalPreservation: 80, avgIceClarity: 80, avgPermafrostStability: 30,
      avgFrostResilience: 80, avgAuroraBeauty: 80, puddleCount: 0,
    } as unknown as FrostSanctuaryStats
    const recs = generateRecommendations([], [], {} as FrostArctic, stats)
    expect(recs.some(r => r.includes('permafrost stability'))).toBe(true)
  })

  it('recommends improving frost resilience when low', () => {
    const stats = {
      avgCrystalPreservation: 80, avgIceClarity: 80, avgPermafrostStability: 80,
      avgFrostResilience: 30, avgAuroraBeauty: 80, puddleCount: 0,
    } as unknown as FrostSanctuaryStats
    const recs = generateRecommendations([], [], {} as FrostArctic, stats)
    expect(recs.some(r => r.includes('frost resilience'))).toBe(true)
  })

  it('recommends improving aurora beauty when low', () => {
    const stats = {
      avgCrystalPreservation: 80, avgIceClarity: 80, avgPermafrostStability: 80,
      avgFrostResilience: 80, avgAuroraBeauty: 30, puddleCount: 0,
    } as unknown as FrostSanctuaryStats
    const recs = generateRecommendations([], [], {} as FrostArctic, stats)
    expect(recs.some(r => r.includes('aurora beauty'))).toBe(true)
  })

  it('mentions puddle files', () => {
    const stats = {
      avgCrystalPreservation: 80, avgIceClarity: 80, avgPermafrostStability: 80,
      avgFrostResilience: 80, avgAuroraBeauty: 80, puddleCount: 3,
    } as unknown as FrostSanctuaryStats
    const recs = generateRecommendations([], [], {} as FrostArctic, stats)
    expect(recs.some(r => r.includes('puddle'))).toBe(true)
  })

  it('recommends overall frost improvement when low', () => {
    const arctic: FrostArctic = { avgPreservation: 80, avgClarity: 80, avgStability: 80, isFrozen: true, overallFrost: 30 }
    const stats = {
      avgCrystalPreservation: 80, avgIceClarity: 80, avgPermafrostStability: 80,
      avgFrostResilience: 80, avgAuroraBeauty: 80, puddleCount: 0,
    } as unknown as FrostSanctuaryStats
    const recs = generateRecommendations([], [], arctic, stats)
    expect(recs.some(r => r.includes('Overall frost'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('handles 0', () => {
    expect(typeof colorScore(0)).toBe('string')
  })

  it('handles 100', () => {
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('colors frost-masterpiece as best', () => {
    expect(typeof colorGrade('frost-masterpiece')).toBe('string')
  })

  it('colors puddle as worst', () => {
    expect(typeof colorGrade('puddle')).toBe('string')
  })

  it('colors unknown grade with fallback', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })

  it('colors eternal-ice', () => {
    expect(typeof colorGrade('eternal-ice')).toBe('string')
  })

  it('colors frost-guardian', () => {
    expect(typeof colorGrade('frost-guardian')).toBe('string')
  })

  it('colors eternal-sanctuary', () => {
    expect(typeof colorGrade('eternal-sanctuary')).toBe('string')
  })
})

describe('formatCrystalTable', () => {
  it('formats a single crystal', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    const output = formatCrystalTable(crystal)
    expect(output).toContain('test.ts')
    expect(output).toContain('Crystal Preservation')
    expect(output).toContain('Ice Clarity')
    expect(output).toContain('Permafrost Stability')
    expect(output).toContain('Frost Resilience')
    expect(output).toContain('Aurora Beauty')
    expect(output).toContain('Score')
  })
})

describe('formatCrystalsTable', () => {
  it('formats multiple crystals', () => {
    const crystals = [
      analyzeIceCrystal(richContent, 'a.ts'),
      analyzeIceCrystal(moderateContent, 'b.ts'),
    ]
    const output = formatCrystalsTable(crystals)
    expect(output).toContain('Frost Sanctuary Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('returns message for empty crystals', () => {
    const output = formatCrystalsTable([])
    expect(output).toContain('No ice crystals found')
  })
})

describe('formatHallTable', () => {
  it('formats a hall', () => {
    const crystal = analyzeIceCrystal(richContent, 'test.ts')
    const hall = analyzeGlacierHall([crystal], '/src')
    const output = formatHallTable(hall)
    expect(output).toContain('/src')
    expect(output).toContain('Hall:')
    expect(output).toContain('Type:')
    expect(output).toContain('Avg Preservation')
  })
})

describe('formatHallsTable', () => {
  it('returns message for empty halls', () => {
    const output = formatHallsTable([])
    expect(output).toContain('No glacier halls found')
  })

  it('formats multiple halls', () => {
    const c1 = analyzeIceCrystal(richContent, 'a.ts')
    const c2 = analyzeIceCrystal(moderateContent, 'b.ts')
    const h1 = analyzeGlacierHall([c1], '/src')
    const h2 = analyzeGlacierHall([c2], '/lib')
    const output = formatHallsTable([h1, h2])
    expect(output).toContain('Glacier Halls')
    expect(output).toContain('/src')
    expect(output).toContain('/lib')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildFrostSanctuaryResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Frost Sanctuary Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Frost')
    expect(output).toContain('Guardian Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations list', () => {
    const output = formatRecommendations(['Rec 1', 'Rec 2'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Rec 1')
    expect(output).toContain('Rec 2')
  })

  it('returns message for empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildFrostSanctuaryResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Frost Sanctuary Analysis')
    expect(output).toContain('Glacier Halls')
    expect(output).toContain('Frost Sanctuary Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildFrostSanctuaryResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.crystals).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Score computation consistency ─────────────────────────────────

describe('score consistency', () => {
  it('minimalContent: preserving score matches expected', () => {
    const m = measurePreserving(minimalContent)
    expect(m.preservation).toBe(6)
  })

  it('minimalContent: clarifying score matches expected', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(6)
  })

  it('minimalContent: stabilizing score matches expected', () => {
    const m = measureStabilizing(minimalContent)
    expect(m.stability).toBe(6)
  })

  it('minimalContent: enduring score matches expected', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBe(12)
  })

  it('minimalContent: beautifying score matches expected', () => {
    const m = measureBeautifying(minimalContent)
    expect(m.beauty).toBe(6)
  })

  it('minimalContent: qualityScore matches expected', () => {
    const crystal = analyzeIceCrystal(minimalContent, 'test.ts')
    expect(crystal.qualityScore).toBe(Math.round((6 + 6 + 6 + 12 + 6) * 0.2))
  })

  it('emptyContent: all scores are 0', () => {
    const crystal = analyzeIceCrystal(emptyContent, 'test.ts')
    expect(crystal.crystalPreservation).toBe(0)
    expect(crystal.iceClarity).toBe(0)
    expect(crystal.permafrostStability).toBe(0)
    expect(crystal.frostResilience).toBe(0)
    expect(crystal.auroraBeauty).toBe(0)
    expect(crystal.qualityScore).toBe(0)
  })

  it('richContent: all measures capped at 100', () => {
    const p = measurePreserving(richContent)
    const cl = measureClarifying(richContent)
    const s = measureStabilizing(richContent)
    const e = measureEnduring(richContent)
    const b = measureBeautifying(richContent)
    expect(p.preservation).toBeLessThanOrEqual(100)
    expect(cl.clarity).toBeLessThanOrEqual(100)
    expect(s.stability).toBeLessThanOrEqual(100)
    expect(e.resilience).toBeLessThanOrEqual(100)
    expect(b.beauty).toBeLessThanOrEqual(100)
  })

  it('moderateContent: enduring has conditional + strictEq but no try/catch', () => {
    const m = measureEnduring(moderateContent)
    expect(m.hasEdgeCaseCoverage).toBe(true)
    expect(m.hasErrorHandling).toBe(false)
    expect(m.resilience).toBeGreaterThan(20)
  })
})
