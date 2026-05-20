import { describe, expect, it } from 'vitest'

import {
  buildMetamorphosisResult,
  classifyLifeStage,
  computeComplexity,
  computeEcosystemMaturity,
  computeEvolutionaryPressure,
  computeMaturationScore,
  countExports,
  countJSDocOnExports,
  countLines,
  countTodos,
  determineNextStage,
  detectEvolutionaryPressures,
  generateMetamorphosisRecommendations,
  hasDeprecatedPatterns,
  hasFunctionsOrClasses,
  hasJSDoc,
  hasTestFile,
  hasTypeAnnotations,
  identifyBlockers,
  type EvolutionaryPressure,
  type MetamorphosisOptions,
  type MetamorphosisResult,
  type MetamorphosisStats,
  type StageName,
  type Transformation,
} from '../src/commands/metamorphosis-helpers.js'

import {
  formatLifeCycleDiagram,
  formatMaturationTimeline,
  formatMetamorphosisJson,
  formatMetamorphosisRecommendations,
  formatMetamorphosisStats,
  formatMetamorphosisTable,
  formatPressureMap,
  formatStageBadge,
  formatTransformationTable,
} from '../src/commands/metamorphosis-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''
const EGG_CONTENT = 'const x = 1\n'

const LARVA_CONTENT = `function add(a, b) {
  return a + b
}
function sub(a, b) {
  return a - b
}
function mul(a, b) {
  return a * b
}
function div(a, b) {
  return a / b
}
`

const PUPA_CONTENT = `function add(a: number, b: number): number {
  return a + b
}

class Calculator {
  private result: number = 0
  add(n: number): void { this.result += n }
  get(): number { return this.result }
}
`

const CHRYSALIS_CONTENT = `/**
 * Adds two numbers together.
 * @param a - first number
 * @param b - second number
 * @returns the sum
 */
export function add(a: number, b: number): number {
  return a + b
}

export class Calculator {
  add(n: number): void {}
}
`

const BUTTERFLY_CONTENT = `/**
 * Adds two numbers together.
 * @param a - first number
 * @param b - second number
 * @returns the sum
 * @example
 * add(1, 2) // => 3
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Subtracts b from a.
 * @param a - first number
 * @param b - second number
 * @returns the difference
 */
export function subtract(a: number, b: number): number {
  return a - b
}
`

const DEPRECATED_CONTENT = `var x = 1
var y = function() { return arguments[0] }
const z = require('fs')
`

const TODO_CONTENT = `// TODO: fix this later
// FIXME: broken logic
// HACK: temporary workaround
function process() {}
`

const MULTI_FILES = ['app.ts', 'utils.ts', 'app.test.ts']
const MULTI_CONTENTS = [CHRYSALIS_CONTENT, LARVA_CONTENT, 'import { add } from "./app"\ntest("add", () => {})\n']

// ─── countLines ────────────────────────────────────────────────────────────────

describe('countLines', () => {
  it('counts lines correctly', () => {
    expect(countLines('a\nb\nc')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countLines('')).toBe(0)
  })

  it('counts single line', () => {
    expect(countLines('hello')).toBe(1)
  })
})

// ─── hasJSDoc ──────────────────────────────────────────────────────────────────

describe('hasJSDoc', () => {
  it('detects JSDoc', () => {
    expect(hasJSDoc('/** doc */\nfunction f() {}')).toBe(true)
  })

  it('returns false without JSDoc', () => {
    expect(hasJSDoc('function f() {}')).toBe(false)
  })

  it('detects multi-line JSDoc', () => {
    expect(hasJSDoc('/**\n * Line 1\n * Line 2\n */\nfunction f() {}')).toBe(true)
  })
})

// ─── countJSDocOnExports ──────────────────────────────────────────────────────

describe('countJSDocOnExports', () => {
  it('counts JSDoc on exports', () => {
    expect(countJSDocOnExports('/** doc */\nexport function f() {}')).toBe(1)
  })

  it('returns 0 without JSDoc exports', () => {
    expect(countJSDocOnExports('export function f() {}')).toBe(0)
  })

  it('counts multiple', () => {
    const code = '/** a */\nexport function a() {}\n/** b */\nexport function b() {}'
    expect(countJSDocOnExports(code)).toBe(2)
  })
})

