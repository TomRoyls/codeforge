import { describe, it, expect } from 'vitest'

import {
  measureStorm,
  measureThunder,
  measureLightning,
  measureFlood,
  measureWind,
  measureIntegrity,
  analyzeGateSection,
  classifyCondition,
  classifyWallType,
  analyzeStormWall,
  classifyCommanderGrade,
  generateRecommendations,
  buildTempestGateResult,
} from '../src/commands/tempest-gate-helpers.js'

import {
  scoreColor,
  stormCategoryColor,
  thunderVolumeColor,
  lightningSpeedColor,
  floodProtectionColor,
  windRatingColor,
  integrityStateColor,
  conditionColor,
  commanderGradeColor,
  wallTypeColor,
  wallConditionColor,
  formatTempestGateJson,
  formatTempestGateTable,
} from '../src/commands/tempest-gate-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface UserService { userId: string } export type UserRole = 'admin' | 'user' /** doc */ export class UserServiceImpl implements UserService { private users: Map<string, UserRole> async getUser(id: string): Promise<UserRole | undefined> { try { const result = await this.users.get(id) return result } catch (error) { throw new Error('User not found') } } } export function validateUser(user: UserService): boolean { return user.userId.length > 0 } import { x } from 'y'`

const MEDIUM = `export interface Config { host: string; port: number } export class Server { constructor(private config: Config) {} start(): void { console.log('Starting server') } }`

const EMPTY = ''

// ─── measureStorm ──────────────────────────────────────────────────────────

describe('measureStorm', () => {
  it('returns category-5-proof for RICH content', () => {
    const result = measureStorm(RICH)
    expect(result.resistance).toBe(100)
    expect(result.category).toBe('category-5-proof')
    expect(result.hasHighResistance).toBe(true)
    expect(result.hasProperReinforcement).toBe(true)
    expect(result.hasNoWeakPoints).toBe(true)
    expect(result.hasStructural).toBe(true)
    expect(result.hasImpactResistant).toBe(true)
    expect(result.hasFlexible).toBe(true)
    expect(result.hasDurable).toBe(true)
    expect(result.weakPointCount).toBe(0)
    expect(result.crackingCount).toBe(0)
  })

  it('returns light-duty for MEDIUM content', () => {
    const result = measureStorm(MEDIUM)
    expect(result.resistance).toBe(48)
    expect(result.category).toBe('light-duty')
    expect(result.hasHighResistance).toBe(false)
  })

  it('returns light-duty for EMPTY content', () => {
    const result = measureStorm(EMPTY)
    expect(result.resistance).toBe(43)
    expect(result.category).toBe('light-duty')
  })

  it('detects weak points from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measureStorm(code)
    expect(result.weakPointCount).toBeGreaterThan(0)
    expect(result.hasNoWeakPoints).toBe(false)
  })

  it('detects cracking from HACK/FIXME', () => {
    const code = '// HACK // FIXME'
    const result = measureStorm(code)
    expect(result.crackingCount).toBeGreaterThan(0)
    expect(result.hasNoCracking).toBe(false)
  })
})

// ─── measureThunder ────────────────────────────────────────────────────────

describe('measureThunder', () => {
  it('returns thunderous for RICH content', () => {
    const result = measureThunder(RICH)
    expect(result.quality).toBe(100)
    expect(result.volume).toBe('thunderous')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasCommanding).toBe(true)
    expect(result.hasNoDistortion).toBe(true)
    expect(result.hasResonant).toBe(true)
    expect(result.distortionCount).toBe(0)
  })

  it('returns distant for MEDIUM content', () => {
    const result = measureThunder(MEDIUM)
    expect(result.quality).toBe(37)
    expect(result.volume).toBe('distant')
    expect(result.hasNoNoise).toBe(false)
  })

  it('returns distant for EMPTY content', () => {
    const result = measureThunder(EMPTY)
    expect(result.quality).toBe(42)
    expect(result.volume).toBe('distant')
  })

  it('detects distortion from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureThunder(code)
    expect(result.distortionCount).toBeGreaterThan(0)
    expect(result.hasNoDistortion).toBe(false)
  })

  it('detects interference from empty catch', () => {
    const code = 'try {} catch(e) {}'
    const result = measureThunder(code)
    expect(result.interferenceCount).toBeGreaterThan(0)
    expect(result.hasNoInterference).toBe(false)
  })
})

