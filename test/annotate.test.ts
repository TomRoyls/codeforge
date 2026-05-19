import { describe, expect, it } from 'vitest'

import Annotate from '../src/commands/annotate.js'
import {
  buildAnnotateResult,
  computeAnnotationStats,
  type Annotation,
  type AnnotateResult,
  type AnnotationTypeMetadata,
  type AnnotationTypeStats,
  type FileAnnotations,
  extractAnnotations,
  filterByType,
  getAnnotationTypes,
  getContext,
  sortAnnotations,
} from '../src/commands/annotate-helpers.js'
import {
  formatAnnotateJson,
  formatAnnotateTable,
  formatAnnotationType,
  formatSeverity,
} from '../src/commands/annotate-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeAnnotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    column: 1,
    context: 'line before\ntarget line\nline after',
    file: 'test.ts',
    line: 5,
    severity: 'info',
    text: 'fix this later',
    type: 'TODO',
    ...overrides,
  }
}

function makeAnnotateResult(overrides: Partial<AnnotateResult> = {}): AnnotateResult {
  const annotations = [makeAnnotation()]
  return {
    annotations,
    files: ['test.ts'],
    stats: {
      byDirectory: { '.': 1 },
      byFile: [{ annotations, count: 1, file: 'test.ts' }],
      bySeverity: { critical: 0, info: 1, warning: 0 },
      byType: [{ color: 'blue', count: 1, percentage: 100, severity: 'info', type: 'TODO' }],
      density: 20,
      total: 1,
    },
    ...overrides,
  }
}

// ─── getAnnotationTypes ──────────────────────────────────

describe('getAnnotationTypes', () => {
  it('returns 10 annotation types', () => {
    const types = getAnnotationTypes()
    expect(types).toHaveLength(10)
  })

  it('includes TODO', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'TODO')).toBe(true)
  })

  it('includes FIXME', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'FIXME')).toBe(true)
  })

  it('includes HACK', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'HACK')).toBe(true)
  })

  it('includes XXX', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'XXX')).toBe(true)
  })

  it('includes NOTE', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'NOTE')).toBe(true)
  })

  it('includes OPTIMIZE', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'OPTIMIZE')).toBe(true)
  })

  it('includes BUG', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'BUG')).toBe(true)
  })

  it('includes CHANGED', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'CHANGED')).toBe(true)
  })

  it('includes IDEA', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'IDEA')).toBe(true)
  })

  it('includes REVIEW', () => {
    const types = getAnnotationTypes()
    expect(types.some((t) => t.type === 'REVIEW')).toBe(true)
  })

  it('each type has severity', () => {
    const types = getAnnotationTypes()
    for (const t of types) {
      expect(t.severity).toMatch(/^(critical|warning|info)$/)
    }
  })

  it('each type has color', () => {
    const types = getAnnotationTypes()
    for (const t of types) {
      expect(typeof t.color).toBe('string')
      expect(t.color.length).toBeGreaterThan(0)
    }
  })
})

// ─── extractAnnotations ──────────────────────────────────

