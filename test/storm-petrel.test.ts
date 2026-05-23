import { describe, expect, it } from 'vitest'
import {
  measureStormy,
  measureNavigating,
  measureOceanic,
  measureEnduring,
  measureInstinctual,
  measureFlocking,
  analyzePetrelFlight,
  classifyCondition,
  classifyFormationType,
  classifyFormationCondition,
  classifyAviatorGrade,
  analyzeFlightFormation,
  generateRecommendations,
  buildStormPetrelResult,
} from '../src/commands/storm-petrel-helpers.js'
import {
  scoreColor,
  stormRidingColor,
  navigatingSkillColor,
  oceanicResilienceColor,
  enduringStaminaColor,
  instinctualSenseColor,
  flockingHarmonyColor,
  flightConditionColor,
  aviatorGradeColor,
  formatStormPetrelJson,
  formatStormPetrelTable,
} from '../src/commands/storm-petrel-format-helpers.js'

const RICH = `import chalk from 'chalk'

export interface Widget {
  id: string
  name: string
  count: number
}

export type WidgetStatus = 'active' | 'inactive'

export class WidgetService {
  private items: Map<string, Widget> = new Map()
  private readonly maxSize: number = 100

  async getWidget(id: string): Promise<Widget | undefined> {
    try {
      const item = this.items.get(id)
      if (!item) return undefined
      return { ...item }
    } catch (err) {
      return undefined
    }
  }

  addWidget(widget: Widget): void {
    if (this.items.size >= this.maxSize) {
      throw new Error('Capacity reached')
    }
    this.items.set(widget.id, widget)
  }
}

export function createDefault(): Widget {
  return { id: 'default', name: 'Default', count: 0 }
}

export const DEFAULT_WIDGET: Widget = { id: '0', name: 'root', count: 1 }
`

const SIMPLE = 'const x = 1\n'
const EMPTY = ''
const BAD = 'var x: any = {} as any\nvar y: any = {} as any\n'

describe('storm-petrel measureStormy', () => {
  it('measures RICH content correctly', () => {
    const m = measureStormy(RICH)
    expect(m.handling).toBe(88)
    expect(m.riding).toBe('hurricane-rider')
    expect(m.hasHighHandling).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasGraceful).toBe(false)
    expect(m.hasNoCrash).toBe(true)
    expect(m.hasErrorRecovery).toBe(true)
    expect(m.hasNoPanic).toBe(true)
    expect(m.hasPressureProof).toBe(true)
    expect(m.hasNoBuckle).toBe(true)
    expect(m.hasSteady).toBe(true)
    expect(m.hasNoBreak).toBe(true)
    expect(m.hasComposed).toBe(true)
    expect(m.crashCount).toBe(0)
    expect(m.panicCount).toBe(0)
  })

  it('measures SIMPLE content correctly', () => {
    const m = measureStormy(SIMPLE)
    expect(m.handling).toBe(16)
    expect(m.riding).toBe('grounded')
    expect(m.hasHighHandling).toBe(false)
    expect(m.hasNoCrash).toBe(true)
    expect(m.hasNoPanic).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureStormy(EMPTY)
    expect(m.handling).toBe(0)
    expect(m.riding).toBe('grounded')
    expect(m.hasHighHandling).toBe(false)
  })

  it('measures BAD content correctly', () => {
    const m = measureStormy(BAD)
    expect(m.handling).toBe(8)
    expect(m.riding).toBe('grounded')
    expect(m.hasNoCrash).toBe(false)
    expect(m.hasNoPanic).toBe(false)
    expect(m.crashCount).toBe(2)
    expect(m.panicCount).toBe(4)
  })
})

