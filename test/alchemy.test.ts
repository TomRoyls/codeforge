import { describe, it, expect } from 'vitest'
import {
  type Metal,
  type TransmutationTarget,
  type Transformation,
  type Catalyst,
  type Element,
  type AlchemyStats,
  type AlchemyResult,
  scoreQualityIndicators,
  countQualityFlags,
  classifyMetal,
  nextMetalUp,
  identifyTransformations,
  findCatalysts,
  analyzeElements,
  computeTransmutability,
  computeEssence,
  classifyReadiness,
  computePhilosopherStoneScore,
  classifyAlchemyGrade,
  computeTransmutationPotential,
  findDominantMetal,
  generateRecommendations,
  buildAlchemyResult,
} from '../src/commands/alchemy-helpers.js'
import {
  formatMetal,
  formatTransmutabilityBar,
  formatTarget,
  formatTargetsTable,
  formatDifficulty,
  formatRisk,
  formatTransformation,
  formatCatalyst,
  formatCatalysts,
  formatElement,
  formatElements,
  formatAlchemyGrade,
  formatStats,
  formatRecommendations,
  formatAlchemyResult,
  formatAlchemyJson,
} from '../src/commands/alchemy-format-helpers.js'

// ─── scoreQualityIndicators ───────────────────────────────────────────────────

describe('scoreQualityIndicators', () => {
  it('detects types', () => {
    const result = scoreQualityIndicators('const x: number = 1')
    expect(result.hasTypes).toBe(true)
  })

  it('detects docs with JSDoc', () => {
    const result = scoreQualityIndicators('/** docs */\nconst x = 1')
    expect(result.hasDocs).toBe(true)
  })

  it('detects docs with line comments', () => {
    const result = scoreQualityIndicators('// comment\nconst x = 1')
    expect(result.hasDocs).toBe(true)
  })

  it('detects error handling', () => {
    const result = scoreQualityIndicators('try { foo() } catch (e) {}')
    expect(result.hasErrorHandling).toBe(true)
  })

  it('detects exports', () => {
    const result = scoreQualityIndicators('export function foo() {}')
    expect(result.hasExports).toBe(true)
  })

  it('detects constants', () => {
    const result = scoreQualityIndicators('const PI = 3.14')
    expect(result.hasConstants).toBe(true)
  })

  it('detects modern syntax', () => {
    const result = scoreQualityIndicators('const f = () => 1')
    expect(result.hasModernSyntax).toBe(true)
  })

  it('all false for minimal code', () => {
    const result = scoreQualityIndicators('x = 1')
    expect(result.hasTypes).toBe(false)
    expect(result.hasDocs).toBe(false)
    expect(result.hasErrorHandling).toBe(false)
    expect(result.hasExports).toBe(false)
    expect(result.hasConstants).toBe(false)
  })
})

// ─── countQualityFlags ────────────────────────────────────────────────────────

describe('countQualityFlags', () => {
  it('counts true values', () => {
    const ind = { hasTypes: true, hasDocs: false, hasErrorHandling: true, hasExports: false, hasConstants: true, hasModernSyntax: false }
    expect(countQualityFlags(ind)).toBe(3)
  })

  it('counts zero for all false', () => {
    const ind = { hasTypes: false, hasDocs: false, hasErrorHandling: false, hasExports: false, hasConstants: false, hasModernSyntax: false }
    expect(countQualityFlags(ind)).toBe(0)
  })
})

// ─── classifyMetal ────────────────────────────────────────────────────────────

describe('classifyMetal', () => {
  it('classifies lead for poor code', () => {
    expect(classifyMetal('x = 1', 'a.ts')).toBe('lead')
  })

  it('classifies gold for excellent code', () => {
    const code = '/** docs */\nexport const x: number = 1\ntry { foo() } catch(e) {}'
    expect(classifyMetal(code, 'a.ts')).toBe('gold')
  })

  it('penalizes any type usage', () => {
    const code = 'const x: any = 1\nexport function foo(): any {}'
    expect(classifyMetal(code, 'a.ts')).not.toBe('gold')
  })

  it('classifies silver for good code', () => {
    const code = '/** docs */\nexport const x: number = 1\nconst y = "hello"'
    expect(classifyMetal(code, 'a.ts')).toBe('silver')
  })
})

