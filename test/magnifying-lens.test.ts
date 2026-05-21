import { describe, expect, it } from 'vitest'
import {
  analyzeFacets,
  analyzeGemDisplay,
  appraiseValue,
  buildMagnifyingLensResult,
  classifyClarityGrade,
  classifyCondition,
  classifyCutGrade,
  classifyColorGrade,
  classifyDisplayGrade,
  classifyGemologistGrade,
  classifyGemType,
  countBranches,
  countConsoleStatements,
  countDeepNesting,
  countDuplicateLines,
  countEmptyCatchBlocks,
  countErrorHandling,
  countMeaningfulLines,
  countTodoMarkers,
  detectInclusions,
  generateRecommendations,
  inspectGemstone,
  measureBrilliance,
  measureCaratWeight,
  measureClarity,
  measureCutAngles,
  measureCutQuality,
  measureFacetPrecision,
  measureHardness,
  measureLightPerformance,
  measureLoupeFindings,
  measureLuster,
  measureNamingQuality,
} from '../src/commands/magnifying-lens-helpers.js'
import type { MagnifyingLensStats } from '../src/commands/magnifying-lens-helpers.js'
import { formatMagnifyingLensJson, formatMagnifyingLensTable } from '../src/commands/magnifying-lens-format-helpers.js'

// ─── Content Analysis Primitives ─────────────────────────────────────────────

describe('countMeaningfulLines', () => {
  it('counts total and meaningful lines', () => {
    const r = countMeaningfulLines('const x = 1\n\n// comment\nconst y = 2')
    expect(r.total).toBe(4)
    expect(r.meaningful).toBe(2)
  })

  it('returns 0 for empty string', () => {
    const r = countMeaningfulLines('')
    expect(r.total).toBe(1)
    expect(r.meaningful).toBe(0)
  })
})

describe('countBranches', () => {
  it('counts if statements', () => {
    expect(countBranches('if (a) {} if (b) {}')).toBe(2)
  })

  it('counts ternary operators', () => {
    expect(countBranches('const x = a ? 1 : 2')).toBe(1)
  })

  it('returns 0 for no branches', () => {
    expect(countBranches('const x = 1')).toBe(0)
  })
})

describe('countErrorHandling', () => {
  it('counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch(e) {} throw new Error()')).toBeGreaterThanOrEqual(3)
  })
})

describe('measureNamingQuality', () => {
  it('returns high for good names', () => {
    const score = measureNamingQuality('const itemCount = names.filter(isValid).length')
    expect(score).toBeGreaterThan(50)
  })

  it('returns lower for short names', () => {
    const good = measureNamingQuality('const itemCount = 5')
    const bad = measureNamingQuality('const x = 5\nconst y = 6\nconst z = 7')
    expect(good).toBeGreaterThanOrEqual(bad)
  })
})

describe('countDuplicateLines', () => {
  it('counts duplicate lines', () => {
    expect(countDuplicateLines('a\na\nb')).toBe(1)
  })

  it('returns 0 for no duplicates', () => {
    expect(countDuplicateLines('a\nb\nc')).toBe(0)
  })
})

describe('countTodoMarkers', () => {
  it('counts TODO and FIXME', () => {
    expect(countTodoMarkers('TODO: fix\nFIXME: broken')).toBe(2)
  })
})

describe('countConsoleStatements', () => {
  it('counts console calls', () => {
    expect(countConsoleStatements('console.log("a")')).toBe(1)
  })
})

describe('countEmptyCatchBlocks', () => {
  it('counts empty catches', () => {
    expect(countEmptyCatchBlocks('try {} catch(e) {}')).toBe(1)
  })
})

describe('countDeepNesting', () => {
  it('counts depth 4+ blocks', () => {
    expect(countDeepNesting('{{{{}}}}')).toBe(1)
  })

  it('returns 0 for shallow code', () => {
    expect(countDeepNesting('{{}}')).toBe(0)
  })
})

// ─── Core Measurements ───────────────────────────────────────────────────────

describe('measureClarity', () => {
  it('returns a number for empty', () => {
    expect(typeof measureClarity('')).toBe('number')
  })

  it('returns score for clean code', () => {
    expect(measureClarity('const itemCount = names.length')).toBeGreaterThan(0)
  })
})

