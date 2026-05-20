import { describe, it, expect } from 'vitest'
import {
  analyzeMacro,
  analyzeMeso,
  analyzeMicro,
  analyzeNano,
  computeFocalDepth,
  computeClarity,
  computeFocusScore,
  classifyFile,
  computeOverallFocus,
  classifyTelescopeGrade,
  findBestZoom,
  findWorstZoom,
  generateRecommendations,
  buildFocusReport,
  buildTelescopeLensResult,
} from '../src/commands/telescope-lens-helpers.js'
import { formatTelescopeLensTable, formatTelescopeLensJson } from '../src/commands/telescope-lens-format-helpers.js'
import type { ZoomLevel, FocusReport, TelescopeLensStats, FileClassification } from '../src/commands/telescope-lens-helpers.js'

// ─── analyzeMacro ──────────────────────────────────────────────────────────────

describe('analyzeMacro', () => {
  it('returns a ZoomLevel with macro level', () => {
    const result = analyzeMacro(['a.ts'], ['export const x = 1;'])
    expect(result.level).toBe('macro')
  })

  it('has required fields', () => {
    const result = analyzeMacro(['a.ts'], ['export const x = 1;'])
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('visiblePatterns')
    expect(result).toHaveProperty('blurryAreas')
    expect(result).toHaveProperty('findings')
    expect(result).toHaveProperty('description')
  })

  it('detects directory structure', () => {
    const result = analyzeMacro(['src/a.ts', 'src/b.ts', 'lib/c.ts'], ['export const x = 1;', 'export const y = 2;', 'export const z = 3;'])
    expect(result.visiblePatterns.some(p => p.includes('director'))).toBe(true)
  })

  it('detects exports', () => {
    const result = analyzeMacro(['a.ts'], ['export const x = 1; export function f() {}'])
    expect(result.visiblePatterns.some(p => p.includes('exports'))).toBe(true)
  })

  it('flags no exports as blurry', () => {
    const result = analyzeMacro(['a.ts'], ['const x = 1; const y = 2;'])
    expect(result.blurryAreas.some(b => b.includes('No exports'))).toBe(true)
  })

  it('detects entry points', () => {
    const result = analyzeMacro(['index.ts'], ['export const x = 1;'])
    expect(result.visiblePatterns.some(p => p.includes('Entry point'))).toBe(true)
  })

  it('flags large codebase', () => {
    const files = Array(60).fill('a.ts').map((f, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1;')
    const result = analyzeMacro(files, contents)
    expect(result.blurryAreas.some(b => b.includes('Large codebase'))).toBe(true)
  })

  it('clamps clarity to 0-100', () => {
    const result = analyzeMacro(['a.ts'], ['export const x = 1;'])
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
  })

  it('flags large avg file size', () => {
    const bigContent = Array(400).fill('const x = 1;').join('\n')
    const result = analyzeMacro(['a.ts'], [bigContent])
    expect(result.findings.some(f => f.description.includes('Average file size'))).toBe(true)
  })
})

// ─── analyzeMeso ───────────────────────────────────────────────────────────────

describe('analyzeMeso', () => {
  it('returns a ZoomLevel with meso level', () => {
    const result = analyzeMeso('export function hello() {}', 'a.ts')
    expect(result.level).toBe('meso')
  })

  it('detects exports', () => {
    const result = analyzeMeso('export const x = 1; export function f() {}', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('export'))).toBe(true)
  })

  it('detects functions', () => {
    const result = analyzeMeso('function foo() {} function bar() {}', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('function'))).toBe(true)
  })

  it('detects classes', () => {
    const result = analyzeMeso('class Service {}', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('class'))).toBe(true)
  })

  it('detects interfaces', () => {
    const result = analyzeMeso('interface Config { name: string }', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('interface'))).toBe(true)
  })

  it('detects imports', () => {
    const result = analyzeMeso('import { x } from "y"', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('import'))).toBe(true)
  })

  it('flags large files', () => {
    const bigContent = Array(350).fill('const x = 1;').join('\n')
    const result = analyzeMeso(bigContent, 'big.ts')
    expect(result.findings.some(f => f.description.includes('lines'))).toBe(true)
  })

  it('flags internal-only modules', () => {
    const result = analyzeMeso('function foo() {} function bar() {}', 'a.ts')
    expect(result.blurryAreas.some(b => b.includes('internal'))).toBe(true)
  })

  it('flags high import count', () => {
    const imports = Array(12).fill(0).map((_, i) => `import { m${i} } from "mod${i}"`).join('\n')
    const result = analyzeMeso(imports, 'a.ts')
    expect(result.findings.some(f => f.description.includes('imports'))).toBe(true)
  })

  it('detects JSDoc', () => {
    const result = analyzeMeso('/** Docs */\nexport function f() {}', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('JSDoc'))).toBe(true)
  })

  it('clamps clarity to 0-100', () => {
    const result = analyzeMeso('const x = 1;', 'a.ts')
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeMicro ──────────────────────────────────────────────────────────────

describe('analyzeMicro', () => {
  it('returns a ZoomLevel with micro level', () => {
    const result = analyzeMicro('function f() {}', 'a.ts')
    expect(result.level).toBe('micro')
  })

  it('detects functions', () => {
    const result = analyzeMicro('function foo() {} function bar() {}', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('function'))).toBe(true)
  })

  it('detects error handling', () => {
    const result = analyzeMicro('try { work() } catch(e) { throw e }', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('Error handling'))).toBe(true)
  })

  it('detects async patterns', () => {
    const result = analyzeMicro('async function load() { await fetch(url) }', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('Async'))).toBe(true)
  })

  it('flags deep nesting', () => {
    const nested = 'function f() {' + '{'.repeat(6) + '}'.repeat(6) + '}'
    const result = analyzeMicro(nested, 'a.ts')
    expect(result.blurryAreas.some(b => b.includes('nesting'))).toBe(true)
  })

  it('flags async without error handling as critical', () => {
    const result = analyzeMicro('async function load() { await fetch(url) }', 'a.ts')
    const critical = result.findings.find(f => f.severity === 'critical')
    expect(critical).toBeDefined()
    expect(critical!.description).toContain('Async')
  })

  it('flags many functions', () => {
    const fns = Array(12).fill(0).map((_, i) => `function fn${i}() {}`).join('\n')
    const result = analyzeMicro(fns, 'a.ts')
    expect(result.blurryAreas.some(b => b.includes('Many functions'))).toBe(true)
  })

  it('detects clean control flow', () => {
    const result = analyzeMicro('function f() { return 1; }', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('Clean'))).toBe(true)
  })

  it('detects robust error propagation', () => {
    const result = analyzeMicro('try { work() } catch(e) { throw new Error(e) }', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('Robust'))).toBe(true)
  })
})

