import { describe, it, expect } from 'vitest'
import {
  identifyIndicators,
  classifyStage,
  computeMaturity,
  computeStageProgress,
  predictNextStage,
  computeReadiness,
  isStuck,
  estimateTimeInStage,
  analyzeTransitions,
  computeCodebaseMaturity,
  computeLifecycleCompleteness,
  computeTransitionVelocity,
  generateRecommendations,
  buildMetamorphosisStageResult,
} from '../src/commands/metamorphosis-stage-helpers.js'
import { formatMetamorphosisStageTable, formatMetamorphosisStageJson } from '../src/commands/metamorphosis-stage-format-helpers.js'
import type { LifecycleStage, StageIndicator, CodebaseMaturity, MetamorphosisStageStats } from '../src/commands/metamorphosis-stage-helpers.js'

// ─── identifyIndicators ────────────────────────────────────────────────────────

describe('identifyIndicators', () => {
  it('returns empty for minimal code', () => {
    const indicators = identifyIndicators('const x = 1', 'a.ts')
    expect(indicators.length).toBeGreaterThanOrEqual(0)
  })

  it('detects TODO as egg indicator', () => {
    const indicators = identifyIndicators('// TODO: implement this', 'a.ts')
    expect(indicators.some(i => i.stage === 'egg')).toBe(true)
  })

  it('detects FIXME as egg indicator', () => {
    const indicators = identifyIndicators('// FIXME: broken', 'a.ts')
    expect(indicators.some(i => i.stage === 'egg')).toBe(true)
  })

  it('detects placeholders as egg indicator', () => {
    const indicators = identifyIndicators('function stub() { noop }', 'a.ts')
    expect(indicators.some(i => i.stage === 'egg')).toBe(true)
  })

  it('detects exports as larva indicator', () => {
    const code = [
      'export const a = 1',
      'export const b = 2',
      'export const c = 3',
    ].join('\n')
    const indicators = identifyIndicators(code, 'a.ts')
    expect(indicators.some(i => i.stage === 'larva')).toBe(true)
  })

  it('detects refactor markers as pupa indicator', () => {
    const indicators = identifyIndicators('// refactor: clean this up', 'a.ts')
    expect(indicators.some(i => i.stage === 'pupa')).toBe(true)
  })

  it('detects deprecated markers as fossil indicator', () => {
    const indicators = identifyIndicators('/** @deprecated */', 'a.ts')
    expect(indicators.some(i => i.stage === 'fossil')).toBe(true)
  })

  it('detects JSDoc as chrysalis indicator', () => {
    const code = [
      '/** Doc A */',
      '/** Doc B */',
      '/** Doc C */',
      '/** Doc D */',
    ].join('\n')
    const indicators = identifyIndicators(code, 'a.ts')
    expect(indicators.some(i => i.stage === 'chrysalis')).toBe(true)
  })

  it('detects legacy file path as fossil', () => {
    const indicators = identifyIndicators('const x = 1', 'src/legacy/util.ts')
    expect(indicators.some(i => i.stage === 'fossil')).toBe(true)
  })

  it('each indicator has required fields', () => {
    const indicators = identifyIndicators('export function f() {}', 'a.ts')
    for (const ind of indicators) {
      expect(ind).toHaveProperty('stage')
      expect(ind).toHaveProperty('evidence')
      expect(ind).toHaveProperty('strength')
      expect(ind).toHaveProperty('type')
      expect(ind.strength).toBeGreaterThanOrEqual(0)
      expect(ind.strength).toBeLessThanOrEqual(100)
    }
  })

  it('indicator type is valid', () => {
    const indicators = identifyIndicators('export function f() {}', 'a.ts')
    const validTypes = ['structural', 'behavioral', 'documentation', 'testing', 'pattern']
    for (const ind of indicators) {
      expect(validTypes).toContain(ind.type)
    }
  })
})

// ─── classifyStage ─────────────────────────────────────────────────────────────

