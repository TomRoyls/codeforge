// ─── Types ────────────────────────────────────────────────────────────────────

export type LineCategory = 'convention' | 'idiom' | 'keyword' | 'pattern' | 'syntax'

export interface SpectralLine {
  name: string
  category: LineCategory
  frequency: number
  wavelength: number
  intensity: number
  files: string[]
}

export interface SpectrumBand {
  name: string
  lines: SpectralLine[]
  totalIntensity: number
  dominantLine: string
}

export interface SpectralAnomaly {
  type: 'forbidden' | 'missing-expected' | 'outlier' | 'unexpected-spike'
  pattern: string
  expected: string
  actual: string
  severity: 'critical' | 'info' | 'warning'
  files: string[]
}

export interface SpectrumStats {
  totalLines: number
  dominantWavelength: string
  noisiestBand: string
  cleanestBand: string
  spectralPurity: number
  entropy: number
  uniquePatterns: number
  signalToNoise: number
}

export interface SpectrumResult {
  spectrum: SpectralLine[]
  bands: SpectrumBand[]
  stats: SpectrumStats
  anomalies: SpectralAnomaly[]
  recommendations: string[]
}

export interface SpectrumOptions {
  verbose?: boolean
}

// ─── Syntax Band ──────────────────────────────────────────────────────────────

/**
 * Analyze syntax constructs in content.
 *
 * @example
 * analyzeSyntaxBand(content, 'file.ts')
 */
