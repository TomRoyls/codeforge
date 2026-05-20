import { describe, expect, it } from 'vitest'

import {
  analyzeFacets,
  analyzeLattice,
  buildCrystalResult,
  classifyCrystalSystem,
  classifyOverallGrade,
  classifyQuality,
  computeClarity,
  computeCrystalQuality,
  computeMaxNesting,
  computeNameClarity,
  computePurity,
  computeRegularity,
  computeSymmetry,
  detectDefects,
  determineGrowthPattern,
  generateRecommendations,
  groupIntoSystems,
  type CrystalDefect,
  type CrystalLattice,
  type CrystalOptions,
  type CrystalResult,
  type CrystalStats,
} from '../src/commands/crystal-helpers.js'

import {
  formatCrystalJson,
  formatCrystalStats,
  formatCrystalTable,
  formatDefectBadge,
  formatDefectMap,
  formatFacetTable,
  formatGrade,
  formatLatticeTable,
  formatPurityGauge,
  formatQuality,
  formatRecommendations,
  formatSystemName,
  formatSystemOverview,
} from '../src/commands/crystal-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `const x = 1
const y = 2
export function add(a: number, b: number) {
  return a + b
}
`

const CLEAN_CONTENT = `/**
 * Adds two numbers.
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * User representation.
 */
export class User {
  constructor(public name: string) {}
}

/** Config type */
export interface Config {
  debug: boolean
}
`

const MESSY_CONTENT = `var x = 1
// TODO: fix this
// FIXME: broken
function getData() {
          if (x) {
                    if (y) {
                              if (z) {
                                        if (w) {
                                                  if (a) {
                                                            return null
                                        }
                              }
                    }
          }
          }
}
console.log('debug')
`

const IMPORT_EXPORT_CONTENT = `import { process } from './engine'
import { validate } from './utils'
import type { Config } from './config'

export function run(config: Config) {
  return process(config)
}

export class Runner {
  execute() { return true }
}

