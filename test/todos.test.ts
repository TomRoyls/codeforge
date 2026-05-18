import { describe, it, expect } from 'vitest'

import Todos from '../src/commands/todos.js'
import {
  aggregateTodos,
  getPriorityForType,
  scanFileForTodos,
  sortTodos,
  type TodoComment,
} from '../src/commands/todos-helpers.js'
import { formatTodoCsv, formatTodoTable } from '../src/commands/todos-format-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Todos command - static metadata', () => {
  it('has a description', () => {
    expect(Todos.description).toBe(
      'Scan source files for TODO, FIXME, and other action comments',
    )
  })

  it('has examples array', () => {
    expect(Array.isArray(Todos.examples)).toBe(true)
    expect(Todos.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg with default "."', () => {
    expect(Todos.args.path).toBeDefined()
    expect(Todos.args.path.default).toBe('.')
  })
})

// ─── Flags ───────────────────────────────────────────────
describe('Todos command - flags', () => {
  it('has format flag with options', () => {
    expect(Todos.flags.format.options).toContain('json')
    expect(Todos.flags.format.options).toContain('table')
    expect(Todos.flags.format.options).toContain('csv')
  })

  it('has sort-by flag with options', () => {
    expect(Todos.flags['sort-by'].options).toContain('file')
    expect(Todos.flags['sort-by'].options).toContain('severity')
    expect(Todos.flags['sort-by'].options).toContain('type')
  })

  it('defaults sort-by to file', () => {
    expect(Todos.flags['sort-by'].default).toBe('file')
  })

  it('defaults format to table', () => {
    expect(Todos.flags.format.default).toBe('table')
  })

  it('defaults types to all comment types', () => {
    expect(Todos.flags.types.default).toBe('TODO,FIXME,HACK,XXX,BUG,NOTE,OPTIMIZE')
  })

  it('defaults author to false', () => {
    expect(Todos.flags.author.default).toBe(false)
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Todos command - class structure', () => {
  it('exports a default class', () => {
    expect(Todos).toBeDefined()
    expect(typeof Todos).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Todos.prototype.run).toBe('function')
  })
})

// ─── scanFileForTodos ────────────────────────────────────
describe('scanFileForTodos', () => {
  const defaultTypes = ['TODO', 'FIXME', 'HACK', 'XXX', 'BUG', 'NOTE', 'OPTIMIZE']

  it('finds TODO comments', () => {
    const content = '// TODO: fix this later\nconst x = 1;'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('TODO')
    expect(result[0]!.text).toBe('fix this later')
    expect(result[0]!.line).toBe(1)
  })

  it('finds FIXME comments', () => {
    const content = '/* FIXME: broken logic */\nconst y = 2;'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('FIXME')
  })

  it('finds multiple comment types in one file', () => {
    const content = '// TODO: fix\n// HACK: workaround\n// NOTE: important\n// BUG: crashes'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result).toHaveLength(4)
    expect(result.map((c) => c.type)).toEqual(['TODO', 'HACK', 'NOTE', 'BUG'])
  })

  it('returns empty array for file with no matches', () => {
    const content = 'const a = 1;\nconst b = 2;'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty file', () => {
    const result = scanFileForTodos('', 'test.ts', defaultTypes, false)
    expect(result).toHaveLength(0)
  })

  it('extracts author when flag is set', () => {
    const content = '// TODO(john): fix this'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, true)
    expect(result[0]!.author).toBe('john')
  })

  it('does not extract author when flag is false', () => {
    const content = '// TODO(john): fix this'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result[0]!.author).toBeUndefined()
  })

  it('filters by specified types', () => {
    const content = '// TODO: fix\n// FIXME: broken\n// HACK: temp'
    const result = scanFileForTodos(content, 'test.ts', ['TODO'], false)
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('TODO')
  })

  it('sets correct line numbers', () => {
    const content = 'const a = 1;\n// TODO: fix\nconst b = 2;'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result[0]!.line).toBe(2)
  })

  it('handles block comment style with asterisk', () => {
    const content = ' * TODO: inside block comment'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('TODO')
  })

  it('handles OPTIMIZE comments', () => {
    const content = '// OPTIMIZE: this is slow'
    const result = scanFileForTodos(content, 'test.ts', defaultTypes, false)
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('OPTIMIZE')
  })
})

// ─── getPriorityForType ─────────────────────────────────
describe('getPriorityForType', () => {
  it('returns high for BUG', () => {
    expect(getPriorityForType('BUG')).toBe('high')
  })

  it('returns medium for FIXME', () => {
    expect(getPriorityForType('FIXME')).toBe('medium')
  })

  it('returns medium for HACK', () => {
    expect(getPriorityForType('HACK')).toBe('medium')
  })

  it('returns medium for XXX', () => {
    expect(getPriorityForType('XXX')).toBe('medium')
  })

  it('returns low for TODO', () => {
    expect(getPriorityForType('TODO')).toBe('low')
  })

  it('returns low for NOTE', () => {
    expect(getPriorityForType('NOTE')).toBe('low')
  })

  it('returns low for OPTIMIZE', () => {
    expect(getPriorityForType('OPTIMIZE')).toBe('low')
  })
})