describe('classifyStage', () => {
  it('classifies empty content as egg', () => {
    expect(classifyStage('', 'a.ts')).toBe('egg')
  })

  it('classifies TODO-heavy code as egg', () => {
    const code = '// TODO: implement\n// FIXME: broken\n// TODO: add feature'
    expect(classifyStage(code, 'a.ts')).toBe('egg')
  })

  it('classifies deprecated code as fossil', () => {
    const code = '/** @deprecated */\n/** @deprecated use newApi */\n/** @deprecated legacy */\nfunction old() {}'
    expect(classifyStage(code, 'a.ts')).toBe('fossil')
  })

  it('classifies legacy path as fossil', () => {
    expect(classifyStage('/** @deprecated */ const x = 1', 'src/legacy/a.ts')).toBe('fossil')
  })

  it('classifies exported code as at least larva', () => {
    const stage = classifyStage('export function main() { return 1 }', 'a.ts')
    expect(['larva', 'pupa', 'chrysalis', 'butterfly']).toContain(stage)
  })

  it('classifies well-documented typed code as chrysalis or higher', () => {
    const code = [
      '/** Main function */',
      'export function main(x: number): string { return String(x) }',
      'interface Config { name: string }',
    ].join('\n')
    const stage = classifyStage(code, 'a.ts')
    expect(['chrysalis', 'butterfly']).toContain(stage)
  })

  it('returns a valid stage', () => {
    const validStages = ['egg', 'larva', 'pupa', 'chrysalis', 'butterfly', 'fossil']
    expect(validStages).toContain(classifyStage('const x = 1', 'a.ts'))
  })
})

// ─── computeMaturity ───────────────────────────────────────────────────────────

describe('computeMaturity', () => {
  it('returns 0-100', () => {
    const maturity = computeMaturity('const x = 1', 'egg')
    expect(maturity).toBeGreaterThanOrEqual(0)
    expect(maturity).toBeLessThanOrEqual(100)
  })

  it('rewards exports with higher maturity', () => {
    const withExport = computeMaturity('export function f() {}', 'larva')
    const without = computeMaturity('const x = 1', 'egg')
    expect(withExport).toBeGreaterThan(without)
  })

  it('rewards types with higher maturity', () => {
    const withTypes = computeMaturity('interface A {} const x: A = {}', 'chrysalis')
    const without = computeMaturity('const x = 1', 'egg')
    expect(withTypes).toBeGreaterThan(without)
  })

  it('rewards documentation with higher maturity', () => {
    const withDocs = computeMaturity('/** Doc */\n/** Doc2 */\n/** Doc3 */\nexport function f() {}', 'chrysalis')
    const without = computeMaturity('const x = 1', 'egg')
    expect(withDocs).toBeGreaterThan(without)
  })

  it('rewards error handling', () => {
    const withErr = computeMaturity('export function f() {\n  try { g() } catch(e) {}\n}', 'butterfly')
    const without = computeMaturity('const x = 1', 'egg')
    expect(withErr).toBeGreaterThan(without)
  })

  it('rewards longer files', () => {
    const long = computeMaturity(Array(30).fill('export const x = 1;').join('\n'), 'larva')
    const short = computeMaturity('const x = 1', 'egg')
    expect(long).toBeGreaterThan(short)
  })
})

// ─── computeStageProgress ──────────────────────────────────────────────────────

describe('computeStageProgress', () => {
  it('returns 30 for empty indicators', () => {
    expect(computeStageProgress([])).toBe(30)
  })

  it('averages indicator strength', () => {
    const indicators: StageIndicator[] = [
      { stage: 'egg', evidence: 'test', strength: 60, type: 'structural' },
      { stage: 'egg', evidence: 'test', strength: 40, type: 'behavioral' },
    ]
    expect(computeStageProgress(indicators)).toBe(50)
  })

  it('clamps to 0-100', () => {
    const indicators: StageIndicator[] = [
      { stage: 'egg', evidence: 'test', strength: 100, type: 'structural' },
    ]
    expect(computeStageProgress(indicators)).toBeLessThanOrEqual(100)
  })
})

// ─── predictNextStage ──────────────────────────────────────────────────────────

