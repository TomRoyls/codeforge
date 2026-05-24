import { describe, it, expect } from 'vitest'
import {
  measureRevealing,
  measureAligning,
  measureGuiding,
  measureVirtueing,
  measureConvicting,
  classifyNeedleCondition,
  classifyGuildType,
  classifyGuildCondition,
  classifyScholarGrade,
  analyzeGoldenNeedle,
  analyzeCompassGuild,
  buildGoldenCompassResult,
  generateRecommendations,
} from '../src/commands/golden-compass-helpers.js'
import {
  colorScore,
  colorGrade,
  formatNeedleTable,
  formatNeedlesTable,
  formatGuildTable,
  formatGuildsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/golden-compass-format-helpers.js'
import type { GoldenNeedle, GoldenCompassStats, GoldenTruth, CompassGuild } from '../src/commands/golden-compass-helpers.js'

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

// ─── Helper to compute expected scores ─────────────────────────────

function computeRevealingScore(content: string): number {
  const m = measureRevealing(content)
  return m.clarity
}

function computeAligningScore(content: string): number {
  const m = measureAligning(content)
  return m.truth
}

function computeGuidingScore(content: string): number {
  const m = measureGuiding(content)
  return m.wisdom
}

function computeVirtueingScore(content: string): number {
  const m = measureVirtueing(content)
  return m.virtue
}

function computeConvictingScore(content: string): number {
  const m = measureConvicting(content)
  return m.conviction
}

// ─── measureRevealing ──────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns 0 clarity for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(m.clarity).toBe(0)
  })

  it('returns low clarity for minimal content', () => {
    const m = measureRevealing(minimalContent)
    expect(m.clarity).toBeLessThan(20)
  })

  it('returns moderate clarity for moderate content', () => {
    const m = measureRevealing(moderateContent)
    expect(m.clarity).toBeGreaterThanOrEqual(40)
    expect(m.clarity).toBeLessThan(80)
  })

  it('returns high clarity for rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(m.grade).toBe('no-clarity')
  })

  it('grades correctly for minimal content', () => {
    const m = measureRevealing(minimalContent)
    expect(m.grade).toBe('no-clarity')
  })

  it('detects hasNoSideEffects correctly', () => {
    const m = measureRevealing(richContent)
    expect(m.hasNoSideEffects).toBe(true)
  })

  it('detects hasNoSideEffects false for minimal', () => {
    const m = measureRevealing(minimalContent)
    expect(m.hasNoSideEffects).toBe(false)
  })

  it('detects sideEffectCount for var usage', () => {
    const m = measureRevealing('var x = 1')
    expect(m.sideEffectCount).toBeGreaterThan(0)
  })

  it('detects hasHighClarity for rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasHighClarity).toBe(true)
  })

  it('detects hasHighClarity false for minimal', () => {
    const m = measureRevealing(minimalContent)
    expect(m.hasHighClarity).toBe(false)
  })

  it('detects hasNoDeceptive for clean content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasNoDeceptive).toBe(true)
  })

  it('detects hasNoClever for clean content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasNoClever).toBe(true)
  })

  it('caps clarity at 100', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureAligning ───────────────────────────────────────────────

describe('measureAligning', () => {
  it('returns 0 truth for empty content', () => {
    const m = measureAligning(emptyContent)
    expect(m.truth).toBe(0)
  })

  it('returns low truth for minimal content', () => {
    const m = measureAligning(minimalContent)
    expect(m.truth).toBeLessThan(20)
  })

  it('returns moderate truth for moderate content', () => {
    const m = measureAligning(moderateContent)
    expect(m.truth).toBeGreaterThanOrEqual(40)
    expect(m.truth).toBeLessThan(80)
  })

  it('returns high truth for rich content', () => {
    const m = measureAligning(richContent)
    expect(m.truth).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureAligning(emptyContent)
    expect(m.bearing).toBe('no-truth')
  })

  it('detects hasAccurateNames for rich content', () => {
    const m = measureAligning(richContent)
    expect(m.hasAccurateNames).toBe(true)
  })

  it('detects hasHighTruth for rich content', () => {
    const m = measureAligning(richContent)
    expect(m.hasHighTruth).toBe(true)
  })

  it('detects hasNoSurprises for clean content', () => {
    const m = measureAligning(richContent)
    expect(m.hasNoSurprises).toBe(true)
  })

  it('caps truth at 100', () => {
    const m = measureAligning(richContent)
    expect(m.truth).toBeLessThanOrEqual(100)
  })
})

// ─── measureGuiding ────────────────────────────────────────────────

describe('measureGuiding', () => {
  it('returns 0 wisdom for empty content', () => {
    const m = measureGuiding(emptyContent)
    expect(m.wisdom).toBe(0)
  })

  it('returns low wisdom for minimal content', () => {
    const m = measureGuiding(minimalContent)
    expect(m.wisdom).toBeLessThan(20)
  })

  it('returns moderate wisdom for moderate content', () => {
    const m = measureGuiding(moderateContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(40)
    expect(m.wisdom).toBeLessThan(80)
  })

  it('returns high wisdom for rich content', () => {
    const m = measureGuiding(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureGuiding(emptyContent)
    expect(m.navigation).toBe('no-guidance')
  })

  it('detects hasWellDocumented for rich content', () => {
    const m = measureGuiding(richContent)
    expect(m.hasWellDocumented).toBe(true)
  })

  it('detects hasHighWisdom for rich content', () => {
    const m = measureGuiding(richContent)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('detects hasNoUndocumented for clean content', () => {
    const m = measureGuiding(richContent)
    expect(m.hasNoUndocumented).toBe(true)
  })

  it('caps wisdom at 100', () => {
    const m = measureGuiding(richContent)
    expect(m.wisdom).toBeLessThanOrEqual(100)
  })
})

// ─── measureVirtueing ──────────────────────────────────────────────

describe('measureVirtueing', () => {
  it('returns 0 virtue for empty content', () => {
    const m = measureVirtueing(emptyContent)
    expect(m.virtue).toBe(0)
  })

  it('returns low virtue for minimal content', () => {
    const m = measureVirtueing(minimalContent)
    expect(m.virtue).toBeLessThan(20)
  })

  it('returns moderate virtue for moderate content', () => {
    const m = measureVirtueing(moderateContent)
    expect(m.virtue).toBeGreaterThanOrEqual(30)
    expect(m.virtue).toBeLessThan(80)
  })

  it('returns high virtue for rich content', () => {
    const m = measureVirtueing(richContent)
    expect(m.virtue).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureVirtueing(emptyContent)
    expect(m.cardinal).toBe('no-virtue')
  })

  it('detects hasCleanArchitecture for rich content', () => {
    const m = measureVirtueing(richContent)
    expect(m.hasCleanArchitecture).toBe(true)
  })

  it('detects hasNoAntiPatterns for clean content', () => {
    const m = measureVirtueing(richContent)
    expect(m.hasNoAntiPatterns).toBe(true)
  })

  it('caps virtue at 100', () => {
    const m = measureVirtueing(richContent)
    expect(m.virtue).toBeLessThanOrEqual(100)
  })
})

// ─── measureConvicting ─────────────────────────────────────────────

describe('measureConvicting', () => {
  it('returns 0 conviction for empty content', () => {
    const m = measureConvicting(emptyContent)
    expect(m.conviction).toBe(0)
  })

  it('returns low conviction for minimal content', () => {
    const m = measureConvicting(minimalContent)
    expect(m.conviction).toBeLessThan(20)
  })

  it('returns moderate conviction for moderate content', () => {
    const m = measureConvicting(moderateContent)
    expect(m.conviction).toBeGreaterThanOrEqual(30)
    expect(m.conviction).toBeLessThan(80)
  })

  it('returns high conviction for rich content', () => {
    const m = measureConvicting(richContent)
    expect(m.conviction).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureConvicting(emptyContent)
    expect(m.needle).toBe('no-conviction')
  })

  it('detects hasConsistent for rich content', () => {
    const m = measureConvicting(richContent)
    expect(m.hasConsistent).toBe(true)
  })

  it('detects hasNoMixed for clean content', () => {
    const m = measureConvicting(richContent)
    expect(m.hasNoMixed).toBe(true)
  })

  it('caps conviction at 100', () => {
    const m = measureConvicting(richContent)
    expect(m.conviction).toBeLessThanOrEqual(100)
  })
})

// ─── classifyNeedleCondition ───────────────────────────────────────

describe('classifyNeedleCondition', () => {
  it('classifies golden-instrument for 85+', () => {
    expect(classifyNeedleCondition(90)).toBe('golden-instrument')
  })

  it('classifies brass-compass for 70-84', () => {
    expect(classifyNeedleCondition(75)).toBe('brass-compass')
  })

  it('classifies proper-tool for 55-69', () => {
    expect(classifyNeedleCondition(60)).toBe('proper-tool')
  })

  it('classifies rusty-compass for 40-54', () => {
    expect(classifyNeedleCondition(45)).toBe('rusty-compass')
  })

  it('classifies broken-device for 25-39', () => {
    expect(classifyNeedleCondition(30)).toBe('broken-device')
  })

  it('classifies paperweight for <25', () => {
    expect(classifyNeedleCondition(10)).toBe('paperweight')
  })

  it('classifies paperweight for 0', () => {
    expect(classifyNeedleCondition(0)).toBe('paperweight')
  })
})

// ─── classifyScholarGrade ──────────────────────────────────────────

describe('classifyScholarGrade', () => {
  it('classifies truth-seeker for 80+', () => {
    expect(classifyScholarGrade(85)).toBe('truth-seeker')
  })

  it('classifies golden-scholar for 65-79', () => {
    expect(classifyScholarGrade(70)).toBe('golden-scholar')
  })

  it('classifies skilled-reader for 50-64', () => {
    expect(classifyScholarGrade(55)).toBe('skilled-reader')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyScholarGrade(40)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyScholarGrade(25)).toBe('novice')
  })

  it('classifies deceiver for <20', () => {
    expect(classifyScholarGrade(10)).toBe('deceiver')
  })
})

// ─── classifyGuildType ─────────────────────────────────────────────

describe('classifyGuildType', () => {
  it('returns no-guild for empty needles', () => {
    expect(classifyGuildType([])).toBe('no-guild')
  })

  it('returns master-guild for high quality needles', () => {
    const needles: GoldenNeedle[] = [
      { file: 'a.ts', moralClarity: 90, bearingTruth: 90, navigationWisdom: 90, cardinalVirtue: 90, needleConviction: 90, revealing: {} as any, aligning: {} as any, guiding: {} as any, virtueing: {} as any, convicting: {} as any, condition: 'golden-instrument', qualityScore: 90 },
      { file: 'b.ts', moralClarity: 95, bearingTruth: 95, navigationWisdom: 95, cardinalVirtue: 95, needleConviction: 95, revealing: {} as any, aligning: {} as any, guiding: {} as any, virtueing: {} as any, convicting: {} as any, condition: 'golden-instrument', qualityScore: 95 },
    ]
    expect(classifyGuildType(needles)).toBe('master-guild')
  })

  it('returns no-guild for very low quality', () => {
    const needles: GoldenNeedle[] = [
      { file: 'a.ts', moralClarity: 5, bearingTruth: 5, navigationWisdom: 5, cardinalVirtue: 5, needleConviction: 5, revealing: {} as any, aligning: {} as any, guiding: {} as any, virtueing: {} as any, convicting: {} as any, condition: 'paperweight', qualityScore: 5 },
    ]
    expect(classifyGuildType(needles)).toBe('no-guild')
  })
})

// ─── classifyGuildCondition ────────────────────────────────────────

describe('classifyGuildCondition', () => {
  it('classifies institution-of-truth for 75+', () => {
    expect(classifyGuildCondition(80)).toBe('institution-of-truth')
  })

  it('classifies void for <15', () => {
    expect(classifyGuildCondition(10)).toBe('void')
  })

  it('classifies honorable-guild for 60-74', () => {
    expect(classifyGuildCondition(65)).toBe('honorable-guild')
  })

  it('classifies decent-school for 45-59', () => {
    expect(classifyGuildCondition(50)).toBe('decent-school')
  })

  it('classifies shady-shop for 30-44', () => {
    expect(classifyGuildCondition(35)).toBe('shady-shop')
  })

  it('classifies abandoned for 15-29', () => {
    expect(classifyGuildCondition(20)).toBe('abandoned')
  })
})

// ─── analyzeGoldenNeedle ───────────────────────────────────────────

describe('analyzeGoldenNeedle', () => {
  it('returns correct file path', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    expect(needle.file).toBe('test.ts')
  })

  it('computes qualityScore as weighted average', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    const expected = Math.round(
      computeRevealingScore(richContent) * 0.2 +
      computeAligningScore(richContent) * 0.2 +
      computeGuidingScore(richContent) * 0.2 +
      computeVirtueingScore(richContent) * 0.2 +
      computeConvictingScore(richContent) * 0.2,
    )
    expect(needle.qualityScore).toBe(expected)
  })

  it('classifies rich content as golden-instrument', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    expect(needle.condition).toBe('golden-instrument')
  })

  it('classifies minimal content as paperweight', () => {
    const needle = analyzeGoldenNeedle(minimalContent, 'test.ts')
    expect(needle.condition).toBe('paperweight')
  })

  it('classifies empty content as paperweight', () => {
    const needle = analyzeGoldenNeedle(emptyContent, 'test.ts')
    expect(needle.condition).toBe('paperweight')
  })

  it('stores moralClarity from revealing', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    expect(needle.moralClarity).toBe(computeRevealingScore(richContent))
  })

  it('stores bearingTruth from aligning', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    expect(needle.bearingTruth).toBe(computeAligningScore(richContent))
  })

  it('stores navigationWisdom from guiding', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    expect(needle.navigationWisdom).toBe(computeGuidingScore(richContent))
  })

  it('stores cardinalVirtue from virtueing', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    expect(needle.cardinalVirtue).toBe(computeVirtueingScore(richContent))
  })

  it('stores needleConviction from convicting', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    expect(needle.needleConviction).toBe(computeConvictingScore(richContent))
  })
})

