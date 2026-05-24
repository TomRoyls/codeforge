import { describe, it, expect } from 'vitest'
import {
  measureConducting,
  measureGrounding,
  measureSparking,
  measureProtecting,
  measureStabilizing,
  analyzeElectricalRod,
  classifyRodCondition,
  classifyGridType,
  classifyEngineerGrade,
  classifyGridCondition,
  generateRecommendations,
  analyzePowerGrid,
  buildLightningRodResult,
  type ElectricalRod,
  type ConductingMeasure,
  type GroundingMeasure,
  type SparkingMeasure,
  type ProtectingMeasure,
  type StabilizingMeasure,
} from '../src/commands/lightning-rod-helpers.js'
import {
  colorScore,
  colorGrade,
  formatRodTable,
  formatRodsTable,
  formatGridTable,
  formatGridsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/lightning-rod-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const RICH = `import { promisify } from 'util'
import type { Config } from './config.js'

/** Documentation */
export interface DataProcessor<T> {
  process(item: T): Promise<string>
}

export class MainProcessor implements DataProcessor<Config> {
  private readonly items: readonly string[] = []

  async process(item: Config): Promise<string> {
    try {
      const result = item?.value ?? 'default'
      if (result === item.name) {
        return result
      }
      return await promisify((cb: (err: Error | null, val?: string) => void) => {
        cb(null, item.name)
      })()
    } catch (error: unknown) {
      return ''
    }
  }
}

export const helper = (input?: string): string => {
  return input ?? ''
}

export type Result = { readonly value: string; readonly label: string }
`

const MINIMAL = 'const x = 1'

const MODERATE = `export interface Item {
  name: string
}

export function process(item: Item): string {
  return item.name
}

const result = process({ name: 'test' })`

const POOR = `var x: any = 1
var y: any = 2
function bad(a: any): any {
  return a
}`

// ─── Measure Tests ─────────────────────────────────────────────────

describe('measureConducting', () => {
  it('returns superconductor for rich content', () => {
    const m = measureConducting(RICH)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('superconductor')
    expect(m.hasHighQuality).toBe(true)
  })

  it('returns insulator for minimal content', () => {
    const m = measureConducting(MINIMAL)
    expect(m.quality).toBe(10)
    expect(m.grade).toBe('insulator')
    expect(m.hasHighQuality).toBe(false)
  })

  it('returns proper-conductor for moderate content', () => {
    const m = measureConducting(MODERATE)
    expect(m.quality).toBe(61)
    expect(m.grade).toBe('proper-conductor')
  })

  it('returns insulator for poor content', () => {
    const m = measureConducting(POOR)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('insulator')
  })

  it('detects efficient flow (export + import)', () => {
    const m = measureConducting(RICH)
    expect(m.hasEfficient).toBe(true)
  })

  it('detects flowing data (returnType + const)', () => {
    const m = measureConducting(RICH)
    expect(m.hasFlowing).toBe(true)
  })

  it('detects conductive channels (generics + async)', () => {
    const m = measureConducting(RICH)
    expect(m.hasConductive).toBe(true)
  })

  it('detects smooth flow (optionalChaining + nullishCoalescing)', () => {
    const m = measureConducting(RICH)
    expect(m.hasSmooth).toBe(true)
  })

  it('detects rapid flow (namedExport + returnType)', () => {
    const m = measureConducting(RICH)
    expect(m.hasRapid).toBe(true)
  })

  it('detects optimal flow (export + const)', () => {
    const m = measureConducting(RICH)
    expect(m.hasOptimal).toBe(true)
  })

  it('counts blockages (var)', () => {
    const m = measureConducting(POOR)
    expect(m.blockageCount).toBe(2)
    expect(m.hasNoBlockage).toBe(false)
  })

  it('counts resistance (any)', () => {
    const m = measureConducting(POOR)
    expect(m.resistanceCount).toBe(4)
    expect(m.hasNoResistance).toBe(false)
  })

  it('no blockage or resistance in clean code', () => {
    const m = measureConducting(RICH)
    expect(m.hasNoBlockage).toBe(true)
    expect(m.hasNoResistance).toBe(true)
    expect(m.hasNoBottleneck).toBe(true)
    expect(m.hasNoSluggish).toBe(true)
  })

  it('minimal has no combos', () => {
    const m = measureConducting(MINIMAL)
    expect(m.hasEfficient).toBe(false)
    expect(m.hasFlowing).toBe(false)
    expect(m.hasConductive).toBe(false)
    expect(m.hasSmooth).toBe(false)
    expect(m.hasRapid).toBe(false)
    expect(m.hasOptimal).toBe(false)
  })
})

describe('measureGrounding', () => {
  it('returns deep-ground for rich content', () => {
    const m = measureGrounding(RICH)
    expect(m.groundedness).toBe(100)
    expect(m.system).toBe('deep-ground')
    expect(m.hasHighGroundedness).toBe(true)
  })

  it('returns no-ground for minimal content', () => {
    const m = measureGrounding(MINIMAL)
    expect(m.groundedness).toBe(8)
    expect(m.system).toBe('no-ground')
  })

  it('returns floating-ground for moderate content', () => {
    const m = measureGrounding(MODERATE)
    expect(m.groundedness).toBe(39)
    expect(m.system).toBe('floating-ground')
  })

  it('returns no-ground for poor content', () => {
    const m = measureGrounding(POOR)
    expect(m.groundedness).toBe(0)
    expect(m.system).toBe('no-ground')
  })

  it('detects stable foundation (interface + readonly)', () => {
    const m = measureGrounding(RICH)
    expect(m.hasStable).toBe(true)
  })

  it('detects firm base (generics + typeAlias)', () => {
    const m = measureGrounding(RICH)
    expect(m.hasFirm).toBe(true)
  })

  it('detects secure foundation (private + readonly)', () => {
    const m = measureGrounding(RICH)
    expect(m.hasSecure).toBe(true)
  })

  it('detects anchored (export + docComments)', () => {
    const m = measureGrounding(RICH)
    expect(m.hasAnchored).toBe(true)
  })

  it('detects rooted (strictEq + const)', () => {
    const m = measureGrounding(RICH)
    expect(m.hasRooted).toBe(true)
  })

  it('detects fixed (returnType + interface)', () => {
    const m = measureGrounding(RICH)
    expect(m.hasFixed).toBe(true)
  })

  it('counts wobbly (var) and floating (any)', () => {
    const m = measureGrounding(POOR)
    expect(m.wobblyCount).toBe(2)
    expect(m.floatingCount).toBe(4)
    expect(m.hasNoWobbly).toBe(false)
    expect(m.hasNoFloating).toBe(false)
  })

  it('clean code has no wobbly or floating', () => {
    const m = measureGrounding(RICH)
    expect(m.hasNoWobbly).toBe(true)
    expect(m.hasNoFloating).toBe(true)
    expect(m.hasNoDrifting).toBe(true)
    expect(m.hasNoUnstable).toBe(true)
  })
})

describe('measureSparking', () => {
  it('returns lightning-strike for rich content', () => {
    const m = measureSparking(RICH)
    expect(m.quality).toBe(100)
    expect(m.spark).toBe('lightning-strike')
    expect(m.hasHighQuality).toBe(true)
  })

  it('returns dead-circuit for minimal content', () => {
    const m = measureSparking(MINIMAL)
    expect(m.quality).toBe(0)
    expect(m.spark).toBe('dead-circuit')
  })

  it('returns dead-circuit for moderate content', () => {
    const m = measureSparking(MODERATE)
    expect(m.quality).toBe(18)
    expect(m.spark).toBe('dead-circuit')
  })

  it('returns dead-circuit for poor content', () => {
    const m = measureSparking(POOR)
    expect(m.quality).toBe(0)
    expect(m.spark).toBe('dead-circuit')
  })

  it('detects innovative (generics + typeAlias)', () => {
    const m = measureSparking(RICH)
    expect(m.hasInnovative).toBe(true)
  })

  it('detects creative (optionalChaining + nullishCoalescing)', () => {
    const m = measureSparking(RICH)
    expect(m.hasCreative).toBe(true)
  })

  it('detects fresh (import + export)', () => {
    const m = measureSparking(RICH)
    expect(m.hasFresh).toBe(true)
  })

  it('detects clever (interface + class)', () => {
    const m = measureSparking(RICH)
    expect(m.hasClever).toBe(true)
  })

  it('detects brilliant (async + docComments)', () => {
    const m = measureSparking(RICH)
    expect(m.hasBrilliant).toBe(true)
  })

  it('detects original (generics + class)', () => {
    const m = measureSparking(RICH)
    expect(m.hasOriginal).toBe(true)
  })

  it('counts stale (var) and derivative (any)', () => {
    const m = measureSparking(POOR)
    expect(m.staleCount).toBe(2)
    expect(m.derivativeCount).toBe(4)
    expect(m.hasNoStale).toBe(false)
    expect(m.hasNoDerivative).toBe(false)
  })

  it('clean code has no stale or derivative', () => {
    const m = measureSparking(RICH)
    expect(m.hasNoStale).toBe(true)
    expect(m.hasNoDerivative).toBe(true)
    expect(m.hasNoDull).toBe(true)
    expect(m.hasNoDim).toBe(true)
  })
})

describe('measureProtecting', () => {
  it('returns faraday-cage for rich content', () => {
    const m = measureProtecting(RICH)
    expect(m.protection).toBe(100)
    expect(m.shield).toBe('faraday-cage')
    expect(m.hasHighProtection).toBe(true)
  })

  it('returns no-protection for minimal content', () => {
    const m = measureProtecting(MINIMAL)
    expect(m.protection).toBe(10)
    expect(m.shield).toBe('no-protection')
  })

  it('returns fuse for moderate content', () => {
    const m = measureProtecting(MODERATE)
    expect(m.protection).toBe(41)
    expect(m.shield).toBe('fuse')
  })

  it('returns no-protection for poor content', () => {
    const m = measureProtecting(POOR)
    expect(m.protection).toBe(0)
    expect(m.shield).toBe('no-protection')
  })

  it('detects safe (tryCatch + async)', () => {
    const m = measureProtecting(RICH)
    expect(m.hasSafe).toBe(true)
  })

  it('detects guarded (optionalChaining + nullishCoalescing)', () => {
    const m = measureProtecting(RICH)
    expect(m.hasGuarded).toBe(true)
  })

  it('detects protected (strictEq + const)', () => {
    const m = measureProtecting(RICH)
    expect(m.hasProtected).toBe(true)
  })

  it('detects shielded (interface + readonly)', () => {
    const m = measureProtecting(RICH)
    expect(m.hasShielded).toBe(true)
  })

  it('detects resilient (returnType + tryCatch)', () => {
    const m = measureProtecting(RICH)
    expect(m.hasResilient).toBe(true)
  })

  it('detects defended (export + const)', () => {
    const m = measureProtecting(RICH)
    expect(m.hasDefended).toBe(true)
  })

  it('counts vulnerable (var) and exposed (any)', () => {
    const m = measureProtecting(POOR)
    expect(m.vulnerableCount).toBe(2)
    expect(m.exposedCount).toBe(4)
    expect(m.hasNoVulnerable).toBe(false)
    expect(m.hasNoExposed).toBe(false)
  })

  it('clean code has no vulnerable or exposed', () => {
    const m = measureProtecting(RICH)
    expect(m.hasNoVulnerable).toBe(true)
    expect(m.hasNoExposed).toBe(true)
    expect(m.hasNoUnguarded).toBe(true)
    expect(m.hasNoFragile).toBe(true)
  })
})

describe('measureStabilizing', () => {
  it('returns rock-steady for rich content', () => {
    const m = measureStabilizing(RICH)
    expect(m.stability).toBe(100)
    expect(m.voltage).toBe('rock-steady')
    expect(m.hasHighStability).toBe(true)
  })

  it('returns brownout for minimal content', () => {
    const m = measureStabilizing(MINIMAL)
    expect(m.stability).toBe(18)
    expect(m.voltage).toBe('brownout')
  })

  it('returns regulated for moderate content', () => {
    const m = measureStabilizing(MODERATE)
    expect(m.stability).toBe(75)
    expect(m.voltage).toBe('regulated')
  })

  it('returns brownout for poor content', () => {
    const m = measureStabilizing(POOR)
    expect(m.stability).toBe(8)
    expect(m.voltage).toBe('brownout')
  })

  it('detects consistent (export + const)', () => {
    const m = measureStabilizing(RICH)
    expect(m.hasConsistent).toBe(true)
  })

  it('detects steady (returnType + strictEq)', () => {
    const m = measureStabilizing(RICH)
    expect(m.hasSteady).toBe(true)
  })

  it('detects reliable (interface + typeAlias)', () => {
    const m = measureStabilizing(RICH)
    expect(m.hasReliable).toBe(true)
  })

  it('detects uniform (namedExport + typeAnnotation)', () => {
    const m = measureStabilizing(RICH)
    expect(m.hasUniform).toBe(true)
  })

  it('detects even (readonly + defaultParam)', () => {
    const m = measureStabilizing(RICH)
    expect(m.hasEven).toBe(true)
  })

  it('detects predictable (export + returnType)', () => {
    const m = measureStabilizing(RICH)
    expect(m.hasPredictable).toBe(true)
  })

  it('counts fluctuation (var) and spiking (any)', () => {
    const m = measureStabilizing(POOR)
    expect(m.fluctuationCount).toBe(2)
    expect(m.spikingCount).toBe(4)
    expect(m.hasNoFluctuation).toBe(false)
    expect(m.hasNoSpiking).toBe(false)
  })

  it('clean code has no fluctuation or spiking', () => {
    const m = measureStabilizing(RICH)
    expect(m.hasNoFluctuation).toBe(true)
    expect(m.hasNoSpiking).toBe(true)
    expect(m.hasNoDropping).toBe(true)
    expect(m.hasNoIrregular).toBe(true)
  })

  it('moderate has consistent, uniform, predictable', () => {
    const m = measureStabilizing(MODERATE)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasUniform).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasSteady).toBe(false)
    expect(m.hasReliable).toBe(false)
    expect(m.hasEven).toBe(false)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyRodCondition', () => {
  it('returns power-plant for 85+', () => expect(classifyRodCondition(85)).toBe('power-plant'))
  it('returns power-plant for 100', () => expect(classifyRodCondition(100)).toBe('power-plant'))
  it('returns power-station for 70-84', () => expect(classifyRodCondition(70)).toBe('power-station'))
  it('returns transformer for 55-69', () => expect(classifyRodCondition(55)).toBe('transformer'))
  it('returns junction-box for 40-54', () => expect(classifyRodCondition(40)).toBe('junction-box'))
  it('returns extension-cord for 25-39', () => expect(classifyRodCondition(25)).toBe('extension-cord'))
  it('returns dead-wire for < 25', () => expect(classifyRodCondition(24)).toBe('dead-wire'))
  it('returns dead-wire for 0', () => expect(classifyRodCondition(0)).toBe('dead-wire'))
})

describe('classifyEngineerGrade', () => {
  it('returns chief-engineer for 80+', () => expect(classifyEngineerGrade(80)).toBe('chief-engineer'))
  it('returns senior-electrician for 65-79', () => expect(classifyEngineerGrade(65)).toBe('senior-electrician'))
  it('returns journeyman for 50-64', () => expect(classifyEngineerGrade(50)).toBe('journeyman'))
  it('returns apprentice for 35-49', () => expect(classifyEngineerGrade(35)).toBe('apprentice'))
  it('returns hobbyist for 20-34', () => expect(classifyEngineerGrade(20)).toBe('hobbyist'))
  it('returns short-circuit for < 20', () => expect(classifyEngineerGrade(19)).toBe('short-circuit'))
})

describe('classifyGridCondition', () => {
  it('returns ultra-reliable for 75+', () => expect(classifyGridCondition(75)).toBe('ultra-reliable'))
  it('returns reliable for 60-74', () => expect(classifyGridCondition(60)).toBe('reliable'))
  it('returns adequate for 45-59', () => expect(classifyGridCondition(45)).toBe('adequate'))
  it('returns unreliable for 30-44', () => expect(classifyGridCondition(30)).toBe('unreliable'))
  it('returns dangerous for 15-29', () => expect(classifyGridCondition(15)).toBe('dangerous'))
  it('returns offline for < 15', () => expect(classifyGridCondition(14)).toBe('offline'))
})

describe('classifyGridType', () => {
  it('returns no-grid for empty rods', () => {
    expect(classifyGridType([])).toBe('no-grid')
  })
})

// ─── analyzeElectricalRod Tests ────────────────────────────────────

describe('analyzeElectricalRod', () => {
  it('returns power-plant for rich content', () => {
    const rod = analyzeElectricalRod(RICH, 'rich.ts')
    expect(rod.file).toBe('rich.ts')
    expect(rod.qualityScore).toBe(100)
    expect(rod.condition).toBe('power-plant')
    expect(rod.conductionQuality).toBe(100)
    expect(rod.groundedness).toBe(100)
    expect(rod.sparkQuality).toBe(100)
    expect(rod.surgeProtection).toBe(100)
    expect(rod.voltageStability).toBe(100)
  })

  it('returns dead-wire for minimal content', () => {
    const rod = analyzeElectricalRod(MINIMAL, 'minimal.ts')
    expect(rod.qualityScore).toBe(9)
    expect(rod.condition).toBe('dead-wire')
    expect(rod.conductionQuality).toBe(10)
    expect(rod.groundedness).toBe(8)
    expect(rod.sparkQuality).toBe(0)
    expect(rod.surgeProtection).toBe(10)
    expect(rod.voltageStability).toBe(18)
  })

  it('returns junction-box for moderate content', () => {
    const rod = analyzeElectricalRod(MODERATE, 'moderate.ts')
    expect(rod.qualityScore).toBe(47)
    expect(rod.condition).toBe('junction-box')
    expect(rod.conductionQuality).toBe(61)
    expect(rod.groundedness).toBe(39)
    expect(rod.sparkQuality).toBe(18)
    expect(rod.surgeProtection).toBe(41)
    expect(rod.voltageStability).toBe(75)
  })

  it('returns dead-wire for poor content', () => {
    const rod = analyzeElectricalRod(POOR, 'poor.ts')
    expect(rod.qualityScore).toBe(2)
    expect(rod.condition).toBe('dead-wire')
    expect(rod.conductionQuality).toBe(0)
    expect(rod.groundedness).toBe(0)
    expect(rod.sparkQuality).toBe(0)
    expect(rod.surgeProtection).toBe(0)
    expect(rod.voltageStability).toBe(8)
  })

  it('contains all measure objects', () => {
    const rod = analyzeElectricalRod(RICH, 'test.ts')
    expect(rod.conducting).toBeDefined()
    expect(rod.grounding).toBeDefined()
    expect(rod.sparking).toBeDefined()
    expect(rod.protecting).toBeDefined()
    expect(rod.stabilizing).toBeDefined()
  })
})

// ─── analyzePowerGrid Tests ────────────────────────────────────────

describe('analyzePowerGrid', () => {
  it('returns empty grid for no rods', () => {
    const grid = analyzePowerGrid([], 'empty')
    expect(grid.directory).toBe('empty')
    expect(grid.rods).toHaveLength(0)
    expect(grid.avgConduction).toBe(0)
    expect(grid.gridType).toBe('no-grid')
    expect(grid.condition).toBe('offline')
  })

  it('computes grid averages correctly', () => {
    const rod1 = analyzeElectricalRod(RICH, 'a.ts')
    const rod2 = analyzeElectricalRod(MINIMAL, 'b.ts')
    const grid = analyzePowerGrid([rod1, rod2], 'test')
    expect(grid.avgConduction).toBe(55)
    expect(grid.powerPlantCount).toBe(1)
    expect(grid.deadWireCount).toBe(1)
  })
})

// ─── buildLightningRodResult Tests ─────────────────────────────────

describe('buildLightningRodResult', () => {
  it('computes full result correctly for 4-file mix', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )

    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.totalGrids).toBe(1)
    expect(result.stats.avgConductionQuality).toBe(43)
    expect(result.stats.avgGroundedness).toBe(37)
    expect(result.stats.avgSparkQuality).toBe(30)
    expect(result.stats.avgSurgeProtection).toBe(38)
    expect(result.stats.avgVoltageStability).toBe(50)
    expect(result.stats.overallPower).toBe(43)
    expect(result.stats.engineerGrade).toBe('apprentice')
    expect(result.network.isPowered).toBe(false)
    expect(result.network.overallPower).toBe(43)
  })

  it('computes condition counts correctly', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.powerPlantCount).toBe(1)
    expect(result.stats.powerStationCount).toBe(0)
    expect(result.stats.transformerCount).toBe(0)
    expect(result.stats.junctionBoxCount).toBe(1)
    expect(result.stats.extensionCordCount).toBe(0)
    expect(result.stats.deadWireCount).toBe(2)
  })

  it('computes high boolean counts correctly', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighGroundednessCount).toBe(1)
    expect(result.stats.hasHighSparkCount).toBe(1)
    expect(result.stats.hasHighProtectionCount).toBe(1)
    expect(result.stats.hasHighStabilityCount).toBe(2)
  })

  it('identifies best files correctly', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.bestRod).toBe('rich.ts')
    expect(result.stats.bestConductor).toBe('rich.ts')
    expect(result.stats.mostGrounded).toBe('rich.ts')
    expect(result.stats.brightestSpark).toBe('rich.ts')
    expect(result.stats.safestCircuit).toBe('rich.ts')
  })

  it('classifies grid correctly', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.grids[0]!.gridType).toBe('home-wiring')
    expect(result.grids[0]!.condition).toBe('unreliable')
  })

  it('generates recommendations', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('2 file(s) are dead wires — consider significant refactoring')
  })

  it('handles empty input', async () => {
    const result = await buildLightningRodResult([], [])
    expect(result.rods).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.network.overallPower).toBe(0)
    expect(result.network.isPowered).toBe(false)
  })

  it('returns all-richer recommendation for all-power-plant rods', async () => {
    const result = await buildLightningRodResult(
      ['a.ts', 'b.ts'],
      [RICH, RICH],
    )
    expect(result.recommendations).toContain('Your lightning rod system is fully powered! Every circuit conducts with excellence')
  })

  it('isPowered is true when avgConduction >= 60', async () => {
    const result = await buildLightningRodResult(
      ['a.ts', 'b.ts'],
      [RICH, RICH],
    )
    expect(result.network.isPowered).toBe(true)
  })

  it('groups files by directory', async () => {
    const result = await buildLightningRodResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MODERATE, MINIMAL],
    )
    expect(result.stats.totalGrids).toBe(2)
    expect(result.grids).toHaveLength(2)
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('superconductor')).toBe('string')
    expect(typeof colorGrade('insulator')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatRodTable', () => {
  it('formats a rod', () => {
    const rod = analyzeElectricalRod(RICH, 'rich.ts')
    const out = formatRodTable(rod)
    expect(out).toContain('rich.ts')
    expect(out).toContain('Conduction:')
    expect(out).toContain('Score:')
  })
})

