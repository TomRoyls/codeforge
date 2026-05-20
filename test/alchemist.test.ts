import { describe, expect, it } from 'vitest'

import {
  buildAlchemistResult,
  computeNextGrade,
  computePhilosopherStoneScore,
  computePurity,
  determineGrade,
  determineEffort,
  generateRecommendations,
  generateTransmutationSteps,
  getMasterElements,
  measureClarity,
  measureComplexity,
  measureDocumentation,
  measureErrorHandling,
  measureStructure,
  measureTesting,
  measureTypeSafety,
  type AlchemistStats,
  type Element,
  type Transmutation,
} from '../src/commands/alchemist-helpers.js'

import {
  formatAlchemistJSON,
  formatAlchemistStats,
  formatAlchemistTable,
  formatElementTable,
  formatGradeBadge,
  formatGradeDistribution,
  formatPhilosopherStoneProgress,
  formatPurityMeter,
  formatRecommendations,
  formatTransmutationPlan,
} from '../src/commands/alchemist-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const GOLD_CODE = `/**
 * Adds two numbers.
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Multiplies two numbers.
 */
export function multiply(a: number, b: number): number {
  return a * b
}
`

const LEAD_CODE = `
var x = 1
var y = 2
var z = 3
if (x) { if (y) { if (z) { for (let i = 0; i < 100; i++) { while (w) { if (a) { if (b) { if (c) { } } } } } } } }
// TODO: fix this
// FIXME: broken
// HACK: workaround
`

const SILVER_CODE = `export function processData(input: string): string {
  if (!input) throw new Error('empty')
  try {
    return input.toUpperCase()
  } catch (e) {
    return ''
  }
}

