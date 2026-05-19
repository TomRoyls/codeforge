import { describe, expect, it } from 'vitest'
import {
  buildDustResult,
  categorizeDust,
  classifyCleanliness,
  computeCleanlinessScore,
  detectCommentedCode,
  detectDeadExports,
  detectDeprecatedPatterns,
  detectLeftoverDebug,
  detectPlaceholders,
  detectStaleTodos,
  detectUnusedImports,
  generateRecommendations,
  type DustItem,
  type DustStats,
} from '../src/commands/dust-helpers.js'
import {
  cleanlinessMeter,
  dustTypeBadge,
  formatCategoryBreakdown,
  formatDustJson,
  formatDustOutput,
  formatDustRecommendations,
  formatDustStats,
  formatDustTable,
  formatFileReports,
  gradeBadge,
} from '../src/commands/dust-format-helpers.js'

// ─── detectCommentedCode ──────────────────────────────────────────────────────

describe('detectCommentedCode', () => {
  it('detects commented const', () => {
    const items = detectCommentedCode('// const x = 5', 'a.ts')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('commented-code')
  })

  it('detects commented function', () => {
    const items = detectCommentedCode('// function foo() {}', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('detects commented return', () => {
    const items = detectCommentedCode('// return result', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('skips regular comments', () => {
    const items = detectCommentedCode('// This is a note', 'a.ts')
    expect(items.length).toBe(0)
  })

  it('skips triple-slash', () => {
    const items = detectCommentedCode('/// <reference types="..." />', 'a.ts')
    expect(items.length).toBe(0)
  })

  it('skips section separators', () => {
    const items = detectCommentedCode('// ─── section ───', 'a.ts')
    expect(items.length).toBe(0)
  })

  it('detects commented if', () => {
    const items = detectCommentedCode('// if (x > 5) {', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('detects commented import', () => {
    const items = detectCommentedCode("// import { foo } from 'bar'", 'a.ts')
    expect(items.length).toBe(1)
  })

  it('sets file path', () => {
    const items = detectCommentedCode('// const x = 1', 'my.ts')
    expect(items[0].file).toBe('my.ts')
  })
})

// ─── detectUnusedImports ──────────────────────────────────────────────────────

describe('detectUnusedImports', () => {
  it('detects unused import', () => {
    const items = detectUnusedImports("import { foo } from 'bar'\nconst x = 1", 'a.ts')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('unused-import')
  })

  it('skips used imports', () => {
    const items = detectUnusedImports("import { foo } from 'bar'\nfoo()", 'a.ts')
    expect(items.length).toBe(0)
  })

  it('handles multiple imports', () => {
    const code = "import { foo, bar } from 'mod'\nfoo()"
    const items = detectUnusedImports(code, 'a.ts')
    expect(items.length).toBe(1)
    expect(items[0].description).toContain('bar')
  })

  it('skips non-named imports', () => {
    const items = detectUnusedImports("import fs from 'fs'", 'a.ts')
    expect(items.length).toBe(0)
  })

  it('handles aliased imports', () => {
    const code = "import { foo as bar } from 'mod'\nconst x = 1"
    const items = detectUnusedImports(code, 'a.ts')
    expect(items.length).toBe(1)
  })
})

// ─── detectDeadExports ────────────────────────────────────────────────────────

describe('detectDeadExports', () => {
  it('detects dead export function', () => {
    const items = detectDeadExports('export function foo() {}', 'a.ts', ['a.ts', 'b.ts'], ['', ''])
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('dead-export')
  })

  it('skips used exports', () => {
    const items = detectDeadExports('export function foo() {}', 'a.ts', ['a.ts', 'b.ts'], ['', "import { foo } from 'a'"])
    expect(items.length).toBe(0)
  })

  it('detects dead export const', () => {
    const items = detectDeadExports('export const VERSION = "1.0"', 'a.ts', ['a.ts', 'b.ts'], ['', ''])
    expect(items.length).toBe(1)
  })

  it('detects dead export class', () => {
    const items = detectDeadExports('export class Foo {}', 'a.ts', ['a.ts', 'b.ts'], ['', ''])
    expect(items.length).toBe(1)
  })

  it('detects dead export interface', () => {
    const items = detectDeadExports('export interface Config {}', 'a.ts', ['a.ts', 'b.ts'], ['', ''])
    expect(items.length).toBe(1)
  })
})

// ─── detectStaleTodos ─────────────────────────────────────────────────────────

describe('detectStaleTodos', () => {
  it('detects TODO comments', () => {
    const items = detectStaleTodos('// TODO: fix this later', 'a.ts')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('stale-todo')
  })

  it('detects FIXME comments', () => {
    const items = detectStaleTodos('// FIXME: broken', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('detects HACK comments', () => {
    const items = detectStaleTodos('// HACK: workaround', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('detects XXX comments', () => {
    const items = detectStaleTodos('// XXX: dangerous', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('skips regular comments', () => {
    const items = detectStaleTodos('// This is fine', 'a.ts')
    expect(items.length).toBe(0)
  })
})

// ─── detectDeprecatedPatterns ─────────────────────────────────────────────────

describe('detectDeprecatedPatterns', () => {
  it('detects var usage', () => {
    const items = detectDeprecatedPatterns('var x = 5', 'a.ts')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('deprecated-pattern')
  })

  it('skips const usage', () => {
    const items = detectDeprecatedPatterns('const x = 5', 'a.ts')
    expect(items.length).toBe(0)
  })

  it('skips let usage', () => {
    const items = detectDeprecatedPatterns('let x = 5', 'a.ts')
    expect(items.length).toBe(0)
  })

  it('skips commented var', () => {
    const items = detectDeprecatedPatterns('// var x = 5', 'a.ts')
    expect(items.length).toBe(0)
  })

  it('skips JSDoc lines', () => {
    const items = detectDeprecatedPatterns(' * var x = 5', 'a.ts')
    expect(items.length).toBe(0)
  })
})

// ─── detectLeftoverDebug ──────────────────────────────────────────────────────

describe('detectLeftoverDebug', () => {
  it('detects console.log', () => {
    const items = detectLeftoverDebug('console.log("debug")', 'a.ts')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('leftover-debug')
  })

  it('detects console.debug', () => {
    const items = detectLeftoverDebug('console.debug("x")', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('detects debugger statement', () => {
    const items = detectLeftoverDebug('debugger;', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('skips console in test files', () => {
    const items = detectLeftoverDebug('console.log("test")', 'foo.test.ts')
    expect(items.length).toBe(0)
  })

  it('skips commented console', () => {
    const items = detectLeftoverDebug('// console.log("x")', 'a.ts')
    expect(items.length).toBe(0)
  })

  it('skips spec files', () => {
    const items = detectLeftoverDebug('console.log("x")', 'foo.spec.ts')
    expect(items.length).toBe(0)
  })
})

// ─── detectPlaceholders ───────────────────────────────────────────────────────

describe('detectPlaceholders', () => {
  it('detects empty catch block', () => {
    const items = detectPlaceholders('try {} catch (e) {}', 'a.ts')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('placeholder')
  })

  it('detects empty catch without binding', () => {
    const items = detectPlaceholders('try {} catch {}', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('detects bare TODO', () => {
    const items = detectPlaceholders('// TODO', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('detects bare FIXME', () => {
    const items = detectPlaceholders('// FIXME', 'a.ts')
    expect(items.length).toBe(1)
  })

  it('skips TODO with description', () => {
    const items = detectPlaceholders('// TODO: fix this properly', 'a.ts')
    expect(items.some((i) => i.type === 'placeholder' && i.description.includes('without'))).toBe(false)
  })
})

// ─── classifyCleanliness ──────────────────────────────────────────────────────

describe('classifyCleanliness', () => {
  it('returns spotless for no dust', () => {
    expect(classifyCleanliness(0, 100)).toBe('spotless')
  })

  it('returns spotless for 0 lines', () => {
    expect(classifyCleanliness(0, 0)).toBe('spotless')
  })

  it('returns clean for low density', () => {
    expect(classifyCleanliness(1, 200)).toBe('clean')
  })

  it('returns dusty for medium density', () => {
    expect(classifyCleanliness(5, 200)).toBe('dusty')
  })

  it('returns dirty for higher density', () => {
    expect(classifyCleanliness(8, 200)).toBe('dirty')
  })

  it('returns cluttered for high density', () => {
    expect(classifyCleanliness(15, 200)).toBe('cluttered')
  })
})

// ─── computeCleanlinessScore ──────────────────────────────────────────────────

describe('computeCleanlinessScore', () => {
  it('returns 100 for no dust', () => {
    expect(computeCleanlinessScore(0, 100)).toBe(100)
  })

  it('returns 100 for 0 lines', () => {
    expect(computeCleanlinessScore(0, 0)).toBe(100)
  })

  it('penalizes dust', () => {
    expect(computeCleanlinessScore(5, 200)).toBe(75)
  })

  it('clamps to 0', () => {
    expect(computeCleanlinessScore(200, 100)).toBe(0)
  })
})

// ─── categorizeDust ───────────────────────────────────────────────────────────

describe('categorizeDust', () => {
  it('groups by type', () => {
    const items: DustItem[] = [
      { type: 'commented-code', file: 'a.ts', line: 1, content: '', severity: 'cleanup', description: '', suggestion: '', estimatedAge: '' },
      { type: 'commented-code', file: 'a.ts', line: 2, content: '', severity: 'cleanup', description: '', suggestion: '', estimatedAge: '' },
      { type: 'unused-import', file: 'a.ts', line: 3, content: '', severity: 'warning', description: '', suggestion: '', estimatedAge: '' },
    ]
    const cats = categorizeDust(items)
    expect(cats.length).toBe(2)
    expect(cats[0].type).toBe('commented-code')
    expect(cats[0].count).toBe(2)
  })

  it('returns empty for no dust', () => {
    expect(categorizeDust([]).length).toBe(0)
  })

  it('sorts by count descending', () => {
    const items: DustItem[] = [
      { type: 'a', file: '', line: 1, content: '', severity: 'info', description: '', suggestion: '', estimatedAge: '' },
      { type: 'b', file: '', line: 1, content: '', severity: 'info', description: '', suggestion: '', estimatedAge: '' },
      { type: 'b', file: '', line: 2, content: '', severity: 'info', description: '', suggestion: '', estimatedAge: '' },
      { type: 'b', file: '', line: 3, content: '', severity: 'info', description: '', suggestion: '', estimatedAge: '' },
    ]
    const cats = categorizeDust(items)
    expect(cats[0].type).toBe('b')
    expect(cats[0].count).toBe(3)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: DustStats = {
    totalDust: 5, dustyFiles: 2, cleanFiles: 3, averageCleanliness: 80,
    mostCommonDust: 'commented-code', dustiestFile: 'a.ts', overallCleanliness: 80,
  }

  it('returns spotless for no dust', () => {
    const stats = { ...baseStats, totalDust: 0 }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('spotless'))).toBe(true)
  })

  it('warns about commented code', () => {
    const cats = [{ type: 'commented-code', count: 3, items: [], severity: 'cleanup' as const, description: '' }]
    const recs = generateRecommendations(cats, baseStats)
    expect(recs.some((r) => r.includes('commented'))).toBe(true)
  })

  it('warns about unused imports', () => {
    const cats = [{ type: 'unused-import', count: 5, items: [], severity: 'warning' as const, description: '' }]
    const recs = generateRecommendations(cats, baseStats)
    expect(recs.some((r) => r.includes('unused'))).toBe(true)
  })

  it('warns about leftover debug', () => {
    const cats = [{ type: 'leftover-debug', count: 2, items: [], severity: 'cleanup' as const, description: '' }]
    const recs = generateRecommendations(cats, baseStats)
    expect(recs.some((r) => r.includes('debug'))).toBe(true)
  })

  it('warns about many stale TODOs', () => {
    const cats = [{ type: 'stale-todo', count: 5, items: [], severity: 'info' as const, description: '' }]
    const recs = generateRecommendations(cats, baseStats)
    expect(recs.some((r) => r.includes('TODO'))).toBe(true)
  })

  it('warns about deprecated patterns', () => {
    const cats = [{ type: 'deprecated-pattern', count: 3, items: [], severity: 'warning' as const, description: '' }]
    const recs = generateRecommendations(cats, baseStats)
    expect(recs.some((r) => r.includes('Modernize'))).toBe(true)
  })

  it('warns about low overall cleanliness', () => {
    const stats = { ...baseStats, overallCleanliness: 40 }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('40%'))).toBe(true)
  })
})

// ─── buildDustResult ──────────────────────────────────────────────────────────

describe('buildDustResult', () => {
  it('returns complete result', () => {
    const result = buildDustResult(['a.ts'], ['console.log("debug")\nconst x = 1'])
    expect(result.stats.totalDust).toBeGreaterThan(0)
    expect(result.files.length).toBe(1)
    expect(result.allDust.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildDustResult([], [])
    expect(result.stats.totalDust).toBe(0)
    expect(result.stats.cleanFiles).toBe(0)
  })

  it('computes cleanliness', () => {
    const result = buildDustResult(['a.ts'], ['const x = 1\nconst y = 2\nconst z = 3'])
    expect(result.files[0].cleanliness).toBe(100)
    expect(result.files[0].grade).toBe('spotless')
  })

  it('categorizes dust', () => {
    const result = buildDustResult(['a.ts'], ['console.log("x")\n// TODO: fix'])
    expect(result.categories.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildDustResult(['a.ts'], ['console.log("x")'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('identifies dustiest file', () => {
    const result = buildDustResult(
      ['a.ts', 'b.ts'],
      ['const x = 1', 'console.log("x")\nconsole.log("y")\nvar z = 3'],
    )
    expect(result.stats.dustiestFile).toBe('b.ts')
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('dustTypeBadge', () => {
  it('returns badge for each type', () => {
    expect(dustTypeBadge('commented-code')).toBeTruthy()
    expect(dustTypeBadge('unused-import')).toBeTruthy()
    expect(dustTypeBadge('leftover-debug')).toBeTruthy()
    expect(dustTypeBadge('stale-todo')).toBeTruthy()
  })
})

describe('gradeBadge', () => {
  it('returns badge for each grade', () => {
    expect(gradeBadge('spotless')).toContain('SPOTLESS')
    expect(gradeBadge('clean')).toContain('CLEAN')
    expect(gradeBadge('dusty')).toContain('DUSTY')
    expect(gradeBadge('dirty')).toContain('DIRTY')
    expect(gradeBadge('cluttered')).toContain('CLUTTERED')
  })
})

describe('cleanlinessMeter', () => {
  it('renders meter', () => {
    const meter = cleanlinessMeter(75)
    expect(meter).toContain('█')
    expect(meter).toContain('75')
  })
})

describe('formatDustTable', () => {
  it('returns no-dust message for empty', () => {
    expect(formatDustTable([])).toContain('no dust')
  })

  it('includes dust data', () => {
    const items: DustItem[] = [{ type: 'leftover-debug', file: 'a.ts', line: 1, content: 'console.log()', severity: 'cleanup', description: 'Debug', suggestion: 'Remove', estimatedAge: '' }]
    const table = formatDustTable(items)
    expect(table).toContain('Debug')
  })
})

describe('formatFileReports', () => {
  it('returns no-files message for empty', () => {
    expect(formatFileReports([])).toContain('no files')
  })

  it('shows all spotless for clean files', () => {
    const reports = [{ file: 'a.ts', dustCount: 0, dustItems: [], cleanliness: 100, grade: 'spotless' as const }]
    expect(formatFileReports(reports)).toContain('spotless')
  })

  it('shows dusty files', () => {
    const reports = [{ file: 'a.ts', dustCount: 3, dustItems: [], cleanliness: 70, grade: 'dusty' as const }]
    const formatted = formatFileReports(reports)
    expect(formatted).toContain('a.ts')
  })
})

describe('formatCategoryBreakdown', () => {
  it('returns no-categories for empty', () => {
    expect(formatCategoryBreakdown([])).toContain('no categories')
  })

  it('includes category data', () => {
    const cats = [{ type: 'commented-code', count: 5, items: [], severity: 'cleanup' as const, description: 'Commented code' }]
    const formatted = formatCategoryBreakdown(cats)
    expect(formatted).toContain('commented-code')
    expect(formatted).toContain('5')
  })
})

describe('formatDustStats', () => {
  it('formats all stat fields', () => {
    const stats: DustStats = {
      totalDust: 10, dustyFiles: 3, cleanFiles: 5, averageCleanliness: 75,
      mostCommonDust: 'leftover-debug', dustiestFile: 'a.ts', overallCleanliness: 75,
    }
    const formatted = formatDustStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('leftover-debug')
  })
})

describe('formatDustRecommendations', () => {
  it('formats recommendations', () => {
    expect(formatDustRecommendations(['Clean up'])).toContain('Clean up')
  })

  it('returns no-recs for empty', () => {
    expect(formatDustRecommendations([])).toContain('no recommendations')
  })
})

describe('formatDustOutput', () => {
  it('includes all sections', () => {
    const result = buildDustResult(['a.ts'], ['console.log("x")'])
    const output = formatDustOutput(result)
    expect(output).toContain('Dust Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatDustJson', () => {
  it('returns valid JSON', () => {
    const result = buildDustResult(['a.ts'], ['const x = 1'])
    const json = formatDustJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalDust).toBe(0)
  })
})
