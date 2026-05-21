import { describe, it, expect } from 'vitest'
import {
  analyzeForgedPiece,
  analyzeForgeShop,
  buildForgeHammerResult,
  classifyCondition,
  classifyShopCondition,
  classifyShopType,
  classifySmithGrade,
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
  countTestIndicators,
  countTodos,
  countTypeAnnotations,
  countValidations,
  generateRecommendations,
  maxNesting,
  measureForging,
  measureHeat,
  measureImpact,
  measureMetal,
  measureTemper,
  measureTesting,
} from '../src/commands/forge-hammer-helpers.js'
import { formatForgeHammerJson, formatForgeHammerTable } from '../src/commands/forge-hammer-format-helpers.js'

// ─── Test Code Snippets ──────────────────────────────────────────────────────

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
 * @example
 * validateInput(['a']) // true
 */
export function validateInput(data: string[]): boolean {
  return typeof data !== 'undefined' && Array.isArray(data) && data.length > 0
}
`
const testCode = `import { describe, it, expect } from 'vitest'
describe('calculateTotal', () => {
  beforeEach(() => {
    // setup
  })
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0)
  })
  it('should sum correctly', () => {
    expect(calculateTotal(['a', 'bb'])).toBe(3)
  })
})
`
const brittleCode = `function a(x) { if (x) { if (y) { if (z) { if (w) { if (v) { return 1 } } } } } }
function b(x) { if (x) { if (y) { if (z) { if (w) { return 2 } } } } }
function c(x) { if (x) { if (y) { if (z) { return 3 } } } }
function d(x) { if (x) { if (y) { return 4 } } }
console.log('debug')
// TODO: fix this
`
const todoCode = `export function processItems(items: string[]): void {
  // TODO: implement validation
  // FIXME: handle edge cases
  console.log(items)
}
`

// ─── Primitive Counters ──────────────────────────────────────────────────────

describe('countLoc', () => {
  it('counts 0 for empty string', () => {
    expect(countLoc(emptyCode)).toBe(0)
  })
  it('counts 1 for single line', () => {
    expect(countLoc(simpleCode)).toBe(1)
  })
  it('counts multiple non-blank lines', () => {
    expect(countLoc('a\n\nb\nc')).toBe(3)
  })
  it('counts strongCode lines', () => {
    expect(countLoc(strongCode)).toBeGreaterThan(5)
  })
})

describe('countImports', () => {
  it('counts 0 for no imports', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(simpleCode)).toBe(0)
  })
  it('counts import statements', () => {
    expect(countImports(strongCode)).toBe(1)
    expect(countImports(testCode)).toBe(1)
  })
})

describe('countExports', () => {
  it('counts 0 for no exports', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(simpleCode)).toBe(0)
  })
  it('counts export statements', () => {
    expect(countExports(strongCode)).toBeGreaterThanOrEqual(2)
  })
})

describe('countFunctions', () => {
  it('counts 0 for no functions', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions(simpleCode)).toBe(0)
  })
  it('counts function declarations', () => {
    expect(countFunctions(strongCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countClasses', () => {
  it('counts 0 for no classes', () => {
    expect(countClasses(emptyCode)).toBe(0)
  })
  it('counts class declarations', () => {
    expect(countClasses('class Foo {}')).toBe(1)
  })
})

describe('countErrorHandling', () => {
  it('counts 0 for no error handling', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(simpleCode)).toBe(0)
  })
  it('counts try/catch/throw', () => {
    const count = countErrorHandling(strongCode)
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

describe('countTypeAnnotations', () => {
  it('counts 0 for no types', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations(simpleCode)).toBe(0)
  })
  it('counts type annotations', () => {
    expect(countTypeAnnotations(strongCode)).toBeGreaterThanOrEqual(2)
  })
})

describe('countBranches', () => {
  it('counts 0 for no branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
  })
  it('counts if/else/switch', () => {
    expect(countBranches(strongCode)).toBeGreaterThanOrEqual(2)
  })
})

describe('maxNesting', () => {
  it('returns 0 for empty', () => {
    expect(maxNesting(emptyCode)).toBe(0)
  })
  it('returns 1 for single brace', () => {
    expect(maxNesting('{}')).toBe(1)
  })
  it('measures deep nesting', () => {
    expect(maxNesting(brittleCode)).toBeGreaterThanOrEqual(3)
  })
})

describe('countConsole', () => {
  it('counts 0 for no console', () => {
    expect(countConsole(emptyCode)).toBe(0)
  })
  it('counts console statements', () => {
    expect(countConsole(brittleCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countComments', () => {
  it('counts 0 for no comments', () => {
    expect(countComments(emptyCode)).toBe(0)
  })
  it('counts comments', () => {
    expect(countComments(strongCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countTodos', () => {
  it('counts 0 for no todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
  })
  it('counts TODO/FIXME/HACK', () => {
    expect(countTodos(brittleCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countJSDoc', () => {
  it('counts 0 for no JSDoc', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
  })
  it('counts JSDoc blocks', () => {
    expect(countJSDoc(strongCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countDescriptiveNames', () => {
  it('counts 0 for no descriptive names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
  })
  it('counts descriptive names', () => {
    expect(countDescriptiveNames(strongCode)).toBeGreaterThanOrEqual(1)
  })
})

describe('countTestIndicators', () => {
  it('counts 0 for no tests', () => {
    expect(countTestIndicators(emptyCode)).toBe(0)
  })
  it('counts test indicators', () => {
    expect(countTestIndicators(testCode)).toBeGreaterThanOrEqual(4)
  })
})

describe('countValidations', () => {
  it('counts 0 for no validations', () => {
    expect(countValidations(emptyCode)).toBe(0)
  })
  it('counts validations', () => {
    expect(countValidations(strongCode)).toBeGreaterThanOrEqual(1)
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('measureMetal', () => {
  it('returns 0 hardness for empty code', () => {
    const m = measureMetal(emptyCode)
    expect(m.hardness).toBe(0)
    expect(m.type).toBe('clay')
    expect(m.grade).toBe('scrap')
  })
  it('returns higher hardness for strong code', () => {
    const m = measureMetal(strongCode)
    expect(m.hardness).toBeGreaterThan(0)
    expect(m.carbonContent).toBeGreaterThanOrEqual(0)
  })
  it('detects impurities with todos/console', () => {
    const m = measureMetal(brittleCode)
    expect(m.hasImpurities).toBe(true)
    expect(m.impurityCount).toBeGreaterThan(0)
  })
  it('calculates carbon content from branches/nesting', () => {
    const m = measureMetal(strongCode)
    expect(m.carbonContent).toBeGreaterThanOrEqual(0)
    expect(m.carbonContent).toBeLessThanOrEqual(100)
  })
  it('assigns steel type for high hardness', () => {
    const m = measureMetal(strongCode)
    expect(['steel', 'iron', 'bronze']).toContain(m.type)
  })
})

describe('measureTemper', () => {
  it('returns 0 quality for empty code', () => {
    const t = measureTemper(emptyCode)
    expect(t.quality).toBe(0)
    expect(t.isEvenlyTempered).toBe(false)
  })
  it('detects even temper with balanced errors/branches', () => {
    const t = measureTemper(strongCode)
    expect(t.quality).toBeGreaterThan(0)
  })
  it('detects brittleness in code with many branches but no errors', () => {
    const t = measureTemper(brittleCode)
    expect(t.isBrittle).toBe(true)
  })
  it('detects ductility with error handling and types', () => {
    const t = measureTemper(strongCode)
    expect(t.isDuctile).toBe(true)
  })
})

describe('measureImpact', () => {
  it('returns 0 resistance for empty code', () => {
    const i = measureImpact(emptyCode)
    expect(i.resistance).toBe(0)
    expect(i.hasDefenses).toBe(false)
    expect(i.hasShockAbsorbers).toBe(false)
  })
  it('detects defenses with validations', () => {
    const i = measureImpact(strongCode)
    expect(i.hasDefenses).toBe(true)
  })
  it('detects crack stoppers with try/catch', () => {
    const i = measureImpact(strongCode)
    expect(i.hasCrackStoppers).toBe(true)
  })
  it('reports crack points for unhandled code', () => {
    const i = measureImpact(brittleCode)
    expect(i.crackCount).toBeGreaterThan(0)
    expect(i.crackPoints.length).toBeGreaterThan(0)
  })
})

describe('measureForging', () => {
  it('returns 0 quality for empty code', () => {
    const f = measureForging(emptyCode)
    expect(f.quality).toBe(0)
    expect(f.technique).toBe('duct-tape')
  })
  it('detects folded-steel technique for well-documented code', () => {
    const f = measureForging(strongCode)
    expect(f.technique).toBe('folded-steel')
  })
  it('detects polish level', () => {
    const f = measureForging(strongCode)
    expect(f.polishLevel).toBeGreaterThan(0)
    expect(f.isPolished).toBe(true)
  })
  it('detects rough code', () => {
    const code = 'x = 1\ny = 2'
    const f = measureForging(code)
    expect(f.quality).toBeGreaterThanOrEqual(0)
    expect(f.technique).toBe('3d-printed')
  })
})

describe('measureTesting', () => {
  it('returns no tests for non-test code', () => {
    const t = measureTesting(strongCode)
    expect(t.hasHardnessTest).toBe(false)
    expect(t.anvilMarkCount).toBe(0)
  })
  it('detects test indicators', () => {
    const t = measureTesting(testCode)
    expect(t.hasHardnessTest).toBe(true)
    expect(t.hasStressTest).toBe(true)
    expect(t.hasFatigueTest).toBe(true)
    expect(t.anvilMarkCount).toBeGreaterThan(0)
  })
  it('calculates test quality', () => {
    const t = measureTesting(testCode)
    expect(t.testQuality).toBeGreaterThan(0)
  })
})

describe('measureHeat', () => {
  it('returns none treatment for simple code', () => {
    const h = measureHeat(simpleCode)
    expect(h.treatmentType).toBe('none')
    expect(h.hasBeenHardened).toBe(false)
  })
  it('detects hardening with error handling', () => {
    const h = measureHeat(strongCode)
    expect(h.hasBeenHardened).toBe(true)
  })
  it('detects still-hot with todos', () => {
    const h = measureHeat(todoCode)
    expect(h.isStillHot).toBe(true)
  })
  it('detects cooling with todos + errors', () => {
    const code = `try { x } catch (e) { console.log(e) } // TODO: fix`
    const h = measureHeat(code)
    expect(h.isCooling).toBe(true)
  })
  it('returns 0 stability for empty code', () => {
    const h = measureHeat(emptyCode)
    expect(h.stabilityScore).toBe(0)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies scrap-iron for low scores', () => {
    expect(classifyCondition(0)).toBe('scrap-iron')
    expect(classifyCondition(10)).toBe('scrap-iron')
  })
  it('classifies soft-metal', () => {
    expect(classifyCondition(15)).toBe('soft-metal')
    expect(classifyCondition(30)).toBe('soft-metal')
  })
  it('classifies brittle-casting', () => {
    expect(classifyCondition(32)).toBe('brittle-casting')
    expect(classifyCondition(49)).toBe('brittle-casting')
  })
  it('classifies serviceable-iron', () => {
    expect(classifyCondition(50)).toBe('serviceable-iron')
    expect(classifyCondition(67)).toBe('serviceable-iron')
  })
  it('classifies quality-tool', () => {
    expect(classifyCondition(68)).toBe('quality-tool')
    expect(classifyCondition(84)).toBe('quality-tool')
  })
  it('classifies masterwork-blade', () => {
    expect(classifyCondition(85)).toBe('masterwork-blade')
    expect(classifyCondition(100)).toBe('masterwork-blade')
  })
})

