import { describe, it, expect } from 'vitest'

import {
  extractTags,
  parseTagType,
  determinePriority,
  extractContext,
  summarizeByType,
  summarizeByAuthor,
  computeTagStats,
  prioritizeTags,
  generateRecommendations,
  buildTagResult,
  type CodeTag,
  type TagStats,
  type TagSummary,
} from '../src/commands/tag-helpers.js'

import {
  formatTagTable,
  formatTagSummary,
  formatAuthorBreakdown,
  formatPriorityList,
  formatDensityMeter,
  formatStatsLine,
  formatTagResultTable,
  formatTagJson,
  formatTagCsv,
} from '../src/commands/tag-format-helpers.js'

// ─── extractTags ──────────────────────────────────────────────────────────────

describe('extractTags', () => {
  it('returns empty for content with no tags', () => {
    expect(extractTags('const x = 1\nconsole.log(x)', 'app.ts')).toEqual([])
  })

  it('finds TODO tags', () => {
    const tags = extractTags('// TODO: fix this later', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('TODO')
    expect(tags[0]!.message).toBe('fix this later')
  })

  it('finds FIXME tags', () => {
    const tags = extractTags('// FIXME: broken logic', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('FIXME')
  })

  it('finds HACK tags', () => {
    const tags = extractTags('// HACK: temporary workaround', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('HACK')
  })

  it('finds XXX tags', () => {
    const tags = extractTags('// XXX: needs review', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('XXX')
  })

  it('finds NOTE tags', () => {
    const tags = extractTags('// NOTE: important info', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('NOTE')
  })

  it('finds PERF tags', () => {
    const tags = extractTags('// PERF: improve speed', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('PERF')
  })

  it('finds BUG tags', () => {
    const tags = extractTags('// BUG: crash on null', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('BUG')
  })

  it('finds OPTIMIZE tags', () => {
    const tags = extractTags('// OPTIMIZE: slow loop', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('OPTIMIZE')
  })

  it('finds DEPRECATED tags', () => {
    const tags = extractTags('// DEPRECATED: use newFunc instead', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('DEPRECATED')
  })

  it('finds case-insensitive tags', () => {
    const tags = extractTags('// todo: lowercase', 'app.ts')
    expect(tags.length).toBe(1)
    expect(tags[0]!.type).toBe('TODO')
  })

  it('finds multiple tags in one file', () => {
    const code = '// TODO: first\n// FIXME: second\n// HACK: third'
    const tags = extractTags(code, 'app.ts')
    expect(tags.length).toBe(3)
  })

  it('finds multiple tags on same line', () => {
    const tags = extractTags('// TODO: fix HACK: workaround', 'app.ts')
    expect(tags.length).toBe(2)
    expect(tags[0]!.type).toBe('TODO')
    expect(tags[1]!.type).toBe('HACK')
  })

  it('sets correct line numbers', () => {
    const code = 'line1\nline2\n// TODO: on line 3\nline4'
    const tags = extractTags(code, 'app.ts')
    expect(tags[0]!.line).toBe(3)
  })

  it('sets correct file path', () => {
    const tags = extractTags('// TODO: test', 'src/utils.ts')
    expect(tags[0]!.file).toBe('src/utils.ts')
  })

  it('sets lineContent to trimmed line', () => {
    const tags = extractTags('  // TODO: indented  ', 'app.ts')
    expect(tags[0]!.lineContent).toBe('// TODO: indented')
  })

  it('sets default message for empty message', () => {
    const tags = extractTags('// TODO', 'app.ts')
    expect(tags[0]!.message).toBe('(no message)')
  })

  it('extracts context with surrounding lines', () => {
    const code = 'line1\nline2\n// TODO: here\nline4\nline5'
    const tags = extractTags(code, 'app.ts')
    expect(tags[0]!.context).toContain('> // TODO: here')
    expect(tags[0]!.context).toContain('line2')
    expect(tags[0]!.context).toContain('line4')
  })

  it('handles empty content', () => {
    expect(extractTags('', 'app.ts')).toEqual([])
  })

  it('handles tags with various separators', () => {
    expect(extractTags('// TODO-fix this', 'app.ts')[0]!.message).toBe('fix this')
    expect(extractTags('// TODO   clean up', 'app.ts')[0]!.message).toBe('clean up')
  })
})

// ─── parseTagType ─────────────────────────────────────────────────────────────

describe('parseTagType', () => {
  it('returns null for line without tag', () => {
    expect(parseTagType('const x = 1')).toBeNull()
  })

  it('parses TODO with message', () => {
    const result = parseTagType('// TODO: refactor this')
    expect(result).toEqual({ type: 'TODO', message: 'refactor this' })
  })

  it('parses FIXME', () => {
    const result = parseTagType('/* FIXME broken */')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('FIXME')
  })

  it('parses case-insensitively', () => {
    const result = parseTagType('// hack: temp')
    expect(result!.type).toBe('HACK')
  })

  it('returns default message for no content', () => {
    const result = parseTagType('// TODO')
    expect(result!.message).toBe('(no message)')
  })

  it('parses BUG tag', () => {
    const result = parseTagType('# BUG: crash')
    expect(result!.type).toBe('BUG')
  })
})

// ─── determinePriority ────────────────────────────────────────────────────────

describe('determinePriority', () => {
  it('maps BUG to critical', () => {
    expect(determinePriority('BUG')).toBe('critical')
  })

  it('maps FIXME to high', () => {
    expect(determinePriority('FIXME')).toBe('high')
  })

  it('maps HACK to high', () => {
    expect(determinePriority('HACK')).toBe('high')
  })

  it('maps DEPRECATED to high', () => {
    expect(determinePriority('DEPRECATED')).toBe('high')
  })

  it('maps XXX to medium', () => {
    expect(determinePriority('XXX')).toBe('medium')
  })

  it('maps TODO to medium', () => {
    expect(determinePriority('TODO')).toBe('medium')
  })

  it('maps PERF to medium', () => {
    expect(determinePriority('PERF')).toBe('medium')
  })

  it('maps OPTIMIZE to medium', () => {
    expect(determinePriority('OPTIMIZE')).toBe('medium')
  })

  it('maps NOTE to low', () => {
    expect(determinePriority('NOTE')).toBe('low')
  })

  it('maps unknown to medium', () => {
    expect(determinePriority('CUSTOM')).toBe('medium')
  })

  it('handles case-insensitive input', () => {
    expect(determinePriority('bug')).toBe('critical')
    expect(determinePriority('todo')).toBe('medium')
  })
})

// ─── extractContext ───────────────────────────────────────────────────────────

describe('extractContext', () => {
  const lines = ['line0', 'line1', 'line2', 'line3', 'line4', 'line5', 'line6']

  it('extracts 2 lines before and after', () => {
    const ctx = extractContext(lines, 3)
    expect(ctx).toContain('> line3')
    expect(ctx).toContain('  line1')
    expect(ctx).toContain('  line5')
  })

  it('handles first lines (index 0)', () => {
    const ctx = extractContext(lines, 0)
    expect(ctx).toContain('> line0')
    expect(ctx).toContain('  line1')
    expect(ctx).toContain('  line2')
  })

  it('handles last lines', () => {
    const ctx = extractContext(lines, 6)
    expect(ctx).toContain('> line6')
    expect(ctx).toContain('  line4')
    expect(ctx).toContain('  line5')
  })

  it('marks target line with >', () => {
    const ctx = extractContext(lines, 2)
    const ctxLines = ctx.split('\n')
    const targetLine = ctxLines.find((l) => l.startsWith('>'))
    expect(targetLine).toContain('line2')
  })

  it('marks non-target lines with spaces', () => {
    const ctx = extractContext(lines, 3)
    const ctxLines = ctx.split('\n')
    const nonTarget = ctxLines.filter((l) => !l.startsWith('>'))
    expect(nonTarget.length).toBeGreaterThan(0)
    for (const l of nonTarget) {
      expect(l.startsWith('  ')).toBe(true)
    }
  })

  it('handles single line array', () => {
    const ctx = extractContext(['only line'], 0)
    expect(ctx).toBe('> only line')
  })
})

// ─── summarizeByType ──────────────────────────────────────────────────────────

describe('summarizeByType', () => {
  const makeTag = (type: string, file: string, age = 0): CodeTag => ({
    type, file, line: 1, lineContent: '', message: '', priority: 'medium', author: '', date: '', age, context: '',
  })

  it('returns empty for no tags', () => {
    expect(summarizeByType([])).toEqual([])
  })

  it('groups tags by type', () => {
    const tags = [makeTag('TODO', 'a.ts'), makeTag('TODO', 'b.ts'), makeTag('FIXME', 'c.ts')]
    const summaries = summarizeByType(tags)
    expect(summaries.length).toBe(2)
    expect(summaries.find((s) => s.type === 'TODO')!.count).toBe(2)
    expect(summaries.find((s) => s.type === 'FIXME')!.count).toBe(1)
  })

  it('sorts by count descending', () => {
    const tags = [makeTag('TODO', 'a.ts'), makeTag('FIXME', 'b.ts'), makeTag('FIXME', 'c.ts'), makeTag('FIXME', 'd.ts')]
    const summaries = summarizeByType(tags)
    expect(summaries[0]!.type).toBe('FIXME')
  })

  it('computes average age', () => {
    const tags = [makeTag('TODO', 'a.ts', 10), makeTag('TODO', 'b.ts', 20)]
    const summaries = summarizeByType(tags)
    expect(summaries[0]!.averageAge).toBe(15)
  })

  it('tracks unique files', () => {
    const tags = [makeTag('TODO', 'a.ts'), makeTag('TODO', 'a.ts'), makeTag('TODO', 'b.ts')]
    const summaries = summarizeByType(tags)
    expect(summaries[0]!.files).toEqual(['a.ts', 'b.ts'])
  })

  it('finds oldest tag by age', () => {
    const tags = [makeTag('TODO', 'a.ts', 5), makeTag('TODO', 'b.ts', 100), makeTag('TODO', 'c.ts', 10)]
    const summaries = summarizeByType(tags)
    expect(summaries[0]!.oldest!.age).toBe(100)
  })

  it('finds newest tag by age', () => {
    const tags = [makeTag('TODO', 'a.ts', 50), makeTag('TODO', 'b.ts', 5), makeTag('TODO', 'c.ts', 10)]
    const summaries = summarizeByType(tags)
    expect(summaries[0]!.newest!.age).toBe(5)
  })
})

// ─── summarizeByAuthor ────────────────────────────────────────────────────────

describe('summarizeByAuthor', () => {
  const makeTag = (author: string, type = 'TODO'): CodeTag => ({
    type, file: 'a.ts', line: 1, lineContent: '', message: '', priority: 'medium', author, date: '', age: 0, context: '',
  })

  it('returns empty for no authors', () => {
    expect(summarizeByAuthor([makeTag('', 'TODO')])).toEqual([])
  })

  it('groups tags by author', () => {
    const tags = [makeTag('alice'), makeTag('alice'), makeTag('bob')]
    const authors = summarizeByAuthor(tags)
    expect(authors.length).toBe(2)
    expect(authors.find((a) => a.author === 'alice')!.count).toBe(2)
  })

  it('sorts by count descending', () => {
    const tags = [makeTag('alice'), makeTag('bob'), makeTag('bob'), makeTag('bob')]
    const authors = summarizeByAuthor(tags)
    expect(authors[0]!.author).toBe('bob')
  })

  it('tracks types per author', () => {
    const tags = [makeTag('alice', 'TODO'), makeTag('alice', 'TODO'), makeTag('alice', 'FIXME')]
    const authors = summarizeByAuthor(tags)
    expect(authors[0]!.types).toEqual({ TODO: 2, FIXME: 1 })
  })

  it('skips empty author', () => {
    const tags = [makeTag('')]
    const authors = summarizeByAuthor(tags)
    expect(authors.length).toBe(0)
  })
})

// ─── computeTagStats ──────────────────────────────────────────────────────────

describe('computeTagStats', () => {
  const makeTag = (priority: 'low' | 'medium' | 'high' | 'critical', type = 'TODO', age = 0): CodeTag => ({
    type, file: 'a.ts', line: 1, lineContent: '', message: '', priority, author: '', date: '', age, context: '',
  })

  it('returns zero stats for no tags', () => {
    const stats = computeTagStats([], 100)
    expect(stats.totalTags).toBe(0)
    expect(stats.tagDensity).toBe(0)
    expect(stats.criticalCount).toBe(0)
    expect(stats.averageAge).toBe(0)
  })

  it('counts total tags', () => {
    const tags = [makeTag('medium'), makeTag('high'), makeTag('low')]
    expect(computeTagStats(tags, 100).totalTags).toBe(3)
  })

  it('computes tag density per 1000 lines', () => {
    const tags = [makeTag('medium'), makeTag('medium')]
    const stats = computeTagStats(tags, 500)
    expect(stats.tagDensity).toBe(4.0)
  })

  it('handles zero lines', () => {
    const stats = computeTagStats([makeTag('medium')], 0)
    expect(stats.tagDensity).toBe(0)
  })

  it('counts by priority', () => {
    const tags = [makeTag('critical'), makeTag('high'), makeTag('high'), makeTag('medium'), makeTag('low')]
    const stats = computeTagStats(tags, 100)
    expect(stats.criticalCount).toBe(1)
    expect(stats.highCount).toBe(2)
    expect(stats.mediumCount).toBe(1)
    expect(stats.lowCount).toBe(1)
  })

  it('counts deprecated tags', () => {
    const tags = [makeTag('high', 'DEPRECATED'), makeTag('medium', 'TODO')]
    const stats = computeTagStats(tags, 100)
    expect(stats.deprecatedCount).toBe(1)
  })

  it('computes average age', () => {
    const tags = [makeTag('medium', 'TODO', 10), makeTag('medium', 'TODO', 20)]
    const stats = computeTagStats(tags, 100)
    expect(stats.averageAge).toBe(15)
  })

  it('finds oldest tag', () => {
    const tags = [makeTag('medium', 'TODO', 5), makeTag('medium', 'TODO', 100), makeTag('medium', 'TODO', 10)]
    const stats = computeTagStats(tags, 100)
    expect(stats.oldestTag).not.toBeNull()
    expect(stats.oldestTag!.age).toBe(100)
  })

  it('oldestTag is null when all ages are 0', () => {
    const tags = [makeTag('medium', 'TODO', 0)]
    const stats = computeTagStats(tags, 100)
    expect(stats.oldestTag).toBeNull()
  })
})

// ─── prioritizeTags ───────────────────────────────────────────────────────────

describe('prioritizeTags', () => {
  const makeTag = (priority: 'low' | 'medium' | 'high' | 'critical', age = 0): CodeTag => ({
    type: 'TODO', file: 'a.ts', line: 1, lineContent: '', message: '', priority, author: '', date: '', age, context: '',
  })

  it('sorts critical before high', () => {
    const tags = [makeTag('high'), makeTag('critical')]
    const result = prioritizeTags(tags)
    expect(result[0]!.priority).toBe('critical')
  })

  it('sorts high before medium', () => {
    const tags = [makeTag('medium'), makeTag('high')]
    const result = prioritizeTags(tags)
    expect(result[0]!.priority).toBe('high')
  })

  it('sorts medium before low', () => {
    const tags = [makeTag('low'), makeTag('medium')]
    const result = prioritizeTags(tags)
    expect(result[0]!.priority).toBe('medium')
  })

  it('sorts by age within same priority (oldest first)', () => {
    const tags = [makeTag('medium', 10), makeTag('medium', 50), makeTag('medium', 5)]
    const result = prioritizeTags(tags)
    expect(result[0]!.age).toBe(50)
    expect(result[2]!.age).toBe(5)
  })

  it('handles empty array', () => {
    expect(prioritizeTags([])).toEqual([])
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: TagStats = {
    totalTags: 0, tagDensity: 0, oldestTag: null, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, deprecatedCount: 0, averageAge: 0,
  }

  it('returns clean message for no tags', () => {
    const recs = generateRecommendations(emptyStats, [])
    expect(recs).toEqual(['No actionable tags found. Codebase is clean.'])
  })

  it('warns about critical tags', () => {
    const stats = { ...emptyStats, criticalCount: 2 }
    const recs = generateRecommendations(stats, [])
    expect(recs.some((r) => r.includes('critical'))).toBe(true)
  })

  it('warns about high-priority tags', () => {
    const stats = { ...emptyStats, highCount: 3 }
    const recs = generateRecommendations(stats, [])
    expect(recs.some((r) => r.includes('high-priority'))).toBe(true)
  })

  it('warns about stale tags older than 90 days', () => {
    const summaries: TagSummary[] = [{ type: 'TODO', count: 5, oldest: null, newest: null, averageAge: 120, files: ['a.ts'] }]
    const recs = generateRecommendations(emptyStats, summaries)
    expect(recs.some((r) => r.includes('90 days'))).toBe(true)
  })

  it('warns about deprecated tags', () => {
    const stats = { ...emptyStats, deprecatedCount: 3 }
    const recs = generateRecommendations(stats, [])
    expect(recs.some((r) => r.includes('DEPRECATED'))).toBe(true)
  })

  it('warns about high tag density', () => {
    const stats = { ...emptyStats, totalTags: 50, tagDensity: 15 }
    const recs = generateRecommendations(stats, [])
    expect(recs.some((r) => r.includes('cleanup sprint'))).toBe(true)
  })
})

// ─── buildTagResult ───────────────────────────────────────────────────────────

describe('buildTagResult', () => {
  it('returns empty result for no tags', () => {
    const result = buildTagResult([], [])
    expect(result.tags).toEqual([])
    expect(result.stats.totalTags).toBe(0)
  })

  it('extracts tags from file contents', () => {
    const result = buildTagResult(['app.ts'], ['// TODO: fix\n// FIXME: broken'])
    expect(result.tags.length).toBe(2)
  })

  it('filters by type', () => {
    const result = buildTagResult(['app.ts'], ['// TODO: fix\n// FIXME: broken'], { type: 'todo' })
    expect(result.tags.length).toBe(1)
    expect(result.tags[0]!.type).toBe('TODO')
  })

  it('returns all tags when type is all', () => {
    const result = buildTagResult(['app.ts'], ['// TODO: fix\n// FIXME: broken'], { type: 'all' })
    expect(result.tags.length).toBe(2)
  })

  it('computes summaries', () => {
    const result = buildTagResult(['app.ts'], ['// TODO: a\n// TODO: b\n// FIXME: c'])
    expect(result.summaries.length).toBe(2)
  })

  it('computes stats', () => {
    const result = buildTagResult(['app.ts'], ['// TODO: fix\n// FIXME: broken\n// BUG: crash'])
    expect(result.stats.totalTags).toBe(3)
    expect(result.stats.criticalCount).toBe(1)
    expect(result.stats.highCount).toBe(1)
  })

  it('computes priority list', () => {
    const result = buildTagResult(['app.ts'], ['// TODO: fix\n// BUG: crash'])
    expect(result.priority.length).toBe(2)
    expect(result.priority[0]!.type).toBe('BUG')
  })

  it('includes recommendations', () => {
    const result = buildTagResult(['app.ts'], ['// BUG: crash'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles multiple files', () => {
    const result = buildTagResult(['a.ts', 'b.ts'], ['// TODO: from a', '// FIXME: from b'])
    expect(result.tags.length).toBe(2)
    expect(result.tags[0]!.file).toBe('a.ts')
    expect(result.tags[1]!.file).toBe('b.ts')
  })

  it('handles empty file content', () => {
    const result = buildTagResult(['empty.ts'], [''])
    expect(result.tags).toEqual([])
    expect(result.stats.totalTags).toBe(0)
  })
})

// ─── formatTagTable ───────────────────────────────────────────────────────────

describe('formatTagTable', () => {
  const makeTag = (type: string, file: string): CodeTag => ({
    type, file, line: 42, lineContent: `// ${type}: test`, message: 'test', priority: 'medium', author: '', date: '', age: 0, context: '',
  })

  it('returns message for no tags', () => {
    expect(formatTagTable([])).toContain('No tags found')
  })

  it('renders table with headers', () => {
    const output = formatTagTable([makeTag('TODO', 'app.ts')])
    expect(output).toContain('Code Tags')
    expect(output).toContain('TODO')
    expect(output).toContain('app.ts')
  })

  it('shows overflow for 30+ tags', () => {
    const tags = Array.from({ length: 35 }, (_, i) => makeTag('TODO', `f${i}.ts`))
    const output = formatTagTable(tags)
    expect(output).toContain('and 5 more')
  })
})

// ─── formatTagSummary ─────────────────────────────────────────────────────────

describe('formatTagSummary', () => {
  it('returns empty for no summaries', () => {
    expect(formatTagSummary([])).toBe('')
  })

  it('renders summary with counts', () => {
    const summaries: TagSummary[] = [{ type: 'TODO', count: 5, oldest: null, newest: null, averageAge: 10, files: ['a.ts'] }]
    const output = formatTagSummary(summaries)
    expect(output).toContain('Summary by Type')
    expect(output).toContain('5 tags')
  })
})

// ─── formatAuthorBreakdown ────────────────────────────────────────────────────

describe('formatAuthorBreakdown', () => {
  it('returns empty for no authors', () => {
    expect(formatAuthorBreakdown([])).toBe('')
  })

  it('renders author breakdown', () => {
    const output = formatAuthorBreakdown([{ author: 'alice', count: 3, types: { TODO: 2, FIXME: 1 } }])
    expect(output).toContain('Author Breakdown')
    expect(output).toContain('alice')
    expect(output).toContain('TODO:2')
  })
})

// ─── formatPriorityList ───────────────────────────────────────────────────────

describe('formatPriorityList', () => {
  it('returns empty for no tags', () => {
    expect(formatPriorityList([])).toBe('')
  })

  it('renders priority list', () => {
    const tags: CodeTag[] = [{
      type: 'BUG', file: 'app.ts', line: 42, lineContent: '// BUG: crash', message: 'crash', priority: 'critical', author: '', date: '', age: 5, context: '',
    }]
    const output = formatPriorityList(tags)
    expect(output).toContain('Priority Action List')
    expect(output).toContain('app.ts:42')
  })

  it('shows age for aged tags', () => {
    const tags: CodeTag[] = [{
      type: 'TODO', file: 'app.ts', line: 1, lineContent: '', message: 'old', priority: 'medium', author: '', date: '', age: 200, context: '',
    }]
    const output = formatPriorityList(tags)
    expect(output).toContain('200d old')
  })
})

// ─── formatDensityMeter ───────────────────────────────────────────────────────

describe('formatDensityMeter', () => {
  it('renders density with bar', () => {
    const output = formatDensityMeter(2.5)
    expect(output).toContain('2.5')
    expect(output).toContain('per 1000 lines')
    expect(output).toContain('█')
    expect(output).toContain('░')
  })

  it('handles zero density', () => {
    const output = formatDensityMeter(0)
    expect(output).toContain('0')
  })

  it('handles high density', () => {
    const output = formatDensityMeter(25)
    expect(output).toContain('25')
  })
})

// ─── formatStatsLine ──────────────────────────────────────────────────────────

describe('formatStatsLine', () => {
  it('renders stats', () => {
    const stats: TagStats = {
      totalTags: 10, tagDensity: 2, oldestTag: null, criticalCount: 1, highCount: 2, mediumCount: 5, lowCount: 2, deprecatedCount: 1, averageAge: 30,
    }
    const output = formatStatsLine(stats)
    expect(output).toContain('Tags: 10')
    expect(output).toContain('Critical: 1')
    expect(output).toContain('High: 2')
  })
})

// ─── formatTagResultTable ─────────────────────────────────────────────────────

describe('formatTagResultTable', () => {
  it('renders full result', () => {
    const result = buildTagResult(['a.ts'], ['// TODO: fix\n// FIXME: broken'])
    const output = formatTagResultTable(result, false)
    expect(output).toContain('Code Tags')
    expect(output).toContain('Summary by Type')
    expect(output).toContain('per 1000 lines')
  })

  it('includes priority list in verbose mode', () => {
    const result = buildTagResult(['a.ts'], ['// BUG: crash'])
    const output = formatTagResultTable(result, true)
    expect(output).toContain('Priority Action List')
  })

  it('includes recommendations', () => {
    const result = buildTagResult(['a.ts'], ['// BUG: crash'])
    const output = formatTagResultTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatTagJson ────────────────────────────────────────────────────────────

describe('formatTagJson', () => {
  it('returns valid JSON', () => {
    const result = buildTagResult(['a.ts'], ['// TODO: fix'])
    const output = formatTagJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('tags')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('summaries')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('includes tag data', () => {
    const result = buildTagResult(['a.ts'], ['// TODO: fix this'])
    const output = formatTagJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.tags.length).toBe(1)
    expect(parsed.tags[0].type).toBe('TODO')
    expect(parsed.tags[0].message).toBe('fix this')
  })
})

// ─── formatTagCsv ─────────────────────────────────────────────────────────────

describe('formatTagCsv', () => {
  it('includes header row', () => {
    const result = buildTagResult([], [])
    const output = formatTagCsv(result)
    expect(output).toContain('type,file,line,priority,message,author,age')
  })

  it('includes data rows', () => {
    const result = buildTagResult(['a.ts'], ['// TODO: fix'])
    const output = formatTagCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[1]).toContain('TODO')
    expect(lines[1]).toContain('a.ts')
  })

  it('escapes commas in messages', () => {
    const result = buildTagResult(['a.ts'], ['// TODO: fix, refactor, and improve'])
    const output = formatTagCsv(result)
    expect(output).toContain('"fix, refactor, and improve"')
  })

  it('handles multiple tags', () => {
    const result = buildTagResult(['a.ts'], ['// TODO: first\n// FIXME: second'])
    const output = formatTagCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(3)
  })
})
