import { describe, expect, it } from 'vitest'

import {
  measureLight,
  measureColor,
  measureMagnetic,
  measureSolar,
  measureAtmosphere,
  measureDisplay,
  classifyReadingCondition,
  analyzeAuroraReading,
  classifyZoneType,
  classifyZoneCondition,
  classifyAstronomerGrade,
  analyzeAuroraZone,
  generateRecommendations,
  buildAuroraBorealisResult,
} from '../src/commands/aurora-borealis-helpers.js'

import { scoreColor, conditionColor, brightnessColor, dominantColor, astronomerGradeColor, zoneCondColor, formatReading, formatZone, formatStats, formatAuroraBorealisTable, formatAuroraBorealisJson } from '../src/commands/aurora-borealis-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const MINIMAL_CONTENT = 'export function add(a: number, b: number): number { return a + b; }'

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

// ─── measureLight ──────────────────────────────────────────────────────────

describe('measureLight', () => {
  it('returns dark for empty content', () => {
    const result = measureLight(EMPTY_CONTENT)
    expect(result.intensity).toBe(5)
    expect(result.brightness).toBe('dark')
    expect(result.isBrilliant).toBe(false)
    expect(result.hasHighIntensity).toBe(false)
    expect(result.hasPersistentGlow).toBe(false)
    expect(result.hasNoLight).toBe(true)
    expect(result.peakIntensity).toBe(5)
  })

  it('returns dim for minimal content', () => {
    const result = measureLight(MINIMAL_CONTENT)
    expect(result.intensity).toBe(20)
    expect(result.brightness).toBe('dim')
    expect(result.hasPersistentGlow).toBe(true)
    expect(result.hasQuietArc).toBe(true)
    expect(result.hasNoLight).toBe(false)
    expect(result.peakIntensity).toBe(23)
  })

  it('returns moderate for rich content', () => {
    const result = measureLight(RICH_CONTENT)
    expect(result.intensity).toBe(51)
    expect(result.brightness).toBe('moderate')
    expect(result.hasPersistentGlow).toBe(true)
    expect(result.hasPulsating).toBe(true)
    expect(result.hasRayedBand).toBe(true)
    expect(result.hasCorona).toBe(false)
    expect(result.isBrilliant).toBe(false)
    expect(result.peakIntensity).toBe(60)
  })
})

// ─── measureColor ──────────────────────────────────────────────────────────

describe('measureColor', () => {
  it('returns white/monochrome for empty content', () => {
    const result = measureColor(EMPTY_CONTENT)
    expect(result.spectrum).toBe(0)
    expect(result.dominant).toBe('white')
    expect(result.hasMonochrome).toBe(true)
    expect(result.emissionCount).toBe(0)
  })

  it('returns green emission for minimal content', () => {
    const result = measureColor(MINIMAL_CONTENT)
    expect(result.spectrum).toBe(10)
    expect(result.hasGreenEmission).toBe(true)
    expect(result.hasMonochrome).toBe(true)
    expect(result.emissionCount).toBe(1)
  })

  it('returns green dominant for rich content', () => {
    const result = measureColor(RICH_CONTENT)
    expect(result.spectrum).toBe(57)
    expect(result.dominant).toBe('green')
    expect(result.hasGreenEmission).toBe(true)
    expect(result.hasPurpleEmission).toBe(true)
    expect(result.hasBlueEmission).toBe(true)
    expect(result.hasYellowEmission).toBe(true)
    expect(result.hasColorShift).toBe(true)
    expect(result.hasMonochrome).toBe(false)
    expect(result.emissionCount).toBe(4)
  })
})

// ─── measureMagnetic ───────────────────────────────────────────────────────

