import { describe, it, expect } from 'vitest'

import {
  estimateMinifiedSize,
  estimateGzippedSize,
  computeImportCost,
  analyzeFileBundle,
  detectHeavyImports,
  generateSizeSuggestions,
  buildBundleSizeResult,
  type FileBundleInfo,
  type BundleAnalysis,
} from '../src/commands/bundlesize-helpers.js'

import {
  colorSize,
  sizeBar,
  formatBundleSizeTable,
  formatBundleSizeJson,
} from '../src/commands/bundlesize-format-helpers.js'

import Bundlesize from '../src/commands/bundlesize.js'

// ─── estimateMinifiedSize ────────────────────────────────

describe('estimateMinifiedSize', () => {
  it('should return ~50% of raw size', () => {
    expect(estimateMinifiedSize(1000)).toBe(500)
  })

  it('should return 0 for 0 input', () => {
    expect(estimateMinifiedSize(0)).toBe(0)
  })

  it('should round to integer', () => {
    expect(estimateMinifiedSize(101)).toBe(51)
  })

  it('should handle large sizes', () => {
    expect(estimateMinifiedSize(1_000_000)).toBe(500_000)
  })
})

// ─── estimateGzippedSize ─────────────────────────────────

describe('estimateGzippedSize', () => {
  it('should return ~35% of minified size', () => {
    expect(estimateGzippedSize(500)).toBe(175)
  })

  it('should return 0 for 0 input', () => {
    expect(estimateGzippedSize(0)).toBe(0)
  })

  it('should round to integer', () => {
    expect(estimateGzippedSize(100)).toBe(35)
  })

  it('should handle large sizes', () => {
    expect(estimateGzippedSize(500_000)).toBe(175_000)
  })
})

// ─── computeImportCost ───────────────────────────────────

describe('computeImportCost', () => {
  it('should return known size for lodash', () => {
    expect(computeImportCost('lodash')).toBe(72000)
  })

  it('should return known size for moment', () => {
    expect(computeImportCost('moment')).toBe(70000)
  })

  it('should return known size for rxjs', () => {
    expect(computeImportCost('rxjs')).toBe(50000)
  })

  it('should return default 5000 for unknown packages', () => {
    expect(computeImportCost('unknown-pkg')).toBe(5000)
  })

  it('should handle scoped packages by stripping scope', () => {
    expect(computeImportCost('@angular/core')).toBe(5000)
  })

  it('should return known size for three', () => {
    expect(computeImportCost('three')).toBe(600000)
  })

  it('should return known size for underscore', () => {
    expect(computeImportCost('underscore')).toBe(18000)
  })

  it('should return known size for d3', () => {
    expect(computeImportCost('d3')).toBe(250000)
  })

  it('should handle lodash-es as known', () => {
    expect(computeImportCost('lodash-es')).toBe(72000)
  })
})

// ─── analyzeFileBundle ───────────────────────────────────

describe('analyzeFileBundle', () => {
  it('should compute raw size in bytes', () => {
    const info = analyzeFileBundle('hello world', 'test.ts')
    expect(info.rawSize).toBe(11)
  })

  it('should compute estimated minified size', () => {
    const info = analyzeFileBundle('hello world', 'test.ts')
    expect(info.estimatedMinified).toBe(estimateMinifiedSize(info.rawSize))
  })

  it('should compute estimated gzipped size', () => {
    const info = analyzeFileBundle('hello world', 'test.ts')
    expect(info.estimatedGzipped).toBe(estimateGzippedSize(info.estimatedMinified))
  })

  it('should count lines', () => {
    const info = analyzeFileBundle('line1\nline2\nline3\n', 'test.ts')
    expect(info.lines).toBe(4)
  })

  it('should extract imports', () => {
    const code = "import { x } from 'lodash'\nconst y = 1\n"
    const info = analyzeFileBundle(code, 'test.ts')
    expect(info.imports).toEqual(['lodash'])
  })

  it('should compute import cost', () => {
    const code = "import _ from 'lodash'\n"
    const info = analyzeFileBundle(code, 'test.ts')
    expect(info.importCost).toBe(72000)
  })

  it('should sum costs for multiple imports', () => {
    const code = "import _ from 'lodash'\nimport m from 'moment'\n"
    const info = analyzeFileBundle(code, 'test.ts')
    expect(info.importCost).toBe(72000 + 70000)
  })

  it('should return empty imports for no imports', () => {
    const info = analyzeFileBundle('const x = 1\n', 'test.ts')
    expect(info.imports).toHaveLength(0)
    expect(info.importCost).toBe(0)
  })

  it('should handle empty content', () => {
    const info = analyzeFileBundle('', 'empty.ts')
    expect(info.rawSize).toBe(0)
    expect(info.lines).toBe(1)
    expect(info.imports).toHaveLength(0)
  })

  it('should preserve file path', () => {
    const info = analyzeFileBundle('x', 'src/app.ts')
    expect(info.file).toBe('src/app.ts')
  })
})

