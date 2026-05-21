import { describe, expect, it } from 'vitest'

import {
  analyzeGlassPanel,
  analyzeWindowBay,
  buildStainedGlassWindowResult,
  classifyBayCondition,
  classifyBayType,
  classifyGlazierGrade,
  classifyPanelCondition,
  countArrowFunctions,
  countAsync,
  countAwait,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDefaults,
  countDeprecated,
  countDescriptiveNames,
  countEnums,
  countErrorHandling,
  countExports,
  countFunctions,
  countGenerics,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countReturnTypes,
  countTodos,
  countTypeAnnotations,
  countTypes,
  generateRecommendations,
  measureColor,
  measureFrame,
  measureGlass,
  measureLead,
  measureLight,
  measurePanel,
  measureStory,
  type GlassPanel,
  type StainedGlassWindowStats,
} from '../src/commands/stained-glass-window-helpers.js'
import { formatStainedGlassWindowCsv, formatStainedGlassWindowJson, formatStainedGlassWindowTable } from '../src/commands/stained-glass-window-format-helpers.js'

// ─── Utility Helpers ────────────────────────────────────

describe('stained-glass-window utility helpers', () => {
  it('counts lines of code', () => {
    expect(countLoc('const x = 1\n\nconst y = 2')).toBe(2)
    expect(countLoc('')).toBe(0)
    expect(countLoc('  \n  \n')).toBe(0)
  })

  it('counts functions', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
    expect(countFunctions('const f = () => {}')).toBe(1)
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

  it('counts enums', () => {
    expect(countEnums('enum Color { Red }')).toBe(1)
    expect(countEnums('')).toBe(0)
  })

  it('counts type aliases', () => {
    expect(countTypes('type Id = string')).toBe(1)
    expect(countTypes('')).toBe(0)
  })

  it('counts exports', () => {
    expect(countExports('export function f() {}')).toBe(1)
    expect(countExports('function f() {}')).toBe(0)
  })

  it('counts imports', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
    expect(countImports('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */\nfunction f() {}')).toBe(1)
    expect(countJSDoc('')).toBe(0)
  })

  it('counts comments', () => {
    expect(countComments('// comment\ncode')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
    expect(countComments('')).toBe(0)
  })

  it('counts error handling', () => {
    expect(countErrorHandling('try {} catch (e) {}')).toBe(1)
    expect(countErrorHandling('throw new Error()')).toBe(1)
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('x: number')).toBe(1)
    expect(countTypeAnnotations('s: string')).toBe(1)
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts TODOs', () => {
    expect(countTodos('// TODO: fix this')).toBe(1)
    expect(countTodos('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log("hi")')).toBe(1)
    expect(countConsole('')).toBe(0)
  })

  it('counts branches', () => {
    expect(countBranches('if (x) {}')).toBe(1)
    expect(countBranches('x ? 1 : 2')).toBe(1)
    expect(countBranches('')).toBe(0)
  })

  it('counts descriptive names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
    expect(countDescriptiveNames('function isValid() {}')).toBe(1)
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts defaults', () => {
    expect(countDefaults('export default class {}')).toBe(1)
    expect(countDefaults('')).toBe(0)
  })

  it('counts deprecated', () => {
    expect(countDeprecated('@deprecated use x instead')).toBe(1)
    expect(countDeprecated('')).toBe(0)
  })

  it('counts return types', () => {
    expect(countReturnTypes('): number')).toBe(1)
    expect(countReturnTypes('): void')).toBe(1)
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts generics', () => {
    expect(countGenerics('function f<T>() {}')).toBe(1)
    expect(countGenerics('')).toBe(0)
  })

  it('counts arrow functions', () => {
    expect(countArrowFunctions('const f = () => 1')).toBe(1)
    expect(countArrowFunctions('')).toBe(0)
  })

  it('counts async', () => {
    expect(countAsync('async function f() {}')).toBe(1)
    expect(countAsync('')).toBe(0)
  })

  it('counts await', () => {
    expect(countAwait('await promise')).toBe(1)
    expect(countAwait('')).toBe(0)
  })
})

