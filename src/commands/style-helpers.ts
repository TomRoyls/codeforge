// ─── Interfaces ──────────────────────────────────────────

export interface StyleChoice {
  indentation: 'tabs' | 'spaces-2' | 'spaces-4' | 'mixed' | 'unknown'
  quotes: 'single' | 'double' | 'backtick' | 'mixed' | 'unknown'
  semicolons: 'always' | 'never' | 'mixed' | 'unknown'
  trailingCommas: 'always' | 'never' | 'es5' | 'mixed' | 'unknown'
  braceStyle: 'same-line' | 'next-line' | 'mixed' | 'unknown'
}

export interface FileStyle {
  filePath: string
  style: StyleChoice
  linesAnalyzed: number
  maxLineLength: number
  avgLineLength: number
  longLines: number
  emptyLines: number
  consistency: number
}

export interface StyleConsistency {
  indentation: number
  quotes: number
  semicolons: number
  trailingCommas: number
  braceStyle: number
  lineLength: number
  overall: number
}

export interface StyleResult {
  files: FileStyle[]
  dominant: StyleChoice
  consistency: StyleConsistency
  totalFiles: number
  totalLines: number
  avgLineLength: number
  lineLengthViolations: number
  lineLengthViolationPercentage: number
}

// ─── Indentation detection ──────────────────────────────

/**
 * Detect indentation style from file content.
 *
 * @example
 * ```ts
 * detectIndentation('\tconst x = 1') // 'tabs'
 * detectIndentation('  const x = 1') // 'spaces-2'
 * detectIndentation('    const x = 1') // 'spaces-4'
 * ```
 */
export function detectIndentation(content: string): StyleChoice['indentation'] {
  // ─── Detect indentation style (tabs vs spaces) ───
  const lines = content.split('\n')
  let tabCount = 0
  const spaceLengths: number[] = []

  for (const line of lines) {
    if (line.length === 0) continue

    let leadingEnd = 0
    while (leadingEnd < line.length) {
      const ch = line.charCodeAt(leadingEnd)
      if (ch !== 9 && ch !== 32) break
      leadingEnd++
    }

    if (leadingEnd === 0) continue

    const leading = line.substring(0, leadingEnd)

    if (leading.indexOf('\t') >= 0) {
      tabCount++
    } else {
      spaceLengths.push(leading.length)
    }
  }

  if (tabCount === 0 && spaceLengths.length === 0) return 'unknown'
  if (spaceLengths.length === 0) return 'tabs'

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const minSpace = Math.min(...spaceLengths)
  const spaceUnit = spaceLengths.reduce((acc, len) => gcd(acc, len), minSpace)

  if (spaceUnit <= 2) {
    const total = tabCount + spaceLengths.length
    if (total > 0 && tabCount > 0) {
      const tabRatio = tabCount / total
      if (tabRatio >= 0.3 && tabRatio <= 0.7) return 'mixed'
      if (tabRatio > 0.7) return 'tabs'
    }
    return 'spaces-2'
  }

  if (spaceUnit <= 4) {
    const total = tabCount + spaceLengths.length
    if (total > 0 && tabCount > 0) {
      const tabRatio = tabCount / total
      if (tabRatio >= 0.3 && tabRatio <= 0.7) return 'mixed'
      if (tabRatio > 0.7) return 'tabs'
    }
    return 'spaces-4'
  }

  if (tabCount > 0) return 'mixed'
  return 'spaces-4'
}

// ─── Quote detection ────────────────────────────────────

/**
 * Strip comments from content for quote analysis.
 *
 * @example
 * ```ts
 * stripComments('const x = "hello" // comment') // 'const x = "hello" '
 * ```
 */
