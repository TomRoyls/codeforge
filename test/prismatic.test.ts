import { describe, expect, it } from 'vitest'

import {
  assignWavelength,
  buildPrismaticResult,
  classifyOverallClarity,
  classifyRefractionSeverity,
  computeConcernOverlap,
  computeIntensity,
  computeSeparationIndex,
  computeSeparationScore,
  computeSpectralPurity,
  computeSpectrumCompleteness,
  detectConcerns,
  findRefractionPoints,
  generateRecommendations,
  getConcernColor,
  type ConcernName,
  type PrismaticOptions,
  type PrismaticResult,
  type PrismaticStats,
  type RefractionPoint,
  type SpectralBand,
  type SpectralFile,
} from '../src/commands/prismatic-helpers.js'

import {
  formatClarity,
  formatConcern,
  formatFileAnalysis,
  formatPrismaticJson,
  formatPrismaticStats,
  formatPrismaticTable,
  formatRecommendations,
  formatRefractionPoints,
  formatSeparationGauge,
  formatSeverityBadge,
  formatSpectrumBands,
} from '../src/commands/prismatic-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const IO_CONTENT = `import { readFile } from 'fs'
import { resolve } from 'path'

export function loadConfig(path: string) {
  const content = readFile(path, 'utf8')
  return content
}
`

const LOGIC_CONTENT = `export function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

export function sortByScore(items: Item[]): Item[] {
  return items.sort((a, b) => b.score - a.score)
}
`

const MIXED_CONTENT = `import { readFile } from 'fs'
import chalk from 'chalk'

export function processData(path: string) {
  try {
    const data = readFile(path, 'utf8')
    console.log('Processing:', data)
    const result = JSON.parse(data)
    if (!result.id) throw new Error('Missing id')
    return result
  } catch (err) {
    console.error(chalk.red(err.message))
    return null
  }
}
`

const PURE_DATA_CONTENT = `export interface User {
  id: string
  name: string
  email: string
}

export interface Settings {
  enabled: boolean
  port: number
}

export type Result = {
  success: boolean
  data: User
}
`

const TEST_CONTENT = `import { describe, expect, it } from 'vitest'

describe('math', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2)
  })

  it('validates input', () => {
    const mock = vi.fn()
    mock('test')
    expect(mock).toHaveBeenCalled()
  })
})
`

const CONFIG_CONTENT = `export function getEnv(key: string): string {
  return process.env[key] ?? ''
}

export const settings = {
  debug: getEnv('DEBUG') === 'true',
  port: parseInt(getEnv('PORT') ?? '3000'),
}
`

const ERROR_CONTENT = `export class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message)
  }
}

export function handleError(err: unknown) {
  if (err instanceof Error) {
    throw new AppError(err.message, 'UNKNOWN')
  }
}
`

const ALL_CONCERNS_CONTENT = `import { readFile } from 'fs'
import chalk from 'chalk'

const config = process.env.CONFIG
console.log('Starting...')

export function run() {
  try {
    const data = readFile(config, 'utf8')
    const result = JSON.parse(data)
    if (!result.valid) throw new Error('Invalid')
    const computed = result.items.filter(x => x.active).map(x => x.value)
    console.log(chalk.green(computed))
    return { success: true, data: computed }
  } catch (err) {
    console.error(err)
    return null
  }
}

