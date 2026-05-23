import { describe, expect, it } from 'vitest'

import {
  analyzeBronzeArtifact,
  analyzeForgeWorkshop,
  buildBronzeForgeResult,
  classifyCondition,
  classifySmithGrade,
  classifyWorkshopCondition,
  classifyWorkshopType,
  generateRecommendations,
  measureAlloy,
  measureCasting,
  measureCrafted,
  measureDurable,
  measureHeat,
  measurePatina,
  type BronzeArtifact,
} from '../src/commands/bronze-forge-helpers.js'

import {
  agingColor,
  compositionColor,
  conditionColor,
  enduranceColor,
  formatBronzeForgeJson,
  formatBronzeForgeTable,
  gradeColor,
  moldColor,
  rigorColor,
  scoreColor,
  skillColor,
} from '../src/commands/bronze-forge-format-helpers.js'

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

// ─── measureCrafted ────────────────────────────────────────────────────────

describe('measureCrafted', () => {
  it('measures RICH content as master-smith', () => {
    const result = measureCrafted(RICH)
    expect(result.quality).toBe(100)
    expect(result.skill).toBe('master-smith')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasWellMade).toBe(true)
    expect(result.hasRefined).toBe(true)
    expect(result.hasNoRoughness).toBe(true)
    expect(result.hasPolished).toBe(true)
    expect(result.hasNoSloppiness).toBe(true)
    expect(result.hasDetailed).toBe(true)
    expect(result.hasNoHasty).toBe(true)
    expect(result.hasCareful).toBe(true)
    expect(result.hasNoCareless).toBe(true)
    expect(result.roughnessCount).toBe(0)
    expect(result.sloppinessCount).toBe(0)
  })

  it('measures MEDIUM content as clumsy', () => {
    const result = measureCrafted(MEDIUM)
    expect(result.quality).toBe(0)
    expect(result.skill).toBe('clumsy')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasNoRoughness).toBe(false)
    expect(result.roughnessCount).toBe(2)
    expect(result.hasNoSloppiness).toBe(true)
    expect(result.sloppinessCount).toBe(0)
  })

  it('measures empty content as clumsy', () => {
    const result = measureCrafted('')
    expect(result.quality).toBe(0)
    expect(result.skill).toBe('clumsy')
  })
})

// ─── measureAlloy ──────────────────────────────────────────────────────────

describe('measureAlloy', () => {
  it('measures RICH content as perfect-alloy', () => {
    const result = measureAlloy(RICH)
    expect(result.strength).toBe(88)
    expect(result.composition).toBe('perfect-alloy')
    expect(result.hasHighStrength).toBe(true)
    expect(result.hasWellComposed).toBe(true)
    expect(result.hasBalanced).toBe(true)
    expect(result.hasNoImbalance).toBe(true)
    expect(result.hasHarmonious).toBe(false)
    expect(result.hasNoConflict).toBe(true)
    expect(result.hasProper).toBe(true)
    expect(result.hasNoMismatch).toBe(true)
    expect(result.hasCohesive).toBe(true)
    expect(result.hasNoFragmentation).toBe(true)
    expect(result.imbalanceCount).toBe(0)
    expect(result.conflictCount).toBe(0)
  })

  it('measures MEDIUM content as impure', () => {
    const result = measureAlloy(MEDIUM)
    expect(result.strength).toBe(5)
    expect(result.composition).toBe('impure')
    expect(result.hasNoImbalance).toBe(false)
    expect(result.imbalanceCount).toBe(2)
  })

  it('measures empty content as impure', () => {
    const result = measureAlloy('')
    expect(result.strength).toBe(0)
    expect(result.composition).toBe('impure')
  })
})

// ─── measureHeat ───────────────────────────────────────────────────────────

