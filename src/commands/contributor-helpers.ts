// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * An area of the codebase a contributor works in.
 *
 * @example
 * const area: ContributorArea = { directory: 'src/components', commits: 15, percentage: 0.6 }
 */
export interface ContributorArea {
  directory: string
  commits: number
  percentage: number
}

/**
 * A single contributor's profile.
 *
 * @example
 * const c: Contributor = { name: 'Alice', email: 'a@b.com', commitCount: 50, additions: 2000, ... }
 */
export interface Contributor {
  name: string
  email: string
  commitCount: number
  additions: number
  deletions: number
  netChange: number
  filesChanged: number
  firstCommit: string
  lastCommit: string
  activeDays: number
  areas: ContributorArea[]
  expertise: string[]
}

/**
 * Contribution distribution statistics.
 *
 * @example
 * const d: ContributionDistribution = { giniCoefficient: 0.35, busFactor: 3, ... }
 */
export interface ContributionDistribution {
  giniCoefficient: number
  topContributorPercentage: number
  busFactor: number
  totalContributors: number
  activeContributors: number
  newContributors: number
}

/**
 * A knowledge silo — file owned by one person.
 *
 * @example
 * const s: KnowledgeSilos = { file: 'src/core.ts', primaryAuthor: 'Bob', primaryPercentage: 0.9, risk: 'high' }
 */
export interface KnowledgeSilos {
  file: string
  primaryAuthor: string
  primaryPercentage: number
  risk: 'low' | 'medium' | 'high'
}

/**
 * Aggregate contributor statistics.
 *
 * @example
 * const s: ContributorStats = { totalCommits: 200, mostActiveContributor: 'Alice', ... }
 */
export interface ContributorStats {
  totalCommits: number
  totalContributors: number
  averageCommitsPerContributor: number
  mostActiveContributor: string
  longestTenure: string
  newestContributor: string
}

/**
 * Complete contributor analysis result.
 *
 * @example
 * const r: ContributorResult = { contributors: [...], distribution: {...}, silos: [...], ... }
 */
export interface ContributorResult {
  contributors: Contributor[]
  distribution: ContributionDistribution
  silos: KnowledgeSilos[]
  stats: ContributorStats
  recommendations: string[]
}

/**
 * A single parsed commit record.
 *
 * @example
 * const c: ParsedCommit = { hash: 'abc', author: 'Alice', date: '2024-01-01', files: [{ file: 'src/a.ts', adds: 5, dels: 2 }] }
 */
export interface ParsedCommit {
  hash: string
  author: string
  date: string
  files: { file: string; adds: number; dels: number }[]
}

/**
 * Options for contributor analysis.
 *
 * @example
 * const opts: ContributorOptions = { since: '2024-01-01' }
 */
export interface ContributorOptions {
  since?: string
  until?: string
  top?: number
  verbose?: boolean
}

// ─── Git Output Parsing ───────────────────────────────────────────────────────

/**
 * Parse `git shortlog -sn` output into name/count pairs.
 *
 * @example
 * parseGitShortlog('  50\tAlice\n  30\tBob\n') // [{ name: 'Alice', count: 50 }, { name: 'Bob', count: 30 }]
 */
export function parseGitShortlog(output: string): { name: string; count: number }[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/)
      if (!match) return null
      return { name: match[2]!, count: parseInt(match[1] ?? '', 10) }
    })
    .filter((r): r is { name: string; count: number } => r !== null)
    .sort((a, b) => b.count - a.count)
}

/**
 * Parse detailed git log output into commit records.
 * Expected format: COMMIT|hash|author|date followed by numstat lines.
 *
 * @example
 * parseGitLogForContributors('COMMIT|abc|Alice|2024-01-01\n5\t2\tsrc/a.ts\n') // [{ hash: 'abc', ... }]
 */