// ─── countExports ──────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts exports', () => {
    expect(countExports('export const a = 1\nexport function b() {}')).toBe(2)
  })

  it('returns 0 without exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── computeComplexity ─────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('increases with if statements', () => {
    expect(computeComplexity('if (a) {} if (b) {}')).toBe(3)
  })

  it('counts switch and case', () => {
    expect(computeComplexity('switch(x) { case 1: break; case 2: break; }')).toBe(4)
  })
})

// ─── hasTestFile ───────────────────────────────────────────────────────────────

describe('hasTestFile', () => {
  it('finds test file', () => {
    expect(hasTestFile('app.ts', ['app.ts', 'app.test.ts'])).toBe(true)
  })

  it('finds spec file', () => {
    expect(hasTestFile('utils.ts', ['utils.ts', 'utils.spec.ts'])).toBe(true)
  })

  it('returns false without test file', () => {
    expect(hasTestFile('app.ts', ['app.ts'])).toBe(false)
  })

  it('does not match self', () => {
    expect(hasTestFile('app.test.ts', ['app.test.ts'])).toBe(false)
  })
})

// ─── hasTypeAnnotations ────────────────────────────────────────────────────────

describe('hasTypeAnnotations', () => {
  it('detects type annotations', () => {
    expect(hasTypeAnnotations('const x: number = 1')).toBe(true)
  })

  it('returns false without types', () => {
    expect(hasTypeAnnotations('const x = 1')).toBe(false)
  })

  it('detects various types', () => {
    expect(hasTypeAnnotations('function f(): void {}')).toBe(true)
    expect(hasTypeAnnotations('const s: string = ""')).toBe(true)
    expect(hasTypeAnnotations('const b: boolean = true')).toBe(true)
  })
})

// ─── hasFunctionsOrClasses ─────────────────────────────────────────────────────

describe('hasFunctionsOrClasses', () => {
  it('detects functions', () => {
    expect(hasFunctionsOrClasses('function run() {}')).toBe(true)
  })

  it('detects classes', () => {
    expect(hasFunctionsOrClasses('class Engine {}')).toBe(true)
  })

  it('detects arrow functions', () => {
    expect(hasFunctionsOrClasses('const fn = () => {}')).toBe(true)
  })

  it('returns false without', () => {
    expect(hasFunctionsOrClasses('const x = 1')).toBe(false)
  })
})

// ─── countTodos ────────────────────────────────────────────────────────────────

describe('countTodos', () => {
  it('counts TODO markers', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
  })

  it('counts FIXME markers', () => {
    expect(countTodos('// FIXME: broken')).toBe(1)
  })

  it('counts HACK markers', () => {
    expect(countTodos('// HACK: workaround')).toBe(1)
  })

  it('returns 0 without markers', () => {
    expect(countTodos('const x = 1')).toBe(0)
  })

  it('counts multiple markers', () => {
    expect(countTodos(TODO_CONTENT)).toBe(3)
  })
})

// ─── hasDeprecatedPatterns ─────────────────────────────────────────────────────

describe('hasDeprecatedPatterns', () => {
  it('detects var', () => {
    expect(hasDeprecatedPatterns('var x = 1')).toBe(true)
  })

  it('detects arguments', () => {
    expect(hasDeprecatedPatterns('function f() { return arguments }')).toBe(true)
  })

  it('detects require', () => {
    expect(hasDeprecatedPatterns("const fs = require('fs')")).toBe(true)
  })

  it('returns false for modern code', () => {
    expect(hasDeprecatedPatterns('const x = 1')).toBe(false)
  })
})

// ─── classifyLifeStage ─────────────────────────────────────────────────────────

