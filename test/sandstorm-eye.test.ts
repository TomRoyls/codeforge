import { describe, it, expect } from 'vitest'
import {
  measureResilient,
  measureFocused,
  measureFiltering,
  measureEnduring,
  measureNavigating,
  measureSurviving,
  analyzeStormGrain,
  classifyCondition,
  classifyClusterType,
  classifyClusterCondition,
  classifyNomadGrade,
  analyzeOasisCluster,
  generateRecommendations,
  buildSandstormEyeResult,
} from '../src/commands/sandstorm-eye-helpers.js'
import {
  scoreColor,
  calmColor,
  stillnessColor,
  filteringQualityColor,
  visibilityColor,
  skillColor,
  fitnessColor,
  conditionColor,
  nomadGradeColor,
  formatSandstormEyeJson,
  formatSandstormEyeTable,
} from '../src/commands/sandstorm-eye-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User {
  id: number
  name: string
  email: string
}

export class UserService {
  private readonly users: Map<number, User> = new Map()

  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      if (user === undefined) {
        return null
      }
      return user
    } catch {
      return null
    }
  }
}

export type Result<T> = { data: T; error?: string }

export function processItems(items: string[]): number {
  const processed = items.filter((item) => item.length > 0)
  return processed.length
}

const config = {
  readonly maxRetries: 3,
  timeout: 5000,
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  const service = new UserService()
  const user = await service.getUser(1)
  const result: Result<User | null> = { data: user }
  console.log(result)
}`

const EMPTY = ''
const MINIMAL = 'const x = 1'
const POOR = 'var x = 1\nvar y: any = 2'

// ─── measureResilient ──────────────────────────────────────────────────────

describe('measureResilient', () => {
  it('returns stability=98 for RICH fixture', () => {
    expect(measureResilient(RICH).stability).toBe(98)
  })

  it('returns eye-of-storm calm for RICH fixture', () => {
    expect(measureResilient(RICH).calm).toBe('eye-of-storm')
  })

  it('returns hasHighStability=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasHighStability).toBe(true)
  })

  it('returns hasStable=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasStable).toBe(true)
  })

  it('returns hasGrounded=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasGrounded).toBe(true)
  })

  it('returns hasNoTurbulence=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasNoTurbulence).toBe(true)
  })

  it('returns hasResilient=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasResilient).toBe(true)
  })

  it('returns hasNoFragility=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasNoFragility).toBe(true)
  })

  it('returns hasComposed=false for RICH fixture', () => {
    expect(measureResilient(RICH).hasComposed).toBe(false)
  })

  it('returns hasCentered=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasCentered).toBe(true)
  })

  it('returns stability=0 for EMPTY fixture', () => {
    expect(measureResilient(EMPTY).stability).toBe(0)
  })

  it('returns blown-away for EMPTY fixture', () => {
    expect(measureResilient(EMPTY).calm).toBe('blown-away')
  })

  it('returns stability=10 for MINIMAL fixture', () => {
    expect(measureResilient(MINIMAL).stability).toBe(10)
  })

  it('returns turbulenceCount=2 for POOR fixture', () => {
    expect(measureResilient(POOR).turbulenceCount).toBe(2)
  })

  it('returns panicCount=1 for POOR fixture', () => {
    expect(measureResilient(POOR).panicCount).toBe(1)
  })

  it('returns hasNoTurbulence=false for POOR fixture', () => {
    expect(measureResilient(POOR).hasNoTurbulence).toBe(false)
  })
})

// ─── measureFocused ────────────────────────────────────────────────────────

describe('measureFocused', () => {
  it('returns clarity=98 for RICH fixture', () => {
    expect(measureFocused(RICH).clarity).toBe(98)
  })

  it('returns zen-master stillness for RICH fixture', () => {
    expect(measureFocused(RICH).stillness).toBe('zen-master')
  })

  it('returns hasHighClarity=true for RICH fixture', () => {
    expect(measureFocused(RICH).hasHighClarity).toBe(true)
  })

  it('returns hasPurposeful=true for RICH fixture', () => {
    expect(measureFocused(RICH).hasPurposeful).toBe(true)
  })

  it('returns hasDirected=false for RICH fixture', () => {
    expect(measureFocused(RICH).hasDirected).toBe(false)
  })

  it('returns clarity=0 for EMPTY fixture', () => {
    expect(measureFocused(EMPTY).clarity).toBe(0)
  })

  it('returns lost for EMPTY fixture', () => {
    expect(measureFocused(EMPTY).stillness).toBe('lost')
  })

  it('returns clarity=8 for MINIMAL fixture', () => {
    expect(measureFocused(MINIMAL).clarity).toBe(8)
  })

  it('returns distractionCount=2 for POOR fixture', () => {
    expect(measureFocused(POOR).distractionCount).toBe(2)
  })

  it('returns tangentCount=1 for POOR fixture', () => {
    expect(measureFocused(POOR).tangentCount).toBe(1)
  })
})

// ─── measureFiltering ──────────────────────────────────────────────────────

describe('measureFiltering', () => {
  it('returns signalToNoise=100 for RICH fixture', () => {
    expect(measureFiltering(RICH).signalToNoise).toBe(100)
  })

  it('returns pure-crystal quality for RICH fixture', () => {
    expect(measureFiltering(RICH).quality).toBe('pure-crystal')
  })

  it('returns hasHighSignalToNoise=true for RICH fixture', () => {
    expect(measureFiltering(RICH).hasHighSignalToNoise).toBe(true)
  })

  it('returns hasValuable=true for RICH fixture', () => {
    expect(measureFiltering(RICH).hasValuable).toBe(true)
  })

  it('returns hasConcentrated=false for RICH fixture', () => {
    expect(measureFiltering(RICH).hasConcentrated).toBe(false)
  })

  it('returns signalToNoise=0 for EMPTY fixture', () => {
    expect(measureFiltering(EMPTY).signalToNoise).toBe(0)
  })

  it('returns raw-sand for EMPTY fixture', () => {
    expect(measureFiltering(EMPTY).quality).toBe('raw-sand')
  })

  it('returns wasteCount=2 for POOR fixture', () => {
    expect(measureFiltering(POOR).wasteCount).toBe(2)
  })

  it('returns noiseCount=1 for POOR fixture', () => {
    expect(measureFiltering(POOR).noiseCount).toBe(1)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns persistence=100 for RICH fixture', () => {
    expect(measureEnduring(RICH).persistence).toBe(100)
  })

  it('returns eternal-flame visibility for RICH fixture', () => {
    expect(measureEnduring(RICH).visibility).toBe('eternal-flame')
  })

  it('returns hasHighPersistence=true for RICH fixture', () => {
    expect(measureEnduring(RICH).hasHighPersistence).toBe(true)
  })

  it('returns hasReliable=true for RICH fixture', () => {
    expect(measureEnduring(RICH).hasReliable).toBe(true)
  })

  it('returns persistence=0 for EMPTY fixture', () => {
    expect(measureEnduring(EMPTY).persistence).toBe(0)
  })

  it('returns extinguished for EMPTY fixture', () => {
    expect(measureEnduring(EMPTY).visibility).toBe('extinguished')
  })

  it('returns persistence=10 for MINIMAL fixture', () => {
    expect(measureEnduring(MINIMAL).persistence).toBe(10)
  })

  it('returns ephemeralCount=2 for POOR fixture', () => {
    expect(measureEnduring(POOR).ephemeralCount).toBe(2)
  })

  it('returns fadingCount=1 for POOR fixture', () => {
    expect(measureEnduring(POOR).fadingCount).toBe(1)
  })
})

// ─── measureNavigating ─────────────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns errorHandling=83 for RICH fixture', () => {
    expect(measureNavigating(RICH).errorHandling).toBe(83)
  })

  it('returns pathfinder skill for RICH fixture', () => {
    expect(measureNavigating(RICH).skill).toBe('pathfinder')
  })

  it('returns hasHighErrorHandling=true for RICH fixture', () => {
    expect(measureNavigating(RICH).hasHighErrorHandling).toBe(true)
  })

  it('returns hasErrorHandling=true for RICH fixture', () => {
    expect(measureNavigating(RICH).hasErrorHandling).toBe(true)
  })

  it('returns hasDefensive=false for RICH fixture', () => {
    expect(measureNavigating(RICH).hasDefensive).toBe(false)
  })

  it('returns hasGraceful=false for RICH fixture', () => {
    expect(measureNavigating(RICH).hasGraceful).toBe(false)
  })

  it('returns hasRecovery=true for RICH fixture', () => {
    expect(measureNavigating(RICH).hasRecovery).toBe(true)
  })

  it('returns errorHandling=0 for EMPTY fixture', () => {
    expect(measureNavigating(EMPTY).errorHandling).toBe(0)
  })

  it('returns doomed for EMPTY fixture', () => {
    expect(measureNavigating(EMPTY).skill).toBe('doomed')
  })

  it('returns errorHandling=16 for MINIMAL fixture', () => {
    expect(measureNavigating(MINIMAL).errorHandling).toBe(16)
  })

  it('returns crashPathCount=2 for POOR fixture', () => {
    expect(measureNavigating(POOR).crashPathCount).toBe(2)
  })
})

// ─── measureSurviving ──────────────────────────────────────────────────────

describe('measureSurviving', () => {
  it('returns durability=100 for RICH fixture', () => {
    expect(measureSurviving(RICH).durability).toBe(100)
  })

  it('returns desert-hardy fitness for RICH fixture', () => {
    expect(measureSurviving(RICH).fitness).toBe('desert-hardy')
  })

  it('returns hasHighDurability=true for RICH fixture', () => {
    expect(measureSurviving(RICH).hasHighDurability).toBe(true)
  })

  it('returns hasNoBrittleness=true for RICH fixture', () => {
    expect(measureSurviving(RICH).hasNoBrittleness).toBe(true)
  })

  it('returns hasNoFragility=true for RICH fixture', () => {
    expect(measureSurviving(RICH).hasNoFragility).toBe(true)
  })

  it('returns hasNoVulnerability=true for RICH fixture', () => {
    expect(measureSurviving(RICH).hasNoVulnerability).toBe(true)
  })

  it('returns hasNoWeakness=true for RICH fixture', () => {
    expect(measureSurviving(RICH).hasNoWeakness).toBe(true)
  })

  it('returns durability=0 for EMPTY fixture', () => {
    expect(measureSurviving(EMPTY).durability).toBe(0)
  })

  it('returns dead for EMPTY fixture', () => {
    expect(measureSurviving(EMPTY).fitness).toBe('dead')
  })

  it('returns brittlenessCount=2 for POOR fixture', () => {
    expect(measureSurviving(POOR).brittlenessCount).toBe(2)
  })

  it('returns fragilityCount=1 for POOR fixture', () => {
    expect(measureSurviving(POOR).fragilityCount).toBe(1)
  })

  it('returns hasNoBrittleness=false for POOR fixture', () => {
    expect(measureSurviving(POOR).hasNoBrittleness).toBe(false)
  })

  it('returns hasNoVulnerability=false for POOR fixture', () => {
    expect(measureSurviving(POOR).hasNoVulnerability).toBe(false)
  })
})

// ─── analyzeStormGrain ─────────────────────────────────────────────────────

describe('analyzeStormGrain', () => {
  it('returns qualityScore=97 for RICH fixture', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').qualityScore).toBe(97)
  })

  it('returns storm-calmer condition for RICH fixture', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').condition).toBe('storm-calmer')
  })

  it('returns qualityScore=0 for EMPTY fixture', () => {
    expect(analyzeStormGrain(EMPTY, 'empty.ts').qualityScore).toBe(0)
  })

  it('returns total-whiteout for EMPTY fixture', () => {
    expect(analyzeStormGrain(EMPTY, 'empty.ts').condition).toBe('total-whiteout')
  })

  it('returns qualityScore=10 for MINIMAL fixture', () => {
    expect(analyzeStormGrain(MINIMAL, 'minimal.ts').qualityScore).toBe(10)
  })

  it('returns qualityScore=1 for POOR fixture', () => {
    expect(analyzeStormGrain(POOR, 'poor.ts').qualityScore).toBe(1)
  })

  it('sets file path correctly', () => {
    expect(analyzeStormGrain(RICH, 'my/file.ts').file).toBe('my/file.ts')
  })

  it('carries chaosResilience from measureResilient', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').chaosResilience).toBe(98)
  })

  it('carries stillnessFocus from measureFocused', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').stillnessFocus).toBe(98)
  })

  it('carries grainFiltration from measureFiltering', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').grainFiltration).toBe(100)
  })

  it('carries visibilityEndurance from measureEnduring', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').visibilityEndurance).toBe(100)
  })

  it('carries stormNavigation from measureNavigating', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').stormNavigation).toBe(83)
  })

  it('carries desertSurvival from measureSurviving', () => {
    expect(analyzeStormGrain(RICH, 'test.ts').desertSurvival).toBe(100)
  })
})

// ─── Classification Functions ──────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns storm-calmer for score >= 85', () => {
    expect(classifyCondition(90)).toBe('storm-calmer')
  })

  it('returns clearing-skies for score >= 70', () => {
    expect(classifyCondition(75)).toBe('clearing-skies')
  })

  it('returns dust-settling for score >= 55', () => {
    expect(classifyCondition(60)).toBe('dust-settling')
  })

  it('returns gritty-wind for score >= 40', () => {
    expect(classifyCondition(45)).toBe('gritty-wind')
  })

  it('returns howling-gale for score >= 25', () => {
    expect(classifyCondition(30)).toBe('howling-gale')
  })

  it('returns total-whiteout for score < 25', () => {
    expect(classifyCondition(10)).toBe('total-whiteout')
  })
})

describe('classifyNomadGrade', () => {
  it('returns desert-sage for avgResilience >= 80', () => {
    expect(classifyNomadGrade(85)).toBe('desert-sage')
  })

  it('returns master-nomad for avgResilience >= 65', () => {
    expect(classifyNomadGrade(70)).toBe('master-nomad')
  })

  it('returns experienced-guide for avgResilience >= 50', () => {
    expect(classifyNomadGrade(55)).toBe('experienced-guide')
  })

  it('returns seasoned-traveler for avgResilience >= 35', () => {
    expect(classifyNomadGrade(40)).toBe('seasoned-traveler')
  })

  it('returns lost-wanderer for avgResilience >= 20', () => {
    expect(classifyNomadGrade(25)).toBe('lost-wanderer')
  })

  it('returns sand-blinded for avgResilience < 20', () => {
    expect(classifyNomadGrade(10)).toBe('sand-blinded')
  })
})

describe('classifyClusterType', () => {
  it('returns wasteland for empty grains', () => {
    expect(classifyClusterType([])).toBe('wasteland')
  })

  it('returns desert-oasis for high quality grains', () => {
    const grains = [analyzeStormGrain(RICH, 'a.ts')]
    expect(classifyClusterType(grains)).toBe('desert-oasis')
  })
})

describe('classifyClusterCondition', () => {
  it('returns safe-haven for avgQs >= 75', () => {
    expect(classifyClusterCondition(80)).toBe('safe-haven')
  })

  it('returns sheltered-ground for avgQs >= 60', () => {
    expect(classifyClusterCondition(65)).toBe('sheltered-ground')
  })

  it('returns navigable-terrain for avgQs >= 45', () => {
    expect(classifyClusterCondition(50)).toBe('navigable-terrain')
  })

  it('returns difficult-passage for avgQs >= 30', () => {
    expect(classifyClusterCondition(35)).toBe('difficult-passage')
  })

  it('returns hostile-ground for avgQs >= 15', () => {
    expect(classifyClusterCondition(20)).toBe('hostile-ground')
  })

  it('returns death-valley for avgQs < 15', () => {
    expect(classifyClusterCondition(5)).toBe('death-valley')
  })
})

// ─── analyzeOasisCluster ───────────────────────────────────────────────────

describe('analyzeOasisCluster', () => {
  it('returns wasteland cluster for empty grains', () => {
    const cluster = analyzeOasisCluster([], 'empty-dir')
    expect(cluster.clusterType).toBe('wasteland')
    expect(cluster.condition).toBe('death-valley')
    expect(cluster.avgResilience).toBe(0)
    expect(cluster.grains).toHaveLength(0)
  })

  it('returns desert-oasis for RICH grains', () => {
    const grains = [analyzeStormGrain(RICH, 'a.ts')]
    const cluster = analyzeOasisCluster(grains, 'src')
    expect(cluster.clusterType).toBe('desert-oasis')
    expect(cluster.condition).toBe('safe-haven')
    expect(cluster.avgResilience).toBe(98)
    expect(cluster.stormCalmerCount).toBe(1)
  })
})

// ─── buildSandstormEyeResult ───────────────────────────────────────────────

describe('buildSandstormEyeResult', () => {
  it('returns empty result for no files', () => {
    const result = buildSandstormEyeResult([], [])
    expect(result.desert.avgResilience).toBe(0)
    expect(result.desert.isCalm).toBe(false)
    expect(result.desert.overallResilience).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.nomadGrade).toBe('sand-blinded')
    expect(result.grains).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
  })

  it('returns correct RICH single file result', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    expect(result.desert.avgResilience).toBe(98)
    expect(result.desert.avgFiltration).toBe(100)
    expect(result.desert.avgSurvival).toBe(100)
    expect(result.desert.isCalm).toBe(true)
    expect(result.desert.overallResilience).toBe(99)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalClusters).toBe(1)
    expect(result.stats.avgChaosResilience).toBe(98)
    expect(result.stats.avgStillnessFocus).toBe(98)
    expect(result.stats.avgGrainFiltration).toBe(100)
    expect(result.stats.avgVisibilityEndurance).toBe(100)
    expect(result.stats.avgStormNavigation).toBe(83)
    expect(result.stats.avgDesertSurvival).toBe(100)
    expect(result.stats.stormCalmerCount).toBe(1)
    expect(result.stats.totalWhiteoutCount).toBe(0)
    expect(result.stats.hasHighStabilityCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighSignalToNoiseCount).toBe(1)
    expect(result.stats.hasHighPersistenceCount).toBe(1)
    expect(result.stats.hasHighErrorHandlingCount).toBe(1)
    expect(result.stats.hasHighDurabilityCount).toBe(1)
    expect(result.stats.nomadGrade).toBe('desert-sage')
    expect(result.stats.bestGrain).toBe('test.ts')
    expect(result.stats.mostResilient).toBe('test.ts')
    expect(result.stats.mostFocused).toBe('test.ts')
    expect(result.stats.bestFiltered).toBe('test.ts')
    expect(result.stats.mostEnduring).toBe('test.ts')
    expect(result.stats.bestNavigator).toBe('test.ts')
  })

  it('returns perfect recommendation for RICH single file', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    expect(result.recommendations).toContain('Your code is the eye of the storm! Perfect calm amidst complexity')
  })

  it('handles multiple files correctly', () => {
    const result = buildSandstormEyeResult(['a.ts', 'b.ts'], [RICH, EMPTY])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.desert.avgResilience).toBe(49)
    expect(result.desert.avgFiltration).toBe(50)
    expect(result.desert.avgSurvival).toBe(50)
    expect(result.desert.isCalm).toBe(false)
    expect(result.desert.overallResilience).toBe(50)
    expect(result.stats.nomadGrade).toBe('experienced-guide')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const result = buildSandstormEyeResult(['poor.ts'], [POOR])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('recommends resilience improvement when avgChaosResilience < 50', () => {
    const result = buildSandstormEyeResult(['poor.ts'], [POOR])
    const hasResilienceRec = result.recommendations.some((r) => r.includes('resilience'))
    expect(hasResilienceRec).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('returns string for score 50', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('returns string for score 20', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })
})

describe('calmColor', () => {
  it('returns string for eye-of-storm', () => {
    expect(typeof calmColor('eye-of-storm')).toBe('string')
  })

  it('returns string for blown-away', () => {
    expect(typeof calmColor('blown-away')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(calmColor('unknown')).toBe('unknown')
  })
})

describe('stillnessColor', () => {
  it('returns string for zen-master', () => {
    expect(typeof stillnessColor('zen-master')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(stillnessColor('unknown')).toBe('unknown')
  })
})

describe('filteringQualityColor', () => {
  it('returns string for pure-crystal', () => {
    expect(typeof filteringQualityColor('pure-crystal')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(filteringQualityColor('unknown')).toBe('unknown')
  })
})

describe('visibilityColor', () => {
  it('returns string for eternal-flame', () => {
    expect(typeof visibilityColor('eternal-flame')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(visibilityColor('unknown')).toBe('unknown')
  })
})

describe('skillColor', () => {
  it('returns string for desert-guide', () => {
    expect(typeof skillColor('desert-guide')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(skillColor('unknown')).toBe('unknown')
  })
})

describe('fitnessColor', () => {
  it('returns string for desert-hardy', () => {
    expect(typeof fitnessColor('desert-hardy')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(fitnessColor('unknown')).toBe('unknown')
  })
})

describe('conditionColor', () => {
  it('returns string for storm-calmer', () => {
    expect(typeof conditionColor('storm-calmer')).toBe('string')
  })

  it('returns string for total-whiteout', () => {
    expect(typeof conditionColor('total-whiteout')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('nomadGradeColor', () => {
  it('returns string for desert-sage', () => {
    expect(typeof nomadGradeColor('desert-sage')).toBe('string')
  })

  it('returns string for sand-blinded', () => {
    expect(typeof nomadGradeColor('sand-blinded')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(nomadGradeColor('unknown')).toBe('unknown')
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatSandstormEyeJson', () => {
  it('returns valid JSON string', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    const json = formatSandstormEyeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.grains).toHaveLength(1)
    expect(parsed.desert.overallResilience).toBe(99)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatSandstormEyeTable', () => {
  it('returns formatted string with Sandstorm Eye header', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    const table = formatSandstormEyeTable(result, false)
    expect(table).toContain('Sandstorm Eye Analysis')
    expect(table).toContain('Desert:')
    expect(table).toContain('Statistics:')
  })

  it('includes per-file details when verbose=true', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    const table = formatSandstormEyeTable(result, true)
    expect(table).toContain('Per-File Grains:')
    expect(table).toContain('test.ts')
  })

  it('excludes per-file details when verbose=false', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    const table = formatSandstormEyeTable(result, false)
    expect(table).not.toContain('Per-File Grains:')
  })

  it('includes recommendations', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    const table = formatSandstormEyeTable(result, false)
    expect(table).toContain('Recommendations:')
  })

  it('includes condition counts', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    const table = formatSandstormEyeTable(result, false)
    expect(table).toContain('Condition Counts:')
    expect(table).toContain('Storm Calmer:')
  })

  it('includes highlights for non-empty result', () => {
    const result = buildSandstormEyeResult(['test.ts'], [RICH])
    const table = formatSandstormEyeTable(result, false)
    expect(table).toContain('Highlights:')
    expect(table).toContain('Best Grain:')
    expect(table).toContain('Most Resilient:')
  })
})