// ─── Glass Measurement ──────────────────────────────────

describe('stained-glass-window measureGlass', () => {
  it('returns zeros for empty content', () => {
    const g = measureGlass('')
    expect(g.clarity).toBe(0)
    expect(g.thickness).toBe(0)
    expect(g.isOpaque).toBe(true)
    expect(g.type).toBe('opaque')
  })

  it('detects transparent code with JSDoc and types', () => {
    const code = [
      '/** Doc */',
      'export function validateData(x: number): number {',
      '  return x',
      '}',
    ].join('\n')
    const g = measureGlass(code)
    expect(g.isTransparent).toBe(true)
    expect(g.clarity).toBeGreaterThanOrEqual(70)
    expect(g.type).toBe('cathedral')
  })

  it('detects opaque code without docs or types', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3\nconst w = 4\nconst v = 5'
    const g = measureGlass(code)
    expect(g.isOpaque).toBe(true)
    expect(g.clarity).toBeLessThan(30)
  })

  it('detects bubbles from TODOs', () => {
    const code = '/** doc */\nfunction f(x: number): number { return x }\n// TODO: fix'
    const g = measureGlass(code)
    expect(g.hasBubbles).toBe(true)
  })

  it('detects seeds from high branch density', () => {
    const code = 'function processItem(a: number, b: number): number {\nif (a) {}\nif (b) {}\nif (a && b) {}\nif (a || b) {}\n}'
    const g = measureGlass(code)
    expect(g.hasSeeds).toBe(true)
  })

  it('detects striations from types and comments', () => {
    const code = '// comment\nfunction f(x: number): number { return x }'
    const g = measureGlass(code)
    expect(g.hasStriations).toBe(true)
  })
})

// ─── Light Measurement ──────────────────────────────────

describe('stained-glass-window measureLight', () => {
  it('returns zero for empty content', () => {
    const l = measureLight('')
    expect(l.transmission).toBe(0)
    expect(l.illuminationScore).toBe(0)
    expect(l.isDark).toBe(false)
  })

  it('detects sunlight with comprehensive docs', () => {
    const code = [
      '/** Doc 1 */',
      '/** Doc 2 */',
      '/** Doc 3 */',
      'export function f(x: number): number { return x }',
      '/** Doc 4 */',
      'export function g(y: string): string { return y }',
    ].join('\n')
    const l = measureLight(code)
    expect(l.hasSunlight).toBe(true)
    expect(l.isIlluminated).toBe(true)
  })

  it('detects dark code without docs', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const l = measureLight(code)
    expect(l.isDark).toBe(true)
  })

  it('detects shadowed code with only line comments', () => {
    const code = '// comment only\nconst x = 1\nconst y = 2\nconst z = 3'
    const l = measureLight(code)
    expect(l.isShadowed).toBe(true)
  })

  it('detects dappled light with some docs', () => {
    const code = '/** A doc */\nfunction f() {}'
    const l = measureLight(code)
    expect(l.hasDappled).toBe(true)
  })

  it('detects prismatic effect with generics', () => {
    const code = '/** doc */\nfunction f<T>(x: T): number { return 1 }'
    const l = measureLight(code)
    expect(l.hasPrismaticEffect).toBe(true)
  })
})

// ─── Color Measurement ──────────────────────────────────

