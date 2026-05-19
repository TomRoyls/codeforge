import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'

// ─── Interfaces ──────────────────────────────────────────

export interface SnapshotMetrics {
  totalFiles: number
  totalLines: number
  totalSize: number
  languages: { lang: string; files: number; lines: number }[]
  extensions: { ext: string; count: number }[]
  averageFileSize: number
  maxFileSize: number
  emptyFiles: number
  todos: number
  fixmes: number
  hacks: number
  exports: number
  functions: number
  classes: number
}

export interface FileHash {
  file: string
  hash: string
}

export interface Snapshot {
  name: string
  timestamp: string
  path: string
  metrics: SnapshotMetrics
  fileHashes: FileHash[]
}

export interface MetricChange {
  metric: string
  from: number
  to: number
  diff: number
  percentageChange: number
  direction: 'down' | 'unchanged' | 'up'
}

export interface SnapshotDiff {
  from: string
  to: string
  timestamp: string
  changes: MetricChange[]
  newFiles: string[]
  removedFiles: string[]
  modifiedFiles: string[]
  summary: string
}

export interface SnapshotListItem {
  name: string
  timestamp: string
  path: string
}

// ─── Language detection ─────────────────────────────────

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  '.css': 'CSS',
  '.go': 'Go',
  '.html': 'HTML',
  '.java': 'Java',
  '.js': 'JavaScript',
  '.json': 'JSON',
  '.jsx': 'JavaScript',
  '.md': 'Markdown',
  '.py': 'Python',
  '.rb': 'Ruby',
  '.rs': 'Rust',
  '.sh': 'Shell',
  '.sql': 'SQL',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
}

function detectLanguageFromExt(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  return EXTENSION_LANGUAGE_MAP[ext] ?? 'Unknown'
}

// ─── File hashing ───────────────────────────────────────

/**
 * Compute a simple hash from file size and first 100 characters.
 *
 * @example
 * ```ts
 * const hash = computeFileHash('hello world content here', 24)
 * // returns "24:hello world content here"
 * ```
 */
export function computeFileHash(content: string, size: number): string {
  const first100 = content.slice(0, 100)
  return `${size}:${first100}`
}

// ─── Content analysis ───────────────────────────────────

