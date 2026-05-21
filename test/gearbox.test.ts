import { describe, it, expect } from 'vitest'
import {
  classifyGearType,
  classifyTransmissionType,
  classifyMechanicGrade,
  classifyTransmissionGrade,
  extractGears,
  runDiagnostics,
  computePowerBand,
  analyzeGearUnit,
  analyzeTransmissionUnit,
  generateRecommendations,
  buildGearboxResult,
  type GearUnit,
  type GearboxStats,
} from '../src/commands/gearbox-helpers.js'
import { formatGearboxTable, formatGearboxJson } from '../src/commands/gearbox-format-helpers.js'

// ─── classifyGearType ───────────────────────────────────────────────────────

describe('classifyGearType', () => {
  it('returns planetary for 5+ functions and 2+ classes', () => {
    expect(classifyGearType(5, 0, 2)).toBe('planetary')
  })

  it('returns worm for 2+ classes', () => {
    expect(classifyGearType(0, 0, 2)).toBe('worm')
  })

  it('returns helical for 5+ functions and 3+ exports', () => {
    expect(classifyGearType(5, 3, 0)).toBe('helical')
  })

  it('returns bevel for 4+ exports', () => {
    expect(classifyGearType(0, 4, 0)).toBe('bevel')
  })

  it('returns spur for 3+ functions', () => {
    expect(classifyGearType(3, 0, 0)).toBe('spur')
  })

  it('returns rack-pinion for 2+ exports', () => {
    expect(classifyGearType(0, 2, 0)).toBe('rack-pinion')
  })

  it('returns spur as default', () => {
    expect(classifyGearType(0, 0, 0)).toBe('spur')
    expect(classifyGearType(1, 0, 0)).toBe('spur')
  })
})

// ─── classifyTransmissionType ───────────────────────────────────────────────

describe('classifyTransmissionType', () => {
  it('returns dual-clutch for 6+ exports and 2+ generics', () => {
    expect(classifyTransmissionType(6, 0, 2)).toBe('dual-clutch')
  })

  it('returns automatic for 4+ exports and 3+ imports', () => {
    expect(classifyTransmissionType(4, 3, 0)).toBe('automatic')
  })

  it('returns cvt for 2+ generics', () => {
    expect(classifyTransmissionType(0, 0, 2)).toBe('cvt')
  })

  it('returns direct-drive for no exports or imports', () => {
    expect(classifyTransmissionType(0, 0, 0)).toBe('direct-drive')
  })

  it('returns manual for 2+ exports', () => {
    expect(classifyTransmissionType(2, 0, 0)).toBe('manual')
  })
})

// ─── classifyMechanicGrade ──────────────────────────────────────────────────

describe('classifyMechanicGrade', () => {
  it('returns f1-engineer for 85+', () => { expect(classifyMechanicGrade(85)).toBe('f1-engineer') })
  it('returns master-mechanic for 70-84', () => { expect(classifyMechanicGrade(70)).toBe('master-mechanic') })
  it('returns mechanic for 55-69', () => { expect(classifyMechanicGrade(55)).toBe('mechanic') })
  it('returns apprentice for 40-54', () => { expect(classifyMechanicGrade(40)).toBe('apprentice') })
  it('returns shade-tree for 20-39', () => { expect(classifyMechanicGrade(20)).toBe('shade-tree') })
  it('returns clueless below 20', () => { expect(classifyMechanicGrade(19)).toBe('clueless') })
})

// ─── classifyTransmissionGrade ──────────────────────────────────────────────

describe('classifyTransmissionGrade', () => {
  it('returns racing for 80+', () => { expect(classifyTransmissionGrade(80)).toBe('racing') })
  it('returns performance for 65-79', () => { expect(classifyTransmissionGrade(65)).toBe('performance') })
  it('returns standard for 45-64', () => { expect(classifyTransmissionGrade(45)).toBe('standard') })
  it('returns economy for 25-44', () => { expect(classifyTransmissionGrade(25)).toBe('economy') })
  it('returns worn for 10-24', () => { expect(classifyTransmissionGrade(10)).toBe('worn') })
  it('returns broken below 10', () => { expect(classifyTransmissionGrade(9)).toBe('broken') })
})