export function parseGitLogForContributors(output: string): ParsedCommit[] {
  const commits: ParsedCommit[] = []
  let current: ParsedCommit | null = null

  for (const line of output.split('\n')) {
    if (line.startsWith('COMMIT|')) {
      if (current) commits.push(current)
      const parts = line.split('|')
      current = {
        hash: parts[1] ?? '',
        author: parts[2] ?? '',
        date: parts[3] ?? '',
        files: [],
      }
    } else if (current && line.includes('\t')) {
      const parts = line.split('\t')
      if (parts.length >= 3) {
        const adds = parts[0] === '-' ? 0 : parseInt(parts[0]!, 10) || 0
        const dels = parts[1] === '-' ? 0 : parseInt(parts[1] ?? '', 10) || 0
        const file = parts[2]!.trim()
        if (file) {
          current.files.push({ file, adds, dels })
        }
      }
    }
  }

  if (current) commits.push(current)
  return commits
}

// ─── Build Contributors from Commits ──────────────────────────────────────────

/**
 * Aggregate parsed commits into contributor profiles.
 *
 * @example
 * buildContributors(commits) // [{ name: 'Alice', commitCount: 10, ... }]
 */
export function buildContributors(commits: ParsedCommit[]): Contributor[] {
  const map = new Map<string, {
    name: string
    emails: Set<string>
    commitCount: number
    additions: number
    deletions: number
    filesChanged: Set<string>
    firstCommit: string
    lastCommit: string
    commitDates: Set<string>
    areaCommits: Map<string, number>
  }>()

  for (const commit of commits) {
    const existing = map.get(commit.author)
    if (existing) {
      existing.commitCount++
      existing.additions += commit.files.reduce((s, f) => s + f.adds, 0)
      existing.deletions += commit.files.reduce((s, f) => s + f.dels, 0)
      for (const f of commit.files) existing.filesChanged.add(f.file)
      if (commit.date < existing.firstCommit) existing.firstCommit = commit.date
      if (commit.date > existing.lastCommit) existing.lastCommit = commit.date
      existing.commitDates.add(commit.date)
      for (const f of commit.files) {
        const dir = getDirectory(f.file)
        existing.areaCommits.set(dir, (existing.areaCommits.get(dir) ?? 0) + 1)
      }
    } else {
      const areaCommits = new Map<string, number>()
      for (const f of commit.files) {
        const dir = getDirectory(f.file)
        areaCommits.set(dir, (areaCommits.get(dir) ?? 0) + 1)
      }
      map.set(commit.author, {
        name: commit.author,
        emails: new Set(),
        commitCount: 1,
        additions: commit.files.reduce((s, f) => s + f.adds, 0),
        deletions: commit.files.reduce((s, f) => s + f.dels, 0),
        filesChanged: new Set(commit.files.map((f) => f.file)),
        firstCommit: commit.date,
        lastCommit: commit.date,
        commitDates: new Set([commit.date]),
        areaCommits,
      })
    }
  }

  const contributors: Contributor[] = []
  for (const data of map.values()) {
    const areas = computeContributorAreas(data.areaCommits, data.commitCount)
    const expertise = computeExpertise(areas)

    contributors.push({
      name: data.name,
      email: [...data.emails][0] ?? '',
      commitCount: data.commitCount,
      additions: data.additions,
      deletions: data.deletions,
      netChange: data.additions - data.deletions,
      filesChanged: data.filesChanged.size,
      firstCommit: data.firstCommit,
      lastCommit: data.lastCommit,
      activeDays: data.commitDates.size,
      areas,
      expertise,
    })
  }

  contributors.sort((a, b) => b.commitCount - a.commitCount)
  return contributors
}

function getDirectory(filePath: string): string {
  const parts = filePath.split('/')
  if (parts.length <= 1) return parts[0] ?? ''
  return parts.slice(0, 2).join('/')
}

// ─── Contributor Areas ────────────────────────────────────────────────────────

/**
 * Compute areas (directories) a contributor works in.
 *
 * @example
 * computeContributorAreas(new Map([['src/ui', 10], ['src/api', 5]]), 15) // [{ directory: 'src/ui', commits: 10, percentage: 0.67 }]
 */
export function computeContributorAreas(
  areaCommits: Map<string, number>,
  totalCommits: number,
): ContributorArea[] {
  if (totalCommits === 0) return []

  const areas: ContributorArea[] = []
  for (const [directory, commits] of areaCommits) {
    areas.push({
      directory,
      commits,
      percentage: Math.round((commits / totalCommits) * 100) / 100,
    })
  }

  areas.sort((a, b) => b.commits - a.commits)
  return areas.slice(0, 10)
}

