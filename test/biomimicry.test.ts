import { describe, expect, it } from 'vitest'

import {
  analyzePatterns,
  analyzeEcosystem,
  buildBiomimicryResult,
  classifyEcosystemHealth,
  classifyLifestyle,
  classifyNatureMaturity,
  computeBioScore,
  detectPatterns,
  generateBioRecommendations,
  type BioLifestyle,
  type BiomimicryStats,
  type BioEcosystem,
} from '../src/commands/biomimicry-helpers.js'
import { formatBiomimicryJson, formatBiomimicryTable } from '../src/commands/biomimicry-format-helpers.js'

// ─── detectPatterns ───────────────────────────────────────────────────────────

describe('detectPatterns', () => {
  it('returns 8 pattern scores', () => {
    const scores = detectPatterns('const x = 1', 'a.ts')
    expect(scores.size).toBe(8)
  })

  it('scores honeycomb higher for organized imports/exports', () => {
    const good = detectPatterns("import { x } from 'y'\nexport const z = x\nexport function foo() {}", 'a.ts')
    const bad = detectPatterns('const x = 1', 'a.ts')
    expect(good.get('honeycomb')!).toBeGreaterThan(bad.get('honeycomb')!)
  })

  it('scores spider-web higher with error handling', () => {
    const withTry = detectPatterns('try { work() } catch(e) {}', 'a.ts')
    const without = detectPatterns('work()', 'a.ts')
    expect(withTry.get('spider-web')!).toBeGreaterThan(without.get('spider-web')!)
  })

  it('scores coral-reef higher with interfaces', () => {
    const withIface = detectPatterns('interface Config { x: number }\nexport default {}', 'a.ts')
    const without = detectPatterns('const x = 1', 'a.ts')
    expect(withIface.get('coral-reef')!).toBeGreaterThan(without.get('coral-reef')!)
  })

  it('scores mycelium higher with event patterns', () => {
    const withEvents = detectPatterns('emitter.on("event", handler)', 'a.ts')
    const without = detectPatterns('const x = 1', 'a.ts')
    expect(withEvents.get('mycelium')!).toBeGreaterThan(without.get('mycelium')!)
  })

  it('scores evolution higher with versioning', () => {
    const withVersion = detectPatterns('// TODO: v2 migration\nconst version = "1.0"', 'a.ts')
    const without = detectPatterns('const x = 1', 'a.ts')
    expect(withVersion.get('evolution')!).toBeGreaterThan(without.get('evolution')!)
  })

  it('scores swarm higher with Promise.all', () => {
    const withParallel = detectPatterns('await Promise.all([a(), b()])', 'a.ts')
    const without = detectTraits('const x = 1', 'a.ts')
    expect(withParallel.get('swarm')!).toBeGreaterThan(without.get('swarm')!)
  })

  it('scores camouflage higher with abstraction', () => {
    const withAbstract = detectPatterns('interface IRepo {}\nclass Impl implements IRepo {}', 'a.ts')
    const without = detectPatterns('const x = 1', 'a.ts')
    expect(withAbstract.get('camouflage')!).toBeGreaterThan(without.get('camouflage')!)
  })

  it('scores symbiosis higher for balanced imports/exports', () => {
    const balanced = detectPatterns("import { x } from 'y'\nexport const z = x\nexport function w() {}", 'a.ts')
    const parasitic = detectTraits("import { a } from 'b'\nimport { c } from 'd'\nimport { e } from 'f'", 'a.ts')
    expect(balanced.get('symbiosis')!).toBeGreaterThan(parasitic.get('symbiosis')!)
  })

  it('all scores are between 0 and 100', () => {
    const scores = detectPatterns('try { } catch(e) { } import x export y Promise.all', 'a.ts')
    for (const [, score] of scores) {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  })

  it('rewards optional chaining for spider-web', () => {
    const withOpt = detectPatterns('const x = obj?.prop ?? "default"', 'a.ts')
    const without = detectTraits('const x = 1', 'a.ts')
    expect(withOpt.get('spider-web')!).toBeGreaterThan(without.get('spider-web')!)
  })

  it('rewards private fields for camouflage', () => {
    const withPrivate = detectPatterns('class Foo { #private = 1 }', 'a.ts')
    const without = detectTraits('const x = 1', 'a.ts')
    expect(withPrivate.get('camouflage')!).toBeGreaterThan(without.get('camouflage')!)
  })
})

function detectTraits(content: string, filePath: string) {
  return detectPatterns(content, filePath)
}

// ─── analyzePatterns ──────────────────────────────────────────────────────────

describe('analyzePatterns', () => {
  it('returns 8 patterns', () => {
    const patterns = analyzePatterns(['a.ts'], ['const x = 1'])
    expect(patterns.length).toBe(8)
  })

  it('includes pattern metadata', () => {
    const patterns = analyzePatterns(['a.ts'], ['const x = 1'])
    expect(patterns[0].name).toBeDefined()
    expect(patterns[0].natureAnalogy).toBeDefined()
    expect(patterns[0].codeEquivalent).toBeDefined()
    expect(patterns[0].description).toBeDefined()
  })

  it('computes adherence', () => {
    const patterns = analyzePatterns(['a.ts'], ['const x = 1'])
    for (const p of patterns) {
      expect(p.adherence).toBeGreaterThanOrEqual(0)
      expect(p.adherence).toBeLessThanOrEqual(100)
    }
  })

  it('lists files exhibiting pattern', () => {
    const patterns = analyzePatterns(['a.ts'], ['try { } catch(e) {}'])
    const spiderWeb = patterns.find(p => p.name === 'spider-web')
    expect(spiderWeb!.files.length).toBeGreaterThan(0)
  })

  it('provides benefits and missingBenefits', () => {
    const patterns = analyzePatterns(['a.ts'], ['const x = 1'])
    for (const p of patterns) {
      expect(p.benefits.length + p.missingBenefits.length).toBeGreaterThan(0)
    }
  })
})

// ─── classifyLifestyle ────────────────────────────────────────────────────────

describe('classifyLifestyle', () => {
  it('classifies parasitic files (many imports, no exports)', () => {
    const scores = detectPatterns("import { a } from 'b'\nimport { c } from 'd'\nimport { e } from 'f'\nconst x = 1", 'a.ts')
    const lifestyle = classifyLifestyle(scores, "import { a } from 'b'\nimport { c } from 'd'\nimport { e } from 'f'\nconst x = 1", 'a.ts')
    expect(lifestyle.classification).toBe('parasitic')
  })

  it('classifies symbiotic files (balanced give/take)', () => {
    const code = "import { helper } from './utils.js'\nexport function process() {}\nexport function validate() {}"
    const scores = detectPatterns(code, 'a.ts')
    const lifestyle = classifyLifestyle(scores, code, 'a.ts')
    expect(['symbiotic', 'climax', 'generalist']).toContain(lifestyle.classification)
  })

  it('sets dominant pattern', () => {
    const scores = detectPatterns('const x = 1', 'a.ts')
    const lifestyle = classifyLifestyle(scores, 'const x = 1', 'a.ts')
    expect(lifestyle.dominantPattern).toBeDefined()
  })

  it('sets secondary patterns', () => {
    const scores = detectPatterns('const x = 1', 'a.ts')
    const lifestyle = classifyLifestyle(scores, 'const x = 1', 'a.ts')
    expect(lifestyle.secondaryPatterns.length).toBeLessThanOrEqual(3)
  })

  it('computes resilience', () => {
    const scores = detectPatterns('try { } catch(e) {}', 'a.ts')
    const lifestyle = classifyLifestyle(scores, 'try { } catch(e) {}', 'a.ts')
    expect(lifestyle.resilience).toBeGreaterThan(0)
    expect(lifestyle.resilience).toBeLessThanOrEqual(100)
  })

  it('computes adaptability', () => {
    const scores = detectPatterns('interface I { } export function f() {}', 'a.ts')
    const lifestyle = classifyLifestyle(scores, 'interface I { } export function f() {}', 'a.ts')
    expect(lifestyle.adaptability).toBeGreaterThan(0)
  })

  it('computes efficiency', () => {
    const scores = detectPatterns('export const x = 1', 'a.ts')
    const lifestyle = classifyLifestyle(scores, 'export const x = 1', 'a.ts')
    expect(lifestyle.efficiency).toBeGreaterThan(0)
  })

  it('computes symbiosis', () => {
    const scores = detectPatterns('export const x = 1', 'a.ts')
    const lifestyle = classifyLifestyle(scores, 'export const x = 1', 'a.ts')
    expect(lifestyle.symbiosis).toBeGreaterThanOrEqual(0)
  })

  it('computes biodiversity', () => {
    const scores = detectPatterns('const x = 1', 'a.ts')
    const lifestyle = classifyLifestyle(scores, 'const x = 1', 'a.ts')
    expect(lifestyle.biodiversity).toBeGreaterThanOrEqual(0)
  })

  it('sets file path', () => {
    const scores = detectPatterns('const x = 1', 'src/a.ts')
    const lifestyle = classifyLifestyle(scores, 'const x = 1', 'src/a.ts')
    expect(lifestyle.file).toBe('src/a.ts')
  })
})

// ─── analyzeEcosystem ─────────────────────────────────────────────────────────

describe('analyzeEcosystem', () => {
  it('counts species (file types)', () => {
    const eco = analyzeEcosystem(['a.ts', 'b.ts', 'c.js'], ['x', 'y', 'z'], 'src')
    expect(eco.species).toBe(2)
  })

  it('identifies monoculture', () => {
    const eco = analyzeEcosystem(['a.ts', 'b.ts', 'c.ts'], ['x', 'y', 'z'], 'src')
    expect(eco.isMonoculture).toBe(true)
  })

  it('identifies non-monoculture', () => {
    const eco = analyzeEcosystem(['a.ts', 'b.js'], ['x', 'y'], 'src')
    expect(eco.isMonoculture).toBe(false)
  })

  it('builds food web from imports', () => {
    const contents = [
      "import { x } from './utils'",
      'export const x = 1',
    ]
    const eco = analyzeEcosystem(['src/a.ts', 'src/utils.ts'], contents, 'src')
    expect(eco.foodWeb.length).toBeGreaterThan(0)
  })

  it('identifies keystone file', () => {
    const contents = [
      "import { x } from './core'",
      "import { y } from './core'",
      'export const core = 1',
    ]
    const eco = analyzeEcosystem(['a.ts', 'b.ts', 'core.ts'], contents, 'src')
    expect(eco.keystone).toBeDefined()
  })

  it('computes biodiversity', () => {
    const eco = analyzeEcosystem(['a.ts', 'b.js'], ['x', 'y'], 'src')
    expect(eco.biodiversity).toBeGreaterThanOrEqual(0)
    expect(eco.biodiversity).toBeLessThanOrEqual(100)
  })

  it('assigns health based on biodiversity', () => {
    const manyTypes = Array.from({ length: 6 }, (_, i) => `file${i}.${['ts', 'js', 'py', 'rs', 'go', 'java'][i]}`)
    const eco = analyzeEcosystem(manyTypes, manyTypes.map(() => 'x'), 'src')
    expect(['thriving', 'balanced', 'stressed', 'degraded', 'collapsed']).toContain(eco.health)
  })

  it('sets ecosystem name', () => {
    const eco = analyzeEcosystem(['a.ts'], ['x'], 'src/core')
    expect(eco.name).toBe('src/core')
  })
})

// ─── computeBioScore ──────────────────────────────────────────────────────────

describe('computeBioScore', () => {
  it('computes average of 5 metrics', () => {
    expect(computeBioScore(80, 80, 80, 80, 80)).toBe(80)
  })

  it('returns 0 for all zeros', () => {
    expect(computeBioScore(0, 0, 0, 0, 0)).toBe(0)
  })

  it('returns 100 for all hundreds', () => {
    expect(computeBioScore(100, 100, 100, 100, 100)).toBe(100)
  })

  it('computes mixed scores', () => {
    const result = computeBioScore(100, 0, 100, 0, 100)
    expect(result).toBe(60)
  })
})

// ─── classifyEcosystemHealth ──────────────────────────────────────────────────

describe('classifyEcosystemHealth', () => {
  it('returns rainforest for high biodiversity thriving', () => {
    expect(classifyEcosystemHealth(80, 'thriving')).toBe('rainforest')
  })

  it('returns grassland for moderate biodiversity', () => {
    expect(classifyEcosystemHealth(55, 'balanced')).toBe('grassland')
  })

  it('returns tundra for moderate-low', () => {
    expect(classifyEcosystemHealth(35, 'stressed')).toBe('tundra')
  })

  it('returns desert for low biodiversity', () => {
    expect(classifyEcosystemHealth(20, 'degraded')).toBe('desert')
  })

  it('returns wasteland for very low', () => {
    expect(classifyEcosystemHealth(10, 'collapsed')).toBe('wasteland')
  })
})

// ─── classifyNatureMaturity ───────────────────────────────────────────────────

describe('classifyNatureMaturity', () => {
  it('returns old-growth for high scores', () => {
    expect(classifyNatureMaturity(80, 80, 80)).toBe('old-growth')
  })

  it('returns mature for good scores', () => {
    expect(classifyNatureMaturity(60, 60, 60)).toBe('mature')
  })

  it('returns evolving for moderate scores', () => {
    expect(classifyNatureMaturity(40, 40, 40)).toBe('evolving')
  })

  it('returns primordial for low scores', () => {
    expect(classifyNatureMaturity(20, 20, 20)).toBe('primordial')
  })
})

// ─── generateBioRecommendations ────────────────────────────────────────────────

describe('generateBioRecommendations', () => {
  const makeStats = (overrides: Partial<BiomimicryStats> = {}): BiomimicryStats => ({
    totalPatterns: 8,
    highAdherencePatterns: 4,
    lowAdherencePatterns: 2,
    dominantPattern: 'honeycomb',
    avgResilience: 60,
    avgAdaptability: 55,
    avgEfficiency: 65,
    avgSymbiosis: 50,
    avgBiodiversity: 45,
    totalEcosystems: 1,
    thrivingEcosystems: 1,
    monocultures: 0,
    keystoneFiles: 1,
    pioneerFiles: 0,
    symbioticFiles: 1,
    parasiticFiles: 0,
    overallBioScore: 55,
    ecosystemHealth: 'grassland',
    natureMaturity: 'mature',
    ...overrides,
  })

  it('recommends increasing monoculture diversity', () => {
    const eco: BioEcosystem = { name: 'src', species: 1, biodiversity: 10, foodWeb: [], keystone: '', isMonoculture: true, health: 'degraded' }
    const recs = generateBioRecommendations([], [], [eco], makeStats())
    expect(recs.some(r => r.includes('monoculture'))).toBe(true)
  })

  it('recommends adding exports to parasitic files', () => {
    const lifestyle: BioLifestyle = { file: 'bad.ts', dominantPattern: 'honeycomb', secondaryPatterns: [], resilience: 10, adaptability: 10, efficiency: 10, symbiosis: 10, biodiversity: 10, classification: 'parasitic' }
    const recs = generateBioRecommendations([], [lifestyle], [], makeStats({ parasiticFiles: 1 }))
    expect(recs.some(r => r.includes('parasitic') || r.includes('exports'))).toBe(true)
  })

  it('recommends resilience improvement', () => {
    const lifestyle: BioLifestyle = { file: 'fragile.ts', dominantPattern: 'honeycomb', secondaryPatterns: [], resilience: 20, adaptability: 50, efficiency: 50, symbiosis: 50, biodiversity: 50, classification: 'pioneer' }
    const recs = generateBioRecommendations([], [lifestyle], [], makeStats())
    expect(recs.some(r => r.includes('resilience') || r.includes('error handling'))).toBe(true)
  })

  it('recommends for wasteland ecosystem health', () => {
    const recs = generateBioRecommendations([], [], [], makeStats({ ecosystemHealth: 'wasteland' }))
    expect(recs.some(r => r.includes('degraded') || r.includes('biodiversity'))).toBe(true)
  })

  it('recommends for more parasitic than symbiotic', () => {
    const recs = generateBioRecommendations([], [], [], makeStats({ parasiticFiles: 5, symbioticFiles: 1 }))
    expect(recs.some(r => r.includes('parasitic') || r.includes('symbiotic'))).toBe(true)
  })
})

// ─── buildBiomimicryResult ────────────────────────────────────────────────────

describe('buildBiomimicryResult', () => {
  it('returns all required fields', () => {
    const result = buildBiomimicryResult(['a.ts'], ['export const x = 1'], {})
    expect(result).toHaveProperty('patterns')
    expect(result).toHaveProperty('lifestyles')
    expect(result).toHaveProperty('ecosystems')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('handles empty input', () => {
    const result = buildBiomimicryResult([], [], {})
    expect(result.patterns.length).toBe(8)
    expect(result.lifestyles).toEqual([])
    expect(result.ecosystems).toEqual([])
  })

  it('creates 8 patterns', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    expect(result.patterns.length).toBe(8)
  })

  it('creates one lifestyle per file', () => {
    const result = buildBiomimicryResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.lifestyles.length).toBe(2)
  })

  it('creates one ecosystem per directory', () => {
    const result = buildBiomimicryResult(['src/a.ts', 'test/b.ts'], ['x', 'y'], {})
    expect(result.ecosystems.length).toBe(2)
  })

  it('computes overall bio score', () => {
    const result = buildBiomimicryResult(['a.ts'], ['export const x = 1'], {})
    expect(result.stats.overallBioScore).toBeGreaterThan(0)
    expect(result.stats.overallBioScore).toBeLessThanOrEqual(100)
  })

  it('sets ecosystem health', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    expect(['rainforest', 'grassland', 'tundra', 'desert', 'wasteland']).toContain(result.stats.ecosystemHealth)
  })

  it('sets nature maturity', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    expect(['primordial', 'evolving', 'mature', 'old-growth']).toContain(result.stats.natureMaturity)
  })

  it('counts pattern adherence', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.totalPatterns).toBe(8)
    expect(result.stats.highAdherencePatterns + result.stats.lowAdherencePatterns).toBeLessThanOrEqual(8)
  })

  it('generates recommendations', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    expect(result.recommendations).toBeDefined()
  })
})

