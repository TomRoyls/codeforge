// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single code tag (TODO, FIXME, HACK, etc.).
 *
 * @example
 * const t: CodeTag = { type: 'TODO', file: 'src/app.ts', line: 42, message: 'refactor this', priority: 'medium', lineContent: '// TODO: refactor this', context: '', age: 0, author: '', date: '' }
 */
export interface CodeTag {
  type: string
  file: string
  line: number
  lineContent: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  author: string
  date: string
  age: number
  context: string
}

/**
 * Summary for a tag type.
 *
 * @example
 * const s: TagSummary = { type: 'TODO', count: 5, oldest: null, newest: null, averageAge: 10, files: ['a.ts'] }
 */
export interface TagSummary {
  type: string
  count: number
  oldest: CodeTag | null
  newest: CodeTag | null
  averageAge: number
  files: string[]
}

/**
 * Author tag breakdown.
 *
 * @example
 * const a: TagAuthor = { author: 'alice', count: 3, types: { TODO: 2, FIXME: 1 } }
 */
export interface TagAuthor {
  author: string
  count: number
  types: Record<string, number>
}

/**
 * Overall tag statistics.
 *
 * @example
 * const s: TagStats = { totalTags: 10, tagDensity: 2.5, criticalCount: 0, highCount: 1, mediumCount: 8, lowCount: 1, deprecatedCount: 0, averageAge: 30 }
 */
export interface TagStats {
  totalTags: number
  tagDensity: number
  oldestTag: CodeTag | null
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  deprecatedCount: number
  averageAge: number
}

/**
 * Complete tag analysis result.
 *
 * @example
 * const r: TagResult = { tags: [], summaries: [], authors: [], stats: s, priority: [], recommendations: [] }
 */
export interface TagResult {
  tags: CodeTag[]
  summaries: TagSummary[]
  authors: TagAuthor[]
  stats: TagStats
  priority: CodeTag[]
  recommendations: string[]
}

/**
 * Options for tag analysis.
 *
 * @example
 * const o: TagOptions = { type: 'todo', verbose: false }
 */
export interface TagOptions {
  type?: string
  verbose?: boolean
}

// ─── Tag Detection ────────────────────────────────────────────────────────────

const TAG_PATTERN = /\b(TODO|FIXME|HACK|XXX|NOTE|PERF|BUG|OPTIMIZE|DEPRECATED)\b/gi
const KNOWN_TYPES = new Set(['TODO', 'FIXME', 'HACK', 'XXX', 'NOTE', 'PERF', 'BUG', 'OPTIMIZE', 'DEPRECATED'])

/**
 * Extract all code tags from file content.
 *
 * @example
 * extractTags('// TODO: fix this', 'app.ts') // [{ type: 'TODO', ... }]
 */
export function extractTags(content: string, filePath: string): CodeTag[] {
  const tags: CodeTag[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    let match: RegExpExecArray | null

    TAG_PATTERN.lastIndex = 0
    while ((match = TAG_PATTERN.exec(line)) !== null) {
      const rawType = (match[1] ?? '').toUpperCase()
      if (!KNOWN_TYPES.has(rawType)) continue

      const tagType = rawType
      const startOfMsg = match.index + match[0]!.length
      const rawMsg = line.slice(startOfMsg).replace(/^[\s:;-]+/, '').trim()
      const message = rawMsg || '(no message)'

      tags.push({
        type: tagType,
        file: filePath,
        line: i + 1,
        lineContent: line.trim(),
        message,
        priority: determinePriority(tagType),
        author: '',
        date: '',
        age: 0,
        context: extractContext(lines, i),
      })
    }
  }

  return tags
}

/**
 * Parse tag type and message from a line.
 *
 * @example
 * parseTagType('// TODO: refactor') // { type: 'TODO', message: 'refactor' }
 */
export function parseTagType(line: string): { type: string; message: string } | null {
  TAG_PATTERN.lastIndex = 0
  const match = TAG_PATTERN.exec(line)
  if (!match) return null

  const type = (match[1] ?? '').toUpperCase()
  const startOfMsg = match.index + match[0]!.length
  const message = line.slice(startOfMsg).replace(/^[\s:;-]+/, '').trim() || '(no message)'
  return { type, message }
}

// ─── Priority ─────────────────────────────────────────────────────────────────

const PRIORITY_MAP: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  BUG: 'critical',
  FIXME: 'high',
  HACK: 'high',
  DEPRECATED: 'high',
  XXX: 'medium',
  TODO: 'medium',
  PERF: 'medium',
  OPTIMIZE: 'medium',
  NOTE: 'low',
}

/**
 * Map a tag type to priority.
 *
 * @example
 * determinePriority('BUG') // 'critical'
 */
export function determinePriority(tagType: string): 'low' | 'medium' | 'high' | 'critical' {
  return PRIORITY_MAP[tagType.toUpperCase()] ?? 'medium'
}

// ─── Context Extraction ───────────────────────────────────────────────────────

/**
 * Extract surrounding context (2 lines before/after).
 *
 * @example
 * extractContext(lines, 5) // '  line3\n  line4\n> line5\n  line6\n  line7'
 */
export function extractContext(lines: string[], lineIndex: number): string {
  const start = Math.max(0, lineIndex - 2)
  const end = Math.min(lines.length - 1, lineIndex + 2)
  const parts: string[] = []
  for (let i = start; i <= end; i++) {
    const prefix = i === lineIndex ? '> ' : '  '
    parts.push(`${prefix}${lines[i]!.trim()}`)
  }
  return parts.join('\n')
}

// ─── Summarization ────────────────────────────────────────────────────────────

