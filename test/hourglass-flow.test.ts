import { describe, expect, it } from 'vitest'
import {
  analyzeHourglassSet,
  analyzeSandGrain,
  buildHourglassFlowResult,
  classifyCondition,
  classifyHorologistGrade,
  classifySetCondition,
  classifySetType,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  countValidations,
  generateRecommendations,
  maxNesting,
  measureFlow,
  measureGlass,
  measureLowerBulb,
  measureNeck,
  measureSand,
  measureTiming,
  measureUpperBulb,
} from '../src/commands/hourglass-flow-helpers.js'
import {
  formatHourglassFlowJSON,
  formatHourglassFlowReport,
  formatGrainTable,
  formatSetTable,
  formatClockshop,
  formatStats,
  formatRecommendations,
} from '../src/commands/hourglass-flow-format-helpers.js'

// ─── countLoc ────────────────────────────────────────────

describe('countLoc', () => {
  it('counts lines of code', () => {
    expect(countLoc('a\nb\nc')).toBe(3)
  })
  it('ignores blank lines', () => {
    expect(countLoc('a\n\n\nc')).toBe(2)
  })
  it('ignores whitespace-only lines', () => {
    expect(countLoc('a\n   \n\t\nc')).toBe(2)
  })
  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
  })
})

// ─── countImports / countExports / countFunctions / countClasses ────

describe('countImports', () => {
  it('counts import statements', () => {
    expect(countImports('import { x } from "y"\nimport { z } from "w"')).toBe(2)
  })
  it('returns 0 when none', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

describe('countExports', () => {
  it('counts export statements', () => {
    expect(countExports('export function a() {}\nexport const b = 1')).toBe(2)
  })
  it('returns 0 when none', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
  })
  it('counts arrow functions', () => {
    expect(countFunctions('const x = () => {}')).toBe(1)
  })
})

describe('countClasses', () => {
  it('counts class declarations', () => {
    expect(countClasses('class A {} class B {}')).toBe(2)
  })
  it('returns 0 when none', () => {
    expect(countClasses('const x = 1')).toBe(0)
  })
})

// ─── countErrorHandling / countTypeAnnotations / countBranches ────

describe('countErrorHandling', () => {
  it('counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3)
  })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('function f(x: string): number {}')).toBe(2)
  })
})

describe('countBranches', () => {
  it('counts if/else/switch', () => {
    expect(countBranches('if (x) {} else {} switch(y) {}')).toBe(3)
  })
})

// ─── countConsole / countComments / countTodos / countJSDoc ────

describe('countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log("a") console.error("b")')).toBe(2)
  })
})

describe('countComments', () => {
  it('counts single-line comments', () => {
    expect(countComments('// hello\n// world')).toBe(2)
  })
  it('counts block comments', () => {
    expect(countComments('/* hello */')).toBe(1)
  })
})

describe('countTodos', () => {
  it('counts TODOs and FIXMEs', () => {
    expect(countTodos('// TODO fix\n// FIXME this')).toBe(2)
  })
})

describe('countJSDoc', () => {
  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** docs */')).toBe(1)
  })
})

// ─── maxNesting ──────────────────────────────────────────