// ─── measureLightning ──────────────────────────────────────────────────────

describe('measureLightning', () => {
  it('returns bolt-speed for RICH content', () => {
    const result = measureLightning(RICH)
    expect(result.path).toBe(100)
    expect(result.speed).toBe('bolt-speed')
    expect(result.hasHighSpeed).toBe(true)
    expect(result.hasDirectPath).toBe(true)
    expect(result.hasNoBottleneck).toBe(true)
    expect(result.bottleneckCount).toBe(0)
  })

  it('returns slow-arc for MEDIUM content', () => {
    const result = measureLightning(MEDIUM)
    expect(result.path).toBe(49)
    expect(result.speed).toBe('slow-arc')
    expect(result.hasDirectPath).toBe(true)
    expect(result.hasNoWaste).toBe(false)
  })

  it('returns slow-arc for EMPTY content', () => {
    const result = measureLightning(EMPTY)
    expect(result.path).toBe(43)
    expect(result.speed).toBe('slow-arc')
    expect(result.hasDirectPath).toBe(false)
  })

  it('detects bottlenecks from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureLightning(code)
    expect(result.bottleneckCount).toBeGreaterThan(0)
    expect(result.hasNoBottleneck).toBe(false)
  })

  it('detects detours from empty catch', () => {
    const code = 'try {} catch(e) {}'
    const result = measureLightning(code)
    expect(result.detourCount).toBeGreaterThan(0)
    expect(result.hasNoDetours).toBe(false)
  })
})

// ─── measureFlood ──────────────────────────────────────────────────────────

describe('measureFlood', () => {
  it('returns levee-master for RICH content', () => {
    const result = measureFlood(RICH)
    expect(result.defense).toBe(100)
    expect(result.protection).toBe('levee-master')
    expect(result.hasHighDefense).toBe(true)
    expect(result.hasCatchment).toBe(true)
    expect(result.hasNoOverflow).toBe(true)
    expect(result.hasRetention).toBe(true)
    expect(result.overflowCount).toBe(0)
  })

  it('returns leaky-dike for MEDIUM content', () => {
    const result = measureFlood(MEDIUM)
    expect(result.defense).toBe(48)
    expect(result.protection).toBe('leaky-dike')
    expect(result.hasCatchment).toBe(false)
  })

  it('returns leaky-dike for EMPTY content', () => {
    const result = measureFlood(EMPTY)
    expect(result.defense).toBe(43)
    expect(result.protection).toBe('leaky-dike')
  })

  it('detects overflow from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measureFlood(code)
    expect(result.overflowCount).toBeGreaterThan(0)
    expect(result.hasNoOverflow).toBe(false)
  })

  it('detects cascade failure from HACK/FIXME', () => {
    const code = '// HACK // FIXME'
    const result = measureFlood(code)
    expect(result.cascadeFailureCount).toBeGreaterThan(0)
    expect(result.hasNoCascadeFailure).toBe(false)
  })
})

// ─── measureWind ───────────────────────────────────────────────────────────

describe('measureWind', () => {
  it('returns tornado-proof for RICH content', () => {
    const result = measureWind(RICH)
    expect(result.endurance).toBe(100)
    expect(result.rating).toBe('tornado-proof')
    expect(result.hasHighEndurance).toBe(true)
    expect(result.hasAerodynamic).toBe(true)
    expect(result.hasLoadBalanced).toBe(true)
    expect(result.dragCount).toBe(0)
  })

  it('returns light-wind for MEDIUM content', () => {
    const result = measureWind(MEDIUM)
    expect(result.endurance).toBe(60)
    expect(result.rating).toBe('light-wind')
    expect(result.hasHighEndurance).toBe(false)
    expect(result.hasAerodynamic).toBe(true)
  })

  it('returns light-wind for EMPTY content', () => {
    const result = measureWind(EMPTY)
    expect(result.endurance).toBe(43)
    expect(result.rating).toBe('light-wind')
  })

  it('detects drag from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureWind(code)
    expect(result.dragCount).toBeGreaterThan(0)
    expect(result.hasNoParasiticDrag).toBe(false)
  })

  it('detects vibration from HACK/@deprecated', () => {
    const code = '// HACK @deprecated'
    const result = measureWind(code)
    expect(result.vibrationCount).toBeGreaterThan(0)
    expect(result.hasNoVibration).toBe(false)
  })
})