describe('classifyLifeStage', () => {
  it('classifies egg for empty content', () => {
    const stage = classifyLifeStage('app.ts', '', [], false)
    expect(stage.stage).toBe('egg')
  })

  it('classifies egg for < 10 lines', () => {
    const stage = classifyLifeStage('app.ts', EGG_CONTENT, [], false)
    expect(stage.stage).toBe('egg')
  })

  it('classifies larva for basic code < 50 lines without docs/test', () => {
    const stage = classifyLifeStage('app.ts', LARVA_CONTENT, [], false)
    expect(stage.stage).toBe('larva')
  })

  it('classifies pupa for typed code with functions', () => {
    const stage = classifyLifeStage('calc.ts', PUPA_CONTENT, ['calc.ts'], false)
    expect(stage.stage).toBe('pupa')
  })

  it('classifies butterfly for fully documented code with tests', () => {
    const stage = classifyLifeStage('math.ts', BUTTERFLY_CONTENT, ['math.ts', 'math.test.ts'], false)
    expect(stage.stage).toBe('butterfly')
  })

  it('classifies chrysalis for code with JSDoc and tests', () => {
    const stage = classifyLifeStage('app.ts', CHRYSALIS_CONTENT, ['app.ts', 'app.test.ts'], false)
    expect(stage.stage).toBe('chrysalis')
  })

  it('classifies fossil when flagged', () => {
    const stage = classifyLifeStage('old.ts', PUPA_CONTENT, ['old.ts'], true)
    expect(stage.stage).toBe('fossil')
  })

  it('does not classify empty as fossil', () => {
    const stage = classifyLifeStage('old.ts', '', ['old.ts'], true)
    expect(stage.stage).toBe('egg')
  })

  it('each stage has description', () => {
    const stages = [
      classifyLifeStage('a.ts', '', [], false),
      classifyLifeStage('b.ts', LARVA_CONTENT, [], false),
      classifyLifeStage('c.ts', PUPA_CONTENT, ['c.ts'], false),
    ]
    for (const s of stages) {
      expect(s.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── computeMaturationScore ────────────────────────────────────────────────────

describe('computeMaturationScore', () => {
  it('returns 0 for empty file', () => {
    expect(computeMaturationScore('app.ts', '', [])).toBe(0)
  })

  it('returns score for larva content', () => {
    const score = computeMaturationScore('app.ts', LARVA_CONTENT, [])
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(50)
  })

  it('returns higher score for butterfly content', () => {
    const score = computeMaturationScore('math.ts', BUTTERFLY_CONTENT, ['math.ts', 'math.test.ts'])
    expect(score).toBeGreaterThanOrEqual(60)
  })

  it('increases with test file', () => {
    const noTest = computeMaturationScore('app.ts', CHRYSALIS_CONTENT, ['app.ts'])
    const withTest = computeMaturationScore('app.ts', CHRYSALIS_CONTENT, ['app.ts', 'app.test.ts'])
    expect(withTest).toBeGreaterThan(noTest)
  })

  it('caps at 100', () => {
    const score = computeMaturationScore('math.ts', BUTTERFLY_CONTENT, ['math.ts', 'math.test.ts'])
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── determineNextStage ────────────────────────────────────────────────────────

describe('determineNextStage', () => {
  it('egg → larva', () => {
    expect(determineNextStage('egg', 0)).toBe('larva')
  })

  it('larva → pupa', () => {
    expect(determineNextStage('larva', 20)).toBe('pupa')
  })

  it('pupa → chrysalis', () => {
    expect(determineNextStage('pupa', 40)).toBe('chrysalis')
  })

  it('chrysalis → butterfly', () => {
    expect(determineNextStage('chrysalis', 60)).toBe('butterfly')
  })

  it('butterfly → maintain', () => {
    expect(determineNextStage('butterfly', 90)).toBe('butterfly (maintain)')
  })

  it('fossil → review', () => {
    expect(determineNextStage('fossil', 30)).toBe('review for relevance')
  })
})

// ─── identifyBlockers ──────────────────────────────────────────────────────────

describe('identifyBlockers', () => {
  it('identifies blockers for larva', () => {
    const blockers = identifyBlockers('app.ts', LARVA_CONTENT, 'larva', [])
    expect(blockers.length).toBeGreaterThan(0)
    expect(blockers.some(b => b.includes('documentation'))).toBe(true)
    expect(blockers.some(b => b.includes('test'))).toBe(true)
  })

  it('identifies blockers for egg', () => {
    const blockers = identifyBlockers('app.ts', '', 'egg', [])
    expect(blockers).toContain('add substantive code')
  })

  it('identifies blockers for pupa', () => {
    const blockers = identifyBlockers('app.ts', PUPA_CONTENT, 'pupa', ['app.ts'])
    expect(blockers.length).toBeGreaterThan(0)
  })

  it('returns empty for butterfly', () => {
    const blockers = identifyBlockers('app.ts', BUTTERFLY_CONTENT, 'butterfly', ['app.ts', 'app.test.ts'])
    expect(blockers).toEqual([])
  })

  it('identifies blockers for fossil', () => {
    const blockers = identifyBlockers('old.ts', DEPRECATED_CONTENT, 'fossil', ['old.ts'])
    expect(blockers.some(b => b.includes('outdated'))).toBe(true)
    expect(blockers.some(b => b.includes('deprecated'))).toBe(true)
  })
})

// ─── detectEvolutionaryPressures ───────────────────────────────────────────────

describe('detectEvolutionaryPressures', () => {
  it('detects tech-debt pressure', () => {
    const pressures = detectEvolutionaryPressures(['todo.ts'], [TODO_CONTENT])
    expect(pressures.some(p => p.type === 'tech-debt')).toBe(true)
  })

  it('detects modernization pressure', () => {
    const pressures = detectEvolutionaryPressures(['old.ts'], [DEPRECATED_CONTENT])
    expect(pressures.some(p => p.type === 'modernization')).toBe(true)
  })

  it('detects refactor-need pressure', () => {
    const complex = Array.from({ length: 20 }, (_, i) => `if (c${i}) {}`).join('\n')
    const pressures = detectEvolutionaryPressures(['complex.ts'], [complex])
    expect(pressures.some(p => p.type === 'refactor-need')).toBe(true)
  })

  it('detects feature-demand for large files', () => {
    const large = Array.from({ length: 250 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const pressures = detectEvolutionaryPressures(['big.ts'], [large])
    expect(pressures.some(p => p.type === 'feature-demand')).toBe(true)
  })

  it('detects bug-pressure for error-heavy files', () => {
    const errorHeavy = Array.from({ length: 6 }, (_, i) => `try { x${i}() } catch (e) {}`).join('\n')
    const pressures = detectEvolutionaryPressures(['errors.ts'], [errorHeavy])
    expect(pressures.some(p => p.type === 'bug-pressure')).toBe(true)
  })

  it('returns empty for clean files', () => {
    const pressures = detectEvolutionaryPressures(['clean.ts'], ['const x = 1\n'])
    expect(pressures.length).toBe(0)
  })

  it('each pressure has valid properties', () => {
    const pressures = detectEvolutionaryPressures(['todo.ts', 'old.ts'], [TODO_CONTENT, DEPRECATED_CONTENT])
    for (const p of pressures) {
      expect(p.files.length).toBeGreaterThan(0)
      expect(p.strength).toBeGreaterThanOrEqual(0)
      expect(p.strength).toBeLessThanOrEqual(100)
      expect(p.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── computeEcosystemMaturity ──────────────────────────────────────────────────

describe('computeEcosystemMaturity', () => {
  it('returns 0 for empty', () => {
    expect(computeEcosystemMaturity([])).toBe(0)
  })

  it('computes weighted average', () => {
    const t: Transformation[] = [
      { file: 'a.ts', currentStage: { stage: 'butterfly', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 90, nextStage: '', blockers: [] },
      { file: 'b.ts', currentStage: { stage: 'larva', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 20, nextStage: '', blockers: [] },
    ]
    expect(computeEcosystemMaturity(t)).toBe(60)
  })
})

// ─── computeEvolutionaryPressure ───────────────────────────────────────────────

describe('computeEvolutionaryPressure', () => {
  it('returns 0 for empty', () => {
    expect(computeEvolutionaryPressure([])).toBe(0)
  })

  it('averages pressure strengths', () => {
    const pressures: EvolutionaryPressure[] = [
      { type: 'tech-debt', files: ['a.ts'], strength: 40, description: 'test' },
      { type: 'modernization', files: ['b.ts'], strength: 60, description: 'test' },
    ]
    expect(computeEvolutionaryPressure(pressures)).toBe(50)
  })

  it('caps at 100', () => {
    const pressures: EvolutionaryPressure[] = [
      { type: 'tech-debt', files: ['a.ts'], strength: 100, description: 'test' },
    ]
    expect(computeEvolutionaryPressure(pressures)).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateMetamorphosisRecommendations', () => {
  const baseStats: MetamorphosisStats = {
    totalFiles: 5, eggCount: 0, larvaCount: 0, pupaCount: 0,
    chrysalisCount: 0, butterflyCount: 5, fossilCount: 0,
    avgMaturation: 80, mostMature: 'a.ts', leastMature: 'b.ts',
    mostTransformed: 'c.ts', evolutionaryPressure: 20, ecosystemMaturity: 80,
  }

  it('recommends feeding larval files', () => {
    const t: Transformation[] = [
      { file: 'raw.ts', currentStage: { stage: 'larva', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 10, nextStage: '', blockers: [] },
    ]
    const recs = generateMetamorphosisRecommendations(t, [], baseStats)
    expect(recs.some(r => r.includes('Feed') && r.includes('larval'))).toBe(true)
  })

  it('recommends helping chrysalis files', () => {
    const t: Transformation[] = [
      { file: 'mid.ts', currentStage: { stage: 'chrysalis', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 50, nextStage: '', blockers: [] },
    ]
    const recs = generateMetamorphosisRecommendations(t, [], baseStats)
    expect(recs.some(r => r.includes('chrysalis') && r.includes('emerge'))).toBe(true)
  })

  it('recommends reviewing fossils', () => {
    const t: Transformation[] = [
      { file: 'old.ts', currentStage: { stage: 'fossil', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 30, nextStage: '', blockers: [] },
    ]
    const recs = generateMetamorphosisRecommendations(t, [], baseStats)
    expect(recs.some(r => r.includes('fossil') && r.toLowerCase().includes('review'))).toBe(true)
  })

  it('recommends for low ecosystem maturity', () => {
    const stats = { ...baseStats, ecosystemMaturity: 30 }
    const recs = generateMetamorphosisRecommendations([], [], stats)
    expect(recs.some(r => r.includes('maturity') && r.includes('low'))).toBe(true)
  })

  it('recommends for high pressure areas', () => {
    const pressures: EvolutionaryPressure[] = [
      { type: 'tech-debt', files: ['a.ts'], strength: 80, description: 'many todos' },
    ]
    const recs = generateMetamorphosisRecommendations([], pressures, baseStats)
    expect(recs.some(r => r.includes('pressure'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const recs = generateMetamorphosisRecommendations([], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── buildMetamorphosisResult ──────────────────────────────────────────────────

describe('buildMetamorphosisResult', () => {
  it('builds complete result', () => {
    const result = buildMetamorphosisResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.transformations).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('handles empty file list', () => {
    const result = buildMetamorphosisResult([], [], {})
    expect(result.transformations).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgMaturation).toBe(0)
  })

  it('each transformation has valid properties', () => {
    const result = buildMetamorphosisResult(MULTI_FILES, MULTI_CONTENTS, {})
    for (const t of result.transformations) {
      expect(t.file).toBeTruthy()
      expect(t.currentStage.stage).toBeTruthy()
      expect(t.maturationScore).toBeGreaterThanOrEqual(0)
      expect(t.maturationScore).toBeLessThanOrEqual(100)
      expect(t.nextStage).toBeTruthy()
      expect(Array.isArray(t.blockers)).toBe(true)
    }
  })

  it('stats are populated', () => {
    const result = buildMetamorphosisResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.stats.mostMature).toBeTruthy()
    expect(result.stats.leastMature).toBeTruthy()
    expect(result.stats.ecosystemMaturity).toBeGreaterThanOrEqual(0)
    expect(result.stats.ecosystemMaturity).toBeLessThanOrEqual(100)
  })

  it('includes recommendations', () => {
    const result = buildMetamorphosisResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('respects verbose option', () => {
    const opts: MetamorphosisOptions = { verbose: true }
    const result = buildMetamorphosisResult(MULTI_FILES, MULTI_CONTENTS, opts)
    expect(result).toBeDefined()
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatStageBadge', () => {
  it('formats each stage', () => {
    for (const stage of ['egg', 'larva', 'pupa', 'chrysalis', 'butterfly', 'fossil'] as StageName[]) {
      const badge = formatStageBadge(stage)
      expect(badge).toContain(stage)
    }
  })
})

describe('formatLifeCycleDiagram', () => {
  it('formats diagram with stages', () => {
    const stats: MetamorphosisStats = {
      totalFiles: 10, eggCount: 2, larvaCount: 3, pupaCount: 2,
      chrysalisCount: 2, butterflyCount: 1, fossilCount: 0,
      avgMaturation: 45, mostMature: 'a.ts', leastMature: 'b.ts',
      mostTransformed: 'c.ts', evolutionaryPressure: 30, ecosystemMaturity: 45,
    }
    const output = formatLifeCycleDiagram(stats)
    expect(output).toContain('egg')
    expect(output).toContain('butterfly')
  })
})

describe('formatTransformationTable', () => {
  it('shows message for empty', () => {
    expect(formatTransformationTable([])).toContain('No files')
  })

  it('formats transformations', () => {
    const t: Transformation[] = [
      { file: 'app.ts', currentStage: { stage: 'chrysalis', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 60, nextStage: 'butterfly', blockers: [] },
    ]
    const output = formatTransformationTable(t)
    expect(output).toContain('app.ts')
    expect(output).toContain('chrysalis')
  })
})

describe('formatMaturationTimeline', () => {
  it('formats timeline', () => {
    const t: Transformation[] = [
      { file: 'low.ts', currentStage: { stage: 'larva', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 20, nextStage: '', blockers: [] },
      { file: 'high.ts', currentStage: { stage: 'butterfly', description: '', criteria: [] }, previousStages: [], transformations: 0, growthRate: 0, maturationScore: 90, nextStage: '', blockers: [] },
    ]
    const output = formatMaturationTimeline(t)
    expect(output).toContain('low.ts')
    expect(output).toContain('high.ts')
  })
})

describe('formatPressureMap', () => {
  it('shows message for no pressures', () => {
    expect(formatPressureMap([])).toContain('No evolutionary')
  })

  it('formats pressures', () => {
    const p: EvolutionaryPressure[] = [
      { type: 'tech-debt', files: ['a.ts'], strength: 60, description: 'many TODOs' },
    ]
    const output = formatPressureMap(p)
    expect(output).toContain('tech-debt')
    expect(output).toContain('many TODOs')
  })
})

describe('formatMetamorphosisStats', () => {
  it('formats stats', () => {
    const stats: MetamorphosisStats = {
      totalFiles: 10, eggCount: 1, larvaCount: 2, pupaCount: 3,
      chrysalisCount: 2, butterflyCount: 1, fossilCount: 1,
      avgMaturation: 55, mostMature: 'a.ts', leastMature: 'b.ts',
      mostTransformed: 'c.ts', evolutionaryPressure: 40, ecosystemMaturity: 55,
    }
    const output = formatMetamorphosisStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('55/100')
  })
})

describe('formatMetamorphosisRecommendations', () => {
  it('returns empty for no recs', () => {
    expect(formatMetamorphosisRecommendations([])).toBe('')
  })

  it('formats recommendations', () => {
    const output = formatMetamorphosisRecommendations(['Feed larval files', 'Review fossils'])
    expect(output).toContain('Feed larval files')
    expect(output).toContain('→')
  })
})

describe('formatMetamorphosisTable', () => {
  it('formats full result', () => {
    const result = buildMetamorphosisResult(MULTI_FILES, MULTI_CONTENTS, {})
    const output = formatMetamorphosisTable(result)
    expect(output).toContain('Metamorphosis')
  })
})

describe('formatMetamorphosisJson', () => {
  it('produces valid JSON', () => {
    const result = buildMetamorphosisResult(MULTI_FILES, MULTI_CONTENTS, {})
    const json = formatMetamorphosisJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.transformations).toHaveLength(3)
  })
})