describe('measureMagnetic', () => {
  it('returns disconnected for empty content', () => {
    const result = measureMagnetic(EMPTY_CONTENT)
    expect(result.alignment).toBe(10)
    expect(result.pole).toBe('disconnected')
    expect(result.isAligned).toBe(false)
    expect(result.hasFieldLineConnection).toBe(false)
    expect(result.hasPolarity).toBe(false)
    expect(result.hasDipAngle).toBe(80)
    expect(result.hasDisturbance).toBe(false)
    expect(result.disturbanceCount).toBe(0)
  })

  it('returns equatorial for minimal content', () => {
    const result = measureMagnetic(MINIMAL_CONTENT)
    expect(result.alignment).toBe(29)
    expect(result.pole).toBe('equatorial')
    expect(result.hasProperOrientation).toBe(true)
    expect(result.hasPolarity).toBe(true)
    expect(result.hasDipAngle).toBe(61)
  })

  it('returns south for rich content', () => {
    const result = measureMagnetic(RICH_CONTENT)
    expect(result.alignment).toBe(58)
    expect(result.pole).toBe('south')
    expect(result.hasFieldLineConnection).toBe(true)
    expect(result.hasMagneticReconnection).toBe(true)
    expect(result.hasFieldStrength).toBe(true)
    expect(result.hasMagnetopause).toBe(true)
    expect(result.hasVanAllenBelt).toBe(true)
    expect(result.hasDisturbance).toBe(true)
    expect(result.disturbanceCount).toBe(4)
  })
})

// ─── measureSolar ──────────────────────────────────────────────────────────

describe('measureSolar', () => {
  it('returns quiet-sun for empty content', () => {
    const result = measureSolar(EMPTY_CONTENT)
    expect(result.activity).toBe(5)
    expect(result.cycle).toBe('quiet-sun')
    expect(result.isActive).toBe(false)
    expect(result.hasSolarWind).toBe(false)
    expect(result.flareCount).toBe(0)
  })

  it('returns quiet-sun for minimal content', () => {
    const result = measureSolar(MINIMAL_CONTENT)
    expect(result.activity).toBe(12)
    expect(result.cycle).toBe('quiet-sun')
    expect(result.isActive).toBe(false)
    expect(result.hasQuietPeriod).toBe(true)
  })

  it('returns rising for rich content', () => {
    const result = measureSolar(RICH_CONTENT)
    expect(result.activity).toBe(59)
    expect(result.cycle).toBe('rising')
    expect(result.isActive).toBe(true)
    expect(result.hasCoronalMassEjection).toBe(true)
    expect(result.hasSolarWind).toBe(true)
    expect(result.hasSunspotCycle).toBe(true)
    expect(result.hasProtonEvent).toBe(true)
    expect(result.hasProminence).toBe(true)
  })
})

// ─── measureAtmosphere ─────────────────────────────────────────────────────

describe('measureAtmosphere', () => {
  it('returns opaque for empty content', () => {
    const result = measureAtmosphere(EMPTY_CONTENT)
    expect(result.clarity).toBe(5)
    expect(result.transparency).toBe('opaque')
    expect(result.isClear).toBe(false)
    expect(result.hasNoLightPollution).toBe(true)
    expect(result.hasNoCloudCover).toBe(true)
    expect(result.cloudCoverPercent).toBe(0)
  })

  it('returns overcast for minimal content', () => {
    const result = measureAtmosphere(MINIMAL_CONTENT)
    expect(result.clarity).toBe(12)
    expect(result.transparency).toBe('overcast')
    expect(result.hasNoLightPollution).toBe(true)
    expect(result.hasProperDensity).toBe(true)
    expect(result.hasOxygenEmission).toBe(true)
  })

  it('returns overcast for rich content with smells', () => {
    const result = measureAtmosphere(RICH_CONTENT)
    expect(result.clarity).toBe(24)
    expect(result.transparency).toBe('overcast')
    expect(result.hasNoLightPollution).toBe(false)
    expect(result.hasNoCloudCover).toBe(false)
    expect(result.hasHighAltitude).toBe(true)
    expect(result.hasNitrogenEmission).toBe(true)
    expect(result.hasAtmosphericRefraction).toBe(true)
    expect(result.hasAbsorption).toBe(true)
    expect(result.cloudCoverPercent).toBe(100)
  })
})

