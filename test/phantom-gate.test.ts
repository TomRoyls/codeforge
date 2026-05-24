import { describe, it, expect } from 'vitest'
import {
  measureArching,
  measureGuarding,
  measureTraversing,
  measureWatching,
  measureTransitioning,
  classifyKeystoneCondition,
  classifyArchType,
  classifyArchCondition,
  classifyKeeperGrade,
  analyzeGateKeystone,
  analyzeGateArch,
  buildPhantomGateResult,
  generateRecommendations,
} from '../src/commands/phantom-gate-helpers.js'
import {
  colorScore,
  colorGrade,
  formatKeystoneTable,
  formatKeystonesTable,
  formatArchTable,
  formatArchesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/phantom-gate-format-helpers.js'
import type { GateKeystone, PhantomGateStats, PhantomGateway } from '../src/commands/phantom-gate-helpers.js'

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
  it('returns no-threshold for empty content', () => {
    const m = measureArching(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('no-threshold')
    expect(m.hasHighQuality).toBe(false)
    expect(m.vagueBoundaryCount).toBe(0)
    expect(m.untypedCount).toBe(0)
  })

  it('returns divine-arch for rich content', () => {
    const m = measureArching(richContent)
    expect(m.quality).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('divine-arch')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasClearInterface).toBe(true)
    expect(m.hasWellDefinedAPI).toBe(true)
    expect(m.hasNoVagueBoundary).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasTyped).toBe(true)
    expect(m.hasExplicit).toBe(true)
    expect(m.hasNoImplicit).toBe(true)
    expect(m.hasStructured).toBe(true)
  })

  it('counts vague boundary patterns (var)', () => {
    const m = measureArching('var x = 1; var y = 2;')
    expect(m.vagueBoundaryCount).toBe(2)
    expect(m.hasNoVagueBoundary).toBe(false)
  })

  it('counts untyped patterns (any)', () => {
    const m = measureArching('const x: any = 1;')
    expect(m.untypedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUntyped).toBe(false)
  })

  it('detects eval as hasNoImplicit violation', () => {
    const m = measureArching("eval('x')")
    expect(m.hasNoImplicit).toBe(false)
  })

  it('returns higher quality for moderate content', () => {
    const m = measureArching(moderateContent)
    expect(m.quality).toBeGreaterThan(0)
  })

  it('scores minimal content low', () => {
    const m = measureArching(minimalContent)
    expect(m.quality).toBeLessThan(50)
  })
})

// ─── measureGuarding ───────────────────────────────────────────────

describe('measureGuarding', () => {
  it('returns no-gate for empty content', () => {
    const m = measureGuarding(emptyContent)
    expect(m.security).toBe(0)
    expect(m.gateway).toBe('no-gate')
    expect(m.hasHighSecurity).toBe(false)
    expect(m.unprotectedCount).toBe(0)
    expect(m.rawInputCount).toBe(0)
  })

  it('returns impregnable-gate for rich content', () => {
    const m = measureGuarding(richContent)
    expect(m.security).toBeGreaterThanOrEqual(85)
    expect(m.gateway).toBe('impregnable-gate')
    expect(m.hasHighSecurity).toBe(true)
    expect(m.hasInputValidation).toBe(true)
    expect(m.hasAccessControl).toBe(true)
    expect(m.hasNoUnprotected).toBe(true)
    expect(m.hasAuthentication).toBe(true)
    expect(m.hasSanitization).toBe(true)
    expect(m.hasAuthorization).toBe(true)
    expect(m.hasGuarded).toBe(true)
  })

  it('counts unprotected patterns (var)', () => {
    const m = measureGuarding('var x = 1; var y = 2;')
    expect(m.unprotectedCount).toBe(2)
    expect(m.hasNoUnprotected).toBe(false)
  })

  it('counts raw input patterns (any)', () => {
    const m = measureGuarding('const x: any = 1;')
    expect(m.rawInputCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoRawInput).toBe(false)
  })

  it('detects eval as hasNoPrivilegeEscalation violation', () => {
    const m = measureGuarding("eval('x')")
    expect(m.hasNoPrivilegeEscalation).toBe(false)
  })

  it('returns higher security for moderate content', () => {
    const m = measureGuarding(moderateContent)
    expect(m.security).toBeGreaterThan(0)
  })
})

