import { describe, expect, it } from 'vitest'
import {
  countLoc,
  countFunctions,
  countClasses,
  countInterfaces,
  countTypes,
  countEnums,
  countExports,
  countImports,
  countJSDoc,
  countComments,
  countErrorHandling,
  countTypeAnnotations,
  countTodos,
  countConsole,
  countBranches,
  countDescriptiveNames,
  countDefaults,
  countDeprecated,
  countReturnTypes,
  countGenerics,
  countArrowFunctions,
  countAsync,
  countAwait,
  countPrivateMembers,
  measureBeam,
  measureLens,
  measureFocal,
  measureRotation,
  measureVisibility,
  measureWarning,
  analyzeLensReading,
  classifyReadingCondition,
  classifyKeeperGrade,
  classifyStationType,
  classifyStationCondition,
  analyzeCoastalStation,
  generateRecommendations,
  buildLighthouseLensResult,
} from '../src/commands/lighthouse-lens-helpers.js'
import {
  scoreColor,
  beamTypeColor,
  conditionColor,
  materialColor,
  patternColor,
  visConditionColor,
  warningTypeColor,
  keeperGradeColor,
  stationCondColor,
  formatReading,
  formatStation,
  formatStats,
  formatLighthouseLensTable,
  formatLighthouseLensJson,
} from '../src/commands/lighthouse-lens-format-helpers.js'

// ─── Counting Utilities ─────────────────────────────────

describe('lighthouse-lens countLoc', () => {
  it('counts non-empty lines', () => {
    expect(countLoc('a\n\nb\nc')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
  })

  it('returns 0 for whitespace-only', () => {
    expect(countLoc('   \n  \n')).toBe(0)
  })
})

describe('lighthouse-lens countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function foo() {}')).toBe(1)
  })

  it('counts multiple functions', () => {
    expect(countFunctions('function foo() {}\nfunction bar() {}')).toBe(2)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const f = () => 1')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countFunctions('')).toBe(0)
  })
})

describe('lighthouse-lens countClasses', () => {
  it('counts class declarations', () => {
    expect(countClasses('class A {} class B {}')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countClasses('')).toBe(0)
  })
})

describe('lighthouse-lens countInterfaces', () => {
  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countInterfaces('')).toBe(0)
  })
})

describe('lighthouse-lens countTypes', () => {
  it('counts type aliases', () => {
    expect(countTypes('type X = string')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countTypes('')).toBe(0)
  })
})

describe('lighthouse-lens countEnums', () => {
  it('counts enum declarations', () => {
    expect(countEnums('enum Dir { Up }')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countEnums('')).toBe(0)
  })
})

describe('lighthouse-lens countExports', () => {
  it('counts export statements', () => {
    expect(countExports('export const a = 1\nexport { b }')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countExports('')).toBe(0)
  })
})

describe('lighthouse-lens countImports', () => {
  it('counts import statements', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countImports('')).toBe(0)
  })
})

describe('lighthouse-lens countJSDoc', () => {
  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */ const x = 1')).toBe(1)
  })

  it('returns 0 for no JSDoc', () => {
    expect(countJSDoc('const x = 1')).toBe(0)
  })
})

describe('lighthouse-lens countComments', () => {
  it('counts line and block comments', () => {
    expect(countComments('// inline\n/* block */')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countComments('')).toBe(0)
  })
})

describe('lighthouse-lens countErrorHandling', () => {
  it('counts try/catch/finally/throw', () => {
    expect(countErrorHandling('try {} catch(e) {} finally {}')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countErrorHandling('')).toBe(0)
  })
})

describe('lighthouse-lens countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countTypeAnnotations('')).toBe(0)
  })
})

describe('lighthouse-lens countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countTodos('')).toBe(0)
  })
})

describe('lighthouse-lens countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log(1)')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countConsole('')).toBe(0)
  })
})