describe('storm-petrel measureNavigating', () => {
  it('measures RICH content correctly', () => {
    const m = measureNavigating(RICH)
    expect(m.adaptation).toBe(81)
    expect(m.skill).toBe('adaptive-flyer')
    expect(m.hasHighAdaptation).toBe(true)
    expect(m.hasAdaptable).toBe(false)
    expect(m.hasFlexible).toBe(false)
    expect(m.hasNoRigidity).toBe(true)
    expect(m.hasResponsive).toBe(true)
    expect(m.hasNoStiffness).toBe(true)
    expect(m.hasDynamic).toBe(true)
    expect(m.hasNoStatic).toBe(true)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasNoFrozen).toBe(true)
    expect(m.hasAgile).toBe(false)
    expect(m.rigidityCount).toBe(0)
    expect(m.stiffnessCount).toBe(0)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureNavigating(EMPTY)
    expect(m.adaptation).toBe(0)
    expect(m.skill).toBe('lost')
    expect(m.hasNoRigidity).toBe(true)
  })

  it('measures BAD content correctly', () => {
    const m = measureNavigating(BAD)
    expect(m.adaptation).toBe(8)
    expect(m.skill).toBe('lost')
    expect(m.hasNoRigidity).toBe(false)
    expect(m.rigidityCount).toBe(2)
    expect(m.stiffnessCount).toBe(4)
  })
})

describe('storm-petrel measureOceanic', () => {
  it('measures RICH content correctly', () => {
    const m = measureOceanic(RICH)
    expect(m.depth).toBe(78)
    expect(m.resilience).toBe('ocean-hardy')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasDeep).toBe(false)
    expect(m.hasComplexityHandling).toBe(true)
    expect(m.hasNoShallowness).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasNoFragility).toBe(true)
    expect(m.hasPressure).toBe(false)
    expect(m.hasNoCrushing).toBe(true)
    expect(m.hasThorough).toBe(false)
    expect(m.hasNoSuperficial).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureOceanic(EMPTY)
    expect(m.depth).toBe(0)
    expect(m.resilience).toBe('landlubber')
    expect(m.hasHighDepth).toBe(false)
  })

  it('measures BAD content correctly', () => {
    const m = measureOceanic(BAD)
    expect(m.depth).toBe(0)
    expect(m.resilience).toBe('landlubber')
    expect(m.hasNoShallowness).toBe(false)
    expect(m.shallownessCount).toBe(2)
    expect(m.fragilityCount).toBe(4)
  })
})

describe('storm-petrel measureEnduring', () => {
  it('measures RICH content correctly', () => {
    const m = measureEnduring(RICH)
    expect(m.stamina).toBe(83)
    expect(m.endurance).toBe('long-haul')
    expect(m.hasHighStamina).toBe(true)
    expect(m.hasDurable).toBe(false)
    expect(m.hasSustainable).toBe(true)
    expect(m.hasNoExhaustion).toBe(true)
    expect(m.hasLongRunning).toBe(false)
    expect(m.hasNoBurnout).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasNoResourceHog).toBe(true)
    expect(m.hasPerformant).toBe(true)
    expect(m.hasNoDegradation).toBe(true)
    expect(m.hasPersistent).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureEnduring(EMPTY)
    expect(m.stamina).toBe(0)
    expect(m.endurance).toBe('exhausted')
    expect(m.hasHighStamina).toBe(false)
  })

  it('measures BAD content correctly', () => {
    const m = measureEnduring(BAD)
    expect(m.stamina).toBe(0)
    expect(m.endurance).toBe('exhausted')
    expect(m.hasNoExhaustion).toBe(false)
    expect(m.exhaustionCount).toBe(2)
    expect(m.burnoutCount).toBe(4)
  })
})

describe('storm-petrel measureInstinctual', () => {
  it('measures RICH content correctly', () => {
    const m = measureInstinctual(RICH)
    expect(m.direction).toBe(96)
    expect(m.sense).toBe('homing-pigeon')
    expect(m.hasHighDirection).toBe(true)
    expect(m.hasClearPurpose).toBe(false)
    expect(m.hasFocused).toBe(true)
    expect(m.hasNoDrift).toBe(true)
    expect(m.hasGoal).toBe(true)
    expect(m.hasNoMeandering).toBe(true)
    expect(m.hasIntentional).toBe(true)
    expect(m.hasNoAccidental).toBe(true)
    expect(m.hasDirected).toBe(true)
    expect(m.hasNoRandom).toBe(true)
    expect(m.hasPurposed).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureInstinctual(EMPTY)
    expect(m.direction).toBe(0)
    expect(m.sense).toBe('lost')
    expect(m.hasHighDirection).toBe(false)
  })

  it('measures BAD content correctly', () => {
    const m = measureInstinctual(BAD)
    expect(m.direction).toBe(0)
    expect(m.sense).toBe('lost')
    expect(m.hasNoDrift).toBe(false)
    expect(m.driftCount).toBe(2)
    expect(m.meanderingCount).toBe(4)
  })
})