export function analyzeSyntaxBand(content: string, file: string): SpectralLine[] {
  return [
    makeLine('arrow-functions', 'syntax', (content.match(/=>/g) ?? []).length, file),
    makeLine('function-declarations', 'syntax', (content.match(/\bfunction\s+\w+/g) ?? []).length, file),
    makeLine('classes', 'syntax', (content.match(/\bclass\s+\w+/g) ?? []).length, file),
    makeLine('object-literals', 'syntax', (content.match(/\{[^{}]*\}/g) ?? []).filter((m) => !m.includes('=>')).length, file),
    makeLine('array-literals', 'syntax', (content.match(/\[[^\]]*\]/g) ?? []).length, file),
    makeLine('template-literals', 'syntax', (content.match(/`[^`]*`/g) ?? []).length, file),
    makeLine('destructuring', 'syntax', (content.match(/(?:const|let|var)\s*\{[^}]*\}|(?:const|let|var)\s*\[[^\]]*\]/g) ?? []).length, file),
    makeLine('spread-operator', 'syntax', (content.match(/\.\.\./g) ?? []).length, file),
  ]
}

// ─── Keyword Band ─────────────────────────────────────────────────────────────

/**
 * Analyze keyword usage in content.
 *
 * @example
 * analyzeKeywordBand(content, 'file.ts')
 */
export function analyzeKeywordBand(content: string, file: string): SpectralLine[] {
  return [
    makeLine('async-await', 'keyword', (content.match(/\bawait\b/g) ?? []).length, file),
    makeLine('try-catch', 'keyword', (content.match(/\btry\s*\{/g) ?? []).length, file),
    makeLine('if-else', 'keyword', (content.match(/\bif\s*\(/g) ?? []).length, file),
    makeLine('switch', 'keyword', (content.match(/\bswitch\s*\(/g) ?? []).length, file),
    makeLine('for-loops', 'keyword', (content.match(/\bfor\s*\(/g) ?? []).length, file),
    makeLine('while-loops', 'keyword', (content.match(/\bwhile\s*\(/g) ?? []).length, file),
    makeLine('new-operator', 'keyword', (content.match(/\bnew\s+\w+/g) ?? []).length, file),
    makeLine('typeof', 'keyword', (content.match(/\btypeof\b/g) ?? []).length, file),
    makeLine('instanceof', 'keyword', (content.match(/\binstanceof\b/g) ?? []).length, file),
    makeLine('void', 'keyword', (content.match(/\bvoid\b/g) ?? []).length, file),
  ]
}

// ─── Pattern Band ─────────────────────────────────────────────────────────────

/**
 * Analyze design patterns in content.
 *
 * @example
 * analyzePatternBand(content, 'file.ts')
 */
export function analyzePatternBand(content: string, file: string): SpectralLine[] {
  const factoryCount = (content.match(/create\w*\s*\(|make\w*\s*\(|build\w*\s*\(/g) ?? []).length
  const singletonCount = (content.match(/(?:static\s+)?(?:instance|getInstance|shared)/g) ?? []).length
  const observerCount = (content.match(/(?:subscribe|on\(|emit|addEventListener|notify|listener)/g) ?? []).length
  const builderCount = (content.match(/\.with\w*\(|\.set\w*\(|\.add\w*\(/g) ?? []).length
  const strategyCount = (content.match(/strategy|policy|algorithm/g) ?? []).length
  const middlewareCount = (content.match(/middleware|next\s*\(\)|intercept/g) ?? []).length
  const decoratorCount = (content.match(/@\w+|decorate|wrapper/g) ?? []).length

  return [
    makeLine('factory', 'pattern', factoryCount, file),
    makeLine('singleton', 'pattern', singletonCount, file),
    makeLine('observer', 'pattern', observerCount, file),
    makeLine('builder', 'pattern', builderCount, file),
    makeLine('strategy', 'pattern', strategyCount, file),
    makeLine('middleware', 'pattern', middlewareCount, file),
    makeLine('decorator', 'pattern', decoratorCount, file),
  ]
}

// ─── Convention Band ──────────────────────────────────────────────────────────

/**
 * Analyze naming conventions in content.
 *
 * @example
 * analyzeConventionBand(content, 'file.ts')
 */
export function analyzeConventionBand(content: string, file: string): SpectralLine[] {
  const camelCase = (content.match(/\b[a-z]\w*[A-Z]\w*\b/g) ?? []).length
  const pascalCase = (content.match(/\b[A-Z]\w*[a-z]\w*\b/g) ?? []).length
  const upperSnake = (content.match(/\b[A-Z][A-Z0-9_]*[A-Z0-9]\b/g) ?? []).length
  const dotNotation = (content.match(/\w+\.\w+/g) ?? []).length
  const bracketNotation = (content.match(/\w+\[['"][^'"]+['"]\]/g) ?? []).length

  return [
    makeLine('camelCase', 'convention', camelCase, file),
    makeLine('PascalCase', 'convention', pascalCase, file),
    makeLine('UPPER_SNAKE', 'convention', upperSnake, file),
    makeLine('dot-notation', 'convention', dotNotation, file),
    makeLine('bracket-notation', 'convention', bracketNotation, file),
  ]
}

// ─── Idiom Band ───────────────────────────────────────────────────────────────

/**
 * Analyze code idioms in content.
 *
 * @example
 * analyzeIdiomBand(content, 'file.ts')
 */
export function analyzeIdiomBand(content: string, file: string): SpectralLine[] {
  return [
    makeLine('early-return', 'idiom', (content.match(/\breturn\s+(?:early|if\s+\w+\s*\))/g) ?? []).length + (content.match(/^\s*if\s*\([^)]+\)\s*return/gm) ?? []).length, file),
    makeLine('guard-clause', 'idiom', (content.match(/if\s*\([^)]+\)\s*\{\s*return/g) ?? []).length, file),
    makeLine('nullish-coalescing', 'idiom', (content.match(/\?\?/g) ?? []).length, file),
    makeLine('optional-chaining', 'idiom', (content.match(/\?\./g) ?? []).length, file),
    makeLine('null-check', 'idiom', (content.match(/!==?\s*(?:null|undefined)|(?:null|undefined)\s*!==?/g) ?? []).length, file),
    makeLine('default-params', 'idiom', (content.match(/\w+\s*=\s*[^,)]+(?:,|\))/g) ?? []).length, file),
  ]
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Create a spectral line.
 *
 * @example
 * makeLine('test', 'syntax', 5, 'a.ts')
 */
export function makeLine(name: string, category: LineCategory, frequency: number, file: string): SpectralLine {
  return { name, category, frequency, wavelength: 0, intensity: 0, files: frequency > 0 ? [file] : [] }
}

// ─── Spectral Lines ───────────────────────────────────────────────────────────

/**
 * Compute spectral lines from all bands across files.
 *
 * @example
 * computeSpectralLines(allRawLines)
 */
export function computeSpectralLines(allRawLines: SpectralLine[]): SpectralLine[] {
  const merged = new Map<string, SpectralLine>()

  for (const line of allRawLines) {
    const existing = merged.get(line.name)
    if (existing) {
      existing.frequency += line.frequency
      for (const f of line.files) {
        if (!existing.files.includes(f)) existing.files.push(f)
      }
    } else {
      merged.set(line.name, { ...line, files: [...line.files] })
    }
  }

  const maxFreq = Math.max(1, ...[...merged.values()].map((l) => l.frequency))

  let idx = 0
  const total = merged.size
  for (const line of merged.values()) {
    line.intensity = Math.round((line.frequency / maxFreq) * 100)
    line.wavelength = Math.round((idx / Math.max(1, total - 1)) * 100)
    idx++
  }

  return [...merged.values()].sort((a, b) => b.frequency - a.frequency)
}

// ─── Build Bands ──────────────────────────────────────────────────────────────

/**
 * Build spectrum bands from spectral lines.
 *
 * @example
 * buildBands(spectrum)
 */
export function buildBands(spectrum: SpectralLine[]): SpectrumBand[] {
  const bandNames: { category: LineCategory; name: string }[] = [
    { category: 'syntax', name: 'Syntax' },
    { category: 'keyword', name: 'Keywords' },
    { category: 'pattern', name: 'Patterns' },
    { category: 'convention', name: 'Conventions' },
    { category: 'idiom', name: 'Idioms' },
  ]

  return bandNames.map(({ category, name }) => {
    const lines = spectrum.filter((l) => l.category === category)
    const totalIntensity = lines.reduce((s, l) => s + l.intensity, 0)
    const dominant = lines.length > 0 ? [...lines].sort((a, b) => b.frequency - a.frequency)[0]!.name : 'N/A'
    return { name, lines, totalIntensity, dominantLine: dominant }
  })
}

// ─── Spectral Purity ──────────────────────────────────────────────────────────

/**
 * Compute spectral purity (consistency).
 *
 * @example
 * computeSpectralPurity(spectrum)
 */
export function computeSpectralPurity(spectrum: SpectralLine[]): number {
  if (spectrum.length === 0) return 100

  const frequencies = spectrum.map((l) => l.frequency)
  const mean = frequencies.reduce((s, f) => s + f, 0) / frequencies.length
  if (mean === 0) return 100

  const variance = frequencies.reduce((s, f) => s + Math.pow(f - mean, 2), 0) / frequencies.length
  const cv = Math.sqrt(variance) / mean

  return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)))
}

// ─── Spectral Entropy ─────────────────────────────────────────────────────────

/**
 * Compute Shannon entropy of the spectrum.
 *
 * @example
 * computeSpectralEntropy(spectrum)
 */
export function computeSpectralEntropy(spectrum: SpectralLine[]): number {
  const total = spectrum.reduce((s, l) => s + l.frequency, 0)
  if (total === 0) return 0

  let entropy = 0
  for (const line of spectrum) {
    if (line.frequency > 0) {
      const p = line.frequency / total
      entropy -= p * Math.log2(p)
    }
  }

  return Math.round(entropy * 100) / 100
}

// ─── Signal to Noise ──────────────────────────────────────────────────────────

/**
 * Compute signal-to-noise ratio.
 *
 * @example
 * computeSignalToNoise(spectrum)
 */
export function computeSignalToNoise(spectrum: SpectralLine[]): number {
  if (spectrum.length === 0) return 0

  const total = spectrum.reduce((s, l) => s + l.frequency, 0)
  if (total === 0) return 0

  const dominantFreq = spectrum[0]!.frequency
  const signal = dominantFreq / total
  const noise = 1 - signal

  return Math.round((signal / Math.max(0.001, noise)) * 100) / 100
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────

/**
 * Detect spectral anomalies.
 *
 * @example
 * detectAnomalies(spectrum, files, contents)
 */
export function detectAnomalies(spectrum: SpectralLine[], files: string[], contents: string[]): SpectralAnomaly[] {
  const anomalies: SpectralAnomaly[] = []

  for (const line of spectrum) {
    if (line.frequency > 0 && line.intensity === 100 && line.frequency > 50) {
      anomalies.push({
        type: 'unexpected-spike',
        pattern: line.name,
        expected: 'moderate usage',
        actual: `${line.frequency} occurrences (intensity 100)`,
        severity: 'warning',
        files: line.files.slice(0, 5),
      })
    }
  }

  const expectedPatterns = ['camelCase', 'PascalCase', 'if-else', 'function-declarations']
  for (const expected of expectedPatterns) {
    const found = spectrum.find((l) => l.name === expected)
    if (!found || found.frequency === 0) {
      anomalies.push({
        type: 'missing-expected',
        pattern: expected,
        expected: 'present in codebase',
        actual: 'not found or zero occurrences',
        severity: 'info',
        files: [],
      })
    }
  }

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    if (/\beval\s*\(/.test(content)) {
      anomalies.push({
        type: 'forbidden',
        pattern: 'eval()',
        expected: 'not used',
        actual: 'eval() detected',
        severity: 'critical',
        files: [files[i]!],
      })
    }
    if (/\bas\s+any\b/.test(content)) {
      anomalies.push({
        type: 'forbidden',
        pattern: 'as any',
        expected: 'type-safe code',
        actual: 'type assertion to any',
        severity: 'warning',
        files: [files[i]!],
      })
    }
  }

  return anomalies
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations.
 *
 * @example
 * generateRecommendations(spectrum, anomalies, stats)
 */
export function generateRecommendations(
  spectrum: SpectralLine[],
  anomalies: SpectralAnomaly[],
  stats: SpectrumStats,
): string[] {
  const recs: string[] = []

  if (stats.spectralPurity < 40) {
    recs.push('Low spectral purity — codebase uses patterns very inconsistently, consider standardizing')
  }

  const forbidden = anomalies.filter((a) => a.type === 'forbidden')
  if (forbidden.length > 0) {
    recs.push(`${forbidden.length} forbidden pattern(s) detected — remove eval(), as any, or other anti-patterns`)
  }

  const missing = anomalies.filter((a) => a.type === 'missing-expected')
  if (missing.length > 0) {
    recs.push(`${missing.length} expected pattern(s) missing — consider adopting common practices`)
  }

  const spikes = anomalies.filter((a) => a.type === 'unexpected-spike')
  if (spikes.length > 0) {
    recs.push(`${spikes.length} pattern spike(s) detected — review for overuse`)
  }

  if (stats.entropy > 4) {
    recs.push('High spectral entropy — many patterns at similar frequencies, consider focusing on fewer patterns')
  }

  if (stats.signalToNoise > 5) {
    recs.push('High signal-to-noise — one pattern dominates strongly, consider diversifying')
  }

  if (recs.length === 0) {
    recs.push('Spectrum looks clean — codebase has consistent pattern usage')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete spectrometer result.
 *
 * @example
 * buildSpectrumResult(files, contents)
 */
export function buildSpectrumResult(
  files: string[],
  contents: string[],
  _options?: SpectrumOptions,
): SpectrumResult {
  const allRawLines: SpectralLine[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    allRawLines.push(...analyzeSyntaxBand(content, file))
    allRawLines.push(...analyzeKeywordBand(content, file))
    allRawLines.push(...analyzePatternBand(content, file))
    allRawLines.push(...analyzeConventionBand(content, file))
    allRawLines.push(...analyzeIdiomBand(content, file))
  }

  const spectrum = computeSpectralLines(allRawLines)
  const bands = buildBands(spectrum)
  const anomalies = detectAnomalies(spectrum, files, contents)

  const spectralPurity = computeSpectralPurity(spectrum)
  const entropy = computeSpectralEntropy(spectrum)
  const signalToNoise = computeSignalToNoise(spectrum)
  const uniquePatterns = spectrum.filter((l) => l.frequency > 0).length

  const dominantWavelength = spectrum.length > 0 ? spectrum[0]!.name : 'N/A'
  const noisiest = [...bands].sort((a, b) => b.lines.length - a.lines.length)[0]?.name ?? 'N/A'
  const cleanest = [...bands].filter((b) => b.lines.length > 0).sort((a, b) => a.lines.length - b.lines.length)[0]?.name ?? 'N/A'

  const stats: SpectrumStats = {
    totalLines: spectrum.reduce((s, l) => s + l.frequency, 0),
    dominantWavelength,
    noisiestBand: noisiest,
    cleanestBand: cleanest,
    spectralPurity,
    entropy,
    uniquePatterns,
    signalToNoise,
  }

  const recommendations = generateRecommendations(spectrum, anomalies, stats)

  return { spectrum, bands, stats, anomalies, recommendations }
}
