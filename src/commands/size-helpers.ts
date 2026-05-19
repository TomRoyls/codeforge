// ─── Interfaces ──────────────────────────────────────────

export interface SizeEntry {
  name: string
  size: number
  files: number
  percentage: number
}

export interface SizeResult {
  entries: SizeEntry[]
  totalSize: number
  totalFiles: number
  groupBy: string
}

export interface FileSizeInfo {
  path: string
  absolutePath: string
  size: number
}

// ─── Grouping ────────────────────────────────────────────

/**
 * @example
 * groupByDirectory([{ path: 'src/utils/helper.ts', size: 100 }])
 * // => [{ name: 'src/utils', size: 100, files: 1, percentage: 0 }]
 */
export function groupByDirectory(files: FileSizeInfo[]): SizeEntry[] {
  const map = new Map<string, { size: number; files: number }>()

  for (const file of files) {
    const lastSlash = file.path.lastIndexOf('/')
    const dir = lastSlash === -1 ? '.' : file.path.slice(0, lastSlash)

    const existing = map.get(dir)
    if (existing) {
      existing.size += file.size
      existing.files += 1
    } else {
      map.set(dir, { files: 1, size: file.size })
    }
  }

  const entries: SizeEntry[] = Array.from(map.entries()).map(([name, data]) => ({
    files: data.files,
    name,
    percentage: 0,
    size: data.size,
  }))

  entries.sort((a, b) => b.size - a.size)
  return entries
}

/**
 * @example
 * groupByExtension([{ path: 'src/helper.ts', size: 100 }])
 * // => [{ name: '.ts', size: 100, files: 1, percentage: 0 }]
 */
export function groupByExtension(files: FileSizeInfo[]): SizeEntry[] {
  const map = new Map<string, { size: number; files: number }>()

  for (const file of files) {
    const lastDot = file.path.lastIndexOf('.')
    const lastSlash = file.path.lastIndexOf('/')
    const ext = lastDot > lastSlash ? file.path.slice(lastDot).toLowerCase() : '(none)'

    const existing = map.get(ext)
    if (existing) {
      existing.size += file.size
      existing.files += 1
    } else {
      map.set(ext, { files: 1, size: file.size })
    }
  }

  const entries: SizeEntry[] = Array.from(map.entries()).map(([name, data]) => ({
    files: data.files,
    name,
    percentage: 0,
    size: data.size,
  }))

  entries.sort((a, b) => b.size - a.size)
  return entries
}

/**
 * @example
 * groupByFile([{ path: 'src/helper.ts', size: 100 }])
 * // => [{ name: 'src/helper.ts', size: 100, files: 1, percentage: 0 }]
 */
export function groupByFile(files: FileSizeInfo[]): SizeEntry[] {
  const entries: SizeEntry[] = files.map((file) => ({
    files: 1,
    name: file.path,
    percentage: 0,
    size: file.size,
  }))

  entries.sort((a, b) => b.size - a.size)
  return entries
}

// ─── Percentages ─────────────────────────────────────────

/**
 * @example
 * calculatePercentages([{ name: 'a', size: 75, files: 1, percentage: 0 }], 100)
 * // => [{ name: 'a', size: 75, files: 1, percentage: 75 }]
 */
export function calculatePercentages(entries: SizeEntry[], totalSize: number): SizeEntry[] {
  if (totalSize === 0) {
    return entries.map((entry) => ({ ...entry, percentage: 0 }))
  }

  return entries.map((entry) => ({
    ...entry,
    percentage: Math.round((entry.size / totalSize) * 1000) / 10,
  }))
}

// ─── Formatting utilities ────────────────────────────────

/**
 * @example
 * formatBytes(500) // => '500.0 B'
 * formatBytes(1536) // => '1.5 KB'
 * formatBytes(1048576) // => '1.0 MB'
 * formatBytes(1073741824) // => '1.0 GB'
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0.0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const divisor = 1024
  let unitIndex = 0

  let size = bytes
  while (size >= divisor && unitIndex < units.length - 1) {
    size /= divisor
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * @example
 * renderBarChart(50, 20) // => '█████████░░░░░░░░░░░'  (10 filled, 10 empty)
 * renderBarChart(100, 20) // => '████████████████████' (20 filled)
 * renderBarChart(0, 20) // => '░░░░░░░░░░░░░░░░░░░░' (20 empty)
 */
export function renderBarChart(percentage: number, width: number = 20): string {
  const filled = Math.min(width, Math.max(0, Math.round((percentage / 100) * width)))
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}
