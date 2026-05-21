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
  measureVoice,
  measureResonance,
  measureReach,
  measurePresence,
  measureEcho,
  measureArchitecture,
  analyzeAcousticReading,
  classifyReadingCondition,
  classifyAcousticianGrade,
  classifyVenueType,
  classifyVenueCondition,
  analyzeAcousticVenue,
  generateRecommendations,
  buildAmphitheaterAcousticsResult,
  type AcousticReading,
  type AcousticVenue,
} from '../src/commands/amphitheater-acoustics-helpers.js'
import {
  scoreColor,
  voiceRangeColor,
  conditionColor,
  coverageColor,
  performerColor,
  archStyleColor,
  acousticianGradeColor,
  venueConditionColor,
  formatReading,
  formatVenue,
  formatStats,
  formatAmphitheaterAcousticsTable,
  formatAmphitheaterAcousticsJson,
} from '../src/commands/amphitheater-acoustics-format-helpers.js'

// ─── Counting Utilities ─────────────────────────────────

describe('amphitheater-acoustics countLoc', () => {
  it('counts non-empty lines', () => {
    expect(countLoc('a\n\nb\nc')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
  })

  it('returns 0 for whitespace-only', () => {
    expect(countLoc('   \n  \n')).toBe(0)
  })

  it('counts single line', () => {
    expect(countLoc('const x = 1')).toBe(1)
  })
})

describe('amphitheater-acoustics countFunctions', () => {
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

describe('amphitheater-acoustics countClasses', () => {
  it('counts class declarations', () => {
    expect(countClasses('class A {} class B {}')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countClasses('')).toBe(0)
  })
})

describe('amphitheater-acoustics countInterfaces', () => {
  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countInterfaces('')).toBe(0)
  })
})

describe('amphitheater-acoustics countTypes', () => {
  it('counts type aliases', () => {
    expect(countTypes('type X = string')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countTypes('')).toBe(0)
  })
})

describe('amphitheater-acoustics countEnums', () => {
  it('counts enum declarations', () => {
    expect(countEnums('enum Dir { Up }')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countEnums('')).toBe(0)
  })
})

describe('amphitheater-acoustics countExports', () => {
  it('counts export statements', () => {
    expect(countExports('export const a = 1\nexport { b }')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countExports('')).toBe(0)
  })
})

describe('amphitheater-acoustics countImports', () => {
  it('counts import statements', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countImports('')).toBe(0)
  })
})

describe('amphitheater-acoustics countJSDoc', () => {
  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */ const x = 1')).toBe(1)
  })

  it('returns 0 for no JSDoc', () => {
    expect(countJSDoc('const x = 1')).toBe(0)
  })
})

describe('amphitheater-acoustics countComments', () => {
  it('counts line and block comments', () => {
    expect(countComments('// inline\n/* block */')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countComments('')).toBe(0)
  })
})

describe('amphitheater-acoustics countErrorHandling', () => {
  it('counts try/catch/finally/throw', () => {
    expect(countErrorHandling('try {} catch(e) {} finally {}')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countErrorHandling('')).toBe(0)
  })
})

describe('amphitheater-acoustics countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countTypeAnnotations('')).toBe(0)
  })
})

describe('amphitheater-acoustics countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countTodos('')).toBe(0)
  })
})

describe('amphitheater-acoustics countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log(1)')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countConsole('')).toBe(0)
  })
})

