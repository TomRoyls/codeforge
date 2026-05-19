import { basename, dirname, extname } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export interface TopFile {
  file: string
  lines: number
}

export interface BaselineMetrics {
  name: string
  timestamp: string
  totalFiles: number
  totalLines: number
  codeLines: number
  testFiles: number
  sourceFiles: number
  avgComplexity: number
  avgFunctionLength: number
  todoCount: number
  fixmeCount: number
  securityIssues: number
  deadCodeItems: number
  languages: Record<string, number>
  topFiles: TopFile[]
  directoryCounts: Record<string, number>
}

export interface BaselineDiff {
  metric: string
  baseline: number
  current: number
  delta: number
  deltaPercent: number
  status: 'improved' | 'new' | 'regressed' | 'unchanged'
}

export interface BaselineComparison {
  baselineName: string
  baselineTimestamp: string
  currentTimestamp: string
  diffs: BaselineDiff[]
  regressions: BaselineDiff[]
  improvements: BaselineDiff[]
  overallStatus: 'improved' | 'regressed' | 'unchanged'
  healthDelta: number
}

export interface BaselineStore {
  baselines: Map<string, BaselineMetrics>
}

export interface BaselineOptions {
  action?: 'compare' | 'create' | 'list'
  name?: string
  verbose?: boolean
}

export type ContentReader = (filePath: string) => Promise<string>
export type FileEntry = { absolutePath: string; path: string }

// ─── Metric Direction ───────────────────────────────────

/**
 * @example
 * const dir = classifyMetricDirection('testFiles')
 * console.log(dir) // 'good'
 */
export function classifyMetricDirection(metric: string): 'bad' | 'good' | 'neutral' {
  const goodUp: Set<string> = new Set([
    'totalFiles', 'totalLines', 'codeLines', 'testFiles', 'sourceFiles',
  ])
  const badUp: Set<string> = new Set([
    'avgComplexity', 'avgFunctionLength', 'todoCount', 'fixmeCount',
    'securityIssues', 'deadCodeItems',
  ])
  if (goodUp.has(metric)) return 'good'
  if (badUp.has(metric)) return 'bad'
  return 'neutral'
}

// ─── Capture Metrics ────────────────────────────────────

/**
 * @example
 * const metrics = captureMetrics(files, contents)
 * console.log(metrics.totalFiles)
 */
export function captureMetrics(
  files: FileEntry[],
  contents: Map<string, string>,
): BaselineMetrics {
  let totalLines = 0
  let codeLines = 0
  let testFiles = 0
  let sourceFiles = 0
  let todoCount = 0
  let fixmeCount = 0
  let securityIssues = 0
  let deadCodeItems = 0
  let totalComplexity = 0
  let complexityFiles = 0
  let totalFunctionLength = 0
  let functionCount = 0

  const languages: Record<string, number> = {}
  const fileLineCounts: TopFile[] = []
  const directoryCounts: Record<string, number> = {}

  for (const file of files) {
    const content = contents.get(file.absolutePath) ?? contents.get(file.path) ?? ''
    const ext = extname(file.path).toLowerCase()
    const base = basename(file.path).toLowerCase()
    const dir = dirname(file.path)

    const lines = content.split('\n')
    const lineCount = lines.length
    totalLines += lineCount

    const lang = languageFromExt(ext)
    languages[lang] = (languages[lang] ?? 0) + 1

    const codeLineCount = lines.filter(
      (l) => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('#'),
    ).length
    codeLines += codeLineCount

    const isTest = base.includes('.test.') || base.includes('.spec.') || base.includes('_test.') || dir.includes('test')
    if (isTest) testFiles++
    else sourceFiles++

    const fullText = content.toLowerCase()
    const todoMatches = fullText.match(/\btodo\b/g)
    todoCount += todoMatches ? todoMatches.length : 0

    const fixmeMatches = fullText.match(/\bfixme\b/g)
    fixmeCount += fixmeMatches ? fixmeMatches.length : 0

    if (/\b(eval|innerHTML|dangerouslySetInnerHTML)\b/.test(content)) securityIssues++
    if (/\bconsole\.(log|warn|error|debug|info)\b/.test(content)) deadCodeItems++

    const funcMatches = content.match(/function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/g)
    if (funcMatches) {
      functionCount += funcMatches.length
      const funcLines = funcMatches.length > 0 ? Math.round(codeLineCount / funcMatches.length) : 0
      totalFunctionLength += funcLines
    }

    const ifMatches = content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\b&&\b|\|\|\b|\?\?/g)
    if (ifMatches) {
      totalComplexity += ifMatches.length
      complexityFiles++
    }

    fileLineCounts.push({ file: file.path, lines: lineCount })
    directoryCounts[dir] = (directoryCounts[dir] ?? 0) + 1
  }

  const topFiles = fileLineCounts.sort((a, b) => b.lines - a.lines).slice(0, 10)

  return {
    avgComplexity: complexityFiles > 0 ? Math.round(totalComplexity / complexityFiles) : 0,
    avgFunctionLength: functionCount > 0 ? Math.round(totalFunctionLength / functionCount) : 0,
    codeLines,
    deadCodeItems,
    directoryCounts,
    fixmeCount,
    languages,
    name: '',
    securityIssues,
    testFiles,
    timestamp: new Date().toISOString(),
    todoCount,
    topFiles,
    totalFiles: files.length,
    totalLines,
    sourceFiles,
  }
}

function languageFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.css': 'CSS', '.go': 'Go', '.html': 'HTML', '.java': 'Java', '.js': 'JavaScript',
    '.json': 'JSON', '.jsx': 'JSX', '.md': 'Markdown', '.py': 'Python', '.rb': 'Ruby',
    '.rs': 'Rust', '.sh': 'Shell', '.sql': 'SQL', '.svelte': 'Svelte', '.ts': 'TypeScript',
    '.tsx': 'TSX', '.xml': 'XML', '.yaml': 'YAML', '.yml': 'YAML', '.zig': 'Zig',
  }
  return map[ext] ?? 'Unknown'
}

// ─── Create Baseline ────────────────────────────────────

/**
 * @example
 * const baseline = createBaseline('v1', metrics)
 * console.log(baseline.name)
 */
export function createBaseline(name: string, metrics: BaselineMetrics): BaselineMetrics {
  return { ...metrics, name, timestamp: new Date().toISOString() }
}

// ─── Compare Baselines ──────────────────────────────────

/**
 * @example
 * const comparison = compareBaselines(baseline, current)
 * console.log(comparison.overallStatus)
 */
export function compareBaselines(baseline: BaselineMetrics, current: BaselineMetrics): BaselineComparison {
  const numericKeys: (keyof BaselineMetrics)[] = [
    'totalFiles', 'totalLines', 'codeLines', 'testFiles', 'sourceFiles',
    'avgComplexity', 'avgFunctionLength', 'todoCount', 'fixmeCount',
    'securityIssues', 'deadCodeItems',
  ]

  const diffs: BaselineDiff[] = []

  for (const key of numericKeys) {
    const bVal = baseline[key] as number
    const cVal = current[key] as number
    const delta = cVal - bVal
    const deltaPercent = bVal !== 0 ? Math.round((delta / bVal) * 10000) / 100 : (cVal !== 0 ? 100 : 0)

    let status: BaselineDiff['status']
    if (bVal === 0 && cVal === 0) {
      status = 'unchanged'
    } else if (bVal === 0 && cVal !== 0) {
      status = 'new'
    } else {
      const absPct = Math.abs(deltaPercent)
      if (absPct < 5) {
        status = 'unchanged'
      } else {
        const direction = classifyMetricDirection(key)
        if (direction === 'neutral') {
          status = 'unchanged'
        } else {
          const isGood = direction === 'good' ? delta > 0 : delta < 0
          status = isGood ? 'improved' : 'regressed'
        }
      }
    }

    diffs.push({
      baseline: bVal,
      current: cVal,
      delta,
      deltaPercent,
      metric: key,
      status,
    })
  }

  const regressions = diffs.filter((d) => d.status === 'regressed')
  const improvements = diffs.filter((d) => d.status === 'improved')
  const healthDelta = computeHealthDelta(diffs)

  let overallStatus: BaselineComparison['overallStatus'] = 'unchanged'
  if (healthDelta > 0) overallStatus = 'improved'
  else if (healthDelta < 0) overallStatus = 'regressed'

  return {
    baselineName: baseline.name,
    baselineTimestamp: baseline.timestamp,
    currentTimestamp: current.timestamp,
    diffs,
    healthDelta,
    improvements,
    overallStatus,
    regressions,
  }
}

// ─── Compute Health Delta ───────────────────────────────

/**
 * @example
 * const score = computeHealthDelta(diffs)
 * console.log(score)
 */
export function computeHealthDelta(diffs: BaselineDiff[]): number {
  let score = 0
  for (const d of diffs) {
    if (d.status === 'improved') score += 1
    else if (d.status === 'regressed') score -= 2
  }
  return score
}

// ─── Serialize / Deserialize ────────────────────────────

/**
 * @example
 * const json = serializeBaseline(metrics)
 * console.log(json.length)
 */
export function serializeBaseline(baseline: BaselineMetrics): string {
  return JSON.stringify(baseline, null, 2)
}

/**
 * @example
 * const metrics = deserializeBaseline(json)
 * console.log(metrics.name)
 */
export function deserializeBaseline(json: string): BaselineMetrics {
  return JSON.parse(json) as BaselineMetrics
}

// ─── List Baselines ─────────────────────────────────────

/**
 * @example
 * const list = listBaselines(store)
 * console.log(list.length)
 */
export function listBaselines(store: BaselineStore): BaselineMetrics[] {
  return Array.from(store.baselines.values())
}

// ─── Build Baseline Result ──────────────────────────────

/**
 * @example
 * const result = await buildBaselineResult(files, reader, { action: 'create', name: 'v1' })
 * console.log(result.metrics.name)
 */
export async function buildBaselineResult(
  files: FileEntry[],
  contentReader: ContentReader,
  options?: BaselineOptions,
): Promise<{
  action: string
  comparison?: BaselineComparison
  metrics?: BaselineMetrics
  names?: string[]
}> {
  const action = options?.action ?? 'create'

  if (action === 'list') {
    return { action, names: [] }
  }

  const contents = new Map<string, string>()
  for (const file of files) {
    try {
      contents.set(file.absolutePath, await contentReader(file.absolutePath))
    } catch {
      continue
    }
  }

  const metrics = captureMetrics(files, contents)
  const name = options?.name ?? 'default'
  const baseline = createBaseline(name, metrics)

  return { action, metrics: baseline }
}
