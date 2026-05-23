import { describe, expect, it } from 'vitest'

import {
  analyzeShardEdge,
  analyzeShardCollection,
  buildObsidianShardResult,
  classifyCollectionCondition,
  classifyCollectionType,
  classifyCondition,
  classifyFlintknapperGrade,
  generateRecommendations,
  measureCutting,
  measureDangerous,
  measureEdge,
  measureFracture,
  measureSharp,
  measureVolcanic,
  type ShardEdge,
} from '../src/commands/obsidian-shard-helpers.js'

import {
  accuracyColor,
  conditionColor,
  coverageColor,
  dangerColor,
  edgeColor,
  fractureColor,
  formatObsidianShardJson,
  formatObsidianShardTable,
  gradeColor,
  scoreColor,
  volcanicColor,
} from '../src/commands/obsidian-shard-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `import { readFileSync } from 'fs'
import type { Config } from './types'
import { strictEqual } from 'assert'

/**
 * Process config file
 */
export interface ShardConfig {
  readonly name: string
  readonly version: number
  readonly enabled: boolean
}

export class ShardProcessor<T extends ShardConfig> {
  private data: T | null = null

  constructor(private readonly config: T) {}

  async process(): Promise<string> {
    try {
      if (this.config?.name) {
        const result: string = await this.validate(this.config)
        return result ?? 'done'
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Processing failed: ' + error.message)
      }
    } finally {
      this.cleanup()
    }
    return 'empty'
  }

  private async validate(config: T): Promise<string> {
    if (config.version === undefined || config.version === null) {
      throw new Error('Invalid version')
    }
    return 'valid'
  }

  private cleanup(): void {
    this.data = null
  }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: Error }

