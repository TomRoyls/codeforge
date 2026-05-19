// ─── Interfaces ──────────────────────────────────────────

export type PatternCategory = 'anti' | 'design' | 'idiom'

export interface DetectedPattern {
  name: string
  category: PatternCategory
  filePath: string
  line: number
  confidence: number
  description: string
  snippet: string
}

export interface PatternSummary {
  name: string
  category: PatternCategory
  count: number
  files: string[]
  avgConfidence: number
}

export interface PatternResult {
  patterns: DetectedPattern[]
  summary: PatternSummary[]
  totalPatterns: number
  byCategory: { category: string; count: number }[]
  designPatterns: number
  antiPatterns: number
  idioms: number
}

// ─── Helpers ─────────────────────────────────────────────

function getSnippet(line: string): string {
  const trimmed = line.trim()
  return trimmed.length > 80 ? trimmed.slice(0, 80) : trimmed
}

// ─── Singleton Detection ─────────────────────────────────

/**
 * Detects the Singleton design pattern.
 *
 * @example
 * ```ts
 * detectSingleton('class DB { private constructor() {} static instance: DB }', 'db.ts')
 * // => [{ name: 'Singleton', category: 'design', ... }]
 * ```
 */
export function detectSingleton(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1

    if (/static\s+instance\s*[=:]?/.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.9,
        description: 'Singleton pattern detected — static instance property',
        filePath,
        line: lnum,
        name: 'Singleton',
        snippet: getSnippet(line),
      })
    } else if (/static\s+getInstance\s*\(/.test(line) || /static\s+get\s+instance\s*\(/.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.8,
        description: 'Singleton pattern detected — static getInstance method',
        filePath,
        line: lnum,
        name: 'Singleton',
        snippet: getSnippet(line),
      })
    } else if (/private\s+constructor\s*\(/.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.7,
        description: 'Singleton pattern detected — private constructor',
        filePath,
        line: lnum,
        name: 'Singleton',
        snippet: getSnippet(line),
      })
    }
  }

  return results
}

// ─── Factory Detection ───────────────────────────────────

/**
 * Detects the Factory design pattern.
 *
 * @example
 * ```ts
 * detectFactory('function createUser() { return {} }', 'user.ts')
 * // => [{ name: 'Factory', category: 'design', ... }]
 * ```
 */
export function detectFactory(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1

    if (/function\s+create\w*\s*\(/.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.8,
        description: 'Factory pattern detected — create function',
        filePath,
        line: lnum,
        name: 'Factory',
        snippet: getSnippet(line),
      })
    } else if (/create\w*\s*:\s*\([^)]*\)\s*=>/.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.7,
        description: 'Factory pattern detected — arrow function factory',
        filePath,
        line: lnum,
        name: 'Factory',
        snippet: getSnippet(line),
      })
    } else if (/class\s+\w*Factory\w*/.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.6,
        description: 'Factory pattern detected — Factory class',
        filePath,
        line: lnum,
        name: 'Factory',
        snippet: getSnippet(line),
      })
    }
  }

  return results
}

// ─── Observer Detection ──────────────────────────────────

/**
 * Detects the Observer design pattern.
 *
 * @example
 * ```ts
 * detectObserver('emitter.on("event", handler)', 'events.ts')
 * // => [{ name: 'Observer', category: 'design', ... }]
 * ```
 */
export function detectObserver(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')
  const observerPattern =
    /\.(?:on|off|emit|addEventListener|removeEventListener|subscribe|unsubscribe)\s*\(/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1

    if (observerPattern.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.7,
        description: 'Observer pattern detected — event listener/subscription',
        filePath,
        line: lnum,
        name: 'Observer',
        snippet: getSnippet(line),
      })
    } else if (/\bEventEmitter\b/.test(line) || /\bObservable\b/.test(line)) {
      results.push({
        category: 'design',
        confidence: 0.7,
        description: 'Observer pattern detected — EventEmitter/Observable usage',
        filePath,
        line: lnum,
        name: 'Observer',
        snippet: getSnippet(line),
      })
    }
  }

  return results
}

// ─── Promise Chain Detection ─────────────────────────────

/**
 * Detects promise chain anti-pattern (3+ consecutive .then() calls).
 *
 * @example
 * ```ts
 * detectPromiseChain('fetch(url).then(r => r.json()).then(d => process(d)).then(v => save(v))', 'api.ts')
 * // => [{ name: 'Promise Chain', category: 'anti', ... }]
 * ```
 */
export function detectPromiseChain(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1
    const matches = line.match(/\.then\s*\(/g)
    if (matches && matches.length >= 3) {
      results.push({
        category: 'anti',
        confidence: 0.8,
        description: 'Promise chain detected — consider async/await',
        filePath,
        line: lnum,
        name: 'Promise Chain',
        snippet: getSnippet(line),
      })
    }
  }

  return results
}

