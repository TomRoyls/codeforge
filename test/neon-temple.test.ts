import { describe, it, expect } from 'vitest'
import {
  measureIlluminating,
  measureVibrating,
  measureGlowing,
  measureExpressing,
  measurePowering,
  classifyPrayerCondition,
  classifyGridType,
  classifyGridCondition,
  classifyPriestGrade,
  analyzeNeonPrayer,
  analyzeTempleGrid,
  buildNeonTempleResult,
  generateRecommendations,
} from '../src/commands/neon-temple-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPrayerTable,
  formatPrayersTable,
  formatGridTable,
  formatGridsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/neon-temple-format-helpers.js'
import type {
  NeonPrayer,
  NeonTempleResult,
} from '../src/commands/neon-temple-helpers.js'

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

// ─── measureIlluminating ────────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureIlluminating(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('dark')
    expect(m.hasHighQuality).toBe(false)
  })

  it('detects readable patterns in rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasReadable).toBe(true)
    expect(m.hasWellFormatted).toBe(true)
    expect(m.hasHighlighted).toBe(true)
  })

  it('detects dense code in poor content', () => {
    const m = measureIlluminating(poorContent)
    expect(m.denseCount).toBeGreaterThan(0)
    expect(m.hasNoDense).toBe(false)
    expect(m.blendedCount).toBeGreaterThan(0)
    expect(m.hasNoBlended).toBe(false)
  })

  it('detects clear patterns in rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasClear).toBe(true)
    expect(m.hasSpacious).toBe(true)
    expect(m.hasLuminous).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureIlluminating(richContent).grade).not.toBe('dark')
    expect(measureIlluminating(emptyContent).grade).toBe('dark')
  })

  it('has quality capped at 100', () => {
    const m = measureIlluminating(richContent)
    expect(m.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureVibrating ──────────────────────────────────────────────

describe('measureVibrating', () => {
  it('returns 0 vibrancy for empty content', () => {
    const m = measureVibrating(emptyContent)
    expect(m.vibrancy).toBe(0)
    expect(m.vibration).toBe('no-pulse')
    expect(m.hasHighVibrancy).toBe(false)
  })

  it('detects dynamic patterns in rich content', () => {
    const m = measureVibrating(richContent)
    expect(m.hasDynamic).toBe(true)
    expect(m.hasAlive).toBe(true)
    expect(m.hasInteractive).toBe(true)
  })

  it('detects dead code in poor content', () => {
    const m = measureVibrating(poorContent)
    expect(m.deadCount).toBeGreaterThan(0)
    expect(m.hasNoDead).toBe(false)
    expect(m.staticCount).toBeGreaterThan(0)
    expect(m.hasNoStatic).toBe(false)
  })

  it('detects responsive and engaging patterns in rich content', () => {
    const m = measureVibrating(richContent)
    expect(m.hasResponsive).toBe(true)
    expect(m.hasEngaging).toBe(true)
    expect(m.hasEnergetic).toBe(true)
  })

  it('classifies vibration correctly', () => {
    expect(measureVibrating(emptyContent).vibration).toBe('no-pulse')
    expect(measureVibrating(richContent).vibration).not.toBe('no-pulse')
  })

  it('has vibrancy capped at 100', () => {
    const m = measureVibrating(richContent)
    expect(m.vibrancy).toBeLessThanOrEqual(100)
  })
})

// ─── measureGlowing ────────────────────────────────────────────────

describe('measureGlowing', () => {
  it('returns 0 consistency for empty content', () => {
    const m = measureGlowing(emptyContent)
    expect(m.consistency).toBe(0)
    expect(m.glow).toBe('dark')
    expect(m.hasHighConsistency).toBe(false)
  })

  it('detects uniform style in rich content', () => {
    const m = measureGlowing(richContent)
    expect(m.hasUniformStyle).toBe(true)
    expect(m.hasConsistentNaming).toBe(true)
    expect(m.hasRegularPatterns).toBe(true)
  })

  it('detects mixed code in poor content', () => {
    const m = measureGlowing(poorContent)
    expect(m.mixedCount).toBeGreaterThan(0)
    expect(m.hasNoMixed).toBe(false)
    expect(m.randomVariationCount).toBeGreaterThan(0)
    expect(m.hasNoRandomVariation).toBe(false)
  })

  it('detects stable and harmonious patterns in rich content', () => {
    const m = measureGlowing(richContent)
    expect(m.hasStableConventions).toBe(true)
    expect(m.hasHarmonious).toBe(true)
  })

  it('classifies glow correctly', () => {
    expect(measureGlowing(emptyContent).glow).toBe('dark')
    expect(measureGlowing(richContent).glow).not.toBe('dark')
  })

  it('has consistency capped at 100', () => {
    const m = measureGlowing(richContent)
    expect(m.consistency).toBeLessThanOrEqual(100)
  })
})

// ─── measureExpressing ────────────────────────────────────────────

describe('measureExpressing', () => {
  it('returns 0 clarity for empty content', () => {
    const m = measureExpressing(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.prayer).toBe('no-prayer')
    expect(m.hasHighClarity).toBe(false)
  })

  it('detects clear intent in rich content', () => {
    const m = measureExpressing(richContent)
    expect(m.hasClearIntent).toBe(true)
    expect(m.hasDescriptive).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects cryptic code in poor content', () => {
    const m = measureExpressing(poorContent)
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.unreadableCount).toBeGreaterThan(0)
    expect(m.hasNoUnreadable).toBe(false)
  })

  it('detects expressive and meaningful patterns in rich content', () => {
    const m = measureExpressing(richContent)
    expect(m.hasExpressive).toBe(true)
    expect(m.hasMeaningful).toBe(true)
    expect(m.hasIntentional).toBe(true)
  })

  it('classifies prayer correctly', () => {
    expect(measureExpressing(emptyContent).prayer).toBe('no-prayer')
    expect(measureExpressing(richContent).prayer).not.toBe('no-prayer')
  })

  it('has clarity capped at 100', () => {
    const m = measureExpressing(richContent)
    expect(m.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measurePowering ──────────────────────────────────────────────

describe('measurePowering', () => {
  it('returns 0 efficiency for empty content', () => {
    const m = measurePowering(emptyContent)
    expect(m.efficiency).toBe(0)
    expect(m.energy).toBe('no-power')
    expect(m.hasHighEfficiency).toBe(false)
  })

  it('detects optimized patterns in rich content', () => {
    const m = measurePowering(richContent)
    expect(m.hasOptimized).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasLean).toBe(true)
  })

  it('detects wasteful code in poor content', () => {
    const m = measurePowering(poorContent)
    expect(m.wastefulCount).toBeGreaterThan(0)
    expect(m.hasNoWasteful).toBe(false)
    expect(m.bloatedCount).toBeGreaterThan(0)
    expect(m.hasNoBloated).toBe(false)
  })

  it('detects performant and cached patterns in rich content', () => {
    const m = measurePowering(richContent)
    expect(m.hasCached).toBe(true)
    expect(m.hasPerformant).toBe(true)
  })

  it('classifies energy correctly', () => {
    expect(measurePowering(emptyContent).energy).toBe('no-power')
    expect(measurePowering(richContent).energy).not.toBe('no-power')
  })

  it('has efficiency capped at 100', () => {
    const m = measurePowering(richContent)
    expect(m.efficiency).toBeLessThanOrEqual(100)
  })
})

// ─── classifyPrayerCondition ───────────────────────────────────────

describe('classifyPrayerCondition', () => {
  it('classifies divine-neon for high scores', () => {
    expect(classifyPrayerCondition(90)).toBe('divine-neon')
    expect(classifyPrayerCondition(85)).toBe('divine-neon')
  })

  it('classifies radiant-temple for good scores', () => {
    expect(classifyPrayerCondition(70)).toBe('radiant-temple')
    expect(classifyPrayerCondition(75)).toBe('radiant-temple')
  })

  it('classifies proper-shrine for moderate scores', () => {
    expect(classifyPrayerCondition(55)).toBe('proper-shrine')
    expect(classifyPrayerCondition(60)).toBe('proper-shrine')
  })

  it('classifies dim-sanctuary for low scores', () => {
    expect(classifyPrayerCondition(40)).toBe('dim-sanctuary')
    expect(classifyPrayerCondition(45)).toBe('dim-sanctuary')
  })

  it('classifies dark-chapel for poor scores', () => {
    expect(classifyPrayerCondition(25)).toBe('dark-chapel')
    expect(classifyPrayerCondition(30)).toBe('dark-chapel')
  })

  it('classifies abandoned for very low scores', () => {
    expect(classifyPrayerCondition(0)).toBe('abandoned')
    expect(classifyPrayerCondition(10)).toBe('abandoned')
    expect(classifyPrayerCondition(24)).toBe('abandoned')
  })
})

// ─── classifyGridType ──────────────────────────────────────────────

describe('classifyGridType', () => {
  it('returns no-grid for empty prayers', () => {
    expect(classifyGridType([])).toBe('no-grid')
  })

  it('classifies neon-megachurch for high quality with divine ratio', () => {
    const prayer: NeonPrayer = {
      file: 'a.ts', luminosityQuality: 90, structureVibrancy: 90, glowConsistency: 90,
      prayerClarity: 90, energyEfficiency: 90,
      illuminating: { quality: 90, grade: 'blinding-light', hasHighQuality: true, hasReadable: true, hasWellFormatted: true, hasNoDense: true, hasHighlighted: true, hasNoBlended: true, hasClear: true, hasNoObfuscated: true, hasSpacious: true, hasNoCluttered: true, hasLuminous: true, denseCount: 0, blendedCount: 0 },
      vibrating: { vibrancy: 90, vibration: 'electric-energy', hasHighVibrancy: true, hasDynamic: true, hasAlive: true, hasNoDead: true, hasResponsive: true, hasNoStatic: true, hasInteractive: true, hasNoPassive: true, hasEngaging: true, hasNoBoring: true, hasEnergetic: true, deadCount: 0, staticCount: 0 },
      glowing: { consistency: 90, glow: 'steady-beam', hasHighConsistency: true, hasUniformStyle: true, hasConsistentNaming: true, hasNoMixed: true, hasRegularPatterns: true, hasNoRandomVariation: true, hasStableConventions: true, hasNoAdhoc: true, hasPredictable: true, hasNoSurprising: true, hasHarmonious: true, mixedCount: 0, randomVariationCount: 0 },
      expressing: { clarity: 90, prayer: 'divine-message', hasHighClarity: true, hasClearIntent: true, hasDescriptive: true, hasNoCryptic: true, hasSelfDocumenting: true, hasNoUnreadable: true, hasExpressive: true, hasNoVague: true, hasMeaningful: true, hasNoArbitrary: true, hasIntentional: true, crypticCount: 0, unreadableCount: 0 },
      powering: { efficiency: 90, energy: 'fusion-reactor', hasHighEfficiency: true, hasOptimized: true, hasEfficient: true, hasNoWasteful: true, hasLean: true, hasNoBloated: true, hasCached: true, hasNoRecalculating: true, hasPerformant: true, hasNoSluggish: true, hasEconomical: true, wastefulCount: 0, bloatedCount: 0 },
      condition: 'divine-neon', qualityScore: 90,
    }
    const result = classifyGridType([prayer])
    expect(result).toBe('neon-megachurch')
  })
})

// ─── classifyGridCondition ─────────────────────────────────────────

describe('classifyGridCondition', () => {
  it('classifies neon-paradise for high avg', () => {
    expect(classifyGridCondition(80)).toBe('neon-paradise')
    expect(classifyGridCondition(75)).toBe('neon-paradise')
  })

  it('classifies glowing-city for good avg', () => {
    expect(classifyGridCondition(60)).toBe('glowing-city')
    expect(classifyGridCondition(70)).toBe('glowing-city')
  })

  it('classifies decent-temple for moderate avg', () => {
    expect(classifyGridCondition(45)).toBe('decent-temple')
    expect(classifyGridCondition(55)).toBe('decent-temple')
  })

  it('classifies void for zero avg', () => {
    expect(classifyGridCondition(0)).toBe('void')
    expect(classifyGridCondition(10)).toBe('void')
  })
})

// ─── classifyPriestGrade ───────────────────────────────────────────

describe('classifyPriestGrade', () => {
  it('classifies high-priest for high brilliance', () => {
    expect(classifyPriestGrade(85)).toBe('high-priest')
    expect(classifyPriestGrade(80)).toBe('high-priest')
  })

  it('classifies temple-guardian for good brilliance', () => {
    expect(classifyPriestGrade(65)).toBe('temple-guardian')
    expect(classifyPriestGrade(70)).toBe('temple-guardian')
  })

  it('classifies skilled-acolyte for moderate brilliance', () => {
    expect(classifyPriestGrade(50)).toBe('skilled-acolyte')
    expect(classifyPriestGrade(55)).toBe('skilled-acolyte')
  })

  it('classifies apprentice for low brilliance', () => {
    expect(classifyPriestGrade(35)).toBe('apprentice')
    expect(classifyPriestGrade(40)).toBe('apprentice')
  })

  it('classifies novice for poor brilliance', () => {
    expect(classifyPriestGrade(20)).toBe('novice')
    expect(classifyPriestGrade(25)).toBe('novice')
  })

  it('classifies unbeliever for zero brilliance', () => {
    expect(classifyPriestGrade(0)).toBe('unbeliever')
    expect(classifyPriestGrade(10)).toBe('unbeliever')
  })
})

// ─── analyzeNeonPrayer ─────────────────────────────────────────────

describe('analyzeNeonPrayer', () => {
  it('analyzes empty content', () => {
    const prayer = analyzeNeonPrayer(emptyContent, 'empty.ts')
    expect(prayer.file).toBe('empty.ts')
    expect(prayer.qualityScore).toBe(0)
    expect(prayer.condition).toBe('abandoned')
  })

  it('analyzes rich content with high scores', () => {
    const prayer = analyzeNeonPrayer(richContent, 'rich.ts')
    expect(prayer.qualityScore).toBeGreaterThan(50)
    expect(prayer.condition).not.toBe('abandoned')
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const prayer = analyzeNeonPrayer(moderateContent, 'mod.ts')
    const expected = Math.round(
      prayer.illuminating.quality * 0.2 +
      prayer.vibrating.vibrancy * 0.2 +
      prayer.glowing.consistency * 0.2 +
      prayer.expressing.clarity * 0.2 +
      prayer.powering.efficiency * 0.2,
    )
    expect(prayer.qualityScore).toBe(expected)
  })

  it('propagates measure scores to prayer fields', () => {
    const prayer = analyzeNeonPrayer(richContent, 'rich.ts')
    expect(prayer.luminosityQuality).toBe(prayer.illuminating.quality)
    expect(prayer.structureVibrancy).toBe(prayer.vibrating.vibrancy)
    expect(prayer.glowConsistency).toBe(prayer.glowing.consistency)
    expect(prayer.prayerClarity).toBe(prayer.expressing.clarity)
    expect(prayer.energyEfficiency).toBe(prayer.powering.efficiency)
  })
})

// ─── analyzeTempleGrid ─────────────────────────────────────────────

describe('analyzeTempleGrid', () => {
  it('returns empty grid for no prayers', () => {
    const grid = analyzeTempleGrid([], 'empty-dir')
    expect(grid.directory).toBe('empty-dir')
    expect(grid.prayers).toHaveLength(0)
    expect(grid.gridType).toBe('no-grid')
    expect(grid.condition).toBe('void')
  })

  it('computes averages from prayers', () => {
    const prayer = analyzeNeonPrayer(richContent, 'dir/rich.ts')
    const grid = analyzeTempleGrid([prayer], 'dir')
    expect(grid.avgLuminosity).toBe(prayer.luminosityQuality)
    expect(grid.avgConsistency).toBe(prayer.glowConsistency)
    expect(grid.avgEfficiency).toBe(prayer.energyEfficiency)
  })
})

// ─── buildNeonTempleResult ─────────────────────────────────────────

describe('buildNeonTempleResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildNeonTempleResult([], [])
    expect(result.prayers).toHaveLength(0)
    expect(result.grids).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.city.isRadiant).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildNeonTempleResult(['index.ts'], [richContent])
    expect(result.prayers).toHaveLength(1)
    expect(result.grids).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildNeonTempleResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.prayers).toHaveLength(2)
    expect(result.grids).toHaveLength(1)
  })

  it('computes city summary correctly', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [richContent])
    expect(result.city.avgLuminosity).toBeGreaterThan(0)
    expect(result.city.avgConsistency).toBeGreaterThan(0)
    expect(result.city.avgEfficiency).toBeGreaterThan(0)
    expect(result.city.overallBrilliance).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const result = await buildNeonTempleResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.divineNeonCount +
      result.stats.radiantTempleCount +
      result.stats.properShrineCount +
      result.stats.dimSanctuaryCount +
      result.stats.darkChapelCount +
      result.stats.abandonedCount
    expect(total).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [richContent])
    expect(result.stats.hasHighLuminosityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighVibrancyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighConsistencyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEfficiencyCount).toBeGreaterThanOrEqual(0)
  })

  it('computes best fields', async () => {
    const result = await buildNeonTempleResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestPrayer).toBeDefined()
    expect(result.stats.brightest).toBeDefined()
    expect(result.stats.mostVibrant).toBeDefined()
    expect(result.stats.mostConsistent).toBeDefined()
    expect(result.stats.mostEfficient).toBeDefined()
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests luminosity improvement for low quality', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('luminosity'))
    expect(rec).toBe(true)
  })

  it('suggests vibrancy improvement for low vibrancy', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('vibrancy'))
    expect(rec).toBe(true)
  })

  it('suggests consistency improvement for low consistency', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('consistency'))
    expect(rec).toBe(true)
  })

  it('mentions abandoned files', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('abandoned'))
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
    expect(typeof colorGrade('divine-neon')).toBe('string')
    expect(typeof colorGrade('abandoned')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatPrayerTable ─────────────────────────────────────────────

describe('formatPrayerTable', () => {
  it('formats a prayer', () => {
    const prayer = analyzeNeonPrayer(richContent, 'rich.ts')
    const formatted = formatPrayerTable(prayer)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Luminosity Quality')
    expect(formatted).toContain('Structure Vibrancy')
    expect(formatted).toContain('Glow Consistency')
    expect(formatted).toContain('Score')
  })
})

// ─── formatPrayersTable ────────────────────────────────────────────

describe('formatPrayersTable', () => {
  it('returns message for empty prayers', () => {
    expect(formatPrayersTable([])).toContain('No neon prayers')
  })
})

// ─── formatGridTable ──────────────────────────────────────────────

describe('formatGridTable', () => {
  it('formats a grid', () => {
    const prayer = analyzeNeonPrayer(richContent, 'src/a.ts')
    const grid = analyzeTempleGrid([prayer], 'src')
    const formatted = formatGridTable(grid)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Grid:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatGridsTable ─────────────────────────────────────────────

describe('formatGridsTable', () => {
  it('returns message for empty grids', () => {
    expect(formatGridsTable([])).toContain('No temple grids')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Brilliance')
    expect(formatted).toContain('Priest Grade')
    expect(formatted).toContain('Best Prayer')
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
    const result = await buildNeonTempleResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Neon Temple Analysis')
    expect(formatted).toContain('Temple Grids')
    expect(formatted).toContain('Neon Temple Statistics')
    expect(formatted).toContain('City Summary')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.prayers).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.city).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildNeonTempleResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.prayers).toHaveLength(3)
    expect(result.grids).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.city.overallBrilliance).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('city isRadiant for high luminosity', async () => {
    const result = await buildNeonTempleResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.city.isRadiant).toBe(true)
  })

  it('city is not radiant for low luminosity', async () => {
    const result = await buildNeonTempleResult(['empty.ts'], [emptyContent])
    expect(result.city.isRadiant).toBe(false)
  })

  it('overallBrilliance equals avg of luminosity, consistency, efficiency', async () => {
    const result = await buildNeonTempleResult(['a.ts'], [moderateContent])
    const expected = Math.round((result.city.avgLuminosity + result.city.avgConsistency + result.city.avgEfficiency) / 3)
    expect(result.city.overallBrilliance).toBe(expected)
  })
})
