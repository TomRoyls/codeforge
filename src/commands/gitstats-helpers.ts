import { execFileSync } from 'node:child_process'

// ─── Interfaces ──────────────────────────────────────────

export interface CommitActivity {
  /** YYYY-MM-DD */
  date: string
  count: number
  additions: number
  deletions: number
}

export interface HourlyActivity {
  /** 0-23 */
  hour: number
  count: number
}

export interface DailyActivity {
  /** Mon-Sun */
  day: string
  count: number
}

export interface ContributorStat {
  name: string
  email: string
  commits: number
  additions: number
  deletions: number
  /** ISO date */
  firstCommit: string
  /** ISO date */
  lastCommit: string
  /** Days with at least 1 commit */
  activeDays: number
}

export interface BusFactor {
  /** Minimum contributors whose departure would break the project */
  factor: number
  totalContributors: number
  /** Percentage of code owned by top N contributors */
  coverage: number
  topContributors: string[]
}

export interface GitStatsResult {
  totalCommits: number
  totalAuthors: number
  firstCommitDate: string
  lastCommitDate: string
  activeDays: number
  totalAdditions: number
  totalDeletions: number
  commitsPerDay: number
  commitsPerWeek: number
  commitsPerMonth: number
  currentBranch: string
  totalBranches: number
  totalTags: number
  contributorStats: ContributorStat[]
  hourlyActivity: HourlyActivity[]
  dailyActivity: DailyActivity[]
  weeklyActivity: CommitActivity[]
  busFactor: BusFactor
  peakHour: number
  peakDay: string
}

export interface GitStatsOptions {
  since?: string
  until?: string
  branch?: string
}

// ─── Git execution ───────────────────────────────────────

/**
 * Execute a git command and return stdout.
 *
 * @example
 * ```ts
 * const log = runGit(['log', '--oneline'], '/path/to/repo')
 * ```
 */
export function runGit(args: string[], cwd: string): string {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch {
    return ''
  }
}

// ─── Shortlog parsing ────────────────────────────────────

/**
 * Parse `git shortlog -sne` output into structured data.
 *
 * @example
 * ```ts
 * const data = parseShortlog('  42\tAlice <alice@example.com>\n  10\tBob <bob@example.com>')
 * // [{ name: 'Alice', email: 'alice@example.com', commits: 42 }, ...]
 * ```
 */
export function parseShortlog(output: string): { name: string; email: string; commits: number }[] {
  if (!output.trim()) return []

  const results: { name: string; email: string; commits: number }[] = []

  for (const line of output.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Match: "  123\tAuthor Name <email>" or "  123  Author Name <email>"
    const match = trimmed.match(/^(\d+)\s+(.+?)\s*<([^>]+)>/)
    if (match) {
      results.push({
        commits: Number.parseInt(match[1] ?? '', 10),
        email: match[3]!.trim(),
        name: match[2]!.trim(),
      })
    }
  }

  return results
}

// ─── Log stats parsing ───────────────────────────────────

/**
 * Parse `git log --format="%aI" --numstat` output.
 *
 * @example
 * ```ts
 * const data = parseLogStats('2024-01-15T10:30:00+00:00\n\n10\t5\tfile.ts\n3\t0\tother.ts')
 * ```
 */
export function parseLogStats(
  output: string,
): { date: string; files: number; additions: number; deletions: number }[] {
  if (!output.trim()) return []

  const results: { date: string; files: number; additions: number; deletions: number }[] = []
  let currentDate = ''
  let files = 0
  let additions = 0
  let deletions = 0

  for (const line of output.split('\n')) {
    // Date line (ISO format from %aI)
    const dateMatch = line.match(/^\d{4}-\d{2}-\d{2}T/)
    if (dateMatch) {
      // Save previous commit if any
      if (currentDate) {
        results.push({ additions, date: currentDate, deletions, files })
      }
      currentDate = line.trim()
      files = 0
      additions = 0
      deletions = 0
      continue
    }

    // Numstat line: "additions\tdeletions\tfilename"
    const numstatMatch = line.match(/^(\d+|-)\t(\d+|-)\t/)
    if (numstatMatch) {
      files++
      const addVal = numstatMatch[1] ?? ''
      const delVal = numstatMatch[2]!
      additions += addVal === '-' ? 0 : Number.parseInt(addVal, 10)
      deletions += delVal === '-' ? 0 : Number.parseInt(delVal, 10)
    }
  }

  // Don't forget last commit
  if (currentDate) {
    results.push({ additions, date: currentDate, deletions, files })
  }

  return results
}

