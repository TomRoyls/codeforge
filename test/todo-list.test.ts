import { describe, it, expect } from 'vitest'

import {
  parseTodoText,
  extractTodos,
  computeTodoStats,
  filterTodos,
  sortTodos,
  buildTodoListResult,
  type TodoItem,
  type TodoListResult,
} from '../src/commands/todo-list-helpers.js'

import {
  formatPriority,
  formatTodoListTable,
  formatTodoListJson,
} from '../src/commands/todo-list-format-helpers.js'

import TodoList from '../src/commands/todo-list.js'

// ─── parseTodoText ──────────────────────────────────────

describe('parseTodoText', () => {
  it('should extract assignee from @username', () => {
    const meta = parseTodoText('Implement login @alice')
    expect(meta.assignee).toBe('alice')
  })

  it('should extract category from [text]', () => {
    const meta = parseTodoText('[auth] Implement login')
    expect(meta.category).toBe('auth')
  })

  it('should extract tags from #tag', () => {
    const meta = parseTodoText('Fix bug #security #urgent')
    expect(meta.tags).toEqual(['security', 'urgent'])
  })

  it('should detect high priority !!!', () => {
    const meta = parseTodoText('Fix this !!!')
    expect(meta.priority).toBe('high')
  })

  it('should detect medium priority !!', () => {
    const meta = parseTodoText('Fix this !!')
    expect(meta.priority).toBe('medium')
  })

  it('should detect low priority !', () => {
    const meta = parseTodoText('Fix this !')
    expect(meta.priority).toBe('low')
  })

  it('should default to medium priority', () => {
    const meta = parseTodoText('Fix this')
    expect(meta.priority).toBe('medium')
  })

  it('should clean text after extracting metadata', () => {
    const meta = parseTodoText('[auth] Fix login #security !!!')
    expect(meta.text).not.toContain('[auth]')
    expect(meta.text).not.toContain('#security')
    expect(meta.text).not.toContain('!!!')
  })

  it('should handle plain text without metadata', () => {
    const meta = parseTodoText('simple task')
    expect(meta.assignee).toBeNull()
    expect(meta.category).toBeNull()
    expect(meta.tags).toHaveLength(0)
    expect(meta.text).toBe('simple task')
  })
})

// ─── extractTodos ───────────────────────────────────────

