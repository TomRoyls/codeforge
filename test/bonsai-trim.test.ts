import { describe, it, expect } from 'vitest'
import {
  classifyStyle,
  classifyMaturity,
  classifyHealth,
  classifyCondition,
  classifyGardenerGrade,
  assessAttentionLevel,
  identifyPruningTargets,
  analyzeBonsaiBranch,
  analyzeBonsaiTree,
  generateRecommendations,
  buildBonsaiTrimResult,
  type BonsaiBranch,
  type BonsaiGarden,
  type BonsaiTrimStats,
} from '../src/commands/bonsai-trim-helpers.js'
import { formatBonsaiTrimTable, formatBonsaiTrimJson } from '../src/commands/bonsai-trim-format-helpers.js'

// ─── classifyStyle ──────────────────────────────────────────────────────────

describe('classifyStyle', () => {
  it('returns forest for 8+ exports', () => {
    expect(classifyStyle(8, 0)).toBe('forest')
  })

  it('returns formal-upright for 5+ exports and 2+ classes', () => {
    expect(classifyStyle(5, 2)).toBe('formal-upright')
  })

  it('returns cascade for 3+ classes', () => {
    expect(classifyStyle(0, 3)).toBe('cascade')
  })

  it('returns informal-upright for 5+ exports', () => {
    expect(classifyStyle(5, 0)).toBe('informal-upright')
  })

  it('returns slanting for 2+ classes and 2+ exports', () => {
    expect(classifyStyle(2, 2)).toBe('slanting')
  })

  it('returns semi-cascade for 1+ class and 3+ exports', () => {
    expect(classifyStyle(3, 1)).toBe('semi-cascade')
  })

  it('returns literati for 1+ class', () => {
    expect(classifyStyle(0, 1)).toBe('literati')
  })

  it('returns broom for 2+ exports', () => {
    expect(classifyStyle(2, 0)).toBe('broom')
  })

  it('returns broom as default', () => {
    expect(classifyStyle(0, 0)).toBe('broom')
  })
})

// ─── classifyMaturity ───────────────────────────────────────────────────────

describe('classifyMaturity', () => {
  it('returns overgrown for 300+ lines and 10+ functions', () => {
    expect(classifyMaturity(300, 10)).toBe('overgrown')
  })

  it('returns ancient for 200+ lines and 6+ functions', () => {
    expect(classifyMaturity(200, 6)).toBe('ancient')
  })

  it('returns mature for 100+ lines and 3+ functions', () => {
    expect(classifyMaturity(100, 3)).toBe('mature')
  })

  it('returns young for 50+ lines and 2+ functions', () => {
    expect(classifyMaturity(50, 2)).toBe('young')
  })

  it('returns sapling for 20+ lines and 1+ functions', () => {
    expect(classifyMaturity(20, 1)).toBe('sapling')
  })

  it('returns seedling as default', () => {
    expect(classifyMaturity(0, 0)).toBe('seedling')
    expect(classifyMaturity(10, 0)).toBe('seedling')
  })
})

// ─── classifyHealth ─────────────────────────────────────────────────────────

describe('classifyHealth', () => {
  it('returns thriving for 85+', () => { expect(classifyHealth(85)).toBe('thriving') })
  it('returns healthy for 70-84', () => { expect(classifyHealth(70)).toBe('healthy') })
  it('returns fair for 50-69', () => { expect(classifyHealth(50)).toBe('fair') })
  it('returns stressed for 30-49', () => { expect(classifyHealth(30)).toBe('stressed') })
  it('returns diseased for 15-29', () => { expect(classifyHealth(15)).toBe('diseased') })
  it('returns dead below 15', () => { expect(classifyHealth(14)).toBe('dead') })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns masterpiece for 85+ quality with no prune targets', () => {
    expect(classifyCondition(85, 0)).toBe('masterpiece')
    expect(classifyCondition(90, 0)).toBe('masterpiece')
  })

  it('returns well-tended for 70+ quality', () => {
    expect(classifyCondition(70, 1)).toBe('well-tended')
    expect(classifyCondition(80, 2)).toBe('well-tended')
  })

  it('returns needs-trimming for 50+ with few targets', () => {
    expect(classifyCondition(50, 3)).toBe('needs-trimming')
    expect(classifyCondition(60, 1)).toBe('needs-trimming')
    expect(classifyCondition(70, 1)).toBe('well-tended')
  })

  it('returns wild for 5+ prune targets', () => {
    expect(classifyCondition(40, 5)).toBe('wild')
    expect(classifyCondition(60, 5)).toBe('wild')
  })

  it('returns deadwood for quality < 30', () => {
    expect(classifyCondition(25, 4)).toBe('deadwood')
    expect(classifyCondition(10, 2)).toBe('deadwood')
  })

  it('returns overgrown as fallback', () => {
    expect(classifyCondition(40, 4)).toBe('overgrown')
  })
})

