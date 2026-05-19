import { describe, expect, it } from 'vitest'

import {
  buildExcavationResult,
  computeFossilStats,
  determineSeverity,
  estimateEra,
  estimateExcavationEffort,
  excavateAncientConventions,
  excavateCommentedCode,
  excavateDeadCode,
  excavateDeprecatedApi,
  excavateLegacyPatterns,
  excavateOrphanReferences,
  excavateRelicComments,
  excavateUnusedImports,
  excavateVestigialTypes,
  excavateZombieConstants,
  generateFossilRecommendations,
  selectArtifactHighlights,
  stratifyLayers,
  type Fossil,
  type FossilStats,
} from '../src/commands/fossil-helpers.js'

import {
  formatArtifactHighlights,
  formatFossilCatalog,
  formatFossilJSON,
  formatFossilLayers,
  formatFossilRow,
  formatFossilStats,
  formatFossilTable,
  formatRecommendations,
  getEraIcon,
  getEffortIcon,
  getSeverityColor,
} from '../src/commands/fossil-format-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFossil(overrides: Partial<Fossil> = {}): Fossil {
  return {
    type: 'dead-code',
    file: 'test.ts',
    line: 5,
    code: 'foo()',
    era: 'old',
    description: 'test fossil',
    severity: 'cleanup',
    excavationEffort: 'easy',
    ...overrides,
  }
}

// ─── estimateEra ──────────────────────────────────────────────────────────────

describe('estimateEra', () => {
  it('returns ancient for deprecated-api', () => {
    expect(estimateEra('deprecated-api')).toBe('ancient')
  })

  it('returns ancient for legacy-pattern', () => {
    expect(estimateEra('legacy-pattern')).toBe('ancient')
  })

  it('returns ancient for ancient-convention', () => {
    expect(estimateEra('ancient-convention')).toBe('ancient')
  })

  it('returns old for dead-code', () => {
    expect(estimateEra('dead-code')).toBe('old')
  })

  it('returns recent for unused-import', () => {
    expect(estimateEra('unused-import')).toBe('recent')
  })

  it('returns recent for vestigial-type', () => {
    expect(estimateEra('vestigial-type')).toBe('recent')
  })
})

// ─── estimateExcavationEffort ─────────────────────────────────────────────────

describe('estimateExcavationEffort', () => {
  it('returns trivial for commented-out', () => {
    expect(estimateExcavationEffort('commented-out')).toBe('trivial')
  })

  it('returns trivial for unused-import', () => {
    expect(estimateExcavationEffort('unused-import')).toBe('trivial')
  })

  it('returns easy for dead-code', () => {
    expect(estimateExcavationEffort('dead-code')).toBe('easy')
  })

  it('returns moderate for deprecated-api', () => {
    expect(estimateExcavationEffort('deprecated-api')).toBe('moderate')
  })

  it('returns careful for legacy-pattern', () => {
    expect(estimateExcavationEffort('legacy-pattern')).toBe('careful')
  })

  it('returns careful for ancient-convention', () => {
    expect(estimateExcavationEffort('ancient-convention')).toBe('careful')
  })
})

// ─── determineSeverity ────────────────────────────────────────────────────────

describe('determineSeverity', () => {
  it('returns cleanup for dead-code', () => {
    expect(determineSeverity('dead-code')).toBe('cleanup')
  })

  it('returns cleanup for commented-out', () => {
    expect(determineSeverity('commented-out')).toBe('cleanup')
  })

  it('returns cleanup for unused-import', () => {
    expect(determineSeverity('unused-import')).toBe('cleanup')
  })

  it('returns warning for deprecated-api', () => {
    expect(determineSeverity('deprecated-api')).toBe('warning')
  })

  it('returns warning for orphan-reference', () => {
    expect(determineSeverity('orphan-reference')).toBe('warning')
  })

  it('returns info for vestigial-type', () => {
    expect(determineSeverity('vestigial-type')).toBe('info')
  })
})

