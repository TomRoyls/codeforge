import { describe, it, expect } from 'vitest'

import {
  buildMigrationResult,
  computeMigrationProgress,
  computeMigrationStats,
  computeOverallProgress,
  getMigrationPatterns,
  scanForPattern,
  type MigrationMatch,
  type MigrationPattern,
  type MigrationProgress,
} from '../src/commands/migration-helpers.js'

import {
  buildProgressBar,
  formatMigrationJson,
  formatMigrationStats,
  formatMigrationTable,
  formatOverallProgress,
  formatProgressLines,
} from '../src/commands/migration-format-helpers.js'

import Migration from '../src/commands/migration.js'

// ─── getMigrationPatterns ───────────────────────────────

describe('getMigrationPatterns', () => {
  it('should return at least 10 patterns', () => {
    expect(getMigrationPatterns().length).toBeGreaterThanOrEqual(10)
  })

  it('should include CJS_REQUIRE', () => {
    expect(getMigrationPatterns().find((p) => p.id === 'CJS_REQUIRE')).toBeDefined()
  })

  it('should include CJS_MODULE_EXPORTS', () => {
    expect(getMigrationPatterns().find((p) => p.id === 'CJS_MODULE_EXPORTS')).toBeDefined()
  })

  it('should include CALLBACK_STYLE', () => {
    expect(getMigrationPatterns().find((p) => p.id === 'CALLBACK_STYLE')).toBeDefined()
  })

  it('should include VAR_DECLARATION', () => {
    expect(getMigrationPatterns().find((p) => p.id === 'VAR_DECLARATION')).toBeDefined()
  })

  it('should include PROMISE_CHAIN', () => {
    expect(getMigrationPatterns().find((p) => p.id === 'PROMISE_CHAIN')).toBeDefined()
  })

  it('should include INDEXOF', () => {
    expect(getMigrationPatterns().find((p) => p.id === 'INDEXOF')).toBeDefined()
  })

  it('should have all required fields', () => {
    for (const p of getMigrationPatterns()) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.oldPattern).toBeInstanceOf(RegExp)
      expect(p.newPattern).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(['syntax', 'api', 'pattern', 'style']).toContain(p.category)
      expect(['high', 'medium', 'low']).toContain(p.severity)
    }
  })

  it('should have unique ids', () => {
    const ids = getMigrationPatterns().map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ─── scanForPattern ─────────────────────────────────────

describe('scanForPattern', () => {
  it('should find require() calls', () => {
    const patterns = getMigrationPatterns()
    const cjs = patterns.find((p) => p.id === 'CJS_REQUIRE')!
    const matches = scanForPattern("const fs = require('fs')", 'app.js', cjs)
    expect(matches.length).toBe(1)
    expect(matches[0].oldCode).toContain('require')
  })

  it('should find module.exports', () => {
    const patterns = getMigrationPatterns()
    const cjs = patterns.find((p) => p.id === 'CJS_MODULE_EXPORTS')!
    const matches = scanForPattern('module.exports = { foo }', 'app.js', cjs)
    expect(matches.length).toBe(1)
  })

  it('should find var declarations', () => {
    const patterns = getMigrationPatterns()
    const varPat = patterns.find((p) => p.id === 'VAR_DECLARATION')!
    const matches = scanForPattern('var x = 1', 'app.js', varPat)
    expect(matches.length).toBe(1)
  })

  it('should find callback style', () => {
    const patterns = getMigrationPatterns()
    const cb = patterns.find((p) => p.id === 'CALLBACK_STYLE')!
    const matches = scanForPattern('fs.readFile(path, function(err, data) {})', 'app.js', cb)
    expect(matches.length).toBe(1)
  })

  it('should find .then() chains', () => {
    const patterns = getMigrationPatterns()
    const chain = patterns.find((p) => p.id === 'PROMISE_CHAIN')!
    const matches = scanForPattern('fetch(url).then(r => r.json())', 'app.js', chain)
    expect(matches.length).toBe(1)
  })

  it('should find .indexOf checks', () => {
    const patterns = getMigrationPatterns()
    const idx = patterns.find((p) => p.id === 'INDEXOF')!
    const matches = scanForPattern('if (arr.indexOf(x) !== -1)', 'app.js', idx)
    expect(matches.length).toBe(1)
  })

  it('should find Object.assign({})', () => {
    const patterns = getMigrationPatterns()
    const assign = patterns.find((p) => p.id === 'OBJECT_ASSIGN')!
    const matches = scanForPattern('const merged = Object.assign({}, a, b)', 'app.js', assign)
    expect(matches.length).toBe(1)
  })

  it('should find string concatenation', () => {
    const patterns = getMigrationPatterns()
    const strCat = patterns.find((p) => p.id === 'STRING_CONCAT')!
    const matches = scanForPattern("'hello ' + name", 'app.js', strCat)
    expect(matches.length).toBe(1)
  })

  it('should find null checks', () => {
    const patterns = getMigrationPatterns()
    const nullChk = patterns.find((p) => p.id === 'NULL_CHECK')!
    const matches = scanForPattern(
      'if (x !== null && x !== undefined)',
      'app.js',
      nullChk,
    )
    expect(matches.length).toBe(1)
  })

  it('should return correct line numbers', () => {
    const patterns = getMigrationPatterns()
    const varPat = patterns.find((p) => p.id === 'VAR_DECLARATION')!
    const content = 'line1\nvar x = 1\nline3'
    const matches = scanForPattern(content, 'app.js', varPat)
    expect(matches[0].line).toBe(2)
  })

  it('should return empty array for no matches', () => {
    const patterns = getMigrationPatterns()
    const cjs = patterns.find((p) => p.id === 'CJS_REQUIRE')!
    const matches = scanForPattern('import fs from "fs"', 'app.ts', cjs)
    expect(matches).toHaveLength(0)
  })

  it('should include file path in match', () => {
    const patterns = getMigrationPatterns()
    const varPat = patterns.find((p) => p.id === 'VAR_DECLARATION')!
    const matches = scanForPattern('var x = 1', 'src/app.js', varPat)
    expect(matches[0].file).toBe('src/app.js')
  })

  it('should set pattern id and suggestedNew', () => {
    const patterns = getMigrationPatterns()
    const cjs = patterns.find((p) => p.id === 'CJS_REQUIRE')!
    const matches = scanForPattern("const x = require('fs')", 'app.js', cjs)
    expect(matches[0].pattern).toBe('CJS_REQUIRE')
    expect(matches[0].suggestedNew).toBeTruthy()
  })
})

// ─── computeMigrationProgress ───────────────────────────

describe('computeMigrationProgress', () => {
  it('should return 100% when no matches', () => {
    const patterns = getMigrationPatterns()
    const pat = patterns[0]
    const progress = computeMigrationProgress([], pat)
    expect(progress.percentage).toBe(100)
    expect(progress.totalOccurrences).toBe(0)
  })

  it('should return 0% when matches exist', () => {
    const patterns = getMigrationPatterns()
    const pat = patterns.find((p) => p.id === 'VAR_DECLARATION')!
    const matches: MigrationMatch[] = [
      { file: 'a.js', line: 1, oldCode: 'var x', pattern: 'VAR_DECLARATION', suggestedNew: 'let or const' },
    ]
    const progress = computeMigrationProgress(matches, pat)
    expect(progress.percentage).toBe(0)
    expect(progress.totalOccurrences).toBe(1)
  })

  it('should count unique files', () => {
    const patterns = getMigrationPatterns()
    const pat = patterns.find((p) => p.id === 'VAR_DECLARATION')!
    const matches: MigrationMatch[] = [
      { file: 'a.js', line: 1, oldCode: 'var x', pattern: 'VAR_DECLARATION', suggestedNew: 'let or const' },
      { file: 'b.js', line: 1, oldCode: 'var y', pattern: 'VAR_DECLARATION', suggestedNew: 'let or const' },
      { file: 'a.js', line: 5, oldCode: 'var z', pattern: 'VAR_DECLARATION', suggestedNew: 'let or const' },
    ]
    const progress = computeMigrationProgress(matches, pat)
    expect(progress.files).toBe(2)
  })

  it('should filter by pattern id', () => {
    const patterns = getMigrationPatterns()
    const pat = patterns.find((p) => p.id === 'CJS_REQUIRE')!
    const matches: MigrationMatch[] = [
      { file: 'a.js', line: 1, oldCode: 'var x', pattern: 'VAR_DECLARATION', suggestedNew: 'let or const' },
    ]
    const progress = computeMigrationProgress(matches, pat)
    expect(progress.totalOccurrences).toBe(0)
    expect(progress.percentage).toBe(100)
  })

  it('should carry over pattern metadata', () => {
    const patterns = getMigrationPatterns()
    const pat = patterns[0]
    const progress = computeMigrationProgress([], pat)
    expect(progress.name).toBe(pat.name)
    expect(progress.category).toBe(pat.category)
    expect(progress.severity).toBe(pat.severity)
    expect(progress.pattern).toBe(pat.id)
  })
})

// ─── computeOverallProgress ─────────────────────────────

describe('computeOverallProgress', () => {
  it('should return 100 for empty patterns', () => {
    expect(computeOverallProgress([])).toBe(100)
  })

  it('should return 100 when all patterns complete', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 0, name: 'A', pattern: 'A', percentage: 100, severity: 'high', totalOccurrences: 0 },
      { category: 'syntax', files: 0, name: 'B', pattern: 'B', percentage: 100, severity: 'low', totalOccurrences: 0 },
    ]
    expect(computeOverallProgress(patterns)).toBe(100)
  })

  it('should weight by severity', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 0, name: 'A', pattern: 'A', percentage: 0, severity: 'high', totalOccurrences: 5 },
      { category: 'syntax', files: 0, name: 'B', pattern: 'B', percentage: 100, severity: 'low', totalOccurrences: 0 },
    ]
    const result = computeOverallProgress(patterns)
    expect(result).toBeLessThan(100)
  })

  it('should return 0 when all patterns have 0%', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 1, name: 'A', pattern: 'A', percentage: 0, severity: 'high', totalOccurrences: 5 },
      { category: 'syntax', files: 1, name: 'B', pattern: 'B', percentage: 0, severity: 'medium', totalOccurrences: 3 },
    ]
    expect(computeOverallProgress(patterns)).toBe(0)
  })
})