// ─── classifyGardenerGrade ──────────────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('returns master-gardener for 80+', () => { expect(classifyGardenerGrade(80)).toBe('master-gardener') })
  it('returns skilled for 60-79', () => { expect(classifyGardenerGrade(60)).toBe('skilled') })
  it('returns apprentice for 40-59', () => { expect(classifyGardenerGrade(40)).toBe('apprentice') })
  it('returns neglectful for 20-39', () => { expect(classifyGardenerGrade(20)).toBe('neglectful') })
  it('returns absent below 20', () => { expect(classifyGardenerGrade(19)).toBe('absent') })
})

// ─── assessAttentionLevel ───────────────────────────────────────────────────

describe('assessAttentionLevel', () => {
  it('returns none for 0 targets and 70+ health', () => {
    expect(assessAttentionLevel(0, 70)).toBe('none')
    expect(assessAttentionLevel(0, 90)).toBe('none')
  })

  it('returns light-trimming for <=2 targets and 60+ health', () => {
    expect(assessAttentionLevel(2, 60)).toBe('light-trimming')
    expect(assessAttentionLevel(1, 70)).toBe('light-trimming')
  })

  it('returns moderate-pruning for <=5 targets and 40+ health', () => {
    expect(assessAttentionLevel(3, 50)).toBe('moderate-pruning')
    expect(assessAttentionLevel(5, 40)).toBe('moderate-pruning')
  })

  it('returns heavy-pruning for 20+ health', () => {
    expect(assessAttentionLevel(6, 20)).toBe('heavy-pruning')
    expect(assessAttentionLevel(10, 30)).toBe('heavy-pruning')
  })

  it('returns restoration for < 20 health', () => {
    expect(assessAttentionLevel(6, 15)).toBe('restoration')
    expect(assessAttentionLevel(0, 10)).toBe('restoration')
  })
})

// ─── identifyPruningTargets ─────────────────────────────────────────────────

describe('identifyPruningTargets', () => {
  it('returns empty for clean code', () => {
    const targets = identifyPruningTargets('export function hello(name: string): string { return name }')
    expect(targets).toEqual([])
  })

  it('detects console statements as suckers', () => {
    const targets = identifyPruningTargets('console.log("debug")')
    expect(targets.some(t => t.type === 'sucker')).toBe(true)
  })

  it('detects any type as water-sprout', () => {
    const targets = identifyPruningTargets('const x: any = 1')
    expect(targets.some(t => t.type === 'water-sprout')).toBe(true)
  })

  it('detects TODO as deadwood', () => {
    const targets = identifyPruningTargets('// TODO fix this')
    expect(targets.some(t => t.type === 'deadwood')).toBe(true)
  })

  it('detects eval as dead-branch', () => {
    const targets = identifyPruningTargets('eval("code")')
    expect(targets.some(t => t.type === 'dead-branch')).toBe(true)
  })

  it('detects long lines as crown-lift', () => {
    const longLine = 'a'.repeat(200)
    const targets = identifyPruningTargets(longLine)
    expect(targets.some(t => t.type === 'crown-lift')).toBe(true)
  })

  it('detects deep nesting as crossing-branch', () => {
    const nested = 'function f() { if (a) { if (b) { if (c) { return {{{' + '{ } } } } } }'
    const targets = identifyPruningTargets(nested)
    expect(targets.some(t => t.type === 'crossing-branch')).toBe(true)
  })

  it('assigns correct impact levels', () => {
    const targets = identifyPruningTargets('eval("x")')
    const deadBranch = targets.find(t => t.type === 'dead-branch')
    expect(deadBranch?.impact).toBe('critical')
  })

  it('assigns correct effort levels', () => {
    const targets = identifyPruningTargets('console.log("x")')
    const sucker = targets.find(t => t.type === 'sucker')
    expect(sucker?.effort).toBe('easy')
  })
})

// ─── analyzeBonsaiBranch ────────────────────────────────────────────────────