describe('stained-glass-window measureColor', () => {
  it('returns empty palette for empty content', () => {
    const c = measureColor('')
    expect(c.palette).toEqual([])
    expect(c.isMonochrome).toBe(true)
    expect(c.richness).toBe(0)
  })

  it('detects jewel-toned code with many constructs', () => {
    const code = [
      'import { x } from "y"',
      'interface Config {}',
      'class Processor {}',
      'enum Status { Active }',
      'type Id = string',
      'export function run() {}',
      'const f = () => 1',
      'async function load() {}',
      'function gen<T>() {}',
    ].join('\n')
    const c = measureColor(code)
    expect(c.isJewelToned).toBe(true)
    expect(c.palette.length).toBeGreaterThanOrEqual(5)
  })

  it('detects monochrome code with single construct', () => {
    const code = 'const x = 1'
    const c = measureColor(code)
    expect(c.isMonochrome).toBe(true)
  })

  it('detects complementary constructs', () => {
    const code = 'interface I {}\nclass C implements I {}\nfunction f() {}'
    const c = measureColor(code)
    expect(c.hasComplementary).toBe(true)
  })

  it('detects clashing from excessive TODOs', () => {
    const code = '// TODO fix\n// TODO fix\n// TODO fix\nfunction f() {}'
    const c = measureColor(code)
    expect(c.hasClashing).toBe(true)
  })

  it('detects sacred red from error handling', () => {
    const code = 'try {} catch (e) {}'
    const c = measureColor(code)
    expect(c.hasSacredRed).toBe(true)
  })

  it('detects royal blue from classes and interfaces', () => {
    const code = 'interface I {}\nclass C implements I {}'
    const c = measureColor(code)
    expect(c.hasRoyalBlue).toBe(true)
  })

  it('detects celestial gold from JSDoc and return types', () => {
    const code = '/** doc */\nfunction f(): number { return 1 }'
    const c = measureColor(code)
    expect(c.hasCelestialGold).toBe(true)
  })

  it('detects pastel with moderate palette', () => {
    const code = 'interface I {}\nfunction f() {}\nexport function g() {}'
    const c = measureColor(code)
    expect(c.isPastel).toBe(true)
  })
})

// ─── Lead Measurement ───────────────────────────────────

describe('stained-glass-window measureLead', () => {
  it('returns zeros for empty content', () => {
    const l = measureLead('')
    expect(l.quality).toBe(0)
    expect(l.hasLeadFree).toBe(false)
  })

  it('detects clean joints with interfaces and exports', () => {
    const code = 'interface Config {}\nexport function run(c: Config): void {}'
    const l = measureLead(code)
    expect(l.hasCleanJoints).toBe(true)
    expect(l.isStructurallySound).toBe(true)
  })

  it('detects solder marks from many imports/exports', () => {
    const code = [
      "import { a } from 'x'",
      "import { b } from 'y'",
      "import { c } from 'z'",
      "import { d } from 'w'",
      'function f() {}',
    ].join('\n')
    const l = measureLead(code)
    expect(l.hasSolderMarks).toBe(true)
  })

  it('detects weak points from TODOs and console', () => {
    const code = '// TODO: fix\nconsole.log("debug")\nfunction f() {}'
    const l = measureLead(code)
    expect(l.hasWeakPoints).toBe(true)
    expect(l.weakPointCount).toBeGreaterThan(0)
  })

  it('counts joints correctly', () => {
    const code = "import { x } from 'y'\ninterface I {}\nexport function f() {}"
    const l = measureLead(code)
    expect(l.jointCount).toBe(3)
  })
})

// ─── Panel Measurement ──────────────────────────────────

describe('stained-glass-window measurePanel', () => {
  it('returns zeros for empty content', () => {
    const p = measurePanel('')
    expect(p.arrangement).toBe(0)
    expect(p.panelCount).toBe(0)
    expect(p.patternType).toBe('chaotic')
  })

  it('detects geometric pattern', () => {
    const code = 'export interface I {}\nexport class C implements I {}\nfunction f() {}'
    const p = measurePanel(code)
    expect(p.hasGeometricPattern).toBe(true)
  })

  it('detects organic pattern', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const p = measurePanel(code)
    expect(p.hasOrganicPattern).toBe(true)
  })

  it('detects narrative flow', () => {
    const code = "import { x } from 'y'\nfunction process(): void {}\nexport { process }"
    const p = measurePanel(code)
    expect(p.hasNarrativeFlow).toBe(true)
  })

  it('detects chaotic pattern', () => {
    const vars = Array.from({ length: 25 }, (_, i) => `const v${i} = ${i}`).join('\n')
    const p = measurePanel(vars)
    expect(p.hasChaoticPattern).toBe(true)
  })

  it('detects symmetry', () => {
    const code = "import { x } from 'y'\nimport { z } from 'w'\nexport { x }\nexport { z }"
    const p = measurePanel(code)
    expect(p.hasSymmetry).toBe(true)
  })

  it('counts panels correctly', () => {
    const code = 'function f() {}\nfunction g() {}\nclass C {}\ninterface I {}'
    const p = measurePanel(code)
    expect(p.panelCount).toBe(4)
  })
})

