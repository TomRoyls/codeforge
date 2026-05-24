import { describe, it, expect } from 'vitest'
import {
  measureRemembering,
  measureResisting,
  measureGleaming,
  measureStabilizing,
  measurePreparing,
  classifyJewelCondition,
  classifyCourtType,
  classifyCourtCondition,
  classifyMonarchGrade,
  analyzeCrownJewel,
  analyzeRoyalCourt,
  buildRustedCrownResult,
  generateRecommendations,
} from '../src/commands/rusted-crown-helpers.js'
import {
  colorScore,
  colorGrade,
  formatJewelTable,
  formatJewelsTable,
  formatCourtTable,
  formatCourtsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/rusted-crown-format-helpers.js'
import type {
  CrownJewel,
} from '../src/commands/rusted-crown-helpers.js'

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

// ─── measureRemembering ────────────────────────────────────────────

describe('measureRemembering', () => {
  it('returns 0 wisdom for empty content', () => {
    const m = measureRemembering(emptyContent)
    expect(m.wisdom).toBe(0)
    expect(m.grade).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('detects documented patterns in rich content', () => {
    const m = measureRemembering(richContent)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasDescriptive).toBe(true)
  })

  it('detects cryptic code in poor content', () => {
    const m = measureRemembering(poorContent)
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.silentCount).toBeGreaterThan(0)
    expect(m.hasNoSilent).toBe(false)
  })

  it('detects historical and preserved patterns in rich content', () => {
    const m = measureRemembering(richContent)
    expect(m.hasHistorical).toBe(true)
    expect(m.hasPreserved).toBe(true)
    expect(m.hasCommented).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureRemembering(richContent).grade).not.toBe('no-wisdom')
    expect(measureRemembering(emptyContent).grade).toBe('no-wisdom')
  })

  it('has wisdom capped at 100', () => {
    const m = measureRemembering(richContent)
    expect(m.wisdom).toBeLessThanOrEqual(100)
  })
})

// ─── measureResisting ─────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns 0 resistance for empty content', () => {
    const m = measureResisting(emptyContent)
    expect(m.resistance).toBe(0)
    expect(m.corrosion).toBe('dissolved')
    expect(m.hasHighResistance).toBe(false)
  })

  it('detects modernized patterns in rich content', () => {
    const m = measureResisting(richContent)
    expect(m.hasModernized).toBe(true)
    expect(m.hasRefactored).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
  })

  it('detects outdated code in poor content', () => {
    const m = measureResisting(poorContent)
    expect(m.outdatedCount).toBeGreaterThan(0)
    expect(m.hasNoOutdated).toBe(false)
    expect(m.legacyPatternCount).toBeGreaterThan(0)
    expect(m.hasNoLegacyPatterns).toBe(false)
  })

  it('detects tested and current patterns in rich content', () => {
    const m = measureResisting(richContent)
    expect(m.hasTested).toBe(true)
    expect(m.hasCurrent).toBe(true)
  })

  it('classifies corrosion correctly', () => {
    expect(measureResisting(emptyContent).corrosion).toBe('dissolved')
    expect(measureResisting(richContent).corrosion).not.toBe('dissolved')
  })

  it('has resistance capped at 100', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBeLessThanOrEqual(100)
  })
})

// ─── measureGleaming ──────────────────────────────────────────────

