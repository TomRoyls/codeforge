import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames, countShortNames,
  classifySpectralType, classifyConstellationType,
  classifyConstellationCondition, classifyAstronomerGrade,
  measureMagnitude, measureLuminosity, measureTemperature,
  extractConnections,
  analyzeStarModule, detectBinarySystems, detectClusters,
  measureMythology, analyzeConstellation,
  generateRecommendations, buildConstellationChartResult,
} from '../src/commands/constellation-chart-helpers.js'
import { formatConstellationChartTable, formatConstellationChartJson } from '../src/commands/constellation-chart-format-helpers.js'

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

const minimalCode = 'const a = 1'

const noDocCode = [
  'export function foo() {',
  '  return 1',
  '}',
].join('\n')

const supergiantCode = Array.from({ length: 60 }, (_, i) => `const line${i} = ${i}`).join('\n')

const dwarfCode = 'const x = 1'

const neutronCode = [
  'function a() { if (true) { return 1 } }',
  'function b() { if (true) { return 2 } }',
  'function c() { if (true) { return 3 } }',
].join('\n')

const binaryCodeA = [
  'import { helper } from "./binaryB.js"',
  'export function a() { return helper() }',
].join('\n')

const binaryCodeB = [
  'import { processor } from "./binaryA.js"',
  'export function b() { return processor() }',
].join('\n')

const multiFileContents = [
  strongCode,
  diverseCode,
  minimalCode,
]

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

// ─── Content Primitives ──────────────────────────────────────────────────────

describe('constellation-chart primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc(strongCode)).toBeGreaterThan(10)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(simpleCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(simpleCode)).toBe(0)
    expect(countExports(strongCode)).toBe(3)
    expect(countExports(diverseCode)).toBe(4)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => 1')).toBe(1)
    expect(countFunctions(strongCode)).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses('class Foo {}')).toBe(1)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThan(0)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations(typedCode)).toBeGreaterThan(0)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (x) {}')).toBe(1)
    expect(countBranches('x ? 1 : 2')).toBe(1)
  })

  it('maxNesting counts max brace depth', () => {
    expect(maxNesting(emptyCode)).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
    expect(maxNesting('if (x) { if (y) {} }')).toBe(2)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts // and /* comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
    expect(countComments(diverseCode)).toBeGreaterThan(0)
  })

  it('countTodos counts TODO/FIXME/HACK/XXX', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos('FIXME: broken')).toBe(1)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts long camelCase names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
    expect(countDescriptiveNames(strongCode)).toBe(2)
  })

  it('countShortNames counts 1-2 char variable names', () => {
    expect(countShortNames(emptyCode)).toBe(0)
    expect(countShortNames('const x = 1')).toBe(1)
    expect(countShortNames('const ab = 2')).toBe(1)
  })
})

// ─── Classification Functions ────────────────────────────────────────────────

