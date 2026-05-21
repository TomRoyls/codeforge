import { describe, expect, it } from 'vitest'

import {
  measureIce,
  measureFlow,
  measureCrevasse,
  measureMoraine,
  measureAccumulation,
  measureAblation,
  classifyReadingCondition,
  analyzeGlacierReading,
  classifyFieldType,
  classifyFieldCondition,
  classifyGlaciologistGrade,
  analyzeIceField,
  generateRecommendations,
  buildGlacierFieldResult,
} from '../src/commands/glacier-field-helpers.js'

import { scoreColor, conditionColor, iceTypeColor, flowStateColor, crevasseTypeColor, glaciologistGradeColor, fieldCondColor, formatReading, formatField, formatStats, formatGlacierFieldTable, formatGlacierFieldJson } from '../src/commands/glacier-field-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const MINIMAL_CONTENT = 'export function add(a: number, b: number): number { return a + b; }'

const RICH_CONTENT = `import { EventEmitter } from 'events';
import type { User } from './types.js';

// ─── User Service ──────────────────────────────────────────────────────────

interface UserServiceConfig {
  maxRetries: number;
  timeout: number;
}

/**
 * UserService handles all user-related operations
 * @deprecated Use AdminUserService instead
 */
export class UserService extends EventEmitter {
  private users: Map<string, User> = new Map();
  private config: UserServiceConfig;

  constructor(config: UserServiceConfig) {
    super();
    this.config = config;
  }

  async getUser(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
      const user = this.users.get(id);
      return user ?? null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    try {
      const id = Math.random().toString(36).substring(2);
      const user: User = { ...data, id };
      this.users.set(id, user);
      this.emit('user:created', user);
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }
}

// TODO: Add caching layer
// FIXME: Race condition in concurrent access
// HACK: Using any here temporarily
export async function processUsers(users: any[]): Promise<void> {
  for (const user of users) {
    if (user.active) {
      // @ts-ignore
      await processUser(user);
    }
  }
}

export type { UserServiceConfig };
export default UserService;`

// ─── measureIce ────────────────────────────────────────────────────────────

describe('measureIce', () => {
  it('returns dirty-ice for empty content', () => {
    const result = measureIce(EMPTY_CONTENT)
    expect(result.density).toBe(10)
    expect(result.type).toBe('dirty-ice')
    expect(result.isPure).toBe(false)
    expect(result.hasNoBubbles).toBe(true)
    expect(result.hasNoDebris).toBe(true)
    expect(result.hasCrystalStructure).toBe(false)
    expect(result.hasProperStratification).toBe(false)
    expect(result.hasPressureMelting).toBe(false)
    expect(result.hasInternalDeformation).toBe(false)
    expect(result.hasNoCracking).toBe(true)
    expect(result.isCompact).toBe(false)
    expect(result.bubbleCount).toBe(0)
    expect(result.debrisCount).toBe(0)
  })

  it('returns dirty-ice for minimal content', () => {
    const result = measureIce(MINIMAL_CONTENT)
    expect(result.density).toBe(19)
    expect(result.type).toBe('dirty-ice')
    expect(result.isPure).toBe(false)
    expect(result.hasNoBubbles).toBe(true)
    expect(result.hasNoDebris).toBe(true)
    expect(result.hasCrystalStructure).toBe(true)
    expect(result.hasProperStratification).toBe(false)
    expect(result.hasNoCracking).toBe(true)
    expect(result.isCompact).toBe(true)
  })

  it('returns slush for rich content with smells', () => {
    const result = measureIce(RICH_CONTENT)
    expect(result.density).toBe(33)
    expect(result.type).toBe('slush')
    expect(result.isPure).toBe(false)
    expect(result.hasNoDebris).toBe(false)
    expect(result.hasCrystalStructure).toBe(true)
    expect(result.hasProperStratification).toBe(true)
    expect(result.hasPressureMelting).toBe(true)
    expect(result.hasInternalDeformation).toBe(true)
    expect(result.hasNoCracking).toBe(false)
    expect(result.debrisCount).toBe(4)
  })
})

// ─── measureFlow ───────────────────────────────────────────────────────────