describe('extractAnnotations', () => {
  it('extracts TODO comment', () => {
    const content = '// TODO: fix this later'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('TODO')
    expect(result[0]!.text).toBe('fix this later')
  })

  it('extracts FIXME comment', () => {
    const content = '// FIXME: broken logic'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('FIXME')
  })

  it('extracts HACK comment', () => {
    const content = '// HACK: workaround for bug'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('HACK')
  })

  it('extracts XXX comment', () => {
    const content = '// XXX: dangerous code'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('XXX')
    expect(result[0]!.severity).toBe('critical')
  })

  it('extracts NOTE comment', () => {
    const content = '// NOTE: important info'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('NOTE')
  })

  it('extracts OPTIMIZE comment', () => {
    const content = '// OPTIMIZE: slow loop'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('OPTIMIZE')
  })

  it('extracts BUG comment', () => {
    const content = '// BUG: crash on null'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('BUG')
    expect(result[0]!.severity).toBe('critical')
  })

  it('extracts CHANGED comment', () => {
    const content = '// CHANGED: updated API'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('CHANGED')
  })

  it('extracts IDEA comment', () => {
    const content = '// IDEA: use caching'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('IDEA')
  })

  it('extracts REVIEW comment', () => {
    const content = '// REVIEW: check logic'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('REVIEW')
  })

  it('handles block comments /* TODO: ... */', () => {
    const content = '/* TODO: fix this block */'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('TODO')
  })

  it('handles hash comments # NOTE:', () => {
    const content = '# NOTE: python comment'
    const result = extractAnnotations(content, 'file.py')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('NOTE')
  })

  it('extracts multiple annotations in one file', () => {
    const content = `// TODO: fix this
const x = 1;
// FIXME: broken
// HACK: workaround`
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(3)
    expect(result.map((a) => a.type)).toEqual(['TODO', 'FIXME', 'HACK'])
  })

  it('is case insensitive', () => {
    const content = '// todo: lowercase\ncode\n// Todo: mixed case'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(2)
    expect(result[0]!.type).toBe('TODO')
    expect(result[1]!.type).toBe('TODO')
  })

  it('returns empty array for no annotations', () => {
    const content = 'const x = 1;\nconst y = 2;'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(0)
  })

  it('sets correct line number', () => {
    const content = 'line1\nline2\n// TODO: on line 3'
    const result = extractAnnotations(content, 'file.ts')
    expect(result[0]!.line).toBe(3)
  })

  it('sets correct file path', () => {
    const content = '// TODO: test'
    const result = extractAnnotations(content, 'src/utils/helper.ts')
    expect(result[0]!.file).toBe('src/utils/helper.ts')
  })

  it('extracts annotation text without colon', () => {
    const content = '// TODO fix this'
    const result = extractAnnotations(content, 'file.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.text).toBe('fix this')
  })
})

// ─── getContext ──────────────────────────────────────────

describe('getContext', () => {
  const lines = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6', 'line7']

  it('returns context in middle of file', () => {
    const ctx = getContext(lines, 3, 2)
    const ctxLines = ctx.split('\n')
    expect(ctxLines).toHaveLength(5)
    expect(ctxLines[0]).toBe('line2')
    expect(ctxLines[2]).toBe('line4')
    expect(ctxLines[4]).toBe('line6')
  })

  it('handles beginning of file', () => {
    const ctx = getContext(lines, 0, 2)
    const ctxLines = ctx.split('\n')
    expect(ctxLines).toHaveLength(3)
    expect(ctxLines[0]).toBe('line1')
  })

  it('handles end of file', () => {
    const ctx = getContext(lines, 6, 2)
    const ctxLines = ctx.split('\n')
    expect(ctxLines).toHaveLength(3)
    expect(ctxLines[ctxLines.length - 1]).toBe('line7')
  })

  it('handles single line file', () => {
    const ctx = getContext(['only line'], 0, 2)
    expect(ctx).toBe('only line')
  })

  it('uses padding of 0', () => {
    const ctx = getContext(lines, 3, 0)
    expect(ctx).toBe('line4')
  })
})

// ─── computeAnnotationStats ──────────────────────────────

describe('computeAnnotationStats', () => {
  it('computes correct total', () => {
    const annotations = [
      makeAnnotation({ type: 'TODO', severity: 'info' }),
      makeAnnotation({ type: 'FIXME', severity: 'warning' }),
      makeAnnotation({ type: 'BUG', severity: 'critical' }),
    ]
    const stats = computeAnnotationStats(annotations, 100)
    expect(stats.total).toBe(3)
  })

  it('computes counts by type', () => {
    const annotations = [
      makeAnnotation({ type: 'TODO', severity: 'info' }),
      makeAnnotation({ type: 'TODO', severity: 'info' }),
      makeAnnotation({ type: 'FIXME', severity: 'warning' }),
    ]
    const stats = computeAnnotationStats(annotations, 100)
    expect(stats.byType).toHaveLength(2)
    const todo = stats.byType.find((t) => t.type === 'TODO')
    expect(todo!.count).toBe(2)
    expect(todo!.percentage).toBe(66.67)
  })

  it('computes counts by file', () => {
    const annotations = [
      makeAnnotation({ file: 'a.ts' }),
      makeAnnotation({ file: 'a.ts' }),
      makeAnnotation({ file: 'b.ts' }),
    ]
    const stats = computeAnnotationStats(annotations, 100)
    expect(stats.byFile).toHaveLength(2)
    const aFile = stats.byFile.find((f) => f.file === 'a.ts')
    expect(aFile!.count).toBe(2)
  })

  it('computes counts by severity', () => {
    const annotations = [
      makeAnnotation({ severity: 'critical' }),
      makeAnnotation({ severity: 'warning' }),
      makeAnnotation({ severity: 'warning' }),
      makeAnnotation({ severity: 'info' }),
    ]
    const stats = computeAnnotationStats(annotations, 100)
    expect(stats.bySeverity.critical).toBe(1)
    expect(stats.bySeverity.warning).toBe(2)
    expect(stats.bySeverity.info).toBe(1)
  })

  it('computes counts by directory', () => {
    const annotations = [
      makeAnnotation({ file: 'src/a.ts' }),
      makeAnnotation({ file: 'src/b.ts' }),
      makeAnnotation({ file: 'lib/c.ts' }),
    ]
    const stats = computeAnnotationStats(annotations, 100)
    expect(stats.byDirectory['src']).toBe(2)
    expect(stats.byDirectory['lib']).toBe(1)
  })

  it('computes density', () => {
    const annotations = [makeAnnotation(), makeAnnotation()]
    const stats = computeAnnotationStats(annotations, 100)
    expect(stats.density).toBe(20)
  })

  it('handles empty annotations', () => {
    const stats = computeAnnotationStats([], 100)
    expect(stats.total).toBe(0)
    expect(stats.byType).toHaveLength(0)
    expect(stats.byFile).toHaveLength(0)
    expect(stats.bySeverity.critical).toBe(0)
    expect(stats.bySeverity.warning).toBe(0)
    expect(stats.bySeverity.info).toBe(0)
    expect(stats.density).toBe(0)
  })

  it('handles zero total lines', () => {
    const annotations = [makeAnnotation()]
    const stats = computeAnnotationStats(annotations, 0)
    expect(stats.density).toBe(0)
  })
})

// ─── filterByType ────────────────────────────────────────

describe('filterByType', () => {
  it('filters to TODO only', () => {
    const annotations = [
      makeAnnotation({ type: 'TODO' }),
      makeAnnotation({ type: 'FIXME' }),
      makeAnnotation({ type: 'TODO' }),
    ]
    const result = filterByType(annotations, 'todo')
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.type === 'TODO')).toBe(true)
  })

  it('returns empty for non-existent type', () => {
    const annotations = [makeAnnotation({ type: 'TODO' })]
    const result = filterByType(annotations, 'nonexistent')
    expect(result).toHaveLength(0)
  })

  it('is case insensitive', () => {
    const annotations = [makeAnnotation({ type: 'TODO' })]
    const result = filterByType(annotations, 'todo')
    expect(result).toHaveLength(1)
  })
})