// ─── measureTraversing ─────────────────────────────────────────────

describe('measureTraversing', () => {
  it('returns no-traversal for empty content', () => {
    const m = measureTraversing(emptyContent)
    expect(m.traversal).toBe(0)
    expect(m.spirit).toBe('no-traversal')
    expect(m.hasHighTraversal).toBe(false)
    expect(m.bottleneckCount).toBe(0)
    expect(m.circuitCount).toBe(0)
  })

  it('returns swift-passage for rich content', () => {
    const m = measureTraversing(richContent)
    expect(m.traversal).toBeGreaterThanOrEqual(85)
    expect(m.spirit).toBe('swift-passage')
    expect(m.hasHighTraversal).toBe(true)
    expect(m.hasEfficientFlow).toBe(true)
    expect(m.hasNoBottlenecks).toBe(true)
    expect(m.hasStreamlined).toBe(true)
    expect(m.hasDirectPaths).toBe(true)
    expect(m.hasOptimized).toBe(true)
    expect(m.hasClean).toBe(true)
  })

  it('counts bottleneck patterns (var)', () => {
    const m = measureTraversing('var x = 1; var y = 2;')
    expect(m.bottleneckCount).toBe(2)
    expect(m.hasNoBottlenecks).toBe(false)
  })

  it('counts circuit patterns (any)', () => {
    const m = measureTraversing('const x: any = 1;')
    expect(m.circuitCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoIndirection).toBe(false)
  })

  it('detects eval as hasNoUnoptimized violation', () => {
    const m = measureTraversing("eval('x')")
    expect(m.hasNoUnoptimized).toBe(false)
  })

  it('detects debugger as hasNoCluttered violation', () => {
    const m = measureTraversing('debugger')
    expect(m.hasNoCluttered).toBe(false)
  })

  it('returns higher traversal for moderate content', () => {
    const m = measureTraversing(moderateContent)
    expect(m.traversal).toBeGreaterThan(0)
  })
})

// ─── measureWatching ───────────────────────────────────────────────

describe('measureWatching', () => {
  it('returns no-guard for empty content', () => {
    const m = measureWatching(emptyContent)
    expect(m.guardian).toBe(0)
    expect(m.shadow).toBe('no-guard')
    expect(m.hasHighGuardian).toBe(false)
    expect(m.castingCount).toBe(0)
    expect(m.assumptionCount).toBe(0)
  })

  it('returns eternal-sentinel for rich content', () => {
    const m = measureWatching(richContent)
    expect(m.guardian).toBeGreaterThanOrEqual(85)
    expect(m.shadow).toBe('eternal-sentinel')
    expect(m.hasHighGuardian).toBe(true)
    expect(m.hasBoundaryChecks).toBe(true)
    expect(m.hasTypeGuards).toBe(true)
    expect(m.hasNoCasting).toBe(true)
    expect(m.hasNullChecks).toBe(true)
    expect(m.hasEdgeCaseHandling).toBe(true)
    expect(m.hasErrorBoundaries).toBe(true)
    expect(m.hasValidated).toBe(true)
  })

  it('counts casting patterns (var)', () => {
    const m = measureWatching('var x = 1; var y = 2;')
    expect(m.castingCount).toBe(2)
    expect(m.hasNoCasting).toBe(false)
  })

  it('counts assumption patterns (any)', () => {
    const m = measureWatching('const x: any = 1;')
    expect(m.assumptionCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoAssumption).toBe(false)
  })

  it('detects eval as hasNoUncovered violation', () => {
    const m = measureWatching("eval('x')")
    expect(m.hasNoUncovered).toBe(false)
  })

  it('detects debugger as hasNoUnguarded violation', () => {
    const m = measureWatching('debugger')
    expect(m.hasNoUnguarded).toBe(false)
  })

  it('returns higher guardian for moderate content', () => {
    const m = measureWatching(moderateContent)
    expect(m.guardian).toBeGreaterThan(0)
  })
})

// ─── measureTransitioning ──────────────────────────────────────────

