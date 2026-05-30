// ─── Interfaces ──────────────────────────────────────────

export interface OwnerInfo {
  name: string
  email: string
  commits: number
  linesOwned: number
  filesOwned: number
  percentage: number
}

export interface FileOwnerShare {
  name: string
  percentage: number
}

export interface FileOwnership {
  file: string
  owners: FileOwnerShare[]
  primaryOwner: string
  lines: number
}

export interface DirOwnership {
  dir: string
  owners: FileOwnerShare[]
  primaryOwner: string
  files: number
  lines: number
}

export interface OwnershipResult {
  files: FileOwnership[]
  dirs: DirOwnership[]
  owners: OwnerInfo[]
  busFactor: number
  knowledgeMonopolies: string[]
}

export interface OwnershipOptions {
  ignorePatterns: string[]
  extensions: string[] | null
}

// ─── Git blame parsing ────────────────────────────────────

/**
 * Parse `git blame --line-porcelain` output into per-file author line counts.
 *
 * @example
 * ```ts
 * const data = parseGitBlame(output)
 * // data.get('file.ts')?.get('Alice') // number of lines
 * ```
 */
export function parseGitBlame(
  output: string,
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>()
  let currentFile = ''
  let currentAuthor = ''

  const lines = output.split('\n')
  for (const line of lines) {
    if (line.startsWith('filename ')) {
      currentFile = line.slice('filename '.length)
      if (!result.has(currentFile)) {
        result.set(currentFile, new Map())
      }
      if (currentAuthor && result.has(currentFile)) {
        const fileMap = result.get(currentFile)!
        fileMap.set(currentAuthor, (fileMap.get(currentAuthor) ?? 0) + 1)
      }
      continue
    }

    if (line.startsWith('author ')) {
      currentAuthor = line.slice('author '.length)
      if (currentAuthor === 'Not Committed Yet') {
        currentAuthor = '(uncommitted)'
      }
    }
  }

  return result
}

// ─── File ownership ───────────────────────────────────────

/**
 * Compute ownership percentages per file from blame data.
 *
 * @example
 * ```ts
 * const fileOwnership = computeFileOwnership(blameData)
 * console.log(fileOwnership[0].primaryOwner)
 * ```
 */
export function computeFileOwnership(
  blameData: Map<string, Map<string, number>>,
): FileOwnership[] {
  const results: FileOwnership[] = []

  for (const [file, authorLines] of blameData) {
    let totalLines = 0
    for (const count of authorLines.values()) {
      totalLines += count
    }

    if (totalLines === 0) continue

    const owners: FileOwnerShare[] = []
    for (const [name, count] of authorLines) {
      owners.push({
        name,
        percentage: Math.round((count / totalLines) * 100),
      })
    }

    owners.sort((a, b) => b.percentage - a.percentage)

    results.push({
      file,
      lines: totalLines,
      owners,
      primaryOwner: owners[0]?.name ?? '',
    })
  }

  results.sort((a, b) => a.file.localeCompare(b.file))
  return results
}

// ─── Directory ownership ──────────────────────────────────

/**
 * Aggregate file ownership into directory-level ownership.
 *
 * @example
 * ```ts
 * const dirOwnership = computeDirOwnership(fileOwnership)
 * console.log(dirOwnership[0].primaryOwner)
 * ```
 */
export function computeDirOwnership(
  fileOwnership: FileOwnership[],
): DirOwnership[] {
  const dirMap = new Map<
    string,
    { authorLines: Map<string, number>; files: Set<string>; totalLines: number }
  >()

  for (const fo of fileOwnership) {
    const dir = fo.file.includes('/') ? fo.file.slice(0, fo.file.lastIndexOf('/')) : '.'
    if (!dirMap.has(dir)) {
      dirMap.set(dir, { authorLines: new Map(), files: new Set(), totalLines: 0 })
    }

    const entry = dirMap.get(dir)!
    entry.files.add(fo.file)
    entry.totalLines += fo.lines

    for (const owner of fo.owners) {
      const ownerLines = Math.round((owner.percentage / 100) * fo.lines)
      entry.authorLines.set(owner.name, (entry.authorLines.get(owner.name) ?? 0) + ownerLines)
    }
  }

  const results: DirOwnership[] = []

  for (const [dir, data] of dirMap) {
    const owners: FileOwnerShare[] = []
    for (const [name, lines] of data.authorLines) {
      owners.push({
        name,
        percentage: data.totalLines > 0 ? Math.round((lines / data.totalLines) * 100) : 0,
      })
    }

    owners.sort((a, b) => b.percentage - a.percentage)

    results.push({
      dir,
      files: data.files.size,
      lines: data.totalLines,
      owners,
      primaryOwner: owners[0]?.name ?? '',
    })
  }

  results.sort((a, b) => a.dir.localeCompare(b.dir))
  return results
}

