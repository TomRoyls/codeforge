import { describe, it, expect } from 'vitest'
import {
  measureConductive,
  measureSignal,
  measureInsulation,
  measureCircuit,
  measureGauge,
  measureFlexible,
  analyzeWireSegment,
  classifyCondition,
  classifyHarnessType,
  classifyHarnessCondition,
  classifyElectricianGrade,
  buildCopperWireResult,
} from '../src/commands/copper-wire-helpers.js'
import {
  scoreColor,
  gradeColor,
  signalColor,
  insulationColor,
  circuitColor,
  gaugeColor,
  flexibilityColor,
  conditionColor,
  electricianColor,
  formatCopperWireJson,
  formatCopperWireTable,
} from '../src/commands/copper-wire-format-helpers.js'
import type { WireSegment } from '../src/commands/copper-wire-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `import { readFileSync } from 'node:fs'

/**
 * Documentation
 */
export interface Data {
  value: number
  name: string
}

export class Processor {
  private data: Data[] = []

  async process(input?: string): Promise<Data[]> {
    try {
      const result = input ?? 'default'
      return this.data
    } catch (e) {
      throw e
    }
  }
}

export type Result = Data | null
`

const EMPTY = ''

const POOR = 'var x = 1\nany\nvar y = 2'

// ─── measureConductive ─────────────────────────────────────────────────────

describe('measureConductive', () => {
  it('returns efficiency 71 for RICH fixture', () => {
    const m = measureConductive(RICH)
    expect(m.efficiency).toBe(71)
  })

  it('returns high-conductivity grade for RICH', () => {
    expect(measureConductive(RICH).grade).toBe('high-conductivity')
  })

  it('has hasHighEfficiency true for RICH', () => {
    expect(measureConductive(RICH).hasHighEfficiency).toBe(true)
  })

  it('has hasSmoothFlow false for RICH (no async+arrow combo)', () => {
    expect(measureConductive(RICH).hasSmoothFlow).toBe(false)
  })

  it('has hasFast true for RICH', () => {
    expect(measureConductive(RICH).hasFast).toBe(true)
  })

  it('returns 0 efficiency for EMPTY', () => {
    expect(measureConductive(EMPTY).efficiency).toBe(0)
  })

  it('returns insulator grade for EMPTY', () => {
    expect(measureConductive(EMPTY).grade).toBe('insulator')
  })

  it('detects bottleneckCount for POOR', () => {
    expect(measureConductive(POOR).bottleneckCount).toBe(2)
  })

  it('detects blockingCount for POOR', () => {
    expect(measureConductive(POOR).blockingCount).toBe(1)
  })

  it('hasNoBottleneck false for POOR', () => {
    expect(measureConductive(POOR).hasNoBottleneck).toBe(false)
  })
})

// ─── measureSignal ──────────────────────────────────────────────────────────

describe('measureSignal', () => {
  it('returns integrity 64 for RICH', () => {
    expect(measureSignal(RICH).integrity).toBe(64)
  })

  it('returns proper-signal quality for RICH', () => {
    expect(measureSignal(RICH).quality).toBe('proper-signal')
  })

  it('has hasHighIntegrity false for RICH (64 < 70)', () => {
    expect(measureSignal(RICH).hasHighIntegrity).toBe(false)
  })

  it('has hasAccurate true for RICH', () => {
    expect(measureSignal(RICH).hasAccurate).toBe(true)
  })

  it('returns 0 integrity for EMPTY', () => {
    expect(measureSignal(EMPTY).integrity).toBe(0)
  })

  it('returns static quality for EMPTY', () => {
    expect(measureSignal(EMPTY).quality).toBe('static')
  })

  it('detects corruptionCount for POOR', () => {
    expect(measureSignal(POOR).corruptionCount).toBe(2)
  })

  it('detects distortionCount for POOR', () => {
    expect(measureSignal(POOR).distortionCount).toBe(1)
  })

  it('hasNoCorruption false for POOR', () => {
    expect(measureSignal(POOR).hasNoCorruption).toBe(false)
  })
})

// ─── measureInsulation ──────────────────────────────────────────────────────

describe('measureInsulation', () => {
  it('returns quality 72 for RICH', () => {
    expect(measureInsulation(RICH).quality).toBe(72)
  })

  it('returns double-insulated rating for RICH', () => {
    expect(measureInsulation(RICH).rating).toBe('double-insulated')
  })

  it('has hasHighQuality true for RICH', () => {
    expect(measureInsulation(RICH).hasHighQuality).toBe(true)
  })

  it('has hasEncapsulated true for RICH (class + private)', () => {
    expect(measureInsulation(RICH).hasEncapsulated).toBe(true)
  })

  it('has hasNoShort true for RICH', () => {
    expect(measureInsulation(RICH).hasNoShort).toBe(true)
  })

  it('returns 0 quality for EMPTY', () => {
    expect(measureInsulation(EMPTY).quality).toBe(0)
  })

  it('returns exposed rating for EMPTY', () => {
    expect(measureInsulation(EMPTY).rating).toBe('exposed')
  })

  it('detects leakingCount for POOR', () => {
    expect(measureInsulation(POOR).leakingCount).toBe(2)
  })

  it('detects bleedCount for POOR', () => {
    expect(measureInsulation(POOR).bleedCount).toBe(1)
  })

  it('hasNoShort false for POOR', () => {
    expect(measureInsulation(POOR).hasNoShort).toBe(false)
  })
})

// ─── measureCircuit ─────────────────────────────────────────────────────────

describe('measureCircuit', () => {
  it('returns completeness 100 for RICH', () => {
    expect(measureCircuit(RICH).completeness).toBe(100)
  })

  it('returns complete-circuit connection for RICH', () => {
    expect(measureCircuit(RICH).connection).toBe('complete-circuit')
  })

  it('has hasHighCompleteness true for RICH', () => {
    expect(measureCircuit(RICH).hasHighCompleteness).toBe(true)
  })

  it('has hasCompletePaths true for RICH', () => {
    expect(measureCircuit(RICH).hasCompletePaths).toBe(true)
  })

  it('has hasProperReturn true for RICH', () => {
    expect(measureCircuit(RICH).hasProperReturn).toBe(true)
  })

  it('returns 0 completeness for EMPTY', () => {
    expect(measureCircuit(EMPTY).completeness).toBe(0)
  })

  it('returns disconnected for EMPTY', () => {
    expect(measureCircuit(EMPTY).connection).toBe('disconnected')
  })

  it('detects deadEndCount for POOR', () => {
    expect(measureCircuit(POOR).deadEndCount).toBe(2)
  })

  it('detects orphanCount for POOR', () => {
    expect(measureCircuit(POOR).orphanCount).toBe(1)
  })
})

// ─── measureGauge ───────────────────────────────────────────────────────────

describe('measureGauge', () => {
  it('returns capacity 73 for RICH', () => {
    expect(measureGauge(RICH).capacity).toBe(73)
  })

  it('returns proper-size for RICH', () => {
    expect(measureGauge(RICH).size).toBe('proper-size')
  })

  it('has hasHighCapacity true for RICH', () => {
    expect(measureGauge(RICH).hasHighCapacity).toBe(true)
  })

  it('has hasScalable true for RICH (optional+default)', () => {
    expect(measureGauge(RICH).hasScalable).toBe(true)
  })

  it('returns 0 capacity for EMPTY', () => {
    expect(measureGauge(EMPTY).capacity).toBe(0)
  })

  it('returns filament for EMPTY', () => {
    expect(measureGauge(EMPTY).size).toBe('filament')
  })

  it('returns 8 capacity for POOR', () => {
    expect(measureGauge(POOR).capacity).toBe(8)
  })

  it('detects overloadCount for POOR', () => {
    expect(measureGauge(POOR).overloadCount).toBe(2)
  })

  it('detects undersizedCount for POOR', () => {
    expect(measureGauge(POOR).undersizedCount).toBe(1)
  })
})

// ─── measureFlexible ────────────────────────────────────────────────────────

describe('measureFlexible', () => {
  it('returns adaptability 69 for RICH', () => {
    expect(measureFlexible(RICH).adaptability).toBe(69)
  })

  it('returns reasonable-bend for RICH', () => {
    expect(measureFlexible(RICH).bend).toBe('reasonable-bend')
  })

  it('has hasHighAdaptability false for RICH (69 < 70)', () => {
    expect(measureFlexible(RICH).hasHighAdaptability).toBe(false)
  })

  it('has hasModular true for RICH', () => {
    expect(measureFlexible(RICH).hasModular).toBe(true)
  })

  it('returns 0 adaptability for EMPTY', () => {
    expect(measureFlexible(EMPTY).adaptability).toBe(0)
  })

  it('returns brittle for EMPTY', () => {
    expect(measureFlexible(EMPTY).bend).toBe('brittle')
  })

  it('detects rigidityCount for POOR', () => {
    expect(measureFlexible(POOR).rigidityCount).toBe(2)
  })

  it('detects brittlenessCount for POOR', () => {
    expect(measureFlexible(POOR).brittlenessCount).toBe(1)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns perfect-conductor for 90', () => {
    expect(classifyCondition(90)).toBe('perfect-conductor')
  })
  it('returns quality-wire for 75', () => {
    expect(classifyCondition(75)).toBe('quality-wire')
  })
  it('returns proper-cable for 60', () => {
    expect(classifyCondition(60)).toBe('proper-cable')
  })
  it('returns fraying-wire for 45', () => {
    expect(classifyCondition(45)).toBe('fraying-wire')
  })
  it('returns corroded-wire for 30', () => {
    expect(classifyCondition(30)).toBe('corroded-wire')
  })
  it('returns broken-circuit for 10', () => {
    expect(classifyCondition(10)).toBe('broken-circuit')
  })
})

// ─── classifyElectricianGrade ───────────────────────────────────────────────

describe('classifyElectricianGrade', () => {
  it('returns master-electrician for 85', () => {
    expect(classifyElectricianGrade(85)).toBe('master-electrician')
  })
  it('returns expert-wirer for 70', () => {
    expect(classifyElectricianGrade(70)).toBe('expert-wirer')
  })
  it('returns skilled-technician for 55', () => {
    expect(classifyElectricianGrade(55)).toBe('skilled-technician')
  })
  it('returns apprentice for 40', () => {
    expect(classifyElectricianGrade(40)).toBe('apprentice')
  })
  it('returns novice for 25', () => {
    expect(classifyElectricianGrade(25)).toBe('novice')
  })
  it('returns short-circuiter for 10', () => {
    expect(classifyElectricianGrade(10)).toBe('short-circuiter')
  })
})

// ─── analyzeWireSegment ─────────────────────────────────────────────────────

describe('analyzeWireSegment', () => {
  it('returns qualityScore 74 for RICH', () => {
    expect(analyzeWireSegment(RICH, 'rich.ts').qualityScore).toBe(74)
  })

  it('returns quality-wire condition for RICH', () => {
    expect(analyzeWireSegment(RICH, 'rich.ts').condition).toBe('quality-wire')
  })

  it('stores file path', () => {
    expect(analyzeWireSegment(RICH, 'a.ts').file).toBe('a.ts')
  })

  it('returns conductivity 71 for RICH', () => {
    expect(analyzeWireSegment(RICH, 'r.ts').conductivity).toBe(71)
  })

  it('returns signalIntegrity 64 for RICH', () => {
    expect(analyzeWireSegment(RICH, 'r.ts').signalIntegrity).toBe(64)
  })

  it('returns insulationQuality 72 for RICH', () => {
    expect(analyzeWireSegment(RICH, 'r.ts').insulationQuality).toBe(72)
  })

  it('returns circuitCompleteness 100 for RICH', () => {
    expect(analyzeWireSegment(RICH, 'r.ts').circuitCompleteness).toBe(100)
  })

  it('returns wireGauge 73 for RICH', () => {
    expect(analyzeWireSegment(RICH, 'r.ts').wireGauge).toBe(73)
  })

  it('returns flexibility 69 for RICH', () => {
    expect(analyzeWireSegment(RICH, 'r.ts').flexibility).toBe(69)
  })

  it('returns broken-circuit for POOR', () => {
    expect(analyzeWireSegment(POOR, 'p.ts').condition).toBe('broken-circuit')
  })
})

// ─── classifyHarnessType ────────────────────────────────────────────────────

describe('classifyHarnessType', () => {
  it('returns cut-cords for empty segments', () => {
    expect(classifyHarnessType([])).toBe('cut-cords')
  })

  it('returns proper-wiring for RICH segment', () => {
    const seg = analyzeWireSegment(RICH, 'a.ts')
    expect(classifyHarnessType([seg])).toBe('proper-wiring')
  })
})

// ─── classifyHarnessCondition ───────────────────────────────────────────────

describe('classifyHarnessCondition', () => {
  it('returns perfectly-wired for 80', () => {
    expect(classifyHarnessCondition(80)).toBe('perfectly-wired')
  })
  it('returns well-harnessed for 65', () => {
    expect(classifyHarnessCondition(65)).toBe('well-harnessed')
  })
  it('returns properly-connected for 50', () => {
    expect(classifyHarnessCondition(50)).toBe('properly-connected')
  })
  it('returns loose-connections for 35', () => {
    expect(classifyHarnessCondition(35)).toBe('loose-connections')
  })
  it('returns frayed-harness for 20', () => {
    expect(classifyHarnessCondition(20)).toBe('frayed-harness')
  })
  it('returns severed for 10', () => {
    expect(classifyHarnessCondition(10)).toBe('severed')
  })
})

// ─── buildCopperWireResult ──────────────────────────────────────────────────

describe('buildCopperWireResult', () => {
  it('returns totalFiles 2 for two files', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.totalFiles).toBe(2)
  })

  it('computes avgConductivity correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgConductivity).toBe(36)
  })

  it('computes avgSignalIntegrity correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgSignalIntegrity).toBe(32)
  })

  it('computes avgInsulationQuality correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgInsulationQuality).toBe(36)
  })

  it('computes avgCircuitCompleteness correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgCircuitCompleteness).toBe(50)
  })

  it('computes avgWireGauge correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgWireGauge).toBe(41)
  })

  it('computes avgFlexibility correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgFlexibility).toBe(39)
  })

  it('computes overallConductivity correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.overallConductivity).toBe(42)
  })

  it('returns apprentice grade for overallConductivity 42', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.electricianGrade).toBe('apprentice')
  })

  it('returns bestSegment as rich.ts', () => {
    expect(buildCopperWireResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.bestSegment).toBe('rich.ts')
  })

  it('counts qualityWireCount correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.qualityWireCount).toBe(1)
  })

  it('counts brokenCircuitCount correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.brokenCircuitCount).toBe(1)
  })

  it('counts hasHighEfficiencyCount correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighEfficiencyCount).toBe(1)
  })

  it('counts hasHighQualityCount correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighQualityCount).toBe(1)
  })

  it('counts hasHighCompletenessCount correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighCompletenessCount).toBe(1)
  })

  it('counts hasHighCapacityCount correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighCapacityCount).toBe(1)
  })

  it('computes network.isConductive false for avgConductivity 36', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).network.isConductive).toBe(false)
  })

  it('generates recommendations', () => {
    const recs = buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).recommendations
    expect(recs.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const r = buildCopperWireResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.network.overallConductivity).toBe(0)
    expect(r.stats.electricianGrade).toBe('short-circuiter')
  })

  it('creates harnesses by directory', () => {
    const r = buildCopperWireResult(['a/rich.ts', 'b/poor.ts'], [RICH, POOR])
    expect(r.harnesses.length).toBe(2)
  })

  it('sets network.avgConductivity correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).network.avgConductivity).toBe(36)
  })

  it('sets network.avgCompleteness correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).network.avgCompleteness).toBe(50)
  })

  it('sets network.overallConductivity correctly', () => {
    expect(buildCopperWireResult(['a.ts', 'b.ts'], [RICH, POOR]).network.overallConductivity).toBe(42)
  })

  it('returns perfect conductor for all-high content', () => {
    const high = 'export interface Foo { x: number }\nexport class Bar {\nprivate data: Foo[] = []\nasync process(): Promise<Foo> {\ntry {\nconst result: Foo = { x: 1 }\nif (result.x !== undefined) {\nreturn result\n}\n} catch (e) {\nthrow e\n}\n}\n}\nexport type Res = Foo | null\n'
    const seg = analyzeWireSegment(high, 'high.ts')
    expect(seg.qualityScore).toBeGreaterThan(70)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('scoreColor returns string for low score', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('gradeColor returns string for superconductor', () => {
    expect(typeof gradeColor('superconductor')).toBe('string')
  })

  it('signalColor returns string for crystal-clear', () => {
    expect(typeof signalColor('crystal-clear')).toBe('string')
  })

  it('insulationColor returns string for triple-shielded', () => {
    expect(typeof insulationColor('triple-shielded')).toBe('string')
  })

  it('circuitColor returns string for complete-circuit', () => {
    expect(typeof circuitColor('complete-circuit')).toBe('string')
  })

  it('gaugeColor returns string for heavy-gauge', () => {
    expect(typeof gaugeColor('heavy-gauge')).toBe('string')
  })

  it('flexibilityColor returns string for highly-flexible', () => {
    expect(typeof flexibilityColor('highly-flexible')).toBe('string')
  })

  it('conditionColor returns string for perfect-conductor', () => {
    expect(typeof conditionColor('perfect-conductor')).toBe('string')
  })

  it('electricianColor returns string for master-electrician', () => {
    expect(typeof electricianColor('master-electrician')).toBe('string')
  })

  it('formatCopperWireJson returns valid JSON', () => {
    const r = buildCopperWireResult(['a.ts'], [RICH])
    const json = formatCopperWireJson(r)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatCopperWireTable returns string with header', () => {
    const r = buildCopperWireResult(['a.ts'], [RICH])
    const table = formatCopperWireTable(r, false)
    expect(table).toContain('Copper Wire Analysis')
  })

  it('formatCopperWireTable verbose shows per-file segments', () => {
    const r = buildCopperWireResult(['a.ts'], [RICH])
    const table = formatCopperWireTable(r, true)
    expect(table).toContain('Per-File Segments')
  })

  it('color helpers pass through unknown values', () => {
    expect(gradeColor('unknown')).toBe('unknown')
    expect(signalColor('unknown')).toBe('unknown')
    expect(insulationColor('unknown')).toBe('unknown')
    expect(circuitColor('unknown')).toBe('unknown')
    expect(gaugeColor('unknown')).toBe('unknown')
    expect(flexibilityColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
    expect(electricianColor('unknown')).toBe('unknown')
  })
})