// ─── Expertise ────────────────────────────────────────────────────────────────

/**
 * Derive top expertise areas from contributor areas.
 *
 * @example
 * computeExpertise([{ directory: 'src/ui', commits: 10, percentage: 0.6 }]) // ['src/ui']
 */
export function computeExpertise(areas: ContributorArea[]): string[] {
  return areas
    .filter((a) => a.percentage >= 0.1)
    .slice(0, 5)
    .map((a) => a.directory)
}

// ─── Distribution ─────────────────────────────────────────────────────────────

/**
 * Compute contribution distribution metrics.
 *
 * @example
 * computeDistribution(contributors) // { giniCoefficient: 0.3, busFactor: 2, ... }
 */
export function computeDistribution(
  contributors: Contributor[],
  now: string = new Date().toISOString().slice(0, 10),
): ContributionDistribution {
  const total = contributors.length
  if (total === 0) {
    return { giniCoefficient: 0, topContributorPercentage: 0, busFactor: 0, totalContributors: 0, activeContributors: 0, newContributors: 0 }
  }

  const counts = contributors.map((c) => c.commitCount).sort((a, b) => a - b)
  const totalCommits = counts.reduce((a, b) => a + b, 0)

  // Gini coefficient
  let giniSum = 0
  for (let i = 0; i < counts.length; i++) {
    for (let j = 0; j < counts.length; j++) {
      giniSum += Math.abs(counts[i]! - counts[j]!)
    }
  }
  const gini = totalCommits > 0 ? Math.round((giniSum / (2 * total * totalCommits)) * 100) / 100 : 0

  const topPercentage = totalCommits > 0 ? Math.round(((counts[counts.length - 1] ?? 0) / totalCommits) * 100) / 100 : 0

  const busFactor = computeBusFactor(contributors)

  // Active contributors: committed in last 90 days
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoff = ninetyDaysAgo.toISOString().slice(0, 10)
  const activeContributors = contributors.filter((c) => c.lastCommit >= cutoff).length

  // New contributors: first commit in last 30 days
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newCutoff = thirtyDaysAgo.toISOString().slice(0, 10)
  const newContributors = contributors.filter((c) => c.firstCommit >= newCutoff).length

  return {
    giniCoefficient: gini,
    topContributorPercentage: topPercentage,
    busFactor,
    totalContributors: total,
    activeContributors,
    newContributors,
  }
}

// ─── Bus Factor ───────────────────────────────────────────────────────────────

/**
 * Compute bus factor — minimum contributors whose cumulative commits exceed 50%.
 *
 * @example
 * computeBusFactor([{ commitCount: 60 }, { commitCount: 30 }, { commitCount: 10 }]) // 1
 * computeBusFactor([{ commitCount: 30 }, { commitCount: 30 }, { commitCount: 30 }]) // 2
 */
export function computeBusFactor(contributors: { commitCount: number }[]): number {
  if (contributors.length === 0) return 0

  const total = contributors.reduce((s, c) => s + c.commitCount, 0)
  if (total === 0) return 0

  const sorted = [...contributors].sort((a, b) => b.commitCount - a.commitCount)
  let cumulative = 0
  let count = 0

  for (const c of sorted) {
    cumulative += c.commitCount
    count++
    if (cumulative / total > 0.5) return count
  }

  return count
}

// ─── Knowledge Silos ──────────────────────────────────────────────────────────

/**
 * Detect knowledge silos — files where one author dominates.
 *
 * @example
 * detectKnowledgeSilos(commits) // [{ file: 'src/core.ts', primaryAuthor: 'Alice', risk: 'high' }]
 */
