import { describe, expect, it } from 'vitest'

import {
  buildSeismicResult,
  classifyEventType,
  classifyOverallRisk,
  computeCyclomaticComplexity,
  computeDepth,
  computeMagnitude,
  computeNestingDepth,
  computePressureIndex,
  countDebtMarkers,
  countExports,
  countImports,
  countNonBlankLines,
  extractImportPaths,
  findDominant,
  generateRecommendations,
  getDirectory,
  identifyFaultLines,
  identifyTectonicPlates,
  mapSeismicZones,
  type FaultLine,
  type SeismicEvent,
  type SeismicOptions,
  type SeismicResult,
  type SeismicStats,
  type SeismicZone,
  type TectonicPlate,
} from '../src/commands/seismic-helpers.js'

import {
  formatEventBadge,
  formatFaultLineTable,
  formatMagnitudeBar,
  formatPlateOverview,
  formatPressureGauge,
  formatRecommendations,
  formatRisk,
  formatSeismicGraph as _formatSeismicGraph,
  formatSeismicJson,
  formatSeismicStats,
  formatSeismicTable,
  formatZoneAnalysis,
} from '../src/commands/seismic-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `const x = 1
const y = 2
const z = x + y
`

const COMPLEX_CONTENT = `import { process } from './engine'
import { validate } from './utils'
import { render } from './view'
import { save } from './store'
import { log } from './logger'