// ─── computeMigrationStats ──────────────────────────────

describe('computeMigrationStats', () => {
  it('should count completed migrations', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 0, name: 'A', pattern: 'A', percentage: 100, severity: 'high', totalOccurrences: 0 },
      { category: 'syntax', files: 0, name: 'B', pattern: 'B', percentage: 100, severity: 'low', totalOccurrences: 0 },
      { category: 'syntax', files: 1, name: 'C', pattern: 'C', percentage: 0, severity: 'medium', totalOccurrences: 3 },
    ]
    const stats = computeMigrationStats(patterns)
    expect(stats.completedMigrations).toBe(2)
    expect(stats.notStartedMigrations).toBe(1)
  })

  it('should count by category', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 1, name: 'A', pattern: 'A', percentage: 0, severity: 'high', totalOccurrences: 5 },
      { category: 'syntax', files: 1, name: 'B', pattern: 'B', percentage: 0, severity: 'medium', totalOccurrences: 3 },
      { category: 'pattern', files: 1, name: 'C', pattern: 'C', percentage: 0, severity: 'low', totalOccurrences: 2 },
    ]
    const stats = computeMigrationStats(patterns)
    expect(stats.byCategory['syntax']).toBe(8)
    expect(stats.byCategory['pattern']).toBe(2)
  })

  it('should handle empty patterns', () => {
    const stats = computeMigrationStats([])
    expect(stats.totalPatterns).toBe(0)
    expect(stats.completedMigrations).toBe(0)
  })
})

