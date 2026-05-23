import { describe, it, expect } from 'vitest'

import {
  measureCrepuscular,
  measureBioluminescent,
  measureEcotone,
  measureCanopy,
  measureUnderstory,
  measureSerenity,
  analyzeTwilightSpecimen,
  classifyCondition,
  classifyTrailType,
  analyzeForestTrail,
  classifyRangerGrade,
  generateRecommendations,
  buildTwilightForestResult,
} from '../src/commands/twilight-forest-helpers.js'

import {
  scoreColor,
  phaseColor,
  glowColor,
  diversityColor,
  balanceColor,
  healthColor,
  peaceColor,
  conditionColor,
  rangerGradeColor,
  trailTypeColor,
  trailConditionColor,
  formatTwilightForestJson,
  formatTwilightForestTable,
} from '../src/commands/twilight-forest-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface UserService { userId: string } export type UserRole = 'admin' | 'user' /** doc */ export class UserServiceImpl implements UserService { private users: Map<string, UserRole> async getUser(id: string): Promise<UserRole | undefined> { try { const result = await this.users.get(id) return result } catch (error) { throw new Error('User not found') } } } export function validateUser(user: UserService): boolean { return user.userId.length > 0 } import { x } from 'y'`

const MEDIUM = `export interface Config { host: string; port: number } export class Server { constructor(private config: Config) {} start(): void { console.log('Starting server') } }`

const EMPTY = ''

// ─── measureCrepuscular ────────────────────────────────────────────────────

describe('measureCrepuscular', () => {
  it('returns golden-hour for RICH content', () => {
    const result = measureCrepuscular(RICH)
    expect(result.quality).toBe(100)
    expect(result.phase).toBe('golden-hour')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasSmoothTransition).toBe(true)
    expect(result.hasProperFading).toBe(true)
    expect(result.hasNoAbruptShift).toBe(true)
    expect(result.hasGradualChange).toBe(true)
    expect(result.hasNoJarringSwitch).toBe(true)
    expect(result.hasAdaptive).toBe(true)
    expect(result.hasNoRigidity).toBe(true)
    expect(result.hasResponsive).toBe(true)
    expect(result.hasNoStalling).toBe(true)
    expect(result.abruptShiftCount).toBe(0)
    expect(result.jarringSwitchCount).toBe(0)
  })

  it('returns astronomical-twilight for MEDIUM content', () => {
    const result = measureCrepuscular(MEDIUM)
    expect(result.quality).toBe(47)
    expect(result.phase).toBe('astronomical-twilight')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns astronomical-twilight for EMPTY content', () => {
    const result = measureCrepuscular(EMPTY)
    expect(result.quality).toBe(42)
    expect(result.phase).toBe('astronomical-twilight')
  })

  it('detects abrupt shifts from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measureCrepuscular(code)
    expect(result.abruptShiftCount).toBeGreaterThan(0)
    expect(result.hasNoAbruptShift).toBe(false)
  })

  it('detects jarring switches from HACK/FIXME', () => {
    const code = '// HACK // FIXME'
    const result = measureCrepuscular(code)
    expect(result.jarringSwitchCount).toBeGreaterThan(0)
    expect(result.hasNoJarringSwitch).toBe(false)
  })
})

// ─── measureBioluminescent ────────────────────────────────────────────────

