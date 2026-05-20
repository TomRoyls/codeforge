import { describe, expect, it } from 'vitest'

import {
  analyzeFileSignal,
  analyzeSignalBands,
  buildSignalResult,
  classifyAnalysis,
  classifyLine,
  classifyOverallClarity,
  computeBandwidth,
  computeNoiseReduction,
  computeSNR,
  detectNoiseSources,
  generateSignalRecommendations,
  type NoiseSource,
  type SignalFile,
  type SignalOptions,
  type SignalResult,
  type SignalStats,
} from '../src/commands/signal-helpers.js'

import {
  formatCategoryLabel,
  formatClarityLabel,
  formatNoiseSources,
  formatNoiseType,
  formatRecommendations,
  formatSignalBands,
  formatSignalFiles,
  formatSignalJson,
  formatSignalStats,
  formatSignalTable,
  formatSNRGauge,
  formatWaveform,
} from '../src/commands/signal-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const CLEAN_SIGNAL = `export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}
`

const NOISY_DEBUG = `export function process(data: string) {
  console.log('processing:', data)
  console.log('debug start')
  const result = JSON.parse(data)
  console.log('parsed:', result)
  // TODO: fix error handling
  // FIXME: memory leak here
  return result
}
`

const VERBOSE_CODE = `const isTrue = x ? true : false
const handler = function(req, res) {
  return handler
}
`

const BOILERPLATE_CODE = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
export default {};
`

const DEAD_CODE = `function process() {
  return 'done'
  console.log('unreachable')
  const x = 1
}
`

const REDUNDANT_PATTERN = `function check(x: boolean) {
  if (x) {
    return true
  } else {
    return false
  }
}
`

const MIXED_CONTENT = `import { readFile } from 'fs'
import type { Config } from './types'

// Load the config file
export function loadConfig(path: string): Config {
  console.log('loading config')
  const content = readFile(path, 'utf8')
  const parsed = JSON.parse(content)
  // TODO: validate
  return parsed
}

export class ConfigManager {
  private config: Config | null = null

  load(path: string): void {
    this.config = loadConfig(path)
  }
}
`

// ─── Line Classification ───────────────────────────────────────────────────────

describe('classifyLine', () => {
  it('classifies console.log as debug-residue', () => {
    expect(classifyLine('console.log("debug")', [])).toBe('debug-residue')
  })

  it('classifies debugger as debug-residue', () => {
    expect(classifyLine('debugger', [])).toBe('debug-residue')
  })

  it('classifies TODO comment as debug-residue', () => {
    expect(classifyLine('// TODO: fix this', [])).toBe('debug-residue')
  })

  it('classifies FIXME comment as debug-residue', () => {
    expect(classifyLine('// FIXME: broken', [])).toBe('debug-residue')
  })

  it('classifies HACK comment as debug-residue', () => {
    expect(classifyLine('// HACK: workaround', [])).toBe('debug-residue')
  })

  it('classifies regular code as signal', () => {
    expect(classifyLine('const x = 1', [])).toBe('signal')
  })

  it('classifies function declaration as signal', () => {
    expect(classifyLine('function foo() {}', [])).toBe('signal')
  })

  it('classifies export as signal', () => {
    expect(classifyLine('export const x = 1', [])).toBe('signal')
  })

  it('classifies import as signal', () => {
    expect(classifyLine('import { x } from "fs"', [])).toBe('signal')
  })

  it('classifies blank as signal', () => {
    expect(classifyLine('', [])).toBe('signal')
  })
})

// ─── Noise Detection ───────────────────────────────────────────────────────────

