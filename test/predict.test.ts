import { describe, expect, it } from 'vitest'

import {
  buildForecast,
  buildMaintenanceWindows,
  buildPredictResult,
  buildRiskFactors,
  buildStats,
  computeComplexity,
  computeMaintenanceScore,
  computeRiskLevel,
  computeTechDebtIndex,
  countAsAny,
  countEffectiveLines,
  countErrorHandling,
  countExports,
  countImports,
  countNestedLoops,
  countTodoMarkers,
  detectDeprecatedUsage,
  detectSyncPatterns,
  estimateEffort,
  findLargeFunctions,
  generateRecommendations,
  measureNestingDepth,
  predictBreakingChange,
  predictBugRisk,
  predictDependencyDrift,
  predictPerformance,
  predictRefactorNeed,
  predictTechDebt,
  type Forecast,
  type PredictStats,
  type RiskFactor,
} from '../src/commands/predict-helpers.js'

import {
  formatForecastCards,
  formatMaintenanceTimeline,
  formatPredictJSON,
  formatPredictStats,
  formatPredictTable,
  formatRecommendations,
  formatRiskFactors,
  formatRiskHeatmap,
  formatTechDebtMeter,
} from '../src/commands/predict-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CLEAN_CODE = `import { Command } from '@oclif/core'

/**
 * A clean command.
 */
export function run(): void {
  console.log('hello')
}
`

const COMPLEX_CODE = `import { a } from 'x'
import { b } from 'y'
import { c } from 'z'
import { d } from 'w'
import { e } from 'v'