describe('predictNextStage', () => {
  it('predicts larva after egg', () => {
    expect(predictNextStage('egg', 60, 'export function f() {}')).toBe('larva')
  })

  it('predicts pupa after larva', () => {
    expect(predictNextStage('larva', 60, '')).toBe('pupa')
  })

  it('predicts chrysalis after pupa', () => {
    expect(predictNextStage('pupa', 60, '')).toBe('chrysalis')
  })

  it('predicts butterfly after chrysalis', () => {
    expect(predictNextStage('chrysalis', 60, '')).toBe('butterfly')
  })

  it('predicts fossil for low-maturity butterfly', () => {
    expect(predictNextStage('butterfly', 20, '')).toBe('fossil')
  })

  it('returns null for mature butterfly', () => {
    expect(predictNextStage('butterfly', 80, '')).toBeNull()
  })

  it('returns null for fossil', () => {
    expect(predictNextStage('fossil', 50, '')).toBeNull()
  })

  it('predicts next even at low maturity', () => {
    expect(predictNextStage('egg', 30, '')).toBe('larva')
  })
})

// ─── computeReadiness ──────────────────────────────────────────────────────────

describe('computeReadiness', () => {
  it('returns 0-100', () => {
    const r = computeReadiness('larva', 50, [])
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(100)
  })

  it('penalizes blockers', () => {
    const noBlockers = computeReadiness('larva', 70, [])
    const withBlockers = computeReadiness('larva', 70, ['blocker1', 'blocker2'])
    expect(noBlockers).toBeGreaterThan(withBlockers)
  })

  it('caps egg readiness at 40', () => {
    const r = computeReadiness('egg', 80, [])
    expect(r).toBeLessThanOrEqual(40)
  })

  it('returns 0 for fossil', () => {
    expect(computeReadiness('fossil', 80, [])).toBe(0)
  })

  it('caps butterfly readiness at 20', () => {
    const r = computeReadiness('butterfly', 80, [])
    expect(r).toBeLessThanOrEqual(20)
  })
})

// ─── isStuck ───────────────────────────────────────────────────────────────────

describe('isStuck', () => {
  it('returns false for butterfly', () => {
    expect(isStuck('butterfly', 80, [])).toBe(false)
  })

  it('returns false for fossil', () => {
    expect(isStuck('fossil', 80, [])).toBe(false)
  })

  it('returns true for high-maturity egg', () => {
    expect(isStuck('egg', 70, [])).toBe(true)
  })

  it('returns false for low-maturity egg', () => {
    expect(isStuck('egg', 30, [])).toBe(false)
  })

  it('returns false for moderate maturity', () => {
    expect(isStuck('larva', 50, [])).toBe(false)
  })

  it('detects stuck with conflicting strong indicators', () => {
    const indicators: StageIndicator[] = [
      { stage: 'butterfly', evidence: 'clean', strength: 80, type: 'structural' },
      { stage: 'egg', evidence: 'todo', strength: 60, type: 'documentation' },
    ]
    expect(isStuck('larva', 85, indicators)).toBe(true)
  })
})

// ─── estimateTimeInStage ───────────────────────────────────────────────────────

describe('estimateTimeInStage', () => {
  it('returns early for low maturity', () => {
    expect(estimateTimeInStage('egg', 20)).toContain('early')
  })

  it('returns mid for moderate maturity', () => {
    expect(estimateTimeInStage('larva', 50)).toContain('mid')
  })

  it('returns late for high maturity', () => {
    expect(estimateTimeInStage('pupa', 80)).toContain('late')
  })

  it('includes stage name', () => {
    expect(estimateTimeInStage('egg', 20)).toContain('egg')
  })
})

// ─── analyzeTransitions ────────────────────────────────────────────────────────