// ─── nextMetalUp ──────────────────────────────────────────────────────────────

describe('nextMetalUp', () => {
  it('returns iron from lead', () => {
    expect(nextMetalUp('lead')).toBe('iron')
  })

  it('returns gold from silver', () => {
    expect(nextMetalUp('silver')).toBe('gold')
  })

  it('returns gold from gold', () => {
    expect(nextMetalUp('gold')).toBe('gold')
  })
})

// ─── identifyTransformations ──────────────────────────────────────────────────

describe('identifyTransformations', () => {
  it('detects var → const/let modernization', () => {
    const transforms = identifyTransformations('var x = 1', 'a.ts', 'lead')
    expect(transforms.some(t => t.type === 'modernization' && t.from.includes('var'))).toBe(true)
  })

  it('detects any type fortification', () => {
    const transforms = identifyTransformations('const x: any = 1\nconst y: any = 2', 'a.ts', 'copper')
    expect(transforms.some(t => t.type === 'fortification' && t.from.includes('any'))).toBe(true)
  })

  it('detects eval as fortification', () => {
    const transforms = identifyTransformations('eval("x + 1")', 'a.ts', 'lead')
    expect(transforms.some(t => t.type === 'fortification' && t.from.includes('eval'))).toBe(true)
  })

  it('detects missing docs as clarification', () => {
    const code = 'a'.repeat(200)
    const transforms = identifyTransformations(code, 'a.ts', 'iron')
    expect(transforms.some(t => t.type === 'clarification')).toBe(true)
  })

  it('detects many functions as abstraction', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
    const transforms = identifyTransformations(code, 'a.ts', 'copper')
    expect(transforms.some(t => t.type === 'abstraction')).toBe(true)
  })

  it('detects for loops as modernization', () => {
    const transforms = identifyTransformations('for (let i = 0; i < 10; i++) {}', 'a.ts', 'iron')
    expect(transforms.some(t => t.type === 'modernization' && t.from.includes('for'))).toBe(true)
  })

  it('detects console.log as clarification', () => {
    const transforms = identifyTransformations('console.log("debug")', 'a.ts', 'iron')
    expect(transforms.some(t => t.type === 'clarification' && t.from.includes('console.log'))).toBe(true)
  })

  it('suggests fortification for lead metal', () => {
    const transforms = identifyTransformations('x = 1', 'a.ts', 'lead')
    expect(transforms.some(t => t.type === 'fortification' && t.from.includes('type safety'))).toBe(true)
  })

  it('detects incomplete error handling', () => {
    const transforms = identifyTransformations('try { foo() } catch(e) {}', 'a.ts', 'copper')
    expect(transforms.some(t => t.type === 'fortification' && t.from.includes('incomplete error'))).toBe(true)
  })

  it('returns empty for clean gold code', () => {
    const code = '/** docs */\nexport const x: number = 1\ntry { foo() } catch(e) { throw new Error(e.message) } finally { cleanup() }'
    const transforms = identifyTransformations(code, 'a.ts', 'gold')
    expect(transforms.length).toBe(0)
  })
})

// ─── findCatalysts ────────────────────────────────────────────────────────────

describe('findCatalysts', () => {
  it('detects typescript-strict for .ts files', () => {
    const catalysts = findCatalysts(['src/a.ts'], ['code'])
    const ts = catalysts.find(c => c.name === 'typescript-strict')
    expect(ts!.isAvailable).toBe(true)
  })

  it('detects test framework', () => {
    const catalysts = findCatalysts(['a.ts'], ['import { test } from "vitest"'])
    const test = catalysts.find(c => c.name === 'test-framework')
    expect(test!.isAvailable).toBe(true)
  })

  it('detects type-annotations pattern', () => {
    const catalysts = findCatalysts(['a.ts'], ['const x: string = "hi"'])
    const types = catalysts.find(c => c.name === 'type-annotations')
    expect(types!.isAvailable).toBe(true)
  })

  it('detects error-boundaries pattern', () => {
    const catalysts = findCatalysts(['a.ts'], ['try { foo() } catch(e) {}'])
    const err = catalysts.find(c => c.name === 'error-boundaries')
    expect(err!.isAvailable).toBe(true)
  })

  it('detects module-organization convention', () => {
    const catalysts = findCatalysts(['a.ts'], ['export function foo() {}'])
    const mod = catalysts.find(c => c.name === 'module-organization')
    expect(mod!.isAvailable).toBe(true)
  })

  it('detects immutable-patterns practice', () => {
    const catalysts = findCatalysts(['a.ts'], ['const x = 1'])
    const imm = catalysts.find(c => c.name === 'immutable-patterns')
    expect(imm!.isAvailable).toBe(true)
  })

  it('does not detect immutable-patterns when var is present', () => {
    const catalysts = findCatalysts(['a.ts'], ['var x = 1'])
    const imm = catalysts.find(c => c.name === 'immutable-patterns')
    expect(imm!.isAvailable).toBe(false)
  })

  it('returns 8 catalysts', () => {
    const catalysts = findCatalysts([], [])
    expect(catalysts.length).toBe(8)
  })
})

