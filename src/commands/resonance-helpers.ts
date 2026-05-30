// ─── Types ─────────────────────────────────────────────────────────────────────

export type FrequencyCategory = 'structural' | 'naming' | 'async' | 'error' | 'import' | 'export' | 'typing' | 'style'
export type ResonanceType = 'constructive' | 'destructive' | 'harmonic' | 'dissonant'
export type Impact = 'positive' | 'negative' | 'neutral'
export type Tuning = 'well-tuned' | 'slightly-off' | 'dissonant' | 'cacophonous'

export interface Frequency {
  pattern: string
  category: FrequencyCategory
  occurrences: number
  files: string[]
  amplitude: number
  wavelength: number
}

export interface Resonance {
  patterns: [string, string]
  type: ResonanceType
  strength: number
  files: string[]
  description: string
  impact: Impact
}

export interface ResonanceProfile {
  file: string
  dominantFrequency: string
  frequencyCount: number
  resonanceScore: number
  interference: number
  tuning: Tuning
}

export interface ResonanceStats {
  totalFrequencies: number
  constructiveResonances: number
  destructiveResonances: number
  avgResonanceScore: number
  avgInterference: number
  dominantFrequency: string
  rarestFrequency: string
  mostHarmoniousFile: string
  mostDissonantFile: string
  overallHarmony: number
  signalToNoiseRatio: number
}

export interface ResonanceResult {
  frequencies: Frequency[]
  resonances: Resonance[]
  profiles: ResonanceProfile[]
  stats: ResonanceStats
  recommendations: string[]
}

export interface ResonanceOptions {
  verbose?: boolean
}

// ─── Pattern Definitions ───────────────────────────────────────────────────────

interface PatternDef {
  pattern: string
  category: FrequencyCategory
  regex: RegExp
  quality: number // -1 (bad) to 1 (good)
}

