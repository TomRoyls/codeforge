import { describe, it, expect } from 'vitest'
import {
  identifyLayer,
  analyzeLayerContent,
  analyzeBoundary,
  analyzeStrataColumn,
  computeGeologicalScore,
  classifyStabilityGrade,
  generateRecommendations,
  buildFrescoLayerResult,
  type StrataLayer,
  type LayerBoundary,
  type StrataColumn,
  type FrescoLayerStats,
  type FrescoLayerResult,
} from '../src/commands/fresco-layer-helpers.js'
import { formatFrescoLayerTable, formatFrescoLayerJson } from '../src/commands/fresco-layer-format-helpers.js'

// ─── identifyLayer ──────────────────────────────────────────────────────────

describe('identifyLayer', () => {
  it('classifies UI paths as presentation', () => {
    expect(identifyLayer('src/ui/Button.tsx', 'export default Button')).toBe('presentation')
  })

  it('classifies component paths as presentation', () => {
    expect(identifyLayer('src/components/Header.tsx', 'export const Header')).toBe('presentation')
  })

  it('classifies page paths as presentation', () => {
    expect(identifyLayer('src/pages/Home.tsx', 'export default Home')).toBe('presentation')
  })

  it('classifies controller paths as presentation', () => {
    expect(identifyLayer('src/controllers/UserController.ts', 'export class UserController')).toBe('presentation')
  })

  it('classifies service paths as business-logic', () => {
    expect(identifyLayer('src/services/UserService.ts', 'export class UserService')).toBe('business-logic')
  })

  it('classifies domain paths as business-logic', () => {
    expect(identifyLayer('src/domain/User.ts', 'export interface User')).toBe('business-logic')
  })

  it('classifies data paths as data-access', () => {
    expect(identifyLayer('src/data/UserRepository.ts', 'export class UserRepository')).toBe('data-access')
  })

  it('classifies repository paths as data-access', () => {
    expect(identifyLayer('src/repositories/UserRepo.ts', 'export class UserRepo')).toBe('data-access')
  })

  it('classifies util paths as infrastructure', () => {
    expect(identifyLayer('src/utils/helpers.ts', 'export function helper()')).toBe('infrastructure')
  })

  it('classifies core paths as infrastructure', () => {
    expect(identifyLayer('src/core/engine.ts', 'export class Engine')).toBe('infrastructure')
  })

  it('uses content heuristics when path is ambiguous', () => {
    expect(identifyLayer('src/misc.ts', 'document.getElementById("app")')).toBe('presentation')
  })

  it('detects database content as data-access', () => {
    expect(identifyLayer('src/misc.ts', 'SELECT * FROM users')).toBe('data-access')
  })

  it('defaults to infrastructure for unknown paths', () => {
    expect(identifyLayer('src/foo.ts', '')).toBe('infrastructure')
  })

  it('classifies route paths as presentation', () => {
    expect(identifyLayer('src/routes/api.ts', 'export default router')).toBe('presentation')
  })

  it('classifies config paths as infrastructure', () => {
    expect(identifyLayer('src/config/settings.ts', 'export const config')).toBe('infrastructure')
  })
})

// ─── analyzeLayerContent ────────────────────────────────────────────────────