describe('storm-petrel measureFlocking', () => {
  it('measures RICH content correctly', () => {
    const m = measureFlocking(RICH)
    expect(m.coordination).toBe(96)
    expect(m.harmony).toBe('perfect-flock')
    expect(m.hasHighCoordination).toBe(true)
    expect(m.hasCompatible).toBe(true)
    expect(m.hasWellInterfaced).toBe(true)
    expect(m.hasNoConflict).toBe(true)
    expect(m.hasCohesive).toBe(true)
    expect(m.hasNoClash).toBe(true)
    expect(m.hasTeamwork).toBe(false)
    expect(m.hasNoIsolation).toBe(true)
    expect(m.hasIntegrated).toBe(true)
    expect(m.hasNoSilos).toBe(true)
    expect(m.hasCollaborative).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureFlocking(EMPTY)
    expect(m.coordination).toBe(0)
    expect(m.harmony).toBe('isolated')
    expect(m.hasHighCoordination).toBe(false)
  })

  it('measures BAD content correctly', () => {
    const m = measureFlocking(BAD)
    expect(m.coordination).toBe(0)
    expect(m.harmony).toBe('isolated')
    expect(m.hasNoConflict).toBe(false)
    expect(m.conflictCount).toBe(2)
    expect(m.siloCount).toBe(4)
  })
})

describe('storm-petrel classifyCondition', () => {
  it('classifies master-aviator', () => expect(classifyCondition(90)).toBe('master-aviator'))
  it('classifies storm-rider', () => expect(classifyCondition(75)).toBe('storm-rider'))
  it('classifies steady-flyer', () => expect(classifyCondition(60)).toBe('steady-flyer'))
  it('classifies struggling-bird', () => expect(classifyCondition(45)).toBe('struggling-bird'))
  it('classifies grounded-bird', () => expect(classifyCondition(30)).toBe('grounded-bird'))
  it('classifies fallen', () => expect(classifyCondition(20)).toBe('fallen'))
  it('classifies fallen at 0', () => expect(classifyCondition(0)).toBe('fallen'))
  it('classifies master-aviator at boundary', () => expect(classifyCondition(85)).toBe('master-aviator'))
  it('classifies storm-rider at boundary', () => expect(classifyCondition(70)).toBe('storm-rider'))
  it('classifies steady-flyer at boundary', () => expect(classifyCondition(55)).toBe('steady-flyer'))
  it('classifies struggling-bird at boundary', () => expect(classifyCondition(40)).toBe('struggling-bird'))
  it('classifies grounded-bird at boundary', () => expect(classifyCondition(25)).toBe('grounded-bird'))
})

describe('storm-petrel classifyAviatorGrade', () => {
  it('classifies master-aviator', () => expect(classifyAviatorGrade(85)).toBe('master-aviator'))
  it('classifies expert-navigator', () => expect(classifyAviatorGrade(70)).toBe('expert-navigator'))
  it('classifies skilled-pilot', () => expect(classifyAviatorGrade(55)).toBe('skilled-pilot'))
  it('classifies apprentice-flyer', () => expect(classifyAviatorGrade(40)).toBe('apprentice-flyer'))
  it('classifies novice', () => expect(classifyAviatorGrade(25)).toBe('novice'))
  it('classifies flightless', () => expect(classifyAviatorGrade(10)).toBe('flightless'))
  it('classifies master-aviator at boundary', () => expect(classifyAviatorGrade(80)).toBe('master-aviator'))
  it('classifies expert-navigator at boundary', () => expect(classifyAviatorGrade(65)).toBe('expert-navigator'))
  it('classifies skilled-pilot at boundary', () => expect(classifyAviatorGrade(50)).toBe('skilled-pilot'))
  it('classifies apprentice-flyer at boundary', () => expect(classifyAviatorGrade(35)).toBe('apprentice-flyer'))
  it('classifies novice at boundary', () => expect(classifyAviatorGrade(20)).toBe('novice'))
})