// ─── sortAnnotations ─────────────────────────────────────

describe('sortAnnotations', () => {
  const annotations = [
    makeAnnotation({ file: 'b.ts', type: 'FIXME', severity: 'warning', line: 1 }),
    makeAnnotation({ file: 'a.ts', type: 'TODO', severity: 'info', line: 5 }),
    makeAnnotation({ file: 'a.ts', type: 'BUG', severity: 'critical', line: 2 }),
  ]

  it('sorts by type alphabetically', () => {
    const result = sortAnnotations(annotations, 'type')
    expect(result[0]!.type).toBe('BUG')
    expect(result[1]!.type).toBe('FIXME')
    expect(result[2]!.type).toBe('TODO')
  })

  it('sorts by severity (critical first)', () => {
    const result = sortAnnotations(annotations, 'severity')
    expect(result[0]!.severity).toBe('critical')
  })

  it('sorts by file then line', () => {
    const result = sortAnnotations(annotations, 'file')
    expect(result[0]!.file).toBe('a.ts')
    expect(result[1]!.file).toBe('a.ts')
    expect(result[2]!.file).toBe('b.ts')
  })

  it('sorts by count (groups by file)', () => {
    const result = sortAnnotations(annotations, 'count')
    expect(result[0]!.file).toBe('a.ts')
  })

  it('does not mutate input', () => {
    const copy = [...annotations]
    sortAnnotations(annotations, 'type')
    expect(annotations).toEqual(copy)
  })
})