// ─── analyzeElements ──────────────────────────────────────────────────────────

describe('analyzeElements', () => {
  it('detects functions', () => {
    const elements = analyzeElements('function foo() {}', 'a.ts')
    const funcs = elements.find(e => e.name === 'functions')
    expect(funcs).toBeDefined()
    expect(funcs!.count).toBe(1)
  })

  it('detects arrow functions', () => {
    const elements = analyzeElements('const f = () => 1', 'a.ts')
    const funcs = elements.find(e => e.name === 'functions')
    expect(funcs).toBeDefined()
  })

  it('detects classes', () => {
    const elements = analyzeElements('class Foo {}', 'a.ts')
    const classes = elements.find(e => e.name === 'classes')
    expect(classes).toBeDefined()
    expect(classes!.count).toBe(1)
  })

  it('detects types', () => {
    const elements = analyzeElements('interface IFoo {} type Bar = string', 'a.ts')
    const types = elements.find(e => e.name === 'types')
    expect(types).toBeDefined()
    expect(types!.count).toBe(2)
    expect(types!.isNoble).toBe(true)
  })

  it('detects imports', () => {
    const elements = analyzeElements("import { x } from './foo'", 'a.ts')
    const imports = elements.find(e => e.name === 'imports')
    expect(imports).toBeDefined()
  })

  it('detects constants', () => {
    const elements = analyzeElements('const PI = 3.14', 'a.ts')
    const consts = elements.find(e => e.name === 'constants')
    expect(consts).toBeDefined()
  })

  it('returns empty for plain code', () => {
    const elements = analyzeElements('let x = 1', 'a.ts')
    expect(elements.length).toBe(0)
  })

  it('typed functions have higher purity', () => {
    const typed = analyzeElements('function foo(x: number): string { return String(x) }', 'a.ts')
    const untyped = analyzeElements('function foo(x) { return String(x) }', 'a.ts')
    expect(typed.find(e => e.name === 'functions')!.purity).toBeGreaterThan(
      untyped.find(e => e.name === 'functions')!.purity,
    )
  })
})

// ─── computeTransmutability ───────────────────────────────────────────────────

describe('computeTransmutability', () => {
  it('lead has high transmutability', () => {
    expect(computeTransmutability('lead', 0)).toBe(90)
  })

  it('gold has low transmutability', () => {
    expect(computeTransmutability('gold', 0)).toBe(10)
  })

  it('transforms increase transmutability', () => {
    expect(computeTransmutability('copper', 5)).toBeGreaterThan(computeTransmutability('copper', 0))
  })

  it('caps at 100', () => {
    expect(computeTransmutability('lead', 20)).toBe(100)
  })
})

// ─── computeEssence ───────────────────────────────────────────────────────────

describe('computeEssence', () => {
  it('returns 0 for empty string', () => {
    expect(computeEssence('')).toBe(0)
  })

  it('scores exports', () => {
    expect(computeEssence('export function foo() {}')).toBeGreaterThanOrEqual(20)
  })

  it('scores types', () => {
    expect(computeEssence('const x: number = 1')).toBeGreaterThanOrEqual(15)
  })

  it('scores docs', () => {
    expect(computeEssence('/** docs */\nfunction foo() {}')).toBeGreaterThanOrEqual(15)
  })

  it('caps at 100', () => {
    expect(computeEssence('/** docs */\nexport function foo(x: number): string { return String(x) }\nconst bar = "long enough"')).toBeLessThanOrEqual(100)
  })
})

