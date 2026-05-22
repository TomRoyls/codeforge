import { describe, expect, it } from 'vitest'

import {
  analyzePoolCluster,
  analyzeTidePoolOrganism,
  buildTidePoolResult,
  classifyClusterCondition,
  classifyClusterType,
  classifyCondition,
  classifyMarineBiologistGrade,
  generateRecommendations,
  measureDiversity,
  measureHealth,
  measureNutrient,
  measureResilience,
  measureRetention,
  measureSubstrate,
} from '../src/commands/tide-pool-helpers.js'

import {
  conditionColor,
  formatTidePoolJson,
  formatTidePoolTable,
  clusterTypeColor,
  gradeColor,
  scoreColor,
} from '../src/commands/tide-pool-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface AuroraConfig {
  readonly id: string
  name: string
  intensity: number
  colors: string[]
  isActive: boolean
}

export class AuroraCalculator<T extends AuroraConfig> {
  private configs: T[] = []
  protected maxIntensity: number = 100

  constructor(initialConfigs?: T[]) {
    if (initialConfigs) {
      this.configs = initialConfigs
    }
  }

  async calculateIntensity(config: T): Promise<number> {
    try {
      const base = config.intensity
      const multiplier = config.isActive ? 2.0 : 0.5
      const result = Math.min(this.maxIntensity, base * multiplier)
      return Math.round(result)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
      return 0
    }
  }

  static createDefault(): AuroraCalculator<AuroraConfig> {
    return new AuroraCalculator<AuroraConfig>()
  }
}

/** Calculates aurora brightness */
export function calculateBrightness(colors: string[]): number {
  const green = colors.filter(c => c.includes('green'))
  return green.length * 10
}

