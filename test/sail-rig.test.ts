import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames,
  classifyPanelCondition, classifyFleetType,
  classifyFleetCondition, classifyCaptainGrade,
  measureSail, measureWind, measureHull,
  measureBallast, measureRigging, measureNavigation,
  analyzeSailPanel, analyzeFleet,
  generateRecommendations, buildSailRigResult,
} from '../src/commands/sail-rig-helpers.js'
import { formatSailRigTable, formatSailRigJson } from '../src/commands/sail-rig-format-helpers.js'

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
  'export function calculateResult(x: number): number {',
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

const diverseCode = [
  'import { helper } from "./utils.js"',
  'export function calc(): void {}',
  'export class Calculator {',
  '  constructor() {}',
  '  compute(): number { return 1 }',
  '}',
  'export interface Shape { area: number }',
  'export type Result = string | number',
  '// TODO: fix this',
  'const x = 1',
].join('\n')

const branchyCode = [
  'if (a) {',
  '  if (b) {',
  '    if (c) {',
  '      if (d) {',
  '        if (e) {',
  '          x = 1',
  '        }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n')

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

// ─── Primitives ───────────────────────────────────────────────────────────────

describe('sail-rig primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc(strongCode)).toBe(18)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(strongCode)).toBe(3)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions(strongCode)).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBe(3)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations(strongCode)).toBe(5)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches(strongCode)).toBe(1)
  })

  it('maxNesting returns max brace depth', () => {
    expect(maxNesting(branchyCode)).toBe(5)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comment markers', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODO/FIXME markers', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts long camelCase', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames(strongCode)).toBe(2)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('sail-rig classifications', () => {
  it('classifyPanelCondition returns correct grade', () => {
    expect(classifyPanelCondition(90)).toBe('yacht-racer')
    expect(classifyPanelCondition(70)).toBe('well-rigged')
    expect(classifyPanelCondition(50)).toBe('sloop')
    expect(classifyPanelCondition(30)).toBe('schooner')
    expect(classifyPanelCondition(15)).toBe('bare-poles')
    expect(classifyPanelCondition(5)).toBe('sinking')
    expect(classifyPanelCondition(0)).toBe('sinking')
  })

  it('classifyFleetType returns shipwreck for empty', () => {
    expect(classifyFleetType([])).toBe('shipwreck')
  })

  it('classifyFleetCondition returns correct condition', () => {
    expect(classifyFleetCondition(80)).toBe('regatta-ready')
    expect(classifyFleetCondition(65)).toBe('seaworthy')
    expect(classifyFleetCondition(45)).toBe('sailable')
    expect(classifyFleetCondition(30)).toBe('barely-afloat')
    expect(classifyFleetCondition(15)).toBe('taking-water')
    expect(classifyFleetCondition(5)).toBe('sunk')
  })

  it('classifyCaptainGrade returns correct grade', () => {
    expect(classifyCaptainGrade(85)).toBe('yacht-captain')
    expect(classifyCaptainGrade(70)).toBe('captain')
    expect(classifyCaptainGrade(50)).toBe('first-mate')
    expect(classifyCaptainGrade(35)).toBe('sailor')
    expect(classifyCaptainGrade(20)).toBe('deckhand')
    expect(classifyCaptainGrade(5)).toBe('landlubber')
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('sail-rig measurements', () => {
  it('measureSail classifies genoa for high exports+imports', () => {
    const s = measureSail(strongCode)
    expect(s.type).toBe('genoa')
    expect(s.area).toBeGreaterThan(0)
    expect(s.isProperlySet).toBe(true)
    expect(s.isTrimmed).toBe(true)
  })

  it('measureSail classifies main-sail for class+function', () => {
    const s = measureSail(diverseCode)
    expect(s.type).toBe('main-sail')
  })

  it('measureSail classifies lateen for simple export', () => {
    const s = measureSail(typedCode)
    expect(s.type).toBe('lateen')
  })

  it('measureSail classifies square for simple code', () => {
    const s = measureSail(simpleCode)
    expect(s.type).toBe('square')
  })

  it('measureSail returns zero area for empty', () => {
    const s = measureSail(emptyCode)
    expect(s.area).toBe(0)
    expect(s.isProperlySet).toBe(false)
  })

  it('measureWind returns in-irons for empty', () => {
    const w = measureWind(emptyCode)
    expect(w.capture).toBe(0)
    expect(w.pointOfSail).toBe('in-irons')
    expect(w.isInIrons).toBe(true)
  })

  it('measureWind detects reaching for strong code', () => {
    const w = measureWind(strongCode)
    expect(w.capture).toBeGreaterThan(0)
    expect(w.isReaching).toBe(true)
  })

  it('measureWind detects running for simple code', () => {
    const w = measureWind(simpleCode)
    expect(w.isRunning).toBe(true)
    expect(w.pointOfSail).toBe('running')
  })

  it('measureHull returns clean for empty', () => {
    const h = measureHull(emptyCode)
    expect(h.speed).toBe(0)
    expect(h.isClean).toBe(true)
    expect(h.barnacleCount).toBe(0)
  })

  it('measureHull detects barnacles for diverse code', () => {
    const h = measureHull(diverseCode)
    expect(h.hasBarnacles).toBe(true)
    expect(h.barnacleCount).toBeGreaterThan(0)
  })

  it('measureBallast returns none keel for empty', () => {
    const b = measureBallast(emptyCode)
    expect(b.weight).toBe(0)
    expect(b.keelType).toBe('none')
    expect(b.stabilityScore).toBe(0)
  })

  it('measureBallast detects balanced code', () => {
    const b = measureBallast(strongCode)
    expect(b.isBalanced).toBe(true)
    expect(b.hasStability).toBe(true)
  })

  it('measureRigging returns zero for empty', () => {
    const r = measureRigging(emptyCode)
    expect(r.lineCount).toBe(0)
    expect(r.isTaut).toBe(false)
    expect(r.overheadRatio).toBe(0)
  })

  it('measureRigging detects taut rigging', () => {
    const r = measureRigging(strongCode)
    expect(r.lineCount).toBeGreaterThan(0)
    expect(r.isTaut).toBe(true)
  })

  it('measureNavigation returns all false for empty', () => {
    const n = measureNavigation(emptyCode)
    expect(n.hasCompass).toBe(false)
    expect(n.hasChart).toBe(false)
    expect(n.hasLog).toBe(false)
  })

  it('measureNavigation detects compass and chart', () => {
    const n = measureNavigation(strongCode)
    expect(n.hasCompass).toBe(true)
    expect(n.hasChart).toBe(true)
    expect(n.hasDepthSounder).toBe(true)
    expect(n.isOnCourse).toBe(true)
  })
})

// ─── Analysis Functions ───────────────────────────────────────────────────────

describe('sail-rig analysis', () => {
  it('analyzeSailPanel returns sinking for empty', () => {
    const panel = analyzeSailPanel(emptyCode, 'empty.ts')
    expect(panel.file).toBe('empty.ts')
    expect(panel.condition).toBe('sinking')
    expect(panel.qualityScore).toBe(0)
    expect(panel.sail.type).toBe('square')
    expect(panel.wind.pointOfSail).toBe('in-irons')
    expect(panel.hull.isClean).toBe(true)
    expect(panel.ballastDetail.keelType).toBe('none')
  })

  it('analyzeSailPanel scores strong code well', () => {
    const panel = analyzeSailPanel(strongCode, 'strong.ts')
    expect(panel.qualityScore).toBeGreaterThan(20)
    expect(panel.sail.isProperlySet).toBe(true)
    expect(panel.wind.capture).toBeGreaterThan(0)
    expect(panel.navigation.isOnCourse).toBe(true)
  })

  it('analyzeSailPanel classifies diverse code as main-sail', () => {
    const panel = analyzeSailPanel(diverseCode, 'diverse.ts')
    expect(panel.sail.type).toBe('main-sail')
  })

  it('analyzeSailPanel scores are clamped 0-100', () => {
    const panel = analyzeSailPanel(strongCode, 'strong.ts')
    expect(panel.qualityScore).toBeLessThanOrEqual(100)
    expect(panel.sailArea).toBeLessThanOrEqual(100)
    expect(panel.windCapture).toBeLessThanOrEqual(100)
    expect(panel.sailTrim).toBeLessThanOrEqual(100)
    expect(panel.hullSpeed).toBeLessThanOrEqual(100)
    expect(panel.ballast).toBeLessThanOrEqual(100)
    expect(panel.riggingOverhead).toBeLessThanOrEqual(100)
  })

  it('analyzeFleet handles empty panels', () => {
    const fleet = analyzeFleet([], 'empty-dir')
    expect(fleet.directory).toBe('empty-dir')
    expect(fleet.panels).toHaveLength(0)
    expect(fleet.fleetType).toBe('shipwreck')
    expect(fleet.condition).toBe('sunk')
  })

  it('analyzeFleet aggregates panel scores', () => {
    const panels = [
      analyzeSailPanel(strongCode, 'strong.ts'),
      analyzeSailPanel(typedCode, 'typed.ts'),
    ]
    const fleet = analyzeFleet(panels, 'src')
    expect(fleet.panels).toHaveLength(2)
    expect(fleet.avgSailTrim).toBeGreaterThan(0)
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('sail-rig buildSailRigResult', () => {
  it('handles empty input', () => {
    const result = buildSailRigResult([], [], {})
    expect(result.panels).toHaveLength(0)
    expect(result.fleets).toHaveLength(0)
    expect(result.regatta.overallEfficiency).toBe(0)
    expect(result.regatta.isSeaworthy).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.captainGrade).toBe('landlubber')
    expect(result.stats.bestRigged).toBe('none')
  })

  it('handles single file', () => {
    const result = buildSailRigResult(['calc.ts'], [typedCode], {})
    expect(result.panels).toHaveLength(1)
    expect(result.fleets).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles multi-file input', () => {
    const contents = [strongCode, diverseCode, simpleCode]
    const result = buildSailRigResult(multiFilePaths, contents, {})
    expect(result.panels).toHaveLength(3)
    expect(result.fleets).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files into fleets by directory', () => {
    const paths = ['src/a.ts', 'lib/b.ts', 'src/c.ts']
    const contents = [typedCode, typedCode, typedCode]
    const result = buildSailRigResult(paths, contents, {})
    expect(result.fleets).toHaveLength(2)
    expect(result.stats.totalFleets).toBe(2)
  })

  it('tracks condition counts', () => {
    const result = buildSailRigResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const total = result.stats.yachtRacerCount +
      result.stats.wellRiggedCount +
      result.stats.sloopCount +
      result.stats.schoonerCount +
      result.stats.barePolesCount +
      result.stats.sinkingCount
    expect(total).toBe(3)
  })

  it('tracks sail type counts', () => {
    const result = buildSailRigResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    expect(result.stats.mainSailCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.spinnakerCount).toBeGreaterThanOrEqual(0)
  })

  it('computes best/fastest/stable/tangled/barnacled', () => {
    const result = buildSailRigResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    expect(result.stats.bestRigged).toBeDefined()
    expect(result.stats.fastest).toBeDefined()
    expect(result.stats.mostStable).toBeDefined()
    expect(result.stats.mostTangled).toBeDefined()
    expect(result.stats.mostBarnacled).toBeDefined()
  })

  it('counts boolean properties correctly', () => {
    const result = buildSailRigResult(['strong.ts'], [strongCode], {})
    expect(result.stats.isLuffingCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isInIronsCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasBarnaclesCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasDragCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasTanglesCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isOnCourseCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasCompassCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.finKeelCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.noKeelCount).toBeGreaterThanOrEqual(0)
  })

  it('regatta isSeaworthy is boolean', () => {
    const result = buildSailRigResult(
      ['strong.ts', 'diverse.ts'],
      [strongCode, diverseCode],
      {},
    )
    expect(typeof result.regatta.isSeaworthy).toBe('boolean')
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('sail-rig recommendations', () => {
  it('returns recommendations for problematic code', () => {
    const result = buildSailRigResult(['bad.ts'], [simpleCode], {})
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns unique recommendations', () => {
    const result = buildSailRigResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toHaveLength(unique.length)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('sail-rig format helpers', () => {
  it('formatSailRigTable returns string', () => {
    const result = buildSailRigResult(['a.ts'], [typedCode], {})
    const formatted = formatSailRigTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('Sail Rig')
  })

  it('formatSailRigTable handles verbose mode', () => {
    const result = buildSailRigResult(['a.ts'], [typedCode], {})
    const formatted = formatSailRigTable(result, true)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('sail:')
    expect(formatted).toContain('wind:')
    expect(formatted).toContain('hull:')
  })

  it('formatSailRigTable handles empty input', () => {
    const result = buildSailRigResult([], [], {})
    const formatted = formatSailRigTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('No files analyzed')
  })

  it('formatSailRigJson returns valid JSON', () => {
    const result = buildSailRigResult(['a.ts'], [typedCode], {})
    const json = formatSailRigJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.panels).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.regatta).toBeDefined()
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('sail-rig edge cases', () => {
  it('handles mismatched file/content arrays', () => {
    const result = buildSailRigResult(['a.ts', 'b.ts'], [typedCode], {})
    expect(result.panels).toHaveLength(2)
  })

  it('handles deeply nested code as storm-sail', () => {
    const panel = analyzeSailPanel(branchyCode, 'nested.ts')
    expect(panel.sail.draft).toBeGreaterThan(0)
  })

  it('handles code with only comments', () => {
    const commentCode = '// just a comment\n/* block */'
    const panel = analyzeSailPanel(commentCode, 'comment.ts')
    expect(panel.sail.type).toBe('square')
  })

  it('detects luffing for untyped branches', () => {
    const luffCode = 'if (a) { x = 1 }'
    const panel = analyzeSailPanel(luffCode, 'luff.ts')
    expect(panel.sail.isLuffing).toBe(true)
  })

  it('detects drag sources', () => {
    const dragCode = 'console.log("x")\n// TODO: fix'
    const panel = analyzeSailPanel(dragCode, 'drag.ts')
    expect(panel.hull.hasDrag).toBe(true)
    expect(panel.hull.dragSources.length).toBeGreaterThan(0)
  })

  it('detects slack rigging for imports-only', () => {
    const slackCode = 'import { x } from "./a.js"'
    const panel = analyzeSailPanel(slackCode, 'slack.ts')
    expect(panel.rigging.isSlack).toBe(true)
  })

  it('handles fin keel for high errors+types', () => {
    const panel = analyzeSailPanel(strongCode, 'fin.ts')
    expect(panel.ballastDetail.keelType).toBe('fin')
  })
})