describe('measureFlow', () => {
  it('returns calving for empty content', () => {
    const result = measureFlow(EMPTY_CONTENT)
    expect(result.rate).toBe(10)
    expect(result.state).toBe('calving')
    expect(result.isHealthy).toBe(false)
    expect(result.hasBasalSlip).toBe(false)
    expect(result.hasInternalFlow).toBe(false)
    expect(result.hasCreepFlow).toBe(false)
    expect(result.hasSurgeBehavior).toBe(false)
    expect(result.hasCalving).toBe(false)
    expect(result.hasSteadyAdvance).toBe(false)
    expect(result.hasRetreat).toBe(false)
    expect(result.hasOgives).toBe(false)
    expect(result.hasIceStreams).toBe(false)
    expect(result.surgeCount).toBe(0)
    expect(result.retreatCount).toBe(0)
  })

  it('returns stagnant for minimal content', () => {
    const result = measureFlow(MINIMAL_CONTENT)
    expect(result.rate).toBe(17)
    expect(result.state).toBe('stagnant')
    expect(result.isHealthy).toBe(false)
  })

  it('returns advancing for rich content', () => {
    const result = measureFlow(RICH_CONTENT)
    expect(result.rate).toBe(66)
    expect(result.state).toBe('advancing')
    expect(result.isHealthy).toBe(true)
    expect(result.hasBasalSlip).toBe(true)
    expect(result.hasInternalFlow).toBe(true)
    expect(result.hasCreepFlow).toBe(true)
    expect(result.hasSurgeBehavior).toBe(false)
    expect(result.hasCalving).toBe(true)
    expect(result.hasSteadyAdvance).toBe(true)
    expect(result.hasRetreat).toBe(false)
    expect(result.hasOgives).toBe(true)
    expect(result.hasIceStreams).toBe(true)
  })
})

// ─── measureCrevasse ───────────────────────────────────────────────────────

describe('measureCrevasse', () => {
  it('returns none for empty content', () => {
    const result = measureCrevasse(EMPTY_CONTENT)
    expect(result.depth).toBe(10)
    expect(result.type).toBe('none')
    expect(result.hasNoCrevasses).toBe(true)
    expect(result.hasSurfaceCracks).toBe(false)
    expect(result.hasDeepCrevasses).toBe(false)
    expect(result.hasHiddenCrevasses).toBe(false)
    expect(result.hasBergschrund).toBe(false)
    expect(result.hasSnowBridge).toBe(false)
    expect(result.crevasseCount).toBe(0)
    expect(result.snowBridgeCount).toBe(0)
  })

  it('returns crevasse for minimal content (untested code)', () => {
    const result = measureCrevasse(MINIMAL_CONTENT)
    expect(result.depth).toBe(40)
    expect(result.type).toBe('crevasse')
    expect(result.hasNoCrevasses).toBe(false)
    expect(result.hasHiddenCrevasses).toBe(true)
    expect(result.hasSurfaceCracks).toBe(false)
  })

  it('returns crevasse for rich content', () => {
    const result = measureCrevasse(RICH_CONTENT)
    expect(result.depth).toBe(41)
    expect(result.type).toBe('crevasse')
    expect(result.hasSurfaceCracks).toBe(true)
    expect(result.hasHiddenCrevasses).toBe(true)
    expect(result.hasSnowBridge).toBe(true)
    expect(result.hasRescue).toBe(true)
    expect(result.hasTransverseCrevasses).toBe(true)
    expect(result.crevasseCount).toBe(7)
    expect(result.snowBridgeCount).toBe(4)
  })
})

// ─── measureMoraine ────────────────────────────────────────────────────────

describe('measureMoraine', () => {
  it('returns push for empty content', () => {
    const result = measureMoraine(EMPTY_CONTENT)
    expect(result.quality).toBe(10)
    expect(result.type).toBe('push')
    expect(result.isWellSorted).toBe(false)
    expect(result.hasHistoricalValue).toBe(false)
    expect(result.hasErratic).toBe(false)
    expect(result.hasDrumlin).toBe(false)
    expect(result.hasEsker).toBe(false)
    expect(result.hasKettle).toBe(false)
    expect(result.hasOutwash).toBe(false)
    expect(result.hasTill).toBe(false)
    expect(result.hasSortedDeposit).toBe(false)
    expect(result.erraticCount).toBe(0)
    expect(result.kettleCount).toBe(0)
  })

  it('returns push for minimal content', () => {
    const result = measureMoraine(MINIMAL_CONTENT)
    expect(result.quality).toBe(13)
    expect(result.type).toBe('push')
    expect(result.hasTill).toBe(true)
  })

  it('returns terminal for rich content with deprecated', () => {
    const result = measureMoraine(RICH_CONTENT)
    expect(result.quality).toBe(52)
    expect(result.type).toBe('terminal')
    expect(result.isWellSorted).toBe(true)
    expect(result.hasHistoricalValue).toBe(true)
    expect(result.hasErratic).toBe(true)
    expect(result.hasDrumlin).toBe(true)
    expect(result.hasOutwash).toBe(true)
    expect(result.hasSortedDeposit).toBe(true)
    expect(result.erraticCount).toBe(1)
  })
})