export type AuroraPhase = 'dawn' | 'dusk' | 'night' | 'peak'
export enum AuroraType { BAND = 'band', CURTAIN = 'curtain', CORONA = 'corona' }
`

const EMPTY = ''

const MEDIUM = `export interface Config { name: string; value: number; }
export class Service {
  private config: Config;
  constructor(c: Config) { this.config = c; }
  async getValue(): Promise<string> {
    try { return String(this.config.value); } catch(e) { console.log(e); return ""; }
  }
}
export function helper(x: any): any { return x; }
`

// ─── measureResilience ─────────────────────────────────────────────────────

describe('measureResilience', () => {
  it('returns level 91 for RICH fixture', () => {
    expect(measureResilience(RICH).level).toBe(91)
  })

  it('returns level 37 for EMPTY fixture', () => {
    expect(measureResilience(EMPTY).level).toBe(37)
  })

  it('returns level 79 for MEDIUM fixture', () => {
    expect(measureResilience(MEDIUM).level).toBe(79)
  })

  it('returns adaptation anemone for RICH', () => {
    expect(measureResilience(RICH).adaptation).toBe('anemone')
  })

  it('returns adaptation jellyfish for EMPTY', () => {
    expect(measureResilience(EMPTY).adaptation).toBe('jellyfish')
  })

  it('returns adaptation crab for MEDIUM', () => {
    expect(measureResilience(MEDIUM).adaptation).toBe('crab')
  })

  it('hasHighResilience true for RICH', () => {
    expect(measureResilience(RICH).hasHighResilience).toBe(true)
  })

  it('hasTidalAdaptation true for RICH', () => {
    expect(measureResilience(RICH).hasTidalAdaptation).toBe(true)
  })

  it('hasNoSensitivity true for RICH', () => {
    expect(measureResilience(RICH).hasNoSensitivity).toBe(true)
  })

  it('hasNoDisplacement false for RICH (console+deepNested)', () => {
    expect(measureResilience(RICH).hasNoDisplacement).toBe(false)
  })

  it('hasRecoveryCapacity true for RICH (try-catch)', () => {
    expect(measureResilience(RICH).hasRecoveryCapacity).toBe(true)
  })

  it('sensitivityCount 0 for RICH', () => {
    expect(measureResilience(RICH).sensitivityCount).toBe(0)
  })

  it('displacementCount 2 for RICH', () => {
    expect(measureResilience(RICH).displacementCount).toBe(2)
  })
})

// ─── measureDiversity ──────────────────────────────────────────────────────

describe('measureDiversity', () => {
  it('returns level 90 for RICH fixture', () => {
    expect(measureDiversity(RICH).level).toBe(90)
  })

  it('returns level 24 for EMPTY fixture', () => {
    expect(measureDiversity(EMPTY).level).toBe(24)
  })

  it('returns level 70 for MEDIUM fixture', () => {
    expect(measureDiversity(MEDIUM).level).toBe(70)
  })

  it('returns richness kelp-beds for RICH', () => {
    expect(measureDiversity(RICH).richness).toBe('kelp-beds')
  })

  it('returns richness barren for EMPTY', () => {
    expect(measureDiversity(EMPTY).richness).toBe('barren')
  })

  it('returns richness sandy-bottom for MEDIUM', () => {
    expect(measureDiversity(MEDIUM).richness).toBe('sandy-bottom')
  })

  it('hasHighDiversity true for RICH', () => {
    expect(measureDiversity(RICH).hasHighDiversity).toBe(true)
  })

  it('hasFunctionalDiversity true for RICH', () => {
    expect(measureDiversity(RICH).hasFunctionalDiversity).toBe(true)
  })

  it('hasPatternVariety true for RICH', () => {
    expect(measureDiversity(RICH).hasPatternVariety).toBe(true)
  })

  it('hasNoMonoculture false for RICH (console)', () => {
    expect(measureDiversity(RICH).hasNoMonoculture).toBe(false)
  })

  it('monocultureCount 1 for RICH', () => {
    expect(measureDiversity(RICH).monocultureCount).toBe(1)
  })

  it('invasiveCount 0 for RICH', () => {
    expect(measureDiversity(RICH).invasiveCount).toBe(0)
  })
})

// ─── measureRetention ──────────────────────────────────────────────────────

describe('measureRetention', () => {
  it('returns level 90 for RICH fixture', () => {
    expect(measureRetention(RICH).level).toBe(90)
  })

  it('returns level 30 for EMPTY fixture', () => {
    expect(measureRetention(EMPTY).level).toBe(30)
  })

  it('returns level 74 for MEDIUM fixture', () => {
    expect(measureRetention(MEDIUM).level).toBe(74)
  })

  it('returns capacity depression for RICH', () => {
    expect(measureRetention(RICH).capacity).toBe('depression')
  })

  it('returns capacity dry for EMPTY', () => {
    expect(measureRetention(EMPTY).capacity).toBe('dry')
  })

  it('returns capacity saucer for MEDIUM', () => {
    expect(measureRetention(MEDIUM).capacity).toBe('saucer')
  })

  it('hasGoodRetention true for RICH', () => {
    expect(measureRetention(RICH).hasGoodRetention).toBe(true)
  })

  it('hasNoLeakage false for RICH (console)', () => {
    expect(measureRetention(RICH).hasNoLeakage).toBe(false)
  })

  it('hasProperCirculation true for RICH', () => {
    expect(measureRetention(RICH).hasProperCirculation).toBe(true)
  })

  it('leakageCount 1 for RICH', () => {
    expect(measureRetention(RICH).leakageCount).toBe(1)
  })

  it('overflowCount 1 for RICH (deepNested)', () => {
    expect(measureRetention(RICH).overflowCount).toBe(1)
  })

  it('hasNoContamination false for RICH', () => {
    expect(measureRetention(RICH).hasNoContamination).toBe(false)
  })
})

// ─── measureSubstrate ──────────────────────────────────────────────────────

describe('measureSubstrate', () => {
  it('returns stability 91 for RICH fixture', () => {
    expect(measureSubstrate(RICH).stability).toBe(91)
  })

  it('returns stability 30 for EMPTY fixture', () => {
    expect(measureSubstrate(EMPTY).stability).toBe(30)
  })

  it('returns stability 77 for MEDIUM fixture', () => {
    expect(measureSubstrate(MEDIUM).stability).toBe(77)
  })

  it('returns type boulder for RICH', () => {
    expect(measureSubstrate(RICH).type).toBe('boulder')
  })

  it('returns type quicksand for EMPTY', () => {
    expect(measureSubstrate(EMPTY).type).toBe('quicksand')
  })

  it('returns type cobble for MEDIUM', () => {
    expect(measureSubstrate(MEDIUM).type).toBe('cobble')
  })

  it('isStable true for RICH', () => {
    expect(measureSubstrate(RICH).isStable).toBe(true)
  })

  it('isStable true for MEDIUM', () => {
    expect(measureSubstrate(MEDIUM).isStable).toBe(true)
  })

  it('hasNoErosion true for RICH', () => {
    expect(measureSubstrate(RICH).hasNoErosion).toBe(true)
  })

  it('hasNoShifting false for RICH (console)', () => {
    expect(measureSubstrate(RICH).hasNoShifting).toBe(false)
  })

  it('erosionCount 1 for RICH', () => {
    expect(measureSubstrate(RICH).erosionCount).toBe(1)
  })

  it('shiftingCount 1 for RICH', () => {
    expect(measureSubstrate(RICH).shiftingCount).toBe(1)
  })
})

// ─── measureNutrient ───────────────────────────────────────────────────────

describe('measureNutrient', () => {
  it('returns cycling 80 for RICH fixture', () => {
    expect(measureNutrient(RICH).cycling).toBe(80)
  })

  it('returns cycling 27 for EMPTY fixture', () => {
    expect(measureNutrient(EMPTY).cycling).toBe(27)
  })

  it('returns cycling 72 for MEDIUM fixture', () => {
    expect(measureNutrient(MEDIUM).cycling).toBe(72)
  })

  it('returns flow tidal for RICH', () => {
    expect(measureNutrient(RICH).flow).toBe('tidal')
  })

  it('returns flow absent for EMPTY', () => {
    expect(measureNutrient(EMPTY).flow).toBe('absent')
  })

  it('returns flow diffusion for MEDIUM', () => {
    expect(measureNutrient(MEDIUM).flow).toBe('diffusion')
  })

  it('hasProperCycling true for RICH', () => {
    expect(measureNutrient(RICH).hasProperCycling).toBe(true)
  })

  it('hasInputProcessing false for RICH (no import)', () => {
    expect(measureNutrient(RICH).hasInputProcessing).toBe(false)
  })

  it('hasOutputGeneration true for RICH', () => {
    expect(measureNutrient(RICH).hasOutputGeneration).toBe(true)
  })

  it('hasNoBlockage false for RICH (deepNested)', () => {
    expect(measureNutrient(RICH).hasNoBlockage).toBe(false)
  })

  it('accumulationCount 1 for RICH', () => {
    expect(measureNutrient(RICH).accumulationCount).toBe(1)
  })

  it('blockageCount 1 for RICH', () => {
    expect(measureNutrient(RICH).blockageCount).toBe(1)
  })
})

// ─── measureHealth ─────────────────────────────────────────────────────────

describe('measureHealth', () => {
  it('returns score 98 for RICH fixture', () => {
    expect(measureHealth(RICH).score).toBe(98)
  })

  it('returns score 25 for EMPTY fixture', () => {
    expect(measureHealth(EMPTY).score).toBe(25)
  })

  it('returns score 77 for MEDIUM fixture', () => {
    expect(measureHealth(MEDIUM).score).toBe(77)
  })

  it('returns status healthy for RICH', () => {
    expect(measureHealth(RICH).status).toBe('healthy')
  })

  it('returns status dead for EMPTY', () => {
    expect(measureHealth(EMPTY).status).toBe('dead')
  })

  it('returns status declining for MEDIUM', () => {
    expect(measureHealth(MEDIUM).status).toBe('declining')
  })

  it('isHealthy true for RICH', () => {
    expect(measureHealth(RICH).isHealthy).toBe(true)
  })

  it('hasGoodWaterQuality false for RICH (console)', () => {
    expect(measureHealth(RICH).hasGoodWaterQuality).toBe(false)
  })

  it('hasBiodiversity true for RICH', () => {
    expect(measureHealth(RICH).hasBiodiversity).toBe(true)
  })

  it('hasNoPollution false for RICH', () => {
    expect(measureHealth(RICH).hasNoPollution).toBe(false)
  })

  it('pollutionCount 2 for RICH', () => {
    expect(measureHealth(RICH).pollutionCount).toBe(2)
  })

  it('dieoffCount 0 for RICH', () => {
    expect(measureHealth(RICH).dieoffCount).toBe(0)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns pristine-pool for RICH model', () => {
    const organism = analyzeTidePoolOrganism(RICH, 'test.ts')
    expect(classifyCondition(organism)).toBe('pristine-pool')
  })

  it('returns degraded-pool for EMPTY model', () => {
    const organism = analyzeTidePoolOrganism(EMPTY, 'empty.ts')
    expect(classifyCondition(organism)).toBe('degraded-pool')
  })

  it('returns healthy-tide for MEDIUM model', () => {
    const organism = analyzeTidePoolOrganism(MEDIUM, 'medium.ts')
    expect(classifyCondition(organism)).toBe('healthy-tide')
  })
})

// ─── analyzeTidePoolOrganism ───────────────────────────────────────────────

describe('analyzeTidePoolOrganism', () => {
  it('returns qualityScore 90 for RICH', () => {
    expect(analyzeTidePoolOrganism(RICH, 'rich.ts').qualityScore).toBe(90)
  })

  it('returns qualityScore 29 for EMPTY', () => {
    expect(analyzeTidePoolOrganism(EMPTY, 'empty.ts').qualityScore).toBe(29)
  })

  it('returns qualityScore 75 for MEDIUM', () => {
    expect(analyzeTidePoolOrganism(MEDIUM, 'medium.ts').qualityScore).toBe(75)
  })

  it('returns condition pristine-pool for RICH', () => {
    expect(analyzeTidePoolOrganism(RICH, 'rich.ts').condition).toBe('pristine-pool')
  })

  it('returns condition degraded-pool for EMPTY', () => {
    expect(analyzeTidePoolOrganism(EMPTY, 'empty.ts').condition).toBe('degraded-pool')
  })

  it('returns condition healthy-tide for MEDIUM', () => {
    expect(analyzeTidePoolOrganism(MEDIUM, 'medium.ts').condition).toBe('healthy-tide')
  })

  it('includes all 6 measure properties', () => {
    const organism = analyzeTidePoolOrganism(RICH, 'test.ts')
    expect(organism).toHaveProperty('resilience')
    expect(organism).toHaveProperty('diversity')
    expect(organism).toHaveProperty('retention')
    expect(organism).toHaveProperty('substrate')
    expect(organism).toHaveProperty('nutrient')
    expect(organism).toHaveProperty('health')
  })

  it('stores file path correctly', () => {
    expect(analyzeTidePoolOrganism(RICH, 'src/app.ts').file).toBe('src/app.ts')
  })
})

// ─── classifyClusterType ───────────────────────────────────────────────────

describe('classifyClusterType', () => {
  it('returns drainage-ditch for empty organisms', () => {
    expect(classifyClusterType([])).toBe('drainage-ditch')
  })

  it('returns marine-sanctuary for RICH single file', () => {
    const organisms = [analyzeTidePoolOrganism(RICH, 'rich.ts')]
    expect(classifyClusterType(organisms)).toBe('marine-sanctuary')
  })
})

// ─── classifyClusterCondition ──────────────────────────────────────────────

describe('classifyClusterCondition', () => {
  it('returns national-park for avgQuality 90', () => {
    expect(classifyClusterCondition(90)).toBe('national-park')
  })

  it('returns industrial for avgQuality 10', () => {
    expect(classifyClusterCondition(10)).toBe('industrial')
  })

  it('returns conservation for avgQuality 50', () => {
    expect(classifyClusterCondition(50)).toBe('conservation')
  })
})

// ─── classifyMarineBiologistGrade ──────────────────────────────────────────

describe('classifyMarineBiologistGrade', () => {
  it('returns chief-scientist for 80+', () => {
    expect(classifyMarineBiologistGrade(90)).toBe('chief-scientist')
  })

  it('returns tourist for below 20', () => {
    expect(classifyMarineBiologistGrade(10)).toBe('tourist')
  })

  it('returns ecologist for 50', () => {
    expect(classifyMarineBiologistGrade(50)).toBe('ecologist')
  })

  it('returns beachcomber for 25', () => {
    expect(classifyMarineBiologistGrade(25)).toBe('beachcomber')
  })
})

// ─── analyzePoolCluster ────────────────────────────────────────────────────

describe('analyzePoolCluster', () => {
  it('returns drainage-ditch cluster for empty organisms', () => {
    const cluster = analyzePoolCluster([], 'empty-dir')
    expect(cluster.clusterType).toBe('drainage-ditch')
    expect(cluster.condition).toBe('industrial')
    expect(cluster.organisms).toHaveLength(0)
  })

  it('computes avgResilience correctly for RICH', () => {
    const organisms = [analyzeTidePoolOrganism(RICH, 'rich.ts')]
    const cluster = analyzePoolCluster(organisms, 'src')
    expect(cluster.avgResilience).toBe(91)
  })

  it('counts pristineCount correctly', () => {
    const organisms = [analyzeTidePoolOrganism(RICH, 'rich.ts')]
    const cluster = analyzePoolCluster(organisms, 'src')
    expect(cluster.pristineCount).toBe(1)
  })
})

// ─── buildTidePoolResult ───────────────────────────────────────────────────

describe('buildTidePoolResult', () => {
  it('returns empty result for no files', () => {
    const result = buildTidePoolResult([], [])
    expect(result.organisms).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.coastline.overallHealth).toBe(0)
    expect(result.coastline.isThriving).toBe(false)
  })

  it('returns correct stats for single RICH file', () => {
    const result = buildTidePoolResult(['rich.ts'], [RICH])
    expect(result.organisms).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.organisms[0].qualityScore).toBe(90)
    expect(result.coastline.overallHealth).toBe(90)
    expect(result.coastline.isThriving).toBe(true)
    expect(result.stats.marineBiologistGrade).toBe('chief-scientist')
    expect(result.stats.bestOrganism).toBe('rich.ts')
  })

  it('returns correct condition counts for mixed files', () => {
    const result = buildTidePoolResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.pristinePoolCount).toBe(1)
    expect(result.stats.deadZoneCount).toBe(0)
    expect(result.stats.degradedPoolCount).toBe(1)
    expect(result.stats.healthyTideCount).toBe(1)
  })

  it('computes overallHealth as average qualityScore', () => {
    const result = buildTidePoolResult(
      ['rich.ts', 'empty.ts'],
      [RICH, EMPTY],
    )
    expect(result.coastline.overallHealth).toBe(Math.round((90 + 29) / 2))
  })

  it('generates recommendations', () => {
    const result = buildTidePoolResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('identifies mostResilient file', () => {
    const result = buildTidePoolResult(
      ['rich.ts', 'medium.ts'],
      [RICH, MEDIUM],
    )
    expect(result.stats.mostResilient).toBe('rich.ts')
  })

  it('identifies bestOrganism', () => {
    const result = buildTidePoolResult(
      ['rich.ts', 'empty.ts'],
      [RICH, EMPTY],
    )
    expect(result.stats.bestOrganism).toBe('rich.ts')
  })

  it('groups files into clusters by directory', () => {
    const result = buildTidePoolResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MEDIUM, EMPTY],
    )
    expect(result.clusters).toHaveLength(2)
    expect(result.stats.totalClusters).toBe(2)
  })

  it('single file in root goes to . cluster', () => {
    const result = buildTidePoolResult(['app.ts'], [RICH])
    expect(result.clusters).toHaveLength(1)
    expect(result.clusters[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns pristine recommendation when all is good', () => {
    const result = buildTidePoolResult(['rich.ts'], [RICH])
    const recs = generateRecommendations(result.organisms, result.clusters, result.coastline, result.stats)
    expect(recs).toContain('Pristine tide pool — your code teems with resilient, diverse life')
  })

  it('suggests improving resilience when low', () => {
    const result = buildTidePoolResult(['empty.ts'], [EMPTY])
    const recs = generateRecommendations(result.organisms, result.clusters, result.coastline, result.stats)
    expect(recs.some(r => r.includes('tidal resilience'))).toBe(true)
  })

  it('warns about no healthy organisms', () => {
    const result = buildTidePoolResult(['empty.ts'], [EMPTY])
    const recs = generateRecommendations(result.organisms, result.clusters, result.coastline, result.stats)
    expect(recs.some(r => r.includes('healthy organisms'))).toBe(true)
  })
})

// ─── formatTidePoolJson ────────────────────────────────────────────────────

describe('formatTidePoolJson', () => {
  it('returns valid JSON string', () => {
    const result = buildTidePoolResult(['test.ts'], [RICH])
    const json = formatTidePoolJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.organisms).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── formatTidePoolTable ───────────────────────────────────────────────────

describe('formatTidePoolTable', () => {
  it('includes coastline overview section', () => {
    const result = buildTidePoolResult(['test.ts'], [RICH])
    const table = formatTidePoolTable(result, false)
    expect(table).toContain('Tide Pool Analysis')
    expect(table).toContain('Overall Health')
  })

  it('includes per-organism breakdown when verbose', () => {
    const result = buildTidePoolResult(['test.ts'], [RICH])
    const table = formatTidePoolTable(result, true)
    expect(table).toContain('Per-Organism Breakdown')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations', () => {
    const result = buildTidePoolResult(['test.ts'], [RICH])
    const table = formatTidePoolTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('returns string for score 50', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('returns string for score 10', () => {
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns string for pristine-pool', () => {
    expect(typeof conditionColor('pristine-pool')).toBe('string')
  })

  it('returns string for dead-zone', () => {
    expect(typeof conditionColor('dead-zone')).toBe('string')
  })
})

describe('gradeColor', () => {
  it('returns string for chief-scientist', () => {
    expect(typeof gradeColor('chief-scientist')).toBe('string')
  })

  it('returns string for tourist', () => {
    expect(typeof gradeColor('tourist')).toBe('string')
  })
})

describe('clusterTypeColor', () => {
  it('returns string for marine-sanctuary', () => {
    expect(typeof clusterTypeColor('marine-sanctuary')).toBe('string')
  })

  it('returns string for drainage-ditch', () => {
    expect(typeof clusterTypeColor('drainage-ditch')).toBe('string')
  })
})
