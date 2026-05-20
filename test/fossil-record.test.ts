import { describe, expect, it } from 'vitest'

import {
  assessRisk,
  buildFossilRecordResult,
  classifyLivingFossil,
  computeChangeVelocity,
  computeFossilRecordStats,
  computeOverallStabilityIndex,
  computeStability,
  detectEvolutionaryStages,
  detectExtinctPatterns,
  findCommentedCode,
  findDeprecatedImports,
  findLivingFossils,
  findOldConventions,
  findTodoFixme,
  generateEraName,
  generateFossilRecordRecommendations,
  parseGitLog,
  type FossilLayer,
  type LivingFossil,
} from '../src/commands/fossil-record-helpers.js'

import {
  formatEraTimeline,
  formatExtinctTable,
  formatFossilRecordJSON,
  formatFossilRecordStats,
  formatFossilRecordTable,
  formatLivingFossilList,
  formatRecommendations,
  formatStabilityMeter,
  formatVelocityGraph,
  getEraColor,
  getRiskBadge,
} from '../src/commands/fossil-record-format-helpers.js'

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const FILE_A = 'src/a.ts'
const FILE_B = 'src/b.ts'
const FILE_C = 'src/c.ts'

const GIT_LOG_3COMMITS = [
  'abc1234|2025-01-15 10:00:00 +0000|feat: add user auth|3|50|10',
  'def5678|2025-01-10 08:00:00 +0000|fix: resolve login bug|2|15|5',
  'ghi9012|2025-01-01 12:00:00 +0000|init: scaffold project|8|200|0',
].join('\n')

const GIT_LOG_EMPTY = ''

const GIT_LOG_SINGLE = 'abc1234|2025-01-01 00:00:00 +0000|init: project|5|100|0'

const CONTENT_VAR = 'var x = 1;\nvar y = 2;\nconst z = 3;'
const CONTENT_REQUIRE = "const fs = require('fs');\nconst path = require('path');"
const CONTENT_MOMENT = "import moment from 'moment';\nconst today = moment();"
const CONTENT_CLEAN = 'const x = 1;\nexport function hello() { return x; }'
const CONTENT_COMMENTED = [
  '// const oldFeature = loadOld();',
  '// function legacy() { return true; }',
  '// import { removed } from "./removed";',
  '// if (oldCheck) { doSomething(); }',
  'const active = 1;',
].join('\n')
const CONTENT_DEPRECATED = [
  'const x = 1;',
  '// DEPRECATED: use newApi instead',
  'function oldApi() { return null; }',
].join('\n')
const CONTENT_CALLBACK = [
  'function process(data, callback) { callback(null, data); }',
  'function handle(err, cb) { cb(err); }',
].join('\n')
const CONTENT_MIXED = CONTENT_VAR + '\n' + CONTENT_COMMENTED

// ─── parseGitLog ──────────────────────────────────────────────────────────────

describe('parseGitLog', () => {
  it('parses multi-line git log', () => {
    const layers = parseGitLog(GIT_LOG_3COMMITS)
    expect(layers).toHaveLength(3)
    expect(layers[0]!.commitHash).toBe('abc1234')
    expect(layers[0]!.depth).toBe(1)
    expect(layers[0]!.filesChanged).toBe(3)
    expect(layers[0]!.insertions).toBe(50)
    expect(layers[0]!.deletions).toBe(10)
    expect(layers[0]!.message).toBe('feat: add user auth')
  })

  it('parses single commit', () => {
    const layers = parseGitLog(GIT_LOG_SINGLE)
    expect(layers).toHaveLength(1)
    expect(layers[0]!.commitHash).toBe('abc1234')
  })

  it('returns empty for empty log', () => {
    expect(parseGitLog(GIT_LOG_EMPTY)).toHaveLength(0)
  })

  it('assigns correct depth numbers', () => {
    const layers = parseGitLog(GIT_LOG_3COMMITS)
    expect(layers.map((l) => l.depth)).toEqual([1, 2, 3])
  })

  it('assigns era names', () => {
    const layers = parseGitLog(GIT_LOG_3COMMITS)
    expect(layers[0]!.era).toBe('Feature Growth Era')
    expect(layers[1]!.era).toBe('Bug Fix Era')
    expect(layers[2]!.era).toBe('Scaffold Era')
  })

  it('skips malformed lines', () => {
    const log = 'badline\nabc|2025-01-01|msg|1|0|0'
    const layers = parseGitLog(log)
    expect(layers).toHaveLength(1)
  })
})

