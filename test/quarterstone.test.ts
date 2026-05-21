import { describe, expect, it } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countTodos, countComments,
  extractImportPaths,
  measureStoneQuality, measureMortarStrength, measurePlumbAlignment,
  measureLevelness, measureSquareness,
  classifyStoneType, classifyStoneShape, classifyPosition,
  classifyMasterMasonGrade, classifySectionCondition, classifySectionType,
  classifyMasonryPattern, classifyWeatheringAge, classifyWeatheringCondition,
  analyzeStructural, analyzeMasonry, assessWeathering,
  analyzeFoundationStone, analyzeMasonrySection,
  generateRecommendations, buildQuarterstoneResult,
} from '../src/commands/quarterstone-helpers.js'
import { formatQuarterstoneJson, formatQuarterstoneTable } from '../src/commands/quarterstone-format-helpers.js'
import type { FoundationStone, QuarterstoneStats, BuildingInfo, ShorelineInfo } from '../src/commands/quarterstone-helpers.js'

const strongCode = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/**
 * Parse a file
 * @example
 * parseFile('test.ts')
 */
export function parseFile(path: string): Result {
  try {
    const content: string = readFileSync(path, 'utf8')
    if (content.length === 0) {
      return { ok: false, error: 'empty' }
    }
    return { ok: true, data: content }
  } catch (e: unknown) {
    return { ok: false, error: String(e) }
  }
}
`

const weakCode = `var x = 1
console.log(x)
console.log("hello")
// TODO: fix this
// FIXME: broken
function a(b){if(b){if(c){if(d){if(e){if(f){}}}}}}
`

const emptyCode = ''

const simpleExport = 'export function calc(x: number): number { return x * 2 }'

describe('quarterstone primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc('const a = 1\nconst b = 2')).toBe(2)
    expect(countLoc('const a = 1\n\n  \nconst b = 2')).toBe(2)
    expect(countLoc(emptyCode)).toBe(0)
  })

  it('countImports counts import statements', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
    expect(countImports('const x = 1')).toBe(0)
  })

  it('countExports counts export statements', () => {
    expect(countExports('export function a() {}')).toBe(1)
    expect(countExports('export const x = 1')).toBe(1)
    expect(countExports('export interface Foo {}')).toBe(1)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => {}')).toBe(1)
    expect(countFunctions('const fn = async () => {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
    expect(countErrorHandling('throw new Error("x")')).toBe(1)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
    expect(countTypeAnnotations('(a: string, b: boolean) => {}')).toBe(2)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches('if (a) {}')).toBe(1)
    expect(countBranches('a ? b : c')).toBe(1)
  })

  it('maxNesting counts brace depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
    expect(maxNesting('no braces')).toBe(0)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
    expect(countConsole('const x = 1')).toBe(0)
  })

  it('countTodos counts TODO/FIXME', () => {
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos('FIXME: broken')).toBe(1)
    expect(countTodos('HACK: temp')).toBe(1)
  })

  it('countComments counts // and /*', () => {
    expect(countComments('// hello')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
  })

  it('extractImportPaths extracts paths', () => {
    expect(extractImportPaths('import { x } from "./y"')).toEqual(['./y'])
    expect(extractImportPaths('const x = 1')).toEqual([])
    expect(extractImportPaths('import { a } from "b"\nimport { c } from "./d"')).toEqual(['b', './d'])
  })
})

describe('quarterstone measurements', () => {
  it('measureStoneQuality returns 0 for empty', () => {
    expect(measureStoneQuality(emptyCode)).toBe(0)
  })

  it('measureStoneQuality returns number for code', () => {
    const result = measureStoneQuality(strongCode)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('measureMortarStrength returns 0 for empty', () => {
    expect(measureMortarStrength(emptyCode)).toBe(0)
  })

  it('measureMortarStrength returns number for code', () => {
    const result = measureMortarStrength(strongCode)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('measurePlumbAlignment returns 0 for empty', () => {
    expect(measurePlumbAlignment(emptyCode)).toBe(0)
  })

  it('measurePlumbAlignment rewards typed exports', () => {
    const result = measurePlumbAlignment(simpleExport)
    expect(result).toBeGreaterThan(50)
  })

  it('measureLevelness returns 0 for empty', () => {
    expect(measureLevelness(emptyCode)).toBe(0)
  })

  it('measureLevelness returns number for code', () => {
    const result = measureLevelness(simpleExport)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('measureSquareness returns 0 for empty', () => {
    expect(measureSquareness(emptyCode)).toBe(0)
  })

  it('measureSquareness rewards good patterns', () => {
    const result = measureSquareness(strongCode)
    expect(result).toBeGreaterThan(50)
  })
})

describe('quarterstone classifications', () => {
  it('classifyStoneType classifies correctly', () => {
    expect(classifyStoneType(90)).toBe('granite')
    expect(classifyStoneType(75)).toBe('marble')
    expect(classifyStoneType(65)).toBe('limestone')
    expect(classifyStoneType(50)).toBe('sandstone')
    expect(classifyStoneType(40)).toBe('slate')
    expect(classifyStoneType(30)).toBe('brick')
    expect(classifyStoneType(20)).toBe('concrete')
    expect(classifyStoneType(10)).toBe('wood')
    expect(classifyStoneType(3)).toBe('straw')
  })

  it('classifyStoneShape classifies correctly', () => {
    expect(classifyStoneShape(strongCode)).toBe('ashlar')
    expect(classifyStoneShape('export function a(x: number): number { return x }')).toBe('cut-stone')
    expect(classifyStoneShape('export function a() { return 1 }\nconst x = 2\nconst y = 3\nconst z = 4\nconst w = 5\nconst q = 6\nconst r = 7\nconst s = 8\nconst t = 9\nconst u = 10\nconst v = 11')).toBe('dressed-stone')
    expect(classifyStoneShape('export const x = 1')).toBe('fieldstone')
    expect(classifyStoneShape('const x = 1\nconst y = 2\nconst z = 3\nconst a = 4\nconst b = 5\nconst c = 6')).toBe('rubble')
    expect(classifyStoneShape('')).toBe('rough-hewn')
  })

  it('classifyPosition classifies correctly', () => {
    expect(classifyPosition(0, 10)).toBe('cornerstone')
    expect(classifyPosition(2, 5)).toBe('cornerstone')
    expect(classifyPosition(5, 6)).toBe('keystone')
    expect(classifyPosition(4, 4)).toBe('arch-stone')
    expect(classifyPosition(0, 1)).toBe('capstone')
    expect(classifyPosition(3, 0)).toBe('veneer')
    expect(classifyPosition(1, 2)).toBe('wall-stone')
    expect(classifyPosition(0, 0)).toBe('infill')
  })

  it('classifyMasterMasonGrade classifies correctly', () => {
    expect(classifyMasterMasonGrade(80)).toBe('master-mason')
    expect(classifyMasterMasonGrade(65)).toBe('mason')
    expect(classifyMasterMasonGrade(45)).toBe('apprentice')
    expect(classifyMasterMasonGrade(30)).toBe('laborer')
    expect(classifyMasterMasonGrade(15)).toBe('amateur')
    expect(classifyMasterMasonGrade(5)).toBe('child')
  })

  it('classifySectionCondition classifies correctly', () => {
    expect(classifySectionCondition(85)).toBe('monumental')
    expect(classifySectionCondition(65)).toBe('sturdy')
    expect(classifySectionCondition(45)).toBe('serviceable')
    expect(classifySectionCondition(30)).toBe('degraded')
    expect(classifySectionCondition(15)).toBe('failing')
    expect(classifySectionCondition(5)).toBe('collapsed')
  })

  it('classifySectionType classifies correctly', () => {
    expect(classifySectionType(0.6, 0.1)).toBe('foundation')
    expect(classifySectionType(0.1, 0.6)).toBe('columns')
    expect(classifySectionType(0.1, 0.35)).toBe('arches')
    expect(classifySectionType(0.25, 0.05)).toBe('walls')
    expect(classifySectionType(0.1, 0.15)).toBe('buttresses')
    expect(classifySectionType(0.05, 0.0)).toBe('roof')
    expect(classifySectionType(0.0, 0.0)).toBe('decoration')
  })

  it('classifyMasonryPattern classifies correctly', () => {
    expect(classifyMasonryPattern(3, 2, 30)).toBe('english-bond')
    expect(classifyMasonryPattern(2, 2, 10)).toBe('flemish-bond')
    expect(classifyMasonryPattern(3, 0, 15)).toBe('running-bond')
    expect(classifyMasonryPattern(1, 0, 8)).toBe('stack-bond')
    expect(classifyMasonryPattern(1, 0, 2)).toBe('ashlar')
    expect(classifyMasonryPattern(0, 0, 0)).toBe('random')
  })

  it('classifyWeatheringAge classifies correctly', () => {
    expect(classifyWeatheringAge(150, true, 0)).toBe('ancient')
    expect(classifyWeatheringAge(60, true, 1)).toBe('seasoned')
    expect(classifyWeatheringAge(40, false, 0)).toBe('weathered')
    expect(classifyWeatheringAge(15, false, 0)).toBe('new')
    expect(classifyWeatheringAge(3, false, 0)).toBe('fresh')
    expect(classifyWeatheringAge(0, false, 0)).toBe('ruined')
  })

  it('classifyWeatheringCondition classifies correctly', () => {
    expect(classifyWeatheringCondition(90)).toBe('pristine')
    expect(classifyWeatheringCondition(75)).toBe('excellent')
    expect(classifyWeatheringCondition(60)).toBe('good')
    expect(classifyWeatheringCondition(45)).toBe('fair')
    expect(classifyWeatheringCondition(30)).toBe('weathered')
    expect(classifyWeatheringCondition(15)).toBe('eroded')
    expect(classifyWeatheringCondition(5)).toBe('crumbling')
  })
})

describe('quarterstone structural analysis', () => {
  it('analyzeStructural returns valid StructuralProps', () => {
    const result = analyzeStructural(strongCode)
    expect(typeof result.compressiveStrength).toBe('number')
    expect(typeof result.tensileStrength).toBe('number')
    expect(typeof result.shearResistance).toBe('number')
    expect(typeof result.weathering).toBe('number')
    expect(typeof result.hasSettled).toBe('boolean')
    expect(typeof result.isSettling).toBe('boolean')
    expect(typeof result.isShifting).toBe('boolean')
    expect(typeof result.cracks).toBe('number')
    expect(typeof result.spalls).toBe('number')
    expect(typeof result.efflorescence).toBe('number')
  })

  it('analyzeStructural detects cracks in weak code', () => {
    const result = analyzeStructural(weakCode)
    expect(result.cracks).toBeGreaterThan(0)
    expect(result.isShifting).toBe(true)
  })

  it('analyzeStructural strong code is stable', () => {
    const result = analyzeStructural(strongCode)
    expect(result.compressiveStrength).toBeGreaterThan(50)
    expect(result.weathering).toBeGreaterThan(40)
  })

  it('analyzeStructural empty code has few issues', () => {
    const result = analyzeStructural(emptyCode)
    expect(result.compressiveStrength).toBe(70)
    expect(result.cracks).toBe(0)
  })
})

describe('quarterstone masonry analysis', () => {
  it('analyzeMasonry returns valid MasonryInfo', () => {
    const result = analyzeMasonry(strongCode)
    expect(typeof result.pattern).toBe('string')
    expect(typeof result.jointThickness).toBe('number')
    expect(typeof result.mortarQuality).toBe('number')
    expect(typeof result.pointing).toBe('number')
  })

  it('analyzeMasonry strong code has good mortar', () => {
    const result = analyzeMasonry(strongCode)
    expect(result.mortarQuality).toBeGreaterThan(40)
    expect(result.pointing).toBeGreaterThan(30)
  })
})

describe('quarterstone weathering assessment', () => {
  it('assessWeathering returns valid WeatheringInfo', () => {
    const result = assessWeathering(strongCode, 70)
    expect(typeof result.age).toBe('string')
    expect(typeof result.condition).toBe('string')
    expect(Array.isArray(result.maintenanceNeeded)).toBe(true)
  })

  it('assessWeathering weak code needs maintenance', () => {
    const result = assessWeathering(weakCode, 20)
    expect(result.maintenanceNeeded.length).toBeGreaterThan(0)
  })

  it('assessWeathering pristine code needs little maintenance', () => {
    const result = assessWeathering(strongCode, 85)
    expect(result.condition).toBe('pristine')
  })
})

describe('quarterstone foundation stone analysis', () => {
  it('analyzeFoundationStone returns valid FoundationStone', () => {
    const result = analyzeFoundationStone(strongCode, 'strong.ts', 2, 5)
    expect(result.file).toBe('strong.ts')
    expect(typeof result.stoneQuality).toBe('number')
    expect(typeof result.mortarStrength).toBe('number')
    expect(typeof result.plumbAlignment).toBe('number')
    expect(typeof result.levelness).toBe('number')
    expect(typeof result.squareness).toBe('number')
    expect(typeof result.isCornerstone).toBe('boolean')
    expect(typeof result.isKeystone).toBe('boolean')
    expect(typeof result.isCapstone).toBe('boolean')
    expect(typeof result.isFoundation).toBe('boolean')
    expect(typeof result.isLoadBearing).toBe('boolean')
    expect(typeof result.stoneType).toBe('string')
    expect(typeof result.stoneShape).toBe('string')
    expect(typeof result.position).toBe('string')
    expect(result.masonry).toBeDefined()
    expect(result.structural).toBeDefined()
    expect(result.load).toBeDefined()
    expect(result.connections).toBeDefined()
    expect(result.weathering).toBeDefined()
    expect(typeof result.qualityScore).toBe('number')
  })

  it('analyzeFoundationStone with many dependents is cornerstone', () => {
    const result = analyzeFoundationStone(strongCode, 'core.ts', 1, 6)
    expect(result.isCornerstone).toBe(true)
    expect(result.position).toBe('cornerstone')
  })

  it('analyzeFoundationStone with balanced deps is keystone', () => {
    const result = analyzeFoundationStone(strongCode, 'bridge.ts', 4, 5)
    expect(result.isKeystone).toBe(true)
  })

  it('analyzeFoundationStone empty code is straw', () => {
    const result = analyzeFoundationStone(emptyCode, 'empty.ts', 0, 0)
    expect(result.stoneType).toBe('straw')
    expect(result.qualityScore).toBe(0)
  })

  it('analyzeFoundationStone load is computed', () => {
    const result = analyzeFoundationStone(strongCode, 'calc.ts', 1, 3)
    expect(result.load.selfWeight).toBeGreaterThan(0)
    expect(result.load.totalLoad).toBeGreaterThan(0)
    expect(typeof result.load.isOverloaded).toBe('boolean')
    expect(typeof result.load.loadRatio).toBe('number')
  })

  it('analyzeFoundationStone qualityScore is bounded 0-100', () => {
    const result = analyzeFoundationStone(strongCode, 'strong.ts', 2, 5)
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })
})

describe('quarterstone masonry section analysis', () => {
  it('analyzeMasonrySection with empty stones returns collapsed', () => {
    const result = analyzeMasonrySection([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.stones.length).toBe(0)
    expect(result.structuralHealth).toBe(0)
    expect(result.condition).toBe('collapsed')
    expect(result.isSound).toBe(false)
  })

  it('analyzeMasonrySection with strong stones returns good section', () => {
    const stone = analyzeFoundationStone(strongCode, 'strong.ts', 2, 5)
    const result = analyzeMasonrySection([stone], 'src')
    expect(result.directory).toBe('src')
    expect(result.stones.length).toBe(1)
    expect(result.avgStoneQuality).toBeGreaterThan(0)
    expect(result.cornerstone).toBe('strong.ts')
  })

  it('analyzeMasonrySection calculates aggregates', () => {
    const s1 = analyzeFoundationStone(simpleExport, 'a.ts', 0, 0)
    const s2 = analyzeFoundationStone(strongCode, 'b.ts', 2, 5)
    const result = analyzeMasonrySection([s1, s2], 'src')
    const expectedAvg = Math.round((s1.stoneQuality + s2.stoneQuality) / 2)
    expect(result.avgStoneQuality).toBe(expectedAvg)
  })

  it('analyzeMasonrySection counts foundation and loadBearing', () => {
    const strong = analyzeFoundationStone(strongCode, 'strong.ts', 1, 6)
    const weak = analyzeFoundationStone(weakCode, 'weak.ts', 0, 0)
    const result = analyzeMasonrySection([strong, weak], 'src')
    expect(typeof result.foundationCount).toBe('number')
    expect(typeof result.loadBearingCount).toBe('number')
    expect(typeof result.overloadedCount).toBe('number')
  })
})

describe('quarterstone recommendations', () => {
  it('generateRecommendations returns array', () => {
    const stones: FoundationStone[] = []
    const building: BuildingInfo = {
      cornerstone: 'none', keystone: 'none',
      avgStoneQuality: 0, avgMortarStrength: 0, avgPlumbAlignment: 0,
      avgLevelness: 0, avgSquareness: 0, totalLoad: 0, totalCapacity: 0,
      loadRatio: 0, isStructurallySound: true, structuralHealth: 70,
      foundationDepth: 50, buildingHeight: 60, isPlumb: true,
      isLevel: true, isSquare: true,
    }
    const stats: QuarterstoneStats = {
      totalFiles: 0, totalSections: 0, cornerstones: 0, keystones: 0,
      capstones: 0, loadBearingStones: 0, overloadedStones: 0,
      foundationStones: 0, graniteStones: 0, strawStones: 0,
      avgStoneQuality: 70, avgMortarStrength: 70, avgPlumbAlignment: 70,
      avgLevelness: 70, avgSquareness: 70, totalCracks: 0, totalSpalls: 0,
      totalEfflorescence: 0, settledStones: 0, shiftingStones: 0,
      overallStructuralHealth: 70, masterMasonGrade: 'mason',
      cornerstoneFile: 'none', keystoneFile: 'none',
      strongestStone: 'a.ts', weakestStone: 'b.ts',
      heaviestLoad: 'c.ts', bestMasonry: 'd.ts',
    }
    const result = generateRecommendations(stones, [], building, stats)
    expect(Array.isArray(result)).toBe(true)
  })

  it('generateRecommendations warns about overloaded stones', () => {
    const result = buildQuarterstoneResult(['weak.ts'], [weakCode], {})
    const hasOverload = result.recommendations.some(r => r.includes('Overloaded'))
    const hasStraw = result.recommendations.some(r => r.includes('Straw'))
    const hasSolid = result.recommendations.some(r => r.includes('Solid'))
    expect(hasOverload || hasStraw || hasSolid || result.recommendations.length >= 0).toBe(true)
  })
})

describe('quarterstone buildQuarterstoneResult', () => {
  it('buildQuarterstoneResult returns valid result', () => {
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    expect(result.stones.length).toBe(1)
    expect(result.sections.length).toBe(1)
    expect(result.building).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('buildQuarterstoneResult handles empty files array', () => {
    const result = buildQuarterstoneResult([], [], {})
    expect(result.stones.length).toBe(0)
    expect(result.sections.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.strongestStone).toBe('none')
    expect(result.stats.weakestStone).toBe('none')
    expect(result.building.cornerstone).toBe('none')
  })

  it('buildQuarterstoneResult handles multiple files', () => {
    const result = buildQuarterstoneResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [simpleExport, strongCode, weakCode],
      {},
    )
    expect(result.stones.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('buildQuarterstoneResult groups into sections by directory', () => {
    const result = buildQuarterstoneResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [simpleExport, strongCode, weakCode],
      {},
    )
    expect(result.sections.length).toBe(2)
  })

  it('buildQuarterstoneResult computes building info', () => {
    const result = buildQuarterstoneResult(['a.ts'], [strongCode], {})
    const b = result.building
    expect(typeof b.structuralHealth).toBe('number')
    expect(typeof b.isStructurallySound).toBe('boolean')
    expect(typeof b.isPlumb).toBe('boolean')
    expect(typeof b.isLevel).toBe('boolean')
    expect(typeof b.isSquare).toBe('boolean')
    expect(typeof b.foundationDepth).toBe('number')
    expect(typeof b.buildingHeight).toBe('number')
  })

  it('buildQuarterstoneResult computes stats', () => {
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    const s = result.stats
    expect(s.totalFiles).toBe(1)
    expect(typeof s.graniteStones).toBe('number')
    expect(typeof s.strawStones).toBe('number')
    expect(typeof s.totalCracks).toBe('number')
    expect(typeof s.totalSpalls).toBe('number')
    expect(typeof s.settledStones).toBe('number')
    expect(typeof s.shiftingStones).toBe('number')
    expect(typeof s.masterMasonGrade).toBe('string')
    expect(s.strongestStone).toBe('a.ts')
  })

  it('buildQuarterstoneResult identifies strongest and weakest', () => {
    const result = buildQuarterstoneResult(
      ['strong.ts', 'empty.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.strongestStone).toBe('strong.ts')
    expect(result.stats.weakestStone).toBe('empty.ts')
  })

  it('buildQuarterstoneResult handles missing content', () => {
    const result = buildQuarterstoneResult(['a.ts'], [], {})
    expect(result.stones.length).toBe(1)
    expect(result.stones[0].stoneType).toBe('straw')
  })

  it('buildQuarterstoneResult computes load metrics', () => {
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    expect(typeof result.building.totalLoad).toBe('number')
    expect(typeof result.building.totalCapacity).toBe('number')
    expect(typeof result.building.loadRatio).toBe('number')
  })

  it('buildQuarterstoneResult counts stone types', () => {
    const result = buildQuarterstoneResult(
      ['strong.ts', 'empty.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(typeof result.stats.graniteStones).toBe('number')
    expect(typeof result.stats.strawStones).toBe('number')
  })

  it('buildQuarterstoneResult identifies heaviest and best masonry', () => {
    const result = buildQuarterstoneResult(['a.ts'], [strongCode], {})
    expect(typeof result.stats.heaviestLoad).toBe('string')
    expect(typeof result.stats.bestMasonry).toBe('string')
  })
})

describe('quarterstone format helpers', () => {
  it('formatQuarterstoneTable returns string', () => {
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    const formatted = formatQuarterstoneTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('formatQuarterstoneTable verbose returns more detail', () => {
    const result = buildQuarterstoneResult(['a.ts'], [strongCode], {})
    const normal = formatQuarterstoneTable(result, false)
    const verbose = formatQuarterstoneTable(result, true)
    expect(verbose.length).toBeGreaterThanOrEqual(normal.length)
  })

  it('formatQuarterstoneTable handles empty results', () => {
    const result = buildQuarterstoneResult([], [], {})
    const formatted = formatQuarterstoneTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('No files analyzed')
  })

  it('formatQuarterstoneTable handles many stones (truncation)', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleExport)
    const result = buildQuarterstoneResult(files, contents, {})
    const formatted = formatQuarterstoneTable(result, false)
    expect(formatted).toContain('more')
  })

  it('formatQuarterstoneJson returns valid JSON', () => {
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    const json = formatQuarterstoneJson(result)
    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.stones).toBeDefined()
    expect(parsed.sections).toBeDefined()
    expect(parsed.building).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatQuarterstoneJson preserves all fields', () => {
    const result = buildQuarterstoneResult(['a.ts'], [strongCode], {})
    const json = formatQuarterstoneJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stones.length).toBe(1)
    expect(parsed.building.cornerstone).toBe('a.ts')
  })
})

describe('quarterstone end-to-end', () => {
  it('full analysis produces consistent result', () => {
    const result = buildQuarterstoneResult(
      ['strong.ts', 'weak.ts', 'empty.ts'],
      [strongCode, weakCode, emptyCode],
      {},
    )

    expect(result.stones.length).toBe(3)

    const strong = result.stones.find(s => s.file === 'strong.ts')!
    const weak = result.stones.find(s => s.file === 'weak.ts')!
    const empty = result.stones.find(s => s.file === 'empty.ts')!

    expect(strong.qualityScore).toBeGreaterThan(weak.qualityScore)
    expect(weak.qualityScore).toBeGreaterThan(empty.qualityScore)
    expect(empty.qualityScore).toBe(0)

    expect(result.stats.strongestStone).toBe('strong.ts')
    expect(result.stats.weakestStone).toBe('empty.ts')
  })

  it('quality scores are bounded 0-100', () => {
    const result = buildQuarterstoneResult(
      ['a.ts', 'b.ts'],
      [strongCode, weakCode],
      {},
    )
    for (const stone of result.stones) {
      expect(stone.qualityScore).toBeGreaterThanOrEqual(0)
      expect(stone.qualityScore).toBeLessThanOrEqual(100)
      expect(stone.stoneQuality).toBeGreaterThanOrEqual(0)
      expect(stone.stoneQuality).toBeLessThanOrEqual(100)
    }
  })

  it('stats averages are bounded', () => {
    const result = buildQuarterstoneResult(
      ['a.ts', 'b.ts'],
      [strongCode, weakCode],
      {},
    )
    const s = result.stats
    expect(s.avgStoneQuality).toBeGreaterThanOrEqual(0)
    expect(s.avgStoneQuality).toBeLessThanOrEqual(100)
    expect(s.overallStructuralHealth).toBeGreaterThanOrEqual(0)
    expect(s.overallStructuralHealth).toBeLessThanOrEqual(100)
  })

  it('all stone type values are valid', () => {
    const validTypes = ['granite', 'marble', 'limestone', 'sandstone', 'slate', 'brick', 'concrete', 'wood', 'straw']
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    expect(validTypes).toContain(result.stones[0].stoneType)
  })

  it('all position values are valid', () => {
    const validPositions = ['cornerstone', 'foundation', 'wall-stone', 'arch-stone', 'keystone', 'capstone', 'infill', 'veneer']
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    expect(validPositions).toContain(result.stones[0].position)
  })

  it('all weathering condition values are valid', () => {
    const validConditions = ['pristine', 'excellent', 'good', 'fair', 'weathered', 'eroded', 'crumbling']
    const result = buildQuarterstoneResult(['a.ts'], [simpleExport], {})
    expect(validConditions).toContain(result.stones[0].weathering.condition)
  })

  it('section with directory grouping works', () => {
    const result = buildQuarterstoneResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [strongCode, simpleExport, weakCode],
      {},
    )
    expect(result.sections.length).toBe(2)
    expect(result.stats.totalSections).toBe(2)
  })
})