describe('extractTodos', () => {
  it('should detect TODO comments', () => {
    const items = extractTodos('// TODO: fix this\n', 'app.ts')
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('TODO')
  })

  it('should detect FIXME comments', () => {
    const items = extractTodos('// FIXME: broken\n', 'app.ts')
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('FIXME')
  })

  it('should detect HACK comments', () => {
    const items = extractTodos('// HACK: workaround\n', 'app.ts')
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('HACK')
  })

  it('should detect XXX comments', () => {
    const items = extractTodos('// XXX: danger\n', 'app.ts')
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('XXX')
  })

  it('should detect NOTE comments', () => {
    const items = extractTodos('// NOTE: important\n', 'app.ts')
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('NOTE')
  })

  it('should detect OPTIMIZE comments', () => {
    const items = extractTodos('// OPTIMIZE: slow loop\n', 'app.ts')
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('OPTIMIZE')
  })

  it('should report correct line number', () => {
    const code = 'const x = 1\n// TODO: fix\n'
    const items = extractTodos(code, 'app.ts')
    expect(items[0].line).toBe(2)
  })

  it('should generate id as file:line', () => {
    const items = extractTodos('// TODO: fix\n', 'app.ts')
    expect(items[0].id).toBe('app.ts:1')
  })

  it('should extract multiple TODOs', () => {
    const code = '// TODO: first\nconst x = 1\n// FIXME: second\n'
    const items = extractTodos(code, 'app.ts')
    expect(items).toHaveLength(2)
  })

  it('should include context lines', () => {
    const code = 'line1\nline2\n// TODO: fix\nline4\nline5\n'
    const items = extractTodos(code, 'app.ts', 2)
    expect(items[0].context.length).toBe(5)
  })

  it('should extract inline assignee', () => {
    const items = extractTodos('// TODO(@bob): fix auth\n', 'app.ts')
    expect(items[0].assignee).toBe('bob')
  })

  it('should extract priority from text', () => {
    const items = extractTodos('// TODO: urgent fix !!!\n', 'app.ts')
    expect(items[0].priority).toBe('high')
  })

  it('should extract hash comment style', () => {
    const items = extractTodos('# TODO: python fix\n', 'app.py')
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('TODO')
  })

  it('should return empty for no TODOs', () => {
    const items = extractTodos('const x = 1\n', 'clean.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── computeTodoStats ───────────────────────────────────

describe('computeTodoStats', () => {
  function makeItem(overrides: Partial<TodoItem> = {}): TodoItem {
    return {
      age: null,
      assignee: null,
      author: null,
      category: null,
      context: [],
      file: 'a.ts',
      id: 'a.ts:1',
      line: 1,
      priority: 'medium',
      tags: [],
      text: 'fix',
      type: 'TODO',
      ...overrides,
    }
  }

  it('should count total', () => {
    const stats = computeTodoStats([makeItem(), makeItem()])
    expect(stats.total).toBe(2)
  })

  it('should count by type', () => {
    const stats = computeTodoStats([
      makeItem({ type: 'TODO' }),
      makeItem({ type: 'FIXME' }),
      makeItem({ type: 'TODO' }),
    ])
    expect(stats.byType['TODO']).toBe(2)
    expect(stats.byType['FIXME']).toBe(1)
  })

  it('should count by priority', () => {
    const stats = computeTodoStats([
      makeItem({ priority: 'high' }),
      makeItem({ priority: 'low' }),
    ])
    expect(stats.byPriority['high']).toBe(1)
    expect(stats.byPriority['low']).toBe(1)
  })

  it('should count by assignee', () => {
    const stats = computeTodoStats([
      makeItem({ assignee: 'alice' }),
      makeItem({ assignee: null }),
      makeItem({ assignee: 'alice' }),
    ])
    expect(stats.byAssignee['alice']).toBe(2)
    expect(stats.byAssignee['unassigned']).toBe(1)
  })

  it('should count by file', () => {
    const stats = computeTodoStats([
      makeItem({ file: 'a.ts' }),
      makeItem({ file: 'b.ts' }),
      makeItem({ file: 'a.ts' }),
    ])
    expect(stats.byFile['a.ts']).toBe(2)
    expect(stats.byFile['b.ts']).toBe(1)
  })

  it('should count by tag', () => {
    const stats = computeTodoStats([
      makeItem({ tags: ['security', 'auth'] }),
      makeItem({ tags: ['security'] }),
    ])
    expect(stats.byTag['security']).toBe(2)
    expect(stats.byTag['auth']).toBe(1)
  })

  it('should find oldest item by age', () => {
    const stats = computeTodoStats([
      makeItem({ age: 10 }),
      makeItem({ age: 30 }),
      makeItem({ age: 5 }),
    ])
    expect(stats.oldestItem?.age).toBe(30)
  })

  it('should find newest item by age', () => {
    const stats = computeTodoStats([
      makeItem({ age: 10 }),
      makeItem({ age: 30 }),
      makeItem({ age: 5 }),
    ])
    expect(stats.newestItem?.age).toBe(5)
  })

  it('should handle empty items', () => {
    const stats = computeTodoStats([])
    expect(stats.total).toBe(0)
    expect(stats.oldestItem).toBeNull()
  })
})

// ─── filterTodos ────────────────────────────────────────

describe('filterTodos', () => {
  function makeItem(overrides: Partial<TodoItem> = {}): TodoItem {
    return {
      age: null, assignee: null, author: null, category: null, context: [],
      file: 'a.ts', id: 'a.ts:1', line: 1, priority: 'medium', tags: [],
      text: 'fix', type: 'TODO', ...overrides,
    }
  }

  it('should filter by high priority', () => {
    const items = [makeItem({ priority: 'high' }), makeItem({ priority: 'low' })]
    const filtered = filterTodos(items, { assignee: null, priority: 'high', types: null })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].priority).toBe('high')
  })

  it('should filter by assignee', () => {
    const items = [makeItem({ assignee: 'alice' }), makeItem({ assignee: 'bob' })]
    const filtered = filterTodos(items, { assignee: 'alice', priority: 'all', types: null })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].assignee).toBe('alice')
  })

  it('should filter by type', () => {
    const items = [makeItem({ type: 'TODO' }), makeItem({ type: 'FIXME' })]
    const filtered = filterTodos(items, { assignee: null, priority: 'all', types: ['FIXME'] })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].type).toBe('FIXME')
  })

  it('should return all for "all" priority', () => {
    const items = [makeItem({ priority: 'high' }), makeItem({ priority: 'low' })]
    const filtered = filterTodos(items, { assignee: null, priority: 'all', types: null })
    expect(filtered).toHaveLength(2)
  })

  it('should combine filters', () => {
    const items = [
      makeItem({ priority: 'high', assignee: 'alice' }),
      makeItem({ priority: 'high', assignee: 'bob' }),
      makeItem({ priority: 'low', assignee: 'alice' }),
    ]
    const filtered = filterTodos(items, { assignee: 'alice', priority: 'high', types: null })
    expect(filtered).toHaveLength(1)
  })
})