// ─── generateEraName ──────────────────────────────────────────────────────────

describe('generateEraName', () => {
  it('identifies scaffold era', () => {
    expect(generateEraName('init: scaffold project', 0)).toBe('Scaffold Era')
  })

  it('identifies migration era', () => {
    expect(generateEraName('refactor: migrate to ESM', 0)).toBe('Migration Era')
  })

  it('identifies test expansion era', () => {
    expect(generateEraName('test: add unit tests', 0)).toBe('Test Expansion Era')
  })

  it('identifies feature growth era', () => {
    expect(generateEraName('feat: add auth', 0)).toBe('Feature Growth Era')
  })

  it('identifies bug fix era', () => {
    expect(generateEraName('fix: resolve crash', 0)).toBe('Bug Fix Era')
  })

  it('identifies dependency era', () => {
    expect(generateEraName('deps: upgrade chalk', 0)).toBe('Dependency Era')
  })

  it('identifies documentation era', () => {
    expect(generateEraName('docs: update readme', 0)).toBe('Documentation Era')
  })

  it('identifies cleanup era', () => {
    expect(generateEraName('clean: remove dead code', 0)).toBe('Cleanup Era')
  })

  it('identifies performance era', () => {
    expect(generateEraName('perf: optimize loop', 0)).toBe('Performance Era')
  })

  it('identifies security era', () => {
    expect(generateEraName('security: patch vuln', 0)).toBe('Security Era')
  })

  it('identifies infrastructure era', () => {
    expect(generateEraName('ci: add GitHub Actions', 0)).toBe('Infrastructure Era')
  })

  it('falls back to depth-based names', () => {
    expect(generateEraName('update stuff', 0)).toBe('Ancient Era')
    expect(generateEraName('update stuff', 6)).toBe('Contemporary Era')
  })
})

// ─── findDeprecatedImports ────────────────────────────────────────────────────

describe('findDeprecatedImports', () => {
  it('detects var usage', () => {
    const patterns = findDeprecatedImports([FILE_A], [CONTENT_VAR])
    const varPattern = patterns.find((p) => p.pattern === 'var')
    expect(varPattern).toBeDefined()
    expect(varPattern!.category).toBe('import')
    expect(varPattern!.replacement).toContain('const/let')
  })

  it('detects require() usage', () => {
    const patterns = findDeprecatedImports([FILE_A], [CONTENT_REQUIRE])
    const reqPattern = patterns.find((p) => p.pattern === 'require()')
    expect(reqPattern).toBeDefined()
  })

  it('detects moment usage', () => {
    const patterns = findDeprecatedImports([FILE_A], [CONTENT_MOMENT])
    const momentPattern = patterns.find((p) => p.pattern === 'moment')
    expect(momentPattern).toBeDefined()
    expect(momentPattern!.replacement).toContain('date-fns')
  })

  it('returns empty for clean code', () => {
    const patterns = findDeprecatedImports([FILE_A], [CONTENT_CLEAN])
    expect(patterns).toHaveLength(0)
  })

  it('merges files for same pattern', () => {
    const patterns = findDeprecatedImports(
      [FILE_A, FILE_B],
      [CONTENT_VAR, CONTENT_VAR],
    )
    const varPattern = patterns.find((p) => p.pattern === 'var')
    expect(varPattern!.files).toHaveLength(2)
  })
})

// ─── findCommentedCode ────────────────────────────────────────────────────────