describe('amphitheater-acoustics countBranches', () => {
  it('counts if as a branch', () => {
    expect(countBranches('if (x) {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countBranches('')).toBe(0)
  })
})

describe('amphitheater-acoustics countDescriptiveNames', () => {
  it('counts descriptive function names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countDescriptiveNames('')).toBe(0)
  })
})

describe('amphitheater-acoustics countDefaults', () => {
  it('counts default keywords', () => {
    expect(countDefaults('export default class {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countDefaults('')).toBe(0)
  })
})

describe('amphitheater-acoustics countDeprecated', () => {
  it('counts deprecated markers', () => {
    expect(countDeprecated('@deprecated')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countDeprecated('')).toBe(0)
  })
})

describe('amphitheater-acoustics countReturnTypes', () => {
  it('counts return type annotations', () => {
    expect(countReturnTypes('function foo(): string {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countReturnTypes('')).toBe(0)
  })
})

describe('amphitheater-acoustics countGenerics', () => {
  it('counts generic type parameters', () => {
    expect(countGenerics('function foo<T>() {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countGenerics('')).toBe(0)
  })
})

describe('amphitheater-acoustics countArrowFunctions', () => {
  it('counts arrow functions', () => {
    expect(countArrowFunctions('const f = () => 1')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countArrowFunctions('')).toBe(0)
  })
})

describe('amphitheater-acoustics countAsync', () => {
  it('counts async keywords', () => {
    expect(countAsync('async function foo() {}')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countAsync('')).toBe(0)
  })
})

describe('amphitheater-acoustics countAwait', () => {
  it('counts await keywords', () => {
    expect(countAwait('await foo()')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countAwait('')).toBe(0)
  })
})

describe('amphitheater-acoustics countPrivateMembers', () => {
  it('counts private members', () => {
    expect(countPrivateMembers('private x: number')).toBe(1)
  })

  it('returns 0 for empty string', () => {
    expect(countPrivateMembers('')).toBe(0)
  })
})

// ─── Measure Functions ──────────────────────────────────

describe('amphitheater-acoustics measureVoice', () => {
  it('returns default values for empty content', () => {
    const voice = measureVoice('')
    expect(voice.projection).toBe(10)
    expect(voice.range).toBe('silence')
    expect(voice.isClear).toBe(false)
    expect(voice.hasGoodDiction).toBe(false)
    expect(voice.hasMumble).toBe(false)
    expect(voice.mumbleCount).toBe(0)
  })

  it('measures minimal export function', () => {
    const voice = measureVoice('export function add(a: number, b: number): number { return a + b; }')
    expect(voice.projection).toBe(75)
    expect(voice.range).toBe('presentation')
    expect(voice.isClear).toBe(true)
    expect(voice.hasProjection).toBe(true)
    expect(voice.hasVolume).toBe(true)
  })

  it('detects mumble from todos and console', () => {
    const voice = measureVoice('// TODO: fix this\nconsole.log("debug")')
    expect(voice.hasMumble).toBe(true)
    expect(voice.mumbleCount).toBe(2)
  })

  it('detects clear voice with exports and types', () => {
    const voice = measureVoice('export function foo(a: number): void {}')
    expect(voice.isClear).toBe(true)
  })

  it('detects good diction with descriptive names and functions', () => {
    const voice = measureVoice('function getData() {} function parseInput() {}')
    expect(voice.hasGoodDiction).toBe(true)
  })
})

describe('amphitheater-acoustics measureResonance', () => {
  it('returns default values for empty content', () => {
    const res = measureResonance('')
    expect(res.quality).toBe(10)
    expect(res.frequency).toBe(5)
    expect(res.hasHarmonicResonance).toBe(false)
    expect(res.interferenceCount).toBe(0)
  })

  it('measures minimal content', () => {
    const res = measureResonance('export function add(a: number, b: number): number { return a + b; }')
    expect(res.quality).toBe(50)
    expect(res.frequency).toBe(8)
    expect(res.hasFeedback).toBe(false)
  })

  it('detects harmonic resonance with exports, types, and errors', () => {
    const res = measureResonance('export function foo(a: number): number { try {} catch(e) {} return 1 }')
    expect(res.hasHarmonicResonance).toBe(true)
  })

  it('detects destructive interference', () => {
    const res = measureResonance('// TODO\n// TODO\n// TODO')
    expect(res.hasDestructiveInterference).toBe(true)
    expect(res.interferenceCount).toBe(3)
  })
})

describe('amphitheater-acoustics measureReach', () => {
  it('returns default values for empty content', () => {
    const reach = measureReach('')
    expect(reach.audience).toBe(5)
    expect(reach.coverage).toBe('parking-lot')
    expect(reach.isAccessible).toBe(false)
    expect(reach.programNoteCount).toBe(0)
  })

  it('measures minimal content', () => {
    const reach = measureReach('export function add(a: number, b: number): number { return a + b; }')
    expect(reach.audience).toBe(35)
    expect(reach.coverage).toBe('balcony')
    expect(reach.isAccessible).toBe(true)
  })

  it('detects program notes from JSDoc', () => {
    const reach = measureReach('/** docs */\nexport function foo(a: number): void {}')
    expect(reach.hasProgramNotes).toBe(true)
    expect(reach.programNoteCount).toBe(1)
  })

  it('detects audio description from descriptive names', () => {
    const reach = measureReach('function getData() {}')
    expect(reach.hasAudioDescription).toBe(true)
  })
})

describe('amphitheater-acoustics measurePresence', () => {
  it('returns default values for empty content', () => {
    const pres = measurePresence('')
    expect(pres.quality).toBe(5)
    expect(pres.performer).toBe('audience-member')
    expect(pres.hasStagePresence).toBe(false)
  })

  it('measures minimal content', () => {
    const pres = measurePresence('export function add(a: number, b: number): number { return a + b; }')
    expect(pres.quality).toBe(35)
    expect(pres.performer).toBe('chorus')
  })

  it('detects stage presence with 3+ JSDoc blocks', () => {
    const content = '/** a */\n/** b */\n/** c */\nexport function foo() {}'
    const pres = measurePresence(content)
    expect(pres.hasStagePresence).toBe(true)
  })

  it('detects program from any JSDoc', () => {
    const pres = measurePresence('/** doc */\nfunction foo() {}')
    expect(pres.hasProgram).toBe(true)
  })
})

describe('amphitheater-acoustics measureEcho', () => {
  it('returns default values for empty content', () => {
    const echo = measureEcho('')
    expect(echo.quality).toBe(10)
    expect(echo.hasCleanEcho).toBe(false)
    expect(echo.shadowCount).toBe(0)
  })

  it('detects clean echo with balanced imports and exports', () => {
    const echo = measureEcho("import { a } from 'b'\nexport { a }")
    expect(echo.hasCleanEcho).toBe(true)
    expect(echo.hasPrecedenceEffect).toBe(true)
  })

  it('measures minimal content', () => {
    const echo = measureEcho('export function add(a: number, b: number): number { return a + b; }')
    expect(echo.quality).toBe(25)
  })

  it('detects sound shadows', () => {
    const echo = measureEcho('// TODO: fix\nconsole.log("debug")')
    expect(echo.hasSoundShadow).toBe(true)
    expect(echo.shadowCount).toBe(2)
  })
})

describe('amphitheater-acoustics measureArchitecture', () => {
  it('returns default values for empty content', () => {
    const arch = measureArchitecture('')
    expect(arch.acoustics).toBe(10)
    expect(arch.style).toBe('temporary')
    expect(arch.hasOptimalShape).toBe(false)
    expect(arch.trapCount).toBe(0)
  })

  it('measures minimal content', () => {
    const arch = measureArchitecture('export function add(a: number, b: number): number { return a + b; }')
    expect(arch.acoustics).toBe(35)
    expect(arch.style).toBe('renaissance')
  })

  it('detects optimal shape with interfaces, exports, and imports', () => {
    const arch = measureArchitecture("import { a } from 'b'\nexport interface Foo {}\nexport { a }")
    expect(arch.hasOptimalShape).toBe(true)
  })

  it('detects roman style with generics and interfaces', () => {
    const arch = measureArchitecture('interface Foo {}\nfunction bar<T>() {}')
    expect(arch.style).toBe('roman')
  })
})

// ─── Reading Analysis ───────────────────────────────────

describe('amphitheater-acoustics analyzeAcousticReading', () => {
  it('analyzes empty content', () => {
    const reading = analyzeAcousticReading('', 'empty.ts')
    expect(reading.file).toBe('empty.ts')
    expect(reading.qualityScore).toBe(8)
    expect(reading.condition).toBe('echo-chamber')
    expect(reading.voiceProjection).toBe(10)
    expect(reading.acousticResonance).toBe(10)
  })

  it('analyzes minimal content', () => {
    const reading = analyzeAcousticReading('export function add(a: number, b: number): number { return a + b; }', 'minimal.ts')
    expect(reading.qualityScore).toBe(44)
    expect(reading.condition).toBe('local-theater')
    expect(reading.voice.range).toBe('presentation')
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
    const reading = analyzeAcousticReading(rich, 'src/rich.ts')
    expect(reading.qualityScore).toBe(99)
    expect(reading.condition).toBe('carnegie-hall')
    expect(reading.voice.isClear).toBe(true)
    expect(reading.voice.hasGoodDiction).toBe(true)
    expect(reading.resonance.hasHarmonicResonance).toBe(true)
    expect(reading.reach.coverage).toBe('front-row')
    expect(reading.echo.hasCleanEcho).toBe(true)
    expect(reading.architecture.hasOptimalShape).toBe(true)
  })

  it('computes quality score as weighted average', () => {
    const reading = analyzeAcousticReading('', 'test.ts')
    const expected = Math.min(100, Math.max(0, Math.round(
      reading.voiceProjection * 0.20 +
      reading.acousticResonance * 0.15 +
      reading.audienceReach * 0.15 +
      reading.stagePresence * 0.20 +
      reading.echoQuality * 0.15 +
      reading.architecturalAcoustics * 0.15,
    )))
    expect(reading.qualityScore).toBe(expected)
  })
})

// ─── Classify Functions ─────────────────────────────────

describe('amphitheater-acoustics classifyReadingCondition', () => {
  it('classifies carnegie-hall', () => {
    const voice = { isClear: true } as any
    const pres = { hasOpeningNight: true } as any
    expect(classifyReadingCondition(90, voice, pres)).toBe('carnegie-hall')
  })

  it('classifies sydney-opera', () => {
    const voice = { isClear: false, hasGoodDiction: true } as any
    const pres = { hasOpeningNight: false } as any
    expect(classifyReadingCondition(70, voice, pres)).toBe('sydney-opera')
  })

  it('classifies royal-albert', () => {
    const voice = { isClear: false, hasGoodDiction: false } as any
    const pres = { hasOpeningNight: false } as any
    expect(classifyReadingCondition(55, voice, pres)).toBe('royal-albert')
  })

  it('classifies local-theater', () => {
    const voice = {} as any
    const pres = {} as any
    expect(classifyReadingCondition(40, voice, pres)).toBe('local-theater')
  })

  it('classifies school-auditorium', () => {
    expect(classifyReadingCondition(25, {} as any, {} as any)).toBe('school-auditorium')
  })

  it('classifies echo-chamber', () => {
    expect(classifyReadingCondition(10, {} as any, {} as any)).toBe('echo-chamber')
  })
})

describe('amphitheater-acoustics classifyAcousticianGrade', () => {
  it('classifies master-acoustician', () => {
    expect(classifyAcousticianGrade(90)).toBe('master-acoustician')
  })

  it('classifies sound-engineer', () => {
    expect(classifyAcousticianGrade(70)).toBe('sound-engineer')
  })

  it('classifies audio-engineer', () => {
    expect(classifyAcousticianGrade(50)).toBe('audio-engineer')
  })

  it('classifies sound-technician', () => {
    expect(classifyAcousticianGrade(30)).toBe('sound-technician')
  })

  it('classifies roadie', () => {
    expect(classifyAcousticianGrade(15)).toBe('roadie')
  })

  it('classifies tone-deaf', () => {
    expect(classifyAcousticianGrade(5)).toBe('tone-deaf')
  })
})

describe('amphitheater-acoustics classifyVenueCondition', () => {
  it('classifies world-class', () => {
    expect(classifyVenueCondition(80)).toBe('world-class')
  })

  it('classifies premium', () => {
    expect(classifyVenueCondition(65)).toBe('premium')
  })

  it('classifies professional', () => {
    expect(classifyVenueCondition(50)).toBe('professional')
  })

  it('classifies amateur', () => {
    expect(classifyVenueCondition(35)).toBe('amateur')
  })

  it('classifies hobby', () => {
    expect(classifyVenueCondition(20)).toBe('hobby')
  })

  it('classifies disastrous', () => {
    expect(classifyVenueCondition(5)).toBe('disastrous')
  })
})

describe('amphitheater-acoustics classifyVenueType', () => {
  it('returns closet for empty readings', () => {
    expect(classifyVenueType([], 0)).toBe('closet')
  })

  it('returns closet for low average', () => {
    const readings = [analyzeAcousticReading('', 'a.ts'), analyzeAcousticReading('', 'b.ts')]
    expect(classifyVenueType(readings, 10)).toBe('closet')
  })

  it('returns opera-house for high carnegie ratio', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
`
    const reading = analyzeAcousticReading(rich, 'x.ts')
    expect(classifyVenueType([reading], 100)).toBe('opera-house')
  })
})

// ─── Venue Analysis ─────────────────────────────────────

describe('amphitheater-acoustics analyzeAcousticVenue', () => {
  it('returns defaults for empty readings', () => {
    const venue = analyzeAcousticVenue([], 'empty-dir')
    expect(venue.directory).toBe('empty-dir')
    expect(venue.readings).toHaveLength(0)
    expect(venue.avgVoiceProjection).toBe(0)
    expect(venue.venueType).toBe('closet')
    expect(venue.condition).toBe('disastrous')
  })

  it('analyzes single reading', () => {
    const reading = analyzeAcousticReading('', 'x.ts')
    const venue = analyzeAcousticVenue([reading], 'single')
    expect(venue.avgVoiceProjection).toBe(10)
    expect(venue.venueType).toBe('closet')
    expect(venue.condition).toBe('disastrous')
    expect(venue.echoChamberCount).toBe(1)
  })

  it('computes averages across readings', () => {
    const r1 = analyzeAcousticReading('export function foo(a: number): void {}', 'a.ts')
    const r2 = analyzeAcousticReading('export function bar(b: number): void {}', 'b.ts')
    const venue = analyzeAcousticVenue([r1, r2], 'src')
    expect(venue.avgVoiceProjection).toBe(Math.round((r1.voiceProjection + r2.voiceProjection) / 2))
    expect(venue.readings).toHaveLength(2)
  })
})

// ─── Recommendations ────────────────────────────────────

describe('amphitheater-acoustics generateRecommendations', () => {
  it('generates recommendations for poor code', () => {
    const readings = [analyzeAcousticReading('', 'a.ts')]
    const result = buildAmphitheaterAcousticsResult(['a.ts'], [''])
    const recs = generateRecommendations(readings, result.venues, result.festival, result.stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs).toContain('Add exports, types, and documentation to improve echo-chamber files')
  })

  it('generates no improvement recs for excellent code', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
`
    const result = buildAmphitheaterAcousticsResult(['src/x.ts'], [rich])
    const recs = generateRecommendations(result.readings, result.venues, result.festival, result.stats)
    expect(recs).toContain('This amphitheater has exceptional acoustics — carry the sound forward')
  })
})

// ─── Build Result ───────────────────────────────────────

describe('amphitheater-acoustics buildAmphitheaterAcousticsResult', () => {
  it('builds result from empty inputs', () => {
    const result = buildAmphitheaterAcousticsResult([], [])
    expect(result.readings).toHaveLength(0)
    expect(result.venues).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalVenues).toBe(0)
    expect(result.stats.overallAcoustics).toBe(0)
    expect(result.stats.acousticianGrade).toBe('tone-deaf')
  })

  it('builds result from single file', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], [''])
    expect(result.readings).toHaveLength(1)
    expect(result.venues).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.festival.isHarmonious).toBe(false)
  })

  it('groups files by directory into venues', () => {
    const result = buildAmphitheaterAcousticsResult(['src/a.ts', 'src/b.ts', 'test/c.ts'], ['', '', ''])
    expect(result.venues).toHaveLength(2)
    expect(result.venues.map(v => v.directory)).toContain('src')
    expect(result.venues.map(v => v.directory)).toContain('test')
  })

  it('computes correct stats for mixed content', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts', 'b.ts'], ['', 'export function foo(): void {}'])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgVoiceProjection).toBe(43)
    expect(result.stats.overallAcoustics).toBe(26)
    expect(result.stats.acousticianGrade).toBe('roadie')
    expect(result.stats.echoChamberCount).toBe(1)
    expect(result.stats.localTheaterCount).toBe(1)
    expect(result.stats.bestReading).toBe('b.ts')
  })

  it('identifies best files correctly', () => {
    const result = buildAmphitheaterAcousticsResult(['empty.ts', 'good.ts'], ['', 'export function foo(): void {}'])
    expect(result.stats.bestReading).toBe('good.ts')
    expect(result.stats.clearestVoice).toBe('good.ts')
    expect(result.stats.bestResonance).toBe('good.ts')
    expect(result.stats.widestReach).toBe('good.ts')
    expect(result.stats.bestPresence).toBe('good.ts')
  })

  it('returns empty best files for no files', () => {
    const result = buildAmphitheaterAcousticsResult([], [])
    expect(result.stats.bestReading).toBe('')
    expect(result.stats.clearestVoice).toBe('')
  })

  it('handles options parameter', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], [''], { verbose: true })
    expect(result.readings).toHaveLength(1)
  })

  it('tracks boolean counts in stats', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], ['export function foo(a: number): void {}'])
    expect(result.stats.isClearCount).toBe(1)
    expect(result.stats.hasMumbleCount).toBe(0)
    expect(result.stats.hasIsolationCount).toBe(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('amphitheater-acoustics scoreColor', () => {
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

describe('amphitheater-acoustics voiceRangeColor', () => {
  it('colors oration', () => {
    expect(voiceRangeColor('oration')).toContain('oration')
  })

  it('colors conversation', () => {
    expect(voiceRangeColor('conversation')).toContain('conversation')
  })

  it('colors whisper', () => {
    expect(voiceRangeColor('whisper')).toContain('whisper')
  })

  it('colors unknown range', () => {
    expect(voiceRangeColor('unknown')).toContain('unknown')
  })
})

describe('amphitheater-acoustics conditionColor', () => {
  it('colors carnegie-hall', () => {
    expect(conditionColor('carnegie-hall')).toContain('carnegie-hall')
  })

  it('colors echo-chamber', () => {
    expect(conditionColor('echo-chamber')).toContain('echo-chamber')
  })
})

describe('amphitheater-acoustics coverageColor', () => {
  it('colors front-row', () => {
    expect(coverageColor('front-row')).toContain('front-row')
  })

  it('colors nosebleed', () => {
    expect(coverageColor('nosebleed')).toContain('nosebleed')
  })
})

describe('amphitheater-acoustics performerColor', () => {
  it('colors virtuoso', () => {
    expect(performerColor('virtuoso')).toContain('virtuoso')
  })

  it('colors understudy', () => {
    expect(performerColor('understudy')).toContain('understudy')
  })
})

describe('amphitheater-acoustics archStyleColor', () => {
  it('colors roman', () => {
    expect(archStyleColor('roman')).toContain('roman')
  })

  it('colors modern', () => {
    expect(archStyleColor('modern')).toContain('modern')
  })
})

describe('amphitheater-acoustics acousticianGradeColor', () => {
  it('colors master-acoustician', () => {
    expect(acousticianGradeColor('master-acoustician')).toContain('master-acoustician')
  })

  it('colors roadie', () => {
    expect(acousticianGradeColor('roadie')).toContain('roadie')
  })
})

describe('amphitheater-acoustics venueConditionColor', () => {
  it('colors world-class', () => {
    expect(venueConditionColor('world-class')).toContain('world-class')
  })

  it('colors disastrous', () => {
    expect(venueConditionColor('disastrous')).toContain('disastrous')
  })
})

describe('amphitheater-acoustics formatReading', () => {
  it('formats non-verbose reading', () => {
    const reading = analyzeAcousticReading('', 'test.ts')
    const output = formatReading(reading, false)
    expect(output).toContain('test.ts')
    expect(output).toContain('echo-chamber')
  })

  it('formats verbose reading with details', () => {
    const reading = analyzeAcousticReading('export function foo(a: number): void {}', 'foo.ts')
    const output = formatReading(reading, true)
    expect(output).toContain('foo.ts')
    expect(output).toContain('Voice:')
    expect(output).toContain('Resonance:')
    expect(output).toContain('Architecture:')
  })
})

describe('amphitheater-acoustics formatVenue', () => {
  it('formats non-verbose venue', () => {
    const reading = analyzeAcousticReading('', 'test.ts')
    const venue = analyzeAcousticVenue([reading], 'src')
    const output = formatVenue(venue, false)
    expect(output).toContain('src')
    expect(output).toContain('readings=1')
  })

  it('formats verbose venue with reading details', () => {
    const reading = analyzeAcousticReading('export function foo(): void {}', 'foo.ts')
    const venue = analyzeAcousticVenue([reading], 'src')
    const output = formatVenue(venue, true)
    expect(output).toContain('foo.ts')
  })
})

describe('amphitheater-acoustics formatStats', () => {
  it('formats stats summary', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], [''])
    const output = formatStats(result.stats)
    expect(output).toContain('Files')
    expect(output).toContain('Venues')
    expect(output).toContain('Overall')
    expect(output).toContain('Grade')
  })
})

