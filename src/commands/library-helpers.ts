// ─── Types ─────────────────────────────────────────────────────────────────────

export type Genre = 'reference' | 'textbook' | 'novel' | 'encyclopedia' | 'manual' | 'journal' | 'pamphlet'
export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type Condition = 'mint' | 'good' | 'fair' | 'worn' | 'damaged'
export type CallNumberPrefix = 'CMD' | 'UTL' | 'COR' | 'TST' | 'TYP' | 'CFG' | 'FMT'

export interface CatalogEntry {
  file: string
  callNumber: string
  title: string
  genre: Genre
  readingLevel: ReadingLevel
  pages: number
  chapters: number
  citations: number
  citedBy: number
  available: boolean
  condition: Condition
  lastChecked: string
}

export interface Shelf {
  name: string
  callNumberPrefix: string
  entries: CatalogEntry[]
  genre: string
  totalPages: number
  avgCondition: string
  fillLevel: number
}

export interface Collection {
  name: string
  entries: CatalogEntry[]
  size: number
  avgReadingLevel: string
  completeness: number
}

export interface LibraryStats {
  totalEntries: number
  totalPages: number
  avgPages: number
  availableCount: number
  unavailableCount: number
  beginnerCount: number
  expertCount: number
  mintConditionCount: number
  damagedCount: number
  mostCited: string
  leastCited: string
  largestShelf: string
  collectionCount: number
  catalogCompleteness: number
  organizationScore: number
}

export interface LibraryResult {
  catalog: CatalogEntry[]
  shelves: Shelf[]
  collections: Collection[]
  stats: LibraryStats
  recommendations: string[]
}

export interface LibraryOptions {
  verbose?: boolean
}

// ─── Call Number Assignment ────────────────────────────────────────────────────

const prefixCounters: Record<CallNumberPrefix, number> = {
  CMD: 100,
  UTL: 200,
  COR: 300,
  TST: 400,
  TYP: 500,
  CFG: 600,
  FMT: 700,
}

/**
 * Determine call number prefix from file path and content.
 *
 * @example
 * determinePrefix('src/commands/foo.ts', 'export default class Foo')
 */
export function determinePrefix(file: string, content: string): CallNumberPrefix {
  if (file.includes('test/') || file.includes('.test.') || file.includes('.spec.')) return 'TST'
  if (file.includes('format-helpers') || file.includes('-format-helpers')) return 'FMT'
  if (content.includes('interface ') || (content.includes('type ') && content.includes('export type'))) return 'TYP'
  if (file.includes('config') || file.includes('Config')) return 'CFG'
  if (file.includes('commands/') || file.includes('command')) return 'CMD'
  if (file.includes('core/') || file.includes('core')) return 'COR'
  return 'UTL'
}

const assignedNumbers: Record<string, number> = {}

/**
 * Assign call number to a file.
 *
 * @example
 * assignCallNumber('src/commands/run.ts', 'export default class Run')
 */
export function assignCallNumber(file: string, content: string): string {
  const prefix = determinePrefix(file, content)
  const key = prefix
  if (!assignedNumbers[key]) assignedNumbers[key] = prefixCounters[prefix]
  assignedNumbers[key]++
  return `${prefix}.${String(assignedNumbers[key]).padStart(3, '0')}`
}

// ─── Genre Classification ──────────────────────────────────────────────────────

/**
 * Classify genre based on file characteristics.
 *
 * @example
 * classifyGenre('types.ts', 'export interface Foo {}', 1, 0)
 */