describe('detectNoiseSources', () => {
  it('returns empty for empty content', () => {
    expect(detectNoiseSources(EMPTY_CONTENT)).toEqual([])
  })

  it('detects debug residue', () => {
    const sources = detectNoiseSources(NOISY_DEBUG)
    const debug = sources.find(s => s.type === 'debug-residue')
    expect(debug).toBeDefined()
    expect(debug!.lines).toBeGreaterThan(0)
    expect(debug!.autoFixable).toBe(true)
  })

  it('detects boilerplate', () => {
    const sources = detectNoiseSources(BOILERPLATE_CODE)
    const boiler = sources.find(s => s.type === 'boilerplate')
    expect(boiler).toBeDefined()
  })

  it('detects redundant patterns', () => {
    const sources = detectNoiseSources(REDUNDANT_PATTERN)
    const redundant = sources.find(s => s.type === 'redundant-pattern')
    expect(redundant).toBeDefined()
  })

  it('detects verbose syntax', () => {
    const sources = detectNoiseSources(VERBOSE_CODE)
    const verbose = sources.find(s => s.type === 'verbose-syntax')
    expect(verbose).toBeDefined()
  })

  it('returns no sources for clean code', () => {
    const sources = detectNoiseSources(CLEAN_SIGNAL)
    expect(sources.length).toBe(0)
  })

  it('noise sources have valid structure', () => {
    const sources = detectNoiseSources(NOISY_DEBUG)
    for (const s of sources) {
      expect(s.type).toBeDefined()
      expect(s.lines).toBeGreaterThan(0)
      expect(s.percentage).toBeGreaterThanOrEqual(0)
      expect(s.description.length).toBeGreaterThan(0)
      expect(typeof s.autoFixable).toBe('boolean')
      expect(s.suggestion.length).toBeGreaterThan(0)
    }
  })

  it('detects dead code', () => {
    const sources = detectNoiseSources(DEAD_CODE)
    const dead = sources.find(s => s.type === 'dead-code')
    expect(dead).toBeDefined()
  })
})

// ─── SNR ───────────────────────────────────────────────────────────────────────

describe('computeSNR', () => {
  it('returns 100 for all signal', () => {
    expect(computeSNR(100, 0)).toBe(100)
  })

  it('returns 0 for all noise', () => {
    expect(computeSNR(0, 100)).toBe(0)
  })

  it('returns 100 for empty', () => {
    expect(computeSNR(0, 0)).toBe(100)
  })

  it('computes correct ratio', () => {
    expect(computeSNR(80, 20)).toBe(80)
  })

  it('computes 50/50', () => {
    expect(computeSNR(50, 50)).toBe(50)
  })

  it('clamps to 0-100', () => {
    expect(computeSNR(120, 0)).toBe(100)
    expect(computeSNR(0, 200)).toBe(0)
  })
})

// ─── Bandwidth ─────────────────────────────────────────────────────────────────

describe('computeBandwidth', () => {
  it('returns 100 for empty content', () => {
    expect(computeBandwidth('', 0)).toBe(100)
  })

  it('returns high bandwidth for clean signal', () => {
    const bw = computeBandwidth(CLEAN_SIGNAL, 6)
    expect(bw).toBeGreaterThan(50)
  })

  it('clamps to 0-100', () => {
    const bw = computeBandwidth('const x = 1', 1)
    expect(bw).toBeGreaterThanOrEqual(0)
    expect(bw).toBeLessThanOrEqual(100)
  })
})

// ─── Signal Bands ──────────────────────────────────────────────────────────────

