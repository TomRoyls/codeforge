import { describe, expect, it } from 'vitest'

import {
  analyzeCoralBed,
  analyzeCoralSpecimen,
  buildCoralGardenResult,
  classifyBedCondition,
  classifyBedType,
  classifyCondition,
  classifyMarineGrade,
  generateRecommendations,
  measureCoral,
  measureDiversity,
  measureEnvironment,
  measureGrowth,
  measurePolyp,
  measureSymbiosis,
} from '../src/commands/coral-garden-helpers.js'

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

// ─── measureCoral ─────────────────────────────────────────────────────────────

describe('measureCoral', () => {
  it('returns dead coral for empty content', () => {
    const result = measureCoral(EMPTY_CONTENT)
    expect(result.health).toBe(5)
    expect(result.species).toBe('sea-fan')
    expect(result.color).toBe('dead')
    expect(result.isHealthy).toBe(false)
    expect(result.hasVibrantColor).toBe(false)
    expect(result.hasProperCalcification).toBe(false)
    expect(result.hasNoBleaching).toBe(false)
    expect(result.hasNoDisease).toBe(true)
    expect(result.hasRegeneration).toBe(false)
    expect(result.hasZooxanthellae).toBe(false)
    expect(result.hasSpawning).toBe(false)
    expect(result.hasFragmentation).toBe(false)
    expect(result.hasRecruitment).toBe(false)
    expect(result.diseaseCount).toBe(0)
  })

  it('returns bleached coral for minimal content', () => {
    const result = measureCoral(MINIMAL_CONTENT)
    expect(result.health).toBe(18)
    expect(result.species).toBe('sea-fan')
    expect(result.color).toBe('bleached')
    expect(result.isHealthy).toBe(false)
    expect(result.hasVibrantColor).toBe(false)
    expect(result.hasProperCalcification).toBe(true)
    expect(result.hasNoBleaching).toBe(false)
    expect(result.hasNoDisease).toBe(true)
    expect(result.hasRegeneration).toBe(false)
    expect(result.hasZooxanthellae).toBe(false)
    expect(result.hasSpawning).toBe(false)
    expect(result.hasFragmentation).toBe(false)
    expect(result.hasRecruitment).toBe(false)
    expect(result.diseaseCount).toBe(0)
  })

  it('returns pale coral for rich content', () => {
    const result = measureCoral(RICH_CONTENT)
    expect(result.health).toBe(51)
    expect(result.species).toBe('elkhorn')
    expect(result.color).toBe('pale')
    expect(result.isHealthy).toBe(false)
    expect(result.hasVibrantColor).toBe(false)
    expect(result.hasProperCalcification).toBe(true)
    expect(result.hasNoBleaching).toBe(true)
    expect(result.hasNoDisease).toBe(false)
    expect(result.hasRegeneration).toBe(true)
    expect(result.hasZooxanthellae).toBe(true)
    expect(result.hasSpawning).toBe(true)
    expect(result.hasFragmentation).toBe(false)
    expect(result.hasRecruitment).toBe(true)
    expect(result.diseaseCount).toBe(8)
  })
})

// ─── measurePolyp ─────────────────────────────────────────────────────────────

describe('measurePolyp', () => {
  it('returns fossilized polyp for empty content', () => {
    const result = measurePolyp(EMPTY_CONTENT)
    expect(result.activity).toBe(5)
    expect(result.density).toBe('fossilized')
    expect(result.isActive).toBe(false)
    expect(result.hasFeeding).toBe(false)
    expect(result.hasReproduction).toBe(false)
    expect(result.hasDefense).toBe(false)
    expect(result.hasCommunication).toBe(false)
    expect(result.hasWasteRemoval).toBe(false)
    expect(result.hasRespiration).toBe(false)
    expect(result.hasPhotosynthesis).toBe(false)
    expect(result.hasNematocyst).toBe(false)
    expect(result.hasMucusProduction).toBe(false)
    expect(result.activityScore).toBe(5)
  })

  it('returns sparse polyp for minimal content', () => {
    const result = measurePolyp(MINIMAL_CONTENT)
    expect(result.activity).toBe(14)
    expect(result.density).toBe('sparse')
    expect(result.isActive).toBe(false)
    expect(result.hasFeeding).toBe(true)
    expect(result.hasReproduction).toBe(true)
    expect(result.hasDefense).toBe(false)
    expect(result.hasCommunication).toBe(false)
    expect(result.hasWasteRemoval).toBe(false)
    expect(result.hasRespiration).toBe(false)
    expect(result.hasPhotosynthesis).toBe(true)
    expect(result.hasNematocyst).toBe(false)
    expect(result.hasMucusProduction).toBe(false)
    expect(result.activityScore).toBe(14)
  })

  it('returns active polyp for rich content', () => {
    const result = measurePolyp(RICH_CONTENT)
    expect(result.activity).toBe(61)
    expect(result.density).toBe('sparse')
    expect(result.isActive).toBe(true)
    expect(result.hasFeeding).toBe(true)
    expect(result.hasReproduction).toBe(true)
    expect(result.hasDefense).toBe(true)
    expect(result.hasCommunication).toBe(true)
    expect(result.hasWasteRemoval).toBe(true)
    expect(result.hasRespiration).toBe(true)
    expect(result.hasPhotosynthesis).toBe(true)
    expect(result.hasNematocyst).toBe(true)
    expect(result.hasMucusProduction).toBe(true)
    expect(result.activityScore).toBe(61)
  })
})