describe('measureHeat', () => {
  it('measures RICH content as properly-tempered', () => {
    const result = measureHeat(RICH)
    expect(result.treatment).toBe(73)
    expect(result.rigor).toBe('properly-tempered')
    expect(result.hasHighTreatment).toBe(true)
    expect(result.hasWellTested).toBe(true)
    expect(result.hasThorough).toBe(false)
    expect(result.hasNoUncovered).toBe(true)
    expect(result.hasStressTested).toBe(true)
    expect(result.hasNoBrittle).toBe(true)
    expect(result.hasHardened).toBe(true)
    expect(result.hasNoSoft).toBe(true)
    expect(result.hasProven).toBe(true)
    expect(result.hasNoUntested).toBe(true)
    expect(result.uncoveredCount).toBe(0)
    expect(result.brittleCount).toBe(0)
  })

  it('measures MEDIUM content as unforged', () => {
    const result = measureHeat(MEDIUM)
    expect(result.treatment).toBe(0)
    expect(result.rigor).toBe('unforged')
    expect(result.hasHighTreatment).toBe(false)
  })

  it('detects any as uncovered', () => {
    const code = `const x: any = {}`
    const result = measureHeat(code)
    expect(result.uncoveredCount).toBe(1)
    expect(result.hasNoUncovered).toBe(false)
    expect(result.hasNoSoft).toBe(false)
  })

  it('detects TODO/FIXME as brittle', () => {
    const code = `// TODO fix this\n// FIXME broken`
    const result = measureHeat(code)
    expect(result.brittleCount).toBe(2)
    expect(result.hasNoBrittle).toBe(false)
  })
})

// ─── measurePatina ─────────────────────────────────────────────────────────

describe('measurePatina', () => {
  it('measures RICH content as graceful-patina', () => {
    const result = measurePatina(RICH)
    expect(result.wisdom).toBe(100)
    expect(result.aging).toBe('graceful-patina')
    expect(result.hasHighWisdom).toBe(true)
    expect(result.hasMature).toBe(true)
    expect(result.hasProven).toBe(true)
    expect(result.hasNoBitrot).toBe(true)
    expect(result.hasStable).toBe(true)
    expect(result.hasNoDegradation).toBe(true)
    expect(result.hasEvolved).toBe(true)
    expect(result.hasNoStagnation).toBe(true)
    expect(result.hasRefined).toBe(true)
    expect(result.hasNoRegress).toBe(true)
    expect(result.bitrotCount).toBe(0)
    expect(result.stagnationCount).toBe(0)
  })

  it('measures MEDIUM content as degrading', () => {
    const result = measurePatina(MEDIUM)
    expect(result.wisdom).toBe(0)
    expect(result.aging).toBe('degrading')
    expect(result.hasNoBitrot).toBe(false)
    expect(result.bitrotCount).toBe(2)
    expect(result.hasNoDegradation).toBe(true)
  })

  it('detects TODO/FIXME/HACK as stagnation', () => {
    const code = `// TODO fix\n// FIXME broken\n// HACK workaround`
    const result = measurePatina(code)
    expect(result.stagnationCount).toBe(3)
    expect(result.hasNoStagnation).toBe(false)
    expect(result.hasNoDegradation).toBe(false)
  })
})

// ─── measureCasting ────────────────────────────────────────────────────────

describe('measureCasting', () => {
  it('measures RICH content as perfect-casting', () => {
    const result = measureCasting(RICH)
    expect(result.quality).toBe(100)
    expect(result.mold).toBe('perfect-casting')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasWellFormed).toBe(true)
    expect(result.hasClean).toBe(true)
    expect(result.hasNoFlash).toBe(true)
    expect(result.hasProper).toBe(true)
    expect(result.hasNoBurr).toBe(true)
    expect(result.hasComplete).toBe(true)
    expect(result.hasNoIncomplete).toBe(true)
    expect(result.hasSmooth).toBe(true)
    expect(result.hasNoRough).toBe(true)
    expect(result.flashCount).toBe(0)
    expect(result.burrCount).toBe(0)
  })

  it('measures MEDIUM content as failed-cast', () => {
    const result = measureCasting(MEDIUM)
    expect(result.quality).toBe(0)
    expect(result.mold).toBe('failed-cast')
    expect(result.hasNoBurr).toBe(false)
    expect(result.burrCount).toBe(2)
  })

  it('detects console calls as flash', () => {
    const code = `console.log('hello')\nconsole.error('oops')`
    const result = measureCasting(code)
    expect(result.flashCount).toBe(2)
    expect(result.hasNoFlash).toBe(false)
    expect(result.hasNoRough).toBe(false)
  })
})