// ─── Owner stats ──────────────────────────────────────────

/**
 * Compute per-owner statistics from file and directory ownership.
 *
 * @example
 * ```ts
 * const owners = computeOwnerStats(fileOwnership, dirOwnership)
 * console.log(owners[0].name, owners[0].percentage)
 * ```
 */
export function computeOwnerStats(
  fileOwnership: FileOwnership[],
  _dirOwnership: DirOwnership[],
): OwnerInfo[] {
  const ownerMap = new Map<
    string,
    { commits: Set<string>; files: Set<string>; lines: number }
  >()

  let totalLines = 0
  for (const fo of fileOwnership) {
    totalLines += fo.lines
    for (const owner of fo.owners) {
      const ownerLines = Math.round((owner.percentage / 100) * fo.lines)
      if (!ownerMap.has(owner.name)) {
        ownerMap.set(owner.name, { commits: new Set(), files: new Set(), lines: 0 })
      }
      const entry = ownerMap.get(owner.name)!
      entry.lines += ownerLines
      entry.files.add(fo.file)
    }
  }

  const results: OwnerInfo[] = []
  for (const [name, data] of ownerMap) {
    results.push({
      commits: data.commits.size,
      email: '',
      filesOwned: data.files.size,
      linesOwned: data.lines,
      name,
      percentage: totalLines > 0 ? Math.round((data.lines / totalLines) * 100) : 0,
    })
  }

  results.sort((a, b) => b.percentage - a.percentage)
  return results
}

// ─── Bus factor ───────────────────────────────────────────

/**
 * Compute bus factor: minimum number of owners covering >= 50% of lines.
 *
 * @example
 * ```ts
 * const busFactor = computeBusFactor(owners)
 * console.log(busFactor) // 1 = risky, 5+ = healthy
 * ```
 */
export function computeBusFactor(owners: OwnerInfo[]): number {
  if (owners.length === 0) return 0

  let cumulative = 0
  let count = 0

  for (const owner of owners) {
    cumulative += owner.percentage
    count++
    if (cumulative >= 50) return count
  }

  return count
}

// ─── Knowledge monopolies ─────────────────────────────────

/**
 * Find files owned >80% by a single person.
 *
 * @example
 * ```ts
 * const monopolies = findKnowledgeMonopolies(fileOwnership)
 * console.log(monopolies) // ['src/core.ts (Alice: 95%)']
 * ```
 */
export function findKnowledgeMonopolies(
  fileOwnership: FileOwnership[],
): string[] {
  const monopolies: string[] = []

  for (const fo of fileOwnership) {
    if (fo.owners.length === 0) continue
    const top = fo.owners[0]
    if ((top?.percentage ?? 0) >= 80) {
      monopolies.push(`${fo.file} (${top?.name}: ${top?.percentage}%)`)
    }
  }

  return monopolies
}

// ─── Build ownership result ───────────────────────────────

/**
 * Orchestrate full ownership analysis using git blame.
 *
 * @example
 * ```ts
 * const result = await buildOwnershipResult(cwd, options)
 * console.log(result.busFactor)
 * ```
 */
export async function buildOwnershipResult(
  cwd: string,
  options: OwnershipOptions,
): Promise<OwnershipResult> {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const execFileAsync = promisify(execFile)

  let blameOutput = ''
  try {
    const args = ['blame', '--line-porcelain']
    if (options.ignorePatterns.length > 0) {
      for (const pattern of options.ignorePatterns) {
        args.push('--ignore-revs-file', pattern)
      }
    }
    args.push('--', '.')
    const { stdout } = await execFileAsync('git', args, {
      cwd,
      maxBuffer: 50 * 1024 * 1024,
    })
    blameOutput = stdout
  } catch {
    // Not a git repo or git not available — return empty result
    return {
      busFactor: 0,
      dirs: [],
      files: [],
      knowledgeMonopolies: [],
      owners: [],
    }
  }

  const blameData = parseGitBlame(blameOutput)
  const files = computeFileOwnership(blameData)
  const dirs = computeDirOwnership(files)
  const owners = computeOwnerStats(files, dirs)
  const busFactor = computeBusFactor(owners)
  const knowledgeMonopolies = findKnowledgeMonopolies(files)

  return {
    busFactor,
    dirs,
    files,
    knowledgeMonopolies,
    owners,
  }
}
