import { describe, it, expect } from 'vitest'

// ─── Imports ────────────────────────────────────────────────────────────────

import {
  countLoc,
  countFunctions,
  countClasses,
  countInterfaces,
  countTypes,
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
  countPrivateMembers,
  countAsync,
  countAwait,
  countPromises,
  countReturns,
  countThrow,
  countConditionals,
  countLoops,
  countSwitches,
  countNullChecks,
  countTypeGuards,
  measurePipe,
  measureValve,
  measurePressure,
  measureFlow,
  measureLeak,
  measureFiltration,
  analyzePipelineSegment,
  classifySegmentCondition,
  classifyEngineerGrade,
  classifyZoneCondition,
  classifyZoneType,
  analyzePipelineZone,
  generateRecommendations,
  buildPipelineValveResult,
} from '../src/commands/pipeline-valve-helpers.js'

import {
  scoreColor,
  materialColor,
  conditionColor,
  valveTypeColor,
  pressureLevelColor,
  flowPatternColor,
  leakStatusColor,
  filtrationTypeColor,
  engineerGradeColor,
  zoneCondColor,
  formatSegment,
  formatZone,
  formatStats,
  formatPipelineValveTable,
  formatPipelineValveJson,
} from '../src/commands/pipeline-valve-format-helpers.js'

import type {
  PipeMeasure,
  ValveMeasure,
  PressureMeasure,
  FlowMeasure,
  LeakMeasure,
  FiltrationMeasure,
} from '../src/commands/pipeline-valve-helpers.js'

// ─── Test Content Fixtures ──────────────────────────────────────────────────

const EMPTY_CONTENT = ''

/** @example minimal export */
const MINIMAL_CONTENT = 'export function add(a: number, b: number): number { return a + b; }'