// ─── sortTodos ──────────────────────────────────────────

describe('sortTodos', () => {
  function makeItem(overrides: Partial<TodoItem> = {}): TodoItem {
    return {
      age: null, assignee: null, author: null, category: null, context: [],
      file: 'a.ts', id: 'a.ts:1', line: 1, priority: 'medium', tags: [],
      text: 'fix', type: 'TODO', ...overrides,
    }
  }

  it('should sort by priority (high first)', () => {
    const items = [makeItem({ priority: 'low' }), makeItem({ priority: 'high' }), makeItem({ priority: 'medium' })]
    const sorted = sortTodos(items, 'priority')
    expect(sorted[0].priority).toBe('high')
    expect(sorted[1].priority).toBe('medium')
    expect(sorted[2].priority).toBe('low')
  })

  it('should sort by file path', () => {
    const items = [makeItem({ file: 'z.ts' }), makeItem({ file: 'a.ts' })]
    const sorted = sortTodos(items, 'file')
    expect(sorted[0].file).toBe('a.ts')
  })

  it('should sort by age (oldest first)', () => {
    const items = [makeItem({ age: 5 }), makeItem({ age: 30 }), makeItem({ age: 10 })]
    const sorted = sortTodos(items, 'age')
    expect(sorted[0].age).toBe(30)
    expect(sorted[1].age).toBe(10)
    expect(sorted[2].age).toBe(5)
  })

  it('should handle empty list', () => {
    expect(sortTodos([], 'priority')).toHaveLength(0)
  })
})

// ─── buildTodoListResult ────────────────────────────────

describe('buildTodoListResult', () => {
  it('should return empty for no files', async () => {
    const result = await buildTodoListResult(
      [],
      async () => '',
      { assignee: null, contextLines: 2, extensions: null, ignorePatterns: [], priority: 'all', sort: 'priority' },
    )
    expect(result.items).toHaveLength(0)
    expect(result.stats.total).toBe(0)
  })

  it('should extract TODOs from content', async () => {
    const files = ['app.ts']
    const reader = async () => '// TODO: fix this\n// FIXME: broken\n'
    const result = await buildTodoListResult(files, reader, {
      assignee: null, contextLines: 2, extensions: null, ignorePatterns: [], priority: 'all', sort: 'priority',
    })
    expect(result.items).toHaveLength(2)
  })

  it('should filter by priority', async () => {
    const files = ['app.ts']
    const reader = async () => '// TODO: low !\n// TODO: high !!!\n'
    const result = await buildTodoListResult(files, reader, {
      assignee: null, contextLines: 2, extensions: null, ignorePatterns: [], priority: 'high', sort: 'priority',
    })
    expect(result.items).toHaveLength(1)
    expect(result.items[0].priority).toBe('high')
  })

  it('should filter by assignee', async () => {
    const files = ['app.ts']
    const reader = async () => '// TODO(@alice): her task\n// TODO(@bob): his task\n'
    const result = await buildTodoListResult(files, reader, {
      assignee: 'alice', contextLines: 2, extensions: null, ignorePatterns: [], priority: 'all', sort: 'priority',
    })
    expect(result.items).toHaveLength(1)
    expect(result.items[0].assignee).toBe('alice')
  })

  it('should filter by extension', async () => {
    const files = ['a.ts', 'b.py']
    const reader = async () => '// TODO: fix\n'
    const result = await buildTodoListResult(files, reader, {
      assignee: null, contextLines: 2, extensions: ['.ts'], ignorePatterns: [], priority: 'all', sort: 'priority',
    })
    expect(result.stats.total).toBe(1)
  })

  it('should skip unreadable files', async () => {
    const files = ['missing.ts']
    const reader = async () => { throw new Error('not found') }
    const result = await buildTodoListResult(files, reader, {
      assignee: null, contextLines: 2, extensions: null, ignorePatterns: [], priority: 'all', sort: 'priority',
    })
    expect(result.items).toHaveLength(0)
  })

  it('should compute stats', async () => {
    const files = ['app.ts']
    const reader = async () => '// TODO: a\n// FIXME: b\n// TODO: c !!!\n'
    const result = await buildTodoListResult(files, reader, {
      assignee: null, contextLines: 2, extensions: null, ignorePatterns: [], priority: 'all', sort: 'priority',
    })
    expect(result.stats.byType['TODO']).toBe(2)
    expect(result.stats.byType['FIXME']).toBe(1)
    expect(result.stats.byPriority['high']).toBe(1)
  })

  it('should sort by file', async () => {
    const files = ['z.ts', 'a.ts']
    const reader = async (f: string) => f === 'a.ts' ? '// TODO: first\n' : '// TODO: second\n'
    const result = await buildTodoListResult(files, reader, {
      assignee: null, contextLines: 2, extensions: null, ignorePatterns: [], priority: 'all', sort: 'file',
    })
    expect(result.items[0].file).toBe('a.ts')
  })
})