describe('storm-petrel classifyFormationType', () => {
  it('returns empty-sky for empty array', () => {
    expect(classifyFormationType([])).toBe('empty-sky')
  })

  it('returns v-formation for high quality flights', () => {
    const flights = [
      { qualityScore: 90, condition: 'master-aviator' } as any,
      { qualityScore: 88, condition: 'master-aviator' } as any,
    ]
    expect(classifyFormationType(flights)).toBe('v-formation')
  })

  it('returns coordinated-flock for medium quality', () => {
    const flights = [
      { qualityScore: 65, condition: 'storm-rider' } as any,
    ]
    expect(classifyFormationType(flights)).toBe('coordinated-flock')
  })

  it('returns scattered-group for below average', () => {
    const flights = [
      { qualityScore: 48, condition: 'struggling-bird' } as any,
    ]
    expect(classifyFormationType(flights)).toBe('scattered-group')
  })
})

describe('storm-petrel classifyFormationCondition', () => {
  it('classifies magnificent-flight', () => expect(classifyFormationCondition(80)).toBe('magnificent-flight'))
  it('classifies proper-flock', () => expect(classifyFormationCondition(65)).toBe('proper-flock'))
  it('classifies decent-group', () => expect(classifyFormationCondition(50)).toBe('decent-group'))
  it('classifies struggling-formation', () => expect(classifyFormationCondition(35)).toBe('struggling-formation'))
  it('classifies scattered-birds', () => expect(classifyFormationCondition(20)).toBe('scattered-birds'))
  it('classifies empty-skies', () => expect(classifyFormationCondition(10)).toBe('empty-skies'))
})

describe('storm-petrel analyzePetrelFlight', () => {
  it('analyzes RICH content correctly', () => {
    const f = analyzePetrelFlight(RICH, 'src/widget.ts')
    expect(f.file).toBe('src/widget.ts')
    expect(f.qualityScore).toBe(88)
    expect(f.condition).toBe('master-aviator')
    expect(f.stormRiding).toBe(88)
    expect(f.windNavigation).toBe(81)
    expect(f.oceanResilience).toBe(78)
    expect(f.flightEndurance).toBe(83)
    expect(f.navigationalInstinct).toBe(96)
    expect(f.flockCoordination).toBe(96)
  })

  it('analyzes SIMPLE content correctly', () => {
    const f = analyzePetrelFlight(SIMPLE, 'simple.ts')
    expect(f.file).toBe('simple.ts')
    expect(f.qualityScore).toBe(11)
    expect(f.condition).toBe('fallen')
    expect(f.stormRiding).toBe(16)
    expect(f.windNavigation).toBe(16)
  })

  it('analyzes EMPTY content correctly', () => {
    const f = analyzePetrelFlight(EMPTY, 'empty.ts')
    expect(f.file).toBe('empty.ts')
    expect(f.qualityScore).toBe(0)
    expect(f.condition).toBe('fallen')
  })

  it('analyzes BAD content correctly', () => {
    const f = analyzePetrelFlight(BAD, 'bad.ts')
    expect(f.file).toBe('bad.ts')
    expect(f.qualityScore).toBe(3)
    expect(f.condition).toBe('fallen')
  })
})

describe('storm-petrel analyzeFlightFormation', () => {
  it('handles empty flights', () => {
    const fm = analyzeFlightFormation([], 'empty-dir')
    expect(fm.directory).toBe('empty-dir')
    expect(fm.flights).toEqual([])
    expect(fm.avgStormRiding).toBe(0)
    expect(fm.avgEndurance).toBe(0)
    expect(fm.avgCoordination).toBe(0)
    expect(fm.masterAviatorCount).toBe(0)
    expect(fm.fallenCount).toBe(0)
    expect(fm.stormRiderCount).toBe(0)
    expect(fm.steadyFlyerCount).toBe(0)
    expect(fm.formationType).toBe('empty-sky')
    expect(fm.condition).toBe('empty-skies')
  })

  it('handles single RICH flight', () => {
    const f = analyzePetrelFlight(RICH, 'src/a.ts')
    const fm = analyzeFlightFormation([f], 'src')
    expect(fm.avgStormRiding).toBe(88)
    expect(fm.avgEndurance).toBe(83)
    expect(fm.avgCoordination).toBe(96)
    expect(fm.masterAviatorCount).toBe(1)
    expect(fm.formationType).toBe('v-formation')
  })
})

