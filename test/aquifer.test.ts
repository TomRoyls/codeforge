import { describe, expect, it } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos, countClosures,
  measureTableDepth, measurePermeability, measureWaterQuality,
  measureRechargeRate, measureSpringQuality, measureFlowRate,
  classifyAquiferType, classifyWaterSource, classifyWaterLevel,
  classifyTableCondition, classifyHydrologistGrade, classifyContaminationLevel,
  classifyLayerWaterTable, classifyLayerCondition,
  detectContamination, detectHiddenRivers, detectSinks, detectSwallows,
  assessWells, assessSprings, analyzeFlow,
  analyzeWaterTable, analyzeAquiferLayer,
  generateAquiferRecommendations, buildAquiferResult,
} from '../src/commands/aquifer-helpers.js'
import { formatAquiferJson, formatAquiferTable } from '../src/commands/aquifer-format-helpers.js'
import type { WaterTable, AquiferStats, BasinInfo } from '../src/commands/aquifer-helpers.js'

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
console.log("test")
// TODO: fix this
// FIXME: broken
// HACK: workaround
function a(b){if(b){if(c){if(d){if(e){if(f){}}}}}}
`

const emptyCode = ''

const simpleExport = 'export function calc(x: number): number { return x * 2 }'

const asyncCode = `import { readFile } from 'node:fs/promises'
export async function readConfig(path: string): Promise<Config> {
  const data: string = await readFile(path, 'utf8')
  return JSON.parse(data) as Config
}
`

const closureCode = `const middleware = (req: Request) => (res: Response) => {
  return handler(req, res)
}`

// ─── Primitives ──────────────────────────────────────────────────────────────

describe('aquifer primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc('const a = 1\nconst b = 2')).toBe(2)
    expect(countLoc(emptyCode)).toBe(0)
  })

  it('countImports counts imports', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
  })

  it('countExports counts exports', () => {
    expect(countExports('export function a() {}')).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts brace depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODOs', () => {
    expect(countTodos('TODO: fix')).toBe(1)
  })

  it('countClosures counts arrow closures', () => {
    expect(countClosures('const fn = () => () => 1')).toBeGreaterThan(0)
  })
})

// ─── Measurements ────────────────────────────────────────────────────────────

describe('aquifer measurements', () => {
  it('measureTableDepth returns 0 for empty', () => {
    expect(measureTableDepth(emptyCode)).toBe(0)
  })

  it('measureTableDepth rewards complex code', () => {
    const result = measureTableDepth(strongCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('measurePermeability returns 0 for empty', () => {
    expect(measurePermeability(emptyCode)).toBe(0)
  })

  it('measurePermeability rewards good code', () => {
    const result = measurePermeability(strongCode)
    expect(result).toBeGreaterThan(30)
  })

  it('measureWaterQuality returns 0 for empty', () => {
    expect(measureWaterQuality(emptyCode)).toBe(0)
  })

  it('measureWaterQuality rewards clean code', () => {
    const result = measureWaterQuality(strongCode)
    expect(result).toBeGreaterThan(40)
  })

  it('measureRechargeRate returns 0 for empty', () => {
    expect(measureRechargeRate(emptyCode)).toBe(0)
  })

  it('measureRechargeRate rewards async code', () => {
    const result = measureRechargeRate(asyncCode)
    expect(result).toBeGreaterThan(30)
  })

  it('measureSpringQuality returns 0 for empty', () => {
    expect(measureSpringQuality(emptyCode)).toBe(0)
  })

  it('measureSpringQuality rewards exports', () => {
    const result = measureSpringQuality(simpleExport)
    expect(result).toBeGreaterThan(40)
  })

  it('measureFlowRate returns 0 for empty', () => {
    expect(measureFlowRate(emptyCode)).toBe(0)
  })

  it('measureFlowRate rewards exports and functions', () => {
    const result = measureFlowRate(strongCode)
    expect(result).toBeGreaterThan(0)
  })

  it('all measurements return 0-100 range', () => {
    const fns = [measureTableDepth, measurePermeability, measureWaterQuality, measureRechargeRate, measureSpringQuality, measureFlowRate]
    for (const fn of fns) {
      const result = fn(strongCode)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    }
  })
})

// ─── Classifications ─────────────────────────────────────────────────────────

describe('aquifer classifications', () => {
  it('classifyAquiferType classifies strong code', () => {
    const result = classifyAquiferType(strongCode)
    expect(['artesian', 'confined', 'unconfined']).toContain(result)
  })

  it('classifyAquiferType returns dry for no imports/exports', () => {
    expect(classifyAquiferType('const x = 1')).toBe('dry')
  })

  it('classifyAquiferType returns perched for exports only', () => {
    expect(classifyAquiferType('export function a() {}')).toBe('perched')
  })

  it('classifyAquiferType returns leaky for imports only', () => {
    expect(classifyAquiferType('import { x } from "y"\nconst z = x')).toBe('leaky')
  })

  it('classifyWaterSource detects river-recharge for fetch', () => {
    expect(classifyWaterSource('const data = fetch(url)')).toBe('river-recharge')
  })

  it('classifyWaterSource detects rainfall for export-only', () => {
    expect(classifyWaterSource('export function calc() {}')).toBe('rainfall')
  })

  it('classifyWaterSource detects fossil for no flow', () => {
    expect(classifyWaterSource('const x = 1')).toBe('fossil')
  })

  it('classifyWaterLevel classifies correctly', () => {
    expect(classifyWaterLevel(90)).toBe('flooded')
    expect(classifyWaterLevel(70)).toBe('high')
    expect(classifyWaterLevel(50)).toBe('normal')
    expect(classifyWaterLevel(25)).toBe('low')
    expect(classifyWaterLevel(10)).toBe('critical')
    expect(classifyWaterLevel(2)).toBe('dry')
  })

  it('classifyTableCondition classifies correctly', () => {
    expect(classifyTableCondition(85)).toBe('artesian-well')
    expect(classifyTableCondition(65)).toBe('clean-spring')
    expect(classifyTableCondition(45)).toBe('deep-aquifer')
    expect(classifyTableCondition(25)).toBe('shallow-well')
    expect(classifyTableCondition(8)).toBe('dry-hole')
    expect(classifyTableCondition(2)).toBe('toxic-dump')
  })

  it('classifyHydrologistGrade classifies correctly', () => {
    expect(classifyHydrologistGrade(80)).toBe('master-hydrologist')
    expect(classifyHydrologistGrade(65)).toBe('hydrologist')
    expect(classifyHydrologistGrade(45)).toBe('geologist')
    expect(classifyHydrologistGrade(30)).toBe('well-digger')
    expect(classifyHydrologistGrade(12)).toBe('dowsing')
    expect(classifyHydrologistGrade(5)).toBe('thirsty')
  })

  it('classifyContaminationLevel classifies correctly', () => {
    expect(classifyContaminationLevel(0)).toBe('pristine')
    expect(classifyContaminationLevel(1)).toBe('clean')
    expect(classifyContaminationLevel(2)).toBe('minor')
    expect(classifyContaminationLevel(5)).toBe('moderate')
    expect(classifyContaminationLevel(8)).toBe('heavy')
    expect(classifyContaminationLevel(15)).toBe('toxic')
  })

  it('classifyLayerWaterTable classifies correctly', () => {
    expect(classifyLayerWaterTable(80)).toBe('flooded')
    expect(classifyLayerWaterTable(60)).toBe('high')
    expect(classifyLayerWaterTable(40)).toBe('normal')
    expect(classifyLayerWaterTable(20)).toBe('low')
    expect(classifyLayerWaterTable(8)).toBe('depleted')
    expect(classifyLayerWaterTable(2)).toBe('dry')
  })

  it('classifyLayerCondition classifies correctly', () => {
    expect(classifyLayerCondition(80)).toBe('mineral-spring')
    expect(classifyLayerCondition(60)).toBe('clean-reservoir')
    expect(classifyLayerCondition(40)).toBe('adequate')
    expect(classifyLayerCondition(20)).toBe('depleted')
    expect(classifyLayerCondition(8)).toBe('contaminated')
    expect(classifyLayerCondition(2)).toBe('desert')
  })
})

// ─── Detection ───────────────────────────────────────────────────────────────

describe('aquifer detection', () => {
  it('detectContamination finds issues in weak code', () => {
    const result = detectContamination(weakCode)
    expect(result.isContaminated).toBe(true)
    expect(result.sources.length).toBeGreaterThan(0)
    expect(result.contaminantCount).toBeGreaterThan(0)
  })

  it('detectContamination returns pristine for clean code', () => {
    const result = detectContamination(simpleExport)
    expect(result.level).toBe('pristine')
  })

  it('detectContamination detects var usage', () => {
    const result = detectContamination('var x = 1')
    expect(result.sources).toContain('var-usage')
  })

  it('detectContamination detects any types', () => {
    const result = detectContamination('const x: any = 1')
    expect(result.sources).toContain('any-types')
  })

  it('detectHiddenRivers detects closures', () => {
    const result = detectHiddenRivers(closureCode)
    expect(result.count).toBeGreaterThan(0)
    expect(result.hasHidden).toBe(true)
  })

  it('detectSinks detects empty catch blocks', () => {
    const result = detectSinks('try {} catch(e) {}')
    expect(result.count).toBeGreaterThan(0)
    expect(result.hasSinks).toBe(true)
  })

  it('detectSwallows detects non-returning functions', () => {
    const result = detectSwallows('function log(x: number) { console.log(x) }')
    expect(result.hasSwallows).toBe(true)
  })
})

// ─── Assessment ──────────────────────────────────────────────────────────────

describe('aquifer assessment', () => {
  it('assessWells returns complete info', () => {
    const result = assessWells(strongCode)
    expect(typeof result.count).toBe('number')
    expect(typeof result.avgDepth).toBe('number')
    expect(typeof result.avgYield).toBe('number')
    expect(typeof result.isOverdrawn).toBe('boolean')
    expect(typeof result.isSustainable).toBe('boolean')
  })

  it('assessWells detects exports in strong code', () => {
    const result = assessWells(strongCode)
    expect(result.count).toBeGreaterThan(0)
  })

  it('assessWells detects dry wells', () => {
    const code = Array.from({ length: 30 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const result = assessWells(code)
    expect(result.hasDryWells).toBe(true)
  })

  it('assessSprings returns complete info', () => {
    const result = assessSprings(strongCode)
    expect(typeof result.count).toBe('number')
    expect(typeof result.avgQuality).toBe('number')
    expect(typeof result.hasMineralContent).toBe('boolean')
    expect(typeof result.hasSediment).toBe('boolean')
    expect(typeof result.isCrystal).toBe('boolean')
  })

  it('assessSprings detects mineral content (many types)', () => {
    const result = assessSprings(strongCode)
    expect(result.hasMineralContent).toBe(true)
  })

  it('analyzeFlow returns complete flow info', () => {
    const result = analyzeFlow(strongCode)
    expect(['inflow', 'outflow', 'through-flow', 'stagnant']).toContain(result.direction)
    expect(typeof result.velocity).toBe('number')
    expect(typeof result.isSteady).toBe('boolean')
    expect(typeof result.isSeasonal).toBe('boolean')
    expect(typeof result.isFlash).toBe('boolean')
    expect(typeof result.hasDrySpells).toBe('boolean')
    expect(typeof result.hasFlooding).toBe('boolean')
  })

  it('analyzeFlow detects through-flow for import+export', () => {
    const result = analyzeFlow(strongCode)
    expect(result.direction).toBe('through-flow')
  })

  it('analyzeFlow detects stagnant for no flow', () => {
    const result = analyzeFlow('const x = 1')
    expect(result.direction).toBe('stagnant')
  })

  it('analyzeFlow detects flooding from console spam', () => {
    const result = analyzeFlow(weakCode)
    expect(result.hasFlooding).toBe(true)
  })
})

// ─── Water Table Analysis ────────────────────────────────────────────────────

describe('aquifer water table', () => {
  it('analyzeWaterTable returns complete WaterTable', () => {
    const result = analyzeWaterTable(strongCode, 'calc.ts')
    expect(result.file).toBe('calc.ts')
    expect(typeof result.tableDepth).toBe('number')
    expect(typeof result.permeability).toBe('number')
    expect(typeof result.waterQuality).toBe('number')
    expect(typeof result.rechargeRate).toBe('number')
    expect(typeof result.springQuality).toBe('number')
    expect(typeof result.flowRate).toBe('number')
    expect(typeof result.qualityScore).toBe('number')
  })

  it('analyzeWaterTable includes all sub-analyses', () => {
    const result = analyzeWaterTable(strongCode, 'calc.ts')
    expect(result.flow).toBeDefined()
    expect(result.contamination).toBeDefined()
    expect(result.wells).toBeDefined()
    expect(result.springs).toBeDefined()
    expect(result.underground).toBeDefined()
  })

  it('analyzeWaterTable classifies aquifer type', () => {
    const result = analyzeWaterTable(strongCode, 'calc.ts')
    expect(['confined', 'unconfined', 'artesian', 'perched', 'leaky', 'dry']).toContain(result.aquiferType)
  })

  it('analyzeWaterTable classifies water level and condition', () => {
    const result = analyzeWaterTable(strongCode, 'calc.ts')
    expect(['flooded', 'high', 'normal', 'low', 'critical', 'dry']).toContain(result.waterLevel)
    expect(['artesian-well', 'clean-spring', 'deep-aquifer', 'shallow-well', 'dry-hole', 'toxic-dump']).toContain(result.condition)
  })

  it('analyzeWaterTable qualityScore is 0-100', () => {
    const result = analyzeWaterTable(strongCode, 'calc.ts')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })

  it('analyzeWaterTable handles empty content', () => {
    const result = analyzeWaterTable(emptyCode, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.tableDepth).toBe(0)
    expect(result.waterQuality).toBe(0)
  })

  it('analyzeWaterTable strong code is higher quality than weak', () => {
    const strong = analyzeWaterTable(strongCode, 'strong.ts')
    const weak = analyzeWaterTable(weakCode, 'weak.ts')
    expect(strong.qualityScore).toBeGreaterThan(weak.qualityScore)
  })
})

// ─── Layer Analysis ──────────────────────────────────────────────────────────

describe('aquifer layer', () => {
  it('analyzeAquiferLayer returns empty layer for no tables', () => {
    const result = analyzeAquiferLayer([], 'src')
    expect(result.directory).toBe('src')
    expect(result.tables).toEqual([])
    expect(result.avgWaterQuality).toBe(0)
    expect(result.condition).toBe('desert')
  })

  it('analyzeAquiferLayer computes averages', () => {
    const tables = [
      analyzeWaterTable(strongCode, 'src/a.ts'),
      analyzeWaterTable(simpleExport, 'src/b.ts'),
    ]
    const result = analyzeAquiferLayer(tables, 'src')
    expect(result.avgWaterQuality).toBeGreaterThan(0)
    expect(result.avgFlowRate).toBeGreaterThanOrEqual(0)
    expect(result.avgPermeability).toBeGreaterThanOrEqual(0)
  })

  it('analyzeAquiferLayer counts categories', () => {
    const tables = [
      analyzeWaterTable(strongCode, 'src/a.ts'),
      analyzeWaterTable(simpleExport, 'src/b.ts'),
    ]
    const result = analyzeAquiferLayer(tables, 'src')
    expect(typeof result.cleanCount).toBe('number')
    expect(typeof result.contaminatedCount).toBe('number')
    expect(typeof result.dryCount).toBe('number')
  })

  it('analyzeAquiferLayer classifies condition', () => {
    const tables = [analyzeWaterTable(strongCode, 'src/a.ts')]
    const result = analyzeAquiferLayer(tables, 'src')
    expect(['mineral-spring', 'clean-reservoir', 'adequate', 'depleted', 'contaminated', 'desert']).toContain(result.condition)
  })

  it('analyzeAquiferLayer layerHealth is 0-100', () => {
    const tables = [analyzeWaterTable(strongCode, 'src/a.ts')]
    const result = analyzeAquiferLayer(tables, 'src')
    expect(result.layerHealth).toBeGreaterThanOrEqual(0)
    expect(result.layerHealth).toBeLessThanOrEqual(100)
  })
})

// ─── Recommendations ─────────────────────────────────────────────────────────

describe('aquifer recommendations', () => {
  it('generateAquiferRecommendations returns array', () => {
    const stats = { toxicCount: 0, hiddenRiverCount: 0, sinkCount: 0, swallowCount: 0, dryWellCount: 0, overdrawnCount: 0, stagnantFlow: 0, totalFiles: 1, overallWaterQuality: 70 } as AquiferStats
    const basin = {} as BasinInfo
    const recs = generateAquiferRecommendations([], [], basin, stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('generateAquiferRecommendations flags toxic files', () => {
    const stats = { toxicCount: 2, hiddenRiverCount: 0, sinkCount: 0, swallowCount: 0, dryWellCount: 0, overdrawnCount: 0, stagnantFlow: 0, totalFiles: 1, overallWaterQuality: 30 } as AquiferStats
    const basin = {} as BasinInfo
    const recs = generateAquiferRecommendations([], [], basin, stats)
    expect(recs.some(r => r.includes('Toxic'))).toBe(true)
  })

  it('generateAquiferRecommendations flags hidden rivers', () => {
    const stats = { toxicCount: 0, hiddenRiverCount: 10, sinkCount: 0, swallowCount: 0, dryWellCount: 0, overdrawnCount: 0, stagnantFlow: 0, totalFiles: 1, overallWaterQuality: 30 } as AquiferStats
    const basin = {} as BasinInfo
    const recs = generateAquiferRecommendations([], [], basin, stats)
    expect(recs.some(r => r.includes('Hidden rivers'))).toBe(true)
  })

  it('generateAquiferRecommendations flags sinks', () => {
    const stats = { toxicCount: 0, hiddenRiverCount: 0, sinkCount: 3, swallowCount: 0, dryWellCount: 0, overdrawnCount: 0, stagnantFlow: 0, totalFiles: 1, overallWaterQuality: 30 } as AquiferStats
    const basin = {} as BasinInfo
    const recs = generateAquiferRecommendations([], [], basin, stats)
    expect(recs.some(r => r.includes('Sinks'))).toBe(true)
  })

  it('generateAquiferRecommendations praises good quality', () => {
    const stats = { toxicCount: 0, hiddenRiverCount: 0, sinkCount: 0, swallowCount: 0, dryWellCount: 0, overdrawnCount: 0, stagnantFlow: 0, totalFiles: 1, overallWaterQuality: 70 } as AquiferStats
    const basin = {} as BasinInfo
    const recs = generateAquiferRecommendations([], [], basin, stats)
    expect(recs.some(r => r.includes('Good water quality'))).toBe(true)
  })
})

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe('aquifer orchestrator', () => {
  it('buildAquiferResult returns complete result', () => {
    const result = buildAquiferResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleExport],
      {},
    )
    expect(result.tables).toHaveLength(2)
    expect(result.layers).toBeDefined()
    expect(result.basin).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('buildAquiferResult handles empty input', () => {
    const result = buildAquiferResult([], [], {})
    expect(result.tables).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('buildAquiferResult computes stats correctly', () => {
    const result = buildAquiferResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgWaterQuality).toBeGreaterThan(0)
  })

  it('buildAquiferResult groups files into layers by directory', () => {
    const result = buildAquiferResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [strongCode, simpleExport, emptyCode],
      {},
    )
    expect(result.layers.length).toBeGreaterThan(0)
  })

  it('buildAquiferResult stats include all fields', () => {
    const result = buildAquiferResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    const s = result.stats
    expect(typeof s.totalFiles).toBe('number')
    expect(typeof s.totalLayers).toBe('number')
    expect(typeof s.avgTableDepth).toBe('number')
    expect(typeof s.avgPermeability).toBe('number')
    expect(typeof s.avgWaterQuality).toBe('number')
    expect(typeof s.avgFlowRate).toBe('number')
    expect(typeof s.avgRechargeRate).toBe('number')
    expect(typeof s.avgSpringQuality).toBe('number')
    expect(typeof s.confinedCount).toBe('number')
    expect(typeof s.artesianCount).toBe('number')
    expect(typeof s.dryCount).toBe('number')
    expect(typeof s.pristineCount).toBe('number')
    expect(typeof s.toxicCount).toBe('number')
    expect(typeof s.steadyFlow).toBe('number')
    expect(typeof s.stagnantFlow).toBe('number')
    expect(typeof s.hiddenRiverCount).toBe('number')
    expect(typeof s.sinkCount).toBe('number')
    expect(typeof s.swallowCount).toBe('number')
    expect(typeof s.dryWellCount).toBe('number')
    expect(typeof s.overdrawnCount).toBe('number')
    expect(typeof s.totalContaminants).toBe('number')
    expect(typeof s.isSustainable).toBe('boolean')
    expect(typeof s.overallWaterQuality).toBe('number')
    expect(['master-hydrologist', 'hydrologist', 'geologist', 'well-digger', 'dowsing', 'thirsty']).toContain(s.hydrologistGrade)
    expect(typeof s.cleanestFile).toBe('string')
    expect(typeof s.dirtiestFile).toBe('string')
    expect(typeof s.deepestFlow).toBe('string')
    expect(typeof s.shallowestFlow).toBe('string')
    expect(typeof s.bestSpring).toBe('string')
    expect(typeof s.worstSink).toBe('string')
  })

  it('buildAquiferResult basin is complete', () => {
    const result = buildAquiferResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    const b = result.basin
    expect(typeof b.totalWaterQuality).toBe('number')
    expect(typeof b.avgFlowRate).toBe('number')
    expect(typeof b.avgPermeability).toBe('number')
    expect(typeof b.totalHiddenRivers).toBe('number')
    expect(typeof b.totalSinks).toBe('number')
    expect(typeof b.totalContamination).toBe('number')
    expect(typeof b.overallHealth).toBe('number')
    expect(typeof b.isSustainable).toBe('boolean')
    expect(typeof b.waterTable).toBe('string')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('aquifer format helpers', () => {
  const sampleResult = buildAquiferResult(
    ['a.ts', 'b.ts'],
    [strongCode, simpleExport],
    {},
  )

  it('formatAquiferTable returns string with header', () => {
    const output = formatAquiferTable(sampleResult, false)
    expect(typeof output).toBe('string')
    expect(output).toContain('Aquifer')
  })

  it('formatAquiferTable includes water tables section', () => {
    const output = formatAquiferTable(sampleResult, false)
    expect(output).toContain('Water Tables')
  })

  it('formatAquiferTable includes basin section', () => {
    const output = formatAquiferTable(sampleResult, false)
    expect(output).toContain('Basin')
  })

  it('formatAquiferTable includes statistics section', () => {
    const output = formatAquiferTable(sampleResult, false)
    expect(output).toContain('Statistics')
  })

  it('formatAquiferTable shows grade', () => {
    const output = formatAquiferTable(sampleResult, false)
    expect(output).toContain('Grade')
  })

  it('formatAquiferTable verbose shows more detail', () => {
    const verbose = formatAquiferTable(sampleResult, true)
    const normal = formatAquiferTable(sampleResult, false)
    expect(verbose.length).toBeGreaterThanOrEqual(normal.length)
  })

  it('formatAquiferTable handles empty results', () => {
    const emptyResult = buildAquiferResult([], [], {})
    const output = formatAquiferTable(emptyResult, false)
    expect(output).toContain('No files analyzed')
  })

  it('formatAquiferTable shows layers when present', () => {
    const result = buildAquiferResult(
      ['src/a.ts', 'src/b.ts'],
      [strongCode, simpleExport],
      {},
    )
    const output = formatAquiferTable(result, false)
    expect(output).toContain('Layers')
  })

  it('formatAquiferJson returns valid JSON', () => {
    const output = formatAquiferJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.tables).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.basin).toBeDefined()
  })

  it('formatAquiferJson handles empty results', () => {
    const emptyResult = buildAquiferResult([], [], {})
    const output = formatAquiferJson(emptyResult)
    const parsed = JSON.parse(output)
    expect(parsed.tables).toHaveLength(0)
  })

  it('formatAquiferTable truncates long lists', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleExport)
    const result = buildAquiferResult(files, contents, {})
    const output = formatAquiferTable(result, false)
    expect(output).toContain('... and')
  })

  it('formatAquiferTable verbose shows all tables', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleExport)
    const result = buildAquiferResult(files, contents, {})
    const output = formatAquiferTable(result, true)
    expect(output).toContain('file19.ts')
  })
})