// ─── extractGears ───────────────────────────────────────────────────────────

describe('extractGears', () => {
  it('returns empty for no functions', () => {
    expect(extractGears('const x = 1')).toEqual([])
  })

  it('extracts named function', () => {
    const gears = extractGears('function hello() { return "world" }')
    expect(gears.length).toBeGreaterThan(0)
    expect(gears[0].name).toBe('hello')
    expect(gears[0].teeth).toBeGreaterThan(0)
    expect(gears[0].diameter).toBeGreaterThan(0)
  })

  it('extracts exported function', () => {
    const gears = extractGears('export function create(x: string): string { return x }')
    expect(gears.length).toBeGreaterThan(0)
    expect(gears[0].isDriveGear).toBe(true)
  })

  it('detects idler gears for simple functions', () => {
    const gears = extractGears('function pass() {}')
    expect(gears.length).toBeGreaterThan(0)
    expect(gears[0].isIdlerGear).toBe(true)
  })
})

// ─── runDiagnostics ─────────────────────────────────────────────────────────

describe('runDiagnostics', () => {
  it('detects grinding with high friction', () => {
    const d = runDiagnostics({ friction: 70, heatGeneration: 30, noise: 20, vibration: 20, hasAny: false, hasConsole: false, hasEval: false, testCount: 0, totalLines: 10 })
    expect(d.isGrinding).toBe(true)
  })

  it('detects overheating', () => {
    const d = runDiagnostics({ friction: 20, heatGeneration: 70, noise: 20, vibration: 20, hasAny: false, hasConsole: false, hasEval: false, testCount: 0, totalLines: 10 })
    expect(d.isOverheating).toBe(true)
  })

  it('detects metal shavings with any', () => {
    const d = runDiagnostics({ friction: 20, heatGeneration: 20, noise: 20, vibration: 20, hasAny: true, hasConsole: false, hasEval: false, testCount: 0, totalLines: 10 })
    expect(d.hasMetalShavings).toBe(true)
  })

  it('computes fluid level from tests', () => {
    const d = runDiagnostics({ friction: 20, heatGeneration: 20, noise: 20, vibration: 20, hasAny: false, hasConsole: false, hasEval: false, testCount: 5, totalLines: 10 })
    expect(d.fluidLevel).toBeGreaterThan(0)
  })
})

// ─── computePowerBand ───────────────────────────────────────────────────────