// ─── buildMigrationResult ───────────────────────────────

describe('buildMigrationResult', () => {
  const reader = async (f: string) => {
    if (f === 'a.js') return 'var x = 1\nvar y = 2\n'
    if (f === 'b.js') return "const fs = require('fs')\nmodule.exports = { x }\n"
    return ''
  }

  it('should scan files and return results', async () => {
    const result = await buildMigrationResult(['a.js', 'b.js'], reader)
    expect(result.patterns.length).toBe(getMigrationPatterns().length)
    expect(result.overallProgress).toBeGreaterThanOrEqual(0)
    expect(result.stats).toBeDefined()
  })

  it('should skip non-scannable extensions', async () => {
    const result = await buildMigrationResult(['readme.md', 'style.css'], reader)
    const totalOccurrences = result.patterns.reduce((s, p) => s + p.totalOccurrences, 0)
    expect(totalOccurrences).toBe(0)
  })

  it('should handle file read errors', async () => {
    const failReader = async () => { throw new Error('ENOENT') }
    const result = await buildMigrationResult(['missing.js'], failReader)
    expect(result.patterns.length).toBeGreaterThan(0)
  })

  it('should limit matches when verbose is false', async () => {
    const manyReader = async () => 'var x = 1\n'.repeat(200)
    const result = await buildMigrationResult(['big.js'], manyReader, { verbose: false })
    expect(result.matches.length).toBeLessThanOrEqual(100)
  })

  it('should return all matches when verbose is true', async () => {
    const manyReader = async () => 'var x = 1\n'.repeat(200)
    const result = await buildMigrationResult(['big.js'], manyReader, { verbose: true })
    expect(result.matches.length).toBeGreaterThan(100)
  })

  it('should detect require in .js files', async () => {
    const result = await buildMigrationResult(['b.js'], reader)
    const requirePattern = result.patterns.find((p) => p.pattern === 'CJS_REQUIRE')
    expect(requirePattern!.totalOccurrences).toBe(1)
  })

  it('should detect var in .js files', async () => {
    const result = await buildMigrationResult(['a.js'], reader)
    const varPattern = result.patterns.find((p) => p.pattern === 'VAR_DECLARATION')
    expect(varPattern!.totalOccurrences).toBe(2)
  })

  it('should scan .ts files', async () => {
    const tsReader = async (f: string) => {
      if (f === 'app.ts') return 'var x: number = 1\n'
      return ''
    }
    const result = await buildMigrationResult(['app.ts'], tsReader)
    const varPattern = result.patterns.find((p) => p.pattern === 'VAR_DECLARATION')
    expect(varPattern!.totalOccurrences).toBe(1)
  })

  it('should scan .mjs files', async () => {
    const mjsReader = async (f: string) => {
      if (f === 'app.mjs') return 'var x = 1\n'
      return ''
    }
    const result = await buildMigrationResult(['app.mjs'], mjsReader)
    const varPattern = result.patterns.find((p) => p.pattern === 'VAR_DECLARATION')
    expect(varPattern!.totalOccurrences).toBe(1)
  })
})