// ─── analyzeNano ───────────────────────────────────────────────────────────────

describe('analyzeNano', () => {
  it('returns a ZoomLevel with nano level', () => {
    const result = analyzeNano('const x = 1;', 'a.ts')
    expect(result.level).toBe('nano')
  })

  it('detects type annotations', () => {
    const result = analyzeNano('const x: number = 1; const y: string = "hi";', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('type annotation'))).toBe(true)
  })

  it('detects comments', () => {
    const result = analyzeNano('// A comment\nconst x = 1;', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('comment'))).toBe(true)
  })

  it('flags missing types', () => {
    const result = analyzeNano('const x = 1;', 'a.ts')
    expect(result.blurryAreas.some(b => b.includes('type annotations'))).toBe(true)
  })

  it('flags missing comments', () => {
    const result = analyzeNano('const x = 1;', 'a.ts')
    expect(result.blurryAreas.some(b => b.includes('comments'))).toBe(true)
  })

  it('flags long lines', () => {
    const longLine = 'const x = ' + 'a'.repeat(130) + ';'
    const result = analyzeNano(longLine, 'a.ts')
    expect(result.blurryAreas.some(b => b.includes('Long'))).toBe(true)
  })

  it('rewards short readable lines', () => {
    const result = analyzeNano('const x = 1;\nconst y = 2;', 'a.ts')
    expect(result.visiblePatterns.some(p => p.includes('readable'))).toBe(true)
  })

  it('detects trailing whitespace', () => {
    const result = analyzeNano('const x = 1;   ', 'a.ts')
    expect(result.findings.some(f => f.description.includes('whitespace'))).toBe(true)
  })

  it('flags many long lines', () => {
    const lines = Array(8).fill(0).map((_, i) => 'const x' + i + ' = ' + 'a'.repeat(130) + ';')
    const result = analyzeNano(lines.join('\n'), 'a.ts')
    expect(result.findings.some(f => f.description.includes('120 characters'))).toBe(true)
  })

  it('clamps clarity to 0-100', () => {
    const result = analyzeNano('const x = 1;', 'a.ts')
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── computeClarity ────────────────────────────────────────────────────────────

describe('computeClarity', () => {
  it('returns 50 for empty array', () => {
    expect(computeClarity([])).toBe(50)
  })

  it('computes average clarity', () => {
    const levels: ZoomLevel[] = [
      { level: 'macro', description: '', clarity: 80, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'meso', description: '', clarity: 60, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'micro', description: '', clarity: 70, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'nano', description: '', clarity: 50, visiblePatterns: [], blurryAreas: [], findings: [] },
    ]
    expect(computeClarity(levels)).toBe(65)
  })

  it('returns 100 for all perfect', () => {
    const levels: ZoomLevel[] = [
      { level: 'macro', description: '', clarity: 100, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'meso', description: '', clarity: 100, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'micro', description: '', clarity: 100, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'nano', description: '', clarity: 100, visiblePatterns: [], blurryAreas: [], findings: [] },
    ]
    expect(computeClarity(levels)).toBe(100)
  })
})

// ─── computeFocusScore ─────────────────────────────────────────────────────────

describe('computeFocusScore', () => {
  it('returns clarity minus depth penalty', () => {
    expect(computeFocusScore(80, 2)).toBe(70)
  })

  it('returns full clarity for depth 1', () => {
    expect(computeFocusScore(80, 1)).toBe(80)
  })

  it('returns 0 for very low scores', () => {
    expect(computeFocusScore(10, 4)).toBe(0)
  })

  it('clamps to 100', () => {
    expect(computeFocusScore(100, 1)).toBe(100)
  })
})

// ─── classifyFile ──────────────────────────────────────────────────────────────

describe('classifyFile', () => {
  it('returns crystal for high clarity and focus', () => {
    expect(classifyFile(90, 85)).toBe('crystal')
  })

  it('returns focused for good scores', () => {
    expect(classifyFile(70, 60)).toBe('focused')
  })

  it('returns multi-focal for moderate', () => {
    expect(classifyFile(50, 40)).toBe('multi-focal')
  })

  it('returns blurry for low', () => {
    expect(classifyFile(30, 20)).toBe('blurry')
  })

  it('returns opaque for very low', () => {
    expect(classifyFile(10, 5)).toBe('opaque')
  })

  it('requires both clarity and focus for crystal', () => {
    expect(classifyFile(90, 50)).toBe('multi-focal')
    expect(classifyFile(90, 75)).toBe('crystal')
  })
})

// ─── computeOverallFocus ───────────────────────────────────────────────────────

describe('computeOverallFocus', () => {
  it('returns 50 for empty reports', () => {
    expect(computeOverallFocus([])).toBe(50)
  })

  it('computes average focus score', () => {
    const reports = [
      { focalDepth: { focusScore: 80 } } as FocusReport,
      { focalDepth: { focusScore: 60 } } as FocusReport,
    ]
    expect(computeOverallFocus(reports)).toBe(70)
  })

  it('clamps to 0-100', () => {
    const reports = [{ focalDepth: { focusScore: 100 } } as FocusReport]
    expect(computeOverallFocus(reports)).toBe(100)
  })
})

// ─── classifyTelescopeGrade ────────────────────────────────────────────────────

describe('classifyTelescopeGrade', () => {
  it('returns hubble for excellent scores', () => {
    expect(classifyTelescopeGrade(85, 85)).toBe('hubble')
  })

  it('returns observatory for good scores', () => {
    expect(classifyTelescopeGrade(70, 70)).toBe('observatory')
  })

  it('returns binoculars for moderate', () => {
    expect(classifyTelescopeGrade(50, 50)).toBe('binoculars')
  })

  it('returns magnifying-glass for low', () => {
    expect(classifyTelescopeGrade(30, 30)).toBe('magnifying-glass')
  })

  it('returns naked-eye for very low', () => {
    expect(classifyTelescopeGrade(10, 10)).toBe('naked-eye')
  })

  it('uses average of focus and clarity', () => {
    expect(classifyTelescopeGrade(80, 70)).toBe('observatory')
  })
})

// ─── findBestZoom / findWorstZoom ──────────────────────────────────────────────

describe('findBestZoom', () => {
  it('returns macro for empty', () => {
    expect(findBestZoom([])).toBe('macro')
  })

  it('returns level with highest clarity', () => {
    const levels: ZoomLevel[] = [
      { level: 'macro', description: '', clarity: 60, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'meso', description: '', clarity: 80, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'micro', description: '', clarity: 70, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'nano', description: '', clarity: 50, visiblePatterns: [], blurryAreas: [], findings: [] },
    ]
    expect(findBestZoom(levels)).toBe('meso')
  })
})

describe('findWorstZoom', () => {
  it('returns nano for empty', () => {
    expect(findWorstZoom([])).toBe('nano')
  })

  it('returns level with lowest clarity', () => {
    const levels: ZoomLevel[] = [
      { level: 'macro', description: '', clarity: 60, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'meso', description: '', clarity: 80, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'micro', description: '', clarity: 40, visiblePatterns: [], blurryAreas: [], findings: [] },
      { level: 'nano', description: '', clarity: 70, visiblePatterns: [], blurryAreas: [], findings: [] },
    ]
    expect(findWorstZoom(levels)).toBe('micro')
  })
})

// ─── computeFocalDepth ─────────────────────────────────────────────────────────

describe('computeFocalDepth', () => {
  const makeLevel = (clarity: number, findings: { severity: string }[] = []): ZoomLevel => ({
    level: 'macro', description: '', clarity, visiblePatterns: [], blurryAreas: [],
    findings: findings as ZoomLevel['findings'],
  })

  it('returns depth 4 for critical findings', () => {
    const fd = computeFocalDepth('a.ts',
      makeLevel(90),
      makeLevel(90),
      makeLevel(90, [{ severity: 'critical' } as any]),
      makeLevel(90),
    )
    expect(fd.depthRequired).toBe(4)
  })

  it('classifies based on clarity and focus', () => {
    const fd = computeFocalDepth('a.ts',
      makeLevel(90), makeLevel(90), makeLevel(90), makeLevel(90),
    )
    expect(['crystal', 'focused', 'multi-focal', 'blurry', 'opaque']).toContain(fd.classification)
  })

  it('has required fields', () => {
    const fd = computeFocalDepth('a.ts',
      makeLevel(50), makeLevel(50), makeLevel(50), makeLevel(50),
    )
    expect(fd).toHaveProperty('file', 'a.ts')
    expect(fd).toHaveProperty('depthRequired')
    expect(fd).toHaveProperty('macroView')
    expect(fd).toHaveProperty('mesoView')
    expect(fd).toHaveProperty('microView')
    expect(fd).toHaveProperty('nanoView')
    expect(fd).toHaveProperty('clarity')
    expect(fd).toHaveProperty('focusScore')
    expect(fd).toHaveProperty('classification')
  })

  it('shows Clear when no blurry areas', () => {
    const fd = computeFocalDepth('a.ts',
      makeLevel(90), makeLevel(90), makeLevel(90), makeLevel(90),
    )
    expect(fd.macroView).toBe('Clear')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<TelescopeLensStats> = {}): TelescopeLensStats => ({
    totalReports: 1, avgClarity: 50, avgDepthRequired: 2, avgFocusScore: 50,
    crystalFiles: 0, opaqueFiles: 0, macroClarity: 50, mesoClarity: 50,
    microClarity: 50, nanoClarity: 50, findingsPerLevel: {}, criticalFindings: 0,
    bestOverallLevel: 'meso', worstOverallLevel: 'nano', overallFocus: 50,
    telescopeGrade: 'binoculars',
    ...overrides,
  })

  it('recommends refactoring opaque files', () => {
    const reports = [{
      focalDepth: { classification: 'opaque' as FileClassification },
    } as FocusReport]
    const recs = generateRecommendations(reports, [], makeStats())
    expect(recs.some(r => r.includes('opaque'))).toBe(true)
  })

  it('recommends simplifying for high depth', () => {
    const recs = generateRecommendations([], [], makeStats({ avgDepthRequired: 4 }))
    expect(recs.some(r => r.includes('focal depth'))).toBe(true)
  })

  it('recommends type annotations for low nano clarity', () => {
    const recs = generateRecommendations([], [], makeStats({ nanoClarity: 30 }))
    expect(recs.some(r => r.includes('nano'))).toBe(true)
  })

  it('recommends addressing critical findings', () => {
    const recs = generateRecommendations([], [], makeStats({ criticalFindings: 3 }))
    expect(recs.some(r => r.includes('critical'))).toBe(true)
  })

  it('recommends refactoring for low focus', () => {
    const recs = generateRecommendations([], [], makeStats({ overallFocus: 30 }))
    expect(recs.some(r => r.includes('refactoring'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generateRecommendations([], [], makeStats())
    expect(Array.from(new Set(recs))).toHaveLength(recs.length)
  })

  it('flags blurry levels', () => {
    const recs = generateRecommendations([], [], makeStats({ macroClarity: 30, nanoClarity: 20 }))
    expect(recs.some(r => r.includes('Blurry'))).toBe(true)
  })
})

// ─── buildFocusReport ──────────────────────────────────────────────────────────

describe('buildFocusReport', () => {
  it('returns a complete FocusReport', () => {
    const macro = analyzeMacro(['a.ts'], ['export const x = 1;'])
    const report = buildFocusReport('export const x = 1;', 'a.ts', macro)
    expect(report).toHaveProperty('file', 'a.ts')
    expect(report).toHaveProperty('zoomLevels')
    expect(report).toHaveProperty('focalDepth')
    expect(report).toHaveProperty('bestZoomLevel')
    expect(report).toHaveProperty('worstZoomLevel')
  })

  it('has 4 zoom levels', () => {
    const macro = analyzeMacro(['a.ts'], ['export const x = 1;'])
    const report = buildFocusReport('export const x = 1;', 'a.ts', macro)
    expect(report.zoomLevels).toHaveLength(4)
  })

  it('bestZoomLevel is a valid level', () => {
    const macro = analyzeMacro(['a.ts'], ['export function f(): number { return 1 }'])
    const report = buildFocusReport('export function f(): number { return 1 }', 'a.ts', macro)
    expect(['macro', 'meso', 'micro', 'nano']).toContain(report.bestZoomLevel)
  })
})

// ─── buildTelescopeLensResult ──────────────────────────────────────────────────

describe('buildTelescopeLensResult', () => {
  it('returns a complete TelescopeLensResult', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result).toHaveProperty('reports')
    expect(result).toHaveProperty('globalZoom')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one report per file', () => {
    const result = buildTelescopeLensResult(
      ['a.ts', 'b.ts'],
      ['export const x = 1;', 'export function f() {}'],
      {},
    )
    expect(result.reports).toHaveLength(2)
  })

  it('handles empty input', () => {
    const result = buildTelescopeLensResult([], [], {})
    expect(result.reports).toHaveLength(0)
    expect(result.stats.totalReports).toBe(0)
    expect(result.stats.overallFocus).toBe(50)
  })

  it('computes stats correctly', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.totalReports).toBe(1)
    expect(result.stats.avgClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFocusScore).toBeGreaterThanOrEqual(0)
  })

  it('computes per-level clarity', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.macroClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.mesoClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.microClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.nanoClarity).toBeGreaterThanOrEqual(0)
  })

  it('computes findings per level', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.findingsPerLevel).toHaveProperty('macro')
    expect(result.stats.findingsPerLevel).toHaveProperty('meso')
    expect(result.stats.findingsPerLevel).toHaveProperty('micro')
    expect(result.stats.findingsPerLevel).toHaveProperty('nano')
  })

  it('computes telescope grade', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(['hubble', 'observatory', 'binoculars', 'magnifying-glass', 'naked-eye']).toContain(result.stats.telescopeGrade)
  })

  it('computes best and worst overall levels', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(['macro', 'meso', 'micro', 'nano']).toContain(result.stats.bestOverallLevel)
    expect(['macro', 'meso', 'micro', 'nano']).toContain(result.stats.worstOverallLevel)
  })

  it('counts crystal and opaque files', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.crystalFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.opaqueFiles).toBeGreaterThanOrEqual(0)
  })

  it('counts critical findings', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['async function f() { await x }'], {})
    expect(result.stats.criticalFindings).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatTelescopeLensTable ──────────────────────────────────────────────────