export interface Result {
  success: boolean
}
`

// ─── computeRegularity ─────────────────────────────────────────────────────────

describe('computeRegularity', () => {
  it('returns 50 for empty content', () => {
    expect(computeRegularity(EMPTY_CONTENT)).toBe(50)
  })

  it('returns score for simple content', () => {
    const score = computeRegularity(SIMPLE_CONTENT)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards naming consistency', () => {
    const consistent = 'function getUser() {}\nfunction setData() {}\nfunction isValid() {}'
    const score = computeRegularity(consistent)
    expect(score).toBeGreaterThan(50)
  })

  it('clamps to 0-100', () => {
    expect(computeRegularity(SIMPLE_CONTENT)).toBeLessThanOrEqual(100)
  })
})

// ─── computeSymmetry ───────────────────────────────────────────────────────────

describe('computeSymmetry', () => {
  it('returns 50 for empty content', () => {
    expect(computeSymmetry(EMPTY_CONTENT)).toBe(50)
  })

  it('rewards import/export balance', () => {
    const score = computeSymmetry(IMPORT_EXPORT_CONTENT)
    expect(score).toBeGreaterThan(55)
  })

  it('returns valid range', () => {
    const score = computeSymmetry(SIMPLE_CONTENT)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards having both functions and classes', () => {
    const code = 'function foo() {}\nclass Bar {}'
    const score = computeSymmetry(code)
    expect(score).toBeGreaterThan(55)
  })
})

// ─── computePurity ─────────────────────────────────────────────────────────────

describe('computePurity', () => {
  it('returns 100 for empty content with no defects', () => {
    expect(computePurity(EMPTY_CONTENT, [])).toBe(100)
  })

  it('deducts for major defects', () => {
    const defects: CrystalDefect[] = [
      { type: 'dislocation', location: 1, severity: 'major', description: 'test', fix: 'fix' },
    ]
    expect(computePurity('const x = 1', defects)).toBe(85)
  })

  it('deducts for moderate defects', () => {
    const defects: CrystalDefect[] = [
      { type: 'vacancy', location: 1, severity: 'moderate', description: 'test', fix: 'fix' },
    ]
    expect(computePurity('const x = 1', defects)).toBe(92)
  })

  it('deducts for minor defects', () => {
    const defects: CrystalDefect[] = [
      { type: 'interstitial', location: 1, severity: 'minor', description: 'test', fix: 'fix' },
    ]
    expect(computePurity('const x = 1', defects)).toBe(97)
  })

  it('deducts for var usage', () => {
    expect(computePurity('var x = 1', [])).toBeLessThan(100)
  })

  it('deducts for eval usage', () => {
    expect(computePurity('eval("x")', [])).toBeLessThan(90)
  })
})

// ─── computeClarity ────────────────────────────────────────────────────────────

describe('computeClarity', () => {
  it('returns 50 for empty content', () => {
    expect(computeClarity(EMPTY_CONTENT)).toBe(50)
  })

  it('rewards good comments', () => {
    const documented = '/** doc */\nfunction foo() {}\n// note\nconst x = 1\n// more\nconst y = 2'
    expect(computeClarity(documented)).toBeGreaterThan(60)
  })

  it('penalizes very long lines', () => {
    const longLine = 'const x = "' + 'a'.repeat(150) + '"'
    expect(computeClarity(longLine)).toBeLessThanOrEqual(80)
  })

  it('rewards low nesting', () => {
    const flat = 'const x = 1\nconst y = 2\nfunction foo() { return 1 }'
    expect(computeClarity(flat)).toBeGreaterThan(60)
  })

  it('penalizes deep nesting', () => {
    const deep = 'if (a) {\nif (b) {\nif (c) {\nif (d) {\nif (e) {\nif (f) {\nreturn 1\n}\n}\n}\n}\n}\n}'
    expect(computeClarity(deep)).toBeLessThanOrEqual(80)
  })
})

// ─── computeMaxNesting ─────────────────────────────────────────────────────────

describe('computeMaxNesting', () => {
  it('returns 0 for flat code', () => {
    expect(computeMaxNesting('const x = 1')).toBe(0)
  })

  it('counts single level nesting', () => {
    expect(computeMaxNesting('if (x) { }')).toBe(1)
  })

  it('counts deep nesting', () => {
    expect(computeMaxNesting('if (a) { if (b) { if (c) { } } }')).toBe(3)
  })

  it('handles mismatched braces', () => {
    expect(computeMaxNesting('{{{{')).toBe(4)
  })
})

// ─── detectDefects ─────────────────────────────────────────────────────────────

describe('detectDefects', () => {
  it('detects TODO as vacancy', () => {
    const defects = detectDefects('function foo() {\n  // TODO: implement\n}', 'file.ts')
    expect(defects.some(d => d.type === 'vacancy')).toBe(true)
  })

  it('detects FIXME as vacancy', () => {
    const defects = detectDefects('// FIXME: broken', 'file.ts')
    expect(defects.some(d => d.type === 'vacancy')).toBe(true)
  })

  it('detects HACK as vacancy', () => {
    const defects = detectDefects('// HACK: workaround', 'file.ts')
    expect(defects.some(d => d.type === 'vacancy')).toBe(true)
  })

  it('detects console.log as interstitial', () => {
    const defects = detectDefects("console.log('debug')", 'file.ts')
    expect(defects.some(d => d.type === 'interstitial' && d.description.includes('console.log'))).toBe(true)
  })

  it('detects deeply nested code as dislocation', () => {
    const deep = '          if (x) {\n                    if (y) {\n                              if (z) {\n' +
      '                                        if (w) {\n                                                  return 1\n' +
      '                                        }\n                              }\n                    }\n          }'
    const defects = detectDefects(deep, 'file.ts')
    expect(defects.some(d => d.type === 'dislocation')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const defects = detectDefects('const x = 1\nconst y = 2', 'clean.ts')
    expect(defects).toHaveLength(0)
  })

  it('detects unused imports as interstitial', () => {
    const code = "import { unused } from './x'\nconst y = 1"
    const defects = detectDefects(code, 'file.ts')
    expect(defects.some(d => d.type === 'interstitial' && d.description.includes('Unused'))).toBe(true)
  })

  it('detects trailing whitespace as stacking-fault', () => {
    const defects = detectDefects('const x = 1   \n', 'file.ts')
    expect(defects.some(d => d.type === 'stacking-fault')).toBe(true)
  })

  it('assigns correct line numbers', () => {
    const code = 'const x = 1\n// TODO: fix\nconst y = 2'
    const defects = detectDefects(code, 'file.ts')
    const todo = defects.find(d => d.type === 'vacancy')
    expect(todo?.location).toBe(2)
  })
})

// ─── analyzeFacets ─────────────────────────────────────────────────────────────

describe('analyzeFacets', () => {
  it('detects exported functions as facets', () => {
    const facets = analyzeFacets('export function add() {}', 'math.ts')
    expect(facets.some(f => f.name === 'add' && f.type === 'export')).toBe(true)
  })

  it('detects exported classes', () => {
    const facets = analyzeFacets('export class User {}', 'user.ts')
    expect(facets.some(f => f.name === 'User' && f.type === 'export')).toBe(true)
  })

  it('detects imported symbols', () => {
    const facets = analyzeFacets("import { x } from './utils'", 'main.ts')
    expect(facets.some(f => f.name === 'x' && f.type === 'import')).toBe(true)
  })

  it('rewards documented exports with reflectivity', () => {
    const facets = analyzeFacets('/** doc */\nexport function foo() {}', 'file.ts')
    const foo = facets.find(f => f.name === 'foo')
    expect(foo?.reflectivity).toBeGreaterThan(50)
  })

  it('penalizes undocumented exports', () => {
    const facets = analyzeFacets('export function foo() {}', 'file.ts')
    const foo = facets.find(f => f.name === 'foo')
    expect(foo?.reflectivity).toBeLessThan(50)
  })

  it('returns empty for no exports or imports', () => {
    expect(analyzeFacets('const x = 1', 'file.ts')).toEqual([])
  })
})

// ─── computeNameClarity ────────────────────────────────────────────────────────

describe('computeNameClarity', () => {
  it('scores descriptive names high', () => {
    expect(computeNameClarity('getUserById')).toBeGreaterThan(70)
  })

  it('penalizes single letter names', () => {
    expect(computeNameClarity('x')).toBeLessThanOrEqual(35)
  })

  it('scores PascalCase well', () => {
    expect(computeNameClarity('UserManager')).toBeGreaterThan(60)
  })

  it('scores very short names poorly', () => {
    expect(computeNameClarity('fn')).toBeLessThanOrEqual(65)
  })
})

// ─── classifyCrystalSystem ─────────────────────────────────────────────────────

describe('classifyCrystalSystem', () => {
  it('returns cubic for high regularity and symmetry', () => {
    expect(classifyCrystalSystem(90, 85)).toBe('cubic')
  })

  it('returns tetragonal for good metrics', () => {
    expect(classifyCrystalSystem(75, 78)).toBe('tetragonal')
  })

  it('returns hexagonal for decent metrics', () => {
    expect(classifyCrystalSystem(68, 65)).toBe('hexagonal')
  })

  it('returns orthorhombic for average metrics', () => {
    expect(classifyCrystalSystem(55, 58)).toBe('orthorhombic')
  })

  it('returns monoclinic for below average', () => {
    expect(classifyCrystalSystem(48, 45)).toBe('monoclinic')
  })

  it('returns triclinic for poor metrics', () => {
    expect(classifyCrystalSystem(35, 30)).toBe('triclinic')
  })

  it('returns amorphous for very low metrics', () => {
    expect(classifyCrystalSystem(15, 20)).toBe('amorphous')
  })
})

// ─── classifyQuality ───────────────────────────────────────────────────────────

describe('classifyQuality', () => {
  it('returns flawless for excellent', () => {
    expect(classifyQuality(90, 85)).toBe('flawless')
  })

  it('returns excellent', () => {
    expect(classifyQuality(78, 76)).toBe('excellent')
  })

  it('returns good', () => {
    expect(classifyQuality(68, 65)).toBe('good')
  })

  it('returns fair', () => {
    expect(classifyQuality(52, 50)).toBe('fair')
  })

  it('returns poor', () => {
    expect(classifyQuality(38, 36)).toBe('poor')
  })

  it('returns fractured for very low', () => {
    expect(classifyQuality(20, 18)).toBe('fractured')
  })
})

// ─── determineGrowthPattern ────────────────────────────────────────────────────

describe('determineGrowthPattern', () => {
  it('returns prismatic for single lattice', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 80, symmetry: 80, purity: 90, clarity: 85, system: 'cubic', defects: [], facets: [] },
    ]
    expect(determineGrowthPattern(lattices)).toBe('prismatic')
  })

  it('returns layered for uniform facet counts', () => {
    const lattices: CrystalLattice[] = Array(3).fill(null).map((_, i) => ({
      file: `a${i}.ts`, regularity: 80, symmetry: 80, purity: 90, clarity: 85,
      system: 'cubic' as const, defects: [], facets: Array(3).fill(null).map(() => ({
        name: 'f', clarity: 80, smoothness: 80, reflectivity: 80, type: 'export' as const,
      })),
    }))
    expect(determineGrowthPattern(lattices)).toBe('layered')
  })
})

// ─── analyzeLattice ────────────────────────────────────────────────────────────

describe('analyzeLattice', () => {
  it('analyzes simple content', () => {
    const lattice = analyzeLattice(SIMPLE_CONTENT, 'simple.ts')
    expect(lattice.file).toBe('simple.ts')
    expect(lattice.regularity).toBeGreaterThanOrEqual(0)
    expect(lattice.symmetry).toBeGreaterThanOrEqual(0)
    expect(lattice.purity).toBeGreaterThanOrEqual(0)
    expect(lattice.clarity).toBeGreaterThanOrEqual(0)
    expect(['cubic', 'tetragonal', 'hexagonal', 'orthorhombic', 'monoclinic', 'triclinic', 'amorphous']).toContain(lattice.system)
  })

  it('classifies clean content as higher system', () => {
    const lattice = analyzeLattice(CLEAN_CONTENT, 'clean.ts')
    expect(['cubic', 'tetragonal', 'hexagonal']).toContain(lattice.system)
  })

  it('finds defects in messy content', () => {
    const lattice = analyzeLattice(MESSY_CONTENT, 'messy.ts')
    expect(lattice.defects.length).toBeGreaterThan(0)
  })

  it('finds facets in import/export content', () => {
    const lattice = analyzeLattice(IMPORT_EXPORT_CONTENT, 'main.ts')
    expect(lattice.facets.length).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const lattice = analyzeLattice(EMPTY_CONTENT, 'empty.ts')
    expect(lattice.purity).toBe(100)
  })
})

// ─── groupIntoSystems ──────────────────────────────────────────────────────────

describe('groupIntoSystems', () => {
  it('groups lattices by system', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 90, symmetry: 88, purity: 95, clarity: 90, system: 'cubic', defects: [], facets: [] },
      { file: 'b.ts', regularity: 50, symmetry: 45, purity: 60, clarity: 55, system: 'monoclinic', defects: [], facets: [] },
    ]
    const systems = groupIntoSystems(lattices)
    expect(systems).toHaveLength(2)
    expect(systems.some(s => s.name === 'cubic')).toBe(true)
    expect(systems.some(s => s.name === 'monoclinic')).toBe(true)
  })

  it('computes avg regularity for group', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 80, symmetry: 80, purity: 90, clarity: 85, system: 'cubic', defects: [], facets: [] },
      { file: 'b.ts', regularity: 90, symmetry: 90, purity: 90, clarity: 85, system: 'cubic', defects: [], facets: [] },
    ]
    const systems = groupIntoSystems(lattices)
    const cubic = systems.find(s => s.name === 'cubic')
    expect(cubic?.avgRegularity).toBe(85)
  })

  it('returns empty for no lattices', () => {
    expect(groupIntoSystems([])).toEqual([])
  })
})

// ─── computeCrystalQuality ─────────────────────────────────────────────────────

describe('computeCrystalQuality', () => {
  it('computes average of four metrics', () => {
    expect(computeCrystalQuality(80, 80, 80, 80)).toBe(80)
  })

  it('handles mixed values', () => {
    const quality = computeCrystalQuality(100, 0, 50, 50)
    expect(quality).toBe(50)
  })
})

// ─── classifyOverallGrade ──────────────────────────────────────────────────────

describe('classifyOverallGrade', () => {
  it('returns diamond for exceptional', () => {
    expect(classifyOverallGrade(95, 90, 90)).toBe('diamond')
  })

  it('returns sapphire for great', () => {
    expect(classifyOverallGrade(85, 80, 78)).toBe('sapphire')
  })

  it('returns ruby for good', () => {
    expect(classifyOverallGrade(75, 70, 68)).toBe('ruby')
  })

  it('returns emerald for decent', () => {
    expect(classifyOverallGrade(65, 60, 58)).toBe('emerald')
  })

  it('returns quartz for average', () => {
    expect(classifyOverallGrade(50, 45, 42)).toBe('quartz')
  })

  it('returns glass for poor', () => {
    expect(classifyOverallGrade(35, 30, 28)).toBe('glass')
  })

  it('returns gravel for terrible', () => {
    expect(classifyOverallGrade(15, 10, 10)).toBe('gravel')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: CrystalStats = {
    totalLattices: 2,
    avgRegularity: 50,
    avgSymmetry: 50,
    avgPurity: 60,
    avgClarity: 50,
    totalDefects: 0,
    minorDefects: 0,
    majorDefects: 0,
    totalFacets: 0,
    avgFacetClarity: 0,
    dominantSystem: 'cubic',
    flawlessFiles: 2,
    fracturedFiles: 0,
    crystalQuality: 50,
    overallGrade: 'quartz',
  }

  it('recommends fixing amorphous files', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 10, symmetry: 10, purity: 20, clarity: 15, system: 'amorphous', defects: [], facets: [] },
    ]
    const recs = generateRecommendations(lattices, [], baseStats)
    expect(recs.some(r => r.includes('amorphous'))).toBe(true)
  })

  it('recommends fixing major defects', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 80, symmetry: 80, purity: 50, clarity: 80, system: 'cubic',
        defects: [{ type: 'dislocation', location: 1, severity: 'major', description: 'deep nesting', fix: 'refactor' }],
        facets: [] },
    ]
    const recs = generateRecommendations(lattices, [], baseStats)
    expect(recs.some(r => r.includes('major'))).toBe(true)
  })

  it('recommends documenting low reflectivity facets', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 80, symmetry: 80, purity: 90, clarity: 80, system: 'cubic', defects: [],
        facets: [{ name: 'foo', clarity: 80, smoothness: 80, reflectivity: 20, type: 'export' }] },
    ]
    const recs = generateRecommendations(lattices, [], baseStats)
    expect(recs.some(r => r.includes('undocumented'))).toBe(true)
  })

  it('recommends completing vacancies', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 80, symmetry: 80, purity: 80, clarity: 80, system: 'cubic',
        defects: [{ type: 'vacancy', location: 1, severity: 'moderate', description: 'TODO', fix: 'implement' }],
        facets: [] },
    ]
    const recs = generateRecommendations(lattices, [], baseStats)
    expect(recs.some(r => r.includes('unfinished'))).toBe(true)
  })

  it('recommends restructuring fractured files', () => {
    const stats = { ...baseStats, fracturedFiles: 3 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('fractured'))).toBe(true)
  })

  it('returns empty for perfect code', () => {
    const lattices: CrystalLattice[] = [
      { file: 'a.ts', regularity: 90, symmetry: 90, purity: 95, clarity: 90, system: 'cubic',
        defects: [], facets: [{ name: 'foo', clarity: 90, smoothness: 90, reflectivity: 90, type: 'export' }] },
    ]
    const recs = generateRecommendations(lattices, [], baseStats)
    expect(recs).toHaveLength(0)
  })
})

// ─── buildCrystalResult ────────────────────────────────────────────────────────

describe('buildCrystalResult', () => {
  it('builds result from empty input', () => {
    const result = buildCrystalResult([], [], {})
    expect(result.lattices).toEqual([])
    expect(result.stats.totalLattices).toBe(0)
  })

  it('builds result from simple content', () => {
    const result = buildCrystalResult(['a.ts'], [SIMPLE_CONTENT], {})
    expect(result.lattices).toHaveLength(1)
    expect(result.stats.totalLattices).toBe(1)
  })

  it('builds result from clean content with high grade', () => {
    const result = buildCrystalResult(['clean.ts'], [CLEAN_CONTENT], {})
    expect(result.lattices[0].purity).toBe(100)
  })

  it('builds result from messy content with defects', () => {
    const result = buildCrystalResult(['messy.ts'], [MESSY_CONTENT], {})
    expect(result.stats.totalDefects).toBeGreaterThan(0)
  })

  it('computes correct overall grade', () => {
    const result = buildCrystalResult(['clean.ts'], [CLEAN_CONTENT], {})
    expect(['diamond', 'sapphire', 'ruby', 'emerald', 'quartz', 'glass', 'gravel']).toContain(result.stats.overallGrade)
  })

  it('groups files into systems', () => {
    const result = buildCrystalResult(
      ['clean.ts', 'messy.ts'],
      [CLEAN_CONTENT, MESSY_CONTENT],
      {},
    )
    expect(result.systems.length).toBeGreaterThan(0)
  })

  it('respects verbose option', () => {
    const result = buildCrystalResult(['a.ts'], [SIMPLE_CONTENT], { verbose: true })
    expect(result).toBeDefined()
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatGrade', () => {
  it('formats diamond', () => {
    expect(formatGrade('diamond')).toContain('diamond')
  })
  it('formats gravel', () => {
    expect(formatGrade('gravel')).toContain('gravel')
  })
})

describe('formatQuality', () => {
  it('formats flawless', () => {
    expect(formatQuality('flawless')).toContain('flawless')
  })
})

describe('formatSystemName', () => {
  it('formats cubic', () => {
    expect(formatSystemName('cubic')).toContain('cubic')
  })
  it('formats amorphous', () => {
    expect(formatSystemName('amorphous')).toContain('amorphous')
  })
})

describe('formatPurityGauge', () => {
  it('formats 100%', () => {
    const result = formatPurityGauge(100, 10)
    expect(result).toContain('100%')
  })

  it('formats 0%', () => {
    const result = formatPurityGauge(0, 10)
    expect(result).toContain('0%')
  })

  it('formats 50%', () => {
    expect(formatPurityGauge(50, 10)).toContain('50%')
  })
})

describe('formatDefectBadge', () => {
  it('formats vacancy badge', () => {
    expect(formatDefectBadge('vacancy')).toContain('vacancy')
  })

  it('formats unknown type', () => {
    expect(formatDefectBadge('unknown')).toContain('unknown')
  })
})

describe('formatLatticeTable', () => {
  it('formats empty lattices', () => {
    expect(formatLatticeTable([])).toContain('No lattices')
  })

  it('formats lattices with data', () => {
    const lattice: CrystalLattice = {
      file: 'test.ts', regularity: 80, symmetry: 75, purity: 90, clarity: 85,
      system: 'cubic', defects: [], facets: [],
    }
    const result = formatLatticeTable([lattice])
    expect(result).toContain('test.ts')
    expect(result).toContain('cubic')
  })
})

describe('formatDefectMap', () => {
  it('formats no defects', () => {
    expect(formatDefectMap([])).toContain('Pure crystal')
  })

  it('formats defects', () => {
    const defect: CrystalDefect = {
      type: 'vacancy', location: 5, severity: 'moderate', description: 'TODO', fix: 'implement',
    }
    const result = formatDefectMap([defect])
    expect(result).toContain('vacancy')
    expect(result).toContain('TODO')
  })
})

describe('formatFacetTable', () => {
  it('formats empty facets', () => {
    expect(formatFacetTable([])).toContain('No facets')
  })

  it('formats facets', () => {
    const lattice: CrystalLattice = {
      file: 'a.ts', regularity: 80, symmetry: 80, purity: 90, clarity: 85,
      system: 'cubic', defects: [],
      facets: [{ name: 'getData', clarity: 90, smoothness: 85, reflectivity: 80, type: 'export' }],
    }
    const result = formatFacetTable([lattice])
    expect(result).toContain('getData')
  })
})

describe('formatSystemOverview', () => {
  it('formats no systems', () => {
    expect(formatSystemOverview([])).toContain('No systems')
  })

  it('formats systems', () => {
    const result = formatSystemOverview([{
      name: 'cubic', description: 'Highly regular',
      files: ['a.ts', 'b.ts'], avgRegularity: 85, avgSymmetry: 80,
      quality: 'flawless', growthPattern: 'layered',
    }])
    expect(result).toContain('cubic')
    expect(result).toContain('Highly regular')
  })
})

describe('formatCrystalStats', () => {
  it('formats stats', () => {
    const stats: CrystalStats = {
      totalLattices: 5, avgRegularity: 75, avgSymmetry: 70, avgPurity: 80,
      avgClarity: 72, totalDefects: 3, minorDefects: 2, majorDefects: 1,
      totalFacets: 10, avgFacetClarity: 78, dominantSystem: 'cubic',
      flawlessFiles: 3, fracturedFiles: 1, crystalQuality: 74, overallGrade: 'ruby',
    }
    const result = formatCrystalStats(stats)
    expect(result).toContain('Lattices:')
    expect(result).toContain('ruby')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('Crystal clear')
  })

  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Document Y'])).toContain('1. Fix X')
  })
})

describe('formatCrystalTable', () => {
  it('formats full table', () => {
    const result = buildCrystalResult(['a.ts'], [SIMPLE_CONTENT], {})
    const table = formatCrystalTable(result)
    expect(table).toContain('Crystal Analysis')
    expect(table).toContain('Recommendations')
  })
})

describe('formatCrystalJson', () => {
  it('formats valid JSON', () => {
    const result = buildCrystalResult(['a.ts'], [SIMPLE_CONTENT], {})
    const json = formatCrystalJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats).toBeDefined()
    expect(parsed.lattices).toBeDefined()
  })
})