export function classifyGenre(file: string, content: string, exports: number, _imports: number): Genre {
  if (file.includes('test/') || file.includes('.test.') || file.includes('.spec.')) return 'journal'
  if (content.includes('interface ') || content.includes('export type ')) return 'reference'
  if (file.includes('commands/') && !file.includes('-helpers') && !file.includes('-format')) return 'manual'
  const lines = content.split('\n').length
  const functions = (content.match(/function\s+\w+|=>\s*[^;]+/g) || []).length
  if (lines > 200 && functions > 10) return 'encyclopedia'
  if (lines < 30 && exports <= 3) return 'pamphlet'
  const docLines = (content.match(/\/\*\*|\/\/\//g) || []).length
  if (docLines > 5) return 'textbook'
  return 'novel'
}

// ─── Reading Level ─────────────────────────────────────────────────────────────

/**
 * Compute reading level from content complexity.
 *
 * @example
 * computeReadingLevel('const x = 1')
 */
export function computeReadingLevel(content: string): ReadingLevel {
  if (!content || content.trim().length === 0) return 'beginner'

  const lines = content.split('\n')
  const hasGenerics = /<\w+[^>]*>/.test(content) && !/import\s*</.test(content.split('<')[0] + '<')
  const genericCount = (content.match(/<\w+/g) || []).length
  const nesting = computeMaxNesting(content)
  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b/g) || []).length
  const linesCount = lines.length

  let score = 0
  if (linesCount > 100) score += 2
  else if (linesCount > 30) score += 1

  if (nesting > 4) score += 3
  else if (nesting > 2) score += 2
  else if (nesting > 1) score += 1

  if (genericCount > 3) score += 2
  else if (hasGenerics) score += 1

  if (branches > 10) score += 2
  else if (branches > 4) score += 1

  if (score >= 6) return 'expert'
  if (score >= 4) return 'advanced'
  if (score >= 2) return 'intermediate'
  return 'beginner'
}

// ─── Condition ──────────────────────────────────────────────────────────────────

/**
 * Compute condition from documentation, complexity, and cleanliness.
 *
 * @example
 * computeCondition('export function foo() { return 1 }')
 */
export function computeCondition(content: string): Condition {
  if (!content || content.trim().length === 0) return 'damaged'

  const lines = content.split('\n').length
  const docComments = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const jsdocCount = (content.match(/@param|@returns|@example/g) || []).length
  const complexity = computeComplexity(content)
  const anyTypes = (content.match(/:\s*any\b/g) || []).length
  const tsIgnore = (content.match(/\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/g) || []).length

  const docRatio = lines > 0 ? (docComments + jsdocCount) / lines : 0

  let score = 50
  score += docRatio > 0.1 ? 30 : docRatio > 0.05 ? 20 : docRatio > 0 ? 10 : -10
  score += complexity < 10 ? 15 : complexity < 30 ? 5 : complexity < 60 ? -5 : -15
  score -= anyTypes * 5
  score -= tsIgnore * 10

  if (score >= 80) return 'mint'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  if (score >= 20) return 'worn'
  return 'damaged'
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute max nesting depth.
 *
 * @example
 * computeMaxNesting('{{{x}}}') // 3
 */
export function computeMaxNesting(content: string): number {
  let max = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > max) max = depth }
    else if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return max
}

/**
 * Compute complexity score.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeComplexity(content: string): number {
  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcatch\b/g) || []).length
  const functions = (content.match(/function\s+\w+|=>\s*[^;]+/g) || []).length
  const nesting = computeMaxNesting(content)
  return branches * 2 + functions + nesting * 3
}

/**
 * Extract imports from content.
 *
 * @example
 * extractImports("import { foo } from './bar'") // ['./bar']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const m of content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g) || []) {
    if (m[1]) imports.push(m[1])
  }
  for (const m of content.matchAll(/import\(['"](.+?)['"]\)/g) || []) {
    if (m[1]) imports.push(m[1])
  }
  return imports
}

/**
 * Count exports in content.
 *
 * @example
 * countExports('export const x = 1; export function y() {}') // 2
 */
export function countExports(content: string): number {
  return (content.match(/export\s+(function|class|const|let|var|interface|type|default|enum)\b/g) || []).length
}

/**
 * Resolve import path to known file.
 *
 * @example
 * resolveImportPath('./utils', new Set(['utils.ts'])) // 'utils.ts'
 */