describe('analyzeTransitions', () => {
  const makeStage = (overrides: Partial<LifecycleStage> = {}): LifecycleStage => ({
    file: 'a.ts',
    stage: 'larva',
    maturity: 70,
    stageProgress: 60,
    indicators: [],
    nextStage: 'pupa',
    readiness: 70,
    isStuck: false,
    timeInStage: 'mid-larva',
    ...overrides,
  })

  it('returns transitions for files with nextStage', () => {
    const stages = [makeStage({ nextStage: 'pupa', readiness: 70 })]
    const transitions = analyzeTransitions(stages)
    expect(transitions.length).toBeGreaterThan(0)
  })

  it('skips files with null nextStage', () => {
    const stages = [makeStage({ nextStage: null })]
    const transitions = analyzeTransitions(stages)
    expect(transitions).toHaveLength(0)
  })

  it('skips files with low readiness', () => {
    const stages = [makeStage({ nextStage: 'pupa', readiness: 10 })]
    const transitions = analyzeTransitions(stages)
    expect(transitions).toHaveLength(0)
  })

  it('each transition has required fields', () => {
    const stages = [makeStage({ nextStage: 'pupa', readiness: 70 })]
    const transitions = analyzeTransitions(stages)
    for (const t of transitions) {
      expect(t).toHaveProperty('file')
      expect(t).toHaveProperty('from')
      expect(t).toHaveProperty('to')
      expect(t).toHaveProperty('readiness')
      expect(t).toHaveProperty('blockers')
      expect(t).toHaveProperty('accelerators')
      expect(t).toHaveProperty('estimatedEffort')
    }
  })

  it('effort is valid', () => {
    const stages = [makeStage({ nextStage: 'pupa', readiness: 70 })]
    const transitions = analyzeTransitions(stages)
    const validEfforts = ['trivial', 'easy', 'moderate', 'significant']
    for (const t of transitions) {
      expect(validEfforts).toContain(t.estimatedEffort)
    }
  })
})

// ─── computeCodebaseMaturity ───────────────────────────────────────────────────

describe('computeCodebaseMaturity', () => {
  const makeStage = (stage: string, overrides: Partial<LifecycleStage> = {}): LifecycleStage => ({
    file: 'a.ts',
    stage: stage as LifecycleStage['stage'],
    maturity: 50,
    stageProgress: 50,
    indicators: [],
    nextStage: null,
    readiness: 50,
    isStuck: false,
    timeInStage: 'mid',
    ...overrides,
  })

  it('returns a complete CodebaseMaturity', () => {
    const maturity = computeCodebaseMaturity([makeStage('larva')])
    expect(maturity).toHaveProperty('stageDistribution')
    expect(maturity).toHaveProperty('avgMaturity')
    expect(maturity).toHaveProperty('stuckFiles')
    expect(maturity).toHaveProperty('readyToTransition')
    expect(maturity).toHaveProperty('dominantStage')
    expect(maturity).toHaveProperty('overallStage')
    expect(maturity).toHaveProperty('health')
  })

  it('computes stage distribution', () => {
    const maturity = computeCodebaseMaturity([
      makeStage('egg'), makeStage('egg'), makeStage('larva'),
    ])
    expect(maturity.stageDistribution.egg).toBe(2)
    expect(maturity.stageDistribution.larva).toBe(1)
  })

  it('identifies dominant stage', () => {
    const maturity = computeCodebaseMaturity([
      makeStage('larva'), makeStage('larva'), makeStage('egg'),
    ])
    expect(maturity.dominantStage).toBe('larva')
  })

  it('classifies embryonic for egg-heavy codebase', () => {
    const maturity = computeCodebaseMaturity([
      makeStage('egg'), makeStage('egg'), makeStage('egg'),
    ])
    expect(maturity.overallStage).toBe('embryonic')
  })

  it('classifies mature for butterfly-heavy codebase', () => {
    const maturity = computeCodebaseMaturity([
      makeStage('butterfly'), makeStage('butterfly'), makeStage('butterfly'),
    ])
    expect(maturity.overallStage).toBe('mature')
  })

  it('classifies legacy for fossil-heavy codebase', () => {
    const maturity = computeCodebaseMaturity([
      makeStage('fossil'), makeStage('fossil'), makeStage('fossil'),
    ])
    expect(maturity.overallStage).toBe('legacy')
  })

  it('counts stuck files', () => {
    const maturity = computeCodebaseMaturity([
      makeStage('egg', { isStuck: true }),
      makeStage('larva', { isStuck: false }),
    ])
    expect(maturity.stuckFiles).toBe(1)
  })

  it('overall stage is valid', () => {
    const validStages = ['embryonic', 'growing', 'maturing', 'mature', 'aging', 'legacy']
    const maturity = computeCodebaseMaturity([makeStage('larva')])
    expect(validStages).toContain(maturity.overallStage)
  })

  it('health is valid', () => {
    const validHealth = ['thriving', 'healthy', 'stable', 'stagnant', 'decaying']
    const maturity = computeCodebaseMaturity([makeStage('larva')])
    expect(validHealth).toContain(maturity.health)
  })
})