describe('findCommentedCode', () => {
  it('detects commented-out code blocks', () => {
    const patterns = findCommentedCode([FILE_A], [CONTENT_COMMENTED])
    expect(patterns).toHaveLength(1)
    expect(patterns[0]!.pattern).toBe('commented-out code')
    expect(patterns[0]!.category).toBe('pattern')
  })

  it('returns empty for clean code', () => {
    const patterns = findCommentedCode([FILE_A], [CONTENT_CLEAN])
    expect(patterns).toHaveLength(0)
  })

  it('requires at least 3 commented lines', () => {
    const content = '// const x = 1;\n// function f() {}\nconst y = 2;'
    const patterns = findCommentedCode([FILE_A], [content])
    expect(patterns).toHaveLength(0)
  })
})

// ─── findTodoFixme ────────────────────────────────────────────────────────────

describe('findTodoFixme', () => {
  it('detects DEPRECATED markers', () => {
    const patterns = findTodoFixme([FILE_A], [CONTENT_DEPRECATED])
    expect(patterns).toHaveLength(1)
    expect(patterns[0]!.pattern).toBe('DEPRECATED markers')
    expect(patterns[0]!.category).toBe('api')
  })

  it('returns empty for no deprecated markers', () => {
    const patterns = findTodoFixme([FILE_A], [CONTENT_CLEAN])
    expect(patterns).toHaveLength(0)
  })
})

// ─── findOldConventions ───────────────────────────────────────────────────────

describe('findOldConventions', () => {
  it('detects callback-style patterns', () => {
    const patterns = findOldConventions([FILE_A], [CONTENT_CALLBACK])
    const cb = patterns.find((p) => p.pattern === 'callback-style')
    expect(cb).toBeDefined()
    expect(cb!.category).toBe('convention')
    expect(cb!.replacement).toContain('Promise')
  })

  it('returns empty for modern code', () => {
    const patterns = findOldConventions([FILE_A], [CONTENT_CLEAN])
    expect(patterns).toHaveLength(0)
  })

  it('requires at least 2 callback matches', () => {
    const content = 'function process(data, callback) { callback(null); }'
    const patterns = findOldConventions([FILE_A], [content])
    expect(patterns).toHaveLength(0)
  })
})

// ─── detectExtinctPatterns ────────────────────────────────────────────────────

describe('detectExtinctPatterns', () => {
  it('combines all pattern detectors', () => {
    const patterns = detectExtinctPatterns(
      [FILE_A, FILE_B],
      [CONTENT_MIXED, CONTENT_DEPRECATED],
    )
    expect(patterns.length).toBeGreaterThanOrEqual(2)
    const categories = new Set(patterns.map((p) => p.category))
    expect(categories.size).toBeGreaterThanOrEqual(2)
  })

  it('returns empty for clean codebase', () => {
    const patterns = detectExtinctPatterns([FILE_A], [CONTENT_CLEAN])
    expect(patterns).toHaveLength(0)
  })
})

// ─── classifyLivingFossil ─────────────────────────────────────────────────────

describe('classifyLivingFossil', () => {
  it('classifies ancient (>365 days)', () => {
    expect(classifyLivingFossil(400, '')).toBe('ancient')
  })

  it('classifies dormant (180-365)', () => {
    expect(classifyLivingFossil(200, '')).toBe('dormant')
  })

  it('classifies relic (contains DEPRECATED)', () => {
    expect(classifyLivingFossil(100, '// DEPRECATED')).toBe('relic')
  })

  it('classifies petrified (90-180, no deprecated)', () => {
    expect(classifyLivingFossil(120, 'const x = 1;')).toBe('petrified')
  })
})

// ─── computeStability ─────────────────────────────────────────────────────────

describe('computeStability', () => {
  it('returns 0 for age 0', () => {
    expect(computeStability(0)).toBe(0)
  })

  it('scales linearly with age', () => {
    expect(computeStability(365)).toBe(100)
    expect(computeStability(182)).toBe(50)
  })

  it('caps at 100', () => {
    expect(computeStability(1000)).toBe(100)
  })
})