// ─── measureDiversity ─────────────────────────────────────────────────────────

describe('measureDiversity', () => {
  it('returns sterile diversity for empty content', () => {
    const result = measureDiversity(EMPTY_CONTENT)
    expect(result.score).toBe(0)
    expect(result.richness).toBe('sterile')
    expect(result.hasHighRichness).toBe(false)
    expect(result.hasEvenness).toBe(false)
    expect(result.hasShannonIndex).toBe(false)
    expect(result.hasFunctionalDiversity).toBe(false)
    expect(result.hasStructuralDiversity).toBe(false)
    expect(result.hasTaxonomicDiversity).toBe(false)
    expect(result.hasNoMonoculture).toBe(false)
    expect(result.hasNoInvasive).toBe(true)
    expect(result.hasEndemic).toBe(false)
    expect(result.hasKeystone).toBe(false)
    expect(result.invasiveCount).toBe(0)
    expect(result.endemicCount).toBe(0)
  })

  it('returns sterile diversity for minimal content', () => {
    const result = measureDiversity(MINIMAL_CONTENT)
    expect(result.score).toBe(9)
    expect(result.richness).toBe('sterile')
    expect(result.hasHighRichness).toBe(false)
    expect(result.hasEvenness).toBe(false)
    expect(result.hasShannonIndex).toBe(false)
    expect(result.hasFunctionalDiversity).toBe(false)
    expect(result.hasStructuralDiversity).toBe(false)
    expect(result.hasTaxonomicDiversity).toBe(false)
    expect(result.hasNoMonoculture).toBe(false)
    expect(result.hasNoInvasive).toBe(true)
    expect(result.hasEndemic).toBe(false)
    expect(result.hasKeystone).toBe(false)
    expect(result.invasiveCount).toBe(0)
    expect(result.endemicCount).toBe(0)
  })

  it('returns low diversity for rich content', () => {
    const result = measureDiversity(RICH_CONTENT)
    expect(result.score).toBe(36)
    expect(result.richness).toBe('low')
    expect(result.hasHighRichness).toBe(false)
    expect(result.hasEvenness).toBe(true)
    expect(result.hasShannonIndex).toBe(true)
    expect(result.hasFunctionalDiversity).toBe(true)
    expect(result.hasStructuralDiversity).toBe(true)
    expect(result.hasTaxonomicDiversity).toBe(false)
    expect(result.hasNoMonoculture).toBe(true)
    expect(result.hasNoInvasive).toBe(false)
    expect(result.hasEndemic).toBe(true)
    expect(result.hasKeystone).toBe(true)
    expect(result.invasiveCount).toBe(4)
    expect(result.endemicCount).toBe(6)
  })
})

// ─── measureSymbiosis ─────────────────────────────────────────────────────────

describe('measureSymbiosis', () => {
  it('returns amensalism for empty content', () => {
    const result = measureSymbiosis(EMPTY_CONTENT)
    expect(result.network).toBe(10)
    expect(result.type).toBe('amensalism')
    expect(result.hasMutualBenefit).toBe(false)
    expect(result.hasCleanerFish).toBe(false)
    expect(result.hasClownfishAnemone).toBe(false)
    expect(result.hasParasiticSponge).toBe(false)
    expect(result.hasCrownOfThorns).toBe(false)
    expect(result.hasNitrogenFixation).toBe(false)
    expect(result.hasCarbonSequestration).toBe(false)
    expect(result.hasBioerosion).toBe(false)
    expect(result.hasTrophicCascade).toBe(false)
    expect(result.mutualismCount).toBe(0)
    expect(result.parasitismCount).toBe(0)
  })

  it('returns neutralism for minimal content', () => {
    const result = measureSymbiosis(MINIMAL_CONTENT)
    expect(result.network).toBe(26)
    expect(result.type).toBe('neutralism')
    expect(result.hasMutualBenefit).toBe(false)
    expect(result.hasCleanerFish).toBe(false)
    expect(result.hasClownfishAnemone).toBe(false)
    expect(result.hasParasiticSponge).toBe(false)
    expect(result.hasCrownOfThorns).toBe(false)
    expect(result.hasNitrogenFixation).toBe(false)
    expect(result.hasCarbonSequestration).toBe(true)
    expect(result.hasBioerosion).toBe(false)
    expect(result.hasTrophicCascade).toBe(false)
    expect(result.mutualismCount).toBe(1)
    expect(result.parasitismCount).toBe(0)
  })

  it('returns parasitism for rich content', () => {
    const result = measureSymbiosis(RICH_CONTENT)
    expect(result.network).toBe(48)
    expect(result.type).toBe('parasitism')
    expect(result.hasMutualBenefit).toBe(false)
    expect(result.hasCleanerFish).toBe(true)
    expect(result.hasClownfishAnemone).toBe(true)
    expect(result.hasParasiticSponge).toBe(true)
    expect(result.hasCrownOfThorns).toBe(true)
    expect(result.hasNitrogenFixation).toBe(true)
    expect(result.hasCarbonSequestration).toBe(true)
    expect(result.hasBioerosion).toBe(true)
    expect(result.hasTrophicCascade).toBe(false)
    expect(result.mutualismCount).toBe(4)
    expect(result.parasitismCount).toBe(3)
  })
})