describe('run', () => {
  it('works', () => { expect(true).toBe(true) })
})
`

// ─── detectConcerns ────────────────────────────────────────────────────────────

describe('detectConcerns', () => {
  it('detects io concern', () => {
    const concerns = detectConcerns(IO_CONTENT, 'io.ts')
    expect(concerns).toContain('io')
  })

  it('detects logic concern', () => {
    const concerns = detectConcerns(LOGIC_CONTENT, 'logic.ts')
    expect(concerns).toContain('logic')
  })

  it('detects data concern', () => {
    const concerns = detectConcerns(PURE_DATA_CONTENT, 'types.ts')
    expect(concerns).toContain('data')
  })

  it('detects config concern', () => {
    const concerns = detectConcerns(CONFIG_CONTENT, 'config.ts')
    expect(concerns).toContain('config')
  })

  it('detects error concern', () => {
    const concerns = detectConcerns(ERROR_CONTENT, 'errors.ts')
    expect(concerns).toContain('error')
  })

  it('detects testing concern', () => {
    const concerns = detectConcerns(TEST_CONTENT, 'test.ts')
    expect(concerns).toContain('testing')
  })

  it('detects multiple concerns in mixed code', () => {
    const concerns = detectConcerns(MIXED_CONTENT, 'mixed.ts')
    expect(concerns.length).toBeGreaterThanOrEqual(2)
  })

  it('detects all concerns in complex code', () => {
    const concerns = detectConcerns(ALL_CONCERNS_CONTENT, 'all.ts')
    expect(concerns.length).toBeGreaterThanOrEqual(5)
  })

  it('returns empty for empty content', () => {
    expect(detectConcerns(EMPTY_CONTENT, 'empty.ts')).toEqual([])
  })
})

// ─── assignWavelength ──────────────────────────────────────────────────────────

describe('assignWavelength', () => {
  it('returns 380 for io', () => {
    expect(assignWavelength('io')).toBe(380)
  })

  it('returns 540 for logic', () => {
    expect(assignWavelength('logic')).toBe(540)
  })

  it('returns 740 for testing', () => {
    expect(assignWavelength('testing')).toBe(740)
  })

  it('returns wavelength in visible range', () => {
    const concerns: ConcernName[] = ['io', 'config', 'error', 'validation', 'logic', 'data', 'auth', 'logging', 'ui', 'testing']
    for (const c of concerns) {
      const wl = assignWavelength(c)
      expect(wl).toBeGreaterThanOrEqual(380)
      expect(wl).toBeLessThanOrEqual(780)
    }
  })
})

// ─── getConcernColor ───────────────────────────────────────────────────────────

describe('getConcernColor', () => {
  it('returns violet for io', () => {
    expect(getConcernColor('io')).toBe('violet')
  })

  it('returns green for logic', () => {
    expect(getConcernColor('logic')).toBe('green')
  })

  it('returns deep-red for testing', () => {
    expect(getConcernColor('testing')).toBe('deep-red')
  })
})

// ─── computeIntensity ──────────────────────────────────────────────────────────

describe('computeIntensity', () => {
  it('returns 0 for no match', () => {
    expect(computeIntensity('const x = 1', 'io')).toBe(0)
  })

  it('returns positive for matching content', () => {
    expect(computeIntensity(IO_CONTENT, 'io')).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    const lotsOfIO = Array(20).fill('readFile("x")').join('\n')
    expect(computeIntensity(lotsOfIO, 'io')).toBeLessThanOrEqual(100)
  })
})

// ─── computeSpectralPurity ─────────────────────────────────────────────────────

describe('computeSpectralPurity', () => {
  it('returns 100 for single concern', () => {
    expect(computeSpectralPurity(['io'])).toBe(100)
  })

  it('returns 100 for empty concerns', () => {
    expect(computeSpectralPurity([])).toBe(100)
  })

  it('deducts for multiple concerns', () => {
    expect(computeSpectralPurity(['io', 'ui'])).toBeLessThan(100)
  })

  it('deducts less for related concerns', () => {
    const related = computeSpectralPurity(['io', 'config'])
    const unrelated = computeSpectralPurity(['io', 'ui'])
    expect(related).toBeGreaterThan(unrelated)
  })

  it('deducts more for many concerns', () => {
    expect(computeSpectralPurity(['io', 'ui', 'auth', 'testing'])).toBeLessThan(
      computeSpectralPurity(['io', 'config']),
    )
  })
})

// ─── classifyRefractionSeverity ────────────────────────────────────────────────

describe('classifyRefractionSeverity', () => {
  it('returns clean for single concern', () => {
    expect(classifyRefractionSeverity(['io'])).toBe('clean')
  })

  it('returns minor-mix for related pair', () => {
    expect(classifyRefractionSeverity(['io', 'config'])).toBe('minor-mix')
  })

  it('returns moderate-mix for unrelated pair', () => {
    expect(classifyRefractionSeverity(['io', 'ui'])).toBe('moderate-mix')
  })

  it('returns moderate-mix for 3 concerns', () => {
    expect(classifyRefractionSeverity(['io', 'config', 'ui'])).toBe('moderate-mix')
  })

  it('returns severe-mix for 4+ concerns', () => {
    expect(classifyRefractionSeverity(['io', 'config', 'ui', 'auth'])).toBe('severe-mix')
  })

  it('returns severe-mix for 5 concerns', () => {
    expect(classifyRefractionSeverity(['io', 'ui', 'auth', 'testing', 'logging'])).toBe('severe-mix')
  })
})

// ─── findRefractionPoints ──────────────────────────────────────────────────────

describe('findRefractionPoints', () => {
  it('returns empty for single concern', () => {
    expect(findRefractionPoints(IO_CONTENT, 'io.ts', ['io'])).toEqual([])
  })

  it('finds mixing points in mixed code', () => {
    const concerns = detectConcerns(MIXED_CONTENT, 'mixed.ts')
    const points = findRefractionPoints(MIXED_CONTENT, 'mixed.ts', concerns)
    expect(points.length).toBeGreaterThan(0)
  })

  it('assigns correct severity', () => {
    const concerns = detectConcerns(MIXED_CONTENT, 'mixed.ts')
    const points = findRefractionPoints(MIXED_CONTENT, 'mixed.ts', concerns)
    for (const p of points) {
      expect(['clean', 'minor-mix', 'moderate-mix', 'severe-mix']).toContain(p.severity)
    }
  })

  it('includes line numbers', () => {
    const concerns = detectConcerns(MIXED_CONTENT, 'mixed.ts')
    const points = findRefractionPoints(MIXED_CONTENT, 'mixed.ts', concerns)
    for (const p of points) {
      expect(p.line).toBeGreaterThan(0)
    }
  })

  it('returns empty for empty content', () => {
    expect(findRefractionPoints('', 'empty.ts', [])).toEqual([])
  })
})

// ─── computeSeparationScore ────────────────────────────────────────────────────

describe('computeSeparationScore', () => {
  it('returns 100 for single concern', () => {
    expect(computeSeparationScore(['io'], '')).toBe(100)
  })

  it('returns lower for multiple concerns', () => {
    expect(computeSeparationScore(['io', 'ui'], '')).toBeLessThan(100)
  })

  it('returns valid range', () => {
    const score = computeSeparationScore(['io', 'config', 'ui'], '')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── computeConcernOverlap ─────────────────────────────────────────────────────

describe('computeConcernOverlap', () => {
  it('returns 0 for single band', () => {
    const bands: SpectralBand[] = [{
      concern: 'io', wavelength: 380, intensity: 80, files: ['a.ts'],
      purity: 100, overlapWith: [], color: 'violet',
    }]
    expect(computeConcernOverlap(bands)).toBe(0)
  })

  it('returns 0 for empty bands', () => {
    expect(computeConcernOverlap([])).toBe(0)
  })

  it('returns positive for overlapping bands', () => {
    const bands: SpectralBand[] = [
      { concern: 'io', wavelength: 380, intensity: 80, files: ['a.ts'], purity: 70, overlapWith: ['ui'], color: 'violet' },
      { concern: 'ui', wavelength: 700, intensity: 60, files: ['a.ts'], purity: 70, overlapWith: ['io'], color: 'red' },
    ]
    expect(computeConcernOverlap(bands)).toBeGreaterThan(0)
  })
})

// ─── computeSeparationIndex ────────────────────────────────────────────────────

describe('computeSeparationIndex', () => {
  it('returns 100 for empty files', () => {
    expect(computeSeparationIndex([])).toBe(100)
  })

  it('returns high for monochromatic files', () => {
    const files: SpectralFile[] = [
      { file: 'a.ts', spectrum: [], dominantConcern: 'io', secondaryConcerns: [], separationScore: 100, refractionErrors: 0, isMonochromatic: true, isPolychromatic: false, spectralPurity: 100 },
      { file: 'b.ts', spectrum: [], dominantConcern: 'logic', secondaryConcerns: [], separationScore: 100, refractionErrors: 0, isMonochromatic: true, isPolychromatic: false, spectralPurity: 100 },
    ]
    expect(computeSeparationIndex(files)).toBe(100)
  })

  it('returns lower for polychromatic files', () => {
    const files: SpectralFile[] = [
      { file: 'a.ts', spectrum: [], dominantConcern: 'io', secondaryConcerns: ['ui'], separationScore: 50, refractionErrors: 3, isMonochromatic: false, isPolychromatic: true, spectralPurity: 60 },
    ]
    expect(computeSeparationIndex(files)).toBeLessThan(100)
  })
})

// ─── computeSpectrumCompleteness ───────────────────────────────────────────────

describe('computeSpectrumCompleteness', () => {
  it('returns 0 for no bands', () => {
    expect(computeSpectrumCompleteness([])).toBe(0)
  })

  it('returns partial for some bands', () => {
    const bands: SpectralBand[] = [
      { concern: 'io', wavelength: 380, intensity: 80, files: ['a.ts'], purity: 100, overlapWith: [], color: 'violet' },
      { concern: 'logic', wavelength: 540, intensity: 60, files: ['b.ts'], purity: 100, overlapWith: [], color: 'green' },
    ]
    const completeness = computeSpectrumCompleteness(bands)
    expect(completeness).toBeGreaterThan(0)
    expect(completeness).toBeLessThan(100)
  })

  it('returns high for many bands', () => {
    const concerns: ConcernName[] = ['io', 'config', 'error', 'validation', 'logic', 'data', 'logging']
    const bands: SpectralBand[] = concerns.map(c => ({
      concern: c, wavelength: 500, intensity: 50, files: [], purity: 100, overlapWith: [], color: 'green',
    }))
    expect(computeSpectrumCompleteness(bands)).toBe(100)
  })
})

// ─── classifyOverallClarity ────────────────────────────────────────────────────

describe('classifyOverallClarity', () => {
  it('returns ultraviolet for best', () => {
    expect(classifyOverallClarity(95, 90)).toBe('ultraviolet')
  })

  it('returns blue for great', () => {
    expect(classifyOverallClarity(80, 78)).toBe('blue')
  })

  it('returns green for good', () => {
    expect(classifyOverallClarity(70, 62)).toBe('green')
  })

  it('returns yellow for average', () => {
    expect(classifyOverallClarity(55, 48)).toBe('yellow')
  })

  it('returns orange for poor', () => {
    expect(classifyOverallClarity(40, 32)).toBe('orange')
  })

  it('returns red for bad', () => {
    expect(classifyOverallClarity(25, 18)).toBe('red')
  })

  it('returns infrared for terrible', () => {
    expect(classifyOverallClarity(10, 10)).toBe('infrared')
  })
})

// ─── buildPrismaticResult ──────────────────────────────────────────────────────

describe('buildPrismaticResult', () => {
  it('builds result from empty input', () => {
    const result = buildPrismaticResult([], [], {})
    expect(result.bands).toEqual([])
    expect(result.files).toEqual([])
    expect(result.stats.totalBands).toBe(0)
  })

  it('builds result from single file', () => {
    const result = buildPrismaticResult(['io.ts'], [IO_CONTENT], {})
    expect(result.files).toHaveLength(1)
    expect(result.files[0].dominantConcern).toBe('io')
  })

  it('builds result from mixed content', () => {
    const result = buildPrismaticResult(['mixed.ts'], [MIXED_CONTENT], {})
    expect(result.stats.totalBands).toBeGreaterThan(1)
  })

  it('detects refraction points in mixed code', () => {
    const result = buildPrismaticResult(['mixed.ts'], [MIXED_CONTENT], {})
    expect(result.refractionPoints.length).toBeGreaterThan(0)
  })

  it('computes correct clarity', () => {
    const result = buildPrismaticResult(['all.ts'], [ALL_CONCERNS_CONTENT], {})
    expect(['ultraviolet', 'blue', 'green', 'yellow', 'orange', 'red', 'infrared']).toContain(result.stats.overallClarity)
  })

  it('computes spectrum completeness', () => {
    const result = buildPrismaticResult(['io.ts', 'logic.ts'], [IO_CONTENT, LOGIC_CONTENT], {})
    expect(result.stats.spectrumCompleteness).toBeGreaterThanOrEqual(0)
  })

  it('respects verbose option', () => {
    const result = buildPrismaticResult(['a.ts'], [LOGIC_CONTENT], { verbose: true })
    expect(result).toBeDefined()
  })

  it('identifies monochromatic files', () => {
    const result = buildPrismaticResult(['types.ts'], [PURE_DATA_CONTENT], {})
    expect(result.stats.monochromaticFiles).toBeGreaterThanOrEqual(1)
  })

  it('identifies polychromatic files', () => {
    const result = buildPrismaticResult(['mixed.ts'], [MIXED_CONTENT], {})
    expect(result.stats.polychromaticFiles).toBeGreaterThanOrEqual(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: PrismaticStats = {
    totalBands: 3, totalRefractionPoints: 0, cleanPoints: 0, minorMixPoints: 0,
    moderateMixPoints: 0, severeMixPoints: 0, monochromaticFiles: 2, polychromaticFiles: 0,
    avgSeparationScore: 80, avgSpectralPurity: 85, dominantConcern: 'logic',
    mostMixedFile: '', purestFile: 'a.ts', concernOverlap: 10, separationIndex: 85,
    spectrumCompleteness: 60, overallClarity: 'green',
  }

  it('recommends extracting severe mixes', () => {
    const points: RefractionPoint[] = [
      { file: 'a.ts', line: 5, concerns: ['io', 'ui', 'auth', 'logging'], severity: 'severe-mix', description: 'mix', suggestion: 'separate' },
    ]
    const recs = generateRecommendations([], [], points, baseStats)
    expect(recs.some(r => r.includes('severe'))).toBe(true)
  })

  it('recommends refactoring low separation files', () => {
    const files: SpectralFile[] = [
      { file: 'a.ts', spectrum: [], dominantConcern: 'io', secondaryConcerns: ['ui'], separationScore: 30, refractionErrors: 5, isMonochromatic: false, isPolychromatic: true, spectralPurity: 40 },
    ]
    const recs = generateRecommendations([], files, [], baseStats)
    expect(recs.some(r => r.includes('single-responsibility'))).toBe(true)
  })

  it('recommends adding missing concerns', () => {
    const stats = { ...baseStats, spectrumCompleteness: 30 }
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('missing'))).toBe(true)
  })

  it('recommends reducing high refraction files', () => {
    const files: SpectralFile[] = [
      { file: 'a.ts', spectrum: [], dominantConcern: 'io', secondaryConcerns: [], separationScore: 50, refractionErrors: 5, isMonochromatic: false, isPolychromatic: true, spectralPurity: 50 },
    ]
    const recs = generateRecommendations([], files, [], baseStats)
    expect(recs.some(r => r.includes('refraction'))).toBe(true)
  })

  it('returns empty for perfect code', () => {
    const recs = generateRecommendations([], [], [], baseStats)
    expect(recs).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatClarity', () => {
  it('formats ultraviolet', () => {
    expect(formatClarity('ultraviolet')).toContain('ultraviolet')
  })
  it('formats infrared', () => {
    expect(formatClarity('infrared')).toContain('infrared')
  })
})

describe('formatConcern', () => {
  it('formats io', () => {
    expect(formatConcern('io')).toContain('io')
  })
  it('formats unknown', () => {
    expect(formatConcern('unknown')).toContain('unknown')
  })
})

describe('formatSeparationGauge', () => {
  it('formats 100%', () => {
    expect(formatSeparationGauge(100, 10)).toContain('100%')
  })
  it('formats 0%', () => {
    expect(formatSeparationGauge(0, 10)).toContain('0%')
  })
})

describe('formatSeverityBadge', () => {
  it('formats severe-mix', () => {
    expect(formatSeverityBadge('severe-mix')).toContain('severe-mix')
  })
  it('formats clean', () => {
    expect(formatSeverityBadge('clean')).toContain('clean')
  })
})

describe('formatSpectrumBands', () => {
  it('formats empty bands', () => {
    expect(formatSpectrumBands([])).toContain('No concerns')
  })
  it('formats bands', () => {
    const bands: SpectralBand[] = [
      { concern: 'io', wavelength: 380, intensity: 80, files: ['a.ts'], purity: 90, overlapWith: ['config'], color: 'violet' },
    ]
    const result = formatSpectrumBands(bands)
    expect(result).toContain('io')
    expect(result).toContain('380')
  })
})

describe('formatRefractionPoints', () => {
  it('formats no points', () => {
    expect(formatRefractionPoints([])).toContain('Clean spectrum')
  })
  it('formats points', () => {
    const points: RefractionPoint[] = [
      { file: 'a.ts', line: 5, concerns: ['io', 'ui'], severity: 'moderate-mix', description: 'mix', suggestion: 'sep' },
    ]
    const result = formatRefractionPoints(points)
    expect(result).toContain('moderate-mix')
    expect(result).toContain('a.ts')
  })
})

describe('formatFileAnalysis', () => {
  it('formats no files', () => {
    expect(formatFileAnalysis([])).toContain('No files')
  })
  it('formats files', () => {
    const files: SpectralFile[] = [
      { file: 'a.ts', spectrum: [], dominantConcern: 'io', secondaryConcerns: [], separationScore: 90, refractionErrors: 0, isMonochromatic: true, isPolychromatic: false, spectralPurity: 100 },
    ]
    const result = formatFileAnalysis(files)
    expect(result).toContain('a.ts')
    expect(result).toContain('mono')
  })
})

describe('formatPrismaticStats', () => {
  it('formats stats', () => {
    const stats: PrismaticStats = {
      totalBands: 5, totalRefractionPoints: 3, cleanPoints: 1, minorMixPoints: 1,
      moderateMixPoints: 1, severeMixPoints: 0, monochromaticFiles: 3, polychromaticFiles: 2,
      avgSeparationScore: 75, avgSpectralPurity: 80, dominantConcern: 'logic',
      mostMixedFile: 'mixed.ts', purestFile: 'types.ts', concernOverlap: 25,
      separationIndex: 70, spectrumCompleteness: 60, overallClarity: 'green',
    }
    const result = formatPrismaticStats(stats)
    expect(result).toContain('Bands:')
    expect(result).toContain('green')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('Clean spectrum')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X'])).toContain('1. Fix X')
  })
})

describe('formatPrismaticTable', () => {
  it('formats full table', () => {
    const result = buildPrismaticResult(['a.ts'], [MIXED_CONTENT], {})
    const table = formatPrismaticTable(result)
    expect(table).toContain('Prismatic Analysis')
    expect(table).toContain('Recommendations')
  })
})

describe('formatPrismaticJson', () => {
  it('formats valid JSON', () => {
    const result = buildPrismaticResult(['a.ts'], [IO_CONTENT], {})
    const json = formatPrismaticJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats).toBeDefined()
    expect(parsed.bands).toBeDefined()
  })
})
