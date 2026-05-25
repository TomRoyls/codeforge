import { describe, it, expect } from 'vitest'

import {
  measureAlloying,
  measureExploring,
  measureResisting,
  measureOptimizing,
  measureNavigating,
  analyzeTitaniumPlate,
  analyzeTitaniumStation,
  buildTitaniumHorizonResult,
  classifyCondition,
  classifyStationType,
  classifyStationCondition,
  classifyEngineerGrade,
  generateRecommendations,
  type TitaniumPlate,
} from '../src/commands/titanium-horizon-helpers.js'

import {
  colorScore,
  colorCondition,
  colorStationCondition,
  formatPlateTable,
  formatPlatesTable,
  formatStationTable,
  formatStationsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/titanium-horizon-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

const minimalContent = 'const x = 1'

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureAlloying ────────────────────────────────────

describe('measureAlloying', () => {
  it('returns all fields', () => {
    const result = measureAlloying(richContent)
    expect(result).toHaveProperty('strength')
    expect(result).toHaveProperty('alloy')
    expect(result).toHaveProperty('hasHighStrength')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasNoMonolithic')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasNoUnsafe')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasNoDirty')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasVersatile')
    expect(result).toHaveProperty('hasAdaptable')
    expect(result).toHaveProperty('hasMultiPurpose')
    expect(result).toHaveProperty('hasResilient')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureAlloying('var x = 1; eval("y")')
    expect(result.chaoticCount).toBe(2)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects unsafe code (any)', () => {
    const result = measureAlloying('const x: any = 1')
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects dirty code', () => {
    const result = measureAlloying('dirty hacky gross code')
    expect(result.hasNoDirty).toBe(false)
  })

  it('detects well-structured code', () => {
    const result = measureAlloying(richContent)
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects modular code', () => {
    const result = measureAlloying(richContent)
    expect(result.hasModular).toBe(true)
  })

  it('detects type-safe code', () => {
    const result = measureAlloying(richContent)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects robust code', () => {
    const result = measureAlloying(richContent)
    expect(result.hasRobust).toBe(true)
  })

  it('detects versatile code (async)', () => {
    const result = measureAlloying(richContent)
    expect(result.hasVersatile).toBe(true)
  })

  it('classifies alloy correctly', () => {
    const result = measureAlloying(richContent)
    expect(result.alloy).toBeDefined()
  })
})

// ─── measureExploring ───────────────────────────────────

