import { describe, expect, it } from 'vitest'
import {
  buildValueFlowResult,
  computeStats,
  detectDeadEnds,
  detectUntraced,
  extractSinks,
  extractSources,
  extractTransforms,
  generateRecommendations,
  traceFlow,
  type ValueFlow,
  type ValueFlowStats,
  type ValueSink,
  type ValueSource,
  type ValueTransform,
} from '../src/commands/value-flow-helpers.js'
import {
  coverageMeter,
  formatFlowChain,
  formatRecommendations,
  formatSinksTable,
  formatSourcesTable,
  formatStats,
  formatTransformsTable,
  formatValueFlowJson,
  formatValueFlowOutput,
} from '../src/commands/value-flow-format-helpers.js'

// ─── extractSources ───────────────────────────────────────────────────────────

describe('extractSources', () => {
  it('extracts import sources', () => {
    const sources = extractSources('import fs from "fs"', 'a.ts')
    expect(sources.some((s) => s.name === 'fs' && s.type === 'import')).toBe(true)
  })

  it('extracts destructured imports', () => {
    const sources = extractSources('import { read, write } from "fs"', 'a.ts')
    expect(sources.some((s) => s.name === 'read')).toBe(true)
    expect(sources.some((s) => s.name === 'write')).toBe(true)
  })

  it('extracts require sources', () => {
    const sources = extractSources('const path = require("path")', 'a.ts')
    expect(sources.some((s) => s.name === 'path' && s.type === 'import')).toBe(true)
  })

  it('extracts env vars', () => {
    const sources = extractSources('const port = process.env.PORT', 'a.ts')
    expect(sources.some((s) => s.name === 'PORT' && s.type === 'env-var')).toBe(true)
  })

  it('extracts function parameters', () => {
    const sources = extractSources('function greet(name, age) {}', 'a.ts')
    expect(sources.some((s) => s.name === 'name' && s.type === 'parameter')).toBe(true)
    expect(sources.some((s) => s.name === 'age' && s.type === 'parameter')).toBe(true)
  })

  it('extracts arrow function parameters', () => {
    const sources = extractSources('const fn = (input) => input * 2', 'a.ts')
    expect(sources.some((s) => s.name === 'input' && s.type === 'parameter')).toBe(true)
  })

  it('extracts config reads', () => {
    const sources = extractSources('const port = config.port', 'a.ts')
    expect(sources.some((s) => s.name === 'config.port' && s.type === 'config')).toBe(true)
  })

  it('returns empty for plain code', () => {
    const sources = extractSources('const x = 1', 'a.ts')
    expect(sources.length).toBe(0)
  })

  it('extracts namespace imports', () => {
    const sources = extractSources('import * as lib from "lib"', 'a.ts')
    expect(sources.some((s) => s.name === 'lib')).toBe(true)
  })

  it('records correct line numbers', () => {
    const sources = extractSources('\n\nimport fs from "fs"', 'a.ts')
    const fsSource = sources.find((s) => s.name === 'fs')
    expect(fsSource!.line).toBe(3)
  })
})

// ─── extractTransforms ────────────────────────────────────────────────────────

describe('extractTransforms', () => {
  it('extracts map transforms', () => {
    const transforms = extractTransforms('const result = data.map(fn)', 'a.ts')
    expect(transforms.some((t) => t.type === 'map')).toBe(true)
  })

  it('extracts filter transforms', () => {
    const transforms = extractTransforms('const active = items.filter(isActive)', 'a.ts')
    expect(transforms.some((t) => t.type === 'filter')).toBe(true)
  })

  it('extracts reduce transforms', () => {
    const transforms = extractTransforms('const total = nums.reduce(sum)', 'a.ts')
    expect(transforms.some((t) => t.type === 'reduce')).toBe(true)
  })

  it('extracts parse transforms', () => {
    const transforms = extractTransforms('const num = parseInt(val)', 'a.ts')
    expect(transforms.some((t) => t.type === 'parse')).toBe(true)
  })

  it('extracts function-call transforms', () => {
    const transforms = extractTransforms('const result = compute(input)', 'a.ts')
    expect(transforms.some((t) => t.type === 'function-call')).toBe(true)
  })

  it('extracts assignment transforms', () => {
    const transforms = extractTransforms('const y = x', 'a.ts')
    expect(transforms.some((t) => t.type === 'assignment')).toBe(true)
  })

  it('skips comment lines', () => {
    const transforms = extractTransforms('// const y = x.map(fn)', 'a.ts')
    expect(transforms.length).toBe(0)
  })

  it('skips JSDoc lines', () => {
    const transforms = extractTransforms(' * const y = x.map(fn)', 'a.ts')
    expect(transforms.length).toBe(0)
  })

  it('returns empty for no transforms', () => {
    expect(extractTransforms('function foo() {}', 'a.ts').length).toBe(0)
  })

  it('extracts method calls on arrays', () => {
    const transforms = extractTransforms('items.forEach(fn)', 'a.ts')
    expect(transforms.some((t) => t.type === 'method-call')).toBe(true)
  })
})