describe('measureTransitioning', () => {
  it('returns no-passage for empty content', () => {
    const m = measureTransitioning(emptyContent)
    expect(m.passage).toBe(0)
    expect(m.ethereal).toBe('no-passage')
    expect(m.hasHighPassage).toBe(false)
    expect(m.jarringCount).toBe(0)
    expect(m.suddenCount).toBe(0)
  })

  it('returns seamless-crossing for rich content', () => {
    const m = measureTransitioning(richContent)
    expect(m.passage).toBeGreaterThanOrEqual(85)
    expect(m.ethereal).toBe('seamless-crossing')
    expect(m.hasHighPassage).toBe(true)
    expect(m.hasGracefulTransitions).toBe(true)
    expect(m.hasSmoothFlows).toBe(true)
    expect(m.hasNoJarring).toBe(true)
    expect(m.hasProgressive).toBe(true)
    expect(m.hasSequenced).toBe(true)
    expect(m.hasManaged).toBe(true)
    expect(m.hasFlowing).toBe(true)
  })

  it('counts jarring patterns (var)', () => {
    const m = measureTransitioning('var x = 1; var y = 2;')
    expect(m.jarringCount).toBe(2)
    expect(m.hasNoJarring).toBe(false)
  })

  it('counts sudden patterns (any)', () => {
    const m = measureTransitioning('const x: any = 1;')
    expect(m.suddenCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoAllAtOnce).toBe(false)
  })

  it('detects eval as hasNoUnordered violation', () => {
    const m = measureTransitioning("eval('x')")
    expect(m.hasNoUnordered).toBe(false)
  })

  it('detects debugger as hasNoSudden violation', () => {
    const m = measureTransitioning('debugger')
    expect(m.hasNoSudden).toBe(false)
  })

  it('returns higher passage for moderate content', () => {
    const m = measureTransitioning(moderateContent)
    expect(m.passage).toBeGreaterThan(0)
  })
})

// ─── classifyKeystoneCondition ─────────────────────────────────────

describe('classifyKeystoneCondition', () => {
  it('classifies divine-portal for 85+', () => {
    expect(classifyKeystoneCondition(90)).toBe('divine-portal')
    expect(classifyKeystoneCondition(85)).toBe('divine-portal')
  })

  it('classifies phantom-gateway for 70-84', () => {
    expect(classifyKeystoneCondition(70)).toBe('phantom-gateway')
    expect(classifyKeystoneCondition(84)).toBe('phantom-gateway')
  })

  it('classifies proper-gate for 55-69', () => {
    expect(classifyKeystoneCondition(55)).toBe('proper-gate')
    expect(classifyKeystoneCondition(69)).toBe('proper-gate')
  })

  it('classifies wooden-door for 40-54', () => {
    expect(classifyKeystoneCondition(40)).toBe('wooden-door')
    expect(classifyKeystoneCondition(54)).toBe('wooden-door')
  })

  it('classifies broken-arch for 25-39', () => {
    expect(classifyKeystoneCondition(25)).toBe('broken-arch')
    expect(classifyKeystoneCondition(39)).toBe('broken-arch')
  })

  it('classifies rubble below 25', () => {
    expect(classifyKeystoneCondition(0)).toBe('rubble')
    expect(classifyKeystoneCondition(24)).toBe('rubble')
  })
})

// ─── classifyArchType ──────────────────────────────────────────────

