import { describe, it, expect } from 'vitest'
import {
  analyzeStillnessObject,
  analyzeArrangement,
  classifyArrangementType,
  computeStillnessGrade,
  computeArrangementScore,
  generateRecommendations,
  buildStillLifeResult,
  type StillnessObject,
  type StillLifeArrangement,
  type StillLifeStats,
  type StillLifeResult,
} from '../src/commands/still-life-helpers.js'
import { formatStillLifeTable, formatStillLifeJson } from '../src/commands/still-life-format-helpers.js'

// ─── analyzeStillnessObject ──────────────────────────────────────────────────

describe('analyzeStillnessObject', () => {
  it('returns a StillnessObject with all required fields', () => {
    const obj = analyzeStillnessObject('const x = 1', 'test.ts')
    expect(obj).toHaveProperty('file')
    expect(obj).toHaveProperty('stillness')
    expect(obj).toHaveProperty('volatility')
    expect(obj).toHaveProperty('fragility')
    expect(obj).toHaveProperty('composure')
    expect(obj).toHaveProperty('weight')
    expect(obj).toHaveProperty('balance')
    expect(obj).toHaveProperty('position')
    expect(obj).toHaveProperty('objectType')
    expect(obj).toHaveProperty('stability')
    expect(obj).toHaveProperty('lightExposure')
    expect(obj).toHaveProperty('shadowDepth')
    expect(obj).toHaveProperty('surfaceQuality')
    expect(obj).toHaveProperty('composition')
    expect(obj).toHaveProperty('risks')
    expect(obj).toHaveProperty('strengths')
  })

  it('stores the file path', () => {
    const obj = analyzeStillnessObject('const x = 1', 'my-file.ts')
    expect(obj.file).toBe('my-file.ts')
  })

  it('computes weight as lines of code', () => {
    const code = 'line1\nline2\nline3'
    const obj = analyzeStillnessObject(code, 'test.ts')
    expect(obj.weight).toBe(3)
  })

  it('scores stable code with high stillness', () => {
    const code = '/** Docs */\nexport function add(a: number, b: number): number {\n  try {\n    return a + b\n  } catch (e) {\n    return 0\n  }\n}\n'
    const obj = analyzeStillnessObject(code, 'stable.ts')
    expect(obj.stillness).toBeGreaterThan(40)
    expect(obj.strengths.length).toBeGreaterThan(0)
  })

  it('scores volatile code with high volatility', () => {
    const code = 'async function run() {\n  if (x) {\n    if (y) {\n      callback(err)\n    }\n  }\n}\n// TODO fix this\n'
    const obj = analyzeStillnessObject(code, 'volatile.ts')
    expect(obj.volatility).toBeGreaterThan(20)
    expect(obj.risks.length).toBeGreaterThan(0)
  })

  it('detects risks in problematic code', () => {
    const code = 'console.log("debug")\nconst x: any = 1\n// TODO: fix'
    const obj = analyzeStillnessObject(code, 'risky.ts')
    expect(obj.risks).toContain('debug-residue')
    expect(obj.risks).toContain('type-unsafe')
    expect(obj.risks).toContain('unfinished-work')
  })

  it('classifies position based on exports and imports', () => {
    const obj = analyzeStillnessObject('export function a() {}\nexport function b() {}\nexport function c() {}\nexport function d() {}', 'index.ts')
    expect(obj.position).toBe('foreground')
  })

  it('classifies files with classes as vessels', () => {
    const obj = analyzeStillnessObject('export class UserService {}', 'service.ts')
    expect(obj.objectType).toBe('vessel')
  })

  it('classifies files with interfaces as books', () => {
    const obj = analyzeStillnessObject('export interface User { name: string }', 'types.ts')
    expect(obj.objectType).toBe('book')
  })

  it('scores empty content correctly', () => {
    const obj = analyzeStillnessObject('', 'empty.ts')
    expect(obj.weight).toBe(0)
    expect(obj.composure).toBe(0)
  })

  it('detects missing error handling as risk', () => {
    const code = Array.from({ length: 30 }, () => 'export function run() { return 1 }').join('\n')
    const obj = analyzeStillnessObject(code, 'noerr.ts')
    expect(obj.risks).toContain('no-error-handling')
  })

  it('classifies test files as highlight position', () => {
    const obj = analyzeStillnessObject("describe('test', () => { it('works', () => { expect(1).toBe(1) }) })", 'foo.test.ts')
    expect(obj.position).toBe('highlight')
  })

  it('detects nested complexity as risk', () => {
    const code = 'if (a) {\n  if (b) {\n    if (c) {\n      return 1\n    }\n  }\n}\n'
    const obj = analyzeStillnessObject(code, 'nested.ts')
    expect(obj.risks).toContain('nested-complexity')
  })
})