describe('measureBioluminescent', () => {
  it('returns firefly-symphony for RICH content', () => {
    const result = measureBioluminescent(RICH)
    expect(result.beauty).toBe(100)
    expect(result.glow).toBe('firefly-symphony')
    expect(result.hasHighBeauty).toBe(true)
    expect(result.hasSelfDocumenting).toBe(true)
    expect(result.hasProperHighlighting).toBe(true)
    expect(result.hasNoDarkZones).toBe(true)
    expect(result.hasGlowingPaths).toBe(true)
    expect(result.hasNoShadowCode).toBe(true)
    expect(result.hasVisibleLogic).toBe(true)
    expect(result.hasNoBlindSpots).toBe(true)
    expect(result.hasRadiant).toBe(true)
    expect(result.hasNoCamouflage).toBe(true)
    expect(result.darkZoneCount).toBe(0)
    expect(result.blindSpotCount).toBe(0)
  })

  it('returns dim-gleam for MEDIUM content', () => {
    const result = measureBioluminescent(MEDIUM)
    expect(result.beauty).toBe(37)
    expect(result.glow).toBe('dim-gleam')
    expect(result.hasNoShadowCode).toBe(false)
  })

  it('returns dim-gleam for EMPTY content', () => {
    const result = measureBioluminescent(EMPTY)
    expect(result.beauty).toBe(42)
    expect(result.glow).toBe('dim-gleam')
  })

  it('detects dark zones from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureBioluminescent(code)
    expect(result.darkZoneCount).toBeGreaterThan(0)
    expect(result.hasNoDarkZones).toBe(false)
  })

  it('detects blind spots from empty catch', () => {
    const code = 'try {} catch(e) {}'
    const result = measureBioluminescent(code)
    expect(result.blindSpotCount).toBeGreaterThan(0)
    expect(result.hasNoBlindSpots).toBe(false)
  })
})

// ─── measureEcotone ───────────────────────────────────────────────────────

describe('measureEcotone', () => {
  it('returns species-rich for RICH content', () => {
    const result = measureEcotone(RICH)
    expect(result.richness).toBe(100)
    expect(result.diversity).toBe('species-rich')
    expect(result.hasHighRichness).toBe(true)
    expect(result.hasProperBoundaries).toBe(true)
    expect(result.hasCleanInterfaces).toBe(true)
    expect(result.hasNoHardEdges).toBe(true)
    expect(result.hasPermeable).toBe(true)
    expect(result.hasNoLeaking).toBe(true)
    expect(result.hasTransitionZones).toBe(true)
    expect(result.hasNoRigidWalls).toBe(true)
    expect(result.hasProperEncapsulation).toBe(true)
    expect(result.hasNoOverexposure).toBe(true)
    expect(result.hardEdgeCount).toBe(0)
    expect(result.leakingCount).toBe(0)
  })

  it('returns barren-border for MEDIUM content', () => {
    const result = measureEcotone(MEDIUM)
    expect(result.richness).toBe(49)
    expect(result.diversity).toBe('barren-border')
    expect(result.hasPermeable).toBe(false)
  })

  it('returns barren-border for EMPTY content', () => {
    const result = measureEcotone(EMPTY)
    expect(result.richness).toBe(42)
    expect(result.diversity).toBe('barren-border')
  })

  it('detects hard edges from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measureEcotone(code)
    expect(result.hardEdgeCount).toBeGreaterThan(0)
    expect(result.hasNoHardEdges).toBe(false)
  })

  it('detects leaking from empty catch', () => {
    const code = 'try {} catch(e) {}'
    const result = measureEcotone(code)
    expect(result.leakingCount).toBeGreaterThan(0)
    expect(result.hasNoLeaking).toBe(false)
  })
})

// ─── measureCanopy ─────────────────────────────────────────────────────────

describe('measureCanopy', () => {
  it('returns old-growth-canopy for RICH content', () => {
    const result = measureCanopy(RICH)
    expect(result.equilibrium).toBe(90)
    expect(result.balance).toBe('old-growth-canopy')
    expect(result.hasHighEquilibrium).toBe(true)
    expect(result.hasProperLayering).toBe(true)
    expect(result.hasBalancedDepth).toBe(true)
    expect(result.hasNoOvergrowth).toBe(true)
    expect(result.hasProperCoverage).toBe(true)
    expect(result.hasNoGaps).toBe(true)
    expect(result.hasLightFiltering).toBe(true)
    expect(result.hasNoChoking).toBe(true)
    expect(result.hasDiverse).toBe(true)
    expect(result.overgrowthCount).toBe(0)
    expect(result.gapCount).toBe(0)
  })

  it('returns patchy for MEDIUM content', () => {
    const result = measureCanopy(MEDIUM)
    expect(result.equilibrium).toBe(36)
    expect(result.balance).toBe('patchy')
    expect(result.hasHighEquilibrium).toBe(false)
  })

  it('returns patchy for EMPTY content', () => {
    const result = measureCanopy(EMPTY)
    expect(result.equilibrium).toBe(31)
    expect(result.balance).toBe('patchy')
  })

  it('detects overgrowth from HACK/FIXME', () => {
    const code = '// HACK // FIXME'
    const result = measureCanopy(code)
    expect(result.overgrowthCount).toBeGreaterThan(0)
    expect(result.hasNoOvergrowth).toBe(false)
  })

  it('detects gaps from empty catch', () => {
    const code = 'try {} catch(e) {}'
    const result = measureCanopy(code)
    expect(result.gapCount).toBeGreaterThan(0)
    expect(result.hasNoChoking).toBe(false)
  })
})