// ─── Frame Measurement ──────────────────────────────────

describe('stained-glass-window measureFrame', () => {
  it('returns zeros for empty content', () => {
    const f = measureFrame('')
    expect(f.quality).toBe(0)
    expect(f.isIntact).toBe(false)
  })

  it('detects stone tracery from types', () => {
    const code = 'function f(a: number, b: string, c: boolean, d: void): void {}'
    const f = measureFrame(code)
    expect(f.hasStoneTracery).toBe(true)
  })

  it('detects iron armature from classes and error handling', () => {
    const code = 'class Service {\n  run() { try {} catch (e) {} }\n}'
    const f = measureFrame(code)
    expect(f.hasIronArmature).toBe(true)
  })

  it('detects weather tight from error handling and defaults', () => {
    const code = 'try {} catch (e) {}\nexport default class {}'
    const f = measureFrame(code)
    expect(f.isWeatherTight).toBe(true)
  })

  it('detects ornamentation from JSDoc and descriptive names', () => {
    const code = '/** doc */\nfunction getData(): number { return 1 }'
    const f = measureFrame(code)
    expect(f.hasOrnamentation).toBe(true)
  })

  it('detects damage from deprecated or excessive TODOs', () => {
    const code = '@deprecated\nfunction f() {}\n// TODO: fix\n// TODO: fix\n// TODO: fix'
    const f = measureFrame(code)
    expect(f.hasDamage).toBe(true)
  })

  it('detects intact frame', () => {
    const code = '/** doc */\nexport function validateData(x: number): number {\n  try { return x } catch (e) { return 0 }\n}'
    const f = measureFrame(code)
    expect(f.isIntact).toBe(true)
  })
})

// ─── Story Measurement ──────────────────────────────────

describe('stained-glass-window measureStory', () => {
  it('returns zeros for empty content', () => {
    const s = measureStory('')
    expect(s.narrativeScore).toBe(0)
    expect(s.isTold).toBe(false)
  })

  it('detects a complete story', () => {
    const code = [
      "import { x } from 'y'",
      '/** docs */',
      'export function processData(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const s = measureStory(code)
    expect(s.hasBeginning).toBe(true)
    expect(s.hasMiddle).toBe(true)
    expect(s.hasEnd).toBe(true)
    expect(s.isTold).toBe(true)
  })

  it('detects plot twist from async/await', () => {
    const code = 'async function load() { await fetch("/") }'
    const s = measureStory(code)
    expect(s.hasPlotTwist).toBe(true)
  })

  it('is clear with high narrative score', () => {
    const code = [
      "import { Config } from './types'",
      '/** Process data */',
      'export function processData(c: Config): number {',
      '  return c.value',
      '}',
    ].join('\n')
    const s = measureStory(code)
    expect(s.isClear).toBe(true)
  })
})

// ─── Panel Analysis ─────────────────────────────────────

describe('stained-glass-window analyzeGlassPanel', () => {
  it('analyzes a well-documented file as masterpiece', () => {
    const code = [
      '/** Validates input data */',
      'export interface Config {',
      '  value: number',
      '}',
      '/** Process the configuration */',
      'export function processConfig(c: Config): number {',
      '  try { return c.value } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const panel = analyzeGlassPanel(code, 'src/config.ts')
    expect(panel.condition).toBe('cathedral-masterpiece')
    expect(panel.qualityScore).toBeGreaterThanOrEqual(80)
    expect(panel.glass.isTransparent).toBe(true)
    expect(panel.light.isIlluminated).toBe(true)
  })

  it('analyzes undocumented code as bricked-up', () => {
    const code = 'const a = 1\nconst b = 2\nconst c = 3\nconst d = 4\nconst e = 5'
    const panel = analyzeGlassPanel(code, 'src/data.ts')
    expect(panel.qualityScore).toBeLessThan(30)
  })

  it('sets correct file path', () => {
    const panel = analyzeGlassPanel('const x = 1', 'src/index.ts')
    expect(panel.file).toBe('src/index.ts')
  })

  it('computes all sub-measures', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }'
    const panel = analyzeGlassPanel(code, 'test.ts')
    expect(panel.glass.clarity).toBeGreaterThan(0)
    expect(panel.light.transmission).toBeGreaterThan(0)
    expect(panel.color.palette.length).toBeGreaterThan(0)
    expect(panel.lead.jointCount).toBeGreaterThan(0)
    expect(panel.panel.panelCount).toBeGreaterThan(0)
    expect(typeof panel.frame.quality).toBe('number')
    expect(typeof panel.story.narrativeScore).toBe('number')
  })
})