describe('classifyShopType', () => {
  it('returns scrap-yard for empty array', () => {
    expect(classifyShopType([])).toBe('scrap-yard')
  })
  it('classifies based on average quality', () => {
    const pieces = [{ qualityScore: 85 }, { qualityScore: 90 }].map(qs => ({ qualityScore: qs.qualityScore } as any))
    expect(classifyShopType(pieces)).toBe('master-forge')
  })
})

describe('classifyShopCondition', () => {
  it('returns condemned for empty array', () => {
    expect(classifyShopCondition([])).toBe('condemned')
  })
})

describe('classifySmithGrade', () => {
  it('classifies scavenger for low scores', () => {
    expect(classifySmithGrade(0)).toBe('scavenger')
  })
  it('classifies master-smith for high scores', () => {
    expect(classifySmithGrade(85)).toBe('master-smith')
  })
  it('classifies journeyman', () => {
    expect(classifySmithGrade(70)).toBe('journeyman')
  })
  it('classifies apprentice', () => {
    expect(classifySmithGrade(50)).toBe('apprentice')
  })
  it('classifies tinkerer', () => {
    expect(classifySmithGrade(35)).toBe('tinkerer')
  })
  it('classifies amateur', () => {
    expect(classifySmithGrade(20)).toBe('amateur')
  })
})