export function validateData(data: unknown): boolean {
  return typeof data === 'string'
}
`

const BRONZE_CODE = `function doStuff(x: any, y: any): any {
  if (x) {
    if (y) {
      for (let i = 0; i < 100; i++) {
        while (true) {
          if (x && y || z) {}
        }
      }
    }
  }
}
`

// ─── determineGrade ───────────────────────────────────────────────────────────

describe('determineGrade', () => {
  it('returns Lead for 0-20', () => {
    expect(determineGrade(0)).toBe('Lead')
    expect(determineGrade(10)).toBe('Lead')
    expect(determineGrade(20)).toBe('Lead')
  })

  it('returns Copper for 21-40', () => {
    expect(determineGrade(21)).toBe('Copper')
    expect(determineGrade(30)).toBe('Copper')
    expect(determineGrade(40)).toBe('Copper')
  })

  it('returns Bronze for 41-60', () => {
    expect(determineGrade(41)).toBe('Bronze')
    expect(determineGrade(50)).toBe('Bronze')
    expect(determineGrade(60)).toBe('Bronze')
  })

  it('returns Silver for 61-75', () => {
    expect(determineGrade(61)).toBe('Silver')
    expect(determineGrade(75)).toBe('Silver')
  })

  it('returns Gold for 76-90', () => {
    expect(determineGrade(76)).toBe('Gold')
    expect(determineGrade(90)).toBe('Gold')
  })

  it('returns Platinum for 91-100', () => {
    expect(determineGrade(91)).toBe('Platinum')
    expect(determineGrade(100)).toBe('Platinum')
  })
})

// ─── computeNextGrade ─────────────────────────────────────────────────────────

describe('computeNextGrade', () => {
  it('returns next grade for Lead', () => {
    const next = computeNextGrade('Lead')
    expect(next.name).toBe('Copper')
    expect(next.requiredPurity).toBe(21)
  })

  it('returns next grade for Silver', () => {
    const next = computeNextGrade('Silver')
    expect(next.name).toBe('Gold')
    expect(next.requiredPurity).toBe(76)
  })

  it('returns Platinum for Platinum', () => {
    const next = computeNextGrade('Platinum')
    expect(next.name).toBe('Platinum')
    expect(next.requiredPurity).toBe(91)
  })
})

// ─── measureDocumentation ─────────────────────────────────────────────────────

describe('measureDocumentation', () => {
  it('scores well-documented code', () => {
    const el = measureDocumentation(GOLD_CODE)
    expect(el.symbol).toBe('Au')
    expect(el.value).toBeGreaterThan(50)
  })

  it('scores undocumented code low', () => {
    const el = measureDocumentation('export function foo() {}')
    expect(el.value).toBe(0)
  })

  it('scores no-export code reasonably', () => {
    const el = measureDocumentation('const x = 1')
    expect(el.value).toBeGreaterThanOrEqual(50)
  })
})

// ─── measureClarity ───────────────────────────────────────────────────────────

describe('measureClarity', () => {
  it('scores clear code', () => {
    const el = measureClarity('function processData() { return 1 }')
    expect(el.symbol).toBe('Ag')
    expect(el.value).toBeGreaterThan(0)
  })

  it('scores no-function code', () => {
    const el = measureClarity('const x = 1')
    expect(el.value).toBe(70)
  })
})

// ─── measureStructure ─────────────────────────────────────────────────────────

describe('measureStructure', () => {
  it('scores flat code well', () => {
    const el = measureStructure('const x = 1\nconst y = 2')
    expect(el.symbol).toBe('Fe')
    expect(el.value).toBeGreaterThan(70)
  })

  it('penalizes deep nesting', () => {
    const el = measureStructure(LEAD_CODE)
    expect(el.value).toBeLessThanOrEqual(80)
  })
})

// ─── measureTypeSafety ────────────────────────────────────────────────────────

describe('measureTypeSafety', () => {
  it('scores typed code well', () => {
    const el = measureTypeSafety('const x: number = 1\nfunction foo(a: string): void {}')
    expect(el.symbol).toBe('Cu')
    expect(el.value).toBeGreaterThan(80)
  })

  it('penalizes any usage', () => {
    const el = measureTypeSafety('const x: any = 1\nfunction foo(a: any): any {}')
    expect(el.value).toBeLessThan(60)
  })

  it('penalizes ts-ignore', () => {
    const el = measureTypeSafety('// @ts-ignore\nconst x = 1')
    expect(el.value).toBeLessThan(80)
  })
})

// ─── measureErrorHandling ─────────────────────────────────────────────────────

describe('measureErrorHandling', () => {
  it('scores error-handled code well', () => {
    const el = measureErrorHandling(SILVER_CODE)
    expect(el.symbol).toBe('Sn')
    expect(el.value).toBeGreaterThan(60)
  })

  it('scores no-function code reasonably', () => {
    const el = measureErrorHandling('const x = 1')
    expect(el.value).toBeGreaterThanOrEqual(50)
  })
})

// ─── measureTesting ───────────────────────────────────────────────────────────

describe('measureTesting', () => {
  it('scores test files high', () => {
    const el = measureTesting('foo.test.ts', 'it("works", () => {})')
    expect(el.symbol).toBe('Pt')
    expect(el.value).toBe(95)
  })

  it('scores spec files high', () => {
    const el = measureTesting('bar.spec.ts', '')
    expect(el.value).toBe(95)
  })

  it('scores non-test files low', () => {
    const el = measureTesting('foo.ts', 'const x = 1')
    expect(el.value).toBe(30)
  })

  it('scores files with test patterns', () => {
    const el = measureTesting('util.ts', 'describe("x", () => { it("works", () => {}) })')
    expect(el.value).toBe(80)
  })
})

// ─── measureComplexity ────────────────────────────────────────────────────────

describe('measureComplexity', () => {
  it('scores simple code high', () => {
    const el = measureComplexity('const x = 1')
    expect(el.symbol).toBe('Hg')
    expect(el.value).toBeGreaterThanOrEqual(80)
  })

  it('penalizes complex code', () => {
    const el = measureComplexity(LEAD_CODE)
    expect(el.value).toBeLessThan(95)
  })
})

// ─── computePurity ────────────────────────────────────────────────────────────

describe('computePurity', () => {
  it('computes weighted average', () => {
    const elements: Element[] = [
      { symbol: 'Au', name: 'Aurum', property: 'Documentation', value: 100, weight: 1.0 },
      { symbol: 'Ag', name: 'Argentum', property: 'Clarity', value: 50, weight: 1.0 },
    ]
    expect(computePurity(elements)).toBe(75)
  })

  it('handles empty', () => {
    expect(computePurity([])).toBe(0)
  })

  it('applies weights correctly', () => {
    const elements: Element[] = [
      { symbol: 'Au', name: 'Aurum', property: 'Documentation', value: 100, weight: 2.0 },
      { symbol: 'Ag', name: 'Argentum', property: 'Clarity', value: 0, weight: 1.0 },
    ]
    expect(computePurity(elements)).toBeCloseTo(66.67, 1)
  })
})

// ─── generateTransmutationSteps ───────────────────────────────────────────────

describe('generateTransmutationSteps', () => {
  it('generates steps for weak elements', () => {
    const elements: Element[] = [
      { symbol: 'Au', name: 'Aurum', property: 'Documentation', value: 20, weight: 1.0 },
      { symbol: 'Ag', name: 'Argentum', property: 'Clarity', value: 80, weight: 1.0 },
    ]
    const steps = generateTransmutationSteps('a.ts', elements, '')
    expect(steps.length).toBeGreaterThan(0)
    expect(steps[0]!.element).toBe('Au')
  })

  it('generates critical steps for very low elements', () => {
    const elements: Element[] = [
      { symbol: 'Cu', name: 'Cuprum', property: 'Type Safety', value: 10, weight: 1.0 },
    ]
    const steps = generateTransmutationSteps('a.ts', elements, '')
    expect(steps.some((s) => s.description.includes('Critical'))).toBe(true)
  })

  it('returns empty for high elements', () => {
    const elements: Element[] = [
      { symbol: 'Au', name: 'Aurum', property: 'Documentation', value: 95, weight: 1.0 },
      { symbol: 'Ag', name: 'Argentum', property: 'Clarity', value: 90, weight: 1.0 },
    ]
    const steps = generateTransmutationSteps('a.ts', elements, '')
    expect(steps.length).toBe(0)
  })
})

// ─── determineEffort ──────────────────────────────────────────────────────────

describe('determineEffort', () => {
  it('returns significant for multiple hard steps', () => {
    const steps = [
      { description: '', element: '', impact: 10, difficulty: 'hard' as const },
      { description: '', element: '', impact: 10, difficulty: 'hard' as const },
    ]
    expect(determineEffort(steps)).toBe('significant')
  })

  it('returns moderate for one hard step', () => {
    const steps = [
      { description: '', element: '', impact: 10, difficulty: 'hard' as const },
    ]
    expect(determineEffort(steps)).toBe('moderate')
  })

  it('returns minor for easy steps', () => {
    const steps = [
      { description: '', element: '', impact: 5, difficulty: 'easy' as const },
    ]
    expect(determineEffort(steps)).toBe('minor')
  })
})

// ─── computePhilosopherStoneScore ─────────────────────────────────────────────

describe('computePhilosopherStoneScore', () => {
  it('returns 100 for all gold', () => {
    const transmutations: Transmutation[] = [
      { file: 'a.ts', currentGrade: 'Gold', currentPurity: 85, elements: [], nextGrade: 'Platinum', requiredPurity: 91, steps: [], estimatedEffort: 'minor' },
      { file: 'b.ts', currentGrade: 'Platinum', currentPurity: 95, elements: [], nextGrade: 'Platinum', requiredPurity: 91, steps: [], estimatedEffort: 'minor' },
    ]
    expect(computePhilosopherStoneScore(transmutations)).toBe(100)
  })

  it('returns 0 for all lead', () => {
    const transmutations: Transmutation[] = [
      { file: 'a.ts', currentGrade: 'Lead', currentPurity: 10, elements: [], nextGrade: 'Copper', requiredPurity: 21, steps: [], estimatedEffort: 'significant' },
    ]
    expect(computePhilosopherStoneScore(transmutations)).toBe(0)
  })

  it('returns 50 for half gold', () => {
    const transmutations: Transmutation[] = [
      { file: 'a.ts', currentGrade: 'Gold', currentPurity: 85, elements: [], nextGrade: 'Platinum', requiredPurity: 91, steps: [], estimatedEffort: 'minor' },
      { file: 'b.ts', currentGrade: 'Lead', currentPurity: 10, elements: [], nextGrade: 'Copper', requiredPurity: 21, steps: [], estimatedEffort: 'significant' },
    ]
    expect(computePhilosopherStoneScore(transmutations)).toBe(50)
  })

  it('returns 100 for empty', () => {
    expect(computePhilosopherStoneScore([])).toBe(100)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for lead files', () => {
    const transmutations: Transmutation[] = [
      { file: 'bad.ts', currentGrade: 'Lead', currentPurity: 10, elements: [], nextGrade: 'Copper', requiredPurity: 21, steps: [{ description: 'Fix docs', element: 'Au', impact: 10, difficulty: 'easy' }], estimatedEffort: 'significant' },
    ]
    const stats: AlchemistStats = { totalFiles: 1, gradeDistribution: { Lead: 1 }, avgPurity: 10, highestPurity: 'bad.ts', lowestPurity: 'bad.ts', goldCount: 0, leadCount: 1, transmutationPotential: 30, philosopherStoneScore: 0 }
    const recs = generateRecommendations(transmutations, stats)
    expect(recs.some((r) => r.includes('Lead'))).toBe(true)
  })

  it('recommends for near-gold files', () => {
    const transmutations: Transmutation[] = [
      { file: 'good.ts', currentGrade: 'Silver', currentPurity: 70, elements: [], nextGrade: 'Gold', requiredPurity: 76, steps: [], estimatedEffort: 'minor' },
    ]
    const stats: AlchemistStats = { totalFiles: 1, gradeDistribution: { Silver: 1 }, avgPurity: 70, highestPurity: 'good.ts', lowestPurity: 'good.ts', goldCount: 0, leadCount: 0, transmutationPotential: 20, philosopherStoneScore: 0 }
    const recs = generateRecommendations(transmutations, stats)
    expect(recs.some((r) => r.includes('Near-gold'))).toBe(true)
  })

  it('praises all-gold codebase', () => {
    const transmutations: Transmutation[] = [
      { file: 'a.ts', currentGrade: 'Gold', currentPurity: 85, elements: [], nextGrade: 'Platinum', requiredPurity: 91, steps: [], estimatedEffort: 'minor' },
    ]
    const stats: AlchemistStats = { totalFiles: 1, gradeDistribution: { Gold: 1 }, avgPurity: 85, highestPurity: 'a.ts', lowestPurity: 'a.ts', goldCount: 1, leadCount: 0, transmutationPotential: 15, philosopherStoneScore: 100 }
    const recs = generateRecommendations(transmutations, stats)
    expect(recs.some((r) => r.includes('enlightenment') || r.includes('Gold') || r.includes('complete'))).toBe(true)
  })
})

// ─── getMasterElements ────────────────────────────────────────────────────────

describe('getMasterElements', () => {
  it('returns 7 elements', () => {
    const elements = getMasterElements()
    expect(elements.length).toBe(7)
    expect(elements.map((e) => e.symbol)).toEqual(['Au', 'Ag', 'Fe', 'Cu', 'Sn', 'Pt', 'Hg'])
  })
})

// ─── buildAlchemistResult ─────────────────────────────────────────────────────

describe('buildAlchemistResult', () => {
  it('builds result for gold code', () => {
    const result = buildAlchemistResult(['gold.ts'], [GOLD_CODE], { maxDepth: 50 })
    expect(result.transmutations.length).toBe(1)
    expect(result.transmutations[0]!.currentPurity).toBeGreaterThan(50)
    expect(result.elements.length).toBe(7)
  })

  it('builds result for lead code', () => {
    const result = buildAlchemistResult(['lead.ts'], [LEAD_CODE], { maxDepth: 50 })
    expect(result.transmutations[0]!.currentGrade).toBeDefined()
    expect(result.stats.leadCount).toBeGreaterThanOrEqual(0)
  })

  it('handles empty input', () => {
    const result = buildAlchemistResult([], [], { maxDepth: 50 })
    expect(result.transmutations).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgPurity).toBe(0)
  })

  it('computes stats correctly', () => {
    const result = buildAlchemistResult(
      ['gold.ts', 'lead.ts', 'silver.ts'],
      [GOLD_CODE, LEAD_CODE, SILVER_CODE],
      { maxDepth: 50 },
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.highestPurity).toBeTruthy()
    expect(result.stats.lowestPurity).toBeTruthy()
    expect(result.stats.philosopherStoneScore).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const result = buildAlchemistResult(['lead.ts'], [LEAD_CODE], { maxDepth: 50 })
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatElementTable', () => {
  it('formats table', () => {
    const elements: Element[] = [
      { symbol: 'Au', name: 'Aurum', property: 'Documentation', value: 80, weight: 1.2 },
    ]
    const output = formatElementTable(elements)
    expect(output).toContain('Au')
    expect(output).toContain('Aurum')
    expect(output).toContain('80')
  })
})

describe('formatGradeBadge', () => {
  it('formats badge', () => {
    const output = formatGradeBadge('Gold', 85)
    expect(output).toContain('Gold')
    expect(output).toContain('85')
  })
})

describe('formatTransmutationPlan', () => {
  it('formats plan', () => {
    const t: Transmutation = {
      file: 'a.ts',
      currentGrade: 'Silver',
      currentPurity: 70,
      elements: [],
      nextGrade: 'Gold',
      requiredPurity: 76,
      steps: [{ description: 'Add docs', element: 'Au', impact: 10, difficulty: 'easy' }],
      estimatedEffort: 'minor',
    }
    const output = formatTransmutationPlan(t)
    expect(output).toContain('a.ts')
    expect(output).toContain('Silver')
    expect(output).toContain('Gold')
    expect(output).toContain('Add docs')
  })
})

describe('formatPurityMeter', () => {
  it('formats meter', () => {
    const output = formatPurityMeter(72.5)
    expect(output).toContain('72.5%')
  })
})

describe('formatGradeDistribution', () => {
  it('formats distribution', () => {
    const output = formatGradeDistribution({ Gold: 3, Silver: 5, Lead: 1 })
    expect(output).toContain('Gold')
    expect(output).toContain('Silver')
    expect(output).toContain('Lead')
  })
})

describe('formatPhilosopherStoneProgress', () => {
  it('formats progress', () => {
    const output = formatPhilosopherStoneProgress(75)
    expect(output).toContain('75%')
  })
})

describe('formatAlchemistStats', () => {
  it('formats stats', () => {
    const stats: AlchemistStats = {
      totalFiles: 10, gradeDistribution: { Gold: 3 }, avgPurity: 72.5,
      highestPurity: 'a.ts', lowestPurity: 'b.ts', goldCount: 3, leadCount: 1,
      transmutationPotential: 15.5, philosopherStoneScore: 60,
    }
    const output = formatAlchemistStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('72.5%')
  })
})

describe('formatRecommendations', () => {
  it('formats recs', () => {
    expect(formatRecommendations(['Transmute lead files'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatAlchemistTable', () => {
  it('formats full table', () => {
    const result = buildAlchemistResult(['a.ts'], [GOLD_CODE], { maxDepth: 50 })
    const output = formatAlchemistTable(result)
    expect(output).toContain('Element Reference Table')
    expect(output).toContain('Average Purity')
  })
})

describe('formatAlchemistJSON', () => {
  it('formats valid JSON', () => {
    const result = buildAlchemistResult(['a.ts'], [GOLD_CODE], { maxDepth: 50 })
    const json = formatAlchemistJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.transmutations).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes realistic codebase', () => {
    const result = buildAlchemistResult(
      ['gold.ts', 'lead.ts', 'silver.ts', 'bronze.ts', 'test/gold.test.ts'],
      [GOLD_CODE, LEAD_CODE, SILVER_CODE, BRONZE_CODE, GOLD_CODE],
      { maxDepth: 100 },
    )
    expect(result.transmutations.length).toBe(5)
    expect(result.stats.avgPurity).toBeGreaterThan(0)
    expect(result.elements.length).toBe(7)
    expect(result.stats.philosopherStoneScore).toBeGreaterThanOrEqual(0)
  })

  it('round-trips through JSON', () => {
    const result = buildAlchemistResult(['a.ts'], [GOLD_CODE], { maxDepth: 50 })
    const json = formatAlchemistJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(result.stats.totalFiles)
    expect(parsed.transmutations.length).toBe(result.transmutations.length)
  })
})