// ─── analyzeArrangement ──────────────────────────────────────────────────────

describe('analyzeArrangement', () => {
  const makeObj = (file: string, stillness: number, composure: number, weight = 10): StillnessObject => ({
    file,
    stillness,
    volatility: 50,
    fragility: 30,
    composure,
    weight,
    balance: 50,
    position: 'midground',
    objectType: 'utensil',
    stability: 'balanced',
    lightExposure: 50,
    shadowDepth: 20,
    surfaceQuality: 'smooth',
    composition: { isFocalPoint: false, supportsOthers: composure > 40, isSupported: false, createsBalance: true, isOrnamental: false },
    risks: [],
    strengths: [],
  })

  it('returns a StillLifeArrangement with all required fields', () => {
    const arr = analyzeArrangement([makeObj('a.ts', 50, 50)], 'src')
    expect(arr).toHaveProperty('directory')
    expect(arr).toHaveProperty('objects')
    expect(arr).toHaveProperty('arrangementType')
    expect(arr).toHaveProperty('overallStillness')
    expect(arr).toHaveProperty('overallBalance')
    expect(arr).toHaveProperty('overallComposure')
    expect(arr).toHaveProperty('focalPoint')
    expect(arr).toHaveProperty('supportingFiles')
    expect(arr).toHaveProperty('backgroundFiles')
    expect(arr).toHaveProperty('isBalanced')
    expect(arr).toHaveProperty('hasTension')
    expect(arr).toHaveProperty('tensionPoints')
    expect(arr).toHaveProperty('cohesion')
    expect(arr).toHaveProperty('lightBalance')
    expect(arr).toHaveProperty('health')
  })

  it('handles empty objects', () => {
    const arr = analyzeArrangement([], 'empty')
    expect(arr.arrangementType).toBe('empty')
    expect(arr.overallStillness).toBe(0)
  })

  it('computes average stillness', () => {
    const arr = analyzeArrangement([makeObj('a.ts', 60, 50), makeObj('b.ts', 80, 50)], 'src')
    expect(arr.overallStillness).toBe(70)
  })

  it('identifies focal point', () => {
    const arr = analyzeArrangement([makeObj('a.ts', 50, 30), makeObj('b.ts', 50, 80, 50)], 'src')
    expect(arr.focalPoint).toBe('b.ts')
  })

  it('detects tension from precarious objects', () => {
    const precarious: StillnessObject = { ...makeObj('p.ts', 10, 10), stability: 'precarious' }
    const arr = analyzeArrangement([precarious], 'src')
    expect(arr.hasTension).toBe(true)
    expect(arr.tensionPoints).toContain('p.ts')
  })

  it('stores directory path', () => {
    const arr = analyzeArrangement([makeObj('a.ts', 50, 50)], 'my/dir')
    expect(arr.directory).toBe('my/dir')
  })
})

// ─── classifyArrangementType ─────────────────────────────────────────────────