describe('analyzeBonsaiBranch', () => {
  it('analyzes empty content', () => {
    const branch = analyzeBonsaiBranch('', 'empty.ts')
    expect(branch.file).toBe('empty.ts')
    expect(branch.canPrune).toBe(false)
    expect(branch.density).toBe(0)
    expect(branch.qualityScore).toBeGreaterThanOrEqual(0)
    expect(branch.foliage.totalLeaves).toBe(0)
    expect(branch.style).toBe('broom')
    expect(branch.maturity).toBe('seedling')
    expect(branch.pruningTargets).toEqual([])
  })

  it('analyzes well-crafted code', () => {
    const code = [
      '/** Module docs */',
      'export interface Config { name: string }',
      'export type Result = string | number',
      '/** Creates */',
      'export function create(cfg: Config): Result { return cfg.name }',
      'describe("test", () => { it("works", () => { expect(1).toBe(1) }) })',
    ].join('\n')
    const branch = analyzeBonsaiBranch(code, 'good.ts')
    expect(branch.file).toBe('good.ts')
    expect(branch.structure.trunkStrength).toBeGreaterThan(40)
    expect(branch.aesthetic.elegance).toBeGreaterThan(30)
    expect(branch.foliage.greenLeaves).toBeGreaterThan(0)
  })

  it('detects defects in poor code', () => {
    const code = [
      'console.log("debug")',
      'const x: any = 1',
      '// TODO fix',
      'eval("code")',
    ].join('\n')
    const branch = analyzeBonsaiBranch(code, 'bad.ts')
    expect(branch.canPrune).toBe(true)
    expect(branch.pruningOpportunities).toBeGreaterThan(0)
    expect(branch.foliage.deadLeaves).toBeGreaterThan(0)
  })

  it('computes foliage metrics', () => {
    const branch = analyzeBonsaiBranch('export function a() {}\nexport function b() {}', 'ab.ts')
    expect(branch.foliage.totalLeaves).toBeGreaterThan(0)
    expect(branch.foliage.greenLeaves).toBeGreaterThanOrEqual(0)
  })

  it('computes structure metrics', () => {
    const branch = analyzeBonsaiBranch('export function a() {}', 'a.ts')
    expect(branch.structure.trunkStrength).toBeGreaterThanOrEqual(0)
    expect(branch.structure.branchAngle).toBeGreaterThanOrEqual(0)
    expect(branch.structure.canopyBalance).toBeGreaterThanOrEqual(0)
    expect(branch.structure.rootDepth).toBeGreaterThanOrEqual(0)
    expect(branch.structure.graftingPoints).toBeGreaterThanOrEqual(0)
  })

  it('computes aesthetic metrics', () => {
    const branch = analyzeBonsaiBranch('export function a() {}', 'a.ts')
    expect(branch.aesthetic.simplicity).toBeGreaterThanOrEqual(0)
    expect(branch.aesthetic.elegance).toBeGreaterThanOrEqual(0)
    expect(branch.aesthetic.proportion).toBeGreaterThanOrEqual(0)
    expect(branch.aesthetic.harmony).toBeGreaterThanOrEqual(0)
  })

  it('clamps all metrics to valid ranges', () => {
    const branch = analyzeBonsaiBranch('export function a() {}', 'a.ts')
    for (const val of [branch.density, branch.branchHealth, branch.branchWeight, branch.qualityScore]) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    }
  })

  it('classifies style based on exports and classes', () => {
    const code = Array.from({ length: 6 }, (_, i) => `export function f${i}() {}`).join('\n')
    const branch = analyzeBonsaiBranch(code, 'many.ts')
    expect(branch.style).toBe('informal-upright')
  })
})

// ─── analyzeBonsaiTree ──────────────────────────────────────────────────────