// ─── extractSinks ─────────────────────────────────────────────────────────────

describe('extractSinks', () => {
  it('extracts return sinks', () => {
    const sinks = extractSinks('return result', 'a.ts')
    expect(sinks.some((s) => s.type === 'return')).toBe(true)
  })

  it('extracts export sinks', () => {
    const sinks = extractSinks('export function main() {}', 'a.ts')
    expect(sinks.some((s) => s.type === 'export' && s.name === 'main')).toBe(true)
  })

  it('extracts console sinks', () => {
    const sinks = extractSinks('console.log(msg)', 'a.ts')
    expect(sinks.some((s) => s.type === 'console')).toBe(true)
  })

  it('extracts console.warn sinks', () => {
    const sinks = extractSinks('console.warn(err)', 'a.ts')
    expect(sinks.some((s) => s.name === 'console.warn')).toBe(true)
  })

  it('extracts file-write sinks', () => {
    const sinks = extractSinks('writeFileSync("out.txt", data)', 'a.ts')
    expect(sinks.some((s) => s.type === 'file-write')).toBe(true)
  })

  it('extracts network sinks', () => {
    const sinks = extractSinks('fetch("https://api.example.com")', 'a.ts')
    expect(sinks.some((s) => s.type === 'network')).toBe(true)
  })

  it('returns empty for no sinks', () => {
    expect(extractSinks('const x = 1', 'a.ts').length).toBe(0)
  })

  it('extracts export default sinks', () => {
    const sinks = extractSinks('export default class App {}', 'a.ts')
    expect(sinks.some((s) => s.type === 'export' && s.name === 'App')).toBe(true)
  })
})

// ─── traceFlow ────────────────────────────────────────────────────────────────

describe('traceFlow', () => {
  it('traces from source through transforms to sink', () => {
    const source: ValueSource = { name: 'input', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] }
    const transforms: ValueTransform[] = [
      { input: 'input', output: 'processed', file: 'a.ts', line: 2, type: 'map', description: 'input.map() → processed' },
    ]
    const sinks: ValueSink[] = [
      { name: 'return:processed', file: 'a.ts', line: 3, type: 'return', sources: ['processed'] },
    ]
    const flow = traceFlow(source, transforms, sinks)
    expect(flow.chain.length).toBe(3)
    expect(flow.chain[0]!.name).toBe('input')
    expect(flow.chain[1]!.name).toBe('processed')
    expect(flow.sink).not.toBeNull()
    expect(flow.isDeadEnd).toBe(false)
  })

  it('detects dead-end when no matching sink', () => {
    const source: ValueSource = { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] }
    const flow = traceFlow(source, [], [])
    expect(flow.isDeadEnd).toBe(true)
    expect(flow.sink).toBeNull()
  })

  it('detects validation from filter transform', () => {
    const source: ValueSource = { name: 'data', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] }
    const transforms: ValueTransform[] = [
      { input: 'data', output: 'valid', file: 'a.ts', line: 2, type: 'filter', description: 'data.filter() → valid' },
    ]
    const sinks: ValueSink[] = [
      { name: 'return:valid', file: 'a.ts', line: 3, type: 'return', sources: ['valid'] },
    ]
    const flow = traceFlow(source, transforms, sinks)
    expect(flow.hasValidation).toBe(true)
  })

  it('detects validation from parse transform', () => {
    const source: ValueSource = { name: 'raw', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] }
    const transforms: ValueTransform[] = [
      { input: 'raw', output: 'parsed', file: 'a.ts', line: 2, type: 'parse', description: 'parse → parsed' },
    ]
    const flow = traceFlow(source, transforms, [])
    expect(flow.hasValidation).toBe(true)
  })

  it('avoids cycles', () => {
    const source: ValueSource = { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] }
    const transforms: ValueTransform[] = [
      { input: 'x', output: 'x', file: 'a.ts', line: 2, type: 'assignment', description: 'x → x' },
    ]
    const flow = traceFlow(source, transforms, [])
    expect(flow.chain.length).toBe(1)
  })
})

