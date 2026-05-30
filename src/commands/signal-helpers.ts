// ─── Types ─────────────────────────────────────────────────────────────────────

export type NoiseType = 'boilerplate' | 'restatement-comment' | 'dead-code' | 'redundant-pattern' | 'unnecessary-complexity' | 'over-documentation' | 'debug-residue' | 'duplicate-logic' | 'import-bloat' | 'verbose-syntax'

export type SignalCategory = 'high-fidelity' | 'clear' | 'moderate' | 'noisy' | 'static'

export type BandType = 'logic' | 'data-definition' | 'io' | 'control-flow' | 'error-handling' | 'validation' | 'configuration'

export type OverallClarity = 'crystal-clear' | 'clear' | 'acceptable' | 'noisy' | 'static'

export interface NoiseSource {
  type: NoiseType
  lines: number
  percentage: number
  locations: number[]
  description: string
  autoFixable: boolean
  suggestion: string
}

export interface SignalAnalysis {
  file: string
  totalLines: number
  signalLines: number
  noiseLines: number
  snr: number
  noiseSources: NoiseSource[]
  bandwidth: number
  clarity: number
  category: SignalCategory
}

export interface SignalBand {
  type: BandType
  strength: number
  frequency: number
  clarity: number
  noiseInterference: number
}

export interface SignalFile {
  file: string
  analysis: SignalAnalysis
  bands: SignalBand[]
}

export interface SignalStats {
  totalLines: number
  totalSignal: number
  totalNoise: number
  avgSNR: number
  avgBandwidth: number
  highFidelityFiles: number
  noisyFiles: number
  staticFiles: number
  totalNoiseSources: number
  boilerplateLines: number
  deadCodeLines: number
  redundantLines: number
  overDocLines: number
  debugResidueLines: number
  importBloatLines: number
  autoFixableLines: number
  dominantNoiseType: string
  dominantSignalType: string
  overallSNR: number
  overallBandwidth: number
  overallClarity: OverallClarity
  noiseReduction: number
}

export interface SignalResult {
  files: SignalFile[]
  stats: SignalStats
  recommendations: string[]
}

export interface SignalOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Line Classification ───────────────────────────────────────────────────────

/**
 * Classify a single line as signal or noise type.
 *
 * @example
 * classifyLine('console.log("debug")', []) // => 'debug-residue'
 */