// ─── buildProgressBar ───────────────────────────────────

describe('buildProgressBar', () => {
  it('should produce filled bar at 100%', () => {
    const bar = buildProgressBar(100, 10)
    expect(bar).toContain('█')
  })

  it('should produce empty bar at 0%', () => {
    const bar = buildProgressBar(0, 10)
    expect(bar).toContain('░')
  })

  it('should produce mixed bar at 50%', () => {
    const bar = buildProgressBar(50, 10)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
  })

  it('should respect width parameter', () => {
    const bar = buildProgressBar(50, 4)
    expect(bar).toBeTruthy()
  })
})

// ─── formatProgressLines ────────────────────────────────

describe('formatProgressLines', () => {
  it('should produce one line per pattern', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 0, name: 'Test A', pattern: 'A', percentage: 100, severity: 'high', totalOccurrences: 0 },
      { category: 'syntax', files: 1, name: 'Test B', pattern: 'B', percentage: 0, severity: 'medium', totalOccurrences: 5 },
    ]
    const lines = formatProgressLines(patterns)
    expect(lines).toHaveLength(2)
  })

  it('should include pattern name', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 0, name: 'CJS to ESM', pattern: 'A', percentage: 100, severity: 'high', totalOccurrences: 0 },
    ]
    const lines = formatProgressLines(patterns)
    expect(lines[0]).toContain('CJS to ESM')
  })

  it('should sort by severity', () => {
    const patterns: MigrationProgress[] = [
      { category: 'syntax', files: 0, name: 'Low', pattern: 'A', percentage: 0, severity: 'low', totalOccurrences: 1 },
      { category: 'syntax', files: 0, name: 'High', pattern: 'B', percentage: 0, severity: 'high', totalOccurrences: 1 },
      { category: 'syntax', files: 0, name: 'Medium', pattern: 'C', percentage: 0, severity: 'medium', totalOccurrences: 1 },
    ]
    const lines = formatProgressLines(patterns)
    expect(lines[0]).toContain('High')
    expect(lines[1]).toContain('Medium')
    expect(lines[2]).toContain('Low')
  })
})