// ─── measureDisplay ────────────────────────────────────────────────────────

describe('measureDisplay', () => {
  it('returns glow for empty content', () => {
    const result = measureDisplay(EMPTY_CONTENT)
    expect(result.quality).toBe(5)
    expect(result.type).toBe('glow')
    expect(result.isSpectacular).toBe(false)
    expect(result.featureCount).toBe(0)
  })

  it('returns glow for minimal content', () => {
    const result = measureDisplay(MINIMAL_CONTENT)
    expect(result.quality).toBe(14)
    expect(result.type).toBe('glow')
    expect(result.isSpectacular).toBe(false)
  })

  it('returns curtain for rich content', () => {
    const result = measureDisplay(RICH_CONTENT)
    expect(result.quality).toBe(73)
    expect(result.type).toBe('curtain')
    expect(result.hasDynamicMovement).toBe(true)
    expect(result.hasVerticalStructure).toBe(true)
    expect(result.hasHorizontalExtent).toBe(true)
    expect(result.hasSlowEvolution).toBe(true)
    expect(result.hasMultimedia).toBe(true)
    expect(result.hasTimeLapse).toBe(true)
    expect(result.hasSymmetry).toBe(true)
    expect(result.hasFractal).toBe(true)
    expect(result.featureCount).toBe(8)
  })
})

// ─── classifyReadingCondition ──────────────────────────────────────────────

describe('classifyReadingCondition', () => {
  it('classifies all conditions', () => {
    expect(classifyReadingCondition(90)).toBe('spectacular-display')
    expect(classifyReadingCondition(80)).toBe('spectacular-display')
    expect(classifyReadingCondition(75)).toBe('vivid-aurora')
    expect(classifyReadingCondition(65)).toBe('vivid-aurora')
    expect(classifyReadingCondition(55)).toBe('visible-lights')
    expect(classifyReadingCondition(50)).toBe('visible-lights')
    expect(classifyReadingCondition(40)).toBe('faint-glow')
    expect(classifyReadingCondition(35)).toBe('faint-glow')
    expect(classifyReadingCondition(25)).toBe('subvisual')
    expect(classifyReadingCondition(20)).toBe('subvisual')
    expect(classifyReadingCondition(10)).toBe('dark-sky')
  })
})

// ─── analyzeAuroraReading ──────────────────────────────────────────────────

describe('analyzeAuroraReading', () => {
  it('analyzes empty content', () => {
    const result = analyzeAuroraReading(EMPTY_CONTENT, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.lightIntensity).toBe(5)
    expect(result.colorSpectrum).toBe(0)
    expect(result.magneticAlignment).toBe(10)
    expect(result.solarActivity).toBe(5)
    expect(result.atmosphericClarity).toBe(5)
    expect(result.displayQuality).toBe(5)
    expect(result.qualityScore).toBe(5)
    expect(result.condition).toBe('dark-sky')
  })

  it('analyzes minimal content', () => {
    const result = analyzeAuroraReading(MINIMAL_CONTENT, 'minimal.ts')
    expect(result.lightIntensity).toBe(20)
    expect(result.colorSpectrum).toBe(10)
    expect(result.magneticAlignment).toBe(29)
    expect(result.solarActivity).toBe(12)
    expect(result.atmosphericClarity).toBe(12)
    expect(result.displayQuality).toBe(14)
    expect(result.qualityScore).toBe(16)
    expect(result.condition).toBe('dark-sky')
  })

  it('analyzes rich content', () => {
    const result = analyzeAuroraReading(RICH_CONTENT, 'src/service.ts')
    expect(result.lightIntensity).toBe(51)
    expect(result.colorSpectrum).toBe(57)
    expect(result.magneticAlignment).toBe(58)
    expect(result.solarActivity).toBe(59)
    expect(result.atmosphericClarity).toBe(24)
    expect(result.displayQuality).toBe(73)
    expect(result.qualityScore).toBe(54)
    expect(result.condition).toBe('visible-lights')
  })

  it('includes all sub-measures', () => {
    const result = analyzeAuroraReading(RICH_CONTENT, 'test.ts')
    expect(result.light).toBeDefined()
    expect(result.color).toBeDefined()
    expect(result.magnetic).toBeDefined()
    expect(result.solar).toBeDefined()
    expect(result.atmosphere).toBeDefined()
    expect(result.display).toBeDefined()
  })
})

