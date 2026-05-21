import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames,
  classifyFlaskCondition, classifyLabType,
  classifyLabCondition, classifyAlchemistGrade,
  classifyElement, measureTransmutation, measureReagents,
  measureCrucible, measureAlembic, measureCatalyst,
  measurePhilosopher, analyzeAlchemistFlask, analyzeLaboratory,
  generateRecommendations, buildAlchemyLabResult,
} from '../src/commands/alchemy-lab-helpers.js'
import { formatAlchemyLabTable, formatAlchemyLabJson } from '../src/commands/alchemy-lab-format-helpers.js'

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

const consoleCode = [
  'export function logStuff(x: number): void {',
  '  console.log("debug:", x)',
  '  console.error("err")',
  '  return',
  '}',
].join('\n')

const untypedCode = [
  'function process(data) {',
  '  if (data) { return data.value }',
  '  return null',
  '}',
  'function transform(input) { return input }',
].join('\n')

const nestedCode = [
  'function deep() {',
  '  if (a) {',
  '    if (b) {',
  '      if (c) {',
  '        if (d) {',
  '          if (e) {',
  '            if (f) {',
  '              x = 1',
  '            }',
  '          }',
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

describe('alchemy-lab primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc('line1\nline2\n')).toBe(2)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(simpleCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports('export function a() {}')).toBe(1)
    expect(countExports(strongCode)).toBe(3)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => 1')).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses('class Foo {}')).toBe(1)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
    expect(countErrorHandling(strongCode)).toBe(3)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
    expect(countTypeAnnotations(strongCode)).toBe(5)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
    expect(countBranches(strongCode)).toBe(1)
  })

  it('maxNesting measures brace depth', () => {
    expect(maxNesting(emptyCode)).toBe(0)
    expect(maxNesting('if (a) { x }')).toBe(1)
    expect(maxNesting(nestedCode)).toBe(7)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole(consoleCode)).toBe(2)
  })

  it('countComments counts comment markers', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
    expect(countComments(strongCode)).toBe(2)
  })

  it('countTodos counts TODO/FIXME/HACK/XXX', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos('FIXME: hack')).toBe(2)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc('/** doc */')).toBe(1)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts long camelCase names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
    expect(countDescriptiveNames('const x = 1')).toBe(0)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('alchemy-lab classification', () => {
  it('classifyFlaskCondition returns correct conditions', () => {
    expect(classifyFlaskCondition(90)).toBe('philosopher-stone')
    expect(classifyFlaskCondition(80)).toBe('philosopher-stone')
    expect(classifyFlaskCondition(70)).toBe('grand-elixir')
    expect(classifyFlaskCondition(50)).toBe('potion-master')
    expect(classifyFlaskCondition(30)).toBe('apprentice')
    expect(classifyFlaskCondition(15)).toBe('charlatan')
    expect(classifyFlaskCondition(5)).toBe('explosion')
    expect(classifyFlaskCondition(0)).toBe('explosion')
  })

  it('classifyLabType returns correct types', () => {
    expect(classifyLabType([])).toBe('ruins')
    const stoneFlask = analyzeAlchemistFlask(strongCode, 'a.ts')
    const type = classifyLabType([stoneFlask])
    expect(type).toBeDefined()
    expect(typeof type).toBe('string')
  })

  it('classifyLabCondition returns correct conditions', () => {
    expect(classifyLabCondition(80)).toBe('nobel-prize')
    expect(classifyLabCondition(65)).toBe('peer-reviewed')
    expect(classifyLabCondition(45)).toBe('experimental')
    expect(classifyLabCondition(30)).toBe('amateur')
    expect(classifyLabCondition(15)).toBe('dangerous')
    expect(classifyLabCondition(5)).toBe('condemned')
  })

  it('classifyAlchemistGrade returns correct grades', () => {
    expect(classifyAlchemistGrade(85)).toBe('grand-master')
    expect(classifyAlchemistGrade(70)).toBe('master-alchemist')
    expect(classifyAlchemistGrade(50)).toBe('alchemist')
    expect(classifyAlchemistGrade(35)).toBe('apprentice')
    expect(classifyAlchemistGrade(20)).toBe('novice')
    expect(classifyAlchemistGrade(10)).toBe('quack')
  })

  it('classifyElement returns correct element for empty code', () => {
    const el = classifyElement(emptyCode)
    expect(el.primary).toBe('void')
    expect(el.secondary).toBe('emptiness')
    expect(el.balance).toBe(0)
    expect(el.isBalanced).toBe(false)
    expect(el.isDominant).toBe(true)
  })

  it('classifyElement returns earth for class-heavy code', () => {
    const el = classifyElement('export class Foo {} export class Bar {}')
    expect(el.primary).toBe('earth')
    expect(el.secondary).toBe('stability')
  })

  it('classifyElement returns water for function-heavy code', () => {
    const el = classifyElement('function calculateTotal() {} function processData() {}')
    expect(el.primary).toBe('water')
    expect(el.secondary).toBe('flow')
  })

  it('classifyElement returns aether for documented code', () => {
    const el = classifyElement([
      '/** doc */',
      '/** another */',
      'function calculateImportantValue() {}',
    ].join('\n'))
    expect(el.primary).toBe('aether')
    expect(el.secondary).toBe('perfection')
  })

  it('classifyElement returns air for typed code', () => {
    const el = classifyElement('const x: string = "a" const y: number = 1 const z: boolean = true')
    expect(el.primary).toBe('air')
    expect(el.secondary).toBe('clarity')
  })

  it('classifyElement detects balanced code', () => {
    const el = classifyElement(strongCode)
    expect(el.balance).toBeGreaterThanOrEqual(50)
    expect(el.isBalanced).toBe(true)
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('alchemy-lab measurements', () => {
  it('measureTransmutation handles empty code', () => {
    const t = measureTransmutation(emptyCode)
    expect(t.isPure).toBe(false)
    expect(t.hasSideEffects).toBe(false)
    expect(t.hasImpurities).toBe(false)
    expect(t.inputOutputRatio).toBe(0)
    expect(t.hasByproducts).toBe(false)
    expect(t.byproductCount).toBe(0)
    expect(typeof t.purity).toBe('number')
    expect(typeof t.transmutationType).toBe('string')
  })

  it('measureTransmutation detects pure code', () => {
    const t = measureTransmutation(typedCode)
    expect(t.isPure).toBe(true)
    expect(t.hasSideEffects).toBe(false)
  })

  it('measureTransmutation detects side effects', () => {
    const t = measureTransmutation(consoleCode)
    expect(t.hasSideEffects).toBe(true)
    expect(t.hasByproducts).toBe(true)
    expect(t.byproductCount).toBe(2)
  })

  it('measureTransmutation classifies transmutation type', () => {
    expect(measureTransmutation(strongCode).transmutationType).toBeDefined()
    expect(measureTransmutation(emptyCode).transmutationType).toBe('fermentation')
    expect(measureTransmutation(simpleCode).transmutationType).toBe('fermentation')
  })

  it('measureReagents handles empty code', () => {
    const r = measureReagents(emptyCode)
    expect(r.count).toBe(0)
    expect(r.isValidated).toBe(false)
    expect(typeof r.handlingScore).toBe('number')
  })

  it('measureReagents counts imports and functions', () => {
    const r = measureReagents(diverseCode)
    expect(r.count).toBeGreaterThan(0)
    expect(r.catalystCount).toBe(countImports(diverseCode))
  })

  it('measureReagents detects validated code', () => {
    const r = measureReagents(typedCode)
    expect(r.isValidated).toBe(true)
  })

  it('measureReagents detects poisons', () => {
    const r = measureReagents(untypedCode)
    expect(r.hasPoisons).toBe(true)
    expect(r.poisonCount).toBe(countFunctions(untypedCode))
  })

  it('measureCrucible handles empty code', () => {
    const c = measureCrucible(emptyCode)
    expect(c.isFired).toBe(false)
    expect(c.temperature).toBe(0)
    expect(c.hasCracks).toBe(false)
    expect(c.hasLeaks).toBe(false)
    expect(c.isShatterproof).toBe(false)
  })

  it('measureCrucible detects fired code', () => {
    const c = measureCrucible(strongCode)
    expect(c.isFired).toBe(true)
    expect(c.temperature).toBeGreaterThan(0)
  })

  it('measureCrucible detects cracks', () => {
    const c = measureCrucible('if (a) {} if (b) {}')
    expect(c.hasCracks).toBe(true)
    expect(c.crackCount).toBeGreaterThan(0)
  })

  it('measureCrucible detects leaks', () => {
    const c = measureCrucible('try {} catch(e) {}')
    expect(c.hasLeaks).toBe(true)
    expect(c.leakCount).toBe(1)
  })

  it('measureCrucible identifies shatterproof code', () => {
    const c = measureCrucible(strongCode)
    expect(c.isShatterproof).toBe(true)
  })

  it('measureAlembic handles empty code', () => {
    const a = measureAlembic(emptyCode)
    expect(a.distillationStages).toBe(0)
    expect(a.hasCleanSeparation).toBe(false)
    expect(typeof a.purity).toBe('number')
  })

  it('measureAlembic detects clean separation', () => {
    const a = measureAlembic(diverseCode)
    expect(a.hasCleanSeparation).toBe(true)
    expect(a.distillationStages).toBeGreaterThan(0)
  })

  it('measureAlembic detects contamination', () => {
    const a = measureAlembic(consoleCode)
    expect(a.hasContamination).toBe(true)
    expect(a.contaminationPoints).toContain('console')
  })

  it('measureAlembic detects untyped contamination', () => {
    const a = measureAlembic(untypedCode)
    expect(a.hasContamination).toBe(true)
    expect(a.contaminationPoints).toContain('untyped')
  })

  it('measureCatalyst handles empty code', () => {
    const c = measureCatalyst(emptyCode)
    expect(c.count).toBe(0)
    expect(typeof c.efficiency).toBe('number')
    expect(c.hasProperCatalysts).toBe(false)
  })

  it('measureCatalyst detects proper catalysts', () => {
    const c = measureCatalyst(strongCode)
    expect(c.hasProperCatalysts).toBe(true)
    expect(c.count).toBeGreaterThan(0)
  })

  it('measureCatalyst detects failed catalysts', () => {
    const c = measureCatalyst('import { x } from "y" function a() {}')
    expect(c.hasFailedCatalysts).toBe(true)
  })

  it('measureCatalyst detects inert catalysts', () => {
    const manyImports = [
      'import { a } from "a"',
      'import { b } from "b"',
      'import { c } from "c"',
      'import { d } from "d"',
    ].join('\n')
    const c = measureCatalyst(manyImports)
    expect(c.hasInertCatalysts).toBe(true)
    expect(c.inertCount).toBeGreaterThan(0)
  })

  it('measurePhilosopher handles empty code', () => {
    const p = measurePhilosopher(emptyCode)
    expect(typeof p.elegance).toBe('number')
    expect(p.hasElixir).toBe(false)
    expect(p.hasGold).toBe(false)
    expect(p.hasLead).toBe(false)
    expect(p.isEnlightened).toBe(false)
  })

  it('measurePhilosopher detects gold in strong code', () => {
    const p = measurePhilosopher(strongCode)
    expect(p.hasGold).toBe(true)
    expect(p.hasElixir).toBe(true)
    expect(p.goldCount).toBe(1)
  })

  it('measurePhilosopher detects lead in todo code', () => {
    const p = measurePhilosopher(diverseCode)
    expect(p.hasLead).toBe(true)
    expect(p.leadCount).toBeGreaterThan(0)
  })

  it('measurePhilosopher detects homunculus in deeply nested code', () => {
    const deepCode = [
      'function a() {',
      '  function b() {',
      '    function c() {',
      '      function d() {',
      '        if (x) {',
      '          if (y) {',
      '            if (z) {',
      '              return 1',
      '            }',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ].join('\n')
    const p = measurePhilosopher(deepCode)
    expect(p.hasHomunculus).toBe(true)
  })

  it('measurePhilosopher detects enlightened code', () => {
    const p = measurePhilosopher(strongCode)
    expect(p.elegance).toBeGreaterThanOrEqual(50)
  })
})

// ─── Core Analysis ────────────────────────────────────────────────────────────

describe('alchemy-lab core analysis', () => {
  it('analyzeAlchemistFlask returns explosion for empty code', () => {
    const flask = analyzeAlchemistFlask(emptyCode, 'empty.ts')
    expect(flask.condition).toBe('explosion')
    expect(flask.qualityScore).toBe(0)
    expect(flask.transmutationQuality).toBe(0)
    expect(flask.reagentHandling).toBe(0)
    expect(flask.catalystEfficiency).toBe(0)
    expect(flask.distillationPurity).toBe(0)
    expect(flask.crucibleStrength).toBe(0)
    expect(flask.philosopherPotential).toBe(0)
    expect(flask.element.primary).toBe('void')
    expect(flask.file).toBe('empty.ts')
  })

  it('analyzeAlchemistFlask returns non-zero scores for strong code', () => {
    const flask = analyzeAlchemistFlask(strongCode, 'strong.ts')
    expect(flask.qualityScore).toBeGreaterThan(0)
    expect(flask.transmutationQuality).toBeGreaterThan(0)
    expect(flask.transmutation.isPure).toBe(true)
    expect(flask.crucible.isFired).toBe(true)
  })

  it('analyzeAlchemistFlask assigns file path correctly', () => {
    const flask = analyzeAlchemistFlask(simpleCode, 'src/test.ts')
    expect(flask.file).toBe('src/test.ts')
  })

  it('analyzeAlchemistFlask scores typed code well', () => {
    const flask = analyzeAlchemistFlask(typedCode, 'typed.ts')
    expect(flask.qualityScore).toBeGreaterThan(0)
    expect(flask.transmutation.isPure).toBe(true)
  })

  it('analyzeAlchemistFlask detects console side effects', () => {
    const flask = analyzeAlchemistFlask(consoleCode, 'console.ts')
    expect(flask.transmutation.hasSideEffects).toBe(true)
    expect(flask.transmutation.hasByproducts).toBe(true)
  })
})

// ─── Laboratory Analysis ──────────────────────────────────────────────────────

describe('alchemy-lab laboratory analysis', () => {
  it('analyzeLaboratory returns condemned for empty flasks', () => {
    const lab = analyzeLaboratory([], 'empty-dir')
    expect(lab.condition).toBe('condemned')
    expect(lab.labType).toBe('ruins')
    expect(lab.flasks).toHaveLength(0)
    expect(lab.avgTransmutation).toBe(0)
  })

  it('analyzeLaboratory aggregates flask scores', () => {
    const flasks = [
      analyzeAlchemistFlask(strongCode, 'a.ts'),
      analyzeAlchemistFlask(typedCode, 'b.ts'),
    ]
    const lab = analyzeLaboratory(flasks, 'src')
    expect(lab.flasks).toHaveLength(2)
    expect(lab.avgTransmutation).toBeGreaterThan(0)
    expect(lab.directory).toBe('src')
  })

  it('analyzeLaboratory counts philosopher stones', () => {
    const flasks = [analyzeAlchemistFlask(strongCode, 'a.ts')]
    const lab = analyzeLaboratory(flasks, 'src')
    expect(typeof lab.philosopherStoneCount).toBe('number')
    expect(typeof lab.explosionCount).toBe('number')
  })

  it('analyzeLaboratory counts pure functions and side effects', () => {
    const flasks = [
      analyzeAlchemistFlask(strongCode, 'a.ts'),
      analyzeAlchemistFlask(consoleCode, 'b.ts'),
    ]
    const lab = analyzeLaboratory(flasks, 'src')
    expect(lab.pureFunctionCount).toBeGreaterThanOrEqual(1)
    expect(lab.sideEffectCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('alchemy-lab build result', () => {
  it('buildAlchemyLabResult handles empty input', () => {
    const result = buildAlchemyLabResult([], [], {})
    expect(result.flasks).toHaveLength(0)
    expect(result.labs).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.alchemistGrade).toBe('quack')
    expect(result.stats.overallMastery).toBe(0)
    expect(result.stats.bestTransmutation).toBe('none')
    expect(result.stats.purest).toBe('none')
    expect(result.stats.strongestCrucible).toBe('none')
    expect(result.stats.mostElegant).toBe('none')
    expect(result.stats.mostExplosive).toBe('none')
  })

  it('buildAlchemyLabResult processes single file', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    expect(result.flasks).toHaveLength(1)
    expect(result.flasks[0].file).toBe('a.ts')
    expect(result.labs).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestTransmutation).toBe('a.ts')
  })

  it('buildAlchemyLabResult processes multiple files', () => {
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildAlchemyLabResult(multiFilePaths, contents, {})
    expect(result.flasks).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalLabs).toBe(1)
  })

  it('buildAlchemyLabResult groups by directory', () => {
    const paths = ['src/a.ts', 'src/b.ts', 'lib/c.ts']
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildAlchemyLabResult(paths, contents, {})
    expect(result.labs).toHaveLength(2)
  })

  it('buildAlchemyLabResult counts element types', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    const total = result.stats.earthCount + result.stats.waterCount +
      result.stats.airCount + result.stats.fireCount +
      result.stats.aetherCount + result.stats.voidCount
    expect(total).toBe(1)
  })

  it('buildAlchemyLabResult computes guild averages', () => {
    const result = buildAlchemyLabResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    expect(result.guild.avgTransmutation).toBeGreaterThanOrEqual(0)
    expect(result.guild.avgPurity).toBeGreaterThanOrEqual(0)
    expect(result.guild.overallMastery).toBeGreaterThanOrEqual(0)
  })

  it('buildAlchemyLabResult handles mismatched contents gracefully', () => {
    const result = buildAlchemyLabResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.flasks).toHaveLength(2)
    expect(result.flasks[1].qualityScore).toBe(0)
  })

  it('buildAlchemyLabResult identifies best/purest/strongest/most elegant', () => {
    const result = buildAlchemyLabResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.bestTransmutation).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.strongestCrucible).toBeTruthy()
    expect(result.stats.mostElegant).toBeTruthy()
    expect(result.stats.mostExplosive).toBeTruthy()
  })

  it('buildAlchemyLabResult counts condition types', () => {
    const result = buildAlchemyLabResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.philosopherStoneCount +
      result.stats.grandElixirCount +
      result.stats.potionMasterCount +
      result.stats.apprenticeCount +
      result.stats.charlatanCount +
      result.stats.explosionCount
    expect(total).toBe(3)
  })

  it('buildAlchemyLabResult counts feature flags', () => {
    const result = buildAlchemyLabResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [strongCode, consoleCode, diverseCode],
      {},
    )
    expect(typeof result.stats.hasCracksCount).toBe('number')
    expect(typeof result.stats.hasLeaksCount).toBe('number')
    expect(typeof result.stats.hasContaminationCount).toBe('number')
    expect(typeof result.stats.hasGoldCount).toBe('number')
    expect(typeof result.stats.hasLeadCount).toBe('number')
    expect(typeof result.stats.hasElixirCount).toBe('number')
    expect(typeof result.stats.hasByproductCount).toBe('number')
    expect(typeof result.stats.impurityCount).toBe('number')
    expect(typeof result.stats.pureFunctionCount).toBe('number')
    expect(typeof result.stats.sideEffectCount).toBe('number')
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('alchemy-lab recommendations', () => {
  it('generateRecommendations warns about explosions', () => {
    const result = buildAlchemyLabResult(['a.ts'], [simpleCode], {})
    const hasExplosionRec = result.recommendations.some(r => r.includes('Explosions detected'))
    if (result.stats.explosionCount > 0) {
      expect(hasExplosionRec).toBe(true)
    }
  })

  it('generateRecommendations praises high mastery', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    if (result.stats.overallMastery >= 60) {
      expect(result.recommendations.some(r => r.includes('Strong alchemy'))).toBe(true)
    }
  })

  it('generateRecommendations warns about void elements', () => {
    const result = buildAlchemyLabResult(
      Array.from({ length: 10 }, (_, i) => `f${i}.ts`),
      Array.from({ length: 10 }, () => simpleCode),
      {},
    )
    if (result.stats.voidCount > result.stats.totalFiles * 0.5) {
      expect(result.recommendations.some(r => r.includes('Void elements'))).toBe(true)
    }
  })

  it('generateRecommendations warns about cracks', () => {
    const result = buildAlchemyLabResult(['a.ts'], ['if (x) {} if (y) {} if (z) {} if (w) {}'], {})
    if (result.stats.hasCracksCount > 3) {
      expect(result.recommendations.some(r => r.includes('Crucible cracks'))).toBe(true)
    }
  })

  it('generateRecommendations returns deduplicated array', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toEqual(unique)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('alchemy-lab format helpers', () => {
  it('formatAlchemyLabTable returns string with header', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    const table = formatAlchemyLabTable(result, false)
    expect(table).toContain('Alchemy Lab')
    expect(table).toContain('Flasks')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatAlchemyLabTable includes recommendations', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    const table = formatAlchemyLabTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('formatAlchemyLabTable handles empty result', () => {
    const result = buildAlchemyLabResult([], [], {})
    const table = formatAlchemyLabTable(result, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatAlchemyLabTable verbose shows details', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    const verbose = formatAlchemyLabTable(result, true)
    expect(verbose).toContain('transmutation:')
    expect(verbose).toContain('reagents:')
    expect(verbose).toContain('crucible:')
    expect(verbose).toContain('alembic:')
    expect(verbose).toContain('catalyst:')
    expect(verbose).toContain('philosopher:')
    expect(verbose).toContain('element:')
  })

  it('formatAlchemyLabTable truncates at 15 flasks in non-verbose', () => {
    const paths = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleCode)
    const result = buildAlchemyLabResult(paths, contents, {})
    const table = formatAlchemyLabTable(result, false)
    expect(table).toContain('... and 5 more')
  })

  it('formatAlchemyLabTable shows labs section', () => {
    const result = buildAlchemyLabResult(['src/a.ts', 'src/b.ts'], [strongCode, diverseCode], {})
    const table = formatAlchemyLabTable(result, false)
    expect(table).toContain('Laboratories')
  })

  it('formatAlchemyLabTable shows guild section', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    const table = formatAlchemyLabTable(result, false)
    expect(table).toContain('Guild')
  })

  it('formatAlchemyLabJson returns valid JSON', () => {
    const result = buildAlchemyLabResult(['a.ts'], [strongCode], {})
    const json = formatAlchemyLabJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json) as { flasks: unknown[] }
    expect(parsed.flasks).toHaveLength(1)
  })

  it('formatAlchemyLabJson handles empty result', () => {
    const result = buildAlchemyLabResult([], [], {})
    const json = formatAlchemyLabJson(result)
    const parsed = JSON.parse(json) as { stats: { totalFiles: number } }
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('alchemy-lab edge cases', () => {
  it('handles code with only comments', () => {
    const flask = analyzeAlchemistFlask('// just a comment\n/* block */', 'comment.ts')
    expect(flask.file).toBe('comment.ts')
    expect(typeof flask.qualityScore).toBe('number')
  })

  it('handles deeply nested code', () => {
    const flask = analyzeAlchemistFlask(nestedCode, 'nested.ts')
    expect(flask.file).toBe('nested.ts')
    expect(typeof flask.qualityScore).toBe('number')
  })

  it('handles code with many imports but no exports', () => {
    const code = 'import { a } from "x"\nimport { b } from "y"\nimport { c } from "z"\nimport { d } from "w"'
    const flask = analyzeAlchemistFlask(code, 'imports.ts')
    expect(flask.catalyst.hasInertCatalysts).toBe(true)
    expect(flask.catalyst.inertCount).toBeGreaterThan(0)
  })

  it('handles code with catch-all empty blocks', () => {
    const code = 'try { x() } catch(e) {}\ntry { y() } catch(err) {}'
    const flask = analyzeAlchemistFlask(code, 'leaky.ts')
    expect(flask.crucible.hasLeaks).toBe(true)
    expect(flask.crucible.leakCount).toBe(2)
  })

  it('handles untyped functions', () => {
    const flask = analyzeAlchemistFlask(untypedCode, 'untyped.ts')
    expect(flask.transmutation.hasImpurities).toBe(true)
    expect(flask.reagents.hasPoisons).toBe(true)
  })

  it('quality score is bounded 0-100', () => {
    const codes = [emptyCode, simpleCode, strongCode, diverseCode, consoleCode, untypedCode, nestedCode]
    for (const code of codes) {
      const flask = analyzeAlchemistFlask(code, 'test.ts')
      expect(flask.qualityScore).toBeGreaterThanOrEqual(0)
      expect(flask.qualityScore).toBeLessThanOrEqual(100)
    }
  })

  it('all measurement sub-scores are bounded 0-100', () => {
    const flask = analyzeAlchemistFlask(strongCode, 'test.ts')
    expect(flask.transmutationQuality).toBeGreaterThanOrEqual(0)
    expect(flask.transmutationQuality).toBeLessThanOrEqual(100)
    expect(flask.reagentHandling).toBeGreaterThanOrEqual(0)
    expect(flask.reagentHandling).toBeLessThanOrEqual(100)
    expect(flask.catalystEfficiency).toBeGreaterThanOrEqual(0)
    expect(flask.catalystEfficiency).toBeLessThanOrEqual(100)
    expect(flask.distillationPurity).toBeGreaterThanOrEqual(0)
    expect(flask.distillationPurity).toBeLessThanOrEqual(100)
    expect(flask.crucibleStrength).toBeGreaterThanOrEqual(0)
    expect(flask.crucibleStrength).toBeLessThanOrEqual(100)
    expect(flask.philosopherPotential).toBeGreaterThanOrEqual(0)
    expect(flask.philosopherPotential).toBeLessThanOrEqual(100)
  })

  it('transmutation purity is bounded 0-100', () => {
    const codes = [emptyCode, simpleCode, strongCode, consoleCode]
    for (const code of codes) {
      const t = measureTransmutation(code)
      expect(t.purity).toBeGreaterThanOrEqual(0)
      expect(t.purity).toBeLessThanOrEqual(100)
    }
  })

  it('overall mastery is bounded 0-100', () => {
    const result = buildAlchemyLabResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.overallMastery).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallMastery).toBeLessThanOrEqual(100)
  })
})