function deepNest(x: number) {
  if (x > 0) {
    if (x > 10) {
      if (x > 20) {
        if (x > 30) {
          if (x > 40) {
            if (x > 50) {
              while (true) {
                for (let i = 0; i < 100; i++) {
                  if (i % 2 === 0) {
                    switch (i) {
                      case 0: break
                      case 1: break
                      default: break
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

const DEBT_CODE = `// TODO: refactor this module
// FIXME: this is broken
// HACK: temporary workaround
// XXX: do not touch
// TODO: add more tests
// WORKAROUND: legacy compat
const data = fs.readFileSync('input.txt')
const buf = fs.readFileSync('data.bin')
`

const GOD_OBJECT_CODE = Array.from({ length: 400 }, (_, i) =>
  i === 0 ? "import { a } from 'x'" : i < 20 ? `import { dep${i} } from 'dep${i}'` : `export function func${i}() { return ${i} }`,
).join('\n')

const API_CODE = `export function getConfig() {}
export function setConfig() {}
export function resetConfig() {}
export function validateConfig() {}
export function mergeConfig() {}
export function cloneConfig() {}
const unsafe = {} as any
const more = {} as any
const extra = {} as any
`

const SIMPLE_CODE = 'const x = 1\n'

// ─── countEffectiveLines ──────────────────────────────────────────────────────

describe('countEffectiveLines', () => {
  it('counts code lines', () => {
    expect(countEffectiveLines('const x = 1\nconst y = 2')).toBe(2)
  })

  it('skips blank lines', () => {
    expect(countEffectiveLines('const x = 1\n\n\nconst y = 2')).toBe(2)
  })

  it('skips comment lines', () => {
    expect(countEffectiveLines('const x = 1\n// comment\nconst y = 2')).toBe(2)
  })

  it('returns 0 for empty', () => {
    expect(countEffectiveLines('')).toBe(0)
  })
})

// ─── computeComplexity ────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for flat code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeComplexity('if (a) {} if (b) {}')).toBe(3)
  })

  it('counts loops', () => {
    expect(computeComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
  })

  it('counts ternary', () => {
    expect(computeComplexity('x ? 1 : 0')).toBe(2)
  })

  it('counts logical operators', () => {
    expect(computeComplexity('a && b || c')).toBe(3)
  })
})

// ─── measureNestingDepth ──────────────────────────────────────────────────────

describe('measureNestingDepth', () => {
  it('returns 0 for flat code', () => {
    expect(measureNestingDepth('const x = 1')).toBe(0)
  })

  it('measures single level', () => {
    expect(measureNestingDepth('{ x }')).toBe(1)
  })

  it('measures deep nesting', () => {
    expect(measureNestingDepth('{ { { { } } } }')).toBe(4)
  })
})

// ─── findLargeFunctions ───────────────────────────────────────────────────────

describe('findLargeFunctions', () => {
  it('finds large named functions', () => {
    const body = 'function big() {\n' + Array.from({ length: 25 }, (_, i) => `  const v${i} = ${i}`).join('\n') + '\n}'
    const large = findLargeFunctions(body, 20)
    expect(large.some((f) => f.name === 'big')).toBe(true)
  })

  it('returns empty for small functions', () => {
    expect(findLargeFunctions('function small() { return 1 }', 20)).toEqual([])
  })
})

// ─── countTodoMarkers ─────────────────────────────────────────────────────────

describe('countTodoMarkers', () => {
  it('counts TODOs', () => {
    const markers = countTodoMarkers('// TODO: fix this\n// TODO: also this')
    expect(markers.filter((m) => m.type === 'TODO').length).toBe(2)
  })

  it('counts FIXMEs', () => {
    const markers = countTodoMarkers('// FIXME: broken')
    expect(markers.some((m) => m.type === 'FIXME')).toBe(true)
  })

  it('counts HACKs', () => {
    const markers = countTodoMarkers('// HACK: workaround')
    expect(markers.some((m) => m.type === 'HACK')).toBe(true)
  })

  it('returns empty for clean code', () => {
    expect(countTodoMarkers('const x = 1')).toEqual([])
  })
})

// ─── countExports ─────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts function exports', () => {
    expect(countExports('export function foo() {}')).toBe(1)
  })

  it('counts const exports', () => {
    expect(countExports('export const x = 1\nexport const y = 2')).toBe(2)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── countNestedLoops ─────────────────────────────────────────────────────────

describe('countNestedLoops', () => {
  it('counts nested for loops', () => {
    expect(countNestedLoops('for (let i = 0; i < 10; i++) {\n  for (let j = 0; j < 10; j++) {}\n}')).toBe(1)
  })

  it('returns 0 for single loops', () => {
    expect(countNestedLoops('for (let i = 0; i < 10; i++) {}')).toBe(0)
  })
})

// ─── detectSyncPatterns ───────────────────────────────────────────────────────

describe('detectSyncPatterns', () => {
  it('detects readFileSync', () => {
    expect(detectSyncPatterns("const d = fs.readFileSync('f')")).toContain('readFileSync')
  })

  it('detects multiple patterns', () => {
    const patterns = detectSyncPatterns("fs.readFileSync('a')\nfs.writeFileSync('b')")
    expect(patterns.length).toBe(2)
  })

  it('returns empty for async code', () => {
    expect(detectSyncPatterns("await fs.readFile('f')")).toEqual([])
  })
})

// ─── detectDeprecatedUsage ────────────────────────────────────────────────────

describe('detectDeprecatedUsage', () => {
  it('detects @deprecated', () => {
    expect(detectDeprecatedUsage('/** @deprecated */\nfunction old() {}').length).toBeGreaterThan(0)
  })

  it('detects DEPRECATED keyword', () => {
    expect(detectDeprecatedUsage('// DEPRECATED: use new instead').length).toBeGreaterThan(0)
  })

  it('returns empty for clean code', () => {
    expect(detectDeprecatedUsage('const x = 1')).toEqual([])
  })
})

// ─── countErrorHandling ───────────────────────────────────────────────────────

describe('countErrorHandling', () => {
  it('counts catch blocks', () => {
    expect(countErrorHandling('try {} catch (e) {}')).toBe(1)
  })

  it('counts multiple', () => {
    expect(countErrorHandling('try {} catch (e) {}\ntry {} catch (x) {}')).toBe(2)
  })

  it('returns 0 for none', () => {
    expect(countErrorHandling('const x = 1')).toBe(0)
  })
})

// ─── countImports ─────────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts import statements', () => {
    expect(countImports("import { a } from 'x'\nimport { b } from 'y'")).toBe(2)
  })

  it('returns 0 for no imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

// ─── countAsAny ───────────────────────────────────────────────────────────────

describe('countAsAny', () => {
  it('counts as any', () => {
    expect(countAsAny('const x = {} as any')).toBe(1)
  })

  it('counts multiple', () => {
    expect(countAsAny('const x = {} as any\nconst y = {} as any')).toBe(2)
  })

  it('returns 0 for clean', () => {
    expect(countAsAny('const x: string = ""')).toBe(0)
  })
})

// ─── predictBugRisk ───────────────────────────────────────────────────────────

describe('predictBugRisk', () => {
  it('predicts high complexity risk', () => {
    const preds = predictBugRisk('complex.ts', COMPLEX_CODE)
    expect(preds.some((p) => p.type === 'bug-risk')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const preds = predictBugRisk('clean.ts', SIMPLE_CODE)
    expect(preds).toEqual([])
  })

  it('flags deep nesting', () => {
    const preds = predictBugRisk('nested.ts', COMPLEX_CODE)
    expect(preds.some((p) => p.evidence.some((e) => e.includes('nesting')))).toBe(true)
  })

  it('flags no error handling in large file', () => {
    const bigNoCatch = Array.from({ length: 60 }, (_, i) => `const v${i} = ${i}`).join('\n')
    const preds = predictBugRisk('big.ts', bigNoCatch)
    expect(preds.some((p) => p.description.includes('No error handling'))).toBe(true)
  })
})

// ─── predictRefactorNeed ──────────────────────────────────────────────────────

describe('predictRefactorNeed', () => {
  it('flags oversized files', () => {
    const preds = predictRefactorNeed('god.ts', GOD_OBJECT_CODE)
    expect(preds.some((p) => p.type === 'refactor-needed')).toBe(true)
  })

  it('flags high exports', () => {
    const preds = predictRefactorNeed('god.ts', GOD_OBJECT_CODE)
    expect(preds.some((p) => p.description.includes('exports'))).toBe(true)
  })

  it('flags high coupling', () => {
    const preds = predictRefactorNeed('coupled.ts', GOD_OBJECT_CODE)
    expect(preds.some((p) => p.description.includes('coupling') || p.description.includes('imports'))).toBe(true)
  })

  it('returns empty for small clean file', () => {
    expect(predictRefactorNeed('small.ts', SIMPLE_CODE)).toEqual([])
  })
})

// ─── predictBreakingChange ────────────────────────────────────────────────────

describe('predictBreakingChange', () => {
  it('flags many exports', () => {
    const preds = predictBreakingChange('api.ts', API_CODE)
    expect(preds.some((p) => p.type === 'breaking-change')).toBe(true)
  })

  it('flags as any usage', () => {
    const preds = predictBreakingChange('unsafe.ts', API_CODE)
    expect(preds.some((p) => p.description.includes('as any'))).toBe(true)
  })

  it('returns empty for safe code', () => {
    expect(predictBreakingChange('safe.ts', SIMPLE_CODE)).toEqual([])
  })
})

// ─── predictTechDebt ──────────────────────────────────────────────────────────

describe('predictTechDebt', () => {
  it('flags FIXMEs', () => {
    const preds = predictTechDebt('debt.ts', DEBT_CODE)
    expect(preds.some((p) => p.description.includes('FIXME'))).toBe(true)
  })

  it('flags hacks', () => {
    const preds = predictTechDebt('debt.ts', DEBT_CODE)
    expect(preds.some((p) => p.description.includes('hack') || p.description.includes('workaround'))).toBe(true)
  })

  it('flags excessive TODOs', () => {
    const manyTodos = '// TODO: a\n// TODO: b\n// TODO: c\n// TODO: d\n'
    const preds = predictTechDebt('debt.ts', manyTodos)
    expect(preds.some((p) => p.description.includes('TODO'))).toBe(true)
  })

  it('flags deprecated usage', () => {
    const preds = predictTechDebt('old.ts', DEBT_CODE)
    expect(preds.length).toBeGreaterThan(0)
  })

  it('returns empty for clean code', () => {
    expect(predictTechDebt('clean.ts', SIMPLE_CODE)).toEqual([])
  })
})

// ─── predictPerformance ───────────────────────────────────────────────────────

describe('predictPerformance', () => {
  it('flags nested loops', () => {
    const preds = predictPerformance('slow.ts', COMPLEX_CODE)
    expect(preds.some((p) => p.description.includes('nested loop'))).toBe(true)
  })

  it('flags sync I/O', () => {
    const preds = predictPerformance('blocking.ts', DEBT_CODE)
    expect(preds.some((p) => p.description.includes('Blocking I/O') || p.description.includes('synchronous'))).toBe(true)
  })

  it('returns empty for clean code', () => {
    expect(predictPerformance('fast.ts', SIMPLE_CODE)).toEqual([])
  })
})

// ─── predictDependencyDrift ───────────────────────────────────────────────────

describe('predictDependencyDrift', () => {
  it('flags commonjs requires', () => {
    const code = "const a = require('x')\nconst b = require('y')\nconst c = require('z')"
    const preds = predictDependencyDrift('old.ts', code)
    expect(preds.some((p) => p.description.includes('require'))).toBe(true)
  })

  it('returns empty for ESM', () => {
    expect(predictDependencyDrift('new.ts', SIMPLE_CODE)).toEqual([])
  })
})

// ─── computeRiskLevel ─────────────────────────────────────────────────────────

describe('computeRiskLevel', () => {
  it('returns low for empty', () => {
    expect(computeRiskLevel([])).toBe('low')
  })

  it('returns critical for high confidence', () => {
    expect(computeRiskLevel([{ type: 'bug-risk', confidence: 90, timeframe: 'short-term', description: '', evidence: [], suggestion: '' }])).toBe('critical')
  })

  it('returns medium for moderate predictions', () => {
    expect(computeRiskLevel([
      { type: 'bug-risk', confidence: 35, timeframe: 'medium-term', description: '', evidence: [], suggestion: '' },
      { type: 'tech-debt', confidence: 30, timeframe: 'long-term', description: '', evidence: [], suggestion: '' },
      { type: 'performance', confidence: 25, timeframe: 'long-term', description: '', evidence: [], suggestion: '' },
    ])).toBe('medium')
  })

  it('returns critical for many immediates', () => {
    const preds = Array.from({ length: 3 }, () => ({ type: 'bug-risk' as const, confidence: 50, timeframe: 'immediate' as const, description: '', evidence: [], suggestion: '' }))
    expect(computeRiskLevel(preds)).toBe('critical')
  })
})

// ─── computeMaintenanceScore ──────────────────────────────────────────────────

describe('computeMaintenanceScore', () => {
  it('returns 100 for no predictions', () => {
    expect(computeMaintenanceScore([])).toBe(100)
  })

  it('decreases with high confidence predictions', () => {
    const score = computeMaintenanceScore([{ type: 'bug-risk', confidence: 80, timeframe: 'immediate', description: '', evidence: [], suggestion: '' }])
    expect(score).toBeLessThan(100)
  })

  it('stays high for low confidence', () => {
    const score = computeMaintenanceScore([{ type: 'tech-debt', confidence: 20, timeframe: 'long-term', description: '', evidence: [], suggestion: '' }])
    expect(score).toBeGreaterThan(90)
  })
})

// ─── estimateEffort ───────────────────────────────────────────────────────────

describe('estimateEffort', () => {
  it('returns minimal for empty', () => {
    expect(estimateEffort([])).toBe('minimal')
  })

  it('returns major for heavy predictions', () => {
    const preds = [
      { type: 'bug-risk' as const, confidence: 90, timeframe: 'immediate' as const, description: '', evidence: [], suggestion: '' },
      { type: 'tech-debt' as const, confidence: 80, timeframe: 'short-term' as const, description: '', evidence: [], suggestion: '' },
    ]
    expect(estimateEffort(preds)).toBe('major')
  })
})

// ─── buildForecast ────────────────────────────────────────────────────────────

describe('buildForecast', () => {
  it('builds forecast from clean code', () => {
    const f = buildForecast('clean.ts', CLEAN_CODE)
    expect(f.file).toBe('clean.ts')
    expect(f.riskLevel).toBe('low')
    expect(f.maintenanceScore).toBe(100)
  })

  it('builds forecast from complex code', () => {
    const f = buildForecast('complex.ts', COMPLEX_CODE)
    expect(f.predictions.length).toBeGreaterThan(0)
    expect(f.riskLevel).not.toBe('low')
    expect(f.maintenanceScore).toBeLessThan(100)
  })
})

// ─── buildRiskFactors ─────────────────────────────────────────────────────────

describe('buildRiskFactors', () => {
  it('returns factors sorted by weight', () => {
    const forecasts = [buildForecast('complex.ts', COMPLEX_CODE)]
    const factors = buildRiskFactors(forecasts)
    if (factors.length > 1) {
      expect(factors[0]!.weight).toBeGreaterThanOrEqual(factors[1]!.weight)
    }
  })

  it('returns empty for clean forecasts', () => {
    const forecasts = [buildForecast('clean.ts', SIMPLE_CODE)]
    expect(buildRiskFactors(forecasts)).toEqual([])
  })
})

// ─── buildMaintenanceWindows ──────────────────────────────────────────────────

describe('buildMaintenanceWindows', () => {
  it('builds windows from forecasts', () => {
    const forecasts = [buildForecast('complex.ts', COMPLEX_CODE)]
    const windows = buildMaintenanceWindows(forecasts)
    if (forecasts[0]!.predictions.length > 0) {
      expect(windows.length).toBeGreaterThan(0)
      expect(windows[0]!.file).toBe('complex.ts')
    }
  })

  it('returns empty for clean forecasts', () => {
    const forecasts = [buildForecast('clean.ts', SIMPLE_CODE)]
    expect(buildMaintenanceWindows(forecasts)).toEqual([])
  })
})

// ─── buildStats ───────────────────────────────────────────────────────────────

describe('buildStats', () => {
  it('computes stats from forecasts', () => {
    const forecasts = [
      buildForecast('clean.ts', SIMPLE_CODE),
      buildForecast('complex.ts', COMPLEX_CODE),
    ]
    const stats = buildStats(forecasts)
    expect(stats.totalForecasts).toBe(2)
    expect(stats.mostAtRiskFile).toBeTruthy()
    expect(stats.safestFile).toBeTruthy()
  })

  it('handles empty', () => {
    const stats = buildStats([])
    expect(stats.totalForecasts).toBe(0)
    expect(stats.avgMaintenanceScore).toBe(100)
  })
})

// ─── computeTechDebtIndex ─────────────────────────────────────────────────────

describe('computeTechDebtIndex', () => {
  it('returns 0 for clean forecasts', () => {
    const forecasts = [buildForecast('clean.ts', SIMPLE_CODE)]
    expect(computeTechDebtIndex(forecasts)).toBe(0)
  })

  it('returns higher for debt-ridden forecasts', () => {
    const forecasts = [buildForecast('debt.ts', DEBT_CODE)]
    expect(computeTechDebtIndex(forecasts)).toBeGreaterThan(0)
  })

  it('returns 0 for empty', () => {
    expect(computeTechDebtIndex([])).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends addressing critical risks', () => {
    const forecasts = [buildForecast('complex.ts', COMPLEX_CODE)]
    const stats = buildStats(forecasts)
    const recs = generateRecommendations(forecasts, [], stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('praises healthy codebase', () => {
    const forecasts = [buildForecast('clean.ts', SIMPLE_CODE)]
    const stats = buildStats(forecasts)
    const recs = generateRecommendations(forecasts, [], stats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildPredictResult ───────────────────────────────────────────────────────

describe('buildPredictResult', () => {
  it('builds complete result', () => {
    const result = buildPredictResult(
      ['clean.ts', 'complex.ts'],
      [SIMPLE_CODE, COMPLEX_CODE],
    )
    expect(result.forecasts.length).toBe(2)
    expect(result.stats.totalForecasts).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildPredictResult([], [])
    expect(result.forecasts).toEqual([])
    expect(result.stats.avgMaintenanceScore).toBe(100)
  })

  it('identifies most at risk file', () => {
    const result = buildPredictResult(
      ['clean.ts', 'debt.ts'],
      [SIMPLE_CODE, DEBT_CODE],
    )
    expect(result.stats.mostAtRiskFile).toBe('debt.ts')
  })

  it('identifies safest file', () => {
    const result = buildPredictResult(
      ['clean.ts', 'debt.ts'],
      [SIMPLE_CODE, DEBT_CODE],
    )
    expect(result.stats.safestFile).toBe('clean.ts')
  })

  it('computes tech debt index', () => {
    const result = buildPredictResult(['debt.ts'], [DEBT_CODE])
    expect(result.stats.estimatedTechDebtIndex).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatForecastCards', () => {
  it('formats forecast cards', () => {
    const forecasts = [buildForecast('a.ts', COMPLEX_CODE)]
    expect(formatForecastCards(forecasts)).toContain('Forecast Cards')
  })

  it('handles empty', () => {
    expect(formatForecastCards([])).toContain('No forecasts')
  })
})

describe('formatRiskHeatmap', () => {
  it('formats heatmap', () => {
    const forecasts = [buildForecast('a.ts', COMPLEX_CODE)]
    expect(formatRiskHeatmap(forecasts)).toContain('Risk Heatmap')
  })

  it('handles empty', () => {
    expect(formatRiskHeatmap([])).toContain('No risk data')
  })
})

describe('formatMaintenanceTimeline', () => {
  it('formats timeline', () => {
    const result = buildPredictResult(['a.ts'], [COMPLEX_CODE])
    if (result.maintenanceWindows.length > 0) {
      expect(formatMaintenanceTimeline(result.maintenanceWindows)).toContain('Maintenance Timeline')
    }
  })

  it('handles empty', () => {
    expect(formatMaintenanceTimeline([])).toContain('No maintenance')
  })
})

describe('formatTechDebtMeter', () => {
  it('formats meter', () => {
    expect(formatTechDebtMeter(42)).toContain('42/100')
  })
})

describe('formatRiskFactors', () => {
  it('formats factors', () => {
    const factors: RiskFactor[] = [{ name: 'bug-risk', file: 'a.ts', weight: 8, description: 'High complexity' }]
    expect(formatRiskFactors(factors)).toContain('Risk Factors')
  })

  it('handles empty', () => {
    expect(formatRiskFactors([])).toContain('No significant')
  })
})

describe('formatPredictStats', () => {
  it('formats stats', () => {
    const stats: PredictStats = {
      totalForecasts: 5, lowRiskCount: 2, mediumRiskCount: 1, highRiskCount: 1, criticalRiskCount: 1,
      avgMaintenanceScore: 72, mostAtRiskFile: 'a.ts', safestFile: 'b.ts', topRiskType: 'bug-risk',
      immediateActionsNeeded: 3, estimatedTechDebtIndex: 45,
    }
    const output = formatPredictStats(stats)
    expect(output).toContain('5')
    expect(output).toContain('72/100')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatPredictTable', () => {
  it('formats full table', () => {
    const result = buildPredictResult(['a.ts'], [COMPLEX_CODE])
    const output = formatPredictTable(result)
    expect(output).toContain('Forecast Cards')
    expect(output).toContain('Risk Heatmap')
  })
})

describe('formatPredictJSON', () => {
  it('formats valid JSON', () => {
    const result = buildPredictResult(['a.ts'], [SIMPLE_CODE])
    const json = formatPredictJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.forecasts).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes realistic codebase', () => {
    const result = buildPredictResult(
      ['clean.ts', 'complex.ts', 'debt.ts', 'api.ts'],
      [CLEAN_CODE, COMPLEX_CODE, DEBT_CODE, API_CODE],
    )
    expect(result.forecasts.length).toBe(4)
    expect(result.riskFactors.length).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.stats.totalForecasts).toBe(4)
  })

  it('round-trips through JSON', () => {
    const result = buildPredictResult(['a.ts'], [COMPLEX_CODE])
    const json = formatPredictJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.forecasts.length).toBe(result.forecasts.length)
    expect(parsed.stats.estimatedTechDebtIndex).toBe(result.stats.estimatedTechDebtIndex)
  })

  it('ranks files by risk correctly', () => {
    const result = buildPredictResult(
      ['safe.ts', 'risky.ts'],
      [SIMPLE_CODE, DEBT_CODE],
    )
    expect(result.stats.mostAtRiskFile).toBe('risky.ts')
    expect(result.stats.safestFile).toBe('safe.ts')
  })
})