describe('measureExploring', () => {
  it('returns all fields', () => {
    const result = measureExploring(richContent)
    expect(result).toHaveProperty('vision')
    expect(result).toHaveProperty('frontier')
    expect(result).toHaveProperty('hasHighVision')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasExtensible')
    expect(result).toHaveProperty('hasNoRigid')
    expect(result).toHaveProperty('hasForwardLooking')
    expect(result).toHaveProperty('hasScalable')
    expect(result).toHaveProperty('hasFutureProof')
    expect(result).toHaveProperty('hasAbstracted')
    expect(result).toHaveProperty('hasGeneralized')
    expect(result).toHaveProperty('hasPluggable')
    expect(result).toHaveProperty('hasConfigurable')
    expect(result).toHaveProperty('hasDecoupled')
    expect(result).toHaveProperty('hasParametric')
    expect(result).toHaveProperty('hasEvolutionary')
    expect(result).toHaveProperty('hasOpen')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('rigidCount')
  })

  it('detects hacked patterns', () => {
    const result = measureExploring('hack: workaround using monkey patch')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects well-architected code', () => {
    const result = measureExploring(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects forward-looking code (async)', () => {
    const result = measureExploring(richContent)
    expect(result.hasForwardLooking).toBe(true)
  })

  it('detects abstracted code (interface)', () => {
    const result = measureExploring(richContent)
    expect(result.hasAbstracted).toBe(true)
  })

  it('detects evolutionary code (documentation)', () => {
    const result = measureExploring(richContent)
    expect(result.hasEvolutionary).toBe(true)
  })

  it('detects open code (no any)', () => {
    const result = measureExploring(richContent)
    expect(result.hasOpen).toBe(true)
  })

  it('classifies frontier correctly', () => {
    const result = measureExploring(richContent)
    expect(result.frontier).toBeDefined()
  })
})

// ─── measureResisting ───────────────────────────────────

describe('measureResisting', () => {
  it('returns all fields', () => {
    const result = measureResisting(richContent)
    expect(result).toHaveProperty('resistance')
    expect(result).toHaveProperty('shield')
    expect(result).toHaveProperty('hasHighResistance')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasNoVolatile')
    expect(result).toHaveProperty('hasConsistent')
    expect(result).toHaveProperty('hasNoErratic')
    expect(result).toHaveProperty('hasMaintained')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasDurable')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasReinforced')
    expect(result).toHaveProperty('hasFortified')
    expect(result).toHaveProperty('hasImpervious')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('volatileCount')
  })

  it('detects error handling', () => {
    const result = measureResisting(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measureResisting('const x: any = 1')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects volatile patterns (var)', () => {
    const result = measureResisting('var x = 1; var y = 2')
    expect(result.volatileCount).toBe(2)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects vulnerable patterns', () => {
    const result = measureResisting('vulnerable code with exploit')
    expect(result.hasReinforced).toBe(false)
  })

  it('detects stable code', () => {
    const result = measureResisting(richContent)
    expect(result.hasStable).toBe(true)
  })

  it('classifies shield correctly', () => {
    const result = measureResisting(richContent)
    expect(result.shield).toBeDefined()
  })
})

// ─── measureOptimizing ──────────────────────────────────

describe('measureOptimizing', () => {
  it('returns all fields', () => {
    const result = measureOptimizing(richContent)
    expect(result).toHaveProperty('efficiency')
    expect(result).toHaveProperty('ratio')
    expect(result).toHaveProperty('hasHighEfficiency')
    expect(result).toHaveProperty('hasEfficient')
    expect(result).toHaveProperty('hasNoWasteful')
    expect(result).toHaveProperty('hasLean')
    expect(result).toHaveProperty('hasNoBloated')
    expect(result).toHaveProperty('hasFocused')
    expect(result).toHaveProperty('hasNoScattered')
    expect(result).toHaveProperty('hasPrecise')
    expect(result).toHaveProperty('hasNoApproximate')
    expect(result).toHaveProperty('hasOptimized')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasMinimal')
    expect(result).toHaveProperty('hasEssential')
    expect(result).toHaveProperty('hasStreamlined')
    expect(result).toHaveProperty('hasTrimmed')
    expect(result).toHaveProperty('hasNoRedundant')
    expect(result).toHaveProperty('wastefulCount')
    expect(result).toHaveProperty('bloatedCount')
  })

  it('detects wasteful patterns', () => {
    const result = measureOptimizing('hack: workaround for bypass')
    expect(result.wastefulCount).toBeGreaterThan(0)
    expect(result.hasNoWasteful).toBe(false)
  })

  it('detects bloated patterns (global, window)', () => {
    const result = measureOptimizing('global.x = 1; window.y = 2; document.z = 3')
    expect(result.bloatedCount).toBe(3)
    expect(result.hasNoBloated).toBe(false)
  })

  it('detects approximate patterns', () => {
    const result = measureOptimizing('approximate rough around code')
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects lean code (no any)', () => {
    const result = measureOptimizing(richContent)
    expect(result.hasLean).toBe(true)
  })

  it('detects precise code', () => {
    const result = measureOptimizing(richContent)
    expect(result.hasPrecise).toBe(true)
  })

  it('classifies ratio correctly', () => {
    const result = measureOptimizing(richContent)
    expect(result.ratio).toBeDefined()
  })
})

// ─── measureNavigating ──────────────────────────────────

describe('measureNavigating', () => {
  it('returns all fields', () => {
    const result = measureNavigating(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('navigation')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasContextual')
    expect(result).toHaveProperty('hasVisionary')
    expect(result).toHaveProperty('hasHolistic')
    expect(result).toHaveProperty('hasSystemic')
    expect(result).toHaveProperty('hasConnected')
    expect(result).toHaveProperty('hasEvolved')
    expect(result).toHaveProperty('hasWisdom')
    expect(result).toHaveProperty('hasAccumulated')
    expect(result).toHaveProperty('shallowCount')
    expect(result).toHaveProperty('naiveCount')
  })

  it('detects well-architected code', () => {
    const result = measureNavigating(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects deep code (interface, type)', () => {
    const result = measureNavigating(richContent)
    expect(result.hasDeep).toBe(true)
  })

  it('detects insightful code (documentation)', () => {
    const result = measureNavigating(richContent)
    expect(result.hasInsightful).toBe(true)
  })

  it('detects shallow patterns', () => {
    const result = measureNavigating('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('classifies navigation correctly', () => {
    const result = measureNavigating(richContent)
    expect(result.navigation).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns titanium-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('titanium-masterpiece')
    expect(classifyCondition(100)).toBe('titanium-masterpiece')
  })
  it('returns space-grade for 75-89', () => {
    expect(classifyCondition(75)).toBe('space-grade')
  })
  it('returns proper-alloy for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-alloy')
  })
  it('returns base-metal for 40-59', () => {
    expect(classifyCondition(40)).toBe('base-metal')
  })
  it('returns raw-ore for 20-39', () => {
    expect(classifyCondition(20)).toBe('raw-ore')
  })
  it('returns void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifyStationType', () => {
  it('returns no-station for empty', () => {
    expect(classifyStationType([])).toBe('no-station')
  })
  it('returns orbital-station for high avg', () => {
    const plates = [{ qualityScore: 90 }, { qualityScore: 90 }].map((p) => ({ ...p } as TitaniumPlate))
    expect(classifyStationType(plates)).toBe('orbital-station')
  })
  it('returns tent-camp for low avg', () => {
    const plates = [{ qualityScore: 10 }].map((p) => ({ ...p } as TitaniumPlate))
    expect(classifyStationType(plates)).toBe('tent-camp')
  })
})

describe('classifyStationCondition', () => {
  it('returns starship-hull for 85+', () => {
    expect(classifyStationCondition(85)).toBe('starship-hull')
  })
  it('returns void for 0-14', () => {
    expect(classifyStationCondition(0)).toBe('void')
  })
})

describe('classifyEngineerGrade', () => {
  it('returns rocket-scientist for 80+', () => {
    expect(classifyEngineerGrade(80)).toBe('rocket-scientist')
  })
  it('returns tinkerer for 0-19', () => {
    expect(classifyEngineerGrade(0)).toBe('tinkerer')
  })
  it('returns aerospace-engineer for 65-79', () => {
    expect(classifyEngineerGrade(65)).toBe('aerospace-engineer')
  })
  it('returns metallurgist for 50-64', () => {
    expect(classifyEngineerGrade(50)).toBe('metallurgist')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyEngineerGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyEngineerGrade(20)).toBe('novice')
  })
})

// ─── analyzeTitaniumPlate ───────────────────────────────

describe('analyzeTitaniumPlate', () => {
  it('returns a complete plate', () => {
    const plate = analyzeTitaniumPlate(richContent, 'app.ts')
    expect(plate.file).toBe('app.ts')
    expect(plate.alloyStrength).toBeGreaterThanOrEqual(0)
    expect(plate.frontierVision).toBeGreaterThanOrEqual(0)
    expect(plate.corrosionResistance).toBeGreaterThanOrEqual(0)
    expect(plate.weightEfficiency).toBeGreaterThanOrEqual(0)
    expect(plate.spaceWisdom).toBeGreaterThanOrEqual(0)
    expect(plate.qualityScore).toBeGreaterThanOrEqual(0)
    expect(plate.condition).toBeDefined()
    expect(plate.alloying).toBeDefined()
    expect(plate.exploring).toBeDefined()
    expect(plate.resisting).toBeDefined()
    expect(plate.optimizing).toBeDefined()
    expect(plate.navigating).toBeDefined()
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const plate = analyzeTitaniumPlate(richContent, 'test.ts')
    const expected = Math.round(
      plate.alloyStrength * 0.2 +
      plate.frontierVision * 0.2 +
      plate.corrosionResistance * 0.2 +
      plate.weightEfficiency * 0.2 +
      plate.spaceWisdom * 0.2,
    )
    expect(plate.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const plate = analyzeTitaniumPlate(emptyContent, 'empty.ts')
    expect(plate.qualityScore).toBeLessThan(40)
  })
})

// ─── analyzeTitaniumStation ─────────────────────────────

describe('analyzeTitaniumStation', () => {
  it('returns empty station for no plates', () => {
    const station = analyzeTitaniumStation([], 'src')
    expect(station.directory).toBe('src')
    expect(station.plates).toHaveLength(0)
    expect(station.avgStrength).toBe(0)
    expect(station.stationType).toBe('no-station')
    expect(station.condition).toBe('void')
  })

  it('computes averages from plates', () => {
    const plate = analyzeTitaniumPlate(richContent, 'app.ts')
    const station = analyzeTitaniumStation([plate], 'src')
    expect(station.avgStrength).toBe(plate.alloyStrength)
    expect(station.avgVision).toBe(plate.frontierVision)
    expect(station.avgWisdom).toBe(plate.spaceWisdom)
  })
})

// ─── buildTitaniumHorizonResult ─────────────────────────

describe('buildTitaniumHorizonResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildTitaniumHorizonResult([], [])
    expect(result.plates).toHaveLength(0)
    expect(result.stations).toHaveLength(0)
    expect(result.mission.isTitanium).toBe(false)
    expect(result.stats.engineerGrade).toBe('tinkerer')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildTitaniumHorizonResult(['app.ts'], [richContent])
    expect(result.plates).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into stations by directory', async () => {
    const result = await buildTitaniumHorizonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.stations).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    expect(result.stats.avgAlloyStrength).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFrontierVision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgCorrosionResistance).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgWeightEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSpaceWisdom).toBeGreaterThanOrEqual(0)
    expect(result.stats.titaniumMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.spaceGradeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properAlloyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.baseMetalCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.rawOreCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestPlate).toBe('string')
    expect(typeof result.stats.strongest).toBe('string')
    expect(typeof result.stats.mostVisionary).toBe('string')
    expect(typeof result.stats.mostResistant).toBe('string')
    expect(typeof result.stats.mostEfficient).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('sets bestPlate to highest qualityScore file', async () => {
    const result = await buildTitaniumHorizonResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestPlate).toBe('rich.ts')
  })

  it('sets strongest to highest alloyStrength file', async () => {
    const result = await buildTitaniumHorizonResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.strongest).toBe('rich.ts')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    const plate = result.plates[0]
    expect(plate.alloyStrength).toBe(100)
    expect(plate.frontierVision).toBe(100)
    expect(plate.corrosionResistance).toBe(100)
    expect(plate.weightEfficiency).toBe(100)
    expect(plate.spaceWisdom).toBe(100)
    expect(plate.qualityScore).toBe(100)
  })

  it('sets mission.isTitanium when overallAdvancement >= 60', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    expect(result.mission.isTitanium).toBe(true)
  })

  it('files in root map to . station', async () => {
    const result = await buildTitaniumHorizonResult(['app.ts'], [richContent])
    expect(result.stations[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all >= 90', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends alloy strengthening when low', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('alloy'))
    expect(hasRec).toBe(true)
  })

  it('returns default when scores are good', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('titanium-masterpiece')).toBe('string')
    expect(typeof colorCondition('space-grade')).toBe('string')
    expect(typeof colorCondition('proper-alloy')).toBe('string')
    expect(typeof colorCondition('base-metal')).toBe('string')
    expect(typeof colorCondition('raw-ore')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorStationCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorStationCondition('starship-hull')).toBe('string')
    expect(typeof colorStationCondition('space-station')).toBe('string')
    expect(typeof colorStationCondition('proper-habitat')).toBe('string')
    expect(typeof colorStationCondition('metal-shed')).toBe('string')
    expect(typeof colorStationCondition('dirt-floor')).toBe('string')
    expect(typeof colorStationCondition('void')).toBe('string')
    expect(typeof colorStationCondition('unknown')).toBe('string')
  })
})

describe('formatPlateTable', () => {
  it('formats a plate', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    const output = formatPlateTable(result.plates[0])
    expect(output).toContain('Titanium Plate')
    expect(output).toContain('a.ts')
    expect(output).toContain('Alloy Strength')
  })
})

describe('formatPlatesTable', () => {
  it('returns no plates message for empty', () => {
    expect(formatPlatesTable([])).toContain('No titanium plates')
  })
  it('formats plates', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    expect(formatPlatesTable(result.plates)).toContain('Titanium Plates')
  })
})

describe('formatStationTable', () => {
  it('formats a station', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    const output = formatStationTable(result.stations[0])
    expect(output).toContain('Titanium Station')
    expect(output).toContain('Plates')
  })
})

describe('formatStationsTable', () => {
  it('returns no stations message for empty', () => {
    expect(formatStationsTable([])).toContain('No titanium stations')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Titanium Horizon Statistics')
    expect(output).toContain('Engineer Grade')
    expect(output).toContain('Best Plate')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['A', 'B'])).toContain('Recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Titanium Horizon Analysis')
    expect(output).toContain('Mission Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildTitaniumHorizonResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.plates).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
