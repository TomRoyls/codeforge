import { describe, expect, it } from 'vitest'

import {
  analyzeStarCluster,
  analyzeStellarRemnant,
  buildStardustTrailResult,
  classifyAstronomerGrade,
  classifyClusterCondition,
  classifyClusterType,
  classifyCondition,
  generateRecommendations,
  measureComposition,
  measureGravity,
  measureLegacy,
  measureOrigin,
  measureRemnant,
  measureStability,
} from '../src/commands/stardust-trail-helpers.js'

import {
  clusterColor,
  conditionColor,
  elementsColor,
  formatStardustTrailJson,
  formatStardustTrailTable,
  gradeColor,
  legacyColor,
  massColor,
  orbitColor,
  originColor,
  remnantColor,
  scoreColor,
} from '../src/commands/stardust-trail-format-helpers.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const RICH_CONTENT = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from './foo'
// TODO: fix later
`

const EMPTY_CONTENT = ''

const MEDIUM_CONTENT = 'const x = 1\n'

// ─── measureOrigin ──────────────────────────────────────────────────────────

describe('measureOrigin', () => {
  it('returns high origin for rich content', () => {
    const result = measureOrigin(RICH_CONTENT)
    expect(result.quality).toBe(92)
    expect(result.source).toBe('second-generation')
    expect(result.hasHighOrigin).toBe(true)
    expect(result.hasCleanLineage).toBe(true)
    expect(result.hasProperNucleosynthesis).toBe(true)
    expect(result.hasNoContamination).toBe(true)
    expect(result.hasStellarForge).toBe(true)
    expect(result.hasNoDarkOrigin).toBe(true)
    expect(result.hasProperSeed).toBe(true)
    expect(result.hasNoAnomalous).toBe(false)
    expect(result.hasCosmicBackground).toBe(true)
    expect(result.hasNoInterference).toBe(true)
    expect(result.contaminationCount).toBe(0)
    expect(result.anomalousCount).toBe(1)
  })

  it('returns low origin for empty content', () => {
    const result = measureOrigin(EMPTY_CONTENT)
    expect(result.quality).toBe(38)
    expect(result.source).toBe('primordial')
    expect(result.hasHighOrigin).toBe(false)
    expect(result.hasNoContamination).toBe(true)
    expect(result.hasNoAnomalous).toBe(true)
  })

  it('returns primordial for medium content', () => {
    const result = measureOrigin(MEDIUM_CONTENT)
    expect(result.quality).toBe(38)
    expect(result.source).toBe('primordial')
  })
})

// ─── measureComposition ─────────────────────────────────────────────────────

describe('measureComposition', () => {
  it('returns rich composition for rich content', () => {
    const result = measureComposition(RICH_CONTENT)
    expect(result.diversity).toBe(90)
    expect(result.elements).toBe('carbon-based')
    expect(result.hasRichComposition).toBe(true)
    expect(result.hasHydrogen).toBe(true)
    expect(result.hasHelium).toBe(true)
    expect(result.hasCarbon).toBe(true)
    expect(result.hasOxygen).toBe(true)
    expect(result.hasIron).toBe(true)
    expect(result.hasNoMissing).toBe(true)
    expect(result.hasHeavyMetals).toBe(true)
    expect(result.missingCount).toBe(0)
    expect(result.overabundanceCount).toBe(1)
  })

  it('returns low diversity for empty content', () => {
    const result = measureComposition(EMPTY_CONTENT)
    expect(result.diversity).toBe(40)
    expect(result.elements).toBe('helium')
    expect(result.hasRichComposition).toBe(false)
    expect(result.missingCount).toBe(3)
  })

  it('returns helium for medium content', () => {
    const result = measureComposition(MEDIUM_CONTENT)
    expect(result.diversity).toBe(40)
    expect(result.elements).toBe('helium')
  })
})

// ─── measureGravity ─────────────────────────────────────────────────────────

describe('measureGravity', () => {
  it('returns high gravity for rich content', () => {
    const result = measureGravity(RICH_CONTENT)
    expect(result.pull).toBe(95)
    expect(result.mass).toBe('supermassive')
    expect(result.hasHighGravity).toBe(true)
    expect(result.hasProperMass).toBe(true)
    expect(result.hasNoBlackHole).toBe(true)
    expect(result.hasGravitationalLens).toBe(true)
    expect(result.hasNoSingularity).toBe(true)
    expect(result.hasTidalForce).toBe(true)
    expect(result.hasEventHorizon).toBe(true)
    expect(result.hasNoAccretionDisk).toBe(true)
    expect(result.singularityCount).toBe(0)
    expect(result.accretionDiskCount).toBe(0)
  })

  it('returns low gravity for empty content', () => {
    const result = measureGravity(EMPTY_CONTENT)
    expect(result.pull).toBe(30)
    expect(result.mass).toBe('dust-grain')
    expect(result.hasHighGravity).toBe(false)
  })

  it('returns dust-grain for medium content', () => {
    const result = measureGravity(MEDIUM_CONTENT)
    expect(result.pull).toBe(30)
    expect(result.mass).toBe('dust-grain')
  })
})

// ─── measureStability ───────────────────────────────────────────────────────

describe('measureStability', () => {
  it('returns high stability for rich content', () => {
    const result = measureStability(RICH_CONTENT)
    expect(result.level).toBe(90)
    expect(result.orbit).toBe('elliptical')
    expect(result.hasHighStability).toBe(true)
    expect(result.hasProperVelocity).toBe(true)
    expect(result.hasNoWobble).toBe(false)
    expect(result.hasKeplerian).toBe(true)
    expect(result.hasResonance).toBe(true)
    expect(result.hasProperPeriod).toBe(true)
    expect(result.hasNoEscape).toBe(true)
    expect(result.hasLagrangian).toBe(true)
    expect(result.wobbleCount).toBe(1)
    expect(result.collisionCount).toBe(1)
  })

  it('returns low stability for empty content', () => {
    const result = measureStability(EMPTY_CONTENT)
    expect(result.level).toBe(35)
    expect(result.orbit).toBe('chaotic')
    expect(result.hasHighStability).toBe(false)
    expect(result.hasNoWobble).toBe(true)
  })

  it('returns chaotic for medium content', () => {
    const result = measureStability(MEDIUM_CONTENT)
    expect(result.level).toBe(35)
    expect(result.orbit).toBe('chaotic')
  })
})

// ─── measureRemnant ─────────────────────────────────────────────────────────

describe('measureRemnant', () => {
  it('returns high quality for rich content', () => {
    const result = measureRemnant(RICH_CONTENT)
    expect(result.quality).toBe(90)
    expect(result.type).toBe('pulsar')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperCollapse).toBe(true)
    expect(result.hasNoDegradation).toBe(true)
    expect(result.hasCompactForm).toBe(true)
    expect(result.hasSpin).toBe(true)
    expect(result.hasMagnetic).toBe(true)
    expect(result.hasProperDensity).toBe(true)
    expect(result.hasNoFragmentation).toBe(true)
    expect(result.novaCount).toBe(1)
    expect(result.fragmentationCount).toBe(0)
  })

  it('returns low quality for empty content', () => {
    const result = measureRemnant(EMPTY_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.type).toBe('brown-dwarf')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns brown-dwarf for medium content', () => {
    const result = measureRemnant(MEDIUM_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.type).toBe('brown-dwarf')
  })
})

// ─── measureLegacy ──────────────────────────────────────────────────────────

describe('measureLegacy', () => {
  it('returns high legacy for rich content', () => {
    const result = measureLegacy(RICH_CONTENT)
    expect(result.score).toBe(90)
    expect(result.impact).toBe('planetary-legacy')
    expect(result.hasHighLegacy).toBe(true)
    expect(result.hasCosmicRecycling).toBe(true)
    expect(result.hasProperRadiation).toBe(true)
    expect(result.hasNoDimming).toBe(true)
    expect(result.hasGenerational).toBe(true)
    expect(result.hasNoExtinction).toBe(true)
    expect(result.hasSeedBank).toBe(true)
    expect(result.hasNoHeatDeath).toBe(true)
    expect(result.entropyCount).toBe(1)
    expect(result.extinctionCount).toBe(0)
  })

  it('returns low legacy for empty content', () => {
    const result = measureLegacy(EMPTY_CONTENT)
    expect(result.score).toBe(40)
    expect(result.impact).toBe('ephemeral')
    expect(result.hasHighLegacy).toBe(false)
  })

  it('returns ephemeral for medium content', () => {
    const result = measureLegacy(MEDIUM_CONTENT)
    expect(result.score).toBe(40)
    expect(result.impact).toBe('ephemeral')
  })
})

// ─── analyzeStellarRemnant ──────────────────────────────────────────────────

describe('analyzeStellarRemnant', () => {
  it('returns cosmic-treasure for rich content', () => {
    const result = analyzeStellarRemnant(RICH_CONTENT, 'rich.ts')
    expect(result.stellarOrigin).toBe(92)
    expect(result.elementalComposition).toBe(90)
    expect(result.gravitationalPull).toBe(95)
    expect(result.orbitalStability).toBe(90)
    expect(result.supernovaRemnant).toBe(90)
    expect(result.cosmicLegacy).toBe(90)
    expect(result.qualityScore).toBe(91)
    expect(result.condition).toBe('cosmic-treasure')
    expect(result.file).toBe('rich.ts')
  })

  it('returns red-giant for empty content', () => {
    const result = analyzeStellarRemnant(EMPTY_CONTENT, 'empty.ts')
    expect(result.stellarOrigin).toBe(38)
    expect(result.elementalComposition).toBe(40)
    expect(result.gravitationalPull).toBe(30)
    expect(result.orbitalStability).toBe(35)
    expect(result.supernovaRemnant).toBe(40)
    expect(result.cosmicLegacy).toBe(40)
    expect(result.qualityScore).toBe(37)
    expect(result.condition).toBe('red-giant')
  })

  it('returns red-giant for medium content', () => {
    const result = analyzeStellarRemnant(MEDIUM_CONTENT, 'medium.ts')
    expect(result.qualityScore).toBe(37)
    expect(result.condition).toBe('red-giant')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies cosmic-treasure for 80+', () => {
    expect(classifyCondition({ qualityScore: 80 } as any)).toBe('cosmic-treasure')
  })
  it('classifies stellar-nursery for 65-79', () => {
    expect(classifyCondition({ qualityScore: 65 } as any)).toBe('stellar-nursery')
  })
  it('classifies main-sequence for 50-64', () => {
    expect(classifyCondition({ qualityScore: 50 } as any)).toBe('main-sequence')
  })
  it('classifies red-giant for 35-49', () => {
    expect(classifyCondition({ qualityScore: 35 } as any)).toBe('red-giant')
  })
  it('classifies brown-dwarf for 20-34', () => {
    expect(classifyCondition({ qualityScore: 20 } as any)).toBe('brown-dwarf')
  })
  it('classifies cosmic-dust for <20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('cosmic-dust')
  })
})

// ─── classifyClusterType ─────────────────────────────────────────────────────

describe('classifyClusterType', () => {
  it('returns void for empty remnants', () => {
    expect(classifyClusterType([])).toBe('void')
  })
  it('returns globular-cluster for high avg with cosmic count', () => {
    const remnants = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'cosmic-treasure',
    }) as any)
    expect(classifyClusterType(remnants)).toBe('globular-cluster')
  })
  it('returns open-cluster for avg >= 60', () => {
    expect(classifyClusterType([{ qualityScore: 60, condition: 'red-giant' } as any])).toBe('open-cluster')
  })
  it('returns stellar-association for avg >= 45', () => {
    expect(classifyClusterType([{ qualityScore: 45, condition: 'red-giant' } as any])).toBe('stellar-association')
  })
  it('returns galaxy-arm for avg >= 30', () => {
    expect(classifyClusterType([{ qualityScore: 30, condition: 'cosmic-dust' } as any])).toBe('galaxy-arm')
  })
  it('returns dark-cloud for avg >= 15', () => {
    expect(classifyClusterType([{ qualityScore: 15, condition: 'cosmic-dust' } as any])).toBe('dark-cloud')
  })
  it('returns void for avg < 15', () => {
    expect(classifyClusterType([{ qualityScore: 5, condition: 'cosmic-dust' } as any])).toBe('void')
  })
})

// ─── classifyClusterCondition ────────────────────────────────────────────────

describe('classifyClusterCondition', () => {
  it('classifies cosmos for 80+', () => { expect(classifyClusterCondition(80)).toBe('cosmos') })
  it('classifies galaxy for 65-79', () => { expect(classifyClusterCondition(65)).toBe('galaxy') })
  it('classifies nebula for 50-64', () => { expect(classifyClusterCondition(50)).toBe('nebula') })
  it('classifies star-field for 35-49', () => { expect(classifyClusterCondition(35)).toBe('star-field') })
  it('classifies dark-matter for 20-34', () => { expect(classifyClusterCondition(20)).toBe('dark-matter') })
  it('classifies empty-space for <20', () => { expect(classifyClusterCondition(10)).toBe('empty-space') })
})

// ─── classifyAstronomerGrade ─────────────────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('returns cosmic-observer for 80+', () => { expect(classifyAstronomerGrade(80)).toBe('cosmic-observer') })
  it('returns astrophysicist for 65-79', () => { expect(classifyAstronomerGrade(65)).toBe('astrophysicist') })
  it('returns astronomer for 50-64', () => { expect(classifyAstronomerGrade(50)).toBe('astronomer') })
  it('returns stargazer for 35-49', () => { expect(classifyAstronomerGrade(35)).toBe('stargazer') })
  it('returns telescope-operator for 20-34', () => { expect(classifyAstronomerGrade(20)).toBe('telescope-operator') })
  it('returns blind-spot for <20', () => { expect(classifyAstronomerGrade(10)).toBe('blind-spot') })
})

// ─── analyzeStarCluster ──────────────────────────────────────────────────────

describe('analyzeStarCluster', () => {
  it('returns void for empty remnants', () => {
    const result = analyzeStarCluster([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.remnants).toEqual([])
    expect(result.avgOrigin).toBe(0)
    expect(result.avgStability).toBe(0)
    expect(result.avgLegacy).toBe(0)
    expect(result.cosmicCount).toBe(0)
    expect(result.dustCount).toBe(0)
    expect(result.highGravityCount).toBe(0)
    expect(result.stableCount).toBe(0)
    expect(result.clusterType).toBe('void')
    expect(result.condition).toBe('empty-space')
  })

  it('analyzes cluster with remnants', () => {
    const r1 = analyzeStellarRemnant(RICH_CONTENT, 'rich.ts')
    const result = analyzeStarCluster([r1], 'src')
    expect(result.avgOrigin).toBe(92)
    expect(result.avgStability).toBe(90)
    expect(result.avgLegacy).toBe(90)
    expect(result.cosmicCount).toBe(1)
    expect(result.dustCount).toBe(0)
    expect(result.highGravityCount).toBe(1)
    expect(result.stableCount).toBe(1)
  })
})

// ─── buildStardustTrailResult ────────────────────────────────────────────────

describe('buildStardustTrailResult', () => {
  it('returns empty result for no files', () => {
    const result = buildStardustTrailResult([], [])
    expect(result.remnants).toEqual([])
    expect(result.clusters).toEqual([])
    expect(result.cosmos.overallCosmic).toBe(0)
    expect(result.cosmos.isCosmic).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalClusters).toBe(0)
    expect(result.stats.astronomerGrade).toBe('blind-spot')
  })

  it('returns correct stats for rich + medium files', () => {
    const result = buildStardustTrailResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalClusters).toBe(1)
    expect(result.stats.avgStellarOrigin).toBe(65)
    expect(result.stats.avgElementalComposition).toBe(65)
    expect(result.stats.avgGravitationalPull).toBe(63)
    expect(result.stats.avgOrbitalStability).toBe(63)
    expect(result.stats.avgSupernovaRemnant).toBe(65)
    expect(result.stats.avgCosmicLegacy).toBe(65)
    expect(result.stats.overallCosmic).toBe(64)
    expect(result.stats.astronomerGrade).toBe('astronomer')
    expect(result.stats.cosmicTreasureCount).toBe(1)
    expect(result.stats.redGiantCount).toBe(1)
    expect(result.stats.bestRemnant).toBe('rich.ts')
    expect(result.stats.bestOrigin).toBe('rich.ts')
    expect(result.stats.mostDiverse).toBe('rich.ts')
    expect(result.stats.mostImportant).toBe('rich.ts')
    expect(result.stats.mostStable).toBe('rich.ts')
    expect(result.stats.greatestLegacy).toBe('rich.ts')
    expect(result.cosmos.overallCosmic).toBe(64)
    expect(result.cosmos.isCosmic).toBe(false)
  })

  it('returns cosmic recommendation for high scores', () => {
    const result = buildStardustTrailResult(['rich.ts'], [RICH_CONTENT])
    expect(result.recommendations).toContain('Cosmic treasure achieved — your code spans the universe')
  })

  it('computes clusters by directory', () => {
    const result = buildStardustTrailResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.clusters.length).toBe(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving origin when low', () => {
    const remnants = [analyzeStellarRemnant(EMPTY_CONTENT, 'empty.ts')]
    const clusters: any[] = []
    const cosmos = { avgOrigin: 30, avgStability: 50, avgLegacy: 50, isCosmic: false, overallCosmic: 40 }
    const stats = {
      totalFiles: 1, totalClusters: 0, avgStellarOrigin: 30, avgElementalComposition: 50,
      avgGravitationalPull: 50, avgOrbitalStability: 50, avgSupernovaRemnant: 50, avgCosmicLegacy: 50,
      cosmicTreasureCount: 0, stellarNurseryCount: 0, mainSequenceCount: 0,
      redGiantCount: 1, brownDwarfCount: 0, cosmicDustCount: 0,
      hasHighOriginCount: 0, hasRichCompositionCount: 0, hasHighGravityCount: 0,
      hasHighStabilityCount: 0, hasHighQualityCount: 0, hasHighLegacyCount: 0,
      overallCosmic: 40, astronomerGrade: 'stargazer' as const,
      bestRemnant: 'empty.ts', bestOrigin: 'empty.ts', mostDiverse: 'empty.ts',
      mostImportant: 'empty.ts', mostStable: 'empty.ts', greatestLegacy: 'empty.ts',
    }
    const recs = generateRecommendations(remnants, clusters, cosmos, stats)
    expect(recs).toContain('Improve stellar origin — forge your code in hotter stars')
  })

  it('recommends cosmic treasure when all scores are high', () => {
    const remnants = [analyzeStellarRemnant(RICH_CONTENT, 'rich.ts')]
    const result = buildStardustTrailResult(['rich.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(remnants, result.clusters, result.cosmos, result.stats)
    expect(recs).toContain('Cosmic treasure achieved — your code spans the universe')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for high score', () => { expect(scoreColor(90)).toContain('90') })
  it('returns yellow for medium score', () => { expect(scoreColor(70)).toContain('70') })
  it('returns orange for low score', () => { expect(scoreColor(45)).toContain('45') })
  it('returns red for very low score', () => { expect(scoreColor(20)).toContain('20') })
})

describe('conditionColor', () => {
  it('colors cosmic-treasure', () => { expect(conditionColor('cosmic-treasure')).toContain('cosmic-treasure') })
  it('colors cosmic-dust', () => { expect(conditionColor('cosmic-dust')).toContain('cosmic-dust') })
  it('passes through unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})

describe('gradeColor', () => {
  it('colors cosmic-observer', () => { expect(gradeColor('cosmic-observer')).toContain('cosmic-observer') })
  it('colors blind-spot', () => { expect(gradeColor('blind-spot')).toContain('blind-spot') })
  it('passes through unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
})

describe('originColor', () => {
  it('colors first-generation', () => { expect(originColor('first-generation')).toContain('first-generation') })
  it('colors primordial-soup', () => { expect(originColor('primordial-soup')).toContain('primordial-soup') })
})

describe('elementsColor', () => {
  it('colors heavy-elements', () => { expect(elementsColor('heavy-elements')).toContain('heavy-elements') })
  it('colors void', () => { expect(elementsColor('void')).toContain('void') })
})

describe('massColor', () => {
  it('colors supermassive', () => { expect(massColor('supermassive')).toContain('supermassive') })
  it('colors dust-grain', () => { expect(massColor('dust-grain')).toContain('dust-grain') })
})

describe('orbitColor', () => {
  it('colors stable-orbit', () => { expect(orbitColor('stable-orbit')).toContain('stable-orbit') })
  it('colors ejected', () => { expect(orbitColor('ejected')).toContain('ejected') })
})

describe('remnantColor', () => {
  it('colors neutron-star', () => { expect(remnantColor('neutron-star')).toContain('neutron-star') })
  it('colors debris', () => { expect(remnantColor('debris')).toContain('debris') })
})

describe('legacyColor', () => {
  it('colors cosmic-legacy', () => { expect(legacyColor('cosmic-legacy')).toContain('cosmic-legacy') })
  it('colors nonexistent', () => { expect(legacyColor('nonexistent')).toContain('nonexistent') })
})

describe('clusterColor', () => {
  it('colors globular-cluster', () => { expect(clusterColor('globular-cluster')).toContain('globular-cluster') })
  it('colors void', () => { expect(clusterColor('void')).toContain('void') })
})

// ─── JSON Formatter ──────────────────────────────────────────────────────────

describe('formatStardustTrailJson', () => {
  it('returns valid JSON', () => {
    const result = buildStardustTrailResult([], [])
    const json = formatStardustTrailJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.remnants).toEqual([])
    expect(parsed.cosmos.overallCosmic).toBe(0)
  })
})

// ─── Table Formatter ─────────────────────────────────────────────────────────

describe('formatStardustTrailTable', () => {
  it('includes Stardust Trail Analysis header', () => {
    const result = buildStardustTrailResult([], [])
    const table = formatStardustTrailTable(result, false)
    expect(table).toContain('Stardust Trail Analysis')
  })

  it('includes statistics in table output', () => {
    const result = buildStardustTrailResult(['rich.ts'], [RICH_CONTENT])
    const table = formatStardustTrailTable(result, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Astronomer Grade')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildStardustTrailResult(['rich.ts'], [RICH_CONTENT])
    const table = formatStardustTrailTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations', () => {
    const result = buildStardustTrailResult(['rich.ts'], [RICH_CONTENT])
    const table = formatStardustTrailTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
