// ─── Interfaces ──────────────────────────────────────────

export interface FileInfo {
  relativePath: string
  size: number
  lines: number
  hash: string
}

export interface DirContent {
  path: string
  files: Map<string, FileInfo>
  totalFiles: number
  totalSize: number
  totalLines: number
}

export interface FileDiff {
  relativePath: string
  status: 'added' | 'modified' | 'removed' | 'same'
  sizeDiff: number
  linesDiff: number
  dir1Size: number
  dir2Size: number
  dir1Lines: number
  dir2Lines: number
}

export interface ComparisonStats {
  totalFilesDir1: number
  totalFilesDir2: number
  uniqueToDir1: number
  uniqueToDir2: number
  common: number
  modified: number
  identical: number
  addedLines: number
  removedLines: number
  sizeDifference: number
}

export interface DirComparison {
  dir1: DirContent
  dir2: DirContent
  onlyInDir1: string[]
  onlyInDir2: string[]
  common: string[]
  modified: FileDiff[]
  sameCount: number
  similarity: number
  stats: ComparisonStats
}

export interface CompareOptions {
  ignorePatterns: string[]
  extensions: string[] | null
}

// ─── Hash computation ──────────────────────────────────────

/**
 * Compute a simple hash from string content.
 *
 * Uses a basic algorithm: sum of char codes multiplied by position.
 *
 * @example
 * ```ts
 * computeHash('hello') // returns a hex-like string
 * computeHash('hello') // same input → same output
 * computeHash('world') // different input → different output
 * ```
 */
export function computeHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    hash = (hash * 31 + content.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

// ─── Directory scanning ────────────────────────────────────

/**
 * Scan a directory and collect file information.
 *
 * @example
 * ```ts
 * const content = await scanDirectory('./src', [], null)
 * console.log(content.totalFiles)
 * ```
 */
export async function scanDirectory(
  dirPath: string,
  ignorePatterns: string[],
  extensions: string[] | null,
): Promise<DirContent> {
  const { glob } = await import('fast-glob')
  const fs = await import('node:fs/promises')
  const { resolve, extname } = await import('node:path')

  const resolvedPath = resolve(dirPath)
  const defaultIgnore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.git/**',
  ]
  const ignore = [...defaultIgnore, ...ignorePatterns]

  const allPatterns = ['**/*']
  const entries = await glob(allPatterns, {
    cwd: resolvedPath,
    ignore,
    onlyFiles: true,
    absolute: true,
    dot: false,
  })

  const filteredEntries = extensions
    ? entries.filter((entry) => {
        const ext = extname(entry as string).toLowerCase()
        return extensions.includes(ext)
      })
    : entries

  const files = new Map<string, FileInfo>()
  let totalSize = 0
  let totalLines = 0

  for (const entry of filteredEntries) {
    const absolutePath = entry as string
    const relativePath = absolutePath.slice(resolvedPath.length + 1)

    try {
      const stat = await fs.stat(absolutePath)
      const content = await fs.readFile(absolutePath, 'utf8')
      const lines = content.split('\n').length
      const hash = computeHash(content)

      const info: FileInfo = {
        relativePath,
        size: stat.size,
        lines,
        hash,
      }

      files.set(relativePath, info)
      totalSize += stat.size
      totalLines += lines
    } catch {
      // Skip files that cannot be read
    }
  }

  return {
    files,
    path: resolvedPath,
    totalFiles: files.size,
    totalLines,
    totalSize,
  }
}

// ─── Similarity ────────────────────────────────────────────

/**
 * Compute similarity score (0-100) based on identical common files.
 *
 * @example
 * ```ts
 * computeSimilarity(comparison) // 100 if all common files are identical
 * ```
 */
export function computeSimilarity(comparison: DirComparison): number {
  if (comparison.common.length === 0) return 0
  return Math.round((comparison.sameCount / comparison.common.length) * 100)
}

// ─── Stats computation ─────────────────────────────────────

/**
 * Compute aggregate comparison statistics.
 *
 * @example
 * ```ts
 * const stats = computeComparisonStats(comparison)
 * console.log(stats.modified)
 * ```
 */
export function computeComparisonStats(comparison: DirComparison): ComparisonStats {
  let addedLines = 0
  let removedLines = 0
  let sizeDifference = 0

  for (const diff of comparison.modified) {
    if (diff.linesDiff > 0) {
      addedLines += diff.linesDiff
    } else {
      removedLines += Math.abs(diff.linesDiff)
    }
    sizeDifference += Math.abs(diff.sizeDiff)
  }

  return {
    addedLines,
    common: comparison.common.length,
    identical: comparison.sameCount,
    modified: comparison.modified.length,
    removedLines,
    sizeDifference,
    totalFilesDir1: comparison.dir1.totalFiles,
    totalFilesDir2: comparison.dir2.totalFiles,
    uniqueToDir1: comparison.onlyInDir1.length,
    uniqueToDir2: comparison.onlyInDir2.length,
  }
}

// ─── Main comparison ──────────────────────────────────────

/**
 * Compare two directories and produce a full DirComparison result.
 *
 * @example
 * ```ts
 * const result = await compareDirectories('./src', './dist', { ignorePatterns: [], extensions: null })
 * console.log(result.similarity)
 * ```
 */
export async function compareDirectories(
  dir1: string,
  dir2: string,
  options: CompareOptions,
): Promise<DirComparison> {
  const [content1, content2] = await Promise.all([
    scanDirectory(dir1, options.ignorePatterns, options.extensions),
    scanDirectory(dir2, options.ignorePatterns, options.extensions),
  ])

  const keys1 = new Set(content1.files.keys())
  const keys2 = new Set(content2.files.keys())

  const onlyInDir1: string[] = []
  const onlyInDir2: string[] = []
  const common: string[] = []

  for (const key of keys1) {
    if (keys2.has(key)) {
      common.push(key)
    } else {
      onlyInDir1.push(key)
    }
  }

  for (const key of keys2) {
    if (!keys1.has(key)) {
      onlyInDir2.push(key)
    }
  }

  // Sort for deterministic output
  onlyInDir1.sort()
  onlyInDir2.sort()
  common.sort()

  const modified: FileDiff[] = []
  let sameCount = 0

  for (const relPath of common) {
    const f1 = content1.files.get(relPath)!
    const f2 = content2.files.get(relPath)!

    if (f1.hash === f2.hash && f1.size === f2.size && f1.lines === f2.lines) {
      sameCount++
    } else {
      modified.push({
        dir1Lines: f1.lines,
        dir1Size: f1.size,
        dir2Lines: f2.lines,
        dir2Size: f2.size,
        linesDiff: f2.lines - f1.lines,
        relativePath: relPath,
        sizeDiff: f2.size - f1.size,
        status: 'modified',
      })
    }
  }

  const comparison: DirComparison = {
    common,
    dir1: content1,
    dir2: content2,
    modified,
    onlyInDir1,
    onlyInDir2,
    sameCount,
    similarity: 0,
    stats: {
      addedLines: 0,
      common: common.length,
      identical: sameCount,
      modified: modified.length,
      removedLines: 0,
      sizeDifference: 0,
      totalFilesDir1: content1.totalFiles,
      totalFilesDir2: content2.totalFiles,
      uniqueToDir1: onlyInDir1.length,
      uniqueToDir2: onlyInDir2.length,
    },
  }

  comparison.similarity = computeSimilarity(comparison)
  comparison.stats = computeComparisonStats(comparison)

  return comparison
}