// ─── Callback Hell Detection ─────────────────────────────

/**
 * Detects deep callback nesting (>3 levels).
 *
 * @example
 * ```ts
 * detectCallbackHell('fs.readFile(f, (err, d) => { fs.readFile(d, (err2, d2) => { ... }) })', 'files.ts')
 * // => [{ name: 'Callback Hell', category: 'anti', ... }]
 * ```
 */
export function detectCallbackHell(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  let callbackDepth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1

    const callbackOpens = (line.match(/(?:function\s*\([^)]*,\s*[^)]*\)|\([^)]*,\s*[^)]*\)\s*=>)/g) ?? [])
      .length

    callbackDepth += callbackOpens
    callbackDepth -= (line.match(/\}\s*[)\];,]/g) ?? []).length

    if (callbackDepth > 3 && callbackOpens > 0) {
      results.push({
        category: 'anti',
        confidence: 0.7,
        description: 'Deep callback nesting detected — consider async/await or Promises',
        filePath,
        line: lnum,
        name: 'Callback Hell',
        snippet: getSnippet(line),
      })
    }

    if (callbackDepth < 0) callbackDepth = 0
  }

  return results
}

// ─── God File Detection ─────────────────────────────────

/**
 * Detects god file anti-pattern (>20 exports or >500 lines).
 *
 * @example
 * ```ts
 * detectGodFile('export const a = 1\n... (600 lines)', 'big.ts')
 * // => [{ name: 'God File', category: 'anti', ... }]
 * ```
 */
export function detectGodFile(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')
  const lineCount = lines.length

  const exportCount = (content.match(/^export\s+/gm) ?? []).length

  if (exportCount > 20) {
    results.push({
      category: 'anti',
      confidence: 0.6,
      description: `Large file with many exports (${exportCount}) — consider splitting`,
      filePath,
      line: 1,
      name: 'God File',
      snippet: `File has ${exportCount} exports and ${lineCount} lines`,
    })
  } else if (lineCount > 500) {
    results.push({
      category: 'anti',
      confidence: 0.6,
      description: `Large file (${lineCount} lines) — consider splitting`,
      filePath,
      line: 1,
      name: 'God File',
      snippet: `File has ${lineCount} lines`,
    })
  }

  return results
}

// ─── Magic String Detection ──────────────────────────────

const COMMON_STRINGS = new Set([
  'utf-8',
  'utf8',
  'strict',
  'latin1',
  'ascii',
  'base64',
  'hex',
  'utf-16le',
  'binary',
  'true',
  'false',
  'null',
  'undefined',
  '0',
  '1',
  '',
])

/**
 * Detects repeated string literals (same string 3+ times).
 *
 * @example
 * ```ts
 * detectMagicString("const a = 'users'\nconst b = 'users'\nconst c = 'users'", 'api.ts')
 * // => [{ name: 'Magic String', category: 'anti', ... }]
 * ```
 */
export function detectMagicString(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  const stringCounts = new Map<string, { count: number; firstLine: number }>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const stringLiterals = line.match(/'([^']*)'|"([^"]*)"|`([^`]*)`/g) ?? []

    for (const literal of stringLiterals) {
      const value = literal.slice(1, -1)
      if (value.length <= 1) continue
      if (COMMON_STRINGS.has(value.toLowerCase())) continue

      const existing = stringCounts.get(value)
      if (existing) {
        existing.count++
      } else {
        stringCounts.set(value, { count: 1, firstLine: i + 1 })
      }
    }
  }

  for (const [value, info] of stringCounts) {
    if (info.count >= 3) {
      const confidence = value.length > 5 ? 0.7 : 0.5
      results.push({
        category: 'anti',
        confidence,
        description: `Repeated string literal ("${value}" x${info.count}) — extract to constant`,
        filePath,
        line: info.firstLine,
        name: 'Magic String',
        snippet: `"${value}" (appears ${info.count} times)`,
      })
    }
  }

  return results
}

// ─── Async Without Await Detection ───────────────────────

/**
 * Detects async functions that don't use await.
 *
 * @example
 * ```ts
 * detectAsyncWithoutAwait('async function getData() { return fetch(url) }', 'api.ts')
 * // => [{ name: 'Async Without Await', category: 'idiom', ... }]
 * ```
 */
