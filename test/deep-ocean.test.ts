import { describe, expect, it } from 'vitest'

import {
  analyzeOceanBasin,
  analyzeOceanDepth,
  buildDeepOceanResult,
  classifyBasinCondition,
  classifyBasinType,
  classifyDepthCondition,
  classifyOceanographerGrade,
  countAsync,
  countAwait,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countEnums,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countNestingDepth,
  countReturnTypes,
  countSideEffects,
  countTodos,
  countTypeAnnotations,
  countTypes,
  generateRecommendations,
  measureAbyssal,
  measureBioluminescence,
  measureCurrent,
  measureLife,
  measurePressure,
  measureSurface,
  measureThermal,
  measureZone,
  type DeepOceanStats,
  type OceanDepth,
} from '../src/commands/deep-ocean-helpers.js'
import { formatDeepOceanCsv, formatDeepOceanJson, formatDeepOceanTable } from '../src/commands/deep-ocean-format-helpers.js'

// ─── Utility Helpers ────────────────────────────────────

describe('deep-ocean utility helpers', () => {
  it('counts lines of code', () => {
    expect(countLoc('const x = 1\n\nconst y = 2')).toBe(2)
    expect(countLoc('')).toBe(0)
  })

  it('counts functions', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
    expect(countFunctions('')).toBe(0)
  })

  it('counts classes', () => {
    expect(countClasses('class Foo {}')).toBe(1)
    expect(countClasses('')).toBe(0)
  })

  it('counts interfaces', () => {
    expect(countInterfaces('interface Config {}')).toBe(1)
    expect(countInterfaces('')).toBe(0)
  })

  it('counts exports', () => {
    expect(countExports('export function f() {}')).toBe(1)
    expect(countExports('')).toBe(0)
  })

  it('counts imports', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
    expect(countImports('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */\nfunction f() {}')).toBe(1)
    expect(countJSDoc('')).toBe(0)
  })

  it('counts error handling', () => {
    expect(countErrorHandling('try {} catch (e) {}')).toBe(1)
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('x: number')).toBe(1)
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts TODOs', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
    expect(countTodos('')).toBe(0)
  })

  it('counts branches', () => {
    expect(countBranches('if (x) {}')).toBe(1)
    expect(countBranches('')).toBe(0)
  })

  it('counts nesting depth', () => {
    expect(countNestingDepth('function f() { if (x) { return 1 } }')).toBe(2)
    expect(countNestingDepth('const x = 1')).toBe(0)
    expect(countNestingDepth('')).toBe(0)
  })

  it('counts return types', () => {
    expect(countReturnTypes('): number')).toBe(1)
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts side effects', () => {
    expect(countSideEffects('process.env.NODE_ENV')).toBe(1)
    expect(countSideEffects('')).toBe(0)
  })

  it('counts enums', () => {
    expect(countEnums('enum Color { Red }')).toBe(1)
    expect(countEnums('')).toBe(0)
  })

  it('counts type aliases', () => {
    expect(countTypes('type Id = string')).toBe(1)
    expect(countTypes('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log("hi")')).toBe(1)
    expect(countConsole('')).toBe(0)
  })

  it('counts descriptive names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts async', () => {
    expect(countAsync('async function f() {}')).toBe(1)
    expect(countAsync('')).toBe(0)
  })

  it('counts await', () => {
    expect(countAwait('await promise')).toBe(1)
    expect(countAwait('')).toBe(0)
  })

  it('counts comments', () => {
    expect(countComments('// comment')).toBe(1)
    expect(countComments('')).toBe(0)
  })
})

// ─── Zone Measurement ───────────────────────────────────