describe('analyzeLayerContent', () => {
  it('returns a StrataLayer with all required fields', () => {
    const layer = analyzeLayerContent(['test.ts'], ['export function foo() {}'], 'infrastructure')
    expect(layer).toHaveProperty('layerId')
    expect(layer).toHaveProperty('layerName')
    expect(layer).toHaveProperty('depth')
    expect(layer).toHaveProperty('avgQuality')
    expect(layer).toHaveProperty('density')
    expect(layer).toHaveProperty('porosity')
    expect(layer).toHaveProperty('permeability')
    expect(layer).toHaveProperty('classification')
    expect(layer).toHaveProperty('stability')
    expect(layer).toHaveProperty('age')
    expect(layer).toHaveProperty('thickness')
    expect(layer).toHaveProperty('files')
    expect(layer).toHaveProperty('bondedTo')
    expect(layer).toHaveProperty('contaminated')
    expect(layer).toHaveProperty('contaminants')
    expect(layer).toHaveProperty('fossils')
    expect(layer).toHaveProperty('minerals')
  })

  it('assigns depth 0 to presentation', () => {
    const layer = analyzeLayerContent(['ui.ts'], ['export const x = 1'], 'presentation')
    expect(layer.depth).toBe(0)
  })

  it('assigns depth 1 to business-logic', () => {
    const layer = analyzeLayerContent(['svc.ts'], ['export function run()'], 'business-logic')
    expect(layer.depth).toBe(1)
  })

  it('assigns depth 2 to data-access', () => {
    const layer = analyzeLayerContent(['repo.ts'], ['export function find()'], 'data-access')
    expect(layer.depth).toBe(2)
  })

  it('assigns depth 3 to infrastructure', () => {
    const layer = analyzeLayerContent(['util.ts'], ['export function util()'], 'infrastructure')
    expect(layer.depth).toBe(3)
  })

  it('computes density as lines per file', () => {
    const content = 'line1\nline2\nline3\nline4\nline5'
    const layer = analyzeLayerContent(['a.ts'], [content], 'infrastructure')
    expect(layer.density).toBe(5)
  })

  it('detects fossils from deprecated comments', () => {
    const content = '// deprecated: remove this\n// unused code\nexport function old() {}'
    const layer = analyzeLayerContent(['old.ts'], [content], 'infrastructure')
    expect(layer.fossils.length).toBeGreaterThan(0)
  })

  it('detects minerals from interfaces', () => {
    const content = 'export interface User { name: string }\nexport function getUser(): User'
    const layer = analyzeLayerContent(['types.ts'], [content], 'infrastructure')
    expect(layer.minerals.length).toBeGreaterThan(0)
  })

  it('detects contamination in presentation layer with DB code', () => {
    const content = 'export function render() { SELECT * FROM users }'
    const layer = analyzeLayerContent(['ui.ts'], [content], 'presentation')
    expect(layer.contaminated).toBe(true)
    expect(layer.contaminants).toContain('database-access')
  })

  it('sets thickness to file count', () => {
    const layer = analyzeLayerContent(['a.ts', 'b.ts'], ['code1', 'code2'], 'infrastructure')
    expect(layer.thickness).toBe(2)
  })

  it('computes quality based on exports, functions, comments', () => {
    const good = 'export function a() {}\nexport function b() {}\n/** doc */\nexport interface I {}'
    const bad = 'const x = 1'
    const goodLayer = analyzeLayerContent(['good.ts'], [good], 'infrastructure')
    const badLayer = analyzeLayerContent(['bad.ts'], [bad], 'infrastructure')
    expect(goodLayer.avgQuality).toBeGreaterThan(badLayer.avgQuality)
  })

  it('classifies age based on size and debt', () => {
    const small = 'export function x() {}'
    const layer = analyzeLayerContent(['tiny.ts'], [small], 'infrastructure')
    expect(layer.age).toBe('new')
  })
})

// ─── analyzeBoundary ────────────────────────────────────────────────────────

