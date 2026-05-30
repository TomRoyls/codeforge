import { execSync } from 'node:child_process'

// ─── Interfaces ──────────────────────────────────────────

export interface DayActivity {
  date: string
  dayOfWeek: number
  commits: number
  authors: Map<string, number>
}

export interface HourActivity {
  hour: number
  commits: number
}

export interface AuthorActivity {
  author: string
  commits: number
  firstCommit: string
  lastCommit: string
}

export interface HeatmapResult {
  days: DayActivity[]
  hours: HourActivity[]
  authors: AuthorActivity[]
  totalCommits: number
  period: string
  startDate: string
  endDate: string
}

export interface CommitEntry {
  timestamp: number
  author: string
}

// ─── Constants ───────────────────────────────────────────

const PERIOD_DAYS: Record<string, number> = {
  month: 30,
  week: 7,
  year: 365,
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// ─── Git log ─────────────────────────────────────────────

/**
 * Retrieve commit activity from git log, filtered by period and optional author.
 *
 * @example
 * const commits = getCommitActivity(process.cwd(), 'month')
 * const filtered = getCommitActivity(process.cwd(), 'week', 'Alice')
 */
export function getCommitActivity(
  cwd: string,
  period: string,
  authorFilter?: string,
): CommitEntry[] {
  const days = PERIOD_DAYS[period] ?? 30

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - days)
  const sinceStr = sinceDate.toISOString().split('T')[0] ?? ''

  let cmd = `git log --pretty=format:"%at|%an" --no-merges --since="${sinceStr}"`
  if (authorFilter) {
    cmd += ` --author="${authorFilter}"`
  }

  let output: string
  try {
    output = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch {
    return []
  }

  if (!output.trim()) {
    return []
  }

  const entries: CommitEntry[] = []

  for (const line of output.trim().split('\n')) {
    const separatorIndex = line.indexOf('|')
    if (separatorIndex === -1) continue

    const timestampStr = line.slice(0, separatorIndex)
    const author = line.slice(separatorIndex + 1)
    const timestamp = Number(timestampStr)

    if (!Number.isFinite(timestamp) || !author) continue

    entries.push({ author, timestamp })
  }

  return entries
}

// ─── Grouping ────────────────────────────────────────────

/**
 * Group commit entries by date (YYYY-MM-DD), sorted chronologically.
 *
 * @example
 * const days = groupByDay(commits)
 * // days[0] => { date: '2025-06-01', dayOfWeek: 0, commits: 5, authors: Map {...} }
 */
export function groupByDay(commits: CommitEntry[]): DayActivity[] {
  const dayMap = new Map<string, DayActivity>()

  for (const commit of commits) {
    const date = new Date(commit.timestamp * 1000)
    const dateStr = date.toISOString().split('T')[0] ?? ''

    const existing = dayMap.get(dateStr)
    if (existing) {
      existing.commits += 1
      const authorCount = existing.authors.get(commit.author)
      existing.authors.set(commit.author, (authorCount ?? 0) + 1)
    } else {
      const authors = new Map<string, number>()
      authors.set(commit.author, 1)
      dayMap.set(dateStr, {
        authors,
        commits: 1,
        date: dateStr,
        dayOfWeek: date.getUTCDay(),
      })
    }
  }

  const sortedKeys = Array.from(dayMap.keys()).sort()
  return sortedKeys.map((key) => dayMap.get(key)!)
}

/**
 * Group commit entries by hour (0-23), sorted by hour.
 * All 24 hours are included even with zero commits.
 *
 * @example
 * const hours = groupByHour(commits)
 * // hours[0] => { hour: 0, commits: 3 }
 * // hours[23] => { hour: 23, commits: 1 }
 */
export function groupByHour(commits: CommitEntry[]): HourActivity[] {
  const hourCounts = new Array<number>(24).fill(0)

  for (const commit of commits) {
    const date = new Date(commit.timestamp * 1000)
    const hour = date.getUTCHours()
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1
  }

  const result: HourActivity[] = []
  for (let i = 0; i < 24; i++) {
    result.push({ commits: hourCounts[i] ?? 0, hour: i })
  }

  return result
}

/**
 * Group commit entries by author name, sorted by commit count descending.
 * Tracks first and last commit dates per author.
 *
 * @example
 * const authors = groupByAuthor(commits)
 * // authors[0] => { author: 'Alice', commits: 42, firstCommit: '2025-01-01', lastCommit: '2025-06-01' }
 */
export function groupByAuthor(commits: CommitEntry[]): AuthorActivity[] {
  const authorMap = new Map<string, { commits: number; firstTimestamp: number; lastTimestamp: number }>()

  for (const commit of commits) {
    const existing = authorMap.get(commit.author)
    if (existing) {
      existing.commits += 1
      if (commit.timestamp < existing.firstTimestamp) {
        existing.firstTimestamp = commit.timestamp
      }
      if (commit.timestamp > existing.lastTimestamp) {
        existing.lastTimestamp = commit.timestamp
      }
    } else {
      authorMap.set(commit.author, {
        commits: 1,
        firstTimestamp: commit.timestamp,
        lastTimestamp: commit.timestamp,
      })
    }
  }

  const entries = Array.from(authorMap.entries()).map(([author, data]) => ({
    author,
    commits: data.commits,
    firstCommit: new Date(data.firstTimestamp * 1000).toISOString().split('T')[0] ?? '',
    lastCommit: new Date(data.lastTimestamp * 1000).toISOString().split('T')[0] ?? '',
  }))

  entries.sort((a, b) => b.commits - a.commits)

  return entries
}

// ─── Utilities ───────────────────────────────────────────

/**
 * Get the short day name for a day-of-week number (0=Sun...6=Sat).
 *
 * @example
 * getDayName(0) // => 'Sun'
 * getDayName(1) // => 'Mon'
 */
export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? '???'
}

/**
 * Compute a heat level (0-4) based on commit count relative to max.
 * 0 = no activity, 4 = maximum activity.
 *
 * @example
 * getHeatLevel(0, 10) // => 0
 * getHeatLevel(10, 10) // => 4
 * getHeatLevel(5, 10) // => 2
 */
export function getHeatLevel(count: number, maxCount: number): number {
  if (count === 0) return 0
  if (maxCount === 0) return 0
  if (count >= maxCount) return 4

  const ratio = count / maxCount
  if (ratio < 0.25) return 1
  if (ratio < 0.5) return 2
  if (ratio < 0.75) return 3
  return 4
}

/**
 * Calculate the start and end dates for a given period.
 *
 * @example
 * const { startDate, endDate } = getPeriodDates('week')
 */
export function getPeriodDates(period: string): { endDate: string; startDate: string } {
  const days = PERIOD_DAYS[period] ?? 30
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)

  return {
    endDate: end.toISOString().split('T')[0] ?? '',
    startDate: start.toISOString().split('T')[0] ?? '',
  }
}