describe('deep-ocean measureZone', () => {
  it('returns sunlit-zone for simple code', () => {
    const z = measureZone('')
    expect(z.current).toBe('sunlit-zone')
    expect(z.depth).toBe(0)
  })

  it('detects photic zone with docs and types', () => {
    const code = '/** doc */\nfunction f(x: number): number { return x }'
    const z = measureZone(code)
    expect(z.hasPhoticZone).toBe(true)
  })

  it('detects aphotic zone without docs', () => {
    const lines = Array.from({ length: 15 }, (_, i) => `const v${i} = ${i}`).join('\n')
    const z = measureZone(lines)
    expect(z.hasAphoticZone).toBe(true)
  })

  it('detects thermocline with deep nesting and docs', () => {
    const code = '/** doc */\nfunction f() {\n  if (x) {\n    if (y) {\n      if (z) {\n        return 1\n      }\n    }\n  }\n}'
    const z = measureZone(code)
    expect(z.hasThermocline).toBe(true)
  })

  it('detects deeper zones', () => {
    const code = Array.from({ length: 30 }, (_, i) => `if (a${i}) {`).join('\n') + '\n}'
    const z = measureZone(code)
    expect(z.depth).toBeGreaterThan(0)
  })
})

// ─── Surface Measurement ────────────────────────────────

describe('deep-ocean measureSurface', () => {
  it('returns zero for empty content', () => {
    const s = measureSurface('')
    expect(s.clarity).toBe(0)
    expect(s.hasCalmWater).toBe(false)
  })

  it('detects calm water', () => {
    const code = 'const x = 1\nconst y = 2'
    const s = measureSurface(code)
    expect(s.hasCalmWater).toBe(true)
  })

  it('detects waves from branches', () => {
    const code = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}'
    const s = measureSurface(code)
    expect(s.hasWaves).toBe(true)
  })

  it('detects whitecaps from TODOs', () => {
    const code = '// TODO: fix\nfunction f() {}'
    const s = measureSurface(code)
    expect(s.hasWhitecaps).toBe(true)
  })

  it('detects riptide from async without error handling', () => {
    const code = 'async function f() { await fetch("/") }'
    const s = measureSurface(code)
    expect(s.hasRiptide).toBe(true)
  })
})

// ─── Pressure Measurement ───────────────────────────────

describe('deep-ocean measurePressure', () => {
  it('returns zero for empty content', () => {
    const p = measurePressure('')
    expect(p.level).toBe(0)
    expect(p.hasLowPressure).toBe(false)
  })

  it('detects low pressure for simple code', () => {
    const code = 'const x = 1'
    const p = measurePressure(code)
    expect(p.hasLowPressure).toBe(true)
  })

  it('detects crushing pressure for complex code', () => {
    const code = Array.from({ length: 12 }, (_, i) => `if (c${i}) {}`).join('\n')
    const p = measurePressure(code)
    expect(p.hasCrushingPressure).toBe(true)
  })

  it('detects moderate pressure', () => {
    const code = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}'
    const p = measurePressure(code)
    expect(p.hasModeratePressure || p.hasLowPressure).toBe(true)
  })

  it('detects pressure vents from abstractions', () => {
    const code = 'interface I {}\nclass C {}\nif (a) {}\nif (b) {}\nif (c) {}\nif (d) {}'
    const p = measurePressure(code)
    expect(p.hasPressureVents).toBe(true)
    expect(p.ventCount).toBe(2)
  })

  it('detects decompression from error handling', () => {
    const code = 'try {} catch (e) {}'
    const p = measurePressure(code)
    expect(p.hasDecompression).toBe(true)
  })
})

// ─── Bioluminescence Measurement ────────────────────────