describe('maxNesting', () => {
  it('measures max brace nesting', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
  it('returns 0 for flat code', () => {
    expect(maxNesting('a = 1')).toBe(0)
  })
})

// ─── measureUpperBulb ────────────────────────────────────

describe('measureUpperBulb', () => {
  it('returns sandVolume as import count', () => {
    const ub = measureUpperBulb('import { x } from "y"')
    expect(ub.sandVolume).toBe(1)
  })
  it('detects lumps with many imports and no types', () => {
    const code = 'import { a } from "x"\nimport { b } from "y"\nimport { c } from "z"\nimport { d } from "w"\nconst x = 1'
    const ub = measureUpperBulb(code)
    expect(ub.hasLumps).toBe(true)
  })
  it('detects moisture with TODOs', () => {
    const ub = measureUpperBulb('// TODO fix this')
    expect(ub.hasMoisture).toBe(true)
  })
  it('detects foreign objects with any type', () => {
    const ub = measureUpperBulb('const x: any = 1')
    expect(ub.hasForeignObjects).toBe(true)
  })
  it('detects string type in grainTypes', () => {
    const ub = measureUpperBulb('const x: string = ""')
    expect(ub.grainTypes).toContain('string')
  })
  it('detects number type in grainTypes', () => {
    const ub = measureUpperBulb('const x: number = 1')
    expect(ub.grainTypes).toContain('number')
  })
  it('isFull when imports > 5', () => {
    const code = Array.from({ length: 6 }, (_, i) => `import { m${i} } from "p${i}"`).join('\n')
    const ub = measureUpperBulb(code)
    expect(ub.isFull).toBe(true)
  })
  it('returns empty grainTypes for empty code', () => {
    const ub = measureUpperBulb('')
    expect(ub.grainTypes).toEqual([])
  })
})

// ─── measureNeck ─────────────────────────────────────────

describe('measureNeck', () => {
  it('returns width > 0 for well-typed exports', () => {
    const neck = measureNeck('export function validate(x: string): boolean { return true }')
    expect(neck.width).toBeGreaterThan(0)
  })
  it('detects smooth neck with exports and types', () => {
    const neck = measureNeck('export function calc(x: number): number { return x }')
    expect(neck.isSmooth).toBe(true)
  })
  it('detects clogged neck with no exports', () => {
    const neck = measureNeck('const x = 1\nconst y = 2')
    expect(neck.isClogged).toBe(true)
    expect(neck.clogPoints).toContain('no-exports')
  })
  it('detects filter with error handling', () => {
    const neck = measureNeck('export function f() { try {} catch(e) {} }')
    expect(neck.hasFilter).toBe(true)
  })
  it('detects grinder with validations and types', () => {
    const neck = measureNeck('export function f(x: number) { if (typeof x === "number") {} }')
    expect(neck.hasGrinder).toBe(true)
  })
  it('returns width 0 for empty', () => {
    const neck = measureNeck('')
    expect(neck.width).toBe(0)
  })
})

// ─── measureLowerBulb ────────────────────────────────────

describe('measureLowerBulb', () => {
  it('returns sandVolume as export count', () => {
    const lb = measureLowerBulb('export function a() {}')
    expect(lb.sandVolume).toBe(1)
  })
  it('detects spillage with console and exports', () => {
    const lb = measureLowerBulb('export function a() { console.log("x") }')
    expect(lb.hasSpillage).toBe(true)
  })
  it('detects neat pile with exports and no console/todos', () => {
    const lb = measureLowerBulb('export function a() { return 1 }')
    expect(lb.hasNeatPile).toBe(true)
  })
  it('detects contamination with todos and exports', () => {
    const lb = measureLowerBulb('export function a() { /* TODO */ }')
    expect(lb.hasContamination).toBe(true)
  })
  it('conical pile shape for neat exports', () => {
    const lb = measureLowerBulb('export function a() { return 1 }')
    expect(lb.pileShape).toBe('conical')
  })
  it('tunnel pile shape for no exports', () => {
    const lb = measureLowerBulb('const x = 1\nconst y = 2')
    expect(lb.pileShape).toBe('tunnel')
  })
  it('empty pile shape for empty code', () => {
    const lb = measureLowerBulb('')
    expect(lb.pileShape).toBe('empty')
  })
})

// ─── measureFlow ─────────────────────────────────────────

describe('measureFlow', () => {
  it('returns steady flow for high-quality code', () => {
    const flow = measureFlow('/** docs */\nexport function calc(x: number): number { return x }')
    expect(flow.isSteady).toBe(true)
  })
  it('returns clogged flow for low-quality code', () => {
    const flow = measureFlow('const x = 1')
    expect(flow.isClogged).toBe(true)
  })
  it('returns rate 0 for empty code', () => {
    const flow = measureFlow('')
    expect(flow.rate).toBe(0)
  })
  it('detects air gaps with branches and no error handling', () => {
    const flow = measureFlow('if (x) { if (y) { } }')
    expect(flow.hasAirGaps).toBe(true)
  })
  it('calculates consistency', () => {
    const flow = measureFlow('export function calc(x: number): number { return x }')
    expect(flow.consistency).toBeGreaterThan(0)
  })
})

// ─── measureGlass ────────────────────────────────────────

describe('measureGlass', () => {
  it('detects scratches with console calls', () => {
    const glass = measureGlass('console.log("x")')
    expect(glass.hasScratches).toBe(true)
    expect(glass.scratchCount).toBeGreaterThan(0)
  })
  it('detects etchings with JSDoc', () => {
    const glass = measureGlass('/** docs */\nfunction f() {}')
    expect(glass.hasEtchings).toBe(true)
  })
  it('detects transparent glass for high clarity', () => {
    const code = '/** docs */\nexport function calc(x: number): number { return x }'
    const glass = measureGlass(code)
    expect(glass.isTransparent).toBe(true)
  })
  it('detects frosted glass for low clarity', () => {
    const glass = measureGlass('const x = 1')
    expect(glass.isFrosted).toBe(true)
  })
  it('returns clarity 0 for empty code', () => {
    const glass = measureGlass('')
    expect(glass.clarity).toBe(0)
  })
})

// ─── measureSand ─────────────────────────────────────────

describe('measureSand', () => {
  it('returns fine grain for types + errors + validations', () => {
    const sand = measureSand('export function f(x: number): number { if (typeof x === "number") { try { return x } catch(e) { throw e } } return 0 }')
    expect(sand.grainSize).toBe('fine')
  })
  it('returns boulders for empty code', () => {
    const sand = measureSand('')
    expect(sand.grainSize).toBe('boulders')
  })
  it('detects impurities with console', () => {
    const sand = measureSand('console.log("x")')
    expect(sand.hasImpurities).toBe(true)
  })
  it('detects clean sand without console/todos', () => {
    const sand = measureSand('export function f(x: number): number { return x }')
    expect(sand.isClean).toBe(true)
  })
  it('detects colored grains with types', () => {
    const sand = measureSand('const x: number = 1')
    expect(sand.hasColoredGrains).toBe(true)
  })
  it('detects uniform sand when types >= functions', () => {
    const sand = measureSand('function f(x: number): number { return x }')
    expect(sand.isUniform).toBe(true)
  })
})

// ─── measureTiming ───────────────────────────────────────

describe('measureTiming', () => {
  it('returns consistent timing for well-structured code', () => {
    const t = measureTiming('export function f(x: number): number { try { return x } catch(e) { return 0 } }')
    expect(t.hasConsistentTiming).toBe(true)
  })
  it('returns precision > 0 for good code', () => {
    const t = measureTiming('export function f(x: number): number { return x }')
    expect(t.precision).toBeGreaterThan(0)
  })
  it('returns precision 0 for empty code', () => {
    const t = measureTiming('')
    expect(t.precision).toBe(0)
  })
  it('detects slow sections with deep nesting', () => {
    const deep = '{'.repeat(6) + '}'.repeat(6)
    const t = measureTiming(`export function f() { ${deep} }`)
    expect(t.hasSlowSections).toBe(true)
  })
  it('detects stalls with await and no error handling', () => {
    const t = measureTiming('async function f() { await fetch("/") }')
    expect(t.hasStalls).toBe(true)
  })
  it('detects fast sections with few branches', () => {
    const t = measureTiming('export function f() { return 1 }')
    expect(t.hasFastSections).toBe(true)
  })
})

// ─── classifyCondition ───────────────────────────────────

describe('classifyCondition', () => {
  it('classifies precision-timer for high scores', () => {
    expect(classifyCondition(90)).toBe('precision-timer')
  })
  it('classifies well-calibrated', () => {
    expect(classifyCondition(70)).toBe('well-calibrated')
  })
  it('classifies standard-hourglass', () => {
    expect(classifyCondition(55)).toBe('standard-hourglass')
  })
  it('classifies leaky', () => {
    expect(classifyCondition(35)).toBe('leaky')
  })
  it('classifies clogged', () => {
    expect(classifyCondition(20)).toBe('clogged')
  })
  it('classifies broken-glass', () => {
    expect(classifyCondition(5)).toBe('broken-glass')
  })
})

// ─── classifyHorologistGrade ─────────────────────────────

describe('classifyHorologistGrade', () => {
  it('classifies master-horologist', () => {
    expect(classifyHorologistGrade(85)).toBe('master-horologist')
  })
  it('classifies horologist', () => {
    expect(classifyHorologistGrade(70)).toBe('horologist')
  })
  it('classifies clockmaker', () => {
    expect(classifyHorologistGrade(50)).toBe('clockmaker')
  })
  it('classifies watchmaker', () => {
    expect(classifyHorologistGrade(35)).toBe('watchmaker')
  })
  it('classifies novice', () => {
    expect(classifyHorologistGrade(20)).toBe('novice')
  })
  it('classifies time-blind', () => {
    expect(classifyHorologistGrade(5)).toBe('time-blind')
  })
})

// ─── classifySetType / classifySetCondition ──────────────

describe('classifySetType', () => {
  it('returns broken for empty grains', () => {
    expect(classifySetType([])).toBe('broken')
  })
  it('returns laboratory-set for high quality', () => {
    const grains = [{ qualityScore: 90 }, { qualityScore: 85 }].map(q => ({ qualityScore: q.qualityScore } as any))
    expect(classifySetType(grains)).toBe('laboratory-set')
  })
})

describe('classifySetCondition', () => {
  it('returns wreckage for empty grains', () => {
    expect(classifySetCondition([])).toBe('wreckage')
  })
  it('returns chronometer for high quality', () => {
    const grains = [{ qualityScore: 90 }, { qualityScore: 85 }].map(q => ({ qualityScore: q.qualityScore } as any))
    expect(classifySetCondition(grains)).toBe('chronometer')
  })
})

// ─── analyzeSandGrain ────────────────────────────────────

describe('analyzeSandGrain', () => {
  it('returns a complete SandGrain', () => {
    const grain = analyzeSandGrain('export function calc(x: number): number { return x }', 'calc.ts')
    expect(grain.file).toBe('calc.ts')
    expect(grain.flowRate).toBeGreaterThanOrEqual(0)
    expect(grain.neckWidth).toBeGreaterThanOrEqual(0)
    expect(grain.sandQuality).toBeGreaterThanOrEqual(0)
    expect(grain.grainConsistency).toBeGreaterThanOrEqual(0)
    expect(grain.glassClarity).toBeGreaterThanOrEqual(0)
    expect(grain.timeMeasurement).toBeGreaterThanOrEqual(0)
    expect(grain.qualityScore).toBeGreaterThanOrEqual(0)
    expect(grain.condition).toBeDefined()
    expect(grain.upperBulb).toBeDefined()
    expect(grain.neck).toBeDefined()
    expect(grain.lowerBulb).toBeDefined()
    expect(grain.flow).toBeDefined()
    expect(grain.glass).toBeDefined()
    expect(grain.sand).toBeDefined()
    expect(grain.timing).toBeDefined()
  })
  it('returns qualityScore 0 for empty content', () => {
    const grain = analyzeSandGrain('', 'empty.ts')
    expect(grain.qualityScore).toBe(0)
  })
  it('classifies good code as precision-timer or well-calibrated', () => {
    const code = '/** Calculate value */\nexport function calc(x: number): number {\n  if (typeof x !== "number") throw new Error("invalid")\n  try { return x * 2 } catch(e) { return 0 }\n}'
    const grain = analyzeSandGrain(code, 'calc.ts')
    expect(['precision-timer', 'well-calibrated']).toContain(grain.condition)
  })
})

// ─── analyzeHourglassSet ─────────────────────────────────

describe('analyzeHourglassSet', () => {
  it('returns complete HourglassSet', () => {
    const grains = [
      analyzeSandGrain('export function a(x: number): number { return x }', 'a.ts'),
      analyzeSandGrain('export function b(y: string): boolean { return y.length > 0 }', 'b.ts'),
    ]
    const set = analyzeHourglassSet(grains, 'src')
    expect(set.directory).toBe('src')
    expect(set.grains).toHaveLength(2)
    expect(set.avgFlowRate).toBeGreaterThan(0)
    expect(set.setType).toBeDefined()
    expect(set.condition).toBeDefined()
  })
  it('handles empty grains', () => {
    const set = analyzeHourglassSet([], 'empty')
    expect(set.avgFlowRate).toBe(0)
    expect(set.setType).toBe('broken')
  })
})

// ─── buildHourglassFlowResult ────────────────────────────

describe('buildHourglassFlowResult', () => {
  it('returns complete result with grains and sets', () => {
    const result = buildHourglassFlowResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a(x: number): number { return x }', 'export function b(): string { return "hi" }'],
      {},
    )
    expect(result.grains).toHaveLength(2)
    expect(result.sets).toHaveLength(1)
    expect(result.clockshop).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalSets).toBe(1)
  })
  it('handles empty input', () => {
    const result = buildHourglassFlowResult([], [], {})
    expect(result.grains).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFlow).toBe(0)
    expect(result.clockshop.isFlowingSmoothly).toBe(false)
  })
  it('groups files by directory into sets', () => {
    const result = buildHourglassFlowResult(
      ['src/a.ts', 'lib/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.sets).toHaveLength(2)
  })
  it('calculates stats correctly', () => {
    const result = buildHourglassFlowResult(
      ['a.ts', 'b.ts'],
      ['export function a(x: number): number { return x }', 'const x = 1'],
      {},
    )
    expect(result.stats.smoothestFlow).toBeDefined()
    expect(result.stats.narrowestNeck).toBeDefined()
    expect(result.stats.horologistGrade).toBeDefined()
  })
})