describe('classifyArrangementType', () => {
  it('returns empty for no objects', () => {
    expect(classifyArrangementType([])).toBe('empty')
  })

  it('returns minimalist for single object', () => {
    const obj: StillnessObject = { file: 'a.ts', stillness: 50, volatility: 30, fragility: 20, composure: 60, weight: 10, balance: 50, position: 'midground', objectType: 'utensil', stability: 'balanced', lightExposure: 50, shadowDepth: 20, surfaceQuality: 'smooth', composition: { isFocalPoint: false, supportsOthers: false, isSupported: false, createsBalance: true, isOrnamental: false }, risks: [], strengths: [] }
    expect(classifyArrangementType([obj])).toBe('minimalist')
  })

  it('returns cluttered for many objects', () => {
    const objs = Array.from({ length: 25 }, (_, i) => ({
      file: `f${i}.ts`, stillness: 50, volatility: 30, fragility: 20, composure: 50,
      weight: 10, balance: 50, position: 'midground', objectType: 'utensil',
      stability: 'balanced', lightExposure: 50, shadowDepth: 20, surfaceQuality: 'smooth',
      composition: { isFocalPoint: false, supportsOthers: false, isSupported: false, createsBalance: true, isOrnamental: false },
      risks: [], strengths: [],
    }))
    expect(classifyArrangementType(objs)).toBe('cluttered')
  })
})

// ─── computeStillnessGrade ───────────────────────────────────────────────────

describe('computeStillnessGrade', () => {
  it('returns rock for high stillness', () => {
    expect(computeStillnessGrade(85)).toBe('rock')
  })

  it('returns stone for good stillness', () => {
    expect(computeStillnessGrade(65)).toBe('stone')
  })

  it('returns wood for moderate stillness', () => {
    expect(computeStillnessGrade(45)).toBe('wood')
  })

  it('returns water for low stillness', () => {
    expect(computeStillnessGrade(30)).toBe('water')
  })

  it('returns wind for very low stillness', () => {
    expect(computeStillnessGrade(15)).toBe('wind')
  })

  it('returns sand for zero stillness', () => {
    expect(computeStillnessGrade(0)).toBe('sand')
  })
})

// ─── computeArrangementScore ─────────────────────────────────────────────────

describe('computeArrangementScore', () => {
  it('returns 0 for empty arrangements', () => {
    expect(computeArrangementScore([])).toBe(0)
  })

  it('computes score from arrangement metrics', () => {
    const arr: StillLifeArrangement = {
      directory: 'src', objects: [], arrangementType: 'minimalist',
      overallStillness: 60, overallBalance: 70, overallComposure: 50,
      focalPoint: 'a.ts', supportingFiles: [], backgroundFiles: [],
      isBalanced: true, hasTension: false, tensionPoints: [],
      cohesion: 80, lightBalance: 60, health: 'pleasant',
    }
    const score = computeArrangementScore([arr])
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: StillLifeStats = {
    totalFiles: 5, totalArrangements: 1,
    avgStillness: 60, avgVolatility: 30, avgFragility: 25, avgComposure: 55, avgBalance: 55,
    anchoredFiles: 3, precariousFiles: 1, shatteredFiles: 0,
    focalPoints: 1, isOverallBalanced: true, overallStillness: 60, overallComposure: 55,
    dominantPosition: 'midground', dominantObjectType: 'utensil',
    lightBalance: 60, stillnessGrade: 'stone', arrangementScore: 60,
    masterworkArrangements: 0, chaoticArrangements: 0,
    bestArrangement: 'src', worstArrangement: 'src',
  }

  it('recommends maintaining for healthy codebase', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs).toContain('Still life is well-composed and balanced - maintain current practices')
  })

  it('warns about shattered files', () => {
    const stats = { ...baseStats, shatteredFiles: 2 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('shattered'))).toBe(true)
  })

  it('warns about high volatility', () => {
    const stats = { ...baseStats, avgVolatility: 70 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('volatility'))).toBe(true)
  })

  it('warns about high fragility', () => {
    const stats = { ...baseStats, avgFragility: 60 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Fragile'))).toBe(true)
  })

  it('warns about tension in arrangements', () => {
    const tenseArr: StillLifeArrangement = {
      directory: 'src', objects: [], arrangementType: 'modern',
      overallStillness: 30, overallBalance: 20, overallComposure: 20,
      focalPoint: 'a.ts', supportingFiles: [], backgroundFiles: [],
      isBalanced: false, hasTension: true, tensionPoints: ['x.ts'],
      cohesion: 30, lightBalance: 40, health: 'disjointed',
    }
    const recs = generateRecommendations([], [tenseArr], baseStats)
    expect(recs.some(r => r.includes('tension'))).toBe(true)
  })

  it('warns about unbalanced light', () => {
    const stats = { ...baseStats, lightBalance: 30 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('light'))).toBe(true)
  })
})