// ─── aggregateTodos ──────────────────────────────────────
describe('aggregateTodos', () => {
  it('handles empty comments array', () => {
    const result = aggregateTodos([])
    expect(result.summary.total).toBe(0)
    expect(result.comments).toHaveLength(0)
    expect(result.summary.byType).toEqual({})
    expect(result.summary.byFile).toEqual({})
  })

  it('calculates correct totals', () => {
    const comments: TodoComment[] = [
      { file: 'a.ts', line: 1, priority: 'low', text: 'fix', type: 'TODO' },
      { file: 'b.ts', line: 5, priority: 'medium', text: 'broken', type: 'FIXME' },
      { file: 'a.ts', line: 10, priority: 'high', text: 'crash', type: 'BUG' },
    ]
    const result = aggregateTodos(comments)
    expect(result.summary.total).toBe(3)
    expect(result.summary.byType).toEqual({ TODO: 1, FIXME: 1, BUG: 1 })
    expect(result.summary.byFile).toEqual({ 'a.ts': 2, 'b.ts': 1 })
    expect(result.summary.byPriority).toEqual({ high: 1, medium: 1, low: 1 })
  })
})

// ─── sortTodos ───────────────────────────────────────────
describe('sortTodos', () => {
  const comments: TodoComment[] = [
    { file: 'z.ts', line: 1, priority: 'low', text: 'a', type: 'TODO' },
    { file: 'a.ts', line: 5, priority: 'high', text: 'b', type: 'BUG' },
    { file: 'a.ts', line: 2, priority: 'medium', text: 'c', type: 'FIXME' },
  ]
  const result = { comments, summary: { byFile: {}, byPriority: { high: 0, low: 0, medium: 0 }, byType: {}, total: 3 } }

  it('sorts by file (default)', () => {
    const sorted = sortTodos(result, 'file')
    expect(sorted.comments[0]!.file).toBe('a.ts')
    expect(sorted.comments[0]!.line).toBe(2)
    expect(sorted.comments[1]!.file).toBe('a.ts')
    expect(sorted.comments[1]!.line).toBe(5)
    expect(sorted.comments[2]!.file).toBe('z.ts')
  })

  it('sorts by severity', () => {
    const sorted = sortTodos(result, 'severity')
    expect(sorted.comments[0]!.priority).toBe('high')
    expect(sorted.comments[1]!.priority).toBe('medium')
    expect(sorted.comments[2]!.priority).toBe('low')
  })

  it('sorts by type', () => {
    const sorted = sortTodos(result, 'type')
    expect(sorted.comments[0]!.type).toBe('BUG')
    expect(sorted.comments[1]!.type).toBe('FIXME')
    expect(sorted.comments[2]!.type).toBe('TODO')
  })
})

// ─── formatTodoTable ─────────────────────────────────────
describe('formatTodoTable', () => {
  it('produces output containing summary', () => {
    const comments: TodoComment[] = [
      { file: 'a.ts', line: 1, priority: 'low', text: 'fix this', type: 'TODO' },
    ]
    const result = aggregateTodos(comments)
    const output = formatTodoTable(result)
    expect(output).toContain('Total comments')
    expect(output).toContain('TODO')
    expect(output).toContain('a.ts')
    expect(output).toContain('fix this')
  })

  it('handles empty results', () => {
    const result = aggregateTodos([])
    const output = formatTodoTable(result)
    expect(output).toContain('No TODO comments found')
  })

  it('shows author when present', () => {
    const comments: TodoComment[] = [
      { author: 'john', file: 'a.ts', line: 1, priority: 'low', text: 'fix', type: 'TODO' },
    ]
    const result = aggregateTodos(comments)
    const output = formatTodoTable(result)
    expect(output).toContain('john')
  })
})

// ─── formatTodoCsv ───────────────────────────────────────
describe('formatTodoCsv', () => {
  it('produces CSV with headers', () => {
    const comments: TodoComment[] = [
      { file: 'a.ts', line: 1, priority: 'low', text: 'fix this', type: 'TODO' },
    ]
    const result = aggregateTodos(comments)
    const output = formatTodoCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Type,Priority,File,Line,Author,Text')
    expect(lines[1]).toContain('TODO')
    expect(lines[1]).toContain('a.ts')
  })

  it('handles comments with commas in text', () => {
    const comments: TodoComment[] = [
      { file: 'a.ts', line: 1, priority: 'low', text: 'fix this, and that', type: 'TODO' },
    ]
    const result = aggregateTodos(comments)
    const output = formatTodoCsv(result)
    const lines = output.split('\n')
    expect(lines[1]).toContain('"fix this, and that"')
  })

  it('handles empty results', () => {
    const result = aggregateTodos([])
    const output = formatTodoCsv(result)
    expect(output).toBe('Type,Priority,File,Line,Author,Text')
  })
})