describe('analyzeBoundary', () => {
  const makeLayer = (name: string, depth: number, files: string[] = [], contaminated = false, contaminants: string[] = []): StrataLayer => ({
    layerId: `${name}-${depth}`,
    layerName: name,
    depth,
    files,
    avgQuality: 50,
    density: 50,
    porosity: 20,
    permeability: 10,
    bondedTo: [],
    contaminated,
    contaminants,
    fossils: [],
    minerals: [],
    age: 'recent',
    stability: 'stable',
    thickness: files.length,
    classification: 'limestone',
  })

  it('returns a LayerBoundary with all required fields', () => {
    const upper = makeLayer('presentation', 0)
    const lower = makeLayer('business-logic', 1)
    const boundary = analyzeBoundary(upper, lower, [], [])
    expect(boundary).toHaveProperty('upperLayer')
    expect(boundary).toHaveProperty('lowerLayer')
    expect(boundary).toHaveProperty('boundaryType')
    expect(boundary).toHaveProperty('crossContaminations')
    expect(boundary).toHaveProperty('dependencies')
    expect(boundary).toHaveProperty('couplingScore')
    expect(boundary).toHaveProperty('hasGuard')
    expect(boundary).toHaveProperty('description')
  })

  it('sets upper and lower layer names', () => {
    const upper = makeLayer('presentation', 0)
    const lower = makeLayer('business-logic', 1)
    const boundary = analyzeBoundary(upper, lower, [], [])
    expect(boundary.upperLayer).toBe('presentation')
    expect(boundary.lowerLayer).toBe('business-logic')
  })

  it('detects contamination in boundary', () => {
    const upper = makeLayer('presentation', 0, [], true, ['database-access'])
    const lower = makeLayer('data-access', 2)
    const boundary = analyzeBoundary(upper, lower, [], [])
    expect(boundary.crossContaminations).toBeGreaterThan(0)
  })

  it('sets boundary type to missing when no connection', () => {
    const upper = makeLayer('presentation', 0)
    const lower = makeLayer('business-logic', 1)
    const boundary = analyzeBoundary(upper, lower, [], [])
    expect(boundary.boundaryType).toBe('missing')
  })

  it('detects guard from interface keyword', () => {
    const upper = makeLayer('presentation', 0, ['ui.ts'])
    const lower = makeLayer('business-logic', 1)
    const boundary = analyzeBoundary(upper, lower, ['ui.ts'], ['interface IUser {}'])
    expect(boundary.hasGuard).toBe(true)
  })

  it('generates a description', () => {
    const upper = makeLayer('presentation', 0)
    const lower = makeLayer('business-logic', 1)
    const boundary = analyzeBoundary(upper, lower, [], [])
    expect(boundary.description.length).toBeGreaterThan(0)
  })
})

// ─── analyzeStrataColumn ────────────────────────────────────────────────────

describe('analyzeStrataColumn', () => {
  it('returns a StrataColumn with all required fields', () => {
    const col = analyzeStrataColumn('src', ['src/util.ts'], ['export function x() {}'])
    expect(col).toHaveProperty('directory')
    expect(col).toHaveProperty('layers')
    expect(col).toHaveProperty('boundaries')
    expect(col).toHaveProperty('totalDepth')
    expect(col).toHaveProperty('avgQuality')
    expect(col).toHaveProperty('structuralIntegrity')
    expect(col).toHaveProperty('hasInversions')
    expect(col).toHaveProperty('inversionCount')
    expect(col).toHaveProperty('erosionRisk')
    expect(col).toHaveProperty('isHealthy')
    expect(col).toHaveProperty('healthGrade')
    expect(col).toHaveProperty('dominantRock')
    expect(col).toHaveProperty('geologicalAge')
    expect(col).toHaveProperty('recommendations')
  })

  it('groups files into layers', () => {
    const col = analyzeStrataColumn(
      'src',
      ['src/ui/Button.tsx', 'src/services/UserService.ts'],
      ['export const btn = () => {}', 'export class UserService {}'],
    )
    expect(col.layers.length).toBeGreaterThanOrEqual(2)
  })

  it('computes health grade', () => {
    const col = analyzeStrataColumn('src', ['src/util.ts'], ['export function x() {}'])
    expect(['A', 'B', 'C', 'D', 'F']).toContain(col.healthGrade)
  })

  it('detects directory as provided', () => {
    const col = analyzeStrataColumn('my/dir', ['my/dir/a.ts'], ['code'])
    expect(col.directory).toBe('my/dir')
  })

  it('sets bondedTo between adjacent layers', () => {
    const col = analyzeStrataColumn(
      'src',
      ['src/ui/a.ts', 'src/services/b.ts'],
      ['export const a = 1', 'export function b() {}'],
    )
    for (const layer of col.layers) {
      if (col.layers.length > 1) {
        expect(layer.bondedTo.length).toBeGreaterThan(0)
      }
    }
  })

  it('generates recommendations for unhealthy columns', () => {
    const col = analyzeStrataColumn('src', [], [])
    expect(col.recommendations).toBeDefined()
  })
})