export function stripComments(content: string): string {
  // Remove block comments
  let result = content.replace(/\/\*[\s\S]*?\*\//g, '')
  // Remove line comments
  result = result.replace(/\/\/.*$/gm, '')
  return result
}

/**
 * Detect quote style from file content.
 *
 * @example
 * ```ts
 * detectQuotes("const x = 'hello'") // 'single'
 * detectQuotes('const x = "hello"') // 'double'
 * ```
 */
export function detectQuotes(content: string): StyleChoice['quotes'] {
  const code = stripComments(content)

  // Count quote occurrences (simple heuristic: count opening quotes in code context)
  let singleCount = 0
  let doubleCount = 0
  let backtickCount = 0

  // Match strings: single-quoted, double-quoted, backtick-quoted
  // Use a simple state machine approach
  let i = 0
  while (i < code.length) {
    const ch = code[i]

    if (ch === "'") {
      singleCount++
      i++
      // Skip to end of single-quoted string
      while (i < code.length && code[i] !== "'") {
        if (code[i] === '\\') i++ // skip escaped char
        i++
      }
      i++ // skip closing quote
    } else if (ch === '"') {
      doubleCount++
      i++
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') i++
        i++
      }
      i++
    } else if (ch === '`') {
      backtickCount++
      i++
      while (i < code.length && code[i] !== '`') {
        if (code[i] === '\\') i++
        i++
      }
      i++
    } else {
      i++
    }
  }

  const total = singleCount + doubleCount + backtickCount
  if (total === 0) return 'unknown'

  const max = Math.max(singleCount, doubleCount, backtickCount)
  const winners: string[] = []
  if (singleCount === max) winners.push('single')
  if (doubleCount === max) winners.push('double')
  if (backtickCount === max) winners.push('backtick')

  if (winners.length > 1) return 'mixed'

  const winner = winners[0]
  const ratio = max / total
  if (ratio < 0.6) return 'mixed'

  return winner as 'single' | 'double' | 'backtick'
}

// ─── Semicolon detection ────────────────────────────────

/**
 * Detect semicolon usage style from file content.
 *
 * @example
 * ```ts
 * detectSemicolons('const x = 1;\nconst y = 2;') // 'always'
 * detectSemicolons('const x = 1\nconst y = 2') // 'never'
 * ```
 */
export function detectSemicolons(content: string): StyleChoice['semicolons'] {
  const lines = content.split('\n')
  let semicolonLines = 0
  let candidateLines = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    // Skip comment-only lines
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    // Skip import/export lines
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) continue
    // Skip lines that are only braces/brackets
    if (/^[{}\[\](),;]\s*$/.test(trimmed)) continue
    // Skip preprocessor/pragma lines
    if (trimmed.startsWith('#')) continue
    // Skip decorator lines
    if (trimmed.startsWith('@')) continue
    // Skip block comment content
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) continue

    // Skip lines that naturally don't end with semicolons
    if (
      trimmed.startsWith('if') ||
      trimmed.startsWith('else') ||
      trimmed.startsWith('for') ||
      trimmed.startsWith('while') ||
      trimmed.startsWith('switch') ||
      trimmed.startsWith('function') ||
      trimmed.startsWith('class') ||
      trimmed.startsWith('try') ||
      trimmed.startsWith('catch') ||
      trimmed.startsWith('finally') ||
      trimmed.startsWith('interface ') ||
      trimmed.startsWith('type ') ||
      trimmed.startsWith('enum ') ||
      trimmed.startsWith('namespace ')
    ) {
      // But if it ends with a semicolon (single-line), count it
      if (trimmed.endsWith(';')) {
        semicolonLines++
        candidateLines++
      }
      continue
    }

    // This is a candidate line (could end with semicolon)
    candidateLines++

    if (trimmed.endsWith(';')) {
      semicolonLines++
    }
  }

  if (candidateLines === 0) return 'unknown'

  const ratio = semicolonLines / candidateLines
  if (ratio > 0.9) return 'always'
  if (ratio < 0.1) return 'never'
  return 'mixed'
}

// ─── Trailing comma detection ───────────────────────────

/**
 * Detect trailing comma usage from file content.
 *
 * @example
 * ```ts
 * detectTrailingCommas('const x = [1, 2, 3,]') // 'always'
 * detectTrailingCommas('const x = [1, 2, 3]') // 'never'
 * ```
 */
export function detectTrailingCommas(content: string): StyleChoice['trailingCommas'] {
  const lines = content.split('\n')
  let trailingCommaCount = 0
  let opportunities = 0

  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim()
    if (trimmed.length === 0) continue
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue

    // A trailing comma: line ends with , and next line starts with ], }, or )
    if (i + 1 < lines.length) {
      const nextTrimmed = (lines[i + 1] ?? '').trim()
      if (/,\s*$/.test(trimmed) && /^[}\])]/.test(nextTrimmed)) {
        trailingCommaCount++
      }
    }

    // Opportunities: closing bracket lines that could have had a trailing comma before
    if (/^[}\])]$/.test(trimmed) || /^[}\])]\s*[,;]\s*$/.test(trimmed)) {
      opportunities++
    }
  }

  if (opportunities === 0 && trailingCommaCount === 0) return 'unknown'

  const total = Math.max(opportunities, 1)
  const ratio = trailingCommaCount / total

  if (ratio > 0.7) return 'always'
  if (ratio < 0.3) return 'never'
  return 'mixed'
}

