// ─── Types ────────────────────────────────────────────────────────────────────

export interface Location {
  file: string
  line: number
  context: string
}

export interface ElementFrequency {
  element: string
  type: 'function-call' | 'method-call' | 'import' | 'return-type' | 'throw-type' | 'pattern' | 'keyword'
  frequency: number
  files: string[]
  locations: Location[]
  category: string
}

export interface FrequencyCategory {
  name: string
  elements: ElementFrequency[]
  totalOccurrences: number
  uniqueElements: number
  topElement: string
}

export interface FrequencyStats {
  totalElements: number
  totalOccurrences: number
  uniqueElements: number
  averageFrequency: number
  mostCommon: string
  leastCommon: string
  diversity: number
}

export interface FrequencyResult {
  categories: FrequencyCategory[]
  allElements: ElementFrequency[]
  stats: FrequencyStats
  topFrequencies: ElementFrequency[]
  singletons: ElementFrequency[]
  recommendations: string[]
}

export interface FrequencyOptions {
  top?: number
}

// ─── Known Patterns ───────────────────────────────────────────────────────────

const KNOWN_PATTERNS = [
  'Promise.all', 'Promise.resolve', 'Promise.reject', 'Promise.race',
  'Array.from', 'Array.isArray', 'Array.of',
  'Object.keys', 'Object.values', 'Object.entries', 'Object.assign', 'Object.freeze',
  'JSON.stringify', 'JSON.parse',
  'Math.max', 'Math.min', 'Math.floor', 'Math.ceil', 'Math.round', 'Math.abs',
  'String.raw', 'String.fromCharCode',
  'Map', 'Set', 'WeakMap', 'WeakSet',
]

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'new', 'class', 'extends', 'import', 'export',
  'from', 'default', 'typeof', 'instanceof', 'in', 'of', 'try', 'catch', 'finally',
  'throw', 'async', 'await', 'yield', 'void', 'delete', 'interface', 'type', 'enum',
  'abstract', 'implements', 'readonly', 'public', 'private', 'protected', 'static',
])

const TYPE_MAP: Record<string, string> = {
  'function-call': 'Functions',
  'method-call': 'Methods',
  'import': 'Imports',
  'return-type': 'Return Types',
  'throw-type': 'Throw Types',
  'pattern': 'Patterns',
  'keyword': 'Keywords',
}

// ─── extractFunctionCalls ─────────────────────────────────────────────────────

/**
 * Find function invocations: `identifier(`.
 *
 * @example
 * extractFunctionCalls('foo(1)', 'a.ts') // [ElementFrequency]
 */
export function extractFunctionCalls(content: string, filePath: string): ElementFrequency[] {
  const map = new Map<string, { count: number; locs: Location[] }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    const matches = line.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)
    for (const match of matches) {
      const name = match[1]!
      if (JS_KEYWORDS.has(name)) continue
      if (['if', 'for', 'while', 'switch', 'catch', 'new'].includes(name)) continue
      const entry = map.get(name) ?? { count: 0, locs: [] }
      entry.count++
      entry.locs.push({ file: filePath, line: i + 1, context: line.trim() })
      map.set(name, entry)
    }
  }

  return [...map.entries()].map(([element, data]) => ({
    element,
    type: 'function-call' as const,
    frequency: data.count,
    files: [filePath],
    locations: data.locs.slice(0, 10),
    category: TYPE_MAP['function-call'] ?? 'Functions',
  }))
}

// ─── extractMethodCalls ───────────────────────────────────────────────────────

/**
 * Find method calls: `.methodName(`.
 *
 * @example
 * extractMethodCalls('obj.method()', 'a.ts') // [ElementFrequency]
 */
export function extractMethodCalls(content: string, filePath: string): ElementFrequency[] {
  const map = new Map<string, { count: number; locs: Location[] }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    const matches = line.matchAll(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)
    for (const match of matches) {
      const name = match[1]!
      const entry = map.get(name) ?? { count: 0, locs: [] }
      entry.count++
      entry.locs.push({ file: filePath, line: i + 1, context: line.trim() })
      map.set(name, entry)
    }
  }

  return [...map.entries()].map(([element, data]) => ({
    element,
    type: 'method-call' as const,
    frequency: data.count,
    files: [filePath],
    locations: data.locs.slice(0, 10),
    category: TYPE_MAP['method-call'] ?? 'Methods',
  }))
}

// ─── extractImports ───────────────────────────────────────────────────────────

/**
 * Find import sources: `from 'module'`.
 *
 * @example
 * extractImports("import x from 'chalk'", 'a.ts') // [ElementFrequency]
 */
export function extractImports(content: string, filePath: string): ElementFrequency[] {
  const map = new Map<string, { count: number; locs: Location[] }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const matches = line.matchAll(/from\s+['"]([^'"]+)['"]/g)
    for (const match of matches) {
      const mod = match[1]!
      const entry = map.get(mod) ?? { count: 0, locs: [] }
      entry.count++
      entry.locs.push({ file: filePath, line: i + 1, context: line.trim() })
      map.set(mod, entry)
    }
  }

  return [...map.entries()].map(([element, data]) => ({
    element,
    type: 'import' as const,
    frequency: data.count,
    files: [filePath],
    locations: data.locs.slice(0, 10),
    category: TYPE_MAP['import'] ?? 'Imports',
  }))
}