// ─── buildAnnotateResult ─────────────────────────────────

describe('buildAnnotateResult', () => {
  it('processes multiple files', async () => {
    const reader = async (filePath: string) => {
      if (filePath === 'a.ts') return '// TODO: fix a'
      if (filePath === 'b.ts') return '// FIXME: fix b'
      return ''
    }
    const result = await buildAnnotateResult(['a.ts', 'b.ts'], reader, {})
    expect(result.annotations).toHaveLength(2)
    expect(result.stats.total).toBe(2)
    expect(result.files).toEqual(['a.ts', 'b.ts'])
  })

  it('filters by type', async () => {
    const reader = async (_filePath: string) => '// TODO: fix\n// FIXME: broken'
    const result = await buildAnnotateResult(['file.ts'], reader, { type: 'todo' })
    expect(result.annotations).toHaveLength(1)
    expect(result.annotations[0]!.type).toBe('TODO')
  })

  it('handles read errors gracefully', async () => {
    const reader = async () => {
      throw new Error('read error')
    }
    const result = await buildAnnotateResult(['bad.ts'], reader, {})
    expect(result.annotations).toHaveLength(0)
    expect(result.stats.total).toBe(0)
  })
})

// ─── formatAnnotationType ────────────────────────────────

describe('formatAnnotationType', () => {
  it('returns the type name in output', () => {
    const result = formatAnnotationType('TODO', 'blue')
    expect(result).toContain('TODO')
  })

  it('handles unknown color gracefully', () => {
    const result = formatAnnotationType('TODO', 'unknown')
    expect(result).toBe('TODO')
  })
})

// ─── formatSeverity ──────────────────────────────────────

describe('formatSeverity', () => {
  it('formats critical severity', () => {
    const result = formatSeverity('critical')
    expect(result).toContain('CRITICAL')
    expect(result).toContain('●')
  })

  it('formats warning severity', () => {
    const result = formatSeverity('warning')
    expect(result).toContain('WARNING')
    expect(result).toContain('▲')
  })

  it('formats info severity', () => {
    const result = formatSeverity('info')
    expect(result).toContain('INFO')
    expect(result).toContain('○')
  })

  it('handles unknown severity', () => {
    const result = formatSeverity('unknown')
    expect(result).toBe('unknown')
  })
})

// ─── formatAnnotateTable ─────────────────────────────────

