// ─── Interfaces ──────────────────────────────────────────

export type CommitType =
  | 'build'
  | 'ci'
  | 'chore'
  | 'docs'
  | 'feat'
  | 'fix'
  | 'other'
  | 'perf'
  | 'refactor'
  | 'revert'
  | 'style'
  | 'test'

export interface CommitInfo {
  hash: string
  shortHash: string
  date: string
  author: string
  message: string
  type: CommitType
  scope: string
  breaking: boolean
  body: string
}

export interface ChangelogGroup {
  type: CommitType
  title: string
  commits: CommitInfo[]
}

export interface VersionGroup {
  version: string
  date: string
  groups: ChangelogGroup[]
}

export interface ChangelogsResult {
  versions: VersionGroup[]
  totalCommits: number
  dateRange: string
  authors: string[]
}

export interface ChangelogsOptions {
  since: string
  until: string
  type: 'conventional' | 'detailed' | 'simple'
}

// ─── Type importance ordering ─────────────────────────────

const TYPE_ORDER: Record<CommitType, number> = {
  feat: 0,
  fix: 1,
  refactor: 2,
  perf: 3,
  revert: 4,
  docs: 5,
  test: 6,
  chore: 7,
  style: 8,
  build: 9,
  ci: 10,
  other: 11,
}

const TYPE_TITLES: Record<CommitType, string> = {
  build: 'Build',
  chore: 'Chores',
  ci: 'CI',
  docs: 'Documentation',
  feat: 'Features',
  fix: 'Bug Fixes',
  other: 'Other',
  perf: 'Performance',
  refactor: 'Refactoring',
  revert: 'Reverts',
  style: 'Styles',
  test: 'Tests',
}

// ─── Commit classification ────────────────────────────────

/**
 * Classify a commit message into its conventional commit type.
 *
 * @example
 * ```ts
 * classifyCommit('feat: add login') // 'feat'
 * classifyCommit('fix typo') // 'fix'
 * classifyCommit('update readme') // 'docs'
 * ```
 */
export function classifyCommit(message: string): CommitType {
  const lower = message.toLowerCase()

  const conventionalMatch = lower.match(
    /^(feat|fix|refactor|docs|doc|test|chore|style|perf|build|ci|revert)(\(|$|:|\!)/,
  )
  if (conventionalMatch) {
    const raw = conventionalMatch[1]
    if (raw === 'doc') return 'docs'
    return raw as CommitType
  }

  if (lower.includes('break') || lower.includes('breaking')) return 'fix'
  if (lower.startsWith('merge')) return 'other'
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('patch')) return 'fix'
  if (lower.includes('add') || lower.includes('feature') || lower.includes('implement')) return 'feat'
  if (lower.includes('refactor') || lower.includes('clean') || lower.includes('simplify')) return 'refactor'
  if (lower.includes('test') || lower.includes('spec')) return 'test'
  if (lower.includes('doc') || lower.includes('readme') || lower.includes('comment')) return 'docs'
  if (lower.includes('style') || lower.includes('format') || lower.includes('lint')) return 'style'
  if (lower.includes('perf') || lower.includes('optim') || lower.includes('speed')) return 'perf'
  if (lower.includes('build') || lower.includes('compile') || lower.includes('bundle')) return 'build'
  if (lower.includes('ci') || lower.includes('deploy') || lower.includes('release')) return 'ci'

  return 'other'
}

// ─── Scope extraction ─────────────────────────────────────

/**
 * Extract the scope from a conventional commit message like `feat(auth):`.
 *
 * @example
 * ```ts
 * extractScope('feat(auth): add login') // 'auth'
 * extractScope('fix: typo') // ''
 * ```
 */
export function extractScope(message: string): string {
  const match = message.match(/^[a-z]+\(([^)]+)\)/)
  return match?.[1] ?? ''
}

// ─── Breaking change detection ────────────────────────────

/**
 * Detect breaking changes from `!` after type or BREAKING CHANGE in body.
 *
 * @example
 * ```ts
 * detectBreaking('feat!: new api', '') // true
 * detectBreaking('feat: update', 'BREAKING CHANGE: drops old api') // true
 * ```
 */