// ─── computeGeologicalScore ─────────────────────────────────────────────────

describe('computeGeologicalScore', () => {
  it('returns 0 for empty layers', () => {
    expect(computeGeologicalScore([], [], [])).toBe(0)
  })

  it('returns higher score for clean layers', () => {
    const goodLayer: StrataLayer = {
      layerId: 'infrastructure-3', layerName: 'infrastructure', depth: 3,
      files: ['a.ts'], avgQuality: 80, density: 50, porosity: 5, permeability: 5,
      bondedTo: [], contaminated: false, contaminants: [], fossils: [], minerals: [],
      age: 'mature', stability: 'bedrock', thickness: 1, classification: 'granite',
    }
    const goodBoundary: LayerBoundary = {
      upperLayer: 'business-logic', lowerLayer: 'infrastructure',
      boundaryType: 'clean', crossContaminations: 0, dependencies: 2,
      couplingScore: 10, hasGuard: true, description: 'Well-separated',
    }
    const goodColumn: StrataColumn = {
      directory: 'src', layers: [goodLayer], boundaries: [goodBoundary],
      totalDepth: 1, avgQuality: 80, structuralIntegrity: 85,
      hasInversions: false, inversionCount: 0, erosionRisk: 10,
      isHealthy: true, healthGrade: 'A', dominantRock: 'granite',
      geologicalAge: 'established', recommendations: [],
    }
    const score = computeGeologicalScore([goodLayer], [goodBoundary], [goodColumn])
    expect(score).toBeGreaterThan(50)
  })

  it('penalizes contaminated layers', () => {
    const clean: StrataLayer = {
      layerId: 'pres-0', layerName: 'presentation', depth: 0,
      files: [], avgQuality: 60, density: 50, porosity: 20, permeability: 10,
      bondedTo: [], contaminated: false, contaminants: [], fossils: [], minerals: [],
      age: 'recent', stability: 'stable', thickness: 1, classification: 'limestone',
    }
    const dirty: StrataLayer = { ...clean, contaminated: true, contaminants: ['db'] }
    const s1 = computeGeologicalScore([clean], [], [])
    const s2 = computeGeologicalScore([dirty], [], [])
    expect(s1).toBeGreaterThan(s2)
  })

  it('penalizes inversions', () => {
    const layer: StrataLayer = {
      layerId: 'pres-0', layerName: 'presentation', depth: 0,
      files: [], avgQuality: 60, density: 50, porosity: 20, permeability: 10,
      bondedTo: [], contaminated: false, contaminants: [], fossils: [], minerals: [],
      age: 'recent', stability: 'stable', thickness: 1, classification: 'limestone',
    }
    const cleanCol: StrataColumn = {
      directory: 'src', layers: [layer], boundaries: [], totalDepth: 1,
      avgQuality: 60, structuralIntegrity: 60, hasInversions: false,
      inversionCount: 0, erosionRisk: 20, isHealthy: true, healthGrade: 'B',
      dominantRock: 'limestone', geologicalAge: 'nascent', recommendations: [],
    }
    const invCol: StrataColumn = { ...cleanCol, hasInversions: true, inversionCount: 1 }
    const s1 = computeGeologicalScore([layer], [], [cleanCol])
    const s2 = computeGeologicalScore([layer], [], [invCol])
    expect(s1).toBeGreaterThan(s2)
  })
})

// ─── classifyStabilityGrade ─────────────────────────────────────────────────

