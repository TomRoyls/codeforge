import { describe, it, expect } from 'vitest'
import {
  measureAging,
  measureConducting,
  measureBeautifying,
  measureAlloying,
  measureStabilizing,
  classifyShingleCondition,
  classifyTowerType,
  classifyTowerCondition,
  classifyArchitectGrade,
  analyzeCopperShingle,
  analyzeSpireTower,
  buildCopperSpireResult,
  generateRecommendations,
} from '../src/commands/copper-spire-helpers.js'
import {
  colorScore,
  colorGrade,
  formatShingleTable,
  formatShinglesTable,
  formatTowerTable,
  formatTowersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/copper-spire-format-helpers.js'
import type { CopperShingle, CopperSpireStats, CopperSkyline, SpireTower } from '../src/commands/copper-spire-helpers.js'

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

// ─── measureAging ──────────────────────────────────────────────────

describe('measureAging', () => {
  it('returns 0 wisdom for empty content', () => {
    const m = measureAging(emptyContent)
    expect(m.wisdom).toBe(0)
  })

  it('returns low wisdom for minimal content', () => {
    const m = measureAging(minimalContent)
    expect(m.wisdom).toBeLessThan(20)
  })

  it('returns moderate wisdom for moderate content', () => {
    const m = measureAging(moderateContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(40)
    expect(m.wisdom).toBeLessThan(80)
  })

  it('returns high wisdom for rich content', () => {
    const m = measureAging(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureAging(emptyContent).grade).toBe('no-patina')
  })

  it('has correct grade for rich content', () => {
    expect(measureAging(richContent).grade).toBe('ancient-patina')
  })

  it('has correct grade for moderate content', () => {
    expect(measureAging(moderateContent).grade).toBe('premature-wear')
  })

  it('detects iteration in rich content', () => {
    expect(measureAging(richContent).hasIterated).toBe(true)
  })

  it('detects refactoring in rich content', () => {
    expect(measureAging(richContent).hasRefactored).toBe(true)
  })

  it('has no first drafts in clean content', () => {
    const m = measureAging(richContent)
    expect(m.hasNoFirstDraft).toBe(true)
    expect(m.firstDraftCount).toBe(0)
  })

  it('detects high wisdom flag', () => {
    expect(measureAging(richContent).hasHighWisdom).toBe(true)
  })

  it('does not flag high wisdom for minimal content', () => {
    expect(measureAging(minimalContent).hasHighWisdom).toBe(false)
  })

  it('caps wisdom at 100', () => {
    expect(measureAging(richContent).wisdom).toBeLessThanOrEqual(100)
  })
})

// ─── measureConducting ─────────────────────────────────────────────

describe('measureConducting', () => {
  it('returns 0 quality for empty content', () => {
    expect(measureConducting(emptyContent).quality).toBe(0)
  })

  it('returns moderate quality for moderate content', () => {
    const m = measureConducting(moderateContent)
    expect(m.quality).toBeGreaterThanOrEqual(40)
    expect(m.quality).toBeLessThan(80)
  })

  it('returns high quality for rich content', () => {
    expect(measureConducting(richContent).quality).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureConducting(emptyContent).conductivity).toBe('no-conductivity')
  })

  it('has correct grade for rich content', () => {
    expect(measureConducting(richContent).conductivity).toBe('superconductor')
  })

  it('detects efficient flow in rich content', () => {
    expect(measureConducting(richContent).hasEfficientFlow).toBe(true)
  })

  it('detects direct paths in rich content', () => {
    expect(measureConducting(richContent).hasDirectPaths).toBe(true)
  })

  it('has no bottlenecks in clean content', () => {
    const m = measureConducting(richContent)
    expect(m.hasNoBottlenecks).toBe(true)
    expect(m.bottleneckCount).toBe(0)
  })

  it('detects high quality flag', () => {
    expect(measureConducting(richContent).hasHighQuality).toBe(true)
  })

  it('caps quality at 100', () => {
    expect(measureConducting(richContent).quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureBeautifying ────────────────────────────────────────────

describe('measureBeautifying', () => {
  it('returns 0 beauty for empty content', () => {
    expect(measureBeautifying(emptyContent).beauty).toBe(0)
  })

  it('returns high beauty for rich content', () => {
    expect(measureBeautifying(richContent).beauty).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureBeautifying(emptyContent).verdigris).toBe('no-beauty')
  })

  it('has correct grade for rich content', () => {
    expect(measureBeautifying(richContent).verdigris).toBe('stunning-patina')
  })

  it('detects elegant in rich content', () => {
    expect(measureBeautifying(richContent).hasElegant).toBe(true)
  })

  it('detects readable in rich content', () => {
    expect(measureBeautifying(richContent).hasReadable).toBe(true)
  })

  it('has no ugly in clean content', () => {
    const m = measureBeautifying(richContent)
    expect(m.hasNoUgly).toBe(true)
    expect(m.uglyCount).toBe(0)
  })

  it('detects high beauty flag', () => {
    expect(measureBeautifying(richContent).hasHighBeauty).toBe(true)
  })

  it('caps beauty at 100', () => {
    expect(measureBeautifying(richContent).beauty).toBeLessThanOrEqual(100)
  })
})

// ─── measureAlloying ───────────────────────────────────────────────

describe('measureAlloying', () => {
  it('returns 0 resilience for empty content', () => {
    expect(measureAlloying(emptyContent).resilience).toBe(0)
  })

  it('returns high resilience for rich content', () => {
    expect(measureAlloying(richContent).resilience).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureAlloying(emptyContent).alloy).toBe('no-alloy')
  })

  it('has correct grade for rich content', () => {
    expect(measureAlloying(richContent).alloy).toBe('bronze-masterpiece')
  })

  it('detects well integrated in rich content', () => {
    expect(measureAlloying(richContent).hasWellIntegrated).toBe(true)
  })

  it('detects clean interfaces in rich content', () => {
    expect(measureAlloying(richContent).hasCleanInterfaces).toBe(true)
  })

  it('has no leaky abstractions in clean content', () => {
    const m = measureAlloying(richContent)
    expect(m.hasNoLeakyAbstractions).toBe(true)
    expect(m.leakyAbstractionCount).toBe(0)
  })

  it('detects high resilience flag', () => {
    expect(measureAlloying(richContent).hasHighResilience).toBe(true)
  })

  it('caps resilience at 100', () => {
    expect(measureAlloying(richContent).resilience).toBeLessThanOrEqual(100)
  })
})

// ─── measureStabilizing ────────────────────────────────────────────

describe('measureStabilizing', () => {
  it('returns 0 stability for empty content', () => {
    expect(measureStabilizing(emptyContent).stability).toBe(0)
  })

  it('returns high stability for rich content', () => {
    expect(measureStabilizing(richContent).stability).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureStabilizing(emptyContent).tower).toBe('no-stability')
  })

  it('has correct grade for rich content', () => {
    expect(measureStabilizing(richContent).tower).toBe('century-tower')
  })

  it('detects type safe in rich content', () => {
    expect(measureStabilizing(richContent).hasTypeSafe).toBe(true)
  })

  it('detects documented in rich content', () => {
    expect(measureStabilizing(richContent).hasDocumented).toBe(true)
  })

  it('has no untested in clean content', () => {
    const m = measureStabilizing(richContent)
    expect(m.hasNoUntested).toBe(true)
    expect(m.untestedCount).toBe(0)
  })

  it('detects high stability flag', () => {
    expect(measureStabilizing(richContent).hasHighStability).toBe(true)
  })

  it('caps stability at 100', () => {
    expect(measureStabilizing(richContent).stability).toBeLessThanOrEqual(100)
  })
})

// ─── Classifications ───────────────────────────────────────────────

describe('classifyShingleCondition', () => {
  it('classifies 90 as cathedral-spire', () => {
    expect(classifyShingleCondition(90)).toBe('cathedral-spire')
  })
  it('classifies 75 as patina-tower', () => {
    expect(classifyShingleCondition(75)).toBe('patina-tower')
  })
  it('classifies 60 as proper-spire', () => {
    expect(classifyShingleCondition(60)).toBe('proper-spire')
  })
  it('classifies 45 as rusty-pole', () => {
    expect(classifyShingleCondition(45)).toBe('rusty-pole')
  })
  it('classifies 30 as corroded-wire', () => {
    expect(classifyShingleCondition(30)).toBe('corroded-wire')
  })
  it('classifies 10 as scrap', () => {
    expect(classifyShingleCondition(10)).toBe('scrap')
  })
})

describe('classifyTowerCondition', () => {
  it('classifies 80 as magnificent-spire', () => {
    expect(classifyTowerCondition(80)).toBe('magnificent-spire')
  })
  it('classifies 65 as beautiful-tower', () => {
    expect(classifyTowerCondition(65)).toBe('beautiful-tower')
  })
  it('classifies 50 as decent-steeple', () => {
    expect(classifyTowerCondition(50)).toBe('decent-steeple')
  })
  it('classifies 35 as weathered-pole', () => {
    expect(classifyTowerCondition(35)).toBe('weathered-pole')
  })
  it('classifies 20 as fallen-spire', () => {
    expect(classifyTowerCondition(20)).toBe('fallen-spire')
  })
  it('classifies 5 as void', () => {
    expect(classifyTowerCondition(5)).toBe('void')
  })
})

describe('classifyArchitectGrade', () => {
  it('classifies 85 as master-architect', () => {
    expect(classifyArchitectGrade(85)).toBe('master-architect')
  })
  it('classifies 70 as tower-builder', () => {
    expect(classifyArchitectGrade(70)).toBe('tower-builder')
  })
  it('classifies 55 as skilled-craftsman', () => {
    expect(classifyArchitectGrade(55)).toBe('skilled-craftsman')
  })
  it('classifies 40 as apprentice', () => {
    expect(classifyArchitectGrade(40)).toBe('apprentice')
  })
  it('classifies 25 as novice', () => {
    expect(classifyArchitectGrade(25)).toBe('novice')
  })
  it('classifies 10 as scrap-dealer', () => {
    expect(classifyArchitectGrade(10)).toBe('scrap-dealer')
  })
})

// ─── analyzeCopperShingle ──────────────────────────────────────────

describe('analyzeCopperShingle', () => {
  it('returns correct file path', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    expect(sh.file).toBe('test.ts')
  })

  it('computes quality score for rich content', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    expect(sh.qualityScore).toBeGreaterThanOrEqual(80)
  })

  it('classifies rich content as cathedral-spire', () => {
    expect(analyzeCopperShingle(richContent, 'test.ts').condition).toBe('cathedral-spire')
  })

  it('computes correct measures for empty content', () => {
    const sh = analyzeCopperShingle(emptyContent, 'empty.ts')
    expect(sh.patinaWisdom).toBe(0)
    expect(sh.conductivityQuality).toBe(0)
    expect(sh.verdigrisBeauty).toBe(0)
    expect(sh.alloyResilience).toBe(0)
    expect(sh.towerStability).toBe(0)
    expect(sh.qualityScore).toBe(0)
    expect(sh.condition).toBe('scrap')
  })

  it('computes expected minimal content scores', () => {
    const sh = analyzeCopperShingle(minimalContent, 'minimal.ts')
    expect(sh.patinaWisdom).toBe(6)
    expect(sh.conductivityQuality).toBe(8)
    expect(sh.verdigrisBeauty).toBe(8)
    expect(sh.alloyResilience).toBe(6)
    expect(sh.towerStability).toBe(6)
    expect(sh.qualityScore).toBe(7)
    expect(sh.condition).toBe('scrap')
  })

  it('computes expected moderate content scores', () => {
    const sh = analyzeCopperShingle(moderateContent, 'moderate.ts')
    expect(sh.patinaWisdom).toBe(52)
    expect(sh.conductivityQuality).toBe(59)
    expect(sh.verdigrisBeauty).toBe(63)
    expect(sh.alloyResilience).toBe(52)
    expect(sh.towerStability).toBe(54)
    expect(sh.qualityScore).toBe(56)
    expect(sh.condition).toBe('proper-spire')
  })

  it('computes expected rich content scores', () => {
    const sh = analyzeCopperShingle(richContent, 'rich.ts')
    expect(sh.patinaWisdom).toBe(100)
    expect(sh.conductivityQuality).toBe(93)
    expect(sh.verdigrisBeauty).toBe(100)
    expect(sh.alloyResilience).toBe(100)
    expect(sh.towerStability).toBe(100)
    expect(sh.qualityScore).toBe(99)
    expect(sh.condition).toBe('cathedral-spire')
  })

  it('includes aging measure details', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    expect(sh.aging.hasIterated).toBe(true)
    expect(sh.aging.hasRefactored).toBe(true)
    expect(sh.aging.hasPolished).toBe(true)
  })

  it('includes conducting measure details', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    expect(sh.conducting.hasEfficientFlow).toBe(true)
    expect(sh.conducting.hasDirectPaths).toBe(true)
  })

  it('includes beautifying measure details', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    expect(sh.beautifying.hasElegant).toBe(true)
    expect(sh.beautifying.hasReadable).toBe(true)
  })

  it('includes alloying measure details', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    expect(sh.alloying.hasWellIntegrated).toBe(true)
    expect(sh.alloying.hasCleanInterfaces).toBe(true)
  })

  it('includes stabilizing measure details', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    expect(sh.stabilizing.hasTypeSafe).toBe(true)
    expect(sh.stabilizing.hasDocumented).toBe(true)
  })
})