// ─── measureIntegrity ──────────────────────────────────────────────────────

describe('measureIntegrity', () => {
  it('returns impregnable for RICH content', () => {
    const result = measureIntegrity(RICH)
    expect(result.level).toBe(100)
    expect(result.state).toBe('impregnable')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasCompleteSeal).toBe(true)
    expect(result.hasNoVulnerability).toBe(true)
    expect(result.hasEnduring).toBe(true)
    expect(result.vulnerabilityCount).toBe(0)
  })

  it('returns rusted-gate for MEDIUM content', () => {
    const result = measureIntegrity(MEDIUM)
    expect(result.level).toBe(47)
    expect(result.state).toBe('rusted-gate')
    expect(result.hasHighLevel).toBe(false)
  })

  it('returns rusted-gate for EMPTY content', () => {
    const result = measureIntegrity(EMPTY)
    expect(result.level).toBe(42)
    expect(result.state).toBe('rusted-gate')
  })

  it('detects vulnerability from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureIntegrity(code)
    expect(result.vulnerabilityCount).toBeGreaterThan(0)
    expect(result.hasNoVulnerability).toBe(false)
  })

  it('detects fatigue from HACK/@deprecated', () => {
    const code = '// HACK @deprecated'
    const result = measureIntegrity(code)
    expect(result.fatigueCount).toBeGreaterThan(0)
    expect(result.hasNoFatigue).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies impregnable-fortress for score >= 80', () => {
    expect(classifyCondition({ qualityScore: 85 } as any)).toBe('impregnable-fortress')
    const sec = analyzeGateSection(RICH, 'test.ts')
    expect(sec.condition).toBe('impregnable-fortress')
    expect(sec.qualityScore).toBe(100)
  })

  it('classifies storm-castle for score 65-79', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('storm-castle')
  })

  it('classifies solid-gatehouse for score 50-64', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('solid-gatehouse')
  })

  it('classifies weathered-gate for score 35-49', () => {
    const sec = analyzeGateSection(MEDIUM, 'test.ts')
    expect(sec.condition).toBe('weathered-gate')
  })

  it('classifies crumbling-wall for score 20-34', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('crumbling-wall')
  })

  it('classifies ruins for score < 20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('ruins')
  })
})

// ─── classifyWallType ──────────────────────────────────────────────────────

describe('classifyWallType', () => {
  it('returns no-barrier for empty sections', () => {
    expect(classifyWallType([])).toBe('no-barrier')
  })

  it('returns great-wall for high avg and enough fortress', () => {
    const wall = analyzeStormWall([analyzeGateSection(RICH, 'test.ts')], 'test')
    expect(wall.wallType).toBe('great-wall')
  })

  it('returns city-wall for medium scores', () => {
    const sec = analyzeGateSection(MEDIUM, 'test.ts')
    const wall = analyzeStormWall([sec], 'test')
    expect(wall.wallType).toBe('city-wall')
  })

  it('returns garden-wall for low scores', () => {
    const sec = analyzeGateSection(EMPTY, 'test.ts')
    const wall = analyzeStormWall([sec], 'test')
    expect(wall.wallType).toBe('garden-wall')
  })
})

// ─── analyzeStormWall ──────────────────────────────────────────────────────

describe('analyzeStormWall', () => {
  it('returns empty wall for no sections', () => {
    const wall = analyzeStormWall([], 'empty-dir')
    expect(wall.directory).toBe('empty-dir')
    expect(wall.sections).toEqual([])
    expect(wall.avgStorm).toBe(0)
    expect(wall.avgFlood).toBe(0)
    expect(wall.avgIntegrity).toBe(0)
    expect(wall.fortressCount).toBe(0)
    expect(wall.ruinsCount).toBe(0)
    expect(wall.resistantCount).toBe(0)
    expect(wall.defendedCount).toBe(0)
    expect(wall.wallType).toBe('no-barrier')
    expect(wall.condition).toBe('fallen')
  })

  it('computes correct wall aggregates', () => {
    const wall = analyzeStormWall([analyzeGateSection(RICH, 'a.ts')], 'dir')
    expect(wall.avgStorm).toBe(100)
    expect(wall.avgFlood).toBe(100)
    expect(wall.avgIntegrity).toBe(100)
    expect(wall.fortressCount).toBe(1)
    expect(wall.resistantCount).toBe(1)
    expect(wall.defendedCount).toBe(1)
    expect(wall.condition).toBe('impregnable')
  })
})