// ─── extractReturnTypes ───────────────────────────────────────────────────────

/**
 * Find return type annotations after function signatures.
 *
 * @example
 * extractReturnTypes('function foo(): string {}', 'a.ts') // [ElementFrequency]
 */
export function extractReturnTypes(content: string, filePath: string): ElementFrequency[] {
  const map = new Map<string, { count: number; locs: Location[] }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const matches = line.matchAll(/\)\s*:\s*([A-Za-z][a-zA-Z0-9_$]*(?:<[^>]+>)?)/g)
    for (const match of matches) {
      const typeName = match[1]!.split('<')[0]!
      const entry = map.get(typeName) ?? { count: 0, locs: [] }
      entry.count++
      entry.locs.push({ file: filePath, line: i + 1, context: line.trim() })
      map.set(typeName, entry)
    }
  }

  return [...map.entries()].map(([element, data]) => ({
    element,
    type: 'return-type' as const,
    frequency: data.count,
    files: [filePath],
    locations: data.locs.slice(0, 10),
    category: TYPE_MAP['return-type'] ?? 'Return Types',
  }))
}

// ─── extractThrowTypes ────────────────────────────────────────────────────────

/**
 * Find `throw new Type(` patterns.
 *
 * @example
 * extractThrowTypes('throw new Error("msg")', 'a.ts') // [ElementFrequency]
 */
export function extractThrowTypes(content: string, filePath: string): ElementFrequency[] {
  const map = new Map<string, { count: number; locs: Location[] }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const matches = line.matchAll(/throw\s+new\s+([A-Z][a-zA-Z0-9_$]*)\s*\(/g)
    for (const match of matches) {
      const typeName = match[1]!
      const entry = map.get(typeName) ?? { count: 0, locs: [] }
      entry.count++
      entry.locs.push({ file: filePath, line: i + 1, context: line.trim() })
      map.set(typeName, entry)
    }
  }

  return [...map.entries()].map(([element, data]) => ({
    element,
    type: 'throw-type' as const,
    frequency: data.count,
    files: [filePath],
    locations: data.locs.slice(0, 10),
    category: TYPE_MAP['throw-type'] ?? 'Throw Types',
  }))
}

// ─── extractPatterns ──────────────────────────────────────────────────────────

/**
 * Find known patterns like Promise.all, Object.keys, etc.
 *
 * @example
 * extractPatterns('Promise.all([])', 'a.ts') // [ElementFrequency]
 */
export function extractPatterns(content: string, filePath: string): ElementFrequency[] {
  const map = new Map<string, { count: number; locs: Location[] }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    for (const pattern of KNOWN_PATTERNS) {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'g')
      const matches = line.matchAll(regex)
      for (const _match of matches) {
        const entry = map.get(pattern) ?? { count: 0, locs: [] }
        entry.count++
        entry.locs.push({ file: filePath, line: i + 1, context: line.trim() })
        map.set(pattern, entry)
      }
    }
  }

  return [...map.entries()].map(([element, data]) => ({
    element,
    type: 'pattern' as const,
    frequency: data.count,
    files: [filePath],
    locations: data.locs.slice(0, 10),
    category: TYPE_MAP['pattern'] ?? 'Patterns',
  }))
}

// ─── extractKeywords ──────────────────────────────────────────────────────────

/**
 * Find language keyword usage.
 *
 * @example
 * extractKeywords('const x = await foo()', 'a.ts') // [ElementFrequency]
 */
export function extractKeywords(content: string, filePath: string): ElementFrequency[] {
  const map = new Map<string, { count: number; locs: Location[] }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    const words = line.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g)
    for (const match of words) {
      const word = match[1]!
      if (JS_KEYWORDS.has(word)) {
        const entry = map.get(word) ?? { count: 0, locs: [] }
        entry.count++
        entry.locs.push({ file: filePath, line: i + 1, context: line.trim() })
        map.set(word, entry)
      }
    }
  }

  return [...map.entries()].map(([element, data]) => ({
    element,
    type: 'keyword' as const,
    frequency: data.count,
    files: [filePath],
    locations: data.locs.slice(0, 10),
    category: TYPE_MAP['keyword'] ?? 'Keywords',
  }))
}

// ─── countFrequencies ─────────────────────────────────────────────────────────

/**
 * Aggregate elements by name, merging across files.
 *
 * @example
 * countFrequencies(elements) // merged ElementFrequency[]
 */