describe('analyzeSignalBands', () => {
  it('returns empty for empty content', () => {
    expect(analyzeSignalBands('')).toEqual([])
  })

  it('detects logic band', () => {
    const bands = analyzeSignalBands('const x = 1\nexport function foo() {}')
    const logic = bands.find(b => b.type === 'logic')
    expect(logic).toBeDefined()
    expect(logic!.frequency).toBeGreaterThan(0)
  })

  it('detects control-flow band', () => {
    const bands = analyzeSignalBands('if (x) {}\nfor (let i = 0; i < 10; i++) {}')
    const cf = bands.find(b => b.type === 'control-flow')
    expect(cf).toBeDefined()
  })

  it('detects error-handling band', () => {
    const bands = analyzeSignalBands('try {}\ncatch (e) {}')
    const eh = bands.find(b => b.type === 'error-handling')
    expect(eh).toBeDefined()
  })

  it('detects io band for console.log', () => {
    const bands = analyzeSignalBands('console.log("test")')
    const io = bands.find(b => b.type === 'io')
    expect(io).toBeDefined()
  })

  it('band values are in valid range', () => {
    const bands = analyzeSignalBands(MIXED_CONTENT)
    for (const b of bands) {
      expect(b.strength).toBeGreaterThanOrEqual(0)
      expect(b.strength).toBeLessThanOrEqual(100)
      expect(b.frequency).toBeGreaterThan(0)
      expect(b.clarity).toBeGreaterThanOrEqual(0)
      expect(b.clarity).toBeLessThanOrEqual(100)
      expect(b.noiseInterference).toBeGreaterThanOrEqual(0)
      expect(b.noiseInterference).toBeLessThanOrEqual(100)
    }
  })
})

// ─── Classification ────────────────────────────────────────────────────────────

describe('classifyAnalysis', () => {
  it('returns high-fidelity for high SNR and bandwidth', () => {
    expect(classifyAnalysis(90, 90)).toBe('high-fidelity')
  })

  it('returns clear for good values', () => {
    expect(classifyAnalysis(75, 70)).toBe('clear')
  })

  it('returns moderate for average values', () => {
    expect(classifyAnalysis(55, 50)).toBe('moderate')
  })

  it('returns noisy for low values', () => {
    expect(classifyAnalysis(35, 30)).toBe('noisy')
  })

  it('returns static for very low values', () => {
    expect(classifyAnalysis(10, 10)).toBe('static')
  })
})

describe('classifyOverallClarity', () => {
  it('returns crystal-clear for high values', () => {
    expect(classifyOverallClarity(90, 90)).toBe('crystal-clear')
  })

  it('returns clear for good values', () => {
    expect(classifyOverallClarity(75, 70)).toBe('clear')
  })

  it('returns acceptable for moderate', () => {
    expect(classifyOverallClarity(55, 50)).toBe('acceptable')
  })

  it('returns noisy for low', () => {
    expect(classifyOverallClarity(35, 30)).toBe('noisy')
  })

  it('returns static for very low', () => {
    expect(classifyOverallClarity(10, 10)).toBe('static')
  })
})

// ─── Noise Reduction ───────────────────────────────────────────────────────────

describe('computeNoiseReduction', () => {
  it('returns 0 for no sources', () => {
    expect(computeNoiseReduction([])).toBe(0)
  })

  it('returns 100 for all auto-fixable', () => {
    const sources: NoiseSource[] = [
      { type: 'debug-residue', lines: 5, percentage: 10, locations: [1], description: 'test', autoFixable: true, suggestion: 'test' },
    ]
    expect(computeNoiseReduction(sources)).toBe(100)
  })

  it('returns 0 for none auto-fixable', () => {
    const sources: NoiseSource[] = [
      { type: 'boilerplate', lines: 5, percentage: 10, locations: [1], description: 'test', autoFixable: false, suggestion: 'test' },
    ]
    expect(computeNoiseReduction(sources)).toBe(0)
  })

  it('computes partial ratio', () => {
    const sources: NoiseSource[] = [
      { type: 'debug-residue', lines: 3, percentage: 6, locations: [1], description: 'test', autoFixable: true, suggestion: 'test' },
      { type: 'boilerplate', lines: 2, percentage: 4, locations: [1], description: 'test', autoFixable: false, suggestion: 'test' },
    ]
    const result = computeNoiseReduction(sources)
    expect(result).toBe(60)
  })
})

// ─── Analyze File Signal ───────────────────────────────────────────────────────