// ─── classifyReadiness ────────────────────────────────────────────────────────

describe('classifyReadiness', () => {
  it('gold is stable', () => {
    expect(classifyReadiness('gold', 0)).toBe('stable')
  })

  it('silver is stable', () => {
    expect(classifyReadiness('silver', 0)).toBe('stable')
  })

  it('many transforms makes reactive', () => {
    expect(classifyReadiness('lead', 5)).toBe('reactive')
  })

  it('some transforms makes prepared', () => {
    expect(classifyReadiness('copper', 2)).toBe('prepared')
  })

  it('few transforms on low metal is raw', () => {
    expect(classifyReadiness('lead', 0)).toBe('raw')
  })
})

// ─── computePhilosopherStoneScore ─────────────────────────────────────────────

describe('computePhilosopherStoneScore', () => {
  it('returns 100 for empty targets', () => {
    expect(computePhilosopherStoneScore([], [])).toBe(100)
  })

  it('scores based on metal average', () => {
    const targets: TransmutationTarget[] = [{
      file: 'a.ts', currentMetal: 'gold', potentialMetal: 'gold',
      transmutability: 10, transformations: [], readiness: 'stable', essence: 90,
    }]
    const score = computePhilosopherStoneScore(targets, [])
    expect(score).toBeGreaterThanOrEqual(70)
  })

  it('scores low for lead targets', () => {
    const targets: TransmutationTarget[] = [{
      file: 'a.ts', currentMetal: 'lead', potentialMetal: 'iron',
      transmutability: 90, transformations: [], readiness: 'raw', essence: 10,
    }]
    const score = computePhilosopherStoneScore(targets, [])
    expect(score).toBeLessThan(50)
  })
})

// ─── classifyAlchemyGrade ─────────────────────────────────────────────────────

describe('classifyAlchemyGrade', () => {
  it('returns grand-master for high scores', () => {
    expect(classifyAlchemyGrade(90, 90)).toBe('grand-master')
  })

  it('returns master for good scores', () => {
    expect(classifyAlchemyGrade(70, 70)).toBe('master')
  })

  it('returns adept for moderate scores', () => {
    expect(classifyAlchemyGrade(50, 50)).toBe('adept')
  })

  it('returns apprentice for low scores', () => {
    expect(classifyAlchemyGrade(30, 30)).toBe('apprentice')
  })

  it('returns novice for very low scores', () => {
    expect(classifyAlchemyGrade(10, 10)).toBe('novice')
  })
})

// ─── computeTransmutationPotential ────────────────────────────────────────────

describe('computeTransmutationPotential', () => {
  it('returns 100 for empty targets', () => {
    expect(computeTransmutationPotential([])).toBe(100)
  })

  it('averages transmutability', () => {
    const targets: TransmutationTarget[] = [
      { file: 'a.ts', currentMetal: 'lead', potentialMetal: 'iron', transmutability: 80, transformations: [], readiness: 'raw', essence: 50 },
      { file: 'b.ts', currentMetal: 'gold', potentialMetal: 'gold', transmutability: 20, transformations: [], readiness: 'stable', essence: 90 },
    ]
    expect(computeTransmutationPotential(targets)).toBe(50)
  })
})

// ─── findDominantMetal ────────────────────────────────────────────────────────