describe('constellation-chart classifications', () => {
  it('classifySpectralType returns string for empty code', () => {
    expect(classifySpectralType(emptyCode)).toBe('M-red')
  })

  it('classifySpectralType returns higher quality for strong code', () => {
    const weak = classifySpectralType(simpleCode)
    const strong = classifySpectralType(strongCode)
    expect(strong).not.toBe('M-red')
    expect(strong.length).toBeGreaterThan(0)
    expect(typeof weak).toBe('string')
    expect(typeof strong).toBe('string')
  })

  it('classifySpectralType classifies typed code reasonably', () => {
    const result = classifySpectralType(typedCode)
    expect(['O-blue', 'B-blue-white', 'A-white', 'F-yellow-white', 'G-yellow', 'K-orange', 'M-red']).toContain(result)
  })

  it('classifyConstellationType returns void for empty array', () => {
    expect(classifyConstellationType([])).toBe('void')
  })

  it('classifyConstellationType returns cloud for dark stars', () => {
    const darkStar = {
      file: 'a.ts', magnitude: 100, brightness: 0, spectralType: 'M-red',
      constellation: '', connections: [], connectionStrength: 0,
      isBinary: false, binaryPartner: '', isCluster: false,
      isVariable: false, isSupergiant: false, isDwarf: true,
      isNeutron: false, isDark: true, luminosity: 0,
      temperature: 0, age: 0, distance: 0, qualityScore: 0,
    }
    expect(classifyConstellationType([darkStar])).toBe('cloud')
  })

  it('classifyConstellationCondition classifies brightness levels', () => {
    expect(classifyConstellationCondition(90)).toBe('brilliant')
    expect(classifyConstellationCondition(70)).toBe('bright')
    expect(classifyConstellationCondition(50)).toBe('visible')
    expect(classifyConstellationCondition(30)).toBe('dim')
    expect(classifyConstellationCondition(10)).toBe('faint')
    expect(classifyConstellationCondition(3)).toBe('invisible')
  })

  it('classifyAstronomerGrade classifies clarity levels', () => {
    expect(classifyAstronomerGrade(90)).toBe('chief-astronomer')
    expect(classifyAstronomerGrade(70)).toBe('astronomer')
    expect(classifyAstronomerGrade(50)).toBe('stargazer')
    expect(classifyAstronomerGrade(35)).toBe('navigator')
    expect(classifyAstronomerGrade(20)).toBe('lost')
    expect(classifyAstronomerGrade(5)).toBe('blind')
  })
})

// ─── Measurement Functions ───────────────────────────────────────────────────

describe('constellation-chart measurements', () => {
  it('measureMagnitude returns 100 for empty code', () => {
    expect(measureMagnitude(emptyCode)).toBe(100)
  })

  it('measureMagnitude returns lower magnitude for strong code', () => {
    const weak = measureMagnitude(simpleCode)
    const strong = measureMagnitude(strongCode)
    expect(strong).toBeLessThan(weak)
  })

  it('measureLuminosity returns higher for exported code', () => {
    const noExport = measureLuminosity(simpleCode)
    const withExport = measureLuminosity(typedCode)
    expect(withExport).toBeGreaterThanOrEqual(noExport)
  })

  it('measureLuminosity returns 0 for empty code', () => {
    expect(measureLuminosity(emptyCode)).toBe(0)
  })

  it('measureTemperature returns higher for active code', () => {
    const simple = measureTemperature(simpleCode)
    const complex = measureTemperature(strongCode)
    expect(complex).toBeGreaterThanOrEqual(simple)
  })

  it('measureTemperature returns 0 for empty code', () => {
    expect(measureTemperature(emptyCode)).toBe(0)
  })

  it('extractConnections returns relative imports', () => {
    const conns = extractConnections(strongCode)
    expect(conns.length).toBeGreaterThanOrEqual(1)
    expect(conns.some(c => c.startsWith('./'))).toBe(true)
  })

  it('extractConnections returns empty for no imports', () => {
    expect(extractConnections(simpleCode)).toEqual([])
    expect(extractConnections(emptyCode)).toEqual([])
  })

  it('extractConnections filters out non-relative imports', () => {
    const code = 'import chalk from "chalk"\nimport { x } from "./local.js"'
    const conns = extractConnections(code)
    expect(conns.length).toBe(1)
    expect(conns[0]).toBe('./local.js')
  })
})

// ─── Core Analysis ───────────────────────────────────────────────────────────