describe('measureBrilliance', () => {
  it('returns a number for empty', () => {
    expect(typeof measureBrilliance('')).toBe('number')
  })

  it('detects modern patterns', () => {
    const score = measureBrilliance('const result = items.filter(x => x > 0).map(x => x * 2)')
    expect(score).toBeGreaterThan(0)
  })
})

describe('measureCutQuality', () => {
  it('returns a number for empty', () => {
    expect(typeof measureCutQuality('')).toBe('number')
  })

  it('detects structure', () => {
    const code = 'import { x } from "y"\nexport function calc(): number { return 1 }'
    expect(measureCutQuality(code)).toBeGreaterThan(0)
  })
})

describe('measureCaratWeight', () => {
  it('returns a number for empty', () => {
    expect(typeof measureCaratWeight('')).toBe('number')
  })

  it('returns 100 for all meaningful', () => {
    expect(measureCaratWeight('const x = 1\nconst y = 2')).toBe(100)
  })
})

describe('measureFacetPrecision', () => {
  it('returns a number for empty', () => {
    expect(typeof measureFacetPrecision('')).toBe('number')
  })

  it('detects null checks', () => {
    const score = measureFacetPrecision('if (x === null) return')
    expect(score).toBeGreaterThan(0)
  })
})

describe('measureHardness', () => {
  it('returns a number for empty', () => {
    expect(typeof measureHardness('')).toBe('number')
  })

  it('detects robustness', () => {
    const score = measureHardness('try { x() } catch(e) { log(e) }')
    expect(score).toBeGreaterThan(0)
  })
})

describe('measureLuster', () => {
  it('returns a number for empty', () => {
    expect(typeof measureLuster('')).toBe('number')
  })

  it('returns score for readable code', () => {
    expect(measureLuster('function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0)\n}')).toBeGreaterThan(0)
  })
})

// ─── Classification Functions ────────────────────────────────────────────────

describe('classifyGemType', () => {
  it('returns diamond for >= 80', () => { expect(classifyGemType(85)).toBe('diamond') })
  it('returns ruby for 70-79', () => { expect(classifyGemType(75)).toBe('ruby') })
  it('returns sapphire for 60-69', () => { expect(classifyGemType(65)).toBe('sapphire') })
  it('returns emerald for 50-59', () => { expect(classifyGemType(55)).toBe('emerald') })
  it('returns topaz for 40-49', () => { expect(classifyGemType(45)).toBe('topaz') })
  it('returns opal for 30-39', () => { expect(classifyGemType(35)).toBe('opal') })
  it('returns quartz for 20-29', () => { expect(classifyGemType(25)).toBe('quartz') })
  it('returns glass for < 20', () => { expect(classifyGemType(10)).toBe('glass') })
})

describe('classifyClarityGrade', () => {
  it('returns FL for 0 issues', () => { expect(classifyClarityGrade(0)).toBe('FL') })
  it('returns IF for 1 issue', () => { expect(classifyClarityGrade(1)).toBe('IF') })
  it('returns VVS1 for 2', () => { expect(classifyClarityGrade(2)).toBe('VVS1') })
  it('returns VVS2 for 3', () => { expect(classifyClarityGrade(3)).toBe('VVS2') })
  it('returns VS1 for 5', () => { expect(classifyClarityGrade(5)).toBe('VS1') })
  it('returns I3 for 23+', () => { expect(classifyClarityGrade(25)).toBe('I3') })
})

describe('classifyCutGrade', () => {
  it('returns ideal for >= 85', () => { expect(classifyCutGrade(90)).toBe('ideal') })
  it('returns excellent for 75-84', () => { expect(classifyCutGrade(80)).toBe('excellent') })
  it('returns poor for < 30', () => { expect(classifyCutGrade(20)).toBe('poor') })
})

describe('classifyColorGrade', () => {
  it('returns D for >= 95', () => { expect(classifyColorGrade(97)).toBe('D') })
  it('returns M for < 24', () => { expect(classifyColorGrade(10)).toBe('M') })
})

describe('classifyGemologistGrade', () => {
  it('returns master-gemologist for >= 75', () => { expect(classifyGemologistGrade(80)).toBe('master-gemologist') })
  it('returns blind for < 15', () => { expect(classifyGemologistGrade(5)).toBe('blind') })
})