describe('findDominantMetal', () => {
  it('returns unknown for empty', () => {
    expect(findDominantMetal([])).toBe('unknown')
  })

  it('returns most common metal', () => {
    const targets: TransmutationTarget[] = [
      { file: 'a.ts', currentMetal: 'lead', potentialMetal: 'iron', transmutability: 90, transformations: [], readiness: 'raw', essence: 50 },
      { file: 'b.ts', currentMetal: 'lead', potentialMetal: 'iron', transmutability: 85, transformations: [], readiness: 'raw', essence: 40 },
      { file: 'c.ts', currentMetal: 'gold', potentialMetal: 'gold', transmutability: 10, transformations: [], readiness: 'stable', essence: 90 },
    ]
    expect(findDominantMetal(targets)).toBe('lead')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends transmuting lead files', () => {
    const stats = { leadFiles: 3, explosiveTransformations: 0, avgTransmutability: 50, alchemyGrade: 'adept' } as AlchemyStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('lead file'))).toBe(true)
  })

  it('recommends missing catalysts', () => {
    const catalysts: Catalyst[] = [{
      name: 'test-framework', type: 'tooling', effectiveness: 80,
      applicableTo: ['fortification'], isAvailable: false, description: 'Tests',
    }]
    const stats = { leadFiles: 0, explosiveTransformations: 0, avgTransmutability: 50, alchemyGrade: 'adept' } as AlchemyStats
    const recs = generateRecommendations([], catalysts, [], stats)
    expect(recs.some(r => r.includes('missing catalyst'))).toBe(true)
  })

  it('warns about explosive transformations', () => {
    const stats = { leadFiles: 0, explosiveTransformations: 2, avgTransmutability: 50, alchemyGrade: 'adept' } as AlchemyStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('explosive'))).toBe(true)
  })

  it('identifies high ROI candidates', () => {
    const targets: TransmutationTarget[] = [{
      file: 'a.ts', currentMetal: 'lead', potentialMetal: 'iron',
      transmutability: 90, transformations: [], readiness: 'raw', essence: 70,
    }]
    const stats = { leadFiles: 1, explosiveTransformations: 0, avgTransmutability: 90, alchemyGrade: 'adept' } as AlchemyStats
    const recs = generateRecommendations(targets, [], [], stats)
    expect(recs.some(r => r.includes('ROI'))).toBe(true)
  })

  it('suggests momentum for novice grade', () => {
    const stats = { leadFiles: 0, explosiveTransformations: 0, avgTransmutability: 30, alchemyGrade: 'novice' } as AlchemyStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('elementary'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const stats = { leadFiles: 0, explosiveTransformations: 0, avgTransmutability: 50, alchemyGrade: 'grand-master' } as AlchemyStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.length).toBe(0)
  })
})

// ─── buildAlchemyResult ───────────────────────────────────────────────────────

