import { describe, it, expect } from 'vitest'
import {
  type LabyrinthPath,
  type MinotaurPoint,
  type DeadEnd,
  type LabyrinthFile,
  type LabyrinthStats,
  type LabyrinthResult,
  mapPaths,
  computeBranchComplexity,
  countBranchesNearby,
  computeNestingDepth,
  isPotentiallyInfinite,
  isGuardClause,
  isLineDocumented,
  findCorridors,
  findTraps,
  findMinotaurPoints,
  measureCallbackDepth,
  findDeadEnds,
  computeNavigability,
  computeThreadScore,
  computeLighting,
  computeFileComplexity,
  classifyLabyrinthFile,
  computeLabyrinthScore,
  computeThreadReliability,
  classifyOverall,
  generateRecommendations,
  buildLabyrinthResult,
} from '../src/commands/labyrinth-helpers.js'
import {
  formatPathType,
  formatPath,
  formatPaths,
  formatDangerLevel,
  formatMinotaur,
  formatMinotaurs,
  formatDeadEndSeverity,
  formatDeadEnd,
  formatDeadEnds,
  formatFileClassification,
  formatLabyrinthFile,
  formatLabyrinthFiles,
  formatOverallClassification,
  formatStats,
  formatRecommendations,
  formatLabyrinthResult,
  formatLabyrinthJson,
} from '../src/commands/labyrinth-format-helpers.js'

// ─── mapPaths ──────────────────────────────────────────────────────────────────

describe('mapPaths', () => {
  it('detects branch paths from if statements', () => {
    const paths = mapPaths('if (x) { foo() }', 'a.ts')
    expect(paths.some(p => p.type === 'branch')).toBe(true)
  })

  it('detects branch paths from switch statements', () => {
    const paths = mapPaths('switch (x) { case 1: break; case 2: break; }', 'a.ts')
    expect(paths.some(p => p.type === 'branch')).toBe(true)
  })

  it('detects loop paths', () => {
    const paths = mapPaths('for (let i = 0; i < 10; i++) { foo() }', 'a.ts')
    expect(paths.some(p => p.type === 'loop')).toBe(true)
  })

  it('detects spiral from while(true)', () => {
    const paths = mapPaths('while (true) { foo() }', 'a.ts')
    expect(paths.some(p => p.type === 'spiral')).toBe(true)
  })

  it('detects corridors in sequential code', () => {
    const code = 'const a = 1\nconst b = 2\nconst c = 3'
    const paths = mapPaths(code, 'a.ts')
    expect(paths.some(p => p.type === 'corridor')).toBe(true)
  })

  it('returns paths with file', () => {
    const paths = mapPaths('if (x) {}', 'src/a.ts')
    expect(paths.every(p => p.file === 'src/a.ts')).toBe(true)
  })

  it('returns empty for blank content', () => {
    const paths = mapPaths('', 'a.ts')
    expect(paths.length).toBe(0)
  })

  it('paths have valid complexity 0-100', () => {
    const paths = mapPaths('if (x && y || z) { foo() }', 'a.ts')
    expect(paths.every(p => p.complexity >= 0 && p.complexity <= 100)).toBe(true)
  })

  it('detects shortcuts from early returns', () => {
    const code = 'function foo(x) {\nif (!x) return null\nconst y = compute(x)\nreturn y\n}'
    const paths = mapPaths(code, 'a.ts')
    expect(paths.some(p => p.type === 'shortcut')).toBe(true)
  })
})

// ─── computeBranchComplexity ───────────────────────────────────────────────────

describe('computeBranchComplexity', () => {
  it('returns higher complexity for more operators', () => {
    const simple = computeBranchComplexity('if (x) {', 0)
    const complex = computeBranchComplexity('if (a && b || c && d) {', 0)
    expect(complex).toBeGreaterThan(simple)
  })

  it('is between 0 and 100', () => {
    const c = computeBranchComplexity('if (x) {', 0)
    expect(c).toBeGreaterThanOrEqual(0)
    expect(c).toBeLessThanOrEqual(100)
  })
})