// ─── generateRecommendations ─────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for clogged files', () => {
    const grains = [analyzeSandGrain('const x = 1', 'bad.ts')]
    const sets = [analyzeHourglassSet(grains, '.')]
    const stats = buildHourglassFlowResult(['bad.ts'], ['const x = 1'], {}).stats
    const clockshop = buildHourglassFlowResult(['bad.ts'], ['const x = 1'], {}).clockshop
    const recs = generateRecommendations(grains, sets, clockshop, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
  it('returns smooth recommendation for good code', () => {
    const code = '/** docs */\nexport function f(x: number): number { try { if (typeof x === "number") return x } catch(e) { return 0 } return 0 }'
    const result = buildHourglassFlowResult(['good.ts'], [code], {})
    const recs = generateRecommendations(result.grains, result.sets, result.clockshop, result.stats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Smooth flow')]))
  })
})

// ─── Format Helpers ──────────────────────────────────────

describe('formatGrainTable', () => {
  it('formats empty grains', () => {
    expect(formatGrainTable([])).toContain('No sand grains')
  })
  it('formats grain rows', () => {
    const grain = analyzeSandGrain('export function f() {}', 'f.ts')
    const output = formatGrainTable([grain])
    expect(output).toContain('f.ts')
    expect(output).toContain('File')
  })
})

