import { describe, expect, it } from 'vitest'

import {
  analyzeLanternFlame,
  analyzeLanternRow,
  buildLanternGlowResult,
  classifyCondition,
  classifyLamplighterGrade,
  classifyRowCondition,
  classifyRowType,
  generateRecommendations,
  measureEfficient,
  measureGuiding,
  measureIlluminated,
  measureReaching,
  measureShadow,
  measureWarm,
  type LanternFlame,
} from '../src/commands/lantern-glow-helpers.js'

import {
  brightnessColor,
  conditionColor,
  consumptionColor,
  controlColor,
  coverageColor,
  feelingColor,
  formatLanternGlowJson,
  formatLanternGlowTable,
  gradeColor,
  guideQualityColor,
  scoreColor,
} from '../src/commands/lantern-glow-format-helpers.js'

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

// ─── measureIlluminated ────────────────────────────────────────────────────

describe('measureIlluminated', () => {
  it('measures RICH content as blazing-light', () => {
    const result = measureIlluminated(RICH)
    expect(result.clarity).toBe(93)
    expect(result.brightness).toBe('blazing-light')
    expect(result.hasHighClarity).toBe(true)
    expect(result.hasReadable).toBe(true)
    expect(result.hasClearNaming).toBe(true)
    expect(result.hasNoObfuscation).toBe(true)
    expect(result.hasSelfDocumenting).toBe(true)
    expect(result.hasNoDarkness).toBe(true)
    expect(result.hasTransparent).toBe(true)
    expect(result.hasNoMystery).toBe(true)
    expect(result.hasVisible).toBe(true)
    expect(result.hasNoHidden).toBe(true)
    expect(result.darknessCount).toBe(0)
    expect(result.mysteryCount).toBe(0)
  })

  it('measures MEDIUM content as extinguished', () => {
    const result = measureIlluminated(MEDIUM)
    expect(result.clarity).toBe(0)
    expect(result.brightness).toBe('extinguished')
    expect(result.hasNoDarkness).toBe(false)
    expect(result.darknessCount).toBe(2)
  })

  it('measures empty content as extinguished', () => {
    const result = measureIlluminated('')
    expect(result.clarity).toBe(0)
    expect(result.brightness).toBe('extinguished')
  })

  it('detects any usage as mystery', () => {
    const code = `const x: any = {}`
    const result = measureIlluminated(code)
    expect(result.mysteryCount).toBe(1)
    expect(result.hasNoObfuscation).toBe(false)
    expect(result.hasNoMystery).toBe(false)
  })
})

// ─── measureWarm ───────────────────────────────────────────────────────────

describe('measureWarm', () => {
  it('measures RICH content as hearth-fire', () => {
    const result = measureWarm(RICH)
    expect(result.approachability).toBe(93)
    expect(result.feeling).toBe('hearth-fire')
    expect(result.hasHighApproachability).toBe(true)
    expect(result.hasInviting).toBe(true)
    expect(result.hasFriendly).toBe(true)
    expect(result.hasNoHostility).toBe(true)
    expect(result.hasWelcoming).toBe(true)
    expect(result.hasNoIntimidation).toBe(true)
    expect(result.hasComfortable).toBe(true)
    expect(result.hasNoHarshness).toBe(true)
    expect(result.hasGentle).toBe(true)
    expect(result.hasNoBrutalism).toBe(true)
    expect(result.hostilityCount).toBe(0)
    expect(result.intimidationCount).toBe(0)
  })

  it('measures MEDIUM content as sterile', () => {
    const result = measureWarm(MEDIUM)
    expect(result.approachability).toBe(12)
    expect(result.feeling).toBe('sterile')
    expect(result.hasNoHostility).toBe(false)
    expect(result.hostilityCount).toBe(2)
  })

  it('measures empty content as sterile', () => {
    const result = measureWarm('')
    expect(result.approachability).toBe(0)
    expect(result.feeling).toBe('sterile')
  })
})

// ─── measureGuiding ────────────────────────────────────────────────────────