// ─── classifyZoneType ──────────────────────────────────────────────────────

describe('classifyZoneType', () => {
  it('returns dark-side for empty readings', () => {
    expect(classifyZoneType([])).toBe('dark-side')
  })

  it('returns dark-side for low scoring readings', () => {
    const reading = analyzeAuroraReading(EMPTY_CONTENT, 'a.ts')
    expect(classifyZoneType([reading])).toBe('dark-side')
  })

  it('returns mid-latitude for moderate scoring readings', () => {
    const reading = analyzeAuroraReading(RICH_CONTENT, 'a.ts')
    expect(classifyZoneType([reading])).toBe('mid-latitude')
  })

  it('returns sub-auroral for mixed readings', () => {
    const empty = analyzeAuroraReading(EMPTY_CONTENT, 'a.ts')
    const rich = analyzeAuroraReading(RICH_CONTENT, 'b.ts')
    expect(classifyZoneType([empty, rich])).toBe('sub-auroral')
  })
})

// ─── classifyZoneCondition ─────────────────────────────────────────────────

describe('classifyZoneCondition', () => {
  it('classifies all conditions', () => {
    expect(classifyZoneCondition(85)).toBe('northern-lights-festival')
    expect(classifyZoneCondition(80)).toBe('northern-lights-festival')
    expect(classifyZoneCondition(70)).toBe('aurora-season')
    expect(classifyZoneCondition(65)).toBe('aurora-season')
    expect(classifyZoneCondition(55)).toBe('occasional-sightings')
    expect(classifyZoneCondition(50)).toBe('occasional-sightings')
    expect(classifyZoneCondition(40)).toBe('rare-display')
    expect(classifyZoneCondition(35)).toBe('rare-display')
    expect(classifyZoneCondition(25)).toBe('never-seen')
    expect(classifyZoneCondition(20)).toBe('never-seen')
    expect(classifyZoneCondition(10)).toBe('light-polluted')
  })
})

// ─── classifyAstronomerGrade ───────────────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('classifies all grades', () => {
    expect(classifyAstronomerGrade(85)).toBe('chief-astronomer')
    expect(classifyAstronomerGrade(70)).toBe('aurora-hunter')
    expect(classifyAstronomerGrade(55)).toBe('astrophysicist')
    expect(classifyAstronomerGrade(40)).toBe('stargazer')
    expect(classifyAstronomerGrade(25)).toBe('amateur')
    expect(classifyAstronomerGrade(10)).toBe('blind-spotter')
  })
})

// ─── analyzeAuroraZone ─────────────────────────────────────────────────────