describe('classifyStabilityGrade', () => {
  it('returns rock-solid for high scores', () => {
    expect(classifyStabilityGrade(85)).toBe('rock-solid')
  })

  it('returns stable for good scores', () => {
    expect(classifyStabilityGrade(65)).toBe('stable')
  })

  it('returns settling for moderate scores', () => {
    expect(classifyStabilityGrade(45)).toBe('settling')
  })

  it('returns shifting for low scores', () => {
    expect(classifyStabilityGrade(30)).toBe('shifting')
  })

  it('returns unstable for very low scores', () => {
    expect(classifyStabilityGrade(15)).toBe('unstable')
  })

  it('returns collapsing for zero', () => {
    expect(classifyStabilityGrade(0)).toBe('collapsing')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: FrescoLayerStats = {
    totalFiles: 10, totalLayers: 3, totalBoundaries: 2, totalColumns: 1,
    avgLayerQuality: 60, avgStructuralIntegrity: 60, avgErosionRisk: 20,
    bedrockLayers: 1, unstableLayers: 0, quicksandLayers: 0,
    cleanBoundaries: 2, faultBoundaries: 0, contaminatedLayers: 0,
    totalFossils: 0, totalMinerals: 3, hasInversions: false,
    overallGeologicalScore: 75, stabilityGrade: 'stable',
    mostStableColumn: 'src', leastStableColumn: 'src',
    deepestLayer: 'infrastructure', shallowestLayer: 'presentation',
  }

  it('recommends maintaining practices for healthy codebase', () => {
    const recs = generateRecommendations([], [], [], baseStats)
    expect(recs).toContain('Geological structure is healthy - maintain current practices')
  })

  it('warns about quicksand layers', () => {
    const stats = { ...baseStats, quicksandLayers: 1 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('quicksand'))).toBe(true)
  })

  it('warns about fault boundaries', () => {
    const stats = { ...baseStats, faultBoundaries: 2 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('fault'))).toBe(true)
  })

  it('warns about contaminated layers', () => {
    const stats = { ...baseStats, contaminatedLayers: 1 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('contaminated'))).toBe(true)
  })

  it('warns about fossils', () => {
    const stats = { ...baseStats, totalFossils: 8 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('fossil'))).toBe(true)
  })

  it('warns about inversions', () => {
    const stats = { ...baseStats, hasInversions: true }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('inversion'))).toBe(true)
  })

  it('warns about high erosion risk', () => {
    const stats = { ...baseStats, avgErosionRisk: 70 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('erosion'))).toBe(true)
  })
})

// ─── buildFrescoLayerResult ─────────────────────────────────────────────────

