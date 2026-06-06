import { execSync } from 'node:child_process'
import type { RuleViolation } from '../ast/visitor.js'

// ─── Interfaces ──────────────────────────────────────────

export interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'header'
  content: string
  lineNumber: number
}

export interface FileDiff {
  filePath: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  lines: DiffLine[]
  riskLevel: 'low' | 'medium' | 'high'
  riskReasons: string[]
}

export interface DiffSummary {
  totalFiles: number
  totalAdditions: number
  totalDeletions: number
  netLines: number
  byStatus: { status: string; count: number }[]
  byExtension: { ext: string; files: number; additions: number; deletions: number }[]
  highRiskFiles: FileDiff[]
}

export interface DiffResult {
  files: FileDiff[]
  summary: DiffSummary
  baseCommit: string
  headCommit: string
}

export interface DiffOptions {
  staged?: boolean
  commit?: string
}

// ─── Git execution ──────────────────────────────────────

/**
 * Execute a git command and return its stdout.
 *
 * @example
 * ```ts
 * const output = executeGit(['diff', '--staged'], process.cwd())
 * ```
 */
export function executeGit(args: string[], cwd: string): string {
  try {
    return execSync(`git ${args.join(' ')}`, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string }
    if (err.stdout) return err.stdout
    throw new Error(`Git command failed: git ${args.join(' ')} — ${err.stderr ?? String(error)}`)
  }
}

// ─── Diff parsing ───────────────────────────────────────

/**
 * Parse unified diff output into structured FileDiff objects.
 *
 * @example
 * ```ts
 * const files = parseDiffOutput(rawDiff)
 * for (const f of files) {
 *   console.log(f.filePath, f.status, `+${f.additions}/-${f.deletions}`)
 * }
 * ```
 */
export function parseDiffOutput(diffOutput: string): FileDiff[] {
  if (!diffOutput || diffOutput.trim().length === 0) return []

  const chunks = diffOutput.split(/(?=^diff --git )/m).filter((c) => c.trim().length > 0)

  const results: FileDiff[] = []

  for (const chunk of chunks) {
    const fileDiff = parseFileChunk(chunk)
    if (fileDiff) results.push(fileDiff)
  }

  return results
}

function parseFileChunk(chunk: string): FileDiff | null {
  const lines = chunk.split('\n')

  let filePath = ''
  let status: FileDiff['status'] = 'modified'
  let additions = 0
  let deletions = 0
  const diffLines: DiffLine[] = []
  let lineNumber = 0

  let hasRenameFrom = false
  let renameTo = ''

  for (const rawLine of lines) {
    // Binary file marker
    if (rawLine.startsWith('Binary files ') || rawLine.includes('Binary file')) {
      continue
    }

    // File path from --- a/path
    if (rawLine.startsWith('--- ')) {
      const match = rawLine.match(/^--- (?:a\/)?(.*)$/)
      if (match) {
        const path = match[1] ?? ''
        if (path === '/dev/null') {
          status = 'added'
        } else if (!filePath) {
          filePath = path
        }
      }
      continue
    }

    // File path from +++ b/path
    if (rawLine.startsWith('+++ ')) {
      const match = rawLine.match(/^\+\+\+ (?:b\/)?(.*)$/)
      if (match) {
        const path = match[1] ?? ''
        if (path === '/dev/null') {
          status = 'deleted'
        } else {
          filePath = path
        }
      }
      continue
    }

    // Rename detection
    if (rawLine.startsWith('rename from ')) {
      hasRenameFrom = true
      filePath = rawLine.slice('rename from '.length)
      status = 'renamed'
      continue
    }

    if (rawLine.startsWith('rename to ')) {
      renameTo = rawLine.slice('rename to '.length)
      if (status === 'renamed') {
        filePath = renameTo
      }
      continue
    }

    // Skip other header lines
    if (
      rawLine.startsWith('diff --git') ||
      rawLine.startsWith('index ') ||
      rawLine.startsWith('@@') ||
      rawLine.startsWith('new file') ||
      rawLine.startsWith('deleted file')
    ) {
      continue
    }

    // Count additions and deletions
    if (rawLine.startsWith('+') && !rawLine.startsWith('+++')) {
      additions++
      lineNumber++
      diffLines.push({ content: rawLine.slice(1), lineNumber, type: 'added' })
      continue
    }

    if (rawLine.startsWith('-') && !rawLine.startsWith('---')) {
      deletions++
      lineNumber++
      diffLines.push({ content: rawLine.slice(1), lineNumber, type: 'removed' })
      continue
    }

    // Context line
    if (rawLine.startsWith(' ')) {
      lineNumber++
      diffLines.push({ content: rawLine.slice(1), lineNumber, type: 'context' })
      continue
    }
  }

  if (!filePath) return null

  // If no changes counted and file was detected as renamed
  if (hasRenameFrom && renameTo) {
    filePath = renameTo
    status = 'renamed'
  }

  const { level, reasons } = assessRisk({
    additions,
    deletions,
    filePath,
    status,
  } as FileDiff)

  return {
    additions,
    deletions,
    filePath,
    lines: diffLines,
    riskLevel: level,
    riskReasons: reasons,
    status,
  }
}

