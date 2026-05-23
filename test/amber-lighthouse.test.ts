import { describe, it, expect } from 'vitest'

import {
  measureBeacon,
  measureFog,
  measureWarning,
  measureFoundation,
  measureCoverage,
  measureGuidance,
  classifyCondition,
  analyzeBeaconRay,
  classifyCoastlineType,
  analyzeCoastline,
  classifyKeeperGrade,
  generateRecommendations,
  buildAmberLighthouseResult,
} from '../src/commands/amber-lighthouse-helpers.js'

import {
  scoreColor,
  intensityColor,
  clarityColor,
  effectivenessColor,
  bedrockColor,
  sweepColor,
  ratingColor,
  conditionColor,
  keeperGradeColor,
  coastlineTypeColor,
  coastConditionColor,
  formatAmberLighthouseJson,
  formatAmberLighthouseTable,
} from '../src/commands/amber-lighthouse-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User { id: number; name: string }
export type UserRole = 'admin' | 'user'
export class UserService {
  private users: Map<number, User> = new Map()
  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      return user ?? null
    } catch (error) {
      return null
    }
  }
}
import { injectable } from 'tsyringe'
/** Documentation */
export async function processUser(user: User): Promise<void> {
  await Promise.resolve(user)
}
`

const MEDIUM = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY = ''

const BAD = `// HACK: bad code
// FIXME: fix this
: any
eval("x")
a ? b : c ? d : e
try {} catch(e) {}
console.log('bad')
`

// ─── measureBeacon ─────────────────────────────────────────────────────────

describe('measureBeacon', () => {
  it('scores RICH content as 100', () => {
    const result = measureBeacon(RICH)
    expect(result.strength).toBe(100)
  })

  it('classifies RICH as million-candlepower', () => {
    const result = measureBeacon(RICH)
    expect(result.intensity).toBe('million-candlepower')
  })

  it('scores EMPTY as 42', () => {
    const result = measureBeacon(EMPTY)
    expect(result.strength).toBe(42)
  })

  it('classifies EMPTY as dim-bulb', () => {
    const result = measureBeacon(EMPTY)
    expect(result.intensity).toBe('dim-bulb')
  })

  it('sets hasHighStrength true for RICH', () => {
    expect(measureBeacon(RICH).hasHighStrength).toBe(true)
  })

  it('detects visible entry in RICH', () => {
    expect(measureBeacon(RICH).hasVisibleEntry).toBe(true)
  })

  it('detects proper signaling in RICH', () => {
    expect(measureBeacon(RICH).hasProperSignaling).toBe(true)
  })

  it('detects no dark zones in RICH', () => {
    expect(measureBeacon(RICH).hasNoDarkZones).toBe(true)
  })

  it('detects clear purpose in RICH', () => {
    expect(measureBeacon(RICH).hasClearPurpose).toBe(true)
  })

  it('detects no flickering in RICH', () => {
    expect(measureBeacon(RICH).hasNoFlickering).toBe(true)
  })

  it('counts dark zones in BAD content', () => {
    const result = measureBeacon(BAD)
    expect(result.darkZoneCount).toBeGreaterThan(0)
  })

  it('counts flickering in BAD content', () => {
    const result = measureBeacon(BAD)
    expect(result.flickeringCount).toBeGreaterThan(0)
  })

  it('classifies MEDIUM as dim-bulb', () => {
    expect(measureBeacon(MEDIUM).intensity).toBe('dim-bulb')
  })

  it('sets hasHighStrength false for EMPTY', () => {
    expect(measureBeacon(EMPTY).hasHighStrength).toBe(false)
  })
})

// ─── measureFog ────────────────────────────────────────────────────────────

describe('measureFog', () => {
  it('scores RICH content as 100', () => {
    const result = measureFog(RICH)
    expect(result.penetration).toBe(100)
  })

  it('classifies RICH as crystal-piercing', () => {
    const result = measureFog(RICH)
    expect(result.clarity).toBe('crystal-piercing')
  })

  it('scores EMPTY as 43', () => {
    const result = measureFog(EMPTY)
    expect(result.penetration).toBe(43)
  })

  it('classifies EMPTY as dim', () => {
    const result = measureFog(EMPTY)
    expect(result.clarity).toBe('dim')
  })

  it('sets hasHighPenetration true for RICH', () => {
    expect(measureFog(RICH).hasHighPenetration).toBe(true)
  })

  it('detects clear in complexity for RICH', () => {
    expect(measureFog(RICH).hasClearInComplexity).toBe(true)
  })

  it('detects proper abstraction for RICH', () => {
    expect(measureFog(RICH).hasProperAbstraction).toBe(true)
  })

  it('detects no confusion in RICH', () => {
    expect(measureFog(RICH).hasNoConfusion).toBe(true)
  })

  it('detects navigable in RICH', () => {
    expect(measureFog(RICH).hasNavigable).toBe(true)
  })

  it('counts confusion in BAD content', () => {
    const result = measureFog(BAD)
    expect(result.confusionCount).toBeGreaterThan(0)
  })

  it('counts obfuscation in BAD content', () => {
    const result = measureFog(BAD)
    expect(result.obfuscationCount).toBeGreaterThan(0)
  })

  it('classifies MEDIUM as dim', () => {
    expect(measureFog(MEDIUM).clarity).toBe('dim')
  })
})

// ─── measureWarning ────────────────────────────────────────────────────────

describe('measureWarning', () => {
  it('scores RICH content as 100', () => {
    const result = measureWarning(RICH)
    expect(result.system).toBe(100)
  })

  it('classifies RICH as fail-safe-system', () => {
    const result = measureWarning(RICH)
    expect(result.effectiveness).toBe('fail-safe-system')
  })

  it('scores EMPTY as 42', () => {
    const result = measureWarning(EMPTY)
    expect(result.system).toBe(42)
  })

  it('classifies EMPTY as faint-horn', () => {
    const result = measureWarning(EMPTY)
    expect(result.effectiveness).toBe('faint-horn')
  })

  it('sets hasHighSystem true for RICH', () => {
    expect(measureWarning(RICH).hasHighSystem).toBe(true)
  })

  it('detects proper error handling in RICH', () => {
    expect(measureWarning(RICH).hasProperErrorHandling).toBe(true)
  })

  it('detects no silent failure in RICH', () => {
    expect(measureWarning(RICH).hasNoSilentFailure).toBe(true)
  })

  it('detects no swallowed errors in RICH', () => {
    expect(measureWarning(RICH).hasNoSwallowedErrors).toBe(true)
  })

  it('detects proper validation in RICH', () => {
    expect(measureWarning(RICH).hasProperValidation).toBe(true)
  })

  it('counts silent failures in BAD content', () => {
    const result = measureWarning(BAD)
    expect(result.silentFailureCount).toBeGreaterThan(0)
  })

  it('counts swallowed errors in BAD content', () => {
    const result = measureWarning(BAD)
    expect(result.swallowedCount).toBeGreaterThan(0)
  })

  it('classifies MEDIUM as faint-horn', () => {
    expect(measureWarning(MEDIUM).effectiveness).toBe('faint-horn')
  })
})

// ─── measureFoundation ─────────────────────────────────────────────────────

describe('measureFoundation', () => {
  it('scores RICH content as 100', () => {
    const result = measureFoundation(RICH)
    expect(result.stability).toBe(100)
  })

  it('classifies RICH as granite-bedrock', () => {
    const result = measureFoundation(RICH)
    expect(result.bedrock).toBe('granite-bedrock')
  })

  it('scores EMPTY as 42', () => {
    const result = measureFoundation(EMPTY)
    expect(result.stability).toBe(42)
  })

  it('classifies EMPTY as sandbar', () => {
    const result = measureFoundation(EMPTY)
    expect(result.bedrock).toBe('sandbar')
  })

  it('sets hasHighStability true for RICH', () => {
    expect(measureFoundation(RICH).hasHighStability).toBe(true)
  })

  it('detects solid base in RICH', () => {
    expect(measureFoundation(RICH).hasSolidBase).toBe(true)
  })

  it('detects no erosion in RICH', () => {
    expect(measureFoundation(RICH).hasNoErosion).toBe(true)
  })

  it('detects weathered in RICH', () => {
    expect(measureFoundation(RICH).hasWeathered).toBe(true)
  })

  it('detects no degradation in RICH', () => {
    expect(measureFoundation(RICH).hasNoDegradation).toBe(true)
  })

  it('counts erosion in BAD content', () => {
    const result = measureFoundation(BAD)
    expect(result.erosionCount).toBeGreaterThan(0)
  })

  it('counts cracking in BAD content', () => {
    const result = measureFoundation(BAD)
    expect(result.crackingCount).toBeGreaterThan(0)
  })

  it('classifies MEDIUM as sandbar', () => {
    expect(measureFoundation(MEDIUM).bedrock).toBe('sandbar')
  })
})

// ─── measureCoverage ───────────────────────────────────────────────────────

describe('measureCoverage', () => {
  it('scores RICH content as 100', () => {
    const result = measureCoverage(RICH)
    expect(result.level).toBe(100)
  })

  it('classifies RICH as 360-degree', () => {
    const result = measureCoverage(RICH)
    expect(result.sweep).toBe('360-degree')
  })

  it('scores EMPTY as 32', () => {
    const result = measureCoverage(EMPTY)
    expect(result.level).toBe(32)
  })

  it('classifies EMPTY as narrow-beam', () => {
    const result = measureCoverage(EMPTY)
    expect(result.sweep).toBe('narrow-beam')
  })

  it('sets hasHighLevel true for RICH', () => {
    expect(measureCoverage(RICH).hasHighLevel).toBe(true)
  })

  it('detects complete paths in RICH', () => {
    expect(measureCoverage(RICH).hasCompletePaths).toBe(true)
  })

  it('detects no dead angles in RICH', () => {
    expect(measureCoverage(RICH).hasNoDeadAngles).toBe(true)
  })

  it('detects comprehensive in RICH', () => {
    expect(measureCoverage(RICH).hasComprehensive).toBe(true)
  })

  it('counts dead angles in BAD content', () => {
    const result = measureCoverage(BAD)
    expect(result.deadAngleCount).toBeGreaterThan(0)
  })

  it('counts blind spots in BAD content', () => {
    const result = measureCoverage(BAD)
    expect(result.blindSpotCount).toBeGreaterThan(0)
  })

  it('classifies MEDIUM as narrow-beam', () => {
    expect(measureCoverage(MEDIUM).sweep).toBe('narrow-beam')
  })
})

// ─── measureGuidance ───────────────────────────────────────────────────────

describe('measureGuidance', () => {
  it('scores RICH content as 100', () => {
    const result = measureGuidance(RICH)
    expect(result.quality).toBe(100)
  })

  it('classifies RICH as master-pilot', () => {
    const result = measureGuidance(RICH)
    expect(result.rating).toBe('master-pilot')
  })

  it('scores EMPTY as 42', () => {
    const result = measureGuidance(EMPTY)
    expect(result.quality).toBe(42)
  })

  it('classifies EMPTY as unreliable', () => {
    const result = measureGuidance(EMPTY)
    expect(result.rating).toBe('unreliable')
  })

  it('sets hasHighQuality true for RICH', () => {
    expect(measureGuidance(RICH).hasHighQuality).toBe(true)
  })

  it('detects clear directions in RICH', () => {
    expect(measureGuidance(RICH).hasClearDirections).toBe(true)
  })

  it('detects no ambiguity in RICH', () => {
    expect(measureGuidance(RICH).hasNoAmbiguity).toBe(true)
  })

  it('detects consistent in RICH', () => {
    expect(measureGuidance(RICH).hasConsistent).toBe(true)
  })

  it('counts ambiguity in BAD content', () => {
    const result = measureGuidance(BAD)
    expect(result.ambiguityCount).toBeGreaterThan(0)
  })

  it('counts contradiction in BAD content', () => {
    const result = measureGuidance(BAD)
    expect(result.contradictionCount).toBeGreaterThan(0)
  })

  it('classifies MEDIUM as unreliable', () => {
    expect(measureGuidance(MEDIUM).rating).toBe('unreliable')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns coastal-masterpiece for score >= 80', () => {
    const ray = { qualityScore: 80 } as any
    expect(classifyCondition(ray)).toBe('coastal-masterpiece')
  })

  it('returns reliable-beacon for score >= 65', () => {
    const ray = { qualityScore: 65 } as any
    expect(classifyCondition(ray)).toBe('reliable-beacon')
  })

  it('returns functional-light for score >= 50', () => {
    const ray = { qualityScore: 50 } as any
    expect(classifyCondition(ray)).toBe('functional-light')
  })

  it('returns flickering-candle for score >= 35', () => {
    const ray = { qualityScore: 35 } as any
    expect(classifyCondition(ray)).toBe('flickering-candle')
  })

  it('returns broken-lens for score >= 20', () => {
    const ray = { qualityScore: 20 } as any
    expect(classifyCondition(ray)).toBe('broken-lens')
  })

  it('returns dark-tower for score < 20', () => {
    const ray = { qualityScore: 10 } as any
    expect(classifyCondition(ray)).toBe('dark-tower')
  })
})

// ─── analyzeBeaconRay ──────────────────────────────────────────────────────

describe('analyzeBeaconRay', () => {
  it('analyzes RICH content correctly', () => {
    const ray = analyzeBeaconRay(RICH, 'rich.ts')
    expect(ray.beaconStrength).toBe(100)
    expect(ray.fogPenetration).toBe(100)
    expect(ray.warningSystem).toBe(100)
    expect(ray.foundationStability).toBe(100)
    expect(ray.rotatingCoverage).toBe(100)
    expect(ray.guidanceQuality).toBe(100)
    expect(ray.qualityScore).toBe(100)
    expect(ray.condition).toBe('coastal-masterpiece')
    expect(ray.file).toBe('rich.ts')
  })

  it('analyzes MEDIUM content correctly', () => {
    const ray = analyzeBeaconRay(MEDIUM, 'medium.ts')
    expect(ray.beaconStrength).toBe(47)
    expect(ray.fogPenetration).toBe(37)
    expect(ray.warningSystem).toBe(47)
    expect(ray.foundationStability).toBe(47)
    expect(ray.rotatingCoverage).toBe(37)
    expect(ray.guidanceQuality).toBe(47)
    expect(ray.qualityScore).toBe(44)
    expect(ray.condition).toBe('flickering-candle')
  })

  it('analyzes EMPTY content correctly', () => {
    const ray = analyzeBeaconRay(EMPTY, 'empty.ts')
    expect(ray.beaconStrength).toBe(42)
    expect(ray.fogPenetration).toBe(43)
    expect(ray.warningSystem).toBe(42)
    expect(ray.foundationStability).toBe(42)
    expect(ray.rotatingCoverage).toBe(32)
    expect(ray.guidanceQuality).toBe(42)
    expect(ray.qualityScore).toBe(41)
    expect(ray.condition).toBe('flickering-candle')
  })

  it('includes all measure sub-objects', () => {
    const ray = analyzeBeaconRay(RICH, 'rich.ts')
    expect(ray.beacon).toBeDefined()
    expect(ray.fog).toBeDefined()
    expect(ray.warning).toBeDefined()
    expect(ray.foundation).toBeDefined()
    expect(ray.coverage).toBeDefined()
    expect(ray.guidance).toBeDefined()
  })
})

// ─── classifyCoastlineType ─────────────────────────────────────────────────

describe('classifyCoastlineType', () => {
  it('returns darkness for no rays', () => {
    expect(classifyCoastlineType([])).toBe('darkness')
  })

  it('returns harbor-light for RICH+MEDIUM mix', () => {
    const rays = [
      analyzeBeaconRay(RICH, 'rich.ts'),
      analyzeBeaconRay(MEDIUM, 'medium.ts'),
    ]
    expect(classifyCoastlineType(rays)).toBe('harbor-light')
  })

  it('returns channel-marker for all EMPTY', () => {
    const rays = Array.from({ length: 4 }, (_, i) => analyzeBeaconRay(EMPTY, `e${i}.ts`))
    expect(classifyCoastlineType(rays)).toBe('channel-marker')
  })

  it('returns major-lighthouse for all RICH', () => {
    const rays = Array.from({ length: 4 }, (_, i) => analyzeBeaconRay(RICH, `r${i}.ts`))
    expect(classifyCoastlineType(rays)).toBe('major-lighthouse')
  })
})

// ─── analyzeCoastline ──────────────────────────────────────────────────────

describe('analyzeCoastline', () => {
  it('returns empty coastline for no rays', () => {
    const coastline = analyzeCoastline([], 'test-dir')
    expect(coastline.directory).toBe('test-dir')
    expect(coastline.coastlineType).toBe('darkness')
    expect(coastline.condition).toBe('void')
    expect(coastline.rays).toHaveLength(0)
    expect(coastline.avgBeacon).toBe(0)
  })

  it('computes averages correctly for RICH+MEDIUM', () => {
    const rays = [
      analyzeBeaconRay(RICH, 'rich.ts'),
      analyzeBeaconRay(MEDIUM, 'medium.ts'),
    ]
    const coastline = analyzeCoastline(rays, '.')
    expect(coastline.avgBeacon).toBe(74)
    expect(coastline.avgWarning).toBe(74)
    expect(coastline.avgGuidance).toBe(74)
    expect(coastline.coastlineType).toBe('harbor-light')
    expect(coastline.condition).toBe('well-lit-harbor')
  })

  it('counts masterpieces and dark correctly', () => {
    const rays = [
      analyzeBeaconRay(RICH, 'rich.ts'),
      analyzeBeaconRay(MEDIUM, 'medium.ts'),
    ]
    const coastline = analyzeCoastline(rays, '.')
    expect(coastline.masterpieceCount).toBe(1)
    expect(coastline.darkCount).toBe(0)
  })

  it('counts bright and reliable correctly', () => {
    const rays = [
      analyzeBeaconRay(RICH, 'rich.ts'),
      analyzeBeaconRay(MEDIUM, 'medium.ts'),
    ]
    const coastline = analyzeCoastline(rays, '.')
    expect(coastline.brightCount).toBe(1)
    expect(coastline.reliableCount).toBe(1)
  })
})

// ─── classifyKeeperGrade ───────────────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns master-keeper for 80+', () => expect(classifyKeeperGrade(80)).toBe('master-keeper'))
  it('returns lighthouse-keeper for 65+', () => expect(classifyKeeperGrade(65)).toBe('lighthouse-keeper'))
  it('returns watchman for 50+', () => expect(classifyKeeperGrade(50)).toBe('watchman'))
  it('returns tender for 35+', () => expect(classifyKeeperGrade(35)).toBe('tender'))
  it('returns observer for 20+', () => expect(classifyKeeperGrade(20)).toBe('observer'))
  it('returns absentee for 0+', () => expect(classifyKeeperGrade(10)).toBe('absentee'))
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-scoring codebase', () => {
    const result = buildAmberLighthouseResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY, EMPTY, EMPTY, EMPTY],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations.some((r) => r.includes('beacon'))).toBe(true)
  })

  it('returns empty recommendations for RICH codebase', () => {
    const result = buildAmberLighthouseResult(['rich.ts'], [RICH])
    expect(result.recommendations).toHaveLength(0)
  })

  it('recommends restoration for dark-tower-heavy codebase', () => {
    const result = buildAmberLighthouseResult(
      Array.from({ length: 10 }, (_, i) => `f${i}.ts`),
      Array.from({ length: 10 }, () => EMPTY),
    )
    expect(Array.isArray(result.recommendations)).toBe(true)
  })
})

// ─── buildAmberLighthouseResult ────────────────────────────────────────────

describe('buildAmberLighthouseResult', () => {
  it('handles RICH + MEDIUM correctly', () => {
    const result = buildAmberLighthouseResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalCoastlines).toBe(1)
    expect(result.stats.avgBeaconStrength).toBe(74)
    expect(result.stats.avgFogPenetration).toBe(69)
    expect(result.stats.avgWarningSystem).toBe(74)
    expect(result.stats.avgFoundationStability).toBe(74)
    expect(result.stats.avgRotatingCoverage).toBe(69)
    expect(result.stats.avgGuidanceQuality).toBe(74)
    expect(result.stats.coastalMasterpieceCount).toBe(1)
    expect(result.stats.flickeringCandleCount).toBe(1)
    expect(result.stats.overallIllumination).toBe(73)
    expect(result.stats.keeperGrade).toBe('lighthouse-keeper')
  })

  it('handles 4 EMPTY files correctly', () => {
    const result = buildAmberLighthouseResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY, EMPTY, EMPTY, EMPTY],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.avgBeaconStrength).toBe(42)
    expect(result.stats.avgFogPenetration).toBe(43)
    expect(result.stats.avgWarningSystem).toBe(42)
    expect(result.stats.avgFoundationStability).toBe(42)
    expect(result.stats.avgRotatingCoverage).toBe(32)
    expect(result.stats.avgGuidanceQuality).toBe(42)
    expect(result.stats.flickeringCandleCount).toBe(4)
    expect(result.stats.darkTowerCount).toBe(0)
    expect(result.stats.overallIllumination).toBe(41)
    expect(result.stats.keeperGrade).toBe('tender')
    expect(result.coast.isIlluminated).toBe(false)
  })

  it('computes coast overview correctly', () => {
    const result = buildAmberLighthouseResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.coast.avgBeacon).toBe(74)
    expect(result.coast.avgWarning).toBe(74)
    expect(result.coast.avgGuidance).toBe(74)
    expect(result.coast.overallIllumination).toBe(73)
    expect(result.coast.isIlluminated).toBe(true)
  })

  it('sets highlight fields correctly', () => {
    const result = buildAmberLighthouseResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.bestRay).toBe('rich.ts')
    expect(result.stats.brightest).toBe('rich.ts')
    expect(result.stats.clearestInFog).toBe('rich.ts')
    expect(result.stats.bestWarnings).toBe('rich.ts')
    expect(result.stats.mostStable).toBe('rich.ts')
    expect(result.stats.mostComplete).toBe('rich.ts')
  })

  it('handles empty files array', () => {
    const result = buildAmberLighthouseResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallIllumination).toBe(0)
    expect(result.rays).toHaveLength(0)
    expect(result.coastlines).toHaveLength(0)
    expect(result.coast.isIlluminated).toBe(false)
  })

  it('groups coastlines by directory', () => {
    const result = buildAmberLighthouseResult(
      ['dir1/a.ts', 'dir2/b.ts'],
      [RICH, MEDIUM],
    )
    expect(result.coastlines).toHaveLength(2)
    const dirs = result.coastlines.map((c) => c.directory).sort()
    expect(dirs).toEqual(['dir1', 'dir2'])
  })

  it('counts high measure flags correctly', () => {
    const result = buildAmberLighthouseResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighPenetrationCount).toBe(1)
    expect(result.stats.hasHighSystemCount).toBe(1)
    expect(result.stats.hasHighStabilityCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
  })

  it('sets empty highlights for no files', () => {
    const result = buildAmberLighthouseResult([], [])
    expect(result.stats.bestRay).toBe('')
    expect(result.stats.brightest).toBe('')
  })
})

// ─── format-helpers ────────────────────────────────────────────────────────

describe('format-helpers', () => {
  it('scoreColor returns a string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('intensityColor returns a string for all values', () => {
    const values = ['million-candlepower', 'powerful-beacon', 'bright-light', 'standard', 'dim-bulb', 'dark', 'unknown']
    for (const v of values) {
      expect(typeof intensityColor(v)).toBe('string')
    }
  })

  it('clarityColor returns a string for all values', () => {
    const values = ['crystal-piercing', 'fog-cutting', 'penetrating', 'moderate', 'dim', 'opaque', 'unknown']
    for (const v of values) {
      expect(typeof clarityColor(v)).toBe('string')
    }
  })

  it('effectivenessColor returns a string for all values', () => {
    const values = ['fail-safe-system', 'excellent-warning', 'proper-alert', 'basic-signal', 'faint-horn', 'silent', 'unknown']
    for (const v of values) {
      expect(typeof effectivenessColor(v)).toBe('string')
    }
  })

  it('bedrockColor returns a string for all values', () => {
    const values = ['granite-bedrock', 'solid-foundation', 'concrete-base', 'wooden-pier', 'sandbar', 'quicksand', 'unknown']
    for (const v of values) {
      expect(typeof bedrockColor(v)).toBe('string')
    }
  })

  it('sweepColor returns a string for all values', () => {
    const values = ['360-degree', 'wide-sweep', 'good-coverage', 'partial-sweep', 'narrow-beam', 'no-rotation', 'unknown']
    for (const v of values) {
      expect(typeof sweepColor(v)).toBe('string')
    }
  })

  it('ratingColor returns a string for all values', () => {
    const values = ['master-pilot', 'skilled-navigator', 'reliable-guide', 'basic-aid', 'unreliable', 'misleading', 'unknown']
    for (const v of values) {
      expect(typeof ratingColor(v)).toBe('string')
    }
  })

  it('conditionColor returns a string for all values', () => {
    const values = ['coastal-masterpiece', 'reliable-beacon', 'functional-light', 'flickering-candle', 'broken-lens', 'dark-tower', 'unknown']
    for (const v of values) {
      expect(typeof conditionColor(v)).toBe('string')
    }
  })

  it('keeperGradeColor returns a string for all values', () => {
    const values = ['master-keeper', 'lighthouse-keeper', 'watchman', 'tender', 'observer', 'absentee', 'unknown']
    for (const v of values) {
      expect(typeof keeperGradeColor(v)).toBe('string')
    }
  })

  it('coastlineTypeColor returns a string for all values', () => {
    const values = ['major-lighthouse', 'harbor-light', 'coastal-beacon', 'channel-marker', 'buoy', 'darkness', 'unknown']
    for (const v of values) {
      expect(typeof coastlineTypeColor(v)).toBe('string')
    }
  })

  it('coastConditionColor returns a string for all values', () => {
    const values = ['illuminated-coast', 'well-lit-harbor', 'guided-channel', 'dim-shoreline', 'dark-coast', 'void', 'unknown']
    for (const v of values) {
      expect(typeof coastConditionColor(v)).toBe('string')
    }
  })

  it('formatAmberLighthouseJson returns valid JSON', () => {
    const result = buildAmberLighthouseResult(['rich.ts'], [RICH])
    const json = formatAmberLighthouseJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    expect(JSON.parse(json).stats.totalFiles).toBe(1)
  })

  it('formatAmberLighthouseTable returns a string', () => {
    const result = buildAmberLighthouseResult(['rich.ts'], [RICH])
    const table = formatAmberLighthouseTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatAmberLighthouseTable includes per-file details when verbose', () => {
    const result = buildAmberLighthouseResult(['rich.ts'], [RICH])
    const table = formatAmberLighthouseTable(result, true)
    expect(table).toContain('rich.ts')
  })

  it('formatAmberLighthouseTable includes recommendations when present', () => {
    const result = buildAmberLighthouseResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY, EMPTY, EMPTY, EMPTY],
    )
    const table = formatAmberLighthouseTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('formatAmberLighthouseTable includes highlights when present', () => {
    const result = buildAmberLighthouseResult(['rich.ts'], [RICH])
    const table = formatAmberLighthouseTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Ray')
  })

  it('passes unknown values through color functions', () => {
    expect(intensityColor('unknown')).toBe('unknown')
    expect(clarityColor('unknown')).toBe('unknown')
    expect(effectivenessColor('unknown')).toBe('unknown')
  })
})