export function detectAsyncWithoutAwait(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1

    const isAsync =
      /async\s+function\s+\w+/.test(line) ||
      /(?:const|let|var)\s+\w+\s*=\s*async\s*(?:function|\()/.test(line) ||
      /async\s*\([^)]*\)\s*=>/.test(line) ||
      /async\s*\(\)\s*=>/.test(line)

    if (isAsync && !line.includes('await')) {
      results.push({
        category: 'idiom',
        confidence: 0.8,
        description: 'Async function without await — may not need to be async',
        filePath,
        line: lnum,
        name: 'Async Without Await',
        snippet: getSnippet(line),
      })
    }
  }

  return results
}

// ─── Default Export Detection ────────────────────────────

/**
 * Detects default exports.
 *
 * @example
 * ```ts
 * detectDefaultExport('export default class Foo {}', 'foo.ts')
 * // => [{ name: 'Default Export', category: 'idiom', ... }]
 * ```
 */
export function detectDefaultExport(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1

    if (/export\s+default\s+/.test(line)) {
      results.push({
        category: 'idiom',
        confidence: 0.5,
        description: 'Default export found — named exports enable better refactoring',
        filePath,
        line: lnum,
        name: 'Default Export',
        snippet: getSnippet(line),
      })
    }
  }

  return results
}

// ─── Optional Chaining Detection ─────────────────────────

/**
 * Detects optional chaining usage.
 *
 * @example
 * ```ts
 * detectOptionalChaining('const name = user?.profile?.name', 'user.ts')
 * // => [{ name: 'Optional Chaining', category: 'idiom', ... }]
 * ```
 */
export function detectOptionalChaining(content: string, filePath: string): DetectedPattern[] {
  const results: DetectedPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lnum = i + 1

    if (/\?\.([^?])/g.test(line)) {
      results.push({
        category: 'idiom',
        confidence: 0.9,
        description: 'Modern optional chaining usage detected',
        filePath,
        line: lnum,
        name: 'Optional Chaining',
        snippet: getSnippet(line),
      })
    }
  }

  return results
}

// ─── File Analysis ───────────────────────────────────────

/**
 * Runs all pattern detectors on a single file.
 *
 * @example
 * ```ts
 * analyzeFile('class DB { private constructor() {} }', 'db.ts')
 * // => DetectedPattern[] from all detectors
 * ```
 */
export function analyzeFile(content: string, filePath: string): DetectedPattern[] {
  const allPatterns: DetectedPattern[] = []

  allPatterns.push(...detectSingleton(content, filePath))
  allPatterns.push(...detectFactory(content, filePath))
  allPatterns.push(...detectObserver(content, filePath))
  allPatterns.push(...detectPromiseChain(content, filePath))
  allPatterns.push(...detectCallbackHell(content, filePath))
  allPatterns.push(...detectGodFile(content, filePath))
  allPatterns.push(...detectMagicString(content, filePath))
  allPatterns.push(...detectAsyncWithoutAwait(content, filePath))
  allPatterns.push(...detectDefaultExport(content, filePath))
  allPatterns.push(...detectOptionalChaining(content, filePath))

  return allPatterns
}

// ─── Build Pattern Result ────────────────────────────────

/**
 * Aggregates detected patterns into a PatternResult.
 *
 * @example
 * ```ts
 * buildPatternResult(detectedPatterns, 'all')
 * // => PatternResult with summary, totals, byCategory
 * ```
 */
export function buildPatternResult(
  patterns: DetectedPattern[],
  typeFilter: 'all' | 'anti' | 'design' | 'idiom' = 'all',
): PatternResult {
  const filtered = typeFilter === 'all' ? patterns : patterns.filter((p) => p.category === typeFilter)

  const designPatterns = filtered.filter((p) => p.category === 'design').length
  const antiPatterns = filtered.filter((p) => p.category === 'anti').length
  const idioms = filtered.filter((p) => p.category === 'idiom').length

  // Build summary grouped by pattern name
  const summaryMap = new Map<string, PatternSummary>()
  for (const p of filtered) {
    const existing = summaryMap.get(p.name)
    if (existing) {
      existing.count++
      existing.avgConfidence = (existing.avgConfidence * (existing.count - 1) + p.confidence) / existing.count
      if (!existing.files.includes(p.filePath)) {
        existing.files.push(p.filePath)
      }
    } else {
      summaryMap.set(p.name, {
        avgConfidence: p.confidence,
        category: p.category,
        count: 1,
        files: [p.filePath],
        name: p.name,
      })
    }
  }

  const summary = Array.from(summaryMap.values())
  const byCategory = [
    { category: 'design', count: designPatterns },
    { category: 'anti', count: antiPatterns },
    { category: 'idiom', count: idioms },
  ]

  return {
    antiPatterns,
    byCategory,
    designPatterns,
    idioms,
    patterns: filtered,
    summary,
    totalPatterns: filtered.length,
  }
}