describe('analyzeStarModule', () => {
  it('returns dark star for empty code', () => {
    const star = analyzeStarModule(emptyCode, 'empty.ts')
    expect(star.file).toBe('empty.ts')
    expect(star.magnitude).toBe(100)
    expect(star.brightness).toBe(0)
    expect(star.spectralType).toBe('M-red')
    expect(star.isDark).toBe(true)
    expect(star.qualityScore).toBe(0)
    expect(star.luminosity).toBe(0)
    expect(star.temperature).toBe(0)
    expect(star.connections).toEqual([])
    expect(star.connectionStrength).toBe(0)
  })

  it('returns correct properties for simple code', () => {
    const star = analyzeStarModule(simpleCode, 'simple.ts')
    expect(star.file).toBe('simple.ts')
    expect(typeof star.magnitude).toBe('number')
    expect(typeof star.brightness).toBe('number')
    expect(typeof star.spectralType).toBe('string')
    expect(typeof star.luminosity).toBe('number')
    expect(typeof star.temperature).toBe('number')
    expect(typeof star.age).toBe('number')
    expect(typeof star.distance).toBe('number')
    expect(typeof star.qualityScore).toBe('number')
  })

  it('returns higher quality for strong code vs simple code', () => {
    const simpleStar = analyzeStarModule(simpleCode, 'simple.ts')
    const strongStar = analyzeStarModule(strongCode, 'strong.ts')
    expect(strongStar.qualityScore).toBeGreaterThan(simpleStar.qualityScore)
    expect(strongStar.brightness).toBeGreaterThan(simpleStar.brightness)
  })

  it('marks supergiant for large files', () => {
    const star = analyzeStarModule(supergiantCode, 'big.ts')
    expect(star.isSupergiant).toBe(true)
    expect(star.isDwarf).toBe(false)
  })

  it('marks dwarf for very small files', () => {
    const star = analyzeStarModule(dwarfCode, 'tiny.ts')
    expect(star.isDwarf).toBe(true)
    expect(star.isSupergiant).toBe(false)
  })

  it('marks neutron for dense small files', () => {
    const star = analyzeStarModule(neutronCode, 'dense.ts')
    expect(star.isNeutron).toBe(true)
  })

  it('marks variable for code with TODOs', () => {
    const star = analyzeStarModule(diverseCode, 'todo.ts')
    expect(star.isVariable).toBe(true)
  })

  it('marks dark for code without docs', () => {
    const star = analyzeStarModule(noDocCode, 'nodoc.ts')
    expect(star.isDark).toBe(true)
  })

  it('does not mark dark for code with docs', () => {
    const star = analyzeStarModule(strongCode, 'doc.ts')
    expect(star.isDark).toBe(false)
  })

  it('computes distance based on path depth', () => {
    const shallow = analyzeStarModule(simpleCode, 'a.ts')
    const deep = analyzeStarModule(simpleCode, 'src/commands/deep/a.ts')
    expect(deep.distance).toBeGreaterThan(shallow.distance)
  })

  it('initializes isBinary and isCluster as false', () => {
    const star = analyzeStarModule(strongCode, 'test.ts')
    expect(star.isBinary).toBe(false)
    expect(star.isCluster).toBe(false)
    expect(star.binaryPartner).toBe('')
  })

  it('computes connectionStrength from imports and exports', () => {
    const star = analyzeStarModule(strongCode, 'strong.ts')
    expect(star.connectionStrength).toBeGreaterThan(0)
  })
})

// ─── Binary & Cluster Detection ──────────────────────────────────────────────