// ─── Hourly activity ─────────────────────────────────────

/**
 * Bucket commits by hour (0-23).
 *
 * @example
 * ```ts
 * const hourly = computeHourlyActivity([
 *   { date: '2024-01-15T10:30:00Z', files: 1, additions: 5, deletions: 0 }
 * ])
 * // hourly[10].count === 1
 * ```
 */
export function computeHourlyActivity(
  commits: { date: string }[],
): HourlyActivity[] {
  const buckets = Array.from({ length: 24 }, (_, i) => ({ count: 0, hour: i }))

  for (const commit of commits) {
    const hour = new Date(commit.date).getHours()
    if (hour >= 0 && hour < 24) {
      buckets[hour]!.count++
    }
  }

  return buckets
}

// ─── Daily activity ──────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Bucket commits by day of week.
 *
 * @example
 * ```ts
 * const daily = computeDailyActivity([
 *   { date: '2024-01-15T10:30:00Z', files: 1, additions: 5, deletions: 0 }
 * ])
 * ```
 */
export function computeDailyActivity(
  commits: { date: string }[],
): DailyActivity[] {
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const buckets = new Map<string, number>()
  for (const day of dayOrder) {
    buckets.set(day, 0)
  }

  for (const commit of commits) {
    const dayIndex = new Date(commit.date).getDay()
    const dayName = DAY_NAMES[dayIndex]!
    buckets.set(dayName, (buckets.get(dayName) ?? 0) + 1)
  }

  return dayOrder.map((day) => ({ count: buckets.get(day) ?? 0, day }))
}

// ─── Weekly activity ─────────────────────────────────────

/**
 * Get the ISO week number for a date (YYYY-WNN format).
 */