describe('storm-petrel generateRecommendations', () => {
  it('returns positive message for high quality', () => {
    const f = analyzePetrelFlight(RICH, 'good.ts')
    const fm = analyzeFlightFormation([f], '.')
    const result = buildStormPetrelResult(['good.ts'], [RICH])
    const recs = generateRecommendations(result.flights, result.formations, result.migration, result.stats)
    expect(recs).toContain('Your storm petrels ride the wildest winds with grace! Every flight is masterful')
  })

  it('recommends storm riding improvement for low scores', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Strengthen storm riding with try/catch, async patterns, and graceful degradation')
  })

  it('recommends wind navigation improvement', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Improve wind navigation with optional chaining, generics, and flexible abstractions')
  })

  it('recommends ocean resilience improvement', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Deepen ocean resilience with interfaces, generics, and thorough type coverage')
  })

  it('recommends flight endurance improvement', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Build flight endurance with strict equality, readonly fields, and sustainable patterns')
  })

  it('recommends navigational instinct improvement', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Sharpen navigational instinct with clear exports, documentation, and purposeful design')
  })

  it('recommends flock coordination improvement', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Improve flock coordination with imports, interfaces, and well-documented boundaries')
  })

  it('notifies about fallen files', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('1 file(s) have fallen — consider significant refactoring')
  })

  it('notifies about low overall resilience', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Overall migration resilience is low — prioritize storm riding and endurance')
  })

  it('rescues specific fallen files', () => {
    const result = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Rescue these fallen files: bad.ts')
  })
})