describe('analyzeFileSignal', () => {
  it('returns defaults for empty content', () => {
    const result = analyzeFileSignal('', 'empty.ts')
    expect(result.totalLines).toBe(0)
    expect(result.snr).toBe(100)
    expect(result.category).toBe('high-fidelity')
  })

  it('returns high SNR for clean code', () => {
    const result = analyzeFileSignal(CLEAN_SIGNAL, 'clean.ts')
    expect(result.snr).toBeGreaterThan(50)
    expect(result.totalLines).toBeGreaterThan(0)
    expect(result.signalLines).toBeGreaterThan(0)
  })

  it('returns lower SNR for noisy code', () => {
    const clean = analyzeFileSignal(CLEAN_SIGNAL, 'clean.ts')
    const noisy = analyzeFileSignal(NOISY_DEBUG, 'noisy.ts')
    expect(noisy.snr).toBeLessThan(clean.snr)
  })

  it('computes valid metrics', () => {
    const result = analyzeFileSignal(MIXED_CONTENT, 'mixed.ts')
    expect(result.snr).toBeGreaterThanOrEqual(0)
    expect(result.snr).toBeLessThanOrEqual(100)
    expect(result.bandwidth).toBeGreaterThanOrEqual(0)
    expect(result.bandwidth).toBeLessThanOrEqual(100)
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
    expect(['high-fidelity', 'clear', 'moderate', 'noisy', 'static']).toContain(result.category)
  })

  it('detects noise sources', () => {
    const result = analyzeFileSignal(NOISY_DEBUG, 'debug.ts')
    expect(result.noiseSources.length).toBeGreaterThan(0)
  })

  it('no noise for clean code', () => {
    const result = analyzeFileSignal(CLEAN_SIGNAL, 'clean.ts')
    expect(result.noiseSources.length).toBe(0)
  })
})

// ─── Recommendations ───────────────────────────────────────────────────────────

describe('generateSignalRecommendations', () => {
  const baseStats: SignalStats = {
    totalLines: 100, totalSignal: 80, totalNoise: 20,
    avgSNR: 80, avgBandwidth: 75,
    highFidelityFiles: 3, noisyFiles: 1, staticFiles: 0,
    totalNoiseSources: 2,
    boilerplateLines: 0, deadCodeLines: 0, redundantLines: 0,
    overDocLines: 0, debugResidueLines: 0, importBloatLines: 0,
    autoFixableLines: 0,
    dominantNoiseType: 'none', dominantSignalType: 'logic',
    overallSNR: 80, overallBandwidth: 75,
    overallClarity: 'clear', noiseReduction: 0,
  }

  it('returns empty for clean codebase', () => {
    expect(generateSignalRecommendations([], [], baseStats)).toEqual([])
  })

  it('recommends removing debug residue', () => {
    const sources: NoiseSource[] = [
      { type: 'debug-residue', lines: 5, percentage: 10, locations: [1], description: 'test', autoFixable: true, suggestion: 'test' },
    ]
    const result = generateSignalRecommendations([], sources, baseStats)
    expect(result.some(r => r.includes('debug'))).toBe(true)
  })

  it('recommends simplifying redundant patterns', () => {
    const sources: NoiseSource[] = [
      { type: 'redundant-pattern', lines: 3, percentage: 6, locations: [1], description: 'test', autoFixable: true, suggestion: 'test' },
    ]
    const result = generateSignalRecommendations([], sources, baseStats)
    expect(result.some(r => r.includes('redundant') || r.includes('Simplify'))).toBe(true)
  })

  it('recommends removing dead code', () => {
    const sources: NoiseSource[] = [
      { type: 'dead-code', lines: 4, percentage: 8, locations: [1], description: 'test', autoFixable: true, suggestion: 'test' },
    ]
    const result = generateSignalRecommendations([], sources, baseStats)
    expect(result.some(r => r.includes('unreachable') || r.includes('dead'))).toBe(true)
  })

  it('recommends reviewing noisy files', () => {
    const files: SignalFile[] = [
      { file: 'noisy.ts', analysis: { file: 'noisy.ts', totalLines: 10, signalLines: 2, noiseLines: 8, snr: 20, noiseSources: [], bandwidth: 20, clarity: 20, category: 'noisy' }, bands: [] },
    ]
    const result = generateSignalRecommendations(files, [], baseStats)
    expect(result.some(r => r.includes('noisy'))).toBe(true)
  })

  it('recommends noise reduction pass for low SNR', () => {
    const stats = { ...baseStats, overallSNR: 40 }
    const result = generateSignalRecommendations([], [], stats)
    expect(result.some(r => r.includes('SNR') || r.includes('noise'))).toBe(true)
  })

  it('recommends extracting boilerplate', () => {
    const sources: NoiseSource[] = [
      { type: 'boilerplate', lines: 10, percentage: 20, locations: [1], description: 'test', autoFixable: false, suggestion: 'test' },
    ]
    const result = generateSignalRecommendations([], sources, baseStats)
    expect(result.some(r => r.includes('boilerplate') || r.includes('shared'))).toBe(true)
  })

  it('recommends concise syntax', () => {
    const sources: NoiseSource[] = [
      { type: 'verbose-syntax', lines: 3, percentage: 6, locations: [1], description: 'test', autoFixable: true, suggestion: 'test' },
    ]
    const result = generateSignalRecommendations([], sources, baseStats)
    expect(result.some(r => r.includes('verbose') || r.includes('concise'))).toBe(true)
  })
})