// ─── detectHeavyImports ──────────────────────────────────

describe('detectHeavyImports', () => {
  it('should return empty for no files', () => {
    expect(detectHeavyImports([])).toHaveLength(0)
  })

  it('should detect single import across one file', () => {
    const files: FileBundleInfo[] = [
      {
        estimatedGzipped: 100,
        estimatedMinified: 200,
        file: 'a.ts',
        importCost: 72000,
        imports: ['lodash'],
        lines: 10,
        rawSize: 500,
      },
    ]
    const heavy = detectHeavyImports(files)
    expect(heavy).toHaveLength(1)
    expect(heavy[0].importPath).toBe('lodash')
    expect(heavy[0].occurrenceCount).toBe(1)
  })

  it('should count occurrences across files', () => {
    const files: FileBundleInfo[] = [
      {
        estimatedGzipped: 100,
        estimatedMinified: 200,
        file: 'a.ts',
        importCost: 72000,
        imports: ['lodash'],
        lines: 10,
        rawSize: 500,
      },
      {
        estimatedGzipped: 100,
        estimatedMinified: 200,
        file: 'b.ts',
        importCost: 72000,
        imports: ['lodash'],
        lines: 10,
        rawSize: 500,
      },
    ]
    const heavy = detectHeavyImports(files)
    expect(heavy[0].occurrenceCount).toBe(2)
    expect(heavy[0].files).toEqual(['a.ts', 'b.ts'])
  })

  it('should not double-count same import in one file', () => {
    const files: FileBundleInfo[] = [
      {
        estimatedGzipped: 100,
        estimatedMinified: 200,
        file: 'a.ts',
        importCost: 72000,
        imports: ['lodash', 'lodash'],
        lines: 10,
        rawSize: 500,
      },
    ]
    const heavy = detectHeavyImports(files)
    expect(heavy[0].occurrenceCount).toBe(1)
  })

  it('should sort by impact (size * count)', () => {
    const files: FileBundleInfo[] = [
      {
        estimatedGzipped: 100,
        estimatedMinified: 200,
        file: 'a.ts',
        importCost: 5000,
        imports: ['small-lib'],
        lines: 10,
        rawSize: 500,
      },
      {
        estimatedGzipped: 100,
        estimatedMinified: 200,
        file: 'a.ts',
        importCost: 600000,
        imports: ['three'],
        lines: 10,
        rawSize: 500,
      },
    ]
    const heavy = detectHeavyImports(files)
    expect(heavy[0].importPath).toBe('three')
  })
})

// ─── generateSizeSuggestions ─────────────────────────────

describe('generateSizeSuggestions', () => {
  function makeAnalysis(overrides: Partial<BundleAnalysis> = {}): BundleAnalysis {
    return {
      files: [],
      heavyImports: [],
      largestFiles: [],
      totalGzipped: 0,
      totalMinified: 0,
      totalRaw: 0,
      ...overrides,
    }
  }

  it('should suggest tree-shaking for lodash', () => {
    const analysis = makeAnalysis({
      heavyImports: [{ estimatedSize: 72000, files: ['a.ts'], importPath: 'lodash', occurrenceCount: 1 }],
    })
    const suggestions = generateSizeSuggestions(analysis)
    expect(suggestions.some((s) => s.type === 'tree-shaking')).toBe(true)
  })

  it('should suggest alternative for moment', () => {
    const analysis = makeAnalysis({
      heavyImports: [{ estimatedSize: 70000, files: ['a.ts'], importPath: 'moment', occurrenceCount: 1 }],
    })
    const suggestions = generateSizeSuggestions(analysis)
    expect(suggestions.some((s) => s.type === 'alternative')).toBe(true)
  })

  it('should suggest code-splitting for large files', () => {
    const files: FileBundleInfo[] = [
      {
        estimatedGzipped: 30000,
        estimatedMinified: 60000,
        file: 'huge.ts',
        importCost: 0,
        imports: [],
        lines: 1000,
        rawSize: 100000,
      },
    ]
    const analysis = makeAnalysis({ files, largestFiles: files })
    const suggestions = generateSizeSuggestions(analysis)
    expect(suggestions.some((s) => s.type === 'code-splitting')).toBe(true)
  })

  it('should suggest removal for high import cost files', () => {
    const files: FileBundleInfo[] = [
      {
        estimatedGzipped: 500,
        estimatedMinified: 1000,
        file: 'costly.ts',
        importCost: 150000,
        imports: ['three', 'd3'],
        lines: 50,
        rawSize: 2000,
      },
    ]
    const analysis = makeAnalysis({ files })
    const suggestions = generateSizeSuggestions(analysis)
    expect(suggestions.some((s) => s.type === 'removal')).toBe(true)
  })

  it('should return empty for clean analysis', () => {
    const suggestions = generateSizeSuggestions(makeAnalysis())
    expect(suggestions).toHaveLength(0)
  })
})