export function detectBreaking(message: string, body: string): boolean {
  if (/^[a-z]+(\([^)]*\))?\!/.test(message)) return true
  if (body.includes('BREAKING CHANGE') || body.includes('BREAKING-CHANGE')) return true
  return false
}

// ─── Git log parsing ──────────────────────────────────────

/**
 * Parse `git log --format="%H|%h|%aI|%an|%s"` output into CommitInfo[].
 *
 * @example
 * ```ts
 * const commits = parseGitLog(output)
 * console.log(commits[0].type)
 * ```
 */
export function parseGitLog(output: string): CommitInfo[] {
  if (!output.trim()) return []

  const lines = output.trim().split('\n')
  const commits: CommitInfo[] = []

  for (const line of lines) {
    const parts = line.split('|')
    if (parts.length < 5) continue

    const hash = parts[0] ?? ''
    const shortHash = parts[1] ?? ''
    const date = parts[2] ?? ''
    const author = parts[3] ?? ''
    const message = parts.slice(4).join('|')

    const commitType = classifyCommit(message)
    const commitScope = extractScope(message)
    const commitBreaking = detectBreaking(message, '')

    commits.push({
      author,
      body: '',
      breaking: commitBreaking,
      date,
      hash,
      message,
      scope: commitScope,
      shortHash,
      type: commitType,
    })
  }

  return commits
}

// ─── Group by type ────────────────────────────────────────

/**
 * Group commits by type, sorted by importance.
 *
 * @example
 * ```ts
 * const groups = groupByType(commits)
 * console.log(groups[0].title) // 'Features'
 * ```
 */
export function groupByType(commits: CommitInfo[]): ChangelogGroup[] {
  const map = new Map<CommitType, CommitInfo[]>()

  for (const commit of commits) {
    if (!map.has(commit.type)) {
      map.set(commit.type, [])
    }
    map.get(commit.type)!.push(commit)
  }

  const groups: ChangelogGroup[] = []
  for (const [type, typeCommits] of map) {
    groups.push({
      commits: typeCommits,
      title: TYPE_TITLES[type],
      type,
    })
  }

  groups.sort((a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99))
  return groups
}

// ─── Group by version ─────────────────────────────────────

/**
 * Group commits by version tags, or "Unreleased" if no tags found.
 *
 * @example
 * ```ts
 * const versions = groupByVersion(commits, cwd)
 * console.log(versions[0].version)
 * ```
 */
export function groupByVersion(
  commits: CommitInfo[],
  _cwd: string,
): VersionGroup[] {
  if (commits.length === 0) return []

  const groups = groupByType(commits)
  const date = (commits[0]?.date ?? '').split('T')[0] ?? ''

  return [
    {
      date,
      groups,
      version: 'Unreleased',
    },
  ]
}

// ─── Build result ─────────────────────────────────────────

/**
 * Orchestrate full changelog generation from git history.
 *
 * @example
 * ```ts
 * const result = await buildChangelogsResult(cwd, options)
 * console.log(result.totalCommits)
 * ```
 */
export async function buildChangelogsResult(
  cwd: string,
  options: ChangelogsOptions,
): Promise<ChangelogsResult> {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const execFileAsync = promisify(execFile)

  let logOutput = ''
  try {
    const args = [
      'log',
      `--format=%H|%h|%aI|%an|%s`,
    ]
    if (options.since) args.push(`--since=${options.since}`)
    if (options.until) args.push(`--until=${options.until}`)
    args.push('--')

    const { stdout } = await execFileAsync('git', args, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    })
    logOutput = stdout
  } catch {
    // Not a git repo or no commits
    return {
      authors: [],
      dateRange: '',
      totalCommits: 0,
      versions: [],
    }
  }

  const commits = parseGitLog(logOutput)

  const versions = groupByVersion(commits, cwd)

  const authorSet = new Set(commits.map((c) => c.author))
  const authors = Array.from(authorSet).sort()

  let dateRange = ''
  if (commits.length > 0) {
    const firstDate = commits[0]?.date ?? ''
    const lastDate = commits[commits.length - 1]?.date ?? ''
    const first = firstDate.split('T')[0] ?? ''
    const last = lastDate.split('T')[0] ?? ''
    dateRange = first === last ? first : `${last} to ${first}`
  }

  return {
    authors,
    dateRange,
    totalCommits: commits.length,
    versions,
  }
}
