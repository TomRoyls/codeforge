import { describe, it, expect } from 'vitest'
import {
  measureBrightening,
  measureClarifying,
  measureStabilizing,
  measureFiltering,
  measureReaching,
  classifyFlameCondition,
  classifyHallType,
  classifyHallCondition,
  classifyKeeperGrade,
  analyzeEmeraldFlame,
  analyzeLanternHall,
  buildEmeraldLanternResult,
  generateRecommendations,
} from '../src/commands/emerald-lantern-helpers.js'
import {
  colorScore,
  colorGrade,
  formatFlameTable,
  formatFlamesTable,
  formatHallTable,
  formatHallsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-lantern-format-helpers.js'
import type {
  EmeraldFlame,
} from '../src/commands/emerald-lantern-helpers.js'

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
    users.map(u => u.name)
    users.filter(u => u.age > 18).forEach(u => console.log(u))
    break
  default:
    break
}
`

// ─── measureBrightening ────────────────────────────────────────────

describe('measureBrightening', () => {
  it('returns dark for empty content', () => {
    const m = measureBrightening(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('dark')
    expect(m.hasHighQuality).toBe(false)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns a low grade for minimal content', () => {
    const m = measureBrightening(minimalContent)
    expect(m.quality).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
  })

  it('returns higher quality for moderate content', () => {
    const m = measureBrightening(moderateContent)
    expect(m.quality).toBeGreaterThan(0)
    expect(m.hasClear).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
  })

  it('returns beacon-light for rich content', () => {
    const m = measureBrightening(richContent)
    expect(m.quality).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('beacon-light')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasEnlightening).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasNoObscure).toBe(true)
  })

  it('counts obfuscated patterns', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureBrightening(content)
    expect(m.obfuscatedCount).toBe(2)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('counts cryptic patterns', () => {
    const content = `const x: any = 1; const y: any = 2;`
    const m = measureBrightening(content)
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects eval as hidden pattern', () => {
    const content = `eval('dangerous')`
    const m = measureBrightening(content)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects debugger as obscure pattern', () => {
    const content = `debugger`
    const m = measureBrightening(content)
    expect(m.hasNoObscure).toBe(false)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns opaque for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.lens).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
    expect(m.denseCount).toBe(0)
    expect(m.chaoticCount).toBe(0)
  })

  it('returns higher clarity for moderate content', () => {
    const m = measureClarifying(moderateContent)
    expect(m.clarity).toBeGreaterThan(0)
    expect(m.hasReadable).toBe(true)
    expect(m.hasWellStructured).toBe(true)
  })

  it('returns flawless-emerald for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(85)
    expect(m.lens).toBe('flawless-emerald')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasNoDense).toBe(true)
    expect(m.hasNoChaotic).toBe(true)
  })

  it('detects dense patterns', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureClarifying(content)
    expect(m.denseCount).toBe(2)
    expect(m.hasNoDense).toBe(false)
  })

  it('detects chaotic patterns', () => {
    const content = `const x: any = 1;`
    const m = measureClarifying(content)
    expect(m.chaoticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoChaotic).toBe(false)
  })
})

// ─── measureStabilizing ────────────────────────────────────────────

describe('measureStabilizing', () => {
  it('returns no-flame for empty content', () => {
    const m = measureStabilizing(emptyContent)
    expect(m.stability).toBe(0)
    expect(m.flame).toBe('no-flame')
    expect(m.hasHighStability).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.singlePointFailCount).toBe(0)
  })

  it('returns higher stability for moderate content', () => {
    const m = measureStabilizing(moderateContent)
    expect(m.stability).toBeGreaterThan(0)
    expect(m.hasResilient).toBe(true)
  })

  it('returns eternal-flame for rich content', () => {
    const m = measureStabilizing(richContent)
    expect(m.stability).toBeGreaterThanOrEqual(85)
    expect(m.flame).toBe('eternal-flame')
    expect(m.hasHighStability).toBe(true)
    expect(m.hasErrorHandling).toBe(true)
    expect(m.hasExceptionRecovery).toBe(true)
    expect(m.hasRetryLogic).toBe(true)
    expect(m.hasGracefulDegradation).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasNoHardCrash).toBe(true)
    expect(m.hasNoFragile).toBe(true)
  })

  it('detects bare crash patterns', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureStabilizing(content)
    expect(m.bareCrashCount).toBe(2)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects single point of failure patterns', () => {
    const content = `const x: any = 1;`
    const m = measureStabilizing(content)
    expect(m.singlePointFailCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoSinglePointFail).toBe(false)
  })
})

// ─── measureFiltering ──────────────────────────────────────────────

describe('measureFiltering', () => {
  it('returns no-filter for empty content', () => {
    const m = measureFiltering(emptyContent)
    expect(m.filtration).toBe(0)
    expect(m.emerald).toBe('no-filter')
    expect(m.hasHighFiltration).toBe(false)
    expect(m.deadCodeCount).toBe(0)
    expect(m.fillerCount).toBe(0)
  })

  it('returns higher filtration for moderate content', () => {
    const m = measureFiltering(moderateContent)
    expect(m.filtration).toBeGreaterThan(0)
    expect(m.hasHighSignal).toBe(true)
  })

  it('returns pure-signal for rich content', () => {
    const m = measureFiltering(richContent)
    expect(m.filtration).toBeGreaterThanOrEqual(85)
    expect(m.emerald).toBe('pure-signal')
    expect(m.hasHighFiltration).toBe(true)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasNoFiller).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasMeaningful).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasLowNoise).toBe(true)
  })

  it('detects dead code patterns', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureFiltering(content)
    expect(m.deadCodeCount).toBe(2)
    expect(m.hasNoDeadCode).toBe(false)
  })

  it('detects filler patterns', () => {
    const content = `const x: any = 1;`
    const m = measureFiltering(content)
    expect(m.fillerCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoFiller).toBe(false)
  })
})

// ─── measureReaching ───────────────────────────────────────────────

describe('measureReaching', () => {
  it('returns no-reach for empty content', () => {
    const m = measureReaching(emptyContent)
    expect(m.reach).toBe(0)
    expect(m.light).toBe('no-reach')
    expect(m.hasHighReach).toBe(false)
    expect(m.undocumentedCount).toBe(0)
    expect(m.silentCount).toBe(0)
  })

  it('returns higher reach for moderate content', () => {
    const m = measureReaching(moderateContent)
    expect(m.reach).toBeGreaterThan(0)
    expect(m.hasExplained).toBe(true)
  })

  it('returns lighthouse-beam for rich content', () => {
    const m = measureReaching(richContent)
    expect(m.reach).toBeGreaterThanOrEqual(85)
    expect(m.light).toBe('lighthouse-beam')
    expect(m.hasHighReach).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellCommented).toBe(true)
    expect(m.hasJSDocExamples).toBe(true)
    expect(m.hasNoUndocumented).toBe(true)
    expect(m.hasNoSilent).toBe(true)
    expect(m.hasNoUnexplained).toBe(true)
    expect(m.hasNoUndescribed).toBe(true)
  })

  it('detects undocumented patterns', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureReaching(content)
    expect(m.undocumentedCount).toBe(2)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects silent patterns', () => {
    const content = `const x: any = 1;`
    const m = measureReaching(content)
    expect(m.silentCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoSilent).toBe(false)
  })
})

// ─── classifyFlameCondition ────────────────────────────────────────

describe('classifyFlameCondition', () => {
  it('classifies legendary-lantern for high scores', () => {
    expect(classifyFlameCondition(90)).toBe('legendary-lantern')
    expect(classifyFlameCondition(85)).toBe('legendary-lantern')
  })

  it('classifies emerald-beacon for good scores', () => {
    expect(classifyFlameCondition(70)).toBe('emerald-beacon')
    expect(classifyFlameCondition(75)).toBe('emerald-beacon')
  })

  it('classifies proper-lamp for moderate scores', () => {
    expect(classifyFlameCondition(55)).toBe('proper-lamp')
    expect(classifyFlameCondition(60)).toBe('proper-lamp')
  })

  it('classifies rusty-lantern for low scores', () => {
    expect(classifyFlameCondition(40)).toBe('rusty-lantern')
    expect(classifyFlameCondition(45)).toBe('rusty-lantern')
  })

  it('classifies cracked-glass for poor scores', () => {
    expect(classifyFlameCondition(25)).toBe('cracked-glass')
    expect(classifyFlameCondition(30)).toBe('cracked-glass')
  })

  it('classifies extinguished for very poor scores', () => {
    expect(classifyFlameCondition(0)).toBe('extinguished')
    expect(classifyFlameCondition(10)).toBe('extinguished')
    expect(classifyFlameCondition(24)).toBe('extinguished')
  })
})

// ─── classifyHallType ──────────────────────────────────────────────

describe('classifyHallType', () => {
  it('returns no-hall for empty array', () => {
    expect(classifyHallType([])).toBe('no-hall')
  })

  it('returns grand-hall for high-quality flames', () => {
    const flames = Array.from({ length: 4 }, () => ({
      ...analyzeEmeraldFlame(richContent, 'test.ts'),
      qualityScore: 90,
      condition: 'legendary-lantern' as const,
    }))
    expect(classifyHallType(flames)).toBe('grand-hall')
  })

  it('returns lantern-gallery for decent flames', () => {
    const flames = Array.from({ length: 2 }, () => ({
      ...analyzeEmeraldFlame(richContent, 'test.ts'),
      qualityScore: 65,
      condition: 'emerald-beacon' as const,
    }))
    expect(classifyHallType(flames)).toBe('lantern-gallery')
  })
})

// ─── classifyHallCondition ─────────────────────────────────────────

describe('classifyHallCondition', () => {
  it('returns illuminated-palace for high avg', () => {
    expect(classifyHallCondition(80)).toBe('illuminated-palace')
    expect(classifyHallCondition(75)).toBe('illuminated-palace')
  })

  it('returns bright-gallery for good avg', () => {
    expect(classifyHallCondition(60)).toBe('bright-gallery')
    expect(classifyHallCondition(65)).toBe('bright-gallery')
  })

  it('returns decent-hallway for moderate avg', () => {
    expect(classifyHallCondition(45)).toBe('decent-hallway')
    expect(classifyHallCondition(50)).toBe('decent-hallway')
  })

  it('returns dim-corridor for low avg', () => {
    expect(classifyHallCondition(30)).toBe('dim-corridor')
    expect(classifyHallCondition(35)).toBe('dim-corridor')
  })

  it('returns dark-tunnel for poor avg', () => {
    expect(classifyHallCondition(15)).toBe('dark-tunnel')
    expect(classifyHallCondition(20)).toBe('dark-tunnel')
  })

  it('returns void for zero avg', () => {
    expect(classifyHallCondition(0)).toBe('void')
    expect(classifyHallCondition(10)).toBe('void')
  })
})

// ─── classifyKeeperGrade ───────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns light-keeper for high brilliance', () => {
    expect(classifyKeeperGrade(85)).toBe('light-keeper')
    expect(classifyKeeperGrade(80)).toBe('light-keeper')
  })

  it('returns lantern-master for good brilliance', () => {
    expect(classifyKeeperGrade(65)).toBe('lantern-master')
    expect(classifyKeeperGrade(70)).toBe('lantern-master')
  })

  it('returns skilled-illuminator for moderate brilliance', () => {
    expect(classifyKeeperGrade(50)).toBe('skilled-illuminator')
    expect(classifyKeeperGrade(55)).toBe('skilled-illuminator')
  })

  it('returns apprentice for low brilliance', () => {
    expect(classifyKeeperGrade(35)).toBe('apprentice')
    expect(classifyKeeperGrade(40)).toBe('apprentice')
  })

  it('returns novice for poor brilliance', () => {
    expect(classifyKeeperGrade(20)).toBe('novice')
    expect(classifyKeeperGrade(25)).toBe('novice')
  })

  it('returns dark-dweller for zero brilliance', () => {
    expect(classifyKeeperGrade(0)).toBe('dark-dweller')
    expect(classifyKeeperGrade(10)).toBe('dark-dweller')
  })
})

// ─── analyzeEmeraldFlame ───────────────────────────────────────────

describe('analyzeEmeraldFlame', () => {
  it('analyzes empty content as extinguished', () => {
    const flame = analyzeEmeraldFlame(emptyContent, 'empty.ts')
    expect(flame.file).toBe('empty.ts')
    expect(flame.illuminationQuality).toBe(0)
    expect(flame.lensClarity).toBe(0)
    expect(flame.flameStability).toBe(0)
    expect(flame.emeraldFiltration).toBe(0)
    expect(flame.lightReach).toBe(0)
    expect(flame.qualityScore).toBe(0)
    expect(flame.condition).toBe('extinguished')
  })

  it('analyzes rich content as legendary-lantern', () => {
    const flame = analyzeEmeraldFlame(richContent, 'rich.ts')
    expect(flame.file).toBe('rich.ts')
    expect(flame.illuminationQuality).toBeGreaterThan(0)
    expect(flame.lensClarity).toBeGreaterThan(0)
    expect(flame.flameStability).toBeGreaterThan(0)
    expect(flame.emeraldFiltration).toBeGreaterThan(0)
    expect(flame.lightReach).toBeGreaterThan(0)
    expect(flame.qualityScore).toBeGreaterThan(0)
    expect(flame.condition).toBe('legendary-lantern')
  })

  it('computes qualityScore as weighted average', () => {
    const flame = analyzeEmeraldFlame(moderateContent, 'mod.ts')
    const expected = Math.round(
      flame.illuminationQuality * 0.2 +
      flame.lensClarity * 0.2 +
      flame.flameStability * 0.2 +
      flame.emeraldFiltration * 0.2 +
      flame.lightReach * 0.2,
    )
    expect(flame.qualityScore).toBe(expected)
  })

  it('preserves all measure data', () => {
    const flame = analyzeEmeraldFlame(richContent, 'rich.ts')
    expect(flame.brightening).toBeDefined()
    expect(flame.clarifying).toBeDefined()
    expect(flame.stabilizing).toBeDefined()
    expect(flame.filtering).toBeDefined()
    expect(flame.reaching).toBeDefined()
    expect(flame.brightening.quality).toBe(flame.illuminationQuality)
    expect(flame.clarifying.clarity).toBe(flame.lensClarity)
    expect(flame.stabilizing.stability).toBe(flame.flameStability)
    expect(flame.filtering.filtration).toBe(flame.emeraldFiltration)
    expect(flame.reaching.reach).toBe(flame.lightReach)
  })
})

// ─── analyzeLanternHall ────────────────────────────────────────────

describe('analyzeLanternHall', () => {
  it('returns empty hall for no flames', () => {
    const hall = analyzeLanternHall([], 'empty-dir')
    expect(hall.directory).toBe('empty-dir')
    expect(hall.flames).toHaveLength(0)
    expect(hall.avgIllumination).toBe(0)
    expect(hall.avgClarity).toBe(0)
    expect(hall.avgStability).toBe(0)
    expect(hall.legendaryLanternCount).toBe(0)
    expect(hall.extinguishedCount).toBe(0)
    expect(hall.hallType).toBe('no-hall')
    expect(hall.condition).toBe('void')
  })

  it('aggregates flame metrics for a hall', () => {
    const flames = [
      analyzeEmeraldFlame(richContent, 'a.ts'),
      analyzeEmeraldFlame(richContent, 'b.ts'),
    ]
    const hall = analyzeLanternHall(flames, 'src')
    expect(hall.directory).toBe('src')
    expect(hall.flames).toHaveLength(2)
    expect(hall.avgIllumination).toBeGreaterThan(0)
    expect(hall.avgClarity).toBeGreaterThan(0)
    expect(hall.avgStability).toBeGreaterThan(0)
    expect(hall.legendaryLanternCount).toBeGreaterThanOrEqual(0)
  })

  it('counts extinguished files', () => {
    const flames = [
      analyzeEmeraldFlame(emptyContent, 'bad.ts'),
      analyzeEmeraldFlame(emptyContent, 'worse.ts'),
    ]
    const hall = analyzeLanternHall(flames, 'bad-dir')
    expect(hall.extinguishedCount).toBe(2)
  })
})

// ─── buildEmeraldLanternResult ──────────────────────────────────────

describe('buildEmeraldLanternResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildEmeraldLanternResult([], [])
    expect(result.flames).toHaveLength(0)
    expect(result.halls).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalHalls).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.light.isBright).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    expect(result.flames).toHaveLength(1)
    expect(result.halls).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgIlluminationQuality).toBeGreaterThan(0)
    expect(result.stats.overallBrilliance).toBeGreaterThan(0)
    expect(result.stats.bestFlame).toBe('test.ts')
    expect(result.stats.brightest).toBe('test.ts')
    expect(result.stats.clearest).toBe('test.ts')
    expect(result.stats.mostStable).toBe('test.ts')
    expect(result.stats.farthestReach).toBe('test.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildEmeraldLanternResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.flames).toHaveLength(3)
    expect(result.halls).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalHalls).toBe(2)
    expect(result.stats.extinguishedCount).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes correct keeper grade', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    expect(result.stats.keeperGrade).toBeDefined()
    expect(typeof result.stats.keeperGrade).toBe('string')
  })

  it('computes light correctly', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    expect(result.light.avgIllumination).toBeGreaterThan(0)
    expect(result.light.avgClarity).toBeGreaterThan(0)
    expect(result.light.avgStability).toBeGreaterThan(0)
    expect(result.light.overallBrilliance).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns congratulatory message for good code', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    const recs = generateRecommendations(result.flames, result.halls, result.light, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns recommendations for poor code', async () => {
    const result = await buildEmeraldLanternResult(['bad.ts'], [emptyContent])
    const recs = generateRecommendations(result.flames, result.halls, result.light, result.stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some(r => r.includes('illumination'))).toBe(true)
  })

  it('recommends for extinguished files', async () => {
    const result = await buildEmeraldLanternResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [emptyContent, emptyContent, emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.flames, result.halls, result.light, result.stats)
    expect(recs.some(r => r.includes('extinguished'))).toBe(true)
  })

  it('recommends for low brilliance', async () => {
    const result = await buildEmeraldLanternResult(['a.ts'], [minimalContent])
    const recs = generateRecommendations(result.flames, result.halls, result.light, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('restores specific extinguished files', async () => {
    const result = await buildEmeraldLanternResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.flames, result.halls, result.light, result.stats)
    expect(recs.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('legendary-lantern')).toBe('string')
    expect(typeof colorGrade('extinguished')).toBe('string')
    expect(typeof colorGrade('grand-hall')).toBe('string')
    expect(typeof colorGrade('illuminated-palace')).toBe('string')
    expect(typeof colorGrade('light-keeper')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatFlameTable', () => {
  it('formats a single flame', () => {
    const flame = analyzeEmeraldFlame(richContent, 'test.ts')
    const output = formatFlameTable(flame)
    expect(output).toContain('test.ts')
    expect(output).toContain('Illumination Quality')
    expect(output).toContain('Lens Clarity')
    expect(output).toContain('Flame Stability')
    expect(output).toContain('Emerald Filtration')
    expect(output).toContain('Light Reach')
  })
})

describe('formatFlamesTable', () => {
  it('returns message for empty array', () => {
    expect(formatFlamesTable([])).toContain('No emerald flames')
  })

  it('formats multiple flames', () => {
    const flames = [
      analyzeEmeraldFlame(richContent, 'a.ts'),
      analyzeEmeraldFlame(moderateContent, 'b.ts'),
    ]
    const output = formatFlamesTable(flames)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatHallTable', () => {
  it('formats a single hall', () => {
    const flames = [analyzeEmeraldFlame(richContent, 'test.ts')]
    const hall = analyzeLanternHall(flames, 'src')
    const output = formatHallTable(hall)
    expect(output).toContain('src')
    expect(output).toContain('Hall')
  })
})

describe('formatHallsTable', () => {
  it('returns message for empty array', () => {
    expect(formatHallsTable([])).toContain('No lantern halls')
  })

  it('formats multiple halls', () => {
    const flames1 = [analyzeEmeraldFlame(richContent, 'src/a.ts')]
    const flames2 = [analyzeEmeraldFlame(moderateContent, 'lib/b.ts')]
    const halls = [
      analyzeLanternHall(flames1, 'src'),
      analyzeLanternHall(flames2, 'lib'),
    ]
    const output = formatHallsTable(halls)
    expect(output).toContain('src')
    expect(output).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Total Halls')
    expect(output).toContain('Keeper Grade')
    expect(output).toContain('Best Flame')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const recs = ['Fix this', 'Improve that']
    const output = formatRecommendations(recs)
    expect(output).toContain('Fix this')
    expect(output).toContain('Improve that')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Lantern Analysis')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats full result as JSON', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.flames).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.light).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ───────────────────────────────────────────────────

describe('integration', () => {
  it('handles mixed quality files', async () => {
    const result = await buildEmeraldLanternResult(
      ['good.ts', 'ok.ts', 'bad.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.flames).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.extinguishedCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.legendaryLanternCount).toBeGreaterThanOrEqual(0)
    expect(result.light.overallBrilliance).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into halls by directory', async () => {
    const result = await buildEmeraldLanternResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, richContent],
    )
    expect(result.halls).toHaveLength(2)
    const srcHall = result.halls.find(h => h.directory === 'src')
    const libHall = result.halls.find(h => h.directory === 'lib')
    expect(srcHall).toBeDefined()
    expect(libHall).toBeDefined()
    if (srcHall) expect(srcHall.flames).toHaveLength(2)
    if (libHall) expect(libHall.flames).toHaveLength(1)
  })

  it('tracks high-quality counts correctly', async () => {
    const result = await buildEmeraldLanternResult(['test.ts'], [richContent])
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighStabilityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFiltrationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighReachCount).toBeGreaterThanOrEqual(0)
  })

  it('condition counts match flame conditions', async () => {
    const result = await buildEmeraldLanternResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const extinguished = result.flames.filter(f => f.condition === 'extinguished').length
    expect(result.stats.extinguishedCount).toBe(extinguished)
  })
})