describe('classifyArchType', () => {
  it('returns no-arch for empty keystones', () => {
    expect(classifyArchType([])).toBe('no-arch')
  })

  it('returns grand-portal for high avg with divine ratio', () => {
    const keystones = [
      { qualityScore: 90, condition: 'divine-portal' as const },
      { qualityScore: 85, condition: 'divine-portal' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, thresholdQuality: 0, gatewaySecurity: 0, spiritTraversal: 0, shadowGuardian: 0, etherealPassage: 0, arching: {} as any, guarding: {} as any, traversing: {} as any, watching: {} as any, transitioning: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyArchType(keystones)).toBe('grand-portal')
  })

  it('returns proper-archway for moderate avg', () => {
    const keystones = [
      { qualityScore: 60, condition: 'proper-gate' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, thresholdQuality: 0, gatewaySecurity: 0, spiritTraversal: 0, shadowGuardian: 0, etherealPassage: 0, arching: {} as any, guarding: {} as any, traversing: {} as any, watching: {} as any, transitioning: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyArchType(keystones)).toBe('proper-archway')
  })

  it('returns hole-in-wall for very low avg', () => {
    const keystones = [
      { qualityScore: 15, condition: 'rubble' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, thresholdQuality: 0, gatewaySecurity: 0, spiritTraversal: 0, shadowGuardian: 0, etherealPassage: 0, arching: {} as any, guarding: {} as any, traversing: {} as any, watching: {} as any, transitioning: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyArchType(keystones)).toBe('hole-in-wall')
  })
})

// ─── classifyArchCondition ─────────────────────────────────────────

describe('classifyArchCondition', () => {
  it('returns magnificent-gateway for 75+', () => {
    expect(classifyArchCondition(75)).toBe('magnificent-gateway')
    expect(classifyArchCondition(90)).toBe('magnificent-gateway')
  })

  it('returns strong-portal for 60-74', () => {
    expect(classifyArchCondition(60)).toBe('strong-portal')
  })

  it('returns decent-entrance for 45-59', () => {
    expect(classifyArchCondition(45)).toBe('decent-entrance')
  })

  it('returns rusted-gate for 30-44', () => {
    expect(classifyArchCondition(30)).toBe('rusted-gate')
  })

  it('returns collapsed for 15-29', () => {
    expect(classifyArchCondition(15)).toBe('collapsed')
  })

  it('returns void below 15', () => {
    expect(classifyArchCondition(0)).toBe('void')
    expect(classifyArchCondition(14)).toBe('void')
  })
})

// ─── classifyKeeperGrade ───────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns gatekeeper-supreme for 80+', () => {
    expect(classifyKeeperGrade(80)).toBe('gatekeeper-supreme')
    expect(classifyKeeperGrade(100)).toBe('gatekeeper-supreme')
  })

  it('returns master-guardian for 65-79', () => {
    expect(classifyKeeperGrade(65)).toBe('master-guardian')
    expect(classifyKeeperGrade(79)).toBe('master-guardian')
  })

  it('returns skilled-watchman for 50-64', () => {
    expect(classifyKeeperGrade(50)).toBe('skilled-watchman')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyKeeperGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyKeeperGrade(20)).toBe('novice')
  })

  it('returns gate-crasher below 20', () => {
    expect(classifyKeeperGrade(0)).toBe('gate-crasher')
    expect(classifyKeeperGrade(19)).toBe('gate-crasher')
  })
})

// ─── analyzeGateKeystone ───────────────────────────────────────────

describe('analyzeGateKeystone', () => {
  it('analyzes rich content correctly', () => {
    const keystone = analyzeGateKeystone(richContent, 'rich.ts')
    expect(keystone.file).toBe('rich.ts')
    expect(keystone.thresholdQuality).toBeGreaterThanOrEqual(85)
    expect(keystone.gatewaySecurity).toBeGreaterThanOrEqual(85)
    expect(keystone.spiritTraversal).toBeGreaterThanOrEqual(85)
    expect(keystone.shadowGuardian).toBeGreaterThanOrEqual(85)
    expect(keystone.etherealPassage).toBeGreaterThanOrEqual(85)
    expect(keystone.qualityScore).toBeGreaterThanOrEqual(85)
    expect(keystone.condition).toBe('divine-portal')
  })

  it('analyzes empty content as rubble', () => {
    const keystone = analyzeGateKeystone(emptyContent, 'empty.ts')
    expect(keystone.file).toBe('empty.ts')
    expect(keystone.thresholdQuality).toBe(0)
    expect(keystone.qualityScore).toBe(0)
    expect(keystone.condition).toBe('rubble')
  })

  it('computes qualityScore as weighted average', () => {
    const keystone = analyzeGateKeystone(moderateContent, 'mod.ts')
    const expected = Math.round(
      keystone.thresholdQuality * 0.2 +
      keystone.gatewaySecurity * 0.2 +
      keystone.spiritTraversal * 0.2 +
      keystone.shadowGuardian * 0.2 +
      keystone.etherealPassage * 0.2,
    )
    expect(keystone.qualityScore).toBe(expected)
  })
})

// ─── analyzeGateArch ───────────────────────────────────────────────

