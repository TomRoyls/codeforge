import { describe, expect, it } from 'vitest'

import {
  analyzeGravitationalBody,
  analyzeStellarRegion,
  buildGravityFieldResult,
  classifyAstrophysicistGrade,
  classifyCondition,
  classifyRegionCondition,
  classifyRegionType,
  generateRecommendations,
  measureDecay,
  measureEscape,
  measureField,
  measureMass,
  measureOrbit,
  measureTidal,
} from '../src/commands/gravity-field-helpers.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const MINIMAL_CONTENT =
  'export function add(a: number, b: number): number { return a + b; }'

const RICH_CONTENT = `import { EventEmitter } from 'events';
import type { User } from './types.js';

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

// ─── measureMass ─────────────────────────────────────────────────────────────

describe('measureMass', () => {
  it('returns asteroid for empty content', () => {
    const result = measureMass(EMPTY_CONTENT)
    expect(result.pull).toBe(5)
    expect(result.classification).toBe('asteroid')
    expect(result.isMassive).toBe(false)
    expect(result.hasStrongPull).toBe(false)
    expect(result.hasWeakPull).toBe(true)
    expect(result.hasEventHorizon).toBe(false)
    expect(result.hasAccretionDisk).toBe(false)
    expect(result.hasGravitationalLens).toBe(false)
    expect(result.hasProperMass).toBe(false)
    expect(result.hasBinaryCompanion).toBe(false)
    expect(result.hasTidalLocking).toBe(false)
    expect(result.companionCount).toBe(0)
  })

  it('returns asteroid for minimal content', () => {
    const result = measureMass(MINIMAL_CONTENT)
    expect(result.pull).toBe(5)
    expect(result.classification).toBe('asteroid')
    expect(result.hasWeakPull).toBe(true)
  })

  it('returns neutron-star for rich content', () => {
    const result = measureMass(RICH_CONTENT)
    expect(result.pull).toBe(70)
    expect(result.classification).toBe('neutron-star')
    expect(result.isMassive).toBe(true)
    expect(result.hasStrongPull).toBe(true)
    expect(result.hasProperMass).toBe(true)
    expect(result.companionCount).toBe(2)
  })
})

// ─── measureOrbit ────────────────────────────────────────────────────────────

describe('measureOrbit', () => {
  it('returns collision-course for empty content', () => {
    const result = measureOrbit(EMPTY_CONTENT)
    expect(result.stability).toBe(5)
    expect(result.type).toBe('collision-course')
    expect(result.isStable).toBe(false)
    expect(result.hasCleanOrbit).toBe(false)
    expect(result.hasResonance).toBe(false)
    expect(result.hasRetrograde).toBe(false)
    expect(result.hasPrecession).toBe(false)
    expect(result.hasPerturbation).toBe(false)
    expect(result.hasEccentricity).toBe(false)
    expect(result.hasProperPeriod).toBe(false)
    expect(result.hasOrbitalMechanics).toBe(false)
    expect(result.perturbationCount).toBe(0)
  })

  it('returns collision-course for minimal content', () => {
    const result = measureOrbit(MINIMAL_CONTENT)
    expect(result.stability).toBe(6)
    expect(result.type).toBe('collision-course')
    expect(result.hasProperPeriod).toBe(true)
  })

  it('returns parabolic for rich content', () => {
    const result = measureOrbit(RICH_CONTENT)
    expect(result.stability).toBe(58)
    expect(result.type).toBe('parabolic')
    expect(result.isStable).toBe(false)
    expect(result.hasCleanOrbit).toBe(true)
    expect(result.hasResonance).toBe(true)
    expect(result.hasPerturbation).toBe(true)
    expect(result.hasProperPeriod).toBe(true)
    expect(result.hasOrbitalMechanics).toBe(true)
    expect(result.perturbationCount).toBe(5)
  })
})

// ─── measureTidal ────────────────────────────────────────────────────────────

describe('measureTidal', () => {
  it('returns none for empty content', () => {
    const result = measureTidal(EMPTY_CONTENT)
    expect(result.force).toBe(5)
    expect(result.type).toBe('none')
    expect(result.isManageable).toBe(true)
    expect(result.hasTidalBulge).toBe(false)
    expect(result.hasTidalLocking).toBe(false)
    expect(result.hasTidalHeating).toBe(false)
    expect(result.hasTidalStripping).toBe(false)
    expect(result.hasRocheLimit).toBe(false)
    expect(result.hasTidalResonance).toBe(false)
    expect(result.hasCushionEffect).toBe(false)
    expect(result.hasNoStress).toBe(true)
    expect(result.stressPointCount).toBe(0)
  })

  it('returns none for minimal content', () => {
    const result = measureTidal(MINIMAL_CONTENT)
    expect(result.force).toBe(4)
    expect(result.type).toBe('none')
    expect(result.hasNoStress).toBe(true)
  })

  it('returns dynamic for rich content', () => {
    const result = measureTidal(RICH_CONTENT)
    expect(result.force).toBe(74)
    expect(result.type).toBe('dynamic')
    expect(result.isManageable).toBe(false)
    expect(result.hasTidalBulge).toBe(true)
    expect(result.hasTidalResonance).toBe(true)
    expect(result.hasNoStress).toBe(false)
    expect(result.stressPointCount).toBe(4)
  })
})

// ─── measureEscape ───────────────────────────────────────────────────────────

describe('measureEscape', () => {
  it('returns trivial for empty content', () => {
    const result = measureEscape(EMPTY_CONTENT)
    expect(result.velocity).toBe(5)
    expect(result.difficulty).toBe('trivial')
    expect(result.isDecouplable).toBe(true)
    expect(result.hasLowCoupling).toBe(true)
    expect(result.hasHighCoupling).toBe(false)
    expect(result.hasCircularReference).toBe(false)
    expect(result.hasDiamondDependency).toBe(false)
    expect(result.hasInterfaceBarrier).toBe(false)
    expect(result.hasDependencyInjection).toBe(false)
    expect(result.hasPlugInArchitecture).toBe(false)
    expect(result.hasCleanSeparation).toBe(false)
    expect(result.circularRefCount).toBe(0)
    expect(result.diamondCount).toBe(0)
  })

  it('returns trivial for minimal content', () => {
    const result = measureEscape(MINIMAL_CONTENT)
    expect(result.velocity).toBe(0)
    expect(result.difficulty).toBe('trivial')
    expect(result.isDecouplable).toBe(true)
    expect(result.hasLowCoupling).toBe(true)
  })

  it('returns moderate for rich content', () => {
    const result = measureEscape(RICH_CONTENT)
    expect(result.velocity).toBe(31)
    expect(result.difficulty).toBe('moderate')
    expect(result.isDecouplable).toBe(true)
    expect(result.hasInterfaceBarrier).toBe(true)
  })
})

// ─── measureField ────────────────────────────────────────────────────────────

describe('measureField', () => {
  it('returns absent for empty content', () => {
    const result = measureField(EMPTY_CONTENT)
    expect(result.strength).toBe(5)
    expect(result.type).toBe('absent')
    expect(result.hasStrongField).toBe(false)
    expect(result.hasWeakField).toBe(true)
    expect(result.hasFieldLines).toBe(false)
    expect(result.hasFluxDensity).toBe(false)
    expect(result.hasMagneticMoment).toBe(false)
    expect(result.hasInducedField).toBe(false)
    expect(result.hasShielding).toBe(false)
    expect(result.hasFieldCollapse).toBe(false)
    expect(result.hasIsotropic).toBe(false)
    expect(result.hasAnisotropic).toBe(false)
    expect(result.shieldingCount).toBe(0)
  })

  it('returns absent for minimal content', () => {
    const result = measureField(MINIMAL_CONTENT)
    expect(result.strength).toBe(3)
    expect(result.type).toBe('absent')
    expect(result.hasFieldLines).toBe(true)
    expect(result.hasIsotropic).toBe(true)
  })

  it('returns uniform for rich content', () => {
    const result = measureField(RICH_CONTENT)
    expect(result.strength).toBe(32)
    expect(result.type).toBe('uniform')
    expect(result.hasFieldLines).toBe(true)
    expect(result.hasFluxDensity).toBe(true)
    expect(result.hasMagneticMoment).toBe(true)
    expect(result.hasShielding).toBe(true)
    expect(result.hasAnisotropic).toBe(true)
    expect(result.shieldingCount).toBe(1)
  })
})

// ─── measureDecay ────────────────────────────────────────────────────────────

describe('measureDecay', () => {
  it('returns rapid-decay for empty content', () => {
    const result = measureDecay(EMPTY_CONTENT)
    expect(result.health).toBe(25)
    expect(result.type).toBe('rapid-decay')
    expect(result.isHealthy).toBe(false)
    expect(result.hasNoDecay).toBe(false)
    expect(result.hasSlowDecay).toBe(false)
    expect(result.hasRadiationPressure).toBe(false)
    expect(result.hasOrbitalLowering).toBe(false)
    expect(result.hasAtmosphericDrag).toBe(false)
    expect(result.hasSolarWind).toBe(false)
    expect(result.hasPoyntingRobertson).toBe(false)
    expect(result.hasYarkovskyEffect).toBe(false)
    expect(result.hasTidalDissipation).toBe(false)
    expect(result.dragCount).toBe(0)
  })

  it('returns rapid-decay for minimal content', () => {
    const result = measureDecay(MINIMAL_CONTENT)
    expect(result.health).toBe(28)
    expect(result.type).toBe('rapid-decay')
    expect(result.hasNoDecay).toBe(true)
  })

  it('returns collapsed for rich content', () => {
    const result = measureDecay(RICH_CONTENT)
    expect(result.health).toBe(5)
    expect(result.type).toBe('collapsed')
    expect(result.isHealthy).toBe(false)
    expect(result.hasRadiationPressure).toBe(true)
    expect(result.hasOrbitalLowering).toBe(true)
    expect(result.hasAtmosphericDrag).toBe(true)
    expect(result.hasSolarWind).toBe(true)
    expect(result.hasPoyntingRobertson).toBe(true)
    expect(result.hasYarkovskyEffect).toBe(true)
    expect(result.hasTidalDissipation).toBe(true)
    expect(result.dragCount).toBe(7)
  })
})

// ─── classifyCondition ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies stable-star for >= 80', () => {
    expect(classifyCondition(90)).toBe('stable-star')
  })
  it('classifies planetary-system for >= 65', () => {
    expect(classifyCondition(75)).toBe('planetary-system')
  })
  it('classifies binary-system for >= 50', () => {
    expect(classifyCondition(55)).toBe('binary-system')
  })
  it('classifies chaotic-orbit for >= 35', () => {
    expect(classifyCondition(40)).toBe('chaotic-orbit')
  })
  it('classifies black-hole for >= 20', () => {
    expect(classifyCondition(25)).toBe('black-hole')
  })
  it('classifies supernova-remnant for < 20', () => {
    expect(classifyCondition(10)).toBe('supernova-remnant')
  })
})

// ─── classifyRegionType ──────────────────────────────────────────────────────

describe('classifyRegionType', () => {
  it('returns void for empty array', () => {
    expect(classifyRegionType([])).toBe('void')
  })
  it('returns spiral-arm for single low-pull body', () => {
    const body = analyzeGravitationalBody(EMPTY_CONTENT, 'empty.ts')
    expect(classifyRegionType([body])).toBe('spiral-arm')
  })
  it('returns galaxy-core for high-pull body', () => {
    const body = analyzeGravitationalBody(RICH_CONTENT, 'src/service.ts')
    expect(classifyRegionType([body])).toBe('galaxy-core')
  })
  it('returns binary-system for two bodies', () => {
    const b1 = analyzeGravitationalBody(EMPTY_CONTENT, 'empty.ts')
    const b2 = analyzeGravitationalBody(RICH_CONTENT, 'src/service.ts')
    expect(classifyRegionType([b1, b2])).toBe('binary-system')
  })
})

// ─── classifyRegionCondition ─────────────────────────────────────────────────

describe('classifyRegionCondition', () => {
  it('classifies stable-system for >= 80', () => {
    expect(classifyRegionCondition(85)).toBe('stable-system')
  })
  it('classifies evolving-system for >= 65', () => {
    expect(classifyRegionCondition(70)).toBe('evolving-system')
  })
  it('classifies dynamic-system for >= 50', () => {
    expect(classifyRegionCondition(55)).toBe('dynamic-system')
  })
  it('classifies unstable-system for >= 35', () => {
    expect(classifyRegionCondition(40)).toBe('unstable-system')
  })
  it('classifies chaotic-system for >= 20', () => {
    expect(classifyRegionCondition(25)).toBe('chaotic-system')
  })
  it('classifies collapsed-system for < 20', () => {
    expect(classifyRegionCondition(10)).toBe('collapsed-system')
  })
})

// ─── classifyAstrophysicistGrade ─────────────────────────────────────────────

describe('classifyAstrophysicistGrade', () => {
  it('classifies chief-astrophysicist for >= 80', () => {
    expect(classifyAstrophysicistGrade(85)).toBe('chief-astrophysicist')
  })
  it('classifies astrophysicist for >= 65', () => {
    expect(classifyAstrophysicistGrade(70)).toBe('astrophysicist')
  })
  it('classifies astronomer for >= 50', () => {
    expect(classifyAstrophysicistGrade(55)).toBe('astronomer')
  })
  it('classifies stargazer for >= 35', () => {
    expect(classifyAstrophysicistGrade(40)).toBe('stargazer')
  })
  it('classifies amateur for >= 20', () => {
    expect(classifyAstrophysicistGrade(25)).toBe('amateur')
  })
  it('classifies lost-in-space for < 20', () => {
    expect(classifyAstrophysicistGrade(10)).toBe('lost-in-space')
  })
})

// ─── analyzeGravitationalBody ────────────────────────────────────────────────

describe('analyzeGravitationalBody', () => {
  it('produces supernova-remnant for empty content', () => {
    const result = analyzeGravitationalBody(EMPTY_CONTENT, 'empty.ts')
    expect(result.gravitationalPull).toBe(5)
    expect(result.orbitalStability).toBe(5)
    expect(result.tidalForce).toBe(5)
    expect(result.escapeVelocity).toBe(5)
    expect(result.fieldStrength).toBe(5)
    expect(result.orbitalDecay).toBe(25)
    expect(result.qualityScore).toBe(8)
    expect(result.condition).toBe('supernova-remnant')
    expect(result.file).toBe('empty.ts')
  })

  it('produces supernova-remnant for minimal content', () => {
    const result = analyzeGravitationalBody(MINIMAL_CONTENT, 'minimal.ts')
    expect(result.gravitationalPull).toBe(5)
    expect(result.orbitalStability).toBe(6)
    expect(result.tidalForce).toBe(4)
    expect(result.escapeVelocity).toBe(0)
    expect(result.fieldStrength).toBe(3)
    expect(result.orbitalDecay).toBe(28)
    expect(result.qualityScore).toBe(8)
    expect(result.condition).toBe('supernova-remnant')
  })

  it('produces chaotic-orbit for rich content', () => {
    const result = analyzeGravitationalBody(RICH_CONTENT, 'src/service.ts')
    expect(result.gravitationalPull).toBe(70)
    expect(result.orbitalStability).toBe(58)
    expect(result.tidalForce).toBe(74)
    expect(result.escapeVelocity).toBe(31)
    expect(result.fieldStrength).toBe(32)
    expect(result.orbitalDecay).toBe(5)
    expect(result.qualityScore).toBe(45)
    expect(result.condition).toBe('chaotic-orbit')
  })
})

// ─── analyzeStellarRegion ────────────────────────────────────────────────────

describe('analyzeStellarRegion', () => {
  it('returns void collapsed-system for empty bodies', () => {
    const region = analyzeStellarRegion([], '.')
    expect(region.directory).toBe('.')
    expect(region.bodies).toHaveLength(0)
    expect(region.avgPull).toBe(0)
    expect(region.avgStability).toBe(0)
    expect(region.avgFieldStrength).toBe(0)
    expect(region.stableStarCount).toBe(0)
    expect(region.blackHoleCount).toBe(0)
    expect(region.decouplableCount).toBe(0)
    expect(region.cleanOrbitCount).toBe(0)
    expect(region.regionType).toBe('void')
    expect(region.condition).toBe('collapsed-system')
  })

  it('returns spiral-arm for single empty body', () => {
    const body = analyzeGravitationalBody(EMPTY_CONTENT, 'empty.ts')
    const region = analyzeStellarRegion([body], '.')
    expect(region.regionType).toBe('spiral-arm')
    expect(region.avgPull).toBe(5)
    expect(region.decouplableCount).toBe(1)
  })
})

// ─── buildGravityFieldResult ─────────────────────────────────────────────────

describe('buildGravityFieldResult', () => {
  it('handles single empty file', () => {
    const result = buildGravityFieldResult(['empty.ts'], [EMPTY_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalRegions).toBe(1)
    expect(result.stats.avgGravitationalPull).toBe(5)
    expect(result.stats.avgOrbitalStability).toBe(5)
    expect(result.stats.avgTidalForce).toBe(5)
    expect(result.stats.avgEscapeVelocity).toBe(5)
    expect(result.stats.avgFieldStrength).toBe(5)
    expect(result.stats.avgOrbitalDecay).toBe(25)
    expect(result.stats.supernovaRemnantCount).toBe(1)
    expect(result.stats.isMassiveCount).toBe(0)
    expect(result.stats.hasStrongPullCount).toBe(0)
    expect(result.stats.isStableCount).toBe(0)
    expect(result.stats.hasPerturbationCount).toBe(0)
    expect(result.stats.isManageableCount).toBe(1)
    expect(result.stats.isDecouplableCount).toBe(1)
    expect(result.stats.hasCircularReferenceCount).toBe(0)
    expect(result.stats.hasStrongFieldCount).toBe(0)
    expect(result.stats.isHealthyCount).toBe(0)
    expect(result.stats.hasSlowDecayCount).toBe(0)
    expect(result.stats.overallStability).toBe(8)
    expect(result.stats.astrophysicistGrade).toBe('lost-in-space')
    expect(result.stats.bestBody).toBe('empty.ts')
    expect(result.cosmos.isStable).toBe(false)
    expect(result.cosmos.overallStability).toBe(8)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles mixed files', () => {
    const result = buildGravityFieldResult(
      ['empty.ts', 'minimal.ts', 'src/service.ts'],
      [EMPTY_CONTENT, MINIMAL_CONTENT, RICH_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalRegions).toBe(2)
    expect(result.stats.avgGravitationalPull).toBe(27)
    expect(result.stats.avgOrbitalStability).toBe(23)
    expect(result.stats.avgTidalForce).toBe(28)
    expect(result.stats.avgEscapeVelocity).toBe(12)
    expect(result.stats.avgFieldStrength).toBe(13)
    expect(result.stats.avgOrbitalDecay).toBe(19)
    expect(result.stats.chaoticOrbitCount).toBe(1)
    expect(result.stats.supernovaRemnantCount).toBe(2)
    expect(result.stats.isMassiveCount).toBe(1)
    expect(result.stats.hasStrongPullCount).toBe(1)
    expect(result.stats.isDecouplableCount).toBe(3)
    expect(result.stats.overallStability).toBe(20)
    expect(result.stats.astrophysicistGrade).toBe('amateur')
    expect(result.stats.bestBody).toBe('src/service.ts')
    expect(result.stats.mostStable).toBe('src/service.ts')
    expect(result.stats.mostDecouplable).toBe('minimal.ts')
    expect(result.stats.strongestField).toBe('src/service.ts')
    expect(result.stats.healthiestDecay).toBe('minimal.ts')
    expect(result.cosmos.isStable).toBe(false)
    expect(result.cosmos.overallStability).toBe(20)
    expect(result.regions).toHaveLength(2)
  })

  it('handles empty file list', () => {
    const result = buildGravityFieldResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalRegions).toBe(0)
    expect(result.stats.overallStability).toBe(0)
    expect(result.cosmos.isStable).toBe(false)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('includes supernova remnant recommendation for empty bodies', () => {
    const result = buildGravityFieldResult(['empty.ts'], [EMPTY_CONTENT])
    expect(result.recommendations).toContain('Clear supernova remnants — rebuild collapsed files with proper structure')
  })

  it('includes collision course recommendation when bodies are unstable', () => {
    const result = buildGravityFieldResult(['empty.ts'], [EMPTY_CONTENT])
    expect(result.recommendations).toContain('Avoid collision course — stabilize dependency orbits with error handling and returns')
  })

  it('includes orbital decay recommendation when decay is present', () => {
    const result = buildGravityFieldResult(['src/service.ts'], [RICH_CONTENT])
    expect(result.recommendations).toContain('Stop orbital decay — remove TODOs, deprecated markers, and console calls')
  })
})

// ─── format helpers export check ─────────────────────────────────────────────

describe('format helpers', () => {
  it('formatGravityFieldJson exports exist', async () => {
    const { formatGravityFieldJson, formatGravityFieldTable } = await import(
      '../src/commands/gravity-field-format-helpers.js'
    )
    expect(typeof formatGravityFieldJson).toBe('function')
    expect(typeof formatGravityFieldTable).toBe('function')
  })

  it('formatGravityFieldJson produces valid JSON string', async () => {
    const { formatGravityFieldJson } = await import(
      '../src/commands/gravity-field-format-helpers.js'
    )
    const result = buildGravityFieldResult(['test.ts'], [MINIMAL_CONTENT])
    const json = formatGravityFieldJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('cosmos')
    expect(parsed).toHaveProperty('bodies')
  })

  it('formatGravityFieldTable produces string output', async () => {
    const { formatGravityFieldTable } = await import(
      '../src/commands/gravity-field-format-helpers.js'
    )
    const result = buildGravityFieldResult(['test.ts'], [MINIMAL_CONTENT])
    const table = formatGravityFieldTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatGravityFieldTable verbose includes body details', async () => {
    const { formatGravityFieldTable } = await import(
      '../src/commands/gravity-field-format-helpers.js'
    )
    const result = buildGravityFieldResult(['test.ts'], [MINIMAL_CONTENT])
    const table = formatGravityFieldTable(result, true)
    expect(table).toContain('Bodies')
    expect(table).toContain('test.ts')
  })
})

// ─── boundary tests ──────────────────────────────────────────────────────────

describe('classifyCondition boundary', () => {
  it('80 is stable-star', () => { expect(classifyCondition(80)).toBe('stable-star') })
  it('79 is planetary-system', () => { expect(classifyCondition(79)).toBe('planetary-system') })
  it('65 is planetary-system', () => { expect(classifyCondition(65)).toBe('planetary-system') })
  it('64 is binary-system', () => { expect(classifyCondition(64)).toBe('binary-system') })
  it('50 is binary-system', () => { expect(classifyCondition(50)).toBe('binary-system') })
  it('49 is chaotic-orbit', () => { expect(classifyCondition(49)).toBe('chaotic-orbit') })
  it('35 is chaotic-orbit', () => { expect(classifyCondition(35)).toBe('chaotic-orbit') })
  it('34 is black-hole', () => { expect(classifyCondition(34)).toBe('black-hole') })
  it('20 is black-hole', () => { expect(classifyCondition(20)).toBe('black-hole') })
  it('19 is supernova-remnant', () => { expect(classifyCondition(19)).toBe('supernova-remnant') })
  it('0 is supernova-remnant', () => { expect(classifyCondition(0)).toBe('supernova-remnant') })
})

// ─── classifyAstrophysicistGrade boundary ────────────────────────────────────

describe('classifyAstrophysicistGrade boundary', () => {
  it('80 is chief-astrophysicist', () => { expect(classifyAstrophysicistGrade(80)).toBe('chief-astrophysicist') })
  it('79 is astrophysicist', () => { expect(classifyAstrophysicistGrade(79)).toBe('astrophysicist') })
  it('65 is astrophysicist', () => { expect(classifyAstrophysicistGrade(65)).toBe('astrophysicist') })
  it('64 is astronomer', () => { expect(classifyAstrophysicistGrade(64)).toBe('astronomer') })
  it('50 is astronomer', () => { expect(classifyAstrophysicistGrade(50)).toBe('astronomer') })
  it('49 is stargazer', () => { expect(classifyAstrophysicistGrade(49)).toBe('stargazer') })
  it('35 is stargazer', () => { expect(classifyAstrophysicistGrade(35)).toBe('stargazer') })
  it('34 is amateur', () => { expect(classifyAstrophysicistGrade(34)).toBe('amateur') })
  it('20 is amateur', () => { expect(classifyAstrophysicistGrade(20)).toBe('amateur') })
  it('19 is lost-in-space', () => { expect(classifyAstrophysicistGrade(19)).toBe('lost-in-space') })
  it('0 is lost-in-space', () => { expect(classifyAstrophysicistGrade(0)).toBe('lost-in-space') })
})

// ─── analyzeGravitationalBody consistency ────────────────────────────────────

describe('analyzeGravitationalBody consistency', () => {
  it('qualityScore equals average of six measures', () => {
    const result = analyzeGravitationalBody(RICH_CONTENT, 'test.ts')
    const avg = Math.round((result.gravitationalPull + result.orbitalStability + result.tidalForce + result.escapeVelocity + result.fieldStrength + result.orbitalDecay) / 6)
    expect(result.qualityScore).toBe(avg)
  })

  it('produces consistent results for same input', () => {
    const a = analyzeGravitationalBody(MINIMAL_CONTENT, 'test.ts')
    const b = analyzeGravitationalBody(MINIMAL_CONTENT, 'test.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.condition).toBe(b.condition)
  })
})