// ─── measureGrowth ────────────────────────────────────────────────────────────

describe('measureGrowth', () => {
  it('returns stunted growth for empty content', () => {
    const result = measureGrowth(EMPTY_CONTENT)
    expect(result.rate).toBe(5)
    expect(result.pattern).toBe('stunted')
    expect(result.isHealthyGrowth).toBe(false)
    expect(result.hasLinearGrowth).toBe(false)
    expect(result.hasExponentialGrowth).toBe(false)
    expect(result.hasLogisticGrowth).toBe(false)
    expect(result.hasSeasonalGrowth).toBe(false)
    expect(result.hasCalcification).toBe(false)
    expect(result.hasExtension).toBe(false)
    expect(result.hasDensityBanding).toBe(false)
    expect(result.hasBioerosion).toBe(false)
    expect(result.hasRecruitment).toBe(false)
    expect(result.growthScore).toBe(5)
  })

  it('returns stunted growth for minimal content', () => {
    const result = measureGrowth(MINIMAL_CONTENT)
    expect(result.rate).toBe(10)
    expect(result.pattern).toBe('stunted')
    expect(result.isHealthyGrowth).toBe(false)
    expect(result.hasLinearGrowth).toBe(false)
    expect(result.hasExponentialGrowth).toBe(false)
    expect(result.hasLogisticGrowth).toBe(false)
    expect(result.hasSeasonalGrowth).toBe(false)
    expect(result.hasCalcification).toBe(true)
    expect(result.hasExtension).toBe(true)
    expect(result.hasDensityBanding).toBe(false)
    expect(result.hasBioerosion).toBe(false)
    expect(result.hasRecruitment).toBe(false)
    expect(result.growthScore).toBe(10)
  })

  it('returns massive growth for rich content', () => {
    const result = measureGrowth(RICH_CONTENT)
    expect(result.rate).toBe(63)
    expect(result.pattern).toBe('massive')
    expect(result.isHealthyGrowth).toBe(true)
    expect(result.hasLinearGrowth).toBe(true)
    expect(result.hasExponentialGrowth).toBe(true)
    expect(result.hasLogisticGrowth).toBe(true)
    expect(result.hasSeasonalGrowth).toBe(true)
    expect(result.hasCalcification).toBe(true)
    expect(result.hasExtension).toBe(true)
    expect(result.hasDensityBanding).toBe(true)
    expect(result.hasBioerosion).toBe(true)
    expect(result.hasRecruitment).toBe(true)
    expect(result.growthScore).toBe(63)
  })
})

// ─── measureEnvironment ───────────────────────────────────────────────────────