describe('analyzeGateArch', () => {
  it('returns empty arch for no keystones', () => {
    const arch = analyzeGateArch([], 'src')
    expect(arch.directory).toBe('src')
    expect(arch.keystones).toHaveLength(0)
    expect(arch.avgQuality).toBe(0)
    expect(arch.archType).toBe('no-arch')
    expect(arch.condition).toBe('void')
  })

  it('analyzes arch with single keystone', () => {
    const keystone = analyzeGateKeystone(richContent, 'src/rich.ts')
    const arch = analyzeGateArch([keystone], 'src')
    expect(arch.keystones).toHaveLength(1)
    expect(arch.avgQuality).toBe(keystone.thresholdQuality)
    expect(arch.avgSecurity).toBe(keystone.gatewaySecurity)
    expect(arch.avgPassage).toBe(keystone.etherealPassage)
  })

  it('counts divine portals and rubble correctly', () => {
    const rich = analyzeGateKeystone(richContent, 'rich.ts')
    const empty = analyzeGateKeystone(emptyContent, 'empty.ts')
    const arch = analyzeGateArch([rich, empty], 'src')
    expect(arch.divinePortalCount).toBe(1)
    expect(arch.rubbleCount).toBe(1)
  })
})

// ─── buildPhantomGateResult ────────────────────────────────────────

