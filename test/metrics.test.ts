import { describe, expect, it } from 'vitest'

import Metrics from '../src/commands/metrics.js'
import {
  classifyLines,
  collectMetrics,
  computeAverages,
  countComplexity,
  countTodos,
  detectLanguage,
  type CodebaseMetrics,
  type LanguageMetric,
  type SizeMetric,
  type ComplexityMetric,
  type TodoMetric,
  type ExtensionMetric,
} from '../src/commands/metrics-helpers.js'
import { formatMetricsCsv, formatMetricsDashboard, formatMetricsJson } from '../src/commands/metrics-format-helpers.js'

// ─── Test data factories

function makeLanguageMetric(overrides: Partial<LanguageMetric> = {}): LanguageMetric {
  return {
    codeLines: 100,
    files: 5,
    language: 'TypeScript',
    percentage: 50,
    ...overrides,
  }
}

function makeSizeMetric(overrides: Partial<SizeMetric> = {}): SizeMetric {
  return {
    averageBytes: 500,
    largestFile: 'big.ts',
    largestSize: 2000,
    totalBytes: 5000,
    ...overrides,
  }
}

function makeComplexityMetric(overrides: Partial<ComplexityMetric> = {}): ComplexityMetric {
  return {
    averageComplexity: 12.5,
    maxComplexity: 30,
    maxComplexityFile: 'complex.ts',
    totalKeywords: 250,
    ...overrides,
  }
}

function makeTodoMetric(overrides: Partial<TodoMetric> = {}): TodoMetric {
  return {
    fixmes: 2,
    hacks: 1,
    todos: 5,
    total: 8,
    ...overrides,
  }
}

function makeExtensionMetric(overrides: Partial<ExtensionMetric> = {}): ExtensionMetric {
  return {
    count: 10,
    extension: '.ts',
    ...overrides,
  }
}

function makeCodebaseMetrics(overrides: Partial<CodebaseMetrics> = {}): CodebaseMetrics {
  return {
    blankLines: 50,
    codeLines: 500,
    commentLines: 100,
    complexity: makeComplexityMetric(),
    extensions: [makeExtensionMetric()],
    files: 20,
    languages: [makeLanguageMetric()],
    size: makeSizeMetric(),
    todos: makeTodoMetric(),
    totalLines: 650,
    ...overrides,
  }
}

// ─── Static metadata

describe('Metrics command - static metadata', () => {
  it('has a description', () => {
    expect(Metrics.description).toBe('Display codebase health metrics dashboard')
  })

  it('has examples array', () => {
    expect(Array.isArray(Metrics.examples)).toBe(true)
    expect(Metrics.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Metrics.args.path).toBeDefined()
    expect(Metrics.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Metrics.args.path.default).toBe('.')
  })
})

// ─── Flags