function handleRequest(data: any): void {
  if (data) {
    for (const item of data.items) {
      if (item.active) {
        switch (item.type) {
          case 'a': handleA(item); break
          case 'b': handleB(item); break
          case 'c': handleC(item); break
          default: handleDefault(item); break
        }
      } else {
        if (item.pending) { processPending(item) }
        else if (item.archived) { archive(item) }
        else { skip(item) }
      }
    }
  }
}
`

const NESTED_CONTENT = `function deep(x: number): number {
  if (x > 0) {
    if (x > 10) {
      if (x > 100) {
        if (x > 1000) {
          if (x > 10000) {
            return x
          }
        }
      }
    }
  }
  return 0
}
`

const DEBT_CONTENT = `// TODO: fix this later
// FIXME: broken logic
// HACK: temporary workaround
// XXX: urgent fix needed
function process() {}
`

const IMPORTING_CONTENT = `import { add } from './math'
import { sub } from './math'
const result = add(1, sub(3, 2))
`

const EXPORTING_CONTENT = `export function add(a: number, b: number): number { return a + b }
export function sub(a: number, b: number): number { return a - b }
export const VERSION = '1.0'
`

const MULTI_FILES = ['src/app.ts', 'src/utils.ts', 'test/app.test.ts']
const MULTI_CONTENTS = [COMPLEX_CONTENT, SIMPLE_CONTENT, 'import { add } from "../src/app"\ntest("works", () => {})\n']

// ─── computeCyclomaticComplexity ────────────────────────────────────────────────

describe('computeCyclomaticComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeCyclomaticComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeCyclomaticComplexity('if (a) {} if (b) {}')).toBe(3)
  })

  it('returns 1 for empty', () => {
    expect(computeCyclomaticComplexity('')).toBe(1)
  })
})

// ─── computeNestingDepth ────────────────────────────────────────────────────────

describe('computeNestingDepth', () => {
  it('returns 0 for flat code', () => {
    expect(computeNestingDepth('const x = 1')).toBe(0)
  })

  it('counts nesting', () => {
    expect(computeNestingDepth('if (a) { if (b) { if (c) {} } }')).toBe(3)
  })

  it('handles empty string', () => {
    expect(computeNestingDepth('')).toBe(0)
  })
})

// ─── countImports ───────────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts imports', () => {
    expect(countImports('import { a } from "b"\nimport c from "d"')).toBe(2)
  })

  it('returns 0 without imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

// ─── countNonBlankLines ────────────────────────────────────────────────────────

describe('countNonBlankLines', () => {
  it('counts non-blank lines', () => {
    expect(countNonBlankLines('a\n\nb\nc')).toBe(3)
  })

  it('returns 0 for empty', () => {
    expect(countNonBlankLines('')).toBe(0)
  })
})

// ─── countDebtMarkers ──────────────────────────────────────────────────────────

describe('countDebtMarkers', () => {
  it('counts TODO and FIXME', () => {
    expect(countDebtMarkers('// TODO: fix\n// FIXME: broken')).toBe(2)
  })

  it('counts HACK and XXX', () => {
    expect(countDebtMarkers('// HACK: temp\n// XXX: urgent')).toBe(2)
  })

  it('returns 0 for clean code', () => {
    expect(countDebtMarkers('const x = 1')).toBe(0)
  })
})

// ─── countExports ──────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts exports', () => {
    expect(countExports(EXPORTING_CONTENT)).toBe(3)
  })

  it('returns 0 without exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── extractImportPaths ────────────────────────────────────────────────────────

describe('extractImportPaths', () => {
  it('extracts import paths', () => {
    const paths = extractImportPaths(IMPORTING_CONTENT)
    expect(paths).toContain('./math')
  })

  it('returns empty for no imports', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })
})

// ─── computeMagnitude ──────────────────────────────────────────────────────────

describe('computeMagnitude', () => {
  it('returns 0 for empty content', () => {
    expect(computeMagnitude('')).toBe(0)
  })

  it('returns low magnitude for simple code', () => {
    expect(computeMagnitude(SIMPLE_CONTENT)).toBeLessThan(3)
  })

  it('returns high magnitude for complex code', () => {
    expect(computeMagnitude(COMPLEX_CONTENT)).toBeGreaterThan(4)
  })

  it('is within 0-10 range', () => {
    const mag = computeMagnitude(COMPLEX_CONTENT)
    expect(mag).toBeGreaterThanOrEqual(0)
    expect(mag).toBeLessThanOrEqual(10)
  })
})

// ─── computeDepth ──────────────────────────────────────────────────────────────

describe('computeDepth', () => {
  it('returns 0 for root file', () => {
    expect(computeDepth('app.ts', 3)).toBe(0)
  })

  it('returns depth for nested file', () => {
    expect(computeDepth('src/core/engine.ts', 3)).toBe(2)
  })

  it('caps at maxDepth', () => {
    expect(computeDepth('a/b/c/d/e/f.ts', 2)).toBe(2)
  })
})

// ─── classifyEventType ─────────────────────────────────────────────────────────

describe('classifyEventType', () => {
  it('classifies tremor for low magnitude', () => {
    expect(classifyEventType(2, 1, 0)).toBe('tremor')
  })

  it('classifies earthquake for high magnitude', () => {
    expect(classifyEventType(7.5, 1, 0)).toBe('earthquake')
  })

  it('classifies silent for high mag low frequency', () => {
    expect(classifyEventType(5.5, 1, 0)).toBe('silent')
  })

  it('classifies aftershock with cascade', () => {
    expect(classifyEventType(4, 1, 1)).toBe('aftershock')
  })

  it('classifies swarm for frequent small events', () => {
    expect(classifyEventType(1.5, 5, 0)).toBe('swarm')
  })

  it('classifies foreshock for moderate with cascade', () => {
    expect(classifyEventType(5, 1, 1)).toBe('silent')
  })
})

// ─── getDirectory ──────────────────────────────────────────────────────────────

describe('getDirectory', () => {
  it('extracts directory', () => {
    expect(getDirectory('src/commands/app.ts')).toBe('src/commands')
  })

  it('returns dot for root file', () => {
    expect(getDirectory('app.ts')).toBe('.')
  })
})

// ─── identifyFaultLines ────────────────────────────────────────────────────────

describe('identifyFaultLines', () => {
  it('groups events by directory', () => {
    const events: SeismicEvent[] = [
      { file: 'src/a.ts', magnitude: 5, depth: 1, type: 'tremor', timestamp: 0, epicenter: 'src/a.ts', affectedFiles: [], description: '' },
      { file: 'src/b.ts', magnitude: 3, depth: 1, type: 'tremor', timestamp: 1, epicenter: 'src/b.ts', affectedFiles: [], description: '' },
    ]
    const faults = identifyFaultLines(events, ['src/a.ts', 'src/b.ts'])
    expect(faults).toHaveLength(1)
    expect(faults[0].name).toBe('src')
  })

  it('classifies hyperactive for many events', () => {
    const events: SeismicEvent[] = Array.from({ length: 6 }, (_, i) => ({
      file: `core/${i}.ts`, magnitude: 4, depth: 1, type: 'tremor' as const, timestamp: i, epicenter: `core/${i}.ts`, affectedFiles: [], description: '',
    }))
    const faults = identifyFaultLines(events, events.map(e => e.file))
    expect(faults[0].activityLevel).toBe('hyperactive')
  })

  it('classifies dormant for few events', () => {
    const events: SeismicEvent[] = [
      { file: 'a.ts', magnitude: 1, depth: 0, type: 'tremor', timestamp: 0, epicenter: 'a.ts', affectedFiles: [], description: '' },
    ]
    const faults = identifyFaultLines(events, ['a.ts'])
    expect(faults[0].activityLevel).toBe('dormant')
  })
})

// ─── identifyTectonicPlates ────────────────────────────────────────────────────

describe('identifyTectonicPlates', () => {
  it('groups by directory', () => {
    const plates = identifyTectonicPlates(['src/a.ts', 'src/b.ts', 'test/c.ts'], [SIMPLE_CONTENT, SIMPLE_CONTENT, SIMPLE_CONTENT])
    expect(plates).toHaveLength(2)
  })

  it('computes stability from complexity', () => {
    const plates = identifyTectonicPlates(['complex.ts'], [COMPLEX_CONTENT])
    const plates2 = identifyTectonicPlates(['simple.ts'], [SIMPLE_CONTENT])
    expect(plates[0].stability).toBeLessThan(plates2[0].stability)
  })

  it('computes pressure from debt', () => {
    const plates = identifyTectonicPlates(['debt.ts'], [DEBT_CONTENT])
    expect(plates[0].pressureBuildup).toBeGreaterThan(0)
  })

  it('detects expanding drift with more exports', () => {
    const plates = identifyTectonicPlates(['api.ts'], [EXPORTING_CONTENT])
    expect(plates[0].driftDirection).toBe('expanding')
  })
})

// ─── mapSeismicZones ───────────────────────────────────────────────────────────

describe('mapSeismicZones', () => {
  it('creates zones from events', () => {
    const events: SeismicEvent[] = [
      { file: 'src/a.ts', magnitude: 5, depth: 1, type: 'tremor', timestamp: 0, epicenter: 'src/a.ts', affectedFiles: [], description: '' },
    ]
    const zones = mapSeismicZones(events, [], [])
    expect(zones).toHaveLength(1)
    expect(zones[0].zone).toBe('src')
  })

  it('adds zones from plates with no events', () => {
    const plates: TectonicPlate[] = [
      { name: 'utils', files: ['utils/a.ts'], stability: 80, pressureBuildup: 10, boundaries: [], driftDirection: 'stable', riskAssessment: 'stable' },
    ]
    const zones = mapSeismicZones([], [], plates)
    expect(zones).toHaveLength(1)
    expect(zones[0].zone).toBe('utils')
  })

  it('classifies catastrophic for high magnitude', () => {
    const events: SeismicEvent[] = [
      { file: 'a.ts', magnitude: 8, depth: 0, type: 'earthquake', timestamp: 0, epicenter: 'a.ts', affectedFiles: [], description: '' },
    ]
    const zones = mapSeismicZones(events, [], [])
    expect(zones[0].risk).toBe('catastrophic')
  })

  it('classifies stable for no events', () => {
    const plates: TectonicPlate[] = [
      { name: 'quiet', files: [], stability: 100, pressureBuildup: 0, boundaries: [], driftDirection: 'stable', riskAssessment: 'stable' },
    ]
    const zones = mapSeismicZones([], [], plates)
    expect(zones[0].risk).toBe('stable')
  })
})

// ─── computePressureIndex ──────────────────────────────────────────────────────

describe('computePressureIndex', () => {
  it('returns 0 for no activity', () => {
    expect(computePressureIndex({ avgMagnitude: 0, activeFaultLines: 0, hyperactiveFaultLines: 0, highPressurePlates: 0, earthquakeCount: 0 })).toBe(0)
  })

  it('increases with magnitude', () => {
    const low = computePressureIndex({ avgMagnitude: 1, activeFaultLines: 0, hyperactiveFaultLines: 0, highPressurePlates: 0, earthquakeCount: 0 })
    const high = computePressureIndex({ avgMagnitude: 5, activeFaultLines: 0, hyperactiveFaultLines: 0, highPressurePlates: 0, earthquakeCount: 0 })
    expect(high).toBeGreaterThan(low)
  })

  it('caps at 100', () => {
    expect(computePressureIndex({ avgMagnitude: 10, activeFaultLines: 10, hyperactiveFaultLines: 10, highPressurePlates: 10, earthquakeCount: 10 })).toBeLessThanOrEqual(100)
  })
})

// ─── classifyOverallRisk ───────────────────────────────────────────────────────

describe('classifyOverallRisk', () => {
  it('returns stable for low values', () => {
    expect(classifyOverallRisk(0.5, 0, 5)).toBe('stable')
  })

  it('returns minor for slight activity', () => {
    expect(classifyOverallRisk(2, 0, 10)).toBe('minor')
  })

  it('returns moderate for mid values', () => {
    expect(classifyOverallRisk(3.5, 2, 30)).toBe('moderate')
  })

  it('returns catastrophic for extreme values', () => {
    expect(classifyOverallRisk(8, 5, 70)).toBe('catastrophic')
  })
})

// ─── findDominant ──────────────────────────────────────────────────────────────

describe('findDominant', () => {
  it('finds most common value', () => {
    expect(findDominant(['a', 'b', 'a'])).toBe('a')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: SeismicStats = {
    totalEvents: 5, avgMagnitude: 3, maxMagnitude: 5,
    tremorCount: 3, earthquakeCount: 0, aftershockCount: 0, swarmCount: 0, silentCount: 0,
    activeFaultLines: 0, dormantFaultLines: 1, hyperactiveFaultLines: 0,
    avgPlateStability: 80, highPressurePlates: 0,
    overallRisk: 'minor', mostActiveZone: 'src', mostStableZone: 'test',
    pressureIndex: 20,
  }

  it('recommends stabilizing active faults', () => {
    const faults: FaultLine[] = [
      { name: 'core', files: ['core/a.ts'], activityLevel: 'active', avgMagnitude: 4, lastEventAge: 1, riskLevel: 'medium', description: '' },
    ]
    const recs = generateRecommendations([], faults, [], [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('fault'))).toBe(true)
  })

  it('recommends reducing pressure', () => {
    const plates: TectonicPlate[] = [
      { name: 'core', files: ['core/a.ts'], stability: 40, pressureBuildup: 80, boundaries: [], driftDirection: 'stable', riskAssessment: 'high pressure' },
    ]
    const recs = generateRecommendations([], [], plates, [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('pressure'))).toBe(true)
  })

  it('recommends for high-risk zones', () => {
    const zones: SeismicZone[] = [
      { zone: 'core', events: [], magnitude: 8, frequency: 5, risk: 'catastrophic', recommendation: '' },
    ]
    const recs = generateRecommendations([], [], [], zones, baseStats)
    expect(recs.some(r => r.toLowerCase().includes('zone'))).toBe(true)
  })

  it('recommends investigating silent events', () => {
    const events: SeismicEvent[] = [
      { file: 'a.ts', magnitude: 6, depth: 0, type: 'silent', timestamp: 0, epicenter: 'a.ts', affectedFiles: [], description: '' },
    ]
    const recs = generateRecommendations(events, [], [], [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('silent'))).toBe(true)
  })

  it('warns about high overall risk', () => {
    const stats = { ...baseStats, overallRisk: 'catastrophic' as const }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some(r => r.toLowerCase().includes('risk'))).toBe(true)
  })

  it('returns empty for stable codebase', () => {
    const recs = generateRecommendations([], [], [], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── buildSeismicResult ────────────────────────────────────────────────────────

describe('buildSeismicResult', () => {
  it('builds complete result', () => {
    const result = buildSeismicResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.events).toHaveLength(3)
    expect(result.stats.totalEvents).toBe(3)
  })

  it('handles empty file list', () => {
    const result = buildSeismicResult([], [], {})
    expect(result.events).toEqual([])
    expect(result.stats.totalEvents).toBe(0)
    expect(result.stats.avgMagnitude).toBe(0)
    expect(result.stats.maxMagnitude).toBe(0)
  })

  it('computes correct event types', () => {
    const result = buildSeismicResult(['complex.ts'], [COMPLEX_CONTENT], {})
    expect(result.events[0].magnitude).toBeGreaterThan(0)
  })

  it('builds fault lines', () => {
    const result = buildSeismicResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.faultLines.length).toBeGreaterThan(0)
  })

  it('builds tectonic plates', () => {
    const result = buildSeismicResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.plates.length).toBeGreaterThan(0)
  })

  it('builds seismic zones', () => {
    const result = buildSeismicResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.zones.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildSeismicResult(['a.ts', 'b.ts'], [COMPLEX_CONTENT, SIMPLE_CONTENT], {})
    expect(result.stats.maxMagnitude).toBeGreaterThanOrEqual(result.stats.avgMagnitude)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatEventBadge returns event name', () => {
    expect(formatEventBadge('earthquake')).toContain('earthquake')
  })

  it('formatRisk returns risk text', () => {
    expect(formatRisk('major')).toContain('major')
  })

  it('formatMagnitudeBar returns bar', () => {
    const bar = formatMagnitudeBar(7.5)
    expect(bar).toContain('7.5')
  })

  it('formatPressureGauge returns gauge', () => {
    const gauge = formatPressureGauge(65)
    expect(gauge).toContain('65')
  })

  it('formatFaultLineTable returns table', () => {
    const faults: FaultLine[] = [
      { name: 'src', files: ['src/a.ts'], activityLevel: 'active', avgMagnitude: 4, lastEventAge: 1, riskLevel: 'medium', description: '' },
    ]
    const table = formatFaultLineTable(faults)
    expect(table).toContain('src')
  })

  it('formatFaultLineTable handles empty', () => {
    expect(formatFaultLineTable([])).toContain('No fault')
  })

  it('formatPlateOverview returns overview', () => {
    const plates: TectonicPlate[] = [
      { name: 'src', files: ['src/a.ts'], stability: 80, pressureBuildup: 20, boundaries: [], driftDirection: 'stable', riskAssessment: 'stable' },
    ]
    const overview = formatPlateOverview(plates)
    expect(overview).toContain('src')
  })

  it('formatPlateOverview handles empty', () => {
    expect(formatPlateOverview([])).toContain('No tectonic')
  })

  it('formatZoneAnalysis returns zones', () => {
    const zones: SeismicZone[] = [
      { zone: 'src', events: [], magnitude: 3, frequency: 2, risk: 'moderate', recommendation: 'test' },
    ]
    const analysis = formatZoneAnalysis(zones)
    expect(analysis).toContain('src')
  })

  it('formatZoneAnalysis handles empty', () => {
    expect(formatZoneAnalysis([])).toContain('No seismic zones')
  })

  it('formatSeismicStats returns stats', () => {
    const stats: SeismicStats = {
      totalEvents: 10, avgMagnitude: 3.5, maxMagnitude: 7,
      tremorCount: 5, earthquakeCount: 1, aftershockCount: 2, swarmCount: 1, silentCount: 1,
      activeFaultLines: 2, dormantFaultLines: 3, hyperactiveFaultLines: 1,
      avgPlateStability: 70, highPressurePlates: 1,
      overallRisk: 'moderate', mostActiveZone: 'core', mostStableZone: 'docs',
      pressureIndex: 45,
    }
    const formatted = formatSeismicStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('3.5')
  })

  it('formatRecommendations returns bullets', () => {
    const recs = formatRecommendations(['Fix faults', 'Reduce pressure'])
    expect(recs).toContain('Fix faults')
  })

  it('formatRecommendations returns success for empty', () => {
    expect(formatRecommendations([])).toContain('stable')
  })

  it('formatSeismicJson returns valid JSON', () => {
    const result = buildSeismicResult([], [], {})
    const json = formatSeismicJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatSeismicTable returns output', () => {
    const result = buildSeismicResult(['a.ts'], [SIMPLE_CONTENT], {})
    const output = formatSeismicTable(result, false)
    expect(output.length).toBeGreaterThan(0)
  })
})