// ─── buildStillLifeResult ────────────────────────────────────────────────────

describe('buildStillLifeResult', () => {
  it('returns a StillLifeResult with all required fields', () => {
    const result = buildStillLifeResult(['test.ts'], ['const x = 1'], {})
    expect(result).toHaveProperty('objects')
    expect(result).toHaveProperty('arrangements')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one object per file', () => {
    const result = buildStillLifeResult(['a.ts', 'b.ts', 'c.ts'], ['1', '2', '3'], {})
    expect(result.objects).toHaveLength(3)
  })

  it('groups objects into arrangements by directory', () => {
    const result = buildStillLifeResult(['src/a.ts', 'test/b.ts'], ['1', '2'], {})
    expect(result.arrangements).toHaveLength(2)
  })

  it('computes comprehensive stats', () => {
    const result = buildStillLifeResult(['a.ts'], ['export function x() {}'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.stillnessGrade).toBeDefined()
    expect(result.stats.arrangementScore).toBeGreaterThanOrEqual(0)
  })

  it('handles empty input', () => {
    const result = buildStillLifeResult([], [], {})
    expect(result.objects).toEqual([])
    expect(result.arrangements).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('identifies best and worst arrangements', () => {
    const result = buildStillLifeResult(
      ['good/a.ts', 'bad/b.ts'],
      ['/** doc */\nexport function good() { try { return 1 } catch { return 0 } }',
       '// TODO fix\nconsole.log("debug")\nconst x: any = 1'],
      {},
    )
    expect(result.stats.bestArrangement).toBeDefined()
    expect(result.stats.worstArrangement).toBeDefined()
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  const result: StillLifeResult = {
    objects: [{
      file: 'test.ts', stillness: 70, volatility: 30, fragility: 20, composure: 60,
      weight: 10, balance: 65, position: 'midground', objectType: 'utensil',
      stability: 'resting', lightExposure: 50, shadowDepth: 20, surfaceQuality: 'smooth',
      composition: { isFocalPoint: true, supportsOthers: false, isSupported: false, createsBalance: true, isOrnamental: false },
      risks: [], strengths: ['documented'],
    }],
    arrangements: [{
      directory: 'src', objects: [], arrangementType: 'minimalist',
      overallStillness: 70, overallBalance: 65, overallComposure: 60,
      focalPoint: 'test.ts', supportingFiles: [], backgroundFiles: [],
      isBalanced: true, hasTension: false, tensionPoints: [],
      cohesion: 80, lightBalance: 70, health: 'pleasant',
    }],
    stats: {
      totalFiles: 1, totalArrangements: 1,
      avgStillness: 70, avgVolatility: 30, avgFragility: 20, avgComposure: 60, avgBalance: 65,
      anchoredFiles: 1, precariousFiles: 0, shatteredFiles: 0,
      focalPoints: 1, isOverallBalanced: true, overallStillness: 70, overallComposure: 60,
      dominantPosition: 'midground', dominantObjectType: 'utensil',
      lightBalance: 70, stillnessGrade: 'stone', arrangementScore: 66,
      masterworkArrangements: 0, chaoticArrangements: 0,
      bestArrangement: 'src', worstArrangement: 'src',
    },
    recommendations: ['Still life is well-composed and balanced - maintain current practices'],
  }

  it('formatStillLifeTable returns a string', () => {
    const output = formatStillLifeTable(result, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('formatStillLifeTable includes file names', () => {
    const output = formatStillLifeTable(result, false)
    expect(output).toContain('test.ts')
  })

  it('formatStillLifeTable verbose shows more detail', () => {
    const terse = formatStillLifeTable(result, false)
    const verbose = formatStillLifeTable(result, true)
    expect(verbose.length).toBeGreaterThanOrEqual(terse.length)
  })

  it('formatStillLifeJson returns valid JSON', () => {
    const output = formatStillLifeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.objects).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('formatStillLifeTable shows recommendations', () => {
    const output = formatStillLifeTable(result, false)
    expect(output).toContain('Recommendations')
  })

  it('formatStillLifeTable handles empty objects', () => {
    const empty: StillLifeResult = {
      objects: [], arrangements: [],
      stats: {
        totalFiles: 0, totalArrangements: 0,
        avgStillness: 0, avgVolatility: 0, avgFragility: 0, avgComposure: 0, avgBalance: 0,
        anchoredFiles: 0, precariousFiles: 0, shatteredFiles: 0,
        focalPoints: 0, isOverallBalanced: false, overallStillness: 0, overallComposure: 0,
        dominantPosition: 'midground', dominantObjectType: 'utensil',
        lightBalance: 0, stillnessGrade: 'sand', arrangementScore: 0,
        masterworkArrangements: 0, chaoticArrangements: 0,
        bestArrangement: 'none', worstArrangement: 'none',
      },
      recommendations: ['Still life is well-composed and balanced - maintain current practices'],
    }
    const output = formatStillLifeTable(empty, false)
    expect(output).toContain('No objects found')
  })
})

// ─── additional coverage ────────────────────────────────────────────────────

describe('additional coverage', () => {
  it('classifyArrangementType returns classical for high stillness with all positions', () => {
    const objs: StillnessObject[] = [
      { file: 'a.ts', stillness: 80, volatility: 10, fragility: 10, composure: 80, weight: 50, balance: 80, position: 'foreground', objectType: 'vessel', stability: 'anchored', lightExposure: 80, shadowDepth: 10, surfaceQuality: 'polished', composition: { isFocalPoint: false, supportsOthers: true, isSupported: false, createsBalance: true, isOrnamental: false }, risks: [], strengths: [] },
      { file: 'b.ts', stillness: 70, volatility: 15, fragility: 15, composure: 70, weight: 30, balance: 70, position: 'midground', objectType: 'flower', stability: 'resting', lightExposure: 60, shadowDepth: 15, surfaceQuality: 'smooth', composition: { isFocalPoint: false, supportsOthers: false, isSupported: true, createsBalance: true, isOrnamental: false }, risks: [], strengths: [] },
      { file: 'c.ts', stillness: 65, volatility: 20, fragility: 20, composure: 60, weight: 20, balance: 60, position: 'background', objectType: 'utensil', stability: 'balanced', lightExposure: 40, shadowDepth: 20, surfaceQuality: 'textured', composition: { isFocalPoint: false, supportsOthers: false, isSupported: false, createsBalance: true, isOrnamental: false }, risks: [], strengths: [] },
    ]
    expect(classifyArrangementType(objs)).toBe('classical')
  })

  it('classifyArrangementType returns chaotic for low stillness', () => {
    const objs: StillnessObject[] = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`, stillness: 10, volatility: 80, fragility: 70, composure: 10,
      weight: 10, balance: 10, position: 'midground', objectType: 'utensil',
      stability: 'falling', lightExposure: 10, shadowDepth: 80, surfaceQuality: 'broken',
      composition: { isFocalPoint: false, supportsOthers: false, isSupported: false, createsBalance: false, isOrnamental: false },
      risks: ['unfinished-work'], strengths: [],
    }))
    expect(classifyArrangementType(objs)).toBe('chaotic')
  })

  it('classifyArrangementType returns baroque for many objects with good stillness', () => {
    const objs: StillnessObject[] = Array.from({ length: 7 }, (_, i) => ({
      file: `f${i}.ts`, stillness: 60, volatility: 30, fragility: 25, composure: 55,
      weight: 20, balance: 55, position: 'midground', objectType: 'utensil',
      stability: 'balanced', lightExposure: 50, shadowDepth: 25, surfaceQuality: 'smooth',
      composition: { isFocalPoint: false, supportsOthers: false, isSupported: false, createsBalance: true, isOrnamental: false },
      risks: [], strengths: [],
    }))
    expect(classifyArrangementType(objs)).toBe('baroque')
  })

  it('analyzeStillnessObject classifies config files as candles', () => {
    const obj = analyzeStillnessObject('export const config = { port: 3000 }', 'config/settings.ts')
    expect(obj.objectType).toBe('candle')
  })

  it('analyzeStillnessObject classifies files with many functions as flowers', () => {
    const code = 'export function a() {}\nexport function b() {}\nexport function c() {}\nexport function d() {}\n'
    const obj = analyzeStillnessObject(code, 'helpers.ts')
    expect(obj.objectType).toBe('flower')
  })

  it('analyzeStillnessObject classifies small function files as fruit', () => {
    const obj = analyzeStillnessObject('export function util() { return 1 }', 'util.ts')
    expect(obj.objectType).toBe('fruit')
  })

  it('analyzeStillnessObject classifies large files as fabric', () => {
    const code = Array.from({ length: 120 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const obj = analyzeStillnessObject(code, 'big.ts')
    expect(obj.objectType).toBe('fabric')
  })

  it('computeStillnessGrade covers all boundaries', () => {
    expect(computeStillnessGrade(80)).toBe('rock')
    expect(computeStillnessGrade(79)).toBe('stone')
    expect(computeStillnessGrade(60)).toBe('stone')
    expect(computeStillnessGrade(59)).toBe('wood')
    expect(computeStillnessGrade(40)).toBe('wood')
    expect(computeStillnessGrade(39)).toBe('water')
    expect(computeStillnessGrade(25)).toBe('water')
    expect(computeStillnessGrade(24)).toBe('wind')
    expect(computeStillnessGrade(10)).toBe('wind')
    expect(computeStillnessGrade(9)).toBe('sand')
  })

  it('generateRecommendations warns about precarious files', () => {
    const stats: StillLifeStats = {
      totalFiles: 5, totalArrangements: 1,
      avgStillness: 40, avgVolatility: 40, avgFragility: 40, avgComposure: 40, avgBalance: 40,
      anchoredFiles: 1, precariousFiles: 3, shatteredFiles: 0,
      focalPoints: 1, isOverallBalanced: true, overallStillness: 40, overallComposure: 40,
      dominantPosition: 'midground', dominantObjectType: 'utensil',
      lightBalance: 50, stillnessGrade: 'wood', arrangementScore: 40,
      masterworkArrangements: 0, chaoticArrangements: 0,
      bestArrangement: 'src', worstArrangement: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('precarious'))).toBe(true)
  })

  it('generateRecommendations warns about chaotic vs masterwork', () => {
    const stats: StillLifeStats = {
      totalFiles: 5, totalArrangements: 2,
      avgStillness: 30, avgVolatility: 50, avgFragility: 50, avgComposure: 30, avgBalance: 30,
      anchoredFiles: 1, precariousFiles: 0, shatteredFiles: 0,
      focalPoints: 1, isOverallBalanced: false, overallStillness: 30, overallComposure: 30,
      dominantPosition: 'midground', dominantObjectType: 'utensil',
      lightBalance: 50, stillnessGrade: 'water', arrangementScore: 30,
      masterworkArrangements: 0, chaoticArrangements: 2,
      bestArrangement: 'a', worstArrangement: 'b',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('chaotic'))).toBe(true)
  })

  it('buildStillLifeResult handles multiple directories', () => {
    const result = buildStillLifeResult(
      ['src/ui/a.ts', 'src/ui/b.ts', 'src/core/c.ts'],
      ['export const a = 1', 'export const b = 2', 'export function c() {}'],
      {},
    )
    expect(result.arrangements.length).toBe(2)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('analyzeArrangement marks focal point on the object', () => {
    const objs = [
      { file: 'a.ts', stillness: 50, volatility: 30, fragility: 20, composure: 30, weight: 10, balance: 50, position: 'midground', objectType: 'utensil', stability: 'balanced', lightExposure: 50, shadowDepth: 20, surfaceQuality: 'smooth', composition: { isFocalPoint: false, supportsOthers: false, isSupported: false, createsBalance: true, isOrnamental: false }, risks: [], strengths: [] },
      { file: 'b.ts', stillness: 60, volatility: 20, fragility: 15, composure: 70, weight: 40, balance: 60, position: 'foreground', objectType: 'vessel', stability: 'anchored', lightExposure: 60, shadowDepth: 15, surfaceQuality: 'polished', composition: { isFocalPoint: false, supportsOthers: true, isSupported: false, createsBalance: true, isOrnamental: false }, risks: [], strengths: [] },
    ]
    const arr = analyzeArrangement(objs as StillnessObject[], 'src')
    expect(arr.focalPoint).toBe('b.ts')
    expect(objs[1].composition.isFocalPoint).toBe(true)
  })

  it('analyzeStillnessObject detects tested files as strength', () => {
    const code = "describe('suite', () => {\n  it('works', () => {\n    expect(1).toBe(1)\n  })\n})\n"
    const obj = analyzeStillnessObject(code, 'app.test.ts')
    expect(obj.strengths).toContain('tested')
  })

  it('analyzeStillnessObject detects error-aware as strength', () => {
    const code = 'export function run() {\n  try {\n    return doWork()\n  } catch (e) {\n    return null\n  }\n}\n'
    const obj = analyzeStillnessObject(code, 'safe.ts')
    expect(obj.strengths).toContain('error-aware')
  })

  it('computeArrangementScore averages across multiple arrangements', () => {
    const arr1: StillLifeArrangement = {
      directory: 'a', objects: [], arrangementType: 'minimalist',
      overallStillness: 80, overallBalance: 80, overallComposure: 80,
      focalPoint: 'x', supportingFiles: [], backgroundFiles: [],
      isBalanced: true, hasTension: false, tensionPoints: [],
      cohesion: 80, lightBalance: 80, health: 'masterwork',
    }
    const arr2: StillLifeArrangement = {
      directory: 'b', objects: [], arrangementType: 'modern',
      overallStillness: 40, overallBalance: 40, overallComposure: 40,
      focalPoint: 'y', supportingFiles: [], backgroundFiles: [],
      isBalanced: false, hasTension: false, tensionPoints: [],
      cohesion: 40, lightBalance: 40, health: 'mediocre',
    }
    const score = computeArrangementScore([arr1, arr2])
    expect(score).toBe(60)
  })

  it('generateRecommendations warns about low stillness', () => {
    const stats: StillLifeStats = {
      totalFiles: 5, totalArrangements: 1,
      avgStillness: 20, avgVolatility: 50, avgFragility: 40, avgComposure: 30, avgBalance: 25,
      anchoredFiles: 0, precariousFiles: 0, shatteredFiles: 0,
      focalPoints: 1, isOverallBalanced: false, overallStillness: 20, overallComposure: 30,
      dominantPosition: 'midground', dominantObjectType: 'utensil',
      lightBalance: 50, stillnessGrade: 'wind', arrangementScore: 25,
      masterworkArrangements: 0, chaoticArrangements: 0,
      bestArrangement: 'src', worstArrangement: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('low stillness'))).toBe(true)
  })

  it('analyzeStillnessObject assigns position based on imports only', () => {
    const code = "import { x } from './a'\nimport { y } from './b'\nimport { z } from './c'\n"
    const obj = analyzeStillnessObject(code, 'consumer.ts')
    expect(obj.position).toBe('background')
  })
})