describe('classifyDisplayGrade', () => {
  it('returns museum for >= 80', () => { expect(classifyDisplayGrade(85)).toBe('museum') })
  it('returns rubble for < 20', () => { expect(classifyDisplayGrade(10)).toBe('rubble') })
})

describe('classifyCondition', () => {
  it('returns flawless for >= 90', () => { expect(classifyCondition(95)).toBe('flawless') })
  it('returns excellent for 75-89', () => { expect(classifyCondition(80)).toBe('excellent') })
  it('returns shattered for < 10', () => { expect(classifyCondition(5)).toBe('shattered') })
})

// ─── Inclusion Detection ─────────────────────────────────────────────────────

describe('detectInclusions', () => {
  it('returns empty for clean code', () => {
    expect(detectInclusions('const x = 1')).toHaveLength(0)
  })

  it('detects console statements', () => {
    const inclusions = detectInclusions('console.log("debug")')
    expect(inclusions.some(i => i.description.includes('Console'))).toBe(true)
  })

  it('detects var keyword', () => {
    const inclusions = detectInclusions('var x = 1')
    expect(inclusions.some(i => i.description.includes('Var'))).toBe(true)
  })

  it('detects empty catch blocks', () => {
    const inclusions = detectInclusions('try {} catch(e) {}')
    expect(inclusions.some(i => i.description.includes('Empty catch'))).toBe(true)
  })

  it('detects TODO markers', () => {
    const inclusions = detectInclusions('TODO: fix this')
    expect(inclusions.some(i => i.description.includes('TODO'))).toBe(true)
  })

  it('assigns severity levels', () => {
    const inclusions = detectInclusions('try {} catch(e) {}')
    expect(inclusions.every(i => ['minor', 'moderate', 'significant', 'severe'].includes(i.severity))).toBe(true)
  })

  it('assigns visibility levels', () => {
    const inclusions = detectInclusions('console.log("x")')
    expect(inclusions.every(i => ['magnification', 'loupe', 'naked-eye', 'obvious'].includes(i.visible))).toBe(true)
  })
})

// ─── Facet Analysis ──────────────────────────────────────────────────────────

describe('analyzeFacets', () => {
  it('returns zero facets for simple code', () => {
    const f = analyzeFacets('const x = 1')
    expect(f.total).toBe(0)
    expect(f.wellCut).toBe(0)
  })

  it('counts branches', () => {
    const f = analyzeFacets('if (a) { x() } else { y() }')
    expect(f.total).toBeGreaterThan(0)
  })
})

// ─── Loupe Findings ──────────────────────────────────────────────────────────

describe('measureLoupeFindings', () => {
  it('returns all properties', () => {
    const lf = measureLoupeFindings('const x = 1')
    expect(lf).toHaveProperty('surfaceScratches')
    expect(lf).toHaveProperty('internalFractures')
    expect(lf).toHaveProperty('cloudiness')
    expect(lf).toHaveProperty('fluorescence')
    expect(lf).toHaveProperty('phosphorescence')
    expect(lf).toHaveProperty('foreignMaterial')
  })
})

// ─── Cut Angles ──────────────────────────────────────────────────────────────

describe('measureCutAngles', () => {
  it('returns all properties', () => {
    const ca = measureCutAngles('const x = 1')
    expect(ca).toHaveProperty('crown')
    expect(ca).toHaveProperty('pavilion')
    expect(ca).toHaveProperty('girdle')
    expect(ca).toHaveProperty('table')
  })
})

// ─── Light Performance ───────────────────────────────────────────────────────

describe('measureLightPerformance', () => {
  it('returns all properties', () => {
    const lp = measureLightPerformance('const x = 1')
    expect(lp).toHaveProperty('refraction')
    expect(lp).toHaveProperty('reflection')
    expect(lp).toHaveProperty('dispersion')
    expect(lp).toHaveProperty('scintillation')
  })
})

// ─── Appraisal ───────────────────────────────────────────────────────────────