const TODO_REGEX = /\bTODO\b/gi
const FIXME_REGEX = /\bFIXME\b/gi
const HACK_REGEX = /\bHACK\b/gi
const EXPORT_REGEX = /\bexport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w|=>\s*\{|=>\s*[^=]/g
const CLASS_REGEX = /\bclass\s+\w/g

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

// ─── generateSnapshotName ───────────────────────────────

/**
 * Generate a timestamp-based snapshot name.
 *
 * @example
 * ```ts
 * const name = generateSnapshotName()
 * // returns "snapshot-2025-05-19-143025"
 * ```
 */
export function generateSnapshotName(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `snapshot-${year}-${month}-${day}-${hours}${minutes}${seconds}`
}

// ─── captureSnapshot ────────────────────────────────────

/**
 * Capture a point-in-time snapshot of codebase metrics.
 *
 * @example
 * ```ts
 * const snapshot = await captureSnapshot('./src', 'my-snapshot')
 * console.log(snapshot.metrics.totalFiles)
 * ```
 */
export async function captureSnapshot(targetPath: string, name: string): Promise<Snapshot> {
  const resolvedPath = resolve(targetPath)
  const timestamp = new Date().toISOString()

  const defaultIgnore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.git/**',
  ]

  const discoveredFiles = await discoverFiles({
    cwd: resolvedPath,
    ignore: defaultIgnore,
    patterns: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.json',
      '**/*.css',
      '**/*.html',
      '**/*.md',
      '**/*.py',
      '**/*.rs',
      '**/*.go',
      '**/*.java',
      '**/*.rb',
      '**/*.sh',
      '**/*.yaml',
      '**/*.yml',
      '**/*.xml',
      '**/*.sql',
    ],
  })

  let totalLines = 0
  let totalSize = 0
  let maxFileSize = 0
  let emptyFiles = 0
  let todos = 0
  let fixmes = 0
  let hacks = 0
  let exports = 0
  let functions = 0
  let classes = 0

  const languageMap = new Map<string, { files: number; lines: number }>()
  const extensionMap = new Map<string, number>()
  const fileHashes: FileHash[] = []

  for (const file of discoveredFiles) {
    const ext = extname(file.path).toLowerCase()
    const lang = detectLanguageFromExt(file.path)

    let content: string
    try {
      content = await fs.readFile(file.absolutePath, 'utf8')
    } catch {
      continue
    }

    const size = Buffer.byteLength(content, 'utf8')
    const lines = content.split('\n').length
    const lineCount = content.length === 0 ? 0 : lines

    totalLines += lineCount
    totalSize += size
    if (size > maxFileSize) maxFileSize = size
    if (content.length === 0) emptyFiles++

    // Language aggregation
    const langEntry = languageMap.get(lang)
    if (langEntry) {
      langEntry.files++
      langEntry.lines += lineCount
    } else {
      languageMap.set(lang, { files: 1, lines: lineCount })
    }

    // Extension aggregation
    const extCount = extensionMap.get(ext) ?? 0
    extensionMap.set(ext, extCount + 1)

    // Count TODOs, FIXMEs, HACKs
    todos += countMatches(content, TODO_REGEX)
    fixmes += countMatches(content, FIXME_REGEX)
    hacks += countMatches(content, HACK_REGEX)

    // Count exports, functions, classes
    exports += countMatches(content, EXPORT_REGEX)
    functions += countMatches(content, FUNCTION_REGEX)
    classes += countMatches(content, CLASS_REGEX)

    // File hash
    fileHashes.push({
      file: file.path,
      hash: computeFileHash(content, size),
    })
  }

  const totalFiles = discoveredFiles.length
  const averageFileSize = totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0

  const languagesList = Array.from(languageMap.entries()).map(([lang, data]) => ({
    lang,
    files: data.files,
    lines: data.lines,
  }))

  const extensionsList = Array.from(extensionMap.entries()).map(([ext, count]) => ({
    ext,
    count,
  }))

  const metrics: SnapshotMetrics = {
    averageFileSize,
    classes,
    emptyFiles,
    extensions: extensionsList,
    exports,
    fixmes,
    functions,
    hacks,
    languages: languagesList,
    maxFileSize,
    todos,
    totalFiles,
    totalLines,
    totalSize,
  }

  return {
    fileHashes,
    metrics,
    name,
    path: resolvedPath,
    timestamp,
  }
}

// ─── saveSnapshot ───────────────────────────────────────

/**
 * Save a snapshot to a JSON file.
 *
 * @example
 * ```ts
 * const filePath = await saveSnapshot(snapshot, '.codeforge/snapshots')
 * console.log(filePath) // ".codeforge/snapshots/my-snap.json"
 * ```
 */
export async function saveSnapshot(snapshot: Snapshot, dir: string): Promise<string> {
  const resolvedDir = resolve(dir)
  if (!existsSync(resolvedDir)) {
    mkdirSync(resolvedDir, { recursive: true })
  }

  const filePath = join(resolvedDir, `${snapshot.name}.json`)
  const json = JSON.stringify(snapshot, null, 2)
  writeFileSync(filePath, json, 'utf8')
  return filePath
}

// ─── loadSnapshot ───────────────────────────────────────

/**
 * Load a snapshot from a JSON file.
 *
 * @example
 * ```ts
 * const snapshot = await loadSnapshot('my-snap', '.codeforge/snapshots')
 * console.log(snapshot.name)
 * ```
 */
export async function loadSnapshot(name: string, dir: string): Promise<Snapshot> {
  const filePath = join(resolve(dir), `${name}.json`)

  if (!existsSync(filePath)) {
    throw new Error(`Snapshot not found: ${name}`)
  }

  const content = readFileSync(filePath, 'utf8')
  const parsed = JSON.parse(content) as Snapshot
  return parsed
}