describe('measureEnvironment', () => {
  it('returns freezing environment for empty content', () => {
    const result = measureEnvironment(EMPTY_CONTENT)
    expect(result.quality).toBe(5)
    expect(result.temperature).toBe('freezing')
    expect(result.hasClearWater).toBe(true)
    expect(result.hasProperSalinity).toBe(false)
    expect(result.hasGoodCirculation).toBe(false)
    expect(result.hasNoPollution).toBe(true)
    expect(result.hasNoSedimentation).toBe(true)
    expect(result.hasNoAcidification).toBe(true)
    expect(result.hasUVProtection).toBe(false)
    expect(result.hasNutrientUpwelling).toBe(false)
    expect(result.hasTidalExchange).toBe(false)
    expect(result.hasStormProtection).toBe(false)
    expect(result.pollutionCount).toBe(0)
  })

  it('returns freezing environment for minimal content', () => {
    const result = measureEnvironment(MINIMAL_CONTENT)
    expect(result.quality).toBe(11)
    expect(result.temperature).toBe('freezing')
    expect(result.hasClearWater).toBe(true)
    expect(result.hasProperSalinity).toBe(true)
    expect(result.hasGoodCirculation).toBe(false)
    expect(result.hasNoPollution).toBe(true)
    expect(result.hasNoSedimentation).toBe(true)
    expect(result.hasNoAcidification).toBe(true)
    expect(result.hasUVProtection).toBe(false)
    expect(result.hasNutrientUpwelling).toBe(false)
    expect(result.hasTidalExchange).toBe(false)
    expect(result.hasStormProtection).toBe(false)
    expect(result.pollutionCount).toBe(0)
  })

  it('returns cold environment for rich content', () => {
    const result = measureEnvironment(RICH_CONTENT)
    expect(result.quality).toBe(17)
    expect(result.temperature).toBe('cold')
    expect(result.hasClearWater).toBe(false)
    expect(result.hasProperSalinity).toBe(true)
    expect(result.hasGoodCirculation).toBe(true)
    expect(result.hasNoPollution).toBe(false)
    expect(result.hasNoSedimentation).toBe(false)
    expect(result.hasNoAcidification).toBe(false)
    expect(result.hasUVProtection).toBe(false)
    expect(result.hasNutrientUpwelling).toBe(true)
    expect(result.hasTidalExchange).toBe(true)
    expect(result.hasStormProtection).toBe(true)
    expect(result.pollutionCount).toBe(8)
  })
})

// ─── classifyCondition ────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies thriving-reef for >= 80', () => {
    expect(classifyCondition(90)).toBe('thriving-reef')
  })

  it('classifies healthy-garden for >= 65', () => {
    expect(classifyCondition(75)).toBe('healthy-garden')
  })

  it('classifies recovering-coral for >= 50', () => {
    expect(classifyCondition(55)).toBe('recovering-coral')
  })

  it('classifies stressed-reef for >= 35', () => {
    expect(classifyCondition(40)).toBe('stressed-reef')
  })

  it('classifies bleaching-event for >= 20', () => {
    expect(classifyCondition(25)).toBe('bleaching-event')
  })

  it('classifies dead-skeleton for < 20', () => {
    expect(classifyCondition(10)).toBe('dead-skeleton')
  })
})

// ─── classifyBedType ──────────────────────────────────────────────────────────

describe('classifyBedType', () => {
  it('returns sand-flat for empty array', () => {
    expect(classifyBedType([])).toBe('sand-flat')
  })

  it('returns sand-flat for dead-skeleton specimens', () => {
    const empty = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    expect(classifyBedType([empty])).toBe('sand-flat')
  })

  it('returns fringing-reef for stressed-reef specimen', () => {
    const rich = analyzeCoralSpecimen(RICH_CONTENT, 'src/service.ts')
    expect(classifyBedType([rich])).toBe('fringing-reef')
  })

  it('returns rocky-shore for mixed specimens', () => {
    const empty = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    const rich = analyzeCoralSpecimen(RICH_CONTENT, 'src/service.ts')
    expect(classifyBedType([empty, rich])).toBe('rocky-shore')
  })
})

// ─── classifyBedCondition ─────────────────────────────────────────────────────

describe('classifyBedCondition', () => {
  it('classifies marine-sanctuary for >= 80', () => {
    expect(classifyBedCondition(85)).toBe('marine-sanctuary')
  })

  it('classifies national-park for >= 65', () => {
    expect(classifyBedCondition(70)).toBe('national-park')
  })

  it('classifies protected-area for >= 50', () => {
    expect(classifyBedCondition(55)).toBe('protected-area')
  })

  it('classifies stressed-zone for >= 35', () => {
    expect(classifyBedCondition(40)).toBe('stressed-zone')
  })

  it('classifies bleaching-zone for >= 20', () => {
    expect(classifyBedCondition(25)).toBe('bleaching-zone')
  })

  it('classifies dead-zone for < 20', () => {
    expect(classifyBedCondition(10)).toBe('dead-zone')
  })
})

// ─── classifyMarineGrade ──────────────────────────────────────────────────────

describe('classifyMarineGrade', () => {
  it('classifies marine-biologist for >= 80', () => {
    expect(classifyMarineGrade(85)).toBe('marine-biologist')
  })

  it('classifies reef-scientist for >= 65', () => {
    expect(classifyMarineGrade(70)).toBe('reef-scientist')
  })

  it('classifies oceanographer for >= 50', () => {
    expect(classifyMarineGrade(55)).toBe('oceanographer')
  })

  it('classifies diver for >= 35', () => {
    expect(classifyMarineGrade(40)).toBe('diver')
  })

  it('classifies snorkeler for >= 20', () => {
    expect(classifyMarineGrade(25)).toBe('snorkeler')
  })

  it('classifies beachgoer for < 20', () => {
    expect(classifyMarineGrade(10)).toBe('beachgoer')
  })
})

