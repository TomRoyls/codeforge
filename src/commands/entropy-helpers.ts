// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Per-file entropy metrics.
 *
 * @example
 * const m: EntropyMetrics = { characterEntropy: 4.5, tokenEntropy: 6.2, lineLengthEntropy: 3.1, namingEntropy: 5.0, overallEntropy: 4.8, classification: 'normal' }
 */
export interface EntropyMetrics {
  characterEntropy: number
  tokenEntropy: number
  lineLengthEntropy: number
  namingEntropy: number
  overallEntropy: number
  classification: 'low' | 'normal' | 'high' | 'very-high'
}

/**
 * Per-file entropy analysis result.
 *
 * @example
 * const f: FileEntropy = { file: 'src/app.ts', metrics: m, lines: 100, size: 3000, anomalyScore: 0.1, isAnomalous: false, anomalyReason: null }
 */
export interface FileEntropy {
  file: string
  metrics: EntropyMetrics
  lines: number
  size: number
  anomalyScore: number
  isAnomalous: boolean
  anomalyReason: string | null
}

/**
 * Distribution of entropy across all files.
 *
 * @example
 * const d: EntropyDistribution = { averageCharacterEntropy: 4.5, averageTokenEntropy: 6.0, averageLineLengthEntropy: 3.0, averageNamingEntropy: 5.0, standardDeviation: 0.8, minEntropy: 2.1, maxEntropy: 6.8 }
 */
export interface EntropyDistribution {
  averageCharacterEntropy: number
  averageTokenEntropy: number
  averageLineLengthEntropy: number
  averageNamingEntropy: number
  standardDeviation: number
  minEntropy: number
  maxEntropy: number
}

/**
 * Aggregate entropy statistics.
 *
 * @example
 * const s: EntropyStats = { totalFiles: 20, averageEntropy: 4.5, anomalousCount: 2, lowEntropyCount: 3, highEntropyCount: 1, mostEntropicFile: 'app.ts', leastEntropicFile: 'constants.ts' }
 */
export interface EntropyStats {
  totalFiles: number
  averageEntropy: number
  anomalousCount: number
  lowEntropyCount: number
  highEntropyCount: number
  mostEntropicFile: string
  leastEntropicFile: string
}

/**
 * Complete entropy analysis result.
 *
 * @example
 * const r: EntropyResult = { files: [], distribution: d, anomalousFiles: [], stats: s, recommendations: [] }
 */
export interface EntropyResult {
  files: FileEntropy[]
  distribution: EntropyDistribution
  anomalousFiles: FileEntropy[]
  stats: EntropyStats
  recommendations: string[]
}

/**
 * Options for entropy analysis.
 *
 * @example
 * const o: EntropyOptions = { verbose: false }
 */
export interface EntropyOptions {
  verbose?: boolean
}

// ─── Shannon Entropy ──────────────────────────────────────────────────────────

/**
 * Compute Shannon entropy from a frequency map.
 *
 * @example
 * computeShannonEntropy(new Map([['a', 5], ['b', 3], ['c', 2]])) // ~1.485
 */
export function computeShannonEntropy(frequencies: Map<string, number>): number {
  let total = 0
  for (const count of frequencies.values()) {
    total += count
  }
  if (total === 0) return 0

  let entropy = 0
  for (const count of frequencies.values()) {
    if (count === 0) continue
    const p = count / total
    entropy -= p * Math.log2(p)
  }

  return Math.round(entropy * 1000) / 1000
}

// ─── Character Entropy ────────────────────────────────────────────────────────

/**
 * Compute character-level entropy.
 *
 * @example
 * computeCharacterEntropy('hello world') // ~2.845
 */
export function computeCharacterEntropy(content: string): number {
  if (content.length === 0) return 0
  const freq = new Map<string, number>()
  for (const ch of content) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1)
  }
  return computeShannonEntropy(freq)
}

// ─── Token Entropy ────────────────────────────────────────────────────────────

/**
 * Compute token/word-level entropy.
 *
 * @example
 * computeTokenEntropy('const x = 1; const y = 2;') // token diversity
 */
export function computeTokenEntropy(content: string): number {
  const tokens = content.split(/[\s;{}()[\]<>,.=+\-*/&|!?:@#$%^~'"`\\]+/).filter(Boolean)
  if (tokens.length === 0) return 0
  const freq = new Map<string, number>()
  for (const tok of tokens) {
    freq.set(tok, (freq.get(tok) ?? 0) + 1)
  }
  return computeShannonEntropy(freq)
}

// ─── Line Length Entropy ──────────────────────────────────────────────────────

/**
 * Compute line-length entropy (bucketed into ranges of 10).
 *
 * @example
 * computeLineLengthEntropy('short\nmedium line\nvery long line here') // entropy of length buckets
 */
export function computeLineLengthEntropy(content: string): number {
  const lines = content.split('\n')
  if (lines.length === 0) return 0
  const freq = new Map<string, number>()
  for (const line of lines) {
    const bucket = String(Math.floor(line.length / 10) * 10)
    freq.set(bucket, (freq.get(bucket) ?? 0) + 1)
  }
  return computeShannonEntropy(freq)
}

// ─── Naming Entropy ───────────────────────────────────────────────────────────

  const IDENTIFIER_PATTERN = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g
  const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends', 'import', 'export', 'from', 'default', 'typeof', 'instanceof', 'in', 'of', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield', 'void', 'delete', 'true', 'false', 'null', 'undefined'])

