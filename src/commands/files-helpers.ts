// ─── Interfaces ──────────────────────────────────────────

export interface FileInfo {
  path: string
  relativePath: string
  extension: string
  size: number
  modifiedTime: Date
  lineCount: number | null
  directory: string
}

export interface FileGroup {
  key: string
  files: FileInfo[]
  totalSize: number
  totalLines: number
}

export interface ExtensionBreakdown {
  ext: string
  count: number
  totalSize: number
}

export interface FilesResult {
  files: FileInfo[]
  groups: FileGroup[] | null
  totalFiles: number
  totalSize: number
  totalLines: number
  byExtension: ExtensionBreakdown[]
}

export interface FilterOptions {
  extensions?: string[]
  minSize?: number
  maxSize?: number
  modifiedAfter?: Date
  modifiedBefore?: Date
}

// ─── File metadata extraction ────────────────────────────

export interface FileSystemReader {
  statSync(filePath: string): { mtime: Date; size: number }
  readFileSync(filePath: string, encoding: string): string
}

export interface PathModule {
  dirname(p: string): string
  extname(p: string): string
  relative(from: string, to: string): string
}

const defaultFs: FileSystemReader = {
  readFileSync: (filePath: string, encoding: string) =>
    require('node:fs').readFileSync(filePath, encoding),
  statSync: (filePath: string) =>
    require('node:fs').statSync(filePath),
}

const defaultPath: PathModule = {
  dirname: (p: string) => require('node:path').dirname(p),
  extname: (p: string) => require('node:path').extname(p),
  relative: (from: string, to: string) => require('node:path').relative(from, to),
}

export function getFileInfo(
  filePath: string,
  basePath: string,
  countLines: boolean,
  fsReader: FileSystemReader = defaultFs,
  pathMod: PathModule = defaultPath,
): FileInfo {
  const fsStat = fsReader.statSync(filePath)
  const relativePath = pathMod.relative(basePath, filePath)
  const extension = pathMod.extname(filePath).toLowerCase()
  const directory = pathMod.dirname(relativePath)

  let lineCount: number | null = null
  if (countLines) {
    try {
      const content = fsReader.readFileSync(filePath, 'utf8')
      if (content.length === 0) {
        lineCount = 0
      } else {
        lineCount = content.split('\n').length
      }
    } catch {
      lineCount = null
    }
  }

  return {
    directory,
    extension,
    lineCount,
    modifiedTime: fsStat.mtime,
    path: filePath,
    relativePath,
    size: fsStat.size,
  }
}

// ─── Filtering ───────────────────────────────────────────

export function filterFiles(files: FileInfo[], options: FilterOptions): FileInfo[] {
  let result = files

  if (options.extensions && options.extensions.length > 0) {
    const extSet = new Set(options.extensions.map((e) => e.toLowerCase()))
    result = result.filter((f) => extSet.has(f.extension))
  }

  if (options.minSize !== undefined) {
    result = result.filter((f) => f.size >= options.minSize!)
  }

  if (options.maxSize !== undefined) {
    result = result.filter((f) => f.size <= options.maxSize!)
  }

  if (options.modifiedAfter !== undefined) {
    result = result.filter((f) => f.modifiedTime > options.modifiedAfter!)
  }

  if (options.modifiedBefore !== undefined) {
    result = result.filter((f) => f.modifiedTime < options.modifiedBefore!)
  }

  return result
}

// ─── Sorting ─────────────────────────────────────────────

export type SortBy = 'extension' | 'lines' | 'modified' | 'name' | 'size'
export type SortOrder = 'asc' | 'desc'

export function sortFiles(files: FileInfo[], sortBy: SortBy, sortOrder: SortOrder): FileInfo[] {
  const sorted = [...files]
  const multiplier = sortOrder === 'asc' ? 1 : -1

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.relativePath.localeCompare(b.relativePath)
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'modified':
        comparison = a.modifiedTime.getTime() - b.modifiedTime.getTime()
        break
      case 'extension':
        comparison = a.extension.localeCompare(b.extension) || a.relativePath.localeCompare(b.relativePath)
        break
      case 'lines': {
        if (a.lineCount === null && b.lineCount === null) {
          comparison = 0
        } else if (a.lineCount === null) {
          comparison = 1
        } else if (b.lineCount === null) {
          comparison = -1
        } else {
          comparison = a.lineCount - b.lineCount
        }
        break
      }
    }

    return comparison * multiplier
  })

  return sorted
}

// ─── Grouping ────────────────────────────────────────────

export type GroupBy = 'directory' | 'extension' | 'none'

export function groupFiles(files: FileInfo[], groupBy: GroupBy): FileGroup[] | null {
  if (groupBy === 'none') {
    return null
  }

  const map = new Map<string, FileInfo[]>()

  for (const file of files) {
    const key = groupBy === 'extension' ? file.extension : file.directory
    const existing = map.get(key)
    if (existing) {
      existing.push(file)
    } else {
      map.set(key, [file])
    }
  }

  const groups: FileGroup[] = []
  for (const [key, groupFiles] of map) {
    let totalSize = 0
    let totalLines = 0
    for (const file of groupFiles) {
      totalSize += file.size
      if (file.lineCount !== null) {
        totalLines += file.lineCount
      }
    }
    groups.push({ files: groupFiles, key, totalLines, totalSize })
  }

  // Sort groups alphabetically by key
  groups.sort((a, b) => a.key.localeCompare(b.key))

  return groups
}

// ─── Statistics ──────────────────────────────────────────

export function calculateFileStats(files: FileInfo[]): {
  totalFiles: number
  totalSize: number
  totalLines: number
  byExtension: ExtensionBreakdown[]
} {
  let totalSize = 0
  let totalLines = 0

  const extMap = new Map<string, { count: number; totalSize: number }>()

  for (const file of files) {
    totalSize += file.size
    if (file.lineCount !== null) {
      totalLines += file.lineCount
    }

    const existing = extMap.get(file.extension)
    if (existing) {
      existing.count++
      existing.totalSize += file.size
    } else {
      extMap.set(file.extension, { count: 1, totalSize: file.size })
    }
  }

  const byExtension: ExtensionBreakdown[] = Array.from(extMap.entries())
    .map(([ext, data]) => ({ count: data.count, ext, totalSize: data.totalSize }))
    .sort((a, b) => b.count - a.count)

  return { byExtension, totalFiles: files.length, totalLines, totalSize }
}