describe('formatSetTable', () => {
  it('formats empty sets', () => {
    expect(formatSetTable([])).toContain('No hourglass sets')
  })
  it('formats set rows', () => {
    const result = buildHourglassFlowResult(['a.ts'], ['export function a() {}'], {})
    const output = formatSetTable(result.sets)
    expect(output).toContain('Directory')
  })
})

describe('formatClockshop', () => {
  it('formats clockshop summary', () => {
    const result = buildHourglassFlowResult(['a.ts'], ['export function a() {}'], {})
    const output = formatClockshop(result.clockshop)
    expect(output).toContain('Clockshop Summary')
    expect(output).toContain('Overall Flow')
  })
})

describe('formatStats', () => {
  it('formats statistics', () => {
    const result = buildHourglassFlowResult(['a.ts'], ['export function a() {}'], {})
    const output = formatStats(result.stats)
    expect(output).toContain('Flow Statistics')
    expect(output).toContain('Horologist Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const output = formatRecommendations(['Add error handling', 'Fix types'])
    expect(output).toContain('Add error handling')
    expect(output).toContain('Fix types')
  })
})

describe('formatHourglassFlowReport', () => {
  it('formats complete report', () => {
    const result = buildHourglassFlowResult(['a.ts'], ['export function a() {}'], {})
    const output = formatHourglassFlowReport(result)
    expect(output).toContain('Clockshop Summary')
    expect(output).toContain('Flow Statistics')
  })
})

describe('formatHourglassFlowJSON', () => {
  it('produces valid JSON', () => {
    const result = buildHourglassFlowResult(['a.ts'], ['export function a() {}'], {})
    const json = formatHourglassFlowJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.grains).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