describe('deep-ocean measureBioluminescence', () => {
  it('returns zero for empty content', () => {
    const b = measureBioluminescence('')
    expect(b.score).toBe(0)
    expect(b.hasDarkCode).toBe(false)
  })

  it('detects glowing code with docs and types', () => {
    const code = '/** doc */\nfunction f(x: number): number { return x }'
    const b = measureBioluminescence(code)
    expect(b.hasGlowingCode).toBe(true)
    expect(b.score).toBeGreaterThan(0)
  })

  it('detects dark code without docs or types', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const b = measureBioluminescence(code)
    expect(b.hasDarkCode).toBe(true)
  })

  it('detects flashing code from async', () => {
    const code = 'async function load() { await fetch("/") }'
    const b = measureBioluminescence(code)
    expect(b.hasFlashingCode).toBe(true)
  })

  it('detects angler fish without descriptive names', () => {
    const code = 'function f() {}\nfunction g() {}\nfunction h() {}'
    const b = measureBioluminescence(code)
    expect(b.hasAnglerFish).toBe(true)
  })

  it('detects deep stings from side effects', () => {
    const code = 'console.log("debug")\nfunction f() {}'
    const b = measureBioluminescence(code)
    expect(b.hasDeepStings).toBe(true)
    expect(b.stingCount).toBeGreaterThan(0)
  })
})

// ─── Current Measurement ────────────────────────────────

describe('deep-ocean measureCurrent', () => {
  it('returns surface direction for empty content', () => {
    const c = measureCurrent('')
    expect(c.strength).toBe(0)
    expect(c.direction).toBe('surface')
  })

  it('detects gulf stream with imports/exports/functions', () => {
    const code = "import { x } from 'y'\nexport function f(): number { return x }"
    const c = measureCurrent(code)
    expect(c.hasGulfStream).toBe(true)
    expect(c.isNavigable).toBe(true)
  })

  it('detects whirlpool from many imports no exports', () => {
    const imports = Array.from({ length: 7 }, (_, i) => `import { m${i} } from 'mod${i}'`).join('\n')
    const c = measureCurrent(imports)
    expect(c.hasWhirlpool).toBe(true)
  })

  it('detects undertow from side effects', () => {
    const code = 'process.env.NODE_ENV\nconst x = 1'
    const c = measureCurrent(code)
    expect(c.hasUndertow).toBe(true)
  })

  it('detects rip current from async without error handling', () => {
    const code = 'async function f() { await load() }'
    const c = measureCurrent(code)
    expect(c.hasRipCurrent).toBe(true)
  })

  it('detects thermohaline with balanced imports/exports', () => {
    const code = "import { x } from 'y'\nimport { z } from 'w'\nexport { x }\nexport { z }"
    const c = measureCurrent(code)
    expect(c.direction).toBe('thermohaline')
  })
})

// ─── Thermal Measurement ────────────────────────────────

describe('deep-ocean measureThermal', () => {
  it('returns zero for empty content', () => {
    const t = measureThermal('')
    expect(t.temperature).toBe(0)
  })

  it('detects hot vents from active code', () => {
    const code = Array.from({ length: 10 }, (_, i) => `function f${i}() {}`).join('\n')
    const t = measureThermal(code)
    expect(t.hasHotVents).toBe(true)
  })

  it('detects cold seeps from inactive code', () => {
    const code = 'const x = 1'
    const t = measureThermal(code)
    expect(t.hasColdSeeps).toBe(true)
  })

  it('detects thermal gradient', () => {
    const code = 'function f() {}\nfunction g() {}\nfunction h() {}\nfunction k() {}\nif (a) {}'
    const t = measureThermal(code)
    expect(t.hasThermalGradient).toBe(true)
  })

  it('detects isothermal for simple code', () => {
    const code = 'function f() {}\nconst x = 1'
    const t = measureThermal(code)
    expect(t.isIsothermal).toBe(true)
  })
})

// ─── Life Measurement ───────────────────────────────────