// ─── buildBundleSizeResult ───────────────────────────────

describe('buildBundleSizeResult', () => {
  it('should return empty result for no files', async () => {
    const result = await buildBundleSizeResult(
      [],
      async () => '',
      { extensions: null, ignorePatterns: [], threshold: 0 },
    )
    expect(result.analysis.files).toHaveLength(0)
    expect(result.analysis.totalRaw).toBe(0)
  })

  it('should analyze provided files', async () => {
    const files = ['test.ts']
    const reader = async () => "import _ from 'lodash'\nconst x = 1\n"
    const result = await buildBundleSizeResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      threshold: 0,
    })
    expect(result.analysis.files).toHaveLength(1)
    expect(result.analysis.files[0].imports).toContain('lodash')
  })

  it('should compute totals', async () => {
    const files = ['a.ts', 'b.ts']
    const reader = async () => 'const x = 1\n'
    const result = await buildBundleSizeResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      threshold: 0,
    })
    expect(result.analysis.files).toHaveLength(2)
    expect(result.analysis.totalRaw).toBeGreaterThan(0)
    expect(result.analysis.totalMinified).toBeGreaterThan(0)
    expect(result.analysis.totalGzipped).toBeGreaterThan(0)
  })

  it('should filter by extension', async () => {
    const files = ['a.ts', 'b.js', 'c.css']
    const reader = async () => 'x'
    const result = await buildBundleSizeResult(files, reader, {
      extensions: ['.ts'],
      ignorePatterns: [],
      threshold: 0,
    })
    expect(result.analysis.files).toHaveLength(1)
    expect(result.analysis.files[0].file).toBe('a.ts')
  })

  it('should skip unreadable files', async () => {
    const files = ['missing.ts']
    const reader = async () => { throw new Error('not found') }
    const result = await buildBundleSizeResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      threshold: 0,
    })
    expect(result.analysis.files).toHaveLength(0)
  })

  it('should sort files by gzipped size descending', async () => {
    const files = ['small.ts', 'big.ts']
    let callCount = 0
    const reader = async () => {
      callCount++
      return callCount === 1 ? 'x'.repeat(100) : 'x'.repeat(1000)
    }
    const result = await buildBundleSizeResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      threshold: 0,
    })
    expect(result.analysis.files[0].rawSize).toBeGreaterThanOrEqual(
      result.analysis.files[1].rawSize,
    )
  })

  it('should generate suggestions when applicable', async () => {
    const files = ['heavy.ts']
    const reader = async () => "import _ from 'lodash'\n" + 'x'.repeat(50000)
    const result = await buildBundleSizeResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      threshold: 0,
    })
    expect(result.suggestions.length).toBeGreaterThan(0)
  })
})

// ─── colorSize ───────────────────────────────────────────

describe('colorSize', () => {
  it('should contain B for small sizes', () => {
    expect(colorSize(500)).toContain('B')
  })

  it('should contain KB for kilobyte sizes', () => {
    expect(colorSize(5000)).toContain('KB')
  })

  it('should contain MB for megabyte sizes', () => {
    expect(colorSize(2 * 1024 * 1024)).toContain('MB')
  })
})

// ─── sizeBar ─────────────────────────────────────────────

describe('sizeBar', () => {
  it('should produce full bar for max value', () => {
    const bar = sizeBar(100, 100, 10)
    expect(bar).toBe('██████████')
  })

  it('should produce empty bar for zero value', () => {
    const bar = sizeBar(0, 100, 10)
    expect(bar).toBe('          ')
  })

  it('should produce half bar for half value', () => {
    const bar = sizeBar(50, 100, 10)
    expect(bar).toBe('█████     ')
  })

  it('should handle zero max gracefully', () => {
    const bar = sizeBar(0, 0, 10)
    expect(bar).toBe('          ')
  })

  it('should clamp to width', () => {
    const bar = sizeBar(200, 100, 10)
    expect(bar).toBe('██████████')
  })
})

