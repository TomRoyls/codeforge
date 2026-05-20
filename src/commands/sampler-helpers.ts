// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Sample {
  files: string[]
  size: number
  method: 'random' | 'stratified' | 'systematic' | 'clustered'
  seed: number
}

export interface Measurement {
  name: string
  values: number[]
  mean: number
  median: number
  stddev: number
  min: number
  max: number
  p25: number
  p75: number
  p95: number
  confidenceInterval: [number, number]
}

export interface SampleResult {
  measurement: string
  sampleMean: number
  populationEstimate: number
  confidenceInterval: [number, number]
  confidence: number
  error: number
}

export interface SamplerStats {
  populationSize: number
  sampleSize: number
  samplingRate: number
  method: string
  measurementsCount: number
  estimatesWithHighConfidence: number
  overallConfidence: number
}

export interface SamplerResult {
  sample: Sample
  measurements: Measurement[]
  estimates: SampleResult[]
  stats: SamplerStats
  recommendations: string[]
}

// ─── Seeded RNG ────────────────────────────────────────────────────────────────

/**
 * Simple seeded pseudo-random number generator (LCG).
 *
 * @example
 * seededRandom(42)
 */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── Sampling Methods ──────────────────────────────────────────────────────────

/**
 * Pure random sampling.
 *
 * @example
 * randomSample(['a.ts', 'b.ts', 'c.ts'], 2, 42)
 */
export function randomSample(files: string[], size: number, seed: number): string[] {
  const n = Math.min(size, files.length)
  const rng = seededRandom(seed)
  const indices = files.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = indices[i]!
    indices[i] = indices[j]!
    indices[j] = tmp
  }
  return indices.slice(0, n).sort((a, b) => a - b).map((i) => files[i]!)
}

/**
 * Stratified sampling — proportional by directory.
 *
 * @example
 * stratifiedSample(['src/a.ts', 'test/b.ts'], 2, 42)
 */
export function stratifiedSample(files: string[], size: number, seed: number): string[] {
  const n = Math.min(size, files.length)
  const groups = new Map<string, number[]>()
  files.forEach((f, i) => {
    const dir = f.split('/').slice(0, -1).join('/') || '(root)'
    const list = groups.get(dir)
    if (list) list.push(i)
    else groups.set(dir, [i])
  })

  const rng = seededRandom(seed)
  const selected = new Set<number>()

  for (const [, indices] of groups) {
    const proportion = Math.max(1, Math.round((indices.length / files.length) * n))
    const shuffled = [...indices].sort(() => rng() - 0.5)
    for (let i = 0; i < Math.min(proportion, shuffled.length) && selected.size < n; i++) {
      selected.add(shuffled[i]!)
    }
  }

  while (selected.size < n) {
    selected.add(Math.floor(rng() * files.length))
  }

  return [...selected].sort((a, b) => a - b).map((i) => files[i]!)
}

/**
 * Systematic sampling — every Nth file.
 *
 * @example
 * systematicSample(['a', 'b', 'c', 'd', 'e'], 2)
 */
export function systematicSample(files: string[], size: number): string[] {
  const n = Math.min(size, files.length)
  if (n === 0) return []
  const step = Math.floor(files.length / n)
  const result: string[] = []
  for (let i = 0; i < n; i++) {
    const idx = Math.min(i * step + Math.floor(step / 2), files.length - 1)
    result.push(files[idx]!)
  }
  return result
}

/**
 * Clustered sampling — random directories, all files within.
 *
 * @example
 * clusteredSample(['src/a.ts', 'src/b.ts', 'test/c.ts'], 2, 42)
 */
export function clusteredSample(files: string[], size: number, seed: number): string[] {
  const n = Math.min(size, files.length)
  const groups = new Map<string, string[]>()
  files.forEach((f) => {
    const dir = f.split('/').slice(0, -1).join('/') || '(root)'
    const list = groups.get(dir)
    if (list) list.push(f)
    else groups.set(dir, [f])
  })

  const rng = seededRandom(seed)
  const dirs = [...groups.keys()].sort(() => rng() - 0.5)

  const selected: string[] = []
  for (const dir of dirs) {
    if (selected.length >= n) break
    const groupFiles = groups.get(dir)!
    for (const f of groupFiles) {
      if (selected.length < n) selected.push(f)
    }
  }

  return selected
}

// ─── Statistics ────────────────────────────────────────────────────────────────