// ─── formatBiomimicryTable ────────────────────────────────────────────────────

describe('formatBiomimicryTable', () => {
  it('returns a string', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatBiomimicryTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headings', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatBiomimicryTable(result, false)
    expect(formatted).toContain('Patterns')
    expect(formatted).toContain('Lifestyles')
    expect(formatted).toContain('Ecosystems')
  })

  it('shows no lifestyles message for empty', () => {
    const result = buildBiomimicryResult([], [], {})
    const formatted = formatBiomimicryTable(result, false)
    expect(formatted).toContain('No lifestyles')
  })
})

// ─── formatBiomimicryJson ─────────────────────────────────────────────────────

describe('formatBiomimicryJson', () => {
  it('returns valid JSON', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    expect(() => JSON.parse(formatBiomimicryJson(result))).not.toThrow()
  })

  it('contains all top-level keys', () => {
    const result = buildBiomimicryResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatBiomimicryJson(result))
    expect(parsed).toHaveProperty('patterns')
    expect(parsed).toHaveProperty('lifestyles')
    expect(parsed).toHaveProperty('ecosystems')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('roundtrips correctly', () => {
    const result = buildBiomimicryResult(['a.ts'], ['export const x = 1'], {})
    const parsed = JSON.parse(formatBiomimicryJson(result))
    expect(parsed.stats.overallBioScore).toBe(result.stats.overallBioScore)
    expect(parsed.stats.totalPatterns).toBe(result.stats.totalPatterns)
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('biomimicry integration', () => {
  it('handles a realistic codebase', () => {
    const files = ['src/index.ts', 'src/core/types.ts', 'src/utils/helpers.ts', 'test/helpers.test.ts']
    const contents = [
      "import { Config } from './core/types.js'\nexport function main(cfg: Config) { try { run(cfg) } catch(e) { log(e) } }",
      '/** Type definitions */\nexport interface Config { debug: boolean }\nexport type Status = "active" | "inactive"',
      "import { Status } from '../core/types.js'\nexport function helper(s: Status): string { return s }\nexport function process() {}",
      "import { helper } from '../src/utils/helpers.js'\ndescribe('helpers', () => { it('works', () => {}) })",
    ]
    const result = buildBiomimicryResult(files, contents, {})
    expect(result.patterns.length).toBe(8)
    expect(result.lifestyles.length).toBe(4)
    expect(result.ecosystems.length).toBeGreaterThanOrEqual(2)
    expect(result.stats.overallBioScore).toBeGreaterThan(0)
  })

  it('produces consistent results', () => {
    const r1 = buildBiomimicryResult(['a.ts'], ['export const x = 1'], {})
    const r2 = buildBiomimicryResult(['a.ts'], ['export const x = 1'], {})
    expect(r1.stats.overallBioScore).toBe(r2.stats.overallBioScore)
    expect(r1.stats.natureMaturity).toBe(r2.stats.natureMaturity)
  })

  it('handles parasitic codebase', () => {
    const files = ['consumer.ts']
    const contents = ["import { a } from 'x'\nimport { b } from 'y'\nimport { c } from 'z'\nconst x = a + b + c"]
    const result = buildBiomimicryResult(files, contents, {})
    expect(result.lifestyles[0].classification).toBe('parasitic')
    expect(result.lifestyles[0].symbiosis).toBeLessThan(50)
  })

  it('handles well-structured codebase', () => {
    const code = [
      '/** Module entry */',
      "import { helper } from './utils.js'",
      'export interface Config { debug: boolean }',
      'export function main(cfg: Config) {',
      '  try { return helper(cfg) } catch(e) { throw new Error("fail") }',
      '}',
    ].join('\n')
    const result = buildBiomimicryResult(['src/index.ts'], [code], {})
    expect(result.stats.overallBioScore).toBeGreaterThan(40)
  })
})