describe('deep-ocean measureLife', () => {
  it('returns zero for empty content', () => {
    const l = measureLife('')
    expect(l.diversity).toBe(0)
    expect(l.hasPlankton).toBe(false)
  })

  it('detects plankton from many small functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const l = measureLife(code)
    expect(l.hasPlankton).toBe(true)
    expect(l.planktonCount).toBe(4)
  })

  it('detects whales from classes with functions', () => {
    const code = 'class C {}\nfunction a() {}\nfunction b() {}\nfunction c() {}'
    const l = measureLife(code)
    expect(l.hasWhales).toBe(true)
    expect(l.whaleCount).toBe(1)
  })

  it('detects squid from deep nesting', () => {
    const code = 'function f() {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n          return 1\n        }\n      }\n    }\n  }\n}'
    const l = measureLife(code)
    expect(l.hasSquid).toBe(true)
  })

  it('detects coral from interfaces and functions', () => {
    const code = 'interface I {}\nfunction f() {}'
    const l = measureLife(code)
    expect(l.hasCoral).toBe(true)
  })

  it('detects sharks from TODOs and console', () => {
    const code = '// TODO\n// TODO\n// TODO\nconsole.log()\nconsole.log()\nconsole.log()\nconsole.log()'
    const l = measureLife(code)
    expect(l.hasSharks).toBe(true)
    expect(l.sharkCount).toBeGreaterThan(0)
  })

  it('detects jellyfish from async without error handling', () => {
    const code = 'async function f() { await load() }'
    const l = measureLife(code)
    expect(l.hasJellyfish).toBe(true)
  })
})

// ─── Abyssal Measurement ────────────────────────────────

describe('deep-ocean measureAbyssal', () => {
  it('returns zero for empty content', () => {
    const a = measureAbyssal('')
    expect(a.stability).toBe(0)
  })

  it('detects seafloor from interfaces and types', () => {
    const code = 'interface Config {}\nfunction f(x: number): number { return x }'
    const a = measureAbyssal(code)
    expect(a.hasSeafloor).toBe(true)
  })

  it('detects mountains from classes', () => {
    const code = 'class Service {}'
    const a = measureAbyssal(code)
    expect(a.hasMountains).toBe(true)
    expect(a.mountainCount).toBe(1)
  })

  it('detects trenches from deep nesting', () => {
    const code = 'function f() {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n          if (e) { return 1 }\n        }\n      }\n    }\n  }\n}'
    const a = measureAbyssal(code)
    expect(a.hasTrenches).toBe(true)
    expect(a.trenchCount).toBe(1)
  })

  it('detects plains from shallow code', () => {
    const code = 'const x = 1'
    const a = measureAbyssal(code)
    expect(a.hasPlains).toBe(true)
  })

  it('detects volcanic activity from TODOs', () => {
    const code = '// TODO: fix\nfunction f() {}'
    const a = measureAbyssal(code)
    expect(a.hasVolcanicActivity).toBe(true)
  })
})

// ─── Depth Analysis ─────────────────────────────────────

describe('deep-ocean analyzeOceanDepth', () => {
  it('analyzes a well-documented file', () => {
    const code = [
      '/** Config */',
      'export interface Config { value: number }',
      '/** Process */',
      'export function process(c: Config): number {',
      '  try { return c.value } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const d = analyzeOceanDepth(code, 'src/config.ts')
    expect(d.qualityScore).toBeGreaterThan(30)
    expect(d.file).toBe('src/config.ts')
    expect(typeof d.depth).toBe('number')
    expect(typeof d.pressure).toBe('number')
    expect(typeof d.bioluminescence).toBe('number')
  })

  it('analyzes poorly written file', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const d = analyzeOceanDepth(code, 'bad.ts')
    expect(d.qualityScore).toBeLessThan(60)
  })
})

// ─── Classification ─────────────────────────────────────