// ─── analyzeSpireTower ─────────────────────────────────────────────

describe('analyzeSpireTower', () => {
  it('returns no-tower for empty shingles', () => {
    const t = analyzeSpireTower([], 'src')
    expect(t.towerType).toBe('no-tower')
    expect(t.condition).toBe('void')
    expect(t.shingles).toHaveLength(0)
  })

  it('returns correct directory', () => {
    const shingles = [analyzeCopperShingle(richContent, 'src/a.ts')]
    expect(analyzeSpireTower(shingles, 'src').directory).toBe('src')
  })

  it('computes averages from shingles', () => {
    const shingles = [analyzeCopperShingle(richContent, 'src/a.ts')]
    const t = analyzeSpireTower(shingles, 'src')
    expect(t.avgWisdom).toBe(100)
    expect(t.avgConductivity).toBe(93)
    expect(t.avgStability).toBe(100)
  })

  it('counts cathedral spire files', () => {
    const shingles = [analyzeCopperShingle(richContent, 'src/a.ts')]
    expect(analyzeSpireTower(shingles, 'src').cathedralSpireCount).toBe(1)
  })

  it('classifies rich content tower as grand-cathedral', () => {
    const shingles = [analyzeCopperShingle(richContent, 'src/a.ts')]
    const t = analyzeSpireTower(shingles, 'src')
    expect(t.towerType).toBe('grand-cathedral')
    expect(t.condition).toBe('magnificent-spire')
  })

  it('averages across multiple shingles', () => {
    const p1 = analyzeCopperShingle(richContent, 'src/a.ts')
    const p2 = analyzeCopperShingle(minimalContent, 'src/b.ts')
    const t = analyzeSpireTower([p1, p2], 'src')
    expect(t.avgWisdom).toBe(Math.round((100 + 6) / 2))
  })
})