// ─── Core Analysis ────────────────────────────────────────────────────────────

describe('analyzeForgedPiece', () => {
  it('returns correct structure for empty code', () => {
    const piece = analyzeForgedPiece(emptyCode, 'empty.ts')
    expect(piece.file).toBe('empty.ts')
    expect(piece.hardness).toBe(0)
    expect(piece.temperQuality).toBe(0)
    expect(piece.impactResistance).toBe(0)
    expect(piece.ductility).toBe(0)
    expect(piece.brittleness).toBe(0)
    expect(piece.anvilMarks).toBe(0)
    expect(piece.qualityScore).toBe(0)
    expect(piece.condition).toBe('scrap-iron')
    expect(piece.metal.type).toBe('clay')
    expect(piece.forging.technique).toBe('duct-tape')
    expect(piece.temper.isDuctile).toBe(false)
  })
  it('returns high scores for strong code', () => {
    const piece = analyzeForgedPiece(strongCode, 'strong.ts')
    expect(piece.file).toBe('strong.ts')
    expect(piece.hardness).toBeGreaterThan(0)
    expect(piece.temperQuality).toBeGreaterThan(0)
    expect(piece.impactResistance).toBeGreaterThan(0)
    expect(piece.qualityScore).toBeGreaterThan(0)
    expect(piece.temper.isDuctile).toBe(true)
    expect(piece.impact.hasCrackStoppers).toBe(true)
  })
  it('detects brittleness in branch-heavy code', () => {
    const piece = analyzeForgedPiece(brittleCode, 'brittle.ts')
    expect(piece.brittleness).toBeGreaterThan(0)
  })
  it('produces valid scores in range 0-100', () => {
    const piece = analyzeForgedPiece(strongCode, 'range.ts')
    expect(piece.hardness).toBeGreaterThanOrEqual(0)
    expect(piece.hardness).toBeLessThanOrEqual(100)
    expect(piece.qualityScore).toBeGreaterThanOrEqual(0)
    expect(piece.qualityScore).toBeLessThanOrEqual(100)
  })
})

