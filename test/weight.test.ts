import { describe, it, expect } from 'vitest'

import {
  buildImportGraph,
  resolveImportPath,
  computeTransitiveImports,
  computeFileWeight,
  classifyWeight,
  computeDistribution,
  findHeaviest,
  generateRecommendations,
  buildWeightResult,
  type FileWeight,
  type WeightStats,
} from '../src/commands/weight-helpers.js'

import {
  formatWeightTable,
  formatWeightDistribution,
  formatHeaviestFiles,
  formatWeightHeatmap,
  formatWeightStatsLine,
  formatWeightRecommendations,
  formatWeightResultTable,
  formatWeightJson,
  formatWeightCsv,
} from '../src/commands/weight-format-helpers.js'

// ─── buildImportGraph ─────────────────────────────────────────────────────────

describe('buildImportGraph', () => {
  it('builds graph from files and contents', () => {
    const files = ['src/a.ts', 'src/b.ts']
    const contents = ["import { x } from './b.js'", 'const x = 1']
    const graph = buildImportGraph(files, contents)
    expect(graph.get('src/a.ts')).toEqual(['src/b.ts'])
    expect(graph.get('src/b.ts')).toEqual([])
  })

  it('resolves parent directory imports', () => {
    const files = ['src/commands/a.ts', 'src/core/b.ts']
    const contents = ["import { x } from '../core/b.js'", 'const x = 1']
    const graph = buildImportGraph(files, contents)
    expect(graph.get('src/commands/a.ts')).toEqual(['src/core/b.ts'])
  })

  it('ignores external imports', () => {
    const files = ['src/a.ts']
    const contents = ["import chalk from 'chalk'"]
    const graph = buildImportGraph(files, contents)
    expect(graph.get('src/a.ts')).toEqual([])
  })

  it('handles files with no imports', () => {
    const files = ['src/a.ts']
    const contents = ['const x = 1']
    const graph = buildImportGraph(files, contents)
    expect(graph.get('src/a.ts')).toEqual([])
  })

  it('handles empty input', () => {
    const graph = buildImportGraph([], [])
    expect(graph.size).toBe(0)
  })
})

// ─── resolveImportPath ────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  const fileSet = new Set(['src/core/file.ts', 'src/utils/helpers.ts', 'src/index.ts'])

  it('resolves sibling import', () => {
    expect(resolveImportPath('./file', ['src', 'core'], fileSet)).toBe('src/core/file.ts')
  })

  it('resolves parent import', () => {
    expect(resolveImportPath('../core/file', ['src', 'commands'], fileSet)).toBe('src/core/file.ts')
  })

  it('returns null for missing file', () => {
    expect(resolveImportPath('./missing', ['src'], fileSet)).toBeNull()
  })

  it('returns null for external path', () => {
    expect(resolveImportPath('chalk', ['src'], fileSet)).toBeNull()
  })
})

// ─── computeTransitiveImports ─────────────────────────────────────────────────

describe('computeTransitiveImports', () => {
  it('returns empty for file with no imports', () => {
    const graph = new Map([['a.ts', []]])
    const result = computeTransitiveImports('a.ts', graph, new Set())
    expect(result.size).toBe(0)
  })

  it('computes direct imports', () => {
    const graph = new Map([['a.ts', ['b.ts']], ['b.ts', []]])
    const result = computeTransitiveImports('a.ts', graph, new Set())
    expect(result.has('b.ts')).toBe(true)
  })

  it('computes transitive imports', () => {
    const graph = new Map([['a.ts', ['b.ts']], ['b.ts', ['c.ts']], ['c.ts', []]])
    const result = computeTransitiveImports('a.ts', graph, new Set())
    expect(result.has('b.ts')).toBe(true)
    expect(result.has('c.ts')).toBe(true)
  })

  it('handles cycles', () => {
    const graph = new Map([['a.ts', ['b.ts']], ['b.ts', ['a.ts']]])
    const result = computeTransitiveImports('a.ts', graph, new Set())
    expect(result.has('b.ts')).toBe(true)
  })

  it('handles diamond dependencies', () => {
    const graph = new Map([['a.ts', ['b.ts', 'c.ts']], ['b.ts', ['d.ts']], ['c.ts', ['d.ts']], ['d.ts', []]])
    const result = computeTransitiveImports('a.ts', graph, new Set())
    expect(result.size).toBe(3)
  })
})

// ─── computeFileWeight ────────────────────────────────────────────────────────