/**
 * Summarize tags grouped by type.
 *
 * @example
 * summarizeByType(tags) // [{ type: 'TODO', count: 5, ... }]
 */
export function summarizeByType(tags: CodeTag[]): TagSummary[] {
  const groups = new Map<string, CodeTag[]>()

  for (const tag of tags) {
    const list = groups.get(tag.type) ?? []
    list.push(tag)
    groups.set(tag.type, list)
  }

  const summaries: TagSummary[] = []
  for (const [type, list] of groups) {
    const sorted = [...list].sort((a, b) => b.age - a.age)
    const totalAge = list.reduce((s, t) => s + t.age, 0)
    summaries.push({
      type,
      count: list.length,
      oldest: sorted[0] ?? null,
      newest: sorted[sorted.length - 1] ?? null,
      averageAge: list.length > 0 ? Math.round(totalAge / list.length) : 0,
      files: [...new Set(list.map((t) => t.file))],
    })
  }

  return summaries.sort((a, b) => b.count - a.count)
}

/**
 * Summarize tags grouped by author.
 *
 * @example
 * summarizeByAuthor(tags) // [{ author: 'alice', count: 3, types: { TODO: 2 } }]
 */
export function summarizeByAuthor(tags: CodeTag[]): TagAuthor[] {
  const groups = new Map<string, CodeTag[]>()

  for (const tag of tags) {
    if (!tag.author) continue
    const list = groups.get(tag.author) ?? []
    list.push(tag)
    groups.set(tag.author, list)
  }

  const authors: TagAuthor[] = []
  for (const [author, list] of groups) {
    const types: Record<string, number> = {}
    for (const t of list) {
      types[t.type] = (types[t.type] ?? 0) + 1
    }
    authors.push({ author, count: list.length, types })
  }

  return authors.sort((a, b) => b.count - a.count)
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Compute aggregate tag statistics.
 *
 * @example
 * computeTagStats(tags, 5000) // { totalTags: 10, tagDensity: 2.0, ... }
 */
export function computeTagStats(tags: CodeTag[], totalLines: number): TagStats {
  const totalTags = tags.length
  const tagDensity = totalLines > 0 ? Math.round((totalTags / totalLines) * 1000 * 10) / 10 : 0

  let oldestTag: CodeTag | null = null
  for (const t of tags) {
    if (t.age > 0 && (!oldestTag || t.age > oldestTag.age)) {
      oldestTag = t
    }
  }

  const criticalCount = tags.filter((t) => t.priority === 'critical').length
  const highCount = tags.filter((t) => t.priority === 'high').length
  const mediumCount = tags.filter((t) => t.priority === 'medium').length
  const lowCount = tags.filter((t) => t.priority === 'low').length
  const deprecatedCount = tags.filter((t) => t.type === 'DEPRECATED').length

  const totalAge = tags.reduce((s, t) => s + t.age, 0)
  const averageAge = totalTags > 0 ? Math.round(totalAge / totalTags) : 0

  return {
    totalTags,
    tagDensity,
    oldestTag,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    deprecatedCount,
    averageAge,
  }
}

// ─── Prioritization ───────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

/**
 * Sort tags by priority (critical first), then by age (oldest first).
 *
 * @example
 * prioritizeTags(tags) // [criticalTag, highOldTag, highNewTag, ...]
 */
export function prioritizeTags(tags: CodeTag[]): CodeTag[] {
  return [...tags].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 2
    const pb = PRIORITY_ORDER[b.priority] ?? 2
    if (pa !== pb) return pa - pb
    return b.age - a.age
  })
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate actionable recommendations from tag analysis.
 *
 * @example
 * generateRecommendations(stats, summaries) // ['Critical tag in app.ts needs immediate attention']
 */
export function generateRecommendations(stats: TagStats, summaries: TagSummary[]): string[] {
  const recs: string[] = []

  if (stats.criticalCount > 0) {
    recs.push(`${stats.criticalCount} critical tag(s) (BUG) need immediate attention.`)
  }

  if (stats.highCount > 0) {
    recs.push(`${stats.highCount} high-priority tag(s) (FIXME/HACK/DEPRECATED) should be addressed soon.`)
  }

  const staleTypes = summaries.filter((s) => s.averageAge > 90)
  for (const s of staleTypes) {
    recs.push(`${s.count} ${s.type} tag(s) are older than 90 days on average. Consider resolving or removing stale tags.`)
  }

  if (stats.deprecatedCount > 0) {
    recs.push(`${stats.deprecatedCount} DEPRECATED tag(s) found. Plan removal or migration.`)
  }

  if (stats.tagDensity > 10) {
    recs.push(`Tag density is ${stats.tagDensity} per 1000 lines. Consider a tag cleanup sprint.`)
  }

  if (recs.length === 0) {
    recs.push('No actionable tags found. Codebase is clean.')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete tag analysis result.
 *
 * @example
 * const result = buildTagResult(files, contents, {})
 */
export function buildTagResult(
  files: string[],
  contents: string[],
  options: TagOptions = {},
): TagResult {
  const allTags: CodeTag[] = []
  let totalLines = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    totalLines += content.split('\n').length
    const extracted = extractTags(content, files[i]!)
    allTags.push(...extracted)
  }

  let filtered = allTags
  if (options.type && options.type !== 'all') {
    const targetType = options.type.toUpperCase()
    filtered = allTags.filter((t) => t.type === targetType)
  }

  const summaries = summarizeByType(filtered)
  const authors = summarizeByAuthor(filtered)
  const stats = computeTagStats(filtered, totalLines)
  const priority = prioritizeTags(filtered)
  const recommendations = generateRecommendations(stats, summaries)

  return { tags: filtered, summaries, authors, stats, priority, recommendations }
}