describe('appraiseValue', () => {
  it('returns appraisal with all fields', () => {
    const a = appraiseValue({ clarity: 80, brilliance: 70, cutQuality: 75, qualityScore: 75 })
    expect(typeof a.value).toBe('number')
    expect(typeof a.rarity).toBe('number')
    expect(typeof a.demand).toBe('number')
    expect(typeof a.investmentGrade).toBe('boolean')
  })

  it('marks high quality as investment grade', () => {
    const a = appraiseValue({ clarity: 80, brilliance: 70, cutQuality: 75, qualityScore: 75 })
    expect(a.investmentGrade).toBe(true)
  })

  it('marks low quality as not investment grade', () => {
    const a = appraiseValue({ clarity: 20, brilliance: 20, cutQuality: 20, qualityScore: 20 })
    expect(a.investmentGrade).toBe(false)
  })
})

// ─── inspectGemstone ─────────────────────────────────────────────────────────

describe('inspectGemstone', () => {
  it('returns valid GemstoneInspection', () => {
    const g = inspectGemstone('export function calc() { return 1 }', 'calc.ts')
    expect(g.file).toBe('calc.ts')
    expect(typeof g.clarity).toBe('number')
    expect(typeof g.brilliance).toBe('number')
    expect(typeof g.cutQuality).toBe('number')
    expect(typeof g.caratWeight).toBe('number')
    expect(typeof g.facetPrecision).toBe('number')
    expect(typeof g.hardness).toBe('number')
    expect(typeof g.luster).toBe('number')
    expect(typeof g.qualityScore).toBe('number')
  })

  it('classifies gemType', () => {
    const g = inspectGemstone('', 'empty.ts')
    expect(['diamond', 'ruby', 'sapphire', 'emerald', 'opal', 'topaz', 'quartz', 'glass']).toContain(g.gemType)
  })

  it('populates inclusions', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(Array.isArray(g.inclusions)).toBe(true)
  })

  it('populates facets', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(g.facets).toBeDefined()
    expect(typeof g.facets.total).toBe('number')
  })

  it('populates loupeFindings', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(g.loupeFindings).toBeDefined()
  })

  it('populates cutAngles', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(g.cutAngles).toBeDefined()
  })

  it('populates lightPerformance', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(g.lightPerformance).toBeDefined()
  })

  it('populates appraisal', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(g.appraisal).toBeDefined()
    expect(typeof g.appraisal.investmentGrade).toBe('boolean')
  })

  it('populates clarityGrade, cutGrade, colorGrade', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3']).toContain(g.clarityGrade)
    expect(['ideal', 'excellent', 'very-good', 'good', 'fair', 'poor']).toContain(g.cutGrade)
    expect(g.colorGrade).toMatch(/^[A-M]$/)
  })

  it('populates condition', () => {
    const g = inspectGemstone('const x = 1', 'a.ts')
    expect(['flawless', 'excellent', 'very-good', 'good', 'fair', 'poor', 'damaged', 'shattered']).toContain(g.condition)
  })
})

// ─── analyzeGemDisplay ───────────────────────────────────────────────────────