// ─── formatPriority ─────────────────────────────────────

describe('formatPriority', () => {
  it('should contain HIGH for high', () => {
    expect(formatPriority('high')).toContain('HIGH')
  })

  it('should contain MED for medium', () => {
    expect(formatPriority('medium')).toContain('MED')
  })

  it('should contain LOW for low', () => {
    expect(formatPriority('low')).toContain('LOW')
  })
})

// ─── formatTodoListTable ────────────────────────────────

describe('formatTodoListTable', () => {
  function makeResult(): TodoListResult {
    return {
      items: [
        {
          age: null, assignee: 'alice', author: null, category: 'auth', context: [],
          file: 'src/app.ts', id: 'src/app.ts:10', line: 10, priority: 'high',
          tags: ['security'], text: 'Fix auth bug', type: 'FIXME',
        },
      ],
      stats: {
        byAssignee: { alice: 1 }, byFile: { 'src/app.ts': 1 }, byPriority: { high: 1 },
        byTag: { security: 1 }, byType: { FIXME: 1 }, oldestItem: null, newestItem: null, total: 1,
      },
    }
  }

  it('should contain TODO List header', () => {
    expect(formatTodoListTable(makeResult(), false)).toContain('TODO List')
  })

  it('should show file name', () => {
    expect(formatTodoListTable(makeResult(), false)).toContain('src/app.ts')
  })

  it('should show item text', () => {
    expect(formatTodoListTable(makeResult(), false)).toContain('Fix auth bug')
  })

  it('should show summary', () => {
    expect(formatTodoListTable(makeResult(), false)).toContain('Summary')
  })

  it('should show assignee in verbose mode', () => {
    expect(formatTodoListTable(makeResult(), true)).toContain('alice')
  })

  it('should show tags in verbose mode', () => {
    expect(formatTodoListTable(makeResult(), true)).toContain('security')
  })

  it('should show clean message for empty results', () => {
    const r: TodoListResult = { items: [], stats: { byAssignee: {}, byFile: {}, byPriority: {}, byTag: {}, byType: {}, oldestItem: null, newestItem: null, total: 0 } }
    expect(formatTodoListTable(r, false)).toContain('clean codebase')
  })
})

// ─── formatTodoListJson ─────────────────────────────────

describe('formatTodoListJson', () => {
  it('should produce valid JSON', () => {
    const r: TodoListResult = { items: [], stats: { byAssignee: {}, byFile: {}, byPriority: {}, byTag: {}, byType: {}, oldestItem: null, newestItem: null, total: 0 } }
    expect(() => JSON.parse(formatTodoListJson(r))).not.toThrow()
  })

  it('should serialize items', () => {
    const r: TodoListResult = {
      items: [{
        age: null, assignee: 'bob', author: null, category: null, context: [],
        file: 'a.ts', id: 'a.ts:1', line: 1, priority: 'high', tags: [],
        text: 'fix', type: 'TODO',
      }],
      stats: { byAssignee: { bob: 1 }, byFile: { 'a.ts': 1 }, byPriority: { high: 1 }, byTag: {}, byType: { TODO: 1 }, oldestItem: null, newestItem: null, total: 1 },
    }
    const parsed = JSON.parse(formatTodoListJson(r))
    expect(parsed.items[0].assignee).toBe('bob')
    expect(parsed.stats.total).toBe(1)
  })
})

// ─── Command metadata ───────────────────────────────────

describe('TodoList command', () => {
  it('should have correct description', () => {
    expect(TodoList.description).toContain('TODO')
  })

  it('should have path arg', () => {
    expect(TodoList.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(TodoList.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(TodoList.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(TodoList.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(TodoList.flags.ext).toBeDefined()
  })

  it('should have priority flag', () => {
    expect(TodoList.flags.priority).toBeDefined()
  })

  it('should have assignee flag', () => {
    expect(TodoList.flags.assignee).toBeDefined()
  })

  it('should have sort flag', () => {
    expect(TodoList.flags.sort).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(TodoList.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(TodoList.examples.length).toBeGreaterThan(0)
  })
})