// ─── analyzeCoralSpecimen ─────────────────────────────────────────────────────

describe('analyzeCoralSpecimen', () => {
  it('produces dead-skeleton for empty content', () => {
    const result = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    expect(result.coralHealth).toBe(5)
    expect(result.polypActivity).toBe(5)
    expect(result.reefDiversity).toBe(0)
    expect(result.symbioticNetwork).toBe(10)
    expect(result.growthRate).toBe(5)
    expect(result.waterQuality).toBe(5)
    expect(result.qualityScore).toBe(5)
    expect(result.condition).toBe('dead-skeleton')
    expect(result.file).toBe('empty.ts')
  })

  it('produces dead-skeleton for minimal content', () => {
    const result = analyzeCoralSpecimen(MINIMAL_CONTENT, 'minimal.ts')
    expect(result.coralHealth).toBe(18)
    expect(result.polypActivity).toBe(14)
    expect(result.reefDiversity).toBe(9)
    expect(result.symbioticNetwork).toBe(26)
    expect(result.growthRate).toBe(10)
    expect(result.waterQuality).toBe(11)
    expect(result.qualityScore).toBe(15)
    expect(result.condition).toBe('dead-skeleton')
  })

  it('produces stressed-reef for rich content', () => {
    const result = analyzeCoralSpecimen(RICH_CONTENT, 'src/service.ts')
    expect(result.coralHealth).toBe(51)
    expect(result.polypActivity).toBe(61)
    expect(result.reefDiversity).toBe(36)
    expect(result.symbioticNetwork).toBe(48)
    expect(result.growthRate).toBe(63)
    expect(result.waterQuality).toBe(17)
    expect(result.qualityScore).toBe(46)
    expect(result.condition).toBe('stressed-reef')
  })
})

// ─── buildCoralGardenResult ───────────────────────────────────────────────────

describe('buildCoralGardenResult', () => {
  it('handles single empty file', () => {
    const result = buildCoralGardenResult(['empty.ts'], [EMPTY_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalBeds).toBe(1)
    expect(result.stats.avgCoralHealth).toBe(5)
    expect(result.stats.avgPolypActivity).toBe(5)
    expect(result.stats.avgReefDiversity).toBe(0)
    expect(result.stats.avgSymbioticNetwork).toBe(10)
    expect(result.stats.avgGrowthRate).toBe(5)
    expect(result.stats.avgWaterQuality).toBe(5)
    expect(result.stats.deadSkeletonCount).toBe(1)
    expect(result.stats.isHealthyCount).toBe(0)
    expect(result.stats.hasVibrantColorCount).toBe(0)
    expect(result.stats.hasRegenerationCount).toBe(0)
    expect(result.stats.isActiveCount).toBe(0)
    expect(result.stats.hasHighRichnessCount).toBe(0)
    expect(result.stats.hasNoMonocultureCount).toBe(0)
    expect(result.stats.hasMutualBenefitCount).toBe(0)
    expect(result.stats.hasParasiticSpongeCount).toBe(0)
    expect(result.stats.isHealthyGrowthCount).toBe(0)
    expect(result.stats.hasClearWaterCount).toBe(1)
    expect(result.stats.hasNoPollutionCount).toBe(1)
    expect(result.stats.overallHealth).toBe(5)
    expect(result.stats.marineGrade).toBe('beachgoer')
    expect(result.stats.bestSpecimen).toBe('empty.ts')
    expect(result.garden.avgHealth).toBe(5)
    expect(result.garden.avgDiversity).toBe(0)
    expect(result.garden.avgSymbiosis).toBe(10)
    expect(result.garden.isThriving).toBe(false)
    expect(result.garden.overallHealth).toBe(5)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles mixed files', () => {
    const result = buildCoralGardenResult(
      ['empty.ts', 'minimal.ts', 'src/service.ts'],
      [EMPTY_CONTENT, MINIMAL_CONTENT, RICH_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalBeds).toBe(2)
    expect(result.stats.avgCoralHealth).toBe(25)
    expect(result.stats.avgPolypActivity).toBe(27)
    expect(result.stats.avgReefDiversity).toBe(15)
    expect(result.stats.avgSymbioticNetwork).toBe(28)
    expect(result.stats.avgGrowthRate).toBe(26)
    expect(result.stats.avgWaterQuality).toBe(11)
    expect(result.stats.thrivingReefCount).toBe(0)
    expect(result.stats.healthyGardenCount).toBe(0)
    expect(result.stats.recoveringCoralCount).toBe(0)
    expect(result.stats.stressedReefCount).toBe(1)
    expect(result.stats.bleachingEventCount).toBe(0)
    expect(result.stats.deadSkeletonCount).toBe(2)
    expect(result.stats.isHealthyCount).toBe(0)
    expect(result.stats.hasVibrantColorCount).toBe(0)
    expect(result.stats.hasRegenerationCount).toBe(1)
    expect(result.stats.isActiveCount).toBe(1)
    expect(result.stats.hasHighRichnessCount).toBe(0)
    expect(result.stats.hasNoMonocultureCount).toBe(1)
    expect(result.stats.hasMutualBenefitCount).toBe(0)
    expect(result.stats.hasParasiticSpongeCount).toBe(1)
    expect(result.stats.isHealthyGrowthCount).toBe(1)
    expect(result.stats.hasClearWaterCount).toBe(2)
    expect(result.stats.hasNoPollutionCount).toBe(2)
    expect(result.stats.overallHealth).toBe(22)
    expect(result.stats.marineGrade).toBe('snorkeler')
    expect(result.stats.bestSpecimen).toBe('src/service.ts')
    expect(result.stats.healthiestCoral).toBe('src/service.ts')
    expect(result.stats.mostActive).toBe('src/service.ts')
    expect(result.stats.mostDiverse).toBe('src/service.ts')
    expect(result.stats.bestSymbiosis).toBe('src/service.ts')
    expect(result.garden.avgHealth).toBe(25)
    expect(result.garden.avgDiversity).toBe(15)
    expect(result.garden.avgSymbiosis).toBe(28)
    expect(result.garden.isThriving).toBe(false)
    expect(result.garden.overallHealth).toBe(22)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5)
  })

  it('handles empty file list', () => {
    const result = buildCoralGardenResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalBeds).toBe(0)
    expect(result.stats.overallHealth).toBe(0)
    expect(result.garden.isThriving).toBe(false)
  })
})

