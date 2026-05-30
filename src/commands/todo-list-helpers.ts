// ─── Interfaces ──────────────────────────────────────────

export type TodoType = 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'NOTE' | 'OPTIMIZE'
export type TodoPriority = 'high' | 'medium' | 'low'

export interface TodoItem {
  id: string
  text: string
  type: TodoType
  priority: TodoPriority
  assignee: string | null
  tags: string[]
  category: string | null
  file: string
  line: number
  context: string[]
  age: number | null
  author: string | null
}

export interface TodoStats {
  total: number
  byType: Record<string, number>
  byPriority: Record<string, number>
  byAssignee: Record<string, number>
  byFile: Record<string, number>
  byTag: Record<string, number>
  oldestItem: TodoItem | null
  newestItem: TodoItem | null
}

export interface TodoListResult {
  items: TodoItem[]
  stats: TodoStats
}

export interface TodoFilterOptions {
  priority: 'all' | 'high' | 'medium' | 'low'
  assignee: string | null
  types: TodoType[] | null
}

export interface TodoListOptions {
  extensions: string[] | null
  ignorePatterns: string[]
  priority: 'all' | 'high' | 'medium' | 'low'
  assignee: string | null
  sort: 'priority' | 'file' | 'age'
  contextLines: number
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── parseTodoText ──────────────────────────────────────

const PRIORITY_MAP: Record<string, TodoPriority> = {
  '!!!': 'high',
  '!!': 'medium',
  '!': 'low',
}

/**
 * Extract metadata from a TODO comment text.
 *
 * @example
 * ```ts
 * const meta = parseTodoText('TODO(@alice) [auth] Implement login #security !!!')
 * meta.assignee // 'alice'
 * meta.priority // 'high'
 * ```
 */
export function parseTodoText(rawText: string): {
  text: string
  assignee: string | null
  tags: string[]
  category: string | null
  priority: TodoPriority
} {
  let text = rawText.trim()
  let assignee: string | null = null
  const tags: string[] = []
  let category: string | null = null
  let priority: TodoPriority = 'medium'

  const assigneeMatch = text.match(/@(\w+)/)
  if (assigneeMatch) {
    assignee = assigneeMatch[1] ?? null
    text = text.replace(/@\w+/, '').trim()
  }

  const categoryMatch = text.match(/\[([^\]]+)\]/)
  if (categoryMatch) {
    category = categoryMatch[1] ?? null
    text = text.replace(/\[[^\]]+\]/, '').trim()
  }

  const tagMatches = text.match(/#(\w+)/g)
  if (tagMatches) {
    for (const tag of tagMatches) {
      tags.push(tag.slice(1))
    }
    text = text.replace(/#\w+/g, '').trim()
  }

  for (const [marker, prio] of Object.entries(PRIORITY_MAP)) {
    if (text.includes(marker)) {
      priority = prio
      text = text.replace(marker, '').trim()
      break
    }
  }

  return { assignee, category, priority, tags, text }
}

// ─── extractTodos ───────────────────────────────────────

const TODO_TYPES = ['TODO', 'FIXME', 'HACK', 'XXX', 'NOTE', 'OPTIMIZE'] as const
const TODO_REGEX = new RegExp(
  `(?:\/\/|#|\\/\\*|<!--)\\s*(${TODO_TYPES.join('|')})(?:\\s*\\(@?(\\w+)\\))?[:\\s]\\s*(.+)`,
  'i',
)

/**
 * Extract all TODO/FIXME/HACK/XXX/NOTE/OPTIMIZE comments from source content.
 *
 * @example
 * ```ts
 * const items = extractTodos('// TODO: fix this\nconst x = 1\n', 'app.ts')
 * items[0]?.type // 'TODO'
 * ```
 */
export function extractTodos(content: string, filePath: string, contextLines: number = 2): TodoItem[] {
  const items: TodoItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const match = TODO_REGEX.exec(line)
    if (!match) continue

    const typeStr = (match[1] ?? '').toUpperCase()
    const inlineAssignee = match[2] ?? null
    const rawText = match[3] ?? ''

    const type = TODO_TYPES.includes(typeStr as TodoType) ? typeStr as TodoType : 'TODO'
    const meta = parseTodoText(rawText)
    const assignee = inlineAssignee ?? meta.assignee

    const contextStart = Math.max(0, i - contextLines)
    const contextEnd = Math.min(lines.length, i + contextLines + 1)
    const context = lines.slice(contextStart, contextEnd)

    items.push({
      age: null,
      assignee,
      author: null,
      category: meta.category,
      context,
      file: filePath,
      id: `${filePath}:${i + 1}`,
      line: i + 1,
      priority: meta.priority,
      tags: meta.tags,
      text: meta.text,
      type,
    })
  }

  return items
}