// ─── assessRisk ───────────────────────────────────────────────────────────────

describe('assessRisk', () => {
  it('returns high for ancient + deprecated', () => {
    expect(assessRisk(400, '// DEPRECATED')).toBe('high')
  })

  it('returns high for ancient + TODO', () => {
    expect(assessRisk(400, '// TODO: fix')).toBe('high')
  })

  it('returns medium for ancient without markers', () => {
    expect(assessRisk(400, 'const x = 1;')).toBe('medium')
  })

  it('returns low for dormant', () => {
    expect(assessRisk(200, 'const x = 1;')).toBe('low')
  })

  it('returns none for young files', () => {
    expect(assessRisk(50, 'const x = 1;')).toBe('none')
  })
})

// ─── findLivingFossils ────────────────────────────────────────────────────────

describe('findLivingFossils', () => {
  it('detects files older than 90 days', () => {
    const fossils = findLivingFossils([FILE_A], [200], ['const x = 1;'])
    expect(fossils).toHaveLength(1)
    expect(fossils[0]!.age).toBe(200)
    expect(fossils[0]!.category).toBe('dormant')
  })

  it('ignores files younger than 90 days', () => {
    const fossils = findLivingFossils([FILE_A], [50], ['const x = 1;'])
    expect(fossils).toHaveLength(0)
  })

  it('sorts by risk and category', () => {
    const fossils = findLivingFossils(
      [FILE_A, FILE_B, FILE_C],
      [400, 200, 100],
      ['const x = 1;', 'const y = 2;', 'const z = 3;'],
    )
    expect(fossils).toHaveLength(3)
    expect(fossils[0]!.age).toBe(400)
  })
})

// ─── detectEvolutionaryStages ─────────────────────────────────────────────────

describe('detectEvolutionaryStages', () => {
  it('groups consecutive same-era commits into stages', () => {
    const layers: FossilLayer[] = [
      { depth: 1, commitHash: 'a1', date: '2025-01-15', message: 'feat: add x', filesChanged: 2, insertions: 10, deletions: 0, era: 'Feature Growth Era' },
      { depth: 2, commitHash: 'a2', date: '2025-01-14', message: 'feat: add y', filesChanged: 3, insertions: 15, deletions: 0, era: 'Feature Growth Era' },
      { depth: 3, commitHash: 'b1', date: '2025-01-10', message: 'fix: bug', filesChanged: 1, insertions: 5, deletions: 3, era: 'Bug Fix Era' },
    ]
    const stages = detectEvolutionaryStages(layers)
    expect(stages).toHaveLength(2)
    expect(stages[0]!.name).toBe('Feature Growth Era')
    expect(stages[0]!.totalChanges).toBe(25)
    expect(stages[1]!.name).toBe('Bug Fix Era')
  })

  it('returns empty for empty layers', () => {
    expect(detectEvolutionaryStages([])).toHaveLength(0)
  })

  it('handles single era', () => {
    const layers: FossilLayer[] = [
      { depth: 1, commitHash: 'a1', date: '2025-01-01', message: 'feat: x', filesChanged: 1, insertions: 10, deletions: 0, era: 'Feature Growth Era' },
    ]
    const stages = detectEvolutionaryStages(layers)
    expect(stages).toHaveLength(1)
    expect(stages[0]!.endCommit).toBe('a1')
  })

  it('computes fileCount from layers', () => {
    const layers: FossilLayer[] = [
      { depth: 1, commitHash: 'a', date: '2025-01-01', message: 'feat: x', filesChanged: 3, insertions: 10, deletions: 0, era: 'Feature Growth Era' },
      { depth: 2, commitHash: 'b', date: '2025-01-02', message: 'feat: y', filesChanged: 2, insertions: 5, deletions: 0, era: 'Feature Growth Era' },
    ]
    const stages = detectEvolutionaryStages(layers)
    expect(stages[0]!.fileCount).toBe(5)
  })
})