/**
 * Compute arithmetic mean.
 *
 * @example
 * computeMean([1, 2, 3, 4, 5])
 */
export function computeMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

/**
 * Compute median.
 *
 * @example
 * computeMedian([1, 2, 3, 4, 5])
 */
export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid! - 1]! + sorted[mid]!) / 2
}

/**
 * Compute standard deviation.
 *
 * @example
 * computeStdDev([1, 2, 3, 4, 5], 3)
 */
export function computeStdDev(values: number[], mean: number): number {
  if (values.length <= 1) return 0
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

/**
 * Compute pth percentile.
 *
 * @example
 * computePercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 50)
 */
export function computePercentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]!
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (idx - lower)
}

/**
 * Compute margin of error.
 *
 * @example
 * computeMarginOfError(5, 30, 95)
 */
export function computeMarginOfError(stddev: number, n: number, confidence = 95): number {
  if (n <= 1) return 0
  const z = confidence === 99 ? 2.576 : confidence === 95 ? 1.96 : 1.645
  return z * (stddev / Math.sqrt(n))
}

/**
 * Compute confidence interval.
 *
 * @example
 * computeConfidenceInterval([1, 2, 3, 4, 5], 95)
 */
export function computeConfidenceInterval(values: number[], confidence = 95): [number, number] {
  if (values.length === 0) return [0, 0]
  const mean = computeMean(values)
  const stddev = computeStdDev(values, mean)
  const moe = computeMarginOfError(stddev, values.length, confidence)
  return [mean - moe, mean + moe]
}

// ─── File Measurements ─────────────────────────────────────────────────────────

/**
 * Measure all metrics for a single file.
 *
 * @example
 * measureFileMetrics('const x = 1\n// TODO: fix')
 */
export function measureFileMetrics(content: string): Record<string, number> {
  const lines = content.split('\n')
  const totalLines = lines.length
  const effectiveLines = lines.filter((l) => {
    const t = l.trim()
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*')
  }).length

  const commentLines = lines.filter((l) => {
    const t = l.trim()
    return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
  }).length

  const commentDensity = totalLines > 0 ? Math.round((commentLines / totalLines) * 100) : 0

  const fnMatches = content.match(/\bfunction\s+\w+|=>\s*[{(]/g)
  const functionCount = fnMatches ? fnMatches.length : 0

  const complexityPatterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
  let complexity = 1
  for (const pat of complexityPatterns) {
    const m = content.match(pat)
    if (m) complexity += m.length
  }

  const importMatches = content.match(/^import\s+/gm)
  const importCount = importMatches ? importMatches.length : 0

  const exportMatches = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  const exportCount = exportMatches ? exportMatches.length : 0

  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > maxDepth) maxDepth = depth }
    else if (ch === '}') depth--
  }

  const stringMatches = content.match(/'[^']*'|"[^"]*"|`[^`]*`/g)
  const stringCount = stringMatches ? stringMatches.length : 0

  const todoMatches = content.match(/\/\/\s*(TODO|FIXME)[\s:]/gi)
  const todoCount = todoMatches ? todoMatches.length : 0

  return {
    'Line Count': effectiveLines,
    'Function Count': functionCount,
    'Complexity': complexity,
    'Comment Density': commentDensity,
    'Import Count': importCount,
    'Export Count': exportCount,
    'Nesting Depth': maxDepth,
    'String Literals': stringCount,
    'TODO/FIXME Count': todoCount,
  }
}

// ─── Build Measurements ────────────────────────────────────────────────────────

/**
 * Build measurement statistics from per-file values.
 *
 * @example
 * buildMeasurement('Line Count', [10, 20, 30])
 */
export function buildMeasurement(name: string, values: number[]): Measurement {
  const mean = computeMean(values)
  const median = computeMedian(values)
  const stddev = computeStdDev(values, mean)
  const min = values.length > 0 ? Math.min(...values) : 0
  const max = values.length > 0 ? Math.max(...values) : 0
  const p25 = computePercentile(values, 25)
  const p75 = computePercentile(values, 75)
  const p95 = computePercentile(values, 95)
  const ci = computeConfidenceInterval(values)

  return { name, values, mean, median, stddev, min, max, p25, p75, p95, confidenceInterval: ci }
}

/**
 * Extrapolate sample to population.
 *
 * @example
 * extrapolateToPopulation(measurement, 10, 100)
 */