describe('Metrics command - flags', () => {
  it('has format flag with options', () => {
    expect(Metrics.flags.format.options).toContain('dashboard')
    expect(Metrics.flags.format.options).toContain('json')
    expect(Metrics.flags.format.options).toContain('csv')
  })

  it('defaults format to dashboard', () => {
    expect(Metrics.flags.format.default).toBe('dashboard')
  })

  it('has output flag', () => {
    expect(Metrics.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Metrics.flags.ignore).toBeDefined()
    expect(Metrics.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Metrics.flags.ext).toBeDefined()
  })

  it('has verbose flag defaulting to false', () => {
    expect(Metrics.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure

describe('Metrics command - class structure', () => {
  it('exports a default class', () => {
    expect(Metrics).toBeDefined()
    expect(typeof Metrics).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Metrics.prototype.run).toBe('function')
  })
})

// ─── detectLanguage

describe('detectLanguage', () => {
  it('detects TypeScript (.ts)', () => {
    expect(detectLanguage('file.ts')).toBe('TypeScript')
  })

  it('detects TypeScript (.tsx)', () => {
    expect(detectLanguage('file.tsx')).toBe('TypeScript')
  })

  it('detects JavaScript (.js)', () => {
    expect(detectLanguage('file.js')).toBe('JavaScript')
  })

  it('detects JavaScript (.jsx)', () => {
    expect(detectLanguage('file.jsx')).toBe('JavaScript')
  })

  it('detects Python', () => {
    expect(detectLanguage('file.py')).toBe('Python')
  })

  it('detects Rust', () => {
    expect(detectLanguage('file.rs')).toBe('Rust')
  })

  it('detects Go', () => {
    expect(detectLanguage('file.go')).toBe('Go')
  })

  it('detects Java', () => {
    expect(detectLanguage('file.java')).toBe('Java')
  })

  it('detects CSS', () => {
    expect(detectLanguage('file.css')).toBe('CSS')
  })

  it('detects HTML', () => {
    expect(detectLanguage('file.html')).toBe('HTML')
  })

  it('detects JSON', () => {
    expect(detectLanguage('file.json')).toBe('JSON')
  })

  it('detects Markdown', () => {
    expect(detectLanguage('file.md')).toBe('Markdown')
  })

  it('detects Ruby', () => {
    expect(detectLanguage('file.rb')).toBe('Ruby')
  })

  it('detects Shell', () => {
    expect(detectLanguage('file.sh')).toBe('Shell')
  })

  it('detects SQL', () => {
    expect(detectLanguage('file.sql')).toBe('SQL')
  })

  it('detects YAML (.yaml)', () => {
    expect(detectLanguage('file.yaml')).toBe('YAML')
  })

  it('detects YAML (.yml)', () => {
    expect(detectLanguage('file.yml')).toBe('YAML')
  })

  it('detects XML', () => {
    expect(detectLanguage('file.xml')).toBe('XML')
  })

  it('returns Unknown for unrecognized extensions', () => {
    expect(detectLanguage('file.xyz')).toBe('Unknown')
  })

  it('returns Unknown for no extension', () => {
    expect(detectLanguage('Makefile')).toBe('Unknown')
  })

  it('handles path with directories', () => {
    expect(detectLanguage('src/utils/helper.ts')).toBe('TypeScript')
  })
})

// ─── countComplexity

describe('countComplexity', () => {
  it('counts if statements', () => {
    expect(countComplexity('if (x) { }')).toBe(1)
  })

  it('counts else branches', () => {
    expect(countComplexity('if (x) { } else { }')).toBe(2)
  })

  it('counts for loops', () => {
    expect(countComplexity('for (let i = 0; i < n; i++) { }')).toBe(1)
  })

  it('counts while loops', () => {
    expect(countComplexity('while (true) { }')).toBe(1)
  })

  it('counts switch statements', () => {
    expect(countComplexity('switch (x) { }')).toBe(1)
  })

  it('counts catch blocks', () => {
    expect(countComplexity('try { } catch (e) { }')).toBe(1)
  })

  it('counts ternary operators', () => {
    expect(countComplexity('const x = a ? b : c')).toBe(1)
  })

  it('counts logical AND', () => {
    expect(countComplexity('if (a && b) { }')).toBe(2)
  })

  it('counts logical OR', () => {
    expect(countComplexity('if (a || b) { }')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countComplexity('')).toBe(0)
  })

  it('returns 0 for code without complexity keywords', () => {
    expect(countComplexity('const x = 1;')).toBe(0)
  })

  it('counts multiple keywords in multi-line content', () => {
    const code = `if (x) {
  for (let i = 0; i < n; i++) {
    if (y) { }
  }
} else {
  switch (z) { }
}`
    expect(countComplexity(code)).toBe(5)
  })
})

// ─── countTodos

describe('countTodos', () => {
  it('counts TODO comments', () => {
    expect(countTodos('// TODO: fix this').todos).toBe(1)
  })

  it('counts FIXME comments', () => {
    expect(countTodos('// FIXME: broken').fixmes).toBe(1)
  })

  it('counts HACK comments', () => {
    expect(countTodos('// HACK: workaround').hacks).toBe(1)
  })

  it('computes total correctly', () => {
    const result = countTodos('// TODO: fix\n// FIXME: broken\n// HACK: temp')
    expect(result.total).toBe(3)
  })

  it('returns zero for content without markers', () => {
    const result = countTodos('const x = 1;')
    expect(result.total).toBe(0)
    expect(result.todos).toBe(0)
    expect(result.fixmes).toBe(0)
    expect(result.hacks).toBe(0)
  })

  it('handles multiple TODOs on same line', () => {
    expect(countTodos('TODO and TODO').todos).toBe(2)
  })

  it('is case-insensitive', () => {
    const result = countTodos('todo Todo TODO')
    expect(result.todos).toBe(3)
  })
})

// ─── classifyLines

describe('classifyLines', () => {
  it('counts code lines', () => {
    const result = classifyLines('const x = 1;\nconst y = 2;', 'TypeScript')
    expect(result.code).toBe(2)
  })

  it('counts blank lines', () => {
    const result = classifyLines('\n\n', 'TypeScript')
    expect(result.blank).toBe(3)
  })

  it('counts comment lines', () => {
    const result = classifyLines('// comment\nconst x = 1;', 'TypeScript')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('handles empty string', () => {
    const result = classifyLines('', 'TypeScript')
    expect(result.code).toBe(0)
    expect(result.blank).toBe(0)
    expect(result.comment).toBe(0)
  })

  it('handles hash-style comments', () => {
    const result = classifyLines('# comment\nx = 1', 'Python')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('treats JSON as all code', () => {
    const result = classifyLines('{\n  "key": "value"\n}', 'JSON')
    expect(result.code).toBe(3)
  })
})

// ─── computeAverages

describe('computeAverages', () => {
  it('computes comment ratio', () => {
    const metrics = makeCodebaseMetrics({
      commentLines: 100,
      totalLines: 500,
    })
    const result = computeAverages(metrics)
    expect(result.commentRatio).toBe(0.2)
  })

  it('handles zero lines', () => {
    const metrics = makeCodebaseMetrics({
      commentLines: 0,
      totalLines: 0,
      files: 0,
      size: makeSizeMetric({ totalBytes: 0 }),
    })
    const result = computeAverages(metrics)
    expect(result.commentRatio).toBe(0)
    expect(result.avgFileSize).toBe(0)
    expect(result.avgLinesPerFile).toBe(0)
  })

  it('returns low rating for low complexity', () => {
    const metrics = makeCodebaseMetrics({
      complexity: makeComplexityMetric({ averageComplexity: 5 }),
    })
    const result = computeAverages(metrics)
    expect(result.complexityRating).toBe('low')
  })

  it('returns medium rating for medium complexity', () => {
    const metrics = makeCodebaseMetrics({
      complexity: makeComplexityMetric({ averageComplexity: 15 }),
    })
    const result = computeAverages(metrics)
    expect(result.complexityRating).toBe('medium')
  })

  it('returns high rating for high complexity', () => {
    const metrics = makeCodebaseMetrics({
      complexity: makeComplexityMetric({ averageComplexity: 30 }),
    })
    const result = computeAverages(metrics)
    expect(result.complexityRating).toBe('high')
  })

  it('computes avg lines per file', () => {
    const metrics = makeCodebaseMetrics({
      files: 10,
      totalLines: 500,
    })
    const result = computeAverages(metrics)
    expect(result.avgLinesPerFile).toBe(50)
  })
})

// ─── formatMetricsDashboard

describe('formatMetricsDashboard', () => {
  it('contains Files section header', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('Files')
  })

  it('contains Lines section header', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('Lines')
  })

  it('contains Size section header', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('Size')
  })

  it('contains Complexity section header', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('Complexity')
  })

  it('contains TODOs section header', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('TODOs')
  })

  it('contains Extensions section header', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('Extensions')
  })

  it('shows file count', () => {
    const metrics = makeCodebaseMetrics({ files: 42 })
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('42')
  })

  it('shows language breakdown', () => {
    const metrics = makeCodebaseMetrics({
      languages: [makeLanguageMetric({ language: 'TypeScript', files: 10, percentage: 100 })],
    })
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('TypeScript')
  })

  it('shows complexity rating', () => {
    const metrics = makeCodebaseMetrics({
      complexity: makeComplexityMetric({ averageComplexity: 5 }),
    })
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('LOW')
  })

  it('shows largest file', () => {
    const metrics = makeCodebaseMetrics({
      size: makeSizeMetric({ largestFile: 'huge.ts' }),
    })
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('huge.ts')
  })

  it('handles empty extensions gracefully', () => {
    const metrics = makeCodebaseMetrics({ extensions: [] })
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('Extensions')
  })
})

// ─── formatMetricsCsv

describe('formatMetricsCsv', () => {
  it('produces CSV with headers', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsCsv(metrics)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Metric,Value')
  })

  it('includes file count', () => {
    const metrics = makeCodebaseMetrics({ files: 42 })
    const output = formatMetricsCsv(metrics)
    expect(output).toContain('files,42')
  })

  it('includes line counts', () => {
    const metrics = makeCodebaseMetrics({ totalLines: 1000, codeLines: 800, blankLines: 100, commentLines: 100 })
    const output = formatMetricsCsv(metrics)
    expect(output).toContain('totalLines,1000')
    expect(output).toContain('codeLines,800')
  })

  it('includes language data', () => {
    const metrics = makeCodebaseMetrics({
      languages: [makeLanguageMetric({ language: 'TypeScript', files: 10 })],
    })
    const output = formatMetricsCsv(metrics)
    expect(output).toContain('lang:TypeScript:files,10')
  })

  it('includes extension data', () => {
    const metrics = makeCodebaseMetrics({
      extensions: [makeExtensionMetric({ extension: '.ts', count: 15 })],
    })
    const output = formatMetricsCsv(metrics)
    expect(output).toContain('ext:.ts,15')
  })
})

// ─── formatMetricsJson

describe('formatMetricsJson', () => {
  it('produces valid JSON', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsJson(metrics)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains files count', () => {
    const metrics = makeCodebaseMetrics({ files: 42 })
    const output = formatMetricsJson(metrics)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBe(42)
  })

  it('contains languages array', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsJson(metrics)
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed.languages)).toBe(true)
  })

  it('contains size object', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsJson(metrics)
    const parsed = JSON.parse(output)
    expect(parsed.size).toBeDefined()
    expect(parsed.size.totalBytes).toBe(5000)
  })

  it('contains complexity object', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsJson(metrics)
    const parsed = JSON.parse(output)
    expect(parsed.complexity).toBeDefined()
    expect(parsed.complexity.averageComplexity).toBe(12.5)
  })

  it('contains todos object', () => {
    const metrics = makeCodebaseMetrics()
    const output = formatMetricsJson(metrics)
    const parsed = JSON.parse(output)
    expect(parsed.todos).toBeDefined()
    expect(parsed.todos.total).toBe(8)
  })

  it('preserves extension data', () => {
    const metrics = makeCodebaseMetrics({
      extensions: [makeExtensionMetric({ extension: '.py', count: 7 })],
    })
    const output = formatMetricsJson(metrics)
    const parsed = JSON.parse(output)
    expect(parsed.extensions[0].extension).toBe('.py')
    expect(parsed.extensions[0].count).toBe(7)
  })
})