describe('measureGleaming', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureGleaming(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.gilding).toBe('no-gilding')
    expect(m.hasHighQuality).toBe(false)
  })

  it('detects high value patterns in rich content', () => {
    const m = measureGleaming(richContent)
    expect(m.hasHighValue).toBe(true)
    expect(m.hasCleanCode).toBe(true)
    expect(m.hasEssential).toBe(true)
  })

  it('detects dead code in poor content', () => {
    const m = measureGleaming(poorContent)
    expect(m.deadCodeCount).toBeGreaterThan(0)
    expect(m.hasNoDeadCode).toBe(false)
    expect(m.fillerCount).toBeGreaterThan(0)
    expect(m.hasNoFiller).toBe(false)
  })

  it('detects polished and refined patterns in rich content', () => {
    const m = measureGleaming(richContent)
    expect(m.hasPolished).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasValuable).toBe(true)
  })

  it('classifies gilding correctly', () => {
    expect(measureGleaming(emptyContent).gilding).toBe('no-gilding')
    expect(measureGleaming(richContent).gilding).not.toBe('no-gilding')
  })

  it('has quality capped at 100', () => {
    const m = measureGleaming(richContent)
    expect(m.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureStabilizing ───────────────────────────────────────────

describe('measureStabilizing', () => {
  it('returns 0 stability for empty content', () => {
    const m = measureStabilizing(emptyContent)
    expect(m.stability).toBe(0)
    expect(m.reign).toBe('no-reign')
    expect(m.hasHighStability).toBe(false)
  })

  it('detects consistent API in rich content', () => {
    const m = measureStabilizing(richContent)
    expect(m.hasConsistentAPI).toBe(true)
    expect(m.hasVersioned).toBe(true)
    expect(m.hasBackwardCompatible).toBe(true)
  })

  it('detects breaking changes in poor content', () => {
    const m = measureStabilizing(poorContent)
    expect(m.breakingChangesCount).toBeGreaterThan(0)
    expect(m.hasNoBreakingChanges).toBe(false)
    expect(m.unversionedCount).toBeGreaterThan(0)
    expect(m.hasNoUnversioned).toBe(false)
  })

  it('detects dependable patterns in rich content', () => {
    const m = measureStabilizing(richContent)
    expect(m.hasDependable).toBe(true)
    expect(m.hasTested).toBe(true)
  })

  it('classifies reign correctly', () => {
    expect(measureStabilizing(emptyContent).reign).toBe('no-reign')
    expect(measureStabilizing(richContent).reign).not.toBe('no-reign')
  })

  it('has stability capped at 100', () => {
    const m = measureStabilizing(richContent)
    expect(m.stability).toBeLessThanOrEqual(100)
  })
})

// ─── measurePreparing ─────────────────────────────────────────────

describe('measurePreparing', () => {
  it('returns 0 readiness for empty content', () => {
    const m = measurePreparing(emptyContent)
    expect(m.readiness).toBe(0)
    expect(m.coronation).toBe('no-throne')
    expect(m.hasHighReadiness).toBe(false)
  })

  it('detects extensible patterns in rich content', () => {
    const m = measurePreparing(richContent)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasDocumented).toBe(true)
  })

  it('detects monolithic code in poor content', () => {
    const m = measurePreparing(poorContent)
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
    expect(m.tribalKnowledgeCount).toBeGreaterThan(0)
    expect(m.hasNoTribalKnowledge).toBe(false)
  })

  it('detects clean interfaces and succession in rich content', () => {
    const m = measurePreparing(richContent)
    expect(m.hasCleanInterfaces).toBe(true)
    expect(m.hasHandoffReady).toBe(true)
  })

  it('classifies coronation correctly', () => {
    expect(measurePreparing(emptyContent).coronation).toBe('no-throne')
    expect(measurePreparing(richContent).coronation).not.toBe('no-throne')
  })

  it('has readiness capped at 100', () => {
    const m = measurePreparing(richContent)
    expect(m.readiness).toBeLessThanOrEqual(100)
  })
})

// ─── classifyJewelCondition ───────────────────────────────────────

describe('classifyJewelCondition', () => {
  it('classifies golden-crown for high scores', () => {
    expect(classifyJewelCondition(90)).toBe('golden-crown')
    expect(classifyJewelCondition(85)).toBe('golden-crown')
  })

  it('classifies silver-diadem for good scores', () => {
    expect(classifyJewelCondition(70)).toBe('silver-diadem')
    expect(classifyJewelCondition(75)).toBe('silver-diadem')
  })

  it('classifies proper-tiara for moderate scores', () => {
    expect(classifyJewelCondition(55)).toBe('proper-tiara')
    expect(classifyJewelCondition(60)).toBe('proper-tiara')
  })

  it('classifies rusted-circlet for low scores', () => {
    expect(classifyJewelCondition(40)).toBe('rusted-circlet')
    expect(classifyJewelCondition(45)).toBe('rusted-circlet')
  })

  it('classifies broken-crown for poor scores', () => {
    expect(classifyJewelCondition(25)).toBe('broken-crown')
    expect(classifyJewelCondition(30)).toBe('broken-crown')
  })

  it('classifies scrap-metal for very low scores', () => {
    expect(classifyJewelCondition(0)).toBe('scrap-metal')
    expect(classifyJewelCondition(10)).toBe('scrap-metal')
    expect(classifyJewelCondition(24)).toBe('scrap-metal')
  })
})

// ─── classifyCourtType ────────────────────────────────────────────

describe('classifyCourtType', () => {
  it('returns no-court for empty jewels', () => {
    expect(classifyCourtType([])).toBe('no-court')
  })

  it('classifies grand-palace for high quality with golden ratio', () => {
    const jewel: CrownJewel = {
      file: 'a.ts', legacyWisdom: 90, corrosionResistance: 90, gildedQuality: 90,
      reignStability: 90, coronationReadiness: 90,
      remembering: { wisdom: 90, grade: 'ancient-sovereign', hasHighWisdom: true, hasDocumented: true, hasWellNamed: true, hasNoCryptic: true, hasCommented: true, hasNoSilent: true, hasDescriptive: true, hasNoVague: true, hasHistorical: true, hasNoUnexplained: true, hasPreserved: true, crypticCount: 0, silentCount: 0 },
      resisting: { resistance: 90, corrosion: 'stainless-steel', hasHighResistance: true, hasModernized: true, hasUpdatedDeps: true, hasNoOutdated: true, hasRefactored: true, hasNoLegacyPatterns: true, hasTypeSafe: true, hasNoUnsafe: true, hasTested: true, hasNoUntested: true, hasCurrent: true, outdatedCount: 0, legacyPatternCount: 0 },
      gleaming: { quality: 90, gilding: 'pure-gold', hasHighQuality: true, hasHighValue: true, hasCleanCode: true, hasNoDeadCode: true, hasEssential: true, hasNoFiller: true, hasPolished: true, hasNoRough: true, hasRefined: true, hasNoCrude: true, hasValuable: true, deadCodeCount: 0, fillerCount: 0 },
      stabilizing: { stability: 90, reign: 'eternal-kingdom', hasHighStability: true, hasConsistentAPI: true, hasNoBreakingChanges: true, hasVersioned: true, hasNoUnversioned: true, hasBackwardCompatible: true, hasNoBreakingInterfaces: true, hasTested: true, hasNoRegressions: true, hasDependable: true, hasNoVolatile: true, breakingChangesCount: 0, unversionedCount: 0 },
      preparing: { readiness: 90, coronation: 'ready-to-crown', hasHighReadiness: true, hasExtensible: true, hasModular: true, hasNoMonolithic: true, hasDocumented: true, hasNoTribalKnowledge: true, hasCleanInterfaces: true, hasNoCoupled: true, hasSuccessionPlan: true, hasNoSinglePoint: true, hasHandoffReady: true, monolithicCount: 0, tribalKnowledgeCount: 0 },
      condition: 'golden-crown', qualityScore: 90,
    }
    const result = classifyCourtType([jewel])
    expect(result).toBe('grand-palace')
  })
})

// ─── classifyCourtCondition ───────────────────────────────────────

describe('classifyCourtCondition', () => {
  it('classifies imperial-palace for high avg', () => {
    expect(classifyCourtCondition(80)).toBe('imperial-palace')
    expect(classifyCourtCondition(75)).toBe('imperial-palace')
  })

  it('classifies royal-court for good avg', () => {
    expect(classifyCourtCondition(60)).toBe('royal-court')
    expect(classifyCourtCondition(70)).toBe('royal-court')
  })

  it('classifies void for zero avg', () => {
    expect(classifyCourtCondition(0)).toBe('void')
    expect(classifyCourtCondition(10)).toBe('void')
  })
})

// ─── classifyMonarchGrade ─────────────────────────────────────────

describe('classifyMonarchGrade', () => {
  it('classifies emperor for high sovereignty', () => {
    expect(classifyMonarchGrade(85)).toBe('emperor')
    expect(classifyMonarchGrade(80)).toBe('emperor')
  })

  it('classifies king for good sovereignty', () => {
    expect(classifyMonarchGrade(65)).toBe('king')
    expect(classifyMonarchGrade(70)).toBe('king')
  })

  it('classifies duke for moderate sovereignty', () => {
    expect(classifyMonarchGrade(50)).toBe('duke')
    expect(classifyMonarchGrade(55)).toBe('duke')
  })

  it('classifies baron for low sovereignty', () => {
    expect(classifyMonarchGrade(35)).toBe('baron')
    expect(classifyMonarchGrade(40)).toBe('baron')
  })

  it('classifies knight for poor sovereignty', () => {
    expect(classifyMonarchGrade(20)).toBe('knight')
    expect(classifyMonarchGrade(25)).toBe('knight')
  })

  it('classifies peasant for zero sovereignty', () => {
    expect(classifyMonarchGrade(0)).toBe('peasant')
    expect(classifyMonarchGrade(10)).toBe('peasant')
  })
})

// ─── analyzeCrownJewel ────────────────────────────────────────────

describe('analyzeCrownJewel', () => {
  it('analyzes empty content', () => {
    const jewel = analyzeCrownJewel(emptyContent, 'empty.ts')
    expect(jewel.file).toBe('empty.ts')
    expect(jewel.qualityScore).toBe(0)
    expect(jewel.condition).toBe('scrap-metal')
  })

  it('analyzes rich content with high scores', () => {
    const jewel = analyzeCrownJewel(richContent, 'rich.ts')
    expect(jewel.qualityScore).toBeGreaterThan(50)
    expect(jewel.condition).not.toBe('scrap-metal')
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const jewel = analyzeCrownJewel(moderateContent, 'mod.ts')
    const expected = Math.round(
      jewel.remembering.wisdom * 0.2 +
      jewel.resisting.resistance * 0.2 +
      jewel.gleaming.quality * 0.2 +
      jewel.stabilizing.stability * 0.2 +
      jewel.preparing.readiness * 0.2,
    )
    expect(jewel.qualityScore).toBe(expected)
  })

  it('propagates measure scores to jewel fields', () => {
    const jewel = analyzeCrownJewel(richContent, 'rich.ts')
    expect(jewel.legacyWisdom).toBe(jewel.remembering.wisdom)
    expect(jewel.corrosionResistance).toBe(jewel.resisting.resistance)
    expect(jewel.gildedQuality).toBe(jewel.gleaming.quality)
    expect(jewel.reignStability).toBe(jewel.stabilizing.stability)
    expect(jewel.coronationReadiness).toBe(jewel.preparing.readiness)
  })
})

// ─── analyzeRoyalCourt ────────────────────────────────────────────

describe('analyzeRoyalCourt', () => {
  it('returns empty court for no jewels', () => {
    const court = analyzeRoyalCourt([], 'empty-dir')
    expect(court.directory).toBe('empty-dir')
    expect(court.jewels).toHaveLength(0)
    expect(court.courtType).toBe('no-court')
    expect(court.condition).toBe('void')
  })

  it('computes averages from jewels', () => {
    const jewel = analyzeCrownJewel(richContent, 'dir/rich.ts')
    const court = analyzeRoyalCourt([jewel], 'dir')
    expect(court.avgWisdom).toBe(jewel.legacyWisdom)
    expect(court.avgStability).toBe(jewel.reignStability)
    expect(court.avgReadiness).toBe(jewel.coronationReadiness)
  })
})

// ─── buildRustedCrownResult ───────────────────────────────────────

describe('buildRustedCrownResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildRustedCrownResult([], [])
    expect(result.jewels).toHaveLength(0)
    expect(result.courts).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.kingdom.isSovereign).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildRustedCrownResult(['index.ts'], [richContent])
    expect(result.jewels).toHaveLength(1)
    expect(result.courts).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildRustedCrownResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.jewels).toHaveLength(2)
    expect(result.courts).toHaveLength(1)
  })

  it('computes kingdom summary correctly', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [richContent])
    expect(result.kingdom.avgWisdom).toBeGreaterThan(0)
    expect(result.kingdom.avgStability).toBeGreaterThan(0)
    expect(result.kingdom.avgReadiness).toBeGreaterThan(0)
    expect(result.kingdom.overallSovereignty).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const result = await buildRustedCrownResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.goldenCrownCount +
      result.stats.silverDiademCount +
      result.stats.properTiaraCount +
      result.stats.rustedCircletCount +
      result.stats.brokenCrownCount +
      result.stats.scrapMetalCount
    expect(total).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [richContent])
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResistanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighStabilityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighReadinessCount).toBeGreaterThanOrEqual(0)
  })

  it('computes best fields', async () => {
    const result = await buildRustedCrownResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestJewel).toBeDefined()
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.mostResistant).toBeDefined()
    expect(result.stats.highestQuality).toBeDefined()
    expect(result.stats.mostStable).toBeDefined()
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests legacy wisdom improvement for low wisdom', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('wisdom'))
    expect(rec).toBe(true)
  })

  it('suggests corrosion resistance improvement for low resistance', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('corrosion'))
    expect(rec).toBe(true)
  })

  it('mentions scrap metal files', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('scrap'))
    expect(rec).toBe(true)
  })
})

