// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single parsed git commit entry.
 *
 * @example
 * const c: GitCommit = { hash: 'abc123', author: 'Alice', date: '2024-01-15', files: [...] }
 */
export interface GitCommit {
  hash: string
  author: string
  date: string
  files: GitFileChange[]
}

/**
 * A file change within a commit.
 *
 * @example
 * const f: GitFileChange = { file: 'src/core.ts', additions: 10, deletions: 3 }
 */
export interface GitFileChange {
  file: string
  additions: number
  deletions: number
}

/**
 * Churn metrics aggregated per file.
 *
 * @example
 * const fc: FileChurn = { file: 'src/core.ts', commitCount: 8, churnScore: 120, hotspots: true, ... }
 */
export interface FileChurn {
  file: string
  commitCount: number
  authorCount: number
  totalAdditions: number
  totalDeletions: number
  netChange: number
  churnScore: number
  lastChanged: string
  firstChanged: string
  authors: string[]
  hotspots: boolean
}

/**
 * Churn metrics aggregated per author.
 *
 * @example
 * const ac: AuthorChurn = { author: 'Alice', commitCount: 15, additions: 500, ... }
 */
export interface AuthorChurn {
  author: string
  commitCount: number
  filesChanged: number
  additions: number
  deletions: number
  netChange: number
  averageChangeSize: number
  mostChangedFiles: string[]
}

/**
 * Churn metrics aggregated per time period.
 *
 * @example
 * const tc: TimeChurn = { period: '2024-01', commits: 20, additions: 300, ... }
 */
export interface TimeChurn {
  period: string
  commits: number
  additions: number
  deletions: number
  filesChanged: number
  authors: number
  netChange: number
}

/**
 * Aggregate churn statistics.
 *
 * @example
 * const stats: ChurnStats = { totalCommits: 100, hotspotFiles: 3, ... }
 */
export interface ChurnStats {
  totalCommits: number
  totalAdditions: number
  totalDeletions: number
  totalFilesChanged: number
  hotspotFiles: number
  averageChurnScore: number
  mostChurnedFile: string
  mostActiveAuthor: string
}

/**
 * Complete churn analysis result.
 *
 * @example
 * const result: ChurnResult = { fileChurn: [...], authorChurn: [...], ... }
 */
export interface ChurnResult {
  fileChurn: FileChurn[]
  authorChurn: AuthorChurn[]
  timeChurn: TimeChurn[]
  stats: ChurnStats
  hotspots: FileChurn[]
  recommendations: string[]
}

/**
 * Options for churn analysis.
 *
 * @example
 * const opts: ChurnOptions = { since: '2024-01-01', by: 'file', top: 10 }
 */
export interface ChurnOptions {
  since?: string
  until?: string
  by?: 'author' | 'file' | 'month'
  top?: number
}

// ─── Git Log Parsing ──────────────────────────────────────────────────────────

/**
 * Parse git log output with numstat into structured commits.
 * Input format: lines of COMMIT|author|date followed by additions\\tdeletions\\tfile pairs.
 *
 * @example
 * parseGitLog('COMMIT|Alice|2024-01-15\\n10\\t3\\tsrc/core.ts') // [{ hash, author, date, files }]
 */
export function parseGitLog(output: string): GitCommit[] {
  const commits: GitCommit[] = []
  const lines = output.split('\n')
  let currentCommit: GitCommit | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('COMMIT|')) {
      if (currentCommit) commits.push(currentCommit)
      const parts = line.split('|')
      currentCommit = {
        hash: parts[1] ?? '',
        author: parts[2] ?? '',
        date: parts[3] ?? '',
        files: [],
      }
    } else if (currentCommit) {
      const parts = line.split('\t')
      if (parts.length >= 3) {
        const adds = parts[0] === '-' ? 0 : Number(parts[0])
        const dels = parts[1] === '-' ? 0 : Number(parts[1])
        const file = parts.slice(2).join('\t')
        if (!Number.isNaN(adds) && !Number.isNaN(dels) && file) {
          currentCommit.files.push({ file, additions: adds, deletions: dels })
        }
      }
    }
  }

  if (currentCommit) commits.push(currentCommit)
  return commits
}

/**
 * Build the git log command arguments.
 *
 * @example
 * buildGitLogArgs({ since: '2024-01-01' }) // ['log', '--numstat', ...]
 */
export function buildGitLogArgs(options: ChurnOptions = {}): string[] {
  const args = ['log', '--numstat', '--format=COMMIT|%H|%aN|%aI']
  if (options.since) args.push(`--since=${options.since}`)
  if (options.until) args.push(`--until=${options.until}`)
  return args
}

// ─── File Churn ───────────────────────────────────────────────────────────────

/**
 * Compute churn metrics aggregated per file.
 *
 * @example
 * computeFileChurn(commits) // [{ file: 'core.ts', commitCount: 5, churnScore: 80, ... }]
 */