describe('analyzeGemDisplay', () => {
  it('returns empty display for no gems', () => {
    const d = analyzeGemDisplay([], 'empty')
    expect(d.directory).toBe('empty')
    expect(d.gems).toHaveLength(0)
    expect(d.displayQuality).toBe(0)
    expect(d.displayGrade).toBe('rubble')
  })

  it('computes averages', () => {
    const gems = [
      inspectGemstone('export function a() { return 1 }', 'a.ts'),
      inspectGemstone('export function b() { return 2 }', 'b.ts'),
    ]
    const d = analyzeGemDisplay(gems, 'src')
    expect(d.avgClarity).toBeGreaterThanOrEqual(0)
    expect(d.avgBrilliance).toBeGreaterThanOrEqual(0)
  })

  it('computes dominantGemType', () => {
    const gems = [inspectGemstone('const x = 1', 'a.ts')]
    const d = analyzeGemDisplay(gems, 'src')
    expect(d.dominantGemType).toBeTruthy()
  })

  it('classifies displayGrade', () => {
    const gems = [inspectGemstone('const x = 1', 'a.ts')]
    const d = analyzeGemDisplay(gems, 'src')
    expect(['museum', 'gallery', 'collection', 'display', 'pawn-shop', 'rubble']).toContain(d.displayGrade)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: MagnifyingLensStats = {
    totalFiles: 5, totalDisplays: 1, avgClarity: 50, avgBrilliance: 50,
    avgCutQuality: 50, avgCaratWeight: 50, avgFacetPrecision: 50,
    avgHardness: 50, avgLuster: 50, flawlessGems: 0, excellentGems: 2,
    poorGems: 1, damagedGems: 0, shatteredGems: 0, diamondFiles: 1,
    glassFiles: 0, idealCuts: 1, poorCuts: 0, totalInclusions: 25,
    totalSurfaceScratches: 0, totalInternalFractures: 0, totalCloudiness: 0,
    totalFluorescence: 50, investmentGradeFiles: 3, overallBrilliance: 50,
    gemologistGrade: 'appraiser', finestGem: 'a.ts', worstGem: 'b.ts',
    heaviestGem: 'c.ts', mostBrilliant: 'a.ts',
  }

  it('returns recommendations for high inclusions', () => {
    const recs = generateRecommendations([], [], emptyStats)
    expect(recs.some(r => r.includes('inclusions'))).toBe(true)
  })

  it('returns recommendations for finest gem', () => {
    const recs = generateRecommendations([], [], emptyStats)
    expect(recs.some(r => r.includes('Finest gem'))).toBe(true)
  })

  it('deduplicates recommendations', () => {
    const recs = generateRecommendations([], [], emptyStats)
    const unique = Array.from(new Set(recs))
    expect(recs).toHaveLength(unique.length)
  })
})

// ─── buildMagnifyingLensResult ───────────────────────────────────────────────

describe('buildMagnifyingLensResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildMagnifyingLensResult([], [], {})
    expect(result.gems).toHaveLength(0)
    expect(result.displays).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes a single file', () => {
    const result = buildMagnifyingLensResult(
      ['test.ts'],
      ['export function calc() { return 1 }'],
      {},
    )
    expect(result.gems).toHaveLength(1)
    expect(result.gems[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups by directory', () => {
    const result = buildMagnifyingLensResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['const x = 1', 'const y = 2', 'const z = 3'],
      {},
    )
    expect(result.gems).toHaveLength(3)
    expect(result.displays).toHaveLength(2)
  })

  it('computes stats', () => {
    const result = buildMagnifyingLensResult(['a.ts'], ['const x = 1'], {})
    const s = result.stats
    expect(s.totalFiles).toBe(1)
    expect(typeof s.overallBrilliance).toBe('number')
    expect(typeof s.gemologistGrade).toBe('string')
    expect(s.finestGem).toBe('a.ts')
  })

  it('generates recommendations', () => {
    const result = buildMagnifyingLensResult(['a.ts'], ['const x = 1'], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('uses void options', () => {
    const result = buildMagnifyingLensResult(['a.ts'], ['x'], { foo: 'bar' })
    expect(result.gems).toHaveLength(1)
  })

  it('handles file with no slash as root directory', () => {
    const result = buildMagnifyingLensResult(['simple.ts'], ['const x = 1'], {})
    expect(result.displays.some(d => d.directory === '.')).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('formatMagnifyingLensTable', () => {
  it('returns a string', () => {
    const result = buildMagnifyingLensResult([], [], {})
    expect(typeof formatMagnifyingLensTable(result, false)).toBe('string')
  })

  it('includes header', () => {
    const result = buildMagnifyingLensResult([], [], {})
    expect(formatMagnifyingLensTable(result, false)).toContain('Magnifying Lens')
  })

  it('shows gems when present', () => {
    const result = buildMagnifyingLensResult(['test.ts'], ['const x = 1'], {})
    expect(formatMagnifyingLensTable(result, false)).toContain('test.ts')
  })

  it('verbose output is longer', () => {
    const result = buildMagnifyingLensResult(['test.ts'], ['const x = 1'], {})
    const short = formatMagnifyingLensTable(result, false)
    const detailed = formatMagnifyingLensTable(result, true)
    expect(detailed.length).toBeGreaterThanOrEqual(short.length)
  })
})

describe('formatMagnifyingLensJson', () => {
  it('returns valid JSON', () => {
    const result = buildMagnifyingLensResult(['a.ts'], ['const x = 1'], {})
    expect(() => JSON.parse(formatMagnifyingLensJson(result))).not.toThrow()
  })

  it('contains gems', () => {
    const result = buildMagnifyingLensResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatMagnifyingLensJson(result))
    expect(parsed.gems).toHaveLength(1)
  })
})