describe('amphitheater-acoustics formatAmphitheaterAcousticsTable', () => {
  it('formats table output', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], ['export function foo(): void {}'])
    const output = formatAmphitheaterAcousticsTable(result, false)
    expect(output).toContain('Amphitheater Acoustics Analysis')
    expect(output).toContain('Acoustic Readings')
    expect(output).toContain('Venues')
    expect(output).toContain('Statistics')
  })

  it('includes verbose details', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], ['export function foo(): void {}'])
    const output = formatAmphitheaterAcousticsTable(result, true)
    expect(output).toContain('Voice:')
  })

  it('includes recommendations', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], [''])
    const output = formatAmphitheaterAcousticsTable(result, false)
    expect(output).toContain('Recommendations')
  })

  it('omits recommendations when none exist', () => {
    const rich = `import { foo } from './bar.js'
import type { Bar } from './types.js'
/** Docs for interface */
export interface Data { name: string }
/** Docs for class */
export class Processor { process(): void {} }
export function getData(): Data { return { name: 'test' } }
export default Processor
`
    const result = buildAmphitheaterAcousticsResult(['x.ts'], [rich])
    const output = formatAmphitheaterAcousticsTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

describe('amphitheater-acoustics formatAmphitheaterAcousticsJson', () => {
  it('formats JSON output', () => {
    const result = buildAmphitheaterAcousticsResult(['a.ts'], [''])
    const output = formatAmphitheaterAcousticsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('produces valid JSON', () => {
    const result = buildAmphitheaterAcousticsResult([], [])
    const output = formatAmphitheaterAcousticsJson(result)
    expect(() => JSON.parse(output)).not.toThrow()
  })
})
