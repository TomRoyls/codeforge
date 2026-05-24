import { describe, it, expect } from 'vitest'
import {
  measureArching,
  measureGuarding,
  measureFlowing,
  measureReflecting,
  measureTransitioning,
  classifyArchCondition,
  classifyHallType,
  classifyHallCondition,
  classifyGuardianGrade,
  analyzeSilverArch,
  analyzeSilverHall,
  buildSilverThresholdResult,
  generateRecommendations,
} from '../src/commands/silver-threshold-helpers.js'
import {
  colorScore,
  colorGrade,
  formatArchTable,
  formatArchesTable,
  formatHallTable,
  formatHallsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/silver-threshold-format-helpers.js'
import type { SilverArch, SilverThresholdStats, SilverPalace } from '../src/commands/silver-threshold-helpers.js'

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

// ─── measureArching ────────────────────────────────────────────────

describe('measureArching', () => {
  it('returns no-arch for empty content', () => {
    const m = measureArching(emptyContent)
    expect(m.elegance).toBe(0)
    expect(m.grade).toBe('no-arch')
    expect(m.hasHighElegance).toBe(false)
    expect(m.clunkyCount).toBe(0)
    expect(m.uglyCount).toBe(0)
  })

  it('returns silver-arch for rich content', () => {
    const m = measureArching(richContent)
    expect(m.elegance).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('silver-arch')
    expect(m.hasHighElegance).toBe(true)
    expect(m.hasCleanInterface).toBe(true)
    expect(m.hasWellDesignedAPI).toBe(true)
    expect(m.hasNoClunky).toBe(true)
    expect(m.hasBeautiful).toBe(true)
    expect(m.hasIntuitive).toBe(true)
    expect(m.hasApproachable).toBe(true)
    expect(m.hasGraceful).toBe(true)
  })

  it('counts clunky patterns (var)', () => {
    const m = measureArching('var x = 1; var y = 2;')
    expect(m.clunkyCount).toBe(2)
    expect(m.hasNoClunky).toBe(false)
  })

  it('counts ugly patterns (any)', () => {
    const m = measureArching('const x: any = 1;')
    expect(m.uglyCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUgly).toBe(false)
  })

  it('detects eval as hasNoCounterintuitive violation', () => {
    const m = measureArching("eval('x')")
    expect(m.hasNoCounterintuitive).toBe(false)
  })

  it('detects debugger as hasNoHostile violation', () => {
    const m = measureArching('debugger')
    expect(m.hasNoHostile).toBe(false)
  })

  it('returns higher elegance for moderate content', () => {
    const m = measureArching(moderateContent)
    expect(m.elegance).toBeGreaterThan(0)
  })
})

// ─── measureGuarding ───────────────────────────────────────────────

describe('measureGuarding', () => {
  it('returns no-guard for empty content', () => {
    const m = measureGuarding(emptyContent)
    expect(m.security).toBe(0)
    expect(m.threshold).toBe('no-guard')
    expect(m.hasHighSecurity).toBe(false)
    expect(m.castingCount).toBe(0)
    expect(m.uncheckedCount).toBe(0)
  })

  it('returns silver-shield for rich content', () => {
    const m = measureGuarding(richContent)
    expect(m.security).toBeGreaterThanOrEqual(85)
    expect(m.threshold).toBe('silver-shield')
    expect(m.hasHighSecurity).toBe(true)
    expect(m.hasInputValidation).toBe(true)
    expect(m.hasTypeChecking).toBe(true)
    expect(m.hasNoCasting).toBe(true)
    expect(m.hasBoundaryChecks).toBe(true)
    expect(m.hasNullGuards).toBe(true)
    expect(m.hasSanitized).toBe(true)
    expect(m.hasValidated).toBe(true)
  })

  it('counts casting patterns (var)', () => {
    const m = measureGuarding('var x = 1; var y = 2;')
    expect(m.castingCount).toBe(2)
    expect(m.hasNoCasting).toBe(false)
  })

  it('counts unchecked patterns (any)', () => {
    const m = measureGuarding('const x: any = 1;')
    expect(m.uncheckedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUnchecked).toBe(false)
  })

  it('detects eval as hasNoAssumption violation', () => {
    const m = measureGuarding("eval('x')")
    expect(m.hasNoAssumption).toBe(false)
  })

  it('detects debugger as hasNoRawInput violation', () => {
    const m = measureGuarding('debugger')
    expect(m.hasNoRawInput).toBe(false)
  })
})

// ─── measureFlowing ────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns no-passage for empty content', () => {
    const m = measureFlowing(emptyContent)
    expect(m.passage).toBe(0)
    expect(m.moonlit).toBe('no-passage')
    expect(m.hasHighPassage).toBe(false)
    expect(m.jarringCount).toBe(0)
    expect(m.abruptCount).toBe(0)
  })

  it('returns silver-path for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.passage).toBeGreaterThanOrEqual(85)
    expect(m.moonlit).toBe('silver-path')
    expect(m.hasHighPassage).toBe(true)
    expect(m.hasSmoothFlow).toBe(true)
    expect(m.hasGracefulTransition).toBe(true)
    expect(m.hasNoJarring).toBe(true)
    expect(m.hasSeamless).toBe(true)
    expect(m.hasProgressive).toBe(true)
    expect(m.hasFlowing).toBe(true)
    expect(m.hasGentle).toBe(true)
  })

  it('counts jarring patterns (var)', () => {
    const m = measureFlowing('var x = 1; var y = 2;')
    expect(m.jarringCount).toBe(2)
    expect(m.hasNoJarring).toBe(false)
  })

  it('counts abrupt patterns (any)', () => {
    const m = measureFlowing('const x: any = 1;')
    expect(m.abruptCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoAbrupt).toBe(false)
  })

  it('detects eval as hasNoAllAtOnce violation', () => {
    const m = measureFlowing("eval('x')")
    expect(m.hasNoAllAtOnce).toBe(false)
  })

  it('detects debugger as hasNoJerky violation', () => {
    const m = measureFlowing('debugger')
    expect(m.hasNoJerky).toBe(false)
  })
})