// ─── classifyTowerType ─────────────────────────────────────────────

describe('classifyTowerType', () => {
  it('returns no-tower for empty array', () => {
    expect(classifyTowerType([])).toBe('no-tower')
  })

  it('returns grand-cathedral for all cathedral-spire with high avg', () => {
    const shingles = [analyzeCopperShingle(richContent, 'a.ts'), analyzeCopperShingle(richContent, 'b.ts')]
    expect(classifyTowerType(shingles)).toBe('grand-cathedral')
  })
})

// ─── buildCopperSpireResult ────────────────────────────────────────

describe('buildCopperSpireResult', () => {
  it('handles empty input', async () => {
    const result = await buildCopperSpireResult([], [])
    expect(result.shingles).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.architectGrade).toBe('scrap-dealer')
  })

  it('processes single file', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    expect(result.shingles).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('computes stats for rich content', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    expect(result.stats.avgPatinaWisdom).toBe(100)
    expect(result.stats.avgConductivityQuality).toBe(93)
    expect(result.stats.avgVerdigrisBeauty).toBe(100)
    expect(result.stats.avgAlloyResilience).toBe(100)
    expect(result.stats.avgTowerStability).toBe(100)
    expect(result.stats.cathedralSpireCount).toBe(1)
  })

  it('computes skyline for rich content', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    expect(result.skyline.avgWisdom).toBe(100)
    expect(result.skyline.avgConductivity).toBe(93)
    expect(result.skyline.isMagnificent).toBe(true)
    expect(result.skyline.overallElegance).toBe(98)
  })

  it('identifies best shingle', async () => {
    const result = await buildCopperSpireResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestShingle).toBe('good.ts')
  })

  it('identifies wisest', async () => {
    const result = await buildCopperSpireResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.wisest).toBe('high.ts')
  })

  it('identifies best conductor', async () => {
    const result = await buildCopperSpireResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestConductor).toBe('high.ts')
  })

  it('identifies most beautiful', async () => {
    const result = await buildCopperSpireResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.mostBeautiful).toBe('high.ts')
  })

  it('identifies most stable', async () => {
    const result = await buildCopperSpireResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.mostStable).toBe('high.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildCopperSpireResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.towers.length).toBeGreaterThanOrEqual(2)
  })

  it('counts high measure flags', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    expect(result.stats.hasHighWisdomCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighBeautyCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
    expect(result.stats.hasHighStabilityCount).toBe(1)
  })

  it('classifies architect grade for rich content', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    expect(result.stats.architectGrade).toBe('master-architect')
  })

  it('computes overall elegance correctly', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    expect(result.stats.overallElegance).toBe(98)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for healthy codebase', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    const t = analyzeSpireTower([sh], 'src')
    const skyline: CopperSkyline = { avgWisdom: 100, avgConductivity: 93, avgStability: 100, isMagnificent: true, overallElegance: 98 }
    const stats: CopperSpireStats = {
      totalFiles: 1, totalTowers: 1,
      avgPatinaWisdom: 100, avgConductivityQuality: 93, avgVerdigrisBeauty: 100,
      avgAlloyResilience: 100, avgTowerStability: 100,
      cathedralSpireCount: 1, patinaTowerCount: 0, properSpireCount: 0,
      rustyPoleCount: 0, corrodedWireCount: 0, scrapCount: 0,
      hasHighWisdomCount: 1, hasHighQualityCount: 1, hasHighBeautyCount: 1,
      hasHighResilienceCount: 1, hasHighStabilityCount: 1,
      overallElegance: 98, architectGrade: 'master-architect',
      bestShingle: 'test.ts', wisest: 'test.ts', bestConductor: 'test.ts',
      mostBeautiful: 'test.ts', mostStable: 'test.ts',
    }
    const recs = generateRecommendations([sh], [t], skyline, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('magnificently')
  })

  it('recommends improving patina wisdom when low', () => {
    const sh = analyzeCopperShingle(minimalContent, 'test.ts')
    const t = analyzeSpireTower([sh], 'src')
    const skyline: CopperSkyline = { avgWisdom: 6, avgConductivity: 16, avgStability: 6, isMagnificent: false, overallElegance: 9 }
    const stats: CopperSpireStats = {
      totalFiles: 1, totalTowers: 1,
      avgPatinaWisdom: 6, avgConductivityQuality: 16, avgVerdigrisBeauty: 8,
      avgAlloyResilience: 12, avgTowerStability: 6,
      cathedralSpireCount: 0, patinaTowerCount: 0, properSpireCount: 0,
      rustyPoleCount: 0, corrodedWireCount: 0, scrapCount: 1,
      hasHighWisdomCount: 0, hasHighQualityCount: 0, hasHighBeautyCount: 0,
      hasHighResilienceCount: 0, hasHighStabilityCount: 0,
      overallElegance: 9, architectGrade: 'scrap-dealer',
      bestShingle: 'test.ts', wisest: 'test.ts', bestConductor: 'test.ts',
      mostBeautiful: 'test.ts', mostStable: 'test.ts',
    }
    const recs = generateRecommendations([sh], [t], skyline, stats)
    expect(recs.some(r => r.includes('patina wisdom'))).toBe(true)
  })

  it('warns about scrap files', () => {
    const sh = analyzeCopperShingle(minimalContent, 'test.ts')
    const t = analyzeSpireTower([sh], 'src')
    const skyline: CopperSkyline = { avgWisdom: 6, avgConductivity: 16, avgStability: 6, isMagnificent: false, overallElegance: 9 }
    const stats: CopperSpireStats = {
      totalFiles: 1, totalTowers: 1,
      avgPatinaWisdom: 6, avgConductivityQuality: 16, avgVerdigrisBeauty: 8,
      avgAlloyResilience: 12, avgTowerStability: 6,
      cathedralSpireCount: 0, patinaTowerCount: 0, properSpireCount: 0,
      rustyPoleCount: 0, corrodedWireCount: 0, scrapCount: 1,
      hasHighWisdomCount: 0, hasHighQualityCount: 0, hasHighBeautyCount: 0,
      hasHighResilienceCount: 0, hasHighStabilityCount: 0,
      overallElegance: 9, architectGrade: 'scrap-dealer',
      bestShingle: 'test.ts', wisest: 'test.ts', bestConductor: 'test.ts',
      mostBeautiful: 'test.ts', mostStable: 'test.ts',
    }
    const recs = generateRecommendations([sh], [t], skyline, stats)
    expect(recs.some(r => r.includes('scrap'))).toBe(true)
  })

  it('lists specific scrap files to rebuild', () => {
    const sh = analyzeCopperShingle(minimalContent, 'bad.ts')
    const t = analyzeSpireTower([sh], 'src')
    const skyline: CopperSkyline = { avgWisdom: 6, avgConductivity: 16, avgStability: 6, isMagnificent: false, overallElegance: 9 }
    const stats: CopperSpireStats = {
      totalFiles: 1, totalTowers: 1,
      avgPatinaWisdom: 6, avgConductivityQuality: 16, avgVerdigrisBeauty: 8,
      avgAlloyResilience: 12, avgTowerStability: 6,
      cathedralSpireCount: 0, patinaTowerCount: 0, properSpireCount: 0,
      rustyPoleCount: 0, corrodedWireCount: 0, scrapCount: 1,
      hasHighWisdomCount: 0, hasHighQualityCount: 0, hasHighBeautyCount: 0,
      hasHighResilienceCount: 0, hasHighStabilityCount: 0,
      overallElegance: 9, architectGrade: 'scrap-dealer',
      bestShingle: 'bad.ts', wisest: 'bad.ts', bestConductor: 'bad.ts',
      mostBeautiful: 'bad.ts', mostStable: 'bad.ts',
    }
    const recs = generateRecommendations([sh], [t], skyline, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about low overall elegance', () => {
    const sh = analyzeCopperShingle(minimalContent, 'test.ts')
    const t = analyzeSpireTower([sh], 'src')
    const skyline: CopperSkyline = { avgWisdom: 6, avgConductivity: 16, avgStability: 6, isMagnificent: false, overallElegance: 9 }
    const stats: CopperSpireStats = {
      totalFiles: 1, totalTowers: 1,
      avgPatinaWisdom: 6, avgConductivityQuality: 16, avgVerdigrisBeauty: 8,
      avgAlloyResilience: 12, avgTowerStability: 6,
      cathedralSpireCount: 0, patinaTowerCount: 0, properSpireCount: 0,
      rustyPoleCount: 0, corrodedWireCount: 0, scrapCount: 1,
      hasHighWisdomCount: 0, hasHighQualityCount: 0, hasHighBeautyCount: 0,
      hasHighResilienceCount: 0, hasHighStabilityCount: 0,
      overallElegance: 9, architectGrade: 'scrap-dealer',
      bestShingle: 'test.ts', wisest: 'test.ts', bestConductor: 'test.ts',
      mostBeautiful: 'test.ts', mostStable: 'test.ts',
    }
    const recs = generateRecommendations([sh], [t], skyline, stats)
    expect(recs.some(r => r.includes('elegance'))).toBe(true)
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
  it('colors cathedral-spire', () => {
    expect(typeof colorGrade('cathedral-spire')).toBe('string')
  })
  it('colors scrap', () => {
    expect(typeof colorGrade('scrap')).toBe('string')
  })
  it('colors unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatShingleTable', () => {
  it('formats a copper shingle', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    const output = formatShingleTable(sh)
    expect(output).toContain('test.ts')
    expect(output).toContain('Patina Wisdom')
    expect(output).toContain('Conductivity Quality')
    expect(output).toContain('Verdigris Beauty')
    expect(output).toContain('Alloy Resilience')
    expect(output).toContain('Tower Stability')
    expect(output).toContain('Score')
  })
})

describe('formatShinglesTable', () => {
  it('returns no shingles message for empty array', () => {
    expect(formatShinglesTable([])).toContain('No copper shingles found')
  })
  it('formats shingles with header', () => {
    const sh = analyzeCopperShingle(richContent, 'test.ts')
    const output = formatShinglesTable([sh])
    expect(output).toContain('Copper Spire Analysis')
    expect(output).toContain('test.ts')
  })
})

describe('formatTowerTable', () => {
  it('formats a spire tower', () => {
    const sh = analyzeCopperShingle(richContent, 'src/a.ts')
    const t = analyzeSpireTower([sh], 'src')
    const output = formatTowerTable(t)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Condition')
  })
})

describe('formatTowersTable', () => {
  it('returns no towers message for empty array', () => {
    expect(formatTowersTable([])).toContain('No spire towers found')
  })
  it('formats towers with header', () => {
    const sh = analyzeCopperShingle(richContent, 'src/a.ts')
    const t = analyzeSpireTower([sh], 'src')
    const output = formatTowersTable([t])
    expect(output).toContain('Spire Towers')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Copper Spire Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Architect Grade')
    expect(output).toContain('Best Shingle')
    expect(output).toContain('Wisest')
    expect(output).toContain('Best Conductor')
    expect(output).toContain('Most Beautiful')
    expect(output).toContain('Most Stable')
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
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Copper Spire Analysis')
    expect(output).toContain('Spire Towers')
    expect(output).toContain('Copper Spire Statistics')
    expect(output).toContain('Skyline')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildCopperSpireResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.shingles).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