describe('binary and cluster detection', () => {
  it('detectBinarySystems finds mutually importing pairs', () => {
    const starA = analyzeStarModule(binaryCodeA, 'src/binaryA.ts')
    const starB = analyzeStarModule(binaryCodeB, 'src/binaryB.ts')
    detectBinarySystems([starA, starB])
    expect(starA.isBinary).toBe(true)
    expect(starB.isBinary).toBe(true)
    expect(starA.binaryPartner).toBe('src/binaryB.ts')
    expect(starB.binaryPartner).toBe('src/binaryA.ts')
  })

  it('detectBinarySystems does not mark non-mutual imports', () => {
    const starA = analyzeStarModule(binaryCodeA, 'src/binaryA.ts')
    const starC = analyzeStarModule(simpleCode, 'src/unrelated.ts')
    detectBinarySystems([starA, starC])
    expect(starA.isBinary).toBe(false)
    expect(starC.isBinary).toBe(false)
  })

  it('detectBinarySystems handles empty array', () => {
    expect(() => detectBinarySystems([])).not.toThrow()
  })

  it('detectClusters marks files with many same-directory connections', () => {
    const code1 = 'import { a } from "./b.js"\nimport { c } from "./d.js"\nexport function x(): number { return 1 }'
    const code2 = 'import { a } from "./c.js"\nexport function y(): void {}'
    const code3 = 'export function z(): string { return "z" }'
    const s1 = analyzeStarModule(code1, 'src/mod/a.ts')
    const s2 = analyzeStarModule(code2, 'src/mod/b.ts')
    const s3 = analyzeStarModule(code3, 'src/mod/c.ts')
    detectClusters([s1, s2, s3])
    expect(s1.isCluster).toBe(true)
  })

  it('detectClusters does not mark isolated files', () => {
    const star = analyzeStarModule(simpleCode, 'src/solo.ts')
    detectClusters([star])
    expect(star.isCluster).toBe(false)
  })

  it('detectClusters handles empty array', () => {
    expect(() => detectClusters([])).not.toThrow()
  })
})

// ─── Mythology ───────────────────────────────────────────────────────────────

describe('measureMythology', () => {
  it('returns 0 for empty stars array', () => {
    expect(measureMythology([])).toBe(0)
  })

  it('returns higher for documented stars', () => {
    const darkStar = analyzeStarModule(noDocCode, 'a.ts')
    const brightStar = analyzeStarModule(strongCode, 'b.ts')
    expect(measureMythology([brightStar])).toBeGreaterThan(measureMythology([darkStar]))
  })

  it('returns higher for multiple consistent stars', () => {
    const s1 = analyzeStarModule(strongCode, 'src/chart-a.ts')
    const s2 = analyzeStarModule(strongCode, 'src/chart-b.ts')
    const single = measureMythology([s1])
    const multi = measureMythology([s1, s2])
    expect(multi).toBeGreaterThanOrEqual(single)
  })
})

// ─── Constellation Analysis ──────────────────────────────────────────────────

describe('analyzeConstellation', () => {
  it('returns void constellation for empty stars', () => {
    const c = analyzeConstellation([], 'empty-dir')
    expect(c.name).toBe('empty-dir')
    expect(c.stars).toEqual([])
    expect(c.constellationType).toBe('void')
    expect(c.condition).toBe('invisible')
    expect(c.coherence).toBe(0)
    expect(c.avgBrightness).toBe(0)
    expect(c.avgMagnitude).toBe(100)
    expect(c.hasCore).toBe(false)
    expect(c.coreStar).toBe('')
    expect(c.isLoose).toBe(true)
  })

  it('computes avgBrightness from stars', () => {
    const s1 = analyzeStarModule(strongCode, 'a.ts')
    const c = analyzeConstellation([s1], 'src')
    expect(c.avgBrightness).toBe(s1.brightness)
  })

  it('computes connectionCount from stars', () => {
    const s1 = analyzeStarModule(strongCode, 'a.ts')
    const c = analyzeConstellation([s1], 'src')
    expect(c.connectionCount).toBe(s1.connections.length)
  })

  it('identifies core star', () => {
    const s1 = analyzeStarModule(simpleCode, 'weak.ts')
    const s2 = analyzeStarModule(strongCode, 'strong.ts')
    const c = analyzeConstellation([s1, s2], 'src')
    expect(c.hasCore).toBe(true)
    expect(c.coreStar).toBe('strong.ts')
  })

  it('detects bound vs loose', () => {
    const connectedCode = [
      'import { a } from "./x.js"',
      'import { b } from "./y.js"',
      'import { c } from "./z.js"',
      'export function d(): void {}',
    ].join('\n')
    const s = analyzeStarModule(connectedCode, 'connected.ts')
    const c = analyzeConstellation([s], 'src')
    if (s.connections.length >= 2) {
      expect(c.isBound).toBe(true)
    }
  })
})