// ─── measureReflecting ─────────────────────────────────────────────

describe('measureReflecting', () => {
  it('returns no-reflection for empty content', () => {
    const m = measureReflecting(emptyContent)
    expect(m.reflection).toBe(0)
    expect(m.silver).toBe('no-reflection')
    expect(m.hasHighReflection).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns perfect-mirror for rich content', () => {
    const m = measureReflecting(richContent)
    expect(m.reflection).toBeGreaterThanOrEqual(85)
    expect(m.silver).toBe('perfect-mirror')
    expect(m.hasHighReflection).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasDescriptive).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
  })

  it('counts cryptic patterns (var)', () => {
    const m = measureReflecting('var x = 1; var y = 2;')
    expect(m.crypticCount).toBe(2)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('counts obfuscated patterns (any)', () => {
    const m = measureReflecting('const x: any = 1;')
    expect(m.obfuscatedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoVague).toBe(false)
  })

  it('detects eval as hasNoObfuscated violation', () => {
    const m = measureReflecting("eval('x')")
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects debugger as hasNoHidden violation', () => {
    const m = measureReflecting('debugger')
    expect(m.hasNoHidden).toBe(false)
  })
})

// ─── measureTransitioning ──────────────────────────────────────────

describe('measureTransitioning', () => {
  it('returns no-transition for empty content', () => {
    const m = measureTransitioning(emptyContent)
    expect(m.transition).toBe(0)
    expect(m.dawn).toBe('no-transition')
    expect(m.hasHighTransition).toBe(false)
    expect(m.mutableCount).toBe(0)
    expect(m.inconsistentCount).toBe(0)
  })

  it('returns golden-sunrise for rich content', () => {
    const m = measureTransitioning(richContent)
    expect(m.transition).toBeGreaterThanOrEqual(85)
    expect(m.dawn).toBe('golden-sunrise')
    expect(m.hasHighTransition).toBe(true)
    expect(m.hasStateManaged).toBe(true)
    expect(m.hasImmutable).toBe(true)
    expect(m.hasNoMutable).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasOrdered).toBe(true)
    expect(m.hasControlled).toBe(true)
  })

  it('counts mutable patterns (var)', () => {
    const m = measureTransitioning('var x = 1; var y = 2;')
    expect(m.mutableCount).toBe(2)
    expect(m.hasNoMutable).toBe(false)
  })

  it('counts inconsistent patterns (any)', () => {
    const m = measureTransitioning('const x: any = 1;')
    expect(m.inconsistentCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoInconsistent).toBe(false)
  })

  it('detects eval as hasNoSurprising violation', () => {
    const m = measureTransitioning("eval('x')")
    expect(m.hasNoSurprising).toBe(false)
  })

  it('detects debugger as hasNoChaotic violation', () => {
    const m = measureTransitioning('debugger')
    expect(m.hasNoChaotic).toBe(false)
  })
})