// ─── measureUnderstory ─────────────────────────────────────────────────────

describe('measureUnderstory', () => {
  it('returns thriving-understory for RICH content', () => {
    const result = measureUnderstory(RICH)
    expect(result.vitality).toBe(100)
    expect(result.health).toBe('thriving-understory')
    expect(result.hasHighVitality).toBe(true)
    expect(result.hasHiddenGems).toBe(true)
    expect(result.hasProperUtilities).toBe(true)
    expect(result.hasNoDeadWood).toBe(true)
    expect(result.hasSupporting).toBe(true)
    expect(result.hasNoOrphans).toBe(true)
    expect(result.hasRichInfrastructure).toBe(true)
    expect(result.hasNoRot).toBe(true)
    expect(result.hasVibrant).toBe(true)
    expect(result.hasNoWaste).toBe(true)
    expect(result.deadWoodCount).toBe(0)
    expect(result.orphanCount).toBe(0)
  })

  it('returns barren for MEDIUM content', () => {
    const result = measureUnderstory(MEDIUM)
    expect(result.vitality).toBe(35)
    expect(result.health).toBe('barren')
    expect(result.hasHighVitality).toBe(false)
  })

  it('returns barren for EMPTY content', () => {
    const result = measureUnderstory(EMPTY)
    expect(result.vitality).toBe(40)
    expect(result.health).toBe('barren')
  })

  it('detects dead wood from TODO/HACK', () => {
    const code = '// TODO // HACK'
    const result = measureUnderstory(code)
    expect(result.deadWoodCount).toBeGreaterThan(0)
    expect(result.hasNoDeadWood).toBe(false)
  })

  it('detects orphans from @deprecated/empty catch', () => {
    const code = '@deprecated try {} catch(e) {}'
    const result = measureUnderstory(code)
    expect(result.orphanCount).toBeGreaterThan(0)
    expect(result.hasNoOrphans).toBe(false)
  })
})

// ─── measureSerenity ───────────────────────────────────────────────────────

describe('measureSerenity', () => {
  it('returns nirvana for RICH content', () => {
    const result = measureSerenity(RICH)
    expect(result.level).toBe(100)
    expect(result.peace).toBe('nirvana')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasCalmFlow).toBe(true)
    expect(result.hasNoAnxiety).toBe(true)
    expect(result.hasPeaceful).toBe(true)
    expect(result.hasNoTurmoil).toBe(true)
    expect(result.hasHarmonious).toBe(true)
    expect(result.hasNoDiscord).toBe(true)
    expect(result.hasBalanced).toBe(true)
    expect(result.hasNoOverwhelming).toBe(true)
    expect(result.hasContemplative).toBe(true)
    expect(result.anxietyCount).toBe(0)
    expect(result.turmoilCount).toBe(0)
  })

  it('returns restless for MEDIUM content', () => {
    const result = measureSerenity(MEDIUM)
    expect(result.level).toBe(47)
    expect(result.peace).toBe('restless')
    expect(result.hasHighLevel).toBe(false)
  })

  it('returns restless for EMPTY content', () => {
    const result = measureSerenity(EMPTY)
    expect(result.level).toBe(42)
    expect(result.peace).toBe('restless')
  })

  it('detects anxiety from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureSerenity(code)
    expect(result.anxietyCount).toBeGreaterThan(0)
    expect(result.hasNoAnxiety).toBe(false)
  })

  it('detects turmoil from HACK/FIXME', () => {
    const code = '// HACK // FIXME'
    const result = measureSerenity(code)
    expect(result.turmoilCount).toBeGreaterThan(0)
    expect(result.hasNoTurmoil).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies enchanted-grove for score >= 80', () => {
    expect(classifyCondition({ qualityScore: 85 } as any)).toBe('enchanted-grove')
    const spec = analyzeTwilightSpecimen(RICH, 'test.ts')
    expect(spec.condition).toBe('enchanted-grove')
    expect(spec.qualityScore).toBe(98)
  })

  it('classifies twilight-sanctuary for score 65-79', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('twilight-sanctuary')
  })

  it('classifies mystical-glade for score 50-64', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('mystical-glade')
  })

  it('classifies shadowy-path for score 35-49', () => {
    const spec = analyzeTwilightSpecimen(MEDIUM, 'test.ts')
    expect(spec.condition).toBe('shadowy-path')
  })

  it('classifies dark-thicket for score 20-34', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('dark-thicket')
  })

  it('classifies void for score < 20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('void')
  })
})