function getIsoWeek(date: Date): string {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  // Thursday in current week decides the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const yearStart = new Date(d.getFullYear(), 0, 4)
  // Adjust to Thursday in week 1
  yearStart.setDate(yearStart.getDate() + 3 - ((yearStart.getDay() + 6) % 7))
  const weekNumber = 1 + Math.round(((d.getTime() - yearStart.getTime()) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

/**
 * Bucket commits by week (YYYY-WNN).
 *
 * @example
 * ```ts
 * const weekly = computeWeeklyActivity([
 *   { date: '2024-01-15T10:30:00Z', files: 2, additions: 10, deletions: 3 }
 * ])
 * ```
 */
export function computeWeeklyActivity(
  commits: { date: string; additions: number; deletions: number }[],
): CommitActivity[] {
  const weekMap = new Map<string, { count: number; additions: number; deletions: number }>()

  for (const commit of commits) {
    const d = new Date(commit.date)
    const weekKey = getIsoWeek(d)
    const existing = weekMap.get(weekKey)
    if (existing) {
      existing.count++
      existing.additions += commit.additions
      existing.deletions += commit.deletions
    } else {
      weekMap.set(weekKey, {
        additions: commit.additions,
        count: 1,
        deletions: commit.deletions,
      })
    }
  }

  const entries = Array.from(weekMap.entries()).map(([week, data]) => ({
    additions: data.additions,
    count: data.count,
    date: week,
    deletions: data.deletions,
  }))

  entries.sort((a, b) => a.date.localeCompare(b.date))
  return entries
}

// ─── Contributor stats ───────────────────────────────────

/**
 * Build per-contributor statistics from shortlog and log data.
 *
 * @example
 * ```ts
 * const stats = computeContributorStats(shortlogData, logData, fullLog)
 * ```
 */
export function computeContributorStats(
  shortlogData: { name: string; email: string; commits: number }[],
  logByAuthor: Map<string, { date: string; additions: number; deletions: number }[]>,
): ContributorStat[] {
  return shortlogData.map((entry) => {
    const commits = logByAuthor.get(entry.email) ?? []
    const dates = commits.map((c) => new Date(c.date).toISOString().slice(0, 10))
    const uniqueDays = new Set(dates)
    const totalAdditions = commits.reduce((sum, c) => sum + c.additions, 0)
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0)

    const sortedDates = dates.sort()
    return {
      activeDays: uniqueDays.size,
      additions: totalAdditions,
      commits: entry.commits,
      deletions: totalDeletions,
      email: entry.email,
      firstCommit: commits.length > 0 ? sortedDates[0]! + 'T00:00:00.000Z' : '',
      lastCommit: commits.length > 0 ? sortedDates[sortedDates.length - 1]! + 'T23:59:59.999Z' : '',
      name: entry.name,
    }
  })
}

// ─── Bus factor ──────────────────────────────────────────

/**
 * Compute bus factor: minimum number of top contributors who together own >= 50% of commits.
 *
 * @example
 * ```ts
 * const bf = computeBusFactor([
 *   { name: 'Alice', commits: 80, ... },
 *   { name: 'Bob', commits: 20, ... }
 * ])
 * // bf.factor === 1 (Alice alone has >= 50%)
 * ```
 */
export function computeBusFactor(contributorStats: ContributorStat[]): BusFactor {
  if (contributorStats.length === 0) {
    return {
      coverage: 0,
      factor: 0,
      topContributors: [],
      totalContributors: 0,
    }
  }

  const totalCommits = contributorStats.reduce((sum, c) => sum + c.commits, 0)
  if (totalCommits === 0) {
    return {
      coverage: 0,
      factor: 0,
      topContributors: [],
      totalContributors: contributorStats.length,
    }
  }

  const sorted = [...contributorStats].sort((a, b) => b.commits - a.commits)
  let cumulative = 0
  const topNames: string[] = []

  for (const contributor of sorted) {
    cumulative += contributor.commits
    topNames.push(contributor.name)
    if (cumulative / totalCommits >= 0.5) {
      break
    }
  }

  const coverage = Math.round((cumulative / totalCommits) * 100)

  return {
    coverage,
    factor: topNames.length,
    topContributors: topNames,
    totalContributors: contributorStats.length,
  }
}

// ─── Peak computation ────────────────────────────────────

/**
 * Find the hour with the most commits.
 *
 * @example
 * ```ts
 * computePeakHour([{ hour: 10, count: 50 }, { hour: 14, count: 30 }])
 * // 10
 * ```
 */
export function computePeakHour(hourlyActivity: HourlyActivity[]): number {
  let maxCount = -1
  let peakHour = 0

  for (const entry of hourlyActivity) {
    if (entry.count > maxCount) {
      maxCount = entry.count
      peakHour = entry.hour
    }
  }

  return peakHour
}

/**
 * Find the day with the most commits.
 *
 * @example
 * ```ts
 * computePeakDay([{ day: 'Mon', count: 10 }, { day: 'Wed', count: 25 }])
 * // 'Wed'
 * ```
 */
export function computePeakDay(dailyActivity: DailyActivity[]): string {
  let maxCount = -1
  let peakDay = 'Mon'

  for (const entry of dailyActivity) {
    if (entry.count > maxCount) {
      maxCount = entry.count
      peakDay = entry.day
    }
  }

  return peakDay
}

// ─── Main orchestrator ───────────────────────────────────

/**
 * Build a complete GitStatsResult by running git commands and computing all stats.
 *
 * @example
 * ```ts
 * const result = await buildGitStatsResult('/path/to/repo', { branch: 'main' })
 * console.log(result.totalCommits)
 * ```
 */
export function buildGitStatsResult(cwd: string, options: GitStatsOptions = {}): GitStatsResult {
  const rangeArgs: string[] = []
  if (options.since) {
    rangeArgs.push(`--since=${options.since}`)
  }
  if (options.until) {
    rangeArgs.push(`--until=${options.until}`)
  }
  const branchArgs = options.branch ? [options.branch] : []

  // ─── Shortlog (per-author commit counts) ──────────────
  const shortlogOutput = runGit(
    ['shortlog', '-sne', ...rangeArgs, ...branchArgs, '--'],
    cwd,
  )
  const shortlogData = parseShortlog(shortlogOutput)

  // ─── Log with numstat (per-commit file stats) ─────────
  const logOutput = runGit(
    ['log', '--format=%aI', '--numstat', ...rangeArgs, ...branchArgs, '--'],
    cwd,
  )
  const logData = parseLogStats(logOutput)

  // ─── Per-author log for contributor stats ─────────────
  const authorLogOutput = runGit(
    ['log', '--format=%aE%n%aI', '--numstat', ...rangeArgs, ...branchArgs, '--'],
    cwd,
  )
  const logByAuthor = parseAuthorLog(authorLogOutput)

  // ─── Branch info ──────────────────────────────────────
  const branchList = runGit(['branch', '-a'], cwd)
  const totalBranches = branchList
    .split('\n')
    .filter((l) => l.trim().length > 0).length

  const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], cwd).trim()

  // ─── Tags ─────────────────────────────────────────────
  const tagList = runGit(['tag'], cwd)
  const totalTags = tagList
    .split('\n')
    .filter((l) => l.trim().length > 0).length

  // ─── Compute derived stats ────────────────────────────
  const totalCommits = shortlogData.reduce((sum, d) => sum + d.commits, 0)
  const totalAuthors = shortlogData.length
  const totalAdditions = logData.reduce((sum, d) => sum + d.additions, 0)
  const totalDeletions = logData.reduce((sum, d) => sum + d.deletions, 0)

  const commitDates = logData.map((d) => new Date(d.date))
  const uniqueDays = new Set(commitDates.map((d) => d.toISOString().slice(0, 10)))
  const activeDays = uniqueDays.size

  const firstCommitDate = commitDates.length > 0
    ? new Date(Math.min(...commitDates.map((d) => d.getTime()))).toISOString().slice(0, 10)
    : ''
  const lastCommitDate = commitDates.length > 0
    ? new Date(Math.max(...commitDates.map((d) => d.getTime()))).toISOString().slice(0, 10)
    : ''

  // Compute activity rates
  let daysSpan = 1
  if (commitDates.length >= 2) {
    const firstMs = Math.min(...commitDates.map((d) => d.getTime()))
    const lastMs = Math.max(...commitDates.map((d) => d.getTime()))
    daysSpan = Math.max(1, Math.ceil((lastMs - firstMs) / (1000 * 60 * 60 * 24)))
  }

  const commitsPerDay = Math.round((totalCommits / daysSpan) * 100) / 100
  const commitsPerWeek = Math.round((totalCommits / Math.max(1, daysSpan / 7)) * 100) / 100
  const commitsPerMonth = Math.round((totalCommits / Math.max(1, daysSpan / 30)) * 100) / 100

  // ─── Activity patterns ────────────────────────────────
  const hourlyActivity = computeHourlyActivity(logData)
  const dailyActivity = computeDailyActivity(logData)
  const weeklyActivity = computeWeeklyActivity(logData)

  // ─── Contributor stats ────────────────────────────────
  const contributorStats = computeContributorStats(shortlogData, logByAuthor)

  // ─── Bus factor ───────────────────────────────────────
  const busFactor = computeBusFactor(contributorStats)

  // ─── Peaks ────────────────────────────────────────────
  const peakHour = computePeakHour(hourlyActivity)
  const peakDay = computePeakDay(dailyActivity)

  return {
    activeDays,
    busFactor,
    commitsPerDay,
    commitsPerMonth,
    commitsPerWeek,
    contributorStats,
    currentBranch,
    dailyActivity,
    firstCommitDate,
    hourlyActivity,
    lastCommitDate,
    peakDay,
    peakHour,
    totalAdditions,
    totalAuthors,
    totalBranches,
    totalCommits,
    totalDeletions,
    totalTags,
    weeklyActivity,
  }
}