export function computeFileChurn(commits: GitCommit[]): FileChurn[] {
  const fileMap = new Map<string, {
    commitCount: number
    additions: number
    deletions: number
    authors: Set<string>
    firstChanged: string
    lastChanged: string
  }>()

  for (const commit of commits) {
    for (const fc of commit.files) {
      const existing = fileMap.get(fc.file)
      if (existing) {
        existing.commitCount++
        existing.additions += fc.additions
        existing.deletions += fc.deletions
        existing.authors.add(commit.author)
        if (commit.date < existing.firstChanged) existing.firstChanged = commit.date
        if (commit.date > existing.lastChanged) existing.lastChanged = commit.date
      } else {
        fileMap.set(fc.file, {
          commitCount: 1,
          additions: fc.additions,
          deletions: fc.deletions,
          authors: new Set([commit.author]),
          firstChanged: commit.date,
          lastChanged: commit.date,
        })
      }
    }
  }

  const results: FileChurn[] = []
  for (const [file, data] of fileMap) {
    const churnScore = computeChurnScore(data.commitCount, data.additions, data.deletions)
    results.push({
      file,
      commitCount: data.commitCount,
      authorCount: data.authors.size,
      totalAdditions: data.additions,
      totalDeletions: data.deletions,
      netChange: data.additions - data.deletions,
      churnScore,
      lastChanged: data.lastChanged,
      firstChanged: data.firstChanged,
      authors: [...data.authors].sort(),
      hotspots: false,
    })
  }

  results.sort((a, b) => b.churnScore - a.churnScore)
  return results
}

// ─── Author Churn ─────────────────────────────────────────────────────────────

/**
 * Compute churn metrics aggregated per author.
 *
 * @example
 * computeAuthorChurn(commits) // [{ author: 'Alice', commitCount: 10, ... }]
 */
export function computeAuthorChurn(commits: GitCommit[]): AuthorChurn[] {
  const authorMap = new Map<string, {
    commitCount: number
    additions: number
    deletions: number
    files: Map<string, number>
  }>()

  for (const commit of commits) {
    const existing = authorMap.get(commit.author)
    const filesInCommit = new Set(commit.files.map((f) => f.file))
    const totalAdds = commit.files.reduce((s, f) => s + f.additions, 0)
    const totalDels = commit.files.reduce((s, f) => s + f.deletions, 0)

    if (existing) {
      existing.commitCount++
      existing.additions += totalAdds
      existing.deletions += totalDels
      for (const f of filesInCommit) {
        existing.files.set(f, (existing.files.get(f) ?? 0) + 1)
      }
    } else {
      const files = new Map<string, number>()
      for (const f of filesInCommit) {
        files.set(f, 1)
      }
      authorMap.set(commit.author, {
        commitCount: 1,
        additions: totalAdds,
        deletions: totalDels,
        files,
      })
    }
  }

  const results: AuthorChurn[] = []
  for (const [author, data] of authorMap) {
    const sortedFiles = [...data.files.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([f]) => f)
    const totalChange = data.additions + data.deletions
    results.push({
      author,
      commitCount: data.commitCount,
      filesChanged: data.files.size,
      additions: data.additions,
      deletions: data.deletions,
      netChange: data.additions - data.deletions,
      averageChangeSize: data.commitCount > 0 ? Math.round(totalChange / data.commitCount) : 0,
      mostChangedFiles: sortedFiles,
    })
  }

  results.sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions))
  return results
}

// ─── Time Churn ───────────────────────────────────────────────────────────────

/**
 * Compute churn metrics aggregated by month.
 *
 * @example
 * computeTimeChurn(commits) // [{ period: '2024-01', commits: 10, ... }]
 */
export function computeTimeChurn(commits: GitCommit[]): TimeChurn[] {
  const periodMap = new Map<string, {
    commits: number
    additions: number
    deletions: number
    files: Set<string>
    authors: Set<string>
  }>()

  for (const commit of commits) {
    const period = commit.date.slice(0, 7)
    const existing = periodMap.get(period)
    const adds = commit.files.reduce((s, f) => s + f.additions, 0)
    const dels = commit.files.reduce((s, f) => s + f.deletions, 0)

    if (existing) {
      existing.commits++
      existing.additions += adds
      existing.deletions += dels
      for (const f of commit.files) existing.files.add(f.file)
      existing.authors.add(commit.author)
    } else {
      const files = new Set(commit.files.map((f) => f.file))
      const authors = new Set([commit.author])
      periodMap.set(period, { commits: 1, additions: adds, deletions: dels, files, authors })
    }
  }

  const results: TimeChurn[] = []
  for (const [period, data] of periodMap) {
    results.push({
      period,
      commits: data.commits,
      additions: data.additions,
      deletions: data.deletions,
      filesChanged: data.files.size,
      authors: data.authors.size,
      netChange: data.additions - data.deletions,
    })
  }

  results.sort((a, b) => a.period.localeCompare(b.period))
  return results
}

// ─── Churn Score ──────────────────────────────────────────────────────────────

/**
 * Compute a weighted churn score: commitCount * (additions + deletions).
 *
 * @example
 * computeChurnScore(5, 100, 50) // 750
 */
export function computeChurnScore(commitCount: number, additions: number, deletions: number): number {
  return commitCount * (additions + deletions)
}

// ─── Hotspot Detection ────────────────────────────────────────────────────────