// ─── classifyCondition boundary ───────────────────────────────────────────────

describe('classifyCondition boundary values', () => {
  it('classifies exactly 80 as thriving-reef', () => {
    expect(classifyCondition(80)).toBe('thriving-reef')
  })

  it('classifies exactly 79 as healthy-garden', () => {
    expect(classifyCondition(79)).toBe('healthy-garden')
  })

  it('classifies exactly 65 as healthy-garden', () => {
    expect(classifyCondition(65)).toBe('healthy-garden')
  })

  it('classifies exactly 64 as recovering-coral', () => {
    expect(classifyCondition(64)).toBe('recovering-coral')
  })

  it('classifies exactly 50 as recovering-coral', () => {
    expect(classifyCondition(50)).toBe('recovering-coral')
  })

  it('classifies exactly 49 as stressed-reef', () => {
    expect(classifyCondition(49)).toBe('stressed-reef')
  })

  it('classifies exactly 35 as stressed-reef', () => {
    expect(classifyCondition(35)).toBe('stressed-reef')
  })

  it('classifies exactly 34 as bleaching-event', () => {
    expect(classifyCondition(34)).toBe('bleaching-event')
  })

  it('classifies exactly 20 as bleaching-event', () => {
    expect(classifyCondition(20)).toBe('bleaching-event')
  })

  it('classifies exactly 19 as dead-skeleton', () => {
    expect(classifyCondition(19)).toBe('dead-skeleton')
  })

  it('classifies 0 as dead-skeleton', () => {
    expect(classifyCondition(0)).toBe('dead-skeleton')
  })
})

// ─── classifyMarineGrade boundary ─────────────────────────────────────────────

describe('classifyMarineGrade boundary values', () => {
  it('classifies exactly 80 as marine-biologist', () => {
    expect(classifyMarineGrade(80)).toBe('marine-biologist')
  })

  it('classifies exactly 79 as reef-scientist', () => {
    expect(classifyMarineGrade(79)).toBe('reef-scientist')
  })

  it('classifies exactly 65 as reef-scientist', () => {
    expect(classifyMarineGrade(65)).toBe('reef-scientist')
  })

  it('classifies exactly 64 as oceanographer', () => {
    expect(classifyMarineGrade(64)).toBe('oceanographer')
  })

  it('classifies exactly 50 as oceanographer', () => {
    expect(classifyMarineGrade(50)).toBe('oceanographer')
  })

  it('classifies exactly 49 as diver', () => {
    expect(classifyMarineGrade(49)).toBe('diver')
  })

  it('classifies exactly 35 as diver', () => {
    expect(classifyMarineGrade(35)).toBe('diver')
  })

  it('classifies exactly 34 as snorkeler', () => {
    expect(classifyMarineGrade(34)).toBe('snorkeler')
  })

  it('classifies exactly 20 as snorkeler', () => {
    expect(classifyMarineGrade(20)).toBe('snorkeler')
  })

  it('classifies exactly 19 as beachgoer', () => {
    expect(classifyMarineGrade(19)).toBe('beachgoer')
  })

  it('classifies 0 as beachgoer', () => {
    expect(classifyMarineGrade(0)).toBe('beachgoer')
  })
})

