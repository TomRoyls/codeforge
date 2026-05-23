import { describe, it, expect } from 'vitest'
import {
  measurePath,
  measureJourney,
  measureStonework,
  measureLantern,
  measureSafety,
  measureWayfinding,
  analyzeCobblestone,
  analyzeCobblestoneRow,
  classifyCondition,
  classifyRowType,
  classifyRowCondition,
  classifyPathfinderGrade,
  buildMoonlitCobbleResult,
  generateRecommendations,
} from '../src/commands/moonlit-cobble-helpers.js'
import {
  formatMoonlitCobbleJson,
  formatMoonlitCobbleTable,
  scoreColor,
  pathConditionColor,
  journeyViewColor,
  stoneworkQualityColor,
  lanternBrightnessColor,
  safetyGuardrailColor,
  wayfindingSignageColor,
  stoneConditionColor,
  pathfinderGradeColor,
} from '../src/commands/moonlit-cobble-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `import { chalk } from 'chalk'
import type { Config } from './types.js'

/** Documentation */
export interface RichInterface {
  readonly name: string
  readonly value: number
}

export class RichClass {
  private data: Map<string, RichInterface> = new Map()

  async process(config: Config): Promise<string> {
    try {
      const result: string = await this.transform(config)
      return result ?? 'default'
    } catch (error) {
      return 'error'
    }
  }

  private async transform(input: Config): Promise<string> {
    const output: string = JSON.stringify(input)
    return output
  }
}