// ─── Build Result ──────────────────────────────────────────────────────────────

describe('buildSignalResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildSignalResult([], [], {})
    expect(result.files).toEqual([])
    expect(result.stats.overallSNR).toBe(100)
    expect(result.stats.totalLines).toBe(0)
    expect(result.recommendations).toEqual([])
  })

  it('returns valid result for single clean file', () => {
    const result = buildSignalResult(['clean.ts'], [CLEAN_SIGNAL], {})
    expect(result.files.length).toBe(1)
    expect(result.files[0].analysis.snr).toBeGreaterThan(50)
    expect(result.stats.totalLines).toBeGreaterThan(0)
  })

  it('returns lower SNR for noisy file', () => {
    const result = buildSignalResult(['noisy.ts'], [NOISY_DEBUG], {})
    expect(result.stats.overallSNR).toBeLessThan(100)
  })

  it('computes correct aggregate stats', () => {
    const result = buildSignalResult(
      ['clean.ts', 'noisy.ts'],
      [CLEAN_SIGNAL, NOISY_DEBUG],
      {},
    )
    expect(result.stats.totalLines).toBeGreaterThan(0)
    expect(result.stats.totalSignal).toBeGreaterThan(0)
    expect(result.stats.totalNoise).toBeGreaterThan(0)
    expect(result.stats.avgSNR).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSNR).toBeLessThanOrEqual(100)
  })

  it('counts file categories', () => {
    const result = buildSignalResult(
      ['clean.ts', 'noisy.ts'],
      [CLEAN_SIGNAL, NOISY_DEBUG],
      {},
    )
    expect(result.stats.highFidelityFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.noisyFiles).toBeGreaterThanOrEqual(0)
  })

  it('identifies dominant noise type', () => {
    const result = buildSignalResult(['noisy.ts'], [NOISY_DEBUG], {})
    expect(result.stats.dominantNoiseType).toBeDefined()
  })

  it('identifies dominant signal type', () => {
    const result = buildSignalResult(['clean.ts'], [CLEAN_SIGNAL], {})
    expect(result.stats.dominantSignalType).toBeDefined()
  })

  it('computes noise reduction', () => {
    const result = buildSignalResult(['noisy.ts'], [NOISY_DEBUG], {})
    expect(result.stats.noiseReduction).toBeGreaterThanOrEqual(0)
    expect(result.stats.noiseReduction).toBeLessThanOrEqual(100)
  })

  it('computes overall clarity', () => {
    const result = buildSignalResult(['clean.ts'], [CLEAN_SIGNAL], {})
    expect(['crystal-clear', 'clear', 'acceptable', 'noisy', 'static']).toContain(result.stats.overallClarity)
  })

  it('respects verbose option', () => {
    const result = buildSignalResult(['a.ts'], [CLEAN_SIGNAL], { verbose: true })
    expect(result).toBeDefined()
  })

  it('computes auto-fixable lines', () => {
    const result = buildSignalResult(['noisy.ts'], [NOISY_DEBUG], {})
    expect(result.stats.autoFixableLines).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatCategoryLabel', () => {
  it('formats high-fidelity', () => {
    expect(formatCategoryLabel('high-fidelity')).toContain('high-fidelity')
  })
  it('formats static', () => {
    expect(formatCategoryLabel('static')).toContain('static')
  })
})

