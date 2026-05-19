import { describe, it, expect } from 'vitest'

import {
  isTestFile,
  sourceBaseName,
  findTestFiles,
  getCoverageType,
  buildTestMapping,
  computeCoverageStats,
  generateCoverageSuggestions,
  buildCoverageResult,
  type TestMapping,
  type CoverageResult,
} from '../src/commands/coverage-helpers.js'

import {
  formatCoverageTable,
  formatCoverageJson,
} from '../src/commands/coverage-format-helpers.js'

import Coverage from '../src/commands/coverage.js'

// ─── isTestFile ─────────────────────────────────────────

describe('isTestFile', () => {
  it('should detect .test.ts files', () => {
    expect(isTestFile('app.test.ts')).toBe(true)
  })

  it('should detect .spec.ts files', () => {
    expect(isTestFile('app.spec.ts')).toBe(true)
  })

  it('should detect __tests__ directory', () => {
    expect(isTestFile('src/__tests__/app.ts')).toBe(true)
  })

  it('should detect test/ directory', () => {
    expect(isTestFile('test/app.ts')).toBe(true)
  })

  it('should detect tests/ directory', () => {
    expect(isTestFile('tests/app.ts')).toBe(true)
  })

  it('should not match regular source files', () => {
    expect(isTestFile('src/commands/count.ts')).toBe(false)
  })

  it('should not match files with test in name only', () => {
    expect(isTestFile('src/testing-utils.ts')).toBe(false)
  })

  it('should detect .test.js files', () => {
    expect(isTestFile('app.test.js')).toBe(true)
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('should return base name for simple file', () => {
    expect(sourceBaseName('utils.ts')).toBe('utils')
  })

  it('should strip -helpers suffix', () => {
    expect(sourceBaseName('count-helpers.ts')).toBe('count')
  })

  it('should strip -format-helpers suffix', () => {
    expect(sourceBaseName('count-format-helpers.ts')).toBe('count')
  })

  it('should handle path with directory', () => {
    expect(sourceBaseName('src/commands/count.ts')).toBe('count')
  })

  it('should handle nested path with -helpers', () => {
    expect(sourceBaseName('src/commands/coverage-helpers.ts')).toBe('coverage')
  })
})

// ─── findTestFiles ──────────────────────────────────────

describe('findTestFiles', () => {
  it('should find .test.ts match', () => {
    const all = ['test/count.test.ts', 'src/count.ts']
    expect(findTestFiles('src/count.ts', all)).toContain('test/count.test.ts')
  })

  it('should find .spec.ts match', () => {
    const all = ['test/count.spec.ts', 'src/count.ts']
    expect(findTestFiles('src/count.ts', all)).toContain('test/count.spec.ts')
  })

  it('should find helpers test from base name', () => {
    const all = ['test/count.test.ts', 'src/count-helpers.ts']
    expect(findTestFiles('src/count-helpers.ts', all)).toContain('test/count.test.ts')
  })

  it('should find format-helpers test from base name', () => {
    const all = ['test/count.test.ts', 'src/count-format-helpers.ts']
    expect(findTestFiles('src/count-format-helpers.ts', all)).toContain('test/count.test.ts')
  })

  it('should return empty array for no matches', () => {
    const all = ['src/orphan.ts']
    expect(findTestFiles('src/orphan.ts', all)).toEqual([])
  })

  it('should find multiple test files', () => {
    const all = ['test/app.test.ts', 'test/app.spec.ts', 'src/app.ts']
    const found = findTestFiles('src/app.ts', all)
    expect(found).toHaveLength(2)
  })
})

// ─── getCoverageType ────────────────────────────────────

describe('getCoverageType', () => {
  it('should return direct for .test. files', () => {
    expect(getCoverageType(['test/app.test.ts'])).toBe('direct')
  })

  it('should return direct for .spec. files', () => {
    expect(getCoverageType(['test/app.spec.ts'])).toBe('direct')
  })

  it('should return none for empty array', () => {
    expect(getCoverageType([])).toBe('none')
  })

  it('should return indirect for __tests__ files without .test.', () => {
    expect(getCoverageType(['src/__tests__/app.ts'])).toBe('indirect')
  })
})

// ─── buildTestMapping ───────────────────────────────────

describe('buildTestMapping', () => {
  it('should map source to test files', () => {
    const sources = ['src/count.ts']
    const all = ['src/count.ts', 'test/count.test.ts']
    const mappings = buildTestMapping(sources, all)
    expect(mappings).toHaveLength(1)
    expect(mappings[0].testFiles).toContain('test/count.test.ts')
    expect(mappings[0].covered).toBe(true)
    expect(mappings[0].coverageType).toBe('direct')
  })

  it('should mark uncovered files', () => {
    const sources = ['src/orphan.ts']
    const all = ['src/orphan.ts']
    const mappings = buildTestMapping(sources, all)
    expect(mappings[0].covered).toBe(false)
    expect(mappings[0].coverageType).toBe('none')
  })

  it('should handle multiple sources', () => {
    const sources = ['src/a.ts', 'src/b.ts']
    const all = ['src/a.ts', 'src/b.ts', 'test/a.test.ts']
    const mappings = buildTestMapping(sources, all)
    expect(mappings).toHaveLength(2)
    expect(mappings[0].covered).toBe(true)
    expect(mappings[1].covered).toBe(false)
  })

  it('should handle empty sources', () => {
    expect(buildTestMapping([], [])).toEqual([])
  })
})

// ─── computeCoverageStats ───────────────────────────────

describe('computeCoverageStats', () => {
  function makeMapping(source: string, testFiles: string[]): TestMapping {
    return {
      sourceFile: source,
      testFiles,
      covered: testFiles.length > 0,
      coverageType: testFiles.length > 0 ? 'direct' : 'none',
    }
  }

  it('should compute coverage percentage', () => {
    const mappings = [makeMapping('a.ts', ['a.test.ts']), makeMapping('b.ts', [])]
    const all = ['a.ts', 'b.ts', 'a.test.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.coveragePercentage).toBe(50)
  })

  it('should handle 100% coverage', () => {
    const mappings = [makeMapping('a.ts', ['a.test.ts'])]
    const all = ['a.ts', 'a.test.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.coveragePercentage).toBe(100)
  })

  it('should handle 0% coverage', () => {
    const mappings = [makeMapping('a.ts', [])]
    const all = ['a.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.coveragePercentage).toBe(0)
  })

  it('should compute total files', () => {
    const mappings = [makeMapping('a.ts', ['a.test.ts']), makeMapping('b.ts', [])]
    const all = ['a.ts', 'b.ts', 'a.test.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.totalSourceFiles).toBe(2)
    expect(stats.coveredFiles).toBe(1)
    expect(stats.uncoveredFiles).toBe(1)
  })

  it('should compute test to source ratio', () => {
    const mappings = [makeMapping('a.ts', ['a.test.ts']), makeMapping('b.ts', ['b.test.ts'])]
    const all = ['a.ts', 'b.ts', 'a.test.ts', 'b.test.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.testToSourceRatio).toBe(1)
  })

  it('should handle empty mappings', () => {
    const stats = computeCoverageStats([], [])
    expect(stats.totalSourceFiles).toBe(0)
    expect(stats.coveragePercentage).toBe(0)
    expect(stats.testToSourceRatio).toBe(0)
  })

  it('should group by directory', () => {
    const mappings = [
      makeMapping('src/a.ts', ['test/a.test.ts']),
      makeMapping('src/b.ts', []),
    ]
    const all = ['src/a.ts', 'src/b.ts', 'test/a.test.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.byDirectory['src']).toBeDefined()
    expect(stats.byDirectory['src'].source).toBe(2)
  })

  it('should identify uncovered modules', () => {
    const mappings = [makeMapping('lib/a.ts', [])]
    const all = ['lib/a.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.uncoveredModules).toContain('lib')
  })

  it('should count test files', () => {
    const mappings = [makeMapping('a.ts', ['a.test.ts', 'a.spec.ts'])]
    const all = ['a.ts', 'a.test.ts', 'a.spec.ts']
    const stats = computeCoverageStats(mappings, all)
    expect(stats.totalTestFiles).toBe(2)
  })
})

// ─── generateCoverageSuggestions ────────────────────────

describe('generateCoverageSuggestions', () => {
  function makeMapping(source: string, covered: boolean): TestMapping {
    return {
      sourceFile: source,
      testFiles: covered ? [source.replace('.ts', '.test.ts')] : [],
      covered,
      coverageType: covered ? 'direct' : 'none',
    }
  }

  it('should suggest for uncovered files', () => {
    const lengths = new Map<string, number>([['big.ts', 300]])
    const suggestions = generateCoverageSuggestions([makeMapping('big.ts', false)], lengths)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].file).toBe('big.ts')
  })

  it('should assign high priority to large files', () => {
    const lengths = new Map<string, number>([['big.ts', 300]])
    const suggestions = generateCoverageSuggestions([makeMapping('big.ts', false)], lengths)
    expect(suggestions[0].priority).toBe('high')
    expect(suggestions[0].estimatedEffort).toBe(2)
  })

  it('should assign medium priority to medium files', () => {
    const lengths = new Map<string, number>([['med.ts', 100]])
    const suggestions = generateCoverageSuggestions([makeMapping('med.ts', false)], lengths)
    expect(suggestions[0].priority).toBe('medium')
    expect(suggestions[0].estimatedEffort).toBe(1)
  })

  it('should assign low priority to small files', () => {
    const lengths = new Map<string, number>([['tiny.ts', 20]])
    const suggestions = generateCoverageSuggestions([makeMapping('tiny.ts', false)], lengths)
    expect(suggestions[0].priority).toBe('low')
    expect(suggestions[0].estimatedEffort).toBe(0.5)
  })

  it('should skip covered files', () => {
    const lengths = new Map<string, number>([['ok.ts', 100]])
    const suggestions = generateCoverageSuggestions([makeMapping('ok.ts', true)], lengths)
    expect(suggestions).toHaveLength(0)
  })

  it('should sort by priority high first', () => {
    const mappings = [makeMapping('tiny.ts', false), makeMapping('big.ts', false)]
    const lengths = new Map<string, number>([['tiny.ts', 20], ['big.ts', 300]])
    const suggestions = generateCoverageSuggestions(mappings, lengths)
    expect(suggestions[0].priority).toBe('high')
    expect(suggestions[1].priority).toBe('low')
  })

  it('should default to 0 lines when not in map', () => {
    const lengths = new Map<string, number>()
    const suggestions = generateCoverageSuggestions([makeMapping('x.ts', false)], lengths)
    expect(suggestions[0].priority).toBe('low')
    expect(suggestions[0].estimatedEffort).toBe(0.5)
  })
})

// ─── buildCoverageResult ────────────────────────────────

describe('buildCoverageResult', () => {
  it('should return empty for no files', async () => {
    const result = await buildCoverageResult([], async () => '', { ignorePatterns: [] })
    expect(result.stats.totalSourceFiles).toBe(0)
    expect(result.mappings).toHaveLength(0)
  })

  it('should identify source and test files', async () => {
    const files = ['src/app.ts', 'test/app.test.ts']
    const reader = async () => 'const x = 1\n'
    const result = await buildCoverageResult(files, reader, { ignorePatterns: [] })
    expect(result.stats.totalSourceFiles).toBe(1)
    expect(result.stats.coveragePercentage).toBe(100)
  })

  it('should detect uncovered files', async () => {
    const files = ['src/orphan.ts']
    const reader = async () => 'const x = 1\n'
    const result = await buildCoverageResult(files, reader, { ignorePatterns: [] })
    expect(result.stats.coveragePercentage).toBe(0)
    expect(result.stats.uncoveredFiles).toBe(1)
  })

  it('should handle mixed coverage', async () => {
    const files = ['src/a.ts', 'src/b.ts', 'test/a.test.ts']
    const reader = async () => 'const x = 1\n'
    const result = await buildCoverageResult(files, reader, { ignorePatterns: [] })
    expect(result.stats.coveredFiles).toBe(1)
    expect(result.stats.uncoveredFiles).toBe(1)
  })

  it('should generate suggestions for uncovered', async () => {
    const files = ['src/orphan.ts']
    const reader = async () => 'x\n'.repeat(100)
    const result = await buildCoverageResult(files, reader, { ignorePatterns: [] })
    expect(result.suggestions).toHaveLength(1)
  })

  it('should respect custom extensions', async () => {
    const files = ['src/app.py', 'test/app.test.py']
    const reader = async () => 'x = 1\n'
    const result = await buildCoverageResult(files, reader, { ignorePatterns: [], extensions: ['.py'] })
    expect(result.stats.totalSourceFiles).toBe(1)
  })

  it('should handle unreadable files', async () => {
    const files = ['src/bad.ts']
    const reader = async () => { throw new Error('not found') }
    const result = await buildCoverageResult(files, reader, { ignorePatterns: [] })
    expect(result.mappings).toHaveLength(1)
  })
})

// ─── formatCoverageTable ────────────────────────────────

describe('formatCoverageTable', () => {
  function makeResult(): CoverageResult {
    return {
      mappings: [{
        sourceFile: 'src/app.ts', testFiles: ['test/app.test.ts'],
        covered: true, coverageType: 'direct',
      }],
      stats: {
        byDirectory: { src: { source: 1, test: 1, percentage: 100 } },
        coveredFiles: 1, coveragePercentage: 100,
        testToSourceRatio: 1, totalSourceFiles: 1, totalTestFiles: 1,
        uncoveredFiles: 0, uncoveredModules: [],
      },
      suggestions: [],
    }
  }

  it('should contain header', () => {
    expect(formatCoverageTable(makeResult(), false)).toContain('Test Coverage')
  })

  it('should show coverage percentage', () => {
    expect(formatCoverageTable(makeResult(), false)).toContain('100%')
  })

  it('should show total line', () => {
    expect(formatCoverageTable(makeResult(), false)).toContain('Total')
  })

  it('should show directory breakdown', () => {
    expect(formatCoverageTable(makeResult(), false)).toContain('By Directory')
  })

  it('should show verbose file mappings', () => {
    expect(formatCoverageTable(makeResult(), true)).toContain('File Mappings')
  })

  it('should show uncovered modules', () => {
    const r = makeResult()
    r.stats.uncoveredModules = ['lib']
    expect(formatCoverageTable(r, false)).toContain('Uncovered Modules')
  })

  it('should show suggestions', () => {
    const r = makeResult()
    r.suggestions = [{ file: 'x.ts', reason: 'No test', priority: 'high', estimatedEffort: 1 }]
    expect(formatCoverageTable(r, false)).toContain('Suggestions')
  })

  it('should truncate suggestions at 10', () => {
    const r = makeResult()
    r.suggestions = Array.from({ length: 15 }, (_, i) => ({
      estimatedEffort: 0.5, file: `f${i}.ts`, priority: 'low' as const, reason: 'No test',
    }))
    const output = formatCoverageTable(r, false)
    expect(output).toContain('and 5 more')
  })

  it('should handle empty result', () => {
    const r: CoverageResult = {
      mappings: [],
      stats: {
        byDirectory: {}, coveredFiles: 0, coveragePercentage: 0,
        testToSourceRatio: 0, totalSourceFiles: 0, totalTestFiles: 0,
        uncoveredFiles: 0, uncoveredModules: [],
      },
      suggestions: [],
    }
    expect(formatCoverageTable(r, false)).toContain('Coverage')
  })
})

// ─── formatCoverageJson ─────────────────────────────────

describe('formatCoverageJson', () => {
  it('should produce valid JSON', () => {
    const r: CoverageResult = {
      mappings: [],
      stats: {
        byDirectory: {}, coveredFiles: 0, coveragePercentage: 0,
        testToSourceRatio: 0, totalSourceFiles: 0, totalTestFiles: 0,
        uncoveredFiles: 0, uncoveredModules: [],
      },
      suggestions: [],
    }
    expect(() => JSON.parse(formatCoverageJson(r))).not.toThrow()
  })

  it('should include mappings', () => {
    const r: CoverageResult = {
      mappings: [{
        sourceFile: 'a.ts', testFiles: ['a.test.ts'], covered: true, coverageType: 'direct',
      }],
      stats: {
        byDirectory: {}, coveredFiles: 1, coveragePercentage: 100,
        testToSourceRatio: 1, totalSourceFiles: 1, totalTestFiles: 1,
        uncoveredFiles: 0, uncoveredModules: [],
      },
      suggestions: [],
    }
    const parsed = JSON.parse(formatCoverageJson(r))
    expect(parsed.mappings).toHaveLength(1)
    expect(parsed.mappings[0].sourceFile).toBe('a.ts')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Coverage command', () => {
  it('should have correct description', () => {
    expect(Coverage.description).toContain('coverage')
  })

  it('should have path arg', () => {
    expect(Coverage.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Coverage.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Coverage.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(Coverage.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(Coverage.flags.ext).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Coverage.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Coverage.examples.length).toBeGreaterThan(0)
  })
})