describe('measureGuiding', () => {
  it('measures RICH content as reliable-compass', () => {
    const result = measureGuiding(RICH)
    expect(result.direction).toBe(68)
    expect(result.quality).toBe('reliable-compass')
    expect(result.hasHighDirection).toBe(false)
    expect(result.hasDocumented).toBe(true)
    expect(result.hasExamples).toBe(false)
    expect(result.hasNoUndocumented).toBe(true)
    expect(result.hasClearInstructions).toBe(true)
    expect(result.hasNoConfusion).toBe(true)
    expect(result.hasGuiding).toBe(false)
    expect(result.hasNoDeadEnd).toBe(true)
    expect(result.hasProperFlow).toBe(true)
    expect(result.hasNoOrphan).toBe(true)
    expect(result.undocumentedCount).toBe(0)
    expect(result.confusionCount).toBe(0)
  })

  it('measures MEDIUM content as no-guide', () => {
    const result = measureGuiding(MEDIUM)
    expect(result.direction).toBe(0)
    expect(result.quality).toBe('no-guide')
    expect(result.hasDocumented).toBe(false)
  })

  it('detects TODO/FIXME as undocumented', () => {
    const code = `// TODO fix this\n// FIXME broken`
    const result = measureGuiding(code)
    expect(result.undocumentedCount).toBe(2)
    expect(result.hasNoUndocumented).toBe(false)
    expect(result.hasNoDeadEnd).toBe(false)
  })
})

// ─── measureEfficient ──────────────────────────────────────────────────────

describe('measureEfficient', () => {
  it('measures RICH content as perfect-burn', () => {
    const result = measureEfficient(RICH)
    expect(result.performance).toBe(96)
    expect(result.consumption).toBe('perfect-burn')
    expect(result.hasHighPerformance).toBe(true)
    expect(result.hasOptimized).toBe(true)
    expect(result.hasNoWaste).toBe(true)
    expect(result.hasEfficient).toBe(true)
    expect(result.hasNoRedundancy).toBe(true)
    expect(result.hasLean).toBe(true)
    expect(result.hasNoBloat).toBe(true)
    expect(result.hasMinimal).toBe(true)
    expect(result.hasNoExcess).toBe(true)
    expect(result.wasteCount).toBe(0)
    expect(result.bloatCount).toBe(0)
  })

  it('measures MEDIUM content as burning-out', () => {
    const result = measureEfficient(MEDIUM)
    expect(result.performance).toBe(0)
    expect(result.consumption).toBe('burning-out')
    expect(result.hasNoWaste).toBe(false)
    expect(result.wasteCount).toBe(2)
  })

  it('detects console calls as bloat', () => {
    const code = `console.log('hello')\nconsole.error('oops')`
    const result = measureEfficient(code)
    expect(result.bloatCount).toBe(2)
    expect(result.hasNoBloat).toBe(false)
    expect(result.hasNoRedundancy).toBe(false)
  })
})

// ─── measureReaching ───────────────────────────────────────────────────────

describe('measureReaching', () => {
  it('measures RICH content as far-reaching', () => {
    const result = measureReaching(RICH)
    expect(result.scope).toBe(93)
    expect(result.coverage).toBe('far-reaching')
    expect(result.hasHighScope).toBe(true)
    expect(result.hasBroad).toBe(true)
    expect(result.hasReusable).toBe(true)
    expect(result.hasNoNarrow).toBe(true)
    expect(result.hasNoRigid).toBe(true)
    expect(result.hasGeneral).toBe(true)
    expect(result.hasNoSpecific).toBe(true)
    expect(result.hasNoBrittle).toBe(true)
    expect(result.narrowCount).toBe(0)
    expect(result.specificCount).toBe(0)
  })

  it('measures MEDIUM content as pocket-light', () => {
    const result = measureReaching(MEDIUM)
    expect(result.scope).toBe(0)
    expect(result.coverage).toBe('pocket-light')
    expect(result.hasNoNarrow).toBe(false)
    expect(result.narrowCount).toBe(2)
  })

  it('detects any as specific', () => {
    const code = `const x: any = {}`
    const result = measureReaching(code)
    expect(result.specificCount).toBe(1)
    expect(result.hasNoSpecific).toBe(false)
    expect(result.hasNoRigid).toBe(false)
  })
})