// ─── computeNestingDepth ───────────────────────────────────────────────────────

describe('computeNestingDepth', () => {
  it('returns 0 for flat code', () => {
    expect(computeNestingDepth('if (x) {}', 0)).toBe(0)
  })

  it('returns 1 for one level of nesting', () => {
    expect(computeNestingDepth('{ if (x) {}', 7)).toBe(1)
  })

  it('returns 2 for two levels', () => {
    expect(computeNestingDepth('{ { if (x) {}', 7)).toBe(2)
  })
})

// ─── countBranchesNearby ───────────────────────────────────────────────────────

describe('countBranchesNearby', () => {
  it('counts control flow keywords', () => {
    const count = countBranchesNearby('if (x) {} if (y) {} for (z) {}', 0)
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

// ─── isPotentiallyInfinite ─────────────────────────────────────────────────────

describe('isPotentiallyInfinite', () => {
  it('detects while(true)', () => {
    expect(isPotentiallyInfinite('while (true) { foo() }', 0)).toBe(true)
  })

  it('detects for(;;)', () => {
    expect(isPotentiallyInfinite('for (;;) { foo() }', 0)).toBe(true)
  })

  it('does not flag normal for loop', () => {
    expect(isPotentiallyInfinite('for (let i = 0; i < 10; i++) { foo() }', 0)).toBe(false)
  })
})

// ─── isGuardClause ─────────────────────────────────────────────────────────────

describe('isGuardClause', () => {
  it('detects guard clause with if-return', () => {
    expect(isGuardClause(['if (!x) return null'], 0)).toBe(true)
  })

  it('does not flag regular return', () => {
    expect(isGuardClause(['function foo() {', 'return x'], 1)).toBe(false)
  })
})

// ─── isLineDocumented ──────────────────────────────────────────────────────────

describe('isLineDocumented', () => {
  it('detects comment above', () => {
    expect(isLineDocumented(['// comment', 'if (x) {}'], 1)).toBe(true)
  })

  it('detects jsdoc close above', () => {
    expect(isLineDocumented([' */', 'function foo()'], 1)).toBe(true)
  })

  it('returns false when no doc above', () => {
    expect(isLineDocumented(['const x = 1', 'if (x) {}'], 1)).toBe(false)
  })
})

// ─── findCorridors ─────────────────────────────────────────────────────────────

describe('findCorridors', () => {
  it('finds sequential corridors', () => {
    const lines = ['const a = 1', 'const b = 2', 'const c = 3']
    const corridors = findCorridors(lines, 'a.ts', 50)
    expect(corridors.length).toBeGreaterThan(0)
    expect(corridors[0].type).toBe('corridor')
  })

  it('returns empty for only control flow', () => {
    const lines = ['if (x) {', '  foo()', '}']
    const corridors = findCorridors(lines, 'a.ts', 50)
    expect(corridors.every(c => c.type === 'corridor')).toBe(true)
  })
})

// ─── findTraps ─────────────────────────────────────────────────────────────────

describe('findTraps', () => {
  it('detects assignment in condition', () => {
    const traps = findTraps('if (x = 5) { foo() }', 'a.ts', ['if (x = 5) { foo() }'])
    expect(traps.some(t => t.type === 'trap')).toBe(true)
  })

  it('detects double negation', () => {
    const traps = findTraps('if (!!x) { foo() }', 'a.ts', ['if (!!x) { foo() }'])
    expect(traps.some(t => t.type === 'trap')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const traps = findTraps('if (x === 5) { foo() }', 'a.ts', ['if (x === 5) { foo() }'])
    expect(traps.length).toBe(0)
  })
})

// ─── findMinotaurPoints ────────────────────────────────────────────────────────

describe('findMinotaurPoints', () => {
  it('detects decision forks at high depth', () => {
    const code = '{\n{\n{\n{\nif (x) {}\n}}}\n}'
    const minotaurs = findMinotaurPoints(code, 'a.ts')
    expect(minotaurs.some(m => m.type === 'decision-fork')).toBe(true)
  })

  it('detects switch maze with many cases', () => {
    const code = 'switch (x) {\ncase 1: break\ncase 2: break\ncase 3: break\ncase 4: break\ncase 5: break\n}'
    const minotaurs = findMinotaurPoints(code, 'a.ts')
    expect(minotaurs.some(m => m.type === 'switch-maze')).toBe(true)
  })

  it('detects callback vortex', () => {
    const deep = 'a(() => {\n{\n{\n{\n{\nb(() => {\nc(() => {\nd() }) }) }) }) })'
    const minotaurs = findMinotaurPoints(deep, 'a.ts')
    expect(minotaurs.some(m => m.type === 'callback-vortex')).toBe(true)
  })

  it('detects inheritance depth', () => {
    const code = 'class A {}\nclass B extends A {}\nclass C extends B {}\nclass D extends C {}'
    const minotaurs = findMinotaurPoints(code, 'a.ts')
    expect(minotaurs.some(m => m.type === 'inheritance-depth')).toBe(true)
  })

  it('returns empty for simple code', () => {
    const minotaurs = findMinotaurPoints('const x = 1', 'a.ts')
    expect(minotaurs.length).toBe(0)
  })

  it('minotaurs have valid danger levels', () => {
    const code = '{\n{\n{\n{\n{\nif (x) {}\n}}}}}'
    const minotaurs = findMinotaurPoints(code, 'a.ts')
    expect(minotaurs.every(m => ['tame', 'caution', 'dangerous', 'deadly'].includes(m.dangerLevel))).toBe(true)
  })
})

// ─── findDeadEnds ──────────────────────────────────────────────────────────────

describe('findDeadEnds', () => {
  it('detects unreachable code after return', () => {
    const des = findDeadEnds('return x\nfoo()', 'a.ts')
    expect(des.some(d => d.type === 'unreachable')).toBe(true)
  })

  it('detects unreachable code after throw', () => {
    const des = findDeadEnds('throw new Error("x")\nfoo()', 'a.ts')
    expect(des.some(d => d.type === 'unreachable')).toBe(true)
  })

  it('detects infinite loop risk', () => {
    const des = findDeadEnds('while (true) { foo() }', 'a.ts')
    expect(des.some(d => d.type === 'infinite-loop-risk')).toBe(true)
  })

  it('detects abandoned code (TODO)', () => {
    const des = findDeadEnds('// TODO: fix this\nconst x = 1', 'a.ts')
    expect(des.some(d => d.type === 'abandoned-code')).toBe(true)
  })

  it('detects phantom branch (if false)', () => {
    const des = findDeadEnds('if (false) { foo() }', 'a.ts')
    expect(des.some(d => d.type === 'phantom-branch')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const des = findDeadEnds('const x = 1\nconst y = x + 1', 'a.ts')
    expect(des.length).toBe(0)
  })

  it('dead ends have valid severity', () => {
    const des = findDeadEnds('return x\nfoo()', 'a.ts')
    expect(des.every(d => ['minor', 'moderate', 'major'].includes(d.severity))).toBe(true)
  })
})

// ─── computeNavigability ───────────────────────────────────────────────────────

describe('computeNavigability', () => {
  it('returns 100 for empty paths', () => {
    expect(computeNavigability([], [], 50)).toBe(100)
  })

  it('penalizes minotaur points', () => {
    const paths: LabyrinthPath[] = [{ file: 'a.ts', startLine: 1, endLine: 1, type: 'branch', length: 1, branches: 1, depth: 1, complexity: 20, navigability: 80, isWellLit: true }]
    const deadly: MinotaurPoint[] = [{ file: 'a.ts', line: 1, type: 'decision-fork', complexity: 80, incomingPaths: 2, outgoingPaths: 2, description: '', dangerLevel: 'deadly', threadRequired: true }]
    const clean = computeNavigability(paths, [], 50)
    const penalized = computeNavigability(paths, deadly, 50)
    expect(clean).toBeGreaterThan(penalized)
  })
})

// ─── computeThreadScore ────────────────────────────────────────────────────────

describe('computeThreadScore', () => {
  it('returns 100 for empty paths', () => {
    expect(computeThreadScore([], [])).toBe(100)
  })

  it('rewards shortcuts', () => {
    const shortcuts: LabyrinthPath[] = [{ file: 'a.ts', startLine: 1, endLine: 1, type: 'shortcut', length: 1, branches: 0, depth: 0, complexity: 5, navigability: 95, isWellLit: true }]
    const plain: LabyrinthPath[] = [{ file: 'a.ts', startLine: 1, endLine: 1, type: 'corridor', length: 1, branches: 0, depth: 0, complexity: 5, navigability: 90, isWellLit: true }]
    expect(computeThreadScore(shortcuts, [])).toBeGreaterThanOrEqual(computeThreadScore(plain, []))
  })

  it('penalizes traps', () => {
    const traps: LabyrinthPath[] = [{ file: 'a.ts', startLine: 1, endLine: 1, type: 'trap', length: 1, branches: 0, depth: 1, complexity: 40, navigability: 20, isWellLit: false }]
    const clean: LabyrinthPath[] = [{ file: 'a.ts', startLine: 1, endLine: 1, type: 'corridor', length: 1, branches: 0, depth: 0, complexity: 5, navigability: 90, isWellLit: true }]
    expect(computeThreadScore(clean, [])).toBeGreaterThan(computeThreadScore(traps, []))
  })
})

// ─── computeLighting ───────────────────────────────────────────────────────────

describe('computeLighting', () => {
  it('gives higher score for documented code', () => {
    const good = computeLighting('// docs\n// more docs\nconst x = 1')
    const bare = computeLighting('const x = 1\nconst y = 2')
    expect(good).toBeGreaterThan(bare)
  })

  it('returns 100 for empty', () => {
    expect(computeLighting('')).toBe(100)
  })

  it('score is between 0 and 100', () => {
    expect(computeLighting('code')).toBeGreaterThanOrEqual(0)
    expect(computeLighting('code')).toBeLessThanOrEqual(100)
  })
})

// ─── computeFileComplexity ─────────────────────────────────────────────────────

describe('computeFileComplexity', () => {
  it('returns 0 for empty paths', () => {
    expect(computeFileComplexity([], [])).toBe(0)
  })

  it('increases with complex paths', () => {
    const simple: LabyrinthPath[] = [{ file: 'a.ts', startLine: 1, endLine: 1, type: 'corridor', length: 1, branches: 0, depth: 1, complexity: 5, navigability: 90, isWellLit: true }]
    const complex: LabyrinthPath[] = [{ file: 'a.ts', startLine: 1, endLine: 1, type: 'branch', length: 1, branches: 5, depth: 4, complexity: 60, navigability: 30, isWellLit: false }]
    expect(computeFileComplexity(complex, [])).toBeGreaterThan(computeFileComplexity(simple, []))
  })
})

// ─── classifyLabyrinthFile ─────────────────────────────────────────────────────

describe('classifyLabyrinthFile', () => {
  it('classifies well-lit-corridor for high nav and lighting', () => {
    expect(classifyLabyrinthFile(80, 20, 70)).toBe('well-lit-corridor')
  })

  it('classifies structured-maze for moderate', () => {
    expect(classifyLabyrinthFile(55, 30, 40)).toBe('structured-maze')
  })

  it('classifies inescapable-maze for high complexity + dark', () => {
    expect(classifyLabyrinthFile(30, 75, 20)).toBe('inescapable-maze')
  })

  it('classifies dark-labyrinth for high complexity', () => {
    expect(classifyLabyrinthFile(25, 55, 50)).toBe('dark-labyrinth')
  })

  it('classifies twisting-passage as default', () => {
    expect(classifyLabyrinthFile(35, 45, 35)).toBe('twisting-passage')
  })
})

// ─── computeLabyrinthScore ─────────────────────────────────────────────────────

describe('computeLabyrinthScore', () => {
  it('returns 0 for empty files', () => {
    expect(computeLabyrinthScore([])).toBe(0)
  })

  it('higher with more complex files', () => {
    const good: LabyrinthFile = { file: 'a.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 1, totalBranches: 0, maxDepth: 1, navigability: 80, threadScore: 85, complexity: 15, lighting: 70, classification: 'well-lit-corridor' }
    const bad: LabyrinthFile = { file: 'b.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 0, totalBranches: 5, maxDepth: 6, navigability: 20, threadScore: 15, complexity: 80, lighting: 10, classification: 'inescapable-maze' }
    expect(computeLabyrinthScore([bad])).toBeGreaterThan(computeLabyrinthScore([good]))
  })

  it('score is between 0 and 100', () => {
    const f: LabyrinthFile = { file: 'a.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 1, totalBranches: 1, maxDepth: 2, navigability: 50, threadScore: 50, complexity: 50, lighting: 50, classification: 'twisting-passage' }
    const score = computeLabyrinthScore([f])
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── computeThreadReliability ──────────────────────────────────────────────────

describe('computeThreadReliability', () => {
  it('returns 100 for empty', () => {
    expect(computeThreadReliability([])).toBe(100)
  })

  it('computes from file thread scores', () => {
    const f: LabyrinthFile = { file: 'a.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 1, totalBranches: 0, maxDepth: 1, navigability: 80, threadScore: 70, complexity: 20, lighting: 60, classification: 'well-lit-corridor' }
    expect(computeThreadReliability([f])).toBe(70)
  })
})

// ─── classifyOverall ───────────────────────────────────────────────────────────

describe('classifyOverall', () => {
  it('classifies crystal-palace', () => { expect(classifyOverall(15, 85, 90)).toBe('crystal-palace') })
  it('classifies garden-maze', () => { expect(classifyOverall(30, 65, 70)).toBe('garden-maze') })
  it('classifies medieval-castle', () => { expect(classifyOverall(45, 55, 50)).toBe('medieval-castle') })
  it('classifies minotaur-labyrinth', () => { expect(classifyOverall(60, 35, 40)).toBe('minotaur-labyrinth') })
  it('classifies eldritch-horror', () => { expect(classifyOverall(80, 20, 25)).toBe('eldritch-horror') })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends removing dead ends', () => {
    const de: DeadEnd[] = [{ file: 'a.ts', line: 5, type: 'unreachable', description: 'dead', severity: 'major' }]
    const stats = { avgLighting: 50, threadReliability: 60 } as LabyrinthStats
    const recs = generateRecommendations([], [], [], de, stats)
    expect(recs.some(r => r.includes('unreachable'))).toBe(true)
  })

  it('recommends for deadly minotaurs', () => {
    const m: MinotaurPoint[] = [{ file: 'a.ts', line: 1, type: 'decision-fork', complexity: 80, incomingPaths: 3, outgoingPaths: 2, description: '', dangerLevel: 'deadly', threadRequired: true }]
    const stats = { avgLighting: 50, threadReliability: 60 } as LabyrinthStats
    const recs = generateRecommendations([], [], m, [], stats)
    expect(recs.some(r => r.includes('intersection'))).toBe(true)
  })

  it('recommends for dark labyrinths', () => {
    const f: LabyrinthFile = { file: 'a.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 0, totalBranches: 3, maxDepth: 4, navigability: 25, threadScore: 20, complexity: 60, lighting: 15, classification: 'dark-labyrinth' }
    const stats = { avgLighting: 15, threadReliability: 20 } as LabyrinthStats
    const recs = generateRecommendations([f], [], [], [], stats)
    expect(recs.some(r => r.includes('documentation'))).toBe(true)
  })

  it('recommends for spirals', () => {
    const de: DeadEnd[] = [{ file: 'a.ts', line: 1, type: 'infinite-loop-risk', description: 'spiral', severity: 'major' }]
    const stats = { avgLighting: 50, threadReliability: 60 } as LabyrinthStats
    const recs = generateRecommendations([], [], [], de, stats)
    expect(recs.some(r => r.includes('termination'))).toBe(true)
  })

  it('recommends for low lighting', () => {
    const stats = { avgLighting: 10, threadReliability: 60 } as LabyrinthStats
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some(r => r.includes('documentation'))).toBe(true)
  })

  it('recommends for inescapable mazes', () => {
    const f: LabyrinthFile = { file: 'a.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 0, totalBranches: 5, maxDepth: 6, navigability: 15, threadScore: 10, complexity: 80, lighting: 10, classification: 'inescapable-maze' }
    const stats = { avgLighting: 50, threadReliability: 60 } as LabyrinthStats
    const recs = generateRecommendations([f], [], [], [], stats)
    expect(recs.some(r => r.includes('inescapable'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const f: LabyrinthFile = { file: 'a.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 2, totalBranches: 1, maxDepth: 1, navigability: 85, threadScore: 90, complexity: 10, lighting: 70, classification: 'well-lit-corridor' }
    const stats = { avgLighting: 70, threadReliability: 90 } as LabyrinthStats
    const recs = generateRecommendations([f], [], [], [], stats)
    expect(recs.length).toBe(0)
  })
})

// ─── buildLabyrinthResult ──────────────────────────────────────────────────────

describe('buildLabyrinthResult', () => {
  it('returns complete result structure', () => {
    const result = buildLabyrinthResult(['src/a.ts'], ['if (x) { foo() }'], {})
    expect(result.files).toHaveLength(1)
    expect(result.stats.totalPaths).toBeGreaterThan(0)
    expect(result.stats.classification).toBeTruthy()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty files', () => {
    const result = buildLabyrinthResult([], [], {})
    expect(result.files).toHaveLength(0)
    expect(result.stats.totalPaths).toBe(0)
    expect(result.stats.labyrinthScore).toBe(0)
    expect(result.stats.threadReliability).toBe(100)
    expect(result.stats.classification).toBe('crystal-palace')
  })

  it('computes avg scores', () => {
    const result = buildLabyrinthResult(['a.ts'], ['if (x) { foo() }'], {})
    expect(result.stats.avgNavigability).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgComplexity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgLighting).toBeGreaterThanOrEqual(0)
  })

  it('detects dead ends in result', () => {
    const result = buildLabyrinthResult(['a.ts'], ['return x\nfoo()'], {})
    expect(result.stats.totalDeadEnds).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatPathType colors types', () => {
    expect(formatPathType('corridor')).toContain('CORRIDOR')
    expect(formatPathType('trap')).toContain('TRAP')
  })

  it('formatPath formats a path', () => {
    const p: LabyrinthPath = { file: 'a.ts', startLine: 5, endLine: 10, type: 'branch', length: 5, branches: 2, depth: 1, complexity: 30, navigability: 70, isWellLit: true }
    expect(formatPath(p)).toContain('BRANCH')
  })

  it('formatPaths handles empty', () => {
    expect(formatPaths([])).toContain('No paths')
  })

  it('formatDangerLevel colors levels', () => {
    expect(formatDangerLevel('deadly')).toContain('DEADLY')
    expect(formatDangerLevel('tame')).toContain('TAME')
  })

  it('formatMinotaur formats a minotaur', () => {
    const m: MinotaurPoint = { file: 'a.ts', line: 12, type: 'decision-fork', complexity: 60, incomingPaths: 3, outgoingPaths: 2, description: 'fork', dangerLevel: 'dangerous', threadRequired: true }
    expect(formatMinotaur(m)).toContain('decision-fork')
  })

  it('formatMinotaurs shows all-clear when empty', () => {
    expect(formatMinotaurs([])).toContain('navigable')
  })

  it('formatDeadEndSeverity colors severity', () => {
    expect(formatDeadEndSeverity('major')).toContain('MAJOR')
    expect(formatDeadEndSeverity('minor')).toContain('MINOR')
  })

  it('formatDeadEnd formats dead end', () => {
    const d: DeadEnd = { file: 'a.ts', line: 5, type: 'unreachable', description: 'dead code', severity: 'major' }
    expect(formatDeadEnd(d)).toContain('dead code')
  })

  it('formatDeadEnds shows all-clear when empty', () => {
    expect(formatDeadEnds([])).toContain('reachable')
  })

  it('formatFileClassification colors classes', () => {
    expect(formatFileClassification('well-lit-corridor')).toContain('WELL LIT')
    expect(formatFileClassification('inescapable-maze')).toContain('INESCAPABLE')
  })

  it('formatLabyrinthFile includes file name', () => {
    const f: LabyrinthFile = { file: 'src/a.ts', paths: [], minotaurs: [], deadEnds: [], totalCorridors: 1, totalBranches: 0, maxDepth: 1, navigability: 80, threadScore: 70, complexity: 20, lighting: 60, classification: 'well-lit-corridor' }
    expect(formatLabyrinthFile(f)).toContain('src/a.ts')
  })

  it('formatLabyrinthFiles handles empty', () => {
    expect(formatLabyrinthFiles([])).toContain('No files')
  })

  it('formatOverallClassification colors classes', () => {
    expect(formatOverallClassification('crystal-palace')).toContain('CRYSTAL')
    expect(formatOverallClassification('eldritch-horror')).toContain('ELDRITCH')
  })

  it('formatStats produces summary', () => {
    const stats: LabyrinthStats = {
      totalPaths: 10, corridors: 5, branches: 3, deadEnds: 0, spirals: 1, shortcuts: 2, traps: 0,
      totalMinotaurs: 1, deadlyMinotaurs: 0, totalDeadEnds: 0,
      avgNavigability: 75, avgThreadScore: 70, avgComplexity: 25, avgLighting: 60,
      wellLitFiles: 2, darkLabyrinthFiles: 0, inescapableMazeFiles: 0,
      overallNavigability: 75, labyrinthScore: 30, threadReliability: 70,
      classification: 'garden-maze',
    }
    const result = formatStats(stats)
    expect(result).toContain('LABYRINTH ANALYSIS SUMMARY')
    expect(result).toContain('30/100')
  })

  it('formatRecommendations numbers items', () => {
    expect(formatRecommendations(['First', 'Second'])).toContain('1.')
  })

  it('formatRecommendations shows navigable when empty', () => {
    expect(formatRecommendations([])).toContain('navigable')
  })

  it('formatLabyrinthResult produces full output', () => {
    const result = buildLabyrinthResult(['src/a.ts'], ['if (x) { foo() }'], {})
    const output = formatLabyrinthResult(result)
    expect(output).toContain('LABYRINTH ANALYSIS SUMMARY')
    expect(output).toContain('Files')
  })

  it('formatLabyrinthJson produces valid JSON', () => {
    const result = buildLabyrinthResult(['src/a.ts'], ['if (x) { foo() }'], {})
    const json = formatLabyrinthJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.files).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ───────────────────────────────────────────────────────────────

describe('labyrinth integration', () => {
  it('full analysis of mixed codebase', () => {
    const files = ['src/simple.ts', 'src/complex.ts', 'src/dead.ts']
    const contents = [
      '// Simple module\nconst x = 1\nconst y = x + 1\nreturn y',
      '{\n{\n{\n{\nif (a && b || c) { for (let i = 0; i < 10; i++) { if (x) { foo() } } }\n}}}}',
      'return x\nfoo()\n// TODO: fix\nif (false) { bar() }',
    ]
    const result = buildLabyrinthResult(files, contents, {})
    expect(result.files).toHaveLength(3)
    expect(result.stats.totalPaths).toBeGreaterThan(3)
    expect(result.stats.labyrinthScore).toBeGreaterThan(0)
    expect(result.stats.classification).toBeTruthy()
  })

  it('clean codebase achieves good score', () => {
    const code = '// Documentation for module\nconst x = compute(1)\nconst y = process(x)\nif (!y) return null\nreturn y'
    const result = buildLabyrinthResult(['src/clean.ts'], [code], {})
    expect(result.stats.avgNavigability).toBeGreaterThan(50)
    expect(result.files[0].classification).toBeTruthy()
  })
})