// ─── measureAccumulation ───────────────────────────────────────────────────

describe('measureAccumulation', () => {
  it('returns sublimation for empty content', () => {
    const result = measureAccumulation(EMPTY_CONTENT)
    expect(result.zone).toBe(10)
    expect(result.rate).toBe('sublimation')
    expect(result.isHealthy).toBe(false)
    expect(result.hasFreshSnow).toBe(false)
    expect(result.hasFirnLine).toBe(false)
    expect(result.hasSnowPit).toBe(false)
    expect(result.hasIceCore).toBe(false)
    expect(result.hasDensityIncrease).toBe(false)
    expect(result.hasLayerPreservation).toBe(false)
    expect(result.hasWindSlab).toBe(false)
    expect(result.hasAvalancheRisk).toBe(false)
    expect(result.hasSnowBridge).toBe(false)
    expect(result.avalancheRiskCount).toBe(0)
  })

  it('returns rain for minimal content', () => {
    const result = measureAccumulation(MINIMAL_CONTENT)
    expect(result.zone).toBe(20)
    expect(result.rate).toBe('rain')
    expect(result.isHealthy).toBe(false)
    expect(result.hasFreshSnow).toBe(true)
    expect(result.hasFirnLine).toBe(true)
    expect(result.hasDensityIncrease).toBe(true)
  })

  it('returns light-snow for rich content', () => {
    const result = measureAccumulation(RICH_CONTENT)
    expect(result.zone).toBe(49)
    expect(result.rate).toBe('light-snow')
    expect(result.isHealthy).toBe(true)
    expect(result.hasFreshSnow).toBe(true)
    expect(result.hasFirnLine).toBe(true)
    expect(result.hasIceCore).toBe(true)
    expect(result.hasDensityIncrease).toBe(true)
    expect(result.hasLayerPreservation).toBe(true)
    expect(result.hasWindSlab).toBe(true)
    expect(result.hasAvalancheRisk).toBe(true)
    expect(result.hasSnowBridge).toBe(true)
    expect(result.avalancheRiskCount).toBe(5)
  })
})

// ─── measureAblation ───────────────────────────────────────────────────────

describe('measureAblation', () => {
  it('returns none for empty content', () => {
    const result = measureAblation(EMPTY_CONTENT)
    expect(result.zone).toBe(10)
    expect(result.method).toBe('none')
    expect(result.isBalanced).toBe(false)
    expect(result.hasCleanMelting).toBe(false)
    expect(result.hasCalving).toBe(false)
    expect(result.hasSublimation).toBe(false)
    expect(result.hasIceMargin).toBe(false)
    expect(result.hasMeltwater).toBe(false)
    expect(result.hasProglacial).toBe(false)
    expect(result.hasDeadIce).toBe(false)
    expect(result.hasOutwash).toBe(false)
    expect(result.hasMassBalance).toBe(false)
    expect(result.deadIceCount).toBe(0)
  })

  it('returns none for minimal content', () => {
    const result = measureAblation(MINIMAL_CONTENT)
    expect(result.zone).toBe(6)
    expect(result.method).toBe('none')
    expect(result.isBalanced).toBe(true)
    expect(result.hasIceMargin).toBe(true)
  })

  it('returns melting for rich content', () => {
    const result = measureAblation(RICH_CONTENT)
    expect(result.zone).toBe(56)
    expect(result.method).toBe('melting')
    expect(result.isBalanced).toBe(true)
    expect(result.hasCleanMelting).toBe(false)
    expect(result.hasCalving).toBe(true)
    expect(result.hasIceMargin).toBe(true)
    expect(result.hasMeltwater).toBe(true)
    expect(result.hasProglacial).toBe(true)
    expect(result.hasDeadIce).toBe(true)
    expect(result.hasOutwash).toBe(true)
    expect(result.hasMassBalance).toBe(false)
    expect(result.deadIceCount).toBe(4)
  })
})

// ─── classifyReadingCondition ──────────────────────────────────────────────