// ─── computeChangeVelocity ────────────────────────────────────────────────────

describe('computeChangeVelocity', () => {
  it('computes velocity from layers', () => {
    const layers: FossilLayer[] = [
      { depth: 1, commitHash: 'a', date: '2025-01-14', message: 'fix', filesChanged: 1, insertions: 5, deletions: 0, era: 'Bug Fix Era' },
      { depth: 2, commitHash: 'b', date: '2025-01-07', message: 'feat', filesChanged: 1, insertions: 10, deletions: 0, era: 'Feature Growth Era' },
    ]
    const velocity = computeChangeVelocity(layers)
    expect(velocity).toBe(2)
  })

  it('returns 0 for empty layers', () => {
    expect(computeChangeVelocity([])).toBe(0)
  })

  it('returns count for single layer', () => {
    const layers: FossilLayer[] = [
      { depth: 1, commitHash: 'a', date: '2025-01-01', message: 'init', filesChanged: 1, insertions: 10, deletions: 0, era: 'Scaffold Era' },
    ]
    expect(computeChangeVelocity(layers)).toBe(1)
  })
})

// ─── computeOverallStabilityIndex ─────────────────────────────────────────────

describe('computeOverallStabilityIndex', () => {
  it('returns 100 for no living fossils', () => {
    expect(computeOverallStabilityIndex([], 10)).toBe(100)
  })

  it('returns 0 when all files are fossils', () => {
    const fossils: LivingFossil[] = [
      { file: 'a.ts', age: 200, lastTouched: '200d ago', stability: 50, category: 'dormant', risk: 'low' },
    ]
    expect(computeOverallStabilityIndex(fossils, 1)).toBe(0)
  })

  it('computes ratio correctly', () => {
    const fossils: LivingFossil[] = [
      { file: 'a.ts', age: 200, lastTouched: '200d ago', stability: 50, category: 'dormant', risk: 'low' },
    ]
    expect(computeOverallStabilityIndex(fossils, 4)).toBe(75)
  })
})

// ─── computeFossilRecordStats ─────────────────────────────────────────────────

describe('computeFossilRecordStats', () => {
  it('computes all stats fields', () => {
    const layers: FossilLayer[] = [
      { depth: 1, commitHash: 'a', date: '2025-01-01', message: 'init', filesChanged: 5, insertions: 100, deletions: 0, era: 'Scaffold Era' },
    ]
    const stats = computeFossilRecordStats(layers, [], [], [], [FILE_A, FILE_B], [100, 50])
    expect(stats.totalLayers).toBe(1)
    expect(stats.extinctCount).toBe(0)
    expect(stats.livingFossilCount).toBe(0)
    expect(stats.stageCount).toBe(0)
    expect(stats.averageFileAge).toBe(75)
    expect(stats.oldestActiveFile).toBe(FILE_A)
  })

  it('handles empty input', () => {
    const stats = computeFossilRecordStats([], [], [], [], [], [])
    expect(stats.totalLayers).toBe(0)
    expect(stats.averageFileAge).toBe(0)
    expect(stats.oldestActiveFile).toBe('')
  })
})

// ─── generateFossilRecordRecommendations ──────────────────────────────────────