// ─── Brace style detection ──────────────────────────────

/**
 * Detect opening brace placement style from file content.
 *
 * @example
 * ```ts
 * detectBraceStyle('function foo() {\n  return 1\n}') // 'same-line'
 * detectBraceStyle('function foo()\n{\n  return 1\n}') // 'next-line'
 * ```
 */
export function detectBraceStyle(content: string): StyleChoice['braceStyle'] {
  const lines = content.split('\n')
  let sameLine = 0
  let nextLine = 0

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]

    // Same-line: `) {` or `else {` or `class Name {` or `function name() {`
    if (/\)\s*\{/.test(line ?? '') || /else\s*\{/.test(line ?? '') || /\bclass\s+\w+\s*\{/.test(line ?? '')) {
      sameLine++
    }

    // Next-line: line ends with `)` and next line starts with `{`
    if (idx + 1 < lines.length) {
      const trimmedCurrent = line?.trim()
      const trimmedNext = (lines[idx + 1] ?? '').trim()
      if (trimmedCurrent?.endsWith(')') && trimmedNext === '{') {
        nextLine++
      }
    }
  }

  const total = sameLine + nextLine
  if (total === 0) return 'unknown'

  const ratio = sameLine / total
  if (ratio > 0.6) return 'same-line'
  if (ratio < 0.4) return 'next-line'
  return 'mixed'
}

// ─── File analysis ──────────────────────────────────────

/**
 * Analyze a single file's style.
 *
 * @example
 * ```ts
 * const result = analyzeFileStyle('const x = 1;', 'index.ts')
 * // result.style.indentation === 'unknown'
 * // result.style.semicolons === 'always'
 * ```
 */
export function analyzeFileStyle(content: string, filePath: string): FileStyle {
  const lines = content.split('\n')
  const linesAnalyzed = lines.length
  let maxLineLength = 0
  let totalLength = 0
  let longLines = 0
  let emptyLines = 0

  for (const line of lines) {
    const len = line.length
    totalLength += len
    if (len > maxLineLength) maxLineLength = len
    if (len > 120) longLines++
    if (line.trim().length === 0) emptyLines++
  }

  const avgLineLength = linesAnalyzed > 0 ? totalLength / linesAnalyzed : 0

  const style: StyleChoice = {
    indentation: detectIndentation(content),
    quotes: detectQuotes(content),
    semicolons: detectSemicolons(content),
    trailingCommas: detectTrailingCommas(content),
    braceStyle: detectBraceStyle(content),
  }

  // Compute file-level consistency: how much this file follows its own dominant patterns
  const consistency = computeFileConsistency(style, content)

  return {
    avgLineLength,
    consistency,
    emptyLines,
    filePath,
    linesAnalyzed,
    longLines,
    maxLineLength,
    style,
  }
}

/**
 * Compute per-file consistency score (0-100).
 *
 * @example
 * ```ts
 * computeFileConsistency(style, content)
 * // 100 for perfectly consistent, lower for mixed
 * ```
 */
function computeFileConsistency(style: StyleChoice, _content: string): number {
  let score = 0
  let dimensions = 0

  const values: Array<StyleChoice[keyof StyleChoice]> = [
    style.indentation,
    style.quotes,
    style.semicolons,
    style.trailingCommas,
    style.braceStyle,
  ]

  for (const val of values) {
    if (val === 'unknown') continue
    dimensions++
    if (val !== 'mixed') {
      score += 100
    } else {
      score += 50
    }
  }

  return dimensions > 0 ? Math.round(score / dimensions) : 0
}

// ─── Dominant style computation ─────────────────────────

/**
 * Compute the dominant style across all analyzed files.
 *
 * @example
 * ```ts
 * const dominant = computeDominantStyle(files)
 * // dominant.indentation === 'tabs'
 * ```
 */
export function computeDominantStyle(files: FileStyle[]): StyleChoice {
  if (files.length === 0) {
    return {
      braceStyle: 'unknown',
      indentation: 'unknown',
      quotes: 'unknown',
      semicolons: 'unknown',
      trailingCommas: 'unknown',
    }
  }

  return {
    braceStyle: findMostCommon(files.map((f) => f.style.braceStyle)) as StyleChoice['braceStyle'],
    indentation: findMostCommon(files.map((f) => f.style.indentation)) as StyleChoice['indentation'],
    quotes: findMostCommon(files.map((f) => f.style.quotes)) as StyleChoice['quotes'],
    semicolons: findMostCommon(files.map((f) => f.style.semicolons)) as StyleChoice['semicolons'],
    trailingCommas: findMostCommon(files.map((f) => f.style.trailingCommas)) as StyleChoice['trailingCommas'],
  }
}