export type RichType = RichInterface & { extra: boolean }
export const RICH_VALUE = 42
`

const POOR = `var x = 1
var y: any = 2
var z: any = 3`

const EMPTY = ''

// ─── measurePath ───────────────────────────────────────────────────────────

describe('measurePath', () => {
  it('returns roman-road for rich content', () => {
    const m = measurePath(RICH)
    expect(m.quality).toBe(88)
    expect(m.condition).toBe('roman-road')
    expect(m.hasHighQuality).toBe(true)
  })

  it('returns bog for poor content', () => {
    const m = measurePath(POOR)
    expect(m.quality).toBe(0)
    expect(m.condition).toBe('bog')
    expect(m.hasHighQuality).toBe(false)
  })

  it('returns bog for empty content', () => {
    const m = measurePath(EMPTY)
    expect(m.quality).toBe(0)
    expect(m.condition).toBe('bog')
    expect(m.hasNoPotholes).toBe(true)
    expect(m.hasNoDeadEnds).toBe(true)
  })

  it('counts potholes and dead ends correctly', () => {
    const m = measurePath(POOR)
    expect(m.potholeCount).toBe(3)
    expect(m.deadEndCount).toBe(2)
    expect(m.hasNoPotholes).toBe(false)
    expect(m.hasNoDeadEnds).toBe(false)
  })

  it('detects rich boolean combos', () => {
    const m = measurePath(RICH)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasWellLaid).toBe(true)
    expect(m.hasConnected).toBe(true)
    expect(m.hasComplete).toBe(false)
    expect(m.hasPaved).toBe(true)
  })
})

// ─── measureJourney ────────────────────────────────────────────────────────

describe('measureJourney', () => {
  it('returns moonlit-panorama for rich content', () => {
    const m = measureJourney(RICH)
    expect(m.clarity).toBe(100)
    expect(m.view).toBe('moonlit-panorama')
    expect(m.hasHighClarity).toBe(true)
  })

  it('returns pitch-dark for poor content', () => {
    const m = measureJourney(POOR)
    expect(m.clarity).toBe(0)
    expect(m.view).toBe('pitch-dark')
    expect(m.hasHighClarity).toBe(false)
  })

  it('returns pitch-dark for empty content with no obfuscation', () => {
    const m = measureJourney(EMPTY)
    expect(m.clarity).toBe(0)
    expect(m.view).toBe('pitch-dark')
    expect(m.hasNoObfuscation).toBe(true)
    expect(m.hasNoConfusion).toBe(true)
    expect(m.hasGuiding).toBe(true)
  })

  it('counts obfuscation and confusion in poor content', () => {
    const m = measureJourney(POOR)
    expect(m.obfuscationCount).toBe(3)
    expect(m.confusionCount).toBe(2)
  })
})

// ─── measureStonework ──────────────────────────────────────────────────────

describe('measureStonework', () => {
  it('returns master-mason for rich content', () => {
    const m = measureStonework(RICH)
    expect(m.craft).toBe(100)
    expect(m.quality).toBe('master-mason')
    expect(m.hasHighCraft).toBe(true)
  })

  it('returns rubble for poor content', () => {
    const m = measureStonework(POOR)
    expect(m.craft).toBe(0)
    expect(m.quality).toBe('rubble')
    expect(m.hasHighCraft).toBe(false)
  })

  it('returns rubble for empty content with no cracks', () => {
    const m = measureStonework(EMPTY)
    expect(m.craft).toBe(0)
    expect(m.quality).toBe('rubble')
    expect(m.hasNoCracks).toBe(true)
    expect(m.hasMasterful).toBe(true)
  })

  it('counts cracks and sloppiness in poor content', () => {
    const m = measureStonework(POOR)
    expect(m.crackCount).toBe(3)
    expect(m.sloppinessCount).toBe(2)
  })
})

// ─── measureLantern ────────────────────────────────────────────────────────

describe('measureLantern', () => {
  it('returns beacon-lit for rich content', () => {
    const m = measureLantern(RICH)
    expect(m.markers).toBe(100)
    expect(m.brightness).toBe('beacon-lit')
    expect(m.hasHighMarkers).toBe(true)
  })

  it('returns darkness for poor content', () => {
    const m = measureLantern(POOR)
    expect(m.markers).toBe(0)
    expect(m.brightness).toBe('darkness')
    expect(m.hasHighMarkers).toBe(false)
  })

  it('returns darkness for empty content with no dark spots', () => {
    const m = measureLantern(EMPTY)
    expect(m.markers).toBe(0)
    expect(m.brightness).toBe('darkness')
    expect(m.hasNoDarkSpots).toBe(true)
    expect(m.hasNoUndocumented).toBe(true)
  })
})

// ─── measureSafety ─────────────────────────────────────────────────────────

describe('measureSafety', () => {
  it('returns fortress-walls for rich content', () => {
    const m = measureSafety(RICH)
    expect(m.protection).toBe(96)
    expect(m.guardrail).toBe('fortress-walls')
    expect(m.hasHighProtection).toBe(true)
  })

  it('returns cliff for poor content', () => {
    const m = measureSafety(POOR)
    expect(m.protection).toBe(8)
    expect(m.guardrail).toBe('cliff')
    expect(m.hasHighProtection).toBe(false)
  })

  it('returns cliff for empty content with no cliffs', () => {
    const m = measureSafety(EMPTY)
    expect(m.protection).toBe(0)
    expect(m.guardrail).toBe('cliff')
    expect(m.hasNoCliffs).toBe(true)
    expect(m.hasNoExposure).toBe(true)
  })
})

// ─── measureWayfinding ─────────────────────────────────────────────────────

describe('measureWayfinding', () => {
  it('returns perfect-signs for rich content', () => {
    const m = measureWayfinding(RICH)
    expect(m.navigation).toBe(100)
    expect(m.signage).toBe('perfect-signs')
    expect(m.hasHighNavigation).toBe(true)
  })

  it('returns labyrinth for poor content', () => {
    const m = measureWayfinding(POOR)
    expect(m.navigation).toBe(0)
    expect(m.signage).toBe('labyrinth')
    expect(m.hasHighNavigation).toBe(false)
  })

  it('returns labyrinth for empty content with no maze', () => {
    const m = measureWayfinding(EMPTY)
    expect(m.navigation).toBe(0)
    expect(m.signage).toBe('labyrinth')
    expect(m.hasNoMaze).toBe(true)
    expect(m.hasNoRabbitHole).toBe(true)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies moonlit-promenade for 90+', () => {
    expect(classifyCondition(90)).toBe('moonlit-promenade')
  })
  it('classifies well-trodden-path for 70-84', () => {
    expect(classifyCondition(75)).toBe('well-trodden-path')
  })
  it('classifies cobblestone-lane for 55-69', () => {
    expect(classifyCondition(60)).toBe('cobblestone-lane')
  })
  it('classifies winding-trail for 40-54', () => {
    expect(classifyCondition(45)).toBe('winding-trail')
  })
  it('classifies overgrown-path for 25-39', () => {
    expect(classifyCondition(30)).toBe('overgrown-path')
  })
  it('classifies lost for <25', () => {
    expect(classifyCondition(15)).toBe('lost')
  })
  it('classifies lost for 0', () => {
    expect(classifyCondition(0)).toBe('lost')
  })
})

// ─── classifyPathfinderGrade ───────────────────────────────────────────────

describe('classifyPathfinderGrade', () => {
  it('classifies grand-pathfinder for 80+', () => {
    expect(classifyPathfinderGrade(90)).toBe('grand-pathfinder')
  })
  it('classifies master-guide for 65-79', () => {
    expect(classifyPathfinderGrade(70)).toBe('master-guide')
  })
  it('classifies skilled-navigator for 50-64', () => {
    expect(classifyPathfinderGrade(55)).toBe('skilled-navigator')
  })
  it('classifies apprentice-guide for 35-49', () => {
    expect(classifyPathfinderGrade(40)).toBe('apprentice-guide')
  })
  it('classifies lost-traveler for 20-34', () => {
    expect(classifyPathfinderGrade(25)).toBe('lost-traveler')
  })
  it('classifies blind-wanderer for <20', () => {
    expect(classifyPathfinderGrade(10)).toBe('blind-wanderer')
  })
})

// ─── classifyRowCondition ──────────────────────────────────────────────────

describe('classifyRowCondition', () => {
  it('classifies illuminated-avenue for 75+', () => {
    expect(classifyRowCondition(80)).toBe('illuminated-avenue')
  })
  it('classifies lit-street for 60-74', () => {
    expect(classifyRowCondition(65)).toBe('lit-street')
  })
  it('classifies lantern-lit for 45-59', () => {
    expect(classifyRowCondition(50)).toBe('lantern-lit')
  })
  it('classifies dim-alley for 30-44', () => {
    expect(classifyRowCondition(35)).toBe('dim-alley')
  })
  it('classifies dark-passage for 15-29', () => {
    expect(classifyRowCondition(20)).toBe('dark-passage')
  })
  it('classifies nowhere for <15', () => {
    expect(classifyRowCondition(5)).toBe('nowhere')
  })
})

// ─── classifyRowType ───────────────────────────────────────────────────────

describe('classifyRowType', () => {
  it('returns wilderness for empty array', () => {
    expect(classifyRowType([])).toBe('wilderness')
  })

  it('returns grand-boulevard for all rich stones', () => {
    const stone = analyzeCobblestone(RICH, 'a.ts')
    expect(classifyRowType([stone])).toBe('grand-boulevard')
  })

  it('returns wilderness for poor stones', () => {
    const stone = analyzeCobblestone(POOR, 'b.ts')
    expect(classifyRowType([stone])).toBe('wilderness')
  })
})

// ─── analyzeCobblestone ────────────────────────────────────────────────────

describe('analyzeCobblestone', () => {
  it('computes correct qualityScore for rich', () => {
    const c = analyzeCobblestone(RICH, 'rich.ts')
    expect(c.qualityScore).toBe(97)
    expect(c.condition).toBe('moonlit-promenade')
    expect(c.pathQuality).toBe(88)
    expect(c.journeyClarity).toBe(100)
    expect(c.stoneworkCraft).toBe(100)
    expect(c.lanternMarkers).toBe(100)
    expect(c.travelerSafety).toBe(96)
    expect(c.wayfinding).toBe(100)
  })

  it('computes correct qualityScore for poor', () => {
    const c = analyzeCobblestone(POOR, 'poor.ts')
    expect(c.qualityScore).toBe(1)
    expect(c.condition).toBe('lost')
    expect(c.pathQuality).toBe(0)
    expect(c.journeyClarity).toBe(0)
    expect(c.stoneworkCraft).toBe(0)
    expect(c.lanternMarkers).toBe(0)
    expect(c.travelerSafety).toBe(8)
    expect(c.wayfinding).toBe(0)
  })

  it('computes correct qualityScore for empty', () => {
    const c = analyzeCobblestone(EMPTY, 'empty.ts')
    expect(c.qualityScore).toBe(0)
    expect(c.condition).toBe('lost')
  })

  it('uses wayfindingMeasure field for WayfindingMeasure object', () => {
    const c = analyzeCobblestone(RICH, 'rich.ts')
    expect(c.wayfindingMeasure).toBeDefined()
    expect(c.wayfindingMeasure.navigation).toBe(100)
    expect(c.wayfindingMeasure.signage).toBe('perfect-signs')
  })
})

// ─── analyzeCobblestoneRow ─────────────────────────────────────────────────

describe('analyzeCobblestoneRow', () => {
  it('returns wilderness row for empty stones', () => {
    const row = analyzeCobblestoneRow([], 'empty-dir')
    expect(row.directory).toBe('empty-dir')
    expect(row.rowType).toBe('wilderness')
    expect(row.condition).toBe('nowhere')
    expect(row.avgPathQuality).toBe(0)
    expect(row.avgClarity).toBe(0)
    expect(row.avgWayfinding).toBe(0)
    expect(row.moonlitPromenadeCount).toBe(0)
    expect(row.lostCount).toBe(0)
    expect(row.wellTroddenCount).toBe(0)
    expect(row.cobblestoneLaneCount).toBe(0)
  })

  it('computes correct averages for mixed stones', () => {
    const rich = analyzeCobblestone(RICH, 'dir/rich.ts')
    const poor = analyzeCobblestone(POOR, 'dir/poor.ts')
    const row = analyzeCobblestoneRow([rich, poor], 'dir')
    expect(row.avgPathQuality).toBe(44)
    expect(row.avgClarity).toBe(50)
    expect(row.avgWayfinding).toBe(50)
    expect(row.moonlitPromenadeCount).toBe(1)
    expect(row.lostCount).toBe(1)
  })
})

// ─── buildMoonlitCobbleResult ──────────────────────────────────────────────

describe('buildMoonlitCobbleResult', () => {
  it('returns correct single rich result', () => {
    const result = buildMoonlitCobbleResult(['rich.ts'], [RICH])
    expect(result.stones).toHaveLength(1)
    expect(result.stones[0].qualityScore).toBe(97)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].directory).toBe('.')
    expect(result.rows[0].rowType).toBe('grand-boulevard')
    expect(result.rows[0].condition).toBe('illuminated-avenue')
    expect(result.city.avgPathQuality).toBe(88)
    expect(result.city.avgClarity).toBe(100)
    expect(result.city.avgWayfinding).toBe(100)
    expect(result.city.isNavigable).toBe(true)
    expect(result.city.overallNavigation).toBe(96)
    expect(result.stats.pathfinderGrade).toBe('grand-pathfinder')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalRows).toBe(1)
    expect(result.stats.moonlitPromenadeCount).toBe(1)
    expect(result.stats.lostCount).toBe(0)
    expect(result.stats.bestStone).toBe('rich.ts')
    expect(result.stats.smoothestPath).toBe('rich.ts')
    expect(result.stats.clearestJourney).toBe('rich.ts')
    expect(result.stats.bestCrafted).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
    expect(result.stats.safestPath).toBe('rich.ts')
  })

  it('returns correct mixed result', () => {
    const result = buildMoonlitCobbleResult(['dir/rich.ts', 'dir/poor.ts'], [RICH, POOR])
    expect(result.stones).toHaveLength(2)
    expect(result.rows).toHaveLength(1)
    expect(result.city.avgPathQuality).toBe(44)
    expect(result.city.avgClarity).toBe(50)
    expect(result.city.avgWayfinding).toBe(50)
    expect(result.city.isNavigable).toBe(false)
    expect(result.city.overallNavigation).toBe(48)
    expect(result.stats.pathfinderGrade).toBe('apprentice-guide')
    expect(result.stats.avgTravelerSafety).toBe(52)
    expect(result.stats.lostCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighCraftCount).toBe(1)
    expect(result.stats.hasHighMarkersCount).toBe(1)
    expect(result.stats.hasHighProtectionCount).toBe(1)
    expect(result.stats.hasHighNavigationCount).toBe(1)
  })

  it('returns empty result for no files', () => {
    const result = buildMoonlitCobbleResult([], [])
    expect(result.stones).toHaveLength(0)
    expect(result.rows).toHaveLength(0)
    expect(result.city.avgPathQuality).toBe(0)
    expect(result.city.isNavigable).toBe(false)
    expect(result.city.overallNavigation).toBe(0)
    expect(result.stats.pathfinderGrade).toBe('blind-wanderer')
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestStone).toBe('')
    expect(result.stats.smoothestPath).toBe('')
  })

  it('groups files by directory', () => {
    const result = buildMoonlitCobbleResult(
      ['a/rich.ts', 'b/rich.ts'],
      [RICH, RICH],
    )
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0].directory).toBe('a')
    expect(result.rows[1].directory).toBe('b')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for rich result', () => {
    const result = buildMoonlitCobbleResult(['rich.ts'], [RICH])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('moonlit perfection')
  })

  it('returns recommendations for empty result', () => {
    const result = buildMoonlitCobbleResult([], [])
    expect(result.recommendations.length).toBeGreaterThan(1)
    expect(result.recommendations).toContain('Smooth code paths with const declarations, return types, and strict equality')
  })

  it('includes lost files in recommendations', () => {
    const result = buildMoonlitCobbleResult(['dir/poor.ts'], [POOR])
    const lostRec = result.recommendations.find((r) => r.includes('lost'))
    expect(lostRec).toBeDefined()
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatMoonlitCobbleJson', () => {
  it('returns valid JSON', () => {
    const result = buildMoonlitCobbleResult(['rich.ts'], [RICH])
    const json = formatMoonlitCobbleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stones).toHaveLength(1)
    expect(parsed.city.overallNavigation).toBe(96)
  })
})

describe('formatMoonlitCobbleTable', () => {
  it('returns non-empty string for rich result', () => {
    const result = buildMoonlitCobbleResult(['rich.ts'], [RICH])
    const table = formatMoonlitCobbleTable(result, false)
    expect(table).toContain('Moonlit Cobble Analysis')
    expect(table).toContain('City:')
    expect(table).toContain('Statistics:')
    expect(table).toContain('Condition Counts:')
    expect(table).toContain('Highlights:')
  })

  it('includes per-file stones when verbose', () => {
    const result = buildMoonlitCobbleResult(['rich.ts'], [RICH])
    const table = formatMoonlitCobbleTable(result, true)
    expect(table).toContain('Per-File Stones:')
    expect(table).toContain('rich.ts')
  })

  it('excludes per-file stones when not verbose', () => {
    const result = buildMoonlitCobbleResult(['rich.ts'], [RICH])
    const table = formatMoonlitCobbleTable(result, false)
    expect(table).not.toContain('Per-File Stones:')
  })

  it('includes recommendations', () => {
    const result = buildMoonlitCobbleResult(['rich.ts'], [RICH])
    const table = formatMoonlitCobbleTable(result, false)
    expect(table).toContain('Recommendations:')
  })
})

describe('color helpers', () => {
  it('scoreColor returns string for various scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(30)).toBe('string')
  })

  it('pathConditionColor returns string for all conditions', () => {
    expect(typeof pathConditionColor('roman-road')).toBe('string')
    expect(typeof pathConditionColor('bog')).toBe('string')
    expect(typeof pathConditionColor('unknown')).toBe('string')
  })

  it('journeyViewColor returns string for all views', () => {
    expect(typeof journeyViewColor('moonlit-panorama')).toBe('string')
    expect(typeof journeyViewColor('pitch-dark')).toBe('string')
    expect(typeof journeyViewColor('unknown')).toBe('string')
  })

  it('stoneworkQualityColor returns string for all qualities', () => {
    expect(typeof stoneworkQualityColor('master-mason')).toBe('string')
    expect(typeof stoneworkQualityColor('rubble')).toBe('string')
    expect(typeof stoneworkQualityColor('unknown')).toBe('string')
  })

  it('lanternBrightnessColor returns string for all brightness levels', () => {
    expect(typeof lanternBrightnessColor('beacon-lit')).toBe('string')
    expect(typeof lanternBrightnessColor('darkness')).toBe('string')
    expect(typeof lanternBrightnessColor('unknown')).toBe('string')
  })

  it('safetyGuardrailColor returns string for all guardrails', () => {
    expect(typeof safetyGuardrailColor('fortress-walls')).toBe('string')
    expect(typeof safetyGuardrailColor('cliff')).toBe('string')
    expect(typeof safetyGuardrailColor('unknown')).toBe('string')
  })

  it('wayfindingSignageColor returns string for all signage types', () => {
    expect(typeof wayfindingSignageColor('perfect-signs')).toBe('string')
    expect(typeof wayfindingSignageColor('labyrinth')).toBe('string')
    expect(typeof wayfindingSignageColor('unknown')).toBe('string')
  })

  it('stoneConditionColor returns string for all conditions', () => {
    expect(typeof stoneConditionColor('moonlit-promenade')).toBe('string')
    expect(typeof stoneConditionColor('lost')).toBe('string')
    expect(typeof stoneConditionColor('unknown')).toBe('string')
  })

  it('pathfinderGradeColor returns string for all grades', () => {
    expect(typeof pathfinderGradeColor('grand-pathfinder')).toBe('string')
    expect(typeof pathfinderGradeColor('blind-wanderer')).toBe('string')
    expect(typeof pathfinderGradeColor('unknown')).toBe('string')
  })
})