export function resolveImportPath(importPath: string, knownFiles: Set<string>): string | null {
  const stripped = importPath.replace(/^\.\//, '')
  for (const ext of ['', '.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js']) {
    const candidate = stripped + ext
    if (knownFiles.has(candidate)) return candidate
  }
  return null
}

/**
 * Check if content has exports.
 *
 * @example
 * isAvailable('export const x = 1') // true
 */
export function isAvailable(content: string): boolean {
  return /export\s+(function|class|const|let|var|interface|type|default|enum)\b/.test(content)
}

/**
 * Count chapters (functions/methods) in content.
 *
 * @example
 * countChapters('function foo() {} function bar() {}') // 2
 */
export function countChapters(content: string): number {
  return (content.match(/function\s+\w+|=>\s*[^;]+|\b\w+\s*\([^)]*\)\s*\{/g) || []).length
}

// ─── Citations ──────────────────────────────────────────────────────────────────

/**
 * Compute citations (import count).
 *
 * @example
 * computeCitations("import { a } from './x'\nimport { b } from './y'") // 2
 */
export function computeCitations(content: string): number {
  return extractImports(content).length
}

/**
 * Compute citedBy (how many files import this one).
 *
 * @example
 * computeCitedBy('a.ts', ['a.ts', 'b.ts'], ["import { x } from './a'", "export const y = 1"])
 */
export function computeCitedBy(file: string, files: string[], contents: string[]): number {
  const knownSet = new Set(files)
  let count = 0
  for (let i = 0; i < files.length; i++) {
    if (files[i] === file) continue
    const content = contents[i] || ''
    const imports = extractImports(content)
    for (const imp of imports) {
      const resolved = resolveImportPath(imp, knownSet)
      if (resolved === file) count++
    }
  }
  return count
}

// ─── Shelf Grouping ────────────────────────────────────────────────────────────

/**
 * Group catalog entries into shelves by directory.
 *
 * @example
 * groupIntoShelves(catalog, ['src/a.ts', 'test/b.ts'])
 */
export function groupIntoShelves(catalog: CatalogEntry[], _files: string[]): Shelf[] {
  const dirGroups: Record<string, CatalogEntry[]> = {}
  const dirPrefixes: Record<string, string> = {}

  for (const entry of catalog) {
    const parts = entry.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!dirGroups[dir]) dirGroups[dir] = []
    dirGroups[dir].push(entry)
    dirPrefixes[dir] = entry.callNumber.split('.')[0] ?? ''
  }

  const shelves: Shelf[] = []

  for (const [dir, entries] of Object.entries(dirGroups)) {
    const totalPages = entries.reduce((s, e) => s + e.pages, 0)
    const conditions = entries.map((e) => conditionScore(e.condition))
    const avgCond = conditions.length > 0 ? conditions.reduce((a, b) => a + b, 0) / conditions.length : 50
    const fillLevel = Math.min(100, entries.length * 10)

    shelves.push({
      name: dir,
      callNumberPrefix: dirPrefixes[dir] ?? '',
      entries,
      genre: inferShelfGenre(entries),
      totalPages,
      avgCondition: scoreToCondition(avgCond),
      fillLevel,
    })
  }

  return shelves
}

function inferShelfGenre(entries: CatalogEntry[]): string {
  const genres = entries.map((e) => e.genre)
  if (genres.includes('manual')) return 'command reference'
  if (genres.includes('journal')) return 'test archives'
  if (genres.includes('reference')) return 'type reference'
  if (genres.includes('textbook')) return 'educational'
  return 'general'
}

function conditionScore(c: Condition): number {
  switch (c) {
    case 'mint': return 100
    case 'good': return 80
    case 'fair': return 60
    case 'worn': return 40
    case 'damaged': return 20
  }
}

function scoreToCondition(s: number): string {
  if (s >= 80) return 'mint'
  if (s >= 60) return 'good'
  if (s >= 40) return 'fair'
  if (s >= 20) return 'worn'
  return 'damaged'
}

/**
 * Compute fill level for a shelf.
 *
 * @example
 * computeFillLevel({ entries: Array(5).fill(entry) }) // 50
 */
export function computeFillLevel(entries: CatalogEntry[]): number {
  return Math.min(100, entries.length * 10)
}

// ─── Collection Grouping ───────────────────────────────────────────────────────