// ─── listSnapshots ──────────────────────────────────────

/**
 * List all available snapshots in a directory.
 *
 * @example
 * ```ts
 * const snapshots = await listSnapshots('.codeforge/snapshots')
 * for (const snap of snapshots) {
 *   console.log(snap.name, snap.timestamp)
 * }
 * ```
 */
export async function listSnapshots(dir: string): Promise<SnapshotListItem[]> {
  const resolvedDir = resolve(dir)

  if (!existsSync(resolvedDir)) {
    return []
  }

  const entries = readdirSync(resolvedDir)
  const jsonFiles = entries.filter((e) => e.endsWith('.json'))

  const snapshots: SnapshotListItem[] = []

  for (const file of jsonFiles) {
    const filePath = join(resolvedDir, file)
    try {
      const content = readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(content) as Snapshot
      snapshots.push({
        name: parsed.name,
        path: parsed.path,
        timestamp: parsed.timestamp,
      })
    } catch {
      // Skip malformed files
    }
  }

  // Sort by timestamp descending (newest first)
  snapshots.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return snapshots
}

// ─── compareSnapshots ───────────────────────────────────

const NUMERIC_METRIC_KEYS: Array<keyof SnapshotMetrics> = [
  'totalFiles',
  'totalLines',
  'totalSize',
  'averageFileSize',
  'maxFileSize',
  'emptyFiles',
  'todos',
  'fixmes',
  'hacks',
  'exports',
  'functions',
  'classes',
]

/**
 * Compare two snapshots and compute the diff.
 *
 * @example
 * ```ts
 * const diff = compareSnapshots(snapshotA, snapshotB)
 * console.log(diff.summary)
 * ```
 */
export function compareSnapshots(from: Snapshot, to: Snapshot): SnapshotDiff {
  const changes: MetricChange[] = []

  for (const key of NUMERIC_METRIC_KEYS) {
    const fromVal = from.metrics[key]
    const toVal = to.metrics[key]
    const diff = toVal - fromVal
    const percentageChange = fromVal !== 0 ? (diff / fromVal) * 100 : 0
    let direction: MetricChange['direction']
    if (toVal > fromVal) {
      direction = 'up'
    } else if (toVal < fromVal) {
      direction = 'down'
    } else {
      direction = 'unchanged'
    }

    changes.push({
      diff,
      direction,
      from: fromVal,
      metric: key,
      percentageChange: Math.round(percentageChange * 100) / 100,
      to: toVal,
    })
  }

  // File changes
  const fromFiles = new Map(from.fileHashes.map((h) => [h.file, h.hash]))
  const toFiles = new Map(to.fileHashes.map((h) => [h.file, h.hash]))

  const newFiles: string[] = []
  const removedFiles: string[] = []
  const modifiedFiles: string[] = []

  for (const [file] of toFiles) {
    if (!fromFiles.has(file)) {
      newFiles.push(file)
    } else if (fromFiles.get(file) !== toFiles.get(file)) {
      modifiedFiles.push(file)
    }
  }

  for (const [file] of fromFiles) {
    if (!toFiles.has(file)) {
      removedFiles.push(file)
    }
  }

  // Summary
  const linesChange = changes.find((c) => c.metric === 'totalLines')
  const linesDiff = linesChange ? linesChange.diff : 0
  const linesPct = linesChange ? linesChange.percentageChange : 0
  const linesSign = linesDiff >= 0 ? '+' : ''
  const summary = `${newFiles.length} files added, ${removedFiles.length} removed, ${modifiedFiles.length} modified. Lines changed by ${linesDiff} (${linesSign}${linesPct}%).`

  return {
    changes,
    from: from.name,
    modifiedFiles,
    newFiles,
    removedFiles,
    summary,
    timestamp: new Date().toISOString(),
    to: to.name,
  }
}