// ─── measureShadow ─────────────────────────────────────────────────────────

describe('measureShadow', () => {
  it('measures RICH content as controlled-shadows', () => {
    const result = measureShadow(RICH)
    expect(result.management).toBe(78)
    expect(result.control).toBe('controlled-shadows')
    expect(result.hasHighManagement).toBe(true)
    expect(result.hasErrorHandling).toBe(true)
    expect(result.hasCaught).toBe(true)
    expect(result.hasNoUncaught).toBe(true)
    expect(result.hasEdgeCases).toBe(true)
    expect(result.hasNoSurprises).toBe(true)
    expect(result.hasDefensive).toBe(true)
    expect(result.hasNoBare).toBe(true)
    expect(result.hasGraceful).toBe(true)
    expect(result.hasNoCrash).toBe(true)
    expect(result.uncaughtCount).toBe(0)
    expect(result.surpriseCount).toBe(0)
  })

  it('measures MEDIUM content as total-darkness', () => {
    const result = measureShadow(MEDIUM)
    expect(result.management).toBe(5)
    expect(result.control).toBe('total-darkness')
    expect(result.hasHighManagement).toBe(false)
    expect(result.hasErrorHandling).toBe(false)
  })

  it('detects process.exit as surprise', () => {
    const code = `process.exit(1)`
    const result = measureShadow(code)
    expect(result.surpriseCount).toBe(1)
    expect(result.hasNoSurprises).toBe(false)
    expect(result.hasNoCrash).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies beacon-light at 85+', () => {
    expect(classifyCondition(90)).toBe('beacon-light')
    expect(classifyCondition(100)).toBe('beacon-light')
  })
  it('classifies steady-lantern at 70-84', () => {
    expect(classifyCondition(75)).toBe('steady-lantern')
  })
  it('classifies flickering-flame at 55-69', () => {
    expect(classifyCondition(60)).toBe('flickering-flame')
  })
  it('classifies dying-ember at 40-54', () => {
    expect(classifyCondition(45)).toBe('dying-ember')
  })
  it('classifies smoking-wick at 25-39', () => {
    expect(classifyCondition(30)).toBe('smoking-wick')
  })
  it('classifies darkness below 25', () => {
    expect(classifyCondition(10)).toBe('darkness')
    expect(classifyCondition(0)).toBe('darkness')
  })
})

// ─── classifyLamplighterGrade ──────────────────────────────────────────────

describe('classifyLamplighterGrade', () => {
  it('classifies master-lamplighter at 80+', () => {
    expect(classifyLamplighterGrade(85)).toBe('master-lamplighter')
  })
  it('classifies expert-lightkeeper at 65-79', () => {
    expect(classifyLamplighterGrade(70)).toBe('expert-lightkeeper')
  })
  it('classifies skilled-lamplighter at 50-64', () => {
    expect(classifyLamplighterGrade(55)).toBe('skilled-lamplighter')
  })
  it('classifies apprentice at 35-49', () => {
    expect(classifyLamplighterGrade(40)).toBe('apprentice')
  })
  it('classifies novice at 20-34', () => {
    expect(classifyLamplighterGrade(25)).toBe('novice')
  })
  it('classifies arsonist below 20', () => {
    expect(classifyLamplighterGrade(10)).toBe('arsonist')
    expect(classifyLamplighterGrade(0)).toBe('arsonist')
  })
})

// ─── classifyRowCondition ──────────────────────────────────────────────────