// ─── Classification ─────────────────────────────────────

describe('stained-glass-window classifyPanelCondition', () => {
  it('classifies masterpiece', () => {
    const glass = { isTransparent: true, isTranslucent: false, isOpaque: false, hasBubbles: false, hasSeeds: false, hasStriations: false, type: 'cathedral' as const, thickness: 10, clarity: 85 }
    const light = { isIlluminated: true, hasSunlight: true, hasDappled: false, isShadowed: false, isDark: false, hasPrismaticEffect: false, transmission: 85, illuminationScore: 80 }
    expect(classifyPanelCondition(85, glass, light)).toBe('cathedral-masterpiece')
  })

  it('classifies rose window', () => {
    const glass = { isTransparent: true, isTranslucent: false, isOpaque: false, hasBubbles: false, hasSeeds: false, hasStriations: false, type: 'cathedral' as const, thickness: 10, clarity: 60 }
    const light = { isIlluminated: false, hasSunlight: false, hasDappled: true, isShadowed: false, isDark: false, hasPrismaticEffect: false, transmission: 60, illuminationScore: 50 }
    expect(classifyPanelCondition(70, glass, light)).toBe('rose-window')
  })

  it('classifies beautiful window', () => {
    const glass = { isTransparent: false, isTranslucent: true, isOpaque: false, hasBubbles: false, hasSeeds: false, hasStriations: false, type: 'seeded' as const, thickness: 10, clarity: 40 }
    const light = { isIlluminated: false, hasSunlight: false, hasDappled: false, isShadowed: false, isDark: false, hasPrismaticEffect: false, transmission: 40, illuminationScore: 40 }
    expect(classifyPanelCondition(55, glass, light)).toBe('beautiful-window')
  })

  it('classifies bricked-up for low score', () => {
    const glass = { isTransparent: false, isTranslucent: false, isOpaque: true, hasBubbles: false, hasSeeds: false, hasStriations: false, type: 'opaque' as const, thickness: 10, clarity: 5 }
    const light = { isIlluminated: false, hasSunlight: false, hasDappled: false, isShadowed: false, isDark: true, hasPrismaticEffect: false, transmission: 5, illuminationScore: 5 }
    expect(classifyPanelCondition(10, glass, light)).toBe('bricked-up')
  })
})

// ─── Bay Analysis ───────────────────────────────────────