// ─── formatBundleSizeTable ───────────────────────────────

describe('formatBundleSizeTable', () => {
  function makeResult(): import('../src/commands/bundlesize-helpers.js').BundleSizeResult {
    return {
      analysis: {
        files: [
          {
            estimatedGzipped: 350,
            estimatedMinified: 1000,
            file: 'src/app.ts',
            importCost: 0,
            imports: [],
            lines: 20,
            rawSize: 2000,
          },
        ],
        heavyImports: [],
        largestFiles: [
          {
            estimatedGzipped: 350,
            estimatedMinified: 1000,
            file: 'src/app.ts',
            importCost: 0,
            imports: [],
            lines: 20,
            rawSize: 2000,
          },
        ],
        totalGzipped: 350,
        totalMinified: 1000,
        totalRaw: 2000,
      },
      suggestions: [],
    }
  }

  it('should contain Bundle Size Report header', () => {
    const result = formatBundleSizeTable(makeResult(), false)
    expect(result).toContain('Bundle Size Report')
  })

  it('should show file names in table', () => {
    const result = formatBundleSizeTable(makeResult(), false)
    expect(result).toContain('src/app.ts')
  })

  it('should show totals', () => {
    const result = formatBundleSizeTable(makeResult(), false)
    expect(result).toContain('Total')
  })

  it('should show heavy imports in verbose mode', () => {
    const r = makeResult()
    r.analysis.heavyImports = [
      { estimatedSize: 72000, files: ['a.ts'], importPath: 'lodash', occurrenceCount: 2 },
    ]
    const result = formatBundleSizeTable(r, true)
    expect(result).toContain('lodash')
  })

  it('should show suggestions when present', () => {
    const r = makeResult()
    r.suggestions = [
      {
        description: 'Replace lodash',
        effort: 'low' as const,
        estimatedSaving: 50000,
        type: 'tree-shaking' as const,
      },
    ]
    const result = formatBundleSizeTable(r, false)
    expect(result).toContain('Replace lodash')
  })

  it('should handle empty files', () => {
    const r = makeResult()
    r.analysis.files = []
    r.analysis.largestFiles = []
    const result = formatBundleSizeTable(r, false)
    expect(result).toContain('Bundle Size Report')
  })
})

// ─── formatBundleSizeJson ────────────────────────────────

describe('formatBundleSizeJson', () => {
  it('should produce valid JSON', () => {
    const r: import('../src/commands/bundlesize-helpers.js').BundleSizeResult = {
      analysis: {
        files: [],
        heavyImports: [],
        largestFiles: [],
        totalGzipped: 0,
        totalMinified: 0,
        totalRaw: 0,
      },
      suggestions: [],
    }
    expect(() => JSON.parse(formatBundleSizeJson(r))).not.toThrow()
  })

  it('should contain analysis key', () => {
    const r: import('../src/commands/bundlesize-helpers.js').BundleSizeResult = {
      analysis: {
        files: [],
        heavyImports: [],
        largestFiles: [],
        totalGzipped: 0,
        totalMinified: 0,
        totalRaw: 0,
      },
      suggestions: [],
    }
    const parsed = JSON.parse(formatBundleSizeJson(r))
    expect(parsed).toHaveProperty('analysis')
  })

  it('should serialize files with all fields', () => {
    const r: import('../src/commands/bundlesize-helpers.js').BundleSizeResult = {
      analysis: {
        files: [
          {
            estimatedGzipped: 100,
            estimatedMinified: 200,
            file: 'a.ts',
            importCost: 5000,
            imports: ['lodash'],
            lines: 10,
            rawSize: 500,
          },
        ],
        heavyImports: [],
        largestFiles: [],
        totalGzipped: 100,
        totalMinified: 200,
        totalRaw: 500,
      },
      suggestions: [],
    }
    const parsed = JSON.parse(formatBundleSizeJson(r))
    expect(parsed.analysis.files[0].file).toBe('a.ts')
    expect(parsed.analysis.files[0].imports).toContain('lodash')
  })
})

// ─── Command metadata ────────────────────────────────────

describe('Bundlesize command', () => {
  it('should have correct description', () => {
    expect(Bundlesize.description).toContain('bundle size')
  })

  it('should have path arg', () => {
    expect(Bundlesize.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Bundlesize.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Bundlesize.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(Bundlesize.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(Bundlesize.flags.ext).toBeDefined()
  })

  it('should have threshold flag', () => {
    expect(Bundlesize.flags.threshold).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Bundlesize.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Bundlesize.examples.length).toBeGreaterThan(0)
  })
})