/**
 * Group catalog entries into collections by genre.
 *
 * @example
 * groupIntoCollections(catalog)
 */
export function groupIntoCollections(catalog: CatalogEntry[]): Collection[] {
  const genreGroups: Record<string, CatalogEntry[]> = {}

  for (const entry of catalog) {
    if (!genreGroups[entry.genre]) genreGroups[entry.genre] = []
    const group = genreGroups[entry.genre]
    if (group) group.push(entry)
  }

  const collections: Collection[] = []

  for (const [genre, entries] of Object.entries(genreGroups)) {
    const readingLevels = entries.map((e) => readingLevelScore(e.readingLevel))
    const avgRL = readingLevels.length > 0 ? readingLevels.reduce((a, b) => a + b, 0) / readingLevels.length : 0

    collections.push({
      name: genre,
      entries,
      size: entries.length,
      avgReadingLevel: scoreToReadingLevel(avgRL),
      completeness: computeCompleteness(entries),
    })
  }

  return collections
}

function readingLevelScore(r: ReadingLevel): number {
  switch (r) {
    case 'beginner': return 25
    case 'intermediate': return 50
    case 'advanced': return 75
    case 'expert': return 100
  }
}

function scoreToReadingLevel(s: number): string {
  if (s >= 75) return 'advanced'
  if (s >= 50) return 'intermediate'
  return 'beginner'
}

/**
 * Compute completeness of a collection.
 *
 * @example
 * computeCompleteness(entries) // 0-100
 */
export function computeCompleteness(entries: CatalogEntry[]): number {
  if (entries.length === 0) return 0
  const available = entries.filter((e) => e.available).length
  const documented = entries.filter((e) => e.condition === 'mint' || e.condition === 'good').length
  const availFactor = (available / entries.length) * 50
  const docFactor = (documented / entries.length) * 50
  return Math.round(availFactor + docFactor)
}

// ─── Catalog Completeness ──────────────────────────────────────────────────────

/**
 * Compute catalog completeness. 0-100.
 *
 * @example
 * computeCatalogCompleteness(catalog, allFiles)
 */
export function computeCatalogCompleteness(catalog: CatalogEntry[], allFiles: string[]): number {
  if (allFiles.length === 0) return 100
  const cataloged = new Set(catalog.map((e) => e.file))
  return Math.round((cataloged.size / allFiles.length) * 100)
}

// ─── Organization Score ────────────────────────────────────────────────────────

/**
 * Compute organization score based on shelf coherence. 0-100.
 *
 * @example
 * computeOrganizationScore(shelves)
 */