describe('deep-ocean classifyDepthCondition', () => {
  it('classifies crystal-clear-waters', () => {
    const surface = { clarity: 90, hasWaves: false, hasWhitecaps: false, hasCalmWater: true, hasRiptide: false, clarityScore: 90 }
    const pressure = { level: 10, hasCrushingPressure: false, hasModeratePressure: false, hasLowPressure: true, hasPressureVents: false, ventCount: 0, hasDecompression: true }
    expect(classifyDepthCondition(85, surface, pressure)).toBe('crystal-clear-waters')
  })

  it('classifies clear-ocean', () => {
    const surface = { clarity: 70, hasWaves: true, hasWhitecaps: false, hasCalmWater: false, hasRiptide: false, clarityScore: 70 }
    const pressure = { level: 20, hasCrushingPressure: false, hasModeratePressure: false, hasLowPressure: true, hasPressureVents: false, ventCount: 0, hasDecompression: true }
    expect(classifyDepthCondition(70, surface, pressure)).toBe('clear-ocean')
  })

  it('classifies dead-sea for very low score', () => {
    const surface = { clarity: 5, hasWaves: false, hasWhitecaps: true, hasCalmWater: false, hasRiptide: true, clarityScore: 5 }
    const pressure = { level: 80, hasCrushingPressure: true, hasModeratePressure: false, hasLowPressure: false, hasPressureVents: false, ventCount: 0, hasDecompression: false }
    expect(classifyDepthCondition(5, surface, pressure)).toBe('dead-sea')
  })
})

// ─── Basin Analysis ─────────────────────────────────────

describe('deep-ocean analyzeOceanBasin', () => {
  it('handles empty depths', () => {
    const b = analyzeOceanBasin([], 'src/')
    expect(b.basinType).toBe('dead-sea')
    expect(b.condition).toBe('toxic-dump')
  })

  it('computes averages', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }'
    const depths = [analyzeOceanDepth(code, 'a.ts'), analyzeOceanDepth(code, 'b.ts')]
    const b = analyzeOceanBasin(depths, 'src/')
    expect(b.depths.length).toBe(2)
    expect(b.avgDepth).toBeGreaterThan(0)
  })
})

// ─── Basin Classification ───────────────────────────────

describe('deep-ocean basin classification', () => {
  it('classifies pristine-ocean', () => {
    expect(classifyBasinCondition(70)).toBe('pristine-ocean')
  })
  it('classifies healthy-sea', () => {
    expect(classifyBasinCondition(55)).toBe('healthy-sea')
  })
  it('classifies coastal-waters', () => {
    expect(classifyBasinCondition(40)).toBe('coastal-waters')
  })
  it('classifies polluted-bay', () => {
    expect(classifyBasinCondition(25)).toBe('polluted-bay')
  })
  it('classifies stagnant-pool', () => {
    expect(classifyBasinCondition(15)).toBe('stagnant-pool')
  })
  it('classifies toxic-dump', () => {
    expect(classifyBasinCondition(5)).toBe('toxic-dump')
  })

  it('classifies pacific-deep type', () => {
    const good = analyzeOceanDepth('/** doc */\nexport interface I {}\nexport function validateData(x: number): number {\n  try { return x } catch (e) { return 0 }\n}', 'a.ts')
    expect(classifyBasinType([good, good], 30)).toBe('pacific-deep')
  })

  it('classifies dead-sea for empty', () => {
    expect(classifyBasinType([], 0)).toBe('dead-sea')
  })
})

// ─── Oceanographer Grade ────────────────────────────────

describe('deep-ocean classifyOceanographerGrade', () => {
  it('returns chief-oceanographer for high depth', () => {
    expect(classifyOceanographerGrade(90)).toBe('chief-oceanographer')
  })
  it('returns oceanographer', () => {
    expect(classifyOceanographerGrade(70)).toBe('oceanographer')
  })
  it('returns marine-biologist', () => {
    expect(classifyOceanographerGrade(55)).toBe('marine-biologist')
  })
  it('returns diver', () => {
    expect(classifyOceanographerGrade(40)).toBe('diver')
  })
  it('returns swimmer', () => {
    expect(classifyOceanographerGrade(25)).toBe('swimmer')
  })
  it('returns landlubber', () => {
    expect(classifyOceanographerGrade(10)).toBe('landlubber')
  })
})

// ─── Recommendations ────────────────────────────────────

