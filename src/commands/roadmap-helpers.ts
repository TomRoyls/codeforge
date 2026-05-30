import { basename } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type RoadmapCategory = 'feature' | 'quality' | 'security' | 'performance' | 'testing' | 'documentation'
export type RoadmapPriority = 'critical' | 'high' | 'medium' | 'low'

export interface RoadmapItem {
  id: string
  title: string
  description: string
  category: RoadmapCategory
  priority: RoadmapPriority
  effort: number
  impact: number
  files: string[]
  evidence: string
  dependencies: string[]
}

export interface RoadmapPhase {
  name: string
  items: RoadmapItem[]
  totalEffort: number
  description: string
}

export interface RoadmapStats {
  totalItems: number
  totalEffort: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  criticalItems: number
}

export interface TimelineEntry {
  week: number
  items: string[]
  description: string
  effort: number
}

export interface RoadmapResult {
  phases: RoadmapPhase[]
  stats: RoadmapStats
  timeline: TimelineEntry[]
}

export interface RoadmapOptions {
  verbose: boolean
  maxEffort: number
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── scanForTodos ───────────────────────────────────────

/**
 * @example
 * const items = scanForTodos(['src/main.ts'], async (f) => '// TODO: fix this')
 * console.log(items.length)
 */
export function scanForTodos(
  files: string[],
  contents: Map<string, string>,
): RoadmapItem[] {
  const items: RoadmapItem[] = []
  const todoPattern = /(?:\/\/|#|<!--)\s*(TODO|FIXME|HACK|XXX)\b[:\s]*(.*)/gi

  for (const file of files) {
    const content = contents.get(file)
    if (!content) continue

    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      todoPattern.lastIndex = 0
      const match = todoPattern.exec(line ?? '')
      if (match) {
        const tag = match?.[1]?.toUpperCase()
        const message = match?.[2]?.trim() || 'No description'
        const isFixme = tag === 'FIXME' || tag === 'XXX'
        items.push({
          category: tag === 'HACK' ? 'quality' : 'feature',
          dependencies: [],
          description: `${tag}: ${message}`,
          effort: isFixme ? 4 : 2,
          evidence: `Found in ${basename(file)}:${i + 1}: "${line?.trim()}"`,
          files: [file],
          id: `todo-${file}-${i}`,
          impact: isFixme ? 7 : 5,
          priority: isFixme ? 'high' : 'medium',
          title: message.length > 60 ? message.slice(0, 57) + '...' : message,
        })
      }
    }
  }

  return items
}

// ─── scanForMissingTests ────────────────────────────────

/**
 * @example
 * const items = scanForMissingTests(['src/main.ts'], contents)
 * console.log(items.length)
 */
export function scanForMissingTests(
  files: string[],
  contents: Map<string, string>,
): RoadmapItem[] {
  const items: RoadmapItem[] = []
  const testFiles = new Set(
    files.filter((f) => /(?:test|spec|__tests__)/.test(f)),
  )

  const sourceFiles = files.filter(
    (f) =>
      !/(?:test|spec|__tests__)/.test(f) &&
      /\.(ts|js|tsx|jsx)$/.test(f) &&
      !f.includes('node_modules'),
  )

  for (const srcFile of sourceFiles) {
    const base = basename(srcFile).replace(/\.(ts|js|tsx|jsx)$/, '')
    const hasTest = files.some(
      (f) =>
        (f.includes(base) && testFiles.has(f)) ||
        f.endsWith(`${base}.test.ts`) ||
        f.endsWith(`${base}.spec.ts`) ||
        f.endsWith(`${base}.test.js`) ||
        f.endsWith(`${base}.spec.js`),
    )

    if (!hasTest) {
      const content = contents.get(srcFile) ?? ''
      const exportCount = (content.match(/export\s+(function|class|const|interface|type|default)/g) ?? []).length
      if (exportCount === 0) continue

      items.push({
        category: 'testing',
        dependencies: [],
        description: `No test file found for ${basename(srcFile)} (${exportCount} exports)`,
        effort: Math.max(2, Math.min(8, exportCount)),
        evidence: `Source file ${srcFile} has ${exportCount} exports but no corresponding test file`,
        files: [srcFile],
        id: `test-${srcFile}`,
        impact: 6,
        priority: 'high',
        title: `Add tests for ${basename(srcFile)}`,
      })
    }
  }

  return items
}

// ─── scanForSecurityGaps ────────────────────────────────

/**
 * @example
 * const items = scanForSecurityGaps(files, contents)
 * console.log(items[0].category)
 */
export function scanForSecurityGaps(
  files: string[],
  contents: Map<string, string>,
): RoadmapItem[] {
  const items: RoadmapItem[] = []
  const patterns: Array<{ evidence: string; pattern: RegExp; title: string }> = [
    { evidence: 'Use of eval() detected', pattern: /\beval\s*\(/, title: 'Remove eval() usage' },
    { evidence: 'Use of innerHTML detected', pattern: /\.innerHTML\s*=/, title: 'Replace innerHTML with safe alternative' },
    { evidence: 'Hardcoded secret pattern detected', pattern: /(?:password|secret|api_key|apikey|token)\s*[:=]\s*['"][^'"]+['"]/i, title: 'Remove hardcoded secrets' },
    { evidence: 'SQL string interpolation detected', pattern: /(?:query|execute|run)\s*\(\s*[`'"].*\$\{/, title: 'Use parameterized SQL queries' },
    { evidence: 'Use of Function constructor detected', pattern: /new\s+Function\s*\(/, title: 'Remove Function constructor usage' },
    { evidence: 'Dangerous child_process exec detected', pattern: /exec\s*\(\s*['"`].*\$\{/, title: 'Sanitize child_process input' },
  ]

  for (const file of files) {
    const content = contents.get(file)
    if (!content) continue

    for (const { evidence, pattern, title } of patterns) {
      if (pattern.test(content)) {
        items.push({
          category: 'security',
          dependencies: [],
          description: `${evidence} in ${basename(file)}`,
          effort: 4,
          evidence: `${evidence} in ${file}`,
          files: [file],
          id: `sec-${file}-${title.slice(0, 20).replace(/\s/g, '-')}`,
          impact: 9,
          priority: 'critical',
          title,
        })
      }
    }
  }

  return items
}

// ─── scanForPerfOpportunities ───────────────────────────

/**
 * @example
 * const items = scanForPerfOpportunities(files, contents)
 * console.log(items.length)
 */
export function scanForPerfOpportunities(
  files: string[],
  contents: Map<string, string>,
): RoadmapItem[] {
  const items: RoadmapItem[] = []

  for (const file of files) {
    const content = contents.get(file)
    if (!content) continue

    if (/\.forEach\s*\(\s*async/.test(content)) {
      items.push({
        category: 'performance',
        dependencies: [],
        description: 'async forEach does not await — use for-of loop',
        effort: 2,
        evidence: `async forEach found in ${file}`,
        files: [file],
        id: `perf-foreach-${file}`,
        impact: 5,
        priority: 'medium',
        title: `Fix async forEach in ${basename(file)}`,
      })
    }

    const syncReads = content.match(/readFileSync|writeFileSync|existsSync/g)
    if (syncReads && syncReads.length > 0) {
      items.push({
        category: 'performance',
        dependencies: [],
        description: `Found ${syncReads.length} synchronous file operation(s)`,
        effort: 3,
        evidence: `Sync I/O in ${file}: ${syncReads.join(', ')}`,
        files: [file],
        id: `perf-syncio-${file}`,
        impact: 6,
        priority: 'medium',
        title: `Replace sync I/O in ${basename(file)}`,
      })
    }

    const nestedLoops = content.match(/for\s*\(.*\n.*for\s*\(/g)
    if (nestedLoops && nestedLoops.length > 0) {
      items.push({
        category: 'performance',
        dependencies: [],
        description: `Found ${nestedLoops.length} nested loop(s)`,
        effort: 6,
        evidence: `Nested loops in ${file}`,
        files: [file],
        id: `perf-nested-${file}`,
        impact: 5,
        priority: 'low',
        title: `Optimize nested loops in ${basename(file)}`,
      })
    }
  }

  return items
}

// ─── scanForDocGaps ─────────────────────────────────────

/**
 * @example
 * const items = scanForDocGaps(files, contents)
 * console.log(items[0].category)
 */
export function scanForDocGaps(
  files: string[],
  contents: Map<string, string>,
): RoadmapItem[] {
  const items: RoadmapItem[] = []

  const srcFiles = files.filter(
    (f) => /\.(ts|js)$/.test(f) && !f.includes('node_modules'),
  )

  for (const file of srcFiles) {
    const content = contents.get(file)
    if (!content) continue

    const exportMatches = content.matchAll(
      /export\s+(?:async\s+)?function\s+(\w+)/g,
    )
    for (const match of exportMatches) {
      const fnName = match[1]
      const precedingText = content.slice(Math.max(0, match.index! - 200), match.index!)
      if (!precedingText.includes('/**') && !precedingText.includes('* @')) {
        items.push({
          category: 'documentation',
          dependencies: [],
          description: `Exported function ${fnName} lacks JSDoc`,
          effort: 1,
          evidence: `No JSDoc before export function ${fnName} in ${file}`,
          files: [file],
          id: `doc-${file}-${fnName}`,
          impact: 3,
          priority: 'low',
          title: `Document ${fnName}() in ${basename(file)}`,
        })
      }
    }
  }

  if (items.length > 20) return items.slice(0, 20)
  return items
}

// ─── prioritizeItem ─────────────────────────────────────

/**
 * @example
 * const p = prioritizeItem({ category: 'security', impact: 9 })
 * console.log(p)
 */
export function prioritizeItem(item: Pick<RoadmapItem, 'category' | 'impact'>): RoadmapPriority {
  if (item.category === 'security' && item.impact >= 7) return 'critical'
  if (item.impact >= 8) return 'critical'
  if (item.category === 'security' || item.impact >= 6) return 'high'
  if (item.category === 'testing' || item.impact >= 4) return 'medium'
  return 'low'
}

// ─── estimateEffort ─────────────────────────────────────

/**
 * @example
 * const hours = estimateEffort({ category: 'security', files: ['a.ts'], impact: 9 })
 * console.log(hours)
 */
export function estimateEffort(item: Pick<RoadmapItem, 'category' | 'files' | 'impact'>): number {
  const baseEffort: Record<RoadmapCategory, number> = {
    documentation: 1,
    feature: 4,
    performance: 6,
    quality: 3,
    security: 4,
    testing: 3,
  }
  const base = baseEffort[item.category]
  const fileMultiplier = Math.min(item.files.length, 5) * 0.5
  return Math.round(base + fileMultiplier)
}

// ─── phaseItems ─────────────────────────────────────────

/**
 * @example
 * const phases = phaseItems(items)
 * console.log(phases[0].name)
 */
export function phaseItems(items: RoadmapItem[]): RoadmapPhase[] {
  const critical = items.filter((i) => i.priority === 'critical')
  const high = items.filter((i) => i.priority === 'high')
  const medium = items.filter((i) => i.priority === 'medium')
  const low = items.filter((i) => i.priority === 'low')

  return [
    {
      description: 'Security vulnerabilities and critical issues that must be addressed immediately',
      items: critical,
      name: 'Phase 1: Critical Fixes',
      totalEffort: critical.reduce((s, i) => s + i.effort, 0),
    },
    {
      description: 'Missing test coverage and high-priority feature work',
      items: high,
      name: 'Phase 2: High Priority',
      totalEffort: high.reduce((s, i) => s + i.effort, 0),
    },
    {
      description: 'Performance improvements and quality enhancements',
      items: medium,
      name: 'Phase 3: Improvements',
      totalEffort: medium.reduce((s, i) => s + i.effort, 0),
    },
    {
      description: 'Nice-to-have improvements and documentation',
      items: low,
      name: 'Phase 4: Nice-to-Have',
      totalEffort: low.reduce((s, i) => s + i.effort, 0),
    },
  ].filter((p) => p.items.length > 0)
}

// ─── buildTimeline ──────────────────────────────────────

const HOURS_PER_WEEK = 40

/**
 * @example
 * const timeline = buildTimeline(phases)
 * console.log(timeline[0].week)
 */
export function buildTimeline(phases: RoadmapPhase[]): TimelineEntry[] {
  const timeline: TimelineEntry[] = []
  let currentWeek = 1
  let weekEffort = 0
  let weekItems: string[] = []
  let weekDescription: string[] = []

  for (const phase of phases) {
    for (const item of phase.items) {
      if (weekEffort + item.effort > HOURS_PER_WEEK && weekItems.length > 0) {
        timeline.push({
          description: weekDescription.join(', '),
          effort: weekEffort,
          items: weekItems,
          week: currentWeek,
        })
        currentWeek++
        weekEffort = 0
        weekItems = []
        weekDescription = []
      }
      weekItems.push(item.id)
      weekEffort += item.effort
      weekDescription.push(item.title)
    }
  }

  if (weekItems.length > 0) {
    timeline.push({
      description: weekDescription.join(', '),
      effort: weekEffort,
      items: weekItems,
      week: currentWeek,
    })
  }

  return timeline
}

// ─── computeStats ───────────────────────────────────────

/**
 * @example
 * const stats = computeStats(items)
 * console.log(stats.totalItems)
 */
export function computeStats(items: RoadmapItem[]): RoadmapStats {
  const byCategory: Record<string, number> = {}
  const byPriority: Record<string, number> = {}

  let totalEffort = 0
  let criticalItems = 0

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1
    byPriority[item.priority] = (byPriority[item.priority] ?? 0) + 1
    totalEffort += item.effort
    if (item.priority === 'critical') criticalItems++
  }

  return {
    byCategory,
    byPriority,
    criticalItems,
    totalEffort,
    totalItems: items.length,
  }
}

// ─── buildRoadmapResult ─────────────────────────────────

/**
 * @example
 * const result = buildRoadmapResult(files, contents, { verbose: false, maxEffort: 0 })
 * console.log(result.phases.length)
 */
export function buildRoadmapResult(
  files: string[],
  contents: Map<string, string>,
  options: RoadmapOptions,
): RoadmapResult {
  const allItems: RoadmapItem[] = [
    ...scanForTodos(files, contents),
    ...scanForMissingTests(files, contents),
    ...scanForSecurityGaps(files, contents),
    ...scanForPerfOpportunities(files, contents),
    ...scanForDocGaps(files, contents),
  ]

  const seen = new Set<string>()
  const unique: RoadmapItem[] = []
  for (const item of allItems) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      unique.push(item)
    }
  }

  const filtered = options.maxEffort > 0
    ? unique.filter((i) => i.effort <= options.maxEffort)
    : unique

  const phases = phaseItems(filtered)
  const stats = computeStats(filtered)
  const timeline = buildTimeline(phases)

  return { phases, stats, timeline }
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/roadmap-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  return basename(filePath).replace(/\.ts$/, '')
}