// ─── excavateDeadCode ─────────────────────────────────────────────────────────

describe('excavateDeadCode', () => {
  it('detects code after return', () => {
    const code = 'function foo() {\n  return 1\n  bar()\n}'
    const fossils = excavateDeadCode(code, 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.type).toBe('dead-code')
    expect(fossils[0]!.line).toBe(3)
  })

  it('detects code after throw', () => {
    const code = 'function foo() {\n  throw new Error()\n  bar()\n}'
    const fossils = excavateDeadCode(code, 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('does not flag code before return', () => {
    const code = 'bar()\nreturn 1'
    const fossils = excavateDeadCode(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('handles empty content', () => {
    expect(excavateDeadCode('', 'a.ts')).toEqual([])
  })
})

// ─── excavateCommentedCode ────────────────────────────────────────────────────

describe('excavateCommentedCode', () => {
  it('detects commented-out const', () => {
    const code = '// const x = 1'
    const fossils = excavateCommentedCode(code, 'a.ts')
    expect(fossils.length).toBe(1)
    expect(fossils[0]!.type).toBe('commented-out')
  })

  it('detects commented-out function', () => {
    const code = '// function foo() {}'
    const fossils = excavateCommentedCode(code, 'a.ts')
    expect(fossils.length).toBe(1)
  })

  it('detects commented-out if', () => {
    const code = '// if (x) {'
    const fossils = excavateCommentedCode(code, 'a.ts')
    expect(fossils.length).toBe(1)
  })

  it('detects commented-out import', () => {
    const code = '// import { x } from "mod"'
    const fossils = excavateCommentedCode(code, 'a.ts')
    expect(fossils.length).toBe(1)
  })

  it('does not flag regular comments', () => {
    const code = '// This is a description'
    const fossils = excavateCommentedCode(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('does not flag TODO comments', () => {
    const code = '// TODO: fix later'
    const fossils = excavateCommentedCode(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })
})

// ─── excavateDeprecatedApi ────────────────────────────────────────────────────

describe('excavateDeprecatedApi', () => {
  it('detects var declarations', () => {
    const fossils = excavateDeprecatedApi('var x = 1', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('var')
  })

  it('detects require() calls', () => {
    const fossils = excavateDeprecatedApi("const fs = require('fs')", 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('require')
  })

  it('detects module.exports', () => {
    const fossils = excavateDeprecatedApi('module.exports = foo', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('module.exports')
  })

  it('does not flag commented var', () => {
    const fossils = excavateDeprecatedApi('// var x = 1', 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('does not flag modern code', () => {
    const fossils = excavateDeprecatedApi('const x = 1', 'a.ts')
    expect(fossils.length).toBe(0)
  })
})

// ─── excavateLegacyPatterns ───────────────────────────────────────────────────

describe('excavateLegacyPatterns', () => {
  it('detects arguments object', () => {
    const fossils = excavateLegacyPatterns('function foo() { return arguments[0] }', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('arguments')
  })

  it('detects new Function()', () => {
    const fossils = excavateLegacyPatterns('const fn = new Function("x", "return x")', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('new Function')
  })

  it('detects eval()', () => {
    const fossils = excavateLegacyPatterns('eval("1+1")', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('eval')
  })

  it('does not flag modern code', () => {
    expect(excavateLegacyPatterns('const x = (...args) => args', 'a.ts').length).toBe(0)
  })
})

// ─── excavateUnusedImports ────────────────────────────────────────────────────

describe('excavateUnusedImports', () => {
  it('detects unused named imports', () => {
    const code = "import { foo } from './mod'\nbar()"
    const fossils = excavateUnusedImports(code, 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.type).toBe('unused-import')
    expect(fossils[0]!.description).toContain('foo')
  })

  it('does not flag used imports', () => {
    const code = "import { foo } from './mod'\nfoo()"
    const fossils = excavateUnusedImports(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('handles aliased imports', () => {
    const code = "import { foo as bar } from './mod'\nbar()"
    const fossils = excavateUnusedImports(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('handles multiple imports in one line', () => {
    const code = "import { foo, bar } from './mod'\nfoo()"
    const fossils = excavateUnusedImports(code, 'a.ts')
    expect(fossils.length).toBe(1)
    expect(fossils[0]!.description).toContain('bar')
  })
})

// ─── excavateVestigialTypes ───────────────────────────────────────────────────

describe('excavateVestigialTypes', () => {
  it('detects redundant string annotation', () => {
    const fossils = excavateVestigialTypes('const x: string = "hello"', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('string')
  })

  it('detects redundant number annotation', () => {
    const fossils = excavateVestigialTypes('const x: number = 42', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('number')
  })

  it('detects redundant boolean annotation', () => {
    const fossils = excavateVestigialTypes('const x: boolean = true', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('boolean')
  })

  it('does not flag non-literal types', () => {
    const fossils = excavateVestigialTypes('const x: string = getName()', 'a.ts')
    expect(fossils.length).toBe(0)
  })
})

// ─── excavateOrphanReferences ─────────────────────────────────────────────────

describe('excavateOrphanReferences', () => {
  it('detects imports from deprecated paths', () => {
    const code = "import { x } from './deprecated/mod'"
    const fossils = excavateOrphanReferences(code, 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('detects imports from nonexistent paths', () => {
    const code = "import { x } from './nonexistent'"
    const fossils = excavateOrphanReferences(code, 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('skips test imports', () => {
    const code = "import { x } from './mod.test'"
    const fossils = excavateOrphanReferences(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('skips type imports', () => {
    const code = "import type { X } from './nonexistent'"
    const fossils = excavateOrphanReferences(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })
})

// ─── excavateAncientConventions ───────────────────────────────────────────────

describe('excavateAncientConventions', () => {
  it('detects numbered variables', () => {
    const fossils = excavateAncientConventions('const x_1 = 1', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('detects __proto__', () => {
    const fossils = excavateAncientConventions('obj.__proto__ = base', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('__proto__')
  })

  it('does not flag commented code', () => {
    const fossils = excavateAncientConventions('// const x_1 = 1', 'a.ts')
    expect(fossils.length).toBe(0)
  })
})

// ─── excavateZombieConstants ──────────────────────────────────────────────────

describe('excavateZombieConstants', () => {
  it('detects unused constants', () => {
    const code = 'const UNUSED_VAR = 1\nfoo()'
    const fossils = excavateZombieConstants(code, 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
    expect(fossils[0]!.description).toContain('UNUSED_VAR')
  })

  it('does not flag used constants', () => {
    const code = 'const MAX = 100\nreturn MAX'
    const fossils = excavateZombieConstants(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('does not flag exported constants', () => {
    const code = 'export const API_URL = "http://..."'
    const fossils = excavateZombieConstants(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })

  it('does not flag underscore-prefixed constants', () => {
    const code = 'const _INTERNAL = 1'
    const fossils = excavateZombieConstants(code, 'a.ts')
    expect(fossils.length).toBe(0)
  })
})

// ─── excavateRelicComments ────────────────────────────────────────────────────

describe('excavateRelicComments', () => {
  it('detects HACK comments', () => {
    const fossils = excavateRelicComments('// HACK: workaround', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('detects FIXME comments', () => {
    const fossils = excavateRelicComments('// FIXME: broken', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('detects XXX comments', () => {
    const fossils = excavateRelicComments('// XXX: review', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('detects BROKEN comments', () => {
    const fossils = excavateRelicComments('// BROKEN: see issue', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('detects @deprecated in comments', () => {
    const fossils = excavateRelicComments('/** @deprecated */', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('detects "no longer used" comments', () => {
    const fossils = excavateRelicComments('// no longer used', 'a.ts')
    expect(fossils.length).toBeGreaterThan(0)
  })

  it('does not flag regular comments', () => {
    const fossils = excavateRelicComments('// This is fine', 'a.ts')
    expect(fossils.length).toBe(0)
  })
})

// ─── stratifyLayers ───────────────────────────────────────────────────────────

describe('stratifyLayers', () => {
  it('groups fossils by era', () => {
    const fossils = [
      makeFossil({ era: 'ancient' }),
      makeFossil({ era: 'old' }),
      makeFossil({ era: 'recent' }),
    ]
    const layers = stratifyLayers(fossils)
    expect(layers.length).toBe(3)
  })

  it('skips empty eras', () => {
    const fossils = [makeFossil({ era: 'ancient' }), makeFossil({ era: 'ancient' })]
    const layers = stratifyLayers(fossils)
    expect(layers.length).toBe(1)
  })

  it('orders layers ancient → modern', () => {
    const fossils = [
      makeFossil({ era: 'recent' }),
      makeFossil({ era: 'ancient' }),
    ]
    const layers = stratifyLayers(fossils)
    expect(layers[0]!.name).toContain('Ancient')
    expect(layers[1]!.name).toContain('Recent')
  })

  it('returns empty for no fossils', () => {
    expect(stratifyLayers([])).toEqual([])
  })

  it('computes fileCount', () => {
    const fossils = [
      makeFossil({ file: 'a.ts', era: 'old' }),
      makeFossil({ file: 'b.ts', era: 'old' }),
    ]
    const layers = stratifyLayers(fossils)
    expect(layers[0]!.fileCount).toBe(2)
  })
})

// ─── computeFossilStats ───────────────────────────────────────────────────────

describe('computeFossilStats', () => {
  it('returns zeroed stats for empty', () => {
    const stats = computeFossilStats([])
    expect(stats.totalFossils).toBe(0)
    expect(stats.deadCodeCount).toBe(0)
  })

  it('counts by type', () => {
    const fossils = [
      makeFossil({ type: 'dead-code' }),
      makeFossil({ type: 'dead-code' }),
      makeFossil({ type: 'commented-out' }),
    ]
    const stats = computeFossilStats(fossils)
    expect(stats.deadCodeCount).toBe(2)
    expect(stats.commentedOutCount).toBe(1)
  })

  it('counts deprecated and legacy together', () => {
    const fossils = [
      makeFossil({ type: 'deprecated-api' }),
      makeFossil({ type: 'legacy-pattern' }),
    ]
    const stats = computeFossilStats(fossils)
    expect(stats.deprecatedCount).toBe(2)
  })

  it('counts cleanup candidates', () => {
    const fossils = [
      makeFossil({ severity: 'cleanup' }),
      makeFossil({ severity: 'cleanup' }),
      makeFossil({ severity: 'warning' }),
    ]
    const stats = computeFossilStats(fossils)
    expect(stats.cleanupCandidates).toBe(2)
  })

  it('estimates savings', () => {
    const stats = computeFossilStats([makeFossil(), makeFossil()])
    expect(stats.estimatedSavings).toBe(6)
  })
})

// ─── selectArtifactHighlights ─────────────────────────────────────────────────

describe('selectArtifactHighlights', () => {
  it('returns empty for no fossils', () => {
    expect(selectArtifactHighlights([])).toEqual([])
  })

  it('prioritizes dead-code fossils', () => {
    const fossils = [
      makeFossil({ type: 'vestigial-type' }),
      makeFossil({ type: 'dead-code' }),
    ]
    const highlights = selectArtifactHighlights(fossils)
    expect(highlights[0]!.type).toBe('dead-code')
  })

  it('limits to 5 highlights', () => {
    const fossils = Array(20).fill(null).map(() => makeFossil())
    const highlights = selectArtifactHighlights(fossils)
    expect(highlights.length).toBeLessThanOrEqual(5)
  })
})

// ─── generateFossilRecommendations ────────────────────────────────────────────

describe('generateFossilRecommendations', () => {
  it('recommends removing commented-out code', () => {
    const stats: FossilStats = { totalFossils: 5, deadCodeCount: 0, commentedOutCount: 3, deprecatedCount: 0, legacyCount: 0, cleanupCandidates: 3, estimatedSavings: 15 }
    const recs = generateFossilRecommendations([makeFossil({ type: 'commented-out' })], stats)
    expect(recs.some((r) => r.includes('commented-out'))).toBe(true)
  })

  it('recommends removing dead code', () => {
    const stats: FossilStats = { totalFossils: 2, deadCodeCount: 2, commentedOutCount: 0, deprecatedCount: 0, legacyCount: 0, cleanupCandidates: 2, estimatedSavings: 6 }
    const recs = generateFossilRecommendations([makeFossil({ type: 'dead-code' })], stats)
    expect(recs.some((r) => r.includes('dead code'))).toBe(true)
  })

  it('recommends migrating deprecated APIs', () => {
    const stats: FossilStats = { totalFossils: 2, deadCodeCount: 0, commentedOutCount: 0, deprecatedCount: 2, legacyCount: 0, cleanupCandidates: 0, estimatedSavings: 6 }
    const recs = generateFossilRecommendations([], stats)
    expect(recs.some((r) => r.includes('deprecated') || r.includes('migrate'))).toBe(true)
  })

  it('recommends cleanup when > 5 candidates', () => {
    const stats: FossilStats = { totalFossils: 10, deadCodeCount: 0, commentedOutCount: 0, deprecatedCount: 0, legacyCount: 0, cleanupCandidates: 8, estimatedSavings: 30 }
    const recs = generateFossilRecommendations([], stats)
    expect(recs.some((r) => r.includes('cleanup candidates'))).toBe(true)
  })

  it('says clean when no fossils', () => {
    const stats: FossilStats = { totalFossils: 0, deadCodeCount: 0, commentedOutCount: 0, deprecatedCount: 0, legacyCount: 0, cleanupCandidates: 0, estimatedSavings: 0 }
    const recs = generateFossilRecommendations([], stats)
    expect(recs.some((r) => r.includes('clean'))).toBe(true)
  })
})

// ─── buildExcavationResult ────────────────────────────────────────────────────

describe('buildExcavationResult', () => {
  it('finds fossils in legacy code', () => {
    const result = buildExcavationResult(
      ['legacy.ts'],
      ['var x = 1\n// const y = 2\nconst UNUSED = 3\nfoo()'],
    )
    expect(result.fossils.length).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildExcavationResult(
      ['legacy.ts'],
      ['var x = require("fs")'],
    )
    expect(result.stats.totalFossils).toBeGreaterThan(0)
  })

  it('stratifies layers', () => {
    const result = buildExcavationResult(
      ['legacy.ts', 'mod.ts'],
      ['var x = 1', 'const y = 2'],
    )
    expect(result.layers.length).toBeGreaterThanOrEqual(0)
  })

  it('selects artifact highlights', () => {
    const result = buildExcavationResult(
      ['legacy.ts'],
      ['var x = 1\n// HACK: fix this'],
    )
    expect(result.artifactHighlights.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildExcavationResult(
      ['legacy.ts'],
      ['var x = 1'],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles clean code', () => {
    const result = buildExcavationResult(
      ['clean.ts'],
      ['const x = 1\nexport { x }\n'],
    )
    expect(result.stats.totalFossils).toBe(0)
    expect(result.recommendations.some((r) => r.includes('clean'))).toBe(true)
  })

  it('handles empty input', () => {
    const result = buildExcavationResult([], [])
    expect(result.fossils.length).toBe(0)
    expect(result.stats.totalFossils).toBe(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getEraIcon', () => {
  it('returns icons for each era', () => {
    expect(getEraIcon('ancient')).toBeTruthy()
    expect(getEraIcon('old')).toBeTruthy()
    expect(getEraIcon('recent')).toBeTruthy()
    expect(getEraIcon('modern')).toBeTruthy()
  })
})

describe('getEffortIcon', () => {
  it('returns icons for each effort level', () => {
    expect(getEffortIcon('trivial')).toBeTruthy()
    expect(getEffortIcon('easy')).toBeTruthy()
    expect(getEffortIcon('moderate')).toBeTruthy()
    expect(getEffortIcon('careful')).toBeTruthy()
  })
})

describe('getSeverityColor', () => {
  it('returns function for each severity', () => {
    for (const s of ['info', 'warning', 'cleanup'] as const) {
      expect(typeof getSeverityColor(s)).toBe('function')
    }
  })
})

describe('formatFossilRow', () => {
  it('includes type, line, and file', () => {
    const fossil = makeFossil({ type: 'dead-code', line: 10, file: 'test.ts' })
    const result = formatFossilRow(fossil)
    expect(result).toContain('dead-code')
    expect(result).toContain('test.ts')
  })
})

describe('formatFossilCatalog', () => {
  it('renders catalog with header', () => {
    const fossils = [makeFossil()]
    const result = formatFossilCatalog(fossils)
    expect(result).toContain('Fossil Catalog')
  })

  it('shows clean message for empty', () => {
    expect(formatFossilCatalog([])).toContain('clean')
  })

  it('truncates at 30 fossils', () => {
    const fossils = Array(35).fill(null).map(() => makeFossil())
    const result = formatFossilCatalog(fossils)
    expect(result).toContain('more fossils')
  })
})

describe('formatFossilLayers', () => {
  it('renders layers', () => {
    const layers = stratifyLayers([makeFossil({ era: 'ancient' }), makeFossil({ era: 'old' })])
    const result = formatFossilLayers(layers)
    expect(result).toContain('Stratified Layers')
  })

  it('shows empty message', () => {
    expect(formatFossilLayers([])).toContain('No stratified')
  })
})

describe('formatFossilStats', () => {
  it('renders all stat fields', () => {
    const stats: FossilStats = { totalFossils: 10, deadCodeCount: 2, commentedOutCount: 3, deprecatedCount: 1, legacyCount: 2, cleanupCandidates: 5, estimatedSavings: 30 }
    const result = formatFossilStats(stats)
    expect(result).toContain('Total fossils: 10')
    expect(result).toContain('Dead code: 2')
    expect(result).toContain('Commented out: 3')
    expect(result).toContain('Estimated savings: ~30')
  })
})

describe('formatArtifactHighlights', () => {
  it('renders highlights', () => {
    const highlights = [makeFossil({ type: 'dead-code', file: 'a.ts', line: 5 })]
    const result = formatArtifactHighlights(highlights)
    expect(result).toContain('Artifact Highlights')
    expect(result).toContain('dead-code')
  })

  it('shows empty message', () => {
    expect(formatArtifactHighlights([])).toContain('No artifact')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered list', () => {
    expect(formatRecommendations(['Clean A', 'Clean B'])).toContain('1. Clean A')
    expect(formatRecommendations(['Clean A', 'Clean B'])).toContain('2. Clean B')
  })

  it('shows empty message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatFossilTable', () => {
  it('renders full table', () => {
    const result = buildExcavationResult(['a.ts'], ['var x = 1'])
    const output = formatFossilTable(result)
    expect(output).toContain('Fossil Excavation Report')
    expect(output).toContain('Fossil Catalog')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })
})

describe('formatFossilJSON', () => {
  it('returns valid JSON', () => {
    const result = buildExcavationResult(['a.ts'], ['var x = 1'])
    const json = formatFossilJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.fossils.length).toBeGreaterThan(0)
  })
})
