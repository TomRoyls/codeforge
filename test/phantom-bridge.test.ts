import { describe, it, expect } from 'vitest'
import {
  measureBridging,
  measureHaunting,
  measureNavigating,
  measureRevealing,
  measureEnduring,
  classifySpanCondition,
  classifyCrossingType,
  classifyCrossingCondition,
  classifyEngineerGrade,
  analyzePhantomSpan,
  analyzeBridgeCrossing,
  buildPhantomBridgeResult,
  generateRecommendations,
} from '../src/commands/phantom-bridge-helpers.js'
import {
  colorScore,
  colorGrade,
  formatSpanTable,
  formatSpansTable,
  formatCrossingTable,
  formatCrossingsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/phantom-bridge-format-helpers.js'
import type {
  PhantomSpan,
  PhantomBridgeStats,
  PhantomBridgeResult,
  NetworkSummary,
} from '../src/commands/phantom-bridge-helpers.js'

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
    const validated = validateUser(config)
    return validated
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
    throw error
  }
}

function validateUser(user: Config): UserConfig {
  return {
    name: user.name ?? 'unknown',
    age: user.age ?? 0,
    role: user.role ?? 'user',
  }
}

export class UserService {
  private users: Map<string, UserConfig> = new Map()

  getUser(id: string): UserConfig | undefined {
    return this.users.get(id)
  }
}

