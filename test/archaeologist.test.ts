import { describe, expect, it } from 'vitest'

import {
  buildArchaeologistResult,
  classifyStratumType,
  computeArtifactDensity,
  computeAverageThickness,
  computeComplexity,
  computeSeismicActivity,
  countEffectiveLines,
  countExports,
  countImports,
  countTodoMarkers,
  detectFaultLines,
  discoverArtifacts,
  findDeadExports,
  generateArchaeologistRecommendations,
  generateEraName,
  hasCommentedOutCode,
  hasTestPatterns,
  identifyEras,
  type ArchaeologistStats,
  type Artifact,
  type Era,
  type FaultLine,
  type Stratum,
} from '../src/commands/archaeologist-helpers.js'

import {
  formatArchaeologistJSON,
  formatArchaeologistStats,
  formatArchaeologistTable,
  formatArtifactCatalog,
  formatEraTimeline,
  formatFaultLineMap,
  formatRecommendations,
  formatStratigraphicColumn,
} from '../src/commands/archaeologist-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CLEAN_CODE = `/**
 * A well-documented utility.
 */
export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}
`

const DEAD_CODE = `export function unused(): void {}
export function alsoDead(): void {}
export function orphan(): void {}
const internal = true
`

const MESSY_CODE = `// TODO: fix this later
// FIXME: broken
// HACK: workaround
// TODO: another one
// const x = oldCode()
// const y = moreOld()
// const z = evenMoreOld()
export function messy() { if (true) { for (let i = 0; i < 100; i++) { while (false) {} } } }
`

const COMPLEX_CODE = `import { a } from 'x'
import { b } from 'y'
import { c } from 'z'