describe('computePowerBand', () => {
  it('returns narrow for similar values', () => {
    const pb = computePowerBand(50, 50, 50)
    expect(pb.optimalRange).toBe('narrow')
    expect(pb.lowEnd).toBe(60)
  })

  it('returns broad for spread values', () => {
    const pb = computePowerBand(20, 60, 90)
    expect(pb.optimalRange).toBe('broad')
  })

  it('returns low when lowEnd dominates', () => {
    const pb = computePowerBand(80, 40, 30)
    expect(pb.optimalRange).toBe('low')
  })

  it('returns high when highEnd dominates', () => {
    const pb = computePowerBand(30, 40, 80)
    expect(pb.optimalRange).toBe('high')
  })

  it('clamps values to 100', () => {
    const pb = computePowerBand(100, 100, 100)
    expect(pb.lowEnd).toBeLessThanOrEqual(100)
    expect(pb.midRange).toBeLessThanOrEqual(100)
    expect(pb.highEnd).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeGearUnit ────────────────────────────────────────────────────────

describe('analyzeGearUnit', () => {
  it('analyzes empty content', () => {
    const unit = analyzeGearUnit('', 'empty.ts')
    expect(unit.file).toBe('empty.ts')
    expect(unit.efficiency).toBeGreaterThanOrEqual(0)
    expect(unit.gearCount).toBe(0)
    expect(unit.gearType).toBe('spur')
    expect(unit.transmissionType).toBe('direct-drive')
    expect(unit.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes well-crafted code', () => {
    const code = [
      '/** Module */',
      'export interface Config { name: string }',
      '/** Creates */',
      'export function create(cfg: Config): string { return cfg.name }',
      'describe("test", () => { it("works", () => { expect(1).toBe(1) }) })',
    ].join('\n')
    const unit = analyzeGearUnit(code, 'good.ts')
    expect(unit.torque).toBeGreaterThan(30)
    expect(unit.lubrication).toBeGreaterThan(30)
    expect(unit.clutchEngagement).toBeGreaterThan(20)
    expect(unit.diagnostics.fluidLevel).toBeGreaterThan(0)
  })

  it('detects issues in poor code', () => {
    const code = 'const x: any = 1\nconsole.log("debug")\neval("code")'
    const unit = analyzeGearUnit(code, 'bad.ts')
    expect(unit.friction).toBeGreaterThan(10)
    expect(unit.noise).toBeGreaterThan(10)
    expect(unit.diagnostics.hasMetalShavings).toBe(true)
    expect(unit.issues.length).toBeGreaterThan(0)
  })

  it('clamps all metrics to valid ranges', () => {
    const unit = analyzeGearUnit('export function a() {}', 'a.ts')
    for (const val of [unit.torque, unit.rpm, unit.efficiency, unit.lubrication, unit.clutchEngagement, unit.friction, unit.heatGeneration, unit.noise, unit.vibration, unit.qualityScore]) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    }
  })

  it('computes wear metrics', () => {
    const unit = analyzeGearUnit('export function a() {}', 'a.ts')
    expect(unit.wear.totalWearPercent).toBeGreaterThanOrEqual(0)
    expect(['none', 'minimal', 'moderate', 'significant', 'severe']).toContain(unit.wear.level)
  })

  it('computes power band', () => {
    const unit = analyzeGearUnit('export function a() {}', 'a.ts')
    expect(unit.powerBand.lowEnd).toBeGreaterThanOrEqual(0)
    expect(['low', 'mid', 'high', 'broad', 'narrow']).toContain(unit.powerBand.optimalRange)
  })

  it('classifies condition', () => {
    const unit = analyzeGearUnit('export function a() {}', 'a.ts')
    expect(['race-ready', 'excellent', 'good', 'fair', 'needs-service', 'failing', 'broken']).toContain(unit.condition)
  })
})

// ─── analyzeTransmissionUnit ────────────────────────────────────────────────

describe('analyzeTransmissionUnit', () => {
  it('returns empty for no units', () => {
    const trans = analyzeTransmissionUnit([], 'src')
    expect(trans.directory).toBe('src')
    expect(trans.gears).toEqual([])
    expect(trans.overallEfficiency).toBe(0)
    expect(trans.transmissionGrade).toBe('broken')
  })

  it('aggregates unit averages', () => {
    const units: GearUnit[] = [
      analyzeGearUnit('export function a() {}', 'a.ts'),
      analyzeGearUnit('/** D */ export class B {}', 'b.ts'),
    ]
    const trans = analyzeTransmissionUnit(units, 'src')
    expect(trans.gears.length).toBe(2)
    expect(trans.avgEfficiency).toBeGreaterThanOrEqual(0)
    expect(trans.totalGears).toBeGreaterThanOrEqual(0)
  })

  it('computes synchronization', () => {
    const units: GearUnit[] = [analyzeGearUnit('export function a() {}', 'a.ts')]
    const trans = analyzeTransmissionUnit(units, 'src')
    expect(trans.synchronization).toBeGreaterThanOrEqual(0)
    expect(trans.synchronization).toBeLessThanOrEqual(100)
    expect(typeof trans.isSynchronized).toBe('boolean')
  })

  it('computes transmission grade', () => {
    const units: GearUnit[] = [analyzeGearUnit('export function a() {}', 'a.ts')]
    const trans = analyzeTransmissionUnit(units, 'src')
    expect(['racing', 'performance', 'standard', 'economy', 'worn', 'broken']).toContain(trans.transmissionGrade)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: GearboxStats = {
    totalFiles: 1, totalTransmissions: 1, totalGears: 0,
    avgGearRatio: 1, avgTorque: 50, avgRPM: 50, avgEfficiency: 50,
    avgLubrication: 50, avgClutchEngagement: 50, avgFriction: 30,
    avgHeatGeneration: 30, avgNoise: 30, avgVibration: 30, avgFluidLevel: 50,
    grindingUnits: 0, slippingUnits: 0, overheatingUnits: 0,
    raceReadyCount: 0, brokenCount: 0, totalWear: 0,
    isSynchronized: true, overallEfficiency: 50,
    mechanicGrade: 'mechanic',
    bestUnit: 'none', worstUnit: 'none', mostPowerful: 'none', smoothest: 'none',
  }

  it('praises high efficiency', () => {
    const recs = generateRecommendations([], [], { ...baseStats, overallEfficiency: 80 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('smoothly')]))
  })

  it('recommends fixing grinding', () => {
    const recs = generateRecommendations([], [], { ...baseStats, grindingUnits: 3 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Grinding')]))
  })

  it('recommends fixing overheating', () => {
    const recs = generateRecommendations([], [], { ...baseStats, overheatingUnits: 2 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Overheating')]))
  })

  it('recommends adding fluid', () => {
    const recs = generateRecommendations([], [], { ...baseStats, avgFluidLevel: 20 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('fluid')]))
  })
})

// ─── buildGearboxResult ─────────────────────────────────────────────────────

describe('buildGearboxResult', () => {
  it('handles empty input', () => {
    const result = buildGearboxResult([], [], {})
    expect(result.units).toEqual([])
    expect(result.transmissions).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', () => {
    const result = buildGearboxResult(['a.ts'], ['export function a() {}'], {})
    expect(result.units).toHaveLength(1)
    expect(result.units[0].file).toBe('a.ts')
    expect(result.units[0].qualityScore).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildGearboxResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['export function a() {}', '/** D */ export class B {}', 'const x: any = 1'],
      {},
    )
    expect(result.units).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups into transmissions by directory', () => {
    const result = buildGearboxResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.transmissions.length).toBe(2)
    const dirs = result.transmissions.map(t => t.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('computes best/worst/mostPowerful/smoothest', () => {
    const result = buildGearboxResult(
      ['good.ts', 'bad.ts'],
      ['/** Docs */ export function good() {} interface I {}', 'const x: any = 1'],
      {},
    )
    expect(result.stats.bestUnit).toBe('good.ts')
    expect(result.stats.worstUnit).toBe('bad.ts')
  })

  it('computes mechanic grade', () => {
    const result = buildGearboxResult(['a.ts'], ['export function a() {}'], {})
    expect(['f1-engineer', 'master-mechanic', 'mechanic', 'apprentice', 'shade-tree', 'clueless']).toContain(result.stats.mechanicGrade)
  })

  it('clamps overall efficiency', () => {
    const result = buildGearboxResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.overallEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallEfficiency).toBeLessThanOrEqual(100)
  })
})

// ─── formatGearboxTable ─────────────────────────────────────────────────────

describe('formatGearboxTable', () => {
  it('formats empty result', () => {
    const result = buildGearboxResult([], [], {})
    const output = formatGearboxTable(result, false)
    expect(output).toContain('Gearbox')
    expect(output).toContain('No gear units detected')
  })

  it('includes unit info', () => {
    const result = buildGearboxResult(['a.ts'], ['export function a() {}'], {})
    const output = formatGearboxTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildGearboxResult(['a.ts'], ['export function a() {}'], {})
    const output = formatGearboxTable(result, true)
    expect(output).toContain('ratio:')
    expect(output).toContain('power:')
  })

  it('truncates at 15 in non-verbose', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildGearboxResult(files, codes, {})
    const output = formatGearboxTable(result, false)
    expect(output).toContain('and 5 more')
  })

  it('shows transmissions', () => {
    const result = buildGearboxResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    const output = formatGearboxTable(result, false)
    expect(output).toContain('Transmissions')
    expect(output).toContain('src')
  })

  it('shows recommendations', () => {
    const result = buildGearboxResult([], [], {})
    const output = formatGearboxTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatGearboxJson ──────────────────────────────────────────────────────

describe('formatGearboxJson', () => {
  it('produces valid JSON', () => {
    const result = buildGearboxResult(['a.ts'], ['export function a() {}'], {})
    const json = formatGearboxJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.units).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildGearboxResult([], [], {})
    const json = formatGearboxJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.units).toEqual([])
    expect(parsed.transmissions).toEqual([])
  })
})