// ─── colorScore ───────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

// ─── colorGrade ───────────────────────────────────────────────────

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('golden-crown')).toBe('string')
    expect(typeof colorGrade('scrap-metal')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatJewelTable ─────────────────────────────────────────────

describe('formatJewelTable', () => {
  it('formats a jewel', () => {
    const jewel = analyzeCrownJewel(richContent, 'rich.ts')
    const formatted = formatJewelTable(jewel)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Legacy Wisdom')
    expect(formatted).toContain('Corrosion Resistance')
    expect(formatted).toContain('Gilded Quality')
    expect(formatted).toContain('Score')
  })
})

// ─── formatJewelsTable ────────────────────────────────────────────

describe('formatJewelsTable', () => {
  it('returns message for empty jewels', () => {
    expect(formatJewelsTable([])).toContain('No crown jewels')
  })
})

// ─── formatCourtTable ─────────────────────────────────────────────

describe('formatCourtTable', () => {
  it('formats a court', () => {
    const jewel = analyzeCrownJewel(richContent, 'src/a.ts')
    const court = analyzeRoyalCourt([jewel], 'src')
    const formatted = formatCourtTable(court)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Court:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatCourtsTable ────────────────────────────────────────────

describe('formatCourtsTable', () => {
  it('returns message for empty courts', () => {
    expect(formatCourtsTable([])).toContain('No royal courts')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Sovereignty')
    expect(formatted).toContain('Monarch Grade')
    expect(formatted).toContain('Best Jewel')
  })
})

// ─── formatRecommendations ────────────────────────────────────────

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatResultTable ────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Rusted Crown Analysis')
    expect(formatted).toContain('Royal Courts')
    expect(formatted).toContain('Rusted Crown Statistics')
    expect(formatted).toContain('Kingdom')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.jewels).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.kingdom).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildRustedCrownResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.jewels).toHaveLength(3)
    expect(result.courts).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.kingdom.overallSovereignty).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('kingdom isSovereign for high wisdom', async () => {
    const result = await buildRustedCrownResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.kingdom.isSovereign).toBe(true)
  })

  it('kingdom is not sovereign for low wisdom', async () => {
    const result = await buildRustedCrownResult(['empty.ts'], [emptyContent])
    expect(result.kingdom.isSovereign).toBe(false)
  })

  it('overallSovereignty equals avg of wisdom, stability, readiness', async () => {
    const result = await buildRustedCrownResult(['a.ts'], [moderateContent])
    const expected = Math.round((result.kingdom.avgWisdom + result.kingdom.avgStability + result.kingdom.avgReadiness) / 3)
    expect(result.kingdom.overallSovereignty).toBe(expected)
  })
})