describe('formatRodsTable', () => {
  it('formats empty array', () => {
    expect(formatRodsTable([])).toContain('No electrical rods')
  })

  it('formats multiple rods', () => {
    const rods = [analyzeElectricalRod(RICH, 'a.ts'), analyzeElectricalRod(MINIMAL, 'b.ts')]
    const out = formatRodsTable(rods)
    expect(out).toContain('a.ts')
    expect(out).toContain('b.ts')
  })
})

describe('formatGridTable', () => {
  it('formats a grid', () => {
    const rod = analyzeElectricalRod(RICH, 'a.ts')
    const grid = analyzePowerGrid([rod], 'src')
    const out = formatGridTable(grid)
    expect(out).toContain('src')
    expect(out).toContain('Type:')
  })
})

describe('formatGridsTable', () => {
  it('formats empty grids', () => {
    expect(formatGridsTable([])).toContain('No power grids')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    const out = formatStatsTable(result.stats)
    expect(out).toContain('Network Statistics')
    expect(out).toContain('Total Files:')
    expect(out).toContain('Engineer Grade:')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const recs = ['Fix A', 'Fix B']
    const out = formatRecommendations(recs)
    expect(out).toContain('Fix A')
    expect(out).toContain('Fix B')
    expect(out).toContain('•')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts', 'minimal.ts'],
      [RICH, MINIMAL],
    )
    const out = formatResultTable(result)
    expect(out).toContain('Electrical Rod Analysis')
    expect(out).toContain('Power Grid Analysis')
    expect(out).toContain('Network Statistics')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildLightningRodResult(
      ['rich.ts'],
      [RICH],
    )
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rods).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