describe('analyzeBonsaiTree', () => {
  it('returns empty tree for no branches', () => {
    const tree = analyzeBonsaiTree([], 'src')
    expect(tree.directory).toBe('src')
    expect(tree.branches).toEqual([])
    expect(tree.avgHealth).toBe(0)
    expect(tree.condition).toBe('clear-cut')
    expect(tree.attentionLevel).toBe('restoration')
  })

  it('aggregates branch averages', () => {
    const branches: BonsaiBranch[] = [
      analyzeBonsaiBranch('export function a() {}', 'a.ts'),
      analyzeBonsaiBranch('/** D */ export class B {}', 'b.ts'),
    ]
    const tree = analyzeBonsaiTree(branches, 'src')
    expect(tree.branches.length).toBe(2)
    expect(tree.avgHealth).toBeGreaterThan(0)
    expect(tree.avgDensity).toBeGreaterThanOrEqual(0)
    expect(tree.avgAesthetic).toBeGreaterThanOrEqual(0)
  })

  it('computes tree condition', () => {
    const branches: BonsaiBranch[] = [
      analyzeBonsaiBranch('export function a() {}', 'a.ts'),
    ]
    const tree = analyzeBonsaiTree(branches, 'src')
    expect(['masterpiece', 'well-tended', 'needs-work', 'overgrown', 'wild-growth', 'clear-cut']).toContain(tree.condition)
  })

  it('computes balance and attention', () => {
    const branches: BonsaiBranch[] = [
      analyzeBonsaiBranch('export function a() {}', 'a.ts'),
      analyzeBonsaiBranch('export function b() {}', 'b.ts'),
    ]
    const tree = analyzeBonsaiTree(branches, 'src')
    expect(typeof tree.isBalanced).toBe('boolean')
    expect(typeof tree.needsAttention).toBe('boolean')
    expect(['none', 'light-trimming', 'moderate-pruning', 'heavy-pruning', 'restoration']).toContain(tree.attentionLevel)
  })

  it('counts masterpiece/overgrown/deadwood', () => {
    const branches: BonsaiBranch[] = [
      analyzeBonsaiBranch('', 'empty.ts'),
      analyzeBonsaiBranch('/** D */ export function f() {}', 'good.ts'),
    ]
    const tree = analyzeBonsaiTree(branches, 'src')
    expect(tree.masterpieceCount).toBeGreaterThanOrEqual(0)
    expect(tree.overgrownCount).toBeGreaterThanOrEqual(0)
    expect(tree.deadwoodCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseGarden: BonsaiGarden = {
    totalPruningTargets: 0,
    criticalTargets: 0,
    totalDeadLeaves: 0,
    totalYellowLeaves: 0,
    totalOvergrownAreas: 0,
    masterpieceCount: 0,
    overgrownCount: 0,
    overallAesthetic: 50,
    gardenHealth: 50,
  }

  const baseStats: BonsaiTrimStats = {
    totalFiles: 1,
    totalTrees: 1,
    avgDensity: 50,
    avgHealth: 50,
    avgAesthetic: 50,
    avgSimplicity: 50,
    avgElegance: 50,
    avgProportion: 50,
    avgHarmony: 50,
    avgTrunkStrength: 50,
    avgCanopyBalance: 50,
    totalPruningTargets: 0,
    deadBranchTargets: 0,
    suckerTargets: 0,
    thinningTargets: 0,
    deadwoodTargets: 0,
    totalDeadLeaves: 0,
    totalGreenLeaves: 0,
    masterpieces: 0,
    overgrown: 0,
    deadwood: 0,
    easyPrunes: 0,
    difficultPrunes: 0,
    overallAesthetic: 50,
    gardenerGrade: 'apprentice',
    bestBranch: 'none',
    worstBranch: 'none',
    mostPruningNeeded: 'none',
    mostElegant: 'none',
  }

  it('praises well-tended garden', () => {
    const recs = generateRecommendations([], [], { ...baseGarden, overallAesthetic: 75 }, baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('well-tended')]))
  })

  it('recommends removing critical targets', () => {
    const recs = generateRecommendations([], [], { ...baseGarden, criticalTargets: 3 }, baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Critical')]))
  })

  it('recommends removing dead branches', () => {
    const branch: BonsaiBranch = {
      ...analyzeBonsaiBranch('eval("x")', 'bad.ts'),
    }
    const recs = generateRecommendations([branch], [], baseGarden, baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Dead branches')]))
  })

  it('recommends thinning overgrown foliage', () => {
    const branch: BonsaiBranch = {
      ...analyzeBonsaiBranch('', 'a.ts'),
      foliage: { totalLeaves: 10, deadLeaves: 0, yellowLeaves: 0, greenLeaves: 5, brownLeaves: 0, overgrownAreas: 5 },
    }
    const recs = generateRecommendations([branch], [], baseGarden, baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Overgrown')]))
  })

  it('recommends improving simplicity', () => {
    const recs = generateRecommendations([], [], baseGarden, { ...baseStats, avgSimplicity: 30 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('simplicity')]))
  })
})

// ─── buildBonsaiTrimResult ──────────────────────────────────────────────────

describe('buildBonsaiTrimResult', () => {
  it('handles empty input', () => {
    const result = buildBonsaiTrimResult([], [], {})
    expect(result.branches).toEqual([])
    expect(result.trees).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', () => {
    const result = buildBonsaiTrimResult(
      ['hello.ts'],
      ['export function hello() { return "world" }'],
      {},
    )
    expect(result.branches).toHaveLength(1)
    expect(result.branches[0].file).toBe('hello.ts')
    expect(result.branches[0].qualityScore).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildBonsaiTrimResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['export function a() {}', '/** Docs */ export class B {}', 'const x: any = 1'],
      {},
    )
    expect(result.branches).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups into trees by directory', () => {
    const result = buildBonsaiTrimResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.trees.length).toBe(2)
    const dirs = result.trees.map(t => t.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('computes best/worst/mostPruningNeeded/mostElegant', () => {
    const result = buildBonsaiTrimResult(
      ['good.ts', 'bad.ts'],
      [
        '/** Docs */ export function good() {} interface I {} type T = string',
        'const x: any = 1',
      ],
      {},
    )
    expect(result.stats.bestBranch).toBe('good.ts')
    expect(result.stats.worstBranch).toBe('bad.ts')
  })

  it('computes gardener grade', () => {
    const result = buildBonsaiTrimResult(['a.ts'], ['export function a() {}'], {})
    expect(['master-gardener', 'skilled', 'apprentice', 'neglectful', 'absent']).toContain(result.stats.gardenerGrade)
  })

  it('clamps overall aesthetic to valid range', () => {
    const result = buildBonsaiTrimResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.overallAesthetic).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallAesthetic).toBeLessThanOrEqual(100)
  })

  it('computes garden metrics', () => {
    const result = buildBonsaiTrimResult(['a.ts'], ['export function a() {}'], {})
    expect(result.garden.overallAesthetic).toBeGreaterThanOrEqual(0)
    expect(result.garden.gardenHealth).toBeGreaterThanOrEqual(0)
  })

  it('counts pruning targets by type', () => {
    const result = buildBonsaiTrimResult(
      ['bad.ts'],
      ['console.log("x")\nconst y: any = 1\n// TODO fix'],
      {},
    )
    expect(result.stats.suckerTargets).toBeGreaterThan(0)
    expect(result.stats.deadwoodTargets).toBeGreaterThan(0)
  })

  it('counts easy and difficult prunes', () => {
    const result = buildBonsaiTrimResult(
      ['bad.ts'],
      ['console.log("x")\neval("code")'],
      {},
    )
    expect(result.stats.easyPrunes).toBeGreaterThan(0)
    expect(result.stats.difficultPrunes).toBeGreaterThan(0)
  })
})

// ─── formatBonsaiTrimTable ──────────────────────────────────────────────────

describe('formatBonsaiTrimTable', () => {
  it('formats empty result', () => {
    const result = buildBonsaiTrimResult([], [], {})
    const output = formatBonsaiTrimTable(result, false)
    expect(output).toContain('Bonsai Trim')
    expect(output).toContain('No branches detected')
  })

  it('includes branch info', () => {
    const result = buildBonsaiTrimResult(['a.ts'], ['export function a() {}'], {})
    const output = formatBonsaiTrimTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildBonsaiTrimResult(['a.ts'], ['export function a() {}'], {})
    const output = formatBonsaiTrimTable(result, true)
    expect(output).toContain('fol:')
    expect(output).toContain('struct:')
    expect(output).toContain('aesthetic:')
  })

  it('truncates at 15 in non-verbose', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildBonsaiTrimResult(files, codes, {})
    const output = formatBonsaiTrimTable(result, false)
    expect(output).toContain('and 5 more')
  })

  it('shows trees', () => {
    const result = buildBonsaiTrimResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    const output = formatBonsaiTrimTable(result, false)
    expect(output).toContain('Trees')
    expect(output).toContain('src')
  })

  it('shows recommendations', () => {
    const result = buildBonsaiTrimResult([], [], {})
    const output = formatBonsaiTrimTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatBonsaiTrimJson ───────────────────────────────────────────────────

describe('formatBonsaiTrimJson', () => {
  it('produces valid JSON', () => {
    const result = buildBonsaiTrimResult(['a.ts'], ['export function a() {}'], {})
    const json = formatBonsaiTrimJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.branches).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildBonsaiTrimResult([], [], {})
    const json = formatBonsaiTrimJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.branches).toEqual([])
    expect(parsed.trees).toEqual([])
  })
})
