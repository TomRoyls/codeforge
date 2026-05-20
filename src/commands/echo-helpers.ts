// ─── Types ────────────────────────────────────────────────────────────────────

export interface EchoOccurrence {
  file: string
  lineStart: number
  lineEnd: number
  code: string
  context: string
}

export interface Echo {
  id: string
  pattern: string
  occurrences: EchoOccurrence[]
  count: number
  similarity: number
  type: 'exact' | 'structural' | 'semantic'
  category: 'boilerplate' | 'error-handling' | 'validation' | 'configuration' | 'pattern'
  extractable: boolean
  estimatedSavings: number
}

export interface EchoStats {
  totalEchoes: number
  exactDuplicates: number
  structuralSimilarities: number
  totalRepetition: number
  estimatedSavings: number
  mostCommonEcho: string
  mostExpensiveEcho: string
  echoDensity: number
}

export interface EchoResult {
  echoes: Echo[]
  stats: EchoStats
  topEchoes: Echo[]
  recommendations: string[]
}

export interface EchoOptions {
  threshold?: number
  verbose?: boolean
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalize a code block for comparison.
 *
 * @example
 * normalizeBlock('const  x = 1;')
 */
export function normalizeBlock(code: string): string {
  return code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*'))
    .join('\n')
}

/**
 * Compute a simple hash for a string.
 *
 * @example
 * hashBlock('const x = 1;')
 */
export function hashBlock(code: string): number {
  let hash = 0
  const normalized = normalizeBlock(code)
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash
}

// ─── Sliding Window ───────────────────────────────────────────────────────────

/**
 * Extract all code blocks of windowSize lines from content.
 *
 * @example
 * extractBlocks('line1\nline2\nline3', 2, 'file.ts')
 */
export function extractBlocks(
  content: string,
  windowSize: number,
  file: string,
): Array<{ code: string; lineStart: number; lineEnd: number; context: string }> {
  const lines = content.split('\n')
  const blocks: Array<{ code: string; lineStart: number; lineEnd: number; context: string }> = []

  for (let i = 0; i <= lines.length - windowSize; i++) {
    const blockLines = lines.slice(i, i + windowSize)
    const code = blockLines.join('\n')
    const normalized = normalizeBlock(code)
    if (normalized.length === 0) continue

    const context = findContext(lines, i)
    blocks.push({
      code,
      lineStart: i + 1,
      lineEnd: i + windowSize,
      context,
    })
  }

  return blocks
}

function findContext(lines: string[], lineIndex: number): string {
  for (let i = lineIndex; i >= 0; i--) {
    const line = lines[i]!.trim()
    const funcMatch = line.match(/\bfunction\s+(\w+)/)
    if (funcMatch) return funcMatch[1]!
    const classMatch = line.match(/\bclass\s+(\w+)/)
    if (classMatch) return classMatch[1]!
    const methodMatch = line.match(/^\s*(?:async\s+)?(\w+)\s*\(/)
    if (methodMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(methodMatch[1]!)) {
      return methodMatch[1]!
    }
  }
  return '<module>'
}

// ─── Similarity ───────────────────────────────────────────────────────────────

/**
 * Compute similarity between two code blocks (0-100).
 *
 * @example
 * computeSimilarity('const x = 1;', 'const y = 2;')
 */
export function computeSimilarity(block1: string, block2: string): number {
  const norm1 = normalizeBlock(block1)
  const norm2 = normalizeBlock(block2)

  if (norm1 === norm2) return 100

  const lines1 = norm1.split('\n')
  const lines2 = norm2.split('\n')

  if (lines1.length === 0 && lines2.length === 0) return 100
  if (lines1.length === 0 || lines2.length === 0) return 0

  const struct1 = lines1.map((l) => structuralSkeleton(l))
  const struct2 = lines2.map((l) => structuralSkeleton(l))

  let matchingLines = 0
  const maxLen = Math.max(struct1.length, struct2.length)
  for (let i = 0; i < Math.min(struct1.length, struct2.length); i++) {
    if (struct1[i] === struct2[i]) {
      matchingLines++
    } else if (tokenOverlap(struct1[i]!, struct2[i]!) >= 0.5) {
      matchingLines += 0.5
    }
  }

  return Math.round((matchingLines / maxLen) * 100)
}

function structuralSkeleton(line: string): string {
  return line
    .replace(/\b[a-zA-Z_]\w*\b/g, 'X')
    .replace(/\b\d+(\.\d+)?\b/g, 'N')
    .replace(/"[^"]*"/g, '"S"')
    .replace(/'[^']*'/g, "'S'")
    .replace(/`[^`]*`/g, '`S`')
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(a.split(/\s+/))
  const tokensB = new Set(b.split(/\s+/))
  if (tokensA.size === 0 && tokensB.size === 0) return 1
  if (tokensA.size === 0 || tokensB.size === 0) return 0
  let overlap = 0
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++
  }
  return overlap / Math.max(tokensA.size, tokensB.size)
}

// ─── Classification ───────────────────────────────────────────────────────────

/**
 * Classify an echo pattern into a category.
 *
 * @example
 * classifyEcho('try { const x = ...')
 */
export function classifyEcho(pattern: string): Echo['category'] {
  const norm = normalizeBlock(pattern)

  if (/try\s*\{/.test(norm) || /catch\s*\(/.test(norm) || /throw\s+new\s+Error/.test(norm)) {
    return 'error-handling'
  }
  if (/if\s*\(!?\w/.test(norm) || /===\s*null|!==\s*null|typeof\s+\w+\s*===/.test(norm)) {
    return 'validation'
  }
  if (/=\s*\{/.test(norm) && /=\s*\[/.test(norm) === false && /import\s/.test(norm) === false) {
    return 'configuration'
  }
  if (/console\.log|console\.error|console\.warn/.test(norm)) {
    return 'boilerplate'
  }
  return 'pattern'
}

/**
 * Determine echo type based on similarity score.
 *
 * @example
 * classifyType(100)
 */
export function classifyType(similarity: number): Echo['type'] {
  if (similarity >= 100) return 'exact'
  if (similarity >= 70) return 'structural'
  return 'semantic'
}

// ─── Extractability ───────────────────────────────────────────────────────────

/**
 * Check if an echo is extractable to a shared utility.
 *
 * @example
 * isExtractable(echo)
 */
export function isExtractable(echo: Echo): boolean {
  if (echo.count < 2) return false
  if (echo.category === 'configuration') return true
  if (echo.category === 'error-handling' && echo.occurrences.length >= 2) return true
  if (echo.category === 'validation' && echo.occurrences.length >= 2) return true
  if (echo.category === 'boilerplate' && echo.occurrences.length >= 3) return true
  if (echo.type === 'exact' && echo.occurrences.length >= 2) return true
  if (echo.similarity >= 80 && echo.occurrences.length >= 3) return true
  return false
}

/**
 * Estimate lines saved by extracting an echo.
 *
 * @example
 * estimateSavings(echo)
 */
export function estimateSavings(echo: Echo): number {
  if (echo.occurrences.length === 0) return 0
  const linesPerOccurrence = echo.occurrences[0]!.code.split('\n').length
  return (echo.count - 1) * linesPerOccurrence
}

// ─── Pattern Detection ────────────────────────────────────────────────────────

/**
 * Find repeated patterns within a single file.
 *
 * @example
 * findRepeatedPatterns(content, 'file.ts')
 */
export function findRepeatedPatterns(content: string, file: string): Echo[] {
  const echoes: Echo[] = []

  const errorPattern = findErrorHandlingPatterns(content, file)
  echoes.push(...errorPattern)

  const validationPattern = findValidationPatterns(content, file)
  echoes.push(...validationPattern)

  const loggingPattern = findLoggingPatterns(content, file)
  echoes.push(...loggingPattern)

  return echoes
}

/**
 * Find error handling patterns.
 *
 * @example
 * findErrorHandlingPatterns(content, 'file.ts')
 */
export function findErrorHandlingPatterns(content: string, file: string): Echo[] {
  const echoes: Echo[] = []
  const lines = content.split('\n')

  const tryRegex = /\btry\s*\{/
  let tryCount = 0
  const tryPositions: number[] = []

  for (let i = 0; i < lines.length; i++) {
    if (tryRegex.test(lines[i]!)) {
      tryCount++
      tryPositions.push(i)
    }
  }

  if (tryCount >= 2) {
    const occurrences: EchoOccurrence[] = tryPositions.map((pos) => ({
      file,
      lineStart: pos + 1,
      lineEnd: Math.min(pos + 6, lines.length),
      code: lines.slice(pos, Math.min(pos + 6, lines.length)).join('\n'),
      context: findContext(lines, pos),
    }))

    echoes.push({
      id: `error-try-${file}`,
      pattern: 'try { ... } catch (e) { ... }',
      occurrences,
      count: tryCount,
      similarity: 75,
      type: 'structural',
      category: 'error-handling',
      extractable: tryCount >= 3,
      estimatedSavings: (tryCount - 1) * 5,
    })
  }

  return echoes
}

/**
 * Find validation patterns.
 *
 * @example
 * findValidationPatterns(content, 'file.ts')
 */
export function findValidationPatterns(content: string, file: string): Echo[] {
  const echoes: Echo[] = []
  const lines = content.split('\n')

  const guardRegex = /if\s*\(\s*!\s*\w+/
  let guardCount = 0
  const guardPositions: number[] = []

  for (let i = 0; i < lines.length; i++) {
    if (guardRegex.test(lines[i]!)) {
      guardCount++
      guardPositions.push(i)
    }
  }

  if (guardCount >= 2) {
    const occurrences: EchoOccurrence[] = guardPositions.map((pos) => ({
      file,
      lineStart: pos + 1,
      lineEnd: Math.min(pos + 3, lines.length),
      code: lines.slice(pos, Math.min(pos + 3, lines.length)).join('\n'),
      context: findContext(lines, pos),
    }))

    echoes.push({
      id: `validation-guard-${file}`,
      pattern: 'if (!x) { throw/return ... }',
      occurrences,
      count: guardCount,
      similarity: 70,
      type: 'structural',
      category: 'validation',
      extractable: guardCount >= 3,
      estimatedSavings: (guardCount - 1) * 2,
    })
  }

  return echoes
}

/**
 * Find logging patterns.
 *
 * @example
 * findLoggingPatterns(content, 'file.ts')
 */
export function findLoggingPatterns(content: string, file: string): Echo[] {
  const echoes: Echo[] = []
  const lines = content.split('\n')

  const logRegex = /console\.(log|error|warn|info)\s*\(/
  let logCount = 0
  const logPositions: number[] = []

  for (let i = 0; i < lines.length; i++) {
    if (logRegex.test(lines[i]!)) {
      logCount++
      logPositions.push(i)
    }
  }

  if (logCount >= 3) {
    const occurrences: EchoOccurrence[] = logPositions.map((pos) => ({
      file,
      lineStart: pos + 1,
      lineEnd: pos + 1,
      code: lines[pos]!.trim(),
      context: findContext(lines, pos),
    }))

    echoes.push({
      id: `logging-console-${file}`,
      pattern: 'console.log/warn/error(...)',
      occurrences,
      count: logCount,
      similarity: 60,
      type: 'semantic',
      category: 'boilerplate',
      extractable: logCount >= 5,
      estimatedSavings: Math.max(0, (logCount - 1) * 1),
    })
  }

  return echoes
}

// ─── Block Finding ────────────────────────────────────────────────────────────

/**
 * Find repeated code blocks across multiple files.
 *
 * @example
 * findRepeatedBlocks(files, contents, 3)
 */
export function findRepeatedBlocks(
  files: string[],
  contents: string[],
  threshold: number,
): Echo[] {
  const echoes: Echo[] = []
  const blockMap = new Map<number, Array<{ code: string; file: string; lineStart: number; lineEnd: number; context: string }>>()

  for (let f = 0; f < files.length; f++) {
    const file = files[f] ?? ''
    const content = contents[f] ?? ''

    for (let windowSize = 3; windowSize <= 8; windowSize++) {
      const blocks = extractBlocks(content, windowSize, file)

      for (const block of blocks) {
        const hash = hashBlock(block.code)
        const existing = blockMap.get(hash)
        if (existing) {
          const alreadyHasFile = existing.some((e) => e.file === file && e.lineStart === block.lineStart)
          if (!alreadyHasFile) {
            existing.push({ code: block.code, file, lineStart: block.lineStart, lineEnd: block.lineEnd, context: block.context })
          }
        } else {
          blockMap.set(hash, [{ code: block.code, file, lineStart: block.lineStart, lineEnd: block.lineEnd, context: block.context }])
        }
      }
    }
  }

  let echoId = 0
  for (const [, occurrences] of blockMap) {
    if (occurrences.length < threshold) continue

    const firstCode = occurrences[0]!.code
    const normalizedPattern = normalizeBlock(firstCode)
    if (normalizedPattern.length === 0) continue

    const similarity = 100
    const category = classifyEcho(firstCode)
    const type = classifyType(similarity)

    const echo: Echo = {
      id: `echo-${echoId++}`,
      pattern: truncatePattern(normalizedPattern),
      occurrences: occurrences.map((o) => ({
        file: o.file,
        lineStart: o.lineStart,
        lineEnd: o.lineEnd,
        code: o.code,
        context: o.context,
      })),
      count: occurrences.length,
      similarity,
      type,
      category,
      extractable: false,
      estimatedSavings: 0,
    }
    echo.extractable = isExtractable(echo)
    echo.estimatedSavings = estimateSavings(echo)

    echoes.push(echo)
  }

  return echoes
}

function truncatePattern(pattern: string): string {
  const lines = pattern.split('\n')
  if (lines.length <= 4) return pattern
  return lines.slice(0, 4).join('\n') + ' ...'
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute echo statistics.
 *
 * @example
 * computeEchoStats(echoes, totalLines)
 */
export function computeEchoStats(echoes: Echo[], totalLines: number): EchoStats {
  const exactDuplicates = echoes.filter((e) => e.type === 'exact').length
  const structuralSimilarities = echoes.filter((e) => e.type === 'structural' || e.type === 'semantic').length

  const totalRepetition = echoes.reduce((sum, e) => sum + e.occurrences.reduce((s, o) => s + o.code.split('\n').length, 0), 0)
  const estimatedSavings = echoes.reduce((sum, e) => sum + e.estimatedSavings, 0)

  const mostCommon = echoes.length > 0
    ? echoes.reduce((a, b) => a.count >= b.count ? a : b)
    : null

  const mostExpensive = echoes.length > 0
    ? echoes.reduce((a, b) => a.estimatedSavings >= b.estimatedSavings ? a : b)
    : null

  const echoDensity = totalLines > 0
    ? Math.round((totalRepetition / totalLines) * 100)
    : 0

  return {
    totalEchoes: echoes.length,
    exactDuplicates,
    structuralSimilarities,
    totalRepetition,
    estimatedSavings,
    mostCommonEcho: mostCommon?.pattern ?? '',
    mostExpensiveEcho: mostExpensive?.pattern ?? '',
    echoDensity,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations based on echo analysis.
 *
 * @example
 * generateEchoRecommendations(echoes, stats)
 */
export function generateEchoRecommendations(echoes: Echo[], stats: EchoStats): string[] {
  const recs: string[] = []

  if (stats.exactDuplicates > 0) {
    recs.push(`Found ${stats.exactDuplicates} exact duplicate(s) — extract into shared functions`)
  }

  if (stats.estimatedSavings > 0) {
    recs.push(`Estimated ${stats.estimatedSavings} lines could be saved by deduplication`)
  }

  const errorEchoes = echoes.filter((e) => e.category === 'error-handling' && e.extractable)
  if (errorEchoes.length > 0) {
    recs.push(`Create a shared error handling wrapper to eliminate ${errorEchoes.length} repeated pattern(s)`)
  }

  const validationEchoes = echoes.filter((e) => e.category === 'validation' && e.extractable)
  if (validationEchoes.length > 0) {
    recs.push(`Build a validation utility library to consolidate ${validationEchoes.length} repeated check(s)`)
  }

  const boilerplateEchoes = echoes.filter((e) => e.category === 'boilerplate' && e.extractable)
  if (boilerplateEchoes.length > 0) {
    recs.push(`Extract ${boilerplateEchoes.length} boilerplate pattern(s) into shared utilities`)
  }

  if (stats.echoDensity > 30) {
    recs.push(`High echo density (${stats.echoDensity}%) — significant code repetition detected`)
  }

  if (recs.length === 0) {
    recs.push('No significant code echoes detected — codebase looks clean')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete echo analysis result.
 *
 * @example
 * buildEchoResult(['a.ts'], ['const x = 1;'])
 */
export function buildEchoResult(
  files: string[],
  contents: string[],
  options?: EchoOptions,
): EchoResult {
  const threshold = options?.threshold ?? 3

  const blockEchoes = findRepeatedBlocks(files, contents, threshold)

  const patternEchoes: Echo[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const patterns = findRepeatedPatterns(content, file)
    patternEchoes.push(...patterns)
  }

  const allEchoes = mergeEchoes(blockEchoes, patternEchoes)

  const totalLines = contents.reduce((sum, c) => sum + c.split('\n').length, 0)
  const stats = computeEchoStats(allEchoes, totalLines)
  const recommendations = generateEchoRecommendations(allEchoes, stats)

  const topEchoes = [...allEchoes].sort((a, b) => b.estimatedSavings - a.estimatedSavings)

  return { echoes: allEchoes, stats, topEchoes, recommendations }
}

function mergeEchoes(blockEchoes: Echo[], patternEchoes: Echo[]): Echo[] {
  const seen = new Set<string>()
  const merged: Echo[] = []

  for (const echo of [...blockEchoes, ...patternEchoes]) {
    const key = `${echo.category}:${echo.pattern}:${echo.occurrences.map((o) => o.file).sort().join(',')}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(echo)
    }
  }

  return merged
}