describe('buildAlchemyResult', () => {
  it('returns complete result structure', () => {
    const result = buildAlchemyResult(['src/a.ts'], ['export function a() {}'], {})
    expect(result.targets).toHaveLength(1)
    expect(result.catalysts.length).toBeGreaterThan(0)
    expect(result.stats.totalTargets).toBe(1)
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty files', () => {
    const result = buildAlchemyResult([], [], {})
    expect(result.stats.totalTargets).toBe(0)
    expect(result.stats.philosopherStoneScore).toBe(100)
    expect(result.stats.alchemyGrade).toBe('grand-master')
  })

  it('classifies lead file correctly', () => {
    const result = buildAlchemyResult(['src/a.ts'], ['x = 1'], {})
    expect(result.targets[0].currentMetal).toBe('lead')
    expect(result.stats.leadFiles).toBe(1)
  })

  it('classifies gold file correctly', () => {
    const code = '/** docs */\nexport const x: number = 1\ntry { foo() } catch(e) { throw new Error("x") } finally { cleanup() }'
    const result = buildAlchemyResult(['src/a.ts'], [code], {})
    expect(result.targets[0].currentMetal).toBe('gold')
    expect(result.stats.goldFiles).toBe(1)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatMetal includes metal name', () => {
    expect(formatMetal('gold')).toContain('gold')
    expect(formatMetal('lead')).toContain('lead')
  })

  it('formatTransmutabilityBar has fill chars', () => {
    const bar = formatTransmutabilityBar(50)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
  })

  it('formatTarget includes file name', () => {
    const target: TransmutationTarget = {
      file: 'src/a.ts', currentMetal: 'silver', potentialMetal: 'gold',
      transmutability: 30, transformations: [], readiness: 'stable', essence: 80,
    }
    expect(formatTarget(target)).toContain('src/a.ts')
  })

  it('formatTargetsTable handles empty', () => {
    expect(formatTargetsTable([])).toContain('No transmutation targets')
  })

  it('formatDifficulty includes level', () => {
    expect(formatDifficulty('elementary')).toContain('ELEMENTARY')
    expect(formatDifficulty('masterwork')).toContain('MASTERWORK')
  })

  it('formatRisk includes level', () => {
    expect(formatRisk('safe')).toContain('SAFE')
    expect(formatRisk('explosive')).toContain('EXPLOSIVE')
  })

  it('formatTransformation formats transform', () => {
    const t: Transformation = {
      type: 'fortification', from: 'any', to: 'specific types',
      difficulty: 'intermediate', reagent: 'TypeScript', yield: 90, risk: 'caution',
    }
    const result = formatTransformation(t)
    expect(result).toContain('fortification')
    expect(result).toContain('INTERMEDIATE')
    expect(result).toContain('CAUTION')
  })

  it('formatCatalyst shows availability', () => {
    const c: Catalyst = {
      name: 'test-framework', type: 'tooling', effectiveness: 80,
      applicableTo: [], isAvailable: true, description: 'Testing',
    }
    expect(formatCatalyst(c)).toContain('✓')
    expect(formatCatalyst(c)).toContain('test-framework')
  })

  it('formatCatalysts handles empty', () => {
    expect(formatCatalysts([])).toContain('No catalysts')
  })

  it('formatElement includes name', () => {
    const e: Element = { name: 'functions', count: 3, purity: 80, reactivity: 60, stability: 70, isNoble: true }
    expect(formatElement(e)).toContain('functions')
    expect(formatElement(e)).toContain('noble')
  })

  it('formatElements handles empty', () => {
    expect(formatElements([])).toContain('No elements')
  })

  it('formatAlchemyGrade colors grade', () => {
    expect(formatAlchemyGrade('grand-master')).toContain('GRAND-MASTER')
    expect(formatAlchemyGrade('novice')).toContain('NOVICE')
  })

  it('formatStats produces summary', () => {
    const stats: AlchemyStats = {
      totalTargets: 5, leadFiles: 2, goldFiles: 1,
      avgTransmutability: 55, avgEssence: 60,
      totalTransformations: 10, elementaryTransformations: 6, masterworkTransformations: 1,
      safeTransformations: 7, explosiveTransformations: 1,
      availableCatalysts: 4, missingCatalysts: 4,
      totalElements: 8, nobleElements: 3,
      overallTransmutationPotential: 55, philosopherStoneScore: 60,
      dominantMetal: 'copper', alchemyGrade: 'adept',
    }
    const result = formatStats(stats)
    expect(result).toContain('ALCHEMY ANALYSIS')
    expect(result).toContain('5')
    expect(result).toContain('ADEPT')
  })

  it('formatRecommendations numbers items', () => {
    expect(formatRecommendations(['First', 'Second'])).toContain('1.')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('golden')
  })

  it('formatAlchemyResult produces full output', () => {
    const result = buildAlchemyResult(['src/a.ts'], ['export function a() {}'], {})
    const output = formatAlchemyResult(result)
    expect(output).toContain('ALCHEMY ANALYSIS')
    expect(output).toContain('Targets')
  })

  it('formatAlchemyJson produces valid JSON', () => {
    const result = buildAlchemyResult(['src/a.ts'], ['export function a() {}'], {})
    const json = formatAlchemyJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.targets).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('alchemy integration', () => {
  it('full analysis of mixed codebase', () => {
    const files = ['src/core.ts', 'src/legacy.js', 'src/utils.ts']
    const contents = [
      '/** Core module */\nexport function core(x: number): string { try { return String(x) } catch(e) { throw new Error("fail") } finally { cleanup() } }',
      'var x = 1\nfunction old() { eval("x + 1") }\nconsole.log("debug")',
      'export const helper = () => 1',
    ]
    const result = buildAlchemyResult(files, contents, {})
    expect(result.targets.length).toBe(3)
    expect(result.stats.leadFiles).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalTransformations).toBeGreaterThan(0)
    expect(result.catalysts.length).toBeGreaterThan(0)
  })

  it('clean codebase achieves high grade', () => {
    const code = '/** docs */\nexport const x: number = 1\ntry { foo() } catch(e) { throw new Error("x") } finally { cleanup() }'
    const result = buildAlchemyResult(['src/a.ts'], [code], {})
    expect(result.stats.goldFiles).toBe(1)
    expect(result.stats.philosopherStoneScore).toBeGreaterThanOrEqual(80)
  })
})