describe('classifyReadingCondition', () => {
  it('returns crystal-glacier for score >= 80', () => {
    expect(classifyReadingCondition(90)).toBe('crystal-glacier')
    expect(classifyReadingCondition(80)).toBe('crystal-glacier')
  })

  it('returns healthy-glacier for score >= 65', () => {
    expect(classifyReadingCondition(75)).toBe('healthy-glacier')
    expect(classifyReadingCondition(65)).toBe('healthy-glacier')
  })

  it('returns stable-icefield for score >= 50', () => {
    expect(classifyReadingCondition(55)).toBe('stable-icefield')
    expect(classifyReadingCondition(50)).toBe('stable-icefield')
  })

  it('returns retreating-glacier for score >= 35', () => {
    expect(classifyReadingCondition(40)).toBe('retreating-glacier')
    expect(classifyReadingCondition(35)).toBe('retreating-glacier')
  })

  it('returns dirty-ice for score >= 20', () => {
    expect(classifyReadingCondition(25)).toBe('dirty-ice')
    expect(classifyReadingCondition(20)).toBe('dirty-ice')
  })

  it('returns rock-glacier for score < 20', () => {
    expect(classifyReadingCondition(10)).toBe('rock-glacier')
    expect(classifyReadingCondition(0)).toBe('rock-glacier')
  })
})

// ─── analyzeGlacierReading ─────────────────────────────────────────────────

describe('analyzeGlacierReading', () => {
  it('analyzes empty content', () => {
    const result = analyzeGlacierReading(EMPTY_CONTENT, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.iceDensity).toBe(10)
    expect(result.flowRate).toBe(10)
    expect(result.crevasseDepth).toBe(10)
    expect(result.moraineQuality).toBe(10)
    expect(result.accumulationZone).toBe(10)
    expect(result.ablationZone).toBe(10)
    expect(result.qualityScore).toBe(23)
    expect(result.condition).toBe('dirty-ice')
  })

  it('analyzes minimal content', () => {
    const result = analyzeGlacierReading(MINIMAL_CONTENT, 'minimal.ts')
    expect(result.iceDensity).toBe(19)
    expect(result.flowRate).toBe(17)
    expect(result.crevasseDepth).toBe(40)
    expect(result.moraineQuality).toBe(13)
    expect(result.accumulationZone).toBe(20)
    expect(result.ablationZone).toBe(6)
    expect(result.qualityScore).toBe(23)
    expect(result.condition).toBe('dirty-ice')
  })

  it('analyzes rich content', () => {
    const result = analyzeGlacierReading(RICH_CONTENT, 'src/service.ts')
    expect(result.iceDensity).toBe(33)
    expect(result.flowRate).toBe(66)
    expect(result.crevasseDepth).toBe(41)
    expect(result.moraineQuality).toBe(52)
    expect(result.accumulationZone).toBe(49)
    expect(result.ablationZone).toBe(56)
    expect(result.qualityScore).toBe(53)
    expect(result.condition).toBe('stable-icefield')
  })

  it('includes all sub-measures', () => {
    const result = analyzeGlacierReading(RICH_CONTENT, 'test.ts')
    expect(result.ice).toBeDefined()
    expect(result.flow).toBeDefined()
    expect(result.crevasse).toBeDefined()
    expect(result.moraine).toBeDefined()
    expect(result.accumulation).toBeDefined()
    expect(result.ablation).toBeDefined()
  })
})

// ─── classifyFieldType ─────────────────────────────────────────────────────

describe('classifyFieldType', () => {
  it('returns snow-patch for empty readings', () => {
    expect(classifyFieldType([])).toBe('snow-patch')
  })

  it('returns cirque for low scoring readings', () => {
    const reading = analyzeGlacierReading(EMPTY_CONTENT, 'a.ts')
    expect(classifyFieldType([reading])).toBe('cirque')
  })

  it('returns valley-glacier for moderate scoring readings', () => {
    const reading = analyzeGlacierReading(RICH_CONTENT, 'a.ts')
    expect(classifyFieldType([reading])).toBe('valley-glacier')
  })

  it('returns piedmont for mixed readings', () => {
    const empty = analyzeGlacierReading(EMPTY_CONTENT, 'a.ts')
    const rich = analyzeGlacierReading(RICH_CONTENT, 'b.ts')
    expect(classifyFieldType([empty, rich])).toBe('piedmont')
  })
})

// ─── classifyFieldCondition ────────────────────────────────────────────────

describe('classifyFieldCondition', () => {
  it('classifies all conditions correctly', () => {
    expect(classifyFieldCondition(85)).toBe('polar-ice-sheet')
    expect(classifyFieldCondition(80)).toBe('polar-ice-sheet')
    expect(classifyFieldCondition(70)).toBe('alpine-glacier')
    expect(classifyFieldCondition(65)).toBe('alpine-glacier')
    expect(classifyFieldCondition(55)).toBe('valley-glacier')
    expect(classifyFieldCondition(50)).toBe('valley-glacier')
    expect(classifyFieldCondition(40)).toBe('rock-glacier')
    expect(classifyFieldCondition(35)).toBe('rock-glacier')
    expect(classifyFieldCondition(25)).toBe('permafrost')
    expect(classifyFieldCondition(20)).toBe('permafrost')
    expect(classifyFieldCondition(10)).toBe('mud-slide')
  })
})