export function extrapolateToPopulation(measurement: Measurement, sampleSize: number, populationSize: number): SampleResult {
  const sampleMean = measurement.mean
  const moe = computeMarginOfError(measurement.stddev, sampleSize)
  return {
    measurement: measurement.name,
    sampleMean,
    populationEstimate: Math.round(sampleMean * populationSize),
    confidenceInterval: [Math.round((sampleMean - moe) * populationSize), Math.round((sampleMean + moe) * populationSize)],
    confidence: 95,
    error: Math.round(moe * populationSize),
  }
}

/**
 * Compute overall confidence.
 *
 * @example
 * computeOverallConfidence(estimates)
 */
export function computeOverallConfidence(estimates: SampleResult[]): number {
  if (estimates.length === 0) return 0
  const totalConf = estimates.reduce((s, e) => s + e.confidence, 0)
  return Math.round(totalConf / estimates.length)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate sampler recommendations.
 *
 * @example
 * generateSamplerRecommendations(measurements, estimates, stats)
 */
export function generateSamplerRecommendations(measurements: Measurement[], estimates: SampleResult[], stats: SamplerStats): string[] {
  const recs: string[] = []

  for (const m of measurements) {
    if (m.stddev > m.mean * 0.8 && m.mean > 0) {
      recs.push(`High variance in ${m.name} (stddev=${m.stddev.toFixed(1)}) — consider larger sample`)
    }
  }

  for (const m of measurements) {
    const range = m.max - m.min
    if (range > m.mean * 3 && m.mean > 0) {
      recs.push(`Outlier detected in ${m.name}: range ${m.min}-${m.max}, investigate extremes`)
    }
  }

  const lowConf = estimates.filter((e) => e.error > e.populationEstimate * 0.3)
  if (lowConf.length > 0) {
    recs.push(`${lowConf.length} estimate(s) have wide confidence intervals — increase sample size`)
  }

  if (stats.samplingRate < 20) {
    recs.push(`Sampling rate is ${stats.samplingRate}% — consider sampling more files for better accuracy`)
  }

  if (recs.length === 0) {
    recs.push('Sample appears representative — estimates are reliable')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete sampler result.
 *
 * @example
 * buildSamplerResult(files, contents, { method: 'random', sampleSize: 10, seed: 42 })
 */
export function buildSamplerResult(
  files: string[],
  contents: string[],
  options: { method: Sample['method']; sampleSize: number; seed: number },
): SamplerResult {
  const popSize = files.length
  const size = Math.min(options.sampleSize, popSize)

  let sampledFiles: string[]
  switch (options.method) {
    case 'stratified':
      sampledFiles = stratifiedSample(files, size, options.seed)
      break
    case 'systematic':
      sampledFiles = systematicSample(files, size)
      break
    case 'clustered':
      sampledFiles = clusteredSample(files, size, options.seed)
      break
    default:
      sampledFiles = randomSample(files, size, options.seed)
  }

  const sample: Sample = { files: sampledFiles, size: sampledFiles.length, method: options.method, seed: options.seed }

  const sampleContents = sampledFiles.map((f) => {
    const idx = files.indexOf(f)
    return idx >= 0 ? contents[idx] ?? '' : ''
  })

  const fileMetrics = sampleContents.map((c) => measureFileMetrics(c))

  const metricNames = fileMetrics.length > 0 ? Object.keys(fileMetrics[0]!) : []
  const measurements: Measurement[] = metricNames.map((name) => {
    const values = fileMetrics.map((fm) => fm[name] ?? 0)
    return buildMeasurement(name, values)
  })

  const estimates = measurements.map((m) => extrapolateToPopulation(m, sample.size, popSize))

  const highConf = estimates.filter((e) => e.error <= e.populationEstimate * 0.3 || e.populationEstimate === 0)
  const samplingRate = popSize > 0 ? Math.round((sample.size / popSize) * 100) : 0

  const stats: SamplerStats = {
    populationSize: popSize,
    sampleSize: sample.size,
    samplingRate,
    method: options.method,
    measurementsCount: measurements.length,
    estimatesWithHighConfidence: highConf.length,
    overallConfidence: computeOverallConfidence(estimates),
  }

  const recommendations = generateSamplerRecommendations(measurements, estimates, stats)

  return { sample, measurements, estimates, stats, recommendations }
}