// ─── computeTodoStats ───────────────────────────────────

/**
 * Aggregate TODO statistics by type, priority, assignee, file, and tags.
 *
 * @example
 * ```ts
 * const stats = computeTodoStats(items)
 * stats.byType['TODO'] // 5
 * ```
 */
export function computeTodoStats(items: TodoItem[]): TodoStats {
  const byType: Record<string, number> = {}
  const byPriority: Record<string, number> = {}
  const byAssignee: Record<string, number> = {}
  const byFile: Record<string, number> = {}
  const byTag: Record<string, number> = {}

  for (const item of items) {
    byType[item.type] = (byType[item.type] ?? 0) + 1
    byPriority[item.priority] = (byPriority[item.priority] ?? 0) + 1

    const assigneeKey = item.assignee ?? 'unassigned'
    byAssignee[assigneeKey] = (byAssignee[assigneeKey] ?? 0) + 1

    byFile[item.file] = (byFile[item.file] ?? 0) + 1

    for (const tag of item.tags) {
      byTag[tag] = (byTag[tag] ?? 0) + 1
    }
  }

  let oldestItem: TodoItem | null = null
  let newestItem: TodoItem | null = null
  for (const item of items) {
    if (item.age !== null) {
      if (oldestItem === null || item.age > (oldestItem.age ?? 0)) oldestItem = item
      if (newestItem === null || item.age < (newestItem.age ?? Infinity)) newestItem = item
    }
  }

  return {
    byAssignee,
    byFile,
    byPriority,
    byTag,
    byType,
    oldestItem,
    newestItem,
    total: items.length,
  }
}

// ─── filterTodos ────────────────────────────────────────

/**
 * Filter TODO items by priority, assignee, and type.
 *
 * @example
 * ```ts
 * const filtered = filterTodos(items, { priority: 'high', assignee: null, types: null })
 * filtered.every(i => i.priority === 'high') // true
 * ```
 */
export function filterTodos(items: TodoItem[], options: TodoFilterOptions): TodoItem[] {
  return items.filter((item) => {
    if (options.priority !== 'all' && item.priority !== options.priority) return false
    if (options.assignee && item.assignee !== options.assignee) return false
    if (options.types && !options.types.includes(item.type)) return false
    return true
  })
}

// ─── sortTodos ──────────────────────────────────────────

const PRIORITY_ORDER: Record<TodoPriority, number> = { high: 0, medium: 1, low: 2 }

/**
 * Sort TODO items by priority, file path, or age.
 *
 * @example
 * ```ts
 * const sorted = sortTodos(items, 'priority')
 * sorted[0]?.priority // 'high'
 * ```
 */
export function sortTodos(items: TodoItem[], sortBy: 'priority' | 'file' | 'age'): TodoItem[] {
  const sorted = [...items]
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
      case 'file':
        return a.file.localeCompare(b.file) || a.line - b.line
      case 'age': {
        const ageA = a.age ?? -1
        const ageB = b.age ?? -1
        return ageB - ageA
      }
    }
  })
  return sorted
}

// ─── buildTodoListResult ────────────────────────────────

/**
 * Orchestrate full TODO list extraction across all files.
 *
 * @example
 * ```ts
 * const result = await buildTodoListResult(['app.ts'], reader, options)
 * result.stats.total // number of TODOs
 * ```
 */
export async function buildTodoListResult(
  filePaths: string[],
  contentReader: ContentReader,
  options: TodoListOptions,
): Promise<TodoListResult> {
  let allItems: TodoItem[] = []

  for (const filePath of filePaths) {
    if (options.extensions) {
      const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
      if (!options.extensions.includes(ext)) continue
    }

    try {
      const content = await contentReader(filePath)
      const items = extractTodos(content, filePath, options.contextLines)
      allItems = allItems.concat(items)
    } catch {
      // skip unreadable files
    }
  }

  const filterOptions: TodoFilterOptions = {
    assignee: options.assignee,
    priority: options.priority,
    types: null,
  }
  allItems = filterTodos(allItems, filterOptions)
  allItems = sortTodos(allItems, options.sort)

  const stats = computeTodoStats(allItems)
  return { items: allItems, stats }
}