// ─── Author log parsing ──────────────────────────────────

/**
 * Parse git log output with author email, date, and numstat into a map keyed by email.
 *
 * Output format: `%aE%n%aI` followed by numstat per commit.
 */
export function parseAuthorLog(
  output: string,
): Map<string, { date: string; additions: number; deletions: number }[]> {
  const result = new Map<string, { date: string; additions: number; deletions: number }[]>()
  if (!output.trim()) return result

  let currentAuthor = ''
  let currentDate = ''
  let additions = 0
  let deletions = 0

  function flushCommit(): void {
    if (currentAuthor && currentDate) {
      const existing = result.get(currentAuthor) ?? []
      existing.push({ additions, date: currentDate, deletions })
      result.set(currentAuthor, existing)
    }
  }

  for (const line of output.split('\n')) {
    if (line.includes('@') && !line.includes('\t')) {
      flushCommit()
      currentAuthor = line.trim()
      currentDate = ''
      additions = 0
      deletions = 0
      continue
    }

    const dateMatch = line.match(/^\d{4}-\d{2}-\d{2}T/)
    if (dateMatch) {
      currentDate = line.trim()
      continue
    }

    const numstatMatch = line.match(/^(\d+|-)\t(\d+|-)\t/)
    if (numstatMatch) {
      const addVal = numstatMatch[1] ?? ''
      const delVal = numstatMatch[2]!
      additions += addVal === '-' ? 0 : Number.parseInt(addVal, 10)
      deletions += delVal === '-' ? 0 : Number.parseInt(delVal, 10)
    }
  }

  flushCommit()

  return result
}