// ─── formatMigrationStats ───────────────────────────────

describe('formatMigrationStats', () => {
  it('should show completed count', () => {
    const stats = { byCategory: { syntax: 5 }, completedMigrations: 3, inProgressMigrations: 1, notStartedMigrations: 2, totalMigrations: 6, totalPatterns: 6 }
    const text = formatMigrationStats(stats)
    expect(text).toContain('Completed')
    expect(text).toContain('3/6')
  })

  it('should show category breakdown', () => {
    const stats = { byCategory: { syntax: 10, pattern: 5 }, completedMigrations: 0, inProgressMigrations: 0, notStartedMigrations: 2, totalMigrations: 2, totalPatterns: 2 }
    const text = formatMigrationStats(stats)
    expect(text).toContain('syntax')
    expect(text).toContain('pattern')
  })
})

// ─── formatOverallProgress ──────────────────────────────

describe('formatOverallProgress', () => {
  it('should show COMPLETE at 100%', () => {
    const text = formatOverallProgress(100)
    expect(text).toContain('COMPLETE')
  })

  it('should show IN PROGRESS at 50%', () => {
    const text = formatOverallProgress(50)
    expect(text).toContain('IN PROGRESS')
  })

  it('should show NEEDS WORK at 0%', () => {
    const text = formatOverallProgress(0)
    expect(text).toContain('NEEDS WORK')
  })

  it('should show percentage', () => {
    const text = formatOverallProgress(75)
    expect(text).toContain('75%')
  })
})

// ─── formatMigrationTable ───────────────────────────────

describe('formatMigrationTable', () => {
  it('should include overall progress', () => {
    const result = { matches: [], overallProgress: 50, patterns: [], stats: { byCategory: {}, completedMigrations: 0, inProgressMigrations: 0, notStartedMigrations: 0, totalMigrations: 0, totalPatterns: 0 } }
    const table = formatMigrationTable(result)
    expect(table).toContain('Overall Migration Progress')
  })
})

// ─── formatMigrationJson ────────────────────────────────

describe('formatMigrationJson', () => {
  it('should produce valid JSON', () => {
    const result = { matches: [], overallProgress: 100, patterns: [], stats: { byCategory: {}, completedMigrations: 0, inProgressMigrations: 0, notStartedMigrations: 0, totalMigrations: 0, totalPatterns: 0 } }
    const json = formatMigrationJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.overallProgress).toBe(100)
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Migration command', () => {
  it('should have correct description', () => {
    expect(Migration.description).toContain('igration')
  })

  it('should have path arg', () => {
    expect(Migration.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Migration.flags.format).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(Migration.flags.ignore).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Migration.flags.output).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Migration.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Migration.examples.length).toBeGreaterThan(0)
  })
})