/**
 * Compute identifier naming entropy.
 *
 * @example
 * computeNamingEntropy('const foo = 1; const bar = 2;') // naming diversity
 */
export function computeNamingEntropy(content: string): number {
  const names: string[] = []
  let match: RegExpExecArray | null
  IDENTIFIER_PATTERN.lastIndex = 0
  while ((match = IDENTIFIER_PATTERN.exec(content)) !== null) {
    const name = match[1] ?? ''
    if (!KEYWORDS.has(name)) {
      names.push(name)
    }
  }
  if (names.length === 0) return 0
  const freq = new Map<string, number>()
  for (const name of names) {
    freq.set(name, (freq.get(name) ?? 0) + 1)
  }
  return computeShannonEntropy(freq)
}

// ─── Overall Entropy ──────────────────────────────────────────────────────────

/**
 * Compute weighted overall entropy from individual metrics.
 *
 * @example
 * computeOverallEntropy({ characterEntropy: 4, tokenEntropy: 6, lineLengthEntropy: 3, namingEntropy: 5 }) // ~4.7
 */
export function computeOverallEntropy(metrics: { characterEntropy: number; tokenEntropy: number; lineLengthEntropy: number; namingEntropy: number }): number {
  const raw = metrics.characterEntropy * 0.2 + metrics.tokenEntropy * 0.3 + metrics.lineLengthEntropy * 0.2 + metrics.namingEntropy * 0.3
  return Math.round(raw * 1000) / 1000
}

// ─── Classification ───────────────────────────────────────────────────────────

/**
 * Classify entropy level.
 *
 * @example
 * classifyEntropy(2.5) // 'low'
 * classifyEntropy(4.0) // 'normal'
 */
export function classifyEntropy(entropy: number): 'low' | 'normal' | 'high' | 'very-high' {
  if (entropy < 3) return 'low'
  if (entropy < 5) return 'normal'
  if (entropy < 6.5) return 'high'
  return 'very-high'
}

// ─── Distribution ─────────────────────────────────────────────────────────────

/**
 * Compute entropy distribution across files.
 *
 * @example
 * computeDistribution(fileEntropies) // { averageCharacterEntropy: 4.5, ... }
 */