describe('buildPhantomGateResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildPhantomGateResult([], [])
    expect(result.keystones).toHaveLength(0)
    expect(result.arches).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFortification).toBe(0)
    expect(result.gateway.isImpregnable).toBe(false)
  })

  it('analyzes single rich file', async () => {
    const result = await buildPhantomGateResult(['rich.ts'], [richContent])
    expect(result.keystones).toHaveLength(1)
    expect(result.keystones[0].condition).toBe('divine-portal')
    expect(result.stats.divinePortalCount).toBe(1)
    expect(result.gateway.isImpregnable).toBe(true)
    expect(result.stats.overallFortification).toBeGreaterThan(0)
    expect(result.stats.keeperGrade).toBeDefined()
    expect(result.stats.bestKeystone).toBe('rich.ts')
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildPhantomGateResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.keystones).toHaveLength(2)
    expect(result.arches).toHaveLength(2)
    expect(result.stats.totalArches).toBe(2)
  })

  it('populates all best fields', async () => {
    const result = await buildPhantomGateResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestKeystone).toBeDefined()
    expect(result.stats.bestThreshold).toBeDefined()
    expect(result.stats.mostSecure).toBeDefined()
    expect(result.stats.smoothestTraversal).toBeDefined()
    expect(result.stats.bestGuardian).toBeDefined()
    expect(result.stats.bestKeystone).toBe('a.ts')
  })

  it('counts hasHigh flags correctly', async () => {
    const result = await buildPhantomGateResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighSecurityCount).toBe(1)
    expect(result.stats.hasHighTraversalCount).toBe(1)
    expect(result.stats.hasHighGuardianCount).toBe(1)
    expect(result.stats.hasHighPassageCount).toBe(1)
  })

  it('computes gateway correctly', async () => {
    const result = await buildPhantomGateResult(['rich.ts'], [richContent])
    expect(result.gateway.avgQuality).toBeGreaterThan(0)
    expect(result.gateway.avgSecurity).toBeGreaterThan(0)
    expect(result.gateway.avgPassage).toBeGreaterThan(0)
    expect(result.gateway.isImpregnable).toBe(true)
    expect(result.gateway.overallFortification).toBeGreaterThan(0)
  })

  it('returns recommendations', async () => {
    const result = await buildPhantomGateResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message when all scores high', () => {
    const keystones: GateKeystone[] = []
    const stats: PhantomGateStats = {
      totalFiles: 1, totalArches: 1,
      avgThresholdQuality: 90, avgGatewaySecurity: 90, avgSpiritTraversal: 90,
      avgShadowGuardian: 90, avgEtherealPassage: 90,
      divinePortalCount: 1, phantomGatewayCount: 0, properGateCount: 0,
      woodenDoorCount: 0, brokenArchCount: 0, rubbleCount: 0,
      hasHighQualityCount: 1, hasHighSecurityCount: 1, hasHighTraversalCount: 1,
      hasHighGuardianCount: 1, hasHighPassageCount: 1,
      overallFortification: 90, keeperGrade: 'gatekeeper-supreme',
      bestKeystone: 'a.ts', bestThreshold: 'a.ts', mostSecure: 'a.ts',
      smoothestTraversal: 'a.ts', bestGuardian: 'a.ts',
    }
    const gateway: PhantomGateway = { avgQuality: 90, avgSecurity: 90, avgPassage: 90, isImpregnable: true, overallFortification: 90 }
    const recs = generateRecommendations(keystones, [], gateway, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('impregnable portal')
  })

  it('recommends improving threshold when low', () => {
    const stats: PhantomGateStats = {
      totalFiles: 1, totalArches: 1,
      avgThresholdQuality: 30, avgGatewaySecurity: 90, avgSpiritTraversal: 90,
      avgShadowGuardian: 90, avgEtherealPassage: 90,
      divinePortalCount: 0, phantomGatewayCount: 0, properGateCount: 0,
      woodenDoorCount: 0, brokenArchCount: 0, rubbleCount: 0,
      hasHighQualityCount: 0, hasHighSecurityCount: 1, hasHighTraversalCount: 1,
      hasHighGuardianCount: 1, hasHighPassageCount: 1,
      overallFortification: 60, keeperGrade: 'skilled-watchman',
      bestKeystone: 'a.ts', bestThreshold: 'a.ts', mostSecure: 'a.ts',
      smoothestTraversal: 'a.ts', bestGuardian: 'a.ts',
    }
    const gateway: PhantomGateway = { avgQuality: 30, avgSecurity: 90, avgPassage: 90, isImpregnable: false, overallFortification: 60 }
    const recs = generateRecommendations([], [], gateway, stats)
    expect(recs.some(r => r.includes('threshold quality'))).toBe(true)
  })

  it('recommends improving security when low', () => {
    const stats: PhantomGateStats = {
      totalFiles: 1, totalArches: 1,
      avgThresholdQuality: 90, avgGatewaySecurity: 30, avgSpiritTraversal: 90,
      avgShadowGuardian: 90, avgEtherealPassage: 90,
      divinePortalCount: 1, phantomGatewayCount: 0, properGateCount: 0,
      woodenDoorCount: 0, brokenArchCount: 0, rubbleCount: 0,
      hasHighQualityCount: 1, hasHighSecurityCount: 0, hasHighTraversalCount: 1,
      hasHighGuardianCount: 1, hasHighPassageCount: 1,
      overallFortification: 70, keeperGrade: 'master-guardian',
      bestKeystone: 'a.ts', bestThreshold: 'a.ts', mostSecure: 'a.ts',
      smoothestTraversal: 'a.ts', bestGuardian: 'a.ts',
    }
    const gateway: PhantomGateway = { avgQuality: 90, avgSecurity: 30, avgPassage: 90, isImpregnable: true, overallFortification: 70 }
    const recs = generateRecommendations([], [], gateway, stats)
    expect(recs.some(r => r.includes('gateway security') || r.includes('Fortify'))).toBe(true)
  })

  it('recommends for low overall fortification', () => {
    const stats: PhantomGateStats = {
      totalFiles: 1, totalArches: 1,
      avgThresholdQuality: 30, avgGatewaySecurity: 30, avgSpiritTraversal: 30,
      avgShadowGuardian: 30, avgEtherealPassage: 30,
      divinePortalCount: 0, phantomGatewayCount: 0, properGateCount: 0,
      woodenDoorCount: 0, brokenArchCount: 0, rubbleCount: 0,
      hasHighQualityCount: 0, hasHighSecurityCount: 0, hasHighTraversalCount: 0,
      hasHighGuardianCount: 0, hasHighPassageCount: 0,
      overallFortification: 30, keeperGrade: 'apprentice',
      bestKeystone: '', bestThreshold: '', mostSecure: '',
      smoothestTraversal: '', bestGuardian: '',
    }
    const gateway: PhantomGateway = { avgQuality: 30, avgSecurity: 30, avgPassage: 30, isImpregnable: false, overallFortification: 30 }
    const recs = generateRecommendations([], [], gateway, stats)
    expect(recs.some(r => r.includes('fortification'))).toBe(true)
  })

  it('recommends for rubble files', () => {
    const stats: PhantomGateStats = {
      totalFiles: 1, totalArches: 1,
      avgThresholdQuality: 90, avgGatewaySecurity: 90, avgSpiritTraversal: 90,
      avgShadowGuardian: 90, avgEtherealPassage: 90,
      divinePortalCount: 0, phantomGatewayCount: 0, properGateCount: 0,
      woodenDoorCount: 0, brokenArchCount: 0, rubbleCount: 2,
      hasHighQualityCount: 1, hasHighSecurityCount: 1, hasHighTraversalCount: 1,
      hasHighGuardianCount: 1, hasHighPassageCount: 1,
      overallFortification: 80, keeperGrade: 'gatekeeper-supreme',
      bestKeystone: 'a.ts', bestThreshold: 'a.ts', mostSecure: 'a.ts',
      smoothestTraversal: 'a.ts', bestGuardian: 'a.ts',
    }
    const gateway: PhantomGateway = { avgQuality: 90, avgSecurity: 90, avgPassage: 90, isImpregnable: true, overallFortification: 90 }
    const recs = generateRecommendations([], [], gateway, stats)
    expect(recs.some(r => r.includes('rubble'))).toBe(true)
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
    expect(typeof colorGrade('divine-portal')).toBe('string')
    expect(typeof colorGrade('rubble')).toBe('string')
    expect(typeof colorGrade('grand-portal')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatKeystoneTable', () => {
  it('formats a single keystone', () => {
    const keystone = analyzeGateKeystone(richContent, 'test.ts')
    const result = formatKeystoneTable(keystone)
    expect(result).toContain('test.ts')
    expect(result).toContain('Threshold Quality')
    expect(result).toContain('Gateway Security')
    expect(result).toContain('Score')
  })
})

describe('formatKeystonesTable', () => {
  it('returns no keystones message for empty', () => {
    expect(formatKeystonesTable([])).toContain('No gate keystones')
  })

  it('formats multiple keystones', () => {
    const keystone = analyzeGateKeystone(richContent, 'a.ts')
    const result = formatKeystonesTable([keystone])
    expect(result).toContain('Phantom Gate Analysis')
  })
})

describe('formatArchTable', () => {
  it('formats arch with keystone', () => {
    const keystone = analyzeGateKeystone(richContent, 'a.ts')
    const arch = analyzeGateArch([keystone], 'src')
    const result = formatArchTable(arch)
    expect(result).toContain('Arch')
    expect(result).toContain('src')
    expect(result).toContain('Avg Quality')
  })
})

describe('formatArchesTable', () => {
  it('returns no arches message for empty', () => {
    expect(formatArchesTable([])).toContain('No gate arches')
  })

  it('formats arches', () => {
    const keystone = analyzeGateKeystone(richContent, 'a.ts')
    const arch = analyzeGateArch([keystone], 'src')
    const result = formatArchesTable([arch])
    expect(result).toContain('Gate Arches')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildPhantomGateResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Phantom Gate Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Fortification')
    expect(output).toContain('Keeper Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const output = formatRecommendations(['Improve threshold', 'Fortify gateway'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Improve threshold')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildPhantomGateResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Phantom Gate Analysis')
    expect(output).toContain('Gate Arches')
    expect(output).toContain('Phantom Gate Statistics')
    expect(output).toContain('Gateway')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildPhantomGateResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.keystones).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.gateway).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only var and any', () => {
    const m = measureArching('var x: any = 1;')
    expect(m.vagueBoundaryCount).toBeGreaterThanOrEqual(1)
    expect(m.untypedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoVagueBoundary).toBe(false)
    expect(m.hasNoUntyped).toBe(false)
  })

  it('handles content with only eval', () => {
    const m = measureGuarding("eval('x')")
    expect(m.hasNoPrivilegeEscalation).toBe(false)
  })

  it('handles content with only debugger', () => {
    const m = measureTraversing('debugger')
    expect(m.hasNoCluttered).toBe(false)
  })

  it('minimal content has low scores across all measures', () => {
    const keystone = analyzeGateKeystone(minimalContent, 'min.ts')
    expect(keystone.thresholdQuality).toBeLessThan(50)
    expect(keystone.gatewaySecurity).toBeLessThan(50)
    expect(keystone.spiritTraversal).toBeLessThan(50)
    expect(keystone.shadowGuardian).toBeLessThan(50)
    expect(keystone.etherealPassage).toBeLessThan(50)
  })

  it('result with all rubble files has correct gateway', async () => {
    const result = await buildPhantomGateResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.gateway.isImpregnable).toBe(false)
    expect(result.stats.rubbleCount).toBe(2)
    expect(result.stats.divinePortalCount).toBe(0)
  })
})