describe('generateFossilRecordRecommendations', () => {
  it('recommends reviewing high-risk fossils', () => {
    const living: LivingFossil[] = [
      { file: 'a.ts', age: 400, lastTouched: '400d', stability: 100, category: 'ancient', risk: 'high' },
    ]
    const recs = generateFossilRecordRecommendations(living, [], { totalLayers: 0, extinctCount: 0, livingFossilCount: 1, stageCount: 0, oldestActiveFile: '', averageFileAge: 400, changeVelocity: 0, stabilityIndex: 50 })
    expect(recs.some((r) => r.includes('high-risk'))).toBe(true)
  })

  it('recommends reviewing ancient files', () => {
    const living: LivingFossil[] = [
      { file: 'a.ts', age: 400, lastTouched: '400d', stability: 100, category: 'ancient', risk: 'medium' },
    ]
    const recs = generateFossilRecordRecommendations(living, [], { totalLayers: 0, extinctCount: 0, livingFossilCount: 1, stageCount: 0, oldestActiveFile: '', averageFileAge: 400, changeVelocity: 0, stabilityIndex: 50 })
    expect(recs.some((r) => r.includes('ancient'))).toBe(true)
  })

  it('recommends cleaning extinct patterns', () => {
    const recs = generateFossilRecordRecommendations([], [{ pattern: 'var', lastSeen: '', replacement: 'const', files: [], category: 'import' }], { totalLayers: 0, extinctCount: 1, livingFossilCount: 0, stageCount: 0, oldestActiveFile: '', averageFileAge: 0, changeVelocity: 0, stabilityIndex: 100 })
    expect(recs.some((r) => r.includes('extinct'))).toBe(true)
  })

  it('recommends migrating callbacks', () => {
    const recs = generateFossilRecordRecommendations([], [{ pattern: 'callback-style', lastSeen: '', replacement: 'Promise', files: [], category: 'convention' }], { totalLayers: 0, extinctCount: 1, livingFossilCount: 0, stageCount: 0, oldestActiveFile: '', averageFileAge: 0, changeVelocity: 0, stabilityIndex: 100 })
    expect(recs.some((r) => r.includes('async/await'))).toBe(true)
  })

  it('warns about high velocity', () => {
    const recs = generateFossilRecordRecommendations([], [], { totalLayers: 0, extinctCount: 0, livingFossilCount: 0, stageCount: 0, oldestActiveFile: '', averageFileAge: 0, changeVelocity: 25, stabilityIndex: 100 })
    expect(recs.some((r) => r.includes('velocity'))).toBe(true)
  })

  it('says healthy when all clean', () => {
    const recs = generateFossilRecordRecommendations([], [], { totalLayers: 0, extinctCount: 0, livingFossilCount: 0, stageCount: 0, oldestActiveFile: '', averageFileAge: 0, changeVelocity: 5, stabilityIndex: 100 })
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildFossilRecordResult ──────────────────────────────────────────────────

describe('buildFossilRecordResult', () => {
  it('builds complete result from inputs', () => {
    const result = buildFossilRecordResult(
      [FILE_A, FILE_B],
      [CONTENT_CLEAN, CONTENT_VAR],
      [10, 200],
      GIT_LOG_3COMMITS,
    )
    expect(result.layers).toHaveLength(3)
    expect(result.extinctPatterns.length).toBeGreaterThanOrEqual(1)
    expect(result.livingFossils).toHaveLength(1)
    expect(result.evolutionaryStages.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalLayers).toBe(3)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty inputs', () => {
    const result = buildFossilRecordResult([], [], [], GIT_LOG_EMPTY)
    expect(result.layers).toHaveLength(0)
    expect(result.extinctPatterns).toHaveLength(0)
    expect(result.livingFossils).toHaveLength(0)
    expect(result.stats.totalLayers).toBe(0)
  })

  it('detects living fossils from ages', () => {
    const result = buildFossilRecordResult(
      [FILE_A, FILE_B, FILE_C],
      [CONTENT_CLEAN, CONTENT_CLEAN, CONTENT_CLEAN],
      [50, 400, 200],
      GIT_LOG_SINGLE,
    )
    expect(result.livingFossils).toHaveLength(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getEraColor', () => {
  it('returns function for known eras', () => {
    expect(typeof getEraColor('Feature Growth Era')('test')).toBe('string')
    expect(typeof getEraColor('Bug Fix Era')('test')).toBe('string')
  })

  it('returns white for unknown era', () => {
    expect(typeof getEraColor('Unknown Era')('test')).toBe('string')
  })
})

describe('getRiskBadge', () => {
  it('returns colored badge for each risk level', () => {
    for (const risk of ['none', 'low', 'medium', 'high'] as const) {
      const badge = getRiskBadge(risk)
      expect(badge).toContain(risk.toUpperCase())
    }
  })
})

describe('formatStabilityMeter', () => {
  it('renders stability bar', () => {
    const result = formatStabilityMeter(75)
    expect(result).toContain('Stability')
    expect(result).toContain('75%')
    expect(result).toContain('█')
  })
})

describe('formatVelocityGraph', () => {
  it('renders graph with layers', () => {
    const layers: FossilLayer[] = [
      { depth: 1, commitHash: 'abc12345', date: '2025-01-15', message: 'feat: x', filesChanged: 2, insertions: 50, deletions: 10, era: 'Feature Growth Era' },
    ]
    const result = formatVelocityGraph(layers)
    expect(result).toContain('Commit History')
    expect(result).toContain('Feature Growth Era')
  })

  it('shows no history message for empty', () => {
    expect(formatVelocityGraph([])).toContain('No commit history')
  })
})

describe('formatExtinctTable', () => {
  it('renders extinct patterns', () => {
    const patterns = [{ pattern: 'var', lastSeen: FILE_A, replacement: 'const/let', files: [FILE_A], category: 'import' as const }]
    const result = formatExtinctTable(patterns)
    expect(result).toContain('Extinct Patterns')
    expect(result).toContain('var')
  })

  it('shows no patterns message', () => {
    expect(formatExtinctTable([])).toContain('No extinct patterns')
  })
})

describe('formatLivingFossilList', () => {
  it('renders living fossils', () => {
    const fossils: LivingFossil[] = [
      { file: 'a.ts', age: 400, lastTouched: '400d ago', stability: 100, category: 'ancient', risk: 'medium' },
    ]
    const result = formatLivingFossilList(fossils)
    expect(result).toContain('Living Fossils')
    expect(result).toContain('a.ts')
    expect(result).toContain('MEDIUM')
  })

  it('shows no fossils message', () => {
    expect(formatLivingFossilList([])).toContain('No living fossils')
  })
})

describe('formatEraTimeline', () => {
  it('renders timeline', () => {
    const stages = [
      { name: 'Scaffold Era', startCommit: 'a', endCommit: 'b', startDate: '2025-01-01', endDate: '2025-01-05', characteristics: ['init project'], fileCount: 5, totalChanges: 100 },
    ]
    const result = formatEraTimeline(stages)
    expect(result).toContain('Evolutionary Timeline')
    expect(result).toContain('Scaffold Era')
  })

  it('shows no stages message', () => {
    expect(formatEraTimeline([])).toContain('No evolutionary stages')
  })
})

describe('formatFossilRecordStats', () => {
  it('renders stats', () => {
    const stats = { totalLayers: 50, extinctCount: 3, livingFossilCount: 5, stageCount: 4, oldestActiveFile: 'old.ts', averageFileAge: 120, changeVelocity: 2.5, stabilityIndex: 80 }
    const result = formatFossilRecordStats(stats)
    expect(result).toContain('Layers: 50')
    expect(result).toContain('Extinct: 3')
    expect(result).toContain('old.ts')
  })
})

describe('formatRecommendations', () => {
  it('renders recommendations', () => {
    expect(formatRecommendations(['Do this'])).toContain('1. Do this')
  })

  it('shows no recs message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatFossilRecordTable', () => {
  it('renders full output', () => {
    const result = buildFossilRecordResult(
      [FILE_A], [CONTENT_CLEAN], [10], GIT_LOG_SINGLE,
    )
    const output = formatFossilRecordTable(result)
    expect(output).toContain('Fossil Record Analysis')
    expect(output).toContain('Stability')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })
})

describe('formatFossilRecordJSON', () => {
  it('renders valid JSON', () => {
    const result = buildFossilRecordResult(
      [FILE_A], [CONTENT_CLEAN], [10], GIT_LOG_SINGLE,
    )
    const json = formatFossilRecordJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.layers).toBeDefined()
    expect(parsed.extinctPatterns).toBeDefined()
    expect(parsed.livingFossils).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
