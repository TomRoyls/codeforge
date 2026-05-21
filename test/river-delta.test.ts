import { describe, it, expect } from 'vitest'
import {
  analyzeDeltaRegion,
  analyzeWaterChannel,
  buildRiverDeltaResult,
  classifyCondition,
  classifyHydrologistGrade,
  classifyRegionCondition,
  classifyRegionType,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  countValidations,
  generateRecommendations,
  maxNesting,
  measureBank,
  measureChannel,
  measureDistributary,
  measureFlood,
  measureFlow,
  measureSediment,
} from '../src/commands/river-delta-helpers.js'
import { formatRiverDeltaJson, formatRiverDeltaTable } from '../src/commands/river-delta-format-helpers.js'

const emptyCode = ''
const simpleCode = 'const x = 1'
const strongCode = `import { something } from 'module'
export function calculateTotal(items: string[]): number {
  try {
    if (items.length === 0) return 0
    const total = items.reduce((sum: number, item: string) => {
      return sum + item.length
    }, 0)
    return total
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw error
  }
}
/**
 * Validate input
 */
export function validateInput(data: string[]): boolean {
  return typeof data !== 'undefined' && Array.isArray(data) && data.length > 0
}
`
const branchyCode = `function a(x) { if (x) { if (y) { if (z) { return 1 } } } }
function b(x) { if (x) { if (y) { return 2 } } }
function c(x) { if (x) { return 3 } }
console.log('debug')
// TODO: fix
`
const importOnlyCode = `import { a } from 'x'
import { b } from 'y'
const result = a(b())
`
const testCode = `import { describe, it, expect } from 'vitest'
describe('calc', () => {
  it('works', () => { expect(1).toBe(1) })
})
`
const waterfallCode = `function classify(x: string): string {
  if (x === 'a') return 'alpha'
  else if (x === 'b') return 'beta'
  else if (x === 'c') return 'gamma'
  else if (x === 'd') return 'delta'
  else if (x === 'e') return 'epsilon'
  return 'unknown'
}`

// ─── Primitive Counters ──────────────────────────────────────────────────────

describe('countLoc', () => {
  it('counts 0 for empty', () => { expect(countLoc(emptyCode)).toBe(0) })
  it('counts 1 for single line', () => { expect(countLoc(simpleCode)).toBe(1) })
  it('counts multiple', () => { expect(countLoc('a\n\nb\nc')).toBe(3) })
})

describe('countImports', () => {
  it('counts 0 for empty', () => { expect(countImports(emptyCode)).toBe(0) })
  it('counts imports', () => { expect(countImports(strongCode)).toBe(1) })
})