describe('stained-glass-window analyzeWindowBay', () => {
  it('handles empty panels', () => {
    const bay = analyzeWindowBay([], 'src/')
    expect(bay.bayType).toBe('walled-up')
    expect(bay.condition).toBe('darkness')
    expect(bay.avgLightTransmission).toBe(0)
  })

  it('computes averages from panels', () => {
    const panels: GlassPanel[] = [
      analyzeGlassPanel('/** doc */\nexport function f(): number { return 1 }', 'a.ts'),
      analyzeGlassPanel('/** doc */\nexport function g(): string { return "hi" }', 'b.ts'),
    ]
    const bay = analyzeWindowBay(panels, 'src/')
    expect(bay.panels.length).toBe(2)
    expect(bay.avgLightTransmission).toBeGreaterThan(0)
  })

  it('counts masterpieces and bricked-up', () => {
    const good = analyzeGlassPanel('/** doc */\nexport interface I {}\nexport function f(x: number): number { return x }\nexport class C {}', 'good.ts')
    const bad = analyzeGlassPanel('const x = 1\nconst y = 2\nconst z = 3\nconst w = 4\nconst v = 5', 'bad.ts')
    const bay = analyzeWindowBay([good, bad], 'src/')
    expect(bay.panels.length).toBe(2)
  })
})

// ─── Glazier Grade ──────────────────────────────────────

describe('stained-glass-window classifyGlazierGrade', () => {
  it('returns master-glazier for high brilliance', () => {
    expect(classifyGlazierGrade(90)).toBe('master-glazier')
  })
  it('returns glazier', () => {
    expect(classifyGlazierGrade(70)).toBe('glazier')
  })
  it('returns glass-artisan', () => {
    expect(classifyGlazierGrade(55)).toBe('glass-artisan')
  })
  it('returns apprentice', () => {
    expect(classifyGlazierGrade(40)).toBe('apprentice')
  })
  it('returns hobbyist', () => {
    expect(classifyGlazierGrade(25)).toBe('hobbyist')
  })
  it('returns vandal', () => {
    expect(classifyGlazierGrade(10)).toBe('vandal')
  })
})

// ─── Bay Classification ─────────────────────────────────

describe('stained-glass-window bay classification', () => {
  it('classifies divine-light', () => {
    expect(classifyBayCondition(85)).toBe('divine-light')
  })
  it('classifies radiant', () => {
    expect(classifyBayCondition(70)).toBe('radiant')
  })
  it('classifies well-lit', () => {
    expect(classifyBayCondition(55)).toBe('well-lit')
  })
  it('classifies dim', () => {
    expect(classifyBayCondition(35)).toBe('dim')
  })
  it('classifies gloomy', () => {
    expect(classifyBayCondition(20)).toBe('gloomy')
  })
  it('classifies darkness', () => {
    expect(classifyBayCondition(10)).toBe('darkness')
  })

  it('classifies cathedral-bay type', () => {
    const good = analyzeGlassPanel('/** doc */\nexport interface I {}\nexport function validateData(x: number): number { return x }\nexport class Service {}', 'a.ts')
    const panels = [good, good]
    expect(classifyBayType(panels, 80)).toBe('cathedral-bay')
  })

  it('classifies walled-up for empty', () => {
    expect(classifyBayType([], 0)).toBe('walled-up')
  })
})

// ─── Recommendations ────────────────────────────────────

