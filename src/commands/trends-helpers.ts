import { execSync } from 'node:child_process'

// ─── Interfaces ──────────────────────────────────────────

export interface PeriodData {
  period: string
  commits: number
  linesAdded: number
  linesDeleted: number
  netLines: number
  filesChanged: number
  contributors: number
}

export interface FileChurn {
  filePath: string
  totalChanges: number
  linesAdded: number
  linesDeleted: number
  churnScore: number
  periodsActive: number
}

export interface TrendSummary {
  totalPeriods: number
  totalCommits: number
  totalLinesAdded: number
  totalLinesDeleted: number
  averageCommitsPerPeriod: number
  averageLinesPerPeriod: number
  peakPeriod: PeriodData | null
  growthRate: number
}

export interface TrendsResult {
  periods: PeriodData[]
  fileChurn: FileChurn[]
  summary: TrendSummary
}

export type PeriodType = 'day' | 'month' | 'week'

export interface TrendsOptions {
  period: PeriodType
  since?: string
  until?: string
  top: number
}

// ─── Git execution ───────────────────────────────────────

/**
 * Execute a git command and return stdout.
 * @example
 * const output = executeGit(['log', '--oneline'], process.cwd())
 */
export function executeGit(args: string[], cwd: string): string {
  try {
    return execSync(`git ${args.join(' ')}`, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch {
    return ''
  }
}

// ─── Period key extraction ───────────────────────────────

/**
 * Extract a period key from an ISO date string based on the period type.
 * @example
 * getPeriodKey('2024-01-15T10:30:00Z', 'day')    // '2024-01-15'
 * getPeriodKey('2024-01-15T10:30:00Z', 'week')   // '2024-W03'
 * getPeriodKey('2024-01-15T10:30:00Z', 'month')  // '2024-01'
 */
export function getPeriodKey(isoDate: string, period: PeriodType): string {
  const date = new Date(isoDate)

  if (isNaN(date.getTime())) {
    return 'unknown'
  }

  const year = date.getFullYear()

  if (period === 'day') {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (period === 'month') {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  // week — ISO week number
  const jan1 = new Date(year, 0, 1)
  const dayOfYear = Math.floor((date.getTime() - jan1.getTime()) / 86400000) + 1
  const weekNumber = Math.ceil(dayOfYear / 7)
  const weekStr = String(weekNumber).padStart(2, '0')
  return `${year}-W${weekStr}`
}

// ─── Git log parsing for periods ────────────────────────

/**
 * Parse git log output with date + numstat into period data.
 * @example
 * const periods = parseGitLogForPeriods(output, 'week')
 */
export function parseGitLogForPeriods(logOutput: string, period: PeriodType): PeriodData[] {
  if (!logOutput.trim()) {
    return []
  }

  const periodMap = new Map<string, { commits: number; linesAdded: number; linesDeleted: number; filesChanged: number; contributors: Set<string> }>()

  // Split by NUL delimiter; each chunk = "date|author\nnumstat..."
  const commits = logOutput.split('\x00')

  for (const commit of commits) {
    const trimmedCommit = commit.trim()
    if (!trimmedCommit) continue

    const lines = trimmedCommit.split('\n')
    if (lines.length === 0) continue

    const headerLine = lines[0]
    if (!headerLine) continue

    const headerParts = headerLine.split('|')
    if (headerParts.length < 2) continue

    const dateStr = headerParts[0]?.trim()
    const author = headerParts[1]?.trim()

    if (!dateStr) continue

    const periodKey = getPeriodKey(dateStr, period)

    const existing = periodMap.get(periodKey)
    const contributorsSet = existing ? existing.contributors : new Set<string>()
    if (author) {
      contributorsSet.add(author)
    }

    let added = 0
    let deleted = 0
    let files = 0

    for (let i = 1; i < lines.length; i++) {
      const statLine = lines[i]?.trim()
      if (!statLine) continue

      const parts = statLine.split('\t')
      if (parts.length >= 3) {
        const a = parts[0]
        const d = parts[1]
        const linesAdded = a === '-' ? 0 : (parseInt(a ?? '', 10) || 0)
        const linesDeleted = d === '-' ? 0 : (parseInt(d ?? '', 10) || 0)
        added += linesAdded
        deleted += linesDeleted
        files++
      }
    }

    if (existing) {
      existing.commits++
      existing.linesAdded += added
      existing.linesDeleted += deleted
      existing.filesChanged += files
    } else {
      periodMap.set(periodKey, {
        commits: 1,
        contributors: contributorsSet,
        filesChanged: files,
        linesAdded: added,
        linesDeleted: deleted,
      })
    }
  }

  const result: PeriodData[] = []

  for (const [periodKey, data] of periodMap) {
    result.push({
      commits: data.commits,
      contributors: data.contributors.size,
      filesChanged: data.filesChanged,
      linesAdded: data.linesAdded,
      linesDeleted: data.linesDeleted,
      netLines: data.linesAdded - data.linesDeleted,
      period: periodKey,
    })
  }

  result.sort((a, b) => a.period.localeCompare(b.period))

  return result
}

// ─── File churn parsing ─────────────────────────────────

/**
 * Parse numstat output to compute per-file churn metrics.
 * @example
 * const churn = parseFileChurn("10\t5\tsrc/index.ts\n3\t1\tsrc/util.ts")
 */
export function parseFileChurn(numstatOutput: string): FileChurn[] {
  if (!numstatOutput.trim()) {
    return []
  }

  const fileMap = new Map<string, { totalChanges: number; linesAdded: number; linesDeleted: number; periodsActive: number }>()

  const commitBlocks = numstatOutput.split('\x00')

  for (const block of commitBlocks) {
    const trimmedBlock = block.trim()
    if (!trimmedBlock) continue

    const lines = trimmedBlock.split('\n')
    const filesInCommit = new Set<string>()

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      const parts = trimmedLine.split('\t')
      if (parts.length >= 3) {
        const a = parts[0]
        const d = parts[1]
        const filePath = parts[2]

        if (!filePath) continue

        const linesAdded = a === '-' ? 0 : (parseInt(a ?? '', 10) || 0)
        const linesDeleted = d === '-' ? 0 : (parseInt(d ?? '', 10) || 0)

        filesInCommit.add(filePath)

        const existing = fileMap.get(filePath)
        if (existing) {
          existing.linesAdded += linesAdded
          existing.linesDeleted += linesDeleted
          existing.totalChanges++
        } else {
          fileMap.set(filePath, {
            linesAdded,
            linesDeleted,
            periodsActive: 0,
            totalChanges: 1,
          })
        }
      }
    }

    for (const filePath of Array.from(filesInCommit)) {
      const existing = fileMap.get(filePath)
      if (existing) {
        existing.periodsActive++
      }
    }
  }

  const result: FileChurn[] = []

  for (const [filePath, data] of fileMap) {
    result.push({
      churnScore: data.linesAdded + data.linesDeleted,
      filePath,
      linesAdded: data.linesAdded,
      linesDeleted: data.linesDeleted,
      periodsActive: data.periodsActive,
      totalChanges: data.totalChanges,
    })
  }

  result.sort((a, b) => b.churnScore - a.churnScore)

  return result
}

// ─── Trend summary ──────────────────────────────────────

/**
 * Calculate summary statistics from period data.
 * @example
 * const summary = calculateTrendSummary(periods)
 */
export function calculateTrendSummary(periods: PeriodData[]): TrendSummary {
  if (periods.length === 0) {
    return {
      averageCommitsPerPeriod: 0,
      averageLinesPerPeriod: 0,
      growthRate: 0,
      peakPeriod: null,
      totalCommits: 0,
      totalLinesAdded: 0,
      totalLinesDeleted: 0,
      totalPeriods: 0,
    }
  }

  let totalCommits = 0
  let totalLinesAdded = 0
  let totalLinesDeleted = 0
  let peakPeriod: PeriodData = periods[0]!

  for (const period of periods) {
    totalCommits += period.commits
    totalLinesAdded += period.linesAdded
    totalLinesDeleted += period.linesDeleted

    if (period.commits > peakPeriod.commits) {
      peakPeriod = period
    }
  }

  const totalPeriods = periods.length
  const averageCommitsPerPeriod = totalPeriods > 0 ? totalCommits / totalPeriods : 0
  const averageLinesPerPeriod = totalPeriods > 0 ? (totalLinesAdded + totalLinesDeleted) / totalPeriods : 0

  // Growth rate: percentage change from first to last period's net lines
  const firstNet = periods[0]!.netLines
  const lastNet = periods[periods.length - 1]!.netLines

  let growthRate = 0
  if (firstNet !== 0) {
    growthRate = ((lastNet - firstNet) / Math.abs(firstNet)) * 100
  } else if (lastNet !== 0) {
    growthRate = lastNet > 0 ? 100 : -100
  }

  return {
    averageCommitsPerPeriod: Math.round(averageCommitsPerPeriod * 100) / 100,
    averageLinesPerPeriod: Math.round(averageLinesPerPeriod * 100) / 100,
    growthRate: Math.round(growthRate * 100) / 100,
    peakPeriod,
    totalCommits,
    totalLinesAdded,
    totalLinesDeleted,
    totalPeriods,
  }
}

// ─── Build trends result ────────────────────────────────

/**
 * Orchestrate git log parsing, churn computation, and summary generation.
 * @example
 * const result = buildTrendsResult(process.cwd(), { period: 'week', top: 10 })
 */
export function buildTrendsResult(cwd: string, options: TrendsOptions): TrendsResult {
  const gitArgs: string[] = ['log', '--format=%x00%aI|%aN', '--numstat']

  if (options.since) {
    gitArgs.push(`--since=${options.since}`)
  }
  if (options.until) {
    gitArgs.push(`--until=${options.until}`)
  }

  const logOutput = executeGit(gitArgs, cwd)

  // Parse periods
  const periods = parseGitLogForPeriods(logOutput, options.period)

  // Parse file churn using the same output
  const churnOutput = executeGit(
    [
      'log',
      '--format=%x00',
      '--numstat',
      ...(options.since ? [`--since=${options.since}`] : []),
      ...(options.until ? [`--until=${options.until}`] : []),
    ],
    cwd,
  )
  const fileChurn = parseFileChurn(churnOutput)

  // Calculate summary
  const summary = calculateTrendSummary(periods)

  // Limit file churn to top N
  const topFileChurn = fileChurn.slice(0, options.top)

  return {
    fileChurn: topFileChurn,
    periods,
    summary,
  }
}