const PATTERNS: PatternDef[] = [
  // structural
  { pattern: 'arrow-function', category: 'structural', regex: /=>\s*\{?/g, quality: 0.5 },
  { pattern: 'function-decl', category: 'structural', regex: /\bfunction\s+\w+/g, quality: 0.5 },
  { pattern: 'class', category: 'structural', regex: /\bclass\s+\w+/g, quality: 0.3 },
  { pattern: 'if-else', category: 'structural', regex: /\bif\b.*\{[\s\S]*?\belse\b/g, quality: 0.2 },
  { pattern: 'switch', category: 'structural', regex: /\bswitch\s*\(/g, quality: 0 },
  { pattern: 'ternary', category: 'structural', regex: /\?\s*[^?]+\s*:/g, quality: 0.1 },
  // naming
  { pattern: 'camelCase', category: 'naming', regex: /\b[a-z]\w*[A-Z]\w*\b/g, quality: 0.5 },
  { pattern: 'PascalCase', category: 'naming', regex: /\b[A-Z]\w*[a-z]\w*\b/g, quality: 0.5 },
  { pattern: 'UPPER_SNAKE', category: 'naming', regex: /\b[A-Z][A-Z0-9_]*\b/g, quality: 0.3 },
  // async
  { pattern: 'async-await', category: 'async', regex: /\basync\b[\s\S]*?\bawait\b/g, quality: 0.8 },
  { pattern: 'dot-then', category: 'async', regex: /\.then\s*\(/g, quality: -0.3 },
  { pattern: 'Promise-all', category: 'async', regex: /Promise\.all/g, quality: 0.6 },
  // error
  { pattern: 'try-catch', category: 'error', regex: /\btry\s*\{/g, quality: 0.7 },
  { pattern: 'dot-catch', category: 'error', regex: /\.catch\s*\(/g, quality: 0.4 },
  { pattern: 'throw', category: 'error', regex: /\bthrow\s+/g, quality: 0.3 },
  { pattern: 'Error-constructor', category: 'error', regex: /\bnew\s+Error\b/g, quality: 0.5 },
  // import
  { pattern: 'named-import', category: 'import', regex: /import\s+\{[^}]+\}\s+from/g, quality: 0.5 },
  { pattern: 'default-import', category: 'import', regex: /import\s+\w+\s+from/g, quality: 0.3 },
  { pattern: 'type-import', category: 'import', regex: /import\s+type\s+/g, quality: 0.6 },
  { pattern: 're-export', category: 'import', regex: /export\s+\{[^}]+\}\s+from/g, quality: 0.4 },
  // export
  { pattern: 'named-export', category: 'export', regex: /export\s+(?:const|let|var|function|class|interface|type|enum)\s+/g, quality: 0.5 },
  { pattern: 'default-export', category: 'export', regex: /export\s+default\s+/g, quality: 0.2 },
  { pattern: 'type-export', category: 'export', regex: /export\s+(?:type|interface)\s+/g, quality: 0.6 },
  // typing
  { pattern: 'explicit-type', category: 'typing', regex: /:\s*(?:string|number|boolean|void|any|never|unknown|object)\b/g, quality: 0.4 },
  { pattern: 'interface', category: 'typing', regex: /\binterface\s+\w+/g, quality: 0.6 },
  { pattern: 'type-alias', category: 'typing', regex: /\btype\s+\w+\s*=/g, quality: 0.5 },
  { pattern: 'generic', category: 'typing', regex: /<\w+>/g, quality: 0.5 },
  // style
  { pattern: 'early-return', category: 'style', regex: /\breturn\s+(?:if|early)/g, quality: 0.6 },
  { pattern: 'guard-clause', category: 'style', regex: /if\s*\([^)]*\)\s*\{\s*return/g, quality: 0.7 },
  { pattern: 'nullish-coalescing', category: 'style', regex: /\?\?/g, quality: 0.6 },
  { pattern: 'optional-chaining', category: 'style', regex: /\?\.\w/g, quality: 0.7 },
  { pattern: 'any-type', category: 'typing', regex: /:\s*any\b/g, quality: -0.7 },
]

// ─── Frequency Extraction ──────────────────────────────────────────────────────

/**
 * Extract all code pattern frequencies from content.
 *
 * @example
 * extractFrequencies('const x: number = 1', 'app.ts')
 * // => [{ pattern: 'explicit-type', category: 'typing', ... }]
 */
export function extractFrequencies(content: string, file: string): Frequency[] {
  const freqs: Frequency[] = []

  for (const def of PATTERNS) {
    const matches = content.match(def.regex) ?? []
    if (matches.length === 0) continue

    freqs.push({
      pattern: def.pattern,
      category: def.category,
      occurrences: matches.length,
      files: [file],
      amplitude: 0,
      wavelength: 0,
    })
  }

  return freqs
}

/**
 * Compute amplitude (dominance) score for a pattern.
 *
 * @example
 * computeAmplitude(10, 100) // => 10
 */
export function computeAmplitude(occurrences: number, totalOccurrences: number): number {
  if (totalOccurrences === 0) return 0
  return Math.round((occurrences / totalOccurrences) * 100)
}

/**
 * Compute wavelength (normalized frequency position) for a pattern.
 *
 * @example
 * computeWavelength('arrow-function', 'structural') // => 0.06
 */
export function computeWavelength(pattern: string, category: FrequencyCategory): number {
  const categoryMap: Record<FrequencyCategory, number> = {
    structural: 0,
    naming: 1,
    async: 2,
    error: 3,
    import: 4,
    export: 5,
    typing: 6,
    style: 7,
  }
  const catBase = categoryMap[category] * 0.125
  let hash = 0
  for (let i = 0; i < pattern.length; i++) {
    hash = ((hash << 5) - hash) + pattern.charCodeAt(i)
    hash |= 0
  }
  return Math.round((catBase + (Math.abs(hash) % 125) / 1000) * 1000) / 1000
}

// ─── Resonance Detection ───────────────────────────────────────────────────────

/**
 * Detect resonances between co-occurring patterns across files.
 *
 * @example
 * detectResonances(freqs, files, contents) // => [{ patterns: ['try-catch', 'async-await'], ... }]
 */
export function detectResonances(
  frequencies: Frequency[],
  files: string[],
  contents: string[],
): Resonance[] {
  const resonances: Resonance[] = []

  // Constructive pairs: both patterns are high quality
  const constructivePairs: [string, string, string][] = [
    ['JSDoc + type annotations amplify clarity', 'try-catch', 'async-await'],
    ['Interfaces + type exports strengthen typing', 'interface', 'type-export'],
    ['Guard clauses + early returns improve flow', 'guard-clause', 'early-return'],
    ['Named imports + named exports define clear API', 'named-import', 'named-export'],
    ['Optional chaining + nullish coalescing handle nullability', 'optional-chaining', 'nullish-coalescing'],
    ['Async-await + try-catch create robust async code', 'async-await', 'try-catch'],
    ['Type imports + type exports separate concerns', 'type-import', 'type-export'],
    ['Generics + interfaces create reusable abstractions', 'generic', 'interface'],
  ]

  // Destructive pairs: one or both patterns are harmful
  const destructivePairs: [string, string, string][] = [
    ['any type undermines explicit typing', 'any-type', 'explicit-type'],
    ['dot-then conflicts with async-await style', 'dot-then', 'async-await'],
    ['default imports risk tree-shaking issues', 'default-import', 'named-export'],
  ]

  // Harmonic pairs: naturally co-occur
  const harmonicPairs: [string, string, string][] = [
    ['Functions and classes form structural backbone', 'function-decl', 'class'],
    ['Named imports connect with named exports', 'named-import', 'named-export'],
    ['Error constructor pairs with throw', 'Error-constructor', 'throw'],
    ['Type aliases complement interfaces', 'type-alias', 'interface'],
    ['Arrow functions enable functional style', 'arrow-function', 'camelCase'],
  ]

  // Dissonant pairs: style conflicts
  const dissonantPairs: [string, string, string][] = [
    ['function-decl and arrow-function mixed style', 'function-decl', 'arrow-function'],
    ['switch and ternary create confusing flow', 'switch', 'ternary'],
    ['default-export and named-export mixed exports', 'default-export', 'named-export'],
  ]

  for (const [desc, p1, p2] of constructivePairs) {
    const f1 = frequencies.find(f => f.pattern === p1)
    const f2 = frequencies.find(f => f.pattern === p2)
    if (f1 && f2) {
      const commonFiles = files.filter((_file, idx) => {
        const c = contents[idx]
        return hasPattern(c ?? '', p1) && hasPattern(c ?? '', p2)
      })
      if (commonFiles.length > 0) {
        const strength = Math.min(100, commonFiles.length * 25)
        resonances.push({ patterns: [p1, p2], type: 'constructive', strength, files: commonFiles, description: desc, impact: 'positive' })
      }
    }
  }

  for (const [desc, p1, p2] of destructivePairs) {
    const f1 = frequencies.find(f => f.pattern === p1)
    const f2 = frequencies.find(f => f.pattern === p2)
    if (f1 && f2) {
      const commonFiles = files.filter((_file, idx) => {
        const c = contents[idx]
        return hasPattern(c ?? '', p1) && hasPattern(c ?? '', p2)
      })
      if (commonFiles.length > 0) {
        const strength = Math.min(100, commonFiles.length * 30)
        resonances.push({ patterns: [p1, p2], type: 'destructive', strength, files: commonFiles, description: desc, impact: 'negative' })
      }
    }
  }

  for (const [desc, p1, p2] of harmonicPairs) {
    const f1 = frequencies.find(f => f.pattern === p1)
    const f2 = frequencies.find(f => f.pattern === p2)
    if (f1 && f2) {
      const commonFiles = files.filter((_, idx) => hasPattern(contents[idx] ?? '', p1) && hasPattern(contents[idx] ?? '', p2))
      if (commonFiles.length > 0) {
        const strength = Math.min(100, commonFiles.length * 20)
        resonances.push({ patterns: [p1, p2], type: 'harmonic', strength, files: commonFiles, description: desc, impact: 'neutral' })
      }
    }
  }

  for (const [desc, p1, p2] of dissonantPairs) {
    const f1 = frequencies.find(f => f.pattern === p1)
    const f2 = frequencies.find(f => f.pattern === p2)
    if (f1 && f2) {
      const commonFiles = files.filter((_, idx) => hasPattern(contents[idx] ?? '', p1) && hasPattern(contents[idx] ?? '', p2))
      if (commonFiles.length > 0) {
        const strength = Math.min(100, commonFiles.length * 25)
        resonances.push({ patterns: [p1, p2], type: 'dissonant', strength, files: commonFiles, description: desc, impact: 'negative' })
      }
    }
  }

  return resonances
}

function hasPattern(content: string, patternName: string): boolean {
  const def = PATTERNS.find(p => p.pattern === patternName)
  if (!def) return false
  def.regex.lastIndex = 0
  return def.regex.test(content)
}

// ─── Profile Building ──────────────────────────────────────────────────────────

/**
 * Build a resonance profile for a single file.
 *
 * @example
 * buildProfile('app.ts', content, freqs) // => { dominantFrequency: 'arrow-function', ... }
 */
export function buildProfile(file: string, content: string, _allFrequencies: Frequency[]): ResonanceProfile {
  const fileFreqs = extractFrequencies(content, file)

  const dominant = fileFreqs.length > 0
    ? fileFreqs.reduce((best, f) => f.occurrences > best.occurrences ? f : best, fileFreqs[0] as typeof fileFreqs[number])
    : null

  const resonanceScore = computeResonanceScore(fileFreqs, content)
  const interference = computeInterference(content)
  const tuning = classifyTuning(resonanceScore)

  return {
    file,
    dominantFrequency: dominant?.pattern ?? 'none',
    frequencyCount: fileFreqs.length,
    resonanceScore,
    interference,
    tuning,
  }
}

/**
 * Compute resonance score (how harmonious the file is).
 *
 * @example
 * computeResonanceScore(freqs, content) // => 72
 */
export function computeResonanceScore(freqs: Frequency[], content: string): number {
  if (freqs.length === 0) return 50

  let qualitySum = 0
  for (const def of PATTERNS) {
    const matches = content.match(def.regex) ?? []
    if (matches.length > 0) {
      qualitySum += def.quality * matches.length
    }
  }

  const totalMatches = freqs.reduce((s, f) => s + f.occurrences, 0)
  if (totalMatches === 0) return 50

  const normalizedQuality = qualitySum / totalMatches
  return Math.round(Math.max(0, Math.min(100, 50 + normalizedQuality * 50)))
}

/**
 * Compute interference (constructive vs destructive balance).
 *
 * @example
 * computeInterference(content) // => 65
 */
export function computeInterference(content: string): number {
  let constructive = 0
  let destructive = 0

  for (const def of PATTERNS) {
    const matches = content.match(def.regex) ?? []
    if (matches.length > 0) {
      if (def.quality > 0.3) constructive += matches.length
      else if (def.quality < -0.1) destructive += matches.length
    }
  }

  const total = constructive + destructive
  if (total === 0) return 50
  return Math.round((constructive / total) * 100)
}

/**
 * Classify tuning based on resonance score.
 *
 * @example
 * classifyTuning(85) // => 'well-tuned'
 * classifyTuning(30) // => 'cacophonous'
 */
export function classifyTuning(resonanceScore: number): Tuning {
  if (resonanceScore >= 70) return 'well-tuned'
  if (resonanceScore >= 50) return 'slightly-off'
  if (resonanceScore >= 30) return 'dissonant'
  return 'cacophonous'
}

// ─── System Metrics ────────────────────────────────────────────────────────────

/**
 * Compute overall harmony across all profiles.
 *
 * @example
 * computeOverallHarmony(profiles) // => 72
 */
export function computeOverallHarmony(profiles: ResonanceProfile[]): number {
  if (profiles.length === 0) return 50
  return Math.round(profiles.reduce((s, p) => s + p.resonanceScore, 0) / profiles.length)
}

/**
 * Compute signal-to-noise ratio (constructive / destructive).
 *
 * @example
 * computeSignalToNoise(10, 3) // => 333
 */
export function computeSignalToNoise(constructive: number, destructive: number): number {
  if (destructive === 0) return constructive > 0 ? 999 : 0
  return Math.round((constructive / destructive) * 100)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate recommendations based on resonance analysis.
 *
 * @example
 * generateResonanceRecommendations(freqs, resonances, profiles, stats)
 * // => ['Break destructive resonance: any-type + explicit-type...']
 */
export function generateResonanceRecommendations(
  _frequencies: Frequency[],
  resonances: Resonance[],
  profiles: ResonanceProfile[],
  stats: ResonanceStats,
): string[] {
  const recs: string[] = []

  const destructive = resonances.filter(r => r.type === 'destructive')
  for (const d of destructive.slice(0, 3)) {
    recs.push(`Break destructive resonance: ${d.patterns.join(' + ')} — ${d.description}`)
  }

  const dissonantProfiles = profiles.filter(p => p.tuning === 'cacophonous' || p.tuning === 'dissonant')
  if (dissonantProfiles.length > 0) {
    recs.push(`${dissonantProfiles.length} file(s) are dissonant — standardize coding patterns`)
  }

  const dissonantRes = resonances.filter(r => r.type === 'dissonant')
  if (dissonantRes.length > 0) {
    recs.push(`${dissonantRes.length} dissonant pattern pair(s) detected — choose one style consistently`)
  }

  if (stats.signalToNoiseRatio < 200) {
    recs.push('Low signal-to-noise ratio — reduce destructive patterns (any types, mixed async styles)')
  }

  if (stats.overallHarmony < 50) {
    recs.push('Overall harmony is low — introduce constructive patterns (type annotations, error handling)')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the full resonance analysis result.
 *
 * @example
 * buildResonanceResult(files, contents, {})
 * // => { frequencies: [...], resonances: [...], profiles: [...], ... }
 */
export function buildResonanceResult(files: string[], contents: string[], _options: ResonanceOptions): ResonanceResult {
  // Aggregate frequencies across all files
  const freqMap = new Map<string, Frequency>()

  for (let i = 0; i < files.length; i++) {
    const fileFreqs = extractFrequencies(contents[i] ?? '',files[i] ?? '')
    for (const f of fileFreqs) {
      const key = `${f.category}:${f.pattern}`
      const existing = freqMap.get(key)
      if (existing) {
        existing.occurrences += f.occurrences
        if (!existing.files.includes(files[i] ?? '')) existing.files.push(files[i] ?? '')
      } else {
        freqMap.set(key, { ...f, files: [files[i] ?? ''] })
      }
    }
  }

  const totalOccurrences = Array.from(freqMap.values()).reduce((s, f) => s + f.occurrences, 0)

  const frequencies = Array.from(freqMap.values()).map(f => ({
    ...f,
    amplitude: computeAmplitude(f.occurrences, totalOccurrences),
    wavelength: computeWavelength(f.pattern, f.category),
  }))

  // Detect resonances
  const resonances = detectResonances(frequencies, files, contents)

  // Build profiles
  const profiles = files.map((file, i) => buildProfile(file, contents[i] ?? '', frequencies))

  // Stats
  const constructiveCount = resonances.filter(r => r.type === 'constructive').length
  const destructiveCount = resonances.filter(r => r.type === 'destructive').length
  const avgResonance = profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + p.resonanceScore, 0) / profiles.length) : 50
  const avgInterference = profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + p.interference, 0) / profiles.length) : 50

  const sortedByOcc = [...frequencies].sort((a, b) => b.occurrences - a.occurrences)
  const dominantFreq = sortedByOcc.length > 0 ? sortedByOcc[0]?.pattern : 'none'
  const rarestFreq = sortedByOcc.length > 0 ? sortedByOcc[sortedByOcc.length - 1]?.pattern : 'none'

  const sortedByScore = [...profiles].sort((a, b) => b.resonanceScore - a.resonanceScore)
  const mostHarmonious = sortedByScore.length > 0 ? sortedByScore[0]?.file : ''
  const mostDissonant = sortedByScore.length > 0 ? sortedByScore[sortedByScore.length - 1]?.file : ''

  const overallHarmony = computeOverallHarmony(profiles)
  const snr = computeSignalToNoise(constructiveCount, destructiveCount)

  const stats: ResonanceStats = {
    totalFrequencies: frequencies.length,
    constructiveResonances: constructiveCount,
    destructiveResonances: destructiveCount,
    avgResonanceScore: avgResonance,
    avgInterference,
    dominantFrequency: dominantFreq ?? '',
    rarestFrequency: rarestFreq ?? '',
    mostHarmoniousFile: mostHarmonious ?? '',
    mostDissonantFile: mostDissonant ?? '',
    overallHarmony,
    signalToNoiseRatio: snr,
  }

  const recommendations = generateResonanceRecommendations(frequencies, resonances, profiles, stats)

  return { frequencies, resonances, profiles, stats, recommendations }
}