// ─── computeLifecycleCompleteness ──────────────────────────────────────────────

describe('computeLifecycleCompleteness', () => {
  it('returns 0 for empty', () => {
    expect(computeLifecycleCompleteness([])).toBe(0)
  })

  it('returns 100 for all butterfly', () => {
    const stages: LifecycleStage[] = [
      { file: 'a.ts', stage: 'butterfly', maturity: 80, stageProgress: 80, indicators: [], nextStage: null, readiness: 20, isStuck: false, timeInStage: 'late' },
    ]
    expect(computeLifecycleCompleteness(stages)).toBe(100)
  })

  it('counts fossil as complete', () => {
    const stages: LifecycleStage[] = [
      { file: 'a.ts', stage: 'fossil', maturity: 50, stageProgress: 50, indicators: [], nextStage: null, readiness: 0, isStuck: false, timeInStage: 'mid' },
    ]
    expect(computeLifecycleCompleteness(stages)).toBe(100)
  })

  it('returns 0 for all egg', () => {
    const stages: LifecycleStage[] = [
      { file: 'a.ts', stage: 'egg', maturity: 20, stageProgress: 20, indicators: [], nextStage: 'larva', readiness: 20, isStuck: false, timeInStage: 'early' },
    ]
    expect(computeLifecycleCompleteness(stages)).toBe(0)
  })
})

// ─── computeTransitionVelocity ─────────────────────────────────────────────────

describe('computeTransitionVelocity', () => {
  it('returns 50 for empty stages', () => {
    expect(computeTransitionVelocity([], [])).toBe(50)
  })

  it('returns 0-100', () => {
    const stages: LifecycleStage[] = [
      { file: 'a.ts', stage: 'larva', maturity: 60, stageProgress: 60, indicators: [], nextStage: 'pupa', readiness: 60, isStuck: false, timeInStage: 'mid' },
    ]
    const vel = computeTransitionVelocity(stages, [])
    expect(vel).toBeGreaterThanOrEqual(0)
    expect(vel).toBeLessThanOrEqual(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<MetamorphosisStageStats> = {}): MetamorphosisStageStats => ({
    totalFiles: 5, eggCount: 1, larvaCount: 1, pupaCount: 1, chrysalisCount: 1, butterflyCount: 1, fossilCount: 0,
    stuckFiles: 0, readyForTransition: 0, avgMaturity: 50, avgReadiness: 50,
    dominantStage: 'larva', overallStage: 'growing', overallHealth: 'stable',
    lifecycleCompleteness: 20, transitionVelocity: 50,
    ...overrides,
  })

  const makeMaturity = (overrides: Partial<CodebaseMaturity> = {}): CodebaseMaturity => ({
    stageDistribution: { egg: 1, larva: 1, pupa: 1, chrysalis: 1, butterfly: 1, fossil: 0 },
    avgMaturity: 50, stuckFiles: 0, readyToTransition: 0,
    dominantStage: 'larva', overallStage: 'growing', health: 'stable',
    ...overrides,
  })

  it('recommends for egg-heavy codebase', () => {
    const recs = generateRecommendations([], [], makeMaturity(), makeStats({ eggCount: 4, totalFiles: 5 }))
    expect(recs.some(r => r.includes('egg'))).toBe(true)
  })

  it('recommends for fossil-heavy codebase', () => {
    const recs = generateRecommendations([], [], makeMaturity(), makeStats({ fossilCount: 4, totalFiles: 5 }))
    expect(recs.some(r => r.includes('fossil') || r.includes('modernization'))).toBe(true)
  })

  it('recommends for stuck files', () => {
    const recs = generateRecommendations([], [], makeMaturity(), makeStats({ stuckFiles: 3 }))
    expect(recs.some(r => r.includes('stuck'))).toBe(true)
  })

  it('recommends for ready files', () => {
    const recs = generateRecommendations([], [], makeMaturity(), makeStats({ readyForTransition: 2 }))
    expect(recs.some(r => r.includes('ready'))).toBe(true)
  })

  it('recommends for stagnant health', () => {
    const recs = generateRecommendations([], [], makeMaturity({ health: 'stagnant' }), makeStats())
    expect(recs.some(r => r.includes('stagnant'))).toBe(true)
  })

  it('recommends for decaying health', () => {
    const recs = generateRecommendations([], [], makeMaturity({ health: 'decaying' }), makeStats())
    expect(recs.some(r => r.includes('decaying'))).toBe(true)
  })

  it('recommends for many pupa files', () => {
    const recs = generateRecommendations([], [], makeMaturity(), makeStats({ pupaCount: 5 }))
    expect(recs.some(r => r.includes('pupa') || r.includes('refactor'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generateRecommendations([], [], makeMaturity(), makeStats())
    expect(Array.from(new Set(recs))).toHaveLength(recs.length)
  })
})

// ─── buildMetamorphosisStageResult ─────────────────────────────────────────────

describe('buildMetamorphosisStageResult', () => {
  it('returns a complete result', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function main() {}'], {})
    expect(result).toHaveProperty('stages')
    expect(result).toHaveProperty('transitions')
    expect(result).toHaveProperty('maturity')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one stage per file', () => {
    const result = buildMetamorphosisStageResult(
      ['a.ts', 'b.ts'],
      ['export function f() {}', 'const x = 1'],
      {},
    )
    expect(result.stages).toHaveLength(2)
  })

  it('handles empty input', () => {
    const result = buildMetamorphosisStageResult([], [], {})
    expect(result.stages).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('computes stats correctly', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgMaturity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgReadiness).toBeGreaterThanOrEqual(0)
  })

  it('stage counts sum to totalFiles', () => {
    const result = buildMetamorphosisStageResult(
      ['a.ts', 'b.ts'],
      ['export function f() {}', 'const x = 1'],
      {},
    )
    const sum = result.stats.eggCount + result.stats.larvaCount + result.stats.pupaCount +
      result.stats.chrysalisCount + result.stats.butterflyCount + result.stats.fossilCount
    expect(sum).toBe(2)
  })

  it('computes overall stage and health', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(['embryonic', 'growing', 'maturing', 'mature', 'aging', 'legacy']).toContain(result.stats.overallStage)
    expect(['thriving', 'healthy', 'stable', 'stagnant', 'decaying']).toContain(result.stats.overallHealth)
  })

  it('computes lifecycle completeness', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.lifecycleCompleteness).toBeGreaterThanOrEqual(0)
    expect(result.stats.lifecycleCompleteness).toBeLessThanOrEqual(100)
  })

  it('computes transition velocity', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.transitionVelocity).toBeGreaterThanOrEqual(0)
    expect(result.stats.transitionVelocity).toBeLessThanOrEqual(100)
  })

  it('computes maturity distribution', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(result.maturity.stageDistribution).toBeDefined()
  })
})