// ─── analyzeCompassGuild ───────────────────────────────────────────

describe('analyzeCompassGuild', () => {
  it('returns empty guild for no needles', () => {
    const guild = analyzeCompassGuild([], '/empty')
    expect(guild.directory).toBe('/empty')
    expect(guild.needles).toHaveLength(0)
    expect(guild.avgClarity).toBe(0)
    expect(guild.guildType).toBe('no-guild')
    expect(guild.condition).toBe('void')
  })

  it('computes avgClarity correctly', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    const guild = analyzeCompassGuild([needle], '/src')
    expect(guild.avgClarity).toBe(needle.moralClarity)
  })

  it('counts goldenInstrumentCount', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    const guild = analyzeCompassGuild([needle], '/src')
    expect(guild.goldenInstrumentCount).toBe(1)
  })

  it('counts paperweightCount', () => {
    const needle = analyzeGoldenNeedle(minimalContent, 'test.ts')
    const guild = analyzeCompassGuild([needle], '/src')
    expect(guild.paperweightCount).toBe(1)
  })

  it('returns master-guild for golden-instrument needles', () => {
    const n1 = analyzeGoldenNeedle(richContent, 'a.ts')
    const n2 = analyzeGoldenNeedle(richContent, 'b.ts')
    const guild = analyzeCompassGuild([n1, n2], '/src')
    expect(guild.guildType).toBe('master-guild')
  })
})