describe('computeFileWeight', () => {
  it('computes weight for isolated file', () => {
    const graph = new Map([['a.ts', []]])
    const lineMap = new Map([['a.ts', 50]])
    const fw = computeFileWeight('a.ts', graph, lineMap, 100)
    expect(fw.directImports).toBe(0)
    expect(fw.transitiveImports).toBe(0)
    expect(fw.directLines).toBe(50)
    expect(fw.transitiveLines).toBe(50)
  })

  it('computes weight for file with imports', () => {
    const graph = new Map([['a.ts', ['b.ts']], ['b.ts', []]])
    const lineMap = new Map([['a.ts', 20], ['b.ts', 30]])
    const fw = computeFileWeight('a.ts', graph, lineMap, 100)
    expect(fw.directImports).toBe(1)
    expect(fw.transitiveImports).toBe(1)
    expect(fw.transitiveLines).toBe(50)
  })

  it('computes transitive line count', () => {
    const graph = new Map([['a.ts', ['b.ts']], ['b.ts', ['c.ts']], ['c.ts', []]])
    const lineMap = new Map([['a.ts', 10], ['b.ts', 20], ['c.ts', 30]])
    const fw = computeFileWeight('a.ts', graph, lineMap, 100)
    expect(fw.transitiveLines).toBe(60)
  })

  it('computes weight score relative to max', () => {
    const graph = new Map([['a.ts', []]])
    const lineMap = new Map([['a.ts', 50]])
    const fw = computeFileWeight('a.ts', graph, lineMap, 100)
    expect(fw.weightScore).toBe(50)
  })

  it('classifies weight', () => {
    const graph = new Map([['a.ts', []]])
    const lineMap = new Map([['a.ts', 10]])
    const fw = computeFileWeight('a.ts', graph, lineMap, 100)
    expect(fw.category).toBe('lightweight')
  })

  it('populates import details', () => {
    const graph = new Map([['a.ts', ['b.ts']], ['b.ts', []]])
    const lineMap = new Map([['a.ts', 10], ['b.ts', 20]])
    const fw = computeFileWeight('a.ts', graph, lineMap, 100)
    expect(fw.imports.length).toBe(1)
    expect(fw.imports[0]!.importedFile).toBe('b.ts')
    expect(fw.imports[0]!.directCost).toBe(20)
  })
})

// ─── classifyWeight ───────────────────────────────────────────────────────────

describe('classifyWeight', () => {
  it('classifies 0-24 as lightweight', () => {
    expect(classifyWeight(0)).toBe('lightweight')
    expect(classifyWeight(24)).toBe('lightweight')
  })

  it('classifies 25-49 as medium', () => {
    expect(classifyWeight(25)).toBe('medium')
    expect(classifyWeight(49)).toBe('medium')
  })

  it('classifies 50-74 as heavy', () => {
    expect(classifyWeight(50)).toBe('heavy')
    expect(classifyWeight(74)).toBe('heavy')
  })

  it('classifies 75+ as obese', () => {
    expect(classifyWeight(75)).toBe('obese')
    expect(classifyWeight(100)).toBe('obese')
  })
})

// ─── computeDistribution ──────────────────────────────────────────────────────

describe('computeDistribution', () => {
  it('returns zeroed distribution for empty', () => {
    const dist = computeDistribution([])
    expect(dist).toEqual({ lightweight: 0, medium: 0, heavy: 0, obese: 0 })
  })

  it('counts each category', () => {
    const files: FileWeight[] = [
      { file: 'a.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 10, category: 'lightweight', imports: [] },
      { file: 'b.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 30, category: 'medium', imports: [] },
      { file: 'c.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 60, category: 'heavy', imports: [] },
      { file: 'd.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 80, category: 'obese', imports: [] },
    ]
    const dist = computeDistribution(files)
    expect(dist).toEqual({ lightweight: 1, medium: 1, heavy: 1, obese: 1 })
  })
})

// ─── findHeaviest ─────────────────────────────────────────────────────────────

describe('findHeaviest', () => {
  it('returns top N sorted by score', () => {
    const files: FileWeight[] = [
      { file: 'a.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 10, category: 'lightweight', imports: [] },
      { file: 'b.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 80, category: 'obese', imports: [] },
      { file: 'c.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 50, category: 'heavy', imports: [] },
    ]
    const top = findHeaviest(files, 2)
    expect(top.length).toBe(2)
    expect(top[0]!.file).toBe('b.ts')
    expect(top[1]!.file).toBe('c.ts')
  })

  it('returns all if fewer than N', () => {
    const files: FileWeight[] = [
      { file: 'a.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 10, category: 'lightweight', imports: [] },
    ]
    expect(findHeaviest(files, 5).length).toBe(1)
  })

  it('returns empty for empty input', () => {
    expect(findHeaviest([], 5)).toEqual([])
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: WeightStats = { totalFiles: 5, averageDirectImports: 2, averageTransitiveImports: 3, averageWeightScore: 30, heaviestFile: 'a.ts', lightestFile: 'b.ts', totalTransitiveLines: 500 }

  it('returns clean message for healthy weights', () => {
    const recs = generateRecommendations([], emptyStats)
    expect(recs).toEqual(['Import weights are within healthy range. No action needed.'])
  })

  it('recommends for obese files', () => {
    const fw: FileWeight = { file: 'heavy.ts', directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: 0, weightScore: 90, category: 'obese', imports: [] }
    const recs = generateRecommendations([fw], emptyStats)
    expect(recs.some((r) => r.includes('heavy.ts') && r.includes('obese'))).toBe(true)
  })

  it('recommends for heavy files', () => {
    const fw: FileWeight = { file: 'big.ts', directImports: 5, transitiveImports: 10, directLines: 0, transitiveLines: 0, weightScore: 60, category: 'heavy', imports: [] }
    const recs = generateRecommendations([fw], emptyStats)
    expect(recs.some((r) => r.includes('big.ts') && r.includes('heavy'))).toBe(true)
  })

  it('warns about high average score', () => {
    const stats = { ...emptyStats, averageWeightScore: 60 }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('Average weight score'))).toBe(true)
  })
})

// ─── buildWeightResult ────────────────────────────────────────────────────────

describe('buildWeightResult', () => {
  it('returns empty result for no files', () => {
    const result = buildWeightResult([], [])
    expect(result.files).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single file', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    expect(result.files.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('analyzes multiple files', () => {
    const result = buildWeightResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])
    expect(result.files.length).toBe(2)
  })

  it('computes distribution', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    expect(result.distribution).toBeDefined()
    const total = result.distribution.lightweight + result.distribution.medium + result.distribution.heavy + result.distribution.obese
    expect(total).toBe(1)
  })

  it('computes heaviest files', () => {
    const result = buildWeightResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])
    expect(result.heaviest.length).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildWeightResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])
    expect(result.stats.averageDirectImports).toBeGreaterThanOrEqual(0)
    expect(result.stats.averageWeightScore).toBeGreaterThanOrEqual(0)
  })

  it('finds heaviest and lightest file', () => {
    const result = buildWeightResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])
    expect(result.stats.heaviestFile).toBeTruthy()
    expect(result.stats.lightestFile).toBeTruthy()
  })

  it('respects top option', () => {
    const result = buildWeightResult(['a.ts', 'b.ts', 'c.ts'], ['x', 'y', 'z'], { top: 2 })
    expect(result.heaviest.length).toBeLessThanOrEqual(2)
  })

  it('generates recommendations', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks import chains', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = ["import { x } from './b.js'", "import { y } from './c.js'", 'const y = 1']
    const result = buildWeightResult(files, contents)
    const aFile = result.files.find((f) => f.file === 'a.ts')
    expect(aFile!.transitiveImports).toBe(2)
    expect(aFile!.transitiveLines).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatWeightTable', () => {
  it('shows message for no files', () => {
    expect(formatWeightTable([])).toContain('No files')
  })

  it('renders weight table', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    const output = formatWeightTable(result.files)
    expect(output).toContain('a.ts')
    expect(output).toContain('Import Weight')
  })
})