describe('analyzeAuroraZone', () => {
  it('returns correct zone for empty directory', () => {
    const reading = analyzeAuroraReading(EMPTY_CONTENT, 'a.ts')
    const zone = analyzeAuroraZone([reading], '.')
    expect(zone.directory).toBe('.')
    expect(zone.readings).toHaveLength(1)
    expect(zone.avgLightIntensity).toBe(5)
    expect(zone.avgColorSpectrum).toBe(0)
    expect(zone.avgDisplayQuality).toBe(5)
    expect(zone.spectacularCount).toBe(0)
    expect(zone.darkSkyCount).toBe(1)
    expect(zone.brilliantCount).toBe(0)
    expect(zone.clearAtmosphereCount).toBe(0)
    expect(zone.zoneType).toBe('dark-side')
    expect(zone.condition).toBe('light-polluted')
  })

  it('returns correct zone for rich content', () => {
    const reading = analyzeAuroraReading(RICH_CONTENT, 'src/a.ts')
    const zone = analyzeAuroraZone([reading], 'src')
    expect(zone.avgLightIntensity).toBe(51)
    expect(zone.avgColorSpectrum).toBe(57)
    expect(zone.avgDisplayQuality).toBe(73)
    expect(zone.spectacularCount).toBe(0)
    expect(zone.darkSkyCount).toBe(0)
    expect(zone.zoneType).toBe('mid-latitude')
    expect(zone.condition).toBe('occasional-sightings')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns dark sky recommendation for empty files', () => {
    const reading = analyzeAuroraReading(EMPTY_CONTENT, 'empty.ts')
    const recommendations = generateRecommendations([reading], [], { avgLightIntensity: 5, avgColorSpectrum: 0, avgDisplayQuality: 5, isSpectacular: false, overallLuminosity: 5 }, {
      totalFiles: 1, totalZones: 1, avgLightIntensity: 5, avgColorSpectrum: 0, avgMagneticAlignment: 10, avgSolarActivity: 5, avgAtmosphericClarity: 5, avgDisplayQuality: 5,
      spectacularDisplayCount: 0, vividAuroraCount: 0, visibleLightsCount: 0, faintGlowCount: 0, subvisualCount: 0, darkSkyCount: 1,
      isBrilliantCount: 0, hasFullSpectrumCount: 0, isAlignedCount: 0, hasDisturbanceCount: 0, isActiveCount: 0, hasSolarFlareCount: 0,
      isClearCount: 0, hasNoLightPollutionCount: 1, isSpectacularCount: 0, hasDynamicMovementCount: 0, hasSymmetryCount: 0,
      overallLuminosity: 5, astronomerGrade: 'blind-spotter',
      bestReading: 'empty.ts', brightestLight: 'empty.ts', richestColor: 'empty.ts', bestAligned: 'empty.ts', mostActive: 'empty.ts',
    })
    expect(recommendations).toContain('Light up the dark sky — add exports, functions, and type annotations to dormant files')
  })

  it('returns pristine recommendation for clean code', () => {
    const clean = 'export function clean(): string { return "pure"; }'
    const reading = analyzeAuroraReading(clean, 'clean.ts')
    const recommendations = generateRecommendations([reading], [], { avgLightIntensity: 20, avgColorSpectrum: 10, avgDisplayQuality: 14, isSpectacular: false, overallLuminosity: 16 }, {
      totalFiles: 1, totalZones: 1, avgLightIntensity: 20, avgColorSpectrum: 10, avgMagneticAlignment: 29, avgSolarActivity: 12, avgAtmosphericClarity: 12, avgDisplayQuality: 14,
      spectacularDisplayCount: 0, vividAuroraCount: 0, visibleLightsCount: 0, faintGlowCount: 0, subvisualCount: 0, darkSkyCount: 1,
      isBrilliantCount: 0, hasFullSpectrumCount: 0, isAlignedCount: 0, hasDisturbanceCount: 0, isActiveCount: 0, hasSolarFlareCount: 0,
      isClearCount: 0, hasNoLightPollutionCount: 1, isSpectacularCount: 0, hasDynamicMovementCount: 0, hasSymmetryCount: 0,
      overallLuminosity: 16, astronomerGrade: 'blind-spotter',
      bestReading: 'clean.ts', brightestLight: 'clean.ts', richestColor: 'clean.ts', bestAligned: 'clean.ts', mostActive: 'clean.ts',
    })
    expect(recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildAuroraBorealisResult ──────────────────────────────────────────────

describe('buildAuroraBorealisResult', () => {
  it('handles empty file list', () => {
    const result = buildAuroraBorealisResult([], [])
    expect(result.readings).toHaveLength(0)
    expect(result.zones).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalZones).toBe(0)
    expect(result.stats.overallLuminosity).toBe(0)
    expect(result.observatory.isSpectacular).toBe(false)
  })

  it('handles single empty file', () => {
    const result = buildAuroraBorealisResult(['empty.ts'], [EMPTY_CONTENT])
    expect(result.readings).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalZones).toBe(1)
    expect(result.stats.avgLightIntensity).toBe(5)
    expect(result.stats.avgColorSpectrum).toBe(0)
    expect(result.stats.avgMagneticAlignment).toBe(10)
    expect(result.stats.avgSolarActivity).toBe(5)
    expect(result.stats.avgAtmosphericClarity).toBe(5)
    expect(result.stats.avgDisplayQuality).toBe(5)
    expect(result.stats.overallLuminosity).toBe(5)
    expect(result.stats.astronomerGrade).toBe('blind-spotter')
    expect(result.stats.darkSkyCount).toBe(1)
    expect(result.stats.hasNoLightPollutionCount).toBe(1)
    expect(result.stats.bestReading).toBe('empty.ts')
    expect(result.observatory.isSpectacular).toBe(false)
  })

  it('handles mixed files with directory grouping', () => {
    const result = buildAuroraBorealisResult(
      ['empty.ts', 'minimal.ts', 'src/service.ts'],
      [EMPTY_CONTENT, MINIMAL_CONTENT, RICH_CONTENT],
    )
    expect(result.readings).toHaveLength(3)
    expect(result.zones).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalZones).toBe(2)
    expect(result.stats.avgLightIntensity).toBe(25)
    expect(result.stats.avgColorSpectrum).toBe(22)
    expect(result.stats.avgMagneticAlignment).toBe(32)
    expect(result.stats.avgSolarActivity).toBe(25)
    expect(result.stats.avgAtmosphericClarity).toBe(14)
    expect(result.stats.avgDisplayQuality).toBe(31)
    expect(result.stats.overallLuminosity).toBe(25)
    expect(result.stats.astronomerGrade).toBe('amateur')
    expect(result.stats.visibleLightsCount).toBe(1)
    expect(result.stats.darkSkyCount).toBe(2)
    expect(result.stats.hasDisturbanceCount).toBe(1)
    expect(result.stats.isActiveCount).toBe(1)
    expect(result.stats.hasNoLightPollutionCount).toBe(2)
    expect(result.stats.hasDynamicMovementCount).toBe(1)
    expect(result.stats.hasSymmetryCount).toBe(1)
    expect(result.stats.bestReading).toBe('src/service.ts')
    expect(result.stats.brightestLight).toBe('src/service.ts')
    expect(result.stats.richestColor).toBe('src/service.ts')
    expect(result.stats.bestAligned).toBe('src/service.ts')
    expect(result.stats.mostActive).toBe('src/service.ts')
  })

  it('groups files by directory', () => {
    const result = buildAuroraBorealisResult(
      ['empty.ts', 'src/service.ts'],
      [EMPTY_CONTENT, RICH_CONTENT],
    )
    expect(result.zones).toHaveLength(2)
    const dirs = result.zones.map((z) => z.directory)
    expect(dirs).toContain('.')
    expect(dirs).toContain('src')
  })

  it('includes observatory data', () => {
    const result = buildAuroraBorealisResult(
      ['empty.ts', 'minimal.ts', 'src/service.ts'],
      [EMPTY_CONTENT, MINIMAL_CONTENT, RICH_CONTENT],
    )
    expect(result.observatory.avgLightIntensity).toBe(25)
    expect(result.observatory.avgColorSpectrum).toBe(22)
    expect(result.observatory.avgDisplayQuality).toBe(31)
    expect(result.observatory.isSpectacular).toBe(false)
    expect(result.observatory.overallLuminosity).toBe(25)
  })

  it('includes recommendations for dark sky', () => {
    const result = buildAuroraBorealisResult(
      ['empty.ts'],
      [EMPTY_CONTENT],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('Light up the dark sky — add exports, functions, and type annotations to dormant files')
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
    expect(typeof conditionColor('spectacular-display')).toBe('string')
    expect(typeof conditionColor('vivid-aurora')).toBe('string')
    expect(typeof conditionColor('visible-lights')).toBe('string')
    expect(typeof conditionColor('faint-glow')).toBe('string')
    expect(typeof conditionColor('subvisual')).toBe('string')
    expect(typeof conditionColor('dark-sky')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('brightnessColor returns string for all levels', () => {
    expect(typeof brightnessColor('dazzling')).toBe('string')
    expect(typeof brightnessColor('bright')).toBe('string')
    expect(typeof brightnessColor('moderate')).toBe('string')
    expect(typeof brightnessColor('faint')).toBe('string')
    expect(typeof brightnessColor('dim')).toBe('string')
    expect(typeof brightnessColor('dark')).toBe('string')
    expect(typeof brightnessColor('unknown')).toBe('string')
  })

  it('dominantColor returns string for all colors', () => {
    expect(typeof dominantColor('green')).toBe('string')
    expect(typeof dominantColor('purple')).toBe('string')
    expect(typeof dominantColor('red')).toBe('string')
    expect(typeof dominantColor('blue')).toBe('string')
    expect(typeof dominantColor('yellow')).toBe('string')
    expect(typeof dominantColor('white')).toBe('string')
    expect(typeof dominantColor('unknown')).toBe('string')
  })

  it('astronomerGradeColor returns string for all grades', () => {
    expect(typeof astronomerGradeColor('chief-astronomer')).toBe('string')
    expect(typeof astronomerGradeColor('aurora-hunter')).toBe('string')
    expect(typeof astronomerGradeColor('astrophysicist')).toBe('string')
    expect(typeof astronomerGradeColor('stargazer')).toBe('string')
    expect(typeof astronomerGradeColor('amateur')).toBe('string')
    expect(typeof astronomerGradeColor('blind-spotter')).toBe('string')
    expect(typeof astronomerGradeColor('unknown')).toBe('string')
  })

  it('zoneCondColor returns string for all conditions', () => {
    expect(typeof zoneCondColor('northern-lights-festival')).toBe('string')
    expect(typeof zoneCondColor('aurora-season')).toBe('string')
    expect(typeof zoneCondColor('occasional-sightings')).toBe('string')
    expect(typeof zoneCondColor('rare-display')).toBe('string')
    expect(typeof zoneCondColor('never-seen')).toBe('string')
    expect(typeof zoneCondColor('light-polluted')).toBe('string')
    expect(typeof zoneCondColor('unknown')).toBe('string')
  })

  it('formatReading returns formatted string', () => {
    const reading = analyzeAuroraReading(MINIMAL_CONTENT, 'test.ts')
    const result = formatReading(reading, false)
    expect(typeof result).toBe('string')
    expect(result).toContain('test.ts')
  })

  it('formatReading verbose shows warnings', () => {
    const reading = analyzeAuroraReading(RICH_CONTENT, 'rich.ts')
    const result = formatReading(reading, true)
    expect(typeof result).toBe('string')
    expect(result).toContain('rich.ts')
  })

  it('formatZone returns formatted string', () => {
    const reading = analyzeAuroraReading(MINIMAL_CONTENT, 'test.ts')
    const zone = analyzeAuroraZone([reading], '.')
    const result = formatZone(zone, false)
    expect(typeof result).toBe('string')
    expect(result).toContain('.')
  })

  it('formatStats returns formatted string', () => {
    const result = buildAuroraBorealisResult(['test.ts'], [MINIMAL_CONTENT])
    const formatted = formatStats(result.stats)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('Aurora Borealis Observatory')
  })

  it('formatAuroraBorealisTable returns table string', () => {
    const result = buildAuroraBorealisResult(['test.ts'], [MINIMAL_CONTENT])
    const formatted = formatAuroraBorealisTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('Aurora Borealis Analysis')
  })

  it('formatAuroraBorealisJson returns valid JSON', () => {
    const result = buildAuroraBorealisResult(['test.ts'], [MINIMAL_CONTENT])
    const formatted = formatAuroraBorealisJson(result)
    expect(typeof formatted).toBe('string')
    const parsed = JSON.parse(formatted)
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Quality Score ─────────────────────────────────────────────────────────

describe('quality score calculation', () => {
  it('is average of all 6 measures', () => {
    const result = analyzeAuroraReading(MINIMAL_CONTENT, 'test.ts')
    const expected = Math.round(
      (result.lightIntensity + result.colorSpectrum + result.magneticAlignment + result.solarActivity + result.atmosphericClarity + result.displayQuality) / 6,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('gives higher scores to richer code', () => {
    const emptyScore = analyzeAuroraReading(EMPTY_CONTENT, 'empty.ts').qualityScore
    const richScore = analyzeAuroraReading(RICH_CONTENT, 'rich.ts').qualityScore
    expect(richScore).toBeGreaterThan(emptyScore)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const result = analyzeAuroraReading('   \n  \n  ', 'whitespace.ts')
    expect(result).toBeDefined()
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles very large content', () => {
    const largeContent = Array.from({ length: 100 }, () => MINIMAL_CONTENT).join('\n')
    const result = analyzeAuroraReading(largeContent, 'large.ts')
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
    const result = analyzeAuroraReading(smellyContent, 'smelly.ts')
    expect(result.atmosphere.hasAbsorption).toBe(true)
    expect(result.magnetic.hasDisturbance).toBe(true)
  })

  it('handles content with all test keywords', () => {
    const testContent = `describe('suite', () => {
  it('test1', () => { expect(true).toBe(true); });
  test('test2', () => { expect(1).toBe(1); });
});`
    const result = analyzeAuroraReading(testContent, 'test-file.ts')
    expect(result).toBeDefined()
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles content with many async functions', () => {
    const asyncContent = `export async function a(): Promise<void> {}
export async function b(): Promise<void> {}
export async function c(): Promise<void> {}`
    const result = analyzeAuroraReading(asyncContent, 'async.ts')
    expect(result.solar.isActive).toBe(true)
    expect(result.color.hasYellowEmission).toBe(true)
    expect(result.display.hasDynamicMovement).toBe(true)
  })

  it('handles content with enums and namespaces', () => {
    const diverseContent = `export enum Status { Active, Inactive }
export namespace Config { export const timeout = 5000; }
export interface Options { verbose: boolean; }
export class Handler { constructor(private opts: Options) {} }`
    const result = analyzeAuroraReading(diverseContent, 'diverse.ts')
    expect(result.color.hasRedEmission).toBe(true)
    expect(result.color.hasPurpleEmission).toBe(true)
    expect(result.color.emissionCount).toBeGreaterThanOrEqual(2)
  })

  it('computes correct dipAngle from alignment', () => {
    const result = measureMagnetic(MINIMAL_CONTENT)
    expect(result.hasDipAngle).toBe(90 - result.alignment)
  })

  it('gives rich content higher display quality than empty', () => {
    const emptyDisplay = measureDisplay(EMPTY_CONTENT).quality
    const richDisplay = measureDisplay(RICH_CONTENT).quality
    expect(richDisplay).toBeGreaterThan(emptyDisplay)
  })

  it('correctly identifies solar wind for import/export pairs', () => {
    const result = measureSolar(RICH_CONTENT)
    expect(result.hasSolarWind).toBe(true)
  })

  it('classifies quiet-sun for content below activity threshold', () => {
    const result = measureSolar('const x = 1;')
    expect(result.cycle).toBe('quiet-sun')
    expect(result.isActive).toBe(false)
  })

  it('measures cloudCoverPercent from smells and todos', () => {
    const result = measureAtmosphere(RICH_CONTENT)
    expect(result.cloudCoverPercent).toBeGreaterThan(0)
  })

  it('handles single file buildAuroraBorealisResult correctly', () => {
    const result = buildAuroraBorealisResult(['test.ts'], [RICH_CONTENT])
    expect(result.readings).toHaveLength(1)
    expect(result.zones).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.observatory.overallLuminosity).toBe(result.readings[0].qualityScore)
  })
})
