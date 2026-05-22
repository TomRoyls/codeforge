import { describe, expect, it } from 'vitest'
import {
  measureFlow,
  measureHarmony,
  measureAlignment,
  measureGrace,
  measureOpenness,
  measureClarity,
  analyzeTempleChamber,
  analyzeTempleComplex,
  classifyCondition,
  classifyComplexType,
  classifyComplexCondition,
  classifyArchitectGrade,
  generateRecommendations,
  buildWindTempleResult,
} from '../src/commands/wind-temple-helpers.js'
import {
  scoreColor,
  conditionColor,
  gradeColor,
  complexTypeColor,
  formatWindTempleJson,
  formatWindTempleTable,
} from '../src/commands/wind-temple-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `/**
 * Well-documented module with classes, interfaces, types, and full type safety.
 * @example createApp(config)
 */

import type { Config } from './config.js'
import type { Logger } from './logger.js'
import { EventEmitter } from 'events'
import { promisify } from 'util'

export interface AppConfig {
  name: string
  version: string
  debug: boolean
}

export interface ServerConfig extends AppConfig {
  port: number
  host: string
}

export type ConfigType = AppConfig | ServerConfig

export enum Status {
  Idle = 'idle',
  Running = 'running',
  Stopped = 'stopped',
}

/**
 * Application class
 * @example const app = new Application(config)
 */
export class Application extends EventEmitter {
  private config: ServerConfig
  private status: Status = Status.Idle
  protected logger: Logger
  static readonly defaultPort = 3000

  constructor(config: ServerConfig) {
    super()
    this.config = config
  }

  async start(): Promise<void> {
    try {
      this.status = Status.Running
      if (this.config.debug) {
        process.stdout.write('Starting...')
      }
    } catch (err) {
      this.status = Status.Stopped
    }
  }

  stop(): void {
    this.status = Status.Stopped
  }
}

export function createApp(config: ServerConfig): Application {
  return new Application(config)
}

export const createServer = (config: ServerConfig): Application => {
  return new Application(config)
}

export type { Config, Logger }
`

const EMPTY = ''

const MEDIUM = `
import { something } from 'lib'

function processItem(item) {
  if (item) {
    return item.value
  }
  return null
}