// ─── Risk assessment ────────────────────────────────────

/**
 * Assess the risk level of a file diff based on change size and type.
 *
 * @example
 * ```ts
 * const { level, reasons } = assessRisk(fileDiff)
 * if (level === 'high') console.warn('Risky change:', reasons)
 * ```
 */
export function assessRisk(
  fileDiff: Pick<FileDiff, 'additions' | 'deletions' | 'filePath' | 'status'>,
): { level: 'low' | 'medium' | 'high'; reasons: string[] } {
  const reasons: string[] = []
  let level: 'low' | 'medium' | 'high' = 'low'

  // High risk thresholds
  if (fileDiff.additions > 50) {
    reasons.push('Large change')
    level = 'high'
  }

  if (fileDiff.deletions > 30) {
    reasons.push('Many deletions')
    level = 'high'
  }

  // Medium risk thresholds (only elevate, never downgrade)
  if (fileDiff.additions > 20 && level !== 'high') {
    reasons.push('Moderate additions')
    level = 'medium'
  }

  if (fileDiff.deletions > 15 && level !== 'high') {
    reasons.push('Moderate deletions')
    level = 'medium'
  }

  // New files are medium risk
  if (fileDiff.status === 'added') {
    reasons.push('New file (untested patterns)')
    if (level === 'low') level = 'medium'
  }

  return { level, reasons }
}

// ─── Summary building ───────────────────────────────────

/**
 * Build aggregate statistics from an array of file diffs.
 *
 * @example
 * ```ts
 * const summary = buildDiffSummary(files)
 * console.log(`${summary.totalFiles} changed, net ${summary.netLines} lines`)
 * ```
 */
export function buildDiffSummary(files: FileDiff[]): DiffSummary {
  let totalAdditions = 0
  let totalDeletions = 0

  const statusMap = new Map<string, number>()
  const extMap = new Map<
    string,
    { ext: string; files: number; additions: number; deletions: number }
  >()

  for (const file of files) {
    totalAdditions += file.additions
    totalDeletions += file.deletions

    // byStatus
    const currentStatusCount = statusMap.get(file.status) ?? 0
    statusMap.set(file.status, currentStatusCount + 1)

    // byExtension
    const dotIndex = file.filePath.lastIndexOf('.')
    const ext = dotIndex !== -1 ? file.filePath.slice(dotIndex) : '(none)'
    const existing = extMap.get(ext)
    if (existing) {
      existing.files++
      existing.additions += file.additions
      existing.deletions += file.deletions
    } else {
      extMap.set(ext, {
        additions: file.additions,
        deletions: file.deletions,
        ext,
        files: 1,
      })
    }
  }

  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ count, status }))
  const byExtension = Array.from(extMap.values())
  const highRiskFiles = files.filter((f) => f.riskLevel === 'high')

  return {
    byExtension,
    byStatus,
    highRiskFiles,
    netLines: totalAdditions - totalDeletions,
    totalAdditions,
    totalDeletions,
    totalFiles: files.length,
  }
}

// ─── Orchestration ──────────────────────────────────────

/**
 * Build a complete DiffResult by running git diff and parsing the output.
 *
 * @example
 * ```ts
 * const result = await buildDiffResult(process.cwd(), { staged: true })
 * console.log(result.summary.totalFiles, 'files changed')
 * ```
 */
export function buildDiffResult(cwd: string, options: DiffOptions = {}): DiffResult {
  const gitArgs: string[] = ['diff']

  if (options.staged) {
    gitArgs.push('--staged')
  }

  if (options.commit) {
    gitArgs.push(options.commit)
  }

  // Always use no-color and unified format
  gitArgs.push('--no-color', '-U3')

  let baseCommit = 'working tree'
  let headCommit = 'index'

  if (options.staged) {
    baseCommit = 'index'
    headCommit = 'HEAD'
  }

  if (options.commit) {
    baseCommit = `${options.commit}~1`
    headCommit = options.commit
  }

  // Try to get actual commit hashes
  try {
    if (options.staged) {
      const head = executeGit(['rev-parse', 'HEAD'], cwd).trim()
      headCommit = head
    } else if (options.commit) {
      baseCommit = executeGit(['rev-parse', `${options.commit}~1`], cwd).trim()
      headCommit = executeGit(['rev-parse', options.commit], cwd).trim()
    } else {
      baseCommit = executeGit(['rev-parse', 'HEAD'], cwd).trim()
      headCommit = 'working tree'
    }
  } catch {
    // Fall back to defaults if git rev-parse fails
  }

  const diffOutput = executeGit(gitArgs, cwd)
  const files = parseDiffOutput(diffOutput)

  const summary = buildDiffSummary(files)

  return {
    baseCommit,
    files,
    headCommit,
    summary,
  }
}