describe('lighthouse-lens countBranches', () => {
  it('counts if as a branch', () => {
    expect(countBranches('if (x) {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countBranches('')).toBe(0)
  })
})

describe('lighthouse-lens countDescriptiveNames', () => {
  it('counts descriptive function names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countDescriptiveNames('')).toBe(0)
  })
})

describe('lighthouse-lens countDefaults', () => {
  it('counts default keywords', () => {
    expect(countDefaults('export default class {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countDefaults('')).toBe(0)
  })
})

describe('lighthouse-lens countDeprecated', () => {
  it('counts deprecated markers', () => {
    expect(countDeprecated('@deprecated')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countDeprecated('')).toBe(0)
  })
})

describe('lighthouse-lens countReturnTypes', () => {
  it('counts return type annotations', () => {
    expect(countReturnTypes('function foo(): string {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countReturnTypes('')).toBe(0)
  })
})

describe('lighthouse-lens countGenerics', () => {
  it('counts generic type parameters', () => {
    expect(countGenerics('function foo<T>() {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countGenerics('')).toBe(0)
  })
})

describe('lighthouse-lens countArrowFunctions', () => {
  it('counts arrow functions', () => {
    expect(countArrowFunctions('const f = () => 1')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countArrowFunctions('')).toBe(0)
  })
})

describe('lighthouse-lens countAsync', () => {
  it('counts async keywords', () => {
    expect(countAsync('async function foo() {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countAsync('')).toBe(0)
  })
})

describe('lighthouse-lens countAwait', () => {
  it('counts await keywords', () => {
    expect(countAwait('await foo()')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countAwait('')).toBe(0)
  })
})

describe('lighthouse-lens countPrivateMembers', () => {
  it('counts private members', () => {
    expect(countPrivateMembers('private x: number')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countPrivateMembers('')).toBe(0)
  })
})

// ─── Measure Functions ──────────────────────────────────

describe('lighthouse-lens measureBeam', () => {
  it('returns default values for empty content', () => {
    const beam = measureBeam('')
    expect(beam.intensity).toBe(10)
    expect(beam.type).toBe('candle')
    expect(beam.isBright).toBe(false)
    expect(beam.hasDarkSpots).toBe(false)
    expect(beam.darkSpotCount).toBe(0)
  })

  it('measures minimal export function', () => {
    const beam = measureBeam('export function add(a: number, b: number): number { return a + b; }')
    expect(beam.intensity).toBe(45)
    expect(beam.type).toBe('halogen')
    expect(beam.hasDirectionalBeam).toBe(true)
  })

  it('detects bright beam with 3+ JSDoc and exports', () => {
    const content = '/** a */\n/** b */\n/** c */\nexport function foo() {}'
    const beam = measureBeam(content)
    expect(beam.isBright).toBe(true)
  })

  it('detects dark spots from todos and console', () => {
    const beam = measureBeam('// TODO: fix\nconsole.log("debug")')
    expect(beam.hasDarkSpots).toBe(true)
    expect(beam.darkSpotCount).toBe(2)
  })

  it('measures rich content', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'

/** Docs for interface */
export interface Data {
  name: string
  value: number
}

/** Docs for class */
export class Processor implements Data {
  name: string = ''
  value: number = 0

  constructor(name: string) {
    this.name = name
  }

  process(): void {
    try {
      this.validate()
    } catch (e) {
      console.error(e)
    }
  }

  validate(): boolean {
    return this.value > 0
  }
}

export function getData(): Data {
  return { name: 'test', value: 42 }
}

export default Processor
`
    const beam = measureBeam(rich)
    expect(beam.intensity).toBe(100)
    expect(beam.type).toBe('parabolic')
    expect(beam.hasSteadyBeam).toBe(true)
    expect(beam.hasOmnidirectional).toBe(true)
    expect(beam.hasColoredFilters).toBe(true)
  })
})

describe('lighthouse-lens measureLens', () => {
  it('returns default values for empty content', () => {
    const lens = measureLens('')
    expect(lens.quality).toBe(10)
    expect(lens.material).toBe('cracked')
    expect(lens.isCrystal).toBe(false)
    expect(lens.defectCount).toBe(0)
  })

  it('measures minimal content', () => {
    const lens = measureLens('export function add(a: number, b: number): number { return a + b; }')
    expect(lens.quality).toBe(40)
    expect(lens.material).toBe('plastic')
    expect(lens.hasProperFocalLength).toBe(true)
  })

  it('detects crystal quality with high score', () => {
    const rich = `import { foo } from './bar.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
`
    const lens = measureLens(rich)
    expect(lens.isCrystal).toBe(true)
    expect(lens.material).toBe('crystal')
  })

  it('detects no scratches without todos or deprecated', () => {
    const lens = measureLens('export function foo(a: number): void {}')
    expect(lens.hasNoScratches).toBe(true)
  })

  it('detects fresnel design with classes, functions, and interfaces', () => {
    const lens = measureLens('interface Foo {}\nclass Bar {}\nfunction baz() {}')
    expect(lens.isFresnelDesign).toBe(true)
  })
})

describe('lighthouse-lens measureFocal', () => {
  it('returns default values for empty content', () => {
    const focal = measureFocal('')
    expect(focal.precision).toBe(10)
    expect(focal.length).toBe(5)
    expect(focal.hasSharpFocus).toBe(false)
    expect(focal.aberrationCount).toBe(0)
  })

  it('measures minimal content', () => {
    const focal = measureFocal('export function add(a: number, b: number): number { return a + b; }')
    expect(focal.precision).toBe(55)
    expect(focal.length).toBe(19)
    expect(focal.hasSharpFocus).toBe(true)
    expect(focal.hasNarrowBeam).toBe(true)
    expect(focal.hasConvergent).toBe(true)
  })

  it('detects aberration from todos and deprecated', () => {
    const focal = measureFocal('// TODO\n// TODO\n// TODO')
    expect(focal.hasAberration).toBe(true)
    expect(focal.aberrationCount).toBe(3)
  })

  it('detects collimated with interfaces and exports', () => {
    const focal = measureFocal('interface Foo {}\nexport { Foo }')
    expect(focal.hasCollimated).toBe(true)
  })
})

describe('lighthouse-lens measureRotation', () => {
  it('returns default values for empty content', () => {
    const rot = measureRotation('')
    expect(rot.speed).toBe(10)
    expect(rot.pattern).toBe('fixed')
    expect(rot.isReliable).toBe(false)
    expect(rot.reliability).toBe(5)
  })

  it('measures minimal content', () => {
    const rot = measureRotation('export function add(a: number, b: number): number { return a + b; }')
    expect(rot.speed).toBe(35)
    expect(rot.pattern).toBe('flashing')
    expect(rot.hasProperTiming).toBe(true)
  })

  it('detects reliable rotation with errors, exports, and types', () => {
    const rot = measureRotation('try {} catch(e) {}\nexport function foo(a: number): void {}')
    expect(rot.isReliable).toBe(true)
  })

  it('detects quick-flashing pattern for high speed', () => {
    const rich = `import { foo } from './bar.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
try {} catch(e) {}
`
    const rot = measureRotation(rich)
    expect(rot.pattern).toBe('quick-flashing')
  })
})

describe('lighthouse-lens measureVisibility', () => {
  it('returns default values for empty content', () => {
    const vis = measureVisibility('')
    expect(vis.range).toBe(5)
    expect(vis.condition).toBe('zero')
    expect(vis.hasLongRange).toBe(false)
  })

  it('measures minimal content', () => {
    const vis = measureVisibility('export function add(a: number, b: number): number { return a + b; }')
    expect(vis.range).toBe(30)
    expect(vis.condition).toBe('poor')
    expect(vis.hasShortRange).toBe(true)
    expect(vis.hasNominalRange).toBe(true)
    expect(vis.hasDayVisibility).toBe(true)
  })

  it('measures rich content', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
try {} catch(e) {}
`
    const vis = measureVisibility(rich)
    expect(vis.range).toBe(100)
    expect(vis.condition).toBe('excellent')
    expect(vis.hasLongRange).toBe(true)
    expect(vis.hasGeographicRange).toBe(true)
    expect(vis.hasLuminousRange).toBe(true)
  })
})

describe('lighthouse-lens measureWarning', () => {
  it('returns default values for empty content', () => {
    const warn = measureWarning('')
    expect(warn.system).toBe(10)
    expect(warn.type).toBe('silent')
    expect(warn.hasAudibleWarning).toBe(false)
    expect(warn.warningCount).toBe(0)
  })

  it('measures minimal content', () => {
    const warn = measureWarning('export function add(a: number, b: number): number { return a + b; }')
    expect(warn.system).toBe(45)
    expect(warn.type).toBe('whistle')
  })

  it('detects audible warning from error handling', () => {
    const warn = measureWarning('try {} catch(e) {}')
    expect(warn.hasAudibleWarning).toBe(true)
  })

  it('detects collision avoidance with errors and interfaces', () => {
    const warn = measureWarning('interface Foo {}\ntry {} catch(e) {}')
    expect(warn.hasCollisionAvoidance).toBe(true)
  })
})

// ─── Reading Analysis ───────────────────────────────────

describe('lighthouse-lens analyzeLensReading', () => {
  it('analyzes empty content', () => {
    const reading = analyzeLensReading('', 'empty.ts')
    expect(reading.file).toBe('empty.ts')
    expect(reading.qualityScore).toBe(9)
    expect(reading.condition).toBe('shipwreck')
  })

  it('analyzes minimal content', () => {
    const reading = analyzeLensReading('export function add(a: number, b: number): number { return a + b; }', 'minimal.ts')
    expect(reading.qualityScore).toBe(42)
    expect(reading.condition).toBe('solar-powered')
  })

  it('analyzes rich content', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'

/** Docs for interface */
export interface Data {
  name: string
  value: number
}

/** Docs for class */
export class Processor implements Data {
  name: string = ''
  value: number = 0

  constructor(name: string) {
    this.name = name
  }

  process(): void {
    try {
      this.validate()
    } catch (e) {
      console.error(e)
    }
  }

  validate(): boolean {
    return this.value > 0
  }
}

export function getData(): Data {
  return { name: 'test', value: 42 }
}

export default Processor
`
    const reading = analyzeLensReading(rich, 'src/rich.ts')
    expect(reading.qualityScore).toBe(93)
    expect(reading.condition).toBe('modern-automated')
    expect(reading.beam.hasOmnidirectional).toBe(true)
    expect(reading.lens.isCrystal).toBe(true)
    expect(reading.focal.hasSharpFocus).toBe(true)
    expect(reading.rotation.isReliable).toBe(true)
    expect(reading.visibility.condition).toBe('excellent')
    expect(reading.warning.hasCollisionAvoidance).toBe(true)
  })

  it('computes quality score as weighted average', () => {
    const reading = analyzeLensReading('', 'test.ts')
    const expected = Math.min(100, Math.max(0, Math.round(
      reading.beamIntensity * 0.20 +
      reading.lensQuality * 0.20 +
      reading.focalPrecision * 0.15 +
      reading.rotationSpeed * 0.15 +
      reading.visibilityRange * 0.15 +
      reading.warningSystem * 0.15,
    )))
    expect(reading.qualityScore).toBe(expected)
  })
})

// ─── Classify Functions ─────────────────────────────────

describe('lighthouse-lens classifyReadingCondition', () => {
  it('classifies pharos-of-alexandria', () => {
    const beam = { isBright: true, hasProperIllumination: true } as any
    const lens = { isCrystal: true, hasProperFocalLength: true } as any
    expect(classifyReadingCondition(90, beam, lens)).toBe('pharos-of-alexandria')
  })

  it('classifies modern-automated', () => {
    expect(classifyReadingCondition(70, { isBright: false, hasProperIllumination: true } as any, { isCrystal: false, hasProperFocalLength: true } as any)).toBe('modern-automated')
  })

  it('classifies classic-fresnel', () => {
    expect(classifyReadingCondition(55, { isBright: false, hasProperIllumination: false } as any, { isCrystal: false, hasProperFocalLength: true } as any)).toBe('classic-fresnel')
  })

  it('classifies solar-powered', () => {
    expect(classifyReadingCondition(40, {} as any, {} as any)).toBe('solar-powered')
  })

  it('classifies decommissioned', () => {
    expect(classifyReadingCondition(25, {} as any, {} as any)).toBe('decommissioned')
  })

  it('classifies shipwreck', () => {
    expect(classifyReadingCondition(10, {} as any, {} as any)).toBe('shipwreck')
  })
})

describe('lighthouse-lens classifyKeeperGrade', () => {
  it('classifies head-keeper', () => {
    expect(classifyKeeperGrade(90)).toBe('head-keeper')
  })

  it('classifies principal-keeper', () => {
    expect(classifyKeeperGrade(70)).toBe('principal-keeper')
  })

  it('classifies assistant-keeper', () => {
    expect(classifyKeeperGrade(50)).toBe('assistant-keeper')
  })

  it('classifies lamplighter', () => {
    expect(classifyKeeperGrade(30)).toBe('lamplighter')
  })

  it('classifies watchman', () => {
    expect(classifyKeeperGrade(15)).toBe('watchman')
  })

  it('classifies sleepwalker', () => {
    expect(classifyKeeperGrade(5)).toBe('sleepwalker')
  })
})

describe('lighthouse-lens classifyStationCondition', () => {
  it('classifies coast-guard-standard', () => {
    expect(classifyStationCondition(80)).toBe('coast-guard-standard')
  })

  it('classifies well-maintained', () => {
    expect(classifyStationCondition(65)).toBe('well-maintained')
  })

  it('classifies functional', () => {
    expect(classifyStationCondition(50)).toBe('functional')
  })

  it('classifies aging', () => {
    expect(classifyStationCondition(35)).toBe('aging')
  })

  it('classifies dilapidated', () => {
    expect(classifyStationCondition(20)).toBe('dilapidated')
  })

  it('classifies dark-coast', () => {
    expect(classifyStationCondition(5)).toBe('dark-coast')
  })
})

describe('lighthouse-lens classifyStationType', () => {
  it('returns dark for empty readings', () => {
    expect(classifyStationType([], 0)).toBe('dark')
  })

  it('returns dark for low average', () => {
    const readings = [analyzeLensReading('', 'a.ts'), analyzeLensReading('', 'b.ts')]
    expect(classifyStationType(readings, 10)).toBe('dark')
  })

  it('returns harbor-light for all good readings with high beam', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
try {} catch(e) {}
`
    const reading = analyzeLensReading(rich, 'x.ts')
    expect(classifyStationType([reading], reading.beamIntensity)).toBe('harbor-light')
  })

  it('returns major-lightstation for pharos readings', () => {
    const pharosContent = `import { foo } from './bar.js'
/** Docs a */
/** Docs b */
/** Docs c */
export interface Data { name: string }
export class Processor { name: string = ''; process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
try {} catch(e) {}
`
    const reading = analyzeLensReading(pharosContent, 'x.ts')
    expect(reading.condition).toBe('pharos-of-alexandria')
    expect(classifyStationType([reading], reading.beamIntensity)).toBe('major-lightstation')
  })
})

// ─── Station Analysis ───────────────────────────────────

describe('lighthouse-lens analyzeCoastalStation', () => {
  it('returns defaults for empty readings', () => {
    const station = analyzeCoastalStation([], 'empty-dir')
    expect(station.directory).toBe('empty-dir')
    expect(station.readings).toHaveLength(0)
    expect(station.avgBeamIntensity).toBe(0)
    expect(station.stationType).toBe('dark')
    expect(station.condition).toBe('dark-coast')
  })

  it('analyzes single reading', () => {
    const reading = analyzeLensReading('', 'x.ts')
    const station = analyzeCoastalStation([reading], 'single')
    expect(station.avgBeamIntensity).toBe(10)
    expect(station.stationType).toBe('dark')
    expect(station.shipwreckCount).toBe(1)
  })

  it('computes averages across readings', () => {
    const r1 = analyzeLensReading('export function foo(a: number): void {}', 'a.ts')
    const r2 = analyzeLensReading('export function bar(b: number): void {}', 'b.ts')
    const station = analyzeCoastalStation([r1, r2], 'src')
    expect(station.avgBeamIntensity).toBe(Math.round((r1.beamIntensity + r2.beamIntensity) / 2))
    expect(station.readings).toHaveLength(2)
  })
})

// ─── Recommendations ────────────────────────────────────

describe('lighthouse-lens generateRecommendations', () => {
  it('generates recommendations for poor code', () => {
    const readings = [analyzeLensReading('', 'a.ts')]
    const result = buildLighthouseLensResult(['a.ts'], [''])
    const recs = generateRecommendations(readings, result.stations, result.service, result.stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs).toContain('Add exports, types, and documentation to illuminate shipwreck files')
  })

  it('generates positive recs for excellent code', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
try {} catch(e) {}
`
    const result = buildLighthouseLensResult(['x.ts'], [rich])
    const recs = generateRecommendations(result.readings, result.stations, result.service, result.stats)
    expect(recs).toContain('This lighthouse shines brilliantly — keep the light burning')
  })
})

// ─── Build Result ───────────────────────────────────────

describe('lighthouse-lens buildLighthouseLensResult', () => {
  it('builds result from empty inputs', () => {
    const result = buildLighthouseLensResult([], [])
    expect(result.readings).toHaveLength(0)
    expect(result.stations).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalStations).toBe(0)
    expect(result.stats.overallIllumination).toBe(0)
    expect(result.stats.keeperGrade).toBe('sleepwalker')
  })

  it('builds result from single file', () => {
    const result = buildLighthouseLensResult(['a.ts'], [''])
    expect(result.readings).toHaveLength(1)
    expect(result.stations).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.service.isReliable).toBe(false)
  })

  it('groups files by directory into stations', () => {
    const result = buildLighthouseLensResult(['src/a.ts', 'src/b.ts', 'test/c.ts'], ['', '', ''])
    expect(result.stations).toHaveLength(2)
    expect(result.stations.map(s => s.directory)).toContain('src')
    expect(result.stations.map(s => s.directory)).toContain('test')
  })

  it('computes correct stats for mixed content', () => {
    const result = buildLighthouseLensResult(['a.ts', 'b.ts'], ['', 'export function foo(): void {}'])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgBeamIntensity).toBe(28)
    expect(result.stats.overallIllumination).toBe(26)
    expect(result.stats.keeperGrade).toBe('watchman')
    expect(result.stats.shipwreckCount).toBe(1)
    expect(result.stats.solarPoweredCount).toBe(1)
    expect(result.stats.bestReading).toBe('b.ts')
  })

  it('identifies best files correctly', () => {
    const result = buildLighthouseLensResult(['empty.ts', 'good.ts'], ['', 'export function foo(): void {}'])
    expect(result.stats.bestReading).toBe('good.ts')
    expect(result.stats.brightestBeam).toBe('good.ts')
    expect(result.stats.clearestLens).toBe('good.ts')
    expect(result.stats.sharpestFocus).toBe('good.ts')
    expect(result.stats.bestWarning).toBe('good.ts')
  })

  it('returns empty best files for no files', () => {
    const result = buildLighthouseLensResult([], [])
    expect(result.stats.bestReading).toBe('')
    expect(result.stats.brightestBeam).toBe('')
  })

  it('handles options parameter', () => {
    const result = buildLighthouseLensResult(['a.ts'], [''], { verbose: true })
    expect(result.readings).toHaveLength(1)
  })

  it('tracks boolean counts in stats', () => {
    const result = buildLighthouseLensResult(['a.ts'], ['export function foo(a: number): void {}'])
    expect(result.stats.hasSharpFocusCount).toBe(1)
    expect(result.stats.isBrightCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isReliableCount).toBe(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('lighthouse-lens scoreColor', () => {
  it('returns green for high score', () => {
    expect(scoreColor(85)).toContain('85')
  })

  it('returns yellow for medium score', () => {
    expect(scoreColor(50)).toContain('50')
  })

  it('returns red for low score', () => {
    expect(scoreColor(20)).toContain('20')
  })
})

describe('lighthouse-lens beamTypeColor', () => {
  it('colors fresnel', () => {
    expect(beamTypeColor('fresnel')).toContain('fresnel')
  })

  it('colors candle', () => {
    expect(beamTypeColor('candle')).toContain('candle')
  })
})

describe('lighthouse-lens conditionColor', () => {
  it('colors pharos-of-alexandria', () => {
    expect(conditionColor('pharos-of-alexandria')).toContain('pharos-of-alexandria')
  })

  it('colors shipwreck', () => {
    expect(conditionColor('shipwreck')).toContain('shipwreck')
  })
})

describe('lighthouse-lens materialColor', () => {
  it('colors crystal', () => {
    expect(materialColor('crystal')).toContain('crystal')
  })

  it('colors cracked', () => {
    expect(materialColor('cracked')).toContain('cracked')
  })
})

describe('lighthouse-lens patternColor', () => {
  it('colors quick-flashing', () => {
    expect(patternColor('quick-flashing')).toContain('quick-flashing')
  })

  it('colors fixed', () => {
    expect(patternColor('fixed')).toContain('fixed')
  })
})

describe('lighthouse-lens visConditionColor', () => {
  it('colors excellent', () => {
    expect(visConditionColor('excellent')).toContain('excellent')
  })

  it('colors zero', () => {
    expect(visConditionColor('zero')).toContain('zero')
  })
})

describe('lighthouse-lens warningTypeColor', () => {
  it('colors fog-horn', () => {
    expect(warningTypeColor('fog-horn')).toContain('fog-horn')
  })

  it('colors silent', () => {
    expect(warningTypeColor('silent')).toContain('silent')
  })
})

describe('lighthouse-lens keeperGradeColor', () => {
  it('colors head-keeper', () => {
    expect(keeperGradeColor('head-keeper')).toContain('head-keeper')
  })

  it('colors sleepwalker', () => {
    expect(keeperGradeColor('sleepwalker')).toContain('sleepwalker')
  })
})

describe('lighthouse-lens stationCondColor', () => {
  it('colors coast-guard-standard', () => {
    expect(stationCondColor('coast-guard-standard')).toContain('coast-guard-standard')
  })

  it('colors dark-coast', () => {
    expect(stationCondColor('dark-coast')).toContain('dark-coast')
  })
})

describe('lighthouse-lens formatReading', () => {
  it('formats non-verbose reading', () => {
    const reading = analyzeLensReading('', 'test.ts')
    const output = formatReading(reading, false)
    expect(output).toContain('test.ts')
    expect(output).toContain('shipwreck')
  })

  it('formats verbose reading with details', () => {
    const reading = analyzeLensReading('export function foo(a: number): void {}', 'foo.ts')
    const output = formatReading(reading, true)
    expect(output).toContain('foo.ts')
    expect(output).toContain('Beam:')
    expect(output).toContain('Lens:')
    expect(output).toContain('Warning:')
  })
})

describe('lighthouse-lens formatStation', () => {
  it('formats non-verbose station', () => {
    const reading = analyzeLensReading('', 'test.ts')
    const station = analyzeCoastalStation([reading], 'src')
    const output = formatStation(station, false)
    expect(output).toContain('src')
    expect(output).toContain('readings=1')
  })

  it('formats verbose station with reading details', () => {
    const reading = analyzeLensReading('export function foo(): void {}', 'foo.ts')
    const station = analyzeCoastalStation([reading], 'src')
    const output = formatStation(station, true)
    expect(output).toContain('foo.ts')
  })
})

describe('lighthouse-lens formatStats', () => {
  it('formats stats summary', () => {
    const result = buildLighthouseLensResult(['a.ts'], [''])
    const output = formatStats(result.stats)
    expect(output).toContain('Files')
    expect(output).toContain('Stations')
    expect(output).toContain('Overall')
    expect(output).toContain('Grade')
  })
})

describe('lighthouse-lens formatLighthouseLensTable', () => {
  it('formats table output', () => {
    const result = buildLighthouseLensResult(['a.ts'], ['export function foo(): void {}'])
    const output = formatLighthouseLensTable(result, false)
    expect(output).toContain('Lighthouse Lens Analysis')
    expect(output).toContain('Lens Readings')
    expect(output).toContain('Coastal Stations')
    expect(output).toContain('Statistics')
  })

  it('includes verbose details', () => {
    const result = buildLighthouseLensResult(['a.ts'], ['export function foo(): void {}'])
    const output = formatLighthouseLensTable(result, true)
    expect(output).toContain('Beam:')
  })

  it('includes recommendations', () => {
    const result = buildLighthouseLensResult(['a.ts'], [''])
    const output = formatLighthouseLensTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

describe('lighthouse-lens formatLighthouseLensJson', () => {
  it('formats JSON output', () => {
    const result = buildLighthouseLensResult(['a.ts'], [''])
    const output = formatLighthouseLensJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('produces valid JSON', () => {
    const result = buildLighthouseLensResult([], [])
    const output = formatLighthouseLensJson(result)
    expect(() => JSON.parse(output)).not.toThrow()
  })
})