function deep() {
  if (x) {
    if (y) {
      if (z) {
        for (let i = 0; i < 10; i++) {
          while (w) {}
        }
      }
    }
  }
}
`

const SIMPLE_CODE = 'const x = 1\n'

// ─── classifyStratumType ──────────────────────────────────────────────────────

describe('classifyStratumType', () => {
  it('classifies feat as settlement', () => {
    expect(classifyStratumType('feat: add new command', 10, 2)).toBe('settlement')
  })

  it('classifies add as settlement', () => {
    expect(classifyStratumType('add user model', 5, 1)).toBe('settlement')
  })

  it('classifies improve as expansion', () => {
    expect(classifyStratumType('improve error handling', 5, 3)).toBe('expansion')
  })

  it('classifies refactor as renovation', () => {
    expect(classifyStratumType('refactor: extract helpers', 3, 3)).toBe('renovation')
  })

  it('classifies remove as destruction', () => {
    expect(classifyStratumType('remove deprecated API', 2, 10)).toBe('destruction')
  })

  it('classifies migrate as migration', () => {
    expect(classifyStratumType('migrate to new config', 5, 5)).toBe('migration')
  })

  it('classifies by insertions when ambiguous', () => {
    expect(classifyStratumType('update something', 20, 5)).toBe('expansion')
  })

  it('classifies by deletions when ambiguous', () => {
    expect(classifyStratumType('change something', 2, 20)).toBe('destruction')
  })
})

// ─── countEffectiveLines ──────────────────────────────────────────────────────

describe('countEffectiveLines', () => {
  it('counts code lines', () => {
    expect(countEffectiveLines('const x = 1\nconst y = 2')).toBe(2)
  })

  it('skips comments and blanks', () => {
    expect(countEffectiveLines('const x = 1\n// comment\n\nconst y = 2')).toBe(2)
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

  it('counts branches', () => {
    expect(computeComplexity('if (a) { for (let i = 0; i < 10; i++) {} }')).toBe(3)
  })
})

// ─── countExports ─────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts exports', () => {
    expect(countExports('export function foo() {}\nexport const bar = 1')).toBe(2)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── countImports ─────────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts imports', () => {
    expect(countImports("import { a } from 'x'\nimport { b } from 'y'")).toBe(2)
  })

  it('returns 0 for no imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

// ─── hasTestPatterns ──────────────────────────────────────────────────────────

describe('hasTestPatterns', () => {
  it('detects it()', () => {
    expect(hasTestPatterns("it('works', () => {})")).toBe(true)
  })

  it('detects test()', () => {
    expect(hasTestPatterns("test('works', () => {})")).toBe(true)
  })

  it('returns false for no tests', () => {
    expect(hasTestPatterns('const x = 1')).toBe(false)
  })
})

// ─── countTodoMarkers ─────────────────────────────────────────────────────────

describe('countTodoMarkers', () => {
  it('counts TODOs', () => {
    expect(countTodoMarkers('// TODO: fix\n// FIXME: broken')).toBe(2)
  })

  it('returns 0 for clean code', () => {
    expect(countTodoMarkers('const x = 1')).toBe(0)
  })
})

// ─── hasCommentedOutCode ──────────────────────────────────────────────────────

describe('hasCommentedOutCode', () => {
  it('detects 3+ consecutive commented-out code lines', () => {
    const code = '// const x = foo()\n// const y = bar()\n// const z = baz()'
    expect(hasCommentedOutCode(code)).toBe(true)
  })

  it('ignores isolated comments', () => {
    expect(hasCommentedOutCode('// a single comment')).toBe(false)
  })

  it('returns false for clean code', () => {
    expect(hasCommentedOutCode('const x = 1')).toBe(false)
  })
})

// ─── findDeadExports ─────────────────────────────────────────────────────────

describe('findDeadExports', () => {
  it('finds exports not used elsewhere', () => {
    const dead = findDeadExports('export function unused() {}\nexport function used() {}', ['used()'])
    expect(dead).toContain('unused')
  })

  it('returns empty when all used', () => {
    const dead = findDeadExports('export function foo() {}', ['foo()'])
    expect(dead).toEqual([])
  })

  it('returns empty for no exports', () => {
    expect(findDeadExports('const x = 1', [])).toEqual([])
  })
})

// ─── discoverArtifacts ────────────────────────────────────────────────────────

describe('discoverArtifacts', () => {
  it('discovers fossils (dead exports)', () => {
    const artifacts = discoverArtifacts('dead.ts', DEAD_CODE, [], 30)
    expect(artifacts.some((a) => a.type === 'fossil')).toBe(true)
  })

  it('discovers potsherds (commented-out code)', () => {
    const artifacts = discoverArtifacts('messy.ts', MESSY_CODE, [], 30)
    expect(artifacts.some((a) => a.type === 'potsherd')).toBe(true)
  })

  it('discovers potsherds (excessive TODOs)', () => {
    const artifacts = discoverArtifacts('messy.ts', MESSY_CODE, [], 30)
    expect(artifacts.some((a) => a.type === 'potsherd' && a.description.includes('TODO'))).toBe(true)
  })

  it('discovers treasures (well-crafted code)', () => {
    const longClean = (CLEAN_CODE + '\n').repeat(4)
    const artifacts = discoverArtifacts('clean.ts', longClean, [], 10)
    expect(artifacts.some((a) => a.type === 'treasure')).toBe(true)
  })

  it('discovers relics (old stable code)', () => {
    const longClean = (CLEAN_CODE + '\n').repeat(4)
    const artifacts = discoverArtifacts('old.ts', longClean, [], 400)
    expect(artifacts.some((a) => a.type === 'relic')).toBe(true)
  })

  it('creates potsherd for complex large code', () => {
    const bigComplex = (COMPLEX_CODE + '\n').repeat(10)
    const artifacts = discoverArtifacts('complex.ts', bigComplex, [], 10)
    expect(artifacts.length).toBeGreaterThan(0)
  })

  it('returns empty for simple small code', () => {
    const artifacts = discoverArtifacts('simple.ts', SIMPLE_CODE, [], 0)
    expect(artifacts).toEqual([])
  })
})

// ─── detectFaultLines ─────────────────────────────────────────────────────────

describe('detectFaultLines', () => {
  it('detects destruction fault lines', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'abc1234', date: '2024-01-01', message: 'remove old system', filesChanged: 10, insertions: 5, deletions: 200, era: '', type: 'destruction' },
    ]
    const faults = detectFaultLines(strata)
    expect(faults.length).toBeGreaterThan(0)
    expect(faults[0]!.severity).toBe('catastrophic')
  })

  it('detects rewrite fault lines', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'def5678', date: '2024-02-01', message: 'rewrite entire module', filesChanged: 5, insertions: 300, deletions: 250, era: '', type: 'renovation' },
    ]
    const faults = detectFaultLines(strata)
    expect(faults.some((f) => f.type === 'rewrite')).toBe(true)
  })

  it('detects refactor fault lines', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'ghi9012', date: '2024-03-01', message: 'refactor core engine', filesChanged: 8, insertions: 150, deletions: 100, era: '', type: 'renovation' },
    ]
    const faults = detectFaultLines(strata)
    expect(faults.some((f) => f.type === 'refactor')).toBe(true)
  })

  it('detects migration fault lines', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'jkl3456', date: '2024-04-01', message: 'migrate to new framework', filesChanged: 15, insertions: 200, deletions: 180, era: '', type: 'migration' },
    ]
    const faults = detectFaultLines(strata)
    expect(faults.some((f) => f.type === 'migration')).toBe(true)
  })

  it('detects large diffs', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'mno7890', date: '2024-05-01', message: 'update everything', filesChanged: 20, insertions: 200, deletions: 200, era: '', type: 'expansion' },
    ]
    const faults = detectFaultLines(strata)
    expect(faults.length).toBeGreaterThan(0)
  })

  it('returns empty for small strata', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'pqr1234', date: '2024-06-01', message: 'fix typo', filesChanged: 1, insertions: 1, deletions: 1, era: '', type: 'expansion' },
    ]
    expect(detectFaultLines(strata)).toEqual([])
  })
})

// ─── generateEraName ─────────────────────────────────────────────────────────

describe('generateEraName', () => {
  it('generates settlement names', () => {
    const name = generateEraName('settlement', 0, 5)
    expect(name).toBeTruthy()
  })

  it('generates expansion names', () => {
    const name = generateEraName('expansion', 0, 5)
    expect(name).toBeTruthy()
  })

  it('generates renovation names', () => {
    const name = generateEraName('renovation', 0, 5)
    expect(name).toBeTruthy()
  })

  it('generates destruction names', () => {
    const name = generateEraName('destruction', 0, 5)
    expect(name).toBeTruthy()
  })

  it('generates migration names', () => {
    const name = generateEraName('migration', 0, 5)
    expect(name).toBeTruthy()
  })
})

// ─── identifyEras ────────────────────────────────────────────────────────────

describe('identifyEras', () => {
  it('groups consecutive same-type strata', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'a1', date: '2024-01', message: 'feat: first', filesChanged: 3, insertions: 50, deletions: 0, era: '', type: 'settlement' },
      { layer: 1, hash: 'a2', date: '2024-01', message: 'feat: second', filesChanged: 2, insertions: 30, deletions: 0, era: '', type: 'settlement' },
      { layer: 2, hash: 'a3', date: '2024-02', message: 'refactor: clean', filesChanged: 5, insertions: 20, deletions: 20, era: '', type: 'renovation' },
      { layer: 3, hash: 'a4', date: '2024-02', message: 'refactor: more', filesChanged: 3, insertions: 10, deletions: 10, era: '', type: 'renovation' },
    ]
    const eras = identifyEras(strata)
    expect(eras.length).toBe(2)
    expect(eras[0]!.commits).toBe(2)
    expect(eras[1]!.commits).toBe(2)
  })

  it('returns empty for no strata', () => {
    expect(identifyEras([])).toEqual([])
  })

  it('handles single stratum', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'a1', date: '2024-01', message: 'init', filesChanged: 1, insertions: 10, deletions: 0, era: '', type: 'settlement' },
    ]
    const eras = identifyEras(strata)
    expect(eras.length).toBe(1)
    expect(eras[0]!.dominantType).toBe('settlement')
  })

  it('tracks characteristics', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'a1', date: '2024-01', message: 'feat: add feature', filesChanged: 3, insertions: 50, deletions: 0, era: '', type: 'settlement' },
      { layer: 1, hash: 'a2', date: '2024-01', message: 'fix: bug fix', filesChanged: 1, insertions: 5, deletions: 2, era: '', type: 'settlement' },
    ]
    const eras = identifyEras(strata)
    expect(eras[0]!.characteristics).toContain('new features')
    expect(eras[0]!.characteristics).toContain('bug fixes')
  })
})

// ─── Statistics ───────────────────────────────────────────────────────────────

describe('computeArtifactDensity', () => {
  it('computes density', () => {
    expect(computeArtifactDensity(10, 5)).toBe(2)
  })

  it('returns 0 for no layers', () => {
    expect(computeArtifactDensity(10, 0)).toBe(0)
  })
})

describe('computeSeismicActivity', () => {
  it('computes per 100 commits', () => {
    expect(computeSeismicActivity(5, 200)).toBe(2.5)
  })

  it('returns 0 for no commits', () => {
    expect(computeSeismicActivity(5, 0)).toBe(0)
  })
})

describe('computeAverageThickness', () => {
  it('computes average', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'a', date: '', message: '', filesChanged: 1, insertions: 10, deletions: 5, era: '', type: 'settlement' },
      { layer: 1, hash: 'b', date: '', message: '', filesChanged: 1, insertions: 20, deletions: 5, era: '', type: 'expansion' },
    ]
    expect(computeAverageThickness(strata)).toBe(20)
  })

  it('returns 0 for empty', () => {
    expect(computeAverageThickness([])).toBe(0)
  })
})

// ─── generateArchaeologistRecommendations ─────────────────────────────────────

describe('generateArchaeologistRecommendations', () => {
  it('recommends documenting relics', () => {
    const artifacts: Artifact[] = [{ file: 'old.ts', type: 'relic', age: 400, description: 'old', significance: 'high', era: '' }]
    const stats: ArchaeologistStats = { totalLayers: 10, totalArtifacts: 1, faultLineCount: 0, eraCount: 1, oldestLayer: '', deepestDig: 10, artifactDensity: 0.1, averageLayerThickness: 20, seismicActivity: 0 }
    const recs = generateArchaeologistRecommendations(artifacts, [], [], stats)
    expect(recs.some((r) => r.includes('relic'))).toBe(true)
  })

  it('recommends cleaning fossils', () => {
    const artifacts: Artifact[] = [{ file: 'dead.ts', type: 'fossil', age: 10, description: 'dead', significance: 'medium', era: '' }]
    const stats: ArchaeologistStats = { totalLayers: 10, totalArtifacts: 1, faultLineCount: 0, eraCount: 1, oldestLayer: '', deepestDig: 10, artifactDensity: 0.1, averageLayerThickness: 20, seismicActivity: 0 }
    const recs = generateArchaeologistRecommendations(artifacts, [], [], stats)
    expect(recs.some((r) => r.includes('fossil'))).toBe(true)
  })

  it('recommends studying treasures', () => {
    const artifacts: Artifact[] = [{ file: 'gold.ts', type: 'treasure', age: 5, description: 'gold', significance: 'high', era: '' }]
    const stats: ArchaeologistStats = { totalLayers: 10, totalArtifacts: 1, faultLineCount: 0, eraCount: 1, oldestLayer: '', deepestDig: 10, artifactDensity: 0.1, averageLayerThickness: 20, seismicActivity: 0 }
    const recs = generateArchaeologistRecommendations(artifacts, [], [], stats)
    expect(recs.some((r) => r.includes('treasure'))).toBe(true)
  })

  it('praises stable codebase', () => {
    const stats: ArchaeologistStats = { totalLayers: 10, totalArtifacts: 0, faultLineCount: 0, eraCount: 1, oldestLayer: '', deepestDig: 10, artifactDensity: 0, averageLayerThickness: 5, seismicActivity: 0 }
    const recs = generateArchaeologistRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('stable') || r.includes('stable'))).toBe(true)
  })
})

// ─── buildArchaeologistResult ─────────────────────────────────────────────────

describe('buildArchaeologistResult', () => {
  it('builds complete result', () => {
    const result = buildArchaeologistResult(
      ['clean.ts', 'dead.ts', 'messy.ts'],
      [CLEAN_CODE, DEAD_CODE, MESSY_CODE],
      { maxDepth: 50 },
    )
    expect(result.artifacts.length).toBeGreaterThan(0)
    expect(result.stats.totalArtifacts).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildArchaeologistResult([], [], { maxDepth: 50 })
    expect(result.artifacts).toEqual([])
    expect(result.stats.totalArtifacts).toBe(0)
  })

  it('generates recommendations', () => {
    const result = buildArchaeologistResult(
      ['dead.ts', 'messy.ts'],
      [DEAD_CODE, MESSY_CODE],
      { maxDepth: 50 },
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatStratigraphicColumn', () => {
  it('formats column', () => {
    const strata: Stratum[] = [
      { layer: 0, hash: 'abc1234567', date: '2024-01-01', message: 'feat: add feature', filesChanged: 3, insertions: 50, deletions: 5, era: '', type: 'settlement' },
    ]
    expect(formatStratigraphicColumn(strata)).toContain('Stratigraphic Column')
  })

  it('handles empty', () => {
    expect(formatStratigraphicColumn([])).toContain('No strata')
  })
})

describe('formatArtifactCatalog', () => {
  it('formats catalog', () => {
    const artifacts: Artifact[] = [{ file: 'a.ts', type: 'relic', age: 100, description: 'old code', significance: 'high', era: '' }]
    expect(formatArtifactCatalog(artifacts)).toContain('Artifact Catalog')
  })

  it('handles empty', () => {
    expect(formatArtifactCatalog([])).toContain('No artifacts')
  })
})

describe('formatFaultLineMap', () => {
  it('formats faults', () => {
    const faults: FaultLine[] = [{ commitHash: 'abc1234', date: '2024-01-01', description: 'rewrite', severity: 'major', filesAffected: 10, linesChanged: 500, type: 'rewrite' }]
    expect(formatFaultLineMap(faults)).toContain('Fault Line Map')
  })

  it('handles empty', () => {
    expect(formatFaultLineMap([])).toContain('No fault lines')
  })
})

describe('formatEraTimeline', () => {
  it('formats timeline', () => {
    const eras: Era[] = [{ name: 'Initial Settlement', startHash: 'a', endHash: 'b', startDate: '2024-01', endDate: '2024-02', commits: 5, characteristics: ['new features'], dominantType: 'settlement' }]
    expect(formatEraTimeline(eras)).toContain('Era Timeline')
  })

  it('handles empty', () => {
    expect(formatEraTimeline([])).toContain('No eras')
  })
})

describe('formatArchaeologistStats', () => {
  it('formats stats', () => {
    const stats: ArchaeologistStats = { totalLayers: 50, totalArtifacts: 12, faultLineCount: 3, eraCount: 5, oldestLayer: '2023-01', deepestDig: 50, artifactDensity: 0.24, averageLayerThickness: 35.5, seismicActivity: 6.0 }
    const output = formatArchaeologistStats(stats)
    expect(output).toContain('50')
    expect(output).toContain('12')
    expect(output).toContain('6')
  })
})

describe('formatRecommendations', () => {
  it('formats recs', () => {
    expect(formatRecommendations(['Clean up X'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatArchaeologistTable', () => {
  it('formats full table', () => {
    const result = buildArchaeologistResult(['a.ts'], [CLEAN_CODE], { maxDepth: 50 })
    const output = formatArchaeologistTable(result)
    expect(output).toContain('Artifact Catalog')
    expect(output).toContain('Archaeological Stats')
  })
})

describe('formatArchaeologistJSON', () => {
  it('formats valid JSON', () => {
    const result = buildArchaeologistResult(['a.ts'], [CLEAN_CODE], { maxDepth: 50 })
    const json = formatArchaeologistJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.artifacts).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes realistic codebase', () => {
    const result = buildArchaeologistResult(
      ['clean.ts', 'dead.ts', 'messy.ts', 'complex.ts'],
      [CLEAN_CODE, DEAD_CODE, MESSY_CODE, COMPLEX_CODE],
      { maxDepth: 100 },
    )
    expect(result.artifacts.length).toBeGreaterThanOrEqual(3)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('round-trips through JSON', () => {
    const result = buildArchaeologistResult(['a.ts'], [CLEAN_CODE], { maxDepth: 50 })
    const json = formatArchaeologistJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalArtifacts).toBe(result.stats.totalArtifacts)
  })
})