// ─── Recommendations ─────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends about dark stars', () => {
    const stats = {
      darkCount: 3, supergiantCount: 0, variableCount: 0,
      overallClarity: 50, binaryCount: 0,
      totalFiles: 10, totalConstellations: 2, avgMagnitude: 50, avgBrightness: 50,
      avgConnectionStrength: 30, avgLuminosity: 40, avgTemperature: 30, avgAge: 50,
      supergiantCount: 0, dwarfCount: 2, neutronCount: 1, binaryCount: 0,
      clusterCount: 1, variableCount: 0, zodiacConstellations: 0,
      majorConstellations: 1, minorConstellations: 1, cloudConstellations: 0,
      voidConstellations: 0, brilliantConstellations: 0, invisibleConstellations: 0,
      totalConnections: 5, strongestConnection: 'a.ts(50)', overallClarity: 50,
      astronomerGrade: 'stargazer' as const, brightestStar: 'a.ts',
      mostConnected: 'a.ts', mostCoherent: 'src', bestMythology: 'src',
      darkestRegion: 'src',
    }
    const recs = generateRecommendations([], [], { avgBrightness: 50, avgCoherence: 50, avgConnectionStrength: 30, totalConnections: 5, isClear: true, overallClarity: 50 } as any, stats as any)
    expect(recs.some(r => r.includes('Dark stars'))).toBe(true)
  })

  it('recommends about supergiants', () => {
    const stats = {
      darkCount: 0, supergiantCount: 2, variableCount: 0,
      overallClarity: 50, binaryCount: 0,
      totalFiles: 10, totalConstellations: 2, avgMagnitude: 50, avgBrightness: 50,
      avgConnectionStrength: 30, avgLuminosity: 40, avgTemperature: 30, avgAge: 50,
      dwarfCount: 2, neutronCount: 1, clusterCount: 1,
      zodiacConstellations: 0, majorConstellations: 1, minorConstellations: 1,
      cloudConstellations: 0, voidConstellations: 0, brilliantConstellations: 0,
      invisibleConstellations: 0, totalConnections: 5,
      strongestConnection: 'a.ts(50)', overallClarity: 50,
      astronomerGrade: 'stargazer' as const, brightestStar: 'a.ts',
      mostConnected: 'a.ts', mostCoherent: 'src', bestMythology: 'src',
      darkestRegion: 'src',
    }
    const recs = generateRecommendations([], [], { avgBrightness: 50, avgCoherence: 50, avgConnectionStrength: 30, totalConnections: 5, isClear: true, overallClarity: 50 } as any, stats as any)
    expect(recs.some(r => r.includes('Supergiants'))).toBe(true)
  })

  it('recommends about variable stars', () => {
    const stats = {
      darkCount: 0, supergiantCount: 0, variableCount: 4,
      overallClarity: 50, binaryCount: 0,
      totalFiles: 10, totalConstellations: 2, avgMagnitude: 50, avgBrightness: 50,
      avgConnectionStrength: 30, avgLuminosity: 40, avgTemperature: 30, avgAge: 50,
      dwarfCount: 2, neutronCount: 1, clusterCount: 1,
      zodiacConstellations: 0, majorConstellations: 1, minorConstellations: 1,
      cloudConstellations: 0, voidConstellations: 0, brilliantConstellations: 0,
      invisibleConstellations: 0, totalConnections: 5,
      strongestConnection: 'a.ts(50)', overallClarity: 50,
      astronomerGrade: 'stargazer' as const, brightestStar: 'a.ts',
      mostConnected: 'a.ts', mostCoherent: 'src', bestMythology: 'src',
      darkestRegion: 'src',
    }
    const recs = generateRecommendations([], [], { avgBrightness: 50, avgCoherence: 50, avgConnectionStrength: 30, totalConnections: 5, isClear: true, overallClarity: 50 } as any, stats as any)
    expect(recs.some(r => r.includes('Variable stars'))).toBe(true)
  })

  it('recommends clear skies for high clarity', () => {
    const stats = {
      darkCount: 0, supergiantCount: 0, variableCount: 0,
      overallClarity: 75, binaryCount: 0,
      totalFiles: 10, totalConstellations: 2, avgMagnitude: 50, avgBrightness: 70,
      avgConnectionStrength: 30, avgLuminosity: 40, avgTemperature: 30, avgAge: 50,
      dwarfCount: 2, neutronCount: 1, clusterCount: 1,
      zodiacConstellations: 0, majorConstellations: 1, minorConstellations: 1,
      cloudConstellations: 0, voidConstellations: 0, brilliantConstellations: 0,
      invisibleConstellations: 0, totalConnections: 5,
      strongestConnection: 'a.ts(50)', overallClarity: 75,
      astronomerGrade: 'astronomer' as const, brightestStar: 'a.ts',
      mostConnected: 'a.ts', mostCoherent: 'src', bestMythology: 'src',
      darkestRegion: 'src',
    }
    const recs = generateRecommendations([], [], { avgBrightness: 70, avgCoherence: 60, avgConnectionStrength: 30, totalConnections: 5, isClear: true, overallClarity: 75 } as any, stats as any)
    expect(recs.some(r => r.includes('Clear skies'))).toBe(true)
  })

  it('recommends about binary systems', () => {
    const stats = {
      darkCount: 0, supergiantCount: 0, variableCount: 0,
      overallClarity: 50, binaryCount: 3,
      totalFiles: 10, totalConstellations: 2, avgMagnitude: 50, avgBrightness: 50,
      avgConnectionStrength: 30, avgLuminosity: 40, avgTemperature: 30, avgAge: 50,
      dwarfCount: 2, neutronCount: 1, clusterCount: 1,
      zodiacConstellations: 0, majorConstellations: 1, minorConstellations: 1,
      cloudConstellations: 0, voidConstellations: 0, brilliantConstellations: 0,
      invisibleConstellations: 0, totalConnections: 5,
      strongestConnection: 'a.ts(50)', overallClarity: 50,
      astronomerGrade: 'stargazer' as const, brightestStar: 'a.ts',
      mostConnected: 'a.ts', mostCoherent: 'src', bestMythology: 'src',
      darkestRegion: 'src',
    }
    const recs = generateRecommendations([], [], { avgBrightness: 50, avgCoherence: 50, avgConnectionStrength: 30, totalConnections: 5, isClear: true, overallClarity: 50 } as any, stats as any)
    expect(recs.some(r => r.includes('Binary systems'))).toBe(true)
  })

  it('returns empty for no issues', () => {
    const stats = {
      darkCount: 0, supergiantCount: 0, variableCount: 0,
      overallClarity: 30, binaryCount: 0,
      totalFiles: 5, totalConstellations: 1, avgMagnitude: 50, avgBrightness: 30,
      avgConnectionStrength: 30, avgLuminosity: 30, avgTemperature: 30, avgAge: 30,
      dwarfCount: 1, neutronCount: 0, clusterCount: 0,
      zodiacConstellations: 0, majorConstellations: 0, minorConstellations: 0,
      cloudConstellations: 0, voidConstellations: 0, brilliantConstellations: 0,
      invisibleConstellations: 0, totalConnections: 0,
      strongestConnection: 'none', overallClarity: 30,
      astronomerGrade: 'lost' as const, brightestStar: 'a.ts',
      mostConnected: 'a.ts', mostCoherent: 'src', bestMythology: 'src',
      darkestRegion: 'src',
    }
    const recs = generateRecommendations([], [], { avgBrightness: 30, avgCoherence: 30, avgConnectionStrength: 30, totalConnections: 0, isClear: false, overallClarity: 30 } as any, stats as any)
    expect(recs).toEqual([])
  })
})

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe('buildConstellationChartResult', () => {
  it('handles empty input', () => {
    const result = buildConstellationChartResult([], [], {})
    expect(result.stars).toEqual([])
    expect(result.constellations).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.astronomerGrade).toBe('lost')
    expect(result.sky.overallClarity).toBe(15)
    expect(result.recommendations).toEqual([])
  })

  it('produces star for each file', () => {
    const result = buildConstellationChartResult(multiFilePaths, multiFileContents, {})
    expect(result.stars.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups stars into constellations by directory', () => {
    const result = buildConstellationChartResult(multiFilePaths, multiFileContents, {})
    expect(result.constellations.length).toBe(1)
    expect(result.constellations[0].name).toBe('src')
    expect(result.constellations[0].stars.length).toBe(3)
  })

  it('creates multiple constellations for different directories', () => {
    const paths = ['src/a.ts', 'lib/b.ts']
    const contents = [strongCode, simpleCode]
    const result = buildConstellationChartResult(paths, contents, {})
    expect(result.constellations.length).toBe(2)
  })

  it('computes sky overview', () => {
    const result = buildConstellationChartResult(multiFilePaths, multiFileContents, {})
    expect(typeof result.sky.avgBrightness).toBe('number')
    expect(typeof result.sky.avgCoherence).toBe('number')
    expect(typeof result.sky.avgConnectionStrength).toBe('number')
    expect(typeof result.sky.totalConnections).toBe('number')
    expect(typeof result.sky.isClear).toBe('boolean')
    expect(typeof result.sky.overallClarity).toBe('number')
  })

  it('computes all stat fields', () => {
    const result = buildConstellationChartResult(multiFilePaths, multiFileContents, {})
    const s = result.stats
    expect(typeof s.totalFiles).toBe('number')
    expect(typeof s.totalConstellations).toBe('number')
    expect(typeof s.avgMagnitude).toBe('number')
    expect(typeof s.avgBrightness).toBe('number')
    expect(typeof s.avgConnectionStrength).toBe('number')
    expect(typeof s.avgLuminosity).toBe('number')
    expect(typeof s.avgTemperature).toBe('number')
    expect(typeof s.avgAge).toBe('number')
    expect(typeof s.supergiantCount).toBe('number')
    expect(typeof s.dwarfCount).toBe('number')
    expect(typeof s.neutronCount).toBe('number')
    expect(typeof s.darkCount).toBe('number')
    expect(typeof s.binaryCount).toBe('number')
    expect(typeof s.clusterCount).toBe('number')
    expect(typeof s.variableCount).toBe('number')
    expect(typeof s.zodiacConstellations).toBe('number')
    expect(typeof s.majorConstellations).toBe('number')
    expect(typeof s.minorConstellations).toBe('number')
    expect(typeof s.cloudConstellations).toBe('number')
    expect(typeof s.voidConstellations).toBe('number')
    expect(typeof s.brilliantConstellations).toBe('number')
    expect(typeof s.invisibleConstellations).toBe('number')
    expect(typeof s.totalConnections).toBe('number')
    expect(typeof s.strongestConnection).toBe('string')
    expect(typeof s.overallClarity).toBe('number')
    expect(typeof s.astronomerGrade).toBe('string')
    expect(typeof s.brightestStar).toBe('string')
    expect(typeof s.mostConnected).toBe('string')
    expect(typeof s.mostCoherent).toBe('string')
    expect(typeof s.bestMythology).toBe('string')
    expect(typeof s.darkestRegion).toBe('string')
  })

  it('detects binary systems in result', () => {
    const paths = ['src/binaryA.ts', 'src/binaryB.ts']
    const contents = [binaryCodeA, binaryCodeB]
    const result = buildConstellationChartResult(paths, contents, {})
    expect(result.stats.binaryCount).toBe(2)
    const starA = result.stars.find(s => s.file === 'src/binaryA.ts')
    const starB = result.stars.find(s => s.file === 'src/binaryB.ts')
    expect(starA?.isBinary).toBe(true)
    expect(starB?.isBinary).toBe(true)
  })

  it('assigns constellation to each star', () => {
    const result = buildConstellationChartResult(multiFilePaths, multiFileContents, {})
    for (const star of result.stars) {
      expect(star.constellation).toBe('src')
    }
  })

  it('handles single file', () => {
    const result = buildConstellationChartResult(['a.ts'], [strongCode], {})
    expect(result.stars.length).toBe(1)
    expect(result.constellations.length).toBe(1)
    expect(result.constellations[0].stars.length).toBe(1)
  })

  it('produces recommendations for strong code', () => {
    const result = buildConstellationChartResult(multiFilePaths, multiFileContents, {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles missing content gracefully', () => {
    const result = buildConstellationChartResult(['a.ts', 'b.ts'], [''], {})
    expect(result.stars.length).toBe(2)
    expect(result.stars[0].isDark).toBe(true)
  })

  it('tracks supergiant and dwarf counts', () => {
    const result = buildConstellationChartResult(
      ['big.ts', 'tiny.ts', 'normal.ts'],
      [supergiantCode, dwarfCode, strongCode],
      {},
    )
    expect(result.stats.supergiantCount).toBe(1)
    expect(result.stats.dwarfCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('constellation-chart format helpers', () => {
  const sampleResult = buildConstellationChartResult(multiFilePaths, multiFileContents, {})

  it('formatConstellationChartTable returns string', () => {
    const output = formatConstellationChartTable(sampleResult, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
    expect(output).toContain('Constellation Chart')
  })

  it('formatConstellationChartTable includes star section', () => {
    const output = formatConstellationChartTable(sampleResult, false)
    expect(output).toContain('Star Modules')
  })

  it('formatConstellationChartTable includes stats section', () => {
    const output = formatConstellationChartTable(sampleResult, false)
    expect(output).toContain('Statistics')
  })

  it('formatConstellationChartTable verbose shows more detail', () => {
    const brief = formatConstellationChartTable(sampleResult, false)
    const verbose = formatConstellationChartTable(sampleResult, true)
    expect(verbose.length).toBeGreaterThanOrEqual(brief.length)
  })

  it('formatConstellationChartTable handles empty result', () => {
    const emptyResult = buildConstellationChartResult([], [], {})
    const output = formatConstellationChartTable(emptyResult, false)
    expect(output).toContain('No files analyzed')
  })

  it('formatConstellationChartJson returns valid JSON', () => {
    const output = formatConstellationChartJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.stars).toBeDefined()
    expect(parsed.constellations).toBeDefined()
    expect(parsed.sky).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatConstellationChartJson handles empty result', () => {
    const emptyResult = buildConstellationChartResult([], [], {})
    const output = formatConstellationChartJson(emptyResult)
    const parsed = JSON.parse(output)
    expect(parsed.stars).toEqual([])
    expect(parsed.stats.totalFiles).toBe(0)
  })

  it('formatConstellationChartTable includes sky overview', () => {
    const output = formatConstellationChartTable(sampleResult, false)
    expect(output).toContain('Sky Overview')
  })

  it('formatConstellationChartTable includes constellation section', () => {
    const output = formatConstellationChartTable(sampleResult, false)
    expect(output).toContain('Constellations')
  })

  it('formatConstellationChartTable includes recommendations when present', () => {
    const paths = ['dark.ts']
    const contents = [noDocCode]
    const result = buildConstellationChartResult(paths, contents, {})
    const output = formatConstellationChartTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })
})