describe('countExports', () => {
  it('counts 0 for empty', () => { expect(countExports(emptyCode)).toBe(0) })
  it('counts exports', () => { expect(countExports(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('countFunctions', () => {
  it('counts 0 for empty', () => { expect(countFunctions(emptyCode)).toBe(0) })
  it('counts functions', () => { expect(countFunctions(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countClasses', () => {
  it('counts 0 for empty', () => { expect(countClasses(emptyCode)).toBe(0) })
  it('counts classes', () => { expect(countClasses('class Foo {}')).toBe(1) })
})

describe('countErrorHandling', () => {
  it('counts 0 for empty', () => { expect(countErrorHandling(emptyCode)).toBe(0) })
  it('counts errors', () => { expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('countTypeAnnotations', () => {
  it('counts 0 for empty', () => { expect(countTypeAnnotations(emptyCode)).toBe(0) })
  it('counts types', () => { expect(countTypeAnnotations(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('countBranches', () => {
  it('counts 0 for empty', () => { expect(countBranches(emptyCode)).toBe(0) })
  it('counts branches', () => { expect(countBranches(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('maxNesting', () => {
  it('returns 0 for empty', () => { expect(maxNesting(emptyCode)).toBe(0) })
  it('measures nesting', () => { expect(maxNesting('{{{}}}')).toBe(3) })
})

describe('countConsole', () => {
  it('counts 0 for empty', () => { expect(countConsole(emptyCode)).toBe(0) })
  it('counts console', () => { expect(countConsole(branchyCode)).toBeGreaterThanOrEqual(1) })
})

describe('countComments', () => {
  it('counts 0 for empty', () => { expect(countComments(emptyCode)).toBe(0) })
  it('counts comments', () => { expect(countComments(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countTodos', () => {
  it('counts 0 for empty', () => { expect(countTodos(emptyCode)).toBe(0) })
  it('counts todos', () => { expect(countTodos(branchyCode)).toBeGreaterThanOrEqual(1) })
})

describe('countJSDoc', () => {
  it('counts 0 for empty', () => { expect(countJSDoc(emptyCode)).toBe(0) })
  it('counts jsdoc', () => { expect(countJSDoc(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countDescriptiveNames', () => {
  it('counts 0 for empty', () => { expect(countDescriptiveNames(emptyCode)).toBe(0) })
  it('counts descriptive', () => { expect(countDescriptiveNames(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countValidations', () => {
  it('counts 0 for empty', () => { expect(countValidations(emptyCode)).toBe(0) })
  it('counts validations', () => { expect(countValidations(strongCode)).toBeGreaterThanOrEqual(1) })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('measureChannel', () => {
  it('returns dry-bed for empty code', () => {
    const c = measureChannel(emptyCode)
    expect(c.type).toBe('dry-bed')
    expect(c.depth).toBe(0)
    expect(c.width).toBe(0)
    expect(c.isNavigable).toBe(false)
    expect(c.flowDirection).toBe('stagnant')
  })
  it('returns oxbow for code with no imports/exports', () => {
    const c = measureChannel(simpleCode)
    expect(c.type).toBe('oxbow')
  })
  it('returns tributary for import-only code', () => {
    const c = measureChannel(importOnlyCode)
    expect(c.type).toBe('tributary')
    expect(c.flowDirection).toBe('upstream')
  })
  it('returns main-channel for strong code', () => {
    const c = measureChannel(strongCode)
    expect(c.type).toBe('main-channel')
    expect(c.flowDirection).toBe('downstream')
    expect(c.isNavigable).toBe(true)
  })
  it('detects undercurrent with console', () => {
    const c = measureChannel(branchyCode)
    expect(c.hasUndercurrent).toBe(true)
  })
})

describe('measureFlow', () => {
  it('returns 0 rate for empty code', () => {
    const f = measureFlow(emptyCode)
    expect(f.rate).toBe(0)
    expect(f.isSteady).toBe(false)
    expect(f.isTurbulent).toBe(false)
    expect(f.isLaminar).toBe(false)
  })
  it('detects laminar flow for simple code', () => {
    const f = measureFlow(simpleCode)
    expect(f.isLaminar).toBe(true)
  })
  it('detects waterfalls in else-if chains', () => {
    const f = measureFlow(waterfallCode)
    expect(f.hasWaterfall).toBe(true)
    expect(f.waterfallCount).toBeGreaterThan(2)
  })
  it('detects plunge pool for deep nesting without errors', () => {
    const f = measureFlow(branchyCode)
    expect(f.hasPlungePool).toBe(true)
  })
})

describe('measureSediment', () => {
  it('returns 0 load for empty code', () => {
    const s = measureSediment(emptyCode)
    expect(s.load).toBe(0)
    expect(s.siltLevel).toBe(0)
  })
  it('detects suspended sediment with branches but no errors', () => {
    const s = measureSediment(branchyCode)
    expect(s.isSuspended).toBe(true)
  })
  it('detects settled sediment with branches, types, and errors', () => {
    const s = measureSediment(strongCode)
    expect(s.isSettled).toBe(true)
  })
  it('detects silt with todos', () => {
    const s = measureSediment(branchyCode)
    expect(s.hasSilt).toBe(true)
    expect(s.siltLevel).toBeGreaterThan(0)
  })
})

describe('measureDistributary', () => {
  it('returns 0 count for empty code', () => {
    const d = measureDistributary(emptyCode)
    expect(d.count).toBe(0)
    expect(d.isBalanced).toBe(true)
    expect(d.balanceScore).toBe(100)
  })
  it('counts branches', () => {
    const d = measureDistributary(strongCode)
    expect(d.count).toBeGreaterThan(0)
  })
  it('detects braided channels', () => {
    const d = measureDistributary(branchyCode)
    expect(d.hasBraidedChannels).toBe(true)
  })
})

describe('measureFlood', () => {
  it('returns 0 control for empty code', () => {
    const f = measureFlood(emptyCode)
    expect(f.control).toBe(0)
    expect(f.hasLevees).toBe(false)
  })
  it('detects levees with try/catch', () => {
    const f = measureFlood(strongCode)
    expect(f.hasLevees).toBe(true)
    expect(f.hasSpillways).toBe(true)
    expect(f.control).toBeGreaterThan(0)
  })
  it('detects inundation with many branches no errors', () => {
    const f = measureFlood(branchyCode)
    expect(f.isInundated).toBe(true)
  })
})

describe('measureBank', () => {
  it('returns not stable for empty code', () => {
    const b = measureBank(emptyCode)
    expect(b.isStable).toBe(false)
    expect(b.vegetationDensity).toBe(0)
  })
  it('detects stable bank for strong code', () => {
    const b = measureBank(strongCode)
    expect(b.isStable).toBe(true)
    expect(b.hasVegetation).toBe(true)
    expect(b.isReinforced).toBe(true)
  })
  it('detects eroding with todos/console', () => {
    const b = measureBank(branchyCode)
    expect(b.isEroding).toBe(true)
    expect(b.erosionPoints).toBeGreaterThan(0)
  })
})

// ─── Classification ───────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies desert-wash for low', () => { expect(classifyCondition(0)).toBe('desert-wash') })
  it('classifies mudflat', () => { expect(classifyCondition(15)).toBe('mudflat') })
  it('classifies swamp', () => { expect(classifyCondition(32)).toBe('swamp') })
  it('classifies meandering-river', () => { expect(classifyCondition(50)).toBe('meandering-river') })
  it('classifies clear-stream', () => { expect(classifyCondition(68)).toBe('clear-stream') })
  it('classifies deep-river', () => { expect(classifyCondition(85)).toBe('deep-river') })
})

describe('classifyRegionType', () => {
  it('returns saltpan for empty', () => { expect(classifyRegionType([])).toBe('saltpan') })
})

describe('classifyRegionCondition', () => {
  it('returns arid for empty', () => { expect(classifyRegionCondition([])).toBe('arid') })
})

describe('classifyHydrologistGrade', () => {
  it('classifies drifter for 0', () => { expect(classifyHydrologistGrade(0)).toBe('drifter') })
  it('classifies chief-hydrologist for high', () => { expect(classifyHydrologistGrade(85)).toBe('chief-hydrologist') })
  it('classifies hydrologist', () => { expect(classifyHydrologistGrade(70)).toBe('hydrologist') })
  it('classifies engineer', () => { expect(classifyHydrologistGrade(50)).toBe('engineer') })
  it('classifies surveyor', () => { expect(classifyHydrologistGrade(35)).toBe('surveyor') })
  it('classifies fisherman', () => { expect(classifyHydrologistGrade(20)).toBe('fisherman') })
})

// ─── Core Analysis ────────────────────────────────────────────────────────────

describe('analyzeWaterChannel', () => {
  it('returns correct structure for empty code', () => {
    const ch = analyzeWaterChannel(emptyCode, 'empty.ts')
    expect(ch.file).toBe('empty.ts')
    expect(ch.channelDepth).toBe(0)
    expect(ch.flowRate).toBe(0)
    expect(ch.sedimentLoad).toBe(0)
    expect(ch.distributaryCount).toBe(0)
    expect(ch.siltation).toBe(0)
    expect(ch.floodControl).toBe(0)
    expect(ch.qualityScore).toBe(0)
    expect(ch.condition).toBe('desert-wash')
    expect(ch.channel.type).toBe('dry-bed')
  })
  it('returns high scores for strong code', () => {
    const ch = analyzeWaterChannel(strongCode, 'strong.ts')
    expect(ch.flowRate).toBeGreaterThan(0)
    expect(ch.floodControl).toBeGreaterThan(0)
    expect(ch.qualityScore).toBeGreaterThan(0)
    expect(ch.channel.isNavigable).toBe(true)
  })
  it('produces valid scores in range 0-100', () => {
    const ch = analyzeWaterChannel(strongCode, 'range.ts')
    expect(ch.qualityScore).toBeGreaterThanOrEqual(0)
    expect(ch.qualityScore).toBeLessThanOrEqual(100)
  })
})

describe('analyzeDeltaRegion', () => {
  it('returns zeros for empty channels', () => {
    const r = analyzeDeltaRegion([], 'empty')
    expect(r.directory).toBe('empty')
    expect(r.avgChannelDepth).toBe(0)
    expect(r.regionType).toBe('saltpan')
    expect(r.condition).toBe('arid')
  })
  it('aggregates metrics', () => {
    const channels = [
      analyzeWaterChannel(strongCode, 'a.ts'),
      analyzeWaterChannel(simpleCode, 'b.ts'),
    ]
    const r = analyzeDeltaRegion(channels, 'src')
    expect(r.avgFlowRate).toBeGreaterThan(0)
    expect(r.channels).toHaveLength(2)
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('buildRiverDeltaResult', () => {
  it('returns empty result for no files', () => {
    const result = buildRiverDeltaResult([], [], {})
    expect(result.channels).toEqual([])
    expect(result.regions).toEqual([])
    expect(result.basin.overallFlow).toBe(0)
    expect(result.basin.isNavigable).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.hydrologistGrade).toBe('drifter')
  })
  it('analyzes single file', () => {
    const result = buildRiverDeltaResult(['calc.ts'], [strongCode], {})
    expect(result.channels).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.deepestChannel).toBe('calc.ts')
  })
  it('analyzes multiple files', () => {
    const result = buildRiverDeltaResult(
      ['src/a.ts', 'src/b.ts', 'test/a.test.ts'],
      [strongCode, simpleCode, testCode],
      {},
    )
    expect(result.channels).toHaveLength(3)
    expect(result.regions).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.basin.overallFlow).toBeGreaterThan(0)
  })
  it('groups files by directory', () => {
    const result = buildRiverDeltaResult(
      ['src/foo/a.ts', 'src/bar/b.ts', 'root.ts'],
      [strongCode, simpleCode, strongCode],
      {},
    )
    expect(result.regions).toHaveLength(3)
    const dirs = result.regions.map(r => r.directory)
    expect(dirs).toContain('src/foo')
    expect(dirs).toContain('src/bar')
    expect(dirs).toContain('.')
  })
  it('tracks condition counts', () => {
    const result = buildRiverDeltaResult(
      ['a.ts', 'b.ts'],
      [strongCode, emptyCode],
      {},
    )
    const total = result.stats.deepRiverCount + result.stats.clearStreamCount +
      result.stats.meanderingCount + result.stats.swampCount +
      result.stats.mudflatCount + result.stats.desertWashCount
    expect(total).toBe(2)
  })
  it('handles fewer contents than files', () => {
    const result = buildRiverDeltaResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.channels).toHaveLength(2)
    expect(result.channels[1].flowRate).toBe(0)
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates levee recommendation when none', () => {
    const result = buildRiverDeltaResult(['a.ts'], [simpleCode], {})
    if (result.stats.hasLeveesCount === 0 && result.stats.totalFiles > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('levees')]),
      )
    }
  })
  it('generates healthy recommendation for strong code', () => {
    const result = buildRiverDeltaResult(['a.ts'], [strongCode], {})
    if (result.basin.overallFlow >= 70) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Healthy')]),
      )
    }
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatRiverDeltaTable', () => {
  it('formats empty result', () => {
    const result = buildRiverDeltaResult([], [], {})
    const table = formatRiverDeltaTable(result, false)
    expect(table).toContain('River Delta')
    expect(table).toContain('No files analyzed')
  })
  it('formats result with channels', () => {
    const result = buildRiverDeltaResult(['a.ts'], [strongCode], {})
    const table = formatRiverDeltaTable(result, false)
    expect(table).toContain('a.ts')
  })
  it('formats verbose output', () => {
    const result = buildRiverDeltaResult(['a.ts'], [strongCode], {})
    const table = formatRiverDeltaTable(result, true)
    expect(table).toContain('channel:')
    expect(table).toContain('flow:')
    expect(table).toContain('sediment:')
    expect(table).toContain('distributary:')
    expect(table).toContain('flood:')
    expect(table).toContain('bank:')
  })
  it('truncates non-verbose at 15 channels', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleCode)
    const result = buildRiverDeltaResult(files, contents, {})
    const table = formatRiverDeltaTable(result, false)
    expect(table).toContain('and 5 more')
  })
})

describe('formatRiverDeltaJson', () => {
  it('outputs valid JSON', () => {
    const result = buildRiverDeltaResult(['a.ts'], [strongCode], {})
    const json = formatRiverDeltaJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.channels).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
  it('outputs empty result', () => {
    const result = buildRiverDeltaResult([], [], {})
    const json = formatRiverDeltaJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.channels).toEqual([])
  })
})

// ─── Integration Tests ────────────────────────────────────────────────────────

describe('river-delta integration', () => {
  it('produces consistent results', () => {
    const r1 = buildRiverDeltaResult(['a.ts'], [strongCode], {})
    const r2 = buildRiverDeltaResult(['a.ts'], [strongCode], {})
    expect(r1.channels[0].qualityScore).toBe(r2.channels[0].qualityScore)
  })
  it('handles mixed strong and weak code', () => {
    const result = buildRiverDeltaResult(
      ['strong.ts', 'weak.ts', 'empty.ts', 'test.ts'],
      [strongCode, simpleCode, emptyCode, testCode],
      {},
    )
    expect(result.channels).toHaveLength(4)
    expect(result.basin.overallFlow).toBeGreaterThan(0)
    expect(result.basin.overallFlow).toBeLessThanOrEqual(100)
  })
  it('tracks special channels', () => {
    const result = buildRiverDeltaResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.deepestChannel).toBeTruthy()
    expect(result.stats.clearestFlow).toBeTruthy()
    expect(result.stats.mostSilted).toBeTruthy()
    expect(result.stats.bestFloodControl).toBeTruthy()
    expect(result.stats.mostBranched).toBeTruthy()
  })
  it('hydrologist grade matches flow', () => {
    const result = buildRiverDeltaResult(['a.ts'], [strongCode], {})
    expect(['chief-hydrologist', 'hydrologist', 'engineer', 'surveyor', 'fisherman', 'drifter']).toContain(result.stats.hydrologistGrade)
  })
  it('navigable matches overall flow', () => {
    const result = buildRiverDeltaResult(['a.ts', 'b.ts'], [strongCode, strongCode], {})
    expect(result.basin.isNavigable).toBe(result.basin.overallFlow >= 60)
  })
})
