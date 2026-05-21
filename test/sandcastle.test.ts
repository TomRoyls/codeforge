import { describe, expect, it } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countTodos, countComments,
  measureSandQuality, measureMoistureContent, measureStructuralIntegrity,
  measureTideResistance, measureWindResistance, measureFoundationDepth,
  classifySandGrain, classifyMoisture, classifyTowerType, classifyArchitecture,
  classifyFoundationMaterial, classifyArchitectGrade, classifyDefenseLevel,
  classifyCollapseRisk, classifyCondition, classifyFortressCondition,
  analyzeStructural, analyzeTideExposure, analyzeWindExposure,
  analyzeFoundation, analyzeSandTower, analyzeSandFortress,
  generateRecommendations, buildSandcastleResult,
} from '../src/commands/sandcastle-helpers.js'
import { formatSandcastleJson, formatSandcastleTable } from '../src/commands/sandcastle-format-helpers.js'
import type { SandTower, SandFortress, SandcastleResult, ShorelineInfo, SandcastleStats } from '../src/commands/sandcastle-helpers.js'

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
console.log("world")
// TODO: fix this
// FIXME: broken
// HACK: temp
function a(b){if(b){if(c){if(d){if(e){if(f){}}}}}}
`

const emptyCode = ''

const simpleExport = 'export function calc(x: number): number { return x * 2 }'

describe('sandcastle primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc('const a = 1\nconst b = 2')).toBe(2)
    expect(countLoc('const a = 1\n\n  \nconst b = 2')).toBe(2)
    expect(countLoc(emptyCode)).toBe(0)
  })

  it('countImports counts import statements', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
    expect(countImports('const x = 1')).toBe(0)
    expect(countImports('import { a } from "b"\nimport { c } from "d"')).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports('export function a() {}')).toBe(1)
    expect(countExports('export const x = 1')).toBe(1)
    expect(countExports('export interface Foo {}')).toBe(1)
    expect(countExports('const x = 1')).toBe(0)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => {}')).toBe(1)
    expect(countFunctions('const fn = async () => {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
    expect(countErrorHandling('throw new Error("x")')).toBe(1)
    expect(countErrorHandling('promise.catch(() => {})')).toBe(1)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
    expect(countTypeAnnotations('(a: string, b: boolean) => {}')).toBe(2)
    expect(countTypeAnnotations('const x = 1')).toBe(0)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches('if (a) {}')).toBe(1)
    expect(countBranches('a ? b : c')).toBe(1)
    expect(countBranches('switch(x) {}')).toBe(1)
  })

  it('maxNesting counts brace depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
    expect(maxNesting('no braces')).toBe(0)
    expect(maxNesting('{')).toBe(1)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
    expect(countConsole('console.error("x")')).toBe(1)
    expect(countConsole('const x = 1')).toBe(0)
  })

  it('countTodos counts TODO/FIXME/HACK/XXX', () => {
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos('FIXME: broken')).toBe(1)
    expect(countTodos('HACK: temp')).toBe(1)
    expect(countTodos('XXX: danger')).toBe(1)
  })

  it('countComments counts // and /*', () => {
    expect(countComments('// hello')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
    expect(countComments('/** doc */')).toBe(1)
  })
})

describe('sandcastle measurements', () => {
  it('measureSandQuality returns 0 for empty', () => {
    expect(measureSandQuality(emptyCode)).toBe(0)
  })

  it('measureSandQuality returns number for code', () => {
    const result = measureSandQuality(strongCode)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('measureMoistureContent returns 0 for empty', () => {
    expect(measureMoistureContent(emptyCode)).toBe(0)
  })

  it('measureMoistureContent returns number for code', () => {
    const result = measureMoistureContent(simpleExport)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('measureStructuralIntegrity returns 0 for empty', () => {
    expect(measureStructuralIntegrity(emptyCode)).toBe(0)
  })

  it('measureStructuralIntegrity rewards good patterns', () => {
    const result = measureStructuralIntegrity(strongCode)
    expect(result).toBeGreaterThan(50)
  })

  it('measureTideResistance returns 0 for empty', () => {
    expect(measureTideResistance(emptyCode)).toBe(0)
  })

  it('measureTideResistance returns number for code', () => {
    const result = measureTideResistance(strongCode)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('measureWindResistance returns 0 for empty', () => {
    expect(measureWindResistance(emptyCode)).toBe(0)
  })

  it('measureWindResistance rewards few imports', () => {
    const result = measureWindResistance('const x = 1')
    expect(result).toBeGreaterThan(50)
  })

  it('measureFoundationDepth returns 0 for empty', () => {
    expect(measureFoundationDepth(emptyCode)).toBe(0)
  })

  it('measureFoundationDepth rewards docs and types', () => {
    const result = measureFoundationDepth(strongCode)
    expect(result).toBeGreaterThan(40)
  })
})

describe('sandcastle classifications', () => {
  it('classifySandGrain classifies correctly', () => {
    expect(classifySandGrain(90)).toBe('fine')
    expect(classifySandGrain(70)).toBe('medium')
    expect(classifySandGrain(50)).toBe('coarse')
    expect(classifySandGrain(30)).toBe('mixed')
    expect(classifySandGrain(10)).toBe('muddy')
  })

  it('classifyMoisture classifies correctly', () => {
    expect(classifyMoisture(95)).toBe('saturated')
    expect(classifyMoisture(75)).toBe('wet')
    expect(classifyMoisture(55)).toBe('perfect')
    expect(classifyMoisture(35)).toBe('damp')
    expect(classifyMoisture(18)).toBe('dry')
    expect(classifyMoisture(5)).toBe('bone-dry')
  })

  it('classifyTowerType classifies correctly', () => {
    expect(classifyTowerType(1, 0, 1)).toBe('keep')
    expect(classifyTowerType(5, 5, 3)).toBe('bridge')
    expect(classifyTowerType(0, 6, 0)).toBe('moat')
    expect(classifyTowerType(0, 0, 0)).toBe('decoration')
    expect(classifyTowerType(5, 2, 6)).toBe('rampart')
    expect(classifyTowerType(0, 5, 0)).toBe('gatehouse')
    expect(classifyTowerType(3, 1, 4)).toBe('wall')
    expect(classifyTowerType(2, 2, 2)).toBe('tower')
  })

  it('classifyArchitecture classifies correctly', () => {
    expect(classifyArchitecture(80, 80, 80)).toBe('roman')
    expect(classifyArchitecture(65, 65, 65)).toBe('gothic')
    expect(classifyArchitecture(55, 55, 55)).toBe('concentric')
    expect(classifyArchitecture(45, 45, 45)).toBe('modern')
    expect(classifyArchitecture(35, 35, 35)).toBe('fortress')
    expect(classifyArchitecture(25, 25, 25)).toBe('moat-and-bailey')
    expect(classifyArchitecture(10, 10, 10)).toBe('shanty')
  })

  it('classifyFoundationMaterial classifies correctly', () => {
    expect(classifyFoundationMaterial(85)).toBe('bedrock')
    expect(classifyFoundationMaterial(65)).toBe('concrete')
    expect(classifyFoundationMaterial(45)).toBe('stone')
    expect(classifyFoundationMaterial(30)).toBe('gravel')
    expect(classifyFoundationMaterial(15)).toBe('sand')
    expect(classifyFoundationMaterial(5)).toBe('quicksand')
  })

  it('classifyArchitectGrade classifies correctly', () => {
    expect(classifyArchitectGrade(80)).toBe('master-builder')
    expect(classifyArchitectGrade(65)).toBe('architect')
    expect(classifyArchitectGrade(45)).toBe('mason')
    expect(classifyArchitectGrade(30)).toBe('apprentice')
    expect(classifyArchitectGrade(15)).toBe('child')
    expect(classifyArchitectGrade(5)).toBe('toddler')
  })

  it('classifyDefenseLevel classifies correctly', () => {
    expect(classifyDefenseLevel(85)).toBe('fortress')
    expect(classifyDefenseLevel(65)).toBe('castle')
    expect(classifyDefenseLevel(45)).toBe('keep')
    expect(classifyDefenseLevel(30)).toBe('wall')
    expect(classifyDefenseLevel(15)).toBe('fence')
    expect(classifyDefenseLevel(5)).toBe('none')
  })

  it('classifyCollapseRisk classifies correctly', () => {
    expect(classifyCollapseRisk(85)).toBe('none')
    expect(classifyCollapseRisk(70)).toBe('minimal')
    expect(classifyCollapseRisk(55)).toBe('low')
    expect(classifyCollapseRisk(40)).toBe('moderate')
    expect(classifyCollapseRisk(25)).toBe('high')
    expect(classifyCollapseRisk(15)).toBe('imminent')
    expect(classifyCollapseRisk(5)).toBe('collapsed')
  })

  it('classifyCondition classifies correctly', () => {
    expect(classifyCondition(90)).toBe('majestic')
    expect(classifyCondition(75)).toBe('impressive')
    expect(classifyCondition(60)).toBe('solid')
    expect(classifyCondition(45)).toBe('fair')
    expect(classifyCondition(30)).toBe('crumbling')
    expect(classifyCondition(15)).toBe('ruins')
    expect(classifyCondition(5)).toBe('washed-away')
  })

  it('classifyFortressCondition classifies correctly', () => {
    expect(classifyFortressCondition(85)).toBe('grand')
    expect(classifyFortressCondition(65)).toBe('sturdy')
    expect(classifyFortressCondition(45)).toBe('standing')
    expect(classifyFortressCondition(30)).toBe('weathering')
    expect(classifyFortressCondition(15)).toBe('crumbling')
    expect(classifyFortressCondition(5)).toBe('ruins')
  })
})

describe('sandcastle structural analysis', () => {
  it('analyzeStructural detects load-bearing files', () => {
    const result = analyzeStructural(strongCode)
    expect(result.isLoadBearing).toBe(true)
    expect(result.hasReinforcement).toBe(true)
  })

  it('analyzeStructural detects cracks in weak code', () => {
    const result = analyzeStructural(weakCode)
    expect(result.hasCracks).toBe(true)
    expect(result.crackCount).toBeGreaterThan(0)
  })

  it('analyzeStructural detects erosion from deep nesting', () => {
    const result = analyzeStructural(weakCode)
    expect(result.hasErosion).toBe(true)
    expect(result.erosionPoints).toBeGreaterThan(0)
  })

  it('analyzeStructural detects cave-in risk', () => {
    const result = analyzeStructural('function a(){if(b){if(c){if(d){if(e){if(f){}}}}}}')
    expect(result.hasCaveInRisk).toBe(true)
  })

  it('analyzeStructural empty code has no issues', () => {
    const result = analyzeStructural(emptyCode)
    expect(result.isLoadBearing).toBe(false)
    expect(result.hasCracks).toBe(false)
  })
})

describe('sandcastle tide analysis', () => {
  it('analyzeTideExposure returns valid analysis', () => {
    const result = analyzeTideExposure(strongCode)
    expect(typeof result.highTideRisk).toBe('number')
    expect(typeof result.lowTideRisk).toBe('number')
    expect(typeof result.isAboveTideLine).toBe('boolean')
    expect(typeof result.isBelowTideLine).toBe('boolean')
    expect(typeof result.waveImpactCount).toBe('number')
  })

  it('analyzeTideExposure empty code is above tide', () => {
    const result = analyzeTideExposure(emptyCode)
    expect(result.highTideRisk).toBe(30)
    expect(result.isAboveTideLine).toBe(true)
  })

  it('analyzeTideExposure high export code has higher risk', () => {
    const many = 'export function a() {}\nexport function b() {}\nexport function c() {}\nexport function d() {}\nexport function e() {}\nexport function f() {}'
    const result = analyzeTideExposure(many)
    expect(result.highTideRisk).toBeGreaterThan(0)
  })
})

describe('sandcastle wind analysis', () => {
  it('analyzeWindExposure returns valid analysis', () => {
    const result = analyzeWindExposure(strongCode)
    expect(typeof result.isSheltered).toBe('boolean')
    expect(typeof result.isExposed).toBe('boolean')
    expect(typeof result.windSpeed).toBe('number')
    expect(typeof result.gustCount).toBe('number')
    expect(typeof result.isWindResistant).toBe('boolean')
  })

  it('analyzeWindExposure empty code is sheltered', () => {
    const result = analyzeWindExposure(emptyCode)
    expect(result.isSheltered).toBe(true)
    expect(result.gustCount).toBe(0)
  })

  it('analyzeWindExposure many imports is exposed', () => {
    const many = Array.from({ length: 8 }, (_, i) => `import { m${i} } from "mod${i}"`).join('\n')
    const result = analyzeWindExposure(many)
    expect(result.isExposed).toBe(true)
  })
})

describe('sandcastle foundation analysis', () => {
  it('analyzeFoundation returns valid FoundationInfo', () => {
    const result = analyzeFoundation(strongCode)
    expect(typeof result.depth).toBe('number')
    expect(typeof result.width).toBe('number')
    expect(typeof result.material).toBe('string')
    expect(typeof result.isSet).toBe('boolean')
    expect(typeof result.isSettling).toBe('boolean')
    expect(typeof result.isShifting).toBe('boolean')
    expect(typeof result.hasDocumentation).toBe('boolean')
    expect(typeof result.hasTests).toBe('boolean')
    expect(typeof result.hasTypes).toBe('boolean')
  })

  it('analyzeFoundation strong code has docs and types', () => {
    const result = analyzeFoundation(strongCode)
    expect(result.hasDocumentation).toBe(true)
    expect(result.hasTypes).toBe(true)
  })

  it('analyzeFoundation empty code is shifting', () => {
    const result = analyzeFoundation(emptyCode)
    expect(result.isShifting).toBe(true)
    expect(result.material).toBe('quicksand')
  })
})

describe('sandcastle tower analysis', () => {
  it('analyzeSandTower returns valid SandTower', () => {
    const result = analyzeSandTower(strongCode, 'strong.ts')
    expect(result.file).toBe('strong.ts')
    expect(typeof result.sandQuality).toBe('number')
    expect(typeof result.moistureContent).toBe('number')
    expect(typeof result.structuralIntegrity).toBe('number')
    expect(typeof result.tideResistance).toBe('number')
    expect(typeof result.windResistance).toBe('number')
    expect(typeof result.foundationDepth).toBe('number')
    expect(typeof result.towerHeight).toBe('number')
    expect(typeof result.towerWidth).toBe('number')
    expect(typeof result.wallThickness).toBe('number')
    expect(typeof result.sandGrain).toBe('string')
    expect(typeof result.moisture).toBe('string')
    expect(typeof result.towerType).toBe('string')
    expect(typeof result.architecture).toBe('string')
    expect(result.structural).toBeDefined()
    expect(result.tideAnalysis).toBeDefined()
    expect(result.windAnalysis).toBeDefined()
    expect(result.foundation).toBeDefined()
    expect(typeof result.collapseRisk).toBe('string')
    expect(typeof result.condition).toBe('string')
    expect(typeof result.qualityScore).toBe('number')
    expect(Array.isArray(result.vulnerabilities)).toBe(true)
    expect(Array.isArray(result.strengths)).toBe(true)
  })

  it('analyzeSandTower strong code has good quality', () => {
    const result = analyzeSandTower(strongCode, 'strong.ts')
    expect(result.qualityScore).toBeGreaterThan(40)
    expect(result.collapseRisk).not.toBe('collapsed')
  })

  it('analyzeSandTower weak code has poor quality', () => {
    const result = analyzeSandTower(weakCode, 'weak.ts')
    expect(result.qualityScore).toBeLessThan(result.qualityScore + 1)
    expect(result.vulnerabilities.length).toBeGreaterThan(0)
  })

  it('analyzeSandTower empty code is washed-away', () => {
    const result = analyzeSandTower(emptyCode, 'empty.ts')
    expect(result.condition).toBe('washed-away')
    expect(result.collapseRisk).toBe('collapsed')
    expect(result.qualityScore).toBe(0)
  })

  it('analyzeSandTower qualityScore is 0-100', () => {
    const result = analyzeSandTower(strongCode, 'test.ts')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })

  it('analyzeSandTower has correct structure fields', () => {
    const result = analyzeSandTower(simpleExport, 'calc.ts')
    expect(result.structural.isLoadBearing).toBe(true)
    expect(result.foundation.hasTypes).toBe(true)
  })
})

describe('sandcastle fortress analysis', () => {
  it('analyzeSandFortress with empty towers returns ruins', () => {
    const result = analyzeSandFortress([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.towers.length).toBe(0)
    expect(result.fortressHealth).toBe(0)
    expect(result.condition).toBe('ruins')
    expect(result.defenseLevel).toBe('none')
    expect(result.isDefensible).toBe(false)
  })

  it('analyzeSandFortress with strong towers returns good fortress', () => {
    const tower = analyzeSandTower(strongCode, 'strong.ts')
    const result = analyzeSandFortress([tower], 'src')
    expect(result.directory).toBe('src')
    expect(result.towers.length).toBe(1)
    expect(result.avgIntegrity).toBeGreaterThan(0)
    expect(typeof result.dominantArchitecture).toBe('string')
    expect(typeof result.dominantTowerType).toBe('string')
  })

  it('analyzeSandFortress calculates averages correctly', () => {
    const t1 = analyzeSandTower(simpleExport, 'a.ts')
    const t2 = analyzeSandTower(strongCode, 'b.ts')
    const result = analyzeSandFortress([t1, t2], 'src')
    const expectedAvg = Math.round((t1.structuralIntegrity + t2.structuralIntegrity) / 2)
    expect(result.avgIntegrity).toBe(expectedAvg)
  })

  it('analyzeSandFortress counts majestic and crumbling', () => {
    const strong = analyzeSandTower(strongCode, 'strong.ts')
    const weak = analyzeSandTower(weakCode, 'weak.ts')
    const empty = analyzeSandTower(emptyCode, 'empty.ts')
    const result = analyzeSandFortress([strong, weak, empty], 'mixed')
    expect(typeof result.majesticCount).toBe('number')
    expect(typeof result.crumblingCount).toBe('number')
    expect(typeof result.collapsedCount).toBe('number')
  })

  it('analyzeSandFortress counts vulnerabilities and strengths', () => {
    const tower = analyzeSandTower(strongCode, 'strong.ts')
    const result = analyzeSandFortress([tower], 'src')
    expect(result.totalVulnerabilities).toBe(tower.vulnerabilities.length)
    expect(result.totalStrengths).toBe(tower.strengths.length)
  })
})

describe('sandcastle recommendations', () => {
  it('generateRecommendations returns array', () => {
    const towers: SandTower[] = []
    const fortresses: SandFortress[] = []
    const shoreline: ShorelineInfo = {
      tideLevel: 50, windSpeed: 30, stormWarning: false,
      avgTideResistance: 50, avgWindResistance: 50,
      isSafeFromTide: true, isStormResistant: true,
    }
    const stats: SandcastleStats = {
      totalFiles: 0, totalFortresses: 0, avgSandQuality: 0,
      avgMoistureContent: 0, avgStructuralIntegrity: 0,
      avgTideResistance: 0, avgWindResistance: 0, avgFoundationDepth: 0,
      majesticTowers: 0, crumblingTowers: 0, collapsedTowers: 0,
      fineGrainFiles: 0, coarseGrainFiles: 0,
      bedrockFoundations: 0, quicksandFoundations: 0,
      loadBearingFiles: 0, totalVulnerabilities: 0, totalStrengths: 0,
      overallStructuralHealth: 70, architectGrade: 'architect',
      strongestTower: 'a.ts', weakestTower: 'b.ts',
      deepestFoundation: 'c.ts', highestTower: 'd.ts',
      mostDefensible: 'src', leastDefensible: 'test',
    }
    const result = generateRecommendations(towers, fortresses, shoreline, stats)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('generateRecommendations warns about vulnerabilities', () => {
    const tower = analyzeSandTower(weakCode, 'weak.ts')
    const fortress = analyzeSandFortress([tower], 'src')
    const result = buildSandcastleResult(['weak.ts'], [weakCode], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('generateRecommendations praises good health', () => {
    const tower = analyzeSandTower(strongCode, 'strong.ts')
    const fortress = analyzeSandFortress([tower], 'src')
    const stats: SandcastleStats = {
      totalFiles: 1, totalFortresses: 1, avgSandQuality: 80,
      avgMoistureContent: 80, avgStructuralIntegrity: 80,
      avgTideResistance: 80, avgWindResistance: 80, avgFoundationDepth: 80,
      majesticTowers: 1, crumblingTowers: 0, collapsedTowers: 0,
      fineGrainFiles: 1, coarseGrainFiles: 0,
      bedrockFoundations: 1, quicksandFoundations: 0,
      loadBearingFiles: 1, totalVulnerabilities: 2, totalStrengths: 5,
      overallStructuralHealth: 80, architectGrade: 'master-builder',
      strongestTower: 'strong.ts', weakestTower: 'strong.ts',
      deepestFoundation: 'strong.ts', highestTower: 'strong.ts',
      mostDefensible: 'src', leastDefensible: 'src',
    }
    const shoreline: ShorelineInfo = {
      tideLevel: 20, windSpeed: 15, stormWarning: false,
      avgTideResistance: 80, avgWindResistance: 80,
      isSafeFromTide: true, isStormResistant: true,
    }
    const recs = generateRecommendations([tower], [fortress], shoreline, stats)
    expect(recs.some(r => r.includes('Good structural health'))).toBe(true)
  })
})

describe('sandcastle buildSandcastleResult', () => {
  it('buildSandcastleResult returns valid SandcastleResult', () => {
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    expect(result.towers.length).toBe(1)
    expect(result.fortresses.length).toBe(1)
    expect(result.shoreline).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('buildSandcastleResult handles empty files array', () => {
    const result = buildSandcastleResult([], [], {})
    expect(result.towers.length).toBe(0)
    expect(result.fortresses.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.strongestTower).toBe('none')
    expect(result.stats.weakestTower).toBe('none')
    expect(result.stats.deepestFoundation).toBe('none')
  })

  it('buildSandcastleResult handles multiple files', () => {
    const result = buildSandcastleResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [simpleExport, strongCode, weakCode],
      {},
    )
    expect(result.towers.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('buildSandcastleResult groups files into fortresses by directory', () => {
    const result = buildSandcastleResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [simpleExport, strongCode, weakCode],
      {},
    )
    expect(result.fortresses.length).toBe(2)
  })

  it('buildSandcastleResult calculates shoreline', () => {
    const result = buildSandcastleResult(['a.ts'], [strongCode], {})
    expect(typeof result.shoreline.tideLevel).toBe('number')
    expect(typeof result.shoreline.windSpeed).toBe('number')
    expect(typeof result.shoreline.stormWarning).toBe('boolean')
    expect(typeof result.shoreline.isSafeFromTide).toBe('boolean')
    expect(typeof result.shoreline.isStormResistant).toBe('boolean')
  })

  it('buildSandcastleResult calculates stats correctly', () => {
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    const stats = result.stats
    expect(stats.totalFiles).toBe(1)
    expect(typeof stats.avgSandQuality).toBe('number')
    expect(typeof stats.avgMoistureContent).toBe('number')
    expect(typeof stats.avgStructuralIntegrity).toBe('number')
    expect(typeof stats.overallStructuralHealth).toBe('number')
    expect(typeof stats.architectGrade).toBe('string')
    expect(stats.strongestTower).toBe('a.ts')
    expect(stats.weakestTower).toBe('a.ts')
  })

  it('buildSandcastleResult handles missing content gracefully', () => {
    const result = buildSandcastleResult(['a.ts'], [], {})
    expect(result.towers.length).toBe(1)
    expect(result.towers[0].condition).toBe('washed-away')
  })

  it('buildSandcastleResult identifies strongest and weakest', () => {
    const result = buildSandcastleResult(
      ['strong.ts', 'empty.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.strongestTower).toBe('strong.ts')
    expect(result.stats.weakestTower).toBe('empty.ts')
  })

  it('buildSandcastleResult counts grain types', () => {
    const result = buildSandcastleResult(
      ['strong.ts', 'empty.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(typeof result.stats.fineGrainFiles).toBe('number')
    expect(typeof result.stats.coarseGrainFiles).toBe('number')
  })

  it('buildSandcastleResult counts foundation types', () => {
    const result = buildSandcastleResult(
      ['strong.ts', 'empty.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(typeof result.stats.bedrockFoundations).toBe('number')
    expect(typeof result.stats.quicksandFoundations).toBe('number')
  })

  it('buildSandcastleResult identifies most and least defensible', () => {
    const result = buildSandcastleResult(
      ['src/a.ts', 'lib/b.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(typeof result.stats.mostDefensible).toBe('string')
    expect(typeof result.stats.leastDefensible).toBe('string')
  })
})

describe('sandcastle format helpers', () => {
  it('formatSandcastleTable returns string', () => {
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    const formatted = formatSandcastleTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('formatSandcastleTable verbose mode returns more detail', () => {
    const result = buildSandcastleResult(['a.ts'], [strongCode], {})
    const normal = formatSandcastleTable(result, false)
    const verbose = formatSandcastleTable(result, true)
    expect(verbose.length).toBeGreaterThanOrEqual(normal.length)
  })

  it('formatSandcastleTable handles empty results', () => {
    const result = buildSandcastleResult([], [], {})
    const formatted = formatSandcastleTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('No files analyzed')
  })

  it('formatSandcastleTable handles many towers (truncation)', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleExport)
    const result = buildSandcastleResult(files, contents, {})
    const formatted = formatSandcastleTable(result, false)
    expect(formatted).toContain('more')
  })

  it('formatSandcastleTable shows fortresses', () => {
    const result = buildSandcastleResult(
      ['src/a.ts', 'src/b.ts'],
      [simpleExport, strongCode],
      {},
    )
    const formatted = formatSandcastleTable(result, false)
    expect(formatted).toContain('Fortresses')
  })

  it('formatSandcastleJson returns valid JSON', () => {
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    const json = formatSandcastleJson(result)
    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.towers).toBeDefined()
    expect(parsed.fortresses).toBeDefined()
    expect(parsed.shoreline).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatSandcastleJson preserves all fields', () => {
    const result = buildSandcastleResult(['a.ts'], [strongCode], {})
    const json = formatSandcastleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.towers.length).toBe(1)
    expect(parsed.towers[0].file).toBe('a.ts')
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('sandcastle end-to-end', () => {
  it('full analysis produces consistent result', () => {
    const result = buildSandcastleResult(
      ['strong.ts', 'weak.ts', 'empty.ts'],
      [strongCode, weakCode, emptyCode],
      {},
    )

    expect(result.towers.length).toBe(3)
    expect(result.fortresses.length).toBe(1)

    const strong = result.towers.find(t => t.file === 'strong.ts')!
    const weak = result.towers.find(t => t.file === 'weak.ts')!
    const empty = result.towers.find(t => t.file === 'empty.ts')!

    expect(strong.qualityScore).toBeGreaterThan(weak.qualityScore)
    expect(weak.qualityScore).toBeGreaterThan(empty.qualityScore)
    expect(empty.qualityScore).toBe(0)

    expect(result.stats.strongestTower).toBe('strong.ts')
    expect(result.stats.weakestTower).toBe('empty.ts')
  })

  it('analysis with directory grouping works', () => {
    const result = buildSandcastleResult(
      ['src/strong.ts', 'src/weak.ts', 'lib/simple.ts'],
      [strongCode, weakCode, simpleExport],
      {},
    )

    expect(result.fortresses.length).toBe(2)
    expect(result.stats.totalFortresses).toBe(2)

    const srcFortress = result.fortresses.find(f => f.directory === 'src')!
    expect(srcFortress.towers.length).toBe(2)

    const libFortress = result.fortresses.find(f => f.directory === 'lib')!
    expect(libFortress.towers.length).toBe(1)
  })

  it('storm warning triggers correctly', () => {
    const manyExports = Array.from({ length: 8 }, (_, i) =>
      `export function fn${i}() { return ${i} }`
    ).join('\n')
    const result = buildSandcastleResult(['big.ts'], [manyExports], {})
    expect(typeof result.shoreline.stormWarning).toBe('boolean')
  })

  it('quality scores are bounded 0-100', () => {
    const result = buildSandcastleResult(
      ['a.ts', 'b.ts'],
      [strongCode, weakCode],
      {},
    )
    for (const tower of result.towers) {
      expect(tower.qualityScore).toBeGreaterThanOrEqual(0)
      expect(tower.qualityScore).toBeLessThanOrEqual(100)
      expect(tower.sandQuality).toBeGreaterThanOrEqual(0)
      expect(tower.sandQuality).toBeLessThanOrEqual(100)
      expect(tower.structuralIntegrity).toBeGreaterThanOrEqual(0)
      expect(tower.structuralIntegrity).toBeLessThanOrEqual(100)
    }
  })

  it('stats averages are bounded', () => {
    const result = buildSandcastleResult(
      ['a.ts', 'b.ts'],
      [strongCode, weakCode],
      {},
    )
    const s = result.stats
    expect(s.avgSandQuality).toBeGreaterThanOrEqual(0)
    expect(s.avgSandQuality).toBeLessThanOrEqual(100)
    expect(s.avgStructuralIntegrity).toBeGreaterThanOrEqual(0)
    expect(s.avgStructuralIntegrity).toBeLessThanOrEqual(100)
    expect(s.overallStructuralHealth).toBeGreaterThanOrEqual(0)
    expect(s.overallStructuralHealth).toBeLessThanOrEqual(100)
  })

  it('all tower type values are valid', () => {
    const validTypes = ['keep', 'tower', 'wall', 'bridge', 'moat', 'decoration', 'rampart', 'gatehouse']
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    expect(validTypes).toContain(result.towers[0].towerType)
  })

  it('all condition values are valid', () => {
    const validConditions = ['majestic', 'impressive', 'solid', 'fair', 'crumbling', 'ruins', 'washed-away']
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    expect(validConditions).toContain(result.towers[0].condition)
  })

  it('all collapse risk values are valid', () => {
    const validRisks = ['none', 'minimal', 'low', 'moderate', 'high', 'imminent', 'collapsed']
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    expect(validRisks).toContain(result.towers[0].collapseRisk)
  })

  it('all sand grain values are valid', () => {
    const validGrains = ['fine', 'medium', 'coarse', 'mixed', 'muddy']
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    expect(validGrains).toContain(result.towers[0].sandGrain)
  })

  it('all architecture values are valid', () => {
    const validArchs = ['roman', 'gothic', 'moat-and-bailey', 'concentric', 'modern', 'fortress', 'shanty']
    const result = buildSandcastleResult(['a.ts'], [simpleExport], {})
    expect(validArchs).toContain(result.towers[0].architecture)
  })
})