const defaultConfig: UserConfig = {
  name: 'default',
  age: 25,
  role: 'user',
}
`

const poorContent = `var x = eval("1 + 2")
debugger
any thing = x
var y = eval("3 + 4")
`

// ─── measureBridging ───────────────────────────────────────────────

describe('measureBridging', () => {
  it('returns valid BridgingMeasure for empty content', () => {
    const result = measureBridging(emptyContent)
    expect(result.stability).toBeGreaterThanOrEqual(0)
    expect(result.stability).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighStability).toBe(false)
    expect(result.breakingChangesCount).toBe(0)
    expect(result.unversionedCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureBridging(emptyContent)
    const rich = measureBridging(richContent)
    expect(rich.stability).toBeGreaterThan(empty.stability)
  })

  it('detects stableAPI in rich content', () => {
    expect(measureBridging(richContent).hasStableAPI).toBe(true)
  })

  it('detects consistentInterface in rich content', () => {
    expect(measureBridging(richContent).hasConsistentInterface).toBe(true)
  })

  it('detects versioned in rich content', () => {
    expect(measureBridging(richContent).hasVersioned).toBe(true)
  })

  it('detects typed in rich content', () => {
    expect(measureBridging(richContent).hasTyped).toBe(true)
  })

  it('detects documented in rich content', () => {
    expect(measureBridging(richContent).hasDocumented).toBe(true)
  })

  it('detects backwardCompatible in rich content', () => {
    expect(measureBridging(richContent).hasBackwardCompatible).toBe(true)
  })

  it('detects high stability for rich content', () => {
    expect(measureBridging(richContent).hasHighStability).toBe(true)
  })

  it('grades empty content as no-bridge', () => {
    expect(measureBridging(emptyContent).grade).toBe('no-bridge')
  })

  it('counts breakingChanges (var) in poor content', () => {
    const result = measureBridging(poorContent)
    expect(result.breakingChangesCount).toBeGreaterThan(0)
    expect(result.hasNoBreakingChanges).toBe(false)
  })
})

// ─── measureHaunting ───────────────────────────────────────────────

describe('measureHaunting', () => {
  it('returns valid HauntingMeasure for empty content', () => {
    const result = measureHaunting(emptyContent)
    expect(result.handling).toBeGreaterThanOrEqual(0)
    expect(result.handling).toBeLessThanOrEqual(100)
    expect(typeof result.ghost).toBe('string')
    expect(result.bareAccessCount).toBe(0)
    expect(result.uncoveredCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureHaunting(emptyContent)
    const rich = measureHaunting(richContent)
    expect(rich.handling).toBeGreaterThan(empty.handling)
  })

  it('detects nullChecks in rich content', () => {
    expect(measureHaunting(richContent).hasNullChecks).toBe(true)
  })

  it('detects undefinedGuards in rich content', () => {
    expect(measureHaunting(richContent).hasUndefinedGuards).toBe(true)
  })

  it('detects edgeCaseCovered in rich content', () => {
    expect(measureHaunting(richContent).hasEdgeCaseCovered).toBe(true)
  })

  it('detects boundaryConditions in rich content', () => {
    expect(measureHaunting(richContent).hasBoundaryConditions).toBe(true)
  })

  it('detects errorStates in rich content', () => {
    expect(measureHaunting(richContent).hasErrorStates).toBe(true)
  })

  it('detects complete in rich content', () => {
    expect(measureHaunting(richContent).hasComplete).toBe(true)
  })

  it('detects high handling for rich content', () => {
    expect(measureHaunting(richContent).hasHighHandling).toBe(true)
  })

  it('grades empty content as poltergeist', () => {
    expect(measureHaunting(emptyContent).ghost).toBe('poltergeist')
  })

  it('counts bareAccess (var) in poor content', () => {
    const result = measureHaunting(poorContent)
    expect(result.bareAccessCount).toBeGreaterThan(0)
    expect(result.hasNoBareAccess).toBe(false)
  })
})

// ─── measureNavigating ─────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns valid NavigatingMeasure for empty content', () => {
    const result = measureNavigating(emptyContent)
    expect(result.navigation).toBeGreaterThanOrEqual(0)
    expect(result.navigation).toBeLessThanOrEqual(100)
    expect(typeof result.fog).toBe('string')
    expect(result.assumptionCount).toBe(0)
    expect(result.bareDereferenceCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureNavigating(emptyContent)
    const rich = measureNavigating(richContent)
    expect(rich.navigation).toBeGreaterThan(empty.navigation)
  })

  it('detects defaultValues in rich content', () => {
    expect(measureNavigating(richContent).hasDefaultValues).toBe(true)
  })

  it('detects fallbacks in rich content', () => {
    expect(measureNavigating(richContent).hasFallbacks).toBe(true)
  })

  it('detects optionalChaining in rich content', () => {
    expect(measureNavigating(richContent).hasOptionalChaining).toBe(true)
  })

  it('detects validation in rich content', () => {
    expect(measureNavigating(richContent).hasValidation).toBe(true)
  })

  it('detects gracefulDegradation in rich content', () => {
    expect(measureNavigating(richContent).hasGracefulDegradation).toBe(true)
  })

  it('detects adaptive in rich content', () => {
    expect(measureNavigating(richContent).hasAdaptive).toBe(true)
  })

  it('detects high navigation for rich content', () => {
    expect(measureNavigating(richContent).hasHighNavigation).toBe(true)
  })

  it('grades empty content as no-navigation', () => {
    expect(measureNavigating(emptyContent).fog).toBe('no-navigation')
  })

  it('counts assumptions (var) in poor content', () => {
    const result = measureNavigating(poorContent)
    expect(result.assumptionCount).toBeGreaterThan(0)
    expect(result.hasNoAssumptions).toBe(false)
  })
})

// ─── measureRevealing ──────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns valid RevealingMeasure for empty content', () => {
    const result = measureRevealing(emptyContent)
    expect(result.transparency).toBeGreaterThanOrEqual(0)
    expect(result.transparency).toBeLessThanOrEqual(100)
    expect(typeof result.spirit).toBe('string')
    expect(result.silentOpsCount).toBe(0)
    expect(result.blackBoxCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureRevealing(emptyContent)
    const rich = measureRevealing(richContent)
    expect(rich.transparency).toBeGreaterThan(empty.transparency)
  })

  it('detects logging in rich content', () => {
    expect(measureRevealing(richContent).hasLogging).toBe(true)
  })

  it('detects debugInfo in rich content', () => {
    expect(measureRevealing(richContent).hasDebugInfo).toBe(true)
  })

  it('detects tracing in rich content', () => {
    expect(measureRevealing(richContent).hasTracing).toBe(true)
  })

  it('detects observable in rich content', () => {
    expect(measureRevealing(richContent).hasObservable).toBe(true)
  })

  it('detects metrics in rich content', () => {
    expect(measureRevealing(richContent).hasMetrics).toBe(true)
  })

  it('detects reporting in rich content', () => {
    expect(measureRevealing(richContent).hasReporting).toBe(true)
  })

  it('detects high transparency for rich content', () => {
    expect(measureRevealing(richContent).hasHighTransparency).toBe(true)
  })

  it('grades empty content as invisible', () => {
    expect(measureRevealing(emptyContent).spirit).toBe('invisible')
  })

  it('counts silentOps (var) in poor content', () => {
    const result = measureRevealing(poorContent)
    expect(result.silentOpsCount).toBeGreaterThan(0)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns valid EnduringMeasure for empty content', () => {
    const result = measureEnduring(emptyContent)
    expect(result.resilience).toBeGreaterThanOrEqual(0)
    expect(result.resilience).toBeLessThanOrEqual(100)
    expect(typeof result.phantom).toBe('string')
    expect(result.bareThrowCount).toBe(0)
    expect(result.singlePointFailCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureEnduring(emptyContent)
    const rich = measureEnduring(richContent)
    expect(rich.resilience).toBeGreaterThan(empty.resilience)
  })

  it('detects errorRecovery in rich content', () => {
    expect(measureEnduring(richContent).hasErrorRecovery).toBe(true)
  })

  it('detects retryLogic in rich content', () => {
    expect(measureEnduring(richContent).hasRetryLogic).toBe(true)
  })

  it('detects circuitBreaker in rich content', () => {
    expect(measureEnduring(richContent).hasCircuitBreaker).toBe(true)
  })

  it('detects gracefulShutdown in rich content', () => {
    expect(measureEnduring(richContent).hasGracefulShutdown).toBe(true)
  })

  it('detects selfHealing in rich content', () => {
    expect(measureEnduring(richContent).hasSelfHealing).toBe(true)
  })

  it('detects high resilience for rich content', () => {
    expect(measureEnduring(richContent).hasHighResilience).toBe(true)
  })

  it('grades empty content as no-resilience', () => {
    expect(measureEnduring(emptyContent).phantom).toBe('no-resilience')
  })

  it('counts bareThrow (var) in poor content', () => {
    const result = measureEnduring(poorContent)
    expect(result.bareThrowCount).toBeGreaterThan(0)
  })
})

// ─── classifySpanCondition ─────────────────────────────────────────

describe('classifySpanCondition', () => {
  it('classifies 90 as ethereal-crossing', () => expect(classifySpanCondition(90)).toBe('ethereal-crossing'))
  it('classifies 75 as solid-phantom', () => expect(classifySpanCondition(75)).toBe('solid-phantom'))
  it('classifies 60 as proper-bridge', () => expect(classifySpanCondition(60)).toBe('proper-bridge'))
  it('classifies 45 as crumbling-arch', () => expect(classifySpanCondition(45)).toBe('crumbling-arch'))
  it('classifies 30 as ghostly-remains', () => expect(classifySpanCondition(30)).toBe('ghostly-remains'))
  it('classifies 10 as void', () => expect(classifySpanCondition(10)).toBe('void'))
  it('classifies 0 as void', () => expect(classifySpanCondition(0)).toBe('void'))
  it('classifies 85 as ethereal-crossing', () => expect(classifySpanCondition(85)).toBe('ethereal-crossing'))
})

// ─── classifyCrossingType ──────────────────────────────────────────

describe('classifyCrossingType', () => {
  it('returns no-crossing for empty spans', () => {
    expect(classifyCrossingType([])).toBe('no-crossing')
  })

  it('returns grand-viaduct for high quality ethereal majority', () => {
    const spans: PhantomSpan[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      connectionStability: 90, ghostHandling: 90, fogNavigation: 90,
      spiritTransparency: 90, phantomResilience: 90,
      bridging: measureBridging(richContent),
      haunting: measureHaunting(richContent),
      navigating: measureNavigating(richContent),
      revealing: measureRevealing(richContent),
      enduring: measureEnduring(richContent),
      condition: 'ethereal-crossing' as const,
      qualityScore: 85,
    }))
    const result = classifyCrossingType(spans)
    expect(['grand-viaduct', 'proper-crossing']).toContain(result)
  })

  it('returns no-crossing for very low quality', () => {
    const spans: PhantomSpan[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      connectionStability: 5, ghostHandling: 5, fogNavigation: 5,
      spiritTransparency: 5, phantomResilience: 5,
      bridging: measureBridging(emptyContent),
      haunting: measureHaunting(emptyContent),
      navigating: measureNavigating(emptyContent),
      revealing: measureRevealing(emptyContent),
      enduring: measureEnduring(emptyContent),
      condition: 'void' as const,
      qualityScore: 5,
    }))
    expect(classifyCrossingType(spans)).toBe('no-crossing')
  })
})

// ─── classifyCrossingCondition ─────────────────────────────────────

describe('classifyCrossingCondition', () => {
  it('classifies 80 as magnificent-span', () => expect(classifyCrossingCondition(80)).toBe('magnificent-span'))
  it('classifies 65 as sturdy-bridge', () => expect(classifyCrossingCondition(65)).toBe('sturdy-bridge'))
  it('classifies 50 as decent-crossing', () => expect(classifyCrossingCondition(50)).toBe('decent-crossing'))
  it('classifies 35 as rickety-planks', () => expect(classifyCrossingCondition(35)).toBe('rickety-planks'))
  it('classifies 20 as broken-bridge', () => expect(classifyCrossingCondition(20)).toBe('broken-bridge'))
  it('classifies 5 as void', () => expect(classifyCrossingCondition(5)).toBe('void'))
})

// ─── classifyEngineerGrade ─────────────────────────────────────────

describe('classifyEngineerGrade', () => {
  it('classifies 85 as master-architect', () => expect(classifyEngineerGrade(85)).toBe('master-architect'))
  it('classifies 70 as bridge-engineer', () => expect(classifyEngineerGrade(70)).toBe('bridge-engineer'))
  it('classifies 55 as skilled-builder', () => expect(classifyEngineerGrade(55)).toBe('skilled-builder'))
  it('classifies 40 as apprentice', () => expect(classifyEngineerGrade(40)).toBe('apprentice'))
  it('classifies 25 as novice', () => expect(classifyEngineerGrade(25)).toBe('novice'))
  it('classifies 10 as collapser', () => expect(classifyEngineerGrade(10)).toBe('collapser'))
})

// ─── analyzePhantomSpan ────────────────────────────────────────────

describe('analyzePhantomSpan', () => {
  it('analyzes empty content as void', () => {
    const result = analyzePhantomSpan(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('void')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzePhantomSpan(emptyContent, 'empty.ts')
    const rich = analyzePhantomSpan(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzePhantomSpan(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.bridging.stability * 0.2 +
      result.haunting.handling * 0.2 +
      result.navigating.navigation * 0.2 +
      result.revealing.transparency * 0.2 +
      result.enduring.resilience * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzePhantomSpan(richContent, 'rich.ts')
    expect(result.bridging).toBeDefined()
    expect(result.haunting).toBeDefined()
    expect(result.navigating).toBeDefined()
    expect(result.revealing).toBeDefined()
    expect(result.enduring).toBeDefined()
  })

  it('sets connectionStability from bridging.stability', () => {
    const result = analyzePhantomSpan(richContent, 'rich.ts')
    expect(result.connectionStability).toBe(result.bridging.stability)
  })

  it('sets ghostHandling from haunting.handling', () => {
    const result = analyzePhantomSpan(richContent, 'rich.ts')
    expect(result.ghostHandling).toBe(result.haunting.handling)
  })

  it('sets fogNavigation from navigating.navigation', () => {
    const result = analyzePhantomSpan(richContent, 'rich.ts')
    expect(result.fogNavigation).toBe(result.navigating.navigation)
  })

  it('sets spiritTransparency from revealing.transparency', () => {
    const result = analyzePhantomSpan(richContent, 'rich.ts')
    expect(result.spiritTransparency).toBe(result.revealing.transparency)
  })
})

// ─── analyzeBridgeCrossing ─────────────────────────────────────────

describe('analyzeBridgeCrossing', () => {
  it('returns empty crossing for no spans', () => {
    const result = analyzeBridgeCrossing([], 'src')
    expect(result.directory).toBe('src')
    expect(result.spans).toHaveLength(0)
    expect(result.avgStability).toBe(0)
    expect(result.avgTransparency).toBe(0)
    expect(result.avgResilience).toBe(0)
    expect(result.etherealCrossingCount).toBe(0)
    expect(result.voidCount).toBe(0)
    expect(result.crossingType).toBe('no-crossing')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single span', () => {
    const span = analyzePhantomSpan(richContent, 'rich.ts')
    const result = analyzeBridgeCrossing([span], 'src')
    expect(result.avgStability).toBe(span.connectionStability)
    expect(result.avgTransparency).toBe(span.spiritTransparency)
    expect(result.avgResilience).toBe(span.phantomResilience)
  })

  it('counts ethereal crossings and voids', () => {
    const ethereal = analyzePhantomSpan(richContent, 'rich.ts')
    const voided = analyzePhantomSpan(emptyContent, 'empty.ts')
    if (ethereal.condition === 'ethereal-crossing' && voided.condition === 'void') {
      const result = analyzeBridgeCrossing([ethereal, voided], 'src')
      expect(result.etherealCrossingCount).toBe(1)
      expect(result.voidCount).toBe(1)
    }
  })
})

// ─── buildPhantomBridgeResult ──────────────────────────────────────

describe('buildPhantomBridgeResult', () => {
  it('handles empty input', async () => {
    const result = await buildPhantomBridgeResult([], [])
    expect(result.spans).toHaveLength(0)
    expect(result.crossings).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCrossings).toBe(0)
    expect(result.stats.overallSpanQuality).toBe(0)
    expect(result.network.isConnected).toBe(false)
    expect(result.network.overallSpanQuality).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildPhantomBridgeResult(['file.ts'], [richContent])
    expect(result.spans).toHaveLength(1)
    expect(result.spans[0].file).toBe('file.ts')
    expect(result.crossings).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into crossings by directory', async () => {
    const result = await buildPhantomBridgeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.spans).toHaveLength(3)
    expect(result.crossings).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalCrossings).toBe(2)
  })

  it('computes network summary correctly', async () => {
    const result = await buildPhantomBridgeResult(['f.ts'], [richContent])
    expect(result.network.avgStability).toBe(result.spans[0].connectionStability)
    expect(result.network.overallSpanQuality).toBeGreaterThanOrEqual(0)
  })

  it('sets isConnected when avgStability >= 60', async () => {
    const result = await buildPhantomBridgeResult(['f.ts'], [richContent])
    if (result.network.avgStability >= 60) {
      expect(result.network.isConnected).toBe(true)
    } else {
      expect(result.network.isConnected).toBe(false)
    }
  })

  it('tracks best span and top performers', async () => {
    const result = await buildPhantomBridgeResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestSpan).toBe('a.ts')
    expect(result.stats.mostStable).toBeDefined()
    expect(result.stats.bestGhostHandler).toBeDefined()
    expect(result.stats.bestNavigator).toBeDefined()
    expect(result.stats.mostTransparent).toBeDefined()
  })

  it('computes overallSpanQuality as avg of stability+transparency+resilience', async () => {
    const result = await buildPhantomBridgeResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.network.avgStability + result.network.avgTransparency + result.network.avgResilience) / 3,
    )
    expect(result.network.overallSpanQuality).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildPhantomBridgeResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.etherealCrossingCount +
      result.stats.solidPhantomCount +
      result.stats.properBridgeCount +
      result.stats.crumblingArchCount +
      result.stats.ghostlyRemainsCount +
      result.stats.voidCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildPhantomBridgeResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets engineer grade', async () => {
    const result = await buildPhantomBridgeResult(['f.ts'], [richContent])
    expect(['master-architect', 'bridge-engineer', 'skilled-builder', 'apprentice', 'novice', 'collapser']).toContain(
      result.stats.engineerGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: PhantomBridgeStats = {
    totalFiles: 0, totalCrossings: 0,
    avgConnectionStability: 0, avgGhostHandling: 0, avgFogNavigation: 0,
    avgSpiritTransparency: 0, avgPhantomResilience: 0,
    etherealCrossingCount: 0, solidPhantomCount: 0, properBridgeCount: 0,
    crumblingArchCount: 0, ghostlyRemainsCount: 0, voidCount: 0,
    hasHighStabilityCount: 0, hasHighHandlingCount: 0, hasHighNavigationCount: 0,
    hasHighTransparencyCount: 0, hasHighResilienceCount: 0,
    overallSpanQuality: 0, engineerGrade: 'collapser',
    bestSpan: '', mostStable: '', bestGhostHandler: '', bestNavigator: '', mostTransparent: '',
  }

  const emptyNetwork: NetworkSummary = {
    avgStability: 0, avgTransparency: 0, avgResilience: 0,
    isConnected: false, overallSpanQuality: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyNetwork, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes stability recommendation when avgConnectionStability < 50', () => {
    const stats = { ...emptyStats, avgConnectionStability: 30 }
    const recs = generateRecommendations([], [], emptyNetwork, stats)
    expect(recs.some(r => r.includes('stability') || r.includes('API'))).toBe(true)
  })

  it('includes ghost handling recommendation when avgGhostHandling < 50', () => {
    const stats = { ...emptyStats, avgGhostHandling: 30 }
    const recs = generateRecommendations([], [], emptyNetwork, stats)
    expect(recs.some(r => r.includes('ghost') || r.includes('null'))).toBe(true)
  })

  it('includes fog navigation recommendation when avgFogNavigation < 50', () => {
    const stats = { ...emptyStats, avgFogNavigation: 30 }
    const recs = generateRecommendations([], [], emptyNetwork, stats)
    expect(recs.some(r => r.includes('fog') || r.includes('default'))).toBe(true)
  })

  it('includes transparency recommendation when avgSpiritTransparency < 50', () => {
    const stats = { ...emptyStats, avgSpiritTransparency: 30 }
    const recs = generateRecommendations([], [], emptyNetwork, stats)
    expect(recs.some(r => r.includes('transparency') || r.includes('documentation'))).toBe(true)
  })

  it('includes resilience recommendation when avgPhantomResilience < 50', () => {
    const stats = { ...emptyStats, avgPhantomResilience: 30 }
    const recs = generateRecommendations([], [], emptyNetwork, stats)
    expect(recs.some(r => r.includes('resilience') || r.includes('error'))).toBe(true)
  })

  it('includes void guidance when voidCount > 0', () => {
    const stats = { ...emptyStats, voidCount: 3 }
    const recs = generateRecommendations([], [], emptyNetwork, stats)
    expect(recs.some(r => r.includes('void'))).toBe(true)
  })

  it('includes span quality recommendation when overallSpanQuality < 40', () => {
    const stats = { ...emptyStats, overallSpanQuality: 20 }
    const network = { ...emptyNetwork, overallSpanQuality: 20 }
    const recs = generateRecommendations([], [], network, stats)
    expect(recs.some(r => r.includes('span quality'))).toBe(true)
  })

  it('praises master architect when all metrics are high', () => {
    const highStats: PhantomBridgeStats = {
      ...emptyStats,
      avgConnectionStability: 80, avgGhostHandling: 80, avgFogNavigation: 80,
      avgSpiritTransparency: 80, avgPhantomResilience: 80,
      overallSpanQuality: 80, engineerGrade: 'master-architect',
    }
    const highNetwork: NetworkSummary = {
      avgStability: 80, avgTransparency: 80, avgResilience: 80,
      isConnected: true, overallSpanQuality: 80,
    }
    const recs = generateRecommendations([], [], highNetwork, highStats)
    expect(recs.some(r => r.includes('master architect'))).toBe(true)
  })

  it('mentions specific void files when <= 3', () => {
    const span: PhantomSpan = analyzePhantomSpan(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, voidCount: 1 }
    const recs = generateRecommendations([span], [], emptyNetwork, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })
})

// ─── format helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => expect(typeof colorScore(50)).toBe('string'))
  it('handles 0', () => expect(typeof colorScore(0)).toBe('string'))
  it('handles 100', () => expect(typeof colorScore(100)).toBe('string'))
})

describe('colorGrade', () => {
  it('returns a string for ethereal-crossing', () => expect(typeof colorGrade('ethereal-crossing')).toBe('string'))
  it('returns a string for void', () => expect(typeof colorGrade('void')).toBe('string'))
  it('returns a string for unknown', () => expect(typeof colorGrade('unknown-grade')).toBe('string'))
})

describe('formatSpanTable', () => {
  it('formats a single span', () => {
    const span = analyzePhantomSpan(richContent, 'rich.ts')
    const result = formatSpanTable(span)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Connection Stability')
    expect(result).toContain('Ghost Handling')
    expect(result).toContain('Fog Navigation')
    expect(result).toContain('Spirit Transparency')
    expect(result).toContain('Phantom Resilience')
  })
})

describe('formatSpansTable', () => {
  it('handles empty array', () => expect(formatSpansTable([])).toContain('No phantom spans'))
  it('formats multiple spans', () => {
    const spans = [
      analyzePhantomSpan(richContent, 'a.ts'),
      analyzePhantomSpan(moderateContent, 'b.ts'),
    ]
    const result = formatSpansTable(spans)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatCrossingTable', () => {
  it('formats a crossing', () => {
    const span = analyzePhantomSpan(richContent, 'rich.ts')
    const crossing = analyzeBridgeCrossing([span], 'src')
    const result = formatCrossingTable(crossing)
    expect(result).toContain('src')
    expect(result).toContain('Crossing')
  })
})

describe('formatCrossingsTable', () => {
  it('handles empty array', () => expect(formatCrossingsTable([])).toContain('No bridge crossings'))
  it('formats crossings', () => {
    const span = analyzePhantomSpan(richContent, 'src/a.ts')
    const crossing = analyzeBridgeCrossing([span], 'src')
    const result = formatCrossingsTable([crossing])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildPhantomBridgeResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Phantom Bridge Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Span Quality')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => expect(formatRecommendations([])).toContain('No recommendations'))
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Strengthen connections', 'Handle ghosts'])
    expect(result).toContain('Strengthen connections')
    expect(result).toContain('Handle ghosts')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildPhantomBridgeResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Phantom Bridge Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Connected')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildPhantomBridgeResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.spans).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.network).toBeDefined()
  })
})