describe('deep-ocean generateRecommendations', () => {
  it('generates recommendations for poor code', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const result = buildDeepOceanResult(['a.ts'], [code])
    const recs = generateRecommendations(result.depths, result.basins, result.planet, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns positive message for good code', () => {
    const code = [
      '/** doc */',
      'export interface Config { value: number }',
      '/** Process */',
      'export function process(c: Config): number {',
      '  try { return c.value } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const result = buildDeepOceanResult(['a.ts'], [code])
    const recs = generateRecommendations(result.depths, result.basins, result.planet, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('deep-ocean buildDeepOceanResult', () => {
  it('handles empty input', () => {
    const result = buildDeepOceanResult([], [])
    expect(result.depths.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.oceanographerGrade).toBe('landlubber')
    expect(result.planet.overallDepth).toBe(0)
  })

  it('builds full result for multiple files', () => {
    const code1 = '/** doc */\nexport function f(x: number): number { return x }'
    const code2 = '/** doc */\ninterface Config { value: number }\nexport function process(c: Config): number { return c.value }'
    const result = buildDeepOceanResult(['src/a.ts', 'src/b.ts'], [code1, code2])
    expect(result.depths.length).toBe(2)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.planet.avgDepth).toBeGreaterThan(0)
    expect(result.stats.clearestWaters).toBeTruthy()
    expect(result.stats.deepestDive).toBeTruthy()
    expect(result.stats.strongestCurrent).toBeTruthy()
    expect(result.stats.mostStable).toBeTruthy()
    expect(result.stats.mostDangerous).toBeTruthy()
  })

  it('groups into basins by directory', () => {
    const code = '/** doc */\nexport function f(): number { return 1 }'
    const result = buildDeepOceanResult(['src/commands/a.ts', 'src/core/b.ts'], [code, code])
    expect(result.basins.length).toBe(2)
  })

  it('computes all stat counters', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }'
    const result = buildDeepOceanResult(['a.ts'], [code])
    const stats: DeepOceanStats = result.stats
    expect(typeof stats.crystalClearCount).toBe('number')
    expect(typeof stats.clearOceanCount).toBe('number')
    expect(typeof stats.coastalWatersCount).toBe('number')
    expect(typeof stats.murkyDepthsCount).toBe('number')
    expect(typeof stats.blackSmokerCount).toBe('number')
    expect(typeof stats.deadSeaCount).toBe('number')
    expect(typeof stats.sunlitZoneCount).toBe('number')
    expect(typeof stats.twilightZoneCount).toBe('number')
    expect(typeof stats.midnightZoneCount).toBe('number')
    expect(typeof stats.abyssalZoneCount).toBe('number')
    expect(typeof stats.hadalZoneCount).toBe('number')
    expect(typeof stats.hasWhirlpoolCount).toBe('number')
    expect(typeof stats.hasUndertowCount).toBe('number')
    expect(typeof stats.hasAnglerFishCount).toBe('number')
    expect(typeof stats.hasSharksCount).toBe('number')
    expect(typeof stats.hasHotVentsCount).toBe('number')
    expect(typeof stats.hasThermoclineCount).toBe('number')
    expect(typeof stats.hasSeafloorCount).toBe('number')
    expect(typeof stats.hasTrenchesCount).toBe('number')
    expect(typeof stats.navigableCount).toBe('number')
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('deep-ocean format helpers', () => {
  const code = '/** doc */\nexport function f(x: number): number { return x }'
  const result = buildDeepOceanResult(['a.ts'], [code])

  it('formats as JSON string', () => {
    const json = formatDeepOceanJson(result)
    expect(json).toContain('"depths"')
    expect(json).toContain('"stats"')
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formats as table', () => {
    const table = formatDeepOceanTable(result, false)
    expect(table).toContain('Deep Ocean Report')
    expect(table).toContain('Oceanographer Grade')
  })

  it('formats as table with verbose', () => {
    const table = formatDeepOceanTable(result, true)
    expect(table).toContain('Depth Details')
    expect(table).toContain('a.ts')
  })

  it('formats as CSV', () => {
    const csv = formatDeepOceanCsv(result)
    expect(csv).toContain('File,Depth,Pressure')
    expect(csv).toContain('a.ts')
  })
})