describe('classifyRowCondition', () => {
  it('classifies well-lit-path at 75+', () => {
    expect(classifyRowCondition(80)).toBe('well-lit-path')
  })
  it('classifies navigable-trail at 60-74', () => {
    expect(classifyRowCondition(65)).toBe('navigable-trail')
  })
  it('classifies dimly-lit at 45-59', () => {
    expect(classifyRowCondition(50)).toBe('dimly-lit')
  })
  it('classifies shadowy-path at 30-44', () => {
    expect(classifyRowCondition(35)).toBe('shadowy-path')
  })
  it('classifies groping-in-dark at 15-29', () => {
    expect(classifyRowCondition(20)).toBe('groping-in-dark')
  })
  it('classifies lost below 15', () => {
    expect(classifyRowCondition(5)).toBe('lost')
    expect(classifyRowCondition(0)).toBe('lost')
  })
})

// ─── analyzeLanternFlame ───────────────────────────────────────────────────

describe('analyzeLanternFlame', () => {
  it('analyzes RICH content correctly', () => {
    const flame = analyzeLanternFlame(RICH, 'rich.ts')
    expect(flame.file).toBe('rich.ts')
    expect(flame.illumination).toBe(93)
    expect(flame.warmth).toBe(93)
    expect(flame.guidance).toBe(68)
    expect(flame.fuelEfficiency).toBe(96)
    expect(flame.glowReach).toBe(93)
    expect(flame.shadowManagement).toBe(78)
    expect(flame.condition).toBe('beacon-light')
    expect(flame.qualityScore).toBe(87)
  })

  it('analyzes MEDIUM content correctly', () => {
    const flame = analyzeLanternFlame(MEDIUM, 'medium.ts')
    expect(flame.file).toBe('medium.ts')
    expect(flame.illumination).toBe(0)
    expect(flame.warmth).toBe(12)
    expect(flame.guidance).toBe(0)
    expect(flame.fuelEfficiency).toBe(0)
    expect(flame.glowReach).toBe(0)
    expect(flame.shadowManagement).toBe(5)
    expect(flame.condition).toBe('darkness')
    expect(flame.qualityScore).toBe(3)
  })

  it('computes qualityScore from weighted measures', () => {
    const flame = analyzeLanternFlame(RICH, 'test.ts')
    // illum*0.2 + warmth*0.15 + guidance*0.15 + efficiency*0.15 + reach*0.15 + shadow*0.2
    const expected = Math.round(93 * 0.2 + 93 * 0.15 + 68 * 0.15 + 96 * 0.15 + 93 * 0.15 + 78 * 0.2)
    expect(flame.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const flame = analyzeLanternFlame(RICH, 'test.ts')
    expect(flame.illuminated).toBeDefined()
    expect(flame.warm).toBeDefined()
    expect(flame.guiding).toBeDefined()
    expect(flame.efficient).toBeDefined()
    expect(flame.reaching).toBeDefined()
    expect(flame.shadow).toBeDefined()
  })
})

// ─── analyzeLanternRow ─────────────────────────────────────────────────────

describe('analyzeLanternRow', () => {
  it('returns empty row for no flames', () => {
    const row = analyzeLanternRow([], 'empty')
    expect(row.directory).toBe('empty')
    expect(row.flames).toEqual([])
    expect(row.avgIllumination).toBe(0)
    expect(row.avgGuidance).toBe(0)
    expect(row.avgEfficiency).toBe(0)
    expect(row.beaconCount).toBe(0)
    expect(row.darknessCount).toBe(0)
    expect(row.steadyCount).toBe(0)
    expect(row.flickeringCount).toBe(0)
    expect(row.rowType).toBe('pitch-black')
    expect(row.condition).toBe('lost')
  })

  it('computes averages for single flame', () => {
    const flame = analyzeLanternFlame(RICH, 'rich.ts')
    const row = analyzeLanternRow([flame], 'src')
    expect(row.avgIllumination).toBe(93)
    expect(row.avgGuidance).toBe(68)
    expect(row.avgEfficiency).toBe(96)
    expect(row.beaconCount).toBe(1)
    expect(row.darknessCount).toBe(0)
  })

  it('computes averages for multiple flames', () => {
    const rFlame = analyzeLanternFlame(RICH, 'rich.ts')
    const mFlame = analyzeLanternFlame(MEDIUM, 'medium.ts')
    const row = analyzeLanternRow([rFlame, mFlame], 'src')
    expect(row.avgIllumination).toBe(47)
    expect(row.avgGuidance).toBe(34)
    expect(row.avgEfficiency).toBe(48)
    expect(row.beaconCount).toBe(1)
    expect(row.darknessCount).toBe(1)
  })
})

// ─── classifyRowType ───────────────────────────────────────────────────────

describe('classifyRowType', () => {
  it('returns pitch-black for no flames', () => {
    expect(classifyRowType([])).toBe('pitch-black')
  })

  it('classifies illuminated-path for high avg with many beacons', () => {
    const flames: LanternFlame[] = Array.from({ length: 5 }, (_, i) => ({
      ...analyzeLanternFlame(RICH, `f${i}.ts`),
      condition: i < 3 ? 'beacon-light' as const : 'steady-lantern' as const,
      qualityScore: i < 3 ? 95 : 75,
    }))
    expect(classifyRowType(flames)).toBe('illuminated-path')
  })
})

// ─── buildLanternGlowResult ────────────────────────────────────────────────

describe('buildLanternGlowResult', () => {
  it('handles empty input', () => {
    const result = buildLanternGlowResult([], [])
    expect(result.flames).toEqual([])
    expect(result.rows).toEqual([])
    expect(result.village.avgIllumination).toBe(0)
    expect(result.village.avgGuidance).toBe(0)
    expect(result.village.avgEfficiency).toBe(0)
    expect(result.village.isBright).toBe(false)
    expect(result.village.overallIllumination).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalRows).toBe(0)
    expect(result.stats.lamplighterGrade).toBe('arsonist')
    expect(result.stats.bestFlame).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles RICH + MEDIUM combined', () => {
    const result = buildLanternGlowResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.flames).toHaveLength(2)
    expect(result.rows).toHaveLength(1)
    expect(result.village.avgIllumination).toBe(47)
    expect(result.village.avgGuidance).toBe(34)
    expect(result.village.avgEfficiency).toBe(48)
    expect(result.village.isBright).toBe(false)
    expect(result.village.overallIllumination).toBe(43)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgWarmth).toBe(53)
    expect(result.stats.avgFuelEfficiency).toBe(48)
    expect(result.stats.avgGlowReach).toBe(47)
    expect(result.stats.avgShadowManagement).toBe(42)
    expect(result.stats.beaconLightCount).toBe(1)
    expect(result.stats.darknessCount).toBe(1)
    expect(result.stats.lamplighterGrade).toBe('apprentice')
    expect(result.stats.bestFlame).toBe('rich.ts')
    expect(result.stats.brightest).toBe('rich.ts')
    expect(result.stats.warmest).toBe('rich.ts')
    expect(result.stats.bestGuided).toBe('rich.ts')
    expect(result.stats.mostEfficient).toBe('rich.ts')
    expect(result.stats.farthestReaching).toBe('rich.ts')
  })

  it('tracks high measure counts', () => {
    const result = buildLanternGlowResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighApproachabilityCount).toBe(1)
    expect(result.stats.hasHighDirectionCount).toBe(0)
    expect(result.stats.hasHighPerformanceCount).toBe(1)
    expect(result.stats.hasHighScopeCount).toBe(1)
    expect(result.stats.hasHighManagementCount).toBe(1)
  })

  it('separates files into rows by directory', () => {
    const result = buildLanternGlowResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.rows).toHaveLength(2)
    const srcRow = result.rows.find((r) => r.directory === 'src')
    const libRow = result.rows.find((r) => r.directory === 'lib')
    expect(srcRow).toBeDefined()
    expect(libRow).toBeDefined()
    expect(srcRow!.flames).toHaveLength(2)
    expect(libRow!.flames).toHaveLength(1)
  })

  it('computes overallIllumination as average of three measures', () => {
    const result = buildLanternGlowResult(['rich.ts'], [RICH])
    const expected = Math.round((93 + 68 + 96) / 3)
    expect(result.village.overallIllumination).toBe(expected)
    expect(result.village.isBright).toBe(true)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const result = buildLanternGlowResult(['medium.ts'], [MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('1 file(s) are in total darkness — consider significant refactoring')
    expect(result.recommendations).toContain('Relight these dark files: medium.ts')
  })

  it('generates positive recommendation for high scores', () => {
    const result = buildLanternGlowResult(['rich.ts'], [RICH])
    expect(result.recommendations).toContain('Your code is a beacon of light! Keep the lanterns burning bright')
  })

  it('recommends improving village when low', () => {
    const result = buildLanternGlowResult([], [])
    expect(result.recommendations).toContain('Overall village illumination is low — prioritize clarity and error handling')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  describe('scoreColor', () => {
    it('returns string for any score', () => {
      expect(typeof scoreColor(90)).toBe('string')
      expect(typeof scoreColor(0)).toBe('string')
    })
  })

  describe('brightnessColor', () => {
    it('colors blazing-light', () => { expect(typeof brightnessColor('blazing-light')).toBe('string') })
    it('colors unknown', () => { expect(brightnessColor('unknown')).toBe('unknown') })
  })

  describe('feelingColor', () => {
    it('colors hearth-fire', () => { expect(typeof feelingColor('hearth-fire')).toBe('string') })
    it('colors unknown', () => { expect(feelingColor('unknown')).toBe('unknown') })
  })

  describe('guideQualityColor', () => {
    it('colors lighthouse-beam', () => { expect(typeof guideQualityColor('lighthouse-beam')).toBe('string') })
    it('colors unknown', () => { expect(guideQualityColor('unknown')).toBe('unknown') })
  })

  describe('consumptionColor', () => {
    it('colors perfect-burn', () => { expect(typeof consumptionColor('perfect-burn')).toBe('string') })
    it('colors unknown', () => { expect(consumptionColor('unknown')).toBe('unknown') })
  })

  describe('coverageColor', () => {
    it('colors far-reaching', () => { expect(typeof coverageColor('far-reaching')).toBe('string') })
    it('colors unknown', () => { expect(coverageColor('unknown')).toBe('unknown') })
  })

  describe('controlColor', () => {
    it('colors shadow-master', () => { expect(typeof controlColor('shadow-master')).toBe('string') })
    it('colors unknown', () => { expect(controlColor('unknown')).toBe('unknown') })
  })

  describe('conditionColor', () => {
    it('colors beacon-light', () => { expect(typeof conditionColor('beacon-light')).toBe('string') })
    it('colors unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
  })

  describe('gradeColor', () => {
    it('colors master-lamplighter', () => { expect(typeof gradeColor('master-lamplighter')).toBe('string') })
    it('colors unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatLanternGlowJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildLanternGlowResult(['rich.ts'], [RICH])
    const json = formatLanternGlowJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.flames).toHaveLength(1)
    expect(parsed.village).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatLanternGlowTable', () => {
  it('formats result as table string', () => {
    const result = buildLanternGlowResult(['rich.ts'], [RICH])
    const table = formatLanternGlowTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('includes per-file flames in verbose mode', () => {
    const result = buildLanternGlowResult(['rich.ts'], [RICH])
    const table = formatLanternGlowTable(result, true)
    expect(table).toContain('rich.ts')
    expect(table).toContain('Per-File Flames')
  })

  it('hides per-file flames in non-verbose mode', () => {
    const result = buildLanternGlowResult(['rich.ts'], [RICH])
    const table = formatLanternGlowTable(result, false)
    expect(table).not.toContain('Per-File Flames')
  })

  it('shows recommendations when present', () => {
    const result = buildLanternGlowResult(['medium.ts'], [MEDIUM])
    const table = formatLanternGlowTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('shows condition counts', () => {
    const result = buildLanternGlowResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const table = formatLanternGlowTable(result, false)
    expect(table).toContain('Beacon Light')
    expect(table).toContain('Darkness')
  })
})