export function main() {
  const data = processItem({ value: 42 })
  // TODO: improve this
  return data
}
`

// ─── Flow Measurement ───────────────────────────────────────────────────────

describe('measureFlow', () => {
  it('RICH: returns high level with good flow', () => {
    const flow = measureFlow(RICH)
    expect(flow.level).toBe(100)
    expect(flow.pattern).toBe('draft')
    expect(flow.hasGoodFlow).toBe(true)
    expect(flow.hasNaturalVentilation).toBe(true)
    expect(flow.hasProperChannels).toBe(true)
    expect(flow.hasNoBlockage).toBe(false)
    expect(flow.hasWindward).toBe(true)
    expect(flow.hasLeeward).toBe(true)
    expect(flow.hasNoTurbulence).toBe(true)
    expect(flow.hasProperDraft).toBe(true)
    expect(flow.hasCrossVentilation).toBe(true)
    expect(flow.hasNoStagnation).toBe(true)
    expect(flow.blockageCount).toBe(1)
    expect(flow.turbulenceCount).toBe(0)
  })

  it('EMPTY: returns low level', () => {
    const flow = measureFlow(EMPTY)
    expect(flow.level).toBe(37)
    expect(flow.pattern).toBe('still')
    expect(flow.hasGoodFlow).toBe(false)
    expect(flow.hasNaturalVentilation).toBe(false)
    expect(flow.hasNoBlockage).toBe(true)
    expect(flow.hasNoTurbulence).toBe(true)
    expect(flow.hasNoStagnation).toBe(false)
    expect(flow.blockageCount).toBe(0)
    expect(flow.turbulenceCount).toBe(0)
  })

  it('MEDIUM: returns mid level', () => {
    const flow = measureFlow(MEDIUM)
    expect(flow.level).toBe(53)
    expect(flow.pattern).toBe('still')
    expect(flow.hasGoodFlow).toBe(false)
    expect(flow.hasWindward).toBe(true)
    expect(flow.hasLeeward).toBe(true)
    expect(flow.hasNoBlockage).toBe(true)
    expect(flow.hasNoTurbulence).toBe(false)
    expect(flow.blockageCount).toBe(0)
    expect(flow.turbulenceCount).toBe(1)
  })
})

// ─── Harmony Measurement ────────────────────────────────────────────────────

describe('measureHarmony', () => {
  it('RICH: returns high harmony with tone harmony', () => {
    const harmony = measureHarmony(RICH)
    expect(harmony.level).toBe(95)
    expect(harmony.tone).toBe('harmony')
    expect(harmony.hasHighHarmony).toBe(true)
    expect(harmony.hasResonance).toBe(true)
    expect(harmony.hasSacredGeometry).toBe(true)
    expect(harmony.hasNoDiscord).toBe(true)
    expect(harmony.hasUnity).toBe(true)
    expect(harmony.discordCount).toBe(0)
    expect(harmony.chaosCount).toBe(1)
  })

  it('EMPTY: returns low harmony with tone noise', () => {
    const harmony = measureHarmony(EMPTY)
    expect(harmony.level).toBe(27)
    expect(harmony.tone).toBe('noise')
    expect(harmony.hasHighHarmony).toBe(false)
    expect(harmony.hasNoDiscord).toBe(true)
    expect(harmony.hasNoChaos).toBe(true)
    expect(harmony.discordCount).toBe(0)
    expect(harmony.chaosCount).toBe(0)
  })

  it('MEDIUM: returns mid harmony with tone dissonance', () => {
    const harmony = measureHarmony(MEDIUM)
    expect(harmony.level).toBe(47)
    expect(harmony.tone).toBe('dissonance')
    expect(harmony.hasNoDiscord).toBe(true)
    expect(harmony.hasNoConflict).toBe(false)
    expect(harmony.discordCount).toBe(0)
    expect(harmony.chaosCount).toBe(1)
  })
})

// ─── Alignment Measurement ──────────────────────────────────────────────────

describe('measureAlignment', () => {
  it('RICH: returns high alignment with direction cardinal', () => {
    const alignment = measureAlignment(RICH)
    expect(alignment.level).toBe(97)
    expect(alignment.direction).toBe('cardinal')
    expect(alignment.hasProperAlignment).toBe(true)
    expect(alignment.hasClearPurpose).toBe(true)
    expect(alignment.hasAstronomical).toBe(true)
    expect(alignment.hasNoMisalignment).toBe(true)
    expect(alignment.hasNoDrift).toBe(false)
    expect(alignment.misalignmentCount).toBe(0)
    expect(alignment.driftCount).toBe(1)
  })

  it('EMPTY: returns low alignment with direction lost', () => {
    const alignment = measureAlignment(EMPTY)
    expect(alignment.level).toBe(32)
    expect(alignment.direction).toBe('lost')
    expect(alignment.hasProperAlignment).toBe(false)
    expect(alignment.hasNoMisalignment).toBe(true)
    expect(alignment.hasNoDrift).toBe(true)
    expect(alignment.misalignmentCount).toBe(0)
    expect(alignment.driftCount).toBe(0)
  })

  it('MEDIUM: returns mid alignment with direction lost', () => {
    const alignment = measureAlignment(MEDIUM)
    expect(alignment.level).toBe(52)
    expect(alignment.direction).toBe('lost')
    expect(alignment.hasProperAlignment).toBe(false)
    expect(alignment.hasNoMisalignment).toBe(false)
    expect(alignment.misalignmentCount).toBe(1)
    expect(alignment.driftCount).toBe(0)
  })
})

// ─── Grace Measurement ──────────────────────────────────────────────────────

describe('measureGrace', () => {
  it('RICH: returns high grace with style pagoda', () => {
    const grace = measureGrace(RICH)
    expect(grace.level).toBe(95)
    expect(grace.style).toBe('pagoda')
    expect(grace.hasGracefulStructure).toBe(true)
    expect(grace.hasElegantJoinery).toBe(true)
    expect(grace.hasNoWeakJoints).toBe(true)
    expect(grace.hasNoOverloading).toBe(false)
    expect(grace.hasNoSagging).toBe(false)
    expect(grace.weakJointCount).toBe(0)
    expect(grace.saggingCount).toBe(1)
  })

  it('EMPTY: returns low grace with style ruins', () => {
    const grace = measureGrace(EMPTY)
    expect(grace.level).toBe(30)
    expect(grace.style).toBe('ruins')
    expect(grace.hasGracefulStructure).toBe(false)
    expect(grace.hasNoOverloading).toBe(true)
    expect(grace.hasNoSagging).toBe(true)
    expect(grace.weakJointCount).toBe(0)
    expect(grace.saggingCount).toBe(0)
  })

  it('MEDIUM: returns mid grace with style hut', () => {
    const grace = measureGrace(MEDIUM)
    expect(grace.level).toBe(50)
    expect(grace.style).toBe('hut')
    expect(grace.hasGracefulStructure).toBe(false)
    expect(grace.hasNoWeakJoints).toBe(false)
    expect(grace.weakJointCount).toBe(1)
    expect(grace.saggingCount).toBe(0)
  })
})

// ─── Openness Measurement ───────────────────────────────────────────────────

describe('measureOpenness', () => {
  it('RICH: returns high openness with design arcade', () => {
    const openness = measureOpenness(RICH)
    expect(openness.level).toBe(97)
    expect(openness.design).toBe('arcade')
    expect(openness.hasTransparency).toBe(true)
    expect(openness.hasProperExposure).toBe(true)
    expect(openness.hasNoHiddenChambers).toBe(false)
    expect(openness.hasProperLighting).toBe(true)
    expect(openness.hasNoBlindSpots).toBe(true)
    expect(openness.hiddenChamberCount).toBe(3)
    expect(openness.blindSpotCount).toBe(0)
  })

  it('EMPTY: returns low openness with design walled', () => {
    const openness = measureOpenness(EMPTY)
    expect(openness.level).toBe(37)
    expect(openness.design).toBe('walled')
    expect(openness.hasTransparency).toBe(false)
    expect(openness.hasProperExposure).toBe(false)
    expect(openness.hasNoHiddenChambers).toBe(true)
    expect(openness.hiddenChamberCount).toBe(0)
    expect(openness.blindSpotCount).toBe(0)
  })

  it('MEDIUM: returns mid openness with design walled', () => {
    const openness = measureOpenness(MEDIUM)
    expect(openness.level).toBe(62)
    expect(openness.design).toBe('walled')
    expect(openness.hasProperExposure).toBe(true)
    expect(openness.hasNoHiddenChambers).toBe(true)
    expect(openness.hasNoBlindSpots).toBe(true)
    expect(openness.hiddenChamberCount).toBe(0)
    expect(openness.blindSpotCount).toBe(0)
  })
})

// ─── Clarity Measurement ────────────────────────────────────────────────────

describe('measureClarity', () => {
  it('RICH: returns high clarity with state mediative', () => {
    const clarity = measureClarity(RICH)
    expect(clarity.level).toBe(92)
    expect(clarity.state).toBe('mediative')
    expect(clarity.hasHighClarity).toBe(true)
    expect(clarity.hasProperFocus).toBe(true)
    expect(clarity.hasInnerPeace).toBe(true)
    expect(clarity.hasNoDistraction).toBe(true)
    expect(clarity.hasZen).toBe(false)
    expect(clarity.hasMindfulness).toBe(true)
    expect(clarity.distractionCount).toBe(0)
    expect(clarity.stressCount).toBe(1)
  })

  it('EMPTY: returns low clarity with state obscured', () => {
    const clarity = measureClarity(EMPTY)
    expect(clarity.level).toBe(46)
    expect(clarity.state).toBe('obscured')
    expect(clarity.hasHighClarity).toBe(false)
    expect(clarity.hasNoDistraction).toBe(true)
    expect(clarity.hasInnerPeace).toBe(true)
    expect(clarity.hasNoStress).toBe(true)
    expect(clarity.distractionCount).toBe(0)
    expect(clarity.stressCount).toBe(0)
  })

  it('MEDIUM: returns mid clarity with state obscured', () => {
    const clarity = measureClarity(MEDIUM)
    expect(clarity.level).toBe(51)
    expect(clarity.state).toBe('obscured')
    expect(clarity.hasHighClarity).toBe(false)
    expect(clarity.hasNoDistraction).toBe(false)
    expect(clarity.distractionCount).toBe(1)
    expect(clarity.stressCount).toBe(0)
  })
})

// ─── Chamber Analysis ───────────────────────────────────────────────────────

describe('analyzeTempleChamber', () => {
  it('RICH: returns mountain-shrine chamber', () => {
    const chamber = analyzeTempleChamber(RICH, 'src/app.ts')
    expect(chamber.file).toBe('src/app.ts')
    expect(chamber.windFlow).toBe(100)
    expect(chamber.templeHarmony).toBe(95)
    expect(chamber.energyAlignment).toBe(97)
    expect(chamber.structuralGrace).toBe(95)
    expect(chamber.opennessQuality).toBe(97)
    expect(chamber.spiritualClarity).toBe(92)
    expect(chamber.qualityScore).toBe(96)
    expect(chamber.condition).toBe('mountain-shrine')
  })

  it('EMPTY: returns wayside-shrine chamber', () => {
    const chamber = analyzeTempleChamber(EMPTY, 'empty.ts')
    expect(chamber.windFlow).toBe(37)
    expect(chamber.templeHarmony).toBe(27)
    expect(chamber.energyAlignment).toBe(32)
    expect(chamber.structuralGrace).toBe(30)
    expect(chamber.opennessQuality).toBe(37)
    expect(chamber.spiritualClarity).toBe(46)
    expect(chamber.qualityScore).toBe(35)
    expect(chamber.condition).toBe('wayside-shrine')
  })

  it('MEDIUM: returns forest-sanctuary chamber', () => {
    const chamber = analyzeTempleChamber(MEDIUM, 'src/med.ts')
    expect(chamber.windFlow).toBe(53)
    expect(chamber.templeHarmony).toBe(47)
    expect(chamber.energyAlignment).toBe(52)
    expect(chamber.structuralGrace).toBe(50)
    expect(chamber.opennessQuality).toBe(62)
    expect(chamber.spiritualClarity).toBe(51)
    expect(chamber.qualityScore).toBe(52)
    expect(chamber.condition).toBe('forest-sanctuary')
  })
})

// ─── Condition Classification ───────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies mountain-shrine at 80+', () => {
    const chamber = analyzeTempleChamber(RICH, 'test.ts')
    expect(classifyCondition(chamber)).toBe('mountain-shrine')
  })

  it('classifies rubble below 20', () => {
    const chamber = analyzeTempleChamber(EMPTY, 'test.ts')
    expect(chamber.qualityScore).toBeGreaterThanOrEqual(20)
    expect(chamber.condition).not.toBe('rubble')
  })
})

// ─── Complex Classification ────────────────────────────────────────────────

describe('classifyComplexType', () => {
  it('returns overgrown for empty chambers', () => {
    expect(classifyComplexType([])).toBe('overgrown')
  })

  it('returns grand-temple for high quality chambers', () => {
    const chambers = [analyzeTempleChamber(RICH, 'a.ts')]
    expect(classifyComplexType(chambers)).toBe('grand-temple')
  })
})

describe('classifyComplexCondition', () => {
  it('returns sacred-site for avgQuality >= 80', () => {
    expect(classifyComplexCondition(85)).toBe('sacred-site')
  })
  it('returns pilgrimage for avgQuality >= 65', () => {
    expect(classifyComplexCondition(70)).toBe('pilgrimage')
  })
  it('returns retreat for avgQuality >= 50', () => {
    expect(classifyComplexCondition(55)).toBe('retreat')
  })
  it('returns village-temple for avgQuality >= 35', () => {
    expect(classifyComplexCondition(40)).toBe('village-temple')
  })
  it('returns abandoned for avgQuality >= 20', () => {
    expect(classifyComplexCondition(25)).toBe('abandoned')
  })
  it('returns lost for avgQuality < 20', () => {
    expect(classifyComplexCondition(10)).toBe('lost')
  })
})

// ─── Architect Grade ────────────────────────────────────────────────────────

describe('classifyArchitectGrade', () => {
  it('returns master-architect for >= 80', () => {
    expect(classifyArchitectGrade(85)).toBe('master-architect')
  })
  it('returns temple-architect for >= 65', () => {
    expect(classifyArchitectGrade(70)).toBe('temple-architect')
  })
  it('returns builder for >= 50', () => {
    expect(classifyArchitectGrade(55)).toBe('builder')
  })
  it('returns apprentice for >= 35', () => {
    expect(classifyArchitectGrade(40)).toBe('apprentice')
  })
  it('returns novice for >= 20', () => {
    expect(classifyArchitectGrade(25)).toBe('novice')
  })
  it('returns iconoclast for < 20', () => {
    expect(classifyArchitectGrade(10)).toBe('iconoclast')
  })
})

// ─── Complex Analysis ───────────────────────────────────────────────────────

describe('analyzeTempleComplex', () => {
  it('returns overgrown for empty input', () => {
    const complex = analyzeTempleComplex([], 'empty-dir')
    expect(complex.directory).toBe('empty-dir')
    expect(complex.complexType).toBe('overgrown')
    expect(complex.condition).toBe('lost')
    expect(complex.chambers).toHaveLength(0)
  })

  it('returns grand-temple for rich chambers', () => {
    const chambers = [analyzeTempleChamber(RICH, 'src/a.ts')]
    const complex = analyzeTempleComplex(chambers, 'src')
    expect(complex.complexType).toBe('grand-temple')
    expect(complex.condition).toBe('sacred-site')
    expect(complex.mountainShrineCount).toBe(1)
    expect(complex.goodFlowCount).toBe(1)
  })
})

// ─── Build Result ───────────────────────────────────────────────────────────

describe('buildWindTempleResult', () => {
  it('RICH single file: returns correct full result', () => {
    const result = buildWindTempleResult(['src/app.ts'], [RICH])
    expect(result.chambers).toHaveLength(1)
    expect(result.complexes).toHaveLength(1)
    expect(result.sanctuary.overallHarmony).toBe(96)
    expect(result.sanctuary.isEnlightened).toBe(true)
    expect(result.sanctuary.avgFlow).toBe(100)
    expect(result.sanctuary.avgHarmony).toBe(95)
    expect(result.sanctuary.avgClarity).toBe(92)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalClusters).toBe(1)
    expect(result.stats.avgWindFlow).toBe(100)
    expect(result.stats.avgTempleHarmony).toBe(95)
    expect(result.stats.avgEnergyAlignment).toBe(97)
    expect(result.stats.avgStructuralGrace).toBe(95)
    expect(result.stats.avgOpennessQuality).toBe(97)
    expect(result.stats.avgSpiritualClarity).toBe(92)
    expect(result.stats.mountainShrineCount).toBe(1)
    expect(result.stats.gardenTempleCount).toBe(0)
    expect(result.stats.forestSanctuaryCount).toBe(0)
    expect(result.stats.waysideShrineCount).toBe(0)
    expect(result.stats.abandonedRuinCount).toBe(0)
    expect(result.stats.rubbleCount).toBe(0)
    expect(result.stats.hasGoodFlowCount).toBe(1)
    expect(result.stats.hasHighHarmonyCount).toBe(1)
    expect(result.stats.hasProperAlignmentCount).toBe(1)
    expect(result.stats.hasGracefulStructureCount).toBe(1)
    expect(result.stats.hasTransparencyCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.architectGrade).toBe('master-architect')
    expect(result.stats.bestChamber).toBe('src/app.ts')
    expect(result.stats.bestFlow).toBe('src/app.ts')
    expect(result.stats.mostHarmonious).toBe('src/app.ts')
    expect(result.stats.bestAligned).toBe('src/app.ts')
    expect(result.stats.mostGraceful).toBe('src/app.ts')
    expect(result.stats.clearest).toBe('src/app.ts')
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('EMPTY single file: returns correct result', () => {
    const result = buildWindTempleResult(['empty.ts'], [EMPTY])
    expect(result.chambers).toHaveLength(1)
    expect(result.sanctuary.overallHarmony).toBe(35)
    expect(result.sanctuary.isEnlightened).toBe(false)
    expect(result.sanctuary.avgFlow).toBe(37)
    expect(result.sanctuary.avgHarmony).toBe(27)
    expect(result.sanctuary.avgClarity).toBe(46)
    expect(result.stats.avgWindFlow).toBe(37)
    expect(result.stats.avgTempleHarmony).toBe(27)
    expect(result.stats.avgEnergyAlignment).toBe(32)
    expect(result.stats.avgStructuralGrace).toBe(30)
    expect(result.stats.avgOpennessQuality).toBe(37)
    expect(result.stats.avgSpiritualClarity).toBe(46)
    expect(result.stats.waysideShrineCount).toBe(1)
    expect(result.stats.architectGrade).toBe('apprentice')
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5)
  })

  it('MEDIUM single file: returns correct result', () => {
    const result = buildWindTempleResult(['src/med.ts'], [MEDIUM])
    expect(result.chambers).toHaveLength(1)
    expect(result.sanctuary.overallHarmony).toBe(52)
    expect(result.sanctuary.isEnlightened).toBe(false)
    expect(result.stats.avgWindFlow).toBe(53)
    expect(result.stats.avgTempleHarmony).toBe(47)
    expect(result.stats.avgEnergyAlignment).toBe(52)
    expect(result.stats.avgStructuralGrace).toBe(50)
    expect(result.stats.avgOpennessQuality).toBe(62)
    expect(result.stats.avgSpiritualClarity).toBe(51)
    expect(result.stats.forestSanctuaryCount).toBe(1)
    expect(result.stats.architectGrade).toBe('builder')
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2)
  })

  it('multi-file: groups by directory correctly', () => {
    const result = buildWindTempleResult(
      ['src/app.ts', 'src/utils.ts', 'src/med.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.chambers).toHaveLength(3)
    expect(result.complexes).toHaveLength(1)
    expect(result.complexes[0].complexType).toBe('grand-temple')
    expect(result.complexes[0].condition).toBe('sacred-site')
    expect(result.sanctuary.overallHarmony).toBe(81)
    expect(result.sanctuary.isEnlightened).toBe(true)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.mountainShrineCount).toBe(2)
    expect(result.stats.forestSanctuaryCount).toBe(1)
    expect(result.stats.hasGoodFlowCount).toBe(2)
    expect(result.stats.hasHighHarmonyCount).toBe(2)
    expect(result.stats.hasProperAlignmentCount).toBe(2)
    expect(result.stats.hasGracefulStructureCount).toBe(2)
    expect(result.stats.hasTransparencyCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.architectGrade).toBe('master-architect')
    expect(result.stats.avgWindFlow).toBe(84)
    expect(result.stats.avgTempleHarmony).toBe(79)
    expect(result.stats.avgEnergyAlignment).toBe(82)
    expect(result.stats.avgStructuralGrace).toBe(80)
    expect(result.stats.avgOpennessQuality).toBe(85)
    expect(result.stats.avgSpiritualClarity).toBe(78)
  })

  it('empty input: returns zeroed result', () => {
    const result = buildWindTempleResult([], [])
    expect(result.chambers).toHaveLength(0)
    expect(result.complexes).toHaveLength(0)
    expect(result.sanctuary.overallHarmony).toBe(0)
    expect(result.sanctuary.isEnlightened).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.architectGrade).toBe('iconoclast')
    expect(result.stats.bestChamber).toBe('')
  })
})

// ─── Recommendations ────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for good code', () => {
    const result = buildWindTempleResult(['test.ts'], [RICH])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('returns improvement recs for empty code', () => {
    const result = buildWindTempleResult(['test.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5)
    const hasFlow = result.recommendations.some((r) => r.includes('wind flow'))
    expect(hasFlow).toBe(true)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for >= 80', () => {
    const result = scoreColor(90)
    expect(typeof result).toBe('string')
    expect(result).toContain('90')
  })
  it('returns string for >= 60', () => {
    expect(typeof scoreColor(65)).toBe('string')
  })
  it('returns string for >= 40', () => {
    expect(typeof scoreColor(45)).toBe('string')
  })
  it('returns string for < 40', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns colored strings for all conditions', () => {
    const conditions = ['mountain-shrine', 'garden-temple', 'forest-sanctuary', 'wayside-shrine', 'abandoned-ruin', 'rubble']
    for (const c of conditions) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
  it('returns unknown unchanged', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('returns colored strings for all grades', () => {
    const grades = ['master-architect', 'temple-architect', 'builder', 'apprentice', 'novice', 'iconoclast']
    for (const g of grades) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })
  it('returns unknown unchanged', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

describe('complexTypeColor', () => {
  it('returns colored strings for all types', () => {
    const types = ['grand-temple', 'monastery', 'shrine-complex', 'meditation-garden', 'clearing', 'overgrown']
    for (const t of types) {
      expect(typeof complexTypeColor(t)).toBe('string')
    }
  })
  it('returns unknown unchanged', () => {
    expect(complexTypeColor('unknown')).toBe('unknown')
  })
})

describe('formatWindTempleJson', () => {
  it('returns valid JSON string', () => {
    const result = buildWindTempleResult(['test.ts'], [RICH])
    const json = formatWindTempleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.chambers).toHaveLength(1)
    expect(parsed.sanctuary.overallHarmony).toBe(96)
  })
})

describe('formatWindTempleTable', () => {
  it('returns formatted table string', () => {
    const result = buildWindTempleResult(['test.ts'], [RICH])
    const table = formatWindTempleTable(result, false)
    expect(table).toContain('Wind Temple Analysis')
    expect(table).toContain('Statistics')
    expect(table).toContain('Grades & Highlights')
  })

  it('includes per-chamber breakdown when verbose', () => {
    const result = buildWindTempleResult(['test.ts'], [RICH])
    const table = formatWindTempleTable(result, true)
    expect(table).toContain('Per-Chamber Breakdown')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations', () => {
    const result = buildWindTempleResult(['test.ts'], [EMPTY])
    const table = formatWindTempleTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('includes complexes section when present', () => {
    const result = buildWindTempleResult(['src/a.ts', 'src/b.ts'], [RICH, MEDIUM])
    const table = formatWindTempleTable(result, false)
    expect(table).toContain('Complexes')
    expect(table).toContain('src')
  })

  it('includes sanctuary overview', () => {
    const result = buildWindTempleResult(['test.ts'], [RICH])
    const table = formatWindTempleTable(result, false)
    expect(table).toContain('Sanctuary Overview')
    expect(table).toContain('Overall Harmony')
    expect(table).toContain('Is Enlightened')
  })

  it('shows verbose chamber measures', () => {
    const result = buildWindTempleResult(['test.ts'], [MEDIUM])
    const table = formatWindTempleTable(result, true)
    expect(table).toContain('still')
    expect(table).toContain('dissonance')
    expect(table).toContain('lost')
    expect(table).toContain('hut')
    expect(table).toContain('walled')
    expect(table).toContain('obscured')
  })

  it('handles empty result table', () => {
    const result = buildWindTempleResult([], [])
    const table = formatWindTempleTable(result, false)
    expect(table).toContain('Wind Temple Analysis')
    expect(table).toContain('Statistics')
  })

  it('shows architect grade in table', () => {
    const result = buildWindTempleResult(['test.ts'], [RICH])
    const table = formatWindTempleTable(result, false)
    expect(table).toContain('master-architect')
  })
})