export function computeDistribution(fileEntropies: FileEntropy[]): EntropyDistribution {
  if (fileEntropies.length === 0) {
    return {
      averageCharacterEntropy: 0,
      averageTokenEntropy: 0,
      averageLineLengthEntropy: 0,
      averageNamingEntropy: 0,
      standardDeviation: 0,
      minEntropy: 0,
      maxEntropy: 0,
    }
  }

  const n = fileEntropies.length
  const avgChar = fileEntropies.reduce((s, f) => s + f.metrics.characterEntropy, 0) / n
  const avgTok = fileEntropies.reduce((s, f) => s + f.metrics.tokenEntropy, 0) / n
  const avgLine = fileEntropies.reduce((s, f) => s + f.metrics.lineLengthEntropy, 0) / n
  const avgNam = fileEntropies.reduce((s, f) => s + f.metrics.namingEntropy, 0) / n

  const overallValues = fileEntropies.map((f) => f.metrics.overallEntropy)
  const avgOverall = overallValues.reduce((a, b) => a + b, 0) / n
  const variance = overallValues.reduce((s, v) => s + (v - avgOverall) ** 2, 0) / n
  const stddev = Math.sqrt(variance)

  const entropies = fileEntropies.map((f) => f.metrics.overallEntropy)

  return {
    averageCharacterEntropy: Math.round(avgChar * 1000) / 1000,
    averageTokenEntropy: Math.round(avgTok * 1000) / 1000,
    averageLineLengthEntropy: Math.round(avgLine * 1000) / 1000,
    averageNamingEntropy: Math.round(avgNam * 1000) / 1000,
    standardDeviation: Math.round(stddev * 1000) / 1000,
    minEntropy: Math.min(...entropies),
    maxEntropy: Math.max(...entropies),
  }
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────

/**
 * Detect anomalous files based on entropy deviation.
 *
 * @example
 * detectAnomalies(fileEntropies, distribution) // files with unusual entropy
 */
export function detectAnomalies(fileEntropies: FileEntropy[], distribution: EntropyDistribution): FileEntropy[] {
  const avg = (distribution.minEntropy + distribution.maxEntropy) / 2
  const threshold = distribution.standardDeviation > 0 ? distribution.standardDeviation * 2 : 1

  return fileEntropies.map((f) => {
    const deviation = Math.abs(f.metrics.overallEntropy - avg)
    const anomalyScore = distribution.standardDeviation > 0
      ? Math.min(1, Math.round((deviation / (threshold * 2)) * 100) / 100)
      : 0
    const isAnomalous = deviation > threshold

    let anomalyReason: string | null = null
    if (isAnomalous) {
      if (f.metrics.overallEntropy < avg - threshold) {
        anomalyReason = 'Very low entropy — possibly auto-generated or highly repetitive'
      } else {
        anomalyReason = 'Very high entropy — possibly obfuscated or overly complex'
      }
    }

    return { ...f, anomalyScore, isAnomalous, anomalyReason }
  })
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Compute aggregate entropy statistics.
 *
 * @example
 * computeEntropyStats(files) // { totalFiles: 10, averageEntropy: 4.5, ... }
 */
export function computeEntropyStats(fileEntropies: FileEntropy[]): EntropyStats {
  if (fileEntropies.length === 0) {
    return { totalFiles: 0, averageEntropy: 0, anomalousCount: 0, lowEntropyCount: 0, highEntropyCount: 0, mostEntropicFile: '', leastEntropicFile: '' }
  }

  const totalFiles = fileEntropies.length
  const avgEntropy = Math.round((fileEntropies.reduce((s, f) => s + f.metrics.overallEntropy, 0) / totalFiles) * 1000) / 1000
  const anomalousCount = fileEntropies.filter((f) => f.isAnomalous).length
  const lowEntropyCount = fileEntropies.filter((f) => f.metrics.classification === 'low').length
  const highEntropyCount = fileEntropies.filter((f) => f.metrics.classification === 'high' || f.metrics.classification === 'very-high').length

  const sorted = [...fileEntropies].sort((a, b) => b.metrics.overallEntropy - a.metrics.overallEntropy)
  const mostEntropicFile = sorted[0]!.file
  const leastEntropicFile = sorted[sorted.length - 1]!.file

  return { totalFiles, averageEntropy: avgEntropy, anomalousCount, lowEntropyCount, highEntropyCount, mostEntropicFile, leastEntropicFile }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate entropy-related recommendations.
 *
 * @example
 * generateEntropyRecommendations(anomalous, stats) // ['Low entropy in constants.ts may indicate auto-generated code']
 */
export function generateEntropyRecommendations(anomalous: FileEntropy[], stats: EntropyStats): string[] {
  const recs: string[] = []

  const lowAnomalous = anomalous.filter((f) => f.metrics.classification === 'low')
  for (const f of lowAnomalous.slice(0, 3)) {
    recs.push(`${f.file} has very low entropy (${f.metrics.overallEntropy}). May be auto-generated or repetitive.`)
  }

  const highAnomalous = anomalous.filter((f) => f.metrics.classification === 'high' || f.metrics.classification === 'very-high')
  for (const f of highAnomalous.slice(0, 3)) {
    recs.push(`${f.file} has very high entropy (${f.metrics.overallEntropy}). May be obfuscated or overly complex.`)
  }

  if (stats.lowEntropyCount > stats.totalFiles * 0.3) {
    recs.push('More than 30% of files have low entropy. Consider reducing boilerplate or generated code.')
  }

  if (recs.length === 0) {
    recs.push('Entropy levels are within normal range across the codebase.')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete entropy analysis result.
 *
 * @example
 * const result = buildEntropyResult(files, contents, {})
 */
export function buildEntropyResult(
  files: string[],
  contents: string[],
  _options: EntropyOptions = {},
): EntropyResult {
  const fileEntropies: FileEntropy[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const charE = computeCharacterEntropy(content)
    const tokE = computeTokenEntropy(content)
    const lineE = computeLineLengthEntropy(content)
    const namE = computeNamingEntropy(content)
    const overall = computeOverallEntropy({ characterEntropy: charE, tokenEntropy: tokE, lineLengthEntropy: lineE, namingEntropy: namE })

    const metrics: EntropyMetrics = {
      characterEntropy: charE,
      tokenEntropy: tokE,
      lineLengthEntropy: lineE,
      namingEntropy: namE,
      overallEntropy: overall,
      classification: classifyEntropy(overall),
    }

    fileEntropies.push({
      file: files[i]!,
      metrics,
      lines: content.split('\n').length,
      size: content.length,
      anomalyScore: 0,
      isAnomalous: false,
      anomalyReason: null,
    })
  }

  const distribution = computeDistribution(fileEntropies)
  const withAnomalies = detectAnomalies(fileEntropies, distribution)
  const anomalousFiles = withAnomalies.filter((f) => f.isAnomalous)
  const stats = computeEntropyStats(withAnomalies)
  const recommendations = generateEntropyRecommendations(anomalousFiles, stats)

  return { files: withAnomalies, distribution, anomalousFiles, stats, recommendations }
}