// ─── classifyCommanderGrade ────────────────────────────────────────────────

describe('classifyCommanderGrade', () => {
  it('returns fortress-commander for 80+', () => {
    expect(classifyCommanderGrade(85)).toBe('fortress-commander')
    expect(classifyCommanderGrade(100)).toBe('fortress-commander')
  })

  it('returns castle-warden for 65-79', () => {
    expect(classifyCommanderGrade(70)).toBe('castle-warden')
  })

  it('returns gatekeeper for 50-64', () => {
    expect(classifyCommanderGrade(55)).toBe('gatekeeper')
  })

  it('returns guard for 35-49', () => {
    expect(classifyCommanderGrade(40)).toBe('guard')
  })

  it('returns watchman for 20-34', () => {
    expect(classifyCommanderGrade(25)).toBe('watchman')
  })

  it('returns deserter for < 20', () => {
    expect(classifyCommanderGrade(10)).toBe('deserter')
    expect(classifyCommanderGrade(0)).toBe('deserter')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-scoring code', () => {
    const result = buildTempestGateResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('Reinforce storm resistance — add interfaces, types, and error handling for code resilience')
    expect(result.recommendations).toContain('Amplify thunder quality — reduce any/eval and add documentation for code impact')
  })

  it('returns empty recommendations for high-scoring code', () => {
    const result = buildTempestGateResult(['rich.ts'], [RICH])
    expect(result.recommendations).toEqual([])
  })
})

// ─── buildTempestGateResult ────────────────────────────────────────────────

describe('buildTempestGateResult', () => {
  it('returns correct structure for mixed fixtures', () => {
    const result = buildTempestGateResult(
      ['a/rich.ts', 'b/medium.ts', 'empty.ts'],
      [RICH, MEDIUM, EMPTY],
    )

    expect(result.sections).toHaveLength(3)
    expect(result.walls).toHaveLength(3)

    expect(result.fortress.overallFortification).toBe(64)
    expect(result.fortress.isImpregnable).toBe(true)
    expect(result.fortress.avgStorm).toBe(64)
    expect(result.fortress.avgFlood).toBe(64)
    expect(result.fortress.avgIntegrity).toBe(63)

    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalWalls).toBe(3)
    expect(result.stats.avgStormResistance).toBe(64)
    expect(result.stats.avgThunderQuality).toBe(60)
    expect(result.stats.avgLightningPath).toBe(64)
    expect(result.stats.avgFloodDefense).toBe(64)
    expect(result.stats.avgWindEndurance).toBe(68)
    expect(result.stats.avgGateIntegrity).toBe(63)
    expect(result.stats.impregnableFortressCount).toBe(1)
    expect(result.stats.weatheredGateCount).toBe(2)
    expect(result.stats.commanderGrade).toBe('gatekeeper')
    expect(result.stats.bestSection).toBe('a/rich.ts')
    expect(result.stats.mostResilient).toBe('a/rich.ts')
    expect(result.stats.mostImpactful).toBe('a/rich.ts')
    expect(result.stats.fastest).toBe('a/rich.ts')
    expect(result.stats.bestDefended).toBe('a/rich.ts')
    expect(result.stats.mostReliable).toBe('a/rich.ts')
    expect(result.stats.hasHighResistanceCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighSpeedCount).toBe(1)
    expect(result.stats.hasHighDefenseCount).toBe(1)
    expect(result.stats.hasHighEnduranceCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
  })

  it('returns fortress-commander grade for perfect code', () => {
    const result = buildTempestGateResult(['rich.ts'], [RICH])
    expect(result.stats.commanderGrade).toBe('fortress-commander')
    expect(result.fortress.overallFortification).toBe(100)
    expect(result.stats.overallFortification).toBe(100)
  })

  it('handles empty files array', () => {
    const result = buildTempestGateResult([], [])
    expect(result.sections).toHaveLength(0)
    expect(result.walls).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgStormResistance).toBe(0)
    expect(result.stats.commanderGrade).toBe('deserter')
    expect(result.fortress.isImpregnable).toBe(false)
  })

  it('groups files into walls by directory', () => {
    const result = buildTempestGateResult(
      ['a/f1.ts', 'a/f2.ts', 'b/f3.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.walls).toHaveLength(2)
    const dirA = result.walls.find((w) => w.directory === 'a')
    expect(dirA).toBeDefined()
    expect(dirA!.sections).toHaveLength(2)
    const dirB = result.walls.find((w) => w.directory === 'b')
    expect(dirB).toBeDefined()
    expect(dirB!.sections).toHaveLength(1)
  })
})

// ─── formatTempestGateJson ─────────────────────────────────────────────────

describe('formatTempestGateJson', () => {
  it('returns valid JSON string', () => {
    const result = buildTempestGateResult(['test.ts'], [RICH])
    const json = formatTempestGateJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.commanderGrade).toBe('fortress-commander')
  })
})