// ─── classifyTrailType ─────────────────────────────────────────────────────

describe('classifyTrailType', () => {
  it('returns wasteland for empty specimens', () => {
    expect(classifyTrailType([])).toBe('wasteland')
  })

  it('returns ancient-forest for high avg and enough enchanted', () => {
    const trail = analyzeForestTrail([analyzeTwilightSpecimen(RICH, 'test.ts')], 'test')
    expect(trail.trailType).toBe('ancient-forest')
  })

  it('returns plantation for medium scores', () => {
    const spec = analyzeTwilightSpecimen(MEDIUM, 'test.ts')
    const trail = analyzeForestTrail([spec], 'test')
    expect(trail.trailType).toBe('plantation')
  })

  it('returns plantation for EMPTY content', () => {
    const spec = analyzeTwilightSpecimen(EMPTY, 'test.ts')
    const trail = analyzeForestTrail([spec], 'test')
    expect(trail.trailType).toBe('plantation')
  })
})

// ─── analyzeForestTrail ────────────────────────────────────────────────────

describe('analyzeForestTrail', () => {
  it('returns empty trail for no specimens', () => {
    const trail = analyzeForestTrail([], 'empty-dir')
    expect(trail.directory).toBe('empty-dir')
    expect(trail.specimens).toEqual([])
    expect(trail.avgCrepuscular).toBe(0)
    expect(trail.avgBioluminescent).toBe(0)
    expect(trail.avgSerenity).toBe(0)
    expect(trail.enchantedCount).toBe(0)
    expect(trail.voidCount).toBe(0)
    expect(trail.transitionalCount).toBe(0)
    expect(trail.luminousCount).toBe(0)
    expect(trail.trailType).toBe('wasteland')
    expect(trail.condition).toBe('void')
  })

  it('computes correct trail aggregates', () => {
    const trail = analyzeForestTrail([analyzeTwilightSpecimen(RICH, 'a.ts')], 'dir')
    expect(trail.avgCrepuscular).toBe(100)
    expect(trail.avgBioluminescent).toBe(100)
    expect(trail.avgSerenity).toBe(100)
    expect(trail.enchantedCount).toBe(1)
    expect(trail.transitionalCount).toBe(1)
    expect(trail.luminousCount).toBe(1)
    expect(trail.condition).toBe('enchanted-forest')
  })
})

// ─── classifyRangerGrade ───────────────────────────────────────────────────

