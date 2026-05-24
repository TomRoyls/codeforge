import { describe, it, expect } from 'vitest'
import {
  measureHiding,
  measureSecuring,
  measureFlowing,
  measureGuarding,
  measureArching,
  classifyKeystoneCondition,
  classifyFortressType,
  classifyFortressCondition,
  classifyWardenGrade,
  analyzeObsidianKeystone,
  analyzeGateFortress,
  buildObsidianGateResult,
  generateRecommendations,
} from '../src/commands/obsidian-gate-helpers.js'
import {
  colorScore,
  colorGrade,
  formatKeystoneTable,
  formatKeystonesTable,
  formatFortressTable,
  formatFortressesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/obsidian-gate-format-helpers.js'
import type { ObsidianKeystone, ObsidianGateStats, ObsidianRealm, GateFortress } from '../src/commands/obsidian-gate-helpers.js'

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

export function processUsers<T>(items: T[], fn: (item: T) => boolean): T[] {
  return items.filter(fn).map(item => item)
}

const config: Config = {
  name: 'test',
  version: 1,
}

export default config
`

const negativeContent = `
var x = 1
var y: any = null
eval("test")
debugger
`

// ─── measureHiding ─────────────────────────────────────────────────

describe('measureHiding', () => {
  it('returns 0 for empty content', () => {
    const m = measureHiding(emptyContent)
    expect(m.darkness).toBe(0)
    expect(m.grade).toBe('no-boundary')
    expect(m.hasHighDarkness).toBe(false)
  })

  it('measures minimal content with const', () => {
    const m = measureHiding(minimalContent)
    expect(m.darkness).toBe(4)
    expect(m.grade).toBe('no-boundary')
  })

  it('detects hasEncapsulated requires export+interface+readonly', () => {
    const m = measureHiding(richContent)
    expect(m.hasEncapsulated).toBe(true)
  })

  it('detects hasPrivateByDefault requires private+class', () => {
    const m = measureHiding(richContent)
    expect(m.hasPrivateByDefault).toBe(true)
  })

  it('detects hasHiddenInternals requires readonly+private', () => {
    const m = measureHiding(richContent)
    expect(m.hasHiddenInternals).toBe(true)
  })

  it('detects hasSealed requires enum+optional', () => {
    const m = measureHiding(richContent)
    expect(m.hasSealed).toBe(true)
  })

  it('detects hasProtected requires generics+interface', () => {
    const m = measureHiding(richContent)
    expect(m.hasProtected).toBe(true)
  })

  it('detects hasOpaque requires const+readonly', () => {
    const m = measureHiding(richContent)
    expect(m.hasOpaque).toBe(true)
  })

  it('counts leaked (var) occurrences', () => {
    const m = measureHiding(negativeContent)
    expect(m.leakedCount).toBe(2)
  })

  it('counts exposedGuts (any) occurrences', () => {
    const m = measureHiding(negativeContent)
    expect(m.exposedGutsCount).toBe(1)
  })

  it('detects hasNoLeaked when no var', () => {
    expect(measureHiding(minimalContent).hasNoLeaked).toBe(true)
  })

  it('detects hasNoExposedGuts when no any', () => {
    expect(measureHiding(minimalContent).hasNoExposedGuts).toBe(true)
  })

  it('detects hasNoOpenInternals when no eval', () => {
    expect(measureHiding(minimalContent).hasNoOpenInternals).toBe(true)
  })

  it('detects hasNoPublicState when no debugger', () => {
    expect(measureHiding(minimalContent).hasNoPublicState).toBe(true)
  })

  it('rich content has perfect-obsidian grade', () => {
    const m = measureHiding(richContent)
    expect(m.darkness).toBe(100)
    expect(m.grade).toBe('perfect-obsidian')
    expect(m.hasHighDarkness).toBe(true)
  })

  it('negative content fails all negative checks', () => {
    const m = measureHiding(negativeContent)
    expect(m.hasNoLeaked).toBe(false)
    expect(m.hasNoExposedGuts).toBe(false)
    expect(m.hasNoOpenInternals).toBe(false)
    expect(m.hasNoPublicState).toBe(false)
  })
})

// ─── measureSecuring ───────────────────────────────────────────────

describe('measureSecuring', () => {
  it('returns 0 for empty content', () => {
    const m = measureSecuring(emptyContent)
    expect(m.security).toBe(0)
    expect(m.gate).toBe('no-security')
  })

  it('measures minimal content', () => {
    const m = measureSecuring(minimalContent)
    expect(m.security).toBe(4)
  })

  it('detects hasInputValidation requires strictEq+tryCatch', () => {
    const m = measureSecuring(richContent)
    expect(m.hasInputValidation).toBe(true)
  })

  it('detects hasAccessControl requires throw+conditional', () => {
    const m = measureSecuring(richContent)
    expect(m.hasAccessControl).toBe(false)
  })

  it('detects hasSanitization requires interface+optional', () => {
    const m = measureSecuring(richContent)
    expect(m.hasSanitization).toBe(true)
  })

  it('detects hasAuthorization requires const+readonly', () => {
    const m = measureSecuring(richContent)
    expect(m.hasAuthorization).toBe(true)
  })

  it('detects hasGuarded requires enum+private', () => {
    const m = measureSecuring(richContent)
    expect(m.hasGuarded).toBe(true)
  })

  it('counts unprotected (var) occurrences', () => {
    const m = measureSecuring(negativeContent)
    expect(m.unprotectedCount).toBe(2)
  })

  it('counts rawInput (any) occurrences', () => {
    const m = measureSecuring(negativeContent)
    expect(m.rawInputCount).toBe(1)
  })

  it('detects negative checks', () => {
    const m = measureSecuring(minimalContent)
    expect(m.hasNoUnprotected).toBe(true)
    expect(m.hasNoAnonymous).toBe(true)
    expect(m.hasNoRawInput).toBe(true)
    expect(m.hasNoPrivilegeEscalation).toBe(true)
  })

  it('rich content has strong gate', () => {
    const m = measureSecuring(richContent)
    expect(m.security).toBeGreaterThan(60)
    expect(m.hasHighSecurity).toBe(true)
  })
})

// ─── measureFlowing ────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureFlowing(emptyContent)
    expect(m.passage).toBe(0)
    expect(m.void).toBe('no-passage')
  })

  it('measures minimal content', () => {
    const m = measureFlowing(minimalContent)
    expect(m.passage).toBe(4)
  })

  it('detects hasEfficientFlow requires export+namedExport', () => {
    const m = measureFlowing(moderateContent)
    expect(m.hasEfficientFlow).toBe(true)
  })

  it('detects hasStreamlined requires returnType+interface', () => {
    const m = measureFlowing(moderateContent)
    expect(m.hasStreamlined).toBe(true)
  })

  it('detects hasCleanInterfaces requires const+async', () => {
    const m = measureFlowing(richContent)
    expect(m.hasCleanInterfaces).toBe(true)
  })

  it('detects hasDirectPaths requires arrow+mapFunction', () => {
    const m = measureFlowing(richContent)
    expect(m.hasDirectPaths).toBe(true)
  })

  it('detects hasOptimized requires generics+optional', () => {
    const m = measureFlowing(richContent)
    expect(m.hasOptimized).toBe(true)
  })

  it('counts bottleneck (var) occurrences', () => {
    const m = measureFlowing(negativeContent)
    expect(m.bottleneckCount).toBe(2)
  })

  it('counts circuit (eval) occurrences', () => {
    const m = measureFlowing(negativeContent)
    expect(m.circuitCount).toBe(1)
  })

  it('detects negative checks', () => {
    const m = measureFlowing(minimalContent)
    expect(m.hasNoBottlenecks).toBe(true)
    expect(m.hasNoCircuits).toBe(true)
    expect(m.hasNoLeakyAbstractions).toBe(true)
    expect(m.hasNoIndirection).toBe(true)
  })

  it('rich content has smooth void', () => {
    const m = measureFlowing(richContent)
    expect(m.passage).toBe(95)
    expect(m.void).toBe('smooth-void')
    expect(m.hasHighPassage).toBe(true)
  })
})

// ─── measureGuarding ───────────────────────────────────────────────

describe('measureGuarding', () => {
  it('returns 0 for empty content', () => {
    const m = measureGuarding(emptyContent)
    expect(m.guard).toBe(0)
    expect(m.shadow).toBe('no-guard')
  })

  it('measures minimal content', () => {
    const m = measureGuarding(minimalContent)
    expect(m.guard).toBe(0)
  })

  it('detects hasBoundaryChecks requires strictEq+conditional', () => {
    const m = measureGuarding(moderateContent)
    expect(m.hasBoundaryChecks).toBe(true)
  })

  it('detects hasTypeGuards requires interface+returnType', () => {
    const m = measureGuarding(moderateContent)
    expect(m.hasTypeGuards).toBe(true)
  })

  it('detects hasEdgeCaseHandling requires tryCatch+throw', () => {
    const m = measureGuarding(richContent)
    expect(m.hasEdgeCaseHandling).toBe(true)
  })

  it('detects hasErrorBoundaries requires enum+readonly', () => {
    const m = measureGuarding(richContent)
    expect(m.hasErrorBoundaries).toBe(true)
  })

  it('detects hasValidated requires generics+private', () => {
    const m = measureGuarding(richContent)
    expect(m.hasValidated).toBe(true)
  })

  it('counts casting (var) occurrences', () => {
    const m = measureGuarding(negativeContent)
    expect(m.castingCount).toBe(2)
  })

  it('counts assumption (eval) occurrences', () => {
    const m = measureGuarding(negativeContent)
    expect(m.assumptionCount).toBe(1)
  })

  it('detects negative checks', () => {
    const m = measureGuarding(minimalContent)
    expect(m.hasNoCasting).toBe(true)
    expect(m.hasNoAssumption).toBe(true)
    expect(m.hasNoUncovered).toBe(true)
    expect(m.hasNoUnguarded).toBe(true)
  })

  it('rich content has high guard', () => {
    const m = measureGuarding(richContent)
    expect(m.guard).toBeGreaterThan(60)
    expect(m.hasHighGuard).toBe(true)
  })
})

// ─── measureArching ────────────────────────────────────────────────

describe('measureArching', () => {
  it('returns 0 for empty content', () => {
    const m = measureArching(emptyContent)
    expect(m.boundary).toBe(0)
    expect(m.ethereal).toBe('no-entrance')
  })

  it('measures minimal content', () => {
    const m = measureArching(minimalContent)
    expect(m.boundary).toBe(6)
  })

  it('detects hasCleanInterface requires docComments+export', () => {
    const m = measureArching(richContent)
    expect(m.hasCleanInterface).toBe(true)
  })

  it('detects hasWellDesignedAPI requires interface+returnType', () => {
    const m = measureArching(richContent)
    expect(m.hasWellDesignedAPI).toBe(true)
  })

  it('detects hasIntuitive requires typeAlias+namedExport', () => {
    const m = measureArching(richContent)
    expect(m.hasIntuitive).toBe(true)
  })

  it('detects hasGraceful requires enum+const', () => {
    const m = measureArching(richContent)
    expect(m.hasGraceful).toBe(true)
  })

  it('detects hasApproachable requires strictEq+generics', () => {
    const m = measureArching(richContent)
    expect(m.hasApproachable).toBe(true)
  })

  it('detects hasElegant requires async+private', () => {
    const m = measureArching(richContent)
    expect(m.hasElegant).toBe(true)
  })

  it('counts clunky (var) occurrences', () => {
    const m = measureArching(negativeContent)
    expect(m.clunkyCount).toBe(2)
  })

  it('counts hostile (eval) occurrences', () => {
    const m = measureArching(negativeContent)
    expect(m.hostileCount).toBe(1)
  })

  it('detects negative checks', () => {
    const m = measureArching(minimalContent)
    expect(m.hasNoClunky).toBe(true)
    expect(m.hasNoHostile).toBe(true)
    expect(m.hasNoUgly).toBe(true)
    expect(m.hasNoIntimidating).toBe(true)
  })

  it('rich content has elegant-arch grade', () => {
    const m = measureArching(richContent)
    expect(m.boundary).toBe(100)
    expect(m.ethereal).toBe('elegant-arch')
    expect(m.hasHighBoundary).toBe(true)
  })
})

// ─── classifyKeystoneCondition ──────────────────────────────────────

describe('classifyKeystoneCondition', () => {
  it('classifies obsidian-masterpiece for 85+', () => {
    expect(classifyKeystoneCondition(85)).toBe('obsidian-masterpiece')
    expect(classifyKeystoneCondition(100)).toBe('obsidian-masterpiece')
  })

  it('classifies dark-portal for 70-84', () => {
    expect(classifyKeystoneCondition(70)).toBe('dark-portal')
  })

  it('classifies proper-gate for 55-69', () => {
    expect(classifyKeystoneCondition(55)).toBe('proper-gate')
  })

  it('classifies iron-door for 40-54', () => {
    expect(classifyKeystoneCondition(40)).toBe('iron-door')
  })

  it('classifies wooden-gate for 25-39', () => {
    expect(classifyKeystoneCondition(25)).toBe('wooden-gate')
  })

  it('classifies gap-in-wall for below 25', () => {
    expect(classifyKeystoneCondition(0)).toBe('gap-in-wall')
  })
})

// ─── classifyFortressType ──────────────────────────────────────────

describe('classifyFortressType', () => {
  it('returns no-fortress for empty keystones', () => {
    expect(classifyFortressType([])).toBe('no-fortress')
  })

  it('returns dark-fortress for high avgQS and masterpieceRatio', () => {
    const k = { qualityScore: 90, condition: 'obsidian-masterpiece' } as ObsidianKeystone
    expect(classifyFortressType([k, k])).toBe('dark-fortress')
  })

  it('returns obsidian-castle for avgQS >= 60', () => {
    const k = { qualityScore: 65, condition: 'dark-portal' } as ObsidianKeystone
    expect(classifyFortressType([k])).toBe('obsidian-castle')
  })

  it('returns proper-fortress for avgQS >= 45', () => {
    const k = { qualityScore: 50, condition: 'proper-gate' } as ObsidianKeystone
    expect(classifyFortressType([k])).toBe('proper-fortress')
  })

  it('returns watchtower for avgQS >= 30', () => {
    const k = { qualityScore: 35, condition: 'iron-door' } as ObsidianKeystone
    expect(classifyFortressType([k])).toBe('watchtower')
  })

  it('returns no-fortress for very low avgQS', () => {
    const k = { qualityScore: 5, condition: 'gap-in-wall' } as ObsidianKeystone
    expect(classifyFortressType([k])).toBe('no-fortress')
  })
})

// ─── classifyFortressCondition ──────────────────────────────────────

describe('classifyFortressCondition', () => {
  it('classifies impregnable-fortress for 75+', () => {
    expect(classifyFortressCondition(75)).toBe('impregnable-fortress')
  })

  it('classifies dark-citadel for 60-74', () => {
    expect(classifyFortressCondition(60)).toBe('dark-citadel')
  })

  it('classifies decent-fortress for 45-59', () => {
    expect(classifyFortressCondition(45)).toBe('decent-fortress')
  })

  it('classifies weak-wall for 30-44', () => {
    expect(classifyFortressCondition(30)).toBe('weak-wall')
  })

  it('classifies breached for 15-29', () => {
    expect(classifyFortressCondition(15)).toBe('breached')
  })

  it('classifies void for below 15', () => {
    expect(classifyFortressCondition(0)).toBe('void')
  })
})

// ─── classifyWardenGrade ───────────────────────────────────────────

describe('classifyWardenGrade', () => {
  it('classifies shadow-warden for 80+', () => {
    expect(classifyWardenGrade(80)).toBe('shadow-warden')
  })

  it('classifies gate-commander for 65-79', () => {
    expect(classifyWardenGrade(65)).toBe('gate-commander')
  })

  it('classifies skilled-guard for 50-64', () => {
    expect(classifyWardenGrade(50)).toBe('skilled-guard')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyWardenGrade(35)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyWardenGrade(20)).toBe('novice')
  })

  it('classifies gate-crasher for below 20', () => {
    expect(classifyWardenGrade(0)).toBe('gate-crasher')
  })
})

// ─── analyzeObsidianKeystone ───────────────────────────────────────

describe('analyzeObsidianKeystone', () => {
  it('analyzes empty content', () => {
    const k = analyzeObsidianKeystone(emptyContent, 'empty.ts')
    expect(k.file).toBe('empty.ts')
    expect(k.thresholdDarkness).toBe(0)
    expect(k.gateSecurity).toBe(0)
    expect(k.voidPassage).toBe(0)
    expect(k.shadowGuard).toBe(0)
    expect(k.etherealBoundary).toBe(0)
    expect(k.qualityScore).toBe(0)
    expect(k.condition).toBe('gap-in-wall')
  })

  it('analyzes minimal content', () => {
    const k = analyzeObsidianKeystone(minimalContent, 'mini.ts')
    expect(k.thresholdDarkness).toBe(4)
    expect(k.gateSecurity).toBe(4)
    expect(k.voidPassage).toBe(4)
    expect(k.shadowGuard).toBe(0)
    expect(k.etherealBoundary).toBe(6)
    expect(k.qualityScore).toBe(Math.round((4 + 4 + 4 + 0 + 6) * 0.2))
  })

  it('analyzes rich content with high scores', () => {
    const k = analyzeObsidianKeystone(richContent, 'rich.ts')
    expect(k.thresholdDarkness).toBeGreaterThan(60)
    expect(k.gateSecurity).toBeGreaterThan(60)
    expect(k.voidPassage).toBeGreaterThan(60)
    expect(k.etherealBoundary).toBeGreaterThan(60)
  })

  it('includes all measure objects', () => {
    const k = analyzeObsidianKeystone(richContent, 'measures.ts')
    expect(k.hiding).toBeDefined()
    expect(k.securing).toBeDefined()
    expect(k.flowing).toBeDefined()
    expect(k.guarding).toBeDefined()
    expect(k.arching).toBeDefined()
  })

  it('classifies rich content as obsidian-masterpiece', () => {
    const k = analyzeObsidianKeystone(richContent, 'master.ts')
    expect(k.condition).toBe('obsidian-masterpiece')
  })
})

// ─── analyzeGateFortress ───────────────────────────────────────────

describe('analyzeGateFortress', () => {
  it('returns empty fortress for no keystones', () => {
    const f = analyzeGateFortress([], 'empty-dir')
    expect(f.directory).toBe('empty-dir')
    expect(f.keystones).toHaveLength(0)
    expect(f.avgDarkness).toBe(0)
    expect(f.fortressType).toBe('no-fortress')
    expect(f.condition).toBe('void')
  })

  it('analyzes fortress with single keystone', () => {
    const k = analyzeObsidianKeystone(richContent, 'dir/file.ts')
    const f = analyzeGateFortress([k], 'dir')
    expect(f.keystones).toHaveLength(1)
    expect(f.avgDarkness).toBe(k.thresholdDarkness)
  })

  it('counts obsidian masterpieces', () => {
    const k = analyzeObsidianKeystone(richContent, 'dir/rich.ts')
    const f = analyzeGateFortress([k], 'dir')
    expect(f.obsidianMasterpieceCount).toBe(1)
  })

  it('counts gaps in wall', () => {
    const k = analyzeObsidianKeystone(emptyContent, 'dir/empty.ts')
    const f = analyzeGateFortress([k], 'dir')
    expect(f.gapInWallCount).toBe(1)
  })
})

// ─── buildObsidianGateResult ───────────────────────────────────────

describe('buildObsidianGateResult', () => {
  it('handles empty input', async () => {
    const result = await buildObsidianGateResult([], [])
    expect(result.keystones).toHaveLength(0)
    expect(result.fortresses).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.realm.isImpregnable).toBe(false)
    expect(result.realm.overallFortification).toBe(0)
    expect(result.stats.wardenGrade).toBe('gate-crasher')
  })

  it('analyzes single file', async () => {
    const result = await buildObsidianGateResult(['test.ts'], [richContent])
    expect(result.keystones).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into fortresses', async () => {
    const result = await buildObsidianGateResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.fortresses.length).toBe(2)
  })

  it('computes realm averages', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [richContent])
    expect(result.realm.avgDarkness).toBeGreaterThan(0)
    expect(result.realm.avgSecurity).toBeGreaterThan(0)
    expect(result.realm.avgBoundary).toBeGreaterThan(0)
  })

  it('computes stats bestKeystone and mostEncapsulated', async () => {
    const result = await buildObsidianGateResult(
      ['rich.ts', 'poor.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestKeystone).toBe('rich.ts')
    expect(result.stats.mostEncapsulated).toBe('rich.ts')
    expect(result.stats.mostSecure).toBe('rich.ts')
    expect(result.stats.smoothestFlow).toBe('rich.ts')
    expect(result.stats.bestGuarded).toBe('rich.ts')
  })

  it('computes condition counts', async () => {
    const result = await buildObsidianGateResult(
      ['rich.ts', 'empty.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.obsidianMasterpieceCount + result.stats.darkPortalCount +
      result.stats.properGateCount + result.stats.ironDoorCount +
      result.stats.woodenGateCount + result.stats.gapInWallCount).toBe(2)
  })

  it('generates recommendations', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('realm isImpregnable for rich content', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [richContent])
    expect(result.realm.isImpregnable).toBe(true)
  })

  it('realm isImpregnable is false for empty content', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [emptyContent])
    expect(result.realm.isImpregnable).toBe(false)
  })

  it('handles missing content gracefully', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [])
    expect(result.keystones).toHaveLength(1)
    expect(result.keystones[0].thresholdDarkness).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message when everything is great', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('obsidian gate')
  })

  it('recommends deepening darkness when low', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [emptyContent])
    expect(result.recommendations.some(r => r.includes('threshold darkness'))).toBe(true)
  })

  it('recommends strengthening security when low', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [emptyContent])
    expect(result.recommendations.some(r => r.includes('gate security'))).toBe(true)
  })

  it('recommends improving passage when low', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [emptyContent])
    expect(result.recommendations.some(r => r.includes('void passage'))).toBe(true)
  })

  it('recommends enhancing guard when low', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [emptyContent])
    expect(result.recommendations.some(r => r.includes('shadow guard'))).toBe(true)
  })

  it('recommends refining boundary when low', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [emptyContent])
    expect(result.recommendations.some(r => r.includes('ethereal boundary'))).toBe(true)
  })
})

// ─── colorScore ────────────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores', () => {
    expect(colorScore(90)).toContain('90')
  })
  it('colors mid scores', () => {
    expect(colorScore(50)).toContain('50')
  })
  it('colors zero', () => {
    expect(colorScore(0)).toContain('0')
  })
})

// ─── colorGrade ────────────────────────────────────────────────────

describe('colorGrade', () => {
  it('colors obsidian-masterpiece', () => {
    expect(colorGrade('obsidian-masterpiece')).toContain('obsidian-masterpiece')
  })
  it('colors dark-portal', () => {
    expect(colorGrade('dark-portal')).toContain('dark-portal')
  })
  it('colors gap-in-wall', () => {
    expect(colorGrade('gap-in-wall')).toContain('gap-in-wall')
  })
  it('handles unknown grade', () => {
    expect(colorGrade('unknown-grade')).toContain('unknown-grade')
  })
})

// ─── formatKeystoneTable ───────────────────────────────────────────

describe('formatKeystoneTable', () => {
  it('formats keystone with all fields', () => {
    const k = analyzeObsidianKeystone(richContent, 'test.ts')
    const output = formatKeystoneTable(k)
    expect(output).toContain('test.ts')
    expect(output).toContain('Threshold Darkness')
    expect(output).toContain('Gate Security')
    expect(output).toContain('Void Passage')
    expect(output).toContain('Shadow Guard')
    expect(output).toContain('Ethereal Boundary')
  })
})

// ─── formatKeystonesTable ──────────────────────────────────────────

describe('formatKeystonesTable', () => {
  it('shows message for empty', () => {
    expect(formatKeystonesTable([])).toContain('No obsidian keystones found')
  })

  it('formats multiple keystones', () => {
    const k1 = analyzeObsidianKeystone(richContent, 'a.ts')
    const k2 = analyzeObsidianKeystone(moderateContent, 'b.ts')
    const output = formatKeystonesTable([k1, k2])
    expect(output).toContain('Obsidian Gate Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

// ─── formatFortressTable ───────────────────────────────────────────

describe('formatFortressTable', () => {
  it('formats fortress with all fields', () => {
    const k = analyzeObsidianKeystone(richContent, 'src/test.ts')
    const f = analyzeGateFortress([k], 'src')
    const output = formatFortressTable(f)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Avg Darkness')
    expect(output).toContain('Obsidian Masterpieces')
  })
})

// ─── formatFortressesTable ─────────────────────────────────────────

describe('formatFortressesTable', () => {
  it('shows message for empty', () => {
    expect(formatFortressesTable([])).toContain('No gate fortresses found')
  })
})

// ─── formatResultTable ─────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Obsidian Gate Analysis')
    expect(output).toContain('Gate Fortresses')
    expect(output).toContain('Obsidian Gate Statistics')
    expect(output).toContain('Realm')
    expect(output).toContain('Recommendations')
  })
})

// ─── formatResultJson ──────────────────────────────────────────────

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.keystones).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed).toHaveProperty('realm')
    expect(parsed).toHaveProperty('recommendations')
  })
})

// ─── Integration ───────────────────────────────────────────────────

describe('integration', () => {
  it('handles negative content', async () => {
    const result = await buildObsidianGateResult(['bad.ts'], [negativeContent])
    expect(result.keystones[0].condition).toBe('gap-in-wall')
    expect(result.stats.gapInWallCount).toBe(1)
  })

  it('handles mixed quality files', async () => {
    const result = await buildObsidianGateResult(
      ['rich.ts', 'empty.ts', 'moderate.ts'],
      [richContent, emptyContent, moderateContent],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.gapInWallCount).toBeGreaterThan(0)
  })

  it('stats overallFortification equals realm overallFortification', async () => {
    const result = await buildObsidianGateResult(['a.ts'], [richContent])
    expect(result.stats.overallFortification).toBe(result.realm.overallFortification)
  })

  it('qualityScore is capped by measure scores', () => {
    const k = analyzeObsidianKeystone(richContent, 'cap.ts')
    expect(k.qualityScore).toBeLessThanOrEqual(100)
  })

  it('all measure scores are capped at 100', () => {
    const k = analyzeObsidianKeystone(richContent, 'cap.ts')
    expect(k.thresholdDarkness).toBeLessThanOrEqual(100)
    expect(k.gateSecurity).toBeLessThanOrEqual(100)
    expect(k.voidPassage).toBeLessThanOrEqual(100)
    expect(k.shadowGuard).toBeLessThanOrEqual(100)
    expect(k.etherealBoundary).toBeLessThanOrEqual(100)
  })

  it('handles many files in same directory', async () => {
    const files = Array.from({ length: 10 }, (_, i) => `src/file${i}.ts`)
    const contents = Array.from({ length: 10 }, () => moderateContent)
    const result = await buildObsidianGateResult(files, contents)
    expect(result.fortresses.length).toBe(1)
    expect(result.fortresses[0].keystones.length).toBe(10)
  })

  it('handles files across many directories', async () => {
    const files = ['a/f.ts', 'b/f.ts', 'c/f.ts', 'd/f.ts', 'e/f.ts']
    const contents = Array.from({ length: 5 }, () => minimalContent)
    const result = await buildObsidianGateResult(files, contents)
    expect(result.fortresses.length).toBe(5)
  })

  it('empty content has no positive flags', () => {
    const h = measureHiding(emptyContent)
    expect(h.hasEncapsulated).toBe(false)
    expect(h.hasPrivateByDefault).toBe(false)
    expect(h.hasHiddenInternals).toBe(false)
    expect(h.hasSealed).toBe(false)
    expect(h.hasProtected).toBe(false)
    expect(h.hasOpaque).toBe(false)
  })
})