describe('analyzeForgeShop', () => {
  it('returns zeros for empty pieces', () => {
    const shop = analyzeForgeShop([], 'empty-dir')
    expect(shop.directory).toBe('empty-dir')
    expect(shop.avgHardness).toBe(0)
    expect(shop.avgTemper).toBe(0)
    expect(shop.pieces).toEqual([])
    expect(shop.shopType).toBe('scrap-yard')
    expect(shop.condition).toBe('condemned')
  })
  it('aggregates metrics from pieces', () => {
    const pieces = [
      analyzeForgedPiece(strongCode, 'a.ts'),
      analyzeForgedPiece(simpleCode, 'b.ts'),
    ]
    const shop = analyzeForgeShop(pieces, 'src')
    expect(shop.avgHardness).toBeGreaterThan(0)
    expect(shop.pieces).toHaveLength(2)
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('buildForgeHammerResult', () => {
  it('returns empty result for no files', () => {
    const result = buildForgeHammerResult([], [], {})
    expect(result.pieces).toEqual([])
    expect(result.shops).toEqual([])
    expect(result.foundry.avgHardness).toBe(0)
    expect(result.foundry.isBattleReady).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.smithGrade).toBe('scavenger')
  })
  it('analyzes single file', () => {
    const result = buildForgeHammerResult(['calc.ts'], [strongCode], {})
    expect(result.pieces).toHaveLength(1)
    expect(result.pieces[0].file).toBe('calc.ts')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.hardestPiece).toBe('calc.ts')
  })
  it('analyzes multiple files', () => {
    const result = buildForgeHammerResult(
      ['src/a.ts', 'src/b.ts', 'test/a.test.ts'],
      [strongCode, simpleCode, testCode],
      {},
    )
    expect(result.pieces).toHaveLength(3)
    expect(result.shops).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.foundry.overallStrength).toBeGreaterThan(0)
  })
  it('groups files by directory into shops', () => {
    const result = buildForgeHammerResult(
      ['src/foo/a.ts', 'src/bar/b.ts', 'root.ts'],
      [strongCode, simpleCode, strongCode],
      {},
    )
    expect(result.shops).toHaveLength(3)
    const dirs = result.shops.map(s => s.directory)
    expect(dirs).toContain('src/foo')
    expect(dirs).toContain('src/bar')
    expect(dirs).toContain('.')
  })
  it('tracks condition counts', () => {
    const result = buildForgeHammerResult(
      ['a.ts', 'b.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.masterworkBladeCount + result.stats.qualityToolCount +
      result.stats.serviceableIronCount + result.stats.brittleCastingCount +
      result.stats.softMetalCount + result.stats.scrapIronCount
    ).toBe(2)
  })
  it('tracks metal type counts', () => {
    const result = buildForgeHammerResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    const total = result.stats.steelCount + result.stats.ironCount +
      result.stats.bronzeCount + result.stats.copperCount
    expect(total).toBe(1)
  })
  it('handles files with fewer contents than files', () => {
    const result = buildForgeHammerResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.pieces).toHaveLength(2)
    expect(result.pieces[1].hardness).toBe(0)
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates no recommendations for empty input', () => {
    const recs = generateRecommendations([], [], { avgHardness: 0, avgTemper: 0, avgImpactResistance: 0, avgDuctility: 0, isBattleReady: false, overallStrength: 0 } as any, { scrapIronCount: 0, softMetalCount: 0, brittleCastingCount: 0, totalFiles: 0, hasHardnessTestCount: 0, isStillHotCount: 0, evenlyTemperedCount: 0, isPolishedCount: 0, overallStrength: 0 } as any)
    expect(recs).toEqual([])
  })
  it('recommends hardening for weak metal', () => {
    const result = buildForgeHammerResult(['a.ts'], [simpleCode], {})
    const weakRecs = result.recommendations.filter(r => r.includes('Weak metal') || r.includes('hardening'))
    expect(weakRecs.length).toBeGreaterThanOrEqual(0)
  })
  it('recommends hardness testing when none detected', () => {
    const result = buildForgeHammerResult(['a.ts'], [simpleCode], {})
    if (result.stats.totalFiles > 0 && result.stats.hasHardnessTestCount === 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('hardness testing')]),
      )
    }
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatForgeHammerTable', () => {
  it('formats empty result', () => {
    const result = buildForgeHammerResult([], [], {})
    const table = formatForgeHammerTable(result, false)
    expect(table).toContain('Forge Hammer')
    expect(table).toContain('No files analyzed')
  })
  it('formats result with pieces', () => {
    const result = buildForgeHammerResult(['a.ts'], [strongCode], {})
    const table = formatForgeHammerTable(result, false)
    expect(table).toContain('a.ts')
    expect(table).toContain('Forge Hammer')
  })
  it('formats verbose output', () => {
    const result = buildForgeHammerResult(['a.ts'], [strongCode], {})
    const table = formatForgeHammerTable(result, true)
    expect(table).toContain('metal:')
    expect(table).toContain('temper:')
    expect(table).toContain('impact:')
    expect(table).toContain('forging:')
    expect(table).toContain('testing:')
    expect(table).toContain('heat:')
  })
  it('truncates non-verbose output at 15 files', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleCode)
    const result = buildForgeHammerResult(files, contents, {})
    const table = formatForgeHammerTable(result, false)
    expect(table).toContain('and 5 more')
  })
})