export function detectKnowledgeSilos(commits: ParsedCommit[]): KnowledgeSilos[] {
  const fileAuthors = new Map<string, Map<string, number>>()

  for (const commit of commits) {
    for (const f of commit.files) {
      const authorMap = fileAuthors.get(f.file)
      if (authorMap) {
        authorMap.set(commit.author, (authorMap.get(commit.author) ?? 0) + 1)
      } else {
        fileAuthors.set(f.file, new Map([[commit.author, 1]]))
      }
    }
  }

  const silos: KnowledgeSilos[] = []
  for (const [file, authors] of fileAuthors) {
    const totalCommits = [...authors.values()].reduce((a, b) => a + b, 0)
    if (totalCommits < 3) continue

    const sorted = [...authors.entries()].sort((a, b) => b[1] - a[1])
    const primary = sorted[0]!
    const percentage = Math.round((primary[1] / totalCommits) * 100) / 100

    if (percentage >= 0.7) {
      silos.push({
        file,
        primaryAuthor: primary[0],
        primaryPercentage: percentage,
        risk: percentage >= 0.9 ? 'high' : percentage >= 0.8 ? 'medium' : 'low',
      })
    }
  }

  silos.sort((a, b) => b.primaryPercentage - a.primaryPercentage)
  return silos.slice(0, 20)
}

// ─── Statistics ────────────────────────────────────────────────────────────────

/**
 * Compute aggregate contributor statistics.
 *
 * @example
 * computeContributorStats(contributors) // { totalCommits: 200, mostActiveContributor: 'Alice', ... }
 */
export function computeContributorStats(contributors: Contributor[]): ContributorStats {
  if (contributors.length === 0) {
    return { totalCommits: 0, totalContributors: 0, averageCommitsPerContributor: 0, mostActiveContributor: '', longestTenure: '', newestContributor: '' }
  }

  const totalCommits = contributors.reduce((s, c) => s + c.commitCount, 0)
  const sortedByCommits = [...contributors].sort((a, b) => b.commitCount - a.commitCount)
  const sortedByFirst = [...contributors].sort((a, b) => a.firstCommit.localeCompare(b.firstCommit))

  return {
    totalCommits,
    totalContributors: contributors.length,
    averageCommitsPerContributor: Math.round((totalCommits / contributors.length) * 10) / 10,
    mostActiveContributor: sortedByCommits[0]!.name,
    longestTenure: sortedByFirst[0]!.name,
    newestContributor: sortedByFirst[sortedByFirst.length - 1]!.name,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate contributor-related recommendations.
 *
 * @example
 * generateContributorRecommendations(distribution, silos) // ['Bus factor is 1. ...']
 */
export function generateContributorRecommendations(
  distribution: ContributionDistribution,
  silos: KnowledgeSilos[],
): string[] {
  const recs: string[] = []

  if (distribution.busFactor <= 1) {
    recs.push('Bus factor is 1. The project is at high risk if the top contributor leaves.')
  } else if (distribution.busFactor <= 2) {
    recs.push(`Bus factor is ${distribution.busFactor}. Consider cross-training more contributors.`)
  }

  const highRiskSilos = silos.filter((s) => s.risk === 'high')
  if (highRiskSilos.length > 0) {
    recs.push(`${highRiskSilos.length} file(s) have a single dominant author (>90% commits). Encourage knowledge sharing.`)
  }

  if (distribution.giniCoefficient > 0.6) {
    recs.push('Contribution is heavily skewed. Consider distributing work more evenly.')
  }

  if (distribution.newContributors === 0) {
    recs.push('No new contributors recently. Consider improving onboarding documentation.')
  }

  if (distribution.activeContributors < distribution.totalContributors * 0.5) {
    recs.push('More than half of contributors are inactive. Consider re-engaging the community.')
  }

  if (recs.length === 0) {
    recs.push('Contributor health looks good! Good distribution and active participation.')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete contributor analysis result from parsed git log.
 *
 * @example
 * const result = buildContributorResult(commits, {})
 */
export function buildContributorResult(
  commits: ParsedCommit[],
  options: ContributorOptions = {},
): ContributorResult {
  const top = options.top ?? Infinity
  const contributors = buildContributors(commits)
  const limitedContributors = top < contributors.length ? contributors.slice(0, top) : contributors

  const distribution = computeDistribution(contributors)
  const silos = detectKnowledgeSilos(commits)
  const stats = computeContributorStats(contributors)
  const recommendations = generateContributorRecommendations(distribution, silos)

  return {
    contributors: limitedContributors,
    distribution,
    silos,
    stats,
    recommendations,
  }
}