describe('classifyRangerGrade', () => {
  it('returns forest-spirit for 80+', () => {
    expect(classifyRangerGrade(85)).toBe('forest-spirit')
    expect(classifyRangerGrade(100)).toBe('forest-spirit')
  })

  it('returns ancient-ranger for 65-79', () => {
    expect(classifyRangerGrade(70)).toBe('ancient-ranger')
  })

  it('returns woodland-keeper for 50-64', () => {
    expect(classifyRangerGrade(55)).toBe('woodland-keeper')
  })

  it('returns trail-guide for 35-49', () => {
    expect(classifyRangerGrade(40)).toBe('trail-guide')
  })

  it('returns lost-wanderer for 20-34', () => {
    expect(classifyRangerGrade(25)).toBe('lost-wanderer')
  })

  it('returns blind-in-dark for < 20', () => {
    expect(classifyRangerGrade(10)).toBe('blind-in-dark')
    expect(classifyRangerGrade(0)).toBe('blind-in-dark')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-scoring code', () => {
    const result = buildTwilightForestResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('Improve crepuscular quality — add interfaces, types, and smooth transitions for code adaptability')
    expect(result.recommendations).toContain('Enhance bioluminescent beauty — reduce any/eval and add documentation for code illumination')
  })

  it('returns empty recommendations for high-scoring code', () => {
    const result = buildTwilightForestResult(['rich.ts'], [RICH])
    expect(result.recommendations).toEqual([])
  })
})

// ─── buildTwilightForestResult ─────────────────────────────────────────────