describe('formatWeightDistribution', () => {
  it('renders distribution chart', () => {
    const output = formatWeightDistribution({ lightweight: 3, medium: 2, heavy: 1, obese: 0 })
    expect(output).toContain('Weight Distribution')
    expect(output).toContain('lightweight')
    expect(output).toContain('█')
  })
})

describe('formatHeaviestFiles', () => {
  it('returns empty for no files', () => {
    expect(formatHeaviestFiles([])).toBe('')
  })

  it('renders heaviest files', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    const output = formatHeaviestFiles(result.heaviest)
    expect(output).toContain('Heaviest Files')
  })
})

describe('formatWeightHeatmap', () => {
  it('returns empty for no files', () => {
    expect(formatWeightHeatmap([])).toBe('')
  })

  it('renders heatmap', () => {
    const result = buildWeightResult(['src/commands/a.ts'], ['const x = 1'])
    const output = formatWeightHeatmap(result.files)
    expect(output).toContain('Weight Heatmap')
    expect(output).toContain('src/commands')
  })
})

describe('formatWeightStatsLine', () => {
  it('renders stats', () => {
    const stats: WeightStats = { totalFiles: 10, averageDirectImports: 3, averageTransitiveImports: 7, averageWeightScore: 35, heaviestFile: 'app.ts', lightestFile: 'util.ts', totalTransitiveLines: 5000 }
    const output = formatWeightStatsLine(stats)
    expect(output).toContain('Files: 10')
    expect(output).toContain('35/100')
  })
})

describe('formatWeightRecommendations', () => {
  it('returns empty for no recs', () => {
    expect(formatWeightRecommendations([])).toBe('')
  })

  it('renders recommendations', () => {
    const output = formatWeightRecommendations(['Split heavy files'])
    expect(output).toContain('Split heavy files')
  })
})

describe('formatWeightResultTable', () => {
  it('renders full result', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    const output = formatWeightResultTable(result, false)
    expect(output).toContain('Avg Score')
    expect(output).toContain('Weight Distribution')
  })

  it('includes verbose output', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    const output = formatWeightResultTable(result, true)
    expect(output).toContain('Import Weight')
    expect(output).toContain('Heatmap')
  })
})

describe('formatWeightJson', () => {
  it('returns valid JSON', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    const output = formatWeightJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('stats')
  })
})

describe('formatWeightCsv', () => {
  it('includes header', () => {
    const result = buildWeightResult([], [])
    const output = formatWeightCsv(result)
    expect(output).toContain('file,directImports,transitiveImports')
  })

  it('includes data rows', () => {
    const result = buildWeightResult(['a.ts'], ['const x = 1'])
    const output = formatWeightCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[1]).toContain('a.ts')
  })
})