describe('buildFrescoLayerResult', () => {
  it('returns a FrescoLayerResult with all required fields', () => {
    const result = buildFrescoLayerResult(
      ['src/utils/helpers.ts'],
      ['export function helper() { return 1 }'],
      {},
    )
    expect(result).toHaveProperty('layers')
    expect(result).toHaveProperty('boundaries')
    expect(result).toHaveProperty('columns')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('groups files into layers by path', () => {
    const result = buildFrescoLayerResult(
      ['src/ui/App.tsx', 'src/services/UserService.ts'],
      ['export default App', 'export class UserService {}'],
      {},
    )
    expect(result.layers.length).toBeGreaterThanOrEqual(2)
  })

  it('creates boundaries between adjacent layers', () => {
    const result = buildFrescoLayerResult(
      ['src/ui/a.tsx', 'src/services/b.ts'],
      ['export const a = 1', 'export function b() {}'],
      {},
    )
    if (result.layers.length > 1) {
      expect(result.boundaries.length).toBeGreaterThan(0)
    }
  })

  it('creates columns from directories', () => {
    const result = buildFrescoLayerResult(
      ['src/ui/a.ts', 'src/data/b.ts'],
      ['export const a = 1', 'export function b() {}'],
      {},
    )
    expect(result.columns.length).toBeGreaterThan(0)
  })

  it('computes comprehensive stats', () => {
    const result = buildFrescoLayerResult(
      ['src/utils/a.ts'],
      ['export function a() {}'],
      {},
    )
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalLayers).toBeGreaterThan(0)
    expect(result.stats.stabilityGrade).toBeDefined()
    expect(result.stats.overallGeologicalScore).toBeGreaterThanOrEqual(0)
  })

  it('handles empty input', () => {
    const result = buildFrescoLayerResult([], [], {})
    expect(result.layers).toEqual([])
    expect(result.boundaries).toEqual([])
    expect(result.columns).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('handles multiple files in same layer', () => {
    const result = buildFrescoLayerResult(
      ['src/utils/a.ts', 'src/utils/b.ts', 'src/utils/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    const infra = result.layers.find(l => l.layerName === 'infrastructure')
    expect(infra).toBeDefined()
    expect(infra!.thickness).toBe(3)
  })

  it('sets bondedTo for layers', () => {
    const result = buildFrescoLayerResult(
      ['src/ui/a.ts', 'src/services/b.ts', 'src/data/c.ts'],
      ['export const a = 1', 'export function b() {}', 'export function c() {}'],
      {},
    )
    if (result.layers.length > 1) {
      for (const layer of result.layers) {
        if (result.layers.indexOf(layer) > 0 && result.layers.indexOf(layer) < result.layers.length - 1) {
          expect(layer.bondedTo.length).toBeGreaterThanOrEqual(2)
        }
      }
    }
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  const result: FrescoLayerResult = {
    layers: [{
      layerId: 'infrastructure-3', layerName: 'infrastructure', depth: 3,
      files: ['a.ts'], avgQuality: 70, density: 50, porosity: 10, permeability: 5,
      bondedTo: [], contaminated: false, contaminants: [], fossils: [], minerals: [],
      age: 'recent', stability: 'stable', thickness: 1, classification: 'granite',
    }],
    boundaries: [],
    columns: [],
    stats: {
      totalFiles: 1, totalLayers: 1, totalBoundaries: 0, totalColumns: 1,
      avgLayerQuality: 70, avgStructuralIntegrity: 70, avgErosionRisk: 10,
      bedrockLayers: 0, unstableLayers: 0, quicksandLayers: 0,
      cleanBoundaries: 0, faultBoundaries: 0, contaminatedLayers: 0,
      totalFossils: 0, totalMinerals: 0, hasInversions: false,
      overallGeologicalScore: 70, stabilityGrade: 'stable',
      mostStableColumn: 'src', leastStableColumn: 'src',
      deepestLayer: 'infrastructure', shallowestLayer: 'infrastructure',
    },
    recommendations: ['Geological structure is healthy - maintain current practices'],
  }

  it('formatFrescoLayerTable returns a string', () => {
    const output = formatFrescoLayerTable(result, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('formatFrescoLayerTable includes layer names', () => {
    const output = formatFrescoLayerTable(result, false)
    expect(output).toContain('infrastructure')
  })

  it('formatFrescoLayerTable verbose shows more detail', () => {
    const terse = formatFrescoLayerTable(result, false)
    const verbose = formatFrescoLayerTable(result, true)
    expect(verbose.length).toBeGreaterThanOrEqual(terse.length)
  })

  it('formatFrescoLayerJson returns valid JSON', () => {
    const output = formatFrescoLayerJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.layers).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('formatFrescoLayerTable shows recommendations', () => {
    const output = formatFrescoLayerTable(result, false)
    expect(output).toContain('Recommendations')
  })

  it('formatFrescoLayerTable handles empty layers', () => {
    const emptyResult: FrescoLayerResult = {
      layers: [], boundaries: [], columns: [],
      stats: {
        totalFiles: 0, totalLayers: 0, totalBoundaries: 0, totalColumns: 0,
        avgLayerQuality: 0, avgStructuralIntegrity: 0, avgErosionRisk: 0,
        bedrockLayers: 0, unstableLayers: 0, quicksandLayers: 0,
        cleanBoundaries: 0, faultBoundaries: 0, contaminatedLayers: 0,
        totalFossils: 0, totalMinerals: 0, hasInversions: false,
        overallGeologicalScore: 0, stabilityGrade: 'collapsing',
        mostStableColumn: 'none', leastStableColumn: 'none',
        deepestLayer: 'none', shallowestLayer: 'none',
      },
      recommendations: ['Geological structure is healthy - maintain current practices'],
    }
    const output = formatFrescoLayerTable(emptyResult, false)
    expect(output).toContain('No layers detected')
  })
})