// ─── classifyGlaciologistGrade ─────────────────────────────────────────────

describe('classifyGlaciologistGrade', () => {
  it('classifies all grades correctly', () => {
    expect(classifyGlaciologistGrade(85)).toBe('chief-glaciologist')
    expect(classifyGlaciologistGrade(80)).toBe('chief-glaciologist')
    expect(classifyGlaciologistGrade(70)).toBe('senior-glaciologist')
    expect(classifyGlaciologistGrade(65)).toBe('senior-glaciologist')
    expect(classifyGlaciologistGrade(55)).toBe('glaciologist')
    expect(classifyGlaciologistGrade(50)).toBe('glaciologist')
    expect(classifyGlaciologistGrade(40)).toBe('geologist')
    expect(classifyGlaciologistGrade(35)).toBe('geologist')
    expect(classifyGlaciologistGrade(25)).toBe('hiker')
    expect(classifyGlaciologistGrade(20)).toBe('hiker')
    expect(classifyGlaciologistGrade(10)).toBe('snowman')
  })
})

// ─── analyzeIceField ───────────────────────────────────────────────────────

describe('analyzeIceField', () => {
  it('returns correct field for empty directory', () => {
    const reading = analyzeGlacierReading(EMPTY_CONTENT, 'a.ts')
    const field = analyzeIceField([reading], '.')
    expect(field.directory).toBe('.')
    expect(field.readings).toHaveLength(1)
    expect(field.avgIceDensity).toBe(10)
    expect(field.avgFlowRate).toBe(10)
    expect(field.avgMoraineQuality).toBe(10)
    expect(field.crystalGlacierCount).toBe(0)
    expect(field.rockGlacierCount).toBe(0)
    expect(field.healthyCount).toBe(0)
    expect(field.balancedCount).toBe(0)
    expect(field.fieldType).toBe('cirque')
    expect(field.condition).toBe('permafrost')
  })

  it('returns correct field for rich content', () => {
    const reading = analyzeGlacierReading(RICH_CONTENT, 'src/a.ts')
    const field = analyzeIceField([reading], 'src')
    expect(field.directory).toBe('src')
    expect(field.avgIceDensity).toBe(33)
    expect(field.avgFlowRate).toBe(66)
    expect(field.avgMoraineQuality).toBe(52)
    expect(field.healthyCount).toBe(1)
    expect(field.balancedCount).toBe(1)
    expect(field.fieldType).toBe('valley-glacier')
    expect(field.condition).toBe('valley-glacier')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns pristine for empty content with no issues', () => {
    const reading = analyzeGlacierReading(EMPTY_CONTENT, 'empty.ts')
    const recommendations = generateRecommendations([reading], [], { avgIceDensity: 10, avgFlowRate: 10, avgMoraineQuality: 10, isAdvancing: false, overallGlacierHealth: 23 }, {
      totalFiles: 1, totalFields: 1, avgIceDensity: 10, avgFlowRate: 10, avgCrevasseDepth: 10, avgMoraineQuality: 10, avgAccumulationZone: 10, avgAblationZone: 10,
      crystalGlacierCount: 0, healthyGlacierCount: 0, stableIcefieldCount: 0, retreatingGlacierCount: 0, dirtyIceCount: 1, rockGlacierCount: 0,
      isPureCount: 0, hasNoDebrisCount: 1, isHealthyCount: 0, hasSurgeBehaviorCount: 0, hasRetreatCount: 0, hasNoCrevassesCount: 1,
      hasHiddenCrevassesCount: 0, hasSnowBridgeCount: 0, isWellSortedCount: 0, hasDeadIceCount: 0, isBalancedCount: 0, hasMassBalanceCount: 0,
      overallGlacierHealth: 23, glaciologistGrade: 'hiker',
      bestReading: 'empty.ts', densestIce: 'empty.ts', healthiestFlow: 'empty.ts',
      shallowestCrevasses: 'empty.ts', bestMoraine: 'empty.ts',
    })
    expect(recommendations).toContain('Clean dirty ice — remove TODOs, console calls, and deprecated markers')
  })

  it('returns dirty ice recommendation when smells present', () => {
    const reading = analyzeGlacierReading(RICH_CONTENT, 'dirty.ts')
    const recommendations = generateRecommendations([reading], [], { avgIceDensity: 30, avgFlowRate: 50, avgMoraineQuality: 40, isAdvancing: true, overallGlacierHealth: 40 }, {
      totalFiles: 1, totalFields: 1, avgIceDensity: 30, avgFlowRate: 50, avgCrevasseDepth: 30, avgMoraineQuality: 40, avgAccumulationZone: 40, avgAblationZone: 40,
      crystalGlacierCount: 0, healthyGlacierCount: 0, stableIcefieldCount: 1, retreatingGlacierCount: 0, dirtyIceCount: 0, rockGlacierCount: 0,
      isPureCount: 0, hasNoDebrisCount: 0, isHealthyCount: 1, hasSurgeBehaviorCount: 0, hasRetreatCount: 0, hasNoCrevassesCount: 0,
      hasHiddenCrevassesCount: 1, hasSnowBridgeCount: 1, isWellSortedCount: 1, hasDeadIceCount: 1, isBalancedCount: 1, hasMassBalanceCount: 0,
      overallGlacierHealth: 40, glaciologistGrade: 'geologist',
      bestReading: 'dirty.ts', densestIce: 'dirty.ts', healthiestFlow: 'dirty.ts',
      shallowestCrevasses: 'dirty.ts', bestMoraine: 'dirty.ts',
    })
    expect(recommendations).toContain('Clean dirty ice — remove TODOs, console calls, and deprecated markers')
  })
})