describe('formatAnnotateTable', () => {
  it('contains summary header', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateTable(result, false)
    expect(output).toContain('Code Annotation Report')
  })

  it('contains total annotations', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateTable(result, false)
    expect(output).toContain('Total annotations')
  })

  it('contains density', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateTable(result, false)
    expect(output).toContain('Density')
  })

  it('contains type table', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateTable(result, false)
    expect(output).toContain('By Type')
    expect(output).toContain('TODO')
  })

  it('contains file table', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateTable(result, false)
    expect(output).toContain('By File')
    expect(output).toContain('test.ts')
  })

  it('shows annotations in verbose mode', () => {
    const result = makeAnnotateResult({
      annotations: [makeAnnotation({ text: 'fix this later', file: 'test.ts', line: 5 })],
    })
    const output = formatAnnotateTable(result, true)
    expect(output).toContain('Annotations')
    expect(output).toContain('fix this later')
  })

  it('does not show annotations in non-verbose mode', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateTable(result, false)
    expect(output).not.toContain('Annotations:')
  })

  it('handles empty results', () => {
    const result = makeAnnotateResult({
      annotations: [],
      stats: {
        byDirectory: {},
        byFile: [],
        bySeverity: { critical: 0, info: 0, warning: 0 },
        byType: [],
        density: 0,
        total: 0,
      },
    })
    const output = formatAnnotateTable(result, false)
    expect(output).toContain('Total annotations: 0')
  })

  it('shows directory breakdown', () => {
    const result = makeAnnotateResult({
      stats: {
        byDirectory: { src: 3, lib: 1 },
        byFile: [],
        bySeverity: { critical: 0, info: 4, warning: 0 },
        byType: [],
        density: 10,
        total: 4,
      },
    })
    const output = formatAnnotateTable(result, false)
    expect(output).toContain('By Directory')
    expect(output).toContain('src')
    expect(output).toContain('lib')
  })
})

// ─── formatAnnotateJson ──────────────────────────────────

describe('formatAnnotateJson', () => {
  it('produces valid JSON', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains annotations array', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.annotations).toBeDefined()
    expect(Array.isArray(parsed.annotations)).toBe(true)
  })

  it('contains stats object', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.total).toBe(1)
  })

  it('contains files array', () => {
    const result = makeAnnotateResult()
    const output = formatAnnotateJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('handles empty results', () => {
    const result = makeAnnotateResult({
      annotations: [],
      files: [],
      stats: {
        byDirectory: {},
        byFile: [],
        bySeverity: { critical: 0, info: 0, warning: 0 },
        byType: [],
        density: 0,
        total: 0,
      },
    })
    const output = formatAnnotateJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.annotations).toHaveLength(0)
    expect(parsed.stats.total).toBe(0)
  })
})

// ─── Command metadata ────────────────────────────────────

describe('Annotate command - static metadata', () => {
  it('has a description', () => {
    expect(Annotate.description).toBe('Analyze code annotations (TODO, FIXME, HACK, etc.)')
  })

  it('has examples array', () => {
    expect(Array.isArray(Annotate.examples)).toBe(true)
    expect(Annotate.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Annotate.args.path).toBeDefined()
    expect(Annotate.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Annotate.args.path.default).toBe('.')
  })
})

// ─── Command flags ───────────────────────────────────────

describe('Annotate command - flags', () => {
  it('has format flag with options', () => {
    expect(Annotate.flags.format.options).toContain('json')
    expect(Annotate.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Annotate.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Annotate.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Annotate.flags.ignore).toBeDefined()
    expect(Annotate.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Annotate.flags.ext).toBeDefined()
  })

  it('defaults ext to .ts,.tsx,.js,.jsx', () => {
    expect(Annotate.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has type flag with options', () => {
    expect(Annotate.flags.type.options).toContain('todo')
    expect(Annotate.flags.type.options).toContain('fixme')
    expect(Annotate.flags.type.options).toContain('hack')
    expect(Annotate.flags.type.options).toContain('bug')
  })

  it('has sort flag defaulting to count', () => {
    expect(Annotate.flags.sort.default).toBe('count')
  })

  it('has sort options', () => {
    expect(Annotate.flags.sort.options).toContain('count')
    expect(Annotate.flags.sort.options).toContain('file')
    expect(Annotate.flags.sort.options).toContain('severity')
    expect(Annotate.flags.sort.options).toContain('type')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Annotate.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ─────────────────────────────────────

describe('Annotate command - class structure', () => {
  it('exports a default class', () => {
    expect(Annotate).toBeDefined()
    expect(typeof Annotate).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Annotate.prototype.run).toBe('function')
  })
})