describe('storm-petrel buildStormPetrelResult', () => {
  it('handles empty input', () => {
    const r = buildStormPetrelResult([], [])
    expect(r.flights).toEqual([])
    expect(r.formations).toEqual([])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalFormations).toBe(0)
    expect(r.stats.avgStormRiding).toBe(0)
    expect(r.stats.overallResilience).toBe(0)
    expect(r.stats.aviatorGrade).toBe('flightless')
    expect(r.stats.bestFlight).toBe('')
    expect(r.migration.isResilient).toBe(false)
    expect(r.migration.overallResilience).toBe(0)
  })

  it('handles single RICH file', () => {
    const r = buildStormPetrelResult(['src/widget.ts'], [RICH])
    expect(r.flights).toHaveLength(1)
    expect(r.formations).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgStormRiding).toBe(88)
    expect(r.stats.avgWindNavigation).toBe(81)
    expect(r.stats.avgOceanResilience).toBe(78)
    expect(r.stats.avgFlightEndurance).toBe(83)
    expect(r.stats.avgNavigationalInstinct).toBe(96)
    expect(r.stats.avgFlockCoordination).toBe(96)
    expect(r.stats.masterAviatorCount).toBe(1)
    expect(r.stats.fallenCount).toBe(0)
    expect(r.stats.overallResilience).toBe(89)
    expect(r.stats.aviatorGrade).toBe('master-aviator')
    expect(r.stats.bestFlight).toBe('src/widget.ts')
    expect(r.stats.bestStormRider).toBe('src/widget.ts')
    expect(r.stats.bestNavigator).toBe('src/widget.ts')
    expect(r.stats.deepest).toBe('src/widget.ts')
    expect(r.stats.mostEnduring).toBe('src/widget.ts')
    expect(r.stats.mostCoordinated).toBe('src/widget.ts')
    expect(r.migration.isResilient).toBe(true)
    expect(r.migration.overallResilience).toBe(89)
  })

  it('handles RICH + SIMPLE files', () => {
    const r = buildStormPetrelResult(['src/widget.ts', 'simple.ts'], [RICH, SIMPLE])
    expect(r.flights).toHaveLength(2)
    expect(r.formations).toHaveLength(2)
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgStormRiding).toBe(52)
    expect(r.stats.avgWindNavigation).toBe(49)
    expect(r.stats.avgOceanResilience).toBe(43)
    expect(r.stats.avgFlightEndurance).toBe(47)
    expect(r.stats.avgNavigationalInstinct).toBe(52)
    expect(r.stats.avgFlockCoordination).toBe(52)
    expect(r.stats.masterAviatorCount).toBe(1)
    expect(r.stats.fallenCount).toBe(1)
    expect(r.stats.overallResilience).toBe(50)
    expect(r.stats.aviatorGrade).toBe('skilled-pilot')
    expect(r.migration.avgStormRiding).toBe(52)
    expect(r.migration.avgEndurance).toBe(47)
    expect(r.migration.avgCoordination).toBe(52)
    expect(r.migration.isResilient).toBe(false)
    expect(r.migration.overallResilience).toBe(50)
  })

  it('handles BAD file', () => {
    const r = buildStormPetrelResult(['bad.ts'], [BAD])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgStormRiding).toBe(8)
    expect(r.stats.avgWindNavigation).toBe(8)
    expect(r.stats.avgOceanResilience).toBe(0)
    expect(r.stats.avgFlightEndurance).toBe(0)
    expect(r.stats.avgNavigationalInstinct).toBe(0)
    expect(r.stats.avgFlockCoordination).toBe(0)
    expect(r.stats.fallenCount).toBe(1)
    expect(r.stats.overallResilience).toBe(3)
    expect(r.stats.aviatorGrade).toBe('flightless')
    expect(r.migration.isResilient).toBe(false)
  })

  it('groups files by directory in formations', () => {
    const r = buildStormPetrelResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, SIMPLE, RICH],
    )
    expect(r.formations).toHaveLength(2)
    const srcFm = r.formations.find((fm) => fm.directory === 'src')
    const libFm = r.formations.find((fm) => fm.directory === 'lib')
    expect(srcFm).toBeDefined()
    expect(libFm).toBeDefined()
    expect(srcFm!.flights).toHaveLength(2)
    expect(libFm!.flights).toHaveLength(1)
  })

  it('tracks hasHigh* counts correctly', () => {
    const r = buildStormPetrelResult(['src/widget.ts'], [RICH])
    expect(r.stats.hasHighHandlingCount).toBe(1)
    expect(r.stats.hasHighAdaptationCount).toBe(1)
    expect(r.stats.hasHighDepthCount).toBe(1)
    expect(r.stats.hasHighStaminaCount).toBe(1)
    expect(r.stats.hasHighDirectionCount).toBe(1)
    expect(r.stats.hasHighCoordinationCount).toBe(1)
  })

  it('tracks condition counts correctly', () => {
    const r = buildStormPetrelResult(['src/widget.ts', 'simple.ts'], [RICH, SIMPLE])
    expect(r.stats.masterAviatorCount).toBe(1)
    expect(r.stats.stormRiderCount).toBe(0)
    expect(r.stats.steadyFlyerCount).toBe(0)
    expect(r.stats.strugglingBirdCount).toBe(0)
    expect(r.stats.groundedBirdCount).toBe(0)
    expect(r.stats.fallenCount).toBe(1)
  })
})

