import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifyGearCondition, classifyGearboxType, classifyGearboxCondition,
  classifyMechanicGrade, classifyToothProfile,
  measureTeeth, measureMesh, measureBearing, measureShaft,
  measureTransmission, detectWear,
  analyzeGear, analyzeGearbox,
  generateRecommendations, buildGearTrainResult,
} from '../src/commands/gear-train-helpers.js'
import { formatGearTrainTable, formatGearTrainJson } from '../src/commands/gear-train-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' * @example',
  ' * calc(5) // number',
  ' */',
  'export function calc(x: number): number {',
  '  try {',
  '    const result: number = helper(x)',
  '    if (result > 0) { return result }',
  '    return 0',
  '  } catch (err) {',
  '    throw new Error("fail")',
  '  }',
  '}',
  'export interface CalcOptions { value: number; label: string }',
  'export type CalcResult = number | string',
].join('\n')

const noExportCode = [
  'const a = 1',
  'const b = 2',
  'const c = 3',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function a() { return 1 }',
].join('\n')

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

const noisyCode = [
  'console.log("a")',
  'console.log("b")',
  'console.log("c")',
  'console.log("d")',
  'export function f() {}',
].join('\n')

const heavyImportCode = [
  'import { a } from "a"',
  'import { b } from "b"',
  'import { c } from "c"',
  'import { d } from "d"',
  'import { e } from "e"',
  'import { f } from "f"',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('gear-train primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts imports', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts exports', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('gear-train classifications', () => {
  it('classifyGearCondition returns correct conditions', () => {
    expect(classifyGearCondition(90)).toBe('precision-engineered')
    expect(classifyGearCondition(75)).toBe('well-machined')
    expect(classifyGearCondition(55)).toBe('serviceable')
    expect(classifyGearCondition(35)).toBe('worn')
    expect(classifyGearCondition(15)).toBe('grinding')
    expect(classifyGearCondition(5)).toBe('seized')
  })

  it('classifyGearboxType returns correct types', () => {
    expect(classifyGearboxType([])).toBe('fixed-ratio')
  })

  it('classifyGearboxCondition returns correct conditions', () => {
    expect(classifyGearboxCondition(85)).toBe('smooth-running')
    expect(classifyGearboxCondition(65)).toBe('efficient')
    expect(classifyGearboxCondition(45)).toBe('adequate')
    expect(classifyGearboxCondition(25)).toBe('noisy')
    expect(classifyGearboxCondition(15)).toBe('grinding')
    expect(classifyGearboxCondition(5)).toBe('broken')
  })

  it('classifyMechanicGrade returns correct grades', () => {
    expect(classifyMechanicGrade(85)).toBe('master-machinist')
    expect(classifyMechanicGrade(70)).toBe('mechanic')
    expect(classifyMechanicGrade(50)).toBe('tinkerer')
    expect(classifyMechanicGrade(35)).toBe('apprentice')
    expect(classifyMechanicGrade(18)).toBe('butcher')
    expect(classifyMechanicGrade(5)).toBe('scrap-dealer')
  })

  it('classifyToothProfile returns correct profiles', () => {
    expect(classifyToothProfile(75, 70)).toBe('involute')
    expect(classifyToothProfile(60, 55)).toBe('cycloidal')
    expect(classifyToothProfile(40, 40)).toBe('triangular')
    expect(classifyToothProfile(20, 20)).toBe('rough')
    expect(classifyToothProfile(5, 5)).toBe('broken')
  })

  it('classifyGearboxType detects broken gearbox', () => {
    const seizedGears = Array.from({ length: 3 }, () => analyzeGear('', 'x.ts'))
    expect(classifyGearboxType(seizedGears)).toBe('broken')
  })

  it('classifyGearboxType detects automatic gearbox', () => {
    const goodGears = Array.from({ length: 3 }, (_, i) => analyzeGear(strongCode, `${i}.ts`))
    expect(classifyGearboxType(goodGears)).toBe('automatic')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('gear-train measurements', () => {
  it('measureTeeth returns correct structure', () => {
    const t = measureTeeth(strongCode)
    expect(t.count).toBeGreaterThan(0)
    expect(typeof t.profile).toBe('string')
    expect(t.pitch).toBeGreaterThanOrEqual(0)
    expect(t.pitch).toBeLessThanOrEqual(100)
    expect(typeof t.isWorn).toBe('boolean')
    expect(typeof t.isChipped).toBe('boolean')
    expect(typeof t.isMissing).toBe('boolean')
    expect(typeof t.wornCount).toBe('number')
    expect(typeof t.chippedCount).toBe('number')
  })

  it('measureTeeth detects worn teeth', () => {
    expect(measureTeeth(todoCode).isWorn).toBe(true)
    expect(measureTeeth(simpleCode).isWorn).toBe(false)
  })

  it('measureTeeth detects chipped teeth', () => {
    const codeWithFuncsNoTypes = 'function a() {}\nfunction b() {}'
    expect(measureTeeth(codeWithFuncsNoTypes).isChipped).toBe(true)
  })

  it('measureTeeth detects missing teeth', () => {
    const longNoExport = Array.from({ length: 25 }, (_, i) => `const x${i} = ${i}`).join('\n')
    expect(measureTeeth(longNoExport).isMissing).toBe(true)
  })

  it('measureMesh returns correct structure', () => {
    const m = measureMesh(strongCode)
    expect(m.meshingPartners).toBeGreaterThan(0)
    expect(m.meshTightness).toBeGreaterThanOrEqual(0)
    expect(typeof m.hasGrinding).toBe('boolean')
    expect(typeof m.hasSlipping).toBe('boolean')
    expect(typeof m.hasStripping).toBe('boolean')
    expect(Array.isArray(m.grindingPoints)).toBe(true)
    expect(Array.isArray(m.slipPoints)).toBe(true)
  })

  it('measureMesh detects stripping for heavy imports', () => {
    expect(measureMesh(heavyImportCode).hasStripping).toBe(true)
  })

  it('measureBearing returns correct structure', () => {
    const b = measureBearing(strongCode)
    expect(b.loadCapacity).toBeGreaterThanOrEqual(0)
    expect(b.loadCapacity).toBeLessThanOrEqual(100)
    expect(b.friction).toBeGreaterThanOrEqual(0)
    expect(b.runout).toBeGreaterThanOrEqual(0)
    expect(typeof b.isGreased).toBe('boolean')
    expect(typeof b.isSeized).toBe('boolean')
    expect(typeof b.isNoisy).toBe('boolean')
  })

  it('measureBearing detects greased bearing', () => {
    expect(measureBearing(strongCode).isGreased).toBe(true)
    expect(measureBearing(simpleCode).isGreased).toBe(false)
  })

  it('measureBearing detects noisy bearing', () => {
    expect(measureBearing(noisyCode).isNoisy).toBe(true)
  })

  it('measureShaft returns correct structure', () => {
    const s = measureShaft(strongCode)
    expect(s.diameter).toBeGreaterThanOrEqual(0)
    expect(s.length).toBeGreaterThanOrEqual(0)
    expect(typeof s.isBalanced).toBe('boolean')
    expect(typeof s.isBent).toBe('boolean')
    expect(typeof s.hasKeyway).toBe('boolean')
    expect(s.criticalSpeed).toBeGreaterThanOrEqual(0)
    expect(s.criticalSpeed).toBeLessThanOrEqual(100)
  })

  it('measureShaft detects keyway with exports', () => {
    expect(measureShaft(typedCode).hasKeyway).toBe(true)
    expect(measureShaft(noExportCode).hasKeyway).toBe(false)
  })

  it('measureShaft detects bent shaft in deeply nested code', () => {
    expect(measureShaft(deepCode).isBent).toBe(true)
  })

  it('measureTransmission returns correct structure', () => {
    const t = measureTransmission(strongCode)
    expect(t.inputTorque).toBeGreaterThanOrEqual(0)
    expect(t.outputTorque).toBeGreaterThanOrEqual(0)
    expect(typeof t.speedRatio).toBe('number')
    expect(t.efficiency).toBeGreaterThanOrEqual(0)
    expect(t.efficiency).toBeLessThanOrEqual(100)
    expect(typeof t.hasPowerLoss).toBe('boolean')
    expect(Array.isArray(t.powerLossPoints)).toBe(true)
    expect(typeof t.hasVibration).toBe('boolean')
  })

  it('measureTransmission computes speedRatio', () => {
    const t = measureTransmission(strongCode)
    expect(t.speedRatio).toBeGreaterThanOrEqual(0)
  })

  it('measureTransmission detects power loss', () => {
    const t = measureTransmission(noExportCode)
    expect(t.hasPowerLoss).toBe(true)
  })

  it('detectWear returns 0 for clean code', () => {
    expect(detectWear(emptyCode)).toBe(0)
  })

  it('detectWear increases with todos', () => {
    expect(detectWear(todoCode)).toBeGreaterThan(detectWear(simpleCode))
  })

  it('detectWear increases with console', () => {
    expect(detectWear(noisyCode)).toBeGreaterThan(detectWear(simpleCode))
  })
})

// ─── Gear Analysis Tests ──────────────────────────────────────────────────────

describe('gear-train gear analysis', () => {
  it('analyzeGear returns correct structure', () => {
    const g = analyzeGear(strongCode, 'calc.ts')
    expect(g.file).toBe('calc.ts')
    expect(g.gearRatio).toBeGreaterThanOrEqual(0)
    expect(g.meshQuality).toBeGreaterThanOrEqual(0)
    expect(g.meshQuality).toBeLessThanOrEqual(100)
    expect(g.backlash).toBeGreaterThanOrEqual(0)
    expect(g.torqueTransfer).toBeGreaterThanOrEqual(0)
    expect(g.lubrication).toBeGreaterThanOrEqual(0)
    expect(g.wear).toBeGreaterThanOrEqual(0)
    expect(g.qualityScore).toBeGreaterThanOrEqual(0)
    expect(g.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof g.condition).toBe('string')
  })

  it('strong code has better quality than empty', () => {
    const good = analyzeGear(strongCode, 'good.ts')
    const bad = analyzeGear(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('teeth info is correct', () => {
    const g = analyzeGear(strongCode, 'a.ts')
    expect(g.teeth.count).toBeGreaterThan(0)
    expect(typeof g.teeth.profile).toBe('string')
    expect(g.teeth.pitch).toBeGreaterThan(0)
  })

  it('mesh info is correct', () => {
    const g = analyzeGear(strongCode, 'a.ts')
    expect(g.mesh.meshingPartners).toBeGreaterThan(0)
    expect(typeof g.mesh.hasGrinding).toBe('boolean')
  })

  it('bearing info is correct', () => {
    const g = analyzeGear(strongCode, 'a.ts')
    expect(g.bearing.loadCapacity).toBeGreaterThan(0)
    expect(typeof g.bearing.isGreased).toBe('boolean')
  })

  it('shaft info is correct', () => {
    const g = analyzeGear(strongCode, 'a.ts')
    expect(g.shaft.diameter).toBeGreaterThan(0)
    expect(g.shaft.hasKeyway).toBe(true)
  })

  it('transmission info is correct', () => {
    const g = analyzeGear(strongCode, 'a.ts')
    expect(g.transmission.efficiency).toBeGreaterThan(0)
    expect(typeof g.transmission.hasPowerLoss).toBe('boolean')
  })

  it('empty code gear is seized', () => {
    const g = analyzeGear(emptyCode, 'empty.ts')
    expect(g.condition).toBe('seized')
    expect(g.qualityScore).toBe(0)
  })

  it('gear ratio with imports and exports', () => {
    const g = analyzeGear(strongCode, 'mod.ts')
    expect(g.gearRatio).toBeGreaterThan(0)
  })
})

// ─── Gearbox Tests ────────────────────────────────────────────────────────────

describe('gear-train gearbox analysis', () => {
  it('analyzeGearbox handles empty gears', () => {
    const gb = analyzeGearbox([], 'src')
    expect(gb.directory).toBe('src')
    expect(gb.gears).toHaveLength(0)
    expect(gb.condition).toBe('smooth-running')
  })

  it('analyzeGearbox computes averages', () => {
    const gears = [
      analyzeGear(strongCode, 'a.ts'),
      analyzeGear(typedCode, 'b.ts'),
    ]
    const gb = analyzeGearbox(gears, 'src')
    expect(gb.avgMeshQuality).toBeGreaterThanOrEqual(0)
    expect(gb.avgTorqueTransfer).toBeGreaterThanOrEqual(0)
    expect(gb.avgEfficiency).toBeGreaterThanOrEqual(0)
    expect(gb.totalFriction).toBeGreaterThanOrEqual(0)
    expect(typeof gb.gearboxType).toBe('string')
    expect(gb.transmissionEfficiency).toBeGreaterThanOrEqual(0)
    expect(typeof gb.condition).toBe('string')
  })

  it('analyzeGearbox counts conditions', () => {
    const gears = [
      analyzeGear(strongCode, 'a.ts'),
      analyzeGear(emptyCode, 'b.ts'),
    ]
    const gb = analyzeGearbox(gears, 'src')
    expect(gb.seizedCount).toBeGreaterThanOrEqual(1)
    expect(gb.precisionCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('gear-train build result', () => {
  it('buildGearTrainResult returns correct structure', () => {
    const result = buildGearTrainResult(['a.ts'], [typedCode], {})
    expect(result.gears).toHaveLength(1)
    expect(result.gearboxes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.mechanicGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.drivetrain.overallEfficiency).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildGearTrainResult([], [], {})
    expect(result.gears).toHaveLength(0)
    expect(result.stats.bestMeshed).toBe('none')
    expect(result.stats.worstMeshed).toBe('none')
    expect(result.stats.mostEfficient).toBe('none')
    expect(result.stats.mostWorn).toBe('none')
    expect(result.stats.mostComplex).toBe('none')
  })

  it('groups gears into gearboxes by directory', () => {
    const result = buildGearTrainResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.gearboxes).toHaveLength(2)
  })

  it('identifies best and worst meshed', () => {
    const result = buildGearTrainResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.bestMeshed).toBe('good.ts')
    expect(result.stats.worstMeshed).toBe('bad.ts')
  })

  it('identifies most efficient and most worn', () => {
    const result = buildGearTrainResult(
      ['clean.ts', 'messy.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.mostEfficient).toBe('clean.ts')
    expect(result.stats.mostWorn).toBe('messy.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildGearTrainResult(['a.ts'], [], {})
    expect(result.gears).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildGearTrainResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgGearRatio).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgBacklash).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgLubrication).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgWear).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgTeethCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalGrindingPoints).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalSlipPoints).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalPowerLossPoints).toBeGreaterThanOrEqual(0)
  })

  it('computes drivetrain fields', () => {
    const result = buildGearTrainResult(['a.ts'], [strongCode], {})
    expect(result.drivetrain.avgMeshQuality).toBeGreaterThanOrEqual(0)
    expect(result.drivetrain.avgTorqueTransfer).toBeGreaterThanOrEqual(0)
    expect(result.drivetrain.avgEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.drivetrain.totalFriction).toBeGreaterThanOrEqual(0)
    expect(typeof result.drivetrain.isSmooth).toBe('boolean')
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('gear-train recommendations', () => {
  it('returns array', () => {
    const result = buildGearTrainResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('warns about seized gears', () => {
    const result = buildGearTrainResult(['a.ts'], [emptyCode], {})
    if (result.stats.seized > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Seized gears')]),
      )
    }
  })

  it('includes good efficiency message', () => {
    const result = buildGearTrainResult(['a.ts'], [strongCode], {})
    if (result.stats.overallEfficiency >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Good efficiency')]),
      )
    }
  })

  it('warns about low lubrication', () => {
    const result = buildGearTrainResult(['a.ts'], [simpleCode], {})
    if (result.stats.avgLubrication < 40) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Low lubrication')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('gear-train formatters', () => {
  const sampleResult = buildGearTrainResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatGearTrainTable returns string with header', () => {
    const table = formatGearTrainTable(sampleResult, false)
    expect(table).toContain('Gear Train')
    expect(table).toContain('Gears')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatGearTrainTable verbose shows detail', () => {
    const table = formatGearTrainTable(sampleResult, true)
    expect(table).toContain('teeth:')
    expect(table).toContain('bearing:')
  })

  it('formatGearTrainTable handles empty', () => {
    const empty = buildGearTrainResult([], [], {})
    const table = formatGearTrainTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatGearTrainTable truncates gears at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildGearTrainResult(files, contents, {})
    const table = formatGearTrainTable(big, false)
    expect(table).toContain('more')
  })

  it('formatGearTrainJson returns valid JSON', () => {
    const json = formatGearTrainJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.gears).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.drivetrain).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('gear-train edge cases', () => {
  it('handles deeply nested code', () => {
    const g = analyzeGear(deepCode, 'deep.ts')
    expect(g.bearing.friction).toBeGreaterThan(0)
    expect(g.shaft.isBent).toBe(true)
  })

  it('handles code with only comments', () => {
    const g = analyzeGear('// just a comment\n/* block */', 'comment.ts')
    expect(g.teeth.pitch).toBeGreaterThan(0)
  })

  it('handles single file with no directory', () => {
    const result = buildGearTrainResult(['single.ts'], [typedCode], {})
    expect(result.gearboxes).toHaveLength(1)
    expect(result.gearboxes[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildGearTrainResult(files, contents, {})
    expect(result.gearboxes).toHaveLength(1)
    expect(result.gearboxes[0].gears).toHaveLength(3)
  })

  it('empty code has broken teeth profile', () => {
    const g = analyzeGear(emptyCode, 'empty.ts')
    expect(g.teeth.profile).toBe('broken')
  })

  it('detects vibration in branchy code', () => {
    const branchyCode = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}\nif (e) {}\nif (f) {}'
    const t = measureTransmission(branchyCode)
    expect(t.hasVibration).toBe(true)
  })
})