describe('buildTwilightForestResult', () => {
  it('returns correct structure for mixed fixtures', () => {
    const result = buildTwilightForestResult(
      ['a/rich.ts', 'b/medium.ts', 'empty.ts'],
      [RICH, MEDIUM, EMPTY],
    )

    expect(result.specimens).toHaveLength(3)
    expect(result.trails).toHaveLength(3)

    expect(result.woodland.overallSerenity).toBe(60)
    expect(result.woodland.isSerene).toBe(true)
    expect(result.woodland.avgCrepuscular).toBe(63)
    expect(result.woodland.avgBioluminescent).toBe(60)
    expect(result.woodland.avgSerenity).toBe(63)

    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalTrails).toBe(3)
    expect(result.stats.avgCrepuscularQuality).toBe(63)
    expect(result.stats.avgBioluminescentBeauty).toBe(60)
    expect(result.stats.avgEcotoneRichness).toBe(64)
    expect(result.stats.avgCanopyEquilibrium).toBe(52)
    expect(result.stats.avgUnderstoryVitality).toBe(58)
    expect(result.stats.avgTwilightSerenity).toBe(63)
    expect(result.stats.enchantedGroveCount).toBe(1)
    expect(result.stats.shadowyPathCount).toBe(2)
    expect(result.stats.darkThicketCount).toBe(0)
    expect(result.stats.commanderGrade).toBeUndefined()
    expect(result.stats.rangerGrade).toBe('woodland-keeper')
    expect(result.stats.bestSpecimen).toBe('a/rich.ts')
    expect(result.stats.bestTransitions).toBe('a/rich.ts')
    expect(result.stats.mostLuminous).toBe('a/rich.ts')
    expect(result.stats.bestBoundaries).toBe('a/rich.ts')
    expect(result.stats.mostBalanced).toBe('a/rich.ts')
    expect(result.stats.deepest).toBe('a/rich.ts')
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighBeautyCount).toBe(1)
    expect(result.stats.hasHighRichnessCount).toBe(1)
    expect(result.stats.hasHighEquilibriumCount).toBe(1)
    expect(result.stats.hasHighVitalityCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
  })

  it('returns forest-spirit grade for perfect code', () => {
    const result = buildTwilightForestResult(['rich.ts'], [RICH])
    expect(result.stats.rangerGrade).toBe('forest-spirit')
    expect(result.woodland.overallSerenity).toBe(98)
    expect(result.stats.overallSerenity).toBe(98)
  })

  it('handles empty files array', () => {
    const result = buildTwilightForestResult([], [])
    expect(result.specimens).toHaveLength(0)
    expect(result.trails).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgCrepuscularQuality).toBe(0)
    expect(result.stats.rangerGrade).toBe('blind-in-dark')
    expect(result.woodland.isSerene).toBe(false)
  })

  it('groups files into trails by directory', () => {
    const result = buildTwilightForestResult(
      ['a/f1.ts', 'a/f2.ts', 'b/f3.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.trails).toHaveLength(2)
    const dirA = result.trails.find((t) => t.directory === 'a')
    expect(dirA).toBeDefined()
    expect(dirA!.specimens).toHaveLength(2)
    const dirB = result.trails.find((t) => t.directory === 'b')
    expect(dirB).toBeDefined()
    expect(dirB!.specimens).toHaveLength(1)
  })

  it('computes correct values for all EMPTY files', () => {
    const result = buildTwilightForestResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    expect(result.stats.overallSerenity).toBe(40)
    expect(result.stats.rangerGrade).toBe('trail-guide')
    expect(result.woodland.isSerene).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── formatTwilightForestJson ──────────────────────────────────────────────

describe('formatTwilightForestJson', () => {
  it('returns valid JSON string', () => {
    const result = buildTwilightForestResult(['test.ts'], [RICH])
    const json = formatTwilightForestJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.rangerGrade).toBe('forest-spirit')
  })
})

// ─── formatTwilightForestTable ─────────────────────────────────────────────

describe('formatTwilightForestTable', () => {
  it('returns non-empty string for basic result', () => {
    const result = buildTwilightForestResult(['test.ts'], [MEDIUM])
    const table = formatTwilightForestTable(result, false)
    expect(table).toContain('Twilight Forest Analysis')
    expect(table).toContain('Total Files')
    expect(table).toContain('Ranger Grade')
  })

  it('includes per-file details when verbose', () => {
    const result = buildTwilightForestResult(['test.ts'], [RICH])
    const table = formatTwilightForestTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations when present', () => {
    const result = buildTwilightForestResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    const table = formatTwilightForestTable(result, false)
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

  it('phaseColor returns string for all phases', () => {
    const values = ['golden-hour', 'blue-hour', 'civil-twilight', 'nautical-twilight', 'astronomical-twilight', 'night']
    for (const v of values) expect(typeof phaseColor(v)).toBe('string')
  })

  it('glowColor returns string for all glows', () => {
    const values = ['firefly-symphony', 'glowing-fungi', 'foxfire', 'faint-sparkle', 'dim-gleam', 'darkness']
    for (const v of values) expect(typeof glowColor(v)).toBe('string')
  })

  it('diversityColor returns string for all diversities', () => {
    const values = ['species-rich', 'diverse-boundary', 'healthy-edge', 'simple-edge', 'barren-border', 'wall']
    for (const v of values) expect(typeof diversityColor(v)).toBe('string')
  })

  it('balanceColor returns string for all balances', () => {
    const values = ['old-growth-canopy', 'balanced-forest', 'healthy-mix', 'developing', 'patchy', 'barren']
    for (const v of values) expect(typeof balanceColor(v)).toBe('string')
  })

  it('healthColor returns string for all healths', () => {
    const values = ['thriving-understory', 'rich-ecosystem', 'healthy-growth', 'sparse', 'barren', 'dead']
    for (const v of values) expect(typeof healthColor(v)).toBe('string')
  })

  it('peaceColor returns string for all peaces', () => {
    const values = ['nirvana', 'zen-garden', 'peaceful-grove', 'quiet-corner', 'restless', 'chaotic']
    for (const v of values) expect(typeof peaceColor(v)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    const values = ['enchanted-grove', 'twilight-sanctuary', 'mystical-glade', 'shadowy-path', 'dark-thicket', 'void']
    for (const v of values) expect(typeof conditionColor(v)).toBe('string')
  })

  it('rangerGradeColor returns string for all grades', () => {
    const values = ['forest-spirit', 'ancient-ranger', 'woodland-keeper', 'trail-guide', 'lost-wanderer', 'blind-in-dark']
    for (const v of values) expect(typeof rangerGradeColor(v)).toBe('string')
  })

  it('trailTypeColor returns string for all types', () => {
    const values = ['ancient-forest', 'old-growth', 'secondary-forest', 'plantation', 'clearing', 'wasteland']
    for (const v of values) expect(typeof trailTypeColor(v)).toBe('string')
  })

  it('trailConditionColor returns string for all conditions', () => {
    const values = ['enchanted-forest', 'twilight-woods', 'shadow-grove', 'dim-trail', 'dark-thicket', 'void']
    for (const v of values) expect(typeof trailConditionColor(v)).toBe('string')
  })

  it('returns input string for unknown values', () => {
    expect(scoreColor(90)).toContain('90')
    expect(phaseColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
  })
})