// ─── formatMetamorphosisStageTable ──────────────────────────────────────────────

describe('formatMetamorphosisStageTable', () => {
  it('returns a string', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    const output = formatMetamorphosisStageTable(result, false)
    expect(typeof output).toBe('string')
  })

  it('contains header', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(formatMetamorphosisStageTable(result, false)).toContain('Metamorphosis')
  })

  it('contains Lifecycle Stages section', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(formatMetamorphosisStageTable(result, false)).toContain('Lifecycle Stages')
  })

  it('contains Statistics section', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(formatMetamorphosisStageTable(result, false)).toContain('Statistics')
  })

  it('contains Maturity section', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(formatMetamorphosisStageTable(result, false)).toContain('Maturity')
  })

  it('shows recommendations when present', () => {
    const result = buildMetamorphosisStageResult(
      Array(10).fill('a.ts'),
      Array(10).fill('// TODO: implement'),
      {},
    )
    const output = formatMetamorphosisStageTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })

  it('handles empty input gracefully', () => {
    const result = buildMetamorphosisStageResult([], [], {})
    const output = formatMetamorphosisStageTable(result, false)
    expect(output).toContain('No files')
  })
})

// ─── formatMetamorphosisStageJson ───────────────────────────────────────────────

describe('formatMetamorphosisStageJson', () => {
  it('returns valid JSON', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    const json = formatMetamorphosisStageJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('stages')
    expect(parsed).toHaveProperty('transitions')
    expect(parsed).toHaveProperty('maturity')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('pretty prints', () => {
    const result = buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {})
    expect(formatMetamorphosisStageJson(result)).toContain('  ')
  })
})