// ─── classifyArchCondition ─────────────────────────────────────────

describe('classifyArchCondition', () => {
  it('classifies silver-masterpiece for 85+', () => {
    expect(classifyArchCondition(90)).toBe('silver-masterpiece')
    expect(classifyArchCondition(85)).toBe('silver-masterpiece')
  })

  it('classifies moonlit-portal for 70-84', () => {
    expect(classifyArchCondition(70)).toBe('moonlit-portal')
    expect(classifyArchCondition(84)).toBe('moonlit-portal')
  })

  it('classifies proper-arch for 55-69', () => {
    expect(classifyArchCondition(55)).toBe('proper-arch')
  })

  it('classifies iron-gate for 40-54', () => {
    expect(classifyArchCondition(40)).toBe('iron-gate')
  })

  it('classifies wooden-door for 25-39', () => {
    expect(classifyArchCondition(25)).toBe('wooden-door')
  })

  it('classifies gap below 25', () => {
    expect(classifyArchCondition(0)).toBe('gap')
    expect(classifyArchCondition(24)).toBe('gap')
  })
})

// ─── classifyHallType ──────────────────────────────────────────────

describe('classifyHallType', () => {
  it('returns no-hall for empty arches', () => {
    expect(classifyHallType([])).toBe('no-hall')
  })

  it('returns silver-palace for high avg with masterpiece ratio', () => {
    const arches = [
      { qualityScore: 90, condition: 'silver-masterpiece' as const },
      { qualityScore: 85, condition: 'silver-masterpiece' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, boundaryElegance: 0, thresholdSecurity: 0, moonlitPassage: 0, silverReflection: 0, dawnTransition: 0, arching: {} as any, guarding: {} as any, flowing: {} as any, reflecting: {} as any, transitioning: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyHallType(arches)).toBe('silver-palace')
  })

  it('returns moonlit-hall for moderate avg', () => {
    const arches = [
      { qualityScore: 60, condition: 'proper-arch' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, boundaryElegance: 0, thresholdSecurity: 0, moonlitPassage: 0, silverReflection: 0, dawnTransition: 0, arching: {} as any, guarding: {} as any, flowing: {} as any, reflecting: {} as any, transitioning: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyHallType(arches)).toBe('moonlit-hall')
  })

  it('returns no-hall for very low avg', () => {
    const arches = [
      { qualityScore: 10, condition: 'gap' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, boundaryElegance: 0, thresholdSecurity: 0, moonlitPassage: 0, silverReflection: 0, dawnTransition: 0, arching: {} as any, guarding: {} as any, flowing: {} as any, reflecting: {} as any, transitioning: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyHallType(arches)).toBe('no-hall')
  })
})

// ─── classifyHallCondition ─────────────────────────────────────────

describe('classifyHallCondition', () => {
  it('returns palace-of-silver for 75+', () => {
    expect(classifyHallCondition(75)).toBe('palace-of-silver')
    expect(classifyHallCondition(90)).toBe('palace-of-silver')
  })

  it('returns moonlit-gallery for 60-74', () => {
    expect(classifyHallCondition(60)).toBe('moonlit-gallery')
  })

  it('returns decent-hallway for 45-59', () => {
    expect(classifyHallCondition(45)).toBe('decent-hallway')
  })

  it('returns dim-corridor for 30-44', () => {
    expect(classifyHallCondition(30)).toBe('dim-corridor')
  })

  it('returns dark-passage for 15-29', () => {
    expect(classifyHallCondition(15)).toBe('dark-passage')
  })

  it('returns void below 15', () => {
    expect(classifyHallCondition(0)).toBe('void')
  })
})

// ─── classifyGuardianGrade ─────────────────────────────────────────

describe('classifyGuardianGrade', () => {
  it('returns silver-guardian for 80+', () => {
    expect(classifyGuardianGrade(80)).toBe('silver-guardian')
    expect(classifyGuardianGrade(100)).toBe('silver-guardian')
  })

  it('returns palace-keeper for 65-79', () => {
    expect(classifyGuardianGrade(65)).toBe('palace-keeper')
  })

  it('returns skilled-doorkeeper for 50-64', () => {
    expect(classifyGuardianGrade(50)).toBe('skilled-doorkeeper')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyGuardianGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyGuardianGrade(20)).toBe('novice')
  })

  it('returns gate-crasher below 20', () => {
    expect(classifyGuardianGrade(0)).toBe('gate-crasher')
    expect(classifyGuardianGrade(19)).toBe('gate-crasher')
  })
})

// ─── analyzeSilverArch ─────────────────────────────────────────────

describe('analyzeSilverArch', () => {
  it('analyzes rich content correctly', () => {
    const arch = analyzeSilverArch(richContent, 'rich.ts')
    expect(arch.file).toBe('rich.ts')
    expect(arch.boundaryElegance).toBeGreaterThanOrEqual(85)
    expect(arch.thresholdSecurity).toBeGreaterThanOrEqual(85)
    expect(arch.moonlitPassage).toBeGreaterThanOrEqual(85)
    expect(arch.silverReflection).toBeGreaterThanOrEqual(85)
    expect(arch.dawnTransition).toBeGreaterThanOrEqual(85)
    expect(arch.qualityScore).toBeGreaterThanOrEqual(85)
    expect(arch.condition).toBe('silver-masterpiece')
  })

  it('analyzes empty content as gap', () => {
    const arch = analyzeSilverArch(emptyContent, 'empty.ts')
    expect(arch.qualityScore).toBe(0)
    expect(arch.condition).toBe('gap')
  })

  it('computes qualityScore as weighted average', () => {
    const arch = analyzeSilverArch(moderateContent, 'mod.ts')
    const expected = Math.round(
      arch.boundaryElegance * 0.2 +
      arch.thresholdSecurity * 0.2 +
      arch.moonlitPassage * 0.2 +
      arch.silverReflection * 0.2 +
      arch.dawnTransition * 0.2,
    )
    expect(arch.qualityScore).toBe(expected)
  })
})

// ─── analyzeSilverHall ─────────────────────────────────────────────

describe('analyzeSilverHall', () => {
  it('returns empty hall for no arches', () => {
    const hall = analyzeSilverHall([], 'src')
    expect(hall.directory).toBe('src')
    expect(hall.arches).toHaveLength(0)
    expect(hall.avgElegance).toBe(0)
    expect(hall.hallType).toBe('no-hall')
    expect(hall.condition).toBe('void')
  })

  it('analyzes hall with single arch', () => {
    const arch = analyzeSilverArch(richContent, 'src/rich.ts')
    const hall = analyzeSilverHall([arch], 'src')
    expect(hall.arches).toHaveLength(1)
    expect(hall.avgElegance).toBe(arch.boundaryElegance)
  })

  it('counts masterpieces and gaps', () => {
    const rich = analyzeSilverArch(richContent, 'rich.ts')
    const empty = analyzeSilverArch(emptyContent, 'empty.ts')
    const hall = analyzeSilverHall([rich, empty], 'src')
    expect(hall.silverMasterpieceCount).toBe(1)
    expect(hall.gapCount).toBe(1)
  })
})

// ─── buildSilverThresholdResult ────────────────────────────────────

describe('buildSilverThresholdResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildSilverThresholdResult([], [])
    expect(result.arches).toHaveLength(0)
    expect(result.halls).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.palace.isLuminous).toBe(false)
  })

  it('analyzes single rich file', async () => {
    const result = await buildSilverThresholdResult(['rich.ts'], [richContent])
    expect(result.arches).toHaveLength(1)
    expect(result.arches[0].condition).toBe('silver-masterpiece')
    expect(result.stats.silverMasterpieceCount).toBe(1)
    expect(result.palace.isLuminous).toBe(true)
    expect(result.stats.bestArch).toBe('rich.ts')
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildSilverThresholdResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.arches).toHaveLength(2)
    expect(result.halls).toHaveLength(2)
  })

  it('populates all best fields', async () => {
    const result = await buildSilverThresholdResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestArch).toBe('a.ts')
    expect(result.stats.mostElegant).toBe('a.ts')
    expect(result.stats.mostSecure).toBe('a.ts')
    expect(result.stats.smoothestPassage).toBe('a.ts')
    expect(result.stats.clearest).toBe('a.ts')
  })

  it('counts hasHigh flags correctly', async () => {
    const result = await buildSilverThresholdResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighEleganceCount).toBe(1)
    expect(result.stats.hasHighSecurityCount).toBe(1)
    expect(result.stats.hasHighPassageCount).toBe(1)
    expect(result.stats.hasHighReflectionCount).toBe(1)
    expect(result.stats.hasHighTransitionCount).toBe(1)
  })

  it('computes palace correctly', async () => {
    const result = await buildSilverThresholdResult(['rich.ts'], [richContent])
    expect(result.palace.avgElegance).toBeGreaterThan(0)
    expect(result.palace.avgSecurity).toBeGreaterThan(0)
    expect(result.palace.avgReflection).toBeGreaterThan(0)
    expect(result.palace.isLuminous).toBe(true)
    expect(result.palace.overallRadiance).toBeGreaterThan(0)
  })

  it('returns recommendations', async () => {
    const result = await buildSilverThresholdResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message when all scores high', () => {
    const stats: SilverThresholdStats = {
      totalFiles: 1, totalHalls: 1,
      avgBoundaryElegance: 90, avgThresholdSecurity: 90, avgMoonlitPassage: 90,
      avgSilverReflection: 90, avgDawnTransition: 90,
      silverMasterpieceCount: 1, moonlitPortalCount: 0, properArchCount: 0,
      ironGateCount: 0, woodenDoorCount: 0, gapCount: 0,
      hasHighEleganceCount: 1, hasHighSecurityCount: 1, hasHighPassageCount: 1,
      hasHighReflectionCount: 1, hasHighTransitionCount: 1,
      overallRadiance: 90, guardianGrade: 'silver-guardian',
      bestArch: 'a.ts', mostElegant: 'a.ts', mostSecure: 'a.ts',
      smoothestPassage: 'a.ts', clearest: 'a.ts',
    }
    const palace: SilverPalace = { avgElegance: 90, avgSecurity: 90, avgReflection: 90, isLuminous: true, overallRadiance: 90 }
    const recs = generateRecommendations([], [], palace, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('luminous perfection')
  })

  it('recommends improving elegance when low', () => {
    const stats: SilverThresholdStats = {
      totalFiles: 1, totalHalls: 1,
      avgBoundaryElegance: 30, avgThresholdSecurity: 90, avgMoonlitPassage: 90,
      avgSilverReflection: 90, avgDawnTransition: 90,
      silverMasterpieceCount: 0, moonlitPortalCount: 0, properArchCount: 0,
      ironGateCount: 0, woodenDoorCount: 0, gapCount: 0,
      hasHighEleganceCount: 0, hasHighSecurityCount: 1, hasHighPassageCount: 1,
      hasHighReflectionCount: 1, hasHighTransitionCount: 1,
      overallRadiance: 60, guardianGrade: 'skilled-doorkeeper',
      bestArch: 'a.ts', mostElegant: 'a.ts', mostSecure: 'a.ts',
      smoothestPassage: 'a.ts', clearest: 'a.ts',
    }
    const palace: SilverPalace = { avgElegance: 30, avgSecurity: 90, avgReflection: 90, isLuminous: false, overallRadiance: 60 }
    const recs = generateRecommendations([], [], palace, stats)
    expect(recs.some(r => r.includes('boundary elegance'))).toBe(true)
  })

  it('recommends for gap files', () => {
    const stats: SilverThresholdStats = {
      totalFiles: 1, totalHalls: 1,
      avgBoundaryElegance: 90, avgThresholdSecurity: 90, avgMoonlitPassage: 90,
      avgSilverReflection: 90, avgDawnTransition: 90,
      silverMasterpieceCount: 0, moonlitPortalCount: 0, properArchCount: 0,
      ironGateCount: 0, woodenDoorCount: 0, gapCount: 2,
      hasHighEleganceCount: 1, hasHighSecurityCount: 1, hasHighPassageCount: 1,
      hasHighReflectionCount: 1, hasHighTransitionCount: 1,
      overallRadiance: 80, guardianGrade: 'silver-guardian',
      bestArch: 'a.ts', mostElegant: 'a.ts', mostSecure: 'a.ts',
      smoothestPassage: 'a.ts', clearest: 'a.ts',
    }
    const palace: SilverPalace = { avgElegance: 90, avgSecurity: 90, avgReflection: 90, isLuminous: true, overallRadiance: 90 }
    const recs = generateRecommendations([], [], palace, stats)
    expect(recs.some(r => r.includes('gap'))).toBe(true)
  })

  it('recommends for low radiance', () => {
    const stats: SilverThresholdStats = {
      totalFiles: 1, totalHalls: 1,
      avgBoundaryElegance: 30, avgThresholdSecurity: 30, avgMoonlitPassage: 30,
      avgSilverReflection: 30, avgDawnTransition: 30,
      silverMasterpieceCount: 0, moonlitPortalCount: 0, properArchCount: 0,
      ironGateCount: 0, woodenDoorCount: 0, gapCount: 0,
      hasHighEleganceCount: 0, hasHighSecurityCount: 0, hasHighPassageCount: 0,
      hasHighReflectionCount: 0, hasHighTransitionCount: 0,
      overallRadiance: 30, guardianGrade: 'apprentice',
      bestArch: '', mostElegant: '', mostSecure: '',
      smoothestPassage: '', clearest: '',
    }
    const palace: SilverPalace = { avgElegance: 30, avgSecurity: 30, avgReflection: 30, isLuminous: false, overallRadiance: 30 }
    const recs = generateRecommendations([], [], palace, stats)
    expect(recs.some(r => r.includes('radiance'))).toBe(true)
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
    expect(typeof colorGrade('silver-masterpiece')).toBe('string')
    expect(typeof colorGrade('gap')).toBe('string')
    expect(typeof colorGrade('silver-palace')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatArchTable', () => {
  it('formats a single arch', () => {
    const arch = analyzeSilverArch(richContent, 'test.ts')
    const result = formatArchTable(arch)
    expect(result).toContain('test.ts')
    expect(result).toContain('Boundary Elegance')
    expect(result).toContain('Score')
  })
})

describe('formatArchesTable', () => {
  it('returns no arches message for empty', () => {
    expect(formatArchesTable([])).toContain('No silver arches')
  })

  it('formats arches', () => {
    const arch = analyzeSilverArch(richContent, 'a.ts')
    const result = formatArchesTable([arch])
    expect(result).toContain('Silver Threshold Analysis')
  })
})

describe('formatHallTable', () => {
  it('formats hall', () => {
    const arch = analyzeSilverArch(richContent, 'a.ts')
    const hall = analyzeSilverHall([arch], 'src')
    const result = formatHallTable(hall)
    expect(result).toContain('Hall')
    expect(result).toContain('src')
  })
})

describe('formatHallsTable', () => {
  it('returns no halls message for empty', () => {
    expect(formatHallsTable([])).toContain('No silver halls')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSilverThresholdResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Silver Threshold Statistics')
    expect(output).toContain('Overall Radiance')
    expect(output).toContain('Guardian Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildSilverThresholdResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Silver Threshold Analysis')
    expect(output).toContain('Silver Halls')
    expect(output).toContain('Palace')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildSilverThresholdResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.arches).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.palace).toBeDefined()
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only var and any', () => {
    const m = measureArching('var x: any = 1;')
    expect(m.clunkyCount).toBeGreaterThanOrEqual(1)
    expect(m.uglyCount).toBeGreaterThanOrEqual(1)
  })

  it('minimal content has low scores', () => {
    const arch = analyzeSilverArch(minimalContent, 'min.ts')
    expect(arch.boundaryElegance).toBeLessThan(50)
    expect(arch.thresholdSecurity).toBeLessThan(50)
    expect(arch.moonlitPassage).toBeLessThan(50)
    expect(arch.silverReflection).toBeLessThan(50)
    expect(arch.dawnTransition).toBeLessThan(50)
  })

  it('result with all gaps has correct palace', async () => {
    const result = await buildSilverThresholdResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.palace.isLuminous).toBe(false)
    expect(result.stats.gapCount).toBe(2)
    expect(result.stats.silverMasterpieceCount).toBe(0)
  })
})