function assertNever(x: never): never {
  throw new Error('Unreachable: ' + String(x))
}
`

const MEDIUM = `
var x = 1
var y = 2
function add(a, b) {
  return a + b
}
module.exports = { add }
`

// ─── measureSharp ──────────────────────────────────────────────────────────

describe('measureSharp', () => {
  it('measures RICH content with high precision', () => {
    const result = measureSharp(RICH)
    expect(result.precision).toBe(80)
    expect(result.edge).toBe('surgical-precision')
    expect(result.hasHighPrecision).toBe(true)
    expect(result.hasExact).toBe(true)
    expect(result.hasPrecise).toBe(true)
    expect(result.hasNoSloppiness).toBe(true)
    expect(result.hasTargeted).toBe(true)
    expect(result.hasNoScatter).toBe(true)
    expect(result.hasSharpLogic).toBe(false)
    expect(result.hasNoFuzziness).toBe(true)
    expect(result.hasCrisp).toBe(true)
    expect(result.hasNoBlurriness).toBe(true)
    expect(result.sloppinessCount).toBe(0)
    expect(result.scatterCount).toBe(0)
  })

  it('measures MEDIUM content with low precision', () => {
    const result = measureSharp(MEDIUM)
    expect(result.precision).toBe(0)
    expect(result.edge).toBe('blunt')
    expect(result.hasHighPrecision).toBe(false)
    expect(result.hasNoSloppiness).toBe(false)
    expect(result.sloppinessCount).toBe(2)
    expect(result.scatterCount).toBe(0)
    expect(result.hasNoScatter).toBe(true)
  })

  it('measures empty content as blunt', () => {
    const result = measureSharp('')
    expect(result.precision).toBe(0)
    expect(result.edge).toBe('blunt')
    expect(result.hasHighPrecision).toBe(false)
  })

  it('detects enum and literal types as sharp logic', () => {
    const code = `enum Direction { Up, Down }\ntype Status = 'active' | 'inactive' | 'pending'\nconst x = 1`
    const result = measureSharp(code)
    expect(result.hasSharpLogic).toBe(true)
  })
})

// ─── measureEdge ───────────────────────────────────────────────────────────

describe('measureEdge', () => {
  it('measures RICH content with thorough edge coverage', () => {
    const result = measureEdge(RICH)
    expect(result.handling).toBe(78)
    expect(result.coverage).toBe('thorough-edge')
    expect(result.hasHighHandling).toBe(true)
    expect(result.hasBoundaryChecks).toBe(true)
    expect(result.hasInputValidation).toBe(true)
    expect(result.hasNoUnchecked).toBe(true)
    expect(result.hasErrorHandling).toBe(true)
    expect(result.hasNoBlindSpots).toBe(true)
    expect(result.hasNullChecks).toBe(true)
    expect(result.hasNoAssumptions).toBe(true)
    expect(result.hasTypeGuards).toBe(true)
    expect(result.hasNoGaps).toBe(true)
    expect(result.uncheckedCount).toBe(0)
    expect(result.blindSpotCount).toBe(0)
  })

  it('measures MEDIUM content with no coverage', () => {
    const result = measureEdge(MEDIUM)
    expect(result.handling).toBe(7)
    expect(result.coverage).toBe('no-coverage')
    expect(result.hasHighHandling).toBe(false)
  })

  it('measures empty content as no-coverage', () => {
    const result = measureEdge('')
    expect(result.handling).toBe(0)
    expect(result.coverage).toBe('no-coverage')
  })
})

// ─── measureFracture ───────────────────────────────────────────────────────

describe('measureFracture', () => {
  it('measures RICH content with expected pattern', () => {
    const result = measureFracture(RICH)
    expect(result.pattern).toBe(65)
    expect(result.quality).toBe('expected-pattern')
    expect(result.hasHighPattern).toBe(false)
    expect(result.hasGracefulErrors).toBe(true)
    expect(result.hasPredictable).toBe(false)
    expect(result.hasNoUnexpected).toBe(true)
    expect(result.hasContained).toBe(true)
    expect(result.hasNoCascade).toBe(true)
    expect(result.hasRecoverable).toBe(true)
    expect(result.hasNoSilent).toBe(true)
    expect(result.hasDiagnostic).toBe(true)
    expect(result.hasNoSwallowed).toBe(true)
    expect(result.unexpectedCount).toBe(0)
    expect(result.cascadeCount).toBe(0)
  })

  it('measures MEDIUM content as explosion', () => {
    const result = measureFracture(MEDIUM)
    expect(result.pattern).toBe(0)
    expect(result.quality).toBe('explosion')
    expect(result.hasGracefulErrors).toBe(false)
  })

  it('detects eval as unexpected pattern', () => {
    const code = `eval('dangerous code')`
    const result = measureFracture(code)
    expect(result.unexpectedCount).toBe(1)
    expect(result.hasNoUnexpected).toBe(false)
    expect(result.hasNoSilent).toBe(false)
    expect(result.hasNoSwallowed).toBe(false)
  })

  it('detects process.exit as cascade', () => {
    const code = `process.exit(1)`
    const result = measureFracture(code)
    expect(result.cascadeCount).toBe(1)
    expect(result.hasNoCascade).toBe(false)
  })
})

// ─── measureCutting ────────────────────────────────────────────────────────

describe('measureCutting', () => {
  it('measures RICH content with scalpel precision', () => {
    const result = measureCutting(RICH)
    expect(result.precision).toBe(83)
    expect(result.accuracy).toBe('scalpel-precise')
    expect(result.hasHighPrecision).toBe(true)
    expect(result.hasAccurate).toBe(true)
    expect(result.hasNoApproximation).toBe(true)
    expect(result.hasExact).toBe(true)
    expect(result.hasNoGuesswork).toBe(true)
    expect(result.hasCorrect).toBe(true)
    expect(result.hasNoApproximate).toBe(true)
    expect(result.hasPrecise).toBe(true)
    expect(result.hasNoRounding).toBe(true)
    expect(result.hasTrue).toBe(false)
    expect(result.approximationCount).toBe(0)
    expect(result.guessworkCount).toBe(0)
  })

  it('measures MEDIUM content as torn', () => {
    const result = measureCutting(MEDIUM)
    expect(result.precision).toBe(0)
    expect(result.accuracy).toBe('torn')
    expect(result.hasHighPrecision).toBe(false)
  })

  it('detects any usage as approximation', () => {
    const code = `const x: any = {}`
    const result = measureCutting(code)
    expect(result.approximationCount).toBe(1)
    expect(result.hasNoApproximation).toBe(false)
  })
})

// ─── measureVolcanic ───────────────────────────────────────────────────────

describe('measureVolcanic', () => {
  it('measures RICH content as perfect glass', () => {
    const result = measureVolcanic(RICH)
    expect(result.formation).toBe(100)
    expect(result.quality).toBe('perfect-glass')
    expect(result.hasHighFormation).toBe(true)
    expect(result.hasWellFormed).toBe(true)
    expect(result.hasClean).toBe(true)
    expect(result.hasNoImpurities).toBe(true)
    expect(result.hasProper).toBe(true)
    expect(result.hasNoBubbles).toBe(true)
    expect(result.hasSolid).toBe(true)
    expect(result.hasNoCracks).toBe(true)
    expect(result.hasDense).toBe(true)
    expect(result.hasNoHoles).toBe(true)
    expect(result.impurityCount).toBe(0)
    expect(result.bubbleCount).toBe(0)
  })

  it('measures MEDIUM content as slag', () => {
    const result = measureVolcanic(MEDIUM)
    expect(result.formation).toBe(0)
    expect(result.quality).toBe('slag')
    expect(result.hasNoImpurities).toBe(false)
    expect(result.impurityCount).toBe(2)
    expect(result.hasNoBubbles).toBe(true)
  })

  it('detects console calls as bubbles', () => {
    const code = `console.log('hello')\nconsole.error('oops')`
    const result = measureVolcanic(code)
    expect(result.bubbleCount).toBe(2)
    expect(result.hasNoBubbles).toBe(false)
  })
})

// ─── measureDangerous ──────────────────────────────────────────────────────

describe('measureDangerous', () => {
  it('measures RICH content as calculated risk', () => {
    const result = measureDangerous(RICH)
    expect(result.riskManagement).toBe(100)
    expect(result.quality).toBe('calculated-risk')
    expect(result.hasHighRiskManagement).toBe(true)
    expect(result.hasSafe).toBe(true)
    expect(result.hasNoUnsafe).toBe(true)
    expect(result.hasGuarded).toBe(true)
    expect(result.hasNoBare).toBe(true)
    expect(result.hasProtected).toBe(true)
    expect(result.hasNoExposed).toBe(true)
    expect(result.hasCareful).toBe(true)
    expect(result.hasNoReckless).toBe(true)
    expect(result.hasSecure).toBe(true)
    expect(result.unsafeCount).toBe(0)
    expect(result.exposedCount).toBe(0)
  })

  it('measures MEDIUM content as catastrophic', () => {
    const result = measureDangerous(MEDIUM)
    expect(result.riskManagement).toBe(0)
    expect(result.quality).toBe('catastrophic')
    expect(result.hasHighRiskManagement).toBe(false)
  })

  it('detects eval as exposed', () => {
    const code = `eval('x')`
    const result = measureDangerous(code)
    expect(result.exposedCount).toBe(1)
    expect(result.hasNoBare).toBe(false)
    expect(result.hasNoExposed).toBe(false)
    expect(result.hasNoReckless).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies surgical-shard at 90+', () => {
    expect(classifyCondition(90)).toBe('surgical-shard')
    expect(classifyCondition(100)).toBe('surgical-shard')
  })
  it('classifies razor-edge at 70-84', () => {
    expect(classifyCondition(75)).toBe('razor-edge')
  })
  it('classifies sharp-flake at 55-69', () => {
    expect(classifyCondition(60)).toBe('sharp-flake')
  })
  it('classifies dull-piece at 40-54', () => {
    expect(classifyCondition(45)).toBe('dull-piece')
  })
  it('classifies blunt-stone at 25-39', () => {
    expect(classifyCondition(30)).toBe('blunt-stone')
  })
  it('classifies gravel below 25', () => {
    expect(classifyCondition(10)).toBe('gravel')
    expect(classifyCondition(0)).toBe('gravel')
  })
})

// ─── classifyFlintknapperGrade ─────────────────────────────────────────────

describe('classifyFlintknapperGrade', () => {
  it('classifies master-flintknapper at 80+', () => {
    expect(classifyFlintknapperGrade(85)).toBe('master-flintknapper')
    expect(classifyFlintknapperGrade(100)).toBe('master-flintknapper')
  })
  it('classifies expert-knapper at 65-79', () => {
    expect(classifyFlintknapperGrade(70)).toBe('expert-knapper')
  })
  it('classifies skilled-worker at 50-64', () => {
    expect(classifyFlintknapperGrade(55)).toBe('skilled-worker')
  })
  it('classifies apprentice at 35-49', () => {
    expect(classifyFlintknapperGrade(40)).toBe('apprentice')
  })
  it('classifies novice at 20-34', () => {
    expect(classifyFlintknapperGrade(25)).toBe('novice')
  })
  it('classifies hazard below 20', () => {
    expect(classifyFlintknapperGrade(10)).toBe('hazard')
    expect(classifyFlintknapperGrade(0)).toBe('hazard')
  })
})

// ─── analyzeShardEdge ──────────────────────────────────────────────────────

describe('analyzeShardEdge', () => {
  it('analyzes RICH content correctly', () => {
    const edge = analyzeShardEdge(RICH, 'rich.ts')
    expect(edge.file).toBe('rich.ts')
    expect(edge.sharpness).toBe(80)
    expect(edge.edgeCaseHandling).toBe(78)
    expect(edge.fracturePattern).toBe(65)
    expect(edge.cuttingPrecision).toBe(83)
    expect(edge.volcanicGlass).toBe(100)
    expect(edge.dangerQuality).toBe(100)
    expect(edge.condition).toBe('razor-edge')
    expect(edge.qualityScore).toBe(84)
  })

  it('analyzes MEDIUM content correctly', () => {
    const edge = analyzeShardEdge(MEDIUM, 'medium.ts')
    expect(edge.file).toBe('medium.ts')
    expect(edge.sharpness).toBe(0)
    expect(edge.edgeCaseHandling).toBe(7)
    expect(edge.fracturePattern).toBe(0)
    expect(edge.cuttingPrecision).toBe(0)
    expect(edge.volcanicGlass).toBe(0)
    expect(edge.dangerQuality).toBe(0)
    expect(edge.condition).toBe('gravel')
    expect(edge.qualityScore).toBe(1)
  })

  it('computes qualityScore from weighted measures', () => {
    const edge = analyzeShardEdge(RICH, 'test.ts')
    // sharpness*0.2 + edgeCase*0.15 + fracture*0.15 + cutting*0.2 + volcanic*0.15 + danger*0.15
    const expected = Math.round(80 * 0.2 + 78 * 0.15 + 65 * 0.15 + 83 * 0.2 + 100 * 0.15 + 100 * 0.15)
    expect(edge.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const edge = analyzeShardEdge(RICH, 'test.ts')
    expect(edge.sharp).toBeDefined()
    expect(edge.edge).toBeDefined()
    expect(edge.fracture).toBeDefined()
    expect(edge.cutting).toBeDefined()
    expect(edge.volcanic).toBeDefined()
    expect(edge.dangerous).toBeDefined()
  })
})

// ─── analyzeShardCollection ────────────────────────────────────────────────

describe('analyzeShardCollection', () => {
  it('returns empty collection for no edges', () => {
    const coll = analyzeShardCollection([], 'empty')
    expect(coll.directory).toBe('empty')
    expect(coll.edges).toEqual([])
    expect(coll.avgSharpness).toBe(0)
    expect(coll.avgCuttingPrecision).toBe(0)
    expect(coll.avgDangerQuality).toBe(0)
    expect(coll.surgicalCount).toBe(0)
    expect(coll.gravelCount).toBe(0)
    expect(coll.razorEdgeCount).toBe(0)
    expect(coll.sharpFlakeCount).toBe(0)
    expect(coll.collectionType).toBe('empty-quarry')
    expect(coll.condition).toBe('rubble')
  })

  it('computes averages for single edge', () => {
    const edge = analyzeShardEdge(RICH, 'rich.ts')
    const coll = analyzeShardCollection([edge], 'src')
    expect(coll.avgSharpness).toBe(80)
    expect(coll.avgCuttingPrecision).toBe(83)
    expect(coll.avgDangerQuality).toBe(100)
    expect(coll.surgicalCount).toBe(0)
    expect(coll.gravelCount).toBe(0)
    expect(coll.razorEdgeCount).toBe(1)
  })

  it('computes averages for multiple edges', () => {
    const rEdge = analyzeShardEdge(RICH, 'rich.ts')
    const mEdge = analyzeShardEdge(MEDIUM, 'medium.ts')
    const coll = analyzeShardCollection([rEdge, mEdge], 'src')
    expect(coll.avgSharpness).toBe(40)
    expect(coll.avgCuttingPrecision).toBe(42)
    expect(coll.avgDangerQuality).toBe(50)
    expect(coll.razorEdgeCount).toBe(1)
    expect(coll.gravelCount).toBe(1)
  })
})

// ─── classifyCollectionType ────────────────────────────────────────────────

describe('classifyCollectionType', () => {
  it('returns empty-quarry for no edges', () => {
    expect(classifyCollectionType([])).toBe('empty-quarry')
  })

  it('classifies based on avg quality and surgical ratio', () => {
    const edges: ShardEdge[] = Array.from({ length: 5 }, (_, i) => ({
      ...analyzeShardEdge(RICH, `f${i}.ts`),
      condition: i < 3 ? 'surgical-shard' as const : 'razor-edge' as const,
      qualityScore: i < 3 ? 90 : 70,
    }))
    expect(classifyCollectionType(edges)).toBe('master-workshop')
  })
})

// ─── classifyCollectionCondition ───────────────────────────────────────────

describe('classifyCollectionCondition', () => {
  it('classifies precision-tools at 75+', () => {
    expect(classifyCollectionCondition(80)).toBe('precision-tools')
  })
  it('classifies sharp-collection at 60-74', () => {
    expect(classifyCollectionCondition(65)).toBe('sharp-collection')
  })
  it('classifies usable-edges at 45-59', () => {
    expect(classifyCollectionCondition(50)).toBe('usable-edges')
  })
  it('classifies mixed-quality at 30-44', () => {
    expect(classifyCollectionCondition(35)).toBe('mixed-quality')
  })
  it('classifies dull-rocks at 15-29', () => {
    expect(classifyCollectionCondition(20)).toBe('dull-rocks')
  })
  it('classifies rubble below 15', () => {
    expect(classifyCollectionCondition(5)).toBe('rubble')
    expect(classifyCollectionCondition(0)).toBe('rubble')
  })
})

// ─── buildObsidianShardResult ──────────────────────────────────────────────

describe('buildObsidianShardResult', () => {
  it('handles empty input', () => {
    const result = buildObsidianShardResult([], [])
    expect(result.edges).toEqual([])
    expect(result.collections).toEqual([])
    expect(result.workshop.avgSharpness).toBe(0)
    expect(result.workshop.avgCuttingPrecision).toBe(0)
    expect(result.workshop.avgDangerQuality).toBe(0)
    expect(result.workshop.isSharp).toBe(false)
    expect(result.workshop.overallSharpness).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCollections).toBe(0)
    expect(result.stats.flintknapperGrade).toBe('hazard')
    expect(result.stats.bestEdge).toBe('')
    expect(result.stats.sharpest).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles RICH + MEDIUM combined', () => {
    const result = buildObsidianShardResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.edges).toHaveLength(2)
    expect(result.collections).toHaveLength(1)
    expect(result.workshop.avgSharpness).toBe(40)
    expect(result.workshop.avgCuttingPrecision).toBe(42)
    expect(result.workshop.avgDangerQuality).toBe(50)
    expect(result.workshop.isSharp).toBe(false)
    expect(result.workshop.overallSharpness).toBe(44)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgEdgeCaseHandling).toBe(43)
    expect(result.stats.avgFracturePattern).toBe(33)
    expect(result.stats.avgVolcanicGlass).toBe(50)
    expect(result.stats.razorEdgeCount).toBe(1)
    expect(result.stats.gravelCount).toBe(1)
    expect(result.stats.flintknapperGrade).toBe('apprentice')
    expect(result.stats.bestEdge).toBe('rich.ts')
    expect(result.stats.sharpest).toBe('rich.ts')
    expect(result.stats.bestEdgeCases).toBe('rich.ts')
    expect(result.stats.bestErrorPatterns).toBe('rich.ts')
    expect(result.stats.mostAccurate).toBe('rich.ts')
    expect(result.stats.safest).toBe('rich.ts')
  })

  it('tracks high measure counts', () => {
    const result = buildObsidianShardResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighHandlingCount).toBe(1)
    expect(result.stats.hasHighPatternCount).toBe(0)
    expect(result.stats.hasHighAccuracyCount).toBe(1)
    expect(result.stats.hasHighFormationCount).toBe(1)
    expect(result.stats.hasHighRiskManagementCount).toBe(1)
  })

  it('separates files into collections by directory', () => {
    const result = buildObsidianShardResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.collections).toHaveLength(2)
    const srcColl = result.collections.find((c) => c.directory === 'src')
    const libColl = result.collections.find((c) => c.directory === 'lib')
    expect(srcColl).toBeDefined()
    expect(libColl).toBeDefined()
    expect(srcColl!.edges).toHaveLength(2)
    expect(libColl!.edges).toHaveLength(1)
  })

  it('computes overallSharpness as average of three measures', () => {
    const result = buildObsidianShardResult(['rich.ts'], [RICH])
    const expected = Math.round((80 + 83 + 100) / 3)
    expect(result.workshop.overallSharpness).toBe(expected)
    expect(result.workshop.isSharp).toBe(true)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const result = buildObsidianShardResult(['medium.ts'], [MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('1 file(s) are gravel — consider significant refactoring')
    expect(result.recommendations).toContain('Sharpen these blunt files: medium.ts')
  })

  it('generates positive recommendation for high scores', () => {
    const result = buildObsidianShardResult(['rich.ts'], [RICH])
    expect(result.recommendations).toContain('Your obsidian shards are razor-sharp! Keep honing your craft')
  })

  it('recommends improving workshop sharpness when low', () => {
    const result = buildObsidianShardResult([], [])
    expect(result.recommendations).toContain('Overall workshop sharpness is low — prioritize type safety and error handling')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  describe('scoreColor', () => {
    it('returns string for any score', () => {
      expect(typeof scoreColor(90)).toBe('string')
      expect(typeof scoreColor(50)).toBe('string')
      expect(typeof scoreColor(0)).toBe('string')
    })
  })

  describe('edgeColor', () => {
    it('colors razor-edge', () => {
      expect(typeof edgeColor('razor-edge')).toBe('string')
    })
    it('colors unknown edge', () => {
      expect(edgeColor('unknown')).toBe('unknown')
    })
  })

  describe('coverageColor', () => {
    it('colors complete-coverage', () => {
      expect(typeof coverageColor('complete-coverage')).toBe('string')
    })
    it('colors unknown coverage', () => {
      expect(coverageColor('unknown')).toBe('unknown')
    })
  })

  describe('fractureColor', () => {
    it('colors clean-break', () => {
      expect(typeof fractureColor('clean-break')).toBe('string')
    })
    it('colors unknown fracture', () => {
      expect(fractureColor('unknown')).toBe('unknown')
    })
  })

  describe('accuracyColor', () => {
    it('colors laser-cut', () => {
      expect(typeof accuracyColor('laser-cut')).toBe('string')
    })
    it('colors unknown accuracy', () => {
      expect(accuracyColor('unknown')).toBe('unknown')
    })
  })

  describe('volcanicColor', () => {
    it('colors perfect-glass', () => {
      expect(typeof volcanicColor('perfect-glass')).toBe('string')
    })
    it('colors unknown volcanic', () => {
      expect(volcanicColor('unknown')).toBe('unknown')
    })
  })

  describe('dangerColor', () => {
    it('colors calculated-risk', () => {
      expect(typeof dangerColor('calculated-risk')).toBe('string')
    })
    it('colors unknown danger', () => {
      expect(dangerColor('unknown')).toBe('unknown')
    })
  })

  describe('conditionColor', () => {
    it('colors surgical-shard', () => {
      expect(typeof conditionColor('surgical-shard')).toBe('string')
    })
    it('colors unknown condition', () => {
      expect(conditionColor('unknown')).toBe('unknown')
    })
  })

  describe('gradeColor', () => {
    it('colors master-flintknapper', () => {
      expect(typeof gradeColor('master-flintknapper')).toBe('string')
    })
    it('colors unknown grade', () => {
      expect(gradeColor('unknown')).toBe('unknown')
    })
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatObsidianShardJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildObsidianShardResult(['rich.ts'], [RICH])
    const json = formatObsidianShardJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.edges).toHaveLength(1)
    expect(parsed.workshop).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatObsidianShardTable', () => {
  it('formats result as table string', () => {
    const result = buildObsidianShardResult(['rich.ts'], [RICH])
    const table = formatObsidianShardTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('includes per-file edges in verbose mode', () => {
    const result = buildObsidianShardResult(['rich.ts'], [RICH])
    const table = formatObsidianShardTable(result, true)
    expect(table).toContain('rich.ts')
    expect(table).toContain('Per-File Edges')
  })

  it('hides per-file edges in non-verbose mode', () => {
    const result = buildObsidianShardResult(['rich.ts'], [RICH])
    const table = formatObsidianShardTable(result, false)
    expect(table).not.toContain('Per-File Edges')
  })

  it('shows recommendations when present', () => {
    const result = buildObsidianShardResult(['medium.ts'], [MEDIUM])
    const table = formatObsidianShardTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('shows condition counts', () => {
    const result = buildObsidianShardResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const table = formatObsidianShardTable(result, false)
    expect(table).toContain('Surgical Shard')
    expect(table).toContain('Razor Edge')
    expect(table).toContain('Gravel')
  })
})