// ─── buildGoldenCompassResult ──────────────────────────────────────

describe('buildGoldenCompassResult', () => {
  it('returns needles for each file', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.needles).toHaveLength(2)
  })

  it('returns guilds grouped by directory', async () => {
    const result = await buildGoldenCompassResult(
      ['/src/a.ts', '/src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.guilds).toHaveLength(1)
    expect(result.guilds[0]!.directory).toBe('/src')
  })

  it('returns multiple guilds for different directories', async () => {
    const result = await buildGoldenCompassResult(
      ['/src/a.ts', '/lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.guilds).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalGuilds).toBe(1)
  })

  it('computes truth correctly', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.truth.isTruthful).toBe(true)
    expect(result.truth.overallVirtue).toBeGreaterThan(0)
  })

  it('computes bestNeedle correctly', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestNeedle).toBe('a.ts')
  })

  it('computes mostClear correctly', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.mostClear).toBe('a.ts')
  })

  it('computes mostTruthful correctly', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.mostTruthful).toBe('a.ts')
  })

  it('computes wisest correctly', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('computes mostVirtuous correctly', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.mostVirtuous).toBe('a.ts')
  })

  it('computes goldenInstrumentCount in stats', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.goldenInstrumentCount).toBe(1)
  })

  it('computes paperweightCount in stats', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.stats.paperweightCount).toBe(2)
  })

  it('computes hasHighClarityCount', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.hasHighClarityCount).toBe(1)
  })

  it('computes scholarGrade for rich content', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.scholarGrade).toBe('truth-seeker')
  })

  it('computes scholarGrade for minimal content', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts'],
      [minimalContent],
    )
    expect(result.stats.scholarGrade).toBe('deceiver')
  })

  it('generates recommendations', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('generates positive recommendation for all-rich', async () => {
    const result = await buildGoldenCompassResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.recommendations).toContain(
      'The golden compass points true! Every needle gleams with moral clarity, truth, wisdom, virtue, and conviction',
    )
  })

  it('handles empty file list', async () => {
    const result = await buildGoldenCompassResult([], [])
    expect(result.needles).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallVirtue).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving moral clarity when low', () => {
    const stats = {
      avgMoralClarity: 30, avgBearingTruth: 80, avgNavigationWisdom: 80,
      avgCardinalVirtue: 80, avgNeedleConviction: 80, paperweightCount: 0,
    } as unknown as GoldenCompassStats
    const recs = generateRecommendations([], [], {} as GoldenTruth, stats)
    expect(recs.some(r => r.includes('moral clarity'))).toBe(true)
  })

  it('recommends improving bearing truth when low', () => {
    const stats = {
      avgMoralClarity: 80, avgBearingTruth: 30, avgNavigationWisdom: 80,
      avgCardinalVirtue: 80, avgNeedleConviction: 80, paperweightCount: 0,
    } as unknown as GoldenCompassStats
    const recs = generateRecommendations([], [], {} as GoldenTruth, stats)
    expect(recs.some(r => r.includes('bearing truth'))).toBe(true)
  })

  it('recommends improving navigation wisdom when low', () => {
    const stats = {
      avgMoralClarity: 80, avgBearingTruth: 80, avgNavigationWisdom: 30,
      avgCardinalVirtue: 80, avgNeedleConviction: 80, paperweightCount: 0,
    } as unknown as GoldenCompassStats
    const recs = generateRecommendations([], [], {} as GoldenTruth, stats)
    expect(recs.some(r => r.includes('navigation wisdom'))).toBe(true)
  })

  it('recommends improving cardinal virtue when low', () => {
    const stats = {
      avgMoralClarity: 80, avgBearingTruth: 80, avgNavigationWisdom: 80,
      avgCardinalVirtue: 30, avgNeedleConviction: 80, paperweightCount: 0,
    } as unknown as GoldenCompassStats
    const recs = generateRecommendations([], [], {} as GoldenTruth, stats)
    expect(recs.some(r => r.includes('cardinal virtue'))).toBe(true)
  })

  it('recommends improving needle conviction when low', () => {
    const stats = {
      avgMoralClarity: 80, avgBearingTruth: 80, avgNavigationWisdom: 80,
      avgCardinalVirtue: 80, avgNeedleConviction: 30, paperweightCount: 0,
    } as unknown as GoldenCompassStats
    const recs = generateRecommendations([], [], {} as GoldenTruth, stats)
    expect(recs.some(r => r.includes('needle conviction'))).toBe(true)
  })

  it('mentions paperweight files', () => {
    const stats = {
      avgMoralClarity: 80, avgBearingTruth: 80, avgNavigationWisdom: 80,
      avgCardinalVirtue: 80, avgNeedleConviction: 80, paperweightCount: 3,
    } as unknown as GoldenCompassStats
    const recs = generateRecommendations([], [], {} as GoldenTruth, stats)
    expect(recs.some(r => r.includes('paperweight'))).toBe(true)
  })

  it('recommends overall virtue improvement when low', () => {
    const truth: GoldenTruth = { avgClarity: 80, avgTruth: 80, avgConviction: 80, isTruthful: true, overallVirtue: 30 }
    const stats = {
      avgMoralClarity: 80, avgBearingTruth: 80, avgNavigationWisdom: 80,
      avgCardinalVirtue: 80, avgNeedleConviction: 80, paperweightCount: 0,
    } as unknown as GoldenCompassStats
    const recs = generateRecommendations([], [], truth, stats)
    expect(recs.some(r => r.includes('Overall virtue'))).toBe(true)
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
  it('colors golden-instrument as best', () => {
    expect(typeof colorGrade('golden-instrument')).toBe('string')
  })

  it('colors paperweight as worst', () => {
    expect(typeof colorGrade('paperweight')).toBe('string')
  })

  it('colors unknown grade with fallback', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })

  it('colors pure-gold', () => {
    expect(typeof colorGrade('pure-gold')).toBe('string')
  })

  it('colors truth-seeker', () => {
    expect(typeof colorGrade('truth-seeker')).toBe('string')
  })

  it('colors institution-of-truth', () => {
    expect(typeof colorGrade('institution-of-truth')).toBe('string')
  })
})