// ─── measureDurable ────────────────────────────────────────────────────────

describe('measureDurable', () => {
  it('measures RICH content as timeless-artifact', () => {
    const result = measureDurable(RICH)
    expect(result.legacy).toBe(100)
    expect(result.endurance).toBe('timeless-artifact')
    expect(result.hasHighLegacy).toBe(true)
    expect(result.hasLasting).toBe(true)
    expect(result.hasReusable).toBe(true)
    expect(result.hasNoDisposable).toBe(true)
    expect(result.hasEnduring).toBe(true)
    expect(result.hasNoTemporary).toBe(true)
    expect(result.hasFoundational).toBe(true)
    expect(result.hasNoExpendable).toBe(true)
    expect(result.hasHeritage).toBe(true)
    expect(result.hasNoEphemeral).toBe(true)
    expect(result.disposableCount).toBe(0)
    expect(result.temporaryCount).toBe(0)
  })

  it('measures MEDIUM content as disposable', () => {
    const result = measureDurable(MEDIUM)
    expect(result.legacy).toBe(0)
    expect(result.endurance).toBe('disposable')
    expect(result.hasNoTemporary).toBe(false)
    expect(result.temporaryCount).toBe(2)
    expect(result.hasNoEphemeral).toBe(false)
  })

  it('detects any usage as disposable', () => {
    const code = `const x: any = {}`
    const result = measureDurable(code)
    expect(result.disposableCount).toBe(1)
    expect(result.hasNoDisposable).toBe(false)
    expect(result.hasNoExpendable).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies masterpiece at 85+', () => {
    expect(classifyCondition(90)).toBe('masterpiece')
    expect(classifyCondition(100)).toBe('masterpiece')
  })
  it('classifies fine-artifact at 70-84', () => {
    expect(classifyCondition(75)).toBe('fine-artifact')
  })
  it('classifies quality-tool at 55-69', () => {
    expect(classifyCondition(60)).toBe('quality-tool')
  })
  it('classifies workhorse at 40-54', () => {
    expect(classifyCondition(45)).toBe('workhorse')
  })
  it('classifies worn-tool at 25-39', () => {
    expect(classifyCondition(30)).toBe('worn-tool')
  })
  it('classifies scrap-bronze below 25', () => {
    expect(classifyCondition(10)).toBe('scrap-bronze')
    expect(classifyCondition(0)).toBe('scrap-bronze')
  })
})

// ─── classifySmithGrade ────────────────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('classifies legendary-smith at 80+', () => {
    expect(classifySmithGrade(85)).toBe('legendary-smith')
    expect(classifySmithGrade(100)).toBe('legendary-smith')
  })
  it('classifies master-smith at 65-79', () => {
    expect(classifySmithGrade(70)).toBe('master-smith')
  })
  it('classifies expert-forger at 50-64', () => {
    expect(classifySmithGrade(55)).toBe('expert-forger')
  })
  it('classifies skilled-craftsman at 35-49', () => {
    expect(classifySmithGrade(40)).toBe('skilled-craftsman')
  })
  it('classifies apprentice at 20-34', () => {
    expect(classifySmithGrade(25)).toBe('apprentice')
  })
  it('classifies scrap-dealer below 20', () => {
    expect(classifySmithGrade(10)).toBe('scrap-dealer')
    expect(classifySmithGrade(0)).toBe('scrap-dealer')
  })
})

// ─── analyzeBronzeArtifact ─────────────────────────────────────────────────