describe('stained-glass-window generateRecommendations', () => {
  it('generates dark file recommendation', () => {
    const panels = [analyzeGlassPanel('const x = 1\nconst y = 2\nconst z = 3', 'a.ts')]
    const result = buildStainedGlassWindowResult(['a.ts'], ['const x = 1\nconst y = 2\nconst z = 3'])
    const recs = generateRecommendations(panels, result.bays, result.cathedral, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns positive message when code is good', () => {
    const code = [
      '/** Validate input */',
      'export interface Config { value: number }',
      '/** Process configuration */',
      'export function processConfig(c: Config): number {',
      '  try { return c.value } catch (e) { return 0 }',
      '}',
      '/** Helper function */',
      'export function validateData(x: number): boolean {',
      '  return x > 0',
      '}',
    ].join('\n')
    const result = buildStainedGlassWindowResult(['a.ts'], [code])
    const recs = generateRecommendations(result.panels, result.bays, result.cathedral, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('stained-glass-window buildStainedGlassWindowResult', () => {
  it('handles empty input', () => {
    const result = buildStainedGlassWindowResult([], [])
    expect(result.panels.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.glazierGrade).toBe('vandal')
    expect(result.cathedral.overallBrilliance).toBe(0)
  })

  it('builds full result for multiple files', () => {
    const code1 = '/** doc */\nexport function f(x: number): number { return x }'
    const code2 = '/** doc */\ninterface Config { value: number }\nexport function process(c: Config): number { return c.value }'
    const result = buildStainedGlassWindowResult(
      ['src/a.ts', 'src/b.ts'],
      [code1, code2],
    )
    expect(result.panels.length).toBe(2)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.cathedral.avgLightTransmission).toBeGreaterThan(0)
    expect(result.stats.mostBrilliant).toBeTruthy()
    expect(result.stats.mostColorful).toBeTruthy()
    expect(result.stats.cleanestLead).toBeTruthy()
    expect(result.stats.bestFramed).toBeTruthy()
    expect(result.stats.bestStory).toBeTruthy()
  })

  it('groups panels into bays by directory', () => {
    const code = '/** doc */\nexport function f(): number { return 1 }'
    const result = buildStainedGlassWindowResult(
      ['src/commands/a.ts', 'src/core/b.ts'],
      [code, code],
    )
    expect(result.bays.length).toBe(2)
    expect(result.bays.some(b => b.directory === 'src/commands')).toBe(true)
    expect(result.bays.some(b => b.directory === 'src/core')).toBe(true)
  })

  it('computes all stat counters', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }'
    const result = buildStainedGlassWindowResult(['a.ts'], [code])
    const stats: StainedGlassWindowStats = result.stats
    expect(typeof stats.cathedralMasterpieceCount).toBe('number')
    expect(typeof stats.roseWindowCount).toBe('number')
    expect(typeof stats.beautifulWindowCount).toBe('number')
    expect(typeof stats.clearGlassCount).toBe('number')
    expect(typeof stats.crackedGlassCount).toBe('number')
    expect(typeof stats.brickedUpCount).toBe('number')
    expect(typeof stats.transparentCount).toBe('number')
    expect(typeof stats.opaqueCount).toBe('number')
    expect(typeof stats.illuminatedCount).toBe('number')
    expect(typeof stats.shadowedCount).toBe('number')
    expect(typeof stats.darkCount).toBe('number')
    expect(typeof stats.jewelTonedCount).toBe('number')
    expect(typeof stats.monochromeCount).toBe('number')
    expect(typeof stats.hasCleanJointsCount).toBe('number')
    expect(typeof stats.isWeatherTightCount).toBe('number')
    expect(typeof stats.hasNarrativeFlowCount).toBe('number')
    expect(typeof stats.hasSymmetryCount).toBe('number')
    expect(typeof stats.isToldCount).toBe('number')
    expect(typeof stats.isIntactCount).toBe('number')
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('stained-glass-window format helpers', () => {
  const code = '/** doc */\nexport function f(x: number): number { return x }'
  const result = buildStainedGlassWindowResult(['a.ts'], [code])

  it('formats as JSON string', () => {
    const json = formatStainedGlassWindowJson(result)
    expect(json).toContain('"panels"')
    expect(json).toContain('"stats"')
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formats as table', () => {
    const table = formatStainedGlassWindowTable(result, false)
    expect(table).toContain('Stained Glass Window Report')
    expect(table).toContain('Glazier Grade')
  })

  it('formats as table with verbose panels', () => {
    const table = formatStainedGlassWindowTable(result, true)
    expect(table).toContain('Panel Details')
    expect(table).toContain('a.ts')
  })

  it('formats as CSV', () => {
    const csv = formatStainedGlassWindowCsv(result)
    expect(csv).toContain('File,LightTransmission')
    expect(csv).toContain('a.ts')
  })
})