describe('storm-petrel format-helpers', () => {
  it('scoreColor returns string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('scoreColor returns string for mid score', () => {
    expect(typeof scoreColor(65)).toBe('string')
  })

  it('scoreColor returns string for low score', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })

  it('stormRidingColor handles all tiers', () => {
    expect(typeof stormRidingColor('hurricane-rider')).toBe('string')
    expect(typeof stormRidingColor('storm-navigator')).toBe('string')
    expect(typeof stormRidingColor('weather-tested')).toBe('string')
    expect(typeof stormRidingColor('fair-weather')).toBe('string')
    expect(typeof stormRidingColor('storm-shy')).toBe('string')
    expect(typeof stormRidingColor('grounded')).toBe('string')
  })

  it('navigatingSkillColor handles all tiers', () => {
    expect(typeof navigatingSkillColor('wind-master')).toBe('string')
    expect(typeof navigatingSkillColor('adaptive-flyer')).toBe('string')
    expect(typeof navigatingSkillColor('proper-navigator')).toBe('string')
    expect(typeof navigatingSkillColor('rigid-flyer')).toBe('string')
    expect(typeof navigatingSkillColor('wind-blown')).toBe('string')
    expect(typeof navigatingSkillColor('lost')).toBe('string')
  })

  it('oceanicResilienceColor handles all tiers', () => {
    expect(typeof oceanicResilienceColor('deep-diver')).toBe('string')
    expect(typeof oceanicResilienceColor('ocean-hardy')).toBe('string')
    expect(typeof oceanicResilienceColor('surface-swimmer')).toBe('string')
    expect(typeof oceanicResilienceColor('shallow-water')).toBe('string')
    expect(typeof oceanicResilienceColor('puddle-jumper')).toBe('string')
    expect(typeof oceanicResilienceColor('landlubber')).toBe('string')
  })

  it('enduringStaminaColor handles all tiers', () => {
    expect(typeof enduringStaminaColor('trans-oceanic')).toBe('string')
    expect(typeof enduringStaminaColor('long-haul')).toBe('string')
    expect(typeof enduringStaminaColor('proper-stamina')).toBe('string')
    expect(typeof enduringStaminaColor('medium-range')).toBe('string')
    expect(typeof enduringStaminaColor('short-hop')).toBe('string')
    expect(typeof enduringStaminaColor('exhausted')).toBe('string')
  })

  it('instinctualSenseColor handles all tiers', () => {
    expect(typeof instinctualSenseColor('homing-pigeon')).toBe('string')
    expect(typeof instinctualSenseColor('strong-instinct')).toBe('string')
    expect(typeof instinctualSenseColor('proper-direction')).toBe('string')
    expect(typeof instinctualSenseColor('uncertain')).toBe('string')
    expect(typeof instinctualSenseColor('wandering')).toBe('string')
    expect(typeof instinctualSenseColor('lost')).toBe('string')
  })

  it('flockingHarmonyColor handles all tiers', () => {
    expect(typeof flockingHarmonyColor('perfect-flock')).toBe('string')
    expect(typeof flockingHarmonyColor('coordinated-flight')).toBe('string')
    expect(typeof flockingHarmonyColor('proper-formation')).toBe('string')
    expect(typeof flockingHarmonyColor('loose-group')).toBe('string')
    expect(typeof flockingHarmonyColor('scattered')).toBe('string')
    expect(typeof flockingHarmonyColor('isolated')).toBe('string')
  })

  it('flightConditionColor handles all tiers', () => {
    expect(typeof flightConditionColor('master-aviator')).toBe('string')
    expect(typeof flightConditionColor('storm-rider')).toBe('string')
    expect(typeof flightConditionColor('steady-flyer')).toBe('string')
    expect(typeof flightConditionColor('struggling-bird')).toBe('string')
    expect(typeof flightConditionColor('grounded-bird')).toBe('string')
    expect(typeof flightConditionColor('fallen')).toBe('string')
  })

  it('aviatorGradeColor handles all tiers', () => {
    expect(typeof aviatorGradeColor('master-aviator')).toBe('string')
    expect(typeof aviatorGradeColor('expert-navigator')).toBe('string')
    expect(typeof aviatorGradeColor('skilled-pilot')).toBe('string')
    expect(typeof aviatorGradeColor('apprentice-flyer')).toBe('string')
    expect(typeof aviatorGradeColor('novice')).toBe('string')
    expect(typeof aviatorGradeColor('flightless')).toBe('string')
  })

  it('formatStormPetrelJson returns valid JSON', () => {
    const r = buildStormPetrelResult(['src/widget.ts'], [RICH])
    const json = formatStormPetrelJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatStormPetrelTable returns string with content', () => {
    const r = buildStormPetrelResult(['src/widget.ts'], [RICH])
    const table = formatStormPetrelTable(r, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatStormPetrelTable verbose shows per-file details', () => {
    const r = buildStormPetrelResult(['src/widget.ts'], [RICH])
    const table = formatStormPetrelTable(r, true)
    expect(table).toContain('widget.ts')
  })

  it('formatStormPetrelTable non-verbose omits per-file details', () => {
    const r = buildStormPetrelResult(['src/widget.ts'], [RICH])
    const table = formatStormPetrelTable(r, false)
    expect(table).not.toContain('Per-File Flights')
  })

  it('scoreColor handles unknown values gracefully', () => {
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('color functions handle unknown strings', () => {
    expect(typeof stormRidingColor('unknown')).toBe('string')
    expect(typeof navigatingSkillColor('unknown')).toBe('string')
    expect(typeof flightConditionColor('unknown')).toBe('string')
    expect(typeof aviatorGradeColor('unknown')).toBe('string')
  })
})