// ─── classifyBedCondition boundary ────────────────────────────────────────────

describe('classifyBedCondition boundary values', () => {
  it('classifies exactly 80 as marine-sanctuary', () => {
    expect(classifyBedCondition(80)).toBe('marine-sanctuary')
  })

  it('classifies exactly 79 as national-park', () => {
    expect(classifyBedCondition(79)).toBe('national-park')
  })

  it('classifies exactly 65 as national-park', () => {
    expect(classifyBedCondition(65)).toBe('national-park')
  })

  it('classifies exactly 50 as protected-area', () => {
    expect(classifyBedCondition(50)).toBe('protected-area')
  })

  it('classifies exactly 35 as stressed-zone', () => {
    expect(classifyBedCondition(35)).toBe('stressed-zone')
  })

  it('classifies exactly 20 as bleaching-zone', () => {
    expect(classifyBedCondition(20)).toBe('bleaching-zone')
  })

  it('classifies exactly 19 as dead-zone', () => {
    expect(classifyBedCondition(19)).toBe('dead-zone')
  })
})

// ─── analyzeCoralBed ──────────────────────────────────────────────────────────

describe('analyzeCoralBed', () => {
  it('returns sand-flat dead-zone for empty specimens array', () => {
    const bed = analyzeCoralBed([], '.')
    expect(bed.directory).toBe('.')
    expect(bed.specimens).toHaveLength(0)
    expect(bed.avgHealth).toBe(0)
    expect(bed.avgDiversity).toBe(0)
    expect(bed.avgSymbiosis).toBe(0)
    expect(bed.thrivingCount).toBe(0)
    expect(bed.deadCount).toBe(0)
    expect(bed.mutualismCount).toBe(0)
    expect(bed.activePolypCount).toBe(0)
    expect(bed.bedType).toBe('sand-flat')
    expect(bed.condition).toBe('dead-zone')
  })

  it('returns sand-flat for single dead-skeleton specimen', () => {
    const spec = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    const bed = analyzeCoralBed([spec], '.')
    expect(bed.directory).toBe('.')
    expect(bed.specimens).toHaveLength(1)
    expect(bed.avgHealth).toBe(5)
    expect(bed.avgDiversity).toBe(0)
    expect(bed.avgSymbiosis).toBe(10)
    expect(bed.deadCount).toBe(1)
    expect(bed.thrivingCount).toBe(0)
    expect(bed.mutualismCount).toBe(0)
    expect(bed.activePolypCount).toBe(0)
    expect(bed.bedType).toBe('sand-flat')
    expect(bed.condition).toBe('dead-zone')
  })

  it('returns rocky-shore for mixed empty and rich specimens', () => {
    const emptySpec = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    const richSpec = analyzeCoralSpecimen(RICH_CONTENT, 'src/service.ts')
    const bed = analyzeCoralBed([emptySpec, richSpec], 'src')
    expect(bed.directory).toBe('src')
    expect(bed.specimens).toHaveLength(2)
    expect(bed.avgHealth).toBe(28)
    expect(bed.avgDiversity).toBe(18)
    expect(bed.avgSymbiosis).toBe(29)
    expect(bed.deadCount).toBe(1)
    expect(bed.thrivingCount).toBe(0)
    expect(bed.activePolypCount).toBe(1)
    expect(bed.bedType).toBe('rocky-shore')
    expect(bed.condition).toBe('bleaching-zone')
  })

  it('returns fringing-reef for single rich specimen', () => {
    const spec = analyzeCoralSpecimen(RICH_CONTENT, 'src/service.ts')
    const bed = analyzeCoralBed([spec], 'src')
    expect(bed.specimens).toHaveLength(1)
    expect(bed.avgHealth).toBe(51)
    expect(bed.avgDiversity).toBe(36)
    expect(bed.avgSymbiosis).toBe(48)
    expect(bed.bedType).toBe('fringing-reef')
    expect(bed.condition).toBe('stressed-zone')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns thriving message when no issues found', () => {
    const spec = analyzeCoralSpecimen(RICH_CONTENT, 'src/service.ts')
    const result = buildCoralGardenResult(['src/service.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(
      [{ ...spec, condition: 'thriving-reef', coral: { ...spec.coral, hasNoBleaching: true, diseaseCount: 0 }, symbiosis: { ...spec.symbiosis, hasParasiticSponge: false, hasCrownOfThorns: false, hasBioerosion: false }, environment: { ...spec.environment, pollutionCount: 0 }, growth: { ...spec.growth, pattern: 'massive' as const } }],
      result.beds,
      result.garden,
      result.stats,
    )
    expect(recs).toContain('The coral garden is a thriving marine sanctuary — vibrant biodiversity achieved')
  })

  it('includes revive recommendation for dead-skeleton specimens', () => {
    const spec = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    const result = buildCoralGardenResult(['empty.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations([spec], result.beds, result.garden, result.stats)
    expect(recs).toContain('Revive dead coral skeletons — add exports, functions, and type annotations to empty files')
  })

  it('includes bleaching recommendation when hasNoBleaching is false', () => {
    const spec = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    const result = buildCoralGardenResult(['empty.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations([spec], result.beds, result.garden, result.stats)
    expect(recs).toContain('Stop coral bleaching — improve code health with better structure and error handling')
  })

  it('includes growth recommendation for stunted specimens', () => {
    const spec = analyzeCoralSpecimen(EMPTY_CONTENT, 'empty.ts')
    const result = buildCoralGardenResult(['empty.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations([spec], result.beds, result.garden, result.stats)
    expect(recs).toContain('Encourage growth — add classes, async patterns, and exports to stunted files')
  })

  it('includes all applicable recommendations for rich mixed content', () => {
    const result = buildCoralGardenResult(
      ['empty.ts', 'src/service.ts'],
      [EMPTY_CONTENT, RICH_CONTENT],
    )
    expect(result.recommendations).toContain('Cure coral diseases — remove console calls, any types, TODOs, and deprecated markers')
    expect(result.recommendations).toContain('Remove parasitic sponges — eliminate deprecated code harming symbiotic network')
    expect(result.recommendations).toContain('Remove crown-of-thorns — clean up code smells and deprecated code combinations')
    expect(result.recommendations).toContain('Clean water pollution — remove smells, TODOs, and deprecated markers')
    expect(result.recommendations).toContain('Stop bioerosion — resolve TODOs that erode codebase quality')
  })
})

// ─── buildCoralGardenResult bed grouping ──────────────────────────────────────

describe('buildCoralGardenResult bed grouping', () => {
  it('groups files by directory into separate beds', () => {
    const result = buildCoralGardenResult(
      ['a.ts', 'src/b.ts', 'src/c.ts'],
      [MINIMAL_CONTENT, EMPTY_CONTENT, RICH_CONTENT],
    )
    expect(result.beds).toHaveLength(2)
    const rootBed = result.beds.find((b) => b.directory === '.')
    const srcBed = result.beds.find((b) => b.directory === 'src')
    expect(rootBed).toBeDefined()
    expect(srcBed).toBeDefined()
    expect(rootBed!.specimens).toHaveLength(1)
    expect(srcBed!.specimens).toHaveLength(2)
  })

  it('puts all flat files into root bed', () => {
    const result = buildCoralGardenResult(
      ['a.ts', 'b.ts'],
      [MINIMAL_CONTENT, MINIMAL_CONTENT],
    )
    expect(result.beds).toHaveLength(1)
    expect(result.beds[0].directory).toBe('.')
    expect(result.beds[0].specimens).toHaveLength(2)
  })
})

// ─── analyzeCoralSpecimen score consistency ───────────────────────────────────

describe('analyzeCoralSpecimen score consistency', () => {
  it('qualityScore equals average of all six measure scores', () => {
    const result = analyzeCoralSpecimen(RICH_CONTENT, 'test.ts')
    const avg = Math.round((result.coralHealth + result.polypActivity + result.reefDiversity + result.symbioticNetwork + result.growthRate + result.waterQuality) / 6)
    expect(result.qualityScore).toBe(avg)
  })

  it('produces consistent results for same input', () => {
    const a = analyzeCoralSpecimen(MINIMAL_CONTENT, 'test.ts')
    const b = analyzeCoralSpecimen(MINIMAL_CONTENT, 'test.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.condition).toBe(b.condition)
    expect(a.coralHealth).toBe(b.coralHealth)
  })
})

// ─── format helpers export check ──────────────────────────────────────────────

describe('format helpers', () => {
  it('formatCoralGardenJson exports exist', async () => {
    const { formatCoralGardenJson, formatCoralGardenTable } = await import(
      '../src/commands/coral-garden-format-helpers.js'
    )
    expect(typeof formatCoralGardenJson).toBe('function')
    expect(typeof formatCoralGardenTable).toBe('function')
  })

  it('formatCoralGardenJson produces valid JSON string', async () => {
    const { formatCoralGardenJson } = await import(
      '../src/commands/coral-garden-format-helpers.js'
    )
    const result = buildCoralGardenResult(['test.ts'], [MINIMAL_CONTENT])
    const json = formatCoralGardenJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('garden')
    expect(parsed).toHaveProperty('beds')
  })

  it('formatCoralGardenTable produces string output', async () => {
    const { formatCoralGardenTable } = await import(
      '../src/commands/coral-garden-format-helpers.js'
    )
    const result = buildCoralGardenResult(['test.ts'], [MINIMAL_CONTENT])
    const table = formatCoralGardenTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })
})