function findMostCommon(values: string[]): string {
  const counts = new Map<string, number>()
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }

  let maxCount = 0
  let result = 'unknown'

  for (const entry of Array.from(counts.entries())) {
    if (entry[1] > maxCount) {
      maxCount = entry[1]
      result = entry[0]
    }
  }

  return result
}

// ─── Consistency computation ────────────────────────────

/**
 * Compute style consistency scores across all files.
 *
 * @example
 * ```ts
 * const consistency = computeConsistency(files, dominant)
 * // consistency.overall === 85.7
 * ```
 */
export function computeConsistency(files: FileStyle[], dominant: StyleChoice): StyleConsistency {
  if (files.length === 0) {
    return {
      braceStyle: 0,
      indentation: 0,
      lineLength: 0,
      overall: 0,
      quotes: 0,
      semicolons: 0,
      trailingCommas: 0,
    }
  }

  const indentationScore = computeDimensionScore(files, (f) => f.style.indentation, dominant.indentation)
  const quotesScore = computeDimensionScore(files, (f) => f.style.quotes, dominant.quotes)
  const semicolonsScore = computeDimensionScore(files, (f) => f.style.semicolons, dominant.semicolons)
  const trailingCommasScore = computeDimensionScore(
    files,
    (f) => f.style.trailingCommas,
    dominant.trailingCommas,
  )
  const braceStyleScore = computeDimensionScore(files, (f) => f.style.braceStyle, dominant.braceStyle)

  // Line length: percentage of files with < 5% long line violations
  const lineLengthScore = computeLineLengthScore(files)

  const overall = Math.round(
    (indentationScore * 0.2 +
      quotesScore * 0.2 +
      semicolonsScore * 0.2 +
      trailingCommasScore * 0.1 +
      braceStyleScore * 0.15 +
      lineLengthScore * 0.15) ,
  )

  return {
    braceStyle: braceStyleScore,
    indentation: indentationScore,
    lineLength: lineLengthScore,
    overall,
    quotes: quotesScore,
    semicolons: semicolonsScore,
    trailingCommas: trailingCommasScore,
  }
}

function computeDimensionScore(
  files: FileStyle[],
  getter: (f: FileStyle) => string,
  dominantValue: string,
): number {
  if (dominantValue === 'unknown') return 100

  let matching = 0
  for (const f of files) {
    const val = getter(f)
    if (val === dominantValue) matching++
    else if (val === 'unknown') matching += 0.5 // unknown doesn't hurt
  }

  return Math.round((matching / files.length) * 100)
}

function computeLineLengthScore(files: FileStyle[]): number {
  let goodFiles = 0
  for (const f of files) {
    if (f.linesAnalyzed === 0) continue
    const violationRatio = f.longLines / f.linesAnalyzed
    if (violationRatio < 0.05) goodFiles++
  }

  const filesWithLines = files.filter((f) => f.linesAnalyzed > 0).length
  if (filesWithLines === 0) return 100

  return Math.round((goodFiles / filesWithLines) * 100)
}

// ─── Build result ───────────────────────────────────────

/**
 * Build the final style result from per-file analysis.
 *
 * @example
 * ```ts
 * const result = buildStyleResult(fileResults)
 * // result.totalFiles === 10
 * // result.consistency.overall === 85
 * ```
 */
export function buildStyleResult(fileResults: FileStyle[]): StyleResult {
  const dominant = computeDominantStyle(fileResults)
  const consistency = computeConsistency(fileResults, dominant)

  let totalLines = 0
  let totalLineLength = 0
  let lineLengthViolations = 0

  for (const f of fileResults) {
    totalLines += f.linesAnalyzed
    totalLineLength += f.avgLineLength * f.linesAnalyzed
    lineLengthViolations += f.longLines
  }

  const avgLineLength = totalLines > 0 ? Math.round((totalLineLength / totalLines) * 10) / 10 : 0
  const lineLengthViolationPercentage = totalLines > 0 ? Math.round((lineLengthViolations / totalLines) * 10000) / 100 : 0

  return {
    avgLineLength,
    consistency,
    dominant,
    files: fileResults,
    lineLengthViolationPercentage,
    lineLengthViolations,
    totalFiles: fileResults.length,
    totalLines,
  }
}