// ─── formatTempestGateTable ────────────────────────────────────────────────

describe('formatTempestGateTable', () => {
  it('returns non-empty string for basic result', () => {
    const result = buildTempestGateResult(['test.ts'], [MEDIUM])
    const table = formatTempestGateTable(result, false)
    expect(table).toContain('Tempest Gate Analysis')
    expect(table).toContain('Total Files')
    expect(table).toContain('Commander Grade')
  })

  it('includes per-file details when verbose', () => {
    const result = buildTempestGateResult(['test.ts'], [RICH])
    const table = formatTempestGateTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations when present', () => {
    const result = buildTempestGateResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    const table = formatTempestGateTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('color helpers', () => {
  it('scoreColor returns string for various scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('stormCategoryColor returns string for all categories', () => {
    const values = ['category-5-proof', 'hurricane-rated', 'storm-tested', 'moderate', 'light-duty', 'collapses']
    for (const v of values) expect(typeof stormCategoryColor(v)).toBe('string')
  })

  it('thunderVolumeColor returns string for all volumes', () => {
    const values = ['thunderous', 'powerful', 'resonant', 'moderate', 'distant', 'silent']
    for (const v of values) expect(typeof thunderVolumeColor(v)).toBe('string')
  })

  it('lightningSpeedColor returns string for all speeds', () => {
    const values = ['bolt-speed', 'rapid-flash', 'quick-strike', 'moderate', 'slow-arc', 'no-flash']
    for (const v of values) expect(typeof lightningSpeedColor(v)).toBe('string')
  })

  it('floodProtectionColor returns string for all protections', () => {
    const values = ['levee-master', 'flood-wall', 'proper-drainage', 'sandbags', 'leaky-dike', 'submerged']
    for (const v of values) expect(typeof floodProtectionColor(v)).toBe('string')
  })

  it('windRatingColor returns string for all ratings', () => {
    const values = ['tornado-proof', 'hurricane-rated', 'gale-force', 'moderate-breeze', 'light-wind', 'blown-away']
    for (const v of values) expect(typeof windRatingColor(v)).toBe('string')
  })

  it('integrityStateColor returns string for all states', () => {
    const values = ['impregnable', 'fortress-grade', 'solid-gate', 'sturdy-door', 'rusted-gate', 'broken']
    for (const v of values) expect(typeof integrityStateColor(v)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    const values = ['impregnable-fortress', 'storm-castle', 'solid-gatehouse', 'weathered-gate', 'crumbling-wall', 'ruins']
    for (const v of values) expect(typeof conditionColor(v)).toBe('string')
  })

  it('commanderGradeColor returns string for all grades', () => {
    const values = ['fortress-commander', 'castle-warden', 'gatekeeper', 'guard', 'watchman', 'deserter']
    for (const v of values) expect(typeof commanderGradeColor(v)).toBe('string')
  })

  it('wallTypeColor returns string for all types', () => {
    const values = ['great-wall', 'castle-wall', 'city-wall', 'garden-wall', 'fence', 'no-barrier']
    for (const v of values) expect(typeof wallTypeColor(v)).toBe('string')
  })

  it('wallConditionColor returns string for all conditions', () => {
    const values = ['impregnable', 'stronghold', 'defensible', 'breached', 'crumbling', 'fallen']
    for (const v of values) expect(typeof wallConditionColor(v)).toBe('string')
  })

  it('returns input string for unknown values', () => {
    expect(scoreColor(90)).toContain('90')
    expect(stormCategoryColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
  })
})