// ─── detectDeadEnds ───────────────────────────────────────────────────────────

describe('detectDeadEnds', () => {
  it('finds dead-end flows', () => {
    const flows: ValueFlow[] = [
      {
        chain: [{ name: 'x', file: 'a.ts', line: 1, type: 'parameter' }],
        source: { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
        sink: null, length: 1, isDeadEnd: true, hasValidation: false, hasErrorHandling: false,
      },
    ]
    expect(detectDeadEnds(flows).length).toBe(1)
  })

  it('excludes flows with sinks', () => {
    const flows: ValueFlow[] = [
      {
        chain: [{ name: 'x', file: 'a.ts', line: 1, type: 'parameter' }],
        source: { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
        sink: { name: 'return:x', file: 'a.ts', line: 2, type: 'return', sources: ['x'] },
        length: 1, isDeadEnd: false, hasValidation: false, hasErrorHandling: false,
      },
    ]
    expect(detectDeadEnds(flows).length).toBe(0)
  })
})

// ─── detectUntraced ───────────────────────────────────────────────────────────

describe('detectUntraced', () => {
  it('finds flows without validation or error handling', () => {
    const flows: ValueFlow[] = [
      {
        chain: [{ name: 'x', file: 'a.ts', line: 1, type: 'parameter' }],
        source: { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
        sink: { name: 'return:x', file: 'a.ts', line: 2, type: 'return', sources: ['x'] },
        length: 1, isDeadEnd: false, hasValidation: false, hasErrorHandling: false,
      },
    ]
    expect(detectUntraced(flows).length).toBe(1)
  })

  it('excludes flows with validation', () => {
    const flows: ValueFlow[] = [
      {
        chain: [{ name: 'x', file: 'a.ts', line: 1, type: 'parameter' }],
        source: { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
        sink: { name: 'return:x', file: 'a.ts', line: 2, type: 'return', sources: ['x'] },
        length: 1, isDeadEnd: false, hasValidation: true, hasErrorHandling: false,
      },
    ]
    expect(detectUntraced(flows).length).toBe(0)
  })

  it('excludes dead-end flows', () => {
    const flows: ValueFlow[] = [
      {
        chain: [{ name: 'x', file: 'a.ts', line: 1, type: 'parameter' }],
        source: { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
        sink: null, length: 1, isDeadEnd: true, hasValidation: false, hasErrorHandling: false,
      },
    ]
    expect(detectUntraced(flows).length).toBe(0)
  })
})

// ─── computeStats ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('computes correct stats', () => {
    const sources: ValueSource[] = [
      { name: 'a', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
    ]
    const transforms: ValueTransform[] = [
      { input: 'a', output: 'b', file: 'a.ts', line: 2, type: 'map', description: 'a → b' },
    ]
    const sinks: ValueSink[] = [
      { name: 'return:b', file: 'a.ts', line: 3, type: 'return', sources: ['b'] },
    ]
    const flows: ValueFlow[] = [
      {
        chain: [{ name: 'a', file: 'a.ts', line: 1, type: 'parameter' }, { name: 'b', file: 'a.ts', line: 2, type: 'map' }],
        source: sources[0]!, sink: sinks[0]!, length: 2, isDeadEnd: false, hasValidation: true, hasErrorHandling: false,
      },
    ]
    const stats = computeStats(sources, transforms, sinks, flows)
    expect(stats.totalSources).toBe(1)
    expect(stats.totalTransforms).toBe(1)
    expect(stats.totalSinks).toBe(1)
    expect(stats.deadEndCount).toBe(0)
    expect(stats.validationCoverage).toBe(100)
  })

  it('handles empty flows', () => {
    const stats = computeStats([], [], [], [])
    expect(stats.averageFlowLength).toBe(0)
    expect(stats.longestFlow).toBe(0)
    expect(stats.validationCoverage).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('warns about dead ends', () => {
    const deadEnds: ValueFlow[] = [
      {
        chain: [{ name: 'unused', file: 'a.ts', line: 1, type: 'parameter' }],
        source: { name: 'unused', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
        sink: null, length: 1, isDeadEnd: true, hasValidation: false, hasErrorHandling: false,
      },
    ]
    const stats: ValueFlowStats = {
      totalSources: 5, totalTransforms: 3, totalSinks: 3,
      deadEndCount: 1, untracedCount: 0, averageFlowLength: 2,
      longestFlow: 4, validationCoverage: 80, errorHandlingCoverage: 70,
    }
    const recs = generateRecommendations(deadEnds, [], stats)
    expect(recs.some((r) => r.includes('dead-end'))).toBe(true)
  })

  it('warns about untraced values', () => {
    const untraced: ValueFlow[] = [
      {
        chain: [{ name: 'raw', file: 'a.ts', line: 1, type: 'parameter' }],
        source: { name: 'raw', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
        sink: { name: 'return:raw', file: 'a.ts', line: 2, type: 'return', sources: ['raw'] },
        length: 1, isDeadEnd: false, hasValidation: false, hasErrorHandling: false,
      },
    ]
    const stats: ValueFlowStats = {
      totalSources: 5, totalTransforms: 3, totalSinks: 3,
      deadEndCount: 0, untracedCount: 1, averageFlowLength: 2,
      longestFlow: 4, validationCoverage: 80, errorHandlingCoverage: 70,
    }
    const recs = generateRecommendations([], untraced, stats)
    expect(recs.some((r) => r.includes('untraced'))).toBe(true)
  })

  it('warns about low validation coverage', () => {
    const stats: ValueFlowStats = {
      totalSources: 5, totalTransforms: 3, totalSinks: 3,
      deadEndCount: 0, untracedCount: 0, averageFlowLength: 2,
      longestFlow: 4, validationCoverage: 20, errorHandlingCoverage: 70,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('Validation coverage'))).toBe(true)
  })

  it('warns about long flow chains', () => {
    const stats: ValueFlowStats = {
      totalSources: 5, totalTransforms: 3, totalSinks: 3,
      deadEndCount: 0, untracedCount: 0, averageFlowLength: 2,
      longestFlow: 10, validationCoverage: 80, errorHandlingCoverage: 70,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('10 steps'))).toBe(true)
  })

  it('returns healthy message when all good', () => {
    const stats: ValueFlowStats = {
      totalSources: 3, totalTransforms: 2, totalSinks: 3,
      deadEndCount: 0, untracedCount: 0, averageFlowLength: 2,
      longestFlow: 3, validationCoverage: 90, errorHandlingCoverage: 85,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildValueFlowResult ─────────────────────────────────────────────────────

describe('buildValueFlowResult', () => {
  it('returns complete result', () => {
    const result = buildValueFlowResult(
      ['a.ts'],
      ['import fs from "fs"\nconst data = fs.readFile()\nconst result = data.map(fn)\nreturn result'],
    )
    expect(result.sources.length).toBeGreaterThan(0)
    expect(result.stats.totalSources).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty files', () => {
    const result = buildValueFlowResult([], [])
    expect(result.stats.totalSources).toBe(0)
    expect(result.flows.length).toBe(0)
  })

  it('traces a complete flow', () => {
    const result = buildValueFlowResult(
      ['a.ts'],
      ['function process(input) {\n  const cleaned = input.filter(Boolean)\n  return cleaned\n}'],
    )
    expect(result.sources.some((s) => s.name === 'input')).toBe(true)
    expect(result.transforms.length).toBeGreaterThan(0)
    expect(result.sinks.length).toBeGreaterThan(0)
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('coverageMeter', () => {
  it('renders meter with percentage', () => {
    const meter = coverageMeter(75)
    expect(meter).toContain('75%')
    expect(meter).toContain('█')
  })

  it('renders 0%', () => {
    const meter = coverageMeter(0)
    expect(meter).toContain('0%')
  })
})

describe('formatFlowChain', () => {
  it('formats chain with arrows', () => {
    const flow: ValueFlow = {
      chain: [
        { name: 'input', file: 'a.ts', line: 1, type: 'parameter' },
        { name: 'result', file: 'a.ts', line: 2, type: 'map' },
      ],
      source: { name: 'input', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
      sink: null, length: 2, isDeadEnd: false, hasValidation: false, hasErrorHandling: false,
    }
    const formatted = formatFlowChain(flow)
    expect(formatted).toContain('input')
    expect(formatted).toContain('result')
  })

  it('shows DEAD-END badge', () => {
    const flow: ValueFlow = {
      chain: [{ name: 'x', file: 'a.ts', line: 1, type: 'parameter' }],
      source: { name: 'x', file: 'a.ts', line: 1, type: 'parameter', dataType: 'unknown', flowsTo: [] },
      sink: null, length: 1, isDeadEnd: true, hasValidation: false, hasErrorHandling: false,
    }
    const formatted = formatFlowChain(flow)
    expect(formatted).toContain('DEAD-END')
  })
})

describe('formatSourcesTable', () => {
  it('returns (no sources) for empty', () => {
    expect(formatSourcesTable([])).toContain('(no sources)')
  })

  it('includes source data', () => {
    const sources: ValueSource[] = [
      { name: 'fs', file: 'a.ts', line: 1, type: 'import', dataType: 'module', flowsTo: [] },
    ]
    const table = formatSourcesTable(sources)
    expect(table).toContain('fs')
    expect(table).toContain('import')
  })
})

describe('formatSinksTable', () => {
  it('returns (no sinks) for empty', () => {
    expect(formatSinksTable([])).toContain('(no sinks)')
  })

  it('includes sink data', () => {
    const sinks: ValueSink[] = [
      { name: 'return:x', file: 'a.ts', line: 5, type: 'return', sources: ['x'] },
    ]
    const table = formatSinksTable(sinks)
    expect(table).toContain('return:x')
  })
})

describe('formatTransformsTable', () => {
  it('returns (no transforms) for empty', () => {
    expect(formatTransformsTable([])).toContain('(no transforms)')
  })

  it('includes transform data', () => {
    const transforms: ValueTransform[] = [
      { input: 'data', output: 'result', file: 'a.ts', line: 3, type: 'map', description: 'data.map() → result' },
    ]
    const table = formatTransformsTable(transforms)
    expect(table).toContain('data')
    expect(table).toContain('result')
  })
})

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: ValueFlowStats = {
      totalSources: 10, totalTransforms: 8, totalSinks: 6,
      deadEndCount: 2, untracedCount: 1, averageFlowLength: 2.5,
      longestFlow: 5, validationCoverage: 75, errorHandlingCoverage: 60,
    }
    const formatted = formatStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('75%')
    expect(formatted).toContain('60%')
  })
})

describe('formatRecommendations', () => {
  it('formats as bullet list', () => {
    expect(formatRecommendations(['test rec'])).toContain('test rec')
  })
})

describe('formatValueFlowOutput', () => {
  it('includes all sections', () => {
    const result = buildValueFlowResult(['a.ts'], ['import fs from "fs"'])
    const output = formatValueFlowOutput(result)
    expect(output).toContain('Flow Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatValueFlowJson', () => {
  it('returns valid JSON', () => {
    const result = buildValueFlowResult(['a.ts'], ['import fs from "fs"'])
    const json = formatValueFlowJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalSources).toBeGreaterThan(0)
  })
})