export function computeOrganizationScore(shelves: Shelf[]): number {
  if (shelves.length === 0) return 100

  let totalScore = 0
  for (const shelf of shelves) {
    const prefixes = new Set(shelf.entries.map((e) => e.callNumber.split('.')[0]))
    const coherence = prefixes.size === 1 ? 100 : prefixes.size <= 2 ? 70 : 40
    totalScore += coherence
  }

  return Math.round(totalScore / shelves.length)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate library recommendations.
 *
 * @example
 * generateLibraryRecommendations(catalog, shelves, collections, stats)
 */
export function generateLibraryRecommendations(
  catalog: CatalogEntry[],
  shelves: Shelf[],
  collections: Collection[],
  stats: LibraryStats,
): string[] {
  const recs: string[] = []

  const damaged = catalog.filter((e) => e.condition === 'damaged')
  if (damaged.length > 0) {
    recs.push(`${damaged.length} damaged entr${damaged.length === 1 ? 'y' : 'ies'} found — consider repair (add documentation, reduce complexity)`)
  }

  const worn = catalog.filter((e) => e.condition === 'worn')
  if (worn.length > 0) {
    recs.push(`${worn.length} worn entr${worn.length === 1 ? 'y' : 'ies'} — improve documentation and simplify logic`)
  }

  const unavailable = catalog.filter((e) => !e.available)
  if (unavailable.length > stats.totalEntries * 0.5 && stats.totalEntries > 0) {
    recs.push('More than half of entries are unavailable — consider adding exports to useful modules')
  }

  const overcrowded = shelves.filter((s) => s.fillLevel >= 90)
  if (overcrowded.length > 0) {
    recs.push(`${overcrowded.length} overcrowded shelf${overcrowded.length === 1 ? '' : 's'} — consider splitting into sub-directories`)
  }

  if (stats.catalogCompleteness < 80) {
    recs.push('Catalog completeness below 80% — some files may not be properly classified')
  }

  if (stats.organizationScore < 60) {
    recs.push('Organization score below 60% — directories may contain mixed file types')
  }

  const incompleteCollections = collections.filter((c) => c.completeness < 40)
  if (incompleteCollections.length > 0) {
    recs.push(`${incompleteCollections.length} collection${incompleteCollections.length === 1 ? '' : 's'} with low completeness — add documentation and exports`)
  }

  if (recs.length === 0) {
    recs.push('Library is well-curated — collection is organized, documented, and accessible')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete library result.
 *
 * @example
 * buildLibraryResult(['a.ts'], ['export const x = 1'], {})
 */
export function buildLibraryResult(files: string[], contents: string[], _options: LibraryOptions): LibraryResult {
  for (const key of Object.keys(assignedNumbers)) {
    delete assignedNumbers[key]
  }

  const catalog: CatalogEntry[] = files.map((file, i) => {
    const content = contents[i] || ''
    const callNumber = assignCallNumber(file, content)
    const title = inferTitle(file, content)
    const genre = classifyGenre(file, content, countExports(content), computeCitations(content))
    const readingLevel = computeReadingLevel(content)
    const pages = content.split('\n').length
    const chapters = countChapters(content)
    const citations = computeCitations(content)
    const citedBy = computeCitedBy(file, files, contents)
    const available = isAvailable(content)
    const condition = computeCondition(content)
    const lastChecked = new Date().toISOString().split('T')[0] ?? ''

    return { file, callNumber, title, genre, readingLevel, pages, chapters, citations, citedBy, available, condition, lastChecked }
  })

  const shelves = groupIntoShelves(catalog, files)
  const collections = groupIntoCollections(catalog)

  const totalPages = catalog.reduce((s, e) => s + e.pages, 0)
  const avgPages = catalog.length > 0 ? Math.round(totalPages / catalog.length) : 0
  const availableCount = catalog.filter((e) => e.available).length
  const beginnerCount = catalog.filter((e) => e.readingLevel === 'beginner').length
  const expertCount = catalog.filter((e) => e.readingLevel === 'expert').length
  const mintConditionCount = catalog.filter((e) => e.condition === 'mint').length
  const damagedCount = catalog.filter((e) => e.condition === 'damaged').length

  const sortedByCited = [...catalog].sort((a, b) => b.citedBy - a.citedBy)
  const largestShelf = shelves.length > 0 ? ([...shelves].sort((a, b) => b.entries.length - a.entries.length)[0]?.name ?? '') : ''
  const catalogCompleteness = computeCatalogCompleteness(catalog, files)
  const organizationScore = computeOrganizationScore(shelves)

  const stats: LibraryStats = {
    totalEntries: catalog.length,
    totalPages,
    avgPages,
    availableCount,
    unavailableCount: catalog.length - availableCount,
    beginnerCount,
    expertCount,
    mintConditionCount,
    damagedCount,
    mostCited: sortedByCited[0]?.file || '',
    leastCited: sortedByCited[sortedByCited.length - 1]?.file || '',
    largestShelf,
    collectionCount: collections.length,
    catalogCompleteness,
    organizationScore,
  }

  const recommendations = generateLibraryRecommendations(catalog, shelves, collections, stats)

  return { catalog, shelves, collections, stats, recommendations }
}

function inferTitle(file: string, content: string): string {
  const name = file.split('/').pop()?.replace(/\.\w+$/, '') || file
  const classMatch = content.match(/export\s+default\s+class\s+(\w+)/)
  if (classMatch) return classMatch[1] ?? name
  const funcMatch = content.match(/export\s+function\s+(\w+)/)
  if (funcMatch) return funcMatch[1] ?? name
  return name.replace(/[-_]/g, ' ')
}