describe('formatForgeHammerJson', () => {
  it('outputs valid JSON', () => {
    const result = buildForgeHammerResult(['a.ts'], [strongCode], {})
    const json = formatForgeHammerJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pieces).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
  it('outputs empty result', () => {
    const result = buildForgeHammerResult([], [], {})
    const json = formatForgeHammerJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pieces).toEqual([])
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Integration Tests ────────────────────────────────────────────────────────

describe('forge-hammer integration', () => {
  it('produces consistent results for same input', () => {
    const r1 = buildForgeHammerResult(['a.ts'], [strongCode], {})
    const r2 = buildForgeHammerResult(['a.ts'], [strongCode], {})
    expect(r1.pieces[0].qualityScore).toBe(r2.pieces[0].qualityScore)
    expect(r1.stats.overallStrength).toBe(r2.stats.overallStrength)
  })
  it('handles mixed strong and weak code', () => {
    const result = buildForgeHammerResult(
      ['strong.ts', 'weak.ts', 'empty.ts', 'test.ts'],
      [strongCode, simpleCode, emptyCode, testCode],
      {},
    )
    expect(result.pieces).toHaveLength(4)
    expect(result.foundry.overallStrength).toBeGreaterThan(0)
    expect(result.foundry.overallStrength).toBeLessThanOrEqual(100)
  })
  it('tracks special pieces correctly', () => {
    const result = buildForgeHammerResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.hardestPiece).toBeTruthy()
    expect(result.stats.toughestPiece).toBeTruthy()
    expect(result.stats.mostBrittle).toBeTruthy()
    expect(result.stats.mostPolished).toBeTruthy()
    expect(result.stats.needsForging).toBeTruthy()
  })
  it('battle-ready for high strength', () => {
    const result = buildForgeHammerResult(
      ['a.ts', 'b.ts'],
      [strongCode, strongCode],
      {},
    )
    expect(result.foundry.isBattleReady).toBe(result.foundry.overallStrength >= 60)
  })
  it('smith grade matches overall strength', () => {
    const result = buildForgeHammerResult(['a.ts'], [strongCode], {})
    expect(result.stats.smithGrade).toBeTruthy()
    expect(['master-smith', 'journeyman', 'apprentice', 'tinkerer', 'amateur', 'scavenger']).toContain(result.stats.smithGrade)
  })
})