// ─── buildGlacierFieldResult ───────────────────────────────────────────────

describe('buildGlacierFieldResult', () => {
  it('handles empty file list', () => {
    const result = buildGlacierFieldResult([], [])
    expect(result.readings).toHaveLength(0)
    expect(result.fields).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalFields).toBe(0)
    expect(result.stats.avgIceDensity).toBe(0)
    expect(result.stats.avgFlowRate).toBe(0)
    expect(result.stats.avgCrevasseDepth).toBe(0)
    expect(result.stats.avgMoraineQuality).toBe(0)
    expect(result.stats.overallGlacierHealth).toBe(0)
    expect(result.survey.isAdvancing).toBe(false)
  })

  it('handles single empty file', () => {
    const result = buildGlacierFieldResult(['empty.ts'], [EMPTY_CONTENT])
    expect(result.readings).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalFields).toBe(1)
    expect(result.stats.avgIceDensity).toBe(10)
    expect(result.stats.avgFlowRate).toBe(10)
    expect(result.stats.avgCrevasseDepth).toBe(10)
    expect(result.stats.avgMoraineQuality).toBe(10)
    expect(result.stats.overallGlacierHealth).toBe(23)
    expect(result.stats.glaciologistGrade).toBe('hiker')
    expect(result.stats.dirtyIceCount).toBe(1)
    expect(result.stats.hasNoDebrisCount).toBe(1)
    expect(result.stats.hasNoCrevassesCount).toBe(1)
    expect(result.stats.bestReading).toBe('empty.ts')
    expect(result.stats.densestIce).toBe('empty.ts')
    expect(result.survey.isAdvancing).toBe(false)
  })

  it('handles mixed files with directory grouping', () => {
    const result = buildGlacierFieldResult(
      ['empty.ts', 'minimal.ts', 'src/service.ts'],
      [EMPTY_CONTENT, MINIMAL_CONTENT, RICH_CONTENT],
    )
    expect(result.readings).toHaveLength(3)
    expect(result.fields).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalFields).toBe(2)
    expect(result.stats.avgIceDensity).toBe(21)
    expect(result.stats.avgFlowRate).toBe(31)
    expect(result.stats.avgCrevasseDepth).toBe(30)
    expect(result.stats.avgMoraineQuality).toBe(25)
    expect(result.stats.accumulationZone === undefined ? 0 : result.stats.avgAccumulationZone).toBeDefined()
    expect(result.stats.avgAccumulationZone).toBe(26)
    expect(result.stats.avgAblationZone).toBe(24)
    expect(result.stats.overallGlacierHealth).toBe(33)
    expect(result.stats.glaciologistGrade).toBe('hiker')
    expect(result.stats.stableIcefieldCount).toBe(1)
    expect(result.stats.dirtyIceCount).toBe(2)
    expect(result.stats.isPureCount).toBe(0)
    expect(result.stats.hasNoDebrisCount).toBe(2)
    expect(result.stats.isHealthyCount).toBe(1)
    expect(result.stats.hasNoCrevassesCount).toBe(1)
    expect(result.stats.hasHiddenCrevassesCount).toBe(2)
    expect(result.stats.hasSnowBridgeCount).toBe(1)
    expect(result.stats.isWellSortedCount).toBe(1)
    expect(result.stats.hasDeadIceCount).toBe(1)
    expect(result.stats.isBalancedCount).toBe(2)
    expect(result.stats.hasMassBalanceCount).toBe(0)
    expect(result.stats.bestReading).toBe('src/service.ts')
    expect(result.stats.densestIce).toBe('src/service.ts')
    expect(result.stats.healthiestFlow).toBe('src/service.ts')
    expect(result.stats.shallowestCrevasses).toBe('empty.ts')
    expect(result.stats.bestMoraine).toBe('src/service.ts')
  })

  it('groups files by directory', () => {
    const result = buildGlacierFieldResult(
      ['empty.ts', 'src/service.ts'],
      [EMPTY_CONTENT, RICH_CONTENT],
    )
    expect(result.fields).toHaveLength(2)
    const dirs = result.fields.map((f) => f.directory)
    expect(dirs).toContain('.')
    expect(dirs).toContain('src')
  })

  it('includes survey data', () => {
    const result = buildGlacierFieldResult(
      ['empty.ts', 'minimal.ts', 'src/service.ts'],
      [EMPTY_CONTENT, MINIMAL_CONTENT, RICH_CONTENT],
    )
    expect(result.survey.avgIceDensity).toBe(21)
    expect(result.survey.avgFlowRate).toBe(31)
    expect(result.survey.avgMoraineQuality).toBe(25)
    expect(result.survey.isAdvancing).toBe(false)
    expect(result.survey.overallGlacierHealth).toBe(33)
  })

  it('includes recommendations for dirty code', () => {
    const result = buildGlacierFieldResult(
      ['src/service.ts'],
      [RICH_CONTENT],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('Clean dirty ice — remove TODOs, console calls, and deprecated markers')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    expect(typeof conditionColor('crystal-glacier')).toBe('string')
    expect(typeof conditionColor('healthy-glacier')).toBe('string')
    expect(typeof conditionColor('stable-icefield')).toBe('string')
    expect(typeof conditionColor('retreating-glacier')).toBe('string')
    expect(typeof conditionColor('dirty-ice')).toBe('string')
    expect(typeof conditionColor('rock-glacier')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('iceTypeColor returns string for all types', () => {
    expect(typeof iceTypeColor('blue-ice')).toBe('string')
    expect(typeof iceTypeColor('clear-ice')).toBe('string')
    expect(typeof iceTypeColor('white-ice')).toBe('string')
    expect(typeof iceTypeColor('firn')).toBe('string')
    expect(typeof iceTypeColor('slush')).toBe('string')
    expect(typeof iceTypeColor('dirty-ice')).toBe('string')
    expect(typeof iceTypeColor('unknown')).toBe('string')
  })

  it('flowStateColor returns string for all states', () => {
    expect(typeof flowStateColor('advancing')).toBe('string')
    expect(typeof flowStateColor('stable')).toBe('string')
    expect(typeof flowStateColor('retreating')).toBe('string')
    expect(typeof flowStateColor('surging')).toBe('string')
    expect(typeof flowStateColor('stagnant')).toBe('string')
    expect(typeof flowStateColor('calving')).toBe('string')
    expect(typeof flowStateColor('unknown')).toBe('string')
  })

  it('crevasseTypeColor returns string for all types', () => {
    expect(typeof crevasseTypeColor('none')).toBe('string')
    expect(typeof crevasseTypeColor('snow-bridge')).toBe('string')
    expect(typeof crevasseTypeColor('crevasse')).toBe('string')
    expect(typeof crevasseTypeColor('moulin')).toBe('string')
    expect(typeof crevasseTypeColor('serac')).toBe('string')
    expect(typeof crevasseTypeColor('ice-fall')).toBe('string')
    expect(typeof crevasseTypeColor('unknown')).toBe('string')
  })

  it('glaciologistGradeColor returns string for all grades', () => {
    expect(typeof glaciologistGradeColor('chief-glaciologist')).toBe('string')
    expect(typeof glaciologistGradeColor('senior-glaciologist')).toBe('string')
    expect(typeof glaciologistGradeColor('glaciologist')).toBe('string')
    expect(typeof glaciologistGradeColor('geologist')).toBe('string')
    expect(typeof glaciologistGradeColor('hiker')).toBe('string')
    expect(typeof glaciologistGradeColor('snowman')).toBe('string')
    expect(typeof glaciologistGradeColor('unknown')).toBe('string')
  })

  it('fieldCondColor returns string for all conditions', () => {
    expect(typeof fieldCondColor('polar-ice-sheet')).toBe('string')
    expect(typeof fieldCondColor('alpine-glacier')).toBe('string')
    expect(typeof fieldCondColor('valley-glacier')).toBe('string')
    expect(typeof fieldCondColor('rock-glacier')).toBe('string')
    expect(typeof fieldCondColor('permafrost')).toBe('string')
    expect(typeof fieldCondColor('mud-slide')).toBe('string')
    expect(typeof fieldCondColor('unknown')).toBe('string')
  })

  it('formatReading returns formatted string', () => {
    const reading = analyzeGlacierReading(MINIMAL_CONTENT, 'test.ts')
    const result = formatReading(reading, false)
    expect(typeof result).toBe('string')
    expect(result).toContain('test.ts')
  })

  it('formatReading verbose shows extra info', () => {
    const reading = analyzeGlacierReading(RICH_CONTENT, 'rich.ts')
    const result = formatReading(reading, true)
    expect(typeof result).toBe('string')
    expect(result).toContain('rich.ts')
  })

  it('formatField returns formatted string', () => {
    const reading = analyzeGlacierReading(MINIMAL_CONTENT, 'test.ts')
    const field = analyzeIceField([reading], '.')
    const result = formatField(field, false)
    expect(typeof result).toBe('string')
    expect(result).toContain('.')
  })

  it('formatStats returns formatted string', () => {
    const result = buildGlacierFieldResult(['test.ts'], [MINIMAL_CONTENT])
    const formatted = formatStats(result.stats)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('Glacier Field Statistics')
  })

  it('formatGlacierFieldTable returns table string', () => {
    const result = buildGlacierFieldResult(['test.ts'], [MINIMAL_CONTENT])
    const formatted = formatGlacierFieldTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('Glacier Field Analysis')
  })

  it('formatGlacierFieldJson returns valid JSON', () => {
    const result = buildGlacierFieldResult(['test.ts'], [MINIMAL_CONTENT])
    const formatted = formatGlacierFieldJson(result)
    expect(typeof formatted).toBe('string')
    const parsed = JSON.parse(formatted)
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Quality Score Calculation ─────────────────────────────────────────────

describe('quality score calculation', () => {
  it('inverts crevasse depth for scoring', () => {
    const result = analyzeGlacierReading(MINIMAL_CONTENT, 'test.ts')
    const crevasseScore = 100 - result.crevasseDepth
    const expected = Math.round(
      (result.iceDensity + result.flowRate + crevasseScore + result.moraineQuality + result.accumulationZone + result.ablationZone) / 6,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('gives higher scores to cleaner code', () => {
    const emptyScore = analyzeGlacierReading(EMPTY_CONTENT, 'empty.ts').qualityScore
    const richScore = analyzeGlacierReading(RICH_CONTENT, 'rich.ts').qualityScore
    expect(richScore).toBeGreaterThan(emptyScore)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const result = analyzeGlacierReading('   \n  \n  ', 'whitespace.ts')
    expect(result).toBeDefined()
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles very large content', () => {
    const largeContent = Array.from({ length: 100 }, () => MINIMAL_CONTENT).join('\n')
    const result = analyzeGlacierReading(largeContent, 'large.ts')
    expect(result).toBeDefined()
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })

  it('handles content with many smells', () => {
    const smellyContent = `// TODO: fix this
// FIXME: broken
// HACK: temporary
// @ts-ignore
// @ts-expect-error
console.log('debug');
const x: any = 1;`
    const result = analyzeGlacierReading(smellyContent, 'smelly.ts')
    expect(result.crevasse.crevasseCount).toBeGreaterThan(0)
    expect(result.ice.hasNoCracking).toBe(false)
  })

  it('handles content with all test keywords', () => {
    const testContent = `describe('suite', () => {
  it('test1', () => { expect(true).toBe(true); });
  test('test2', () => { expect(1).toBe(1); });
});`
    const result = analyzeGlacierReading(testContent, 'test-file.ts')
    expect(result.accumulation.hasSnowPit).toBe(true)
  })

  it('handles content with many async functions', () => {
    const asyncContent = `export async function a(): Promise<void> {}
export async function b(): Promise<void> {}
export async function c(): Promise<void> {}`
    const result = analyzeGlacierReading(asyncContent, 'async.ts')
    expect(result.flow.hasBasalSlip).toBe(true)
  })

  it('computes field averages correctly for multiple readings', () => {
    const r1 = analyzeGlacierReading(EMPTY_CONTENT, 'a.ts')
    const r2 = analyzeGlacierReading(RICH_CONTENT, 'b.ts')
    const field = analyzeIceField([r1, r2], 'src')
    const expectedIce = Math.round((r1.iceDensity + r2.iceDensity) / 2)
    const expectedFlow = Math.round((r1.flowRate + r2.flowRate) / 2)
    expect(field.avgIceDensity).toBe(expectedIce)
    expect(field.avgFlowRate).toBe(expectedFlow)
  })
})