/** @example rich content with many features */
const RICH_CONTENT = `import { foo } from './bar.js'
import type { Bar } from './types.js'

/** Docs for interface */
export interface Data {
  name: string
  value: number
}

/** Docs for class */
export class Processor implements Data {
  private name: string = ''
  private value: number = 0

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

// ─── countLoc ───────────────────────────────────────────────────────────────

describe('countLoc', () => {
  it('counts empty content as 0', () => {
    expect(countLoc('')).toBe(0)
  })

  it('counts single line as 1', () => {
    expect(countLoc('hello')).toBe(1)
  })

  it('counts multiple lines', () => {
    expect(countLoc('a\n\nb\nc')).toBe(3)
  })
})

// ─── countFunctions ─────────────────────────────────────────────────────────

describe('countFunctions', () => {
  it('counts zero for empty content', () => {
    expect(countFunctions('')).toBe(0)
  })

  it('counts function declarations', () => {
    expect(countFunctions('function foo() {}')).toBe(1)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const x = () => 1')).toBe(1)
  })
})

// ─── countClasses ───────────────────────────────────────────────────────────

describe('countClasses', () => {
  it('counts zero for empty content', () => {
    expect(countClasses('')).toBe(0)
  })

  it('counts class declarations', () => {
    expect(countClasses('class A {}')).toBe(1)
  })
})

// ─── countInterfaces ────────────────────────────────────────────────────────

describe('countInterfaces', () => {
  it('counts zero for empty content', () => {
    expect(countInterfaces('')).toBe(0)
  })

  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })
})

// ─── countTypes ─────────────────────────────────────────────────────────────

describe('countTypes', () => {
  it('counts zero for empty content', () => {
    expect(countTypes('')).toBe(0)
  })

  it('counts type aliases', () => {
    expect(countTypes('type X = string')).toBe(1)
  })
})

// ─── countExports ───────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts zero for empty content', () => {
    expect(countExports('')).toBe(0)
  })

  it('counts export declarations', () => {
    expect(countExports('export const a = 1')).toBe(1)
  })
})

// ─── countImports ───────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts zero for empty content', () => {
    expect(countImports('')).toBe(0)
  })

  it('counts import declarations', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
  })
})

// ─── countJSDoc ─────────────────────────────────────────────────────────────

describe('countJSDoc', () => {
  it('counts zero for empty content', () => {
    expect(countJSDoc('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */')).toBe(1)
  })
})

// ─── countComments ──────────────────────────────────────────────────────────

describe('countComments', () => {
  it('counts zero for empty content', () => {
    expect(countComments('')).toBe(0)
  })

  it('counts inline comments', () => {
    expect(countComments('// inline')).toBe(1)
  })

  it('counts block comments', () => {
    expect(countComments('/* block */')).toBe(1)
  })
})

// ─── countErrorHandling ─────────────────────────────────────────────────────

describe('countErrorHandling', () => {
  it('counts zero for empty content', () => {
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts try-catch blocks', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(1)
  })
})

// ─── countTypeAnnotations ───────────────────────────────────────────────────

describe('countTypeAnnotations', () => {
  it('counts zero for empty content', () => {
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })
})

// ─── countTodos ─────────────────────────────────────────────────────────────

describe('countTodos', () => {
  it('counts zero for empty content', () => {
    expect(countTodos('')).toBe(0)
  })

  it('counts TODO comments', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
  })
})

// ─── countConsole ───────────────────────────────────────────────────────────

describe('countConsole', () => {
  it('counts zero for empty content', () => {
    expect(countConsole('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log(1)')).toBe(1)
  })
})

// ─── countBranches ──────────────────────────────────────────────────────────

describe('countBranches', () => {
  it('counts zero for empty content', () => {
    expect(countBranches('')).toBe(0)
  })

  it('counts if statements', () => {
    expect(countBranches('if (x) {}')).toBe(1)
  })
})

// ─── countDescriptiveNames ──────────────────────────────────────────────────

describe('countDescriptiveNames', () => {
  it('counts zero for empty content', () => {
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts descriptive function names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
  })
})

// ─── countDefaults ──────────────────────────────────────────────────────────

describe('countDefaults', () => {
  it('counts zero for empty content', () => {
    expect(countDefaults('')).toBe(0)
  })

  it('counts default exports', () => {
    expect(countDefaults('export default class {}')).toBe(1)
  })
})

// ─── countDeprecated ────────────────────────────────────────────────────────

describe('countDeprecated', () => {
  it('counts zero for empty content', () => {
    expect(countDeprecated('')).toBe(0)
  })

  it('counts deprecated annotations', () => {
    expect(countDeprecated('@deprecated')).toBe(1)
  })
})

// ─── countReturnTypes ───────────────────────────────────────────────────────

describe('countReturnTypes', () => {
  it('counts zero for empty content', () => {
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts return type annotations', () => {
    expect(countReturnTypes('function foo(): string {}')).toBe(1)
  })
})

// ─── countGenerics ──────────────────────────────────────────────────────────

describe('countGenerics', () => {
  it('counts zero for empty content', () => {
    expect(countGenerics('')).toBe(0)
  })

  it('counts generic type parameters', () => {
    expect(countGenerics('function foo<T>() {}')).toBe(1)
  })
})

// ─── countPrivateMembers ────────────────────────────────────────────────────

describe('countPrivateMembers', () => {
  it('counts zero for empty content', () => {
    expect(countPrivateMembers('')).toBe(0)
  })

  it('counts private members', () => {
    expect(countPrivateMembers('private x: number')).toBe(1)
  })
})

// ─── countAsync ─────────────────────────────────────────────────────────────

describe('countAsync', () => {
  it('counts zero for empty content', () => {
    expect(countAsync('')).toBe(0)
  })

  it('counts async functions', () => {
    expect(countAsync('async function foo() {}')).toBe(1)
  })
})

// ─── countAwait ─────────────────────────────────────────────────────────────

describe('countAwait', () => {
  it('counts zero for empty content', () => {
    expect(countAwait('')).toBe(0)
  })

  it('counts await expressions', () => {
    expect(countAwait('await foo()')).toBe(1)
  })
})

// ─── countPromises ──────────────────────────────────────────────────────────

describe('countPromises', () => {
  it('counts zero for empty content', () => {
    expect(countPromises('')).toBe(0)
  })

  it('counts Promise references', () => {
    expect(countPromises('new Promise')).toBe(1)
  })
})

// ─── countReturns ───────────────────────────────────────────────────────────

describe('countReturns', () => {
  it('counts zero for empty content', () => {
    expect(countReturns('')).toBe(0)
  })

  it('counts return statements', () => {
    expect(countReturns('return x')).toBe(1)
  })
})

// ─── countThrow ─────────────────────────────────────────────────────────────

describe('countThrow', () => {
  it('counts zero for empty content', () => {
    expect(countThrow('')).toBe(0)
  })

  it('counts throw statements', () => {
    expect(countThrow('throw new Error()')).toBe(1)
  })
})

// ─── countConditionals ──────────────────────────────────────────────────────

describe('countConditionals', () => {
  it('counts zero for empty content', () => {
    expect(countConditionals('')).toBe(0)
  })

  it('counts ternary expressions', () => {
    expect(countConditionals('x ? a : b')).toBe(1)
  })
})

// ─── countLoops ─────────────────────────────────────────────────────────────

describe('countLoops', () => {
  it('counts zero for empty content', () => {
    expect(countLoops('')).toBe(0)
  })

  it('counts for loops', () => {
    expect(countLoops('for (let i = 0; i < n; i++) {}')).toBe(1)
  })
})

// ─── countSwitches ──────────────────────────────────────────────────────────

describe('countSwitches', () => {
  it('counts zero for empty content', () => {
    expect(countSwitches('')).toBe(0)
  })

  it('counts switch statements', () => {
    expect(countSwitches('switch(x) {}')).toBe(1)
  })
})

// ─── countNullChecks ────────────────────────────────────────────────────────

describe('countNullChecks', () => {
  it('counts zero for empty content', () => {
    expect(countNullChecks('')).toBe(0)
  })

  it('counts null checks', () => {
    expect(countNullChecks('x === null')).toBe(1)
  })
})

// ─── countTypeGuards ────────────────────────────────────────────────────────

describe('countTypeGuards', () => {
  it('counts zero for empty content', () => {
    expect(countTypeGuards('')).toBe(0)
  })

  it('counts typeof guards', () => {
    expect(countTypeGuards("typeof x === 'string'")).toBe(1)
  })
})

// ─── measurePipe ────────────────────────────────────────────────────────────

describe('measurePipe', () => {
  it('returns bamboo pipe for empty content', () => {
    const pipe = measurePipe(EMPTY_CONTENT)
    expect(pipe.integrity).toBe(10)
    expect(pipe.material).toBe('bamboo')
    expect(pipe.isIntact).toBe(false)
    expect(pipe.hasNoCorrosion).toBe(true)
    expect(pipe.hasNoBlockage).toBe(true)
    expect(pipe.hasProperJoints).toBe(false)
    expect(pipe.hasSeamlessConnections).toBe(false)
    expect(pipe.hasInsulation).toBe(false)
    expect(pipe.hasPressureRating).toBe(false)
    expect(pipe.corrosionCount).toBe(0)
    expect(pipe.blockageCount).toBe(0)
  })

  it('returns pvc pipe for minimal content', () => {
    const pipe = measurePipe(MINIMAL_CONTENT)
    expect(pipe.integrity).toBe(44)
    expect(pipe.material).toBe('pvc')
    expect(pipe.isIntact).toBe(false)
    expect(pipe.hasNoCorrosion).toBe(true)
    expect(pipe.hasProperJoints).toBe(true)
    expect(pipe.hasInsulation).toBe(true)
  })

  it('returns steel pipe for rich content', () => {
    const pipe = measurePipe(RICH_CONTENT)
    expect(pipe.integrity).toBe(95)
    expect(pipe.material).toBe('steel')
    expect(pipe.isIntact).toBe(true)
    expect(pipe.hasProperJoints).toBe(true)
    expect(pipe.hasSeamlessConnections).toBe(true)
    expect(pipe.hasInsulation).toBe(true)
    expect(pipe.hasPressureRating).toBe(true)
  })
})

// ─── measureValve ───────────────────────────────────────────────────────────

describe('measureValve', () => {
  it('returns broken valve for empty content', () => {
    const valve = measureValve(EMPTY_CONTENT)
    expect(valve.control).toBe(10)
    expect(valve.type).toBe('broken')
    expect(valve.isResponsive).toBe(false)
    expect(valve.hasShutOff).toBe(false)
    expect(valve.hasStuckValve).toBe(false)
    expect(valve.stuckCount).toBe(0)
  })

  it('returns check valve for minimal content', () => {
    const valve = measureValve(MINIMAL_CONTENT)
    expect(valve.control).toBe(36)
    expect(valve.type).toBe('check')
    expect(valve.isResponsive).toBe(false)
    expect(valve.hasBackflowPrevention).toBe(true)
    expect(valve.hasProperSeating).toBe(true)
  })
})

// ─── measurePressure ────────────────────────────────────────────────────────

describe('measurePressure', () => {
  it('returns vacuum level for empty content', () => {
    const pressure = measurePressure(EMPTY_CONTENT)
    expect(pressure.regulation).toBe(10)
    expect(pressure.level).toBe('vacuum')
    expect(pressure.isRegulated).toBe(false)
    expect(pressure.hasFrozen).toBe(true)
    expect(pressure.hasBurst).toBe(false)
  })

  it('returns explosive level for minimal content', () => {
    const pressure = measurePressure(MINIMAL_CONTENT)
    expect(pressure.regulation).toBe(31)
    expect(pressure.level).toBe('explosive')
    expect(pressure.isRegulated).toBe(false)
  })

  it('returns high level for rich content', () => {
    const pressure = measurePressure(RICH_CONTENT)
    expect(pressure.regulation).toBe(60)
    expect(pressure.level).toBe('high')
    expect(pressure.isRegulated).toBe(true)
    expect(pressure.hasSafetyValve).toBe(true)
    expect(pressure.hasDecompression).toBe(true)
  })
})

// ─── measureFlow ────────────────────────────────────────────────────────────

describe('measureFlow', () => {
  it('returns stagnant pattern for empty content', () => {
    const flow = measureFlow(EMPTY_CONTENT)
    expect(flow.rate).toBe(10)
    expect(flow.pattern).toBe('stagnant')
    expect(flow.isOptimal).toBe(false)
    expect(flow.hasLaminarFlow).toBe(false)
    expect(flow.hasNoDeadLegs).toBe(true)
    expect(flow.hasStagnation).toBe(false)
  })

  it('returns turbulent pattern for minimal content', () => {
    const flow = measureFlow(MINIMAL_CONTENT)
    expect(flow.rate).toBe(32)
    expect(flow.pattern).toBe('turbulent')
    expect(flow.isOptimal).toBe(false)
  })

  it('returns pulsating pattern for rich content', () => {
    const flow = measureFlow(RICH_CONTENT)
    expect(flow.rate).toBe(56)
    expect(flow.pattern).toBe('pulsating')
    expect(flow.hasNoDeadLegs).toBe(true)
    expect(flow.hasProperGradient).toBe(true)
    expect(flow.hasFlowMetering).toBe(true)
  })
})

// ─── measureLeak ────────────────────────────────────────────────────────────

describe('measureLeak', () => {
  it('returns sealed status for empty content', () => {
    const leak = measureLeak(EMPTY_CONTENT)
    expect(leak.detection).toBe(10)
    expect(leak.status).toBe('sealed')
    expect(leak.hasNoLeaks).toBe(true)
    expect(leak.hasDataLeak).toBe(false)
    expect(leak.hasErrorLeak).toBe(false)
    expect(leak.leakPointCount).toBe(0)
  })

  it('returns dripping status for minimal content', () => {
    const leak = measureLeak(MINIMAL_CONTENT)
    expect(leak.detection).toBe(32)
    expect(leak.status).toBe('dripping')
    expect(leak.hasNoLeaks).toBe(false)
    expect(leak.hasErrorLeak).toBe(true)
    expect(leak.leakPointCount).toBe(1)
  })

  it('returns leaking status for rich content', () => {
    const leak = measureLeak(RICH_CONTENT)
    expect(leak.detection).toBe(70)
    expect(leak.status).toBe('leaking')
    expect(leak.hasDataLeak).toBe(true)
    expect(leak.hasAbstractionLeak).toBe(true)
    expect(leak.hasCondensation).toBe(true)
    expect(leak.hasSealIntegrity).toBe(true)
    expect(leak.hasGasketCondition).toBe(true)
    expect(leak.leakPointCount).toBe(2)
  })
})

// ─── measureFiltration ──────────────────────────────────────────────────────

describe('measureFiltration', () => {
  it('returns none type for empty content', () => {
    const filtration = measureFiltration(EMPTY_CONTENT)
    expect(filtration.quality).toBe(10)
    expect(filtration.type).toBe('none')
    expect(filtration.hasInputValidation).toBe(false)
    expect(filtration.hasOutputValidation).toBe(false)
    expect(filtration.bypassCount).toBe(0)
  })

  it('returns sieve type for minimal content', () => {
    const filtration = measureFiltration(MINIMAL_CONTENT)
    expect(filtration.quality).toBe(34)
    expect(filtration.type).toBe('sieve')
    expect(filtration.hasTypeChecking).toBe(true)
    expect(filtration.hasOutputValidation).toBe(true)
  })

  it('returns sand type for rich content', () => {
    const filtration = measureFiltration(RICH_CONTENT)
    expect(filtration.quality).toBe(58)
    expect(filtration.type).toBe('sand')
    expect(filtration.hasTypeChecking).toBe(true)
    expect(filtration.hasSanitization).toBe(true)
    expect(filtration.hasNormalization).toBe(true)
    expect(filtration.hasUVTreatment).toBe(true)
  })
})

// ─── analyzePipelineSegment ─────────────────────────────────────────────────

describe('analyzePipelineSegment', () => {
  it('returns burst-main for empty content', () => {
    const seg = analyzePipelineSegment(EMPTY_CONTENT, 'empty.ts')
    expect(seg.file).toBe('empty.ts')
    expect(seg.qualityScore).toBe(10)
    expect(seg.condition).toBe('burst-main')
    expect(seg.pipeIntegrity).toBe(10)
    expect(seg.valveControl).toBe(10)
    expect(seg.flowRate).toBe(10)
  })

  it('returns aging-infrastructure for minimal content', () => {
    const seg = analyzePipelineSegment(MINIMAL_CONTENT, 'minimal.ts')
    expect(seg.file).toBe('minimal.ts')
    expect(seg.qualityScore).toBe(35)
    expect(seg.condition).toBe('aging-infrastructure')
  })

  it('returns standard-piping for rich content', () => {
    const seg = analyzePipelineSegment(RICH_CONTENT, 'rich.ts')
    expect(seg.file).toBe('rich.ts')
    expect(seg.qualityScore).toBe(64)
    expect(seg.condition).toBe('standard-piping')
    expect(seg.pipe.isIntact).toBe(true)
  })
})

// ─── classifySegmentCondition ───────────────────────────────────────────────

describe('classifySegmentCondition', () => {
  it('classifies high-pressure-system for score >= 85 with intact pipe and responsive valve', () => {
    expect(classifySegmentCondition(90, { isIntact: true } as Partial<PipeMeasure> as PipeMeasure, { isResponsive: true } as Partial<ValveMeasure> as ValveMeasure)).toBe('high-pressure-system')
  })

  it('classifies modern-pipeline for score >= 70 with intact pipe', () => {
    expect(classifySegmentCondition(70, { isIntact: true } as Partial<PipeMeasure> as PipeMeasure, { isResponsive: false } as Partial<ValveMeasure> as ValveMeasure)).toBe('modern-pipeline')
  })

  it('classifies standard-piping for score >= 50 with proper joints', () => {
    expect(classifySegmentCondition(55, { isIntact: false, hasProperJoints: true } as Partial<PipeMeasure> as PipeMeasure, { isResponsive: false } as Partial<ValveMeasure> as ValveMeasure)).toBe('standard-piping')
  })

  it('classifies aging-infrastructure for score >= 35', () => {
    expect(classifySegmentCondition(40, { isIntact: false, hasProperJoints: false } as Partial<PipeMeasure> as PipeMeasure, { isResponsive: false } as Partial<ValveMeasure> as ValveMeasure)).toBe('aging-infrastructure')
  })

  it('classifies leaky-pipes for score >= 20', () => {
    expect(classifySegmentCondition(25, {} as Partial<PipeMeasure> as PipeMeasure, {} as Partial<ValveMeasure> as ValveMeasure)).toBe('leaky-pipes')
  })

  it('classifies burst-main for low score', () => {
    expect(classifySegmentCondition(10, {} as Partial<PipeMeasure> as PipeMeasure, {} as Partial<ValveMeasure> as ValveMeasure)).toBe('burst-main')
  })
})

// ─── classifyEngineerGrade ──────────────────────────────────────────────────

describe('classifyEngineerGrade', () => {
  it('returns chief-engineer for score >= 85', () => {
    expect(classifyEngineerGrade(90)).toBe('chief-engineer')
  })

  it('returns senior-engineer for score >= 70', () => {
    expect(classifyEngineerGrade(70)).toBe('senior-engineer')
  })

  it('returns engineer for score >= 50', () => {
    expect(classifyEngineerGrade(50)).toBe('engineer')
  })

  it('returns plumber for score >= 30', () => {
    expect(classifyEngineerGrade(30)).toBe('plumber')
  })

  it('returns apprentice for score >= 15', () => {
    expect(classifyEngineerGrade(15)).toBe('apprentice')
  })

  it('returns wrench-monkey for score < 15', () => {
    expect(classifyEngineerGrade(5)).toBe('wrench-monkey')
  })
})

// ─── classifyZoneCondition ──────────────────────────────────────────────────

describe('classifyZoneCondition', () => {
  it('returns municipal-standard for avg >= 80', () => {
    expect(classifyZoneCondition(80)).toBe('municipal-standard')
  })

  it('returns industrial-grade for avg >= 65', () => {
    expect(classifyZoneCondition(65)).toBe('industrial-grade')
  })

  it('returns residential for avg >= 50', () => {
    expect(classifyZoneCondition(50)).toBe('residential')
  })

  it('returns temporary for avg >= 35', () => {
    expect(classifyZoneCondition(35)).toBe('temporary')
  })

  it('returns makeshift for avg >= 20', () => {
    expect(classifyZoneCondition(20)).toBe('makeshift')
  })

  it('returns broken for low avg', () => {
    expect(classifyZoneCondition(5)).toBe('broken')
  })
})

// ─── classifyZoneType ───────────────────────────────────────────────────────

describe('classifyZoneType', () => {
  it('returns abandoned for empty segments', () => {
    expect(classifyZoneType([], 0)).toBe('abandoned')
  })

  it('returns service-line for moderate avg pipe', () => {
    const seg = analyzePipelineSegment(MINIMAL_CONTENT, 'moderate.ts')
    expect(classifyZoneType([seg], seg.pipeIntegrity)).toBe('service-line')
  })
})

// ─── analyzePipelineZone ────────────────────────────────────────────────────

describe('analyzePipelineZone', () => {
  it('returns empty zone for no segments', () => {
    const zone = analyzePipelineZone([], 'empty')
    expect(zone.directory).toBe('empty')
    expect(zone.segments).toHaveLength(0)
    expect(zone.avgPipeIntegrity).toBe(0)
    expect(zone.avgValveControl).toBe(0)
    expect(zone.avgFlowRate).toBe(0)
    expect(zone.zoneType).toBe('abandoned')
    expect(zone.condition).toBe('broken')
  })

  it('aggregates multiple segments', () => {
    const s1 = analyzePipelineSegment(EMPTY_CONTENT, 'a.ts')
    const s2 = analyzePipelineSegment(MINIMAL_CONTENT, 'b.ts')
    const zone = analyzePipelineZone([s1, s2], 'src')
    expect(zone.directory).toBe('src')
    expect(zone.segments).toHaveLength(2)
    expect(zone.avgPipeIntegrity).toBe(27)
    expect(zone.burstMainCount).toBe(1)
    expect(zone.sealedCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns insulation recommendation for clean pipe without insulation', () => {
    const pipe = { hasCorrosion: false, hasBlockage: false, hasInsulation: false } as Partial<PipeMeasure> as PipeMeasure
    const valve = { hasShutOff: true, hasStuckValve: false } as Partial<ValveMeasure> as ValveMeasure
    const pressure = { hasBurst: false, hasFrozen: false } as Partial<PressureMeasure> as PressureMeasure
    const flow = { hasStagnation: false } as Partial<FlowMeasure> as FlowMeasure
    const leak = { hasDataLeak: false, hasErrorLeak: false } as Partial<LeakMeasure> as LeakMeasure
    const filtration = { hasInputValidation: true, hasOutputValidation: true } as Partial<FiltrationMeasure> as FiltrationMeasure
    const recs = generateRecommendations(pipe, valve, pressure, flow, leak, filtration)
    expect(recs).toContain('Add type annotations to insulate data flow')
  })

  it('returns multiple recommendations for dirty pipeline', () => {
    const pipe = { hasCorrosion: true, hasBlockage: true, hasInsulation: false } as Partial<PipeMeasure> as PipeMeasure
    const valve = { hasShutOff: false, hasStuckValve: true } as Partial<ValveMeasure> as ValveMeasure
    const pressure = { hasBurst: true, hasFrozen: true } as Partial<PressureMeasure> as PressureMeasure
    const flow = { hasStagnation: true } as Partial<FlowMeasure> as FlowMeasure
    const leak = { hasDataLeak: true, hasErrorLeak: true } as Partial<LeakMeasure> as LeakMeasure
    const filtration = { hasInputValidation: false, hasOutputValidation: false } as Partial<FiltrationMeasure> as FiltrationMeasure
    const recs = generateRecommendations(pipe, valve, pressure, flow, leak, filtration)
    expect(recs.length).toBeGreaterThanOrEqual(10)
    expect(recs).toContain('Remove TODO comments and deprecated markers to prevent pipe corrosion')
    expect(recs).toContain('Add error handling to provide emergency shut-off capability')
    expect(recs).toContain('Remove console statements to seal data leaks')
  })
})

// ─── buildPipelineValveResult ───────────────────────────────────────────────

describe('buildPipelineValveResult', () => {
  it('builds result from empty inputs', () => {
    const result = buildPipelineValveResult([], [])
    expect(result.segments).toHaveLength(0)
    expect(result.zones).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFlow).toBe(0)
  })

  it('builds result from mixed content files', () => {
    const result = buildPipelineValveResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(result.segments).toHaveLength(2)
    expect(result.zones).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalZones).toBe(1)
    expect(result.stats.avgPipeIntegrity).toBe(27)
    expect(result.stats.avgValveControl).toBe(23)
    expect(result.stats.avgPressureRegulation).toBe(21)
    expect(result.stats.avgFlowRate).toBe(21)
    expect(result.stats.avgLeakDetection).toBe(21)
    expect(result.stats.avgFiltrationQuality).toBe(22)
    expect(result.stats.overallFlow).toBe(23)
    expect(result.stats.engineerGrade).toBe('apprentice')
    expect(result.stats.agingInfrastructure).toBe(1)
    expect(result.stats.burstMain).toBe(1)
    expect(result.stats.bestSegment).toBe('b.ts')
    expect(result.stats.strongestPipe).toBe('b.ts')
  })

  it('tracks network correctly', () => {
    const result = buildPipelineValveResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(result.network.avgPipeIntegrity).toBe(27)
    expect(result.network.avgValveControl).toBe(23)
    expect(result.network.avgFlowRate).toBe(21)
    expect(result.network.isFlowing).toBe(false)
    expect(result.network.overallFlow).toBe(23)
  })

  it('tracks counts correctly', () => {
    const result = buildPipelineValveResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(result.stats.isIntactCount).toBe(0)
    expect(result.stats.hasCorrosionCount).toBe(0)
    expect(result.stats.hasBlockageCount).toBe(0)
    expect(result.stats.hasNoLeaksCount).toBe(1)
    expect(result.stats.hasInputValidationCount).toBe(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string for any score', () => {
    expect(typeof scoreColor(10)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(90)).toBe('string')
  })
})

describe('materialColor', () => {
  it('returns a string for each material', () => {
    expect(typeof materialColor('steel')).toBe('string')
    expect(typeof materialColor('copper')).toBe('string')
    expect(typeof materialColor('bamboo')).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns a string for each condition', () => {
    expect(typeof conditionColor('high-pressure-system')).toBe('string')
    expect(typeof conditionColor('burst-main')).toBe('string')
  })
})

describe('valveTypeColor', () => {
  it('returns a string for each valve type', () => {
    expect(typeof valveTypeColor('gate')).toBe('string')
    expect(typeof valveTypeColor('broken')).toBe('string')
  })
})

describe('pressureLevelColor', () => {
  it('returns a string for each level', () => {
    expect(typeof pressureLevelColor('optimal')).toBe('string')
    expect(typeof pressureLevelColor('explosive')).toBe('string')
  })
})

describe('flowPatternColor', () => {
  it('returns a string for each pattern', () => {
    expect(typeof flowPatternColor('laminar')).toBe('string')
    expect(typeof flowPatternColor('stagnant')).toBe('string')
  })
})

describe('leakStatusColor', () => {
  it('returns a string for each status', () => {
    expect(typeof leakStatusColor('sealed')).toBe('string')
    expect(typeof leakStatusColor('ruptured')).toBe('string')
  })
})

describe('filtrationTypeColor', () => {
  it('returns a string for each type', () => {
    expect(typeof filtrationTypeColor('reverse-osmosis')).toBe('string')
    expect(typeof filtrationTypeColor('none')).toBe('string')
  })
})

describe('engineerGradeColor', () => {
  it('returns a string for each grade', () => {
    expect(typeof engineerGradeColor('chief-engineer')).toBe('string')
    expect(typeof engineerGradeColor('wrench-monkey')).toBe('string')
  })
})

describe('zoneCondColor', () => {
  it('returns a string for each condition', () => {
    expect(typeof zoneCondColor('municipal-standard')).toBe('string')
    expect(typeof zoneCondColor('broken')).toBe('string')
  })
})

// ─── formatSegment ──────────────────────────────────────────────────────────

describe('formatSegment', () => {
  it('formats a segment as a string', () => {
    const seg = analyzePipelineSegment(EMPTY_CONTENT, 'test.ts')
    const formatted = formatSegment(seg, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
    expect(formatted).toContain('test.ts')
  })

  it('formats verbose segment with more detail', () => {
    const seg = analyzePipelineSegment(MINIMAL_CONTENT, 'verbose.ts')
    const formatted = formatSegment(seg, true)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

// ─── formatZone ─────────────────────────────────────────────────────────────

describe('formatZone', () => {
  it('formats a zone as a string', () => {
    const seg = analyzePipelineSegment(EMPTY_CONTENT, 'a.ts')
    const zone = analyzePipelineZone([seg], 'src')
    const formatted = formatZone(zone, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('src')
  })
})

// ─── formatStats ────────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats stats as a string', () => {
    const result = buildPipelineValveResult(['a.ts'], [MINIMAL_CONTENT])
    const formatted = formatStats(result.stats)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

// ─── formatPipelineValveTable ───────────────────────────────────────────────

describe('formatPipelineValveTable', () => {
  it('formats full result as a table string', () => {
    const result = buildPipelineValveResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    const formatted = formatPipelineValveTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('formats verbose table', () => {
    const result = buildPipelineValveResult(['a.ts'], [MINIMAL_CONTENT])
    const formatted = formatPipelineValveTable(result, true)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

// ─── formatPipelineValveJson ────────────────────────────────────────────────

describe('formatPipelineValveJson', () => {
  it('formats result as valid JSON string', () => {
    const result = buildPipelineValveResult(['a.ts'], [MINIMAL_CONTENT])
    const jsonStr = formatPipelineValveJson(result)
    expect(typeof jsonStr).toBe('string')
    const parsed = JSON.parse(jsonStr)
    expect(parsed).toBeDefined()
    expect(parsed.segments).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })

  it('includes all top-level keys', () => {
    const result = buildPipelineValveResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    const parsed = JSON.parse(formatPipelineValveJson(result))
    expect(parsed).toHaveProperty('segments')
    expect(parsed).toHaveProperty('zones')
    expect(parsed).toHaveProperty('network')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('serializes empty results', () => {
    const result = buildPipelineValveResult([], [])
    const parsed = JSON.parse(formatPipelineValveJson(result))
    expect(parsed.segments).toHaveLength(0)
    expect(parsed.zones).toHaveLength(0)
  })
})