describe('formatNeedleTable', () => {
  it('formats a single needle', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    const output = formatNeedleTable(needle)
    expect(output).toContain('test.ts')
    expect(output).toContain('Moral Clarity')
    expect(output).toContain('Bearing Truth')
    expect(output).toContain('Navigation Wisdom')
    expect(output).toContain('Cardinal Virtue')
    expect(output).toContain('Needle Conviction')
    expect(output).toContain('Score')
  })
})

describe('formatNeedlesTable', () => {
  it('formats multiple needles', () => {
    const needles = [
      analyzeGoldenNeedle(richContent, 'a.ts'),
      analyzeGoldenNeedle(moderateContent, 'b.ts'),
    ]
    const output = formatNeedlesTable(needles)
    expect(output).toContain('Golden Compass Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('returns message for empty needles', () => {
    const output = formatNeedlesTable([])
    expect(output).toContain('No golden needles found')
  })
})

describe('formatGuildTable', () => {
  it('formats a guild', () => {
    const needle = analyzeGoldenNeedle(richContent, 'test.ts')
    const guild = analyzeCompassGuild([needle], '/src')
    const output = formatGuildTable(guild)
    expect(output).toContain('/src')
    expect(output).toContain('Guild:')
    expect(output).toContain('Type:')
    expect(output).toContain('Avg Clarity')
  })
})

describe('formatGuildsTable', () => {
  it('returns message for empty guilds', () => {
    const output = formatGuildsTable([])
    expect(output).toContain('No compass guilds found')
  })

  it('formats multiple guilds', () => {
    const n1 = analyzeGoldenNeedle(richContent, 'a.ts')
    const n2 = analyzeGoldenNeedle(moderateContent, 'b.ts')
    const g1 = analyzeCompassGuild([n1], '/src')
    const g2 = analyzeCompassGuild([n2], '/lib')
    const output = formatGuildsTable([g1, g2])
    expect(output).toContain('Compass Guilds')
    expect(output).toContain('/src')
    expect(output).toContain('/lib')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildGoldenCompassResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Golden Compass Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Virtue')
    expect(output).toContain('Scholar Grade')
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
    const result = await buildGoldenCompassResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Golden Compass Analysis')
    expect(output).toContain('Compass Guilds')
    expect(output).toContain('Golden Compass Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildGoldenCompassResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.needles).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Score computation consistency ─────────────────────────────────

describe('score consistency', () => {
  it('minimalContent: revealing score matches expected', () => {
    const m = measureRevealing(minimalContent)
    expect(m.clarity).toBe(6)
  })

  it('minimalContent: aligning score matches expected', () => {
    const m = measureAligning(minimalContent)
    expect(m.truth).toBe(6)
  })

  it('minimalContent: guiding score matches expected', () => {
    const m = measureGuiding(minimalContent)
    expect(m.wisdom).toBe(6)
  })

  it('minimalContent: virtueing score matches expected', () => {
    const m = measureVirtueing(minimalContent)
    expect(m.virtue).toBe(6)
  })

  it('minimalContent: convicting score matches expected', () => {
    const m = measureConvicting(minimalContent)
    expect(m.conviction).toBe(8)
  })

  it('minimalContent: qualityScore matches expected', () => {
    const needle = analyzeGoldenNeedle(minimalContent, 'test.ts')
    expect(needle.qualityScore).toBe(Math.round((6 + 6 + 6 + 6 + 8) * 0.2))
  })

  it('emptyContent: all scores are 0', () => {
    const needle = analyzeGoldenNeedle(emptyContent, 'test.ts')
    expect(needle.moralClarity).toBe(0)
    expect(needle.bearingTruth).toBe(0)
    expect(needle.navigationWisdom).toBe(0)
    expect(needle.cardinalVirtue).toBe(0)
    expect(needle.needleConviction).toBe(0)
    expect(needle.qualityScore).toBe(0)
  })

  it('richContent: all measures capped at 100', () => {
    const r = measureRevealing(richContent)
    const a = measureAligning(richContent)
    const g = measureGuiding(richContent)
    const v = measureVirtueing(richContent)
    const c = measureConvicting(richContent)
    expect(r.clarity).toBeLessThanOrEqual(100)
    expect(a.truth).toBeLessThanOrEqual(100)
    expect(g.wisdom).toBeLessThanOrEqual(100)
    expect(v.virtue).toBeLessThanOrEqual(100)
    expect(c.conviction).toBeLessThanOrEqual(100)
  })
})