export function classifyLine(line: string, _context: string[]): NoiseType | 'signal' {
  const trimmed = line.trim()

  if (trimmed.length === 0) return 'signal'

  if (/^console\.\w+\(/.test(trimmed)) return 'debug-residue'
  if (/^debugger;?\s*$/.test(trimmed)) return 'debug-residue'
  if (/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/i.test(trimmed)) return 'debug-residue'

  if (/^import\s/.test(trimmed)) {
    return 'signal'
  }

  if (/^\*\s/.test(trimmed) || /^\/\*\*/.test(trimmed) || /^\*\//.test(trimmed) || /^\/\*/.test(trimmed)) {
    if (/^\s*\*\s*(@param|@returns?|@throws?|@example|@see|@deprecated)/.test(line)) return 'signal'
    const codeAfterComment = trimmed.replace(/^\/\/+\s*/, '').replace(/^\*\s*/, '')
    const nextLine = _context.length > 0 ? _context[0] : ''
    const nextTrimmed = nextLine?.trim()
    if ((nextTrimmed?.length ?? 0) > 0 && codeAfterComment.length > 0) {
      const commentWords = codeAfterComment.toLowerCase().split(/\s+/).filter(w => w.length > 2)
      const codeWords = nextTrimmed?.toLowerCase().replace(/[{}()=;,.<>[\]]/g, ' ').split(/\s+/).filter(w => w.length > 2)
      const overlap = commentWords.filter(w => codeWords?.includes(w)).length
      if (overlap >= 2 && commentWords.length <= 5) return 'restatement-comment'
    }
    return 'signal'
  }

  if (trimmed.startsWith('//')) {
    const commentText = trimmed.replace(/^\/\/+\s*/, '')
    const nextLine = _context.length > 0 ? _context[0] : ''
    const nextTrimmed = nextLine?.trim()
    if ((nextTrimmed?.length ?? 0) > 0 && commentText.length > 0) {
      const commentWords = commentText.toLowerCase().split(/\s+/).filter(w => w.length > 2)
      const codeWords = nextTrimmed?.toLowerCase().replace(/[{}()=;,.<>[\]]/g, ' ').split(/\s+/).filter(w => w.length > 2)
      const overlap = commentWords.filter(w => codeWords?.includes(w)).length
      if (overlap >= 2 && commentWords.length <= 5) return 'restatement-comment'
    }
    return 'signal'
  }

  if (/^export\s+default\s+/.test(trimmed) && /{\s*}\s*$/.test(trimmed)) return 'boilerplate'

  if (/^\/\/\s*\/\/\s*\/{3,}/.test(trimmed)) return 'over-documentation'

  return 'signal'
}

// ─── Noise Detection ───────────────────────────────────────────────────────────

/**
 * Detect all noise sources in content.
 *
 * @example
 * detectNoiseSources('console.log("x")') // => [NoiseSource]
 */
export function detectNoiseSources(content: string): NoiseSource[] {
  const sources: NoiseSource[] = []
  if (content.trim().length === 0) return sources

  const lines = content.split('\n')
  const nonBlankLines = lines.filter(l => l.trim().length > 0)
  const totalNonBlank = nonBlankLines.length

  const debugLines: number[] = []
  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim()
    if (/^console\.\w+\(/.test(trimmed) || /^debugger;?\s*$/.test(trimmed) || /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/i.test(trimmed)) {
      debugLines.push(i + 1)
    }
  }
  if (debugLines.length > 0) {
    sources.push({
      type: 'debug-residue',
      lines: debugLines.length,
      percentage: Math.round((debugLines.length / totalNonBlank) * 100),
      locations: debugLines,
      description: `${debugLines.length} debug statement${debugLines.length > 1 ? 's' : ''} left in code`,
      autoFixable: true,
      suggestion: 'Remove debug statements before committing',
    })
  }

  const boilerplateLines: number[] = []
  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim()
    if (/^export\s+default\s+\{\s*\}\s*;?\s*$/.test(trimmed)) boilerplateLines.push(i + 1)
    if (/^Object\.defineProperty\(exports,\s*['__"]__esModule['__"]/.test(trimmed)) boilerplateLines.push(i + 1)
    if (/^(['"])use strict\1;?\s*$/.test(trimmed)) boilerplateLines.push(i + 1)
  }
  if (boilerplateLines.length > 0) {
    sources.push({
      type: 'boilerplate',
      lines: boilerplateLines.length,
      percentage: Math.round((boilerplateLines.length / totalNonBlank) * 100),
      locations: boilerplateLines,
      description: `${boilerplateLines.length} boilerplate line${boilerplateLines.length > 1 ? 's' : ''}`,
      autoFixable: false,
      suggestion: 'Consider if boilerplate can be auto-generated or removed',
    })
  }

  const redundantLines: number[] = []
  for (let i = 0; i < lines.length - 2; i++) {
    const cur = (lines[i] ?? '').trim()
    const next = (lines[i + 1] ?? '').trim()
    const nextNext = lines[i + 2]?.trim() ?? ''
    if (/^if\s*\(.+\)\s*\{?\s*$/.test(cur) && /^\s*return\s+true;?\s*$/.test(next) && /^\s*\}\s*else\s*\{\s*$/.test(nextNext)) {
      if (i + 3 < lines.length && /^\s*return\s+false;?\s*$/.test(lines[i + 3]?.trim() ?? '')) {
        redundantLines.push(i + 1, i + 2, i + 3, i + 4)
      }
    }
    if (/^if\s*\(.+\)\s*\{\s*$/.test(cur) && /^\s*return\s+true;?\s*$/.test(next) && /^\s*\}\s*$/.test(nextNext)) {
      redundantLines.push(i + 1, i + 2, i + 3)
    }
    if (/^(const|let|var)\s+\w+\s*=\s*function\s*\(/.test(cur)) {
      redundantLines.push(i + 1)
    }
  }
  if (redundantLines.length > 0) {
    const unique = [...new Set(redundantLines)]
    sources.push({
      type: 'redundant-pattern',
      lines: unique.length,
      percentage: Math.round((unique.length / totalNonBlank) * 100),
      locations: unique,
      description: `${unique.length} line${unique.length > 1 ? 's' : ''} with redundant patterns`,
      autoFixable: true,
      suggestion: 'Simplify redundant patterns (e.g., use arrow functions, ternary returns)',
    })
  }

  const verboseLines: number[] = []
  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim()
    if (/^(const|let|var)\s+\w+\s*=\s*function\s*\(/.test(trimmed)) verboseLines.push(i + 1)
    if (/^\w+\s*=\s*\w+\s*\?\s*true\s*:\s*false/.test(trimmed)) verboseLines.push(i + 1)
  }
  if (verboseLines.length > 0) {
    sources.push({
      type: 'verbose-syntax',
      lines: verboseLines.length,
      percentage: Math.round((verboseLines.length / totalNonBlank) * 100),
      locations: verboseLines,
      description: `${verboseLines.length} verbose syntax line${verboseLines.length > 1 ? 's' : ''}`,
      autoFixable: true,
      suggestion: 'Use concise syntax (arrow functions, direct boolean expressions)',
    })
  }

  const deadLines: number[] = []
  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim()
    if (/^return\s+/.test(trimmed) && i + 1 < lines.length) {
      let j = i + 1
      while (j < lines.length && (lines[j] ?? '').trim().length === 0) j++
      if (j < lines.length && /^\}/.test((lines[j] ?? '').trim())) {
        continue
      }
      if (j < lines.length && (lines[j] ?? '').trim().length > 0) {
        let afterReturn = false
        for (let k = i + 1; k < lines.length; k++) {
          const t = (lines[k] ?? '').trim()
          if (t.length === 0) continue
          if (/^\}/.test(t)) break
          if (!afterReturn && !/^\}/.test(t)) {
            deadLines.push(k + 1)
            afterReturn = true
          }
        }
      }
    }
  }
  if (deadLines.length > 0) {
    sources.push({
      type: 'dead-code',
      lines: deadLines.length,
      percentage: Math.round((deadLines.length / totalNonBlank) * 100),
      locations: deadLines,
      description: `${deadLines.length} unreachable line${deadLines.length > 1 ? 's' : ''} after return`,
      autoFixable: true,
      suggestion: 'Remove unreachable code after return statements',
    })
  }

  return sources
}

// ─── SNR ───────────────────────────────────────────────────────────────────────

/**
 * Compute signal-to-noise ratio 0-100.
 *
 * @example
 * computeSNR(80, 20) // => 80
 */
export function computeSNR(signalLines: number, noiseLines: number): number {
  const total = signalLines + noiseLines
  if (total === 0) return 100
  return Math.max(0, Math.min(100, Math.round((signalLines / total) * 100)))
}

// ─── Bandwidth ─────────────────────────────────────────────────────────────────

/**
 * Compute bandwidth (useful logic density) 0-100.
 *
 * @example
 * computeBandwidth('const x = 1 + 2', 1) // => 80
 */
export function computeBandwidth(content: string, signalLines: number): number {
  const lines = content.split('\n')
  const nonBlank = lines.filter(l => l.trim().length > 0).length
  if (nonBlank === 0) return 100

  const logicLines = lines.filter(l => {
    const t = l.trim()
    if (t.length === 0) return false
    if (/^\/\//.test(t)) return false
    if (/^\*\s/.test(t) || /^\/\*/.test(t) || /^\*\//.test(t)) return false
    if (/^import\s/.test(t) || /^export\s+default/.test(t)) return false
    return true
  }).length

  const density = logicLines > 0 ? (signalLines / logicLines) : 1
  return Math.max(0, Math.min(100, Math.round(density * 100)))
}

// ─── Signal Bands ──────────────────────────────────────────────────────────────

/**
 * Analyze signal bands in content.
 *
 * @example
 * analyzeSignalBands(content) // => SignalBand[]
 */
export function analyzeSignalBands(content: string): SignalBand[] {
  const lines = content.split('\n')
  const bands: Record<BandType, { count: number; clear: number }> = {
    'logic': { count: 0, clear: 0 },
    'data-definition': { count: 0, clear: 0 },
    'io': { count: 0, clear: 0 },
    'control-flow': { count: 0, clear: 0 },
    'error-handling': { count: 0, clear: 0 },
    'validation': { count: 0, clear: 0 },
    'configuration': { count: 0, clear: 0 },
  }

  for (const line of lines) {
    const t = line.trim()
    if (t.length === 0) continue

    if (/^import\s/.test(t) || /^export\s+(const|let|var|type|interface|enum)\s/.test(t)) {
      bands['data-definition'].count++
      bands['data-definition'].clear++
    }

    if (/\bif\s*\(/.test(t) || /\belse\b/.test(t) || /\bswitch\b/.test(t) || /\bcase\b/.test(t) || /\bfor\s*\(/.test(t) || /\bwhile\s*\(/.test(t)) {
      bands['control-flow'].count++
      bands['control-flow'].clear++
    }

    if (/try\s*\{|catch\s*\(|finally\s*\{|throw\s+/.test(t)) {
      bands['error-handling'].count++
      bands['error-handling'].clear++
    }

    if (/console\.\w+|readFile|writeFile|fetch\(|\.read\(|\.write\(/.test(t)) {
      bands['io'].count++
      if (!/console\.\w+/.test(t)) bands['io'].clear++
    }

    if (/^\s*(const|let|var|function|class|interface|type|enum)\s/.test(t) || /^export\s/.test(t)) {
      bands['logic'].count++
      bands['logic'].clear++
    }

    if (/\.test\(|\.match\(|typeof\s|instanceof\s|===|!==|>=|<=/.test(t)) {
      bands['validation'].count++
      bands['validation'].clear++
    }

    if (/^\/\/\s*@(config|setting|option)|process\.env\.|CONFIG|SETTINGS/.test(t)) {
      bands['configuration'].count++
      bands['configuration'].clear++
    }
  }

  const totalLines = lines.filter(l => l.trim().length > 0).length
  const result: SignalBand[] = []

  for (const [type, data] of Object.entries(bands)) {
    if (data.count > 0) {
      result.push({
        type: type as BandType,
        strength: Math.min(100, Math.round((data.count / Math.max(totalLines, 1)) * 100 * 5)),
        frequency: data.count,
        clarity: Math.min(100, Math.round((data.clear / data.count) * 100)),
        noiseInterference: Math.max(0, 100 - Math.round((data.clear / data.count) * 100)),
      })
    }
  }

  return result
}

// ─── Classification ────────────────────────────────────────────────────────────

/**
 * Classify signal analysis category.
 *
 * @example
 * classifyAnalysis(85, 80) // => 'high-fidelity'
 */
export function classifyAnalysis(snr: number, bandwidth: number): SignalCategory {
  const composite = (snr + bandwidth) / 2
  if (composite >= 85) return 'high-fidelity'
  if (composite >= 70) return 'clear'
  if (composite >= 50) return 'moderate'
  if (composite >= 30) return 'noisy'
  return 'static'
}

/**
 * Classify overall clarity.
 *
 * @example
 * classifyOverallClarity(90, 85) // => 'crystal-clear'
 */
export function classifyOverallClarity(snr: number, bandwidth: number): OverallClarity {
  const composite = (snr + bandwidth) / 2
  if (composite >= 85) return 'crystal-clear'
  if (composite >= 70) return 'clear'
  if (composite >= 50) return 'acceptable'
  if (composite >= 30) return 'noisy'
  return 'static'
}

// ─── Noise Reduction ───────────────────────────────────────────────────────────

/**
 * Compute estimated noise reduction percentage.
 *
 * @example
 * computeNoiseReduction(sources) // => 45
 */
export function computeNoiseReduction(sources: NoiseSource[]): number {
  if (sources.length === 0) return 0
  const totalLines = sources.reduce((s, n) => s + n.lines, 0)
  const autoFixableLines = sources.filter(s => s.autoFixable).reduce((s, n) => s + n.lines, 0)
  if (totalLines === 0) return 0
  return Math.round((autoFixableLines / totalLines) * 100)
}

// ─── Analyze File Signal ───────────────────────────────────────────────────────

/**
 * Analyze signal-to-noise for a single file.
 *
 * @example
 * analyzeFileSignal(content, 'file.ts') // => SignalAnalysis
 */
export function analyzeFileSignal(content: string, filePath: string): SignalAnalysis {
  if (content.trim().length === 0) {
    return {
      file: filePath,
      totalLines: 0,
      signalLines: 0,
      noiseLines: 0,
      snr: 100,
      noiseSources: [],
      bandwidth: 100,
      clarity: 100,
      category: 'high-fidelity',
    }
  }

  const lines = content.split('\n')
  const nonBlank = lines.filter(l => l.trim().length > 0)
  const totalLines = nonBlank.length

  let signalLines = 0
  let noiseLines = 0

  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim()
    if (trimmed.length === 0) continue

    const context = i + 1 < lines.length ? [(lines[i + 1] ?? '')] : []
    const classification = classifyLine(trimmed, context)

    if (classification === 'signal') {
      signalLines++
    } else {
      noiseLines++
    }
  }

  const snr = computeSNR(signalLines, noiseLines)
  const noiseSources = detectNoiseSources(content)
  const bandwidth = computeBandwidth(content, signalLines)
  const clarity = Math.round((snr * 0.6) + (bandwidth * 0.4))
  const category = classifyAnalysis(snr, bandwidth)

  return {
    file: filePath,
    totalLines,
    signalLines,
    noiseLines,
    snr,
    noiseSources,
    bandwidth,
    clarity,
    category,
  }
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate signal-to-noise recommendations.
 *
 * @example
 * generateSignalRecommendations(files, sources, stats) // => ['Remove...']
 */
export function generateSignalRecommendations(
  files: SignalFile[],
  sources: NoiseSource[],
  stats: SignalStats,
): string[] {
  const recs: string[] = []

  const debugResidue = sources.filter(s => s.type === 'debug-residue')
  if (debugResidue.length > 0) {
    const totalLines = debugResidue.reduce((s, n) => s + n.lines, 0)
    recs.push(`Remove ${totalLines} debug statement${totalLines > 1 ? 's' : ''} (console.log, debugger)`)
  }

  const redundant = sources.filter(s => s.type === 'redundant-pattern')
  if (redundant.length > 0) {
    recs.push('Simplify redundant patterns — use ternary returns, arrow functions')
  }

  const verbose = sources.filter(s => s.type === 'verbose-syntax')
  if (verbose.length > 0) {
    recs.push('Replace verbose syntax with concise alternatives')
  }

  const deadCode = sources.filter(s => s.type === 'dead-code')
  if (deadCode.length > 0) {
    recs.push(`Remove ${deadCode.reduce((s, n) => s + n.lines, 0)} unreachable line${deadCode.reduce((s, n) => s + n.lines, 0) > 1 ? 's' : ''} after return statements`)
  }

  const boilerplate = sources.filter(s => s.type === 'boilerplate')
  if (boilerplate.length > 0) {
    recs.push('Extract boilerplate into shared utilities or code generation')
  }

  const noisyFiles = files.filter(f => f.analysis.category === 'noisy' || f.analysis.category === 'static')
  if (noisyFiles.length > 0) {
    recs.push(`Review ${noisyFiles.length} noisy file${noisyFiles.length > 1 ? 's' : ''} for signal improvement`)
  }

  if (stats.overallSNR < 50) {
    recs.push('Overall SNR is below 50 — consider a focused noise reduction pass')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete signal analysis result.
 *
 * @example
 * buildSignalResult(['a.ts'], ['code'], {}) // => SignalResult
 */
export function buildSignalResult(files: string[], contents: string[], options: SignalOptions): SignalResult {
  const signalFiles: SignalFile[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const analysis = analyzeFileSignal(content, files[i] ?? '')
    const bands = analyzeSignalBands(content)

    signalFiles.push({ file: files[i] ?? '', analysis, bands })
  }

  const allNoiseSources = signalFiles.flatMap(f => f.analysis.noiseSources)
  const totalLines = signalFiles.reduce((s, f) => s + f.analysis.totalLines, 0)
  const totalSignal = signalFiles.reduce((s, f) => s + f.analysis.signalLines, 0)
  const totalNoise = signalFiles.reduce((s, f) => s + f.analysis.noiseLines, 0)
  const avgSNR = signalFiles.length > 0
    ? Math.round(signalFiles.reduce((s, f) => s + f.analysis.snr, 0) / signalFiles.length) : 100
  const avgBandwidth = signalFiles.length > 0
    ? Math.round(signalFiles.reduce((s, f) => s + f.analysis.bandwidth, 0) / signalFiles.length) : 100

  const highFidelityFiles = signalFiles.filter(f => f.analysis.category === 'high-fidelity').length
  const noisyFiles = signalFiles.filter(f => f.analysis.category === 'noisy').length
  const staticFiles = signalFiles.filter(f => f.analysis.category === 'static').length

  const overallSNR = totalLines > 0 ? Math.round((totalSignal / totalLines) * 100) : 100
  const overallBandwidth = avgBandwidth

  const noiseByType: Record<string, number> = {}
  for (const ns of allNoiseSources) {
    noiseByType[ns.type] = (noiseByType[ns.type] ?? 0) + ns.lines
  }
  const dominantNoiseType = Object.entries(noiseByType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none'

  const allBands = signalFiles.flatMap(f => f.bands)
  const bandByFreq: Record<string, number> = {}
  for (const b of allBands) {
    bandByFreq[b.type] = (bandByFreq[b.type] ?? 0) + b.frequency
  }
  const dominantSignalType = Object.entries(bandByFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'logic'

  const noiseReduction = computeNoiseReduction(allNoiseSources)
  const overallClarity = classifyOverallClarity(overallSNR, overallBandwidth)

  if (options.verbose) {
    // Verbose includes additional detail
  }

  const stats: SignalStats = {
    totalLines,
    totalSignal,
    totalNoise,
    avgSNR,
    avgBandwidth,
    highFidelityFiles,
    noisyFiles,
    staticFiles,
    totalNoiseSources: allNoiseSources.length,
    boilerplateLines: noiseByType['boilerplate'] ?? 0,
    deadCodeLines: noiseByType['dead-code'] ?? 0,
    redundantLines: noiseByType['redundant-pattern'] ?? 0,
    overDocLines: noiseByType['over-documentation'] ?? 0,
    debugResidueLines: noiseByType['debug-residue'] ?? 0,
    importBloatLines: noiseByType['import-bloat'] ?? 0,
    autoFixableLines: allNoiseSources.filter(s => s.autoFixable).reduce((s, n) => s + n.lines, 0),
    dominantNoiseType,
    dominantSignalType,
    overallSNR,
    overallBandwidth,
    overallClarity,
    noiseReduction,
  }

  const recommendations = generateSignalRecommendations(signalFiles, allNoiseSources, stats)

  return { files: signalFiles, stats, recommendations }
}