describe('formatTelescopeLensTable', () => {
  it('returns a string', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatTelescopeLensTable(result, false)
    expect(typeof output).toBe('string')
  })

  it('contains header', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatTelescopeLensTable(result, false)
    expect(output).toContain('Telescope Lens')
  })

  it('contains Global Zoom section', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatTelescopeLensTable(result, false)
    expect(output).toContain('Global Zoom')
  })

  it('contains Reports section', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatTelescopeLensTable(result, false)
    expect(output).toContain('Reports')
  })

  it('contains Statistics section', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatTelescopeLensTable(result, false)
    expect(output).toContain('Statistics')
  })

  it('shows recommendations when present', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['async function f() { await x }'], {})
    const output = formatTelescopeLensTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })

  it('handles no reports gracefully', () => {
    const result = buildTelescopeLensResult([], [], {})
    const output = formatTelescopeLensTable(result, false)
    expect(output).toContain('No reports')
  })
})

// ─── formatTelescopeLensJson ───────────────────────────────────────────────────

describe('formatTelescopeLensJson', () => {
  it('returns valid JSON', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatTelescopeLensJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('reports')
    expect(parsed).toHaveProperty('globalZoom')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('pretty prints', () => {
    const result = buildTelescopeLensResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatTelescopeLensJson(result)
    expect(json).toContain('  ')
  })
})