// ─── Violation Diff Functions ──────────────────────────

export interface ViolationDiffResult {
  added: RuleViolation[]
  removed: RuleViolation[]
  improved: RuleViolation[]
}

export interface ViolationDiffSummary {
  totalBase: number
  totalHead: number
  addedCount: number
  removedCount: number
  improvedCount: number
  netChange: number
}

export interface ViolationDiffReport {
  base: string
  head: string
  added: RuleViolation[]
  removed: RuleViolation[]
  improved: RuleViolation[]
  summary: ViolationDiffSummary
}

export type DiffReport = ViolationDiffReport

const MAX_DISPLAY_VIOLATIONS = 20

export function createViolationKey(violation: RuleViolation): string {
  return `${violation.filePath}:${violation.range.start.line}:${violation.ruleId}`
}

export function compareViolations(
  base: RuleViolation[],
  head: RuleViolation[],
): ViolationDiffResult {
  const baseKeys = new Set(base.map(createViolationKey))
  const headKeys = new Set(head.map(createViolationKey))

  const added = head.filter((v) => !baseKeys.has(createViolationKey(v)))
  const removed = base.filter((v) => !headKeys.has(createViolationKey(v)))

  return { added, improved: [], removed }
}

export function countByRule(violations: RuleViolation[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const v of violations) {
    counts[v.ruleId] = (counts[v.ruleId] ?? 0) + 1
  }
  return counts
}

export function countBySeverity(violations: RuleViolation[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const v of violations) {
    counts[v.severity] = (counts[v.severity] ?? 0) + 1
  }
  return counts
}

export function buildDiffReport(
  baseRef: string,
  headRef: string,
  base: RuleViolation[],
  head: RuleViolation[],
): ViolationDiffReport {
  const comparison = compareViolations(base, head)

  return {
    base: baseRef,
    head: headRef,
    added: comparison.added,
    removed: comparison.removed,
    improved: comparison.improved,
    summary: {
      totalBase: base.length,
      totalHead: head.length,
      addedCount: comparison.added.length,
      removedCount: comparison.removed.length,
      improvedCount: comparison.improved.length,
      netChange: comparison.added.length - comparison.removed.length,
    },
  }
}

export function parseGitDiffOutput(output: string): string[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function formatSummary(report: ViolationDiffReport): string {
  const { summary } = report
  const netChangeStr =
    summary.netChange >= 0 ? `+${summary.netChange}` : `${summary.netChange}`

  let message: string
  if (summary.netChange < 0) {
    message = `Code quality improved — ${Math.abs(summary.netChange)} violations removed`
  } else if (summary.netChange > 0) {
    message = `Code quality regressed — ${summary.netChange} new violations added`
  } else {
    message = 'No net change'
  }

  const lines = [
    'Violation Diff Analysis',
    `Comparing ${report.base} → ${report.head}`,
    '',
    'Summary:',
    `  Base violations: ${summary.totalBase}`,
    `  Head violations: ${summary.totalHead}`,
    `  Added: +${summary.addedCount}`,
    `  Removed: -${summary.removedCount}`,
    `  Net change: ${netChangeStr}`,
    '',
    message,
  ]

  return lines.join('\n') + '\n'
}

export function displayAddedViolations(
  violations: RuleViolation[],
  logFn: (...args: unknown[]) => void,
): void {
  if (violations.length === 0) return

  logFn('Added Violations:')
  const shown = violations.slice(0, MAX_DISPLAY_VIOLATIONS)
  for (const v of shown) {
    logFn(`  ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
  }
  if (violations.length > MAX_DISPLAY_VIOLATIONS) {
    logFn(`  and ${violations.length - MAX_DISPLAY_VIOLATIONS} more`)
  }
  logFn('')
}

export function displayRemovedViolations(
  violations: RuleViolation[],
  logFn: (...args: unknown[]) => void,
): void {
  if (violations.length === 0) return

  logFn('Removed Violations:')
  const shown = violations.slice(0, MAX_DISPLAY_VIOLATIONS)
  for (const v of shown) {
    logFn(`  ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
  }
  if (violations.length > MAX_DISPLAY_VIOLATIONS) {
    logFn(`  and ${violations.length - MAX_DISPLAY_VIOLATIONS} more`)
  }
  logFn('')
}

export function displayDiffReport(
  report: ViolationDiffReport,
  verbose: boolean,
  logFn: (...args: unknown[]) => void,
): void {
  const summaryText = formatSummary(report)
  for (const line of summaryText.split('\n')) {
    logFn(line)
  }

  if (verbose) {
    displayAddedViolations(report.added, logFn)
    displayRemovedViolations(report.removed, logFn)
  }
}