describe('analyzeBronzeArtifact', () => {
  it('analyzes RICH content correctly', () => {
    const art = analyzeBronzeArtifact(RICH, 'rich.ts')
    expect(art.file).toBe('rich.ts')
    expect(art.craftsmanship).toBe(100)
    expect(art.alloyStrength).toBe(88)
    expect(art.heatTreatment).toBe(73)
    expect(art.patinaWisdom).toBe(100)
    expect(art.castingQuality).toBe(100)
    expect(art.durabilityLegacy).toBe(100)
    expect(art.condition).toBe('masterpiece')
    expect(art.qualityScore).toBe(94)
  })

  it('analyzes MEDIUM content correctly', () => {
    const art = analyzeBronzeArtifact(MEDIUM, 'medium.ts')
    expect(art.file).toBe('medium.ts')
    expect(art.craftsmanship).toBe(0)
    expect(art.alloyStrength).toBe(5)
    expect(art.heatTreatment).toBe(0)
    expect(art.patinaWisdom).toBe(0)
    expect(art.castingQuality).toBe(0)
    expect(art.durabilityLegacy).toBe(0)
    expect(art.condition).toBe('scrap-bronze')
    expect(art.qualityScore).toBe(1)
  })

  it('computes qualityScore from weighted measures', () => {
    const art = analyzeBronzeArtifact(RICH, 'test.ts')
    // craft*0.2 + alloy*0.15 + heat*0.15 + patina*0.15 + casting*0.15 + durable*0.2
    const expected = Math.round(100 * 0.2 + 88 * 0.15 + 73 * 0.15 + 100 * 0.15 + 100 * 0.15 + 100 * 0.2)
    expect(art.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const art = analyzeBronzeArtifact(RICH, 'test.ts')
    expect(art.crafted).toBeDefined()
    expect(art.alloy).toBeDefined()
    expect(art.heat).toBeDefined()
    expect(art.patina).toBeDefined()
    expect(art.casting).toBeDefined()
    expect(art.durable).toBeDefined()
  })
})

// ─── analyzeForgeWorkshop ──────────────────────────────────────────────────

describe('analyzeForgeWorkshop', () => {
  it('returns empty workshop for no artifacts', () => {
    const ws = analyzeForgeWorkshop([], 'empty')
    expect(ws.directory).toBe('empty')
    expect(ws.artifacts).toEqual([])
    expect(ws.avgCraftsmanship).toBe(0)
    expect(ws.avgHeatTreatment).toBe(0)
    expect(ws.avgDurabilityLegacy).toBe(0)
    expect(ws.masterpieceCount).toBe(0)
    expect(ws.scrapCount).toBe(0)
    expect(ws.fineArtifactCount).toBe(0)
    expect(ws.qualityToolCount).toBe(0)
    expect(ws.workshopType).toBe('cold-ashes')
    expect(ws.condition).toBe('extinguished')
  })

  it('computes averages for single artifact', () => {
    const art = analyzeBronzeArtifact(RICH, 'rich.ts')
    const ws = analyzeForgeWorkshop([art], 'src')
    expect(ws.avgCraftsmanship).toBe(100)
    expect(ws.avgHeatTreatment).toBe(73)
    expect(ws.avgDurabilityLegacy).toBe(100)
    expect(ws.masterpieceCount).toBe(1)
    expect(ws.scrapCount).toBe(0)
  })

  it('computes averages for multiple artifacts', () => {
    const rArt = analyzeBronzeArtifact(RICH, 'rich.ts')
    const mArt = analyzeBronzeArtifact(MEDIUM, 'medium.ts')
    const ws = analyzeForgeWorkshop([rArt, mArt], 'src')
    expect(ws.avgCraftsmanship).toBe(50)
    expect(ws.avgHeatTreatment).toBe(37)
    expect(ws.avgDurabilityLegacy).toBe(50)
    expect(ws.masterpieceCount).toBe(1)
    expect(ws.scrapCount).toBe(1)
  })
})

// ─── classifyWorkshopType ──────────────────────────────────────────────────

describe('classifyWorkshopType', () => {
  it('returns cold-ashes for no artifacts', () => {
    expect(classifyWorkshopType([])).toBe('cold-ashes')
  })

  it('classifies grand-forge for high avg with many masterpieces', () => {
    const artifacts: BronzeArtifact[] = Array.from({ length: 5 }, (_, i) => ({
      ...analyzeBronzeArtifact(RICH, `f${i}.ts`),
      condition: i < 3 ? 'masterpiece' as const : 'fine-artifact' as const,
      qualityScore: i < 3 ? 95 : 75,
    }))
    expect(classifyWorkshopType(artifacts)).toBe('grand-forge')
  })
})

// ─── classifyWorkshopCondition ─────────────────────────────────────────────

describe('classifyWorkshopCondition', () => {
  it('classifies legendary-forge at 75+', () => {
    expect(classifyWorkshopCondition(80)).toBe('legendary-forge')
  })
  it('classifies productive-workshop at 60-74', () => {
    expect(classifyWorkshopCondition(65)).toBe('productive-workshop')
  })
  it('classifies working-foundry at 45-59', () => {
    expect(classifyWorkshopCondition(50)).toBe('working-foundry')
  })
  it('classifies struggling-shop at 30-44', () => {
    expect(classifyWorkshopCondition(35)).toBe('struggling-shop')
  })
  it('classifies dying-forge at 15-29', () => {
    expect(classifyWorkshopCondition(20)).toBe('dying-forge')
  })
  it('classifies extinguished below 15', () => {
    expect(classifyWorkshopCondition(5)).toBe('extinguished')
    expect(classifyWorkshopCondition(0)).toBe('extinguished')
  })
})

// ─── buildBronzeForgeResult ────────────────────────────────────────────────

describe('buildBronzeForgeResult', () => {
  it('handles empty input', () => {
    const result = buildBronzeForgeResult([], [])
    expect(result.artifacts).toEqual([])
    expect(result.workshops).toEqual([])
    expect(result.foundry.avgCraftsmanship).toBe(0)
    expect(result.foundry.avgHeatTreatment).toBe(0)
    expect(result.foundry.avgDurabilityLegacy).toBe(0)
    expect(result.foundry.isMasterwork).toBe(false)
    expect(result.foundry.overallCraftsmanship).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalWorkshops).toBe(0)
    expect(result.stats.smithGrade).toBe('scrap-dealer')
    expect(result.stats.bestArtifact).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles RICH + MEDIUM combined', () => {
    const result = buildBronzeForgeResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.artifacts).toHaveLength(2)
    expect(result.workshops).toHaveLength(1)
    expect(result.foundry.avgCraftsmanship).toBe(50)
    expect(result.foundry.avgHeatTreatment).toBe(37)
    expect(result.foundry.avgDurabilityLegacy).toBe(50)
    expect(result.foundry.isMasterwork).toBe(false)
    expect(result.foundry.overallCraftsmanship).toBe(46)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgAlloyStrength).toBe(47)
    expect(result.stats.avgPatinaWisdom).toBe(50)
    expect(result.stats.avgCastingQuality).toBe(50)
    expect(result.stats.masterpieceCount).toBe(1)
    expect(result.stats.scrapBronzeCount).toBe(1)
    expect(result.stats.smithGrade).toBe('skilled-craftsman')
    expect(result.stats.bestArtifact).toBe('rich.ts')
    expect(result.stats.bestCrafted).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.bestTested).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
    expect(result.stats.bestFormed).toBe('rich.ts')
  })

  it('tracks high measure counts', () => {
    const result = buildBronzeForgeResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighTreatmentCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
    expect(result.stats.hasHighCastingCount).toBe(1)
    expect(result.stats.hasHighLegacyCount).toBe(1)
  })

  it('separates files into workshops by directory', () => {
    const result = buildBronzeForgeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.workshops).toHaveLength(2)
    const srcWs = result.workshops.find((w) => w.directory === 'src')
    const libWs = result.workshops.find((w) => w.directory === 'lib')
    expect(srcWs).toBeDefined()
    expect(libWs).toBeDefined()
    expect(srcWs!.artifacts).toHaveLength(2)
    expect(libWs!.artifacts).toHaveLength(1)
  })

  it('computes overallCraftsmanship as average of three measures', () => {
    const result = buildBronzeForgeResult(['rich.ts'], [RICH])
    const expected = Math.round((100 + 73 + 100) / 3)
    expect(result.foundry.overallCraftsmanship).toBe(expected)
    expect(result.foundry.isMasterwork).toBe(true)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const result = buildBronzeForgeResult(['medium.ts'], [MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('1 file(s) are scrap bronze — consider significant refactoring')
    expect(result.recommendations).toContain('Reforge these scrap files: medium.ts')
  })

  it('generates positive recommendation for high scores', () => {
    const result = buildBronzeForgeResult(['rich.ts'], [RICH])
    expect(result.recommendations).toContain('Your bronze artifacts are masterwork quality! Keep forging ahead')
  })

  it('recommends improving foundry when low', () => {
    const result = buildBronzeForgeResult([], [])
    expect(result.recommendations).toContain('Overall foundry craftsmanship is low — prioritize type safety and error handling')
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

  describe('skillColor', () => {
    it('colors master-smith', () => {
      expect(typeof skillColor('master-smith')).toBe('string')
    })
    it('colors unknown skill', () => {
      expect(skillColor('unknown')).toBe('unknown')
    })
  })

  describe('compositionColor', () => {
    it('colors perfect-alloy', () => {
      expect(typeof compositionColor('perfect-alloy')).toBe('string')
    })
    it('colors unknown composition', () => {
      expect(compositionColor('unknown')).toBe('unknown')
    })
  })

  describe('rigorColor', () => {
    it('colors triple-tempered', () => {
      expect(typeof rigorColor('triple-tempered')).toBe('string')
    })
    it('colors unknown rigor', () => {
      expect(rigorColor('unknown')).toBe('unknown')
    })
  })

  describe('agingColor', () => {
    it('colors graceful-patina', () => {
      expect(typeof agingColor('graceful-patina')).toBe('string')
    })
    it('colors unknown aging', () => {
      expect(agingColor('unknown')).toBe('unknown')
    })
  })

  describe('moldColor', () => {
    it('colors perfect-casting', () => {
      expect(typeof moldColor('perfect-casting')).toBe('string')
    })
    it('colors unknown mold', () => {
      expect(moldColor('unknown')).toBe('unknown')
    })
  })

  describe('enduranceColor', () => {
    it('colors timeless-artifact', () => {
      expect(typeof enduranceColor('timeless-artifact')).toBe('string')
    })
    it('colors unknown endurance', () => {
      expect(enduranceColor('unknown')).toBe('unknown')
    })
  })

  describe('conditionColor', () => {
    it('colors masterpiece', () => {
      expect(typeof conditionColor('masterpiece')).toBe('string')
    })
    it('colors unknown condition', () => {
      expect(conditionColor('unknown')).toBe('unknown')
    })
  })

  describe('gradeColor', () => {
    it('colors legendary-smith', () => {
      expect(typeof gradeColor('legendary-smith')).toBe('string')
    })
    it('colors unknown grade', () => {
      expect(gradeColor('unknown')).toBe('unknown')
    })
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatBronzeForgeJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildBronzeForgeResult(['rich.ts'], [RICH])
    const json = formatBronzeForgeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.artifacts).toHaveLength(1)
    expect(parsed.foundry).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatBronzeForgeTable', () => {
  it('formats result as table string', () => {
    const result = buildBronzeForgeResult(['rich.ts'], [RICH])
    const table = formatBronzeForgeTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('includes per-file artifacts in verbose mode', () => {
    const result = buildBronzeForgeResult(['rich.ts'], [RICH])
    const table = formatBronzeForgeTable(result, true)
    expect(table).toContain('rich.ts')
    expect(table).toContain('Per-File Artifacts')
  })

  it('hides per-file artifacts in non-verbose mode', () => {
    const result = buildBronzeForgeResult(['rich.ts'], [RICH])
    const table = formatBronzeForgeTable(result, false)
    expect(table).not.toContain('Per-File Artifacts')
  })

  it('shows recommendations when present', () => {
    const result = buildBronzeForgeResult(['medium.ts'], [MEDIUM])
    const table = formatBronzeForgeTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('shows condition counts', () => {
    const result = buildBronzeForgeResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const table = formatBronzeForgeTable(result, false)
    expect(table).toContain('Masterpiece')
    expect(table).toContain('Scrap Bronze')
  })
})