describe('formatClarityLabel', () => {
  it('formats crystal-clear', () => {
    expect(formatClarityLabel('crystal-clear')).toContain('crystal-clear')
  })
})

describe('formatNoiseType', () => {
  it('formats debug-residue', () => {
    expect(formatNoiseType('debug-residue')).toContain('debug-residue')
  })
})

describe('formatSNRGauge', () => {
  it('returns gauge with value', () => {
    expect(formatSNRGauge(75)).toContain('75')
  })
  it('handles 0', () => {
    expect(formatSNRGauge(0)).toContain('0')
  })
  it('handles 100', () => {
    expect(formatSNRGauge(100)).toContain('100')
  })
})

describe('formatWaveform', () => {
  it('returns waveform string', () => {
    const wf = formatWaveform(75, 25)
    expect(wf.length).toBeGreaterThan(0)
  })
})

describe('formatSignalFiles', () => {
  it('returns no files message for empty', () => {
    expect(formatSignalFiles([])).toContain('No files')
  })
  it('formats file analysis', () => {
    const result = buildSignalResult(['a.ts'], [CLEAN_SIGNAL], {})
    const output = formatSignalFiles(result.files)
    expect(output).toContain('a.ts')
    expect(output).toContain('SNR')
  })
})

describe('formatNoiseSources', () => {
  it('returns clean signal for no noise', () => {
    expect(formatNoiseSources([])).toContain('Clean signal')
  })
  it('formats noise sources', () => {
    const sources: NoiseSource[] = [
      { type: 'debug-residue', lines: 3, percentage: 10, locations: [1, 5, 8], description: '3 debug statements', autoFixable: true, suggestion: 'Remove' },
    ]
    const output = formatNoiseSources(sources)
    expect(output).toContain('debug-residue')
    expect(output).toContain('3 debug statements')
  })
})

describe('formatSignalBands', () => {
  it('returns no bands for empty', () => {
    expect(formatSignalBands([])).toContain('No signal bands')
  })
  it('formats bands', () => {
    const bands = analyzeSignalBands(MIXED_CONTENT)
    const output = formatSignalBands(bands)
    if (bands.length > 0) {
      expect(output).toContain('str:')
    }
  })
})

describe('formatSignalStats', () => {
  it('formats stats summary', () => {
    const result = buildSignalResult(['a.ts'], [CLEAN_SIGNAL], {})
    const output = formatSignalStats(result.stats)
    expect(output).toContain('Signal Analysis Summary')
    expect(output).toContain('Lines')
  })
})

describe('formatRecommendations', () => {
  it('returns clean signal for empty', () => {
    expect(formatRecommendations([])).toContain('Clean signal')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Clean Y'])).toContain('1. Fix X')
  })
})

describe('formatSignalTable', () => {
  it('formats full table', () => {
    const result = buildSignalResult(['a.ts'], [CLEAN_SIGNAL], {})
    const output = formatSignalTable(result)
    expect(output).toContain('Signal Analysis Summary')
    expect(output).toContain('Signal Analysis')
  })
})

describe('formatSignalJson', () => {
  it('formats as valid JSON', () => {
    const result = buildSignalResult(['a.ts'], [CLEAN_SIGNAL], {})
    const json = formatSignalJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.files).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