/**
 * Identify hotspot files where churnScore > mean + 1 stddev.
 *
 * @example
 * identifyHotspots(fileChurn) // [{ file: 'core.ts', hotspots: true, ... }]
 */
export function identifyHotspots(fileChurn: FileChurn[]): FileChurn[] {
  if (fileChurn.length === 0) return []

  const scores = fileChurn.map((f) => f.churnScore)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((a, s) => a + (s - mean) ** 2, 0) / scores.length
  const stddev = Math.sqrt(variance)
  const threshold = mean + stddev

  const flagged: FileChurn[] = []
  for (const fc of fileChurn) {
    if (fc.churnScore > threshold) {
      flagged.push({ ...fc, hotspots: true })
    }
  }

  return flagged.sort((a, b) => b.churnScore - a.churnScore)
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Compute aggregate churn statistics.
 *
 * @example
 * computeChurnStats(fileChurn, authorChurn, commits) // { totalCommits: 50, ... }
 */
export function computeChurnStats(
  fileChurn: FileChurn[],
  authorChurn: AuthorChurn[],
  commits: GitCommit[],
): ChurnStats {
  const totalAdditions = fileChurn.reduce((s, f) => s + f.totalAdditions, 0)
  const totalDeletions = fileChurn.reduce((s, f) => s + f.totalDeletions, 0)
  const avgChurnScore = fileChurn.length > 0
    ? Math.round(fileChurn.reduce((s, f) => s + f.churnScore, 0) / fileChurn.length)
    : 0

  return {
    totalCommits: commits.length,
    totalAdditions,
    totalDeletions,
    totalFilesChanged: fileChurn.length,
    hotspotFiles: fileChurn.filter((f) => f.hotspots).length,
    averageChurnScore: avgChurnScore,
    mostChurnedFile: fileChurn[0]?.file ?? '',
    mostActiveAuthor: authorChurn[0]?.author ?? '',
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate actionable recommendations based on churn analysis.
 *
 * @example
 * generateChurnRecommendations(hotspots, stats, timeChurn) // ['Refactor core.ts...', ...]
 */
export function generateChurnRecommendations(
  hotspots: FileChurn[],
  stats: ChurnStats,
  timeChurn: TimeChurn[],
): string[] {
  const recs: string[] = []

  if (hotspots.length > 0) {
    recs.push(`${hotspots.length} hotspot file${hotspots.length > 1 ? 's' : ''} detected. High churn often correlates with bugs and instability.`)
    for (const hs of hotspots.slice(0, 3)) {
      recs.push(`  - ${hs.file}: score ${hs.churnScore} (${hs.commitCount} commits by ${hs.authorCount} authors) — consider refactoring or splitting.`)
    }
  }

  if (stats.hotspotFiles > 0 && stats.totalFilesChanged > 0) {
    const ratio = stats.hotspotFiles / stats.totalFilesChanged
    if (ratio > 0.3) {
      recs.push(`${Math.round(ratio * 100)}% of files are hotspots. The codebase may need architectural restructuring.`)
    }
  }

  if (timeChurn.length >= 3) {
    const recent = timeChurn.slice(-3)
    const avgRecent = recent.reduce((s, t) => s + t.commits, 0) / recent.length
    const earlier = timeChurn.slice(0, -3)
    if (earlier.length > 0) {
      const avgEarlier = earlier.reduce((s, t) => s + t.commits, 0) / earlier.length
      if (avgRecent > avgEarlier * 1.5) {
        recs.push('Churn is increasing. Ensure changes are adding value and not rework.')
      } else if (avgRecent < avgEarlier * 0.5) {
        recs.push('Churn is decreasing. The codebase may be stabilizing.')
      }
    }
  }

  for (const hs of hotspots) {
    if (hs.authorCount > 5) {
      recs.push(`${hs.file} has ${hs.authorCount} authors — high coordination cost. Consider clear ownership.`)
    }
  }

  if (recs.length === 0) {
    recs.push('Churn levels look healthy. No significant hotspots detected.')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete churn result from pre-parsed commits.
 *
 * @example
 * const result = buildChurnResultFromCommits(commits, { top: 10 })
 */
export function buildChurnResultFromCommits(
  commits: GitCommit[],
  options: ChurnOptions = {},
): ChurnResult {
  const top = options.top ?? 20

  const allFileChurn = computeFileChurn(commits)
  const flagged = identifyHotspots(allFileChurn)
  const hotspotFiles = new Set(flagged.map((f) => f.file))

  const fileChurnMarked = allFileChurn.map((fc) => ({
    ...fc,
    hotspots: hotspotFiles.has(fc.file),
  }))

  const authorChurn = computeAuthorChurn(commits)
  const timeChurn = computeTimeChurn(commits)

  const stats = computeChurnStats(fileChurnMarked, authorChurn, commits)
  const recommendations = generateChurnRecommendations(flagged, stats, timeChurn)

  return {
    fileChurn: fileChurnMarked.slice(0, top),
    authorChurn: authorChurn.slice(0, top),
    timeChurn,
    stats,
    hotspots: flagged.slice(0, top),
    recommendations,
  }
}