export function countFrequencies(elements: ElementFrequency[]): ElementFrequency[] {
  const map = new Map<string, ElementFrequency>()

  for (const el of elements) {
    const key = `${el.type}:${el.element}`
    const existing = map.get(key)
    if (existing) {
      existing.frequency += el.frequency
      existing.files = [...new Set([...existing.files, ...el.files])]
      existing.locations = [...existing.locations, ...el.locations].slice(0, 20)
    } else {
      map.set(key, { ...el, files: [...el.files], locations: [...el.locations] })
    }
  }

  return [...map.values()]
}

// ─── categorize ───────────────────────────────────────────────────────────────

/**
 * Group elements by type into categories.
 *
 * @example
 * categorize(elements) // [FrequencyCategory, ...]
 */
export function categorize(elements: ElementFrequency[]): FrequencyCategory[] {
  const catMap = new Map<string, ElementFrequency[]>()

  for (const el of elements) {
    const cat = el.category
    if (!catMap.has(cat)) catMap.set(cat, [])
    catMap.get(cat)!.push(el)
  }

  const categories: FrequencyCategory[] = []
  for (const [name, els] of catMap) {
    const sorted = [...els].sort((a, b) => b.frequency - a.frequency)
    const totalOccurrences = sorted.reduce((s, e) => s + e.frequency, 0)
    categories.push({
      name,
      elements: sorted,
      totalOccurrences,
      uniqueElements: sorted.length,
      topElement: sorted[0]?.element ?? 'none',
    })
  }

  return categories.sort((a, b) => b.totalOccurrences - a.totalOccurrences)
}

// ─── findSingletons ───────────────────────────────────────────────────────────

/**
 * Find elements appearing only once.
 *
 * @example
 * findSingletons(elements) // elements with frequency === 1
 */
export function findSingletons(elements: ElementFrequency[]): ElementFrequency[] {
  return elements.filter((e) => e.frequency === 1)
}

// ─── computeStats ─────────────────────────────────────────────────────────────

/**
 * Compute aggregate statistics.
 *
 * @example
 * computeStats(elements) // FrequencyStats
 */
export function computeStats(elements: ElementFrequency[]): FrequencyStats {
  const totalElements = elements.length
  const totalOccurrences = elements.reduce((s, e) => s + e.frequency, 0)
  const uniqueElements = new Set(elements.map((e) => e.element)).size
  const averageFrequency = totalElements > 0 ? Math.round((totalOccurrences / totalElements) * 10) / 10 : 0

  const sorted = [...elements].sort((a, b) => b.frequency - a.frequency)
  const mostCommon = sorted[0]?.element ?? 'none'
  const leastCommon = sorted[sorted.length - 1]?.element ?? 'none'
  const diversity = totalOccurrences > 0 ? Math.round((uniqueElements / totalOccurrences) * 1000) / 1000 : 0

  return {
    totalElements,
    totalOccurrences,
    uniqueElements,
    averageFrequency,
    mostCommon,
    leastCommon,
    diversity,
  }
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate actionable recommendations from frequency analysis.
 *
 * @example
 * generateRecommendations(stats, singletons) // ['Extract repeated calls...']
 */
export function generateRecommendations(stats: FrequencyStats, singletons: ElementFrequency[]): string[] {
  const recs: string[] = []

  if (stats.diversity > 0.8) {
    recs.push('High code diversity — many unique elements. Consider if some one-off patterns should be standardized')
  }

  if (singletons.length > stats.totalElements * 0.5) {
    recs.push(`${singletons.length} elements appear only once — review for unused code or opportunities to consolidate`)
  }

  const funcSingletons = singletons.filter((s) => s.type === 'function-call')
  if (funcSingletons.length > 5) {
    recs.push(`${funcSingletons.length} function calls appear only once — check if some are dead code`)
  }

  if (stats.diversity < 0.3) {
    recs.push('Low diversity — code relies heavily on a small set of patterns. This can be good for consistency')
  }

  if (recs.length === 0) {
    recs.push('Code frequency distribution looks healthy.')
  }

  return recs
}

// ─── buildFrequencyResult ─────────────────────────────────────────────────────

/**
 * Orchestrate full frequency analysis.
 *
 * @example
 * buildFrequencyResult(files, contents, { top: 10 }) // FrequencyResult
 */
export function buildFrequencyResult(
  files: string[],
  contents: string[],
  options?: FrequencyOptions,
): FrequencyResult {
  const topCount = options?.top ?? 20
  const allRaw: ElementFrequency[] = []

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''
    allRaw.push(
      ...extractFunctionCalls(content, filePath),
      ...extractMethodCalls(content, filePath),
      ...extractImports(content, filePath),
      ...extractReturnTypes(content, filePath),
      ...extractThrowTypes(content, filePath),
      ...extractPatterns(content, filePath),
      ...extractKeywords(content, filePath),
    )
  }

  const allElements = countFrequencies(allRaw)
  const categories = categorize(allElements)
  const stats = computeStats(allElements)
  const topFrequencies = [...allElements].sort((a, b) => b.frequency - a.frequency).slice(0, topCount)
  const singletons = findSingletons(allElements)
  const recommendations = generateRecommendations(stats, singletons)

  return { categories, allElements, stats, topFrequencies, singletons, recommendations }
}
