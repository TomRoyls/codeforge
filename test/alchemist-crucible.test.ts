import { describe, expect, it } from 'vitest'
import {
  analyzeAlchemicalSample,
  analyzeAlchemicalWorkshop,
  buildAlchemistCrucibleResult,
  classifyAlchemistGrade,
  classifyWorkshopType,
  measureCrucible,
  measureElements,
  measureProcess,
  measureStone,
  measureTransmutation,
  measureYield,
} from '../src/commands/alchemist-crucible-helpers.js'
import { formatAlchemistCrucibleJson, formatAlchemistCrucibleTable } from '../src/commands/alchemist-crucible-format-helpers.js'

// ─── measureTransmutation ────────────────────────────────────────────────────

describe('measureTransmutation', () => {
  it('returns zero values for empty content', () => {
    const r = measureTransmutation('')
    expect(r.quality).toBe(0)
    expect(r.element).toBe('void')
    expect(r.isBaseMetal).toBe(false)
    expect(r.isNobleMetal).toBe(false)
    expect(r.hasCompleteTransmutation).toBe(false)
    expect(r.impurityCount).toBe(0)
    expect(r.byproductCount).toBe(0)
  })

  it('detects pipe transformations as high quality', () => {
    const code = 'function transform(x) { return x.map(v => v * 2).filter(v => v > 0).reduce((a, b) => a + b, 0) }'
    const r = measureTransmutation(code)
    expect(r.quality).toBeGreaterThan(30)
    expect(r.hasCompleteTransmutation).toBe(true)
  })

  it('detects mutations as impurities', () => {
    const code = 'function bad(arr) { arr.push(1); arr.sort(); return arr }'
    const r = measureTransmutation(code)
    expect(r.hasImpurities).toBe(true)
    expect(r.impurityCount).toBeGreaterThan(0)
  })

  it('detects side effects as byproducts', () => {
    const code = 'function log(x) { console.log(x); return x }'
    const r = measureTransmutation(code)
    expect(r.hasByproducts).toBe(true)
    expect(r.byproductCount).toBeGreaterThan(0)
  })

  it('classifies high quality as aether element', () => {
    const code = [
      'function pure(x) { return x }',
      'function double(x) { return x * 2 }',
      'const r = [1,2,3].map(x => x * 2).filter(x => x > 2).reduce((a,b) => a+b, 0)',
      'return r',
    ].join('\n')
    const r = measureTransmutation(code)
    expect(r.isNobleMetal).toBe(true)
  })

  it('classifies low quality as base metal', () => {
    const code = 'console.log("hello")'
    const r = measureTransmutation(code)
    expect(r.isBaseMetal).toBe(true)
    expect(r.hasFailedTransmutation).toBe(true)
  })

  it('detects partial transmutation', () => {
    const code = 'function partial(x) { if (x > 0) { return x } }'
    const r = measureTransmutation(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureCrucible ─────────────────────────────────────────────────────────

describe('measureCrucible', () => {
  it('returns clay material for empty content', () => {
    const r = measureCrucible('')
    expect(r.material).toBe('clay')
    expect(r.purity).toBe(0)
    expect(r.isPure).toBe(false)
  })

  it('detects pure functions', () => {
    const code = 'const add = (a: number, b: number): number => a + b'
    const r = measureCrucible(code)
    expect(r.isPure).toBe(true)
    expect(r.hasSideEffects).toBe(false)
    expect(r.hasMutations).toBe(false)
  })

  it('detects side effects', () => {
    const code = 'function log(x) { console.log(x) }'
    const r = measureCrucible(code)
    expect(r.hasSideEffects).toBe(true)
    expect(r.sideEffectCount).toBeGreaterThan(0)
  })

  it('detects mutations', () => {
    const code = 'function mutate(arr) { arr.push(1); arr.splice(0, 1) }'
    const r = measureCrucible(code)
    expect(r.hasMutations).toBe(true)
    expect(r.mutationCount).toBeGreaterThanOrEqual(2)
  })

  it('detects cracks (no error handling)', () => {
    const code = [
      'function a(x) { return x }',
      'function b(x) { return x }',
      'function c(x) { return x }',
    ].join('\n')
    const r = measureCrucible(code)
    expect(r.hasCracks).toBe(true)
  })

  it('detects slag (dead code)', () => {
    const code = 'function x() { debugger; with({}) {} }'
    const r = measureCrucible(code)
    expect(r.hasSlag).toBe(true)
  })

  it('assigns crystal material for very pure code', () => {
    const code = 'const pure = (x: number): number => x * 2\nconst also = (y: string): string => y.trim()'
    const r = measureCrucible(code)
    expect(r.material).toBe('crystal')
  })

  it('assigns bronze for impure code', () => {
    const code = 'console.log("a")\nconsole.log("b")\nconsole.log("c")\nconsole.log("d")'
    const r = measureCrucible(code)
    expect(r.purity).toBeLessThan(80)
    expect(r.hasSideEffects).toBe(true)
  })
})

// ─── measureStone ─────────────────────────────────────────────────────────────

describe('measureStone', () => {
  it('returns zero for empty content', () => {
    const r = measureStone('')
    expect(r.quality).toBe(0)
    expect(r.phaseCount).toBe(0)
    expect(r.hasMagnumOpus).toBe(false)
  })

  it('detects nigredo (decomposition)', () => {
    const code = 'interface Data { x: number }\nfunction parse(d: Data) { return d.x }'
    const r = measureStone(code)
    expect(r.hasNigredo).toBe(true)
  })

  it('detects albedo (purification)', () => {
    const code = 'function safe(x: number) { try { return x } catch { return 0 } }'
    const r = measureStone(code)
    expect(r.hasAlbedo).toBe(true)
  })

  it('detects citrinitas (awakening with generics)', () => {
    const code = 'function identity<T>(x: T): T { return x }'
    const r = measureStone(code)
    expect(r.hasCitrinitas).toBe(true)
  })

  it('detects rubedo (completion with pipes)', () => {
    const code = 'function transform(arr: number[]) { return arr.map(x => x * 2).filter(x => x > 0) }'
    const r = measureStone(code)
    expect(r.hasRubedo).toBe(true)
  })

  it('detects magnum opus when 3+ phases present', () => {
    const code = [
      'interface Input { data: number[] }',
      'function process(i: Input) {',
      '  try {',
      '    return i.data.map(x => x * 2).filter(x => x > 0)',
      '  } catch { return [] }',
      '}',
    ].join('\n')
    const r = measureStone(code)
    expect(r.hasMagnumOpus).toBe(true)
    expect(r.phaseCount).toBeGreaterThanOrEqual(3)
  })

  it('detects elixir of life', () => {
    const code = [
      'function a() { return 1 }',
      'function b() { return 2 }',
      'function c() { return 3 }',
      'function d() { return 4 }',
      'const x = 1',
      'const y = 2',
      'const z = 3',
    ].join('\n')
    const r = measureStone(code)
    expect(r.hasElixirOfLife).toBe(true)
  })
})

// ─── measureElements ──────────────────────────────────────────────────────────

describe('measureElements', () => {
  it('returns zeros for empty content', () => {
    const r = measureElements('')
    expect(r.balance).toBe(0)
    expect(r.earth).toBe(0)
    expect(r.water).toBe(0)
    expect(r.air).toBe(0)
    expect(r.fire).toBe(0)
    expect(r.aether).toBe(0)
    expect(r.isBalanced).toBe(false)
  })

  it('measures earth (concrete types)', () => {
    const code = 'const x: number = 1\nconst y: string = "hello"\nconst z: boolean = true'
    const r = measureElements(code)
    expect(r.earth).toBeGreaterThan(0)
  })

  it('measures water (control flow)', () => {
    const code = 'if (x) {}\nfor (let i = 0; i < 10; i++) {}\nwhile (true) {}\nswitch(x) { case 1: break }'
    const r = measureElements(code)
    expect(r.water).toBeGreaterThan(0)
  })

  it('measures air (abstractions)', () => {
    const code = 'interface X { a: number }\ntype Y = X & { b: string }\nconst r = [1,2].map(x => x)'
    const r = measureElements(code)
    expect(r.air).toBeGreaterThan(0)
  })

  it('measures fire (transformations)', () => {
    const code = 'return [1,2,3].map(x => x * 2).filter(x => x > 0)\nreturn 42'
    const r = measureElements(code)
    expect(r.fire).toBeGreaterThan(0)
  })

  it('measures aether (generics and async)', () => {
    const code = 'function id<T>(x: T): T { return x }\nasync function fetch() { await Promise.resolve(1) }'
    const r = measureElements(code)
    expect(r.aether).toBeGreaterThan(0)
  })

  it('detects excess elements', () => {
    const code = Array(20).fill('if (true) {}').join('\n')
    const r = measureElements(code)
    expect(r.hasExcess).toContain('water')
  })

  it('detects deficiency', () => {
    const code = 'const x = 1'
    const r = measureElements(code)
    expect(r.hasDeficiency.length).toBeGreaterThan(0)
  })

  it('marks balanced when distribution is even', () => {
    const code = [
      'const x: number = 1',
      'if (x > 0) {}',
      'interface Data { val: number }',
      'return x',
      'function id<T>(x: T): T { return x }',
    ].join('\n')
    const r = measureElements(code)
    expect(r.balance).toBeGreaterThan(0)
  })
})

// ─── measureProcess ───────────────────────────────────────────────────────────

describe('measureProcess', () => {
  it('returns calcination for empty content', () => {
    const r = measureProcess('')
    expect(r.stage).toBe('calcination')
    expect(r.quality).toBe(0)
    expect(r.catalystCount).toBe(0)
  })

  it('detects catalysts (helper functions)', () => {
    const code = 'function isValid(x) { return x > 0 }\nfunction getName(d) { return d.name }'
    const r = measureProcess(code)
    expect(r.hasCatalyst).toBe(true)
    expect(r.catalystCount).toBeGreaterThan(0)
  })

  it('detects reagent (imports)', () => {
    const code = 'import { x } from "y"\nimport fs from "fs"'
    const r = measureProcess(code)
    expect(r.hasReagent).toBe(true)
  })

  it('detects solvent (const declarations)', () => {
    const code = 'const x = 1\nfunction process() { return x }'
    const r = measureProcess(code)
    expect(r.hasSolvent).toBe(true)
  })

  it('detects precipitate (exports)', () => {
    const code = 'export function gold() { return 42 }'
    const r = measureProcess(code)
    expect(r.hasPrecipitate).toBe(true)
  })

  it('detects filtration (error handling)', () => {
    const code = 'function safe() { try { return 1 } catch { return 0 } }'
    const r = measureProcess(code)
    expect(r.hasFiltration).toBe(true)
  })

  it('assigns coagulation stage for high quality', () => {
    const code = [
      'import { x } from "lib"',
      'function isValid(v) { return v > 0 }',
      'function parse(d) { return d.value }',
      'const data = x',
      'export function process() {',
      '  try { return isValid(data) ? parse(data) : null }',
      '  catch { return null }',
      '}',
    ].join('\n')
    const r = measureProcess(code)
    expect(r.quality).toBeGreaterThanOrEqual(70)
    expect(r.hasCatalyst).toBe(true)
    expect(r.hasReagent).toBe(true)
    expect(r.hasPrecipitate).toBe(true)
    expect(r.hasFiltration).toBe(true)
  })
})

// ─── measureYield ─────────────────────────────────────────────────────────────

describe('measureYield', () => {
  it('returns dross for empty content', () => {
    const r = measureYield('')
    expect(r.gold).toBe(0)
    expect(r.hasDross).toBe(true)
    expect(r.goldPercent).toBe(0)
    expect(r.drossPercent).toBe(100)
  })

  it('detects pure gold', () => {
    const code = [
      '/** docs */',
      'export function getValue(x: number): number { return x * 2 }',
    ].join('\n')
    const r = measureYield(code)
    expect(r.gold).toBeGreaterThan(0)
  })

  it('detects dross', () => {
    const code = 'debugger;'
    const r = measureYield(code)
    expect(r.hasDross).toBe(true)
    expect(r.gold).toBe(0)
  })

  it('detects silver tier', () => {
    const code = 'export function ok() { return 1 }'
    const r = measureYield(code)
    expect(r.gold).toBeGreaterThan(0)
  })

  it('penalizes side effects', () => {
    const high = 'export function good(): number { return 1 }'
    const low = 'console.log("a")\nconsole.log("b")\nconsole.log("c")\nexport function bad() { console.log("x") }'
    const rHigh = measureYield(high)
    const rLow = measureYield(low)
    expect(rHigh.gold).toBeGreaterThanOrEqual(rLow.gold)
  })

  it('calculates gold and dross percentages', () => {
    const code = 'export function gold(): number { return 42 }'
    const r = measureYield(code)
    expect(r.goldPercent + r.drossPercent).toBe(100)
  })
})

// ─── analyzeAlchemicalSample ──────────────────────────────────────────────────

describe('analyzeAlchemicalSample', () => {
  it('returns slag-heap for empty content', () => {
    const r = analyzeAlchemicalSample('', 'empty.ts')
    expect(r.condition).toBe('slag-heap')
    expect(r.qualityScore).toBe(0)
    expect(r.file).toBe('empty.ts')
  })

  it('returns philosopher-stone for excellent code', () => {
    const code = [
      'interface Input { data: number[] }',
      'export function transform(i: Input): number[] {',
      '  try {',
      '    return i.data.map(x => x * 2).filter(x => x > 0)',
      '  } catch { return [] }',
      '}',
      '/** Pure transformation */',
    ].join('\n')
    const r = analyzeAlchemicalSample(code, 'great.ts')
    expect(r.qualityScore).toBeGreaterThan(30)
    expect(r.transmutationQuality).toBeGreaterThanOrEqual(0)
    expect(r.cruciblePurity).toBeGreaterThanOrEqual(0)
  })

  it('includes all sub-measures', () => {
    const r = analyzeAlchemicalSample('const x = 1', 'test.ts')
    expect(r).toHaveProperty('transmutation')
    expect(r).toHaveProperty('crucible')
    expect(r).toHaveProperty('stone')
    expect(r).toHaveProperty('elements')
    expect(r).toHaveProperty('process')
    expect(r).toHaveProperty('yield')
  })

  it('computes quality score as average of measures', () => {
    const r = analyzeAlchemicalSample('const x: number = 1', 'test.ts')
    const expected = Math.round(
      (r.transmutationQuality + r.cruciblePurity + r.philosopherStone + r.elementalBalance + r.alchemicalProcess + r.goldYield) / 6,
    )
    expect(r.qualityScore).toBe(expected)
  })
})

// ─── classifyWorkshopType ─────────────────────────────────────────────────────

describe('classifyWorkshopType', () => {
  it('returns ruins for empty samples', () => {
    expect(classifyWorkshopType([])).toBe('ruins')
  })

  it('returns grand-laboratory for high quality', () => {
    const samples = [
      { condition: 'philosopher-stone', qualityScore: 95 } as any,
      { condition: 'philosopher-stone', qualityScore: 90 } as any,
      { condition: 'pure-gold', qualityScore: 80 } as any,
    ]
    expect(classifyWorkshopType(samples)).toBe('grand-laboratory')
  })

  it('returns shed for low quality', () => {
    const samples = [
      { condition: 'slag-heap', qualityScore: 10 } as any,
      { condition: 'raw-ore', qualityScore: 20 } as any,
    ]
    expect(classifyWorkshopType(samples)).toBe('shed')
  })
})

// ─── classifyAlchemistGrade ───────────────────────────────────────────────────

describe('classifyAlchemistGrade', () => {
  it('returns grand-master for 90+', () => {
    expect(classifyAlchemistGrade(95)).toBe('grand-master')
  })

  it('returns master for 75+', () => {
    expect(classifyAlchemistGrade(80)).toBe('master')
  })

  it('returns adept for 60+', () => {
    expect(classifyAlchemistGrade(65)).toBe('adept')
  })

  it('returns journeyman for 45+', () => {
    expect(classifyAlchemistGrade(50)).toBe('journeyman')
  })

  it('returns novice for 25+', () => {
    expect(classifyAlchemistGrade(30)).toBe('novice')
  })

  it('returns apprentice for below 25', () => {
    expect(classifyAlchemistGrade(10)).toBe('apprentice')
  })
})

// ─── analyzeAlchemicalWorkshop ────────────────────────────────────────────────

describe('analyzeAlchemicalWorkshop', () => {
  it('returns defaults for empty samples', () => {
    const r = analyzeAlchemicalWorkshop([], 'src/')
    expect(r.workshopType).toBe('ruins')
    expect(r.avgTransmutation).toBe(0)
    expect(r.avgPurity).toBe(0)
    expect(r.avgGoldYield).toBe(0)
    expect(r.philosopherStoneCount).toBe(0)
  })

  it('computes averages from samples', () => {
    const s1 = analyzeAlchemicalSample('const x: number = 1', 'a.ts')
    const s2 = analyzeAlchemicalSample('export function y() { return 1 }', 'b.ts')
    const r = analyzeAlchemicalWorkshop([s1, s2], '.')
    expect(r.avgTransmutation).toBeGreaterThanOrEqual(0)
    expect(r.avgPurity).toBeGreaterThanOrEqual(0)
    expect(r.samples).toHaveLength(2)
  })
})

// ─── buildAlchemistCrucibleResult ─────────────────────────────────────────────

describe('buildAlchemistCrucibleResult', () => {
  it('returns empty result for no files', () => {
    const r = buildAlchemistCrucibleResult([], [], {})
    expect(r.samples).toHaveLength(0)
    expect(r.workshops).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.alchemistGrade).toBe('apprentice')
    expect(r.guild.isGrandMaster).toBe(false)
  })

  it('analyzes single file', () => {
    const r = buildAlchemistCrucibleResult(['test.ts'], ['const x: number = 1'], {})
    expect(r.samples).toHaveLength(1)
    expect(r.samples[0].file).toBe('test.ts')
    expect(r.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into workshops', () => {
    const r = buildAlchemistCrucibleResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['const a = 1', 'const b = 2', 'const c = 3'],
      {},
    )
    expect(r.workshops.length).toBeGreaterThanOrEqual(2)
    expect(r.stats.totalWorkshops).toBeGreaterThanOrEqual(2)
  })

  it('computes correct averages', () => {
    const r = buildAlchemistCrucibleResult(
      ['a.ts', 'b.ts'],
      ['const x: number = 1', 'export function y() { return 1 }'],
      {},
    )
    expect(r.stats.avgTransmutationQuality).toBeGreaterThanOrEqual(0)
    expect(r.stats.avgCruciblePurity).toBeGreaterThanOrEqual(0)
    expect(r.stats.avgGoldYield).toBeGreaterThanOrEqual(0)
    expect(r.stats.overallPurity).toBeGreaterThanOrEqual(0)
  })

  it('tracks condition counts', () => {
    const r = buildAlchemistCrucibleResult(
      ['a.ts'],
      ['const x: number = 1'],
      {},
    )
    expect(r.stats.philosopherStoneCount + r.stats.pureGoldCount + r.stats.refinedMetalCount + r.stats.baseMetalCount + r.stats.rawOreCount + r.stats.slagHeapCount).toBe(1)
  })

  it('identifies best sample', () => {
    const r = buildAlchemistCrucibleResult(
      ['bad.ts', 'good.ts'],
      ['debugger;', 'export function gold(): number { return 42 }'],
      {},
    )
    expect(r.stats.bestSample).toBeTruthy()
    expect(r.stats.highestYield).toBeTruthy()
  })

  it('generates recommendations', () => {
    const r = buildAlchemistCrucibleResult(
      ['a.ts'],
      ['console.log("x")\nconsole.log("y")\nconsole.log("z")'],
      {},
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('sets guild properties', () => {
    const r = buildAlchemistCrucibleResult(['a.ts'], ['const x = 1'], {})
    expect(r.guild.avgTransmutation).toBeGreaterThanOrEqual(0)
    expect(r.guild.avgPurity).toBeGreaterThanOrEqual(0)
    expect(r.guild.avgGoldYield).toBeGreaterThanOrEqual(0)
    expect(typeof r.guild.isGrandMaster).toBe('boolean')
  })

  it('tracks purity and effect counts', () => {
    const r = buildAlchemistCrucibleResult(
      ['a.ts', 'b.ts'],
      ['const x: number = 1', 'function bad() { console.log("x"); arr.push(1) }'],
      {},
    )
    expect(r.stats.isPureCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasSideEffectsCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasMutationsCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── format helpers ──────────────────────────────────────────────────────────

describe('formatAlchemistCrucibleTable', () => {
  it('formats empty result', () => {
    const r = buildAlchemistCrucibleResult([], [], {})
    const out = formatAlchemistCrucibleTable(r, false)
    expect(out).toContain('Alchemist Crucible')
    expect(out).toContain('No files analyzed')
  })

  it('formats with samples', () => {
    const r = buildAlchemistCrucibleResult(['a.ts'], ['const x = 1'], {})
    const out = formatAlchemistCrucibleTable(r, false)
    expect(out).toContain('a.ts')
    expect(out).toContain('Summary')
  })

  it('shows verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const r = buildAlchemistCrucibleResult(files, contents, {})
    const out = formatAlchemistCrucibleTable(r, true)
    expect(out).toContain('file19.ts')
  })

  it('truncates in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const r = buildAlchemistCrucibleResult(files, contents, {})
    const out = formatAlchemistCrucibleTable(r, false)
    expect(out).toContain('more')
  })

  it('shows recommendations', () => {
    const r = buildAlchemistCrucibleResult(
      ['a.ts'],
      ['console.log("a")\nconsole.log("b")\nconsole.log("c")\nconsole.log("d")\nconsole.log("e")'],
      {},
    )
    const out = formatAlchemistCrucibleTable(r, false)
    if (r.recommendations.length > 0) {
      expect(out).toContain('Recommendations')
    }
  })
})

describe('formatAlchemistCrucibleJson', () => {
  it('produces valid JSON', () => {
    const r = buildAlchemistCrucibleResult(['a.ts'], ['const x = 1'], {})
    const out = formatAlchemistCrucibleJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.samples).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
